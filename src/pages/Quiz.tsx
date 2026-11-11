import { useState, type ReactNode } from 'react'
import { ArrowLeft, BookOpen, ClipboardCheck, Compass, MapPinOff } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { useComeback, useLoadedStore, useQuizzes } from '@/app/store-context'
import { Kbd } from '@/components/Kbd'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { QuizResult } from '@/components/quiz/QuizResult'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { getBrickMeta, type BrickId } from '@/data/foundation'
import { getQuiz, QUESTION_BANK, type Question, type QuizDef } from '@/data/questions'
import { getLesson, lessonHref, SECTION_TITLES, sectionHref, type SectionId } from '@/data/roadmap'
import { COMEBACK_QUIZ_ID, pickComebackTest, weakestSectionFrom } from '@/lib/comeback'
import { brickHref, isBrickTaught } from '@/lib/foundation'
import {
  attemptId,
  gradeAttempt,
  planQuiz,
  seenQuestionIds,
  shuffleOptions,
  type AttemptKind,
  type GradedAttempt,
} from '@/lib/quiz'
import { currentLessonId } from '@/lib/schedule'
import { canSpeak } from '@/lib/speech'

function BackLink({ to = '/practice', label = 'Luyện tập' }: { to?: string; label?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {label}
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

type RunProps = {
  quizId: string
  questions: readonly Question[]
  run: Run
  kind?: AttemptKind
  /** Màn kết quả sau khi chấm (lần làm đã được ghi). */
  renderResult: (graded: GradedAttempt) => ReactNode
}

/**
 * Một lần làm: câu đã chọn sẵn theo seed của lần làm, chọn xong hiện đúng/sai ngay.
 * Chỉ ghi lần làm (và đẩy câu sai vào Sổ lỗi) khi làm xong câu cuối; rời trang giữa chừng thì không ghi gì.
 */
function QuizRun({ quizId, questions, run, kind, renderResult }: RunProps) {
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

const brickLabel = (id: BrickId) => `${id} · ${getBrickMeta(id)?.title ?? id}`

/** Quiz bài / mini test còn ít hơn `MIN_QUIZ_QUESTIONS` câu đủ nền: mời học viên còn thiếu, không chạy, không ghi gì. */
function QuizNotReady({
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

/**
 * Bài test định nghĩa sẵn (`QUIZZES`): lập đề bằng `planQuiz` (bỏ câu cần viên gạch chưa học, story 27).
 * Đề chốt lúc bắt đầu lần làm: đồng bộ hay xong viên giữa chừng không đổi đề đang làm. Câu chưa gặp ở lần làm đã chấm
 * nào được lấy trước (`seenQuestionIds`, story 35), tính cùng lúc chốt đề.
 */
function DefinedQuizRun({ quiz, run, onRetry }: { quiz: QuizDef; run: Run; onRetry: () => void }) {
  const { store } = useLoadedStore()
  const [plan] = useState(() =>
    planQuiz(
      QUESTION_BANK,
      quiz,
      run.seed,
      { canSpeak: canSpeak(), seen: seenQuestionIds(store) },
      (id) => isBrickTaught(store, id),
    ),
  )
  if (plan.status === 'not-ready') {
    return <QuizNotReady quiz={quiz} missingBrickIds={plan.missingBrickIds} startBrickId={plan.startBrickId} />
  }
  const { questions } = plan
  return (
    <div className="flex flex-col gap-3">
      {plan.skipped > 0 && (
        <p className="text-sm text-muted-foreground break-words">
          Đề lần này có {questions.length} câu, chỉ lấy câu bạn đã đủ nền. Đã bỏ {plan.skipped} câu cần viên gạch chưa
          học: {plan.missingBrickIds.map(brickLabel).join(', ')}.
        </p>
      )}
      <QuizRun
        quizId={quiz.id}
        questions={questions}
        run={run}
        renderResult={(graded) => (
          <QuizResult homeLessonId={quiz.homeLessonId} questions={questions} graded={graded} onRetry={onRetry} />
        )}
      />
    </div>
  )
}

/** "Học tiếp ở đây": đoạn có nhiều câu sai nhất; không sai câu nào thì bài hiện tại. */
function ComebackNext({ graded, homeLessonId }: { graded: GradedAttempt; homeLessonId: string | null }) {
  const weak = weakestSectionFrom(graded)
  const lesson = weak ? getLesson(weak.lessonId) : homeLessonId ? getLesson(homeLessonId) : undefined
  const href = weak ? sectionHref(weak.lessonId, weak.sectionId) : homeLessonId ? lessonHref(homeLessonId) : '/roadmap'
  const label = weak
    ? `${lesson?.title ?? weak.lessonId} · ${SECTION_TITLES[weak.sectionId as SectionId] ?? weak.sectionId}`
    : (lesson?.title ?? 'Lộ trình')
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/50 p-3 text-left">
      <p className="text-sm text-muted-foreground">
        {weak
          ? `Chỗ cần ôn nhất: ${weak.wrong} câu sai ở đoạn này. Ôn lại rồi học tiếp bài hiện tại nhé.`
          : 'Vẫn nhớ tốt! Học tiếp bài hiện tại thôi.'}
      </p>
      <Button asChild className="h-auto min-h-9 justify-start whitespace-normal text-left">
        <Link to={href}>
          <Compass aria-hidden="true" />
          Học tiếp: {label}
        </Link>
      </Button>
    </div>
  )
}

/** Test quay lại sau nghỉ 5' (story 11): đề chốt lúc bắt đầu, lưu `kind: 'comeback'`, kết quả chỉ tới đoạn hổng. */
function ComebackRun({ run }: { run: Run }) {
  const { store } = useLoadedStore()
  const [now] = useState(() => new Date())
  const { skip } = useComeback(now)
  const navigate = useNavigate()
  // Chốt đề và bài hiện tại lúc bắt đầu: ghi lần làm (câu sai vào Sổ lỗi) không đổi đề đang làm.
  const [{ questions, homeLessonId }] = useState(() => ({
    questions: pickComebackTest(store, QUESTION_BANK, run.seed, { canSpeak: canSpeak() }),
    homeLessonId: currentLessonId(store),
  }))
  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Chưa có câu hỏi nào để dựng test quay lại. Học tiếp bài hiện tại là được.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/">Về Hôm nay</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              skip()
              navigate('/')
            }}
          >
            Bỏ qua test lần này
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {questions.length} câu từ các bài gần đây và Sổ lỗi sai. Sai cũng không sao: app chỉ dùng để tìm chỗ cần ôn, tiến độ
        giữ nguyên.
      </p>
      <QuizRun
        quizId={COMEBACK_QUIZ_ID}
        kind="comeback"
        questions={questions}
        run={run}
        renderResult={(graded) => (
          <QuizResult
            homeLessonId={homeLessonId}
            questions={questions}
            graded={graded}
            next={<ComebackNext graded={graded} homeLessonId={homeLessonId} />}
          />
        )}
      />
    </div>
  )
}

/** Trang làm bài test dùng chung (mini test T1; sau này các test khác cùng engine). */
export function Quiz() {
  const { quizId } = useParams()
  const quiz = getQuiz(quizId)
  const [run, setRun] = useState<Run>(newRun)

  if (quizId === COMEBACK_QUIZ_ID) {
    return (
      <section className="flex flex-col gap-6">
        <BackLink to="/" label="Hôm nay" />
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
            <h1 className="text-2xl font-semibold tracking-wide">Test quay lại 5'</h1>
          </div>
        </header>
        <ComebackRun key={run.seed} run={run} />
      </section>
    )
  }

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
      {/* Key theo cả id test: chuyển sang test khác trong app (cùng route) phải lập đề mới, không giữ đề đã chốt. */}
      <DefinedQuizRun key={`${quiz.id}|${run.seed}`} quiz={quiz} run={run} onRetry={() => setRun(newRun())} />
    </section>
  )
}
