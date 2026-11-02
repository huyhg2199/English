/** Một mảnh của câu `en`: từ (chữ cái, số, nháy giữa từ, gạch nối giữa từ) hoặc phần còn lại (khoảng trắng, dấu câu). */
export type Token = { text: string; word: boolean }

const WORD = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g

/** Tách câu thành mảnh; nối các `text` lại đúng bằng câu gốc. */
export function tokenize(text: string): Token[] {
  const out: Token[] = []
  let last = 0
  for (const m of text.matchAll(WORD)) {
    const at = m.index ?? 0
    if (at > last) out.push({ text: text.slice(last, at), word: false })
    out.push({ text: m[0], word: true })
    last = at + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), word: false })
  return out
}

/** Chữ thường, nháy cong → thẳng, bỏ mọi ký tự không phải chữ / số / nháy. */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/[^a-z0-9']/g, '')
    .replace(/^'+|'+$/g, '')
}

/**
 * Các dạng gốc có thể của một từ để so với danh sách từ (works → work, studied → study, making → make, Anna's → anna).
 * Luôn có chính từ đó ở đầu. Chỉ là luật đuôi đơn giản, đủ để khớp từ NGSL/TSL.
 */
export function wordForms(word: string): string[] {
  const w = normalizeWord(word).replace(/'s$/, '')
  const out = new Set<string>([w])
  const add = (s: string) => s.length >= 2 && out.add(s)
  if (w.endsWith('ies')) add(`${w.slice(0, -3)}y`)
  if (w.endsWith('es')) add(w.slice(0, -2))
  if (w.endsWith('s') && !w.endsWith('ss')) add(w.slice(0, -1))
  if (w.endsWith('ied')) add(`${w.slice(0, -3)}y`)
  if (w.endsWith('ed')) {
    add(w.slice(0, -2))
    add(w.slice(0, -1))
    if (/([b-df-hj-np-tv-z])\1ed$/.test(w)) add(w.slice(0, -3))
  }
  if (w.endsWith('ing')) {
    add(w.slice(0, -3))
    add(`${w.slice(0, -3)}e`)
    if (/([b-df-hj-np-tv-z])\1ing$/.test(w)) add(w.slice(0, -4))
  }
  return [...out]
}

/** Từ trong `words` khớp với một dạng của `word`, hoặc null. */
export function matchWord(word: string, words: ReadonlySet<string>): string | null {
  for (const f of wordForms(word)) if (words.has(f)) return f
  return null
}

/**
 * Từ chức năng (đại từ, mạo từ, giới từ, trợ động từ, liên từ, nói tắt thường gặp): không đem ra ẩn khi điền từ,
 * không tính là "từ đã học" khi tô câu (vì câu nào cũng có).
 */
export const FUNCTION_WORDS: ReadonlySet<string> = new Set(
  (
    'a an the this that these those i me my mine you your yours he him his she her hers it its we us our ours they them their theirs ' +
    'am is are was were be been being do does did done have has had having will would shall should can could may might must ' +
    'and or but so if as than then because while when where what who whom whose which why how ' +
    'of to in on at by for from with about into onto over under up down out off near after before around ' +
    'not no yes oh ok okay well just very too also there here all some any each every both ' +
    "i'm you're he's she's it's we're they're i've you've we've they've i'll you'll he'll she'll we'll they'll " +
    "i'd you'd he'd she'd we'd they'd don't doesn't didn't isn't aren't wasn't weren't can't won't let's that's what's there's"
  ).split(' '),
)

export function isFunctionWord(word: string): boolean {
  return FUNCTION_WORDS.has(normalizeWord(word))
}

/** Một đoạn của câu `en` khi vẽ chú thích: `note` có thì đoạn đó là cụm được chú thích. */
export type NoteSegment<N extends { term: string }> = { text: string; note?: N }

/**
 * Tách câu theo các cụm chú thích (không phân biệt hoa thường, đúng ranh giới từ, mỗi cụm lần xuất hiện đầu tiên,
 * cụm dài ưu tiên, không chồng nhau). Nối các `text` lại đúng bằng câu gốc. Cụm không có trong câu thì bỏ qua.
 */
export function splitByNotes<N extends { term: string }>(en: string, notes: readonly N[] = []): NoteSegment<N>[] {
  const lower = en.toLowerCase()
  const spans: { from: number; to: number; note: N }[] = []
  const isWordChar = (ch: string | undefined) => ch !== undefined && /[A-Za-z0-9']/.test(ch)
  for (const note of [...notes].sort((a, b) => b.term.length - a.term.length)) {
    const term = note.term.toLowerCase().trim()
    if (!term) continue
    let at = lower.indexOf(term)
    while (at >= 0) {
      const to = at + term.length
      const bounded = !isWordChar(en[at - 1]) && !isWordChar(en[to])
      const free = spans.every((s) => to <= s.from || at >= s.to)
      if (bounded && free) {
        spans.push({ from: at, to, note })
        break
      }
      at = lower.indexOf(term, at + 1)
    }
  }
  spans.sort((a, b) => a.from - b.from)
  const out: NoteSegment<N>[] = []
  let last = 0
  for (const s of spans) {
    if (s.from > last) out.push({ text: en.slice(last, s.from) })
    out.push({ text: en.slice(s.from, s.to), note: s.note })
    last = s.to
  }
  if (last < en.length || out.length === 0) out.push({ text: en.slice(last) })
  return out
}
