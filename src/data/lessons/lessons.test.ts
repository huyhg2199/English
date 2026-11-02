import { describe, expect, it } from 'vitest'

import { getLesson } from '@/data/roadmap'
import { hasDetails, loadWords, type StudyWord } from '@/data/vocab'

import { allTenses, getLessonContent, LESSON_CONTENTS, SPELLS } from './index'
import type { Sound } from './types'

const words = await loadWords()
const ngsl = new Map<string, StudyWord>(
  words.filter((w) => w.list === 'ngsl' && hasDetails(w)).map((w) => [w.word, w as StudyWord]),
)

/** Tách IPA thành âm (âm nhiều ký tự khớp trước), bỏ dấu nhấn. */
const TOKENS = ['tʃ', 'dʒ', 'eɪ', 'aɪ', 'ɔɪ', 'oʊ', 'aʊ', 'ɪr', 'er', 'ʊr', 'iː', 'ɑː', 'ɔː', 'uː', 'ɝː', 't̬']
function ipaTokens(ipa: string): string[] {
  const s = ipa.replace(/[ˈˌ.]/g, '')
  const out: string[] = []
  for (let i = 0; i < s.length; ) {
    const t = TOKENS.find((tok) => s.startsWith(tok, i)) ?? s[i]
    out.push(t)
    i += t.length
  }
  return out
}

const content = (id: string) => getLessonContent(id)!
const sounds = (id: string): Sound[] => content(id).pronunciation!.groups.flatMap((g) => g.sounds)

