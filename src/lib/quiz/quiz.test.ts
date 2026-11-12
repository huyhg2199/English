import { describe, expect, it } from 'vitest'

import { getQuestion, getQuiz, QUESTION_BANK, type ChoiceQuestion, type Question, type QuizDef, type TypedQuestion } from '@/data/questions'
import type { Store } from '@/lib/storage'
import { mergeMistakeItems, mergeWithRemote } from '@/lib/sync/merge'

import { seededRandom, shuffle } from './random'

import {
  dueMistakes,
  filterMistakes,
  gradeAttempt,
  isAnswerCorrect,
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
  seenQuestionIds,
  setMistakeExplanation,
  shuffleOptions,
  type MistakeItem,
} from './index'

const T0 = new Date(2026, 10, 28, 9, 0, 0)
const T1 = new Date(2026, 10, 29, 9, 0, 0)
const empty = (): Store => ({ schemaVersion: 9, data: {} })
const q = (id: string): ChoiceQuestion => getQuestion(id) as ChoiceQuestion

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
  const ten = pickMiniTest(QUESTION_BANK, 'grade', { canSpeak: true }) as ChoiceQuestion[]

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

/** Bản `pickQuiz` trước story 35 (chép nguyên), để chứng minh `seen` rỗng cho đúng đề cũ. */
function legacyPickQuiz(bank: readonly Question[], quiz: QuizDef, seed: string, opts: { canSpeak: boolean }): Question[] {
  const random = seededRandom(`${seed}|pick`)
  const pool = bank.filter((x) => quiz.lessonIds.includes(x.lessonId))
  const groups = quiz.lessonIds.map((id) => shuffle(pool.filter((x) => x.lessonId === id), random))
  const chosen = groups.flatMap((g) => g.slice(0, quiz.minPerLesson))
  const rest = shuffle(
    groups.flatMap((g) => g.slice(quiz.minPerLesson)),
    random,
  )
  chosen.push(...rest.slice(0, Math.max(0, quiz.size - chosen.length)))
  let picked = chosen.slice(0, quiz.size)
  if (!opts.canSpeak) {
    const used = new Set(picked.map((x) => x.id))
    const spare = shuffle(
      pool.filter((x) => !used.has(x.id) && x.kind !== 'listening'),
      random,
    )
    picked = picked.flatMap((x) => {
      if (x.kind !== 'listening') return [x]
      if (spare.length === 0) return []
      const same = spare.findIndex((y) => y.lessonId === x.lessonId)
      return spare.splice(same >= 0 ? same : 0, 1)
    })
  }
  return shuffle(picked, random)
}

