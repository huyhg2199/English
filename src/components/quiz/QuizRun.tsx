import { useState, type ReactNode } from 'react'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Link } from 'react-router'

import { useQuizzes } from '@/app/store-context'
import { Kbd } from '@/components/Kbd'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import type { BrickId } from '@/data/foundation'
import type { Question, QuizDef } from '@/data/questions'
import { lessonHref } from '@/data/roadmap'
import { brickHref } from '@/lib/foundation'
import { attemptId, gradeAttempt, shuffleOptions, type AttemptKind, type GradedAttempt } from '@/lib/quiz'

import { brickLabel, randomPart, type Run } from './quiz-run'

type RunProps = {
  quizId: string
  questions: readonly Question[]
  run: Run
  kind?: AttemptKind
  /** Màn kết quả sau khi chấm (lần làm đã được ghi). */
  renderResult: (graded: GradedAttempt) => ReactNode
  /** Gọi ngay sau khi ghi lần làm (vd kiểm tra cuối Bài chính đổi phần chữ quanh màn kết quả). */
  onFinish?: (graded: GradedAttempt) => void
}

/**
 * Một lần làm: câu đã chọn sẵn theo seed của lần làm, chọn xong hiện đúng/sai ngay.
 * Chỉ ghi lần làm (và đẩy câu sai vào Sổ lỗi) khi làm xong câu cuối; rời trang giữa chừng thì không ghi gì.
 * Dùng chung cho trang test và kiểm tra cuối Bài chính của buổi 30' (story 41).
 */
export function QuizRun({ quizId, questions, run, kind, renderResult, onFinish }: RunProps) {
  const { record } = useQuizzes()
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const [graded, setGraded] = useState<GradedAttempt | null>(null)

  if (graded) return renderResult(graded)
  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Chưa có câu hỏi phù hợp cho bài test này.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const question = questions[index]
  const last = index === questions.length - 1
  const finish = () => {
    const result = gradeAttempt(questions, chosen)
    const now = new Date()
    record(
      {
        id: attemptId(quizId, now, randomPart()),
        quizId,
        seed: run.seed,
        startedAt: run.startedAt,
        answers: result.answers,
        ...(kind ? { kind } : {}),
      },
      now,
    )
    setGraded(result)
    onFinish?.(result)
    window.scrollTo(0, 0)
  }
  // Nút "Câu tiếp" / "Xem kết quả" và phím Enter (story 31) dùng chung handler.
  const next = last ? finish : () => setIndex((i) => i + 1)

  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Tiến độ bài test"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index + (chosen[question.id] ? 1 : 0)}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((index + (chosen[question.id] ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>
      <QuestionCard
        key={question.id}
        question={question}
        options={shuffleOptions(question, run.seed)}
        chosen={chosen[question.id] ?? null}
        onChoose={(option) => setChosen((c) => ({ ...c, [question.id]: option }))}
        heading={`Câu ${index + 1}/${questions.length}`}
        footer={
          <Button onClick={next} aria-keyshortcuts="Enter">
            {last ? 'Xem kết quả' : 'Câu tiếp'}
            <Kbd>Enter</Kbd>
          </Button>
        }
        onNext={next}
      />
      <p className="text-xs text-muted-foreground">Rời trang giữa chừng thì lần làm này không được lưu.</p>
    </div>
  )
}

/** Quiz bài / mini test còn ít hơn `MIN_QUIZ_QUESTIONS` câu đủ nền: mời học viên còn thiếu, không chạy, không ghi gì. */
export function QuizNotReady({
  quiz,
  missingBrickIds,
  startBrickId,
}: {
  quiz: QuizDef
  missingBrickIds: readonly BrickId[]
  startBrickId: BrickId | null
}) {
  // Học theo thứ tự Sân ga: viên chưa dạy đầu tiên (luôn ≤ viên thiếu đầu tiên), không nhảy cóc tới viên đề cần.
  const first = startBrickId ?? missingBrickIds[0]
  return (
    <Card>
      <CardHeader>
        <CardDescription className="break-words">
          Bài test này cần vài viên gạch bạn chưa học ở Sân ga 9¾: {missingBrickIds.map(brickLabel).join(', ')}.
        </CardDescription>
        <CardDescription>Học xong rồi quay lại nhé. Bài học vẫn đánh dấu xong được như thường.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {first && (
          <Button asChild className="h-auto min-h-9 justify-start whitespace-normal text-left">
            <Link to={brickHref(first)}>
              <BookOpen aria-hidden="true" />
              Học {brickLabel(first)}
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="self-start">
          <Link to={lessonHref(quiz.homeLessonId)}>
            <ArrowLeft aria-hidden="true" />
            Về bài
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
