import { describe, expect, it } from 'vitest'

import { allLessons, type Lesson } from '@/data/roadmap'
import type { BrickId, RowId } from '@/data/foundation'
import { completeBrick, isInFoundation, markRowTested, resumeFoundation, skipFoundation } from '@/lib/foundation'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  FOUNDATION_STEPS,
  followUpBrickId,
  lazyFoundationBrick,
  LEGACY_STEP_MAP,
  LESSON_STEPS,
  lockTheory,
  readSessionDays,
  recordSession,
  resolveSessionPlan,
  reviewNote,
  SESSION_MINUTES,
  sessionLesson,
  sessionPlan,
  sessionRecordLessonId,
  sessionSearch,
  sessionWordList,
  type SessionPlan,
} from './index'

const day = (d: number, h = 20) => new Date(2026, 10, d, h)
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
/** Nội dung giả: F01–F06 đã soạn, F07+ "Đang soạn". */
const CONTENT = new Set<string>(['F01', 'F02', 'F03', 'F04', 'F05', 'F06'])
const hasContent = (id: BrickId) => CONTENT.has(id)
const none = () => false

function done(ids: readonly BrickId[], s: Store = empty(), d = 1): Store {
  ids.forEach((id, i) => {
    s = completeBrick(s, id, day(d, 8 + i))
  })
  return s
}

function passRows(rows: readonly RowId[], s: Store = empty()): Store {
  for (const r of rows) s = markRowTested(s, r, 8, 8, day(2))
  return s
}

const stepMinutes = (plan: SessionPlan) => plan.steps.map((s) => [s.id, s.minutes])
/** Phút học tính từ các bước của kế hoạch: bước giải trí × ½. */
const studyMinutes = (plan: SessionPlan) => plan.steps.reduce((sum, s) => sum + (s.id === 'fun' ? s.minutes / 2 : s.minutes), 0)

describe('sessionPlan — I/O Matrix', () => {
  it('Sân ga, có viên tiếp: F01–F02 xong → F03, không ôn; theory 12 / review 8 / fun 10', () => {
    const plan = sessionPlan(done(['F01', 'F02']), hasContent)
    expect(plan).toMatchObject({ mode: 'foundation', brickId: 'F03', review: false })
    expect(stepMinutes(plan)).toEqual([
      ['theory', 12],
      ['review', 8],
      ['fun', 10],
    ])
    expect(plan.steps.map((s) => s.title)).toEqual(['Lý thuyết', 'Ôn & từ mới', 'Giải trí nhẹ'])
    // 12 + 8 + 10 × ½ = 25 = SESSION_MINUTES.full.
    expect(studyMinutes(plan)).toBe(SESSION_MINUTES.full)
  })

  it('Bỏ hàng xong, viên đang soạn: rows.A qua, chưa xong viên nào → ôn F01', () => {
    const plan = sessionPlan(passRows(['A']), hasContent)
    expect(plan).toMatchObject({ mode: 'foundation', brickId: 'F01', review: true })
  })

  it('không viên nào có nội dung → brickId null (phần lý thuyết hiện "đang soạn")', () => {
    expect(sessionPlan(empty(), none)).toMatchObject({ mode: 'foundation', brickId: null, review: false })
    expect(sessionPlan(passRows(['A']), none)).toMatchObject({ mode: 'foundation', brickId: null })
  })

  it('Ôn viên gần nhất: F01–F06 xong, F04 có lastDoneAt muộn nhất → F04, ôn', () => {
    let s = done(['F01', 'F02', 'F03', 'F04', 'F05', 'F06'])
    s = completeBrick(s, 'F04', day(5))
    expect(sessionPlan(s, hasContent)).toMatchObject({ mode: 'foundation', brickId: 'F04', review: true })
  })

  it('Sau Sân ga: bỏ qua → buổi bài (sessionLesson); lesson 15 / srs 5 / fun 10', () => {
    const s = skipFoundation(done(['F01']), day(3))
    const plan = sessionPlan(s, hasContent)
    expect(plan.mode).toBe('lesson')
    expect(plan.mode === 'lesson' && plan.lesson?.lesson.id).toBe(sessionLesson(s)?.lesson.id)
    expect(stepMinutes(plan)).toEqual([
      ['lesson', 15],
      ['srs', 5],
      ['fun', 10],
    ])
    expect(plan.steps.map((x) => x.title)).toEqual(['Bài chính', 'Ôn flashcard', 'Giải trí'])
    expect(studyMinutes(plan)).toBe(SESSION_MINUTES.full)
  })

  it('Sau Sân ga: qua tường (cả 4 hàng) → buổi bài', () => {
    const s = passRows(['A', 'B', 'C', 'D'])
    expect(isInFoundation(s)).toBe(false)
    expect(sessionPlan(s, hasContent).mode).toBe('lesson')
  })

  it('hết lộ trình → buổi bài với lesson null', () => {
    let s = skipFoundation(empty(), day(1))
    for (const l of allLessons() as readonly Lesson[]) s = setLessonCompleted(s, l.id, true, day(2))
    expect(sessionPlan(s, hasContent)).toMatchObject({ mode: 'lesson', lesson: null })
  })

  it('Quay lại Sân ga: bỏ qua rồi "Quay lại Sân ga" → buổi Sân ga, học tiếp đúng chỗ', () => {
    const s = resumeFoundation(skipFoundation(done(['F01']), day(3)), day(4))
    expect(sessionPlan(s, hasContent)).toMatchObject({ mode: 'foundation', brickId: 'F02', review: false })
  })
})

