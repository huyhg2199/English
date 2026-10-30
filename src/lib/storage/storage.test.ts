import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadStore, saveStore, STORAGE_KEY } from './storage'
import { CURRENT_VERSION, LEGACY_UPDATED_AT } from './migrations'
import type { Migrations, StorageLike } from './types'

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  const storage: StorageLike & { map: Map<string, string> } = {
    map,
    getItem: vi.fn((k: string) => (map.has(k) ? map.get(k)! : null)),
    setItem: vi.fn((k: string, v: string) => {
      map.set(k, v)
    }),
  }
  return storage
}

const warn = vi.fn()

describe('loadStore — I/O Matrix', () => {
  it('lần đầu mở: localStorage trống → khởi tạo store mặc định với version hiện tại', () => {
    const storage = fakeStorage()
    const result = loadStore({ storage, warn })

    expect(result.status).toBe('fresh')
    expect(result.mode).toBe('persistent')
    expect(result.store).toEqual({ schemaVersion: CURRENT_VERSION, data: {} })
    expect(JSON.parse(storage.map.get(STORAGE_KEY)!)).toEqual({
      schemaVersion: CURRENT_VERSION,
      data: {},
    })
  })

  it('đúng version hiện tại → đọc nguyên dữ liệu, không ghi lại', () => {
    const saved = { schemaVersion: CURRENT_VERSION, data: { streak: 3 } }
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(saved) })
    const result = loadStore({ storage, warn })

    expect(result.status).toBe('ok')
    expect(result.mode).toBe('persistent')
    expect(result.store).toEqual(saved)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  describe('dữ liệu cũ (version thấp hơn)', () => {
    const migrations: Migrations = {
      1: (s) => ({ schemaVersion: 2, data: { ...s.data, notebook: [] } }),
      2: (s) => ({ schemaVersion: 3, data: { ...s.data, medals: {} } }),
    }

    it('chạy migration tuần tự lên version hiện tại, giữ dữ liệu cũ và ghi lại', () => {
      const storage = fakeStorage({
        [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, data: { streak: 7 } }),
      })
      const result = loadStore({ storage, warn, migrations, currentVersion: 3 })

      expect(result.status).toBe('migrated')
      expect(result.mode).toBe('persistent')
      expect(result.store).toEqual({
        schemaVersion: 3,
        data: { streak: 7, notebook: [], medals: {} },
      })
      expect(JSON.parse(storage.map.get(STORAGE_KEY)!)).toEqual(result.store)
    })

    it('migration lỗi → giữ bản gốc, chạy bằng store mặc định trong bộ nhớ, không ghi đè', () => {
      const original = JSON.stringify({ schemaVersion: 1, data: { streak: 7 } })
      const storage = fakeStorage({ [STORAGE_KEY]: original })
      const broken: Migrations = {
        ...migrations,
        2: () => {
          throw new Error('boom')
        },
      }
      const result = loadStore({ storage, warn, migrations: broken, currentVersion: 3 })

      expect(result.status).toBe('migration-failed')
      expect(result.mode).toBe('memory')
      expect(result.store).toEqual({ schemaVersion: 3, data: {} })
      expect(storage.map.get(STORAGE_KEY)).toBe(original)
      expect(storage.setItem).not.toHaveBeenCalled()

      expect(saveStore(result, { schemaVersion: 3, data: { x: 1 } }, { storage })).toBe(false)
      expect(storage.map.get(STORAGE_KEY)).toBe(original)
    })

    it('thiếu migration cũng được coi là migration lỗi', () => {
      const original = JSON.stringify({ schemaVersion: 1, data: { streak: 7 } })
      const storage = fakeStorage({ [STORAGE_KEY]: original })
      const result = loadStore({ storage, warn, migrations: {}, currentVersion: 2 })

      expect(result.status).toBe('migration-failed')
      expect(storage.map.get(STORAGE_KEY)).toBe(original)
    })
  })

  describe('migration thật v1 → v2 → v3 (story 2, 2a: tiến độ lộ trình)', () => {
    const NOW = '2026-11-02T12:00:00.000Z'
    // Migration không dùng giờ máy: tiến độ có từ trước luôn mang mốc cũ cố định.
    const OLD = LEGACY_UPDATED_AT
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(NOW))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('v1: giữ dữ liệu cũ, thêm progress.lessons rỗng và ghi lại', () => {
      expect(CURRENT_VERSION).toBe(3)
      const storage = fakeStorage({
        [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, data: { streak: 7, notes: ['a'] } }),
      })
      const result = loadStore({ storage, warn })

      expect(result.status).toBe('migrated')
      expect(result.mode).toBe('persistent')
      expect(result.store).toEqual({
        schemaVersion: 3,
        data: { streak: 7, notes: ['a'], progress: { lessons: {} } },
      })
      expect(JSON.parse(storage.map.get(STORAGE_KEY)!)).toEqual(result.store)
    })

    it('v1 đã có progress dạng v2 → đổi sang lessons', () => {
      const storage = fakeStorage({
        [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, data: { progress: { completedLessonIds: ['s1-t1-w1'] } } }),
      })
      expect(loadStore({ storage, warn }).store.data.progress).toEqual({
        lessons: { 's1-t1-w1': { done: true, updatedAt: OLD } },
      })
    })

    it('v2 → v3: giữ cả id lạ với done: true, updatedAt = mốc 1970 (không phải lúc migrate), giữ field khác', () => {
      const storage = fakeStorage({
        [STORAGE_KEY]: JSON.stringify({
          schemaVersion: 2,
          data: { streak: 2, progress: { completedLessonIds: ['s1-t1-w1', 'old-id', 7, null], other: 'x' } },
        }),
      })
      const result = loadStore({ storage, warn })

      expect(result.status).toBe('migrated')
      expect(result.store).toEqual({
        schemaVersion: 3,
        data: {
          streak: 2,
          progress: {
            other: 'x',
            lessons: { 's1-t1-w1': { done: true, updatedAt: OLD }, 'old-id': { done: true, updatedAt: OLD } },
          },
        },
      })
      expect(JSON.parse(storage.map.get(STORAGE_KEY)!)).toEqual(result.store)
    })

    it('v2 → v3: giữ id trùng tên thuộc tính kế thừa (vd constructor)', () => {
      const storage = fakeStorage({
        [STORAGE_KEY]: JSON.stringify({ schemaVersion: 2, data: { progress: { completedLessonIds: ['constructor', 'toString'] } } }),
      })
      const lessons = (loadStore({ storage, warn }).store.data.progress as { lessons: Record<string, unknown> }).lessons
      expect(Object.keys(lessons)).toEqual(['constructor', 'toString'])
    })

    it.each([
      ['thiếu progress', {}],
      ['progress sai dạng', { progress: 'x' }],
      ['completedLessonIds không phải mảng', { progress: { completedLessonIds: 'a' } }],
    ])('v2 %s → progress.lessons rỗng, không lỗi', (_, data) => {
      const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 2, data }) })
      const result = loadStore({ storage, warn })
      expect(result.status).toBe('migrated')
      expect((result.store.data.progress as { lessons: unknown }).lessons).toEqual({})
    })
  })

  it.each([
    ['JSON không parse được', '{not json'],
    ['sai cấu trúc', JSON.stringify({ foo: 1 })],
  ])('dữ liệu hỏng (%s) → chạy bằng store mặc định trong bộ nhớ, không ghi đè, có cảnh báo', (_, raw) => {
    const storage = fakeStorage({ [STORAGE_KEY]: raw })
    const localWarn = vi.fn()
    const result = loadStore({ storage, warn: localWarn })

    expect(result.status).toBe('corrupt')
    expect(result.mode).toBe('memory')
    expect(result.store).toEqual({ schemaVersion: CURRENT_VERSION, data: {} })
    expect(localWarn).toHaveBeenCalled()

    saveStore(result, { schemaVersion: CURRENT_VERSION, data: { a: 1 } }, { storage })
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.map.get(STORAGE_KEY)).toBe(raw)
  })

  describe('localStorage bị chặn', () => {
    it('getItem ném lỗi → chạy bằng bộ nhớ tạm, không crash', () => {
      const storage: StorageLike = {
        getItem: () => {
          throw new DOMException('denied', 'SecurityError')
        },
        setItem: () => {
          throw new DOMException('denied', 'SecurityError')
        },
      }
      const result = loadStore({ storage, warn })

      expect(result.status).toBe('unavailable')
      expect(result.mode).toBe('memory')
      expect(result.store).toEqual({ schemaVersion: CURRENT_VERSION, data: {} })
      expect(() => saveStore(result, result.store, { storage })).not.toThrow()
    })

    it('không có localStorage → chạy bằng bộ nhớ tạm', () => {
      const result = loadStore({ storage: null, warn })
      expect(result.mode).toBe('memory')
      expect(result.status).toBe('unavailable')
    })

    it('setItem ném lỗi (quota/private mode) → vẫn chạy, chuyển sang bộ nhớ tạm', () => {
      const storage: StorageLike = {
        getItem: () => null,
        setItem: () => {
          throw new DOMException('quota', 'QuotaExceededError')
        },
      }
      const result = loadStore({ storage, warn })

      expect(result.status).toBe('fresh')
      expect(result.mode).toBe('memory')
    })

    it('truy cập globalThis.localStorage ném lỗi → không crash', () => {
      const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('denied', 'SecurityError')
        },
      })
      try {
        const result = loadStore({ warn })
        expect(result.mode).toBe('memory')
        expect(result.status).toBe('unavailable')
      } finally {
        if (original) Object.defineProperty(globalThis, 'localStorage', original)
        else delete (globalThis as { localStorage?: unknown }).localStorage
      }
    })
  })

  it('version cao hơn → không migrate xuống, không ghi đè, chạy chỉ đọc trong bộ nhớ', () => {
    const raw = JSON.stringify({ schemaVersion: CURRENT_VERSION + 5, data: { future: true } })
    const storage = fakeStorage({ [STORAGE_KEY]: raw })
    const result = loadStore({ storage, warn })

    expect(result.status).toBe('newer-version')
    expect(result.mode).toBe('read-only')
    expect(result.store.data).toEqual({ future: true })
    expect(storage.setItem).not.toHaveBeenCalled()

    const next = { ...result.store, data: { future: false } }
    expect(saveStore(result, next, { storage })).toBe(false)
    expect(result.store).toEqual(next)
    expect(storage.map.get(STORAGE_KEY)).toBe(raw)
  })
})

