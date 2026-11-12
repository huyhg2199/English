import type { BrickId } from './types'

/**
 * Bảng thuật ngữ (story 26): chữ thuật ngữ trong lời tiếng Việt của thẻ thì (`TenseCard`) và bảng âm (`SoundTable`)
 * thành chip bấm được, mở thẻ tóm tắt viên gạch đã dạy nó. Không khoá theo tiến độ. Định nghĩa tự soạn (≤ 25 chữ).
 * Mục có thể là tên gọi tắt (V-ing / V2 / V3, story 39) mà viên đích có nhắc tới. Mục chỉ trỏ viên gạch, không trỏ bài.
 *
 * Cố ý không re-export từ `./index` (như `./content`): chỉ trang bài cần.
 *
 * Không có mục "thì": chữ "thì" tiếng Việt còn là liên từ ("nếu… thì…").
 */
export type GlossaryTerm = {
  id: string
  /** Tên hiện trên thẻ tóm tắt và nhãn đọc màn hình ("Thuật ngữ: {label}"). */
  label: string
  /**
   * Mẫu khớp trong lời tiếng Việt. Mẫu chữ khớp không phân biệt hoa thường; mẫu một ký tự (ký hiệu S, ˈ) khớp đúng ký tự.
   * Viên đích nhắc tới ít nhất một mẫu (test `glossary.test.ts`).
   */
  patterns: readonly string[]
  /** Viên gạch dạy thuật ngữ này. */
  brickId: BrickId
  /** Một câu định nghĩa tiếng Việt, ≤ 25 chữ. */
  definition: string
}

const term = (id: string, label: string, brickId: BrickId, patterns: readonly string[], definition: string): GlossaryTerm => ({
  id,
  label,
  brickId,
  patterns,
  definition,
})

