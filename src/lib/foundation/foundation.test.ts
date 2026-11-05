import { describe, expect, it } from 'vitest'

import { CURRENT_VERSION, LEGACY_UPDATED_AT, migrations, runMigrations, type Store } from '@/lib/storage'
import type { BrickId, RowId } from '@/data/foundation'

import {
  completeBrick,
  createDefaultFoundation,
  finishPlacement,
  foundationState,
  type FoundationGate,
  isBrickProgress,
  isBrickTaught,
  isFoundationPlacement,
  isGateOpen,
  isInFoundation,
  isRowDone,
  isRowPass,
  isRowResult,
  markRowTested,
  markWelcomeSeen,
  mergeFoundation,
  needsPlacement,
  readFoundation,
  resumeFoundation,
  scheduleStartDate,
  skipFoundation,
} from './index'

/** Ngày `d` tháng 11/2026, giờ máy (TZ=Asia/Ho_Chi_Minh khi chạy `npm test`). */
const day = (d: number, h = 20, m = 0) => new Date(2026, 10, d, h, m)
/** Nửa đêm giờ máy của ngày `d`. */
const midnight = (d: number) => new Date(2026, 10, d)
const iso = (d: number, h = 20, m = 0) => day(d, h, m).toISOString()

const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })

function bricks(store: Store, ids: BrickId[], at: Date): Store {
  return ids.reduce((s, id) => completeBrick(s, id, at), store)
}

function passRows(store: Store, rows: RowId[], at: Date): Store {
  return rows.reduce((s, r) => markRowTested(s, r, 8, 8, at), store)
}

describe('validator', () => {
  it('isBrickProgress / isRowResult / isFoundationPlacement', () => {
    const t = iso(3)
    expect(isBrickProgress({ firstDoneAt: t, lastDoneAt: t, updatedAt: t })).toBe(true)
    expect(isBrickProgress({ firstDoneAt: t, lastDoneAt: 'x', updatedAt: t })).toBe(false)
    expect(isBrickProgress(null)).toBe(false)
    expect(isRowResult({ passed: true, best: 75, updatedAt: t })).toBe(true)
    expect(isRowResult({ passed: 'yes', best: 75, updatedAt: t })).toBe(false)
    expect(isRowResult({ passed: true, best: 101, updatedAt: t })).toBe(false)
    expect(isRowResult({ passed: true, best: Number.NaN, updatedAt: t })).toBe(false)
    expect(['pending', 'done', 'skipped', 'x', null].map(isFoundationPlacement)).toEqual([true, true, true, false, false])
  })
})

describe('Nâng cấp v12', () => {
  it('store v12 đang học T1 → v13, foundation mặc định; đang ở Sân ga và cần Soát vé', () => {
    const data = {
      streak: 5,
      progress: { lessons: { 's1-t1-w1': { done: true, updatedAt: iso(1) } } },
      placement: { attempts: {}, house: 'ravenclaw', startLessonId: null, updatedAt: iso(1) },
    }
    const s = runMigrations({ schemaVersion: 12, data }, CURRENT_VERSION, migrations)
    expect(s.schemaVersion).toBe(13)
    expect(s.data).toEqual({ ...data, foundation: createDefaultFoundation() })
    expect(isInFoundation(s)).toBe(true)
    expect(needsPlacement(s)).toBe(true)
    expect(foundationState(s).status).toBe('in-foundation')
  })
})

