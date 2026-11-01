import { describe, expect, it } from 'vitest'

import type { Word } from '@/data/vocab'
import type { Store } from '@/lib/storage'

import {
  buildSession,
  formatDelay,
  gradeCard,
  isSrsCard,
  KNOWN_INTERVAL_DAYS,
  markCardKnown,
  markKnown,
  readSrs,
  review,
  startOfLocalDay,
  type SrsCard,
} from './index'

// Giờ máy (local): phiên ôn tính "ngày" theo giờ máy.
const NOW = new Date(2026, 10, 2, 9, 0, 0)
const DAY = 86_400_000
const at = (days: number, hours = 9) => new Date(2026, 10, 2 + days, hours, 0, 0)

function word(list: 'ngsl' | 'tsl', rank: number, details = true): Word {
  const base: Word = { id: `${list}-w${rank}`, word: `w${rank}`, list, rank }
  if (!details) return base
  return {
    ...base,
    pos: 'noun',
    ipa: 'ˈwɜːrd',
    syllables: ['w', `${rank}`],
    stressIndex: 0,
    meaningVi: 'từ',
    exampleEn: 'A word.',
    exampleVi: 'Một từ.',
  }
}

const NGSL = Array.from({ length: 30 }, (_, i) => word('ngsl', i + 1))

function card(overrides: Partial<SrsCard> = {}): SrsCard {
  return {
    due: at(-1).toISOString(),
    interval: 3,
    ease: 2.5,
    reps: 2,
    lapses: 0,
    learning: false,
    introducedAt: at(-10).toISOString(),
    known: false,
    updatedAt: at(-1).toISOString(),
    ...overrides,
  }
}

const daysBetween = (from: Date, iso: string) =>
  Math.round((startOfLocalDay(new Date(iso)).getTime() - startOfLocalDay(from).getTime()) / DAY)

describe('isSrsCard', () => {
  it('nhận thẻ đủ field', () => {
    expect(isSrsCard(card())).toBe(true)
  })

  it.each([
    ['null', null],
    ['mảng', []],
    ['thiếu due', { ...card(), due: undefined }],
    ['due không phải thời điểm', card({ due: 'hôm qua' })],
    ['interval âm', card({ interval: -1 })],
    ['interval NaN', card({ interval: Number.NaN })],
    ['ease là chuỗi', { ...card(), ease: '2.5' }],
    ['reps lẻ', card({ reps: 1.5 })],
    ['learning thiếu', { ...card(), learning: undefined }],
    ['known là số', { ...card(), known: 1 }],
  ])('loại %s', (_, value) => {
    expect(isSrsCard(value)).toBe(false)
  })
})

