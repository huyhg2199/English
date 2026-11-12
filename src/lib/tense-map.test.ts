import { describe, expect, it } from 'vitest'

import { IRREGULAR_VERB_CARDS, tenseEntries } from '@/data/lessons'
import { getQuiz, lessonQuizId, MISTAKES_HREF, type MistakeTag } from '@/data/questions'
import { getSection } from '@/data/roadmap'
import { ruleCardId } from '@/lib/flashcard-session'
import { isInFoundation, skipFoundation } from '@/lib/foundation'
import { applyStartLesson } from '@/lib/placement/store'
import { recordAttempt, type AttemptKind } from '@/lib/quiz'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import type { SrsCard } from '@/lib/srs'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  groupTenseRows,
  isRememberedCard,
  TENSE_CARD_REMEMBERED_DAYS,
  TENSE_STATUS_LABELS,
  tenseCardsLine,
  FLASHCARDS_HREF,
  tenseCheckLine,
  tenseGapText,
  tenseMapBlurb,
  tenseMapRows,
  tenseMapSummary,
  tenseMistakesLine,
  tenseRowLinks,
  tenseSkippedNote,
  tenseVerbsLine,
  type TenseMapRow,
} from './tense-map'

const day = (d: number, h = 9) => new Date(2026, 11, d, h)
const NOW = day(20)
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
/** Đã bỏ qua Sân ga (bài hiện tại được tính). */
const after = (): Store => skipFoundation(empty(), day(1))

const T1 = ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']

function complete(s: Store, ids: readonly string[], done = true): Store {
  return ids.reduce((acc, id) => setLessonCompleted(acc, id, done, day(2)), s)
}

let seq = 0
/** Một lần làm `quizId` (câu id giả không tra được nên không vào Sổ lỗi). */
function attempt(s: Store, quizId: string, score: number, total: number, when = day(3), kind?: AttemptKind): Store {
  const answers = Array.from({ length: total }, (_, i) => ({ questionId: `x-${i}`, chosen: 'a', correct: i < score }))
  seq++
  return recordAttempt(
    s,
    { id: `a-${seq}`, quizId, seed: 's', startedAt: when, answers, ...(kind ? { kind } : {}) },
    when,
    () => undefined,
  )
}

function card(over: Partial<SrsCard> = {}): SrsCard {
  const intro = day(1).toISOString()
  return {
    due: day(30).toISOString(),
    interval: 10,
    ease: 2.5,
    reps: 3,
    lapses: 0,
    learning: false,
    introducedAt: intro,
    known: false,
    updatedAt: intro,
    ...over,
  }
}

function withCards(s: Store, cards: Record<string, unknown>): Store {
  const srs = s.data.srs as { cards?: Record<string, unknown> } | undefined
  return { ...s, data: { ...s.data, srs: { cards: { ...(srs?.cards ?? {}), ...cards } } } }
}

/** Id SRS các thẻ quy tắc của thì. */
function ruleIds(tenseId: string): string[] {
  const entry = tenseEntries().find((e) => e.tense.id === tenseId)
  return (entry?.tense.ruleCards ?? []).map(ruleCardId)
}

/** Mọi thẻ của thì đã nhớ (khoảng ôn 10, `learning` false). */
function allRemembered(s: Store, tenseId: string): Store {
  return withCards(s, Object.fromEntries(ruleIds(tenseId).map((id) => [id, card()])))
}

function mistakeItem(lessonId: string, over: { tag?: MistakeTag; interval?: number; learning?: boolean; word?: unknown } = {}) {
  const at = day(4).toISOString()
  return {
    tag: over.tag ?? 'thì',
    lessonId,
    sectionId: 'grammar',
    wrongCount: 1,
    lastWrongAt: at,
    lastChosen: 'x',
    card: card({ interval: over.interval ?? 3, learning: over.learning ?? false, due: at }),
    explanation: null,
    updatedAt: at,
    ...(over.word !== undefined ? { word: over.word } : {}),
  }
}

function withMistakes(s: Store, items: Record<string, unknown>): Store {
  const m = s.data.mistakes as { items?: Record<string, unknown> } | undefined
  return { ...s, data: { ...s.data, mistakes: { items: { ...(m?.items ?? {}), ...items } } } }
}

