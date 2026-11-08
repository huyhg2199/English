import { BRICKS, brickIdFromLessonId, BRICK_IDS, type BrickId, type ConceptId } from '@/data/foundation'

import type { Question } from './types'

/**
 * Sổ khái niệm cho luật "chỉ dùng kiến thức đã dạy" (story 27, `learning-rules.md` mục Nội dung bài).
 * Mỗi câu hỏi khai báo tay khái niệm nó cần (`Question.requires`): khái niệm của viên gạch (`ConceptId`, do `BRICKS[].teaches`
 * dạy) hoặc khái niệm của bài T1 (`LessonConceptId`, bảng dưới). Không suy ra bằng regex.
 */

/** 4 bài T1 theo thứ tự lộ trình. */
export const T1_LESSON_IDS = ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4'] as const
export type T1LessonId = (typeof T1_LESSON_IDS)[number]

/** Khái niệm do từng bài T1 dạy (không trùng `CONCEPT_IDS`; mỗi khái niệm do đúng một bài dạy). */
export const T1_LESSON_CONCEPTS = {
  's1-t1-w1': ['monophthongs'],
  's1-t1-w2': ['present-simple', 'diphthongs'],
  's1-t1-w3': ['present-simple-negative', 'present-simple-questions', 'consonants'],
  's1-t1-w4': ['final-consonants', 'verb-s-endings'],
} as const satisfies Record<T1LessonId, readonly string[]>

export type LessonConceptId = (typeof T1_LESSON_CONCEPTS)[T1LessonId][number]

/** Khái niệm một câu hỏi có thể cần. */
export type RequiredConcept = ConceptId | LessonConceptId

export type ConceptSource = { brick: BrickId } | { lesson: T1LessonId }

const SOURCES: ReadonlyMap<string, ConceptSource> = new Map<string, ConceptSource>([
  ...BRICKS.flatMap((b) => b.teaches.map((c) => [c, { brick: b.id }] as const)),
  ...T1_LESSON_IDS.flatMap((lesson) => T1_LESSON_CONCEPTS[lesson].map((c) => [c, { lesson }] as const)),
])

/** Ai dạy khái niệm `c`: viên gạch hay bài T1; id lạ → `undefined`. */
export function conceptSource(c: string): ConceptSource | undefined {
  return SOURCES.get(c)
}

function lessonIndex(lessonId: string): number {
  return (T1_LESSON_IDS as readonly string[]).indexOf(lessonId)
}

/**
 * Lỗi khai báo `requires` của một câu (rỗng = hợp lệ). Hàm thuần, dùng cho test tĩnh.
 * - Câu T1: mỗi khái niệm là của viên bất kỳ, hoặc của bài T1 đứng trước hoặc chính bài của câu.
 * - Câu `fNN`: mỗi khái niệm do viên từ F01 tới viên cuối hàng của câu dạy, và có ít nhất 1 khái niệm của chính viên.
 * - Câu khác (T2–T4): không khai báo thì bỏ qua; có khai báo thì mọi khái niệm phải có người dạy.
 * Thiếu `requires` (với câu T1 / Sân ga), mảng rỗng, trùng hay id lạ đều là lỗi.
 */
export function requiresViolations(q: Question): string[] {
  const t1 = lessonIndex(q.lessonId)
  const brick = brickIdFromLessonId(q.lessonId)
  const requires = q.requires
  if (requires === undefined) return t1 >= 0 || brick ? [`${q.id}: thiếu requires`] : []
  const out: string[] = []
  if (requires.length === 0) out.push(`${q.id}: requires rỗng`)
  if (new Set(requires).size !== requires.length) out.push(`${q.id}: requires có khái niệm trùng`)

  const lastBrick = brick ? BRICKS.filter((b) => b.row === BRICKS.find((x) => x.id === brick)!.row).at(-1)!.id : null
  for (const c of requires) {
    const source = conceptSource(c)
    if (!source) {
      out.push(`${q.id}: khái niệm lạ "${c}"`)
      continue
    }
    if (t1 >= 0) {
      if ('lesson' in source && lessonIndex(source.lesson) > t1) out.push(`${q.id}: "${c}" dạy ở ${source.lesson}, sau bài của câu`)
    } else if (brick && lastBrick) {
      if ('lesson' in source) out.push(`${q.id}: "${c}" là khái niệm bài T1, câu Sân ga không được dùng`)
      else if (BRICK_IDS.indexOf(source.brick) > BRICK_IDS.indexOf(lastBrick))
        out.push(`${q.id}: "${c}" dạy ở ${source.brick}, sau viên cuối hàng ${lastBrick}`)
    }
  }
  if (brick && !requires.some((c) => (conceptSource(c) as { brick?: BrickId } | undefined)?.brick === brick)) {
    out.push(`${q.id}: không có khái niệm nào của chính viên ${brick}`)
  }
  return out
}
