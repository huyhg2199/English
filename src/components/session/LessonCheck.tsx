import { useState } from 'react'
import { ArrowLeft, BookOpen, Check, ClipboardCheck } from 'lucide-react'
import { Link } from 'react-router'

import { useLoadedStore, useProgress } from '@/app/store-context'
import { QuizResult } from '@/components/quiz/QuizResult'
import { brickLabel, newRun, type Run } from '@/components/quiz/quiz-run'
import { QuizNotReady, QuizRun } from '@/components/quiz/QuizRun'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QUESTION_BANK, type QuizDef } from '@/data/questions'
import { lessonHref, SECTION_TITLES, sectionHref, type Lesson, type SectionId } from '@/data/roadmap'
import { weakestSectionFrom } from '@/lib/comeback'
import { isBrickTaught } from '@/lib/foundation'
import {
  bestLessonCheck,
  checkPassed,
  checkPercent,
  LESSON_CHECK_PASS_PERCENT,
  lessonCheckVerdict,
  planQuiz,
  quizButtonCount,
  seenQuestionIds,
  type GradedAttempt,
} from '@/lib/quiz'
import { canSpeak } from '@/lib/speech'

type Phase = { kind: 'idle' } | { kind: 'run'; run: Run; finished: boolean }

/** Nhận xét dưới điểm: đạt → mời đánh dấu xong; chưa đạt → gợi ý ôn đoạn sai nhiều nhất. Không bao giờ bỏ đánh dấu. */
function CheckVerdict({ lessonId, graded, onBack }: { lessonId: string; graded: GradedAttempt; onBack: () => void }) {
  const { completedLessonIds, setCompleted } = useProgress()
  const [markedHere, setMarkedHere] = useState(false)
  const done = completedLessonIds.includes(lessonId)
  const passed = checkPassed(graded.score, graded.total)
  const percent = checkPercent(graded.score, graded.total)
  const mark = () => {
    setCompleted(lessonId, true)
    setMarkedHere(true)
  }
  const weak = weakestSectionFrom(graded)
  const sectionName = weak ? (SECTION_TITLES[weak.sectionId as SectionId] ?? weak.sectionId) : null
  const reviewHref = weak ? sectionHref(weak.lessonId, weak.sectionId) : lessonHref(lessonId)
  const reviewLabel = sectionName ? `Ôn lại đoạn ${sectionName}` : 'Ôn lại bài'
  const markedLine = (
    <p className="text-sm font-semibold text-primary">Đã đánh dấu xong bài. Sang phần ôn flashcard nhé.</p>
  )

  // Nút nào hiện chỉ theo (đạt?, bài đã xong?, vừa đánh dấu?): `lessonCheckVerdict` (hàm thuần, có test).
  const verdict = lessonCheckVerdict(passed, done, markedHere)
  const review = sectionName ? `ôn lại đoạn ${sectionName}` : 'ôn lại bài'

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/50 p-3 text-left">
      {passed ? (
        // Vừa bấm đánh dấu thì chỉ còn dòng "Đã đánh dấu xong bài…" bên dưới.
        !verdict.markedLine && (
          <p className={verdict.markButton === 'primary' ? 'text-sm font-semibold' : 'text-sm'}>
            {verdict.markButton === 'primary'
              ? `Đạt ${percent}%! Bài này bạn nắm được rồi.`
              : `Đạt ${percent}%. Bài đã đánh dấu xong.`}
          </p>
        )
      ) : (
        <p className="text-sm font-semibold">
          Được {percent}%, chưa tới {LESSON_CHECK_PASS_PERCENT}%.
        </p>
      )}
      {verdict.reviewLink && (
        <>
          <p className="text-sm text-muted-foreground">
            {verdict.nextSessionHint
              ? `Gợi ý: ${review} ngay, hoặc để buổi 30' sau ôn lại bài này (bài chưa đánh dấu xong thì buổi sau vẫn là bài này). Không ôn cũng không sao.`
              : `Gợi ý: ${review} cho chắc. Không ôn cũng không sao.`}
          </p>
          <Button asChild variant="outline" className="h-auto min-h-9 whitespace-normal">
            <Link to={reviewHref}>
              <BookOpen aria-hidden="true" />
              {reviewLabel}
            </Link>
          </Button>
        </>
      )}
      {verdict.markedLine && markedLine}
      {verdict.markButton === 'primary' && (
        <>
          <Button className="h-auto min-h-9 whitespace-normal" onClick={mark}>
            <Check aria-hidden="true" />
            Đánh dấu bài xong
          </Button>
          <p className="text-xs text-muted-foreground">Hoặc để sau: nút đánh dấu ở trang bài lúc nào cũng có.</p>
        </>
      )}
      {verdict.markButton === 'fallback' && (
        <Button variant="ghost" className="h-auto min-h-9 whitespace-normal" onClick={mark}>
          Vẫn đánh dấu xong
        </Button>
      )}
      <Button variant="ghost" className="h-auto min-h-9 whitespace-normal" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        Xem lại nội dung bài
      </Button>
    </div>
  )
}

