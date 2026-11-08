import { describe, expect, it } from 'vitest'

import { allLessons } from '@/data/roadmap'
import { getBrick, hasBrickContent } from '@/data/foundation/content'
import type { BrickId } from '@/data/foundation'
import { FUNCTION_WORD_GATES, loadWords, STARTER_WORD_IDS, type Word, type WordList } from '@/data/vocab'
import { completeBrick, markRowTested, nextBrickId, resumeFoundation, skipFoundation } from '@/lib/foundation'
import { recordAttempt } from '@/lib/placement/store'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import { addToSrs, deleteSavedWord, readSavedWords, saveWord, savedWordId } from '@/lib/saved-words'
import { newWordListFor, sessionPlan } from '@/lib/sessions'
import {
  addCard,
  clozeText,
  gradeCard,
  limitedProgress,
  markCardKnown,
  readSrs,
  type ReviewedItem,
  type SessionItem,
  type SrsCard,
} from '@/lib/srs'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  buildStudySession,
  flashcardGates,
  flashcardSummary,
  functionWordCloze,
  HEAVY_REVIEW_NEW_WORDS,
  HEAVY_REVIEW_THRESHOLD,
  lockedNewWordIds,
  NEW_WORDS_FOUNDATION,
  NEW_WORDS_T1,
  newPerDayFor,
  newWordOptions,
  preferredNewWordIds,
  rankLabel,
  ruleCardId,
  ruleStudyWords,
} from './flashcard-session'

const words = await loadWords()

/** Ngày `d` tháng 11/2026, giờ máy (TZ=Asia/Ho_Chi_Minh khi chạy `npm test`). */
const day = (d: number, h = 9, m = 0) => new Date(2026, 10, d, h, m)
const NOW = day(10)

const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
const themeWordIdsOf = (id: BrickId) => getBrick(id)?.themeWordIds ?? []

function completeLessons(store: Store, ids: readonly string[]): Store {
  return ids.reduce((s, id) => setLessonCompleted(s, id, true, day(1)), store)
}

const lessonIds = (pred: (id: string) => boolean) => allLessons().map((l) => l.id).filter(pred)

/** Store có `n` thẻ đến hạn (hôm qua), giới thiệu từ trước. */
function withDueCards(store: Store, n: number, at: Date = NOW): Store {
  const due = new Date(at.getFullYear(), at.getMonth(), at.getDate() - 1).toISOString()
  const intro = new Date(at.getFullYear(), at.getMonth(), at.getDate() - 20).toISOString()
  const cards: Record<string, SrsCard> = {}
  for (const w of words.filter((x) => x.list === 'tsl').slice(0, n)) {
    cards[w.id] = { due, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: intro, known: false, updatedAt: due }
  }
  return { ...store, data: { ...store.data, srs: { cards } } }
}

/** Phiên như `FlashcardSession` / tóm tắt Luyện tập dựng: kế hoạch từ `newWordOptions` (hàm `useNewWordOptions` bọc). */
function session(store: Store, now: Date = NOW, firstList: WordList = newWordListFor(store)) {
  const { newPerDay, preferIds } = newWordOptions(store, now, themeWordIdsOf, () => [])
  return buildStudySession(readSrs(store), words, readSavedWords(store), now, firstList, { newPerDay, preferIds })
}

const wordOf = (id: string) => id.replace(/^(ngsl|tsl)-/, '')

const ruleCardsOf = (id: BrickId) => getBrick(id)?.ruleCards ?? []

/** Phiên đủ như `FlashcardSession` dựng từ story 24: kèm id hư từ còn khoá và thẻ quy tắc. */
function fullSession(store: Store, now: Date = NOW, firstList: WordList = newWordListFor(store)) {
  const plan = newWordOptions(store, now, themeWordIdsOf, ruleCardsOf)
  return buildStudySession(readSrs(store), words, readSavedWords(store), now, firstList, plan)
}

const ALL_FUNCTION_IDS = Object.keys(FUNCTION_WORD_GATES)
const isFunctionId = (id: string) => Object.hasOwn(FUNCTION_WORD_GATES, id)
const openedIn = (store: Store) => ALL_FUNCTION_IDS.filter((id) => !lockedNewWordIds(store).has(id)).map(wordOf).sort()
const ids = (queue: readonly SessionItem[]) => queue.map((i) => i.word.id)
const LESSON_LOCKED = ['can', 'could', 'do', 'less', 'may', 'might', 'more', 'most', 'must', 'should', 'since', 'than', 'when', 'will', 'would']

