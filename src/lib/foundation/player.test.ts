import { describe, expect, it } from 'vitest'

import type { BrickId, CheckItem, Screen } from '@/data/foundation'
import { getBrick } from '@/data/foundation/content'
import { CURRENT_VERSION, type Store } from '@/lib/storage'

import {
  advanceCheck,
  answerText,
  brickHref,
  completeBrick,
  firstTryScore,
  foundationState,
  isCorrect,
  isFadedCorrect,
  markRowTested,
  needsReview,
  nextBrickId,
  passedTheoryScreens,
  readFoundation,
  recordAnswer,
  resolveBrickRoute,
  shuffledTokens,
  skipEasier,
  skipFoundation,
  startCheck,
  startEasier,
  wallRows,
} from './index'

const day = (d: number, h = 20) => new Date(2026, 10, d, h)
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
const onlyF01 = (id: BrickId) => id === 'F01'
const all = () => true

const choice: CheckItem = {
  id: 't-choice',
  kind: 'choice',
  prompt: 'p',
  options: ['a', 'b', 'c'],
  answer: 1,
  hintVi: 'h',
  explanationVi: 'e',
}
const listen: CheckItem = { ...choice, id: 't-listen', kind: 'listen', audioText: 'x', answer: 2 }
const tap: CheckItem = {
  id: 't-tap',
  kind: 'tapSyllable',
  word: 'yesterday',
  syllables: ['yes', 'ter', 'day'],
  answer: 0,
  hintVi: 'h',
  explanationVi: 'e',
}
const order: CheckItem = { id: 't-order', kind: 'order', tokens: ['I', 'read', 'a book'], hintVi: 'h', explanationVi: 'e' }
const sort: CheckItem = {
  id: 't-sort',
  kind: 'sort',
  groups: [
    { label: 'now', items: ['go', 'eat'] },
    { label: 'past', items: ['went', 'ate'] },
  ],
  hintVi: 'h',
  explanationVi: 'e',
}

describe('isCorrect', () => {
  it('choice / listen theo vị trí đáp án', () => {
    expect(isCorrect(choice, { kind: 'choice', choice: 1 })).toBe(true)
    expect(isCorrect(choice, { kind: 'choice', choice: 0 })).toBe(false)
    expect(isCorrect(listen, { kind: 'listen', choice: 2 })).toBe(true)
    expect(isCorrect(listen, { kind: 'listen', choice: 1 })).toBe(false)
  })

  it('tapSyllable theo vị trí âm tiết nhấn', () => {
    expect(isCorrect(tap, { kind: 'tapSyllable', index: 0 })).toBe(true)
    expect(isCorrect(tap, { kind: 'tapSyllable', index: 2 })).toBe(false)
  })

  it('order: đúng thứ tự mới đúng; sắp sai / thiếu mảnh → sai', () => {
    expect(isCorrect(order, { kind: 'order', tokens: ['I', 'read', 'a book'] })).toBe(true)
    expect(isCorrect(order, { kind: 'order', tokens: ['read', 'I', 'a book'] })).toBe(false)
    expect(isCorrect(order, { kind: 'order', tokens: ['I', 'read'] })).toBe(false)
  })

  it('sort: mọi mục đúng nhóm; xếp sai nhóm / thiếu mục / thừa mục → sai', () => {
    expect(isCorrect(sort, { kind: 'sort', groupOf: { go: 0, eat: 0, went: 1, ate: 1 } })).toBe(true)
    expect(isCorrect(sort, { kind: 'sort', groupOf: { go: 0, eat: 1, went: 1, ate: 1 } })).toBe(false)
    expect(isCorrect(sort, { kind: 'sort', groupOf: { go: 0, eat: 0, went: 1 } })).toBe(false)
    expect(isCorrect(sort, { kind: 'sort', groupOf: { go: 0, eat: 0, went: 1, ate: 1, run: 0 } })).toBe(false)
  })

  it('loại câu trả lời khác loại câu → sai', () => {
    expect(isCorrect(order, { kind: 'choice', choice: 0 })).toBe(false)
    expect(isCorrect(choice, { kind: 'tapSyllable', index: 1 })).toBe(false)
  })
})

