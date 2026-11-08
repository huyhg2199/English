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

/** Tiền tố id thẻ SRS của thẻ quy tắc viên gạch (story 24): `rule:fNN-n`. */
export const RULE_CARD_PREFIX = 'rule:'

/**
 * Thẻ quy tắc của viên gạch (story 24): thẻ điền chỗ trống, id `rule:fNN-n` (từ id nội dung `fNN-rule-n`). Cùng shape
 * `SrsCard` và thuật toán như thẻ từ; không tính quota từ mới, không phải thẻ Làm quen, không có "Đã biết".
 */
export type RuleStudyWord = {
  id: string
  rule: true
  /** = `answer` (để các chỗ dùng chung `word.word` vẫn có chữ). */
  word: string
  /** Viên gạch chứa thẻ (`F01`…). */
  brickId: string
  /** Câu có đúng một chỗ trống `___`. */
  cloze: string
  answer: string
  /** Nghĩa / quy tắc tiếng Việt. */
  vi: string
}

/** Từ trong phiên ôn: từ NGSL/TSL có dữ liệu AI, thẻ quy tắc viên gạch hoặc thẻ riêng từ Sổ tay. */
export type SessionWord = StudyWord | CustomStudyWord | RuleStudyWord

export function isCustomWord(word: SessionWord): word is CustomStudyWord {
  return 'custom' in word && word.custom === true
}

export function isRuleWord(word: SessionWord): word is RuleStudyWord {
  return 'rule' in word && word.rule === true
}

