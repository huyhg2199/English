import type { Migrations, Store } from './types'

/** Version schema hiện tại. Tăng lên khi thêm migration mới. */
export const CURRENT_VERSION = 3

/** Mốc `updatedAt` cho tiến độ có từ trước v3 (migration 2→3). */
export const LEGACY_UPDATED_AT = '1970-01-01T00:00:00.000Z'

/**
 * `migrations[n]` biến store version n → n + 1.
 * Story sau thêm field thì: tăng CURRENT_VERSION và thêm migrations[CURRENT_VERSION - 1].
 * Migration không được xoá dữ liệu cũ; chỉ thêm hoặc đổi dạng field.
 * Cũng dùng để nâng bản trên server (story 2a) trước khi gộp.
 */
export const migrations: Migrations = {
  // v1 → v2 (story 2): thêm tiến độ lộ trình. Giữ mọi field cũ; progress đã có thì để nguyên.
  1: (store) => ({
    schemaVersion: 2,
    data: {
      ...store.data,
      progress: isPlainObject(store.data.progress) ? store.data.progress : { completedLessonIds: [] },
    },
  }),
  // v2 → v3 (story 2a): `completedLessonIds: string[]` đổi dạng thành
  // `lessons: { [id]: { done, updatedAt } }` để gộp từng bài khi đồng bộ.
  // Giữ cả id lạ (bài đã bị xoá khỏi lộ trình). `updatedAt` = mốc cũ cố định (`LEGACY_UPDATED_AT`)
  // để mọi lần sửa thật (ở máy khác, kể cả trước khi máy này migrate) đều thắng tiến độ có từ trước.
  2: (store) => {
    const progress = isPlainObject(store.data.progress) ? store.data.progress : {}
    const { completedLessonIds, ...rest } = progress
    const lessons: Record<string, unknown> = isPlainObject(rest.lessons) ? { ...rest.lessons } : {}
    const updatedAt = LEGACY_UPDATED_AT
    if (Array.isArray(completedLessonIds)) {
      for (const id of completedLessonIds) {
        if (typeof id === 'string' && !Object.hasOwn(lessons, id)) lessons[id] = { done: true, updatedAt }
      }
    }
    return { schemaVersion: 3, data: { ...store.data, progress: { ...rest, lessons } } }
  },
}

export function createDefaultStore(version: number = CURRENT_VERSION): Store {
  return { schemaVersion: version, data: {} }
}

/**
 * Chạy migration tuần tự từ version của store tới `target`.
 * Ném lỗi nếu thiếu migration hoặc migration trả về store sai version.
 */
export function runMigrations(store: Store, target: number, list: Migrations): Store {
  let current = store
  while (current.schemaVersion < target) {
    const from = current.schemaVersion
    const migrate = list[from]
    if (!migrate) {
      throw new Error(`Thiếu migration từ version ${from}`)
    }
    const next = migrate(structuredClone(current))
    if (!next || next.schemaVersion !== from + 1 || !isPlainObject(next.data)) {
      throw new Error(`Migration ${from} → ${from + 1} trả về store không hợp lệ`)
    }
    current = next
  }
  return current
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
