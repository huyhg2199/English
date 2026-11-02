import { describe, expect, it } from 'vitest'

import { allLessons } from '@/data/roadmap'
import { applyStartLesson } from '@/lib/placement'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import { recordSession, sessionLesson } from '@/lib/sessions'
import type { Store } from '@/lib/storage'

import { addDays, currentLessonId, daysBetween, formatDate, planConsequence, planFor, planStatusLabel, roadmapStartDate } from './index'

const START = new Date(2026, 10, 2) // 02/11/2026, giờ máy
const at = (d: number, h = 9) => new Date(2026, 10, d, h)
const empty = (): Store => ({ schemaVersion: 9, data: {} })
const LESSONS = allLessons()
const BASELINE = addDays(START, 7 * LESSONS.length)

function started(): Store {
  return recordSession(empty(), 'full', at(2, 20))
}

function complete(store: Store, n: number, from = 0): Store {
  let s = store
  for (const l of LESSONS.slice(from, from + n)) s = setLessonCompleted(s, l.id, true, START)
  return s
}

describe('roadmapStartDate', () => {
  it('ngày sớm nhất trong nhật ký', () => {
    const s = recordSession(started(), 'lazy', at(10))
    expect(roadmapStartDate(s, at(20))).toEqual(START)
  })
  it('xếp lớp áp dụng 3 tuần sau buổi đầu → bắt đầu từ ngày áp dụng, đúng hạn', () => {
    const s = applyStartLesson(started(), 's1-t2-w1', at(23, 10))
    expect(roadmapStartDate(s, at(25))).toEqual(new Date(2026, 10, 23))
    const plan = planFor(s, at(25))
    expect(plan.weeksLate).toBe(0)
    expect(plan.currentLessonId).toBe('s1-t2-w1')
  })
  it('chưa học buổi nào → hôm nay (nửa đêm)', () => {
    expect(roadmapStartDate(empty(), at(5, 15))).toEqual(new Date(2026, 10, 5))
  })
})

describe('planFor — I/O Matrix', () => {
  it('đúng hạn: bắt đầu 02/11, hôm nay 05/11, bài 1 chưa xong', () => {
    const plan = planFor(started(), at(5))
    expect(plan.weeksLate).toBe(0)
    expect(plan.baselineGoal).toEqual(BASELINE)
    expect(plan.projectedGoal).toEqual(BASELINE)
    expect(plan.currentLessonId).toBe(LESSONS[0].id)
    expect(plan.currentDue).toEqual(new Date(2026, 10, 9))
    expect(planStatusLabel(plan)).toBe('đúng hạn')
  })

  it('mốc gốc = hạn bài cuối s3-t12-w4', () => {
    expect(LESSONS[LESSONS.length - 1].id).toBe('s3-t12-w4')
    expect(daysBetween(START, planFor(started(), at(5)).baselineGoal)).toBe(7 * LESSONS.length)
  })

  it('quá hạn đúng 7 ngày (16/11) → chưa trễ', () => {
    expect(planFor(started(), at(16, 23)).weeksLate).toBe(0)
  })

  it('trễ 1 tuần: hôm nay 17/11, bài 1 chưa xong', () => {
    const plan = planFor(started(), at(17))
    expect(plan.weeksLate).toBe(1)
    expect(plan.projectedGoal).toEqual(addDays(BASELINE, 7))
    expect(planStatusLabel(plan)).toBe('lùi 1 tuần')
    // Mốc gốc 04/10/2027 → 11/10/2027: cùng tháng.
    expect(planConsequence(plan)).toContain('vẫn trong tháng 10/2027, chỉ lùi 1 tuần')
    expect(planConsequence(plan)).toContain('không mất tiến độ')
    expect(planConsequence(plan)).not.toContain('dời sang')
  })

  it('lùi sang tháng khác → "dời sang tháng …"', () => {
    const plan = planFor(started(), new Date(2026, 11, 14))
    expect(plan.weeksLate).toBe(4)
    expect(formatDate(plan.projectedGoal)).toBe('01/11/2027')
    expect(planConsequence(plan)).toContain('dời sang tháng 11/2027')
  })

  it('trễ 2 tuần: bài 1 chưa xong tới 30/11', () => {
    const plan = planFor(started(), at(30))
    expect(plan.weeksLate).toBe(2)
    expect(plan.projectedGoal).toEqual(addDays(BASELINE, 14))
  })

  it('học bù: xong bài 1 thì bài 2 (hạn 16/11) đo trễ, hôm nay 30/11 → 1 tuần', () => {
    expect(planFor(complete(started(), 1), at(30)).weeksLate).toBe(1)
  })

  it('học nhanh: xong 3 bài trong tuần đầu → đúng hạn, không sớm hơn mốc gốc', () => {
    const plan = planFor(complete(started(), 3), at(8))
    expect(plan.weeksLate).toBe(0)
    expect(plan.projectedGoal).toEqual(BASELINE)
    expect(plan.currentLessonId).toBe(LESSONS[3].id)
    expect(plan.remaining).toBe(LESSONS.length - 3)
  })

  it('học nhanh rồi nghỉ: xong 3 bài, hôm nay 30/11 (hạn dồn của bài 4 là 30/11) → đúng hạn', () => {
    expect(planFor(complete(started(), 3), at(30)).weeksLate).toBe(0)
  })

  it('bắt đầu chặng 2: lịch gốc tính từ s2-t5-w1', () => {
    const s = applyStartLesson(started(), 's2-t5-w1', START)
    const plan = planFor(s, at(5))
    const route = LESSONS.length - LESSONS.findIndex((l) => l.id === 's2-t5-w1')
    expect(plan.currentLessonId).toBe('s2-t5-w1')
    expect(plan.baselineGoal).toEqual(addDays(START, 7 * route))
    expect(plan.remaining).toBe(route)
    expect(plan.weeksLate).toBe(0)
  })

  it('chưa học buổi nào → bắt đầu hôm nay, đúng hạn', () => {
    const plan = planFor(empty(), at(20, 8))
    expect(plan.startDate).toEqual(new Date(2026, 10, 20))
    expect(plan.weeksLate).toBe(0)
    expect(formatDate(plan.projectedGoal)).toBe(formatDate(addDays(new Date(2026, 10, 20), 7 * LESSONS.length)))
  })

  it('xong lộ trình → done, không trễ', () => {
    const plan = planFor(complete(started(), LESSONS.length), new Date(2030, 0, 1))
    expect(plan).toMatchObject({ done: true, weeksLate: 0, currentLessonId: null, remaining: 0 })
    expect(planConsequence(plan)).toContain('Đã xong lộ trình')
  })
})

describe('currentLessonId', () => {
  it('khớp bài của buổi (Hôm nay / Lộ trình) cho người đã xếp lớp và xong lộ trình từ bài bắt đầu', () => {
    const last = LESSONS[LESSONS.length - 1].id
    const s = setLessonCompleted(applyStartLesson(started(), last, START), last, true, START)
    expect(currentLessonId(s)).toBe(sessionLesson(s)!.lesson.id)
    expect(currentLessonId(s)).toBe(LESSONS[0].id)
    const plan = planFor(s, at(5))
    expect(plan.done).toBe(true)
    expect(plan.currentLessonId).toBe(LESSONS[0].id)
  })
})

describe('formatDate', () => {
  it('dd/mm/yyyy', () => {
    expect(formatDate(new Date(2028, 1, 3))).toBe('03/02/2028')
  })
})
