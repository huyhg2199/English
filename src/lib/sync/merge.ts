import { isLessonProgress } from '@/lib/roadmap-progress'
import { CURRENT_VERSION, isPlainObject, migrations as defaultMigrations, runMigrations } from '@/lib/storage'
import type { Migrations, Store } from '@/lib/storage'

/**
 * Các key của `store.data` được đồng bộ lên Supabase. Story sau muốn đồng bộ key mới
 * phải thêm vào đây (và viết luật gộp nếu cần). Không bao giờ thêm key chứa API key/PAT/token.
 */
export const SYNCED_KEYS = ['progress'] as const

/** Bản lưu trên server (một hàng `user_store`). */
export type RemoteStore = {
  schemaVersion: number
  data: Record<string, unknown>
  updatedAt: string
}

export type MergeResult =
  | { kind: 'outdated' }
  | {
      kind: 'merged'
      /** Store local sau khi gộp (giữ nguyên các key ngoài allowlist). */
      store: Store
      /** Phần allowlist của store đã gộp có khác local không (cần ghi local). */
      changedLocal: boolean
      /** Có cần ghi lên server không (server trống, server cũ hơn hoặc khác nội dung). */
      push: boolean
    }

/** Lấy phần allowlist của `data`; key không có thì bỏ qua. */
export function pickSynced(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of SYNCED_KEYS) {
    if (key in data && data[key] !== undefined) out[key] = data[key]
  }
  return out
}

function time(entry: { updatedAt: string }): number {
  return Date.parse(entry.updatedAt)
}

/**
 * Gộp `progress.lessons` theo từng bài: `updatedAt` mới hơn thắng, bằng nhau thì giữ local.
 * Một bên sai dạng thì lấy bên hợp lệ; cả hai sai dạng thì giữ local (hoặc server nếu local không có).
 */
export function mergeLessons(local: unknown, server: unknown): Record<string, unknown> {
  const l = isPlainObject(local) ? local : {}
  const s = isPlainObject(server) ? server : {}
  const out: Record<string, unknown> = {}
  for (const id of new Set([...Object.keys(l), ...Object.keys(s)])) {
    const a = l[id]
    const b = s[id]
    const aOk = isLessonProgress(a)
    const bOk = isLessonProgress(b)
    if (aOk && bOk) out[id] = time(b) > time(a) ? b : a
    else if (aOk) out[id] = a
    else if (bOk) out[id] = b
    else out[id] = id in l ? a : b
  }
  return out
}

function mergeProgress(local: unknown, server: unknown): unknown {
  const hasLocal = isPlainObject(local)
  const hasServer = isPlainObject(server)
  if (!hasLocal && !hasServer) return local ?? server
  const l = hasLocal ? local : {}
  const s = hasServer ? server : {}
  // Field khác của progress: local ưu tiên, server bù chỗ thiếu.
  return { ...s, ...l, lessons: mergeLessons(l.lessons, s.lessons) }
}

/** Luật gộp cho từng key đồng bộ. Thêm key vào `SYNCED_KEYS` mà thiếu luật ở đây thì lỗi type-check. */
const MERGERS: Record<(typeof SYNCED_KEYS)[number], (local: unknown, server: unknown) => unknown> = {
  progress: mergeProgress,
}

/** Gộp phần allowlist của server vào data local. Key ngoài allowlist của server bị bỏ qua. */
export function mergeData(local: Record<string, unknown>, server: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...local }
  for (const key of SYNCED_KEYS) {
    const merged = MERGERS[key](local[key], server[key])
    if (merged === undefined) delete out[key]
    else out[key] = merged
  }
  return out
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
    return a.every((v, i) => deepEqual(v, b[i]))
  }
  if (!isPlainObject(a) || !isPlainObject(b)) return false
  const ka = Object.keys(a)
  if (ka.length !== Object.keys(b).length) return false
  return ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]))
}

export class InvalidRemoteError extends Error {}

/**
 * Gộp store local với bản trên server.
 * - Server trống → giữ local, đẩy lên.
 * - Server cũ hơn → `runMigrations` rồi gộp, đẩy lên bằng version hiện tại.
 * - Server mới hơn app → `outdated`: không gộp, không ghi đè server.
 * Ném lỗi khi bản server sai cấu trúc hoặc migrate lỗi (để không ghi đè server).
 */
export function mergeWithRemote(
  local: Store,
  remote: RemoteStore | null,
  opts: { currentVersion?: number; migrations?: Migrations } = {},
): MergeResult {
  const target = opts.currentVersion ?? CURRENT_VERSION
  if (!remote) {
    return { kind: 'merged', store: local, changedLocal: false, push: true }
  }
  const v = remote.schemaVersion
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || !isPlainObject(remote.data)) {
    throw new InvalidRemoteError('Bản trên server sai cấu trúc')
  }
  if (v > target) return { kind: 'outdated' }

  const serverStore =
    v < target
      ? runMigrations({ schemaVersion: v, data: pickSynced(remote.data) }, target, opts.migrations ?? defaultMigrations)
      : { schemaVersion: v, data: remote.data }
  const serverSynced = pickSynced(serverStore.data)
  const mergedData = mergeData(local.data, serverSynced)
  const mergedSynced = pickSynced(mergedData)
  const changedLocal = !deepEqual(mergedSynced, pickSynced(local.data))
  const push = v !== target || !deepEqual(mergedSynced, serverSynced)
  return {
    kind: 'merged',
    store: changedLocal ? { ...local, data: mergedData } : local,
    changedLocal,
    push,
  }
}
