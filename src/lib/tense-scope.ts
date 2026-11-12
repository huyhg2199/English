import { IRREGULAR_VERBS } from '@/data/lessons/irregular-verbs'

/**
 * Phạm vi chữ tiếng Anh theo thì (story 36, 37; luật "Chỉ dùng kiến thức đã dạy"): câu quiz, phần luyện và thẻ quy tắc của
 * một thì chỉ được dùng dạng động từ / hư từ đã dạy tới bài của thì đó. Ví dụ bài hiện tại đơn (T1) không có quá khứ hay
 * be + V-ing; bài was / were không có -ed hay V2 khác; bài will chưa có going to; bài hoàn thành chưa có since / modal.
 *
 * Story 37 thêm 7 chủ điểm T3–T4: mỗi chủ điểm dùng được mọi nhóm của T1–T2, các nhóm will → going to → hoàn thành →
 * since / how long → modal → so sánh → bị động hiện tại mở dần theo bài (bảng "Phạm vi chữ theo thì", Design Notes
 * story 37). Nhóm modal mở từ s1-t4-w1 (chủ điểm `modals`) là "can / could / should / must, have to, would like" (story 45:
 * could / couldn't, have / has to kể cả don't / doesn't have to và Do / Does … have to, would like / 'd like / Would … like).
 * Nhóm "luôn bị báo" (may / might / shall / ought, would và 'd ngoài would like, wouldn't, had to / having to / used to,
 * have got to / gotta, had + V3, quá khứ tiếp diễn, bị động quá khứ, "Don't + V") chưa dạy ở Chặng 1.
 * Lượng từ (F15, story 43) và liên từ (F16, story 44) dạy ở Sân ga nên mọi thì dùng được.
 *
 * Hàm thuần, chỉ test dữ liệu dùng (app không import).
 */

/** 6 thì T1–T2 (story 36). */
export const T1_T2_SCOPE_IDS = [
  'present-simple',
  'present-simple-questions',
  'present-continuous',
  'past-to-be',
  'past-simple',
  'past-simple-irregular',
] as const
/** 7 chủ điểm T3–T4 theo thứ tự lộ trình (story 37). */
export const T3_T4_SCOPE_IDS = [
  'will',
  'going-to',
  'present-perfect',
  'present-perfect-vs-past',
  'modals',
  'comparatives',
  'passive-present',
] as const
/** 13 thì / chủ điểm có bảng phạm vi: 6 thì T1–T2 rồi 7 chủ điểm T3–T4. */
export const TENSE_SCOPE_IDS = [...T1_T2_SCOPE_IDS, ...T3_T4_SCOPE_IDS] as const
export type TenseScopeId = (typeof TENSE_SCOPE_IDS)[number]
export type T1T2ScopeId = (typeof T1_T2_SCOPE_IDS)[number]

/** Từ đuôi -ed không phải quá khứ / V3 (tính từ, danh từ, động từ tận cùng -eed…). */
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

/**
 * Tính từ đuôi -ed hay đứng sau to be ("I was worried", "The shop is closed"): sau am / is / are / was / were / 's không tính
 * là bị động hay hoàn thành (review story 37). Chỉ dùng cho to be + -ed; đứng một mình vẫn là từ -ed (`isEd`).
 */
const ED_ADJECTIVES: ReadonlySet<string> = new Set([
  'worried',
  'surprised',
  'scared',
  'crowded',
  'relaxed',
  'pleased',
  'closed',
  'confused',
  'disappointed',
  'embarrassed',
  'shocked',
  'annoyed',
  'amazed',
  'satisfied',
  'frightened',
  'exhausted',
])

/** Từ đuôi -est không phải so sánh nhất ("the rest", "the test", "the honest boy"…). */
const NOT_SUPERLATIVE: ReadonlySet<string> = new Set([
  'rest',
  'test',
  'west',
  'guest',
  'interest',
  'forest',
  'nest',
  'honest',
  'modest',
  'chest',
  'vest',
  'pest',
  'quest',
  'request',
  'contest',
  'protest',
  'harvest',
])

const forms = (s: string) => s.split(' / ').map((f) => f.trim().toLowerCase())

/** V2 bất quy tắc khác V1 (trừ was / were / did: có nhóm riêng). */
const IRREGULAR_V2: ReadonlySet<string> = new Set(
  IRREGULAR_VERBS.flatMap((v) => forms(v.v2).filter((f) => f !== v.v1)).filter((f) => !['was', 'were', 'did'].includes(f)),
)