const rowOf = (rows: readonly TenseMapRow[], tenseId: string) => {
  const row = rows.find((r) => r.tenseId === tenseId)
  if (!row) throw new Error(tenseId)
  return row
}

const TENSE_IDS = [
  'to-be',
  'present-simple',
  'present-simple-questions',
  'present-continuous',
  'past-to-be',
  'past-simple',
  'past-simple-irregular',
  'past-continuous',
  'will',
  'going-to',
  'present-perfect',
  'present-perfect-vs-past',
  'modals',
  'comparatives',
  'passive-present',
]

describe('Bản đồ thì — dữ liệu (story 42)', () => {
  it('15 dòng đúng thứ tự to-be … passive-present; mỗi bài có đoạn Ngữ pháp và quiz bài', () => {
    const rows = tenseMapRows(empty(), NOW)
    expect(rows.map((r) => r.tenseId)).toEqual(TENSE_IDS)
    expect(tenseEntries().map((e) => e.tense.id)).toEqual(TENSE_IDS)
    for (const r of rows) {
      expect(getSection(r.lessonId, 'grammar'), r.lessonId).toBeDefined()
      expect(getQuiz(lessonQuizId(r.lessonId)), r.lessonId).toBeDefined()
      expect(r.name).not.toBe('')
    }
  })

  it('groupTenseRows: 4 tháng T1–T4, 3 / 5 / 4 / 3 dòng, giữ thứ tự', () => {
    const rows = tenseMapRows(empty(), NOW)
    const months = groupTenseRows(rows)
    expect(months.map((m) => m.label)).toEqual(['T1', 'T2', 'T3', 'T4'])
    expect(months.map((m) => m.monthId)).toEqual(['t1', 't2', 't3', 't4'])
    expect(months.map((m) => m.rows.length)).toEqual([3, 5, 4, 3])
    for (const m of months) expect(m.period).not.toBe('')
    expect(months.flatMap((m) => m.rows)).toEqual(rows)
  })

  it('nhãn trạng thái tiếng Việt; ngưỡng nhớ 7 ngày', () => {
    expect(TENSE_STATUS_LABELS).toEqual({ new: 'chưa học', learning: 'đang học', solid: 'chắc' })
    expect(TENSE_CARD_REMEMBERED_DAYS).toBe(7)
  })
})

