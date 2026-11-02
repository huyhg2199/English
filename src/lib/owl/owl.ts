import { getQuestion, type MistakeTag, type Question } from '@/data/questions'
import { allLessons, getLesson, type Lesson, type SectionId } from '@/data/roadmap'
import { hasDetails, type StudyWord, type Word } from '@/data/vocab'
import { PART_LABELS, PART_LIMITS } from '@/lib/placement'
import { normalizeWords } from '@/lib/pronunciation'
import {
  isMastered,
  isMistakeTag,
  listAttempts,
  listMistakes,
  readMistakes,
  recordAttempt,
  recordMistake,
  seededRandom,
  shuffle,
  type AttemptAnswer,
  type QuizAttemptEntry,
} from '@/lib/quiz'
import { addDays, daysBetween, parseDayKey } from '@/lib/schedule'
import { localDayKey } from '@/lib/sessions'
import { isSrsCard, readSrs } from '@/lib/srs'
import { isPlainObject, type Store } from '@/lib/storage'

/**
 * Kỳ thi O.W.L. 1 qua cửa chặng 1 (story 14, CAP-4). Hàm thuần: seed và thời gian luôn qua tham số.
 * Lần thi nằm trong `quizzes.attempts` (`kind: 'owl'`, `checkpointId: 'owl-1'`); chi tiết từng phần và kế hoạch ôn
 * nằm ở field tuỳ chọn `owl` của lần làm (không có key store mới). Bỏ dở thì không ghi gì.
 */

export const OWL_CHECKPOINT_ID = 'owl-1'
/** `quizId` của lần thi (trùng id kỳ qua cửa). */
export const OWL_QUIZ_ID = OWL_CHECKPOINT_ID
export const OWL_HREF = '/practice/owl'
/** Bài chứa đoạn kiểm tra O.W.L. 1. */
export const OWL_LESSON_ID = 's1-t4-w4'
export const OWL_STAGE_ID = 's1'

export const OWL_PRONUNCIATION_SIZE = 30
export const OWL_TENSES_SIZE = 20
/** Ngưỡng qua cửa (%), tính riêng từng phần. */
export const OWL_PASS_PERCENT = 70
export const REVIEW_PLAN_DAYS = 14
/** Số lần nói tối đa cho một từ (lần nhận dạng được tính là một lần nói; không nghe thấy gì thì không tính). */
export const OWL_SAY_TRIES = 2

/** `chosen` của câu phát âm tự chấm (không có nhận giọng nói / micro lỗi). */
export const OWL_SELF_OK = 'tự chấm: đúng'
export const OWL_SELF_NO = 'tự chấm: chưa đúng'

/** Link đề mẫu ETS L&R (PDF, chỉ link, không chép đề). */
export const ETS_SAMPLE_TEST_URL =
  'https://www.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-sample-test.pdf'

export const OWL_PARTS = ['pronunciation', 'tenses'] as const
export type OwlPart = (typeof OWL_PARTS)[number]
export const OWL_PART_LABELS: Record<OwlPart, string> = { pronunciation: 'Phát âm', tenses: 'Thì' }
export const OWL_PART_TAGS: Record<OwlPart, MistakeTag> = { pronunciation: 'phát âm', tenses: 'thì' }

/** Phần ETS làm ngoài app: chỉ ghi tham khảo, không tính qua cửa. */
export const ETS_PARTS = ['p1', 'p2', 'p5'] as const
export type EtsPart = (typeof ETS_PARTS)[number]
export type EtsScores = Partial<Record<EtsPart, number>>

/** Từ đọc chưa đúng vào Sổ lỗi (nhãn `phát âm`) gắn đoạn IPA đầu tiên của chặng 1. */
export const OWL_WORD_SECTION: { lessonId: string; sectionId: SectionId } = {
  lessonId: 's1-t1-w1',
  sectionId: 'pronunciation',
}

const WORD_PREFIX = 'owl-ipa-'

/** Id câu phát âm (cũng là id mục Sổ lỗi) của một từ: `owl-ipa-<id từ>`. */
export function owlWordQuestionId(wordId: string): string {
  return `${WORD_PREFIX}${wordId}`
}

