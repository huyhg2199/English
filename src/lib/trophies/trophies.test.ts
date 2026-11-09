import { describe, expect, it } from 'vitest'

import { BRICKS, ROW_IDS } from '@/data/foundation'
import { completeBrick, foundationState, markRowTested, resumeFoundation, skipFoundation } from '@/lib/foundation'
import { isQuizAttempt } from '@/lib/quiz'
import { computeStreak, localDayKey } from '@/lib/sessions'
import { mergeData } from '@/lib/sync/merge'
import type { Store } from '@/lib/storage'

import {
  BOARDING_LETTER,
  BOARDING_MEDAL,
  boardingMedal,
  BRICK_FIRST_DONE_POINTS,
  comebackCount,
  dayNumber,
  housePoints,
  isWallCelebrationPending,
  levelFor,
  longestStreak,
  markSeen,
  markWallCelebrated,
  MEDAL_IDS,
  medalProgress,
  readSeen,
  storeHousePoints,
  unseenLevelUps,
  WALL_CELEBRATION_KEY,
  withBrickPoints,
} from './index'

const T = '2026-11-01T10:00:00.000Z'
const entry = (kind: 'full' | 'lazy') => ({ kind, completedAt: T, minutes: 10, updatedAt: T })

/** `n` ngày liên tiếp bắt đầu từ ngày `start` (giờ máy). */
function run(start: Date, n: number, kind: 'full' | 'lazy' = 'full'): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (let i = 0; i < n; i++) {
    out[localDayKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))] = entry(kind)
  }
  return out
}

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d)

function attempt(score: number, total: number, extra: Record<string, unknown> = {}) {
  const answers = Array.from({ length: total }, (_, i) => ({ questionId: `q${i}`, chosen: 'a', correct: i < score }))
  return { quizId: 'mini-t1', seed: 's', startedAt: T, finishedAt: T, score, total, answers, updatedAt: T, ...extra }
}

const store = (data: Record<string, unknown>): Store => ({ schemaVersion: 10, data })
const withAttempts = (list: unknown[], data: Record<string, unknown> = {}) =>
  store({ ...data, quizzes: { attempts: Object.fromEntries(list.map((a, i) => [`a${i}`, a])) } })

describe('dayNumber', () => {
  it('key hợp lệ → số ngày liên tiếp; key sai dạng hoặc ngày không có thật → null', () => {
    expect(dayNumber('2026-03-01')! - dayNumber('2026-02-28')!).toBe(1)
    expect(dayNumber('2026-02-30')).toBeNull()
    expect(dayNumber('2026-1-01')).toBeNull()
    expect(dayNumber('abc')).toBeNull()
  })
})

describe('housePoints', () => {
  it('3 ngày chuẩn + 2 ngày lười, không liên tiếp đủ 7 → 40', () => {
    const days = { ...run(D(2026, 11, 1), 3), ...run(D(2026, 11, 5), 2, 'lazy') }
    expect(housePoints(days)).toEqual({ total: 40, base: 40, bonus: 0, bonusCount: 0 })
  })

  it('7 ngày liên tiếp toàn buổi chuẩn → 70 + 20 = 90', () => {
    expect(housePoints(run(D(2026, 11, 1), 7)).total).toBe(90)
  })

  it('14 ngày liên tiếp → thưởng 2 lần (+40)', () => {
    expect(housePoints(run(D(2026, 11, 1), 14))).toMatchObject({ bonus: 40, bonusCount: 2, total: 180 })
  })

  it('7 ngày, nghỉ 1 ngày, 7 ngày → thưởng 2 lần; Neville 1 lần', () => {
    const days = { ...run(D(2026, 11, 1), 7), ...run(D(2026, 11, 9), 7) }
    expect(housePoints(days).bonusCount).toBe(2)
    expect(comebackCount(days)).toBe(1)
  })

  it('chuỗi qua cuối tháng / đổi giờ mùa hè vẫn liên tiếp', () => {
    expect(housePoints(run(D(2026, 3, 26), 7)).bonusCount).toBe(1)
    expect(longestStreak(run(D(2026, 10, 28), 7))).toBe(7)
  })

  it('ngày nhật ký / mục sai dạng → bỏ qua, không crash', () => {
    const days = { ...run(D(2026, 11, 1), 2), 'not-a-day': entry('full'), '2026-11-05': { kind: 'x' }, '2026-11-06': null }
    expect(housePoints(days).total).toBe(20)
    expect(longestStreak(days)).toBe(2)
    expect(comebackCount(days)).toBe(0)
    expect(housePoints({})).toEqual({ total: 0, base: 0, bonus: 0, bonusCount: 0 })
  })
})