describe('Bản đồ thì — Matrix (story 42)', () => {
  it('Store rỗng: 15 dòng "chưa học", % null, thẻ chưa có lịch, 0 lỗi, missing rỗng; tóm tắt 0 · 0 · 15', () => {
    const rows = tenseMapRows(empty(), NOW)
    expect(rows).toHaveLength(15)
    for (const r of rows) {
      expect(r).toMatchObject({ status: 'new', check: null, openMistakes: 0, missing: [], done: false, current: false })
      expect(r.cards.scheduled).toBe(0)
      expect(tenseGapText(r)).toBeNull()
    }
    expect(tenseMapSummary(rows)).toEqual({ solid: 0, learning: 0, new: 15 })
    expect(tenseMapBlurb(rows)).toBe('0 chắc · 0 đang học · 15 chưa học (15 thì Năm 1)')
  })

  it('Ở Sân ga không tính bài hiện tại: to-be vẫn "chưa học"', () => {
    const s = empty()
    expect(isInFoundation(s)).toBe(true)
    const row = rowOf(tenseMapRows(s, NOW), 'to-be')
    expect(row).toMatchObject({ status: 'new', current: false })
    expect(tenseRowLinks(row)).toMatchObject({ session: null, check: null })
  })

  it('Bài hiện tại: present-continuous "đang học", missing [done, check], có link Buổi ôn và Làm kiểm tra', () => {
    const s = complete(after(), T1)
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row).toMatchObject({ status: 'learning', current: true, done: false, missing: ['done', 'check'] })
    expect(tenseGapText(row)).toBe('Để chắc: đánh dấu bài xong · kiểm tra bài đạt 70%')
    expect(tenseRowLinks(row)).toEqual({
      lesson: '/roadmap/lesson/s1-t2-w1/grammar',
      session: '/session?lesson=s1-t2-w1&step=lesson',
      check: '/practice/quiz/lesson-s1-t2-w1',
      mistakes: null,
      cards: null,
    })
  })

  const solidW1 = () =>
    allRemembered(attempt(complete(after(), [...T1, 's1-t2-w1']), 'lesson-s1-t2-w1', 4, 5), 'present-continuous')

  it('Chắc: present-continuous "chắc", missing rỗng, 80%, thẻ nhớ 5/5, không có link Làm kiểm tra', () => {
    const row = rowOf(tenseMapRows(solidW1(), NOW), 'present-continuous')
    expect(row.status).toBe('solid')
    expect(row.missing).toEqual([])
    expect(row.check).toEqual({ score: 4, total: 5, percent: 80, passed: true })
    expect(row.cards).toMatchObject({ total: 5, scheduled: 5, remembered: 5 })
    expect(tenseCardsLine(row)).toBe('Thẻ quy tắc: nhớ 5/5')
    expect(tenseRowLinks(row).cards).toBeNull()
    expect(tenseCheckLine(row.check)).toEqual({ text: 'Kiểm tra bài: đạt 80%', passed: true })
    expect(tenseRowLinks(row).check).toBeNull()
    expect(tenseRowLinks(row).session).toBe('/session?lesson=s1-t2-w1&step=lesson')
  })

  it('Gần chắc: một thẻ khoảng ôn 3 → "đang học", missing [cards]', () => {
    const [first] = ruleIds('present-continuous')
    const s = withCards(solidW1(), { [first]: card({ interval: 3 }) })
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row).toMatchObject({ status: 'learning', missing: ['cards'] })
    expect(tenseGapText(row)).toBe('Để chắc: ôn thẻ (còn 1 thẻ chưa nhớ)')
    expect(tenseRowLinks(row).cards).toBe(FLASHCARDS_HREF)
  })

  it('Ngưỡng nhớ ở biên: khoảng ôn đúng 7 + learning false nhớ; khoảng ôn 10 + learning true không; thẻ sai dạng không', () => {
    expect(isRememberedCard(card({ interval: 7, learning: false }))).toBe(true)
    expect(isRememberedCard(card({ interval: 6, learning: false }))).toBe(false)
    expect(isRememberedCard(card({ interval: 10, learning: true }))).toBe(false)
    expect(isRememberedCard({})).toBe(false)
    const [a, b] = ruleIds('present-continuous')
    const s = withCards(complete(after(), ['s1-t2-w1']), { [a]: card({ interval: 7 }), [b]: card({ interval: 10, learning: true }) })
    expect(rowOf(tenseMapRows(s, NOW), 'present-continuous').cards).toMatchObject({ scheduled: 2, remembered: 1 })
  })

  it('Bài hai thì: past-to-be "chắc", past-simple "đang học"; cùng % và cùng số lỗi', () => {
    let s = attempt(complete(after(), [...T1, 's1-t2-w1', 's1-t2-w2']), 'lesson-s1-t2-w2', 4, 5)
    s = allRemembered(s, 'past-to-be')
    const ps = ruleIds('past-simple')
    s = withCards(s, Object.fromEntries(ps.map((id, i) => [id, card({ interval: i < 2 ? 10 : 2 })])))
    const rows = tenseMapRows(s, NOW)
    const ptb = rowOf(rows, 'past-to-be')
    const pst = rowOf(rows, 'past-simple')
    expect(ptb.status).toBe('solid')
    expect(pst.status).toBe('learning')
    expect(pst.cards).toMatchObject({ total: ps.length, remembered: 2 })
    expect(pst.missing).toEqual(['cards'])
    expect(ptb.check?.percent).toBe(80)
    expect(pst.check).toEqual(ptb.check)
    expect(pst.openMistakes).toBe(ptb.openMistakes)
    expect(ptb.lessonId).toBe(pst.lessonId)
  })

  it('Thì không có thẻ: to-be "chắc", cards.total 0, "không có thẻ riêng"', () => {
    const s = attempt(complete(after(), ['s1-t1-w1']), 'lesson-s1-t1-w1', 5, 5)
    const row = rowOf(tenseMapRows(s, NOW), 'to-be')
    expect(row.status).toBe('solid')
    expect(row.cards.total).toBe(0)
    expect(tenseCardsLine(row)).toBe('Thẻ quy tắc: không có thẻ riêng')
  })

  it('Đếm lỗi: chỉ mục `thì` chưa thuộc, không phải từ đọc, hợp lệ; dòng là link Sổ lỗi', () => {
    const W = 's1-t2-w1'
    const s = withMistakes(complete(after(), T1), {
      q1: mistakeItem(W),
      q2: mistakeItem(W),
      q3: mistakeItem(W, { interval: 21, learning: false }),
      q4: mistakeItem(W, { tag: 'phát âm' }),
      q5: mistakeItem(W, { word: { text: 'cat', ipa: 'kæt' } }),
      q6: { tag: 'thì', lessonId: W },
      q7: mistakeItem('s1-t3-w1'),
    })
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row.openMistakes).toBe(2)
    expect(tenseMistakesLine(row.openMistakes)).toBe('Sổ lỗi: 2 câu chưa thuộc')
    expect(tenseRowLinks(row).mistakes).toBe(MISTAKES_HREF)
    expect(tenseMistakesLine(0)).toBe('Sổ lỗi: không có câu chưa thuộc')
    expect(rowOf(tenseMapRows(s, NOW), 'will').openMistakes).toBe(1)
  })

  it('Lần làm khác loại: mini-t2, ôn trộn mix-s1, comeback, owl, total 0 → % null, vẫn "chưa học"', () => {
    let s = attempt(after(), 'mini-t2', 10, 10)
    s = attempt(s, 'mix-s1', 20, 20)
    s = attempt(s, 'lesson-s1-t2-w1', 5, 5, day(4), 'comeback')
    s = attempt(s, 'lesson-s1-t2-w1', 5, 5, day(5), 'owl')
    s = attempt(s, 'lesson-s1-t2-w1', 0, 0, day(6))
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row.check).toBeNull()
    expect(row.status).toBe('new')
    expect(tenseCheckLine(row.check)).toEqual({ text: 'Kiểm tra bài: chưa kiểm tra', passed: false })
  })

  it('Có dấu hiệu trước khi tới bài: một lần kiểm tra 2/5 hoặc một lỗi `thì` → will "đang học"', () => {
    const byCheck = rowOf(tenseMapRows(attempt(after(), 'lesson-s1-t3-w1', 2, 5), NOW), 'will')
    expect(byCheck).toMatchObject({ status: 'learning', current: false, missing: ['done', 'check'] })
    expect(byCheck.check?.percent).toBe(40)
    const byMistake = rowOf(tenseMapRows(withMistakes(after(), { q: mistakeItem('s1-t3-w1') }), NOW), 'will')
    expect(byMistake).toMatchObject({ status: 'learning', missing: ['done', 'check', 'mistakes'] })
    expect(tenseGapText(byMistake)).toBe('Để chắc: đánh dấu bài xong · kiểm tra bài đạt 70% · ôn 1 câu Sổ lỗi')
  })

  it('Bài bị xếp qua: present-simple "chưa học", skipped true', () => {
    const s = applyStartLesson(after(), 's1-t2-w1', day(1))
    const rows = tenseMapRows(s, NOW)
    const skipped = rowOf(rows, 'present-simple')
    expect(skipped).toMatchObject({ status: 'new', skipped: true, current: false })
    expect(tenseSkippedNote(skipped)).toBe('Mũ Phân Loại đã xếp qua bài này. Vẫn học được bất cứ lúc nào.')
    expect(tenseRowLinks(skipped)).toMatchObject({ session: null, check: null })
    expect(rowOf(rows, 'present-continuous')).toMatchObject({ status: 'learning', skipped: false, current: true })
    expect(tenseSkippedNote(rowOf(rows, 'present-continuous'))).toBeNull()
    // Bài xếp qua đã bắt đầu học (có lần kiểm tra): "đang học", không còn ghi chú.
    const started = rowOf(tenseMapRows(attempt(s, 'lesson-s1-t1-w2', 2, 5), NOW), 'present-simple')
    expect(started).toMatchObject({ status: 'learning', skipped: true })
    expect(tenseSkippedNote(started)).toBeNull()
  })

  it('Sau Sân ga, bài chưa tới và chưa làm gì: "chưa học", chỉ có "Xem bài"', () => {
    const row = rowOf(tenseMapRows(complete(after(), T1), NOW), 'will')
    expect(row).toMatchObject({ status: 'new', current: false, skipped: false })
    expect(tenseRowLinks(row)).toEqual({
      lesson: '/roadmap/lesson/s1-t3-w1/grammar',
      session: null,
      check: null,
      mistakes: null,
      cards: null,
    })
    expect(tenseSkippedNote(row)).toBeNull()
  })

  it('Chỉ có thẻ vào lịch (bài chưa xong, chưa tới, chưa kiểm tra, 0 lỗi) → "đang học", thiếu thẻ, có Buổi ôn', () => {
    const s = withCards(after(), { [ruleIds('present-continuous')[0]]: card({ interval: 2 }) })
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row).toMatchObject({ status: 'learning', done: false, current: false, check: null, openMistakes: 0 })
    expect(row.missing.at(-1)).toBe('cards')
    expect(row.missing).toEqual(['done', 'check', 'cards'])
    expect(tenseRowLinks(row).session).toBe('/session?lesson=s1-t2-w1&step=lesson')
  })

  it('Bỏ đánh dấu xong: "đang học", missing [done], thẻ vẫn đếm từ srs.cards', () => {
    const s = complete(solidW1(), ['s1-t2-w1'], false)
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row).toMatchObject({ status: 'learning', done: false, missing: ['done'] })
    expect(row.cards).toMatchObject({ scheduled: 5, remembered: 5 })
    // Thẻ không vào phiên khi bài chưa xong: không báo "đến hạn", không link flashcard.
    const due = withCards(s, { [ruleIds('present-continuous')[0]]: card({ due: day(19).toISOString() }) })
    const dueRow = rowOf(tenseMapRows(due, NOW), 'present-continuous')
    expect(dueRow.cards.due).toBe(1)
    expect(tenseCardsLine(dueRow)).toBe('Thẻ quy tắc: nhớ 5/5 (ôn tiếp khi bài được đánh dấu xong)')
    expect(tenseRowLinks(dueRow).cards).toBeNull()
  })

  it('missing đúng thứ tự khi thiếu cả bốn: done → check → mistakes → cards', () => {
    let s = complete(after(), [...T1, 's1-t2-w1'])
    s = attempt(s, 'lesson-s1-t2-w1', 2, 5)
    s = withCards(s, { [ruleIds('present-continuous')[0]]: card({ interval: 1, learning: true }) })
    s = withMistakes(s, { q: mistakeItem('s1-t2-w1'), r: mistakeItem('s1-t2-w1') })
    s = complete(s, ['s1-t2-w1'], false)
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row.missing).toEqual(['done', 'check', 'mistakes', 'cards'])
    expect(tenseGapText(row)).toBe(
      'Để chắc: đánh dấu bài xong · kiểm tra bài đạt 70% · ôn 2 câu Sổ lỗi · ôn thẻ (còn 5 thẻ chưa nhớ)',
    )
  })

  it('Bài đã xong mà thẻ chưa vào lịch: thiếu thẻ, dòng thẻ "chưa vào ôn"', () => {
    const s = attempt(complete(after(), [...T1, 's1-t2-w1']), 'lesson-s1-t2-w1', 4, 5)
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row).toMatchObject({ status: 'learning', done: true, missing: ['cards'] })
    expect(tenseCardsLine(row)).toBe('Thẻ quy tắc: chưa vào ôn (thẻ vào ở phiên flashcard tới)')
    expect(tenseRowLinks(row).cards).toBe(FLASHCARDS_HREF)
    const notDone = rowOf(tenseMapRows(empty(), NOW), 'present-continuous')
    expect(tenseCardsLine(notDone)).toBe('Thẻ quy tắc: chưa vào ôn (thẻ vào ôn khi bài được đánh dấu xong)')
  })

  it('Thẻ đến hạn: 2 thẻ due ≤ now, 1 thẻ due > now → cards.due 2', () => {
    const [a, b, c] = ruleIds('present-continuous')
    const s = withCards(complete(after(), ['s1-t2-w1']), {
      [a]: card({ due: day(19).toISOString() }),
      [b]: card({ due: NOW.toISOString() }),
      [c]: card({ due: day(21).toISOString() }),
    })
    const row = rowOf(tenseMapRows(s, NOW), 'present-continuous')
    expect(row.cards).toMatchObject({ scheduled: 3, due: 2, remembered: 3 })
    expect(tenseCardsLine(row)).toBe('Thẻ quy tắc: nhớ 3/5 · 2 thẻ đến hạn')
    expect(tenseRowLinks(row).cards).toBe(FLASHCARDS_HREF)
  })

  it('Động từ bất quy tắc: 12 thẻ mở, 5 nhớ; trạng thái chỉ theo thẻ của thì; dòng khác không có verbs', () => {
    const verbIds = IRREGULAR_VERB_CARDS.slice(0, 12).map(ruleCardId)
    let s = attempt(complete(after(), [...T1, 's1-t2-w1', 's1-t2-w2', 's1-t2-w3']), 'lesson-s1-t2-w3', 5, 5)
    s = allRemembered(s, 'past-simple-irregular')
    s = withCards(s, Object.fromEntries(verbIds.map((id, i) => [id, card({ interval: i < 5 ? 10 : 1 })])))
    const rows = tenseMapRows(s, NOW)
    const row = rowOf(rows, 'past-simple-irregular')
    expect(row.verbs).toEqual({ total: IRREGULAR_VERB_CARDS.length, opened: 12, remembered: 5 })
    expect(row.status).toBe('solid')
    expect(row.cards.total).toBe(ruleIds('past-simple-irregular').length)
    expect(tenseVerbsLine(row.verbs!)).toBe(
      `Động từ bất quy tắc: nhớ 5/${IRREGULAR_VERB_CARDS.length} · đã mở 12/${IRREGULAR_VERB_CARDS.length}`,
    )
    expect(tenseVerbsLine({ total: 50, opened: 0, remembered: 0 })).toBe('Động từ bất quy tắc: chưa mở thẻ')
    for (const r of rows) if (r.tenseId !== 'past-simple-irregular') expect(r.verbs).toBeUndefined()
  })

  it('Dữ liệu hỏng: quizzes / srs / mistakes / progress là chuỗi hoặc null, thẻ là {} → như store rỗng', () => {
    const expected = tenseMapRows(empty(), NOW)
    for (const bad of ['oops', null]) {
      const s: Store = { schemaVersion: CURRENT_VERSION, data: { quizzes: bad, srs: bad, mistakes: bad, progress: bad } }
      expect(tenseMapRows(s, NOW)).toEqual(expected)
    }
    const nested: Store = {
      schemaVersion: CURRENT_VERSION,
      data: { quizzes: { attempts: 'x' }, srs: { cards: null }, mistakes: { items: [] }, progress: { lessons: 3 } },
    }
    expect(tenseMapRows(nested, NOW)).toEqual(expected)
    const broken = withCards(empty(), Object.fromEntries(ruleIds('present-continuous').map((id) => [id, {}])))
    expect(rowOf(tenseMapRows(broken, NOW), 'present-continuous').cards).toMatchObject({ scheduled: 0, remembered: 0, due: 0 })
    expect(rowOf(tenseMapRows(broken, NOW), 'present-continuous').status).toBe('new')
  })

  it('Thẻ Luyện tập: 3 chắc, 4 đang học → "3 chắc · 4 đang học · 8 chưa học (15 thì Năm 1)"', () => {
    const rows = tenseMapRows(empty(), NOW).map((r, i) => ({
      ...r,
      status: i < 3 ? ('solid' as const) : i < 7 ? ('learning' as const) : ('new' as const),
    }))
    expect(tenseMapSummary(rows)).toEqual({ solid: 3, learning: 4, new: 8 })
    expect(tenseMapBlurb(rows)).toBe('3 chắc · 4 đang học · 8 chưa học (15 thì Năm 1)')
  })

  it('không ghi store', () => {
    const s = solidW1()
    const snapshot = JSON.stringify(s)
    tenseMapRows(s, NOW)
    expect(JSON.stringify(s)).toBe(snapshot)
  })
})
