import type { BrickId, BrickMeta, RowId } from './types'

/**
 * Danh mục 18 viên gạch (chỉ meta) theo bảng trong `learning-rules.md`, mục Sân ga 9¾.
 * Hàng A · Nghe & đọc được chữ (F01–F06), B · Viên gạch của câu (F07–F12),
 * C · Câu đầu tiên (F13–F16), D · Cầu sang Năm 1 (F17–F18).
 */
export const BRICKS: readonly BrickMeta[] = [
  {
    id: 'F01',
    row: 'A',
    title: 'Anh khác Việt ở 4 chỗ',
    minutes: 6,
    goalVi: 'Động từ đổi dạng, đuôi từ mang ngữ pháp, có mạo từ, âm cuối đổi nghĩa; S-V-O giống tiếng Việt',
    teaches: ['en-vs-vi', 'svo-order'],
    uses: [],
  },
  {
    id: 'F02',
    row: 'A',
    title: 'Bảng chữ cái & đánh vần',
    minutes: 8,
    goalVi: 'Nghe, nói tên 26 chữ cái (A/E/I, G/J), đánh vần tên, email, mã số',
    teaches: ['alphabet', 'spelling-out'],
    uses: [],
  },
  {
    id: 'F03',
    row: 'A',
    title: 'IPA là gì',
    minutes: 8,
    goalVi: 'Hiểu /…/ trong từ điển, đọc 10 ký hiệu gần tiếng Việt, dấu ː; từ đây thẻ từ hiện IPA',
    teaches: ['ipa', 'long-vowel-mark'],
    uses: ['alphabet'],
  },
  {
    id: 'F04',
    row: 'A',
    title: 'Nguyên âm, phụ âm, âm tiết, trọng âm',
    minutes: 8,
    goalVi: 'Đếm âm tiết, nhận âm nhấn ˈ và schwa, không chèn nguyên âm vào cụm phụ âm; từ đây thẻ từ tô trọng âm',
    teaches: ['syllables', 'stress', 'schwa', 'consonant-clusters'],
    uses: ['ipa'],
  },
  {
    id: 'F05',
    row: 'A',
    title: 'Âm cuối',
    minutes: 8,
    goalVi: 'Nghe và nói âm cuối người Việt hay nuốt (rice/rise/right, bag/back), cặp /iː/–/ɪ/',
    teaches: ['final-sounds', 'long-short-i'],
    uses: ['en-vs-vi', 'ipa', 'long-vowel-mark', 'syllables'],
  },
  {
    id: 'F06',
    row: 'A',
    title: 'Số, giá, giờ, ngày, tháng',
    minutes: 10,
    goalVi: 'Số 0–100, thirTEEN/THIRty, giá tiền, giờ, thứ, tháng, số thứ tự',
    teaches: ['numbers', 'teen-ty-stress', 'prices', 'clock-time', 'days-months', 'ordinals'],
    uses: ['stress', 'final-sounds'],
  },
  {
    id: 'F07',
    row: 'B',
    title: 'Từ loại',
    minutes: 8,
    goalVi: 'Danh, động, tính, trạng từ và nhóm "từ nhỏ", đuôi -tion/-ful/-ly; từ đây thẻ từ hiện nhãn từ loại',
    teaches: ['parts-of-speech', 'word-suffixes'],
    uses: ['en-vs-vi', 'stress'],
  },
  {
    id: 'F08',
    row: 'B',
    title: 'S + V (+ O)',
    minutes: 8,
    goalVi: "Câu phải có chủ ngữ, tính từ đứng trước danh từ; câu mệnh lệnh, Let's, Please",
    teaches: ['subject-verb', 'adjective-before-noun', 'imperatives'],
    uses: ['svo-order', 'parts-of-speech'],
  },
  {
    id: 'F09',
    row: 'B',
    title: 'Đại từ I/me/my',
    minutes: 8,
    goalVi: 'Bảng chủ ngữ, tân ngữ, tính từ sở hữu; tránh "I love she", "me name"',
    teaches: ['subject-pronouns', 'object-pronouns', 'possessive-adjectives'],
    uses: ['parts-of-speech', 'subject-verb'],
  },
  {
    id: 'F10',
    row: 'B',
    title: 'Số ít, số nhiều',
    minutes: 8,
    goalVi: '-s/-es/-ies, đọc đuôi /s z ɪz/, man/men, child/children, person/people',
    teaches: ['plurals', 'plural-s-sounds', 'irregular-plurals'],
    uses: ['ipa', 'final-sounds', 'numbers', 'parts-of-speech'],
  },
  {
    id: 'F11',
    row: 'B',
    title: 'a/an/the + đếm được',
    minutes: 10,
    goalVi: 'Quy tắc tối thiểu của mạo từ, danh từ không đếm được; tránh "a apple", "a water"',
    teaches: ['articles', 'countable-uncountable'],
    uses: ['en-vs-vi', 'ipa', 'parts-of-speech', 'plurals'],
  },
  {
    id: 'F12',
    row: 'B',
    title: "this/that + 's",
    minutes: 6,
    goalVi: 'this/that/these/those, "Huy\'s phone"; tránh "this books"',
    teaches: ['demonstratives', 'possessive-s'],
    uses: ['plurals', 'possessive-adjectives'],
  },
  {
    id: 'F13',
    row: 'C',
    title: 'to be khẳng định',
    minutes: 10,
    goalVi: 'am/is/are + danh từ/tính từ/nơi chốn; giới thiệu bản thân bằng 3 câu',
    teaches: ['be-affirmative'],
    uses: ['subject-verb', 'subject-pronouns', 'articles', 'adjective-before-noun'],
  },
  {
    id: 'F14',
    row: 'C',
    title: 'to be phủ định, hỏi + từ để hỏi',
    minutes: 10,
    goalVi: "isn't/aren't, câu hỏi, trả lời ngắn, what/where/who/how old/how much",
    teaches: ['be-negative', 'be-questions', 'wh-questions'],
    uses: ['be-affirmative', 'subject-pronouns', 'numbers', 'prices'],
  },
  {
    id: 'F15',
    row: 'C',
    title: 'There is/are + giới từ nơi chốn',
    minutes: 10,
    goalVi: 'Tả phòng hay ảnh với in/on/under/next to/between (TOEIC Part 1)',
    teaches: ['there-is-are', 'prepositions-of-place'],
    uses: ['be-affirmative', 'plurals', 'articles', 'countable-uncountable'],
  },
  {
    id: 'F16',
    row: 'C',
    title: 'have/has',
    minutes: 6,
    goalVi: 'Nói sở hữu, has với he/she/it, "I am 25"',
    teaches: ['have-has'],
    uses: ['subject-pronouns', 'be-affirmative', 'numbers', 'articles'],
  },
  {
    id: 'F17',
    row: 'D',
    title: 'Thì là gì',
    minutes: 8,
    goalVi: 'Nhận ra go/goes/going/went/gone trên trục thời gian; chỉ cần nhận ra',
    teaches: ['tenses-overview', 'verb-forms'],
    uses: ['en-vs-vi', 'subject-verb', 'be-affirmative'],
  },
  {
    id: 'F18',
    row: 'D',
    title: 'at/in/on + trạng từ tần suất',
    minutes: 8,
    goalVi: 'at + giờ, on + thứ, in + tháng; always/usually… đứng đâu; kể lịch một ngày',
    teaches: ['prepositions-of-time', 'frequency-adverbs'],
    uses: ['clock-time', 'days-months', 'parts-of-speech', 'subject-verb', 'tenses-overview'],
  },
]

/** Tên 4 hàng của bức tường. */
export const ROW_TITLES: Readonly<Record<RowId, string>> = {
  A: 'Nghe & đọc được chữ',
  B: 'Viên gạch của câu',
  C: 'Câu đầu tiên',
  D: 'Cầu sang Năm 1',
}

const BY_ID: ReadonlyMap<string, BrickMeta> = new Map(BRICKS.map((b) => [b.id, b]))

/** Meta của viên `id`; id không có trong danh mục → `undefined`. */
export function getBrickMeta(id: string): BrickMeta | undefined {
  return BY_ID.get(id)
}

/** Id có phải viên trong danh mục không. */
export function isBrickId(id: unknown): id is BrickId {
  return typeof id === 'string' && BY_ID.has(id)
}

/** Các viên của hàng `row`, theo thứ tự F01 → F18. */
export function bricksOfRow(row: RowId): readonly BrickMeta[] {
  return BRICKS.filter((b) => b.row === row)
}
