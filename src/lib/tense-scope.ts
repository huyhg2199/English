import { IRREGULAR_VERBS } from '@/data/lessons/irregular-verbs'

/**
 * Phạm vi chữ tiếng Anh theo thì (story 36, luật "Chỉ dùng kiến thức đã dạy"): câu quiz và phần luyện của một thì chỉ được
 * dùng dạng động từ / hư từ đã dạy tới bài của thì đó. Ví dụ bài hiện tại đơn (T1) không có quá khứ hay be + V-ing; bài
 * was / were không có -ed hay V2 khác.
 *
 * Hàm thuần, chỉ test dữ liệu dùng (app không import). Story 37 sẽ thêm các thì T3–T4 (will, going to, hoàn thành…).
 */

/** 6 thì T1–T2 có bảng phạm vi. */
export const TENSE_SCOPE_IDS = [
  'present-simple',
  'present-simple-questions',
  'present-continuous',
  'past-to-be',
  'past-simple',
  'past-simple-irregular',
] as const
export type TenseScopeId = (typeof TENSE_SCOPE_IDS)[number]

/** Từ đuôi -ed không phải quá khứ (tính từ, danh từ, động từ tận cùng -eed…). */
export const NOT_PAST: ReadonlySet<string> = new Set([
  'need',
  'red',
  'bed',
  'speed',
  'tired',
  'bored',
  'excited',
  'interested',
  'married',
  'hundred',
])

/** Từ đuôi -ing không phải V-ing của thì tiếp diễn (danh từ, tính từ). */
const NOT_PROGRESSIVE: ReadonlySet<string> = new Set([
  'thing',
  'something',
  'nothing',
  'anything',
  'everything',
  'morning',
  'evening',
  'king',
  'ring',
  'spring',
  'interesting',
  'boring',
  'amazing',
  'exciting',
  'building',
  'wedding',
  'ceiling',
  'during',
])

const forms = (s: string) => s.split(' / ').map((f) => f.trim().toLowerCase())

/** V2 bất quy tắc khác V1 (trừ was / were / did: có nhóm riêng). */
const IRREGULAR_V2: ReadonlySet<string> = new Set(
  IRREGULAR_VERBS.flatMap((v) => forms(v.v2).filter((f) => f !== v.v1)).filter((f) => !['was', 'were', 'did'].includes(f)),
)

/** V3 khác V1 và khác V2 (gone, seen, been, eaten…): thì hoàn thành / bị động, chưa dạy ở T1–T2. */
const IRREGULAR_V3_ONLY: ReadonlySet<string> = new Set(
  IRREGULAR_VERBS.flatMap((v) => forms(v.v3).filter((f) => f !== v.v1 && !forms(v.v2).includes(f))),
)

const PAST_BE: ReadonlySet<string> = new Set(['was', 'were', "wasn't", "weren't", 'wasnt', 'werent'])
const DID: ReadonlySet<string> = new Set(["didn't", 'didnt'])
const DONT: ReadonlySet<string> = new Set(["don't", "doesn't", 'dont', 'doesnt'])
const MODALS: ReadonlySet<string> = new Set([
  'will',
  "won't",
  'wont',
  'can',
  "can't",
  'cant',
  'cannot',
  'could',
  "couldn't",
  'should',
  "shouldn't",
  'must',
  "mustn't",
  'would',
  "wouldn't",
  'may',
  'might',
  'shall',
  'ought',
  'gonna',
])
/** Lượng từ, liên từ (story 43, 44) và "than" của câu so sánh (story 37). */
const QUANTIFIERS_LINKERS: ReadonlySet<string> = new Set(['some', 'any', 'many', 'much', 'lot', 'because', 'so', 'than'])

/** Thì nào được dùng nhóm nào (bảng "Phạm vi chữ theo thì", Design Notes story 36). */
type Scope = {
  irregularV2: boolean
  pastBe: boolean
  did: boolean
  ed: boolean
  dont: boolean
  progressive: boolean
}

