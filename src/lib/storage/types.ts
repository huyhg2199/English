/** Toàn bộ dữ liệu học lưu ở localStorage, dưới một key duy nhất. */
export type Store = {
  schemaVersion: number
  data: Record<string, unknown>
}

/** Biến store ở version n thành store ở version n + 1. */
export type Migration = (store: Store) => Store

/** Map version nguồn → migration lên version kế tiếp. */
export type Migrations = Record<number, Migration>

/** Phần localStorage mà lớp storage cần (để test thay bằng bản giả). */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

/**
 * - `persistent`: đọc/ghi localStorage bình thường.
 * - `memory`: chạy bằng bộ nhớ tạm, không ghi (localStorage hỏng, bị chặn, migration lỗi).
 * - `read-only`: dữ liệu do bản app mới hơn ghi; giữ nguyên, không ghi đè.
 */
export type StoreMode = 'persistent' | 'memory' | 'read-only'

export type LoadStatus =
  | 'fresh' // localStorage trống, vừa khởi tạo mặc định
  | 'ok' // đúng version hiện tại
  | 'migrated' // đã nâng version
  | 'corrupt' // JSON hỏng hoặc sai cấu trúc
  | 'migration-failed'
  | 'unavailable' // truy cập localStorage ném lỗi
  | 'newer-version'

export type LoadedStore = {
  store: Store
  mode: StoreMode
  status: LoadStatus
}
