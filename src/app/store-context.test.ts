import { describe, expect, it, vi } from 'vitest'

import { loadStore, STORAGE_KEY, type StorageLike } from '@/lib/storage'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'

import { readSeen } from '@/lib/trophies'

import { createStoreHandle, deliverOwlPost } from './store-context'

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  const storage: StorageLike & { map: Map<string, string> } = {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: vi.fn((k: string, v: string) => void map.set(k, v)),
  }
  return storage
}

const warn = vi.fn()
const mark = (id: string) => (s: Parameters<typeof setLessonCompleted>[0]) => setLessonCompleted(s, id, true)

describe('createStoreHandle', () => {
  it('persistent: ghi xuống storage, đổi snapshot và báo listener', () => {
    const storage = fakeStorage()
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    const before = handle.getSnapshot()
    const listener = vi.fn()
    handle.subscribe(listener)

    expect(handle.update(mark('s1-t1-w1'))).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(handle.getSnapshot()).not.toBe(before)
    expect(readCompletedLessonIds(handle.getSnapshot().store)).toEqual(['s1-t1-w1'])
    expect(readCompletedLessonIds(JSON.parse(storage.map.get(STORAGE_KEY)!))).toEqual(['s1-t1-w1'])
  })

  it('read-only: UI vẫn cập nhật nhưng không ghi đè storage', () => {
    const raw = JSON.stringify({ schemaVersion: 99, data: {} })
    const storage = fakeStorage({ [STORAGE_KEY]: raw })
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    const listener = vi.fn()
    handle.subscribe(listener)

    expect(handle.update(mark('s1-t1-w1'))).toBe(false)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(readCompletedLessonIds(handle.getSnapshot().store)).toEqual(['s1-t1-w1'])
    expect(storage.map.get(STORAGE_KEY)).toBe(raw)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('memory (không có storage): update trả false, vẫn báo listener và đổi snapshot', () => {
    const handle = createStoreHandle(loadStore({ storage: null, warn }), { storage: null, warn })
    expect(handle.getSnapshot().mode).toBe('memory')
    const before = handle.getSnapshot()
    const listener = vi.fn()
    handle.subscribe(listener)

    expect(handle.update(mark('s1-t1-w1'))).toBe(false)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(handle.getSnapshot()).not.toBe(before)
    expect(readCompletedLessonIds(handle.getSnapshot().store)).toEqual(['s1-t1-w1'])
  })

  it('ghi lỗi giữa phiên: update trả false, snapshot chuyển sang memory, báo listener', () => {
    const storage = fakeStorage()
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    expect(handle.getSnapshot().mode).toBe('persistent')
    storage.setItem = vi.fn(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    const listener = vi.fn()
    handle.subscribe(listener)

    expect(handle.update(mark('s1-t1-w1'))).toBe(false)
    expect(handle.getSnapshot().mode).toBe('memory')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(readCompletedLessonIds(handle.getSnapshot().store)).toEqual(['s1-t1-w1'])
  })

  it('không đổi gì → không báo listener', () => {
    const storage = fakeStorage()
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    const listener = vi.fn()
    const local = vi.fn()
    handle.subscribe(listener)
    handle.onLocalUpdate(local)
    handle.update((s) => s)
    expect(listener).not.toHaveBeenCalled()
    expect(local).not.toHaveBeenCalled()
  })

  it('lưu (migrate lên v6) dạng progress.lessons và giữ id lạ', () => {
    const storage = fakeStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: 3,
        data: { progress: { lessons: { 'old-id': { done: true, updatedAt: '2026-01-01T00:00:00.000Z' } } } },
      }),
    })
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    handle.update(mark('s1-t1-w1'))
    const saved = JSON.parse(storage.map.get(STORAGE_KEY)!)
    expect(saved.schemaVersion).toBe(10)
    expect(Object.keys(saved.data.progress.lessons)).toEqual(['old-id', 's1-t1-w1'])
    expect(readCompletedLessonIds(saved)).toEqual(['old-id', 's1-t1-w1'])
  })

  it('update báo onLocalUpdate; replace (bản từ server) ghi local, báo UI nhưng không báo onLocalUpdate', () => {
    const storage = fakeStorage()
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    const listener = vi.fn()
    const local = vi.fn()
    handle.subscribe(listener)
    const off = handle.onLocalUpdate(local)

    handle.update(mark('a'))
    expect(local).toHaveBeenCalledTimes(1)

    const remote = setLessonCompleted(handle.getSnapshot().store, 'b', true)
    handle.replace(remote)
    expect(local).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledTimes(2)
    expect(readCompletedLessonIds(handle.getSnapshot().store)).toEqual(['a', 'b'])
    expect(readCompletedLessonIds(JSON.parse(storage.map.get(STORAGE_KEY)!))).toEqual(['a', 'b'])

    off()
    handle.update(mark('c'))
    expect(local).toHaveBeenCalledTimes(1)
  })
})

describe('deliverOwlPost (story 12)', () => {
  it('lần đầu trả về huy chương mới và lưu trophies.seen; lần sau trả về []', () => {
    const T = '2026-11-01T10:00:00.000Z'
    const attempt = {
      quizId: 'mini-t1', seed: 's', startedAt: T, finishedAt: T, score: 1, total: 1,
      answers: [{ questionId: 'q', chosen: 'a', correct: true }], updatedAt: T,
    }
    const raw = JSON.stringify({ schemaVersion: 10, data: { quizzes: { attempts: { a1: attempt } }, trophies: { seen: {} } } })
    const storage = fakeStorage({ [STORAGE_KEY]: raw })
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    const now = new Date('2026-11-02T08:00:00.000Z')

    expect(deliverOwlPost(handle, now).map((u) => u.key)).toEqual(['hermione:bronze'])
    const saved = JSON.parse(storage.map.get(STORAGE_KEY)!)
    expect(readSeen(saved)).toEqual({ 'hermione:bronze': { updatedAt: now.toISOString() } })
    expect(deliverOwlPost(handle, now)).toEqual([])

    // Mở app lại (store đọc từ storage) → vẫn không báo lại.
    const reopened = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    expect(deliverOwlPost(reopened, now)).toEqual([])
  })
})
