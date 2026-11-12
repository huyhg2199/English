import type { MistakeTag } from '@/data/questions'
import { allLessons, getLesson } from '@/data/roadmap'
import { isPlainObject, type Store } from '@/lib/storage'
import { nextUpdatedAt } from '@/lib/updated-at'

import { isBrickInviteDismissal, mergeBrickInvites, type BrickInviteDismissal } from './brick-invite'
import { lessonCheckPassedSince } from './lesson-check'
import { isMistakeItem, readMistakes } from './mistakes'

/**
 * Lời mời "Ôn lại bài: <tên bài>?" (story 41, CAP-19): khi trong 14 ngày gần nhất Sổ lỗi có từ 2 câu khác nhau nhãn `thì`
 * cùng thuộc một bài của lộ trình, Hôm nay mời ôn lại bài đó (link về đoạn có nhiều câu sai nhất). Chỉ là lời mời: không
 * chặn gì. Ẩn khi "Để sau" hoặc đã đạt kiểm tra bài (`lesson-<id>` ≥ 70%) sau câu sai mới nhất; có câu sai mới thì hiện lại.
 * "Để sau" lưu ở `mistakes.lessonInvites[lessonId]`, cùng dạng và luật gộp với `brickInvites` của story 28 (không nâng
 * schema, không thêm key đồng bộ). Module thuần: `now` và tra bài qua tham số.
 */

export const LESSON_INVITE_WINDOW_DAYS = 14
export const LESSON_INVITE_MIN_QUESTIONS = 2
export const LESSON_INVITE_TAG: MistakeTag = 'thì'

const WINDOW_MS = LESSON_INVITE_WINDOW_DAYS * 24 * 60 * 60 * 1000

/** `mistakes.lessonInvites` (thiếu / sai dạng → rỗng). Mục cùng dạng `BrickInviteDismissal`. */
export function readLessonInvites(store: Store): Record<string, unknown> {
  const mistakes = store.data.mistakes
  return isPlainObject(mistakes) && isPlainObject(mistakes.lessonInvites) ? mistakes.lessonInvites : {}
}

export type LessonReviewInvite = {
  lessonId: string
  /** Câu `thì` của bài trong Sổ lỗi (trong 14 ngày), câu sai mới nhất trước. */
  questionIds: readonly string[]
  /** Đoạn có nhiều câu sai nhất; bằng nhau lấy đoạn của câu sai mới nhất. */
  sectionId: string
}

export type LessonInviteDeps = {
  /** Id là bài của lộ trình (mặc định `getLesson(id) !== undefined`; câu Sân ga `fNN` không phải). */
  isLesson?: (id: string) => boolean
}

const defaultIsLesson = (id: string) => getLesson(id) !== undefined

type Entry = { id: string; at: number; sectionId: string }
type Tally = { entries: Entry[]; latest: number }

/**
 * Câu sai nhãn `thì` theo bài. `since` = mốc đầu cửa sổ (null = mọi lúc). Bỏ mục sai dạng, mục từ đọc (`word`), nhãn khác
 * và `lessonId` không phải bài lộ trình. Câu có `lastWrongAt` ở tương lai (đồng hồ máy lệch) vẫn tính.
 */
function tallyByLesson(store: Store, since: number | null, isLesson: (id: string) => boolean): Map<string, Tally> {
  const out = new Map<string, Tally>()
  for (const [id, item] of Object.entries(readMistakes(store))) {
    if (!isMistakeItem(item) || item.word || item.tag !== LESSON_INVITE_TAG || !isLesson(item.lessonId)) continue
    const at = Date.parse(item.lastWrongAt)
    if (since !== null && at < since) continue
    const t = out.get(item.lessonId) ?? { entries: [], latest: -Infinity }
    t.entries.push({ id, at, sectionId: item.sectionId })
    t.latest = Math.max(t.latest, at)
    out.set(item.lessonId, t)
  }
  return out
}

function timeOr(value: string | null | undefined): number {
  const t = value ? Date.parse(value) : NaN
  return Number.isFinite(t) ? t : -Infinity
}

function lessonOrder(id: string): number {
  return allLessons().findIndex((l) => l.id === id)
}

