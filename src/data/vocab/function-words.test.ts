import { describe, expect, it } from 'vitest'

import { isBrickId } from '@/data/foundation'
import { getLesson, STAGES } from '@/data/roadmap'
import { functionWordCloze } from '@/lib/flashcard-session'
import { clozeText } from '@/lib/srs'

import { FUNCTION_WORD_GATES, functionWordGate } from './function-words'
import { hasDetails, loadWords } from './index'

const words = await loadWords()
const byId = new Map(words.map((w) => [w.id, w]))
const entries = Object.entries(FUNCTION_WORD_GATES)
const FUNCTION_POS = new Set(['pronoun', 'preposition', 'conjunction', 'determiner'])

describe('FUNCTION_WORD_GATES — cổng hư từ', () => {
  it('tổng 86: 36 cổng viên, 15 cổng bài, 35 cổng tường (some / any / many dời về F15, story 43; but / or / because về F16, story 44)', () => {
    expect(entries).toHaveLength(86)
    const kinds = entries.map(([, g]) => (g.opensAfter === 'wall' ? 'wall' : 'brick' in g.opensAfter ? 'brick' : 'lesson'))
    expect(kinds.filter((k) => k === 'brick')).toHaveLength(36)
    expect(kinds.filter((k) => k === 'lesson')).toHaveLength(15)
    expect(kinds.filter((k) => k === 'wall')).toHaveLength(35)
    for (const id of ['ngsl-some', 'ngsl-any', 'ngsl-many']) expect(functionWordGate(id)?.opensAfter, id).toEqual({ brick: 'F15' })
    for (const id of ['ngsl-but', 'ngsl-or', 'ngsl-because']) expect(functionWordGate(id)?.opensAfter, id).toEqual({ brick: 'F16' })
    // and, why giữ cổng tường: F10, F11, F15 đã dùng and; why đã mở ở s1-t1-w3 sau tường.
    for (const id of ['ngsl-and', 'ngsl-why']) expect(functionWordGate(id)?.opensAfter, id).toBe('wall')
    // much giữ cổng F14 (How much hỏi giá): dời ra sau sẽ đóng một cổng đã mở.
    expect(functionWordGate('ngsl-much')?.opensAfter).toEqual({ brick: 'F14' })
    // Story 45: modal dạy ở s1-t4-w1 (could, would dưới dạng would like); may, might dời sang bài Chặng 2 dạy chúng.
    for (const w of ['can', 'could', 'would', 'should', 'must']) {
      expect(functionWordGate(`ngsl-${w}`)?.opensAfter, w).toEqual({ lesson: 's1-t4-w1' })
    }
    expect(functionWordGate('ngsl-may')?.opensAfter).toEqual({ lesson: 's2-t7-w3' })
    expect(functionWordGate('ngsl-might')?.opensAfter).toEqual({ lesson: 's2-t7-w4' })
  })

  it('mỗi id có trong words.json, thuộc NGSL hạng ≤ 300 và có dữ liệu AI', () => {
    for (const [id] of entries) {
      const w = byId.get(id)
      expect(w, id).toBeDefined()
      expect(w!.list, id).toBe('ngsl')
      expect(w!.rank, id).toBeLessThanOrEqual(300)
      expect(hasDetails(w!), id).toBe(true)
    }
  })

  it('đủ mọi từ NGSL hạng ≤ 300 là đại từ, giới từ, liên từ, từ hạn định', () => {
    const expected = words.filter((w) => w.list === 'ngsl' && w.rank <= 300 && FUNCTION_POS.has(w.pos ?? '')).map((w) => w.id)
    expect(expected.length).toBeGreaterThan(0)
    for (const id of expected) expect(Object.hasOwn(FUNCTION_WORD_GATES, id), id).toBe(true)
  })

  it('cổng viên là BrickId hợp lệ; cổng bài là bài có thật thuộc Chặng 1, trừ đúng may / might ở Chặng 2 (story 45)', () => {
    const STAGE_2: Record<string, string> = { 'ngsl-may': 's2-t7-w3', 'ngsl-might': 's2-t7-w4' }
    const stage2Seen: string[] = []
    for (const [id, { opensAfter }] of entries) {
      if (opensAfter === 'wall') continue
      if ('brick' in opensAfter) {
        expect(isBrickId(opensAfter.brick), id).toBe(true)
        continue
      }
      const lesson = getLesson(opensAfter.lesson)
      expect(lesson, id).toBeDefined()
      if (id in STAGE_2) {
        expect(opensAfter.lesson, id).toBe(STAGE_2[id])
        expect(lesson?.stageId, id).toBe(STAGES[1].id)
        stage2Seen.push(id)
      } else expect(lesson?.stageId, id).toBe(STAGES[0].id)
    }
    expect(stage2Seen.sort()).toEqual(['ngsl-may', 'ngsl-might'])
  })

  it('forms khác rỗng, chữ thường, có chính từ đó', () => {
    for (const [id, { forms }] of entries) {
      expect(forms.length, id).toBeGreaterThan(0)
      for (const f of forms) expect(f, id).toBe(f.toLowerCase())
      expect(forms, id).toContain(byId.get(id)!.word.toLowerCase())
    }
  })

  it('câu ví dụ hiệu lực (sau override) của mọi hư từ có chỗ trống', () => {
    for (const [id] of entries) expect(functionWordCloze(byId.get(id)!), id).not.toBeNull()
  })

  it('mặt trước không lộ đáp án: câu có chỗ trống không còn token nào khớp forms', () => {
    for (const [id, { forms }] of entries) {
      const front = clozeText(functionWordCloze(byId.get(id)!)!)
      const left = (front.match(/[\p{L}'’]+/gu) ?? []).filter((t) => forms.includes(t.toLowerCase()))
      expect(left, `${id}: ${front}`).toEqual([])
    }
  })

  it('functionWordGate: id không phải hư từ / id lạ → undefined', () => {
    expect(functionWordGate('ngsl-the')?.opensAfter).toEqual({ brick: 'F11' })
    expect(functionWordGate('ngsl-family')).toBeUndefined()
    expect(functionWordGate('__proto__')).toBeUndefined()
    expect(functionWordGate('tsl-the')).toBeUndefined()
  })
})
