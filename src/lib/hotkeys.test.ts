import { describe, expect, it } from 'vitest'

import {
  choiceBindings,
  choiceForKey,
  flashcardBindings,
  flashcardKeyAction,
  flashcardKeyState,
  GRADE_KEYS,
  hotkeyName,
  shouldHandleKey,
  stepForKey,
  type FlashcardKeyState,
  type HotkeyName,
  type KeyEnv,
  type KeyLike,
  type KeyTarget,
} from './hotkeys'

const BODY: KeyTarget = { tagName: 'BODY', isContentEditable: false, role: null, hasHref: false, disabled: false }

function key(k: string, extra: Partial<KeyLike> = {}): KeyLike {
  return {
    key: k,
    keyCode: 0,
    isComposing: false,
    repeat: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    defaultPrevented: false,
    target: BODY,
    ...extra,
  }
}

const ENV: KeyEnv = { dialogOpen: false, selectedText: '' }
const el = (tagName: string, extra: Partial<KeyTarget> = {}): KeyTarget => ({ ...BODY, tagName, ...extra })

describe('shouldHandleKey', () => {
  it('phím thường: Space trên body, không dialog, không bôi đen → true', () => {
    expect(shouldHandleKey(key(' '), ENV)).toBe(true)
    expect(shouldHandleKey(key('Enter', { target: null }), ENV)).toBe(true)
  })

  it('IME: isComposing hoặc keyCode 229 (Telex "chào") → false', () => {
    expect(shouldHandleKey(key('a', { isComposing: true }), ENV)).toBe(false)
    expect(shouldHandleKey(key('Process', { keyCode: 229 }), ENV)).toBe(false)
    expect(shouldHandleKey(key('1', { keyCode: 229 }), ENV)).toBe(false)
  })

  it('ô nhập: input / textarea / select / contenteditable, mọi phím → false', () => {
    for (const target of [el('INPUT'), el('TEXTAREA'), el('SELECT'), el('DIV', { isContentEditable: true }), el('input')])
      for (const k of [' ', 'Enter', '1', 'k', 'l', 'ArrowRight'])
        expect(shouldHandleKey(key(k, { target }), ENV), `${target.tagName} ${k}`).toBe(false)
  })

  it('dialog đang mở (Sheet ghi chú) → false', () => {
    expect(shouldHandleKey(key(' '), { ...ENV, dialogOpen: true })).toBe(false)
    expect(shouldHandleKey(key('1'), { ...ENV, dialogOpen: true })).toBe(false)
  })

  it('bôi đen "hello" → false; selection chỉ có khoảng trắng → không tính', () => {
    expect(shouldHandleKey(key(' '), { ...ENV, selectedText: 'hello' })).toBe(false)
    expect(shouldHandleKey(key(' '), { ...ENV, selectedText: ' \n\t ' })).toBe(true)
  })

  it('phím bổ trợ / giữ phím: Cmd+1, Ctrl+K, Shift+Space, Alt+→, repeat → false', () => {
    expect(shouldHandleKey(key('1', { metaKey: true }), ENV)).toBe(false)
    expect(shouldHandleKey(key('k', { ctrlKey: true }), ENV)).toBe(false)
    expect(shouldHandleKey(key(' ', { shiftKey: true }), ENV)).toBe(false)
    expect(shouldHandleKey(key('ArrowRight', { altKey: true }), ENV)).toBe(false)
    expect(shouldHandleKey(key('Enter', { repeat: true }), ENV)).toBe(false)
  })

  it('Space/Enter trên nút / link / summary / role tương tác → false (trình duyệt bấm); số, mũi tên → true', () => {
    const targets = [
      el('BUTTON'),
      el('A', { hasHref: true }),
      el('SUMMARY'),
      el('DIV', { role: 'button' }),
      el('SPAN', { role: 'link' }),
      el('DIV', { role: 'checkbox' }),
      el('DIV', { role: 'radio' }),
      el('DIV', { role: 'switch' }),
      el('DIV', { role: 'tab' }),
      el('LI', { role: 'menuitem' }),
      el('LI', { role: 'option' }),
    ]
    for (const target of targets) {
      expect(shouldHandleKey(key(' ', { target }), ENV), `${target.tagName}/${target.role} Space`).toBe(false)
      expect(shouldHandleKey(key('Enter', { target }), ENV), `${target.tagName}/${target.role} Enter`).toBe(false)
      for (const k of ['1', '4', 'ArrowLeft', 'ArrowRight'])
        expect(shouldHandleKey(key(k, { target }), ENV), `${target.tagName}/${target.role} ${k}`).toBe(true)
    }
  })

  it('nút disabled, a không href, div thường → Space/Enter vẫn true', () => {
    expect(shouldHandleKey(key(' ', { target: el('BUTTON', { disabled: true }) }), ENV)).toBe(true)
    expect(shouldHandleKey(key('Enter', { target: el('BUTTON', { disabled: true }) }), ENV)).toBe(true)
    expect(shouldHandleKey(key('Enter', { target: el('A') }), ENV)).toBe(true)
    expect(shouldHandleKey(key(' ', { target: el('DIV') }), ENV)).toBe(true)
  })

  it('đã chặn (defaultPrevented, vd Space trên từ của ReadableText) → false', () => {
    expect(shouldHandleKey(key(' ', { defaultPrevented: true }), ENV)).toBe(false)
  })
})

