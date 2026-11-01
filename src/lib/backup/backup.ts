import { isPlacementAttempt } from '@/lib/placement/store'
import { isPronunciationItem } from '@/lib/pronunciation'
import { isLessonProgress, readCompletedLessonIds } from '@/lib/roadmap-progress'
import { isSavedWord, readSavedWords } from '@/lib/saved-words'
import { isSessionDay, readSessionDays } from '@/lib/sessions'
import { isSrsCard, readCards } from '@/lib/srs'
import { CURRENT_VERSION, isPlainObject, migrations as defaultMigrations, runMigrations } from '@/lib/storage'
import type { Migrations, Store } from '@/lib/storage'
import { deepEqual, mergeData, SYNCED_KEYS } from '@/lib/sync/merge'
import { isTimeString } from '@/lib/updated-at'

/**
 * Key của `store.data` được ghi vào file sao lưu. Cùng định nghĩa "dữ liệu học" với đồng bộ (`SYNCED_KEYS`),
 * nên không bao giờ có API key / PAT / token. Muốn thêm key thì thêm vào `SYNCED_KEYS`.
 */
export const BACKUP_KEYS = SYNCED_KEYS
export type BackupKey = (typeof BACKUP_KEYS)[number]

export const BACKUP_APP = 'lumos-english'
export const BACKUP_KIND = 'backup'
/** File lớn hơn thế bị từ chối (dữ liệu học thật chỉ vài trăm KB). */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024
export const TOO_LARGE_MESSAGE = `File quá lớn (hơn ${MAX_BACKUP_BYTES / 1024 / 1024} MB), không phải bản sao lưu của app.`

export type Backup = {
  app: typeof BACKUP_APP
  kind: typeof BACKUP_KIND
  schemaVersion: number
  exportedAt: string
  data: Record<string, unknown>
}

export type ParseResult = { ok: true; backup: Backup } | { ok: false; message: string }

export type RestoreResult = {
  /** Store sau khi gộp (chính `store` cũ nếu không có gì đổi). */
  store: Store
  /** Số mục chỉ có trong file, được thêm vào máy. */
  added: number
  /** Số mục máy đã có nhưng bản trong file mới hơn nên được cập nhật. */
  updated: number
}

export type BackupSummary = {
  exportedAt: string
  lessonsDone: number
  cards: number
  studyDays: number
  savedWords: number
  placementAttempts: number
  pronunciationItems: number
}

/** Lấy phần allowlist của `data`; key ngoài allowlist (vd `geminiApiKey`, `token`) bị bỏ. */
export function pickBackup(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of BACKUP_KEYS) {
    if (Object.hasOwn(data, key) && data[key] !== undefined) out[key] = structuredClone(data[key])
  }
  return out
}

/** Dựng file sao lưu từ store: chỉ key trong allowlist. */
export function createBackup(store: Store, now: Date): Backup {
  return {
    app: BACKUP_APP,
    kind: BACKUP_KIND,
    schemaVersion: store.schemaVersion,
    exportedAt: now.toISOString(),
    data: pickBackup(store.data),
  }
}

