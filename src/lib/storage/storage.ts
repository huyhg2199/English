import {
  CURRENT_VERSION,
  createDefaultStore,
  isPlainObject,
  migrations as defaultMigrations,
  runMigrations,
} from './migrations'
import type { LoadedStore, Migrations, StorageLike, Store } from './types'

export const STORAGE_KEY = 'lumos-english:store'

export type StorageOptions = {
  /** Mặc định là `window.localStorage`. Truyền `null` để giả lập bị chặn. */
  storage?: StorageLike | null
  key?: string
  currentVersion?: number
  migrations?: Migrations
  warn?: (message: string, error?: unknown) => void
}

const defaultWarn = (message: string, error?: unknown) => {
  console.warn(`[storage] ${message}`, error ?? '')
}

/** Lấy localStorage; có trình duyệt ném lỗi ngay khi truy cập thuộc tính này. */
function resolveStorage(opts: StorageOptions): StorageLike | null {
  if (opts.storage !== undefined) return opts.storage
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function isValidStore(value: unknown): value is Store {
  if (!isPlainObject(value)) return false
  const v = value.schemaVersion
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && isPlainObject(value.data)
}

function write(storage: StorageLike, key: string, store: Store, warn: StorageOptions['warn']) {
  try {
    storage.setItem(key, JSON.stringify(store))
    return true
  } catch (error) {
    warn?.('Không ghi được localStorage', error)
    return false
  }
}

/**
 * Đọc store theo I/O Matrix của story 1:
 * trống → mặc định; version thấp → migrate tuần tự; hỏng/bị chặn/migrate lỗi → bộ nhớ tạm,
 * không ghi đè; version cao hơn → chỉ đọc. Không bao giờ ném lỗi.
 */
export function loadStore(opts: StorageOptions = {}): LoadedStore {
  const key = opts.key ?? STORAGE_KEY
  const target = opts.currentVersion ?? CURRENT_VERSION
  const list = opts.migrations ?? defaultMigrations
  const warn = opts.warn ?? defaultWarn
  const storage = resolveStorage(opts)

  if (!storage) {
    warn('localStorage không khả dụng, dùng bộ nhớ tạm')
    return { store: createDefaultStore(target), mode: 'memory', status: 'unavailable' }
  }

  let raw: string | null
  try {
    raw = storage.getItem(key)
  } catch (error) {
    warn('Không đọc được localStorage, dùng bộ nhớ tạm', error)
    return { store: createDefaultStore(target), mode: 'memory', status: 'unavailable' }
  }

  if (raw === null) {
    const store = createDefaultStore(target)
    const saved = write(storage, key, store, warn)
    return { store, mode: saved ? 'persistent' : 'memory', status: 'fresh' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    warn('Dữ liệu lưu bị hỏng (không parse được), giữ nguyên và dùng bộ nhớ tạm', error)
    return { store: createDefaultStore(target), mode: 'memory', status: 'corrupt' }
  }

  if (!isValidStore(parsed)) {
    warn('Dữ liệu lưu sai cấu trúc, giữ nguyên và dùng bộ nhớ tạm')
    return { store: createDefaultStore(target), mode: 'memory', status: 'corrupt' }
  }

  if (parsed.schemaVersion > target) {
    warn(
      `Dữ liệu do bản app mới hơn ghi (v${parsed.schemaVersion} > v${target}), chạy chỉ đọc`,
    )
    return { store: parsed, mode: 'read-only', status: 'newer-version' }
  }

  if (parsed.schemaVersion === target) {
    return { store: parsed, mode: 'persistent', status: 'ok' }
  }

  let migrated: Store
  try {
    migrated = runMigrations(parsed, target, list)
  } catch (error) {
    warn('Migration lỗi, giữ bản gốc và dùng bộ nhớ tạm', error)
    return { store: createDefaultStore(target), mode: 'memory', status: 'migration-failed' }
  }

  const saved = write(storage, key, migrated, warn)
  return { store: migrated, mode: saved ? 'persistent' : 'memory', status: 'migrated' }
}

/**
 * Ghi store. Chỉ ghi khi đang ở chế độ `persistent`; ở `memory`/`read-only` thì
 * giữ nguyên dữ liệu trong localStorage và trả về false. Không bao giờ ném lỗi.
 */
export function saveStore(
  loaded: LoadedStore,
  next: Store,
  opts: StorageOptions = {},
): boolean {
  loaded.store = next
  if (loaded.mode !== 'persistent') return false
  const storage = resolveStorage(opts)
  const saved = !!storage && write(storage, opts.key ?? STORAGE_KEY, next, opts.warn ?? defaultWarn)
  if (!saved) loaded.mode = 'memory'
  return saved
}
