import { describe, expect, it } from 'vitest'

import { BRICK_IDS, type BrickId } from '@/data/foundation'
import {
  FOUNDATION_QUESTIONS,
  foundationQuiz,
  getQuestion,
  getQuiz,
  MIN_QUIZ_QUESTIONS,
  QUESTION_BANK,
  QUIZZES,
  type QuizDef,
} from '@/data/questions'

import { missingBricks, pickQuiz, planQuiz, quizButtonCount, type IsBrickTaught } from './index'

const SEEDS = Array.from({ length: 20 }, (_, i) => `seed-${i}`)
const OPTS = [{ canSpeak: true }, { canSpeak: false }]
const quiz = (id: string): QuizDef => getQuiz(id)!

const all: IsBrickTaught = () => true
const none: IsBrickTaught = () => false
/** Đã xong các viên trong danh sách. */
const taught =
  (...ids: BrickId[]): IsBrickTaught =>
  (id) =>
    ids.includes(id)
const upTo = (last: BrickId): BrickId[] => BRICK_IDS.slice(0, BRICK_IDS.indexOf(last) + 1)
const except = (...ids: BrickId[]): IsBrickTaught => taught(...BRICK_IDS.filter((id) => !ids.includes(id)))

describe('missingBricks', () => {
  it('trả viên chưa dạy theo thứ tự F01 → F18, bỏ khái niệm bài T1', () => {
    const w4_08 = getQuestion('q-s1-t1-w4-08')!
    expect(missingBricks(w4_08, none)).toEqual(['F06', 'F09', 'F10', 'F18'])
    expect(missingBricks(w4_08, all)).toEqual([])
    expect(missingBricks(getQuestion('q-s1-t1-w1-04')!, taught(...upTo('F13')))).toEqual(['F14'])
  })

  it('câu không khai báo requires không thiếu gì', () => {
    const t2 = QUESTION_BANK.find((q) => q.lessonId === 's1-t2-w1')!
    expect(missingBricks(t2, none)).toEqual([])
  })
})

