import { isPlainObject, type Store } from '@/lib/storage'

import { addedCard, isSrsCard, markKnown, readCards, review, type Grade, type SrsCard } from './srs'

/** Đọc `store.data.srs` (thiếu / sai dạng → rỗng). */
export function readSrs(store: Store): { cards: Record<string, unknown> } {
  return { cards: readCards(store.data.srs) }
}

/** Ghi một thẻ; giữ nguyên các thẻ khác (kể cả thẻ sai dạng) và các field khác của `srs`. */
function writeCard(store: Store, wordId: string, update: (previous: unknown) => SrsCard): Store {
  const srs = isPlainObject(store.data.srs) ? store.data.srs : {}
  const cards = readCards(store.data.srs)
  const card = update(cards[wordId])
  return { ...store, data: { ...store.data, srs: { ...srs, cards: { ...cards, [wordId]: card } } } }
}

export function gradeCard(store: Store, wordId: string, grade: Grade, now: Date = new Date()): Store {
  return writeCard(store, wordId, (previous) => review(previous, grade, now))
}

export function markCardKnown(store: Store, wordId: string, now: Date = new Date()): Store {
  return writeCard(store, wordId, (previous) => markKnown(previous, now))
}

/**
 * Thêm thẻ do Huy tự thêm từ Sổ tay (`added`, không tính quota). Đã có thẻ hợp lệ thì không đổi lịch,
 * trả về đúng store cũ; mục sai dạng thì ghi đè bằng thẻ mới (không thì thẻ không bao giờ hiện).
 */
export function addCard(store: Store, cardId: string, now: Date = new Date()): Store {
  if (isSrsCard(readCards(store.data.srs)[cardId])) return store
  return writeCard(store, cardId, (previous) => addedCard(now, previous))
}
