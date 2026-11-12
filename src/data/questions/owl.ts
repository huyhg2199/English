import type { RequiredConcept } from './concepts'
import type { ChoiceQuestion, Question, TypedQuestion, TypedQuestionKind } from './types'

/**
 * Kho câu riêng của phần Thì O.W.L. 1 (story 40). Không nằm trong `QUESTION_BANK`, không vào `QUIZZES`: chỉ
 * `pickOwlTenses` (`@/lib/owl`) bốc đề từ đây; `getQuestion` vẫn tra được (Sổ lỗi, kế hoạch ôn, "Vì sao sai?").
 * Câu tự soạn (không chép sách, British Council hay web có bản quyền), không trùng đề với câu quiz, câu Sân ga, câu luyện
 * hay thẻ quy tắc nào, chỉ dùng chữ trong phạm vi chặng 1 (`outOfScopeWords('passive-present', …)`).
 *
 * 42 câu: `q-owl-01` … `q-owl-30` là câu riêng của 10 chủ điểm (3 câu liền nhau mỗi chủ điểm theo thứ tự `OWL_TOPICS`:
 * chọn, gõ dạng đúng, biến đổi / dịch); `q-owl-31` … `q-owl-42` là câu của 4 cặp thì dễ nhầm (3 câu mỗi cặp theo thứ tự
 * `OWL_CONTRASTS`: 2 câu chọn có dạng của cả hai thì, 1 câu gõ). Câu cặp tính cho chủ điểm của đáp án (`topicId`).
 */

/** 10 chủ điểm thì của chặng 1, đúng thứ tự bảng "Mỗi thì một dòng" (s1-t4-w4, story 39). */
export const OWL_TOPICS = [
  { id: 'to-be', name: 'to be hiện tại', lessonIds: ['s1-t1-w1'] },
  { id: 'present-simple', name: 'Hiện tại đơn', lessonIds: ['s1-t1-w2', 's1-t1-w3'] },
  { id: 'present-continuous', name: 'Hiện tại tiếp diễn', lessonIds: ['s1-t2-w1'] },
  { id: 'past-to-be', name: 'to be quá khứ', lessonIds: ['s1-t2-w2'] },
  { id: 'past-simple', name: 'Quá khứ đơn', lessonIds: ['s1-t2-w2', 's1-t2-w3'] },
  { id: 'will', name: 'Tương lai will', lessonIds: ['s1-t3-w1'] },
  { id: 'going-to', name: 'be going to', lessonIds: ['s1-t3-w2'] },
  { id: 'present-perfect', name: 'Hiện tại hoàn thành', lessonIds: ['s1-t3-w3', 's1-t3-w4'] },
  { id: 'modals', name: 'can / should / must', lessonIds: ['s1-t4-w1'] },
  { id: 'passive-present', name: 'Bị động hiện tại', lessonIds: ['s1-t4-w3'] },
] as const

export type OwlTopicId = (typeof OWL_TOPICS)[number]['id']
export type OwlTopic = (typeof OWL_TOPICS)[number]

/** 4 cặp thì dễ nhầm: mỗi cặp 3 câu (2 chọn, 1 gõ), câu của cặp gắn bài `lessonId`. */
export const OWL_CONTRASTS = [
  { id: 'simple-continuous', topics: ['present-simple', 'present-continuous'], lessonId: 's1-t2-w1' },
  { id: 'was-did', topics: ['past-to-be', 'past-simple'], lessonId: 's1-t2-w2' },
  { id: 'will-going-to', topics: ['will', 'going-to'], lessonId: 's1-t3-w2' },
  { id: 'past-perfect', topics: ['past-simple', 'present-perfect'], lessonId: 's1-t3-w4' },
] as const satisfies readonly { id: string; topics: readonly [OwlTopicId, OwlTopicId]; lessonId: string }[]

export type OwlContrastId = (typeof OWL_CONTRASTS)[number]['id']
export type OwlContrast = (typeof OWL_CONTRASTS)[number]

/** Câu của kho O.W.L.: chủ điểm của đáp án, và cặp dễ nhầm nếu là câu cặp. */
export type OwlQuestion = Question & { topicId: OwlTopicId; contrastId?: OwlContrastId }

type Meta = { topicId: OwlTopicId; contrastId?: OwlContrastId; lessonId: string }

