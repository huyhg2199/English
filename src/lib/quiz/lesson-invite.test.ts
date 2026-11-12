import { describe, expect, it } from 'vitest'

import { getQuestion, type MistakeTag } from '@/data/questions'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  dismissLessonInvite,
  LESSON_INVITE_MIN_QUESTIONS,
  LESSON_INVITE_TAG,
  LESSON_INVITE_WINDOW_DAYS,
  lessonReviewInvite,
  mergeLessonInvites,
  readLessonInvites,
} from './lesson-invite'
import { readMistakes, recordMistake, type MistakeSource } from './mistakes'
import { recordAttempt } from './quiz'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-12-20T10:00:00.000Z')
const ago = (days: number, extraMs = 0) => new Date(NOW.getTime() - days * DAY + extraMs)
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
const W2 = 's1-t2-w2'

function wrong(
  s: Store,
  id: string,
  when: Date,
  over: Partial<Pick<MistakeSource, 'tag' | 'lessonId' | 'sectionId' | 'word'>> = {},
): Store {
  const source: MistakeSource = { id, tag: 'thì' as MistakeTag, lessonId: W2, sectionId: 'grammar', ...over }
  return recordMistake(s, source, 'x', when)
}

/** Lần làm quiz bài `lesson-<id>` `score`/5 xong lúc `when` (câu giả, không vào Sổ lỗi). */
function check(s: Store, lessonId: string, score: number, when: Date): Store {
  const answers = Array.from({ length: 5 }, (_, i) => ({ questionId: `z-${i}`, chosen: 'a', correct: i < score }))
  return recordAttempt(
    s,
    { id: `c-${lessonId}-${when.getTime()}-${score}`, quizId: `lesson-${lessonId}`, seed: 's', startedAt: when, answers },
    when,
    () => undefined,
  )
}

/** Ví dụ golden của Design Notes. */
function golden(): Store {
  let s = wrong(empty(), 'q-a', new Date('2026-12-15T10:00:00.000Z'))
  s = wrong(s, 'q-b', new Date('2026-12-17T10:00:00.000Z'))
  s = wrong(s, 'q-c', new Date('2026-12-18T10:00:00.000Z'), { tag: 'phát âm' })
  return s
}

