// Chạy sau `vite build`: bảo đảm chunk từ vựng (words-*.js) có trong precache manifest của dist/sw.js để ôn offline.
// Vượt `maximumFileSizeToCacheInBytes` (vite.config.ts) thì vite-plugin-pwa đã làm build lỗi; script này chặn trường hợp
// chunk vắng khỏi precache vì lý do khác (vd globPatterns đổi).
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const fail = (msg) => {
  console.error(`check-precache: ${msg}`)
  process.exit(1)
}

let sw
try {
  sw = readFileSync(`${dist}sw.js`, 'utf8')
} catch {
  fail('không tìm thấy dist/sw.js (chạy vite build trước)')
}
let assets
try {
  assets = readdirSync(`${dist}assets`)
} catch {
  fail('không đọc được dist/assets (chạy vite build trước)')
}
const chunks = assets.filter((f) => /^words-.*\.js$/.test(f))
if (chunks.length === 0) fail('không tìm thấy chunk words-*.js trong dist/assets')
// Mục precache manifest workbox: {url:"assets/words-xxx.js",revision:...}
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const missing = chunks.filter((f) => !new RegExp(`url:\\s*["']assets/${escape(f)}["']`).test(sw))
if (missing.length) fail(`chunk từ vựng không có trong precache manifest của dist/sw.js: ${missing.join(', ')}`)
console.log(`check-precache: OK (${chunks.join(', ')} có trong precache)`)
