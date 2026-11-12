import { describe, expect, it } from 'vitest'

import { getLesson } from '@/data/roadmap'
import {
  getQuestion,
  isTypedQuestion,
  OWL_CONTRASTS,
  OWL_QUESTIONS,
  OWL_TOPICS,
  QUESTION_BANK,
  type ChoiceQuestion,
  type OwlQuestion,
  type OwlTopicId,
  type Question,
} from '@/data/questions'
import type { Word } from '@/data/vocab'
import {
  isMastered,
  isMistakeItem,
  isQuizAttempt,
  listMistakes,
  readAttempts,
  readMistakes,
  recordMistake,
  reviewableDue,
  reviewMistake,
  type AttemptAnswer,
} from '@/lib/quiz'
import { gradeCard, markCardKnown } from '@/lib/srs'
import type { Store } from '@/lib/storage'
import { mergeQuizAttempts } from '@/lib/sync/merge'
import { dumbledoreCount } from '@/lib/trophies'

import {
  activeReviewPlan,
  gradeOwl,
  gradeOwlTopics,
  heardWord,
  matchHeardWord,
  listOwlAttempts,
  OWL_WORD_SECTION,
  owlPassed,
  owlTopicNames,
  owlWordQuestionId,
  questionTopic,
  partPassed,
  partPercent,
  pickOwlPronunciation,
  pickOwlTenses,
  readOwlDetails,
  recordOwlAttempt,
  reviewPlan,
  topicReviewLessonId,
  validateEts,
  weakTopics,
  type OwlAttemptInput,
} from './index'

const T0 = new Date(2027, 1, 26, 9, 0, 0)
const empty = (): Store => ({ schemaVersion: 12, data: {} })

function word(list: 'ngsl' | 'tsl', rank: number, details = true): Word {
  const text = `${list}w${rank}`
  return {
    id: `${list}-${text}`,
    word: text,
    list,
    rank,
    ...(details
      ? {
          pos: 'noun',
          ipa: `ipa${rank}`,
          syllables: [text],
          stressIndex: 0,
          meaningVi: 'nghĩa',
          exampleEn: 'Example.',
          exampleVi: 'Ví dụ.',
        }
      : {}),
  } as Word
}

/** 200 từ NGSL (từ hạng 5 không có dữ liệu) + 20 TSL. */
const WORDS: Word[] = [
  ...Array.from({ length: 200 }, (_, i) => word('ngsl', i + 1, i + 1 !== 5)),
  ...Array.from({ length: 20 }, (_, i) => word('tsl', i + 1)),
]

function learn(store: Store, ids: readonly string[]): Store {
  return ids.reduce((s, id) => gradeCard(s, id, 'good', T0), store)
}

const ngslIds = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `ngsl-ngslw${from + i}`).filter((id) => id !== 'ngsl-ngslw5')

function answers(ids: readonly string[], correctCount: number): AttemptAnswer[] {
  return ids.map((questionId, i) => ({ questionId, chosen: i < correctCount ? 'ok' : 'x', correct: i < correctCount }))
}

const pronIds = (n: number) => Array.from({ length: n }, (_, i) => owlWordQuestionId(`ngsl-ngslw${100 + i}`))
const pronWords = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: owlWordQuestionId(`ngsl-ngslw${100 + i}`),
    wordId: `ngsl-ngslw${100 + i}`,
    word: `ngslw${100 + i}`,
    ipa: `ipa${100 + i}`,
  }))
/** Một đề thì cố định từ kho O.W.L. (story 40): 20 câu, mỗi chủ điểm 2 câu. */
const EXAM: readonly OwlQuestion[] = pickOwlTenses(OWL_QUESTIONS, 'test-exam')
const tenseIds = (n: number) => EXAM.slice(0, n).map((q) => q.id)

/** Trả lời một câu: đúng là đáp án; sai là một lựa chọn khác (câu chọn) hoặc chữ gõ sai (câu gõ). */
function answerOf(q: Question, correct: boolean): AttemptAnswer {
  const wrong = isTypedQuestion(q) ? 'x' : q.options.find((o) => o !== q.answer)!
  return { questionId: q.id, chosen: correct ? q.answer : wrong, correct }
}

function tenseAnswers(n: number, correctCount: number): AttemptAnswer[] {
  return EXAM.slice(0, n).map((q, i) => answerOf(q, i < correctCount))
}

/**
 * Nguồn phần thì của story 14 (trước story 40): câu chọn nhãn `thì` của chặng 1 trong `QUESTION_BANK`. Dùng để dựng lần thi
 * cũ (không có chủ điểm), kế hoạch giữ đúng logic cũ.
 */
const LEGACY_POOL = QUESTION_BANK.filter(
  (q): q is ChoiceQuestion => q.tag === 'thì' && q.kind === 'choice' && getLesson(q.lessonId)?.stageId === 's1',
)
const legacyAnswers = (n: number, correctCount: number) => LEGACY_POOL.slice(0, n).map((q, i) => answerOf(q, i < correctCount))

function input(pronCorrect: number, tenseCorrect: number, id = 'owl-a'): OwlAttemptInput {
  return {
    id,
    seed: 's',
    startedAt: T0,
    pronunciation: answers(pronIds(30), pronCorrect),
    words: pronWords(30),
    tenses: tenseAnswers(20, tenseCorrect),
  }
}

describe('kho câu thì O.W.L. 1 (story 40)', () => {
  it('42 câu nhãn thì của chặng 1, ngoài QUESTION_BANK; đề thử có 20 câu', () => {
    expect(OWL_QUESTIONS).toHaveLength(42)
    const bank = new Set(QUESTION_BANK.map((q) => q.id))
    for (const q of OWL_QUESTIONS) {
      expect(q.tag).toBe('thì')
      expect(q.lessonId.startsWith('s1-')).toBe(true)
      expect(bank.has(q.id)).toBe(false)
    }
    expect(EXAM).toHaveLength(20)
    expect(LEGACY_POOL.length).toBeGreaterThanOrEqual(20)
  })
})

