// Logic thuần cho script lấy caption (story 16): video nào được lưu transcript (VOA public domain hoặc CC BY), chọn track
// caption, parse json3 / WebVTT / SRT, chuẩn hoá thành cue tăng dần, không chồng nhau, gộp mảnh caption thành câu.
// Mốc thời gian luôn lấy từ caption thật: không bịa, không tự canh.

/** Kênh public domain: video của kênh này được lưu transcript (giấy phép `public-domain` trong videos.json). */
export const VOA_CHANNEL = 'VOA Learning English'
export const VOA_LICENSE = 'public domain – VOA'

/** Giấy phép Creative Commons của YouTube ("Creative Commons Attribution license (reuse allowed)") là CC BY 3.0. */
export const CC_BY_LICENSE_URL = 'https://creativecommons.org/licenses/by/3.0/'
/** Ghi chú thay đổi theo CC BY (bản dịch là tác phẩm phái sinh). */
export const TRANSLATION_CREDIT = 'Bản dịch tiếng Việt do Lumos thực hiện'

/** Chuỗi giấy phép ghi trong file caption / file sub của video CC BY. */
export const ccByLicense = (channel) => `CC BY 3.0 – ${channel}`

/** Link kênh YouTube dạng cố định (`/channel/UC…`), dùng để ghi nguồn video CC BY (cùng mẫu với test dữ liệu video). */
export const CHANNEL_URL_RE = /^https:\/\/www\.youtube\.com\/channel\/UC[A-Za-z0-9_-]{22}$/

/**
 * Nguồn ghi vào file caption / file sub nếu video được lưu transcript, ngược lại null (video có bản quyền: không lưu).
 * Được lưu: kênh VOA Learning English với giấy phép `public-domain`, hoặc video giấy phép `cc-by` có `channelUrl`
 * (để ghi nguồn) và caption do kênh đăng (CC BY không dùng caption tự động). Mọi giấy phép khác (`youtube-standard`,
 * thiếu, lạ) → null.
 * @param {{ id: string, channel: string, channelUrl?: string, license?: string }} video
 * @param {'uploaded' | 'asr'} captionKind
 */
export function transcriptSource(video, captionKind) {
  const url = `https://www.youtube.com/watch?v=${video.id}`
  if (video.license === 'public-domain' && video.channel === VOA_CHANNEL) {
    return { channel: video.channel, url, license: VOA_LICENSE, captionKind }
  }
  if (
    video.license === 'cc-by' &&
    captionKind === 'uploaded' &&
    typeof video.channelUrl === 'string' &&
    CHANNEL_URL_RE.test(video.channelUrl)
  ) {
    return {
      channel: video.channel,
      channelUrl: video.channelUrl,
      url,
      license: ccByLicense(video.channel),
      licenseUrl: CC_BY_LICENSE_URL,
      translation: TRANSLATION_CREDIT,
      captionKind,
    }
  }
  return null
}

/** Video được lưu transcript (VOA public domain hoặc CC BY có ghi nguồn). */
export const canStoreTranscript = (video) => transcriptSource(video, 'uploaded') !== null

/** Gộp mảnh caption tới khi hết câu, nhưng không dài quá chừng này. */
export const MAX_CUE_SECONDS = 9
export const MAX_CUE_CHARS = 140

/**
 * Chọn track caption tiếng Anh: ưu tiên caption do kênh đăng (không có `kind: 'asr'`), chỉ dùng caption tự động khi
 * kênh không đăng bản nào. Không có track tiếng Anh → null.
 * @param {readonly { languageCode?: string, kind?: string, baseUrl?: string, vssId?: string }[]} tracks
 */
export function pickCaptionTrack(tracks) {
  if (!Array.isArray(tracks)) return null
  const en = tracks.filter((t) => t && typeof t.baseUrl === 'string' && /^en(\b|-|_|$)/i.test(t.languageCode ?? ''))
  const uploaded = en.filter((t) => t.kind !== 'asr')
  // Bản đăng của kênh: ưu tiên 'en' chuẩn rồi tới biến thể (en-US…).
  const exact = uploaded.find((t) => t.languageCode === 'en')
  if (exact) return { track: exact, kind: 'uploaded' }
  if (uploaded[0]) return { track: uploaded[0], kind: 'uploaded' }
  const asr = en.find((t) => t.kind === 'asr')
  return asr ? { track: asr, kind: 'asr' } : null
}

const LOCAL_EXTS = ['json3', 'vtt', 'srt']

