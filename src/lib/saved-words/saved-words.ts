import { localDayKey } from '@/lib/sessions'
import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Từ đã lưu (story 4, ngày lười): `store.data.savedWords.items[id]`, kèm câu chứa nó và nguồn.
 * Story 8 (Sổ tay) dùng tiếp. Hàm thuần: thời gian lấy từ tham số `now`.
 */

export type SavedWordSource = { title: string; url: string }

export type SavedWord = {
  /** Từ đã chuẩn hoá (chữ thường, `'` thẳng). */
  word: string
  /** Câu gốc chứa từ. */
  sentence: string
  source: SavedWordSource
  savedAt: string
  updatedAt: string
}

export function isSavedWord(value: unknown): value is SavedWord {
  if (!isPlainObject(value)) return false
  const { word, sentence, source, savedAt, updatedAt } = value
  return (
    typeof word === 'string' &&
    word.length > 0 &&
    typeof sentence === 'string' &&
    isPlainObject(source) &&
    typeof source.title === 'string' &&
    typeof source.url === 'string' &&
    isTimeString(savedAt) &&
    isTimeString(updatedAt)
  )
}

/** Chuẩn hoá từ: chữ thường, `’` → `'`, bỏ dấu câu ở hai đầu. */
export function normalizeWord(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
}

/** Id ổn định theo ngày (giờ máy) + từ chuẩn hoá: lưu lại cùng từ trong ngày không tạo bản trùng. */
export function savedWordId(word: string, now: Date): string {
  return `${localDayKey(now)}:${normalizeWord(word)}`
}

/** Đọc `savedWords.items`; thiếu hoặc sai dạng thì coi như rỗng. */
export function readSavedWords(store: Store): Record<string, unknown> {
  const saved = store.data.savedWords
  return isPlainObject(saved) && isPlainObject(saved.items) ? saved.items : {}
}

/** Từ hợp lệ đã lưu trong ngày (giờ máy) của `now`, theo thứ tự lưu. `items` = `readSavedWords(store)`. */
export function savedWordsOn(items: Record<string, unknown>, now: Date): SavedWord[] {
  const prefix = `${localDayKey(now)}:`
  return Object.entries(items)
    .filter((e): e is [string, SavedWord] => e[0].startsWith(prefix) && isSavedWord(e[1]))
    .map(([, w]) => w)
    .sort((a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt))
}

/**
 * Lưu một từ kèm câu gốc và nguồn. Đã lưu từ này hôm nay (mục hợp lệ) thì trả về đúng store cũ.
 * Từ rỗng sau chuẩn hoá cũng trả về store cũ. Giữ nguyên mục khác (kể cả sai dạng) và field khác.
 */
export function saveWord(
  store: Store,
  input: { word: string; sentence: string; source: SavedWordSource },
  now: Date,
): Store {
  const word = normalizeWord(input.word)
  if (!word) return store
  const id = savedWordId(word, now)
  const items = readSavedWords(store)
  const current = items[id]
  if (isSavedWord(current)) return store
  const entry: SavedWord = {
    word,
    sentence: input.sentence.trim(),
    source: { title: input.source.title, url: input.source.url },
    savedAt: now.toISOString(),
    updatedAt: nextUpdatedAt(isPlainObject(current) ? current.updatedAt : undefined, now),
  }
  const savedWords = isPlainObject(store.data.savedWords) ? store.data.savedWords : {}
  return { ...store, data: { ...store.data, savedWords: { ...savedWords, items: { ...items, [id]: entry } } } }
}
