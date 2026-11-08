import { readSrs } from '@/lib/srs'
import type { Store } from '@/lib/storage'

import { isFunctionWord, matchWord, tokenize } from './text'
import type { SubCue } from './types'

/** Thì của bài gắn video (từ dữ liệu bài): id + tên hiển thị. */
export type LessonTense = { id: string; name: string }

/** Tối đa chừng này từ đã học được nêu trong lý do. */
export const MAX_REASON_WORDS = 3

/**
 * "Hiện tại đơn: câu khẳng định" → "Hiện tại đơn" (phần trước dấu hai chấm). Tên dạng "Ôn lại: viên gạch F13–F14 · to be
 * (am / is / are)" (story 26) → phần sau dấu " · " cuối: "to be (am / is / are)".
 */
export function shortTenseName(name: string): string {
  if (/^Ôn lại:/.test(name) && name.includes(' · ')) return name.slice(name.lastIndexOf(' · ') + 3).trim()
  return name.split(':')[0].trim()
}

/**
 * Vì sao cue được tô: thì của bài có trong câu (`cue.highlight`, đánh dấu lúc build) và/hoặc từ NGSL/TSL đã học có
 * trong câu (bỏ từ chức năng). Không có lý do → null (không tô).
 * Ví dụ "Hiện tại đơn · Từ đã học: work, here".
 */
export function highlightReason(
  cue: Pick<SubCue, 'en' | 'highlight'>,
  lesson: { tenses: readonly LessonTense[] },
  knownWords: ReadonlySet<string>,
): string | null {
  const parts: string[] = []
  const marked = new Set(cue.highlight ?? [])
  const tenseNames = [...new Set(lesson.tenses.filter((t) => marked.has(t.id)).map((t) => shortTenseName(t.name)))]
  parts.push(...tenseNames)
  const words: string[] = []
  for (const t of tokenize(cue.en)) {
    if (!t.word || isFunctionWord(t.text)) continue
    const m = matchWord(t.text, knownWords)
    if (m && !words.includes(m)) words.push(m)
  }
  if (words.length > 0) {
    const shown = words.slice(0, MAX_REASON_WORDS).join(', ')
    parts.push(`Từ đã học: ${shown}${words.length > MAX_REASON_WORDS ? '…' : ''}`)
  }
  return parts.length > 0 ? parts.join(' · ') : null
}

/** Từ đã học = thẻ SRS NGSL/TSL đã có (id `ngsl-<từ>` / `tsl-<từ>`, xem `src/data/vocab`). Thẻ tự thêm bị bỏ qua. */
export function knownWordsFromCardIds(ids: Iterable<string>): Set<string> {
  const out = new Set<string>()
  for (const id of ids) {
    const m = /^(?:ngsl|tsl)-(.+)$/.exec(id)
    if (m) out.add(m[1].toLowerCase())
  }
  return out
}

/** Từ NGSL/TSL đã học trong store (thẻ SRS đã có). */
export function knownWordsFromStore(store: Store): Set<string> {
  return knownWordsFromCardIds(Object.keys(readSrs(store).cards))
}
