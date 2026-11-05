import { describe, expect, it } from 'vitest'

import { completeBrick, finishPlacement, foundationState, markRowTested, readFoundation, skipFoundation } from '@/lib/foundation'
import { readCompletedLessonIds } from '@/lib/roadmap-progress'
import { readSavedWords, saveWord, savedWordsOn } from '@/lib/saved-words'
import { computeStreak, readSessionDays, recordSession, todaySession } from '@/lib/sessions'
import { buildSession, gradeCard, readSrs } from '@/lib/srs'
import { LEGACY_UPDATED_AT, migrations, runMigrations, type Store } from '@/lib/storage'

import {
  deepEqual,
  InvalidRemoteError,
  mergeCards,
  mergeLessons,
  mergePlacement,
  mergePronunciationItems,
  mergeSavedWordItems,
  mergeSessionDays,
  mergeSeen,
  mergeTrophies,
  mergeReminders,
  mergeVideoPracticeItems,
  mergeWithRemote,
  pickSynced,
  SYNCED_KEYS,
} from './merge'

const T1 = '2026-11-01T10:00:00.000Z'
const T2 = '2026-11-01T11:00:00.000Z'
const local = (data: Record<string, unknown>): Store => ({ schemaVersion: 13, data })
const remote = (data: Record<string, unknown>, schemaVersion = 13) => ({ schemaVersion, data, updatedAt: T1 })
const lessons = (l: Record<string, unknown>) => ({ progress: { lessons: l } })

