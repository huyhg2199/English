import type { Migrations, Store } from './types'

/** Version schema hiện tại. Tăng lên khi thêm migration mới. */
export const CURRENT_VERSION = 1

/**
 * `migrations[n]` biến store version n → n + 1.
 * Story sau thêm field thì: tăng CURRENT_VERSION và thêm migrations[CURRENT_VERSION - 1].
 * Migration không được xoá dữ liệu cũ; chỉ thêm hoặc đổi dạng field.
 */
export const migrations: Migrations = {}

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
