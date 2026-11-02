import { hasDetails, type StudyWord, type Word } from '@/data/vocab'
import { localDayKey } from '@/lib/sessions'
import { addCard, isSrsCard, type CustomStudyWord } from '@/lib/srs'
import { isPlainObject, type Store } from '@/lib/storage'
import { foldText } from '@/lib/text-fold'

import { splitSentences } from './tokenize'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Từ đã lưu (story 4, ngày lười): `store.data.savedWords.items[id]`, kèm câu chứa nó và nguồn.
 * Story 8 (Sổ tay): lưu cả cụm/câu (bôi đen), thêm field tuỳ chọn `meaningVi`, `inSrs`, `deleted`; id cũ giữ nguyên.
 * Hàm thuần: thời gian lấy từ tham số `now`.
 */

export type SavedWordSource = { title: string; url: string }

export type SavedWord = {
  /** Từ/cụm đã chuẩn hoá (chữ thường, `'` thẳng, khoảng trắng gọn). */
  word: string
  /** Câu gốc chứa từ. */
  sentence: string
  source: SavedWordSource
  savedAt: string
  updatedAt: string
  /** Nghĩa Việt Huy nhập khi đưa cụm ngoài NGSL/TSL vào flashcard (thẻ riêng `saved-<id>`). */
  meaningVi?: string
  /** Đã bấm "Thêm vào flashcard". */
  inSrs?: boolean
  /** Đã xoá (dấu xoá + `updatedAt` để đồng bộ không làm sống lại). */
  deleted?: boolean
}

/** Mục lưu kèm id (cho danh sách Sổ tay). */
export type SavedEntry = SavedWord & { id: string }

/** Bôi đen dài hơn thế thì báo quá dài. */
export const MAX_PHRASE_LENGTH = 200

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
    isTimeString(updatedAt) &&
    (value.meaningVi === undefined || typeof value.meaningVi === 'string') &&
    (value.inSrs === undefined || typeof value.inSrs === 'boolean') &&
    (value.deleted === undefined || typeof value.deleted === 'boolean')
  )
}

function isLive(value: unknown): value is SavedWord {
  return isSavedWord(value) && value.deleted !== true
}

/** Chuẩn hoá từ/cụm: chữ thường, `’` → `'`, gộp khoảng trắng, bỏ dấu câu ở hai đầu. */
export function normalizeWord(word: string): string {
  return word
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
}

export type SelectionCheck = { ok: true; phrase: string } | { ok: false; reason: 'empty' | 'too-long' }

/** Kiểm vùng bôi đen trước khi lưu: rỗng (không có chữ) hoặc dài quá `MAX_PHRASE_LENGTH` ký tự. */
export function checkSelection(text: string): SelectionCheck {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length > MAX_PHRASE_LENGTH) return { ok: false, reason: 'too-long' }
  const phrase = normalizeWord(clean)
  return phrase ? { ok: true, phrase } : { ok: false, reason: 'empty' }
}

/**
 * Câu gốc cho một vùng bôi đen trong `text`: câu đầu tiên chứa vùng chọn (không phân biệt hoa thường).
 * Vùng chọn vắt qua nhiều câu (không câu nào chứa trọn) thì trả về chính vùng chọn.
 */
