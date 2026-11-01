/**
 * Tin ngắn cho ngày lười (story 4). Đây là nơi duy nhất app gọi mạng lấy tin:
 * Google AI Blog RSS (có CORS, parse bằng `DOMParser`) → lỗi thì tin đầu HN (Algolia) → lỗi nữa thì null.
 * Không proxy. Mọi request có timeout.
 */

export const GOOGLE_AI_BLOG_RSS = 'https://blog.google/innovation-and-ai/technology/ai/rss/'
export const HN_FRONT_PAGE = 'https://hn.algolia.com/api/v1/search?tags=front_page'
export const DEFAULT_TIMEOUT_MS = 8000
/** Độ dài tối đa của đoạn mô tả rút gọn. */
export const SUMMARY_MAX_CHARS = 320

export type LazyNews = {
  source: 'google-ai-blog' | 'hn'
  /** Tên nguồn để hiện. */
  sourceName: string
  title: string
  /** Đoạn mô tả rút gọn (HN không có). */
  summary: string | null
  url: string
}

export type RawRssItem = { title: string | null; description: string | null; link: string | null }

/** Phần DOM tối thiểu mà `readFirstRssItem` cần (Document của `DOMParser`, hoặc bản giả khi test). */
export type XmlNodeLike = { nodeName: string; textContent: string | null; children: ArrayLike<XmlNodeLike> }
export type XmlDocLike = { getElementsByTagName: (name: string) => ArrayLike<XmlNodeLike> }

type FetchLike = (input: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; text: () => Promise<string>; json: () => Promise<unknown> }>

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : whole
    }
    return ENTITIES[code.toLowerCase()] ?? whole
  })
}

/** Bỏ thẻ HTML, giải mã entity, gộp khoảng trắng. */
export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/** Rút gọn: tối đa 2 câu và `max` ký tự (cắt ở ranh giới từ, thêm `…`). */
export function shorten(text: string, max = SUMMARY_MAX_CHARS): string {
  // Chỉ tách khi [.!?] (kèm nháy/ngoặc đóng) đứng trước khoảng trắng: "$3.5", "U.S." giữa câu không bị cắt.
  const sentences = text.trim().split(/(?<=[.!?]["'\u201d\u2019)]*)\s+/)
  let out = sentences.slice(0, 2).join(' ').trim()
  if (out.length > max) {
    const cut = out.slice(0, max)
    const space = cut.lastIndexOf(' ')
    out = `${(space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:]+$/, '')}…`
  }
  return out
}

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

/** Lấy `<item>` đầu tiên: tiêu đề, mô tả, link (chỉ con trực tiếp, bỏ `media:description`, `og > description`). */
export function readFirstRssItem(doc: XmlDocLike): RawRssItem | null {
  const item = doc.getElementsByTagName('item')[0]
  if (!item) return null
  const child = (name: string) => {
    for (const node of Array.from(item.children)) if (node.nodeName === name) return node.textContent
    return null
  }
  return { title: child('title'), description: child('description'), link: child('link') }
}

/** Đổi item RSS thô thành tin; thiếu tiêu đề hoặc link không hợp lệ → null. */
export function rssItemToNews(raw: RawRssItem | null): LazyNews | null {
  if (!raw) return null
  const title = stripHtml(raw.title ?? '')
  const url = raw.link?.trim() ?? ''
  if (!title || !isHttpUrl(url)) return null
  const summary = shorten(stripHtml(raw.description ?? ''))
  return { source: 'google-ai-blog', sourceName: 'Google AI Blog', title, summary: summary || null, url }
}

/** Tin đầu trang nhất HN (Algolia): tiêu đề + link (không có link ngoài thì link tới thảo luận HN). */
export function parseHnFrontPage(json: unknown): LazyNews | null {
  if (typeof json !== 'object' || json === null || !Array.isArray((json as { hits?: unknown }).hits)) return null
  for (const hit of (json as { hits: unknown[] }).hits) {
    if (typeof hit !== 'object' || hit === null) continue
    const { title, url, objectID } = hit as { title?: unknown; url?: unknown; objectID?: unknown }
    if (typeof title !== 'string' || !title.trim()) continue
    const link =
      typeof url === 'string' && isHttpUrl(url)
        ? url
        : typeof objectID === 'string' && /^\d+$/.test(objectID)
          ? `https://news.ycombinator.com/item?id=${objectID}`
          : null
    if (!link) continue
    return { source: 'hn', sourceName: 'Hacker News', title: stripHtml(title), summary: null, url: link }
  }
  return null
}

function defaultParseXml(xml: string): XmlDocLike | null {
  if (typeof DOMParser === 'undefined') return null
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  return doc.getElementsByTagName('parsererror').length > 0 ? null : doc
}

async function withTimeout<T>(fetchFn: FetchLike, url: string, timeoutMs: number, read: (res: Awaited<ReturnType<FetchLike>>) => Promise<T>): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchFn(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP lỗi: ${url}`)
    return await read(res)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Lấy 1 tin cho ngày lười: Google AI Blog → HN → null (offline / cả hai lỗi).
 * Không bao giờ ném lỗi.
 */
export async function fetchLazyNews(opts: {
  fetch: FetchLike
  timeoutMs?: number
  parseXml?: (xml: string) => XmlDocLike | null
}): Promise<LazyNews | null> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const parseXml = opts.parseXml ?? defaultParseXml
  try {
    const xml = await withTimeout(opts.fetch, GOOGLE_AI_BLOG_RSS, timeoutMs, (r) => r.text())
    const doc = parseXml(xml)
    const news = doc ? rssItemToNews(readFirstRssItem(doc)) : null
    if (news) return news
  } catch {
    // Blog lỗi / timeout → thử HN.
  }
  try {
    return parseHnFrontPage(await withTimeout(opts.fetch, HN_FRONT_PAGE, timeoutMs, (r) => r.json()))
  } catch {
    return null
  }
}
