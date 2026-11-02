import { getQuestion, MISTAKE_TAGS, type MistakeTag, type Question } from '@/data/questions'
import { isSrsCard, review, STARTING_EASE, type SrsCard } from '@/lib/srs'
import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Sổ lỗi sai của Snape (story 9, CAP-19): `store.data.mistakes.items[id câu]`.
 * Câu sai ở bất kỳ test nào tự vào sổ; ôn theo lịch SRS riêng (`review` của flashcard: đúng = Nhớ, sai = Quên).
 * Không bao giờ xoá: khoảng ôn ≥ `MASTERED_INTERVAL_DAYS` ngày thì hiện "đã thuộc" nhưng vẫn ở sổ.
 */

export const MASTERED_INTERVAL_DAYS = 21

export type MistakeExplanation = {
  /** Lời giải thích tiếng Việt từ Gemini. */
  text: string
  model: string
  /** Đáp án đã chọn lúc hỏi Gemini (khác `lastChosen` thì lời giải thích là cho lần chọn trước). */
  chosen: string
  updatedAt: string
}

export type MistakeItem = {
  tag: MistakeTag
  lessonId: string
  sectionId: string
  /** Số lần sai (ở test và khi ôn sổ). */
  wrongCount: number
  lastWrongAt: string
  /** Đáp án Huy chọn ở lần sai gần nhất. */
  lastChosen: string
  /** Lịch ôn sổ (cùng dạng thẻ flashcard). */
  card: SrsCard
  explanation: MistakeExplanation | null
  /** Lần sửa gần nhất; không bao giờ lùi. */
  updatedAt: string
}

export type MistakeEntry = MistakeItem & { id: string }

export function isMistakeTag(value: unknown): value is MistakeTag {
  return typeof value === 'string' && (MISTAKE_TAGS as readonly string[]).includes(value)
}

export function isMistakeExplanation(value: unknown): value is MistakeExplanation {
  return (
    isPlainObject(value) &&
    typeof value.text === 'string' &&
    typeof value.model === 'string' &&
    typeof value.chosen === 'string' &&
    isTimeString(value.updatedAt)
  )
}

export function isMistakeItem(value: unknown): value is MistakeItem {
  if (!isPlainObject(value)) return false
  const { tag, lessonId, sectionId, wrongCount, lastWrongAt, lastChosen, card, explanation, updatedAt } = value
  return (
    isMistakeTag(tag) &&
    typeof lessonId === 'string' &&
    typeof sectionId === 'string' &&
    Number.isInteger(wrongCount) &&
    (wrongCount as number) >= 1 &&
    isTimeString(lastWrongAt) &&
    typeof lastChosen === 'string' &&
    isSrsCard(card) &&
    (explanation === null || isMistakeExplanation(explanation)) &&
    isTimeString(updatedAt)
  )
}

export function readMistakes(store: Store): Record<string, unknown> {
  const mistakes = store.data.mistakes
  return isPlainObject(mistakes) && isPlainObject(mistakes.items) ? mistakes.items : {}
}

function writeMistake(store: Store, id: string, item: MistakeItem): Store {
  const mistakes = isPlainObject(store.data.mistakes) ? store.data.mistakes : {}
  return { ...store, data: { ...store.data, mistakes: { ...mistakes, items: { ...readMistakes(store), [id]: item } } } }
}

/** Thẻ ôn của câu vừa vào sổ: đến hạn ngay. */
function freshCard(now: Date, previous: unknown): SrsCard {
  return {
    due: now.toISOString(),
    interval: 0,
    ease: STARTING_EASE,
    reps: 0,
    lapses: 0,
    learning: true,
    introducedAt: now.toISOString(),
    known: false,
    updatedAt: nextUpdatedAt(isPlainObject(previous) ? previous.updatedAt : undefined, now),
  }
}

/**
 * Câu sai ở một test: chưa có trong sổ → `wrongCount 1`, đến hạn ôn ngay; đã có → `wrongCount + 1`, lịch rút lại
 * (chấm "Quên"). Lời giải thích đã lưu giữ nguyên.
 */
export function recordMistake(store: Store, question: Question, chosen: string, now: Date): Store {
  const previous = readMistakes(store)[question.id]
  const old = isMistakeItem(previous) ? previous : null
  const item: MistakeItem = {
    tag: question.tag,
    lessonId: question.lessonId,
    sectionId: question.sectionId,
    wrongCount: (old?.wrongCount ?? 0) + 1,
    lastWrongAt: now.toISOString(),
    lastChosen: chosen,
    card: old ? review(old.card, 'again', now) : freshCard(now, undefined),
    explanation: old?.explanation ?? null,
    updatedAt: nextUpdatedAt(isPlainObject(previous) ? previous.updatedAt : undefined, now),
  }
  return writeMistake(store, question.id, item)
}

/**
 * Ôn một câu trong sổ: đúng = Nhớ (lịch giãn), sai = Quên (lịch rút lại, `wrongCount + 1`).
 * Câu không có trong sổ (hoặc sai dạng) thì trả về đúng store cũ.
 */
