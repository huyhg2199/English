import { describe, expect, it } from 'vitest'

import { hasBrickContent } from '@/data/foundation/content'
import { FOUNDATION_QUESTIONS, foundationQuiz, type Question } from '@/data/questions'
import { statusFor } from '@/lib/gist'
import { listAttempts, listMistakes, pickQuiz, readMistakes, type AttemptAnswer } from '@/lib/quiz'
import { setReminderTimes, showReminderBanner } from '@/lib/reminders'
import { computeStreak, readSessionDays } from '@/lib/sessions'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  completeBrick,
  foundationState,
  markRowTested,
  needsPlacement,
  nextBrickId,
  readFoundation,
  skipFoundation,
  wallRows,
} from './index'
import {
  nextPlacementRow,
  parseRowParam,
  placementStarted,
  recordRowTest,
  rowBrickRange,
  rowStartBrick,
  rowSummaries,
  rowTestHref,
  rowTestMode,
  rowTestVerdict,
  skipPlacement,
  type RowTestContext,
} from './row-test'
import type { RowId } from '@/data/foundation'
import { housePoints } from '@/lib/trophies'

const day = (d: number, h = 20) => new Date(2026, 10, d, h)
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })

/** 8 câu thật của hàng, `correct` câu đầu đúng, còn lại chọn một lựa chọn sai. */
function answersFor(row: RowId, correct: number, seed = 'seed'): AttemptAnswer[] {
  const questions: Question[] = pickQuiz(FOUNDATION_QUESTIONS, foundationQuiz(row), seed, { canSpeak: true })
  return questions.map((q, i) => {
    const ok = i < correct
    return { questionId: q.id, chosen: ok ? q.answer : q.options.find((o) => o !== q.answer)!, correct: ok }
  })
}

function test(store: Store, row: RowId, correct: number, context: RowTestContext, at = day(6)): Store {
  return recordRowTest(
    store,
    { row, context, attemptId: `a-${row}-${at.getTime()}`, seed: 'seed', startedAt: at, answers: answersFor(row, correct) },
    at,
  )
}

function completeRow(store: Store, ids: string[], at = day(5)): Store {
  return ids.reduce((s, id) => completeBrick(s, id, at), store)
}

const ROW_A = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06']

describe('nextPlacementRow / placementStarted', () => {
  it('store mới: cần Soát vé, bắt đầu từ hàng A, chưa bắt đầu', () => {
    expect(needsPlacement(empty())).toBe(true)
    expect(nextPlacementRow(empty())).toBe('A')
    expect(placementStarted(empty())).toBe(false)
  })

  it('Hàng đã xong bằng viên: F01–F06 xong trước Soát vé → bắt đầu từ hàng B', () => {
    expect(nextPlacementRow(completeRow(empty(), ROW_A))).toBe('B')
  })

  it('Soát vé không còn pending hoặc đã bỏ qua Sân ga → null', () => {
    expect(nextPlacementRow(skipPlacement(empty(), day(6)))).toBeNull()
    expect(nextPlacementRow(skipFoundation(empty(), day(6)))).toBeNull()
  })
})

