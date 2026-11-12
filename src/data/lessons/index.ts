import { DAYS_T2_W1, DAYS_T2_W2, DAYS_T2_W3, DAYS_T2_W4, DAYS_T3_W1, DAYS_T3_W2, DAYS_T3_W3, DAYS_T4_W1 } from './grammar-days'
import { GRAMMAR_W1, GRAMMAR_W2, GRAMMAR_W3, GRAMMAR_W4 } from './t1-grammar'
import {
  PARTS_W1,
  PARTS_W2,
  PARTS_W3,
  PRONUNCIATION_W1,
  PRONUNCIATION_W2,
  PRONUNCIATION_W3,
  PRONUNCIATION_W4,
} from './t1-pronunciation'
import {
  GRAMMAR_T2_W1,
  GRAMMAR_T2_W2,
  GRAMMAR_T2_W3,
  GRAMMAR_T2_W4,
  GRAMMAR_T3_W1,
  GRAMMAR_T3_W2,
  GRAMMAR_T3_W3,
  GRAMMAR_T3_W4,
  GRAMMAR_T4_W1,
  GRAMMAR_T4_W3,
} from './t2-t4-grammar'
import {
  PRONUNCIATION_T2_W1,
  PRONUNCIATION_T2_W2,
  PRONUNCIATION_T2_W3,
  PRONUNCIATION_T2_W4,
  PRONUNCIATION_T3_W1,
  PRONUNCIATION_T3_W2,
  PRONUNCIATION_T3_W3,
  PRONUNCIATION_T3_W4,
  PRONUNCIATION_T4_W1,
  PRONUNCIATION_T4_W3,
  PRONUNCIATION_T4_W4,
} from './t2-t4-pronunciation'
import type { GrammarDay, GrammarView, LessonContent, PronunciationView, Tense, TenseChoice, TenseRuleCard } from './types'

export * from './types'
export { getSpell, SPELLS } from './spells'
export { IRREGULAR_VERB_CARDS, IRREGULAR_VERB_GROUPS, IRREGULAR_VERBS } from './irregular-verbs'
export {
  DONT_TRANSLATE,
  HAVE_TO_COULD_WOULD_LIKE,
  QUESTION_WORDS,
  SIMPLE_VS_CONTINUOUS,
  SUBJECT_QUESTIONS,
  WILL_VS_GOING_TO,
} from './tense-choices'

/** Bài có bảng động từ bất quy tắc; thẻ ôn V2 · V3 mở khi Huy tới bài này (story 38). */
export const IRREGULAR_VERBS_LESSON_ID = 's1-t2-w3'

const rp = (vi: string, topicEn: string, scenario: string) => ({ roleplay: { vi, topicEn, scenario } })

/**
 * Nội dung học của các bài đã soạn: chặng 1, T1 (story 6) và T2–T4 (story 10).
 * Tuần Tết chỉ có lời nhắc chạy ngày lười; tuần O.W.L. 1 chỉ có phần ôn tổng (bài thi ở story 14).
 * Bài T1 W1–W3 chia đoạn Phát âm thành phần (`parts`, story 28); 8 bài một thì T2–T4 chia đoạn Ngữ pháp theo ngày
 * (`grammarDays`, story 47).
 */