const id = (n: number) => `q-owl-${String(n).padStart(2, '0')}`

/** Câu chọn: lựa chọn đầu tiên là đáp án (khi làm bài, lựa chọn được xáo). */
function choice(
  n: number,
  meta: Meta,
  prompt: string,
  options: readonly [string, string, string, string],
  explanation: string,
  requires: readonly RequiredConcept[],
): OwlQuestion {
  const q: ChoiceQuestion = {
    id: id(n),
    lessonId: meta.lessonId,
    sectionId: 'grammar',
    tag: 'thì',
    kind: 'choice',
    prompt,
    options,
    answer: options[0],
    explanation,
    requires,
  }
  return { ...q, topicId: meta.topicId, ...(meta.contrastId ? { contrastId: meta.contrastId } : {}) }
}

/** Câu gõ (`type` / `transform`); `accept` là cách viết khác cũng đúng. */
function typed(
  kind: TypedQuestionKind,
  n: number,
  meta: Meta,
  prompt: string,
  answer: string,
  explanation: string,
  requires: readonly RequiredConcept[],
  accept?: readonly string[],
): OwlQuestion {
  const q: TypedQuestion = {
    id: id(n),
    lessonId: meta.lessonId,
    sectionId: 'grammar',
    tag: 'thì',
    kind,
    prompt,
    answer,
    explanation,
    requires,
    ...(accept && accept.length > 0 ? { accept } : {}),
  }
  return { ...q, topicId: meta.topicId, ...(meta.contrastId ? { contrastId: meta.contrastId } : {}) }
}

const type = (...args: Parameters<typeof typed> extends [unknown, ...infer R] ? R : never) => typed('type', ...args)
const transform = (...args: Parameters<typeof typed> extends [unknown, ...infer R] ? R : never) => typed('transform', ...args)

const TO_BE: Meta = { topicId: 'to-be', lessonId: 's1-t1-w1' }
const SIMPLE_W2: Meta = { topicId: 'present-simple', lessonId: 's1-t1-w2' }
const SIMPLE_W3: Meta = { topicId: 'present-simple', lessonId: 's1-t1-w3' }
const CONTINUOUS: Meta = { topicId: 'present-continuous', lessonId: 's1-t2-w1' }
const PAST_BE: Meta = { topicId: 'past-to-be', lessonId: 's1-t2-w2' }
const PAST_W2: Meta = { topicId: 'past-simple', lessonId: 's1-t2-w2' }
const PAST_W3: Meta = { topicId: 'past-simple', lessonId: 's1-t2-w3' }
const WILL: Meta = { topicId: 'will', lessonId: 's1-t3-w1' }
const GOING_TO: Meta = { topicId: 'going-to', lessonId: 's1-t3-w2' }
const PERFECT_W3: Meta = { topicId: 'present-perfect', lessonId: 's1-t3-w3' }
const PERFECT_W4: Meta = { topicId: 'present-perfect', lessonId: 's1-t3-w4' }
const MODALS: Meta = { topicId: 'modals', lessonId: 's1-t4-w1' }
const PASSIVE: Meta = { topicId: 'passive-present', lessonId: 's1-t4-w3' }

/** Câu của một cặp dễ nhầm, tính cho chủ điểm `topicId` của đáp án. */
const pair = (contrastId: OwlContrastId, topicId: OwlTopicId): Meta => ({
  topicId,
  contrastId,
  lessonId: OWL_CONTRASTS.find((c) => c.id === contrastId)!.lessonId,
})