/** Id thẻ SRS là thẻ quy tắc (`rule:…`). */
export function isRuleCardId(id: string): boolean {
  return id.startsWith(RULE_CARD_PREFIX)
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
  /**
   * Thẻ "Làm quen" (CAP-9): từ NGSL/TSL chưa có thẻ, gặp lần đầu khi bật `introMode`. Hiện nghĩa ngay, chỉ có
   * "Đã xem" (= `review(card, 'good')`) và "Đã biết"; không có Quên/Khó/Nhớ/Dễ.
   */
  intro?: true
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

/** Nhóm trong thứ tự ổn định: từ danh sách → thẻ quy tắc → thẻ riêng. */
function sessionWordGroup(word: SessionWord): number {
  return isRuleWord(word) ? 1 : isCustomWord(word) ? 2 : 0
}

/** Thứ tự ổn định: từ trong danh sách theo `compareStudyOrder`, rồi thẻ quy tắc, rồi thẻ riêng (hai nhóm sau theo id). */
function compareSessionWords(a: SessionWord, b: SessionWord, firstList: WordList = 'ngsl'): number {
  const ga = sessionWordGroup(a)
  const gb = sessionWordGroup(b)
  if (ga !== gb) return ga - gb
  if (ga === 0) return compareStudyOrder(a as StudyWord, b as StudyWord, firstList)
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/** Tuỳ chọn của `buildSession`; thiếu field nào thì dùng mặc định (giữ hành vi cũ). */
export type BuildSessionOptions = {
  /** Tối đa bấy nhiêu từ mới mỗi ngày (giờ máy), đã trừ số từ giới thiệu hôm nay. Mặc định `NEW_PER_DAY`. */
  newPerDay?: number
  /** Danh sách lấy từ mới trước khi hết `preferIds`. Mặc định `'ngsl'`. */
  firstList?: WordList
  /** Thẻ riêng từ Sổ tay (`customStudyWords`). Mặc định `[]`. */
  custom?: readonly CustomStudyWord[]
  /**
   * Id từ mới lấy trước, đúng thứ tự này (từ chủ đề viên gạch, danh sách từ khởi đầu). Id trùng, id đã có thẻ,
   * id không có trong bộ từ hay chưa có dữ liệu AI bị bỏ qua. Mặc định `[]`.
   */
  preferIds?: readonly string[]
  /** Gắn `intro: true` cho từ NGSL/TSL chưa có thẻ (thẻ "Làm quen"). Mặc định `false`. */
  introMode?: boolean
  /**
   * Id từ chưa được giới thiệu làm từ mới (cổng hư từ, story 24): không vào phần từ mới kể cả khi nằm trong `preferIds`,
   * không tạo thẻ, không tính quota. Thẻ đã có của các id này vẫn ôn theo lịch. Mặc định rỗng.
   */
  lockedIds?: ReadonlySet<string>
  /**
   * Thẻ quy tắc viên gạch (story 24). Có thẻ thì đi theo `due` như mọi thẻ; chưa có thì vào như từ mới sau phần từ mới,
   * không tính quota, không phải Làm quen. Thẻ `rule:` trong store mà không có ở đây bị bỏ qua. Mặc định `[]`.
   */
  rules?: readonly RuleStudyWord[]
}

/**
 * Dựng phiên ôn: chỉ từ có dữ liệu AI; thẻ chưa đến hạn không hiện; tối đa `newPerDay` từ mới mỗi ngày
 * (giờ máy), lấy theo `preferIds` trước rồi theo hạng: hết danh sách `firstList` rồi tới danh sách còn lại
 * (mặc định NGSL → TSL; chặng 2 trở đi truyền `'tsl'`, xem `newWordListFor`). Thẻ đã có lịch không đổi.
 * Thẻ sai dạng bị bỏ qua, từ của nó không bị coi là từ mới.
 * `custom`: thẻ riêng từ Sổ tay (`customStudyWords`), cùng lịch/thuật toán; chưa có thẻ thì vào như từ mới
 * nhưng không tính quota. Thẻ có `added` (Huy tự thêm) không tính vào quota từ mới.
 * `introMode`: từ NGSL/TSL chưa có thẻ thành thẻ "Làm quen" (`intro: true`); thẻ riêng và thẻ `added` thì không.
 * `lockedIds`: từ chưa được giới thiệu (cổng hư từ); thẻ đã có vẫn ôn. `rules`: thẻ quy tắc viên gạch, lịch như thẻ riêng.
 */
export function buildSession(srs: unknown, words: readonly Word[], now: Date, options: BuildSessionOptions = {}): Session {
  const newPerDay = options.newPerDay ?? NEW_PER_DAY
  const firstList = options.firstList ?? 'ngsl'
  const custom = options.custom ?? []
  const preferIds = options.preferIds ?? []
  const introMode = options.introMode ?? false
  const lockedIds = options.lockedIds
  const cards = readCards(srs)
  const study = words.filter(hasDetails)
  // Thẻ quy tắc trùng id: lấy mục đầu tiên.
  const ruleIds = new Set<string>()
  const rules = (options.rules ?? []).filter((r) => !ruleIds.has(r.id) && ruleIds.add(r.id))
  const scheduled: SessionWord[] = [...study, ...rules, ...custom]
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
    if (
      !card.known &&
      !card.added &&
      !isCustomWord(word) &&
      !isRuleWord(word) &&
      isSameLocalDay(new Date(card.introducedAt), now)
    )
      introducedToday++
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
  // Từ bị khoá (cổng hư từ) không được giới thiệu; mở khoá thì về đúng hạng vì phần còn lại vẫn sort theo hạng.
  const unseen = study.filter((w) => !Object.hasOwn(cards, w.id) && !lockedIds?.has(w.id))
  // `preferIds` trước (đúng thứ tự, bỏ id trùng / đã có thẻ / không có trong bộ từ), phần còn lại theo hạng.
  const unseenById = new Map(unseen.map((w) => [w.id, w]))
  const preferred: StudyWord[] = []
  const taken = new Set<string>()
  for (const id of preferIds) {
    const w = unseenById.get(id)
    if (w === undefined || taken.has(id)) continue
    taken.add(id)
    preferred.push(w)
  }
  const fresh = [
    ...preferred,
    ...unseen.filter((w) => !taken.has(w.id)).sort((a, b) => compareStudyOrder(a, b, firstList)),
  ].slice(0, newLimit)
  // Thẻ quy tắc chưa có lịch (viên vừa học xong): vào như từ mới sau phần từ mới, không trừ quota, không Làm quen.
  const freshRules = rules.filter((w) => !Object.hasOwn(cards, w.id))
  // Thẻ riêng chưa có lịch (vd đồng bộ mới về mục lưu): vào như từ mới, không trừ quota.
  const freshCustom = custom.filter((w) => !Object.hasOwn(cards, w.id))

  const queue: SessionItem[] = [
    ...due.map(({ word }) => ({ word, kind: 'review' as const })),
    ...fresh.map((word) => (introMode ? { word, kind: 'new' as const, intro: true as const } : { word, kind: 'new' as const })),
    ...freshRules.map((word) => ({ word, kind: 'new' as const })),
    ...addedNew.map(({ word }) => ({ word, kind: 'new' as const })),
    ...freshCustom.map((word) => ({ word, kind: 'new' as const })),
    ...later.map(({ word }) => ({ word, kind: 'learning' as const })),
  ]

  return {
    queue,
    dueCount: due.length + later.length,
    newCount: fresh.length + freshRules.length + addedNew.length + freshCustom.length,
    introducedToday,
    nextDue: queue.length === 0 && nextDue !== null ? new Date(nextDue) : null,
  }
}

/**
 * Số thẻ đến hạn ôn lúc `now`: thẻ hợp lệ trong `srs.cards` có `due ≤ now`. Bỏ thẻ sai dạng và thẻ `added` chưa chấm
 * (phiên hiện chúng như từ mới). `counted` (tuỳ chọn) lọc thêm theo id, vd bỏ thẻ riêng không còn mục lưu (phiên không
 * bao giờ hiện, nên không ôn bớt được).
 */
export function dueCardCount(srs: unknown, now: Date, counted?: (cardId: string) => boolean): number {
  const t = now.getTime()
  let count = 0
  for (const [id, card] of Object.entries(readCards(srs))) {
    if (!isSrsCard(card) || isUnreviewedAdded(card) || Date.parse(card.due) > t) continue
    if (counted === undefined || counted(id)) count++
  }
  return count
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
