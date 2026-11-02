// Lấy caption tiếng Anh có mốc thời gian cho các video kênh VOA Learning English trong videos.json (story 16).
// Chạy ngoài app, lúc build: `npm run subs:fetch [-- [--allow-asr] <videoId> ...]`. Cần mạng. Không chạy trong CI.
//
// Nguồn cho mỗi video (theo thứ tự):
//   1. File caption tải sẵn trong scripts/subs/captions/source/: `<id>.en.vtt|srt|json3` hoặc tên mặc định của yt-dlp
//      `<tiêu đề> [<id>].en.vtt` (caption do kênh đăng). Tải bằng
//      `yt-dlp --skip-download --write-subs --sub-langs en --sub-format vtt -P scripts/subs/captions/source -o "%(id)s" <url>`
//      (`--write-subs` chỉ lấy caption do kênh đăng). Caption tự động: tự đặt tên `<id>.asr.<ext>` và chỉ được dùng
//      khi chạy với `--allow-asr`, sau khi đã chắc kênh không đăng bản nào (luật story 16).
//   2. Trang xem video trên YouTube (GET thường): đọc `captionTracks`, ưu tiên caption do kênh đăng.
// Không lấy được caption có mốc thời gian thì BỎ QUA video đó (không bịa mốc, không tự canh giờ) và ghi rõ lý do.
//
// Kết quả: scripts/subs/captions/<id>.json = { videoId, title, channel, url, license, captionKind, cues: [{start,end,en}] }.
// Bước sau (Claude, ngoài app): dịch từng cue sang tiếng Việt, thêm chú thích + đánh dấu thì, lưu src/data/subs/<id>.json
// (giữ nguyên start/end/en). Xem stack.md, mục "Phụ đề song ngữ".
//
// Exit 0: chạy xong (có thể có video bị bỏ qua, xem log) · 2: không đọc được videos.json.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'

import {
  VOA_CHANNEL,
  VOA_LICENSE,
  captionTracksFromWatchHtml,
  normalizeCues,
  parseJson3,
  parseVttOrSrt,
  pickCaptionTrack,
  pickLocalCaption,
} from './parse.mjs'

const VIDEOS = new URL('../../src/data/videos/videos.json', import.meta.url)
const OUT_DIR = new URL('./captions/', import.meta.url)
const SOURCE_DIR = new URL('./captions/source/', import.meta.url)
const TIMEOUT_MS = 20_000

let videos
try {
  videos = JSON.parse(readFileSync(VIDEOS, 'utf8'))
} catch (e) {
  console.error(`subs:fetch: không đọc được videos.json: ${e instanceof Error ? e.message : e}`)
  process.exit(2)
}
if (!Array.isArray(videos) || videos.some((v) => !v || typeof v.id !== 'string' || typeof v.channel !== 'string')) {
  console.error('subs:fetch: videos.json sai cấu trúc (phải là mảng các mục có `id`, `channel`).')
  process.exit(2)
}

const args = process.argv.slice(2)
const allowAsr = args.includes('--allow-asr')
const only = new Set(args.filter((a) => !a.startsWith('--')))
for (const id of only) if (!videos.some((v) => v.id === id)) console.warn(`bỏ qua ${id}: không có trong videos.json.`)
const voa = videos.filter((v) => v.channel === VOA_CHANNEL && (only.size === 0 || only.has(v.id)))
const skippedOther = videos.filter((v) => v.channel !== VOA_CHANNEL && only.has(v.id))
for (const v of skippedOther) console.warn(`bỏ qua ${v.id}: kênh "${v.channel}" có bản quyền, không lưu transcript.`)

const sourceNames = existsSync(SOURCE_DIR) ? readdirSync(SOURCE_DIR) : []

/** File caption tải sẵn: trả về { text, ext, kind } hoặc null (xem `pickLocalCaption`). */
function localSource(id) {
  const picked = pickLocalCaption(id, sourceNames, { allowAsr })
  if (!picked) {
    if (!allowAsr && pickLocalCaption(id, sourceNames, { allowAsr: true })) {
      console.warn(`${id}: chỉ có file caption tự động (.asr.*); chạy lại với --allow-asr nếu chắc kênh không đăng bản nào.`)
    }
    return null
  }
  return { text: readFileSync(new URL(encodeURIComponent(picked.name), SOURCE_DIR), 'utf8'), ext: picked.ext, kind: picked.kind }
}

async function fromYouTube(id) {
  const res = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}&hl=en`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  })
  if (!res.ok) throw new Error(`trang video trả HTTP ${res.status}`)
  const picked = pickCaptionTrack(captionTracksFromWatchHtml(await res.text()))
  if (!picked) throw new Error('YouTube không trả danh sách caption tiếng Anh cho trang này')
  if (picked.kind === 'asr' && !allowAsr) throw new Error('chỉ có caption tự động (chạy lại với --allow-asr nếu chắc kênh không đăng bản nào)')
  const url = new URL(picked.track.baseUrl)
  url.searchParams.set('fmt', 'json3')
  const cap = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  const body = cap.ok ? await cap.text() : ''
  if (!body.trim()) throw new Error(`caption trống (HTTP ${cap.status})`)
  return { cues: parseJson3(body), kind: picked.kind }
}

mkdirSync(OUT_DIR, { recursive: true })
const done = []
const skipped = []
for (const v of voa) {
  try {
    const local = localSource(v.id)
    const got = local
      ? { cues: local.ext === 'json3' ? parseJson3(local.text) : parseVttOrSrt(local.text), kind: local.kind }
      : await fromYouTube(v.id)
    const cues = normalizeCues(got.cues)
    if (cues.length === 0) throw new Error('caption không có câu nào có mốc thời gian')
    if (got.kind === 'asr') console.warn(`cảnh báo: ${v.id} chỉ có caption tự động (kênh không đăng bản nào).`)
    const out = {
      videoId: v.id,
      title: v.title,
      channel: v.channel,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      license: VOA_LICENSE,
      captionKind: got.kind,
      cues,
    }
    writeFileSync(new URL(`${v.id}.json`, OUT_DIR), `${JSON.stringify(out, null, 2)}\n`)
    done.push(`${v.id} (${cues.length} câu, ${local ? 'file tải sẵn' : 'YouTube'}, ${got.kind})`)
  } catch (e) {
    skipped.push(`${v.id} "${v.title}": ${e instanceof Error ? e.message : e}`)
  }
}

console.log(`subs:fetch: lấy được ${done.length}/${voa.length} video VOA.`)
for (const d of done) console.log(`  ✓ ${d}`)
if (skipped.length) {
  console.warn(`Không lấy được caption có mốc thời gian (bỏ qua, không làm sub):`)
  for (const s of skipped) console.warn(`  - ${s}`)
  console.warn(
    'Có thể tải caption bằng: yt-dlp --skip-download --write-subs --sub-langs en --sub-format vtt -P scripts/subs/captions/source -o "%(id)s" <url> rồi chạy lại.',
  )
}
