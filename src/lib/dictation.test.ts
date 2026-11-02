import { describe, expect, it } from 'vitest'

import { gradeDictation } from './dictation'

describe('gradeDictation', () => {
  it('gõ đúng (không hoa, không dấu câu) → 100%', () => {
    const r = gradeDictation('She is working now.', 'she is working now')!
    expect(r.score).toBe(100)
    expect(r.words.every((w) => w.ok)).toBe(true)
  })

  it('thiếu "is" → tô đỏ đúng từ đó, 75%', () => {
    const r = gradeDictation('She is working now.', 'she working now')!
    expect(r.score).toBe(75)
    expect(r.words.filter((w) => !w.ok).map((w) => w.text)).toEqual(['is'])
  })

  it('nói tắt và số được chuẩn hoá như luyện nói', () => {
    expect(gradeDictation("I've known him since 2020.", 'I have known him since 2020')!.score).toBe(100)
    expect(gradeDictation("She isn't here.", 'she is not here')!.score).toBe(100)
  })

  it('ô trống → không chấm', () => {
    expect(gradeDictation('She is working now.', '   ')).toBeNull()
  })

  it('giữ câu đã gõ (bỏ khoảng trắng thừa)', () => {
    expect(gradeDictation('Hi.', '  hi  ')!.typed).toBe('hi')
  })
})
