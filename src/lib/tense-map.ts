import { IRREGULAR_VERB_CARDS, IRREGULAR_VERBS_LESSON_ID, tenseEntries } from '@/data/lessons'
import { lessonQuizId, MISTAKES_HREF, quizHref } from '@/data/questions'
import { allLessons, getLessonEntry, sectionHref } from '@/data/roadmap'
import { ruleCardId } from '@/lib/flashcard-session'
import { isInFoundation } from '@/lib/foundation'
import { readStartLessonId } from '@/lib/placement/store'
import { bestLessonCheck, isMastered, isMistakeItem, readMistakes, type LessonCheckResult } from '@/lib/quiz'
import { computeRoadmapProgress, readCompletedLessonIds } from '@/lib/roadmap-progress'
import { lessonSessionHref } from '@/lib/sessions'
import { isSrsCard, readCards } from '@/lib/srs'
import type { Store } from '@/lib/storage'

/**
 * Bản đồ thì (story 42, CAP-7 / CAP-11 / CAP-19): mức nắm chắc của từng thì Năm 1, mỗi thì một dòng. Module thuần: `store`,
 * `now` qua tham số, chỉ đọc (tiến độ, kiểm tra bài, `srs.cards`, Sổ lỗi), không ghi gì. Dữ liệu thiếu hay sai dạng coi
 * như rỗng. Trạng thái chỉ để xem: không khoá, không ẩn thì nào.
 */

/** Thẻ "đã nhớ": không còn học lại trong ngày và khoảng ôn từ 7 ngày. */
export const TENSE_CARD_REMEMBERED_DAYS = 7

/** Nhãn Sổ lỗi tính cho bản đồ thì. */
const TENSE_MISTAKE_TAG = 'thì'

export type TenseStatus = 'new' | 'learning' | 'solid'

export const TENSE_STATUS_LABELS: Record<TenseStatus, string> = {
  new: 'chưa học',
  learning: 'đang học',
  solid: 'chắc',
}

/** Việc còn thiếu để thành "chắc", theo thứ tự nên làm. */
export type TenseGap = 'done' | 'check' | 'mistakes' | 'cards'

export type CardStats = {
  /** Số thẻ quy tắc của thì (`ruleCards`). */
  total: number
  /** Thẻ có mục `SrsCard` hợp lệ trong `srs.cards`. */
  scheduled: number
  /** Thẻ hợp lệ đã nhớ (`isRememberedCard`). */
  remembered: number
  /** Thẻ hợp lệ đến hạn (`due` ≤ `now`). */
  due: number
}

export type VerbStats = { total: number; opened: number; remembered: number }

export type TenseMapRow = {
  tenseId: string
  name: string
  lessonId: string
  /** `t1` … của tháng chứa bài. */
  monthId: string
  status: TenseStatus
  /** Bài đã đánh dấu xong. */
  done: boolean
  /** Bài hiện tại ("học tiếp") khi đã ra khỏi Sân ga. */
  current: boolean
  /** Bài bị Mũ Phân Loại xếp qua. */
  skipped: boolean
  /** Kiểm tra bài tốt nhất (`bestLessonCheck`); chưa làm → null. Bài hai thì thì hai dòng cùng một kết quả. */
  check: LessonCheckResult | null
  cards: CardStats
  /** Câu Sổ lỗi nhãn `thì` của bài chưa thuộc (tính theo bài). */
  openMistakes: number
  /** Chỉ dòng "đang học": việc còn thiếu, theo thứ tự `done` → `check` → `mistakes` → `cards`. */
  missing: TenseGap[]
  /** Chỉ dòng của bài có bảng động từ bất quy tắc: thẻ V1 → V2 · V3 đã mở / đã nhớ. Không đổi trạng thái của thì. */
  verbs?: VerbStats
}

/** Thẻ SRS hợp lệ, `learning` false và khoảng ôn ≥ `TENSE_CARD_REMEMBERED_DAYS` ngày. */
export function isRememberedCard(card: unknown): boolean {
  return isSrsCard(card) && !card.learning && card.interval >= TENSE_CARD_REMEMBERED_DAYS
}

function cardStats(ids: readonly string[], cards: Record<string, unknown>, nowMs: number): CardStats {
  const stats: CardStats = { total: ids.length, scheduled: 0, remembered: 0, due: 0 }
  for (const id of ids) {
    const card = cards[id]
    if (!isSrsCard(card)) continue
    stats.scheduled++
    if (isRememberedCard(card)) stats.remembered++
    if (Date.parse(card.due) <= nowMs) stats.due++
  }
  return stats
}

/** Số câu Sổ lỗi chưa thuộc theo bài: mục hợp lệ, không phải từ đọc, nhãn `thì`, chưa `isMastered`. */
function openMistakesByLesson(store: Store): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of Object.values(readMistakes(store))) {
    if (!isMistakeItem(item) || item.word !== undefined || item.tag !== TENSE_MISTAKE_TAG || isMastered(item)) continue
    counts.set(item.lessonId, (counts.get(item.lessonId) ?? 0) + 1)
  }
  return counts
}