export function isOwlWordQuestionId(id: string): boolean {
  return id.startsWith(WORD_PREFIX)
}

export type OwlWord = { id: string; wordId: string; word: string; ipa: string }

function toOwlWord(w: StudyWord): OwlWord {
  return { id: owlWordQuestionId(w.id), wordId: w.id, word: w.word, ipa: w.ipa }
}

/**
 * 30 từ khác nhau cho phần phát âm: chọn ngẫu nhiên (theo seed) trong các thẻ SRS đã học (bỏ thẻ "Đã biết",
 * thẻ sai dạng và từ chưa có dữ liệu IPA). Thiếu thì bù bằng các từ NGSL hạng thấp nhất (hay gặp nhất) có dữ liệu,
 * bỏ từ có thẻ "Đã biết".
 */
export function pickOwlPronunciation(store: Store, words: readonly Word[], seed: string): OwlWord[] {
  const random = seededRandom(`${seed}|owl-pron`)
  const cards = readSrs(store).cards
  const byId = new Map(words.map((w) => [w.id, w]))
  const seenText = new Set<string>()
  const learned: StudyWord[] = []
  const known = new Set<string>()
  for (const [id, card] of Object.entries(cards)) {
    if (isSrsCard(card) && card.known) known.add(id)
    if (!isSrsCard(card) || card.known) continue
    const w = byId.get(id)
    if (w && hasDetails(w)) learned.push(w)
  }
  const picked: StudyWord[] = []
  const take = (w: StudyWord) => {
    const key = w.word.trim().toLowerCase()
    if (seenText.has(key) || picked.length >= OWL_PRONUNCIATION_SIZE) return
    seenText.add(key)
    picked.push(w)
  }
  // Xáo theo thứ tự id cố định để cùng seed luôn ra cùng đề (không phụ thuộc thứ tự key trong store).
  for (const w of shuffle(learned.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)), random)) take(w)
  if (picked.length < OWL_PRONUNCIATION_SIZE) {
    const fill = words
      .filter((w): w is StudyWord => w.list === 'ngsl' && hasDetails(w) && !known.has(w.id))
      .sort((a, b) => a.rank - b.rank)
    for (const w of fill) {
      if (picked.length >= OWL_PRONUNCIATION_SIZE) break
      take(w)
    }
  }
  return picked.map(toOwlWord)
}

/** Bài thuộc chặng 1. */
function isStageOneLesson(lessonId: string): boolean {
  return getLesson(lessonId)?.stageId === OWL_STAGE_ID
}

/** Câu nhãn `thì` dạng trắc nghiệm của chặng 1 (nguồn của phần thì). */
export function owlTensePool(bank: readonly Question[]): Question[] {
  return bank.filter((q) => q.tag === 'thì' && q.kind === 'choice' && isStageOneLesson(q.lessonId))
}

/** 20 câu thì ngẫu nhiên (theo seed) từ ngân hàng câu chặng 1. */
export function pickOwlTenses(bank: readonly Question[], seed: string): Question[] {
  return shuffle(owlTensePool(bank), seededRandom(`${seed}|owl-tenses`)).slice(0, OWL_TENSES_SIZE)
}

/**
 * Nhóm từ đồng âm (đọc giống nhau): nhận giọng nói chỉ nghe được âm, nên ra từ nào trong nhóm cũng tính là đọc đúng.
 * Dạng đã chuẩn hoá (chữ thường, không dấu nháy).
 */
