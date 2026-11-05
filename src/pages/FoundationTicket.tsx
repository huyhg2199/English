import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Compass, Ticket } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router'

import { useFoundation, useLoadedStore } from '@/app/store-context'
import { RowTestResult } from '@/components/foundation/RowTestResult'
import { RowTestRun, type RowTestOutcome } from '@/components/foundation/RowTestRun'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBrickMeta, ROW_IDS, ROW_TITLES, type RowId } from '@/data/foundation'
import { hasBrickContent } from '@/data/foundation/content'
import { brickHref, nextBrickIdFromState } from '@/lib/foundation'
import { rowBrickRange, rowStartBrick, rowSummaries, type RowSummary } from '@/lib/foundation/row-test'
import { cn } from '@/lib/utils'

function BackToWall() {
  return (
    <Link
      to="/foundation"
      className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Bức tường
    </Link>
  )
}

/** "Học tiếp: F0n · tên" hoặc "Các viên tiếp theo đang soạn". */
function NextBrick() {
  const { state } = useFoundation()
  const nextId = nextBrickIdFromState(state, hasBrickContent)
  const next = nextId ? getBrickMeta(nextId) : undefined
  if (!next) {
    return <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Các viên tiếp theo đang soạn.</p>
  }
  return (
    <Button asChild className="h-auto min-h-9 justify-start whitespace-normal text-left">
      <Link to={brickHref(next.id)}>
        <Compass aria-hidden="true" />
        Học tiếp: {next.id} · {next.title}
      </Link>
    </Button>
  )
}

function summaryText(s: RowSummary, startBrick: string): string {
  switch (s.status) {
    case 'passed':
      return `Đạt · ${s.best}%`
    case 'bricks':
      return 'Xong (đã học hết viên)'
    case 'failed':
      return `Chưa đạt 70% (${s.best}%) · học từ ${startBrick}`
    case 'untested':
      return 'Chưa làm'
  }
}

/** Tổng kết sau hàng cuối: hàng đạt / chưa đạt, viên tiếp theo; cả 4 hàng xong thì "Sân ga xong" (không ăn mừng ở đây). */
function PlacementSummary() {
  const { store } = useLoadedStore()
  const { state } = useFoundation()
  const rows = rowSummaries(store)
  const wallDone = state.status === 'completed' || state.rowsDone.length === ROW_IDS.length
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">{wallDone ? 'Cả 4 hàng đạt: Sân ga xong' : 'Soát vé xong'}</CardTitle>
        <CardDescription>
          {wallDone
            ? 'Bạn đã có đủ nền móng để lên tàu Năm 1. Các viên gạch vẫn mở để ôn bất cứ lúc nào.'
            : 'Hàng đạt đã sáng trên bức tường. Mình chỉ học những hàng chưa đạt.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <ul className="flex flex-col gap-1.5 text-sm">
          {rows.map((r) => {
            const done = r.status === 'passed' || r.status === 'bricks'
            return (
              <li key={r.row} className="flex items-start gap-2">
                <span
                  className={cn(
                    'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border',
                    done ? 'border-primary bg-primary text-primary-foreground' : 'border-dashed border-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {done && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="min-w-0 break-words">
                  <strong>Hàng {r.row}</strong> · {r.title}: {summaryText(r, rowStartBrick(store, r.row))}
                </span>
              </li>
            )
          })}
        </ul>
        {wallDone ? (
          <Button asChild>
            <Link to="/roadmap">Về Lộ trình</Link>
          </Button>
        ) : (
          <>
            <NextBrick />
            <Button asChild variant="ghost">
              <Link to="/foundation">Về bức tường</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Kết quả một hàng: còn hàng thì "Sang hàng X" / "Dừng ở đây", hết hàng thì tổng kết. */
function TicketRowResult({ row, outcome, onNext }: { row: RowId; outcome: RowTestOutcome; onNext: (row: RowId) => void }) {
  const { store } = useLoadedStore()
  const { state, needsPlacement, placementRow } = useFoundation()
  const nextRow = needsPlacement ? placementRow : null
  return (
    <div className="flex flex-col gap-4">
      {!nextRow && <PlacementSummary />}
      <RowTestResult
        {...outcome}
        row={row}
        startBrick={rowStartBrick(store, row)}
        rowDone={state.rowsDone.includes(row)}
        actions={
          nextRow && (
            <>
              <Button onClick={() => onNext(nextRow)}>
                Sang hàng {nextRow}
                <ArrowRight aria-hidden="true" />
              </Button>
              <Button asChild variant="ghost">
                <Link to="/foundation">Dừng ở đây</Link>
              </Button>
            </>
          )
        }
      />
    </div>
  )
}

/**
 * `/foundation/soat-ve` (story 20): Soát vé chạy lần lượt các hàng chưa xong A → D, 8 câu mỗi hàng. Chỉ ghi khi bấm
 * "Xem kết quả" ở câu cuối của hàng; rời trang giữa hàng thì không ghi gì. Hết hàng → `placement: 'done'` + tổng kết.
 * Vào khi Soát vé không còn `pending` (hoặc đã bỏ qua Sân ga) → về bức tường.
 */
export function FoundationTicket() {
  const { state, needsPlacement, placementRow, skipPlacement } = useFoundation()
  const navigate = useNavigate()
  // Chốt lúc mở trang: ghi hàng cuối làm Soát vé hết `pending`, trang vẫn phải hiện tổng kết.
  const [startRow] = useState(() => (needsPlacement ? placementRow : null))
  const [current, setCurrent] = useState<{ row: RowId; n: number } | null>(() => (startRow ? { row: startRow, n: 0 } : null))

  if (!current) return <Navigate to="/foundation" replace />
  const { row } = current

  const skip = () => {
    skipPlacement()
    const next = nextBrickIdFromState(state, hasBrickContent)
    navigate(next ? brickHref(next) : '/foundation')
  }

  return (
    <section className="flex flex-col gap-6">
      <BackToWall />
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Ticket className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">Soát vé</h1>
        </div>
        <p className="text-sm break-words">
          <strong>
            Hàng {row} · {ROW_TITLES[row]}
          </strong>{' '}
          <span className="text-muted-foreground">
            ({rowBrickRange(row)}) · bài {ROW_IDS.indexOf(row) + 1}/4
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Đúng từ 6/8 câu (70%) thì cả hàng tính là xong, khỏi học lại. Câu sai không vào Sổ lỗi, không tính là buổi học.
        </p>
      </header>

      <RowTestRun
        key={`${row}-${current.n}`}
        row={row}
        context="placement"
        renderResult={(outcome) => (
          <TicketRowResult
            row={row}
            outcome={outcome}
            onNext={(r) => {
              setCurrent((c) => ({ row: r, n: (c?.n ?? 0) + 1 }))
              window.scrollTo(0, 0)
            }}
          />
        )}
      />

      {needsPlacement && (
        <Button type="button" variant="ghost" className="self-start" onClick={skip}>
          Bỏ qua, học từ viên 1
        </Button>
      )}
    </section>
  )
}
