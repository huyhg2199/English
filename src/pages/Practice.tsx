import { useMemo } from 'react'
import { ChevronRight, Layers, Sparkles, WandSparkles } from 'lucide-react'
import { Link } from 'react-router'

import { useNewWordList, useSpells, useSrs } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { useWords } from '@/app/use-words'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SPELLS } from '@/data/lessons'
import { sectionHref } from '@/data/roadmap'
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

/** Danh sách thần chú đã mở (mỗi thì đã học là một thần chú), link về đoạn ngữ pháp của bài. */
function SpellList() {
  const unlocked = useSpells()
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          <h2>Thần chú đã mở</h2>
        </CardTitle>
        <CardDescription>
          {unlocked.length}/{SPELLS.length} thần chú · mỗi thì học xong là một thần chú.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {unlocked.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa mở thần chú nào. Học xong bài tuần 1 (động từ to be) để mở Lumos.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {unlocked.map((spell) => (
              <li key={spell.id}>
                <Link
                  to={sectionHref(spell.lessonId, 'grammar')}
                  className="flex flex-col rounded-lg border border-primary/50 bg-accent/30 p-3 text-sm hover:shadow-[0_0_16px_var(--candle-glow)]"
                >
                  <span className="font-semibold text-primary">{spell.name}</span>
                  <span className="text-muted-foreground">{spell.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
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

      <SpellList />

      <Card>
        <CardHeader>
          <CardTitle>Sắp có</CardTitle>
          <CardDescription>
            Ôn Sổ lỗi, 7 Part TOEIC và link luyện nói. Luyện phát âm đã có trong từng bài tháng T1 (đoạn Phát âm).
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
