import { afterEach, describe, expect, it, vi } from 'vitest'

import { createStoreHandle } from '@/app/store-context'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'
import { loadStore } from '@/lib/storage'

import type { AuthController, AuthState } from './auth'
import { createSyncEngine, type OutdatedReason, type SyncEngine, type SyncEnvironment, type SyncStatus } from './engine'
import { createSync, SYNC_USER_KEY, withoutSyncedKeys } from './index'
import type { RemoteStore } from './merge'
import type { SyncRemote, WriteResult } from './remote'

const warn = vi.fn()
const handle = () => createStoreHandle(loadStore({ storage: null, warn }), { storage: null, warn })

function memStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  }
}

function fakeAuth(initial: AuthState) {
  let state = initial
  const listeners = new Set<() => void>()
  const auth: AuthController & { set(s: AuthState): void } = {
    getState: () => state,
    subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
    sendCode: vi.fn(async () => ({ ok: true as const })),
    verifyCode: vi.fn(async () => ({ ok: true as const })),
    signOut: vi.fn(async () => auth.set({ status: 'signed-out' })),
    set(s) {
      state = s
      listeners.forEach((l) => l())
    },
  }
  return auth
}

function fakeEngine(): SyncEngine {
  return {
    getStatus: () => 'off',
    getOutdatedReason: () => null,
    subscribe: () => () => {},
    start: vi.fn(),
    stop: vi.fn(),
    notifyLocalChange: vi.fn(),
    syncNow: vi.fn(async () => {}),
    flush: vi.fn(async () => {}),
  }
}

const signedIn = (id: string): AuthState => ({ status: 'signed-in', user: { id, email: null }, offline: false })

afterEach(() => {
  vi.useRealTimers()
})

describe('createSync', () => {
  it('thiếu cấu hình Supabase → disabled, chạy chỉ local', () => {
    const sync = createSync(null, handle())
    expect(sync.getSnapshot()).toEqual({ enabled: false, auth: { status: 'disabled' }, status: 'off', outdatedReason: null })
  })

  it('đăng nhập → start engine; sửa local → báo engine; đăng xuất → flush rồi stop, giữ local', async () => {
    const h = handle()
    const auth = fakeAuth({ status: 'signed-out' })
    const engine = fakeEngine()
    const sync = createSync(null, h, { auth, engine, storage: memStorage() })
    expect(sync.getSnapshot().enabled).toBe(true)
    expect(engine.stop).toHaveBeenCalled()

    auth.set({ status: 'signed-in', user: { id: 'u1', email: null }, offline: true })
    expect(engine.start).toHaveBeenCalledWith('u1')
    expect(sync.getSnapshot().auth.status).toBe('signed-in')

    h.update((s) => setLessonCompleted(s, 'a', true))
    expect(engine.notifyLocalChange).toHaveBeenCalledTimes(1)

    await sync.signOut()
    expect(engine.flush).toHaveBeenCalledTimes(1)
    expect(vi.mocked(engine.flush).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(auth.signOut).mock.invocationCallOrder[0],
    )
    expect(engine.stop).toHaveBeenCalledTimes(2)
    expect(sync.getSnapshot().auth.status).toBe('signed-out')
    expect(readCompletedLessonIds(h.getSnapshot().store)).toEqual(['a'])
  })

  it('flush treo (mạng chậm) → vẫn đăng xuất sau timeout', async () => {
    vi.useFakeTimers()
    const auth = fakeAuth(signedIn('u1'))
    const engine = fakeEngine()
    vi.mocked(engine.flush).mockReturnValue(new Promise(() => {}))
    const sync = createSync(null, handle(), { auth, engine, storage: memStorage(), flushTimeoutMs: 100 })
    const done = sync.signOut()
    await vi.advanceTimersByTimeAsync(100)
    await done
    expect(auth.signOut).toHaveBeenCalled()
  })

  it('nhớ user đã đồng bộ; cùng user đăng nhập lại → giữ local (gộp như thường)', () => {
    const h = handle()
    h.update((s) => setLessonCompleted(s, 'a', true))
    const storage = memStorage({ [SYNC_USER_KEY]: 'u1' })
    const auth = fakeAuth({ status: 'signed-out' })
    createSync(null, h, { auth, engine: fakeEngine(), storage })
    auth.set(signedIn('u1'))
    expect(readCompletedLessonIds(h.getSnapshot().store)).toEqual(['a'])
    expect(storage.map.get(SYNC_USER_KEY)).toBe('u1')
  })

  it('máy chưa từng đồng bộ (không có sync-user) → giữ local để đẩy lên, ghi sync-user', () => {
    const h = handle()
    h.update((s) => setLessonCompleted(s, 'a', true))
    const storage = memStorage()
    const auth = fakeAuth({ status: 'signed-out' })
    createSync(null, h, { auth, engine: fakeEngine(), storage })
    auth.set(signedIn('u1'))
    expect(readCompletedLessonIds(h.getSnapshot().store)).toEqual(['a'])
    expect(storage.map.get(SYNC_USER_KEY)).toBe('u1')
  })

  it('đổi tài khoản → xoá key đồng bộ trên máy trước khi engine.start, giữ key khác', () => {
    const h = handle()
    h.update((s) => {
      const next = setLessonCompleted(s, 'a', true)
      return { ...next, data: { ...next.data, apiKey: 'k' } }
    })
    const storage = memStorage({ [SYNC_USER_KEY]: 'userA' })
    const auth = fakeAuth({ status: 'signed-out' })
    const engine = fakeEngine()
    let atStart: unknown
    vi.mocked(engine.start).mockImplementation(() => {
      atStart = structuredClone(h.getSnapshot().store.data)
    })
    createSync(null, h, { auth, engine, storage })
    auth.set(signedIn('userB'))
    expect(atStart).toEqual({ apiKey: 'k' })
    expect(storage.map.get(SYNC_USER_KEY)).toBe('userB')
  })
})

