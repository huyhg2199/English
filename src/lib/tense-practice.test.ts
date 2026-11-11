import { describe, expect, it } from 'vitest'

import type { CheckItem } from '@/data/foundation'
import type { TensePractice } from '@/data/lessons'

import { hasPractice, practiceEnglishTexts, practiceItemIds, practiceProblems, practiceScreens } from './tense-practice'

const choice = (id: string): CheckItem => ({
  id,
  kind: 'choice',
  prompt: 'I ___ watching TV.',
  options: ['am', 'is', 'are'],
  answer: 0,
  hintVi: 'Gợi ý',
  explanationVi: 'Giải thích',
})

const typed = (id: string, over: Partial<Extract<CheckItem, { kind: 'type' }>> = {}): CheckItem => ({
  id,
  kind: 'type',
  prompt: 'I ___ (read) a book now.',
  answer: 'am reading',
  hintVi: 'Gợi ý',
  explanationVi: 'Giải thích',
  ...over,
})

const good = (): TensePractice => ({
  worked: { en: 'She is cooking.', vi: 'Cô ấy đang nấu.' },
  faded: { en: 'They ___ (play) now.', answer: 'are playing', vi: 'Họ đang chơi.' },
  check: {
    items: [1, 2, 3, 4, 5].map((n) => (n === 2 ? choice(`pc-c${n}`) : typed(`pc-c${n}`))),
    easier: [choice('pc-e1'), choice('pc-e2')],
  },
  apply: {
    promptVi: 'Nói 3 câu.',
    sampleEn: 'I am learning.',
    speak: [{ id: 'pc-say-1', text: 'I am learning English now.', vi: 'Tôi đang học.' }],
  },
})

const problems = (practice: TensePractice) => practiceProblems({ id: 'pc', practice })

describe('practiceScreens', () => {
  it('trả 4 màn theo thứ tự worked → faded → check → apply, giữ nguyên dữ liệu', () => {
    const p = good()
    const screens = practiceScreens(p)
    expect(screens.map((s) => s.kind)).toEqual(['worked', 'faded', 'check', 'apply'])
    expect(screens[0]).toEqual({ kind: 'worked', ...p.worked })
    expect(screens[1]).toEqual({ kind: 'faded', ...p.faded })
    expect(screens[2]).toEqual({ kind: 'check', ...p.check })
    expect(screens[3]).toEqual({ kind: 'apply', ...p.apply })
  })
})

describe('practiceProblems', () => {
  it('dữ liệu đúng luật → rỗng; thì không có practice → rỗng', () => {
    expect(problems(good())).toEqual([])
    expect(practiceProblems({ id: 'x' })).toEqual([])
  })

  it('faded không có ___ hoặc có hai ___ → lỗi; answer rỗng → lỗi', () => {
    expect(problems({ ...good(), faded: { ...good().faded, en: 'They are playing now.' } }).join()).toMatch(/đúng một ___/)
    expect(problems({ ...good(), faded: { ...good().faded, en: '___ ___ now.' } }).join()).toMatch(/đúng một ___/)
    expect(problems({ ...good(), faded: { ...good().faded, answer: ' ' } }).join()).toMatch(/faded.answer rỗng/)
  })

  it('4 câu luyện, 8 câu luyện, 1 câu dễ hơn → lỗi', () => {
    const p = good()
    expect(problems({ ...p, check: { ...p.check, items: p.check.items.slice(0, 4) } }).join()).toMatch(/5–7 câu/)
    const eight = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => typed(`pc-c${n}`))
    expect(problems({ ...p, check: { ...p.check, items: eight } }).join()).toMatch(/5–7 câu/)
    expect(problems({ ...p, check: { ...p.check, easier: [choice('pc-e1')] } }).join()).toMatch(/đúng 2 câu/)
  })

  it('trùng id, id sai dạng, id câu nói sai dạng → lỗi', () => {
    const p = good()
    const dup = [...p.check.items.slice(0, 4), typed('pc-c1')]
    expect(problems({ ...p, check: { ...p.check, items: dup } }).join()).toMatch(/id câu trùng "pc-c1"/)
    expect(problems({ ...p, check: { ...p.check, easier: [choice('pc-e1'), choice('pc-c9')] } }).join()).toMatch(
      /phải dạng pc-e<n>/,
    )
    expect(
      problems({ ...p, apply: { ...p.apply, speak: [{ id: 'pc-1', text: 'Hi.', vi: 'Chào.' }] } }).join(),
    ).toMatch(/pc-say-<n>/)
  })

  it('accept trùng answer (sau chuẩn hoá) → lỗi; câu type thiếu prompt / answer → lỗi', () => {
    const p = good()
    const withAccept = (item: CheckItem) => ({ ...p, check: { ...p.check, items: [item, ...p.check.items.slice(1)] } })
    expect(problems(withAccept(typed('pc-c1', { accept: ['Am reading.'] }))).join()).toMatch(/accept "Am reading\." trùng/)
    expect(problems(withAccept(typed('pc-c1', { accept: ["'m reading"] })))).toEqual([])
    expect(problems(withAccept(typed('pc-c1', { answer: '' }))).join()).toMatch(/answer rỗng/)
    expect(problems(withAccept(typed('pc-c1', { prompt: '' }))).join()).toMatch(/thiếu prompt/)
    expect(
      problems({ ...p, faded: { ...p.faded, accept: ['ARE PLAYING'] } }).join(),
    ).toMatch(/faded.accept/)
  })

  it('câu choice có lựa chọn trùng → lỗi; thiếu hintVi / explanationVi → lỗi', () => {
    const p = good()
    const bad: CheckItem = { ...choice('pc-c2'), options: ['am', 'am', 'is'] } as CheckItem
    const items = [p.check.items[0], bad, ...p.check.items.slice(2)]
    expect(problems({ ...p, check: { ...p.check, items } }).join()).toMatch(/3 lựa chọn khác nhau/)
    const noHint = [typed('pc-c1', { hintVi: '', explanationVi: ' ' }), ...p.check.items.slice(1)]
    const out = problems({ ...p, check: { ...p.check, items: noHint } }).join()
    expect(out).toMatch(/thiếu hintVi/)
    expect(out).toMatch(/thiếu explanationVi/)
  })
})

describe('practiceItemIds / practiceEnglishTexts / hasPractice', () => {
  it('liệt kê id câu và chữ tiếng Anh', () => {
    const p = good()
    expect(practiceItemIds(p)).toEqual(['pc-c1', 'pc-c2', 'pc-c3', 'pc-c4', 'pc-c5', 'pc-e1', 'pc-e2'])
    const texts = practiceEnglishTexts(p)
    expect(texts).toContain('She is cooking.')
    expect(texts).toContain('am reading')
    expect(texts).toContain('I am learning English now.')
    expect(hasPractice({ practice: p } as never)).toBe(true)
    expect(hasPractice({} as never)).toBe(false)
  })
})
