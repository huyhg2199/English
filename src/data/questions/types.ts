import type { SectionId } from '@/data/roadmap/types'

import type { RequiredConcept } from './concepts'

/**
 * Ngân hàng câu hỏi (story 9): câu tĩnh tự soạn theo khuôn ETS (không chép đề).
 * Mọi id là chuỗi viết tay, ổn định: lần làm (`quizzes`) và Sổ lỗi sai (`mistakes`) lưu theo id câu.
 */

/** Nhãn loại lỗi, đúng tập trong `learning-rules.md`. */
export const MISTAKE_TAGS = ['thì', 'từ loại', 'giới từ', 'phát âm', 'từ vựng', 'nghe'] as const
export type MistakeTag = (typeof MISTAKE_TAGS)[number]

/**
 * - `choice`: chọn đáp án điền chỗ trống (kiểu Part 5).
 * - `pronunciation`: chọn từ có âm khác / vị trí trọng âm khác.
 * - `listening`: TTS en-US đọc `audioText`, chọn câu đã nghe.
 * - `type` (story 35): gõ dạng đúng vào một chỗ trống, đề có đúng một `___`, gợi ý trong ngoặc đứng ngay sau chỗ trống (vd "She ___ (not / work) today.").
 * - `transform` (story 35): gõ lại cả câu theo yêu cầu tiếng Việt trong đề (đổi sang phủ định / câu hỏi / trả lời ngắn,
 *   hoặc dịch một câu Việt ngắn sang Anh). Mỗi câu chỉ một bước.
 *
 * Câu gõ chấm bằng `matchesTyped` (`@/lib/quiz`): không phân biệt hoa thường, dấu câu, khoảng trắng; n't = not.
 */
export type QuestionKind = 'choice' | 'pronunciation' | 'listening' | 'type' | 'transform'

/** Loại câu gõ (không có lựa chọn). */
export const TYPED_QUESTION_KINDS = ['type', 'transform'] as const
export type TypedQuestionKind = (typeof TYPED_QUESTION_KINDS)[number]
export type ChoiceQuestionKind = Exclude<QuestionKind, TypedQuestionKind>

type QuestionBase = {
  /** Ví dụ `q-s1-t1-w1-01`. */
  id: string
  lessonId: string
  sectionId: SectionId
  tag: MistakeTag
  /** Đề (tiếng Việt cho hướng dẫn, tiếng Anh cho câu; chỗ trống là `___`). */
  prompt: string
  /** Giải thích tiếng Việt ngắn. */
  explanation: string
  /**
   * Khái niệm cần để hiểu đề, chọn đúng đáp án và đọc hiểu giải thích (lựa chọn sai không tính), khai báo tay
   * (story 27). Quiz bài và mini test bỏ câu cần viên gạch chưa dạy. Câu T2–T4 chưa khai báo → không bao giờ bị lọc.
   */
  requires?: readonly RequiredConcept[]
}

/** Câu chọn đáp án (`choice` / `pronunciation` / `listening`): 4 lựa chọn, chấm bằng so khớp đúng. */
export type ChoiceQuestion = QuestionBase & {
  kind: ChoiceQuestionKind
  /** Câu TTS đọc (chỉ câu nghe); luôn là một trong `options`. */
  audioText?: string
  /** 4 lựa chọn khác nhau. */
  options: readonly [string, string, string, string]
  /** Đáp án đúng, trùng đúng một lựa chọn. */
  answer: string
}

/** Câu gõ (`type` / `transform`, story 35): không có lựa chọn, chấm bằng `matchesTyped`. */
export type TypedQuestion = QuestionBase & {
  kind: TypedQuestionKind
  /** Đáp án chuẩn (không rỗng). */
  answer: string
  /** Cách viết khác cũng đúng (vd "She is…" cho đáp án "She's…"); không trùng `answer` sau chuẩn hoá. */
  accept?: readonly string[]
}

export type Question = ChoiceQuestion | TypedQuestion

/** Câu gõ (`type` / `transform`). */
export function isTypedQuestion(q: Question): q is TypedQuestion {
  return (TYPED_QUESTION_KINDS as readonly string[]).includes(q.kind)
}
