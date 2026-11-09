import { foundationState, readFoundation } from '@/lib/foundation'
import { KNOWN_ATTEMPT_KINDS, listAttempts } from '@/lib/quiz'
import { readSessionDays } from '@/lib/sessions'
import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

import { comebackCount, housePoints, withBrickPoints, type HousePointsWithBricks } from './points'

/**
 * Huy chương 3 cấp (story 12): đồng → bạc → vàng khi đạt 1 / 5 / 20 lần. Cấp tính lại từ dữ liệu nguồn
 * (lần làm test, nhật ký buổi học) nên không bao giờ giảm. Đã báo "cú đưa thư" thì ghi `trophies.seen[medalId:level]`.
 */

export const MEDAL_LEVELS = ['bronze', 'silver', 'gold'] as const
export type MedalLevel = (typeof MEDAL_LEVELS)[number]
export const LEVEL_TARGETS: Record<MedalLevel, number> = { bronze: 1, silver: 5, gold: 20 }
export const LEVEL_LABELS: Record<MedalLevel, string> = { bronze: 'đồng', silver: 'bạc', gold: 'vàng' }

export const MEDAL_IDS = ['hermione', 'dumbledore', 'neville'] as const
export type MedalId = (typeof MEDAL_IDS)[number]

export type MedalDef = { id: MedalId; name: string; condition: string }

export const MEDALS: readonly MedalDef[] = [
  { id: 'hermione', name: 'Hermione', condition: 'Làm bài trắc nghiệm đúng 100%' },
  { id: 'dumbledore', name: 'Dumbledore', condition: 'Qua một kỳ O.W.L.' },
  { id: 'neville', name: 'Neville', condition: 'Quay lại học sau khi gãy chuỗi' },
]

/** Huy chương Đợt 3: chỉ hiện ô "Sắp có". */
export const UPCOMING_MEDALS = [
  { id: 'hagrid', name: 'Hagrid' },
  { id: 'sirius', name: 'Sirius' },
] as const

/** Loại lần làm tính cho Hermione: test thường (thiếu `kind`, vd mini test) và mọi loại app hiểu (test quay lại, O.W.L.). */
const HERMIONE_KINDS: readonly (string | undefined)[] = [undefined, ...KNOWN_ATTEMPT_KINDS]

export function hermioneCount(store: Store): number {
  return listAttempts(store).filter(
    (a) => !a.skipped && a.total > 0 && a.score === a.total && HERMIONE_KINDS.includes(a.kind),
  ).length
}

/** Lần làm `kind: 'owl'` có `passed: true` (story 14 ghi). */
export function dumbledoreCount(store: Store): number {
  return listAttempts(store).filter((a) => a.kind === 'owl' && a.passed === true).length
}

export function nevilleCount(store: Store): number {
  return comebackCount(readSessionDays(store))
}

export function levelFor(count: number): MedalLevel | null {
  let level: MedalLevel | null = null
  for (const l of MEDAL_LEVELS) if (count >= LEVEL_TARGETS[l]) level = l
  return level
}

export type MedalProgress = MedalDef & {
  count: number
  level: MedalLevel | null
  /** Cấp kế tiếp và số lần cần; null khi đã vàng. */
  next: { level: MedalLevel; target: number } | null
}

/** Cấp cao nhất của huy chương đã ghi trong `trophies.seen` (null nếu chưa báo cấp nào). */
function seenLevel(seen: Record<string, unknown>, id: MedalId): MedalLevel | null {
  let level: MedalLevel | null = null
  for (const l of MEDAL_LEVELS) if (isSeenEntry(seen[seenKey(id, l)])) level = l
  return level
}

const rank = (level: MedalLevel | null) => (level ? MEDAL_LEVELS.indexOf(level) : -1)

/**
 * Tiến độ từng huy chương. Cấp không bao giờ thấp hơn cấp đã báo trong `trophies.seen`
 * (vd đồng bộ lấp một ngày trống làm Neville giảm số lần thì vẫn giữ cấp đã nhận).
 */
export function medalProgress(store: Store): MedalProgress[] {
  const seen = readSeen(store)
  const counts: Record<MedalId, number> = {
    hermione: hermioneCount(store),
    dumbledore: dumbledoreCount(store),
    neville: nevilleCount(store),
  }
  return MEDALS.map((m) => {
    const count = counts[m.id]
    const earned = levelFor(count)
    const floor = seenLevel(seen, m.id)
    const level = rank(floor) > rank(earned) ? floor : earned
    const nextLevel = MEDAL_LEVELS.find((l) => rank(l) > rank(level))
    return { ...m, count, level, next: nextLevel ? { level: nextLevel, target: LEVEL_TARGETS[nextLevel] } : null }
  })
}

/** Một mục "đã báo": thời điểm báo lần đầu. Gộp giữa hai máy thì mục sớm hơn thắng. */
export type SeenEntry = { updatedAt: string }

export function isSeenEntry(value: unknown): value is SeenEntry {
  return isPlainObject(value) && isTimeString(value.updatedAt)
}

export function seenKey(id: MedalId, level: MedalLevel): string {
  return `${id}:${level}`
}

/** Đọc `trophies.seen`; thiếu hoặc sai dạng thì coi như rỗng (không sửa store). */
export function readSeen(store: Store): Record<string, unknown> {
  const trophies = store.data.trophies
  return isPlainObject(trophies) && isPlainObject(trophies.seen) ? trophies.seen : {}
}

export type LevelUp = { id: MedalId; name: string; level: MedalLevel; key: string }