const HOMOPHONE_GROUPS: readonly (readonly string[])[] = [
  ['to', 'two', 'too'],
  ['for', 'four', 'fore'],
  ['no', 'know'],
  ['be', 'bee'],
  ['right', 'write', 'rite'],
  ['there', 'their'],
  ['i', 'eye'],
  ['one', 'won'],
  ['by', 'buy', 'bye'],
  ['hour', 'our'],
  ['see', 'sea'],
  ['new', 'knew'],
  ['here', 'hear'],
  ['would', 'wood'],
  ['wait', 'weight'],
  ['week', 'weak'],
  ['son', 'sun'],
  ['meet', 'meat'],
  ['so', 'sew'],
  ['ate', 'eight'],
  ['through', 'threw'],
  ['which', 'witch'],
  ['where', 'wear'],
  ['whole', 'hole'],
  ['not', 'knot'],
  ['piece', 'peace'],
  ['sale', 'sail'],
  ['road', 'rode'],
  ['made', 'maid'],
  ['plane', 'plain'],
  ['mail', 'male'],
  ['flower', 'flour'],
]

const HOMOPHONES = new Map<string, ReadonlySet<string>>()
for (const group of HOMOPHONE_GROUPS) {
  const set = new Set(group)
  for (const w of group) HOMOPHONES.set(w, set)
}

function sameSound(expected: string, heard: string): boolean {
  return expected === heard || (HOMOPHONES.get(expected)?.has(heard) ?? false)
}

/**
 * Phương án nhận dạng nghe ra đúng từ (chứa đủ các từ chuẩn hoá của từ mẫu, liền nhau; từ đồng âm cũng tính),
 * phương án đầu tiên khớp; không phương án nào khớp → null.
 */
export function matchHeardWord(word: string, transcripts: readonly string[]): string | null {
  const target = normalizeWords(word)
  if (target.length === 0) return null
  for (const t of transcripts) {
    const heard = normalizeWords(t)
    for (let i = 0; i + target.length <= heard.length; i++) {
      if (target.every((x, k) => sameSound(x, heard[i + k]))) return t
    }
  }
  return null
}

/** Nghe ra đúng từ (xem `matchHeardWord`). */
export function heardWord(word: string, transcripts: readonly string[]): boolean {
  return matchHeardWord(word, transcripts) !== null
}

export type OwlPartScore = { score: number; total: number }
export type OwlScores = Record<OwlPart, OwlPartScore>

function partScore(answers: readonly AttemptAnswer[]): OwlPartScore {
  return { score: answers.filter((a) => a.correct).length, total: answers.length }
}

/** Chấm từng phần: phát âm theo câu `owl-ipa-*`, thì theo các câu còn lại. */
export function gradeOwl(answers: readonly AttemptAnswer[]): OwlScores {
  return {
    pronunciation: partScore(answers.filter((a) => isOwlWordQuestionId(a.questionId))),
    tenses: partScore(answers.filter((a) => !isOwlWordQuestionId(a.questionId))),
  }
}

/** Đạt ≥ 70% (so nguyên, không làm tròn có lợi: 20/30 = 66,7% là trượt). Phần không có câu nào là chưa đạt. */
export function partPassed(part: OwlPartScore): boolean {
  return part.total > 0 && part.score * 100 >= part.total * OWL_PASS_PERCENT
}

/** % làm tròn xuống để hiển thị (không bao giờ hiện 70% khi chưa đạt). */
export function partPercent(part: OwlPartScore): number {
  return part.total > 0 ? Math.floor((part.score * 100) / part.total) : 0
}

/** Qua cửa khi **từng phần** phát âm và thì đều ≥ 70%. */
export function owlPassed(scores: OwlScores): boolean {
  return OWL_PARTS.every((p) => partPassed(scores[p]))
}

/** Phần chưa đạt (để ôn). */
export function weakParts(scores: OwlScores): OwlPart[] {
  return OWL_PARTS.filter((p) => !partPassed(scores[p]))
}

export type EtsValidation = { ok: true; ets: EtsScores } | { ok: false; errors: Partial<Record<EtsPart, string>> }

/** Kiểm ô nhập phần ETS: bỏ trống = không ghi; có nhập thì phải là số nguyên trong [0, số câu của Part]. */
export function validateEts(raw: Partial<Record<EtsPart, string>>): EtsValidation {
  const errors: Partial<Record<EtsPart, string>> = {}
  const ets: EtsScores = {}
  for (const key of ETS_PARTS) {
    const max = PART_LIMITS[key]
    const text = (raw[key] ?? '').trim()
    if (text === '') continue
    if (!/^\d+$/.test(text)) errors[key] = `Chỉ nhập số nguyên từ 0 đến ${max}.`
    else if (Number(text) > max) errors[key] = `${PART_LABELS[key]} chỉ có ${max} câu, nhập từ 0 đến ${max}.`
    else ets[key] = Number(text)
  }
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, ets }
}

