/**
 * So khớp câu nói (kết quả nhận giọng nói) với câu mẫu: hàm thuần, không phụ thuộc trình duyệt.
 * Chuẩn hoá: chữ thường, bỏ dấu câu, nói tắt → dạng đầy đủ (I'm → i am), số → chữ (2 → two), okay → ok.
 * Căn chỉnh từng từ bằng dãy con chung dài nhất (LCS) nên từ thiếu, thừa hay lệch đều không làm trượt cả câu.
 */

/** Nói tắt không theo quy tắc chung (dạng gốc đổi chữ, hoặc 's / 'm). */
const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  "can't": 'can not',
  cannot: 'can not',
  "won't": 'will not',
  "shan't": 'shall not',
  "ain't": 'is not',
  "let's": 'let us',
  "he's": 'he is',
  "she's": 'she is',
  "it's": 'it is',
  "that's": 'that is',
  "what's": 'what is',
  "where's": 'where is',
  "who's": 'who is',
  "how's": 'how is',
  "there's": 'there is',
  "here's": 'here is',
}

/** Đuôi nói tắt theo quy tắc chung: didn't → did not, you'll → you will, we've → we have, they'd → they would. */
const SUFFIXES: readonly [suffix: string, full: string][] = [
  ["n't", 'not'],
  ["'ll", 'will'],
  ["'ve", 'have'],
  ["'re", 'are'],
  ["'d", 'would'],
]

function expandContraction(word: string): string[] | null {
  if (CONTRACTIONS[word]) return CONTRACTIONS[word].split(' ')
  for (const [suffix, full] of SUFFIXES) {
    if (word.length > suffix.length && word.endsWith(suffix)) return [word.slice(0, -suffix.length), full]
  }
  return null
}

const ALIASES: Record<string, string> = { okay: 'ok', 'o.k.': 'ok' }

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/** 0–999 → chữ ("21" → "twenty one"); số lớn hơn giữ nguyên chữ số. */
export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) return String(n)
  if (n < 20) return ONES[n]
  if (n < 100) return n % 10 === 0 ? TENS[Math.floor(n / 10)] : `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}`
  const rest = n % 100
  return rest === 0 ? `${ONES[Math.floor(n / 100)]} hundred` : `${ONES[Math.floor(n / 100)]} hundred ${numberToWords(rest)}`
}

/** Từ đã chuẩn hoá của một đoạn văn (có thể nhiều hơn số từ gốc vì nói tắt được tách ra). */
export function normalizeWords(text: string): string[] {
  const out: string[] = []
  const raw = text
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .split(/[\s\-–—/]+/)
  for (const piece of raw) {
    const alias = ALIASES[piece.replace(/[^a-z0-9.']/g, '')]
    if (alias) {
      out.push(alias)
      continue
    }
    // Bỏ dấu câu, giữ dấu nháy giữa từ (I'm, don't).
    const word = piece.replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, '')
    if (!word) continue
    if (ALIASES[word]) out.push(ALIASES[word])
    else if (expandContraction(word)) out.push(...expandContraction(word)!)
    else if (/^\d+$/.test(word)) out.push(...numberToWords(Number(word)).split(' '))
    else out.push(word.replace(/'/g, ''))
  }
  return out
}

export type ComparedWord = { text: string; ok: boolean }
export type Comparison = { words: ComparedWord[]; score: number }

/** Chỉ số các phần tử của `a` nằm trong một LCS của `a` và `b`. */
function lcsMatches(a: readonly string[], b: readonly string[]): Set<number> {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const matched = new Set<number>()
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      matched.add(i)
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return matched
}

/**
 * So câu mẫu `expected` với câu nghe được `heard`. Trả về từng từ của câu mẫu (giữ nguyên chữ hiển thị)
 * kèm đúng/sai và % từ đúng (làm tròn). Một từ gốc tách thành nhiều từ chuẩn hoá (I'm → i am) chỉ đúng khi đủ cả.
 */
export function compareSpeech(expected: string, heard: string): Comparison {
  const display = expected.split(/\s+/).filter((w) => normalizeWords(w).length > 0)
  const owners: number[] = []
  const flat: string[] = []
  display.forEach((w, idx) => {
    for (const t of normalizeWords(w)) {
      flat.push(t)
      owners.push(idx)
    }
  })
  const matched = lcsMatches(flat, normalizeWords(heard))
  const ok = display.map(() => true)
  flat.forEach((_, k) => {
    if (!matched.has(k)) ok[owners[k]] = false
  })
  const words = display.map((text, idx) => ({ text, ok: ok[idx] }))
  const score = words.length === 0 ? 0 : Math.round((words.filter((w) => w.ok).length / words.length) * 100)
  return { words, score }
}

/** Kết quả so khớp kèm đúng phương án nhận dạng đã dùng để chấm (để hiện "nghe được"). */
export type ChosenComparison = Comparison & { heard: string }

/** So với nhiều phương án nhận dạng, lấy phương án điểm cao nhất (phương án đầu thắng khi bằng điểm). */
export function bestComparison(expected: string, alternatives: readonly string[]): ChosenComparison {
  let best: ChosenComparison | null = null
  for (const alt of alternatives) {
    const c = compareSpeech(expected, alt)
    if (!best || c.score > best.score) best = { ...c, heard: alt }
  }
  return best ?? { ...compareSpeech(expected, ''), heard: '' }
}
