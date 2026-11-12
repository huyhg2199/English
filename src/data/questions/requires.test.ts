import { describe, expect, it } from 'vitest'

import { BRICKS, CONCEPT_IDS } from '@/data/foundation'
import { allLessons, getLesson } from '@/data/roadmap'

import {
  conceptSource,
  FOUNDATION_QUESTIONS,
  getQuestion,
  LESSON_CONCEPT_LESSON_IDS,
  LESSON_CONCEPTS,
  QUESTION_BANK,
  requiresViolations,
  T1_LESSON_CONCEPTS,
  T1_LESSON_IDS,
  T2_T4_LESSON_CONCEPTS,
  type ChoiceQuestion,
  type Question,
  type RequiredConcept,
} from './index'

const T1_QUESTIONS = QUESTION_BANK.filter((q) => (T1_LESSON_IDS as readonly string[]).includes(q.lessonId))
const OTHER_QUESTIONS = QUESTION_BANK.filter((q) => !(T1_LESSON_IDS as readonly string[]).includes(q.lessonId))
const q = (id: string): ChoiceQuestion => getQuestion(id) as ChoiceQuestion
const withRequires = (base: Question, requires: readonly string[]): Question => ({
  ...base,
  requires: requires as readonly RequiredConcept[],
})

describe('requires: khai báo của ngân hàng câu', () => {
  it('216 câu QUESTION_BANK (42 câu T1 + 174 câu T2–T4, story 47) và 46 câu Sân ga (story 44) đều khai báo requires hợp lệ', () => {
    expect(T1_QUESTIONS).toHaveLength(42)
    expect(OTHER_QUESTIONS).toHaveLength(174)
    expect(QUESTION_BANK).toHaveLength(216)
    expect(FOUNDATION_QUESTIONS).toHaveLength(46)
    for (const question of [...QUESTION_BANK, ...FOUNDATION_QUESTIONS]) {
      expect(question.requires, question.id).toBeDefined()
      expect(requiresViolations(question), question.id).toEqual([])
    }
  })

  it('story 47: câu đoạn Ngữ pháp T2–T4 có ít nhất 1 khái niệm của chính bài, trừ đúng 4 câu ôn q-s1-t2-w4-01 … -04 và câu của s1-t4-w4', () => {
    const exempt = (q: Question) => q.lessonId === 's1-t4-w4' || ['01', '02', '03', '04'].map((n) => `q-s1-t2-w4-${n}`).includes(q.id)
    const missing: string[] = []
    let checked = 0
    for (const q of OTHER_QUESTIONS.filter((x) => x.sectionId === 'grammar' && !exempt(x))) {
      checked++
      const own = LESSON_CONCEPTS[q.lessonId as keyof typeof LESSON_CONCEPTS] ?? []
      if (!(q.requires ?? []).some((c) => own.includes(c))) missing.push(q.id)
    }
    expect(missing).toEqual([])
    expect(checked).toBeGreaterThan(100)
    // Ngoại lệ có thật: 4 câu ôn của s1-t2-w4 không cần khái niệm quá khứ tiếp diễn; s1-t4-w4 không dạy khái niệm mới.
    for (const n of ['01', '02', '03', '04']) expect(q(`q-s1-t2-w4-${n}`).requires, n).not.toContain('past-continuous')
    expect(T2_T4_LESSON_CONCEPTS['s1-t4-w4']).toEqual([])
  })

  it('story 47: q-s1-t2-w2-20 … -26 đều có past-simple; -20 … -23 thêm verb-forms; 66 câu cũ (-01 … -06) có requires, đề giữ nguyên', () => {
    for (const n of [20, 21, 22, 23, 24, 25, 26]) expect(q(`q-s1-t2-w2-${n}`).requires, String(n)).toContain('past-simple')
    for (const n of [20, 21, 22, 23]) expect(q(`q-s1-t2-w2-${n}`).requires, String(n)).toContain('verb-forms')
    const old = OTHER_QUESTIONS.filter((x) => Number(x.id.slice(-2)) <= 6)
    expect(old).toHaveLength(66)
    for (const x of old) expect(x.requires?.length ?? 0, x.id).toBeGreaterThan(0)
    expect(q('q-s1-t2-w1-02').requires).toEqual(['subject-pronouns', 'present-continuous'])
    expect(q('q-s1-t2-w2-05').requires).toEqual(['stress', 'suffix-stress'])
    expect(q('q-s1-t3-w4-05').requires).toEqual(['weak-forms', 'present-perfect-vs-past'])
    expect(q('q-s1-t3-w1-03')).toMatchObject({ prompt: "Don't worry. I ___ forget.", answer: "won't" })
  })

  it('câu T1 không dùng thì quá khứ hay đuôi -ed (học ở T2 tuần 3), kể cả ở lựa chọn sai và đáp án / accept của câu gõ', () => {
    // Dạng quá khứ hay gặp; từ kết thúc bằng "ed" mà không phải quá khứ thì thêm vào NOT_PAST khi cần.
    const PAST = new Set(['was', 'were', 'did', "didn't", 'didnt', 'went', 'had', 'gone', 'been'])
    const NOT_PAST = new Set(['need', 'red', 'bed', 'speed'])
    const bad: string[] = []
    for (const question of T1_QUESTIONS) {
      const texts = [
        question.prompt,
        question.explanation,
        ...('options' in question ? [question.audioText ?? '', ...question.options] : [question.answer, ...(question.accept ?? [])]),
      ]
      for (const token of texts.join(' ').replace(/[’‘]/g, "'").toLowerCase().match(/[a-z']+/g) ?? []) {
        if (PAST.has(token) || (/^[a-z]{2,}ed$/.test(token) && !NOT_PAST.has(token))) bad.push(`${question.id}: ${token}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('câu T2–T4 có requires thì cũng phải hợp lệ', () => {
    for (const question of OTHER_QUESTIONS) expect(requiresViolations(question), question.id).toEqual([])
  })

  it('khái niệm bài T1–T4 không trùng CONCEPT_IDS, mỗi khái niệm do đúng 1 bài dạy, bài có trong lộ trình, thứ tự khớp lộ trình', () => {
    const all = LESSON_CONCEPT_LESSON_IDS.flatMap((l) => [...LESSON_CONCEPTS[l]])
    expect(new Set(all).size).toBe(all.length)
    for (const c of all) expect(CONCEPT_IDS as readonly string[], c).not.toContain(c)
    expect(LESSON_CONCEPT_LESSON_IDS).toHaveLength(15)
    expect(LESSON_CONCEPT_LESSON_IDS.slice(0, 4)).toEqual([...T1_LESSON_IDS])
    for (const l of T1_LESSON_IDS) expect(LESSON_CONCEPTS[l]).toEqual(T1_LESSON_CONCEPTS[l])
    for (const l of LESSON_CONCEPT_LESSON_IDS) {
      expect(getLesson(l), l).toBeDefined()
      for (const c of LESSON_CONCEPTS[l]) expect(conceptSource(c), c).toEqual({ lesson: l })
    }
    // Thứ tự LESSON_CONCEPT_LESSON_IDS khớp thứ tự lộ trình; đúng các bài có câu trong QUESTION_BANK.
    const order = allLessons().map((l) => l.id)
    const idx = LESSON_CONCEPT_LESSON_IDS.map((l) => order.indexOf(l))
    expect(idx).toEqual([...idx].sort((a, b) => a - b))
    expect(
      new Set(QUESTION_BANK.map((x) => x.lessonId)),
      'Bài mới có câu trong QUESTION_BANK phải thêm vào LESSON_CONCEPT_LESSON_IDS (đúng thứ tự lộ trình) và T2_T4_LESSON_CONCEPTS ' +
        '(concepts.ts); nếu không, câu của bài đó rơi về luật "câu khác" (không bắt buộc requires, như câu O.W.L.).',
    ).toEqual(new Set(LESSON_CONCEPT_LESSON_IDS))
    for (const b of BRICKS) for (const c of b.teaches) expect(conceptSource(c), c).toEqual({ brick: b.id })
    expect(conceptSource('khong-co')).toBeUndefined()
  })

  it('Sổ lỗi cũ (story 36): câu cũ giữ đúng đề; không câu nào mang id đã bỏ', () => {
    expect(q('q-s1-t1-w2-01')).toMatchObject({ prompt: 'She ___ in an office.', answer: 'works', kind: 'choice' })
    expect(q('q-s1-t2-w2-07')).toMatchObject({ prompt: 'Where ___ they last night? — At home.', answer: 'were', kind: 'choice' })
    for (const id of ['q-s1-t1-w2-06', 'q-s1-t1-w3-05', 'q-s1-t1-w4-03', 'q-s1-t1-w4-06']) expect(getQuestion(id), id).toBeUndefined()
  })

  it('câu đã viết lại giữ id: Sổ lỗi cũ tra ra câu mới', () => {
    const w4 = q('q-s1-t1-w4-01')
    expect(w4.prompt).toContain('/z/')
    expect(w4.answer).toBe('plays')
    expect(q('q-s1-t1-w3-06').options).not.toContain('She didn’t watch TV.')
  })
})

describe('requiresViolations: ca tự kiểm', () => {
  it('câu W1 khai báo present-simple (dạy ở W2) → vi phạm', () => {
    expect(requiresViolations(withRequires(q('q-s1-t1-w1-01'), ['be-affirmative', 'present-simple']))).not.toEqual([])
  })

  it('câu W4 được dùng khái niệm bài trước và chính bài; câu T1 dùng viên bất kỳ', () => {
    expect(requiresViolations(withRequires(q('q-s1-t1-w4-04'), ['present-simple', 'verb-s-endings', 'frequency-adverbs']))).toEqual([])
  })

  it('câu q-f13-… cần prepositions-of-time (F18) → vi phạm', () => {
    expect(requiresViolations(withRequires(q('q-f13-01'), ['be-affirmative', 'prepositions-of-time']))).not.toEqual([])
  })

  it('câu fNN không có khái niệm của chính viên → vi phạm', () => {
    expect(requiresViolations(withRequires(q('q-f13-01'), ['subject-pronouns', 'articles']))).not.toEqual([])
  })

  it('câu fNN không được dùng khái niệm bài T1', () => {
    expect(requiresViolations(withRequires(q('q-f17-02'), ['verb-forms', 'present-simple']))).not.toEqual([])
  })

  it('thiếu requires, mảng rỗng, trùng, id lạ đều là vi phạm', () => {
    const base = q('q-s1-t1-w1-01')
    const { requires: _drop, ...noReq } = base
    void _drop
    expect(requiresViolations(noReq)).not.toEqual([])
    expect(requiresViolations({ ...q('q-f01-01'), requires: undefined })).not.toEqual([])
    expect(requiresViolations(withRequires(base, []))).not.toEqual([])
    expect(requiresViolations(withRequires(base, ['be-affirmative', 'be-affirmative']))).not.toEqual([])
    expect(requiresViolations(withRequires(base, ['be-affirmative', 'khong-co']))).not.toEqual([])
  })

  it('story 47: câu T2–T4 không khai báo thì vi phạm (nêu id câu); khai báo id lạ thì vi phạm', () => {
    const t2 = OTHER_QUESTIONS[0]
    expect(requiresViolations({ ...t2, requires: undefined })).toEqual([`${t2.id}: thiếu requires`])
    expect(requiresViolations(withRequires(t2, ['khong-co']))).not.toEqual([])
  })

  it('story 47: q-s1-t2-w1-01 khai báo past-simple (dạy ở s1-t2-w2) → vi phạm "dạy ở s1-t2-w2, sau bài của câu"', () => {
    expect(requiresViolations(withRequires(q('q-s1-t2-w1-01'), ['articles', 'past-simple']))).toEqual([
      'q-s1-t2-w1-01: "past-simple" dạy ở s1-t2-w2, sau bài của câu',
    ])
    // Khái niệm của chính bài và bài trước (T1) thì được.
    expect(requiresViolations(withRequires(q('q-s1-t2-w2-01'), ['present-simple', 'present-continuous', 'past-simple']))).toEqual([])
  })

  it('story 47: câu T1 dùng khái niệm T2 → vi phạm', () => {
    expect(requiresViolations(withRequires(q('q-s1-t1-w3-01'), ['subject-pronouns', 'present-continuous']))).toEqual([
      'q-s1-t1-w3-01: "present-continuous" dạy ở s1-t2-w1, sau bài của câu',
    ])
  })

  it('story 47: câu Sân ga dùng khái niệm bài T2 → vi phạm', () => {
    expect(requiresViolations(withRequires(q('q-f13-01'), ['be-affirmative', 'present-continuous']))).toEqual([
      'q-f13-01: "present-continuous" là khái niệm bài, câu Sân ga không được dùng',
    ])
  })

  it('câu O.W.L. giữ luật cũ: gắn bài T2–T4 thì không bị bắt buộc / xét thứ tự bài', () => {
    const owl = { ...q('q-s1-t2-w1-01'), id: 'q-owl-99', lessonId: 's1-t2-w1' }
    expect(requiresViolations({ ...owl, requires: undefined })).toEqual([])
    expect(requiresViolations(withRequires(owl, ['articles', 'passive-present']))).toEqual([])
    expect(requiresViolations(withRequires(owl, ['khong-co']))).not.toEqual([])
  })
})
