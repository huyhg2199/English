import type { Migrations, Store } from './types'

/** Version schema hiện tại. Tăng lên khi thêm migration mới. */
export const CURRENT_VERSION = 7

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
  // v3 → v4 (story 3): thêm trạng thái SRS flashcard `srs: { cards: {} }`. Đã có `srs` thì để nguyên.
  // Lên v4 để app cũ (v3) trên máy khác thấy server mới hơn và không ghi đè mất `srs`.
  3: (store) => ({
    schemaVersion: 4,
    data: { ...store.data, srs: isPlainObject(store.data.srs) ? store.data.srs : { cards: {} } },
  }),
  // v4 → v5 (story 4): nhật ký buổi học `sessions: { days: {} }` và từ đã lưu `savedWords: { items: {} }`.
  // Đã có thì để nguyên. Lên v5 để app cũ (v4) thấy server mới hơn và không ghi đè mất hai key này.
  4: (store) => ({
    schemaVersion: 5,
    data: {
      ...store.data,
      sessions: isPlainObject(store.data.sessions) ? store.data.sessions : { days: {} },
      savedWords: isPlainObject(store.data.savedWords) ? store.data.savedWords : { items: {} },
    },
  }),
  // v5 → v6 (story 5): kết quả Mũ Phân Loại `placement`. Đã có thì để nguyên.
  // `updatedAt` = mốc cũ cố định để mọi lần sửa thật (Nhà, bài bắt đầu) đều thắng khi gộp.
  5: (store) => ({
    schemaVersion: 6,
    data: {
      ...store.data,
      placement: isPlainObject(store.data.placement)
        ? store.data.placement
        : { attempts: {}, house: null, startLessonId: null, updatedAt: LEGACY_UPDATED_AT },
    },
  }),
  // v6 → v7 (story 6): điểm luyện nói `pronunciation: { items: {} }`. Đã có thì để nguyên.
  // Lên v7 để app cũ (v6) trên máy khác thấy server mới hơn và không ghi đè mất key này.
  6: (store) => ({
    schemaVersion: 7,
    data: {
      ...store.data,
      pronunciation: isPlainObject(store.data.pronunciation) ? store.data.pronunciation : { items: {} },
    },
  }),
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
