import { allTenses, type LessonContent, type Tense, type TenseChoice } from '@/data/lessons'

/**
 * Hàm thuần cho khối "Chọn thì" (story 39): tra Tense của hai bên khối so sánh, và id thì của một bài (thì của bài rồi thì
 * của các bên khối) để tô câu phụ đề.
 */

export type ChoiceSide = { tense: Tense; whenVi: string; example: { en: string; vi: string } }

/**
 * Hai bên của khối so sánh, theo thứ tự `sides`, kèm Tense đầy đủ (tên, dòng thời gian, chip tín hiệu). Khối không có
 * `sides` (khối "Đừng dịch từng chữ") → `[]`. Side trỏ id không có trong `tenses` thì ném lỗi nêu rõ id.
 */
export function choiceSides(choice: Pick<TenseChoice, 'id' | 'sides'>, tenses: readonly Tense[] = allTenses()): ChoiceSide[] {
  return (choice.sides ?? []).map((side) => {
    const tense = tenses.find((t) => t.id === side.tenseId)
    if (!tense) throw new Error(`Khối "${choice.id}": không có thì "${side.tenseId}"`)
    return { tense, whenVi: side.whenVi, example: side.example }
  })
}

/** Id thì của bài: thì trong `grammar.tenses`, rồi thì của các bên khối "Chọn thì"; bỏ trùng, giữ thứ tự gặp đầu. */
export function lessonTenseIds(content: Pick<LessonContent, 'grammar'> | undefined): string[] {
  const ids = [
    ...(content?.grammar?.tenses ?? []).map((t) => t.id),
    ...(content?.grammar?.choices ?? []).flatMap((c) => (c.sides ?? []).map((s) => s.tenseId)),
  ]
  return [...new Set(ids)]
}