/** Thẻ chưa tới hạn (giới thiệu từ lâu), để từ không còn là từ mới. */
function withFutureCards(store: Store, cardIds: readonly string[]): Store {
  const due = day(30).toISOString()
  const intro = new Date(2026, 9, 1).toISOString()
  const cards: Record<string, SrsCard> = { ...(readSrs(store).cards as Record<string, SrsCard>) }
  for (const id of cardIds) {
    cards[id] = { due, interval: 20, ease: 2.5, reps: 3, lapses: 0, learning: false, introducedAt: intro, known: false, updatedAt: intro }
  }
  return { ...store, data: { ...store.data, srs: { cards } } }
}

describe('newPerDayFor — số từ mới mỗi ngày', () => {
  it('ngày 1 ở Sân ga: 5, không tồn ôn', () => {
    expect(newPerDayFor(empty(), NOW)).toEqual({ count: NEW_WORDS_FOUNDATION, heavyReview: false })
    expect(NEW_WORDS_FOUNDATION).toBe(5)
  })

  it('foundation thiếu hoặc sai dạng → mặc định (đang ở Sân ga) → 5', () => {
    expect(newPerDayFor({ schemaVersion: CURRENT_VERSION, data: { foundation: [1] } }, NOW).count).toBe(5)
    expect(newPerDayFor({ schemaVersion: CURRENT_VERSION, data: { foundation: 'x' } }, NOW).count).toBe(5)
  })

  it('sau Sân ga, bài hiện tại thuộc T1 (s1-t1-w1 hoặc s1-t1-w2): 8', () => {
    const skipped = skipFoundation(empty(), day(3))
    expect(newPerDayFor(skipped, NOW).count).toBe(NEW_WORDS_T1)
    expect(newPerDayFor(completeLessons(skipped, ['s1-t1-w1']), NOW)).toEqual({ count: 8, heavyReview: false })
  })

  it('T2 trở đi, chặng 2, hoặc đã xong lộ trình: 10', () => {
    const skipped = skipFoundation(empty(), day(3))
    const t2 = completeLessons(skipped, lessonIds((id) => id.startsWith('s1-t1-')))
    expect(newPerDayFor(t2, NOW).count).toBe(10)
    const stage2 = completeLessons(skipped, lessonIds((id) => id.startsWith('s1-')))
    expect(newPerDayFor(stage2, NOW).count).toBe(10)
    const all = completeLessons(skipped, lessonIds(() => true))
    expect(newPerDayFor(all, NOW).count).toBe(10)
  })

  it('quay lại Sân ga sau khi bỏ qua: 5', () => {
    const resumed = resumeFoundation(skipFoundation(empty(), day(3)), day(5))
    expect(newPerDayFor(resumed, NOW).count).toBe(5)
  })

  it('tồn ôn: 41 thẻ đến hạn → 3 + heavyReview; đúng 40 → 5, không nhắc', () => {
    expect(HEAVY_REVIEW_THRESHOLD).toBe(40)
    expect(newPerDayFor(withDueCards(empty(), 41), NOW)).toEqual({ count: HEAVY_REVIEW_NEW_WORDS, heavyReview: true })
    expect(newPerDayFor(withDueCards(empty(), 40), NOW)).toEqual({ count: 5, heavyReview: false })
    // Sau Sân ga cũng vậy: min(3, 10).
    const t2 = completeLessons(skipFoundation(empty(), day(3)), lessonIds((id) => id.startsWith('s1-t1-')))
    expect(newPerDayFor(withDueCards(t2, 41), NOW)).toEqual({ count: 3, heavyReview: true })
  })

  it('thẻ phiên không hiện là thẻ ôn không tính tồn ôn: thẻ riêng mồ côi, thẻ added chưa chấm', () => {
    // 41 thẻ riêng `saved-…` đến hạn nhưng mục lưu đã xoá (hoặc không có) → phiên không hiện, không ôn bớt được.
    let store = empty()
    const ids: string[] = []
    for (let n = 0; n < 41; n++) {
      store = saveWord(store, { word: `cụm ${n} mới`, sentence: `câu ${n}`, source: { title: 't', url: '/x' } }, day(1))
      const id = savedWordId(`cụm ${n} mới`, day(1))
      const added = addToSrs(store, id, { meaningVi: 'nghĩa' }, day(1))
      if (!added.ok) throw new Error(added.reason)
      store = gradeCard(added.store, added.cardId, 'good', day(1))
      ids.push(id)
    }
    expect(newPerDayFor(store, NOW)).toEqual({ count: 3, heavyReview: true })
    for (const id of ids) store = deleteSavedWord(store, id, day(2))
    expect(newPerDayFor(store, NOW)).toEqual({ count: 5, heavyReview: false })
    expect(session(store).dueCount).toBe(0)
    // 41 từ NGSL Huy tự thêm, chưa chấm: phiên hiện như từ mới, không phải thẻ ôn.
    let added = empty()
    for (const w of words.filter((x) => x.list === 'tsl').slice(0, 41)) added = addCard(added, w.id, day(9))
    expect(newPerDayFor(added, NOW)).toEqual({ count: 5, heavyReview: false })
  })

  it('ôn bớt trong ngày: từ 41 thẻ còn 40 → quota trở về 5, hết nhắc', () => {
    let store = withDueCards(empty(), 41)
    const first = Object.keys(readSrs(store).cards)[0]
    store = gradeCard(store, first, 'good', NOW)
    expect(newPerDayFor(store, NOW)).toEqual({ count: 5, heavyReview: false })
  })
})

