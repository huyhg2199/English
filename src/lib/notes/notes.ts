import { filterSaved, type SavedEntry } from '@/lib/saved-words'
import { isPlainObject, type Store } from '@/lib/storage'
import { foldText } from '@/lib/text-fold'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Ghi chú kiến thức (story 8, CAP-18): `store.data.notes.items[id]`, theo mẫu của lộ trình
 * "quy tắc / lỗi sai / câu ví dụ" (ô nào cũng không bắt buộc, cần ít nhất một ô có chữ), có thể gắn với một bài.
 * Xoá là ghi dấu `deleted: true` + `updatedAt` (đồng bộ không làm sống lại). Hàm thuần: thời gian lấy từ `now`.
 */

export type Note = {
  rule: string
  mistake: string
  example: string
  /** Bài gắn với ghi chú (tạo từ trang bài); null khi ghi chú tự do. */
  lessonId: string | null
  createdAt: string
  updatedAt: string
  deleted?: boolean
}

export type NoteEntry = Note & { id: string }

export type NoteInput = { rule: string; mistake: string; example: string; lessonId?: string | null }

export type NoteResult = { ok: true; store: Store } | { ok: false; reason: 'empty' | 'missing' }

/** Mỗi ô dài tối đa bấy nhiêu ký tự (chặn dán nhầm cả trang). */
export const MAX_NOTE_FIELD = 2000

export const NOTE_FIELDS = ['rule', 'mistake', 'example'] as const

export function isNote(value: unknown): value is Note {
  if (!isPlainObject(value)) return false
  const { rule, mistake, example, lessonId, createdAt, updatedAt, deleted } = value
  return (
    typeof rule === 'string' &&
    typeof mistake === 'string' &&
    typeof example === 'string' &&
    (lessonId === null || typeof lessonId === 'string') &&
    isTimeString(createdAt) &&
    isTimeString(updatedAt) &&
    (deleted === undefined || typeof deleted === 'boolean')
  )
}

function isLive(value: unknown): value is Note {
  return isNote(value) && value.deleted !== true
}

/** Đọc `notes.items`; thiếu hoặc sai dạng thì coi như rỗng. */
export function readNotes(store: Store): Record<string, unknown> {
  const notes = store.data.notes
  return isPlainObject(notes) && isPlainObject(notes.items) ? notes.items : {}
}

/** Id ghi chú: thời điểm tạo + phần ngẫu nhiên (truyền vào để hàm thuần). */
export function noteId(now: Date, random: string): string {
  return `${now.getTime().toString(36)}-${random.replace(/[^a-z0-9]/gi, '').slice(0, 8) || '0'}`
}

function clean(input: NoteInput): Pick<Note, 'rule' | 'mistake' | 'example'> {
  const field = (s: string) => (typeof s === 'string' ? s.trim().slice(0, MAX_NOTE_FIELD) : '')
  return { rule: field(input.rule), mistake: field(input.mistake), example: field(input.example) }
}

/** Ghi chú có ít nhất một ô có chữ. */
export function isNoteFilled(input: NoteInput): boolean {
  const c = clean(input)
  return NOTE_FIELDS.some((f) => c[f] !== '')
}

function writeNote(store: Store, id: string, note: Note): Store {
  const notes = isPlainObject(store.data.notes) ? store.data.notes : {}
  return { ...store, data: { ...store.data, notes: { ...notes, items: { ...readNotes(store), [id]: note } } } }
}

/** Tạo ghi chú. 3 ô trống → `empty`, không lưu. */
export function createNote(store: Store, id: string, input: NoteInput, now: Date): NoteResult {
  if (!isNoteFilled(input)) return { ok: false, reason: 'empty' }
  const previous = readNotes(store)[id]
  const note: Note = {
    ...clean(input),
    lessonId: input.lessonId ?? null,
    createdAt: now.toISOString(),
    updatedAt: nextUpdatedAt(isPlainObject(previous) ? previous.updatedAt : undefined, now),
  }
  return { ok: true, store: writeNote(store, id, note) }
}

/** Sửa 3 ô của ghi chú (giữ bài gắn và ngày tạo). Không có / đã xoá → `missing`; 3 ô trống → `empty`. */
export function updateNote(store: Store, id: string, input: NoteInput, now: Date): NoteResult {
  const current = readNotes(store)[id]
  if (!isLive(current)) return { ok: false, reason: 'missing' }
  if (!isNoteFilled(input)) return { ok: false, reason: 'empty' }
  const fields = clean(input)
  if (NOTE_FIELDS.every((f) => fields[f] === current[f])) return { ok: true, store }
  return { ok: true, store: writeNote(store, id, { ...current, ...fields, updatedAt: nextUpdatedAt(current.updatedAt, now) }) }
}

/** Xoá: ghi dấu `deleted` + `updatedAt` mới. Không có / đã xoá → trả về đúng store cũ. */
export function deleteNote(store: Store, id: string, now: Date): Store {
  const current = readNotes(store)[id]
  if (!isLive(current)) return store
  return writeNote(store, id, { ...current, deleted: true, updatedAt: nextUpdatedAt(current.updatedAt, now) })
}

/** Ghi chú hợp lệ chưa xoá, mới tạo trước. */
export function listNotes(items: Record<string, unknown>): NoteEntry[] {
  return Object.entries(items)
    .filter((e): e is [string, Note] => isLive(e[1]))
    .map(([id, n]) => ({ ...n, id }))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0))
}

/** Lọc ghi chú theo chữ (không phân biệt hoa thường, dấu) trong 3 ô. */
export function filterNotes(notes: readonly NoteEntry[], query: string): NoteEntry[] {
  const q = foldText(query)
  if (!q) return [...notes]
  return notes.filter((n) => NOTE_FIELDS.some((f) => foldText(n[f]).includes(q)))
}

/** Lọc cả Sổ tay theo chữ: mục đã lưu và ghi chú. */
export function filterNotebook(
  query: string,
  data: { saved: readonly SavedEntry[]; notes: readonly NoteEntry[] },
): { saved: SavedEntry[]; notes: NoteEntry[] } {
  return { saved: filterSaved(data.saved, query), notes: filterNotes(data.notes, query) }
}