export function reviewMistake(store: Store, id: string, correct: boolean, chosen: string, now: Date): Store {
  const item = readMistakes(store)[id]
  if (!isMistakeItem(item)) return store
  const next: MistakeItem = {
    ...item,
    card: review(item.card, correct ? 'good' : 'again', now),
    updatedAt: nextUpdatedAt(item.updatedAt, now),
  }
  if (!correct) {
    next.wrongCount = item.wrongCount + 1
    next.lastWrongAt = now.toISOString()
    next.lastChosen = chosen
  }
  return writeMistake(store, id, next)
}

/**
 * Lưu lời giải thích "Vì sao sai?" vào mục sổ (xem lại không cần gọi Gemini lần nữa).
 * `chosen` = đáp án đã gửi cho Gemini (thường là `lastChosen` lúc bấm).
 */
export function setMistakeExplanation(
  store: Store,
  id: string,
  text: string,
  model: string,
  chosen: string,
  now: Date,
): Store {
  const item = readMistakes(store)[id]
  if (!isMistakeItem(item)) return store
  const explanation: MistakeExplanation = {
    text,
    model,
    chosen,
    updatedAt: nextUpdatedAt(item.explanation?.updatedAt, now),
  }
  return writeMistake(store, id, { ...item, explanation, updatedAt: nextUpdatedAt(item.updatedAt, now) })
}

/** Lời giải thích đã lưu là cho một lần chọn trước (Huy đã sai lại bằng đáp án khác). */
export function isExplanationStale(item: MistakeItem): boolean {
  return item.explanation !== null && item.explanation.chosen !== item.lastChosen
}

/** Khoảng ôn đã ≥ 21 ngày: "đã thuộc" (vẫn ở sổ, vẫn ôn theo lịch). */
export function isMastered(item: MistakeItem): boolean {
  return !item.card.learning && item.card.interval >= MASTERED_INTERVAL_DAYS
}

/** Mục hợp lệ trong sổ, lần sai gần nhất trước. */
export function listMistakes(items: Record<string, unknown>): MistakeEntry[] {
  return Object.entries(items)
    .filter((e): e is [string, MistakeItem] => isMistakeItem(e[1]))
    .map(([id, item]) => ({ ...item, id }))
    .sort((a, b) => Date.parse(b.lastWrongAt) - Date.parse(a.lastWrongAt) || (a.id < b.id ? -1 : 1))
}

/** Mục đến hạn ôn (hạn ≤ `now`), hạn sớm trước. */
export function dueMistakes(items: Record<string, unknown>, now: Date): MistakeEntry[] {
  const t = now.getTime()
  return listMistakes(items)
    .filter((m) => Date.parse(m.card.due) <= t)
    .sort((a, b) => Date.parse(a.card.due) - Date.parse(b.card.due) || (a.id < b.id ? -1 : 1))
}

/**
 * Câu đến hạn ôn được trên máy này (dùng chung cho Luyện tập và trang Sổ lỗi): bỏ câu không còn trong ngân hàng
 * câu, và bỏ câu nghe khi không có TTS (`skippedListening` đếm số câu nghe đến hạn bị bỏ).
 */
export function reviewableDue(
  items: Record<string, unknown>,
  now: Date,
  opts: { canSpeak: boolean },
  lookup: (id: string) => Question | undefined = getQuestion,
): { due: MistakeEntry[]; skippedListening: number } {
  const due: MistakeEntry[] = []
  let skippedListening = 0
  for (const m of dueMistakes(items, now)) {
    const q = lookup(m.id)
    if (!q) continue
    if (q.kind === 'listening' && !opts.canSpeak) skippedListening++
    else due.push(m)
  }
  return { due, skippedListening }
}

/** Lọc theo nhãn lỗi; `null` = tất cả. */
export function filterMistakes<T extends { tag: MistakeTag }>(list: readonly T[], tag: MistakeTag | null): T[] {
  return tag === null ? [...list] : list.filter((m) => m.tag === tag)
}

function later(a: string, b: string): string {
  return Date.parse(b) > Date.parse(a) ? b : a
}

/**
 * Gộp một mục giữa hai máy: `wrongCount` lấy max; lịch SRS theo `card.updatedAt` mới hơn; lời giải thích theo
 * `updatedAt` mới hơn (bên có thắng bên null); lần sai gần nhất lấy mới hơn. Bằng nhau giữ local (`a`).
 */
export function mergeMistakeItem(a: MistakeItem, b: MistakeItem): MistakeItem {
  const lastWrongAt = later(a.lastWrongAt, b.lastWrongAt)
  const wrongSide = lastWrongAt === a.lastWrongAt ? a : b
  const card = Date.parse(b.card.updatedAt) > Date.parse(a.card.updatedAt) ? b.card : a.card
  let explanation = a.explanation ?? b.explanation
  if (a.explanation && b.explanation && Date.parse(b.explanation.updatedAt) > Date.parse(a.explanation.updatedAt)) {
    explanation = b.explanation
  }
  const base = Date.parse(b.updatedAt) > Date.parse(a.updatedAt) ? b : a
  return {
    ...base,
    wrongCount: Math.max(a.wrongCount, b.wrongCount),
    lastWrongAt,
    lastChosen: wrongSide.lastChosen,
    card,
    explanation,
    updatedAt: later(a.updatedAt, b.updatedAt),
  }
}
