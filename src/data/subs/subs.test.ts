import { describe, expect, it } from 'vitest'

import { allTenses } from '@/data/lessons'
import { FOUNDATION_FUN_VIDEOS, LESSON_VIDEOS, type Video } from '@/data/videos'
import { isSubFile, type SubFile } from '@/lib/subs/types'

import { canStoreTranscript, transcriptSource, type TranscriptSource } from '../../../scripts/subs/parse.mjs'

import { hasSubs, loadSubs, SUBTITLED_VIDEO_IDS } from './index'

const VOA = 'VOA Learning English'
const FILES = import.meta.glob<unknown>('./*.json', { eager: true, import: 'default' })
/** Caption gốc do scripts/subs/fetch-captions.mjs ghi (commit trong repo): sub phải giữ nguyên mốc và câu Anh. */
type RawCaption = { videoId: string; title: string; source: TranscriptSource; cues: { start: number; end: number; en: string }[] }
const RAW = import.meta.glob<RawCaption>('../../../scripts/subs/captions/*.json', { eager: true, import: 'default' })
const rawEntries = Object.entries(RAW).map(([path, data]) => [path.replace(/^.*\/|\.json$/g, ''), data] as const)
const rawFor = (id: string) => rawEntries.find(([rid]) => rid === id)?.[1]
const entries = Object.entries(FILES).map(([path, data]) => [path.replace(/^\.\/|\.json$/g, ''), data] as const)
const tenseIds = new Set(allTenses().map((t) => t.id))
/** Mọi video trong app (bài học story 15 + giải trí Sân ga story 21). */
const ALL_VIDEOS: readonly Video[] = [...LESSON_VIDEOS, ...FOUNDATION_FUN_VIDEOS]
const videosWith = (id: string) => ALL_VIDEOS.filter((v) => v.id === id)

