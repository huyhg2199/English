import { Flame, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HOUSE_LABELS, type House } from '@/lib/placement'
import { STREAK_BONUS, STREAK_BONUS_EVERY, type HousePoints } from '@/lib/trophies'

type Props = { house: House | null; points: HousePoints; streak: number; longest: number }

/** Điểm Nhà (tên + màu Nhà qua `data-house`), chuỗi hiện tại và dài nhất. Chưa có Nhà thì mời đội Mũ; có Nhà thì link "Đổi Nhà". */
export function HousePointsCard({ house, points, streak, longest }: Props) {
  return (
    <Card className="gap-4 border-primary/50">
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
        <Sparkles className="row-span-2 size-9 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
        <CardTitle className="text-lg">
          <h2>{house ? `Nhà ${HOUSE_LABELS[house]}` : 'Chưa phân Nhà'}</h2>
        </CardTitle>
        <CardDescription>
          Buổi chuẩn +10, ngày lười +5; mỗi {STREAK_BONUS_EVERY} ngày liền thưởng +{STREAK_BONUS}. Không bao giờ bị trừ.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-4xl font-semibold text-primary tabular-nums">{points.total}</span>
          <span className="text-sm text-muted-foreground">điểm Nhà</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {points.base} điểm buổi học
          {points.bonusCount > 0 ? ` + ${points.bonus} thưởng chuỗi (${points.bonusCount} lần)` : ''}
        </p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted px-3 py-2">
            <dt className="text-muted-foreground">Chuỗi hiện tại</dt>
            <dd className="flex items-center gap-1 text-lg font-semibold tabular-nums">
              <Flame className="size-4 text-primary" aria-hidden="true" />
              {streak} ngày
            </dd>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2">
            <dt className="text-muted-foreground">Dài nhất</dt>
            <dd className="text-lg font-semibold tabular-nums">{longest} ngày</dd>
          </div>
        </dl>
        {house ? (
          <Link to="/sorting-hat" className="self-start text-sm text-primary underline-offset-4 hover:underline">
            Đổi Nhà
          </Link>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link to="/sorting-hat">Đội Mũ Phân Loại để chọn Nhà</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
