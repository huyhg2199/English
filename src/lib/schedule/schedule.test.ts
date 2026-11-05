import { describe, expect, it } from 'vitest'

import { allLessons } from '@/data/roadmap'
import { ROW_IDS } from '@/data/foundation'
import { markRowTested, resumeFoundation, skipFoundation } from '@/lib/foundation'
import { applyStartLesson } from '@/lib/placement'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import { recordSession, sessionLesson } from '@/lib/sessions'
import type { Store } from '@/lib/storage'

import {
  addDays,
  currentLessonId,
  daysBetween,
  formatDate,
  planConsequence,
  planFor,
  planStatusLabel,
  roadmapStartDate,
  type ActivePlan,
} from './index'

const START = new Date(2026, 10, 2) // 02/11/2026, giờ máy
const at = (d: number, h = 9) => new Date(2026, 10, d, h)
const empty = (): Store => ({ schemaVersion: 9, data: {} })
const LESSONS = allLessons()
const BASELINE = addDays(START, 7 * LESSONS.length)

/** Bỏ qua Sân ga và học buổi đầu ngày 02/11: lịch bắt đầu 02/11 (như các ca của story 11). */
function started(): Store {
  return recordSession(skipFoundation(empty(), at(2, 20)), 'full', at(2, 20))
}

/** `planFor` của lịch đã bắt đầu (ném lỗi nếu `not-started`). */
function active(store: Store, now: Date): ActivePlan {
  const plan = planFor(store, now)
  if (plan.status === 'not-started') throw new Error('lịch chưa bắt đầu')
  return plan
}

/** Qua bức tường: cả 4 hàng đạt kiểm tra lúc `now`. */
function passWall(store: Store, now: Date): Store {
  return ROW_IDS.reduce((s, r) => markRowTested(s, r, 8, 8, now), store)
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
    const plan = active(s, at(25))
    expect(plan.weeksLate).toBe(0)
    expect(plan.currentLessonId).toBe('s1-t2-w1')
  })
  it('chưa qua / bỏ qua Sân ga → null (kể cả đã có buổi học)', () => {
    expect(roadmapStartDate(empty(), at(5, 15))).toBeNull()
    expect(roadmapStartDate(recordSession(empty(), 'full', at(2, 20)), at(5, 15))).toBeNull()
  })
})

