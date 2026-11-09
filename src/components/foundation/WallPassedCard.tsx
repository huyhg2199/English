import { PartyPopper, TrainFront } from 'lucide-react'
import { Link } from 'react-router'

import { useFirstSyncReady, useFoundation } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WALL_PASSED_HREF } from '@/lib/foundation'
import { cn } from '@/lib/utils'

/** Nút chính "Qua bức tường" tới màn ăn mừng (story 26). Nơi gọi tự quyết khi nào hiện (còn chờ ăn mừng). */
export function WallPassedButton({ className }: { className?: string }) {
  return (
    <Button asChild className={cn('shadow-[0_0_18px_var(--candle-glow)]', className)}>
      <Link to={WALL_PASSED_HREF}>
        <TrainFront aria-hidden="true" />
        Qua bức tường
      </Link>
    </Button>
  )
}

/**
 * Thẻ "Qua bức tường" (story 26) cho Hôm nay và bức tường: chỉ hiện khi còn chờ ăn mừng (đã có `completedAt` mà chưa có
 * mục `wall-passed`), kể cả khi qua tường trong buổi 30' hay đồng bộ từ máy khác. Mở màn ăn mừng một lần thì thẻ biến mất.
 */
export function WallPassedCard({ className }: { className?: string }) {
  const { wallCelebrationPending } = useFoundation()
  // Chờ lượt đồng bộ đầu: máy thứ hai chưa kéo mục `wall-passed` của máy kia về thì chưa mời ăn mừng.
  const ready = useFirstSyncReady()
  if (!wallCelebrationPending || !ready) return null
  return (
    <Card className={cn('gap-3 border-primary/60 py-4 shadow-[0_0_18px_var(--candle-glow)]', className)}>
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3 px-4">
        <PartyPopper className="row-span-2 size-8 text-primary" aria-hidden="true" />
        <CardTitle className="text-lg leading-tight">
          <h2>Bạn đã xong cả 4 hàng của Sân ga 9¾</h2>
        </CardTitle>
        <CardDescription>Bức tường đã mở. Có một lá thư đang chờ bạn ở bên kia.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col px-4">
        <WallPassedButton />
      </CardContent>
    </Card>
  )
}