export type ReviewPlanDay = {
  /** `YYYY-MM-DD` (giờ máy). */
  date: string
  lessonId: string
  sectionId: string
  tag: MistakeTag
  /** Mục Sổ lỗi ôn hôm đó (có thể rỗng: ôn các mục đến hạn). */
  mistakeIds: string[]
}

export type ReviewPlan = {
  /** Ngày đầu (ngày làm bài thi). */
  startDate: string
  parts: OwlPart[]
  days: ReviewPlanDay[]
}

export type OwlDetails = {
  pronunciation: OwlPartScore
  tenses: OwlPartScore
  ets?: EtsScores
  /** Có câu phát âm tự chấm (không có nhận giọng nói / lỗi micro). */
  selfGraded?: boolean
  plan?: ReviewPlan
}

function isPartScore(v: unknown): v is OwlPartScore {
  return (
    isPlainObject(v) &&
    Number.isInteger(v.score) &&
    Number.isInteger(v.total) &&
    (v.score as number) >= 0 &&
    (v.score as number) <= (v.total as number)
  )
}

function isPlanDay(v: unknown): v is ReviewPlanDay {
  return (
    isPlainObject(v) &&
    typeof v.date === 'string' &&
    parseDayKey(v.date) !== null &&
    typeof v.lessonId === 'string' &&
    typeof v.sectionId === 'string' &&
    isMistakeTag(v.tag) &&
    Array.isArray(v.mistakeIds) &&
    v.mistakeIds.every((x) => typeof x === 'string')
  )
}

export function isReviewPlan(v: unknown): v is ReviewPlan {
  return (
    isPlainObject(v) &&
    typeof v.startDate === 'string' &&
    parseDayKey(v.startDate) !== null &&
    Array.isArray(v.parts) &&
    v.parts.every((p) => (OWL_PARTS as readonly unknown[]).includes(p)) &&
    Array.isArray(v.days) &&
    v.days.every(isPlanDay)
  )
}

/** Chi tiết O.W.L. của một lần làm (sai dạng → null; kế hoạch sai dạng thì bỏ riêng kế hoạch). */
export function readOwlDetails(attempt: { owl?: unknown }): OwlDetails | null {
  const owl = attempt.owl
  if (!isPlainObject(owl) || !isPartScore(owl.pronunciation) || !isPartScore(owl.tenses)) return null
  const ets: EtsScores = {}
  if (isPlainObject(owl.ets)) {
    for (const k of ETS_PARTS) {
      const v = owl.ets[k]
      if (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= PART_LIMITS[k]) ets[k] = v as number
    }
  }
  return {
    pronunciation: owl.pronunciation,
    tenses: owl.tenses,
    ...(Object.keys(ets).length > 0 ? { ets } : {}),
    ...(owl.selfGraded === true ? { selfGraded: true } : {}),
    ...(isReviewPlan(owl.plan) ? { plan: owl.plan } : {}),
  }
}

export type OwlAttempt = QuizAttemptEntry & { details: OwlDetails }

/** Lần thi O.W.L. 1 hợp lệ, mới nhất trước. */
export function listOwlAttempts(store: Store): OwlAttempt[] {
  return listAttempts(store, OWL_QUIZ_ID)
    .filter((a) => a.kind === 'owl')
    .flatMap((a) => {
      const details = readOwlDetails(a)
      return details ? [{ ...a, details }] : []
    })
}

type SectionKey = { lessonId: string; sectionId: string }
const keyOf = (s: SectionKey) => `${s.lessonId}\u0000${s.sectionId}`

function lessonOrder(): Map<string, number> {
  return new Map(allLessons().map((l, i) => [l.id, i]))
}