describe('Store mới', () => {
  it('data {} → readFoundation trả mặc định; đang ở Sân ga, 0/18; lịch chưa bắt đầu', () => {
    expect(readFoundation(empty())).toEqual({
      bricks: {},
      rows: {},
      placement: 'pending',
      completedAt: null,
      skippedAt: null,
      resumedAt: null,
      pausedDays: 0,
      welcomeSeenAt: null,
      updatedAt: LEGACY_UPDATED_AT,
    })
    expect(foundationState(empty())).toEqual({
      status: 'in-foundation',
      rowsDone: [],
      taughtCount: 0,
      totalBricks: 18,
      doneBrickIds: [],
    })
    expect(isInFoundation(empty())).toBe(true)
    expect(needsPlacement(empty())).toBe(true)
    expect(scheduleStartDate(empty(), day(5))).toBeNull()
  })

  it('mục sai dạng bị bỏ qua khi đọc, không bị xoá khi ghi', () => {
    const t = iso(2)
    const raw = {
      bricks: { F01: 'junk', F02: { firstDoneAt: t, lastDoneAt: t, updatedAt: t }, F99: { firstDoneAt: t, lastDoneAt: t, updatedAt: t } },
      rows: { A: { passed: 'x' }, Z: { passed: true, best: 90, updatedAt: t } },
      placement: 'weird',
      completedAt: 'hôm qua',
      pausedDays: -2,
      extra: 1,
      updatedAt: t,
    }
    const s: Store = { ...empty(), data: { foundation: raw } }
    const f = readFoundation(s)
    expect(Object.keys(f.bricks)).toEqual(['F02'])
    expect(f.rows).toEqual({})
    expect(f.placement).toBe('pending')
    expect(f.completedAt).toBeNull()
    expect(f.pausedDays).toBe(0)

    const next = completeBrick(s, 'F03', day(3))
    const stored = next.data.foundation as typeof raw & { bricks: Record<string, unknown> }
    expect(stored.bricks.F01).toBe('junk')
    expect(stored.bricks.F99).toEqual(raw.bricks.F99)
    expect(stored.rows).toEqual(raw.rows)
    expect(stored.extra).toBe(1)
    expect(raw.bricks).not.toHaveProperty('F03') // không sửa store cũ
  })

  it('foundation sai dạng (mảng) → đọc ra mặc định; ghi đầu tiên dựng object đủ field', () => {
    const s: Store = { ...empty(), data: { foundation: [1] } }
    expect(readFoundation(s)).toEqual(createDefaultFoundation())
    const next = completeBrick(s, 'F01', day(3))
    expect(next.data.foundation).toMatchObject({ placement: 'pending', pausedDays: 0, updatedAt: iso(3) })
  })
})

describe('Xong viên', () => {
  it('lần đầu firstDoneAt = lastDoneAt = now; học lại hôm sau giữ firstDoneAt, lastDoneAt mới', () => {
    const s1 = completeBrick(empty(), 'F02', day(3))
    expect(readFoundation(s1).bricks.F02).toEqual({ firstDoneAt: iso(3), lastDoneAt: iso(3), updatedAt: iso(3) })
    expect(readFoundation(s1).updatedAt).toBe(iso(3))

    const s2 = completeBrick(s1, 'F02', day(4))
    expect(readFoundation(s2).bricks.F02).toEqual({ firstDoneAt: iso(3), lastDoneAt: iso(4), updatedAt: iso(4) })
    expect(foundationState(s2).doneBrickIds).toEqual(['F02'])
    expect(foundationState(s2).taughtCount).toBe(1)
  })

  it('id không có trong danh mục → trả store cũ; cùng thời điểm (hoặc đồng hồ lùi) → store cũ', () => {
    const s = completeBrick(empty(), 'F02', day(3))
    expect(completeBrick(s, 'F19', day(4))).toBe(s)
    expect(completeBrick(s, '__proto__', day(4))).toBe(s)
    expect(completeBrick(s, 'F02', day(3))).toBe(s)
    expect(completeBrick(s, 'F02', day(2))).toBe(s)
  })

  it('updatedAt không lùi khi đồng hồ máy chạy lùi', () => {
    const s = completeBrick(empty(), 'F01', day(5))
    const back = completeBrick(s, 'F03', day(4))
    expect(Date.parse(readFoundation(back).updatedAt)).toBeGreaterThan(Date.parse(iso(5)))
  })
})