describe('pickSynced / allowlist', () => {
  it('chỉ có progress, srs, sessions, savedWords, placement, pronunciation, notes, quizzes, mistakes, trophies, reminders, videoPractice, foundation trong allowlist', () => {
    expect(SYNCED_KEYS).toEqual(['progress', 'srs', 'sessions', 'savedWords', 'placement', 'pronunciation', 'notes', 'quizzes', 'mistakes', 'trophies', 'reminders', 'videoPractice', 'foundation'])
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
    expect(mergeWithRemote(local({}), remote({}, 14))).toEqual({ kind: 'outdated' })
  })

  it('server cũ hơn (v2) → migrate bằng runMigrations rồi gộp, đẩy lên bằng version hiện tại (v5)', () => {
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

describe('srs (story 3) — gộp từng thẻ', () => {
  const NOW = new Date(2026, 10, 2, 9)
  const srs = (cards: Record<string, unknown>) => ({ srs: { cards } })
  const cardsOf = (s: Store) => readSrs(s).cards

  it('hai máy chấm cùng thẻ khi offline → sau đồng bộ cả hai theo bản updatedAt mới hơn', () => {
    // A chấm "Nhớ" lúc 9h, B chấm "Quên" lúc 10h (cùng thẻ), mỗi máy thêm một thẻ riêng.
    const a = gradeCard(gradeCard(local({}), 'ngsl-x', 'good', NOW), 'ngsl-a', 'good', NOW)
    const b = gradeCard(gradeCard(local({}), 'ngsl-x', 'again', new Date(2026, 10, 2, 10)), 'ngsl-b', 'easy', NOW)

    // A đẩy trước, B kéo về rồi đẩy lên; A kéo lại.
    const onB = mergeWithRemote(b, remote(pickSynced(a.data)))
    if (onB.kind !== 'merged') throw new Error('expected merged')
    expect(onB.push).toBe(true)
    const onA = mergeWithRemote(a, remote(pickSynced(onB.store.data)))
    if (onA.kind !== 'merged') throw new Error('expected merged')

    expect(cardsOf(onA.store)).toEqual(cardsOf(onB.store))
    expect(Object.keys(cardsOf(onA.store)).sort()).toEqual(['ngsl-a', 'ngsl-b', 'ngsl-x'])
    expect(cardsOf(onA.store)['ngsl-x']).toEqual(cardsOf(b)['ngsl-x'])
    // Cùng số thẻ đến hạn trên hai máy.
    const words = ['x', 'a', 'b'].map((w, i) => ({
      id: `ngsl-${w}`, word: w, list: 'ngsl' as const, rank: i + 1, pos: 'noun' as const, ipa: w,
      syllables: [w], stressIndex: 0, meaningVi: w, exampleEn: w, exampleVi: w,
    }))
    const later = new Date(2026, 10, 9)
    expect(buildSession(readSrs(onA.store), words, later).dueCount).toBe(
      buildSession(readSrs(onB.store), words, later).dueCount,
    )
  })

  it('đồng hồ máy lùi: lần chấm mới vẫn thắng bản cũ có updatedAt "tương lai"', () => {
    const future = '2027-06-01T00:00:00.000Z'
    const old = { due: future, interval: 3, ease: 2.5, reps: 1, lapses: 0, learning: false, introducedAt: future, known: false, updatedAt: future }
    const graded = gradeCard(local(srs({ x: old })), 'x', 'again', NOW)
    const r = mergeWithRemote(graded, remote(srs({ x: old })))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(cardsOf(r.store).x).toMatchObject({ lapses: 1, updatedAt: '2027-06-01T00:00:00.001Z' })
    expect(r.push).toBe(true)
  })

  it('thẻ sai dạng: lấy bên hợp lệ; cả hai sai thì giữ local, không xoá thẻ nào', () => {
    const good = gradeCard(local({}), 'x', 'good', NOW)
    const merged = mergeCards({ x: { junk: 1 }, y: 'bad-local' }, { x: cardsOf(good).x, y: 'bad-server', z: null })
    expect(merged).toEqual({ x: cardsOf(good).x, y: 'bad-local', z: null })
  })

  it('srs thiếu ở một bên → lấy bên còn lại; field khác của srs: local ưu tiên', () => {
    const r = mergeWithRemote(local({ srs: { cards: {}, a: 1 } }), remote({ srs: { cards: {}, a: 2, b: 3 } }))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.store.data.srs).toEqual({ cards: {}, a: 1, b: 3 })
    const pulled = mergeWithRemote(local({}), remote(srs({ q: { junk: true } })))
    if (pulled.kind !== 'merged') throw new Error('expected merged')
    expect(pulled.store.data.srs).toEqual({ cards: { q: { junk: true } } })
  })

  it('server v3 (app cũ đẩy lên) → migrate lên v5 rồi gộp, giữ srs local, đẩy lên bằng v5', () => {
    const l = gradeCard(local({}), 'x', 'good', NOW)
    const r = mergeWithRemote(l, remote({ progress: { lessons: {} } }, 3), { migrations })
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.push).toBe(true)
    expect(cardsOf(r.store)).toEqual(cardsOf(l))
  })

  it('app cũ (v3) gặp server v4 → outdated, không gộp, không ghi đè srs', () => {
    const server = remote({ progress: { lessons: {} }, ...srs({ x: { due: 'x' } }) }, 4)
    const oldApp = { schemaVersion: 3, data: { progress: { lessons: {} } } }
    expect(mergeWithRemote(oldApp, server, { currentVersion: 3 })).toEqual({ kind: 'outdated' })
  })
})

describe('sessions / savedWords (story 4)', () => {
  const DAY = new Date(2026, 10, 5, 9)
  const LATER = new Date(2026, 10, 5, 20)
  const src = { title: 'T', url: 'https://a.b/' }

  it('hai máy cùng ngày: A ghi lazy, B (sau) ghi full → sau đồng bộ cả hai là full', () => {
    const a = recordSession(local({}), 'lazy', DAY)
    const b = recordSession(local({}), 'full', LATER)
    const onA = mergeWithRemote(a, remote(pickSynced(b.data)))
    if (onA.kind !== 'merged') throw new Error('expected merged')
    expect(todaySession(onA.store, DAY)?.kind).toBe('full')
    expect(onA.changedLocal).toBe(true)
    const onB = mergeWithRemote(b, remote(pickSynced(a.data)))
    if (onB.kind !== 'merged') throw new Error('expected merged')
    expect(todaySession(onB.store, DAY)?.kind).toBe('full')
    expect(onB.push).toBe(true)
  })

  it('khác loại: full thắng lazy dù lazy mới hơn, ở cả hai chiều', () => {
    const full = readSessionDays(recordSession(local({}), 'full', DAY))
    const lazy = readSessionDays(recordSession(local({}), 'lazy', LATER))
    const key = Object.keys(full)[0]
    expect(mergeSessionDays(full, lazy)[key]).toEqual(full[key])
    expect(mergeSessionDays(lazy, full)[key]).toEqual(full[key])
  })

  it('cùng loại: updatedAt mới hơn thắng', () => {
    const a = readSessionDays(recordSession(local({}), 'full', DAY))
    const b = readSessionDays(recordSession(local({}), 'full', LATER))
    const key = Object.keys(a)[0]
    expect(mergeSessionDays(a, b)[key]).toEqual(b[key])
    expect(mergeSessionDays(b, a)[key]).toEqual(b[key])
  })

  it('hợp các ngày khác nhau → streak tính trên cả hai máy', () => {
    const a = recordSession(local({}), 'full', new Date(2026, 10, 4, 9))
    const b = recordSession(local({}), 'lazy', DAY)
    const r = mergeWithRemote(a, remote(pickSynced(b.data)))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(computeStreak(readSessionDays(r.store), DAY)).toBe(2)
  })

  it('mục sai dạng: lấy bên hợp lệ; cả hai sai thì giữ local, không bỏ mục nào', () => {
    const good = readSessionDays(recordSession(local({}), 'full', DAY))
    const key = Object.keys(good)[0]
    expect(mergeSessionDays({ [key]: { kind: 'x' }, z: 'bad-l' }, { [key]: good[key], z: 'bad-s', y: 1 })).toEqual({
      [key]: good[key],
      z: 'bad-l',
      y: 1,
    })
    expect(mergeSavedWordItems({ a: 'junk' }, { a: 'junk2', b: null })).toEqual({ a: 'junk', b: null })
  })

  it('savedWords gộp theo mục: hợp từ của hai máy, field khác local ưu tiên', () => {
    const a = saveWord(local({}), { word: 'alpha', sentence: 's', source: src }, DAY)
    const b = saveWord(local({ savedWords: { items: {}, x: 1 } }), { word: 'beta', sentence: 's', source: src }, DAY)
    const r = mergeWithRemote(a, remote(pickSynced(b.data)))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(savedWordsOn(readSavedWords(r.store), DAY).map((w) => w.word).sort()).toEqual(['alpha', 'beta'])
    expect((r.store.data.savedWords as { x: number }).x).toBe(1)
  })

  it('server v4 (app cũ) → migrate lên v5, giữ sessions/savedWords local, đẩy lên', () => {
    const l = recordSession(local({}), 'lazy', DAY)
    const r = mergeWithRemote(l, remote({ progress: { lessons: {} }, srs: { cards: {} } }, 4), { migrations })
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.push).toBe(true)
    expect(todaySession(r.store, DAY)?.kind).toBe('lazy')
    expect(r.store.data.savedWords).toEqual({ items: {} })
  })

  it('app cũ (v4) gặp server v5 → outdated, không gộp, không ghi đè', () => {
    const server = remote(pickSynced(recordSession(local({}), 'full', DAY).data), 5)
    expect(mergeWithRemote({ schemaVersion: 4, data: {} }, server, { currentVersion: 4 })).toEqual({ kind: 'outdated' })
  })
})

describe('mergePronunciationItems (story 6)', () => {
  it('cùng câu: best lấy max, attempts lấy max, updatedAt mới hơn; hợp các câu', () => {
    const merged = mergePronunciationItems(
      { a: { best: 60, attempts: 4, updatedAt: T2 }, b: { best: 50, attempts: 1, updatedAt: T1 } },
      { a: { best: 90, attempts: 2, updatedAt: T1 }, c: { best: 70, attempts: 1, updatedAt: T1 } },
    )
    expect(merged).toEqual({
      a: { best: 90, attempts: 4, updatedAt: T2 },
      b: { best: 50, attempts: 1, updatedAt: T1 },
      c: { best: 70, attempts: 1, updatedAt: T1 },
    })
  })

  it('mục sai dạng ở một bên → lấy bên hợp lệ', () => {
    expect(mergePronunciationItems({ a: 'x' }, { a: { best: 10, attempts: 1, updatedAt: T1 } })).toEqual({
      a: { best: 10, attempts: 1, updatedAt: T1 },
    })
  })

  it('hai máy: best 60 ở A, 90 ở B → sau đồng bộ best 90 (qua mergeWithRemote)', () => {
    const a = local({ pronunciation: { items: { s: { best: 60, attempts: 1, updatedAt: T2 } } } })
    const r = mergeWithRemote(a, remote({ pronunciation: { items: { s: { best: 90, attempts: 3, updatedAt: T1 } } } }))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.store.data.pronunciation).toEqual({ items: { s: { best: 90, attempts: 3, updatedAt: T2 } } })
    expect(r.push).toBe(true)
  })

  it('server v6 (chưa có pronunciation) → migrate rồi giữ điểm local', () => {
    const a = local({ pronunciation: { items: { s: { best: 60, attempts: 1, updatedAt: T2 } } } })
    const r = mergeWithRemote(a, remote({}, 6))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(r.store.data.pronunciation).toEqual({ items: { s: { best: 60, attempts: 1, updatedAt: T2 } } })
  })
})

