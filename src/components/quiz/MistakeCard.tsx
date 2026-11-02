import { useEffect, useRef, useState } from 'react'
import { Eye, GraduationCap, Loader2, MessageCircleQuestion, RotateCw } from 'lucide-react'

import { useMistakes } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getQuestion } from '@/data/questions'
import { explainMistake, GEMINI_ERROR_MESSAGES, readGeminiKey, readGeminiModel } from '@/lib/ai'
import { isExplanationStale, isMastered, type MistakeEntry } from '@/lib/quiz'
import { formatDelay } from '@/lib/srs'

import { GEMINI_SETTINGS_ID } from './GeminiSettings'
import { SourceSectionLink, TagBadge } from './QuestionCard'

/** Gemini không trả lời sau bấy nhiêu ms thì huỷ và báo lỗi. */
const EXPLAIN_TIMEOUT_MS = 30_000
const TIMEOUT_MESSAGE = 'Gemini trả lời quá lâu (hơn 30 giây) nên đã dừng. Thử lại sau.'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string; askKey?: boolean }

/**
 * Một mục trong Sổ lỗi: đề, đáp án, số lần sai, lịch ôn, link bài nguồn và "Vì sao sai?".
 * Câu đang đến hạn ôn thì ẩn đáp án (và chữ câu nghe) cho tới khi bấm "Xem đáp án".
 */
export function MistakeCard({ entry, now }: { entry: MistakeEntry; now: Date }) {
  const { saveExplanation } = useMistakes()
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [revealed, setRevealed] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const question = getQuestion(entry.id)
  const mastered = isMastered(entry)
  const due = Date.parse(entry.card.due) <= now.getTime()
  const showAnswer = !due || revealed
  const stale = isExplanationStale(entry)

  // Rời trang / mục biến mất thì huỷ yêu cầu đang chạy (không cập nhật state sau unmount).
  useEffect(() => () => controller.current?.abort(), [])

  const explain = async () => {
    if (!question) return
    const key = readGeminiKey()
    if (!key) {
      setStatus({ kind: 'error', message: GEMINI_ERROR_MESSAGES['no-key'], askKey: true })
      return
    }
    controller.current?.abort()
    const ctrl = new AbortController()
    controller.current = ctrl
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      ctrl.abort()
    }, EXPLAIN_TIMEOUT_MS)
    setStatus({ kind: 'loading' })
    const model = readGeminiModel()
    const chosen = entry.lastChosen
    const result = await explainMistake({
      fetch: globalThis.fetch.bind(globalThis),
      key,
      model,
      question,
      chosen,
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (controller.current !== ctrl) return
    controller.current = null
    // Huỷ do unmount: không đụng state. Huỷ do quá giờ: báo lỗi, nút bấm lại được.
    if (!result.ok && result.code === 'aborted' && !timedOut) return
    if (result.ok) {
      saveExplanation(entry.id, result.text, model, chosen)
      setStatus({ kind: 'idle' })
    } else if (timedOut) {
      setStatus({ kind: 'error', message: TIMEOUT_MESSAGE })
    } else {
      setStatus({ kind: 'error', message: result.message, askKey: result.code === 'no-key' || result.code === 'invalid-key' })
    }
  }

  const loading = status.kind === 'loading'
  const explainButton = (label: string, Icon: typeof MessageCircleQuestion) => (
    <Button variant="outline" size="sm" className="self-start" onClick={explain} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Icon aria-hidden="true" />}
      {label}
    </Button>
  )

  const promptText = !question
    ? `Câu ${entry.id}`
    : question.kind === 'listening'
      ? showAnswer
        ? `Nghe: “${question.answer}”`
        : 'Câu nghe (ẩn chữ khi đang đến hạn ôn)'
      : question.prompt

  return (
    <Card className="gap-2 py-4">
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 text-base break-words" lang={question?.kind === 'choice' ? 'en' : undefined}>
            {promptText}
          </p>
          <TagBadge tag={entry.tag} />
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>
            Sai {entry.wrongCount} lần · gần nhất {formatDate(entry.lastWrongAt)}
          </span>
          {mastered ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">
              <GraduationCap className="size-3" aria-hidden="true" />
              đã thuộc
            </span>
          ) : (
            <span>{due ? 'đến hạn ôn' : `ôn lại sau ${formatDelay(entry.card.due, now)}`}</span>
          )}
        </p>

        {question && !showAnswer && (
          <Button variant="ghost" size="sm" className="self-start" onClick={() => setRevealed(true)}>
            <Eye aria-hidden="true" />
            Xem đáp án
          </Button>
        )}

        {question && showAnswer && (
          <>
            <p className="break-words">
              <span className="text-muted-foreground">Đáp án: </span>
              <span className="font-semibold text-primary" lang="en">
                {question.answer}
              </span>
              <span className="text-muted-foreground"> · bạn chọn </span>
              <span className="text-destructive" lang="en">
                {entry.lastChosen || '(bỏ trống)'}
              </span>
            </p>
            <p className="break-words text-muted-foreground">{question.explanation}</p>
          </>
        )}
        <SourceSectionLink lessonId={entry.lessonId} sectionId={entry.sectionId} />

        {showAnswer && question && (
          <div className="flex flex-col gap-1">
            {entry.explanation && (
              <div className="flex flex-col gap-1 rounded-lg border border-primary/40 bg-accent/20 p-3">
                <p className="text-xs font-semibold text-primary">
                  Vì sao sai? (Gemini)
                  {stale && (
                    <span className="font-normal text-muted-foreground">
                      {' '}
                      · giải thích cho lần chọn trước (“{entry.explanation.chosen || 'bỏ trống'}”)
                    </span>
                  )}
                </p>
                <p className="break-words whitespace-pre-wrap">{entry.explanation.text}</p>
              </div>
            )}
            {!entry.explanation && explainButton('Vì sao sai?', MessageCircleQuestion)}
            {stale && explainButton('Hỏi lại', RotateCw)}
            {status.kind === 'error' && (
              <p role="alert" className="text-xs text-destructive">
                {status.message}{' '}
                {status.askKey && (
                  <a
                    href={`#${GEMINI_SETTINGS_ID}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(GEMINI_SETTINGS_ID)?.scrollIntoView({ block: 'start' })
                    }}
                    className="underline"
                  >
                    Nhập key
                  </a>
                )}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
