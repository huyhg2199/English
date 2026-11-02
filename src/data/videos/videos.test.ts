import { describe, expect, it } from 'vitest'

import { LESSON_CONTENTS } from '@/data/lessons'
import { getLesson, STAGES } from '@/data/roadmap'

import { embedUrl, funStepVideos, LESSON_VIDEOS, thumbnailUrl, videosFor, watchUrl } from './index'

/** Kênh miễn phí, uy tín trong `nguon-hoc-mien-phi.md`. */
const CHANNELS = ['VOA Learning English', 'BBC Learning English', "Rachel's English", 'TED-Ed']

describe('dữ liệu video bài học', () => {
  it('mỗi video: id 11 ký tự, có tiêu đề và kênh uy tín, startSec (nếu có) là số giây ≥ 0', () => {
    expect(LESSON_VIDEOS.length).toBeGreaterThan(0)
    for (const v of LESSON_VIDEOS) {
      expect(v.id).toMatch(/^[A-Za-z0-9_-]{11}$/)
      expect(v.title.trim()).not.toBe('')
      expect(CHANNELS).toContain(v.channel)
      if (v.startSec !== undefined) {
        expect(Number.isInteger(v.startSec)).toBe(true)
        expect(v.startSec).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('bài và đoạn được gắn đều tồn tại', () => {
    for (const v of LESSON_VIDEOS) {
      const lesson = getLesson(v.lessonId)
      expect(lesson, v.lessonId).toBeDefined()
      expect(lesson!.sections.map((s) => s.id), `${v.lessonId}/${v.sectionId}`).toContain(v.sectionId)
    }
  })

  it('mỗi bài chặng 1 có nội dung (trừ tuần Tết) có 1–2 video', () => {
    const stage1 = STAGES.find((s) => s.id === 's1')!
    const stage1Ids = stage1.months.flatMap((m) => m.lessons.map((l) => l.id))
    const lazyIds = new Set(LESSON_CONTENTS.filter((c) => c.lazyWeek).map((c) => c.lessonId))
    const contentIds = new Set(LESSON_CONTENTS.map((c) => c.lessonId))
    const lessons = stage1Ids.filter((id) => contentIds.has(id) && !lazyIds.has(id))
    expect(lessons.length).toBeGreaterThan(0)
    for (const id of lessons) {
      expect(videosFor(id).length, id).toBeGreaterThanOrEqual(1)
      expect(videosFor(id).length, id).toBeLessThanOrEqual(2)
    }
  })

  it('không bài nào có quá 2 video', () => {
    for (const lessonId of new Set(LESSON_VIDEOS.map((v) => v.lessonId))) {
      expect(videosFor(lessonId).length, lessonId).toBeLessThanOrEqual(2)
    }
  })

  it('không trùng id trong cùng bài', () => {
    const lessonIds = new Set(LESSON_VIDEOS.map((v) => v.lessonId))
    for (const lessonId of lessonIds) {
      const ids = videosFor(lessonId).map((v) => v.id)
      expect(new Set(ids).size, lessonId).toBe(ids.length)
    }
  })
})

describe('videosFor', () => {
  it('lọc theo bài, và theo đoạn khi có sectionId', () => {
    const all = videosFor('s1-t1-w1')
    expect(all.every((v) => v.lessonId === 's1-t1-w1')).toBe(true)
    expect(videosFor('s1-t1-w1', 'pronunciation').every((v) => v.sectionId === 'pronunciation')).toBe(true)
    expect(videosFor('s1-t1-w1', 'vocabulary')).toEqual([])
    expect(videosFor('khong-co')).toEqual([])
  })
})

describe('funStepVideos', () => {
  it('bài có video đoạn giải trí → trả đúng video đó; không có bài hay không có video → rỗng', () => {
    const v = LESSON_VIDEOS.find((x) => x.sectionId === 'entertainment')!
    expect(funStepVideos(getLesson(v.lessonId))).toContainEqual(v)
    expect(funStepVideos(getLesson(v.lessonId)).every((x) => x.sectionId === 'entertainment')).toBe(true)
    expect(funStepVideos(getLesson('s1-t1-w1'))).toEqual([])
    expect(funStepVideos(null)).toEqual([])
    expect(funStepVideos(undefined)).toEqual([])
  })
})

describe('URL video', () => {
  it('embed dùng youtube-nocookie, có start khi có mốc bắt đầu', () => {
    expect(embedUrl({ id: 'WR9_nsLyaEY' })).toBe(
      'https://www.youtube-nocookie.com/embed/WR9_nsLyaEY?autoplay=1&playsinline=1&rel=0',
    )
    const url = new URL(embedUrl({ id: 'WR9_nsLyaEY', startSec: 45 }))
    expect(url.origin).toBe('https://www.youtube-nocookie.com')
    expect(url.searchParams.get('start')).toBe('45')
  })

  it('link YouTube và thumbnail', () => {
    expect(watchUrl({ id: 'WR9_nsLyaEY' })).toBe('https://www.youtube.com/watch?v=WR9_nsLyaEY')
    expect(watchUrl({ id: 'WR9_nsLyaEY', startSec: 45 })).toBe('https://www.youtube.com/watch?v=WR9_nsLyaEY&t=45s')
    expect(thumbnailUrl({ id: 'WR9_nsLyaEY' })).toBe('https://i.ytimg.com/vi/WR9_nsLyaEY/hqdefault.jpg')
  })
})
