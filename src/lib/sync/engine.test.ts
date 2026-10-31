import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createStoreHandle } from '@/app/store-context'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'
import { loadStore, STORAGE_KEY, type StorageLike } from '@/lib/storage'

import { browserEnvironment, createSyncEngine, type SyncEnvironment } from './engine'
import type { RemoteStore } from './merge'
import type { RemoteWrite, SyncRemote, WriteResult } from './remote'

const T1 = '2026-11-01T10:00:00.000Z'
const warn = vi.fn()

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  const storage: StorageLike & { map: Map<string, string> } = {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
  }
  return storage
}

/** Server giả: một hàng mỗi user, `updated_at` tăng dần để kiểm tra ghi có điều kiện. */
function fakeRemote() {
  const rows = new Map<string, RemoteStore>()
  let tick = 0
  const state = { failing: false as boolean | Error, rows, writes: [] as RemoteWrite[] }
  const check = () => {
    if (state.failing) throw state.failing instanceof Error ? state.failing : new TypeError('Failed to fetch')
  }
  const stamp = () => new Date(Date.UTC(2026, 10, 1, 12, 0, tick++)).toISOString()
  const remote: SyncRemote = {
    fetch: vi.fn(async (uid: string) => {
      check()
      const row = rows.get(uid)
      return row ? structuredClone(row) : null
    }),
    insert: vi.fn(async (uid: string, row: RemoteWrite): Promise<WriteResult> => {
      check()
      if (rows.has(uid)) return { status: 'conflict' }
      state.writes.push(row)
      const updatedAt = stamp()
      rows.set(uid, { ...structuredClone(row), updatedAt })
      return { status: 'ok', updatedAt }
    }),
    update: vi.fn(async (uid: string, row: RemoteWrite, expected: string): Promise<WriteResult> => {
      check()
      if (rows.get(uid)?.updatedAt !== expected) return { status: 'conflict' }
      state.writes.push(row)
      const updatedAt = stamp()
      rows.set(uid, { ...structuredClone(row), updatedAt })
      return { status: 'ok', updatedAt }
    }),
  }
  return { remote, state }
}

function fakeEnv(online = true) {
  const onlineCbs = new Set<() => void>()
  const visibleCbs = new Set<() => void>()
  const hiddenCbs = new Set<() => void>()
  const env: SyncEnvironment & {
    online: boolean
    goOnline(): void
    becomeVisible(): void
    becomeHidden(): void
    listeners(): number
  } = {
    online,
    isOnline: () => env.online,
    onOnline(cb) {
      onlineCbs.add(cb)
      return () => onlineCbs.delete(cb)
    },
    onVisible(cb) {
      visibleCbs.add(cb)
      return () => visibleCbs.delete(cb)
    },
    onHidden(cb) {
      hiddenCbs.add(cb)
      return () => hiddenCbs.delete(cb)
    },
    goOnline() {
      env.online = true
      onlineCbs.forEach((cb) => cb())
    },
    becomeVisible() {
      visibleCbs.forEach((cb) => cb())
    },
    becomeHidden() {
      hiddenCbs.forEach((cb) => cb())
    },
    listeners: () => onlineCbs.size + visibleCbs.size + hiddenCbs.size,
  }
  return env
}

function setup(opts: { online?: boolean; initial?: Record<string, string> } = {}) {
  const storage = fakeStorage(opts.initial)
  const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
  const { remote, state } = fakeRemote()
  const env = fakeEnv(opts.online ?? true)
  const engine = createSyncEngine({ remote, target: handle, env, debounceMs: 1000, retryMs: 5000, warn })
  handle.onLocalUpdate(() => engine.notifyLocalChange())
  const mark = (id: string, done = true) => handle.update((s) => setLessonCompleted(s, id, done))
  const localIds = () => readCompletedLessonIds(handle.getSnapshot().store)
  const savedIds = () => readCompletedLessonIds(JSON.parse(storage.map.get(STORAGE_KEY)!))
  return { storage, handle, remote, state, env, engine, mark, localIds, savedIds }
}

/** Chạy hết timer + promise đang chờ. */
async function flush() {
  await vi.runAllTimersAsync()
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-02T00:00:00.000Z'))
})
afterEach(() => {
  vi.useRealTimers()
})

