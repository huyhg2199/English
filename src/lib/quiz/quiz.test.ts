import { describe, expect, it } from 'vitest'

import { getQuestion, getQuiz, QUESTION_BANK, type Question } from '@/data/questions'
import type { Store } from '@/lib/storage'
import { mergeMistakeItems, mergeWithRemote } from '@/lib/sync/merge'

import {
  dueMistakes,
  filterMistakes,
  gradeAttempt,
  isExplanationStale,
  isMastered,
  isQuizAttempt,
  isMistakeItem,
  listAttempts,
  listMistakes,
  MASTERED_INTERVAL_DAYS,
  pickMiniTest,
  pickQuiz,
  readMistakes,
  reviewableDue,
  recordAttempt,
  recordMistake,
  reviewMistake,
  setMistakeExplanation,
  shuffleOptions,
  type MistakeItem,
} from './index'

const T0 = new Date(2026, 10, 28, 9, 0, 0)
const T1 = new Date(2026, 10, 29, 9, 0, 0)
const empty = (): Store => ({ schemaVersion: 9, data: {} })
const q = (id: string): Question => getQuestion(id)!

function finish(store: Store, questions: readonly Question[], chosen: Record<string, string>, now: Date, id = 'a1'): Store {
  const graded = gradeAttempt(questions, chosen)
  return recordAttempt(store, { id, quizId: 'mini-t1', seed: 's', startedAt: now, answers: graded.answers }, now)
}

function item(store: Store, id: string): MistakeItem {
  const value = readMistakes(store)[id]
  if (!isMistakeItem(value)) throw new Error(`không có ${id}`)
  return value
}

describe('pickMiniTest', () => {
  it.each(['a', 'b', 'seed-3', '2026-11-28'])('seed %s: 10 câu, mỗi tuần ≥ 2 câu, không trùng', (seed) => {
    const picked = pickMiniTest(QUESTION_BANK, seed, { canSpeak: true })
    expect(picked).toHaveLength(10)
    expect(new Set(picked.map((x) => x.id)).size).toBe(10)
    for (const w of ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']) {
      expect(picked.filter((x) => x.lessonId === w).length, w).toBeGreaterThanOrEqual(2)
    }
  })

  it('cùng seed → cùng câu, cùng thứ tự; seed khác → khác', () => {
    const a = pickMiniTest(QUESTION_BANK, 'x', { canSpeak: true }).map((x) => x.id)
    expect(pickMiniTest(QUESTION_BANK, 'x', { canSpeak: true }).map((x) => x.id)).toEqual(a)
    expect(pickMiniTest(QUESTION_BANK, 'y', { canSpeak: true }).map((x) => x.id)).not.toEqual(a)
  })

  it('không có TTS: mỗi câu nghe được thay bằng câu cùng bài; câu khác giữ nguyên', () => {
    let replaced = 0
    for (let i = 0; i < 40; i++) {
      const seed = `tts-${i}`
      const withTts = pickMiniTest(QUESTION_BANK, seed, { canSpeak: true })
      const without = pickMiniTest(QUESTION_BANK, seed, { canSpeak: false })
      const count = (list: Question[], lesson: string) => list.filter((x) => x.lessonId === lesson).length
      for (const w of ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']) expect(count(without, w), seed).toBe(count(withTts, w))
      const ids = new Set(without.map((x) => x.id))
      for (const x of withTts) if (x.kind !== 'listening') expect(ids.has(x.id), seed).toBe(true)
      replaced += withTts.filter((x) => x.kind === 'listening').length
    }
    expect(replaced).toBeGreaterThan(0)
  })

  it('không còn câu cùng bài thì lấy câu bài khác', () => {
    const quiz = { ...getQuiz('mini-t1')!, lessonIds: ['s1-t1-w1', 's1-t1-w2'], size: 3, minPerLesson: 1 }
    const listen = q('q-s1-t1-w1-06')
    const bank = [listen, q('q-s1-t1-w2-01'), q('q-s1-t1-w2-02'), q('q-s1-t1-w2-03')]
    const picked = pickQuiz(bank, quiz, 'x', { canSpeak: false })
    expect(picked).toHaveLength(3)
    expect(picked.every((x) => x.lessonId === 's1-t1-w2')).toBe(true)
  })

  it('không có TTS: bỏ câu nghe, vẫn đủ 10 câu và mỗi tuần ≥ 2 câu', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const picked = pickMiniTest(QUESTION_BANK, seed, { canSpeak: false })
      expect(picked).toHaveLength(10)
      expect(picked.some((x) => x.kind === 'listening')).toBe(false)
      for (const w of ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']) {
        expect(picked.filter((x) => x.lessonId === w).length).toBeGreaterThanOrEqual(2)
      }
    }
  })
})

