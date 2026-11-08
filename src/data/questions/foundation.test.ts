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

/**
 * Token cấm trong câu hàng B (story 25): to be, have, do, khuyết thiếu do F13–F16 dạy hoặc thuộc Năm 1.
 * Khai báo lặp (cùng `isForbidden`, `englishParts`) ở `src/data/foundation/foundation.test.ts` (luật câu tiếng Anh của
 * viên F07–F12); sửa thì sửa cả hai.
 */
const ROW_B_FORBIDDEN = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', "it's", "that's", "he's", "she's", "there's", "what's",
  'have', 'has', 'had', 'do', 'does', 'did',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
])
const FORBIDDEN_CONTRACTION = /n't$|'(m|re|ve|ll|d)$/
const isForbidden = (token: string) => ROW_B_FORBIDDEN.has(token) || FORBIDDEN_CONTRACTION.test(token)
const VIETNAMESE = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i
const tokensOf = (text: string) =>
  (text.replace(/[’‘ʼ`]/g, "'").match(/[A-Za-z']+/g) ?? []).map((t) => t.toLowerCase())
/** Chuỗi lẫn tiếng Việt: chỉ lấy câu trong ngoặc kép không dấu và phần còn lại sau khi bỏ ngoặc đơn (nếu hết dấu). */
function englishParts(text: string): string[] {
  if (!VIETNAMESE.test(text)) return [text]
  const parts = [...text.matchAll(/[“"]([^”"]+)[”"]/g)].map((m) => m[1]).filter((q) => !VIETNAMESE.test(q))
  const rest = text.replace(/\([^)]*\)/g, '')
  if (!VIETNAMESE.test(rest)) parts.push(rest)
  return parts
}

const ROW_B_IDS = ['q-f07-01', 'q-f07-02', 'q-f08-01', 'q-f08-02', 'q-f09-01', 'q-f10-01', 'q-f10-02', 'q-f11-01', 'q-f11-02', 'q-f12-01']

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

  it('hàng B giữ đủ 10 id cũ (Sổ lỗi tham chiếu theo id), theo đúng thứ tự', () => {
    expect(FOUNDATION_QUESTIONS.filter((q) => rowOf(q.lessonId) === 'B').map((q) => q.id)).toEqual(ROW_B_IDS)
    for (const id of ROW_B_IDS) expect(getQuestion(id)?.id, id).toBe(id)
  })

  it('hàng B: đề (đã điền), lựa chọn, đáp án, audioText, giải thích không có to be, have, do, khuyết thiếu', () => {
    const bad: string[] = []
    for (const q of FOUNDATION_QUESTIONS.filter((x) => rowOf(x.lessonId) === 'B')) {
      const filled = q.prompt.replace('___', q.answer)
      for (const text of [filled, ...q.options, q.answer, q.audioText ?? '', q.explanation]) {
        const hit = englishParts(text).flatMap(tokensOf).filter(isForbidden)
        if (hit.length > 0) bad.push(`${q.id}: "${text}" (${hit.join(', ')})`)
      }
    }
    expect(bad).toEqual([])
  })

  it('Sổ lỗi cũ: getQuestion("q-f11-02") trả câu đã viết lại (không to be)', () => {
    const q = getQuestion('q-f11-02')!
    expect(q.lessonId).toBe('f11')
    expect(q.answer).toBe('I buy a bag.')
    expect(getQuestion('q-f12-01')?.answer).toBe('these')
  })

  it('getQuestion tra được câu Sân ga và câu cũ', () => {
    expect(getQuestion('q-f02-01')?.lessonId).toBe('f02')
    expect(getQuestion(QUESTION_BANK[0].id)).toBe(QUESTION_BANK[0])
    expect(getQuestion('q-f99-01')).toBeUndefined()
  })
})
