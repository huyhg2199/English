import { describe, expect, it } from 'vitest'

import { FOUNDATION_STEPS, LESSON_STEPS } from './plan'
import { stepperItems } from './stepper'

describe('stepperItems (story 30)', () => {
  it('3 bước, index 1 → done, current, upcoming; giữ id, tên, phút', () => {
    const items = stepperItems(FOUNDATION_STEPS, 1)
    expect(items.map((i) => i.state)).toEqual(['done', 'current', 'upcoming'])
    expect(items.map(({ id, title, minutes }) => ({ id, title, minutes }))).toEqual(FOUNDATION_STEPS)
  })

  it('buổi bài: Bài chính / Ôn flashcard / Giải trí theo plan.steps', () => {
    const items = stepperItems(LESSON_STEPS, 0)
    expect(items.map((i) => i.title)).toEqual(['Bài chính', 'Ôn flashcard', 'Giải trí'])
    expect(items.map((i) => i.state)).toEqual(['current', 'upcoming', 'upcoming'])
  })

  it('bước cuối → mọi bước trước là done', () => {
    expect(stepperItems(LESSON_STEPS, 2).map((i) => i.state)).toEqual(['done', 'done', 'current'])
  })
})