/**
 * Một dòng cho mỗi thì (`tenseEntries`: thứ tự bài rồi thứ tự thì trong bài):
 * - **chắc**: bài đã xong, kiểm tra bài tốt nhất đạt 70%, 0 lỗi chưa thuộc, mọi thẻ quy tắc đã nhớ (thì không có thẻ thì
 *   điều kiện thẻ coi như đạt);
 * - **chưa học**: chưa chắc và chưa có dấu hiệu đã bắt đầu (bài chưa xong, không phải bài hiện tại, chưa có lần kiểm tra
 *   bài, 0 lỗi chưa thuộc, 0 thẻ có lịch). Bài hiện tại chỉ tính khi đã ra khỏi Sân ga;
 * - **đang học**: còn lại, kèm `missing`. Thẻ chỉ là việc còn thiếu khi bài đã xong hoặc đã có thẻ vào lịch (thẻ chỉ vào
 *   ôn khi bài được đánh dấu xong), nên bài hiện tại chưa làm gì chỉ thiếu "đánh dấu xong" và "kiểm tra".
 */
export function tenseMapRows(store: Store, now: Date): TenseMapRow[] {
  const nowMs = now.getTime()
  const completed = readCompletedLessonIds(store)
  const done = new Set(completed)
  const progress = computeRoadmapProgress(allLessons(), completed, readStartLessonId(store))
  const currentLessonId = isInFoundation(store) ? null : progress.nextLessonId
  const cards = readCards(store.data.srs)
  const mistakes = openMistakesByLesson(store)
  const checks = new Map<string, LessonCheckResult | null>()
  const checkOf = (lessonId: string) => {
    if (!checks.has(lessonId)) checks.set(lessonId, bestLessonCheck(store, lessonId))
    return checks.get(lessonId) ?? null
  }

  return tenseEntries().map(({ lessonId, tense }) => {
    const isDone = done.has(lessonId)
    const current = lessonId === currentLessonId
    const check = checkOf(lessonId)
    const stats = cardStats((tense.ruleCards ?? []).map(ruleCardId), cards, nowMs)
    const openMistakes = mistakes.get(lessonId) ?? 0
    const cardsLeft = stats.total - stats.remembered
    const passed = check?.passed === true

    const solid = isDone && passed && openMistakes === 0 && cardsLeft === 0
    const untouched = !isDone && !current && check === null && openMistakes === 0 && stats.scheduled === 0
    const status: TenseStatus = solid ? 'solid' : untouched ? 'new' : 'learning'

    const missing: TenseGap[] = []
    if (status === 'learning') {
      if (!isDone) missing.push('done')
      if (!passed) missing.push('check')
      if (openMistakes > 0) missing.push('mistakes')
      if (cardsLeft > 0 && (isDone || stats.scheduled > 0)) missing.push('cards')
    }

    const row: TenseMapRow = {
      tenseId: tense.id,
      name: tense.name,
      lessonId,
      monthId: getLessonEntry(lessonId)?.month.id ?? '',
      status,
      done: isDone,
      current,
      skipped: progress.skipped.has(lessonId),
      check,
      cards: stats,
      openMistakes,
      missing,
    }
    if (lessonId === IRREGULAR_VERBS_LESSON_ID) {
      const verbs = cardStats(IRREGULAR_VERB_CARDS.map(ruleCardId), cards, nowMs)
      row.verbs = { total: verbs.total, opened: verbs.scheduled, remembered: verbs.remembered }
    }
    return row
  })
}

/** Số thì theo trạng thái. */
export function tenseMapSummary(rows: readonly TenseMapRow[]): Record<TenseStatus, number> {
  const summary: Record<TenseStatus, number> = { solid: 0, learning: 0, new: 0 }
  for (const row of rows) summary[row.status]++
  return summary
}

export type TenseMonthGroup = { monthId: string; label: string; period: string; rows: TenseMapRow[] }

/** Gom dòng theo tháng (tên tháng từ `getLessonEntry(lessonId).month`), giữ thứ tự dòng và thứ tự tháng xuất hiện. */
export function groupTenseRows(rows: readonly TenseMapRow[]): TenseMonthGroup[] {
  const groups: TenseMonthGroup[] = []
  for (const row of rows) {
    const last = groups.at(-1)
    if (last && last.monthId === row.monthId) {
      last.rows.push(row)
      continue
    }
    const month = getLessonEntry(row.lessonId)?.month
    groups.push({ monthId: row.monthId, label: month?.label ?? '', period: month?.period ?? '', rows: [row] })
  }
  return groups
}

/** Câu "Để chắc: …" của dòng "đang học" (chỉ các vế còn thiếu); không thiếu gì → null. */
export function tenseGapText(row: Pick<TenseMapRow, 'missing' | 'openMistakes' | 'cards'>): string | null {
  if (row.missing.length === 0) return null
  const parts = row.missing.map((gap) => {
    switch (gap) {
      case 'done':
        return 'đánh dấu bài xong'
      case 'check':
        return 'kiểm tra bài đạt 70%'
      case 'mistakes':
        return `ôn ${row.openMistakes} câu Sổ lỗi`
      case 'cards':
        return `ôn thẻ (còn ${row.cards.total - row.cards.remembered} thẻ chưa nhớ)`
    }
  })
  return `Để chắc: ${parts.join(' · ')}`
}

