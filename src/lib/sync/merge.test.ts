import { describe, expect, it } from 'vitest'

import { readCompletedLessonIds } from '@/lib/roadmap-progress'
import { LEGACY_UPDATED_AT, migrations, runMigrations, type Store } from '@/lib/storage'

import { deepEqual, InvalidRemoteError, mergeLessons, mergeWithRemote, pickSynced, SYNCED_KEYS } from './merge'

const T1 = '2026-11-01T10:00:00.000Z'
const T2 = '2026-11-01T11:00:00.000Z'
const local = (data: Record<string, unknown>): Store => ({ schemaVersion: 3, data })
const remote = (data: Record<string, unknown>, schemaVersion = 3) => ({ schemaVersion, data, updatedAt: T1 })
const lessons = (l: Record<string, unknown>) => ({ progress: { lessons: l } })

describe('pickSynced / allowlist', () => {
  it('chỉ có progress trong allowlist', () => {
    expect(SYNCED_KEYS).toEqual(['progress'])
  })

  it('bỏ mọi key ngoài allowlist (vd API key)', () => {
    expect(pickSynced({ progress: { lessons: {} }, geminiKey: 'secret', streak: 3 })).toEqual({
      progress: { lessons: {} },
    })
  })
})

describe('mergeLessons', () => {
  it('với mỗi bài: updatedAt mới hơn thắng, bằng nhau giữ local, hợp các id', () => {
    const merged = mergeLessons(
      { a: { done: true, updatedAt: T2 }, b: { done: true, updatedAt: T1 }, c: { done: true, updatedAt: T1 } },
      { a: { done: false, updatedAt: T1 }, b: { done: false, updatedAt: T2 }, c: { done: false, updatedAt: T1 }, d: { done: true, updatedAt: T1 } },
    )
    expect(merged).toEqual({
      a: { done: true, updatedAt: T2 },
      b: { done: false, updatedAt: T2 },
      c: { done: true, updatedAt: T1 },
      d: { done: true, updatedAt: T1 },
    })
  })

  it('so sánh theo thời điểm, không theo chuỗi (múi giờ khác nhau)', () => {
    const merged = mergeLessons(
      { a: { done: true, updatedAt: '2026-11-01T12:00:00+07:00' } }, // = 05:00Z
      { a: { done: false, updatedAt: '2026-11-01T06:00:00Z' } },
    )
    expect(merged.a).toEqual({ done: false, updatedAt: '2026-11-01T06:00:00Z' })
  })

  it('mục sai dạng: lấy bên hợp lệ; cả hai sai thì giữ local', () => {
    expect(
      mergeLessons({ a: { done: 'x' }, b: { done: 1 } }, { a: { done: true, updatedAt: T1 }, b: 'junk' }),
    ).toEqual({ a: { done: true, updatedAt: T1 }, b: { done: 1 } })
  })

  it('lessons thiếu / sai dạng → coi như rỗng', () => {
    expect(mergeLessons(undefined, ['x'])).toEqual({})
  })
})