/** V3 khác V1 và khác V2 (gone, seen, been, eaten…): thì hoàn thành / bị động. */
const IRREGULAR_V3_ONLY: ReadonlySet<string> = new Set(
  IRREGULAR_VERBS.flatMap((v) => forms(v.v3).filter((f) => f !== v.v1 && !forms(v.v2).includes(f))),
)
/** Mọi V3 của bảng động từ (kể cả V3 trùng V1: come, put, read…). */
const IRREGULAR_V3: ReadonlySet<string> = new Set(IRREGULAR_VERBS.flatMap((v) => forms(v.v3)))

/** Từ đuôi -ed là quá khứ / V3 có quy tắc (trừ `NOT_PAST`). */
const isEd = (w: string) => /^[a-z]{2,}ed$/.test(w) && !NOT_PAST.has(w)
/** Dạng đứng sau have / has / had của thì hoàn thành: V2 / V3 bất quy tắc hoặc từ -ed. */
const isPerfectForm = (w: string) => IRREGULAR_V2.has(w) || IRREGULAR_V3.has(w) || isEd(w)
/** Dạng đứng sau to be của câu bị động: V3 bất quy tắc hoặc từ -ed (trừ tính từ -ed: worried, closed…). */
const isPassiveForm = (w: string) => IRREGULAR_V3.has(w) || (isEd(w) && !ED_ADJECTIVES.has(w))

const PAST_BE: ReadonlySet<string> = new Set(['was', 'were', "wasn't", "weren't", 'wasnt', 'werent'])
const DID: ReadonlySet<string> = new Set(["didn't", 'didnt'])
const DONT: ReadonlySet<string> = new Set(["don't", "doesn't", 'dont', 'doesnt'])
/** will, won't (story 37: mở từ bài will); 'll bắt riêng. */
const WILL: ReadonlySet<string> = new Set(['will', "won't", 'wont'])
/** can / could / should / must (mở từ bài modal, s1-t4-w1; could thêm ở story 45). have to, would like xét riêng. */
const MODALS: ReadonlySet<string> = new Set([
  'can',
  "can't",
  'cant',
  'cannot',
  'could',
  "couldn't",
  'couldnt',
  'should',
  "shouldn't",
  'shouldnt',
  'must',
  "mustn't",
  'mustnt',
])
/**
 * Modal chưa dạy ở Chặng 1: may, might, shall, ought, wouldn't, và would ngoài would like ('d bắt riêng). Luôn bị báo, trừ
 * would / 'd của would like khi thì đã mở modal (story 45, `isWouldLike`).
 */
const OTHER_MODALS: ReadonlySet<string> = new Set([
  'would',
  "wouldn't",
  'wouldnt',
  'may',
  'might',
  'shall',
  'ought',
])
/** Thì nào được dùng nhóm nào (bảng "Phạm vi chữ theo thì", Design Notes story 36 và 37). */
type Scope = {
  irregularV2: boolean
  pastBe: boolean
  did: boolean
  ed: boolean
  dont: boolean
  progressive: boolean
  /** will, won't, 'll. */
  will: boolean
  /** going to + V, gonna. */
  goingTo: boolean
  /** V3 khác V2; have / has / 've (+ not / ever / never / just / already) + V2 / V3 / -ed; 's + V3 / -ed. */
  perfect: boolean
  /** since, how long. */
  since: boolean
  /** can / could / should / must, have / has to, would like ('d like, Would … like). */
  modal: boolean
  /** than; the best / worst / most; the + -est. */
  comparative: boolean
  /** am / is / are / 'm / 're (+ not) + V3 / -ed: bị động hiện tại. */
  passive: boolean
}

const T1_T2_BASE = { will: false, goingTo: false, perfect: false, since: false, modal: false, comparative: false, passive: false }
/** Nền của mọi chủ điểm T3–T4: mọi nhóm của T1–T2 (cột `past-simple-irregular`). */
const T3_T4_BASE = { irregularV2: true, pastBe: true, did: true, ed: true, dont: true, progressive: true }

