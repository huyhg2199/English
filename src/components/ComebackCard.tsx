import { Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COMEBACK_HREF, type ComebackBreak } from '@/lib/comeback'

/** Thẻ "Chào mừng quay lại" (story 11, CAP-6): mời test 5', bỏ qua được ("Để sau"), không ép. */
export function ComebackCard({
  pending,
  questionCount,
  onSkip,
}: {
  pending: ComebackBreak
  questionCount: number
  onSkip: () => void
}) {
  return (
    <Card className="gap-3 border-primary/50">
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
        <Sparkles className="row-span-2 size-9 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
        <CardTitle className="text-lg">
          <h2>Chào mừng quay lại!</h2>
        </CardTitle>
        <CardDescription>
          Đã {pending.days} ngày rồi. Làm test 5' ({questionCount} câu) để app tìm đúng chỗ cần ôn rồi học tiếp từ đó. Tiến độ vẫn
          nguyên vẹn.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="sm:flex-1">
          <Link to={COMEBACK_HREF}>Làm test 5'</Link>
        </Button>
        <Button variant="ghost" onClick={onSkip} className="sm:flex-1">
          Để sau
        </Button>
      </CardContent>
    </Card>
  )
}
