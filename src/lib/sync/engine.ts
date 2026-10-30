import { CURRENT_VERSION, migrations as defaultMigrations } from '@/lib/storage'
import type { LoadedStore, Migrations, Store } from '@/lib/storage'

import { mergeWithRemote, pickSynced } from './merge'
import type { SyncRemote } from './remote'

/**
 * - `off`: chưa đăng nhập / không cấu hình Supabase.
 * - `idle`: đã đồng bộ.
 * - `syncing`: đang kéo/đẩy.
 * - `pending`: có thay đổi chưa đẩy được (đang chờ debounce hoặc offline).
 * - `error`: lần đồng bộ gần nhất lỗi (sẽ thử lại).
 * - `outdated`: bản trên server (hoặc local) do app mới hơn ghi; không ghi đè, cần cập nhật app.
 *   Xem `getOutdatedReason()` để biết bên nào mới hơn.
 */
export type SyncStatus = 'off' | 'idle' | 'syncing' | 'pending' | 'error' | 'outdated'

/** Khi `outdated`: `server` = bản trên tài khoản do app mới hơn ghi; `local` = dữ liệu trên máy do app mới hơn ghi. */
export type OutdatedReason = 'server' | 'local'

/** Phần của `StoreHandle` mà engine cần. */
export type SyncTarget = {
  getSnapshot(): LoadedStore
  /** Thay store bằng bản đã gộp từ server (ghi local + báo UI), không tính là thay đổi local. */
  replace(store: Store): void
}

/** Môi trường trình duyệt (test thay bằng bản giả). */
export type SyncEnvironment = {
  isOnline(): boolean
  /** Gọi `cb` khi có mạng lại; trả hàm huỷ. */
  onOnline(cb: () => void): () => void
  /** Gọi `cb` khi tab/PWA quay lại foreground; trả hàm huỷ. */
  onVisible(cb: () => void): () => void
  /** Gọi `cb` khi app xuống nền (`visibilityState = hidden`) hoặc sắp bị đóng (`pagehide`); trả hàm huỷ. */
  onHidden(cb: () => void): () => void
}

export type SyncEngineOptions = {
  remote: SyncRemote
  target: SyncTarget
  env?: SyncEnvironment
  /** Chờ bao lâu sau lần sửa cuối rồi mới đẩy. */
  debounceMs?: number
  /** Lỗi thì thử lại sau bao lâu. */
  retryMs?: number
  currentVersion?: number
  migrations?: Migrations
  warn?: (message: string, error?: unknown) => void
}

export type SyncEngine = {
  getStatus(): SyncStatus
  /** Lý do khi `getStatus() === 'outdated'`, còn lại là null. */
  getOutdatedReason(): OutdatedReason | null
  subscribe(listener: () => void): () => void
  /** Bắt đầu đồng bộ cho user (kéo ngay, nghe `online` / `visibilitychange`). */
  start(userId: string): void
  /** Ngừng đồng bộ (đăng xuất). Không đụng dữ liệu local. */
  stop(): void
  /** Báo có thay đổi local; đẩy sau debounce. */
  notifyLocalChange(): void
  /** Kéo + gộp + đẩy ngay. Trả về khi lượt đồng bộ hiện tại xong. */
  syncNow(): Promise<void>
  /**
   * Đẩy ngay thay đổi còn chờ (bỏ qua debounce), vd khi app xuống nền hoặc trước khi đăng xuất.
   * Không có gì chờ thì trả về luôn. Offline / lỗi thì giữ local, đẩy lần sau.
   */
  flush(): Promise<void>
}

const MAX_CONFLICT_RETRIES = 3

export function browserEnvironment(): SyncEnvironment {
  return {
    isOnline: () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false),
    onOnline(cb) {
      window.addEventListener('online', cb)
      return () => window.removeEventListener('online', cb)
    },
    onVisible(cb) {
      const handler = () => {
        if (document.visibilityState === 'visible') cb()
      }
      document.addEventListener('visibilitychange', handler)
      return () => document.removeEventListener('visibilitychange', handler)
    },
    onHidden(cb) {
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') cb()
      }
      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('pagehide', cb)
      return () => {
        document.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('pagehide', cb)
      }
    },
  }
}

