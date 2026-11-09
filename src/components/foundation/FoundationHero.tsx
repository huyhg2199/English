import { Play, Ticket, TrainFront } from 'lucide-react'
import { Link } from 'react-router'

import type { FoundationHeroView } from '@/app/today-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBrickMeta } from '@/data/foundation'
import { cn } from '@/lib/utils'

const SMALL_LINK = 'self-start text-sm text-primary underline-offset-4 hover:underline'

/**
 * Thẻ chính của Hôm nay khi đang ở Sân ga 9¾ (story 22): "Sân ga 9¾ — x/18 viên gạch", viên mà buổi 30' sẽ chạy kèm
 * "học để làm gì" và số phút (hoặc "Ôn lại: Fxx · …"), nút lớn "Bắt đầu buổi 30'", link bức tường và link Soát vé khi
 * còn hàng cần soát ("Tiếp tục Soát vé · hàng X" khi đã làm dở, như thẻ mời trên bức tường). Chỉ là lối vào: không khoá bức tường, bài hay Đo trình độ.
 */
export function FoundationHero({ hero, className }: { hero: FoundationHeroView; className?: string }) {
  const brick = hero.brickId ? getBrickMeta(hero.brickId) : undefined

  return (
    <Card className={cn('gap-4 border-primary/60 shadow-[0_0_18px_var(--candle-glow)]', className)}>
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
        <TrainFront
          className="row-span-2 size-9 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]"
          aria-hidden="true"
        />
        <CardTitle className="text-xl leading-tight">
          <h2>
            Sân ga 9¾ — {hero.taughtCount}/{hero.totalBricks} viên gạch
          </h2>
        </CardTitle>
        <CardDescription>Nền móng trước Năm 1, mỗi buổi 30' một viên gạch.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {brick ? (
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Buổi hôm nay · {brick.minutes}'
            </p>
            <p className="font-medium break-words">
              {hero.review ? 'Ôn lại: ' : ''}
              {brick.id} · {brick.title}
            </p>
            <p className="text-sm break-words text-muted-foreground">{brick.goalVi}</p>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Các viên tiếp theo đang soạn.</p>
        )}
        <Button asChild size="lg" className="h-16 text-lg shadow-[0_0_24px_var(--candle-glow)]">
          <Link to="/session">
            <Play className="size-6" aria-hidden="true" />
            Bắt đầu buổi 30'
          </Link>
        </Button>
        <div className="flex flex-col gap-2">
          {hero.placementHref && (
            <Link to={hero.placementHref} className={`inline-flex items-center gap-1.5 ${SMALL_LINK}`}>
              <Ticket className="size-4 shrink-0" aria-hidden="true" />
              {hero.placementContinueRow ? `Tiếp tục Soát vé · hàng ${hero.placementContinueRow}` : 'Soát vé trước · 4 bài ngắn'}
            </Link>
          )}
          <Link to="/foundation" className={SMALL_LINK}>
            Xem bức tường
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
