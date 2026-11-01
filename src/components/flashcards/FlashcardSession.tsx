import { useMemo, useState, type ReactNode } from 'react'
import { ExternalLink, RotateCw, Volume2 } from 'lucide-react'

import { useNewWordList, useSrs } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { useWords } from '@/app/use-words'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cambridgeUrl, POS_LABELS, VOCAB_ATTRIBUTION, type StudyWord, type WordList } from '@/data/vocab'
import { canSpeak, speak } from '@/lib/speech'
import {
  buildSession,
  formatDelay,
  limitedProgress,
  review,
  type Grade,
  type ReviewedItem,
  type SessionItem,
} from '@/lib/srs'
import { cn } from '@/lib/utils'

const GRADE_BUTTONS: { grade: Grade; label: string; className: string }[] = [
  { grade: 'again', label: 'Quên', className: 'border-destructive/60 text-destructive hover:bg-destructive/10' },
  { grade: 'hard', label: 'Khó', className: '' },
  { grade: 'good', label: 'Nhớ', className: 'border-primary/60 text-primary' },
  { grade: 'easy', label: 'Dễ', className: '' },
]

const KIND_LABELS: Record<SessionItem['kind'], string> = {
  new: 'Từ mới',
  review: 'Ôn lại',
  learning: 'Học lại',
}

function ListenButton({ text, label, size = 'icon' }: { text: string; label: string; size?: 'icon' | 'sm' }) {
  if (!canSpeak()) return null
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
      aria-label={label}
      title={label}
      className="shrink-0"
    >
      <Volume2 aria-hidden="true" />
    </Button>
  )
}

/** Âm tiết theo chính tả, âm nhấn nổi bật (vd peo·ple với "PEO" sáng). */
function Syllables({ word }: { word: StudyWord }) {
  return (
    <p className="text-lg tracking-wide" aria-label={`Âm tiết: ${word.syllables.join(' ')}, nhấn âm ${word.stressIndex + 1}`}>
      {word.syllables.map((s, i) => (
        <span key={i}>
          {i > 0 && <span className="px-0.5 text-muted-foreground">·</span>}
          <span
            className={cn(
              i === word.stressIndex
                ? 'font-bold text-primary uppercase underline decoration-2 underline-offset-4 drop-shadow-[0_0_6px_var(--candle-glow)]'
                : 'text-foreground',
            )}
          >
            {s}
          </span>
        </span>
      ))}
    </p>
  )
}

export function VocabAttribution() {
  return (
    <p className="text-xs text-muted-foreground">
      {VOCAB_ATTRIBUTION.text}{' '}
      <a href={VOCAB_ATTRIBUTION.sourceUrl} target="_blank" rel="noreferrer" className="underline">
        newgeneralservicelist.com
      </a>{' '}
      ·{' '}
      <a href={VOCAB_ATTRIBUTION.licenseUrl} target="_blank" rel="noreferrer" className="underline">
        CC BY-SA 4.0
      </a>
      . IPA, nghĩa và câu ví dụ do AI sinh, đối chiếu thêm trên Cambridge.
    </p>
  )
}

type FlashcardProps = {
  item: SessionItem
  previous: unknown
  now: Date
  onGrade: (grade: Grade) => void
  onKnown: () => void
}

