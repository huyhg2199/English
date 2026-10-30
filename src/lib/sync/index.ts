import type { SupabaseClient } from '@supabase/supabase-js'

import type { StorageLike, Store } from '@/lib/storage'

import { createAuth, disabledAuth, type AuthController, type AuthResult, type AuthState } from './auth'
import { createSyncEngine, type OutdatedReason, type SyncEngine, type SyncStatus, type SyncTarget } from './engine'
import { SYNCED_KEYS } from './merge'
import { createSupabaseRemote } from './remote'

export { createSupabase } from './client'
export { SYNCED_KEYS } from './merge'
export type { AuthResult, AuthState, OutdatedReason, SyncStatus, SyncTarget }

/** Key localStorage nhớ user id đã đồng bộ gần nhất trên máy (không phải bí mật). */
export const SYNC_USER_KEY = 'lumos-english:sync-user'

/** Đăng xuất chờ đẩy nốt thay đổi tối đa bấy nhiêu ms (mạng treo thì vẫn đăng xuất được). */
const SIGN_OUT_FLUSH_TIMEOUT_MS = 4000

export type SyncSnapshot = {
  /** false khi thiếu biến Supabase: app chạy chỉ local, không có đăng nhập. */
  enabled: boolean
  auth: AuthState
  status: SyncStatus
  /** Bên nào mới hơn khi `status === 'outdated'`, còn lại null. */
  outdatedReason: OutdatedReason | null
}

export type SyncController = {
  getSnapshot(): SyncSnapshot
  subscribe(listener: () => void): () => void
  sendCode(email: string): Promise<AuthResult>
  verifyCode(email: string, token: string): Promise<AuthResult>
  signOut(): Promise<void>
  syncNow(): Promise<void>
}

/** Store handle + sự kiện "người dùng vừa sửa dữ liệu" (không tính lần thay bằng bản từ server). */
export type SyncableStore = SyncTarget & { onLocalUpdate(listener: () => void): () => void }

type UserStorage = (StorageLike & Partial<Pick<Storage, 'removeItem'>>) | null

function defaultStorage(): UserStorage {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function readSyncUser(storage: UserStorage): string | null {
  try {
    return storage?.getItem(SYNC_USER_KEY) || null
  } catch {
    return null
  }
}

function writeSyncUser(storage: UserStorage, userId: string) {
  try {
    storage?.setItem(SYNC_USER_KEY, userId)
  } catch {
    // Không ghi được (Safari private, bị chặn): lần sau coi như máy mới → gộp như thường.
  }
}

/** Bỏ các key đồng bộ khỏi store; các key khác (cài đặt, API key…) giữ nguyên. */
export function withoutSyncedKeys(store: Store): Store {
  if (!SYNCED_KEYS.some((key) => key in store.data)) return store
  const data = { ...store.data }
  for (const key of SYNCED_KEYS) delete data[key]
  return { ...store, data }
}

/**
 * Nối auth + engine vào store: đăng nhập thì bắt đầu đồng bộ, đăng xuất thì đẩy nốt rồi dừng
 * (dữ liệu local giữ nguyên); mỗi lần sửa local thì đẩy sau debounce.
 *
 * Đổi tài khoản trên cùng máy: máy nhớ user id đã đồng bộ gần nhất (`SYNC_USER_KEY`). User khác đăng nhập
 * thì xoá các key đồng bộ trên máy trước khi `engine.start`, nên lượt đồng bộ đầu tiên đưa máy về đúng bản
 * server của user mới (server trống thì về rỗng) và không đẩy dữ liệu của user cũ sang. Cùng user hoặc máy
 * chưa từng đồng bộ thì gộp như thường.
 */
export function createSync(
  client: SupabaseClient | null,
  store: SyncableStore,
  deps: { auth?: AuthController; engine?: SyncEngine; storage?: UserStorage; flushTimeoutMs?: number } = {},
): SyncController {
  if (!client && !deps.auth) {
    const snapshot: SyncSnapshot = { enabled: false, auth: { status: 'disabled' }, status: 'off', outdatedReason: null }
    const auth = disabledAuth()
    return {
      getSnapshot: () => snapshot,
      subscribe: () => () => {},
      sendCode: auth.sendCode,
      verifyCode: auth.verifyCode,
      signOut: auth.signOut,
      syncNow: async () => {},
    }
  }

  const auth = deps.auth ?? createAuth(client!.auth)
  const engine = deps.engine ?? createSyncEngine({ remote: createSupabaseRemote(client!), target: store })
  const storage = deps.storage !== undefined ? deps.storage : defaultStorage()
  const flushTimeoutMs = deps.flushTimeoutMs ?? SIGN_OUT_FLUSH_TIMEOUT_MS
  const listeners = new Set<() => void>()

  const read = (): SyncSnapshot => ({
    enabled: true,
    auth: auth.getState(),
    status: engine.getStatus(),
    outdatedReason: engine.getOutdatedReason(),
  })
  let snapshot = read()

  function refresh() {
    const next = read()
    if (next.auth === snapshot.auth && next.status === snapshot.status && next.outdatedReason === snapshot.outdatedReason) {
      return
    }
    snapshot = next
    listeners.forEach((l) => l())
  }

  function startFor(userId: string) {
    const previous = readSyncUser(storage)
    if (previous && previous !== userId) {
      // Tài khoản khác: không gộp, không đẩy dữ liệu của user cũ sang. Engine sẽ kéo bản server của user mới.
      store.replace(withoutSyncedKeys(store.getSnapshot().store))
    }
    if (previous !== userId) writeSyncUser(storage, userId)
    engine.start(userId)
  }

  function followAuth() {
    const state = auth.getState()
    if (state.status === 'signed-in') startFor(state.user.id)
    else engine.stop()
  }

  auth.subscribe(() => {
    followAuth()
    refresh()
  })
  engine.subscribe(refresh)
  store.onLocalUpdate(() => engine.notifyLocalChange())
  followAuth()
  refresh()

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    sendCode: (email) => auth.sendCode(email),
    verifyCode: (email, token) => auth.verifyCode(email, token),
    async signOut() {
      // Đẩy nốt thay đổi còn chờ trước khi đăng xuất. Offline / lỗi / quá lâu thì vẫn đăng xuất, local giữ nguyên.
      let timer: ReturnType<typeof setTimeout> | undefined
      await Promise.race([
        engine.flush().catch(() => {}),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, flushTimeoutMs)
        }),
      ])
      clearTimeout(timer)
      await auth.signOut()
    },
    syncNow: () => engine.syncNow(),
  }
}