/** `lumos-english-backup-YYYY-MM-DD.json` theo ngày giờ máy. */
export function backupFileName(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `lumos-english-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup, null, 2)
}

/** Map gộp theo mục của từng key (để làm sạch file và đếm số mục thêm / cập nhật). */
const ENTRY_FIELD: Record<BackupKey, string> = {
  progress: 'lessons',
  srs: 'cards',
  sessions: 'days',
  savedWords: 'items',
  placement: 'attempts',
  pronunciation: 'items',
}

const ENTRY_VALID: Record<BackupKey, (value: unknown) => boolean> = {
  progress: isLessonProgress,
  srs: isSrsCard,
  sessions: isSessionDay,
  savedWords: isSavedWord,
  placement: isPlacementAttempt,
  pronunciation: isPronunciationItem,
}

/** Id có thể làm hỏng object khi gán (prototype pollution). */
const UNSAFE_IDS = new Set(['__proto__', 'constructor', 'prototype'])

function safeEntries(obj: Record<string, unknown>, keep: (value: unknown) => boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [id, value] of Object.entries(obj)) {
    if (!UNSAFE_IDS.has(id) && keep(value)) out[id] = value
  }
  return out
}

/**
 * Làm sạch dữ liệu từ file (không tin được): bỏ key allowlist không phải object, bỏ mục sai dạng trong map
 * của từng key và bỏ id nguy hiểm (`__proto__`, `constructor`, `prototype`).
 */
export function sanitizeBackupData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of BACKUP_KEYS) {
    const value = data[key]
    if (!isPlainObject(value)) continue
    const field = ENTRY_FIELD[key]
    const clean = safeEntries(value, (v) => v !== undefined)
    clean[field] = isPlainObject(value[field]) ? safeEntries(value[field], ENTRY_VALID[key]) : {}
    out[key] = clean
  }
  return out
}

const NOT_BACKUP = 'File này không phải bản sao lưu của Lumos English.'

/**
 * Kiểm file sao lưu. File cũ hơn app thì migrate lên version hiện tại; file mới hơn app thì từ chối.
 * Chỉ giữ key trong allowlist. Không bao giờ ném lỗi.
 */
export function parseBackup(
  text: string,
  opts: { currentVersion?: number; migrations?: Migrations } = {},
): ParseResult {
  const target = opts.currentVersion ?? CURRENT_VERSION
  if (typeof text !== 'string' || text.trim() === '') return { ok: false, message: 'File trống.' }
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) {
    return { ok: false, message: TOO_LARGE_MESSAGE }
  }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, message: 'File hỏng: không đọc được nội dung JSON.' }
  }
  if (!isPlainObject(raw) || raw.app !== BACKUP_APP || raw.kind !== BACKUP_KIND) return { ok: false, message: NOT_BACKUP }
  const v = raw.schemaVersion
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || !isPlainObject(raw.data) || !isTimeString(raw.exportedAt)) {
    return { ok: false, message: 'File sao lưu sai cấu trúc, không khôi phục được.' }
  }
  if (v > target) {
    return {
      ok: false,
      message: 'File được tạo bởi bản app mới hơn. Hãy cập nhật app (đóng hẳn rồi mở lại) rồi thử lại.',
    }
  }
  let full = raw.data
  if (v < target) {
    try {
      full = runMigrations({ schemaVersion: v, data: raw.data }, target, opts.migrations ?? defaultMigrations).data
    } catch {
      return { ok: false, message: 'Không nâng cấp được file sao lưu cũ này. Dữ liệu trên máy chưa bị đổi gì.' }
    }
  }
  const data = sanitizeBackupData(pickBackup(full))
  return {
    ok: true,
    backup: { app: BACKUP_APP, kind: BACKUP_KIND, schemaVersion: target, exportedAt: raw.exportedAt, data },
  }
}


function asObject(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {}
}

function without(obj: Record<string, unknown>, field: string): Record<string, unknown> {
  const out = { ...obj }
  delete out[field]
  return out
}

/**
 * Gộp file vào store bằng đúng luật đồng bộ (`mergeData`: mục nào `updatedAt` mới hơn thắng).
 * Không bao giờ xoá dữ liệu trên máy. Key ngoài allowlist trong file bị bỏ qua; key ngoài allowlist trên máy giữ nguyên.
 */
export function restoreBackup(store: Store, backup: Backup): RestoreResult {
  const merged = mergeData(store.data, pickBackup(backup.data))
  let added = 0
  let updated = 0
  for (const key of BACKUP_KEYS) {
    const field = ENTRY_FIELD[key]
    const before = asObject(store.data[key])
    const after = asObject(merged[key])
    const beforeEntries = asObject(before[field])
    const afterEntries = asObject(after[field])
    for (const id of Object.keys(afterEntries)) {
      if (!Object.hasOwn(beforeEntries, id)) added++
      else if (!deepEqual(beforeEntries[id], afterEntries[id])) updated++
    }
    // Field khác của key (vd Nhà, bài bắt đầu) đổi thì tính là một mục cập nhật.
    const beforeRest = without(before, field)
    const afterRest = without(after, field)
    if (!deepEqual(beforeRest, afterRest)) {
      if (Object.keys(beforeRest).length > 0) updated++
      else if (Object.entries(afterRest).some(([k, v]) => k !== 'updatedAt' && v !== null)) added++
    }
  }
  const changed = BACKUP_KEYS.some((key) => !deepEqual(store.data[key], merged[key]))
  return { store: changed ? { ...store, data: merged } : store, added, updated }
}

function entriesOf(data: Record<string, unknown>, key: BackupKey): Record<string, unknown> {
  const value = data[key]
  const entries = isPlainObject(value) ? value[ENTRY_FIELD[key]] : undefined
  return isPlainObject(entries) ? entries : {}
}

/** Tóm tắt file trước khi khôi phục (chỉ đếm mục hợp lệ). */
export function summarizeBackup(backup: Backup): BackupSummary {
  const store: Store = { schemaVersion: backup.schemaVersion, data: backup.data }
  return {
    exportedAt: backup.exportedAt,
    lessonsDone: readCompletedLessonIds(store).length,
    cards: Object.values(readCards(backup.data.srs)).filter(isSrsCard).length,
    studyDays: Object.values(readSessionDays(store)).filter(isSessionDay).length,
    savedWords: Object.values(readSavedWords(store)).filter(isSavedWord).length,
    placementAttempts: Object.values(entriesOf(backup.data, 'placement')).filter(isPlacementAttempt).length,
    pronunciationItems: Object.values(entriesOf(backup.data, 'pronunciation')).filter(isPronunciationItem).length,
  }
}
