import type { Store } from '@/lib/storage'
import { isPlainObject } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/** Trạng thái một bài. Bỏ đánh dấu là `done: false` (không xoá key) để đồng bộ không làm sống lại. */
export type LessonProgress = { done: boolean; updatedAt: string }

/** `store.data.progress` từ schema v3. Story 4/6 ghi vào cùng field. */
export type Progress = { lessons: Record<string, LessonProgress> }

export type RoadmapProgress = {
  /** Id bài đã xong và có trong dữ liệu lộ trình (id lạ bị bỏ qua). */
  completed: ReadonlySet<string>
  /** Bài chưa xong đầu tiên theo thứ tự (tính từ bài bắt đầu); null khi đã xong hết. */
  nextLessonId: string | null
  /** Bài trước bài bắt đầu của Mũ Phân Loại mà chưa xong ("đã bỏ qua"); bài đã xong không nằm ở đây. */
  skipped: ReadonlySet<string>
}

export function isLessonProgress(value: unknown): value is LessonProgress {
  return (
    isPlainObject(value) &&
    typeof value.done === 'boolean' &&
    isTimeString(value.updatedAt)
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
 * Trả về store mới với bài được đánh dấu / bỏ đánh dấu (ghi `{ done, updatedAt }`).
 * Không sửa store cũ, giữ nguyên các bài khác (kể cả id lạ, mục sai dạng) và các field khác của `progress`.
 */
export function setLessonCompleted(store: Store, lessonId: string, done: boolean, now: Date = new Date()): Store {
  const progress = isPlainObject(store.data.progress) ? store.data.progress : {}
  const lessons = readLessons(store)
  const current = lessons[lessonId]
  const currentlyDone = isLessonProgress(current) && current.done
  if (currentlyDone === done) return store
  const previousAt = isLessonProgress(current) ? current.updatedAt : undefined
  const entry: LessonProgress = { done, updatedAt: nextUpdatedAt(previousAt, now) }
  return {
    ...store,
    data: { ...store.data, progress: { ...progress, lessons: { ...lessons, [lessonId]: entry } } },
  }
}

/**
 * Tính trạm đã qua, trạm "học tiếp" và trạm "đã bỏ qua" từ danh sách bài (theo thứ tự) và tiến độ.
 * `startLessonId` (Mũ Phân Loại): "học tiếp" là bài chưa xong đầu tiên **từ** bài đó; bài chưa xong phía trước
 * là "đã bỏ qua" (không bị đánh dấu xong). Xong hết từ bài bắt đầu trở đi thì "học tiếp" quay về bài bỏ qua đầu tiên.
 * `startLessonId` thiếu hoặc không có trong lộ trình → như không xếp lớp.
 */
export function computeRoadmapProgress(
  lessons: readonly { id: string }[],
  completedLessonIds: readonly string[],
  startLessonId?: string | null,
): RoadmapProgress {
  const saved = new Set(completedLessonIds)
  const completed = new Set<string>()
  const skipped = new Set<string>()
  const startIndex = startLessonId ? Math.max(0, lessons.findIndex((l) => l.id === startLessonId)) : 0
  let nextLessonId: string | null = null
  let firstSkipped: string | null = null
  lessons.forEach(({ id }, i) => {
    if (saved.has(id)) completed.add(id)
    else if (i < startIndex) {
      skipped.add(id)
      firstSkipped ??= id
    } else if (nextLessonId === null) nextLessonId = id
  })
  if (nextLessonId === null && firstSkipped !== null) {
    nextLessonId = firstSkipped
    skipped.delete(firstSkipped)
  }
  return { completed, nextLessonId, skipped }
}
