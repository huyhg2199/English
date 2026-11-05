import { BarChart3 } from 'lucide-react'
import { Link } from 'react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ESTIMATE_NOTE, type GapSkill, type SkillBoard, type SkillGap } from '@/lib/placement'
import { cn } from '@/lib/utils'

const GAP_SKILL_LABELS: Record<GapSkill, string> = {
  listening: 'Nghe (Listening)',
  reading: 'Đọc (Reading)',
  grammar: 'Ngữ pháp',
  vocabulary: 'Từ vựng',
  pronunciation: 'Phát âm',
}

function formatValue(row: SkillGap): string {
  if (row.current === null || row.target === null) return 'chưa có dữ liệu'
  if (row.unit === 'percent') return `${row.current}% / ${row.target}%`
  if (row.unit === 'words') return `${row.current} / ${row.target} từ`
  return `${row.current} / ${row.target}`
}

type Props = { board: SkillBoard; weakest: GapSkill | null }

/** Bảng 5 kỹ năng: hiện tại so với mục tiêu chặng hiện tại; kỹ năng yếu nhất được đánh dấu. */
export function SkillGapCard({ board, weakest }: Props) {
  const { baseline, latest, attemptCount, stage, rows } = board
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-5 text-primary" aria-hidden="true" />
          <h2>Bảng kỹ năng</h2>
        </CardTitle>
        <CardDescription>
          Mục tiêu Chặng {stage.number} {stage.name} ({stage.scoreGoal}).
          {latest && (
            <>
              {' '}
              Ước tính hiện tại {latest.total}
              {baseline && attemptCount > 1 && ` · mốc ${baseline.total}`}*.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const isWeakest = row.skill === weakest
            const fill = row.gap === null ? 0 : Math.round((1 - row.gap) * 100)
            return (
              <li key={row.skill} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    {GAP_SKILL_LABELS[row.skill]}
                    {isWeakest && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        Ưu tiên
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatValue(row)}
                    {row.baseline !== null && ` · mốc ${row.baseline}${row.unit === 'percent' ? '%' : ''}`}
                  </span>
                </div>
                {row.gap !== null && (
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="meter"
                    aria-label={`${GAP_SKILL_LABELS[row.skill]}: ${formatValue(row)}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={fill}
                  >
                    <div
                      className={cn('h-full rounded-full', isWeakest ? 'bg-primary' : 'bg-primary/60')}
                      style={{ width: `${fill}%` }}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        <p className="text-xs text-muted-foreground">* {ESTIMATE_NOTE}</p>
        <Link to="/do-trinh-do" className="self-start text-sm text-primary underline-offset-4 hover:underline">
          Đo trình độ lần mới
        </Link>
      </CardContent>
    </Card>
  )
}
