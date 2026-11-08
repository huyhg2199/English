import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Hammer,
  Layers,
  Music,
  PartyPopper,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import { useLessonParts, useLoadedStore, useSessions, useSkillBoard } from '@/app/store-context'
import { BrickPlayer } from '@/components/foundation/BrickPlayer'
import { FlashcardSession, VocabAttribution } from '@/components/flashcards/FlashcardSession'
import type { PronunciationView } from '@/components/lesson/LessonContentParts'
import { LessonSectionContent } from '@/components/lesson/LessonSectionContent'
import { VideoList } from '@/components/media/VideoEmbed'
import { ReadingSourceContext } from '@/components/reading-source'
import { LessonSectionCard } from '@/components/roadmap/LessonSectionCard'
import { BackToToday, LinkList, SessionDoneView, StepClock } from '@/components/session/SessionParts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBrickMeta, type BrickId } from '@/data/foundation'
import { getBrick, hasBrickContent } from '@/data/foundation/content'
import { getLessonContent } from '@/data/lessons'
import {
  entertainmentLinks,
  entertainmentTask,
  FOUNDATION_FUN_LINKS,
  lessonHref,
  sectionHref,
} from '@/data/roadmap'
import { foundationFunVideos, funStepVideos } from '@/data/videos'
import { prioritizeSections } from '@/lib/placement'
import {
  followUpBrickId,
  lockTheory,
  resolveSessionPlan,
  sessionRecordLessonId,
  sessionSearch,
  sessionWordList,
  type ReviewNote,
  type SessionLesson,
  type SessionPlan,
  type SessionStep,
  type SessionStepId,
  type TheoryLock,
} from '@/lib/sessions'
import { cn } from '@/lib/utils'

const STEP_ICONS: Record<SessionStepId, LucideIcon> = {
  theory: BookOpen,
  review: Layers,
  lesson: BookOpenCheck,
  srs: Layers,
  fun: Music,
}