function sectionIndex(lessonId: string, sectionId: string): number {
  const i = getLesson(lessonId)?.sections.findIndex((s) => s.id === sectionId) ?? -1
  return i < 0 ? Number.MAX_SAFE_INTEGER : i
}

/** `fresh`: câu sai ngay trong lần thi này (ưu tiên trước). */
type PlanItem = SectionKey & { id: string; wrongCount: number; lastWrongAt: number; fresh: boolean }
type PlanSection = SectionKey & { fresh: boolean; top: number; weight: number; latest: number }

/** Mục sai trong lần thi này trước, rồi sai nhiều lần hơn, rồi sai gần hơn. */
function compareItems(a: PlanItem, b: PlanItem): number {
  return (
    Number(b.fresh) - Number(a.fresh) ||
    b.wrongCount - a.wrongCount ||
    b.lastWrongAt - a.lastWrongAt ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  )
}

/**
 * Gom mục theo đoạn bài: đoạn có câu sai trong lần thi này trước, rồi đoạn có mục sai nhiều lần nhất, rồi tổng số
 * lần sai (hoà: sai gần hơn, rồi bài/đoạn sớm hơn trên lộ trình).
 */
function groupSections(items: readonly PlanItem[]): PlanSection[] {
  const order = lessonOrder()
  const map = new Map<string, PlanSection>()
  for (const item of items) {
    const k = keyOf(item)
    const s = map.get(k) ?? { lessonId: item.lessonId, sectionId: item.sectionId, fresh: false, top: 0, weight: 0, latest: 0 }
    s.fresh ||= item.fresh
    s.top = Math.max(s.top, item.wrongCount)
    s.weight += item.wrongCount
    s.latest = Math.max(s.latest, item.lastWrongAt)
    map.set(k, s)
  }
  return [...map.values()].sort(
    (a, b) =>
      Number(b.fresh) - Number(a.fresh) ||
      b.top - a.top ||
      b.weight - a.weight ||
      b.latest - a.latest ||
      (order.get(a.lessonId) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.lessonId) ?? Number.MAX_SAFE_INTEGER) ||
      sectionIndex(a.lessonId, a.sectionId) - sectionIndex(b.lessonId, b.sectionId),
  )
}

/** Đoạn của một câu trong lần thi (câu thì tra ngân hàng; từ phát âm về đoạn IPA). */
function answerSection(questionId: string, lookup: (id: string) => Question | undefined): SectionKey | null {
  if (isOwlWordQuestionId(questionId)) return OWL_WORD_SECTION
  const q = lookup(questionId)
  return q ? { lessonId: q.lessonId, sectionId: q.sectionId } : null
}

/** Đoạn ôn rộng (Phát âm / Ngữ pháp có dạy kỹ năng đó) của các bài chặng 1. */
function defaultSections(part: OwlPart, lessons: readonly Lesson[]): SectionKey[] {
  const sectionId: SectionId = part === 'pronunciation' ? 'pronunciation' : 'grammar'
  const skill = part === 'pronunciation' ? 'pronunciation' : 'grammar'
  return lessons
    .filter((l) => l.stageId === OWL_STAGE_ID && l.sections.some((s) => s.id === sectionId && s.tags.includes(skill)))
    .map((l) => ({ lessonId: l.id, sectionId }))
}

/** Xen kẽ các danh sách: phần tử 1 của mỗi danh sách, rồi phần tử 2… */
function interleave<T>(lists: readonly (readonly T[])[]): T[] {
  const out: T[] = []
  const longest = Math.max(0, ...lists.map((l) => l.length))
  for (let i = 0; i < longest; i++) for (const l of lists) if (i < l.length) out.push(l[i])
  return out
}

