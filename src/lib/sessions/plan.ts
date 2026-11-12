import { BRICKS, brickLessonId, isBrickId, type BrickId } from '@/data/foundation'
import { lessonPartIds } from '@/data/lessons'
import { getQuiz, lessonQuizId } from '@/data/questions'
import { foundationState, isInFoundation, nextBrickIdFromState, readFoundation } from '@/lib/foundation'
import { markLessonPartSeen, nextLessonPartId, readSeenPartIds } from '@/lib/roadmap-progress'
import type { Store } from '@/lib/storage'

import { resolveSessionLesson, sessionLesson, wordListForLesson, type SessionLesson } from './sessions'

/**
 * Kế hoạch buổi 30' (story 21, CAP-2 + CAP-23): lý thuyết luôn đi trước luyện.
 * - Đang ở Sân ga: Lý thuyết 12' (1 viên gạch) → Ôn & từ mới 8' → Giải trí nhẹ 10'.
 * - Sau Sân ga: Bài chính 15' → Ôn flashcard 5' → Giải trí 10'.
 * Cả hai đều tính 25 phút học (`SESSION_MINUTES.full`). Kế hoạch chốt trên URL (`?brick=` / `?lesson=` + `?step=`).
 * Bài T1 chia phần (story 28): buổi bài học một phần, chốt bằng `?part=` (phần chưa xem đầu tiên lúc vào buổi).
 *
 * Module thuần: chỉ import danh mục `@/data/foundation` và `@/lib/foundation` (không kéo nội dung viên); nơi gọi truyền
 * `hasContent` (thường là `hasBrickContent` của `@/data/foundation/content`).
 */

export type SessionStepId = 'theory' | 'review' | 'lesson' | 'srs' | 'fun'

export type SessionStep = { id: SessionStepId; title: string; minutes: number }

export const FOUNDATION_STEPS: readonly SessionStep[] = [
  { id: 'theory', title: 'Lý thuyết', minutes: 12 },
  { id: 'review', title: 'Ôn & từ mới', minutes: 8 },
  { id: 'fun', title: 'Giải trí nhẹ', minutes: 10 },
]

export const LESSON_STEPS: readonly SessionStep[] = [
  { id: 'lesson', title: 'Bài chính', minutes: 15 },
  { id: 'srs', title: 'Ôn flashcard', minutes: 5 },
  { id: 'fun', title: 'Giải trí', minutes: 10 },
]

export type SessionPlan =
  | {
      mode: 'foundation'
      /** Viên của phần lý thuyết; null khi chưa có viên nào có nội dung để học hay ôn. */
      brickId: BrickId | null
      /** Ôn lại (không còn viên tiếp theo có nội dung). */
      review: boolean
      steps: readonly SessionStep[]
    }
  | {
      mode: 'lesson'
      lesson: SessionLesson | null
      /**
       * Phần của đoạn Phát âm học trong buổi (story 28): phần chưa xem đầu tiên lúc vào buổi. null khi bài không chia
       * phần, đã xem hết (buổi ôn cả tuần) hoặc không có bài.
       */
      partId: string | null
      steps: readonly SessionStep[]
    }

type HasContent = (id: BrickId) => boolean

/** Viên có nội dung xong gần nhất (`lastDoneAt` muộn nhất); chưa xong viên nào → null. */
function latestDoneBrick(store: Store, hasContent: HasContent): BrickId | null {
  const { bricks } = readFoundation(store)
  let latest: { id: BrickId; at: number } | null = null
  for (const id of foundationState(store).doneBrickIds) {
    const at = Date.parse(bricks[id]?.lastDoneAt ?? '')
    if (!hasContent(id) || !Number.isFinite(at)) continue
    if (!latest || at > latest.at) latest = { id, at }
  }
  return latest?.id ?? null
}

/**
 * Viên của buổi Sân ga: viên tiếp theo; không có thì ôn viên có nội dung xong gần nhất (`lastDoneAt` muộn nhất);
 * chưa xong viên nào thì ôn viên có nội dung đầu tiên thuộc hàng đã xong; không có gì → null.
 */
