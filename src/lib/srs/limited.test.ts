import { describe, expect, it } from 'vitest'

import type { StudyWord } from '@/data/vocab'

import { limitedProgress, orderQueue, type SessionItem } from './index'

const item = (id: string, kind: SessionItem['kind']): SessionItem => ({ word: { id } as StudyWord, kind })
const ids = (q: readonly SessionItem[]) => q.map((i) => i.word.id)

describe('orderQueue', () => {
  it('preferNew: từ mới lên đầu, giữ thứ tự trong từng nhóm', () => {
    const q = [item('r1', 'review'), item('n1', 'new'), item('l1', 'learning'), item('n2', 'new')]
    expect(ids(orderQueue(q, true))).toEqual(['n1', 'n2', 'r1', 'l1'])
    expect(ids(orderQueue(q, false))).toEqual(['r1', 'n1', 'l1', 'n2'])
  })
})

describe('limitedProgress', () => {
  const q = [item('r1', 'review'), item('n1', 'new'), item('n2', 'new'), item('n3', 'new')]

  it('chưa chấm: thẻ đầu là từ mới, chưa xong', () => {
    const p = limitedProgress(q, [], { limit: 3, preferNew: true })
    expect(p.current?.word.id).toBe('n1')
    expect(p).toMatchObject({ count: 0, done: false, limitReached: false })
  })

  it('một từ chấm 3 lần (Quên rồi quay lại) không tính là xong', () => {
    const again = [item('n1', 'learning'), item('n2', 'new'), item('n3', 'new')]
    const reviewed = [
      { wordId: 'n1', kind: 'new' as const },
      { wordId: 'n1', kind: 'learning' as const },
      { wordId: 'n1', kind: 'learning' as const },
    ]
    const p = limitedProgress(again, reviewed, { limit: 3, preferNew: true })
    expect(p).toMatchObject({ count: 1, done: false })
    expect(p.current?.word.id).toBe('n2')
  })

  it('đủ limit từ khác nhau → dừng dù còn thẻ', () => {
    const reviewed = ['n1', 'n2', 'n3'].map((wordId) => ({ wordId, kind: 'new' as const }))
    const p = limitedProgress(q, reviewed, { limit: 3, preferNew: true })
    expect(p).toMatchObject({ current: undefined, count: 3, done: true, limitReached: true })
  })

  it('preferNew: thẻ ôn không tính vào limit', () => {
    const reviewed = [{ wordId: 'r1', kind: 'review' as const }]
    expect(limitedProgress(q, reviewed, { limit: 1, preferNew: true }).done).toBe(false)
    expect(limitedProgress(q, reviewed, { limit: 1 }).done).toBe(true)
  })

  it('preferNew nhưng hết từ mới (đã dùng hết quota): thẻ ôn khác nhau được tính, không phải ôn hết hàng đợi', () => {
    const reviewsOnly = [item('r1', 'review'), item('r2', 'review'), item('r3', 'review'), item('r4', 'review')]
    const reviewed = ['r1', 'r2', 'r3'].map((wordId) => ({ wordId, kind: 'review' as const }))
    expect(limitedProgress(reviewsOnly, reviewed, { limit: 3, preferNew: true })).toMatchObject({
      count: 3,
      done: true,
      limitReached: true,
    })
  })

  it('hàng đợi rỗng → xong (không phải vì limit)', () => {
    expect(limitedProgress([], [], { limit: 3, preferNew: true })).toMatchObject({ done: true, limitReached: false })
    expect(limitedProgress([], []).done).toBe(true)
  })

  it('không có limit: chỉ xong khi hết thẻ', () => {
    const reviewed = ['a', 'b', 'c', 'd'].map((wordId) => ({ wordId, kind: 'new' as const }))
    expect(limitedProgress(q, reviewed).current?.word.id).toBe('r1')
  })
})
