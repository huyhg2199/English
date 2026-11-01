import { ArrowLeft, Layers, PartyPopper } from 'lucide-react'
import { Link } from 'react-router'

import { FlashcardSession, VocabAttribution } from '@/components/flashcards/FlashcardSession'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function BackLink() {
  return (
    <Link
      to="/practice"
      className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Luyện tập
    </Link>
  )
}

function formatNextDue(date: Date): string {
  return date.toLocaleString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Phiên ôn flashcard: thẻ đến hạn → từ mới hôm nay → thẻ đang học lại. */
export function Flashcards() {
  return (
    <section className="flex flex-col gap-6">
      <BackLink />
      <header className="flex items-center gap-3">
        <Layers className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Ôn flashcard</h1>
      </header>

      <FlashcardSession
        renderDone={({ nextDue }) => (
          <Card className="items-center text-center">
            <CardHeader className="w-full items-center">
              <PartyPopper className="mx-auto size-10 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
              <CardTitle className="text-xl">Xong hôm nay</CardTitle>
              <CardDescription>
                {nextDue ? `Thẻ kế tiếp đến hạn: ${formatNextDue(nextDue)}.` : 'Chưa có thẻ nào xếp lịch.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/practice">Về Luyện tập</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      />

      <VocabAttribution />
    </section>
  )
}