/** Đoạn có nhiều câu nhất (`entries` đã xếp mới nhất trước, nên bằng nhau thì đoạn gặp trước = đoạn của câu mới nhất). */
function weakestSection(entries: readonly Entry[]): string {
  const counts = new Map<string, number>()
  for (const e of entries) counts.set(e.sectionId, (counts.get(e.sectionId) ?? 0) + 1)
  let best = entries[0].sectionId
  for (const [sectionId, n] of counts) if (n > counts.get(best)!) best = sectionId
  return best
}

/**
 * Lời mời ôn bài tại `now` (null khi không có). Bài đủ điều kiện khi có ≥ 2 câu khác nhau nhãn `thì` trong Sổ lỗi với
 * `lastWrongAt` trong 14 × 24 giờ gần nhất, và câu sai mới nhất của bài muộn hơn `dismissedAt` của bài, đồng thời không có
 * lần đạt kiểm tra bài nào xong từ lúc câu sai mới nhất trở đi. Chọn 1 bài: nhiều câu hơn → câu sai mới nhất muộn hơn →
 * bài đứng sau trên lộ trình.
 */
export function lessonReviewInvite(store: Store, now: Date, deps: LessonInviteDeps = {}): LessonReviewInvite | null {
  const isLesson = deps.isLesson ?? defaultIsLesson
  const invites = readLessonInvites(store)
  let best: { lessonId: string; tally: Tally } | null = null
  for (const [lessonId, tally] of tallyByLesson(store, now.getTime() - WINDOW_MS, isLesson)) {
    if (tally.entries.length < LESSON_INVITE_MIN_QUESTIONS) continue
    const dismissal = invites[lessonId]
    const dismissedAt = isBrickInviteDismissal(dismissal) ? timeOr(dismissal.dismissedAt) : -Infinity
    if (tally.latest <= dismissedAt) continue
    // Lần đạt xong cùng lúc câu sai mới nhất (câu sai trong chính lần kiểm tra đạt đó) cũng tính là "sau".
    if (lessonCheckPassedSince(store, lessonId, tally.latest - 1)) continue
    if (!best) {
      best = { lessonId, tally }
      continue
    }
    const byCount = tally.entries.length - best.tally.entries.length
    const byLatest = tally.latest - best.tally.latest
    const byOrder = lessonOrder(lessonId) - lessonOrder(best.lessonId)
    if (byCount > 0 || (byCount === 0 && (byLatest > 0 || (byLatest === 0 && byOrder > 0)))) best = { lessonId, tally }
  }
  if (!best) return null
  const entries = [...best.tally.entries].sort((a, b) => b.at - a.at || (a.id < b.id ? -1 : 1))
  return { lessonId: best.lessonId, questionIds: entries.map((e) => e.id), sectionId: weakestSection(entries) }
}

/**
 * "Để sau" cho lời mời ôn bài `lessonId`: `dismissedAt` = muộn nhất trong `now`, dấu cũ và câu sai `thì` mới nhất (mọi lúc)
 * của bài (để đồng hồ máy lệch, câu sai ghi "ở tương lai", vẫn ẩn được). Lời mời hiện lại khi có câu sai mới hơn.
 * Id không phải bài lộ trình → store cũ.
 */
export function dismissLessonInvite(
  store: Store,
  lessonId: string,
  now: Date,
  isLesson: (id: string) => boolean = defaultIsLesson,
): Store {
  if (!isLesson(lessonId)) return store
  const invites = readLessonInvites(store)
  const previous = invites[lessonId]
  const old = isBrickInviteDismissal(previous) ? previous : null
  const latest = tallyByLesson(store, null, isLesson).get(lessonId)?.latest ?? -Infinity
  const at = Math.max(now.getTime(), timeOr(old?.dismissedAt), latest)
  const entry: BrickInviteDismissal = {
    dismissedAt: new Date(at).toISOString(),
    updatedAt: nextUpdatedAt(isPlainObject(previous) ? previous.updatedAt : undefined, now),
  }
  const mistakes = isPlainObject(store.data.mistakes) ? store.data.mistakes : {}
  return { ...store, data: { ...store.data, mistakes: { ...mistakes, lessonInvites: { ...invites, [lessonId]: entry } } } }
}

/**
 * Gộp `mistakes.lessonInvites` theo bài: đúng luật `mergeBrickInvites` (lấy `dismissedAt` muộn hơn; bằng nhau theo
 * `updatedAt` mới hơn, rồi giữ local; một bên sai dạng lấy bên hợp lệ).
 */
export function mergeLessonInvites(local: unknown, server: unknown): Record<string, unknown> {
  return mergeBrickInvites(local, server)
}
