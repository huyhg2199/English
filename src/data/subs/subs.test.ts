import { describe, expect, it } from 'vitest'

import { allTenses } from '@/data/lessons'
import { LESSON_VIDEOS } from '@/data/videos'
import { isSubFile, type SubFile } from '@/lib/subs/types'

import { hasSubs, loadSubs, SUBTITLED_VIDEO_IDS } from './index'

const VOA = 'VOA Learning English'
const FILES = import.meta.glob<unknown>('./*.json', { eager: true, import: 'default' })
/** Caption gốc do scripts/subs/fetch-captions.mjs ghi (nếu có trong repo): sub phải giữ nguyên mốc và câu Anh. */
const RAW = import.meta.glob<{ cues: { start: number; end: number; en: string }[] }>('../../../scripts/subs/captions/*.json', {
  eager: true,
  import: 'default',
})
const rawFor = (id: string) => Object.entries(RAW).find(([p]) => p.endsWith(`/${id}.json`))?.[1]
const entries = Object.entries(FILES).map(([path, data]) => [path.replace(/^\.\/|\.json$/g, ''), data] as const)
const tenseIds = new Set(allTenses().map((t) => t.id))

describe('dữ liệu phụ đề song ngữ (story 16)', () => {
  it('danh sách video có sub khớp các file', () => {
    expect([...SUBTITLED_VIDEO_IDS].sort()).toEqual(entries.map(([id]) => id).sort())
    expect(hasSubs('khong-co')).toBe(false)
  })

  it.each(entries)('%s: chỉ cho video kênh VOA có trong dữ liệu story 15, ghi nguồn public domain', (id, data) => {
    expect(isSubFile(data), id).toBe(true)
    const file = data as SubFile
    expect(file.videoId).toBe(id)
    const videos = LESSON_VIDEOS.filter((v) => v.id === id)
    expect(videos.length, `${id} không có trong videos.json`).toBeGreaterThan(0)
    for (const v of videos) expect(v.channel).toBe(VOA)
    expect(file.source.channel).toBe(VOA)
    expect(file.source.license).toBe('public domain – VOA')
    expect(file.source.url).toBe(`https://www.youtube.com/watch?v=${id}`)
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

  it.each(entries)('%s: mốc thời gian và câu Anh lấy nguyên từ caption gốc (nếu có file caption)', (id, data) => {
    const raw = rawFor(id)
    if (!raw) return
    expect((data as SubFile).cues.map(({ start, end, en }) => ({ start, end, en }))).toEqual(raw.cues)
  })

  it('số file sub hiện có (đổi khi thêm / bớt file, để kiểm từng file ở trên không lặng lẽ chạy 0 lần)', () => {
    // Story 16: chưa lấy được caption VOA có mốc thời gian nên chưa có file nào (xem stack.md, "Phụ đề song ngữ").
    expect(entries.length).toBe(0)
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