describe('sync engine', () => {
  it('chưa start → off, sửa local không gọi server', async () => {
    const { engine, mark, remote } = setup()
    mark('a')
    await flush()
    expect(engine.getStatus()).toBe('off')
    expect(remote.fetch).not.toHaveBeenCalled()
  })

  it('đăng nhập lần đầu, server trống → đẩy local lên, trạng thái idle', async () => {
    const { engine, mark, state } = setup()
    mark('s1-t1-w1')
    engine.start('u1')
    expect(engine.getStatus()).toBe('syncing')
    await flush()
    expect(engine.getStatus()).toBe('idle')
    expect(readCompletedLessonIds({ schemaVersion: 3, data: state.rows.get('u1')!.data })).toEqual(['s1-t1-w1'])
    expect(state.rows.get('u1')!.schemaVersion).toBe(3)
  })

  it('máy A đánh dấu 3 bài, máy B đăng nhập cùng user → B có đúng 3 bài (ghi cả local)', async () => {
    const a = setup()
    a.engine.start('u1')
    await flush()
    a.mark('s1-t1-w1')
    a.mark('s1-t1-w2')
    a.mark('s1-t1-w3')
    expect(a.engine.getStatus()).toBe('pending')
    await flush()
    expect(a.engine.getStatus()).toBe('idle')
    // Debounce: 3 lần sửa liền nhau chỉ đẩy 1 lần
    expect(a.state.writes).toHaveLength(2)

    const b = setup()
    b.state.rows.set('u1', a.state.rows.get('u1')!)
    b.engine.start('u1')
    await flush()
    expect(b.localIds()).toEqual(['s1-t1-w1', 's1-t1-w2', 's1-t1-w3'])
    expect(b.savedIds()).toEqual(['s1-t1-w1', 's1-t1-w2', 's1-t1-w3'])
    expect(b.engine.getStatus()).toBe('idle')
  })

  it('học offline: lưu local, trạng thái pending, online lại thì tự đẩy', async () => {
    const { engine, mark, env, state, savedIds, remote } = setup({ online: false })
    engine.start('u1')
    await flush()
    expect(engine.getStatus()).toBe('pending')
    expect(remote.fetch).not.toHaveBeenCalled()

    mark('a')
    await flush()
    expect(savedIds()).toEqual(['a'])
    expect(engine.getStatus()).toBe('pending')

    env.goOnline()
    await flush()
    expect(engine.getStatus()).toBe('idle')
    expect(readCompletedLessonIds({ schemaVersion: 3, data: state.rows.get('u1')!.data })).toEqual(['a'])
  })

  it('Supabase lỗi → trạng thái error, giữ local, tự thử lại sau', async () => {
    const { engine, mark, state, savedIds } = setup()
    state.failing = Object.assign(new Error('JWT expired'), { status: 401 })
    engine.start('u1')
    await vi.advanceTimersByTimeAsync(0)
    expect(engine.getStatus()).toBe('error')
    mark('a')
    expect(savedIds()).toEqual(['a'])

    state.failing = false
    await flush()
    expect(engine.getStatus()).toBe('idle')
    expect(state.rows.has('u1')).toBe(true)
  })

  it('lỗi mạng khi trình duyệt báo offline → pending (không phải error)', async () => {
    const { engine, state, env } = setup()
    state.failing = true
    engine.start('u1')
    env.online = false
    await vi.advanceTimersByTimeAsync(0)
    expect(engine.getStatus()).toBe('pending')
  })

  it('server mới hơn app → outdated, không ghi đè server, giữ local', async () => {
    const { engine, mark, state, remote, savedIds } = setup()
    state.rows.set('u1', { schemaVersion: 4, data: { progress: { future: true } }, updatedAt: T1 })
    mark('a')
    engine.start('u1')
    await flush()
    expect(engine.getStatus()).toBe('outdated')
    expect(remote.update).not.toHaveBeenCalled()
    expect(remote.insert).not.toHaveBeenCalled()
    expect(state.rows.get('u1')!.schemaVersion).toBe(4)
    expect(savedIds()).toEqual(['a'])

    // Sửa tiếp vẫn không đẩy
    mark('b')
    await flush()
    expect(engine.getStatus()).toBe('outdated')
    expect(remote.update).not.toHaveBeenCalled()
  })

  it('local read-only (do app mới hơn ghi) → không kéo, không đẩy', async () => {
    const { engine, remote } = setup({
      initial: { [STORAGE_KEY]: JSON.stringify({ schemaVersion: 99, data: {} }) },
    })
    engine.start('u1')
    await flush()
    expect(engine.getStatus()).toBe('outdated')
    expect(remote.fetch).not.toHaveBeenCalled()
  })

  it('kéo khi online lại và khi quay lại tab', async () => {
    const { engine, env, remote } = setup()
    engine.start('u1')
    await flush()
    const calls = vi.mocked(remote.fetch).mock.calls.length
    env.becomeVisible()
    await flush()
    env.goOnline()
    await flush()
    expect(vi.mocked(remote.fetch).mock.calls.length).toBe(calls + 2)
  })

  it('máy khác ghi chen giữa (conflict) → kéo lại, gộp rồi ghi, không mất bài của máy kia', async () => {
    const { engine, mark, state, remote } = setup()
    engine.start('u1')
    await flush()
    mark('mine')
    // Máy khác ghi ngay sau khi máy này vừa đọc
    const realFetch = vi.mocked(remote.fetch).getMockImplementation()!
    vi.mocked(remote.fetch).mockImplementationOnce(async (uid) => {
      const row = await realFetch(uid)
      state.rows.set('u1', {
        schemaVersion: 3,
        data: { progress: { lessons: { other: { done: true, updatedAt: T1 } } } },
        updatedAt: 'khác',
      })
      return row
    })
    await flush()
    expect(engine.getStatus()).toBe('idle')
    const ids = readCompletedLessonIds({ schemaVersion: 3, data: state.rows.get('u1')!.data })
    expect([...ids].sort()).toEqual(['mine', 'other'])
  })

  it('đăng xuất → off, ngừng nghe sự kiện, bỏ kết quả đang chạy, giữ local', async () => {
    const { engine, mark, env, state, savedIds, localIds } = setup()
    state.rows.set('u1', { schemaVersion: 3, data: { progress: { lessons: { s: { done: true, updatedAt: T1 } } } }, updatedAt: T1 })
    mark('a')
    engine.start('u1')
    expect(env.listeners()).toBe(3)
    engine.stop() // trước khi fetch xong
    await flush()
    expect(engine.getStatus()).toBe('off')
    expect(env.listeners()).toBe(0)
    // Kết quả kéo về sau khi đăng xuất bị bỏ qua
    expect(localIds()).toEqual(['a'])
    expect(savedIds()).toEqual(['a'])

    mark('b')
    await flush()
    expect(engine.getStatus()).toBe('off')
  })

  it('báo listener khi đổi trạng thái', async () => {
    const { engine } = setup()
    const seen: string[] = []
    engine.subscribe(() => seen.push(engine.getStatus()))
    engine.start('u1')
    await flush()
    engine.stop()
    expect(seen).toEqual(['syncing', 'idle', 'off'])
  })
  it('app xuống nền (hidden / pagehide) còn thay đổi chưa đẩy → đẩy ngay, không chờ debounce', async () => {
    const { engine, mark, env, state } = setup()
    engine.start('u1')
    await flush()
    mark('a')
    env.becomeHidden()
    // Chưa tới debounce (1000ms) mà đã ghi lên server
    await vi.advanceTimersByTimeAsync(0)
    expect(readCompletedLessonIds({ schemaVersion: 3, data: state.rows.get('u1')!.data })).toEqual(['a'])
    expect(engine.getStatus()).toBe('idle')
  })

  it('xuống nền khi không có gì chờ → không gọi server', async () => {
    const { engine, env, remote } = setup()
    engine.start('u1')
    await flush()
    const calls = vi.mocked(remote.fetch).mock.calls.length
    env.becomeHidden()
    await vi.advanceTimersByTimeAsync(0)
    expect(vi.mocked(remote.fetch).mock.calls.length).toBe(calls)
  })

  it('xuống nền khi offline → giữ local, pending, online lại thì đẩy', async () => {
    const { engine, mark, env, state, savedIds } = setup()
    engine.start('u1')
    await flush()
    env.online = false
    mark('a')
    env.becomeHidden()
    await vi.advanceTimersByTimeAsync(0)
    expect(engine.getStatus()).toBe('pending')
    expect(savedIds()).toEqual(['a'])
    env.goOnline()
    await flush()
    expect(readCompletedLessonIds({ schemaVersion: 3, data: state.rows.get('u1')!.data })).toEqual(['a'])
  })

  it('flush(): đẩy ngay thay đổi đang chờ debounce; resolve sau khi ghi xong', async () => {
    const { engine, mark, state } = setup()
    engine.start('u1')
    await flush()
    mark('a')
    await engine.flush()
    expect(readCompletedLessonIds({ schemaVersion: 3, data: state.rows.get('u1')!.data })).toEqual(['a'])
    expect(engine.getStatus()).toBe('idle')
  })

  it('flush() khi đang đồng bộ và có sửa mới → chờ thêm một lượt để đẩy cả sửa mới', async () => {
    const { engine, mark, state } = setup()
    engine.start('u1') // đang chạy lượt đầu
    mark('late')
    await engine.flush()
    expect(readCompletedLessonIds({ schemaVersion: 3, data: state.rows.get('u1')!.data })).toEqual(['late'])
  })

  it('đang outdated: sửa local không lên lịch kéo, badge không nhấp nháy', async () => {
    const { engine, mark, state, remote } = setup()
    state.rows.set('u1', { schemaVersion: 4, data: {}, updatedAt: T1 })
    engine.start('u1')
    await flush()
    const calls = vi.mocked(remote.fetch).mock.calls.length
    const seen: string[] = []
    engine.subscribe(() => seen.push(engine.getStatus()))
    mark('a')
    mark('b')
    await flush()
    await engine.flush()
    expect(vi.mocked(remote.fetch).mock.calls.length).toBe(calls)
    expect(seen).toEqual([])
    expect(engine.getStatus()).toBe('outdated')
  })

  it('đang error: sửa local không đổi badge về pending', async () => {
    const { engine, mark, state } = setup()
    state.failing = Object.assign(new Error('JWT expired'), { status: 401 })
    engine.start('u1')
    await vi.advanceTimersByTimeAsync(0)
    expect(engine.getStatus()).toBe('error')
    mark('a')
    expect(engine.getStatus()).toBe('error')
  })

  it('outdated tách lý do: server mới hơn vs local mới hơn', async () => {
    const server = setup()
    server.state.rows.set('u1', { schemaVersion: 4, data: {}, updatedAt: T1 })
    server.engine.start('u1')
    await flush()
    expect(server.engine.getStatus()).toBe('outdated')
    expect(server.engine.getOutdatedReason()).toBe('server')

    const local = setup({ initial: { [STORAGE_KEY]: JSON.stringify({ schemaVersion: 99, data: {} }) } })
    local.engine.start('u1')
    await flush()
    expect(local.engine.getOutdatedReason()).toBe('local')

    local.engine.stop()
    expect(local.engine.getOutdatedReason()).toBeNull()
  })
  it('sync lỗi → sửa vẫn giữ; xuống nền thì flush thử đẩy lại', async () => {
    const { engine, mark, env, state, savedIds } = setup()
    engine.start('u1')
    await flush()
    mark('a')
    state.failing = Object.assign(new Error('JWT expired'), { status: 401 })
    await vi.advanceTimersByTimeAsync(1000) // debounce → lượt đẩy lỗi
    expect(engine.getStatus()).toBe('error')
    expect(savedIds()).toEqual(['a'])

    state.failing = false
    env.becomeHidden()
    await vi.advanceTimersByTimeAsync(0) // chưa tới retry (5000ms)
    expect(readCompletedLessonIds({ schemaVersion: 3, data: state.rows.get('u1')!.data })).toEqual(['a'])
    expect(engine.getStatus()).toBe('idle')
  })

  it('hàng trên server sai cấu trúc → error, không ghi server, local giữ nguyên', async () => {
    const { engine, mark, state, remote, handle } = setup()
    mark('a')
    const before = structuredClone(handle.getSnapshot().store)
    state.rows.set('u1', { schemaVersion: 3, data: ['hỏng'] as never, updatedAt: T1 })
    engine.start('u1')
    await vi.advanceTimersByTimeAsync(0)
    expect(engine.getStatus()).toBe('error')
    expect(remote.insert).not.toHaveBeenCalled()
    expect(remote.update).not.toHaveBeenCalled()
    expect(handle.getSnapshot().store).toEqual(before)
  })
})

