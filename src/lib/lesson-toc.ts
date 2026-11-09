import type { Section } from '@/data/roadmap'
import { THEORY_SECTION_IDS } from '@/lib/placement'

/**
 * Mục lục trang bài ở cột phụ máy tính (story 30): sinh từ đúng thứ tự `prioritizeSections`, chia nhóm Lý thuyết
 * (phát âm, ngữ pháp) / Luyện (đoạn khác) / Giải trí. Nhóm rỗng bị bỏ, số nhóm đánh lại từ 1.
 */
export type LessonTocKey = 'theory' | 'practice' | 'fun'

export type LessonTocItem = { id: string; title: string; priority: boolean; current: boolean }

export type LessonTocGroup = { key: LessonTocKey; title: string; items: LessonTocItem[] }

const GROUP_ORDER: readonly { key: LessonTocKey; label: string }[] = [
  { key: 'theory', label: 'Lý thuyết' },
  { key: 'practice', label: 'Luyện' },
  { key: 'fun', label: 'Giải trí' },
]

function groupOf(id: Section['id']): LessonTocKey {
  if (THEORY_SECTION_IDS.includes(id)) return 'theory'
  if (id === 'entertainment') return 'fun'
  return 'practice'
}

/** `targetId`: `sectionId` trên URL; mục trùng có `current` (id lạ → không mục nào). */
export function lessonTocGroups(
  ordered: readonly { section: Pick<Section, 'id' | 'title'>; priority: boolean }[],
  targetId?: string | null,
): LessonTocGroup[] {
  const groups = GROUP_ORDER.map(({ key, label }) => ({
    key,
    label,
    items: ordered
      .filter(({ section }) => groupOf(section.id) === key)
      .map(({ section, priority }) => ({
        id: section.id,
        title: section.title,
        priority,
        current: targetId != null && section.id === targetId,
      })),
  })).filter((g) => g.items.length > 0)
  return groups.map(({ key, label, items }, i) => ({ key, title: `${i + 1}. ${label}`, items }))
}
