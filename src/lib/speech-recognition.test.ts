import { describe, expect, it } from 'vitest'

import { canRecognize, recognizeOnce, type RecognitionGlobal, type RecognitionLike } from './speech-recognition'

type Behaviour = (rec: RecognitionLike) => void

function fakeGlobal(behaviour: Behaviour, key: 'SpeechRecognition' | 'webkitSpeechRecognition' = 'webkitSpeechRecognition') {
  const created: RecognitionLike[] = []
  class FakeRecognition implements RecognitionLike {
    lang = ''
    interimResults = true
    continuous = true
    maxAlternatives = 1
    onresult: RecognitionLike['onresult'] = null
    onerror: RecognitionLike['onerror'] = null
    onend: RecognitionLike['onend'] = null
    aborted = false
    constructor() {
      created.push(this)
    }
    start() {
      behaviour(this)
    }
    abort() {
      this.aborted = true
      this.onend?.()
    }
  }
  return { g: { [key]: FakeRecognition } as RecognitionGlobal, created }
}

const result = (...alts: string[]) => ({ results: [alts.map((transcript) => ({ transcript }))] })

describe('speech-recognition', () => {
  it('không có API → canRecognize false, recognizeOnce trả lỗi "chưa hỗ trợ" (không crash)', async () => {
    expect(canRecognize({})).toBe(false)
    const r = await recognizeOnce({ lang: 'en-US' }, {})
    expect(r).toMatchObject({ ok: false, error: 'unsupported' })
    if (!r.ok) expect(r.message).toContain('chưa hỗ trợ')
  })

  it('nhận dạng được → các phương án chữ, đặt lang en-US, không interim', async () => {
    const { g, created } = fakeGlobal((rec) => {
      rec.onresult?.(result('I am a student', 'I am a students'))
      rec.onend?.()
    })
    expect(canRecognize(g)).toBe(true)
    const r = await recognizeOnce({ lang: 'en-US' }, g)
    expect(r).toEqual({ ok: true, transcripts: ['I am a student', 'I am a students'] })
    expect(created[0]).toMatchObject({ lang: 'en-US', interimResults: false, continuous: false })
  })

  it('dùng SpeechRecognition chuẩn nếu có', async () => {
    const { g } = fakeGlobal((rec) => rec.onresult?.(result('hello')), 'SpeechRecognition')
    expect(await recognizeOnce({}, g)).toEqual({ ok: true, transcripts: ['hello'] })
  })

  it.each([
    ['not-allowed', 'not-allowed', 'micro'],
    ['service-not-allowed', 'not-allowed', 'micro'],
    ['no-speech', 'no-speech', 'Chưa nghe thấy'],
    ['audio-capture', 'audio-capture', 'micro'],
    ['network', 'network', 'mạng'],
    ['lạ', 'other', 'lỗi'],
  ])('onerror %s → lỗi %s kèm câu tiếng Việt', async (error, code, text) => {
    const { g } = fakeGlobal((rec) => {
      rec.onerror?.({ error })
      rec.onend?.()
    })
    const r = await recognizeOnce({}, g)
    expect(r).toMatchObject({ ok: false, error: code })
    if (!r.ok) expect(r.message).toContain(text)
  })

  it('kết thúc mà không có kết quả → no-speech', async () => {
    const { g } = fakeGlobal((rec) => rec.onend?.())
    expect(await recognizeOnce({}, g)).toMatchObject({ ok: false, error: 'no-speech' })
  })

  it('start ném lỗi → lỗi other, không crash', async () => {
    const { g } = fakeGlobal(() => {
      throw new Error('busy')
    })
    expect(await recognizeOnce({}, g)).toMatchObject({ ok: false, error: 'other' })
  })

  it('huỷ bằng signal → aborted, gọi abort()', async () => {
    const { g, created } = fakeGlobal(() => {})
    const ctrl = new AbortController()
    const p = recognizeOnce({ signal: ctrl.signal }, g)
    ctrl.abort()
    expect(await p).toMatchObject({ ok: false, error: 'aborted' })
    expect((created[0] as unknown as { aborted: boolean }).aborted).toBe(true)
  })
})
