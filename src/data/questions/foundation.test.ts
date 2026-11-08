import { describe, expect, it } from 'vitest'

import { bricksOfRow, brickLessonId, isBrickId, ROW_IDS, type RowId } from '@/data/foundation'
import { pickQuiz } from '@/lib/quiz'

import {
  FOUNDATION_QUESTIONS,
  FOUNDATION_QUIZZES,
  foundationQuiz,
  getQuestion,
  getQuiz,
  MISTAKE_TAGS,
  QUESTION_BANK,
  QUIZZES,
  ROW_QUIZ_ID,
} from './index'

const SECTION_IDS = ['pronunciation', 'grammar', 'vocabulary', 'entertainment', 'main', 'checkpoint']
const SINGLE_LETTER = /^[A-Za-z]\.?$/

function rowOf(lessonId: string): RowId | undefined {
  return ROW_IDS.find((r) => bricksOfRow(r).some((b) => brickLessonId(b.id) === lessonId))
}

describe('ngân hàng câu Sân ga', () => {
  it('40 câu, id duy nhất (cả với QUESTION_BANK), dạng q-fNN-NN khớp lessonId', () => {
    expect(FOUNDATION_QUESTIONS).toHaveLength(40)
    const ids = [...QUESTION_BANK, ...FOUNDATION_QUESTIONS].map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const q of FOUNDATION_QUESTIONS) {
      expect(q.lessonId, q.id).toMatch(/^f\d{2}$/)
      expect(isBrickId(q.lessonId.toUpperCase()), q.id).toBe(true)
      expect(q.id).toMatch(new RegExp(`^q-${q.lessonId}-\\d{2}$`))
    }
  })

  it('tag thuộc MISTAKE_TAGS, sectionId hợp lệ (pronunciation F01–F05, vocabulary F06, grammar B–D)', () => {
    for (const q of FOUNDATION_QUESTIONS) {
      expect(MISTAKE_TAGS, q.id).toContain(q.tag)
      expect(SECTION_IDS, q.id).toContain(q.sectionId)
      const row = rowOf(q.lessonId)
      const expected = row !== 'A' ? 'grammar' : q.lessonId === 'f06' ? 'vocabulary' : 'pronunciation'
      expect(q.sectionId, q.id).toBe(expected)
    }
  })

  it('4 lựa chọn khác nhau, đáp án trùng đúng một lựa chọn; có đề và giải thích', () => {
    for (const q of FOUNDATION_QUESTIONS) {
      expect(q.options, q.id).toHaveLength(4)
      expect(new Set(q.options).size, q.id).toBe(4)
      expect(q.options.filter((o) => o === q.answer), q.id).toHaveLength(1)
      expect(q.prompt.trim(), q.id).not.toBe('')
      expect(q.explanation.trim(), q.id).not.toBe('')
    }
  })

  it('câu nghe: audioText = đáp án, tag nghe, không phải chữ cái đơn; câu khác không có audioText', () => {
    for (const q of FOUNDATION_QUESTIONS) {
      if (q.kind === 'listening') {
        expect(q.audioText, q.id).toBe(q.answer)
        expect(q.tag, q.id).toBe('nghe')
        expect(SINGLE_LETTER.test(q.audioText!.trim()), q.id).toBe(false)
      } else {
        expect(q.audioText, q.id).toBeUndefined()
      }
    }
  })

  describe.each(ROW_IDS.map((r) => [r] as const))('hàng %s', (row) => {
    const quiz = foundationQuiz(row)
    const of = FOUNDATION_QUESTIONS.filter((q) => rowOf(q.lessonId) === row)

    it('quiz đúng id, lessonIds là viên của hàng, bài nhà là viên đầu hàng', () => {
      expect(quiz.id).toBe(ROW_QUIZ_ID[row])
      expect(quiz.id).toBe(`quiz-f-${row.toLowerCase()}`)
      expect(quiz.lessonIds).toEqual(bricksOfRow(row).map((b) => brickLessonId(b.id)))
      expect(quiz.homeLessonId).toBe(quiz.lessonIds[0])
      expect(quiz.size).toBe(8)
    })

    it('10 câu, ≤ 2 câu nghe, mỗi viên ≥ minPerLesson câu không phải câu nghe', () => {
      expect(of).toHaveLength(10)
      expect(of.filter((q) => q.kind === 'listening').length).toBeLessThanOrEqual(2)
      for (const id of quiz.lessonIds) {
        const n = of.filter((q) => q.lessonId === id && q.kind !== 'listening').length
        expect(n, id).toBeGreaterThanOrEqual(quiz.minPerLesson)
      }
    })

    it('pickQuiz cho đúng 8 câu với 20 seed, có và không có TTS (không TTS thì không có câu nghe)', () => {
      for (let i = 0; i < 20; i++) {
        for (const canSpeak of [true, false]) {
          const picked = pickQuiz(FOUNDATION_QUESTIONS, quiz, `seed-${i}`, { canSpeak })
          expect(picked, `seed-${i} ${canSpeak}`).toHaveLength(8)
          expect(new Set(picked.map((q) => q.id)).size).toBe(8)
          for (const q of picked) expect(quiz.lessonIds).toContain(q.lessonId)
          if (!canSpeak) expect(picked.some((q) => q.kind === 'listening')).toBe(false)
          for (const id of quiz.lessonIds) {
            expect(picked.filter((q) => q.lessonId === id).length, id).toBeGreaterThanOrEqual(quiz.minPerLesson)
          }
        }
      }
    })
  })

  it('không lẫn vào QUESTION_BANK / QUIZZES; getQuiz không tra được quiz Sân ga', () => {
    expect(QUESTION_BANK.some((q) => /^f\d{2}$/.test(q.lessonId))).toBe(false)
    expect(QUIZZES.some((z) => z.lessonIds.some((id) => /^f\d{2}$/.test(id)))).toBe(false)
    expect(QUIZZES.some((z) => z.id.startsWith('lesson-f'))).toBe(false)
    for (const z of FOUNDATION_QUIZZES) expect(getQuiz(z.id)).toBeUndefined()
  })

  it('getQuestion tra được câu Sân ga và câu cũ', () => {
    expect(getQuestion('q-f02-01')?.lessonId).toBe('f02')
    expect(getQuestion(QUESTION_BANK[0].id)).toBe(QUESTION_BANK[0])
    expect(getQuestion('q-f99-01')).toBeUndefined()
  })
})
