import type { RequiredConcept } from './concepts'
import type { ChoiceQuestion, ChoiceQuestionKind, MistakeTag, Question, TypedQuestion, TypedQuestionKind } from './types'
import type { SectionId } from '@/data/roadmap/types'

/**
 * 102 câu tháng T2–T4 (6 câu mỗi bài có nội dung, trừ tuần Tết `s1-t4-w2`), bám nội dung story 10. Tự soạn theo khuôn ETS,
 * không chép đề. Các bài có thêm câu (đều có `requires`):
 * - `s1-t2-w1` có 14 câu: 4 câu gõ `type` / `transform` của story 35 và 4 câu gõ của story 36;
 * - `s1-t2-w2` có 26 câu: 6 câu was / were và Wh + did (story 33), 14 câu gõ của story 36 (7 câu was / were, 7 câu -ed);
 * - `s1-t2-w3` có 14 câu: 8 câu gõ bất quy tắc của story 36.
 * Story 36 nâng mỗi thì T1–T2 lên 12 câu nhãn `thì` (gõ dạng đúng, biến đổi "Đổi …:", dịch "Dịch sang tiếng Anh: … (gợi ý)").
 * Tuần O.W.L. 1 (`s1-t4-w4`) không có đoạn Ngữ pháp nên mọi câu gắn đoạn Phát âm (nơi có phần ôn tổng).
 */

const LISTEN_PROMPT = 'Nghe và chọn câu bạn vừa nghe.'

type Opts = readonly [string, string, string, string]

function questionId(lessonId: string, n: number): string {
  return `q-${lessonId}-${String(n).padStart(2, '0')}`
}

function make(
  lessonId: string,
  n: number,
  sectionId: SectionId,
  tag: MistakeTag,
  kind: ChoiceQuestionKind,
  prompt: string,
  options: Opts,
  explanation: string,
  requires?: readonly RequiredConcept[],
): ChoiceQuestion {
  const q: ChoiceQuestion = {
    id: questionId(lessonId, n),
    lessonId,
    sectionId,
    tag,
    kind,
    prompt,
    options,
    answer: options[0],
    explanation,
    ...(requires ? { requires } : {}),
  }
  return kind === 'listening' ? { ...q, audioText: options[0] } : q
}

/** Câu gõ (story 35): tag `thì`, không có lựa chọn; `accept` (nếu có) là cách viết khác cũng đúng. */
function makeTyped(
  lessonId: string,
  n: number,
  sectionId: SectionId,
  kind: TypedQuestionKind,
  prompt: string,
  answer: string,
  explanation: string,
  requires: readonly RequiredConcept[],
  accept?: readonly string[],
): TypedQuestion {
  return {
    id: questionId(lessonId, n),
    lessonId,
    sectionId,
    tag: 'thì',
    kind,
    prompt,
    answer,
    explanation,
    requires,
    ...(accept && accept.length > 0 ? { accept } : {}),
  }
}

/**
 * Bộ dựng câu cho một bài: lựa chọn đầu tiên luôn là đáp án (khi làm bài, lựa chọn được xáo). `requires` (không bắt
 * buộc, story 33) gắn khái niệm câu cần; quiz bỏ câu khi viên gạch dạy khái niệm đó chưa dạy. `type` / `transform`
 * (story 35) dựng câu gõ gắn đoạn Ngữ pháp, bắt buộc có `requires`.
 */
function lesson(lessonId: string, grammarSection: SectionId = 'grammar') {
  const typed =
    (kind: TypedQuestionKind) =>
    (
      n: number,
      prompt: string,
      answer: string,
      explanation: string,
      requires: readonly RequiredConcept[],
      accept?: readonly string[],
    ) =>
      makeTyped(lessonId, n, grammarSection, kind, prompt, answer, explanation, requires, accept)
  return {
    grammar: (
      n: number,
      prompt: string,
      options: Opts,
      explanation: string,
      tag: MistakeTag = 'thì',
      requires?: readonly RequiredConcept[],
    ) => make(lessonId, n, grammarSection, tag, 'choice', prompt, options, explanation, requires),
    sound: (n: number, prompt: string, options: Opts, explanation: string) =>
      make(lessonId, n, 'pronunciation', 'phát âm', 'pronunciation', prompt, options, explanation),
    listen: (n: number, options: Opts, explanation: string) =>
      make(lessonId, n, 'pronunciation', 'nghe', 'listening', LISTEN_PROMPT, options, explanation),
    type: typed('type'),
    transform: typed('transform'),
  }
}

const STRESS_ODD = 'Chọn từ có trọng âm khác ba từ còn lại.'

