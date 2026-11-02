import { CalendarClock } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, planConsequence, planStatusLabel, type Plan } from '@/lib/schedule'

/**
 * Thẻ "Ngày dự kiến đạt 750" (story 11, CAP-5): ngày + "đúng hạn" / "lùi N tuần" và hệ quả bằng lời nhẹ nhàng.
 * Không chữ đỏ, không cảnh báo: trễ chỉ làm mốc dịch lại, tiến độ giữ nguyên.
 */
export function ScheduleCard({ plan }: { plan: Plan }) {
  return (
    <Card className="gap-3">
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
        <CalendarClock className="row-span-2 size-8 text-primary" aria-hidden="true" />
        <CardDescription>Ngày dự kiến đạt 750</CardDescription>
        <CardTitle className="flex flex-wrap items-baseline gap-x-2 text-lg">
          <h2>{plan.done ? 'Đã xong lộ trình' : formatDate(plan.projectedGoal)}</h2>
          {!plan.done && (
            <span className="rounded-full border border-primary/50 px-2 py-0.5 text-xs font-normal text-primary">
              {planStatusLabel(plan)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p className="break-words">{planConsequence(plan)}</p>
        {!plan.done && plan.weeksLate > 0 && (
          <p className="text-xs">Mốc gốc {formatDate(plan.baselineGoal)}. Chậm một chút không sao, quan trọng là quay lại.</p>
        )}
      </CardContent>
    </Card>
  )
}

/** Dòng ngắn cho đầu trang Lộ trình. */
export function ScheduleLine({ plan }: { plan: Plan }) {
  if (plan.done) return null
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <CalendarClock className="size-4 text-primary" aria-hidden="true" />
      <span>
        Dự kiến đạt 750: <span className="font-semibold">{formatDate(plan.projectedGoal)}</span>
      </span>
      <span className="rounded-full border border-primary/50 px-2 py-0.5 text-xs text-primary">{planStatusLabel(plan)}</span>
    </p>
  )
}
