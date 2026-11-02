import type { StorageLike } from '@/lib/storage'

/**
 * PAT GitHub (classic, chỉ quyền `gist`) và id của secret gist. Chỉ nằm ở localStorage dưới key riêng, **ngoài**
 * `store.data`: không đồng bộ Supabase, không vào file sao lưu, không ghi lên Gist, không log.
 */
export const GIST_TOKEN_STORAGE = 'lumos-english:gist-token'
export const GIST_ID_STORAGE = 'lumos-english:gist-id'
/** Lần ghi Gist gần nhất trên máy này (thời điểm thử, thời điểm thành công, dấu vân tay dữ liệu đã ghi). */
export const GIST_LAST_WRITE_STORAGE = 'lumos-english:gist-last-write'

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

export function readGistToken(storage?: KeyStorage | null): string | null {
  return read(GIST_TOKEN_STORAGE, storage)
}

/** Id gist chỉ gồm chữ số hex (không cho ký tự làm lệch URL). */
export function isValidGistId(id: string): boolean {
  return /^[0-9a-f]{20,64}$/i.test(id)
}

export function readGistId(storage?: KeyStorage | null): string | null {
  const id = read(GIST_ID_STORAGE, storage)
  return id && isValidGistId(id) ? id : null
}

/** Lưu PAT + gist id cùng lúc (chỉ sau khi đã gọi GitHub thành công). Trả về đã lưu được chưa. */
export function saveGistCredentials(token: string, gistId: string, storage?: KeyStorage | null): boolean {
  const t = token.trim()
  const id = gistId.trim()
  if (t === '' || !isValidGistId(id)) return false
  const ok = write(GIST_TOKEN_STORAGE, t, storage) && write(GIST_ID_STORAGE, id, storage)
  if (!ok) clearGistCredentials(storage)
  return ok
}

/** Ngắt kết nối trên máy này: xoá PAT, gist id và mốc ghi gần nhất. Gist trên GitHub giữ nguyên. */
export function clearGistCredentials(storage?: KeyStorage | null): void {
  remove(GIST_TOKEN_STORAGE, storage)
  remove(GIST_ID_STORAGE, storage)
  remove(GIST_LAST_WRITE_STORAGE, storage)
}

export type LastWrite = {
  /** Lần thử ghi gần nhất (thành công hay lỗi), để giãn cách ghi khi xuống nền. */
  attemptAt: string | null
  /** Lần ghi thành công gần nhất. */
  writtenAt: string | null
  /** Dấu vân tay dữ liệu của lần ghi thành công gần nhất (để biết dữ liệu có đổi không). */
  fingerprint: string | null
}

const EMPTY_LAST_WRITE: LastWrite = { attemptAt: null, writtenAt: null, fingerprint: null }

function str(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null
}

export function readLastWrite(storage?: KeyStorage | null): LastWrite {
  const raw = read(GIST_LAST_WRITE_STORAGE, storage)
  if (!raw) return { ...EMPTY_LAST_WRITE }
  try {
    const v = JSON.parse(raw) as Record<string, unknown>
    return { attemptAt: str(v.attemptAt), writtenAt: str(v.writtenAt), fingerprint: str(v.fingerprint) }
  } catch {
    return { ...EMPTY_LAST_WRITE }
  }
}

export function saveLastWrite(value: LastWrite, storage?: KeyStorage | null): void {
  write(GIST_LAST_WRITE_STORAGE, JSON.stringify(value), storage)
}
