import { useState, type ReactNode } from 'react'

import { useFoundation, useLoadedStore } from '@/app/store-context'
import { Kbd } from '@/components/Kbd'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { Button } from '@/components/ui/button'
import type { RowId } from '@/data/foundation'
import { FOUNDATION_QUESTIONS, foundationQuiz, type Question } from '@/data/questions'
import { rowTestMode, type RowTestContext, type RowTestMode } from '@/lib/foundation/row-test'
import { attemptId, gradeAttempt, pickQuiz, shuffleOptions, type GradedAttempt } from '@/lib/quiz'
import { canSpeak } from '@/lib/speech'

function randomPart(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

/** `mode`: chế độ thật sự dùng lúc ghi (tính từ store lúc bấm "Xem kết quả", giống `recordRowTest`). */
export type RowTestOutcome = { graded: GradedAttempt; questions: readonly Question[]; mode: RowTestMode }

type Props = {
  row: RowId
  context: RowTestContext
  /** Màn sau khi bấm "Xem kết quả" (kết quả đã được ghi). */
  renderResult: (outcome: RowTestOutcome) => ReactNode
}

/**
 * Một lần kiểm tra hàng (8 câu của `quiz-f-x`): seed và câu chốt lúc bắt đầu, chọn xong hiện đúng / chưa đúng ngay
 * (`QuestionCard tone="gentle"`, không màu đỏ). Chỉ ghi khi bấm "Xem kết quả" ở câu cuối (`recordRowTest`); rời trang giữa
 * chừng thì không ghi gì. Đổi hàng / làm lại thì nơi gọi đổi `key`.
 */
export function RowTestRun({ row, context, renderResult }: Props) {
  const { recordRowTest } = useFoundation()
  const { store } = useLoadedStore()
  const [run] = useState(() => {
    const seed = randomPart()
    return {
      seed,
      startedAt: new Date(),
      questions: pickQuiz(FOUNDATION_QUESTIONS, foundationQuiz(row), seed, { canSpeak: canSpeak() }),
    }
  })
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ graded: GradedAttempt; mode: RowTestMode } | null>(null)

  const { questions } = run
  if (result) return renderResult({ ...result, questions })
  if (questions.length === 0) return null

  const question = questions[index]
  const answered = chosen[question.id] !== undefined
  const last = index === questions.length - 1
  const finish = () => {
    const graded = gradeAttempt(questions, chosen)
    const mode = rowTestMode(store, row, context)
    const now = new Date()
    recordRowTest(
      {
        row,
        context,
        attemptId: attemptId(foundationQuiz(row).id, now, randomPart()),
        seed: run.seed,
        startedAt: run.startedAt,
        answers: graded.answers,
      },
      now,
    )
    setResult({ graded, mode })
    window.scrollTo(0, 0)
  }
  // Nút "Câu tiếp" / "Xem kết quả" và phím Enter (story 31) dùng chung handler.
  const next = last ? finish : () => setIndex((i) => i + 1)

  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`Tiến độ kiểm tra hàng ${row}`}
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index + (answered ? 1 : 0)}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>
      <QuestionCard
        key={question.id}
        question={question}
        options={shuffleOptions(question, run.seed)}
        chosen={chosen[question.id] ?? null}
        onChoose={(option) => setChosen((c) => ({ ...c, [question.id]: option }))}
        heading={`Câu ${index + 1}/${questions.length}`}
        tone="gentle"
        footer={
          <Button onClick={next} aria-keyshortcuts="Enter">
            {last ? 'Xem kết quả' : 'Câu tiếp'}
            <Kbd>Enter</Kbd>
          </Button>
        }
        onNext={next}
      />
      <p className="text-xs text-muted-foreground">Rời trang giữa chừng thì hàng này chưa được tính, lần sau làm lại từ câu 1.</p>
    </div>
  )
}
