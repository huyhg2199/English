import { describe, expect, it } from 'vitest'

import { getLesson, getSection } from '@/data/roadmap'
import { hasDetails, loadWords, type StudyWord } from '@/data/vocab'

import { allTenses, getLessonContent, IRREGULAR_VERBS, LESSON_CONTENTS, SPELLS } from './index'
import type { PronunciationBlock, Sound } from './types'

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
const sounds = (id: string): Sound[] => content(id).pronunciation?.groups.flatMap((g) => g.sounds) ?? []
const WITH_PRONUNCIATION = LESSON_CONTENTS.filter((c) => c.pronunciation)
const blocks = (): PronunciationBlock[] => LESSON_CONTENTS.flatMap((c) => c.pronunciation?.blocks ?? [])
const blocksOf = <K extends PronunciationBlock['kind']>(kind: K) =>
  blocks().filter((b): b is Extract<PronunciationBlock, { kind: K }> => b.kind === kind)

const T1 = ['s1-t1-w1', 's1-t1-w2', 's1-t1-w3', 's1-t1-w4']
const T2_T4 = [
  's1-t2-w1', 's1-t2-w2', 's1-t2-w3', 's1-t2-w4',
  's1-t3-w1', 's1-t3-w2', 's1-t3-w3', 's1-t3-w4',
  's1-t4-w1', 's1-t4-w2', 's1-t4-w3', 's1-t4-w4',
]

