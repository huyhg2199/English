import { isPlainObject, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Kết quả luyện nói (story 6): `store.data.pronunciation.items[sentenceId]` từ schema v7.
 * Chỉ lưu điểm (không lưu âm thanh hay chữ nhận dạng).
 */
export type PronunciationItem = {
  /** Điểm tốt nhất 0–100. */
  best: number
  /** Số lần đã chấm. */
  attempts: number
  updatedAt: string
}

export function isPronunciationItem(value: unknown): value is PronunciationItem {
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
  const p = store.data.pronunciation
  return isPlainObject(p) && isPlainObject(p.items) ? p.items : {}
}

/** Các câu đã chấm hợp lệ (mục sai dạng bị bỏ qua khi đọc, không bị xoá). */
export function readPronunciation(store: Store): Record<string, PronunciationItem> {
  const out: Record<string, PronunciationItem> = {}
  for (const [id, item] of Object.entries(rawItems(store))) if (isPronunciationItem(item)) out[id] = item
  return out
}

/** Ghi một lần chấm: `best` = max, `attempts` + 1, `updatedAt` không lùi. Điểm ngoài 0–100 bị chặn lại. */
export function recordAttempt(store: Store, sentenceId: string, score: number, now: Date): Store {
  const p = isPlainObject(store.data.pronunciation) ? store.data.pronunciation : {}
  const items = rawItems(store)
  const prev = items[sentenceId]
  const ok = isPronunciationItem(prev)
  const clamped = Math.min(100, Math.max(0, Math.round(Number.isFinite(score) ? score : 0)))
  const item: PronunciationItem = {
    best: Math.max(ok ? prev.best : 0, clamped),
    attempts: (ok ? prev.attempts : 0) + 1,
    updatedAt: nextUpdatedAt(ok ? prev.updatedAt : undefined, now),
  }
  return { ...store, data: { ...store.data, pronunciation: { ...p, items: { ...items, [sentenceId]: item } } } }
}

/**
 * Điểm chép chính tả (story 10) dùng chung `pronunciation` nhưng là điểm gõ, không phải điểm nói.
 * Id câu chính tả có dạng `<bài>-dict-<n>`.
 */
export function isDictationId(id: string): boolean {
  return /-dict-\d+$/.test(id)
}

/** Trung bình điểm tốt nhất của các câu NÓI đã thử (làm tròn, bỏ câu chép chính tả); chưa thử câu nào thì null. */
export function pronunciationAverage(store: Store): number | null {
  const tried = Object.entries(readPronunciation(store))
    .filter(([id, i]) => i.attempts > 0 && !isDictationId(id))
    .map(([, i]) => i)
  if (tried.length === 0) return null
  return Math.round(tried.reduce((sum, i) => sum + i.best, 0) / tried.length)
}

/** Mục tiêu phát âm trên bảng kỹ năng (giống ngưỡng O.W.L. 1). */
export const PRONUNCIATION_TARGET_PERCENT = 70
