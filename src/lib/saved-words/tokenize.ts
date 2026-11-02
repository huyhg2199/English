/**
 * Tách đoạn tin thành câu, rồi mỗi câu thành các phần để UI vẽ: phần là từ (chạm để lưu) có `word`
 * đã chuẩn hoá; số, dấu câu, khoảng trắng và URL có `word: null`. Ghép `text` các phần lại đúng bằng câu.
 */

export type TextPart = { text: string; word: string | null }
export type Sentence = { text: string; parts: TextPart[] }

const TOKEN = /(https?:\/\/\S+|www\.\S+)|(\p{L}+(?:['’]\p{L}+)*(?:-\p{L}+)*)/gu

/** Tách câu ở `.`, `!`, `?` (kèm ngoặc/nháy đóng) theo sau là khoảng trắng. */
export function splitSentences(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  return clean.split(/(?<=[.!?]["'”’)\]]?)\s+(?=\S)/u).filter((s) => s.length > 0)
}

function toParts(sentence: string): TextPart[] {
  const parts: TextPart[] = []
  let last = 0
  const pushText = (text: string) => {
    if (!text) return
    const prev = parts[parts.length - 1]
    if (prev && prev.word === null) prev.text += text
    else parts.push({ text, word: null })
  }
  for (const m of sentence.matchAll(TOKEN)) {
    const index = m.index ?? 0
    pushText(sentence.slice(last, index))
    if (m[1]) {
      pushText(m[0]) // URL: không phải từ
    } else {
      const word = m[0].toLowerCase().replace(/’/g, "'")
      // Chữ dính liền số (vd "GPT4", "3D") vẫn tách; một chữ cái lẻ (trừ a, I) không coi là từ.
      if (word.length > 1 || word === 'a' || word === 'i') parts.push({ text: m[0], word })
      else pushText(m[0])
    }
    last = index + m[0].length
  }
  pushText(sentence.slice(last))
  return parts
}

export function tokenize(text: string): Sentence[] {
  return splitSentences(text).map((s) => ({ text: s, parts: toParts(s) }))
}
