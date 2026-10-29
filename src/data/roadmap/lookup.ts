import { stage1 } from './stage-1'
import { stage2 } from './stage-2'
import { stage3 } from './stage-3'
import type { Lesson, Month, Resource, Section, Stage } from './types'

/** 3 chặng theo thứ tự học. */
export const STAGES: readonly Stage[] = [stage1, stage2, stage3]
const stages = STAGES

type LessonEntry = { lesson: Lesson; month: Month; stage: Stage }

const ordered: readonly Lesson[] = stages.flatMap((s) => s.months.flatMap((m) => m.lessons))
const byId = new Map<string, LessonEntry>(
  stages.flatMap((stage) =>
    stage.months.flatMap((month) => month.lessons.map((lesson) => [lesson.id, { lesson, month, stage }] as const)),
  ),
)

/** Mọi bài theo thứ tự học (chặng → tháng → tuần). */
export function allLessons(): readonly Lesson[] {
  return ordered
}

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id)?.lesson
}

/** Bài kèm tháng và chặng chứa nó. */
export function getLessonEntry(id: string): LessonEntry | undefined {
  return byId.get(id)
}

/**
 * Trang bài cần hiện gì cho một cặp param route: bài (undefined → "Không tìm thấy bài")
 * và đoạn cần cuộn tới + highlight (undefined khi đoạn không có hoặc sai → mở từ đầu).
 */
export function resolveLessonRoute(
  lessonId: string | undefined,
  sectionId: string | undefined,
): { entry: LessonEntry | undefined; targetSectionId: string | undefined } {
  const entry = lessonId ? byId.get(lessonId) : undefined
  const targetSectionId =
    sectionId && entry?.lesson.sections.some((s) => s.id === sectionId) ? sectionId : undefined
  return { entry, targetSectionId }
}

export function getSection(lessonId: string, sectionId: string): Section | undefined {
  return getLesson(lessonId)?.sections.find((s) => s.id === sectionId)
}

/** Đường dẫn route (không có `#`) tới một bài. */
export function lessonHref(lessonId: string): string {
  return `/roadmap/lesson/${encodeURIComponent(lessonId)}`
}

/**
 * Đường dẫn route tới một đoạn trong bài. sectionId là một segment route vì hash router
 * đã chiếm phần `#` của URL. Story 9 dùng để link câu sai về đúng đoạn.
 */
export function sectionHref(lessonId: string, sectionId: string): string {
  return `${lessonHref(lessonId)}/${encodeURIComponent(sectionId)}`
}

/** Nguồn miễn phí của chặng phù hợp với một đoạn (theo tag). */
export function resourcesForSection(stage: Stage, section: Section): readonly Resource[] {
  const isCheckpoint = section.id === 'checkpoint'
  return stage.resources.filter(
    (r) => (!r.checkpointOnly || isCheckpoint) && r.tags.some((t) => section.tags.includes(t)),
  )
}
