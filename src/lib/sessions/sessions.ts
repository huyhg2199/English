import { allLessons, getLessonEntry, type Lesson, type Stage } from '@/data/roadmap'
import type { WordList } from '@/data/vocab'
import { readStartLessonId } from '@/lib/placement/store'
import { computeRoadmapProgress, readCompletedLessonIds } from '@/lib/roadmap-progress'
import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Nhật ký buổi học (story 4): `store.data.sessions.days[YYYY-MM-DD]`, ngày theo giờ máy.
 * Dữ liệu cho streak và CAP-5/6/7 sau này. Hàm thuần: thời gian luôn lấy từ tham số `now`.
 */

export type SessionKind = 'full' | 'lazy'

export type SessionDay = {
  kind: SessionKind
  /** Lúc bấm "Xong buổi" (ISO). */
  completedAt: string
  /** Số phút tính giờ học theo CAP-7 (giờ chủ động + giải trí ×½). */
  minutes: number
  /** Bài của buổi (buổi chuẩn). */
  lessonId?: string
  /** Lần sửa gần nhất; không bao giờ lùi. Dùng để gộp khi đồng bộ. */
  updatedAt: string
}

/** Phút tính giờ học: buổi chuẩn = 5' SRS + 15' bài chính + 10' giải trí × ½ = 25; buổi lười = 10. */
export const SESSION_MINUTES: Record<SessionKind, number> = { full: 5 + 15 + 10 / 2, lazy: 10 }

export function isSessionDay(value: unknown): value is SessionDay {
  if (!isPlainObject(value)) return false
  const { kind, completedAt, minutes, lessonId, updatedAt } = value
  return (
    (kind === 'full' || kind === 'lazy') &&
    isTimeString(completedAt) &&
    isTimeString(updatedAt) &&
    typeof minutes === 'number' &&
    Number.isFinite(minutes) &&
    minutes >= 0 &&
    (lessonId === undefined || typeof lessonId === 'string')
  )
}

/** Key ngày theo giờ máy: `YYYY-MM-DD`. */
export function localDayKey(now: Date): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Đọc `sessions.days`; thiếu hoặc sai dạng thì coi như rỗng (không sửa store). */
export function readSessionDays(store: Store): Record<string, unknown> {
  const sessions = store.data.sessions
  return isPlainObject(sessions) && isPlainObject(sessions.days) ? sessions.days : {}
}

/** Mục nhật ký hợp lệ của hôm nay (giờ máy), hoặc null. */
export function todaySession(store: Store, now: Date): SessionDay | null {
  const entry = readSessionDays(store)[localDayKey(now)]
  return isSessionDay(entry) ? entry : null
}

/**
 * Ghi buổi đã hoàn thành cho hôm nay. Mỗi ngày một mục; buổi chuẩn ưu tiên hơn buổi lười:
 * hôm nay đã `full` mà xong buổi lười thì giữ nguyên (trả về đúng store cũ).
 * Không sửa store cũ, giữ nguyên các ngày khác (kể cả mục sai dạng) và field khác của `sessions`.
 */
export function recordSession(
  store: Store,
  kind: SessionKind,
  now: Date,
  extra: { lessonId?: string | null } = {},
): Store {
  const sessions = isPlainObject(store.data.sessions) ? store.data.sessions : {}
  const days = readSessionDays(store)
  const key = localDayKey(now)
  const current = days[key]
  if (kind === 'lazy' && isSessionDay(current) && current.kind === 'full') return store
  const entry: SessionDay = {
    kind,
    completedAt: now.toISOString(),
    minutes: SESSION_MINUTES[kind],
    ...(extra.lessonId ? { lessonId: extra.lessonId } : {}),
    updatedAt: nextUpdatedAt(isPlainObject(current) ? current.updatedAt : undefined, now),
  }
  return { ...store, data: { ...store.data, sessions: { ...sessions, days: { ...days, [key]: entry } } } }
}

/**
 * Streak = số ngày liên tiếp có buổi hoàn thành (chuẩn hoặc lười), tính tới hôm nay.
 * Hôm nay chưa học thì tính tới hôm qua (chưa coi là đứt).
 */
export function computeStreak(days: Record<string, unknown>, now: Date): number {
  const has = (offset: number) =>
    isSessionDay(days[localDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset))])
  let offset = has(0) ? 0 : -1
  let streak = 0
  while (has(offset)) {
    streak++
    offset--
  }
  return streak
}

export type SessionLesson = { lesson: Lesson; stage: Stage }

/**
 * Bài của buổi = bài chưa xong đầu tiên trên lộ trình, tính từ bài bắt đầu của Mũ Phân Loại (nếu có);
 * null khi đã xong cả lộ trình.
 */
export function sessionLesson(store: Store): SessionLesson | null {
  const { nextLessonId } = computeRoadmapProgress(allLessons(), readCompletedLessonIds(store), readStartLessonId(store))
  const entry = nextLessonId ? getLessonEntry(nextLessonId) : undefined
  return entry ? { lesson: entry.lesson, stage: entry.stage } : null
}

/**
 * Danh sách lấy từ mới trước: bài hiện tại ở chặng 1 → NGSL; chặng 2 trở đi → TSL
 * (hết TSL thì tiếp NGSL còn lại). Xong cả lộ trình thì coi như chặng cuối → TSL.
 */
export function newWordListFor(store: Store): WordList {
  return wordListForLesson(sessionLesson(store))
}

/** Như `newWordListFor` nhưng cho một bài cụ thể (bài đã chốt của buổi); null = hết lộ trình → TSL. */
export function wordListForLesson(current: SessionLesson | null): WordList {
  return current && current.stage.number === 1 ? 'ngsl' : 'tsl'
}

/** Bài của buổi đã chốt theo id (vd `?lesson=` trên URL); id thiếu / sai thì dùng `fallback`. */
export function resolveSessionLesson(lessonId: string | null | undefined, fallback: SessionLesson | null): SessionLesson | null {
  const entry = lessonId ? getLessonEntry(lessonId) : undefined
  return entry ? { lesson: entry.lesson, stage: entry.stage } : fallback
}
