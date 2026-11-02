import type { Backup } from '@/lib/backup/backup'
import type { LoadedStore, StorageLike } from '@/lib/storage'

import {
  createGist,
  getUser,
  GIST_BACKUP_FILE,
  GIST_STATUS_FILE,
  gistFiles,
  gistFingerprint,
  parseRemoteBackup,
  readGist,
  shouldAutoWrite,
  writeGist,
  type GistDeps,
  type GistError,
} from './gist'
import {
  clearGistCredentials,
  isValidGistId,
  readGistId,
  readGistToken,
  readLastWrite,
  saveGistCredentials,
  saveLastWrite,
} from './token'

/**
 * - `off`: chưa nhập PAT (không gọi mạng).
 * - `idle`: đã kết nối, lần ghi gần nhất ổn (hoặc chưa ghi).
 * - `writing`: đang ghi.
 * - `error`: lần ghi gần nhất lỗi (thử lại lần sau, không chặn học).
 */
export type GistPhase = 'off' | 'idle' | 'writing' | 'error'

export type GistWriterState = {
  phase: GistPhase
  gistId: string | null
  writtenAt: string | null
  error: GistError | null
}

export type MergeCounts = { added: number; updated: number }

export type ConnectResult =
  | { ok: true; gistId: string; created: boolean; merged: MergeCounts | null }
  | { ok: false; error: GistError | { kind: 'storage' } | { kind: 'bad-id' } }

export type RestoreFromGistResult = { ok: true; backup: Backup } | { ok: false; error: GistError } | { ok: false; message: string }

type KeyStorage = StorageLike & Pick<Storage, 'removeItem'>

export type GistWriterOptions = {
  getLoaded: () => LoadedStore
  fetch: GistDeps['fetch']
  /**
   * Gộp bản sao trên Gist vào store (qua `handle.update` + `restoreBackup`, để đồng bộ Supabase thấy).
   * Gọi trước mỗi lần ghi để hai máy cùng ghi một gist không đè mất dữ liệu của nhau.
   */
  merge?: (backup: Backup) => MergeCounts
  storage?: KeyStorage | null
  now?: () => Date
  /** Gọi `cb` khi app xuống nền; trả hàm huỷ. */
  onHidden?: (cb: () => void) => () => void
}

export type GistWriter = {
  getState(): GistWriterState
  subscribe(listener: () => void): () => void
  /** Ghi ngay (xong buổi, nút "Ghi ngay"): đọc Gist, gộp bản sao về, rồi ghi. Không có PAT thì không làm gì. */
  writeNow(): Promise<void>
  /** Ghi khi xuống nền: chỉ khi dữ liệu đổi và lần thử trước đã cách ≥ 10 phút. */
  autoWrite(): Promise<void>
  /**
   * Nhập PAT: không có `existingId` thì tạo secret gist mới; có thì kiểm gist đó (bản sao đọc được, PAT ghi được),
   * gộp bản sao về rồi mới lưu PAT và ghi. Lỗi thì không lưu gì.
   */
  connect(token: string, existingId?: string): Promise<ConnectResult>
  /** Đọc và kiểm bản sao trên Gist (không đổi store; trang gọi `restoreBackup`). */
  readBackup(): Promise<RestoreFromGistResult>
  /** Ngắt kết nối trên máy này (gist trên GitHub giữ nguyên). */
  disconnect(): void
  /** Gắn nghe xuống nền; trả hàm huỷ. */
  start(): () => void
}

/**
 * Dữ liệu trên máy không dùng để ghi Gist được: hỏng / không nâng cấp được / không có localStorage (app đang chạy
 * store trống) hoặc do bản app mới hơn ghi (chỉ đọc). Ghi lúc này có thể đè mất bản sao tốt trên Gist.
 */
export function localDataBlocked(loaded: LoadedStore): boolean {
  return (
    loaded.status === 'corrupt' ||
    loaded.status === 'migration-failed' ||
    loaded.status === 'unavailable' ||
    loaded.status === 'newer-version' ||
    loaded.mode === 'read-only'
  )
}

