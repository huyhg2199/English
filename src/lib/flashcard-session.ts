import { BRICK_IDS, type BrickId, type RuleCard } from '@/data/foundation'
import { lessonRuleCards } from '@/data/lessons'
import { allLessons } from '@/data/roadmap'
import { FUNCTION_WORD_GATES, functionWordGate, STARTER_WORD_IDS, type FunctionWordGate, type Word, type WordList } from '@/data/vocab'
import {
  foundationState,
  isBrickTaught,
  isGateOpen,
  isInFoundation,
  readFoundation,
  type FoundationGate,
} from '@/lib/foundation'
import { readStartLessonId } from '@/lib/placement/store'
import { computeRoadmapProgress, readCompletedLessonIds } from '@/lib/roadmap-progress'
import { customStudyWords, readSavedWords, savedCardId } from '@/lib/saved-words'
import { sessionLesson } from '@/lib/sessions'
import {
  buildSession,
  dueCardCount,
  isRuleCardId,
  lockedWordIds,
  NEW_PER_DAY,
  readCards,
  RULE_CARD_PREFIX,
  splitCloze,
  type ClozeParts,
  type RuleStudyWord,
  type Session,
} from '@/lib/srs'
import type { Store } from '@/lib/storage'

/** Số từ mới mỗi ngày khi đang ở Sân ga 9¾ (`learning-rules.md`, mục Từ vựng). */
export const NEW_WORDS_FOUNDATION = 5
/** Số từ mới mỗi ngày khi bài hiện tại thuộc tháng T1 (sau Sân ga). */
export const NEW_WORDS_T1 = 8
/** Hơn bấy nhiêu thẻ đến hạn thì hôm nay ôn kỹ, ít từ mới. */
export const HEAVY_REVIEW_THRESHOLD = 40
/** Số từ mới tối đa hôm tồn ôn. */
export const HEAVY_REVIEW_NEW_WORDS = 3

/**
 * Kế hoạch từ mới của phiên: quota hôm nay (trước khi trừ số từ đã giới thiệu), id lấy trước, id hư từ còn khoá và thẻ
 * quy tắc của các viên đã học xong (hai field sau thiếu thì rỗng).
 */
export type NewWordPlan = {
  newPerDay: number
  preferIds: readonly string[]
  lockedIds?: ReadonlySet<string>
  rules?: readonly RuleStudyWord[]
}

/**
 * Phiên ôn đầy đủ: từ NGSL/TSL + thẻ riêng từ Sổ tay (`customStudyWords`). Dùng chung cho trang flashcard,
 * phần SRS của buổi, ngày lười và dòng tóm tắt ở Luyện tập để các nơi đếm giống nhau. Luôn bật thẻ "Làm quen"
 * (`introMode`). Thiếu `plan` thì dùng `NEW_PER_DAY`, không có id ưu tiên, không khoá từ nào và không có thẻ quy tắc.
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
    lockedIds: plan?.lockedIds,
    rules: plan?.rules ?? [],
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
export function newPerDayFor(
  store: Store,
  now: Date,
  ruleCardsOf: (brickId: BrickId) => readonly RuleCard[] = () => [],
): { count: number; heavyReview: boolean } {
  const base = isInFoundation(store)
    ? NEW_WORDS_FOUNDATION
    : sessionLesson(store)?.lesson.monthId === 't1'
      ? NEW_WORDS_T1
      : NEW_PER_DAY
  const heavyReview = reviewableDueCount(store, now, ruleCardsOf) > HEAVY_REVIEW_THRESHOLD
  return { count: heavyReview ? Math.min(HEAVY_REVIEW_NEW_WORDS, base) : base, heavyReview }
}

const SAVED_CARD_PREFIX = savedCardId('')

/**
 * Thẻ đến hạn mà phiên ôn hiện là thẻ ôn (cùng tập với `buildStudySession`): bỏ thẻ riêng không còn mục lưu (mục đã xoá,
 * bỏ khỏi flashcard, hay mục trùng cụm) và thẻ quy tắc không còn trong danh sách thẻ quy tắc hiện tại (viên đổi nội dung,
 * id lạ). Thẻ đó không bao giờ hiện nên không ôn bớt được; đếm vào thì quota kẹt ở 3.
 */
function reviewableDueCount(store: Store, now: Date, ruleCardsOf: (brickId: BrickId) => readonly RuleCard[]): number {
  const srs = store.data.srs
  const shownCustom = new Set(customStudyWords(readSavedWords(store), readCards(srs)).map((w) => w.id))
  const shownRules = new Set(ruleStudyWords(store, ruleCardsOf).map((w) => w.id))
  return dueCardCount(srs, now, (id) => {
    if (id.startsWith(SAVED_CARD_PREFIX)) return shownCustom.has(id)
    if (isRuleCardId(id)) return shownRules.has(id)
    return true
  })
}

/**
 * Kế hoạch từ mới của phiên ôn lấy từ store (dùng trong `useNewWordOptions`): quota, tồn ôn, id lấy trước, id hư từ còn
 * khoá, thẻ quy tắc và cổng hiển thị.
 */