describe('createSync — outdatedReason', () => {
  it('snapshot theo status/reason của engine; đổi chỉ reason vẫn báo listener', () => {
    let status: SyncStatus = 'idle'
    let reason: OutdatedReason | null = null
    const engineListeners = new Set<() => void>()
    const engine: SyncEngine = {
      ...fakeEngine(),
      getStatus: () => status,
      getOutdatedReason: () => reason,
      subscribe: (l) => (engineListeners.add(l), () => engineListeners.delete(l)),
    }
    const emit = (s: SyncStatus, r: OutdatedReason | null) => {
      status = s
      reason = r
      engineListeners.forEach((l) => l())
    }
    const sync = createSync(null, handle(), { auth: fakeAuth(signedIn('u1')), engine, storage: memStorage() })
    const seen = vi.fn()
    sync.subscribe(seen)

    emit('outdated', 'local')
    expect(sync.getSnapshot()).toMatchObject({ status: 'outdated', outdatedReason: 'local' })
    expect(seen).toHaveBeenCalledTimes(1)

    emit('outdated', 'server')
    expect(sync.getSnapshot()).toMatchObject({ status: 'outdated', outdatedReason: 'server' })
    expect(seen).toHaveBeenCalledTimes(2)
  })
})

describe('withoutSyncedKeys', () => {
  it('bỏ key trong allowlist, giữ key khác; không có gì để bỏ thì trả chính store đó', () => {
    const s = { schemaVersion: 3, data: { progress: { lessons: {} }, apiKey: 'k' } }
    expect(withoutSyncedKeys(s)).toEqual({ schemaVersion: 3, data: { apiKey: 'k' } })
    const empty = { schemaVersion: 3, data: { apiKey: 'k' } }
    expect(withoutSyncedKeys(empty)).toBe(empty)
  })
})

describe('đổi tài khoản — engine thật + server giả', () => {
  function server() {
    const rows = new Map<string, RemoteStore>()
    let n = 0
    const remote: SyncRemote = {
      fetch: async (uid) => (rows.has(uid) ? structuredClone(rows.get(uid)!) : null),
      insert: async (uid, row): Promise<WriteResult> => {
        if (rows.has(uid)) return { status: 'conflict' }
        const updatedAt = `t${n++}`
        rows.set(uid, { ...structuredClone(row), updatedAt })
        return { status: 'ok', updatedAt }
      },
      update: async (uid, row, expected): Promise<WriteResult> => {
        if (rows.get(uid)?.updatedAt !== expected) return { status: 'conflict' }
        const updatedAt = `t${n++}`
        rows.set(uid, { ...structuredClone(row), updatedAt })
        return { status: 'ok', updatedAt }
      },
    }
    return { rows, remote }
  }
  const env: SyncEnvironment = {
    isOnline: () => true,
    onOnline: () => () => {},
    onVisible: () => () => {},
    onHidden: () => () => {},
  }
  const ids = (data: Record<string, unknown> | undefined) => readCompletedLessonIds({ schemaVersion: 3, data: data ?? {} })

  it('A đăng xuất, B đăng nhập trên cùng máy → máy = bản server của B; server của B không nhận dữ liệu của A', async () => {
    vi.useFakeTimers()
    const { rows, remote } = server()
    rows.set('B', {
      schemaVersion: 3,
      data: { progress: { lessons: { b1: { done: true, updatedAt: '2026-11-01T00:00:00.000Z' } } } },
      updatedAt: 'tb',
    })
    const h = handle()
    const engine = createSyncEngine({ remote, target: h, env, warn })
    const auth = fakeAuth({ status: 'signed-out' })
    const sync = createSync(null, h, { auth, engine, storage: memStorage() })

    auth.set(signedIn('A'))
    h.update((s) => setLessonCompleted(s, 'a1', true))
    await vi.runAllTimersAsync()
    expect(ids(rows.get('A')!.data)).toEqual(['a1'])

    await sync.signOut()
    // Đăng xuất giữ dữ liệu local
    expect(readCompletedLessonIds(h.getSnapshot().store)).toEqual(['a1'])

    auth.set(signedIn('B'))
    await vi.runAllTimersAsync()
    expect(readCompletedLessonIds(h.getSnapshot().store)).toEqual(['b1'])
    expect(ids(rows.get('B')!.data)).toEqual(['b1'])
  })

  it('đổi sang user có server trống → máy về rỗng, không đẩy dữ liệu của user cũ', async () => {
    vi.useFakeTimers()
    const { rows, remote } = server()
    const h = handle()
    const engine = createSyncEngine({ remote, target: h, env, warn })
    const auth = fakeAuth({ status: 'signed-out' })
    const sync = createSync(null, h, { auth, engine, storage: memStorage() })

    auth.set(signedIn('A'))
    h.update((s) => setLessonCompleted(s, 'a1', true))
    await vi.runAllTimersAsync()
    await sync.signOut()

    auth.set(signedIn('C'))
    await vi.runAllTimersAsync()
    expect(readCompletedLessonIds(h.getSnapshot().store)).toEqual([])
    expect(ids(rows.get('C')?.data)).toEqual([])
  })
})
