import { useMemo, type ReactNode } from 'react'
import { ArrowLeft, ExternalLink, Hourglass, PartyPopper } from 'lucide-react'
import { Link } from 'react-router'

import { useSessions } from '@/app/store-context'
import { useCountdown } from '@/app/use-countdown'
import { useNow } from '@/app/use-now'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { EntertainmentLink } from '@/data/roadmap'
import { computeStreak, formatClock } from '@/lib/sessions'
import { cn } from '@/lib/utils'

export function BackToToday() {
  return (
    <Link to="/" className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Hôm nay
    </Link>
  )
}

/** Đồng hồ gợi ý của phần đang làm (mount lại theo `key` để bắt đầu lại). */
export function StepClock({ minutes, onExpiredHint }: { minutes: number; onExpiredHint?: ReactNode }) {
  const { remaining, expired } = useCountdown(minutes)
  return (
    <>
      <p
        className={cn(
          'inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-0.5 font-mono text-sm tabular-nums',
          expired ? 'border-primary/60 text-primary' : 'text-muted-foreground',
        )}
        aria-label={expired ? 'Hết giờ gợi ý' : `Còn ${formatClock(remaining)}`}
      >
        <Hourglass className="size-3.5" aria-hidden="true" />
        {expired ? 'Hết giờ gợi ý' : formatClock(remaining)}
      </p>
      {expired && onExpiredHint}
    </>
  )
}

export function LinkList({ links }: { links: readonly EntertainmentLink[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {links.map((l) => (
        <li key={l.url}>
          <a
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm hover:border-primary hover:shadow-[0_0_12px_var(--candle-glow)]"
          >
            <span className="min-w-0 break-words">{l.name}</span>
            <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  )
}

/** Màn xong buổi: streak mới và nút về Hôm nay. */
export function SessionDoneView({ kindLabel, note }: { kindLabel: string; note?: string }) {
  const { days } = useSessions()
  const [now] = useNow()
  const streak = useMemo(() => computeStreak(days, now), [days, now])
  return (
    <Card className="items-center text-center">
      <CardHeader className="w-full items-center">
        <PartyPopper className="mx-auto size-12 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
        <CardTitle className="text-xl">Xong {kindLabel}!</CardTitle>
        <CardDescription aria-live="polite">
          {note && <span className="block">{note}</span>}
          Streak {streak} ngày. Mai gặp lại nhé.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/">Về Hôm nay</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