describe('preferredNewWordIds — từ mới lấy trước', () => {
  it('chưa xong viên nào → đúng danh sách khởi đầu', () => {
    expect(preferredNewWordIds(empty(), themeWordIdsOf)).toEqual([...STARTER_WORD_IDS])
  })

  it('F01 xong hôm qua, F02 xong hôm nay → 5 từ F02, rồi 5 từ F01, rồi danh sách khởi đầu (bỏ trùng)', () => {
    const store = completeBrick(completeBrick(empty(), 'F01', day(9)), 'F02', day(10))
    const ids = preferredNewWordIds(store, themeWordIdsOf)
    const f01 = getBrick('F01')!.themeWordIds
    const f02 = getBrick('F02')!.themeWordIds
    expect(ids.slice(0, 5)).toEqual([...f02])
    expect(ids.slice(0, 2)).toEqual(['ngsl-name', 'ngsl-letter'])
    expect(ids.slice(5, 10)).toEqual([...f01])
    expect(ids.slice(10)).toEqual(STARTER_WORD_IDS.filter((id) => !f01.includes(id) && !f02.includes(id)))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('học lại F01 sau F02 → F01 lên trước; bằng giờ thì theo F01 → F18', () => {
    const relearned = completeBrick(completeBrick(completeBrick(empty(), 'F01', day(8)), 'F02', day(9)), 'F01', day(10))
    expect(preferredNewWordIds(relearned, themeWordIdsOf).slice(0, 5)).toEqual([...getBrick('F01')!.themeWordIds])
    const same = completeBrick(completeBrick(empty(), 'F02', day(9)), 'F01', day(9))
    expect(preferredNewWordIds(same, themeWordIdsOf).slice(0, 5)).toEqual([...getBrick('F01')!.themeWordIds])
  })

  it('viên không có nội dung không góp từ', () => {
    const store = completeBrick(empty(), 'F17', day(9))
    expect(getBrick('F17')).toBeUndefined()
    expect(preferredNewWordIds(store, themeWordIdsOf)).toEqual([...STARTER_WORD_IDS])
  })

  it('hàng A qua kiểm tra, chưa học viên nào → chỉ danh sách khởi đầu', () => {
    const store = markRowTested(empty(), 'A', 8, 8, day(9))
    expect(preferredNewWordIds(store, themeWordIdsOf)).toEqual([...STARTER_WORD_IDS])
  })
})

describe('phiên ôn theo kế hoạch (buildStudySession + newPerDayFor + preferredNewWordIds)', () => {
  it('ngày 1 ở Sân ga: 5 thẻ Làm quen day, week, month, year, hour; tóm tắt Luyện tập cùng số', () => {
    const s = session(empty())
    expect(s.queue.map((i) => wordOf(i.word.id))).toEqual(['day', 'week', 'month', 'year', 'hour'])
    expect(s.queue.every((i) => i.kind === 'new' && i.intro === true)).toBe(true)
    expect(flashcardSummary(s)).toBe('0 thẻ đến hạn · 5 từ mới hôm nay')
  })

  it('vừa học xong F02 → từ mới đầu tiên là từ chủ đề của F02', () => {
    const store = completeBrick(completeBrick(empty(), 'F01', day(9)), 'F02', day(10, 8))
    expect(session(store).queue.map((i) => i.word.id)).toEqual([...getBrick('F02')!.themeWordIds])
  })

  it('dựng phiên không ghi store (thoát trước khi bấm "Đã xem" thì lần sau vẫn là Làm quen)', () => {
    // Phần "chỉ ghi khi chấm" nằm ở component (không có test component); ở đây chỉ chắc phần lib không ghi gì.
    const store = empty()
    const before = structuredClone(store)
    expect(session(store).queue[0]).toMatchObject({ intro: true, word: { id: 'ngsl-day' } })
    expect(store).toEqual(before)
  })

  it('"Đã xem" 5 từ hôm nay → không còn từ mới hôm nay; hôm sau 5 từ đó là "Ôn lại" (review)', () => {
    let store = empty()
    for (const id of STARTER_WORD_IDS.slice(0, 5)) store = gradeCard(store, id, 'good', NOW)
    const today = session(store, day(10, 21))
    expect(today.newCount).toBe(0)
    expect(today.queue).toEqual([])
    const tomorrow = session(store, day(11))
    // Thẻ ôn cùng hạn xếp theo hạng như cũ (year #58 trước day #85).
    const reviews = tomorrow.queue.filter((i) => i.kind === 'review').map((i) => i.word.id)
    expect([...reviews].sort()).toEqual([...STARTER_WORD_IDS.slice(0, 5)].sort())
    expect(tomorrow.queue.filter((i) => i.kind === 'review').every((i) => i.intro === undefined)).toBe(true)
    expect(tomorrow.newCount).toBe(5)
  })

  it('giới thiệu 8 từ trên máy khác hôm nay, đang ở Sân ga → 0 từ mới, không âm', () => {
    let store = empty()
    for (const id of STARTER_WORD_IDS.slice(0, 8)) store = gradeCard(store, id, 'good', day(10, 7))
    const s = session(store)
    expect(s.newCount).toBe(0)
    expect(s.introducedToday).toBe(8)
  })

  it('tồn ôn 41 thẻ ở Sân ga → chỉ 3 từ mới', () => {
    const s = session(withDueCards(empty(), 41))
    expect(s.queue.filter((i) => i.kind === 'new').map((i) => wordOf(i.word.id))).toEqual(['day', 'week', 'month'])
  })

  it('firstList tsl, còn từ khởi đầu chưa học → từ khởi đầu trước, rồi TSL hạng 1, 2, …', () => {
    let store = completeLessons(skipFoundation(empty(), day(3)), lessonIds((id) => id.startsWith('s1-')))
    for (const id of STARTER_WORD_IDS.slice(0, 58)) store = markCardKnown(store, id, day(2))
    expect(newWordListFor(store)).toBe('tsl')
    const tsl = words.filter((w: Word) => w.list === 'tsl')
    expect(session(store, NOW, 'tsl').queue.map((i) => i.word.id)).toEqual([
      ...STARTER_WORD_IDS.slice(58),
      ...tsl.slice(0, 8).map((w) => w.id),
    ])
  })

  it('ngày lười ở Sân ga (limit 3, preferNew): 3 thẻ Làm quen, xong sau 3 lần "Đã xem"', () => {
    let store = empty()
    const reviewed: ReviewedItem[] = []
    for (let n = 0; n < 3; n++) {
      const current = limitedProgress(session(store).queue, reviewed, { limit: 3, preferNew: true }).current
      expect(current).toMatchObject({ kind: 'new', intro: true, word: { id: STARTER_WORD_IDS[n] } })
      store = gradeCard(store, current!.word.id, 'good', NOW)
      reviewed.push({ wordId: current!.word.id, kind: current!.kind })
    }
    const done = limitedProgress(session(store).queue, reviewed, { limit: 3, preferNew: true })
    expect(done).toMatchObject({ current: undefined, count: 3, limitReached: true })
  })
})

describe('flashcardGates — cổng hiển thị', () => {
  it('đang ở Sân ga, chưa qua F03 → ẩn IPA, âm tiết, từ loại', () => {
    expect(flashcardGates(empty())).toEqual({ ipa: false, stress: false, pos: false })
    expect(flashcardGates(completeBrick(empty(), 'F01', day(9)))).toEqual({ ipa: false, stress: false, pos: false })
  })

  it('hàng A qua Soát vé → IPA và âm tiết hiện, từ loại ẩn', () => {
    expect(flashcardGates(markRowTested(empty(), 'A', 6, 8, day(9)))).toEqual({ ipa: true, stress: true, pos: false })
  })

  it('xong F03 → chỉ IPA', () => {
    expect(flashcardGates(completeBrick(empty(), 'F03', day(9)))).toEqual({ ipa: true, stress: false, pos: false })
  })

  it('đã bỏ qua Sân ga, kể cả sau khi quay lại → hiện đủ', () => {
    const skipped = skipFoundation(empty(), day(3))
    expect(flashcardGates(skipped)).toEqual({ ipa: true, stress: true, pos: true })
    expect(flashcardGates(resumeFoundation(skipped, day(5)))).toEqual({ ipa: true, stress: true, pos: true })
  })
})

describe('rankLabel', () => {
  it('NGSL → "Từ phổ biến #n", TSL → "Từ TOEIC #n"', () => {
    expect(rankLabel({ list: 'ngsl', rank: 12 })).toBe('Từ phổ biến #12')
    expect(rankLabel({ list: 'tsl', rank: 5 })).toBe('Từ TOEIC #5')
    const dayWord = words.find((w) => w.id === 'ngsl-day')!
    expect(rankLabel(dayWord)).toBe('Từ phổ biến #85')
  })
})

describe('lockedNewWordIds — cổng hư từ (story 24)', () => {
  it('ngày 1 ở Sân ga: khoá đủ 86 id; từ mới chỉ là từ khởi đầu, không hư từ', () => {
    expect(lockedNewWordIds(empty())).toEqual(new Set(ALL_FUNCTION_IDS))
    expect(ALL_FUNCTION_IDS).toHaveLength(86)
    const s = fullSession(empty())
    expect(ids(s.queue)).toEqual(STARTER_WORD_IDS.slice(0, 5))
  })

  it('foundation thiếu / sai dạng → mặc định → khoá đủ', () => {
    for (const foundation of [[1], 'x', null]) {
      expect(lockedNewWordIds({ schemaVersion: CURRENT_VERSION, data: { foundation } }).size).toBe(86)
    }
  })

  it('học xong F11 → the, a mở; 84 id còn khoá', () => {
    const store = completeBrick(empty(), 'F11', day(9))
    expect(openedIn(store)).toEqual(['a', 'the'])
    expect(lockedNewWordIds(store).size).toBe(84)
  })

  it('hàng B qua kiểm tra → 7 đại từ + the, a, this, that mở; be, have chưa', () => {
    const store = markRowTested(empty(), 'B', 7, 8, day(9))
    expect(openedIn(store)).toEqual(['a', 'he', 'i', 'it', 'she', 'that', 'the', 'they', 'this', 'we', 'you'])
    expect(lockedNewWordIds(store).has('ngsl-be')).toBe(true)
    expect(lockedNewWordIds(store).has('ngsl-have')).toBe(true)
  })

  it('bỏ qua Sân ga, chưa xong bài nào → mọi cổng viên + tường mở; chỉ còn 15 từ của bài', () => {
    const store = skipFoundation(empty(), day(3))
    expect([...lockedNewWordIds(store)].map(wordOf).sort()).toEqual(LESSON_LOCKED)
  })

  it('quay lại Sân ga sau khi bỏ qua → cổng đã mở vẫn mở', () => {
    const store = resumeFoundation(skipFoundation(empty(), day(3)), day(5))
    expect([...lockedNewWordIds(store)].map(wordOf).sort()).toEqual(LESSON_LOCKED)
  })

  it('qua tường (4 hàng qua kiểm tra) → mọi cổng viên + tường mở', () => {
    let store = empty()
    for (const row of ['A', 'B', 'C', 'D'] as const) store = markRowTested(store, row, 8, 8, day(9))
    expect([...lockedNewWordIds(store)].map(wordOf).sort()).toEqual(LESSON_LOCKED)
  })

  it('bài s1-t1-w3 xong → do, when mở; will vẫn khoá. Bỏ đánh dấu → khoá lại, thẻ đã có giữ nguyên', () => {
    const skipped = skipFoundation(empty(), day(3))
    const done = completeLessons(skipped, ['s1-t1-w3'])
    expect(lockedNewWordIds(done).has('ngsl-do')).toBe(false)
    expect(lockedNewWordIds(done).has('ngsl-when')).toBe(false)
    expect(lockedNewWordIds(done).has('ngsl-will')).toBe(true)
    const withCard = gradeCard(done, 'ngsl-do', 'good', day(9))
    const undone = setLessonCompleted(withCard, 's1-t1-w3', false, day(9, 10))
    expect(lockedNewWordIds(undone).has('ngsl-do')).toBe(true)
    expect(readSrs(undone).cards['ngsl-do']).toEqual(readSrs(withCard).cards['ngsl-do'])
    // Hôm sau thẻ do vẫn là thẻ ôn.
    expect(fullSession(undone, day(10)).queue.find((i) => i.word.id === 'ngsl-do')).toMatchObject({ kind: 'review' })
  })

  it('Mũ xếp bắt đầu s1-t2-w1 → bài T1 bị bỏ qua: do, when mở; will vẫn khoá', () => {
    const { store } = recordAttempt(skipFoundation(empty(), day(3)), { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, day(4), 's1-t2-w1')
    expect(lockedNewWordIds(store).has('ngsl-do')).toBe(false)
    expect(lockedNewWordIds(store).has('ngsl-when')).toBe(false)
    expect(lockedNewWordIds(store).has('ngsl-will')).toBe(true)
  })
})

describe('phiên ôn với cổng hư từ và thẻ quy tắc (story 24)', () => {
  it('ở Sân ga nhiều ngày: không hư từ nào được giới thiệu khi cổng chưa mở', () => {
    let store = empty()
    for (let d = 1; d <= 20; d++) {
      const at = new Date(2026, 10, d, 9)
      const s = fullSession(store, at)
      for (const item of s.queue) {
        if (item.kind === 'new') expect(isFunctionId(item.word.id), item.word.id).toBe(false)
        store = gradeCard(store, item.word.id, 'good', at)
      }
    }
    expect(Object.keys(readSrs(store).cards).filter(isFunctionId)).toEqual([])
  })

  it('giữ thứ tự NGSL: bỏ qua Sân ga, mọi từ khởi đầu và thực từ NGSL ≤ 400 đã có thẻ → the, be, and, of… theo hạng, bỏ do và từ còn khoá', () => {
    const content = words.filter((w) => w.list === 'ngsl' && w.rank <= 400 && !isFunctionId(w.id)).map((w) => w.id)
    const store = withFutureCards(skipFoundation(empty(), day(3)), [...STARTER_WORD_IDS, ...content])
    const plan = newWordOptions(store, NOW, themeWordIdsOf, ruleCardsOf)
    const s = buildStudySession(readSrs(store), words, {}, NOW, 'ngsl', { ...plan, newPerDay: 80 })
    const fresh = s.queue.filter((i) => i.kind === 'new').map((i) => i.word.id)
    expect(fresh.slice(0, 4)).toEqual(['ngsl-the', 'ngsl-be', 'ngsl-and', 'ngsl-of'])
    const opened = ALL_FUNCTION_IDS.filter((id) => !plan.lockedIds.has(id))
    const rankOf = (id: string) => words.find((w) => w.id === id)!.rank
    expect(fresh.slice(0, opened.length)).toEqual([...opened].sort((a, b) => rankOf(a) - rankOf(b)))
    expect(fresh).not.toContain('ngsl-do')
    expect(rankOf(fresh[opened.length])).toBeGreaterThan(400)
    // Quota thật (T1: 8) lấy đúng 8 từ đầu.
    expect(ids(fullSession(store).queue)).toEqual(fresh.slice(0, 8))
  })

  it('preferIds chứa id đang khoá → bỏ qua id đó, phần còn lại không đổi', () => {
    const store = empty()
    const plan = newWordOptions(store, NOW, themeWordIdsOf, ruleCardsOf)
    const s = buildStudySession(readSrs(store), words, {}, NOW, 'ngsl', { ...plan, preferIds: ['ngsl-the', ...plan.preferIds] })
    expect(ids(s.queue)).toEqual(STARTER_WORD_IDS.slice(0, 5))
  })

  it('thẻ cũ của hư từ (ngsl-the đến hạn, F11 chưa dạy) → vẫn là thẻ ôn, dạng điền câu', () => {
    const due = day(9).toISOString()
    const store: Store = {
      ...empty(),
      data: { srs: { cards: { 'ngsl-the': { due, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: due, known: false, updatedAt: due } } } },
    }
    expect(lockedNewWordIds(store).has('ngsl-the')).toBe(true)
    const item = fullSession(store).queue[0]
    expect(item).toMatchObject({ kind: 'review', word: { id: 'ngsl-the' } })
    const cloze = functionWordCloze(item.word as Word)
    expect(cloze && clozeText(cloze)).toBe('___ meeting starts at nine.')
    expect(cloze?.answer).toBe('The')
  })

  it('functionWordCloze: be → "She ___ a nurse.", đáp án is; thực từ → null', () => {
    const be = words.find((w) => w.id === 'ngsl-be')!
    expect(clozeText(functionWordCloze(be)!)).toBe('She ___ a nurse.')
    expect(functionWordCloze(be)?.answer).toBe('is')
    expect(functionWordCloze(words.find((w) => w.id === 'ngsl-family')!)).toBeNull()
    expect(functionWordCloze({ id: 'ngsl-it', exampleEn: "It's cold." })).toBeNull()
  })

  it('F01 xong hôm nay, quota 5 → 5 từ mới (Làm quen) → rule:f01-1, rule:f01-2; introducedToday không cộng thẻ quy tắc', () => {
    const store = completeBrick(empty(), 'F01', day(10, 8))
    const s = fullSession(store)
    expect(s.queue.map((i) => [i.word.id, i.kind, i.intro === true])).toEqual([
      ...getBrick('F01')!.themeWordIds.map((id) => [id, 'new', true]),
      ['rule:f01-1', 'new', false],
      ['rule:f01-2', 'new', false],
    ])
    expect(s.newCount).toBe(7)
    // Chấm hết: quota 5 từ mới tính đúng, thẻ quy tắc không chiếm quota.
    let after = store
    for (const item of s.queue) after = gradeCard(after, item.word.id, 'good', NOW)
    const later = fullSession(after, day(10, 20))
    expect(later.introducedToday).toBe(5)
    expect(later.queue).toEqual([])
    // Hôm sau thẻ quy tắc là thẻ ôn.
    const tomorrow = fullSession(after, day(11))
    expect(tomorrow.queue.filter((i) => i.word.id.startsWith('rule:')).map((i) => i.kind)).toEqual(['review', 'review'])
  })

  it('hàng A qua bằng kiểm tra (không học) hay bỏ qua Sân ga → không có thẻ quy tắc', () => {
    expect(ruleStudyWords(markRowTested(empty(), 'A', 8, 8, day(9)), ruleCardsOf)).toEqual([])
    expect(ruleStudyWords(skipFoundation(empty(), day(9)), ruleCardsOf)).toEqual([])
  })

  it('ruleStudyWords: viên học xong theo F01 → F18, id rule:fNN-n, word = answer', () => {
    const store = completeBrick(completeBrick(empty(), 'F02', day(8)), 'F01', day(9))
    const rules = ruleStudyWords(store, ruleCardsOf)
    expect(rules.map((r) => r.id)).toEqual(['rule:f01-1', 'rule:f01-2', 'rule:f02-1', 'rule:f02-2'])
    const first = getBrick('F01')!.ruleCards[0]
    expect(rules[0]).toEqual({ id: ruleCardId(first), rule: true, word: first.answer, brickId: 'F01', cloze: first.cloze, answer: first.answer, vi: first.vi })
  })

  it('thẻ quy tắc mồ côi (rule:f99-1, viên chưa học) không hiện, không đếm tồn ôn, vẫn nằm trong store', () => {
    const due = day(9).toISOString()
    const c = { due, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: due, known: false, updatedAt: due }
    const cards: Record<string, SrsCard> = {}
    for (let i = 1; i <= 41; i++) cards[`rule:f99-${i}`] = c
    cards['rule:f01-1'] = c
    const store: Store = { ...empty(), data: { srs: { cards } } }
    const s = fullSession(store)
    expect(s.queue.some((i) => i.word.id.startsWith('rule:'))).toBe(false)
    expect(newPerDayFor(store, NOW, ruleCardsOf)).toEqual({ count: 5, heavyReview: false })
    expect(Object.keys(readSrs(store).cards)).toHaveLength(42)
    // F01 học xong → rule:f01-1 hiện là thẻ ôn và được đếm.
    const learned = completeBrick(store, 'F01', day(9))
    expect(fullSession(learned).queue.find((i) => i.word.id === 'rule:f01-1')).toMatchObject({ kind: 'review' })
    expect(fullSession(learned).dueCount).toBe(1)
  })

  it('ngày lười (limit 3, preferNew), F02 xong hôm nay → 3 từ mới trước; thẻ quy tắc chỉ hiện khi hết từ mới', () => {
    let store = completeBrick(empty(), 'F02', day(10, 8))
    const reviewed: ReviewedItem[] = []
    for (let n = 0; n < 3; n++) {
      const current = limitedProgress(fullSession(store).queue, reviewed, { limit: 3, preferNew: true }).current
      expect(current).toMatchObject({ kind: 'new', intro: true, word: { id: getBrick('F02')!.themeWordIds[n] } })
      store = gradeCard(store, current!.word.id, 'good', NOW)
      reviewed.push({ wordId: current!.word.id, kind: current!.kind })
    }
    expect(limitedProgress(fullSession(store).queue, reviewed, { limit: 3, preferNew: true })).toMatchObject({ current: undefined, limitReached: true })
    // Đã dùng hết quota 5 từ mới hôm nay → thẻ quy tắc là từ mới đầu tiên của ngày lười.
    for (const id of getBrick('F02')!.themeWordIds.slice(3)) store = gradeCard(store, id, 'good', NOW)
    const lazy = limitedProgress(fullSession(store).queue, [], { limit: 3, preferNew: true })
    expect(lazy.current?.word.id).toBe('rule:f02-1')
  })

  it('tóm tắt Luyện tập cùng số với phiên (thẻ quy tắc mới tính vào từ mới)', () => {
    const store = completeBrick(empty(), 'F01', day(10, 8))
    expect(flashcardSummary(fullSession(store))).toBe('0 thẻ đến hạn · 7 từ mới hôm nay')
  })
})

describe('hàng B có nội dung (story 25, getBrick thật)', () => {
  const ROW_A: readonly BrickId[] = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06']
  const ROW_B: readonly BrickId[] = ['F07', 'F08', 'F09', 'F10', 'F11', 'F12']
  const doneAll = (ids: readonly BrickId[], s: Store = empty(), d = 1) =>
    ids.reduce((acc, id, i) => completeBrick(acc, id, day(d, 8 + i)), s)

  it('F01–F06 xong → viên tiếp theo F07, buổi 30\' chạy F07', () => {
    const store = doneAll(ROW_A)
    expect(nextBrickId(store, hasBrickContent)).toBe('F07')
    expect(sessionPlan(store, hasBrickContent)).toMatchObject({ mode: 'foundation', brickId: 'F07', review: false })
  })

  it('xong F07 → nhãn từ loại hiện (pos), từ mới bắt đầu bằng 5 từ chủ đề F07, hôm đó có thẻ rule:f07-n', () => {
    const store = completeBrick(doneAll(ROW_A, empty(), 5), 'F07', day(10, 8))
    expect(flashcardGates(store).pos).toBe(true)
    const f07 = getBrick('F07')!.themeWordIds
    expect(preferredNewWordIds(store, themeWordIdsOf).slice(0, 5)).toEqual([...f07])
    const s = fullSession(store)
    expect(ids(s.queue).slice(0, 5)).toEqual([...f07])
    expect(ids(s.queue).filter((id) => id.startsWith('rule:f07-'))).toEqual(['rule:f07-1', 'rule:f07-2'])
  })

  it('xong lần lượt F09, F11, F12 → lockedNewWordIds bớt đúng 7 / 2 / 2 id', () => {
    let store = empty()
    const sizes = [lockedNewWordIds(store).size]
    for (const id of ['F09', 'F11', 'F12'] as const) {
      store = completeBrick(store, id, day(9))
      sizes.push(lockedNewWordIds(store).size)
    }
    expect(sizes).toEqual([86, 79, 77, 75])
    expect(openedIn(store)).toEqual(['a', 'he', 'i', 'it', 'she', 'that', 'the', 'they', 'this', 'we', 'you'])
  })

  it('học xong F09 → đại từ (you, it) được giới thiệu dưới dạng thẻ điền câu', () => {
    let store = completeBrick(empty(), 'F09', day(9))
    // Mọi từ khởi đầu, từ chủ đề F09 và thực từ NGSL đứng trước đã có thẻ → từ mới kế tiếp là đại từ theo hạng.
    const before = words.filter((w) => w.list === 'ngsl' && w.rank <= 30 && !isFunctionId(w.id)).map((w) => w.id)
    store = withFutureCards(store, [...STARTER_WORD_IDS, ...getBrick('F09')!.themeWordIds, ...before])
    const s = fullSession(store)
    const opened = ids(s.queue).filter(isFunctionId)
    expect(opened.length).toBeGreaterThan(0)
    for (const id of opened) {
      expect(FUNCTION_WORD_GATES[id].opensAfter, id).toEqual({ brick: 'F09' })
      const w = words.find((x) => x.id === id)!
      expect(functionWordCloze(w), id).not.toBeNull()
    }
    expect(opened).toEqual(expect.arrayContaining(['ngsl-you', 'ngsl-it']))
  })

  it('ruleStudyWords sau khi xong F07–F12 → rule:f07-… … rule:f12-… theo thứ tự viên', () => {
    const store = doneAll([...ROW_B].reverse())
    const rules = ruleStudyWords(store, ruleCardsOf)
    const expected = ROW_B.flatMap((b) => getBrick(b)!.ruleCards.map(ruleCardId))
    expect(rules.map((r) => r.id)).toEqual(expected)
    expect(rules[0].id).toBe('rule:f07-1')
    expect(rules.at(-1)!.id.startsWith('rule:f12-')).toBe(true)
  })

  it('hàng B qua kiểm tra, chưa học → 11 hư từ hàng B mở, pos mở; không thẻ quy tắc, không từ chủ đề hàng B', () => {
    const store = markRowTested(empty(), 'B', 7, 8, day(9))
    expect(lockedNewWordIds(store).size).toBe(86 - 11)
    expect(flashcardGates(store).pos).toBe(true)
    expect(ruleStudyWords(store, ruleCardsOf)).toEqual([])
    expect(preferredNewWordIds(store, themeWordIdsOf)).toEqual([...STARTER_WORD_IDS])
  })
})
