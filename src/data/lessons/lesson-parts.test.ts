import { describe, expect, it } from 'vitest'

import { conceptSource, T1_LESSON_IDS } from '@/data/questions'
import { loadWords } from '@/data/vocab'

import { exampleFeatures } from '../../../scripts/vocab/example-features.mjs'
import { getLessonContent, LESSON_CONTENTS, lessonPartIds } from './index'
import type { LessonPart, Sound } from './types'

/** Chia bài T1 theo ngày (story 28): dữ liệu phần của đoạn Phát âm W1–W3. */

const SPLIT = ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3'] as const
const content = (id: string) => getLessonContent(id)!
const partsOf = (id: string): readonly LessonPart[] => content(id).parts ?? []
const soundsOf = (id: string): Sound[] => content(id).pronunciation?.groups.flatMap((g) => g.sounds) ?? []
const lessonIndex = (id: string) => (T1_LESSON_IDS as readonly string[]).indexOf(id)

/**
 * Lỗi của một phần (rỗng = hợp lệ): `requires` không rỗng, không trùng, mọi khái niệm có người dạy, khái niệm bài T1 chỉ
 * thuộc bài của phần hoặc bài trước; câu luyện nói không dùng ngữ pháp chưa học (`exampleFeatures` rỗng).
 */
function partViolations(lessonId: string, part: LessonPart): string[] {
  const out: string[] = []
  if (part.requires.length === 0) out.push(`${part.id}: requires rỗng`)
  if (new Set(part.requires).size !== part.requires.length) out.push(`${part.id}: requires trùng`)
  for (const c of part.requires) {
    const source = conceptSource(c)
    if (!source) out.push(`${part.id}: khái niệm lạ "${c}"`)
    else if ('lesson' in source && lessonIndex(source.lesson) > lessonIndex(lessonId)) {
      out.push(`${part.id}: "${c}" dạy ở ${source.lesson}, sau bài của phần`)
    }
  }
  for (const s of part.sentences) {
    const features = exampleFeatures(s.text)
    if (features.length > 0) out.push(`${s.id}: "${s.text}" dùng ${features.join(', ')}`)
  }
  return out
}

/**
 * Cặp dễ nhầm: âm → âm bị so (theo từ thứ hai của cặp). `c-h` (hat – at) so có / không có /h/; "at" bắt đầu bằng /æ/ (W1).
 */
const PAIR_CONTRAST: Readonly<Record<string, string>> = {
  // W1
  'v-ii': 'v-i',
  'v-i': 'v-ii',
  'v-e': 'v-ae',
  'v-ae': 'v-e',
  'v-aa': 'v-ae',
  'v-oo': 'v-er-long',
  'v-u': 'v-uu',
  'v-uu': 'v-u',
  'v-uh': 'v-ae',
  'v-er-long': 'v-aa',
  // W2
  'd-ei': 'v-e',
  'd-ai': 'd-ei',
  'd-ou': 'v-aa',
  'd-au': 'd-ou',
  'd-ir': 'd-er',
  'd-er': 'd-ir',
  // W3
  'c-f': 'c-v',
  'c-v': 'c-f',
  'c-th': 'c-s',
  'c-dh': 'c-d',
  'c-s': 'c-z',
  'c-z': 'c-s',
  'c-sh': 'c-s',
  'c-ch': 'c-sh',
  'c-j': 'c-ch',
  'c-h': 'v-ae',
  'c-n': 'c-ng',
  'c-ng': 'c-n',
  'c-l': 'c-r',
  'c-r': 'c-l',
  'c-y': 'd-ir',
  'c-w': 'c-v',
}

/** Vị trí (bài, phần) của âm trong W1–W3; âm không thuộc phần nào → undefined. */
function soundPosition(soundId: string): { lesson: number; part: number } | undefined {
  for (const lessonId of SPLIT) {
    const part = partsOf(lessonId).findIndex((p) => p.soundIds.includes(soundId))
    if (part >= 0) return { lesson: lessonIndex(lessonId), part }
  }
  return undefined
}