describe('recordRowTest · Soát vé', () => {
  it('Đạt hàng A (6/8): rows.A = {passed, 75}; hàng A xong, 6/18; mistakes, quizzes, buổi học không đổi', () => {
    const store = test(empty(), 'A', 6, 'placement')
    expect(readFoundation(store).rows.A).toMatchObject({ passed: true, best: 75 })
    const state = foundationState(store)
    expect(state.rowsDone).toEqual(['A'])
    expect(state.taughtCount).toBe(6)
    expect(Object.keys(store.data)).toEqual(['foundation'])
    expect(readMistakes(store)).toEqual({})
    expect(listAttempts(store)).toEqual([])
    expect(nextPlacementRow(store)).toBe('B')
    expect(readFoundation(store).placement).toBe('pending')
  })

  it('Chưa đạt (5/8): rows.A = {passed: false, 63}; hàng A chưa xong; học hàng A từ F01', () => {
    const store = test(empty(), 'A', 5, 'placement')
    expect(readFoundation(store).rows.A).toMatchObject({ passed: false, best: 63 })
    expect(foundationState(store).rowsDone).toEqual([])
    expect(rowStartBrick(store, 'A')).toBe('F01')
    expect(rowStartBrick(completeBrick(store, 'F01', day(7)), 'A')).toBe('F02')
    // Hàng đã có kết quả thì Soát vé sang hàng sau.
    expect(nextPlacementRow(store)).toBe('B')
  })

  // Phần thuần của dòng "Dừng giữa hàng": trạng thái sau hàng A. Việc "rời trang giữa hàng không ghi gì" nằm ở
  // RowTestRun (chỉ gọi recordRowTest khi bấm "Xem kết quả"), không có test component, kiểm bằng tay.
  it('Sau hàng A, chưa ghi hàng B: thẻ mời "Tiếp tục Soát vé · hàng B", hàng B làm lại từ đầu', () => {
    const afterA = test(empty(), 'A', 7, 'placement')
    expect(placementStarted(afterA)).toBe(true)
    expect(nextPlacementRow(afterA)).toBe('B')
    expect(readFoundation(afterA).rows.B).toBeUndefined()
  })

  it('answers rỗng → store cũ', () => {
    const store = empty()
    expect(
      recordRowTest(store, { row: 'A', context: 'placement', attemptId: 'x', seed: 's', startedAt: day(6), answers: [] }, day(6)),
    ).toBe(store)
  })

  it('Hết 4 hàng: placement done, thẻ mời ẩn; tổng kết đúng hàng đạt / chưa đạt', () => {
    let store = test(empty(), 'A', 7, 'placement')
    store = test(store, 'B', 2, 'placement')
    store = test(store, 'C', 6, 'placement')
    expect(readFoundation(store).placement).toBe('pending')
    store = test(store, 'D', 3, 'placement')
    const f = readFoundation(store)
    expect(f.placement).toBe('done')
    expect(f.completedAt).toBeNull()
    expect(needsPlacement(store)).toBe(false)
    expect(nextPlacementRow(store)).toBeNull()
    expect(rowSummaries(store).map((r) => [r.row, r.status, r.best])).toEqual([
      ['A', 'passed', 88],
      ['B', 'failed', 25],
      ['C', 'passed', 75],
      ['D', 'failed', 38],
    ])
  })

  it('Đạt cả 4: completedAt và placement done', () => {
    let store = empty()
    for (const r of ['A', 'B', 'C', 'D'] as const) store = test(store, r, 6, 'placement', day(6, 8))
    const f = readFoundation(store)
    expect(f.placement).toBe('done')
    expect(f.completedAt).toBe(day(6, 8).toISOString())
    expect(foundationState(store).status).toBe('completed')
  })

  it('Hàng cuối đã xong bằng viên: làm xong hàng C là hết Soát vé', () => {
    let store = completeRow(empty(), ['F17', 'F18'])
    store = test(store, 'A', 6, 'placement')
    store = test(store, 'B', 6, 'placement')
    store = test(store, 'C', 1, 'placement')
    expect(readFoundation(store).placement).toBe('done')
    expect(rowSummaries(store).find((r) => r.row === 'D')).toMatchObject({ status: 'bricks', best: null })
  })

  it('Bỏ qua Soát vé (hàng A đã làm): skipped, rows.A giữ nguyên, thẻ mời không hiện lại', () => {
    const afterA = test(empty(), 'A', 7, 'placement')
    const store = skipPlacement(afterA, day(7))
    const f = readFoundation(store)
    expect(f.placement).toBe('skipped')
    expect(f.rows.A).toEqual(readFoundation(afterA).rows.A)
    expect(needsPlacement(store)).toBe(false)
    expect(nextPlacementRow(store)).toBeNull()
    // Hàng A xong → viên tiếp theo bỏ qua hàng A, sang F07 (đã có nội dung từ story 25).
    expect(nextBrickId(store, hasBrickContent)).toBe('F07')
    expect(nextBrickId(skipPlacement(empty(), day(7)), hasBrickContent)).toBe('F01')
    // Bỏ qua lần nữa không đổi gì.
    expect(skipPlacement(store, day(8))).toBe(store)
  })

  it('AC: A 7/8, B 2/8, dừng trước C, tải lại → tiếp từ C; xong D tổng kết; viên tiếp theo bỏ qua hàng A', () => {
    let store = test(empty(), 'A', 7, 'placement')
    store = test(store, 'B', 2, 'placement')
    // "Tải lại": store được đọc lại từ JSON.
    store = JSON.parse(JSON.stringify(store)) as Store
    expect(nextPlacementRow(store)).toBe('C')
    store = test(store, 'C', 4, 'placement')
    store = test(store, 'D', 4, 'placement')
    expect(readFoundation(store).placement).toBe('done')
    expect(rowSummaries(store).filter((r) => r.status === 'passed').map((r) => r.row)).toEqual(['A'])
    expect(wallRows(foundationState(store), hasBrickContent)[0].tiles.every((t) => t.lit)).toBe(true)
    expect(nextBrickId(store, () => true)).toBe('F07')
    expect(store.data.mistakes).toBeUndefined()
    expect(store.data.quizzes).toBeUndefined()
  })
})

