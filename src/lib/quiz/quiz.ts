import { getQuestion, getQuiz, type Question, type QuizDef } from '@/data/questions'
import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString } from '@/lib/updated-at'

import { recordMistake } from './mistakes'
import { seededRandom, shuffle } from './random'

/**
 * Engine test bám bài (story 9). Hàm thuần: seed và thời gian luôn qua tham số.
 * Lần làm chỉ được ghi khi làm xong (`recordAttempt`); bỏ dở thì không ghi gì.
 */

export type AttemptAnswer = { questionId: string; chosen: string; correct: boolean }

/** Một lần làm, lưu ở `store.data.quizzes.attempts[id]`. Story 12 (Hermione 100%), 14 (O.W.L.) đọc lại. */
export type QuizAttempt = {
  quizId: string
  seed: string
  startedAt: string
  finishedAt: string
  score: number
  total: number
  answers: AttemptAnswer[]
  updatedAt: string
  /**
   * Loại lần làm (story 11). Thiếu = test thường; `comeback` = test quay lại sau nghỉ 5'.
   * Chuỗi lạ (do bản app mới hơn ghi) vẫn hợp lệ để không mất khi gộp; nơi đọc bỏ qua loại không biết.
   */
  kind?: string
  /** Lần làm rỗng ghi "Để sau" cho test quay lại (chỉ với `kind: 'comeback'`, `total: 0`; không tính điểm). */
  skipped?: boolean
  /** Qua cửa hay không (story 14 ghi cho `kind: 'owl'`). */
  passed?: boolean
  /** Kỳ qua cửa của lần làm (story 14: `owl-1`). */
  checkpointId?: string
  /** Chi tiết lần thi O.W.L. (điểm từng phần, phần ETS, kế hoạch ôn); `@/lib/owl` đọc và kiểm dạng. */
  owl?: Record<string, unknown>
}

/** Loại lần làm app này hiểu (thiếu `kind` = test thường; `owl` = O.W.L., story 14). */
export const KNOWN_ATTEMPT_KINDS = ['comeback', 'owl'] as const
export type AttemptKind = (typeof KNOWN_ATTEMPT_KINDS)[number]

export type QuizAttemptEntry = QuizAttempt & { id: string }

export type PickOptions = { canSpeak: boolean }

function isAnswer(value: unknown): value is AttemptAnswer {
  return (
    isPlainObject(value) &&
    typeof value.questionId === 'string' &&
    typeof value.chosen === 'string' &&
    typeof value.correct === 'boolean'
  )
}

export function isQuizAttempt(value: unknown): value is QuizAttempt {
  if (!isPlainObject(value)) return false
  const { quizId, seed, startedAt, finishedAt, score, total, answers, updatedAt, kind, skipped, passed, checkpointId, owl } =
    value
  return (
    (kind === undefined || typeof kind === 'string') &&
    (passed === undefined || typeof passed === 'boolean') &&
    (checkpointId === undefined || typeof checkpointId === 'string') &&
    (owl === undefined || isPlainObject(owl)) &&
    (skipped === undefined || skipped === false || (skipped === true && kind === 'comeback' && total === 0)) &&
    typeof quizId === 'string' &&
    typeof seed === 'string' &&
    isTimeString(startedAt) &&
    isTimeString(finishedAt) &&
    isTimeString(updatedAt) &&
    Number.isInteger(score) &&
    Number.isInteger(total) &&
    (score as number) >= 0 &&
    (score as number) <= (total as number) &&
    Array.isArray(answers) &&
    answers.every(isAnswer) &&
    total === answers.length &&
    score === answers.filter((a) => a.correct).length
  )
}

/**
 * Chọn câu cho một bài test: mỗi bài ít nhất `minPerLesson` câu, đủ `size` câu, không trùng, thứ tự xáo theo seed.
 * Không có TTS (`canSpeak` false): chọn như khi có TTS rồi thay từng câu nghe bằng một câu chưa chọn **cùng bài**
 * (không còn câu cùng bài thì lấy câu bài khác), nên số câu mỗi bài giữ nguyên.
 */
export function pickQuiz(bank: readonly Question[], quiz: QuizDef, seed: string, opts: PickOptions): Question[] {
  const random = seededRandom(`${seed}|pick`)
  const pool = bank.filter((q) => quiz.lessonIds.includes(q.lessonId))
  const groups = quiz.lessonIds.map((id) => shuffle(pool.filter((q) => q.lessonId === id), random))
  const chosen = groups.flatMap((g) => g.slice(0, quiz.minPerLesson))
  const rest = shuffle(
    groups.flatMap((g) => g.slice(quiz.minPerLesson)),
    random,
  )
  chosen.push(...rest.slice(0, Math.max(0, quiz.size - chosen.length)))
  let picked = chosen.slice(0, quiz.size)
  if (!opts.canSpeak) {
    const used = new Set(picked.map((q) => q.id))
    const spare = shuffle(
      pool.filter((q) => !used.has(q.id) && q.kind !== 'listening'),
      random,
    )
    picked = picked.flatMap((q) => {
      if (q.kind !== 'listening') return [q]
      if (spare.length === 0) return []
      const same = spare.findIndex((x) => x.lessonId === q.lessonId)
      return spare.splice(same >= 0 ? same : 0, 1)
    })
  }
  return shuffle(picked, random)
}

