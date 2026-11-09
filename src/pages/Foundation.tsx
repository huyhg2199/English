import { useMemo } from 'react'
import { ArrowLeft, Ticket, TrainFront } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { useFoundation } from '@/app/store-context'
import { BrickWall } from '@/components/foundation/BrickWall'
import { WallPassedCard } from '@/components/foundation/WallPassedCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBrickMeta, type RowId } from '@/data/foundation'
import { hasBrickContent } from '@/data/foundation/content'
import { brickHref, nextBrickIdFromState, wallRows, WALL_PASSED_HREF } from '@/lib/foundation'
import { PLACEMENT_HREF } from '@/lib/foundation/row-test'

/** Thẻ mời Soát vé (chỉ khi Soát vé còn `pending`): bắt đầu / tiếp tục, hoặc "Bỏ qua, học từ viên 1". */
function TicketInvite({ row, started, onSkip }: { row: RowId; started: boolean; onSkip: () => void }) {
  return (
    <Card className="gap-3 border-primary/50 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Ticket className="size-5 shrink-0 text-primary" aria-hidden="true" />
          {started ? `Tiếp tục Soát vé · hàng ${row}` : 'Soát vé · 4 bài ngắn, 8 câu mỗi hàng'}
        </CardTitle>
        <CardDescription>
          Biết rồi thì khỏi học lại: hàng nào đúng từ 6/8 câu thì cả hàng tính là xong. Dừng giữa chừng được, câu sai không
          vào Sổ lỗi.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4">
        <Button asChild>
          <Link to={PLACEMENT_HREF}>{started ? 'Tiếp tục Soát vé' : 'Bắt đầu Soát vé'}</Link>
        </Button>
        <Button type="button" variant="ghost" onClick={onSkip}>
          Bỏ qua, học từ viên 1
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Sân ga 9¾: bức tường 18 viên gạch (story 19) và thẻ mời Soát vé (story 20). Không khoá viên nào; "Học tiếp" chỉ là
 * gợi ý, bức tường vẫn bấm được khi Soát vé còn `pending`. Qua tường (story 26): thẻ "Qua bức tường" khi còn chờ ăn
 * mừng, hết chờ thì link "Xem lại màn Qua bức tường".
 */
export function Foundation() {
  const { state, needsPlacement, placementRow, placementStarted, skipPlacement, wallCelebrationPending } = useFoundation()
  const navigate = useNavigate()
  const rows = useMemo(() => wallRows(state, hasBrickContent), [state])
  const nextId = useMemo(() => nextBrickIdFromState(state, hasBrickContent), [state])
  const next = nextId ? getBrickMeta(nextId) : undefined
  const skipTicket = () => {
    skipPlacement()
    if (nextId) navigate(brickHref(nextId))
  }

  return (
    <section className="flex flex-col gap-6">
      <Link
        to="/roadmap"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Lộ trình
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <TrainFront className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">Sân ga 9¾</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Bức tường lý thuyết vỡ lòng trước Năm 1. Học xong viên nào, viên đó sáng lên.{' '}
          <strong className="text-foreground">
            {state.taughtCount}/{state.totalBricks} viên gạch
          </strong>
        </p>
      </header>

      <WallPassedCard />
      {state.status === 'completed' && !wallCelebrationPending && (
        <Link to={WALL_PASSED_HREF} className="self-start text-sm text-primary underline-offset-4 hover:underline">
          Xem lại màn Qua bức tường
        </Link>
      )}

      {needsPlacement && placementRow && (
        <TicketInvite row={placementRow} started={placementStarted} onSkip={skipTicket} />
      )}

      {next ? (
        <Button asChild className="h-auto min-h-9 justify-start whitespace-normal text-left">
          <Link to={brickHref(next.id)}>
            Học tiếp: {next.id} · {next.title}
          </Link>
        </Button>
      ) : (
        state.taughtCount < state.totalBricks && (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Các viên tiếp theo đang soạn.</p>
        )
      )}

      <BrickWall rows={rows} />
    </section>
  )
}