describe('rowTestMode / recordRowTest · kiểm tra hàng', () => {
  it('chế độ: trang Soát vé → placement; hàng còn viên chưa xong → know; mọi viên xong → final', () => {
    expect(rowTestMode(empty(), 'A', 'placement')).toBe('placement')
    expect(rowTestMode(empty(), 'A', 'row')).toBe('know')
    expect(rowTestMode(completeRow(empty(), ROW_A.slice(0, 5)), 'A', 'row')).toBe('know')
    expect(rowTestMode(completeRow(empty(), ROW_A), 'A', 'row')).toBe('final')
    // Hàng qua bằng kiểm tra mà chưa học hết viên vẫn là know.
    expect(rowTestMode(markRowTested(empty(), 'A', 8, 8, day(5)), 'A', 'row')).toBe('know')
  })

  it('"Tôi biết rồi" hàng B 6/8: rows.B.passed; mistakes và quizzes.attempts không đổi; Soát vé vẫn pending', () => {
    const store = test(empty(), 'B', 6, 'row')
    expect(readFoundation(store).rows.B).toMatchObject({ passed: true, best: 75 })
    expect(store.data.mistakes).toBeUndefined()
    expect(store.data.quizzes).toBeUndefined()
    expect(readFoundation(store).placement).toBe('pending')
    expect(nextPlacementRow(store)).toBe('A')
    // Chưa làm Soát vé hàng nào trước hàng A → thẻ mời vẫn là "Bắt đầu Soát vé".
    expect(placementStarted(store)).toBe(false)
  })

  it('Mọi hàng có kết quả nhờ "Tôi biết rồi": Soát vé thành done, không kẹt pending', () => {
    let store = empty()
    for (const r of ['A', 'B', 'C'] as const) store = test(store, r, 2, 'row')
    expect(readFoundation(store).placement).toBe('pending')
    expect(nextPlacementRow(store)).toBe('D')
    expect(placementStarted(store)).toBe(true)
    store = test(store, 'D', 2, 'row')
    expect(readFoundation(store).placement).toBe('done')
    expect(needsPlacement(store)).toBe(false)
    expect(store.data.mistakes).toBeUndefined()
    expect(store.data.quizzes).toBeUndefined()
  })

  it('"Tôi biết rồi" chưa đạt: chỉ cập nhật best', () => {
    let store = test(empty(), 'B', 2, 'row')
    expect(readFoundation(store).rows.B).toMatchObject({ passed: false, best: 25 })
    store = test(store, 'B', 4, 'row', day(7))
    expect(readFoundation(store).rows.B).toMatchObject({ passed: false, best: 50 })
    expect(store.data.mistakes).toBeUndefined()
  })

  it('Kiểm tra cuối hàng (F01–F06 xong) 5/8: best cập nhật, passed không hạ; lần làm quiz-f-a; 3 câu sai vào Sổ lỗi', () => {
    const done = completeRow(empty(), ROW_A)
    const first = test(done, 'A', 5, 'row')
    expect(readFoundation(first).rows.A).toMatchObject({ passed: false, best: 63 })
    const attempts = listAttempts(first)
    expect(attempts).toHaveLength(1)
    expect(attempts[0]).toMatchObject({ quizId: 'quiz-f-a', score: 5, total: 8 })
    const mistakes = listMistakes(readMistakes(first))
    expect(mistakes).toHaveLength(3)
    for (const m of mistakes) expect(m.lessonId).toMatch(/^f0[1-6]$/)

    // Đã đạt trước đó thì lần sau thấp hơn không hạ passed, best giữ max.
    const passed = test(done, 'A', 7, 'row')
    const again = test(passed, 'A', 5, 'row', day(7))
    expect(readFoundation(again).rows.A).toMatchObject({ passed: true, best: 88 })
    expect(listAttempts(again)).toHaveLength(2)
  })

  it('Kiểm tra cuối hàng không ghi buổi học (chỉ foundation, quizzes, mistakes)', () => {
    const store = test(completeRow(empty(), ROW_A), 'A', 6, 'row')
    expect(Object.keys(store.data).sort()).toEqual(['foundation', 'mistakes', 'quizzes'])
  })
})