describe('mergePlacement (story 5)', () => {
  const attempt = (at: string) => ({ takenAt: at, parts: { p1: 1, p2: 2, p3: 3, p4: 4, p5: 5, p6: 6, p7: 7 }, updatedAt: at })

  it('hai máy làm Mũ khác lần → sau đồng bộ có cả hai lần; field đơn theo updatedAt mới hơn', () => {
    const a = { attempts: { x: attempt(T1) }, house: 'ravenclaw', startLessonId: 's1-t1-w1', updatedAt: T1 }
    const b = { attempts: { y: attempt(T2) }, house: 'gryffindor', startLessonId: 's2-t5-w1', updatedAt: T2 }
    const expected = { attempts: { x: attempt(T1), y: attempt(T2) }, house: 'gryffindor', startLessonId: 's2-t5-w1', updatedAt: T2 }
    expect(mergePlacement(a, b)).toEqual(expected)
    expect(mergePlacement(b, a)).toEqual(expected)
  })

  it('bằng nhau giữ local; một bên thiếu thì lấy bên kia; không bên nào thì để nguyên', () => {
    const a = { attempts: {}, house: 'ravenclaw', startLessonId: null, updatedAt: T1 }
    const b = { attempts: {}, house: 'slytherin', startLessonId: null, updatedAt: T1 }
    expect(mergePlacement(a, b)).toMatchObject({ house: 'ravenclaw' })
    expect(mergePlacement(undefined, b)).toEqual(b)
    expect(mergePlacement(a, undefined)).toEqual(a)
    expect(mergePlacement(undefined, undefined)).toBeUndefined()
  })

  it('bên mới hơn chỉ đổi Nhà (startLessonId null) → giữ bài bắt đầu đã xếp ở bên kia', () => {
    const placed = { attempts: { x: attempt(T1) }, house: null, startLessonId: 's2-t5-w1', updatedAt: T1 }
    const houseOnly = { attempts: {}, house: 'slytherin', startLessonId: null, updatedAt: T2 }
    const expected = { attempts: { x: attempt(T1) }, house: 'slytherin', startLessonId: 's2-t5-w1', updatedAt: T2 }
    expect(mergePlacement(placed, houseOnly)).toEqual(expected)
    expect(mergePlacement(houseOnly, placed)).toEqual(expected)
  })

  it('placement server sai dạng → giữ local', () => {
    const a = { attempts: { x: attempt(T1) }, house: 'ravenclaw', startLessonId: 's1-t1-w1', updatedAt: T1 }
    expect(mergePlacement(a, 'junk')).toEqual(a)
    expect(mergePlacement(a, ['x'])).toEqual(a)
  })

  it('cùng id lần làm ở hai bên → một lần (bằng nhau giữ local, updatedAt mới hơn thắng)', () => {
    const a = { attempts: { x: attempt(T1) }, house: null, startLessonId: null, updatedAt: T1 }
    const b = { attempts: { x: attempt(T2) }, house: null, startLessonId: null, updatedAt: T1 }
    expect(mergePlacement(a, a)).toEqual(a)
    expect((mergePlacement(a, b) as { attempts: object }).attempts).toEqual({ x: attempt(T2) })
  })

  it('qua mergeWithRemote: placement được đồng bộ, lần làm không bị mất', () => {
    const l = local({ placement: { attempts: { x: attempt(T1) }, house: null, startLessonId: null, updatedAt: T1 } })
    const r = mergeWithRemote(l, remote({ placement: { attempts: { y: attempt(T2) }, house: 'hufflepuff', startLessonId: null, updatedAt: T2 } }))
    if (r.kind !== 'merged') throw new Error('expected merged')
    expect(Object.keys((r.store.data.placement as { attempts: object }).attempts)).toEqual(['x', 'y'])
    expect(r.push).toBe(true)
  })
})