function foundationBrick(store: Store, hasContent: HasContent): { brickId: BrickId | null; review: boolean } {
  const state = foundationState(store)
  const next = nextBrickIdFromState(state, hasContent)
  if (next) return { brickId: next, review: false }

  const latest = latestDoneBrick(store, hasContent)
  if (latest) return { brickId: latest, review: true }

  const rowsDone = new Set<string>(state.rowsDone)
  const first = BRICKS.find((b) => rowsDone.has(b.row) && hasContent(b.id))
  return first ? { brickId: first.id, review: true } : { brickId: null, review: false }
}

/** Viên của ngày lười ở Sân ga: `review` = ôn nhanh (giải thích + so sánh Việt–Anh), `preview` = xem trước phần giải thích. */
export type LazyFoundationBrick = { brickId: BrickId; mode: 'review' | 'preview' }

/**
 * Viên cho ngày lười khi đang ở Sân ga (story 22, `learning-rules.md` mục Buổi học): ôn nhanh viên có nội dung xong gần
 * nhất (`lastDoneAt` muộn nhất); chưa xong viên nào thì xem trước viên tiếp theo; không có viên tiếp theo thì ôn nhanh
 * viên có nội dung đầu tiên của hàng đã xong (viên đã qua, giống "Ôn lại" của `sessionPlan`); không có gì → null.
 * Chỉ chọn viên, không ghi gì (không `completeBrick`).
 */
export function lazyFoundationBrick(store: Store, hasContent: HasContent): LazyFoundationBrick | null {
  const latest = latestDoneBrick(store, hasContent)
  if (latest) return { brickId: latest, mode: 'review' }
  const state = foundationState(store)
  const next = nextBrickIdFromState(state, hasContent)
  if (next) return { brickId: next, mode: 'preview' }
  const rowsDone = new Set<string>(state.rowsDone)
  const first = BRICKS.find((b) => rowsDone.has(b.row) && hasContent(b.id))
  return first ? { brickId: first.id, mode: 'review' } : null
}

/**
 * Phần của buổi bài: phần chưa xem đầu tiên của bài; bài không chia / đã xem hết / không có bài → null. "Phần" là phần
 * Phát âm của bài T1 (story 28) hoặc ngày Ngữ pháp của bài T2–T4 (`grammarDays`, story 47): cả hai đều nằm trong
 * `lessonPartIds` và `partsSeen`.
 */
function lessonPartOf(store: Store, lesson: SessionLesson | null): string | null {
  if (!lesson) return null
  return nextLessonPartId(lessonPartIds(lesson.lesson.id), readSeenPartIds(store, lesson.lesson.id))
}

/** Kế hoạch tính từ store: đang ở Sân ga (`isInFoundation`) → buổi Sân ga; không thì buổi bài (`sessionLesson`). */
export function sessionPlan(store: Store, hasContent: HasContent): SessionPlan {
  if (isInFoundation(store)) return { mode: 'foundation', ...foundationBrick(store, hasContent), steps: FOUNDATION_STEPS }
  const lesson = sessionLesson(store)
  return { mode: 'lesson', lesson, partId: lessonPartOf(store, lesson), steps: LESSON_STEPS }
}

/** `?step=` số của bản cũ (0 ôn, 1 bài, 2 giải trí) → tên bước theo loại buổi. */
export const LEGACY_STEP_MAP: Readonly<Record<'0' | '1' | '2', Readonly<Record<SessionPlan['mode'], SessionStepId>>>> = {
  '0': { lesson: 'srs', foundation: 'review' },
  '1': { lesson: 'lesson', foundation: 'theory' },
  '2': { lesson: 'fun', foundation: 'fun' },
}

export type SessionParams = {
  brick?: string | null
  lesson?: string | null
  /** Phần của bài (phần Phát âm story 28 hoặc ngày Ngữ pháp story 47); chỉ hợp lệ khi thuộc bài của buổi. */
  part?: string | null
  step?: string | null
}

export type ResolvedSessionPlan = {
  plan: SessionPlan
  stepIndex: number
  /**
   * Tham số chuẩn để `replace` URL: `{ brick, step }` / `{ lesson, part?, step }` (thiếu viên / bài thì chỉ `step`;
   * `part` chỉ có khi buổi học một phần).
   */
  search: Record<string, string>
}

/** Viên hợp lệ trên URL: có trong danh mục và có nội dung; chấp nhận chữ thường. Không thì null. */
function parseBrickParam(param: string | null | undefined, hasContent: HasContent): BrickId | null {
  const id = (param ?? '').trim().toUpperCase()
  return isBrickId(id) && hasContent(id) ? id : null
}