describe('resolveSessionPlan — I/O Matrix', () => {
  it('Chốt URL: vào /session lúc ở Sân ga, viên tiếp là F03 → ?brick=F03&step=theory', () => {
    const r = resolveSessionPlan({}, done(['F01', 'F02']), hasContent)
    expect(r.stepIndex).toBe(0)
    expect(r.search).toEqual({ brick: 'F03', step: 'theory' })
  })

  it('buổi bài không tham số → ?lesson=<bài hiện tại>&step=lesson', () => {
    const s = skipFoundation(empty(), day(1))
    const r = resolveSessionPlan({}, s, hasContent)
    expect(r.search).toEqual({ lesson: 's1-t1-w1', step: 'lesson' })
  })

  it('Kế hoạch đã chốt: ?brick=F06&step=fun sau khi Sân ga xong → vẫn buổi Sân ga, ghi f06 full 25 phút', () => {
    const s = passRows(['A', 'B', 'C', 'D'], done(['F01', 'F02', 'F03', 'F04', 'F05', 'F06']))
    expect(isInFoundation(s)).toBe(false)
    const r = resolveSessionPlan({ brick: 'F06', step: 'fun' }, s, hasContent)
    expect(r.plan).toMatchObject({ mode: 'foundation', brickId: 'F06' })
    expect(r.stepIndex).toBe(2)
    expect(r.search).toEqual({ brick: 'F06', step: 'fun' })
    const lessonId = sessionRecordLessonId(r.plan)
    expect(lessonId).toBe('f06')
    const after = recordSession(s, 'full', day(6), { lessonId })
    expect(Object.values(readSessionDays(after))).toEqual([
      expect.objectContaining({ kind: 'full', minutes: 25, lessonId: 'f06' }),
    ])
  })

  it('Học tiếp viên sau: F03 tới màn Áp dụng → nút F04; bấm thì brick=F04&step=theory', () => {
    const before = done(['F01', 'F02'])
    expect(followUpBrickId(before, 'F03', hasContent)).toBeNull()
    const after = completeBrick(before, 'F03', day(4))
    expect(followUpBrickId(after, 'F03', hasContent)).toBe('F04')
    const r = resolveSessionPlan({ brick: 'F04', step: 'theory' }, after, hasContent)
    expect(r.plan).toMatchObject({ mode: 'foundation', brickId: 'F04', review: false })
    expect(r.stepIndex).toBe(0)
  })

  it('Học tiếp viên sau: không còn viên tiếp / đang ôn → không có nút', () => {
    const all = done(['F01', 'F02', 'F03', 'F04', 'F05', 'F06'])
    expect(followUpBrickId(all, 'F06', hasContent)).toBeNull()
    const r = resolveSessionPlan({ brick: 'F04' }, all, hasContent)
    expect(r.plan).toMatchObject({ brickId: 'F04', review: true })
    expect(followUpBrickId(all, 'F04', hasContent)).toBeNull()
  })

  it('URL ?step= cũ ở buổi bài: 0 → srs, 1 → lesson, 2 → fun; URL đổi sang tên bước', () => {
    const s = empty()
    const ids = ['0', '1', '2'].map((step) => {
      const r = resolveSessionPlan({ lesson: 's1-t1-w1', step }, s, hasContent)
      expect(r.plan.mode).toBe('lesson')
      expect(r.search.lesson).toBe('s1-t1-w1')
      return r.search.step
    })
    expect(ids).toEqual(['srs', 'lesson', 'fun'])
    const r = resolveSessionPlan({ lesson: 's1-t1-w1', step: '1' }, s, hasContent)
    expect(r.plan.steps[r.stepIndex].id).toBe('lesson')
  })

  it('LEGACY_STEP_MAP khớp bảng ánh xạ', () => {
    expect(LEGACY_STEP_MAP).toEqual({
      '0': { lesson: 'srs', foundation: 'review' },
      '1': { lesson: 'lesson', foundation: 'theory' },
      '2': { lesson: 'fun', foundation: 'fun' },
    })
  })

  it('?step= cũ ở Sân ga: ?step=1 không có brick/lesson → kế hoạch Sân ga, bước theory', () => {
    const r = resolveSessionPlan({ step: '1' }, done(['F01']), hasContent)
    expect(r.plan).toMatchObject({ mode: 'foundation', brickId: 'F02' })
    expect(r.search).toEqual({ brick: 'F02', step: 'theory' })
    const zero = resolveSessionPlan({ step: '0' }, done(['F01']), hasContent)
    expect(zero.search.step).toBe('review')
  })

  it('Tham số lạ: bỏ tham số sai, tính lại kế hoạch hoặc vào bước đầu; không crash', () => {
    const s = done(['F01', 'F02'])
    for (const brick of ['F99', 'F09', '', '  ', 'xyz']) {
      expect(resolveSessionPlan({ brick }, s, hasContent).search).toEqual({ brick: 'F03', step: 'theory' })
    }
    expect(resolveSessionPlan({ lesson: 'xyz' }, s, hasContent).search).toEqual({ brick: 'F03', step: 'theory' })
    expect(resolveSessionPlan({ brick: 'F03', step: 'abc' }, s, hasContent).stepIndex).toBe(0)
    expect(resolveSessionPlan({ brick: 'F03', step: 'srs' }, s, hasContent).search).toEqual({ brick: 'F03', step: 'theory' })
    expect(resolveSessionPlan({ brick: 'F03', step: '7' }, s, hasContent).stepIndex).toBe(0)
    expect(resolveSessionPlan({ brick: 'F03', step: '-1' }, s, hasContent).stepIndex).toBe(0)
    expect(resolveSessionPlan({ lesson: 's1-t1-w1', step: 'theory' }, s, hasContent).search).toEqual({
      lesson: 's1-t1-w1',
      step: 'lesson',
    })
    expect(resolveSessionPlan({ brick: 'f03', step: 'review' }, s, hasContent).search).toEqual({ brick: 'F03', step: 'review' })
    expect(resolveSessionPlan({ brick: null, lesson: null, step: null }, s, hasContent).stepIndex).toBe(0)
  })

  it('brick hợp lệ luôn là buổi Sân ga, thắng cả lesson, kể cả khi đã bỏ qua Sân ga', () => {
    const s = skipFoundation(empty(), day(1))
    const r = resolveSessionPlan({ brick: 'F02', lesson: 's1-t1-w1', step: 'review' }, s, hasContent)
    expect(r.plan).toMatchObject({ mode: 'foundation', brickId: 'F02' })
    expect(r.search).toEqual({ brick: 'F02', step: 'review' })
  })

  it('lesson hợp lệ ở Sân ga → buổi bài đó (URL cũ trước nâng cấp)', () => {
    const r = resolveSessionPlan({ lesson: 's1-t1-w1', step: '1' }, done(['F01']), hasContent)
    expect(r.plan.mode).toBe('lesson')
    expect(r.plan.steps).toBe(LESSON_STEPS)
  })

  it('brickId null → search chỉ có step', () => {
    const r = resolveSessionPlan({ step: 'fun' }, empty(), none)
    expect(r.plan).toMatchObject({ mode: 'foundation', brickId: null })
    expect(r.plan.steps).toBe(FOUNDATION_STEPS)
    expect(r.search).toEqual({ step: 'fun' })
  })
})