describe('planQuiz', () => {
  it('đủ nền (đã qua / bỏ qua Sân ga): đề giống hệt pickQuiz cũ, không bỏ câu nào (mọi quiz, 20 seed, có/không TTS)', () => {
    for (const def of QUIZZES) {
      for (const seed of SEEDS) {
        for (const opts of OPTS) {
          const plan = planQuiz(QUESTION_BANK, def, seed, opts, all)
          expect(plan, `${def.id} ${seed}`).toEqual({
            status: 'run',
            questions: pickQuiz(QUESTION_BANK, def, seed, opts),
            skipped: 0,
            missingBrickIds: [],
          })
        }
      }
    }
  })

  it('thiếu ít (thiếu F18): quiz W2 bỏ q-s1-t1-w2-04, chạy 5 câu từ 5 câu còn lại', () => {
    for (const seed of SEEDS) {
      const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t1-w2'), seed, { canSpeak: true }, except('F18'))
      expect(plan.status).toBe('run')
      if (plan.status !== 'run') continue
      expect(plan.skipped).toBe(1)
      expect(plan.missingBrickIds).toEqual(['F18'])
      expect(plan.questions).toHaveLength(5)
      expect(plan.questions.map((q) => q.id)).not.toContain('q-s1-t1-w2-04')
    }
  })

  it('thiếu nhiều (mới xong F01–F12): quiz W1 không chạy, liệt kê F13, F14', () => {
    for (const seed of SEEDS) {
      for (const opts of OPTS) {
        const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t1-w1'), seed, opts, taught(...upTo('F12')))
        expect(plan.status).toBe('not-ready')
        if (plan.status !== 'not-ready') continue
        expect(plan.available).toBeLessThan(MIN_QUIZ_QUESTIONS)
        expect(plan.missingBrickIds).toEqual(['F13', 'F14'])
        expect(plan.startBrickId).toBe('F13')
      }
    }
  })

  it('chưa đủ nền: nút học dẫn tới viên chưa dạy đầu tiên theo thứ tự Sân ga, không nhảy cóc tới viên đề cần', () => {
    // Mới xong F01–F05: quiz W1 cần F09, F11, F13, F14 nhưng viên học tiếp là F06.
    const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t1-w1'), 's', { canSpeak: true }, taught(...upTo('F05')))
    expect(plan.status).toBe('not-ready')
    if (plan.status !== 'not-ready') return
    expect(plan.missingBrickIds[0]).toBe('F09')
    expect(plan.startBrickId).toBe('F06')
  })

  it('mới xong F01–F12: quiz W2 bỏ 9 câu cần F13–F18, vẫn chạy bằng câu phát âm / nghe và câu gõ đủ nền (story 36)', () => {
    for (const seed of SEEDS) {
      const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t1-w2'), seed, { canSpeak: true }, taught(...upTo('F12')))
      expect(plan).toMatchObject({ status: 'run', skipped: 9, missingBrickIds: ['F13', 'F15', 'F16', 'F18'] })
      if (plan.status !== 'run') continue
      expect(plan.questions).toHaveLength(5)
      for (const q of plan.questions) expect(missingBricks(q, taught(...upTo('F12'))), q.id).toEqual([])
    }
  })

  it('hàng qua kiểm tra (hàng C qua Soát vé, F13–F16 chưa học xong): câu cần F13–F16 tính là đủ nền', () => {
    // isBrickTaught trả true cho mọi viên của hàng đã qua kiểm tra.
    const rowCPassed = taught(...upTo('F12'), 'F13', 'F14', 'F15', 'F16')
    for (const seed of SEEDS) {
      const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t1-w1'), seed, { canSpeak: true }, rowCPassed)
      expect(plan).toEqual({
        status: 'run',
        questions: pickQuiz(QUESTION_BANK, quiz('lesson-s1-t1-w1'), seed, { canSpeak: true }),
        skipped: 0,
        missingBrickIds: [],
      })
    }
  })

  it('không TTS + lọc: câu thay câu nghe luôn đủ nền; có câu bị bỏ mà còn < 4 câu thì không chạy', () => {
    const states: IsBrickTaught[] = [except('F18'), except('F16', 'F18'), taught(...upTo('F12')), taught(...upTo('F14'))]
    for (const def of QUIZZES.filter((d) => d.lessonIds.some((l) => l.startsWith('s1-t1-')))) {
      for (const isTaught of states) {
        for (const seed of SEEDS) {
          const plan = planQuiz(QUESTION_BANK, def, seed, { canSpeak: false }, isTaught)
          if (plan.status === 'not-ready') {
            expect(plan.available, def.id).toBeLessThan(MIN_QUIZ_QUESTIONS)
            continue
          }
          expect(plan.questions.length, def.id).toBeGreaterThanOrEqual(plan.skipped > 0 ? MIN_QUIZ_QUESTIONS : 1)
          for (const q of plan.questions) {
            expect(q.kind, `${def.id} ${q.id}`).not.toBe('listening')
            expect(missingBricks(q, isTaught), `${def.id} ${q.id}`).toEqual([])
          }
        }
      }
    }
  })

  it('thiếu F18, không TTS: quiz W2 bỏ 1 câu, câu nghe có câu thay cùng bài (bài có 15 câu sau story 36), vẫn đủ 5 câu', () => {
    const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t1-w2'), 'x', { canSpeak: false }, except('F18'))
    expect(plan.status).toBe('run')
    if (plan.status === 'run') {
      expect(plan.questions).toHaveLength(5)
      expect(plan.skipped).toBe(1)
      for (const q of plan.questions) expect(q.kind, q.id).not.toBe('listening')
    }
  })

  it('thiếu F13, không TTS: quiz W1 còn 4 câu đủ nền nhưng 1 câu là câu nghe → không chạy', () => {
    const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t1-w1'), 'x', { canSpeak: false }, except('F13'))
    expect(plan).toMatchObject({ status: 'not-ready', missingBrickIds: ['F13'] })
  })

  it('quiz T2–T4 không có câu khai báo requires thì không lọc gì kể cả khi chưa học viên nào', () => {
    // s1-t2-w3 có câu gõ có requires từ story 36, nên dùng s1-t2-w4 (chưa câu nào khai báo).
    for (const id of ['lesson-s1-t2-w4', 'lesson-s1-t3-w1']) {
      for (const seed of SEEDS) {
        expect(planQuiz(QUESTION_BANK, quiz(id), seed, { canSpeak: true }, none)).toEqual({
          status: 'run',
          questions: pickQuiz(QUESTION_BANK, quiz(id), seed, { canSpeak: true }),
          skipped: 0,
          missingBrickIds: [],
        })
      }
    }
  })

  it('story 33 + 36: F14 chưa dạy → quiz s1-t2-w2 bỏ các câu mới cần F14, vẫn chạy 5 câu', () => {
    const needF14 = QUESTION_BANK.filter((q) => q.lessonId === 's1-t2-w2' && missingBricks(q, except('F14')).length > 0)
    expect(needF14.map((q) => q.id)).toEqual(
      [7, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 26].map((n) => `q-s1-t2-w2-${String(n).padStart(2, '0')}`),
    )
    for (const seed of SEEDS) {
      for (const opts of OPTS) {
        const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t2-w2'), seed, opts, except('F14'))
        expect(plan.status).toBe('run')
        if (plan.status !== 'run') continue
        expect(plan.skipped).toBe(12)
        expect(plan.missingBrickIds).toEqual(['F14'])
        expect(plan.questions.length).toBeGreaterThanOrEqual(MIN_QUIZ_QUESTIONS)
        expect(plan.questions).toHaveLength(5)
        for (const q of plan.questions) expect(needF14.map((x) => x.id)).not.toContain(q.id)
      }
    }
  })

  it('story 33 + 36: mới xong F01–F12 → quiz s1-t2-w2 chạy bằng 6 câu cũ (không có requires) và câu mới đủ nền', () => {
    const isTaught = taught(...upTo('F12'))
    for (const seed of SEEDS) {
      for (const opts of OPTS) {
        const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t2-w2'), seed, opts, isTaught)
        expect(plan.status).toBe('run')
        if (plan.status !== 'run') continue
        expect(plan.skipped).toBe(18)
        expect(plan.missingBrickIds).toEqual(['F13', 'F14', 'F15', 'F17', 'F18'])
        expect(plan.questions.length).toBeGreaterThanOrEqual(MIN_QUIZ_QUESTIONS)
        for (const q of plan.questions) expect(missingBricks(q, isTaught), q.id).toEqual([])
      }
    }
  })

  it('story 33: mọi viên đã dạy → quiz s1-t2-w2 và mini-t2 không bỏ câu nào', () => {
    for (const id of ['lesson-s1-t2-w2', 'mini-t2']) {
      for (const seed of SEEDS) {
        const plan = planQuiz(QUESTION_BANK, quiz(id), seed, { canSpeak: true }, all)
        expect(plan).toMatchObject({ status: 'run', skipped: 0, missingBrickIds: [] })
      }
    }
  })

  it('story 33 + 35 + 36: chưa học viên nào → mini-t2 bỏ 36 câu mới (6 câu W2 story 33, 4 câu gõ W1 story 35, 26 câu gõ story 36), vẫn 10 câu, mỗi bài T2 ≥ 2 câu, không trùng', () => {
    const story36 = new Set(
      QUESTION_BANK.filter(
        (q) =>
          (q.lessonId === 's1-t2-w1' && Number(q.id.slice(-2)) >= 11) ||
          (q.lessonId === 's1-t2-w2' && Number(q.id.slice(-2)) >= 13) ||
          (q.lessonId === 's1-t2-w3' && Number(q.id.slice(-2)) >= 7),
      ).map((q) => q.id),
    )
    expect(story36.size).toBe(26)
    for (const seed of SEEDS) {
      for (const opts of OPTS) {
        const plan = planQuiz(QUESTION_BANK, quiz('mini-t2'), seed, opts, none)
        expect(plan.status).toBe('run')
        if (plan.status !== 'run') continue
        expect(plan.skipped).toBe(36)
        for (const q of plan.questions) expect(story36.has(q.id), q.id).toBe(false)
        expect(plan.questions).toHaveLength(10)
        expect(new Set(plan.questions.map((q) => q.id)).size).toBe(10)
        if (!opts.canSpeak) continue
        for (const lessonId of quiz('mini-t2').lessonIds) {
          expect(plan.questions.filter((q) => q.lessonId === lessonId).length, `${lessonId} ${seed}`).toBeGreaterThanOrEqual(2)
        }
      }
    }
  })

  it('story 35 + 36: F09 chưa dạy → quiz s1-t2-w1 bỏ các câu gõ mới cần F09, vẫn chạy 5 câu', () => {
    const needF09 = QUESTION_BANK.filter((q) => q.lessonId === 's1-t2-w1' && missingBricks(q, except('F09')).length > 0)
    expect(needF09.map((q) => q.id)).toEqual([8, 9, 10, 12, 13, 14].map((n) => `q-s1-t2-w1-${String(n).padStart(2, '0')}`))
    for (const seed of SEEDS) {
      for (const opts of OPTS) {
        const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t2-w1'), seed, opts, except('F09'))
        expect(plan.status).toBe('run')
        if (plan.status !== 'run') continue
        expect(plan.skipped).toBe(6)
        expect(plan.missingBrickIds).toEqual(['F09'])
        expect(plan.questions).toHaveLength(5)
        for (const q of plan.questions) expect(needF09.map((x) => x.id)).not.toContain(q.id)
      }
    }
    // F11 chưa dạy: cả 5 câu có mạo từ (07, 09, 10, 11, 12) bị bỏ.
    const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t2-w1'), 's', { canSpeak: true }, except('F11'))
    expect(plan).toMatchObject({ status: 'run', skipped: 5, missingBrickIds: ['F11'] })
  })

  it('story 35: planQuiz chuyển seen cho pickQuiz (câu chưa gặp lấy trước)', () => {
    const w1 = QUESTION_BANK.filter((q) => q.lessonId === 's1-t2-w1')
    const seen = new Set(w1.slice(0, 5).map((q) => q.id))
    for (const seed of SEEDS) {
      const plan = planQuiz(QUESTION_BANK, quiz('lesson-s1-t2-w1'), seed, { canSpeak: true, seen }, all)
      expect(plan.status).toBe('run')
      if (plan.status !== 'run') continue
      expect(plan.questions.every((q) => !seen.has(q.id)), seed).toBe(true)
    }
  })

  it('test ngoài QUIZZES (kiểm tra hàng Sân ga) không lọc', () => {
    const rowC = foundationQuiz('C')
    expect(planQuiz(FOUNDATION_QUESTIONS, rowC, 's', { canSpeak: true }, none)).toEqual({
      status: 'run',
      questions: pickQuiz(FOUNDATION_QUESTIONS, rowC, 's', { canSpeak: true }),
      skipped: 0,
      missingBrickIds: [],
    })
  })

  it('mini test thiếu vài viên: tối đa 10 câu, mỗi câu đủ nền, mỗi bài ≥ 2 câu nếu đủ', () => {
    const mini = quiz('mini-t1')
    const states: IsBrickTaught[] = [taught(...upTo('F12')), except('F18'), except('F13', 'F14')]
    for (const isTaught of states) {
      for (const seed of SEEDS) {
        for (const opts of OPTS) {
          const plan = planQuiz(QUESTION_BANK, mini, seed, opts, isTaught)
          expect(plan.status).toBe('run')
          if (plan.status !== 'run') continue
          expect(plan.skipped).toBeGreaterThan(0)
          expect(plan.questions.length).toBeLessThanOrEqual(10)
          expect(plan.questions.length).toBeGreaterThanOrEqual(MIN_QUIZ_QUESTIONS)
          expect(new Set(plan.questions.map((q) => q.id)).size).toBe(plan.questions.length)
          for (const q of plan.questions) expect(missingBricks(q, isTaught), q.id).toEqual([])
          if (!opts.canSpeak) continue
          for (const lessonId of mini.lessonIds) {
            const eligible = QUESTION_BANK.filter((q) => q.lessonId === lessonId && missingBricks(q, isTaught).length === 0)
            const got = plan.questions.filter((q) => q.lessonId === lessonId).length
            expect(got, `${lessonId} ${seed}`).toBeGreaterThanOrEqual(Math.min(2, eligible.length))
          }
        }
      }
    }
  })

  it('mới xong F01–F12: mini-t1 chạy đủ 10 câu khi có TTS', () => {
    const plan = planQuiz(QUESTION_BANK, quiz('mini-t1'), 's', { canSpeak: true }, taught(...upTo('F12')))
    expect(plan.status === 'run' && plan.questions.length).toBe(10)
  })
})