describe('nội dung bài T1', () => {
  it('có nội dung cho đúng 4 bài s1-t1-w1…w4, đều là bài có thật và có đoạn phát âm + ngữ pháp', () => {
    expect(LESSON_CONTENTS.map((c) => c.lessonId)).toEqual(['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4'])
    for (const c of LESSON_CONTENTS) {
      const lesson = getLesson(c.lessonId)
      expect(lesson, c.lessonId).toBeDefined()
      expect(lesson!.sections.map((s) => s.id)).toEqual(expect.arrayContaining(['pronunciation', 'grammar']))
    }
    expect(getLessonContent('s1-t2-w1')).toBeUndefined()
  })

  it('đủ 12 nguyên âm đơn / 8 nguyên âm đôi / 24 phụ âm, đúng bộ âm giọng Mỹ', () => {
    expect(sounds('s1-t1-w1').map((s) => s.ipa)).toEqual(['iː', 'ɪ', 'e', 'æ', 'ɑː', 'ɔː', 'ʊ', 'uː', 'ʌ', 'ɝː', 'ə', 'ɚ'])
    expect(sounds('s1-t1-w2').map((s) => s.ipa)).toEqual(['eɪ', 'aɪ', 'ɔɪ', 'oʊ', 'aʊ', 'ɪr', 'er', 'ʊr'])
    const consonants = sounds('s1-t1-w3')
    expect(consonants).toHaveLength(24)
    expect(new Set(consonants.map((s) => s.ipa)).size).toBe(24)
    expect(consonants.filter((s) => s.focus).map((s) => s.ipa).sort()).toEqual(['ð', 'ʃ', 'ʒ', 'θ'].sort())
    const endings = sounds('s1-t1-w4').map((s) => s.id)
    expect(endings).toEqual(expect.arrayContaining(['e-s-s', 'e-s-z', 'e-s-iz', 'e-ed-t', 'e-ed-d', 'e-ed-id']))
  })

  it('mỗi âm có 3–5 từ ví dụ thuộc NGSL có dữ liệu; IPA của từ chứa đúng âm', () => {
    for (const c of LESSON_CONTENTS) {
      for (const s of sounds(c.lessonId)) {
        expect(s.examples.length, s.id).toBeGreaterThanOrEqual(3)
        expect(s.examples.length, s.id).toBeLessThanOrEqual(5)
        expect(s.tip.length, s.id).toBeGreaterThan(10)
        for (const ex of s.examples) {
          const word = ngsl.get(ex.word)
          expect(word, `${s.id}: ${ex.word}`).toBeDefined()
          if (s.kind !== 'ending') expect(ipaTokens(word!.ipa), `${s.id}: ${ex.word} /${word!.ipa}/`).toContain(s.ipa)
        }
      }
    }
  })

  it('cặp dễ nhầm: mọi từ có IPA; từ có trong NGSL thì IPA trùng bộ từ; hai từ khác IPA', () => {
    const pairs = LESSON_CONTENTS.flatMap((c) => sounds(c.lessonId).flatMap((s) => (s.pair ? [[s.id, s.pair] as const] : [])))
    expect(pairs.length).toBeGreaterThan(20)
    for (const [id, pair] of pairs) {
      for (const { word, ipa } of pair) {
        expect(ipa, `${id}: ${word}`).toMatch(/\S/)
        const known = ngsl.get(word)
        if (known) expect(ipa, `${id}: ${word}`).toBe(known.ipa)
      }
      expect(pair[0].ipa, id).not.toBe(pair[1].ipa)
    }
    // Các cặp cần có (story 6 review).
    const byId = new Map(pairs.map(([id, p]) => [id, p.map((x) => x.word).join('/')]))
    expect(byId.get('c-z')).toBe('zoo/sue')
    expect(byId.get('c-j')).toBe('jeep/cheap')
    expect(byId.get('c-w')).toBe('west/vest')
    expect(byId.get('c-h')).toBe('hat/at')
    expect(byId.get('c-y')).toBe('year/ear')
    for (const id of ['v-oo', 'd-ei', 'd-ai', 'd-au']) expect(byId.has(id), id).toBe(true)
  })

  it('phụ âm cuối: mỗi từ ví dụ kết thúc bằng một trong các âm được liệt kê', () => {
    const final = sounds('s1-t1-w4').find((s) => s.id === 'e-final')!
    const symbols = final.ipa.split(' ')
    for (const ex of final.examples) {
      const toks = ipaTokens(ngsl.get(ex.word)!.ipa)
      expect(symbols, `${ex.word}`).toContain(toks[toks.length - 1])
    }
    for (const sym of symbols) expect(final.tip, sym).toContain(sym)
  })

  it('âm cuối: dạng -s/-ed có IPA kết thúc đúng đuôi', () => {
    for (const s of sounds('s1-t1-w4').filter((x) => x.id.startsWith('e-s-') || x.id.startsWith('e-ed-'))) {
      for (const ex of s.examples) {
        expect(ex.form, `${s.id}: ${ex.word}`).toBeTruthy()
        expect(ex.formIpa!.endsWith(s.ipa), `${s.id}: ${ex.form} /${ex.formIpa}/`).toBe(true)
        // Dạng có đuôi bắt đầu bằng IPA gốc (bỏ dấu nhấn, flap /t̬/ coi như /t/).
        const base = ngsl.get(ex.word)!.ipa.replace(/[ˈˌ]/g, '').replace('t̬', 't')
        expect(ex.formIpa!.replace(/[ˈˌ]/g, '').replace('t̬', 't').startsWith(base), `${ex.form}`).toBe(true)
      }
    }
  })

  it('id âm, id câu mẫu, id thì là duy nhất; mỗi bài có 3–5 câu mẫu', () => {
    const soundIds = LESSON_CONTENTS.flatMap((c) => sounds(c.lessonId).map((s) => s.id))
    expect(new Set(soundIds).size).toBe(soundIds.length)
    const sentenceIds: string[] = []
    for (const c of LESSON_CONTENTS) {
      const sentences = c.pronunciation!.sentences
      expect(sentences.length, c.lessonId).toBeGreaterThanOrEqual(3)
      expect(sentences.length, c.lessonId).toBeLessThanOrEqual(5)
      for (const s of sentences) {
        expect(s.id.startsWith(`${c.lessonId}-`), s.id).toBe(true)
        expect(s.text.trim()).not.toBe('')
        expect(s.vi.trim()).not.toBe('')
        sentenceIds.push(s.id)
      }
    }
    expect(new Set(sentenceIds).size).toBe(sentenceIds.length)
    const tenseIds = allTenses().map((t) => t.id)
    expect(new Set(tenseIds).size).toBe(tenseIds.length)
  })

  it('mỗi thì: 3 quy tắc, 4–6 ví dụ có dịch, có lỗi hay mắc, ≥1 câu thoại VOA (link VOA) hoặc YouGlish', () => {
    expect(allTenses().map((t) => t.id)).toEqual(['to-be', 'present-simple', 'present-simple-questions'])
    for (const t of allTenses()) {
      expect(t.rules, t.id).toHaveLength(3)
      expect(t.examples.length, t.id).toBeGreaterThanOrEqual(4)
      expect(t.examples.length, t.id).toBeLessThanOrEqual(6)
      for (const e of t.examples) expect(e.vi.trim(), e.en).not.toBe('')
      expect(t.mistakes.length, t.id).toBeGreaterThan(0)
      expect(t.formulas.length, t.id).toBeGreaterThan(0)
      expect(t.dialogues.length, t.id).toBeGreaterThan(0)
      for (const d of t.dialogues) {
        if (d.kind === 'voa') {
          expect(d.sourceUrl, d.text).toMatch(/^https:\/\/learningenglish\.voanews\.com\/a\/lets-learn-english-lesson-/)
          expect(d.speaker && d.text && d.vi && d.episode, d.text).toBeTruthy()
        } else {
          expect(d.sourceUrl).toBe(`https://youglish.com/pronounce/${encodeURIComponent(d.phrase)}/english/us`)
        }
      }
    }
  })

  it('tuần 4 ôn tập: có tóm tắt, ghi chú và link mini test, không thì mới', () => {
    const g = content('s1-t1-w4').grammar!
    expect(g.tenses).toHaveLength(0)
    expect(g.review!.summary.length).toBeGreaterThan(0)
    expect(g.review!.note).toMatch(/Mini test 10 câu/)
    expect(g.review!.quizId).toBe('mini-t1')
  })

  it('tuần 1 có link "Làm bài đầu vào"', () => {
    expect(content('s1-t1-w1').placementLink).toBe(true)
    expect(content('s1-t1-w2').placementLink).toBeFalsy()
  })
})

describe('thần chú', () => {
  it('Lumos / Alohomora / Revelio trỏ tới bài tồn tại và thì có trong bài đó; id duy nhất', () => {
    expect(SPELLS.map((s) => [s.id, s.tenseId, s.lessonId])).toEqual([
      ['lumos', 'to-be', 's1-t1-w1'],
      ['alohomora', 'present-simple', 's1-t1-w2'],
      ['revelio', 'present-simple-questions', 's1-t1-w3'],
    ])
    for (const spell of SPELLS) {
      expect(getLesson(spell.lessonId), spell.id).toBeDefined()
      const tenses = getLessonContent(spell.lessonId)?.grammar?.tenses ?? []
      expect(tenses.find((t) => t.id === spell.tenseId)?.spellId, spell.id).toBe(spell.id)
    }
    for (const t of allTenses()) expect(SPELLS.some((s) => s.id === t.spellId), t.id).toBe(true)
  })
})