export const GLOSSARY: readonly GlossaryTerm[] = [
  // F03
  term('ipa', 'IPA (phiên âm)', 'F03', ['IPA', 'phiên âm'], 'Bộ ký hiệu ghi cách đọc, đặt giữa hai dấu /…/ trong từ điển. Gồm ký hiệu âm và dấu ˈ (trọng âm), ː (âm dài).'),
  term('long-vowel', 'Âm dài (dấu ː)', 'F03', ['âm dài', 'nguyên âm dài', 'dấu ː'], 'Nguyên âm kéo dài hơi, ghi bằng dấu ː sau ký hiệu, như /iː/ trong sea.'),
  // F04
  term('vowel', 'Nguyên âm', 'F04', ['nguyên âm'], 'Âm phát ra khi hơi đi tự do, không bị chặn; thường là lõi của mỗi âm tiết.'),
  term('consonant', 'Phụ âm', 'F04', ['phụ âm'], 'Âm có hơi bị môi, lưỡi hay răng chặn lại một phần, như /b/, /k/, /s/.'),
  term('syllable', 'Âm tiết', 'F04', ['âm tiết'], 'Một nhịp nói, thường có một nguyên âm làm lõi. computer có 3 âm tiết: com-pu-ter.'),
  term(
    'stress',
    'Trọng âm',
    'F04',
    ['trọng âm', 'âm nhấn', 'ˈ'],
    'Âm tiết đọc to, dài và rõ hơn các âm tiết khác; trong IPA có dấu ˈ đứng ngay trước nó.',
  ),
  term('schwa', 'Schwa (âm yếu)', 'F04', ['schwa', 'âm yếu'], 'Âm /ə/ đọc rất nhẹ, như “ơ” lướt qua, hay nằm ở âm tiết không nhấn.'),
  term('cluster', 'Cụm phụ âm', 'F04', ['cụm phụ âm'], 'Hai, ba phụ âm đứng liền nhau như str, bl; đọc liền, không chèn thêm nguyên âm vào giữa.'),
  // F05
  term('final-sound', 'Âm cuối', 'F05', ['âm cuối'], 'Âm ở cuối từ, như /t/ trong right. Phải đọc rõ, vì đổi âm cuối là đổi nghĩa.'),
  // F06
  term('ordinal', 'Số thứ tự', 'F06', ['số thứ tự'], 'Số chỉ thứ tự: first, second, third…; dùng cho ngày trong tháng.'),
  // F07
  term('part-of-speech', 'Từ loại', 'F07', ['từ loại'], 'Nhóm của từ theo việc nó làm trong câu: danh từ, động từ, tính từ, trạng từ…'),
  term('noun', 'Danh từ', 'F07', ['danh từ'], 'Từ chỉ người, vật, nơi chốn hay ý niệm: teacher, book, city, idea.'),
  term('verb', 'Động từ', 'F07', ['động từ'], 'Từ chỉ hành động hay trạng thái: go, eat, like. Câu tiếng Anh nào cũng cần động từ.'),
  term('adjective', 'Tính từ', 'F07', ['tính từ'], 'Từ tả tính chất của danh từ: big, happy. Đứng trước danh từ hoặc sau am / is / are.'),
  term('adverb', 'Trạng từ', 'F07', ['trạng từ'], 'Từ bổ nghĩa cho động từ hay tính từ, thường có đuôi -ly: quickly, really.'),
  term('preposition', 'Giới từ', 'F07', ['giới từ'], 'Từ nhỏ đứng trước danh từ, chỉ vị trí, thời gian hay hướng: in, on, at, to.'),
  // F08
  term('subject', 'Chủ ngữ (S)', 'F08', ['chủ ngữ', 'S'], 'Người hay vật mà câu nói về, đứng trước động từ, viết tắt là S. Câu thường phải có chủ ngữ.'),
  term('object', 'Tân ngữ (O)', 'F08', ['tân ngữ'], 'Người hay vật nhận việc, đứng sau động từ, viết tắt là O: I like it.'),
  term('imperative', 'Câu mệnh lệnh', 'F08', ['câu mệnh lệnh'], 'Câu bảo người khác làm gì: bắt đầu bằng động từ, không có chủ ngữ. Open the door.'),
  // F09
  term('pronoun', 'Đại từ', 'F09', ['đại từ'], 'Từ thay cho tên người hay vật: I, you, he, she, it, we, they.'),
  term('possessive-adjective', 'Tính từ sở hữu', 'F09', ['tính từ sở hữu'], 'Từ đứng trước danh từ để nói của ai: my, your, his, her, its, our, their.'),
  // F10
  term('number', 'Số ít, số nhiều', 'F10', ['số nhiều', 'số ít'], 'Số ít là một; số nhiều là từ hai trở lên, danh từ thường thêm -s hoặc -es.'),
  // F11
  term('article', 'Mạo từ', 'F11', ['mạo từ'], 'a, an, the đứng trước danh từ: a / an là một cái bất kỳ, the là cái người nói và người nghe đều biết.'),
  term(
    'countable',
    'Đếm được, không đếm được',
    'F11',
    ['không đếm được', 'đếm được'],
    'Danh từ đếm được có số nhiều (two books); không đếm được thì không có a, không thêm -s: water.',
  ),
  // F12
  term('demonstrative', 'Từ chỉ định', 'F12', ['từ chỉ định', 'this/that', 'this / that'], 'this, these (gần) và that, those (xa) đứng trước danh từ để chỉ vật nào.'),
  // F13
  term('to-be', 'to be', 'F13', ['động từ to be', 'to be'], 'Động từ am / is / are, nối chủ ngữ với danh từ, tính từ hay nơi chốn: I am happy.'),
  term(
    'ordinary-verb',
    'Động từ thường',
    'F13',
    ['động từ thường'],
    'Động từ chỉ việc như agree, like, go, không phải am / is / are. Đã có động từ thường thì không thêm am / is / are.',
  ),
  // F14
  term('negative', 'Phủ định', 'F14', ['phủ định'], "Câu nói “không”: thêm not sau am / is / are, nói nhanh isn't, aren't."),
  term('question-word', 'Từ để hỏi', 'F14', ['từ để hỏi'], 'what, where, who, how… đứng đầu câu để hỏi gì, ở đâu, ai, thế nào.'),
  term('short-answer', 'Trả lời ngắn', 'F14', ['trả lời ngắn'], "Câu đáp Yes / No lặp lại to be của câu hỏi: Yes, I am. No, it isn't."),
  // F16
  term(
    'third-person-singular',
    'Ngôi thứ ba số ít',
    'F16',
    ['ngôi thứ ba số ít'],
    'Chủ ngữ he, she, it, hay một người, một vật khác. Với ngôi này, have thành has, work thành works.',
  ),
  // F17
  term(
    'base-form',
    'Động từ nguyên mẫu (dạng gốc)',
    'F17',
    ['động từ nguyên mẫu', 'nguyên mẫu', 'dạng gốc'],
    'Dạng ghi trong từ điển, không có to, chưa thêm -s, -ing hay đổi dạng: go, work.',
  ),
  term('past', 'Quá khứ', 'F17', ['quá khứ'], 'Thời gian đã qua. Động từ đổi dạng để nói việc đã xảy ra: go thành went.'),
  // Story 39: tên gọi tắt các dạng động từ và trợ động từ (F17 dạy go / going / went / gone, có chèn tên gọi tắt).
  term(
    'auxiliary',
    'Trợ động từ',
    'F17',
    ['trợ động từ'],
    'Từ nhận not và đổi lên đầu câu hỏi: am / is / are, was / were, do / does / did, will, have / has, can.',
  ),
  term('v-ing', 'V-ing', 'F17', ['V-ing'], 'Động từ thêm -ing (going, working), dùng sau am / is / are trong thì tiếp diễn.'),
  term(
    'v2',
    'V2 (quá khứ)',
    'F17',
    ['V2'],
    'Dạng quá khứ đơn của động từ: có quy tắc thêm -ed (worked), bất quy tắc phải thuộc (went).',
  ),
  term('v3', 'V3', 'F17', ['V3'], 'Dạng thứ 3 của động từ, dùng sau have / has: worked, gone, seen.'),
  // F18
  term(
    'frequency-adverb',
    'Trạng từ tần suất',
    'F18',
    ['trạng từ tần suất'],
    'Từ nói bao lâu một lần: always, usually, often, sometimes, never. Đứng trước động từ thường, sau am / is / are.',
  ),
]