export function createSyncEngine(opts: SyncEngineOptions): SyncEngine {
  const { remote, target } = opts
  const env = opts.env ?? browserEnvironment()
  const debounceMs = opts.debounceMs ?? 1500
  const retryMs = opts.retryMs ?? 30_000
  const currentVersion = opts.currentVersion ?? CURRENT_VERSION
  const list = opts.migrations ?? defaultMigrations
  const warn = opts.warn ?? ((m: string, e?: unknown) => console.warn(`[sync] ${m}`, e ?? ''))

  let status: SyncStatus = 'off'
  let outdatedReason: OutdatedReason | null = null
  let userId: string | null = null
  /** Tăng mỗi lần start/stop để bỏ kết quả của lượt đồng bộ cũ (vd đã đăng xuất). */
  let generation = 0
  let running: Promise<void> | null = null
  let again = false
  let dirty = false
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let unlisten: Array<() => void> = []
  const listeners = new Set<() => void>()

  function setStatus(next: SyncStatus, reason: OutdatedReason | null = null) {
    const nextReason = next === 'outdated' ? reason : null
    if (next === status && nextReason === outdatedReason) return
    status = next
    outdatedReason = nextReason
    listeners.forEach((l) => l())
  }

  function clearTimers() {
    clearTimeout(debounceTimer)
    clearTimeout(retryTimer)
    debounceTimer = retryTimer = undefined
  }

  /** Local do app mới hơn ghi (`read-only`): không kéo, không đẩy. */
  function localIsNewer(): boolean {
    const { store, mode } = target.getSnapshot()
    return mode === 'read-only' || store.schemaVersion > currentVersion
  }

  async function cycle(uid: string, gen: number): Promise<'done' | 'outdated' | 'stale'> {
    for (let attempt = 0; attempt < MAX_CONFLICT_RETRIES; attempt++) {
      const remoteRow = await remote.fetch(uid)
      if (gen !== generation) return 'stale'
      // Gộp với store local ngay lúc này (đồng bộ, không await) để không mất sửa đổi mới.
      const local = target.getSnapshot().store
      const result = mergeWithRemote(local, remoteRow, { currentVersion, migrations: list })
      if (result.kind === 'outdated') return 'outdated'
      if (result.changedLocal) target.replace(result.store)
      if (!result.push) return 'done'
      const row = { schemaVersion: currentVersion, data: pickSynced(result.store.data) }
      const outcome = remoteRow
        ? await remote.update(uid, row, remoteRow.updatedAt)
        : await remote.insert(uid, row)
      if (gen !== generation) return 'stale'
      if (outcome.status === 'ok') return 'done'
      // Máy khác vừa ghi: kéo lại và gộp lần nữa.
    }
    throw new Error('Đồng bộ bị xung đột liên tục')
  }

  function scheduleRetry() {
    clearTimeout(retryTimer)
    retryTimer = setTimeout(() => {
      retryTimer = undefined
      run()
    }, retryMs)
  }

  function run(): Promise<void> {
    const uid = userId
    if (!uid) return Promise.resolve()
    if (localIsNewer()) {
      setStatus('outdated', 'local')
      return Promise.resolve()
    }
    if (!env.isOnline()) {
      // Offline: giữ local, chờ sự kiện `online`.
      setStatus('pending')
      return Promise.resolve()
    }
    if (running) {
      again = true
      return running
    }
    clearTimers()
    const gen = generation
    dirty = false
    setStatus('syncing')
    const job = (async () => {
      try {
        const outcome = await cycle(uid, gen)
        if (gen !== generation) return
        if (outcome === 'outdated') setStatus('outdated', 'server')
        else setStatus(dirty ? 'pending' : 'idle')
      } catch (error) {
        if (gen !== generation) return
        // Lượt này không đẩy được: giữ cờ để flush (xuống nền / trước đăng xuất) thử lại.
        dirty = true
        warn('Đồng bộ lỗi, giữ dữ liệu local và thử lại sau', error)
        setStatus(env.isOnline() ? 'error' : 'pending')
        scheduleRetry()
      } finally {
        if (gen === generation) running = null
      }
      if (gen === generation && again) {
        again = false
        await run()
      }
    })()
    running = job
    return job
  }

  function flush(): Promise<void> {
    if (!userId || status === 'outdated') return Promise.resolve()
    if (running) {
      // Sửa đổi đến sau lúc lượt hiện tại đọc store: chạy thêm một lượt ngay sau đó.
      if (dirty) again = true
      return running
    }
    if (!dirty) return Promise.resolve()
    return run()
  }

  function stop() {
    generation++
    userId = null
    clearTimers()
    unlisten.forEach((u) => u())
    unlisten = []
    running = null
    again = false
    dirty = false
    setStatus('off')
  }

  return {
    getStatus: () => status,
    getOutdatedReason: () => outdatedReason,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    start(uid) {
      if (userId === uid) {
        void run()
        return
      }
      stop()
      userId = uid
      unlisten = [
        env.onOnline(() => void run()),
        env.onVisible(() => void run()),
        // iOS có thể tắt PWA ngay khi xuống nền: đẩy luôn, không chờ debounce.
        env.onHidden(() => void flush()),
      ]
      void run()
    },
    stop,
    notifyLocalChange() {
      if (!userId) return
      dirty = true
      // Đang `outdated`: không ghi đè server, cũng không kéo lại mỗi lần sửa (badge không nhấp nháy).
      if (status === 'outdated') return
      // Đang `error` (vd 401): giữ badge lỗi, không che thành "Chưa đồng bộ".
      if (status !== 'syncing' && status !== 'error') setStatus('pending')
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        debounceTimer = undefined
        void run()
      }, debounceMs)
    },
    syncNow: () => run(),
    flush,
  }
}
