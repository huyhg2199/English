import { describe, expect, it } from 'vitest'

import { allLessons } from '@/data/roadmap'
import type { Store } from '@/lib/storage'

import { computeRoadmapProgress, readCompletedLessonIds, setLessonCompleted } from './roadmap-progress'

const lessons = allLessons()
const store = (data: Record<string, unknown>): Store => ({ schemaVersion: 2, data })

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
    const s = store({ progress: { completedLessonIds: ['old-lesson', 's1-t1-w1'] } })
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
    ['completedLessonIds không phải mảng', { progress: { completedLessonIds: 'a' } }],
  ])('%s → mảng rỗng', (_, data) => {
    expect(readCompletedLessonIds(store(data))).toEqual([])
  })

  it('bỏ phần tử không phải chuỗi', () => {
    expect(readCompletedLessonIds(store({ progress: { completedLessonIds: ['a', 1, null] } }))).toEqual(['a'])
  })
})

describe('setLessonCompleted', () => {
  it('đánh dấu rồi bỏ đánh dấu, không sửa store cũ, giữ field khác', () => {
    const s0 = store({ streak: 3, progress: { completedLessonIds: [], other: 1 } })
    const s1 = setLessonCompleted(s0, 's1-t1-w1', true)
    expect(readCompletedLessonIds(s0)).toEqual([])
    expect(s1.data).toEqual({ streak: 3, progress: { completedLessonIds: ['s1-t1-w1'], other: 1 } })

    const s2 = setLessonCompleted(s1, 's1-t1-w1', false)
    expect(s2.data).toEqual({ streak: 3, progress: { completedLessonIds: [], other: 1 } })
  })

  it('không đổi gì thì trả về chính store đó', () => {
    const s = store({ progress: { completedLessonIds: ['a'] } })
    expect(setLessonCompleted(s, 'a', true)).toBe(s)
    expect(setLessonCompleted(s, 'b', false)).toBe(s)
  })

  it('giữ phần tử không phải chuỗi trong mảng gốc khi đánh dấu / bỏ đánh dấu', () => {
    const s0 = store({ progress: { completedLessonIds: ['a', 1, null, { x: 1 }] } })
    const s1 = setLessonCompleted(s0, 'b', true)
    expect(s1.data.progress).toEqual({ completedLessonIds: ['a', 1, null, { x: 1 }, 'b'] })
    const s2 = setLessonCompleted(s1, 'a', false)
    expect(s2.data.progress).toEqual({ completedLessonIds: [1, null, { x: 1 }, 'b'] })
  })

  it('store chưa có progress (v2 mới tạo) → tạo progress', () => {
    expect(setLessonCompleted(store({}), 'a', true).data).toEqual({ progress: { completedLessonIds: ['a'] } })
  })
})