describe('longestStreak / comebackCount', () => {
  it('bất biến: longestStreak(days) >= computeStreak(days, now)', () => {
    const now = D(2026, 11, 20)
    const fixtures: Record<string, unknown>[] = [
      {},
      run(D(2026, 11, 14), 7),
      run(D(2026, 11, 13), 7),
      { ...run(D(2026, 11, 1), 10), ...run(D(2026, 11, 15), 6, 'lazy') },
      { ...run(D(2026, 11, 18), 3), 'bad-key': entry('full'), '2026-11-17': { kind: 'x' } },
      run(D(2026, 10, 1), 3),
    ]
    for (const days of fixtures) expect(longestStreak(days)).toBeGreaterThanOrEqual(computeStreak(days, now))
  })

  it('chuỗi dài nhất lấy max các đoạn; Neville đếm mỗi lần quay lại sau ≥ 1 ngày bỏ lỡ', () => {
    const days = { ...run(D(2026, 1, 1), 3), ...run(D(2026, 1, 10), 5), ...run(D(2026, 1, 16), 2) }
    expect(longestStreak(days)).toBe(5)
    expect(comebackCount(days)).toBe(2)
  })
})

describe('medalProgress', () => {
  it('levelFor: 1 / 5 / 20 → đồng / bạc / vàng', () => {
    expect([0, 1, 4, 5, 19, 20, 99].map(levelFor)).toEqual([null, 'bronze', 'bronze', 'silver', 'silver', 'gold', 'gold'])
  })

  it('Hermione: 5 lần làm bài 100% → bạc, tiến độ tới vàng', () => {
    const s = withAttempts([...Array.from({ length: 5 }, () => attempt(10, 10)), attempt(9, 10)])
    const h = medalProgress(s).find((m) => m.id === 'hermione')!
    expect(h).toMatchObject({ count: 5, level: 'silver', next: { level: 'gold', target: 20 } })
  })

  it('Hermione: lần comeback `skipped` và lần sai dạng / loại lạ không tính; comeback 100% có tính', () => {
    const s = withAttempts([
      attempt(0, 0, { kind: 'comeback', skipped: true }),
      attempt(5, 5, { kind: 'comeback' }),
      attempt(3, 3, { kind: 'future-kind' }),
      { junk: true },
      attempt(3, 3, { score: 4 }),
    ])
    expect(medalProgress(s).find((m) => m.id === 'hermione')!.count).toBe(1)
  })

  it('Dumbledore: chưa có O.W.L. → khoá, tiến độ 0/1; lần owl passed mới tính', () => {
    const none = medalProgress(store({})).find((m) => m.id === 'dumbledore')!
    expect(none).toMatchObject({ count: 0, level: null, next: { level: 'bronze', target: 1 } })
    const s = withAttempts([attempt(8, 10, { kind: 'owl', passed: true }), attempt(2, 10, { kind: 'owl', passed: false })])
    const all = medalProgress(s)
    expect(all.find((m) => m.id === 'dumbledore')).toMatchObject({ count: 1, level: 'bronze' })
    expect(all.find((m) => m.id === 'hermione')!.count).toBe(0)
  })

  it('Neville tính từ nhật ký buổi học; dữ liệu sai dạng không crash', () => {
    const s = store({ sessions: { days: { ...run(D(2026, 1, 1), 1), ...run(D(2026, 1, 3), 1) } } })
    expect(medalProgress(s).find((m) => m.id === 'neville')).toMatchObject({ count: 1, level: 'bronze' })
    expect(medalProgress(store({ sessions: 'x', quizzes: { attempts: 5 } })).every((m) => m.count === 0)).toBe(true)
  })

  it('vàng → next null', () => {
    const s = withAttempts(Array.from({ length: 20 }, () => attempt(1, 1)))
    expect(medalProgress(s)[0]).toMatchObject({ level: 'gold', next: null })
  })
})

