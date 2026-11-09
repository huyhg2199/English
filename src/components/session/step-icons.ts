import { BookOpen, BookOpenCheck, Layers, Music, type LucideIcon } from 'lucide-react'

import type { SessionStepId } from '@/lib/sessions'

/** Icon của từng bước buổi học: stepper ngang, header và stepper dọc máy tính (story 30) dùng chung. */
export const STEP_ICONS: Record<SessionStepId, LucideIcon> = {
  theory: BookOpen,
  review: Layers,
  lesson: BookOpenCheck,
  srs: Layers,
  fun: Music,
}
