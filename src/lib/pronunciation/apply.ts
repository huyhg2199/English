import type { Store } from '@/lib/storage'
import type { RecognitionErrorCode, RecognitionResult } from '@/lib/speech-recognition'

import { bestComparison, type ChosenComparison } from './compare'
import { recordAttempt } from './store'

/**
 * Kết quả một lượt nói, sau khi áp vào store:
 * - `result`: đã chấm và lưu điểm (best = max).
 * - `error`: lỗi micro / không nghe thấy / mạng…, kèm câu báo tiếng Việt; không lưu điểm.
 * - `unsupported`: trình duyệt không có nhận giọng nói → ẩn phần nói; không lưu điểm.
 * - `aborted`: người dùng tự dừng → xoá kết quả dòng đó, không báo lỗi; không lưu điểm.
 */
export type SpeakOutcome =
  | { kind: 'result'; comparison: ChosenComparison }
  | { kind: 'error'; error: Exclude<RecognitionErrorCode, 'unsupported' | 'aborted'>; message: string }
  | { kind: 'unsupported' }
  | { kind: 'aborted' }

/** Áp kết quả nhận giọng nói của câu mẫu vào store. Chỉ kết quả thành công mới đổi store. */
export function applyRecognition(
  store: Store,
  sentence: { id: string; text: string },
  result: RecognitionResult,
  now: Date,
): { store: Store; outcome: SpeakOutcome } {
  if (!result.ok) {
    if (result.error === 'unsupported') return { store, outcome: { kind: 'unsupported' } }
    if (result.error === 'aborted') return { store, outcome: { kind: 'aborted' } }
    return { store, outcome: { kind: 'error', error: result.error, message: result.message } }
  }
  const comparison = bestComparison(sentence.text, result.transcripts)
  return { store: recordAttempt(store, sentence.id, comparison.score, now), outcome: { kind: 'result', comparison } }
}
