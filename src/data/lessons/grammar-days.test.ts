import { describe, expect, it } from 'vitest'

import { conceptLessonIndex, LESSON_CONCEPTS, QUESTION_BANK, requiresViolations, type ConceptLessonId, type Question } from '@/data/questions'
import { allLessons } from '@/data/roadmap'
import { normalizeTyped } from '@/lib/quiz'
import { practiceEnglishTexts } from '@/lib/tense-practice'
import { isTenseScopeId, outOfScopeWords, type TenseScopeId } from '@/lib/tense-scope'

import {
  allTenseChoices,
  getGrammarDay,
  getLessonContent,
  LESSON_CONTENTS,
  lessonPartIds,
  lessonPartKind,
  sessionSectionViews,
} from './index'
import type { GrammarDay, LessonContent, Tense } from './types'

/** Ngữ pháp theo ngày (story 47). */

const SPLIT = ['s1-t2-w1', 's1-t2-w2', 's1-t2-w3', 's1-t2-w4', 's1-t3-w1', 's1-t3-w2', 's1-t3-w3', 's1-t4-w1'] as const
const KINDS = ['affirmative', 'negative', 'question', 'compare', 'mixed'] as const

const content = (id: string): LessonContent => getLessonContent(id)!
const daysOf = (id: string): readonly GrammarDay[] => content(id).grammarDays ?? []
const tensesOf = (id: string): readonly Tense[] => content(id).grammar?.tenses ?? []
const lessonOrder = new Map(allLessons().map((l, i) => [l.id, i]))
/** Bài chứa thì `tenseId`. */
const tenseLesson = new Map(LESSON_CONTENTS.flatMap((c) => (c.grammar?.tenses ?? []).map((t) => [t.id, c.lessonId] as const)))

/** Thì cuối bài có bảng phạm vi chữ. */
function lastScope(lessonId: string): TenseScopeId {
  const ids = tensesOf(lessonId).map((t) => t.id).filter(isTenseScopeId)
  const last = ids.at(-1)
  if (!last) throw new Error(`${lessonId}: không có thì có bảng phạm vi`)
  return last
}

/** Chữ tiếng Anh của ngày: câu nói và hai câu của mỗi cặp. */
const dayTexts = (d: GrammarDay): string[] => [
  ...(d.sentences ?? []).map((s) => s.text),
  ...(d.compare?.pairs ?? []).flatMap((p) => [p.a.en, p.b.en]),
]

/**
 * Câu đã có của bài: ví dụ TenseCard, câu đúng của lỗi hay mắc, phần luyện của thì / khối (cả câu mẫu áp dụng), câu khối
 * "Chọn thì", câu luyện nói / shadowing / chính tả của đoạn Phát âm, đề quiz đã điền đáp án và đáp án.
 */
function existingTexts(lessonId: string): Set<string> {
  const c = content(lessonId)
  const grammar = c.grammar
  const pron = c.pronunciation
  const texts = [
    ...(grammar?.tenses ?? []).flatMap((t) => [
      ...t.examples.map((e) => e.en),
      ...t.mistakes.map((m) => m.right),
      ...(t.practice ? practiceEnglishTexts(t.practice) : []),
    ]),
    ...(pron?.sentences ?? []).map((x) => x.text),
    ...(pron?.blocks ?? []).flatMap((b) =>
      b.kind === 'shadowing' ? b.lines.map((x) => x.text) : b.kind === 'dictation' ? b.items.map((x) => x.text) : [],
    ),
    ...(grammar?.choices ?? []).flatMap((c) => [
      ...practiceEnglishTexts(c.practice),
      ...c.pairs.flatMap((p) => [p.a.en, p.b.en]),
      ...(c.sides ?? []).map((s) => s.example.en),
    ]),
    ...QUESTION_BANK.filter((q) => q.lessonId === lessonId).flatMap((q) => [
      q.prompt.replace(/___ \([^)]*\)|___/, q.answer),
      q.answer,
      ...('accept' in q ? (q.accept ?? []) : []),
    ]),
  ]
  return new Set(texts.map(normalizeTyped))
}