describe('planFor — I/O Matrix', () => {
  it('đúng hạn: bắt đầu 02/11, hôm nay 05/11, bài 1 chưa xong', () => {
    const plan = active(started(), at(5))
    expect(plan.weeksLate).toBe(0)
    expect(plan.baselineGoal).toEqual(BASELINE)
    expect(plan.projectedGoal).toEqual(BASELINE)
    expect(plan.currentLessonId).toBe(LESSONS[0].id)
    expect(plan.currentDue).toEqual(new Date(2026, 10, 9))
    expect(planStatusLabel(plan)).toBe('đúng hạn')
  })

  it('mốc gốc = hạn bài cuối s3-t12-w4', () => {
    expect(LESSONS[LESSONS.length - 1].id).toBe('s3-t12-w4')
    expect(daysBetween(START, active(started(), at(5)).baselineGoal)).toBe(7 * LESSONS.length)
  })

  it('quá hạn đúng 7 ngày (16/11) → chưa trễ', () => {
    expect(active(started(), at(16, 23)).weeksLate).toBe(0)
  })

  it('trễ 1 tuần: hôm nay 17/11, bài 1 chưa xong', () => {
    const plan = active(started(), at(17))
    expect(plan.weeksLate).toBe(1)
    expect(plan.projectedGoal).toEqual(addDays(BASELINE, 7))
    expect(planStatusLabel(plan)).toBe('lùi 1 tuần')
    // Mốc gốc 04/10/2027 → 11/10/2027: cùng tháng.
    expect(planConsequence(plan)).toContain('vẫn trong tháng 10/2027, chỉ lùi 1 tuần')
    expect(planConsequence(plan)).toContain('không mất tiến độ')
    expect(planConsequence(plan)).not.toContain('dời sang')
  })

  it('lùi sang tháng khác → "dời sang tháng …"', () => {
    const plan = active(started(), new Date(2026, 11, 14))
    expect(plan.weeksLate).toBe(4)
    expect(formatDate(plan.projectedGoal)).toBe('01/11/2027')
    expect(planConsequence(plan)).toContain('dời sang tháng 11/2027')
  })

  it('trễ 2 tuần: bài 1 chưa xong tới 30/11', () => {
    const plan = active(started(), at(30))
    expect(plan.weeksLate).toBe(2)
    expect(plan.projectedGoal).toEqual(addDays(BASELINE, 14))
  })

  it('học bù: xong bài 1 thì bài 2 (hạn 16/11) đo trễ, hôm nay 30/11 → 1 tuần', () => {
    expect(active(complete(started(), 1), at(30)).weeksLate).toBe(1)
  })

  it('học nhanh: xong 3 bài trong tuần đầu → đúng hạn, không sớm hơn mốc gốc', () => {
    const plan = active(complete(started(), 3), at(8))
    expect(plan.weeksLate).toBe(0)
    expect(plan.projectedGoal).toEqual(BASELINE)
    expect(plan.currentLessonId).toBe(LESSONS[3].id)
    expect(plan.remaining).toBe(LESSONS.length - 3)
  })

  it('học nhanh rồi nghỉ: xong 3 bài, hôm nay 30/11 (hạn dồn của bài 4 là 30/11) → đúng hạn', () => {
    expect(active(complete(started(), 3), at(30)).weeksLate).toBe(0)
  })

  it('bắt đầu chặng 2: lịch gốc tính từ s2-t5-w1', () => {
    const s = applyStartLesson(started(), 's2-t5-w1', START)
    const plan = active(s, at(5))
    const route = LESSONS.length - LESSONS.findIndex((l) => l.id === 's2-t5-w1')
    expect(plan.currentLessonId).toBe('s2-t5-w1')
    expect(plan.baselineGoal).toEqual(addDays(START, 7 * route))
    expect(plan.remaining).toBe(route)
    expect(plan.weeksLate).toBe(0)
  })

  it('bỏ qua Sân ga hôm nay, chưa học buổi nào → bắt đầu hôm nay, đúng hạn', () => {
    const plan = active(skipFoundation(empty(), at(20, 8)), at(20, 8))
    expect(plan.status).toBe('running')
    expect(plan.startDate).toEqual(new Date(2026, 10, 20))
    expect(plan.weeksLate).toBe(0)
    expect(formatDate(plan.projectedGoal)).toBe(formatDate(addDays(new Date(2026, 10, 20), 7 * LESSONS.length)))
  })

  it('xong lộ trình → done, không trễ', () => {
    const plan = active(complete(started(), LESSONS.length), new Date(2030, 0, 1))
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
    const plan = active(s, at(5))
    expect(plan.done).toBe(true)
    expect(plan.currentLessonId).toBe(LESSONS[0].id)
  })
})

describe('formatDate', () => {
  it('dd/mm/yyyy', () => {
    expect(formatDate(new Date(2028, 1, 3))).toBe('03/02/2028')
  })
})

