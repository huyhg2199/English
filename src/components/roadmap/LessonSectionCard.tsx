import type { ReactNode } from 'react'
import { Link2, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { SKILL_LABELS } from '@/components/roadmap/skill-labels'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { resourcesForSection, sectionHref, type Lesson, type Section, type Stage } from '@/data/roadmap'
import { cn } from '@/lib/utils'

type Props = {
  lesson: Lesson
  stage: Stage
  section: Section
  highlighted?: boolean
  /** Đoạn thuộc kỹ năng yếu nhất (bảng kỹ năng): hiện nhãn "Ưu tiên". */
  priority?: boolean
  /** Nội dung học của đoạn (story 6), hiện sau việc cần làm. */
  children?: ReactNode
}

/** Một đoạn của bài: việc cần làm, kỹ năng, kỳ kiểm tra và nguồn miễn phí (trang bài và buổi học dùng chung). */
export function LessonSectionCard({ lesson, stage, section, highlighted = false, priority = false, children }: Props) {
  const resources = resourcesForSection(stage, section)
  return (
    <Card
      id={section.id}
      className={cn(
        'scroll-mt-4 gap-4 transition-shadow',
        highlighted && 'border-primary shadow-[0_0_24px_var(--candle-glow)] ring-2 ring-primary/50',
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <h2>{section.title}</h2>
            {priority && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                <Sparkles className="size-3" aria-hidden="true" />
                Ưu tiên
              </span>
            )}
          </span>
          <Link
            to={sectionHref(lesson.id, section.id)}
            aria-label={`Link tới đoạn ${section.title}`}
            className="text-muted-foreground hover:text-primary"
          >
            <Link2 className="size-4" aria-hidden="true" />
          </Link>
        </CardTitle>
        <ul className="flex flex-wrap gap-1.5" aria-label="Kỹ năng">
          {section.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {SKILL_LABELS[tag]}
            </li>
          ))}
        </ul>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p className="text-base">{section.task}</p>

        {children}

        {section.id === 'checkpoint' && (
          <div className="rounded-lg border border-primary/40 bg-accent/40 p-3">
            <p className="mb-1 font-semibold text-accent-foreground">
              {stage.checkpoint.name}
              {lesson.checkpointAttempt && stage.checkpoint.attempts > 1
                ? ` · lần ${lesson.checkpointAttempt}/${stage.checkpoint.attempts}`
                : ''}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {stage.checkpoint.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-2">{stage.checkpoint.passThreshold}</p>
            <p className="mt-1 text-muted-foreground">{stage.checkpoint.ifNotPassed}</p>
          </div>
        )}

        {resources.length > 0 && (
          <div>
            <h3 className="mb-1 font-semibold">Nguồn miễn phí</h3>
            <ul className="space-y-1 text-muted-foreground">
              {resources.map((r) => (
                <li key={r.area} className="break-words">
                  <span className="text-foreground">{r.area}:</span> {r.items}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