/** Mọi id câu luyện nói đã có ngoài ngày (câu mẫu, phần, shadowing / chính tả, câu nói của phần luyện). */
function otherSentenceIds(): Set<string> {
  const ids: string[] = []
  for (const c of LESSON_CONTENTS) {
    ids.push(...(c.pronunciation?.sentences ?? []).map((s) => s.id))
    ids.push(...(c.parts ?? []).flatMap((p) => p.sentences.map((s) => s.id)))
    for (const b of c.pronunciation?.blocks ?? []) {
      if (b.kind === 'shadowing') ids.push(...b.lines.map((s) => s.id))
      if (b.kind === 'dictation') ids.push(...b.items.map((s) => s.id))
    }
    for (const t of c.grammar?.tenses ?? []) ids.push(...(t.practice?.apply.speak ?? []).map((s) => s.id))
  }
  for (const ch of allTenseChoices()) ids.push(...(ch.practice.apply.speak ?? []).map((s) => s.id))
  return new Set(ids)
}

/** Câu hỏi giả để kiểm `requires` của ngày theo đúng luật câu hỏi của bài (`requiresViolations`). */
const asQuestion = (lessonId: string, d: GrammarDay): Question =>
  ({
    id: d.id,
    lessonId,
    sectionId: 'grammar',
    tag: 'thì',
    kind: 'choice',
    prompt: '',
    options: ['a', 'b', 'c', 'd'],
    answer: 'a',
    explanation: '',
    requires: d.requires,
  }) as Question

