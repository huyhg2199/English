import { bricksOfRow, ROW_IDS, ROW_TITLES, type BrickId, type RowId } from '@/data/foundation'
import { ROW_QUIZ_ID } from '@/data/questions'
import { recordAttempt, type AttemptAnswer } from '@/lib/quiz'
import type { Store } from '@/lib/storage'

import { finishPlacement, isRowResult, markRowTested, needsPlacement, readFoundation, type Foundation } from './foundation'

/**
 * Kiểm tra hàng của Sân ga 9¾ (story 20): Soát vé, "Tôi biết rồi", kiểm tra cuối hàng. Hàm thuần, thời gian qua tham số.
 * Không re-export từ `./index` (`@/lib/foundation` được đồng bộ import, module này kéo theo ngân hàng câu và `@/lib/quiz`).
 *
 * | Chế độ      | Khi nào                    | `rows[r]` | `quizzes.attempts` | Sổ lỗi |
 * |-------------|----------------------------|-----------|--------------------|--------|
 * | `placement` | Trang Soát vé              | có        | không              | không  |
 * | `know`      | Hàng còn viên chưa xong    | có        | không              | không  |
 * | `final`     | Mọi viên của hàng đã xong  | có        | có (`quiz-f-x`)    | có     |
 */

export type RowTestContext = 'placement' | 'row'
export type RowTestMode = 'placement' | 'know' | 'final'

export const PLACEMENT_HREF = '/foundation/soat-ve'

export function rowTestHref(row: RowId): string {
  return `/foundation/kiem-tra/${row}`
}

/** `'a'` / `' B '` → hàng viết hoa; giá trị khác → null. */
export function parseRowParam(param: string | undefined): RowId | null {
  const row = (param ?? '').trim().toUpperCase()
  return (ROW_IDS as readonly string[]).includes(row) ? (row as RowId) : null
}

function allBricksDone(f: Foundation, row: RowId): boolean {
  return bricksOfRow(row).every((b) => f.bricks[b.id] !== undefined)
}

function rowDoneIn(f: Foundation, row: RowId): boolean {
  return f.rows[row]?.passed === true || allBricksDone(f, row)
}

/** Hàng đầu tiên A → D chưa xong và chưa có `rows[r]` hợp lệ (không xét trạng thái Soát vé). */
function firstUntestedRow(f: Foundation): RowId | null {
  return ROW_IDS.find((r) => !rowDoneIn(f, r) && !isRowResult(f.rows[r])) ?? null
}

/**
 * Hàng Soát vé tiếp theo: chỉ khi `needsPlacement`; hàng đầu tiên A → D chưa xong (kiểm tra đạt hoặc học hết viên) và
 * chưa có kết quả. Hàng làm dở không ghi gì nên lần sau làm lại hàng đó từ câu 1. Không còn → null.
 */
export function nextPlacementRow(store: Store): RowId | null {
  if (!needsPlacement(store)) return null
  return firstUntestedRow(readFoundation(store))
}

/**
 * Soát vé đã đi qua ít nhất một hàng: có hàng đứng trước hàng Soát vé tiếp theo đã có kết quả (`rows[r]` hợp lệ), nên thẻ
 * mời đổi thành "Tiếp tục Soát vé · hàng X". Kết quả "Tôi biết rồi" ở hàng sau (vd hàng B khi hàng A chưa làm) không tính.
 */
export function placementStarted(store: Store): boolean {
  const next = nextPlacementRow(store)
  if (next === null) return false
  const f = readFoundation(store)
  return ROW_IDS.slice(0, ROW_IDS.indexOf(next)).some((r) => isRowResult(f.rows[r]))
}

/** Chế độ kiểm tra: trang Soát vé → `placement`; trang hàng → `final` khi mọi viên của hàng đã xong, không thì `know`. */
export function rowTestMode(store: Store, row: RowId, context: RowTestContext): RowTestMode {
  if (context === 'placement') return 'placement'
  return allBricksDone(readFoundation(store), row) ? 'final' : 'know'
}

export type RowTestInput = {
  row: RowId
  context: RowTestContext
  /** Id lần làm (chỉ dùng ở chế độ `final`). */
  attemptId: string
  seed: string
  startedAt: Date
  answers: readonly AttemptAnswer[]
}

