import { describe, expect, it } from 'vitest'

import { getQuestion, QUESTION_BANK, type Question } from '@/data/questions'
import { allLessons, getLesson } from '@/data/roadmap'
import { applyStartLesson } from '@/lib/placement'
import { isMastered, isQuizAttempt, listAttempts, listGradedAttempts, readAttempts, readMistakes, recordAttempt, recordMistake } from '@/lib/quiz'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import { recordSession } from '@/lib/sessions'
import type { Store } from '@/lib/storage'

import {
  COMEBACK_QUIZ_ID,
  needsComeback,
  pendingComeback,
  pickComebackTest,
  skipComeback,
  weakestSectionFrom,
} from './index'

const at = (d: number, h = 9) => new Date(2026, 10, d, h)
const empty = (): Store => ({ schemaVersion: 9, data: {} })
const LESSONS = allLessons()
const q = (id: string): Question => getQuestion(id)!

/** Học buổi cuối ngày 02/11. */
function studied(): Store {
  return recordSession(recordSession(empty(), 'full', at(1, 20)), 'lazy', at(2, 22))
}

function completeUntil(store: Store, lessonId: string): Store {
  let s = store
  for (const l of LESSONS.slice(0, LESSONS.findIndex((x) => x.id === lessonId))) s = setLessonCompleted(s, l.id, true, at(1))
  return s
}

describe('pendingComeback — I/O Matrix', () => {
  it('nghỉ 8 ngày → mời test', () => {
    expect(pendingComeback(studied(), at(10, 7))).toEqual({ lastStudied: new Date(2026, 10, 2), days: 8 })
  })
  it('nghỉ đúng 7 ngày → không hiện', () => {
    expect(needsComeback(studied(), at(9, 23))).toBe(false)
  })
  it('chưa học buổi nào → không hiện', () => {
    expect(needsComeback(empty(), at(30))).toBe(false)
  })
  it('học lại sau nghỉ: có buổi mới hôm nay → không hiện', () => {
    expect(needsComeback(recordSession(studied(), 'lazy', at(12)), at(12, 23))).toBe(false)
  })
  it('bấm "Để sau" → ẩn cho đợt nghỉ này, lần làm rỗng hợp lệ có cờ skipped', () => {
    const s = skipComeback(studied(), 'comeback-x', at(12))
    expect(needsComeback(s, at(12, 22))).toBe(false)
    expect(needsComeback(s, at(19, 23))).toBe(false)
    const attempt = readAttempts(s)['comeback-x']
    expect(isQuizAttempt(attempt)).toBe(true)
    expect(attempt).toMatchObject({ quizId: COMEBACK_QUIZ_ID, kind: 'comeback', skipped: true, total: 0, answers: [] })
  })
  it('bỏ qua ngày 12, tới ngày 20 vẫn chưa học → mời lại', () => {
    const s = skipComeback(studied(), 'skip-12', at(12))
    expect(pendingComeback(s, at(20))).toEqual({ lastStudied: new Date(2026, 10, 2), days: 18 })
  })
  it('lần làm comeback ngày 3 (trước khi nghỉ quá 7 ngày) không tính → ngày 12 vẫn mời', () => {
    const s = recordAttempt(
      studied(),
      { id: 'c3', quizId: COMEBACK_QUIZ_ID, seed: 's', startedAt: at(3), answers: [], kind: 'comeback' },
      at(3),
    )
    expect(needsComeback(s, at(12))).toBe(true)
  })
  it('đã làm test quay lại → ẩn', () => {
    const s = recordAttempt(
      studied(),
      { id: 'c1', quizId: COMEBACK_QUIZ_ID, seed: 's', startedAt: at(12), answers: [], kind: 'comeback' },
      at(12),
    )
    expect(listAttempts(s)[0].kind).toBe('comeback')
    expect(needsComeback(s, at(13))).toBe(false)
  })
  it('test/bỏ qua của đợt nghỉ trước không tính cho đợt nghỉ sau', () => {
    let s = skipComeback(studied(), 'old', at(12))
    s = recordSession(s, 'full', at(13))
    expect(needsComeback(s, at(22))).toBe(true)
  })
  it('test thường (không phải comeback) không ẩn thẻ', () => {
    const s = recordAttempt(studied(), { id: 'm', quizId: 'mini-t1', seed: 's', startedAt: at(12), answers: [] }, at(12))
    expect(needsComeback(s, at(12, 20))).toBe(true)
  })
})