function stepIndexOf(plan: SessionPlan, step: string | null | undefined): number {
  const raw = (step ?? '').trim()
  const legacy = Object.hasOwn(LEGACY_STEP_MAP, raw) ? LEGACY_STEP_MAP[raw as keyof typeof LEGACY_STEP_MAP][plan.mode] : raw
  const index = plan.steps.findIndex((s) => s.id === legacy)
  return index >= 0 ? index : 0
}

/** Tham số chuẩn của kế hoạch ở bước `stepIndex`. */
export function sessionSearch(plan: SessionPlan, stepIndex: number): Record<string, string> {
  const step = plan.steps[stepIndex]?.id ?? plan.steps[0].id
  if (plan.mode === 'foundation') return plan.brickId ? { brick: plan.brickId, step } : { step }
  if (!plan.lesson) return { step }
  return plan.partId ? { lesson: plan.lesson.lesson.id, part: plan.partId, step } : { lesson: plan.lesson.lesson.id, step }
}

/**
 * Chốt kế hoạch theo URL. `brick` hợp lệ → luôn là buổi Sân ga với viên đó (kể cả khi đã qua / bỏ qua tường giữa buổi);
 * có cả `brick` lẫn `lesson` thì `brick` thắng. `lesson` hợp lệ → buổi bài đó. Tham số lạ bị bỏ qua, kế hoạch tính lại
 * từ store. `step`: tên bước của kế hoạch hoặc số cũ (`LEGACY_STEP_MAP`); thiếu / sai → bước đầu.
 * `part` (story 28; story 47 thêm ngày Ngữ pháp): phần thuộc bài của buổi thì giữ (đánh dấu phần giữa buổi hay đồng bộ
 * không đổi phần đang học); thiếu, sai hoặc của bài khác → tính lại từ store (phần chưa xem đầu tiên).
 */
export function resolveSessionPlan(params: SessionParams, store: Store, hasContent: HasContent): ResolvedSessionPlan {
  const brickId = parseBrickParam(params.brick, hasContent)
  const pinnedLesson = brickId ? null : resolveSessionLesson(params.lesson, null)
  let plan: SessionPlan
  if (brickId) {
    // Ôn = không còn viên tiếp theo (cùng nghĩa với `sessionPlan`).
    plan = { mode: 'foundation', brickId, review: nextBrickIdFromState(foundationState(store), hasContent) === null, steps: FOUNDATION_STEPS }
  } else if (pinnedLesson) {
    plan = { mode: 'lesson', lesson: pinnedLesson, partId: lessonPartOf(store, pinnedLesson), steps: LESSON_STEPS }
  } else {
    plan = sessionPlan(store, hasContent)
  }
  if (plan.mode === 'lesson' && plan.lesson) {
    const part = (params.part ?? '').trim()
    if (lessonPartIds(plan.lesson.lesson.id).includes(part)) plan = { ...plan, partId: part }
  }
  const stepIndex = stepIndexOf(plan, params.step)
  return { plan, stepIndex, search: sessionSearch(plan, stepIndex) }
}

/**
 * Link buổi 30' ghim bài `lessonId`, mở ở bước Bài chính (Bản đồ thì, story 42): `/session?lesson=<id>&step=lesson`.
 * `resolveSessionPlan` đọc `?lesson=` thành buổi bài đó (kể cả khi đang ở Sân ga); phần của đoạn Phát âm (`?part=`) không
 * ghi ở đây mà do `resolveSessionPlan` tự chọn (phần / ngày chưa xem đầu tiên). Bài chia phần (T1) hay chia ngày (T2–T4,
 * story 47) chưa xem hết thì buổi là buổi học phần đó, chưa có thẻ kiểm tra cuối Bài chính trừ phần cuối
 * (`sessionCheckQuizId`, story 41); Bản đồ thì vẫn có nút "Làm kiểm tra".
 */
export function lessonSessionHref(lessonId: string): string {
  return `/session?${new URLSearchParams({ lesson: lessonId, step: 'lesson' }).toString()}`
}