describe('cấp không giảm', () => {
  it('đồng bộ lấp ngày trống làm Neville về 0 lần → vẫn giữ cấp đồng đã báo, không báo lại', () => {
    const NOW = new Date('2026-11-02T08:00:00.000Z')
    const local = store({ sessions: { days: { ...run(D(2026, 1, 1), 1), ...run(D(2026, 1, 3), 1) } } })
    expect(medalProgress(local).find((m) => m.id === 'neville')!.level).toBe('bronze')
    const seen = markSeen(local, unseenLevelUps(local), NOW)
    const merged = store(mergeData(seen.data, { sessions: { days: run(D(2026, 1, 2), 1) } }))
    const neville = medalProgress(merged).find((m) => m.id === 'neville')!
    expect(neville).toMatchObject({ count: 0, level: 'bronze', next: { level: 'silver', target: 5 } })
    expect(unseenLevelUps(merged)).toEqual([])
    // Chưa báo thì không có sàn: cấp theo số lần thật.
    const unseen = store(mergeData(local.data, { sessions: { days: run(D(2026, 1, 2), 1) } }))
    expect(medalProgress(unseen).find((m) => m.id === 'neville')!.level).toBeNull()
  })
})

describe('QuizAttempt.passed', () => {
  it('passed tuỳ chọn, phải là boolean', () => {
    expect(isQuizAttempt(attempt(1, 1, { kind: 'owl', passed: true }))).toBe(true)
    expect(isQuizAttempt(attempt(1, 1, { kind: 'owl', passed: 'yes' }))).toBe(false)
  })
})

describe('unseenLevelUps / markSeen', () => {
  const NOW = new Date('2026-11-02T08:00:00.000Z')

  it('Hermione vừa lên đồng, chưa có trong seen → báo; ghi seen rồi thì không báo lại', () => {
    const s = withAttempts([attempt(10, 10)])
    const ups = unseenLevelUps(s)
    expect(ups).toEqual([{ id: 'hermione', name: 'Hermione', level: 'bronze', key: 'hermione:bronze' }])
    const marked = markSeen(s, ups, NOW)
    expect(readSeen(marked)).toEqual({ 'hermione:bronze': { updatedAt: NOW.toISOString() } })
    expect(unseenLevelUps(marked)).toEqual([])
    expect(markSeen(marked, ups, NOW)).toBe(marked)
  })

  it('seen đồng bộ từ máy khác có mục đó → không báo lại', () => {
    const s = withAttempts([attempt(1, 1)], { trophies: { seen: { 'hermione:bronze': { updatedAt: '2026-10-01T00:00:00Z' } } } })
    expect(unseenLevelUps(s)).toEqual([])
  })

  it('lên thẳng bạc → báo một lần cấp bạc; markSeen ghi cả đồng, giữ mục cũ và field khác', () => {
    const old = { updatedAt: '2026-10-01T00:00:00.000Z' }
    const s = withAttempts(Array.from({ length: 5 }, () => attempt(1, 1)), { trophies: { seen: { 'x:y': old }, extra: 1 } })
    const ups = unseenLevelUps(s)
    expect(ups.map((u) => u.key)).toEqual(['hermione:silver'])
    const marked = markSeen(s, ups, NOW)
    expect(marked.data.trophies).toEqual({
      extra: 1,
      seen: { 'x:y': old, 'hermione:bronze': { updatedAt: NOW.toISOString() }, 'hermione:silver': { updatedAt: NOW.toISOString() } },
    })
    expect(s.data.trophies).toEqual({ seen: { 'x:y': old }, extra: 1 })
  })
})

describe('nhật ký buổi có lessonId dạng fNN (buổi Sân ga, story 21)', () => {
  const withBrick = (days: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(days).map(([k, v]) => [k, { ...(v as object), lessonId: 'f03' }]))

  it('housePoints, longestStreak, comebackCount, medalProgress không đổi khi lessonId là f03', () => {
    const days = { ...run(D(2026, 10, 1), 3), ...run(D(2026, 11, 1), 8) }
    const brick = withBrick(days)
    expect(housePoints(brick)).toEqual(housePoints(days))
    expect(housePoints(brick).total).toBeGreaterThan(0)
    expect(longestStreak(brick)).toBe(8)
    expect(comebackCount(brick)).toBe(comebackCount(days))
    expect(medalProgress(store({ sessions: { days: brick } }))).toEqual(medalProgress(store({ sessions: { days } })))
  })
})