export function sentenceFor(text: string, selection: string): string {
  const sel = selection.replace(/\s+/g, ' ').trim()
  const needle = sel.toLowerCase()
  if (!needle) return ''
  return splitSentences(text).find((s) => s.toLowerCase().includes(needle)) ?? sel
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

/** Từ hợp lệ (chưa xoá) đã lưu trong ngày (giờ máy) của `now`, theo thứ tự lưu. `items` = `readSavedWords(store)`. */
export function savedWordsOn(items: Record<string, unknown>, now: Date): SavedWord[] {
  const prefix = `${localDayKey(now)}:`
  return Object.entries(items)
    .filter((e): e is [string, SavedWord] => e[0].startsWith(prefix) && isLive(e[1]))
    .map(([, w]) => w)
    .sort((a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt))
}

/**
 * Lưu một từ/cụm kèm câu gốc và nguồn. Đã lưu từ này hôm nay (mục hợp lệ, chưa xoá) thì trả về đúng store cũ;
 * mục đã xoá thì lưu lại thành mục mới (bỏ dấu xoá).
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
  if (isLive(current)) return store
  const entry: SavedWord = {
    word,
    sentence: input.sentence.trim(),
    source: { title: input.source.title, url: input.source.url },
    savedAt: now.toISOString(),
    updatedAt: nextUpdatedAt(isPlainObject(current) ? current.updatedAt : undefined, now),
  }
  return writeItem(store, id, entry)
}

function writeItem(store: Store, id: string, entry: SavedWord): Store {
  const savedWords = isPlainObject(store.data.savedWords) ? store.data.savedWords : {}
  const items = readSavedWords(store)
  return { ...store, data: { ...store.data, savedWords: { ...savedWords, items: { ...items, [id]: entry } } } }
}

/**
 * Xoá một mục: ghi `deleted: true` + `updatedAt` mới (không xoá khỏi map để đồng bộ không làm sống lại).
 * Lịch SRS trong `srs.cards` giữ nguyên. Mục không có / sai dạng / đã xoá → trả về đúng store cũ.
 */
export function deleteSavedWord(store: Store, id: string, now: Date): Store {
  const current = readSavedWords(store)[id]
  if (!isLive(current)) return store
  return writeItem(store, id, { ...current, deleted: true, updatedAt: nextUpdatedAt(current.updatedAt, now) })
}

/** Mục hợp lệ chưa xoá, mới lưu trước. */
export function listSaved(items: Record<string, unknown>): SavedEntry[] {
  return Object.entries(items)
    .filter((e): e is [string, SavedWord] => isLive(e[1]))
    .map(([id, w]) => ({ ...w, id }))
    .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

/** Nhóm theo ngày lưu (giờ máy), giữ thứ tự của `entries` (mới nhất trước khi đầu vào từ `listSaved`). */
export function groupSavedByDay(entries: readonly SavedEntry[]): { day: string; entries: SavedEntry[] }[] {
  const groups: { day: string; entries: SavedEntry[] }[] = []
  for (const entry of entries) {
    const day = localDayKey(new Date(entry.savedAt))
    const last = groups[groups.length - 1]
    if (last && last.day === day) last.entries.push(entry)
    else groups.push({ day, entries: [entry] })
  }
  return groups
}

/** Lọc theo chữ (không phân biệt hoa thường, dấu): từ/cụm, câu gốc, nghĩa hoặc tiêu đề nguồn chứa `query`. */
export function filterSaved(entries: readonly SavedEntry[], query: string): SavedEntry[] {
  const q = foldText(query)
  if (!q) return [...entries]
  return entries.filter((e) => [e.word, e.sentence, e.meaningVi ?? '', e.source.title].some((t) => foldText(t).includes(q)))
}

/** Id thẻ riêng của một mục lưu. */
export function savedCardId(id: string): string {
  return `saved-${id}`
}

/** Tra từ/cụm (đã chuẩn hoá) trong NGSL/TSL có dữ liệu AI; có ở cả hai thì lấy NGSL. */
export function findVocabWord(words: readonly Word[], phrase: string): StudyWord | undefined {
  const key = normalizeWord(phrase)
  let found: StudyWord | undefined
  for (const w of words) {
    if (w.word.toLowerCase() !== key || !hasDetails(w)) continue
    if (w.list === 'ngsl') return w
    found ??= w
  }
  return found
}

export type AddToSrsResult =
  | { ok: true; store: Store; cardId: string }
  | { ok: false; reason: 'missing' | 'need-meaning' }

/**
 * "Thêm vào flashcard" cho một mục đã lưu.
 * - `vocab` (từ có trong NGSL/TSL, tra bằng `findVocabWord`): thẻ của từ đó vào ôn ngay (thẻ `added`, không tính quota);
 *   đã có lịch thì không đổi lịch. Mặt sau hiện câu gốc (xem `originsByWord`).
 * - Không có trong danh sách: cần `meaningVi` (Huy nhập, bắt buộc) → thẻ riêng `saved-<id>`.
 * Mục không có / đã xoá → `missing`. Không gọi AI, không tự tạo nghĩa.
 */
export function addToSrs(
  store: Store,
  id: string,
  opts: { vocab?: StudyWord; meaningVi?: string },
  now: Date,
): AddToSrsResult {
  const current = readSavedWords(store)[id]
  if (!isLive(current)) return { ok: false, reason: 'missing' }
  let cardId: string
  let entry: SavedWord
  if (opts.vocab) {
    cardId = opts.vocab.id
    entry = { ...current, inSrs: true }
  } else {
    // Cùng cụm đã có thẻ riêng ở mục khác (vd lưu ở hai ngày): dùng lại thẻ đó, không tạo thẻ thứ hai.
    const sibling = listSaved(readSavedWords(store)).find(
      (e) => e.id !== id && e.word === current.word && e.inSrs === true && !!e.meaningVi?.trim(),
    )
    const meaning =
      (opts.meaningVi ?? '').replace(/\s+/g, ' ').trim() || current.meaningVi?.trim() || sibling?.meaningVi?.trim() || ''
    if (!meaning) return { ok: false, reason: 'need-meaning' }
    cardId = savedCardId(sibling ? sibling.id : id)
    entry = { ...current, inSrs: true, meaningVi: meaning }
  }
  const changed = entry.inSrs !== current.inSrs || entry.meaningVi !== current.meaningVi
  const next = changed ? writeItem(store, id, { ...entry, updatedAt: nextUpdatedAt(current.updatedAt, now) }) : store
  return { ok: true, store: addCard(next, cardId, now), cardId }
}

/**
 * Thẻ riêng cho phiên ôn: mục chưa xoá, đã thêm vào flashcard và có nghĩa Huy nhập. Một cụm chỉ một thẻ:
 * nhiều mục cùng cụm thì lấy mục đã có thẻ hợp lệ trong `cards` (nếu truyền), không thì mục lưu sớm nhất.
 */
export function customStudyWords(items: Record<string, unknown>, cards: Record<string, unknown> = {}): CustomStudyWord[] {
  const chosen = new Map<string, SavedEntry>()
  const candidates = listSaved(items)
    .filter((e) => e.inSrs === true && typeof e.meaningVi === 'string' && e.meaningVi.trim() !== '')
    .reverse() // sớm nhất trước
  for (const e of candidates) {
    const prev = chosen.get(e.word)
    if (!prev || (!isSrsCard(cards[savedCardId(prev.id)]) && isSrsCard(cards[savedCardId(e.id)]))) chosen.set(e.word, e)
  }
  return [...chosen.values()]
    .map((e) => ({
      id: savedCardId(e.id),
      custom: true as const,
      word: e.word,
      meaningVi: e.meaningVi!.trim(),
      sentence: e.sentence,
      source: e.source,
    }))
}

export type SourceHref = { kind: 'internal'; to: string } | { kind: 'external'; href: string } | null

/**
 * Link an toàn cho nguồn (dữ liệu đồng bộ / khôi phục không tin được): chỉ `http(s)://` hoặc đường dẫn trong app
 * bắt đầu bằng đúng một `/`. Còn lại (`javascript:`, `data:`, `//host`…) → null, hiện chữ thường.
 */
export function safeSourceHref(url: string): SourceHref {
  if (typeof url !== 'string') return null
  const u = url.trim()
  if (/^\/(?![/\\])/.test(u)) return { kind: 'internal', to: u }
  if (/^https?:\/\/[^\s]/i.test(u)) return { kind: 'external', href: u }
  return null
}

export type Origin = { sentence: string; source: SavedWordSource }

/** "Câu gốc của bạn" theo từ: mục chưa xoá đã thêm vào flashcard, không có nghĩa riêng (là từ trong danh sách). */
export function originsByWord(items: Record<string, unknown>): Map<string, Origin[]> {
  const out = new Map<string, Origin[]>()
  for (const e of listSaved(items)) {
    if (e.inSrs !== true || e.meaningVi || !e.sentence) continue
    const list = out.get(e.word) ?? []
    if (!list.some((o) => o.sentence === e.sentence)) list.push({ sentence: e.sentence, source: e.source })
    out.set(e.word, list)
  }
  return out
}
