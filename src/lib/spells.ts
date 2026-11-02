import { SPELLS, type Spell } from '@/data/lessons'
import { readCompletedLessonIds } from '@/lib/roadmap-progress'
import type { Store } from '@/lib/storage'

/**
 * Thần chú đã mở khoá = thần chú có bài chứa thì đó đã đánh dấu xong. Chỉ phản ánh tiến độ hiện có
 * (không lưu key riêng): bỏ đánh dấu bài thì thần chú khoá lại, không phạt gì.
 */
export function unlockedSpells(store: Store): Spell[] {
  const done = new Set(readCompletedLessonIds(store))
  return SPELLS.filter((s) => done.has(s.lessonId))
}

export function isSpellUnlocked(store: Store, spellId: string): boolean {
  return unlockedSpells(store).some((s) => s.id === spellId)
}