describe('Kiểm tra hàng', () => {
  it('6/8 → passed, best 75; lần sau 4/8 vẫn passed, best 75 (store cũ)', () => {
    const s1 = markRowTested(empty(), 'A', 6, 8, day(3))
    expect(readFoundation(s1).rows.A).toEqual({ passed: true, best: 75, updatedAt: iso(3) })
    const s2 = markRowTested(s1, 'A', 4, 8, day(4))
    expect(s2).toBe(s1)
    expect(readFoundation(s2).rows.A).toMatchObject({ passed: true, best: 75 })
  })

  it('5/8 → passed false, best 63; sau đó 6/8 → passed, best 75', () => {
    const s1 = markRowTested(empty(), 'B', 5, 8, day(3))
    expect(readFoundation(s1).rows.B).toEqual({ passed: false, best: 63, updatedAt: iso(3) })
    expect(isRowDone(s1, 'B')).toBe(false)
    const s2 = markRowTested(s1, 'B', 6, 8, day(4))
    expect(readFoundation(s2).rows.B).toEqual({ passed: true, best: 75, updatedAt: iso(4) })
  })

  it('isRowPass: ngưỡng 70% so bằng số nguyên ở mọi số câu', () => {
    expect([isRowPass(5, 8), isRowPass(6, 8)]).toEqual([false, true])
    expect([isRowPass(6, 10), isRowPass(7, 10)]).toEqual([false, true])
    expect([isRowPass(4, 7), isRowPass(5, 7)]).toEqual([false, true])
    expect([isRowPass(2, 3), isRowPass(3, 3)]).toEqual([false, true])
    expect([isRowPass(0, 1), isRowPass(1, 1)]).toEqual([false, true])
  })

  it('0/8 vẫn ghi kết quả hàng (Soát vé: hàng đã làm giữ kết quả)', () => {
    expect(readFoundation(markRowTested(empty(), 'C', 0, 8, day(3))).rows.C).toEqual({ passed: false, best: 0, updatedAt: iso(3) })
  })

  it('total ≤ 0, số câu sai dạng hoặc hàng lạ → store cũ', () => {
    const s = empty()
    expect(markRowTested(s, 'A', 0, 0, day(3))).toBe(s)
    expect(markRowTested(s, 'A', 1, -8, day(3))).toBe(s)
    expect(markRowTested(s, 'A', 9, 8, day(3))).toBe(s)
    expect(markRowTested(s, 'A', -1, 8, day(3))).toBe(s)
    expect(markRowTested(s, 'A', Number.NaN, 8, day(3))).toBe(s)
    expect(markRowTested(s, 'Z' as RowId, 8, 8, day(3))).toBe(s)
  })

  it('hàng A qua kiểm tra → x/18 tính cả 6 viên hàng A (ví dụ Design Notes: 7 sau khi học F07)', () => {
    let s = markRowTested(empty(), 'A', 7, 8, day(3))
    s = markRowTested(s, 'B', 4, 8, day(3, 20, 5))
    s = finishPlacement(s, 'done', day(3, 20, 6))
    s = completeBrick(s, 'F07', day(4))
    const st = foundationState(s)
    expect(st).toMatchObject({ status: 'in-foundation', rowsDone: ['A'], taughtCount: 7, doneBrickIds: ['F07'] })
    expect(readFoundation(s).rows.A?.best).toBe(88)
    expect(isGateOpen(s, 'ipa')).toBe(true)
    expect(isGateOpen(s, 'pos')).toBe(true)
  })
})

describe('Hàng xong do học hết', () => {
  it('F17, F18 xong, hàng D chưa kiểm tra → hàng D xong, F17 đã dạy', () => {
    const s = bricks(empty(), ['F17', 'F18'], day(3))
    expect(isRowDone(s, 'D')).toBe(true)
    expect(foundationState(s).rowsDone).toEqual(['D'])
    expect(isBrickTaught(s, 'F17')).toBe(true)
    expect(isBrickTaught(s, 'F16')).toBe(false)
    expect(isBrickTaught(s, 'F99')).toBe(false)
    expect(isRowDone(bricks(empty(), ['F17'], day(3)), 'D')).toBe(false)
  })
})