describe('pickQuiz ưu tiên câu chưa gặp (story 35)', () => {
  const lessonQuiz = getQuiz('lesson-s1-t2-w1')!
  const miniT2 = getQuiz('mini-t2')!
  const seeds = Array.from({ length: 24 }, (_, i) => `seen-${i}`)
  const ids = (list: readonly Question[]) => list.map((x) => x.id)
  const w1 = QUESTION_BANK.filter((x) => x.lessonId === 's1-t2-w1')

  it('seen rỗng hoặc không truyền → đúng đề cũ (cùng seed, cùng thứ tự)', () => {
    for (const quiz of [lessonQuiz, miniT2]) {
      for (const seed of seeds) {
        for (const canSpeak of [true, false]) {
          const old = ids(legacyPickQuiz(QUESTION_BANK, quiz, seed, { canSpeak }))
          expect(ids(pickQuiz(QUESTION_BANK, quiz, seed, { canSpeak })), `${quiz.id} ${seed}`).toEqual(old)
          expect(ids(pickQuiz(QUESTION_BANK, quiz, seed, { canSpeak, seen: new Set() })), `${quiz.id} ${seed}`).toEqual(old)
        }
      }
    }
  })

  it('bài 14 câu (story 36), đã gặp 9 câu → lần sau bốc đúng 5 câu còn lại', () => {
    expect(w1).toHaveLength(14)
    for (const seed of seeds) {
      const first = pickQuiz(QUESTION_BANK, lessonQuiz, `${seed}-a`, { canSpeak: true })
      expect(first).toHaveLength(5)
      // 5 câu vừa làm cộng 4 câu chưa làm khác (theo thứ tự ngân hàng) → còn đúng 5 câu chưa gặp.
      const others = w1.map((x) => x.id).filter((id) => !ids(first).includes(id)).slice(0, 4)
      const seen = new Set([...ids(first), ...others])
      const second = pickQuiz(QUESTION_BANK, lessonQuiz, `${seed}-b`, { canSpeak: true, seen })
      expect(new Set(ids(second)), seed).toEqual(new Set(w1.map((x) => x.id).filter((id) => !seen.has(id))))
    }
  })

  it('đã gặp hết → vẫn đủ 5 câu, không trùng', () => {
    const seen = new Set(w1.map((x) => x.id))
    for (const seed of seeds) {
      const picked = pickQuiz(QUESTION_BANK, lessonQuiz, seed, { canSpeak: true, seen })
      expect(picked).toHaveLength(5)
      expect(new Set(ids(picked)).size).toBe(5)
    }
  })

  it('mini-t2 có seen: vẫn 10 câu, mỗi bài ≥ 2 câu, không trùng, câu chưa gặp được lấy trước', () => {
    const seen = new Set(QUESTION_BANK.filter((x) => x.lessonId.startsWith('s1-t2-')).slice(0, 14).map((x) => x.id))
    for (const seed of seeds) {
      for (const canSpeak of [true, false]) {
        const picked = pickQuiz(QUESTION_BANK, miniT2, seed, { canSpeak, seen })
        expect(picked).toHaveLength(10)
        expect(new Set(ids(picked)).size).toBe(10)
        for (const l of miniT2.lessonIds) expect(picked.filter((x) => x.lessonId === l).length, `${seed} ${l}`).toBeGreaterThanOrEqual(2)
      }
      // Mỗi bài có ≥ 2 câu chưa gặp thì 2 câu tối thiểu của bài đều là câu chưa gặp.
      const picked = pickQuiz(QUESTION_BANK, miniT2, seed, { canSpeak: true, seen })
      for (const l of miniT2.lessonIds) {
        const unseen = QUESTION_BANK.filter((x) => x.lessonId === l && !seen.has(x.id)).length
        const got = picked.filter((x) => x.lessonId === l && !seen.has(x.id)).length
        expect(got, `${seed} ${l}`).toBeGreaterThanOrEqual(Math.min(2, unseen))
      }
    }
  })

  it('không có TTS: câu thay câu nghe là câu chưa gặp cùng bài', () => {
    const listening = w1.filter((x) => x.kind === 'listening')
    expect(listening.map((x) => x.id)).toEqual(['q-s1-t2-w1-06'])
    // Đã gặp 8 câu không nghe (bài có 13 câu không nghe sau story 36) → còn đúng 5 câu chưa gặp không nghe + 1 câu nghe.
    const seen = new Set(w1.filter((x) => x.kind !== 'listening').slice(0, 8).map((x) => x.id))
    const unseenNonListening = w1.filter((x) => x.kind !== 'listening' && !seen.has(x.id)).map((x) => x.id)
    expect(unseenNonListening).toHaveLength(5)
    let replaced = 0
    for (const seed of seeds) {
      const withTts = pickQuiz(QUESTION_BANK, lessonQuiz, seed, { canSpeak: true, seen })
      if (withTts.some((x) => x.kind === 'listening')) replaced++
      const without = pickQuiz(QUESTION_BANK, lessonQuiz, seed, { canSpeak: false, seen })
      expect(new Set(ids(without)), seed).toEqual(new Set(unseenNonListening))
    }
    expect(replaced).toBeGreaterThan(0)
  })

  it('seenQuestionIds: lấy câu của lần làm đã chấm, bỏ lần "Để sau", lần làm hỏng và loại lạ', () => {
    const graded = finish(empty(), [q('q-s1-t1-w1-01'), q('q-s1-t1-w1-02')], { 'q-s1-t1-w1-01': 'is' }, T0)
    const attempt = (over: Record<string, unknown>) => ({
      quizId: 'mini-t1',
      seed: 's',
      startedAt: T0.toISOString(),
      finishedAt: T0.toISOString(),
      updatedAt: T0.toISOString(),
      score: 0,
      total: 1,
      answers: [{ questionId: 'q-x', chosen: '', correct: false }],
      ...over,
    })
    const quizzes = graded.data.quizzes as { attempts: Record<string, unknown> }
    const store: Store = {
      ...graded,
      data: {
        ...graded.data,
        quizzes: {
          attempts: {
            ...quizzes.attempts,
            skipped: attempt({ kind: 'comeback', skipped: true, total: 0, answers: [] }),
            broken: attempt({ answers: [{ questionId: 'q-broken', chosen: '', correct: false }], total: 2 }),
            future: attempt({ kind: 'newt', answers: [{ questionId: 'q-future', chosen: '', correct: false }] }),
          },
        },
      },
    }
    expect([...seenQuestionIds(store)].sort()).toEqual(['q-s1-t1-w1-01', 'q-s1-t1-w1-02'])
    expect(seenQuestionIds(empty()).size).toBe(0)
  })
})

