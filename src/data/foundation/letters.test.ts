import { describe, expect, it } from 'vitest'

import { LETTER_SPEECH, spellForSpeech } from './letters'

const SINGLE_LETTER = /(^|[^A-Za-z])[A-HJ-Z]([^A-Za-z]|$)/

describe('LETTER_SPEECH', () => {
  it('đủ 26 chữ A–Z, mỗi tên là từ (không phải chữ cái đứng một mình)', () => {
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
    expect(Object.keys(LETTER_SPEECH).sort()).toEqual(letters)
    for (const l of letters) {
      expect(LETTER_SPEECH[l].length, l).toBeGreaterThan(1)
      expect(SINGLE_LETTER.test(LETTER_SPEECH[l]), l).toBe(false)
    }
  })

  it('tên các chữ hay nhầm theo Decisions', () => {
    expect(LETTER_SPEECH.A).toBe('ay')
    expect(LETTER_SPEECH.H).toBe('aitch')
    expect(LETTER_SPEECH.W).toBe('double you')
    expect(LETTER_SPEECH.Z).toBe('zee')
  })
})

describe('spellForSpeech', () => {
  it("'H-U-Y' / 'huy' / 'H U Y' → 'aitch, you, why'", () => {
    expect(spellForSpeech('H-U-Y')).toBe('aitch, you, why')
    expect(spellForSpeech('huy')).toBe('aitch, you, why')
    expect(spellForSpeech('H U Y')).toBe('aitch, you, why')
  })

  it('số giữ nguyên, @ và dấu chấm đọc thành từ', () => {
    expect(spellForSpeech('AB12')).toBe('ay, bee, 1, 2')
    expect(spellForSpeech('a@b.c')).toBe('ay, at, bee, dot, see')
  })

  it('chuỗi rỗng → rỗng', () => {
    expect(spellForSpeech('')).toBe('')
    expect(spellForSpeech(' - ')).toBe('')
  })
})