/**
 * IPA kiểu Mỹ của từ trong câu luyện nói không có dạng gốc trong NGSL (hư từ, dạng chia, số nhiều). Từ khác tra `words.json`.
 */
const EXTRA_IPA: Readonly<Record<string, string>> = {
  is: 'ɪz',
  my: 'maɪ',
  your: 'jʊr',
  her: 'hɝː',
  knows: 'noʊz',
  their: 'ðer',
  our: 'aʊr',
  chairs: 'tʃerz',
  "don't": 'doʊnt',
  does: 'dʌz',
  has: 'hæz',
  makes: 'meɪks',
  tv: 'ˌtiːˈviː',
  "doesn't": 'ˈdʌzənt',
  things: 'θɪŋz',
  jobs: 'dʒɑːbz',
}

const words = await loadWords()
const NGSL_IPA = new Map(words.map((w) => [w.word.toLowerCase(), w.ipa]))

/** IPA nối của mọi từ trong câu của phần; từ không tra được → lỗi (thêm vào `EXTRA_IPA`). */
function sentencesIpa(part: LessonPart): { ipa: string; unknown: string[] } {
  const tokens = part.sentences.flatMap((s) => s.text.toLowerCase().replace(/[^a-z' ]/g, '').split(/\s+/).filter(Boolean))
  const unknown = tokens.filter((t) => !(t in EXTRA_IPA) && !NGSL_IPA.has(t))
  return { ipa: tokens.map((t) => EXTRA_IPA[t] ?? NGSL_IPA.get(t) ?? '').join(' '), unknown }
}

describe('phần của đoạn Phát âm (story 28)', () => {
  it('W1 3 phần (4-4-4), W2 2 phần (5-3), W3 4 phần (6-6-6-6); W4, T2–T4 không có parts', () => {
    expect(partsOf('s1-t1-w1').map((p) => p.soundIds.length)).toEqual([4, 4, 4])
    expect(partsOf('s1-t1-w2').map((p) => p.soundIds.length)).toEqual([5, 3])
    expect(partsOf('s1-t1-w3').map((p) => p.soundIds.length)).toEqual([6, 6, 6, 6])
    for (const c of LESSON_CONTENTS) {
      if ((SPLIT as readonly string[]).includes(c.lessonId)) continue
      expect(c.parts, c.lessonId).toBeUndefined()
      expect(lessonPartIds(c.lessonId), c.lessonId).toEqual([])
    }
    expect(lessonPartIds('khong-co')).toEqual([])
  })

  it('soundIds chia hết bộ âm của bài, mỗi âm đúng 1 lần', () => {
    for (const lessonId of SPLIT) {
      const fromParts = partsOf(lessonId).flatMap((p) => p.soundIds)
      expect(new Set(fromParts).size, lessonId).toBe(fromParts.length)
      expect([...fromParts].sort(), lessonId).toEqual(soundsOf(lessonId).map((s) => s.id).sort())
    }
  })

  it('phần cuối W1 có v-er-long, v-er-weak; phần cuối W3 là 4 âm ★ và /tʃ dʒ/', () => {
    expect(partsOf('s1-t1-w1').at(-1)!.soundIds).toEqual(expect.arrayContaining(['v-er-long', 'v-er-weak']))
    const last = partsOf('s1-t1-w3').at(-1)!.soundIds
    const focus = soundsOf('s1-t1-w3').filter((s) => s.focus).map((s) => s.id)
    expect(focus).toHaveLength(4)
    expect(last).toEqual(expect.arrayContaining(focus))
    expect(last).toEqual(['c-th', 'c-dh', 'c-sh', 'c-zh', 'c-ch', 'c-j'])
  })

  it('cặp dễ nhầm chỉ so với âm cùng phần, phần trước hoặc bài T1 trước; mọi âm có cặp đều có trong bảng', () => {
    const paired = SPLIT.flatMap((id) => soundsOf(id)).filter((s) => s.pair)
    expect(paired.map((s) => s.id).sort()).toEqual(Object.keys(PAIR_CONTRAST).sort())
    for (const [sound, other] of Object.entries(PAIR_CONTRAST)) {
      const a = soundPosition(sound)!
      const b = soundPosition(other)!
      expect(a, sound).toBeDefined()
      expect(b, other).toBeDefined()
      const ok = b.lesson < a.lesson || (b.lesson === a.lesson && b.part <= a.part)
      expect(ok, `${sound} so với ${other}`).toBe(true)
    }
    // Cặp của /s/ là sue – zoo (cùng Nhóm 2 với /z/), không còn sea – she.
    const s = soundsOf('s1-t1-w3').find((x) => x.id === 'c-s')!
    expect(s.pair!.map((p) => p.word)).toEqual(['sue', 'zoo'])
    expect(s.pair!.map((p) => p.ipa)).toEqual(['suː', 'zuː'])
  })

  it('câu luyện nói của phần có mặt mọi âm của phần (theo IPA NGSL), nên luyện nói đúng âm vừa học', () => {
    for (const lessonId of SPLIT) {
      const sounds = soundsOf(lessonId)
      for (const p of partsOf(lessonId)) {
        const { ipa, unknown } = sentencesIpa(p)
        expect(unknown, p.id).toEqual([])
        const missing = p.soundIds.filter((id) => !ipa.includes(sounds.find((s) => s.id === id)!.ipa))
        expect(missing, p.id).toEqual([])
      }
    }
  })

  it('id phần `${lessonId}-p${n}`, id câu `${partId}-say-${k}`, mỗi phần 2–3 câu có text / vi; lessonPartIds theo thứ tự', () => {
    for (const lessonId of SPLIT) {
      const parts = partsOf(lessonId)
      expect(lessonPartIds(lessonId)).toEqual(parts.map((p) => p.id))
      parts.forEach((p, i) => {
        expect(p.id).toBe(`${lessonId}-p${i + 1}`)
        expect(p.title.trim() && p.note.trim(), p.id).toBeTruthy()
        expect(p.sentences.length, p.id).toBeGreaterThanOrEqual(2)
        expect(p.sentences.length, p.id).toBeLessThanOrEqual(3)
        p.sentences.forEach((s, k) => {
          expect(s.id).toBe(`${p.id}-say-${k + 1}`)
          expect(s.text.trim() && s.vi.trim(), s.id).toBeTruthy()
        })
      })
    }
  })

  it('câu của phần chỉ dùng kiến thức đã dạy: requires hợp lệ, exampleFeatures rỗng', () => {
    for (const lessonId of SPLIT) {
      for (const p of partsOf(lessonId)) expect(partViolations(lessonId, p), p.id).toEqual([])
    }
  })

  it('tự kiểm: phần W1 khai báo present-simple (dạy ở W2), khái niệm lạ, trùng, rỗng hay câu quá khứ → báo lỗi', () => {
    const p1 = partsOf('s1-t1-w1')[0]
    expect(partViolations('s1-t1-w1', { ...p1, requires: [...p1.requires, 'present-simple'] })).toEqual([
      's1-t1-w1-p1: "present-simple" dạy ở s1-t1-w2, sau bài của phần',
    ])
    expect(partViolations('s1-t1-w1', { ...p1, requires: [] })).toEqual(['s1-t1-w1-p1: requires rỗng'])
    expect(partViolations('s1-t1-w1', { ...p1, requires: ['ipa', 'ipa'] })).toEqual(['s1-t1-w1-p1: requires trùng'])
    expect(
      partViolations('s1-t1-w1', { ...p1, requires: ['khong-co'] as unknown as LessonPart['requires'] }),
    ).toEqual(['s1-t1-w1-p1: khái niệm lạ "khong-co"'])
    const past = { ...p1, sentences: [{ id: 'x', text: 'She worked late.', vi: 'x' }] }
    expect(partViolations('s1-t1-w1', past)).toEqual(['x: "She worked late." dùng past'])
  })
})