/**
 * Quiz kiểm tra cuối bước Bài chính của buổi (story 41): quiz bài `lesson-<id>` khi buổi là buổi bài, bài có quiz bài, và
 * buổi học cả bài (`partId` null: bài không chia phần hoặc buổi ôn cả tuần) hoặc phần cuối của bài (phần Phát âm cuối của
 * bài T1, hay ngày 5 "Ôn trộn cả tuần" của bài chia Ngữ pháp theo ngày, story 47). Buổi học phần đầu / ngày 1–4 thì chưa học
 * hết bài nên chưa kiểm tra; buổi Sân ga, hết lộ trình hay bài không có quiz → null.
 */
export function sessionCheckQuizId(plan: SessionPlan): string | null {
  if (plan.mode !== 'lesson' || !plan.lesson) return null
  const lessonId = plan.lesson.lesson.id
  const quizId = lessonQuizId(lessonId)
  if (!getQuiz(quizId)) return null
  if (plan.partId === null) return quizId
  const parts = lessonPartIds(lessonId)
  return parts.length > 0 && parts[parts.length - 1] === plan.partId ? quizId : null
}

/** `lessonId` ghi vào nhật ký khi "Xong buổi": viên dạng `f03` hoặc id bài; không có → undefined. */
export function sessionRecordLessonId(plan: SessionPlan): string | undefined {
  if (plan.mode === 'foundation') return plan.brickId ? brickLessonId(plan.brickId) : undefined
  return plan.lesson?.lesson.id
}

/**
 * "Xong buổi" (story 28): buổi học một phần của bài T1 (hay một ngày Ngữ pháp, story 47) cũng tính phần đó là đã xem
 * (`markLessonPartSeen`, đã có thì trả store cũ). Buổi Sân ga, buổi bài không chia phần hay buổi ôn cả tuần (`partId`
 * null) → store cũ.
 */
export function markSessionPartSeen(store: Store, plan: SessionPlan): Store {
  if (plan.mode !== 'lesson' || !plan.lesson || !plan.partId) return store
  return markLessonPartSeen(store, plan.lesson.lesson.id, plan.partId)
}

/** Viên cho nút "Học tiếp viên sau": viên tiếp theo khi khác viên đang học; không có → null. */
export function followUpBrickId(store: Store, currentId: BrickId | null, hasContent: HasContent): BrickId | null {
  const next = nextBrickIdFromState(foundationState(store), hasContent)
  return next !== null && next !== currentId ? next : null
}

/**
 * Lời mô tả chế độ ôn: `latest` = viên xong gần nhất ("ôn lại viên gần nhất"); `done` = viên đã học nhưng không phải
 * viên gần nhất (URL chốt viên cũ); `tested` = chưa học, hàng qua bằng Soát vé / "Tôi biết rồi".
 */
export type ReviewNote = 'latest' | 'done' | 'tested'

export function reviewNote(store: Store, brickId: BrickId, hasContent: HasContent): ReviewNote {
  if (!readFoundation(store).bricks[brickId]?.lastDoneAt) return 'tested'
  return latestDoneBrick(store, hasContent) === brickId ? 'latest' : 'done'
}

/** Chế độ của phần lý thuyết, chốt theo viên lúc vào buổi. */
export type TheoryLock = { brickId: BrickId; review: boolean; note: ReviewNote | null }

/**
 * Chốt "Ôn lại" theo viên lúc vào buổi: cùng viên thì giữ `lock` cũ (học xong viên có nội dung cuối cùng giữa buổi
 * không biến buổi thành buổi ôn); viên khác (vào buổi, "Học tiếp viên sau") thì chốt mới từ `plan`. Không phải buổi Sân
 * ga hoặc không có viên → null.
 */
export function lockTheory(
  lock: TheoryLock | null,
  plan: SessionPlan,
  store: Store,
  hasContent: HasContent,
): TheoryLock | null {
  if (plan.mode !== 'foundation' || !plan.brickId) return null
  if (lock?.brickId === plan.brickId) return lock
  return {
    brickId: plan.brickId,
    review: plan.review,
    note: plan.review ? reviewNote(store, plan.brickId, hasContent) : null,
  }
}

/** Bộ từ mở đầu của bước ôn flashcard: buổi bài theo bài (`wordListForLesson`), buổi Sân ga dùng NGSL. */
export function sessionWordList(plan: SessionPlan): ReturnType<typeof wordListForLesson> {
  return plan.mode === 'lesson' ? wordListForLesson(plan.lesson) : 'ngsl'
}
