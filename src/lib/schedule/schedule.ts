import { allLessons } from '@/data/roadmap'
import { readPlacement } from '@/lib/placement/store'
import { computeRoadmapProgress, readCompletedLessonIds } from '@/lib/roadmap-progress'
import { isSessionDay, readSessionDays } from '@/lib/sessions'
import type { Store } from '@/lib/storage'

/**
 * Lịch gốc, trễ và ngày dự kiến đạt 750 (story 11, CAP-5). Hàm thuần: thời gian qua `now`, ngày theo giờ máy.
 * Không phạt, không khoá: trễ chỉ làm mốc dự kiến lùi lại, tiến độ bài giữ nguyên.
 */

export const DAY_MS = 24 * 60 * 60 * 1000
/** Mỗi bài (tuần lộ trình) được 7 ngày; quá hạn hơn ngần ấy ngày nữa mới tính là trễ. */
export const WEEK_DAYS = 7

/** Nửa đêm (giờ máy) của ngày chứa `date`. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Cộng `days` ngày lịch (giờ máy, không lệch vì giờ mùa hè). */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Số ngày lịch từ `from` tới `to` (giờ máy; âm nếu `to` sớm hơn). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / DAY_MS)
}

/** `YYYY-MM-DD` → nửa đêm giờ máy của ngày đó; sai dạng → null. */
export function parseDayKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!m) return null
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

/** Các ngày có buổi học hợp lệ trong nhật ký, cũ → mới. */
export function sessionDates(store: Store): Date[] {
  return Object.entries(readSessionDays(store))
    .filter(([, entry]) => isSessionDay(entry))
    .map(([key]) => parseDayKey(key))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())
}

/**
 * Ngày bắt đầu lộ trình = ngày sớm nhất trong nhật ký buổi học (chưa có buổi nào thì là hôm nay); nếu bài bắt đầu
 * (Mũ Phân Loại) được áp dụng muộn hơn thì lấy ngày áp dụng (`placement.updatedAt`), để xếp lớp không làm trễ ngay.
 */
export function roadmapStartDate(store: Store, now: Date): Date {
  const first = sessionDates(store)[0] ?? startOfLocalDay(now)
  const placement = readPlacement(store)
  if (placement.startLessonId === null) return first
  const applied = startOfLocalDay(new Date(placement.updatedAt))
  return applied.getTime() > first.getTime() ? applied : first
}

/** Các bài của lộ trình tính từ bài bắt đầu (Mũ Phân Loại; thiếu / sai thì từ bài đầu). */
export function routeLessons(store: Store): readonly { id: string }[] {
  const lessons = allLessons()
  const startLessonId = readPlacement(store).startLessonId
  const startIndex = Math.max(0, startLessonId ? lessons.findIndex((l) => l.id === startLessonId) : 0)
  return lessons.slice(startIndex)
}

/**
 * Bài hiện tại = "học tiếp" của `computeRoadmapProgress` (giống Hôm nay / Lộ trình): bài chưa xong đầu tiên từ bài
 * bắt đầu; xong hết thì bài đã bỏ qua đầu tiên; null khi không còn bài nào.
 */
export function currentLessonId(store: Store): string | null {
  return computeRoadmapProgress(allLessons(), readCompletedLessonIds(store), readPlacement(store).startLessonId).nextLessonId
}

export type Plan = {
  /** Ngày bắt đầu lộ trình (nửa đêm giờ máy). */
  startDate: Date
  /** Mốc gốc đạt 750 = hạn của bài cuối lộ trình theo lịch gốc. */
  baselineGoal: Date
  /** Ngày dự kiến đạt 750 = mốc gốc + số tuần trễ (không bao giờ sớm hơn mốc gốc). */
  projectedGoal: Date
  /** Số tuần trễ (≥ 0). */
  weeksLate: number
  /** Bài hiện tại (`currentLessonId`); có thể là bài đã bỏ qua khi đã xong lộ trình từ bài bắt đầu. */
  currentLessonId: string | null
  /** Hạn của bài hiện tại theo lịch gốc; null khi đã xong lộ trình. */
  currentDue: Date | null
  /** Số bài chưa xong tính cả bài hiện tại. */
  remaining: number
  /** Đã xong mọi bài từ bài bắt đầu tới cuối lộ trình (mốc 750 đã tới, không còn trễ). */
  done: boolean
}