/** Dòng "Kiểm tra bài: …" (`passed` để tô `text-primary` khi đạt 70%). */
export function tenseCheckLine(check: LessonCheckResult | null): { text: string; passed: boolean } {
  return check
    ? { text: `Kiểm tra bài: đạt ${check.percent}%`, passed: check.passed }
    : { text: 'Kiểm tra bài: chưa kiểm tra', passed: false }
}

/**
 * Dòng "Thẻ quy tắc: …". Thẻ quy tắc chỉ vào phiên ôn khi bài đã đánh dấu xong (`ruleStudyWords`), nên:
 * - bài xong mà thẻ chưa có lịch: thẻ sẽ vào ở phiên flashcard tới;
 * - bài chưa xong (kể cả vừa bỏ đánh dấu): không báo "đến hạn" vì phiên chưa đưa thẻ ra, chỉ nhắc đánh dấu bài xong.
 */
export function tenseCardsLine(row: Pick<TenseMapRow, 'cards' | 'done'>): string {
  const { cards, done } = row
  if (cards.total === 0) return 'Thẻ quy tắc: không có thẻ riêng'
  if (cards.scheduled === 0) {
    return done
      ? 'Thẻ quy tắc: chưa vào ôn (thẻ vào ở phiên flashcard tới)'
      : 'Thẻ quy tắc: chưa vào ôn (thẻ vào ôn khi bài được đánh dấu xong)'
  }
  const remembered = `Thẻ quy tắc: nhớ ${cards.remembered}/${cards.total}`
  if (!done) return `${remembered} (ôn tiếp khi bài được đánh dấu xong)`
  return cards.due > 0 ? `${remembered} · ${cards.due} thẻ đến hạn` : remembered
}

/** Dòng "Sổ lỗi: …". */
export function tenseMistakesLine(openMistakes: number): string {
  return openMistakes > 0 ? `Sổ lỗi: ${openMistakes} câu chưa thuộc` : 'Sổ lỗi: không có câu chưa thuộc'
}

/** Ghi chú bài bị Mũ Phân Loại xếp qua: chỉ ở dòng "chưa học" (`skipped` vẫn đúng ở dữ liệu khi đã bắt đầu học). */
export function tenseSkippedNote(row: Pick<TenseMapRow, 'status' | 'skipped'>): string | null {
  return row.status === 'new' && row.skipped ? 'Mũ Phân Loại đã xếp qua bài này. Vẫn học được bất cứ lúc nào.' : null
}

/** Dòng "Động từ bất quy tắc: …" (chỉ dòng có `verbs`). */
export function tenseVerbsLine(verbs: VerbStats): string {
  if (verbs.opened === 0) return 'Động từ bất quy tắc: chưa mở thẻ'
  return `Động từ bất quy tắc: nhớ ${verbs.remembered}/${verbs.total} · đã mở ${verbs.opened}/${verbs.total}`
}

/** Mô tả thẻ "Bản đồ thì" trên trang Luyện tập. */
export function tenseMapBlurb(rows: readonly TenseMapRow[]): string {
  const s = tenseMapSummary(rows)
  return `${s.solid} chắc · ${s.learning} đang học · ${s.new} chưa học (${rows.length} thì Năm 1)`
}

export type TenseRowLinks = {
  /** "Xem bài": đoạn Ngữ pháp, luôn có (thì "chưa học" vẫn mở được). */
  lesson: string
  /** "Buổi ôn 30'": buổi bài ghim `?lesson=`, chỉ khi thì không còn "chưa học". */
  session: string | null
  /** "Làm kiểm tra": trang test của quiz bài, khi thì không còn "chưa học" và chưa đạt 70%. */
  check: string | null
  /** Số lỗi chưa thuộc > 0 thì là link tới Sổ lỗi. */
  mistakes: string | null
  /**
   * Dòng thẻ là link tới phiên flashcard khi bài đã xong (thẻ mới vào phiên) và có việc ôn thẻ: thẻ đến hạn hoặc vế "ôn
   * thẻ" còn thiếu.
   */
  cards: string | null
}

/** Trang ôn flashcard (thẻ quy tắc vào phiên này). */
export const FLASHCARDS_HREF = '/practice/flashcards'

export function tenseRowLinks(
  row: Pick<TenseMapRow, 'lessonId' | 'status' | 'check' | 'openMistakes' | 'done' | 'cards' | 'missing'>,
): TenseRowLinks {
  const started = row.status !== 'new'
  const cardWork = row.cards.due > 0 || row.missing.includes('cards')
  return {
    lesson: sectionHref(row.lessonId, 'grammar'),
    session: started ? lessonSessionHref(row.lessonId) : null,
    check: started && row.check?.passed !== true ? quizHref(lessonQuizId(row.lessonId)) : null,
    mistakes: row.openMistakes > 0 ? MISTAKES_HREF : null,
    cards: row.done && cardWork ? FLASHCARDS_HREF : null,
  }
}
