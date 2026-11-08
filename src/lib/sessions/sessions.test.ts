import { describe, expect, it } from 'vitest'

import { allLessons } from '@/data/roadmap'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import type { Store } from '@/lib/storage'

import {
  computeStreak,
  formatClock,
  isSessionDay,
  localDayKey,
  newWordListFor,
  readSessionDays,
  recordSession,
  resolveSessionLesson,
  remainingSeconds,
  SESSION_MINUTES,
  sessionLesson,
  todaySession,
  wordListForLesson,
} from './index'

// Giờ máy (local).
const NOW = new Date(2026, 10, 5, 21, 30)
const day = (offset: number, h = 12) => new Date(2026, 10, 5 + offset, h)
const store = (data: Record<string, unknown> = {}): Store => ({ schemaVersion: 5, data })

function withDays(...offsets: number[]): Record<string, unknown> {
  let s = store()
  for (const o of offsets) s = recordSession(s, o % 2 === 0 ? 'full' : 'lazy', day(o))
  return readSessionDays(s)
}

describe('localDayKey', () => {
  it('YYYY-MM-DD theo giờ máy, có số 0 đầu', () => {
    expect(localDayKey(new Date(2027, 0, 3, 23, 59))).toBe('2027-01-03')
    expect(localDayKey(new Date(2026, 10, 5, 0, 0))).toBe('2026-11-05')
  })
})

describe('recordSession — I/O Matrix', () => {
  it('buổi chuẩn → full, 25 phút, kèm bài', () => {
    const s = recordSession(store(), 'full', NOW, { lessonId: 's1-t1-w1' })
    expect(todaySession(s, NOW)).toEqual({
      kind: 'full',
      completedAt: NOW.toISOString(),
      minutes: 25,
      lessonId: 's1-t1-w1',
      updatedAt: NOW.toISOString(),
    })
    expect(SESSION_MINUTES).toEqual({ full: 25, lazy: 10 })
  })

  it('buổi lười → lazy, 10 phút, không có lessonId', () => {
    const entry = todaySession(recordSession(store(), 'lazy', NOW), NOW)
    expect(entry).toMatchObject({ kind: 'lazy', minutes: 10 })
    expect(entry && 'lessonId' in entry).toBe(false)
  })

  it('lười rồi học chuẩn → hôm nay thành full, updatedAt mới hơn', () => {
    const lazy = recordSession(store(), 'lazy', day(0, 8))
    const full = recordSession(lazy, 'full', day(0, 8))
    expect(todaySession(full, NOW)?.kind).toBe('full')
    expect(Date.parse(todaySession(full, NOW)!.updatedAt)).toBeGreaterThan(
      Date.parse(todaySession(lazy, NOW)!.updatedAt),
    )
  })

  it('chuẩn rồi lười → giữ full (trả về đúng store cũ)', () => {
    const full = recordSession(store(), 'full', day(0, 8))
    expect(recordSession(full, 'lazy', NOW)).toBe(full)
  })

  it('không sửa store cũ, giữ ngày khác, mục sai dạng và field khác', () => {
    const base = store({ sessions: { days: { '2020-01-01': 'junk' }, x: 1 }, other: 2 })
    const next = recordSession(base, 'full', NOW)
    expect(base.data.sessions).toEqual({ days: { '2020-01-01': 'junk' }, x: 1 })
    expect(next.data.other).toBe(2)
    expect(next.data.sessions).toMatchObject({ x: 1, days: { '2020-01-01': 'junk' } })
  })

  it('sessions thiếu / sai dạng → tạo mới', () => {
    expect(isSessionDay(todaySession(recordSession(store({ sessions: 'x' }), 'lazy', NOW), NOW))).toBe(true)
  })
})

