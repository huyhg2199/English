import { describe, expect, it } from 'vitest'

import { getLesson, getSection } from '@/data/roadmap'

import { allTenseChoices, allTenses, getLessonContent, IRREGULAR_VERBS, lessonRuleCards } from '@/data/lessons'
import { owlTensePool, pickOwlTenses } from '@/lib/owl'
import { hasVietnameseMarks, matchesTyped, normalizeTyped, pickQuiz } from '@/lib/quiz'
import { hasPractice, practiceEnglishTexts } from '@/lib/tense-practice'
import {
  frontedTimeTail,
  outOfScopeWords,
  promptEnglish,
  sContraction,
  T3_T4_SCOPE_IDS,
  type T1T2ScopeId,
} from '@/lib/tense-scope'

import { conceptSource, requiresViolations } from './concepts'

import {
  getQuestion,
  getQuiz,
  LESSON_QUIZ_SIZE,
  lessonQuizId,
  MISTAKE_TAGS,
  QUESTION_BANK,
  QUIZZES,
  quizHref,
  isTypedQuestion,
  type ChoiceQuestion,
  type Question,
  type TypedQuestion,
} from './index'

/** Lựa chọn của câu (câu gõ không có → []). */
const optionsOf = (q: Question): readonly string[] => ('options' in q ? q.options : [])
const choiceQuestions = QUESTION_BANK.filter((q): q is ChoiceQuestion => !isTypedQuestion(q))
const typedQuestions = QUESTION_BANK.filter(isTypedQuestion)

const T1 = ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']
const T2 = ['s1-t2-w1', 's1-t2-w2', 's1-t2-w3', 's1-t2-w4']
/** 11 bài có nội dung T2–T4 (trừ tuần Tết s1-t4-w2). */
const T2_T4 = [...T2, 's1-t3-w1', 's1-t3-w2', 's1-t3-w3', 's1-t3-w4', 's1-t4-w1', 's1-t4-w3', 's1-t4-w4']

describe('ngân hàng câu hỏi', () => {
  it('id duy nhất và ổn định dạng q-<bài>-NN', () => {
    const ids = QUESTION_BANK.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const q of QUESTION_BANK) expect(q.id).toMatch(new RegExp(`^q-${q.lessonId}-\\d{2}$`))
  })

  it('nhãn lỗi hợp lệ', () => {
    for (const q of QUESTION_BANK) expect(MISTAKE_TAGS, q.id).toContain(q.tag)
  })

  it('bài và đoạn nguồn tồn tại trong lộ trình', () => {
    for (const q of QUESTION_BANK) {
      expect(getLesson(q.lessonId), q.id).toBeDefined()
      expect(getSection(q.lessonId, q.sectionId), q.id).toBeDefined()
    }
  })

  it('câu chọn đáp án: 4 lựa chọn khác nhau, đáp án nằm trong lựa chọn; mọi câu có đề và giải thích', () => {
    for (const q of QUESTION_BANK) {
      expect(q.prompt.trim(), q.id).not.toBe('')
      expect(q.explanation.trim(), q.id).not.toBe('')
    }
    for (const q of choiceQuestions) {
      expect(q.options, q.id).toHaveLength(4)
      expect(new Set(q.options).size, q.id).toBe(4)
      expect(q.options.filter((o) => o === q.answer), q.id).toHaveLength(1)
      expect(q.prompt.trim(), q.id).not.toBe('')
      expect(q.explanation.trim(), q.id).not.toBe('')
    }
  })

  it('câu nghe có audioText là đáp án; câu khác không có audioText', () => {
    for (const q of QUESTION_BANK) {
      const audioText = 'audioText' in q ? q.audioText : undefined
      if (q.kind === 'listening') {
        expect(audioText, q.id).toBe(q.answer)
        expect(q.tag, q.id).toBe('nghe')
      } else {
        expect(audioText, q.id).toBeUndefined()
      }
    }
  })

  it('T1: 42 câu (w1 6, w2 15, w3 15, w4 6: w2 / w3 thêm 9 câu gõ của story 36), mỗi bài có ít nhất 2 câu không phải câu nghe', () => {
    const t1 = QUESTION_BANK.filter((q) => T1.includes(q.lessonId))
    expect(t1).toHaveLength(42)
    for (const id of T1) {
      const of: Question[] = t1.filter((q) => q.lessonId === id)
      expect(of, id).toHaveLength(id === 's1-t1-w2' || id === 's1-t1-w3' ? 15 : 6)
      expect(of.filter((q) => q.kind !== 'listening').length, id).toBeGreaterThanOrEqual(2)
    }
  })

  it('T2–T4: 162 câu, s1-t2-w1 / s1-t2-w3 / s1-t3-w1…w4 / s1-t4-w1 có 14 câu, s1-t2-w2 / s1-t4-w3 có 26 câu, s1-t2-w4 / s1-t4-w4 đủ 6 câu (≥ 2 câu không phải câu nghe); tuần Tết không có câu', () => {
    const later = QUESTION_BANK.filter((q) => !T1.includes(q.lessonId))
    expect(later).toHaveLength(162)
    expect(QUESTION_BANK).toHaveLength(204)
    const sizes: Record<string, number> = {
      's1-t2-w1': 14,
      's1-t2-w2': 26,
      's1-t2-w3': 14,
      's1-t3-w1': 14,
      's1-t3-w2': 14,
      's1-t3-w3': 14,
      's1-t3-w4': 14,
      's1-t4-w1': 14,
      's1-t4-w3': 26,
    }
    for (const id of T2_T4) {
      const of = later.filter((q) => q.lessonId === id)
      expect(of, id).toHaveLength(sizes[id] ?? 6)
      expect(of.filter((q) => q.kind !== 'listening').length, id).toBeGreaterThanOrEqual(2)
      expect(getLessonContent(id), id).toBeDefined()
    }
  })

  it('mỗi bài có tối đa 1 câu nghe (bài kiểm tra 5 câu vẫn đủ khi không có TTS)', () => {
    for (const id of [...T1, ...T2_T4]) {
      expect(QUESTION_BANK.filter((q) => q.lessonId === id && q.kind === 'listening').length, id).toBeLessThanOrEqual(1)
    }
    expect(QUESTION_BANK.some((q) => q.lessonId === 's1-t4-w2')).toBe(false)
  })

  it('câu ngữ pháp gắn đoạn Ngữ pháp nếu bài có đoạn đó; tuần O.W.L. gắn đoạn Phát âm (phần ôn tổng)', () => {
    for (const q of QUESTION_BANK.filter((x) => x.lessonId === 's1-t4-w4')) expect(q.sectionId, q.id).toBe('pronunciation')
    for (const q of QUESTION_BANK.filter((x) => (x.kind === 'choice' || isTypedQuestion(x)) && x.lessonId !== 's1-t4-w4')) {
      expect(q.sectionId, q.id).toBe('grammar')
    }
  })

  it('có câu chọn vị trí trọng âm (dạng phát âm)', () => {
    const stress = QUESTION_BANK.filter((q) => q.kind === 'pronunciation' && /trọng âm/.test(q.prompt))
    expect(stress.length).toBeGreaterThanOrEqual(1)
    for (const q of stress) expect(q.tag).toBe('phát âm')
  })

  it('getQuestion tra theo id', () => {
    expect(getQuestion('q-s1-t1-w1-01')?.answer).toBe('is')
    expect(getQuestion('nope')).toBeUndefined()
  })
})

