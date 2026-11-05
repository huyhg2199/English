import { brickIdFromLessonId, getBrickMeta } from '@/data/foundation'
import { getLessonEntry, SECTION_TITLES, sectionHref, type SectionId } from '@/data/roadmap'
import { brickHref } from '@/lib/foundation'

/** `lessonId` dạng `fNN` (câu Sân ga 9¾), kể cả id viên không có trong danh mục (`f99`). */
const FOUNDATION_LESSON = /^f\d{2}$/

/**
 * Tên nguồn của câu. Bài lộ trình: "Hiện tại đơn · nguyên âm đôi · Ngữ pháp". Câu Sân ga (`fNN`): "Viên gạch F03 · IPA là gì";
 * viên lạ → "Sân ga 9¾".
 */
export function sourceLabel(lessonId: string, sectionId: string): string {
  if (FOUNDATION_LESSON.test(lessonId)) {
    const id = brickIdFromLessonId(lessonId)
    const meta = id ? getBrickMeta(id) : undefined
    return meta ? `Viên gạch ${meta.id} · ${meta.title}` : 'Sân ga 9¾'
  }
  const lesson = getLessonEntry(lessonId)?.lesson
  const section = Object.hasOwn(SECTION_TITLES, sectionId) ? SECTION_TITLES[sectionId as SectionId] : sectionId
  return lesson ? `${lesson.title} · ${section}` : section
}

/** Link "Xem lại" của câu: câu Sân ga mở đúng viên (`/foundation/F03`, viên lạ → `/foundation`); câu khác về đoạn bài. */
export function questionSourceHref(lessonId: string, sectionId: string): string {
  if (FOUNDATION_LESSON.test(lessonId)) {
    const id = brickIdFromLessonId(lessonId)
    return id ? brickHref(id) : '/foundation'
  }
  return sectionHref(lessonId, sectionId)
}
