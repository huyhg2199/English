import { Award, Target } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Stage } from '@/data/roadmap'
import type { RoadmapProgress } from '@/lib/roadmap-progress'
import { cn } from '@/lib/utils'

import { Station, type StationState } from './Station'

type Props = { stage: Stage; progress: RoadmapProgress }

function stationState(id: string, progress: RoadmapProgress): StationState {
  if (progress.completed.has(id)) return 'done'
  if (progress.nextLessonId === id) return 'next'
  return 'locked'
}

/** Một Năm học: thẻ thông tin chặng rồi đường trạm theo tháng. */
export function StageMap({ stage, progress }: Props) {
  const lessons = stage.months.flatMap((m) => m.lessons)
  const doneCount = lessons.filter((l) => progress.completed.has(l.id)).length
  const headingId = `stage-${stage.id}`
  const { checkpoint } = stage

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <Card className={cn('gap-4', doneCount === lessons.length && 'border-primary/60')}>
        <CardHeader>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">{stage.yearLabel}</p>
          <CardTitle>
            <h2 id={headingId} className="text-xl leading-tight">
              Chặng {stage.number} · {stage.name}
            </h2>
          </CardTitle>
          <CardDescription>
            {stage.monthRange} ({stage.period}) · mục tiêu {stage.scoreGoal}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <p>{stage.focus}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
            <span>
              Điểm ước tính: <strong className="text-foreground">{stage.estimatedScore}*</strong>
            </span>
            <span>
              Đã qua:{' '}
              <strong className="text-foreground">
                {doneCount}/{lessons.length}
              </strong>{' '}
              trạm
            </span>
          </div>

          <div>
            <h3 className="mb-1 flex items-center gap-1.5 font-semibold">
              <Target className="size-4 text-primary" aria-hidden="true" />
              Can-do khi hết chặng
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {stage.canDo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-primary/40 bg-accent/40 p-3">
            <h3 className="mb-1 flex items-center gap-1.5 font-semibold text-accent-foreground">
              <Award className="size-4" aria-hidden="true" />
              Kỳ kiểm tra cuối chặng: {checkpoint.name} ({checkpoint.when})
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {checkpoint.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-2">{checkpoint.passThreshold}</p>
          </div>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-semibold marker:text-primary">Việc cần làm cố định</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {stage.fixedTasks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-semibold marker:text-primary">Nguồn miễn phí</summary>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {stage.resources.map((r) => (
                <li key={r.area} className="break-words">
                  <span className="text-foreground">{r.area}:</span> {r.items}
                </li>
              ))}
            </ul>
          </details>
        </CardContent>
      </Card>

      {stage.months.map((month) => (
        <div key={month.id}>
          <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
            Tháng {month.label} · {month.period}
            {month.note && ` · ${month.note}`}
          </h3>
          <ol
            className={cn(
              'relative flex flex-col',
              // Đường đi nối tâm các trạm.
              'before:absolute before:top-4 before:bottom-4 before:left-[21px] before:w-0.5 before:rounded-full before:bg-border',
            )}
          >
            {month.lessons.map((lesson) => (
              <Station
                key={lesson.id}
                lesson={lesson}
                monthLabel={month.label}
                state={stationState(lesson.id, progress)}
              />
            ))}
          </ol>
        </div>
      ))}
    </section>
  )
}
