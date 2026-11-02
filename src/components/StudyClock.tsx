import { Hourglass } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatHours, YEARLY_HOURS_TARGET, type StudyHours } from '@/lib/placement'

/** Đồng hồ giờ học: tổng giờ so với 450 giờ/năm và nhịp cần tới hôm nay. */
export function StudyClock({ hours }: { hours: StudyHours }) {
  const percent = Math.min(100, hours.percentOfYear)
  const pacePercent = Math.min(100, (hours.paceHours / YEARLY_HOURS_TARGET) * 100)
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hourglass className="size-5 text-primary" aria-hidden="true" />
          <h2>Đồng hồ giờ học</h2>
        </CardTitle>
        <CardDescription>
          Cộng từ nhật ký buổi học: buổi 30' tính 25 phút (phần giải trí ×½), buổi lười 10 phút. So với{' '}
          {YEARLY_HOURS_TARGET} giờ/năm.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p className="text-2xl font-semibold tabular-nums">
          {formatHours(hours.hours)} giờ{' '}
          <span className="text-sm font-normal text-muted-foreground">
            · {formatHours(hours.percentOfYear)}% của {YEARLY_HOURS_TARGET} giờ
          </span>
        </p>
        <div
          className="relative h-2 rounded-full bg-muted"
          role="meter"
          aria-label={`Đã học ${formatHours(hours.hours)} trên ${YEARLY_HOURS_TARGET} giờ`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          {hours.days > 0 && (
            <span
              className="absolute -top-1 h-4 w-0.5 rounded-full bg-foreground/70"
              style={{ left: `${pacePercent}%` }}
              aria-hidden="true"
            />
          )}
        </div>
        <p className="text-muted-foreground">
          {hours.days > 0
            ? `Nhịp cần tới hôm nay: ${formatHours(hours.paceHours)} giờ (${hours.days} ngày từ buổi đầu tiên).`
            : 'Chưa có buổi học nào. Xong buổi đầu tiên là đồng hồ bắt đầu chạy.'}
        </p>
      </CardContent>
    </Card>
  )
}
