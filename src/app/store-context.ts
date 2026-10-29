import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'

import { saveStore, type LoadedStore, type StorageOptions, type Store } from '@/lib/storage'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'

/**
 * Store reactive: mọi đọc/ghi dữ liệu học đi qua đây (story 2a sẽ thay backend ở một chỗ).
 * `getSnapshot` trả về object mới sau mỗi lần cập nhật để React re-render.
 */
export type StoreHandle = {
  getSnapshot: () => LoadedStore
  subscribe: (listener: () => void) => () => void
  /** Ghi qua `saveStore`; ở `memory`/`read-only` vẫn cập nhật UI nhưng không ghi. Trả về đã ghi được chưa. */
  update: (fn: (store: Store) => Store) => boolean
}

export function createStoreHandle(loaded: LoadedStore, opts?: StorageOptions): StoreHandle {
  let snapshot: LoadedStore = { ...loaded }
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    update(fn) {
      const next = fn(loaded.store)
      if (next === loaded.store) return loaded.mode === 'persistent'
      const saved = saveStore(loaded, next, opts)
      snapshot = { ...loaded }
      listeners.forEach((l) => l())
      return saved
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
