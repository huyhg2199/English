import { describe, expect, it } from 'vitest'

import type { Store } from '@/lib/storage'

import { RECOGNITION_MESSAGES, type RecognitionErrorCode } from '@/lib/speech-recognition'

import {
  applyRecognition,
  bestComparison,
  compareSpeech,
  isDictationId,
  normalizeWords,
  numberToWords,
  pronunciationAverage,
  readPronunciation,
  recordAttempt,
} from '.'

const store = (data: Record<string, unknown> = {}): Store => ({ schemaVersion: 7, data })
const T = (m: number) => new Date(Date.UTC(2026, 10, 2, 10, m))

describe('normalizeWords', () => {
  it('chữ thường, bỏ dấu câu, tách nói tắt, số → chữ, okay → ok', () => {
    expect(normalizeWords("I'm OK.")).toEqual(['i', 'am', 'ok'])
    expect(normalizeWords('i’m okay!')).toEqual(['i', 'am', 'ok'])
    expect(normalizeWords('He has 2 cats, and 21 dogs?')).toEqual(['he', 'has', 'two', 'cats', 'and', 'twenty', 'one', 'dogs'])
    expect(normalizeWords("Don't stop — please")).toEqual(['do', 'not', 'stop', 'please'])
    expect(normalizeWords('  ...  ')).toEqual([])
  })

  it("nói tắt theo quy tắc chung: n't, 'll, 've, 're, 'd; dạng đặc biệt can't, won't", () => {
    expect(normalizeWords("didn't couldn't haven't")).toEqual(['did', 'not', 'could', 'not', 'have', 'not'])
    expect(normalizeWords("you'll we've they're she'd")).toEqual(['you', 'will', 'we', 'have', 'they', 'are', 'she', 'would'])
    expect(normalizeWords("can't won't let's")).toEqual(['can', 'not', 'will', 'not', 'let', 'us'])
    expect(compareSpeech("They didn't call.", 'they did not call').score).toBe(100)
  })

  it('không đổi ms thành miss', () => {
    expect(normalizeWords('Ms. Weaver')).toEqual(['ms', 'weaver'])
  })

  it('numberToWords', () => {
    expect(numberToWords(0)).toBe('zero')
    expect(numberToWords(40)).toBe('forty')
    expect(numberToWords(105)).toBe('one hundred five')
    expect(numberToWords(1400)).toBe('1400')
  })
})

describe('compareSpeech', () => {
  it('nói đúng → 100%, không từ đỏ', () => {
    const r = compareSpeech('I am a student.', 'I am a student')
    expect(r.score).toBe(100)
    expect(r.words.every((w) => w.ok)).toBe(true)
    expect(r.words.map((w) => w.text)).toEqual(['I', 'am', 'a', 'student.'])
  })

  it('nói thiếu "am" → "am" đỏ, 75%', () => {
    const r = compareSpeech('I am a student.', 'I a student')
    expect(r.score).toBe(75)
    expect(r.words.filter((w) => !w.ok).map((w) => w.text)).toEqual(['am'])
  })

  it('hoa thường, dấu câu, nói tắt coi là khớp', () => {
    expect(compareSpeech("I'm OK.", "i'm ok").score).toBe(100)
    expect(compareSpeech("I'm OK.", 'I am okay').score).toBe(100)
    expect(compareSpeech('She has two cats.', 'she has 2 cats').score).toBe(100)
  })

  it('từ lệch và từ thừa: chỉ từ lệch đỏ', () => {
    const r = compareSpeech('I live in a big city.', 'I leave in uh a big city')
    expect(r.words.filter((w) => !w.ok).map((w) => w.text)).toEqual(['live'])
    expect(r.score).toBe(83)
  })

  it('không nghe gì → 0%; câu mẫu rỗng → 0%', () => {
    expect(compareSpeech('Hello there.', '').score).toBe(0)
    expect(compareSpeech('', 'hello')).toEqual({ words: [], score: 0 })
  })

  it('bestComparison lấy phương án điểm cao nhất và trả về đúng phương án đó', () => {
    const c = bestComparison('I am a student.', ['I a student', 'I am a student'])
    expect(c.score).toBe(100)
    expect(c.heard).toBe('I am a student')
    expect(bestComparison('I am a student.', ['I a student', 'a student']).heard).toBe('I a student')
    expect(bestComparison('Hi.', [])).toMatchObject({ score: 0, heard: '' })
  })
})

