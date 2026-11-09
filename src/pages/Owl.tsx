import { useMemo, useState } from 'react'
import { ArrowLeft, GraduationCap, Loader2 } from 'lucide-react'
import { Link } from 'react-router'

import { useLoadedStore, useOwl } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { useWords } from '@/app/use-words'
import { Kbd } from '@/components/Kbd'
import { EtsForm } from '@/components/owl/EtsForm'
import { OwlPronunciation } from '@/components/owl/OwlPronunciation'
import { OwlResult } from '@/components/owl/OwlResult'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QUESTION_BANK, type Question } from '@/data/questions'
import { STAGES } from '@/data/roadmap'
import type { Word } from '@/data/vocab'
import {
  gradeOwl,
  OWL_PRONUNCIATION_SIZE,
  OWL_QUIZ_ID,
  OWL_TENSES_SIZE,
  owlPassed,
  owlTensePool,
  partPercent,
  pickOwlPronunciation,
  pickOwlTenses,
  type EtsScores,
  type OwlWord,
} from '@/lib/owl'
import { attemptId, gradeAttempt, shuffleOptions, type AttemptAnswer } from '@/lib/quiz'

function randomPart(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

const checkpoint = STAGES[0].checkpoint

/** Phần thì: 20 câu trắc nghiệm, chọn xong hiện đúng/sai ngay (dùng lại thẻ câu hỏi của engine test). */
function TensesPart({
  questions,
  seed,
  onDone,
}: {
  questions: readonly Question[]
  seed: string
  onDone: (answers: AttemptAnswer[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const question = questions[index]
  const last = index === questions.length - 1
  const answered = chosen[question.id] !== undefined
  // Nút "Câu tiếp" / "Nộp bài" và phím Enter (story 31) dùng chung handler.
  const next = () => {
    // Phải chọn đáp án trước khi sang câu / nộp bài (không chấm sai im lặng câu bỏ trống).
    if (!answered) return
    if (last) onDone(gradeAttempt(questions, chosen).answers)
    else {
      setIndex((i) => i + 1)
      window.scrollTo(0, 0)
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Tiến độ phần thì"
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
        options={shuffleOptions(question, seed)}
        chosen={chosen[question.id] ?? null}
        onChoose={(option) => setChosen((c) => ({ ...c, [question.id]: option }))}
        heading={`Thì · câu ${index + 1}/${questions.length}`}
        footer={
          <Button disabled={!answered} onClick={next} aria-keyshortcuts="Enter">
            {last ? 'Nộp bài, xem kết quả' : 'Câu tiếp'}
            <Kbd>Enter</Kbd>
          </Button>
        }
        onNext={next}
      />
      <p className="text-xs text-muted-foreground">Rời trang giữa chừng thì lần thi này không được lưu.</p>
    </div>
  )
}

type Step = 'ets' | 'pronunciation' | 'tenses' | 'result'

type Exam = { seed: string; startedAt: Date; words: OwlWord[]; questions: Question[] }

type Finished = { id: string; answers: AttemptAnswer[] }

/** Một lần thi: đề chốt lúc bắt đầu; chỉ ghi khi nộp phần cuối. */
function OwlRun({ words, onRetry }: { words: readonly Word[]; onRetry: () => void }) {
  const { store } = useLoadedStore()
  const [now] = useNow()
  const { record, attempts } = useOwl(now)
  const [exam] = useState<Exam>(() => {
    const seed = randomPart()
    return {
      seed,
      startedAt: new Date(),
      words: pickOwlPronunciation(store, words, seed),
      questions: pickOwlTenses(QUESTION_BANK, seed),
    }
  })
  const [step, setStep] = useState<Step>('ets')
  const [ets, setEts] = useState<EtsScores>({})
  const [pron, setPron] = useState<{ answers: AttemptAnswer[]; selfGraded: boolean } | null>(null)
  const [finished, setFinished] = useState<Finished | null>(null)

  if (exam.words.length === 0 || exam.questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Chưa dựng được đề (thiếu dữ liệu từ hoặc câu thì). Thử tải lại trang nhé.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (step === 'ets') {
    return (
      <EtsForm
        onDone={(scores) => {
          setEts(scores)
          setStep('pronunciation')
          window.scrollTo(0, 0)
        }}
      />
    )
  }

  if (step === 'pronunciation') {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Phần 2 · Phát âm ({exam.words.length} từ)</h2>
        <OwlPronunciation
          words={exam.words}
          onDone={(answers, selfGraded) => {
            setPron({ answers, selfGraded })
            setStep('tenses')
            window.scrollTo(0, 0)
          }}
        />
      </div>
    )
  }

  if (step === 'tenses' && pron) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Phần 3 · Thì ({exam.questions.length} câu)</h2>
        <TensesPart
          questions={exam.questions}
          seed={exam.seed}
          onDone={(tenses) => {
            const at = new Date()
            const id = attemptId(OWL_QUIZ_ID, at, randomPart())
            record(
              {
                id,
                seed: exam.seed,
                startedAt: exam.startedAt,
                pronunciation: pron.answers,
                words: exam.words,
                tenses,
                ets,
                selfGraded: pron.selfGraded,
              },
              at,
            )
            setFinished({ id, answers: [...pron.answers, ...tenses] })
            setStep('result')
            window.scrollTo(0, 0)
          }}
        />
      </div>
    )
  }

  if (step === 'result' && finished) {
    const scores = gradeOwl(finished.answers)
    const passed = owlPassed(scores)
    // Kế hoạch đã lưu kèm lần thi.
    const plan = attempts.find((a) => a.id === finished.id)?.details.plan ?? null
    return (
      <OwlResult
        selfGraded={pron?.selfGraded ?? false}
        scores={scores}
        passed={passed}
        plan={plan}
        words={exam.words}
        questions={exam.questions}
        answers={finished.answers}
        onRetry={onRetry}
      />
    )
  }
  return null
}

/** Lịch sử thi ngắn gọn. */
function History() {
  const [now] = useNow()
  const { attempts } = useOwl(now)
  if (attempts.length === 0) return null
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-base">
          <h2>Các lần thi</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1.5 text-sm">
          {attempts.slice(0, 5).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-x-2">
              <span className="text-muted-foreground">
                {new Date(a.finishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
              </span>
              <span className="tabular-nums">
                Phát âm {partPercent(a.details.pronunciation)}% · Thì {partPercent(a.details.tenses)}%
              </span>
              <span className={a.passed ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                {a.passed ? 'Qua' : 'Chưa qua'}
                {a.details.selfGraded && <span className="font-normal text-muted-foreground"> · có phần tự chấm</span>}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/**
 * Kỳ thi O.W.L. 1 (story 14): ETS (tham khảo) → 30 từ đọc theo IPA → 20 câu thì. Qua khi từng phần phát âm và thì
 * ≥ 70%. Vào từ đoạn kiểm tra bài `s1-t4-w4` và từ Luyện tập; không khoá theo tiến độ.
 */
export function Owl() {
  const wordsState = useWords()
  const { store } = useLoadedStore()
  const [run, setRun] = useState<number | null>(null)
  // Số từ / câu đề sẽ có với dữ liệu hiện có (báo trước khi thiếu so với 30 / 20).
  const counts = useMemo(
    () =>
      wordsState.status === 'ready'
        ? {
            words: pickOwlPronunciation(store, wordsState.words, 'probe').length,
            questions: Math.min(OWL_TENSES_SIZE, owlTensePool(QUESTION_BANK).length),
          }
        : null,
    [store, wordsState],
  )
  const short = counts && (counts.words < OWL_PRONUNCIATION_SIZE || counts.questions < OWL_TENSES_SIZE)

  return (
    <section className="flex flex-col gap-6">
      <Link
        to="/practice"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Luyện tập
      </Link>
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <GraduationCap className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">{checkpoint.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">Kỳ thi qua cửa chặng 1 · {checkpoint.passThreshold}</p>
      </header>

      {run === null ? (
        <>
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="text-lg">
                <h2>Ba phần thi</h2>
              </CardTitle>
              <CardDescription>Làm lúc nào cũng được, bao nhiêu lần cũng được. Trượt không mất gì.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <ol className="list-decimal space-y-1 pl-5">
                <li>Đề mẫu ETS Part 1, 2, 5 làm ngoài app, nhập số câu đúng (chỉ để tham khảo).</li>
                <li>{OWL_PRONUNCIATION_SIZE} từ trong thẻ bạn đã học: nhìn IPA và đọc to.</li>
                <li>{OWL_TENSES_SIZE} câu trắc nghiệm chia thì của chặng 1.</li>
              </ol>
              <p className="text-muted-foreground">
                Qua cửa khi phần phát âm và phần thì đều đúng ≥ 70% (tính riêng từng phần). Câu sai tự vào Sổ lỗi sai của
                Snape. {checkpoint.ifNotPassed}
              </p>
              {short && counts && (
                <p role="status" className="rounded-lg border border-primary/40 bg-accent/30 p-2">
                  Đề có {counts.words} từ / {counts.questions} câu do dữ liệu hiện có. Ngưỡng 70% vẫn tính trên số câu thật.
                </p>
              )}
              {wordsState.status === 'error' ? (
                <Button variant="outline" onClick={wordsState.retry}>
                  Chưa mở được bộ từ, thử lại
                </Button>
              ) : (
                <Button disabled={wordsState.status !== 'ready'} onClick={() => setRun(Date.now())}>
                  {wordsState.status === 'loading' && <Loader2 className="animate-spin" aria-hidden="true" />}
                  Bắt đầu thi
                </Button>
              )}
            </CardContent>
          </Card>
          <History />
        </>
      ) : (
        wordsState.status === 'ready' && (
          <OwlRun key={run} words={wordsState.words} onRetry={() => setRun(Date.now())} />
        )
      )}
    </section>
  )
}
