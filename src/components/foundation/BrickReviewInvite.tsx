import { Hammer } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { getBrickMeta } from '@/data/foundation'
import { brickHref } from '@/lib/foundation'
import type { BrickReviewInvite as Invite } from '@/lib/quiz'
import { cn } from '@/lib/utils'

/**
 * Dải mời "Ôn viên gạch X n'?" trên Hôm nay (story 28): gần đây có từ 2 câu sai trở lên cùng cần khái niệm do viên X dạy.
 * Chỉ là lời mời nhẹ (không phải thẻ chính, không chặn gì): nút "Ôn X" mở viên, "Để sau" ẩn tới khi có câu sai mới.
 */
export function BrickReviewInvite({
  invite,
  onDismiss,
  className,
}: {
  invite: Invite
  onDismiss: (brickId: string) => void
  className?: string
}) {
  const meta = getBrickMeta(invite.brickId)
  if (!meta) return null
  return (
    <div
      role="status"
      className={cn('flex flex-col gap-2 rounded-xl border border-primary/50 bg-accent/40 px-3 py-2 text-sm', className)}
    >
      <div className="flex items-start gap-3">
        <Hammer className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-semibold break-words">
            Ôn viên gạch {meta.id} · {meta.title} {meta.minutes}'?
          </p>
          <p className="text-muted-foreground">
            Gần đây có {invite.questionIds.length} câu sai cùng cần kiến thức của viên này. Ôn lại một chút cho chắc nhé.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-8">
        <Button asChild size="sm">
          <Link to={brickHref(meta.id)}>Ôn {meta.id}</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDismiss(meta.id)}>
          Để sau
        </Button>
      </div>
    </div>
  )
}
