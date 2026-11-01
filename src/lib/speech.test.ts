import { describe, expect, it, vi } from 'vitest'

import { canSpeak, speak } from './speech'

class FakeUtterance {
  lang = ''
  rate = 1
  voice: unknown = null
  constructor(public text: string) {}
}

describe('speech', () => {
  it('không có speechSynthesis → canSpeak false, speak không crash', () => {
    expect(canSpeak({})).toBe(false)
    expect(speak('hello', {}, {})).toBe(false)
  })

  it('đọc bằng giọng en-US', () => {
    const spoken: FakeUtterance[] = []
    const voice = { lang: 'en-US', name: 'Samantha' }
    const g = {
      speechSynthesis: {
        speak: vi.fn((u: FakeUtterance) => spoken.push(u)),
        cancel: vi.fn(),
        getVoices: () => [{ lang: 'en-GB' }, voice],
      } as unknown as SpeechSynthesis,
      SpeechSynthesisUtterance: FakeUtterance as unknown as typeof SpeechSynthesisUtterance,
    }
    expect(canSpeak(g)).toBe(true)
    expect(speak('people', {}, g)).toBe(true)
    expect(spoken).toHaveLength(1)
    expect(spoken[0]).toMatchObject({ text: 'people', lang: 'en-US', voice })
  })

  it('speak ném lỗi → trả false, không crash', () => {
    const g = {
      speechSynthesis: {
        speak: () => {
          throw new Error('blocked')
        },
        cancel: () => {},
      } as unknown as SpeechSynthesis,
      SpeechSynthesisUtterance: FakeUtterance as unknown as typeof SpeechSynthesisUtterance,
    }
    expect(speak('x', {}, g)).toBe(false)
  })
})