describe('dữ liệu phụ đề song ngữ (story 16)', () => {
  it('danh sách video có sub khớp các file', () => {
    expect([...SUBTITLED_VIDEO_IDS].sort()).toEqual(entries.map(([id]) => id).sort())
    expect(hasSubs('khong-co')).toBe(false)
  })

  it.each(entries)('%s: chỉ cho video VOA public domain hoặc CC BY có trong dữ liệu video, ghi đúng nguồn', (id, data) => {
    expect(isSubFile(data), id).toBe(true)
    const file = data as SubFile
    expect(file.videoId).toBe(id)
    const videos = videosWith(id)
    expect(videos.length, `${id} không có trong videos.json / foundation-videos.json`).toBeGreaterThan(0)
    for (const v of videos) expect(canStoreTranscript(v), `${id}: kênh "${v.channel}" giấy phép "${v.license}"`).toBe(true)
    // Nguồn ghi đúng như script làm (kênh, link kênh, link video, giấy phép + link, ghi chú bản dịch, loại caption).
    expect(file.source).toEqual(transcriptSource(videos[0], file.source.captionKind))
  })

  it.each(entries)('%s: cue tăng dần, không chồng nhau, có cả en và vi; chú thích nằm trong câu; thì có thật', (id, data) => {
    const { cues } = data as SubFile
    expect(cues.length).toBeGreaterThan(0)
    cues.forEach((c, i) => {
      expect(c.end, `${id}#${i}`).toBeGreaterThan(c.start)
      if (i > 0) expect(c.start, `${id}#${i}`).toBeGreaterThanOrEqual(cues[i - 1].end)
      expect(c.en.trim()).not.toBe('')
      expect(c.vi.trim()).not.toBe('')
      for (const n of c.notes ?? []) expect(c.en.toLowerCase(), `${id}#${i} "${n.term}"`).toContain(n.term.toLowerCase())
      for (const h of c.highlight ?? []) expect(tenseIds, `${id}#${i}`).toContain(h)
    })
  })

  it.each(entries)('%s: có file caption gốc; mốc thời gian và câu Anh lấy nguyên từ đó', (id, data) => {
    const raw = rawFor(id)
    expect(raw, `thiếu scripts/subs/captions/${id}.json`).toBeDefined()
    expect((data as SubFile).cues.map(({ start, end, en }) => ({ start, end, en }))).toEqual(raw!.cues)
  })

  it('có file caption gốc và file sub trong repo (để các kiểm tra từng file không lặng lẽ chạy 0 lần)', () => {
    // 2026-11-10: 7 video CC BY trong bài đều có caption do kênh đăng và file sub tiếng Việt.
    expect(rawEntries.length).toBeGreaterThanOrEqual(7)
    expect(entries.length).toBeGreaterThanOrEqual(7)
  })

  it('mọi video CC BY đều có file sub (video CC BY chỉ được thêm khi đã có caption do kênh đăng và bản dịch)', () => {
    const ccBy = ALL_VIDEOS.filter((v) => v.license === 'cc-by')
    expect(ccBy.length).toBeGreaterThan(0)
    for (const v of ccBy) expect(hasSubs(v.id), v.id).toBe(true)
  })

  it.each(rawEntries)('caption %s: video VOA / CC BY có trong dữ liệu, nguồn đúng, cue tăng dần không chồng nhau', (id, raw) => {
    expect(raw.videoId).toBe(id)
    const videos = videosWith(id)
    expect(videos.length, `${id} không có trong dữ liệu video`).toBeGreaterThan(0)
    for (const v of videos) expect(canStoreTranscript(v), id).toBe(true)
    expect(raw.source).toEqual(transcriptSource(videos[0], raw.source.captionKind))
    expect(raw.cues.length).toBeGreaterThan(0)
    raw.cues.forEach((c, i) => {
      expect(c.end, `${id}#${i}`).toBeGreaterThan(c.start)
      if (i > 0) expect(c.start, `${id}#${i}`).toBeGreaterThanOrEqual(raw.cues[i - 1].end)
      expect(c.en.trim(), `${id}#${i}`).not.toBe('')
      expect(c.en, `${id}#${i}`).not.toMatch(/&[a-z#0-9]+;/i)
    })
  })

  it('video không có sub → loadSubs reject (player giữ như story 15)', async () => {
    await expect(loadSubs('khong-co')).rejects.toThrow()
  })

  describe('loadSubs với file mẫu', () => {
    const fixture: SubFile = {
      videoId: 'WR9_nsLyaEY',
      source: { channel: VOA, url: 'https://www.youtube.com/watch?v=WR9_nsLyaEY', license: 'public domain – VOA', captionKind: 'uploaded' },
      cues: [{ start: 1, end: 3, en: "I'm gonna go.", vi: 'Tôi sẽ đi.', notes: [{ term: 'gonna', kind: 'reduction', noteVi: 'going to' }] }],
    }
    const files = (data: unknown) => ({ './WR9_nsLyaEY.json': async () => ({ default: data }) })

    it('file hợp lệ → trả về đúng file', async () => {
      await expect(loadSubs('WR9_nsLyaEY', files(fixture))).resolves.toEqual(fixture)
    })

    it('videoId trong file khác tên file → reject', async () => {
      await expect(loadSubs('WR9_nsLyaEY', files({ ...fixture, videoId: 'B5hSjY4-bAw' }))).rejects.toThrow()
    })

    it('file sai cấu trúc hoặc tải lỗi (offline) → reject', async () => {
      await expect(loadSubs('WR9_nsLyaEY', files({ ...fixture, cues: [{ start: 3, end: 1, en: 'x', vi: 'y' }] }))).rejects.toThrow()
      await expect(loadSubs('WR9_nsLyaEY', files(null))).rejects.toThrow()
      const offline = { './WR9_nsLyaEY.json': () => Promise.reject(new Error('offline')) }
      await expect(loadSubs('WR9_nsLyaEY', offline)).rejects.toThrow()
    })
  })
})
