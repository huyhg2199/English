import { describe, expect, it, vi } from 'vitest'

import { loadStore, STORAGE_KEY, type StorageLike } from '@/lib/storage'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'

import { createStoreHandle } from './store-context'

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
    handle.subscribe(listener)
    handle.update((s) => s)
    expect(listener).not.toHaveBeenCalled()
  })
})
