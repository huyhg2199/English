import { BRICK_IDS, isBrickId, type BrickId } from '@/data/foundation'
import { conceptSource, getQuestion, type Question } from '@/data/questions'
import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

import { isMistakeItem, readMistakes } from './mistakes'

/**
 * Lời mời "Ôn viên gạch X n'?" (story 28, CAP-19 / CAP-23): khi trong 14 ngày gần nhất Sổ lỗi có từ 2 câu khác nhau cùng
 * cần một khái niệm do viên X dạy (`Question.requires` của story 27 ∩ `BRICKS[].teaches`), Hôm nay mời ôn viên X.
 * Chỉ là lời mời: không chặn gì, không đổi buổi học. "Để sau" lưu ở `mistakes.brickInvites[brickId]` (đồng bộ, gộp theo
 * viên lấy `dismissedAt` muộn hơn). Module thuần: `lastDoneAt` / `hasContent` nhận qua tham số (không import
 * `@/lib/foundation`).
 */

export const BRICK_INVITE_WINDOW_DAYS = 14
export const BRICK_INVITE_MIN_QUESTIONS = 2

const WINDOW_MS = BRICK_INVITE_WINDOW_DAYS * 24 * 60 * 60 * 1000

/** Dấu "Để sau" của một viên: lời mời ẩn tới khi có câu sai mới hơn `dismissedAt`. */
export type BrickInviteDismissal = { dismissedAt: string; updatedAt: string }

export function isBrickInviteDismissal(value: unknown): value is BrickInviteDismissal {
  return isPlainObject(value) && isTimeString(value.dismissedAt) && isTimeString(value.updatedAt)
}

/** `mistakes.brickInvites` (thiếu / sai dạng → rỗng). */
export function readBrickInvites(store: Store): Record<string, unknown> {
  const mistakes = store.data.mistakes
  return isPlainObject(mistakes) && isPlainObject(mistakes.brickInvites) ? mistakes.brickInvites : {}
}

export type BrickReviewInvite = {
  brickId: BrickId
  /** Câu trong Sổ lỗi (trong 14 ngày) cùng cần khái niệm của viên, câu sai mới nhất trước. */
  questionIds: readonly string[]
}

export type BrickInviteDeps = {
  /** `lastDoneAt` của viên (học xong gần nhất); chưa học → null / undefined. */
  lastDoneAt: (id: BrickId) => string | null | undefined
  /** Viên đã có nội dung (viên "Đang soạn" không mời). */
  hasContent: (id: BrickId) => boolean
  /** Tra câu theo id (mặc định `getQuestion`). */
  lookup?: (id: string) => Question | undefined
}

/** Viên dạy các khái niệm câu cần (mỗi viên một lần); khái niệm bài T1 không do viên nào dạy nên bỏ. */
function bricksOf(q: Question): BrickId[] {
  const out = new Set<BrickId>()
  for (const c of q.requires ?? []) {
    const source = conceptSource(c)
    if (source && 'brick' in source) out.add(source.brick)
  }
  return [...out]
}

type Tally = { questionIds: { id: string; at: number }[]; latest: number }

/**
 * Câu sai theo viên. `since` = mốc đầu cửa sổ (null = mọi lúc). Bỏ mục sai dạng, mục từ đọc O.W.L. (`word`), câu không
 * còn trong ngân hàng và câu không có `requires`. Câu có `lastWrongAt` ở tương lai (đồng hồ máy lệch) vẫn tính.
 */
function tallyByBrick(store: Store, since: number | null, lookup: (id: string) => Question | undefined): Map<BrickId, Tally> {
  const out = new Map<BrickId, Tally>()
  for (const [id, item] of Object.entries(readMistakes(store))) {
    if (!isMistakeItem(item) || item.word) continue
    const at = Date.parse(item.lastWrongAt)
    if (since !== null && at < since) continue
    const q = lookup(id)
    if (!q?.requires) continue
    for (const brick of bricksOf(q)) {
      const t = out.get(brick) ?? { questionIds: [], latest: -Infinity }
      t.questionIds.push({ id, at })
      t.latest = Math.max(t.latest, at)
      out.set(brick, t)
    }
  }
  return out
}

function timeOr(value: string | null | undefined): number {
  const t = value ? Date.parse(value) : NaN
  return Number.isFinite(t) ? t : -Infinity
}

/**
 * Lời mời ôn tại `now` (null khi không có). Viên X đủ điều kiện khi: ≥ 2 câu khác nhau trong Sổ lỗi có `lastWrongAt`
 * trong 14 × 24 giờ gần nhất cùng cần khái niệm viên X dạy, viên đã có nội dung, và câu sai mới nhất của X muộn hơn
 * `max(dismissedAt, lastDoneAt)` của X. Chọn 1 viên: nhiều câu hơn → câu sai mới nhất muộn hơn → viên đứng sau (F01 → F18).
 */