/**
 * Ghi một lần kiểm tra hàng (bấm "Xem kết quả" ở câu cuối). Chế độ tính lại từ `store` lúc ghi:
 * - luôn `markRowTested` (`passed` không hạ, `best` = max; đủ 4 hàng thì tự ghi `completedAt`);
 * - `final`: thêm lần làm `quiz-f-x` vào `quizzes.attempts` và câu sai vào Sổ lỗi (`recordAttempt`);
 * - không còn hàng nào cần Soát vé (ở mọi chế độ, kể cả khi hàng cuối có kết quả nhờ "Tôi biết rồi") →
 *   `finishPlacement('done')`, để Soát vé không kẹt `pending` khi không còn gì để soát.
 * Không ghi buổi học, streak, điểm Nhà. `answers` rỗng → store cũ.
 */
export function recordRowTest(store: Store, input: RowTestInput, now: Date): Store {
  if (input.answers.length === 0) return store
  const mode = rowTestMode(store, input.row, input.context)
  const correct = input.answers.filter((a) => a.correct).length
  let next = markRowTested(store, input.row, correct, input.answers.length, now)
  if (mode === 'final') {
    next = recordAttempt(
      next,
      {
        id: input.attemptId,
        quizId: ROW_QUIZ_ID[input.row],
        seed: input.seed,
        startedAt: input.startedAt,
        answers: input.answers,
      },
      now,
    )
  }
  if (firstUntestedRow(readFoundation(next)) === null) {
    next = finishPlacement(next, 'done', now)
  }
  return next
}

/** "Bỏ qua, học từ viên 1": Soát vé thành `skipped` (chỉ khi còn `pending`); kết quả hàng đã làm giữ nguyên. */
export function skipPlacement(store: Store, now: Date): Store {
  return finishPlacement(store, 'skipped', now)
}

/** Viên để học tiếp hàng `row` khi chưa đạt: viên chưa xong đầu tiên của hàng; xong hết → viên đầu hàng. */
export function rowStartBrick(store: Store, row: RowId): BrickId {
  const f = readFoundation(store)
  const bricks = bricksOfRow(row)
  return (bricks.find((b) => f.bricks[b.id] === undefined) ?? bricks[0]).id
}

export type RowSummary = {
  row: RowId
  title: string
  /** `passed`: kiểm tra đạt; `bricks`: học hết viên (chưa đạt kiểm tra); `failed`: có kết quả chưa đạt; `untested`. */
  status: 'passed' | 'bricks' | 'failed' | 'untested'
  /** % tốt nhất (null khi chưa làm). */
  best: number | null
}

/** Tổng kết 4 hàng sau Soát vé, theo thứ tự A → D. */
export function rowSummaries(store: Store): RowSummary[] {
  const f = readFoundation(store)
  return ROW_IDS.map((row) => {
    const result = f.rows[row]
    const best = result ? result.best : null
    const status = result?.passed ? 'passed' : allBricksDone(f, row) ? 'bricks' : result ? 'failed' : 'untested'
    return { row, title: ROW_TITLES[row], status, best }
  })
}

export type RowVerdictInput = {
  row: RowId
  mode: RowTestMode
  passed: boolean
  /** Hàng đã xong sau lần ghi này (đạt từ trước thì lần chưa đạt không làm hàng hết xong). */
  rowDone: boolean
  /** Viên để học tiếp khi chưa đạt (`rowStartBrick`). */
  startBrick: BrickId
}

/** Lời đạt / chưa đạt ở màn kết quả kiểm tra hàng: giọng nhẹ, không chữ "trượt". */
export function rowTestVerdict({ row, mode, passed, rowDone, startBrick }: RowVerdictInput): string {
  if (passed) {
    return mode === 'final' ? `Đạt kiểm tra cuối hàng ${row}. Nền móng hàng này đã chắc.` : `Đạt hàng ${row}: hàng này tính là xong.`
  }
  if (mode === 'final') return `Chưa đạt 70%, mình ôn lại hàng ${row} từ ${startBrick}.`
  if (rowDone) return `Lần này chưa đạt 70%, nhưng hàng ${row} vẫn tính là xong.`
  return `Chưa đạt 70%, mình học hàng ${row} từ ${startBrick}.`
}

/** Dải viên của hàng, vd "F01–F06". */
export function rowBrickRange(row: RowId): string {
  const ids = bricksOfRow(row).map((b) => b.id)
  return ids.length > 1 ? `${ids[0]}–${ids.at(-1)}` : ids[0]
}
