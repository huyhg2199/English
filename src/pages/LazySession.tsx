import { useEffect, useMemo, useState } from 'react'
import { Check, Coffee, ExternalLink, TrainFront, WifiOff } from 'lucide-react'
import { Link } from 'react-router'

import { useFoundation, useLoadedStore, useSavedWords, useSessions } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { FlashcardSession, VocabAttribution } from '@/components/flashcards/FlashcardSession'
import { BrickRecap } from '@/components/foundation/BrickScreen'
import { ReadableText } from '@/components/ReadableText'
import { BackToToday, SessionDoneView, StepClock } from '@/components/session/SessionParts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBrick, hasBrickContent } from '@/data/foundation/content'
import { brickHref } from '@/lib/foundation'
import { fetchLazyNews, type LazyNews } from '@/lib/news'
import { savedWordsOn } from '@/lib/saved-words'
import { isSessionDay, lazyFoundationBrick, localDayKey } from '@/lib/sessions'

/** Số từ cần lưu (hoặc số thẻ khi offline) để xong buổi lười. */
const WORDS_NEEDED = 3

type NewsState = { status: 'loading' } | { status: 'ready'; news: LazyNews } | { status: 'offline' }

function NewsCard({ news, onDone }: { news: LazyNews; onDone: () => void }) {
  const { items } = useSavedWords()
  const [now, setNow] = useNow()
  // Mọi từ đã lưu hôm nay đều tính vào 3 từ (tin khác hay tin đổi sau khi tải lại vẫn tính), và sáng lên nếu có trong tin.
  const savedHere = useMemo(() => savedWordsOn(items, now), [items, now])
  const count = savedHere.length
  const enough = count >= WORDS_NEEDED

  const source = useMemo(() => ({ title: news.title, url: news.url }), [news])

  return (
    <>
      <Card className="gap-4">
        <CardHeader>
          <CardDescription>{news.sourceName}</CardDescription>
          <CardTitle className="text-lg">
            <ReadableText text={news.title} source={source} onSaved={setNow} />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {news.summary && <ReadableText text={news.summary} source={source} onSaved={setNow} className="text-sm" />}
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
          Chạm vào từ mới (hoặc bôi đen một cụm) để lưu kèm câu gốc · đã lưu {Math.min(count, WORDS_NEEDED)}/{WORDS_NEEDED}
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

/** 3 từ mới bằng flashcard rồi "Xong buổi" (dùng khi offline và ở bước 2 của ngày lười Sân ga). */
function ThreeWords({ onDone, firstList }: { onDone: () => void; firstList?: 'ngsl' }) {
  return (
    <>
      <FlashcardSession
        limit={WORDS_NEEDED}
        preferNew
        firstList={firstList}
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
      <ThreeWords onDone={onDone} />
    </>
  )
}

/**
 * Ngày lười khi đang ở Sân ga 9¾ (story 22): bước 1 ôn nhanh một viên đã qua (giải thích + so sánh Việt–Anh) hoặc
 * xem trước phần giải thích của viên tiếp theo (`lazyFoundationBrick`, chốt lúc mở trang); bước 2 học 3 từ (NGSL) rồi
 * "Xong buổi". Không gọi tin, không đánh dấu xong viên. "Sang 3 từ" bấm được ngay.
 */
function FoundationLazy({ onDone }: { onDone: () => void }) {
  const { store } = useLoadedStore()
  const [pick] = useState(() => lazyFoundationBrick(store, hasBrickContent))
  const [step, setStep] = useState<'brick' | 'words'>('brick')
  const brick = pick ? getBrick(pick.brickId) : undefined

  if (step === 'words') {
    return (
      <>
        <p className="text-sm text-muted-foreground">Bước 2/2 · 3 từ mới</p>
        <ThreeWords onDone={onDone} firstList="ngsl" />
      </>
    )
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">Bước 1/2 · {pick?.mode === 'review' ? 'ôn nhanh một viên gạch' : 'một viên gạch'}</p>
      {pick && brick ? (
        <Card className="gap-4">
          <CardHeader>
            <CardDescription>{pick.mode === 'review' ? 'Ôn nhanh một viên đã qua' : 'Xem trước viên tiếp theo'}</CardDescription>
            <CardTitle className="text-lg break-words">
              <h2>
                {pick.mode === 'review' ? 'Ôn nhanh' : 'Xem trước'}: {brick.id} · {brick.title}
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <BrickRecap brick={brick} contrast={pick.mode === 'review'} />
            <Link to={brickHref(brick.id)} className="self-start text-sm text-primary underline-offset-4 hover:underline">
              Mở cả viên
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-2">
          <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
            <TrainFront className="row-span-2 size-6 text-primary" aria-hidden="true" />
            <CardTitle>Các viên tiếp theo đang soạn</CardTitle>
            <CardDescription>Hôm nay học 3 từ là đủ giữ lửa rồi.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/foundation" className="text-sm text-primary underline-offset-4 hover:underline">
              Xem bức tường
            </Link>
          </CardContent>
        </Card>
      )}
      <Button
        type="button"
        onClick={() => {
          setStep('words')
          window.scrollTo(0, 0)
        }}
      >
        Sang 3 từ
      </Button>
    </>
  )
}

/**
 * Ngày lười 10': 1 tin hot ngắn (Google AI Blog → HN), chạm lưu 3 từ kèm câu + nguồn rồi "Xong buổi".
 * Offline / cả hai nguồn lỗi: 3 từ mới SRS thay cho tin. Rời giữa chừng không ghi nhật ký (từ đã lưu vẫn giữ).
 * Đang ở Sân ga 9¾ (chốt lúc mở trang): `FoundationLazy` (1 viên gạch + 3 từ), không gọi tin.
 */
export function LazySession() {
  const { record, days } = useSessions()
  const { state: foundation } = useFoundation()
  const [inFoundation] = useState(() => foundation.status === 'in-foundation')
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<NewsState>({ status: 'loading' })
  // null = chưa xong; true = hôm nay đã có buổi 30' nên ngày vẫn tính là buổi chuẩn.
  const [keptFull, setKeptFull] = useState<boolean | null>(null)

  useEffect(() => {
    if (inFoundation) return
    let alive = true
    fetchLazyNews({ fetch: (url, init) => window.fetch(url, init) }).then((news) => {
      // Đã bấm "Học offline thay thế" trong lúc chờ thì giữ luồng offline.
      if (alive) setState((prev) => (prev.status !== 'loading' ? prev : news ? { status: 'ready', news } : { status: 'offline' }))
    })
    return () => {
      alive = false
    }
  }, [attempt, inFoundation])

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

      {inFoundation && <FoundationLazy onDone={finish} />}
      {!inFoundation && state.status === 'loading' && (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-muted-foreground">Đang lấy tin…</p>
          <Button variant="outline" size="sm" onClick={() => setState({ status: 'offline' })}>
            Học offline thay thế
          </Button>
        </div>
      )}
      {!inFoundation && state.status === 'ready' && <NewsCard news={state.news} onDone={finish} />}
      {!inFoundation && state.status === 'offline' && <OfflineCards onDone={finish} onRetry={retry} />}
    </section>
  )
}
