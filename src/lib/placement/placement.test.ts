import { describe, expect, it } from 'vitest'

import { allLessons, getLesson, STAGES, type SectionId, type SkillTag } from '@/data/roadmap'
import { recordAttempt as recordPronunciationAttempt } from '@/lib/pronunciation'
import { computeRoadmapProgress, readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'
import { localDayKey, recordSession, sessionLesson } from '@/lib/sessions'
import { gradeCard, markCardKnown } from '@/lib/srs'
import type { Store } from '@/lib/storage'

import {
  applyStartLesson,
  decideHouseSave,
  HOUSE_QUESTIONS,
  recordPlacementAttempt,
  weakestForStore,
  estimateScores,
  formatHours,
  hasPlacement,
  houseFor,
  listAttempts,
  PART_LIMITS,
  placementFor,
  prioritizeSections,
  readPlacement,
  recordAttempt,
  setHouse,
  skillGaps,
  stageGoal,
  studyHours,
  THEORY_SECTION_IDS,
  validateAttempt,
  vocabularyTargetFor,
  weakestSkill,
  type PartScores,
} from '.'

const store = (data: Record<string, unknown> = {}): Store => ({ schemaVersion: 7, data })
const NOW = new Date(2026, 10, 14, 12)
const zero: PartScores = { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }
const full: PartScores = { ...PART_LIMITS }
/** L: 60 câu, R: 50 câu → 270 + 195 = 465 (chặng 2). */
const mid: PartScores = { p1: 5, p2: 15, p3: 20, p4: 20, p5: 20, p6: 10, p7: 20 }
const raw = (p: PartScores) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)]))

describe('validateAttempt', () => {
  it('hợp lệ → trả về số', () => {
    expect(validateAttempt(raw(mid))).toEqual({ ok: true, parts: mid })
    expect(validateAttempt({ ...raw(full), p1: ' 6 ' })).toEqual({ ok: true, parts: full })
  })

  it.each([
    ['7', 'Part 1 chỉ có 6 câu, nhập từ 0 đến 6.'],
    ['-1', 'Chỉ nhập số nguyên từ 0 đến 6.'],
    ['abc', 'Chỉ nhập số nguyên từ 0 đến 6.'],
    ['2.5', 'Chỉ nhập số nguyên từ 0 đến 6.'],
    ['', 'Nhập số câu đúng của Part 1 (0–6).'],
  ])('P1 = %j → lỗi tiếng Việt ở đúng ô, không có parts', (value, message) => {
    const result = validateAttempt({ ...raw(zero), p1: value })
    expect(result).toEqual({ ok: false, errors: { p1: message } })
  })
})

describe('estimateScores / placementFor', () => {
  it('Listening = P1–P4, Reading = P5–P7, mỗi phần 5–495, bội của 5', () => {
    expect(estimateScores(zero)).toMatchObject({ listening: 5, reading: 5, total: 10 })
    expect(estimateScores(full)).toMatchObject({ listeningCorrect: 100, readingCorrect: 100, listening: 495, reading: 495, total: 990 })
    const m = estimateScores(mid)
    expect(m).toMatchObject({ listeningCorrect: 60, readingCorrect: 50, listening: 270, reading: 195, total: 465 })
    const odd = estimateScores({ ...zero, p2: 15 })
    expect(odd.listening % 5).toBe(0)
  })

  it('tăng đơn điệu theo số câu đúng', () => {
    let prev = 0
    for (let n = 0; n <= 25; n++) {
      const s = estimateScores({ ...zero, p2: n }).listening
      expect(s).toBeGreaterThanOrEqual(prev)
      prev = s
    }
  })

  it('mất gốc (< 300) → bài đầu chặng 1; khá (300–549) → chặng 2; ≥ 550 → chặng 3', () => {
    expect(placementFor(estimateScores(zero).total)).toEqual({ stageNumber: 1, lessonId: 's1-t1-w1' })
    expect(placementFor(299).stageNumber).toBe(1)
    expect(placementFor(300)).toEqual({ stageNumber: 2, lessonId: 's2-t5-w1' })
    expect(placementFor(549).stageNumber).toBe(2)
    expect(placementFor(550)).toEqual({ stageNumber: 3, lessonId: STAGES[2].months[0].lessons[0].id })
    expect(placementFor(estimateScores(mid).total).stageNumber).toBe(2)
  })
})

