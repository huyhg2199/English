// Gộp NGSL 1.2 + TSL 1.2 (CSV gốc) với các lô dữ liệu AI → src/data/vocab/words.json.
// Chạy: `npm run vocab:build`. Không gọi AI hay mạng; chỉ đọc file trong repo. Kết quả xác định (idempotent).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { readList, slugify, validateAiEntry } from './lib.mjs'

const here = (p) => fileURLToPath(new URL(p, import.meta.url))
const OUT_DIR = here('../../src/data/vocab/')
const OUT = `${OUT_DIR}words.json`

const errors = []
const ngsl = readList(here('./source/NGSL_12_stats.csv'), 'Lemma', 'SFI Rank')
const tsl = readList(here('./source/TSL_12_stats.csv'), 'Word', 'TSL Rank')

const words = [
  ...ngsl.map((e) => ({ id: `ngsl-${slugify(e.word)}`, word: e.word, list: 'ngsl', rank: e.rank })),
  ...tsl.map((e) => ({ id: `tsl-${slugify(e.word)}`, word: e.word, list: 'tsl', rank: e.rank })),
]

const byWord = new Map()
const ids = new Set()
for (const w of words) {
  if (!w.id) errors.push(`"${w.word}" có id rỗng`)
  if (ids.has(w.id)) errors.push(`trùng id "${w.id}"`)
  ids.add(w.id)
  if (byWord.has(w.word)) errors.push(`trùng từ "${w.word}" giữa các danh sách`)
  byWord.set(w.word, w)
}

// Lô AI: mọi file *.json trong scripts/vocab/ai/, đọc theo tên file để kết quả ổn định.
const aiDir = here('./ai/')
const batchFiles = readdirSync(aiDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
const withAi = new Set()
for (const file of batchFiles) {
  const batch = JSON.parse(readFileSync(aiDir + file, 'utf8'))
  if (!Array.isArray(batch)) {
    errors.push(`${file}: phải là mảng JSON`)
    continue
  }
  for (const entry of batch) {
    const label = `${file} "${entry?.word}"`
    const problems = validateAiEntry(entry)
    if (problems.length) {
      errors.push(...problems.map((p) => `${label}: ${p}`))
      continue
    }
    const target = byWord.get(entry.word)
    if (!target) {
      errors.push(`${label}: không có trong NGSL/TSL`)
      continue
    }
    if (withAi.has(entry.word)) {
      errors.push(`${label}: đã có dữ liệu ở lô khác`)
      continue
    }
    withAi.add(entry.word)
    const { pos, ipa, syllables, stressIndex, meaningVi, exampleEn, exampleVi } = entry
    Object.assign(target, { pos, ipa, syllables, stressIndex, meaningVi, exampleEn, exampleVi })
  }
}

if (errors.length) {
  console.error(`vocab:build lỗi (${errors.length}):\n` + errors.join('\n'))
  process.exit(1)
}

// Mỗi từ một dòng để diff dễ đọc.
const json = `[\n${words.map((w) => JSON.stringify(w)).join(',\n')}\n]\n`
mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, json)
console.log(
  `words.json: ${ngsl.length} NGSL + ${tsl.length} TSL, ${withAi.size} từ có dữ liệu AI (${batchFiles.length} lô)`,
)
