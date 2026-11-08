import { describe, expect, it } from 'vitest'

import { sectionHref } from '@/data/roadmap'

import { questionSourceHref, sourceLabel } from './source-label'

describe('nguồn câu', () => {
  it('câu Sân ga fNN: link mở đúng viên, nhãn "Viên gạch Fxx · tên"', () => {
    expect(questionSourceHref('f03', 'pronunciation')).toBe('/foundation/F03')
    expect(sourceLabel('f03', 'pronunciation')).toBe('Viên gạch F03 · IPA là gì')
    expect(questionSourceHref('f18', 'grammar')).toBe('/foundation/F18')
  })

  it('bài lộ trình giữ như cũ', () => {
    expect(questionSourceHref('s1-t1-w1', 'grammar')).toBe(sectionHref('s1-t1-w1', 'grammar'))
    expect(sourceLabel('s1-t1-w1', 'grammar')).toMatch(/ · Ngữ pháp$/)
  })

  it('viên lạ f99 → /foundation, không ném lỗi', () => {
    expect(questionSourceHref('f99', 'x')).toBe('/foundation')
    expect(sourceLabel('f99', 'x')).toBe('Sân ga 9¾')
    expect(() => questionSourceHref('F03', 'x')).not.toThrow()
  })
})