describe('hotkeyName', () => {
  it.each([
    [' ', 'Space'],
    ['Enter', 'Enter'],
    ['ArrowRight', 'ArrowRight'],
    ['ArrowLeft', 'ArrowLeft'],
    ['3', '3'],
    ['K', 'k'],
    ['l', 'l'],
    ['5', null],
    ['a', null],
    ['Escape', null],
  ])('%j → %j', (k, name) => {
    expect(hotkeyName(k)).toBe(name)
  })
})

describe('flashcardKeyAction', () => {
  const front: FlashcardKeyState = { flipped: false, intro: false, knownVisible: true, listenText: 'people' }
  const act = (name: HotkeyName, card: FlashcardKeyState) => flashcardKeyAction(name, card)

  it('thẻ mặt trước: Space lật; 1–4 không làm gì; K đã biết; L nghe "people"', () => {
    expect(act('Space', front)).toEqual({ type: 'flip' })
    for (const n of ['1', '2', '3', '4'] as const) expect(act(n, front)).toBeNull()
    expect(act('k', front)).toEqual({ type: 'known' })
    expect(act('l', front)).toEqual({ type: 'listen', text: 'people' })
  })

  it('thẻ đã lật: 1/2/3/4 → again/hard/good/easy; Space → null (trang cuộn)', () => {
    const back = { ...front, flipped: true }
    expect(act('1', back)).toEqual({ type: 'grade', grade: 'again' })
    expect(act('2', back)).toEqual({ type: 'grade', grade: 'hard' })
    expect(act('3', back)).toEqual({ type: 'grade', grade: 'good' })
    expect(act('4', back)).toEqual({ type: 'grade', grade: 'easy' })
    expect(act('Space', back)).toBeNull()
  })

  it('thẻ "Làm quen" (lật sẵn): 1–4 → null; Space → null; Enter → "Đã xem" (Nhớ); K → đã biết', () => {
    const intro = { ...front, flipped: true, intro: true }
    for (const n of ['1', '2', '3', '4'] as const) expect(act(n, intro)).toBeNull()
    expect(act('Space', intro)).toBeNull()
    expect(act('Enter', intro)).toEqual({ type: 'grade', grade: 'good' })
    expect(act('k', intro)).toEqual({ type: 'known' })
  })

  it('hư từ mặt trước (listenText null) → L null; thẻ quy tắc → K, L null', () => {
    expect(act('l', { ...front, listenText: null })).toBeNull()
    const rule = { ...front, knownVisible: false, listenText: null }
    expect(act('k', rule)).toBeNull()
    expect(act('l', rule)).toBeNull()
  })

  it('phím khác (Enter trên thẻ thường, mũi tên) → null', () => {
    for (const name of ['Enter', 'ArrowLeft', 'ArrowRight'] as const) expect(act(name, { ...front, flipped: true })).toBeNull()
    expect(act('Enter', front)).toBeNull()
  })
})

describe('flashcardKeyState', () => {
  const word = { variant: 'word', flipped: false, intro: false, isNew: true, word: 'people', cloze: false, canSpeak: true } as const

  it('thẻ từ: "Đã biết" khi là từ mới; L nghe từ cả hai mặt', () => {
    expect(flashcardKeyState(word)).toEqual({ flipped: false, intro: false, knownVisible: true, listenText: 'people' })
    expect(flashcardKeyState({ ...word, isNew: false, flipped: true })).toMatchObject({ knownVisible: false, listenText: 'people' })
    expect(flashcardKeyState({ ...word, intro: true, flipped: true })).toMatchObject({ intro: true })
  })

  it('hư từ: mặt trước không có L (không lộ đáp án), lật rồi mới có', () => {
    expect(flashcardKeyState({ ...word, cloze: true }).listenText).toBeNull()
    expect(flashcardKeyState({ ...word, cloze: true, flipped: true }).listenText).toBe('people')
  })

  it('không đọc TTS được → không có L', () => {
    expect(flashcardKeyState({ ...word, canSpeak: false }).listenText).toBeNull()
  })

  it('thẻ riêng: "Đã biết cụm này" chỉ sau khi lật và là thẻ mới; L luôn có; không phải "Làm quen"', () => {
    const custom = { variant: 'custom', flipped: false, isNew: true, word: 'look up', canSpeak: true } as const
    expect(flashcardKeyState(custom)).toEqual({ flipped: false, intro: false, knownVisible: false, listenText: 'look up' })
    expect(flashcardKeyState({ ...custom, flipped: true }).knownVisible).toBe(true)
    expect(flashcardKeyState({ ...custom, flipped: true, isNew: false }).knownVisible).toBe(false)
  })

  it('thẻ quy tắc: không K, không L', () => {
    expect(flashcardKeyState({ variant: 'rule', flipped: true })).toEqual({
      flipped: true,
      intro: false,
      knownVisible: false,
      listenText: null,
    })
  })
})