describe('computeStreak — I/O Matrix', () => {
  it('có buổi hôm qua, hôm kia; hôm nay chưa → 2', () => {
    expect(computeStreak(withDays(-1, -2), NOW)).toBe(2)
  })

  it('hôm qua không có buổi → 1 nếu hôm nay đã học, 0 nếu chưa', () => {
    expect(computeStreak(withDays(0, -2, -3), NOW)).toBe(1)
    expect(computeStreak(withDays(-2, -3), NOW)).toBe(0)
  })

  it('ngày lười giữ streak (chuỗi xen full / lazy)', () => {
    expect(computeStreak(withDays(0, -1, -2, -3), NOW)).toBe(4)
  })

  it('mục sai dạng không tính', () => {
    const days = { ...withDays(0), [localDayKey(day(-1))]: { kind: 'full' } }
    expect(computeStreak(days, NOW)).toBe(1)
  })

  it('không có gì → 0', () => {
    expect(computeStreak({}, NOW)).toBe(0)
  })

  it('qua tháng / năm vẫn liên tục', () => {
    const jan1 = new Date(2027, 0, 1, 9)
    let s = store()
    s = recordSession(s, 'full', new Date(2026, 11, 30, 9))
    s = recordSession(s, 'lazy', new Date(2026, 11, 31, 9))
    s = recordSession(s, 'full', jan1)
    expect(computeStreak(readSessionDays(s), jan1)).toBe(3)
  })
})

describe('sessionLesson / newWordListFor', () => {
  const lessons = allLessons()
  function doneUntil(id: string): Store {
    let s = store()
    for (const l of lessons) {
      if (l.id === id) break
      s = setLessonCompleted(s, l.id, true, NOW)
    }
    return s
  }

  it('chưa học gì → bài đầu, chặng 1 → NGSL trước', () => {
    expect(sessionLesson(store())?.lesson.id).toBe('s1-t1-w1')
    expect(newWordListFor(store())).toBe('ngsl')
  })

  it('bài hiện tại s2-* → TSL trước', () => {
    const firstS2 = lessons.find((l) => l.id.startsWith('s2-'))!.id
    const s = doneUntil(firstS2)
    expect(sessionLesson(s)?.lesson.id).toBe(firstS2)
    expect(newWordListFor(s)).toBe('tsl')
  })

  it('resolveSessionLesson: id hợp lệ → bài đó (kể cả đã xong); thiếu / sai → fallback', () => {
    const fallback = sessionLesson(store())
    const s2 = lessons.find((l) => l.id.startsWith('s2-'))!.id
    const locked = resolveSessionLesson(s2, fallback)
    expect(locked?.lesson.id).toBe(s2)
    expect(wordListForLesson(locked)).toBe('tsl')
    expect(resolveSessionLesson(null, fallback)).toBe(fallback)
    expect(resolveSessionLesson('nope', null)).toBeNull()
    expect(wordListForLesson(fallback)).toBe('ngsl')
  })

  it('xong cả lộ trình → null, vẫn TSL trước', () => {
    let s = store()
    for (const l of lessons) s = setLessonCompleted(s, l.id, true, NOW)
    expect(sessionLesson(s)).toBeNull()
    expect(newWordListFor(s)).toBe('tsl')
  })
})

describe('đồng hồ gợi ý', () => {
  const start = new Date(2026, 10, 5, 9, 0, 0)
  it('remainingSeconds đếm ngược, không âm', () => {
    expect(remainingSeconds(start, 5, start)).toBe(300)
    expect(remainingSeconds(start, 5, new Date(start.getTime() + 61_500))).toBe(239)
    expect(remainingSeconds(start, 5, new Date(start.getTime() + 10 * 60_000))).toBe(0)
  })
  it('formatClock m:ss', () => {
    expect(formatClock(300)).toBe('5:00')
    expect(formatClock(9)).toBe('0:09')
    expect(formatClock(-3)).toBe('0:00')
  })
})

describe('lessonId dạng fNN (buổi Sân ga, story 21)', () => {
  it('recordSession full lessonId f03 → mục hợp lệ, 25 phút, giữ streak', () => {
    let s = recordSession(store(), 'full', day(-1), { lessonId: 'f02' })
    s = recordSession(s, 'full', NOW, { lessonId: 'f03' })
    const entry = todaySession(s, NOW)
    expect(entry).toMatchObject({ kind: 'full', minutes: 25, lessonId: 'f03' })
    expect(isSessionDay(entry)).toBe(true)
    expect(computeStreak(readSessionDays(s), NOW)).toBe(2)
  })

  it('resolveSessionLesson("f03", fb) → fb (không phải bài trên lộ trình)', () => {
    const fb = sessionLesson(store())
    expect(resolveSessionLesson('f03', fb)).toBe(fb)
    expect(resolveSessionLesson('F03', null)).toBeNull()
  })
})
