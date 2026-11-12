import { describe, expect, it } from 'vitest'

import { DONT_TRANSLATE, getLessonContent, SIMPLE_VS_CONTINUOUS, WILL_VS_GOING_TO } from '@/data/lessons'

import { choiceSides, lessonTenseIds } from './tense-choice'

describe('choiceSides (story 39)', () => {
  it('trả đúng Tense và kiểu dòng thời gian của hai bên, theo thứ tự sides', () => {
    const sc = choiceSides(SIMPLE_VS_CONTINUOUS)
    expect(sc.map((s) => s.tense.id)).toEqual(['present-simple', 'present-continuous'])
    expect(sc.map((s) => s.tense.timeline?.kind)).toEqual(['habit', 'progress'])
    expect(sc[0].whenVi).toBe(SIMPLE_VS_CONTINUOUS.sides![0].whenVi)
    expect(sc[1].example).toEqual(SIMPLE_VS_CONTINUOUS.sides![1].example)

    const wg = choiceSides(WILL_VS_GOING_TO)
    expect(wg.map((s) => s.tense.id)).toEqual(['will', 'going-to'])
    expect(wg.map((s) => s.tense.timeline?.kind)).toEqual(['future-point', 'plan'])
  })

  it('khối không có sides (Đừng dịch từng chữ) → []', () => {
    expect(choiceSides(DONT_TRANSLATE)).toEqual([])
  })

  it('side trỏ id lạ → ném lỗi nêu rõ id', () => {
    const bad = {
      id: 'x-vs-y',
      sides: [
        { tenseId: 'present-simple', whenVi: 'a', example: { en: 'I work.', vi: 'Tôi làm.' } },
        { tenseId: 'khong-co', whenVi: 'b', example: { en: 'I go.', vi: 'Tôi đi.' } },
      ] as const,
    }
    expect(() => choiceSides(bad)).toThrow(/khong-co/)
    expect(() => choiceSides(SIMPLE_VS_CONTINUOUS, [])).toThrow(/present-simple/)
  })
})

describe('lessonTenseIds (story 39)', () => {
  it('thì của bài trước, rồi thì của các bên khối; bỏ trùng', () => {
    expect(lessonTenseIds(getLessonContent('s1-t3-w2'))).toEqual(['going-to', 'will'])
    expect(lessonTenseIds(getLessonContent('s1-t2-w1'))).toEqual(['present-continuous', 'present-simple'])
    expect(lessonTenseIds(getLessonContent('s1-t1-w1'))).toEqual(['to-be'])
  })

  it('khối không có sides không thêm thì; bài không có nội dung → []', () => {
    expect(lessonTenseIds(getLessonContent('s1-t3-w4'))).toEqual(['present-perfect-vs-past'])
    expect(lessonTenseIds(getLessonContent('s1-t4-w4'))).toEqual([])
    expect(lessonTenseIds(undefined)).toEqual([])
  })
})
