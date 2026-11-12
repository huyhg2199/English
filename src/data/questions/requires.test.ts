import { describe, expect, it } from 'vitest'

import { BRICKS, CONCEPT_IDS } from '@/data/foundation'
import { getLesson } from '@/data/roadmap'

import {
  conceptSource,
  FOUNDATION_QUESTIONS,
  getQuestion,
  QUESTION_BANK,
  requiresViolations,
  T1_LESSON_CONCEPTS,
  T1_LESSON_IDS,
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
  it('42 câu T1 (24 câu cũ + 18 câu gõ story 36) và 46 câu Sân ga (story 44) đều khai báo requires hợp lệ', () => {
    expect(T1_QUESTIONS).toHaveLength(42)
    expect(FOUNDATION_QUESTIONS).toHaveLength(46)
    for (const question of [...T1_QUESTIONS, ...FOUNDATION_QUESTIONS]) {
      expect(question.requires, question.id).toBeDefined()
      expect(requiresViolations(question), question.id).toEqual([])
    }
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

  it('khái niệm bài T1 không trùng CONCEPT_IDS, mỗi khái niệm do đúng 1 bài dạy, bài có trong lộ trình', () => {
    const all = T1_LESSON_IDS.flatMap((l) => [...T1_LESSON_CONCEPTS[l]])
    expect(new Set(all).size).toBe(all.length)
    for (const c of all) expect(CONCEPT_IDS as readonly string[], c).not.toContain(c)
    for (const l of T1_LESSON_IDS) {
      expect(getLesson(l), l).toBeDefined()
      for (const c of T1_LESSON_CONCEPTS[l]) expect(conceptSource(c), c).toEqual({ lesson: l })
    }
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

  it('câu T2–T4 không khai báo thì không vi phạm; khai báo id lạ thì vi phạm', () => {
    const t2 = OTHER_QUESTIONS[0]
    expect(requiresViolations({ ...t2, requires: undefined })).toEqual([])
    expect(requiresViolations(withRequires(t2, ['khong-co']))).not.toEqual([])
  })
})
