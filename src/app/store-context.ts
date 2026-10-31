import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'

import { saveStore, type LoadedStore, type StorageOptions, type Store } from '@/lib/storage'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'
import type { SyncController, SyncSnapshot } from '@/lib/sync'

/**
 * Store reactive: mọi đọc/ghi dữ liệu học đi qua đây. Local-first: ghi localStorage ngay,
 * lớp đồng bộ (story 2a) nghe `onLocalUpdate` để đẩy lên Supabase và gọi `replace` khi kéo về.
 * `getSnapshot` trả về object mới sau mỗi lần cập nhật để React re-render.
 */
export type StoreHandle = {
  getSnapshot: () => LoadedStore
  subscribe: (listener: () => void) => () => void
  /** Ghi qua `saveStore`; ở `memory`/`read-only` vẫn cập nhật UI nhưng không ghi. Trả về đã ghi được chưa. */
  update: (fn: (store: Store) => Store) => boolean
  /** Thay bằng bản đã gộp từ server: ghi qua `saveStore`, báo UI, không báo `onLocalUpdate`. */
  replace: (store: Store) => void
  /** Nghe các lần người dùng sửa dữ liệu qua `update` (để đồng bộ đẩy lên). */
  onLocalUpdate: (listener: () => void) => () => void
}

export function createStoreHandle(loaded: LoadedStore, opts?: StorageOptions): StoreHandle {
  let snapshot: LoadedStore = { ...loaded }
  const listeners = new Set<() => void>()
  const localListeners = new Set<() => void>()

  function commit(next: Store): boolean {
    const saved = saveStore(loaded, next, opts)
    snapshot = { ...loaded }
    listeners.forEach((l) => l())
    return saved
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    update(fn) {
      const next = fn(loaded.store)
      if (next === loaded.store) return loaded.mode === 'persistent'
      const saved = commit(next)
      localListeners.forEach((l) => l())
      return saved
    },
    replace(next) {
      if (next === loaded.store) return
      commit(next)
    },
    onLocalUpdate(listener) {
      localListeners.add(listener)
      return () => localListeners.delete(listener)
    },
  }
}

export const StoreContext = createContext<StoreHandle | null>(null)

function useStoreHandle(): StoreHandle {
  const handle = useContext(StoreContext)
  if (!handle) throw new Error('useLoadedStore phải nằm trong StoreContext.Provider')
  return handle
}

export function useLoadedStore(): LoadedStore {
  const handle = useStoreHandle()
  return useSyncExternalStore(handle.subscribe, handle.getSnapshot)
}

/** Tiến độ lộ trình: id bài đã xong và hàm đánh dấu / bỏ đánh dấu. */
export function useProgress() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const completedLessonIds = useMemo(() => readCompletedLessonIds(store), [store])
  const setCompleted = useCallback(
    (lessonId: string, done: boolean) => handle.update((s) => setLessonCompleted(s, lessonId, done)),
    [handle],
  )
  return { completedLessonIds, setCompleted }
}

export const SyncContext = createContext<SyncController | null>(null)

/** Trạng thái đồng bộ + phiên đăng nhập và các thao tác đăng nhập/đăng xuất. */
export function useSync(): SyncSnapshot & Omit<SyncController, 'getSnapshot' | 'subscribe'> {
  const sync = useContext(SyncContext)
  if (!sync) throw new Error('useSync phải nằm trong SyncContext.Provider')
  const snapshot = useSyncExternalStore(sync.subscribe, sync.getSnapshot)
  return {
    ...snapshot,
    sendCode: sync.sendCode,
    verifyCode: sync.verifyCode,
    signOut: sync.signOut,
    syncNow: sync.syncNow,
  }
}
