import { compareStudyOrder, hasDetails, type StudyWord, type Word, type WordList } from '@/data/vocab'
import { isPlainObject } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * SRS kiểu SM-2 tự viết (giống Anki, 4 nút). Hàm thuần: thời gian luôn lấy từ tham số `now`.
 * "Ngày" là ngày theo giờ máy (local).
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy'

export const GRADES: readonly Grade[] = ['again', 'hard', 'good', 'easy']

export type SrsCard = {
  /** Lúc thẻ đến hạn (ISO). Thẻ ôn đến hạn từ 0h ngày đó; thẻ đang học lại đến hạn sau vài phút. */
  due: string
  /** Khoảng ôn hiện tại (ngày). 0 khi từ mới chưa qua lần nhớ đầu. */
  interval: number
  /** Hệ số giãn lịch (≥ MIN_EASE). */
  ease: number
  /** Số lần nhớ (Khó/Nhớ/Dễ khi thẻ đã ra khỏi bước học). */
  reps: number
  /** Số lần bấm "Quên". */
  lapses: number
  /** Đang học / học lại trong ngày: quay lại trong phiên hôm nay. */
  learning: boolean
  /** Lúc từ được giới thiệu lần đầu (tính quota từ mới/ngày). */
  introducedAt: string
  /** Bấm "Đã biết" khi gặp lần đầu: không tính vào quota từ mới. */
  known: boolean
  /** Lần sửa gần nhất; không bao giờ lùi. Dùng để gộp khi đồng bộ. */
  updatedAt: string
  /** Thẻ do Huy tự thêm từ Sổ tay (story 8): không tính vào quota từ mới/ngày. */
  added?: boolean
}

/** Thẻ riêng của một cụm/từ ngoài danh sách đã lưu trong Sổ tay (story 8). Id thẻ: `saved-<id mục lưu>`. */
export type CustomStudyWord = {
  id: string
  custom: true
  /** Cụm/từ đã chuẩn hoá. */
  word: string
  /** Nghĩa tiếng Việt do Huy nhập. */
  meaningVi: string
  /** Câu gốc chứa cụm. */
  sentence: string
  source: { title: string; url: string }
}

/** Từ trong phiên ôn: từ NGSL/TSL có dữ liệu AI hoặc thẻ riêng từ Sổ tay. */
export type SessionWord = StudyWord | CustomStudyWord

export function isCustomWord(word: SessionWord): word is CustomStudyWord {
  return 'custom' in word && word.custom === true
}

/** `store.data.srs` từ schema v4. Thẻ sai dạng vẫn nằm trong `cards` (không xoá), chỉ bị bỏ qua. */
export type Srs = { cards: Record<string, unknown> }

export const NEW_PER_DAY = 10
export const KNOWN_INTERVAL_DAYS = 60
export const STARTING_EASE = 2.5
export const MIN_EASE = 1.3
/** Bấm Quên: thẻ quay lại sau bấy nhiêu phút (trong phiên hôm nay). */
export const AGAIN_DELAY_MIN = 1
/** Bấm Khó khi đang học: quay lại sau bấy nhiêu phút. */
export const HARD_LEARNING_DELAY_MIN = 10
/** Bấm Quên trên thẻ ôn: khoảng mới = khoảng cũ × hệ số này (tối thiểu 1 ngày), không về 0. */
export const LAPSE_FACTOR = 0.5
export const EASY_FIRST_INTERVAL = 4

const MINUTE = 60_000

export function isSrsCard(value: unknown): value is SrsCard {
  if (!isPlainObject(value)) return false
  const { due, interval, ease, reps, lapses, learning, introducedAt, known, updatedAt } = value
  return (
    isTimeString(due) &&
    isTimeString(introducedAt) &&
    isTimeString(updatedAt) &&
    typeof interval === 'number' &&
    Number.isFinite(interval) &&
    interval >= 0 &&
    typeof ease === 'number' &&
    Number.isFinite(ease) &&
    ease > 0 &&
    Number.isInteger(reps) &&
    (reps as number) >= 0 &&
    Number.isInteger(lapses) &&
    (lapses as number) >= 0 &&
    typeof learning === 'boolean' &&
    typeof known === 'boolean' &&
    (value.added === undefined || typeof value.added === 'boolean')
  )
}

/** 0h (giờ máy) của ngày chứa `date`, cộng thêm `days` ngày (đúng cả khi đổi giờ mùa hè). */
export function startOfLocalDay(date: Date, days = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return startOfLocalDay(a).getTime() === startOfLocalDay(b).getTime()
}

function addMinutes(now: Date, minutes: number): string {
  return new Date(now.getTime() + minutes * MINUTE).toISOString()
}

function dueInDays(now: Date, days: number): string {
  return startOfLocalDay(now, days).toISOString()
}

