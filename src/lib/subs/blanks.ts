import { isFunctionWord, matchWord, normalizeWord, tokenize, type Token } from './text'
import type { SubCue } from './types'

/** Câu từ chừng này từ trở lên thì ẩn 2 từ, ngắn hơn thì 1. */
export const TWO_BLANKS_FROM_WORDS = 8

/**
 * Chọn 1–2 từ khoá để ẩn trong chế độ "Điền từ" (trả về vị trí trong `tokenize(cue.en)`, tăng dần).
 * Ưu tiên: từ NGSL/TSL đã học > từ của bài > từ nội dung khác; bỏ từ chức năng, số, từ ngắn hơn 3 chữ và từ viết hoa
 * không đứng đầu câu (tên riêng).
 * Cùng mức thì từ dài hơn trước, rồi từ đứng trước. Không có từ hợp lệ → [] (cue đó không dừng).
 * Thuần và xác định: cùng đầu vào luôn ra cùng kết quả.
 */
export function pickBlanks(
  cue: Pick<SubCue, 'en'>,
  knownWords: ReadonlySet<string>,
  lessonWords: ReadonlySet<string>,
): number[] {
  const tokens = tokenize(cue.en)
  const wordCount = tokens.filter((t) => t.word).length
  const candidates: { index: number; rank: number; length: number }[] = []
  const seen = new Set<string>()
  let sentenceStart = true
  tokens.forEach((t, index) => {
    if (!t.word) {
      if (/[.?!:]/.test(t.text)) sentenceStart = true
      return
    }
    const initial = sentenceStart
    sentenceStart = false
    const w = normalizeWord(t.text)
    // Chữ hoa giữa câu thường là tên riêng (Anna, Washington): không ẩn.
    if (!initial && /^[A-Z]/.test(t.text)) return
    if (w.length < 3 || /\d/.test(w) || w.includes("'") || isFunctionWord(w) || seen.has(w)) return
    seen.add(w)
    const rank = matchWord(w, knownWords) ? 0 : matchWord(w, lessonWords) ? 1 : 2
    candidates.push({ index, rank, length: w.length })
  })
  candidates.sort((a, b) => a.rank - b.rank || b.length - a.length || a.index - b.index)
  const count = wordCount >= TWO_BLANKS_FROM_WORDS ? 2 : 1
  return candidates
    .slice(0, count)
    .map((c) => c.index)
    .sort((a, b) => a - b)
}

/** Chuẩn hoá để chấm: chữ thường, bỏ dấu câu (kể cả nháy), gộp khoảng trắng. */
function forGrading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’ʼ`']/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Chấm một ô điền từ: không phân biệt hoa thường, dấu câu, khoảng trắng / gạch nối (checkin = check-in); ô trống là sai. */
export function checkFill(expected: string, typed: string): boolean {
  const e = forGrading(expected)
  const t = forGrading(typed)
  if (e === '' || t === '') return false
  return t === e || t.replace(/\s+/g, '') === e.replace(/\s+/g, '')
}

/** % câu đúng (làm tròn); chưa làm câu nào → 0. */
export function fillPercent(correct: number, total: number): number {
  if (!(total > 0)) return 0
  return Math.round((Math.min(Math.max(correct, 0), total) / total) * 100)
}

export type { Token }
