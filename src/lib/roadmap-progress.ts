import type { Store } from '@/lib/storage'
import { isPlainObject } from '@/lib/storage'

/** Trạng thái một bài. Bỏ đánh dấu là `done: false` (không xoá key) để đồng bộ không làm sống lại. */
export type LessonProgress = { done: boolean; updatedAt: string }

/** `store.data.progress` từ schema v3. Story 4/6 ghi vào cùng field. */
export type Progress = { lessons: Record<string, LessonProgress> }

export type RoadmapProgress = {
  /** Id bài đã xong và có trong dữ liệu lộ trình (id lạ bị bỏ qua). */
  completed: ReadonlySet<string>
  /** Bài chưa xong đầu tiên theo thứ tự; null khi đã xong hết. */
  nextLessonId: string | null
}

export function isLessonProgress(value: unknown): value is LessonProgress {
  return (
    isPlainObject(value) &&
    typeof value.done === 'boolean' &&
    typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.updatedAt))
  )
}

function readLessons(store: Store): Record<string, unknown> {
  const progress = store.data.progress
  return isPlainObject(progress) && isPlainObject(progress.lessons) ? progress.lessons : {}
}

/** Đọc id bài đã xong (`done: true`); dữ liệu thiếu hoặc sai dạng thì coi như chưa học gì. */
export function readCompletedLessonIds(store: Store): readonly string[] {
  return Object.entries(readLessons(store))
    .filter(([, entry]) => isLessonProgress(entry) && entry.done)
    .map(([id]) => id)
}

/**
 * `updatedAt` của một bài không bao giờ lùi: `max(giờ máy, updatedAt cũ + 1ms)`.
 * Đồng hồ máy chạy lùi (hoặc bản cũ do máy chạy nhanh ghi) thì lần sửa mới vẫn thắng khi gộp.
 */
function nextUpdatedAt(previous: unknown, now: Date): string {
  const prev = isLessonProgress(previous) ? Date.parse(previous.updatedAt) : Number.NEGATIVE_INFINITY
  return new Date(Math.max(now.getTime(), prev + 1)).toISOString()
}

/**
 * Trả về store mới với bài được đánh dấu / bỏ đánh dấu (ghi `{ done, updatedAt }`).
 * Không sửa store cũ, giữ nguyên các bài khác (kể cả id lạ, mục sai dạng) và các field khác của `progress`.
 */
export function setLessonCompleted(store: Store, lessonId: string, done: boolean, now: Date = new Date()): Store {
  const progress = isPlainObject(store.data.progress) ? store.data.progress : {}
  const lessons = readLessons(store)
  const current = lessons[lessonId]
  const currentlyDone = isLessonProgress(current) && current.done
  if (currentlyDone === done) return store
  const entry: LessonProgress = { done, updatedAt: nextUpdatedAt(current, now) }
  return {
    ...store,
    data: { ...store.data, progress: { ...progress, lessons: { ...lessons, [lessonId]: entry } } },
  }
}

/** Tính trạm đã qua và trạm "học tiếp" từ danh sách bài (theo thứ tự) và tiến độ. */
export function computeRoadmapProgress(
  lessons: readonly { id: string }[],
  completedLessonIds: readonly string[],
): RoadmapProgress {
  const saved = new Set(completedLessonIds)
  const completed = new Set<string>()
  let nextLessonId: string | null = null
  for (const { id } of lessons) {
    if (saved.has(id)) completed.add(id)
    else if (nextLessonId === null) nextLessonId = id
  }
  return { completed, nextLessonId }
}
