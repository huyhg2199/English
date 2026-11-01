import type { Spell } from './types'

/**
 * Thần chú lấy cảm hứng HP (chỉ tên + mô tả tự viết, không dùng hình gốc).
 * Mỗi thì đã học là một thần chú; mở khoá khi bài chứa thì đó được đánh dấu xong.
 */
export const SPELLS: readonly Spell[] = [
  {
    id: 'lumos',
    name: 'Lumos',
    description: 'Thắp sáng câu đầu tiên: am / is / are để nói mình là ai, ở đâu, thế nào.',
    tenseId: 'to-be',
    lessonId: 's1-t1-w1',
  },
  {
    id: 'alohomora',
    name: 'Alohomora',
    description: 'Mở cánh cửa thói quen hằng ngày: hiện tại đơn, nhớ thêm -s/-es khi chủ ngữ là he / she / it.',
    tenseId: 'present-simple',
    lessonId: 's1-t1-w2',
  },
  {
    id: 'revelio',
    name: 'Revelio',
    description: 'Làm lộ ra điều còn giấu: hỏi và phủ định thì hiện tại đơn với do / does.',
    tenseId: 'present-simple-questions',
    lessonId: 's1-t1-w3',
  },
]

export function getSpell(id: string): Spell | undefined {
  return SPELLS.find((s) => s.id === id)
}
