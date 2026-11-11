/**
 * Chấm câu gõ (story 35): hàm duy nhất cho mọi ô gõ (câu quiz `type` / `transform`, ôn Sổ lỗi, câu luyện `type` của viên
 * gạch và phần luyện thì, màn "Tự điền một chỗ trống"). Không chấm mờ: chỉ chuẩn hoá rồi so bằng nhau, nên câu sai trật tự
 * từ vẫn sai. `checkFill` (`src/lib/subs/blanks.ts`) của bài video giữ nguyên.
 */

/** Rút gọn có nháy → dạng đầy đủ, theo ranh giới từ. `won't` / `can't` đứng trước luật chung `n't`. */
const APOSTROPHE_EXPANSIONS: readonly (readonly [RegExp, string])[] = [
  [/\bwon't\b/g, 'will not'],
  [/\bcan't\b/g, 'cannot'],
  [/\b(do|does|did|is|are|was|were|have|has|had|should|must|could|would|need|might)n't\b/g, '$1 not'],
  [/\bi'm\b/g, 'i am'],
  [/\b(you|we|they)'re\b/g, '$1 are'],
  [/\b(i|you|we|they)'ve\b/g, '$1 have'],
  [/\b(i|you|he|she|it|we|they)'ll\b/g, '$1 will'],
]

/**
 * Dạng n't gõ thiếu nháy, chỉ trong danh sách cố định (không mở rộng `were` → `we are`, không đoán `its`, `ill`…).
 * `'d` (had / would) không mở rộng, như `'s`: khi cần thì người soạn ghi vào `accept`.
 * `wont` / `cant` có nghĩa riêng nhưng trong câu luyện thì gần như chắc là won't / can't.
 */
const BARE_NEGATIONS: Readonly<Record<string, string>> = {
  dont: 'do not',
  doesnt: 'does not',
  didnt: 'did not',
  isnt: 'is not',
  arent: 'are not',
  wasnt: 'was not',
  werent: 'were not',
  havent: 'have not',
  hasnt: 'has not',
  hadnt: 'had not',
  wont: 'will not',
  cant: 'cannot',
  shouldnt: 'should not',
  mustnt: 'must not',
  couldnt: 'could not',
  wouldnt: 'would not',
  neednt: 'need not',
  mightnt: 'might not',
}

const BARE_NEGATION_RE = new RegExp(`\\b(${Object.keys(BARE_NEGATIONS).join('|')})\\b`, 'g')

/**
 * Chuẩn hoá chữ gõ để chấm, theo thứ tự:
 * 1. chữ thường; nháy cong / ʼ / backtick / ´ / ′ / ＇ → nháy thẳng;
 * 2. mở rộng rút gọn có nháy (won't, can't, n't, I'm, 're, 've, 'll); `'s` không mở rộng (is / has / sở hữu);
 * 3. mở rộng dạng n't thiếu nháy trong danh sách cố định (doesnt, isnt…);
 * 4. `can not` → `cannot`;
 * 5. bỏ mọi dấu câu còn lại (kể cả nháy), gộp khoảng trắng, trim.
 */
export function normalizeTyped(text: string): string {
  let out = text.toLowerCase().replace(/[‘’ʼ`´′＇]/g, "'")
  for (const [re, to] of APOSTROPHE_EXPANSIONS) out = out.replace(re, to)
  out = out.replace(BARE_NEGATION_RE, (w) => BARE_NEGATIONS[w] ?? w)
  out = out.replace(/\bcan\s+not\b/g, 'cannot')
  return out
    .replace(/'/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Chữ có dấu tiếng Việt (bộ gõ Telex / VNI còn bật: "isnt" thành "ínt", "are" thành "ảe"). Đáp án tiếng Anh không bao giờ có
 * các chữ này, nên ô gõ báo "tắt bộ gõ tiếng Việt" và không chấm, thay vì tính sai (story 35).
 */
/** Lời nhắc khi chữ gõ có dấu tiếng Việt: không chấm, gõ lại. */
export const VIETNAMESE_IME_WARNING = 'Chữ có dấu tiếng Việt: tắt bộ gõ tiếng Việt (Telex / VNI) rồi gõ lại nhé.'

export function hasVietnameseMarks(text: string): boolean {
  return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/iu.test(text.normalize('NFC'))
}

/**
 * Câu gõ đúng khi chữ gõ sau chuẩn hoá khác rỗng và bằng `expected` hoặc một mục `accept` sau chuẩn hoá. Như `checkFill`,
 * hai chuỗi giống nhau sau khi bỏ hết khoảng trắng cũng tính là bằng (checkin = check-in). Giới hạn đã biết của luật này:
 * "isnot" = "is not", "Iam" = "I am", "everyday" = "every day" đều tính đúng. Ô trống luôn sai.
 */
export function matchesTyped(expected: string, typed: string, accept?: readonly string[]): boolean {
  const t = normalizeTyped(typed)
  if (t === '') return false
  const squeezed = t.replace(/\s+/g, '')
  return [expected, ...(accept ?? [])].some((candidate) => {
    const e = normalizeTyped(candidate)
    return e !== '' && (e === t || e.replace(/\s+/g, '') === squeezed)
  })
}
