/** Chuỗi thời điểm parse được (ISO). */
export function isTimeString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

/**
 * `updatedAt` mới không bao giờ lùi: `max(giờ máy, updatedAt cũ + 1ms)`.
 * Đồng hồ máy chạy lùi (hoặc bản cũ do máy chạy nhanh ghi) thì lần sửa mới vẫn thắng khi gộp.
 * `previous` không phải thời điểm hợp lệ thì dùng giờ máy.
 */
export function nextUpdatedAt(previous: unknown, now: Date): string {
  const prev = isTimeString(previous) ? Date.parse(previous) : Number.NEGATIVE_INFINITY
  return new Date(Math.max(now.getTime(), prev + 1)).toISOString()
}
