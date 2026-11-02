// Kiểm lại mọi video bài học (story 15) qua YouTube oEmbed: 200 = video tồn tại và cho nhúng.
// Không chạy trong CI (cần mạng). Exit 0: mọi ID OK · 1: có ID hỏng (liệt kê) hoặc danh sách rỗng ·
// 2: lỗi mạng / YouTube trả lỗi tạm / videos.json không đọc được hoặc sai cấu trúc.
// Tiêu đề / kênh lệch so với oEmbed chỉ cảnh báo (kênh hay đổi tiêu đề), không làm fail.
import { readFileSync } from 'node:fs'

const FILE = new URL('../../src/data/videos/videos.json', import.meta.url)
const TIMEOUT_MS = 15_000
const CONCURRENCY = 6

/** Không đọc được / sai cấu trúc → exit 2 (không phải ID hỏng); danh sách rỗng → exit 1. */
let videos
try {
  videos = JSON.parse(readFileSync(FILE, 'utf8'))
} catch (e) {
  console.error(`videos:check: không đọc được videos.json: ${e instanceof Error ? e.message : e}`)
  process.exit(2)
}
if (!Array.isArray(videos) || videos.some((v) => !v || typeof v !== 'object' || typeof v.id !== 'string')) {
  console.error('videos:check: videos.json sai cấu trúc (phải là mảng các mục có `id` dạng chuỗi).')
  process.exit(2)
}
if (videos.length === 0) {
  console.error('videos:check: videos.json không có video nào.')
  process.exit(1)
}
const oembed = (id) =>
  `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`

/** @returns {Promise<{ v: any, status?: number, data?: any, error?: string }>} */
async function check(v) {
  try {
    const res = await fetch(oembed(v.id), { signal: AbortSignal.timeout(TIMEOUT_MS) })
    const data = res.status === 200 ? await res.json() : undefined
    return { v, status: res.status, data }
  } catch (e) {
    return { v, error: e instanceof Error ? e.message : String(e) }
  }
}

const results = []
for (let i = 0; i < videos.length; i += CONCURRENCY) {
  results.push(...(await Promise.all(videos.slice(i, i + CONCURRENCY).map(check))))
}

const label = (v) => `${v.id} (${v.lessonId}/${v.sectionId}) "${v.title}"`
// 400/401/403/404: ID sai, video bị xoá/riêng tư hoặc chặn nhúng → hỏng. 429/5xx hay lỗi kết nối → không kết luận được.
const BROKEN = new Set([400, 401, 403, 404])
const broken = results.filter((r) => r.status !== undefined && BROKEN.has(r.status))
const unknown = results.filter((r) => r.status === undefined || (r.status !== 200 && !BROKEN.has(r.status)))

for (const r of results) {
  if (r.status !== 200) continue
  if (r.data.title !== r.v.title) console.warn(`cảnh báo: ${r.v.id} tiêu đề oEmbed là "${r.data.title}"`)
  if (r.data.author_name !== r.v.channel) console.warn(`cảnh báo: ${r.v.id} kênh oEmbed là "${r.data.author_name}"`)
}

if (broken.length) {
  console.error(`videos:check: ${broken.length}/${videos.length} video hỏng (không tồn tại hoặc không cho nhúng):`)
  for (const r of broken) console.error(`  - HTTP ${r.status} ${label(r.v)}`)
  process.exit(1)
}
if (unknown.length) {
  console.error(`videos:check: không kiểm được ${unknown.length}/${videos.length} video (lỗi mạng hoặc YouTube lỗi tạm):`)
  for (const r of unknown) console.error(`  - ${r.error ?? `HTTP ${r.status}`} ${label(r.v)}`)
  process.exit(2)
}
console.log(`videos:check: ${videos.length}/${videos.length} video OK.`)
