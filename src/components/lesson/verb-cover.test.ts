import { describe, expect, it } from 'vitest'

import { IRREGULAR_VERBS } from '@/data/lessons'

import {
  cellKey,
  initialCover,
  isCellHidden,
  listenLabel,
  NO_COVER,
  revealCell,
  speakText,
  toggleCover,
  type VerbCover,
} from './verb-cover'

const verb = (v1: string) => IRREGULAR_VERBS.find((v) => v.v1 === v1)!
const GO = verb('go')
const BE = verb('be')
const none: ReadonlySet<string> = new Set()

describe('che cột bảng động từ (story 38)', () => {
  it('isCellHidden: chỉ cột đang bật che, trừ ô đã bấm "Xem"', () => {
    const coverV3: VerbCover = { v2: false, v3: true }
    expect(isCellHidden(NO_COVER, none, 'go', 'v2')).toBe(false)
    expect(isCellHidden(NO_COVER, none, 'go', 'v3')).toBe(false)
    expect(isCellHidden(coverV3, none, 'go', 'v2')).toBe(false)
    expect(isCellHidden(coverV3, none, 'go', 'v3')).toBe(true)
    const revealed = new Set([cellKey('go', 'v3')])
    expect(isCellHidden(coverV3, revealed, 'go', 'v3')).toBe(false)
    // Hiện ô của go không hiện ô của dòng khác hay cột khác.
    expect(isCellHidden(coverV3, revealed, 'see', 'v3')).toBe(true)
    expect(isCellHidden({ v2: true, v3: true }, revealed, 'go', 'v2')).toBe(true)
    expect(cellKey('go', 'v3')).not.toBe(cellKey('go', 'v2'))
  })

  it('speakText không che gì: y như bảng cũ', () => {
    expect(speakText(BE)).toBe('be, was, were, been')
    expect(speakText(GO, NO_COVER, none)).toBe('go, went, gone')
    for (const v of IRREGULAR_VERBS) {
      expect(speakText(v), v.v1).toBe([v.v1, v.v2, v.v3].map((x) => x.replace(/\s*\/\s*/g, ', ')).join(', '))
    }
  })

  it('che V3 → "go, went"; hiện lại ô V3 → "go, went, gone"', () => {
    const coverV3: VerbCover = { v2: false, v3: true }
    expect(speakText(GO, coverV3, none)).toBe('go, went')
    expect(speakText(GO, coverV3, new Set([cellKey('go', 'v3')]))).toBe('go, went, gone')
    expect(listenLabel(GO, coverV3, none)).toBe('Nghe go, went')
  })

  it('che hai cột → chỉ V1; be che V2 thành một ô', () => {
    const both: VerbCover = { v2: true, v3: true }
    expect(speakText(GO, both, none)).toBe('go')
    expect(speakText(BE, both, none)).toBe('be')
    expect(listenLabel(BE, both, none)).toBe('Nghe be')
    expect(speakText(BE, both, new Set([cellKey('be', 'v2')]))).toBe('be, was, were')
    expect(listenLabel(GO)).toBe('Nghe go, went, gone')
  })

  it('initialCover: review-v3 bật sẵn "Che V3", learn không che gì; chưa ô nào được "Xem"', () => {
    expect(initialCover('review-v3').cover).toEqual({ v2: false, v3: true })
    expect(initialCover('learn').cover).toEqual(NO_COVER)
    expect(initialCover('review-v3').revealed.size).toBe(0)
    expect(isCellHidden(initialCover('review-v3').cover, none, 'go', 'v3')).toBe(true)
    expect(isCellHidden(initialCover('learn').cover, none, 'go', 'v3')).toBe(false)
  })

  it('tắt "Che V3" rồi bật lại thì che lại hết; bật thêm "Che V2" không che lại ô V3 đã "Xem"', () => {
    let s = toggleCover(initialCover('learn'), 'v3')
    s = revealCell(revealCell(s, 'go', 'v3'), 'see', 'v3')
    expect(isCellHidden(s.cover, s.revealed, 'go', 'v3')).toBe(false)
    expect(isCellHidden(s.cover, s.revealed, 'know', 'v3')).toBe(true)

    const both = toggleCover(s, 'v2')
    expect(both.cover).toEqual({ v2: true, v3: true })
    expect(isCellHidden(both.cover, both.revealed, 'go', 'v3')).toBe(false)
    expect(isCellHidden(both.cover, both.revealed, 'go', 'v2')).toBe(true)

    const off = toggleCover(both, 'v3')
    expect(isCellHidden(off.cover, off.revealed, 'go', 'v3')).toBe(false)
    const on = toggleCover(off, 'v3')
    expect(isCellHidden(on.cover, on.revealed, 'go', 'v3')).toBe(true)
    expect(isCellHidden(on.cover, on.revealed, 'see', 'v3')).toBe(true)
  })
})