describe('sessionRecordLessonId', () => {
  it('viên → fNN, bài → id bài, không có → undefined', () => {
    expect(sessionRecordLessonId({ mode: 'foundation', brickId: 'F03', review: false, steps: FOUNDATION_STEPS })).toBe('f03')
    expect(sessionRecordLessonId({ mode: 'foundation', brickId: null, review: false, steps: FOUNDATION_STEPS })).toBeUndefined()
    expect(sessionRecordLessonId({ mode: 'lesson', lesson: null, steps: LESSON_STEPS })).toBeUndefined()
    const lesson = sessionLesson(empty())
    expect(sessionRecordLessonId({ mode: 'lesson', lesson, steps: LESSON_STEPS })).toBe('s1-t1-w1')
  })
})

describe('sessionSearch — tham số chuẩn khi chuyển bước', () => {
  it('buổi Sân ga: giữ brick, đổi step theo tên bước', () => {
    const { plan } = resolveSessionPlan({ brick: 'F03' }, done(['F01', 'F02']), hasContent)
    expect(sessionSearch(plan, 1)).toEqual({ brick: 'F03', step: 'review' })
    expect(sessionSearch(plan, 2)).toEqual({ brick: 'F03', step: 'fun' })
  })

  it('chỉ số ngoài khoảng → bước đầu', () => {
    const { plan } = resolveSessionPlan({ brick: 'F03' }, done(['F01', 'F02']), hasContent)
    expect(sessionSearch(plan, 7)).toEqual({ brick: 'F03', step: 'theory' })
    expect(sessionSearch(plan, -1)).toEqual({ brick: 'F03', step: 'theory' })
  })

  it('buổi bài lesson null → chỉ step', () => {
    const plan: SessionPlan = { mode: 'lesson', lesson: null, steps: LESSON_STEPS }
    expect(sessionSearch(plan, 1)).toEqual({ step: 'srs' })
  })
})

