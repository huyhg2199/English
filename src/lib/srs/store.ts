import { isPlainObject, type Store } from '@/lib/storage'

import { markKnown, readCards, review, type Grade, type SrsCard } from './srs'

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