describe('answerText', () => {
  it('hiện đáp án theo loại', () => {
    expect(answerText(choice)).toBe('b')
    expect(answerText(listen)).toBe('c')
    expect(answerText(tap)).toBe('YES·ter·day')
    expect(answerText(order)).toBe('I read a book')
    expect(answerText(sort)).toBe('now: go, eat · past: went, ate')
  })
})

describe('Faded', () => {
  it('"Went " đúng cho "went" (bỏ hoa thường, khoảng trắng); sai / trống → sai', () => {
    expect(isFadedCorrect('went', 'Went ')).toBe(true)
    expect(isFadedCorrect('went', '  WENT')).toBe(true)
    expect(isFadedCorrect('went', 'go')).toBe(false)
    expect(isFadedCorrect('went', '   ')).toBe(false)
  })
})

describe('needsReview (< 60%)', () => {
  it('Dưới 60%: 1/4, 2/4 mời; Đúng 60%: 3/5 không mời', () => {
    expect(needsReview(1, 4)).toBe(true)
    expect(needsReview(2, 4)).toBe(true)
    expect(needsReview(3, 5)).toBe(false)
    expect(needsReview(3, 4)).toBe(false)
    expect(needsReview(0, 0)).toBe(false)
  })
})

describe('shuffledTokens', () => {
  it('xác định theo seed, cùng tập mảnh, không ra đúng thứ tự gốc', () => {
    for (let i = 0; i < 50; i++) {
      const o = shuffledTokens(order, `seed-${i}`)
      expect([...o].sort()).toEqual([...order.tokens].sort())
      expect(o).not.toEqual(order.tokens)
      expect(shuffledTokens(order, `seed-${i}`)).toEqual(o)
      const s = shuffledTokens(sort, `seed-${i}`)
      expect([...s].sort()).toEqual(['ate', 'eat', 'go', 'went'])
      expect(s).not.toEqual(['go', 'eat', 'went', 'ate'])
    }
  })

  it('2 mảnh luôn đảo; 1 mảnh / câu chọn giữ nguyên', () => {
    const two: CheckItem = { ...order, tokens: ['I', 'go'] } as CheckItem
    for (let i = 0; i < 10; i++) expect(shuffledTokens(two, `s${i}`)).toEqual(['go', 'I'])
    expect(shuffledTokens({ ...order, tokens: ['I'] } as CheckItem, 's')).toEqual(['I'])
    expect(shuffledTokens(choice, 's')).toEqual([])
  })
})

describe('luồng màn check', () => {
  const items = [choice, listen, order, sort]
  const easier = [
    { ...choice, id: 'e1' },
    { ...choice, id: 'e2' },
  ]
  const check = { items, easier }

  /** Trả lời lần đầu các câu chính theo `results`, câu sai thì làm lại cho đúng rồi sang câu sau. */
  function runMain(results: boolean[], c = check) {
    let flow = startCheck()
    c.items.forEach((item, i) => {
      flow = recordAnswer(flow, item.id, results[i])
      if (!results[i]) flow = recordAnswer(flow, item.id, true) // "Thử lại" đúng: không tính lại
      flow = advanceCheck(flow, c)
    })
    return flow
  }

  it('Dưới 60%: 1/4 → mời; nhận lời chạy 2 câu dễ hơn (không tính điểm) rồi xong, không mời lại', () => {
    let flow = runMain([true, false, false, false])
    expect(firstTryScore(flow)).toBe(1)
    expect(flow.stage).toBe('invite')
    flow = startEasier(flow)
    expect(flow).toMatchObject({ stage: 'easier', index: 0 })
    flow = recordAnswer(flow, 'e1', true)
    flow = advanceCheck(flow, check)
    expect(flow).toMatchObject({ stage: 'easier', index: 1 })
    flow = advanceCheck(flow, check)
    expect(flow.stage).toBe('finished')
    expect(firstTryScore(flow)).toBe(1)
    expect(Object.keys(flow.firstTry)).toHaveLength(4)
    expect(advanceCheck(flow, check)).toBe(flow)
    expect(startEasier(flow)).toBe(flow)
  })

  it('Dưới 60%: 2/4 → mời; "Bỏ qua, sang Áp dụng" → xong', () => {
    const flow = runMain([true, true, false, false])
    expect(flow.stage).toBe('invite')
    expect(skipEasier(flow).stage).toBe('finished')
    expect(skipEasier(startEasier(flow)).stage).toBe('finished')
  })

  it('Đúng 60%: 3/5 → không mời, xong', () => {
    const five = { items: [...items, { ...choice, id: 't5' }], easier }
    const flow = runMain([true, false, true, false, true], five)
    expect(firstTryScore(flow)).toBe(3)
    expect(flow.stage).toBe('finished')
  })

  it('Gợi ý / thử lại không đổi điểm lần đầu; "Xem đáp án" khi chưa trả lời tính là sai', () => {
    let flow = startCheck()
    flow = recordAnswer(flow, choice.id, true)
    flow = recordAnswer(flow, choice.id, false)
    expect(flow.firstTry[choice.id]).toBe(true)
    flow = advanceCheck(flow, check)
    flow = advanceCheck(flow, check) // listen: xem đáp án ngay
    expect(flow.firstTry[listen.id]).toBe(false)
  })
})

