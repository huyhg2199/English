import { describe, expect, it } from 'vitest'

import { SPELLS } from '@/data/lessons'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import type { Store } from '@/lib/storage'

import { isSpellUnlocked, unlockedSpells } from './spells'

const empty: Store = { schemaVersion: 7, data: {} }
const NOW = new Date('2026-11-02T10:00:00Z')

describe('unlockedSpells', () => {
  it('chưa xong bài nào → chưa mở thần chú nào', () => {
    expect(unlockedSpells(empty)).toEqual([])
  })

  it('đánh dấu xong s1-t1-w1 → Lumos mở; bỏ đánh dấu → khoá lại', () => {
    const done = setLessonCompleted(empty, 's1-t1-w1', true, NOW)
    expect(unlockedSpells(done).map((s) => s.id)).toEqual(['lumos'])
    expect(isSpellUnlocked(done, 'lumos')).toBe(true)
    const undone = setLessonCompleted(done, 's1-t1-w1', false, new Date(NOW.getTime() + 1000))
    expect(unlockedSpells(undone)).toEqual([])
    expect(isSpellUnlocked(undone, 'lumos')).toBe(false)
  })

  it('xong cả 3 bài → đủ Lumos, Alohomora, Revelio theo thứ tự', () => {
    let s = empty
    for (const id of ['s1-t1-w3', 's1-t1-w1', 's1-t1-w2']) s = setLessonCompleted(s, id, true, NOW)
    expect(unlockedSpells(s).map((x) => x.name)).toEqual(['Lumos', 'Alohomora', 'Revelio'])
    expect(SPELLS).toHaveLength(12)
  })

  it('progress sai dạng → không crash, không mở gì', () => {
    expect(unlockedSpells({ schemaVersion: 7, data: { progress: 'x' } })).toEqual([])
  })
})