describe('Ngữ pháp theo ngày (story 47)', () => {
  it('đúng 8 bài có grammarDays; không bài nào có cả parts lẫn grammarDays', () => {
    expect(LESSON_CONTENTS.filter((c) => c.grammarDays).map((c) => c.lessonId)).toEqual([...SPLIT])
    for (const c of LESSON_CONTENTS) expect(Boolean(c.parts && c.grammarDays), c.lessonId).toBe(false)
    // Không chia: T1, s1-t3-w4, s1-t4-w3, s1-t4-w4.
    for (const id of ['s1-t1-w1', 's1-t1-w4', 's1-t3-w4', 's1-t4-w3', 's1-t4-w4']) expect(content(id).grammarDays, id).toBeUndefined()
  })

  it('mỗi bài 5 ngày, id `${lessonId}-n1` … `-n5`, kind affirmative → negative → question → compare → mixed', () => {
    for (const id of SPLIT) {
      const days = daysOf(id)
      expect(days.map((d) => d.id), id).toEqual([1, 2, 3, 4, 5].map((k) => `${id}-n${k}`))
      expect(days.map((d) => d.kind), id).toEqual([...KINDS])
      for (const d of days) {
        expect(d.title.trim(), d.id).not.toBe('')
        expect(d.note.trim(), d.id).not.toBe('')
      }
      const n5 = days[4]
      expect(n5.title).toBe('Ôn trộn cả tuần')
      expect(n5.focus ?? n5.sentences ?? n5.choiceIds ?? n5.compare, n5.id).toBeUndefined()
    }
  })

  it('nhãn trong focus có thật; mỗi nhãn công thức của mỗi thì trong bài nằm trong focus của ít nhất 1 ngày', () => {
    for (const id of SPLIT) {
      const tenses = new Map(tensesOf(id).map((t) => [t.id, t]))
      const covered = new Set<string>()
      for (const d of daysOf(id)) {
        for (const f of d.focus ?? []) {
          const t = tenses.get(f.tenseId)
          expect(t, `${d.id}: ${f.tenseId}`).toBeDefined()
          for (const label of f.labels) {
            expect(t?.formulas.map((x) => x.label), `${d.id}: ${label}`).toContain(label)
            covered.add(`${f.tenseId}|${label}`)
          }
        }
      }
      for (const t of tenses.values()) for (const x of t.formulas) expect(covered.has(`${t.id}|${x.label}`), `${id}: ${t.id} ${x.label}`).toBe(true)
    }
  })

  it('mỗi khối "Chọn thì" của bài được gán cho đúng 1 ngày; choiceIds chỉ trỏ khối của bài', () => {
    for (const id of SPLIT) {
      const own = (content(id).grammar?.choices ?? []).map((c) => c.id)
      const assigned = daysOf(id).flatMap((d) => [...(d.choiceIds ?? [])])
      expect([...assigned].sort(), id).toEqual([...own].sort())
    }
    expect(getGrammarDay('s1-t2-w1', 's1-t2-w1-n4')?.choiceIds).toEqual(['simple-vs-continuous'])
    expect(getGrammarDay('s1-t2-w2', 's1-t2-w2-n3')?.choiceIds).toEqual(['subject-questions'])
    expect(getGrammarDay('s1-t3-w2', 's1-t3-w2-n4')?.choiceIds).toEqual(['will-vs-going-to'])
    expect(getGrammarDay('s1-t4-w1', 's1-t4-w1-n4')?.choiceIds).toEqual(['have-to-could-would-like'])
  })

  it('N1–N3 đúng 3 câu nói, id `${dayId}-say-${k}`, không trùng id nào; N1 khẳng định, N2 có not / n\'t, N3 kết thúc "?"', () => {
    const others = otherSentenceIds()
    const seen = new Set<string>()
    let total = 0
    for (const id of SPLIT) {
      for (const d of daysOf(id).slice(0, 3)) {
        const sentences = d.sentences ?? []
        expect(sentences.map((s) => s.id), d.id).toEqual([1, 2, 3].map((k) => `${d.id}-say-${k}`))
        for (const s of sentences) {
          total++
          expect(others.has(s.id), s.id).toBe(false)
          expect(seen.has(s.id), s.id).toBe(false)
          seen.add(s.id)
          expect(s.vi.trim(), s.id).not.toBe('')
          const text = s.text.replace(/[’‘]/g, "'")
          const negative = /\bnot\b|n't\b/i.test(text)
          if (d.kind === 'affirmative') {
            expect(negative, s.text).toBe(false)
            expect(text.trim().endsWith('?'), s.text).toBe(false)
          }
          if (d.kind === 'negative') expect(negative, s.text).toBe(true)
          if (d.kind === 'question') expect(text.trim().endsWith('?'), s.text).toBe(true)
        }
      }
      for (const d of daysOf(id).slice(3)) expect(d.sentences, d.id).toBeUndefined()
    }
    expect(total).toBe(72)
  })

  it('N4 có khối "Chọn thì" hoặc đúng 3 cặp câu (a ≠ b, có ghi chú) so với thì của bài trước', () => {
    let pairs = 0
    for (const id of SPLIT) {
      const n4 = daysOf(id)[3]
      expect((n4.choiceIds?.length ?? 0) > 0 || n4.compare !== undefined, n4.id).toBe(true)
      if (!n4.compare) continue
      expect(n4.compare.pairs, n4.id).toHaveLength(3)
      expect(n4.compare.withTenseIds.length, n4.id).toBeGreaterThan(0)
      for (const tenseId of n4.compare.withTenseIds) {
        const at = tenseLesson.get(tenseId)
        expect(at, `${n4.id}: ${tenseId}`).toBeDefined()
        expect(lessonOrder.get(at!)!, `${n4.id}: ${tenseId}`).toBeLessThan(lessonOrder.get(id)!)
      }
      for (const p of n4.compare.pairs) {
        pairs++
        expect(normalizeTyped(p.a.en), n4.id).not.toBe(normalizeTyped(p.b.en))
        expect(p.noteVi.trim(), n4.id).not.toBe('')
        expect(p.a.vi.trim() && p.b.vi.trim(), n4.id).toBeTruthy()
      }
    }
    expect(pairs).toBe(18)
    // Ngày 4 không có khối thì không có câu nói; ngày 1–3 không có cặp câu.
    for (const id of SPLIT) for (const d of daysOf(id).slice(0, 3)) expect(d.compare, d.id).toBeUndefined()
  })

  it('requires của N1–N4 hợp lệ theo luật câu hỏi (viên bất kỳ, bài trước hoặc chính bài) và có khái niệm của chính bài', () => {
    for (const id of SPLIT) {
      const own = LESSON_CONCEPTS[id as ConceptLessonId]
      expect(conceptLessonIndex(id), id).toBeGreaterThan(0)
      for (const d of daysOf(id).slice(0, 4)) {
        expect(d.requires?.length ?? 0, d.id).toBeGreaterThan(0)
        expect(requiresViolations(asQuestion(id, d)), d.id).toEqual([])
        expect(d.requires!.some((c) => own.includes(c)), d.id).toBe(true)
      }
      expect(daysOf(id)[4].requires, id).toBeUndefined()
    }
    // Tự kiểm: ngày của s1-t2-w1 khai báo past-simple (dạy ở s1-t2-w2) → vi phạm.
    const n1 = daysOf('s1-t2-w1')[0]
    expect(requiresViolations(asQuestion('s1-t2-w1', { ...n1, requires: ['present-continuous', 'past-simple'] }))).not.toEqual([])
  })

  it('chữ tiếng Anh của câu nói và cặp câu nằm trong phạm vi chữ của thì cuối bài, không trùng câu đã có của bài', () => {
    const bad: string[] = []
    for (const id of SPLIT) {
      const scope = lastScope(id)
      const existing = existingTexts(id)
      expect(existing.size, id).toBeGreaterThan(10)
      const own = new Set<string>()
      for (const d of daysOf(id)) {
        for (const text of dayTexts(d)) {
          const words = outOfScopeWords(scope, text)
          if (words.length > 0) bad.push(`${d.id} (${scope}): ${text} → ${words.join(', ')}`)
          const key = normalizeTyped(text)
          if (existing.has(key)) bad.push(`${d.id}: ${text} trùng câu đã có của bài`)
          if (own.has(key)) bad.push(`${d.id}: ${text} trùng câu khác của tuần`)
          own.add(key)
        }
      }
    }
    expect(bad).toEqual([])
  })

  it('lessonPartIds trả id ngày; lessonPartKind phân biệt phần Phát âm và ngày Ngữ pháp; getGrammarDay', () => {
    expect(lessonPartIds('s1-t2-w1')).toEqual([1, 2, 3, 4, 5].map((k) => `s1-t2-w1-n${k}`))
    expect(lessonPartIds('s1-t3-w4')).toEqual([])
    expect(lessonPartIds('s1-t4-w3')).toEqual([])
    expect(lessonPartKind('s1-t2-w1', 's1-t2-w1-n2')).toBe('grammar')
    expect(lessonPartKind('s1-t1-w1', 's1-t1-w1-p1')).toBe('pronunciation')
    expect(lessonPartKind('s1-t2-w1', 's1-t1-w1-p1')).toBeNull()
    expect(lessonPartKind('s1-t2-w1', 's1-t3-w1-n2')).toBeNull()
    expect(lessonPartKind('khong-co', 's1-t2-w1-n1')).toBeNull()
    expect(getGrammarDay('s1-t2-w1', 's1-t2-w1-n1')?.kind).toBe('affirmative')
    expect(getGrammarDay('s1-t2-w1', 's1-t2-w2-n1')).toBeUndefined()
  })

  it('sessionSectionViews: buổi ngày 1 / 3 / 4 / 5 → ngày đó; xem hết hay part lạ → cả tuần (không danh sách ngày); phần T1 → Phát âm', () => {
    for (const k of [1, 3, 4, 5]) {
      expect(sessionSectionViews('s1-t2-w1', `s1-t2-w1-n${k}`)).toEqual({
        pronunciation: { kind: 'all' },
        grammar: { kind: 'day', dayId: `s1-t2-w1-n${k}` },
      })
    }
    const week = { pronunciation: { kind: 'all' }, grammar: { kind: 'week' } }
    expect(sessionSectionViews('s1-t2-w1', null)).toEqual(week)
    expect(sessionSectionViews('s1-t2-w1', 's1-t3-w1-n2')).toEqual(week)
    expect(sessionSectionViews('s1-t3-w4', null)).toEqual(week)
    expect(sessionSectionViews('s1-t1-w1', 's1-t1-w1-p1')).toEqual({ pronunciation: { kind: 'part', partId: 's1-t1-w1-p1' }, grammar: { kind: 'week' } })
  })

  it('mẫu trong Design Notes', () => {
    // "She is cooking dinner now." trùng câu mẫu phần luyện của thì nên đổi chủ ngữ.
    expect(getGrammarDay('s1-t2-w1', 's1-t2-w1-n1')?.sentences?.[0].text).toBe('My mother is cooking dinner now.')
    expect(getGrammarDay('s1-t2-w1', 's1-t2-w1-n2')?.sentences?.[0].text).toBe("I'm not working today.")
    expect(getGrammarDay('s1-t2-w1', 's1-t2-w1-n3')?.sentences?.[0].text).toBe('Are you listening to me?')
    const pair = getGrammarDay('s1-t3-w1', 's1-t3-w1-n4')?.compare?.pairs[0]
    expect(pair?.a.en).toBe('I call my mom every Sunday.')
    expect(pair?.noteVi).toContain('will')
    expect(getGrammarDay('s1-t2-w2', 's1-t2-w2-n4')?.compare?.withTenseIds).toEqual(['to-be', 'present-simple-questions'])
  })
})