function newCard(now: Date, previous: unknown): SrsCard {
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
 * Thẻ Huy tự thêm từ Sổ tay: như từ mới (vào phiên ngay), đánh dấu `added` để không tính quota từ mới/ngày.
 */
export function addedCard(now: Date, previous?: unknown): SrsCard {
  return { ...newCard(now, previous), added: true }
}

/**
 * Chấm một thẻ. `card` không hợp lệ (chưa có / sai dạng) → coi như từ mới gặp lần đầu.
 * - Đang học (từ mới hoặc vừa Quên): Quên/Khó quay lại sau vài phút; Nhớ/Dễ ra khỏi bước học.
 * - Thẻ ôn: Khó/Nhớ/Dễ luôn giãn lịch (khoảng sau > khoảng trước); Quên rút ngắn khoảng
 *   (× LAPSE_FACTOR, tối thiểu 1 ngày), `lapses + 1`, thẻ quay lại trong phiên hôm nay.
 */
export function review(card: unknown, grade: Grade, now: Date): SrsCard {
  const base = isSrsCard(card) ? card : newCard(now, card)
  const updatedAt = nextUpdatedAt(isPlainObject(card) ? card.updatedAt : undefined, now)
  const next: SrsCard = { ...base, updatedAt }

  if (grade === 'again') {
    next.lapses = base.lapses + 1
    next.learning = true
    next.due = addMinutes(now, AGAIN_DELAY_MIN)
    if (!base.learning) {
      next.ease = Math.max(MIN_EASE, base.ease - 0.2)
      next.interval = Math.max(1, Math.round(base.interval * LAPSE_FACTOR))
    }
    return next
  }

  if (base.learning) {
    if (grade === 'hard') {
      next.due = addMinutes(now, HARD_LEARNING_DELAY_MIN)
      return next
    }
    // Ra khỏi bước học. Thẻ học lại giữ khoảng đã rút ngắn lúc Quên.
    next.learning = false
    next.reps = base.reps + 1
    if (grade === 'good') {
      next.interval = Math.max(1, base.interval)
    } else {
      next.interval = Math.max(EASY_FIRST_INTERVAL, Math.round(base.interval * 1.5))
      next.ease = base.ease + 0.15
    }
    next.due = dueInDays(now, next.interval)
    return next
  }

  next.reps = base.reps + 1
  const prev = base.interval
  if (grade === 'hard') {
    next.ease = Math.max(MIN_EASE, base.ease - 0.15)
    next.interval = Math.max(prev + 1, Math.round(prev * 1.2))
  } else if (grade === 'good') {
    next.interval = Math.max(prev + 1, Math.round(prev * base.ease))
  } else {
    next.ease = base.ease + 0.15
    next.interval = Math.max(prev + 2, Math.round(prev * base.ease * 1.3))
  }
  next.due = dueInDays(now, next.interval)
  return next
}

/** "Đã biết" trên từ mới: xếp lịch xa (KNOWN_INTERVAL_DAYS ngày), không tính vào quota, không xoá. */
export function markKnown(card: unknown, now: Date): SrsCard {
  const base = isSrsCard(card) ? card : newCard(now, card)
  return {
    ...base,
    learning: false,
    known: true,
    interval: Math.max(KNOWN_INTERVAL_DAYS, base.interval),
    due: dueInDays(now, Math.max(KNOWN_INTERVAL_DAYS, base.interval)),
    updatedAt: nextUpdatedAt(isPlainObject(card) ? card.updatedAt : undefined, now),
  }
}

export type SessionItem = {
  word: SessionWord
  /** `review`: thẻ đến hạn; `new`: từ mới hôm nay; `learning`: thẻ đang học, quay lại sau ít phút. */
  kind: 'review' | 'new' | 'learning'
}

export type Session = {
  /** Thứ tự hiện: thẻ đến hạn (sớm trước) → từ mới → thẻ đang học chưa tới giờ. */
  queue: SessionItem[]
  /** Số thẻ ôn đến hạn (gồm thẻ đang học trong ngày). */
  dueCount: number
  /** Số từ mới còn lại hôm nay. */
  newCount: number
  /** Số từ mới đã giới thiệu hôm nay (không tính "Đã biết" và thẻ Huy tự thêm từ Sổ tay). */
  introducedToday: number
  /** Thẻ kế tiếp đến hạn khi đã hết việc hôm nay; null nếu không có thẻ nào. */
  nextDue: Date | null
}

/** Đọc `srs.cards`; thiếu hoặc sai dạng thì coi như rỗng (không sửa store). */
export function readCards(srs: unknown): Record<string, unknown> {
  return isPlainObject(srs) && isPlainObject(srs.cards) ? srs.cards : {}
}

/** Thẻ `added` chưa chấm lần nào (vẫn y như lúc `addedCard` tạo: hạn = lúc giới thiệu, chưa nhớ/quên lần nào). */
function isUnreviewedAdded(card: SrsCard): boolean {
  return card.added === true && card.learning && !card.known && card.reps === 0 && card.lapses === 0 && card.due === card.introducedAt
}

/** Thứ tự ổn định: từ trong danh sách theo `compareStudyOrder`, thẻ riêng xếp sau theo id. */
function compareSessionWords(a: SessionWord, b: SessionWord, firstList: WordList = 'ngsl'): number {
  const ca = isCustomWord(a)
  const cb = isCustomWord(b)
  if (!ca && !cb) return compareStudyOrder(a, b, firstList)
  if (ca !== cb) return ca ? 1 : -1
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/**
 * Dựng phiên ôn: chỉ từ có dữ liệu AI; thẻ chưa đến hạn không hiện; tối đa `newPerDay` từ mới mỗi ngày
 * (giờ máy), lấy theo hạng: hết danh sách `firstList` rồi tới danh sách còn lại (mặc định NGSL → TSL;
 * chặng 2 trở đi truyền `'tsl'`, xem `newWordListFor`). Thẻ đã có lịch không đổi.
 * Thẻ sai dạng bị bỏ qua, từ của nó không bị coi là từ mới.
 * `custom`: thẻ riêng từ Sổ tay (`customStudyWords`), cùng lịch/thuật toán; chưa có thẻ thì vào như từ mới
 * nhưng không tính quota. Thẻ có `added` (Huy tự thêm) không tính vào quota từ mới.
 */
export function buildSession(
  srs: unknown,
  words: readonly Word[],
  now: Date,
  newPerDay: number = NEW_PER_DAY,
  firstList: WordList = 'ngsl',
  custom: readonly CustomStudyWord[] = [],
): Session {
  const cards = readCards(srs)
  const study = words.filter(hasDetails)
  const scheduled: SessionWord[] = [...study, ...custom]
  const tomorrow = startOfLocalDay(now, 1).getTime()
  const t = now.getTime()

  const due: { word: SessionWord; at: number }[] = []
  const addedNew: { word: SessionWord; at: number }[] = []
  const later: { word: SessionWord; at: number }[] = []
  let introducedToday = 0
  let nextDue: number | null = null

  for (const word of scheduled) {
    const card = cards[word.id]
    if (!isSrsCard(card)) continue
    if (!card.known && !card.added && !isCustomWord(word) && isSameLocalDay(new Date(card.introducedAt), now)) introducedToday++
    const at = Date.parse(card.due)
    // Thẻ Huy vừa thêm từ Sổ tay, chưa chấm lần nào: hiện như từ mới (có "Đã biết"), vẫn không tính quota.
    if (at <= t && isUnreviewedAdded(card)) addedNew.push({ word, at })
    else if (at <= t) due.push({ word, at })
    else if (card.learning && at < tomorrow) later.push({ word, at })
    else if (nextDue === null || at < nextDue) nextDue = at
  }

  const byTime = (a: { word: SessionWord; at: number }, b: { word: SessionWord; at: number }) =>
    a.at - b.at || compareSessionWords(a.word, b.word)
  due.sort(byTime)
  addedNew.sort(byTime)
  later.sort(byTime)

  const newLimit = Math.max(0, newPerDay - introducedToday)
  const fresh = study
    .filter((w) => !Object.hasOwn(cards, w.id))
    .sort((a, b) => compareStudyOrder(a, b, firstList))
    .slice(0, newLimit)
  // Thẻ riêng chưa có lịch (vd đồng bộ mới về mục lưu): vào như từ mới, không trừ quota.
  const freshCustom = custom.filter((w) => !Object.hasOwn(cards, w.id))

  const queue: SessionItem[] = [
    ...due.map(({ word }) => ({ word, kind: 'review' as const })),
    ...fresh.map((word) => ({ word, kind: 'new' as const })),
    ...addedNew.map(({ word }) => ({ word, kind: 'new' as const })),
    ...freshCustom.map((word) => ({ word, kind: 'new' as const })),
    ...later.map(({ word }) => ({ word, kind: 'learning' as const })),
  ]

  return {
    queue,
    dueCount: due.length + later.length,
    newCount: fresh.length + addedNew.length + freshCustom.length,
    introducedToday,
    nextDue: queue.length === 0 && nextDue !== null ? new Date(nextDue) : null,
  }
}

/** Nhãn khoảng tới lúc đến hạn (cho nút chấm): "1 phút", "10 phút", "1 ngày", "2 tháng". */
export function formatDelay(due: string, now: Date): string {
  const ms = Date.parse(due) - now.getTime()
  const days = Math.round((startOfLocalDay(new Date(due)).getTime() - startOfLocalDay(now).getTime()) / 86_400_000)
  // Đến hạn trong hôm nay: phút / giờ. Sang ngày khác (kể cả 0h mai lúc đang 23:30): theo ngày.
  if (days < 1) {
    if (ms < 60 * MINUTE) return `${Math.max(1, Math.round(ms / MINUTE))} phút`
    return `${Math.round(ms / (60 * MINUTE))} giờ`
  }
  if (days < 30) return `${days} ngày`
  if (days < 365) return `${Math.round(days / 30)} tháng`
  return `${Math.round((days / 365) * 10) / 10} năm`
}
