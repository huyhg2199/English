import { getLessonEntry, SECTION_TITLES, type SectionId } from '@/data/roadmap'

/** Tên đoạn bài nguồn, ví dụ "Hiện tại đơn · nguyên âm đôi · Ngữ pháp". */
export function sourceLabel(lessonId: string, sectionId: string): string {
  const lesson = getLessonEntry(lessonId)?.lesson
  const section = Object.hasOwn(SECTION_TITLES, sectionId) ? SECTION_TITLES[sectionId as SectionId] : sectionId
  return lesson ? `${lesson.title} · ${section}` : section
}
