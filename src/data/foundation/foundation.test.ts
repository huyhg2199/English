import { describe, expect, it } from 'vitest'

import { loadWords } from '@/data/vocab'

import { BRICKS, getBrickMeta } from './catalog'
import { BRICK_CONTENT, getBrick, hasBrickContent } from './content'
import type { Brick, CheckItem, ConceptId, Screen } from './types'

const words = await loadWords()
const wordById = new Map(words.map((w) => [w.id, w]))

const bricks = Object.values(BRICK_CONTENT) as Brick[]
const SCREEN_ORDER: Screen['kind'][] = ['explain', 'contrast', 'worked', 'faded', 'check', 'apply']
const CONTENT_POS = new Set(['noun', 'verb', 'adjective', 'adverb'])

/** Đếm chữ: tách theo khoảng trắng, chỉ tính mảnh có chữ cái hoặc số (bỏ "→", "–"). */
function countWords(text: string): number {
  return text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length
}

function screenOf<K extends Screen['kind']>(brick: Brick, kind: K): Extract<Screen, { kind: K }> {
  const s = brick.screens.find((x) => x.kind === kind)
  if (!s) throw new Error(`${brick.id} thiếu màn ${kind}`)
  return s as Extract<Screen, { kind: K }>
}

function allItems(brick: Brick): CheckItem[] {
  const check = screenOf(brick, 'check')
  const apply = screenOf(brick, 'apply')
  return [...check.items, ...check.easier, ...(apply.item ? [apply.item] : [])]
}

/** Khái niệm do viên `id` hoặc các viên đứng trước dạy. */
function taughtUpTo(id: string): Set<ConceptId> {
  const idx = BRICKS.findIndex((b) => b.id === id)
  return new Set(BRICKS.slice(0, idx + 1).flatMap((b) => b.teaches))
}

function blanks(text: string): number {
  return text.split('___').length - 1
}

describe('nội dung viên gạch', () => {
  it('có ít nhất F01; sổ đăng ký tra đúng id', () => {
    expect(hasBrickContent('F01')).toBe(true)
    expect(getBrick('F01')?.id).toBe('F01')
    expect(hasBrickContent('F02')).toBe(false)
    expect(hasBrickContent('f01')).toBe(false)
    expect(hasBrickContent('__proto__')).toBe(false)
    expect(getBrick('toString')).toBeUndefined()
  })

  it('F01: câu check có ít nhất choice, listen, order', () => {
    const kinds = new Set(screenOf(getBrick('F01')!, 'check').items.map((i) => i.kind))
    for (const k of ['choice', 'listen', 'order'] as const) expect(kinds.has(k), k).toBe(true)
  })

  it('id câu luyện, thẻ quy tắc, câu nói không trùng trong toàn bộ nội dung', () => {
    const ids = bricks.flatMap((b) => [
      ...allItems(b).map((i) => i.id),
      ...b.ruleCards.map((c) => c.id),
      ...(screenOf(b, 'apply').speak ?? []).map((s) => s.id),
    ])
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe.each(bricks.map((b) => [b.id, b] as const))('%s', (id, brick) => {
    it('meta khớp danh mục, key sổ đăng ký đúng id', () => {
      const meta = getBrickMeta(id)!
      expect(BRICK_CONTENT[meta.id]).toBe(brick)
      for (const key of Object.keys(meta) as (keyof typeof meta)[]) expect(brick[key]).toEqual(meta[key])
    })

    it('đúng 6 màn theo thứ tự explain → contrast → worked → faded → check → apply', () => {
      expect(brick.screens.map((s) => s.kind)).toEqual(SCREEN_ORDER)
    })

    it('giải thích 40–80 chữ', () => {
      const n = countWords(screenOf(brick, 'explain').textVi)
      expect(n).toBeGreaterThanOrEqual(40)
      expect(n).toBeLessThanOrEqual(80)
    })

    it('faded và thẻ quy tắc có đúng một ___; thẻ quy tắc thuộc viên này', () => {
      expect(blanks(screenOf(brick, 'faded').en)).toBe(1)
      expect(brick.ruleCards.length).toBeGreaterThanOrEqual(1)
      expect(brick.ruleCards.length).toBeLessThanOrEqual(2)
      for (const card of brick.ruleCards) {
        expect(blanks(card.cloze)).toBe(1)
        expect(card.brickId).toBe(id)
        expect(card.answer.trim()).not.toBe('')
      }
    })

    it('check 2–5 câu, easier đúng 2', () => {
      const check = screenOf(brick, 'check')
      expect(check.items.length).toBeGreaterThanOrEqual(2)
      expect(check.items.length).toBeLessThanOrEqual(5)
      expect(check.easier).toHaveLength(2)
    })

    it('câu luyện hợp lệ theo loại', () => {
      for (const item of allItems(brick)) {
        expect(item.hintVi.trim(), item.id).not.toBe('')
        expect(item.explanationVi.trim(), item.id).not.toBe('')
        switch (item.kind) {
          case 'choice':
          case 'listen':
            expect(item.options, item.id).toHaveLength(3)
            expect(new Set(item.options).size, item.id).toBe(3)
            expect(item.options[item.answer], item.id).toBeDefined()
            if (item.kind === 'listen') expect(item.audioText.trim(), item.id).not.toBe('')
            break
          case 'tapSyllable':
            expect(item.syllables.join(''), item.id).toBe(item.word)
            expect(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.syllables.length, item.id).toBe(true)
            break
          case 'order':
            expect(item.tokens.length, item.id).toBeGreaterThanOrEqual(2)
            break
          case 'sort': {
            expect(item.groups.length, item.id).toBeGreaterThanOrEqual(2)
            const all = item.groups.flatMap((g) => g.items)
            expect(new Set(all).size, item.id).toBe(all.length)
            expect(new Set(item.groups.map((g) => g.label)).size, item.id).toBe(item.groups.length)
            for (const g of item.groups) expect(g.items.length, item.id).toBeGreaterThanOrEqual(1)
            break
          }
        }
      }
    })

    it('uses của câu chỉ là khái niệm viên này hoặc viên trước dạy', () => {
      const taught = taughtUpTo(id)
      for (const item of allItems(brick)) {
        for (const c of item.uses ?? []) expect(taught.has(c), `${item.id} dùng ${c}`).toBe(true)
      }
    })

    it('câu nói có id dạng fNN-say-n', () => {
      for (const s of screenOf(brick, 'apply').speak ?? []) {
        expect(s.id).toMatch(new RegExp(`^${id.toLowerCase()}-say-\\d+$`))
        expect(s.text.trim(), s.id).not.toBe('')
      }
    })

    it('faded có đáp án không rỗng', () => {
      expect(screenOf(brick, 'faded').answer.trim()).not.toBe('')
    })

    it('đúng 5 từ chủ đề, là từ nội dung có trong words.json', () => {
      expect(brick.themeWordIds).toHaveLength(5)
      expect(new Set(brick.themeWordIds).size).toBe(5)
      for (const wid of brick.themeWordIds) {
        const w = wordById.get(wid)
        expect(w, wid).toBeDefined()
        expect(CONTENT_POS.has(w!.pos ?? ''), `${wid} là ${w!.pos}`).toBe(true)
      }
    })
  })
})
