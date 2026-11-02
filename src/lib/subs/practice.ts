import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

import { fillPercent } from './blanks'

/**
 * Kết quả chế độ "Điền từ" theo video (story 16): `store.data.videoPractice.items[videoId]` từ schema v12, đồng bộ.
 * Đợt 3 dùng `best` cho thang trượt tự lên cấp sub.
 */
export type VideoPracticeItem = {
  /** % câu đúng tốt nhất 0–100. */
  best: number
  /** Số lượt đã làm. */
  attempts: number
  updatedAt: string
}

export function isVideoPracticeItem(value: unknown): value is VideoPracticeItem {
  return (
    isPlainObject(value) &&
    typeof value.best === 'number' &&
    Number.isFinite(value.best) &&
    value.best >= 0 &&
    value.best <= 100 &&
    Number.isInteger(value.attempts) &&
    (value.attempts as number) >= 0 &&
    isTimeString(value.updatedAt)
  )
}

function rawItems(store: Store): Record<string, unknown> {
  const p = store.data.videoPractice
  return isPlainObject(p) && isPlainObject(p.items) ? p.items : {}
}

/** Các video đã luyện hợp lệ (mục sai dạng bị bỏ qua khi đọc, không bị xoá). */
export function readVideoPractice(store: Store): Record<string, VideoPracticeItem> {
  const out: Record<string, VideoPracticeItem> = {}
  for (const [id, item] of Object.entries(rawItems(store))) if (isVideoPracticeItem(item)) out[id] = item
  return out
}

/**
 * Ghi một lượt điền từ (`correct`/`total` câu): `best` = max, `attempts` + 1, `updatedAt` không lùi.
 * `total` ≤ 0 (chưa làm câu nào) → trả về đúng store cũ.
 */
export function recordVideoPractice(store: Store, videoId: string, correct: number, total: number, now: Date): Store {
  if (!(total > 0)) return store
  const p = isPlainObject(store.data.videoPractice) ? store.data.videoPractice : {}
  const items = rawItems(store)
  const prev = items[videoId]
  const ok = isVideoPracticeItem(prev)
  const item: VideoPracticeItem = {
    best: Math.max(ok ? prev.best : 0, fillPercent(correct, total)),
    attempts: (ok ? prev.attempts : 0) + 1,
    updatedAt: nextUpdatedAt(ok ? prev.updatedAt : undefined, now),
  }
  return { ...store, data: { ...store.data, videoPractice: { ...p, items: { ...items, [videoId]: item } } } }
}

/** Một lượt điền từ chỉ được ghi khi đã trả lời ít nhất chừng này câu… */
export const MIN_RUN_ANSWERS = 5
/** …hoặc ít nhất tỉ lệ này số câu có từ ẩn của video (video ngắn). */
export const MIN_RUN_SHARE = 0.5

/** Lượt đã đủ dài để ghi chưa (tránh 1 câu đúng = 100%). */
export function shouldRecordRun(answered: number, blankCues: number): boolean {
  if (!(answered > 0)) return false
  return answered >= MIN_RUN_ANSWERS || (blankCues > 0 && answered >= blankCues * MIN_RUN_SHARE)
}