describe('isQuizAttempt / listGradedAttempts — kind / skipped', () => {
  const skipped = () => readAttempts(skipComeback(empty(), 'x', at(1))).x as Record<string, unknown>
  it('skipped chỉ hợp lệ với kind comeback và total 0; skipped sai dạng → không hợp lệ', () => {
    const noKind = { ...skipped() }
    delete noKind.kind
    expect(isQuizAttempt(noKind)).toBe(false)
    expect(isQuizAttempt({ ...skipped(), kind: 'other' })).toBe(false)
    expect(isQuizAttempt({ ...skipped(), skipped: 'yes' })).toBe(false)
    const graded = { ...skipped(), total: 1, score: 0, answers: [{ questionId: 'q', chosen: '', correct: false }] }
    expect(isQuizAttempt(graded)).toBe(false)
    expect(isQuizAttempt({ ...graded, skipped: false })).toBe(true)
  })
  it('kind lạ (bản app mới hơn) vẫn hợp lệ nhưng không vào lịch sử có điểm; lần "Để sau" cũng không', () => {
    const plain = { ...skipped() }
    delete plain.skipped
    expect(isQuizAttempt({ ...plain, kind: 'future-kind' })).toBe(true)
    let s = skipComeback(empty(), 'skip', at(1))
    s = { ...s, data: { ...s.data, quizzes: { attempts: { ...readAttempts(s), fut: { ...plain, kind: 'future-kind' } } } } }
    s = recordAttempt(s, { id: 'real', quizId: 'mini-t1', seed: 's', startedAt: at(2), answers: [] }, at(2))
    expect(listAttempts(s)).toHaveLength(3)
    expect(listGradedAttempts(s).map((a) => a.id)).toEqual(['real'])
  })
})

describe('pickComebackTest', () => {
  const recentLessons = ['s1-t2-w1', 's1-t1-w4', 's1-t1-w3', 's1-t1-w2']

  function withMistakes(store: Store, ids: string[]): Store {
    let s = store
    for (const id of ids) s = recordMistake(s, q(id), 'x', at(1))
    return s
  }

  it.each(['a', 'b', 'c', 'seed-4'])('seed %s: 4 bài gần nhất + Sổ lỗi 5 câu → 8 câu, ≤ 3 từ Sổ lỗi, không trùng', (seed) => {
    const mistakeIds = [1, 2, 3, 4, 5].map((n) => `q-s1-t1-w1-0${n}`)
    const s = withMistakes(completeUntil(studied(), 's1-t2-w2'), mistakeIds)
    const picked = pickComebackTest(s, QUESTION_BANK, seed, { canSpeak: true })
    expect(picked).toHaveLength(8)
    expect(new Set(picked.map((x) => x.id)).size).toBe(8)
    const fromMistakes = picked.filter((x) => mistakeIds.includes(x.id))
    expect(fromMistakes).toHaveLength(3)
    for (const x of picked.filter((p) => !mistakeIds.includes(p.id))) expect(recentLessons).toContain(x.lessonId)
    // Chia đều: 5 câu cho 4 bài → mỗi bài ≥ 1.
    for (const l of recentLessons) expect(picked.some((x) => x.lessonId === l), l).toBe(true)
  })

  it('đã xếp lớp vào s1-t2-w1, chưa xong bài nào → câu từ các bài trước s1-t2-w1', () => {
    const s = applyStartLesson(studied(), 's1-t2-w1', at(1))
    for (const seed of ['a', 'b']) {
      const picked = pickComebackTest(s, QUESTION_BANK, seed, { canSpeak: true })
      expect(picked).toHaveLength(8)
      for (const x of picked) expect(['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']).toContain(x.lessonId)
    }
  })

  it('Sổ lỗi > 3 câu, có câu đã thuộc → 3 câu chọn đều chưa thuộc', () => {
    const ids = [1, 2, 3, 4, 5].map((n) => `q-s1-t1-w1-0${n}`)
    let s = withMistakes(completeUntil(studied(), 's1-t2-w2'), ids)
    const items = { ...readMistakes(s) }
    for (const id of ids.slice(0, 2)) {
      const it = items[id] as { card: Record<string, unknown> }
      items[id] = { ...it, card: { ...it.card, learning: false, interval: 30 } }
    }
    s = { ...s, data: { ...s.data, mistakes: { items } } }
    expect(ids.filter((id) => isMastered(items[id] as never))).toEqual(ids.slice(0, 2))
    for (const seed of ['a', 'b', 'c', 'd']) {
      const picked = pickComebackTest(s, QUESTION_BANK, seed, { canSpeak: true }).map((x) => x.id)
      expect(picked.filter((id) => ids.includes(id)).sort()).toEqual(ids.slice(2))
    }
  })

  it('câu Sổ lỗi tra trong bank truyền vào (không có trong bank → không chọn)', () => {
    const ids = [1, 2, 3].map((n) => `q-s1-t1-w1-0${n}`)
    const s = withMistakes(completeUntil(studied(), 's1-t2-w2'), ids)
    const bank = QUESTION_BANK.filter((x) => !ids.includes(x.id))
    const picked = pickComebackTest(s, bank, 'x', { canSpeak: true })
    expect(picked.some((x) => ids.includes(x.id))).toBe(false)
  })

  it('cùng seed → cùng đề', () => {
    const s = completeUntil(studied(), 's1-t3-w1')
    const a = pickComebackTest(s, QUESTION_BANK, 'x', { canSpeak: true }).map((x) => x.id)
    expect(pickComebackTest(s, QUESTION_BANK, 'x', { canSpeak: true }).map((x) => x.id)).toEqual(a)
  })

  it('không có TTS → không có câu nghe', () => {
    const s = completeUntil(studied(), 's1-t3-w1')
    for (const seed of ['a', 'b', 'c']) {
      const picked = pickComebackTest(s, QUESTION_BANK, seed, { canSpeak: false })
      expect(picked).toHaveLength(8)
      expect(picked.every((x) => x.kind !== 'listening')).toBe(true)
    }
  })

  it('thiếu câu → lấy thêm bài trước đó', () => {
    const s = completeUntil(studied(), 's1-t2-w2')
    // Mỗi bài chỉ có 1 câu trong bank giả.
    const bank = LESSONS.slice(0, 5).map((l) => QUESTION_BANK.find((x) => x.lessonId === l.id && x.kind !== 'listening')!)
    const picked = pickComebackTest(s, bank, 'x', { canSpeak: true })
    expect(picked.map((x) => x.lessonId).sort()).toEqual(LESSONS.slice(0, 5).map((l) => l.id).sort())
  })

  it('bài hiện tại là bài đầu (không có bài trước) → lấy câu bài hiện tại', () => {
    const picked = pickComebackTest(studied(), QUESTION_BANK, 'x', { canSpeak: true })
    expect(picked.length).toBeGreaterThan(0)
    expect(picked.every((x) => x.lessonId === 's1-t1-w1')).toBe(true)
  })
})

