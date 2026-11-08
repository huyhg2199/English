// Gắn nhãn ngữ pháp cho câu ví dụ trong tập rà (story 24) → scripts/vocab/example-labels.json.
// Chạy: `npm run vocab:label-examples`. Không gọi AI hay mạng; chỉ đọc file trong repo. Kết quả xác định (chạy lại không
// đổi file). Còn câu `todo` (bị gắn nhãn mà chưa có override sạch hay lý do trong `accepted`) thì in danh sách, exit 1.
//
// Tập rà: NGSL hạng 1–500, cộng id quét bằng chữ trong src/data/vocab/starter-words.ts (chuỗi '<từ>' → `ngsl-<từ>`) và
// src/data/foundation/bricks/*.ts (chuỗi 'ngsl-…' / 'tsl-…'). Câu hiệu lực = override trong
// src/data/vocab/example-overrides.json nếu có, không thì câu AI trong words.json.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { labelExamples } from './example-features.mjs'

const here = (p) => fileURLToPath(new URL(p, import.meta.url))
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))

const OUT = here('./example-labels.json')
const REVIEW_MAX_RANK = 500

const words = readJson(here('../../src/data/vocab/words.json'))
const { overrides = {}, accepted = {} } = readJson(here('../../src/data/vocab/example-overrides.json'))
const known = new Set(words.map((w) => w.id))

const reviewIds = new Set(words.filter((w) => w.list === 'ngsl' && w.rank <= REVIEW_MAX_RANK).map((w) => w.id))

const starter = readFileSync(here('../../src/data/vocab/starter-words.ts'), 'utf8')
for (const [, word] of starter.matchAll(/'([a-z]+)'/g)) if (known.has(`ngsl-${word}`)) reviewIds.add(`ngsl-${word}`)

const bricksDir = here('../../src/data/foundation/bricks/')
for (const file of readdirSync(bricksDir).filter((f) => f.endsWith('.ts')).sort()) {
  const text = readFileSync(`${bricksDir}${file}`, 'utf8')
  for (const [, id] of text.matchAll(/'((?:ngsl|tsl)-[^'\s]+)'/g)) if (known.has(id)) reviewIds.add(id)
}

const problems = []
for (const id of Object.keys(overrides)) if (!known.has(id)) problems.push(`override cho id lạ: ${id}`)
for (const id of Object.keys(accepted)) if (!known.has(id)) problems.push(`accepted cho id lạ: ${id}`)

const entries = labelExamples({ words, reviewIds, overrides, accepted })
// Cùng các luật với src/data/vocab/example-overrides.test.ts, để script và test không lệch nhau.
const byId = new Map(words.map((w) => [w.id, w]))
const labeled = new Map(entries.map((e) => [e.id, e]))
for (const id of [...Object.keys(overrides), ...Object.keys(accepted)]) {
  if (known.has(id) && !reviewIds.has(id)) problems.push(`id ngoài tập rà: ${id}`)
}
for (const id of Object.keys(overrides)) {
  if (known.has(id) && typeof byId.get(id).exampleEn !== 'string') problems.push(`override cho từ chưa có câu ví dụ: ${id}`)
}
for (const id of Object.keys(accepted)) {
  if (Object.hasOwn(overrides, id)) problems.push(`vừa override vừa accepted: ${id}`)
  else if (labeled.has(id) && labeled.get(id).features.length === 0) problems.push(`accepted thừa (câu không bị gắn nhãn): ${id}`)
}
writeFileSync(OUT, `${JSON.stringify(entries, null, 2)}\n`)

const count = (status) => entries.filter((e) => e.status === status).length
console.log(
  `${entries.length} câu: ${count('clean')} clean · ${count('override')} override · ${count('accepted')} accepted · ${count('todo')} todo`,
)
const todo = entries.filter((e) => e.status === 'todo')
for (const e of todo) console.log(`todo  ${e.id} [${e.features.join(', ')}] ${e.exampleEn}`)
for (const p of problems) console.log(`lỗi  ${p}`)
if (todo.length > 0 || problems.length > 0) process.exit(1)
