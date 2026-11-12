import { describe, expect, it } from 'vitest'

import { allLessons, getLesson, getSection } from '@/data/roadmap'
import { getBrick } from '@/data/foundation/content'
import { BRICK_IDS } from '@/data/foundation'
import { QUESTION_BANK } from '@/data/questions'
import { hasDetails, loadWords, type StudyWord } from '@/data/vocab'
import type { CheckItem } from '@/data/foundation/types'
import { isCorrect, isFadedCorrect } from '@/lib/foundation/player'
import { hasVietnameseMarks, normalizeTyped } from '@/lib/quiz/typed'
import { hasPractice, practiceEnglishTexts, practiceItemIds, practiceProblems, type PracticeTense } from '@/lib/tense-practice'
import { frontedTimeTail, isTenseScopeId, outOfScopeWords, promptEnglish, TENSE_SCOPE_IDS } from '@/lib/tense-scope'

import {
  allTenseChoices,
  allTenses,
  getLessonContent,
  IRREGULAR_VERB_CARDS,
  IRREGULAR_VERB_GROUPS,
  IRREGULAR_VERBS,
  IRREGULAR_VERBS_LESSON_ID,
  LESSON_CONTENTS,
  lessonRuleCards,
  SPELLS,
} from './index'
import type { PronunciationBlock, Sound, TenseChoice } from './types'

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
      // Câu luyện nói của các phần (story 28) cũng không được trùng id với câu nào khác.
      for (const p of c.parts ?? []) {
        for (const s of p.sentences) {
          expect(s.id.startsWith(`${c.lessonId}-`), s.id).toBe(true)
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
      'past-to-be',
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
    // Thì nào cũng có thần chú, trừ chủ điểm so sánh hoàn thành / quá khứ đơn (spec không gán thần chú) và was / were
    // (Obliviate của bài đã bao luôn, story 33).
    for (const t of allTenses()) {
      if (t.id === 'present-perfect-vs-past' || t.id === 'past-to-be') expect(t.spellId, t.id).toBeUndefined()
      else expect(SPELLS.some((s) => s.id === t.spellId), t.id).toBe(true)
    }
  })
})

