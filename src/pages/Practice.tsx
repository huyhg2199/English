import { useMemo } from 'react'
import { ChevronRight, Layers, WandSparkles } from 'lucide-react'
import { Link } from 'react-router'

import { useNewWordList, useSrs } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { useWords } from '@/app/use-words'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buildSession } from '@/lib/srs'

function FlashcardSummary() {
  const wordsState = useWords()
  const { srs } = useSrs()
  const firstList = useNewWordList()
  const [now] = useNow()
  const session = useMemo(
    () => (wordsState.status === 'ready' ? buildSession(srs, wordsState.words, now, undefined, firstList) : null),
    [srs, wordsState, now, firstList],
  )

  if (!session) return wordsState.status === 'error' ? 'Chưa mở được bộ từ' : 'Đang đếm thẻ…'
  if (session.queue.length === 0) return 'Xong hôm nay'
  return `${session.dueCount} thẻ đến hạn · ${session.newCount} từ mới hôm nay`
}

export function Practice() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <WandSparkles className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Luyện tập</h1>
      </header>

      <Link
        to="/practice/flashcards"
        className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Card className="transition-shadow hover:shadow-[0_0_20px_var(--candle-glow)]">
          <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-3">
            <Layers className="row-span-2 size-8 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">Ôn flashcard</CardTitle>
            <ChevronRight className="row-span-2 size-5 text-muted-foreground" aria-hidden="true" />
            <CardDescription>
              <FlashcardSummary />
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Sắp có</CardTitle>
          <CardDescription>Luyện phát âm, ôn Sổ lỗi, 7 Part TOEIC và link luyện nói.</CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
