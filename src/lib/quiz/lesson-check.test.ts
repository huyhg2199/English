import { describe, expect, it } from 'vitest'

import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  bestLessonCheck,
  checkPassed,
  checkPercent,
  LESSON_CHECK_PASS_PERCENT,
  lessonCheckPassedSince,
  lessonCheckVerdict,
  roadmapCheckLabel,
} from './lesson-check'
import { recordAttempt, type AttemptKind } from './quiz'

const DAY = 24 * 60 * 60 * 1000
const T0 = new Date('2026-12-01T10:00:00.000Z')
const at = (d: number) => new Date(T0.getTime() + d * DAY)
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })

let seq = 0
/** Ghi một lần làm `quizId` với `score`/`total` (câu id giả không tra được nên không vào Sổ lỗi). */
function attempt(
  s: Store,
  quizId: string,
  score: number,
  total: number,
  when: Date,
  kind?: AttemptKind,
): Store {
  const answers = Array.from({ length: total }, (_, i) => ({ questionId: `x-${i}`, chosen: 'a', correct: i < score }))
  seq++
  return recordAttempt(
    s,
    { id: `${quizId}-${seq}`, quizId, seed: 's', startedAt: when, answers, ...(kind ? { kind } : {}) },
    when,
    () => undefined,
  )
}

describe('ngưỡng kiểm tra bài (story 41)', () => {
  it('70%: 4/5, 7/10 đạt; 3/5, 2/4 chưa; 3/4 đạt; 0/0 không đạt', () => {
    expect(LESSON_CHECK_PASS_PERCENT).toBe(70)
    expect(checkPassed(4, 5)).toBe(true)
    expect(checkPassed(3, 5)).toBe(false)
    expect(checkPassed(3, 4)).toBe(true)
    expect(checkPassed(2, 4)).toBe(false)
    expect(checkPassed(7, 10)).toBe(true)
    expect(checkPassed(6, 10)).toBe(false)
    expect(checkPassed(0, 0)).toBe(false)
  })

  it('% làm tròn xuống; total 0 → 0', () => {
    expect(checkPercent(4, 5)).toBe(80)
    expect(checkPercent(2, 3)).toBe(66)
    expect(checkPercent(1, 3)).toBe(33)
    expect(checkPercent(5, 5)).toBe(100)
    expect(checkPercent(0, 0)).toBe(0)
  })
})

describe('bestLessonCheck / lessonCheckPassedSince', () => {
  const W1 = 's1-t1-w1'
  const QW1 = `lesson-${W1}`

  it('chưa làm → null; lấy lần tốt nhất; bằng nhau lấy lần mới hơn (cùng kết quả)', () => {
    expect(bestLessonCheck(empty(), W1)).toBeNull()
    let s = attempt(empty(), QW1, 2, 5, at(1))
    s = attempt(s, QW1, 4, 5, at(2))
    s = attempt(s, QW1, 3, 5, at(3))
    expect(bestLessonCheck(s, W1)).toEqual({ score: 4, total: 5, percent: 80, passed: true })
    expect(bestLessonCheck(attempt(empty(), QW1, 3, 5, at(1)), W1)).toEqual({ score: 3, total: 5, percent: 60, passed: false })
  })

  it('bỏ lần comeback / owl / mini test / bài khác / lần hỏng', () => {
    let s = attempt(empty(), QW1, 1, 5, at(1))
    s = attempt(s, QW1, 5, 5, at(2), 'comeback')
    s = attempt(s, QW1, 5, 5, at(3), 'owl')
    s = attempt(s, 'mini-t1', 10, 10, at(4))
    s = attempt(s, 'lesson-s1-t1-w2', 5, 5, at(5))
    const quizzes = s.data.quizzes as { attempts: Record<string, unknown> }
    s = {
      ...s,
      data: {
        ...s.data,
        quizzes: {
          attempts: {
            ...quizzes.attempts,
            hong: { quizId: QW1, score: 5, total: 5 },
            la: { ...(Object.values(quizzes.attempts)[0] as object), kind: 'tuong-lai', score: 5, total: 5 },
          },
        },
      },
    }
    expect(bestLessonCheck(s, W1)).toEqual({ score: 1, total: 5, percent: 20, passed: false })
    expect(lessonCheckPassedSince(s, W1, at(0).getTime())).toBe(false)
  })

  it('lessonCheckPassedSince: chỉ lần đạt xong sau mốc (mốc nghiêm ngặt)', () => {
    let s = attempt(empty(), QW1, 4, 5, at(2))
    s = attempt(s, QW1, 2, 5, at(5))
    expect(lessonCheckPassedSince(s, W1, at(1).getTime())).toBe(true)
    expect(lessonCheckPassedSince(s, W1, at(2).getTime())).toBe(false)
    expect(lessonCheckPassedSince(s, W1, at(2).getTime() - 1)).toBe(true)
    expect(lessonCheckPassedSince(s, W1, at(3).getTime())).toBe(false)
  })
})

