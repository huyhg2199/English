import { allLessons, STAGES, type Section, type SectionId, type SkillTag, type Stage } from '@/data/roadmap'
import { PRONUNCIATION_TARGET_PERCENT, pronunciationAverage } from '@/lib/pronunciation'
import { isSessionDay, localDayKey, sessionLesson } from '@/lib/sessions'
import { isRuleCardId, isSrsCard, readCards } from '@/lib/srs'
import type { Store } from '@/lib/storage'

import { estimateScores, type ScoreEstimate } from './scoring'
import { hasPlacement, listAttempts, PART_LIMITS, type PartScores } from './store'

/** Kỹ năng trên bảng khoảng cách (CAP-7), theo thứ tự hiển thị. */
export const GAP_SKILLS = ['listening', 'reading', 'grammar', 'vocabulary', 'pronunciation'] as const
export type GapSkill = (typeof GAP_SKILLS)[number]

export type SkillGap = {
  skill: GapSkill
  unit: 'score' | 'percent' | 'words'
  /** null = chưa có dữ liệu (không tính khoảng cách). */
  current: number | null
  target: number | null
  /** Giá trị ở lần làm đầu (mốc) cho Listening / Reading / Ngữ pháp; null với kỹ năng khác hoặc chưa đội Mũ. */
  baseline: number | null
  /** (mục tiêu − hiện tại) / mục tiêu, chặn trong [0, 1]; null khi chưa có dữ liệu. */
  gap: number | null
}

/** Chia mục tiêu chặng cho Listening / Reading. */
export const LISTENING_SHARE = 0.55
export const READING_SHARE = 0.45
/** Ngưỡng % đúng Part 5 + 6. */
export const GRAMMAR_TARGET_PERCENT = 70
/** Từ vựng chặng 2–3 (dữ liệu không có số): 1000 + 60 từ/tuần kể từ đầu chặng 2. */
export const VOCAB_BASE_AFTER_STAGE_1 = 1000
export const VOCAB_PER_WEEK_AFTER_STAGE_1 = 60

/** Cận trên `scoreGoal` của chặng: `0→300` → 300, `550→750+` → 750. */
export function stageGoal(stage: Stage): number {
  const numbers = stage.scoreGoal.match(/\d+/g)
  return numbers ? Number(numbers[numbers.length - 1]) : 0
}

export function normalizedGap(current: number, target: number): number {
  if (!(target > 0)) return 0
  return Math.min(1, Math.max(0, (target - current) / target))
}

/** Số thẻ SRS đã học (hợp lệ, không phải "Đã biết"). Thẻ quy tắc viên gạch (`rule:…`) không phải từ nên không tính. */
export function learnedCardCount(store: Store): number {
  return Object.entries(readCards(store.data.srs)).filter(([id, c]) => !isRuleCardId(id) && isSrsCard(c) && !c.known).length
}

/** Mục tiêu từ vựng của bài: `cumulativeWords`, hoặc 1000 + 60 × số tuần tính từ đầu chặng 2 (kể cả tuần này). */
export function vocabularyTargetFor(lessonId: string): number {
  const lessons = allLessons()
  const lesson = lessons.find((l) => l.id === lessonId)
  if (lesson?.cumulativeWords !== undefined) return lesson.cumulativeWords
  const later = lessons.filter((l) => l.stageId !== STAGES[0].id)
  const index = later.findIndex((l) => l.id === lessonId)
  return VOCAB_BASE_AFTER_STAGE_1 + VOCAB_PER_WEEK_AFTER_STAGE_1 * (index + 1)
}

export type SkillBoard = {
  /** Lần làm đầu (mốc) và mới nhất (hiện tại); null khi chưa đội Mũ. */
  baseline: ScoreEstimate | null
  latest: ScoreEstimate | null
  attemptCount: number
  stage: Stage
  rows: SkillGap[]
}

/**
 * Bảng 5 kỹ năng so với mục tiêu của chặng hiện tại (chặng của bài học tiếp theo; xong hết thì chặng cuối).
 * Phát âm = trung bình điểm tốt nhất các câu mẫu đã thử (mục tiêu 70%); chưa thử câu nào thì "chưa có dữ liệu".
 */
export function skillGaps(store: Store): SkillBoard {
  const attempts = listAttempts(store)
  const first = attempts[0]
  const last = attempts[attempts.length - 1]
  const current = sessionLesson(store)
  const stage = current?.stage ?? STAGES[STAGES.length - 1]
  const lessonId = current?.lesson.id ?? allLessons()[allLessons().length - 1].id
  const goal = stageGoal(stage)
  const latest = last ? estimateScores(last.parts) : null

  const row = (
    skill: GapSkill,
    unit: SkillGap['unit'],
    cur: number | null,
    target: number | null,
    baseline: number | null = null,
  ): SkillGap => ({
    skill,
    unit,
    current: cur,
    target,
    baseline,
    gap: cur === null || target === null ? null : normalizedGap(cur, target),
  })

  const grammarPercentOf = (parts: PartScores) =>
    Math.round(((parts.p5 + parts.p6) / (PART_LIMITS.p5 + PART_LIMITS.p6)) * 100)
  const grammarPercent = last ? grammarPercentOf(last.parts) : null
  const baselineScore = first ? estimateScores(first.parts) : null
  const listeningTarget = Math.round(goal * LISTENING_SHARE)
  const readingTarget = Math.round(goal * READING_SHARE)

  return {
    baseline: baselineScore,
    latest,
    attemptCount: attempts.length,
    stage,
    rows: [
      row('listening', 'score', latest?.listening ?? null, listeningTarget, baselineScore?.listening ?? null),
      row('reading', 'score', latest?.reading ?? null, readingTarget, baselineScore?.reading ?? null),
      row('grammar', 'percent', grammarPercent, GRAMMAR_TARGET_PERCENT, first ? grammarPercentOf(first.parts) : null),
      row('vocabulary', 'words', learnedCardCount(store), vocabularyTargetFor(lessonId)),
      (() => {
        const avg = pronunciationAverage(store)
        return row('pronunciation', 'percent', avg, avg === null ? null : PRONUNCIATION_TARGET_PERCENT)
      })(),
    ],
  }
}

