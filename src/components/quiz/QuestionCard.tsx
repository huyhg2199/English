import type { ReactNode } from 'react'
import { Check, Headphones, X } from 'lucide-react'
import { Link } from 'react-router'

import { ListenButton } from '@/components/ListenButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Question } from '@/data/questions'
import { cn } from '@/lib/utils'

import { questionSourceHref, sourceLabel } from './source-label'

const KIND_HINTS: Record<Question['kind'], string> = {
  choice: 'Chọn đáp án đúng',
  pronunciation: 'Phát âm',
  listening: 'Nghe',
}

/** Link về đúng đoạn bài nguồn của câu (câu Sân ga `fNN` → đúng viên gạch). */
export function SourceSectionLink({ lessonId, sectionId }: { lessonId: string; sectionId: string }) {
  return (
    <Link
      to={questionSourceHref(lessonId, sectionId)}
      className="text-xs break-words text-primary underline-offset-4 hover:underline"
    >
      Xem lại: {sourceLabel(lessonId, sectionId)}
    </Link>
  )
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-primary/50 px-2 py-0.5 text-xs text-primary">
      {tag}
    </span>
  )
}

/** Đề của câu: câu nghe có nút nghe (TTS en-US), không hiện chữ. */
export function QuestionPrompt({ question }: { question: Question }) {
  if (question.kind === 'listening') {
    return (
      <div className="flex items-center gap-3">
        <ListenButton text={question.audioText ?? question.answer} label="Nghe câu" size="sm" rate={0.85} />
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      </div>
    )
  }
  return (
    <p className="text-lg break-words" lang={question.kind === 'choice' ? 'en' : undefined}>
      {question.prompt}
    </p>
  )
}

type Props = {
  question: Question
  /** Lựa chọn theo thứ tự đã xáo. */
  options: readonly string[]
  /** Đáp án đã chọn; null khi chưa chọn. */
  chosen: string | null
  onChoose: (option: string) => void
  /** Ví dụ "Câu 3/10". */
  heading: string
  /** Hiện thêm sau khi đã chọn (vd nút câu tiếp). */
  footer?: ReactNode
  /**
   * `gentle` (Sân ga 9¾): chọn sai thì viền nét đứt, nền `muted`, lời "Chưa đúng, không sao", không dùng màu đỏ, và không
   * hiện link "Xem lại" (đang giữa bài kiểm tra hàng, rời trang là mất bài; link có ở màn kết quả). Mặc định giữ nguyên.
   */
  tone?: 'default' | 'gentle'
}

/**
 * Một câu hỏi: chọn một lần, chọn xong hiện đúng/sai ngay. Đúng có hiệu ứng Lumos; sai hiện đáp án đúng,
 * giải thích và link về đoạn bài nguồn.
 */
export function QuestionCard({ question, options, chosen, onChoose, heading, footer, tone = 'default' }: Props) {
  const answered = chosen !== null
  const correct = chosen === question.answer
  const gentle = tone === 'gentle'
  return (
    <Card className={cn('gap-4', answered && correct && 'lumos border-primary')}>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm text-muted-foreground">{heading}</CardTitle>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {question.kind === 'listening' && <Headphones className="size-3.5" aria-hidden="true" />}
            {KIND_HINTS[question.kind]}
          </span>
        </div>
        <QuestionPrompt question={question} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-2" role="group" aria-label="Các lựa chọn">
          {options.map((option) => {
            const isAnswer = option === question.answer
            const isChosen = option === chosen
            return (
              <button
                key={option}
                type="button"
                disabled={answered}
                onClick={() => onChoose(option)}
                lang="en"
                className={cn(
                  'flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-base break-words transition-colors',
                  !answered && 'hover:border-primary hover:bg-accent/40',
                  answered && isAnswer && 'border-primary bg-accent/50 text-accent-foreground',
                  answered &&
                    isChosen &&
                    !isAnswer &&
                    (gentle
                      ? 'border-dashed border-muted-foreground bg-muted/40'
                      : 'border-destructive bg-destructive/10 text-destructive'),
                  answered && !isAnswer && !isChosen && 'opacity-60',
                )}
              >
                <span className="min-w-0">{option}</span>
                {answered && isAnswer && <Check className="size-4 shrink-0" aria-label="Đáp án đúng" />}
                {answered && isChosen && !isAnswer && <X className="size-4 shrink-0" aria-label="Bạn chọn" />}
              </button>
            )
          })}
        </div>

        {answered && (
          <div role="status" className="flex flex-col gap-2 text-sm">
            <p className={cn('font-semibold', correct ? 'text-primary' : gentle ? 'text-foreground' : 'text-destructive')}>
              {correct
                ? 'Lumos! Chính xác.'
                : gentle
                  ? `Chưa đúng, không sao. Đáp án: ${question.answer}`
                  : `Chưa đúng. Đáp án: ${question.answer}`}
            </p>
            <p className="break-words text-muted-foreground">{question.explanation}</p>
            {!correct && !gentle && <SourceSectionLink lessonId={question.lessonId} sectionId={question.sectionId} />}
          </div>
        )}
        {answered && footer}
      </CardContent>
    </Card>
  )
}