describe('bức tường & viên tiếp theo', () => {
  it('Bức tường mới: 4 hàng có tên, 18 ô, F01 "Học tiếp", F02–F18 đang soạn, 0/18', () => {
    const state = foundationState(empty())
    const rows = wallRows(state, onlyF01)
    expect(rows.map((r) => r.row)).toEqual(['A', 'B', 'C', 'D'])
    expect(rows.map((r) => r.title)).toEqual(['Nghe & đọc được chữ', 'Viên gạch của câu', 'Câu đầu tiên', 'Cầu sang Năm 1'])
    const tiles = rows.flatMap((r) => r.tiles)
    expect(tiles).toHaveLength(18)
    expect(tiles.filter((t) => t.next).map((t) => t.id)).toEqual(['F01'])
    expect(tiles.filter((t) => t.hasContent).map((t) => t.id)).toEqual(['F01'])
    expect(tiles.some((t) => t.lit)).toBe(false)
    expect(rows.some((r) => r.done)).toBe(false)
    expect(state.taughtCount).toBe(0)
    expect(nextBrickId(empty(), onlyF01)).toBe('F01')
  })

  it('Hàng qua kiểm tra: hàng A sáng cả 6 ô, "Xong", 6/18; không còn viên tiếp theo', () => {
    const store = markRowTested(empty(), 'A', 8, 8, day(6))
    const state = foundationState(store)
    const rows = wallRows(state, onlyF01)
    expect(rows[0].done).toBe(true)
    expect(rows[0].tiles.every((t) => t.lit)).toBe(true)
    expect(rows.slice(1).every((r) => r.tiles.every((t) => !t.lit))).toBe(true)
    expect(state.taughtCount).toBe(6)
    expect(nextBrickId(store, onlyF01)).toBeNull()
    expect(rows.flatMap((r) => r.tiles).some((t) => t.next)).toBe(false)
    // Có nội dung hết thì viên tiếp theo là F07 (bỏ hàng A đã xong).
    expect(nextBrickId(store, all)).toBe('F07')
  })

  it('Học xong F01: F01 sáng, 1/18; viên tiếp theo là viên chưa xong đầu tiên có nội dung', () => {
    const store = completeBrick(empty(), 'F01', day(6))
    const state = foundationState(store)
    expect(state.taughtCount).toBe(1)
    const tile = wallRows(state, onlyF01)[0].tiles[0]
    expect(tile).toMatchObject({ id: 'F01', lit: true, next: false })
    expect(nextBrickId(store, onlyF01)).toBeNull()
    expect(nextBrickId(store, all)).toBe('F02')
  })

  it('Học lại: firstDoneAt giữ, lastDoneAt mới; đã bỏ qua thì học xong vẫn skipped', () => {
    let store = completeBrick(empty(), 'F01', day(6))
    store = completeBrick(store, 'F01', day(7))
    const f01 = readFoundation(store).bricks.F01!
    expect(f01.firstDoneAt).toBe(day(6).toISOString())
    expect(f01.lastDoneAt).toBe(day(7).toISOString())

    const skipped = completeBrick(skipFoundation(empty(), day(3)), 'F01', day(4))
    expect(foundationState(skipped).status).toBe('skipped')
  })
})