describe('Qua tường', () => {
  it('hàng cuối xong bằng viên → completedAt = now (chỉ lần đầu), không còn ở Sân ga', () => {
    let s = passRows(empty(), ['A', 'B', 'C'], day(3))
    s = completeBrick(s, 'F17', day(4))
    expect(readFoundation(s).completedAt).toBeNull()
    expect(isInFoundation(s)).toBe(true)
    s = completeBrick(s, 'F18', day(5))
    expect(readFoundation(s).completedAt).toBe(iso(5))
    expect(foundationState(s).status).toBe('completed')
    expect(isInFoundation(s)).toBe(false)
    expect(needsPlacement(s)).toBe(false)
    // Ôn lại sau khi qua tường không đổi completedAt.
    const again = completeBrick(s, 'F01', day(9))
    expect(readFoundation(again).completedAt).toBe(iso(5))
    expect(scheduleStartDate(again, day(20))).toEqual(midnight(5))
  })

  it('hàng cuối xong bằng kiểm tra → completedAt = lúc kiểm tra', () => {
    let s = passRows(empty(), ['A', 'B', 'C'], day(3))
    s = markRowTested(s, 'D', 5, 8, day(4))
    expect(readFoundation(s).completedAt).toBeNull()
    s = markRowTested(s, 'D', 6, 8, day(6))
    expect(readFoundation(s).completedAt).toBe(iso(6))
    expect(needsPlacement(s)).toBe(false)
  })
})

describe('Qua tường khi đang bỏ qua', () => {
  it('bỏ qua ngày 3 (không quay lại), ôn hết 4 hàng bằng viên ngày 9 → completed, lịch vẫn từ ngày 3, pausedDays 0', () => {
    let s = skipFoundation(empty(), day(3))
    s = passRows(s, ['A', 'B', 'C'], day(8))
    s = bricks(s, ['F17', 'F18'], day(9))
    expect(readFoundation(s)).toMatchObject({ completedAt: iso(9), skippedAt: iso(3), resumedAt: null, pausedDays: 0 })
    expect(foundationState(s).status).toBe('completed')
    expect(scheduleStartDate(s, day(20))).toEqual(midnight(3))
  })
})

describe('Cổng', () => {
  it('hàng A qua Soát vé, chưa học F03 → ipa mở; chưa gì → đóng; đã bỏ qua → mọi cổng mở; cổng lạ → false', () => {
    const passedA = finishPlacement(markRowTested(empty(), 'A', 6, 8, day(3)), 'done', day(3))
    expect(isGateOpen(passedA, 'ipa')).toBe(true)
    expect(isGateOpen(passedA, 'stress')).toBe(true)
    expect(isGateOpen(passedA, 'pos')).toBe(false)

    const gates = ['ipa', 'stress', 'pos'] as const
    expect(gates.map((g) => isGateOpen(empty(), g))).toEqual([false, false, false])
    expect(isGateOpen(bricks(empty(), ['F04'], day(3)), 'stress')).toBe(true)

    const skipped = skipFoundation(empty(), day(3))
    expect(gates.map((g) => isGateOpen(skipped, g))).toEqual([true, true, true])
    // Cổng đã mở thì không đóng, kể cả khi quay lại Sân ga.
    const resumed = resumeFoundation(skipped, day(5))
    expect(gates.map((g) => isGateOpen(resumed, g))).toEqual([true, true, true])
    expect(isBrickTaught(resumed, 'F18')).toBe(true)
    // x/18 không tính "đã bỏ qua" (quay lại vẫn thấy đúng chỗ).
    expect(foundationState(resumed).taughtCount).toBe(0)

    for (const g of ['foo', '__proto__', 'toString', '']) expect(isGateOpen(skipped, g as FoundationGate)).toBe(false)
  })
})

describe('Bỏ qua', () => {
  it('bỏ qua ngày 3, bấm lại ngày 5 → skippedAt ngày 3 (store cũ ở lần 2); lịch bắt đầu ngày 3', () => {
    const s1 = skipFoundation(empty(), day(3))
    expect(readFoundation(s1).skippedAt).toBe(iso(3))
    expect(foundationState(s1).status).toBe('skipped')
    expect(isInFoundation(s1)).toBe(false)
    expect(needsPlacement(s1)).toBe(false)
    expect(skipFoundation(s1, day(5))).toBe(s1)
    expect(scheduleStartDate(s1, day(5))).toEqual(midnight(3))
  })

  it('đã qua tường → store cũ', () => {
    const done = passRows(empty(), ['A', 'B', 'C', 'D'], day(3))
    expect(skipFoundation(done, day(4))).toBe(done)
  })
})