describe('pickOwlPronunciation', () => {
  it('120 thẻ đã học → 30 từ khác nhau đều từ thẻ đã học, có IPA', () => {
    const learned = ngslIds(1, 121)
    const store = learn(empty(), learned)
    const picked = pickOwlPronunciation(store, WORDS, 'seed-1')
    expect(picked).toHaveLength(30)
    expect(new Set(picked.map((w) => w.word)).size).toBe(30)
    for (const w of picked) {
      expect(learned).toContain(w.wordId)
      expect(w.ipa).toMatch(/^ipa/)
      expect(w.id).toBe(owlWordQuestionId(w.wordId))
    }
  })

  it('cùng seed → cùng đề; seed khác → khác', () => {
    const store = learn(empty(), ngslIds(1, 121))
    const a = pickOwlPronunciation(store, WORDS, 'x').map((w) => w.id)
    expect(pickOwlPronunciation(store, WORDS, 'x').map((w) => w.id)).toEqual(a)
    expect(pickOwlPronunciation(store, WORDS, 'y').map((w) => w.id)).not.toEqual(a)
  })

  it('10 thẻ đã học → 10 từ đó + 20 NGSL hạng thấp nhất có dữ liệu', () => {
    const learned = ngslIds(150, 159)
    const picked = pickOwlPronunciation(learn(empty(), learned), WORDS, 's')
    expect(picked).toHaveLength(30)
    expect(picked.slice(0, 10).map((w) => w.wordId).sort()).toEqual([...learned].sort())
    // Hạng 1–21 trừ hạng 5 (không có dữ liệu).
    expect(picked.slice(10).map((w) => w.wordId)).toEqual(ngslIds(1, 21))
  })

  it('bỏ thẻ "Đã biết" và thẻ sai dạng; thẻ không trùng với phần bù', () => {
    let store = learn(empty(), ngslIds(1, 3))
    store = markCardKnown(store, 'ngsl-ngslw50', T0)
    store = { ...store, data: { ...store.data, srs: { cards: { ...(store.data.srs as { cards: object }).cards, 'ngsl-ngslw60': { bad: 1 } } } } }
    const picked = pickOwlPronunciation(store, WORDS, 's').map((w) => w.wordId)
    expect(picked).not.toContain('ngsl-ngslw50')
    expect(picked).not.toContain('ngsl-ngslw60')
    expect(new Set(picked).size).toBe(30)
    expect(picked.filter((id) => id === 'ngsl-ngslw1')).toHaveLength(1)
  })
})

describe('pickOwlTenses', () => {
  it('20 câu thì chặng 1, không trùng, xác định theo seed', () => {
    const a = pickOwlTenses(OWL_QUESTIONS, 'a')
    expect(a).toHaveLength(20)
    expect(new Set(a.map((q) => q.id)).size).toBe(20)
    for (const q of a) expect(q.tag).toBe('thì')
    expect(pickOwlTenses(OWL_QUESTIONS, 'a').map((q) => q.id)).toEqual(a.map((q) => q.id))
    expect(pickOwlTenses(OWL_QUESTIONS, 'b').map((q) => q.id)).not.toEqual(a.map((q) => q.id))
  })

  it('200 seed: mỗi chủ điểm đúng 2 câu, đúng 4 câu cặp (mỗi cặp 1), ≥ 6 câu gõ, không câu nào của QUESTION_BANK', () => {
    const bank = new Set(QUESTION_BANK.map((q) => q.id))
    const typedCounts = new Set<number>()
    for (let i = 0; i < 200; i++) {
      const seed = `seed-${i}`
      const exam = pickOwlTenses(OWL_QUESTIONS, seed)
      expect(exam, seed).toHaveLength(20)
      expect(new Set(exam.map((q) => q.id)).size, seed).toBe(20)
      for (const t of OWL_TOPICS) expect(exam.filter((q) => q.topicId === t.id), `${seed} ${t.id}`).toHaveLength(2)
      const pairs = exam.filter((q) => q.contrastId)
      expect(pairs, seed).toHaveLength(4)
      for (const c of OWL_CONTRASTS) expect(pairs.filter((q) => q.contrastId === c.id), `${seed} ${c.id}`).toHaveLength(1)
      const typed = exam.filter(isTypedQuestion).length
      typedCounts.add(typed)
      expect(typed, seed).toBeGreaterThanOrEqual(6)
      for (const q of exam) expect(bank.has(q.id), q.id).toBe(false)
      expect(pickOwlTenses(OWL_QUESTIONS, seed).map((q) => q.id), seed).toEqual(exam.map((q) => q.id))
    }
    // Đề thật sự thay đổi theo seed (không cố định một số câu gõ).
    expect(typedCounts.size).toBeGreaterThan(1)
  })

  it('kho thiếu câu: trả ít hơn, không lỗi', () => {
    expect(pickOwlTenses([], 'a')).toEqual([])
    const noPairs = OWL_QUESTIONS.filter((q) => !q.contrastId)
    const exam = pickOwlTenses(noPairs, 'a')
    expect(exam).toHaveLength(20)
    for (const t of OWL_TOPICS) expect(exam.filter((q) => q.topicId === t.id)).toHaveLength(2)
    const few = OWL_QUESTIONS.filter((q) => q.topicId === 'will')
    const small = pickOwlTenses(few, 'a')
    expect(small.length).toBeLessThan(20)
    expect(small.every((q) => q.topicId === 'will')).toBe(true)
  })
})

