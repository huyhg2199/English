import { createBackup, parseBackup, pickBackup, serializeBackup, type Backup } from '@/lib/backup/backup'
import { computeStreak, isSessionDay, readSessionDays, type SessionDay, type SessionKind } from '@/lib/sessions'
import { parseStatus, vnDayKey } from '../../../scripts/owl-post/decide.mjs'
import { CURRENT_VERSION, isPlainObject, type Store } from '@/lib/storage'

/**
 * Bản sao tự động lên secret GitHub Gist (story 13, CAP-21/22). Gist có đúng 2 file:
 * - `lumos-backup.json`: đúng định dạng file sao lưu story 7 (chỉ key allowlist, không bao giờ có key/PAT/token).
 * - `status.json`: trạng thái "hôm nay đã học chưa" cho cron Owl Post đọc.
 * Mọi lời gọi GitHub REST đi qua đây, nhận `fetch` để test. Không log PAT.
 */

export const GIST_BACKUP_FILE = 'lumos-backup.json'
export const GIST_STATUS_FILE = 'status.json'
export const GIST_DESCRIPTION = 'Lumos English: bản sao dữ liệu học + trạng thái cho Owl Post'
export const GITHUB_API = 'https://api.github.com'
/** Xuống nền thì ghi tối đa một lần mỗi 10 phút. */
export const AUTO_WRITE_INTERVAL_MS = 10 * 60 * 1000

export type GistStatus = {
  /** Ngày `YYYY-MM-DD` theo giờ Việt Nam (UTC+7), cùng hàm `vnDayKey` với cron Owl Post. */
  date: string
  studied: boolean
  kind: SessionKind | null
  streak: number
  updatedAt: string
}

/**
 * Buổi đã xong trong ngày VN của `now` (theo `completedAt`, không theo key ngày giờ máy, để máy đặt múi giờ khác
 * vẫn khớp với cron). Có cả buổi chuẩn lẫn lười thì buổi chuẩn.
 */
function vnTodaySession(store: Store, now: Date): SessionDay | null {
  const today = vnDayKey(now)
  let found: SessionDay | null = null
  for (const entry of Object.values(readSessionDays(store))) {
    if (!isSessionDay(entry) || vnDayKey(new Date(entry.completedAt)) !== today) continue
    if (!found || entry.kind === 'full') found = entry
  }
  return found
}

/** Nội dung `status.json`: chỉ ngày (VN), đã học chưa, loại buổi, streak và thời điểm ghi. */
export function statusFor(store: Store, now: Date): GistStatus {
  const today = vnTodaySession(store, now)
  return {
    date: vnDayKey(now),
    studied: today !== null,
    kind: today?.kind ?? null,
    streak: computeStreak(readSessionDays(store), now),
    updatedAt: now.toISOString(),
  }
}

export type GistFiles = Record<typeof GIST_BACKUP_FILE | typeof GIST_STATUS_FILE, string>

/**
 * Không hạ `studied: true` đã có trên Gist cho cùng ngày VN (máy khác đã học mà máy này chưa kéo về).
 * `remoteText` = nội dung `status.json` hiện trên Gist (nếu có).
 */
export function keepStudied(local: GistStatus, remoteText: string | undefined): GistStatus {
  const remote = typeof remoteText === 'string' ? parseStatus(remoteText) : null
  if (local.studied || !remote || remote.date !== local.date || remote.studied !== true) return local
  return { ...local, studied: true, kind: remote.kind, streak: Math.max(local.streak, remote.streak) }
}

/** Hai file ghi lên Gist. `remoteStatus` = `status.json` đang có trên Gist (để không hạ trạng thái đã học). */
export function gistFiles(store: Store, now: Date, remoteStatus?: string): GistFiles {
  return {
    [GIST_BACKUP_FILE]: serializeBackup(createBackup(store, now)),
    [GIST_STATUS_FILE]: JSON.stringify(keepStudied(statusFor(store, now), remoteStatus), null, 2),
  }
}

/**
 * Kiểm bản sao đọc từ Gist. Không có file → `backup: null` (gist mới, ghi được). Có mà hỏng / do app mới hơn ghi
 * → lỗi (không được ghi đè).
 */