describe('planFor — lịch theo Sân ga 9¾ (story 22)', () => {
  it('Lịch chưa bắt đầu: đang ở Sân ga, chưa từng bỏ qua, đã học 10 buổi → not-started', () => {
    let s = empty()
    for (let d = 1; d <= 10; d++) s = recordSession(s, 'full', at(d, 20), { lessonId: 'f01' })
    expect(planFor(s, at(11))).toEqual({ status: 'not-started' })
    expect(roadmapStartDate(s, at(11))).toBeNull()
  })

  it('Không lùi sau 3 tuần Sân ga: buổi ngày 1–21, qua tường ngày 22 → bắt đầu 22/11, không trễ', () => {
    let s = empty()
    for (let d = 1; d <= 21; d++) s = recordSession(s, 'full', at(d, 20), { lessonId: 'f01' })
    expect(planFor(s, at(21, 22))).toEqual({ status: 'not-started' })
    s = passWall(s, at(22, 10))
    const day22 = new Date(2026, 10, 22)
    const plan = active(s, at(22, 12))
    expect(plan.status).toBe('running')
    expect(plan.startDate).toEqual(day22)
    expect(plan.weeksLate).toBe(0)
    expect(LESSONS).toHaveLength(48)
    expect(plan.baselineGoal).toEqual(addDays(day22, 7 * 48))
    expect(planStatusLabel(plan)).toBe('đúng hạn')
    expect(active(s, at(28)).weeksLate).toBe(0)
  })

  it('Bỏ qua rồi quay lại: bỏ qua 03/11, quay lại 10/11 → 12/11 tạm dừng, bắt đầu 05/11; bỏ qua lại 40 → running', () => {
    const skipped = skipFoundation(empty(), at(3))
    const resumed = resumeFoundation(skipped, at(10))
    const atResume = active(resumed, at(10, 12))

    const day12 = active(resumed, at(12))
    expect(day12.status).toBe('paused')
    expect(day12.startDate).toEqual(new Date(2026, 10, 5))

    const day40 = active(resumed, at(40))
    expect(day40.status).toBe('paused')
    expect(day40.weeksLate).toBe(atResume.weeksLate)
    expect(day40.projectedGoal).toEqual(addDays(atResume.projectedGoal, 30))

    const again = skipFoundation(resumed, at(40))
    const after = active(again, at(40, 12))
    expect(after.status).toBe('running')
    expect(after.startDate).toEqual(new Date(2026, 10, 33))
    expect(after.weeksLate).toBe(atResume.weeksLate)
  })

  it('tạm dừng không bao giờ ra "lùi": quay lại khi đã trễ 1 tuần, ở Sân ga 2 tháng → số tuần trễ đứng yên', () => {
    const resumed = resumeFoundation(skipFoundation(empty(), at(3)), at(20))
    const atResume = active(resumed, at(20, 12))
    expect(atResume.weeksLate).toBe(1)
    for (const d of [21, 40, 80]) {
      const plan = active(resumed, at(d))
      expect(plan.status).toBe('paused')
      expect(plan.weeksLate).toBe(1)
      expect(planStatusLabel(plan)).toBe('tạm dừng')
      expect(planStatusLabel(plan)).not.toMatch(/lùi|trễ|trượt/)
      expect(planConsequence(plan)).not.toMatch(/lùi|trễ|trượt/)
    }
    // Bỏ qua lại sau 60 ngày: thời gian quay lại không thành trễ.
    expect(active(skipFoundation(resumed, at(80)), at(80, 12)).weeksLate).toBe(1)
  })

  it('Bỏ qua rồi qua tường (không bấm Quay lại): bỏ qua 03/11, qua tường 20/11 → bắt đầu 03/11', () => {
    const s = passWall(skipFoundation(empty(), at(3)), at(20))
    const plan = active(s, at(21))
    expect(plan.status).toBe('running')
    expect(plan.startDate).toEqual(new Date(2026, 10, 3))
  })

  it('ETS áp dụng muộn: bỏ qua 02/11, áp dụng xếp lớp 23/11 → bắt đầu 23/11, không trễ', () => {
    const s = applyStartLesson(skipFoundation(empty(), at(2)), 's1-t2-w1', at(23, 10))
    const plan = active(s, at(25))
    expect(plan.startDate).toEqual(new Date(2026, 10, 23))
    expect(plan.weeksLate).toBe(0)
  })

  it('ETS áp dụng muộn rồi quay lại Sân ga: thời gian quay lại không thành trễ (ngày áp dụng trượt theo)', () => {
    const applied = applyStartLesson(skipFoundation(empty(), at(2)), 's1-t2-w1', at(23, 10))
    const resumed = resumeFoundation(applied, at(30))
    const atResume = active(resumed, at(30, 12))
    expect(atResume.startDate).toEqual(new Date(2026, 10, 23))
    expect(atResume.weeksLate).toBe(0)
    // Ở Sân ga tới 40/11: ngày bắt đầu trượt 10 ngày, số tuần trễ đứng yên.
    const day40 = active(resumed, at(40))
    expect(day40.status).toBe('paused')
    expect(day40.startDate).toEqual(new Date(2026, 10, 33))
    expect(day40.weeksLate).toBe(0)
    // Bỏ qua lại 40/11: vẫn không trễ, không "lùi".
    const after = active(skipFoundation(resumed, at(40)), at(40, 12))
    expect(after.status).toBe('running')
    expect(after.startDate).toEqual(new Date(2026, 10, 33))
    expect(after.weeksLate).toBe(0)
    expect(planStatusLabel(after)).toBe('đúng hạn')
  })
})
