import type { BrickId } from '@/data/foundation'
import { STARTER_WORD_IDS, type Word, type WordList } from '@/data/vocab'
import { foundationState, isGateOpen, isInFoundation, readFoundation, type FoundationGate } from '@/lib/foundation'
import { customStudyWords, readSavedWords, savedCardId } from '@/lib/saved-words'
import { sessionLesson } from '@/lib/sessions'
import { buildSession, dueCardCount, NEW_PER_DAY, readCards, type Session } from '@/lib/srs'
import type { Store } from '@/lib/storage'

/** Số từ mới mỗi ngày khi đang ở Sân ga 9¾ (`learning-rules.md`, mục Từ vựng). */
export const NEW_WORDS_FOUNDATION = 5
/** Số từ mới mỗi ngày khi bài hiện tại thuộc tháng T1 (sau Sân ga). */
export const NEW_WORDS_T1 = 8
/** Hơn bấy nhiêu thẻ đến hạn thì hôm nay ôn kỹ, ít từ mới. */
export const HEAVY_REVIEW_THRESHOLD = 40
/** Số từ mới tối đa hôm tồn ôn. */
export const HEAVY_REVIEW_NEW_WORDS = 3

/** Kế hoạch từ mới của phiên: quota hôm nay (trước khi trừ số từ đã giới thiệu) và id lấy trước. */
export type NewWordPlan = { newPerDay: number; preferIds: readonly string[] }

/**
 * Phiên ôn đầy đủ: từ NGSL/TSL + thẻ riêng từ Sổ tay (`customStudyWords`). Dùng chung cho trang flashcard,
 * phần SRS của buổi, ngày lười và dòng tóm tắt ở Luyện tập để các nơi đếm giống nhau. Luôn bật thẻ "Làm quen"
 * (`introMode`). Thiếu `plan` thì dùng `NEW_PER_DAY` và không có id ưu tiên.
 */
export function buildStudySession(
  srs: unknown,
  words: readonly Word[],
  savedItems: Record<string, unknown>,
  now: Date,
  firstList: WordList = 'ngsl',
  plan?: NewWordPlan,
): Session {
  return buildSession(srs, words, now, {
    newPerDay: plan?.newPerDay ?? NEW_PER_DAY,
    firstList,
    custom: customStudyWords(savedItems, readCards(srs)),
    preferIds: plan?.preferIds ?? [],
    introMode: true,
  })
}

/** Dòng tóm tắt flashcard ở tab Luyện tập: "Xong hôm nay" chỉ khi không còn thẻ nào (kể cả thẻ riêng). */
export function flashcardSummary(session: Session): string {
  if (session.queue.length === 0) return 'Xong hôm nay'
  return `${session.dueCount} thẻ đến hạn · ${session.newCount} từ mới hôm nay`
}

/**
 * Số từ mới hôm nay (`learning-rules.md`, mục Từ vựng): 5 khi đang ở Sân ga, 8 khi bài hiện tại thuộc tháng T1, còn lại
 * (kể cả đã xong lộ trình) 10. Hơn `HEAVY_REVIEW_THRESHOLD` thẻ đến hạn lúc `now` thì tối đa 3 và `heavyReview` (lời nhắn
 * nhẹ, không phạt). Tính lại theo `now` mỗi lần: ôn bớt xuống còn ≤ 40 thẻ thì quota trở lại bình thường.
 */
export function newPerDayFor(store: Store, now: Date): { count: number; heavyReview: boolean } {
  const base = isInFoundation(store)
    ? NEW_WORDS_FOUNDATION
    : sessionLesson(store)?.lesson.monthId === 't1'
      ? NEW_WORDS_T1
      : NEW_PER_DAY
  const heavyReview = reviewableDueCount(store, now) > HEAVY_REVIEW_THRESHOLD
  return { count: heavyReview ? Math.min(HEAVY_REVIEW_NEW_WORDS, base) : base, heavyReview }
}

const SAVED_CARD_PREFIX = savedCardId('')

/**
 * Thẻ đến hạn mà phiên ôn hiện là thẻ ôn (cùng tập với `buildStudySession`): bỏ thẻ riêng không còn mục lưu (mục đã xoá,
 * bỏ khỏi flashcard, hay mục trùng cụm). Thẻ đó không bao giờ hiện nên không ôn bớt được; đếm vào thì quota kẹt ở 3.
 */
function reviewableDueCount(store: Store, now: Date): number {
  const srs = store.data.srs
  const shownCustom = new Set(customStudyWords(readSavedWords(store), readCards(srs)).map((w) => w.id))
  return dueCardCount(srs, now, (id) => !id.startsWith(SAVED_CARD_PREFIX) || shownCustom.has(id))
}

/** Kế hoạch từ mới của phiên ôn lấy từ store (dùng trong `useNewWordOptions`): quota, tồn ôn, id lấy trước, cổng hiển thị. */
export type NewWordOptions = NewWordPlan & { heavyReview: boolean; gates: FlashcardGates }

export function newWordOptions(
  store: Store,
  now: Date,
  themeWordIdsOf: (brickId: BrickId) => readonly string[],
): NewWordOptions {
  const { count, heavyReview } = newPerDayFor(store, now)
  return { newPerDay: count, heavyReview, preferIds: preferredNewWordIds(store, themeWordIdsOf), gates: flashcardGates(store) }
}

/**
 * Id từ mới lấy trước: từ chủ đề của các viên đã xong (viên `lastDoneAt` muộn nhất trước; bằng nhau theo F01 → F18),
 * rồi `STARTER_WORD_IDS`, bỏ trùng. Viên chỉ qua bằng kiểm tra hàng (chưa học) không góp từ. Nội dung viên truyền vào qua
 * `themeWordIdsOf` để lib không import `@/data/foundation/content`.
 */
export function preferredNewWordIds(store: Store, themeWordIdsOf: (brickId: BrickId) => readonly string[]): string[] {
  const { bricks } = readFoundation(store)
  const lastDone = (id: BrickId) => Date.parse(bricks[id]?.lastDoneAt ?? '') || 0
  // `doneBrickIds` theo F01 → F18; sort ổn định nên bằng nhau thì giữ thứ tự đó.
  const done = [...foundationState(store).doneBrickIds].sort((a, b) => lastDone(b) - lastDone(a))
  const ids = new Set<string>()
  for (const id of done) for (const wordId of themeWordIdsOf(id)) ids.add(wordId)
  for (const wordId of STARTER_WORD_IDS) ids.add(wordId)
  return [...ids]
}

/** Cổng hiển thị trên thẻ từ: IPA (sau F03), âm tiết + trọng âm (sau F04), nhãn từ loại (sau F07). */
export type FlashcardGates = Record<FoundationGate, boolean>

export function flashcardGates(store: Store): FlashcardGates {
  return { ipa: isGateOpen(store, 'ipa'), stress: isGateOpen(store, 'stress'), pos: isGateOpen(store, 'pos') }
}

/** Nhãn hạng trên thẻ: "Từ phổ biến #n" (NGSL), "Từ TOEIC #n" (TSL). */
export function rankLabel(word: Pick<Word, 'list' | 'rank'>): string {
  return `${word.list === 'tsl' ? 'Từ TOEIC' : 'Từ phổ biến'} #${word.rank}`
}
