import { describe, expect, it } from 'vitest'

import { sectionHref } from '@/data/roadmap'
import { brickHref } from '@/lib/foundation'

import { ruleSource } from './rule-source'

describe('nguồn thẻ quy tắc (story 24, 33, 38)', () => {
  it('thẻ của thì trong bài s1-t2-w2: nhãn "T2 tuần 2", link "Xem lại bài" về đoạn Ngữ pháp', () => {
    expect(ruleSource({ lessonId: 's1-t2-w2' })).toEqual({
      label: 'T2 tuần 2',
      link: { to: sectionHref('s1-t2-w2', 'grammar'), text: 'Xem lại bài' },
    })
    expect(sectionHref('s1-t2-w2', 'grammar')).toBe('/roadmap/lesson/s1-t2-w2/grammar')
  })

  it('bài lạ: nhãn là id, không link', () => {
    expect(ruleSource({ lessonId: 's9-t9-w9' })).toEqual({ label: 's9-t9-w9', link: null })
  })

  it('thẻ viên gạch giữ nhãn và link cũ; viên lạ không link', () => {
    expect(ruleSource({ brickId: 'F13' })).toEqual({ label: 'F13', link: { to: brickHref('F13'), text: 'Xem lại viên F13' } })
    expect(brickHref('F13')).toBe('/foundation/F13')
    expect(ruleSource({ brickId: 'F99' })).toEqual({ label: 'F99', link: null })
  })

  it('thẻ thì T3 (story 38): nhãn "T3 tuần 1", link "Xem lại bài"', () => {
    expect(ruleSource({ lessonId: 's1-t3-w1' })).toEqual({
      label: 'T3 tuần 1',
      link: { to: sectionHref('s1-t3-w1', 'grammar'), text: 'Xem lại bài' },
    })
  })

  it('thẻ quá khứ tiếp diễn (story 46): nhãn "T2 tuần 4", link "Xem lại bài" về Ngữ pháp s1-t2-w4', () => {
    expect(ruleSource({ lessonId: 's1-t2-w4' })).toEqual({
      label: 'T2 tuần 4',
      link: { to: '/roadmap/lesson/s1-t2-w4/grammar', text: 'Xem lại bài' },
    })
  })

  it('thẻ động từ bất quy tắc (story 38): nhãn "Động từ bất quy tắc", link "Xem lại bảng động từ" về Ngữ pháp s1-t2-w3', () => {
    expect(ruleSource({ lessonId: 's1-t2-w3', verbGroup: 'Rất thông dụng, mỗi từ một kiểu: học thuộc' })).toEqual({
      label: 'Động từ bất quy tắc',
      link: { to: '/roadmap/lesson/s1-t2-w3/grammar', text: 'Xem lại bảng động từ' },
    })
    // Không có verbGroup thì vẫn là thẻ của thì trong bài s1-t2-w3.
    expect(ruleSource({ lessonId: 's1-t2-w3' }).link?.text).toBe('Xem lại bài')
  })
})
