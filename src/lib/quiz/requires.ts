import { BRICK_IDS, type BrickId } from '@/data/foundation'
import { conceptSource, MIN_QUIZ_QUESTIONS, QUIZZES, type Question, type QuizDef } from '@/data/questions'

import { pickQuiz, type PickOptions } from './quiz'

/**
 * Lập đề có lọc "chỉ dùng kiến thức đã dạy" (story 27). Hàm thuần: viên nào đã dạy do nơi gọi truyền vào
 * (`isTaught`, thường là `isBrickTaught(store, id)`), nên module này không import `@/lib/foundation`.
 * Chỉ lọc bài test trong `QUIZZES` (quiz từng bài, mini test); câu chỉ bị bỏ khi cần khái niệm của viên gạch chưa dạy.
 * Khái niệm bài T1 không kiểm lúc chạy (test tĩnh đã bảo đảm câu chỉ cần bài của nó hoặc bài T1 trước đó).
 */

export type IsBrickTaught = (brickId: BrickId) => boolean

export type QuizPlan =
  | { status: 'run'; questions: Question[]; skipped: number; missingBrickIds: BrickId[] }
  | {
      status: 'not-ready'
      available: number
      missingBrickIds: BrickId[]
      /** Viên chưa dạy đầu tiên theo thứ tự Sân ga (F01 → F18): nút "Học …" dẫn tới đây, không nhảy cóc viên. */
      startBrickId: BrickId | null
    }

/** Viên gạch câu `q` cần mà chưa dạy, theo thứ tự F01 → F18. */
export function missingBricks(q: Question, isTaught: IsBrickTaught): BrickId[] {
  const missing = new Set<BrickId>()
  for (const c of q.requires ?? []) {
    const source = conceptSource(c)
    if (source && 'brick' in source && !isTaught(source.brick)) missing.add(source.brick)
  }
  return BRICK_IDS.filter((id) => missing.has(id))
}

type Filtered = {
  bank: readonly Question[]
  /** Số câu đủ nền của bài test, và số câu đủ nền không phải câu nghe (máy không có TTS chỉ chạy được loại này). */
  eligible: number
  eligibleNonListening: number
  skipped: number
  missingBrickIds: BrickId[]
}

/** Bỏ khỏi ngân hàng các câu của bài test cần viên chưa dạy; test ngoài `QUIZZES` giữ nguyên. */
function filterBank(bank: readonly Question[], quiz: QuizDef, isTaught: IsBrickTaught): Filtered {
  const inQuiz = (q: Question) => quiz.lessonIds.includes(q.lessonId)
  const counts = (kept: readonly Question[]) => {
    const pool = kept.filter(inQuiz)
    return { eligible: pool.length, eligibleNonListening: pool.filter((q) => q.kind !== 'listening').length }
  }
  if (!QUIZZES.some((d) => d.id === quiz.id)) {
    return { bank, ...counts(bank), skipped: 0, missingBrickIds: [] }
  }
  const missing = new Set<BrickId>()
  let skipped = 0
  const kept = bank.filter((q) => {
    if (!inQuiz(q)) return true
    const m = missingBricks(q, isTaught)
    if (m.length === 0) return true
    skipped++
    for (const id of m) missing.add(id)
    return false
  })
  return {
    bank: skipped === 0 ? bank : kept,
    ...counts(kept),
    skipped,
    missingBrickIds: BRICK_IDS.filter((id) => missing.has(id)),
  }
}

/**
 * Đề của một lần làm: `pickQuiz` trên ngân hàng đã bỏ câu thiếu nền (câu thay câu nghe khi không có TTS vì thế cũng
 * đủ nền). Không bỏ câu nào → đúng kết quả `pickQuiz` cũ với cùng seed. Có câu bị bỏ mà còn < `MIN_QUIZ_QUESTIONS`
 * câu → `not-ready` (không chạy, không ghi lần làm).
 */
export function planQuiz(
  bank: readonly Question[],
  quiz: QuizDef,
  seed: string,
  opts: PickOptions,
  isTaught: IsBrickTaught,
): QuizPlan {
  const f = filterBank(bank, quiz, isTaught)
  const questions = pickQuiz(f.bank, quiz, seed, opts)
  if (f.skipped > 0 && questions.length < MIN_QUIZ_QUESTIONS) {
    return {
      status: 'not-ready',
      available: questions.length,
      missingBrickIds: f.missingBrickIds,
      startBrickId: BRICK_IDS.find((id) => !isTaught(id)) ?? null,
    }
  }
  return { status: 'run', questions, skipped: f.skipped, missingBrickIds: f.missingBrickIds }
}

/**
 * Số câu hiện trên nút "Kiểm tra bài (n câu)", khớp số câu `planQuiz` sẽ chạy với cùng `opts`: không có TTS thì
 * `pickQuiz` thay câu nghe bằng câu không nghe, nên đề có min(size, số câu đủ nền không phải câu nghe) câu.
 * Có câu bị bỏ mà còn < `MIN_QUIZ_QUESTIONS` câu → `null` (nhãn không có số).
 */
export function quizButtonCount(
  bank: readonly Question[],
  quiz: QuizDef,
  opts: PickOptions,
  isTaught: IsBrickTaught,
): number | null {
  const f = filterBank(bank, quiz, isTaught)
  const n = Math.min(quiz.size, opts.canSpeak ? f.eligible : f.eligibleNonListening)
  return f.skipped > 0 && n < MIN_QUIZ_QUESTIONS ? null : n
}