describe('houseFor', () => {
  it('nghiêng về code → Ravenclaw', () => {
    expect(houseFor(['code', 'code', 'film', 'code'])).toBe('ravenclaw')
  })
  it('phim → Gryffindor, nhạc → Hufflepuff, tin → Slytherin', () => {
    expect(houseFor(['film', 'film', 'film', 'music'])).toBe('gryffindor')
    expect(houseFor(['music', 'music', 'news', 'code'])).toBe('hufflepuff')
    expect(houseFor(['news', 'news', 'news', 'film'])).toBe('slytherin')
  })
  it('hoà 2 phim, 2 code → Gryffindor (theo thứ tự ưu tiên)', () => {
    expect(houseFor(['code', 'film', 'code', 'film'])).toBe('gryffindor')
    expect(houseFor(['code', 'news', 'code', 'news'])).toBe('ravenclaw')
  })
})

describe('recordAttempt / setHouse / applyStartLesson', () => {
  it('lần đầu: lưu mốc và xếp bài bắt đầu; bài học tiếp theo nhảy tới đó, không bài nào bị đánh dấu xong', () => {
    const { store: s } = recordAttempt(store(), mid, NOW, 's2-t5-w1')
    expect(hasPlacement(s)).toBe(true)
    expect(readPlacement(s).startLessonId).toBe('s2-t5-w1')
    expect(readCompletedLessonIds(s)).toEqual([])
    expect(sessionLesson(s)?.lesson.id).toBe('s2-t5-w1')
  })

  it('làm lại: lần 1 vẫn là mốc, lần 2 là hiện tại; bài bắt đầu chỉ đổi khi "Áp dụng xếp lớp"', () => {
    const first = recordAttempt(store(), zero, NOW, 's1-t1-w1')
    const later = new Date(NOW.getTime() + 86_400_000)
    const second = recordAttempt(first.store, mid, later, 's2-t5-w1')
    const attempts = listAttempts(second.store)
    expect(attempts.map((a) => a.id)).toEqual([first.id, second.id])
    expect(attempts[0].parts).toEqual(zero)
    expect(readPlacement(second.store).startLessonId).toBe('s1-t1-w1')
    expect(skillGaps(second.store).baseline?.total).toBe(10)
    expect(skillGaps(second.store).latest?.total).toBe(465)

    const applied = applyStartLesson(second.store, 's2-t5-w1', later)
    expect(readPlacement(applied).startLessonId).toBe('s2-t5-w1')
    expect(listAttempts(applied)).toHaveLength(2)
    expect(Date.parse(readPlacement(applied).updatedAt)).toBeGreaterThan(Date.parse(readPlacement(second.store).updatedAt))
  })

  it('cùng mili giây → id khác nhau, không đè lần cũ', () => {
    const a = recordAttempt(store(), zero, NOW, 's1-t1-w1')
    const b = recordAttempt(a.store, mid, NOW, 's1-t1-w1')
    expect(a.id).not.toBe(b.id)
    expect(listAttempts(b.store)).toHaveLength(2)
  })

  it('setHouse đổi Nhà, updatedAt không lùi khi đồng hồ chạy lùi', () => {
    const s1 = setHouse(store(), 'ravenclaw', NOW)
    const s2 = setHouse(s1, 'gryffindor', new Date(NOW.getTime() - 60_000))
    expect(readPlacement(s2).house).toBe('gryffindor')
    expect(Date.parse(readPlacement(s2).updatedAt)).toBeGreaterThan(Date.parse(readPlacement(s1).updatedAt))
    expect(setHouse(s2, 'gryffindor', NOW)).toBe(s2)
  })

  it('placement rỗng / sai dạng → chưa làm Mũ', () => {
    expect(hasPlacement(store())).toBe(false)
    expect(hasPlacement(store({ placement: { attempts: { x: { junk: 1 } } } }))).toBe(false)
    expect(readPlacement(store({ placement: 'x' }))).toMatchObject({ house: null, startLessonId: null, attempts: {} })
  })
})

