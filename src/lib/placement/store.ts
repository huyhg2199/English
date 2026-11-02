import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Kết quả Mũ Phân Loại (story 5): `store.data.placement` từ schema v6.
 * File này chỉ đọc/ghi store (không import `@/lib/sessions`) để `sessions` dùng được mà không vòng import.
 */

export const PART_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'] as const
export type PartKey = (typeof PART_KEYS)[number]
export type PartScores = Record<PartKey, number>

/** Số câu tối đa từng Part của đề mẫu ETS L&R. */
export const PART_LIMITS: PartScores = { p1: 6, p2: 25, p3: 39, p4: 30, p5: 30, p6: 16, p7: 54 }

export const HOUSES = ['gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin'] as const
export type House = (typeof HOUSES)[number]

/** Một lần nhập điểm. Không sửa sau khi lưu; `updatedAt` = `takenAt` (để gộp theo id). */
export type PlacementAttempt = { takenAt: string; parts: PartScores; updatedAt: string }

export type Placement = {
  /** Mọi lần làm, theo id; không bao giờ xoá. Lần sớm nhất là mốc, lần muộn nhất là hiện tại. */
  attempts: Record<string, unknown>
  house: House | null
  /** Bài bắt đầu theo xếp lớp; null = từ bài đầu tiên. */
  startLessonId: string | null
  /** Lần sửa `house` / `startLessonId` gần nhất; không bao giờ lùi. */
  updatedAt: string
}

export function isHouse(value: unknown): value is House {
  return typeof value === 'string' && (HOUSES as readonly string[]).includes(value)
}

export function isPartScores(value: unknown): value is PartScores {
  return (
    isPlainObject(value) &&
    PART_KEYS.every((k) => {
      const v = value[k]
      return Number.isInteger(v) && (v as number) >= 0 && (v as number) <= PART_LIMITS[k]
    })
  )
}

export function isPlacementAttempt(value: unknown): value is PlacementAttempt {
  return isPlainObject(value) && isTimeString(value.takenAt) && isTimeString(value.updatedAt) && isPartScores(value.parts)
}

/** Đọc `placement`; thiếu / sai dạng thì trả về mặc định (không sửa store). Field sai dạng coi như null. */
export function readPlacement(store: Store): Placement {
  const raw = isPlainObject(store.data.placement) ? store.data.placement : {}
  return {
    attempts: isPlainObject(raw.attempts) ? raw.attempts : {},
    house: isHouse(raw.house) ? raw.house : null,
    startLessonId: typeof raw.startLessonId === 'string' ? raw.startLessonId : null,
    updatedAt: isTimeString(raw.updatedAt) ? raw.updatedAt : '1970-01-01T00:00:00.000Z',
  }
}

export type AttemptEntry = PlacementAttempt & { id: string }

/** Các lần làm hợp lệ, cũ → mới (theo `takenAt`, rồi theo id). */
export function listAttempts(store: Store): AttemptEntry[] {
  return Object.entries(readPlacement(store).attempts)
    .filter((e): e is [string, PlacementAttempt] => isPlacementAttempt(e[1]))
    .map(([id, a]) => ({ id, ...a }))
    .sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

/** Đã đội Mũ Phân Loại = có ít nhất một lần nhập điểm hợp lệ. */
export function hasPlacement(store: Store): boolean {
  return listAttempts(store).length > 0
}

export function readStartLessonId(store: Store): string | null {
  return readPlacement(store).startLessonId
}

function writePlacement(store: Store, patch: Record<string, unknown>): Store {
  const raw = isPlainObject(store.data.placement) ? store.data.placement : {}
  return { ...store, data: { ...store.data, placement: { ...raw, ...patch } } }
}

/**
 * Thêm một lần nhập điểm (không xoá lần cũ). Lần đầu tiên (chưa có bài bắt đầu) thì xếp luôn
 * `startLessonId`; các lần sau chỉ đổi khi gọi `applyStartLesson` ("Áp dụng xếp lớp").
 */
export function recordAttempt(
  store: Store,
  parts: PartScores,
  now: Date,
  placedLessonId: string,
): { store: Store; id: string } {
  const placement = readPlacement(store)
  const raw = isPlainObject(store.data.placement) ? store.data.placement : {}
  let id = `att-${now.getTime().toString(36)}`
  for (let n = 2; Object.hasOwn(placement.attempts, id); n++) id = `att-${now.getTime().toString(36)}-${n}`
  const at = now.toISOString()
  const attempt: PlacementAttempt = { takenAt: at, parts: { ...parts }, updatedAt: at }
  const patch: Record<string, unknown> = { attempts: { ...placement.attempts, [id]: attempt } }
  if (!hasPlacement(store) && placement.startLessonId === null) {
    patch.startLessonId = placedLessonId
    patch.updatedAt = nextUpdatedAt(raw.updatedAt, now)
  }
  return { store: writePlacement(store, patch), id }
}

export function setHouse(store: Store, house: House, now: Date): Store {
  const raw = isPlainObject(store.data.placement) ? store.data.placement : {}
  if (readPlacement(store).house === house) return store
  return writePlacement(store, { house, updatedAt: nextUpdatedAt(raw.updatedAt, now) })
}

/** "Áp dụng xếp lớp": đổi bài bắt đầu. Không đánh dấu hay bỏ đánh dấu bài nào. */
export function applyStartLesson(store: Store, lessonId: string, now: Date): Store {
  const raw = isPlainObject(store.data.placement) ? store.data.placement : {}
  if (readPlacement(store).startLessonId === lessonId) return store
  return writePlacement(store, { startLessonId: lessonId, updatedAt: nextUpdatedAt(raw.updatedAt, now) })
}
