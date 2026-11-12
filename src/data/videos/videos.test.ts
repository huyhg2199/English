import { describe, expect, it } from 'vitest'

import { LESSON_CONTENTS } from '@/data/lessons'
import { allLessons, FOUNDATION_FUN_LINKS, getLesson, STAGES } from '@/data/roadmap'

import { CC_BY_LICENSE_URL } from '../../../scripts/subs/parse.mjs'

import {
  CC_BY_URL,
  embedUrl,
  FOUNDATION_FUN_VIDEOS,
  foundationFunVideos,
  funStepVideos,
  LESSON_VIDEOS,
  thumbnailUrl,
  VIDEO_LICENSES,
  videosFor,
  watchUrl,
  type Video,
} from './index'

/** Kênh miễn phí, uy tín trong `nguon-hoc-mien-phi.md`, theo giấy phép của kênh. */
const PUBLIC_DOMAIN_CHANNELS = ['VOA Learning English']
/** Kênh có bản quyền (giấy phép chuẩn YouTube): chỉ nhúng, không lưu transcript. */
const STANDARD_CHANNELS = ['BBC Learning English', "Rachel's English", 'TED-Ed']
/** Kênh có video CC BY đã kiểm tay (giấy phép, caption do kênh đăng, không phải bản đăng lại), story 16 (2026-11-10). */
const CC_BY_CHANNELS = ['GrammarBank', 'pascualbravovirtual', 'English Moment', 'Englishing', 'English Lessons with Kate']

const ALL_VIDEOS: readonly Video[] = [...LESSON_VIDEOS, ...FOUNDATION_FUN_VIDEOS]