export const LESSON_CONTENTS: readonly LessonContent[] = [
  {
    lessonId: 's1-t1-w1',
    pronunciation: PRONUNCIATION_W1,
    parts: PARTS_W1,
    grammar: GRAMMAR_W1,
    ...rp('Làm quen lần đầu', 'Meeting someone new', 'We meet for the first time at a coffee shop. Ask me my name, where I am from, and what I like.'),
  },
  {
    lessonId: 's1-t1-w2',
    pronunciation: PRONUNCIATION_W2,
    parts: PARTS_W2,
    grammar: GRAMMAR_W2,
    ...rp('Một ngày của tôi', 'My daily routine', 'Ask me about my daily routine: what I do in the morning, in the afternoon and in the evening.'),
  },
  {
    lessonId: 's1-t1-w3',
    pronunciation: PRONUNCIATION_W3,
    parts: PARTS_W3,
    grammar: GRAMMAR_W3,
    ...rp('Bạn mới hỏi thói quen', 'Habits and likes', 'You are my new friend. Ask me yes/no questions about my habits and likes (food, music, sport).'),
  },
  {
    lessonId: 's1-t1-w4',
    pronunciation: PRONUNCIATION_W4,
    grammar: GRAMMAR_W4,
    ...rp('Nói chuyện về sở thích', 'Hobbies', 'Make small talk with me about my hobbies and what my friends and family like.'),
  },
  {
    lessonId: 's1-t2-w1',
    pronunciation: PRONUNCIATION_T2_W1,
    grammar: GRAMMAR_T2_W1,
    grammarDays: DAYS_T2_W1,
    ...rp('Gọi điện: bạn đang làm gì?', 'What are you doing now?', 'You call me on the phone. Ask me what I am doing right now and what the people around me are doing.'),
  },
  {
    lessonId: 's1-t2-w2',
    pronunciation: PRONUNCIATION_T2_W2,
    grammar: GRAMMAR_T2_W2,
    grammarDays: DAYS_T2_W2,
    ...rp('Kể việc hôm qua', 'Yesterday', 'Ask me what I did yesterday. Ask follow-up questions about each thing I did.'),
  },
  {
    lessonId: 's1-t2-w3',
    pronunciation: PRONUNCIATION_T2_W3,
    grammar: GRAMMAR_T2_W3,
    grammarDays: DAYS_T2_W3,
    ...rp('Kể chuyện cuối tuần trước', 'Last weekend', 'Ask me about last weekend: where I went, what I ate, who I met and what I bought.'),
  },
  {
    lessonId: 's1-t2-w4',
    pronunciation: PRONUNCIATION_T2_W4,
    grammar: GRAMMAR_T2_W4,
    grammarDays: DAYS_T2_W4,
    ...rp('Tháng vừa qua', 'Last month', 'Ask me about last month: my English study and one interesting thing that happened.'),
  },
  {
    lessonId: 's1-t3-w1',
    pronunciation: PRONUNCIATION_T3_W1,
    grammar: GRAMMAR_T3_W1,
    grammarDays: DAYS_T3_W1,
    ...rp('Dự đoán và lời hứa', 'Predictions and promises', 'Ask me about my predictions for next year. Then ask me for small favors so I can make promises with "I\'ll".'),
  },
  {
    lessonId: 's1-t3-w2',
    pronunciation: PRONUNCIATION_T3_W2,
    grammar: GRAMMAR_T3_W2,
    grammarDays: DAYS_T3_W2,
    ...rp('Kế hoạch Tết', 'Plans for Tet', 'Ask me about my plans for Tet (Vietnamese Lunar New Year): where I am going, who I am going to visit and what I am going to eat.'),
  },
  {
    lessonId: 's1-t3-w3',
    pronunciation: PRONUNCIATION_T3_W3,
    grammar: GRAMMAR_T3_W3,
    grammarDays: DAYS_T3_W3,
    ...rp('Trải nghiệm đã từng', 'Life experiences', 'Ask me about my experiences: places I have visited, foods I have tried and things I have never done.'),
  },
  {
    lessonId: 's1-t3-w4',
    pronunciation: PRONUNCIATION_T3_W4,
    grammar: GRAMMAR_T3_W4,
    ...rp('Bao lâu rồi, bắt đầu khi nào', 'How long and when', 'You are a new friend. Ask me how long I have lived in my city, how long I have had my hobbies, and when I started them.'),
  },
  {
    lessonId: 's1-t4-w1',
    pronunciation: PRONUNCIATION_T4_W1,
    grammar: GRAMMAR_T4_W1,
    grammarDays: DAYS_T4_W1,
    ...rp('Xin lời khuyên', 'Giving advice', 'I am visiting your city for the first time. Give me advice about what I can, should and must do there, and let me ask you for advice too.'),
  },
  {
    lessonId: 's1-t4-w2',
    lazyWeek: true,
    ...rp('Chuyện ngày Tết', 'Tet holiday', 'It is Tet (Vietnamese Lunar New Year). Chat with me about my family, the food and how I am spending the holiday. Keep it light and fun.'),
  },
  {
    lessonId: 's1-t4-w3',
    pronunciation: PRONUNCIATION_T4_W3,
    grammar: GRAMMAR_T4_W3,
    ...rp('So sánh hai chiếc điện thoại', 'Comparing two phones', 'You are a shop assistant. Help me compare two phones (price, camera, battery) and tell me where they are made.'),
  },
  {
    lessonId: 's1-t4-w4',
    pronunciation: PRONUNCIATION_T4_W4,
    ...rp('Ôn tổng chặng 1', 'Stage 1 review', 'Have a relaxed review conversation: ask me to introduce myself, talk about yesterday, my plans and my experiences.'),
  },
]

const byId = new Map(LESSON_CONTENTS.map((c) => [c.lessonId, c]))

export function getLessonContent(lessonId: string): LessonContent | undefined {
  return byId.get(lessonId)
}

