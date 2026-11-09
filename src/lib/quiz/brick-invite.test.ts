import { describe, expect, it } from 'vitest'

import type { BrickId } from '@/data/foundation'
import { getQuestion, type Question } from '@/data/questions'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  BRICK_INVITE_MIN_QUESTIONS,
  BRICK_INVITE_WINDOW_DAYS,
  brickReviewInvite,
  dismissBrickInvite,
  isBrickInviteDismissal,
  readBrickInvites,
} from './brick-invite'
import { recordMistake } from './mistakes'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-11-20T12:00:00.000Z')
const ago = (days: number, extraMs = 0) => new Date(NOW.getTime() - days * DAY + extraMs)
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })

function wrong(s: Store, id: string, at: Date): Store {
  const q = getQuestion(id)
  const source = q ?? { id, tag: 'thì' as const, lessonId: 's1-t1-w1', sectionId: 'grammar' as const }
  return recordMistake(s, source, 'x', at)
}

const always = () => true
const deps = (over: { lastDoneAt?: Partial<Record<BrickId, string>>; hasContent?: (id: BrickId) => boolean } = {}) => ({
  lastDoneAt: (id: BrickId) => over.lastDoneAt?.[id] ?? null,
  hasContent: over.hasContent ?? always,
})

/** Matrix "Mời ôn": q-s1-t1-w1-03 và q-s1-t1-w4-04 đều cần `subject-pronouns` (F09). */
function f09Store(): Store {
  let s = wrong(empty(), 'q-s1-t1-w1-03', ago(3))
  s = wrong(s, 'q-s1-t1-w4-04', ago(1))
  return s
}