describe('review — lịch', () => {
  it('từ mới bấm Nhớ → ra khỏi bước học, đến hạn 0h ngày mai', () => {
    const c = review(undefined, 'good', NOW)
    expect(c).toMatchObject({ learning: false, interval: 1, reps: 1, lapses: 0, known: false })
    expect(c.introducedAt).toBe(NOW.toISOString())
    expect(c.due).toBe(startOfLocalDay(NOW, 1).toISOString())
  })

  it('từ mới bấm Dễ → 4 ngày; bấm Khó → quay lại sau 10 phút, vẫn đang học', () => {
    expect(review(undefined, 'easy', NOW).interval).toBe(4)
    const hard = review(undefined, 'hard', NOW)
    expect(hard.learning).toBe(true)
    expect(Date.parse(hard.due) - NOW.getTime()).toBe(10 * 60_000)
  })

  it.each(['hard', 'good', 'easy'] as const)('Nhớ (%s) trên thẻ ôn → khoảng sau > khoảng trước', (grade) => {
    for (const interval of [1, 3, 10, 60]) {
      const c = review(card({ interval }), grade, NOW)
      expect(c.interval).toBeGreaterThan(interval)
      expect(daysBetween(NOW, c.due)).toBe(c.interval)
      expect(c.learning).toBe(false)
    }
  })

  it('Dễ giãn nhiều hơn Nhớ, Nhớ nhiều hơn Khó', () => {
    const [h, g, e] = (['hard', 'good', 'easy'] as const).map((grade) => review(card({ interval: 10 }), grade, NOW).interval)
    expect(h).toBeLessThan(g)
    expect(g).toBeLessThan(e)
  })

  it('Quên → quay lại trong phiên hôm nay, khoảng rút ngắn (không về 0), lapses + 1', () => {
    const before = card({ interval: 10, lapses: 2 })
    const c = review(before, 'again', NOW)
    expect(c.lapses).toBe(3)
    expect(c.learning).toBe(true)
    expect(c.interval).toBe(5)
    expect(c.interval).toBeGreaterThan(0)
    expect(c.ease).toBeLessThan(before.ease)
    expect(isSameDayAsNow(c.due)).toBe(true)
    // Học lại xong (Nhớ) → giữ khoảng đã rút ngắn, không reset.
    const relearned = review(c, 'good', new Date(NOW.getTime() + 60_000))
    expect(relearned.interval).toBe(5)
    expect(relearned.learning).toBe(false)
  })

  it('Quên nhiều lần: ease không xuống dưới 1.3, khoảng tối thiểu 1 ngày', () => {
    let c = card({ interval: 1, ease: 1.35 })
    for (let i = 0; i < 5; i++) c = review(review(c, 'again', NOW), 'good', NOW)
    expect(c.ease).toBeGreaterThanOrEqual(1.3)
    expect(c.interval).toBeGreaterThanOrEqual(1)
    expect(c.lapses).toBe(5)
  })

  it('đồng hồ máy lùi: updatedAt mới = cũ + 1ms', () => {
    const future = '2027-01-01T00:00:00.000Z'
    const c = review(card({ updatedAt: future }), 'good', NOW)
    expect(c.updatedAt).toBe('2027-01-01T00:00:00.001Z')
    expect(markKnown(card({ updatedAt: future }), NOW).updatedAt).toBe('2027-01-01T00:00:00.001Z')
  })

  it('thẻ sai dạng → chấm như từ mới, updatedAt vẫn không lùi nếu đọc được', () => {
    const c = review({ updatedAt: '2027-01-01T00:00:00.000Z', junk: 1 }, 'good', NOW)
    expect(isSrsCard(c)).toBe(true)
    expect(c.updatedAt).toBe('2027-01-01T00:00:00.001Z')
  })
})

function isSameDayAsNow(iso: string) {
  return startOfLocalDay(new Date(iso)).getTime() === startOfLocalDay(NOW).getTime()
}

describe('markKnown — Đã biết', () => {
  it('xếp lịch ≥ 60 ngày, known = true, không xoá', () => {
    const c = markKnown(undefined, NOW)
    expect(c.known).toBe(true)
    expect(c.learning).toBe(false)
    expect(c.interval).toBeGreaterThanOrEqual(KNOWN_INTERVAL_DAYS)
    expect(daysBetween(NOW, c.due)).toBeGreaterThanOrEqual(60)
  })
})

