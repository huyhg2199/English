import type { ReactNode } from 'react'
import { BookX, RotateCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { lessonHref } from '@/data/roadmap'
import { isTypedQuestion, MISTAKES_HREF, type Question } from '@/data/questions'
import type { GradedAttempt } from '@/lib/quiz'
import { cn } from '@/lib/utils'

import { SourceSectionLink, TagBadge } from './QuestionCard'

type Props = {
  /** Bài cho nút "Về bài học"; null = về Lộ trình. */
  homeLessonId: string | null
  questions: readonly Question[]
  graded: GradedAttempt
  /** Không truyền thì không có nút "Làm lại" (vd test quay lại). */
  onRetry?: () => void
  /** Khối hiện ngay dưới điểm (vd "Học tiếp ở đây" của test quay lại). */
  next?: ReactNode
}

/** Kết quả: điểm, từng câu sai kèm đáp án, giải thích và link về đúng đoạn bài nguồn. */
export function QuizResult({ homeLessonId, questions, graded, onRetry, next }: Props) {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const wrong = graded.answers.filter((a) => !a.correct)
  const perfect = wrong.length === 0
  return (
    <div className="flex flex-col gap-4">
      <Card className={cn('items-center text-center', perfect && 'lumos border-primary')}>
        <CardHeader className="w-full items-center">
          <Sparkles className="mx-auto size-10 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
          <CardTitle className="text-3xl" aria-label={`Điểm ${graded.score} trên ${graded.total}`}>
            {graded.score}/{graded.total}
          </CardTitle>
          <CardDescription>
            {perfect
              ? 'Đúng hết! Lumos Maxima.'
              : `${wrong.length} câu sai đã vào Sổ lỗi sai của Snape để ôn lại theo lịch.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex w-full flex-col gap-2">
          {next}
          {onRetry && (
            <Button onClick={onRetry}>
              <RotateCw aria-hidden="true" />
              Làm lại (đề mới)
            </Button>
          )}
          {!perfect && (
            <Button asChild variant="outline">
              <Link to={MISTAKES_HREF}>
                <BookX aria-hidden="true" />
                Mở Sổ lỗi sai
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost">
            <Link to={homeLessonId ? lessonHref(homeLessonId) : '/roadmap'}>{homeLessonId ? 'Về bài học' : 'Về Lộ trình'}</Link>
          </Button>
        </CardContent>
      </Card>

      {wrong.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="wrong-title">
          <h2 id="wrong-title" className="text-lg font-semibold">
            Câu sai
          </h2>
          {wrong.map((a) => {
            const q = byId.get(a.questionId)
            if (!q) return null
            return (
              <Card key={q.id} className="gap-2 py-4">
                <CardContent className="flex flex-col gap-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-base break-words" lang={q.kind === 'choice' ? 'en' : undefined}>
                      {q.kind === 'listening' ? `Nghe: “${q.answer}”` : q.prompt}
                    </p>
                    <TagBadge tag={q.tag} />
                  </div>
                  <p className="break-words">
                    <span className="text-muted-foreground">{isTypedQuestion(q) ? 'Bạn gõ: ' : 'Bạn chọn: '}</span>
                    <span className="text-destructive" lang="en">
                      {a.chosen || '(bỏ trống)'}
                    </span>
                  </p>
                  <p className="break-words">
                    <span className="text-muted-foreground">Đáp án: </span>
                    <span className="font-semibold text-primary" lang="en">
                      {q.answer}
                    </span>
                  </p>
                  <p className="break-words text-muted-foreground">{q.explanation}</p>
                  <SourceSectionLink lessonId={q.lessonId} sectionId={q.sectionId} />
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}
    </div>
  )
}