describe('brickReviewInvite — I/O Matrix (story 28)', () => {
  it('hằng số: 14 ngày, 2 câu', () => {
    expect(BRICK_INVITE_WINDOW_DAYS).toBe(14)
    expect(BRICK_INVITE_MIN_QUESTIONS).toBe(2)
  })

  it('dữ liệu câu: w1-03 và w4-04 cùng cần subject-pronouns; w1-01 / w1-04 cần F09 và F13', () => {
    expect(getQuestion('q-s1-t1-w1-03')!.requires).toContain('subject-pronouns')
    expect(getQuestion('q-s1-t1-w4-04')!.requires).toContain('subject-pronouns')
    expect(getQuestion('q-s1-t1-w1-01')!.requires).toEqual(expect.arrayContaining(['be-affirmative', 'subject-pronouns']))
    expect(getQuestion('q-s1-t1-w1-04')!.requires).toEqual(expect.arrayContaining(['be-affirmative', 'subject-pronouns']))
  })

  it('Mời ôn: 2 câu cần F09 trong 14 ngày → mời F09, câu sai mới nhất trước', () => {
    expect(brickReviewInvite(f09Store(), NOW, deps())).toEqual({
      brickId: 'F09',
      questionIds: ['q-s1-t1-w4-04', 'q-s1-t1-w1-03'],
    })
  })

  it('Chưa đủ: chỉ 1 câu, hoặc câu thứ 2 sai cách đây 15 ngày → không mời; đúng 14 ngày vẫn tính', () => {
    expect(brickReviewInvite(wrong(empty(), 'q-s1-t1-w1-03', ago(1)), NOW, deps())).toBeNull()
    const old = wrong(wrong(empty(), 'q-s1-t1-w1-03', ago(15)), 'q-s1-t1-w4-04', ago(1))
    expect(brickReviewInvite(old, NOW, deps())).toBeNull()
    const edge = wrong(wrong(empty(), 'q-s1-t1-w1-03', ago(14)), 'q-s1-t1-w4-04', ago(1))
    expect(brickReviewInvite(edge, NOW, deps())?.brickId).toBe('F09')
    const justOut = wrong(wrong(empty(), 'q-s1-t1-w1-03', ago(14, -1)), 'q-s1-t1-w4-04', ago(1))
    expect(brickReviewInvite(justOut, NOW, deps())).toBeNull()
    // Cùng một câu sai nhiều lần vẫn chỉ là 1 câu.
    const same = wrong(wrong(empty(), 'q-s1-t1-w1-03', ago(3)), 'q-s1-t1-w1-03', ago(1))
    expect(brickReviewInvite(same, NOW, deps())).toBeNull()
  })

  it('Không có viên dạy: 2 câu chỉ trùng khái niệm bài T1 (monophthongs) → không mời', () => {
    // w1-05: ipa, long-vowel-mark, long-short-i, monophthongs; w1-06: be-questions, subject-pronouns, ipa, long-vowel-mark,
    // monophthongs → trùng F03 (ipa) nên dùng câu giả chỉ cần monophthongs.
    const fake: Record<string, Question> = {
      'q-a': { ...getQuestion('q-s1-t1-w1-05')!, id: 'q-a', requires: ['monophthongs'] },
      'q-b': { ...getQuestion('q-s1-t1-w1-05')!, id: 'q-b', requires: ['monophthongs'] },
    }
    const s = wrong(wrong(empty(), 'q-a', ago(2)), 'q-b', ago(1))
    expect(brickReviewInvite(s, NOW, { ...deps(), lookup: (id) => fake[id] })).toBeNull()
  })

  it('Không có viên dạy: câu T2–T4 không có requires, câu ngoài ngân hàng, mục từ O.W.L. → không tính', () => {
    const t2 = ['q-s1-t2-w1-01', 'q-s1-t2-w1-02', 'q-s1-t2-w2-01']
    for (const id of t2) {
      expect(getQuestion(id), id).toBeDefined()
      expect(getQuestion(id)!.requires, id).toBeUndefined()
    }
    let s = empty()
    for (const id of t2) s = wrong(s, id, ago(1))
    expect(brickReviewInvite(s, NOW, deps())).toBeNull()
    // 1 câu thật cần F09 + câu ngoài ngân hàng + mục từ O.W.L. → vẫn chỉ 1 câu.
    s = wrong(empty(), 'q-s1-t1-w1-03', ago(1))
    s = wrong(s, 'q-da-bi-xoa', ago(1))
    s = recordMistake(s, { id: 'owl-word-think', tag: 'phát âm', lessonId: 's1-t4-w4', sectionId: 'checkpoint' as const, word: { text: 'think', ipa: 'θɪŋk' } }, 'x', ago(1))
    expect(brickReviewInvite(s, NOW, { ...deps(), lookup: (id) => (id === 'owl-word-think' ? getQuestion('q-s1-t1-w4-04') : getQuestion(id)) })).toBeNull()
  })

  it('Hoà: sai w1-01 + w1-04 cùng lúc → F09 = 2, F13 = 2, mời F13 (viên đứng sau)', () => {
    const s = wrong(wrong(empty(), 'q-s1-t1-w1-01', ago(1)), 'q-s1-t1-w1-04', ago(1))
    expect(brickReviewInvite(s, NOW, deps())?.brickId).toBe('F13')
  })

  it('Để sau ở F13 (Hoà) → dải ẩn hẳn, không đổi sang mời F09 cho cùng 2 câu; sai câu mới cần F09 → mời F09', () => {
    const s = wrong(wrong(empty(), 'q-s1-t1-w1-01', ago(1)), 'q-s1-t1-w1-04', ago(1))
    const d = dismissBrickInvite(s, 'F13', NOW)
    expect(Object.keys(readBrickInvites(d))).toEqual(expect.arrayContaining(['F09', 'F13']))
    expect(brickReviewInvite(d, NOW, deps())).toBeNull()
    const later = new Date(NOW.getTime() + 60_000)
    expect(brickReviewInvite(wrong(d, 'q-s1-t1-w1-03', later), later, deps())).toMatchObject({ brickId: 'F09' })
  })

  it('Thứ tự chọn: nhiều câu hơn thắng; bằng số câu thì câu sai mới nhất muộn hơn thắng', () => {
    // F09: w1-03, w4-04, w1-01 (3 câu); F13: w1-01 (1 câu) → F09.
    let s = f09Store()
    s = wrong(s, 'q-s1-t1-w1-01', ago(0.5))
    expect(brickReviewInvite(s, NOW, deps())).toMatchObject({ brickId: 'F09' })
    // Bằng số câu: F09 = 2 (w1-03, w4-04), F14 = 2 (w1-03 + câu giả cần be-negative) → câu sai mới nhất muộn hơn thắng.
    const fake: Record<string, Question> = {
      'q-x': { ...getQuestion('q-s1-t1-w1-03')!, id: 'q-x', requires: ['be-negative'] },
    }
    const lookup = (id: string) => fake[id] ?? getQuestion(id)
    // F14: w1-03 (ago 3) + q-x (ago 0.2) → latest muộn hơn F09 (ago 1).
    const t = wrong(f09Store(), 'q-x', ago(0.2))
    expect(brickReviewInvite(t, NOW, { ...deps(), lookup })?.brickId).toBe('F14')
  })

  it('viên "Đang soạn" (không có nội dung) không mời; viên khác đủ điều kiện vẫn mời', () => {
    const s = wrong(wrong(empty(), 'q-s1-t1-w1-01', ago(1)), 'q-s1-t1-w1-04', ago(1))
    expect(brickReviewInvite(s, NOW, deps({ hasContent: (id) => id !== 'F13' }))?.brickId).toBe('F09')
    expect(brickReviewInvite(s, NOW, deps({ hasContent: () => false }))).toBeNull()
  })

  it('Để sau: bấm ở F09 → ẩn; sai thêm 1 câu cần F09 (vẫn ≥ 2 câu trong 14 ngày) → hiện lại', () => {
    const s = dismissBrickInvite(f09Store(), 'F09', NOW)
    expect(brickReviewInvite(s, NOW, deps())).toBeNull()
    const later = new Date(NOW.getTime() + 60_000)
    const again = wrong(s, 'q-s1-t1-w1-01', later)
    expect(brickReviewInvite(again, later, deps())).toMatchObject({ brickId: 'F09' })
    // Sai lại chính câu cũ cũng là câu sai mới.
    const sameAgain = wrong(s, 'q-s1-t1-w1-03', later)
    expect(brickReviewInvite(sameAgain, later, deps())).toMatchObject({ brickId: 'F09' })
  })

  it('Ôn xong: lastDoneAt của F09 sau câu sai mới nhất → ẩn tới khi có câu sai mới', () => {
    const s = f09Store()
    expect(brickReviewInvite(s, NOW, deps({ lastDoneAt: { F09: ago(2).toISOString() } }))).toMatchObject({ brickId: 'F09' })
    expect(brickReviewInvite(s, NOW, deps({ lastDoneAt: { F09: ago(0.5).toISOString() } }))).toBeNull()
    const later = new Date(NOW.getTime() + 60_000)
    const again = wrong(s, 'q-s1-t1-w1-01', later)
    expect(brickReviewInvite(again, later, deps({ lastDoneAt: { F09: ago(0.5).toISOString() } }))).toMatchObject({ brickId: 'F09' })
    // lastDoneAt sai dạng → coi như chưa học.
    expect(brickReviewInvite(s, NOW, deps({ lastDoneAt: { F09: 'x' } }))).toMatchObject({ brickId: 'F09' })
  })

  it('đồng hồ máy lệch: câu có lastWrongAt ở tương lai vẫn tính; "Để sau" vẫn ẩn được', () => {
    const future = new Date(NOW.getTime() + 3 * DAY)
    const s = wrong(wrong(empty(), 'q-s1-t1-w1-03', future), 'q-s1-t1-w4-04', ago(1))
    expect(brickReviewInvite(s, NOW, deps())).toMatchObject({ brickId: 'F09' })
    const d = dismissBrickInvite(s, 'F09', NOW)
    expect(readBrickInvites(d).F09).toMatchObject({ dismissedAt: future.toISOString() })
    expect(brickReviewInvite(d, NOW, deps())).toBeNull()
  })
})