describe('buildSession — I/O Matrix', () => {
  it('lần đầu ôn: srs rỗng → đúng N từ mới đầu danh sách (theo hạng NGSL)', () => {
    const shuffled = [...NGSL].reverse()
    const s = buildSession({ cards: {} }, shuffled, NOW, 10)
    expect(s.queue.map((i) => i.word.id)).toEqual(NGSL.slice(0, 10).map((w) => w.id))
    expect(s.queue.every((i) => i.kind === 'new')).toBe(true)
    expect(s.newCount).toBe(10)
    expect(s.dueCount).toBe(0)
  })

  it('srs thiếu hoặc sai dạng → như rỗng', () => {
    expect(buildSession(undefined, NGSL, NOW, 3).newCount).toBe(3)
    expect(buildSession({ cards: 'x' }, NGSL, NOW, 3).newCount).toBe(3)
  })

  it('3 thẻ đến hạn + 5 chưa đến hạn → 3 thẻ ôn + từ mới còn lại của ngày; thẻ chưa đến hạn không hiện', () => {
    const cards: Record<string, SrsCard> = {}
    // 3 thẻ đến hạn (giới thiệu từ trước), 5 thẻ chưa đến hạn; 2 trong số đó giới thiệu hôm nay.
    ;[0, 1, 2].forEach((i) => (cards[NGSL[i].id] = card({ due: at(-i).toISOString() })))
    ;[3, 4, 5].forEach((i) => (cards[NGSL[i].id] = card({ due: at(5).toISOString() })))
    ;[6, 7].forEach(
      (i) => (cards[NGSL[i].id] = card({ due: at(1, 0).toISOString(), introducedAt: at(0, 7).toISOString() })),
    )
    const s = buildSession({ cards }, NGSL, NOW, 10)
    const reviews = s.queue.filter((i) => i.kind === 'review').map((i) => i.word.id)
    expect(reviews).toEqual([NGSL[2].id, NGSL[1].id, NGSL[0].id]) // hạn sớm trước
    expect(s.dueCount).toBe(3)
    expect(s.introducedToday).toBe(2)
    expect(s.newCount).toBe(8)
    expect(s.queue.filter((i) => i.kind === 'new').map((i) => i.word.id)).toEqual(NGSL.slice(8, 16).map((w) => w.id))
    for (const i of [3, 4, 5, 6, 7]) expect(s.queue.some((q) => q.word.id === NGSL[i].id)).toBe(false)
    expect(s.nextDue).toBeNull()
  })

  it('hết việc hôm nay → queue rỗng, nextDue = thẻ kế tiếp đến hạn', () => {
    const cards: Record<string, SrsCard> = {}
    NGSL.slice(0, 10).forEach((w, i) => {
      cards[w.id] = card({ introducedAt: at(0, 8).toISOString(), due: at(i + 1, 0).toISOString() })
    })
    const s = buildSession({ cards }, NGSL, NOW, 10)
    expect(s.queue).toEqual([])
    expect(s.nextDue).toEqual(at(1, 0))
  })

  it('ngày hôm sau: quota từ mới mở lại', () => {
    const cards: Record<string, SrsCard> = {}
    NGSL.slice(0, 10).forEach((w) => (cards[w.id] = card({ introducedAt: at(-1).toISOString(), due: at(3).toISOString() })))
    expect(buildSession({ cards }, NGSL, NOW, 10).newCount).toBe(10)
  })

  it('Quên → thẻ quay lại trong phiên hôm nay (sau từ mới), không chờ tới ngày mai', () => {
    let store: Store = { schemaVersion: 4, data: {} }
    store = gradeCard(store, NGSL[0].id, 'again', NOW)
    // Từ vừa Quên đã tính là 1 trong 3 từ mới hôm nay.
    const s = buildSession(readSrs(store), NGSL, NOW, 3)
    expect(s.queue.map((i) => [i.word.id, i.kind])).toEqual([
      [NGSL[1].id, 'new'],
      [NGSL[2].id, 'new'],
      [NGSL[0].id, 'learning'],
    ])
    // Sau 1 phút thẻ đến hạn thật → lên đầu.
    const later = buildSession(readSrs(store), NGSL, new Date(NOW.getTime() + 61_000), 3)
    expect(later.queue[0]).toMatchObject({ kind: 'review', word: { id: NGSL[0].id } })
  })

  it('Đã biết → không tính vào N từ mới, thẻ xếp xa', () => {
    let store: Store = { schemaVersion: 4, data: {} }
    store = markCardKnown(store, NGSL[0].id, NOW)
    store = markCardKnown(store, NGSL[1].id, NOW)
    const s = buildSession(readSrs(store), NGSL, NOW, 10)
    expect(s.introducedToday).toBe(0)
    expect(s.newCount).toBe(10)
    expect(s.queue.map((i) => i.word.id)).toEqual(NGSL.slice(2, 12).map((w) => w.id))
  })

  it('hết NGSL có dữ liệu → từ mới lấy tiếp từ TSL theo hạng; từ chưa có dữ liệu AI không vào phiên', () => {
    const words = [
      word('tsl', 2),
      word('ngsl', 2, false),
      word('tsl', 1),
      word('ngsl', 1),
      word('tsl', 3, false),
      word('tsl', 4),
    ]
    const cards = { 'ngsl-w1': card({ due: at(9).toISOString() }) }
    const s = buildSession({ cards }, words, NOW, 10)
    expect(s.queue.map((i) => i.word.id)).toEqual(['tsl-w1', 'tsl-w2', 'tsl-w4'])
  })

  it('mục srs sai dạng → bỏ qua khi tính (không thành từ mới), không crash, store giữ nguyên', () => {
    const cards = {
      [NGSL[0].id]: { due: 'x' },
      [NGSL[1].id]: 'junk',
      [NGSL[2].id]: card({ due: at(-1).toISOString() }),
    }
    const srs = { cards }
    const snapshot = structuredClone(srs)
    const s = buildSession(srs, NGSL, NOW, 2)
    expect(s.queue.map((i) => i.word.id)).toEqual([NGSL[2].id, NGSL[3].id, NGSL[4].id])
    expect(srs).toEqual(snapshot)
  })
})

