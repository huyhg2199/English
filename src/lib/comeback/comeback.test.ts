import { describe, expect, it } from 'vitest'

import { getBrickMeta } from '@/data/foundation'
import { hasBrickContent } from '@/data/foundation/content'
import { FOUNDATION_QUESTIONS, getQuestion, QUESTION_BANK, type Question } from '@/data/questions'
import { allLessons, getLesson, lessonHref, sectionHref } from '@/data/roadmap'
import { completeBrick, finishPlacement, skipFoundation } from '@/lib/foundation'
import { applyStartLesson } from '@/lib/placement'
import { isMastered, isQuizAttempt, listAttempts, listGradedAttempts, readAttempts, readMistakes, recordAttempt, recordMistake } from '@/lib/quiz'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import { recordSession } from '@/lib/sessions'
import type { Store } from '@/lib/storage'

import {
  COMEBACK_BANK,
  COMEBACK_QUIZ_ID,
  comebackHome,
  comebackQuestions,
  comebackTarget,
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

/** Đã ra khỏi Sân ga (bỏ qua ngày 01/11): test quay lại lấy câu bài như trước story 47. */
function studiedOut(): Store {
  return skipFoundation(studied(), at(1))
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
    const s = withMistakes(completeUntil(studiedOut(), 's1-t2-w2'), mistakeIds)
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
    const s = applyStartLesson(studiedOut(), 's1-t2-w1', at(1))
    for (const seed of ['a', 'b']) {
      const picked = pickComebackTest(s, QUESTION_BANK, seed, { canSpeak: true })
      expect(picked).toHaveLength(8)
      for (const x of picked) expect(['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']).toContain(x.lessonId)
    }
  })

  it('Sổ lỗi > 3 câu, có câu đã thuộc → 3 câu chọn đều chưa thuộc', () => {
    const ids = [1, 2, 3, 4, 5].map((n) => `q-s1-t1-w1-0${n}`)
    let s = withMistakes(completeUntil(studiedOut(), 's1-t2-w2'), ids)
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
    const s = withMistakes(completeUntil(studiedOut(), 's1-t2-w2'), ids)
    const bank = QUESTION_BANK.filter((x) => !ids.includes(x.id))
    const picked = pickComebackTest(s, bank, 'x', { canSpeak: true })
    expect(picked.some((x) => ids.includes(x.id))).toBe(false)
  })

  it('cùng seed → cùng đề', () => {
    const s = completeUntil(studiedOut(), 's1-t3-w1')
    const a = pickComebackTest(s, QUESTION_BANK, 'x', { canSpeak: true }).map((x) => x.id)
    expect(pickComebackTest(s, QUESTION_BANK, 'x', { canSpeak: true }).map((x) => x.id)).toEqual(a)
  })

  it('không có TTS → không có câu nghe', () => {
    const s = completeUntil(studiedOut(), 's1-t3-w1')
    for (const seed of ['a', 'b', 'c']) {
      const picked = pickComebackTest(s, QUESTION_BANK, seed, { canSpeak: false })
      expect(picked).toHaveLength(8)
      expect(picked.every((x) => x.kind !== 'listening')).toBe(true)
    }
  })

  it('thiếu câu → lấy thêm bài trước đó', () => {
    const s = completeUntil(studiedOut(), 's1-t2-w2')
    // Mỗi bài chỉ có 1 câu trong bank giả.
    const bank = LESSONS.slice(0, 5).map((l) => QUESTION_BANK.find((x) => x.lessonId === l.id && x.kind !== 'listening')!)
    const picked = pickComebackTest(s, bank, 'x', { canSpeak: true })
    expect(picked.map((x) => x.lessonId).sort()).toEqual(LESSONS.slice(0, 5).map((l) => l.id).sort())
  })

  it('sau Sân ga, bài hiện tại là bài đầu (không có bài trước) → lấy câu bài hiện tại', () => {
    const picked = pickComebackTest(studiedOut(), QUESTION_BANK, 'x', { canSpeak: true })
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

describe('lessonId dạng fNN (buổi Sân ga, câu viên gạch)', () => {
  it('nhật ký buổi có lessonId f03 vẫn tính là đã học (nghỉ 8 ngày → mời test)', () => {
    const s = recordSession(empty(), 'full', at(2, 20), { lessonId: 'f03' })
    expect(pendingComeback(s, at(10, 7))).toEqual({ lastStudied: new Date(2026, 10, 2), days: 8 })
    expect(needsComeback(s, at(3, 7))).toBe(false)
  })

  it('weakestSectionFrom: câu viên gạch (f03) hoà với câu bài → bài trên lộ trình thắng, không lỗi', () => {
    const brickQ = getQuestion('q-f03-01')!
    expect(brickQ.lessonId).toBe('f03')
    const lessonQ = QUESTION_BANK.find((x) => x.lessonId === 's1-t1-w3' && x.sectionId === 'grammar')!
    const answer = (questionId: string) => ({ questionId, chosen: '', correct: false })
    expect(weakestSectionFrom({ answers: [answer(brickQ.id), answer(lessonQ.id)] })).toMatchObject({ lessonId: 's1-t1-w3' })
    expect(weakestSectionFrom({ answers: [answer(brickQ.id)] })).toEqual({ lessonId: 'f03', sectionId: 'pronunciation', wrong: 1 })
  })
})

describe('story 47: test quay lại khi đang ở Sân ga', () => {
  const ids = (qs: readonly Question[]) => qs.map((x) => x.id)

  /** Đang ở Sân ga, xong F01 → F05 (F05 gần nhất), nghỉ 9 ngày (buổi cuối 02/11). */
  function f01ToF05(): Store {
    let s = finishPlacement(studied(), 'skipped', at(1))
    for (const [i, id] of ['F01', 'F02', 'F03', 'F04', 'F05'].entries()) s = completeBrick(s, id, at(1, 10 + i))
    return s
  }

  it('COMEBACK_BANK = QUESTION_BANK + câu kiểm tra hàng Sân ga', () => {
    expect(COMEBACK_BANK).toHaveLength(QUESTION_BANK.length + FOUNDATION_QUESTIONS.length)
  })

  it('xong F01–F05, Sổ lỗi có q-f03-02 → ≤ 8 câu: q-f03-02 + câu của F02–F05, thiếu thì F01; không câu bài lộ trình', () => {
    const s = recordMistake(f01ToF05(), q('q-f03-02'), 'x', at(2))
    expect(pendingComeback(s, at(11))).not.toBeNull()
    for (const seed of ['a', 'b', 'c', 'd']) {
      const picked = pickComebackTest(s, COMEBACK_BANK, seed, { canSpeak: true })
      expect(picked.length).toBeLessThanOrEqual(8)
      expect(ids(picked)).toContain('q-f03-02')
      for (const x of picked) expect(x.id, x.id).toMatch(/^q-f0[1-5]-/)
      // F02–F05 có 6 câu (sau khi đã lấy q-f03-02) → lấy hết, câu thứ 8 là F01.
      for (const x of FOUNDATION_QUESTIONS.filter((f) => /^f0[2-5]$/.test(f.lessonId))) expect(ids(picked), x.id).toContain(x.id)
      expect(picked).toHaveLength(8)
      expect(ids(picked)).toContain('q-f01-01')
    }
  })

  it('ưu tiên 4 viên xong gần nhất (lastDoneAt), không phải 4 viên đầu', () => {
    let s = finishPlacement(studied(), 'skipped', at(1))
    // F13 → F18 xong sau F01, F02.
    for (const [i, id] of ['F01', 'F02', 'F15', 'F16', 'F17', 'F18'].entries()) s = completeBrick(s, id, at(1, 10 + i))
    for (const seed of ['a', 'b']) {
      const picked = pickComebackTest(s, COMEBACK_BANK, seed, { canSpeak: true })
      expect(picked).toHaveLength(8)
      for (const x of picked) expect(['f15', 'f16', 'f17', 'f18'], x.id).toContain(x.lessonId)
    }
  })

  it('câu bài lộ trình chỉ vào đề khi nằm trong Sổ lỗi', () => {
    const s = recordMistake(f01ToF05(), q('q-s1-t1-w1-01'), 'x', at(2))
    const picked = pickComebackTest(s, COMEBACK_BANK, 'a', { canSpeak: true })
    expect(picked.filter((x) => x.id.startsWith('q-s1-')).map((x) => x.id)).toEqual(['q-s1-t1-w1-01'])
  })

  it('không TTS → không câu nghe; cùng seed → cùng đề', () => {
    const s = f01ToF05()
    const picked = pickComebackTest(s, COMEBACK_BANK, 'x', { canSpeak: false })
    expect(picked.every((x) => x.kind !== 'listening')).toBe(true)
    expect(ids(pickComebackTest(s, COMEBACK_BANK, 'x', { canSpeak: false }))).toEqual(ids(picked))
  })

  it('chưa xong viên nào, Sổ lỗi trống → không có test (Hôm nay không có thẻ quay lại)', () => {
    const s = studied()
    expect(pendingComeback(s, at(11))).not.toBeNull()
    expect(pickComebackTest(s, COMEBACK_BANK, 'x', { canSpeak: true })).toEqual([])
  })

  it('comebackHome: Sân ga → viên tiếp theo; hết viên → Sân ga; sau Sân ga → bài hiện tại; hết lộ trình → null', () => {
    const all = () => true
    expect(comebackHome(f01ToF05(), all)).toEqual({ kind: 'brick', brickId: 'F06' })
    expect(comebackHome(studied(), all)).toEqual({ kind: 'brick', brickId: 'F01' })
    expect(comebackHome(studied(), () => false)).toEqual({ kind: 'foundation' })
    expect(comebackHome(skipFoundation(studied(), at(1)), all)).toEqual({ kind: 'lesson', lessonId: 's1-t1-w1' })
    expect(comebackHome(completeUntil(skipFoundation(studied(), at(1)), LESSONS[LESSONS.length - 1].id), all)).toEqual({
      kind: 'lesson',
      lessonId: LESSONS[LESSONS.length - 1].id,
    })
    let done = skipFoundation(studied(), at(1))
    for (const l of LESSONS) done = setLessonCompleted(done, l.id, true, at(1))
    expect(comebackHome(done, all)).toBeNull()
  })

  it('comebackTarget: lỗi ở viên → /foundation/Fxx; lỗi ở bài → đoạn bài; đúng hết → home', () => {
    expect(comebackTarget({ lessonId: 'f03', sectionId: 'pronunciation', wrong: 2 }, { kind: 'brick', brickId: 'F06' })).toEqual({
      href: '/foundation/F03',
      label: 'F03 · IPA là gì',
    })
    expect(comebackTarget({ lessonId: 's1-t1-w3', sectionId: 'grammar', wrong: 1 }, null)).toEqual({
      href: sectionHref('s1-t1-w3', 'grammar'),
      label: `${getLesson('s1-t1-w3')!.title} · Ngữ pháp`,
    })
    expect(comebackTarget(null, { kind: 'brick', brickId: 'F06' })).toMatchObject({ href: '/foundation/F06' })
    expect(comebackTarget(null, { kind: 'brick', brickId: 'F06' }).label).toMatch(/^F06 · /)
    expect(comebackTarget(null, { kind: 'foundation' })).toEqual({ href: '/foundation', label: 'Sân ga 9¾' })
    expect(comebackTarget(null, { kind: 'lesson', lessonId: 's1-t2-w1' })).toEqual({
      href: lessonHref('s1-t2-w1'),
      label: getLesson('s1-t2-w1')!.title,
    })
    expect(comebackTarget(null, null)).toEqual({ href: '/roadmap', label: 'Lộ trình' })
  })

  it('kết quả trỏ viên: sai nhiều nhất ở câu q-f03-… → Học tiếp F03', () => {
    const answer = (questionId: string, correct: boolean) => ({ questionId, chosen: '', correct })
    const weak = weakestSectionFrom({ answers: [answer('q-f03-01', false), answer('q-f03-02', false), answer('q-f05-01', false)] })
    expect(weak).toMatchObject({ lessonId: 'f03', wrong: 2 })
    expect(comebackTarget(weak, { kind: 'brick', brickId: 'F06' }).href).toBe('/foundation/F03')
  })

  it('sau Sân ga, Sổ lỗi có q-f11-02 sai nhiều nhất → /foundation/F11 (không còn sectionHref("f11", …))', () => {
    const answer = (questionId: string) => ({ questionId, chosen: '', correct: false })
    const weak = weakestSectionFrom({ answers: [answer('q-f11-02')] })
    expect(comebackTarget(weak, { kind: 'lesson', lessonId: 's1-t2-w1' })).toEqual({ href: '/foundation/F11', label: `F11 · ${getBrickMeta('F11')!.title}` })
  })

  it('hoà: bài lộ trình thắng viên; giữa các viên thì viên đứng trước (F01 → F18) thắng', () => {
    const answer = (questionId: string) => ({ questionId, chosen: '', correct: false })
    const lessonQ = QUESTION_BANK.find((x) => x.lessonId === 's1-t3-w1')!
    expect(weakestSectionFrom({ answers: [answer('q-f03-01'), answer(lessonQ.id)] })).toMatchObject({ lessonId: 's1-t3-w1' })
    expect(weakestSectionFrom({ answers: [answer('q-f11-01'), answer('q-f03-01')] })).toMatchObject({ lessonId: 'f03' })
    expect(weakestSectionFrom({ answers: [answer('q-f03-01'), answer('q-f11-01')] })).toMatchObject({ lessonId: 'f03' })
  })

  it('sau Sân ga, như cũ: bài hiện tại s1-t2-w1 → câu bài trước + Sổ lỗi, không câu viên ngoài Sổ lỗi', () => {
    const s = completeUntil(skipFoundation(studied(), at(1)), 's1-t2-w1')
    const picked = pickComebackTest(s, COMEBACK_BANK, 'a', { canSpeak: true })
    expect(picked).toHaveLength(8)
    for (const x of picked) expect(['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']).toContain(x.lessonId)
    expect(ids(picked)).toEqual(ids(pickComebackTest(s, QUESTION_BANK, 'a', { canSpeak: true })))
  })

  it('comebackQuestions (Hôm nay và trang test dùng chung): Sân ga xong F01–F05, Sổ lỗi trống → 8 câu viên, đúng đề COMEBACK_BANK', () => {
    const s = f01ToF05()
    for (const seed of ['probe', 'a']) {
      const picked = comebackQuestions(s, seed, { canSpeak: true })
      expect(picked).toHaveLength(8)
      for (const x of picked) expect(x.lessonId, x.id).toMatch(/^f0[1-5]$/)
      expect(ids(picked)).toEqual(ids(pickComebackTest(s, COMEBACK_BANK, seed, { canSpeak: true })))
    }
    // Ngân hàng cũ (chỉ QUESTION_BANK) sẽ không còn câu nào: helper phải dùng COMEBACK_BANK.
    expect(pickComebackTest(s, QUESTION_BANK, 'probe', { canSpeak: true })).toEqual([])
  })

  it('đúng hết ở Sân ga với nội dung viên thật (hasBrickContent): Học tiếp trỏ viên tiếp theo có nội dung', () => {
    const s = f01ToF05()
    const home = comebackHome(s, hasBrickContent)
    expect(home).toEqual({ kind: 'brick', brickId: 'F06' })
    const graded = { answers: comebackQuestions(s, 'a', { canSpeak: true }).map((x) => ({ questionId: x.id, chosen: x.answer, correct: true })) }
    expect(comebackTarget(weakestSectionFrom(graded), home)).toEqual({ href: '/foundation/F06', label: `F06 · ${getBrickMeta('F06')!.title}` })
  })

  it('viên gần nhất so theo thời điểm, không theo chuỗi: lastDoneAt khác định dạng vẫn đúng thứ tự', () => {
    let s = finishPlacement(studied(), 'skipped', at(1))
    for (const [i, id] of ['F01', 'F02', 'F15', 'F16', 'F17', 'F18'].entries()) s = completeBrick(s, id, at(1, 10 + i))
    // F01 ghi theo múi giờ −12:00: chuỗi "2026-11-01T05…" đứng trước mọi bản khác nếu so chuỗi, nhưng là 17:00Z, lần xong muộn nhất.
    const foundation = s.data.foundation as { bricks: Record<string, { lastDoneAt: string }> }
    foundation.bricks.F01 = { ...foundation.bricks.F01, lastDoneAt: '2026-11-01T05:00:00-12:00' }
    const picked = pickComebackTest(s, COMEBACK_BANK, 'a', { canSpeak: true })
    expect(picked.some((x) => x.lessonId === 'f01')).toBe(true)
  })
})
