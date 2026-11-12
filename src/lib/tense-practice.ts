import type { ApplyScreen, CheckItem, CheckScreenData, FadedScreen, WorkedScreen } from '@/data/foundation/types'
import type { Tense, TensePractice } from '@/data/lessons/types'
import { normalizeTyped } from '@/lib/quiz/typed'

/**
 * Phần luyện có bậc của thì (story 35): hàm thuần dựng 4 màn cho trình phát (`TensePractice.tsx`) và kiểm luật dữ liệu.
 * Không ghi Sổ lỗi, lần làm quiz, tiến độ hay điểm Nhà; chỉ câu nói ở bước áp dụng ghi điểm nói (`pronunciation`) như viên gạch.
 */

/** Thì có phần luyện. */
export type PracticeTense = Tense & { practice: TensePractice }

/**
 * Thứ chạy được phần luyện (story 39): thì có `practice` (`PracticeTense`) hoặc khối "Chọn thì" (`TenseChoice`). Trình phát
 * chỉ cần id, tên, công thức + quy tắc (phần "Xem lại giải thích") và 4 bước luyện.
 */
export type PracticeSubject = Pick<Tense, 'id' | 'name' | 'formulas' | 'rules'> & { practice: TensePractice }

export function hasPractice(tense: Tense): tense is PracticeTense {
  return tense.practice !== undefined
}

export type PracticeScreen = WorkedScreen | FadedScreen | CheckScreenData | ApplyScreen

/** Thứ tự bước của phần luyện. */
export const PRACTICE_STEP_KINDS = ['worked', 'faded', 'check', 'apply'] as const

/** 4 màn theo thứ tự `worked` → `faded` → `check` → `apply`, có `kind` như màn của viên gạch. */
export function practiceScreens(
  practice: TensePractice,
): readonly [WorkedScreen, FadedScreen, CheckScreenData, ApplyScreen] {
  return [
    { kind: 'worked', ...practice.worked },
    { kind: 'faded', ...practice.faded },
    { kind: 'check', ...practice.check },
    { kind: 'apply', ...practice.apply },
  ]
}

/** Số câu luyện chính cho phép và số câu dễ hơn bắt buộc. */
export const PRACTICE_MIN_ITEMS = 5
export const PRACTICE_MAX_ITEMS = 7
export const PRACTICE_EASIER_ITEMS = 2

const blank = (s: string | undefined) => s === undefined || s.trim() === ''

function blanksIn(text: string): number {
  return text.split('___').length - 1
}

/** Lỗi của một câu luyện (không kiểm id). */
function itemProblems(item: CheckItem): string[] {
  const out: string[] = []
  const at = item.id
  if (blank(item.hintVi)) out.push(`${at}: thiếu hintVi`)
  if (blank(item.explanationVi)) out.push(`${at}: thiếu explanationVi`)
  switch (item.kind) {
    case 'choice':
    case 'listen': {
      if (new Set(item.options.map((o) => o.trim())).size !== 3 || item.options.some((o) => blank(o)))
        out.push(`${at}: cần 3 lựa chọn khác nhau`)
      if (!(item.answer >= 0 && item.answer <= 2)) out.push(`${at}: answer ngoài 0–2`)
      if (item.kind === 'choice' && blank(item.prompt)) out.push(`${at}: thiếu prompt`)
      if (item.kind === 'listen' && blank(item.audioText)) out.push(`${at}: thiếu audioText`)
      break
    }
    case 'type': {
      if (blank(item.prompt)) out.push(`${at}: thiếu prompt`)
      if (blank(item.answer) || normalizeTyped(item.answer) === '') out.push(`${at}: answer rỗng`)
      for (const a of item.accept ?? []) {
        if (normalizeTyped(a) === '' || normalizeTyped(a) === normalizeTyped(item.answer))
          out.push(`${at}: accept "${a}" trùng answer hoặc rỗng`)
      }
      break
    }
    case 'order':
      if (item.tokens.length < 2) out.push(`${at}: order cần ≥ 2 mảnh`)
      break
    case 'sort':
      if (item.groups.length < 2) out.push(`${at}: sort cần ≥ 2 nhóm`)
      break
    case 'tapSyllable':
      if (item.syllables.join('') !== item.word) out.push(`${at}: âm tiết không ghép lại thành từ`)
      if (!(item.answer >= 0 && item.answer < item.syllables.length)) out.push(`${at}: answer ngoài khoảng`)
      break
  }
  return out
}