describe('shuffleOptions', () => {
  it('giữ đủ 4 lựa chọn, xác định theo seed', () => {
    const question = q('q-s1-t1-w1-01')
    const a = shuffleOptions(question, 's1')
    expect([...a].sort()).toEqual([...question.options].sort())
    expect(shuffleOptions(question, 's1')).toEqual(a)
    const orders = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((s) => shuffleOptions(question, s).join('|')))
    expect(orders.size).toBeGreaterThan(1)
  })
})

describe('gradeAttempt / recordAttempt', () => {
  const ten = pickMiniTest(QUESTION_BANK, 'grade', { canSpeak: true })

  it('8 đúng, 2 sai → 8/10; 2 câu sai vào sổ; lần làm được lưu', () => {
    const chosen: Record<string, string> = {}
    ten.forEach((x, i) => {
      chosen[x.id] = i < 8 ? x.answer : x.options.find((o) => o !== x.answer)!
    })
    const graded = gradeAttempt(ten, chosen)
    expect(graded.score).toBe(8)
    expect(graded.total).toBe(10)
    const store = finish(empty(), ten, chosen, T0)
    const [attempt] = listAttempts(store)
    expect(attempt).toMatchObject({ id: 'a1', quizId: 'mini-t1', score: 8, total: 10, finishedAt: T0.toISOString() })
    expect(Object.keys(readMistakes(store)).sort()).toEqual([ten[8].id, ten[9].id].sort())
  })

  it('câu bỏ trống tính là sai', () => {
    expect(gradeAttempt([q('q-s1-t1-w1-01')], {})).toMatchObject({ score: 0, total: 1 })
  })

  it('sai q1 lần đầu → wrongCount 1, đến hạn ôn ngay, có nhãn và bài nguồn', () => {
    const store = finish(empty(), [q('q-s1-t1-w2-01')], { 'q-s1-t1-w2-01': 'work' }, T0)
    const m = item(store, 'q-s1-t1-w2-01')
    expect(m).toMatchObject({ wrongCount: 1, tag: 'thì', lessonId: 's1-t1-w2', sectionId: 'grammar', lastChosen: 'work' })
    expect(dueMistakes(readMistakes(store), T0).map((x) => x.id)).toEqual(['q-s1-t1-w2-01'])
  })

  it('sai lại ở test khác → wrongCount 2, lịch rút lại; lời giải thích giữ nguyên', () => {
    const id = 'q-s1-t1-w2-01'
    let store = finish(empty(), [q(id)], { [id]: 'work' }, T0)
    for (let i = 0; i < 3; i++) store = reviewMistake(store, id, true, q(id).answer, new Date(T1.getTime() + i * 30 * 86_400_000))
    store = setMistakeExplanation(store, id, 'Vì she…', 'gemini-2.5-flash', 'work', T1)
    const before = item(store, id).card.interval
    const later = new Date(T1.getTime() + 200 * 86_400_000)
    store = finish(store, [q(id)], { [id]: 'is work' }, later, 'a2')
    const m = item(store, id)
    expect(m.wrongCount).toBe(2)
    expect(m.card.interval).toBeLessThan(before)
    expect(m.card.learning).toBe(true)
    expect(m.explanation?.text).toBe('Vì she…')
  })

  it('store trống (chưa ghi lần làm nào) → không có lần làm, sổ trống', () => {
    expect(listAttempts(empty())).toEqual([])
    expect(listMistakes(readMistakes(empty()))).toEqual([])
  })
})

describe('isQuizAttempt', () => {
  const ok = {
    quizId: 'mini-t1',
    seed: 's',
    startedAt: T0.toISOString(),
    finishedAt: T0.toISOString(),
    updatedAt: T0.toISOString(),
    score: 1,
    total: 2,
    answers: [
      { questionId: 'a', chosen: 'x', correct: true },
      { questionId: 'b', chosen: 'y', correct: false },
    ],
  }
  it('điểm và tổng phải khớp với answers', () => {
    expect(isQuizAttempt(ok)).toBe(true)
    expect(isQuizAttempt({ ...ok, total: 3 })).toBe(false)
    expect(isQuizAttempt({ ...ok, score: 2 })).toBe(false)
    expect(isQuizAttempt({ ...ok, score: 0 })).toBe(false)
  })
})

