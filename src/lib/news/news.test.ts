import { describe, expect, it, vi } from 'vitest'

import {
  fetchLazyNews,
  GOOGLE_AI_BLOG_RSS,
  HN_FRONT_PAGE,
  parseHnFrontPage,
  readFirstRssItem,
  rssItemToNews,
  shorten,
  stripHtml,
  type XmlDocLike,
  type XmlNodeLike,
} from './index'

// Mẫu thật rút gọn từ Google AI Blog RSS (2026-11-01): description là HTML đã escape, có cả
// `media:description` và `og > description` (không được lấy nhầm).
const RSS = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>AI</title><link>https://blog.google/innovation-and-ai/technology/ai/</link><description>AI</description>
<item><title>Our newest AI Quest: Mapping the human brain</title><link>https://blog.google/products-and-platforms/products/education/ai-quests-polar-peaks/</link><media:description>An illustration of a planet</media:description><description>&lt;img src="https://storage.googleapis.com/x.webp"&gt;Learn AI literacy via Google’s latest AI Quests lesson on neuroscience, “Polar Peaks.”</description><og><description>OG text</description></og></item>
<item><title>Second</title><link>https://blog.google/b/</link><description>B</description></item>
</channel></rss>`

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

/** Parser XML tối giản cho test (môi trường node không có DOMParser). */
function fakeParseXml(xml: string): XmlDocLike {
  type N = XmlNodeLike & { children: N[]; text: string[] }
  const root: N = { nodeName: '#root', textContent: null, children: [], text: [] }
  const stack: N[] = [root]
  for (const m of xml.replace(/<\?[^>]*\?>/g, '').matchAll(/<(\/?)([\w:]+)[^>]*?(\/?)>|([^<]+)/g)) {
    const top = stack[stack.length - 1]
    if (m[4] !== undefined) {
      top.text.push(m[4].replace(/&(\w+);/g, (_, e: string) => ENT[e] ?? _))
    } else if (m[1]) {
      stack.pop()
    } else {
      const node: N = { nodeName: m[2], textContent: null, children: [], text: [] }
      top.children.push(node)
      if (!m[3]) stack.push(node)
    }
  }
  const text = (n: N): string => n.text.join('') + n.children.map(text).join('')
  const all: N[] = []
  const walk = (n: N) => n.children.forEach((c) => (all.push(c), walk(c)))
  walk(root)
  all.forEach((n) => (n.textContent = text(n)))
  return { getElementsByTagName: (name) => all.filter((n) => n.nodeName === name) }
}

type Reply = { ok?: boolean; body?: string | unknown } | 'fail' | 'hang'

function fakeFetch(replies: Record<string, Reply>) {
  return vi.fn((url: string, init?: { signal?: AbortSignal }) => {
    const r = replies[url]
    if (!r || r === 'fail') return Promise.reject(new TypeError('Failed to fetch'))
    if (r === 'hang') {
      return new Promise<never>((_, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('abort'))))
    }
    return Promise.resolve({
      ok: r.ok ?? true,
      text: async () => String(r.body),
      json: async () => (typeof r.body === 'string' ? JSON.parse(r.body) : r.body),
    })
  })
}

const HN = {
  hits: [
    { title: 'HackerTube: YouTube built from videos recommended by HN', url: 'https://karpathy.bearblog.dev/hacker-tube/', objectID: '50319510' },
  ],
}

describe('parse RSS', () => {
  it('lấy item đầu: tiêu đề, mô tả rút gọn (bỏ HTML), link; không lấy nhầm media/og description', () => {
    const news = rssItemToNews(readFirstRssItem(fakeParseXml(RSS)))
    expect(news).toEqual({
      source: 'google-ai-blog',
      sourceName: 'Google AI Blog',
      title: 'Our newest AI Quest: Mapping the human brain',
      summary: 'Learn AI literacy via Google’s latest AI Quests lesson on neuroscience, “Polar Peaks.”',
      url: 'https://blog.google/products-and-platforms/products/education/ai-quests-polar-peaks/',
    })
  })

  it('không có item / thiếu tiêu đề / link sai → null', () => {
    expect(readFirstRssItem(fakeParseXml('<rss><channel></channel></rss>'))).toBeNull()
    expect(rssItemToNews({ title: '', description: 'x', link: 'https://a.b' })).toBeNull()
    expect(rssItemToNews({ title: 'T', description: 'x', link: 'javascript:alert(1)' })).toBeNull()
  })

  it('stripHtml giải mã entity; shorten tối đa 2 câu và giới hạn ký tự', () => {
    expect(stripHtml('<p>A &amp; B&#39;s &#x2014; <b>C</b></p>')).toBe("A & B's — C")
    expect(shorten('One. Two! Three? Four.')).toBe('One. Two!')
    expect(shorten('Revenue hit $3.5 billion for U.S.-based firms. Then more. And more.')).toBe(
      'Revenue hit $3.5 billion for U.S.-based firms. Then more.',
    )
    expect(shorten('He said “Hi.” She left. Bye.')).toBe('He said “Hi.” She left.')
    const long = shorten('word '.repeat(200), 50)
    expect(long.length).toBeLessThanOrEqual(51)
    expect(long.endsWith('…')).toBe(true)
  })
})

describe('parseHnFrontPage', () => {
  it('tin đầu có tiêu đề + link', () => {
    expect(parseHnFrontPage(HN)).toEqual({
      source: 'hn',
      sourceName: 'Hacker News',
      title: 'HackerTube: YouTube built from videos recommended by HN',
      summary: null,
      url: 'https://karpathy.bearblog.dev/hacker-tube/',
    })
  })

  it('không có url ngoài (Ask HN) → link thảo luận HN; dữ liệu sai dạng → null', () => {
    expect(parseHnFrontPage({ hits: [{ title: 'Ask HN: x', url: null, objectID: '123' }] })?.url).toBe(
      'https://news.ycombinator.com/item?id=123',
    )
    expect(parseHnFrontPage({ hits: 'x' })).toBeNull()
    expect(parseHnFrontPage(null)).toBeNull()
    expect(parseHnFrontPage({ hits: [{ title: '' }] })).toBeNull()
  })
})

describe('fetchLazyNews — I/O Matrix', () => {
  it('Google AI Blog trả tin → lấy blog, không gọi HN', async () => {
    const f = fakeFetch({ [GOOGLE_AI_BLOG_RSS]: { body: RSS } })
    const news = await fetchLazyNews({ fetch: f, parseXml: fakeParseXml })
    expect(news?.source).toBe('google-ai-blog')
    expect(f).toHaveBeenCalledTimes(1)
  })

  it.each<[string, Reply]>([
    ['lỗi mạng', 'fail'],
    ['HTTP 500', { ok: false, body: '' }],
    ['XML không có item', { body: '<rss/>' }],
  ])('blog %s → lấy tin HN', async (_, blog) => {
    const f = fakeFetch({ [GOOGLE_AI_BLOG_RSS]: blog, [HN_FRONT_PAGE]: { body: HN } })
    expect((await fetchLazyNews({ fetch: f, parseXml: fakeParseXml }))?.source).toBe('hn')
  })

  it('blog timeout → huỷ request, lấy HN', async () => {
    const f = fakeFetch({ [GOOGLE_AI_BLOG_RSS]: 'hang', [HN_FRONT_PAGE]: { body: HN } })
    expect((await fetchLazyNews({ fetch: f, timeoutMs: 10, parseXml: fakeParseXml }))?.source).toBe('hn')
  })

  it('XML parse lỗi (parseXml trả null) → HN', async () => {
    const f = fakeFetch({ [GOOGLE_AI_BLOG_RSS]: { body: 'x' }, [HN_FRONT_PAGE]: { body: HN } })
    expect((await fetchLazyNews({ fetch: f, parseXml: () => null }))?.source).toBe('hn')
  })

  it('offline / cả hai lỗi → null, không ném lỗi', async () => {
    expect(await fetchLazyNews({ fetch: fakeFetch({}), parseXml: fakeParseXml })).toBeNull()
    const f = fakeFetch({ [GOOGLE_AI_BLOG_RSS]: 'hang', [HN_FRONT_PAGE]: 'hang' })
    expect(await fetchLazyNews({ fetch: f, timeoutMs: 10, parseXml: fakeParseXml })).toBeNull()
  })
})
