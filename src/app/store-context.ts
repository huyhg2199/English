import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'

import { saveStore, type LoadedStore, type StorageOptions, type Store } from '@/lib/storage'
import {
  applyStartLesson,
  listAttempts,
  readPlacement,
  recordPlacementAttempt,
  setHouse,
  skillGaps,
  weakestForStore,
  type House,
  type PartScores,
} from '@/lib/placement'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'
import { readSavedWords, saveWord, type SavedWordSource } from '@/lib/saved-words'
import {
  newWordListFor,
  readSessionDays,
  recordSession,
  sessionLesson,
  type SessionKind,
} from '@/lib/sessions'
import { gradeCard, markCardKnown, readSrs, type Grade } from '@/lib/srs'
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
  const startLessonId = useMemo(() => readPlacement(store).startLessonId, [store])
  const setCompleted = useCallback(
    (lessonId: string, done: boolean) => handle.update((s) => setLessonCompleted(s, lessonId, done)),
    [handle],
  )
  return { completedLessonIds, startLessonId, setCompleted }
}

/**
 * Mũ Phân Loại (`store.data.placement`): các lần nhập điểm, Nhà, bài bắt đầu và hàm ghi.
 * Lần nhập đầu tiên tự xếp bài bắt đầu; các lần sau chỉ đổi khi gọi `applyPlacement`.
 */
export function usePlacement() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const placement = useMemo(() => readPlacement(store), [store])
  const attempts = useMemo(() => listAttempts(store), [store])
  const saveAttempt = useCallback(
    (parts: PartScores, now: Date = new Date()) =>
      handle.update((s) => recordPlacementAttempt(s, parts, now).store),
    [handle],
  )
  const saveHouse = useCallback((house: House, now: Date = new Date()) => handle.update((s) => setHouse(s, house, now)), [handle])
  const applyPlacement = useCallback(
    (lessonId: string, now: Date = new Date()) => handle.update((s) => applyStartLesson(s, lessonId, now)),
    [handle],
  )
  return { placement, attempts, done: attempts.length > 0, saveAttempt, saveHouse, applyPlacement }
}

/** Bảng 5 kỹ năng và kỹ năng yếu nhất (null khi chưa đội Mũ Phân Loại → không đổi thứ tự đoạn). */
export function useSkillBoard() {
  const { store } = useLoadedStore()
  return useMemo(() => {
    return { board: skillGaps(store), weakest: weakestForStore(store) }
  }, [store])
}

/**
 * Trạng thái SRS flashcard (`store.data.srs`) và hàm chấm thẻ / "Đã biết".
 * Ghi qua `handle.update` nên được lưu local và đồng bộ như tiến độ.
 */
export function useSrs() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const srs = useMemo(() => readSrs(store), [store])
  const grade = useCallback(
    (wordId: string, value: Grade, now: Date = new Date()) => handle.update((s) => gradeCard(s, wordId, value, now)),
    [handle],
  )
  const markKnown = useCallback(
    (wordId: string, now: Date = new Date()) => handle.update((s) => markCardKnown(s, wordId, now)),
    [handle],
  )
  return { srs, grade, markKnown }
}

/**
 * Nhật ký buổi học (`store.data.sessions.days`), bài của buổi và hàm ghi buổi đã xong.
 * Buổi chuẩn ưu tiên hơn buổi lười khi cùng ngày (xem `recordSession`).
 */
export function useSessions() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const days = useMemo(() => readSessionDays(store), [store])
  const current = useMemo(() => sessionLesson(store), [store])
  const record = useCallback(
    (kind: SessionKind, now: Date = new Date(), extra: { lessonId?: string | null } = {}) =>
      handle.update((s) => recordSession(s, kind, now, extra)),
    [handle],
  )
  return { days, current, record }
}

/** Danh sách lấy từ mới trước theo chặng của bài hiện tại (chặng 1: NGSL, chặng 2+: TSL). */
export function useNewWordList() {
  const { store } = useLoadedStore()
  return useMemo(() => newWordListFor(store), [store])
}

/** Từ đã lưu (`store.data.savedWords.items`) và hàm lưu từ kèm câu gốc + nguồn. */
export function useSavedWords() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const items = useMemo(() => readSavedWords(store), [store])
  const save = useCallback(
    (input: { word: string; sentence: string; source: SavedWordSource }, now: Date = new Date()) =>
      handle.update((s) => saveWord(s, input, now)),
    [handle],
  )
  return { items, save }
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