describe('ôn Sổ lỗi', () => {
  const id = 'q-s1-t1-w1-01'
  const start = () => finish(empty(), [q(id)], { [id]: 'are' }, T0)

  it('ôn đúng → Nhớ: lịch giãn, không còn đến hạn', () => {
    const store = reviewMistake(start(), id, true, 'is', T0)
    const m = item(store, id)
    expect(m.card.learning).toBe(false)
    expect(m.card.interval).toBeGreaterThanOrEqual(1)
    expect(m.wrongCount).toBe(1)
    expect(dueMistakes(readMistakes(store), T0)).toEqual([])
  })

  it('ôn sai → Quên: wrongCount + 1, quay lại sớm', () => {
    const store = reviewMistake(start(), id, false, 'am', T0)
    expect(item(store, id)).toMatchObject({ wrongCount: 2, lastChosen: 'am' })
    expect(item(store, id).card.lapses).toBe(1)
  })

  it('khoảng ôn ≥ 21 ngày → "đã thuộc" nhưng vẫn trong sổ', () => {
    let store = start()
    let now = T0
    while (item(store, id).card.interval < MASTERED_INTERVAL_DAYS) {
      store = reviewMistake(store, id, true, 'is', now)
      now = new Date(Date.parse(item(store, id).card.due) + 3_600_000)
    }
    expect(isMastered(item(store, id))).toBe(true)
    expect(listMistakes(readMistakes(store)).map((m) => m.id)).toEqual([id])
  })

  it('lời giải thích lưu kèm đáp án đã chọn; sai lại bằng đáp án khác → "cho lần chọn trước"', () => {
    let store = setMistakeExplanation(start(), id, 'giải thích', 'gemini-2.5-flash', 'are', T0)
    expect(isExplanationStale(item(store, id))).toBe(false)
    store = reviewMistake(store, id, false, 'am', T1)
    expect(isExplanationStale(item(store, id))).toBe(true)
    store = setMistakeExplanation(store, id, 'mới', 'gemini-2.5-flash', 'am', T1)
    expect(item(store, id).explanation).toMatchObject({ text: 'mới', chosen: 'am' })
    expect(isExplanationStale(item(store, id))).toBe(false)
  })

  it('reviewableDue: bỏ câu nghe khi không có TTS (đếm số câu bỏ), bỏ câu không còn trong ngân hàng', () => {
    const ids = ['q-s1-t1-w1-01', 'q-s1-t1-w1-06']
    const chosen = Object.fromEntries(ids.map((x) => [x, q(x).options.find((o) => o !== q(x).answer)!]))
    const store = finish(empty(), ids.map(q), chosen, T0)
    const items = { ...readMistakes(store), ghost: { ...item(store, ids[0]) } }
    expect(reviewableDue(items, T0, { canSpeak: true })).toMatchObject({ skippedListening: 0 })
    expect(reviewableDue(items, T0, { canSpeak: true }).due.map((m) => m.id).sort()).toEqual([...ids].sort())
    const noTts = reviewableDue(items, T0, { canSpeak: false })
    expect(noTts.due.map((m) => m.id)).toEqual(['q-s1-t1-w1-01'])
    expect(noTts.skippedListening).toBe(1)
  })

  it('câu không có trong sổ → store không đổi', () => {
    const s = empty()
    expect(reviewMistake(s, 'nope', true, '', T0)).toBe(s)
    expect(setMistakeExplanation(s, 'nope', 'x', 'm', '', T0)).toBe(s)
  })

  it('lọc theo nhãn "thì" chỉ còn câu nhãn thì', () => {
    const ids = ['q-s1-t1-w1-01', 'q-s1-t1-w1-04', 'q-s1-t1-w1-05']
    const chosen = Object.fromEntries(ids.map((x) => [x, q(x).options.find((o) => o !== q(x).answer)!]))
    const store = finish(empty(), ids.map(q), chosen, T0)
    const list = listMistakes(readMistakes(store))
    expect(filterMistakes(list, 'thì').map((m) => m.id)).toEqual(['q-s1-t1-w1-01'])
    expect(filterMistakes(list, null)).toHaveLength(3)
  })
})