/** Mini test tuần 4 T1: 10 câu từ 24 câu T1, mỗi tuần ≥ 2 câu. */
export function pickMiniTest(bank: readonly Question[], seed: string, opts: PickOptions): Question[] {
  return pickQuiz(bank, getQuiz('mini-t1')!, seed, opts)
}

/** Thứ tự lựa chọn của một câu trong một lần làm (xác định theo seed + id câu). */
export function shuffleOptions(question: Question, seed: string): string[] {
  return shuffle(question.options, seededRandom(`${seed}|${question.id}`))
}

export type GradedAttempt = { score: number; total: number; answers: AttemptAnswer[] }

/** Chấm: câu chưa trả lời tính là sai (chosen = ''). */
export function gradeAttempt(questions: readonly Question[], chosen: Readonly<Record<string, string>>): GradedAttempt {
  const answers = questions.map((q) => {
    const c = chosen[q.id] ?? ''
    return { questionId: q.id, chosen: c, correct: c === q.answer }
  })
  return { score: answers.filter((a) => a.correct).length, total: answers.length, answers }
}

/** Id lần làm: thời điểm xong + phần ngẫu nhiên (truyền vào để hàm thuần). */
export function attemptId(quizId: string, now: Date, random: string): string {
  return `${quizId}-${now.getTime().toString(36)}-${random.replace(/[^a-z0-9]/gi, '').slice(0, 8) || '0'}`
}

export function readAttempts(store: Store): Record<string, unknown> {
  const quizzes = store.data.quizzes
  return isPlainObject(quizzes) && isPlainObject(quizzes.attempts) ? quizzes.attempts : {}
}

/** Lần làm hợp lệ, mới nhất trước; lọc theo bài test nếu truyền `quizId`. */
export function listAttempts(store: Store, quizId?: string): QuizAttemptEntry[] {
  return Object.entries(readAttempts(store))
    .filter((e): e is [string, QuizAttempt] => isQuizAttempt(e[1]))
    .filter(([, a]) => quizId === undefined || a.quizId === quizId)
    .map(([id, a]) => ({ ...a, id }))
    .sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt) || (a.id < b.id ? 1 : -1))
}

/**
 * Lần làm có chấm điểm để hiện lịch sử / điểm tốt nhất: bỏ lần "Để sau" (`skipped`) và loại lần làm không biết.
 * Lọc theo bài test nếu truyền `quizId`.
 */
export function listGradedAttempts(store: Store, quizId?: string): QuizAttemptEntry[] {
  return listAttempts(store, quizId).filter(
    (a) => !a.skipped && (a.kind === undefined || (KNOWN_ATTEMPT_KINDS as readonly string[]).includes(a.kind)),
  )
}

export type AttemptInput = {
  id: string
  quizId: string
  seed: string
  startedAt: Date
  answers: readonly AttemptAnswer[]
  kind?: AttemptKind
  skipped?: boolean
  passed?: boolean
  checkpointId?: string
  owl?: Record<string, unknown>
}

/**
 * Ghi một lần làm xong vào `quizzes.attempts` và đẩy mọi câu sai vào Sổ lỗi (`mistakes`).
 * `lookup` tra câu theo id (mặc định ngân hàng câu); câu không tra được thì vẫn lưu trong lần làm nhưng không vào sổ.
 */
export function recordAttempt(
  store: Store,
  input: AttemptInput,
  now: Date,
  lookup: (id: string) => Question | undefined = getQuestion,
): Store {
  const answers = input.answers.map((a) => ({ ...a }))
  const attempt: QuizAttempt = {
    quizId: input.quizId,
    seed: input.seed,
    startedAt: input.startedAt.toISOString(),
    finishedAt: now.toISOString(),
    score: answers.filter((a) => a.correct).length,
    total: answers.length,
    answers,
    updatedAt: now.toISOString(),
    ...(input.kind ? { kind: input.kind } : {}),
    ...(input.skipped ? { skipped: true } : {}),
    ...(input.passed !== undefined ? { passed: input.passed } : {}),
    ...(input.checkpointId !== undefined ? { checkpointId: input.checkpointId } : {}),
    ...(input.owl !== undefined ? { owl: input.owl } : {}),
  }
  const quizzes = isPlainObject(store.data.quizzes) ? store.data.quizzes : {}
  let next: Store = {
    ...store,
    data: { ...store.data, quizzes: { ...quizzes, attempts: { ...readAttempts(store), [input.id]: attempt } } },
  }
  for (const a of answers) {
    if (a.correct) continue
    const question = lookup(a.questionId)
    if (question) next = recordMistake(next, question, a.chosen, now)
  }
  return next
}