const t2w1 = lesson('s1-t2-w1')
const t2w2 = lesson('s1-t2-w2')
const t2w3 = lesson('s1-t2-w3')
const t2w4 = lesson('s1-t2-w4')
const t3w1 = lesson('s1-t3-w1')
const t3w2 = lesson('s1-t3-w2')
const t3w3 = lesson('s1-t3-w3')
const t3w4 = lesson('s1-t3-w4')
const t4w1 = lesson('s1-t4-w1')
const t4w3 = lesson('s1-t4-w3')
const t4w4 = lesson('s1-t4-w4', 'pronunciation')

export const T2_T4_QUESTIONS: readonly Question[] = [
  // ── T2 tuần 1: hiện tại tiếp diễn · trọng âm 2 âm tiết ──
  t2w1.grammar(1, 'Look! The children ___ in the garden.', ['are playing', 'is playing', 'play', 'playing'],
    'Việc đang diễn ra (Look!) dùng hiện tại tiếp diễn; children là số nhiều nên are playing.'),
  t2w1.grammar(2, 'I ___ TV right now.', ['am not watching', 'not watching', "don't watching", 'am not watch'],
    'Phủ định hiện tại tiếp diễn: am / is / are + not + V-ing. Không bỏ am, không dùng don\'t.'),
  t2w1.grammar(3, '___ she working today?', ['Is', 'Does', 'Are', 'Do'],
    'Câu hỏi hiện tại tiếp diễn đảo am / is / are lên đầu; she đi với is. Không dùng does với V-ing.'),
  t2w1.grammar(4, 'He is ___ a letter now.', ['writing', 'writeing', 'write', 'writes'],
    'Động từ tận cùng e câm thì bỏ e rồi thêm -ing: write → writing.'),
  t2w1.sound(5, STRESS_ODD, ['decide', 'student', 'problem', 'money'],
    'decide là động từ, nhấn âm 2 (de-CIDE). student, problem, money là danh từ, nhấn âm 1.'),
  t2w1.listen(6, ['She is preparing dinner.', 'She prepares dinner.', 'He is preparing dinner.', 'She is preparing lunch.'],
    'Nghe "is" và đuôi -ing (preparing); động từ prepare nhấn âm 2: pre-PARE.'),
  // Câu gõ (story 35): Huy tự gõ dạng đúng / cả câu, chấm bằng `matchesTyped` (n't = not, hoa thường và dấu câu không tính).
  t2w1.type(7, 'Listen! The baby ___ (cry).', 'is crying',
    'Listen! báo việc đang diễn ra ngay lúc này nên dùng hiện tại tiếp diễn. The baby là một người nên dùng is, rồi cry thêm -ing: is crying.',
    ['imperatives', 'articles', 'be-affirmative']),
  t2w1.type(8, 'My brother ___ (not / study) now. He is sleeping.', "isn't studying",
    "Phủ định hiện tại tiếp diễn: is / am / are + not + V-ing. My brother là he nên dùng is not (isn't), rồi study thêm -ing: isn't studying. Không dùng doesn't với V-ing.",
    ['possessive-adjectives', 'subject-pronouns', 'be-affirmative', 'be-negative']),
  t2w1.transform(9, 'Đổi sang câu hỏi: They are waiting for the bus.', 'Are they waiting for the bus?',
    'Câu hỏi hiện tại tiếp diễn chỉ cần đảo are lên trước chủ ngữ: Are they waiting…? Không thêm do, giữ nguyên waiting.',
    ['subject-pronouns', 'articles', 'be-questions']),
  t2w1.transform(10, 'Đổi sang câu phủ định: I am writing an email.', 'I am not writing an email.',
    "Phủ định: thêm not ngay sau am: I am not (I'm not) writing an email. Không bỏ am, không dùng don't.",
    ['subject-pronouns', 'articles', 'be-negative']),

  // Câu gõ thêm (story 36): đủ 12 câu nhãn thì, có câu dịch Việt → Anh.
  t2w1.type(11, 'Look! The man ___ (run) to the bus.', 'is running',
    'Look! báo việc đang diễn ra nên dùng hiện tại tiếp diễn. The man là một người nên dùng is. run là từ một âm tiết tận cùng u + n (1 nguyên âm + 1 phụ âm) nên gấp đôi n: running.',
    ['imperatives', 'articles', 'be-affirmative']),
  t2w1.type(12, 'We ___ (make) a cake in the kitchen now.', 'are making',
    'now báo việc đang diễn ra nên dùng hiện tại tiếp diễn; we đi với are. make tận cùng e câm nên bỏ e rồi thêm -ing: making (không phải makeing).',
    ['subject-pronouns', 'articles', 'be-affirmative', 'prepositions-of-place']),
  t2w1.transform(13, 'Dịch sang tiếng Anh: Bây giờ mẹ tôi đang nấu ăn. (mother, cook, now)', 'My mother is cooking now.',
    'Tiếng Việt chỉ cần "đang", tiếng Anh bắt buộc đủ hai phần: is (vì my mother = she) + cooking. now đặt cuối hoặc đầu câu đều được.',
    ['possessive-adjectives', 'be-affirmative'],
    ['Now my mother is cooking.', "My mother's cooking now.", "Now my mother's cooking."]),
  t2w1.transform(14, 'Dịch sang tiếng Anh: Hôm nay anh ấy đang lái xe đi làm. (drive, to work, today)', 'He is driving to work today.',
    'Có "đang" nên dùng hiện tại tiếp diễn: is (vì he) + V-ing, không dùng drives. drive tận cùng e câm nên bỏ e: driving. today đặt cuối hoặc đầu câu đều được.',
    ['subject-pronouns', 'be-affirmative'],
    ["He's driving to work today.", 'Today he is driving to work.', "Today he's driving to work."]),

  // ── T2 tuần 2: quá khứ đơn có quy tắc · trọng âm theo hậu tố ──
  t2w2.grammar(1, 'I ___ my parents last Sunday.', ['visited', 'visit', 'visits', 'am visiting'],
    'Có mốc đã xong (last Sunday) → quá khứ đơn: visit → visited.'),
  t2w2.grammar(2, 'She ___ English at university in 2019.', ['studied', 'studyed', 'studies', 'study'],
    'Mốc 2019 đã xong → quá khứ. Phụ âm + y đổi thành -ied: study → studied.'),
  t2w2.grammar(3, 'We ___ the movie yesterday.', ["didn't watch", "didn't watched", "don't watched", 'not watched'],
    "Phủ định quá khứ: didn't + động từ nguyên mẫu (did đã mang quá khứ)."),
  t2w2.grammar(4, '___ you call him last night?', ['Did', 'Do', 'Were', 'Are'],
    'Câu hỏi quá khứ với động từ thường: Did + S + nguyên mẫu. last night là quá khứ nên không dùng Do.'),
  t2w2.sound(5, 'Chọn từ có trọng âm rơi vào âm tiết thứ 3.', ['information', 'condition', 'position', 'activity'],
    'Nhấn ngay trước hậu tố: in-for-MA-tion (âm 3). con-DI-tion, po-SI-tion, ac-TIV-i-ty đều nhấn âm 2.'),
  t2w2.listen(6, [
    'We talked about the economic situation.',
    'We talk about the economic situation.',
    'We talked about the economic solution.',
    'They talked about the economic situation.',
  ], 'Nghe đuôi -ed của talked (/t/) và trọng âm ec-o-NOM-ic, sit-u-A-tion.'),
  // was / were và Wh + did (story 33): có `requires` nên quiz bỏ câu khi viên F13–F15 chưa dạy.
  t2w2.grammar(7, 'Where ___ they last night? — At home.', ['were', 'did', 'was', 'are'],
    'Câu chỉ hỏi ở đâu, không có động từ thường, nên dùng to be: Where + were + S? did chỉ dùng khi có động từ thường (Where did they stay?). They đi với were; last night là quá khứ nên không dùng are.',
    'thì', ['wh-questions', 'be-questions', 'subject-pronouns', 'prepositions-of-place']),
  t2w2.grammar(8, 'Tom ___ at school yesterday. He was at home.', ["wasn't", "weren't", "didn't", "isn't"],
    "Phủ định của was là wasn't (was + not), không mượn didn't. Tom là một người nên dùng wasn't; yesterday là quá khứ nên không dùng isn't.",
    'thì', ['be-affirmative', 'be-negative', 'subject-pronouns', 'prepositions-of-place']),
  t2w2.grammar(9, '___ you tired last night? — Yes, I was.', ['Were', 'Did', 'Was', 'Are'],
    'Hỏi với to be ở quá khứ thì đảo Were lên đầu; không mượn Did (không nói Did you be tired?). you đi với were.',
    'thì', ['be-questions', 'subject-pronouns']),
  t2w2.grammar(10, 'Was the hotel nice? — No, it ___.', ["wasn't", "didn't", "isn't", "weren't"],
    "Câu hỏi bằng Was thì trả lời ngắn cũng dùng was: No, it wasn't. Không trả lời bằng didn't; it đi với was, không đi với were.",
    'thì', ['be-questions', 'be-negative', 'articles']),
  t2w2.grammar(11, 'There ___ two cats in the garden yesterday.', ['were', 'was', 'are', 'did'],
    'yesterday là quá khứ: There was + số ít, There were + số nhiều. two cats là số nhiều nên dùng were.',
    'thì', ['there-is-are', 'plurals', 'articles', 'prepositions-of-place']),
  t2w2.grammar(12, 'What ___ you watch last night? — A movie.', ['did', 'were', 'do', 'was'],
    'Hỏi Wh- về việc đã làm (watch là động từ thường): What + did + S + nguyên mẫu. last night là quá khứ nên không dùng do.',
    'thì', ['wh-questions', 'present-simple-questions', 'articles', 'tenses-overview']),

  // Câu gõ was / were (story 36): gõ dạng đúng, biến đổi, dịch Việt → Anh; không -ed, không V2 khác.
  t2w2.transform(13, 'Đổi sang câu hỏi: You were at work yesterday.', 'Were you at work yesterday?',
    'Câu hỏi với was / were: đảo were lên trước chủ ngữ, không mượn did (không nói Did you be at work?).',
    ['be-questions', 'subject-pronouns', 'prepositions-of-place']),
  t2w2.type(14, 'The children ___ (be) at school yesterday.', 'were',
    'children là số nhiều của child nên đi với were. yesterday là quá khứ nên không dùng are.',
    ['be-affirmative', 'irregular-plurals', 'articles', 'prepositions-of-place']),
  t2w2.type(15, 'I ___ (not / be) tired last night.', "wasn't",
    "I đi với was; phủ định thêm not ngay sau was: was not (wasn't). Không dùng didn't với to be.",
    ['be-negative', 'subject-pronouns']),
  t2w2.type(16, 'Were they at home? — No, they ___.', "weren't",
    "Hỏi bằng Were thì trả lời ngắn cũng dùng were: No, they weren't (were not). Không trả lời bằng didn't.",
    ['be-questions', 'be-negative', 'subject-pronouns', 'prepositions-of-place']),
  t2w2.transform(17, 'Đổi sang câu phủ định: We were at the park on Sunday.', "We weren't at the park on Sunday.",
    "Phủ định của were là were not (weren't), đặt ngay sau were, không mượn didn't.",
    ['be-negative', 'subject-pronouns', 'articles', 'prepositions-of-place', 'prepositions-of-time', 'days-months'],
    ["On Sunday we weren't at the park."]),
  t2w2.transform(18, 'Dịch sang tiếng Anh: Tối qua các bạn ở đâu? (where, last night)', 'Where were you last night?',
    'Câu chỉ hỏi ở đâu, không có động từ thường, nên dùng to be: Where + were + you? you (các bạn) đi với were. Không dùng did.',
    ['wh-questions', 'be-questions', 'subject-pronouns']),
  t2w2.transform(19, 'Dịch sang tiếng Anh: Hôm qua trời không lạnh. (it, cold, yesterday)', "It wasn't cold yesterday.",
    "Nói về thời tiết dùng it làm chủ ngữ. Quá khứ của is là was, phủ định wasn't. Tiếng Việt không có \"là\", tiếng Anh bắt buộc có was.",
    ['be-negative', 'subject-pronouns'], ["Yesterday it wasn't cold."]),
  // Câu gõ quá khứ đơn có quy tắc (story 36): -ed, did / didn't, Wh + did; không V2 bất quy tắc.
  t2w2.transform(20, 'Đổi sang quá khứ (last Sunday): I play football.', 'I played football last Sunday.',
    'last Sunday là quá khứ nên play thêm -ed: played (a + y giữ y). Tiếng Việt chỉ cần thêm "Chủ nhật trước", tiếng Anh phải đổi động từ.',
    ['present-simple', 'subject-pronouns', 'days-months'], ['Last Sunday I played football.']),
  t2w2.type(21, 'The bus ___ (stop) at the school yesterday.', 'stopped',
    'stop là từ một âm tiết tận cùng o + p (1 nguyên âm + 1 phụ âm) nên gấp đôi p rồi thêm -ed: stopped.',
    ['articles', 'prepositions-of-place']),
  t2w2.type(22, 'She ___ (live) in Hue in 2020.', 'lived',
    '2020 đã qua nên dùng quá khứ. live tận cùng e nên chỉ thêm -d: lived.',
    ['subject-pronouns', 'prepositions-of-place', 'prepositions-of-time', 'numbers']),
  t2w2.transform(23, 'Đổi sang câu phủ định: They visited the museum.', "They didn't visit the museum.",
    "Phủ định quá khứ: didn't + động từ nguyên mẫu, nên visited về visit: They didn't visit the museum (không phải didn't visited).",
    ['subject-pronouns', 'articles', 'present-simple-negative']),
  t2w2.type(24, 'Did you watch the game? — Yes, I ___.', 'did',
    'Hỏi bằng Did thì trả lời ngắn cũng dùng did: Yes, I did. Không lặp lại watch.',
    ['subject-pronouns', 'articles', 'present-simple-questions', 'tenses-overview']),
  t2w2.transform(25, 'Dịch sang tiếng Anh: Tối qua tôi học tiếng Anh. (study, English, last night)', 'I studied English last night.',
    'last night là quá khứ. study tận cùng phụ âm d + y nên đổi y thành -ied: studied. last night đặt cuối hoặc đầu câu đều được.',
    ['subject-pronouns', 'tenses-overview'], ['Last night I studied English.']),
  t2w2.transform(26, 'Dịch sang tiếng Anh: Hôm qua bạn đã nấu món gì? (what, cook, yesterday)', 'What did you cook yesterday?',
    'Hỏi Wh- về việc đã làm (cook là động từ thường): What + did + you + cook (nguyên mẫu)? Không nói What you cooked?',
    ['wh-questions', 'present-simple-questions', 'subject-pronouns', 'tenses-overview']),

  // ── T2 tuần 3: động từ bất quy tắc · phát âm -ed ──
  t2w3.grammar(1, 'I ___ to Da Lat last month.', ['went', 'goed', 'gone', 'go'],
    'go là bất quy tắc: go – went – gone. Quá khứ đơn dùng cột 2: went.'),
  t2w3.grammar(2, 'She ___ a new bag yesterday.', ['bought', 'buyed', 'brought', 'buys'],
    'buy – bought – bought (mua). brought là quá khứ của bring (mang đến), dễ nhầm.'),
  t2w3.grammar(3, 'Did you ___ the email?', ['see', 'saw', 'seen', 'sees'],
    'Sau Did dùng động từ nguyên mẫu (V1): Did you see…?'),
  t2w3.grammar(4, 'They ___ dinner at a small restaurant last night.', ['ate', 'eated', 'eaten', 'eat'],
    'eat – ate – eaten. Quá khứ đơn (last night) dùng cột 2: ate.'),
  t2w3.sound(5, 'Chọn từ có đuôi -ed đọc khác ba từ còn lại.', ['visited', 'asked', 'looked', 'cooked'],
    'visited tận cùng /t/ nên -ed đọc /ɪd/. asked, looked, cooked tận cùng âm vô thanh /k/ nên -ed đọc /t/.'),
  t2w3.listen(6, [
    'He went home and cooked dinner.',
    'He goes home and cooks dinner.',
    'He went home and cooks dinner.',
    'He went home and looked for dinner.',
  ], 'Nghe went (quá khứ của go) và đuôi /t/ rất nhẹ ở cooked.'),

  // Câu gõ bất quy tắc (story 36): V2 khác V1, didn't / Did + V1, Wh + did; không V3.
  t2w3.type(7, 'I ___ (have) a big lunch yesterday.', 'had',
    'yesterday là quá khứ. have là bất quy tắc: have – had – had. Không nói haved.',
    ['subject-pronouns', 'articles', 'adjective-before-noun', 'verb-forms']),
  t2w3.type(8, 'She ___ (take) a taxi to the airport yesterday.', 'took',
    'yesterday là quá khứ. take là bất quy tắc: take – took – taken. Quá khứ đơn dùng cột 2: took (không phải taked).',
    ['subject-pronouns', 'articles', 'verb-forms']),
  t2w3.type(9, 'We ___ (meet) our teacher at the market yesterday.', 'met',
    'meet là bất quy tắc: meet – met – met (nguyên âm dài thành ngắn). Không nói meeted.',
    ['subject-pronouns', 'possessive-adjectives', 'articles', 'prepositions-of-place', 'verb-forms']),
  t2w3.type(10, 'He ___ (not / come) to the party last night.', "didn't come",
    "Phủ định quá khứ: didn't + V1. did đã mang quá khứ nên come giữ nguyên (không phải didn't came).",
    ['subject-pronouns', 'articles', 'verb-forms', 'present-simple-negative']),
  t2w3.transform(11, 'Đổi sang câu hỏi: They went to the beach.', 'Did they go to the beach?',
    'Câu hỏi quá khứ với động từ thường: Did + S + V1. went (V2) về go: Did they go…? (không phải Did they went?).',
    ['subject-pronouns', 'articles', 'verb-forms', 'present-simple-questions']),
  t2w3.transform(12, 'Đổi sang quá khứ (last night): Tom sleeps well.', 'Tom slept well last night.',
    'last night là quá khứ. sleep là bất quy tắc: sleep – slept, và quá khứ không thêm -s cho Tom. last night đặt cuối hoặc đầu câu đều được.',
    ['present-simple', 'verb-forms'], ['Last night Tom slept well.']),
  t2w3.transform(13, 'Dịch sang tiếng Anh: Tuần trước anh ấy mua một chiếc xe đạp mới. (buy, a new bike)', 'He bought a new bike last week.',
    'Tuần trước = last week (quá khứ). buy là bất quy tắc: buy – bought. Tính từ new đứng trước danh từ bike: a new bike.',
    ['subject-pronouns', 'articles', 'adjective-before-noun', 'verb-forms'], ['Last week he bought a new bike.']),
  t2w3.transform(14, 'Dịch sang tiếng Anh: Hôm qua bạn đã ăn gì? (what, eat, yesterday)', 'What did you eat yesterday?',
    'Câu hỏi Wh- ở quá khứ: What + did + you + V1? Đã có did nên eat giữ V1 (không phải What did you ate?).',
    ['wh-questions', 'present-simple-questions', 'subject-pronouns', 'verb-forms']),

  // ── T2 tuần 4: ôn lại ──
  t2w4.grammar(1, 'Right now, my brother ___ a shower.', ['is taking', 'takes', 'took', 'take'],
    'Right now → việc đang diễn ra: is taking (hiện tại tiếp diễn).'),
  t2w4.grammar(2, 'Last night I ___ very tired.', ['was', 'were', 'am', 'did'],
    'Quá khứ của to be: I / he / she / it was; you / we / they were.'),
  t2w4.grammar(3, 'He ___ his homework yesterday.', ["didn't do", "didn't did", "doesn't do", 'not did'],
    "Phủ định quá khứ: didn't + nguyên mẫu. do ở đây là động từ chính nên vẫn cần didn't do."),
  t2w4.grammar(4, 'Where ___ you go last weekend?', ['did', 'were', 'do', 'are'],
    'Câu hỏi Wh- ở quá khứ: Where did + S + nguyên mẫu?'),
  t2w4.sound(5, STRESS_ODD, ['hotel', 'coffee', 'morning', 'family'],
    'hotel là ngoại lệ, nhấn âm 2: ho-TEL. coffee, morning, family nhấn âm 1.'),
  t2w4.listen(6, [
    'My family visited the village last weekend.',
    'My family visits the village every weekend.',
    'My family visited the village last week.',
    'My family visited the valley last weekend.',
  ], 'Nghe đuôi -ed /ɪd/ của visited và cụm last weekend.'),

  // ── T3 tuần 1: will · dạng yếu ──
  t3w1.grammar(1, "It's cold. I ___ close the window.", ['will', 'am', 'going', 'do'],
    'Quyết định ngay lúc nói (vì thấy lạnh) dùng will + nguyên mẫu.'),
  t3w1.grammar(2, 'She will ___ you tomorrow.', ['call', 'calls', 'to call', 'calling'],
    'Sau will luôn là động từ nguyên mẫu, không -s, không to.'),
  t3w1.grammar(3, "Don't worry. I ___ forget.", ["won't", "don't", "willn't", 'not will'],
    "Phủ định của will là will not = won't. Không có willn't."),
  t3w1.grammar(4, '___ you help me with this box?', ['Will', 'Are', 'Is', 'Have'],
    'Nhờ ai làm gì ngay: Will you + nguyên mẫu…?'),
  t3w1.sound(5, 'Trong câu nói tự nhiên "I want to go", từ "to" thường đọc là:', ['/tə/', '/tuː/', '/toʊ/', '/tɑː/'],
    'to là từ chức năng nên đọc dạng yếu /tə/ (gần "tờ"); chỉ đọc /tuː/ khi đứng một mình hoặc cuối câu.'),
  t3w1.listen(6, ["I'll help you tomorrow.", "I won't help you tomorrow.", "I'll help you today.", 'I want to help you tomorrow.'],
    "I'll đọc liền một tiếng /aɪl/. won't /woʊnt/ đọc rõ và được nhấn; want /wɑːnt/ khác won't ở nguyên âm, và to sau want đọc yếu /tə/. Nghe kỹ cả từ cuối: tomorrow hay today."),

  // ── T3 tuần 2: be going to · nối âm ──
  t3w2.grammar(1, 'Look at those clouds! It ___ rain.', ['is going to', 'going to', 'will to', 'goes to'],
    'Dự đoán có dấu hiệu trước mắt (mây đen) dùng be going to; cần đủ is + going to.'),
  t3w2.grammar(2, 'We are going to ___ our grandparents.', ['visit', 'visiting', 'visits', 'visited'],
    'Sau going to là động từ nguyên mẫu.'),
  t3w2.grammar(3, 'What ___ you going to do this weekend?', ['are', 'do', 'will', 'is'],
    'Câu hỏi be going to đảo am / is / are lên trước chủ ngữ; you đi với are.'),
  t3w2.grammar(4, "He ___ going to buy a car. He doesn't have any money.", ["isn't", "doesn't", "won't", 'not'],
    "Phủ định be going to: am / is / are + not. He → isn't going to."),
  t3w2.sound(5, 'Khi nói nhanh, "I\'m going to call" thường nghe thành:', ["I'm gonna call", "I'm wanna call", "I'm gotta call", "I'm going call"],
    'going to + động từ nói nhanh thành gonna. wanna = want to, gotta = have got to.'),
  t3w2.listen(6, ['Turn off the light.', 'Turn on the light.', 'Turn off the lights.', 'Turn off the night.'],
    'turn off nối thành "tur-noff"; nghe kỹ âm /f/ ở cuối off để phân biệt với on.'),

  // ── T3 tuần 3: hiện tại hoàn thành (1) · trọng âm câu ──
  t3w3.grammar(1, 'I have ___ that movie three times.', ['seen', 'saw', 'see', 'seeing'],
    'Sau have / has dùng V3: see – saw – seen.'),
  t3w3.grammar(2, 'She ___ never been to Japan.', ['has', 'have', 'is', 'did'],
    'Hiện tại hoàn thành: she đi với has (has never been).'),
  t3w3.grammar(3, '___ you ever eaten pho?', ['Have', 'Did', 'Do', 'Are'],
    'Hỏi trải nghiệm: Have + S + ever + V3 (eaten)?'),
  t3w3.grammar(4, "He hasn't finished his report ___.", ['yet', 'already', 'ever', 'just'],
    "yet đứng cuối câu phủ định / câu hỏi: hasn't … yet = vẫn chưa."),
  t3w3.sound(5, 'Trong câu "I want to buy a new phone", từ nào thường KHÔNG được nhấn?', ['to', 'want', 'buy', 'phone'],
    'to là từ chức năng nên đọc nhẹ /tə/. want, buy, phone là từ nội dung nên được nhấn.'),
  t3w3.listen(6, ['She has visited Japan twice.', 'She visited Japan twice.', 'She has visited Japan once.', 'He has visited Japan twice.'],
    "has thường đọc nhẹ /həz/; vẫn phải nghe ra nó để phân biệt với quá khứ đơn."),

  // ── T3 tuần 4: hiện tại hoàn thành (2) và quá khứ đơn · shadowing ──
  t3w4.grammar(1, 'I ___ in Hanoi since 2020.', ['have lived', 'live', 'lived', 'am living'],
    'since + mốc bắt đầu, việc kéo dài tới giờ → hiện tại hoàn thành: have lived.'),
  t3w4.grammar(2, 'We ___ to Hue last year.', ['went', 'have gone', 'go', 'have went'],
    'Có mốc đã xong (last year) → quá khứ đơn: went.'),
  t3w4.grammar(3, 'She has worked here ___ three years.', ['for', 'since', 'from', 'ago'],
    'for + khoảng thời gian (three years); since + mốc bắt đầu.', 'giới từ'),
  t3w4.grammar(4, 'When ___ you arrive in Hanoi? — Two days ago.', ['did', 'have', 'do', 'are'],
    'Câu hỏi When… hỏi một lúc đã xong → quá khứ đơn: When did you arrive?'),
  t3w4.sound(5, 'Trong câu nói nhanh "I have lived here for five years", từ "for" thường đọc là:', ['/fɚ/', '/fɔːr/', '/foʊ/', '/faɪv/'],
    'for là từ chức năng nên đọc dạng yếu /fɚ/; chỉ đọc /fɔːr/ khi nhấn mạnh.'),
  t3w4.listen(6, ["I've known him since 2020.", 'I know him since 2020.', "I've known him for 20 years.", "I've known her since 2020."],
    "I've đọc liền /aɪv/, nghe âm /v/ rất nhẹ; since đi với mốc (2020), for đi với khoảng (20 years)."),

  // ── T4 tuần 1: can / should / must · dạng rút gọn ──
  t4w1.grammar(1, 'He can ___ three languages.', ['speak', 'speaks', 'to speak', 'speaking'],
    'Sau can là động từ nguyên mẫu, không -s, không to.'),
  t4w1.grammar(2, 'You look tired. You ___ go to bed early.', ['should', "mustn't", "can't", "don't"],
    'Lời khuyên dùng should + nguyên mẫu.'),
  t4w1.grammar(3, "You ___ smoke here. It's not allowed.", ["mustn't", "don't have to", 'should', 'can'],
    "Cấm làm gì dùng mustn't. don't have to nghĩa là không cần làm (vẫn được làm)."),
  t4w1.grammar(4, '___ I use your phone, please?', ['Can', 'Do', 'Am', 'Does'],
    'Xin phép: Can I + nguyên mẫu…? Không mượn do / does.'),
  t4w1.sound(5, 'Khi nói nhanh, "I want to go" thường nghe thành:', ['I wanna go', 'I gotta go', "I'd go", 'I gonna go'],
    'want to nói nhanh thành wanna. gotta = have got to; "I gonna" thiếu am.'),
  t4w1.listen(6, ["I'd like some water, please.", 'I like some water, please.', "I'd like some coffee, please.", "You'd like some water, please."],
    "I'd like (= I would like) có âm /d/ rất nhẹ giữa I và like: nghe kỹ để phân biệt với I like."),

  // ── T4 tuần 3: so sánh · bị động hiện tại · chép chính tả ──
  t4w3.grammar(1, 'My new phone is ___ than my old one.', ['cheaper', 'more cheap', 'cheapest', 'more cheaper'],
    'Tính từ ngắn + -er + than: cheaper than. Không thêm more.', 'từ loại'),
  t4w3.grammar(2, 'This is ___ restaurant in town.', ['the best', 'the better', 'best', 'the goodest'],
    'So sánh nhất của good là the best (luôn có the).', 'từ loại'),
  t4w3.grammar(3, 'English ___ in many countries.', ['is spoken', 'speaks', 'is speak', 'are spoken'],
    'Tiếng Anh "được nói" → bị động: is + V3 (spoken). English là số ít nên is.'),
  t4w3.grammar(4, 'These cars ___ in Japan.', ['are made', 'is made', 'make', 'are make'],
    'Bị động: are + V3 (made); these cars số nhiều nên are.'),
  t4w3.sound(5, STRESS_ODD, ['important', 'beautiful', 'family', 'hospital'],
    'important nhấn âm 2: im-POR-tant. beautiful, family, hospital nhấn âm 1.'),
  t4w3.listen(6, ['My brother is taller than me.', 'My brother is smaller than me.', 'My mother is taller than me.', 'My brother is the tallest.'],
    'Nghe đuôi -er và than đọc nhẹ /ðən/.'),

  // ── T4 tuần 4: ôn tổng chặng 1 (gắn đoạn Phát âm vì bài không có đoạn Ngữ pháp) ──
  t4w4.grammar(1, "I ___ my keys. I can't find them now.", ['have lost', 'lose', 'am losing', 'has lost'],
    'Việc trong quá khứ còn kết quả ở hiện tại (giờ không tìm thấy) → hiện tại hoàn thành; I đi với have.'),
  t4w4.grammar(2, 'Tomorrow it ___ sunny.', ['will be', 'is being', 'was', 'has been'],
    'Dự đoán cho tương lai (tomorrow) dùng will + be.'),
  t4w4.grammar(3, 'They ___ football every Sunday.', ['play', 'plays', 'are play', 'playing'],
    'Thói quen (every Sunday) → hiện tại đơn; they đi với động từ nguyên mẫu.'),
  t4w4.grammar(4, 'Hanoi is ___ than Hue.', ['bigger', 'more big', 'biggest', 'the bigger'],
    'big là tính từ ngắn: gấp đôi g rồi thêm -er → bigger than.', 'từ loại'),
  t4w4.sound(5, 'Chọn từ có trọng âm rơi vào âm tiết thứ 2.', ['decide', 'people', 'happy', 'money'],
    'Động từ hai âm tiết thường nhấn âm 2: de-CIDE. people, happy, money nhấn âm 1.'),
  t4w4.listen(6, ["We didn't see the movie.", "We don't see the movie.", "We didn't see the moon.", 'We did see the movie.'],
    "did đọc /dɪd/; didn't đọc /ˈdɪdənt/, có thêm âm mũi /n/ và được nhấn (từ phủ định là từ nội dung), còn /t/ cuối hay bị nuốt. Nghe âm /n/ và chỗ nhấn, đừng chờ /t/."),
]
