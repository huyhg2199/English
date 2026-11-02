import { compareSpeech, type Comparison } from '@/lib/pronunciation'

/**
 * Chấm chép chính tả (story 10): TTS đọc câu, Huy gõ lại, so từng từ.
 * Dùng lại so khớp của luyện nói (story 6): bỏ hoa/thường, dấu câu, nói tắt tách ra, căn theo LCS.
 */
export type DictationResult = Comparison & { typed: string }

/** Ô trống (chỉ khoảng trắng) thì không chấm. */
export function gradeDictation(expected: string, typed: string): DictationResult | null {
  if (typed.trim() === '') return null
  return { ...compareSpeech(expected, typed), typed: typed.trim() }
}
