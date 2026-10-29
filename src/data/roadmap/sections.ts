import type { Lesson, Section, SectionId, SkillTag } from './types'

/** Tên hiển thị của từng loại đoạn. */
export const SECTION_TITLES: Record<SectionId, string> = {
  pronunciation: 'Phát âm / Nghe',
  grammar: 'Ngữ pháp',
  vocabulary: 'Từ vựng (lũy kế)',
  entertainment: "10' giải trí",
  main: 'Bài chính',
  checkpoint: 'Kỳ kiểm tra',
}

export function section(id: SectionId, task: string, tags: readonly SkillTag[]): Section {
  return { id, title: SECTION_TITLES[id], task, tags }
}

export function vocabularyTask(words: number): string {
  return `Đạt ${words} từ lũy kế trong Anki`
}

/**
 * Builder cho tuần chặng 2/3: một đoạn chính, hoặc đoạn kiểm tra nếu có `checkpoint`.
 * Tag theo Part (1–4 → listening, 5–7 → reading) kèm grammar/vocabulary nếu ô có.
 */
export function partWeekBuilder(stageId: string) {
  return (
    id: string,
    monthId: string,
    week: Lesson['week'],
    title: string,
    task: string,
    tags: readonly SkillTag[],
    checkpoint?: { id: string; attempt: number },
  ): Lesson => ({
    id,
    stageId,
    monthId,
    week,
    title,
    sections: [section(checkpoint ? 'checkpoint' : 'main', task, tags)],
    ...(checkpoint && { checkpointId: checkpoint.id, checkpointAttempt: checkpoint.attempt }),
  })
}
