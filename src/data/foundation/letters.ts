/**
 * Tên 26 chữ cái để TTS đọc (story 20, F02). iOS hay đọc sai chữ cái đứng một mình ("A" thành mạo từ, "H" bị nuốt),
 * nên mọi chỗ đọc chữ cái dùng tên chữ viết thành từ: màn hình hiện "H-U-Y", máy đọc "aitch, you, why".
 */
export const LETTER_SPEECH: Readonly<Record<string, string>> = {
  A: 'ay',
  B: 'bee',
  C: 'see',
  D: 'dee',
  E: 'ee',
  F: 'ef',
  G: 'jee',
  H: 'aitch',
  I: 'eye',
  J: 'jay',
  K: 'kay',
  L: 'el',
  M: 'em',
  N: 'en',
  O: 'oh',
  P: 'pee',
  Q: 'cue',
  R: 'are',
  S: 'ess',
  T: 'tee',
  U: 'you',
  V: 'vee',
  W: 'double you',
  X: 'ex',
  Y: 'why',
  Z: 'zee',
}

/** Ký tự không phải chữ cái hay gặp khi đánh vần email, mã số: đọc thành từ. Ký tự khác giữ nguyên. */
const SYMBOL_SPEECH: Readonly<Record<string, string>> = {
  '@': 'at',
  '.': 'dot',
  _: 'underscore',
}

/**
 * Chuỗi để TTS đánh vần `text` theo tên chữ: bỏ `-` và khoảng trắng, không phân biệt hoa thường, mỗi ký tự một mảnh,
 * nối bằng ", ". `spellForSpeech('H-U-Y')` → `"aitch, you, why"`. Số giữ nguyên (TTS đọc được), `@` → "at", `.` → "dot".
 */
export function spellForSpeech(text: string): string {
  return [...text.replace(/[-\s]/g, '')]
    .map((ch) => {
      const upper = ch.toUpperCase()
      if (Object.hasOwn(LETTER_SPEECH, upper)) return LETTER_SPEECH[upper]
      if (Object.hasOwn(SYMBOL_SPEECH, ch)) return SYMBOL_SPEECH[ch]
      return ch
    })
    .join(', ')
}