const NO_PARTS: readonly string[] = []
const partIdsByLesson = new Map(
  LESSON_CONTENTS.map((c) => [c.lessonId, c.parts?.map((p) => p.id) ?? c.grammarDays?.map((d) => d.id) ?? NO_PARTS]),
)

/**
 * Id các phần của bài, theo thứ tự: phần của đoạn Phát âm (bài T1, story 28) hoặc ngày của đoạn Ngữ pháp (story 47); bài
 * không chia (hoặc id lạ) → `[]`. Buổi 30' học phần chưa xem đầu tiên; id lưu chung ở `progress.lessons[id].partsSeen`.
 */
export function lessonPartIds(lessonId: string): readonly string[] {
  return partIdsByLesson.get(lessonId) ?? NO_PARTS
}

/** Phần `partId` của bài là phần Phát âm (`parts`) hay ngày Ngữ pháp (`grammarDays`); không thuộc bài → null (story 47). */
export function lessonPartKind(lessonId: string, partId: string): 'pronunciation' | 'grammar' | null {
  const content = byId.get(lessonId)
  if (!content) return null
  if (content.parts?.some((p) => p.id === partId)) return 'pronunciation'
  if (content.grammarDays?.some((d) => d.id === partId)) return 'grammar'
  return null
}

/**
 * View của đoạn Phát âm và Ngữ pháp trong bước Bài chính của buổi 30' (story 28, 47): `partId` là phần Phát âm → đoạn Phát
 * âm chỉ hiện phần đó; là ngày Ngữ pháp → đoạn Ngữ pháp chỉ hiện ngày đó; không có (buổi ôn cả tuần, bài không chia) hay
 * không thuộc bài → cả đoạn. Đoạn Ngữ pháp trong buổi không bao giờ có danh sách "5 ngày của tuần" (chỉ ở trang bài).
 */
export function sessionSectionViews(
  lessonId: string,
  partId: string | null | undefined,
): { pronunciation: PronunciationView; grammar: GrammarView } {
  const kind = partId ? lessonPartKind(lessonId, partId) : null
  return {
    pronunciation: partId && kind === 'pronunciation' ? { kind: 'part', partId } : { kind: 'all' },
    grammar: partId && kind === 'grammar' ? { kind: 'day', dayId: partId } : { kind: 'week' },
  }
}

/** Ngày Ngữ pháp `dayId` của bài (story 47); không có → undefined. */
export function getGrammarDay(lessonId: string, dayId: string): GrammarDay | undefined {
  return byId.get(lessonId)?.grammarDays?.find((d) => d.id === dayId)
}

/** Mọi thì đã soạn, theo thứ tự bài. */
export function allTenses(): Tense[] {
  return LESSON_CONTENTS.flatMap((c) => c.grammar?.tenses ?? [])
}

export type TenseEntry = { lessonId: string; tense: Tense }

const TENSE_ENTRIES: readonly TenseEntry[] = LESSON_CONTENTS.flatMap((c) =>
  (c.grammar?.tenses ?? []).map((tense) => ({ lessonId: c.lessonId, tense })),
)

/**
 * Mọi thì đã soạn kèm bài chứa nó (Bản đồ thì, story 42): theo thứ tự `LESSON_CONTENTS` (thứ tự bài) rồi thứ tự thì trong
 * bài. Dựng một lần lúc nạp module. Khối "Chọn thì" không phải thì nên không có ở đây.
 */
export function tenseEntries(): readonly TenseEntry[] {
  return TENSE_ENTRIES
}

/** Mọi khối "Chọn thì" (story 39), theo thứ tự bài. */
export function allTenseChoices(): TenseChoice[] {
  return LESSON_CONTENTS.flatMap((c) => c.grammar?.choices ?? [])
}

const NO_RULE_CARDS: readonly TenseRuleCard[] = []
const ruleCardsByLesson = new Map(
  LESSON_CONTENTS.map((c) => [c.lessonId, (c.grammar?.tenses ?? []).flatMap((t) => t.ruleCards ?? [])] as const),
)

/**
 * Thẻ quy tắc của mọi thì trong bài (story 33), theo thứ tự thì rồi thứ tự thẻ; bài không có thẻ (hoặc id lạ) → `[]`.
 * Bài đánh dấu xong thì thẻ vào phiên ôn (`ruleStudyWords`), id SRS `rule:<tenseId>-n`.
 */
export function lessonRuleCards(lessonId: string): readonly TenseRuleCard[] {
  const cards = ruleCardsByLesson.get(lessonId)
  return cards && cards.length > 0 ? cards : NO_RULE_CARDS
}
