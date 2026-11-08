import { describe, expect, it } from 'vitest'

import { isQuizAttempt } from '@/lib/quiz'
import { computeStreak, localDayKey } from '@/lib/sessions'
import { mergeData } from '@/lib/sync/merge'
import type { Store } from '@/lib/storage'

import {
  comebackCount,
  dayNumber,
  housePoints,
  levelFor,
  longestStreak,
  markSeen,
  medalProgress,
  readSeen,
  unseenLevelUps,
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
