/**
 * YouTube IFrame Player API (story 16): đọc thời gian phát để chạy phụ đề, tua, dừng / phát tiếp.
 * Script API chỉ tải khi một video có sub được bấm phát (một lần cho cả app). Player gắn vào iframe youtube-nocookie
 * đã có sẵn (`enablejsapi=1`), nên API lỗi thì video vẫn phát, chỉ phụ đề không chạy.
 * Tài liệu: https://developers.google.com/youtube/iframe_api_reference
 */

export const YT_API_URL = 'https://www.youtube.com/iframe_api'
/** Host của iframe nhúng (story 15 dùng youtube-nocookie). */
export const YT_EMBED_HOST = 'https://www.youtube-nocookie.com'
/** Quá thời gian này mà API / player chưa sẵn sàng thì coi như lỗi (trả null). */
export const YT_LOAD_TIMEOUT_MS = 10_000

/** `YT.PlayerState`. */
export const YT_STATE = { ended: 0, playing: 1, paused: 2, buffering: 3, cued: 5 } as const

type RawPlayer = {
  getCurrentTime?: () => number
  getPlayerState?: () => number
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void
  pauseVideo?: () => void
  playVideo?: () => void
  destroy?: () => void
}

export type YouTubeApi = {
  Player: new (
    el: HTMLIFrameElement | string,
    options: {
      host?: string
      events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void; onError?: (e: { data: number }) => void }
    },
  ) => RawPlayer
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let loading: Promise<YouTubeApi> | null = null

/**
 * Tải script API một lần cho cả app. Lỗi hoặc quá giờ thì reject, gỡ script và cho lần sau thử lại.
 * Callback của một lần tải đã kết thúc bị bỏ qua.
 */
export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (loading) return loading
  const attempt = new Promise<YouTubeApi>((resolve, reject) => {
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
    const timer = setTimeout(() => fail('YouTube IFrame API tải quá lâu'), YT_LOAD_TIMEOUT_MS)
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      const yt = window.YT
      if (yt?.Player) {
        if (settle()) resolve(yt)
      } else fail('YouTube IFrame API không có YT.Player')
    }
    script.src = YT_API_URL
    script.async = true
    script.onerror = () => fail('Không tải được YouTube IFrame API')
    document.head.appendChild(script)
  })
  loading = attempt
  return attempt
}

/** Bọc player: mọi lệnh đều an toàn (lỗi → null / bỏ qua), không bao giờ ném. */
export type PlayerHandle = {
  /** Giây đang phát, hoặc null nếu player không trả lời. */
  getCurrentTime: () => number | null
  getState: () => number | null
  seekTo: (seconds: number) => void
  pause: () => void
  play: () => void
  destroy: () => void
}

function safe<T>(fn: (() => T) | undefined): T | null {
  try {
    return fn ? fn() : null
  } catch {
    return null
  }
}

export function wrapPlayer(raw: RawPlayer): PlayerHandle {
  return {
    getCurrentTime: () => {
      const t = safe(raw.getCurrentTime?.bind(raw))
      return typeof t === 'number' && Number.isFinite(t) ? t : null
    },
    getState: () => {
      const s = safe(raw.getPlayerState?.bind(raw))
      return typeof s === 'number' ? s : null
    },
    seekTo: (seconds) => void safe(() => raw.seekTo?.(Math.max(0, seconds), true)),
    pause: () => void safe(raw.pauseVideo?.bind(raw)),
    play: () => void safe(raw.playVideo?.bind(raw)),
    destroy: () => void safe(raw.destroy?.bind(raw)),
  }
}

/** Mỗi iframe chỉ gắn một player: gắn lần hai vào cùng iframe thì YouTube trả "alreadyInitialized" và không báo onReady. */
const attached = new WeakMap<HTMLIFrameElement, { ready: Promise<PlayerHandle | null>; listeners: Set<(state: number) => void> }>()

/**
 * Gắn player vào iframe có sẵn (gọi lại với cùng iframe thì dùng chung player, kể cả khi effect chạy hai lần).
 * API không tải được, player không sẵn sàng trong `YT_LOAD_TIMEOUT_MS` hoặc báo lỗi → null (video vẫn phát trong
 * iframe, chỉ phụ đề không chạy). `onStateChange` nhận `YT_STATE`; hàm trả về kèm `off` để gỡ listener.
 * Lỗi rồi thì iframe đó giữ kết quả null (không tạo YT.Player thứ hai trên cùng iframe): muốn thử lại thì dựng iframe
 * mới (VideoEmbed đổi `key`) rồi gắn lại.
 */
export function attachPlayer(
  iframe: HTMLIFrameElement,
  onStateChange?: (state: number) => void,
): { ready: Promise<PlayerHandle | null>; off: () => void } {
  let entry = attached.get(iframe)
  if (!entry) {
    const listeners = new Set<(state: number) => void>()
    entry = { ready: connect(iframe, (state) => listeners.forEach((l) => l(state))), listeners }
    attached.set(iframe, entry)
  }
  const { ready, listeners } = entry
  if (onStateChange) listeners.add(onStateChange)
  return { ready, off: () => void (onStateChange && listeners.delete(onStateChange)) }
}

async function connect(iframe: HTMLIFrameElement, onStateChange: (state: number) => void): Promise<PlayerHandle | null> {
  let api: YouTubeApi
  try {
    api = await loadYouTubeApi()
  } catch {
    return null
  }
  return new Promise((resolve) => {
    let done = false
    const finish = (value: PlayerHandle | null) => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve(value)
    }
    const timer = setTimeout(() => finish(null), YT_LOAD_TIMEOUT_MS)
    let raw: RawPlayer | null = null
    try {
      raw = new api.Player(iframe, {
        // API chỉ nhận tin nhắn từ đúng host của iframe; mặc định là youtube.com nên phải khai báo youtube-nocookie.
        host: YT_EMBED_HOST,
        events: {
          // onReady có thể tới trước khi constructor trả về: đợi một nhịp để có `raw`.
          onReady: () => queueMicrotask(() => finish(raw ? wrapPlayer(raw) : null)),
          onStateChange: (e) => onStateChange(e.data),
          onError: () => finish(null),
        },
      })
    } catch {
      finish(null)
    }
  })
}