const SCOPES: Record<TenseScopeId, Scope> = {
  'present-simple': { irregularV2: false, pastBe: false, did: false, ed: false, dont: false, progressive: false },
  'present-simple-questions': { irregularV2: false, pastBe: false, did: false, ed: false, dont: true, progressive: false },
  'present-continuous': { irregularV2: false, pastBe: false, did: false, ed: false, dont: true, progressive: true },
  'past-to-be': { irregularV2: false, pastBe: true, did: false, ed: false, dont: true, progressive: true },
  'past-simple': { irregularV2: false, pastBe: true, did: true, ed: true, dont: true, progressive: true },
  'past-simple-irregular': { irregularV2: true, pastBe: true, did: true, ed: true, dont: true, progressive: true },
}

export function isTenseScopeId(id: string): id is TenseScopeId {
  return (TENSE_SCOPE_IDS as readonly string[]).includes(id)
}

/**
 * am / is / are / 'm / 're / 's (+ not) + V-ing, và câu hỏi / câu có trạng từ: Am / Is / Are + 1–2 từ + V-ing
 * ("Is your mother cooking?", "She is still sleeping").
 */
const PROGRESSIVE_RE = /\b(?:am|is|are|isn't|aren't|isnt|arent|[a-z]+'(?:m|re|s))(?: not)? ([a-z]+ing)\b/g
const PROGRESSIVE_QUESTION_RE = /\b(?:am|is|are) (?:[a-z']+ ){1,2}?([a-z]+ing)\b/g
/** Quá khứ tiếp diễn was / were (+ not / chủ ngữ / trạng từ) + V-ing: dạy ở s1-t2-w4 (story 46), ngoài phạm vi cả 6 thì. */
const PAST_PROGRESSIVE_RE = /\b(?:was|were|wasn't|weren't|wasnt|werent)(?: [a-z']+){0,2}? ([a-z]+ing)\b/g
/** Thì hoàn thành: have / has / had / 've (+ not) + V2 bất quy tắc hoặc từ đuôi -ed (V3 trùng V2), story 37. */
const PERFECT_RE = /\b(?:have|has|had|haven't|hasn't|hadn't|havent|hasnt|hadnt|[a-z]+'ve)(?: not)? ([a-z]+)\b/g
/**
 * Câu hỏi / trả lời ngắn với do / does: câu mở đầu bằng Do / Does (đầu chuỗi hoặc sau , . ? ! —), Wh (+ 1 từ) + do / does
 * ("How often do…", "What time does…"), trả lời ngắn "Yes, she does." / "No, I don't".
 */
const DO_QUESTION_RES = [
  /(?:^|[,.?!—–-]\s*)(do|does)\b/g,
  /\b(?:what|where|when|who|why|how|which)(?: [a-z]+)? (do|does)\b/g,
  /\b(?:yes|no),? (?:i|you|he|she|it|we|they) (do|does)\b/g,
]
/** "going to" + động từ (tương lai, story 37); "going to school / the park…" là đi đâu đó (V-ing của go), không tính. */
const GOING_TO_RE = /\bgoing to\b(?! (?:the|a|an|my|your|his|her|its|our|their|school|work|bed|class|church)\b)/

/**
 * Các từ / cụm ngoài phạm vi của thì `tenseId` có trong `englishText` (chữ thường, nháy cong coi như nháy thẳng; rỗng = hợp lệ).
 * `opts.wrongOption`: chữ là lựa chọn sai của câu chọn đáp án (chỉ nới `did` cho `past-to-be`, để so "Were you…?" với
 * "Did you…?").
 */
export function outOfScopeWords(tenseId: TenseScopeId, englishText: string, opts?: { wrongOption?: boolean }): string[] {
  const scope = SCOPES[tenseId]
  const text = englishText.toLowerCase().replace(/[’‘ʼ`´]/g, "'")
  const tokens = text.match(/[a-z']+/g) ?? []
  const out: string[] = []
  const didAllowed = scope.did || (tenseId === 'past-to-be' && opts?.wrongOption === true)

  for (const raw of tokens) {
    const w = raw.replace(/^'+|'+$/g, '')
    if (w === '') continue
    if (IRREGULAR_V3_ONLY.has(w)) out.push(w)
    else if (!scope.irregularV2 && IRREGULAR_V2.has(w)) out.push(w)
    else if (!scope.pastBe && PAST_BE.has(w)) out.push(w)
    else if (!scope.did && DID.has(w)) out.push(w)
    else if (!didAllowed && w === 'did') out.push(w)
    else if (!scope.dont && DONT.has(w)) out.push(w)
    else if (MODALS.has(w) || /^[a-z]+'(?:ll|d)$/.test(w) || QUANTIFIERS_LINKERS.has(w)) out.push(w)
    else if (!scope.ed && /^[a-z]{2,}ed$/.test(w) && !NOT_PAST.has(w)) out.push(w)
    // V-ing đứng một mình (lựa chọn sai "drinking", "living"…): chưa dạy trước s1-t2-w1.
    else if (!scope.progressive && /^[a-z]{2,}ing$/.test(w) && !NOT_PROGRESSIVE.has(w)) out.push(w)
  }

  if (GOING_TO_RE.test(text)) out.push('going to')
  if (!scope.dont) {
    for (const re of DO_QUESTION_RES) for (const m of text.matchAll(re)) out.push(m[1])
    if (/\b(?:do|does) not\b/.test(text)) out.push('do / does not')
  }
  if (!scope.progressive) {
    for (const re of [PROGRESSIVE_RE, PROGRESSIVE_QUESTION_RE]) {
      for (const m of text.matchAll(re)) if (!NOT_PROGRESSIVE.has(m[1])) out.push(m[0])
    }
  }
  for (const m of text.matchAll(PAST_PROGRESSIVE_RE)) if (!NOT_PROGRESSIVE.has(m[1])) out.push(m[0])
  for (const m of text.matchAll(PERFECT_RE)) {
    if (IRREGULAR_V2.has(m[1]) || (/^[a-z]{2,}ed$/.test(m[1]) && !NOT_PAST.has(m[1]))) out.push(m[0])
  }
  return out
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/**
 * Trạng ngữ thời gian cuối câu (so sau `normalizeTyped`): câu biến đổi / câu dịch có đáp án kết thúc bằng một trong các cụm
 * này thì `accept` phải có bản đặt trạng ngữ lên đầu câu (story 36).
 */
export const TIME_TAILS: readonly string[] = [
  'yesterday',
  'today',
  'right now',
  'now',
  'this morning',
  'this week',
  ...['night', 'week', 'weekend', 'month', 'year', ...DAYS].map((w) => `last ${w}`),
  ...['day', 'morning', 'evening', 'night', 'week', 'weekend', ...DAYS].map((w) => `every ${w}`),
]

/**
 * Bản "trạng ngữ lên đầu" của một câu đã chuẩn hoá (`normalizeTyped`) kết thúc bằng một cụm trong `TIME_TAILS`
 * ("i played football last sunday" → "last sunday i played football"); không có trạng ngữ cuối câu → `undefined`.
 * Cụm dài được xét trước ("right now" trước "now").
 */
export function frontedTimeTail(normalized: string): string | undefined {
  const tail = [...TIME_TAILS].sort((a, b) => b.length - a.length).find((t) => normalized.endsWith(` ${t}`))
  if (!tail) return undefined
  return `${tail} ${normalized.slice(0, -(tail.length + 1))}`
}

/**
 * Phần tiếng Anh của một đề câu gõ (để kiểm phạm vi chữ): đề dịch "Dịch sang tiếng Anh: <câu Việt> (<gợi ý>)" → chỉ gợi ý;
 * đề biến đổi "Đổi …: <câu Anh>" → phần sau dấu ":" (kèm gợi ý trong ngoặc của phần yêu cầu, vd "(last Sunday)");
 * đề khác (câu điền, câu chọn) giữ nguyên.
 */
export function promptEnglish(prompt: string): string {
  const translate = /^Dịch sang tiếng Anh: .+ \(([^)]+)\)$/.exec(prompt)
  if (translate) return translate[1]
  const transform = /^Đổi ([^:]+): (.+)$/.exec(prompt)
  if (transform) {
    const cues = [...transform[1].matchAll(/\(([^)]+)\)/g)].map((m) => m[1])
    return [...cues, transform[2]].join(' · ')
  }
  return prompt
}