describe('saveStore', () => {
  it('ghi xuống localStorage khi ở chế độ persistent', () => {
    const storage = fakeStorage()
    const loaded = loadStore({ storage, warn })
    const next = { schemaVersion: CURRENT_VERSION, data: { streak: 1 } }

    expect(saveStore(loaded, next, { storage })).toBe(true)
    expect(JSON.parse(storage.map.get(STORAGE_KEY)!)).toEqual(next)
  })

  it('ghi lỗi → trả về false và chuyển sang chế độ memory', () => {
    const storage = fakeStorage()
    const loaded = loadStore({ storage, warn })
    expect(loaded.mode).toBe('persistent')
    storage.setItem = vi.fn(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(saveStore(loaded, { schemaVersion: CURRENT_VERSION, data: { a: 1 } }, { storage, warn })).toBe(false)
    expect(loaded.mode).toBe('memory')
  })
})

describe('migration trả về store không hợp lệ', () => {
  it.each<[string, Migrations[number]]>([
    ['giữ nguyên schemaVersion', (s) => ({ ...s })],
    ['nhảy sai schemaVersion', (s) => ({ ...s, schemaVersion: 3 })],
    ['data là mảng', () => ({ schemaVersion: 2, data: [] as unknown as Record<string, unknown> })],
    ['data là null', () => ({ schemaVersion: 2, data: null as unknown as Record<string, unknown> })],
  ])('%s → migration-failed, memory, không ghi đè', (_, migrate) => {
    const raw = JSON.stringify({ schemaVersion: 1, data: { streak: 7 } })
    const storage = fakeStorage({ [STORAGE_KEY]: raw })
    const result = loadStore({ storage, warn, migrations: { 1: migrate }, currentVersion: 2 })

    expect(result.status).toBe('migration-failed')
    expect(result.mode).toBe('memory')
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.map.get(STORAGE_KEY)).toBe(raw)
  })
})

describe('store sai cấu trúc', () => {
  it.each([
    ['raw "null"', 'null'],
    ['schemaVersion là string', JSON.stringify({ schemaVersion: '1', data: {} })],
    ['schemaVersion = 0', JSON.stringify({ schemaVersion: 0, data: {} })],
    ['schemaVersion = 1.5', JSON.stringify({ schemaVersion: 1.5, data: {} })],
    ['data là mảng', JSON.stringify({ schemaVersion: 1, data: [] })],
    ['data là null', JSON.stringify({ schemaVersion: 1, data: null })],
  ])('%s → corrupt, memory, không ghi đè', (_, raw) => {
    const storage = fakeStorage({ [STORAGE_KEY]: raw })
    const result = loadStore({ storage, warn })

    expect(result.status).toBe('corrupt')
    expect(result.mode).toBe('memory')
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.map.get(STORAGE_KEY)).toBe(raw)
  })
})
