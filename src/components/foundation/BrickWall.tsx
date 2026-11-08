import { Check, ClipboardCheck, Hammer } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { brickHref, type WallRow, type WallTile } from '@/lib/foundation'
import { rowTestHref } from '@/lib/foundation/row-test'
import { cn } from '@/lib/utils'

const ROW_TEST_LABELS = { know: 'Tôi biết rồi', final: 'Kiểm tra cuối hàng' } as const

function TileFace({ tile }: { tile: WallTile }) {
  return (
    <>
      <span className="flex items-center justify-between gap-1 text-xs font-semibold">
        <span>{tile.id}</span>
        {tile.lit && <Check className="size-3.5" strokeWidth={2.5} role="img" aria-label="đã xong" />}
        {!tile.lit && tile.next && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Học tiếp</span>
        )}
      </span>
      <span className="line-clamp-3 text-xs leading-snug break-words">{tile.title}</span>
      <span className="mt-auto text-[11px] opacity-80">
        {tile.hasContent ? `${tile.minutes}'` : (
          <span className="inline-flex items-center gap-1">
            <Hammer className="size-3" aria-hidden="true" />
            Đang soạn
          </span>
        )}
      </span>
    </>
  )
}

/** Một ô gạch: sáng khi xong (hoặc hàng đã xong), viền sáng "Học tiếp", "Đang soạn" không phải link. */
function Tile({ tile }: { tile: WallTile }) {
  const base = 'flex min-h-24 min-w-0 flex-col gap-1 rounded-lg border-2 p-2 text-left transition-all'
  const look = cn(
    base,
    tile.lit && 'border-primary bg-primary text-primary-foreground shadow-[0_0_16px_var(--candle-glow)]',
    !tile.lit && tile.next && 'border-primary bg-card text-primary shadow-[0_0_22px_var(--candle-glow)] ring-4 ring-primary/25',
    !tile.lit && !tile.next && 'border-border bg-card text-foreground',
    !tile.hasContent && !tile.lit && 'border-dashed text-muted-foreground',
  )
  if (!tile.hasContent) {
    return (
      <li>
        <div className={look}>
          <TileFace tile={tile} />
        </div>
      </li>
    )
  }
  return (
    <li>
      <Link
        to={brickHref(tile.id)}
        aria-current={tile.next ? 'step' : undefined}
        className={cn(
          look,
          'hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        )}
      >
        <TileFace tile={tile} />
      </Link>
    </li>
  )
}

/** Bức tường 18 viên gạch xếp 4 hàng A–D. */
export function BrickWall({ rows }: { rows: readonly WallRow[] }) {
  return (
    <div className="flex flex-col gap-5">
      {rows.map((row) => {
        const headingId = `wall-row-${row.row}`
        const lit = row.tiles.filter((t) => t.lit).length
        return (
          <section key={row.row} aria-labelledby={headingId} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 id={headingId} className="text-base font-semibold">
                Hàng {row.row} · {row.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {row.done ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    Xong
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {lit}/{row.tiles.length} viên
                  </span>
                )}
                {row.test && (
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Link to={rowTestHref(row.row)} aria-label={`${ROW_TEST_LABELS[row.test]}: kiểm tra hàng ${row.row}`}>
                      <ClipboardCheck aria-hidden="true" />
                      {ROW_TEST_LABELS[row.test]}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <ol className="grid grid-cols-3 gap-2">
              {row.tiles.map((tile) => (
                <Tile key={tile.id} tile={tile} />
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