export function brickReviewInvite(store: Store, now: Date, deps: BrickInviteDeps): BrickReviewInvite | null {
  const lookup = deps.lookup ?? getQuestion
  const tallies = tallyByBrick(store, now.getTime() - WINDOW_MS, lookup)
  const invites = readBrickInvites(store)
  let best: { brickId: BrickId; tally: Tally } | null = null
  for (const [brickId, tally] of tallies) {
    if (tally.questionIds.length < BRICK_INVITE_MIN_QUESTIONS || !deps.hasContent(brickId)) continue
    const dismissal = invites[brickId]
    const dismissedAt = isBrickInviteDismissal(dismissal) ? timeOr(dismissal.dismissedAt) : -Infinity
    if (tally.latest <= Math.max(dismissedAt, timeOr(deps.lastDoneAt(brickId)))) continue
    if (!best) {
      best = { brickId, tally }
      continue
    }
    const byCount = tally.questionIds.length - best.tally.questionIds.length
    const byLatest = tally.latest - best.tally.latest
    const byOrder = BRICK_IDS.indexOf(brickId) - BRICK_IDS.indexOf(best.brickId)
    if (byCount > 0 || (byCount === 0 && (byLatest > 0 || (byLatest === 0 && byOrder > 0)))) best = { brickId, tally }
  }
  if (!best) return null
  const questionIds = [...best.tally.questionIds].sort((a, b) => b.at - a.at || (a.id < b.id ? -1 : 1)).map((q) => q.id)
  return { brickId: best.brickId, questionIds }
}

/**
 * "Để sau" cho lời mời viên `brickId`: `dismissedAt` = muộn nhất trong `now`, dấu cũ và câu sai mới nhất (mọi lúc) của viên
 * (để đồng hồ máy lệch, câu sai ghi "ở tương lai", vẫn ẩn được). Lời mời hiện lại khi có câu sai mới hơn. Id lạ → store cũ.
 * Viên khác có chung câu sai với viên này cũng được ghi dấu (cùng cách tính), để "Để sau" ẩn hẳn dải chứ không đổi sang mời
 * viên khác cho cùng mấy câu đó.
 */
export function dismissBrickInvite(
  store: Store,
  brickId: string,
  now: Date,
  lookup: (id: string) => Question | undefined = getQuestion,
): Store {
  if (!isBrickId(brickId)) return store
  const invites = readBrickInvites(store)
  const tallies = tallyByBrick(store, null, lookup)
  const own = new Set(tallies.get(brickId)?.questionIds.map((q) => q.id) ?? [])
  const targets = [brickId, ...[...tallies].filter(([id, t]) => id !== brickId && t.questionIds.some((q) => own.has(q.id))).map(([id]) => id)]
  const next: Record<string, unknown> = { ...invites }
  for (const id of targets) {
    const previous = invites[id]
    const old = isBrickInviteDismissal(previous) ? previous : null
    const at = Math.max(now.getTime(), timeOr(old?.dismissedAt), tallies.get(id)?.latest ?? -Infinity)
    next[id] = {
      dismissedAt: new Date(at).toISOString(),
      updatedAt: nextUpdatedAt(isPlainObject(previous) ? previous.updatedAt : undefined, now),
    } satisfies BrickInviteDismissal
  }
  const mistakes = isPlainObject(store.data.mistakes) ? store.data.mistakes : {}
  return { ...store, data: { ...store.data, mistakes: { ...mistakes, brickInvites: next } } }
}

/**
 * Gộp `mistakes.brickInvites` theo viên: lấy `dismissedAt` muộn hơn (bằng nhau thì `updatedAt` mới hơn, rồi giữ local).
 * Một bên sai dạng thì lấy bên hợp lệ; cả hai sai dạng thì giữ local (hoặc server nếu local không có).
 */
export function mergeBrickInvites(local: unknown, server: unknown): Record<string, unknown> {
  const l = isPlainObject(local) ? local : {}
  const s = isPlainObject(server) ? server : {}
  const out: Record<string, unknown> = {}
  for (const id of new Set([...Object.keys(l), ...Object.keys(s)])) {
    const a = l[id]
    const b = s[id]
    const aOk = isBrickInviteDismissal(a)
    const bOk = isBrickInviteDismissal(b)
    if (aOk && bOk) {
      const byDismissed = Date.parse(b.dismissedAt) - Date.parse(a.dismissedAt)
      out[id] = byDismissed > 0 || (byDismissed === 0 && Date.parse(b.updatedAt) > Date.parse(a.updatedAt)) ? b : a
    } else if (aOk) out[id] = a
    else if (bOk) out[id] = b
    else out[id] = id in l ? a : b
  }
  return out
}
