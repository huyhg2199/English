import {
  BRICKS,
  isBrickId,
  ROW_IDS,
  ROW_TITLES,
  type BrickId,
  type CheckItem,
  type RowId,
} from '@/data/foundation'
import { seededRandom, shuffle } from '@/lib/quiz/random'
import { checkFill } from '@/lib/subs/blanks'
import type { Store } from '@/lib/storage'

import { foundationState, type FoundationState } from './foundation'

/**
 * Logic thuần của BrickPlayer và bức tường (story 19): chấm câu luyện, ngưỡng mời ôn < 60%, xáo mảnh, luồng màn check,
 * viên tiếp theo, ô trên bức tường và route `/foundation/:brickId`. Không import nội dung viên: nơi gọi truyền `hasContent`.
 */

/** Câu trả lời cho một câu luyện. `sort`: mục → vị trí nhóm trong `groups`. */
export type CheckResponse =
  | { kind: 'choice' | 'listen'; choice: number }
  | { kind: 'tapSyllable'; index: number }
  | { kind: 'order'; tokens: readonly string[] }
  | { kind: 'sort'; groupOf: Readonly<Record<string, number>> }

/** Chấm một câu luyện. Loại câu trả lời khác loại câu → sai. */
export function isCorrect(item: CheckItem, response: CheckResponse): boolean {
  switch (item.kind) {
    case 'choice':
    case 'listen':
      return (response.kind === 'choice' || response.kind === 'listen') && response.choice === item.answer
    case 'tapSyllable':
      return response.kind === 'tapSyllable' && response.index === item.answer
    case 'order':
      return (
        response.kind === 'order' &&
        response.tokens.length === item.tokens.length &&
        response.tokens.every((t, i) => t === item.tokens[i])
      )
    case 'sort': {
      if (response.kind !== 'sort') return false
      const all = item.groups.flatMap((g) => g.items)
      if (Object.keys(response.groupOf).length !== all.length) return false
      return item.groups.every((g, gi) =>
        g.items.every((x) => Object.hasOwn(response.groupOf, x) && response.groupOf[x] === gi),
      )
    }
  }
}

/** Đáp án hiện khi bấm "Xem đáp án" (âm tiết nhấn viết hoa, vd "YES·ter·day"). */
export function answerText(item: CheckItem): string {
  switch (item.kind) {
    case 'choice':
    case 'listen':
      return item.options[item.answer]
    case 'tapSyllable':
      return item.syllables.map((s, i) => (i === item.answer ? s.toUpperCase() : s)).join('·')
    case 'order':
      return item.tokens.join(' ')
    case 'sort':
      return item.groups.map((g) => `${g.label}: ${g.items.join(', ')}`).join(' · ')
  }
}

/** Chấm màn `faded`: không phân biệt hoa thường, dấu câu, khoảng trắng thừa (`checkFill`); ô trống là sai. */
export function isFadedCorrect(answer: string, typed: string): boolean {
  return checkFill(answer, typed)
}

/** Mời "Xem lại giải thích" + 2 câu dễ hơn: đúng lần đầu dưới 60%, so số nguyên (3/5 không mời). */
export function needsReview(firstTryCorrect: number, total: number): boolean {
  return total > 0 && firstTryCorrect * 10 < total * 6
}

/** Các mảnh cần xếp của câu `order` / `sort` (theo thứ tự gốc); loại khác → []. */
function piecesOf(item: CheckItem): string[] {
  if (item.kind === 'order') return [...item.tokens]
  if (item.kind === 'sort') return item.groups.flatMap((g) => g.items)
  return []
}

/**
 * Mảnh đã xáo theo `seed` (xác định). Có > 1 mảnh thì không bao giờ ra đúng thứ tự gốc (trùng thì xoay một bước),
 * trừ khi mọi mảnh giống nhau.
 */
export function shuffledTokens(item: CheckItem, seed: string): string[] {
  const pieces = piecesOf(item)
  if (pieces.length < 2) return pieces
  const out = shuffle(pieces, seededRandom(`${seed}:${item.id}`))
  const same = (xs: readonly string[]) => xs.every((x, i) => x === pieces[i])
  if (!same(out)) return out
  const rotated = [...out.slice(1), out[0]]
  return rotated
}

// --- Luồng màn check ---

export type CheckStage = 'main' | 'invite' | 'easier' | 'finished'

/**
 * Luồng màn check: chạy các câu chính (ghi lần trả lời đầu), hết câu chính mà < 60% thì mời ôn (`invite`), nhận lời thì
 * chạy 2 câu dễ hơn (`easier`, không tính điểm) rồi `finished`. Lời mời chỉ một lần.
 */
export type CheckFlow = {
  stage: CheckStage
  /** Vị trí câu đang làm trong danh sách của giai đoạn (`items` khi `main`, `easier` khi `easier`). */
  index: number
  /** Kết quả lần trả lời đầu của câu chính, theo id. */
  firstTry: Readonly<Record<string, boolean>>
}

export function startCheck(): CheckFlow {
  return { stage: 'main', index: 0, firstTry: {} }
}