describe('route /foundation/:brickId', () => {
  it('F01 chạy; f01 chạy F01; F02 đang soạn; F99 / rỗng / __proto__ → unknown', () => {
    expect(resolveBrickRoute('F01', onlyF01)).toEqual({ kind: 'play', id: 'F01' })
    expect(resolveBrickRoute('f01', onlyF01)).toEqual({ kind: 'play', id: 'F01' })
    expect(resolveBrickRoute('F02', onlyF01)).toEqual({ kind: 'drafting', id: 'F02' })
    expect(resolveBrickRoute('F99', onlyF01)).toEqual({ kind: 'unknown' })
    expect(resolveBrickRoute(undefined, onlyF01)).toEqual({ kind: 'unknown' })
    expect(resolveBrickRoute('__proto__', onlyF01)).toEqual({ kind: 'unknown' })
    expect(brickHref('F01')).toBe('/foundation/F01')
  })

  it('nút kiểm tra hàng: chưa xong → know; mọi viên xong → final; qua bằng kiểm tra mà chưa học hết viên → null', () => {
    const tests = (store: Store) => wallRows(foundationState(store), all).map((r) => r.test)
    expect(tests(empty())).toEqual(['know', 'know', 'know', 'know'])
    const passedA = markRowTested(empty(), 'A', 6, 8, day(6))
    expect(tests(passedA)).toEqual([null, 'know', 'know', 'know'])
    let rowA = empty()
    for (const id of ['F01', 'F02', 'F03', 'F04', 'F05', 'F06']) rowA = completeBrick(rowA, id, day(6))
    expect(tests(rowA)).toEqual(['final', 'know', 'know', 'know'])
    // Qua bằng kiểm tra rồi học hết viên → final.
    let both = passedA
    for (const id of ['F01', 'F02', 'F03', 'F04', 'F05', 'F06']) both = completeBrick(both, id, day(7))
    expect(tests(both)[0]).toBe('final')
    // Hàng chưa đạt kiểm tra (có kết quả) vẫn là know.
    expect(tests(markRowTested(empty(), 'B', 2, 8, day(6)))[1]).toBe('know')
  })
})

describe('passedTheoryScreens (cột lý thuyết máy tính, story 30)', () => {
  const fake = [
    { kind: 'explain' },
    { kind: 'contrast' },
    { kind: 'worked' },
    { kind: 'faded' },
    { kind: 'check' },
    { kind: 'apply' },
  ] as const
  const kinds = (index: number) => passedTheoryScreens(fake, index).map((s) => s.kind)

  it('index 0 / 1 / 3 / 5 → [] / [explain] / [explain, contrast, worked] / như 3', () => {
    expect(kinds(0)).toEqual([])
    expect(kinds(1)).toEqual(['explain'])
    expect(kinds(2)).toEqual(['explain', 'contrast'])
    expect(kinds(3)).toEqual(['explain', 'contrast', 'worked'])
    expect(kinds(5)).toEqual(['explain', 'contrast', 'worked'])
  })

  it('index ngoài khoảng → kẹp', () => {
    expect(kinds(-3)).toEqual([])
    expect(kinds(99)).toEqual(['explain', 'contrast', 'worked'])
  })

  it('màn lý thuyết nằm sau màn hiện tại không hiện; thứ tự giữ theo viên', () => {
    const mixed = [{ kind: 'worked' }, { kind: 'check' }, { kind: 'explain' }] as const
    expect(passedTheoryScreens(mixed, 2).map((s) => s.kind)).toEqual(['worked'])
    expect(passedTheoryScreens(mixed, 3).map((s) => s.kind)).toEqual(['worked', 'explain'])
  })

  it('F01 thật: màn 4–6 có đủ Giải thích, So sánh, Ví dụ mẫu (cùng object của viên)', () => {
    const brick = getBrick('F01')!
    const screens: readonly Screen[] = brick.screens
    for (const index of [3, 4, 5]) {
      const passed = passedTheoryScreens(screens, index)
      expect(passed.map((s) => s.kind)).toEqual(['explain', 'contrast', 'worked'])
      for (const s of passed) expect(screens.indexOf(s)).toBeLessThan(index)
    }
    expect(passedTheoryScreens(screens, 0)).toEqual([])
  })
})