describe('điểm từng chủ điểm (story 40)', () => {
  it('questionTopic: câu kho O.W.L. có chủ điểm; câu QUESTION_BANK, câu lạ thì không', () => {
    expect(questionTopic(getQuestion('q-owl-34'))).toBe('past-to-be')
    expect(questionTopic(getQuestion('q-s1-t1-w1-01'))).toBeUndefined()
    expect(questionTopic(undefined)).toBeUndefined()
  })

  it('gradeOwlTopics: chỉ tính câu có chủ điểm (bỏ câu QUESTION_BANK, owl-ipa-*); weakTopics: 1/2 là yếu, 2/2 không', () => {
    const will = OWL_QUESTIONS.filter((q) => q.topicId === 'will').slice(0, 2)
    const toBe = OWL_QUESTIONS.filter((q) => q.topicId === 'to-be').slice(0, 2)
    const modals = OWL_QUESTIONS.filter((q) => q.topicId === 'modals').slice(0, 2)
    const scores = gradeOwlTopics([
      ...answers(pronIds(3), 0),
      answerOf(LEGACY_POOL[0], false),
      answerOf(will[0], true),
      answerOf(will[1], false),
      ...toBe.map((q) => answerOf(q, true)),
      ...modals.map((q) => answerOf(q, false)),
    ])
    expect(scores).toEqual({
      'to-be': { score: 2, total: 2 },
      will: { score: 1, total: 2 },
      modals: { score: 0, total: 2 },
    })
    // % thấp trước, hoà theo thứ tự bảng.
    expect(weakTopics(scores)).toEqual(['modals', 'will'])
    expect(weakTopics({ 'passive-present': { score: 1, total: 2 }, will: { score: 1, total: 2 } })).toEqual([
      'will',
      'passive-present',
    ])
    expect(weakTopics({})).toEqual([])
    expect(owlTopicNames(['will', 'modals', 'passive-present'])).toBe('Tương lai will, can / should / must, Bị động hiện tại')
  })
})

describe('heardWord', () => {
  it('nghe ra đúng từ trong một phương án', () => {
    expect(heardWord('water', ['Water'])).toBe(true)
    expect(heardWord('water', ['what her', 'the water.'])).toBe(true)
    expect(heardWord('water', ['waiter'])).toBe(false)
    expect(heardWord('one', ['1'])).toBe(true)
    expect(heardWord('water', [])).toBe(false)
  })
})

describe('chấm và qua cửa', () => {
  it('70% tính riêng từng phần, không làm tròn có lợi', () => {
    expect(partPassed({ score: 21, total: 30 })).toBe(true)
    expect(partPassed({ score: 20, total: 30 })).toBe(false)
    expect(partPassed({ score: 14, total: 20 })).toBe(true)
    expect(partPassed({ score: 13, total: 20 })).toBe(false)
    expect(partPassed({ score: 0, total: 0 })).toBe(false)
    expect(partPercent({ score: 20, total: 30 })).toBe(66)
  })

  it('Qua: phát âm 22/30, thì 15/20', () => {
    const scores = gradeOwl([...answers(pronIds(30), 22), ...answers(tenseIds(20), 15)])
    expect(scores).toEqual({ pronunciation: { score: 22, total: 30 }, tenses: { score: 15, total: 20 } })
    expect(owlPassed(scores)).toBe(true)
    expect(partPercent(scores.pronunciation)).toBe(73)
    expect(partPercent(scores.tenses)).toBe(75)
  })

  it('Trượt một phần: phát âm 20/30, thì 18/20', () => {
    expect(owlPassed(gradeOwl([...answers(pronIds(30), 20), ...answers(tenseIds(20), 18)]))).toBe(false)
  })
})

describe('validateEts', () => {
  it('bỏ trống = không ghi; nhập đúng giới hạn thì ghi', () => {
    expect(validateEts({})).toEqual({ ok: true, ets: {} })
    expect(validateEts({ p1: '6', p2: ' 20 ', p5: '0' })).toEqual({ ok: true, ets: { p1: 6, p2: 20, p5: 0 } })
  })

  it('nhập sai giới hạn → báo lỗi tiếng Việt', () => {
    const r = validateEts({ p1: '7', p2: 'abc', p5: '30' })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.p1).toContain('Part 1 chỉ có 6 câu')
    expect(r.errors.p2).toContain('số nguyên')
    expect(r.errors.p5).toBeUndefined()
  })
})