describe('lockTheory — "Ôn lại" chốt theo viên lúc vào buổi', () => {
  const ALL_BUT_LAST: BrickId[] = ['F01', 'F02', 'F03', 'F04', 'F05']

  it('vào F06 (viên có nội dung cuối) không ôn; học xong F06 giữa buổi vẫn không ôn', () => {
    const before = done(ALL_BUT_LAST)
    const entry = resolveSessionPlan({ brick: 'F06' }, before, hasContent).plan
    const lock = lockTheory(null, entry, before, hasContent)
    expect(lock).toEqual({ brickId: 'F06', review: false, note: null })

    const after = completeBrick(before, 'F06', day(4))
    const mid = resolveSessionPlan({ brick: 'F06' }, after, hasContent).plan
    expect(mid).toMatchObject({ brickId: 'F06', review: true })
    expect(lockTheory(lock, mid, after, hasContent)).toBe(lock)
  })

  it('đổi viên ("Học tiếp viên sau") → chốt mới theo kế hoạch', () => {
    const s = done(['F01', 'F02', 'F03'])
    const old = lockTheory(null, resolveSessionPlan({ brick: 'F03' }, done(['F01', 'F02']), hasContent).plan, s, hasContent)
    const next = lockTheory(old, resolveSessionPlan({ brick: 'F04' }, s, hasContent).plan, s, hasContent)
    expect(next).toEqual({ brickId: 'F04', review: false, note: null })
  })

  it('buổi bài hoặc không có viên → null', () => {
    const lessonPlan: SessionPlan = { mode: 'lesson', lesson: null, steps: LESSON_STEPS }
    expect(lockTheory(null, lessonPlan, empty(), hasContent)).toBeNull()
    expect(lockTheory(null, sessionPlan(empty(), none), empty(), none)).toBeNull()
  })

  it('vào buổi ôn → chốt review kèm lời mô tả', () => {
    let s = done(['F01', 'F02', 'F03', 'F04', 'F05', 'F06'])
    s = completeBrick(s, 'F04', day(5))
    expect(lockTheory(null, sessionPlan(s, hasContent), s, hasContent)).toEqual({
      brickId: 'F04',
      review: true,
      note: 'latest',
    })
  })
})

