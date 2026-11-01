import { GRAMMAR_W1, GRAMMAR_W2, GRAMMAR_W3, GRAMMAR_W4 } from './t1-grammar'
import { PRONUNCIATION_W1, PRONUNCIATION_W2, PRONUNCIATION_W3, PRONUNCIATION_W4 } from './t1-pronunciation'
import type { LessonContent, Tense } from './types'

export * from './types'
export { getSpell, SPELLS } from './spells'

/** Nội dung học của các bài đã soạn (story 6: 4 bài T1). Bài khác chưa có nội dung. */
export const LESSON_CONTENTS: readonly LessonContent[] = [
  { lessonId: 's1-t1-w1', pronunciation: PRONUNCIATION_W1, grammar: GRAMMAR_W1, placementLink: true },
  { lessonId: 's1-t1-w2', pronunciation: PRONUNCIATION_W2, grammar: GRAMMAR_W2 },
  { lessonId: 's1-t1-w3', pronunciation: PRONUNCIATION_W3, grammar: GRAMMAR_W3 },
  { lessonId: 's1-t1-w4', pronunciation: PRONUNCIATION_W4, grammar: GRAMMAR_W4 },
]

const byId = new Map(LESSON_CONTENTS.map((c) => [c.lessonId, c]))

export function getLessonContent(lessonId: string): LessonContent | undefined {
  return byId.get(lessonId)
}

/** Mọi thì đã soạn, theo thứ tự bài. */
export function allTenses(): Tense[] {
  return LESSON_CONTENTS.flatMap((c) => c.grammar?.tenses ?? [])
}