describe('trophies (story 12)', () => {
  it('mergeSeen: giữ mọi mục hai bên; trùng thì thời điểm báo sớm hơn thắng; mục sai dạng bên kia hợp lệ thì lấy bên hợp lệ', () => {
    expect(
      mergeSeen(
        { 'hermione:bronze': { updatedAt: T2 }, 'neville:bronze': { updatedAt: T1 }, bad: 'x' },
        { 'hermione:bronze': { updatedAt: T1 }, 'dumbledore:bronze': { updatedAt: T2 }, bad: { updatedAt: T1 } },
      ),
    ).toEqual({
      'hermione:bronze': { updatedAt: T1 },
      'neville:bronze': { updatedAt: T1 },
      'dumbledore:bronze': { updatedAt: T2 },
      bad: { updatedAt: T1 },
    })
  })

  it('mergeTrophies giữ field khác; mergeWithRemote kéo seen từ server về', () => {
    expect(mergeTrophies({ seen: {}, a: 1 }, { seen: { k: { updatedAt: T1 } }, b: 2 })).toEqual({ a: 1, b: 2, seen: { k: { updatedAt: T1 } } })
    const r = mergeWithRemote(local({}), remote({ trophies: { seen: { 'hermione:bronze': { updatedAt: T1 } } } }))
    expect(r.kind === 'merged' && r.store.data.trophies).toEqual({ seen: { 'hermione:bronze': { updatedAt: T1 } } })
  })

  it('server v9 (chưa có trophies) → migrate lên v10 rồi gộp, đẩy lên', () => {
    const r = mergeWithRemote(local({ trophies: { seen: { k: { updatedAt: T1 } } } }), remote({}, 9))
    expect(r).toMatchObject({ kind: 'merged', push: true, store: { data: { trophies: { seen: { k: { updatedAt: T1 } } } } } })
  })
})