describe('dismissBrickInvite', () => {
  it('ghi mistakes.brickInvites[id] = { dismissedAt, updatedAt }, giữ items; viên lạ → store cũ', () => {
    const s0 = f09Store()
    const s1 = dismissBrickInvite(s0, 'F09', NOW)
    expect(readBrickInvites(s0)).toEqual({})
    // F09 và viên có chung câu sai (w1-03 cũng cần be-negative của F14) cùng được ghi dấu.
    const entry = { dismissedAt: NOW.toISOString(), updatedAt: NOW.toISOString() }
    expect(readBrickInvites(s1)).toEqual({ F09: entry, F14: entry })
    expect((s1.data.mistakes as { items: object }).items).toBe((s0.data.mistakes as { items: object }).items)
    expect(dismissBrickInvite(s0, 'F99', NOW)).toBe(s0)
    expect(dismissBrickInvite(s0, 'f09', NOW)).toBe(s0)
  })

  it('bấm lại: dismissedAt không lùi, updatedAt luôn tăng', () => {
    const s1 = dismissBrickInvite(empty(), 'F09', NOW)
    const s2 = dismissBrickInvite(s1, 'F09', ago(1))
    expect(readBrickInvites(s2).F09).toEqual({
      dismissedAt: NOW.toISOString(),
      updatedAt: new Date(NOW.getTime() + 1).toISOString(),
    })
  })

  it('isBrickInviteDismissal', () => {
    const t = NOW.toISOString()
    expect(isBrickInviteDismissal({ dismissedAt: t, updatedAt: t })).toBe(true)
    expect(isBrickInviteDismissal({ dismissedAt: 'x', updatedAt: t })).toBe(false)
    expect(isBrickInviteDismissal({ dismissedAt: t })).toBe(false)
    expect(isBrickInviteDismissal(null)).toBe(false)
  })
})