describe('lessonReviewInvite — I/O Matrix (story 41)', () => {
  it('hằng số: 14 ngày, 2 câu, nhãn thì', () => {
    expect(LESSON_INVITE_WINDOW_DAYS).toBe(14)
    expect(LESSON_INVITE_MIN_QUESTIONS).toBe(2)
    expect(LESSON_INVITE_TAG).toBe('thì')
  })

  it('golden: q-a, q-b (thì) + q-c (phát âm) → mời s1-t2-w2, câu mới nhất trước, đoạn grammar', () => {
    expect(lessonReviewInvite(golden(), NOW)).toEqual({ lessonId: W2, questionIds: ['q-b', 'q-a'], sectionId: 'grammar' })
  })

  it('golden: lần làm lesson-s1-t2-w2 4/5 xong 2026-12-18 → null; chỉ 2/5 → vẫn mời', () => {
    expect(lessonReviewInvite(check(golden(), W2, 4, new Date('2026-12-18T10:00:00.000Z')), NOW)).toBeNull()
    expect(lessonReviewInvite(check(golden(), W2, 2, new Date('2026-12-18T10:00:00.000Z')), NOW)?.lessonId).toBe(W2)
    // Đạt trước câu sai mới nhất → vẫn mời; đạt đúng lúc câu sai mới nhất (câu sai trong chính lần đạt) → không mời.
    expect(lessonReviewInvite(check(golden(), W2, 4, new Date('2026-12-16T10:00:00.000Z')), NOW)?.lessonId).toBe(W2)
    expect(lessonReviewInvite(check(golden(), W2, 4, new Date('2026-12-17T10:00:00.000Z')), NOW)).toBeNull()
    // Kiểm tra của bài khác không tính.
    expect(lessonReviewInvite(check(golden(), 's1-t2-w1', 5, new Date('2026-12-19T10:00:00.000Z')), NOW)?.lessonId).toBe(W2)
  })

  it('golden: "Để sau" lúc 2026-12-20 rồi q-d sai 2026-12-21 → hiện lại với 3 câu', () => {
    const dismissed = dismissLessonInvite(golden(), W2, NOW)
    expect(lessonReviewInvite(dismissed, NOW)).toBeNull()
    const later = new Date('2026-12-21T10:00:00.000Z')
    const again = wrong(dismissed, 'q-d', later)
    expect(lessonReviewInvite(again, later)).toEqual({ lessonId: W2, questionIds: ['q-d', 'q-b', 'q-a'], sectionId: 'grammar' })
  })

  it('Mời ôn bài: 2 câu thì sai 3 và 5 ngày trước → mời', () => {
    const s = wrong(wrong(empty(), 'q-1', ago(5)), 'q-2', ago(3))
    expect(lessonReviewInvite(s, NOW)).toEqual({ lessonId: W2, questionIds: ['q-2', 'q-1'], sectionId: 'grammar' })
  })

  it('Không mời: 1 câu; 2 câu phát âm; 1 câu ngoài 15 ngày; 2 câu Sân ga f13; cùng một câu sai 2 lần', () => {
    expect(lessonReviewInvite(wrong(empty(), 'q-1', ago(1)), NOW)).toBeNull()
    const pron = wrong(wrong(empty(), 'q-1', ago(1), { tag: 'phát âm' }), 'q-2', ago(2), { tag: 'phát âm' })
    expect(lessonReviewInvite(pron, NOW)).toBeNull()
    expect(lessonReviewInvite(wrong(wrong(empty(), 'q-1', ago(15)), 'q-2', ago(1)), NOW)).toBeNull()
    const f13 = wrong(wrong(empty(), 'q-1', ago(1), { lessonId: 'f13' }), 'q-2', ago(2), { lessonId: 'f13' })
    expect(lessonReviewInvite(f13, NOW)).toBeNull()
    expect(lessonReviewInvite(wrong(wrong(empty(), 'q-1', ago(3)), 'q-1', ago(1)), NOW)).toBeNull()
  })

  it('cửa sổ đúng 14 × 24 giờ ở biên; câu sai ở tương lai vẫn tính', () => {
    expect(lessonReviewInvite(wrong(wrong(empty(), 'q-1', ago(14)), 'q-2', ago(1)), NOW)?.lessonId).toBe(W2)
    expect(lessonReviewInvite(wrong(wrong(empty(), 'q-1', ago(14, -1)), 'q-2', ago(1)), NOW)).toBeNull()
    expect(lessonReviewInvite(wrong(wrong(empty(), 'q-1', ago(-2)), 'q-2', ago(1)), NOW)?.lessonId).toBe(W2)
  })

  it('bỏ mục từ đọc (word), mục sai dạng, lessonId lạ', () => {
    let s = wrong(empty(), 'q-1', ago(1))
    s = wrong(s, 'w-1', ago(2), { word: { text: 'cat', ipa: 'kæt' } })
    expect(lessonReviewInvite(s, NOW)).toBeNull()
    const items = (s.data.mistakes as { items: Record<string, unknown> }).items
    const broken: Store = {
      ...s,
      data: { ...s.data, mistakes: { items: { ...items, junk: { tag: 'thì', lessonId: W2, lastWrongAt: ago(1).toISOString() } } } },
    }
    expect(lessonReviewInvite(broken, NOW)).toBeNull()
    expect(lessonReviewInvite(wrong(wrong(empty(), 'q-1', ago(1), { lessonId: 'x' }), 'q-2', ago(1), { lessonId: 'x' }), NOW)).toBeNull()
    // `isLesson` qua tham số.
    const custom = wrong(wrong(empty(), 'q-1', ago(1), { lessonId: 'x' }), 'q-2', ago(2), { lessonId: 'x' })
    expect(lessonReviewInvite(custom, NOW, { isLesson: (id) => id === 'x' })?.lessonId).toBe('x')
  })

  it('sectionId: đoạn nhiều câu nhất; bằng nhau lấy đoạn của câu sai mới nhất', () => {
    let s = wrong(empty(), 'q-1', ago(5), { sectionId: 'pronunciation' })
    s = wrong(s, 'q-2', ago(4), { sectionId: 'pronunciation' })
    s = wrong(s, 'q-3', ago(1), { sectionId: 'grammar' })
    expect(lessonReviewInvite(s, NOW)?.sectionId).toBe('pronunciation')
    let t = wrong(empty(), 'q-1', ago(5), { sectionId: 'pronunciation' })
    t = wrong(t, 'q-2', ago(1), { sectionId: 'grammar' })
    expect(lessonReviewInvite(t, NOW)?.sectionId).toBe('grammar')
  })

  it('Nhiều bài: nhiều câu hơn → câu mới hơn → bài đứng sau trên lộ trình', () => {
    let s = wrong(empty(), 'a-1', ago(1), { lessonId: 's1-t2-w1' })
    s = wrong(s, 'a-2', ago(1), { lessonId: 's1-t2-w1' })
    s = wrong(s, 'b-1', ago(3), { lessonId: 's1-t3-w1' })
    s = wrong(s, 'b-2', ago(3), { lessonId: 's1-t3-w1' })
    s = wrong(s, 'b-3', ago(3), { lessonId: 's1-t3-w1' })
    expect(lessonReviewInvite(s, NOW)?.lessonId).toBe('s1-t3-w1')
    // Bằng số câu → câu sai mới hơn.
    let t = wrong(empty(), 'a-1', ago(2), { lessonId: 's1-t2-w1' })
    t = wrong(t, 'a-2', ago(1), { lessonId: 's1-t2-w1' })
    t = wrong(t, 'b-1', ago(3), { lessonId: 's1-t3-w1' })
    t = wrong(t, 'b-2', ago(3), { lessonId: 's1-t3-w1' })
    expect(lessonReviewInvite(t, NOW)?.lessonId).toBe('s1-t2-w1')
    // Bằng nữa → bài đứng sau.
    let u = wrong(empty(), 'a-1', ago(2), { lessonId: 's1-t2-w1' })
    u = wrong(u, 'a-2', ago(1), { lessonId: 's1-t2-w1' })
    u = wrong(u, 'b-1', ago(2), { lessonId: 's1-t3-w1' })
    u = wrong(u, 'b-2', ago(1), { lessonId: 's1-t3-w1' })
    expect(lessonReviewInvite(u, NOW)?.lessonId).toBe('s1-t3-w1')
    // "Để sau" bài đứng đầu → mời bài kế.
    expect(lessonReviewInvite(dismissLessonInvite(s, 's1-t3-w1', NOW), NOW)?.lessonId).toBe('s1-t2-w1')
  })

  it('story 46 (AC 4): câu gõ quá khứ tiếp diễn q-s1-t2-w4-12 sai vào Sổ lỗi và tính vào lời mời vì nhãn thì', () => {
    const q12 = getQuestion('q-s1-t2-w4-12')!
    const q07 = getQuestion('q-s1-t2-w4-07')!
    expect(q12.tag).toBe('thì')
    let s = recordMistake(empty(), q12, "didn't watch", ago(2))
    expect(readMistakes(s)['q-s1-t2-w4-12']).toMatchObject({ tag: 'thì', lessonId: 's1-t2-w4', sectionId: 'grammar' })
    expect(lessonReviewInvite(s, NOW)).toBeNull()
    s = recordMistake(s, q07, 'took', ago(1))
    expect(lessonReviewInvite(s, NOW)).toEqual({
      lessonId: 's1-t2-w4',
      questionIds: ['q-s1-t2-w4-07', 'q-s1-t2-w4-12'],
      sectionId: 'grammar',
    })
  })
})