describe('reminders (story 13)', () => {
  const r = (times: string[], updatedAt: string) => ({ times, updatedAt })
  it('mergeReminders: cả object, updatedAt mới hơn thắng; bằng nhau giữ local; một bên sai dạng thì lấy bên hợp lệ', () => {
    expect(mergeReminders(r(['12:00'], T1), r(['07:00'], T2))).toEqual(r(['07:00'], T2))
    expect(mergeReminders(r(['12:00'], T2), r(['07:00'], T1))).toEqual(r(['12:00'], T2))
    expect(mergeReminders(r(['12:00'], T1), r(['07:00'], T1))).toEqual(r(['12:00'], T1))
    expect(mergeReminders('x', r(['07:00'], T1))).toEqual(r(['07:00'], T1))
    expect(mergeReminders(undefined, undefined)).toBeUndefined()
  })

  it('mergeWithRemote kéo giờ nhắc mới hơn từ server; server v10 → migrate lên v11 (mặc định mốc cũ) không đè giờ local', () => {
    const res = mergeWithRemote(local({ reminders: r(['12:00'], T1) }), remote({ reminders: r(['08:00'], T2) }))
    expect(res.kind === 'merged' && res.store.data.reminders).toEqual(r(['08:00'], T2))
    const old = mergeWithRemote(local({ reminders: r(['09:00'], T1) }), remote({}, 10))
    expect(old).toMatchObject({ kind: 'merged', push: true, store: { data: { reminders: r(['09:00'], T1) } } })
  })
})

