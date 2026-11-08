/** Câu ví dụ tách quanh chỗ trống: `before + answer + after` bằng đúng câu gốc. */
export type ClozeParts = { before: string; answer: string; after: string }

/** Một token = chuỗi chữ cái và dấu `'` (cả `’`), nên "it's" là một token, không khớp "it". */
const TOKEN = /[\p{L}'’]+/gu

/**
 * Tìm token đầu tiên trong câu khớp một dạng trong `forms` (không phân biệt hoa thường) và tách câu quanh nó. `answer` giữ
 * nguyên hoa thường như trong câu. Không có token nào khớp → null (thẻ hiện như thường).
 */
export function splitCloze(sentence: string, forms: readonly string[]): ClozeParts | null {
  const wanted = new Set(forms.map((f) => f.toLowerCase()))
  for (const match of sentence.matchAll(TOKEN)) {
    if (!wanted.has(match[0].toLowerCase())) continue
    const start = match.index
    const end = start + match[0].length
    return { before: sentence.slice(0, start), answer: match[0], after: sentence.slice(end) }
  }
  return null
}

/** Câu có chỗ trống `___` thay cho phần `answer`. */
export function clozeText(parts: ClozeParts): string {
  return `${parts.before}___${parts.after}`
}