describe('quizButtonCount', () => {
  const TTS = { canSpeak: true }
  it('đủ nền: số câu như cũ', () => {
    for (const def of QUIZZES) expect(quizButtonCount(QUESTION_BANK, def, TTS, all), def.id).toBe(def.size)
  })

  it('bỏ bớt: số câu còn đủ nền; còn < 4 câu → null', () => {
    expect(quizButtonCount(QUESTION_BANK, quiz('lesson-s1-t1-w2'), TTS, except('F18'))).toBe(5)
    // Sau story 36 quiz W2 có 15 câu, thiếu F16, F18 vẫn còn 12 câu đủ nền → đủ 5; quiz W1 thiếu F13 còn 4 câu.
    expect(quizButtonCount(QUESTION_BANK, quiz('lesson-s1-t1-w2'), TTS, except('F16', 'F18'))).toBe(5)
    expect(quizButtonCount(QUESTION_BANK, quiz('lesson-s1-t1-w1'), TTS, except('F13'))).toBe(4)
    expect(quizButtonCount(QUESTION_BANK, quiz('lesson-s1-t1-w1'), TTS, taught(...upTo('F12')))).toBeNull()
    expect(quizButtonCount(QUESTION_BANK, quiz('lesson-s1-t2-w1'), TTS, none)).toBe(5)
  })

  it('không TTS: thiếu F13 ở quiz W1 còn 4 câu đủ nền nhưng 1 câu là câu nghe → nhãn không có số, đề không chạy', () => {
    const w1 = quiz('lesson-s1-t1-w1')
    expect(quizButtonCount(QUESTION_BANK, w1, { canSpeak: false }, except('F13'))).toBeNull()
    expect(planQuiz(QUESTION_BANK, w1, 's', { canSpeak: false }, except('F13')).status).toBe('not-ready')
  })

  it('nhãn khớp số câu planQuiz chạy (mọi quiz, nhiều trạng thái, có/không TTS)', () => {
    const states: IsBrickTaught[] = [all, none, except('F18'), except('F16', 'F18'), taught(...upTo('F12')), taught(...upTo('F14'))]
    for (const def of QUIZZES) {
      for (const isTaught of states) {
        for (const opts of OPTS) {
          for (const seed of SEEDS.slice(0, 5)) {
            const plan = planQuiz(QUESTION_BANK, def, seed, opts, isTaught)
            const expected = plan.status === 'run' ? plan.questions.length : null
            expect(quizButtonCount(QUESTION_BANK, def, opts, isTaught), `${def.id} ${seed} ${opts.canSpeak}`).toBe(expected)
          }
        }
      }
    }
  })
})
