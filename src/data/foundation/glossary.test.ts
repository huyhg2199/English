import { describe, expect, it } from 'vitest'

import { allTenseChoices, getLessonContent, LESSON_CONTENTS } from '@/data/lessons'
import { TO_BE } from '@/data/lessons/t1-grammar'

import { BRICKS, isBrickId } from './catalog'
import { getBrick } from './content'
import { GLOSSARY, splitGlossaryText, type GlossarySegment } from './glossary'
import type { Brick } from './types'

const chips = (segments: GlossarySegment[]) =>
  segments.flatMap((s) => ('term' in s ? [{ text: s.text, id: s.term.id, brickId: s.term.brickId }] : []))
const chipsOf = (text: string) => chips(splitGlossaryText(text))
const joined = (segments: GlossarySegment[]) => segments.map((s) => s.text).join('')
const countWords = (text: string) => text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length

/** Lời tiếng Việt của viên: giải thích, tương phản, ghi chú ví dụ, gợi ý / giải thích câu luyện, thẻ quy tắc. */
function vietnameseTexts(brick: Brick): string[] {
  const out: string[] = []
  for (const s of brick.screens) {
    switch (s.kind) {
      case 'explain':
        out.push(s.textVi)
        break
      case 'contrast':
        out.push(s.viSays, s.enRequires, ...(s.examples ?? []).map((e) => e.vi))
        break
      case 'worked':
        out.push(s.vi, s.noteVi ?? '')
        break
      case 'faded':
        out.push(s.vi, s.hintVi ?? '')
        break
      case 'check':
        for (const item of [...s.items, ...s.easier]) {
          out.push(item.hintVi, item.explanationVi, 'prompt' in item ? (item.prompt ?? '') : '')
        }
        break
      case 'apply':
        out.push(s.promptVi)
        if (s.item) out.push(s.item.hintVi, s.item.explanationVi, 'prompt' in s.item ? (s.item.prompt ?? '') : '')
        break
    }
  }
  out.push(...brick.ruleCards.map((c) => c.vi))
  return out.filter((t) => t.trim() !== '')
}

/** Lời tiếng Việt của TenseCard và SoundTable (chỉ những field có chip). */
function t1Texts(): string[] {
  const out: string[] = []
  for (const c of LESSON_CONTENTS.filter((x) => x.lessonId.startsWith('s1-t1-'))) {
    for (const t of c.grammar?.tenses ?? []) {
      out.push(t.use, ...t.formulas.flatMap((f) => [f.label, f.text]), ...t.rules, ...t.mistakes.map((m) => m.why))
    }
    const p = c.pronunciation
    if (p) out.push(p.intro, ...p.groups.flatMap((g) => [g.note ?? '', ...g.sounds.map((s) => s.tip)]))
  }
  return out
}

/** Lời tiếng Việt có chip của khối "Chọn thì" (story 39): `use`, "Dùng khi", ghi chú cặp câu, quy tắc, "khi nào" của chữ Việt. */
function choiceTexts(): string[] {
  return allTenseChoices().flatMap((c) => [
    c.use,
    ...(c.sides ?? []).map((s) => s.whenVi),
    ...c.pairs.map((p) => p.noteVi),
    ...c.rules,
    ...(c.viWords ?? []).flatMap((w) => w.options.map((o) => o.whenVi)),
  ])
}

/** Luật chung trợ động từ của bảng "Mỗi thì một dòng" (story 39). */
function auxRules(): string[] {
  return (getLessonContent('s1-t4-w4')?.pronunciation?.blocks ?? []).flatMap((b) => (b.kind === 'tense-table' ? b.auxRules : []))
}

