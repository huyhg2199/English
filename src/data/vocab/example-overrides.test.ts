import { describe, expect, it } from 'vitest'

import { BRICK_CONTENT } from '@/data/foundation/content'

import { exampleFeatures, labelExamples } from '../../../scripts/vocab/example-features.mjs'
import report from '../../../scripts/vocab/example-labels.json'
import examples from './example-overrides.json'
import { functionWordGate } from './function-words'
import { loadWords, STARTER_WORD_IDS, withExampleOverrides, type ExampleOverrides, type Word } from './index'
import rawWords from './words.json'

const data = examples as ExampleOverrides
const words = await loadWords()
const byId = new Map(words.map((w) => [w.id, w]))

/** Tập rà (story 24): NGSL hạng 1–500, từ khởi đầu và từ chủ đề của mọi viên có nội dung. */
const reviewIds = new Set([
  ...words.filter((w) => w.list === 'ngsl' && w.rank <= 500).map((w) => w.id),
  ...STARTER_WORD_IDS,
  ...Object.values(BRICK_CONTENT).flatMap((b) => b?.themeWordIds ?? []),
])

const tokens = (sentence: string) => (sentence.toLowerCase().replace(/’/g, "'").match(/[\p{L}']+/gu) ?? [])

describe('example-overrides.json — câu ví dụ thay thế', () => {
  it('id override / accepted có trong bộ từ và thuộc tập rà', () => {
    for (const id of [...Object.keys(data.overrides), ...Object.keys(data.accepted)]) {
      expect(byId.has(id), id).toBe(true)
      expect(reviewIds.has(id), id).toBe(true)
      // Từ chưa có dữ liệu AI thì override bị bỏ qua lặng lẽ (`withExampleOverrides`), nên không được viết.
      expect(typeof byId.get(id)?.exampleEn, `${id} chưa có câu ví dụ`).toBe('string')
    }
  })

  it('scripts/vocab/example-labels.json khớp kết quả chạy lại trên đúng tập rà này (chạy `npm run vocab:label-examples`)', () => {
    const fresh = labelExamples({ words: rawWords as Word[], reviewIds, overrides: data.overrides, accepted: data.accepted })
    expect(report).toEqual(fresh)
  })

  it('override: câu kết thúc bằng . ? !, chứa từ gốc (hư từ: một dạng trong forms), không bị gắn nhãn, có nghĩa Việt', () => {
    for (const [id, { exampleEn, exampleVi }] of Object.entries(data.overrides)) {
      expect(exampleEn, id).toMatch(/[.?!]$/)
      const forms = functionWordGate(id)?.forms ?? [byId.get(id)!.word.toLowerCase()]
      expect(tokens(exampleEn).some((t) => forms.includes(t)), `${id}: ${exampleEn}`).toBe(true)
      expect(exampleFeatures(exampleEn), `${id}: ${exampleEn}`).toEqual([])
      expect(exampleVi.trim(), id).not.toBe('')
    }
  })

  it('loadWords() trả câu override (vd ngsl-yesterday)', () => {
    expect(Object.hasOwn(data.overrides, 'ngsl-yesterday')).toBe(true)
    expect(byId.get('ngsl-yesterday')).toMatchObject(data.overrides['ngsl-yesterday'])
  })

  it('mọi id trong tập rà có câu hiệu lực 0 nhãn, hoặc nằm trong accepted', () => {
    const todo = [...reviewIds].filter((id) => {
      const w = byId.get(id)
      return w?.exampleEn !== undefined && exampleFeatures(w.exampleEn).length > 0 && !Object.hasOwn(data.accepted, id)
    })
    expect(todo).toEqual([])
  })

  it('accepted: đang bị gắn nhãn, có lý do, không trùng override (không "thừa")', () => {
    for (const [id, reason] of Object.entries(data.accepted)) {
      expect(Object.hasOwn(data.overrides, id), `${id} vừa override vừa accepted`).toBe(false)
      expect(exampleFeatures(byId.get(id)!.exampleEn ?? '').length, `${id} không bị gắn nhãn`).toBeGreaterThan(0)
      expect(reason.trim(), id).not.toBe('')
    }
  })

  it('withExampleOverrides: thuần, không đổi mảng gốc, bỏ id lạ, không thêm câu cho từ chưa có dữ liệu', () => {
    const raw: Word[] = [
      { id: 'ngsl-a', word: 'a', list: 'ngsl', rank: 1, exampleEn: 'Old.', exampleVi: 'Cũ.' },
      { id: 'ngsl-b', word: 'b', list: 'ngsl', rank: 2 },
    ]
    const snapshot = structuredClone(raw)
    const out = withExampleOverrides(raw, {
      'ngsl-a': { exampleEn: 'New.', exampleVi: 'Mới.' },
      'ngsl-b': { exampleEn: 'X.', exampleVi: 'X.' },
      'ngsl-nope': { exampleEn: 'Y.', exampleVi: 'Y.' },
    })
    expect(raw).toEqual(snapshot)
    expect(out).not.toBe(raw)
    expect(out).toEqual([{ ...raw[0], exampleEn: 'New.', exampleVi: 'Mới.' }, raw[1]])
    expect(out[1]).toBe(raw[1])
  })
})
