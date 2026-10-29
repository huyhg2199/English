/**
 * Mô hình lộ trình 3 chặng → 12 tháng → 48 tuần (mỗi tuần một bài).
 * Nội dung chép tay từ `lo-trinh-toeic-12-thang.md`; test đối chiếu lại với file đó.
 * Mọi id là chuỗi viết tay, ổn định: tiến độ, câu hỏi, Sổ lỗi sai sau này tham chiếu tới chúng.
 */

/** Đúng tập kỹ năng trong `learning-rules.md`. */
export const SKILL_TAGS = ['listening', 'reading', 'pronunciation', 'grammar', 'vocabulary'] as const
export type SkillTag = (typeof SKILL_TAGS)[number]

/**
 * Id đoạn trong bài. Chặng 1: pronunciation/grammar/vocabulary/entertainment.
 * Chặng 2–3: main. Tuần kiểm tra: checkpoint.
 */
export type SectionId = 'pronunciation' | 'grammar' | 'vocabulary' | 'entertainment' | 'main' | 'checkpoint'

export type Section = {
  id: SectionId
  /** Tên đoạn, ví dụ "Phát âm / Nghe". */
  title: string
  /** Việc cần làm, chép từ ô bảng tuần/tháng. */
  task: string
  tags: readonly SkillTag[]
}

export type Lesson = {
  /** Dạng `s1-t1-w3`: chặng 1, tháng T1, tuần 3. */
  id: string
  stageId: string
  monthId: string
  week: 1 | 2 | 3 | 4
  /** Tên ngắn hiện trên trạm. */
  title: string
  sections: readonly Section[]
  /** Từ vựng lũy kế cuối tuần (chỉ chặng 1). */
  cumulativeWords?: number
  /** Tuần kiểm tra trỏ tới kỳ kiểm tra của chặng. */
  checkpointId?: string
  /** Lần thứ mấy của kỳ kiểm tra (N.E.W.T. có 3 lần). */
  checkpointAttempt?: number
}

export type Month = {
  /** `t1` … `t12`. */
  id: string
  /** `T1` … `T12`. */
  label: string
  /** Như trong file lộ trình, ví dụ `11/26`. */
  period: string
  note?: string
  lessons: readonly Lesson[]
}

export type Checkpoint = {
  id: string
  /** O.W.L. 1, O.W.L. 2, N.E.W.T. */
  name: string
  /** Thời điểm, ví dụ "cuối T4". */
  when: string
  /** Phạm vi: phải làm những gì. */
  scope: readonly string[]
  /** Ngưỡng qua cửa. */
  passThreshold: string
  /** Chưa qua thì làm gì. */
  ifNotPassed: string
  /** Số lần làm (N.E.W.T. = 3). */
  attempts: number
}

export type Resource = {
  /** Mảng, ví dụ "Phát âm". */
  area: string
  items: string
  /** Đoạn mang tag nào thì hiện nguồn này. Rỗng = chỉ hiện ở thẻ chặng. */
  tags: readonly SkillTag[]
  /** Chỉ hiện ở đoạn kiểm tra (ví dụ đề chính thức để dành cho N.E.W.T.). */
  checkpointOnly?: boolean
}

export type Stage = {
  /** `s1` … `s3`. */
  id: string
  number: 1 | 2 | 3
  /** Nền móng / Công sở / Tăng tốc. */
  name: string
  /** Năm 1–2 / Năm 3–4 / Năm 5–7. */
  yearLabel: string
  /** Mục tiêu điểm, ví dụ `0→300`. */
  scoreGoal: string
  /** `T1–T4`. */
  monthRange: string
  /** `11/2026–02/2027`. */
  period: string
  focus: string
  /** Điểm ước tính cuối chặng, ví dụ `250–350`. */
  estimatedScore: string
  content: readonly string[]
  fixedTasks: readonly string[]
  resources: readonly Resource[]
  canDo: readonly string[]
  checkpoint: Checkpoint
  months: readonly Month[]
}
