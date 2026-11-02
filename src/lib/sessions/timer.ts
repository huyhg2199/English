/** Số giây còn lại của phần dài `minutes` phút, bắt đầu lúc `startedAt` (không âm). Chỉ để gợi ý, không ép. */
export function remainingSeconds(startedAt: Date, minutes: number, now: Date): number {
  return Math.max(0, Math.ceil((startedAt.getTime() + minutes * 60_000 - now.getTime()) / 1000))
}

/** `m:ss`. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