describe('recordOwlAttempt', () => {
  it('qua: ghi kind owl, checkpointId, điểm từng phần, passed; Dumbledore đếm', () => {
    const store = recordOwlAttempt(empty(), { ...input(22, 15), ets: { p1: 4, p2: 10, p5: 12 } }, T0)
    const raw = readAttempts(store)['owl-a'] as Record<string, unknown>
    expect(isQuizAttempt(raw)).toBe(true)
    expect(raw).toMatchObject({ kind: 'owl', checkpointId: 'owl-1', quizId: 'owl-1', passed: true, score: 37, total: 50 })
    expect(readOwlDetails(raw)).toMatchObject({
      pronunciation: { score: 22, total: 30 },
      tenses: { score: 15, total: 20 },
      ets: { p1: 4, p2: 10, p5: 12 },
    })
    expect(dumbledoreCount(store)).toBe(1)
  })

  it('qua sạch (mọi thì 2/2): không có kế hoạch, Hôm nay không có thẻ; điểm từng thì đủ 10 chủ điểm', () => {
    const store = recordOwlAttempt(empty(), input(22, 20), T0)
    const raw = readAttempts(store)['owl-a'] as Record<string, unknown>
    const details = readOwlDetails(raw)!
    expect(details.plan).toBeUndefined()
    expect(Object.keys(details.topics!)).toEqual(OWL_TOPICS.map((t) => t.id))
    for (const t of OWL_TOPICS) expect(details.topics![t.id]).toEqual({ score: 2, total: 2 })
    expect(activeReviewPlan(store, T0)).toBeNull()
    expect(activeReviewPlan(store, new Date(2027, 1, 27, 9))).toBeNull()
  })

  it('lần thi (kèm kế hoạch) giữ nguyên khi gộp đồng bộ', () => {
    const store = recordOwlAttempt(empty(), input(20, 5), T0)
    const merged = mergeQuizAttempts({}, readAttempts(store))
    expect(merged).toEqual(readAttempts(store))
  })

  it('phần ETS không ảnh hưởng qua cửa', () => {
    const store = recordOwlAttempt(empty(), { ...input(22, 15), ets: { p1: 0, p2: 0, p5: 0 } }, T0)
    expect(listOwlAttempts(store)[0].passed).toBe(true)
  })

  it('câu thì sai vào Sổ lỗi; từ đọc chưa đúng vào Sổ lỗi nhãn phát âm', () => {
    const store = recordOwlAttempt(empty(), input(28, 18), T0)
    const items = listMistakes(readMistakes(store))
    const pron = items.filter((m) => m.tag === 'phát âm')
    expect(pron.map((m) => m.id).sort()).toEqual(pronIds(30).slice(28).sort())
    for (const m of pron) expect({ lessonId: m.lessonId, sectionId: m.sectionId }).toEqual(OWL_WORD_SECTION)
    expect(items.filter((m) => m.tag === 'thì')).toHaveLength(2)
    // Mục sổ lưu chữ thật và IPA của từ.
    const w29 = pron.find((m) => m.id === owlWordQuestionId('ngsl-ngslw129'))!
    expect(w29.word).toEqual({ text: 'ngslw129', ipa: 'ipa129' })
  })

  it('trượt phát âm: kế hoạch 14 ngày chỉ phần phát âm, có link đoạn; tiến độ giữ nguyên', () => {
    const before: Store = { ...empty(), data: { progress: { completed: { 's1-t1-w1': 'x' } } } }
    // Thì 20/20 (không chủ điểm nào yếu) để kế hoạch chỉ có phần phát âm.
    const store = recordOwlAttempt(before, input(20, 20), T0)
    expect(store.data.progress).toEqual(before.data.progress)
    const attempt = listOwlAttempts(store)[0]
    expect(attempt.passed).toBe(false)
    const plan = attempt.details.plan!
    expect(plan.parts).toEqual(['pronunciation'])
    expect(plan.days).toHaveLength(14)
    expect(plan.startDate).toBe('2027-02-26')
    expect(plan.days[13].date).toBe('2027-03-11')
    for (const d of plan.days) {
      expect(d.tag).toBe('phát âm')
      expect(d.lessonId.startsWith('s1-')).toBe(true)
    }
    // 10 từ sai được chia vào các ngày, mỗi ngày tối đa một mục (10 < 14).
    expect(plan.days.flatMap((d) => d.mistakeIds).sort()).toEqual(pronIds(30).slice(20).sort())
    expect(plan.days.every((d) => d.mistakeIds.length <= 1)).toBe(true)
    // Đoạn chứa mục sổ đi đầu, sau đó ôn rộng các đoạn Phát âm khác của chặng 1 (không lặp một đoạn 14 ngày).
    expect(plan.days[0]).toMatchObject(OWL_WORD_SECTION)
    expect(new Set(plan.days.map((d) => d.lessonId)).size).toBeGreaterThan(1)
    for (const d of plan.days) expect(d.sectionId).toBe('pronunciation')
    // Tuần Tết (đoạn không dạy phát âm) không vào kế hoạch.
    expect(plan.days.some((d) => d.lessonId === 's1-t4-w2')).toBe(false)

    const active = activeReviewPlan(store, new Date(2027, 2, 1, 20))
    expect(active?.dayIndex).toBe(3)
    expect(activeReviewPlan(store, new Date(2027, 2, 12, 8))).toBeNull()
  })

  it('trượt cả hai: kế hoạch có cả hai phần, xen kẽ', () => {
    const store = recordOwlAttempt(empty(), input(10, 5), T0)
    const plan = listOwlAttempts(store)[0].details.plan!
    expect(plan.parts).toEqual(['pronunciation', 'tenses'])
    const tags = new Set(plan.days.map((d) => d.tag))
    expect(tags).toEqual(new Set(['phát âm', 'thì']))
    expect(plan.days[0].tag).toBe('phát âm')
    expect(plan.days[1].tag).toBe('thì')
  })

  it('kế hoạch xếp đoạn theo số lần sai trong Sổ lỗi (lần thi cũ: câu QUESTION_BANK, không có chủ điểm)', () => {
    // Câu thì của s1-t3-w1 sai 3 lần trước đó → đoạn này lên đầu.
    const heavy = LEGACY_POOL.find((q) => q.lessonId === 's1-t3-w1')!
    expect(LEGACY_POOL.slice(0, 19)).not.toContain(heavy)
    let store = empty()
    for (let i = 0; i < 3; i++) {
      store = recordOwlAttempt(
        store,
        {
          ...input(30, 20, `prior-${i}`),
          tenses: [{ questionId: heavy.id, chosen: 'x', correct: false }],
        },
        new Date(2027, 1, 1 + i),
      )
    }
    // Lần thi này: heavy sai lần nữa (sai trong lần thi → ưu tiên, và nhiều lần sai nhất).
    store = recordOwlAttempt(
      store,
      { ...input(30, 5), tenses: [...legacyAnswers(19, 5), { questionId: heavy.id, chosen: 'x', correct: false }] },
      T0,
    )
    const plan = listOwlAttempts(store)[0].details.plan!
    expect(plan.parts).toEqual(['tenses'])
    expect(plan.days[0]).toMatchObject({ lessonId: 's1-t3-w1', sectionId: 'grammar' })
    expect(plan.days[0].mistakeIds[0]).toBe(heavy.id)
  })

  it('qua lần sau → kế hoạch hết hiện; làm lại sau khi qua ghi lần mới, Dumbledore đếm 2', () => {
    let store = recordOwlAttempt(empty(), input(20, 18, 'a1'), T0)
    expect(activeReviewPlan(store, T0)).not.toBeNull()
    const later = new Date(2027, 2, 1, 9)
    store = recordOwlAttempt(store, input(25, 20, 'a2'), later)
    expect(activeReviewPlan(store, later)).toBeNull()
    store = recordOwlAttempt(store, input(30, 20, 'a3'), new Date(2027, 2, 2, 9))
    expect(listOwlAttempts(store)).toHaveLength(3)
    expect(dumbledoreCount(store)).toBe(2)
  })
})

