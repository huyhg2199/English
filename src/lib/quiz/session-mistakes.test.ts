import { describe, expect, it } from 'vitest'

import { getQuestion, QUESTION_BANK } from '@/data/questions'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  readMistakes,
  recordMistake,
  SESSION_MISTAKES_HEAVY,
  SESSION_MISTAKES_MAX,
  sessionMistakeIds,
} from './mistakes'

const MIN = 60 * 1000
const T0 = new Date('2026-12-10T09:00:00.000Z')
const NOW = new Date('2026-12-11T09:00:00.000Z')
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
const normal = { canSpeak: true, heavyReview: false }

/** Câu chọn đáp án (không phải câu nghe) trong ngân hàng, theo thứ tự ngân hàng. */
const CHOICE_IDS = QUESTION_BANK.filter((q) => q.kind === 'choice').map((q) => q.id)
const LISTENING_ID = QUESTION_BANK.find((q) => q.kind === 'listening')!.id

/** Ghi sai `ids` theo thứ tự, mỗi câu sau câu trước 1 phút (thẻ đến hạn ngay lúc ghi → câu đầu hạn sớm nhất). */
function wrongAll(ids: readonly string[], s: Store = empty(), start = T0): Store {
  ids.forEach((id, i) => {
    s = recordMistake(s, getQuestion(id)!, 'x', new Date(start.getTime() + i * MIN))
  })
  return s
}

describe('sessionMistakeIds — Sổ lỗi trong bước Ôn (story 41)', () => {
  it('hằng số: 5 câu, ngày tồn ôn 3', () => {
    expect(SESSION_MISTAKES_MAX).toBe(5)
    expect(SESSION_MISTAKES_HEAVY).toBe(3)
  })

  it('0 câu đến hạn → []; 2 câu → cả 2', () => {
    expect(sessionMistakeIds({}, NOW, normal)).toEqual([])
    const s = wrongAll(CHOICE_IDS.slice(0, 2))
    expect(sessionMistakeIds(readMistakes(s), NOW, normal)).toEqual(CHOICE_IDS.slice(0, 2))
  })

  it('8 câu đến hạn → 5 câu hạn sớm nhất, đúng thứ tự; ngày tồn ôn → 3', () => {
    const ids = CHOICE_IDS.slice(0, 8)
    // Ghi ngược thứ tự: câu cuối danh sách hạn sớm nhất.
    const items = readMistakes(wrongAll([...ids].reverse()))
    const expected = [...ids].reverse()
    expect(sessionMistakeIds(items, NOW, normal)).toEqual(expected.slice(0, 5))
    expect(sessionMistakeIds(items, NOW, { canSpeak: true, heavyReview: true })).toEqual(expected.slice(0, 3))
  })

  it('câu chưa đến hạn không lấy', () => {
    const s = wrongAll(CHOICE_IDS.slice(0, 3))
    // Lúc T0 + 1 phút chỉ 2 câu đầu đã đến hạn.
    expect(sessionMistakeIds(readMistakes(s), new Date(T0.getTime() + MIN), normal)).toEqual(CHOICE_IDS.slice(0, 2))
    expect(sessionMistakeIds(readMistakes(s), new Date(T0.getTime() - MIN), normal)).toEqual([])
  })

  it('không TTS: câu nghe bị bỏ, không tính vào 5; có TTS thì giữ', () => {
    const ids = [LISTENING_ID, ...CHOICE_IDS.slice(0, 5)]
    const items = readMistakes(wrongAll(ids))
    expect(sessionMistakeIds(items, NOW, { canSpeak: false, heavyReview: false })).toEqual(CHOICE_IDS.slice(0, 5))
    expect(sessionMistakeIds(items, NOW, normal)).toEqual(ids.slice(0, 5))
  })

  it('mục từ đọc O.W.L. (không có trong ngân hàng) vẫn lấy; câu không còn tra được thì bỏ', () => {
    let s = recordMistake(
      empty(),
      { id: 'owl-word-cat', tag: 'phát âm', lessonId: 's1-t4-w4', sectionId: 'pronunciation', word: { text: 'cat', ipa: 'kæt' } },
      'x',
      T0,
    )
    s = recordMistake(s, { id: 'ghost', tag: 'thì', lessonId: 's1-t1-w1', sectionId: 'grammar' }, 'x', new Date(T0.getTime() + MIN))
    s = wrongAll(CHOICE_IDS.slice(0, 1), s, new Date(T0.getTime() + 2 * MIN))
    expect(sessionMistakeIds(readMistakes(s), NOW, normal)).toEqual(['owl-word-cat', CHOICE_IDS[0]])
  })
})
