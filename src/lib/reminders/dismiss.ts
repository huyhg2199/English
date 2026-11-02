import type { StorageLike } from '@/lib/storage'

/** Ngày (`YYYY-MM-DD`) đã đóng dải nhắc trên máy này. Cài đặt máy, ngoài `store.data`, không đồng bộ. */
export const REMINDER_DISMISSED_STORAGE = 'lumos-english:reminder-dismissed'

function resolve(storage: StorageLike | null | undefined): StorageLike | null {
  if (storage !== undefined) return storage
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function readDismissedDay(storage?: StorageLike | null): string | null {
  try {
    const value = resolve(storage)?.getItem(REMINDER_DISMISSED_STORAGE)
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
  } catch {
    return null
  }
}

export function saveDismissedDay(day: string, storage?: StorageLike | null): void {
  try {
    resolve(storage)?.setItem(REMINDER_DISMISSED_STORAGE, day)
  } catch {
    // bỏ qua: chỉ ẩn trong phiên này
  }
}