describe('roadmap với bài bắt đầu', () => {
  const lessons = allLessons()

  it('xếp chặng 2 → chặng 1 "đã bỏ qua", học tiếp là bài đầu chặng 2', () => {
    const p = computeRoadmapProgress(lessons, [], 's2-t5-w1')
    expect(p.nextLessonId).toBe('s2-t5-w1')
    expect(p.skipped.size).toBe(16)
    expect(p.skipped.has('s1-t1-w1')).toBe(true)
    expect(p.skipped.has('s2-t5-w1')).toBe(false)
  })

  it('bài đã xong trước điểm bắt đầu vẫn sáng (xong thắng "bỏ qua")', () => {
    const p = computeRoadmapProgress(lessons, ['s1-t1-w1'], 's2-t5-w1')
    expect(p.completed.has('s1-t1-w1')).toBe(true)
    expect(p.skipped.has('s1-t1-w1')).toBe(false)
  })

  it('giữ chữ ký cũ: không có bài bắt đầu / id lạ → như cũ, không bỏ qua bài nào', () => {
    expect(computeRoadmapProgress(lessons, []).skipped.size).toBe(0)
    expect(computeRoadmapProgress(lessons, [], 'khong-co').nextLessonId).toBe('s1-t1-w1')
  })

  it('xong hết từ bài bắt đầu → học tiếp quay về bài bỏ qua đầu tiên', () => {
    const after = lessons.slice(16).map((l) => l.id)
    const p = computeRoadmapProgress(lessons, after, 's2-t5-w1')
    expect(p.nextLessonId).toBe('s1-t1-w1')
    expect(p.skipped.has('s1-t1-w1')).toBe(false)
  })
})