export type NewWordOptions = NewWordPlan & {
  heavyReview: boolean
  gates: FlashcardGates
  lockedIds: ReadonlySet<string>
  rules: readonly RuleStudyWord[]
}

export function newWordOptions(
  store: Store,
  now: Date,
  themeWordIdsOf: (brickId: BrickId) => readonly string[],
  ruleCardsOf: (brickId: BrickId) => readonly RuleCard[],
): NewWordOptions {
  const { count, heavyReview } = newPerDayFor(store, now, ruleCardsOf)
  return {
    newPerDay: count,
    heavyReview,
    preferIds: preferredNewWordIds(store, themeWordIdsOf),
    gates: flashcardGates(store),
    lockedIds: lockedNewWordIds(store),
    rules: ruleStudyWords(store, ruleCardsOf),
  }
}

/**
 * Id hư từ chưa được giới thiệu làm từ mới (`FUNCTION_WORD_GATES`, `learning-rules.md` mục Từ vựng):
 * - cổng viên: `isBrickTaught` (xong viên, hàng qua kiểm tra, hoặc đã bỏ qua Sân ga; không bao giờ đóng lại);
 * - cổng bài: bài đã xong hoặc bị bỏ qua khi Mũ Phân Loại xếp lớp (`computeRoadmapProgress`);
 * - `'wall'`: đã qua hoặc đã bỏ qua Sân ga (`completedAt` / `skippedAt`, không bao giờ xoá).
 * Bỏ đánh dấu bài thì từ chưa giới thiệu lại để dành; thẻ đã có không bị đụng tới.
 */
export function lockedNewWordIds(store: Store): Set<string> {
  const progress = computeRoadmapProgress(allLessons(), readCompletedLessonIds(store), readStartLessonId(store))
  const f = readFoundation(store)
  const wallOpen = (f.skippedAt ?? f.completedAt) !== null
  return lockedWordIds<FunctionWordGate>(FUNCTION_WORD_GATES, ({ opensAfter }) => {
    if (opensAfter === 'wall') return wallOpen
    if ('brick' in opensAfter) return isBrickTaught(store, opensAfter.brick)
    return progress.completed.has(opensAfter.lesson) || progress.skipped.has(opensAfter.lesson)
  })
}

/** Id SRS của thẻ quy tắc từ id nội dung: `f01-rule-2` → `rule:f01-2`; `past-to-be-rule-1` → `rule:past-to-be-1`. */
export function ruleCardId(rule: Pick<RuleCard, 'id'>): string {
  return RULE_CARD_PREFIX + rule.id.replace('-rule-', '-')
}

/**
 * Thẻ quy tắc vào phiên ôn:
 * - trước hết thẻ của các viên đã học xong (`firstDoneAt` có), theo F01 → F18 rồi theo thứ tự trong viên. Hàng qua bằng
 *   kiểm tra hay bỏ qua Sân ga thì không góp thẻ. Nội dung viên truyền vào qua `ruleCardsOf`;
 * - sau đó thẻ của thì trong các bài đã đánh dấu xong (`readCompletedLessonIds`, story 33), theo thứ tự lộ trình rồi thứ
 *   tự trong bài (`lessonRuleCards`). Bài bị bỏ qua khi xếp lớp thì không góp; bỏ đánh dấu thì thẻ không vào phiên (mục
 *   trong `srs.cards` giữ nguyên, đánh dấu lại thì lịch cũ chạy tiếp).
 */
export function ruleStudyWords(store: Store, ruleCardsOf: (brickId: BrickId) => readonly RuleCard[]): RuleStudyWord[] {
  const done = new Set(foundationState(store).doneBrickIds)
  const bricks = BRICK_IDS.filter((id) => done.has(id)).flatMap((id) =>
    ruleCardsOf(id).map((r) => ({
      id: ruleCardId(r),
      rule: true as const,
      word: r.answer,
      brickId: r.brickId,
      cloze: r.cloze,
      answer: r.answer,
      vi: r.vi,
    })),
  )
  const completed = new Set(readCompletedLessonIds(store))
  const lessons = allLessons()
    .filter((l) => completed.has(l.id))
    .flatMap(({ id: lessonId }) =>
      lessonRuleCards(lessonId).map((r) => ({
        id: ruleCardId(r),
        rule: true as const,
        word: r.answer,
        lessonId,
        cloze: r.cloze,
        answer: r.answer,
        vi: r.vi,
      })),
    )
  return [...bricks, ...lessons]
}

/**
 * Câu ví dụ của hư từ tách quanh chỗ trống (token đầu tiên trong `exampleEn` khớp một dạng bất kỳ trong `forms`; test dữ
 * liệu bảo đảm câu chỉ có một token như vậy). Không phải hư từ, hoặc câu không có dạng nào → null (thẻ hiện như thường).
 */
export function functionWordCloze(word: Pick<Word, 'id' | 'exampleEn'>): ClozeParts | null {
  const gate = functionWordGate(word.id)
  if (!gate || typeof word.exampleEn !== 'string') return null
  return splitCloze(word.exampleEn, gate.forms)
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