describe('chấm câu gõ (story 35)', () => {
  const typed: TypedQuestion = {
    ...(getQuestion('q-s1-t2-w1-08') as TypedQuestion),
    id: 'q-test-typed',
    answer: "isn't working",
  }

  it('gradeAttempt chấm câu gõ "is not working" là đúng, câu choice khác chữ hoa là sai', () => {
    const choice = q('q-s1-t1-w1-01')
    expect(choice.answer).toBe('is')
    const graded = gradeAttempt([typed, choice], { [typed.id]: 'is not working', [choice.id]: 'Is' })
    expect(graded.answers.map((a) => a.correct)).toEqual([true, false])
    expect(graded.answers[0].chosen).toBe('is not working')
    expect(graded.score).toBe(1)
  })

  it('isAnswerCorrect: câu gõ dùng matchesTyped (accept, ô trống sai); câu chọn so khớp đúng', () => {
    expect(isAnswerCorrect(typed, 'ISNT WORKING!')).toBe(true)
    expect(isAnswerCorrect(typed, "doesn't working")).toBe(false)
    expect(isAnswerCorrect(typed, '')).toBe(false)
    expect(isAnswerCorrect({ ...typed, accept: ['is off'] }, 'is off')).toBe(true)
    expect(isAnswerCorrect(q('q-s1-t1-w1-01'), 'is')).toBe(true)
    expect(isAnswerCorrect(q('q-s1-t1-w1-01'), 'is ')).toBe(false)
  })

  it('câu gõ sai vào Sổ lỗi với lastChosen là chữ đã gõ; shuffleOptions trả []', () => {
    const real = getQuestion('q-s1-t2-w1-09')!
    const store = finish(empty(), [real], { [real.id]: 'They are waiting for the bus?' }, T0)
    expect(listAttempts(store)[0].answers[0]).toEqual({ questionId: real.id, chosen: 'They are waiting for the bus?', correct: false })
    expect(item(store, real.id).lastChosen).toBe('They are waiting for the bus?')
    expect(shuffleOptions(real, 's')).toEqual([])
    const ok = finish(empty(), [real], { [real.id]: 'are they waiting for the bus' }, T0)
    expect(readMistakes(ok)).toEqual({})
  })
})

/**
 * Đề ở baseline 79d47ee (trước story 40): `pickQuiz(QUESTION_BANK, quiz, seed, { canSpeak, seen? })`, khoá `quiz|seed|canSpeak[|seen]`.
 * Bài test không có `only` / `mix` phải ra đúng đề cũ.
 */
