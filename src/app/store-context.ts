import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'

import { createBackup, restoreBackup, type Backup } from '@/lib/backup'
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
import {
  applyRecognition,
  readPronunciation,
  recordAttempt as recordPronunciationAttempt,
  type SpeakOutcome,
} from '@/lib/pronunciation'
import { QUESTION_BANK } from '@/data/questions'
import { COMEBACK_QUIZ_ID, pendingComeback, pickComebackTest, skipComeback } from '@/lib/comeback'
import { canSpeak } from '@/lib/speech'
import { planFor } from '@/lib/schedule'
import {
  attemptId,
  listGradedAttempts,
  readMistakes,
  recordAttempt,
  reviewMistake,
  setMistakeExplanation,
  type AttemptInput,
} from '@/lib/quiz'
import type { RecognitionResult } from '@/lib/speech-recognition'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'
import { createNote, deleteNote, noteId, readNotes, updateNote, type NoteInput } from '@/lib/notes'
import {
  addToSrs,
  deleteSavedWord,
  readSavedWords,
  saveWord,
  type AddToSrsResult,
  type SavedWordSource,
} from '@/lib/saved-words'
import type { StudyWord } from '@/data/vocab'
import {
  newWordListFor,
  readSessionDays,
  recordSession,
  sessionLesson,
  type SessionKind,
} from '@/lib/sessions'
import { unlockedSpells } from '@/lib/spells'
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

/**
 * Từ/cụm đã lưu (`store.data.savedWords.items`): lưu kèm câu gốc + nguồn, xoá (dấu xoá) và
 * "Thêm vào flashcard" (từ trong NGSL/TSL → thẻ sẵn có; cụm ngoài danh sách → thẻ riêng, cần nghĩa).
 */
export function useSavedWords() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const items = useMemo(() => readSavedWords(store), [store])
  const save = useCallback(
    (input: { word: string; sentence: string; source: SavedWordSource }, now: Date = new Date()) =>
      handle.update((s) => saveWord(s, input, now)),
    [handle],
  )
  const remove = useCallback((id: string, now: Date = new Date()) => handle.update((s) => deleteSavedWord(s, id, now)), [handle])
  const addToFlashcards = useCallback(
    (id: string, opts: { vocab?: StudyWord; meaningVi?: string }, now: Date = new Date()) => {
      let result: AddToSrsResult = { ok: false, reason: 'missing' }
      handle.update((s) => {
        result = addToSrs(s, id, opts, now)
        return result.ok ? result.store : s
      })
      return result
    },
    [handle],
  )
  return { items, save, remove, addToFlashcards }
}

function randomPart(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

/** Ghi chú kiến thức (`store.data.notes.items`): tạo / sửa / xoá (dấu xoá). Trả về lý do khi không lưu. */
export function useNotes() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const items = useMemo(() => readNotes(store), [store])
  const run = useCallback(
    (fn: (s: Store) => ReturnType<typeof createNote>) => {
      let reason: 'empty' | 'missing' | null = null
      handle.update((s) => {
        const r = fn(s)
        if (r.ok) return r.store
        reason = r.reason
        return s
      })
      return reason
    },
    [handle],
  )
  const create = useCallback(
    (input: NoteInput, now: Date = new Date()) => run((s) => createNote(s, noteId(now, randomPart()), input, now)),
    [run],
  )
  const edit = useCallback((id: string, input: NoteInput, now: Date = new Date()) => run((s) => updateNote(s, id, input, now)), [run])
  const remove = useCallback((id: string, now: Date = new Date()) => handle.update((s) => deleteNote(s, id, now)), [handle])
  return { items, create, edit, remove }
}

/**
 * Điểm luyện nói (`store.data.pronunciation.items`) và hàm áp một kết quả nhận giọng nói
 * (thành công thì lưu điểm tốt nhất và đồng bộ; lỗi / huỷ / không hỗ trợ thì không ghi gì).
 */
