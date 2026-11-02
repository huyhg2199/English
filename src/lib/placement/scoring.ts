import { STAGES } from '@/data/roadmap'
import type { Store } from '@/lib/storage'

import { HOUSES, PART_KEYS, PART_LIMITS, recordAttempt, type House, type PartKey, type PartScores } from './store'

export const PART_LABELS: Record<PartKey, string> = {
  p1: 'Part 1',
  p2: 'Part 2',
  p3: 'Part 3',
  p4: 'Part 4',
  p5: 'Part 5',
  p6: 'Part 6',
  p7: 'Part 7',
}

export type AttemptValidation =
  | { ok: true; parts: PartScores }
  | { ok: false; errors: Partial<Record<PartKey, string>> }

/** Kiểm từng ô nhập (chuỗi từ form): phải là số nguyên trong [0, giới hạn Part]. Lỗi bằng tiếng Việt. */
export function validateAttempt(raw: Partial<Record<PartKey, string>>): AttemptValidation {
  const errors: Partial<Record<PartKey, string>> = {}
  const parts = {} as PartScores
  for (const key of PART_KEYS) {
    const max = PART_LIMITS[key]
    const text = (raw[key] ?? '').trim()
    if (text === '') errors[key] = `Nhập số câu đúng của ${PART_LABELS[key]} (0–${max}).`
    else if (!/^\d+$/.test(text)) errors[key] = `Chỉ nhập số nguyên từ 0 đến ${max}.`
    else if (Number(text) > max) errors[key] = `${PART_LABELS[key]} chỉ có ${max} câu, nhập từ 0 đến ${max}.`
    else parts[key] = Number(text)
  }
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, parts }
}

/**
 * Bảng nội suy tự đặt: số câu đúng (0–100) → điểm phần (5–495).
 * ƯỚC TÍNH, không phải bảng quy đổi chính thức của ETS.
 */
const LISTENING_TABLE: readonly (readonly [number, number])[] = [
  [0, 5], [10, 25], [20, 60], [30, 110], [40, 160], [50, 215], [60, 270], [70, 330], [80, 390], [90, 445], [100, 495],
]
const READING_TABLE: readonly (readonly [number, number])[] = [
  [0, 5], [10, 15], [20, 45], [30, 90], [40, 140], [50, 195], [60, 250], [70, 310], [80, 370], [90, 430], [100, 495],
]

export const ESTIMATE_NOTE = 'Điểm ước tính theo bảng tự đặt, không phải bảng quy đổi chính thức của ETS.'

function interpolate(table: readonly (readonly [number, number])[], x: number): number {
  const c = Math.min(Math.max(x, table[0][0]), table[table.length - 1][0])
  for (let i = 1; i < table.length; i++) {
    const [x1, y1] = table[i]
    if (c <= x1) {
      const [x0, y0] = table[i - 1]
      const y = y0 + ((c - x0) * (y1 - y0)) / (x1 - x0)
      // Điểm TOEIC luôn là bội của 5.
      return Math.round(y / 5) * 5
    }
  }
  return table[table.length - 1][1]
}

export type ScoreEstimate = {
  listeningCorrect: number
  readingCorrect: number
  listening: number
  reading: number
  total: number
}

/** Listening = P1–P4 (0–100 câu), Reading = P5–P7 (0–100 câu), mỗi phần đổi sang 5–495. */
export function estimateScores(parts: PartScores): ScoreEstimate {
  const listeningCorrect = parts.p1 + parts.p2 + parts.p3 + parts.p4
  const readingCorrect = parts.p5 + parts.p6 + parts.p7
  const listening = interpolate(LISTENING_TABLE, listeningCorrect)
  const reading = interpolate(READING_TABLE, readingCorrect)
  return { listeningCorrect, readingCorrect, listening, reading, total: listening + reading }
}

/** Xếp chặng theo tổng ước tính: < 300 → chặng 1; 300–549 → chặng 2; ≥ 550 → chặng 3. Trả về bài đầu chặng. */
export function placementFor(total: number): { stageNumber: 1 | 2 | 3; lessonId: string } {
  const stageNumber = total >= 550 ? 3 : total >= 300 ? 2 : 1
  const stage = STAGES.find((s) => s.number === stageNumber)!
  return { stageNumber, lessonId: stage.months[0].lessons[0].id }
}

export const INTERESTS = ['film', 'music', 'news', 'code'] as const
export type Interest = (typeof INTERESTS)[number]

/** Phim → Gryffindor, nhạc → Hufflepuff, code → Ravenclaw, tin/chứng khoán → Slytherin. */
export const INTEREST_HOUSE: Record<Interest, House> = {
  film: 'gryffindor',
  music: 'hufflepuff',
  code: 'ravenclaw',
  news: 'slytherin',
}