export type GlossarySegment = { text: string } | { text: string; term: GlossaryTerm }

/** Chữ cái, số, dấu kết hợp hay dấu nháy: ký tự ngay trước và sau mẫu không được là các ký tự này. */
const WORD_CHAR = /[\p{L}\p{N}\p{M}'’]/u
/** Chữ có dấu tiếng Việt: đoạn giữa hai dấu "/" có chữ này thì không phải IPA (vd "danh từ/tính từ"). */
const VIETNAMESE = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i

type Pattern = { text: string; lower: string; exact: boolean; term: GlossaryTerm }

/** Mọi mẫu, dài trước ngắn sau. Mẫu một ký tự (S, ˈ) là ký hiệu: khớp đúng ký tự. */
const PATTERNS: readonly Pattern[] = GLOSSARY.flatMap((t) =>
  t.patterns.map((p) => ({ text: p, lower: p.toLowerCase(), exact: [...p].length === 1, term: t })),
).sort((a, b) => b.text.length - a.text.length)

/**
 * Đoạn IPA `/…/`: chữ ngay sau "/" mở và ngay trước "/" đóng không phải khoảng trắng, không quá 40 ký tự, không có chữ
 * tiếng Việt (để "am / is / are", "danh từ/tính từ" không bị coi là IPA). Trả về mảng cờ "nằm trong IPA" theo vị trí.
 */
function ipaMask(text: string): boolean[] {
  const mask = new Array<boolean>(text.length).fill(false)
  let open = text.indexOf('/')
  while (open !== -1) {
    const close = text.indexOf('/', open + 1)
    if (close === -1) break
    const inner = text.slice(open + 1, close)
    const isIpa = inner.length > 0 && inner.length <= 40 && !/^\s|\s$/.test(inner) && !inner.includes('\n') && !VIETNAMESE.test(inner)
    if (isIpa) {
      for (let i = open; i <= close; i++) mask[i] = true
      open = text.indexOf('/', close + 1)
    } else {
      open = close
    }
  }
  return mask
}

function matchAt(text: string, i: number, p: Pattern): boolean {
  const slice = text.slice(i, i + p.text.length)
  if (slice.length !== p.text.length) return false
  if (p.exact ? slice !== p.text : slice.toLowerCase() !== p.lower) return false
  const before = i > 0 ? text[i - 1] : ''
  const after = text[i + p.text.length] ?? ''
  return !WORD_CHAR.test(before) && !WORD_CHAR.test(after)
}

/**
 * Tách chuỗi lời tiếng Việt thành đoạn thường và đoạn thuật ngữ. Luật (story 26):
 * - quét trái sang phải, ở mỗi vị trí lấy mẫu dài nhất khớp được;
 * - ký tự ngay trước và sau mẫu không phải chữ, số hay dấu nháy;
 * - mẫu chữ khớp không phân biệt hoa thường, ký hiệu (S, ˈ) khớp đúng ký tự;
 * - không khớp bên trong đoạn IPA `/…/`;
 * - mỗi chuỗi chỉ chip lần xuất hiện đầu của mỗi mục (lần sau, kể cả dưới mẫu khác, để chữ thường — và không chip phần
 *   ngắn hơn nằm trong nó, vd "động từ" trong "động từ nguyên mẫu");
 * - ghép các đoạn lại đúng bằng chuỗi gốc.
 */
export function splitGlossaryText(text: string): GlossarySegment[] {
  const mask = ipaMask(text)
  const used = new Set<string>()
  const out: GlossarySegment[] = []
  let plainStart = 0
  let i = 0
  while (i < text.length) {
    const p = mask[i] ? undefined : PATTERNS.find((x) => matchAt(text, i, x))
    if (!p || mask[i + p.text.length - 1]) {
      i++
      continue
    }
    if (used.has(p.term.id)) {
      i += p.text.length
      continue
    }
    used.add(p.term.id)
    if (i > plainStart) out.push({ text: text.slice(plainStart, i) })
    out.push({ text: text.slice(i, i + p.text.length), term: p.term })
    i += p.text.length
    plainStart = i
  }
  if (plainStart < text.length) out.push({ text: text.slice(plainStart) })
  return out
}
