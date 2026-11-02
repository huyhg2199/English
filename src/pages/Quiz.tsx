import { useMemo, useState } from 'react'
import { ArrowLeft, ClipboardCheck, MapPinOff } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { useQuizzes } from '@/app/store-context'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { QuizResult } from '@/components/quiz/QuizResult'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { getQuiz, QUESTION_BANK, type QuizDef } from '@/data/questions'
import { attemptId, gradeAttempt, pickQuiz, shuffleOptions, type GradedAttempt } from '@/lib/quiz'
import { canSpeak } from '@/lib/speech'

function BackLink() {
  return (
    <Link
      to="/practice"
      className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Luyện tập
    </Link>
  )
}

function randomPart(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

type Run = { seed: string; startedAt: Date }

function newRun(): Run {
  return { seed: randomPart(), startedAt: new Date() }
}

/**
 * Một lần làm: câu chọn theo seed của lần làm, chọn xong hiện đúng/sai ngay.
 * Chỉ ghi lần làm (và đẩy câu sai vào Sổ lỗi) khi làm xong câu cuối; rời trang giữa chừng thì không ghi gì.
 */
function QuizRun({ quiz, run, onRetry }: { quiz: QuizDef; run: Run; onRetry: () => void }) {
  const { record } = useQuizzes()
  const questions = useMemo(() => pickQuiz(QUESTION_BANK, quiz, run.seed, { canSpeak: canSpeak() }), [quiz, run.seed])
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const [graded, setGraded] = useState<GradedAttempt | null>(null)

  if (graded) return <QuizResult quiz={quiz} questions={questions} graded={graded} onRetry={onRetry} />

  const question = questions[index]
  const last = index === questions.length - 1
  const finish = () => {
    const result = gradeAttempt(questions, chosen)
    const now = new Date()
    record(
      { id: attemptId(quiz.id, now, randomPart()), quizId: quiz.id, seed: run.seed, startedAt: run.startedAt, answers: result.answers },
      now,
    )
    setGraded(result)
    window.scrollTo(0, 0)
  }

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
          <Button onClick={last ? finish : () => setIndex((i) => i + 1)}>{last ? 'Xem kết quả' : 'Câu tiếp'}</Button>
        }
      />
      <p className="text-xs text-muted-foreground">Rời trang giữa chừng thì lần làm này không được lưu.</p>
    </div>
  )
}

/** Trang làm bài test dùng chung (mini test T1; sau này các test khác cùng engine). */
export function Quiz() {
  const { quizId } = useParams()
  const quiz = getQuiz(quizId)
  const [run, setRun] = useState<Run>(newRun)

  if (!quiz) {
    return (
      <section className="flex flex-col gap-6">
        <BackLink />
        <header className="flex items-center gap-3">
          <MapPinOff className="size-7 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">Không tìm thấy bài test</h1>
        </header>
        <Card>
          <CardHeader>
            <CardDescription>Bài test này không có. Có thể link đã cũ.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/practice">Về Luyện tập</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <BackLink />
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">{quiz.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{quiz.description}</p>
      </header>
      <QuizRun key={run.seed} quiz={quiz} run={run} onRetry={() => setRun(newRun())} />
    </section>
  )
}
