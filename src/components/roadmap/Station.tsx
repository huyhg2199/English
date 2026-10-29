import { Award, Check } from 'lucide-react'
import { Link } from 'react-router'

import { lessonHref, type Lesson } from '@/data/roadmap'
import { cn } from '@/lib/utils'

export type StationState = 'done' | 'next' | 'locked'

const STATE_TEXT: Record<StationState, string> = {
  done: 'đã qua',
  next: 'học tiếp',
  locked: 'chưa học',
}

type Props = { lesson: Lesson; monthLabel: string; state: StationState }

/** Một trạm (tuần) trên bản đồ. Đã qua: sáng vàng nến. Học tiếp: viền sáng + nhãn. */
export function Station({ lesson, monthLabel, state }: Props) {
  const isCheckpoint = !!lesson.checkpointId

  return (
    <li className="relative">
      <Link
        to={lessonHref(lesson.id)}
        aria-current={state === 'next' ? 'step' : undefined}
        className={cn(
          'group flex min-w-0 items-center gap-3 rounded-lg py-2 pr-2 transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          state === 'next' && 'bg-accent/60',
        )}
      >
        <span
          className={cn(
            'relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
            state === 'done' &&
              'border-primary bg-primary text-primary-foreground shadow-[0_0_16px_var(--candle-glow)]',
            state === 'next' &&
              'border-primary bg-card text-primary shadow-[0_0_22px_var(--candle-glow)] ring-4 ring-primary/25',
            state === 'locked' && 'border-border bg-card text-muted-foreground group-hover:border-primary/50',
          )}
          aria-hidden="true"
        >
          {state === 'done' ? (
            <Check className="size-5" strokeWidth={2.5} />
          ) : isCheckpoint ? (
            <Award className="size-5" />
          ) : (
            lesson.week
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {monthLabel} · Tuần {lesson.week}
            </span>
            {state === 'next' && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                Học tiếp
              </span>
            )}
            {isCheckpoint && state !== 'next' && <span className="text-accent-foreground">Kỳ kiểm tra</span>}
          </span>
          <span
            className={cn(
              'block text-sm break-words',
              state === 'locked' ? 'text-foreground/80' : 'text-foreground',
              (state === 'next' || isCheckpoint) && 'font-semibold',
            )}
          >
            {lesson.title}
          </span>
          <span className="sr-only"> ({STATE_TEXT[state]})</span>
        </span>
      </Link>
    </li>
  )
}