/**
 * Chọn file caption tải sẵn cho video `id` trong danh sách tên file (thư mục captions/source/). Nhận cả tên
 * `<id>.en.<ext>` lẫn tên mặc định của yt-dlp `<tiêu đề> [<id>].en.<ext>` (kể cả `en-US`…). Ưu tiên caption do kênh
 * đăng (`.en.*`); file caption tự động (`.asr.*`, do người dùng đặt tên) chỉ dùng khi có `allowAsr` và không có bản đăng.
 * Cùng loại thì json3 > vtt > srt. Không có → null.
 * @param {string} id
 * @param {readonly string[]} names
 * @param {{ allowAsr?: boolean }} [opts]
 * @returns {{ name: string, ext: string, kind: 'uploaded' | 'asr' } | null}
 */
export function pickLocalCaption(id, names, opts = {}) {
  const found = []
  for (const name of names) {
    const m = /^(.*)\.(en(?:[-_][A-Za-z0-9]+)?|asr)\.(json3|vtt|srt)$/.exec(name)
    if (!m) continue
    const [, base, lang, ext] = m
    if (base !== id && !base.endsWith(`[${id}]`)) continue
    // `en-orig` là caption tự động bản gốc mà yt-dlp ghi khi tải caption tự động (`--write-auto-subs`).
    const asr = lang === 'asr' || /^en[-_]orig$/i.test(lang)
    found.push({ name, ext, kind: asr ? 'asr' : 'uploaded', exact: lang === 'en' })
  }
  const rank = (f) => (f.exact ? 0 : 1) * 10 + LOCAL_EXTS.indexOf(f.ext)
  const best = (kind) => found.filter((f) => f.kind === kind).sort((a, b) => rank(a) - rank(b))[0]
  const pick = best('uploaded') ?? (opts.allowAsr ? best('asr') : undefined)
  return pick ? { name: pick.name, ext: pick.ext, kind: pick.kind } : null
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" }

const decodeEntities = (s) =>
  s.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m
    }
    return ENTITIES[e.toLowerCase()] ?? m
  })

/**
 * Bỏ thẻ, giải mã entity (cả entity bị mã hoá hai lần như `&amp;nbsp;` trong caption tải từ YouTube), gộp khoảng trắng,
 * bỏ dấu đổi người nói `>>` và chú thích âm thanh `[MUSIC]`.
 */