describe('reviewPlan khi Sổ lỗi trống', () => {
  it('dùng các bài chặng 1 có câu sai trong lần thi (lần thi cũ, không có chủ điểm)', () => {
    const tense = legacyAnswers(20, 5)
    const wrongSections = new Set(
      tense.filter((a) => !a.correct).map((a) => `${getQuestion(a.questionId)!.lessonId}|grammar`),
    )
    const plan = reviewPlan(
      empty(),
      { answers: [...answers(pronIds(30), 30), ...tense], finishedAt: T0.toISOString() },
      T0,
    )!
    expect(plan.parts).toEqual(['tenses'])
    const keys = plan.days.map((d) => `${d.lessonId}|${d.sectionId}`)
    expect(new Set(keys.slice(0, wrongSections.size))).toEqual(wrongSections)
    for (const d of plan.days) {
      expect(d.sectionId).toBe('grammar')
      expect(d.mistakeIds).toEqual([])
    }
  })

  it('không tra được câu nào → các đoạn mặc định của chặng 1', () => {
    const lookup = (): Question | undefined => undefined
    const plan = reviewPlan(
      empty(),
      { answers: [...answers(pronIds(30), 30), ...answers(['zzz'], 0)], finishedAt: T0.toISOString() },
      T0,
      lookup,
    )!
    expect(plan.days).toHaveLength(14)
    for (const d of plan.days) expect(d.sectionId).toBe('grammar')
  })

  it('qua cả hai → null', () => {
    expect(
      reviewPlan(empty(), { answers: [...answers(pronIds(30), 30), ...answers(tenseIds(20), 20)], finishedAt: T0.toISOString() }, T0),
    ).toBeNull()
  })
})