function Flashcard({ item, previous, now, onGrade, onKnown }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false)
  const { word, kind } = item

  return (
    <Card className="gap-4">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{KIND_LABELS[kind]}</span>
          <span>
            {word.list.toUpperCase()} #{word.rank}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-3xl font-semibold break-words" lang="en">
            {word.word}
          </h2>
          <ListenButton text={word.word} label={`Nghe "${word.word}"`} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!flipped ? (
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => setFlipped(true)}>
              <RotateCw aria-hidden="true" />
              Lật thẻ
            </Button>
            {kind === 'new' && (
              <Button type="button" variant="ghost" onClick={onKnown}>
                Đã biết từ này (ôn lại sau 2 tháng)
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-lg text-accent-foreground" lang="en">
                /{word.ipa}/
              </p>
              <Syllables word={word} />
              <p className="text-sm text-muted-foreground">{POS_LABELS[word.pos]}</p>
            </div>
            <p className="text-lg">{word.meaningVi}</p>
            <div className="rounded-lg border bg-secondary/40 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 break-words italic" lang="en">
                  {word.exampleEn}
                </p>
                <ListenButton text={word.exampleEn} label="Nghe câu ví dụ" size="sm" />
              </div>
              <p className="mt-1 text-muted-foreground">{word.exampleVi}</p>
            </div>
            <a
              href={cambridgeUrl(word.word)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 self-start text-sm text-primary underline-offset-4 hover:underline"
            >
              Tra Cambridge
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>

            <div className="grid grid-cols-4 gap-2">
              {GRADE_BUTTONS.map(({ grade, label, className }) => (
                <Button
                  key={grade}
                  type="button"
                  variant="outline"
                  onClick={() => onGrade(grade)}
                  className={cn('h-auto min-w-0 flex-col gap-0.5 px-1 py-2', className)}
                >
                  <span className="font-semibold">{label}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {formatDelay(review(previous, grade, now).due, now)}
                  </span>
                </Button>
              ))}
            </div>
            {kind === 'new' && (
              <Button type="button" variant="ghost" onClick={onKnown}>
                Đã biết từ này (ôn lại sau 2 tháng)
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export type FlashcardSessionDone = {
  /** Thẻ kế tiếp đến hạn khi đã hết việc hôm nay. */
  nextDue: Date | null
  /** Số từ khác nhau đã chấm trong phiên (chỉ từ mới khi `preferNew`). */
  reviewed: number
  /** Dừng vì đủ `limit` từ (không phải vì hết thẻ). */
  limitReached: boolean
}

type FlashcardSessionProps = {
  /** Dừng sau bấy nhiêu từ khác nhau (ngày lười offline: 3). Không có thì ôn tới hết. */
  limit?: number
  /** Đưa từ mới lên đầu hàng và chỉ đếm từ mới (ngày lười offline: "3 từ mới"). */
  preferNew?: boolean
  /** Danh sách lấy từ mới trước; mặc định theo chặng của bài hiện tại. */
  firstList?: WordList
  /** Nội dung khi xong (hết thẻ hoặc đủ `limit`). */
  renderDone: (info: FlashcardSessionDone) => ReactNode
  /** Thêm vào thẻ lỗi khi không mở được bộ từ (vd nút "Xong buổi" của ngày lười). */
  errorExtra?: ReactNode
}

/**
 * Phiên ôn flashcard dùng lại (trang flashcard, phần SRS của buổi, ngày lười offline):
 * thẻ đến hạn → từ mới hôm nay (theo chặng) → thẻ đang học lại. Thứ tự / giới hạn: `limitedProgress`.
 */
export function FlashcardSession({ limit, preferNew = false, firstList: firstListProp, renderDone, errorExtra }: FlashcardSessionProps) {
  const wordsState = useWords()
  const { srs, grade, markKnown } = useSrs()
  const currentList = useNewWordList()
  const firstList = firstListProp ?? currentList
  // Thời điểm tính phiên; cập nhật sau mỗi lần chấm, mỗi phút và khi app hiện lại (không gọi giờ máy trong render).
  const [now, setNow] = useNow()
  const [reviewed, setReviewed] = useState<ReviewedItem[]>([])

  const session = useMemo(
    () =>
      wordsState.status === 'ready' ? buildSession(srs, wordsState.words, now, undefined, firstList) : null,
    [srs, wordsState, now, firstList],
  )
  const progress = useMemo(
    () => limitedProgress(session?.queue ?? [], reviewed, { limit, preferNew }),
    [session, reviewed, limit, preferNew],
  )
  const current = progress.current

  function advance(item: SessionItem, action: (at: Date) => void) {
    const at = new Date()
    action(at)
    setNow(at)
    setReviewed((list) => [...list, { wordId: item.word.id, kind: item.kind }])
  }

  if (wordsState.status === 'loading') return <p className="text-sm text-muted-foreground">Đang mở bộ từ…</p>

  if (wordsState.status === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chưa mở được bộ từ</CardTitle>
          <CardDescription>Kiểm tra mạng rồi thử lại. Tiến độ ôn vẫn được giữ nguyên.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3">
          <Button onClick={wordsState.retry}>Thử lại</Button>
          {errorExtra}
        </CardContent>
      </Card>
    )
  }

  if (!session) return null

  return (
    <>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {limit !== undefined
          ? `${preferNew ? 'Từ mới' : 'Thẻ'} ${Math.min(progress.count, limit)}/${limit}`
          : `Còn ${session.dueCount} thẻ ôn · ${session.newCount} từ mới hôm nay`}
      </p>
      {current ? (
        <Flashcard
          key={`${current.word.id}:${reviewed.length}`}
          item={current}
          previous={srs.cards[current.word.id]}
          now={now}
          onGrade={(g) => advance(current, (at) => grade(current.word.id, g, at))}
          onKnown={() => advance(current, (at) => markKnown(current.word.id, at))}
        />
      ) : (
        renderDone({ nextDue: session.nextDue, reviewed: progress.count, limitReached: progress.limitReached })
      )}
    </>
  )
}