describe('gradeCard / markCardKnown trên store', () => {
  it('ghi thẻ vào store.data.srs.cards, giữ thẻ khác (kể cả sai dạng) và field khác', () => {
    const store: Store = { schemaVersion: 4, data: { progress: { lessons: {} }, srs: { cards: { bad: 'junk' }, x: 1 } } }
    const next = gradeCard(store, 'ngsl-w1', 'good', NOW)
    expect(next).not.toBe(store)
    expect(store.data.srs).toEqual({ cards: { bad: 'junk' }, x: 1 })
    const srs = next.data.srs as { cards: Record<string, unknown>; x: number }
    expect(srs.x).toBe(1)
    expect(srs.cards.bad).toBe('junk')
    expect(isSrsCard(srs.cards['ngsl-w1'])).toBe(true)
    expect(next.data.progress).toBe(store.data.progress)
  })

  it('store chưa có srs (v4 mới tạo) → tạo srs.cards', () => {
    const next = markCardKnown({ schemaVersion: 4, data: {} }, 'ngsl-w1', NOW)
    expect(Object.keys(readSrs(next).cards)).toEqual(['ngsl-w1'])
  })
})

describe('formatDelay', () => {
  it('phút / ngày / tháng', () => {
    expect(formatDelay(new Date(NOW.getTime() + 60_000).toISOString(), NOW)).toBe('1 phút')
    expect(formatDelay(new Date(NOW.getTime() + 10 * 60_000).toISOString(), NOW)).toBe('10 phút')
    expect(formatDelay(startOfLocalDay(NOW, 1).toISOString(), NOW)).toBe('1 ngày')
    expect(formatDelay(startOfLocalDay(NOW, 60).toISOString(), NOW)).toBe('2 tháng')
    expect(formatDelay(new Date(NOW.getTime() + 3 * 3_600_000).toISOString(), NOW)).toBe('3 giờ')
    expect(formatDelay(startOfLocalDay(NOW, 730).toISOString(), NOW)).toBe('2 năm')
  })

  it('23:30 bấm Nhớ (đến hạn 0h mai) → "1 ngày", không phải "30 phút"', () => {
    const late = new Date(2026, 10, 2, 23, 30)
    expect(formatDelay(startOfLocalDay(late, 1).toISOString(), late)).toBe('1 ngày')
    expect(formatDelay(review(undefined, 'good', late).due, late)).toBe('1 ngày')
  })
})