describe('skillGaps / weakestSkill', () => {
  it('mục tiêu chặng = cận trên scoreGoal (300 / 550 / 750)', () => {
    expect(STAGES.map(stageGoal)).toEqual([300, 550, 750])
  })

  it('chưa làm Mũ → điểm L/R/ngữ pháp chưa có, không có kỹ năng yếu nhất từ chúng', () => {
    const board = skillGaps(store())
    expect(board.latest).toBeNull()
    expect(board.rows.find((r) => r.skill === 'listening')?.current).toBeNull()
  })

  it('5 dòng; L/R so với 55% / 45% mục tiêu chặng; ngữ pháp % đúng P5+P6 so với 70%', () => {
    const { store: s } = recordAttempt(store(), mid, NOW, 's1-t1-w1')
    const board = skillGaps(s)
    expect(board.stage.number).toBe(1)
    expect(board.rows.map((r) => r.skill)).toEqual(['listening', 'reading', 'grammar', 'vocabulary', 'pronunciation'])
    const [l, r, g, v, p] = board.rows
    expect(l).toMatchObject({ current: 270, target: 165, gap: 0 })
    expect(r).toMatchObject({ current: 195, target: 135, gap: 0 })
    expect(g).toMatchObject({ current: 65, target: 70 })
    expect(g.gap).toBeCloseTo(5 / 70)
    expect(v).toMatchObject({ current: 0, target: 60, gap: 1 })
    expect(p).toMatchObject({ current: null, gap: null })
  })

  it('ngữ pháp có khoảng cách lớn nhất → kỹ năng yếu nhất là ngữ pháp; giữ thứ tự (lý thuyết trước), ngữ pháp "Ưu tiên"', () => {
    // L/R cao, P5+P6 thấp, từ vựng đủ.
    const parts: PartScores = { p1: 6, p2: 25, p3: 39, p4: 30, p5: 5, p6: 2, p7: 54 }
    let s = recordAttempt(store(), parts, NOW, 's1-t1-w1').store
    for (let i = 0; i < 60; i++) s = gradeCard(s, `w${i}`, 'good', NOW)
    const rows = skillGaps(s).rows
    expect(weakestSkill(rows)).toBe('grammar')

    const lesson = getLesson('s1-t1-w1')!
    const ordered = prioritizeSections(lesson.sections, 'grammar')
    // Ngữ pháp là đoạn lý thuyết: không đảo lên trên phát âm, chỉ gắn nhãn "Ưu tiên".
    expect(ordered.map((o) => o.section.id)).toEqual(lesson.sections.map((x) => x.id))
    expect(ordered.slice(0, 2).map((o) => o.section.id)).toEqual(['pronunciation', 'grammar'])
    expect(ordered[1]).toMatchObject({ section: { id: 'grammar' }, priority: true })
    expect(ordered.filter((o) => o.priority)).toHaveLength(1)
  })

  it('chưa làm Mũ (weakest null) → không đổi thứ tự đoạn', () => {
    const lesson = getLesson('s1-t1-w1')!
    const ordered = prioritizeSections(lesson.sections, null)
    expect(ordered.map((o) => o.section.id)).toEqual(lesson.sections.map((x) => x.id))
    expect(ordered.some((o) => o.priority)).toBe(false)
  })

  it('phát âm: trung bình điểm tốt nhất các câu đã thử so với 70% (4 câu 50/70/80/100 → 75%)', () => {
    let s = store()
    ;[50, 70, 80, 100].forEach((score, i) => {
      s = recordPronunciationAttempt(s, `c${i}`, score, NOW)
    })
    // Lần sau thấp hơn không kéo điểm tốt nhất xuống.
    s = recordPronunciationAttempt(s, 'c0', 10, NOW)
    const p = skillGaps(s).rows.find((r) => r.skill === 'pronunciation')!
    expect(p).toMatchObject({ unit: 'percent', current: 75, target: 70, gap: 0 })
    s = recordPronunciationAttempt(store(), 'x', 35, NOW)
    const low = skillGaps(s).rows.find((r) => r.skill === 'pronunciation')!
    expect(low).toMatchObject({ current: 35, target: 70, gap: 0.5 })
  })

  it('phát âm "chưa có dữ liệu" không bao giờ là kỹ năng yếu nhất', () => {
    expect(weakestSkill([{ skill: 'pronunciation', unit: 'score', current: null, target: null, baseline: null, gap: null }])).toBeNull()
  })

  it('từ vựng: không tính thẻ "Đã biết"; chặng 2–3 dùng 1000 + 60/tuần từ đầu chặng 2', () => {
    let s = gradeCard(store(), 'a', 'good', NOW)
    s = markCardKnown(s, 'b', NOW)
    expect(skillGaps(s).rows.find((r) => r.skill === 'vocabulary')?.current).toBe(1)
    expect(vocabularyTargetFor('s1-t4-w4')).toBe(1000)
    expect(vocabularyTargetFor('s2-t5-w1')).toBe(1060)
    expect(vocabularyTargetFor('s2-t5-w2')).toBe(1120)
  })

  it('chặng hiện tại theo bài bắt đầu: xếp chặng 2 → mục tiêu 550', () => {
    const { store: s } = recordAttempt(store(), mid, NOW, 's2-t5-w1')
    const board = skillGaps(s)
    expect(board.stage.number).toBe(2)
    expect(board.rows[0].target).toBe(303)
    expect(board.rows[1].target).toBe(248)
  })

  it('đã xong bài thì từ vựng theo bài tiếp theo', () => {
    const s = setLessonCompleted(store(), 's1-t1-w1', true, NOW)
    expect(skillGaps(s).rows.find((r) => r.skill === 'vocabulary')?.target).toBe(120)
  })
})

describe('studyHours', () => {
  it('10 buổi chuẩn + 4 buổi lười trong 14 ngày → 290 phút = 4,8 giờ; nhịp cần ≈ 17,3 giờ', () => {
    let s = store()
    for (let i = 0; i < 14; i++) {
      const day = new Date(2026, 10, 1 + i, 9)
      s = recordSession(s, i < 10 ? 'full' : 'lazy', day)
    }
    const h = studyHours((s.data.sessions as { days: Record<string, unknown> }).days, NOW)
    expect(h.minutes).toBe(290)
    expect(formatHours(h.hours)).toBe('4,8')
    expect(h.days).toBe(14)
    expect(formatHours(h.paceHours)).toBe('17,3')
    expect(h.percentOfYear).toBeCloseTo((290 / 60 / 450) * 100)
  })

  it('chưa học buổi nào → 0 giờ, không chia cho 0', () => {
    const h = studyHours({}, NOW)
    expect(h).toEqual({ minutes: 0, hours: 0, percentOfYear: 0, days: 0, paceHours: 0 })
  })

  it('bỏ qua mục sai dạng', () => {
    const h = studyHours({ [localDayKey(NOW)]: { kind: 'x' }, junk: 1 }, NOW)
    expect(h.minutes).toBe(0)
    expect(h.days).toBe(0)
  })
})

