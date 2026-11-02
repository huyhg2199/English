import type { Question } from '@/data/questions'

import { DEFAULT_GEMINI_MODEL, isValidModelName } from './key'

/**
 * "Vì sao sai?" (CAP-19): gọi Gemini REST thẳng từ trình duyệt bằng key của Huy (BYOK).
 * Key đi qua header `x-goog-api-key` (không nằm trong URL), không bao giờ log.
 * Chỉ gửi đề, các lựa chọn, đáp án đúng và đáp án Huy chọn; không gửi dữ liệu học nào khác.
 */

export const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

export type GeminiErrorCode =
  | 'no-key'
  | 'bad-model'
  | 'invalid-key'
  | 'bad-request'
  | 'model-not-found'
  | 'quota'
  | 'server'
  | 'network'
  | 'aborted'
  | 'empty'

export const GEMINI_ERROR_MESSAGES: Record<GeminiErrorCode, string> = {
  'no-key': 'Chưa có key Gemini. Nhập key ở phần cài đặt bên dưới để dùng "Vì sao sai?".',
  'bad-model': 'Tên model không hợp lệ. Kiểm tra lại ô model trong cài đặt.',
  'invalid-key': 'Key Gemini không hợp lệ hoặc không có quyền. Kiểm tra lại key trong cài đặt.',
  'bad-request': 'Gemini từ chối yêu cầu (có thể sai tên model). Kiểm tra lại cài đặt rồi thử lại.',
  'model-not-found': 'Không tìm thấy model này. Kiểm tra lại tên model trong cài đặt.',
  quota: 'Đã hết lượt miễn phí của Gemini (quota). Đợi một lúc rồi thử lại.',
  server: 'Máy chủ Gemini đang lỗi. Thử lại sau ít phút.',
  network: 'Không kết nối được tới Gemini. Kiểm tra mạng rồi thử lại.',
  aborted: 'Đã huỷ.',
  empty: 'Gemini không trả lời nội dung nào. Thử lại sau.',
}

export type ExplainResult = { ok: true; text: string } | { ok: false; code: GeminiErrorCode; message: string }

export type ExplainInput = {
  fetch: typeof globalThis.fetch
  key: string | null
  model?: string
  question: Pick<Question, 'kind' | 'prompt' | 'options' | 'answer'>
  /** Đáp án Huy chọn ('' khi bỏ trống). */
  chosen: string
  signal?: AbortSignal
}

function fail(code: GeminiErrorCode): ExplainResult {
  return { ok: false, code, message: GEMINI_ERROR_MESSAGES[code] }
}

const KIND_LABELS: Record<Question['kind'], string> = {
  choice: 'chọn đáp án đúng để điền vào chỗ trống',
  pronunciation: 'phát âm (chọn từ có âm / trọng âm khác)',
  listening: 'nghe một câu rồi chọn đúng câu đã nghe',
}

/** Prompt gửi Gemini: chỉ có đề, lựa chọn, đáp án đúng và đáp án đã chọn. */
export function buildExplainPrompt(question: ExplainInput['question'], chosen: string): string {
  return [
    'Bạn là giáo viên tiếng Anh cho người Việt mới học lại từ đầu (trình độ A1–A2).',
    `Dạng câu: ${KIND_LABELS[question.kind]}.`,
    `Đề: ${question.prompt}`,
    `Các lựa chọn: ${question.options.map((o) => `"${o}"`).join(', ')}`,
    `Đáp án đúng: "${question.answer}"`,
    `Người học đã chọn: ${chosen ? `"${chosen}"` : '(bỏ trống)'}`,
    '',
    'Trả lời hoàn toàn bằng tiếng Việt (câu ví dụ tiếng Anh kèm dịch), ngắn gọn, chữ thường không dùng markdown, đúng 3 phần:',
    'Lỗi sai: vì sao đáp án đã chọn sai.',
    'Quy tắc: quy tắc cần nhớ, 1–2 câu.',
    'Ví dụ đúng: đúng 2 câu ví dụ tiếng Anh đúng quy tắc, mỗi câu một dòng, kèm nghĩa tiếng Việt.',
  ].join('\n')
}

async function readError(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json()
    return JSON.stringify(body)
  } catch {
    return ''
  }
}

function codeForStatus(status: number, body: string): GeminiErrorCode {
  if (status === 400) return /API_KEY_INVALID|API key not valid/i.test(body) ? 'invalid-key' : 'bad-request'
  if (status === 401 || status === 403) return 'invalid-key'
  if (status === 404) return 'model-not-found'
  if (status === 429) return 'quota'
  if (status >= 500) return 'server'
  return 'bad-request'
}

function textOf(body: unknown): string {
  if (typeof body !== 'object' || body === null) return ''
  const candidates = (body as { candidates?: unknown }).candidates
  if (!Array.isArray(candidates)) return ''
  const parts = (candidates[0] as { content?: { parts?: unknown } } | undefined)?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts
    .map((p) => (typeof p === 'object' && p !== null && typeof (p as { text?: unknown }).text === 'string' ? (p as { text: string }).text : ''))
    .join('')
    .trim()
}

/**
 * Hỏi Gemini vì sao câu trả lời sai. Không có key → `no-key`, không gọi mạng.
 * Lỗi HTTP / mạng được đổi thành thông báo tiếng Việt. Không bao giờ ném lỗi.
 */
export async function explainMistake(input: ExplainInput): Promise<ExplainResult> {
  const key = input.key?.trim()
  if (!key) return fail('no-key')
  const model = input.model?.trim() || DEFAULT_GEMINI_MODEL
  if (!isValidModelName(model)) return fail('bad-model')

  let res: Response
  try {
    res = await input.fetch(`${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: buildExplainPrompt(input.question, input.chosen) }] }] }),
      signal: input.signal,
    })
  } catch (error) {
    return fail(error instanceof Error && error.name === 'AbortError' ? 'aborted' : 'network')
  }

  if (!res.ok) return fail(codeForStatus(res.status, await readError(res)))

  let body: unknown
  try {
    body = await res.json()
  } catch {
    return fail('empty')
  }
  const text = textOf(body)
  return text ? { ok: true, text } : fail('empty')
}
