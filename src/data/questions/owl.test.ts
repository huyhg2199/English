import { describe, expect, it } from 'vitest'

import { allTenseChoices, allTenses, getLessonContent, IRREGULAR_VERBS, lessonRuleCards, LESSON_CONTENTS } from '@/data/lessons'
import { getLesson, getSection } from '@/data/roadmap'
import { hasVietnameseMarks, isAnswerCorrect, matchesTyped, normalizeTyped } from '@/lib/quiz'
import { practiceEnglishTexts } from '@/lib/tense-practice'
import { frontedTimeTail, outOfScopeWords, promptEnglish, sContraction } from '@/lib/tense-scope'

import { conceptSource, requiresViolations } from './concepts'
import { FOUNDATION_QUESTIONS } from './foundation'
import {
  getQuestion,
  isTypedQuestion,
  OWL_CONTRASTS,
  OWL_QUESTIONS,
  OWL_TOPICS,
  QUESTION_BANK,
  type OwlQuestion,
  type TypedQuestion,
} from './index'

/** Kho câu O.W.L. 1 (story 40): 42 câu tự soạn, ngoài `QUESTION_BANK`. */

const pad = (n: number) => String(n).padStart(2, '0')
const owl = (n: number) => OWL_QUESTIONS.find((q) => q.id === `q-owl-${pad(n)}`)!
const typed = OWL_QUESTIONS.filter(isTypedQuestion) as (TypedQuestion & OwlQuestion)[]
const CHANGE_RE = /^Đổi [^:]+: [^:]+[.?!]$/
const TRANSLATE_RE = /^Dịch sang tiếng Anh: .+ \([^)]+\)$/
const fill = (prompt: string, answer: string) => prompt.replace(/___( \([^)]*\))?/, answer)
/** Câu đáp án đầy đủ của câu gõ: đề đã điền (type) hoặc chính đáp án (transform). */
const answerText = (q: TypedQuestion) => (q.kind === 'type' ? fill(q.prompt, q.answer) : q.answer)
const key = (text: string) => normalizeTyped(promptEnglish(text))
/** Golden q-owl-05 giữ đúng `accept: ['does not watch']` của spec dù trùng đáp án sau chuẩn hoá (n't = not). */
const ACCEPT_SAME_AS_ANSWER = new Set(['q-owl-05'])
/** Dạng của hai thì trong một cặp (theo thứ tự `topics` của cặp): lựa chọn nào mang dạng của thì đó. */
type Form = (o: string, all: readonly string[]) => boolean
const PAIR_FORMS: Record<string, [Form, Form]> = {
  'simple-continuous': [(o) => /^[a-z]+s$/.test(o) && !o.endsWith('ing'), (o) => /^(am|is|are) [a-z]+ing$/.test(o)],
  'was-did': [(o) => /^(Was|Were)$/.test(o), (o) => o === 'Did'],
  'will-going-to': [(o) => /^will$/.test(o), (o) => /\bgoing to$/.test(o)],
  // Quá khứ đơn: một chữ mà "has / have + chữ đó" cũng là lựa chọn (V2 = V3); hoàn thành: has / have + V3.
  'past-perfect': [(o, all) => all.some((x) => x === `has ${o}` || x === `have ${o}`), (o) => /^(has|have) [a-z]+$/.test(o)],
}

