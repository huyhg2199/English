import type { ReactNode } from 'react'
import { BookX, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { SourceSectionLink, TagBadge } from '@/components/quiz/QuestionCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BrickId, RowId } from '@/data/foundation'
import { MISTAKES_HREF } from '@/data/questions'
import { isRowPass } from '@/lib/foundation'
import { rowTestVerdict } from '@/lib/foundation/row-test'
import { cn } from '@/lib/utils'

import type { RowTestOutcome } from './RowTestRun'

type Props = RowTestOutcome & {
  row: RowId
  /** Viên để học tiếp khi chưa đạt (viên chưa xong đầu tiên của hàng). */
  startBrick: BrickId
  /** Hàng đã xong sau lần ghi này (đạt từ trước thì lần chưa đạt không làm hàng hết xong). */
  rowDone: boolean
  /** Các nút bên dưới điểm (sang hàng sau, làm lại, về bức tường…). */
  actions?: ReactNode
}

/**
 * Kết quả một lần kiểm tra hàng: điểm, đạt / chưa đạt bằng lời nhẹ (không chữ "trượt", không màu đỏ), câu sai kèm đáp án
 * và link về đúng viên. Chỉ kiểm tra cuối hàng (`final`) đưa câu sai vào Sổ lỗi.
 */
export function RowTestResult({ row, mode, startBrick, rowDone, graded, questions, actions }: Props) {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const wrong = graded.answers.filter((a) => !a.correct)
  const passed = isRowPass(graded.score, graded.total)
  const verdict = rowTestVerdict({ row, mode, passed, rowDone, startBrick })

  return (
    <div className="flex flex-col gap-4">
      <Card className={cn('items-center text-center', passed && 'lumos border-primary')}>
        <CardHeader className="w-full items-center">
          <Sparkles className="mx-auto size-10 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
          <CardTitle className="text-3xl" aria-label={`Điểm ${graded.score} trên ${graded.total}`}>
            {graded.score}/{graded.total}
          </CardTitle>
          <CardDescription role="status" className="text-base text-foreground">
            {verdict}
          </CardDescription>
          {wrong.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {mode === 'final'
                ? `${wrong.length} câu sai đã vào Sổ lỗi để ôn lại theo lịch.`
                : 'Câu sai ở bài này không vào Sổ lỗi.'}
            </p>
          )}
        </CardHeader>
        <CardContent className="flex w-full flex-col gap-2">
          {mode === 'final' && wrong.length > 0 && (
            <Button asChild variant="outline">
              <Link to={MISTAKES_HREF}>
                <BookX aria-hidden="true" />
                Mở Sổ lỗi sai
              </Link>
            </Button>
          )}
          {actions}
        </CardContent>
      </Card>

      {wrong.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="row-wrong-title">
          <h2 id="row-wrong-title" className="text-lg font-semibold">
            Câu chưa đúng
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
                  <p className="break-words text-muted-foreground">
                    Bạn chọn: <span lang="en">{a.chosen || '(bỏ trống)'}</span>
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