export const HOUSE_LABELS: Record<House, string> = {
  gryffindor: 'Gryffindor',
  hufflepuff: 'Hufflepuff',
  ravenclaw: 'Ravenclaw',
  slytherin: 'Slytherin',
}

export type HouseQuestion = { id: string; prompt: string; options: Record<Interest, string> }

/** 4 câu hỏi sở thích; mỗi đáp án cộng 1 điểm cho Nhà tương ứng. */
export const HOUSE_QUESTIONS: readonly HouseQuestion[] = [
  {
    id: 'free-time',
    prompt: 'Rảnh 30 phút giờ trưa, bạn chọn gì?',
    options: { film: 'Xem một tập phim', music: 'Nghe vài bài hát', news: 'Lướt tin chứng khoán', code: 'Code dự án riêng' },
  },
  {
    id: 'before-sleep',
    prompt: 'Trước khi ngủ, điều gì giữ bạn thức lâu nhất?',
    options: { film: 'Phim hay series', music: 'Playlist yêu thích', news: 'Tin tức, thị trường', code: 'Một bug chưa sửa xong' },
  },
  {
    id: 'learn-from',
    prompt: 'Muốn học tiếng Anh từ đâu nhất?',
    options: { film: 'Thoại phim', music: 'Lời bài hát', news: 'Bài báo, bản tin', code: 'Tài liệu kỹ thuật, README' },
  },
  {
    id: 'weekend',
    prompt: 'Cuối tuần lý tưởng là…',
    options: { film: 'Cày phim', music: 'Đi xem nhạc / hát karaoke', news: 'Đọc phân tích, theo dõi cổ phiếu', code: 'Build một side project' },
  },
]

/** Đếm điểm Nhà từ các đáp án; hoà thì theo thứ tự Gryffindor → Hufflepuff → Ravenclaw → Slytherin. */
export function houseFor(answers: readonly Interest[]): House {
  const score: Record<House, number> = { gryffindor: 0, hufflepuff: 0, ravenclaw: 0, slytherin: 0 }
  for (const a of answers) score[INTEREST_HOUSE[a]]++
  let best: House = HOUSES[0]
  for (const h of HOUSES) if (score[h] > score[best]) best = h
  return best
}

/** Lưu một lần nhập điểm; bài bắt đầu (chỉ áp cho lần đầu) lấy theo `placementFor(estimateScores(parts).total)`. */
export function recordPlacementAttempt(store: Store, parts: PartScores, now: Date): { store: Store; id: string } {
  return recordAttempt(store, parts, now, placementFor(estimateScores(parts).total).lessonId)
}

export type PlacementFormErrors = Partial<Record<PartKey | 'house' | 'form', string>>

export type PlacementFormInput = {
  values: Partial<Record<PartKey, string>>
  /** Đáp án theo id câu hỏi (`HOUSE_QUESTIONS`). */
  answers: Readonly<Record<string, Interest | undefined>>
  /** Đã có ít nhất một lần nhập điểm. */
  done: boolean
  currentHouse: House | null
}

export type PlacementFormDecision =
  | { ok: false; errors: PlacementFormErrors }
  | { ok: true; parts: PartScores | null; house: House | null }

/**
 * Luật lưu form Mũ Phân Loại. Lần đầu cần cả điểm và đủ câu hỏi Nhà. Các lần sau: có ô điểm nào thì kiểm điểm;
 * có đáp án nào (hoặc chưa có Nhà) thì cần đủ câu; không nhập gì thì báo lỗi form. Lỗi bất kỳ → không lưu gì.
 */
export function decidePlacementSave({ values, answers, done, currentHouse }: PlacementFormInput): PlacementFormDecision {
  const anyScore = PART_KEYS.some((k) => (values[k] ?? '').trim() !== '')
  const answered = HOUSE_QUESTIONS.filter((q) => answers[q.id]).length
  const errors: PlacementFormErrors = {}
  let parts: PartScores | null = null
  if (anyScore || !done) {
    const result = validateAttempt(values)
    if (result.ok) parts = result.parts
    else Object.assign(errors, result.errors)
  }
  if ((answered > 0 || !currentHouse) && answered < HOUSE_QUESTIONS.length) {
    errors.house = `Trả lời đủ ${HOUSE_QUESTIONS.length} câu hỏi để Mũ chọn Nhà (còn ${HOUSE_QUESTIONS.length - answered} câu).`
  }
  if (done && !anyScore && answered === 0) {
    errors.form = 'Chưa nhập gì mới: điền điểm lần làm mới hoặc trả lời lại câu hỏi Nhà.'
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  const house = answered === HOUSE_QUESTIONS.length ? houseFor(HOUSE_QUESTIONS.map((q) => answers[q.id]!)) : null
  return { ok: true, parts, house }
}
