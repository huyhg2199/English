import { describe, expect, it } from 'vitest'

import { allLessons } from '@/data/roadmap'
import { getBrick } from '@/data/foundation/content'
import type { BrickId } from '@/data/foundation'
import { loadWords, STARTER_WORD_IDS, type Word, type WordList } from '@/data/vocab'
import { completeBrick, markRowTested, resumeFoundation, skipFoundation } from '@/lib/foundation'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import { addToSrs, deleteSavedWord, readSavedWords, saveWord, savedWordId } from '@/lib/saved-words'
import { newWordListFor } from '@/lib/sessions'
import { addCard, gradeCard, limitedProgress, markCardKnown, readSrs, type ReviewedItem, type SrsCard } from '@/lib/srs'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  buildStudySession,
  flashcardGates,
  flashcardSummary,
  HEAVY_REVIEW_NEW_WORDS,
  HEAVY_REVIEW_THRESHOLD,
  NEW_WORDS_FOUNDATION,
  NEW_WORDS_T1,
  newPerDayFor,
  newWordOptions,
  preferredNewWordIds,
  rankLabel,
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
  const { newPerDay, preferIds } = newWordOptions(store, now, themeWordIdsOf)
  return buildStudySession(readSrs(store), words, readSavedWords(store), now, firstList, { newPerDay, preferIds })
}

const wordOf = (id: string) => id.replace(/^(ngsl|tsl)-/, '')

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