/**
 * Cấp huy chương đã đạt mà máy chưa báo: mỗi huy chương lấy cấp cao nhất chưa báo
 * (vd lên thẳng bạc thì báo bạc một lần, không báo thêm đồng).
 */
export function unseenLevelUps(store: Store): LevelUp[] {
  const seen = readSeen(store)
  const out: LevelUp[] = []
  for (const m of medalProgress(store)) {
    if (!m.level) continue
    const key = seenKey(m.id, m.level)
    if (!isSeenEntry(seen[key])) out.push({ id: m.id, name: m.name, level: m.level, key })
  }
  return out
}

/**
 * Ghi đã báo cho các cấp đã đạt (kèm mọi cấp thấp hơn của cùng huy chương). Mục đã có thì giữ nguyên
 * (thời điểm báo đầu tiên). Không có gì mới thì trả về đúng store cũ.
 */
export function markSeen(store: Store, levelUps: readonly Pick<LevelUp, 'id' | 'level'>[], now: Date): Store {
  const seen = readSeen(store)
  const added: Record<string, SeenEntry> = {}
  for (const { id, level } of levelUps) {
    for (const l of MEDAL_LEVELS.slice(0, MEDAL_LEVELS.indexOf(level) + 1)) {
      const key = seenKey(id, l)
      if (!isSeenEntry(seen[key])) added[key] = { updatedAt: nextUpdatedAt(undefined, now) }
    }
  }
  if (Object.keys(added).length === 0) return store
  const trophies = isPlainObject(store.data.trophies) ? store.data.trophies : {}
  return { ...store, data: { ...store.data, trophies: { ...trophies, seen: { ...seen, ...added } } } }
}

/**
 * Huy chương "Lên tàu Năm 1" (story 26, `hp-theme.md`): xong cả 4 hàng của Sân ga 9¾ (học hết viên hoặc qua kiểm tra hàng),
 * tức `foundation.completedAt` có giá trị. Bỏ qua Sân ga thì chưa có; quay lại và xong thì có. Trao một lần, không cấp,
 * không nằm trong `MEDAL_IDS` (nên `medalProgress`, `unseenLevelUps`, cú đưa thư khi mở app không đổi).
 */
export const BOARDING_MEDAL = {
  id: 'board-year-1',
  name: 'Lên tàu Năm 1',
  condition: 'Xong cả 4 hàng của Sân ga 9¾',
} as const

/** Mục `trophies.seen` ghi "đã ăn mừng qua bức tường" (màn `/foundation/qua-buc-tuong` đã mở lần đầu). */
export const WALL_CELEBRATION_KEY = 'wall-passed'

export type BoardingMedal = {
  /** Đã xong cả 4 hàng (`completedAt` có giá trị). */
  earned: boolean
  /** Ngày qua bức tường lần đầu; null khi chưa. */
  earnedAt: string | null
  /** Đã đưa thư "Huy chương Lên tàu Năm 1" (mục `board-year-1` trong `trophies.seen`). */
  delivered: boolean
}

export function boardingMedal(store: Store): BoardingMedal {
  const { completedAt } = readFoundation(store)
  return { earned: completedAt !== null, earnedAt: completedAt, delivered: isSeenEntry(readSeen(store)[BOARDING_MEDAL.id]) }
}

/**
 * Điểm Nhà của store (story 26): `housePoints` theo nhật ký buổi học + 5 cho mỗi viên gạch có `firstDoneAt`
 * (`foundationState(store).doneBrickIds`). Hàng qua bằng kiểm tra không tạo mục viên nên không cộng. Phòng Cúp và màn
 * Qua bức tường dùng chung hàm này để không lệch nhau.
 */
export function storeHousePoints(store: Store): HousePointsWithBricks {
  return withBrickPoints(housePoints(readSessionDays(store)), foundationState(store).doneBrickIds.length)
}

/** Còn chờ ăn mừng: đã qua bức tường mà chưa có mục `wall-passed` (kể cả dữ liệu cũ có `completedAt` từ trước). */
export function isWallCelebrationPending(store: Store): boolean {
  return readFoundation(store).completedAt !== null && !isSeenEntry(readSeen(store)[WALL_CELEBRATION_KEY])
}

/**
 * Ghi "đã ăn mừng" và "đã đưa thư Lên tàu Năm 1" (2 mục `SeenEntry` còn thiếu; mục đã có giữ nguyên thời điểm đầu).
 * Chưa qua bức tường, hoặc đủ cả 2 mục rồi → trả về đúng store cũ. Gộp hai máy dùng `mergeSeen` (sớm hơn thắng).
 */
export function markWallCelebrated(store: Store, now: Date): Store {
  if (readFoundation(store).completedAt === null) return store
  const seen = readSeen(store)
  const added: Record<string, SeenEntry> = {}
  for (const key of [WALL_CELEBRATION_KEY, BOARDING_MEDAL.id]) {
    if (!isSeenEntry(seen[key])) added[key] = { updatedAt: nextUpdatedAt(undefined, now) }
  }
  if (Object.keys(added).length === 0) return store
  const trophies = isPlainObject(store.data.trophies) ? store.data.trophies : {}
  return { ...store, data: { ...store.data, trophies: { ...trophies, seen: { ...seen, ...added } } } }
}

/** Một lá thư của cú đưa thư: cấp huy chương (`LevelUp`) hoặc huy chương một lần không cấp (`level: null`). */
export type OwlLetter = { key: string; name: string; level: MedalLevel | null }

/** Thư "Huy chương Lên tàu Năm 1" (màn Qua bức tường). */
export const BOARDING_LETTER: OwlLetter = { key: BOARDING_MEDAL.id, name: BOARDING_MEDAL.name, level: null }