describe('mergeWithRemote — I/O Matrix', () => {
  it('đăng nhập lần đầu, server trống, local có tiến độ → giữ local, đẩy lên', () => {
    const l = local(lessons({ a: { done: true, updatedAt: T1 } }))
    const r = mergeWithRemote(l, null)
    expect(r).toEqual({ kind: 'merged', store: l, changedLocal: false, push: true })
  })

  it('máy mới: local trống, server có tiến độ → kéo về, không cần đẩy', () => {
    const server = lessons({ 's1-t1-w1': { done: true, updatedAt: T1 }, 's1-t1-w2': { done: true, updatedAt: T1 } })
    const r = mergeWithRemote(local({}), remote(server))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.changedLocal).toBe(true)
    expect(r.push).toBe(false)
    expect(readCompletedLessonIds(r.store)).toEqual(['s1-t1-w1', 's1-t1-w2'])
  })

  it('hai máy sửa cùng bài offline: A đánh dấu, B bỏ đánh dấu sau đó → cả hai theo bản bỏ đánh dấu', () => {
    const a = local(lessons({ x: { done: true, updatedAt: T1 } }))
    const b = local(lessons({ x: { done: false, updatedAt: T2 } }))

    // B đẩy trước, A kéo về: bản của B mới hơn → A bỏ đánh dấu, không cần đẩy.
    const onA = mergeWithRemote(a, remote(b.data))
    if (onA.kind !== 'merged') throw new Error('expected merged')
    expect(readCompletedLessonIds(onA.store)).toEqual([])
    expect(onA.push).toBe(false)

    // A đẩy trước, B kéo về: bản của B mới hơn → giữ B, đẩy đè lên server.
    const onB = mergeWithRemote(b, remote(a.data))
    if (onB.kind !== 'merged') throw new Error('expected merged')
    expect(onB.changedLocal).toBe(false)
    expect(onB.push).toBe(true)
    expect(readCompletedLessonIds(onB.store)).toEqual([])
  })

  it('bỏ đánh dấu không bị máy kia làm sống lại', () => {
    const l = local(lessons({ x: { done: false, updatedAt: T2 } }))
    const r = mergeWithRemote(l, remote(lessons({ x: { done: true, updatedAt: T1 } })))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(readCompletedLessonIds(r.store)).toEqual([])
  })

  it('server mới hơn app → outdated, không gộp', () => {
    expect(mergeWithRemote(local({}), remote({}, 4))).toEqual({ kind: 'outdated' })
  })

  it('server cũ hơn (v2) → migrate bằng runMigrations rồi gộp, đẩy lên bằng v3', () => {
    const r = mergeWithRemote(
      local(lessons({ a: { done: true, updatedAt: T1 } })),
      remote({ progress: { completedLessonIds: ['b', 'old-id'] } }, 2),
      { migrations },
    )
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.push).toBe(true)
    expect(readCompletedLessonIds(r.store)).toEqual(['a', 'b', 'old-id'])
  })

  it('máy migrate muộn: A (v3) bỏ đánh dấu X; B còn v2 có X, lên v3 sau đó → X vẫn bỏ đánh dấu ở cả hai máy', () => {
    // A đã lên v3 từ trước, rồi bỏ đánh dấu X và đẩy lên server.
    const serverFromA = lessons({ X: { done: false, updatedAt: T1 } })
    // B migrate (muộn hơn T1 theo giờ thật) — migration dùng mốc 1970, không dùng giờ máy.
    const bStore = runMigrations({ schemaVersion: 2, data: { progress: { completedLessonIds: ['X', 'Y'] } } }, 3, migrations)
    expect(bStore.data.progress).toEqual({
      lessons: { X: { done: true, updatedAt: LEGACY_UPDATED_AT }, Y: { done: true, updatedAt: LEGACY_UPDATED_AT } },
    })

    // B kéo bản của A về.
    const onB = mergeWithRemote(bStore, remote(serverFromA))
    if (onB.kind !== 'merged') throw new Error('expected merged')
    expect(readCompletedLessonIds(onB.store)).toEqual(['Y'])
    expect(onB.push).toBe(true)

    // B đẩy lên, A kéo về: X vẫn bỏ đánh dấu, Y (có từ trước ở B) được thêm.
    const onA = mergeWithRemote(local(serverFromA), remote(pickSynced(onB.store.data)))
    if (onA.kind !== 'merged') throw new Error('expected merged')
    expect(readCompletedLessonIds(onA.store)).toEqual(['Y'])
  })

  it('server còn v2 (máy cũ đẩy lên trước khi có v3) không làm sống lại bài local đã bỏ đánh dấu', () => {
    const r = mergeWithRemote(
      local(lessons({ X: { done: false, updatedAt: T1 } })),
      remote({ progress: { completedLessonIds: ['X'] } }, 2),
      { migrations },
    )
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(readCompletedLessonIds(r.store)).toEqual([])
  })

  it('server sai cấu trúc → ném lỗi (không ghi đè server)', () => {
    expect(() => mergeWithRemote(local({}), { schemaVersion: 3, data: [] as never, updatedAt: T1 })).toThrow(
      InvalidRemoteError,
    )
    expect(() => mergeWithRemote(local({}), { schemaVersion: 'x' as never, data: {}, updatedAt: T1 })).toThrow(
      InvalidRemoteError,
    )
  })

  it('giữ key local ngoài allowlist, bỏ key server ngoài allowlist', () => {
    const l = local({ apiKey: 'local-secret', ...lessons({}) })
    const r = mergeWithRemote(l, remote({ apiKey: 'server-junk', other: 1, ...lessons({ a: { done: true, updatedAt: T1 } }) }))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.store.data.apiKey).toBe('local-secret')
    expect(r.store.data.other).toBeUndefined()
    // Server có key lạ → nội dung allowlist vẫn giống nhau nên không cần đẩy
    expect(r.push).toBe(false)
  })

  it('giống nhau → không đổi local, không đẩy', () => {
    const data = lessons({ a: { done: true, updatedAt: T1 } })
    const l = local(data)
    const r = mergeWithRemote(l, remote(structuredClone(data)))
    expect(r).toEqual({ kind: 'merged', store: l, changedLocal: false, push: false })
  })

  it('field khác của progress: local ưu tiên, server bù chỗ thiếu', () => {
    const r = mergeWithRemote(
      local({ progress: { lessons: {}, x: 1 } }),
      remote({ progress: { lessons: {}, x: 2, y: 3 } }),
    )
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.store.data.progress).toEqual({ lessons: {}, x: 1, y: 3 })
  })
})

describe('deepEqual', () => {
  it('không phụ thuộc thứ tự key', () => {
    expect(deepEqual({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true)
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false)
    expect(deepEqual([1], { 0: 1 })).toBe(false)
  })
})
