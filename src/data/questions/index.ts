import { getLesson } from '@/data/roadmap'
import type { SectionId } from '@/data/roadmap/types'

import { T1_LESSON_IDS } from './concepts'
import { FOUNDATION_QUESTIONS } from './foundation'
import { OWL_QUESTIONS } from './owl'
import { T1_QUESTIONS } from './t1'
import { T2_T4_QUESTIONS } from './t2-t4'
import type { MistakeTag, Question } from './types'

export * from './types'
export * from './concepts'
export { FOUNDATION_QUESTIONS, FOUNDATION_QUIZZES, foundationQuiz, ROW_QUIZ_ID, ROW_QUIZ_SIZE } from './foundation'
export {
  OWL_CONTRASTS,
  OWL_QUESTIONS,
  OWL_TOPICS,
  type OwlContrast,
  type OwlContrastId,
  type OwlQuestion,
  type OwlTopic,
  type OwlTopicId,
} from './owl'

/** Toàn bộ ngân hàng câu: T1 (story 9) và T2–T4 (story 10). */
export const QUESTION_BANK: readonly Question[] = [...T1_QUESTIONS, ...T2_T4_QUESTIONS]

// Tra cả câu Sân ga và kho câu O.W.L. (story 40), không nằm trong `QUESTION_BANK`, để Sổ lỗi, kế hoạch ôn và
// "Vì sao sai?" hiện được câu của kiểm tra cuối hàng và của kỳ thi.
const byId = new Map<string, Question>([...QUESTION_BANK, ...FOUNDATION_QUESTIONS, ...OWL_QUESTIONS].map((q) => [q.id, q]))

/** Câu theo id, trong `QUESTION_BANK`, ngân hàng Sân ga hoặc kho câu O.W.L. */
export function getQuestion(id: string): Question | undefined {
  return byId.get(id)
}

/** Bộ lọc câu của một bài test (story 40): chỉ câu thuộc đoạn `sectionId` và mang một trong các nhãn `tags`. */
export type QuestionFilter = { sectionId: SectionId; tags: readonly MistakeTag[] }

/**
 * Một bài test bám bài: lấy `size` câu từ các bài `lessonIds`, mỗi bài ít nhất `minPerLesson` câu.
 * Story 40 thêm hai field tuỳ chọn; test không có hai field này chọn câu đúng như cũ.
 */
export type QuizDef = {
  id: string
  title: string
  description: string
  lessonIds: readonly string[]
  size: number
  minPerLesson: number
  /** Bài chứa link vào test (để quay lại). */
  homeLessonId: string
  /** Chỉ lấy câu khớp bộ lọc (vd đoạn Ngữ pháp nhãn `thì`) ở phần chính. Thiếu = mọi câu của `lessonIds`. */
  only?: QuestionFilter
  /**
   * Phần ôn bài cũ (nằm trong `size`): `size` câu khớp `only` lấy từ các bài `lessonIds` của phần ôn (không trùng bài
   * của phần chính), bốc bằng luồng ngẫu nhiên riêng. Phần chính còn `size − mix.size` câu.
   */
  mix?: { lessonIds: readonly string[]; size: number; only: QuestionFilter }
}

/** Số câu của bài kiểm tra một bài: 5 trong 6 câu (không có TTS thì câu nghe được thay bằng câu còn lại). */
export const LESSON_QUIZ_SIZE = 5

/**
 * Số câu tối thiểu của quiz bài / mini test sau khi bỏ câu cần viên gạch chưa học (story 27). Có câu bị bỏ mà còn ít hơn
 * số này thì không chạy, hiện thông báo mời học viên còn thiếu.
 */
export const MIN_QUIZ_QUESTIONS = 4

/** Id bài kiểm tra của một bài học. */
export function lessonQuizId(lessonId: string): string {
  return `lesson-${lessonId}`
}

/** Câu đoạn Ngữ pháp nhãn `thì` (phần ôn của mini-t3, ôn trộn mix-s1 / mix-tet; story 40). */
const TENSE_GRAMMAR: QuestionFilter = { sectionId: 'grammar', tags: ['thì'] }
const T2_LESSON_IDS = ['s1-t2-w1', 's1-t2-w2', 's1-t2-w3', 's1-t2-w4'] as const
const T3_LESSON_IDS = ['s1-t3-w1', 's1-t3-w2', 's1-t3-w3', 's1-t3-w4'] as const

