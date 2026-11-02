import { isSessionDay, localDayKey, type SessionDay } from '@/lib/sessions'

/**
 * Điểm Nhà và chuỗi ngày (story 12). Hàm thuần, tính lại từ nhật ký `sessions.days` (không lưu riêng).
 * Ngày theo giờ máy (`YYYY-MM-DD`); key ngày hoặc mục nhật ký sai dạng thì bỏ qua.
 */

/** Điểm mỗi ngày: buổi chuẩn +10, ngày lười +5. */
export const DAY_POINTS = { full: 10, lazy: 5 } as const
/** Mỗi lần chuỗi chạm 7, 14, 21… ngày liên tiếp thưởng thêm. */
export const STREAK_BONUS = 20
export const STREAK_BONUS_EVERY = 7

const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/

/** Số thứ tự ngày (theo lịch, không lệch vì giờ mùa hè) của key `YYYY-MM-DD`; key sai dạng → null. */
export function dayNumber(key: string): number | null {
  const m = DAY_KEY.exec(key)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  // Key phải là ngày có thật (vd không có 2026-02-30).
  if (localDayKey(new Date(y, mo - 1, d)) !== key) return null
  return Math.round(Date.UTC(y, mo - 1, d) / 86_400_000)
}

export type StudyDay = { key: string; day: number; entry: SessionDay }

/** Các ngày có buổi học hợp lệ, cũ → mới. */
export function studyDays(days: Record<string, unknown>): StudyDay[] {
  const out: StudyDay[] = []
  for (const [key, entry] of Object.entries(days)) {
    const day = dayNumber(key)
    if (day !== null && isSessionDay(entry)) out.push({ key, day, entry })
  }
  return out.sort((a, b) => a.day - b.day)
}

export type HousePoints = { total: number; base: number; bonus: number; bonusCount: number }

/** Điểm Nhà: tổng điểm từng ngày + thưởng mỗi lần chuỗi liên tiếp chạm bội số của 7. Không bao giờ trừ. */
export function housePoints(days: Record<string, unknown>): HousePoints {
  let base = 0
  let bonusCount = 0
  let run = 0
  let prev: number | null = null
  for (const { day, entry } of studyDays(days)) {
    base += DAY_POINTS[entry.kind]
    run = prev !== null && day - prev === 1 ? run + 1 : 1
    if (run % STREAK_BONUS_EVERY === 0) bonusCount++
    prev = day
  }
  const bonus = bonusCount * STREAK_BONUS
  return { total: base + bonus, base, bonus, bonusCount }
}

/** Chuỗi dài nhất từng có (số ngày liên tiếp có buổi học, chuẩn hoặc lười). */
export function longestStreak(days: Record<string, unknown>): number {
  let best = 0
  let run = 0
  let prev: number | null = null
  for (const { day } of studyDays(days)) {
    run = prev !== null && day - prev === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = day
  }
  return best
}

/** Số lần quay lại học sau khi gãy chuỗi: ngày có buổi mà ngày có buổi trước đó cách ≥ 2 ngày. */
export function comebackCount(days: Record<string, unknown>): number {
  let count = 0
  let prev: number | null = null
  for (const { day } of studyDays(days)) {
    if (prev !== null && day - prev >= 2) count++
    prev = day
  }
  return count
}