describe('QUIZZES', () => {
  it('mini test T1: 10 câu từ 4 bài T1, bài nhà là s1-t1-w4', () => {
    const quiz = getQuiz('mini-t1')!
    expect(quiz).toMatchObject({ size: 10, minPerLesson: 2, homeLessonId: 's1-t1-w4' })
    expect(quiz.lessonIds).toEqual(T1)
    expect(quizHref('mini-t1')).toBe('/practice/quiz/mini-t1')
  })

  it('mini test T2: 10 câu từ 4 bài T2, mỗi bài ≥ 2 câu, bài nhà là s1-t2-w4', () => {
    const quiz = getQuiz('mini-t2')!
    expect(quiz).toMatchObject({ size: 10, minPerLesson: 2, homeLessonId: 's1-t2-w4' })
    expect(quiz.lessonIds).toEqual(T2)
    for (const seed of ['a', 'b', 'c', 'd']) {
      for (const canSpeak of [true, false]) {
        const picked = pickQuiz(QUESTION_BANK, quiz, seed, { canSpeak })
        expect(picked).toHaveLength(10)
        expect(new Set(picked.map((q) => q.id)).size).toBe(10)
        for (const id of T2) expect(picked.filter((q) => q.lessonId === id).length, id).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('mỗi bài có câu hỏi đều có bài kiểm tra riêng 5 câu, bài nhà là chính bài đó', () => {
    for (const id of [...T1, ...T2_T4]) {
      const quiz = getQuiz(lessonQuizId(id))!
      expect(quiz, id).toMatchObject({ lessonIds: [id], size: LESSON_QUIZ_SIZE, homeLessonId: id })
      for (const canSpeak of [true, false]) {
        const picked = pickQuiz(QUESTION_BANK, quiz, 'x', { canSpeak })
        expect(picked, id).toHaveLength(LESSON_QUIZ_SIZE)
        expect(picked.every((q) => q.lessonId === id)).toBe(true)
      }
    }
    expect(getQuiz(lessonQuizId('s1-t4-w2'))).toBeUndefined()
    expect(new Set(QUIZZES.map((q) => q.id)).size).toBe(QUIZZES.length)
  })

  it('mỗi bài test đủ câu cho số câu và số câu tối thiểu mỗi bài', () => {
    for (const quiz of QUIZZES) {
      expect(getLesson(quiz.homeLessonId)).toBeDefined()
      const pool = QUESTION_BANK.filter((q) => quiz.lessonIds.includes(q.lessonId) && q.kind !== 'listening')
      expect(pool.length).toBeGreaterThanOrEqual(quiz.size)
      expect(quiz.lessonIds.length * quiz.minPerLesson).toBeLessThanOrEqual(quiz.size)
    }
  })
})

describe('câu nhãn thì chặng 1 (O.W.L. 1, story 14)', () => {
  it('có ít nhất 30 câu trắc nghiệm nhãn thì trong chặng 1 để chọn ngẫu nhiên 20 câu', () => {
    const pool = QUESTION_BANK.filter(
      (q) => q.tag === 'thì' && q.kind === 'choice' && getLesson(q.lessonId)?.stageId === 's1',
    )
    expect(pool.length).toBeGreaterThanOrEqual(30)
  })
})

describe('T3-W1 chưa dùng can (story 32)', () => {
  const CAN = /\bcan(not|'t)?\b/i

  it('câu quiz s1-t3-w1 (đề, lựa chọn, giải thích) không có can', () => {
    const qs = QUESTION_BANK.filter((q) => q.lessonId === 's1-t3-w1')
    expect(qs.length).toBeGreaterThan(0)
    for (const q of qs) for (const t of [q.prompt, ...optionsOf(q), q.explanation]) expect(t, q.id).not.toMatch(CAN)
  })

  it('q-s1-t3-w1-06 vẫn là câu nghe, viết lại bằng will', () => {
    const q = getQuestion('q-s1-t3-w1-06')!
    expect(q.kind).toBe('listening')
    expect(q.answer).toBe("I'll help you tomorrow.")
  })
})

describe('câu was / were và Wh + did của s1-t2-w2 (story 33)', () => {
  const NEW_IDS = [7, 8, 9, 10, 11, 12].map((n) => `q-s1-t2-w2-${String(n).padStart(2, '0')}`)
  const OLD_IDS = [1, 2, 3, 4, 5, 6].map((n) => `q-s1-t2-w2-0${n}`)
  const fresh = () => NEW_IDS.map((id) => getQuestion(id)!)
  const FORBIDDEN = new Set(
    IRREGULAR_VERBS.flatMap((v) => [...v.v2.split(' / '), ...v.v3.split(' / ')].filter((f) => f !== v.v1))
      .map((f) => f.toLowerCase())
      .filter((f) => !['was', 'were', 'did'].includes(f)),
  )
  const englishWords = (text: string) => (text.toLowerCase().match(/[a-z']+/g) ?? []).map((w) => w.replace(/'.*$/, ''))

  it('6 câu mới có requires hợp lệ, tag thì, kind choice, gắn đoạn Ngữ pháp', () => {
    for (const q of fresh()) {
      expect(q, q?.id).toBeDefined()
      expect(q.requires?.length, q.id).toBeGreaterThan(0)
      expect(requiresViolations(q), q.id).toEqual([])
      expect(q.tag, q.id).toBe('thì')
      expect(q.kind, q.id).toBe('choice')
      expect(q.sectionId, q.id).toBe('grammar')
      expect(q.answer, q.id).toBe(optionsOf(q)[0])
    }
  })

  it('đề và lựa chọn không dùng V2 / V3 bất quy tắc khác was / were / did, không có some / any / many / because / so', () => {
    for (const q of fresh()) {
      for (const text of [q.prompt, ...optionsOf(q)]) {
        const ws = englishWords(text)
        expect(ws.filter((w) => FORBIDDEN.has(w)), `${q.id}: ${text}`).toEqual([])
        expect(ws.filter((w) => ['some', 'any', 'many', 'because', 'so'].includes(w)), `${q.id}: ${text}`).toEqual([])
      }
    }
  })

  it('có câu đáp án Were, có câu có lựa chọn Did, có câu Wh + did', () => {
    const qs = fresh()
    expect(qs.some((q) => q.answer === 'Were')).toBe(true)
    expect(qs.some((q) => optionsOf(q).includes('Did'))).toBe(true)
    expect(qs.some((q) => /^(What|Where|When|Who)\b/.test(q.prompt) && q.answer === 'did')).toBe(true)
    // Wh + were (không phải did) khi câu chỉ hỏi nơi chốn / trạng thái.
    expect(qs.some((q) => /^(What|Where|When|Who)\b/.test(q.prompt) && q.answer === 'were' && optionsOf(q).includes('did'))).toBe(true)
  })

  it('thẻ quy tắc của bài không chép nguyên câu quiz (quiz đo luật, không đo trí nhớ thẻ)', () => {
    const prompts = new Set(QUESTION_BANK.filter((q) => q.lessonId === 's1-t2-w2').map((q) => q.prompt))
    const cards = lessonRuleCards('s1-t2-w2')
    expect(cards.length).toBeGreaterThan(0)
    for (const r of cards) expect(prompts.has(r.cloze), r.id).toBe(false)
  })

  it('6 câu cũ vẫn không có requires, đề giữ nguyên', () => {
    for (const id of OLD_IDS) expect(getQuestion(id)?.requires, id).toBeUndefined()
    expect(getQuestion('q-s1-t2-w2-01')?.prompt).toBe('I ___ my parents last Sunday.')
    expect(getQuestion('q-s1-t2-w2-04')?.prompt).toBe('___ you call him last night?')
    expect(getQuestion('q-s1-t2-w4-02')?.prompt).toBe('Last night I ___ very tired.')
  })

  it('quiz bài W2 bốc 5 câu từ 12 câu, có / không TTS', () => {
    const quiz = getQuiz(lessonQuizId('s1-t2-w2'))!
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      for (const canSpeak of [true, false]) {
        const picked = pickQuiz(QUESTION_BANK, quiz, seed, { canSpeak })
        expect(picked).toHaveLength(LESSON_QUIZ_SIZE)
        expect(new Set(picked.map((q) => q.id)).size).toBe(LESSON_QUIZ_SIZE)
        expect(picked.every((q) => q.lessonId === 's1-t2-w2')).toBe(true)
        if (!canSpeak) expect(picked.some((q) => q.kind === 'listening')).toBe(false)
      }
    }
  })
})

describe('câu gõ type / transform (story 35)', () => {
  const NEW_IDS = [7, 8, 9, 10].map((n) => `q-s1-t2-w1-${String(n).padStart(2, '0')}`)
  const fresh = () => NEW_IDS.map((id) => getQuestion(id) as TypedQuestion)
  const FORBIDDEN = new Set(
    IRREGULAR_VERBS.flatMap((v) => [...v.v2.split(' / '), ...v.v3.split(' / ')].filter((f) => f !== v.v1)).map((f) =>
      f.toLowerCase(),
    ),
  )
  const BANNED = [
    'was', 'were', 'did', "didn't", "wasn't", "weren't", 'will', "won't", 'can', "can't", 'cannot', 'some', 'any', 'many',
    'because', 'so',
  ]
  /** Quá khứ có quy tắc (-ed), trừ từ không phải quá khứ (như lessons.test.ts). */
  const NOT_PAST = new Set(['need'])
  const englishWords = (text: string) => text.toLowerCase().replace(/[’‘]/g, "'").match(/[a-z']+/g) ?? []
  const bannedWords = (text: string) =>
    englishWords(text).filter(
      (w) => BANNED.includes(w) || /^[a-z]+'ll$/.test(w) || (/^[a-z]{2,}ed$/.test(w) && !NOT_PAST.has(w)),
    )

  it('câu gõ không có options / audioText; answer không rỗng; type có đúng một ___; accept khác answer sau chuẩn hoá', () => {
    expect(typedQuestions.length).toBeGreaterThanOrEqual(4)
    for (const q of typedQuestions) {
      expect('options' in q, q.id).toBe(false)
      expect('audioText' in q, q.id).toBe(false)
      expect(normalizeTyped(q.answer), q.id).not.toBe('')
      if (q.kind === 'type') expect(q.prompt.split('___').length - 1, q.id).toBe(1)
      for (const a of q.accept ?? []) expect(normalizeTyped(a), `${q.id}: ${a}`).not.toBe(normalizeTyped(q.answer))
    }
  })

  it('4 câu mới q-s1-t2-w1-07 … -10: 2 type, 2 transform, tag thì, đoạn Ngữ pháp, requires hợp lệ', () => {
    const qs = fresh()
    for (const q of qs) {
      expect(q, NEW_IDS.join()).toBeDefined()
      expect(q.lessonId).toBe('s1-t2-w1')
      expect(q.tag, q.id).toBe('thì')
      expect(q.sectionId, q.id).toBe('grammar')
      expect(q.requires?.length, q.id).toBeGreaterThan(0)
      expect(requiresViolations(q), q.id).toEqual([])
    }
    expect(qs.map((q) => q.kind)).toEqual(['type', 'type', 'transform', 'transform'])
    expect(qs.map((q) => q.answer)).toEqual(['is crying', "isn't studying", 'Are they waiting for the bus?', 'I am not writing an email.'])
    // transform: phần yêu cầu tiếng Việt + câu gốc tiếng Anh.
    for (const q of qs.filter((x) => x.kind === 'transform')) expect(q.prompt, q.id).toMatch(/^Đổi sang câu [^:]+: [A-Z][A-Za-z ]+\.$/)
  })

  it('đáp án của câu mới qua matchesTyped với chính nó viết hoa / bỏ dấu câu; câu sai trật tự từ thì sai', () => {
    for (const q of fresh()) {
      expect(matchesTyped(q.answer, q.answer, q.accept), q.id).toBe(true)
      expect(matchesTyped(q.answer, q.answer.toUpperCase(), q.accept), q.id).toBe(true)
      expect(matchesTyped(q.answer, q.answer.replace(/[.?!,]/g, ''), q.accept), q.id).toBe(true)
      expect(matchesTyped(q.answer, '', q.accept), q.id).toBe(false)
    }
    const q09 = getQuestion('q-s1-t2-w1-09') as TypedQuestion
    expect(matchesTyped(q09.answer, 'They are waiting for the bus?')).toBe(false)
    const q10 = getQuestion('q-s1-t2-w1-10') as TypedQuestion
    expect(matchesTyped(q10.answer, "i'm not writing an email")).toBe(true)
    expect(matchesTyped(q10.answer, 'I not writing an email.')).toBe(false)
    const q08 = getQuestion('q-s1-t2-w1-08') as TypedQuestion
    expect(matchesTyped(q08.answer, 'is not studying')).toBe(true)
    expect(matchesTyped(q08.answer, "doesn't studying")).toBe(false)
  })

  it('chữ tiếng Anh của câu mới không có V2 / V3 bất quy tắc, was / were / did, will / can, some / any / many, because / so', () => {
    for (const q of fresh()) {
      const english = q.kind === 'transform' ? q.prompt.replace(/^[^:]+: /, '') : q.prompt
      for (const text of [english, q.answer, ...(q.accept ?? [])]) {
        const ws = englishWords(text)
        expect(ws.filter((w) => FORBIDDEN.has(w)), `${q.id}: ${text}`).toEqual([])
        expect(bannedWords(text), `${q.id}: ${text}`).toEqual([])
      }
    }
  })

  it("đáp án có he / she / it is (hoặc 's) thì có accept cho dạng kia ('s không được mở rộng)", () => {
    for (const q of typedQuestions) {
      if (/\b(he|she|it)( is|['’]s)\b/i.test(q.answer)) expect(q.accept?.length ?? 0, q.id).toBeGreaterThan(0)
    }
  })

  it('đề type có gợi ý trong ngoặc thì ngoặc đứng ngay sau chỗ trống ("___ (cue)")', () => {
    for (const q of typedQuestions) {
      if (q.kind === 'type' && /\(/.test(q.prompt)) expect(q.prompt, q.id).toMatch(/___ \([^)]+\)/)
    }
  })

  it('quiz lesson-s1-t2-w1 bốc 5 câu (có / không TTS), không trùng', () => {
    const quiz = getQuiz('lesson-s1-t2-w1')!
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      for (const canSpeak of [true, false]) {
        const picked = pickQuiz(QUESTION_BANK, quiz, seed, { canSpeak })
        expect(picked).toHaveLength(5)
        expect(new Set(picked.map((q) => q.id)).size).toBe(5)
        if (!canSpeak) expect(picked.some((q) => q.kind === 'listening')).toBe(false)
      }
    }
  })
})

describe('câu luyện thì T1–T2 (story 36)', () => {
  const ids = (lessonId: string, ns: readonly number[]) => ns.map((n) => `q-${lessonId}-${String(n).padStart(2, '0')}`)
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  /** Thì → bài và 12 id câu nhãn thì (bảng "Số câu và id"); `fresh` là câu mới của story 36. */
  const TENSE_QUESTIONS: Record<T1T2ScopeId, { lessonId: string; old: number[]; fresh: number[] }> = {
    'present-simple': { lessonId: 's1-t1-w2', old: [1, 2, 3], fresh: range(8, 16) },
    'present-simple-questions': { lessonId: 's1-t1-w3', old: [1, 2, 3], fresh: range(8, 16) },
    'present-continuous': { lessonId: 's1-t2-w1', old: [...range(1, 4), ...range(7, 10)], fresh: range(11, 14) },
    'past-to-be': { lessonId: 's1-t2-w2', old: range(7, 11), fresh: range(13, 19) },
    'past-simple': { lessonId: 's1-t2-w2', old: [...range(1, 4), 12], fresh: range(20, 26) },
    'past-simple-irregular': { lessonId: 's1-t2-w3', old: range(1, 4), fresh: range(7, 14) },
  }
  const TENSES = Object.keys(TENSE_QUESTIONS) as T1T2ScopeId[]
  const allOf = (t: T1T2ScopeId) => {
    const { lessonId, old, fresh } = TENSE_QUESTIONS[t]
    return ids(lessonId, [...old, ...fresh]).map((id) => getQuestion(id)!)
  }
  const freshOf = (t: T1T2ScopeId) => {
    const { lessonId, fresh } = TENSE_QUESTIONS[t]
    return ids(lessonId, fresh).map((id) => getQuestion(id) as TypedQuestion)
  }
  const ALL_FRESH = TENSES.flatMap(freshOf)
  const CHANGE_RE = /^Đổi [^:]+: [^:]+[.?!]$/
  const TRANSLATE_RE = /^Dịch sang tiếng Anh: .+ \([^)]+\)$/
  const isChange = (q: Question) => q.kind === 'transform' && CHANGE_RE.test(q.prompt)
  const isTranslate = (q: Question) => q.kind === 'transform' && TRANSLATE_RE.test(q.prompt)

  it('mỗi thì đúng 12 câu, đều tag thì, đoạn Ngữ pháp, đúng bài; câu nhãn thì của 5 bài khớp đúng bảng', () => {
    for (const t of TENSES) {
      const qs = allOf(t)
      expect(qs, t).toHaveLength(12)
      for (const q of qs) {
        expect(q, t).toBeDefined()
        expect(q.tag, q.id).toBe('thì')
        expect(q.sectionId, q.id).toBe('grammar')
        expect(q.lessonId, q.id).toBe(TENSE_QUESTIONS[t].lessonId)
      }
    }
    for (const lessonId of new Set(Object.values(TENSE_QUESTIONS).map((x) => x.lessonId))) {
      const inTable = TENSES.filter((t) => TENSE_QUESTIONS[t].lessonId === lessonId).flatMap((t) => allOf(t).map((q) => q.id))
      const tagged = QUESTION_BANK.filter((q) => q.lessonId === lessonId && q.tag === 'thì').map((q) => q.id)
      expect(new Set(tagged), lessonId).toEqual(new Set(inTable))
    }
  })

  it('44 câu mới đều là câu gõ type / transform, có requires hợp lệ', () => {
    expect(ALL_FRESH).toHaveLength(44)
    for (const q of ALL_FRESH) {
      expect(q, q?.id).toBeDefined()
      expect(['type', 'transform'], q.id).toContain(q.kind)
      expect(q.requires?.length ?? 0, q.id).toBeGreaterThan(0)
      expect(requiresViolations(q), q.id).toEqual([])
    }
  })

  it('mỗi thì có ≥ 3 câu type, ≥ 2 câu biến đổi, ≥ 2 câu dịch; đề transform khớp đúng một trong hai mẫu', () => {
    for (const t of TENSES) {
      const qs = allOf(t)
      expect(qs.filter((q) => q.kind === 'type').length, t).toBeGreaterThanOrEqual(3)
      expect(qs.filter(isChange).length, t).toBeGreaterThanOrEqual(2)
      expect(qs.filter(isTranslate).length, t).toBeGreaterThanOrEqual(2)
    }
    for (const q of ALL_FRESH.filter((x) => x.kind === 'transform')) {
      expect([CHANGE_RE.test(q.prompt), TRANSLATE_RE.test(q.prompt)].filter(Boolean), q.id).toHaveLength(1)
      // Câu biến đổi: phần sau ":" là câu tiếng Anh. Câu dịch: câu Việt có dấu, gợi ý tiếng Anh không dấu.
      if (isChange(q)) expect(hasVietnameseMarks(q.prompt.replace(/^[^:]+: /, '')), q.id).toBe(false)
      if (isTranslate(q)) {
        expect(hasVietnameseMarks(q.prompt.replace(/ \([^)]+\)$/, '')), q.id).toBe(true)
        expect(hasVietnameseMarks(promptEnglish(q.prompt)), q.id).toBe(false)
      }
    }
  })

  it('answer / accept không có dấu tiếng Việt, không trùng nhau sau chuẩn hoá', () => {
    for (const q of ALL_FRESH) {
      const all = [q.answer, ...(q.accept ?? [])]
      for (const a of all) expect(hasVietnameseMarks(a), `${q.id}: ${a}`).toBe(false)
      expect(new Set(all.map(normalizeTyped)).size, q.id).toBe(all.length)
    }
  })

  it('câu transform có đáp án (không phải câu hỏi) kết thúc bằng trạng ngữ thời gian thì accept có bản đặt trạng ngữ lên đầu', () => {
    let checked = 0
    for (const q of ALL_FRESH.filter((x) => x.kind === 'transform' && !x.answer.trim().endsWith('?'))) {
      const fronted = frontedTimeTail(normalizeTyped(q.answer))
      if (!fronted) continue
      checked++
      expect((q.accept ?? []).map(normalizeTyped), q.id).toContain(fronted)
    }
    expect(checked).toBeGreaterThanOrEqual(6)
  })

  it('chữ tiếng Anh của câu mới (đề, gợi ý, đáp án, accept) nằm trong phạm vi chữ của thì', () => {
    for (const t of TENSES) {
      for (const q of freshOf(t)) {
        for (const text of [promptEnglish(q.prompt), q.answer, ...(q.accept ?? [])]) {
          expect(outOfScopeWords(t, text), `${q.id}: ${text}`).toEqual([])
        }
      }
    }
  })

  it('đáp án câu mới không trùng nguyên câu ví dụ của TenseCard cùng bài', () => {
    for (const q of ALL_FRESH) {
      const examples = (getLessonContent(q.lessonId)?.grammar?.tenses ?? []).flatMap((t) => t.examples.map((e) => normalizeTyped(e.en)))
      expect(examples.length, q.lessonId).toBeGreaterThan(0)
      const filled = q.kind === 'type' ? q.prompt.replace(/___ \([^)]*\)|___/, q.answer) : q.answer
      for (const a of [filled, ...(q.accept ?? [])]) expect(examples, `${q.id}: ${a}`).not.toContain(normalizeTyped(a))
    }
  })

  it('không câu mới nào mang id đã bỏ hay id ngoài bảng (câu gõ của bài T1–T2)', () => {
    const DROPPED = ['q-s1-t1-w2-06', 'q-s1-t1-w3-05', 'q-s1-t1-w4-03', 'q-s1-t1-w4-06']
    for (const id of DROPPED) expect(getQuestion(id), id).toBeUndefined()
    const table = new Set(TENSES.flatMap((t) => allOf(t).map((q) => q.id)))
    const t1t2Typed = typedQuestions.filter((q) => [...T1, ...T2].includes(q.lessonId))
    expect(t1t2Typed.length).toBeGreaterThan(0)
    for (const q of t1t2Typed) expect(table.has(q.id), q.id).toBe(true)
  })

  it('golden: đề, đáp án, accept, requires đúng Design Notes', () => {
    const golden = (id: string) => getQuestion(id) as TypedQuestion
    expect(golden('q-s1-t1-w2-08')).toMatchObject({
      kind: 'type',
      prompt: 'My mother ___ (teach) English at a school.',
      answer: 'teaches',
      requires: ['present-simple', 'possessive-adjectives', 'articles', 'prepositions-of-place'],
    })
    expect(golden('q-s1-t1-w3-15')).toMatchObject({
      kind: 'transform',
      prompt: 'Dịch sang tiếng Anh: Cô ấy không uống cà phê. (drink, coffee)',
      answer: "She doesn't drink coffee.",
      requires: ['present-simple-negative', 'subject-pronouns'],
    })
    expect(golden('q-s1-t2-w2-13')).toMatchObject({
      kind: 'transform',
      prompt: 'Đổi sang câu hỏi: You were at work yesterday.',
      answer: 'Were you at work yesterday?',
      requires: ['be-questions', 'subject-pronouns', 'prepositions-of-place'],
    })
    expect(golden('q-s1-t2-w2-20')).toMatchObject({
      kind: 'transform',
      prompt: 'Đổi sang quá khứ (last Sunday): I play football.',
      answer: 'I played football last Sunday.',
      accept: ['Last Sunday I played football.'],
      requires: ['present-simple', 'subject-pronouns', 'days-months'],
    })
    expect(golden('q-s1-t2-w3-13')).toMatchObject({
      kind: 'transform',
      prompt: 'Dịch sang tiếng Anh: Tuần trước anh ấy mua một chiếc xe đạp mới. (buy, a new bike)',
      answer: 'He bought a new bike last week.',
      accept: ['Last week he bought a new bike.'],
      requires: ['subject-pronouns', 'articles', 'adjective-before-noun', 'verb-forms'],
    })
    for (const id of ['q-s1-t1-w2-08', 'q-s1-t1-w3-15', 'q-s1-t2-w2-13']) expect(golden(id).accept, id).toBeUndefined()
  })

  it('golden chấm bằng matchesTyped đúng như ma trận I/O', () => {
    const grade = (id: string, typed: string) => {
      const q = getQuestion(id) as TypedQuestion
      return matchesTyped(q.answer, typed, q.accept)
    }
    // Quiz câu dịch.
    expect(grade('q-s1-t1-w3-15', 'she does not drink coffee')).toBe(true)
    expect(grade('q-s1-t1-w3-15', "She don't drink coffee.")).toBe(false)
    // Trạng ngữ đầu câu.
    expect(grade('q-s1-t2-w3-13', 'Last week he bought a new bike')).toBe(true)
    expect(grade('q-s1-t2-w3-13', 'He buyed a new bike last week.')).toBe(false)
    // Biến đổi sang quá khứ.
    expect(grade('q-s1-t2-w2-20', 'I played football last Sunday')).toBe(true)
    expect(grade('q-s1-t2-w2-20', 'I play football last Sunday.')).toBe(false)
    // Đáp án của mọi câu mới tự khớp, kể cả viết thường, bỏ dấu câu.
    for (const q of ALL_FRESH) {
      for (const a of [q.answer, ...(q.accept ?? [])]) {
        expect(matchesTyped(q.answer, a, q.accept), q.id).toBe(true)
        expect(matchesTyped(q.answer, a.toLowerCase().replace(/[.?!,]/g, ''), q.accept), q.id).toBe(true)
      }
    }
  })

  it('quiz lesson-s1-t1-w2: 3 lần liên tiếp có TTS (cộng dồn câu đã gặp) phủ đủ 15 câu, không trùng', () => {
    const quiz = getQuiz('lesson-s1-t1-w2')!
    const all = QUESTION_BANK.filter((q) => q.lessonId === 's1-t1-w2').map((q) => q.id)
    expect(all).toHaveLength(15)
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const seen = new Set<string>()
      for (let round = 0; round < 3; round++) {
        const picked = pickQuiz(QUESTION_BANK, quiz, `${seed}-${round}`, { canSpeak: true, seen })
        expect(picked, `${seed} ${round}`).toHaveLength(LESSON_QUIZ_SIZE)
        for (const q of picked) {
          expect(seen.has(q.id), `${seed} ${round} ${q.id}`).toBe(false)
          seen.add(q.id)
        }
      }
      expect(new Set(seen), seed).toEqual(new Set(all))
    }
  })

  it('mọi quiz bài T1–T2 bốc đủ 5 câu không trùng, có / không TTS', () => {
    for (const id of [...T1, ...T2]) {
      const quiz = getQuiz(lessonQuizId(id))!
      for (const seed of ['a', 'b', 'c', 'd', 'e']) {
        for (const canSpeak of [true, false]) {
          const picked = pickQuiz(QUESTION_BANK, quiz, seed, { canSpeak })
          expect(picked, `${id} ${seed}`).toHaveLength(LESSON_QUIZ_SIZE)
          expect(new Set(picked.map((q) => q.id)).size).toBe(LESSON_QUIZ_SIZE)
          if (!canSpeak) expect(picked.some((q) => q.kind === 'listening')).toBe(false)
        }
      }
    }
  })

  it('owlTensePool vẫn đúng 57 câu, không chứa câu mới', () => {
    const pool = owlTensePool(QUESTION_BANK)
    expect(pool).toHaveLength(57)
    const fresh = new Set(ALL_FRESH.map((q) => q.id))
    for (const q of pool) expect(fresh.has(q.id), q.id).toBe(false)
  })
})

describe('câu luyện chủ điểm T3–T4 (story 37)', () => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  type T3T4 = (typeof T3_T4_SCOPE_IDS)[number]
  /** Chủ điểm → bài, id câu cũ, id câu mới theo dạng (bảng "Số câu và id", Design Notes story 37). */
  const TOPIC_QUESTIONS: Record<T3T4, { lessonId: string; old: number[]; type: number[]; change: number[]; translate: number[] }> = {
    will: { lessonId: 's1-t3-w1', old: range(1, 4), type: range(7, 10), change: range(11, 12), translate: range(13, 14) },
    'going-to': { lessonId: 's1-t3-w2', old: range(1, 4), type: range(7, 10), change: range(11, 12), translate: range(13, 14) },
    'present-perfect': { lessonId: 's1-t3-w3', old: range(1, 4), type: range(7, 10), change: range(11, 12), translate: range(13, 14) },
    'present-perfect-vs-past': { lessonId: 's1-t3-w4', old: range(1, 4), type: range(7, 10), change: range(11, 12), translate: range(13, 14) },
    modals: { lessonId: 's1-t4-w1', old: range(1, 4), type: range(7, 10), change: range(11, 12), translate: range(13, 14) },
    comparatives: { lessonId: 's1-t4-w3', old: [1, 2], type: range(7, 10), change: range(11, 13), translate: range(14, 16) },
    'passive-present': { lessonId: 's1-t4-w3', old: [3, 4], type: range(17, 20), change: range(21, 23), translate: range(24, 26) },
  }
  const TOPICS = [...T3_T4_SCOPE_IDS]
  const q = (lessonId: string, n: number) => getQuestion(`q-${lessonId}-${pad(n)}`)!
  const freshNs = (t: T3T4) => [...TOPIC_QUESTIONS[t].type, ...TOPIC_QUESTIONS[t].change, ...TOPIC_QUESTIONS[t].translate]
  const allOf = (t: T3T4) => [...TOPIC_QUESTIONS[t].old, ...freshNs(t)].map((n) => q(TOPIC_QUESTIONS[t].lessonId, n))
  const freshOf = (t: T3T4) => freshNs(t).map((n) => q(TOPIC_QUESTIONS[t].lessonId, n) as TypedQuestion)
  const ALL_FRESH = TOPICS.flatMap(freshOf)
  const CHANGE_RE = /^Đổi [^:]+: [^:]+[.?!]$/
  const TRANSLATE_RE = /^Dịch sang tiếng Anh: .+ \([^)]+\)$/
  const fill = (prompt: string, answer: string) => prompt.replace(/___( \([^)]*\))?/, answer)
  /** Chuỗi đáp án của câu gõ: đề đã điền (type) hoặc chính đáp án (transform). */
  const answerText = (x: TypedQuestion) => (x.kind === 'type' ? fill(x.prompt, x.answer) : x.answer)
  /** Đề của phần luyện (thì + khối "Chọn thì" cùng bài), so sau chuẩn hoá, bỏ gợi ý trong ngoặc. */
  const key = (text: string) => normalizeTyped(text.replace(/\([^)]*\)/g, ' '))
  const practicePrompts = (lessonId: string): Set<string> => {
    const grammar = getLessonContent(lessonId)?.grammar
    const subjects = [...(grammar?.tenses ?? []), ...(grammar?.choices ?? [])]
    return new Set(
      subjects
        .flatMap((x) => {
          const p = x.practice
          if (!p) return []
          return [p.worked.en, p.faded.en, ...[...p.check.items, ...p.check.easier].map((i) => ('prompt' in i ? (i.prompt ?? '') : ''))]
        })
        .map(key)
        .filter((x) => x !== ''),
    )
  }

  it('mỗi chủ điểm đúng 12 câu, đoạn Ngữ pháp, đúng bài; câu đoạn Ngữ pháp (choice + gõ) của 6 bài khớp đúng bảng', () => {
    for (const t of TOPICS) {
      const qs = allOf(t)
      expect(qs, t).toHaveLength(12)
      for (const x of qs) {
        expect(x, t).toBeDefined()
        expect(x.sectionId, x.id).toBe('grammar')
        expect(x.lessonId, x.id).toBe(TOPIC_QUESTIONS[t].lessonId)
      }
    }
    for (const lessonId of new Set(TOPICS.map((t) => TOPIC_QUESTIONS[t].lessonId))) {
      const inTable = TOPICS.filter((t) => TOPIC_QUESTIONS[t].lessonId === lessonId).flatMap((t) => allOf(t).map((x) => x.id))
      const grammar = QUESTION_BANK.filter((x) => x.lessonId === lessonId && x.sectionId === 'grammar').map((x) => x.id)
      expect(new Set(grammar), lessonId).toEqual(new Set(inTable))
    }
    // Câu cũ giữ nhãn: for / since là giới từ, so sánh là từ loại.
    expect(q('s1-t3-w4', 3).tag).toBe('giới từ')
    for (const n of [1, 2]) expect(q('s1-t4-w3', n).tag).toBe('từ loại')
  })

  it('60 câu mới đều là câu gõ type / transform; nhãn so sánh là từ loại, còn lại thì; requires hợp lệ, có ≥ 1 khái niệm viên gạch', () => {
    expect(ALL_FRESH).toHaveLength(60)
    for (const t of TOPICS) {
      for (const x of freshOf(t)) {
        expect(['type', 'transform'], x.id).toContain(x.kind)
        expect(x.tag, x.id).toBe(t === 'comparatives' ? 'từ loại' : 'thì')
        expect(x.requires?.length ?? 0, x.id).toBeGreaterThan(0)
        expect(requiresViolations(x), x.id).toEqual([])
        expect(x.requires!.some((c) => 'brick' in (conceptSource(c) ?? {})), x.id).toBe(true)
        // Tên thứ / tháng → days-months; số, năm → numbers.
        const text = [x.prompt, x.answer].join(' ')
        if (/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(text)) {
          expect(x.requires, x.id).toContain('days-months')
        }
        if (/\d|\b(two|three|four|five|six|seven|eight|nine|ten)\b/i.test(promptEnglish(x.prompt) + ' ' + x.answer)) {
          expect(x.requires, x.id).toContain('numbers')
        }
      }
    }
  })

  it('số câu gõ dạng đúng / biến đổi / dịch đúng bảng; đề transform khớp đúng một trong hai mẫu; type có đúng một ___ và gợi ý ngay sau', () => {
    for (const t of TOPICS) {
      const { lessonId, type, change, translate } = TOPIC_QUESTIONS[t]
      for (const n of type) {
        const x = q(lessonId, n)
        expect(x.kind, x.id).toBe('type')
        expect(x.prompt.split('___'), x.id).toHaveLength(2)
        if (x.prompt.includes('(')) expect(x.prompt, x.id).toMatch(/___ \([^)]+\)/)
      }
      for (const n of change) {
        const x = q(lessonId, n)
        expect(x.kind, x.id).toBe('transform')
        expect(CHANGE_RE.test(x.prompt) && !TRANSLATE_RE.test(x.prompt), x.id).toBe(true)
        expect(hasVietnameseMarks(x.prompt.replace(/^[^:]+: /, '')), x.id).toBe(false)
      }
      for (const n of translate) {
        const x = q(lessonId, n)
        expect(x.kind, x.id).toBe('transform')
        expect(TRANSLATE_RE.test(x.prompt) && !CHANGE_RE.test(x.prompt), x.id).toBe(true)
        expect(hasVietnameseMarks(x.prompt.replace(/ \([^)]+\)$/, '')), x.id).toBe(true)
        expect(hasVietnameseMarks(promptEnglish(x.prompt)), x.id).toBe(false)
      }
      expect([type.length, change.length, translate.length], t).toEqual(t === 'comparatives' || t === 'passive-present' ? [4, 3, 3] : [4, 2, 2])
    }
  })

  it('answer / accept không có dấu tiếng Việt, không trùng nhau sau chuẩn hoá', () => {
    for (const x of ALL_FRESH) {
      const all = [x.answer, ...(x.accept ?? [])]
      for (const a of all) expect(hasVietnameseMarks(a), `${x.id}: ${a}`).toBe(false)
      expect(new Set(all.map(normalizeTyped)).size, x.id).toBe(all.length)
    }
  })

  it("luật 's: đáp án có 's thì accept có dạng đầy đủ; he / she / it + is, chủ ngữ số ít + has + V3 thì accept có dạng 's", () => {
    let contracted = 0
    for (const x of ALL_FRESH) {
      const accepts = (x.accept ?? []).map(normalizeTyped)
      if (/[a-z]'s\b/i.test(x.answer)) {
        const full = [x.answer.replace(/'s\b/, ' is'), x.answer.replace(/'s\b/, ' has')].map(normalizeTyped)
        expect(full.some((f) => accepts.includes(f)), x.id).toBe(true)
      }
      const s = sContraction(x.answer)
      if (s) {
        contracted++
        expect(accepts, x.id).toContain(normalizeTyped(s))
      }
    }
    expect(contracted).toBeGreaterThanOrEqual(2)
  })

  it('câu không phải câu hỏi có đáp án kết thúc bằng trạng ngữ (kể cả … ago, in + năm) thì accept có bản đặt trạng ngữ lên đầu', () => {
    let checked = 0
    for (const x of ALL_FRESH.filter((y) => y.kind === 'transform' && !y.answer.trim().endsWith('?'))) {
      const fronted = frontedTimeTail(normalizeTyped(x.answer))
      if (!fronted) continue
      checked++
      expect((x.accept ?? []).map(normalizeTyped), x.id).toContain(fronted)
    }
    expect(checked).toBeGreaterThanOrEqual(6)
  })

  it('chữ tiếng Anh (đề qua promptEnglish, answer, accept) nằm trong phạm vi chữ của chủ điểm; câu so sánh không dùng bị động', () => {
    for (const t of TOPICS) {
      for (const x of freshOf(t)) {
        for (const text of [promptEnglish(x.prompt), x.answer, ...(x.accept ?? []), answerText(x)]) {
          expect(outOfScopeWords(t, text), `${x.id}: ${text}`).toEqual([])
        }
      }
    }
  })

  it('V2 / V3 bất quy tắc trong đề và đáp án (quiz mới và phần luyện) đều thuộc 50 động từ của IRREGULAR_VERBS', () => {
    // V2 / V3 bất quy tắc thông dụng (A1–B1) không có trong bảng 50 động từ; dạng trùng V1 (hurt, cut, let…) không tính.
    const OUTSIDE = new Set([
      'grew', 'grown', 'rode', 'ridden', 'flew', 'flown', 'wore', 'worn', 'threw', 'thrown', 'shown', 'drew', 'drawn', 'held',
      'won', 'stood', 'led', 'fed', 'bit', 'bitten', 'hid', 'hidden', 'shook', 'shaken', 'woke', 'woken', 'rose', 'risen', 'stole',
      'stolen', 'lent', 'fought', 'hung', 'swept', 'lit', 'blew', 'blown', 'rang', 'rung', 'sank', 'sunk', 'froze', 'frozen',
      'taught', 'sold', 'told', 'brought', 'thought', 'caught', 'bought', 'sent', 'spent', 'met', 'kept', 'built', 'slept', 'felt',
      'lost', 'beaten', 'bent', 'dealt', 'dug', 'fled', 'forgave', 'forgiven', 'laid', 'lain', 'shot', 'slid', 'sought', 'sped',
      'spun', 'stuck', 'stung', 'struck', 'swore', 'sworn', 'swung', 'tore', 'torn', 'wept', 'mistook', 'mistaken', 'overslept',
      'withdrew', 'withdrawn', 'arose', 'arisen', 'borne', 'dreamt', 'leapt', 'spelt', 'burnt',
    ].filter((w) => !IRREGULAR_VERBS.some((v) => [...v.v2.split(' / '), ...v.v3.split(' / ')].includes(w))))
    expect(OUTSIDE.has('grown')).toBe(true)
    expect(OUTSIDE.has('sold')).toBe(false)
    expect(OUTSIDE.has('sent')).toBe(false)
    const outside = (text: string) => (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []).filter((w) => OUTSIDE.has(w))
    for (const x of ALL_FRESH) {
      for (const text of [promptEnglish(x.prompt), answerText(x), ...(x.accept ?? [])]) {
        expect(outside(text), `${x.id}: ${text}`).toEqual([])
      }
    }
    // Phần luyện theo cùng luật đáp án như câu quiz (Boundaries story 37).
    let practiced = 0
    for (const t of allTenses().filter((y) => (T3_T4_SCOPE_IDS as readonly string[]).includes(y.id))) {
      if (!hasPractice(t)) continue
      practiced++
      for (const text of practiceEnglishTexts(t.practice).map(promptEnglish)) expect(outside(text), `${t.id}: ${text}`).toEqual([])
    }
    expect(practiced).toBe(T3_T4_SCOPE_IDS.length)
  })

  it('đáp án không trùng câu ví dụ của TenseCard cùng bài; đề không trùng đề phần luyện của thì và khối "Chọn thì" cùng bài', () => {
    for (const x of ALL_FRESH) {
      const examples = (getLessonContent(x.lessonId)?.grammar?.tenses ?? []).flatMap((t) => t.examples.map((e) => normalizeTyped(e.en)))
      expect(examples.length, x.lessonId).toBeGreaterThan(0)
      for (const a of [answerText(x), ...(x.accept ?? [])]) expect(examples, `${x.id}: ${a}`).not.toContain(normalizeTyped(a))
      const prompts = practicePrompts(x.lessonId)
      expect(prompts.size, x.lessonId).toBeGreaterThan(0)
      expect(prompts.has(key(x.prompt)), `${x.id}: ${x.prompt}`).toBe(false)
    }
    // Bài có khối "Chọn thì" thì đề luyện của khối cũng nằm trong tập so.
    const w2 = allTenseChoices().find((c) => c.id === 'will-vs-going-to')!
    expect(practicePrompts('s1-t3-w2').has(key(w2.practice.faded.en))).toBe(true)
  })

  it('golden: đề, đáp án, accept, requires đúng Design Notes', () => {
    const golden = (id: string) => getQuestion(id) as TypedQuestion
    expect(golden('q-s1-t3-w1-07')).toMatchObject({
      kind: 'type',
      prompt: 'I promise I ___ (call) you tonight.',
      answer: 'will call',
      accept: ["'ll call"],
      requires: ['subject-pronouns', 'object-pronouns', 'verb-forms'],
    })
    expect(golden('q-s1-t3-w2-11')).toMatchObject({
      kind: 'transform',
      prompt: 'Đổi sang câu phủ định: They are going to sell their house.',
      answer: "They aren't going to sell their house.",
      requires: ['subject-pronouns', 'possessive-adjectives', 'be-negative', 'verb-forms'],
    })
    expect(golden('q-s1-t3-w3-13')).toMatchObject({
      kind: 'transform',
      prompt: 'Dịch sang tiếng Anh: Bố tôi chưa bao giờ lái xe ô tô. (father, never, drive, a car)',
      answer: 'My father has never driven a car.',
      accept: ["My father's never driven a car."],
      requires: ['possessive-adjectives', 'articles', 'frequency-adverbs', 'verb-forms'],
    })
    expect(golden('q-s1-t3-w4-11')).toMatchObject({
      kind: 'transform',
      prompt: 'Đổi sang hiện tại hoàn thành (since 2019): My parents live in Da Nang.',
      answer: 'My parents have lived in Da Nang since 2019.',
      requires: ['possessive-adjectives', 'plurals', 'numbers', 'verb-forms'],
    })
    expect(golden('q-s1-t3-w4-13')).toMatchObject({
      kind: 'transform',
      prompt: 'Dịch sang tiếng Anh: Chúng tôi chuyển tới Hà Nội ba năm trước. (move, Hanoi, three years ago)',
      answer: 'We moved to Hanoi three years ago.',
      accept: ['Three years ago we moved to Hanoi.'],
      requires: ['subject-pronouns', 'numbers', 'verb-forms'],
    })
    expect(golden('q-s1-t4-w1-11')).toMatchObject({
      kind: 'transform',
      prompt: 'Đổi sang câu phủ định: My grandfather can swim.',
      answer: "My grandfather can't swim.",
      requires: ['possessive-adjectives', 'subject-verb'],
    })
    expect(golden('q-s1-t4-w3-07')).toMatchObject({
      kind: 'type',
      tag: 'từ loại',
      prompt: 'This bag is ___ (heavy) than that one.',
      answer: 'heavier',
      requires: ['demonstratives', 'be-affirmative', 'parts-of-speech'],
    })
    expect(golden('q-s1-t4-w3-21')).toMatchObject({
      kind: 'transform',
      prompt: 'Đổi sang bị động: People speak French in Canada.',
      answer: 'French is spoken in Canada.',
      requires: ['be-affirmative', 'verb-forms', 'prepositions-of-place'],
    })
    for (const id of ['q-s1-t3-w2-11', 'q-s1-t3-w4-11', 'q-s1-t4-w1-11', 'q-s1-t4-w3-07', 'q-s1-t4-w3-21']) {
      expect(golden(id).accept, id).toBeUndefined()
    }
  })

  it('golden chấm bằng matchesTyped đúng như ma trận I/O', () => {
    const grade = (id: string, typed: string) => {
      const x = getQuestion(id) as TypedQuestion
      return matchesTyped(x.answer, typed, x.accept)
    }
    // Quiz 's.
    expect(grade('q-s1-t3-w3-13', "My father's never driven a car")).toBe(true)
    expect(grade('q-s1-t3-w3-13', 'My father has never drove a car.')).toBe(false)
    // Trạng ngữ ago lên đầu.
    expect(grade('q-s1-t3-w4-13', 'Three years ago we moved to Hanoi')).toBe(true)
    expect(grade('q-s1-t3-w4-13', 'We have moved to Hanoi three years ago.')).toBe(false)
    // Biến đổi modal.
    expect(grade('q-s1-t4-w1-11', 'My grandfather can not swim')).toBe(true)
    expect(grade('q-s1-t4-w1-11', 'My grandfather cannot swim.')).toBe(true)
    expect(grade('q-s1-t4-w1-11', "My grandfather doesn't can swim.")).toBe(false)
    // So sánh: chỉ heavier đúng; câu sai vào Sổ lỗi với nhãn từ loại.
    expect(grade('q-s1-t4-w3-07', 'heavier')).toBe(true)
    expect(grade('q-s1-t4-w3-07', 'more heavy')).toBe(false)
    expect(grade('q-s1-t4-w3-07', 'heavyer')).toBe(false)
    expect(getQuestion('q-s1-t4-w3-07')?.tag).toBe('từ loại')
    // Bị động.
    expect(grade('q-s1-t4-w3-21', 'French is spoken in Canada.')).toBe(true)
    expect(grade('q-s1-t4-w3-21', 'French is speak in Canada.')).toBe(false)
    // will: 'll = will; sau will là nguyên mẫu.
    expect(grade('q-s1-t3-w1-07', "'ll call")).toBe(true)
    expect(grade('q-s1-t3-w1-07', 'will calls')).toBe(false)
    // Đáp án của mọi câu mới tự khớp, kể cả viết thường, bỏ dấu câu.
    for (const x of ALL_FRESH) {
      for (const a of [x.answer, ...(x.accept ?? [])]) {
        expect(matchesTyped(x.answer, a, x.accept), x.id).toBe(true)
        expect(matchesTyped(x.answer, a.toLowerCase().replace(/[.?!,]/g, ''), x.accept), x.id).toBe(true)
      }
    }
  })

  it('quiz lesson-s1-t4-w3: 3 lần liên tiếp có TTS (cộng dồn câu đã gặp) ra 15 câu khác nhau; mọi quiz bài T3–T4 bốc đủ 5 câu, có / không TTS', () => {
    const quiz = getQuiz('lesson-s1-t4-w3')!
    expect(QUESTION_BANK.filter((x) => x.lessonId === 's1-t4-w3')).toHaveLength(26)
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const seen = new Set<string>()
      for (let round = 0; round < 3; round++) {
        const picked = pickQuiz(QUESTION_BANK, quiz, `${seed}-${round}`, { canSpeak: true, seen })
        expect(picked, `${seed} ${round}`).toHaveLength(LESSON_QUIZ_SIZE)
        for (const x of picked) {
          expect(seen.has(x.id), `${seed} ${round} ${x.id}`).toBe(false)
          seen.add(x.id)
        }
      }
      expect(seen.size, seed).toBe(15)
    }
    for (const id of ['s1-t3-w1', 's1-t3-w2', 's1-t3-w3', 's1-t3-w4', 's1-t4-w1', 's1-t4-w3']) {
      const lessonQuiz = getQuiz(lessonQuizId(id))!
      for (const seed of ['a', 'b', 'c', 'd', 'e']) {
        for (const canSpeak of [true, false]) {
          const picked = pickQuiz(QUESTION_BANK, lessonQuiz, seed, { canSpeak })
          expect(picked, `${id} ${seed}`).toHaveLength(LESSON_QUIZ_SIZE)
          expect(new Set(picked.map((x) => x.id)).size).toBe(LESSON_QUIZ_SIZE)
          if (!canSpeak) expect(picked.some((x) => x.kind === 'listening')).toBe(false)
        }
      }
    }
  })

  it('O.W.L.: owlTensePool vẫn đúng 57 câu, không chứa câu mới; pickOwlTenses cùng seed ra cùng đề như baseline', () => {
    const pool = owlTensePool(QUESTION_BANK)
    expect(pool).toHaveLength(57)
    const fresh = new Set(ALL_FRESH.map((x) => x.id))
    for (const x of pool) expect(fresh.has(x.id), x.id).toBe(false)
    // Đề của seed "story-37" ở baseline f681c3e (trước story này).
    expect(pickOwlTenses(QUESTION_BANK, 'story-37').map((x) => x.id)).toEqual([
      'q-s1-t2-w3-01', 'q-s1-t2-w3-04', 'q-s1-t3-w2-03', 'q-s1-t4-w1-01', 'q-s1-t1-w1-01', 'q-s1-t4-w3-03', 'q-s1-t2-w2-12',
      'q-s1-t1-w3-03', 'q-s1-t2-w4-03', 'q-s1-t2-w4-01', 'q-s1-t3-w4-02', 'q-s1-t4-w4-01', 'q-s1-t2-w3-03', 'q-s1-t2-w1-02',
      'q-s1-t3-w3-03', 'q-s1-t2-w2-08', 'q-s1-t2-w1-03', 'q-s1-t2-w2-11', 'q-s1-t3-w1-01', 'q-s1-t1-w2-02',
    ])
  })

  it('Sổ lỗi cũ: q-s1-t3-w1-03 và q-s1-t4-w3-02 giữ đúng đề, đáp án, nhãn', () => {
    expect(getQuestion('q-s1-t3-w1-03')).toMatchObject({
      kind: 'choice',
      tag: 'thì',
      prompt: "Don't worry. I ___ forget.",
      answer: "won't",
    })
    expect(getQuestion('q-s1-t4-w3-02')).toMatchObject({
      kind: 'choice',
      tag: 'từ loại',
      prompt: 'This is ___ restaurant in town.',
      answer: 'the best',
    })
    // Câu cũ của 6 bài T3–T4 vẫn không có requires (requires câu cũ là việc của story 47).
    for (const t of TOPICS) for (const n of TOPIC_QUESTIONS[t].old) expect(q(TOPIC_QUESTIONS[t].lessonId, n).requires, `${t} ${n}`).toBeUndefined()
  })
})