describe('dữ liệu video', () => {
  it('mỗi video: id 11 ký tự, có tiêu đề, startSec (nếu có) là số giây ≥ 0', () => {
    expect(LESSON_VIDEOS.length).toBeGreaterThan(0)
    for (const v of ALL_VIDEOS) {
      expect(v.id).toMatch(/^[A-Za-z0-9_-]{11}$/)
      expect(v.title.trim()).not.toBe('')
      if (v.startSec !== undefined) {
        expect(Number.isInteger(v.startSec)).toBe(true)
        expect(v.startSec).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('giấy phép khớp kênh: VOA public domain; BBC, Rachel, TED-Ed giấy phép chuẩn; CC BY chỉ từ kênh đã kiểm, có link kênh', () => {
    for (const v of ALL_VIDEOS) {
      expect(VIDEO_LICENSES, v.id).toContain(v.license)
      if (v.license === 'public-domain') expect(PUBLIC_DOMAIN_CHANNELS, v.id).toContain(v.channel)
      if (v.license === 'youtube-standard') expect(STANDARD_CHANNELS, v.id).toContain(v.channel)
      if (v.license === 'cc-by') {
        expect(CC_BY_CHANNELS, v.id).toContain(v.channel)
        expect(v.channelUrl, v.id).toMatch(/^https:\/\/www\.youtube\.com\/channel\/UC[A-Za-z0-9_-]{22}$/)
      } else {
        expect(v.channelUrl, v.id).toBeUndefined()
      }
    }
  })

  it('một kênh chỉ có một loại giấy phép (không trộn video có bản quyền với CC BY của cùng kênh)', () => {
    const byChannel = new Map<string, Set<string>>()
    for (const v of ALL_VIDEOS) byChannel.set(v.channel, (byChannel.get(v.channel) ?? new Set()).add(v.license))
    for (const [channel, licenses] of byChannel) expect(licenses.size, channel).toBe(1)
  })

  it('link giấy phép CC BY trong app và trong script phụ đề là một', () => {
    expect(CC_BY_URL).toBe(CC_BY_LICENSE_URL)
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

  it('story 39: video will hay going to ở đoạn Ngữ pháp s1-t3-w2 (sau bài going to); video nối âm sang ôn tổng s1-t4-w4', () => {
    const ids = (xs: readonly { id: string }[]) => xs.map((v) => v.id)
    expect(ids(videosFor('s1-t3-w2', 'grammar'))).toEqual(['begKNGxcjdk'])
    expect(ids(videosFor('s1-t3-w2'))).toEqual(['begKNGxcjdk', 'UkBzUmRhs6w'])
    expect(ids(videosFor('s1-t3-w1'))).toEqual(['psI7E_J1zPo'])
    expect(ids(videosFor('s1-t4-w4', 'pronunciation'))).toEqual(['sAumTZ1lkZE', 'mV_CEIroJs8'])
  })

  it('story 47: "My Weekend" (động từ bất quy tắc) chuyển sang đoạn giải trí s1-t2-w4; s1-t2-w2 còn 1 video', () => {
    const ids = (xs: readonly { id: string }[]) => xs.map((v) => v.id)
    expect(ids(videosFor('s1-t2-w2'))).toEqual(['RGFc-1uNHX8'])
    expect(ids(videosFor('s1-t2-w2', 'entertainment'))).toEqual([])
    expect(ids(videosFor('s1-t2-w4'))).toEqual(['4cU9fqpCqBA', 'n7RA6XxfpNU'])
    expect(ids(videosFor('s1-t2-w4', 'entertainment'))).toEqual(['n7RA6XxfpNU'])
  })

  it('mục trong videos.json xếp theo thứ tự bài', () => {
    const order = new Map(allLessons().map((l, i) => [l.id, i]))
    const idx = LESSON_VIDEOS.map((v) => order.get(v.lessonId) ?? -1)
    expect(idx.every((n) => n >= 0)).toBe(true)
    expect(idx).toEqual([...idx].sort((a, b) => a - b))
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

  it('video có phụ đề: bật enablejsapi kèm origin của app (story 16)', () => {
    const url = new URL(embedUrl({ id: 'WR9_nsLyaEY' }, { jsapiOrigin: 'https://huy.github.io' }))
    expect(url.origin).toBe('https://www.youtube-nocookie.com')
    expect(url.searchParams.get('enablejsapi')).toBe('1')
    expect(url.searchParams.get('origin')).toBe('https://huy.github.io')
    expect(new URL(embedUrl({ id: 'WR9_nsLyaEY' })).searchParams.has('enablejsapi')).toBe(false)
  })

  it('link YouTube và thumbnail', () => {
    expect(watchUrl({ id: 'WR9_nsLyaEY' })).toBe('https://www.youtube.com/watch?v=WR9_nsLyaEY')
    expect(watchUrl({ id: 'WR9_nsLyaEY', startSec: 45 })).toBe('https://www.youtube.com/watch?v=WR9_nsLyaEY&t=45s')
    expect(thumbnailUrl({ id: 'WR9_nsLyaEY' })).toBe('https://i.ytimg.com/vi/WR9_nsLyaEY/hqdefault.jpg')
  })
})

describe('giải trí nhẹ của buổi Sân ga (story 21)', () => {
  it("VOA Let's Learn English Lesson 1, 2 theo thứ tự, kênh VOA, public domain", () => {
    expect(foundationFunVideos().map((v) => v.id)).toEqual(['WR9_nsLyaEY', '1-U7o9xjWQc'])
    for (const v of foundationFunVideos()) {
      expect(v.channel).toBe('VOA Learning English')
      expect(v.license).toBe('public-domain')
      expect(v.title).toMatch(/Let's Learn English/)
    }
  })

  it('không gắn bài nào và không trùng nhau', () => {
    const ids = foundationFunVideos().map((v) => v.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const v of foundationFunVideos()) expect(v).not.toHaveProperty('lessonId')
  })

  it('FOUNDATION_FUN_LINKS là VOA Learning English', () => {
    expect(FOUNDATION_FUN_LINKS).toEqual([{ name: 'VOA Learning English', url: 'https://learningenglish.voanews.com/' }])
  })
})