describe('recordAttempt', () => {
  it('lần 1 60, lần 2 80, lần 3 70 → best 80, attempts 3, updatedAt không lùi', () => {
    let s = store()
    s = recordAttempt(s, 'a', 60, T(1))
    s = recordAttempt(s, 'a', 80, T(2))
    s = recordAttempt(s, 'a', 70, T(0))
    const item = readPronunciation(s).a
    expect(item).toMatchObject({ best: 80, attempts: 3 })
    expect(Date.parse(item.updatedAt)).toBeGreaterThan(T(2).getTime())
  })

  it('không sửa store cũ, giữ câu khác và mục sai dạng; điểm ngoài 0–100 bị chặn', () => {
    const before = store({ pronunciation: { items: { junk: 'x', b: { best: 50, attempts: 1, updatedAt: T(0).toISOString() } } } })
    const after = recordAttempt(before, 'a', 140, T(1))
    expect(before.data.pronunciation).toEqual({ items: { junk: 'x', b: { best: 50, attempts: 1, updatedAt: T(0).toISOString() } } })
    const items = (after.data.pronunciation as { items: Record<string, unknown> }).items
    expect(items.junk).toBe('x')
    expect(readPronunciation(after).a.best).toBe(100)
    expect(readPronunciation(after).b.best).toBe(50)
  })

  it('pronunciationAverage: chưa thử → null; trung bình best làm tròn', () => {
    expect(pronunciationAverage(store())).toBeNull()
    let s = store()
    s = recordAttempt(s, 'a', 50, T(1))
    s = recordAttempt(s, 'b', 71, T(1))
    expect(pronunciationAverage(s)).toBe(61)
  })

  it('pronunciationAverage bỏ điểm chép chính tả (id <bài>-dict-<n>); chỉ có chính tả → null', () => {
    expect(isDictationId('s1-t4-w3-dict-1')).toBe(true)
    expect(isDictationId('s1-t4-w3-say-1')).toBe(false)
    expect(isDictationId('s1-t3-w4-shadow-2')).toBe(false)
    let s = recordAttempt(store(), 's1-t4-w3-dict-1', 100, T(1))
    expect(pronunciationAverage(s)).toBeNull()
    s = recordAttempt(s, 's1-t4-w3-say-1', 40, T(2))
    expect(pronunciationAverage(s)).toBe(40)
  })
})

describe('applyRecognition', () => {
  const sentence = { id: 's1', text: 'I am a student.' }
  const fail = (error: RecognitionErrorCode) => ({ ok: false as const, error, message: RECOGNITION_MESSAGES[error] })

  it.each(['not-allowed', 'no-speech', 'audio-capture', 'network', 'other'] as const)(
    'lỗi %s → store giữ nguyên, có câu báo tiếng Việt, không lưu điểm',
    (code) => {
      const before = store()
      const { store: after, outcome } = applyRecognition(before, sentence, fail(code), T(1))
      expect(after).toBe(before)
      expect(outcome).toEqual({ kind: 'error', error: code, message: RECOGNITION_MESSAGES[code] })
    },
  )

  it('không hỗ trợ → unsupported, store giữ nguyên', () => {
    const before = store()
    expect(applyRecognition(before, sentence, fail('unsupported'), T(1))).toEqual({ store: before, outcome: { kind: 'unsupported' } })
  })

  it('người dùng dừng (aborted) → aborted, store giữ nguyên', () => {
    const before = store()
    expect(applyRecognition(before, sentence, fail('aborted'), T(1))).toEqual({ store: before, outcome: { kind: 'aborted' } })
  })

  it('nhận dạng được → chấm phương án tốt nhất, lưu best, trả phương án đã dùng', () => {
    const r1 = applyRecognition(store(), sentence, { ok: true, transcripts: ['I a student'] }, T(1))
    expect(r1.outcome).toMatchObject({ kind: 'result', comparison: { score: 75, heard: 'I a student' } })
    const r2 = applyRecognition(r1.store, sentence, { ok: true, transcripts: ['a student', 'I am a student'] }, T(2))
    expect(r2.outcome).toMatchObject({ kind: 'result', comparison: { score: 100, heard: 'I am a student' } })
    expect(readPronunciation(r2.store).s1).toMatchObject({ best: 100, attempts: 2 })
  })
})