describe('sửa sau review', () => {
  it('heardWord nhận từ đồng âm; matchHeardWord trả đúng phương án đã khớp', () => {
    expect(heardWord('two', ['to'])).toBe(true)
    expect(heardWord('too', ['2'])).toBe(true)
    expect(heardWord('four', ['for'])).toBe(true)
    expect(heardWord('know', ['no'])).toBe(true)
    expect(heardWord('write', ['right'])).toBe(true)
    expect(heardWord('their', ['there'])).toBe(true)
    expect(heardWord('I', ['eye'])).toBe(true)
    expect(heardWord('won', ['one'])).toBe(true)
    expect(heardWord('buy', ['by'])).toBe(true)
    expect(heardWord('our', ['hour'])).toBe(true)
    expect(heardWord('be', ['bee'])).toBe(true)
    expect(heardWord('water', ['what her'])).toBe(false)
    expect(matchHeardWord('water', ['what her', 'the water'])).toBe('the water')
    expect(matchHeardWord('water', ['waiter'])).toBeNull()
  })

  it("mục sổ của từ lưu chữ thật (o'clock, ma'am, I) chứ không cắt từ id", () => {
    const words = [
      { id: owlWordQuestionId('tsl-o-clock'), wordId: 'tsl-o-clock', word: "o'clock", ipa: 'əˈklɑːk' },
      { id: owlWordQuestionId('tsl-ma-am'), wordId: 'tsl-ma-am', word: "ma'am", ipa: 'mæm' },
      { id: owlWordQuestionId('ngsl-i'), wordId: 'ngsl-i', word: 'I', ipa: 'aɪ' },
    ]
    const store = recordOwlAttempt(
      empty(),
      {
        id: 'w',
        seed: 's',
        startedAt: T0,
        words,
        pronunciation: words.map((w) => ({ questionId: w.id, chosen: 'x', correct: false })),
        tenses: tenseAnswers(20, 20),
      },
      T0,
    )
    const items = readMistakes(store)
    const oclock = items[owlWordQuestionId('tsl-o-clock')]
    expect(isMistakeItem(oclock) && oclock.word).toEqual({ text: "o'clock", ipa: 'əˈklɑːk' })
    const maam = items[owlWordQuestionId('tsl-ma-am')]
    expect(isMistakeItem(maam) && maam.word?.text).toBe("ma'am")
    const i = items[owlWordQuestionId('ngsl-i')]
    expect(isMistakeItem(i) && i.word?.text).toBe('I')
  })

  it('mục từ ôn được bằng tự chấm: tính vào đến hạn và lên được "đã thuộc"', () => {
    let store = recordOwlAttempt(empty(), input(28, 20), T0)
    const id = owlWordQuestionId('ngsl-ngslw129')
    const due = reviewableDue(readMistakes(store), T0, { canSpeak: false }).due.map((m) => m.id)
    expect(due).toContain(id)
    let now = T0
    for (let k = 0; k < 30; k++) {
      const item = readMistakes(store)[id]
      if (!isMistakeItem(item)) throw new Error('mất mục')
      if (isMastered(item)) break
      now = new Date(Math.max(Date.parse(item.card.due), now.getTime()) + 60_000)
      store = reviewMistake(store, id, true, 'tự chấm: đúng', now)
    }
    const item = readMistakes(store)[id]
    expect(isMistakeItem(item) && isMastered(item)).toBe(true)
    expect(reviewableDue(readMistakes(store), now, { canSpeak: false }).due.map((m) => m.id)).not.toContain(id)
  })

  it('trượt cả hai: mục sổ của mỗi ngày đúng phần của ngày đó', () => {
    const store = recordOwlAttempt(empty(), input(10, 5), T0)
    const plan = listOwlAttempts(store)[0].details.plan!
    const items = readMistakes(store)
    for (const d of plan.days) {
      for (const id of d.mistakeIds) {
        const m = items[id]
        expect(isMistakeItem(m) && m.tag, `${d.date} ${id}`).toBe(d.tag)
      }
    }
    expect(plan.days.flatMap((d) => d.mistakeIds)).toHaveLength(20 + 15)
  })

  it('kế hoạch bỏ mục "đã thuộc" và ưu tiên câu sai trong lần thi này', () => {
    const old = LEGACY_POOL.find((q) => q.lessonId === 's1-t3-w2')!
    const mastered = LEGACY_POOL.find((q) => q.lessonId === 's1-t3-w3')!
    let store = empty()
    // Hai câu cũ sai 3 lần (không thuộc lần thi sau); một câu ôn tới "đã thuộc".
    for (let k = 0; k < 3; k++) {
      store = recordOwlAttempt(
        store,
        {
          ...input(30, 0, `old-${k}`),
          tenses: [
            { questionId: old.id, chosen: 'x', correct: false },
            { questionId: mastered.id, chosen: 'x', correct: false },
          ],
        },
        new Date(2027, 0, 1 + k),
      )
    }
    let now = new Date(2027, 0, 5)
    for (let k = 0; k < 30; k++) {
      const item = readMistakes(store)[mastered.id]
      if (!isMistakeItem(item) || isMastered(item)) break
      now = new Date(Math.max(Date.parse(item.card.due), now.getTime()) + 60_000)
      store = reviewMistake(store, mastered.id, true, mastered.answer, now)
    }
    const later = new Date(now.getTime() + 86_400_000)
    store = recordOwlAttempt(store, input(30, 10, 'now'), later)
    const plan = listOwlAttempts(store)[0].details.plan!
    const ids = plan.days.flatMap((d) => d.mistakeIds)
    expect(ids).not.toContain(mastered.id)
    expect(ids).toContain(old.id)
    // 10 câu sai trong lần thi này chiếm 10 ngày đầu, câu cũ sai 3 lần đứng sau.
    const fresh = new Set(tenseAnswers(20, 10).filter((a) => !a.correct).map((a) => a.questionId))
    for (const d of plan.days.slice(0, 10)) expect(fresh.has(d.mistakeIds[0])).toBe(true)
    expect(fresh.has(old.id)).toBe(false)
  })

  it('không có đoạn nào để bám → không có kế hoạch (không lỗi)', () => {
    const plan = reviewPlan(
      empty(),
      { answers: [...answers(pronIds(30), 30), ...answers(['zzz'], 0)], finishedAt: T0.toISOString() },
      T0,
      () => undefined,
      [],
    )
    expect(plan).toBeNull()
  })

  it('kế hoạch được ghi cùng lần làm một lần, updatedAt = lúc nộp', () => {
    const store = recordOwlAttempt(empty(), input(20, 18), T0)
    const raw = readAttempts(store)['owl-a'] as Record<string, unknown>
    expect(raw.updatedAt).toBe(T0.toISOString())
    expect(readOwlDetails(raw)?.plan?.days).toHaveLength(14)
  })

  it('phần bù NGSL bỏ từ có thẻ "Đã biết"', () => {
    let store = learn(empty(), ngslIds(150, 159))
    store = markCardKnown(store, 'ngsl-ngslw1', T0)
    store = markCardKnown(store, 'ngsl-ngslw2', T0)
    const picked = pickOwlPronunciation(store, WORDS, 's').map((w) => w.wordId)
    expect(picked).toHaveLength(30)
    expect(picked).not.toContain('ngsl-ngslw1')
    expect(picked).not.toContain('ngsl-ngslw2')
    expect(picked.slice(10)).toEqual(ngslIds(3, 23))
  })
})

describe('reviewPlan — mục Sổ lỗi của viên gạch (lessonId fNN)', () => {
  it('mục Sổ lỗi lessonId f03 (tag phát âm) không làm lỗi và không vào kế hoạch', () => {
    const brickQ = getQuestion('q-f03-01')!
    expect(brickQ.lessonId).toBe('f03')
    const store = recordMistake(empty(), brickQ, 'x', T0)
    const plan = reviewPlan(
      store,
      { answers: [...answers(pronIds(30), 5), ...answers(tenseIds(20), 20)], finishedAt: T0.toISOString() },
      T0,
    )!
    expect(plan.parts).toEqual(['pronunciation'])
    for (const d of plan.days) {
      expect(d.lessonId).not.toBe('f03')
      expect(d.mistakeIds).not.toContain(brickQ.id)
    }
  })
})

