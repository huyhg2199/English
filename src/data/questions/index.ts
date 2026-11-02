import { T1_QUESTIONS } from './t1'
import type { Question } from './types'

export * from './types'

/** Toàn bộ ngân hàng câu (story 9: T1). Story 10 thêm T2–T4. */
export const QUESTION_BANK: readonly Question[] = [...T1_QUESTIONS]

const byId = new Map(QUESTION_BANK.map((q) => [q.id, q]))

export function getQuestion(id: string): Question | undefined {
  return byId.get(id)
}

/** Một bài test bám bài: lấy `size` câu từ các bài `lessonIds`, mỗi bài ít nhất `minPerLesson` câu. */
export type QuizDef = {
  id: string
  title: string
  description: string
  lessonIds: readonly string[]
  size: number
  minPerLesson: number
  /** Bài chứa link vào test (để quay lại). */
  homeLessonId: string
}

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
]

export function getQuiz(id: string | undefined): QuizDef | undefined {
  return id ? QUIZZES.find((q) => q.id === id) : undefined
}

/** Đường dẫn route (không có `#`) tới trang làm một bài test. */
export function quizHref(quizId: string): string {
  return `/practice/quiz/${encodeURIComponent(quizId)}`
}

export const MISTAKES_HREF = '/practice/mistakes'
