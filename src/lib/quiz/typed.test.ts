import { describe, expect, it } from 'vitest'

import { hasVietnameseMarks, matchesTyped, normalizeTyped } from './typed'

describe('normalizeTyped / matchesTyped (story 35)', () => {
  it('không phân biệt hoa thường, dấu câu, khoảng trắng thừa', () => {
    expect(normalizeTyped('  Are   PLAYING. ')).toBe('are playing')
    expect(matchesTyped('are playing', 'Are  playing.')).toBe(true)
    expect(matchesTyped('are playing', 'are play')).toBe(false)
    expect(matchesTyped('Who', 'who?')).toBe(true)
    expect(matchesTyped('Who', 'what')).toBe(false)
  })

  it("n't có nháy, thiếu nháy, nháy cong đều bằng dạng đầy đủ", () => {
    for (const typed of ['is not working', 'isnt working', 'ISN’T working.', "isn't working", 'isn`t working']) {
      expect(matchesTyped("isn't working", typed), typed).toBe(true)
    }
    expect(matchesTyped("isn't working", "doesn't working")).toBe(false)
    expect(normalizeTyped("She doesn't")).toBe('she does not')
    expect(normalizeTyped('She doesnt')).toBe('she does not')
    expect(matchesTyped("aren't", 'are not')).toBe(true)
    expect(matchesTyped('are not', "aren't")).toBe(true)
  })

  it("won't / can't / can not", () => {
    expect(normalizeTyped("won't")).toBe('will not')
    expect(normalizeTyped('wont')).toBe('will not')
    expect(matchesTyped("won't go", 'will not go')).toBe(true)
    expect(matchesTyped("can't swim", 'cannot swim')).toBe(true)
    expect(matchesTyped("can't swim", 'can not swim')).toBe(true)
    expect(matchesTyped('cannot swim', 'cant swim')).toBe(true)
  })

  it("I'm / they're chỉ mở rộng khi có nháy", () => {
    expect(matchesTyped('I am not writing an email.', "i'm not writing an email")).toBe(true)
    expect(matchesTyped('They are cooking.', 'they’re cooking')).toBe(true)
    expect(matchesTyped("I've finished.", 'I have finished')).toBe(true)
    expect(matchesTyped("She'll come.", 'she will come')).toBe(true)
    expect(matchesTyped('I am not writing an email.', 'I not writing an email.')).toBe(false)
  })

  it('"were" không phải "we\'re"', () => {
    expect(matchesTyped("We're cooking.", 'were cooking')).toBe(false)
    expect(matchesTyped('were', "we're")).toBe(false)
    expect(matchesTyped('We are cooking.', "we're cooking")).toBe(true)
  })

  it("'s không mở rộng, trừ khi có trong accept", () => {
    expect(matchesTyped("She's cooking.", 'she is cooking')).toBe(false)
    expect(matchesTyped("She's cooking.", 'shes cooking')).toBe(true)
    expect(matchesTyped("She's cooking.", 'she is cooking', ['She is cooking.'])).toBe(true)
  })

  it('accept: nhận thêm cách viết khác', () => {
    expect(matchesTyped('is crying', 'cries', ['cries'])).toBe(true)
    expect(matchesTyped('is crying', 'cried', ['cries'])).toBe(false)
  })

  it('ô trống (hoặc chỉ dấu câu) luôn sai', () => {
    expect(matchesTyped('are playing', '')).toBe(false)
    expect(matchesTyped('are playing', '   ')).toBe(false)
    expect(matchesTyped('are playing', ' ?! ')).toBe(false)
    expect(matchesTyped('', '')).toBe(false)
  })

  it('sai trật tự từ là sai (không chấm mờ)', () => {
    expect(matchesTyped('Are they waiting for the bus?', 'They are waiting for the bus?')).toBe(false)
    expect(matchesTyped('Are they waiting for the bus?', 'are they waiting for the bus')).toBe(true)
    expect(matchesTyped('Are they waiting for the bus?', 'Are they wating for the bus?')).toBe(false)
  })

  it('như checkFill: giống nhau sau khi bỏ khoảng trắng là bằng', () => {
    expect(matchesTyped('check-in', 'checkin')).toBe(true)
  })
})

describe('sau review story 35', () => {
  it("hadn't / needn't / mightn't = dạng đầy đủ, có hoặc thiếu nháy; 'd không mở rộng", () => {
    expect(matchesTyped("hadn't finished", 'had not finished')).toBe(true)
    expect(matchesTyped("hadn't finished", 'hadnt finished')).toBe(true)
    expect(matchesTyped("needn't go", 'need not go')).toBe(true)
    expect(matchesTyped("mightn't come", 'mightnt come')).toBe(true)
    expect(matchesTyped("I'd finished", 'I had finished')).toBe(false)
  })

  it('nháy ´ / ′ / ＇ (bàn phím, bộ gõ) coi như nháy thẳng', () => {
    expect(matchesTyped('do not', 'don´t')).toBe(true)
    expect(matchesTyped('do not', 'don′t')).toBe(true)
    expect(matchesTyped('do not', 'don＇t')).toBe(true)
  })

  it('giới hạn đã biết của luật bỏ khoảng trắng: "isnot", "Iam" tính đúng', () => {
    expect(matchesTyped("isn't working", 'isnot working')).toBe(true)
    expect(matchesTyped('I am not writing', 'Iam not writing')).toBe(true)
  })

  it('hasVietnameseMarks: bắt chữ có dấu do bộ gõ Telex / VNI, chữ tiếng Anh thì không', () => {
    expect(hasVietnameseMarks('ínt working')).toBe(true)
    expect(hasVietnameseMarks('ảe playing')).toBe(true)
    expect(hasVietnameseMarks('Đi')).toBe(true)
    expect(hasVietnameseMarks("isn't working")).toBe(false)
    expect(hasVietnameseMarks('Are you listening to music?')).toBe(false)
    expect(hasVietnameseMarks('')).toBe(false)
  })
})