/** Ghi một lần trả lời. Chỉ lần đầu của câu chính được tính (câu dễ hơn, lần thử lại, "Xem đáp án" sau đó không đổi). */
export function recordAnswer(flow: CheckFlow, itemId: string, correct: boolean): CheckFlow {
  if (flow.stage !== 'main' || Object.hasOwn(flow.firstTry, itemId)) return flow
  return { ...flow, firstTry: { ...flow.firstTry, [itemId]: correct } }
}

/** Số câu chính đúng ngay lần đầu. */
export function firstTryScore(flow: CheckFlow): number {
  return Object.values(flow.firstTry).filter(Boolean).length
}

/**
 * Sang câu sau (câu hiện tại đã đúng hoặc đã "Xem đáp án"). Hết câu chính → `invite` nếu < 60%, không thì `finished`.
 * Hết câu dễ hơn → `finished`. Câu chính chưa trả lời lần nào (bấm "Xem đáp án" ngay) tính là sai lần đầu.
 */
export function advanceCheck(flow: CheckFlow, check: { items: readonly CheckItem[]; easier: readonly CheckItem[] }): CheckFlow {
  if (flow.stage === 'main') {
    const current = check.items[flow.index]
    const scored = current ? recordAnswer(flow, current.id, false) : flow
    if (flow.index + 1 < check.items.length) return { ...scored, index: flow.index + 1 }
    const stage = needsReview(firstTryScore(scored), check.items.length) && check.easier.length > 0 ? 'invite' : 'finished'
    return { ...scored, stage, index: 0 }
  }
  if (flow.stage === 'easier') {
    if (flow.index + 1 < check.easier.length) return { ...flow, index: flow.index + 1 }
    return { ...flow, stage: 'finished', index: 0 }
  }
  return flow
}

/** Nhận lời mời: chạy câu dễ hơn. */
export function startEasier(flow: CheckFlow): CheckFlow {
  return flow.stage === 'invite' ? { ...flow, stage: 'easier', index: 0 } : flow
}

/** "Bỏ qua, sang Áp dụng" (từ lời mời hoặc giữa các câu dễ hơn). */
export function skipEasier(flow: CheckFlow): CheckFlow {
  return flow.stage === 'invite' || flow.stage === 'easier' ? { ...flow, stage: 'finished', index: 0 } : flow
}

// --- Bức tường ---

/** Viên tiếp theo: viên chưa xong đầu tiên F01 → F18, có nội dung, không thuộc hàng đã xong. Không có → null. */
export function nextBrickIdFromState(state: FoundationState, hasContent: (id: BrickId) => boolean): BrickId | null {
  const done = new Set<string>(state.doneBrickIds)
  const rowsDone = new Set<string>(state.rowsDone)
  return BRICKS.find((b) => !done.has(b.id) && !rowsDone.has(b.row) && hasContent(b.id))?.id ?? null
}

export function nextBrickId(store: Store, hasContent: (id: BrickId) => boolean): BrickId | null {
  return nextBrickIdFromState(foundationState(store), hasContent)
}

export type WallTile = {
  id: BrickId
  title: string
  minutes: number
  /** Sáng: viên đã xong hoặc thuộc hàng đã xong. */
  lit: boolean
  /** Viên tiếp theo (viền sáng "Học tiếp"). */
  next: boolean
  /** Có nội dung: mở được; không thì "Đang soạn", không phải link. */
  hasContent: boolean
}

export type WallRow = { row: RowId; title: string; done: boolean; tiles: WallTile[] }

/** Bức tường 4 hàng A–D, 18 ô. */
export function wallRows(state: FoundationState, hasContent: (id: BrickId) => boolean): WallRow[] {
  const done = new Set<string>(state.doneBrickIds)
  const rowsDone = new Set<string>(state.rowsDone)
  const nextId = nextBrickIdFromState(state, hasContent)
  return ROW_IDS.map((row) => ({
    row,
    title: ROW_TITLES[row],
    done: rowsDone.has(row),
    tiles: BRICKS.filter((b) => b.row === row).map((b) => ({
      id: b.id,
      title: b.title,
      minutes: b.minutes,
      lit: done.has(b.id) || rowsDone.has(row),
      next: b.id === nextId,
      hasContent: hasContent(b.id),
    })),
  }))
}

// --- Route `/foundation/:brickId` ---

export type BrickRoute = { kind: 'play'; id: BrickId } | { kind: 'drafting'; id: BrickId } | { kind: 'unknown' }

/** Id viết thường được chấp nhận (`f01` → F01); id ngoài danh mục → `unknown` (chuyển về `/foundation`). */
export function resolveBrickRoute(param: string | undefined, hasContent: (id: BrickId) => boolean): BrickRoute {
  const id = (param ?? '').trim().toUpperCase()
  if (!isBrickId(id)) return { kind: 'unknown' }
  return hasContent(id) ? { kind: 'play', id } : { kind: 'drafting', id }
}

export function brickHref(id: BrickId): string {
  return `/foundation/${id}`
}
