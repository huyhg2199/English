import { useMemo, useState, type ReactNode } from 'react'
import { BookmarkCheck, Eye, ExternalLink, RotateCw } from 'lucide-react'
import { Link } from 'react-router'

import { useNewWordList, useNewWordOptions, useSavedWords, useSrs } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { useWords } from '@/app/use-words'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isBrickId } from '@/data/foundation'
import { cambridgeUrl, POS_LABELS, VOCAB_ATTRIBUTION, type StudyWord, type WordList } from '@/data/vocab'
import { ListenButton } from '@/components/ListenButton'
import { ReadableText } from '@/components/ReadableText'
import { buildStudySession, functionWordCloze, rankLabel, type FlashcardGates } from '@/lib/flashcard-session'
import { brickHref, FOUNDATION_GATES } from '@/lib/foundation'
import { originsByWord, safeSourceHref, type Origin } from '@/lib/saved-words'
import {
  formatDelay,
  isCustomWord,
  isRuleWord,
  limitedProgress,
  review,
  type ClozeParts,
  type CustomStudyWord,
  type Grade,
  type ReviewedItem,
  type RuleStudyWord,
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

/** Nhãn loại thẻ trên thẻ quy tắc (không phải "từ"). */
const RULE_KIND_LABELS: Record<SessionItem['kind'], string> = {
  new: 'Thẻ mới',
  review: 'Ôn lại',
  learning: 'Học lại',
}

/** Viên gạch mở phiên âm IPA trên thẻ. */
const IPA_BRICK = FOUNDATION_GATES.ipa

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

/**
 * Link nguồn: đường dẫn trong app dùng router, `http(s)://` mở tab mới; URL khác (dữ liệu đồng bộ/khôi phục
 * có thể chứa `javascript:`, `data:`, `//host`) chỉ hiện chữ (`safeSourceHref`).
 */
export function SourceLink({ source, className }: { source: Origin['source']; className?: string }) {
  const cls = cn('inline-flex min-w-0 items-center gap-1 text-xs text-primary underline-offset-4 hover:underline', className)
  const href = safeSourceHref(source.url)
  if (!href) {
    return (
      <span className={cn('inline-flex min-w-0 text-xs text-muted-foreground', className)}>
        <span className="truncate">{source.title}</span>
      </span>
    )
  }
  if (href.kind === 'internal') {
    return (
      <Link to={href.to} className={cls}>
        <span className="truncate">{source.title}</span>
      </Link>
    )
  }
  return (
    <a href={href.href} target="_blank" rel="noreferrer" className={cls}>
      <span className="truncate">{source.title}</span>
      <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
    </a>
  )
}

/** "Câu gốc của bạn": câu Huy đã lưu kèm nguồn. */
function Origins({ origins }: { origins: readonly Origin[] }) {
  if (origins.length === 0) return null
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/40 p-3 text-sm">
      <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <BookmarkCheck className="size-3.5" aria-hidden="true" />
        Câu gốc của bạn
      </p>
      {origins.map((o) => (
        <div key={o.sentence} className="flex flex-col gap-0.5">
          <p className="break-words italic" lang="en">
            {o.sentence}
          </p>
          <SourceLink source={o.source} />
        </div>
      ))}
    </div>
  )
}

type FlashcardProps = {
  item: SessionItem
  previous: unknown
  now: Date
  origins: readonly Origin[]
  /** Cổng hiển thị IPA / âm tiết / từ loại (chỉ thẻ từ NGSL/TSL). */
  gates: FlashcardGates
  onGrade: (grade: Grade) => void
  onKnown: () => void
}

function GradeButtons({ previous, now, onGrade }: Pick<FlashcardProps, 'previous' | 'now' | 'onGrade'>) {
  return (
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
          <span className="text-[11px] font-normal text-muted-foreground">{formatDelay(review(previous, grade, now).due, now)}</span>
        </Button>
      ))}
    </div>
  )
}

