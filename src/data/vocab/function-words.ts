import type { BrickId } from '@/data/foundation'

/**
 * Cổng hư từ (CAP-9, story 24): hư từ được dạy như ngữ pháp nên chỉ vào phần từ mới của phiên ôn khi cổng của nó đã mở
 * (`lockedNewWordIds` ở `src/lib/flashcard-session.ts`). Khoá ≠ mất: từ bị khoá để dành, mở thì về đúng hạng NGSL. Thẻ đã
 * có vẫn ôn theo lịch, và mọi thẻ của hư từ hiện dạng điền chỗ trống trong câu ví dụ (`forms`).
 *
 * Luật chọn (86 từ): mọi từ NGSL 1.2 hạng 1–300 có `pos` là `pronoun`, `preposition`, `conjunction` hoặc `determiner`
 * (66 từ), cộng 11 trợ / khuyết động từ (be, have, do, will, can, could, would, should, may, might, must) và 9 trạng từ
 * chức năng (not, where, how, when, there, always, never, often, why).
 *
 * `opensAfter`:
 * - `{ brick }`: viên gạch dạy nó đã dạy (`isBrickTaught`: xong viên, hàng qua kiểm tra, hoặc đã bỏ qua Sân ga).
 * - `{ lesson }`: bài đầu tiên dạy nó đã xong, hoặc bị bỏ qua khi Mũ Phân Loại xếp lớp (thường là bài Chặng 1). Modal ở
 *   `s1-t4-w1` (bài dạy khái niệm "động từ khuyết thiếu") gồm can, could, should, must, would (would like); can/could…
 *   dạy rời rạc trước đó không đủ nền. may (May I…?, `s2-t7-w3`) và might (câu điều kiện, `s2-t7-w4`) chưa dạy ở Chặng 1
 *   nên gắn bài Chặng 2 dạy chúng (story 45).
 *   than, more, most, less gắn `s1-t4-w3` (bài so sánh hơn/nhất): câu tự nhiên nào chứa chúng cũng là câu so sánh.
 * - `'wall'`: không viên hay bài nào dạy riêng, mở khi qua hoặc bỏ qua Sân ga.
 *
 * `forms`: các dạng của từ dùng để làm chỗ trống (chữ thường, có chính từ đó; token đầu tiên trong câu khớp một dạng bất kỳ bị thay `___`; câu ví dụ chỉ được có một token như vậy).
 */
export type FunctionWordGate = {
  opensAfter: { brick: BrickId } | { lesson: string } | 'wall'
  forms: readonly string[]
}

const brick = (id: BrickId, forms: readonly string[]): FunctionWordGate => ({ opensAfter: { brick: id }, forms })
const lesson = (id: string, forms: readonly string[]): FunctionWordGate => ({ opensAfter: { lesson: id }, forms })
const wall = (word: string): FunctionWordGate => ({ opensAfter: 'wall', forms: [word] })

const WALL_WORDS = [
  // giới từ
  'of', 'to', 'for', 'with', 'as', 'by', 'about', 'into', 'over', 'after', 'before', 'through', 'around', 'during',
  'without', 'against', 'until', 'within',
  // từ hạn định
  'all', 'which', 'no', 'such', 'both', 'another', 'each', 'few', 'enough',
  // liên từ
  'and', 'if', 'while', 'though', 'whether', 'although',
  // còn lại
  'something', 'why',
] as const

export const FUNCTION_WORD_GATES: Readonly<Record<string, FunctionWordGate>> = Object.freeze({
  // F09 Đại từ
  'ngsl-i': brick('F09', ['i', 'me', 'my']),
  'ngsl-you': brick('F09', ['you', 'your']),
  'ngsl-he': brick('F09', ['he', 'him', 'his']),
  'ngsl-she': brick('F09', ['she', 'her']),
  'ngsl-it': brick('F09', ['it', 'its']),
  'ngsl-we': brick('F09', ['we', 'us', 'our']),
  'ngsl-they': brick('F09', ['they', 'them', 'their']),
  // F11 Mạo từ
  'ngsl-the': brick('F11', ['the']),
  'ngsl-a': brick('F11', ['a', 'an']),
  // F12 this/that
  'ngsl-this': brick('F12', ['this', 'these']),
  'ngsl-that': brick('F12', ['that', 'those']),
  // F13 to be
  'ngsl-be': brick('F13', ['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being']),
  // F14 phủ định, từ để hỏi
  'ngsl-not': brick('F14', ['not']),
  'ngsl-what': brick('F14', ['what']),
  'ngsl-who': brick('F14', ['who']),
  'ngsl-where': brick('F14', ['where']),
  'ngsl-how': brick('F14', ['how']),
  'ngsl-from': brick('F14', ['from']),
  'ngsl-much': brick('F14', ['much']),
  // F15 There is/are, lượng từ + giới từ nơi chốn (some, any, many dời từ tường về F15 ở story 43)
  'ngsl-there': brick('F15', ['there']),
  'ngsl-in': brick('F15', ['in']),
  'ngsl-on': brick('F15', ['on']),
  'ngsl-under': brick('F15', ['under']),
  'ngsl-between': brick('F15', ['between']),
  'ngsl-some': brick('F15', ['some']),
  'ngsl-any': brick('F15', ['any']),
  'ngsl-many': brick('F15', ['many']),
  // F16 have/has + liên từ (but, or, because dời từ tường ở story 44; and, why giữ tường)
  'ngsl-have': brick('F16', ['have', 'has', 'had']),
  'ngsl-but': brick('F16', ['but']),
  'ngsl-or': brick('F16', ['or']),
  'ngsl-because': brick('F16', ['because']),
  // F18 at + trạng từ tần suất
  'ngsl-at': brick('F18', ['at']),
  'ngsl-every': brick('F18', ['every']),
  'ngsl-always': brick('F18', ['always']),
  'ngsl-never': brick('F18', ['never']),
  'ngsl-often': brick('F18', ['often']),
  // Bài đầu tiên dạy nó (Chặng 1; may, might ở Chặng 2: story 45)
  'ngsl-do': lesson('s1-t1-w3', ['do', 'does', 'did']),
  'ngsl-when': lesson('s1-t1-w3', ['when']),
  'ngsl-will': lesson('s1-t3-w1', ['will']),
  'ngsl-since': lesson('s1-t3-w4', ['since']),
  'ngsl-can': lesson('s1-t4-w1', ['can']),
  'ngsl-could': lesson('s1-t4-w1', ['could']),
  'ngsl-would': lesson('s1-t4-w1', ['would']),
  'ngsl-should': lesson('s1-t4-w1', ['should']),
  'ngsl-may': lesson('s2-t7-w3', ['may']),
  'ngsl-might': lesson('s2-t7-w4', ['might']),
  'ngsl-must': lesson('s1-t4-w1', ['must']),
  'ngsl-than': lesson('s1-t4-w3', ['than']),
  'ngsl-more': lesson('s1-t4-w3', ['more']),
  'ngsl-most': lesson('s1-t4-w3', ['most']),
  'ngsl-less': lesson('s1-t4-w3', ['less']),
  // Qua hoặc bỏ qua Sân ga
  ...Object.fromEntries(WALL_WORDS.map((w) => [`ngsl-${w}`, wall(w)])),
})

/** Cổng của một id thẻ (`ngsl-…`); không phải hư từ → `undefined`. */
export function functionWordGate(id: string): FunctionWordGate | undefined {
  return Object.hasOwn(FUNCTION_WORD_GATES, id) ? FUNCTION_WORD_GATES[id] : undefined
}
