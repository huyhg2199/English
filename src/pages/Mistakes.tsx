import { useMemo, useState } from 'react'
import { ArrowLeft, BookX, PartyPopper } from 'lucide-react'
import { Link } from 'react-router'

import { useMistakes } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { GeminiSettings } from '@/components/quiz/GeminiSettings'
import { MistakeCard } from '@/components/quiz/MistakeCard'
import { MistakeReviewSession } from '@/components/quiz/MistakeReviewSession'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MISTAKE_TAGS, type MistakeTag } from '@/data/questions'
import { readGeminiKey } from '@/lib/ai'
import { filterMistakes, listMistakes, reviewableDue } from '@/lib/quiz'
import { canSpeak } from '@/lib/speech'
import { cn } from '@/lib/utils'

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

/** Sổ lỗi sai của Snape: ôn câu đến hạn, lọc theo nhãn lỗi, "Vì sao sai?" và cài key Gemini. */
export function Mistakes() {
  const { items } = useMistakes()
  const [now, setNow] = useNow()
  const [tag, setTag] = useState<MistakeTag | null>(null)
  const [session, setSession] = useState<string[] | null>(null)
  const [hasKey, setHasKey] = useState(() => readGeminiKey() !== null)
  const speak = canSpeak()

  const all = useMemo(() => listMistakes(items), [items])
  const { due, skippedListening } = useMemo(() => reviewableDue(items, now, { canSpeak: speak }), [items, now, speak])
  const shown = filterMistakes(all, tag)

  return (
    <section className="flex flex-col gap-6">
      <BackLink />
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <BookX className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">Sổ lỗi sai của Snape</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Câu sai ở mọi bài test tự vào đây và được ôn lại theo lịch. Không câu nào bị xoá.
        </p>
      </header>

      {session ? (
        <MistakeReviewSession
          ids={session}
          onDone={() => {
            setSession(null)
            setNow(new Date())
          }}
        />
      ) : (
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-lg">Ôn sổ</CardTitle>
            <CardDescription>
              {all.length === 0
                ? 'Sổ còn trống. Làm mini test, câu sai sẽ vào đây.'
                : due.length > 0
                  ? `${due.length} câu đến hạn ôn.`
                  : 'Chưa có câu nào đến hạn. Quay lại sau nhé.'}
              {skippedListening > 0 &&
                ` Bỏ qua ${skippedListening} câu nghe đến hạn vì trình duyệt này không đọc được tiếng Anh (TTS).`}
            </CardDescription>
          </CardHeader>
          {due.length > 0 && (
            <CardContent>
              <Button onClick={() => setSession(due.map((m) => m.id))}>Ôn {due.length} câu đến hạn</Button>
            </CardContent>
          )}
          {all.length > 0 && due.length === 0 && (
            <CardContent>
              <PartyPopper className="size-6 text-primary" aria-hidden="true" />
            </CardContent>
          )}
        </Card>
      )}

      {all.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="mistake-list">
          <h2 id="mistake-list" className="text-lg font-semibold">
            Các câu trong sổ ({all.length})
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo nhãn lỗi">
            {[null, ...MISTAKE_TAGS].map((t) => {
              const count = filterMistakes(all, t).length
              if (t !== null && count === 0) return null
              return (
                <button
                  key={t ?? 'all'}
                  type="button"
                  aria-pressed={tag === t}
                  onClick={() => setTag(t)}
                  className={cn(
                    'min-h-9 rounded-full border px-3 text-sm',
                    tag === t ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary',
                  )}
                >
                  {t ?? 'Tất cả'} ({count})
                </button>
              )
            })}
          </div>
          {shown.map((m) => (
            <MistakeCard key={m.id} entry={m} now={now} />
          ))}
        </section>
      )}

      <GeminiSettings hasKey={hasKey} onChange={() => setHasKey(readGeminiKey() !== null)} />
    </section>
  )
}