describe('Quay lại rồi bỏ qua', () => {
  it('bỏ qua ngày 3, quay lại ngày 10: ngày 12 đang ở Sân ga, lịch từ ngày 5; bỏ qua lại ngày 13: pausedDays 3, lịch từ ngày 6', () => {
    const skipped = skipFoundation(empty(), day(3))
    const resumed = resumeFoundation(skipped, day(10))
    expect(readFoundation(resumed).resumedAt).toBe(iso(10))
    expect(isInFoundation(resumed)).toBe(true)
    expect(foundationState(resumed).status).toBe('in-foundation')
    expect(scheduleStartDate(resumed, day(12))).toEqual(midnight(5))

    const again = skipFoundation(resumed, day(13))
    const f = readFoundation(again)
    expect(f).toMatchObject({ pausedDays: 3, resumedAt: null, skippedAt: iso(3) })
    expect(isInFoundation(again)).toBe(false)
    expect(scheduleStartDate(again, day(13))).toEqual(midnight(6))
    expect(scheduleStartDate(again, day(30))).toEqual(midnight(6))
  })

  it('quay lại khi chưa bỏ qua / đã qua tường / đang quay lại → store cũ', () => {
    const s = empty()
    expect(resumeFoundation(s, day(3))).toBe(s)
    const done = skipFoundation(passRows(empty(), ['A', 'B', 'C', 'D'], day(3)), day(4))
    expect(resumeFoundation(done, day(5))).toBe(done)
    const resumed = resumeFoundation(skipFoundation(empty(), day(3)), day(5))
    expect(resumeFoundation(resumed, day(6))).toBe(resumed)
  })
})

describe('Quay lại rồi qua tường', () => {
  it('bỏ qua ngày 3, quay lại ngày 10, xong hàng cuối ngày 15 → completedAt ngày 15, pausedDays 5, lịch từ ngày 8', () => {
    let s = resumeFoundation(skipFoundation(empty(), day(3)), day(10))
    s = passRows(s, ['A', 'B', 'C'], day(12))
    expect(readFoundation(s).completedAt).toBeNull()
    s = markRowTested(s, 'D', 8, 8, day(15))
    expect(readFoundation(s)).toMatchObject({ completedAt: iso(15), pausedDays: 5, resumedAt: null })
    expect(foundationState(s).status).toBe('completed')
    expect(scheduleStartDate(s, day(20))).toEqual(midnight(8))
  })
})

describe('Chưa bắt đầu lịch', () => {
  it('chưa bỏ qua, chưa qua tường → null (kể cả đã học vài viên / đã Soát vé)', () => {
    let s = bricks(empty(), ['F01', 'F02'], day(3))
    s = finishPlacement(s, 'skipped', day(3))
    expect(scheduleStartDate(s, day(10))).toBeNull()
  })
})

describe('Soát vé', () => {
  it("finishPlacement('done') khi pending; rồi 'skipped' → giữ done", () => {
    const s1 = finishPlacement(empty(), 'done', day(3))
    expect(readFoundation(s1).placement).toBe('done')
    expect(needsPlacement(s1)).toBe(false)
    expect(isInFoundation(s1)).toBe(true)
    const s2 = finishPlacement(s1, 'skipped', day(4))
    expect(s2).toBe(s1)
    expect(readFoundation(finishPlacement(empty(), 'skipped', day(3))).placement).toBe('skipped')
    expect(finishPlacement(empty(), 'pending' as 'done', day(3))).toEqual(empty())
  })

  it('Thư nhập học: welcomeSeenAt chỉ ghi lần đầu', () => {
    const s1 = markWelcomeSeen(empty(), day(3))
    expect(readFoundation(s1).welcomeSeenAt).toBe(iso(3))
    expect(markWelcomeSeen(s1, day(4))).toBe(s1)
  })
})

