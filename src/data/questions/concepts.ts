import { BRICKS, brickIdFromLessonId, BRICK_IDS, type BrickId, type ConceptId } from '@/data/foundation'

import type { Question } from './types'

/**
 * Sổ khái niệm cho luật "chỉ dùng kiến thức đã dạy" (story 27, `learning-rules.md` mục Nội dung bài).
 * Mỗi câu hỏi khai báo tay khái niệm nó cần (`Question.requires`): khái niệm của viên gạch (`ConceptId`, do `BRICKS[].teaches`
 * dạy) hoặc khái niệm của bài lộ trình (`LessonConceptId`, bảng T1 của story 27 và bảng T2–T4 của story 47). Không suy ra
 * bằng regex.
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

/**
 * 15 bài có câu hỏi trong `QUESTION_BANK`, theo thứ tự lộ trình (story 47): T1 → T4, bỏ tuần Tết `s1-t4-w2`. Câu của các bài
 * này bắt buộc khai báo `requires`. Thêm bài có câu hỏi (vd Chặng 2) thì thêm id bài vào đây (đúng thứ tự lộ trình) và khai
 * báo khái niệm của bài ở `T2_T4_LESSON_CONCEPTS` (có thể rỗng); không thì câu của bài rơi về luật "câu khác" (như câu O.W.L.,
 * không bắt buộc `requires`) và test `requires.test.ts` báo lệch tập bài.
 */
export const LESSON_CONCEPT_LESSON_IDS = [
  ...T1_LESSON_IDS,
  's1-t2-w1',
  's1-t2-w2',
  's1-t2-w3',
  's1-t2-w4',
  's1-t3-w1',
  's1-t3-w2',
  's1-t3-w3',
  's1-t3-w4',
  's1-t4-w1',
  's1-t4-w3',
  's1-t4-w4',
] as const
export type ConceptLessonId = (typeof LESSON_CONCEPT_LESSON_IDS)[number]
type T2T4LessonId = Exclude<ConceptLessonId, T1LessonId>

/**
 * Khái niệm do từng bài T2–T4 dạy (story 47; không trùng `CONCEPT_IDS` hay khái niệm T1, mỗi khái niệm do đúng một bài
 * dạy). Ôn tổng `s1-t4-w4` không dạy khái niệm mới.
 */
export const T2_T4_LESSON_CONCEPTS = {
  's1-t2-w1': ['present-continuous', 'two-syllable-stress'],
  's1-t2-w2': ['past-to-be', 'past-simple', 'subject-questions', 'suffix-stress'],
  's1-t2-w3': ['past-simple-irregular', 'ed-endings'],
  's1-t2-w4': ['past-continuous'],
  's1-t3-w1': ['will', 'weak-forms'],
  's1-t3-w2': ['going-to', 'will-vs-going-to', 'linking'],
  's1-t3-w3': ['present-perfect', 'sentence-stress'],
  's1-t3-w4': ['present-perfect-vs-past'],
  's1-t4-w1': ['modals', 'reductions'],
  's1-t4-w3': ['comparatives', 'passive-present'],
  's1-t4-w4': [],
} as const satisfies Record<T2T4LessonId, readonly string[]>

/** Khái niệm mọi bài dạy (T1 và T2–T4), theo bài. */
export const LESSON_CONCEPTS: Readonly<Record<ConceptLessonId, readonly string[]>> = {
  ...T1_LESSON_CONCEPTS,
  ...T2_T4_LESSON_CONCEPTS,
}

export type LessonConceptId =
  | (typeof T1_LESSON_CONCEPTS)[T1LessonId][number]
  | (typeof T2_T4_LESSON_CONCEPTS)[T2T4LessonId][number]

/** Khái niệm một câu hỏi có thể cần. */
export type RequiredConcept = ConceptId | LessonConceptId

export type ConceptSource = { brick: BrickId } | { lesson: ConceptLessonId }

const SOURCES: ReadonlyMap<string, ConceptSource> = new Map<string, ConceptSource>([
  ...BRICKS.flatMap((b) => b.teaches.map((c) => [c, { brick: b.id }] as const)),
  ...LESSON_CONCEPT_LESSON_IDS.flatMap((lesson) => LESSON_CONCEPTS[lesson].map((c) => [c, { lesson }] as const)),
])

/** Ai dạy khái niệm `c`: viên gạch hay bài lộ trình; id lạ → `undefined`. */
export function conceptSource(c: string): ConceptSource | undefined {
  return SOURCES.get(c)
}

/** Thứ tự của bài trong `LESSON_CONCEPT_LESSON_IDS` (bài khác → −1). */
export function conceptLessonIndex(lessonId: string): number {
  return (LESSON_CONCEPT_LESSON_IDS as readonly string[]).indexOf(lessonId)
}

/**
 * Lỗi khai báo `requires` của một câu (rỗng = hợp lệ). Hàm thuần, dùng cho test tĩnh.
 * - Câu của 15 bài lộ trình (T1–T4, story 47): bắt buộc có `requires`; mỗi khái niệm là của viên bất kỳ, hoặc của bài đứng
 *   trước hoặc chính bài của câu (thứ tự `LESSON_CONCEPT_LESSON_IDS`).
 * - Câu `fNN`: mỗi khái niệm do viên từ F01 tới viên cuối hàng của câu dạy, có ít nhất 1 khái niệm của chính viên, và không
 *   dùng khái niệm bài.
 * - Câu khác (câu O.W.L. `q-owl-…` gắn bài T2–T4, luật cũ): không khai báo thì bỏ qua; có khai báo thì mọi khái niệm phải có người dạy.
 * Thiếu `requires` (câu bài / Sân ga), mảng rỗng, trùng hay id lạ đều là lỗi.
 */
export function requiresViolations(q: Question): string[] {
  // Câu O.W.L. (story 40) giữ luật cũ: chỉ câu gắn bài T1 theo luật bài; câu gắn bài T2–T4 theo luật "câu khác".
  const owl = q.id.startsWith('q-owl-')
  const lessonIdx = owl ? (T1_LESSON_IDS as readonly string[]).indexOf(q.lessonId) : conceptLessonIndex(q.lessonId)
  const brick = brickIdFromLessonId(q.lessonId)
  const requires = q.requires
  if (requires === undefined) return lessonIdx >= 0 || brick ? [`${q.id}: thiếu requires`] : []
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
    if (lessonIdx >= 0) {
      if ('lesson' in source && conceptLessonIndex(source.lesson) > lessonIdx) {
        out.push(`${q.id}: "${c}" dạy ở ${source.lesson}, sau bài của câu`)
      }
    } else if (brick && lastBrick) {
      if ('lesson' in source) out.push(`${q.id}: "${c}" là khái niệm bài, câu Sân ga không được dùng`)
      else if (BRICK_IDS.indexOf(source.brick) > BRICK_IDS.indexOf(lastBrick))
        out.push(`${q.id}: "${c}" dạy ở ${source.brick}, sau viên cuối hàng ${lastBrick}`)
    }
  }
  if (brick && !requires.some((c) => (conceptSource(c) as { brick?: BrickId } | undefined)?.brick === brick)) {
    out.push(`${q.id}: không có khái niệm nào của chính viên ${brick}`)
  }
  return out
}
