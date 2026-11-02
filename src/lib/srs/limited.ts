import type { SessionItem } from './srs'

/** Một lần chấm trong phiên: từ nào, lúc chấm thẻ thuộc loại gì. */
export type ReviewedItem = { wordId: string; kind: SessionItem['kind'] }

export type LimitedProgress = {
  /** Thẻ kế tiếp; undefined khi xong. */
  current: SessionItem | undefined
  /** Số từ khác nhau đã tính (chỉ từ mới khi `preferNew`). */
  count: number
  /** Xong: đủ `limit` hoặc hết thẻ. */
  done: boolean
  /** Xong vì đủ `limit` (không phải vì hết thẻ). */
  limitReached: boolean
}

/** Thứ tự hiện: `preferNew` thì từ mới lên đầu, còn lại giữ nguyên thứ tự. */
export function orderQueue(queue: readonly SessionItem[], preferNew: boolean): SessionItem[] {
  if (!preferNew) return [...queue]
  return [...queue.filter((i) => i.kind === 'new'), ...queue.filter((i) => i.kind !== 'new')]
}

/**
 * Tiến độ phiên có giới hạn (ngày lười offline: 3 từ mới). Đếm số từ khác nhau đã chấm
 * (khi `preferNew` và còn từ mới thì chỉ đếm từ chấm lúc còn là từ mới), nên một từ chấm 3 lần vẫn chỉ là 1.
 * Xong khi đủ `limit` hoặc hàng đợi rỗng. Không có `limit` thì chỉ xong khi hết thẻ.
 */
export function limitedProgress(
  queue: readonly SessionItem[],
  reviewed: readonly ReviewedItem[],
  opts: { limit?: number; preferNew?: boolean } = {},
): LimitedProgress {
  const preferNew = opts.preferNew ?? false
  const ordered = orderQueue(queue, preferNew)
  // Hết từ mới (đã dùng hết quota hôm nay) thì thẻ ôn khác nhau cũng được tính, để không phải ôn hết hàng đợi.
  const newLeft = ordered.some((i) => i.kind === 'new')
  const counted = preferNew && newLeft ? reviewed.filter((r) => r.kind === 'new') : reviewed
  const count = new Set(counted.map((r) => r.wordId)).size
  const limitReached = opts.limit !== undefined && count >= opts.limit
  const current = limitReached ? undefined : ordered[0]
  return { current, count, done: current === undefined, limitReached }
}