describe('rowTestVerdict', () => {
  const base = { row: 'A' as const, startBrick: 'F01' as const, rowDone: false }

  it('đạt: Soát vé / Tôi biết rồi "tính là xong"; cuối hàng "đã chắc"', () => {
    expect(rowTestVerdict({ ...base, mode: 'placement', passed: true, rowDone: true })).toBe('Đạt hàng A: hàng này tính là xong.')
    expect(rowTestVerdict({ ...base, mode: 'know', passed: true, rowDone: true })).toBe('Đạt hàng A: hàng này tính là xong.')
    expect(rowTestVerdict({ ...base, mode: 'final', passed: true, rowDone: true })).toBe(
      'Đạt kiểm tra cuối hàng A. Nền móng hàng này đã chắc.',
    )
  })

  it('chưa đạt: "học hàng A từ F01", cuối hàng "ôn lại", hàng đã xong "vẫn tính là xong"; không chữ "trượt"', () => {
    const placement = rowTestVerdict({ ...base, mode: 'placement', passed: false })
    expect(placement).toBe('Chưa đạt 70%, mình học hàng A từ F01.')
    expect(rowTestVerdict({ ...base, mode: 'know', passed: false })).toBe(placement)
    expect(rowTestVerdict({ ...base, mode: 'know', passed: false, rowDone: true })).toBe(
      'Lần này chưa đạt 70%, nhưng hàng A vẫn tính là xong.',
    )
    const final = rowTestVerdict({ ...base, mode: 'final', passed: false, rowDone: true })
    expect(final).toBe('Chưa đạt 70%, mình ôn lại hàng A từ F01.')
    for (const text of [placement, final]) expect(text).not.toMatch(/trượt/i)
  })
})

describe('tiện ích route', () => {
  it('parseRowParam: hoa thường, khoảng trắng; giá trị lạ → null', () => {
    expect(parseRowParam('a')).toBe('A')
    expect(parseRowParam(' D ')).toBe('D')
    expect(parseRowParam('A')).toBe('A')
    expect(parseRowParam('x')).toBeNull()
    expect(parseRowParam('AB')).toBeNull()
    expect(parseRowParam('')).toBeNull()
    expect(parseRowParam(undefined)).toBeNull()
  })

  it('rowTestHref, rowBrickRange', () => {
    expect(rowTestHref('A')).toBe('/foundation/kiem-tra/A')
    expect(rowBrickRange('A')).toBe('F01–F06')
    expect(rowBrickRange('D')).toBe('F17–F18')
  })
})

describe('Soát vé không là buổi học (story 22, learning-rules mục Sân ga)', () => {
  it('làm đủ 4 hàng Soát vé trong một ngày, chưa học buổi nào → không streak, không điểm Nhà, chưa "đã học hôm nay"', () => {
    const now = day(6, 21)
    let store = setReminderTimes(empty(), ['19:00'], day(6, 8))
    for (const [i, row] of (['A', 'B', 'C', 'D'] as const).entries()) {
      store = test(store, row, i % 2 === 0 ? 7 : 3, 'placement', day(6, 9 + i))
    }
    expect(readFoundation(store).placement).toBe('done')
    expect(Object.keys(readSessionDays(store))).toEqual([])
    expect(computeStreak(readSessionDays(store), now)).toBe(0)
    expect(housePoints(readSessionDays(store)).total).toBe(0)
    expect(statusFor(store, now).studied).toBe(false)
    expect(showReminderBanner(store, now, null)).toBe(true)
  })
})
