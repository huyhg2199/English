import { describe, expect, it } from 'vitest'

import { hasDetails, loadWords } from '@/data/vocab'
import { ruleCardId } from '@/lib/flashcard-session'

import { BRICKS, getBrickMeta } from './catalog'
import { BRICK_CONTENT, getBrick, hasBrickContent } from './content'
import type { Brick, CheckItem, ConceptId, Screen } from './types'

const words = await loadWords()
const wordById = new Map(words.map((w) => [w.id, w]))

const bricks = Object.values(BRICK_CONTENT) as Brick[]
const SCREEN_ORDER: Screen['kind'][] = ['explain', 'contrast', 'worked', 'faded', 'check', 'apply']
const CONTENT_POS = new Set(['noun', 'verb', 'adjective', 'adverb'])
/** Chữ cái hoa đứng một mình (trừ "I"): iOS đọc sai, F02 phải dùng `spellForSpeech`. */
const SINGLE_LETTER = /(^|[^A-Za-z])[A-HJ-Z]([^A-Za-z]|$)/

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

describe('thẻ quy tắc → id SRS (story 24)', () => {
  const rules = bricks.flatMap((b) => b.ruleCards)

  it('id dạng fNN-rule-n, tiền tố đúng viên', () => {
    expect(rules.length).toBeGreaterThan(0)
    for (const r of rules) {
      expect(r.id).toMatch(/^f\d{2}-rule-\d+$/)
      expect(r.id.slice(0, 3)).toBe(r.brickId.toLowerCase())
    }
  })

  it('ruleCardId không trùng trên toàn bộ nội dung, dạng rule:fNN-n', () => {
    const ids = rules.map(ruleCardId)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^rule:f\d{2}-\d+$/)
    expect(ruleCardId({ id: 'f01-rule-2' })).toBe('rule:f01-2')
  })
})

describe('nội dung viên gạch', () => {
  it('F01–F06 có nội dung; sổ đăng ký tra đúng id', () => {
    for (const id of ['F01', 'F02', 'F03', 'F04', 'F05', 'F06']) {
      expect(hasBrickContent(id), id).toBe(true)
      expect(getBrick(id)?.id).toBe(id)
    }
    expect(hasBrickContent('F07')).toBe(false)
    expect(hasBrickContent('f01')).toBe(false)
    expect(hasBrickContent('__proto__')).toBe(false)
    expect(getBrick('toString')).toBeUndefined()
  })

  it('F01: câu check có ít nhất choice, listen, order', () => {
    const kinds = new Set(screenOf(getBrick('F01')!, 'check').items.map((i) => i.kind))
    for (const k of ['choice', 'listen', 'order'] as const) expect(kinds.has(k), k).toBe(true)
  })

  it('F04 có ít nhất một câu tapSyllable', () => {
    expect(allItems(getBrick('F04')!).some((i) => i.kind === 'tapSyllable')).toBe(true)
  })

  it('từ chủ đề không trùng giữa các viên', () => {
    const ids = bricks.flatMap((b) => b.themeWordIds)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('F02: không chuỗi đọc nào chứa chữ cái đứng một mình (trừ I)', () => {
    const f02 = getBrick('F02')!
    const contrast = screenOf(f02, 'contrast')
    const worked = screenOf(f02, 'worked')
    const apply = screenOf(f02, 'apply')
    // Chuỗi máy thật sự đọc: audioText nếu có, không thì chữ hiện trên màn hình.
    const spoken = [
      ...allItems(f02).flatMap((i) => (i.kind === 'listen' ? [i.audioText] : [])),
      ...(contrast.examples ?? []).map((ex) => ex.audioText ?? ex.en),
      worked.audioText ?? worked.en,
      ...(apply.sampleEn !== undefined ? [apply.sampleAudioText ?? apply.sampleEn] : []),
      ...(apply.speak ?? []).map((s) => s.text),
    ]
    expect(spoken.length).toBeGreaterThan(0)
    for (const text of spoken) expect(SINGLE_LETTER.test(text), text).toBe(false)
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

    it('có ít nhất một câu listen', () => {
      expect(allItems(brick).some((i) => i.kind === 'listen')).toBe(true)
    })

    it('audioText / sampleAudioText nếu có thì không rỗng', () => {
      const contrast = screenOf(brick, 'contrast')
      const worked = screenOf(brick, 'worked')
      const apply = screenOf(brick, 'apply')
      const texts = [
        ...(contrast.examples ?? []).map((ex) => ex.audioText),
        worked.audioText,
        apply.sampleAudioText,
      ].filter((t): t is string => t !== undefined)
      for (const t of texts) expect(t.trim()).not.toBe('')
      if (apply.sampleAudioText !== undefined) expect(apply.sampleEn, 'sampleAudioText cần sampleEn').toBeDefined()
    })

    it('faded có đáp án không rỗng', () => {
      expect(screenOf(brick, 'faded').answer.trim()).not.toBe('')
    })

    it('đúng 5 từ chủ đề, là từ nội dung có trong words.json và có dữ liệu AI (phiên ôn mới lấy được)', () => {
      expect(brick.themeWordIds).toHaveLength(5)
      expect(new Set(brick.themeWordIds).size).toBe(5)
      for (const wid of brick.themeWordIds) {
        const w = wordById.get(wid)
        expect(w, wid).toBeDefined()
        expect(hasDetails(w!), `${wid} chưa có dữ liệu AI`).toBe(true)
        expect(CONTENT_POS.has(w!.pos ?? ''), `${wid} là ${w!.pos}`).toBe(true)
      }
    })
  })
})