const SCOPES: Record<TenseScopeId, Scope> = {
  'present-simple': { ...T1_T2_BASE, irregularV2: false, pastBe: false, did: false, ed: false, dont: false, progressive: false },
  'present-simple-questions': { ...T1_T2_BASE, irregularV2: false, pastBe: false, did: false, ed: false, dont: true, progressive: false },
  'present-continuous': { ...T1_T2_BASE, irregularV2: false, pastBe: false, did: false, ed: false, dont: true, progressive: true },
  'past-to-be': { ...T1_T2_BASE, irregularV2: false, pastBe: true, did: false, ed: false, dont: true, progressive: true },
  'past-simple': { ...T1_T2_BASE, irregularV2: false, pastBe: true, did: true, ed: true, dont: true, progressive: true },
  'past-simple-irregular': { ...T1_T2_BASE, irregularV2: true, pastBe: true, did: true, ed: true, dont: true, progressive: true },
  will: { ...T3_T4_BASE, will: true, goingTo: false, perfect: false, since: false, modal: false, comparative: false, passive: false },
  'going-to': { ...T3_T4_BASE, will: true, goingTo: true, perfect: false, since: false, modal: false, comparative: false, passive: false },
  'present-perfect': { ...T3_T4_BASE, will: true, goingTo: true, perfect: true, since: false, modal: false, comparative: false, passive: false },
  'present-perfect-vs-past': { ...T3_T4_BASE, will: true, goingTo: true, perfect: true, since: true, modal: false, comparative: false, passive: false },
  modals: { ...T3_T4_BASE, will: true, goingTo: true, perfect: true, since: true, modal: true, comparative: false, passive: false },
  comparatives: { ...T3_T4_BASE, will: true, goingTo: true, perfect: true, since: true, modal: true, comparative: true, passive: false },
  'passive-present': { ...T3_T4_BASE, will: true, goingTo: true, perfect: true, since: true, modal: true, comparative: true, passive: true },
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
/** Quá khứ tiếp diễn was / were (+ not / chủ ngữ / trạng từ) + V-ing: dạy ở s1-t2-w4 (story 46), luôn bị báo. */
const PAST_PROGRESSIVE_RE = /\b(?:was|were|wasn't|weren't|wasnt|werent)(?: [a-z']+){0,2}? ([a-z]+ing)\b/g
/** Thì hoàn thành: have / has / 've (+ not / ever / never / just / already) + từ kế (xét bằng `isPerfectForm`). */
const PERFECT_RE =
  /\b(?:have|has|haven't|hasn't|havent|hasnt|[a-z]+'ve)(?: not)?(?: (?:ever|never|just|already))? ([a-z]+)\b/g
/**
 * 's + (never / just / already / not)? + từ kế: "My father's never driven", "She's finished" (xét bằng V3 / -ed như bị động).
 * "Let's + V" (Let's read, Let's come: V3 trùng V1) là câu rủ rê của F08, không tính.
 */
const S_PERFECT_RE = /\b(?!let's\b)[a-z]+'s(?: not)?(?: (?:ever|never|just|already))? ([a-z]+)\b/g
/** Câu hỏi hoàn thành: Have / Has (đầu câu hoặc sau từ để hỏi / how long) + 1–2 từ chủ ngữ + (ever…)? + V2 / V3 / -ed. */
const PERFECT_QUESTION_RE =
  /(?:^|[,.?!—–]\s*|\b(?:what|where|when|who|why|how|which|long) )(?:have|has|haven't|hasn't|havent|hasnt) ((?:[a-z']+ ){1,3}[a-z]+)/g
/** Quá khứ hoàn thành had / hadn't (+ not / ever / never / just / already) + V2 / V3 / -ed: luôn bị báo. */
const PAST_PERFECT_RE = /\b(?:had|hadn't|hadnt|[a-z]+'d)(?: not)?(?: (?:ever|never|just|already))? ([a-z]+)\b/g
/** Bị động hiện tại: am / is / are / isn't / aren't / 'm / 're (+ not) + V3 / -ed. */
const PASSIVE_RE = /\b(?:am|is|are|isn't|aren't|isnt|arent|[a-z]+'(?:m|re))(?: not)? ([a-z]+)\b/g
/** Câu hỏi bị động: Am / Is / Are (đầu câu hoặc sau từ để hỏi) + 1–3 từ + V3 / -ed ("Is English taught…?", "Are these old cups made…?"). */
const PASSIVE_QUESTION_RE = /(?:^|[,.?!—–]\s*|\b(?:what|where|when|who|why|how|which) )(?:am|is|are) ((?:[a-z']+ ){1,3}[a-z]+)/g
/** Bị động quá khứ: was / were / wasn't / weren't (+ not) + V3 / -ed, và câu hỏi Was / Were + 1–3 từ + V3 / -ed. */
const PAST_PASSIVE_RE = /\b(?:was|were|wasn't|weren't|wasnt|werent)(?: not)? ([a-z]+)\b/g
const PAST_PASSIVE_QUESTION_RE = /(?:^|[,.?!—–]\s*|\b(?:what|where|when|who|why|how|which) )(?:was|were) ((?:[a-z']+ ){1,3}[a-z]+)/g
/**
 * Câu hỏi / trả lời ngắn với do / does: câu mở đầu bằng Do / Does (đầu chuỗi hoặc sau , . ? ! —), Wh (+ 1 từ) + do / does
 * ("How often do…", "What time does…"), trả lời ngắn "Yes, she does." / "No, I don't".
 */
const DO_QUESTION_RES = [
  /(?:^|[,.?!—–-]\s*)(do|does)\b/g,
  /\b(?:what|where|when|who|why|how|which)(?: [a-z]+)? (do|does)\b/g,
  /\b(?:yes|no),? (?:i|you|he|she|it|we|they) (do|does)\b/g,
]
/**
 * "going to" + động từ (tương lai); "going to school / the park / Hanoi…" là đi đâu đó (V-ing của go), không tính. Xét trên
 * chữ giữ hoa thường: từ kế viết hoa là tên nơi chốn.
 */
const GOING_TO_RE =
  /\b[Gg]oing to\b(?! (?:[A-Z]|(?:the|a|an|my|your|his|her|its|our|their|school|work|bed|class|church)\b))/
/**
 * have to / has to / had to, having to, used to, have got to / 've got to, gotta. have to / has to (không got) mở cùng modal
 * (story 45, `HAVE_HAS_TO_RE`); các dạng còn lại luôn bị báo.
 */
const HAVE_TO_RE = /\b(?:have|has|had|having|used)(?: got)? to\b|\b[a-z]+'(?:ve|s|d) got to\b|\bgotta\b/g
/** have to / has to đúng nghĩa "phải" (cả trong don't / doesn't have to, Do / Does … have to): mở từ `modals`. */
const HAVE_HAS_TO_RE = /^ha(?:ve|s) to$/

/** Chủ ngữ được đứng giữa would và like: đại từ ("Would you like"), hoặc từ hạn định + 1 danh từ ("Would your son like"). */
const WOULD_LIKE_PRONOUNS: ReadonlySet<string> = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they'])
const WOULD_LIKE_DETERMINERS: ReadonlySet<string> = new Set(['my', 'your', 'his', 'her', 'our', 'their', 'the'])
/**
 * would / 'd của would like: từ kế là like ("would like", "I'd like"); hoặc would + chủ ngữ + like, chủ ngữ là một đại từ
 * ("Would you like") hay từ hạn định + 1 danh từ ("Would your son like", "What would your parents like?"). Mọi dạng khác
 * vẫn bị báo: would + động từ ("It would look like rain"), "would not like" (phủ định chưa dạy, như wouldn't), 'd + từ
 * khác ("You'd better like it").
 */
function isWouldLike(tokens: readonly string[], i: number): boolean {
  const next = tokens[i + 1]
  if (next === 'like') return true
  if (tokens[i] !== 'would' || next === undefined) return false
  if (WOULD_LIKE_PRONOUNS.has(next)) return tokens[i + 2] === 'like'
  return WOULD_LIKE_DETERMINERS.has(next) && tokens[i + 3] === 'like'
}
/**
 * "Don't + V" mở đầu câu (đầu chuỗi hoặc sau . ! ? —): câu mệnh lệnh phủ định chưa dạy. Luôn bị báo. Xét trên chữ giữ hoa
 * thường (D hoa), để lựa chọn "don't eat" của câu chọn đáp án (mảnh câu, viết thường) không bị tính.
 */
const DONT_IMPERATIVE_RE = /(?:^|[.!?—–]\s*)(Don'?t [a-z]+)/g
/** So sánh nhất: the best / worst / most, the + từ -est (trừ `NOT_SUPERLATIVE`). */
const SUPERLATIVE_RE = /\bthe ([a-z]+)\b/g

/** Từ kế của câu hỏi (sau chủ ngữ 1–3 từ, bỏ ever / never / just / already / not) có dạng `test` không. */
function questionHits(rest: string, test: (w: string) => boolean): string | undefined {
  const words = rest.split(' ').slice(1)
  return words.find((w) => !['ever', 'never', 'just', 'already', 'not'].includes(w) && test(w))
}

/**
 * Các từ / cụm ngoài phạm vi của thì `tenseId` có trong `englishText` (chữ thường, nháy cong coi như nháy thẳng; rỗng = hợp lệ).
 * `opts.wrongOption`: chữ là lựa chọn sai của câu chọn đáp án (chỉ nới `did` cho `past-to-be`, để so "Were you…?" với
 * "Did you…?").
 */
export function outOfScopeWords(tenseId: TenseScopeId, englishText: string, opts?: { wrongOption?: boolean }): string[] {
  const scope = SCOPES[tenseId]
  const cased = englishText.replace(/[’‘ʼ`´]/g, "'")
  const text = cased.toLowerCase()
  const tokens = text.match(/[a-z']+/g) ?? []
  const out: string[] = []
  const didAllowed = scope.did || (tenseId === 'past-to-be' && opts?.wrongOption === true)

  const words = tokens.map((raw) => raw.replace(/^'+|'+$/g, '')).filter((w) => w !== '')
  for (const [i, w] of words.entries()) {
    if (!scope.perfect && IRREGULAR_V3_ONLY.has(w)) out.push(w)
    else if (!scope.irregularV2 && IRREGULAR_V2.has(w)) out.push(w)
    else if (!scope.pastBe && PAST_BE.has(w)) out.push(w)
    else if (!scope.did && DID.has(w)) out.push(w)
    else if (!didAllowed && w === 'did') out.push(w)
    else if (!scope.dont && DONT.has(w)) out.push(w)
    else if (!scope.will && (WILL.has(w) || /^[a-z]+'ll$/.test(w))) out.push(w)
    else if (!scope.goingTo && w === 'gonna') out.push(w)
    else if (!scope.modal && MODALS.has(w)) out.push(w)
    else if (!scope.since && w === 'since') out.push(w)
    else if (!scope.comparative && w === 'than') out.push(w)
    else if (OTHER_MODALS.has(w) || /^[a-z]+'d$/.test(w)) {
      // would like / 'd like / Would … like mở cùng modal (story 45); would / 'd ngoài dạng đó vẫn bị báo.
      if (!(scope.modal && (w === 'would' || /^[a-z]+'d$/.test(w)) && isWouldLike(words, i))) out.push(w)
    }
    else if (!scope.ed && isEd(w)) out.push(w)
    // V-ing đứng một mình (lựa chọn sai "drinking", "living"…): chưa dạy trước s1-t2-w1.
    else if (!scope.progressive && /^[a-z]{2,}ing$/.test(w) && !NOT_PROGRESSIVE.has(w)) out.push(w)
  }

  if (!scope.goingTo && GOING_TO_RE.test(cased)) out.push('going to')
  if (!scope.since && /\bhow long\b/.test(text)) out.push('how long')
  if (!scope.dont) {
    for (const re of DO_QUESTION_RES) for (const m of text.matchAll(re)) out.push(m[1])
    if (/\b(?:do|does) not\b/.test(text)) out.push('do / does not')
  }
  if (!scope.progressive) {
    for (const re of [PROGRESSIVE_RE, PROGRESSIVE_QUESTION_RE]) {
      for (const m of text.matchAll(re)) if (!NOT_PROGRESSIVE.has(m[1])) out.push(m[0])
    }
  }
  if (!scope.perfect) {
    for (const m of text.matchAll(PERFECT_RE)) if (isPerfectForm(m[1])) out.push(m[0])
    for (const m of text.matchAll(S_PERFECT_RE)) if (isPassiveForm(m[1])) out.push(m[0])
    for (const m of text.matchAll(PERFECT_QUESTION_RE)) {
      const hit = questionHits(m[1], isPerfectForm)
      if (hit) out.push(`${m[0].trim()} (${hit})`)
    }
  }
  if (!scope.comparative) {
    for (const m of text.matchAll(SUPERLATIVE_RE)) {
      const w = m[1]
      if (['best', 'worst', 'most'].includes(w) || (/^[a-z]+est$/.test(w) && !NOT_SUPERLATIVE.has(w))) out.push(m[0])
    }
  }
  if (!scope.passive) {
    for (const m of text.matchAll(PASSIVE_RE)) if (isPassiveForm(m[1])) out.push(m[0])
    for (const m of text.matchAll(PASSIVE_QUESTION_RE)) {
      const hit = questionHits(m[1], isPassiveForm)
      if (hit) out.push(`${m[0].trim()} (${hit})`)
    }
  }
  // Luôn bị báo: quá khứ tiếp diễn, quá khứ hoàn thành, bị động quá khứ, had to / used to / got to, "Don't + V"
  // (have / has to mở cùng modal, story 45).
  for (const m of text.matchAll(PAST_PROGRESSIVE_RE)) if (!NOT_PROGRESSIVE.has(m[1])) out.push(m[0])
  for (const m of text.matchAll(PAST_PERFECT_RE)) if (isPerfectForm(m[1])) out.push(m[0])
  for (const m of text.matchAll(PAST_PASSIVE_RE)) if (isPassiveForm(m[1])) out.push(m[0])
  for (const m of text.matchAll(PAST_PASSIVE_QUESTION_RE)) {
    const hit = questionHits(m[1], isPassiveForm)
    if (hit) out.push(`${m[0].trim()} (${hit})`)
  }
  for (const m of text.matchAll(HAVE_TO_RE)) if (!(scope.modal && HAVE_HAS_TO_RE.test(m[0]))) out.push(m[0])
  for (const m of cased.matchAll(DONT_IMPERATIVE_RE)) out.push(m[1].toLowerCase())
  return out
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/**
 * Trạng ngữ thời gian cuối câu (so sau `normalizeTyped`): câu biến đổi / câu dịch có đáp án kết thúc bằng một trong các cụm
 * này thì `accept` phải có bản đặt trạng ngữ lên đầu câu (story 36; story 37 thêm tomorrow, tonight, this weekend,
 * this year, next …). "… ago" và "in + năm" bắt bằng `AGO_OR_YEAR_RE` của `frontedTimeTail`.
 */
export const TIME_TAILS: readonly string[] = [
  'yesterday',
  'today',
  'tomorrow',
  'tonight',
  'right now',
  'now',
  'this morning',
  'this week',
  'this weekend',
  'this year',
  ...['night', 'week', 'weekend', 'month', 'year', ...DAYS].map((w) => `last ${w}`),
  ...['day', 'morning', 'evening', 'night', 'week', 'weekend', ...DAYS].map((w) => `every ${w}`),
  ...['week', 'weekend', 'month', 'year', ...DAYS].map((w) => `next ${w}`),
]

/** "… ago" (số + minute / hour / day / week / month / year) và "in + năm" cuối câu (story 37), sau `normalizeTyped`. */
const AGO_OR_YEAR_RE =
  / ((?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+) (?:minute|hour|day|week|month|year)s? ago|in \d{4})$/

/**
 * Bản "trạng ngữ lên đầu" của một câu đã chuẩn hoá (`normalizeTyped`) kết thúc bằng một cụm trong `TIME_TAILS`, "… ago" hoặc
 * "in + năm" ("i played football last sunday" → "last sunday i played football", "we moved to hanoi three years ago" →
 * "three years ago we moved to hanoi"); không có trạng ngữ cuối câu → `undefined`. Cụm dài được xét trước ("right now" trước
 * "now").
 */
export function frontedTimeTail(normalized: string): string | undefined {
  const listed = [...TIME_TAILS].sort((a, b) => b.length - a.length).find((t) => normalized.endsWith(` ${t}`))
  const tail = AGO_OR_YEAR_RE.exec(normalized)?.[1] ?? listed
  if (!tail || normalized.length === tail.length + 1) return undefined
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

/**
 * Bản `'s` mà `accept` phải có (luật `'s` của story 37, dùng chung cho test quiz và test phần luyện): he / she / it + is, hoặc
 * chủ ngữ số ít (không phải I / you / we / they) + has (+ never / just / already / ever / not) + V3 / -ed (hoàn thành) →
 * câu đã rút gọn ("My father has never driven a car." → "My father's never driven a car."). has + danh từ ("She has a cat")
 * là "có", không rút gọn → `undefined`. Câu không có các dạng trên → `undefined`.
 */
export function sContraction(sentence: string): string | undefined {
  const be = /\b(he|she|it) is\b/i.exec(sentence)
  if (be) return sentence.replace(be[0], `${be[1]}'s`)
  const perfect = /\b(?!(?:i|you|we|they|who)\b)([a-z]+) has (?:(?:never|just|already|ever|not) )?([a-z]+)\b/i.exec(sentence)
  if (perfect && isPassiveForm(perfect[2].toLowerCase())) return sentence.replace(`${perfect[1]} has`, `${perfect[1]}'s`)
  return undefined
}
