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
 */
export type QuestionKind = 'choice' | 'pronunciation' | 'listening'

export type Question = {
  /** Ví dụ `q-s1-t1-w1-01`. */
  id: string
  lessonId: string
  sectionId: SectionId
  tag: MistakeTag
  kind: QuestionKind
  /** Đề (tiếng Việt cho hướng dẫn, tiếng Anh cho câu; chỗ trống là `___`). */
  prompt: string
  /** Câu TTS đọc (chỉ câu nghe); luôn là một trong `options`. */
  audioText?: string
  /** 4 lựa chọn khác nhau. */
  options: readonly [string, string, string, string]
  /** Đáp án đúng, trùng đúng một lựa chọn. */
  answer: string
  /** Giải thích tiếng Việt ngắn. */
  explanation: string
  /**
   * Khái niệm cần để hiểu đề, chọn đúng đáp án và đọc hiểu giải thích (lựa chọn sai không tính), khai báo tay
   * (story 27). Quiz bài và mini test bỏ câu cần viên gạch chưa dạy. Câu T2–T4 chưa khai báo → không bao giờ bị lọc.
   */
  requires?: readonly RequiredConcept[]
}