describe('weakestForStore', () => {
  it('chưa đội Mũ → null, kể cả đã có thẻ SRS', () => {
    const s = gradeCard(store(), 'a', 'good', NOW)
    expect(weakestForStore(s)).toBeNull()
  })
  it('đã đội Mũ → kỹ năng có khoảng cách lớn nhất', () => {
    const { store: s } = recordAttempt(store(), mid, NOW, 's1-t1-w1')
    expect(weakestForStore(s)).toBe('vocabulary')
  })
})

describe('prioritizeSections — lý thuyết trước', () => {
  const sec = (id: SectionId, tags: SkillTag[]) => ({ id, tags })

  it('THEORY_SECTION_IDS = phát âm, ngữ pháp', () => {
    expect(THEORY_SECTION_IDS).toEqual(['pronunciation', 'grammar'])
  })

  it('s1-t1-w1, yếu nhất vocabulary → thứ tự giữ nguyên, đoạn từ vựng "Ưu tiên"', () => {
    const lesson = getLesson('s1-t1-w1')!
    const ordered = prioritizeSections(lesson.sections, 'vocabulary')
    expect(ordered.map((o) => o.section.id)).toEqual(lesson.sections.map((x) => x.id))
    expect(ordered.filter((o) => o.priority).map((o) => o.section.id)).toEqual(['vocabulary'])
  })

  it('bài có checkpoint, yếu nhất vocabulary → từ vựng lên trước checkpoint nhưng vẫn sau lý thuyết', () => {
    // Đoạn checkpoint mang tag Part (như chặng 2–3), không có tag từ vựng.
    const sections = [
      sec('pronunciation', ['pronunciation', 'listening']),
      sec('grammar', ['grammar']),
      sec('checkpoint', ['listening', 'reading']),
      sec('vocabulary', ['vocabulary']),
      sec('entertainment', ['listening', 'vocabulary']),
    ]
    const ordered = prioritizeSections(sections, 'vocabulary')
    expect(ordered.map((o) => o.section.id)).toEqual(['pronunciation', 'grammar', 'vocabulary', 'checkpoint', 'entertainment'])
    expect(ordered.filter((o) => o.priority).map((o) => o.section.id)).toEqual(['vocabulary'])
  })

  it('bài checkpoint thật (O.W.L. 1), yếu nhất vocabulary → lý thuyết vẫn đứng đầu, đoạn luyện ưu tiên ngay sau', () => {
    const lesson = allLessons().find((l) => l.sections.some((x) => x.id === 'checkpoint') && l.stageId === 's1')
    expect(lesson).toBeDefined()
    if (!lesson) return
    const result = prioritizeSections(lesson.sections, 'vocabulary')
    const ordered = result.map((o) => o.section.id)
    const theory = lesson.sections.filter((x) => THEORY_SECTION_IDS.includes(x.id)).map((x) => x.id)
    expect(ordered.slice(0, theory.length)).toEqual(theory)
    expect(ordered.indexOf('vocabulary')).toBeGreaterThan(Math.max(...theory.map((id) => ordered.indexOf(id))))
    // Checkpoint O.W.L. 1 mang cả 5 tag → cũng "Ưu tiên" và vẫn đứng trước từ vựng.
    const priority = result.filter((o) => o.priority).map((o) => o.section.id)
    expect(priority).toEqual(expect.arrayContaining(['checkpoint', 'vocabulary']))
    expect(ordered.indexOf('checkpoint')).toBeLessThan(ordered.indexOf('vocabulary'))
    // Chưa có kỹ năng yếu nhất → giữ nguyên thứ tự dữ liệu, không đoạn nào "Ưu tiên".
    const plain = prioritizeSections(lesson.sections, null)
    expect(plain.map((o) => o.section.id)).toEqual(lesson.sections.map((x) => x.id))
    expect(plain.some((o) => o.priority)).toBe(false)
  })

  it('đoạn luyện đứng trước lý thuyết trong dữ liệu → lý thuyết vẫn lên đầu', () => {
    const sections = [sec('vocabulary', ['vocabulary']), sec('grammar', ['grammar']), sec('pronunciation', ['pronunciation'])]
    expect(prioritizeSections(sections, 'vocabulary').map((o) => o.section.id)).toEqual([
      'grammar',
      'pronunciation',
      'vocabulary',
    ])
  })

  it('không bao giờ ưu tiên đoạn giải trí', () => {
    for (const weakest of ['listening', 'reading', 'grammar', 'vocabulary', 'pronunciation'] as const) {
      for (const lesson of allLessons()) {
        const fun = prioritizeSections(lesson.sections, weakest).find((o) => o.section.id === 'entertainment')
        expect(fun?.priority ?? false).toBe(false)
      }
    }
  })
})