/** Thẻ riêng từ Sổ tay: mặt trước cụm + nút nghe, mặt sau nghĩa Huy nhập + câu gốc + nguồn. */
function CustomFlashcard({ word, kind, previous, now, onGrade, onKnown }: Omit<FlashcardProps, 'item' | 'origins' | 'gates'> & {
  word: CustomStudyWord
  kind: SessionItem['kind']
}) {
  const [flipped, setFlipped] = useState(false)
  return (
    <Card className="gap-4">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{KIND_LABELS[kind]}</span>
          <span>Sổ tay</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-2xl font-semibold break-words" lang="en">
            {word.word}
          </h2>
          <ListenButton text={word.word} label={`Nghe "${word.word}"`} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!flipped ? (
          <Button type="button" onClick={() => setFlipped(true)}>
            <RotateCw aria-hidden="true" />
            Lật thẻ
          </Button>
        ) : (
          <>
            <p className="text-lg">{word.meaningVi}</p>
            <Origins origins={word.sentence ? [{ sentence: word.sentence, source: word.source }] : []} />
            {!word.sentence && <SourceLink source={word.source} />}
            <GradeButtons previous={previous} now={now} onGrade={onGrade} />
            {kind === 'new' && (
              <Button type="button" variant="ghost" onClick={onKnown}>
                Đã biết cụm này (ôn lại sau 2 tháng)
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Tiêu đề thẻ là câu có chỗ trống: `___` thay cho đáp án (mặt trước), hoặc câu đủ với đáp án in đậm (mặt sau). */
function ClozeSentence({ parts, revealed, className }: { parts: ClozeParts; revealed: boolean; className?: string }) {
  return (
    <h2 className={cn('text-xl leading-relaxed break-words', className)} lang="en">
      {parts.before}
      {revealed ? (
        <strong className="font-semibold text-primary">{parts.answer}</strong>
      ) : (
        <>
          <span aria-hidden="true" className="tracking-widest text-primary">
            ___
          </span>
          <span className="sr-only" lang="vi">
            (chỗ trống)
          </span>
        </>
      )}
      {parts.after}
    </h2>
  )
}

/** Tách câu `cloze` của thẻ quy tắc quanh `___` đầu tiên. */
function ruleParts(word: RuleStudyWord): ClozeParts {
  const at = word.cloze.indexOf('___')
  if (at < 0) return { before: `${word.cloze} `, answer: word.answer, after: '' }
  return { before: word.cloze.slice(0, at), answer: word.answer, after: word.cloze.slice(at + 3) }
}

/**
 * Thẻ quy tắc viên gạch (story 24): mặt trước nhãn "Thẻ quy tắc · Fnn" + câu có chỗ trống; lật thẻ thấy câu đã điền (đáp
 * án in đậm), dòng quy tắc tiếng Việt, link xem lại viên và 4 nút chấm. Không có "Đã biết", không đọc TTS (câu có thể
 * chứa IPA).
 */
function RuleFlashcard({ word, kind, previous, now, onGrade }: Pick<FlashcardProps, 'previous' | 'now' | 'onGrade'> & {
  word: RuleStudyWord
  kind: SessionItem['kind']
}) {
  const [flipped, setFlipped] = useState(false)
  const parts = ruleParts(word)
  return (
    <Card className="gap-4">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{RULE_KIND_LABELS[kind]}</span>
          <span>Thẻ quy tắc · {word.brickId}</span>
        </div>
        <ClozeSentence parts={parts} revealed={flipped} className="min-w-0" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!flipped ? (
          <Button type="button" onClick={() => setFlipped(true)}>
            <RotateCw aria-hidden="true" />
            Lật thẻ
          </Button>
        ) : (
          <>
            <p className="text-base">{word.vi}</p>
            {isBrickId(word.brickId) && (
              <Link
                to={brickHref(word.brickId)}
                className="self-start py-1 text-sm text-primary underline-offset-4 hover:underline"
              >
                Xem lại viên {word.brickId}
              </Link>
            )}
            <GradeButtons previous={previous} now={now} onGrade={onGrade} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * IPA (sau F03), âm tiết tô âm nhấn (sau F04), nhãn từ loại (sau F07). IPA còn ẩn thì có một dòng mờ mời học F03
 * (chỉ là lời mời, không chặn gì).
 */
function WordForms({ word, gates }: { word: StudyWord; gates: FlashcardGates }) {
  return (
    <div className="flex flex-col gap-1">
      {gates.ipa ? (
        <p className="font-mono text-lg text-accent-foreground" lang="en">
          /{word.ipa}/
        </p>
      ) : (
        <Link
          to={`/foundation/${IPA_BRICK}`}
          className="self-start py-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Phiên âm IPA mở sau viên {IPA_BRICK}
        </Link>
      )}
      {gates.stress && <Syllables word={word} />}
      {gates.pos && <p className="text-sm text-muted-foreground">{POS_LABELS[word.pos]}</p>}
    </div>
  )
}

function Flashcard({ item, previous, now, origins, gates, onGrade, onKnown }: FlashcardProps) {
  // Thẻ "Làm quen": mặt sau hiện ngay, không có "Lật thẻ".
  const intro = item.intro === true
  const [flipped, setFlipped] = useState(intro)
  const { word: sessionWord, kind } = item
  if (isCustomWord(sessionWord)) {
    return <CustomFlashcard word={sessionWord} kind={kind} previous={previous} now={now} onGrade={onGrade} onKnown={onKnown} />
  }
  if (isRuleWord(sessionWord)) {
    return <RuleFlashcard word={sessionWord} kind={kind} previous={previous} now={now} onGrade={onGrade} />
  }
  const word = sessionWord
  // Hư từ (story 24): mặt trước là câu ví dụ có chỗ trống + nghĩa câu, không bao giờ hiện từ đứng một mình.
  const cloze = functionWordCloze(word)
  const wordTitle = (
    <div className="flex items-center justify-between gap-3">
      <h2 className="min-w-0 text-3xl font-semibold break-words" lang="en">
        {word.word}
      </h2>
      <ListenButton text={word.word} label={`Nghe "${word.word}"`} />
    </div>
  )

  return (
    <Card className="gap-4">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
            {intro ? 'Làm quen' : KIND_LABELS[kind]}
          </span>
          <span>{rankLabel(word)}</span>
        </div>
        {cloze ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <ClozeSentence parts={cloze} revealed={flipped} className="min-w-0" />
              {flipped && <ListenButton text={word.exampleEn} label="Nghe câu ví dụ" size="sm" />}
            </div>
            <p className="text-sm text-muted-foreground">{word.exampleVi}</p>
          </div>
        ) : (
          wordTitle
        )}
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
            {cloze && wordTitle}
            <WordForms word={word} gates={gates} />
            <p className="text-lg">{word.meaningVi}</p>
            {/* Thẻ hư từ đã hiện câu ví dụ đủ ở trên, không lặp lại. */}
            {!cloze && (
              <div className="rounded-lg border bg-secondary/40 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <ReadableText
                    as="p"
                    text={word.exampleEn}
                    source={{ title: `Flashcard “${word.word}”`, url: '/practice/flashcards' }}
                    className="min-w-0 leading-relaxed italic"
                  />
                  <ListenButton text={word.exampleEn} label="Nghe câu ví dụ" size="sm" />
                </div>
                <p className="mt-1 text-muted-foreground">{word.exampleVi}</p>
              </div>
            )}
            <Origins origins={origins} />
            <a
              href={cambridgeUrl(word.word)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 self-start text-sm text-primary underline-offset-4 hover:underline"
            >
              Tra Cambridge
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>

            {intro ? (
              // "Đã xem" = Nhớ trên từ mới: ra khỏi bước học, gặp lại 0h ngày mai. Không có nút sai.
              <Button type="button" onClick={() => onGrade('good')}>
                <Eye aria-hidden="true" />
                Đã xem
              </Button>
            ) : (
              <GradeButtons previous={previous} now={now} onGrade={onGrade} />
            )}
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
  const { items: savedItems } = useSavedWords()
  // "Câu gốc" cho từ có sẵn, từ các mục Sổ tay đã thêm vào flashcard (thẻ riêng: trong `buildStudySession`).
  const origins = useMemo(() => originsByWord(savedItems), [savedItems])
  const currentList = useNewWordList()
  const firstList = firstListProp ?? currentList
  // Thời điểm tính phiên; cập nhật sau mỗi lần chấm, mỗi phút và khi app hiện lại (không gọi giờ máy trong render).
  const [now, setNow] = useNow()
  const [reviewed, setReviewed] = useState<ReviewedItem[]>([])
  // Quota từ mới (5 ở Sân ga / 8 ở T1 / 10; 3 khi tồn ôn), id lấy trước và cổng hiển thị: cùng nguồn với tóm tắt Luyện tập.
  // Kèm id hư từ còn khoá và thẻ quy tắc của viên đã học xong (story 24).
  const { newPerDay, heavyReview, preferIds, gates, lockedIds, rules } = useNewWordOptions(now)

  const session = useMemo(
    () =>
      wordsState.status === 'ready'
        ? buildStudySession(srs, wordsState.words, savedItems, now, firstList, { newPerDay, preferIds, lockedIds, rules })
        : null,
    [srs, wordsState, savedItems, now, firstList, newPerDay, preferIds, lockedIds, rules],
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
      {heavyReview && (
        <p role="status" className="text-sm text-muted-foreground">
          Hôm nay ôn kỹ, mai học từ mới tiếp
        </p>
      )}
      {current ? (
        <Flashcard
          key={`${current.word.id}:${reviewed.length}`}
          item={current}
          previous={srs.cards[current.word.id]}
          now={now}
          origins={origins.get(current.word.word.toLowerCase()) ?? []}
          gates={gates}
          onGrade={(g) => advance(current, (at) => grade(current.word.id, g, at))}
          onKnown={() => advance(current, (at) => markKnown(current.word.id, at))}
        />
      ) : (
        renderDone({ nextDue: session.nextDue, reviewed: progress.count, limitReached: progress.limitReached })
      )}
    </>
  )
}
