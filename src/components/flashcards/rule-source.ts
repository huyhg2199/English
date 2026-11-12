import { isBrickId } from '@/data/foundation'
import { IRREGULAR_VERBS_LESSON_ID } from '@/data/lessons'
import { getLesson, sectionHref } from '@/data/roadmap'
import { brickHref } from '@/lib/foundation'
import type { RuleStudyWord } from '@/lib/srs'

export type RuleSource = { label: string; link: { to: string; text: string } | null }

/**
 * Nguồn của thẻ quy tắc (story 24, 33, 38): nhãn sau "Thẻ quy tắc · " và link xem lại.
 * - Thẻ động từ bất quy tắc (`verbGroup`): nhãn "Động từ bất quy tắc", link "Xem lại bảng động từ" về đoạn Ngữ pháp s1-t2-w3.
 * - Thẻ của thì (`lessonId`): nhãn "T2 tuần 2", link "Xem lại bài" về đoạn Ngữ pháp; bài lạ → nhãn là id, không link.
 * - Thẻ viên gạch (`brickId`): nhãn "F13", link "Xem lại viên F13"; viên lạ → không link.
 */
export function ruleSource(word: Pick<RuleStudyWord, 'brickId' | 'lessonId' | 'verbGroup'>): RuleSource {
  if (word.verbGroup !== undefined) {
    return {
      label: 'Động từ bất quy tắc',
      link: { to: sectionHref(IRREGULAR_VERBS_LESSON_ID, 'grammar'), text: 'Xem lại bảng động từ' },
    }
  }
  if (word.lessonId !== undefined) {
    const lesson = getLesson(word.lessonId)
    if (!lesson) return { label: word.lessonId, link: null }
    return {
      label: `${lesson.monthId.toUpperCase()} tuần ${lesson.week}`,
      link: { to: sectionHref(word.lessonId, 'grammar'), text: 'Xem lại bài' },
    }
  }
  const brickId = word.brickId ?? ''
  return { label: brickId, link: isBrickId(brickId) ? { to: brickHref(brickId), text: `Xem lại viên ${brickId}` } : null }
}
