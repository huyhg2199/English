import { describe, expect, it } from 'vitest'

import { BRICK_IDS, BRICKS, bricksOfRow, CONCEPT_IDS, getBrickMeta, isBrickId, ROW_IDS, type ConceptId } from './index'

/** Số phút theo bảng trong `learning-rules.md`. */
const MINUTES: Record<string, number> = {
  F01: 6, F02: 8, F03: 8, F04: 8, F05: 8, F06: 12,
  F07: 8, F08: 8, F09: 8, F10: 8, F11: 10, F12: 6,
  F13: 10, F14: 10, F15: 10, F16: 6,
  F17: 8, F18: 8,
}

describe('danh mục Sân ga 9¾', () => {
  it('đủ 18 id duy nhất, thứ tự F01 → F18', () => {
    const ids = BRICKS.map((b) => b.id)
    expect(ids).toEqual([...BRICK_IDS])
    expect(new Set(ids).size).toBe(18)
    expect(ids).toEqual(Array.from({ length: 18 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`))
  })

  it('hàng A = F01–F06, B = F07–F12, C = F13–F16, D = F17–F18', () => {
    expect(ROW_IDS).toEqual(['A', 'B', 'C', 'D'])
    expect(bricksOfRow('A').map((b) => b.id)).toEqual(['F01', 'F02', 'F03', 'F04', 'F05', 'F06'])
    expect(bricksOfRow('B').map((b) => b.id)).toEqual(['F07', 'F08', 'F09', 'F10', 'F11', 'F12'])
    expect(bricksOfRow('C').map((b) => b.id)).toEqual(['F13', 'F14', 'F15', 'F16'])
    expect(bricksOfRow('D').map((b) => b.id)).toEqual(['F17', 'F18'])
  })

  it('số phút từng viên và tổng khớp bảng (150 phút)', () => {
    for (const b of BRICKS) expect(b.minutes, b.id).toBe(MINUTES[b.id])
    expect(BRICKS.reduce((sum, b) => sum + b.minutes, 0)).toBe(150)
  })

  it('mỗi ConceptId được đúng một viên teaches', () => {
    const count = new Map<ConceptId, number>()
    for (const b of BRICKS) for (const c of b.teaches) count.set(c, (count.get(c) ?? 0) + 1)
    for (const c of CONCEPT_IDS) expect(count.get(c), c).toBe(1)
    expect(count.size).toBe(CONCEPT_IDS.length)
    expect(new Set(CONCEPT_IDS).size).toBe(CONCEPT_IDS.length)
  })

  it('mỗi uses chỉ là khái niệm do viên đứng trước dạy', () => {
    const taught = new Set<ConceptId>()
    for (const b of BRICKS) {
      for (const c of b.uses) expect(taught.has(c), `${b.id} dùng ${c}`).toBe(true)
      for (const c of b.teaches) taught.add(c)
    }
  })

  it('id kebab-case, title / goalVi không rỗng; getBrickMeta, isBrickId', () => {
    for (const c of CONCEPT_IDS) expect(c).toMatch(/^[a-z]+(-[a-z]+)*$/)
    for (const b of BRICKS) {
      expect(b.title.trim()).not.toBe('')
      expect(b.goalVi.trim()).not.toBe('')
      expect(b.teaches.length).toBeGreaterThan(0)
    }
    expect(getBrickMeta('F03')?.title).toBe('IPA là gì')
    expect(getBrickMeta('F19')).toBeUndefined()
    expect(getBrickMeta('__proto__')).toBeUndefined()
    expect(isBrickId('F18')).toBe(true)
    expect(isBrickId('f18')).toBe(false)
    expect(isBrickId(3)).toBe(false)
  })
})