describe('flashcardBindings', () => {
  const calls: string[] = []
  const on = {
    flip: () => calls.push('flip'),
    grade: (g: string) => calls.push(`grade:${g}`),
    known: () => calls.push('known'),
    listen: (t: string) => calls.push(`listen:${t}`),
  }
  const run = (bindings: ReturnType<typeof flashcardBindings>, ...names: HotkeyName[]) => {
    calls.length = 0
    for (const n of names) bindings[n]?.()
    return [...calls]
  }
  const front: FlashcardKeyState = { flipped: false, intro: false, knownVisible: true, listenText: 'people' }

  it('mặt trước: Space → lật, K → đã biết, L → nghe; 1–4 và Enter không gắn (không chặn phím)', () => {
    const b = flashcardBindings(front, on)
    expect(Object.keys(b).sort()).toEqual(['Space', 'k', 'l'])
    expect(run(b, 'Space', 'k', 'l')).toEqual(['flip', 'known', 'listen:people'])
  })

  it('đã lật: 1–4 gọi onGrade đúng thứ tự Quên/Khó/Nhớ/Dễ; Space không gắn', () => {
    const b = flashcardBindings({ ...front, flipped: true }, on)
    expect(b.Space).toBeUndefined()
    expect(run(b, '1', '2', '3', '4')).toEqual(GRADE_KEYS.map((g) => `grade:${g}`))
    expect(GRADE_KEYS).toEqual(['again', 'hard', 'good', 'easy'])
  })

  it('"Làm quen": Enter → onGrade("good") như nút "Đã xem"; 1–4 không gắn', () => {
    const b = flashcardBindings({ ...front, flipped: true, intro: true }, on)
    expect(b['1']).toBeUndefined()
    expect(run(b, 'Enter')).toEqual(['grade:good'])
  })
})

describe('choiceBindings', () => {
  const calls: string[] = []
  const state = { count: 3, choose: (at: number) => calls.push(`choose:${at}`), next: () => calls.push('next') }

  it('đang chọn: 1–3 chọn lựa chọn thứ n (n ≤ số lựa chọn), không có 4 và Enter', () => {
    calls.length = 0
    const b = choiceBindings({ ...state, choosing: true })
    expect(Object.keys(b).sort()).toEqual(['1', '2', '3'])
    b['2']?.()
    expect(calls).toEqual(['choose:1'])
  })

  it('đã chọn: chỉ Enter → next; không có next thì không gắn gì', () => {
    calls.length = 0
    const b = choiceBindings({ ...state, choosing: false })
    expect(Object.keys(b)).toEqual(['Enter'])
    b.Enter?.()
    expect(calls).toEqual(['next'])
    expect(choiceBindings({ ...state, choosing: false, next: undefined })).toEqual({})
  })
})

describe('choiceForKey', () => {
  it("('3', 4) → 2; ('4', 3) → null; ('1', 0) → null", () => {
    expect(choiceForKey('3', 4)).toBe(2)
    expect(choiceForKey('4', 3)).toBeNull()
    expect(choiceForKey('1', 0)).toBeNull()
  })

  it('phím không phải số → null', () => {
    expect(choiceForKey('Enter', 4)).toBeNull()
    expect(choiceForKey('k', 4)).toBeNull()
  })
})

describe('stepForKey', () => {
  it("('ArrowRight', 0, 3) → 1; ('ArrowRight', 2, 3) → null; ('ArrowLeft', 0, 3) → null; ('ArrowLeft', 2, 3) → 1", () => {
    expect(stepForKey('ArrowRight', 0, 3)).toBe(1)
    expect(stepForKey('ArrowRight', 2, 3)).toBeNull()
    expect(stepForKey('ArrowLeft', 0, 3)).toBeNull()
    expect(stepForKey('ArrowLeft', 2, 3)).toBe(1)
  })

  it('phím khác → null', () => {
    expect(stepForKey('Enter', 0, 3)).toBeNull()
  })
})