export function parseRemoteBackup(text: string | undefined): GistResult<{ backup: Backup | null }> {
  if (typeof text !== 'string') return { ok: true, backup: null }
  const parsed = parseBackup(text)
  if (parsed.ok) return { ok: true, backup: parsed.backup }
  let version: unknown
  try {
    version = (JSON.parse(text) as { schemaVersion?: unknown }).schemaVersion
  } catch {
    version = undefined
  }
  const newer = typeof version === 'number' && version > CURRENT_VERSION
  return { ok: false, error: { kind: newer ? 'remote-newer' : 'remote-unreadable' } }
}

/** Hash FNV-1a 32 bit (đủ để biết dữ liệu có đổi không; không dùng cho bảo mật). */
function fnv1a(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

/** Dấu vân tay nội dung sẽ ghi (bỏ thời điểm ghi): dữ liệu học allowlist + trạng thái hôm nay. */
export function gistFingerprint(store: Store, now: Date): string {
  const { updatedAt: _ignored, ...status } = statusFor(store, now)
  void _ignored
  return fnv1a(JSON.stringify({ v: store.schemaVersion, data: pickBackup(store.data), status }))
}

/**
 * Xuống nền thì có ghi không: chỉ khi dữ liệu đổi kể từ lần ghi trước và lần thử ghi trước đã cách ít nhất 10 phút
 * (hoặc chưa ghi lần nào / mốc hỏng / đồng hồ máy chạy lùi).
 */
export function shouldAutoWrite(lastWriteAt: string | null, changed: boolean, now: Date, intervalMs = AUTO_WRITE_INTERVAL_MS): boolean {
  if (!changed) return false
  if (!lastWriteAt) return true
  const last = Date.parse(lastWriteAt)
  if (Number.isNaN(last)) return true
  const elapsed = now.getTime() - last
  return elapsed < 0 || elapsed >= intervalMs
}

// ---------- GitHub REST ----------

export type GistErrorKind =
  | 'unauthorized'
  | 'not-found'
  | 'rate-limited'
  | 'network'
  | 'http'
  | 'invalid'
  | 'remote-unreadable'
  | 'remote-newer'
  | 'wrong-owner'
  | 'no-write'

export type GistError = { kind: GistErrorKind; status?: number }

export type GistResult<T> = ({ ok: true } & T) | { ok: false; error: GistError }

export type GistDeps = {
  fetch: (url: string, init?: RequestInit) => Promise<Response>
  token: string
}

export const GIST_ERROR_MESSAGES: Record<GistErrorKind, string> = {
  unauthorized: 'PAT không hợp lệ, đã hết hạn hoặc thiếu quyền gist. Tạo PAT mới (chỉ tick quyền gist) rồi nhập lại.',
  'not-found': 'Không tìm thấy gist (đã bị xoá hoặc PAT thuộc tài khoản khác).',
  'rate-limited': 'GitHub đang giới hạn số lần gọi. Thử lại sau ít phút.',
  network: 'Không có mạng hoặc không gọi được GitHub. Sẽ thử lại lần sau.',
  http: 'GitHub trả lỗi. Sẽ thử lại lần sau.',
  invalid: 'Gist không có bản sao hợp lệ.',
  'remote-unreadable': 'Bản sao trên Gist bị hỏng, không đọc được. App không ghi đè để khỏi mất dữ liệu; kiểm tra gist trên GitHub.',
  'remote-newer': 'Bản sao trên Gist do bản app mới hơn ghi. Hãy cập nhật app (đóng hẳn rồi mở lại) rồi thử lại.',
  'wrong-owner': 'PAT thuộc tài khoản khác chủ gist này nên không ghi được. Dùng PAT của chính tài khoản sở hữu gist.',
  'no-write': 'PAT chỉ đọc được, thiếu quyền gist để ghi. Tạo PAT mới (tick quyền gist) rồi nhập lại.',
}

export function gistErrorMessage(error: GistError): string {
  return GIST_ERROR_MESSAGES[error.kind]
}

function headers(token: string, json: boolean): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

function errorFor(res: Response): GistError {
  if (res.status === 401) return { kind: 'unauthorized', status: 401 }
  if (res.status === 404) return { kind: 'not-found', status: 404 }
  if (res.status === 403 || res.status === 429) {
    // 403 kèm hết quota là giới hạn tốc độ; 403 khác là PAT thiếu quyền.
    return res.headers.get('x-ratelimit-remaining') === '0' || res.status === 429
      ? { kind: 'rate-limited', status: res.status }
      : { kind: 'unauthorized', status: res.status }
  }
  return { kind: 'http', status: res.status }
}

async function call(deps: GistDeps, path: string, init: { method: string; body?: unknown }): Promise<GistResult<{ body: unknown }>> {
  let res: Response
  try {
    res = await deps.fetch(`${GITHUB_API}${path}`, {
      method: init.method,
      headers: headers(deps.token, init.body !== undefined),
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
      cache: 'no-store',
    })
  } catch {
    return { ok: false, error: { kind: 'network' } }
  }
  if (!res.ok) return { ok: false, error: errorFor(res) }
  try {
    return { ok: true, body: await res.json() }
  } catch {
    return { ok: false, error: { kind: 'http', status: res.status } }
  }
}

function filesPayload(files: GistFiles) {
  return Object.fromEntries(Object.entries(files).map(([name, content]) => [name, { content }]))
}

/** Tạo secret gist (`public: false`) chứa 2 file. Trả về id gist. */
export async function createGist(deps: GistDeps, files: GistFiles): Promise<GistResult<{ id: string }>> {
  const r = await call(deps, '/gists', {
    method: 'POST',
    body: { description: GIST_DESCRIPTION, public: false, files: filesPayload(files) },
  })
  if (!r.ok) return r
  const id = isPlainObject(r.body) ? r.body.id : undefined
  return typeof id === 'string' && /^[0-9a-f]+$/i.test(id) ? { ok: true, id } : { ok: false, error: { kind: 'invalid' } }
}

/**
 * Tài khoản của PAT và quyền (header `X-OAuth-Scopes` của PAT classic; null khi không có header, vd PAT fine-grained).
 */
export async function getUser(deps: GistDeps): Promise<GistResult<{ login: string; scopes: string[] | null }>> {
  let res: Response
  try {
    res = await deps.fetch(`${GITHUB_API}/user`, { method: 'GET', headers: headers(deps.token, false), cache: 'no-store' })
  } catch {
    return { ok: false, error: { kind: 'network' } }
  }
  if (!res.ok) return { ok: false, error: errorFor(res) }
  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { ok: false, error: { kind: 'http', status: res.status } }
  }
  const login = isPlainObject(body) ? body.login : undefined
  if (typeof login !== 'string') return { ok: false, error: { kind: 'invalid' } }
  const header = res.headers.get('x-oauth-scopes')
  const scopes = header === null ? null : header.split(',').map((x) => x.trim()).filter(Boolean)
  return { ok: true, login, scopes }
}