/**
 * Lỗi dữ liệu phần luyện của một thì (rỗng = hợp lệ; thì không có `practice` cũng rỗng):
 * - `faded.en` có đúng một `___`, `answer` không rỗng, mọi `accept` khác `answer`;
 * - `check.items` 5–7 câu, `check.easier` đúng 2 câu;
 * - id câu `${tense.id}-c<n>` / `${tense.id}-e<n>`, không trùng (kể cả câu `apply.item`);
 * - câu `choice` / `listen` có 3 lựa chọn khác nhau; câu `type` có `prompt`, `answer` không rỗng, mọi `accept` khác `answer`;
 * - mỗi câu có `hintVi` và `explanationVi`;
 * - câu nói ở bước áp dụng có id `${tense.id}-say-<n>`, không trùng, có chữ.
 */
export function practiceProblems(tense: Pick<Tense, 'id' | 'practice'>): string[] {
  const p = tense.practice
  if (!p) return []
  const id = tense.id
  const out: string[] = []

  if (blank(p.worked.en) || blank(p.worked.vi)) out.push(`${id}: worked thiếu en / vi`)
  if (blanksIn(p.faded.en) !== 1) out.push(`${id}: faded.en phải có đúng một ___`)
  if (blank(p.faded.answer) || normalizeTyped(p.faded.answer) === '') out.push(`${id}: faded.answer rỗng`)
  for (const a of p.faded.accept ?? []) {
    if (normalizeTyped(a) === '' || normalizeTyped(a) === normalizeTyped(p.faded.answer))
      out.push(`${id}: faded.accept "${a}" trùng answer hoặc rỗng`)
  }

  const { items, easier } = p.check
  if (items.length < PRACTICE_MIN_ITEMS || items.length > PRACTICE_MAX_ITEMS)
    out.push(`${id}: check.items cần ${PRACTICE_MIN_ITEMS}–${PRACTICE_MAX_ITEMS} câu (đang có ${items.length})`)
  if (easier.length !== PRACTICE_EASIER_ITEMS)
    out.push(`${id}: check.easier cần đúng ${PRACTICE_EASIER_ITEMS} câu (đang có ${easier.length})`)

  const seen = new Set<string>()
  const checkId = (itemId: string) => {
    if (seen.has(itemId)) out.push(`${id}: id câu trùng "${itemId}"`)
    seen.add(itemId)
  }
  const itemRe = (letter: 'c' | 'e') => new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-${letter}\\d+$`)
  for (const [list, letter] of [
    [items, 'c'],
    [easier, 'e'],
  ] as const) {
    for (const item of list) {
      if (!itemRe(letter).test(item.id)) out.push(`${id}: id câu "${item.id}" phải dạng ${id}-${letter}<n>`)
      checkId(item.id)
      out.push(...itemProblems(item))
    }
  }

  if (blank(p.apply.promptVi)) out.push(`${id}: apply thiếu promptVi`)
  if (p.apply.item) {
    checkId(p.apply.item.id)
    out.push(...itemProblems(p.apply.item))
  }
  const sayRe = new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-say-\\d+$`)
  const sayIds = new Set<string>()
  for (const s of p.apply.speak ?? []) {
    if (!sayRe.test(s.id)) out.push(`${id}: id câu nói "${s.id}" phải dạng ${id}-say-<n>`)
    if (sayIds.has(s.id)) out.push(`${id}: id câu nói trùng "${s.id}"`)
    sayIds.add(s.id)
    if (blank(s.text) || blank(s.vi)) out.push(`${id}: câu nói "${s.id}" thiếu text / vi`)
  }
  return out
}

/** Mọi id câu luyện của phần luyện (câu chính, câu dễ hơn, câu áp dụng), để test so với id câu của viên gạch. */
export function practiceItemIds(practice: TensePractice): string[] {
  return [
    ...practice.check.items.map((i) => i.id),
    ...practice.check.easier.map((i) => i.id),
    ...(practice.apply.item ? [practice.apply.item.id] : []),
  ]
}

/** Mọi chữ tiếng Anh của phần luyện (ví dụ, câu điền, đề / lựa chọn / đáp án câu luyện, câu mẫu, câu nói) để test nội dung. */
export function practiceEnglishTexts(practice: TensePractice): string[] {
  const itemTexts = (item: CheckItem): string[] => {
    switch (item.kind) {
      case 'choice':
        return [item.prompt, ...item.options]
      case 'listen':
        return [item.audioText, ...item.options]
      case 'type':
        return [item.prompt, item.answer, ...(item.accept ?? [])]
      case 'order':
        return [...item.tokens]
      case 'sort':
        return item.groups.flatMap((g) => g.items)
      case 'tapSyllable':
        return [item.word]
    }
  }
  return [
    practice.worked.en,
    practice.faded.en,
    practice.faded.answer,
    ...(practice.faded.accept ?? []),
    ...practice.check.items.flatMap(itemTexts),
    ...practice.check.easier.flatMap(itemTexts),
    ...(practice.apply.item ? itemTexts(practice.apply.item) : []),
    ...(practice.apply.sampleEn ? [practice.apply.sampleEn] : []),
    ...(practice.apply.speak ?? []).map((s) => s.text),
  ]
}
