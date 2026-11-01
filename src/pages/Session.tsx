import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpenCheck, Layers, Music, PartyPopper } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import { useSessions } from '@/app/store-context'
import { FlashcardSession, VocabAttribution } from '@/components/flashcards/FlashcardSession'
import { LessonSectionCard } from '@/components/roadmap/LessonSectionCard'
import { BackToToday, LinkList, SessionDoneView, StepClock } from '@/components/session/SessionParts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { entertainmentLinks, entertainmentTask, lessonHref } from '@/data/roadmap'
import { resolveSessionLesson, wordListForLesson, type SessionLesson } from '@/lib/sessions'
import { cn } from '@/lib/utils'

/** 3 phần của buổi chuẩn; phút chỉ để gợi ý, nút "Tiếp" bấm được bất cứ lúc nào. */
const STEPS = [
  { id: 'srs', title: 'Ôn flashcard', minutes: 5, icon: Layers },
  { id: 'lesson', title: 'Bài chính', minutes: 15, icon: BookOpenCheck },
  { id: 'fun', title: 'Giải trí', minutes: 10, icon: Music },
] as const

function Stepper({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Các phần của buổi">
      {STEPS.map((s, i) => (
        <li
          key={s.id}
          aria-current={i === step ? 'step' : undefined}
          className={cn(
            'flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center text-xs',
            i === step && 'border-primary bg-accent text-accent-foreground shadow-[0_0_12px_var(--candle-glow)]',
            i < step && 'text-muted-foreground',
            i > step && 'text-muted-foreground opacity-70',
          )}
        >
          <s.icon className="size-4" aria-hidden="true" />
          <span className="truncate">
            {s.title} {s.minutes}'
          </span>
        </li>
      ))}
    </ol>
  )
}

function LessonStep({ current }: { current: SessionLesson | null }) {
  if (!current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bạn đã đi hết lộ trình</CardTitle>
          <CardDescription>Chọn một bài bất kỳ để ôn lại trong 15 phút này.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/roadmap">Mở Lộ trình</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
  const { lesson, stage } = current
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Chặng {stage.number} {stage.name} · Tuần {lesson.week}
        </p>
        <h2 className="text-xl font-semibold break-words">{lesson.title}</h2>
        <Link to={lessonHref(lesson.id)} className="self-start text-sm text-primary underline-offset-4 hover:underline">
          Mở trang bài
        </Link>
      </div>
      {lesson.sections
        .filter((s) => s.id !== 'entertainment')
        .map((section) => (
          <LessonSectionCard key={section.id} lesson={lesson} stage={stage} section={section} />
        ))}
    </>
  )
}

function FunStep({ current }: { current: SessionLesson | null }) {
  const task = entertainmentTask(current?.lesson)
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>10' giải trí</CardTitle>
        <CardDescription>
          {task ?? 'Chọn một nguồn bạn thích: nghe nhạc điền lời, xem tin chậm, hoặc nghe từ trong video thật.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <LinkList links={entertainmentLinks(current?.lesson)} />
        <p className="text-xs text-muted-foreground">Link mở tab mới. Xong thì quay lại đây bấm "Xong buổi".</p>
      </CardContent>
    </Card>
  )
}

/**
 * Buổi 30': ôn SRS 5' → bài chính 15' → giải trí 10'. Phần hiện tại nằm ở `?step=` để mở trang bài
 * rồi quay lại vẫn đúng phần. Rời buổi giữa chừng không ghi gì; chỉ "Xong buổi" mới ghi nhật ký.
 */
export function Session() {
  const { current, record } = useSessions()
  const [params, setParams] = useSearchParams()
  const [finished, setFinished] = useState(false)
  // Bài của buổi chốt trên URL (`?lesson=`), nên mở trang bài, đánh dấu xong rồi quay lại vẫn đúng bài.
  // Chưa có (vào buổi lần đầu) hoặc sai thì lấy bài hiện tại.
  const lesson = resolveSessionLesson(params.get('lesson'), current)
  const raw = Number(params.get('step'))
  const step = Number.isInteger(raw) && raw >= 0 && raw < STEPS.length ? raw : 0
  const meta = STEPS[step]
  const last = step === STEPS.length - 1

  function goTo(next: number) {
    const locked: Record<string, string> = lesson ? { lesson: lesson.lesson.id } : {}
    setParams(next === 0 ? locked : { ...locked, step: String(next) }, { replace: true })
    window.scrollTo(0, 0)
  }

  function finish() {
    record('full', new Date(), { lessonId: lesson?.lesson.id })
    setFinished(true)
    window.scrollTo(0, 0)
  }

  if (finished) {
    return (
      <section className="flex flex-col gap-6">
        <SessionDoneView kindLabel="buổi 30'" />
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <BackToToday />
      <header className="flex items-center gap-3">
        <meta.icon className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">
          {meta.title} {meta.minutes}'
        </h1>
      </header>
      <Stepper step={step} />

      <StepClock
        key={step}
        minutes={meta.minutes}
        onExpiredHint={
          meta.id === 'srs' ? (
            <p role="status" className="rounded-lg border border-primary/40 bg-accent/40 p-3 text-sm">
              Hết 5' rồi, sang bài chính nhé. Muốn ôn tiếp thẻ đang dở vẫn được.
            </p>
          ) : null
        }
      />

      {meta.id === 'srs' && (
        <FlashcardSession
          firstList={wordListForLesson(lesson)}
          renderDone={() => (
            <Card className="items-center text-center">
              <CardHeader className="w-full items-center">
                <PartyPopper className="mx-auto size-10 text-primary" aria-hidden="true" />
                <CardTitle>Phần ôn xong</CardTitle>
                <CardDescription>Hết thẻ cho hôm nay. Sang phần bài chính thôi.</CardDescription>
              </CardHeader>
            </Card>
          )}
        />
      )}
      {meta.id === 'lesson' && <LessonStep current={lesson} />}
      {meta.id === 'fun' && <FunStep current={lesson} />}

      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => goTo(step - 1)}>
            <ArrowLeft aria-hidden="true" />
            Quay lại
          </Button>
        )}
        {last ? (
          <Button className="flex-1" onClick={finish}>
            Xong buổi
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => goTo(step + 1)}>
            Tiếp: {STEPS[step + 1].title}
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>

      {meta.id === 'srs' && <VocabAttribution />}
    </section>
  )
}