/** Kỹ năng có khoảng cách lớn nhất (> 0); hoà thì theo thứ tự `GAP_SKILLS`. Không có thì null. */
export function weakestSkill(rows: readonly SkillGap[]): GapSkill | null {
  let best: SkillGap | null = null
  for (const r of rows) {
    if (r.gap === null || r.gap <= 0) continue
    if (!best || r.gap > best.gap!) best = r
  }
  return best?.skill ?? null
}

/** Kỹ năng yếu nhất của store; null khi chưa đội Mũ Phân Loại (kể cả đã có thẻ SRS) → không đổi thứ tự đoạn. */
export function weakestForStore(store: Store): GapSkill | null {
  return hasPlacement(store) ? weakestSkill(skillGaps(store).rows) : null
}

/** Đoạn lý thuyết của bài: luôn đứng trước các đoạn luyện, giữ nguyên thứ tự (`learning-rules.md`, Buổi học). */
export const THEORY_SECTION_IDS: readonly SectionId[] = ['pronunciation', 'grammar']

/**
 * Thứ tự đoạn theo luật "lý thuyết trước": [đoạn lý thuyết, giữ nguyên thứ tự] + [đoạn luyện mang tag của kỹ năng yếu
 * nhất] + [đoạn luyện còn lại], mỗi nhóm giữ thứ tự tương đối. Chỉ đoạn luyện (`vocabulary`, `checkpoint`, `main`, …)
 * được đẩy lên; đoạn lý thuyết không bao giờ bị đẩy xuống dưới đoạn luyện.
 * Cờ `priority` ("Ưu tiên") gắn cho mọi đoạn mang tag kỹ năng yếu nhất (kể cả đoạn lý thuyết), trừ đoạn giải trí 10'
 * (không bao giờ ưu tiên, giữ nguyên chỗ trong nhóm còn lại).
 * `weakest` null (chưa đội Mũ) → không đoạn nào ưu tiên; thứ tự chỉ đổi nếu dữ liệu có đoạn luyện đứng trước lý thuyết.
 */
export function prioritizeSections<T extends Pick<Section, 'id' | 'tags'>>(
  sections: readonly T[],
  weakest: SkillTag | null,
): { section: T; priority: boolean }[] {
  const marked = sections.map((section) => ({
    section,
    priority: weakest !== null && section.id !== 'entertainment' && section.tags.includes(weakest),
  }))
  const isTheory = (m: (typeof marked)[number]) => THEORY_SECTION_IDS.includes(m.section.id)
  const practice = marked.filter((m) => !isTheory(m))
  return [...marked.filter(isTheory), ...practice.filter((m) => m.priority), ...practice.filter((m) => !m.priority)]
}

/** Mục tiêu giờ học mỗi năm (CAP-7). */
export const YEARLY_HOURS_TARGET = 450

export type StudyHours = {
  minutes: number
  hours: number
  /** % của 450 giờ. */
  percentOfYear: number
  /** Số ngày tính từ buổi đầu tiên tới hôm nay (kể cả hai đầu); 0 khi chưa học. */
  days: number
  /** Giờ cần có tới hôm nay để giữ nhịp 450 giờ/năm. */
  paceHours: number
}

function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000)
}

/** Cộng `minutes` của nhật ký buổi học; nhịp cần = 450 × số ngày từ buổi đầu tiên / 365. */
export function studyHours(days: Record<string, unknown>, now: Date): StudyHours {
  let minutes = 0
  let firstKey: string | null = null
  for (const [key, entry] of Object.entries(days)) {
    if (!isSessionDay(entry) || !/^\d{4}-\d{2}-\d{2}$/.test(key)) continue
    minutes += entry.minutes
    if (firstKey === null || key < firstKey) firstKey = key
  }
  const hours = minutes / 60
  const elapsed = firstKey === null ? 0 : Math.max(1, dayNumber(localDayKey(now)) - dayNumber(firstKey) + 1)
  return {
    minutes,
    hours,
    percentOfYear: (hours / YEARLY_HOURS_TARGET) * 100,
    days: elapsed,
    paceHours: (YEARLY_HOURS_TARGET * elapsed) / 365,
  }
}

/** "4,8" — một chữ số thập phân, dấu phẩy kiểu Việt. */
export function formatHours(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1).replace('.', ',')
}