describe('mergeFoundation', () => {
  const T1 = iso(1)
  const T2 = iso(2)
  const T3 = iso(3)
  const T4 = iso(4)
  const base = (patch: Record<string, unknown>) => ({ ...createDefaultFoundation(), ...patch })

  it('Gộp viên: firstDoneAt sớm nhất, lastDoneAt muộn nhất, updatedAt mới hơn; một bên sai dạng → bên hợp lệ', () => {
    const l = base({ bricks: { F02: { firstDoneAt: T2, lastDoneAt: T2, updatedAt: T3 }, F03: 'junk' }, updatedAt: T3 })
    const s = base({ bricks: { F02: { firstDoneAt: T1, lastDoneAt: T4, updatedAt: T1 }, F03: { firstDoneAt: T1, lastDoneAt: T1, updatedAt: T1 } }, updatedAt: T1 })
    const m = mergeFoundation(l, s) as { bricks: Record<string, unknown> }
    expect(m.bricks.F02).toEqual({ firstDoneAt: T1, lastDoneAt: T4, updatedAt: T3 })
    expect(m.bricks.F03).toEqual({ firstDoneAt: T1, lastDoneAt: T1, updatedAt: T1 })
  })

  it('Gộp hàng: local mới hơn passed false best 50, server cũ passed true best 75 → passed, 75', () => {
    const l = base({ rows: { A: { passed: false, best: 50, updatedAt: T2 } }, updatedAt: T2 })
    const s = base({ rows: { A: { passed: true, best: 75, updatedAt: T1 } }, updatedAt: T1 })
    expect((mergeFoundation(l, s) as { rows: unknown }).rows).toEqual({ A: { passed: true, best: 75, updatedAt: T2 } })
  })

  it('Gộp ngày & Soát vé: local pending skippedAt T2, server done skippedAt T1 → done, T1', () => {
    const l = base({ placement: 'pending', skippedAt: T2, welcomeSeenAt: T2, updatedAt: T3 })
    const s = base({ placement: 'done', skippedAt: T1, welcomeSeenAt: null, completedAt: null, updatedAt: T1 })
    expect(mergeFoundation(l, s)).toMatchObject({ placement: 'done', skippedAt: T1, welcomeSeenAt: T2, completedAt: null, updatedAt: T3 })
    // Hai bên đều khác pending → theo updatedAt.
    expect(mergeFoundation(base({ placement: 'skipped', updatedAt: T1 }), base({ placement: 'done', updatedAt: T2 }))).toMatchObject({ placement: 'done' })
    expect(mergeFoundation(base({ placement: 'skipped', updatedAt: T2 }), base({ placement: 'done', updatedAt: T2 }))).toMatchObject({ placement: 'skipped' })
  })

  it('resumedAt, pausedDays và field lạ theo updatedAt của cả object (bằng nhau giữ local)', () => {
    const l = base({ skippedAt: T1, resumedAt: null, pausedDays: 2, extra: 'l', updatedAt: T2 })
    const s = base({ skippedAt: T1, resumedAt: T3, pausedDays: 0, extra: 's', other: 1, updatedAt: T3 })
    expect(mergeFoundation(l, s)).toMatchObject({ resumedAt: T3, pausedDays: 0, extra: 's', other: 1, updatedAt: T3 })
    expect(mergeFoundation(l, { ...s, updatedAt: T2 })).toMatchObject({ resumedAt: null, pausedDays: 2, extra: 'l', other: 1 })
  })

  it('completedAt / welcomeSeenAt: cả hai bên có ngày → lấy ngày sớm nhất dù bên thắng giữ ngày muộn hơn', () => {
    const l = base({ completedAt: iso(7), welcomeSeenAt: iso(7), updatedAt: iso(8) })
    const s = base({ completedAt: iso(5), welcomeSeenAt: iso(4), updatedAt: iso(6) })
    expect(mergeFoundation(l, s)).toMatchObject({ completedAt: iso(5), welcomeSeenAt: iso(4), updatedAt: iso(8) })
    expect(mergeFoundation(s, l)).toMatchObject({ completedAt: iso(5), welcomeSeenAt: iso(4), updatedAt: iso(8) })
  })

  it('bên thắng chưa từng bỏ qua, bên kia bỏ qua rồi quay lại → giữ lần quay lại và pausedDays của bên kia', () => {
    // Máy A: bỏ qua ngày 3, quay lại ngày 10. Máy B chưa thấy lần bỏ qua, học F01 ngày 12 (mới hơn).
    const a = resumeFoundation(skipFoundation(empty(), day(3)), day(10)).data.foundation
    const b = completeBrick(empty(), 'F01', day(12)).data.foundation
    const onB = mergeFoundation(b, a)
    expect(onB).toMatchObject({ skippedAt: iso(3), resumedAt: iso(10), updatedAt: iso(12) })
    expect(mergeFoundation(a, b)).toEqual(onB)
    expect(foundationState({ ...empty(), data: { foundation: onB } })).toMatchObject({ status: 'in-foundation', doneBrickIds: ['F01'] })
    expect(mergeFoundation(onB, a)).toEqual(onB)
    expect(mergeFoundation(a, onB)).toEqual(onB)
    // A đã đóng lần quay lại (pausedDays 3): B mới hơn mà chưa bỏ qua không làm mất số ngày tạm dừng.
    const closed = skipFoundation(resumeFoundation(skipFoundation(empty(), day(3)), day(10)), day(13)).data.foundation
    const later = completeBrick(empty(), 'F01', day(14)).data.foundation
    const m = mergeFoundation(later, closed)
    expect(m).toMatchObject({ skippedAt: iso(3), resumedAt: null, pausedDays: 3 })
    expect(scheduleStartDate({ ...empty(), data: { foundation: m } }, day(20))).toEqual(midnight(6))
  })

  it('một bên sai dạng / thiếu → lấy bên hợp lệ; cả hai thiếu → undefined', () => {
    const f = base({ updatedAt: T1 })
    expect(mergeFoundation(f, undefined)).toBe(f)
    expect(mergeFoundation([1], f)).toBe(f)
    expect(mergeFoundation(undefined, undefined)).toBeUndefined()
  })

  it('Hai nửa qua tường: máy A đạt A, B; máy B đạt C, D → completedAt = updatedAt mới hơn; gộp lại không đổi', () => {
    const a = passRows(empty(), ['A', 'B'], day(5))
    const b = passRows(empty(), ['C', 'D'], day(6))
    const fa = a.data.foundation
    const fb = b.data.foundation
    expect(readFoundation(a).completedAt).toBeNull()
    expect(readFoundation(b).completedAt).toBeNull()
    const onA = mergeFoundation(fa, fb)
    const onB = mergeFoundation(fb, fa)
    const newer = readFoundation(b).updatedAt
    expect(onA).toMatchObject({ completedAt: newer, updatedAt: newer })
    expect(onB).toEqual(onA)
    expect(mergeFoundation(onA, onA)).toEqual(onA)
    expect(mergeFoundation(fa, onA)).toEqual(onA)
    expect(mergeFoundation(fb, onA)).toEqual(onA)
    expect(mergeFoundation(onA, fb)).toEqual(onA)
    const merged: Store = { ...empty(), data: { foundation: onA } }
    expect(foundationState(merged)).toMatchObject({ status: 'completed', rowsDone: ['A', 'B', 'C', 'D'], taughtCount: 18 })
  })

  it('máy kia qua tường khi máy này còn đang quay lại → đóng lần quay lại tại completedAt', () => {
    const resumed = resumeFoundation(skipFoundation(empty(), day(3)), day(10)).data.foundation as Record<string, unknown>
    const other = base({ skippedAt: iso(3), completedAt: iso(15), updatedAt: iso(9) })
    const m = mergeFoundation(resumed, other)
    expect(m).toMatchObject({ completedAt: iso(15), resumedAt: null, pausedDays: 5 })
    expect(mergeFoundation(m, other)).toEqual(m)
    expect(mergeFoundation(m, m)).toEqual(m)
  })
})
