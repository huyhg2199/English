import { useState } from 'react'
import { TrainFront } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { useFoundation } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const WALL_LINK = 'self-start text-sm text-primary underline-offset-4 hover:underline'

/**
 * Dải "Sân ga 9¾" trên Lộ trình, nằm trước Chặng 1 (story 19). Ba trạng thái:
 * đang ở Sân ga ("x/18", "Vào Sân ga", "Bỏ qua Sân ga" có xác nhận tại chỗ), đã bỏ qua ("Quay lại Sân ga", "Xem bức tường")
 * và đã qua bức tường (chỉ link xem tường). Bỏ qua / quay lại chỉ gọi `skipFoundation` / `resumeFoundation`.
 */
export function FoundationBand() {
  const { state, skip, resume } = useFoundation()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const { status, taughtCount, totalBricks } = state

  const suffix = status === 'skipped' ? 'Đã bỏ qua' : status === 'completed' ? 'Đã qua bức tường' : `${taughtCount}/${totalBricks}`

  return (
    <Card className={cn('gap-3 py-4', status === 'in-foundation' && 'border-primary/60 shadow-[0_0_18px_var(--candle-glow)]')}>
      <CardHeader className="px-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          <TrainFront className="size-4" aria-hidden="true" />
          Trước Năm 1
        </p>
        <CardTitle>
          <h2 className="text-xl leading-tight">Sân ga 9¾ · {suffix}</h2>
        </CardTitle>
        <CardDescription>
          {status === 'completed'
            ? 'Bạn đã qua bức tường 18 viên gạch. Mở lại viên nào để ôn cũng được.'
            : status === 'skipped'
              ? `Bạn đã bỏ qua Sân ga (${taughtCount}/${totalBricks} viên). Quay lại thì học tiếp đúng chỗ, kết quả cũ giữ nguyên.`
              : '18 viên gạch lý thuyết vỡ lòng, mỗi viên 6–10 phút, trước Chặng 1.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        {status === 'in-foundation' && (
          <>
            <Button asChild className="self-start">
              <Link to="/foundation">Vào Sân ga</Link>
            </Button>
            {confirming ? (
              <div role="group" aria-label="Xác nhận bỏ qua Sân ga" className="flex flex-col gap-2 rounded-lg border border-dashed p-3 text-sm">
                <p>Bỏ qua Sân ga và vào thẳng Chặng 1? Không mất gì: viên đã học giữ nguyên, quay lại lúc nào cũng được.</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      skip()
                      setConfirming(false)
                    }}
                  >
                    Có, bỏ qua
                  </Button>
                  <Button type="button" size="sm" variant="ghost" autoFocus onClick={() => setConfirming(false)}>
                    Huỷ
                  </Button>
                </div>
              </div>
            ) : (
              <button type="button" className={WALL_LINK} onClick={() => setConfirming(true)}>
                Bỏ qua Sân ga
              </button>
            )}
          </>
        )}
        {status === 'skipped' && (
          <>
            <Button
              type="button"
              className="self-start"
              onClick={() => {
                resume()
                navigate('/foundation')
              }}
            >
              Quay lại Sân ga
            </Button>
            <Link to="/foundation" className={WALL_LINK}>
              Xem bức tường
            </Link>
          </>
        )}
        {status === 'completed' && (
          <Link to="/foundation" className={WALL_LINK}>
            Xem bức tường
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