describe('prioritizeSections — đoạn giải trí', () => {
  it('kỹ năng yếu nhất là listening → đoạn giải trí không được ưu tiên, giữ nguyên chỗ', () => {
    const lesson = getLesson('s1-t1-w1')!
    const ordered = prioritizeSections(lesson.sections, 'listening')
    const fun = ordered.find((o) => o.section.id === 'entertainment')!
    expect(fun.priority).toBe(false)
    expect(ordered.at(-1)!.section.id).toBe('entertainment')
  })
})

describe('recordPlacementAttempt', () => {
  it('lần đầu: toàn 0 → s1-t1-w1; mid → s2-t5-w1', () => {
    expect(readPlacement(recordPlacementAttempt(store(), zero, NOW).store).startLessonId).toBe('s1-t1-w1')
    expect(readPlacement(recordPlacementAttempt(store(), mid, NOW).store).startLessonId).toBe('s2-t5-w1')
  })
})

describe('decideHouseSave — Mũ 4 câu (story 22)', () => {
  const allAnswers = Object.fromEntries(HOUSE_QUESTIONS.map((q) => [q.id, 'code' as const]))

  it('đủ 4 câu → lưu Nhà, không hỏi điểm ETS', () => {
    expect(decideHouseSave(allAnswers)).toEqual({ ok: true, house: 'ravenclaw' })
    const mixed = { 'free-time': 'film', 'before-sleep': 'film', 'learn-from': 'music', weekend: 'news' } as const
    expect(decideHouseSave(mixed)).toEqual({ ok: true, house: 'gryffindor' })
  })

  it('thiếu câu → lỗi house "còn n câu", không lưu', () => {
    expect(decideHouseSave({})).toEqual({
      ok: false,
      errors: { house: 'Trả lời đủ 4 câu hỏi để Mũ chọn Nhà (còn 4 câu).' },
    })
    const three = Object.fromEntries(HOUSE_QUESTIONS.slice(0, 3).map((q) => [q.id, 'music' as const]))
    expect(decideHouseSave(three)).toEqual({
      ok: false,
      errors: { house: 'Trả lời đủ 4 câu hỏi để Mũ chọn Nhà (còn 1 câu).' },
    })
  })

  it('id câu lạ hoặc đáp án lạ không được tính', () => {
    const odd = { ...Object.fromEntries(HOUSE_QUESTIONS.slice(0, 3).map((q) => [q.id, 'code' as const])), other: 'code' as const }
    expect(decideHouseSave(odd).ok).toBe(false)
    const bad = { ...allAnswers, weekend: 'chess' } as unknown as Record<string, 'code'>
    expect(decideHouseSave(bad).ok).toBe(false)
  })
})

describe('lessonId dạng fNN (buổi Sân ga, story 21)', () => {
  it('studyHours cộng 25 phút cho buổi f03; skillGaps không lỗi', () => {
    const s = recordSession(store(), 'full', NOW, { lessonId: 'f03' })
    const days = (s.data.sessions as { days: Record<string, unknown> }).days
    expect(studyHours(days, NOW).minutes).toBe(25)
    expect(() => skillGaps(s)).not.toThrow()
    expect(skillGaps(s).stage.number).toBe(1)
  })
})
