import { getLesson } from '@/data/roadmap'

import { T1_QUESTIONS } from './t1'
import { T2_T4_QUESTIONS } from './t2-t4'
import type { Question } from './types'

export * from './types'

/** Toàn bộ ngân hàng câu: T1 (story 9) và T2–T4 (story 10). */
export const QUESTION_BANK: readonly Question[] = [...T1_QUESTIONS, ...T2_T4_QUESTIONS]

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

/** Số câu của bài kiểm tra một bài: 5 trong 6 câu (không có TTS thì câu nghe được thay bằng câu còn lại). */
export const LESSON_QUIZ_SIZE = 5

/** Id bài kiểm tra của một bài học. */
export function lessonQuizId(lessonId: string): string {
  return `lesson-${lessonId}`
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
  {
    id: 'mini-t2',
    title: 'Mini test tháng T2',
    description: '10 câu ôn cả 4 tuần T2: hiện tại tiếp diễn, quá khứ đơn, động từ bất quy tắc, trọng âm, đuôi -ed.',
    lessonIds: ['s1-t2-w1', 's1-t2-w2', 's1-t2-w3', 's1-t2-w4'],
    size: 10,
    minPerLesson: 2,
    homeLessonId: 's1-t2-w4',
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