export function cleanText(text) {
  // Bỏ thẻ cả trước và sau khi giải mã (thẻ bị mã hoá như `&lt;i&gt;` chỉ lộ ra sau khi giải mã).
  return decodeEntities(decodeEntities(String(text).replace(/<[^>]*>/g, '')))
    .replace(/<\/?[a-z][^<>]*>/gi, '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/>>+/g, ' ')
    .replace(/\[[^\]]*\]|\([A-Z ]+\)|♪+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Caption YouTube dạng json3 (`fmt=json3`): `events[].tStartMs`, `dDurationMs`, `segs[].utf8`.
 * @returns {{ start: number, end: number, en: string }[]}
 */
export function parseJson3(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json
  const events = Array.isArray(data?.events) ? data.events : []
  const out = []
  for (const e of events) {
    if (!e || typeof e !== 'object' || !Array.isArray(e.segs) || typeof e.tStartMs !== 'number') continue
    const en = cleanText(e.segs.map((s) => s?.utf8 ?? '').join(''))
    const dur = typeof e.dDurationMs === 'number' ? e.dDurationMs : 0
    if (en && dur > 0) out.push({ start: e.tStartMs / 1000, end: (e.tStartMs + dur) / 1000, en })
  }
  return out
}

/** `hh:mm:ss.mmm`, `mm:ss.mmm` hoặc SRT `hh:mm:ss,mmm` → giây; sai dạng → NaN. */
export function parseTimestamp(s) {
  const m = /^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/.exec(String(s).trim())
  if (!m) return Number.NaN
  const [, h = '0', mm, ss, ms] = m
  return Number(h) * 3600 + Number(mm) * 60 + Number(ss) + Number(ms.padEnd(3, '0')) / 1000
}

/**
 * WebVTT hoặc SRT (file tải từ YouTube Studio / trình tải caption): khối `start --> end` rồi các dòng chữ.
 * @returns {{ start: number, end: number, en: string }[]}
 */
export function parseVttOrSrt(text) {
  const blocks = String(text).replace(/\r\n?/g, '\n').split(/\n{2,}/)
  const out = []
  for (const block of blocks) {
    const lines = block.split('\n')
    const i = lines.findIndex((l) => l.includes('-->'))
    if (i < 0) continue
    const [a, b] = lines[i].split('-->')
    const start = parseTimestamp(a)
    const end = parseTimestamp(String(b).trim().split(/\s+/)[0])
    const en = cleanText(lines.slice(i + 1).join(' '))
    if (Number.isFinite(start) && Number.isFinite(end) && end > start && en) out.push({ start, end, en })
  }
  return out
}

const round = (n) => Math.round(n * 100) / 100
const wordsOf = (s) => s.split(' ').filter(Boolean)
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '')

/**
 * Caption tự động kiểu cuộn lặp lại đuôi câu trước ở đầu câu sau ("so we went" → "we went home"). Bỏ phần đầu của `en`
 * trùng với phần cuối của `prev` (ít nhất 2 từ, so không phân biệt hoa thường / dấu câu). Trả về phần còn lại.
 */
export function stripRollingOverlap(prev, en) {
  const a = wordsOf(prev)
  const b = wordsOf(en)
  for (let k = Math.min(a.length, b.length); k >= 2; k--) {
    const tail = a.slice(-k).map(norm)
    const head = b.slice(0, k).map(norm)
    if (tail.every((w, i) => w === head[i])) return b.slice(k).join(' ')
  }
  return en
}
const endsSentence = (s) => /[.?!]["')\]]?$/.test(s)

/**
 * Chuẩn hoá: sắp theo `start`, bỏ trùng (caption cuộn lặp lại dòng trước hoặc lặp đuôi dòng trước, xem
 * `stripRollingOverlap`), gộp cue cùng `start` (nối chữ), cắt `end` không quá `start` của cue sau
 * (không chồng nhau), rồi gộp mảnh liền nhau thành câu (tới dấu . ? !, tối đa `MAX_CUE_SECONDS` / `MAX_CUE_CHARS`,
 * không gộp qua khoảng lặng > 1,5 s). Mốc làm tròn 0,01 s.
 * @param {{ start: number, end: number, en: string }[]} raw
 */
export function normalizeCues(raw) {
  const sorted = raw
    .filter((c) => Number.isFinite(c.start) && Number.isFinite(c.end) && c.end > c.start && c.en.trim())
    .map((c) => ({ start: c.start, end: c.end, en: c.en.trim() }))
    .sort((a, b) => a.start - b.start || a.end - b.end)
  const pieces = []
  for (const c of sorted) {
    const prev = pieces[pieces.length - 1]
    if (prev && prev.en === c.en && c.start <= prev.end + 0.05) {
      prev.end = Math.max(prev.end, c.end)
      continue
    }
    const en = prev && c.start <= prev.end + 0.05 ? stripRollingOverlap(prev.en, c.en) : c.en
    if (prev && !en) {
      prev.end = Math.max(prev.end, c.end)
      continue
    }
    if (prev && c.start === prev.start) {
      // Hai dòng cùng lúc bắt đầu (caption 2 dòng): nối chữ, không cắt dòng trước về độ dài 0.
      prev.en = `${prev.en} ${en}`
      prev.end = Math.max(prev.end, c.end)
      continue
    }
    pieces.push({ ...c, en })
  }
  for (let i = 0; i < pieces.length - 1; i++) pieces[i].end = Math.min(pieces[i].end, pieces[i + 1].start)
  const merged = []
  for (const p of pieces) {
    if (p.end <= p.start) continue
    const last = merged[merged.length - 1]
    const canJoin =
      last &&
      !endsSentence(last.en) &&
      p.start - last.end <= 1.5 &&
      p.end - last.start <= MAX_CUE_SECONDS &&
      last.en.length + 1 + p.en.length <= MAX_CUE_CHARS
    if (canJoin) {
      last.en = `${last.en} ${p.en}`
      last.end = p.end
    } else merged.push({ ...p })
  }
  return merged
    .map((c) => ({ start: round(c.start), end: round(c.end), en: c.en }))
    .filter((c) => c.end > c.start)
}

/** Lấy `captionTracks` từ HTML trang xem video (đoạn `"captionTracks":[...]` trong ytInitialPlayerResponse); không có → []. */
export function captionTracksFromWatchHtml(html) {
  const key = '"captionTracks":'
  const at = String(html).indexOf(key)
  if (at < 0) return []
  let depth = 0
  let i = at + key.length
  const begin = i
  let inStr = false
  for (; i < html.length; i++) {
    const ch = html[i]
    if (inStr) {
      if (ch === '\\') i++
      else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') inStr = true
    else if (ch === '[') depth++
    else if (ch === ']' && --depth === 0) break
  }
  try {
    return JSON.parse(html.slice(begin, i + 1))
  } catch {
    return []
  }
}