describe('roadmapCheckLabel — I/O Matrix "Nhãn Lộ trình", "Lần làm khác loại"', () => {
  it('đã qua best 4/5 → đạt 80% (passed); học tiếp chưa làm → chưa kiểm tra; chưa học từng làm 2/5 → đạt 40%', () => {
    let s = attempt(empty(), 'lesson-s1-t1-w1', 4, 5, at(1))
    s = attempt(s, 'lesson-s1-t1-w1', 2, 5, at(2))
    s = attempt(s, 'lesson-s1-t2-w1', 2, 5, at(3))
    expect(roadmapCheckLabel(s, 's1-t1-w1', 'done')).toEqual({ text: 'đạt 80%', passed: true })
    expect(roadmapCheckLabel(s, 's1-t1-w2', 'next')).toEqual({ text: 'chưa kiểm tra', passed: false })
    expect(roadmapCheckLabel(s, 's1-t2-w1', 'locked')).toEqual({ text: 'đạt 40%', passed: false })
  })

  it('chưa học / đã bỏ qua mà chưa làm → null; bài không có quiz bài (Tết, chặng 2) → null', () => {
    expect(roadmapCheckLabel(empty(), 's1-t2-w2', 'locked')).toBeNull()
    expect(roadmapCheckLabel(empty(), 's1-t2-w2', 'skipped')).toBeNull()
    expect(roadmapCheckLabel(empty(), 's1-t1-w4', 'done')).toEqual({ text: 'chưa kiểm tra', passed: false })
    expect(roadmapCheckLabel(empty(), 's1-t4-w2', 'done')).toBeNull()
    expect(roadmapCheckLabel(empty(), 's2-t5-w1', 'next')).toBeNull()
  })

  it('chỉ có mini test, test quay lại, O.W.L. → nhãn không đổi', () => {
    let s = attempt(empty(), 'mini-t1', 10, 10, at(1))
    s = attempt(s, 'comeback', 5, 5, at(2), 'comeback')
    s = attempt(s, 'owl-1', 20, 20, at(3), 'owl')
    s = attempt(s, 'lesson-s1-t1-w3', 5, 5, at(4), 'comeback')
    expect(roadmapCheckLabel(s, 's1-t1-w3', 'done')).toEqual({ text: 'chưa kiểm tra', passed: false })
    expect(roadmapCheckLabel(s, 's1-t1-w3', 'next')).toEqual({ text: 'chưa kiểm tra', passed: false })
    expect(roadmapCheckLabel(s, 's1-t1-w3', 'locked')).toBeNull()
  })
})

describe('lessonCheckVerdict — I/O Matrix "Đạt", "Chưa đạt", "Bài đã xong"', () => {
  it('đạt, bài chưa xong → chỉ mời "Đánh dấu bài xong" (không tự đánh dấu), không gợi ý ôn', () => {
    expect(lessonCheckVerdict(true, false, false)).toEqual({
      markButton: 'primary',
      markedLine: false,
      reviewLink: false,
      nextSessionHint: false,
    })
  })

  it('chưa đạt, bài chưa xong → gợi ý ôn đoạn + "buổi sau vẫn là bài này" + nút phụ "Vẫn đánh dấu xong"', () => {
    expect(lessonCheckVerdict(false, false, false)).toEqual({
      markButton: 'fallback',
      markedLine: false,
      reviewLink: true,
      nextSessionHint: true,
    })
  })

  it('bài đã xong → không có nút đánh dấu nào; chưa đạt chỉ gợi ý ôn đoạn, không câu "buổi sau"', () => {
    expect(lessonCheckVerdict(true, true, false)).toEqual({
      markButton: null,
      markedLine: false,
      reviewLink: false,
      nextSessionHint: false,
    })
    expect(lessonCheckVerdict(false, true, false)).toEqual({
      markButton: null,
      markedLine: false,
      reviewLink: true,
      nextSessionHint: false,
    })
  })

  it('vừa bấm đánh dấu → dòng "Đã đánh dấu xong bài…", hết nút đánh dấu (chưa đạt vẫn giữ gợi ý ôn)', () => {
    for (const done of [false, true]) {
      expect(lessonCheckVerdict(true, done, true)).toEqual({
        markButton: null,
        markedLine: true,
        reviewLink: false,
        nextSessionHint: false,
      })
      expect(lessonCheckVerdict(false, done, true)).toEqual({
        markButton: null,
        markedLine: true,
        reviewLink: true,
        nextSessionHint: false,
      })
    }
  })
})
