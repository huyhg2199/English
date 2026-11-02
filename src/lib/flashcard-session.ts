import type { Word, WordList } from '@/data/vocab'
import { customStudyWords } from '@/lib/saved-words'
import { buildSession, readCards, type Session } from '@/lib/srs'

/**
 * Phiên ôn đầy đủ: từ NGSL/TSL + thẻ riêng từ Sổ tay (`customStudyWords`). Dùng chung cho trang flashcard,
 * phần SRS của buổi và dòng tóm tắt ở Luyện tập để các nơi đếm giống nhau.
 */
export function buildStudySession(
  srs: unknown,
  words: readonly Word[],
  savedItems: Record<string, unknown>,
  now: Date,
  firstList: WordList = 'ngsl',
): Session {
  return buildSession(srs, words, now, undefined, firstList, customStudyWords(savedItems, readCards(srs)))
}

/** Dòng tóm tắt flashcard ở tab Luyện tập: "Xong hôm nay" chỉ khi không còn thẻ nào (kể cả thẻ riêng). */
export function flashcardSummary(session: Session): string {
  if (session.queue.length === 0) return 'Xong hôm nay'
  return `${session.dueCount} thẻ đến hạn · ${session.newCount} từ mới hôm nay`
}
