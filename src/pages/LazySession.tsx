import { useEffect, useMemo, useState } from 'react'
import { Check, Coffee, ExternalLink, WifiOff } from 'lucide-react'

import { useSavedWords, useSessions } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { FlashcardSession, VocabAttribution } from '@/components/flashcards/FlashcardSession'
import { BackToToday, SessionDoneView, StepClock } from '@/components/session/SessionParts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchLazyNews, type LazyNews } from '@/lib/news'
import { normalizeWord, savedWordsOn, tokenize } from '@/lib/saved-words'
import { isSessionDay, localDayKey } from '@/lib/sessions'
import { cn } from '@/lib/utils'

/** Số từ cần lưu (hoặc số thẻ khi offline) để xong buổi lười. */
const WORDS_NEEDED = 3

type NewsState = { status: 'loading' } | { status: 'ready'; news: LazyNews } | { status: 'offline' }

/** Đoạn văn chạm-để-lưu: mỗi từ là một nút; từ đã lưu sáng lên. */
function TappableText({
  text,
  saved,
  onTap,
  className,
}: {
  text: string
  saved: ReadonlySet<string>
  onTap: (word: string, sentence: string) => void
  className?: string
}) {
  const sentences = useMemo(() => tokenize(text), [text])
  return (
    <p className={cn('leading-loose break-words', className)} lang="en">
      {sentences.map((sentence, si) => (
        <span key={si}>
          {si > 0 && ' '}
          {sentence.parts.map((part, pi) =>
            part.word ? (
              <button
                key={pi}
                type="button"
                onClick={() => onTap(part.word!, sentence.text)}
                aria-pressed={saved.has(part.word)}
                className={cn(
                  '-mx-0.5 rounded px-0.5 underline decoration-dotted decoration-muted-foreground/60 underline-offset-4 transition-colors hover:bg-accent',
                  saved.has(part.word) &&
                    'bg-primary text-primary-foreground no-underline shadow-[0_0_10px_var(--candle-glow)] hover:bg-primary',
                )}
              >
                {part.text}
              </button>
            ) : (
              <span key={pi}>{part.text}</span>
            ),
          )}
        </span>
      ))}
    </p>
  )
}

function NewsCard({ news, onDone }: { news: LazyNews; onDone: () => void }) {
  const { items, save } = useSavedWords()
  const [now, setNow] = useNow()
  // Mọi từ đã lưu hôm nay đều tính vào 3 từ (tin khác hay tin đổi sau khi tải lại vẫn tính), và sáng lên nếu có trong tin.
  const savedHere = useMemo(() => savedWordsOn(items, now), [items, now])
  const savedSet = useMemo(() => new Set(savedHere.map((w) => w.word)), [savedHere])
  const count = savedHere.length
  const enough = count >= WORDS_NEEDED

  function tap(word: string, sentence: string) {
    if (savedSet.has(normalizeWord(word))) return
    const at = new Date()
    save({ word, sentence, source: { title: news.title, url: news.url } }, at)
    setNow(at)
  }

  return (
    <>
      <Card className="gap-4">
        <CardHeader>
          <CardDescription>{news.sourceName}</CardDescription>
          <CardTitle className="text-lg">
            <TappableText text={news.title} saved={savedSet} onTap={tap} />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {news.summary && <TappableText text={news.summary} saved={savedSet} onTap={tap} className="text-sm" />}
          <a
            href={news.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 self-start text-sm text-primary underline-offset-4 hover:underline"
          >
            Đọc tin gốc
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Chạm vào từ mới để lưu kèm câu gốc · đã lưu {Math.min(count, WORDS_NEEDED)}/{WORDS_NEEDED}
        </p>
        {savedHere.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Từ đã lưu">
            {savedHere.map((w) => (
              <li
                key={w.word}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                lang="en"
              >
                <Check className="size-3" aria-hidden="true" />
                {w.word}
              </li>
            ))}
          </ul>
        )}
        <Button onClick={onDone} disabled={!enough}>
          {enough ? 'Xong buổi' : `Còn ${WORDS_NEEDED - count} từ nữa`}
        </Button>
      </div>
    </>
  )
}

function OfflineCards({ onDone, onRetry }: { onDone: () => void; onRetry: () => void }) {
  return (
    <>
      <Card className="gap-2">
        <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
          <WifiOff className="row-span-2 size-6 text-muted-foreground" aria-hidden="true" />
          <CardTitle>Không tải được tin</CardTitle>
          <CardDescription>Học 3 từ mới bằng flashcard thay cho tin nhé.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Thử tải tin lại
          </Button>
        </CardContent>
      </Card>
      <FlashcardSession
        limit={WORDS_NEEDED}
        preferNew
        errorExtra={
          <>
            <p className="text-sm text-muted-foreground">Hôm nay không học được từ mới cũng không sao, vẫn tính buổi lười.</p>
            <Button variant="outline" onClick={onDone}>
              Xong buổi
            </Button>
          </>
        }
        renderDone={({ limitReached }) => (
          <Card className="items-center text-center">
            <CardHeader className="w-full items-center">
              <CardTitle>{limitReached ? 'Đủ 3 thẻ rồi' : 'Hết thẻ cho hôm nay'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={onDone}>Xong buổi</Button>
            </CardContent>
          </Card>
        )}
      />
      <VocabAttribution />
    </>
  )
}

/**
 * Ngày lười 10': 1 tin hot ngắn (Google AI Blog → HN), chạm lưu 3 từ kèm câu + nguồn rồi "Xong buổi".
 * Offline / cả hai nguồn lỗi: 3 từ mới SRS thay cho tin. Rời giữa chừng không ghi nhật ký (từ đã lưu vẫn giữ).
 */
export function LazySession() {
  const { record, days } = useSessions()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<NewsState>({ status: 'loading' })
  // null = chưa xong; true = hôm nay đã có buổi 30' nên ngày vẫn tính là buổi chuẩn.
  const [keptFull, setKeptFull] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    fetchLazyNews({ fetch: (url, init) => window.fetch(url, init) }).then((news) => {
      // Đã bấm "Học offline thay thế" trong lúc chờ thì giữ luồng offline.
      if (alive) setState((prev) => (prev.status !== 'loading' ? prev : news ? { status: 'ready', news } : { status: 'offline' }))
    })
    return () => {
      alive = false
    }
  }, [attempt])

  function finish() {
    const at = new Date()
    const today = days[localDayKey(at)]
    setKeptFull(isSessionDay(today) && today.kind === 'full')
    record('lazy', at)
    window.scrollTo(0, 0)
  }

  function retry() {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }

  if (keptFull !== null) {
    return (
      <section className="flex flex-col gap-6">
        <SessionDoneView
          kindLabel="buổi lười"
          note={keptFull ? "Hôm nay đã có buổi 30' nên ngày vẫn tính là buổi 30'." : undefined}
        />
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <BackToToday />
      <header className="flex items-center gap-3">
        <Coffee className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Hôm nay lười (10')</h1>
      </header>
      <StepClock minutes={10} />

      {state.status === 'loading' && (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-muted-foreground">Đang lấy tin…</p>
          <Button variant="outline" size="sm" onClick={() => setState({ status: 'offline' })}>
            Học offline thay thế
          </Button>
        </div>
      )}
      {state.status === 'ready' && <NewsCard news={state.news} onDone={finish} />}
      {state.status === 'offline' && <OfflineCards onDone={finish} onRetry={retry} />}
    </section>
  )
}
