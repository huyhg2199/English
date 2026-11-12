import { getQuiz, lessonQuizId } from '@/data/questions'
import type { Store } from '@/lib/storage'

import { listAttempts, type QuizAttemptEntry } from './quiz'

/**
 * Kiểm tra bài (story 41, CAP-1 / CAP-19): quiz bài `lesson-<id>` (5 câu) làm ở cuối bước Bài chính của buổi 30' hoặc ở
 * trang test. Module thuần: chỉ đọc `quizzes.attempts`, không ghi gì.
 * - Ngưỡng đạt 70%: `score × 100 ≥ total × 70` (4/5 đạt, 3/5 chưa đạt); % hiện làm tròn xuống (cùng công thức với
 *   `partPassed` / `partPercent` của O.W.L., không import từ `@/lib/owl` vì `owl` đã import `quiz`).
 * - Lần làm tính: lần hợp lệ của đúng quiz bài (`quizId` = `lesson-<id>`), không có `kind` (bỏ test quay lại, O.W.L., loại
 *   lạ), `total` > 0. Mini test hay O.W.L. có câu của bài không tính là kiểm tra bài.
 */

export const LESSON_CHECK_PASS_PERCENT = 70

/** Đạt kiểm tra: `total` > 0 và `score / total` ≥ 70%. */
export function checkPassed(score: number, total: number): boolean {
  return total > 0 && score * 100 >= total * LESSON_CHECK_PASS_PERCENT
}

/** % để hiện, làm tròn xuống; `total` 0 → 0. */
export function checkPercent(score: number, total: number): number {
  return total > 0 ? Math.floor((score * 100) / total) : 0
}

/**
 * Việc thẻ kết quả kiểm tra cuối Bài chính được mời làm (story 41), chỉ theo (đạt?, bài đã xong?, vừa bấm đánh dấu ở đây?):
 * - `markButton`: `'primary'` "Đánh dấu bài xong" (đạt, chưa xong), `'fallback'` "Vẫn đánh dấu xong" (chưa đạt, chưa xong),
 *   null khi bài đã xong. Không bao giờ tự đánh dấu, không có lối bỏ đánh dấu;
 * - `markedLine`: vừa bấm đánh dấu → dòng "Đã đánh dấu xong bài…";
 * - `reviewLink`: chưa đạt → link ôn đoạn sai nhiều nhất;
 * - `nextSessionHint`: chưa đạt và bài chưa xong → câu "buổi 30' sau vẫn là bài này".
 */
export type LessonCheckVerdict = {
  markButton: 'primary' | 'fallback' | null
  markedLine: boolean
  reviewLink: boolean
  nextSessionHint: boolean
}

export function lessonCheckVerdict(passed: boolean, done: boolean, markedHere: boolean): LessonCheckVerdict {
  return {
    markButton: markedHere || done ? null : passed ? 'primary' : 'fallback',
    markedLine: markedHere,
    reviewLink: !passed,
    nextSessionHint: !passed && !done && !markedHere,
  }
}

export type LessonCheckResult = { score: number; total: number; percent: number; passed: boolean }

/** Lần làm kiểm tra bài của `lessonId` (mới nhất trước). */
function lessonCheckAttempts(store: Store, lessonId: string): QuizAttemptEntry[] {
  return listAttempts(store, lessonQuizId(lessonId)).filter((a) => a.kind === undefined && a.total > 0)
}

/** Lần kiểm tra bài tốt nhất (tỉ lệ đúng cao nhất, bằng nhau lấy lần mới hơn); chưa làm lần nào → null. */
export function bestLessonCheck(store: Store, lessonId: string): LessonCheckResult | null {
  let best: QuizAttemptEntry | null = null
  // Mới nhất trước: chỉ thay khi tỉ lệ cao hơn hẳn, nên bằng nhau giữ lần mới hơn.
  for (const a of lessonCheckAttempts(store, lessonId)) {
    if (!best || a.score * best.total > best.score * a.total) best = a
  }
  if (!best) return null
  return {
    score: best.score,
    total: best.total,
    percent: checkPercent(best.score, best.total),
    passed: checkPassed(best.score, best.total),
  }
}

/** Có lần kiểm tra bài đạt với `finishedAt` muộn hơn `sinceMs`. */
export function lessonCheckPassedSince(store: Store, lessonId: string, sinceMs: number): boolean {
  return lessonCheckAttempts(store, lessonId).some(
    (a) => checkPassed(a.score, a.total) && Date.parse(a.finishedAt) > sinceMs,
  )
}

/** Trạng thái trạm trên Lộ trình (cùng giá trị với `StationState` của `@/components/roadmap/Station`). */
export type CheckStationState = 'done' | 'next' | 'skipped' | 'locked'

export type RoadmapCheckLabel = { text: string; passed: boolean }

/**
 * Nhãn dưới tên bài trên Lộ trình: "đạt x%" (x = % tốt nhất, mọi lần làm kể cả ở trang test) khi đã làm; "chưa kiểm tra"
 * khi chưa làm và trạm "đã qua" / "học tiếp". Trạm chưa học / đã bỏ qua mà chưa làm, hoặc bài không có quiz bài → null.
 */
export function roadmapCheckLabel(store: Store, lessonId: string, state: CheckStationState): RoadmapCheckLabel | null {
  if (!getQuiz(lessonQuizId(lessonId))) return null
  const best = bestLessonCheck(store, lessonId)
  if (best) return { text: `đạt ${best.percent}%`, passed: best.passed }
  if (state === 'done' || state === 'next') return { text: 'chưa kiểm tra', passed: false }
  return null
}
