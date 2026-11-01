/**
 * Nhận giọng nói bằng Web Speech API của trình duyệt (`SpeechRecognition` / `webkitSpeechRecognition`).
 * App chỉ lưu điểm, không lưu âm thanh hay chữ nhận dạng. Âm thanh do dịch vụ nhận giọng nói của trình duyệt
 * xử lý (Chrome gửi lên máy chủ Google); app không gửi âm thanh đi đâu khác.
 * Không có API thì `canRecognize()` = false và trang ẩn phần nói.
 */

export const RECOGNITION_LANG = 'en-US'

/** Phần của SpeechRecognition mà app dùng (để test thay bằng bản giả). */
export type RecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  abort: () => void
}

export type RecognitionGlobal = {
  SpeechRecognition?: new () => RecognitionLike
  webkitSpeechRecognition?: new () => RecognitionLike
}

export type RecognitionErrorCode = 'not-allowed' | 'no-speech' | 'audio-capture' | 'network' | 'aborted' | 'unsupported' | 'other'

export type RecognitionResult =
  | { ok: true; transcripts: string[] }
  | { ok: false; error: RecognitionErrorCode; message: string }

export const RECOGNITION_MESSAGES: Record<RecognitionErrorCode, string> = {
  'not-allowed': 'Trình duyệt chưa cho dùng micro. Cho phép micro (biểu tượng ổ khoá cạnh thanh địa chỉ) rồi thử lại.',
  'no-speech': 'Chưa nghe thấy gì. Nói to, rõ hơn rồi thử lại.',
  'audio-capture': 'Không tìm thấy micro. Kiểm tra micro rồi thử lại.',
  network: 'Lỗi mạng khi nhận giọng nói. Kiểm tra kết nối rồi thử lại.',
  aborted: 'Đã dừng nghe. Bấm nói để thử lại.',
  unsupported: 'Trình duyệt này chưa hỗ trợ nhận giọng nói.',
  other: 'Nhận giọng nói bị lỗi. Thử lại nhé.',
}

function ctor(g: RecognitionGlobal): (new () => RecognitionLike) | undefined {
  try {
    const c = g.SpeechRecognition ?? g.webkitSpeechRecognition
    return typeof c === 'function' ? c : undefined
  } catch {
    return undefined
  }
}

export function canRecognize(g: RecognitionGlobal = globalThis as RecognitionGlobal): boolean {
  return ctor(g) !== undefined
}

function errorCode(error: string): RecognitionErrorCode {
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'not-allowed'
  if (error === 'no-speech' || error === 'audio-capture' || error === 'network' || error === 'aborted') return error
  return 'other'
}

function fail(error: RecognitionErrorCode): RecognitionResult {
  return { ok: false, error, message: RECOGNITION_MESSAGES[error] }
}

/**
 * Nghe một câu. Promise luôn resolve (không reject): các phương án chữ nhận dạng được,
 * hoặc lỗi kèm câu báo tiếng Việt. `signal` huỷ lượt nghe (kết quả `aborted`).
 */
export function recognizeOnce(
  opts: { lang?: string; maxAlternatives?: number; signal?: AbortSignal } = {},
  g: RecognitionGlobal = globalThis as RecognitionGlobal,
): Promise<RecognitionResult> {
  const C = ctor(g)
  if (!C) return Promise.resolve(fail('unsupported'))
  let rec: RecognitionLike
  try {
    rec = new C()
  } catch {
    return Promise.resolve(fail('unsupported'))
  }
  return new Promise<RecognitionResult>((resolve) => {
    let settled = false
    const onAbort = () => {
      done(fail('aborted'))
      try {
        rec.abort()
      } catch {
        // bỏ qua
      }
    }
    const done = (r: RecognitionResult) => {
      if (settled) return
      settled = true
      opts.signal?.removeEventListener('abort', onAbort)
      resolve(r)
    }
    if (opts.signal?.aborted) {
      done(fail('aborted'))
      return
    }
    opts.signal?.addEventListener('abort', onAbort)
    rec.lang = opts.lang ?? RECOGNITION_LANG
    rec.interimResults = false
    rec.continuous = false
    rec.maxAlternatives = opts.maxAlternatives ?? 3
    rec.onresult = (event) => {
      const transcripts: string[] = []
      for (let i = 0; i < event.results.length; i++) {
        const alts = event.results[i]
        for (let k = 0; k < alts.length; k++) {
          const text = alts[k]?.transcript?.trim()
          if (text) transcripts.push(text)
        }
      }
      done(transcripts.length > 0 ? { ok: true, transcripts } : fail('no-speech'))
    }
    rec.onerror = (event) => done(fail(errorCode(event?.error ?? '')))
    // Kết thúc mà không có kết quả nào = không nghe thấy gì.
    rec.onend = () => done(fail('no-speech'))
    try {
      rec.start()
    } catch {
      done(fail('other'))
    }
  })
}