export const QUIZZES: readonly QuizDef[] = [
  {
    id: 'mini-t1',
    title: 'Mini test tháng T1',
    description: '10 câu ôn cả 4 tuần T1: to be, hiện tại đơn, nguyên âm, phụ âm, âm cuối.',
    lessonIds: ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4'],
    size: 10,
    minPerLesson: 2,
    homeLessonId: 's1-t1-w4',
  },
  {
    id: 'mini-t2',
    title: 'Mini test tháng T2',
    description: '10 câu ôn cả 4 tuần T2: hiện tại tiếp diễn, quá khứ đơn, động từ bất quy tắc, quá khứ tiếp diễn, trọng âm, đuôi -ed.',
    lessonIds: ['s1-t2-w1', 's1-t2-w2', 's1-t2-w3', 's1-t2-w4'],
    size: 10,
    minPerLesson: 2,
    homeLessonId: 's1-t2-w4',
  },
  {
    id: 'mini-t3',
    title: 'Mini test tháng T3',
    description:
      '10 câu: 8 câu ôn 4 tuần T3 (will, be going to, hiện tại hoàn thành, hoàn thành hay quá khứ đơn) và 2 câu ôn thì T1–T2.',
    lessonIds: T3_LESSON_IDS,
    size: 10,
    minPerLesson: 2,
    mix: { lessonIds: [...T1_LESSON_IDS, ...T2_LESSON_IDS], size: 2, only: TENSE_GRAMMAR },
    homeLessonId: 's1-t3-w4',
  },
  {
    id: 'mix-s1',
    title: 'Ôn trộn mọi thì',
    description: '20 câu Ngữ pháp trộn mọi thì của chặng 1, mỗi bài ít nhất 1 câu. Khởi động trước O.W.L. 1, không bắt buộc.',
    lessonIds: [...T1_LESSON_IDS, ...T2_LESSON_IDS, ...T3_LESSON_IDS, 's1-t4-w1', 's1-t4-w3'],
    size: 20,
    minPerLesson: 1,
    only: TENSE_GRAMMAR,
    homeLessonId: 's1-t4-w4',
  },
  {
    id: 'mix-tet',
    title: 'Ôn nhẹ ngày Tết',
    description: '5 câu Ngữ pháp trộn các thì đã học (T1 tới bài can / should / must). Không làm cũng không sao.',
    lessonIds: [...T1_LESSON_IDS, ...T2_LESSON_IDS, ...T3_LESSON_IDS, 's1-t4-w1'],
    size: 5,
    minPerLesson: 0,
    only: TENSE_GRAMMAR,
    homeLessonId: 's1-t4-w2',
  },
  ...lessonQuizzes(),
]

/** Bài kiểm tra từng bài (story 10): mọi bài có ít nhất 6 câu trong ngân hàng. */
function lessonQuizzes(): QuizDef[] {
  const counts = new Map<string, number>()
  for (const q of QUESTION_BANK) counts.set(q.lessonId, (counts.get(q.lessonId) ?? 0) + 1)
  return [...counts]
    .filter(([, n]) => n >= 6)
    .map(([lessonId]) => ({
      id: lessonQuizId(lessonId),
      title: `Kiểm tra bài: ${getLesson(lessonId)?.title ?? lessonId}`,
      description: `${LESSON_QUIZ_SIZE} câu ngẫu nhiên từ bài này. Câu sai tự vào Sổ lỗi sai, làm lại bao nhiêu lần cũng được.`,
      lessonIds: [lessonId],
      size: LESSON_QUIZ_SIZE,
      minPerLesson: LESSON_QUIZ_SIZE,
      homeLessonId: lessonId,
    }))
}

export function getQuiz(id: string | undefined): QuizDef | undefined {
  return id ? QUIZZES.find((q) => q.id === id) : undefined
}

/** Đường dẫn route (không có `#`) tới trang làm một bài test. */
export function quizHref(quizId: string): string {
  return `/practice/quiz/${encodeURIComponent(quizId)}`
}

export const MISTAKES_HREF = '/practice/mistakes'
