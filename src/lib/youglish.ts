/**
 * Widget YouGlish (story 15): nghe một cụm từ trong video YouTube thật, nhúng ngay trong bài.
 * Script chỉ tải khi người dùng bấm (một lần cho cả app). Tài liệu: https://youglish.com/api/doc/js-api
 */

export const YOUGLISH_SCRIPT_URL = 'https://youglish.com/public/emb/widget.js'
export const YOUGLISH_LANGUAGE = 'english'
export const YOUGLISH_ACCENT = 'us'
/** Quá thời gian này mà script chưa sẵn sàng thì coi như lỗi, quay về link. */
export const YOUGLISH_LOAD_TIMEOUT_MS = 10_000

/** Mã thành phần của widget (cộng lại): tiêu đề 4 + phụ đề 8 + tốc độ 16 + nút điều khiển 64. */
export const YOUGLISH_COMPONENTS = { title: 4, caption: 8, speed: 16, controls: 64 } as const

/** Link trang YouGlish của một cụm (phương án dự phòng; khớp link đang có trong dữ liệu bài). */
export function youglishPageUrl(phrase: string): string {
  return `https://youglish.com/pronounce/${encodeURIComponent(phrase)}/${YOUGLISH_LANGUAGE}/${YOUGLISH_ACCENT}`
}

/** Lấy lại cụm từ từ link YouGlish `…/pronounce/<cụm>/english/<giọng>`; link khác dạng → null. */
export function youglishPhraseFromUrl(url: string): string | null {
  const m = /^https:\/\/youglish\.com\/pronounce\/([^/]+)\/english\/[a-z]+\/?$/.exec(url)
  if (!m) return null
  try {
    const phrase = decodeURIComponent(m[1]).trim()
    return phrase || null
  } catch {
    return null
  }
}

/** Tham số `widget.fetch(query, lang, accent)`. */
export function youglishFetchArgs(phrase: string): [query: string, lang: string, accent: string] {
  return [phrase.trim(), YOUGLISH_LANGUAGE, YOUGLISH_ACCENT]
}

export type YouglishEvents = {
  onFetchDone?: (e: { totalResult: number }) => void
  onError?: (e: { code: number }) => void
}

/**
 * Tuỳ chọn của `new YG.Widget(id, options)`: không tự hiện ô tìm kiếm, rộng theo khung chứa. Giữ màu mặc định
 * (nền sáng) của YouGlish: thử truyền màu theme tối thì widget trắng trơn hoặc chữ xanh trên nền tối khó đọc.
 */
export function youglishWidgetOptions(events: YouglishEvents) {
  const c = YOUGLISH_COMPONENTS
  return {
    components: c.title + c.caption + c.speed + c.controls,
    autoStart: 1,
    events,
  }
}

export type YouglishWidget = {
  fetch: (query: string, lang: string, accent?: string) => void
  close?: () => void
}
export type YouglishApi = {
  /** `elementId`: id của phần tử trong trang (widget tìm bằng getElementById rồi thay bằng outerHTML). */
  Widget: new (elementId: string, options: ReturnType<typeof youglishWidgetOptions>) => YouglishWidget
}

declare global {
  interface Window {
    YG?: YouglishApi
    onYouglishAPIReady?: () => void
  }
}

let loading: Promise<YouglishApi> | null = null

/**
 * Tải script widget một lần cho cả app (gọi đồng thời dùng chung một script). Lỗi hoặc quá giờ thì reject, gỡ
 * script và cho phép lần gọi sau thử lại bằng script mới. Callback của một lần tải đã kết thúc (vd script cũ
 * tới muộn) bị bỏ qua.
 */
export function loadYouglish(): Promise<YouglishApi> {
  if (window.YG?.Widget) return Promise.resolve(window.YG)
  if (loading) return loading
  const attempt = new Promise<YouglishApi>((resolve, reject) => {
    const script = document.createElement('script')
    let settled = false
    const settle = () => {
      if (settled) return false
      settled = true
      clearTimeout(timer)
      return true
    }
    const fail = (reason: string) => {
      if (!settle()) return
      script.remove()
      if (loading === attempt) loading = null
      reject(new Error(reason))
    }
    const succeedIfReady = (orFail: boolean) => {
      const yg = window.YG
      if (yg?.Widget) {
        if (settle()) resolve(yg)
      } else if (orFail) fail('YouGlish không có YG.Widget')
    }
    const timer = setTimeout(() => fail('YouGlish tải quá lâu'), YOUGLISH_LOAD_TIMEOUT_MS)
    window.onYouglishAPIReady = () => succeedIfReady(true)
    script.src = YOUGLISH_SCRIPT_URL
    script.async = true
    script.onload = () => succeedIfReady(false)
    script.onerror = () => fail('Không tải được script YouGlish')
    document.head.appendChild(script)
  })
  loading = attempt
  return attempt
}
