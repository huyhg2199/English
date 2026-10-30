import { describe, expect, it } from 'vitest'

import { allLessons } from '@/data/roadmap'
import type { Store } from '@/lib/storage'

import { computeRoadmapProgress, readCompletedLessonIds, setLessonCompleted } from './roadmap-progress'

const lessons = allLessons()
const store = (data: Record<string, unknown>): Store => ({ schemaVersion: 3, data })
const T = '2026-11-01T00:00:00.000Z'
const done = (updatedAt = T) => ({ done: true, updatedAt })
const undone = (updatedAt = T) => ({ done: false, updatedAt })
const NOW = new Date('2026-11-02T12:00:00.000Z')

describe('computeRoadmapProgress — I/O Matrix', () => {
  it('chưa học gì → không trạm nào sáng, trạm đầu tiên là "học tiếp"', () => {
    const result = computeRoadmapProgress(lessons, readCompletedLessonIds(store({})))
    expect(result.completed.size).toBe(0)
    expect(result.nextLessonId).toBe('s1-t1-w1')
  })

  it('đã qua vài trạm → các trạm đó sáng, "học tiếp" là bài chưa xong đầu tiên', () => {
    const result = computeRoadmapProgress(lessons, ['s1-t1-w1', 's1-t1-w2', 's1-t1-w4'])
    expect([...result.completed]).toEqual(['s1-t1-w1', 's1-t1-w2', 's1-t1-w4'])
    expect(result.nextLessonId).toBe('s1-t1-w3')
  })

  it('xong hết → không còn trạm "học tiếp"', () => {
    const result = computeRoadmapProgress(lessons, lessons.map((l) => l.id))
    expect(result.completed.size).toBe(48)
    expect(result.nextLessonId).toBeNull()
  })

  it('id lạ (bài đã bị xoá) → bỏ qua khi tính, không xoá khỏi store', () => {
    const s = store({ progress: { lessons: { 'old-lesson': done(), 's1-t1-w1': done() } } })
    const result = computeRoadmapProgress(lessons, readCompletedLessonIds(s))
    expect([...result.completed]).toEqual(['s1-t1-w1'])
    expect(result.nextLessonId).toBe('s1-t1-w2')

    const next = setLessonCompleted(s, 's1-t1-w2', true)
    expect(readCompletedLessonIds(next)).toEqual(['old-lesson', 's1-t1-w1', 's1-t1-w2'])
  })
})

describe('readCompletedLessonIds', () => {
  it.each([
    ['thiếu progress', {}],
    ['progress sai dạng', { progress: 'x' }],
    ['lessons không phải object', { progress: { lessons: ['a'] } }],
  ])('%s → mảng rỗng', (_, data) => {
    expect(readCompletedLessonIds(store(data))).toEqual([])
  })

  it('chỉ lấy bài done: true, bỏ mục sai dạng', () => {
    const lessonsData = {
      a: done(),
      b: undone(),
      c: { done: 'yes', updatedAt: T },
      d: { done: true },
      e: { done: true, updatedAt: 'không phải ngày' },
      f: null,
    }
    expect(readCompletedLessonIds(store({ progress: { lessons: lessonsData } }))).toEqual(['a'])
  })
})

describe('setLessonCompleted', () => {
  it('đánh dấu rồi bỏ đánh dấu ghi { done, updatedAt }, không sửa store cũ, giữ field khác', () => {
    const s0 = store({ streak: 3, progress: { lessons: {}, other: 1 } })
    const s1 = setLessonCompleted(s0, 's1-t1-w1', true, NOW)
    expect(readCompletedLessonIds(s0)).toEqual([])
    expect(s1.data).toEqual({
      streak: 3,
      progress: { lessons: { 's1-t1-w1': { done: true, updatedAt: NOW.toISOString() } }, other: 1 },
    })

    const later = new Date('2026-11-03T00:00:00.000Z')
    const s2 = setLessonCompleted(s1, 's1-t1-w1', false, later)
    // Bỏ đánh dấu là done: false, không xoá key.
    expect(s2.data).toEqual({
      streak: 3,
      progress: { lessons: { 's1-t1-w1': { done: false, updatedAt: later.toISOString() } }, other: 1 },
    })
  })

  it('không đổi gì thì trả về chính store đó', () => {
    const s = store({ progress: { lessons: { a: done(), b: undone() } } })
    expect(setLessonCompleted(s, 'a', true)).toBe(s)
    expect(setLessonCompleted(s, 'b', false)).toBe(s)
    expect(setLessonCompleted(s, 'never', false)).toBe(s)
  })

  it('giữ mục sai dạng và id lạ khi đánh dấu / bỏ đánh dấu bài khác', () => {
    const junk = { done: 'x' }
    const s0 = store({ progress: { lessons: { a: done(), junk, 'old-id': done() } } })
    const s1 = setLessonCompleted(s0, 'b', true, NOW)
    const s2 = setLessonCompleted(s1, 'a', false, NOW)
    expect(s2.data.progress).toEqual({
      lessons: {
        a: { done: false, updatedAt: NOW.toISOString() },
        junk,
        'old-id': done(),
        b: { done: true, updatedAt: NOW.toISOString() },
      },
    })
  })

  it('đánh dấu lại bài có mục sai dạng → ghi đè bằng mục hợp lệ', () => {
    const s = store({ progress: { lessons: { a: { done: 'x' } } } })
    expect(setLessonCompleted(s, 'a', true, NOW).data.progress).toEqual({
      lessons: { a: { done: true, updatedAt: NOW.toISOString() } },
    })
  })

  it('đồng hồ máy lùi: updatedAt mới = updatedAt cũ + 1ms, không lùi', () => {
    const future = '2027-01-01T00:00:00.000Z'
    const s = store({ progress: { lessons: { a: done(future) } } })
    const next = setLessonCompleted(s, 'a', false, NOW)
    expect(next.data.progress).toEqual({ lessons: { a: { done: false, updatedAt: '2027-01-01T00:00:00.001Z' } } })
    // Lần sửa tiếp theo vẫn tăng tiếp
    const again = setLessonCompleted(next, 'a', true, NOW)
    expect(again.data.progress).toEqual({ lessons: { a: { done: true, updatedAt: '2027-01-01T00:00:00.002Z' } } })
  })

  it('giờ máy lớn hơn updatedAt cũ → dùng giờ máy', () => {
    const s = store({ progress: { lessons: { a: done('1970-01-01T00:00:00.000Z') } } })
    expect(setLessonCompleted(s, 'a', false, NOW).data.progress).toEqual({
      lessons: { a: { done: false, updatedAt: NOW.toISOString() } },
    })
  })

  it('store chưa có progress (v3 mới tạo) → tạo progress.lessons', () => {
    expect(setLessonCompleted(store({}), 'a', true, NOW).data).toEqual({
      progress: { lessons: { a: { done: true, updatedAt: NOW.toISOString() } } },
    })
  })
})