/** Ghi đè 2 file của gist. */
export async function writeGist(deps: GistDeps, id: string, files: GistFiles): Promise<GistResult<object>> {
  const r = await call(deps, `/gists/${encodeURIComponent(id)}`, { method: 'PATCH', body: { files: filesPayload(files) } })
  return r.ok ? { ok: true } : r
}

/**
 * Đọc nội dung các file của gist. File lớn (GitHub cắt bớt, `truncated`) thì tải `raw_url` (không gửi PAT kèm).
 * File thiếu thì không có trong kết quả.
 */
export async function readGist(
  deps: GistDeps,
  id: string,
): Promise<GistResult<{ files: Record<string, string>; owner: string | null }>> {
  const r = await call(deps, `/gists/${encodeURIComponent(id)}`, { method: 'GET' })
  if (!r.ok) return r
  const raw = isPlainObject(r.body) && isPlainObject(r.body.files) ? r.body.files : null
  if (!raw) return { ok: false, error: { kind: 'invalid' } }
  const files: Record<string, string> = {}
  for (const [name, file] of Object.entries(raw)) {
    if (!isPlainObject(file)) continue
    if (file.truncated === true && typeof file.raw_url === 'string' && file.raw_url.startsWith('https://')) {
      try {
        const res = await deps.fetch(file.raw_url, { cache: 'no-store' })
        if (!res.ok) return { ok: false, error: errorFor(res) }
        files[name] = await res.text()
      } catch {
        return { ok: false, error: { kind: 'network' } }
      }
    } else if (typeof file.content === 'string') {
      files[name] = file.content
    }
  }
  const owner = isPlainObject(r.body) && isPlainObject(r.body.owner) && typeof r.body.owner.login === 'string' ? r.body.owner.login : null
  return { ok: true, files, owner }
}