describe('weakestSectionFrom', () => {
  const answer = (questionId: string, correct: boolean) => ({ questionId, chosen: '', correct })
  const grammarA = QUESTION_BANK.filter((x) => x.lessonId === 's1-t1-w3' && x.sectionId === 'grammar')
  const grammarB = QUESTION_BANK.filter((x) => x.lessonId === 's1-t1-w2' && x.sectionId === 'grammar')

  it('sai 2 câu ngữ pháp bài A, 1 câu bài B → đoạn ngữ pháp bài A', () => {
    const answers = [answer(grammarA[0].id, false), answer(grammarA[1].id, false), answer(grammarB[0].id, false), answer(grammarB[1].id, true)]
    expect(weakestSectionFrom({ answers })).toEqual({ lessonId: 's1-t1-w3', sectionId: 'grammar', wrong: 2 })
  })

  it('hoà → bài sớm hơn trên lộ trình', () => {
    const answers = [answer(grammarA[0].id, false), answer(grammarB[0].id, false)]
    expect(weakestSectionFrom({ answers })).toMatchObject({ lessonId: 's1-t1-w2', sectionId: 'grammar' })
  })

  it('hoà trong cùng bài (ngữ pháp vs phát âm) → đoạn đứng trước trong bài', () => {
    const lesson = 's1-t1-w3'
    const pron = QUESTION_BANK.find((x) => x.lessonId === lesson && x.sectionId === 'pronunciation')!
    const sections = getLesson(lesson)!.sections.map((x) => x.id)
    const first = sections.indexOf('grammar') < sections.indexOf('pronunciation') ? 'grammar' : 'pronunciation'
    for (const answers of [
      [answer(grammarA[0].id, false), answer(pron.id, false)],
      [answer(pron.id, false), answer(grammarA[0].id, false)],
    ]) {
      expect(weakestSectionFrom({ answers })).toMatchObject({ lessonId: lesson, sectionId: first })
    }
  })

  it('đoạn không có trong bài thua khi hoà', () => {
    const fake = { ...grammarA[0], id: 'fake', sectionId: 'checkpoint' as const }
    const lookup = (id: string) => (id === 'fake' ? fake : getQuestion(id))
    const answers = [answer('fake', false), answer(grammarA[1].id, false)]
    expect(weakestSectionFrom({ answers }, lookup)).toMatchObject({ sectionId: 'grammar' })
  })

  it('đúng hết → null (về bài hiện tại)', () => {
    expect(weakestSectionFrom({ answers: [answer(grammarA[0].id, true)] })).toBeNull()
    expect(weakestSectionFrom({ answers: [] })).toBeNull()
  })
})