describe('browserEnvironment', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubBrowser(online = true) {
    const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState })
    const win = new EventTarget()
    vi.stubGlobal('document', doc)
    vi.stubGlobal('window', win)
    vi.stubGlobal('navigator', { onLine: online })
    const setVisibility = (v: DocumentVisibilityState) => {
      doc.visibilityState = v
      doc.dispatchEvent(new Event('visibilitychange'))
    }
    return { win, setVisibility }
  }

  it('onHidden: gọi khi hidden và pagehide, không gọi khi visible; huỷ thì thôi gọi', () => {
    const { win, setVisibility } = stubBrowser()
    const cb = vi.fn()
    const off = browserEnvironment().onHidden(cb)
    setVisibility('visible')
    expect(cb).not.toHaveBeenCalled()
    setVisibility('hidden')
    expect(cb).toHaveBeenCalledTimes(1)
    win.dispatchEvent(new Event('pagehide'))
    expect(cb).toHaveBeenCalledTimes(2)
    off()
    setVisibility('hidden')
    win.dispatchEvent(new Event('pagehide'))
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('onVisible: chỉ gọi khi visible; huỷ thì thôi gọi', () => {
    const { setVisibility } = stubBrowser()
    const cb = vi.fn()
    const off = browserEnvironment().onVisible(cb)
    setVisibility('hidden')
    expect(cb).not.toHaveBeenCalled()
    setVisibility('visible')
    expect(cb).toHaveBeenCalledTimes(1)
    off()
    setVisibility('visible')
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('onOnline: gọi khi online; huỷ thì thôi gọi; isOnline đọc navigator.onLine', () => {
    const { win } = stubBrowser(false)
    const env = browserEnvironment()
    expect(env.isOnline()).toBe(false)
    const cb = vi.fn()
    const off = env.onOnline(cb)
    win.dispatchEvent(new Event('online'))
    expect(cb).toHaveBeenCalledTimes(1)
    off()
    win.dispatchEvent(new Event('online'))
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
