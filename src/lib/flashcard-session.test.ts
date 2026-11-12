import { describe, expect, it } from 'vitest'

import { allLessons } from '@/data/roadmap'
import { IRREGULAR_VERB_CARDS } from '@/data/lessons'
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
  IRREGULAR_VERBS_PER_DAY,
  irregularVerbStudyWords,
  irregularVerbsReached,
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
    // Story 26: F01–F18 đều có nội dung, nên viên "Đang soạn" được giả bằng lookup trả rỗng cho F17.
    const store = completeBrick(empty(), 'F17', day(9))
    const drafting = (id: BrickId) => (id === 'F17' ? [] : themeWordIdsOf(id))
    expect(preferredNewWordIds(store, drafting)).toEqual([...STARTER_WORD_IDS])
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

describe('thẻ quy tắc của thì trong bài (story 33, dữ liệu story 38)', () => {
  /** Id SRS `rule:<tenseId>-1..n`. */
  const n = (tenseId: string, count: number) => Array.from({ length: count }, (_, i) => `rule:${tenseId}-${i + 1}`)
  const W2_RULES = [...n('past-to-be', 4), ...n('past-simple', 5)]
  /** 3 thẻ của story 33 (thẻ có lịch trong store cũ). */
  const STORY33 = ['rule:past-to-be-1', 'rule:past-to-be-2', 'rule:past-simple-1']
  /** Thẻ thì của T1 (s1-t1-w2, s1-t1-w3) và s1-t2-w1, theo lộ trình. */
  const T1_W1_RULES = [...n('present-simple', 4), ...n('present-simple-questions', 5), ...n('present-continuous', 5)]
  const T1_AND_W1 = lessonIds((id) => id.startsWith('s1-t1-') || id === 's1-t2-w1')
  /** Đã bỏ qua Sân ga, xong T1, s1-t2-w1 và s1-t2-w2 (bài hiện tại s1-t2-w3: thẻ động từ cũng mở). */
  const doneW2 = () => completeLessons(skipFoundation(empty(), day(3)), [...T1_AND_W1, 's1-t2-w2'])
  const isVerb = (id: string) => id.startsWith('rule:irregular-')
  const dueCard = (at: Date): SrsCard => {
    const iso = at.toISOString()
    return { due: iso, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: iso, known: false, updatedAt: iso }
  }
  const withCards = (store: Store, extra: Record<string, SrsCard>): Store => ({
    ...store,
    data: { ...store.data, srs: { cards: { ...(readSrs(store).cards as Record<string, SrsCard>), ...extra } } },
  })

  it('đánh dấu xong s1-t2-w2 → 9 thẻ của bài (past-simple-rule-5 thêm ở story 44), theo thứ tự, đứng sau thẻ viên gạch; có lessonId, không có brickId', () => {
    const store = completeLessons(completeBrick(empty(), 'F01', day(9)), ['s1-t2-w2'])
    const rules = ruleStudyWords(store, ruleCardsOf, { now: NOW, heavyReview: false })
    expect(rules.map((r) => r.id)).toEqual(['rule:f01-1', 'rule:f01-2', ...W2_RULES])
    for (const r of rules.slice(2)) {
      expect(r.lessonId, r.id).toBe('s1-t2-w2')
      expect('brickId' in r, r.id).toBe(false)
      expect('verbGroup' in r, r.id).toBe(false)
      expect(r.word, r.id).toBe(r.answer)
    }
    for (const r of rules.slice(0, 2)) expect('lessonId' in r, r.id).toBe(false)
    expect(rules[2]).toEqual({
      id: 'rule:past-to-be-1',
      rule: true,
      word: 'were',
      lessonId: 's1-t2-w2',
      cloze: 'Yesterday they ___ at home.',
      answer: 'were',
      vi: 'you / we / they và danh từ số nhiều + were; I / he / she / it và danh từ số ít + was.',
    })
  })

  it('phiên hôm đó: thẻ quy tắc mới (thì rồi động từ) đứng sau từ mới, quota và từ mới không đổi', () => {
    const store = doneW2()
    const s = fullSession(store)
    const plain = buildStudySession(readSrs(store), words, readSavedWords(store), NOW, newWordListFor(store), {
      ...newWordOptions(store, NOW, themeWordIdsOf, ruleCardsOf),
      rules: [],
    })
    const rulesIn = s.queue.filter((i) => i.word.id.startsWith('rule:'))
    const tenseRules = [...T1_W1_RULES, ...W2_RULES]
    expect(rulesIn.map((i) => [i.word.id, i.kind, i.intro === true])).toEqual(
      [...tenseRules, ...rulesIn.filter((i) => isVerb(i.word.id)).map((i) => i.word.id)].map((id) => [id, 'new', false]),
    )
    expect(rulesIn.filter((i) => isVerb(i.word.id))).toHaveLength(10)
    expect(s.queue.filter((i) => !i.word.id.startsWith('rule:'))).toEqual(plain.queue)
    expect(s.newCount).toBe(plain.newCount + tenseRules.length + 10)
    const lastWord = Math.max(...s.queue.map((i, k) => (i.word.id.startsWith('rule:') ? -1 : k)))
    const firstRule = s.queue.findIndex((i) => i.word.id.startsWith('rule:'))
    expect(firstRule).toBeGreaterThan(lastWord)
    expect(newPerDayFor(store, NOW, ruleCardsOf)).toEqual(newPerDayFor(store, NOW))
    // Chấm hết: số từ đã giới thiệu hôm nay không cộng thẻ quy tắc.
    let after = store
    for (const item of s.queue) after = gradeCard(after, item.word.id, 'good', NOW)
    expect(fullSession(after, day(10, 20)).introducedToday).toBe(plain.newCount)
  })

  it('bài chưa xong hoặc bị Mũ Phân Loại xếp qua → không có thẻ của bài', () => {
    const notDone = completeLessons(skipFoundation(empty(), day(3)), T1_AND_W1)
    expect(ruleStudyWords(notDone, ruleCardsOf, { now: NOW, heavyReview: false }).map((r) => r.id)).toEqual(T1_W1_RULES)
    // Xếp bắt đầu ở s1-t2-w3: các bài trước bị bỏ qua không góp thẻ thì; bài hiện tại là s1-t2-w3 nên chỉ có thẻ động từ.
    const { store: placed } = recordAttempt(skipFoundation(empty(), day(3)), { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, day(4), 's1-t2-w3')
    expect(ruleStudyWords(placed, ruleCardsOf)).toEqual([])
    const placedRules = fullSession(placed).queue.filter((i) => i.word.id.startsWith('rule:'))
    expect(placedRules.length).toBe(10)
    expect(placedRules.every((i) => isVerb(i.word.id))).toBe(true)
  })

  it('bỏ đánh dấu → thẻ đã có không vào phiên, không đếm tồn ôn; mục srs.cards còn; đánh dấu lại thì lịch cũ chạy tiếp', () => {
    const due = dueCard(day(9))
    const store = withCards(withDueCards(doneW2(), 38), Object.fromEntries(STORY33.map((id) => [id, due])))
    expect(newPerDayFor(store, NOW, ruleCardsOf).heavyReview).toBe(true)
    expect(fullSession(store).queue.filter((i) => STORY33.includes(i.word.id)).map((i) => i.kind)).toEqual(['review', 'review', 'review'])

    const unmarked = setLessonCompleted(store, 's1-t2-w2', false, day(10))
    expect(ruleStudyWords(unmarked, ruleCardsOf, { now: NOW, heavyReview: false }).map((r) => r.id)).toEqual(T1_W1_RULES)
    expect(fullSession(unmarked).queue.some((i) => W2_RULES.includes(i.word.id))).toBe(false)
    expect(newPerDayFor(unmarked, NOW, ruleCardsOf).heavyReview).toBe(false)
    for (const id of STORY33) expect(readSrs(unmarked).cards[id], id).toEqual(due)

    const again = setLessonCompleted(unmarked, 's1-t2-w2', true, day(10, 10))
    expect(fullSession(again).queue.filter((i) => STORY33.includes(i.word.id)).map((i) => i.kind)).toEqual(['review', 'review', 'review'])
  })

  it('thẻ mồ côi rule:past-to-be-9 không hiện, không đếm tồn ôn, vẫn nằm trong store', () => {
    const cards: Record<string, SrsCard> = {}
    for (let i = 9; i < 50; i++) cards[`rule:past-to-be-${i}`] = dueCard(day(9))
    const store = withCards(doneW2(), cards)
    const s = fullSession(store)
    expect(s.queue.some((i) => /^rule:past-to-be-(9|[1-4]\d)$/.test(i.word.id))).toBe(false)
    expect(s.dueCount).toBe(0)
    expect(newPerDayFor(store, NOW, ruleCardsOf).heavyReview).toBe(false)
    expect(readSrs(store).cards['rule:past-to-be-9']).toBeDefined()
  })

  it('Thẻ thì T1: bỏ qua Sân ga, xong s1-t1-w2 → rule:present-simple-1 … -4 là thẻ mới sau từ mới; quota không đổi', () => {
    const store = completeLessons(skipFoundation(empty(), day(3)), ['s1-t1-w2'])
    const s = fullSession(store)
    const plain = buildStudySession(readSrs(store), words, readSavedWords(store), NOW, newWordListFor(store), {
      ...newWordOptions(store, NOW, themeWordIdsOf, ruleCardsOf),
      rules: [],
    })
    const rulesIn = s.queue.filter((i) => i.word.id.startsWith('rule:'))
    expect(rulesIn.map((i) => [i.word.id, i.kind])).toEqual(n('present-simple', 4).map((id) => [id, 'new']))
    expect(s.queue.slice(-4).map((i) => i.word.id)).toEqual(n('present-simple', 4))
    expect(s.newCount).toBe(plain.newCount + 4)
    expect(newPerDayFor(store, NOW, ruleCardsOf)).toEqual(newPerDayFor(store, NOW))
    expect(rulesIn[0].word).toMatchObject({ lessonId: 's1-t1-w2', cloze: 'My mother ___ (work) on Saturdays.', answer: 'works' })
  })

  it('Bài cũ đã xong: 3 thẻ story 33 có lịch → phiên thêm 6 thẻ mới của s1-t2-w2, 3 thẻ cũ giữ lịch', () => {
    const future = withFutureCards(completeLessons(completeBrick(empty(), 'F01', day(9)), ['s1-t2-w2']), STORY33)
    const before = readSrs(future).cards
    const s = fullSession(future)
    const fresh = s.queue.filter((i) => i.word.id.startsWith('rule:') && !i.word.id.startsWith('rule:f01-'))
    expect(fresh.map((i) => [i.word.id, i.kind])).toEqual(
      ['rule:past-to-be-3', 'rule:past-to-be-4', 'rule:past-simple-2', 'rule:past-simple-3', 'rule:past-simple-4', 'rule:past-simple-5'].map((id) => [id, 'new']),
    )
    expect(s.queue.some((i) => STORY33.includes(i.word.id))).toBe(false)
    for (const id of STORY33) expect(readSrs(future).cards[id]).toEqual(before[id])
    expect(newPerDayFor(future, NOW, ruleCardsOf)).toEqual(newPerDayFor(future, NOW))
  })

  it('Bài chưa xong / bị xếp qua: s1-t3-w1 chưa đánh dấu hoặc bị xếp qua → không có rule:will-*', () => {
    const upToT2 = completeLessons(skipFoundation(empty(), day(3)), lessonIds((id) => /^s1-t[12]-/.test(id)))
    const willOf = (store: Store) => fullSession(store).queue.filter((i) => i.word.id.startsWith('rule:will-'))
    expect(willOf(upToT2)).toEqual([])
    const { store: placed } = recordAttempt(skipFoundation(empty(), day(3)), { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, day(4), 's1-t3-w2')
    expect(willOf(placed)).toEqual([])
    expect(ruleStudyWords(placed, ruleCardsOf, { now: NOW, heavyReview: false })).toEqual([])
    const done = setLessonCompleted(upToT2, 's1-t3-w1', true, day(9))
    expect(willOf(done).map((i) => i.word.id)).toEqual(n('will', 4))
  })
})

describe('thẻ động từ bất quy tắc (story 38)', () => {
  const T1_AND_W1 = lessonIds((id) => id.startsWith('s1-t1-') || id === 's1-t2-w1')
  /** Bỏ qua Sân ga, xong T1 + s1-t2-w1, -w2: bài hiện tại s1-t2-w3. */
  const reachW3 = () => completeLessons(skipFoundation(empty(), day(3)), [...T1_AND_W1, 's1-t2-w2'])
  const isVerb = (id: string) => id.startsWith('rule:irregular-')
  const vid = (v1: string) => `rule:irregular-${v1}-1`
  const v1Of = (id: string) => id.replace(/^rule:irregular-(.+)-1$/, '$1')
  /** Động từ mới (V1) trong phiên lúc `now`, theo thứ tự hàng đợi. */
  const newVerbs = (store: Store, now: Date) =>
    fullSession(store, now)
      .queue.filter((i) => isVerb(i.word.id) && i.kind === 'new')
      .map((i) => v1Of(i.word.id))
  /** Chấm "good" mọi thẻ động từ trong phiên lúc `now` (mới và đến hạn). */
  const gradeVerbs = (store: Store, now: Date, limit = Infinity) =>
    fullSession(store, now)
      .queue.filter((i) => isVerb(i.word.id))
      .slice(0, limit)
      .reduce((s, i) => gradeCard(s, i.word.id, 'good', now), store)
  const dueCard = (at: Date): SrsCard => {
    const iso = at.toISOString()
    return { due: iso, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: iso, known: false, updatedAt: iso }
  }
  const withCards = (store: Store, extra: Record<string, unknown>): Store => ({
    ...store,
    data: { ...store.data, srs: { cards: { ...(readSrs(store).cards as Record<string, unknown>), ...extra } } },
  })
  const DAY1 = ['be', 'have', 'do', 'go', 'get', 'make', 'see', 'know', 'take', 'give']
  const DAY2 = ['come', 'become', 'say', 'pay', 'tell', 'sell']

  it('tới T2-W3, ngày 1: 10 thẻ động từ mới đúng thứ tự, đứng sau thẻ thì; quota từ mới không đổi, newCount cộng đủ', () => {
    const store = reachW3()
    expect(IRREGULAR_VERBS_PER_DAY).toBe(10)
    expect(irregularVerbsReached(store)).toBe(true)
    const s = fullSession(store)
    const rulesIn = s.queue.filter((i) => i.word.id.startsWith('rule:'))
    expect(rulesIn.filter((i) => isVerb(i.word.id)).map((i) => [v1Of(i.word.id), i.kind])).toEqual(DAY1.map((v) => [v, 'new']))
    const firstVerb = rulesIn.findIndex((i) => isVerb(i.word.id))
    expect(rulesIn.slice(firstVerb).every((i) => isVerb(i.word.id))).toBe(true)
    expect(rulesIn.slice(0, firstVerb).every((i) => !isVerb(i.word.id))).toBe(true)
    expect(rulesIn[firstVerb].word).toEqual({
      id: 'rule:irregular-be-1',
      rule: true,
      word: 'was / were · been',
      lessonId: 's1-t2-w3',
      verbGroup: 'Rất thông dụng, mỗi từ một kiểu: học thuộc',
      cloze: 'be → ___ (V2 · V3)',
      answer: 'was / were · been',
      vi: 'thì, là, ở · Nhóm: Rất thông dụng, mỗi từ một kiểu: học thuộc',
    })
    const plain = buildStudySession(readSrs(store), words, readSavedWords(store), NOW, newWordListFor(store), {
      ...newWordOptions(store, NOW, themeWordIdsOf, ruleCardsOf),
      rules: [],
    })
    expect(s.queue.filter((i) => !i.word.id.startsWith('rule:'))).toEqual(plain.queue)
    expect(s.newCount).toBe(plain.newCount + rulesIn.length)
    expect(newPerDayFor(store, NOW, ruleCardsOf)).toEqual(newPerDayFor(store, NOW))
    // Không có `opening`: chưa có thẻ nào có lịch → không có thẻ động từ.
    expect(irregularVerbStudyWords(store)).toEqual([])
  })

  it('ngày 1 đã chấm hết: không mở nhóm mới, 10 thẻ đi theo lịch', () => {
    const graded = gradeVerbs(reachW3(), day(10, 10))
    expect(DAY1.every((v) => readSrs(graded).cards[vid(v)] !== undefined)).toBe(true)
    expect(newVerbs(graded, day(10, 20))).toEqual([])
    expect(irregularVerbStudyWords(graded).map((r) => v1Of(r.id))).toEqual(DAY1)
    expect(newPerDayFor(graded, day(10, 20), ruleCardsOf)).toEqual(newPerDayFor(graded, day(10, 20)))
  })

  it('ngày 1 chấm dở 4 thẻ rồi mở lại: 6 thẻ còn lại của nhóm 1 và 2 vẫn là thẻ mới, không thêm nhóm 3', () => {
    const half = gradeVerbs(reachW3(), day(10, 10), 4)
    expect(DAY1.slice(0, 4).every((v) => readSrs(half).cards[vid(v)] !== undefined)).toBe(true)
    expect(newVerbs(half, day(10, 11))).toEqual(DAY1.slice(4))
  })

  it('ngày 2 → 7, chấm hết mỗi ngày: 6, 5, 9, 10, 10 rồi hết; đủ 50 động từ theo nhóm', () => {
    let store = gradeVerbs(reachW3(), day(10, 10))
    const opened: string[][] = []
    for (let d = 11; d <= 16; d++) {
      const now = day(d, 9)
      expect(newPerDayFor(store, now, ruleCardsOf).heavyReview, `ngày ${d}`).toBe(false)
      expect(newPerDayFor(store, now, ruleCardsOf), `ngày ${d}`).toEqual(newPerDayFor(store, now))
      const s = fullSession(store, now)
      const plain = buildStudySession(readSrs(store), words, readSavedWords(store), now, newWordListFor(store), {
        ...newWordOptions(store, now, themeWordIdsOf, ruleCardsOf),
        rules: [],
      })
      const newRules = s.queue.filter((i) => i.word.id.startsWith('rule:') && i.kind === 'new')
      expect(s.newCount, `ngày ${d}`).toBe(plain.newCount + newRules.length)
      opened.push(newVerbs(store, now))
      store = gradeVerbs(store, now)
    }
    expect(opened.map((o) => o.length)).toEqual([6, 5, 9, 10, 10, 0])
    expect(opened[0]).toEqual(DAY2)
    expect(opened[1]).toEqual(['think', 'bring', 'buy', 'teach', 'catch'])
    expect([...DAY1, ...opened.flat()]).toEqual(IRREGULAR_VERB_CARDS.map((c) => c.id.replace(/^irregular-(.+)-rule-1$/, '$1')))
    expect(Object.keys(readSrs(store).cards).filter(isVerb)).toHaveLength(50)
  })

  it('nghỉ vài ngày: ngày 2 không mở app, ngày 4 mở → đúng 6 thẻ của "ngày 2", không dồn', () => {
    const store = gradeVerbs(reachW3(), day(10, 10))
    expect(newVerbs(store, day(13, 9))).toEqual(DAY2)
  })

  it('ngày tồn ôn (> 40 thẻ đến hạn): không có thẻ động từ mới; thẻ động từ đến hạn vẫn ôn và được đếm', () => {
    const store = withCards(withDueCards(reachW3(), 40), { [vid('go')]: dueCard(day(9)) })
    expect(newPerDayFor(store, NOW, ruleCardsOf).heavyReview).toBe(true)
    // Không có thẻ go thì 40 thẻ đến hạn chưa tới ngưỡng: thẻ động từ đến hạn được đếm tồn ôn.
    expect(newPerDayFor(withDueCards(reachW3(), 40), NOW, ruleCardsOf).heavyReview).toBe(false)
    const verbs = fullSession(store).queue.filter((i) => isVerb(i.word.id))
    expect(verbs.map((i) => [i.word.id, i.kind])).toEqual([[vid('go'), 'review']])
  })

  it('còn ở Sân ga (chưa qua / chưa bỏ qua) dù đã xong T1 + s1-t2-w1, -w2: không có thẻ động từ', () => {
    const store = completeLessons(empty(), [...T1_AND_W1, 's1-t2-w2'])
    expect(irregularVerbsReached(store)).toBe(false)
    expect(newVerbs(store, NOW)).toEqual([])
  })

  it('bị xếp qua T2-W3 (bắt đầu ở s1-t3-w1): không có thẻ động từ; đánh dấu xong s1-t2-w3 thì bắt đầu mở', () => {
    const { store: placed } = recordAttempt(skipFoundation(empty(), day(3)), { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, day(4), 's1-t3-w1')
    expect(irregularVerbsReached(placed)).toBe(false)
    expect(newVerbs(placed, NOW)).toEqual([])
    const done = setLessonCompleted(placed, 's1-t2-w3', true, day(9))
    expect(irregularVerbsReached(done)).toBe(true)
    expect(newVerbs(done, NOW)).toEqual(DAY1)
  })

  it('bỏ đánh dấu lùi về s1-t2-w2: thẻ động từ không vào phiên, không đếm tồn ôn, vẫn trong store; đánh dấu lại thì lịch cũ chạy tiếp', () => {
    const due = dueCard(day(9))
    const store = withCards(withDueCards(reachW3(), 38), Object.fromEntries(DAY1.map((v) => [vid(v), due])))
    expect(newPerDayFor(store, NOW, ruleCardsOf).heavyReview).toBe(true)
    expect(fullSession(store).queue.filter((i) => isVerb(i.word.id)).map((i) => i.kind)).toEqual(DAY1.map(() => 'review'))

    const unmarked = setLessonCompleted(store, 's1-t2-w2', false, day(10))
    expect(irregularVerbsReached(unmarked)).toBe(false)
    expect(irregularVerbStudyWords(unmarked, { now: NOW, heavyReview: false })).toEqual([])
    expect(fullSession(unmarked).queue.some((i) => isVerb(i.word.id))).toBe(false)
    expect(newPerDayFor(unmarked, NOW, ruleCardsOf).heavyReview).toBe(false)
    for (const v of DAY1) expect(readSrs(unmarked).cards[vid(v)], v).toEqual(due)

    const again = setLessonCompleted(unmarked, 's1-t2-w2', true, day(10, 10))
    expect(fullSession(again).queue.filter((i) => isVerb(i.word.id)).map((i) => i.kind)).toEqual(DAY1.map(() => 'review'))
  })

  it('thẻ mồ côi rule:irregular-swimx-1, rule:will-9: không hiện, không đếm tồn ôn, vẫn trong store', () => {
    const orphans: Record<string, SrsCard> = { 'rule:will-9': dueCard(day(9)) }
    for (let i = 0; i < 41; i++) orphans[`rule:irregular-swimx${i === 0 ? '' : i}-1`] = dueCard(day(9))
    const store = withCards(reachW3(), orphans)
    const s = fullSession(store)
    expect(s.queue.some((i) => i.word.id in orphans)).toBe(false)
    expect(s.dueCount).toBe(0)
    expect(newPerDayFor(store, NOW, ruleCardsOf).heavyReview).toBe(false)
    expect(readSrs(store).cards['rule:irregular-swimx-1']).toBeDefined()
    expect(readSrs(store).cards['rule:will-9']).toBeDefined()
    // Thẻ mồ côi không làm nhóm đầu bị coi là đã mở / đã giới thiệu hôm nay.
    expect(newVerbs(store, NOW)).toEqual(DAY1)
  })

  it('mục sai dạng trong srs.cards coi như chưa có mục (không mở nhóm, không phải thẻ có lịch)', () => {
    const store = withCards(reachW3(), { [vid('be')]: 'junk', [vid('come')]: { due: 1 } })
    expect(irregularVerbStudyWords(store, { now: NOW, heavyReview: false }).map((r) => v1Of(r.id))).toEqual(DAY1)
    expect(irregularVerbStudyWords(store)).toEqual([])
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

describe('hàng C–D có nội dung (story 26, getBrick thật)', () => {
  const ROW_AB: readonly BrickId[] = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12']
  const ROW_CD: readonly BrickId[] = ['F13', 'F14', 'F15', 'F16', 'F17', 'F18']
  const doneAll = (list: readonly BrickId[], s: Store = empty(), d = 1) =>
    list.reduce((acc, id, i) => completeBrick(acc, id, day(d, 8 + (i % 10))), s)

  it("F01–F12 xong → viên tiếp theo F13, buổi 30' chạy F13", () => {
    const store = doneAll(ROW_AB)
    expect(nextBrickId(store, hasBrickContent)).toBe('F13')
    expect(sessionPlan(store, hasBrickContent)).toMatchObject({ mode: 'foundation', brickId: 'F13', review: false })
  })

  // F15 mở 8 hư từ từ story 43 (thêm some, any, many vốn là cổng tường); F16 mở 4 từ story 44 (thêm but, or, because).
  it('xong lần lượt F13, F14, F15, F16, F18 → khoá 75 → 74 → 67 → 59 → 55 → 50; xong thêm F17 thì qua tường, còn khoá 15', () => {
    let store = doneAll(ROW_AB)
    const sizes = [lockedNewWordIds(store).size]
    for (const [i, id] of (['F13', 'F14', 'F15', 'F16', 'F18'] as const).entries()) {
      store = completeBrick(store, id, day(9, 8 + i))
      sizes.push(lockedNewWordIds(store).size)
      // Từ chủ đề của viên vừa học lên đầu từ mới.
      expect(preferredNewWordIds(store, themeWordIdsOf).slice(0, 5), id).toEqual([...themeWordIdsOf(id)])
    }
    expect(sizes).toEqual([75, 74, 67, 59, 55, 50])
    expect(readFoundationCompletedAt(store)).toBeNull()

    store = completeBrick(store, 'F17', day(10))
    expect(readFoundationCompletedAt(store)).toBe(day(10).toISOString())
    expect(lockedNewWordIds(store).size).toBe(15)
    expect(openedIn(store).length).toBe(ALL_FUNCTION_IDS.length - 15)
    expect([...lockedNewWordIds(store)].map(wordOf).sort()).toEqual(LESSON_LOCKED)
  })

  it('hàng A–C xong, xong F17 rồi F18 → completedAt = lúc xong F18', () => {
    let store = doneAll([...ROW_AB, 'F13', 'F14', 'F15', 'F16'])
    store = completeBrick(store, 'F17', day(9))
    expect(readFoundationCompletedAt(store)).toBeNull()
    store = completeBrick(store, 'F18', day(11))
    expect(readFoundationCompletedAt(store)).toBe(day(11).toISOString())
  })

  it('ruleStudyWords sau khi xong F13–F18 → rule:f13-… … rule:f18-… theo thứ tự viên; hư từ mở chỉ là thẻ điền câu', () => {
    const store = doneAll([...ROW_CD].reverse())
    const rules = ruleStudyWords(store, ruleCardsOf)
    const expected = ROW_CD.flatMap((b) => getBrick(b)!.ruleCards.map(ruleCardId))
    expect(rules.map((r) => r.id)).toEqual(expected)
    expect(rules[0].id).toBe('rule:f13-1')
    expect(rules.at(-1)!.id.startsWith('rule:f18-')).toBe(true)
    for (const id of ['ngsl-be', 'ngsl-not', 'ngsl-there', 'ngsl-have', 'ngsl-at']) {
      const w = words.find((x) => x.id === id)!
      expect(functionWordCloze(w), id).not.toBeNull()
    }
  })
})

function readFoundationCompletedAt(store: Store): string | null {
  const f = store.data.foundation as { completedAt?: string | null } | undefined
  return f?.completedAt ?? null
}

describe('thẻ quy tắc F06: số, thứ, tháng (story 34)', () => {
  const F01_F06: BrickId[] = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06']
  const F06_RULES = Array.from({ length: 8 }, (_, i) => `rule:f06-${i + 1}`)
  const learnedRowA = (at: Date = day(9)) => F01_F06.reduce((s, id) => completeBrick(s, id, at), empty())

  it('xong F01–F06 → ruleStudyWords có đủ rule:f06-1 … -8 theo thứ tự; newPerDayFor không đổi', () => {
    const store = learnedRowA()
    const rules = ruleStudyWords(store, ruleCardsOf).map((r) => r.id)
    expect(rules.filter((id) => id.startsWith('rule:f06-'))).toEqual(F06_RULES)
    expect(rules.slice(-8)).toEqual(F06_RULES)
    expect(newPerDayFor(store, NOW, ruleCardsOf)).toEqual(newPerDayFor(empty(), NOW, ruleCardsOf))
    expect(newPerDayFor(store, NOW, ruleCardsOf)).toEqual({ count: NEW_WORDS_FOUNDATION, heavyReview: false })
    // F06 xong hôm nay: 8 thẻ mới đứng sau từ mới, không chiếm quota.
    const today = learnedRowA(day(10, 8))
    const queue = fullSession(today).queue
    const f06 = queue.filter((i) => i.word.id.startsWith('rule:f06-'))
    expect(f06.map((i) => [i.word.id, i.kind])).toEqual(F06_RULES.map((id) => [id, 'new']))
    const firstRule = queue.findIndex((i) => i.word.id.startsWith('rule:'))
    expect(queue.slice(firstRule).every((i) => i.word.id.startsWith('rule:'))).toBe(true)
    expect(queue.filter((i) => !i.word.id.startsWith('rule:') && i.kind === 'new')).toHaveLength(NEW_WORDS_FOUNDATION)
  })

  it('đã có rule:f06-1, -2 (trước story 34) → thêm 6 thẻ mới 3–8, thẻ 1–2 giữ lịch cũ', () => {
    const rowA = learnedRowA(day(1))
    const others = ruleStudyWords(rowA, ruleCardsOf).map((r) => r.id).filter((id) => !id.startsWith('rule:f06-'))
    const store = withFutureCards(rowA, [...others, 'rule:f06-1', 'rule:f06-2', ...getBrick('F01')!.themeWordIds])
    const before = readSrs(store).cards as Record<string, SrsCard>
    const queue = fullSession(store).queue
    const f06 = queue.filter((i) => i.word.id.startsWith('rule:f06-'))
    expect(f06.map((i) => [i.word.id, i.kind])).toEqual(F06_RULES.slice(2).map((id) => [id, 'new']))
    // Chấm hết phiên: thẻ 1–2 (chưa tới hạn) không bị đụng, giữ nguyên lịch cũ.
    let after = store
    for (const item of queue) after = gradeCard(after, item.word.id, 'good', NOW)
    const cards = readSrs(after).cards as Record<string, SrsCard>
    for (const id of ['rule:f06-1', 'rule:f06-2']) expect(cards[id], id).toEqual(before[id])
    for (const id of F06_RULES.slice(2)) expect(cards[id], id).toBeDefined()
  })

  it('thẻ mồ côi rule:f06-9 (F06 đã học) không hiện, không đếm tồn ôn, vẫn nằm trong store', () => {
    const due = day(9).toISOString()
    const c = { due, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: due, known: false, updatedAt: due }
    const base = learnedRowA()
    const store: Store = { ...base, data: { ...base.data, srs: { cards: { 'rule:f06-9': c } } } }
    const s = fullSession(store)
    expect(s.queue.some((i) => i.word.id === 'rule:f06-9')).toBe(false)
    expect(s.dueCount).toBe(0)
    expect(Object.keys(readSrs(store).cards)).toEqual(['rule:f06-9'])
    // 41 thẻ mồ côi vẫn không làm "tồn ôn nhiều".
    const many: Record<string, SrsCard> = {}
    for (let i = 9; i < 50; i++) many[`rule:f06-${i}`] = c
    const heavy: Store = { ...base, data: { ...base.data, srs: { cards: many } } }
    expect(newPerDayFor(heavy, NOW, ruleCardsOf)).toEqual({ count: NEW_WORDS_FOUNDATION, heavyReview: false })
  })
})

describe('F15 lượng từ, There is phủ định / câu hỏi (story 43)', () => {
  const UP_TO_F14: BrickId[] = [
    'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14',
  ]
  const F15_RULES = Array.from({ length: 6 }, (_, i) => `rule:f15-${i + 1}`)
  const QUANTIFIER_IDS = ['ngsl-some', 'ngsl-any', 'ngsl-many']
  const learned = (list: readonly BrickId[], at: Date = day(9)) => list.reduce((s, id) => completeBrick(s, id, at), empty())

  it('xong F01–F15 → rule:f15-1 … -6 theo thứ tự, đứng cuối; some / any / many hết khoá', () => {
    const store = learned([...UP_TO_F14, 'F15'])
    const rules = ruleStudyWords(store, ruleCardsOf).map((r) => r.id)
    expect(rules.filter((id) => id.startsWith('rule:f15-'))).toEqual(F15_RULES)
    expect(rules.slice(-6)).toEqual(F15_RULES)
    const locked = lockedNewWordIds(store)
    for (const id of QUANTIFIER_IDS) expect(locked.has(id), id).toBe(false)
    expect(locked.has('ngsl-much')).toBe(false)
    // F15 xong hôm nay: 6 thẻ mới đứng sau từ mới, không chiếm quota.
    const queue = fullSession(learned([...UP_TO_F14, 'F15'], day(10, 8))).queue
    const f15 = queue.filter((i) => i.word.id.startsWith('rule:f15-'))
    expect(f15.map((i) => [i.word.id, i.kind])).toEqual(F15_RULES.map((id) => [id, 'new']))
    expect(queue.filter((i) => !i.word.id.startsWith('rule:') && i.kind === 'new')).toHaveLength(NEW_WORDS_FOUNDATION)
  })

  it('mới xong F01–F14 → some / any / many vẫn khoá (much đã mở từ F14)', () => {
    const locked = lockedNewWordIds(learned(UP_TO_F14))
    for (const id of QUANTIFIER_IDS) expect(locked.has(id), id).toBe(true)
    expect(locked.has('ngsl-much')).toBe(false)
  })

  it('hàng C qua kiểm tra hoặc bỏ qua Sân ga, chưa học F15 → some / any / many mở, không có thẻ rule:f15-*', () => {
    for (const store of [markRowTested(empty(), 'C', 7, 8, day(9)), skipFoundation(empty(), day(9))]) {
      const locked = lockedNewWordIds(store)
      for (const id of QUANTIFIER_IDS) expect(locked.has(id), id).toBe(false)
      expect(ruleStudyWords(store, ruleCardsOf).some((r) => r.id.startsWith('rule:f15-'))).toBe(false)
    }
  })

  it('đã có rule:f15-1, -2 (trước story 43) → thêm 4 thẻ mới 3–6, thẻ 1–2 giữ lịch cũ', () => {
    const base = learned([...UP_TO_F14, 'F15'], day(1))
    const others = ruleStudyWords(base, ruleCardsOf).map((r) => r.id).filter((id) => !id.startsWith('rule:f15-'))
    const store = withFutureCards(base, [...others, 'rule:f15-1', 'rule:f15-2', ...getBrick('F01')!.themeWordIds])
    const before = readSrs(store).cards as Record<string, SrsCard>
    const queue = fullSession(store).queue
    const f15 = queue.filter((i) => i.word.id.startsWith('rule:f15-'))
    expect(f15.map((i) => [i.word.id, i.kind])).toEqual(F15_RULES.slice(2).map((id) => [id, 'new']))
    let after = store
    for (const item of queue) after = gradeCard(after, item.word.id, 'good', NOW)
    const cards = readSrs(after).cards as Record<string, SrsCard>
    for (const id of ['rule:f15-1', 'rule:f15-2']) expect(cards[id], id).toEqual(before[id])
    for (const id of F15_RULES.slice(2)) expect(cards[id], id).toBeDefined()
  })

  it('thẻ mồ côi rule:f15-7 (F15 đã học) không hiện, không đếm tồn ôn, vẫn nằm trong store', () => {
    const due = day(9).toISOString()
    const c = { due, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: due, known: false, updatedAt: due }
    const base = learned([...UP_TO_F14, 'F15'])
    const store: Store = { ...base, data: { ...base.data, srs: { cards: { 'rule:f15-7': c } } } }
    const s = fullSession(store)
    expect(s.queue.some((i) => i.word.id === 'rule:f15-7')).toBe(false)
    expect(s.dueCount).toBe(0)
    expect(Object.keys(readSrs(store).cards)).toEqual(['rule:f15-7'])
  })
})

describe('F16 nối câu, thẻ từ để hỏi và câu hỏi chủ ngữ (story 44)', () => {
  const UP_TO_F15: BrickId[] = [
    'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15',
  ]
  const F16_RULES = Array.from({ length: 5 }, (_, i) => `rule:f16-${i + 1}`)
  const LINKER_IDS = ['ngsl-but', 'ngsl-or', 'ngsl-because']
  const learned = (list: readonly BrickId[], at: Date = day(9)) => list.reduce((s, id) => completeBrick(s, id, at), empty())
  const n = (tenseId: string, count: number) => Array.from({ length: count }, (_, i) => `rule:${tenseId}-${i + 1}`)

  it('xong F01–F16 → rule:f16-1 … -5 theo thứ tự, đứng cuối; but / or / because hết khoá, and / why còn khoá', () => {
    const store = learned([...UP_TO_F15, 'F16'])
    const rules = ruleStudyWords(store, ruleCardsOf).map((r) => r.id)
    expect(rules.filter((id) => id.startsWith('rule:f16-'))).toEqual(F16_RULES)
    expect(rules.slice(-5)).toEqual(F16_RULES)
    const locked = lockedNewWordIds(store)
    for (const id of LINKER_IDS) expect(locked.has(id), id).toBe(false)
    for (const id of ['ngsl-and', 'ngsl-why']) expect(locked.has(id), id).toBe(true)
    // F16 xong hôm nay: 5 thẻ mới đứng sau từ mới, không chiếm quota.
    const queue = fullSession(learned([...UP_TO_F15, 'F16'], day(10, 8))).queue
    const f16 = queue.filter((i) => i.word.id.startsWith('rule:f16-'))
    expect(f16.map((i) => [i.word.id, i.kind])).toEqual(F16_RULES.map((id) => [id, 'new']))
    expect(queue.filter((i) => !i.word.id.startsWith('rule:') && i.kind === 'new')).toHaveLength(NEW_WORDS_FOUNDATION)
    expect(f16[2].word).toMatchObject({ cloze: 'My son has a new game, ___ he is happy. (nên)', answer: 'so', brickId: 'F16' })
  })

  it('mới xong F01–F15 → but / or / because vẫn khoá (nay vì F16); and / why vẫn khoá vì tường', () => {
    const locked = lockedNewWordIds(learned(UP_TO_F15))
    for (const id of [...LINKER_IDS, 'ngsl-and', 'ngsl-why']) expect(locked.has(id), id).toBe(true)
  })

  it('hàng C qua kiểm tra hoặc bỏ qua Sân ga, chưa học F16 → but / or / because mở, không có thẻ rule:f16-*', () => {
    for (const store of [markRowTested(empty(), 'C', 7, 8, day(9)), skipFoundation(empty(), day(9))]) {
      const locked = lockedNewWordIds(store)
      for (const id of LINKER_IDS) expect(locked.has(id), id).toBe(false)
      expect(ruleStudyWords(store, ruleCardsOf).some((r) => r.id.startsWith('rule:f16-'))).toBe(false)
    }
  })

  it('đã có rule:f16-1, -2 (trước story 44) → thêm 3 thẻ mới 3–5, thẻ 1–2 giữ lịch cũ', () => {
    const base = learned([...UP_TO_F15, 'F16'], day(1))
    const others = ruleStudyWords(base, ruleCardsOf).map((r) => r.id).filter((id) => !id.startsWith('rule:f16-'))
    const store = withFutureCards(base, [...others, 'rule:f16-1', 'rule:f16-2', ...getBrick('F01')!.themeWordIds])
    const before = readSrs(store).cards as Record<string, SrsCard>
    const queue = fullSession(store).queue
    const f16 = queue.filter((i) => i.word.id.startsWith('rule:f16-'))
    expect(f16.map((i) => [i.word.id, i.kind])).toEqual(F16_RULES.slice(2).map((id) => [id, 'new']))
    let after = store
    for (const item of queue) after = gradeCard(after, item.word.id, 'good', NOW)
    const cards = readSrs(after).cards as Record<string, SrsCard>
    for (const id of ['rule:f16-1', 'rule:f16-2']) expect(cards[id], id).toEqual(before[id])
    for (const id of F16_RULES.slice(2)) expect(cards[id], id).toBeDefined()
  })

  it('thẻ mồ côi rule:f16-6 (F16 đã học) không hiện, không đếm tồn ôn, vẫn nằm trong store', () => {
    const due = day(9).toISOString()
    const c = { due, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: due, known: false, updatedAt: due }
    const base = learned([...UP_TO_F15, 'F16'])
    const store: Store = { ...base, data: { ...base.data, srs: { cards: { 'rule:f16-6': c } } } }
    const s = fullSession(store)
    expect(s.queue.some((i) => i.word.id === 'rule:f16-6')).toBe(false)
    expect(s.dueCount).toBe(0)
    expect(Object.keys(readSrs(store).cards)).toEqual(['rule:f16-6'])
  })

  it('bài s1-t1-w3 đã xong trước story 44 (có rule:present-simple-questions-1 … -4) → phiên thêm đúng -5, thẻ cũ giữ lịch', () => {
    const OLD = n('present-simple-questions', 4)
    const base = completeLessons(skipFoundation(empty(), day(3)), ['s1-t1-w3'])
    expect(ruleStudyWords(base, ruleCardsOf, { now: NOW, heavyReview: false }).map((r) => r.id)).toEqual(
      n('present-simple-questions', 5),
    )
    const store = withFutureCards(base, OLD)
    const before = readSrs(store).cards as Record<string, SrsCard>
    const queue = fullSession(store).queue
    const fresh = queue.filter((i) => i.word.id.startsWith('rule:'))
    expect(fresh.map((i) => [i.word.id, i.kind])).toEqual([['rule:present-simple-questions-5', 'new']])
    expect(fresh[0].word).toMatchObject({ lessonId: 's1-t1-w3', cloze: 'How ___ do you play football? — Every Sunday.', answer: 'often' })
    let after = store
    for (const item of queue) after = gradeCard(after, item.word.id, 'good', NOW)
    const cards = readSrs(after).cards as Record<string, SrsCard>
    for (const id of OLD) expect(cards[id], id).toEqual(before[id])
    expect(cards['rule:present-simple-questions-5']).toBeDefined()
  })
})

describe('modal mở rộng: have to, could, would like; may / might dời sang Chặng 2 (story 45)', () => {
  const n = (tenseId: string, count: number) => Array.from({ length: count }, (_, i) => `rule:${tenseId}-${i + 1}`)
  const MODAL_RULES = n('modals', 5)
  const OPEN = ['ngsl-can', 'ngsl-could', 'ngsl-would', 'ngsl-should', 'ngsl-must']
  const dueCard = (at: Date): SrsCard => {
    const iso = at.toISOString()
    return { due: iso, interval: 3, ease: 2.5, reps: 2, lapses: 0, learning: false, introducedAt: iso, known: false, updatedAt: iso }
  }
  const withCards = (store: Store, extra: Record<string, SrsCard>): Store => ({
    ...store,
    data: { ...store.data, srs: { cards: { ...(readSrs(store).cards as Record<string, SrsCard>), ...extra } } },
  })
  /** Bỏ qua Sân ga và đánh dấu xong s1-t4-w1. */
  const doneModals = () => completeLessons(skipFoundation(empty(), day(3)), ['s1-t4-w1'])

  it('bỏ qua Sân ga + xong s1-t4-w1 → can, could, would, should, must mở; may, might vẫn khoá', () => {
    const locked = lockedNewWordIds(doneModals())
    for (const id of OPEN) expect(locked.has(id), id).toBe(false)
    for (const id of ['ngsl-may', 'ngsl-might']) expect(locked.has(id), id).toBe(true)
  })

  it('thêm s2-t7-w3 → may mở, might khoá; thêm s2-t7-w4 → might mở', () => {
    const w3 = completeLessons(doneModals(), ['s2-t7-w3'])
    expect(lockedNewWordIds(w3).has('ngsl-may')).toBe(false)
    expect(lockedNewWordIds(w3).has('ngsl-might')).toBe(true)
    const w4 = completeLessons(w3, ['s2-t7-w4'])
    expect(lockedNewWordIds(w4).has('ngsl-might')).toBe(false)
  })

  it('Mũ xếp bắt đầu s2-t8-w1 → may, might mở (bài bị xếp qua)', () => {
    const { store } = recordAttempt(skipFoundation(empty(), day(3)), { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, day(4), 's2-t8-w1')
    const locked = lockedNewWordIds(store)
    for (const id of [...OPEN, 'ngsl-may', 'ngsl-might']) expect(locked.has(id), id).toBe(false)
  })

  it('đã xong s1-t4-w1, chưa tới s2-t7-w3: phiên nhiều ngày không bao giờ giới thiệu may hay might', () => {
    let store = doneModals()
    const introduced: string[] = []
    for (let d = 10; d <= 30; d++) {
      const at = new Date(2026, 10, d, 9)
      for (const item of fullSession(store, at).queue) {
        if (item.kind === 'new') {
          introduced.push(item.word.id)
          expect(['ngsl-may', 'ngsl-might'], item.word.id).not.toContain(item.word.id)
        }
        store = gradeCard(store, item.word.id, 'good', at)
      }
    }
    // Tự kiểm: phiên đã đi qua hạng của may (97) và might (159), và giới thiệu could, would.
    const rankOf = new Map(words.map((w) => [w.id, w.rank]))
    expect(Math.max(...introduced.filter((id) => id.startsWith('ngsl-')).map((id) => rankOf.get(id) ?? 0))).toBeGreaterThan(159)
    for (const id of ['ngsl-could', 'ngsl-would']) expect(introduced, id).toContain(id)
    // Thẻ hư từ could hiện dạng điền chỗ trống (AC story 45).
    const could = functionWordCloze(words.find((w) => w.id === 'ngsl-could')!)
    expect(could && clozeText(could)).toBe('___ you open the window?')
    expect(could?.answer).toBe('Could')
  })

  it('có thẻ ngsl-may từ trước, chưa xong s2-t7-w3 → thẻ vẫn là thẻ ôn khi tới hạn, không bị xoá', () => {
    const store = withCards(doneModals(), { 'ngsl-may': dueCard(day(9)) })
    expect(lockedNewWordIds(store).has('ngsl-may')).toBe(true)
    expect(fullSession(store).queue.find((i) => i.word.id === 'ngsl-may')).toMatchObject({ kind: 'review' })
    expect(readSrs(store).cards['ngsl-may']).toEqual(dueCard(day(9)))
  })

  it('xong s1-t4-w1 → ruleStudyWords có rule:modals-1 … -5 đúng thứ tự, lessonId s1-t4-w1; thẻ 5 lật ra has to', () => {
    const rules = ruleStudyWords(doneModals(), ruleCardsOf, { now: NOW, heavyReview: false })
    expect(rules.map((r) => r.id)).toEqual(MODAL_RULES)
    for (const r of rules) expect('lessonId' in r && r.lessonId, r.id).toBe('s1-t4-w1')
    expect(rules[4]).toMatchObject({ cloze: 'My father ___ (have to) work on Saturdays.', answer: 'has to' })
  })

  it('bỏ đánh dấu s1-t4-w1 → could, would để dành lại; thẻ đã có giữ nguyên; rule:modals-* không vào phiên', () => {
    const withCard = gradeCard(doneModals(), 'ngsl-could', 'good', day(9))
    const undone = setLessonCompleted(withCard, 's1-t4-w1', false, day(9, 10))
    for (const id of ['ngsl-could', 'ngsl-would']) expect(lockedNewWordIds(undone).has(id), id).toBe(true)
    expect(readSrs(undone).cards['ngsl-could']).toEqual(readSrs(withCard).cards['ngsl-could'])
    expect(ruleStudyWords(undone, ruleCardsOf, { now: NOW, heavyReview: false }).some((r) => r.id.startsWith('rule:modals-'))).toBe(false)
  })

  it('store có rule:modals-1 … -4 (bài xong trước story 45) → phiên thêm đúng -5, thẻ cũ giữ lịch', () => {
    const OLD = MODAL_RULES.slice(0, 4)
    const store = withFutureCards(doneModals(), OLD)
    const before = readSrs(store).cards as Record<string, SrsCard>
    const queue = fullSession(store).queue
    const fresh = queue.filter((i) => i.word.id.startsWith('rule:'))
    expect(fresh.map((i) => [i.word.id, i.kind])).toEqual([['rule:modals-5', 'new']])
    let after = store
    for (const item of queue) after = gradeCard(after, item.word.id, 'good', NOW)
    const cards = readSrs(after).cards as Record<string, SrsCard>
    for (const id of OLD) expect(cards[id], id).toEqual(before[id])
    expect(cards['rule:modals-5']).toBeDefined()
  })

  it('thẻ mồ côi rule:modals-6 không hiện, không đếm tồn ôn, vẫn nằm trong store', () => {
    const base = doneModals()
    const store: Store = { ...base, data: { ...base.data, srs: { cards: { 'rule:modals-6': dueCard(day(9)) } } } }
    const s = fullSession(store)
    expect(s.queue.some((i) => i.word.id === 'rule:modals-6')).toBe(false)
    expect(s.dueCount).toBe(0)
    expect(newPerDayFor(store, NOW, ruleCardsOf).heavyReview).toBe(false)
    expect(Object.keys(readSrs(store).cards)).toEqual(['rule:modals-6'])
  })
})
