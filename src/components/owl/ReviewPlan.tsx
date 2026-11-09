import { BookX, CalendarCheck, Compass, RotateCw } from 'lucide-react'
import { Link } from 'react-router'

import { TagBadge } from '@/components/quiz/QuestionCard'
import { sourceLabel } from '@/components/quiz/source-label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MISTAKES_HREF } from '@/data/questions'
import { sectionHref } from '@/data/roadmap'
import { OWL_HREF, OWL_PART_LABELS, type ActivePlan, type ReviewPlan, type ReviewPlanDay } from '@/lib/owl'
import { cn } from '@/lib/utils'

function shortDate(key: string): string {
  const [, m, d] = key.split('-')
  return `${Number(d)}/${Number(m)}`
}

function dayTask(day: ReviewPlanDay): string {
  return day.mistakeIds.length > 0 ? `ôn ${day.mistakeIds.length} mục Sổ lỗi` : 'ôn các mục Sổ lỗi đến hạn'
}

/** 14 ngày của kế hoạch ôn: mỗi ngày một đoạn bài (có link) + ôn Sổ lỗi. */
export function ReviewPlanList({ plan, todayIndex }: { plan: ReviewPlan; todayIndex?: number }) {
  return (
    <ol className="flex flex-col gap-2">
      {plan.days.map((day, i) => (
        <li
          key={day.date}
          className={cn(
            'flex flex-col gap-1 rounded-lg border p-2.5 text-sm',
            i === todayIndex && 'border-primary bg-accent/30',
            todayIndex !== undefined && i < todayIndex && 'opacity-60',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">
              Ngày {i + 1} · {shortDate(day.date)}
              {i === todayIndex && <span className="text-primary"> · hôm nay</span>}
            </span>
            <TagBadge tag={day.tag} />
          </div>
          <Link
            to={sectionHref(day.lessonId, day.sectionId)}
            className="break-words text-primary underline-offset-4 hover:underline"
          >
            Ôn: {sourceLabel(day.lessonId, day.sectionId)}
          </Link>
          <span className="text-xs text-muted-foreground">+ {dayTask(day)}</span>
        </li>
      ))}
    </ol>
  )
}

/** Thẻ kế hoạch ôn O.W.L. 1 trên trang Hôm nay (tới khi qua lần sau hoặc hết 14 ngày). */
export function OwlPlanCard({ active, className }: { active: ActivePlan; className?: string }) {
  const { plan, dayIndex, today } = active
  const parts = plan.parts.map((p) => OWL_PART_LABELS[p].toLowerCase()).join(' và ')
  return (
    <Card className={cn('gap-3 border-primary/50', className)}>
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
        <CalendarCheck className="row-span-2 size-9 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
        <CardTitle className="text-lg">
          <h2>Ôn O.W.L. 1 · ngày {dayIndex + 1}/{plan.days.length}</h2>
        </CardTitle>
        <CardDescription>Kế hoạch 2 tuần cho phần {parts}. Tiến độ chặng vẫn giữ nguyên.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Button asChild className="h-auto min-h-9 justify-start whitespace-normal text-left">
            <Link to={sectionHref(today.lessonId, today.sectionId)}>
              <Compass aria-hidden="true" />
              Hôm nay ôn: {sourceLabel(today.lessonId, today.sectionId)}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto min-h-9 justify-start whitespace-normal text-left">
            <Link to={MISTAKES_HREF}>
              <BookX aria-hidden="true" />
              Rồi {dayTask(today)}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link to={OWL_HREF}>
              <RotateCw aria-hidden="true" />
              Thi lại O.W.L. 1 lúc nào cũng được
            </Link>
          </Button>
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">Xem cả 14 ngày</summary>
          <div className="mt-2">
            <ReviewPlanList plan={plan} todayIndex={dayIndex} />
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
