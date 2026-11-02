import { describe, expect, it } from 'vitest'

import { getQuestion, QUESTION_BANK, type Question } from '@/data/questions'
import type { Word } from '@/data/vocab'
import {
  isMastered,
  isMistakeItem,
  isQuizAttempt,
  listMistakes,
  readAttempts,
  readMistakes,
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
  heardWord,
  matchHeardWord,
  listOwlAttempts,
  OWL_WORD_SECTION,
  owlPassed,
  owlTensePool,
  owlWordQuestionId,
  partPassed,
  partPercent,
  pickOwlPronunciation,
  pickOwlTenses,
  readOwlDetails,
  recordOwlAttempt,
  reviewPlan,
  validateEts,
  type OwlAttemptInput,
} from './index'

const T0 = new Date(2027, 1, 26, 9, 0, 0)
const empty = (): Store => ({ schemaVersion: 11, data: {} })

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
const tenseIds = (n: number) => owlTensePool(QUESTION_BANK).slice(0, n).map((q) => q.id)

function tenseAnswers(n: number, correctCount: number): AttemptAnswer[] {
  const pool = owlTensePool(QUESTION_BANK).slice(0, n)
  return pool.map((q, i) => ({
    questionId: q.id,
    chosen: i < correctCount ? q.answer : q.options.find((o) => o !== q.answer)!,
    correct: i < correctCount,
  }))
}

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

describe('ngân hàng câu thì chặng 1', () => {
  it('có ít nhất 30 câu trắc nghiệm nhãn thì trong chặng 1', () => {
    const pool = owlTensePool(QUESTION_BANK)
    expect(pool.length).toBeGreaterThanOrEqual(30)
    for (const q of pool) {
      expect(q.tag).toBe('thì')
      expect(q.lessonId.startsWith('s1-')).toBe(true)
    }
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
    const a = pickOwlTenses(QUESTION_BANK, 'a')
    expect(a).toHaveLength(20)
    expect(new Set(a.map((q) => q.id)).size).toBe(20)
    for (const q of a) expect(q.tag).toBe('thì')
    expect(pickOwlTenses(QUESTION_BANK, 'a').map((q) => q.id)).toEqual(a.map((q) => q.id))
    expect(pickOwlTenses(QUESTION_BANK, 'b').map((q) => q.id)).not.toEqual(a.map((q) => q.id))
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
    expect(readOwlDetails(raw)).toEqual({
      pronunciation: { score: 22, total: 30 },
      tenses: { score: 15, total: 20 },
      ets: { p1: 4, p2: 10, p5: 12 },
    })
    expect(dumbledoreCount(store)).toBe(1)
    expect(activeReviewPlan(store, T0)).toBeNull()
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
    const store = recordOwlAttempt(before, input(20, 18), T0)
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

  it('kế hoạch xếp đoạn theo số lần sai trong Sổ lỗi', () => {
    // Câu thì của s1-t3-w1 sai 3 lần trước đó → đoạn này lên đầu.
    const heavy = owlTensePool(QUESTION_BANK).find((q) => q.lessonId === 's1-t3-w1')!
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
      { ...input(30, 5), tenses: [...tenseAnswers(19, 5), { questionId: heavy.id, chosen: 'x', correct: false }] },
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
    store = recordOwlAttempt(store, input(25, 18, 'a2'), later)
    expect(activeReviewPlan(store, later)).toBeNull()
    store = recordOwlAttempt(store, input(30, 20, 'a3'), new Date(2027, 2, 2, 9))
    expect(listOwlAttempts(store)).toHaveLength(3)
    expect(dumbledoreCount(store)).toBe(2)
  })
})

describe('reviewPlan khi Sổ lỗi trống', () => {
  it('dùng các bài chặng 1 có câu sai trong lần thi', () => {
    const tense = tenseAnswers(20, 5)
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
    const old = owlTensePool(QUESTION_BANK).find((q) => q.lessonId === 's1-t3-w2')!
    const mastered = owlTensePool(QUESTION_BANK).find((q) => q.lessonId === 's1-t3-w3')!
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