describe('gộp Sổ lỗi giữa hai máy', () => {
  const id = 'q-s1-t1-w3-01'
  const wrong = (s: Store, now: Date) => finish(s, [q(id)], { [id]: 'lives' }, now, `a-${now.getTime()}`)

  it('sai q1 ở A 2 lần, ở B 1 lần → sau đồng bộ wrongCount = 2', () => {
    const a = wrong(wrong(empty(), T0), T1)
    const b = wrong(empty(), new Date(T1.getTime() + 1000))
    const merged = mergeWithRemote(a, { schemaVersion: 9, data: b.data, updatedAt: T1.toISOString() })
    if (merged.kind !== 'merged') throw new Error('outdated')
    expect(item(merged.store, id).wrongCount).toBe(2)
    // Lần làm của cả hai máy đều còn.
    expect(listAttempts(merged.store)).toHaveLength(3)
  })

  it('hai bên đều có lời giải thích: bản mới hơn thắng cả hai chiều; lastChosen / lastWrongAt theo bên sai sau', () => {
    const base = wrong(empty(), T0)
    const later = new Date(T1.getTime() + 3_600_000)
    // A: giải thích cũ, sai lần cuối lúc T1 bằng "living". B: sai lúc T0 (chọn "lives"), giải thích mới hơn.
    const a = setMistakeExplanation(reviewMistake(base, id, false, 'living', T1), id, 'cũ', 'm', 'living', T1)
    const b = setMistakeExplanation(base, id, 'mới', 'm', 'lives', later)
    for (const [l, s] of [
      [a, b],
      [b, a],
    ]) {
      const merged = mergeMistakeItems(readMistakes(l), readMistakes(s))[id] as MistakeItem
      expect(merged.explanation).toMatchObject({ text: 'mới', chosen: 'lives' })
      expect(merged.lastChosen).toBe('living')
      expect(merged.lastWrongAt).toBe(T1.toISOString())
      expect(merged.wrongCount).toBe(2)
    }
  })

  it('lịch theo card.updatedAt mới hơn, lời giải thích bên có thắng bên null', () => {
    const base = wrong(empty(), T0)
    const a = setMistakeExplanation(base, id, 'giải thích', 'gemini-2.5-flash', 'lives', T0)
    const b = reviewMistake(base, id, true, 'live', T1)
    const merged = mergeMistakeItems(readMistakes(a), readMistakes(b))[id] as MistakeItem
    expect(merged.explanation?.text).toBe('giải thích')
    expect(merged.card).toEqual(item(b, id).card)
    // Đổi chiều cũng vậy.
    const back = mergeMistakeItems(readMistakes(b), readMistakes(a))[id] as MistakeItem
    expect(back.explanation?.text).toBe('giải thích')
    expect(back.card).toEqual(item(b, id).card)
  })
})

describe('mục sổ là một từ cần đọc (O.W.L., story 14)', () => {
  const src = { id: 'owl-ipa-tsl-o-clock', tag: 'phát âm' as const, lessonId: 's1-t1-w1', sectionId: 'pronunciation' as const }

  it('lưu chữ + IPA, ôn được bằng tự chấm dù không có câu trong ngân hàng', () => {
    const store = recordMistake(empty(), { ...src, word: { text: "o'clock", ipa: 'əˈklɑːk' } }, 'tự chấm: chưa đúng', T0)
    expect(item(store, src.id).word).toEqual({ text: "o'clock", ipa: 'əˈklɑːk' })
    expect(reviewableDue(readMistakes(store), T0, { canSpeak: false }).due.map((m) => m.id)).toEqual([src.id])
    const again = reviewMistake(store, src.id, false, 'tự chấm: chưa đúng', T1)
    expect(item(again, src.id).wrongCount).toBe(2)
    expect(item(again, src.id).word?.text).toBe("o'clock")
  })

  it('mục không có câu và không có từ vẫn bị bỏ khỏi ôn; word sai dạng thì mục không hợp lệ', () => {
    const store = recordMistake(empty(), src, 'x', T0)
    expect(reviewableDue(readMistakes(store), T0, { canSpeak: true }).due).toEqual([])
    expect(isMistakeItem({ ...item(store, src.id), word: { text: '', ipa: 'x' } })).toBe(false)
  })

  it('gộp giữ chữ của từ', () => {
    const withWord = recordMistake(empty(), { ...src, word: { text: "o'clock", ipa: 'ə' } }, 'x', T0)
    const without = recordMistake(empty(), src, 'x', T1)
    const merged = mergeMistakeItems(readMistakes(without), readMistakes(withWord))[src.id] as MistakeItem
    expect(merged.word?.text).toBe("o'clock")
  })
})