describe('bảng thuật ngữ (story 26)', () => {
  it('30–38 mục (story 39 thêm 4 mục F17); id, mẫu không trùng; viên thuộc danh mục; định nghĩa ≤ 25 chữ', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(30)
    expect(GLOSSARY.length).toBeLessThanOrEqual(38)
    const ids = GLOSSARY.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    const patterns = GLOSSARY.flatMap((t) => t.patterns.map((p) => p.toLowerCase()))
    expect(new Set(patterns).size).toBe(patterns.length)
    for (const t of GLOSSARY) {
      expect(isBrickId(t.brickId), t.id).toBe(true)
      expect(t.patterns.length, t.id).toBeGreaterThan(0)
      expect(t.label.trim(), t.id).not.toBe('')
      expect(countWords(t.definition), t.id).toBeLessThanOrEqual(25)
      expect(countWords(t.definition), t.id).toBeGreaterThan(3)
    }
    // Không có mục "thì": chữ "thì" tiếng Việt còn là liên từ.
    expect(patterns).not.toContain('thì')
  })

  it('viên đích nhắc tới ít nhất một mẫu của mục (lời tiếng Việt của viên, không phân biệt hoa thường)', () => {
    const missing: string[] = []
    for (const t of GLOSSARY) {
      const brick = getBrick(t.brickId)
      expect(brick, t.brickId).toBeDefined()
      const texts = vietnameseTexts(brick!)
      const hit = t.patterns.some((p) =>
        texts.some((x) => ([...p].length === 1 ? x.includes(p) : x.toLowerCase().includes(p.toLowerCase()))),
      )
      if (!hit) missing.push(`${t.id} (${t.brickId}): ${t.patterns.join(' / ')}`)
    }
    expect(missing).toEqual([])
  })

  it('mục chỉ trỏ viên F03 trở đi (F01, F02 không dạy thuật ngữ)', () => {
    const order = BRICKS.map((b) => b.id)
    for (const t of GLOSSARY) expect(order.indexOf(t.brickId), t.id).toBeGreaterThanOrEqual(order.indexOf('F03'))
  })

  describe('splitGlossaryText', () => {
    it('"động từ nguyên mẫu" → một chip cho cả cụm (F17), không chip "động từ" bên trong', () => {
      const segs = splitGlossaryText('S + động từ nguyên mẫu: I work.')
      expect(chips(segs)).toEqual([
        { text: 'S', id: 'subject', brickId: 'F08' },
        { text: 'động từ nguyên mẫu', id: 'base-form', brickId: 'F17' },
      ])
      expect(joined(segs)).toBe('S + động từ nguyên mẫu: I work.')
    })

    it('"động từ thường" → một chip mở F13 (phân biệt với to be), không phải "động từ" của F07', () => {
      expect(chipsOf('Không đặt am / is / are trước động từ thường.')).toEqual([
        { text: 'động từ thường', id: 'ordinary-verb', brickId: 'F13' },
      ])
      expect(chipsOf('động từ chỉ hành động')).toEqual([{ text: 'động từ', id: 'verb', brickId: 'F07' }])
    })

    it('"thì thêm -s", "Sunday" không chip; ký hiệu S khớp đúng hoa thường', () => {
      expect(chipsOf('Chủ ngữ là he thì thêm -s.').map((c) => c.id)).toEqual(['subject'])
      expect(chipsOf('thì thêm -s')).toEqual([])
      expect(chipsOf('on Sunday, She, Sam, S5, S\'')).toEqual([])
      expect(chipsOf('s + V')).toEqual([])
      expect(chipsOf('(S) + V').map((c) => c.text)).toEqual(['S'])
    })

    it('không chip bên trong IPA /…/; "am / is / are" và "danh từ/tính từ" không phải IPA', () => {
      expect(chipsOf('about /əˈbaʊt/')).toEqual([])
      expect(chipsOf('dấu ˈ trong /əˈbaʊt/').map((c) => c.text)).toEqual(['ˈ'])
      expect(chipsOf('am / is / are + danh từ / tính từ / nơi chốn').map((c) => c.id)).toEqual(['noun', 'adjective'])
      expect(chipsOf('danh từ/tính từ').map((c) => c.id)).toEqual(['noun', 'adjective'])
    })

    it('một thuật ngữ xuất hiện 2 lần → chỉ chip lần đầu; ghép lại đúng chuỗi gốc', () => {
      const text = 'Danh từ số ít, rồi danh từ số nhiều, rồi âm tiết.'
      const segs = splitGlossaryText(text)
      expect(chips(segs).map((c) => c.text)).toEqual(['Danh từ', 'số ít', 'âm tiết'])
      expect(joined(segs)).toBe(text)
    })

    it('mẫu dài nhất thắng: "ngôi thứ ba số ít", "tính từ sở hữu", "không đếm được", "cụm phụ âm"', () => {
      expect(chipsOf('ngôi thứ ba số ít').map((c) => c.id)).toEqual(['third-person-singular'])
      expect(chipsOf('tính từ sở hữu').map((c) => c.id)).toEqual(['possessive-adjective'])
      expect(chipsOf('danh từ không đếm được').map((c) => c.id)).toEqual(['noun', 'countable'])
      expect(chipsOf('cụm phụ âm').map((c) => c.id)).toEqual(['cluster'])
    })

    it('chuỗi rỗng / không thuật ngữ → một đoạn thường (hoặc không đoạn nào)', () => {
      expect(splitGlossaryText('')).toEqual([])
      expect(splitGlossaryText('Xin chào')).toEqual([{ text: 'Xin chào' }])
    })

    it('ghép lại đúng chuỗi gốc với mọi lời tiếng Việt của bài và viên, khối "Chọn thì" và luật trợ động từ (story 39)', () => {
      const texts = [
        ...t1Texts(),
        ...BRICKS.flatMap((b) => vietnameseTexts(getBrick(b.id)!)),
        ...choiceTexts(),
        ...auxRules(),
      ]
      expect(choiceTexts().length).toBeGreaterThan(0)
      expect(auxRules()).toHaveLength(3)
      for (const t of texts) expect(joined(splitGlossaryText(t))).toBe(t)
    })

    it('tên gọi tắt V-ing / V2 / V3 và "trợ động từ" (story 39) → chip trỏ F17; mỗi chuỗi chỉ chip lần đầu', () => {
      expect(chipsOf('S + am / is / are + V-ing')).toEqual([
        { text: 'S', id: 'subject', brickId: 'F08' },
        { text: 'V-ing', id: 'v-ing', brickId: 'F17' },
      ])
      expect(chipsOf('have / has + V3, không dùng V2').map((c) => c.id)).toEqual(['v3', 'v2'])
      expect(chipsOf('Câu đã có trợ động từ (am / is / are)')).toEqual([{ text: 'trợ động từ', id: 'auxiliary', brickId: 'F17' }])
      expect(chipsOf('V2 rồi lại V2').map((c) => c.text)).toEqual(['V2'])
      // "V1" không phải mục; "V2" không khớp bên trong chữ khác.
      expect(chipsOf('V1, V21, AV2')).toEqual([])
    })
  })

  it('TO_BE.formulas[0].text: chip danh từ, tính từ (F07); chuỗi Matrix "S + am / is / are + …" thêm chip S (F08)', () => {
    expect(chipsOf(TO_BE.formulas[0].text).map((c) => [c.text, c.brickId])).toEqual([
      ['danh từ', 'F07'],
      ['tính từ', 'F07'],
    ])
    expect(chipsOf('S + am / is / are + danh từ / tính từ / nơi chốn').map((c) => [c.text, c.brickId])).toEqual([
      ['S', 'F08'],
      ['danh từ', 'F07'],
      ['tính từ', 'F07'],
    ])
  })

  it('thuật ngữ T1: lời tiếng Việt của TenseCard / SoundTable bài s1-t1-* có chip S, danh từ, âm tiết, ngôi thứ ba số ít', () => {
    expect(getLessonContent('s1-t1-w1')).toBeDefined()
    const found = t1Texts().flatMap(chipsOf)
    const ids = new Set(found.map((c) => c.id))
    for (const id of ['noun', 'syllable', 'third-person-singular']) expect(ids.has(id), id).toBe(true)
    expect(found.some((c) => c.id === 'subject' && c.text === 'S')).toBe(true)
  })
})