describe('nội dung bài T1', () => {
  it('có nội dung cho đúng 16 bài chặng 1 (T1–T4), đều là bài có thật; đoạn nội dung tồn tại trong bài', () => {
    expect(LESSON_CONTENTS.map((c) => c.lessonId)).toEqual([...T1, ...T2_T4])
    for (const c of LESSON_CONTENTS) {
      const lesson = getLesson(c.lessonId)
      expect(lesson, c.lessonId).toBeDefined()
      if (c.pronunciation || c.lazyWeek) expect(getSection(c.lessonId, 'pronunciation'), c.lessonId).toBeDefined()
      if (c.grammar) expect(getSection(c.lessonId, 'grammar'), c.lessonId).toBeDefined()
    }
    expect(getLessonContent('s2-t5-w1')).toBeUndefined()
  })

  it('đủ 12 nguyên âm đơn / 8 nguyên âm đôi / 24 phụ âm, đúng bộ âm giọng Mỹ', () => {
    expect(sounds('s1-t1-w1').map((s) => s.ipa)).toEqual(['iː', 'ɪ', 'e', 'æ', 'ɑː', 'ɔː', 'ʊ', 'uː', 'ʌ', 'ɝː', 'ə', 'ɚ'])
    expect(sounds('s1-t1-w2').map((s) => s.ipa)).toEqual(['eɪ', 'aɪ', 'ɔɪ', 'oʊ', 'aʊ', 'ɪr', 'er', 'ʊr'])
    const consonants = sounds('s1-t1-w3')
    expect(consonants).toHaveLength(24)
    expect(new Set(consonants.map((s) => s.ipa)).size).toBe(24)
    expect(consonants.filter((s) => s.focus).map((s) => s.ipa).sort()).toEqual(['ð', 'ʃ', 'ʒ', 'θ'].sort())
    // Tuần 4 chỉ dạy đuôi -s; đuôi -ed học ở T2 tuần 3 (story 27: chỉ dùng kiến thức đã dạy).
    const endings = sounds('s1-t1-w4').map((s) => s.id)
    expect(endings).toEqual(expect.arrayContaining(['e-s-s', 'e-s-z', 'e-s-iz']))
    expect(endings.filter((id) => id.startsWith('e-ed-'))).toEqual([])
  })

  it('mỗi âm có 3–5 từ ví dụ thuộc NGSL có dữ liệu; IPA của từ chứa đúng âm', () => {
    for (const c of WITH_PRONUNCIATION) {
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
    const pairs = WITH_PRONUNCIATION.flatMap((c) => sounds(c.lessonId).flatMap((s) => (s.pair ? [[s.id, s.pair] as const] : [])))
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

  it('âm cuối: dạng -s/-ed có IPA kết thúc đúng đuôi (T1 tuần 4 và T2 tuần 3)', () => {
    const forms = [
      ...sounds('s1-t1-w4').filter((x) => x.id.startsWith('e-s-')),
      ...sounds('s1-t2-w3'),
    ]
    expect(sounds('s1-t2-w3').map((x) => x.ipa)).toEqual(['t', 'd', 'ɪd'])
    for (const s of forms) {
      for (const ex of s.examples) {
        expect(ex.form, `${s.id}: ${ex.word}`).toBeTruthy()
        expect(ex.formIpa!.endsWith(s.ipa), `${s.id}: ${ex.form} /${ex.formIpa}/`).toBe(true)
        // Dạng có đuôi bắt đầu bằng IPA gốc (bỏ dấu nhấn, flap /t̬/ coi như /t/).
        const base = ngsl.get(ex.word)!.ipa.replace(/[ˈˌ]/g, '').replace('t̬', 't')
        expect(ex.formIpa!.replace(/[ˈˌ]/g, '').replace('t̬', 't').startsWith(base), `${ex.form}`).toBe(true)
      }
    }
  })

  it('id âm, id câu mẫu / shadowing / chính tả, id thì là duy nhất; mỗi bài có 3–5 câu mẫu', () => {
    const soundIds = LESSON_CONTENTS.flatMap((c) => sounds(c.lessonId).map((s) => s.id))
    expect(new Set(soundIds).size).toBe(soundIds.length)
    const sentenceIds: string[] = []
    for (const c of WITH_PRONUNCIATION) {
      for (const b of c.pronunciation!.blocks ?? []) {
        const extra = b.kind === 'shadowing' ? b.lines : b.kind === 'dictation' ? b.items : []
        for (const s of extra) {
          expect(s.id.startsWith(`${c.lessonId}-`), s.id).toBe(true)
          expect(s.text.trim() && s.vi.trim(), s.id).toBeTruthy()
          sentenceIds.push(s.id)
        }
      }
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

  it('TO_BE (bài s1-t1-w1) là thẻ ôn lại viên gạch F13–F14 (story 26)', () => {
    const toBe = content('s1-t1-w1').grammar!.tenses.find((t) => t.id === 'to-be')!
    expect(toBe.name.startsWith('Ôn lại: viên gạch F13–F14')).toBe(true)
    expect(toBe.name).toBe('Ôn lại: viên gạch F13–F14 · to be (am / is / are)')
  })

  it('mỗi thì: 3 quy tắc, 4–6 ví dụ có dịch, có lỗi hay mắc, ≥1 câu thoại VOA (link VOA) hoặc YouGlish', () => {
    expect(allTenses().map((t) => t.id)).toEqual([
      'to-be',
      'present-simple',
      'present-simple-questions',
      'present-continuous',
      'past-simple',
      'past-simple-irregular',
      'will',
      'going-to',
      'present-perfect',
      'present-perfect-vs-past',
      'modals',
      'comparatives',
      'passive-present',
    ])
    // Thì có dòng thời gian; động từ khuyết thiếu, so sánh, bị động thì không.
    for (const t of allTenses()) {
      expect(Boolean(t.timeline), t.id).toBe(!['modals', 'comparatives', 'passive-present'].includes(t.id))
    }
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

  it('T2 tuần 4 ôn tập: link mini test T2, không thì mới', () => {
    const g = content('s1-t2-w4').grammar!
    expect(g.tenses).toHaveLength(0)
    expect(g.review!.quizId).toBe('mini-t2')
    expect(g.review!.note).toMatch(/Mini test 10 câu/)
  })

  it('mỗi bài T2–T4 (trừ tuần Tết, O.W.L.) có cả phát âm và ngữ pháp', () => {
    for (const id of T2_T4.filter((x) => x !== 's1-t4-w2' && x !== 's1-t4-w4')) {
      const c = content(id)
      expect(c.pronunciation, id).toBeDefined()
      expect(c.grammar, id).toBeDefined()
      const p = c.pronunciation!
      expect(p.groups.length + (p.blocks?.length ?? 0), id).toBeGreaterThan(0)
    }
  })

  it('tuần Tết chỉ nhắc ngày lười: không phát âm, không ngữ pháp', () => {
    const c = content('s1-t4-w2')
    expect(c.lazyWeek).toBe(true)
    expect(c.pronunciation).toBeUndefined()
    expect(c.grammar).toBeUndefined()
  })

  it('tuần O.W.L. 1 chỉ có ôn tổng (âm + thì), link về đúng đoạn của bài tồn tại', () => {
    const c = content('s1-t4-w4')
    expect(c.grammar).toBeUndefined()
    const overview = c.pronunciation!.blocks!.filter((b) => b.kind === 'overview')
    expect(overview).toHaveLength(2)
    const linked = new Set(overview.flatMap((b) => (b.kind === 'overview' ? b.items.map((i) => i.lessonId) : [])))
    for (const t of allTenses()) {
      const owner = LESSON_CONTENTS.find((x) => x.grammar?.tenses.includes(t))!
      expect(linked.has(owner.lessonId), t.id).toBe(true)
    }
    // Mọi bài chặng 1 có đoạn phát âm (trừ chính tuần ôn) đều có dòng link về đoạn Phát âm.
    const soundLinks = new Set(
      overview.flatMap((b) => (b.kind === 'overview' ? b.items.filter((i) => i.sectionId === 'pronunciation').map((i) => i.lessonId) : [])),
    )
    for (const x of WITH_PRONUNCIATION.filter((x) => x.lessonId !== 's1-t4-w4')) {
      expect(soundLinks.has(x.lessonId), x.lessonId).toBe(true)
    }
  })

  it('mọi bài có tình huống luyện nói tiếng Anh', () => {
    for (const c of LESSON_CONTENTS) {
      expect(c.roleplay?.scenario, c.lessonId).toMatch(/^[\x20-\x7E–]+$/)
      expect(c.roleplay?.topicEn, c.lessonId).toMatch(/^[\x20-\x7E–]+$/)
      expect(c.roleplay?.vi.trim(), c.lessonId).toBeTruthy()
    }
  })

  it('không bài nào có nút bài đầu vào (CAP-3: Mũ Phân Loại chỉ chọn Nhà)', () => {
    for (const c of LESSON_CONTENTS) expect(Object.keys(c), c.lessonId).not.toContain('placementLink')
  })
})

describe('khối phát âm mới', () => {
  it('trọng âm: mỗi từ thuộc NGSL có dữ liệu và khớp luật của nhóm', () => {
    const rules = blocksOf('stress').flatMap((b) => b.rules)
    expect(rules.length).toBe(6)
    for (const r of rules) {
      expect(r.words.length, r.id).toBeGreaterThanOrEqual(5)
      for (const word of r.words) {
        const w = ngsl.get(word)
        expect(w, `${r.id}: ${word}`).toBeDefined()
        const syl = w!.syllables!
        if (r.expect.kind === 'index') {
          expect(syl.length, `${r.id}: ${word}`).toBe(r.expect.syllables)
          expect(w!.stressIndex, `${r.id}: ${word}`).toBe(r.expect.index)
        } else {
          expect(word.endsWith(r.expect.suffix), `${r.id}: ${word}`).toBe(true)
          expect(w!.stressIndex, `${r.id}: ${word}`).toBe(syl.length - r.expect.suffixSyllables - 1)
        }
      }
    }
  })

  it('đủ các khối: dạng yếu (to, of, and, can, a), nối âm, trọng âm câu, rút gọn, shadowing, chính tả, tự đọc 20 từ', () => {
    expect(blocksOf('weak-forms')[0].items.map((i) => i.word)).toEqual(expect.arrayContaining(['to', 'of', 'and', 'can', 'a']))
    expect(blocksOf('reductions')[0].items.map((i) => i.reduced)).toEqual(
      expect.arrayContaining(['wanna', 'gotta', "I'd", "you'll"]),
    )
    expect(blocksOf('linking')[0].items.length).toBeGreaterThanOrEqual(4)
    expect(blocksOf('shadowing')).toHaveLength(2)
    expect(blocksOf('dictation')[0].items).toHaveLength(5)
    expect(blocksOf('self-read')[0].words).toHaveLength(20)
  })

  it('trọng âm câu: chỉ số từ được nhấn hợp lệ, không trùng', () => {
    for (const it of blocksOf('sentence-stress').flatMap((b) => b.items)) {
      const n = it.text.split(/\s+/).length
      expect(it.stressed.length, it.text).toBeGreaterThan(0)
      expect(new Set(it.stressed).size, it.text).toBe(it.stressed.length)
      for (const i of it.stressed) expect(i >= 0 && i < n, it.text).toBe(true)
    }
  })

  it('tự đọc: 20 từ NGSL có dữ liệu, không trùng; rút gọn có link YouGlish', () => {
    const words = blocksOf('self-read')[0].words
    expect(new Set(words).size).toBe(words.length)
    for (const w of words) expect(ngsl.get(w), w).toBeDefined()
    for (const it of blocksOf('reductions').flatMap((b) => b.items)) {
      expect(it.youglishUrl).toMatch(/^https:\/\/youglish\.com\/pronounce\/.+\/english\/us$/)
    }
  })

  it('ôn tổng: mọi link trỏ tới bài và đoạn tồn tại', () => {
    for (const it of blocksOf('overview').flatMap((b) => b.items)) {
      expect(getSection(it.lessonId, it.sectionId), `${it.lessonId}/${it.sectionId}`).toBeDefined()
    }
  })
})

describe('bảng động từ bất quy tắc', () => {
  it('50 động từ ở s1-t2-w3, V1 không trùng và thuộc NGSL, đủ V2 / V3 / nghĩa', () => {
    expect(content('s1-t2-w3').grammar!.irregularVerbs).toBe(IRREGULAR_VERBS)
    expect(IRREGULAR_VERBS).toHaveLength(50)
    expect(new Set(IRREGULAR_VERBS.map((v) => v.v1)).size).toBe(50)
    for (const v of IRREGULAR_VERBS) {
      expect(ngsl.get(v.v1), v.v1).toBeDefined()
      expect(v.v2.trim() && v.v3.trim() && v.vi.trim(), v.v1).toBeTruthy()
    }
    const go = IRREGULAR_VERBS.find((v) => v.v1 === 'go')!
    expect([go.v2, go.v3]).toEqual(['went', 'gone'])
  })
})

describe('thần chú', () => {
  it('thần chú trỏ tới bài tồn tại và thì có trong bài đó; id duy nhất; có tên chủ điểm tiếng Anh cho prompt', () => {
    expect(SPELLS.map((s) => [s.id, s.tenseId, s.lessonId])).toEqual([
      ['lumos', 'to-be', 's1-t1-w1'],
      ['alohomora', 'present-simple', 's1-t1-w2'],
      ['revelio', 'present-simple-questions', 's1-t1-w3'],
      ['accio', 'present-continuous', 's1-t2-w1'],
      ['obliviate', 'past-simple', 's1-t2-w2'],
      ['reparo', 'past-simple-irregular', 's1-t2-w3'],
      ['protego', 'will', 's1-t3-w1'],
      ['wingardium-leviosa', 'going-to', 's1-t3-w2'],
      ['expecto-patronum', 'present-perfect', 's1-t3-w3'],
      ['expelliarmus', 'modals', 's1-t4-w1'],
      ['riddikulus', 'comparatives', 's1-t4-w3'],
      ['finite', 'passive-present', 's1-t4-w3'],
    ])
    expect(new Set(SPELLS.map((s) => s.id)).size).toBe(SPELLS.length)
    for (const spell of SPELLS) expect(spell.grammarEn.trim(), spell.id).toBeTruthy()
    for (const spell of SPELLS) {
      expect(getLesson(spell.lessonId), spell.id).toBeDefined()
      const tenses = getLessonContent(spell.lessonId)?.grammar?.tenses ?? []
      expect(tenses.find((t) => t.id === spell.tenseId)?.spellId, spell.id).toBe(spell.id)
    }
    // Thì nào cũng có thần chú, trừ chủ điểm so sánh hoàn thành / quá khứ đơn (spec không gán thần chú).
    for (const t of allTenses()) {
      if (t.id === 'present-perfect-vs-past') expect(t.spellId).toBeUndefined()
      else expect(SPELLS.some((s) => s.id === t.spellId), t.id).toBe(true)
    }
  })
})