describe('sửa lỗi nội dung thì (story 32)', () => {
  const tense = (id: string) => {
    const t = allTenses().find((x) => x.id === id)
    if (!t) throw new Error(`thiếu Tense ${id}`)
    return t
  }
  const CAN = /\bcan(not|'t)?\b/i

  it('quy tắc gấp đôi phụ âm của tiếp diễn và quá khứ đơn đủ điều kiện, không còn câu cũ', () => {
    for (const id of ['present-continuous', 'past-simple']) {
      const rules = tense(id).rules.join(' ')
      expect(rules, id).toContain('visit →')
      expect(rules, id).toContain('w, x, y')
      expect(rules, id).toContain('chữ nguyên âm (a, e, i, o, u)')
      expect(rules, id).toContain('hai chữ nguyên âm thì không')
      expect(rules, id).toContain('rain →')
      expect(rules, id).toContain('Từ hai âm tiết có đuôi như vậy')
      expect(rules, id).not.toContain('sau một nguyên âm ngắn')
      expect(rules, id).not.toContain('một nguyên âm ngắn + phụ âm thì gấp đôi')
    }
  })

  it('quá khứ đơn ghi ngoại lệ to be không mượn did', () => {
    expect(tense('past-simple').rules.join(' ')).toContain('không phải Did you be')
  })

  it('câu ví dụ và câu luyện nói bắt đầu bằng Did không dịch thành "…chưa?"', () => {
    const pairs = [
      ...allTenses().flatMap((t) => t.examples.map((e) => ({ en: e.en, vi: e.vi }))),
      ...LESSON_CONTENTS.flatMap((c) => [
        ...(c.pronunciation?.sentences ?? []),
        ...(c.parts ?? []).flatMap((p) => p.sentences),
        ...(c.pronunciation?.blocks ?? []).flatMap((b) =>
          b.kind === 'shadowing' ? b.lines : b.kind === 'dictation' ? b.items : [],
        ),
      ]).map((s) => ({ en: s.text, vi: s.vi })),
    ]
    const did = pairs.filter((p) => /^Did\b/.test(p.en))
    expect(did.length).toBeGreaterThan(0)
    for (const p of did) expect(p.vi, p.en).not.toContain('chưa')
  })

  it('PERFECT_VS_PAST có lỗi "…chưa?", PRESENT_PERFECT có lỗi been to / gone to', () => {
    expect(
      tense('present-perfect-vs-past').mistakes.some((m) => m.right.startsWith('Did you') && m.why.includes('chưa')),
    ).toBe(true)
    expect(
      tense('present-perfect').mistakes.some((m) => [m.wrong, m.right, m.why].some((s) => s.includes('been to'))),
    ).toBe(true)
  })

  it('T3-W1 chưa dùng can: câu luyện nói và Tense will', () => {
    const c = content('s1-t3-w1')
    const sentences = [...(c.pronunciation?.sentences ?? []), ...(c.parts ?? []).flatMap((p) => p.sentences)]
    for (const s of sentences) expect(s.text, s.id).not.toMatch(CAN)
    const will = tense('will')
    const texts = [
      ...will.formulas.map((f) => f.text),
      ...will.rules,
      ...will.examples.flatMap((e) => [e.en, e.vi]),
      ...will.mistakes.flatMap((m) => [m.wrong, m.right, m.why]),
    ]
    for (const t of texts) expect(t).not.toMatch(CAN)
  })
})

describe('to be quá khứ và Wh + did (story 33)', () => {
  const tense = (id: string) => {
    const t = allTenses().find((x) => x.id === id)
    if (!t) throw new Error(`thiếu Tense ${id}`)
    return t
  }
  const fill = (cloze: string, answer: string) => cloze.replace('___', answer)
  /** Dạng V2 / V3 bất quy tắc chưa dạy ở s1-t2-w2 (trừ was / were / did và dạng trùng V1). */
  const FORBIDDEN = new Set(
    IRREGULAR_VERBS.flatMap((v) => [...v.v2.split(' / '), ...v.v3.split(' / ')].filter((f) => f !== v.v1))
      .map((f) => f.toLowerCase())
      .filter((f) => !['was', 'were', 'did'].includes(f)),
  )
  const irregularIn = (text: string) =>
    (text.toLowerCase().match(/[a-z']+/g) ?? []).map((w) => w.replace(/'.*$/, '')).filter((w) => FORBIDDEN.has(w))

  it('đoạn Ngữ pháp s1-t2-w2: was / were đứng trước động từ có quy tắc', () => {
    expect(content('s1-t2-w2').grammar!.tenses.map((t) => t.id)).toEqual(['past-to-be', 'past-simple'])
    expect(tense('past-to-be').name).toBe('Quá khứ đơn: to be (was / were)')
  })

  it('past-to-be có khẳng định, phủ định, câu hỏi, there was / were và chữ cần có', () => {
    const t = tense('past-to-be')
    expect(t.formulas.map((f) => f.label)).toEqual(['Khẳng định', 'Phủ định', 'Câu hỏi', 'There was / were'])
    const all = [
      ...t.formulas.map((f) => f.text),
      ...t.rules,
      ...t.examples.map((e) => e.en),
      ...t.mistakes.flatMap((m) => [m.wrong, m.right]),
    ].join(' ')
    for (const s of ["wasn't", "weren't", 'Yes, I was', 'There were', 'Where were you']) expect(all, s).toContain(s)
    expect(t.mistakes.map((m) => m.wrong)).toEqual(
      expect.arrayContaining(['Did you be at home?', "I didn't was tired.", 'I was work late.']),
    )
  })

  it('PAST_SIMPLE: có dòng "Câu hỏi Wh-" với did và ví dụ Wh + did, không còn dòng "To be"', () => {
    const t = tense('past-simple')
    const wh = t.formulas.find((f) => f.label === 'Câu hỏi Wh-')
    expect(wh?.text).toMatch(/\bdid\b/)
    expect(t.formulas.some((f) => f.label === 'To be')).toBe(false)
    expect(t.examples.some((e) => /^(What|Where|When|Who)\b.*\bdid\b/.test(e.en))).toBe(true)
  })

  it('câu tiếng Anh của past-to-be và past-simple không dùng V2 / V3 bất quy tắc khác was / were / did, không có some / any / many / because / so', () => {
    const texts = ['past-to-be', 'past-simple'].flatMap((id) => {
      const t = tense(id)
      return [
        ...t.examples.map((e) => e.en),
        ...t.mistakes.map((m) => m.right),
        ...(t.ruleCards ?? []).map((r) => fill(r.cloze, r.answer)),
      ]
    })
    expect(texts).toContain('Where did you stay in Da Nang? — At a small hotel.')
    for (const text of texts) {
      expect(irregularIn(text), text).toEqual([])
      const ws = text.toLowerCase().match(/[a-z']+/g) ?? []
      expect(ws.filter((w) => ['some', 'any', 'many', 'because', 'so'].includes(w)), text).toEqual([])
    }
  })

  it('past-to-be có lỗi thiếu was / were ("I tired yesterday.") và lỗi "I was work" không cấm was / were + V-ing', () => {
    const t = tense('past-to-be')
    expect(t.mistakes.find((m) => m.wrong === 'I tired yesterday.')?.right).toBe('I was tired yesterday.')
    expect(t.mistakes.find((m) => m.wrong === 'I was work late.')?.why).toContain('nguyên mẫu')
  })

  it('thẻ quy tắc của thì: đúng một ___, answer không rỗng, id <tenseId>-rule-n, không trùng nhau và không trùng thẻ viên gạch', () => {
    const brickCardIds = new Set(BRICK_IDS.flatMap((id) => (getBrick(id)?.ruleCards ?? []).map((r) => r.id)))
    const seen = new Set<string>()
    let count = 0
    for (const t of allTenses()) {
      for (const r of t.ruleCards ?? []) {
        count++
        expect(r.cloze.split('___'), r.id).toHaveLength(2)
        expect(r.answer.trim(), r.id).not.toBe('')
        expect(r.vi.trim(), r.id).not.toBe('')
        expect(r.id).toMatch(new RegExp(`^${t.id}-rule-\\d+$`))
        expect(seen.has(r.id), r.id).toBe(false)
        expect(brickCardIds.has(r.id), r.id).toBe(false)
        seen.add(r.id)
      }
    }
    expect(count).toBeGreaterThanOrEqual(3)
  })

  it('lessonRuleCards: thẻ của mọi thì trong bài theo thứ tự; bài không có thẻ → []', () => {
    const n = (id: string, count: number) => Array.from({ length: count }, (_, i) => `${id}-rule-${i + 1}`)
    expect(lessonRuleCards('s1-t2-w2').map((r) => r.id)).toEqual([...n('past-to-be', 4), ...n('past-simple', 4)])
    // Story 38: mọi thì (trừ to be) có thẻ; bài không có thì (ôn tập) và s1-t1-w1 (to be) → [].
    expect(lessonRuleCards('s1-t2-w1').map((r) => r.id)).toEqual(n('present-continuous', 5))
    expect(lessonRuleCards('s1-t1-w1')).toEqual([])
    expect(lessonRuleCards('s1-t2-w4')).toEqual([])
    expect(lessonRuleCards('nope')).toEqual([])
  })

  it('ôn T2-W4 có dòng was / were và "Did you be" trong dòng Không trộn', () => {
    const summary = content('s1-t2-w4').grammar!.review!.summary
    expect(summary.some((l) => l.startsWith('Quá khứ của to be: was / were'))).toBe(true)
    expect(summary.find((l) => l.startsWith('Không trộn'))).toContain('Did you be')
  })
})

describe('luyện có bậc (story 35)', () => {
  const withPractice = allTenses().filter(hasPractice)
  const pc = () => {
    const t = allTenses().find((x) => x.id === 'present-continuous')
    if (!t?.practice) throw new Error('present-continuous chưa có practice')
    return t.practice
  }
  /**
   * Chữ tiếng Anh của practice kèm cờ "lựa chọn sai" (story 36): lựa chọn sai của câu chọn đáp án được nới `did` cho
   * `past-to-be` (so "Were you…?" với "Did you…?"). Đề biến đổi / dịch chỉ xét phần tiếng Anh (`promptEnglish`).
   */
  const scopedTexts = (p: PracticeTense['practice']) => {
    const items: CheckItem[] = [...p.check.items, ...p.check.easier, ...(p.apply.item ? [p.apply.item] : [])]
    const wrong = items.flatMap((i) => (i.kind === 'choice' || i.kind === 'listen' ? i.options.filter((_, k) => k !== i.answer) : []))
    return practiceEnglishTexts(p).map((text) => {
      const k = wrong.indexOf(text)
      if (k >= 0) wrong.splice(k, 1)
      return { text: promptEnglish(text), wrongOption: k >= 0 }
    })
  }

  it('mọi Tense có practice thì practiceProblems rỗng', () => {
    expect(withPractice.length).toBeGreaterThan(0)
    for (const t of withPractice) expect(practiceProblems(t), t.id).toEqual([])
  })

  it('present-continuous có practice: 7 câu luyện (c7 là câu dịch, story 36), ≥ 3 câu type, có câu biến đổi cả câu, 2 câu dễ hơn', () => {
    const p = pc()
    expect(p.check.items).toHaveLength(7)
    expect(p.check.items[6]).toMatchObject({
      id: 'present-continuous-c7',
      kind: 'type',
      prompt: 'Dịch sang tiếng Anh: Bây giờ chúng tôi đang ăn tối. (have dinner)',
      answer: 'We are having dinner now.',
      accept: ['Now we are having dinner.'],
    })
    expect(p.check.easier).toHaveLength(2)
    const typedItems = p.check.items.filter((i) => i.kind === 'type')
    expect(typedItems.length).toBeGreaterThanOrEqual(3)
    expect(typedItems.some((i) => i.kind === 'type' && !i.prompt.includes('___'))).toBe(true)
    expect(p.faded.answer).toBe('are playing')
    const c3 = p.check.items.find((i) => i.id === 'present-continuous-c3')
    expect(c3).toMatchObject({ kind: 'type', answer: "isn't working" })
    expect(p.apply.speak?.map((s) => s.id)).toEqual(['present-continuous-say-1', 'present-continuous-say-2'])
  })

  it('id câu luyện không trùng id câu luyện của mọi viên gạch', () => {
    const brickIds = new Set<string>()
    for (const id of BRICK_IDS) {
      for (const s of getBrick(id)?.screens ?? []) {
        if (s.kind === 'check') for (const i of [...s.items, ...s.easier]) brickIds.add(i.id)
        if (s.kind === 'apply' && s.item) brickIds.add(s.item.id)
      }
    }
    expect(brickIds.size).toBeGreaterThan(0)
    for (const t of withPractice) for (const id of practiceItemIds(t.practice)) expect(brickIds.has(id), id).toBe(false)
  })

  it('chữ tiếng Anh của practice nằm trong phạm vi chữ của thì (outOfScopeWords, story 36)', () => {
    for (const t of withPractice) {
      expect(isTenseScopeId(t.id), t.id).toBe(true)
      if (!isTenseScopeId(t.id)) continue
      for (const { text, wrongOption } of scopedTexts(t.practice)) {
        expect(outOfScopeWords(t.id, text, { wrongOption }), `${t.id}: ${text}`).toEqual([])
      }
    }
  })

  it('đề practice không trùng đề quiz của chính bài chứa thì (so sau chuẩn hoá, cả gợi ý trong ngoặc)', () => {
    const key = (text: string) => normalizeTyped(text.replace(/\([^)]*\)/g, ' '))
    let checked = 0
    for (const content of LESSON_CONTENTS) {
      const quizPrompts = new Set(QUESTION_BANK.filter((q) => q.lessonId === content.lessonId).map((q) => key(q.prompt)))
      for (const t of (content.grammar?.tenses ?? []).filter(hasPractice)) {
        const p = t.practice
        const prompts = [
          p.worked.en,
          p.faded.en,
          ...[...p.check.items, ...p.check.easier].map((i) => ('prompt' in i ? (i.prompt ?? '') : '')),
        ].filter((x) => key(x) !== '')
        for (const prompt of prompts) expect(quizPrompts.has(key(prompt)), `${content.lessonId} ${t.id}: ${prompt}`).toBe(false)
        checked += 1
      }
    }
    expect(checked).toBe(withPractice.length)
  })

  it("câu luyện type có he / she / it is (hoặc 's) trong đáp án thì có accept cho dạng kia", () => {
    for (const t of withPractice) {
      for (const i of [...t.practice.check.items, ...t.practice.check.easier]) {
        if (i.kind === 'type' && /\b(he|she|it)( is|['’]s)\b/i.test(i.answer)) expect(i.accept?.length ?? 0, i.id).toBeGreaterThan(0)
      }
    }
  })

  it('đúng 6 thì T1–T2 có practice (story 36); chưa Tense T3–T4 nào có (story 37 làm)', () => {
    expect(withPractice.map((t) => t.id)).toEqual([
      'present-simple',
      'present-simple-questions',
      'present-continuous',
      'past-to-be',
      'past-simple',
      'past-simple-irregular',
    ])
    expect([...TENSE_SCOPE_IDS].sort()).toEqual(withPractice.map((t) => t.id).sort())
  })
})

describe('phần luyện T1–T2 (story 36)', () => {
  const tense = (id: string): PracticeTense => {
    const t = allTenses().find((x) => x.id === id)
    if (!t || !hasPractice(t)) throw new Error(`${id} chưa có practice`)
    return t
  }
  const NEW = ['present-simple', 'present-simple-questions', 'past-to-be', 'past-simple', 'past-simple-irregular']
  const ALL = ['present-simple', 'present-simple-questions', 'present-continuous', 'past-to-be', 'past-simple', 'past-simple-irregular']
  const CHANGE_RE = /^Đổi [^:]+: [^:]+[.?!]$/
  const TRANSLATE_RE = /^Dịch sang tiếng Anh: .+ \([^)]+\)$/
  const typedItems = (t: PracticeTense) =>
    t.practice.check.items.filter((i): i is Extract<CheckItem, { kind: 'type' }> => i.kind === 'type')

  /** Câu quiz nhãn thì của mỗi thì (bảng "Số câu và id" story 36). */
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  const QUIZ: Record<string, { lessonId: string; ns: number[] }> = {
    'present-simple': { lessonId: 's1-t1-w2', ns: [1, 2, 3, ...range(8, 16)] },
    'present-simple-questions': { lessonId: 's1-t1-w3', ns: [1, 2, 3, ...range(8, 16)] },
    'present-continuous': { lessonId: 's1-t2-w1', ns: [...range(1, 4), ...range(7, 14)] },
    'past-to-be': { lessonId: 's1-t2-w2', ns: [...range(7, 11), ...range(13, 19)] },
    'past-simple': { lessonId: 's1-t2-w2', ns: [...range(1, 4), 12, ...range(20, 26)] },
    'past-simple-irregular': { lessonId: 's1-t2-w3', ns: [...range(1, 4), ...range(7, 14)] },
  }
  const quizOf = (id: string) => {
    const { lessonId, ns } = QUIZ[id]
    const ids = new Set(ns.map((n) => `q-${lessonId}-${String(n).padStart(2, '0')}`))
    return QUESTION_BANK.filter((q) => ids.has(q.id))
  }
  const fill = (prompt: string, answer: string) => prompt.replace(/___( \([^)]*\))?/, answer)
  /** Chuỗi đáp án (đề đã điền đáp án, câu biến đổi / dịch là đáp án) của quiz + phần luyện của thì. */
  const answerTexts = (id: string): string[] => {
    const p = tense(id).practice
    const items: CheckItem[] = [...p.check.items, ...p.check.easier]
    return [
      ...quizOf(id).map((q) => ('options' in q ? q.prompt.replace('___', q.answer) : q.kind === 'type' ? fill(q.prompt, q.answer) : q.answer)),
      p.worked.en,
      fill(p.faded.en, p.faded.answer),
      ...items.flatMap((i) =>
        i.kind === 'choice' ? [i.prompt.replace('___', i.options[i.answer])] : i.kind === 'type' ? [i.prompt.includes('___') ? fill(i.prompt, i.answer) : i.answer] : [],
      ),
      ...(p.apply.sampleEn ? [p.apply.sampleEn] : []),
      ...(p.apply.speak ?? []).map((s) => s.text),
    ]
  }
  const has = (id: string, re: RegExp) => answerTexts(id).some((t) => re.test(t))
  const prompts = (t: PracticeTense) => {
    const p = t.practice
    return [p.worked.en, p.faded.en, ...[...p.check.items, ...p.check.easier].map((i) => ('prompt' in i ? (i.prompt ?? '') : ''))]
  }

  it('mỗi thì: 6–7 câu luyện, ≥ 3 câu type, có câu "Đổi …:" và câu "Dịch sang tiếng Anh: … (…)", 2 câu dễ hơn là choice', () => {
    for (const id of ALL) {
      const t = tense(id)
      const { items, easier } = t.practice.check
      expect(items.length, id).toBeGreaterThanOrEqual(6)
      expect(items.length, id).toBeLessThanOrEqual(7)
      expect(typedItems(t).length, id).toBeGreaterThanOrEqual(3)
      expect(typedItems(t).some((i) => CHANGE_RE.test(i.prompt)), id).toBe(true)
      expect(typedItems(t).some((i) => TRANSLATE_RE.test(i.prompt)), id).toBe(true)
      expect(easier.map((i) => i.kind), id).toEqual(['choice', 'choice'])
      expect(practiceProblems(t), id).toEqual([])
    }
    for (const id of NEW) expect(tense(id).practice.check.items, id).toHaveLength(6)
  })

  it('worked có timeline cùng kind với thì; 2 câu nói đúng id; có promptVi và sampleEn', () => {
    for (const id of ALL) {
      const t = tense(id)
      expect(t.practice.worked.timeline?.kind, id).toBe(t.timeline?.kind)
      expect(t.practice.apply.speak?.map((s) => s.id), id).toEqual([`${id}-say-1`, `${id}-say-2`])
      expect(t.practice.apply.promptVi.trim(), id).not.toBe('')
      expect(t.practice.apply.sampleEn?.trim() ?? '', id).not.toBe('')
    }
  })

  it('câu dịch có đáp án kết thúc bằng trạng ngữ thời gian thì accept có bản đặt trạng ngữ lên đầu', () => {
    let checked = 0
    for (const id of ALL) {
      for (const i of typedItems(tense(id)).filter((x) => TRANSLATE_RE.test(x.prompt) && !x.answer.trim().endsWith('?'))) {
        const fronted = frontedTimeTail(normalizeTyped(i.answer))
        if (!fronted) continue
        checked++
        expect((i.accept ?? []).map(normalizeTyped), i.id).toContain(fronted)
      }
    }
    expect(checked).toBeGreaterThanOrEqual(4)
  })

  it('đề phần luyện của hai thì cùng bài không trùng nhau', () => {
    const key = (text: string) => normalizeTyped(text.replace(/\([^)]*\)/g, ' '))
    let pairs = 0
    for (const c of LESSON_CONTENTS) {
      const ts = (c.grammar?.tenses ?? []).filter(hasPractice)
      for (let a = 0; a < ts.length; a++) {
        for (let b = a + 1; b < ts.length; b++) {
          pairs++
          const other = new Set(prompts(ts[b]).map(key).filter((x) => x !== ''))
          for (const p of prompts(ts[a])) expect(other.has(key(p)), `${c.lessonId}: ${p}`).toBe(false)
        }
      }
    }
    expect(pairs).toBeGreaterThanOrEqual(1)
  })

  it('câu gõ của phần luyện (và màn điền): đáp án / accept không có dấu tiếng Việt và tự chấm đúng (như ô gõ thật)', () => {
    // Ô gõ không chấm chữ có dấu (nhắc tắt bộ gõ), nên đáp án có dấu thì không ai làm đúng được.
    const typed = (s: string) => s.toLowerCase().replace(/[.?!,]/g, '')
    for (const id of ALL) {
      const p = tense(id).practice
      for (const a of [p.faded.answer, ...(p.faded.accept ?? [])]) {
        expect(hasVietnameseMarks(a), `${id} faded: ${a}`).toBe(false)
        expect(isFadedCorrect(p.faded.answer, typed(a), p.faded.accept), `${id} faded: ${a}`).toBe(true)
      }
      for (const i of [...p.check.items, ...p.check.easier]) {
        if (i.kind !== 'type') continue
        for (const a of [i.answer, ...(i.accept ?? [])]) {
          expect(hasVietnameseMarks(a), `${i.id}: ${a}`).toBe(false)
          expect(isCorrect(i, { kind: 'type', text: typed(a) }), `${i.id}: ${a}`).toBe(true)
        }
      }
    }
  })

  it('golden faded present-simple: "watches" / "Watches." đúng, "watchs" sai', () => {
    const f = tense('present-simple').practice.faded
    expect(f.en).toBe('She ___ (watch) TV every evening.')
    expect(isFadedCorrect(f.answer, 'Watches.', f.accept)).toBe(true)
    expect(isFadedCorrect(f.answer, 'watches', f.accept)).toBe(true)
    expect(isFadedCorrect(f.answer, 'watchs', f.accept)).toBe(false)
  })

  it('phần luyện mẫu đúng Design Notes (ví dụ mẫu và màn điền)', () => {
    const golden: Record<string, [string, string, string]> = {
      'present-simple': ['My father drinks coffee every morning.', 'She ___ (watch) TV every evening.', 'watches'],
      'present-simple-questions': ['Does your brother play football? — Yes, he does.', 'I ___ (not / eat) meat.', "don't eat"],
      'past-to-be': ['We were at home last night.', 'My phone ___ (be) on the table yesterday.', 'was'],
      'past-simple': ['She cooked dinner yesterday.', 'We ___ (stay) at home last Sunday.', 'stayed'],
      'past-simple-irregular': ['My father made a cake yesterday.', 'We ___ (see) a good movie last night.', 'saw'],
    }
    for (const [id, [worked, faded, answer]] of Object.entries(golden)) {
      const p = tense(id).practice
      expect([p.worked.en, p.faded.en, p.faded.answer], id).toEqual([worked, faded, answer])
    }
  })

  it('phủ đủ bảng "Phải phủ" (quiz + phần luyện của thì, kiểm bằng chuỗi đáp án)', () => {
    // Hiện tại đơn: -s, -es, -ies, has, chủ ngữ số nhiều / I không thêm -s, đổi chủ ngữ I → he / she.
    for (const re of [/\bworks\b/, /\bwatches\b/, /\bgoes\b/, /\bstudies\b/, /\bhas\b/, /\b(I|They|We) (live|drink|study|play)\b/]) {
      expect(has('present-simple', re), `present-simple ${re}`).toBe(true)
    }
    const psChange = [...quizOf('present-simple').map((q) => q.prompt), ...prompts(tense('present-simple'))]
    expect(psChange.some((p) => /^Đổi chủ ngữ sang (He|She): I /.test(p))).toBe(true)

    // Hiện tại đơn câu hỏi / phủ định.
    for (const re of [
      /\bdon't (eat|live|like|watch)\b/,
      /\bdoesn't (like|drink|play|drive)\b/,
      /^Do (you|they) [a-z]+/,
      /^Does (she|he|your) [a-z]+/,
      /Yes, (she|he) does\./,
      /No, I don't\./,
      /\b(What|Where|When) (do|does)\b/,
      /^Is she /,
      /^Does she /,
    ]) {
      expect(has('present-simple-questions', re), `present-simple-questions ${re}`).toBe(true)
    }
    const psq = tense('present-simple-questions').practice.check.items
    const isShe = psq.findIndex((i) => i.kind === 'choice' && i.options[i.answer] === 'Is')
    const doesShe = psq.findIndex((i) => i.kind === 'choice' && i.options[i.answer] === 'Does')
    expect(isShe).toBeGreaterThanOrEqual(0)
    expect(doesShe).toBeGreaterThanOrEqual(0)
    expect(Math.abs(isShe - doesShe)).toBe(1)

    // Hiện tại tiếp diễn: câu dịch có now, câu mới bỏ e câm hoặc gấp đôi phụ âm.
    const pcTranslate = [
      ...quizOf('present-continuous').filter((q) => TRANSLATE_RE.test(q.prompt)).map((q) => q.answer),
      ...typedItems(tense('present-continuous')).filter((i) => TRANSLATE_RE.test(i.prompt)).map((i) => i.answer),
    ]
    expect(pcTranslate.some((a) => /\bnow\b/.test(a))).toBe(true)
    const pcFresh = quizOf('present-continuous').filter((q) => Number(q.id.slice(-2)) >= 11)
    expect(
      pcFresh.some((q) =>
        /\b(making|writing|driving|having|running|sitting|swimming|stopping)\b/.test(q.kind === 'type' ? fill(q.prompt, q.answer) : q.answer),
      ),
    ).toBe(true)

    // was / were.
    for (const re of [/\bwas\b/, /\bwere\b/, /\bwasn't\b/, /\bweren't\b/, /^Was /, /^Were /, /(Yes|No), (I|it|they|he|she|we) (was|wasn't|were|weren't)\./, /\bThere was\b/, /\bThere were\b/, /^Where were\b/]) {
      expect(has('past-to-be', re), `past-to-be ${re}`).toBe(true)
    }

    // Quá khứ đơn có quy tắc.
    for (const re of [/\b(played|worked|cooked|watched)\b/, /\blived\b/, /\bstudied\b/, /\b(stopped|planned)\b/, /\b(visited|listened)\b/, /\bdidn't (visit|open|call|watch)\b/, /^Did .+ — Yes, I did\./, /\b(What|Where|When) did\b/]) {
      expect(has('past-simple', re), `past-simple ${re}`).toBe(true)
    }
    expect(quizOf('past-simple').some((q) => /^Đổi sang quá khứ/.test(q.prompt))).toBe(true)

    // Bất quy tắc: ≥ 8 động từ khác nhau (V2 ≠ V1) ở đáp án, didn't + V1, Did you + V1, Wh + did + V1, ≥ 2 câu dịch V1 → V2.
    const v2ToV1 = new Map(
      IRREGULAR_VERBS.flatMap((v) => v.v2.split(' / ').filter((f) => f !== v.v1 && !['was', 'were', 'did'].includes(f)).map((f) => [f, v.v1] as const)),
    )
    const verbs = new Set(answerTexts('past-simple-irregular').flatMap((t) => (t.toLowerCase().match(/[a-z]+/g) ?? []).flatMap((w) => v2ToV1.get(w) ?? [])))
    expect(verbs.size, [...verbs].join()).toBeGreaterThanOrEqual(8)
    for (const re of [/\bdidn't (come|drive|eat|go)\b/, /^Did you [a-z]+\b/, /\b(What|Where|When) did (you|she|he|they) (eat|find|go)\b/]) {
      expect(has('past-simple-irregular', re), `past-simple-irregular ${re}`).toBe(true)
    }
    const translations = [
      ...quizOf('past-simple-irregular').filter((q) => TRANSLATE_RE.test(q.prompt)).map((q) => [q.prompt, q.answer] as const),
      ...typedItems(tense('past-simple-irregular')).filter((i) => TRANSLATE_RE.test(i.prompt)).map((i) => [i.prompt, i.answer] as const),
    ]
    const v1ToV2 = translations.filter(([prompt, answer]) => {
      const cues: string[] = promptEnglish(prompt).toLowerCase().match(/[a-z]+/g) ?? []
      return (answer.toLowerCase().match(/[a-z]+/g) ?? []).some((w) => cues.includes(v2ToV1.get(w) ?? '#'))
    })
    expect(v1ToV2.length).toBeGreaterThanOrEqual(2)
  })
})

/** V3 của 50 động từ bất quy tắc (chữ thường), cho các dấu hiệu "Dấu hiệu theo bài" (story 38). */
const V3_FORMS = new Set(IRREGULAR_VERBS.flatMap((v) => v.v3.split(' / ')).map((f) => f.toLowerCase()))
/** Hiện tại hoàn thành: have / has / 've (+ ever / never / just / already) + từ đuôi -ed hoặc V3. Chữ thường. */
const hasPerfect = (text: string) =>
  [...text.matchAll(/(?:\b(?:have|has|haven't|hasn't)|'ve)(?: (?:ever|never|just|already))? ([a-z]+)\b/g)].some(
    (m) => /^[a-z]{2,}ed$/.test(m[1]) || V3_FORMS.has(m[1]),
  )
/** Bị động hiện tại: am / is / are (not) + V3 hoặc từ đuôi -ed ("isn't allowed", "are sold"). Chữ thường. */
const hasPassive = (text: string) =>
  [...text.matchAll(/(?:\b(?:am|is|are|isn't|aren't)|'m|'s|'re)(?: not)? ([a-z]+)\b/g)].some(
    (m) => /^[a-z]{2,}ed$/.test(m[1]) || V3_FORMS.has(m[1]),
  )
/**
 * Bảng "Dấu hiệu theo bài" (story 38, dùng lại ở story 39): nội dung của bài đứng trước `lessonId` không được chứa dấu hiệu
 * (so trên chữ thường).
 */
const SIGNALS: readonly { lessonId: string; has: (text: string) => boolean; sample: string }[] = [
  { lessonId: 's1-t3-w2', has: (t) => /\bgoing to\b|\bgonna\b/.test(t), sample: 'is going to rain' },
  { lessonId: 's1-t3-w3', has: hasPerfect, sample: 'has just rained' },
  { lessonId: 's1-t3-w4', has: (t) => /\bsince\b|\bhow long\b/.test(t), sample: 'rained since' },
  { lessonId: 's1-t4-w1', has: (t) => /\b(?:can|can't|should|shouldn't|must|mustn't)\b/.test(t), sample: "can't rain" },
  { lessonId: 's1-t4-w3', has: (t) => /\bthan\b|\bthe (?:best|worst|most)\b/.test(t), sample: 'rains more than' },
  { lessonId: 's1-t4-w3', has: hasPassive, sample: "isn't allowed" },
]
/** Vị trí bài trong lộ trình. */
const lessonOrder = (id: string) => allLessons().findIndex((l) => l.id === id)

describe('thẻ ôn thì và động từ (story 38)', () => {
  /** Bảng "Thẻ của thì" (Design Notes story 38): đáp án theo thứ tự thẻ. */
  const CARDS: Record<string, readonly string[]> = {
    'present-simple': ['works', 'washes', 'studies', 'has'],
    'present-simple-questions': ["doesn't drink", 'Do', 'does', 'Is'],
    'present-continuous': ['are playing', "isn't sleeping", 'Are', 'sitting', 'know'],
    'past-to-be': ['were', 'Were', "weren't", 'were'],
    'past-simple': ['did', 'stopped', "didn't call", 'Did'],
    'past-simple-irregular': ['bought', 'go', 'eat', 'went'],
    will: ['will call', "won't be", 'Will', "won't"],
    'going-to': ['are going to visit', "isn't going to buy", 'are', 'is going to fall'],
    'present-perfect': ['have visited', "hasn't finished", 'Have', 'seen', 'gone'],
    'present-perfect-vs-past': ['since', 'for', 'met', 'did', 'have'],
    modals: ['speak', 'Can', "mustn't", 'should'],
    comparatives: ['bigger', 'more expensive', 'the best', 'taller'],
    'passive-present': ['are sold', "isn't included", 'Is', 'cleaned'],
  }
  /** Thì dạy đủ khẳng định, phủ định, câu hỏi. */
  const THREE_FORMS = [
    'present-simple-questions',
    'present-continuous',
    'past-to-be',
    'past-simple',
    'past-simple-irregular',
    'will',
    'going-to',
    'present-perfect',
  ]
  /** Câu đã điền đáp án, bỏ gợi ý trong ngoặc ngay sau `___`. */
  const filled = (cloze: string, answer: string) => cloze.replace(/___(?: \([^)]*\))?/, answer)
  const cardsOf = () =>
    LESSON_CONTENTS.flatMap((c) =>
      (c.grammar?.tenses ?? []).flatMap((t) => (t.ruleCards ?? []).map((r) => ({ lessonId: c.lessonId, tense: t, card: r }))),
    )
  const lessonIndex = (id: string) => allLessons().findIndex((l) => l.id === id)

  it('đúng 13 thì có thẻ (mọi thì trừ to-be), số thẻ và đáp án theo bảng; tổng 55 thẻ', () => {
    const withCards = allTenses().filter((t) => (t.ruleCards ?? []).length > 0)
    expect(withCards.map((t) => t.id)).toEqual(Object.keys(CARDS))
    expect(allTenses().filter((t) => !t.ruleCards).map((t) => t.id)).toEqual(['to-be'])
    for (const t of withCards) {
      expect(t.ruleCards!.map((r) => r.answer), t.id).toEqual(CARDS[t.id])
      expect(t.ruleCards!.map((r) => r.id), t.id).toEqual(CARDS[t.id].map((_, i) => `${t.id}-rule-${i + 1}`))
      expect(t.ruleCards!.length, t.id).toBeGreaterThanOrEqual(4)
      expect(t.ruleCards!.length, t.id).toBeLessThanOrEqual(5)
    }
    expect(cardsOf()).toHaveLength(55)
  })

  it('3 thẻ của story 33 giữ đúng chữ', () => {
    const byId = new Map(cardsOf().map(({ card }) => [card.id, card]))
    expect(byId.get('past-to-be-rule-1')).toEqual({
      id: 'past-to-be-rule-1',
      cloze: 'Yesterday they ___ at home.',
      answer: 'were',
      vi: 'you / we / they và danh từ số nhiều + were; I / he / she / it và danh từ số ít + was.',
    })
    expect(byId.get('past-to-be-rule-2')).toEqual({
      id: 'past-to-be-rule-2',
      cloze: "___ they at work yesterday? — No, they weren't.",
      answer: 'Were',
      vi: 'Hỏi với was / were: đảo was / were lên trước chủ ngữ, không mượn did (không nói Did they be…?).',
    })
    expect(byId.get('past-simple-rule-1')).toEqual({
      id: 'past-simple-rule-1',
      cloze: 'What ___ she cook last Sunday?',
      answer: 'did',
      vi: 'Hỏi Wh- về việc đã làm: Wh + did + S + động từ nguyên mẫu (không phải What you watched?).',
    })
  })

  it('đúng một ___, gợi ý trong ngoặc (nếu có) đứng ngay sau ___; answer, vi không rỗng', () => {
    for (const { card } of cardsOf()) {
      expect(card.cloze.split('___'), card.id).toHaveLength(2)
      expect(card.cloze.replace(/___ \([^)]+\)/, '___'), card.id).not.toContain('(')
      expect(card.answer.trim(), card.id).not.toBe('')
      expect(card.vi.trim(), card.id).not.toBe('')
    }
  })

  it('thì dạy đủ ba dạng có ≥ 1 thẻ phủ định và ≥ 1 thẻ câu hỏi', () => {
    for (const id of THREE_FORMS) {
      const texts = cardsOf()
        .filter((c) => c.tense.id === id)
        .map(({ card }) => filled(card.cloze, card.answer))
      expect(texts.some((t) => /n't\b|\bnot\b/.test(t)), id).toBe(true)
      expect(texts.some((t) => t.includes('?')), id).toBe(true)
    }
  })

  it('thẻ T1–T2 nằm trong phạm vi chữ của thì (outOfScopeWords)', () => {
    let checked = 0
    for (const { tense, card } of cardsOf()) {
      if (!isTenseScopeId(tense.id)) continue
      const text = filled(card.cloze, card.answer)
      expect(outOfScopeWords(tense.id, text), `${card.id}: ${text}`).toEqual([])
      checked++
    }
    expect(checked).toBe(25)
  })

  it('thẻ T3–T4 không chứa dấu hiệu của bài dạy sau nó (bảng "Dấu hiệu theo bài")', () => {
    // Tự kiểm: mỗi dấu hiệu bắt được câu của chính bài nó.
    for (const s of SIGNALS) expect(s.has(filled('It ___ here.', s.sample).toLowerCase()), s.sample).toBe(true)
    expect(hasPassive("you mustn't smoke in the hospital. it isn't allowed.")).toBe(true)
    expect(hasPassive("i'm very tired. i won't go to the party tonight.")).toBe(false)
    let checked = 0
    for (const { lessonId, card } of cardsOf()) {
      if (lessonIndex(lessonId) < lessonIndex('s1-t3-w1')) continue
      const text = filled(card.cloze, card.answer).toLowerCase()
      for (const s of SIGNALS) {
        if (lessonIndex(lessonId) < lessonIndex(s.lessonId)) expect(s.has(text), `${card.id} (${s.lessonId}): ${text}`).toBe(false)
      }
      checked++
    }
    expect(checked).toBe(30)
  })

  it('không dùng some / any / many / because / so, không có "Don\'t + V"', () => {
    for (const { card } of cardsOf()) {
      const text = filled(card.cloze, card.answer)
      const ws = text.toLowerCase().match(/[a-z']+/g) ?? []
      expect(ws.filter((w) => ['some', 'any', 'many', 'because', 'so'].includes(w)), card.id).toEqual([])
      expect(text, card.id).not.toMatch(/(?:^|[.!?—]\s*)don't\b/i)
    }
  })

  it('câu đã điền không trùng, không gần trùng câu ví dụ, công thức, quy tắc, hội thoại, phần luyện, lỗi hay mắc hay câu quiz cùng bài', () => {
    /** Bỏ gợi ý trong ngoặc và câu trả lời ngắn sau "—", chuẩn hoá bằng `normalizeTyped`, tách từ. */
    const words = (text: string) => normalizeTyped(text.replace(/\s*—.*$/, '').replace(/\([^)]*\)/g, ' ')).split(' ').filter(Boolean)
    /** Khoảng cách sửa theo từ (thêm, bớt, thay một từ). */
    const wordDistance = (a: readonly string[], b: readonly string[]) => {
      let prev = b.map((_, j) => j + 1)
      prev.unshift(0)
      for (let i = 1; i <= a.length; i++) {
        const row = [i]
        for (let j = 1; j <= b.length; j++) row.push(Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)))
        prev = row
      }
      return prev[b.length]
    }
    /**
     * Trùng (bỏ gợi ý và câu trả lời ngắn), hoặc gần trùng: câu từ 5 từ trở lên chỉ khác một từ ("My sister works in a bank"
     * với "My friend works in a bank", "Did you watch the game yesterday" với "Did you watch the game").
     */
    const near = (a: readonly string[], b: readonly string[]) => {
      const d = wordDistance(a, b)
      return d === 0 || (Math.max(a.length, b.length) >= 5 && d <= 1)
    }
    /** 3 thẻ của story 33 giữ nguyên chữ (test riêng ở trên), không xét gần trùng. */
    const STORY33 = new Set(['past-to-be-rule-1', 'past-to-be-rule-2', 'past-simple-rule-1'])
    const problems: string[] = []
    for (const { lessonId, card } of cardsOf()) {
      const tenses = getLessonContent(lessonId)!.grammar!.tenses
      const taken = [
        ...tenses.flatMap((t) => t.examples.map((e) => e.en)),
        ...tenses.flatMap((t) => t.mistakes.map((m) => m.right)),
        ...tenses.flatMap((t) => t.formulas.map((f) => f.text)),
        ...tenses.flatMap((t) => t.rules),
        ...tenses.flatMap((t) => t.dialogues.map((d) => (d.kind === 'voa' ? d.text : d.phrase))),
        ...tenses.flatMap((t) => (t.practice ? practiceEnglishTexts(t.practice) : [])),
        ...QUESTION_BANK.filter((q) => q.lessonId === lessonId).flatMap((q) => [
          q.answer,
          q.prompt.includes('___') ? filled(q.prompt, q.answer) : q.prompt,
        ]),
      ].map(words)
      if (STORY33.has(card.id)) continue
      // So cả câu đã điền và khung câu (bỏ chỗ trống) với câu có sẵn, kể cả đề có ___ của phần luyện / quiz.
      for (const text of [words(filled(card.cloze, card.answer)), words(card.cloze)]) {
        const hit = taken.find((t) => near(text, t))
        if (hit) problems.push(`${card.id}: "${text.join(' ')}" ~ "${hit.join(' ')}"`)
      }
    }
    expect(problems).toEqual([])
  })

  it('15 nhóm động từ, gộp lại đúng 50 động từ của baseline theo thứ tự; cỡ nhóm theo bảng', () => {
    const BASELINE = [
      'be', 'have', 'do', 'go', 'get', 'make', 'see', 'know', 'take', 'give', 'come', 'become', 'say', 'pay', 'tell', 'sell',
      'think', 'bring', 'buy', 'teach', 'catch', 'leave', 'feel', 'keep', 'sleep', 'mean', 'lose', 'send', 'spend', 'build',
      'meet', 'hear', 'begin', 'drink', 'swim', 'sing', 'run', 'sit', 'find', 'understand', 'write', 'drive', 'speak', 'break',
      'choose', 'forget', 'eat', 'fall', 'put', 'read',
    ]
    expect(IRREGULAR_VERB_GROUPS).toHaveLength(15)
    expect(IRREGULAR_VERB_GROUPS.flatMap((g) => g.verbs).map((v) => v.v1)).toEqual(BASELINE)
    expect(IRREGULAR_VERB_GROUPS.flatMap((g) => g.verbs)).toEqual(IRREGULAR_VERBS)
    expect(IRREGULAR_VERB_GROUPS.map((g) => g.verbs.length)).toEqual([7, 3, 2, 2, 2, 5, 6, 3, 2, 4, 1, 1, 2, 8, 2])
    expect(IRREGULAR_VERB_GROUPS.map((g) => g.id)).toEqual([
      'core', 'n-en', 'come', 'ay-aid', 'ell-old', 'ought', 'long-short-t', 'd-t', 'long-short', 'i-a-u', 'u-a-u', 'i-a',
      'ind-ound', 'vowel-en', 'same',
    ])
    for (const g of IRREGULAR_VERB_GROUPS) expect(g.title.trim(), g.id).not.toBe('')
  })

  it('IRREGULAR_VERB_CARDS: 50 thẻ theo thứ tự nhóm, id không trùng nhau và không trùng thẻ thì / viên gạch; golden go, be, read', () => {
    expect(IRREGULAR_VERB_CARDS).toHaveLength(50)
    expect(IRREGULAR_VERB_CARDS.map((c) => c.id)).toEqual(IRREGULAR_VERBS.map((v) => `irregular-${v.v1}-rule-1`))
    const others = new Set([
      ...cardsOf().map(({ card }) => card.id),
      ...BRICK_IDS.flatMap((id) => (getBrick(id)?.ruleCards ?? []).map((r) => r.id)),
    ])
    expect(new Set(IRREGULAR_VERB_CARDS.map((c) => c.id)).size).toBe(50)
    for (const c of IRREGULAR_VERB_CARDS) {
      expect(others.has(c.id), c.id).toBe(false)
      expect(c.cloze.split('___'), c.id).toHaveLength(2)
    }
    const card = (v1: string) => IRREGULAR_VERB_CARDS.find((c) => c.id === `irregular-${v1}-rule-1`)
    expect(card('go')).toEqual({
      id: 'irregular-go-rule-1',
      groupId: 'core',
      groupTitle: 'Rất thông dụng, mỗi từ một kiểu: học thuộc',
      cloze: 'go → ___ (V2 · V3)',
      answer: 'went · gone',
      vi: 'đi · Nhóm: Rất thông dụng, mỗi từ một kiểu: học thuộc',
    })
    expect(card('be')?.answer).toBe('was / were · been')
    expect(card('read')).toMatchObject({
      answer: 'read · read',
      vi: 'đọc (V2, V3 đọc /red/) · Nhóm: Giữ nguyên chữ cả ba cột: put – put – put',
    })
  })

  it('s1-t3-w3 mở đầu bằng bảng ôn V3 (IRREGULAR_VERBS); s1-t2-w3 chỉ có bảng đầy đủ', () => {
    expect(content('s1-t3-w3').grammar!.irregularVerbsReview).toBe(IRREGULAR_VERBS)
    expect(content('s1-t3-w3').grammar!.tenses.map((t) => t.id)).toEqual(['present-perfect'])
    expect(content(IRREGULAR_VERBS_LESSON_ID).grammar!.irregularVerbsReview).toBeUndefined()
    expect(content(IRREGULAR_VERBS_LESSON_ID).grammar!.irregularVerbs).toBe(IRREGULAR_VERBS)
    expect(LESSON_CONTENTS.filter((c) => c.grammar?.irregularVerbsReview).map((c) => c.lessonId)).toEqual(['s1-t3-w3'])
  })
})

describe('chọn thì, từ tín hiệu, bảng trợ động từ (story 39)', () => {
  /** Bảng "Từ tín hiệu" (Design Notes story 39), đúng thứ tự. */
  const SIGNAL_WORDS: Record<string, readonly string[]> = {
    'present-simple': ['every day', 'every morning', 'always', 'usually', 'often', 'sometimes', 'never', 'on Sundays'],
    // "every evening" của bảng Design Notes bị bỏ: không có trong chữ của thì này hay F18 (luật Design Notes).
    'present-simple-questions': ['every day', 'usually', 'often'],
    'present-continuous': ['now', 'right now', 'today', 'this year', 'Look!'],
    'past-to-be': ['yesterday', 'last night', 'last Monday', 'in 2020'],
    'past-simple': ['yesterday', 'last night', 'last week', 'last year', 'ago'],
    'past-simple-irregular': ['yesterday', 'last night', 'last week', 'last weekend'],
    will: ['tomorrow', 'tonight'],
    'going-to': ['this weekend', 'next month', 'Look!'],
    'present-perfect': ['ever', 'never', 'just', 'already', 'yet', 'before', 'twice'],
    // "for" bị bỏ (review story 39): quá khứ đơn cũng đi với for (I lived in Hue for two years), nên for không chốt thì.
    'present-perfect-vs-past': ['since', 'How long', 'so far'],
  }
  const TRANSLATE_RE = /^Dịch sang tiếng Anh: .+ \([^)]+\)$/
  const fillBlank = (prompt: string, answer: string) => prompt.replace(/___(?: \([^)]*\))?/, answer)
  const tenseById = (id: string) => allTenses().find((t) => t.id === id)
  const choicesOf = (lessonId: string) => content(lessonId).grammar?.choices ?? []
  const choice = (id: string): TenseChoice => {
    const c = allTenseChoices().find((x) => x.id === id)
    if (!c) throw new Error(`thiếu khối ${id}`)
    return c
  }
  const blockLesson = (id: string) => LESSON_CONTENTS.find((c) => c.grammar?.choices?.some((x) => x.id === id))!.lessonId
  const items = (c: TenseChoice): CheckItem[] => [...c.practice.check.items, ...c.practice.check.easier]
  /** Chuỗi đáp án của câu luyện: đề đã điền (câu chọn, câu gõ có ___), hoặc chính đáp án (câu gõ cả câu). */
  const answerText = (i: CheckItem): string =>
    i.kind === 'choice' ? i.prompt.replace('___', i.options[i.answer]) : i.kind === 'type' ? (i.prompt.includes('___') ? fillBlank(i.prompt, i.answer) : i.answer) : ''
  /** Mọi chữ tiếng Anh của khối: ví dụ hai bên, cách nói + ví dụ của chữ Việt, cặp câu, phần luyện (đề gõ qua `promptEnglish`). */
  const englishTexts = (c: TenseChoice): string[] => [
    ...(c.sides ?? []).map((s) => s.example.en),
    ...(c.viWords ?? []).flatMap((w) => w.options.flatMap((o) => [o.en, o.example.en])),
    ...c.pairs.flatMap((p) => [p.a.en, p.b.en]),
    ...practiceEnglishTexts(c.practice).map(promptEnglish),
    ...items(c).filter((i) => i.kind !== 'type').map(answerText),
  ]

  it('signalWords đúng bảng; to-be, modals, comparatives, passive-present không có', () => {
    const withSignals = allTenses().filter((t) => t.signalWords)
    expect(Object.fromEntries(withSignals.map((t) => [t.id, t.signalWords]))).toEqual(SIGNAL_WORDS)
    expect(allTenses().filter((t) => !t.signalWords).map((t) => t.id)).toEqual(['to-be', 'modals', 'comparatives', 'passive-present'])
  })

  it('mỗi từ tín hiệu (bỏ ! / …, chữ thường) có nguyên cụm trong chữ tiếng Anh của chính thì hoặc của viên F18', () => {
    const f18 = JSON.stringify(getBrick('F18')).toLowerCase()
    const missing: string[] = []
    for (const t of allTenses().filter((x) => x.signalWords)) {
      // `use` có mốc tiếng Anh trong ngoặc ("(yesterday, last week, two days ago)").
      const own = [
        t.use,
        ...t.examples.map((e) => e.en),
        ...t.formulas.map((f) => f.text),
        ...t.rules,
        ...t.mistakes.flatMap((m) => [m.wrong, m.right]),
        ...(t.practice ? practiceEnglishTexts(t.practice) : []),
        ...(t.ruleCards ?? []).map((r) => fillBlank(r.cloze, r.answer)),
      ]
        .join(' \n ')
        .toLowerCase()
      for (const w of t.signalWords!) {
        const phrase = w.replace(/[!…]/g, '').trim().toLowerCase()
        const re = new RegExp(`(^|[^a-z])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`)
        if (!re.test(own) && !re.test(f18)) missing.push(`${t.id}: ${w}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('chỗ đặt khối: s1-t2-w1, s1-t3-w2, s1-t3-w4; id không trùng id thì; bên trỏ đúng cặp thì có signalWords', () => {
    const placed = Object.fromEntries(
      LESSON_CONTENTS.filter((c) => (c.grammar?.choices ?? []).length > 0).map((c) => [c.lessonId, c.grammar!.choices!.map((x) => x.id)]),
    )
    expect(placed).toEqual({
      's1-t2-w1': ['simple-vs-continuous'],
      's1-t3-w2': ['will-vs-going-to'],
      's1-t3-w4': ['dont-translate'],
    })
    expect(allTenseChoices().map((c) => c.id)).toEqual(['simple-vs-continuous', 'will-vs-going-to', 'dont-translate'])
    const tenseIds = new Set(allTenses().map((t) => t.id))
    for (const c of allTenseChoices()) expect(tenseIds.has(c.id), c.id).toBe(false)
    expect(choice('simple-vs-continuous').sides?.map((s) => s.tenseId)).toEqual(['present-simple', 'present-continuous'])
    expect(choice('will-vs-going-to').sides?.map((s) => s.tenseId)).toEqual(['will', 'going-to'])
    expect(choice('dont-translate').sides).toBeUndefined()
    for (const c of allTenseChoices()) {
      for (const side of c.sides ?? []) {
        expect(tenseById(side.tenseId)?.signalWords?.length ?? 0, `${c.id} → ${side.tenseId}`).toBeGreaterThan(0)
        expect(side.whenVi.trim(), c.id).not.toBe('')
      }
      // Bài chứa khối có thì của ít nhất một bên (khối đứng sau thì vừa học).
      if (c.sides) {
        const own = content(blockLesson(c.id)).grammar!.tenses.map((t) => t.id)
        expect(c.sides.some((s) => own.includes(s.tenseId)), c.id).toBe(true)
      }
    }
    expect(choicesOf('s1-t2-w4')).toEqual([])
    expect(choicesOf('s1-t3-w1')).toEqual([])
  })

  it('khối so sánh: 3–4 cặp câu (a ≠ b), 7 câu chính, mỗi bên ≥ 2 câu có chuỗi đáp án mang dạng của bên đó', () => {
    const continuous = (t: string) =>
      [...t.toLowerCase().matchAll(/(?:\b(?:am|is|are|isn't|aren't)|'m|'s|'re)(?: not)?(?: [a-z]+)? ([a-z]+ing)\b/g)].some(
        (m) => !['morning', 'evening', 'thing', 'something', 'nothing'].includes(m[1]),
      )
    const goingTo = (t: string) => /\bgoing to\b/i.test(t)
    const will = (t: string) => /\bwill\b|'ll\b|\bwon't\b/i.test(t)
    const FORMS: Record<string, [(t: string) => boolean, (t: string) => boolean]> = {
      'simple-vs-continuous': [(t) => !continuous(t), continuous],
      'will-vs-going-to': [(t) => will(t) && !goingTo(t), goingTo],
    }
    for (const [id, [first, second]] of Object.entries(FORMS)) {
      const c = choice(id)
      expect(c.pairs.length, id).toBeGreaterThanOrEqual(3)
      expect(c.pairs.length, id).toBeLessThanOrEqual(4)
      for (const p of c.pairs) {
        expect(p.a.en, id).not.toBe(p.b.en)
        expect(p.noteVi.trim(), id).not.toBe('')
      }
      expect(c.practice.check.items, id).toHaveLength(7)
      const answers = c.practice.check.items.map(answerText)
      expect(answers.filter(first).length, `${id}: ${answers.join(' | ')}`).toBeGreaterThanOrEqual(2)
      expect(answers.filter(second).length, `${id}: ${answers.join(' | ')}`).toBeGreaterThanOrEqual(2)
    }
    // Tự kiểm bộ nhận dạng.
    expect(continuous('What are you doing right now?')).toBe(true)
    expect(continuous('I am not working today.')).toBe(true)
    expect(continuous('She goes to the gym every Monday.')).toBe(false)
    expect(continuous('I watch TV every morning.')).toBe(false)
  })

  it('khối dịch: chữ đã · sẽ · chưa, mỗi chữ 2–3 cách nói; 6 câu chính đều là câu dịch gõ', () => {
    const c = choice('dont-translate')
    expect(c.viWords?.map((w) => w.vi)).toEqual(['đã', 'sẽ', 'chưa'])
    for (const w of c.viWords!) {
      expect(w.options.length, w.vi).toBeGreaterThanOrEqual(2)
      expect(w.options.length, w.vi).toBeLessThanOrEqual(3)
      for (const o of w.options) {
        expect(o.en.trim(), w.vi).not.toBe('')
        expect(o.whenVi.trim(), w.vi).not.toBe('')
        expect(o.example.en.trim(), w.vi).not.toBe('')
      }
    }
    const main = c.practice.check.items
    expect(main).toHaveLength(6)
    for (const i of main) {
      expect(i.kind, i.id).toBe('type')
      if (i.kind === 'type') expect(i.prompt, i.id).toMatch(TRANSLATE_RE)
    }
  })

  it('câu dịch / gõ cả câu có đáp án kết thúc bằng trạng ngữ trong TIME_TAILS thì accept có bản đặt trạng ngữ lên đầu', () => {
    let checked = 0
    for (const c of allTenseChoices()) {
      for (const i of items(c)) {
        if (i.kind !== 'type' || i.prompt.includes('___') || i.answer.trim().endsWith('?')) continue
        const fronted = frontedTimeTail(normalizeTyped(i.answer))
        if (!fronted) continue
        checked++
        expect((i.accept ?? []).map(normalizeTyped), i.id).toContain(fronted)
      }
    }
    expect(checked).toBeGreaterThanOrEqual(3)
  })

  it('mọi khối: practiceProblems rỗng; id câu luyện không trùng câu luyện của thì, viên gạch, câu quiz; đề không trùng đề quiz cùng bài', () => {
    const taken = new Set<string>()
    for (const t of allTenses().filter(hasPractice)) for (const id of practiceItemIds(t.practice)) taken.add(id)
    for (const id of BRICK_IDS) {
      for (const sc of getBrick(id)?.screens ?? []) {
        if (sc.kind === 'check') for (const i of [...sc.items, ...sc.easier]) taken.add(i.id)
        if (sc.kind === 'apply' && sc.item) taken.add(sc.item.id)
      }
    }
    for (const q of QUESTION_BANK) taken.add(q.id)
    const key = (text: string) => normalizeTyped(text.replace(/\([^)]*\)/g, ' '))
    for (const c of allTenseChoices()) {
      expect(practiceProblems(c), c.id).toEqual([])
      for (const id of practiceItemIds(c.practice)) {
        expect(taken.has(id), id).toBe(false)
        taken.add(id)
      }
      const quizPrompts = new Set(QUESTION_BANK.filter((q) => q.lessonId === blockLesson(c.id)).map((q) => key(q.prompt)))
      for (const i of items(c)) {
        if ('prompt' in i && i.prompt) expect(quizPrompts.has(key(i.prompt)), `${c.id}: ${i.prompt}`).toBe(false)
      }
      expect(c.formulas.length, c.id).toBeGreaterThanOrEqual(2)
      expect(c.rules, c.id).toHaveLength(3)
    }
  })

  it('phạm vi chữ: khối s1-t2-w1 trong phạm vi hiện tại tiếp diễn; khối T3 không có dấu hiệu bài sau; không some / any / … / "Don\'t + V"', () => {
    for (const text of englishTexts(choice('simple-vs-continuous'))) {
      expect(outOfScopeWords('present-continuous', text), text).toEqual([])
    }
    let checked = 0
    for (const c of allTenseChoices()) {
      const at = lessonOrder(blockLesson(c.id))
      for (const text of englishTexts(c)) {
        const lower = text.toLowerCase()
        for (const s of SIGNALS) {
          if (at < lessonOrder(s.lessonId)) expect(s.has(lower), `${c.id} (${s.lessonId}): ${text}`).toBe(false)
        }
        const ws = lower.replace(/[’]/g, "'").match(/[a-z']+/g) ?? []
        // but / and-or: liên từ chưa dạy ở Chặng 1 (story 43, 44).
        expect(ws.filter((w) => ['some', 'any', 'many', 'much', 'because', 'so', 'but'].includes(w)), `${c.id}: ${text}`).toEqual([])
        expect(text, c.id).not.toMatch(/(?:^|[.!?—]\s*)don't\b/i)
        checked++
      }
    }
    expect(checked).toBeGreaterThan(60)
  })

  it('câu gõ của khối (faded + câu gõ): đáp án / accept không có dấu tiếng Việt và tự chấm đúng; golden của bảng I/O', () => {
    const typed = (s: string) => s.toLowerCase().replace(/[.?!,]/g, '')
    for (const c of allTenseChoices()) {
      const p = c.practice
      for (const a of [p.faded.answer, ...(p.faded.accept ?? [])]) {
        expect(hasVietnameseMarks(a), `${c.id} faded: ${a}`).toBe(false)
        expect(isFadedCorrect(p.faded.answer, typed(a), p.faded.accept), `${c.id} faded: ${a}`).toBe(true)
      }
      for (const i of items(c)) {
        if (i.kind !== 'type') continue
        for (const a of [i.answer, ...(i.accept ?? [])]) {
          expect(hasVietnameseMarks(a), `${i.id}: ${a}`).toBe(false)
          expect(isCorrect(i, { kind: 'type', text: typed(a) }), `${i.id}: ${a}`).toBe(true)
        }
      }
    }
    const item = (blockId: string, id: string) => {
      const i = items(choice(blockId)).find((x) => x.id === id)
      if (!i) throw new Error(`thiếu ${id}`)
      return i
    }
    expect(isFadedCorrect(choice('simple-vs-continuous').practice.faded.answer, 'is raining')).toBe(true)
    const c6 = item('dont-translate', 'dont-translate-c6')
    expect(isCorrect(c6, { kind: 'type', text: 'have you had lunch yet' })).toBe(true)
    expect(isCorrect(c6, { kind: 'type', text: 'Did you have lunch?' })).toBe(false)
    const c1 = item('dont-translate', 'dont-translate-c1')
    expect(isCorrect(c1, { kind: 'type', text: 'Last year I met her.' })).toBe(true)
    const c2 = item('dont-translate', 'dont-translate-c2')
    expect(isCorrect(c2, { kind: 'type', text: "I've been to Dalat twice." })).toBe(true)
    expect(isCorrect(c2, { kind: 'type', text: 'I have gone to Da Lat twice.' })).toBe(false)
    const w6 = item('will-vs-going-to', 'will-vs-going-to-c6')
    expect(isCorrect(w6, { kind: 'type', text: 'are not going to go' })).toBe(true)
    expect(isCorrect(w6, { kind: 'type', text: "won't go" })).toBe(false)
  })

  it('khối will hay going to: câu chính không nghiêng một bên (3–4 câu mỗi bên), không còn câu chỉ hỏi dạng', () => {
    const c = choice('will-vs-going-to')
    const answers = c.practice.check.items.map(answerText)
    const goingTo = answers.filter((t) => /\bgoing to\b/i.test(t)).length
    expect(goingTo, answers.join(' | ')).toBeGreaterThanOrEqual(3)
    expect(goingTo, answers.join(' | ')).toBeLessThanOrEqual(4)
  })

  it('bảng "Mỗi thì một dòng" (s1-t4-w4): 10 dòng đúng thứ tự, link về bài chứa thì, + / − / ?, 3 luật trợ động từ', () => {
    const c = content('s1-t4-w4')
    expect(c.grammar).toBeUndefined()
    const blocks = c.pronunciation!.blocks!
    expect(blocks.map((b) => b.kind)).toEqual(['overview', 'overview', 'tense-table'])
    const table = blocks[2]
    if (table.kind !== 'tense-table') throw new Error('thiếu bảng')
    expect(table.title).toBe('Mỗi thì một dòng')
    expect(table.rows.map((r) => r.tenseId)).toEqual([
      'to-be',
      'present-simple-questions',
      'present-continuous',
      'past-to-be',
      'past-simple',
      'will',
      'going-to',
      'present-perfect',
      'modals',
      'passive-present',
    ])
    for (const r of table.rows) {
      const owner = LESSON_CONTENTS.find((x) => x.grammar?.tenses.some((t) => t.id === r.tenseId))
      expect(owner?.lessonId, r.tenseId).toBe(r.lessonId)
      expect(getSection(r.lessonId, 'grammar'), r.tenseId).toBeDefined()
      for (const f of [r.name, r.aux, r.affirmative, r.negative, r.question]) expect(f.trim(), r.tenseId).not.toBe('')
      expect(r.affirmative, r.tenseId).not.toMatch(/n't\b|\bnot\b/)
      expect(r.affirmative, r.tenseId).toMatch(/\.$/)
      expect(r.negative, r.tenseId).toMatch(/n't\b|\bnot\b/)
      expect(r.question, r.tenseId).toMatch(/\?$/)
    }
    expect(table.auxRules).toHaveLength(3)
    expect(table.auxRules[2]).toContain('Do you can')
  })
})