export function usePronunciation() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const items = useMemo(() => readPronunciation(store), [store])
  const apply = useCallback(
    (sentence: { id: string; text: string }, result: RecognitionResult, now: Date = new Date()): SpeakOutcome => {
      let outcome: SpeakOutcome = { kind: 'aborted' }
      handle.update((s) => {
        const applied = applyRecognition(s, sentence, result, now)
        outcome = applied.outcome
        return applied.store
      })
      return outcome
    },
    [handle],
  )
  /** Ghi điểm chép chính tả (story 10): dùng chung `pronunciation` như luyện nói, best = max. */
  const record = useCallback(
    (id: string, score: number, now: Date = new Date()) => handle.update((s) => recordPronunciationAttempt(s, id, score, now)),
    [handle],
  )
  return { items, apply, record }
}

/**
 * Sao lưu / khôi phục (story 7). `exportBackup` dựng file từ store hiện tại (chỉ key allowlist).
 * `restore` gộp file vào store qua `handle.update` (nên đồng bộ tự đẩy lên); `saved` = đã ghi được localStorage chưa.
 */
export function useBackup() {
  const handle = useStoreHandle()
  const exportBackup = useCallback((now: Date = new Date()) => createBackup(handle.getSnapshot().store, now), [handle])
  const restore = useCallback(
    (backup: Backup) => {
      let counts = { added: 0, updated: 0 }
      const saved = handle.update((s) => {
        const r = restoreBackup(s, backup)
        counts = { added: r.added, updated: r.updated }
        return r.store
      })
      return { ...counts, saved }
    },
    [handle],
  )
  return { exportBackup, restore }
}

/** Lần làm test có chấm điểm (`store.data.quizzes.attempts`, bỏ lần "Để sau") và hàm ghi một lần làm xong (đẩy câu sai vào Sổ lỗi). */
export function useQuizzes() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const attempts = useMemo(() => listGradedAttempts(store), [store])
  const record = useCallback(
    (input: AttemptInput, now: Date = new Date()) => handle.update((s) => recordAttempt(s, input, now)),
    [handle],
  )
  return { attempts, record }
}

/** Lịch gốc, số tuần trễ và ngày dự kiến đạt 750 (story 11) tại thời điểm `now`. */
export function useSchedule(now: Date) {
  const { store } = useLoadedStore()
  return useMemo(() => planFor(store, now), [store, now])
}

/**
 * Test quay lại sau nghỉ (story 11): đợt nghỉ đang chờ (null khi không cần), số câu dựng được cho test
 * (0 → không mời) và "Để sau" (ghi một lần làm `comeback` rỗng có cờ `skipped`, đồng bộ được).
 * `skip` chỉ ghi khi đợt nghỉ còn đang chờ, nên bấm hai lần không ghi hai lần.
 */
export function useComeback(now: Date) {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const pending = useMemo(() => pendingComeback(store, now), [store, now])
  const questionCount = useMemo(
    () => (pending ? pickComebackTest(store, QUESTION_BANK, 'probe', { canSpeak: canSpeak() }).length : 0),
    [store, pending],
  )
  const skip = useCallback(
    () =>
      handle.update((s) =>
        pendingComeback(s, now) ? skipComeback(s, attemptId(COMEBACK_QUIZ_ID, now, randomPart()), now) : s,
      ),
    [handle, now],
  )
  return { pending, questionCount, skip }
}

/** Sổ lỗi sai của Snape (`store.data.mistakes.items`): ôn một câu, lưu lời giải thích "Vì sao sai?". */
export function useMistakes() {
  const handle = useStoreHandle()
  const { store } = useLoadedStore()
  const items = useMemo(() => readMistakes(store), [store])
  const review = useCallback(
    (id: string, correct: boolean, chosen: string, now: Date = new Date()) =>
      handle.update((s) => reviewMistake(s, id, correct, chosen, now)),
    [handle],
  )
  const saveExplanation = useCallback(
    (id: string, text: string, model: string, chosen: string, now: Date = new Date()) =>
      handle.update((s) => setMistakeExplanation(s, id, text, model, chosen, now)),
    [handle],
  )
  return { items, review, saveExplanation }
}

/** Thần chú đã mở khoá (theo tiến độ bài, không có key riêng). */
export function useSpells() {
  const { store } = useLoadedStore()
  return useMemo(() => unlockedSpells(store), [store])
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
