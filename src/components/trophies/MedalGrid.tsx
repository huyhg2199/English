import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LEVEL_LABELS, UPCOMING_MEDALS, type MedalProgress } from '@/lib/trophies'
import { cn } from '@/lib/utils'

import { MedalIcon } from './MedalIcon'

function progressText(m: MedalProgress): string {
  return m.next ? `${m.count}/${m.next.target} tới ${LEVEL_LABELS[m.next.level]}` : `${m.count} lần · đã vàng`
}

function MedalTile({ medal: m }: { medal: MedalProgress }) {
  const from = m.next ? m.count / m.next.target : 1
  return (
    <li
      className={cn('flex min-w-0 flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center', m.level && 'border-primary/40')}
    >
      <MedalIcon level={m.level} className={cn(!m.level && 'opacity-70')} />
      <div className="min-w-0">
        <h3 className="font-semibold">{m.name}</h3>
        <p className="text-xs text-muted-foreground">{m.level ? `Cấp ${LEVEL_LABELS[m.level]}` : 'Chưa mở'}</p>
      </div>
      <p className="text-xs leading-snug">{m.condition}</p>
      <div
        className="h-1.5 w-full rounded-full bg-muted"
        role="meter"
        aria-label={`${m.name}: ${progressText(m)}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(from * 100)}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, from * 100)}%` }} />
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">{progressText(m)}</p>
    </li>
  )
}

/** Lưới huy chương: khoá / đồng / bạc / vàng kèm tiến độ; Hagrid, Sirius là ô "Sắp có". */
export function MedalGrid({ medals }: { medals: readonly MedalProgress[] }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg">
          <h2>Huy chương</h2>
        </CardTitle>
        <CardDescription>Đồng → bạc → vàng khi đạt 1 / 5 / 20 lần. Đã nhận thì không bao giờ mất.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-2 gap-3">
          {medals.map((m) => (
            <MedalTile key={m.id} medal={m} />
          ))}
          {UPCOMING_MEDALS.map((m) => (
            <li
              key={m.id}
              className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-dashed p-3 text-center text-muted-foreground"
            >
              <MedalIcon level={null} className="opacity-40" />
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-xs">Sắp có</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
