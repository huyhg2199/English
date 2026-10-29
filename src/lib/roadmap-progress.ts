import type { Store } from '@/lib/storage'
import { isPlainObject } from '@/lib/storage'

/** `store.data.progress` từ schema v2. Story 4/6 ghi vào cùng field. */
export type Progress = { completedLessonIds: string[] }

export type RoadmapProgress = {
  /** Id bài đã xong và có trong dữ liệu lộ trình (id lạ bị bỏ qua). */
  completed: ReadonlySet<string>
  /** Bài chưa xong đầu tiên theo thứ tự; null khi đã xong hết. */
  nextLessonId: string | null
}

/** Đọc id bài đã xong; dữ liệu thiếu hoặc sai dạng thì coi như chưa học gì. */
export function readCompletedLessonIds(store: Store): readonly string[] {
  const progress = store.data.progress
  if (!isPlainObject(progress) || !Array.isArray(progress.completedLessonIds)) return []
  return progress.completedLessonIds.filter((id): id is string => typeof id === 'string')
}

/**
 * Trả về store mới với bài được đánh dấu / bỏ đánh dấu. Không sửa store cũ,
 * giữ nguyên các id khác (kể cả id lạ) và các field khác của `progress`.
 */
export function setLessonCompleted(store: Store, lessonId: string, done: boolean): Store {
  const progress = isPlainObject(store.data.progress) ? store.data.progress : {}
  // Làm trên mảng gốc để không làm rơi phần tử lạ (kể cả không phải chuỗi).
  const raw: readonly unknown[] = Array.isArray(progress.completedLessonIds) ? progress.completedLessonIds : []
  const has = raw.includes(lessonId)
  if (has === done) return store
  const completedLessonIds = done ? [...raw, lessonId] : raw.filter((id) => id !== lessonId)
  return { ...store, data: { ...store.data, progress: { ...progress, completedLessonIds } } }
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
