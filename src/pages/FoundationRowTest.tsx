import { useState } from 'react'
import { ArrowLeft, ClipboardCheck, RotateCw } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'

import { useFoundation, useLoadedStore } from '@/app/store-context'
import { RowTestResult } from '@/components/foundation/RowTestResult'
import { RowTestRun } from '@/components/foundation/RowTestRun'
import { WallPassedButton } from '@/components/foundation/WallPassedCard'
import { Button } from '@/components/ui/button'
import { ROW_TITLES, type RowId } from '@/data/foundation'
import { parseRowParam, rowBrickRange, rowStartBrick, rowTestHref, rowTestMode } from '@/lib/foundation/row-test'

const MODE_NOTE = {
  know: 'Tôi biết rồi: câu sai không vào Sổ lỗi. Đúng từ 6/8 câu (70%) thì cả hàng tính là xong.',
  final: 'Kiểm tra cuối hàng: câu sai vào Sổ lỗi để ôn. Bài này không bắt buộc.',
} as const

function RowTestPage({ row }: { row: RowId }) {
  const { store } = useLoadedStore()
  const { state, wallCelebrationPending } = useFoundation()
  // Chế độ chốt lúc mở trang (để hiện lời dẫn). Màn kết quả dùng chế độ thật sự lúc ghi (`outcome.mode`).
  const [mode] = useState<'know' | 'final'>(() => (rowTestMode(store, row, 'row') === 'final' ? 'final' : 'know'))
  const [run, setRun] = useState(0)

  return (
    <section className="flex flex-col gap-6">
      <Link
        to="/foundation"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Bức tường
      </Link>
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">{mode === 'final' ? 'Kiểm tra cuối hàng' : 'Tôi biết rồi'}</h1>
        </div>
        <p className="text-sm break-words">
          <strong>
            Hàng {row} · {ROW_TITLES[row]}
          </strong>{' '}
          <span className="text-muted-foreground">({rowBrickRange(row)}) · 8 câu</span>
        </p>
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">{MODE_NOTE[mode]}</p>
      </header>

      <RowTestRun
        key={run}
        row={row}
        context="row"
        renderResult={(outcome) => (
          <RowTestResult
            {...outcome}
            row={row}
            startBrick={rowStartBrick(store, row)}
            rowDone={state.rowsDone.includes(row)}
            actions={
              <>
                {wallCelebrationPending && <WallPassedButton />}
                <Button
                  variant={wallCelebrationPending ? 'outline' : 'default'}
                  onClick={() => {
                    setRun((n) => n + 1)
                    window.scrollTo(0, 0)
                  }}
                >
                  <RotateCw aria-hidden="true" />
                  Làm lại
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/foundation">Về bức tường</Link>
                </Button>
              </>
            }
          />
        )}
      />
    </section>
  )
}

/**
 * `/foundation/kiem-tra/:row` (story 20): "Tôi biết rồi" (hàng còn viên chưa xong) hoặc "Kiểm tra cuối hàng" (mọi viên
 * đã xong). `a` → `replace` sang `A`; hàng lạ → bức tường.
 */
export function FoundationRowTest() {
  const { row: param } = useParams()
  const row = parseRowParam(param)
  if (!row) return <Navigate to="/foundation" replace />
  if (param !== row) return <Navigate to={rowTestHref(row)} replace />
  return <RowTestPage key={row} row={row} />
}