describe('dismissLessonInvite / readLessonInvites', () => {
  it('ghi dismissedAt = now; id lạ → store cũ', () => {
    const s = golden()
    const d = dismissLessonInvite(s, W2, NOW)
    expect(readLessonInvites(d)[W2]).toEqual({ dismissedAt: NOW.toISOString(), updatedAt: NOW.toISOString() })
    expect(dismissLessonInvite(s, 'f13', NOW)).toBe(s)
    expect(dismissLessonInvite(s, 'khong-co', NOW)).toBe(s)
    // brickInvites / items giữ nguyên.
    expect((d.data.mistakes as { items: object }).items).toEqual((s.data.mistakes as { items: object }).items)
  })

  it('"Để sau" khi đồng hồ lệch: câu sai ở tương lai → dismissedAt = câu đó, vẫn ẩn', () => {
    const future = ago(-3)
    const s = wrong(wrong(empty(), 'q-1', ago(1)), 'q-2', future)
    const d = dismissLessonInvite(s, W2, NOW)
    expect(readLessonInvites(d)[W2]).toMatchObject({ dismissedAt: future.toISOString() })
    expect(lessonReviewInvite(d, NOW)).toBeNull()
    // Dấu cũ muộn hơn không bị lùi.
    const twice = dismissLessonInvite(d, W2, ago(5))
    expect(readLessonInvites(twice)[W2]).toMatchObject({ dismissedAt: future.toISOString() })
  })

  it('Dữ liệu hỏng: lessonInvites không phải object; mục thiếu dismissedAt → coi như chưa "Để sau"', () => {
    const s = golden()
    const mistakes = s.data.mistakes as Record<string, unknown>
    for (const lessonInvites of [[1], 'x', null, { [W2]: { updatedAt: NOW.toISOString() } }, { [W2]: 5 }]) {
      const broken: Store = { ...s, data: { ...s.data, mistakes: { ...mistakes, lessonInvites } } }
      expect(lessonReviewInvite(broken, NOW)?.lessonId).toBe(W2)
      expect(() => dismissLessonInvite(broken, W2, NOW)).not.toThrow()
      expect(lessonReviewInvite(dismissLessonInvite(broken, W2, NOW), NOW)).toBeNull()
    }
    expect(readLessonInvites(empty())).toEqual({})
  })
})

describe('mergeLessonInvites', () => {
  const T1 = '2026-12-01T00:00:00.000Z'
  const T2 = '2026-12-02T00:00:00.000Z'
  const d = (dismissedAt: string, updatedAt = dismissedAt) => ({ dismissedAt, updatedAt })

  it('lấy dismissedAt muộn hơn; bằng nhau theo updatedAt rồi local; một bên sai dạng → bên hợp lệ', () => {
    expect(
      mergeLessonInvites(
        { a: d(T2, T1), b: 'junk', c: d(T1, T1), e: d(T1, T2), only: d(T1) },
        { a: d(T1, T2), b: d(T1), c: d(T1, T2), e: d(T1, T2), f: d(T2) },
      ),
    ).toEqual({ a: d(T2, T1), b: d(T1), c: d(T1, T2), e: d(T1, T2), only: d(T1), f: d(T2) })
    expect(mergeLessonInvites(undefined, { a: d(T1) })).toEqual({ a: d(T1) })
    expect(mergeLessonInvites({ a: 'x' }, { a: 'y' })).toEqual({ a: 'x' })
  })
})