describe('reviewNote — lời mô tả chế độ ôn', () => {
  it('viên xong gần nhất → latest', () => {
    let s = done(['F01', 'F02', 'F03', 'F04', 'F05', 'F06'])
    s = completeBrick(s, 'F04', day(5))
    expect(reviewNote(s, 'F04', hasContent)).toBe('latest')
  })

  it('URL chốt viên đã học nhưng không phải gần nhất → done', () => {
    const s = done(['F01', 'F02', 'F03', 'F04', 'F05', 'F06'])
    expect(reviewNote(s, 'F02', hasContent)).toBe('done')
  })

  it('hàng qua bằng Soát vé, chưa học viên nào → tested (không nói "viên gần nhất")', () => {
    const s = passRows(['A'])
    const plan = sessionPlan(s, hasContent)
    expect(plan).toMatchObject({ brickId: 'F01', review: true })
    expect(lockTheory(null, plan, s, hasContent)).toEqual({ brickId: 'F01', review: true, note: 'tested' })
  })
})

describe('sessionWordList', () => {
  it('buổi Sân ga → ngsl; buổi bài theo chặng', () => {
    expect(sessionWordList(sessionPlan(done(['F01']), hasContent))).toBe('ngsl')
    const s = skipFoundation(empty(), day(1))
    expect(sessionWordList(sessionPlan(s, hasContent))).toBe('ngsl')
    expect(sessionWordList({ mode: 'lesson', lesson: null, steps: LESSON_STEPS })).toBe('tsl')
  })
})

describe('lazyFoundationBrick — ngày lười ở Sân ga (story 22)', () => {
  it('Ngày lười Sân ga: ôn — F01, F02 xong, F02 lastDoneAt muộn nhất → ôn nhanh F02', () => {
    const s = done(['F01', 'F02'])
    expect(lazyFoundationBrick(s, hasContent)).toEqual({ brickId: 'F02', mode: 'review' })
    // F01 học lại muộn hơn → F01.
    expect(lazyFoundationBrick(completeBrick(s, 'F01', day(3)), hasContent)).toEqual({ brickId: 'F01', mode: 'review' })
  })

  it('viên xong gần nhất chưa có nội dung bị bỏ qua', () => {
    const s = completeBrick(done(['F01']), 'F07', day(4))
    expect(lazyFoundationBrick(s, hasContent)).toEqual({ brickId: 'F01', mode: 'review' })
  })

  it('Ngày lười Sân ga: xem trước — chưa xong viên nào → xem trước F01, không ghi gì', () => {
    const s = empty()
    expect(lazyFoundationBrick(s, hasContent)).toEqual({ brickId: 'F01', mode: 'preview' })
    expect(s).toEqual(empty())
  })

  it('hàng A qua bằng Soát vé, F07+ đang soạn → ôn nhanh viên có nội dung đầu tiên của hàng đã xong (F01, viên đã qua)', () => {
    expect(lazyFoundationBrick(passRows(['A']), hasContent)).toEqual({ brickId: 'F01', mode: 'review' })
    // Giống thẻ Sân ga / buổi 30' ("Ôn lại: F01"), không gọi viên đã qua là "viên tiếp theo".
    expect(sessionPlan(passRows(['A']), hasContent)).toMatchObject({ brickId: 'F01', review: true })
  })

  it('không viên nào có nội dung → null (thẻ "đang soạn")', () => {
    expect(lazyFoundationBrick(empty(), none)).toBeNull()
    expect(lazyFoundationBrick(passRows(['A']), none)).toBeNull()
  })
})
