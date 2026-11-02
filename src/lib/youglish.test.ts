import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LESSON_CONTENTS } from '@/data/lessons'

import {
  YOUGLISH_COMPONENTS,
  YOUGLISH_LOAD_TIMEOUT_MS,
  YOUGLISH_SCRIPT_URL,
  youglishFetchArgs,
  youglishPageUrl,
  youglishPhraseFromUrl,
  youglishWidgetOptions,
} from './youglish'

describe('youglish', () => {
  it('link trang: mã hoá cụm, tiếng Anh giọng Mỹ', () => {
    expect(youglishPageUrl("I'd like")).toBe("https://youglish.com/pronounce/I'd%20like/english/us")
    expect(youglishPageUrl('gonna')).toBe('https://youglish.com/pronounce/gonna/english/us')
  })

  it('lấy lại cụm từ link (khứ hồi với youglishPageUrl), link lạ → null', () => {
    for (const phrase of ['gonna', "I'd like", 'have been', "you'll"]) {
      expect(youglishPhraseFromUrl(youglishPageUrl(phrase))).toBe(phrase)
    }
    expect(youglishPhraseFromUrl('https://youglish.com/')).toBeNull()
    expect(youglishPhraseFromUrl('https://example.com/pronounce/gonna/english/us')).toBeNull()
    expect(youglishPhraseFromUrl('https://youglish.com/pronounce/%E0%A4%A/english/us')).toBeNull()
  })

  it('tham số fetch: cụm đã cắt khoảng trắng, english, us', () => {
    expect(youglishFetchArgs('  gonna ')).toEqual(['gonna', 'english', 'us'])
  })

  it('tuỳ chọn widget: tiêu đề + phụ đề + tốc độ + nút, không ô tìm kiếm; giữ nguyên events', () => {
    const onError = () => {}
    const opts = youglishWidgetOptions({ onError })
    const c = YOUGLISH_COMPONENTS
    expect(opts.components).toBe(c.title + c.caption + c.speed + c.controls)
    expect(opts.components & 1).toBe(0)
    expect(opts.events.onError).toBe(onError)
  })
})

describe('link YouGlish trong dữ liệu bài', () => {
  it('mọi link rút gọn / câu thoại YouGlish đều lấy lại được cụm từ để nhúng widget', () => {
    const urls: string[] = []
    for (const c of LESSON_CONTENTS) {
      for (const b of c.pronunciation?.blocks ?? []) {
        if (b.kind === 'reductions') urls.push(...b.items.map((it) => it.youglishUrl))
      }
      for (const t of c.grammar?.tenses ?? []) {
        for (const d of t.dialogues) if (d.kind === 'youglish') urls.push(d.sourceUrl)
      }
    }
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) expect(youglishPhraseFromUrl(url), url).not.toBeNull()
  })
})

type FakeScript = {
  src: string
  async: boolean
  onload: (() => void) | null
  onerror: (() => void) | null
  remove: ReturnType<typeof vi.fn>
}

describe('loadYouglish', () => {
  let win: { YG?: unknown; onYouglishAPIReady?: () => void }
  let scripts: FakeScript[]
  let load: typeof import('./youglish').loadYouglish
  const fakeYG = { Widget: function Widget() {} }

  beforeEach(async () => {
    vi.useFakeTimers()
    win = {}
    scripts = []
    vi.stubGlobal('window', win)
    vi.stubGlobal('document', {
      createElement: () => {
        const s: FakeScript = { src: '', async: false, onload: null, onerror: null, remove: vi.fn() }
        return s
      },
      head: { appendChild: (s: FakeScript) => scripts.push(s) },
    })
    vi.resetModules()
    load = (await import('./youglish')).loadYouglish
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('đã có window.YG.Widget → resolve ngay, không thêm script', async () => {
    win.YG = fakeYG
    await expect(load()).resolves.toBe(fakeYG)
    expect(scripts).toHaveLength(0)
  })

  it('gọi đồng thời dùng chung một script; callback sẵn sàng → resolve', async () => {
    const a = load()
    const b = load()
    expect(a).toBe(b)
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe(YOUGLISH_SCRIPT_URL)
    win.YG = fakeYG
    win.onYouglishAPIReady!()
    await expect(a).resolves.toBe(fakeYG)
  })

  it('script.onload khi đã có YG.Widget → resolve', async () => {
    const p = load()
    win.YG = fakeYG
    scripts[0].onload!()
    await expect(p).resolves.toBe(fakeYG)
  })

  it('onerror → reject, gỡ script; lần sau thử lại bằng script mới', async () => {
    const p = load()
    scripts[0].onerror!()
    await expect(p).rejects.toThrow()
    expect(scripts[0].remove).toHaveBeenCalled()
    const again = load()
    expect(again).not.toBe(p)
    expect(scripts).toHaveLength(2)
    win.YG = fakeYG
    win.onYouglishAPIReady!()
    await expect(again).resolves.toBe(fakeYG)
  })

  it('quá giờ → reject; callback muộn của lần đã hỏng bị bỏ qua; lần sau tạo script mới', async () => {
    const p = load()
    const first = scripts[0]
    vi.advanceTimersByTime(YOUGLISH_LOAD_TIMEOUT_MS)
    await expect(p).rejects.toThrow()
    expect(first.remove).toHaveBeenCalled()
    first.onerror!() // muộn: không ảnh hưởng gì
    const again = load()
    expect(scripts).toHaveLength(2)
    win.YG = fakeYG
    scripts[1].onload!()
    await expect(again).resolves.toBe(fakeYG)
  })

  it('callback sẵn sàng nhưng không có YG.Widget → reject', async () => {
    const p = load()
    win.onYouglishAPIReady!()
    await expect(p).rejects.toThrow()
    expect(scripts[0].remove).toHaveBeenCalled()
  })
})
