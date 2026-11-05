import { useMemo } from 'react'
import { ArrowLeft, TrainFront } from 'lucide-react'
import { Link } from 'react-router'

import { useFoundation } from '@/app/store-context'
import { BrickWall } from '@/components/foundation/BrickWall'
import { Button } from '@/components/ui/button'
import { getBrickMeta } from '@/data/foundation'
import { hasBrickContent } from '@/data/foundation/content'
import { brickHref, nextBrickIdFromState, wallRows } from '@/lib/foundation'

/** Sân ga 9¾: bức tường 18 viên gạch (story 19). Không khoá viên nào; "Học tiếp" chỉ là gợi ý. */
export function Foundation() {
  const { state } = useFoundation()
  const rows = useMemo(() => wallRows(state, hasBrickContent), [state])
  const nextId = useMemo(() => nextBrickIdFromState(state, hasBrickContent), [state])
  const next = nextId ? getBrickMeta(nextId) : undefined

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