describe('videoPractice (story 16)', () => {
  const item = (best: number, attempts: number, updatedAt: string) => ({ best, attempts, updatedAt })
  it('mergeVideoPracticeItems: best và attempts lấy max, updatedAt mới hơn; mục chỉ một bên có thì giữ', () => {
    expect(mergeVideoPracticeItems({ v1: item(60, 3, T1) }, { v1: item(90, 1, T2), v2: item(50, 1, T1) })).toEqual({
      v1: item(90, 3, T2),
      v2: item(50, 1, T1),
    })
    expect(mergeVideoPracticeItems({ v1: 'x' }, { v1: item(40, 1, T1) })).toEqual({ v1: item(40, 1, T1) })
  })

  it('hai máy: best 60 ở A, 90 ở B → sau đồng bộ best 90; server v11 → migrate không đè local', () => {
    const res = mergeWithRemote(local({ videoPractice: { items: { v: item(60, 2, T2) } } }), remote({ videoPractice: { items: { v: item(90, 1, T1) } } }))
    expect(res).toMatchObject({ kind: 'merged', push: true, store: { data: { videoPractice: { items: { v: item(90, 2, T2) } } } } })
    const old = mergeWithRemote(local({ videoPractice: { items: { v: item(70, 1, T1) } } }), remote({}, 11))
    expect(old).toMatchObject({ kind: 'merged', push: true, store: { data: { videoPractice: { items: { v: item(70, 1, T1) } } } } })
  })
})

