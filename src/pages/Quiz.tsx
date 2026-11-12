import { useState } from 'react'
import { ArrowLeft, ClipboardCheck, Compass, MapPinOff } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { useComeback, useLoadedStore } from '@/app/store-context'
import { QuizResult } from '@/components/quiz/QuizResult'
import { brickLabel, newRun, type Run } from '@/components/quiz/quiz-run'
import { QuizNotReady, QuizRun } from '@/components/quiz/QuizRun'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { getQuiz, QUESTION_BANK, type QuizDef } from '@/data/questions'
import { hasBrickContent } from '@/data/foundation/content'
import {
  COMEBACK_QUIZ_ID,
  comebackHome,
  comebackQuestions,
  comebackTarget,
  weakestSectionFrom,
  type ComebackHome,
} from '@/lib/comeback'
import { isBrickTaught, isInFoundation } from '@/lib/foundation'
import { planQuiz, seenQuestionIds, type GradedAttempt } from '@/lib/quiz'
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

/**
 * "Học tiếp ở đây": đoạn bài / viên gạch có nhiều câu sai nhất; không sai câu nào thì `home` (bài hiện tại, hoặc viên
 * tiếp theo khi đang ở Sân ga; story 47).
 */
function ComebackNext({ graded, home }: { graded: GradedAttempt; home: ComebackHome | null }) {
  const weak = weakestSectionFrom(graded)
  const { href, label } = comebackTarget(weak, home)
  const atFoundation = home?.kind === 'brick' || home?.kind === 'foundation'
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/50 p-3 text-left">
      <p className="text-sm text-muted-foreground">
        {weak
          ? `Chỗ cần ôn nhất: ${weak.wrong} câu sai ở ${/^f\d{2}$/.test(weak.lessonId) ? 'viên' : 'đoạn'} này. Ôn lại rồi học tiếp nhé.`
          : atFoundation
            ? 'Vẫn nhớ tốt! Học tiếp Sân ga thôi.'
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
  // Chốt đề và chỗ học tiếp lúc bắt đầu: ghi lần làm (câu sai vào Sổ lỗi) không đổi đề đang làm.
  const [{ questions, home, atFoundation }] = useState(() => ({
    questions: comebackQuestions(store, run.seed, { canSpeak: canSpeak() }),
    home: comebackHome(store, hasBrickContent),
    atFoundation: isInFoundation(store),
  }))
  const homeLessonId = home?.kind === 'lesson' ? home.lessonId : null
  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            {atFoundation
              ? 'Chưa có câu hỏi nào để dựng test quay lại. Học tiếp viên tiếp theo ở Sân ga nhé.'
              : 'Chưa có câu hỏi nào để dựng test quay lại. Học tiếp bài hiện tại là được.'}
          </CardDescription>
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
        {atFoundation
          ? `${questions.length} câu từ các viên đã học và Sổ lỗi sai.`
          : `${questions.length} câu từ các bài gần đây và Sổ lỗi sai.`}{' '}
        Sai cũng không sao: app chỉ dùng để tìm chỗ cần ôn, tiến độ giữ nguyên.
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
            next={<ComebackNext graded={graded} home={home} />}
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
