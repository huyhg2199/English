import { allTenses, getLessonContent } from '@/data/lessons'
import { lessonTenseIds } from '@/lib/tense-choice'

import type { LessonTense } from './highlight'
import { isFunctionWord, normalizeWord, tokenize } from './text'

export type SubLessonContext = {
  /** Thì của bài (để tô câu). */
  tenses: LessonTense[]
  /** Từ nội dung trong câu ví dụ / câu luyện của bài (để ưu tiên khi ẩn từ). */
  words: Set<string>
}

/**
 * Ngữ cảnh bài gắn video (story 15 `lessonId`): thì của bài và từ của bài. Bài không có nội dung → rỗng. Thì gồm thì của
 * bài và thì của các bên khối "Chọn thì" (story 39), nên video so will / going to ở s1-t3-w2 tô cả câu will.
 */
export function subLessonContext(lessonId: string): SubLessonContext {
  const content = getLessonContent(lessonId)
  const byId = new Map(allTenses().map((t) => [t.id, t]))
  const tenses = lessonTenseIds(content).flatMap((id) => {
    const t = byId.get(id)
    return t ? [{ id: t.id, name: t.name }] : []
  })
  const texts: string[] = []
  for (const t of content?.grammar?.tenses ?? []) texts.push(...t.examples.map((e) => e.en))
  for (const s of content?.pronunciation?.sentences ?? []) texts.push(s.text)
  for (const g of content?.pronunciation?.groups ?? []) for (const s of g.sounds) texts.push(...s.examples.map((e) => e.form ?? e.word))
  const words = new Set<string>()
  for (const text of texts) {
    for (const tok of tokenize(text)) {
      const w = normalizeWord(tok.text)
      if (tok.word && w.length >= 3 && !isFunctionWord(w)) words.add(w)
    }
  }
  return { tenses, words }
}