/**
 * Kế hoạch ôn 2 tuần cho phần yếu (phần dưới 70%), 14 ngày từ ngày thi, mỗi ngày một đoạn bài (có link) + ôn Sổ lỗi.
 * - Mục sổ: mục cùng nhãn (`phát âm` / `thì`) thuộc chặng 1, chưa "đã thuộc"; câu sai trong lần thi này trước, rồi
 *   theo số lần sai. Mỗi ngày chỉ nhận mục của đúng phần của ngày đó, chia lần lượt vào các ngày của phần.
 * - Đoạn bài: các đoạn chứa mục sổ đó (đoạn có câu sai trong lần thi này trước). Sổ không có mục phù hợp thì dùng các
 *   đoạn có câu sai trong lần thi. Chưa đủ 14 đoạn thì thêm các đoạn Phát âm / Ngữ pháp khác của chặng 1 (ôn rộng),
 *   vẫn thiếu thì lặp vòng.
 * - Hai phần cùng yếu thì xen kẽ ngày của hai phần. Đạt cả hai phần, hoặc không có đoạn nào để bám → null.
 */
export function reviewPlan(
  store: Store,
  attempt: { answers: readonly AttemptAnswer[]; finishedAt: string },
  now: Date,
  lookup: (id: string) => Question | undefined = getQuestion,
  lessons: readonly Lesson[] = allLessons(),
): ReviewPlan | null {
  const scores = gradeOwl(attempt.answers)
  const parts = weakParts(scores)
  if (parts.length === 0) return null
  const wrongNow = new Set(attempt.answers.filter((a) => !a.correct).map((a) => a.questionId))
  const mistakes = listMistakes(readMistakes(store))
  const perPart = parts.map((part) => {
    const tag = OWL_PART_TAGS[part]
    const items: PlanItem[] = mistakes
      .filter((m) => m.tag === tag && isStageOneLesson(m.lessonId) && !isMastered(m))
      .map((m) => ({
        id: m.id,
        lessonId: m.lessonId,
        sectionId: m.sectionId,
        wrongCount: m.wrongCount,
        lastWrongAt: Date.parse(m.lastWrongAt),
        fresh: wrongNow.has(m.id),
      }))
      .sort(compareItems)
    let sources: PlanItem[] = items
    if (items.length === 0) {
      // Sổ trống: bám câu sai của phần này trong lần thi (không có mục sổ để ôn).
      const inPart = (id: string) => (part === 'pronunciation' ? isOwlWordQuestionId(id) : !isOwlWordQuestionId(id))
      sources = attempt.answers
        .filter((a) => !a.correct && inPart(a.questionId))
        .flatMap((a) => {
          const s = answerSection(a.questionId, lookup)
          return s ? [{ ...s, id: a.questionId, wrongCount: 1, lastWrongAt: 0, fresh: true }] : []
        })
    }
    const sections: SectionKey[] = groupSections(sources).map(({ lessonId, sectionId }) => ({ lessonId, sectionId }))
    const used = new Set(sections.map(keyOf))
    for (const s of defaultSections(part, lessons)) if (!used.has(keyOf(s))) sections.push(s)
    return { part, sections, ids: items.map((i) => i.id) }
  })

  // Ngày xen kẽ giữa các phần còn đoạn để ôn.
  const sequence = interleave(perPart.map((p) => p.sections.map((section) => ({ part: p.part, section }))))
  if (sequence.length === 0) return null
  const days = Array.from({ length: REVIEW_PLAN_DAYS }, (_, i) => sequence[i % sequence.length])
  const dayIds: string[][] = days.map(() => [])
  for (const p of perPart) {
    const mine = days.flatMap((d, i) => (d.part === p.part ? [i] : []))
    if (mine.length === 0) continue
    p.ids.forEach((id, k) => dayIds[mine[k % mine.length]].push(id))
  }

  const start = new Date(attempt.finishedAt)
  const startDay = Number.isNaN(start.getTime()) ? now : start
  return {
    startDate: localDayKey(startDay),
    parts,
    days: days.map((d, i) => ({
      date: localDayKey(addDays(startDay, i)),
      lessonId: d.section.lessonId,
      sectionId: d.section.sectionId,
      tag: OWL_PART_TAGS[d.part],
      mistakeIds: dayIds[i],
    })),
  }
}

