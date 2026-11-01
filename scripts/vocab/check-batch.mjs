// Kiểm một lô AI trước khi chạy build:
//   node scripts/vocab/check-batch.mjs <file.json> <hạng đầu> <hạng cuối> [ngsl|tsl]
// Lô phải có đúng các từ của danh sách (mặc định NGSL) trong khoảng hạng đó, theo thứ tự hạng, mỗi mục hợp lệ.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { readList, validateAiEntry } from './lib.mjs'

const [file, from, to, list = 'ngsl'] = process.argv.slice(2)
if (!file || !from || !to || !['ngsl', 'tsl'].includes(list)) {
  console.error('Cách dùng: node scripts/vocab/check-batch.mjs <file.json> <hạng đầu> <hạng cuối> [ngsl|tsl]')
  process.exit(2)
}

const source =
  list === 'ngsl'
    ? readList(fileURLToPath(new URL('./source/NGSL_12_stats.csv', import.meta.url)), 'Lemma', 'SFI Rank')
    : readList(fileURLToPath(new URL('./source/TSL_12_stats.csv', import.meta.url)), 'Word', 'TSL Rank')
const expected = source.filter((e) => e.rank >= Number(from) && e.rank <= Number(to)).map((e) => e.word)
const batch = JSON.parse(readFileSync(file, 'utf8'))
const errors = []
if (!Array.isArray(batch)) errors.push('file phải là mảng JSON')
else {
  if (batch.length !== expected.length) errors.push(`có ${batch.length} mục, cần ${expected.length}`)
  batch.forEach((e, i) => {
    if (e?.word !== expected[i]) errors.push(`#${i}: là "${e?.word}", cần "${expected[i]}"`)
    for (const msg of validateAiEntry(e)) errors.push(`"${e?.word}": ${msg}`)
  })
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`OK ${batch.length} mục`)