/**
 * Lịch gốc tính từ bài bắt đầu (Mũ Phân Loại, mặc định bài đầu): bài thứ k (0-based) hạn = ngày bắt đầu + 7 × (k + 1).
 *
 * Trễ: bài hiện tại đã quá hạn hơn 7 ngày mà chưa xong. Để học nhanh (xong trước bài sau) không bị tính trễ,
 * hạn dùng để đo là hạn "dồn": hạn của bài hiện tại nếu các bài còn lại được xếp sát mốc gốc
 * (= mốc gốc − 7 × (số bài còn lại − 1)); khi học tuần tự thì trùng hạn gốc của bài hiện tại.
 * Số tuần trễ = số tuần (làm tròn lên) của phần quá hạn vượt 7 ngày; ngày dự kiến = mốc gốc + 7 × số tuần trễ.
 * Ví dụ: bắt đầu 02/11, bài 1 hạn 09/11, hôm nay 17/11 (quá 8 ngày) → lùi 1 tuần.
 */
export function planFor(store: Store, now: Date): Plan {
  const route = routeLessons(store)
  const completed = new Set(readCompletedLessonIds(store))
  const startDate = roadmapStartDate(store, now)
  const today = startOfLocalDay(now)
  const baselineGoal = addDays(startDate, WEEK_DAYS * route.length)

  const currentIndex = route.findIndex((l) => !completed.has(l.id))
  if (currentIndex < 0) {
    return {
      startDate,
      baselineGoal,
      projectedGoal: baselineGoal,
      weeksLate: 0,
      currentLessonId: currentLessonId(store),
      currentDue: null,
      remaining: 0,
      done: true,
    }
  }
  const remaining = route.filter((l) => !completed.has(l.id)).length
  const effectiveDue = addDays(baselineGoal, -WEEK_DAYS * (remaining - 1))
  const overdue = daysBetween(effectiveDue, today)
  const weeksLate = overdue > WEEK_DAYS ? Math.ceil((overdue - WEEK_DAYS) / WEEK_DAYS) : 0
  return {
    startDate,
    baselineGoal,
    projectedGoal: addDays(baselineGoal, WEEK_DAYS * weeksLate),
    weeksLate,
    currentLessonId: currentLessonId(store),
    currentDue: addDays(startDate, WEEK_DAYS * (currentIndex + 1)),
    remaining,
    done: false,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** `dd/mm/yyyy`. */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

/** `mm/yyyy`. */
export function formatMonth(date: Date): string {
  return `${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

/** Nhãn trạng thái ngắn: "đúng hạn" / "lùi N tuần". */
export function planStatusLabel(plan: Plan): string {
  return plan.weeksLate > 0 ? `lùi ${plan.weeksLate} tuần` : 'đúng hạn'
}

/** Hệ quả bằng lời nhẹ nhàng, không cảnh báo. */
export function planConsequence(plan: Plan): string {
  if (plan.done) return 'Đã xong lộ trình. Sẵn sàng thì đăng ký thi thật thôi!'
  if (plan.weeksLate > 0) {
    const month = formatMonth(plan.projectedGoal)
    const moved =
      month === formatMonth(plan.baselineGoal)
        ? `Kỳ thi thật vẫn trong tháng ${month}, chỉ lùi ${plan.weeksLate} tuần`
        : `Kỳ thi thật dự kiến dời sang tháng ${month}`
    return `${moved}; không mất tiến độ nào. Học tiếp bài hiện tại là mốc tự dịch theo.`
  }
  return `Giữ nhịp này thì thi thật khoảng tháng ${formatMonth(plan.projectedGoal)}.`
}