export type OwlAttemptInput = {
  id: string
  seed: string
  startedAt: Date
  /** Câu phát âm (`owl-ipa-<id từ>`): `chosen` = chữ nghe được, hoặc nhãn tự chấm. */
  pronunciation: readonly AttemptAnswer[]
  /** Các từ của phần phát âm (chữ thật + IPA lưu vào mục Sổ lỗi của từ đọc chưa đúng). */
  words: readonly OwlWord[]
  tenses: readonly AttemptAnswer[]
  ets?: EtsScores
  selfGraded?: boolean
}

/**
 * Ghi một lần thi làm xong vào `quizzes.attempts` (`kind: 'owl'`, `checkpointId: 'owl-1'`, điểm từng phần,
 * `passed`). Câu thì sai vào Sổ lỗi như thường; từ đọc chưa đúng vào Sổ lỗi nhãn `phát âm` (kèm chữ và IPA để ôn bằng
 * tự chấm). Trượt thì kế hoạch ôn 2 tuần (tính trên Sổ lỗi đã gồm câu sai của lần này) được ghi cùng lần làm, một lần.
 * Không đổi tiến độ bài.
 */
export function recordOwlAttempt(
  store: Store,
  input: OwlAttemptInput,
  now: Date,
  lookup: (id: string) => Question | undefined = getQuestion,
): Store {
  const answers = [...input.pronunciation, ...input.tenses].map((a) => ({ ...a }))
  const scores = gradeOwl(answers)
  const passed = owlPassed(scores)
  const words = new Map(input.words.map((w) => [w.id, w]))

  let next = store
  for (const a of input.pronunciation) {
    if (a.correct) continue
    const w = words.get(a.questionId)
    next = recordMistake(
      next,
      {
        id: a.questionId,
        tag: 'phát âm',
        lessonId: OWL_WORD_SECTION.lessonId,
        sectionId: OWL_WORD_SECTION.sectionId,
        ...(w ? { word: { text: w.word, ipa: w.ipa } } : {}),
      },
      a.chosen,
      now,
    )
  }
  const owl: OwlDetails = {
    pronunciation: scores.pronunciation,
    tenses: scores.tenses,
    ...(input.ets && Object.keys(input.ets).length > 0 ? { ets: { ...input.ets } } : {}),
    ...(input.selfGraded ? { selfGraded: true } : {}),
  }
  const attempt = (details: OwlDetails) => ({
    id: input.id,
    quizId: OWL_QUIZ_ID,
    seed: input.seed,
    startedAt: input.startedAt,
    answers,
    kind: 'owl' as const,
    checkpointId: OWL_CHECKPOINT_ID,
    passed,
    owl: details,
  })
  if (!passed) {
    // Sổ lỗi tạm có cả câu thì sai của lần này để lập kế hoạch; rồi ghi lần làm đúng một lần, kèm kế hoạch.
    const withMistakes = recordAttempt(next, attempt(owl), now, lookup)
    const plan = reviewPlan(withMistakes, { answers, finishedAt: now.toISOString() }, now, lookup)
    if (plan) owl.plan = plan
  }
  return recordAttempt(next, attempt(owl), now, lookup)
}

export type ActivePlan = {
  attempt: OwlAttempt
  plan: ReviewPlan
  /** Ngày thứ mấy của kế hoạch (0–13). */
  dayIndex: number
  today: ReviewPlanDay
}

/**
 * Kế hoạch ôn đang chạy: lần thi gần nhất trượt và hôm nay còn trong 14 ngày của kế hoạch. Lần gần nhất đã qua
 * (hoặc hết 14 ngày) → null.
 */
export function activeReviewPlan(store: Store, now: Date): ActivePlan | null {
  const latest = listOwlAttempts(store)[0]
  if (!latest || latest.passed !== false || !latest.details.plan) return null
  const plan = latest.details.plan
  const start = parseDayKey(plan.startDate)
  if (!start) return null
  const dayIndex = daysBetween(start, now)
  if (dayIndex < 0 || dayIndex >= plan.days.length) return null
  return { attempt: latest, plan, dayIndex, today: plan.days[dayIndex] }
}
