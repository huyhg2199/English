import { describe, expect, it } from 'vitest'

import { getLesson, getSection } from '@/data/roadmap'

import { getLessonContent } from '@/data/lessons'
import { pickQuiz } from '@/lib/quiz'

import {
  getQuestion,
  getQuiz,
  LESSON_QUIZ_SIZE,
  lessonQuizId,
  MISTAKE_TAGS,
  QUESTION_BANK,
  QUIZZES,
  quizHref,
  type Question,
} from './index'

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

  it('4 lựa chọn khác nhau, đáp án nằm trong lựa chọn; có đề và giải thích', () => {
    for (const q of QUESTION_BANK) {
      expect(q.options, q.id).toHaveLength(4)
      expect(new Set(q.options).size, q.id).toBe(4)
      expect(q.options.filter((o) => o === q.answer), q.id).toHaveLength(1)
      expect(q.prompt.trim(), q.id).not.toBe('')
      expect(q.explanation.trim(), q.id).not.toBe('')
    }
  })

  it('câu nghe có audioText là đáp án; câu khác không có audioText', () => {
    for (const q of QUESTION_BANK) {
      if (q.kind === 'listening') {
        expect(q.audioText, q.id).toBe(q.answer)
        expect(q.tag, q.id).toBe('nghe')
      } else {
        expect(q.audioText, q.id).toBeUndefined()
      }
    }
  })

  it('mỗi bài T1 đủ 6 câu (24 câu), mỗi bài có ít nhất 2 câu không phải câu nghe', () => {
    const t1 = QUESTION_BANK.filter((q) => T1.includes(q.lessonId))
    expect(t1).toHaveLength(24)
    for (const id of T1) {
      const of: Question[] = t1.filter((q) => q.lessonId === id)
      expect(of, id).toHaveLength(6)
      expect(of.filter((q) => q.kind !== 'listening').length, id).toBeGreaterThanOrEqual(2)
    }
  })

  it('T2–T4: 66 câu, mỗi bài có nội dung đủ 6 câu (≥ 2 câu không phải câu nghe); tuần Tết không có câu', () => {
    const later = QUESTION_BANK.filter((q) => !T1.includes(q.lessonId))
    expect(later).toHaveLength(66)
    for (const id of T2_T4) {
      const of = later.filter((q) => q.lessonId === id)
      expect(of, id).toHaveLength(6)
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
    for (const q of QUESTION_BANK.filter((x) => x.kind === 'choice' && x.lessonId !== 's1-t4-w4')) {
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
    for (const q of qs) for (const t of [q.prompt, ...q.options, q.explanation]) expect(t, q.id).not.toMatch(CAN)
  })

  it('q-s1-t3-w1-06 vẫn là câu nghe, viết lại bằng will', () => {
    const q = getQuestion('q-s1-t3-w1-06')!
    expect(q.kind).toBe('listening')
    expect(q.answer).toBe("I'll help you tomorrow.")
  })
})
