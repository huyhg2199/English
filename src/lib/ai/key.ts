import type { StorageLike } from '@/lib/storage'

/**
 * Key Gemini của Huy (BYOK). Chỉ nằm ở localStorage dưới key riêng, **ngoài** `store.data`:
 * không đồng bộ, không vào file sao lưu, không log, không có trong repo.
 */
export const GEMINI_KEY_STORAGE = 'lumos-english:gemini-key'
/** Model đã chọn (cài đặt máy, cũng ngoài `store.data`). */
export const GEMINI_MODEL_STORAGE = 'lumos-english:gemini-model'
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

type KeyStorage = StorageLike & Pick<Storage, 'removeItem'>

function resolve(storage: KeyStorage | null | undefined): KeyStorage | null {
  if (storage !== undefined) return storage
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function read(name: string, storage: KeyStorage | null | undefined): string | null {
  try {
    const value = resolve(storage)?.getItem(name)
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
  } catch {
    return null
  }
}

function write(name: string, value: string, storage: KeyStorage | null | undefined): boolean {
  const s = resolve(storage)
  if (!s) return false
  try {
    s.setItem(name, value)
    return true
  } catch {
    return false
  }
}

function remove(name: string, storage: KeyStorage | null | undefined): void {
  try {
    resolve(storage)?.removeItem(name)
  } catch {
    // bỏ qua
  }
}

export function readGeminiKey(storage?: KeyStorage | null): string | null {
  return read(GEMINI_KEY_STORAGE, storage)
}

/** Lưu key (đã cắt khoảng trắng). Key rỗng thì xoá. Trả về đã lưu được chưa. */
export function saveGeminiKey(key: string, storage?: KeyStorage | null): boolean {
  const k = key.trim()
  if (k === '') {
    remove(GEMINI_KEY_STORAGE, storage)
    return true
  }
  return write(GEMINI_KEY_STORAGE, k, storage)
}

export function clearGeminiKey(storage?: KeyStorage | null): void {
  remove(GEMINI_KEY_STORAGE, storage)
}

/** Tên model hợp lệ: chữ, số, `.`, `-`, `_` (không cho ký tự làm lệch URL). */
export function isValidModelName(model: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{0,63}$/i.test(model)
}

export function readGeminiModel(storage?: KeyStorage | null): string {
  const model = read(GEMINI_MODEL_STORAGE, storage)
  return model && isValidModelName(model) ? model : DEFAULT_GEMINI_MODEL
}

/** Lưu model; rỗng hoặc bằng mặc định thì xoá (về mặc định). Tên sai dạng thì không lưu. */
export function saveGeminiModel(model: string, storage?: KeyStorage | null): boolean {
  const m = model.trim()
  if (m === '' || m === DEFAULT_GEMINI_MODEL) {
    remove(GEMINI_MODEL_STORAGE, storage)
    return true
  }
  if (!isValidModelName(m)) return false
  return write(GEMINI_MODEL_STORAGE, m, storage)
}