describe('kế hoạch theo chủ điểm thì (story 40)', () => {
  /** Đề thử: sai đúng một câu của mỗi chủ điểm trong `weak`, còn lại đúng. */
  function examAnswers(weak: readonly OwlTopicId[]): AttemptAnswer[] {
    const missed = new Set<string>()
    return EXAM.map((q) => {
      const wrong = weak.includes(q.topicId) && !missed.has(q.topicId)
      if (wrong) missed.add(q.topicId)
      return answerOf(q, !wrong)
    })
  }
  const weak3: OwlTopicId[] = ['will', 'modals', 'passive-present']

  it('Qua nhưng có thì yếu: phát âm 27/30, thì 17/20 (sai 1 câu will, modals, passive-present) → qua, có kế hoạch chỉ phần thì', () => {
    // Sổ lỗi có sẵn một mục thì của bài khác (s1-t2-w2) → không vào kế hoạch.
    const other = LEGACY_POOL.find((q) => q.lessonId === 's1-t2-w2')!
    let store = recordMistake(empty(), other, 'x', new Date(2027, 1, 20))
    store = recordOwlAttempt(store, { ...input(27, 20), tenses: examAnswers(weak3) }, T0)
    const attempt = listOwlAttempts(store)[0]
    expect(attempt.passed).toBe(true)
    expect(attempt.details.tenses).toEqual({ score: 17, total: 20 })
    expect(dumbledoreCount(store)).toBe(1)
    const topics = attempt.details.topics!
    expect(Object.keys(topics)).toHaveLength(10)
    for (const t of OWL_TOPICS) expect(topics[t.id]).toEqual(weak3.includes(t.id) ? { score: 1, total: 2 } : { score: 2, total: 2 })
    const plan = attempt.details.plan!
    expect(plan.parts).toEqual(['tenses'])
    expect(plan.weakTopics).toEqual(weak3)
    expect(plan.days).toHaveLength(14)
    const allowed = ['s1-t3-w1', 's1-t4-w1', 's1-t4-w3']
    for (const d of plan.days) {
      expect(d.sectionId).toBe('grammar')
      expect(d.tag).toBe('thì')
      expect(allowed).toContain(d.lessonId)
    }
    // Xoay vòng theo thứ tự chủ điểm yếu.
    expect(plan.days.slice(0, 4).map((d) => d.lessonId)).toEqual([...allowed, allowed[0]])
    // Mục Sổ lỗi chỉ thuộc bài của chủ điểm yếu: đúng 3 câu sai của lần này.
    const ids = plan.days.flatMap((d) => d.mistakeIds)
    expect(ids).toHaveLength(3)
    expect(ids).not.toContain(other.id)
    for (const id of ids) expect(allowed).toContain(getQuestion(id)!.lessonId)
    // Lưu cùng lần làm, đọc lại được (đồng bộ / sao lưu không cần key mới).
    const raw = readAttempts(store)[attempt.id] as Record<string, unknown>
    expect((raw.owl as Record<string, unknown>).topics).toEqual(topics)
    expect(mergeQuizAttempts({}, readAttempts(store))).toEqual(readAttempts(store))
  })

  it('Hôm nay sau khi qua: hôm sau vẫn có kế hoạch đang chạy, lần thi đã qua, kèm thì cần chắc thêm', () => {
    const store = recordOwlAttempt(empty(), { ...input(27, 20), tenses: examAnswers(weak3) }, T0)
    const active = activeReviewPlan(store, new Date(2027, 1, 27, 8))!
    expect(active).not.toBeNull()
    expect(active.attempt.passed).toBe(true)
    expect(active.dayIndex).toBe(1)
    expect(owlTopicNames(active.plan.weakTopics!)).toBe('Tương lai will, can / should / must, Bị động hiện tại')
    expect(activeReviewPlan(store, new Date(2027, 2, 12, 8))).toBeNull()
  })

  it('Trượt phần thì 11/20: kế hoạch như cũ, đoạn của chủ điểm yếu (thấp nhất trước) đứng đầu chuỗi ngày thì', () => {
    const store = recordOwlAttempt(empty(), input(30, 11), T0)
    const attempt = listOwlAttempts(store)[0]
    expect(attempt.passed).toBe(false)
    const plan = attempt.details.plan!
    expect(plan.parts).toEqual(['tenses'])
    const scores = gradeOwlTopics(tenseAnswers(20, 11))
    const weak = weakTopics(scores)
    expect(plan.weakTopics).toEqual(weak)
    // % thấp trước.
    const pct = weak.map((id) => scores[id]!.score / scores[id]!.total)
    expect([...pct].sort((a, b) => a - b)).toEqual(pct)
    const lead: string[] = []
    for (const id of weak) for (const l of OWL_TOPICS.find((t) => t.id === id)!.lessonIds) if (!lead.includes(l)) lead.push(l)
    expect(plan.days.slice(0, Math.min(14, lead.length)).map((d) => d.lessonId)).toEqual(lead.slice(0, 14))
    // Mục Sổ lỗi như cũ: mọi câu sai của lần này.
    expect(plan.days.flatMap((d) => d.mistakeIds)).toHaveLength(9)
    expect(activeReviewPlan(store, T0)?.attempt.passed).toBe(false)
  })

  it('trượt phát âm, phần thì qua nhưng có thì yếu: kế hoạch có cả hai phần, phần thì chỉ đoạn chủ điểm yếu', () => {
    const store = recordOwlAttempt(empty(), { ...input(10, 20), tenses: examAnswers(['will']) }, T0)
    const plan = listOwlAttempts(store)[0].details.plan!
    expect(plan.parts).toEqual(['pronunciation', 'tenses'])
    expect(plan.weakTopics).toEqual(['will'])
    const tenseDays = plan.days.filter((d) => d.tag === 'thì')
    expect(tenseDays).toHaveLength(7)
    for (const d of tenseDays) expect(d).toMatchObject({ lessonId: 's1-t3-w1', sectionId: 'grammar' })
    expect(plan.days[0].tag).toBe('phát âm')
  })

  it('Lần thi cũ (câu QUESTION_BANK, không owl.topics), trượt, còn trong 14 ngày: lịch sử, kế hoạch, thẻ Hôm nay như cũ', () => {
    const store = recordOwlAttempt(empty(), { ...input(30, 20), tenses: legacyAnswers(20, 10) }, T0)
    const attempt = listOwlAttempts(store)[0]
    expect(attempt.passed).toBe(false)
    expect(attempt.details.topics).toBeUndefined()
    expect(attempt.details.plan!.weakTopics).toBeUndefined()
    expect(attempt.details.plan!.parts).toEqual(['tenses'])
    expect(activeReviewPlan(store, new Date(2027, 2, 1, 9))?.dayIndex).toBe(3)
    // Lần thi cũ ghi tay đúng dạng story 14 (không có topics / weakTopics) vẫn đọc như cũ.
    const raw = readAttempts(store)[attempt.id] as Record<string, unknown>
    const legacy = { ...raw, owl: { ...(raw.owl as Record<string, unknown>) } }
    expect(readOwlDetails(legacy)).toEqual(attempt.details)
  })

  it('Dữ liệu hỏng: topics sai dạng / id lạ / điểm sai bị bỏ riêng; weakTopics sai dạng thì plan vẫn hợp lệ, coi như không có', () => {
    const base = { pronunciation: { score: 27, total: 30 }, tenses: { score: 17, total: 20 } }
    const plan = { startDate: '2027-02-26', parts: ['tenses'], days: [] }
    expect(readOwlDetails({ owl: { ...base, topics: 'x' } })).toEqual(base)
    expect(readOwlDetails({ owl: { ...base, topics: [1, 2] } })).toEqual(base)
    expect(
      readOwlDetails({
        owl: {
          ...base,
          topics: { will: { score: 1, total: 2 }, nope: { score: 1, total: 2 }, modals: { score: 3, total: 2 }, 'to-be': 'x' },
        },
      }),
    ).toEqual({ ...base, topics: { will: { score: 1, total: 2 } } })
    expect(readOwlDetails({ owl: { ...base, plan: { ...plan, weakTopics: 'will' } } })).toEqual({ ...base, plan })
    expect(readOwlDetails({ owl: { ...base, plan: { ...plan, weakTopics: [1, 'will'] } } })).toEqual({ ...base, plan })
    expect(readOwlDetails({ owl: { ...base, plan: { ...plan, weakTopics: ['nope', 'will', 'modals'] } } })).toEqual({
      ...base,
      plan: { ...plan, weakTopics: ['will', 'modals'] },
    })
  })

  it('qua, chỉ sai một câu cặp dễ nhầm (bài của cặp ngoài lessonIds của chủ điểm): kế hoạch có câu đó và bài dạy cặp', () => {
    const cases = [
      { id: 'q-owl-37', topic: 'will', lessons: ['s1-t3-w1', 's1-t3-w2'] },
      { id: 'q-owl-32', topic: 'present-simple', lessons: ['s1-t1-w2', 's1-t1-w3', 's1-t2-w1'] },
      { id: 'q-owl-42', topic: 'past-simple', lessons: ['s1-t2-w2', 's1-t2-w3', 's1-t3-w4'] },
    ] as const
    for (const c of cases) {
      let seed = 0
      while (!pickOwlTenses(OWL_QUESTIONS, `pair-${seed}`).some((q) => q.id === c.id)) seed++
      const exam = pickOwlTenses(OWL_QUESTIONS, `pair-${seed}`)
      const tenses = exam.map((q) => answerOf(q, q.id !== c.id))
      const store = recordOwlAttempt(empty(), { ...input(30, 20), tenses }, T0)
      const attempt = listOwlAttempts(store)[0]
      expect(attempt.passed, c.id).toBe(true)
      const plan = attempt.details.plan!
      expect(plan.weakTopics, c.id).toEqual([c.topic])
      expect(plan.days.flatMap((d) => d.mistakeIds), c.id).toEqual([c.id])
      expect([...new Set(plan.days.map((d) => d.lessonId))], c.id).toEqual(c.lessons)
      expect(topicReviewLessonId(c.topic, tenses), c.id).toBe(getQuestion(c.id)!.lessonId)
    }
  })

  it('topicReviewLessonId: bài của câu sai đầu tiên thuộc chủ điểm; không sai câu nào thì bài đầu của chủ điểm', () => {
    const wrong = (id: string): AttemptAnswer => ({ questionId: id, chosen: 'x', correct: false })
    expect(topicReviewLessonId('will', [])).toBe('s1-t3-w1')
    expect(topicReviewLessonId('will', [wrong('q-owl-17')])).toBe('s1-t3-w1')
    expect(topicReviewLessonId('will', [wrong('q-owl-37'), wrong('q-owl-17')])).toBe('s1-t3-w2')
    expect(topicReviewLessonId('present-perfect', [wrong('q-owl-37'), { questionId: 'q-owl-40', chosen: 'has lived', correct: true }])).toBe(
      's1-t3-w3',
    )
  })

  it('câu gõ golden q-owl-05 sai ("don\'t watch") vào Sổ lỗi với chữ đã gõ, gắn đoạn Ngữ pháp s1-t1-w3', () => {
    const q = getQuestion('q-owl-05')!
    const store = recordOwlAttempt(
      empty(),
      { ...input(30, 20), tenses: [{ questionId: q.id, chosen: "don't watch", correct: false }] },
      T0,
    )
    const item = readMistakes(store)[q.id]
    expect(isMistakeItem(item)).toBe(true)
    if (!isMistakeItem(item)) return
    expect(item).toMatchObject({ lessonId: 's1-t1-w3', sectionId: 'grammar', tag: 'thì', lastChosen: "don't watch" })
  })
})