export const OWL_QUESTIONS: readonly OwlQuestion[] = [
  // to be hiện tại (s1-t1-w1)
  choice(
    1,
    TO_BE,
    'My brother and I ___ students.',
    ['are', 'is', 'am', 'be'],
    'Chủ ngữ "My brother and I" là hai người (= we) nên dùng are, không dùng is hay am.',
    ['subject-pronouns', 'possessive-adjectives', 'plurals', 'be-affirmative'],
  ),
  type(
    2,
    TO_BE,
    'My keys ___ (not / be) in my bag.',
    "aren't",
    'My keys là số nhiều nên dùng are; phủ định thêm not ngay sau are: are not = aren\'t.',
    ['possessive-adjectives', 'plurals', 'be-negative', 'prepositions-of-place'],
  ),
  transform(
    3,
    TO_BE,
    'Đổi sang câu hỏi: Your parents are at home.',
    'Are your parents at home?',
    'Câu có to be: đưa are lên trước chủ ngữ, không mượn do.',
    ['possessive-adjectives', 'plurals', 'be-questions', 'prepositions-of-place'],
  ),
  // Hiện tại đơn (s1-t1-w2, s1-t1-w3)
  choice(
    4,
    SIMPLE_W2,
    'Every Saturday, Minh ___ his grandmother.',
    ['visits', 'visit', 'is visit', 'visiting'],
    'Việc lặp lại mỗi tuần (every Saturday) dùng hiện tại đơn; chủ ngữ Minh (he) nên động từ thêm -s: visits.',
    ['possessive-adjectives', 'days-months', 'present-simple'],
  ),
  type(
    5,
    SIMPLE_W3,
    'My sister ___ (not / watch) TV on weekdays.',
    "doesn't watch",
    "Thói quen nên dùng hiện tại đơn; chủ ngữ My sister (she) nên phủ định mượn doesn't, động từ về nguyên mẫu: doesn't watch.",
    ['possessive-adjectives', 'prepositions-of-time', 'present-simple', 'present-simple-negative'],
    ['does not watch'],
  ),
  transform(
    6,
    SIMPLE_W3,
    'Dịch sang tiếng Anh: Anh trai bạn làm việc ở đâu? (where, your brother, work)',
    'Where does your brother work?',
    'Câu hỏi hiện tại đơn với chủ ngữ số ít (your brother): Where + does + chủ ngữ + V nguyên mẫu (work, không works).',
    ['possessive-adjectives', 'wh-questions', 'present-simple-questions'],
  ),
  // Hiện tại tiếp diễn (s1-t2-w1)
  choice(
    7,
    CONTINUOUS,
    'Shh! My father ___ on the phone right now.',
    ['is talking', 'talks', 'talk', 'are talking'],
    'right now (ngay lúc này) cho biết việc đang diễn ra nên dùng am / is / are + V-ing; My father là he nên dùng is talking.',
    ['possessive-adjectives', 'be-affirmative', 'verb-forms'],
  ),
  type(
    8,
    CONTINUOUS,
    'Mai and Lan ___ (not / work) right now. They are having lunch.',
    "aren't working",
    "right now (ngay lúc này) cho biết việc đang diễn ra nên dùng tiếp diễn; Mai and Lan là they nên dùng are not + V-ing: aren't working.",
    ['subject-pronouns', 'be-negative', 'verb-forms'],
  ),
  transform(
    9,
    CONTINUOUS,
    'Đổi sang câu phủ định: The children are watching TV.',
    "The children aren't watching TV.",
    'Thì tiếp diễn đã có are làm trợ động từ: thêm not ngay sau are (aren\'t), giữ nguyên V-ing.',
    ['articles', 'irregular-plurals', 'be-negative', 'verb-forms'],
  ),
  // to be quá khứ (s1-t2-w2)
  choice(
    10,
    PAST_BE,
    'My grandparents ___ farmers in 1990.',
    ['were', 'was', 'are', 'did'],
    'in 1990 là quá khứ; My grandparents là số nhiều (they) nên dùng were. Câu có to be nên không dùng did.',
    ['possessive-adjectives', 'plurals', 'numbers', 'prepositions-of-time', 'verb-forms'],
  ),
  type(
    11,
    PAST_BE,
    '___ (be) the movie interesting last night?',
    'Was',
    'last night là quá khứ; chủ ngữ the movie (it) nên câu hỏi đưa was lên đầu, không mượn did.',
    ['articles', 'be-questions', 'verb-forms'],
  ),
  transform(
    12,
    PAST_BE,
    'Dịch sang tiếng Anh: Tuần trước chúng tôi không ở nhà. (not / be, at home, last week)',
    "We weren't at home last week.",
    "last week là quá khứ; chủ ngữ we nên dùng were, phủ định là were not = weren't (không nói didn't be).",
    ['subject-pronouns', 'be-negative', 'prepositions-of-place', 'verb-forms'],
    ["Last week we weren't at home."],
  ),
  // Quá khứ đơn (s1-t2-w2, s1-t2-w3)
  choice(
    13,
    PAST_W3,
    'Yesterday my mother ___ a cake for my birthday.',
    ['made', 'make', 'makes', 'maked'],
    'Yesterday là quá khứ nên dùng V2; make là động từ bất quy tắc: make – made (không thêm -ed).',
    ['possessive-adjectives', 'articles', 'verb-forms'],
  ),
  type(
    14,
    PAST_W2,
    'We ___ (not / enjoy) the concert last Saturday.',
    "didn't enjoy",
    "last Saturday là quá khứ; phủ định quá khứ đơn mượn didn't, động từ về nguyên mẫu: didn't enjoy (không phải didn't enjoyed).",
    ['subject-pronouns', 'articles', 'days-months', 'verb-forms'],
  ),
  transform(
    15,
    PAST_W3,
    'Đổi sang câu hỏi: Your friends came to the party.',
    'Did your friends come to the party?',
    'Câu quá khứ đơn có động từ thường: hỏi bằng Did + chủ ngữ + V nguyên mẫu, came về come.',
    ['possessive-adjectives', 'plurals', 'articles', 'verb-forms'],
  ),
  // Tương lai will (s1-t3-w1)
  choice(
    16,
    WILL,
    "I'm hungry. — OK, I ___ make you a sandwich.",
    ['will', 'am', 'was', 'have'],
    'Người nói quyết định ngay lúc nói (OK, …) để đề nghị giúp nên dùng will + V nguyên mẫu.',
    ['subject-pronouns', 'object-pronouns', 'articles', 'verb-forms'],
  ),
  type(
    17,
    WILL,
    'Your secret is safe. I promise I ___ (not / tell) anyone.',
    "won't tell",
    "Lời hứa dùng will; phủ định will not = won't, sau đó là V nguyên mẫu: won't tell.",
    ['possessive-adjectives', 'subject-pronouns', 'verb-forms'],
  ),
  transform(
    18,
    WILL,
    'Dịch sang tiếng Anh: Tôi sẽ không bao giờ quên bạn. (never, forget, you)',
    'I will never forget you.',
    "Lời hứa về tương lai dùng will; never đứng sau will, trước V nguyên mẫu (I'll never forget you cũng đúng).",
    ['subject-pronouns', 'object-pronouns', 'frequency-adverbs', 'verb-forms'],
  ),
  // be going to (s1-t3-w2)
  choice(
    19,
    GOING_TO,
    'We have the tickets. We ___ fly to Da Nang next Friday.',
    ['are going to', 'is going to', 'going to', 'are go to'],
    'Đã có vé là kế hoạch định sẵn nên dùng be going to + V; chủ ngữ we nên dùng are going to.',
    ['subject-pronouns', 'have-has', 'articles', 'days-months', 'verb-forms'],
  ),
  type(
    20,
    GOING_TO,
    'Look out! That cup ___ (fall) off the table.',
    'is going to fall',
    'Look out! = Cẩn thận! Cái cốc sắp rơi khỏi bàn (off the table) là dấu hiệu ngay trước mắt nên dùng be going to; that cup là số ít nên dùng is going to fall.',
    ['demonstratives', 'articles', 'prepositions-of-place', 'verb-forms'],
  ),
  transform(
    21,
    GOING_TO,
    'Đổi sang câu phủ định: Minh is going to study in Japan next year.',
    "Minh isn't going to study in Japan next year.",
    "be going to có is làm trợ động từ: thêm not sau is (isn't), giữ going to + V nguyên mẫu.",
    ['be-negative', 'prepositions-of-place', 'verb-forms'],
    ["Next year Minh isn't going to study in Japan."],
  ),
  // Hiện tại hoàn thành (s1-t3-w3, s1-t3-w4)
  choice(
    22,
    PERFECT_W3,
    'My parents ___ visited Japan twice.',
    ['have', 'has', 'are', 'did'],
    'Kể trải nghiệm (đã đi hai lần – twice), không nói lúc nào, nên dùng have / has + V3; My parents là they nên dùng have.',
    ['possessive-adjectives', 'plurals', 'verb-forms'],
  ),
  type(
    23,
    PERFECT_W3,
    'Our team ___ (not / finish) the project yet.',
    "hasn't finished",
    "Chưa xong tới giờ (yet) dùng hiện tại hoàn thành; our team là số ít nên dùng has not = hasn't + V3 (finished).",
    ['possessive-adjectives', 'articles', 'verb-forms'],
  ),
  transform(
    24,
    PERFECT_W4,
    'Dịch sang tiếng Anh: Tôi biết anh ấy được mười năm rồi. (know, him, for ten years)',
    'I have known him for ten years.',
    '"được … rồi" là kéo dài tới giờ (for ten years) nên dùng have + V3: know – knew – known.',
    ['subject-pronouns', 'object-pronouns', 'numbers', 'verb-forms'],
  ),
  // can / should / must (s1-t4-w1)
  choice(
    25,
    MODALS,
    'This is a hospital. You ___ be quiet here.',
    ['must', "mustn't", "can't", "don't"],
    'Ở bệnh viện phải giữ yên lặng: must + V nguyên mẫu (be). mustn\'t = không được (yên lặng), can\'t = không thể (yên lặng): cả hai đều sai nghĩa.',
    ['demonstratives', 'articles', 'verb-forms'],
  ),
  type(
    26,
    MODALS,
    'Your phone is very old. You ___ (should / buy) a new one.',
    'should buy',
    'Lời khuyên dùng should; sau should là V nguyên mẫu, không to, không -s: should buy.',
    ['possessive-adjectives', 'articles', 'verb-forms'],
  ),
  transform(
    27,
    MODALS,
    'Đổi sang câu hỏi: You can drive a car.',
    'Can you drive a car?',
    'can là trợ động từ: đưa can lên trước chủ ngữ, không mượn do (không nói Do you can drive…?).',
    ['subject-pronouns', 'articles', 'verb-forms'],
  ),
  // Bị động hiện tại (s1-t4-w3)
  choice(
    28,
    PASSIVE,
    'English ___ at this school.',
    ['is taught', 'teaches', 'is teaching', 'taught'],
    'Tiếng Anh không tự dạy mà được dạy nên dùng bị động is + V3 (teach – taught – taught). Thiếu is thì taught thành quá khứ đơn, sai.',
    ['demonstratives', 'prepositions-of-place', 'verb-forms'],
  ),
  type(
    29,
    PASSIVE,
    'These shoes ___ (make) in Vietnam.',
    'are made',
    'Giày được làm (bị động) nên dùng are + V3; these shoes là số nhiều nên dùng are; make – made – made.',
    ['demonstratives', 'plurals', 'prepositions-of-place', 'verb-forms'],
  ),
  transform(
    30,
    PASSIVE,
    'Dịch sang tiếng Anh: Bánh mì được bán ở cửa hàng này. (bread, sell, at this shop)',
    'Bread is sold at this shop.',
    '"được bán" là bị động: is + V3 (sell – sold – sold); bread không đếm được nên dùng is.',
    ['demonstratives', 'countable-uncountable', 'prepositions-of-place', 'verb-forms'],
  ),

  // Cặp hiện tại đơn ↔ hiện tại tiếp diễn (s1-t2-w1)
  choice(
    31,
    pair('simple-continuous', 'present-continuous'),
    'Listen! Someone ___ at the door.',
    ['is knocking', 'knocks', 'knock', 'are knocking'],
    'Listen! cho biết việc đang diễn ra lúc nói nên dùng is + V-ing. Không dùng hiện tại đơn (knocks) vì đây không phải thói quen.',
    ['articles', 'imperatives', 'verb-forms'],
  ),
  choice(
    32,
    pair('simple-continuous', 'present-simple'),
    'Nam ___ his teeth twice a day.',
    ['brushes', 'is brushing', 'brush', 'are brushing'],
    'twice a day là thói quen nên dùng hiện tại đơn, Nam là he nên thêm -es: brushes. Không dùng tiếp diễn (is brushing) vì không phải việc đang diễn ra lúc nói.',
    ['possessive-adjectives', 'irregular-plurals', 'articles', 'verb-forms'],
  ),
  type(
    33,
    pair('simple-continuous', 'present-simple'),
    'My mother ___ (cook) dinner every evening, but right now she is reading a book.',
    'cooks',
    'every evening là thói quen nên dùng hiện tại đơn, My mother là she nên thêm -s: cooks. Việc đang diễn ra lúc nói (right now) mới dùng tiếp diễn (is reading).',
    ['possessive-adjectives', 'articles', 'verb-forms'],
  ),
  // Cặp was / were ↔ did (s1-t2-w2)
  choice(
    34,
    pair('was-did', 'past-to-be'),
    '___ you at home last night?',
    ['Were', 'Did', 'Was', 'Are'],
    'Câu có to be (at home, không có động từ thường) nên hỏi bằng Were, không mượn did. Chủ ngữ you dùng were; last night là quá khứ nên không dùng Are.',
    ['subject-pronouns', 'be-questions', 'prepositions-of-place'],
  ),
  choice(
    35,
    pair('was-did', 'past-simple'),
    '___ you see Nam at the party last Saturday?',
    ['Did', 'Were', 'Was', 'Are'],
    'Câu có động từ thường (see) nên hỏi bằng Did + V nguyên mẫu. Không dùng Were vì Were you see sai: to be không đi với V nguyên mẫu.',
    ['subject-pronouns', 'articles', 'days-months', 'verb-forms'],
  ),
  type(
    36,
    pair('was-did', 'past-simple'),
    'Did your sister enjoy the trip? — No, she ___.',
    "didn't",
    "Câu hỏi bằng Did thì trả lời ngắn lặp lại did: No, she didn't. Không trả lời bằng wasn't vì câu hỏi không có to be.",
    ['possessive-adjectives', 'articles', 'verb-forms'],
  ),
  // Cặp will ↔ going to (s1-t3-w2)
  choice(
    37,
    pair('will-going-to', 'will'),
    'I forgot my pen. — No problem. I ___ lend you my pen.',
    ['will', 'am going to', 'am', 'going to'],
    'Đề nghị giúp, quyết định ngay lúc nói (No problem, …) dùng will. am going to nghe không tự nhiên vì trước đó chưa có kế hoạch cho mượn bút.',
    ['subject-pronouns', 'object-pronouns', 'possessive-adjectives', 'verb-forms'],
  ),
  choice(
    38,
    pair('will-going-to', 'going-to'),
    'We paid for the hotel last week. We ___ stay in Hue next weekend.',
    ['are going to', 'will', 'are', 'going to'],
    'Đã trả tiền khách sạn từ tuần trước là kế hoạch định sẵn nên dùng are going to (luật đã học: kế hoạch có sẵn → going to). will vẫn gặp trong đời thường, nhưng hợp với quyết định ngay lúc nói hơn, nên ở đây are going to tự nhiên hơn.',
    ['subject-pronouns', 'articles', 'prepositions-of-place', 'verb-forms'],
  ),
  type(
    39,
    pair('will-going-to', 'going-to'),
    'My sister ___ (start) a new job next Monday. She told us last week.',
    'is going to start',
    'Việc đã định sẵn từ trước (chị ấy đã báo từ tuần trước) nên dùng be going to theo luật đã học; will hợp với quyết định ngay lúc nói hơn. My sister là she nên dùng is going to start. (is starting cũng được tính đúng: tiếp diễn cũng dùng cho việc đã hẹn, sẽ học sau.)',
    ['subject-pronouns', 'object-pronouns', 'possessive-adjectives', 'articles', 'days-months', 'verb-forms'],
    ['is starting'],
  ),
  // Cặp quá khứ đơn ↔ hiện tại hoàn thành (s1-t3-w4)
  choice(
    40,
    pair('past-perfect', 'present-perfect'),
    'My uncle ___ in Canada since 2015.',
    ['has lived', 'lived', 'lives', 'is living'],
    'since 2015 là kéo dài từ mốc đó tới giờ nên dùng has + V3. Không dùng quá khứ đơn (lived) vì việc chưa kết thúc.',
    ['possessive-adjectives', 'prepositions-of-place', 'numbers', 'verb-forms'],
  ),
  choice(
    41,
    pair('past-perfect', 'past-simple'),
    'Nam ___ his phone two days ago.',
    ['lost', 'has lost', 'loses', 'is losing'],
    'two days ago là mốc đã xong nên dùng quá khứ đơn: lose – lost. Không dùng has lost vì có ago.',
    ['possessive-adjectives', 'numbers', 'verb-forms'],
  ),
  type(
    42,
    pair('past-perfect', 'past-simple'),
    'My parents ___ (buy) this house in 2018.',
    'bought',
    'in 2018 là mốc đã xong nên dùng quá khứ đơn: buy – bought. Không dùng have bought vì có năm cụ thể.',
    ['possessive-adjectives', 'plurals', 'demonstratives', 'numbers', 'prepositions-of-time', 'verb-forms'],
  ),
]