function Stepper({ steps, step }: { steps: readonly SessionStep[]; step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Các phần của buổi">
      {steps.map((s, i) => {
        const Icon = STEP_ICONS[s.id]
        return (
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
            <Icon className="size-4" aria-hidden="true" />
            <span className="truncate">
              {s.title} {s.minutes}'
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Dòng mô tả của chế độ ôn, theo viên đang ôn (`reviewNote`). */
const REVIEW_NOTES: Record<ReviewNote, string> = {
  latest: 'Các viên tiếp theo đang soạn, hôm nay ôn lại viên gần nhất.',
  done: 'Các viên tiếp theo đang soạn, hôm nay ôn lại viên này.',
  tested: 'Các viên tiếp theo đang soạn. Hàng này bạn đã qua, hôm nay ôn lại cho chắc.',
}

/** Phần lý thuyết của buổi Sân ga: một viên gạch chạy ngay trong buổi; xong viên có nút "Học tiếp viên sau". */
function TheoryStep({
  brickId,
  review,
  note,
  followUp,
  onFollowUp,
}: {
  brickId: BrickId | null
  review: boolean
  note: ReviewNote | null
  followUp: BrickId | null
  onFollowUp: (id: BrickId) => void
}) {
  const brick = brickId ? getBrick(brickId) : undefined
  if (!brick) {
    return (
      <Card className="gap-4">
        <CardHeader>
          <Hammer className="size-7 text-primary" aria-hidden="true" />
          <CardTitle>
            <h2 className="text-xl leading-tight">Các viên tiếp theo đang soạn</h2>
          </CardTitle>
          <CardDescription>Hôm nay ôn flashcard và giải trí nhẹ. Bức tường vẫn mở để bạn xem lại.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/foundation">Xem bức tường</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
  const next = followUp ? getBrickMeta(followUp) : undefined
  return (
    <>
      {review && (
        <div className="flex flex-col gap-1 rounded-lg border border-primary/40 bg-accent/40 p-3">
          <p className="text-sm font-semibold break-words">
            Ôn lại: {brick.id} · {brick.title}
          </p>
          <p className="text-sm text-muted-foreground">{REVIEW_NOTES[note ?? 'latest']}</p>
        </div>
      )}
      <BrickPlayer
        key={brick.id}
        brick={brick}
        variant="session"
        endSlot={
          !review && next ? (
            <Button
              type="button"
              className="h-auto min-h-9 max-w-full py-2 text-left whitespace-normal"
              onClick={() => onFollowUp(next.id)}
            >
              <Sparkles aria-hidden="true" />
              <span className="min-w-0 break-words">
                Học tiếp viên sau: {next.id} · {next.title}
              </span>
            </Button>
          ) : null
        }
      />
    </>
  )
}

/**
 * Bài chính: thẻ đoạn kèm nội dung (bảng âm, TenseCard, nút thi O.W.L.) hiện ngay trong buổi, lý thuyết trước.
 * Bài T1 chia phần (story 28): đoạn Phát âm chỉ hiện phần của buổi (`partId`); đã xem hết thì hiện mọi phần để ôn cả tuần.
 */
function LessonStep({ current, partId }: { current: SessionLesson | null; partId: string | null }) {
  const { weakest } = useSkillBoard()
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
  const content = getLessonContent(lesson.id)
  const partCount = content?.parts?.length ?? 0
  const view: PronunciationView = partId ? { kind: 'part', partId } : { kind: 'all' }
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Chặng {stage.number} {stage.name} · Tuần {lesson.week}
        </p>
        <h2 className="text-xl font-semibold break-words">{lesson.title}</h2>
      </div>
      {partCount > 0 && !partId && (
        <p className="rounded-lg border border-primary/40 bg-accent/40 p-3 text-sm">
          Đã xem đủ {partCount} phần, hôm nay ôn lại cả tuần.
        </p>
      )}
      {/* Lý thuyết (phát âm, ngữ pháp) luôn trước; đoạn luyện của kỹ năng yếu nhất lên trước đoạn luyện khác, nhãn "Ưu tiên". */}
      {prioritizeSections(
        lesson.sections.filter((s) => s.id !== 'entertainment'),
        weakest,
      ).map(({ section, priority }) => (
        <ReadingSourceContext.Provider
          key={section.id}
          value={{ title: `${lesson.title} · ${section.title}`, url: sectionHref(lesson.id, section.id) }}
        >
          <LessonSectionCard lesson={lesson} stage={stage} section={section} priority={priority}>
            <LessonSectionContent
              lesson={lesson}
              stage={stage}
              section={section}
              content={content}
              pronunciationView={view}
            />
          </LessonSectionCard>
        </ReadingSourceContext.Provider>
      ))}
      <Link to={lessonHref(lesson.id)} className="self-start text-sm text-primary underline-offset-4 hover:underline">
        Trang bài: kiểm tra bài, ghi chú, đánh dấu xong
      </Link>
    </>
  )
}

function FunStep({ plan }: { plan: SessionPlan }) {
  const lesson = plan.mode === 'lesson' ? plan.lesson?.lesson : undefined
  const foundation = plan.mode === 'foundation'
  const videos = foundation ? foundationFunVideos() : funStepVideos(lesson)
  const links = foundation ? FOUNDATION_FUN_LINKS : entertainmentLinks(lesson)
  const task = foundation
    ? "VOA Let's Learn English L1–L3: nghe người thật nói chậm, chưa cần hiểu hết. Bài 3 xem trên trang VOA."
    : entertainmentTask(lesson)
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>10' {foundation ? 'giải trí nhẹ' : 'giải trí'}</CardTitle>
        <CardDescription>
          {task ?? 'Chọn một nguồn bạn thích: nghe nhạc điền lời, xem tin chậm, hoặc nghe từ trong video thật.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Video phát ngay trong buổi; link ngoài vẫn ở dưới làm phương án phụ. */}
        <VideoList videos={videos} />
        <div className="flex flex-col gap-2">
          {videos.length > 0 && <h3 className="text-sm font-semibold">Hoặc chọn nguồn ngoài</h3>}
          <LinkList links={links} />
          <p className="text-xs text-muted-foreground">Link mở tab mới. Xong thì quay lại đây bấm "Xong buổi".</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Buổi 30' theo kế hoạch (`resolveSessionPlan`, story 21): lý thuyết luôn trước. Đang ở Sân ga: Lý thuyết 12' (viên gạch
 * chạy ngay trong buổi) → Ôn & từ mới 8' → Giải trí nhẹ 10'; sau Sân ga: Bài chính 15' → Ôn flashcard 5' → Giải trí 10'.
 * Kế hoạch và bước chốt trên URL (`?brick=F03&step=theory` / `?lesson=…&part=…&step=lesson`), nên mở trang khác rồi quay lại
 * vẫn đúng buổi. Rời buổi giữa chừng không ghi gì; chỉ "Xong buổi" mới ghi nhật ký.
 */
export function Session() {
  const { record } = useSessions()
  const { markSessionSeen } = useLessonParts()
  const { store } = useLoadedStore()
  const [params, setParams] = useSearchParams()
  const [finished, setFinished] = useState(false)
  const brickParam = params.get('brick')
  const lessonParam = params.get('lesson')
  const partParam = params.get('part')
  const stepParam = params.get('step')
  const { plan, stepIndex, search } = useMemo(
    () =>
      resolveSessionPlan({ brick: brickParam, lesson: lessonParam, part: partParam, step: stepParam }, store, hasBrickContent),
    [brickParam, lessonParam, partParam, stepParam, store],
  )
  const canonical = new URLSearchParams(search).toString()
  const brickId = plan.mode === 'foundation' ? plan.brickId : null

  // "Ôn lại" chốt theo viên lúc vào buổi: học xong viên cuối có nội dung giữa buổi không biến buổi thành buổi ôn.
  const [lock, setLock] = useState<TheoryLock | null>(null)
  const theory = lockTheory(lock, plan, store, hasBrickContent)
  if (theory && theory !== lock) setLock(theory)
  const review = theory?.review ?? false
  const followUp = useMemo(
    () => (plan.mode === 'foundation' ? followUpBrickId(store, brickId, hasBrickContent) : null),
    [plan.mode, store, brickId],
  )

  // Vào `/session` không tham số (hoặc tham số cũ / lạ) → `replace` về dạng chuẩn của kế hoạch.
  useEffect(() => {
    if (finished) return
    if (canonical !== params.toString()) setParams(new URLSearchParams(canonical), { replace: true })
  }, [canonical, params, setParams, finished])

  const steps = plan.steps
  const meta = steps[stepIndex]
  const nextStep = steps[stepIndex + 1]
  const Icon = STEP_ICONS[meta.id]

  function goTo(index: number) {
    setParams(sessionSearch(plan, index), { replace: true })
    window.scrollTo(0, 0)
  }

  function followUpTo(id: BrickId) {
    setParams({ brick: id, step: 'theory' }, { replace: true })
    window.scrollTo(0, 0)
  }

  function finish() {
    record('full', new Date(), { lessonId: sessionRecordLessonId(plan) })
    // Buổi học một phần của bài T1 (story 28): "Xong buổi" cũng tính phần đó là đã xem (đã có thì store không đổi).
    markSessionSeen(plan)
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

  const isFlashcards = meta.id === 'srs' || meta.id === 'review'

  return (
    <section className="flex flex-col gap-5">
      <BackToToday />
      <header className="flex items-center gap-3">
        <Icon className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">
          {meta.title} {meta.minutes}'
        </h1>
      </header>
      <Stepper steps={steps} step={stepIndex} />

      <StepClock
        key={`${meta.id}:${brickId ?? ''}`}
        minutes={meta.minutes}
        onExpiredHint={
          isFlashcards && nextStep ? (
            <p role="status" className="rounded-lg border border-primary/40 bg-accent/40 p-3 text-sm">
              Hết {meta.minutes}' rồi, sang {nextStep.title.toLowerCase()} nhé. Muốn ôn tiếp thẻ đang dở vẫn được.
            </p>
          ) : null
        }
      />

      {meta.id === 'theory' && (
        <TheoryStep brickId={brickId} review={review} note={theory?.note ?? null} followUp={followUp} onFollowUp={followUpTo} />
      )}
      {isFlashcards && (
        <FlashcardSession
          firstList={sessionWordList(plan)}
          renderDone={() => (
            <Card className="items-center text-center">
              <CardHeader className="w-full items-center">
                <PartyPopper className="mx-auto size-10 text-primary" aria-hidden="true" />
                <CardTitle>Phần ôn xong</CardTitle>
                <CardDescription>
                  Hết thẻ cho hôm nay.{nextStep ? ` Sang phần ${nextStep.title.toLowerCase()} thôi.` : ''}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        />
      )}
      {meta.id === 'lesson' && (
        <LessonStep current={plan.mode === 'lesson' ? plan.lesson : null} partId={plan.mode === 'lesson' ? plan.partId : null} />
      )}
      {meta.id === 'fun' && <FunStep plan={plan} />}

      <div className="flex gap-2">
        {stepIndex > 0 && (
          <Button variant="outline" onClick={() => goTo(stepIndex - 1)}>
            <ArrowLeft aria-hidden="true" />
            Quay lại
          </Button>
        )}
        {nextStep ? (
          <Button className="flex-1" onClick={() => goTo(stepIndex + 1)}>
            Tiếp: {nextStep.title}
            <ArrowRight aria-hidden="true" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={finish}>
            Xong buổi
          </Button>
        )}
      </div>

      {isFlashcards && <VocabAttribution />}
    </section>
  )
}