describe('Qua bức tường: huy chương Lên tàu Năm 1, ăn mừng, điểm viên gạch (story 26)', () => {
  const at = (d: number, h = 9) => new Date(2026, 10, d, h)
  const fresh = (): Store => ({ schemaVersion: 13, data: {} })
  /** Qua cả 4 hàng bằng kiểm tra (Soát vé / "Tôi biết rồi"), không học viên nào. */
  const passAllRows = (s: Store, d = 5) => ROW_IDS.reduce((acc, r) => markRowTested(acc, r, 7, 8, at(d)), s)
  const learnAll = (s: Store, d = 5) => BRICKS.reduce((acc, b, i) => completeBrick(acc, b.id, at(d, 8 + (i % 10))), s)

  it('không nằm trong MEDAL_IDS; thư Lên tàu không cấp', () => {
    expect((MEDAL_IDS as readonly string[]).includes(BOARDING_MEDAL.id)).toBe(false)
    expect(BOARDING_MEDAL).toEqual({ id: 'board-year-1', name: 'Lên tàu Năm 1', condition: 'Xong cả 4 hàng của Sân ga 9¾' })
    expect(BOARDING_LETTER).toEqual({ key: 'board-year-1', name: 'Lên tàu Năm 1', level: null })
    expect(WALL_CELEBRATION_KEY).toBe('wall-passed')
  })

  it('store mới: chưa có huy chương, không chờ ăn mừng; markWallCelebrated trả store cũ', () => {
    const s = fresh()
    expect(boardingMedal(s)).toEqual({ earned: false, earnedAt: null, delivered: false })
    expect(isWallCelebrationPending(s)).toBe(false)
    expect(markWallCelebrated(s, at(9))).toBe(s)
  })

  it('bỏ qua Sân ga, chưa quay lại: không huy chương, không chờ ăn mừng', () => {
    const s = skipFoundation(fresh(), at(3))
    expect(boardingMedal(s).earned).toBe(false)
    expect(isWallCelebrationPending(s)).toBe(false)
    expect(markWallCelebrated(s, at(9))).toBe(s)
  })

  it('bỏ qua rồi quay lại và xong 4 hàng: có huy chương, chờ ăn mừng', () => {
    const s = passAllRows(resumeFoundation(skipFoundation(fresh(), at(1)), at(2)), 6)
    expect(boardingMedal(s)).toEqual({ earned: true, earnedAt: at(6).toISOString(), delivered: false })
    expect(isWallCelebrationPending(s)).toBe(true)
  })

  it('qua tường bằng học (F17 rồi F18 sau cùng): completedAt = lúc xong F18, chờ ăn mừng', () => {
    const others = BRICKS.filter((b) => b.id !== 'F18')
    let s = others.reduce((acc, b) => completeBrick(acc, b.id, at(4)), fresh())
    expect(isWallCelebrationPending(s)).toBe(false)
    s = completeBrick(s, 'F18', at(7))
    expect(boardingMedal(s).earnedAt).toBe(at(7).toISOString())
    expect(isWallCelebrationPending(s)).toBe(true)
  })

  it('ăn mừng lần đầu ghi wall-passed + board-year-1; ghi lần nữa → đúng store cũ, không lặp', () => {
    const pending = passAllRows(fresh())
    const once = markWallCelebrated(pending, at(9))
    expect(readSeen(once)).toEqual({
      'wall-passed': { updatedAt: at(9).toISOString() },
      'board-year-1': { updatedAt: at(9).toISOString() },
    })
    expect(isWallCelebrationPending(once)).toBe(false)
    expect(boardingMedal(once).delivered).toBe(true)
    expect(markWallCelebrated(once, at(10))).toBe(once)
  })

  it('giữ mục cũ: đã có board-year-1 (thời điểm sớm) → chỉ thêm wall-passed; mục huy chương khác giữ nguyên', () => {
    const early = { updatedAt: '2026-11-01T00:00:00.000Z' }
    const base = passAllRows(fresh())
    const s: Store = { ...base, data: { ...base.data, trophies: { seen: { 'board-year-1': early, 'hermione:bronze': early } } } }
    const out = markWallCelebrated(s, at(9))
    expect(readSeen(out)).toEqual({
      'board-year-1': early,
      'hermione:bronze': early,
      'wall-passed': { updatedAt: at(9).toISOString() },
    })
  })

  it('dữ liệu cũ có completedAt từ trước bản này, chưa có mục ăn mừng → chờ ăn mừng', () => {
    const s = store({ foundation: { completedAt: '2026-11-03T02:00:00.000Z', bricks: {}, rows: {} } })
    expect(isWallCelebrationPending(s)).toBe(true)
    expect(boardingMedal(s)).toMatchObject({ earned: true, earnedAt: '2026-11-03T02:00:00.000Z' })
  })

  it('huy chương cũ: có wall-passed, board-year-1 trong seen → medalProgress, unseenLevelUps giống hệt khi không có', () => {
    const data = { quizzes: { attempts: { a0: attempt(5, 5) } }, sessions: { days: run(D(2026, 11, 1), 3) } }
    const without = store(data)
    const withEntries = store({
      ...data,
      trophies: { seen: { 'wall-passed': { updatedAt: T }, 'board-year-1': { updatedAt: T } } },
    })
    expect(medalProgress(withEntries)).toEqual(medalProgress(without))
    expect(unseenLevelUps(withEntries)).toEqual(unseenLevelUps(without))
    expect(unseenLevelUps(withEntries).map((u) => u.key)).toEqual(['hermione:bronze'])
  })

  it('hai máy: máy A đã ăn mừng, gộp sang máy B → B giữ 2 mục, không chờ ăn mừng, không thư', () => {
    const b = passAllRows(fresh(), 5)
    const a = markWallCelebrated(b, at(6))
    const merged = store(mergeData(b.data, a.data))
    expect(isWallCelebrationPending(merged)).toBe(false)
    expect(boardingMedal(merged).delivered).toBe(true)
    expect(Object.keys(readSeen(merged)).sort()).toEqual(['board-year-1', 'wall-passed'])
    // Ngược chiều (B gộp lên A) cũng vậy, mục sớm hơn thắng.
    const later = markWallCelebrated(b, at(8))
    const both = store(mergeData(later.data, a.data))
    expect(readSeen(both)['wall-passed']).toEqual({ updatedAt: at(6).toISOString() })
  })

  describe('điểm Nhà + điểm viên gạch', () => {
    it('18 viên firstDoneAt, 10 ngày buổi chuẩn → housePoints(days).total + 90', () => {
      const days = run(D(2026, 11, 1), 10)
      const s = learnAll(fresh())
      const count = foundationState(s).doneBrickIds.length
      expect(count).toBe(18)
      const p = withBrickPoints(housePoints(days), count)
      expect(p.total).toBe(housePoints(days).total + 90)
      expect(p).toMatchObject({ brickPoints: 90, brickCount: 18, base: housePoints(days).base })
      expect(BRICK_FIRST_DONE_POINTS).toBe(5)
    })

    it('học lại một viên không đổi điểm; hàng qua kiểm tra không cộng; học viên của hàng ấy lần đầu +5', () => {
      let s = completeBrick(fresh(), 'F01', at(1))
      const once = foundationState(s).doneBrickIds.length
      s = completeBrick(s, 'F01', at(3))
      expect(foundationState(s).doneBrickIds.length).toBe(once)
      const tested = markRowTested(fresh(), 'B', 7, 8, at(2))
      expect(withBrickPoints(housePoints({}), foundationState(tested).doneBrickIds.length).brickPoints).toBe(0)
      const learned = completeBrick(tested, 'F09', at(4))
      expect(withBrickPoints(housePoints({}), foundationState(learned).doneBrickIds.length).brickPoints).toBe(5)
    })

    it('qua tường bằng Soát vé (không học viên) → điểm viên gạch 0', () => {
      const s = passAllRows(fresh())
      expect(withBrickPoints(housePoints({}), foundationState(s).doneBrickIds.length)).toMatchObject({
        total: 0,
        brickPoints: 0,
        brickCount: 0,
      })
    })

    it('storeHousePoints (Phòng Cúp, màn Qua bức tường): Soát vé đủ 4 hàng → 0 điểm viên; học đủ 18 viên → +90', () => {
      expect(storeHousePoints(passAllRows(fresh()))).toMatchObject({ total: 0, brickPoints: 0, brickCount: 0 })
      const learned = learnAll(fresh())
      expect(storeHousePoints(learned)).toMatchObject({ brickPoints: 90, brickCount: 18 })
      expect(storeHousePoints(learned).total).toBe(housePoints({}).total + 90)
      // Qua bằng Soát vé rồi học thêm một viên: chỉ viên ấy được +5.
      expect(storeHousePoints(completeBrick(passAllRows(fresh()), 'F13', at(7)))).toMatchObject({ brickPoints: 5, brickCount: 1 })
    })

    it('brickCount âm / không nguyên / NaN → 0; housePoints giữ nguyên', () => {
      const base = housePoints(run(D(2026, 11, 1), 3))
      for (const bad of [-1, 2.5, Number.NaN, Number.POSITIVE_INFINITY]) {
        expect(withBrickPoints(base, bad)).toEqual({ ...base, brickPoints: 0, brickCount: 0 })
      }
      expect(withBrickPoints(base, 2).total).toBe(base.total + 10)
    })
  })
})
