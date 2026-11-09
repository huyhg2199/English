import { describe, expect, it, vi } from 'vitest'

import { hasBrickContent } from '@/data/foundation/content'
import { getQuestion } from '@/data/questions'
import { completeBrick } from '@/lib/foundation'
import { recordMistake } from '@/lib/quiz'
import { CURRENT_VERSION, loadStore, STORAGE_KEY, type StorageLike, type Store } from '@/lib/storage'
import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'

import { readSeen } from '@/lib/trophies'

import { createGistWriter, GIST_ID_STORAGE, GIST_STATUS_FILE, GIST_TOKEN_STORAGE } from '@/lib/gist'
import { readSessionDays } from '@/lib/sessions'

import { brickInviteFor, createStoreHandle, deliverOwlPost, mergeGistBackup, recordSessionAndBackup } from './store-context'

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
    expect(saved.schemaVersion).toBe(13)
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
    const raw = JSON.stringify({ schemaVersion: 12, data: { quizzes: { attempts: { a1: attempt } }, trophies: { seen: {} } } })
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

describe('deliverOwlPost khi đã qua bức tường (story 26)', () => {
  it('không trả thư Lên tàu Năm 1 và không ghi wall-passed / board-year-1 (thư đó chỉ ở màn Qua bức tường)', () => {
    const T = '2026-11-03T02:00:00.000Z'
    const raw = JSON.stringify({ schemaVersion: 13, data: { foundation: { completedAt: T, bricks: {}, rows: {} } } })
    const storage = fakeStorage({ [STORAGE_KEY]: raw })
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    const now = new Date('2026-11-04T08:00:00.000Z')

    expect(deliverOwlPost(handle, now)).toEqual([])
    expect(readSeen(handle.getSnapshot().store)).toEqual({})
  })
})

describe('recordSessionAndBackup (story 13: xong buổi → ghi Gist)', () => {
  it('ghi buổi vào store trước, rồi đúng một PATCH lên Gist với status.json studied true và đúng loại buổi', async () => {
    const storage = fakeStorage()
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    const keys = new Map([
      [GIST_TOKEN_STORAGE, 'ghp_test'],
      [GIST_ID_STORAGE, 'aa11bb22cc33dd44ee55'],
    ])
    const keyStorage = { getItem: (k: string) => keys.get(k) ?? null, setItem: (k: string, v: string) => void keys.set(k, v), removeItem: (k: string) => void keys.delete(k) }
    const calls: { method: string; body?: string; daysAtCall: number }[] = []
    const fetch = async (_url: string, init?: RequestInit) => {
      calls.push({ method: init?.method ?? 'GET', body: init?.body as string | undefined, daysAtCall: Object.keys(readSessionDays(handle.getSnapshot().store)).length })
      return new Response(JSON.stringify(init?.method === 'PATCH' ? {} : { owner: { login: 'huy' }, files: {} }), { status: 200 })
    }
    const now = new Date('2026-11-02T05:00:00.000Z')
    const gist = createGistWriter({ getLoaded: handle.getSnapshot, fetch, storage: keyStorage, now: () => now, merge: (b) => mergeGistBackup(handle, b) })

    const r = recordSessionAndBackup(handle, gist, 'lazy', now)
    expect(r.saved).toBe(true)
    await r.backup
    const patches = calls.filter((c) => c.method === 'PATCH')
    expect(patches).toHaveLength(1)
    expect(patches[0].daysAtCall).toBe(1)
    const status = JSON.parse(JSON.parse(patches[0].body!).files[GIST_STATUS_FILE].content)
    expect(status).toMatchObject({ date: '2026-11-02', studied: true, kind: 'lazy' })
  })

  it('không có writer → chỉ ghi store', async () => {
    const storage = fakeStorage()
    const handle = createStoreHandle(loadStore({ storage, warn }), { storage, warn })
    const r = recordSessionAndBackup(handle, null, 'full', new Date('2026-11-02T05:00:00.000Z'))
    expect(r.saved).toBe(true)
    await expect(r.backup).resolves.toBeUndefined()
  })
})

describe('brickInviteFor (story 28, dải mời trên Hôm nay)', () => {
  const NOW = new Date('2026-11-20T12:00:00.000Z')
  const at = (hoursAgo: number) => new Date(NOW.getTime() - hoursAgo * 3600_000)
  const wrong = (s: Store, id: string, when: Date) => recordMistake(s, getQuestion(id)!, 'x', when)
  /** Matrix "Mời ôn": hai câu cần subject-pronouns (F09). */
  const f09 = (): Store => wrong(wrong({ schemaVersion: CURRENT_VERSION, data: {} }, 'q-s1-t1-w1-03', at(72)), 'q-s1-t1-w4-04', at(24))

  it('nối lastDoneAt thật: học xong F09 (completeBrick) sau câu sai mới nhất → null; chưa học → mời F09', () => {
    expect(brickInviteFor(f09(), NOW, () => true)?.brickId).toBe('F09')
    expect(brickInviteFor(completeBrick(f09(), 'F09', at(1)), NOW, () => true)).toBeNull()
    // Học F09 trước câu sai mới nhất thì vẫn mời.
    expect(brickInviteFor(completeBrick(f09(), 'F09', at(48)), NOW, () => true)?.brickId).toBe('F09')
  })

  it('nối hasContent: mặc định hasBrickContent; viên "Đang soạn" không mời', () => {
    expect(hasBrickContent('F09')).toBe(true)
    expect(brickInviteFor(f09(), NOW)?.brickId).toBe('F09')
    expect(brickInviteFor(f09(), NOW, (id) => id !== 'F09')?.brickId).not.toBe('F09')
  })
})