describe('foundation (story 18)', () => {
  const at = (d: number, h = 20) => new Date(2026, 10, d, h)
  const merged = (r: ReturnType<typeof mergeWithRemote>) => {
    if (r.kind !== 'merged') throw new Error('expected merged')
    return r
  }

  it('Gộp viên: firstDoneAt sớm nhất, lastDoneAt muộn nhất, updatedAt mới hơn; mục sai dạng lấy bên hợp lệ', () => {
    const l = local({ foundation: { bricks: { F02: { firstDoneAt: T2, lastDoneAt: T2, updatedAt: T2 }, F03: 'x' }, updatedAt: T2 } })
    const r = merged(
      mergeWithRemote(l, remote({ foundation: { bricks: { F02: { firstDoneAt: T1, lastDoneAt: T1, updatedAt: T1 }, F03: { firstDoneAt: T1, lastDoneAt: T1, updatedAt: T1 } }, updatedAt: T1 } })),
    )
    expect(readFoundation(r.store).bricks).toEqual({
      F02: { firstDoneAt: T1, lastDoneAt: T2, updatedAt: T2 },
      F03: { firstDoneAt: T1, lastDoneAt: T1, updatedAt: T1 },
    })
    expect(r.push).toBe(true)
  })

  it('Gộp hàng: local mới hơn trượt 50, server cũ đạt 75 → đạt, 75', () => {
    const l = local({ foundation: { rows: { A: { passed: false, best: 50, updatedAt: T2 } }, updatedAt: T2 } })
    const r = merged(mergeWithRemote(l, remote({ foundation: { rows: { A: { passed: true, best: 75, updatedAt: T1 } }, updatedAt: T1 } })))
    expect(readFoundation(r.store).rows.A).toEqual({ passed: true, best: 75, updatedAt: T2 })
  })

  it('Gộp ngày & Soát vé: local pending skippedAt T2, server done skippedAt T1 → done, T1', () => {
    const l = local({ foundation: { placement: 'pending', skippedAt: T2, updatedAt: T2 } })
    const r = merged(mergeWithRemote(l, remote({ foundation: { placement: 'done', skippedAt: T1, updatedAt: T1 } })))
    expect(readFoundation(r.store)).toMatchObject({ placement: 'done', skippedAt: T1 })
  })

  it('hai máy mỗi máy làm một phần → đồng bộ hai chiều cho cùng foundation, lần sau không đẩy', () => {
    let a = local({})
    a = markRowTested(a, 'A', 8, 8, at(5))
    a = markRowTested(a, 'B', 6, 8, at(5, 21))
    a = finishPlacement(a, 'done', at(5, 22))
    a = completeBrick(a, 'F13', at(6))
    let b = local({})
    b = markRowTested(b, 'C', 7, 8, at(7))
    b = completeBrick(b, 'F17', at(7, 21))
    b = completeBrick(b, 'F18', at(8))

    // A đẩy trước; B kéo về, gộp và đẩy lên.
    const onB = merged(mergeWithRemote(b, remote(pickSynced(a.data))))
    expect(onB.push).toBe(true)
    const server = pickSynced(onB.store.data)
    // A kéo bản đã gộp: nhận đủ, không cần đẩy.
    const onA = merged(mergeWithRemote(a, remote(server)))
    expect(onA.changedLocal).toBe(true)
    expect(onA.push).toBe(false)
    expect(onA.store.data.foundation).toEqual(onB.store.data.foundation)

    const state = foundationState(onA.store)
    expect(state.rowsDone).toEqual(['A', 'B', 'C', 'D'])
    expect(state.status).toBe('completed')
    expect(state.doneBrickIds).toEqual(['F13', 'F17', 'F18'])
    expect(readFoundation(onA.store).placement).toBe('done')
    // Trước khi gộp không máy nào đủ 4 hàng (A có hàng A, B; B có hàng C, D) nên cả hai `completedAt` trống: giá trị
    // đến từ luật "hai nửa qua tường" = `updatedAt` mới hơn, tức lần ghi cuối của máy B (F18 lúc 8/11).
    expect(readFoundation(onA.store).completedAt).toBe(at(8).toISOString())

    // Đồng bộ lặp: không đổi, không đẩy.
    expect(mergeWithRemote(onA.store, remote(server))).toEqual({ kind: 'merged', store: onA.store, changedLocal: false, push: false })
    expect(mergeWithRemote(onB.store, remote(pickSynced(onA.store.data)))).toMatchObject({ changedLocal: false, push: false })
  })

  it('Hai nửa qua tường: A đạt hàng A, B; B đạt hàng C, D → completedAt = updatedAt mới hơn; gộp lại không đẩy', () => {
    const a = markRowTested(markRowTested(local({}), 'A', 8, 8, at(5)), 'B', 8, 8, at(5))
    const b = markRowTested(markRowTested(local({}), 'C', 8, 8, at(6)), 'D', 8, 8, at(6))
    const onA = merged(mergeWithRemote(a, remote(pickSynced(b.data))))
    expect(readFoundation(onA.store).completedAt).toBe(readFoundation(b).updatedAt)
    expect(onA.push).toBe(true)
    const onB = merged(mergeWithRemote(b, remote(pickSynced(onA.store.data))))
    expect(onB.push).toBe(false)
    expect(onB.store.data.foundation).toEqual(onA.store.data.foundation)
    expect(mergeWithRemote(onA.store, remote(pickSynced(onB.store.data)))).toMatchObject({ changedLocal: false, push: false })
  })

  it('server app cũ (v12) không có foundation, local có → giữ foundation local, đẩy lên', () => {
    const l = skipFoundation(completeBrick(local({}), 'F01', at(3)), at(4))
    const r = merged(mergeWithRemote(l, remote({ progress: { lessons: {} } }, 12)))
    expect(r.push).toBe(true)
    expect(r.store.data.foundation).toEqual(l.data.foundation)
  })

  it('local chưa có foundation, server v12 → nhận foundation mặc định sau migrate', () => {
    const r = merged(mergeWithRemote(local({}), remote({}, 12)))
    expect(readFoundation(r.store)).toMatchObject({ placement: 'pending', completedAt: null, updatedAt: LEGACY_UPDATED_AT })
    expect(r.push).toBe(true)
  })

  it('server v14 → outdated, không gộp', () => {
    const l = completeBrick(local({}), 'F01', at(3))
    expect(mergeWithRemote(l, remote({ foundation: { bricks: {} } }, 14))).toEqual({ kind: 'outdated' })
  })
})