describe('kho câu O.W.L. 1 (story 40)', () => {
  it('42 câu, id q-owl-01 … q-owl-42 theo thứ tự, không trùng id nào khác; getQuestion tra được', () => {
    expect(OWL_QUESTIONS.map((q) => q.id)).toEqual(Array.from({ length: 42 }, (_, i) => `q-owl-${pad(i + 1)}`))
    const others = new Set([...QUESTION_BANK, ...FOUNDATION_QUESTIONS].map((q) => q.id))
    for (const q of OWL_QUESTIONS) {
      expect(others.has(q.id), q.id).toBe(false)
      expect(getQuestion(q.id), q.id).toBe(q)
    }
    const bank = new Set(QUESTION_BANK.map((q) => q.id))
    expect(OWL_QUESTIONS.some((q) => bank.has(q.id))).toBe(false)
  })

  it('OWL_TOPICS: 10 chủ điểm theo đúng thứ tự bảng "Mỗi thì một dòng" (s1-t4-w4); OWL_CONTRASTS đúng bảng', () => {
    const table = getLessonContent('s1-t4-w4')!.pronunciation!.blocks!.find((b) => b.kind === 'tense-table')
    if (!table || table.kind !== 'tense-table') throw new Error('thiếu bảng')
    // Bảng story 39 dùng present-simple-questions cho dòng hiện tại đơn: coi là present-simple.
    // Story 46: dòng quá khứ tiếp diễn chưa có chủ điểm O.W.L. (deferred-work), nên bỏ khỏi phép so.
    const rows = table.rows
      .filter((r) => r.tenseId !== 'past-continuous')
      .map((r) => (r.tenseId === 'present-simple-questions' ? 'present-simple' : r.tenseId))
    expect(OWL_TOPICS.map((t) => t.id)).toEqual(rows)
    expect(OWL_TOPICS.map((t) => [t.id, t.name, t.lessonIds])).toEqual([
      ['to-be', 'to be hiện tại', ['s1-t1-w1']],
      ['present-simple', 'Hiện tại đơn', ['s1-t1-w2', 's1-t1-w3']],
      ['present-continuous', 'Hiện tại tiếp diễn', ['s1-t2-w1']],
      ['past-to-be', 'to be quá khứ', ['s1-t2-w2']],
      ['past-simple', 'Quá khứ đơn', ['s1-t2-w2', 's1-t2-w3']],
      ['will', 'Tương lai will', ['s1-t3-w1']],
      ['going-to', 'be going to', ['s1-t3-w2']],
      ['present-perfect', 'Hiện tại hoàn thành', ['s1-t3-w3', 's1-t3-w4']],
      ['modals', 'can / should / must', ['s1-t4-w1']],
      ['passive-present', 'Bị động hiện tại', ['s1-t4-w3']],
    ])
    for (const t of OWL_TOPICS) for (const l of t.lessonIds) expect(getSection(l, 'grammar'), `${t.id} ${l}`).toBeDefined()
    expect(OWL_CONTRASTS.map((c) => [c.id, c.topics, c.lessonId])).toEqual([
      ['simple-continuous', ['present-simple', 'present-continuous'], 's1-t2-w1'],
      ['was-did', ['past-to-be', 'past-simple'], 's1-t2-w2'],
      ['will-going-to', ['will', 'going-to'], 's1-t3-w2'],
      ['past-perfect', ['past-simple', 'present-perfect'], 's1-t3-w4'],
    ])
  })

  it('phân bổ: mỗi chủ điểm 3 câu riêng liền nhau (chọn, gõ dạng đúng, biến đổi / dịch xen kẽ); mỗi cặp 3 câu (2 chọn rồi 1 gõ), mỗi bên ≥ 1 câu', () => {
    OWL_TOPICS.forEach((t, i) => {
      const [c, ty, tr] = [1, 2, 3].map((k) => owl(3 * i + k))
      for (const q of [c, ty, tr]) {
        expect(q.topicId, q.id).toBe(t.id)
        expect(q.contrastId, q.id).toBeUndefined()
        expect(t.lessonIds as readonly string[], q.id).toContain(q.lessonId)
      }
      expect([c.kind, ty.kind, tr.kind], t.id).toEqual(['choice', 'type', 'transform'])
      expect((i % 2 === 0 ? CHANGE_RE : TRANSLATE_RE).test(tr.prompt), tr.id).toBe(true)
      expect(OWL_QUESTIONS.filter((q) => q.topicId === t.id && !q.contrastId), t.id).toHaveLength(3)
    })
    OWL_CONTRASTS.forEach((c, i) => {
      const qs = [1, 2, 3].map((k) => owl(30 + 3 * i + k))
      expect(qs.map((q) => q.kind), c.id).toEqual(['choice', 'choice', 'type'])
      for (const q of qs) {
        expect(q.contrastId, q.id).toBe(c.id)
        expect(c.topics as readonly string[], q.id).toContain(q.topicId)
        expect(q.lessonId, q.id).toBe(c.lessonId)
      }
      for (const side of c.topics) expect(qs.some((q) => q.topicId === side), `${c.id} ${side}`).toBe(true)
      expect(OWL_QUESTIONS.filter((q) => q.contrastId === c.id), c.id).toHaveLength(3)
      // Câu chọn của cặp có dạng của cả hai thì trong lựa chọn.
      const [sideA, sideB] = PAIR_FORMS[c.id]
      for (const q of qs) {
        if (isTypedQuestion(q)) continue
        expect(q.options.some((o) => sideA(o, q.options)), `${q.id} ${c.topics[0]}`).toBe(true)
        expect(q.options.some((o) => sideB(o, q.options)), `${q.id} ${c.topics[1]}`).toBe(true)
      }
    })
  })

  it('đoạn Ngữ pháp, nhãn thì, bài có thật; câu chọn 4 lựa chọn khác nhau, đáp án là một lựa chọn; giải thích tiếng Việt', () => {
    for (const q of OWL_QUESTIONS) {
      expect(q.sectionId, q.id).toBe('grammar')
      expect(q.tag, q.id).toBe('thì')
      expect(getLesson(q.lessonId)?.stageId, q.id).toBe('s1')
      expect(getSection(q.lessonId, 'grammar'), q.id).toBeDefined()
      expect(hasVietnameseMarks(q.explanation), q.id).toBe(true)
      if (!isTypedQuestion(q)) {
        expect(q.kind, q.id).toBe('choice')
        expect(new Set(q.options).size, q.id).toBe(4)
        expect(q.options.filter((o) => o === q.answer), q.id).toHaveLength(1)
        expect(q.prompt.split('___'), q.id).toHaveLength(2)
      }
    }
  })

  it('requires không rỗng, hợp lệ, có ≥ 1 khái niệm viên gạch; câu có thứ / tháng khai days-months, có số / năm khai numbers', () => {
    for (const q of OWL_QUESTIONS) {
      expect(q.requires?.length ?? 0, q.id).toBeGreaterThan(0)
      expect(requiresViolations(q), q.id).toEqual([])
      expect(q.requires!.some((c) => 'brick' in (conceptSource(c) ?? {})), q.id).toBe(true)
      const text = [promptEnglish(q.prompt), q.answer].join(' ')
      if (/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|June|July|August|September|October|November|December)\b/.test(text)) {
        expect(q.requires, q.id).toContain('days-months')
      }
      if (/\d|\b(two|three|four|five|six|seven|eight|nine|ten)\b/i.test(text)) expect(q.requires, q.id).toContain('numbers')
    }
  })

  it('câu gõ: type có đúng một ___ và gợi ý ngay sau; transform khớp đúng một mẫu đề; answer / accept không dấu tiếng Việt, không trùng nhau', () => {
    for (const q of typed) {
      if (q.kind === 'type') {
        expect(q.prompt.split('___'), q.id).toHaveLength(2)
        if (q.prompt.includes('(')) expect(q.prompt, q.id).toMatch(/___ \([^)]+\)/)
      } else {
        expect(CHANGE_RE.test(q.prompt) !== TRANSLATE_RE.test(q.prompt), q.id).toBe(true)
        if (TRANSLATE_RE.test(q.prompt)) expect(hasVietnameseMarks(promptEnglish(q.prompt)), q.id).toBe(false)
      }
      const all = [q.answer, ...(q.accept ?? [])]
      for (const a of all) expect(hasVietnameseMarks(a), `${q.id}: ${a}`).toBe(false)
      const accepts = (q.accept ?? []).map(normalizeTyped)
      expect(new Set(accepts).size, q.id).toBe(accepts.length)
      if (!ACCEPT_SAME_AS_ANSWER.has(q.id)) expect(accepts, q.id).not.toContain(normalizeTyped(q.answer))
    }
    expect(typed).toHaveLength(24)
  })

  it("luật 's và trạng ngữ lên đầu (như câu quiz story 37)", () => {
    for (const q of typed) {
      const accepts = (q.accept ?? []).map(normalizeTyped)
      if (/[a-z]'s\b/i.test(q.answer)) {
        const full = [q.answer.replace(/'s\b/, ' is'), q.answer.replace(/'s\b/, ' has')].map(normalizeTyped)
        expect(full.some((f) => accepts.includes(f)), q.id).toBe(true)
      }
      const s = sContraction(q.answer)
      if (s) expect(accepts, q.id).toContain(normalizeTyped(s))
      if (q.kind === 'transform' && !q.answer.trim().endsWith('?')) {
        const fronted = frontedTimeTail(normalizeTyped(q.answer))
        if (fronted) expect(accepts, q.id).toContain(fronted)
      }
    }
  })

  it('chữ tiếng Anh (đề, lựa chọn sai, đáp án, accept) trong phạm vi chặng 1: outOfScopeWords("passive-present", …) rỗng', () => {
    for (const q of OWL_QUESTIONS) {
      const texts = [promptEnglish(q.prompt), q.answer, ...(isTypedQuestion(q) ? [...(q.accept ?? []), answerText(q)] : [fill(q.prompt, q.answer)])]
      for (const t of texts) expect(outOfScopeWords('passive-present', t), `${q.id}: ${t}`).toEqual([])
      if (!isTypedQuestion(q)) {
        for (const o of q.options) expect(outOfScopeWords('passive-present', o, { wrongOption: true }), `${q.id}: ${o}`).toEqual([])
      }
    }
  })

  it('V2 / V3 bất quy tắc chỉ trong 50 động từ của IRREGULAR_VERBS', () => {
    const OUTSIDE = new Set(
      [
        'grew', 'grown', 'rode', 'ridden', 'flew', 'flown', 'wore', 'worn', 'threw', 'thrown', 'shown', 'drew', 'drawn', 'held',
        'won', 'stood', 'led', 'fed', 'bit', 'bitten', 'hid', 'hidden', 'shook', 'shaken', 'woke', 'woken', 'rose', 'risen', 'stole',
        'stolen', 'lent', 'fought', 'hung', 'swept', 'lit', 'blew', 'blown', 'rang', 'rung', 'sank', 'sunk', 'froze', 'frozen',
        'beaten', 'bent', 'dealt', 'dug', 'fled', 'forgave', 'forgiven', 'laid', 'lain', 'shot', 'slid', 'sought', 'sped', 'spun',
        'stuck', 'stung', 'struck', 'swore', 'sworn', 'swung', 'tore', 'torn', 'wept', 'mistook', 'mistaken', 'overslept',
        'withdrew', 'withdrawn', 'arose', 'arisen', 'borne', 'dreamt', 'leapt', 'spelt', 'burnt',
      ].filter((w) => !IRREGULAR_VERBS.some((v) => [...v.v2.split(' / '), ...v.v3.split(' / ')].includes(w))),
    )
    expect(OUTSIDE.has('grown')).toBe(true)
    const outside = (text: string) => (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []).filter((w) => OUTSIDE.has(w))
    for (const q of OWL_QUESTIONS) {
      const texts = [promptEnglish(q.prompt), q.answer, ...(isTypedQuestion(q) ? [...(q.accept ?? []), answerText(q)] : q.options)]
      for (const t of texts) expect(outside(t), `${q.id}: ${t}`).toEqual([])
    }
  })

  it('không trùng đề: khác mọi câu QUESTION_BANK, Sân ga, câu luyện của thì và khối "Chọn thì", thẻ quy tắc; đáp án câu gõ khác mọi ví dụ TenseCard', () => {
    const taken = new Set<string>([
      ...[...QUESTION_BANK, ...FOUNDATION_QUESTIONS].map((q) => key(q.prompt)),
      ...[...allTenses(), ...allTenseChoices()].flatMap((t) => (t.practice ? practiceEnglishTexts(t.practice) : [])).map(key),
      ...LESSON_CONTENTS.flatMap((c) => lessonRuleCards(c.lessonId)).map((r) => key(r.cloze)),
    ])
    expect(taken.size).toBeGreaterThan(500)
    const mine = OWL_QUESTIONS.map((q) => key(q.prompt))
    expect(new Set(mine).size).toBe(mine.length)
    for (const q of OWL_QUESTIONS) expect(taken.has(key(q.prompt)), `${q.id}: ${q.prompt}`).toBe(false)
    const examples = new Set(allTenses().flatMap((t) => t.examples.map((e) => normalizeTyped(e.en))))
    expect(examples.size).toBeGreaterThan(50)
    for (const q of typed) {
      for (const a of [q.answer, answerText(q), ...(q.accept ?? [])]) expect(examples.has(normalizeTyped(a)), `${q.id}: ${a}`).toBe(false)
    }
  })

  it('đáp án và mọi accept tự chấm đúng (isAnswerCorrect), kể cả viết thường bỏ dấu câu', () => {
    for (const q of OWL_QUESTIONS) {
      expect(isAnswerCorrect(q, q.answer), q.id).toBe(true)
      if (!isTypedQuestion(q)) {
        for (const o of q.options) if (o !== q.answer) expect(isAnswerCorrect(q, o), `${q.id}: ${o}`).toBe(false)
        continue
      }
      for (const a of [q.answer, ...(q.accept ?? [])]) {
        expect(isAnswerCorrect(q, a), `${q.id}: ${a}`).toBe(true)
        expect(isAnswerCorrect(q, a.toLowerCase().replace(/[.?!,]/g, '')), `${q.id}: ${a}`).toBe(true)
      }
    }
  })

  it('golden: đúng chữ, đáp án, accept, chủ điểm, cặp', () => {
    expect(owl(1)).toMatchObject({
      kind: 'choice',
      topicId: 'to-be',
      lessonId: 's1-t1-w1',
      prompt: 'My brother and I ___ students.',
      options: ['are', 'is', 'am', 'be'],
      answer: 'are',
      requires: ['subject-pronouns', 'possessive-adjectives', 'plurals', 'be-affirmative'],
    })
    expect(owl(5)).toMatchObject({
      kind: 'type',
      topicId: 'present-simple',
      lessonId: 's1-t1-w3',
      prompt: 'My sister ___ (not / watch) TV on weekdays.',
      answer: "doesn't watch",
      accept: ['does not watch'],
    })
    expect(owl(27)).toMatchObject({
      kind: 'transform',
      topicId: 'modals',
      lessonId: 's1-t4-w1',
      prompt: 'Đổi sang câu hỏi: You can drive a car.',
      answer: 'Can you drive a car?',
    })
    expect(owl(29)).toMatchObject({
      kind: 'type',
      topicId: 'passive-present',
      lessonId: 's1-t4-w3',
      prompt: 'These shoes ___ (make) in Vietnam.',
      answer: 'are made',
    })
    expect(owl(34)).toMatchObject({
      kind: 'choice',
      topicId: 'past-to-be',
      contrastId: 'was-did',
      lessonId: 's1-t2-w2',
      prompt: '___ you at home last night?',
      options: ['Were', 'Did', 'Was', 'Are'],
      answer: 'Were',
    })
    expect(owl(34).explanation).toMatch(/Were/)
    expect(owl(34).explanation).toMatch(/did/)
    expect(owl(42)).toMatchObject({
      kind: 'type',
      topicId: 'past-simple',
      contrastId: 'past-perfect',
      lessonId: 's1-t3-w4',
      prompt: 'My parents ___ (buy) this house in 2018.',
      answer: 'bought',
    })
    expect(owl(42).explanation).toMatch(/have bought/)
    for (const n of [27, 29, 34, 42]) expect((owl(n) as TypedQuestion).accept, `${n}`).toBeUndefined()
  })

  it('câu gõ golden q-owl-05: "does not watch" đúng (accept), "don\'t watch" sai', () => {
    const q = owl(5) as TypedQuestion
    expect(matchesTyped(q.answer, 'does not watch', q.accept)).toBe(true)
    expect(matchesTyped(q.answer, "don't watch", q.accept)).toBe(false)
    expect(isAnswerCorrect(q, "doesn't watch")).toBe(true)
  })
})
