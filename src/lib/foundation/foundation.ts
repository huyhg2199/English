import { BRICKS, bricksOfRow, getBrickMeta, ROW_IDS, type BrickId, type RowId } from '@/data/foundation'
import { isPlainObject, LEGACY_UPDATED_AT, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Tiến độ Sân ga 9¾ (CAP-23): `store.data.foundation` từ schema v13, đồng bộ (`SYNCED_KEYS`) và có trong backup.
 * Module thuần: đọc, ghi (hàm `(store, …, now) => Store`, không có gì đổi thì trả về đúng store cũ) và suy ra trạng thái
 * theo `learning-rules.md`, mục Sân ga. Không import `@/lib/schedule` (story 22 cho schedule gọi module này).
 */

/** Một viên đã xong: lần xong đầu (cho +5 điểm Nhà) và lần xong gần nhất (cho ngày lười). */
export type BrickProgress = {
  firstDoneAt: string
  lastDoneAt: string
  updatedAt: string
}

/** Kết quả kiểm tra một hàng (Soát vé / "Tôi biết rồi" / kiểm tra cuối hàng). */
export type RowResult = {
  /** Đã từng đạt ≥ 70% (không bao giờ hạ). */
  passed: boolean
  /** % đúng tốt nhất 0–100. */
  best: number
  updatedAt: string
}

export const FOUNDATION_PLACEMENTS = ['pending', 'done', 'skipped'] as const
/** Trạng thái Soát vé (khác `store.data.placement` của Mũ Phân Loại). */
export type FoundationPlacement = (typeof FOUNDATION_PLACEMENTS)[number]

export type Foundation = {
  bricks: Partial<Record<BrickId, BrickProgress>>
  rows: Partial<Record<RowId, RowResult>>
  placement: FoundationPlacement
  /** Ngày qua bức tường (cả 4 hàng xong) lần đầu. */
  completedAt: string | null
  /** Ngày bỏ qua Sân ga lần đầu (không bao giờ xoá). */
  skippedAt: string | null
  /** Đang quay lại Sân ga sau khi bỏ qua (từ ngày này); null khi không quay lại. */
  resumedAt: string | null
  /** Thư nhập học đã xem. */
  welcomeSeenAt: string | null
  /** Tổng số ngày của các lần quay lại đã đóng (lịch tạm dừng). */
  pausedDays: number
  updatedAt: string
}

export type FoundationStatus = 'in-foundation' | 'skipped' | 'completed'

export type FoundationState = {
  status: FoundationStatus
  /** Hàng đã xong (kiểm tra đạt hoặc học hết viên), theo thứ tự A → D. */
  rowsDone: RowId[]
  /** Số viên cho "x/18": viên đã xong + viên thuộc hàng đã qua bằng kiểm tra. */
  taughtCount: number
  totalBricks: number
  /** Viên đã xong (có `firstDoneAt`), theo thứ tự F01 → F18. */
  doneBrickIds: BrickId[]
}

/** Cổng hiển thị trên thẻ từ: IPA (F03), tô trọng âm (F04), nhãn từ loại (F07). */
export const FOUNDATION_GATES = { ipa: 'F03', stress: 'F04', pos: 'F07' } as const satisfies Record<string, BrickId>
export type FoundationGate = keyof typeof FOUNDATION_GATES

/** Ngưỡng đạt của kiểm tra hàng: ≥ 70%, so bằng số nguyên (8 câu cần 6). */
export function isRowPass(correct: number, total: number): boolean {
  return correct * 10 >= total * 7
}

export function isBrickProgress(value: unknown): value is BrickProgress {
  return (
    isPlainObject(value) &&
    isTimeString(value.firstDoneAt) &&
    isTimeString(value.lastDoneAt) &&
    isTimeString(value.updatedAt)
  )
}

export function isRowResult(value: unknown): value is RowResult {
  return (
    isPlainObject(value) &&
    typeof value.passed === 'boolean' &&
    typeof value.best === 'number' &&
    Number.isFinite(value.best) &&
    value.best >= 0 &&
    value.best <= 100 &&
    isTimeString(value.updatedAt)
  )
}

export function isFoundationPlacement(value: unknown): value is FoundationPlacement {
  return typeof value === 'string' && (FOUNDATION_PLACEMENTS as readonly string[]).includes(value)
}

function isRowId(value: unknown): value is RowId {
  return typeof value === 'string' && (ROW_IDS as readonly string[]).includes(value)
}

/** Giá trị mặc định (người dùng mới / vừa nâng cấp): đang ở Sân ga, Soát vé `pending`. */
export function createDefaultFoundation(): Foundation {
  return {
    bricks: {},
    rows: {},
    placement: 'pending',
    completedAt: null,
    skippedAt: null,
    resumedAt: null,
    pausedDays: 0,
    welcomeSeenAt: null,
    updatedAt: LEGACY_UPDATED_AT,
  }
}

const timeOrNull = (value: unknown): string | null => (isTimeString(value) ? value : null)

/** Đọc một giá trị `foundation` bất kỳ; mục / field sai dạng bị bỏ qua (không bị xoá khỏi store). */
function parseFoundation(value: unknown): Foundation {
  const f = createDefaultFoundation()
  if (!isPlainObject(value)) return f
  if (isPlainObject(value.bricks)) {
    for (const b of BRICKS) {
      const entry = Object.hasOwn(value.bricks, b.id) ? value.bricks[b.id] : undefined
      if (isBrickProgress(entry)) f.bricks[b.id] = entry
    }
  }
  if (isPlainObject(value.rows)) {
    for (const r of ROW_IDS) {
      const entry = Object.hasOwn(value.rows, r) ? value.rows[r] : undefined
      if (isRowResult(entry)) f.rows[r] = entry
    }
  }
  if (isFoundationPlacement(value.placement)) f.placement = value.placement
  f.completedAt = timeOrNull(value.completedAt)
  f.skippedAt = timeOrNull(value.skippedAt)
  f.resumedAt = timeOrNull(value.resumedAt)
  f.welcomeSeenAt = timeOrNull(value.welcomeSeenAt)
  if (Number.isInteger(value.pausedDays) && (value.pausedDays as number) >= 0) f.pausedDays = value.pausedDays as number
  if (isTimeString(value.updatedAt)) f.updatedAt = value.updatedAt
  return f
}

/** Tiến độ Sân ga (thiếu key → mặc định). */
export function readFoundation(store: Store): Foundation {
  return parseFoundation(store.data.foundation)
}

// --- Ngày theo giờ máy (viết riêng, không import `@/lib/schedule`) ---

const DAY_MS = 24 * 60 * 60 * 1000

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Số ngày lịch từ `from` tới `to` (giờ máy), không âm. */
function daysFrom(from: Date, to: Date): number {
  return Math.max(0, Math.round((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / DAY_MS))
}

// --- Suy ra trạng thái ---

function isRowDoneIn(f: Foundation, row: RowId): boolean {
  return f.rows[row]?.passed === true || bricksOfRow(row).every((b) => f.bricks[b.id] !== undefined)
}

function rowsDoneIn(f: Foundation): RowId[] {
  return ROW_IDS.filter((r) => isRowDoneIn(f, r))
}

function isTaughtIn(f: Foundation, id: string): boolean {
  const meta = getBrickMeta(id)
  if (!meta) return false
  return f.bricks[meta.id] !== undefined || f.rows[meta.row]?.passed === true || f.skippedAt !== null
}

function statusOf(f: Foundation): FoundationStatus {
  if (f.completedAt !== null) return 'completed'
  if (f.skippedAt !== null && f.resumedAt === null) return 'skipped'
  return 'in-foundation'
}

/**
 * Trạng thái Sân ga cho UI. `taughtCount` (x/18) = viên đã xong + viên của hàng đã qua bằng kiểm tra (`learning-rules.md`,
 * trang Hôm nay); không cộng "đã từng bỏ qua" để khi quay lại Sân ga vẫn thấy đúng chỗ đang học.
 */
export function foundationState(store: Store): FoundationState {
  const f = readFoundation(store)
  const doneBrickIds = BRICKS.filter((b) => f.bricks[b.id] !== undefined).map((b) => b.id)
  const taughtCount = BRICKS.filter((b) => f.bricks[b.id] !== undefined || f.rows[b.row]?.passed === true).length
  return { status: statusOf(f), rowsDone: rowsDoneIn(f), taughtCount, totalBricks: BRICKS.length, doneBrickIds }
}

/** Đang ở Sân ga = chưa qua tường và (chưa bỏ qua hoặc đã bấm "Quay lại Sân ga"). */
export function isInFoundation(store: Store): boolean {
  return statusOf(readFoundation(store)) === 'in-foundation'
}

/** Cần mời Soát vé: đang ở Sân ga và Soát vé còn `pending`. */
export function needsPlacement(store: Store): boolean {
  const f = readFoundation(store)
  return statusOf(f) === 'in-foundation' && f.placement === 'pending'
}

/** Hàng `row` đã xong: kiểm tra hàng đạt, hoặc mọi viên của hàng đã xong. */
export function isRowDone(store: Store, row: RowId): boolean {
  return isRowId(row) && isRowDoneIn(readFoundation(store), row)
}

/**
 * Viên đã dạy = viên xong, hoặc hàng của nó đã qua bằng kiểm tra, hoặc Sân ga đã từng bị bỏ qua.
 * Ba điều kiện đều không bao giờ hạ, nên cổng đã mở thì không đóng (kể cả khi quay lại Sân ga). Id lạ → false.
 */
export function isBrickTaught(store: Store, brickId: string): boolean {
  return isTaughtIn(readFoundation(store), brickId)
}

/** Cổng hiển thị đã mở chưa (`ipa` → F03, `stress` → F04, `pos` → F07). Cổng lạ (giá trị ngoài kiểu, lúc chạy) → false. */
export function isGateOpen(store: Store, gate: FoundationGate): boolean {
  if (!Object.hasOwn(FOUNDATION_GATES, gate)) return false
  return isTaughtIn(readFoundation(store), FOUNDATION_GATES[gate])
}

/**
 * Ngày bắt đầu lịch 12 tháng (nửa đêm giờ máy): ngày sớm hơn của `skippedAt` / `completedAt`, cộng `pausedDays`,
 * cộng số ngày từ `resumedAt` tới `now` khi đang quay lại mà chưa qua tường. Chưa bỏ qua, chưa qua tường → null.
 */
export function scheduleStartDate(store: Store, now: Date): Date | null {
  const f = readFoundation(store)
  const starts = [f.skippedAt, f.completedAt].filter((t): t is string => t !== null).map((t) => Date.parse(t))
  if (starts.length === 0) return null
  let days = f.pausedDays
  if (f.resumedAt !== null && f.completedAt === null) days += daysFrom(new Date(f.resumedAt), now)
  return addDays(new Date(Math.min(...starts)), days)
}

// --- Ghi ---

/** Đóng lần quay lại tại thời điểm `at`: cộng số ngày vào `pausedDays`, xoá `resumedAt`. */
function closeResume(f: Foundation, at: Date): Record<string, unknown> {
  if (f.resumedAt === null) return {}
  return { resumedAt: null, pausedDays: f.pausedDays + daysFrom(new Date(f.resumedAt), at) }
}

/**
 * Ghi `patch` vào `foundation` (giữ field lạ và mục sai dạng), `updatedAt` không lùi.
 * `checkWall`: cả 4 hàng vừa xong mà chưa có `completedAt` → qua tường lúc `now` (và đóng lần quay lại).
 */
function commit(store: Store, patch: Record<string, unknown>, now: Date, checkWall = false): Store {
  const prev = store.data.foundation
  const base: Record<string, unknown> = isPlainObject(prev) ? prev : {}
  let next: Record<string, unknown> = { ...createDefaultFoundation(), ...base, ...patch }
  if (checkWall) {
    const f = parseFoundation(next)
    if (f.completedAt === null && rowsDoneIn(f).length === ROW_IDS.length) {
      next = { ...next, completedAt: now.toISOString(), ...closeResume(f, now) }
    }
  }
  next.updatedAt = nextUpdatedAt(base.updatedAt, now)
  return { ...store, data: { ...store.data, foundation: next } }
}

function rawMap(store: Store, field: 'bricks' | 'rows'): Record<string, unknown> {
  const f = store.data.foundation
  return isPlainObject(f) && isPlainObject(f[field]) ? f[field] : {}
}

/**
 * Xong viên (đi hết tới màn Áp dụng): lần đầu `firstDoneAt = lastDoneAt = now`; lần sau giữ `firstDoneAt`, `lastDoneAt`
 * lấy muộn hơn. Id không có trong danh mục → store cũ.
 */
export function completeBrick(store: Store, brickId: string, now: Date): Store {
  const meta = getBrickMeta(brickId)
  if (!meta) return store
  const bricks = rawMap(store, 'bricks')
  const prev = Object.hasOwn(bricks, meta.id) ? bricks[meta.id] : undefined
  const nowIso = now.toISOString()
  let entry: BrickProgress
  if (isBrickProgress(prev)) {
    const lastDoneAt = Date.parse(prev.lastDoneAt) >= now.getTime() ? prev.lastDoneAt : nowIso
    if (lastDoneAt === prev.lastDoneAt) return store
    entry = { ...prev, lastDoneAt, updatedAt: nextUpdatedAt(prev.updatedAt, now) }
  } else {
    entry = { firstDoneAt: nowIso, lastDoneAt: nowIso, updatedAt: nowIso }
  }
  return commit(store, { bricks: { ...bricks, [meta.id]: entry } }, now, true)
}

/**
 * Ghi một lần kiểm tra hàng (`correct`/`total` câu): `passed` = đã từng đạt ≥ 70% (so số nguyên), `best` = max
 * (`Math.round(correct / total * 100)`). `total ≤ 0`, số câu sai dạng hoặc hàng lạ → store cũ.
 */
export function markRowTested(store: Store, row: RowId, correct: number, total: number, now: Date): Store {
  if (!isRowId(row) || !Number.isInteger(total) || total <= 0) return store
  if (!Number.isInteger(correct) || correct < 0 || correct > total) return store
  const rows = rawMap(store, 'rows')
  const prev = Object.hasOwn(rows, row) ? rows[row] : undefined
  const ok = isRowResult(prev)
  const passed = (ok && prev.passed) || isRowPass(correct, total)
  const best = Math.max(ok ? prev.best : 0, Math.round((correct / total) * 100))
  if (ok && passed === prev.passed && best === prev.best) return store
  const entry: RowResult = { ...(ok ? prev : {}), passed, best, updatedAt: nextUpdatedAt(ok ? prev.updatedAt : undefined, now) }
  return commit(store, { rows: { ...rows, [row]: entry } }, now, true)
}

/** Kết thúc Soát vé (`done` khi đã làm, `skipped` khi bấm "Bỏ qua, học từ viên 1"). Chỉ đổi khi còn `pending`. */
export function finishPlacement(store: Store, result: 'done' | 'skipped', now: Date): Store {
  if (result !== 'done' && result !== 'skipped') return store
  if (readFoundation(store).placement !== 'pending') return store
  return commit(store, { placement: result }, now)
}

/** Đánh dấu đã xem Thư nhập học (chỉ lần đầu). */
export function markWelcomeSeen(store: Store, now: Date): Store {
  if (readFoundation(store).welcomeSeenAt !== null) return store
  return commit(store, { welcomeSeenAt: now.toISOString() }, now)
}

/**
 * "Bỏ qua Sân ga": lần đầu ghi `skippedAt`; đang quay lại thì đóng lần quay lại (cộng ngày vào `pausedDays`).
 * Đã qua tường, hoặc đã bỏ qua mà không quay lại → store cũ. Không xoá gì.
 */
export function skipFoundation(store: Store, now: Date): Store {
  const f = readFoundation(store)
  if (f.completedAt !== null) return store
  if (f.skippedAt === null) return commit(store, { skippedAt: now.toISOString(), resumedAt: null }, now)
  if (f.resumedAt === null) return store
  return commit(store, closeResume(f, now), now)
}

/** "Quay lại Sân ga" sau khi bỏ qua. Chưa bỏ qua / đã qua tường / đang quay lại → store cũ. */
export function resumeFoundation(store: Store, now: Date): Store {
  const f = readFoundation(store)
  if (f.skippedAt === null || f.completedAt !== null || f.resumedAt !== null) return store
  return commit(store, { resumedAt: now.toISOString() }, now)
}

// --- Gộp khi đồng bộ (dùng trong `@/lib/sync/merge`) ---

function timeOf(value: unknown): number {
  return isTimeString(value) ? Date.parse(value) : Number.NEGATIVE_INFINITY
}

function newer<T extends { updatedAt: string }>(a: T, b: T): T {
  return timeOf(b.updatedAt) > timeOf(a.updatedAt) ? b : a
}

/** Gán thuộc tính riêng kể cả id như `__proto__` (không đổi prototype). */
function setOwn(obj: Record<string, unknown>, key: string, value: unknown): void {
  Object.defineProperty(obj, key, { value, enumerable: true, writable: true, configurable: true })
}

/** Gộp map theo mục: cả hai hợp lệ → `pick`; một bên sai dạng → bên hợp lệ; cả hai sai → giữ local. Không bỏ mục nào. */
function mergeMap<T>(
  local: unknown,
  server: unknown,
  isValid: (value: unknown) => value is T,
  pick: (a: T, b: T) => T,
): Record<string, unknown> {
  const l = isPlainObject(local) ? local : {}
  const s = isPlainObject(server) ? server : {}
  const out: Record<string, unknown> = {}
  for (const id of new Set([...Object.keys(l), ...Object.keys(s)])) {
    const a = Object.hasOwn(l, id) ? l[id] : undefined
    const b = Object.hasOwn(s, id) ? s[id] : undefined
    const aOk = isValid(a)
    const bOk = isValid(b)
    setOwn(out, id, aOk && bOk ? pick(a, b) : aOk ? a : bOk ? b : Object.hasOwn(l, id) ? a : b)
  }
  return out
}

function earlierTime(a: string, b: string): string {
  return timeOf(b) < timeOf(a) ? b : a
}

function laterTime(a: string, b: string): string {
  return timeOf(b) > timeOf(a) ? b : a
}

function pickBrick(a: BrickProgress, b: BrickProgress): BrickProgress {
  return {
    ...newer(a, b),
    firstDoneAt: earlierTime(a.firstDoneAt, b.firstDoneAt),
    lastDoneAt: laterTime(a.lastDoneAt, b.lastDoneAt),
  }
}

function pickRow(a: RowResult, b: RowResult): RowResult {
  return { ...newer(a, b), passed: a.passed || b.passed, best: Math.max(a.best, b.best) }
}

/** Ngày sớm nhất hợp lệ của hai bên; không bên nào hợp lệ → giá trị của bên thắng (`fallback`). */
function earliest(l: unknown, s: unknown, fallback: unknown): unknown {
  const lOk = isTimeString(l)
  const sOk = isTimeString(s)
  if (lOk && sOk) return earlierTime(l, s)
  if (lOk) return l
  if (sOk) return s
  return fallback === undefined ? null : fallback
}

function mergePlacementStatus(l: unknown, s: unknown, fallback: unknown): unknown {
  const lOk = isFoundationPlacement(l)
  const sOk = isFoundationPlacement(s)
  if (lOk && sOk) {
    if (l === s) return l
    if (l === 'pending') return s
    if (s === 'pending') return l
    return fallback
  }
  if (lOk) return l
  if (sOk) return s
  return fallback === undefined ? 'pending' : fallback
}

/**
 * Gộp `foundation` (luật ở `stack.md`, dòng "Sân ga 9¾"):
 * - viên: `updatedAt` mới hơn thắng, nhưng `firstDoneAt` lấy sớm nhất và `lastDoneAt` lấy muộn nhất;
 * - hàng: `passed` = một bên đạt là đạt, `best` lấy max (field khác theo `updatedAt` của mục);
 * - `completedAt`, `skippedAt`, `welcomeSeenAt`: ngày sớm nhất;
 * - `placement`: `done`/`skipped` thắng `pending`; hai bên đều khác `pending` thì theo `updatedAt`;
 * - `resumedAt`, `pausedDays`, `updatedAt` và field lạ theo `updatedAt` của cả object (bằng nhau giữ local); riêng khi
 *   bên thắng chưa từng bỏ qua (`skippedAt` trống) mà bên kia đã bỏ qua thì `resumedAt`, `pausedDays` lấy theo bên kia
 *   (bên thắng không biết gì về lần bỏ qua, nên không được xoá lần quay lại / số ngày tạm dừng của bên kia);
 * - hai máy mỗi bên xong một phần mà gộp lại đủ 4 hàng (cả hai `completedAt` null) → `completedAt` = `updatedAt` mới hơn;
 * - đã qua tường mà còn `resumedAt` (lần quay lại ở máy kia) → đóng lần quay lại tại `completedAt` (cộng ngày vào
 *   `pausedDays`, không đổi `updatedAt`), như khi qua tường trên một máy.
 * Một bên sai dạng → lấy bên hợp lệ. Gộp lại cùng dữ liệu cho ra cùng kết quả.
 */
export function mergeFoundation(local: unknown, server: unknown): unknown {
  const hasLocal = isPlainObject(local)
  const hasServer = isPlainObject(server)
  if (!hasLocal && !hasServer) return local ?? server
  if (!hasServer) return local
  if (!hasLocal) return server
  const [winner, other] = timeOf(server.updatedAt) > timeOf(local.updatedAt) ? [server, local] : [local, server]
  const skipFromOther = !isTimeString(winner.skippedAt) && isTimeString(other.skippedAt)
  let out: Record<string, unknown> = {
    ...other,
    ...winner,
    ...(skipFromOther ? { resumedAt: other.resumedAt ?? null, pausedDays: other.pausedDays ?? 0 } : {}),
    bricks: mergeMap(local.bricks, server.bricks, isBrickProgress, pickBrick),
    rows: mergeMap(local.rows, server.rows, isRowResult, pickRow),
    placement: mergePlacementStatus(local.placement, server.placement, winner.placement),
    completedAt: earliest(local.completedAt, server.completedAt, winner.completedAt),
    skippedAt: earliest(local.skippedAt, server.skippedAt, winner.skippedAt),
    welcomeSeenAt: earliest(local.welcomeSeenAt, server.welcomeSeenAt, winner.welcomeSeenAt),
  }
  const f = parseFoundation(out)
  let completedAt = f.completedAt
  if (completedAt === null && rowsDoneIn(f).length === ROW_IDS.length && isTimeString(winner.updatedAt)) {
    completedAt = winner.updatedAt
    out = { ...out, completedAt }
  }
  if (completedAt !== null && f.resumedAt !== null) out = { ...out, ...closeResume(f, new Date(completedAt)) }
  return out
}