const BASELINE_SEEN = new Set([
  'q-s1-t2-w2-01', 'q-s1-t2-w2-05', 'q-s1-t2-w1-01', 'q-s1-t2-w3-02', 'q-s1-t1-w1-01', 'q-s1-t1-w2-04', 'q-s1-t4-w3-03', 'q-s1-t4-w3-17',
])
const BASELINE_PICKS: Record<string, readonly string[]> = {
  'mini-t1|a|true': ['q-s1-t1-w3-08', 'q-s1-t1-w1-02', 'q-s1-t1-w1-03', 'q-s1-t1-w4-08', 'q-s1-t1-w2-16', 'q-s1-t1-w3-15', 'q-s1-t1-w1-04', 'q-s1-t1-w2-07', 'q-s1-t1-w2-08', 'q-s1-t1-w4-05'],
  'mini-t1|a|true|seen': ['q-s1-t1-w3-08', 'q-s1-t1-w1-02', 'q-s1-t1-w1-05', 'q-s1-t1-w4-08', 'q-s1-t1-w2-16', 'q-s1-t1-w3-15', 'q-s1-t1-w1-04', 'q-s1-t1-w2-07', 'q-s1-t1-w2-08', 'q-s1-t1-w4-05'],
  'mini-t1|a|false': ['q-s1-t1-w4-02', 'q-s1-t1-w2-08', 'q-s1-t1-w4-05', 'q-s1-t1-w1-03', 'q-s1-t1-w3-15', 'q-s1-t1-w1-04', 'q-s1-t1-w2-16', 'q-s1-t1-w3-08', 'q-s1-t1-w1-02', 'q-s1-t1-w2-05'],
  'mini-t1|a|false|seen': ['q-s1-t1-w4-02', 'q-s1-t1-w2-08', 'q-s1-t1-w4-05', 'q-s1-t1-w1-05', 'q-s1-t1-w3-15', 'q-s1-t1-w1-04', 'q-s1-t1-w2-16', 'q-s1-t1-w3-08', 'q-s1-t1-w1-02', 'q-s1-t1-w2-05'],
  'mini-t1|b|true': ['q-s1-t1-w1-03', 'q-s1-t1-w1-04', 'q-s1-t1-w1-06', 'q-s1-t1-w3-13', 'q-s1-t1-w2-11', 'q-s1-t1-w2-09', 'q-s1-t1-w4-05', 'q-s1-t1-w2-10', 'q-s1-t1-w4-01', 'q-s1-t1-w3-12'],
  'mini-t1|b|true|seen': ['q-s1-t1-w1-03', 'q-s1-t1-w3-06', 'q-s1-t1-w1-06', 'q-s1-t1-w3-13', 'q-s1-t1-w2-11', 'q-s1-t1-w1-04', 'q-s1-t1-w4-05', 'q-s1-t1-w2-10', 'q-s1-t1-w4-01', 'q-s1-t1-w3-12'],
  'mini-t1|b|false': ['q-s1-t1-w1-01', 'q-s1-t1-w4-01', 'q-s1-t1-w3-13', 'q-s1-t1-w2-11', 'q-s1-t1-w2-09', 'q-s1-t1-w3-12', 'q-s1-t1-w4-05', 'q-s1-t1-w1-04', 'q-s1-t1-w1-03', 'q-s1-t1-w2-10'],
  'mini-t1|b|false|seen': ['q-s1-t1-w4-05', 'q-s1-t1-w4-01', 'q-s1-t1-w3-13', 'q-s1-t1-w1-02', 'q-s1-t1-w1-04', 'q-s1-t1-w3-16', 'q-s1-t1-w3-12', 'q-s1-t1-w2-10', 'q-s1-t1-w2-11', 'q-s1-t1-w1-03'],
  'mini-t2|a|true': ['q-s1-t2-w4-03', 'q-s1-t2-w3-01', 'q-s1-t2-w1-07', 'q-s1-t2-w3-04', 'q-s1-t2-w2-06', 'q-s1-t2-w2-21', 'q-s1-t2-w4-01', 'q-s1-t2-w1-03', 'q-s1-t2-w3-13', 'q-s1-t2-w2-26'],
  'mini-t2|a|true|seen': ['q-s1-t2-w4-03', 'q-s1-t2-w3-01', 'q-s1-t2-w1-07', 'q-s1-t2-w3-04', 'q-s1-t2-w2-06', 'q-s1-t2-w2-20', 'q-s1-t2-w4-01', 'q-s1-t2-w1-03', 'q-s1-t2-w3-13', 'q-s1-t2-w2-26'],
  'mini-t2|a|false': ['q-s1-t2-w1-07', 'q-s1-t2-w2-26', 'q-s1-t2-w3-13', 'q-s1-t2-w2-08', 'q-s1-t2-w4-01', 'q-s1-t2-w3-04', 'q-s1-t2-w4-03', 'q-s1-t2-w1-03', 'q-s1-t2-w3-01', 'q-s1-t2-w2-21'],
  'mini-t2|a|false|seen': ['q-s1-t2-w1-07', 'q-s1-t2-w2-26', 'q-s1-t2-w3-13', 'q-s1-t2-w2-08', 'q-s1-t2-w4-01', 'q-s1-t2-w3-04', 'q-s1-t2-w4-03', 'q-s1-t2-w1-03', 'q-s1-t2-w3-01', 'q-s1-t2-w2-20'],
  'mini-t2|b|true': ['q-s1-t2-w3-14', 'q-s1-t2-w2-16', 'q-s1-t2-w3-08', 'q-s1-t2-w3-05', 'q-s1-t2-w4-04', 'q-s1-t2-w1-06', 'q-s1-t2-w2-19', 'q-s1-t2-w4-05', 'q-s1-t2-w1-04', 'q-s1-t2-w2-13'],
  'mini-t2|b|true|seen': ['q-s1-t2-w2-12', 'q-s1-t2-w2-16', 'q-s1-t2-w3-08', 'q-s1-t2-w3-05', 'q-s1-t2-w4-04', 'q-s1-t2-w1-06', 'q-s1-t2-w2-03', 'q-s1-t2-w4-05', 'q-s1-t2-w1-04', 'q-s1-t2-w2-13'],
  'mini-t2|b|false': ['q-s1-t2-w3-05', 'q-s1-t2-w2-19', 'q-s1-t2-w3-14', 'q-s1-t2-w4-04', 'q-s1-t2-w2-13', 'q-s1-t2-w2-16', 'q-s1-t2-w4-05', 'q-s1-t2-w3-08', 'q-s1-t2-w1-03', 'q-s1-t2-w1-04'],
  'mini-t2|b|false|seen': ['q-s1-t2-w3-05', 'q-s1-t2-w2-03', 'q-s1-t2-w2-12', 'q-s1-t2-w4-04', 'q-s1-t2-w2-13', 'q-s1-t2-w2-16', 'q-s1-t2-w4-05', 'q-s1-t2-w3-08', 'q-s1-t2-w1-03', 'q-s1-t2-w1-04'],
  'lesson-s1-t2-w2|a|true': ['q-s1-t2-w2-21', 'q-s1-t2-w2-22', 'q-s1-t2-w2-12', 'q-s1-t2-w2-25', 'q-s1-t2-w2-23'],
  'lesson-s1-t2-w2|a|true|seen': ['q-s1-t2-w2-21', 'q-s1-t2-w2-22', 'q-s1-t2-w2-12', 'q-s1-t2-w2-25', 'q-s1-t2-w2-23'],
  'lesson-s1-t2-w2|a|false': ['q-s1-t2-w2-25', 'q-s1-t2-w2-22', 'q-s1-t2-w2-12', 'q-s1-t2-w2-23', 'q-s1-t2-w2-21'],
  'lesson-s1-t2-w2|a|false|seen': ['q-s1-t2-w2-25', 'q-s1-t2-w2-22', 'q-s1-t2-w2-12', 'q-s1-t2-w2-23', 'q-s1-t2-w2-21'],
  'lesson-s1-t2-w2|b|true': ['q-s1-t2-w2-16', 'q-s1-t2-w2-12', 'q-s1-t2-w2-17', 'q-s1-t2-w2-15', 'q-s1-t2-w2-13'],
  'lesson-s1-t2-w2|b|true|seen': ['q-s1-t2-w2-16', 'q-s1-t2-w2-12', 'q-s1-t2-w2-17', 'q-s1-t2-w2-15', 'q-s1-t2-w2-13'],
  'lesson-s1-t2-w2|b|false': ['q-s1-t2-w2-13', 'q-s1-t2-w2-12', 'q-s1-t2-w2-15', 'q-s1-t2-w2-17', 'q-s1-t2-w2-16'],
  'lesson-s1-t2-w2|b|false|seen': ['q-s1-t2-w2-13', 'q-s1-t2-w2-12', 'q-s1-t2-w2-15', 'q-s1-t2-w2-17', 'q-s1-t2-w2-16'],
  'lesson-s1-t4-w3|a|true': ['q-s1-t4-w3-21', 'q-s1-t4-w3-22', 'q-s1-t4-w3-12', 'q-s1-t4-w3-25', 'q-s1-t4-w3-23'],
  'lesson-s1-t4-w3|a|true|seen': ['q-s1-t4-w3-21', 'q-s1-t4-w3-22', 'q-s1-t4-w3-12', 'q-s1-t4-w3-25', 'q-s1-t4-w3-23'],
  'lesson-s1-t4-w3|a|false': ['q-s1-t4-w3-25', 'q-s1-t4-w3-22', 'q-s1-t4-w3-12', 'q-s1-t4-w3-23', 'q-s1-t4-w3-21'],
  'lesson-s1-t4-w3|a|false|seen': ['q-s1-t4-w3-25', 'q-s1-t4-w3-22', 'q-s1-t4-w3-12', 'q-s1-t4-w3-23', 'q-s1-t4-w3-21'],
  'lesson-s1-t4-w3|b|true': ['q-s1-t4-w3-16', 'q-s1-t4-w3-12', 'q-s1-t4-w3-17', 'q-s1-t4-w3-15', 'q-s1-t4-w3-13'],
  'lesson-s1-t4-w3|b|true|seen': ['q-s1-t4-w3-13', 'q-s1-t4-w3-12', 'q-s1-t4-w3-16', 'q-s1-t4-w3-15', 'q-s1-t4-w3-01'],
  'lesson-s1-t4-w3|b|false': ['q-s1-t4-w3-13', 'q-s1-t4-w3-12', 'q-s1-t4-w3-15', 'q-s1-t4-w3-17', 'q-s1-t4-w3-16'],
  'lesson-s1-t4-w3|b|false|seen': ['q-s1-t4-w3-01', 'q-s1-t4-w3-12', 'q-s1-t4-w3-15', 'q-s1-t4-w3-16', 'q-s1-t4-w3-13'],
}

describe('đề cũ không đổi (story 40)', () => {
  it('mini-t1, mini-t2, lesson-s1-t2-w2, lesson-s1-t4-w3 × seed a / b × có / không TTS (có và không có seen) ra đúng đề baseline', () => {
    expect(Object.keys(BASELINE_PICKS)).toHaveLength(32)
    for (const [key, ids] of Object.entries(BASELINE_PICKS)) {
      const [quizId, seed, speak, withSeen] = key.split('|')
      const opts = { canSpeak: speak === 'true', ...(withSeen ? { seen: BASELINE_SEEN } : {}) }
      expect(pickQuiz(QUESTION_BANK, getQuiz(quizId)!, seed, opts).map((x) => x.id), key).toEqual(ids)
    }
  })
})
