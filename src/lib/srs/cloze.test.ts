import { describe, expect, it } from 'vitest'

import { clozeText, splitCloze } from './cloze'

describe('splitCloze — thẻ điền chỗ trống cho hư từ', () => {
  it('"The meeting starts at nine." với the → "___ meeting starts at nine.", giữ hoa thường của đáp án', () => {
    const parts = splitCloze('The meeting starts at nine.', ['the'])
    expect(parts).toEqual({ before: '', answer: 'The', after: ' meeting starts at nine.' })
    expect(clozeText(parts!)).toBe('___ meeting starts at nine.')
  })

  it('dạng của từ: be → "She ___ a nurse.", đáp án "is"', () => {
    const parts = splitCloze('She is a nurse.', ['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being'])
    expect(parts?.answer).toBe('is')
    expect(clozeText(parts!)).toBe('She ___ a nurse.')
  })

  it('token đầu tiên khớp bất kỳ dạng nào (không theo thứ tự forms)', () => {
    expect(splitCloze('Give me my book.', ['i', 'me', 'my'])).toEqual({ before: 'Give ', answer: 'me', after: ' my book.' })
  })

  it('không phân biệt hoa thường, ghép lại đúng câu gốc', () => {
    const sentence = 'Where IS the bank?'
    const parts = splitCloze(sentence, ['is'])!
    expect(parts.answer).toBe('IS')
    expect(parts.before + parts.answer + parts.after).toBe(sentence)
  })

  it('"it\'s" là một token, không khớp "it"; khớp token "it" sau đó', () => {
    expect(splitCloze("It's cold.", ['it', 'its'])).toBeNull()
    expect(splitCloze('It’s cold.', ['it', 'its'])).toBeNull()
    expect(splitCloze("It's cold, but it is fine.", ['it'])?.before).toBe("It's cold, but ")
  })

  it('chỉ khớp nguyên token: "another" không khớp "an", "there" không khớp "the"', () => {
    expect(splitCloze('There is another one.', ['the', 'an'])).toBeNull()
  })

  it('không có dạng nào → null', () => {
    expect(splitCloze('I like tea.', ['the'])).toBeNull()
    expect(splitCloze('', ['the'])).toBeNull()
  })
})