export function createGistWriter(opts: GistWriterOptions): GistWriter {
  const now = opts.now ?? (() => new Date())
  const storage = opts.storage
  const listeners = new Set<() => void>()
  let running: Promise<void> | null = null
  let again = false
  /** Đang trong luồng kết nối (chưa gộp xong): chặn mọi lần ghi. */
  let connecting = false

  function initial(): GistWriterState {
    const token = readGistToken(storage)
    const gistId = readGistId(storage)
    return {
      phase: token && gistId ? 'idle' : 'off',
      gistId: token ? gistId : null,
      writtenAt: readLastWrite(storage).writtenAt,
      error: null,
    }
  }

  let state = initial()

  function set(next: Partial<GistWriterState>) {
    state = { ...state, ...next }
    listeners.forEach((l) => l())
  }

  function credentials(): { token: string; gistId: string } | null {
    const token = readGistToken(storage)
    const gistId = readGistId(storage)
    return token && gistId ? { token, gistId } : null
  }

  async function doWrite(): Promise<void> {
    if (connecting) return
    const cred = credentials()
    if (!cred) {
      if (state.phase !== 'off') set({ phase: 'off', gistId: null, error: null })
      return
    }
    if (localDataBlocked(opts.getLoaded())) return
    const deps = { fetch: opts.fetch, token: cred.token }
    const at = now()
    saveLastWrite({ ...readLastWrite(storage), attemptAt: at.toISOString() }, storage)
    set({ phase: 'writing' })
    // Đọc trước: gộp bản sao của máy khác về, giữ `studied: true` đã có trên Gist.
    const remote = await readGist(deps, cred.gistId)
    if (!credentials()) return
    if (!remote.ok) return set({ phase: 'error', error: remote.error })
    const parsed = parseRemoteBackup(remote.files[GIST_BACKUP_FILE])
    if (!parsed.ok) return set({ phase: 'error', error: parsed.error })
    if (parsed.backup && opts.merge) opts.merge(parsed.backup)
    const loaded = opts.getLoaded()
    if (localDataBlocked(loaded)) return set({ phase: 'idle' })
    const store = loaded.store
    const fingerprint = gistFingerprint(store, at)
    const r = await writeGist(deps, cred.gistId, gistFiles(store, at, remote.files[GIST_STATUS_FILE]))
    // Ngắt kết nối trong lúc ghi thì bỏ kết quả.
    if (!credentials()) return
    if (r.ok) {
      saveLastWrite({ attemptAt: at.toISOString(), writtenAt: at.toISOString(), fingerprint }, storage)
      set({ phase: 'idle', writtenAt: at.toISOString(), error: null })
    } else {
      set({ phase: 'error', error: r.error })
    }
  }

  function run(): Promise<void> {
    if (running) {
      again = true
      return running
    }
    running = (async () => {
      try {
        do {
          again = false
          await doWrite()
        } while (again)
      } finally {
        running = null
      }
    })()
    return running
  }

  async function connectExisting(token: string, id: string): Promise<ConnectResult> {
    const deps = { fetch: opts.fetch, token }
    const r = await readGist(deps, id)
    if (!r.ok) return r
    const parsed = parseRemoteBackup(r.files[GIST_BACKUP_FILE])
    if (!parsed.ok) return parsed
    // Đọc được chưa chắc ghi được (secret gist đọc được bằng mọi PAT): kiểm chủ gist và quyền gist.
    const user = await getUser(deps)
    if (!user.ok) return user
    if (r.owner !== null && r.owner.toLowerCase() !== user.login.toLowerCase()) {
      return { ok: false, error: { kind: 'wrong-owner' } }
    }
    if (user.scopes !== null && !user.scopes.includes('gist')) return { ok: false, error: { kind: 'no-write' } }
    const merged = parsed.backup && opts.merge ? opts.merge(parsed.backup) : null
    if (!saveGistCredentials(token, id, storage)) return { ok: false, error: { kind: 'storage' } }
    set({ phase: 'idle', gistId: id, error: null, writtenAt: null })
    return { ok: true, gistId: id, created: false, merged }
  }

  async function connectNew(token: string): Promise<ConnectResult> {
    const loaded = opts.getLoaded()
    const at = now()
    const r = await createGist({ fetch: opts.fetch, token }, gistFiles(loaded.store, at))
    if (!r.ok) return r
    if (!saveGistCredentials(token, r.id, storage)) return { ok: false, error: { kind: 'storage' } }
    saveLastWrite({ attemptAt: at.toISOString(), writtenAt: at.toISOString(), fingerprint: gistFingerprint(loaded.store, at) }, storage)
    set({ phase: 'idle', gistId: r.id, writtenAt: at.toISOString(), error: null })
    return { ok: true, gistId: r.id, created: true, merged: null }
  }

  const writer: GistWriter = {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    writeNow: run,
    async autoWrite() {
      if (connecting || !credentials()) return
      const loaded = opts.getLoaded()
      if (localDataBlocked(loaded)) return
      const at = now()
      const last = readLastWrite(storage)
      const changed = gistFingerprint(loaded.store, at) !== last.fingerprint
      if (!shouldAutoWrite(last.attemptAt, changed, at)) return
      await run()
    },
    async connect(rawToken, existingId) {
      const token = rawToken.trim()
      if (token === '') return { ok: false, error: { kind: 'unauthorized' } }
      const id = existingId?.trim() ?? ''
      if (id !== '' && !isValidGistId(id)) return { ok: false, error: { kind: 'bad-id' } }
      // Chờ lượt ghi đang chạy (của PAT cũ) xong, rồi chặn ghi tới khi gộp xong.
      if (running) await running
      connecting = true
      let result: ConnectResult
      try {
        result = id !== '' ? await connectExisting(token, id) : await connectNew(token)
      } finally {
        connecting = false
      }
      // Nối gist có sẵn: gộp xong mới ghi bản đã gộp lên.
      if (result.ok && !result.created) await run()
      return result
    },
    async readBackup() {
      const cred = credentials()
      if (!cred) return { ok: false, message: 'Chưa kết nối Gist.' }
      const r = await readGist({ fetch: opts.fetch, token: cred.token }, cred.gistId)
      if (!r.ok) return r
      const parsed = parseRemoteBackup(r.files[GIST_BACKUP_FILE])
      if (!parsed.ok) return parsed
      return parsed.backup ? { ok: true, backup: parsed.backup } : { ok: false, message: 'Gist chưa có bản sao (lumos-backup.json).' }
    },
    disconnect() {
      clearGistCredentials(storage)
      set({ phase: 'off', gistId: null, writtenAt: null, error: null })
    },
    start() {
      if (!opts.onHidden) return () => {}
      return opts.onHidden(() => {
        void writer.autoWrite()
      })
    },
  }
  return writer
}
