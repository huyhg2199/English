import { useEffect } from 'react'
import { ArrowLeft, BookOpenCheck, Check, Link2, MapPinOff } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'

import { useProgress } from '@/app/store-context'
import { SKILL_LABELS } from '@/components/roadmap/skill-labels'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resolveLessonRoute, resourcesForSection, sectionHref } from '@/data/roadmap'
import { cn } from '@/lib/utils'

function BackLink() {
  return (
    <Link
      to="/roadmap"
      className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Lộ trình
    </Link>
  )
}

/** Trang chi tiết bài: liệt kê việc cần làm và nguồn của từng đoạn. */
export function Lesson() {
  const { lessonId, sectionId } = useParams()
  const { entry, targetSectionId: target } = resolveLessonRoute(lessonId, sectionId)
  const { completedLessonIds, setCompleted } = useProgress()
  const { key: locationKey } = useLocation()

  // Có đoạn hợp lệ thì cuộn tới đó, không thì về đầu trang (kể cả khi reload).
  // Phụ thuộc location.key để mỗi lần điều hướng (kể cả tới đúng đoạn đang mở) đều cuộn.
  // Chạy trong rAF nên thắng <ScrollRestoration /> (layout effect) ở AppShell.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const el = target ? document.getElementById(target) : null
      if (el) el.scrollIntoView({ block: 'start' })
      else window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [lessonId, target, locationKey])

  if (!entry) {
    return (
      <section className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <MapPinOff className="size-7 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">Không tìm thấy bài</h1>
        </header>
        <Card>
          <CardHeader>
            <CardDescription>Bài này không có trong lộ trình. Có thể link đã cũ hoặc bị gõ sai.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/roadmap">Về Lộ trình</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  const { lesson, month, stage } = entry
  const done = completedLessonIds.includes(lesson.id)

  return (
    <section className="flex flex-col gap-6">
      <BackLink />
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <BookOpenCheck
            className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-semibold tracking-wide break-words">{lesson.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {stage.yearLabel} · Chặng {stage.number} {stage.name} · {month.label} ({month.period}) · Tuần{' '}
          {lesson.week}
        </p>
        {done && (
          <p className="inline-flex items-center gap-1 self-start rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-[0_0_12px_var(--candle-glow)]">
            <Check className="size-3.5" aria-hidden="true" />
            Đã học xong
          </p>
        )}
      </header>

      {lesson.sections.map((section) => {
        const highlighted = section.id === target
        const resources = resourcesForSection(stage, section)
        return (
          <Card
            key={section.id}
            id={section.id}
            className={cn(
              'scroll-mt-4 gap-4 transition-shadow',
              highlighted && 'border-primary shadow-[0_0_24px_var(--candle-glow)] ring-2 ring-primary/50',
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <h2>{section.title}</h2>
                <Link
                  to={sectionHref(lesson.id, section.id)}
                  aria-label={`Link tới đoạn ${section.title}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Link2 className="size-4" aria-hidden="true" />
                </Link>
              </CardTitle>
              <ul className="flex flex-wrap gap-1.5" aria-label="Kỹ năng">
                {section.tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {SKILL_LABELS[tag]}
                  </li>
                ))}
              </ul>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p className="text-base">{section.task}</p>

              {section.id === 'checkpoint' && (
                <div className="rounded-lg border border-primary/40 bg-accent/40 p-3">
                  <p className="mb-1 font-semibold text-accent-foreground">
                    {stage.checkpoint.name}
                    {lesson.checkpointAttempt && stage.checkpoint.attempts > 1
                      ? ` · lần ${lesson.checkpointAttempt}/${stage.checkpoint.attempts}`
                      : ''}
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {stage.checkpoint.scope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-2">{stage.checkpoint.passThreshold}</p>
                  <p className="mt-1 text-muted-foreground">{stage.checkpoint.ifNotPassed}</p>
                </div>
              )}

              {resources.length > 0 && (
                <div>
                  <h3 className="mb-1 font-semibold">Nguồn miễn phí</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    {resources.map((r) => (
                      <li key={r.area} className="break-words">
                        <span className="text-foreground">{r.area}:</span> {r.items}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex flex-col gap-2">
        <Button
          variant={done ? 'outline' : 'default'}
          onClick={() => setCompleted(lesson.id, !done)}
          aria-pressed={done}
        >
          {done ? 'Bỏ đánh dấu' : 'Đánh dấu đã học xong'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Nút tạm: sau này buổi học sẽ tự ghi tiến độ khi bạn học xong.
        </p>
      </div>
    </section>
  )
}