/**
 * Một lượt kiểm tra: đề lập bằng `planQuiz` lúc bấm làm (như trang test: bỏ câu thiếu nền, câu chưa gặp trước) và chốt
 * theo lượt. `not-ready` → mời học viên còn thiếu, không ghi gì. Lần làm ghi như quiz bài thường khi làm xong câu cuối.
 */
function CheckRun({
  quiz,
  lessonId,
  run,
  onFinish,
  onRetry,
  onBack,
}: {
  quiz: QuizDef
  lessonId: string
  run: Run
  onFinish: () => void
  onRetry: () => void
  onBack: () => void
}) {
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
    <>
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
        onFinish={onFinish}
        renderResult={(graded) => (
          <QuizResult
            homeLessonId={lessonId}
            questions={questions}
            graded={graded}
            onRetry={onRetry}
            showHome={false}
            next={<CheckVerdict lessonId={lessonId} graded={graded} onBack={onBack} />}
          />
        )}
      />
    </>
  )
}

/**
 * Kiểm tra cuối Bài chính của buổi 30' (story 41): chính quiz bài `lesson-<id>`, không bắt buộc. Đạt (≥ 70%) thì mời
 * "Đánh dấu bài xong" (không tự đánh dấu); chưa đạt thì gợi ý ôn đoạn sai nhiều nhất và vẫn cho đánh dấu xong. Đang làm
 * hoặc ở màn kết quả thì báo `onFocusChange(true)` để bước Bài chính ẩn thẻ đoạn (phím tắt phần luyện thì không cùng bật,
 * không nhìn đáp án trong bài). Rời bước giữa chừng thì không ghi gì.
 */
export function LessonCheck({
  lesson,
  quiz,
  onFocusChange,
}: {
  lesson: Lesson
  quiz: QuizDef
  onFocusChange: (focused: boolean) => void
}) {
  const { store } = useLoadedStore()
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  const start = () => {
    setPhase({ kind: 'run', run: newRun(), finished: false })
    onFocusChange(true)
    window.scrollTo(0, 0)
  }
  const back = () => {
    setPhase({ kind: 'idle' })
    onFocusChange(false)
    window.scrollTo(0, 0)
  }

  if (phase.kind === 'run') {
    const { run, finished } = phase
    return (
      <section className="flex flex-col gap-3" aria-label="Kiểm tra cuối bài">
        <p className="text-sm text-muted-foreground break-words">Kiểm tra cuối bài · {lesson.title}</p>
        <CheckRun
          key={run.seed}
          quiz={quiz}
          lessonId={lesson.id}
          run={run}
          onFinish={() => setPhase({ kind: 'run', run, finished: true })}
          onRetry={() => {
            setPhase({ kind: 'run', run: newRun(), finished: false })
            window.scrollTo(0, 0)
          }}
          onBack={back}
        />
        {!finished && (
          <Button variant="ghost" className="self-start" onClick={back}>
            <ArrowLeft aria-hidden="true" />
            Thôi, quay lại bài
          </Button>
        )}
      </section>
    )
  }

  const count = quizButtonCount(QUESTION_BANK, quiz, { canSpeak: canSpeak() }, (id) => isBrickTaught(store, id))
  const best = bestLessonCheck(store, lesson.id)
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>
          <h3 className="text-lg leading-tight">Kiểm tra cuối bài</h3>
        </CardTitle>
        <CardDescription>
          {count !== null ? `${count} câu ngẫu nhiên` : 'Câu ngẫu nhiên'} của bài này, không bắt buộc. Đạt từ{' '}
          {LESSON_CHECK_PASS_PERCENT}% thì app mời đánh dấu bài xong; câu sai vào Sổ lỗi sai để ôn.
        </CardDescription>
        {best && <CardDescription>Lần tốt nhất: đạt {best.percent}%.</CardDescription>}
      </CardHeader>
      <CardContent>
        <Button className="h-auto min-h-9 whitespace-normal" onClick={start}>
          <ClipboardCheck aria-hidden="true" />
          {count !== null ? `Làm kiểm tra (${count} câu)` : 'Làm kiểm tra'}
        </Button>
      </CardContent>
    </Card>
  )
}
