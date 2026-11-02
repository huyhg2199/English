import type { SubCue } from './types'

/**
 * Vị trí cue đang phát ở thời điểm `t` (giây): cue có `start ≤ t < end`; khoảng lặng / ngoài video → -1.
 * `cues` tăng dần, không chồng nhau (kiểm ở test dữ liệu) nên tìm nhị phân.
 */
export function cueAt(cues: readonly Pick<SubCue, 'start' | 'end'>[], t: number | null): number {
  if (t === null || !Number.isFinite(t)) return -1
  let lo = 0
  let hi = cues.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const c = cues[mid]
    if (t < c.start) hi = mid - 1
    else if (t >= c.end) lo = mid + 1
    else return mid
  }
  return -1
}

/** Dừng sớm hơn `end` chừng này (giây) vì player chỉ được đọc ~4 lần/giây. */
export const FILL_PAUSE_LEAD = 0.25
/** Tốc độ phát tối đa được coi là phát liền (YouTube cho tới 2×). */
export const MAX_PLAY_RATE = 2
/** Sai số (giây) giữa thời gian video và thời gian thật trước khi coi là tua. */
export const SEEK_TOLERANCE = 0.75

const markOf = (c: Pick<SubCue, 'start' | 'end'>) => Math.max(c.start, c.end - FILL_PAUSE_LEAD)

/** Vị trí cue đầu tiên chưa tới mốc dừng ở thời điểm `t`. */
function firstAfter(cues: readonly Pick<SubCue, 'start' | 'end'>[], t: number): number {
  let i = 0
  while (i < cues.length && markOf(cues[i]) <= t) i++
  return i
}

/**
 * Chế độ điền từ. `cursor` là vị trí cue kế tiếp chưa xét (giữ giữa các lần đọc). Giữa hai lần đọc `prevT` → `t`
 * (cách nhau `elapsed` giây thật): phát liền thì trả về MỌI cue có từ ẩn vừa phát hết (theo thứ tự, để xếp hàng hỏi),
 * kể cả khi lần đọc bị trễ hay hai cue ngắn hết trong một nhịp. Lùi lại, hoặc nhảy xa hơn thời gian thật cho phép → tua:
 * không hỏi cue bị nhảy qua, `cursor` dời tới sau `t`. Cue đã hỏi (`asked`) không hỏi lại.
 */
export function fillDue(
  cues: readonly Pick<SubCue, 'start' | 'end'>[],
  hasBlanks: (index: number) => boolean,
  prevT: number | null,
  t: number | null,
  elapsed: number,
  cursor: number,
  asked: ReadonlySet<number>,
): { due: number[]; cursor: number } {
  if (t === null || !Number.isFinite(t)) return { due: [], cursor }
  if (prevT === null || !Number.isFinite(prevT)) return { due: [], cursor: firstAfter(cues, t) }
  const step = t - prevT
  const seek = step < -0.05 || step > Math.max(0, elapsed) * MAX_PLAY_RATE + SEEK_TOLERANCE
  if (seek) return { due: [], cursor: firstAfter(cues, t) }
  const due: number[] = []
  let i = Math.max(0, cursor)
  while (i < cues.length && markOf(cues[i]) <= t) {
    if (hasBlanks(i) && !asked.has(i)) due.push(i)
    i++
  }
  return { due, cursor: i }
}

/** `75.4` → `"1:15"`. */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
