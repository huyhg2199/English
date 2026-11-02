import { useMemo } from 'react'
import { BookOpenCheck, Check, Coffee, Flame, Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { useComeback, usePlacement, useSchedule, useSessions, useSkillBoard } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { ComebackCard } from '@/components/ComebackCard'
import { ScheduleCard } from '@/components/ScheduleCard'
import { SkillGapCard } from '@/components/SkillGapCard'
import { StudyClock } from '@/components/StudyClock'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { lessonHref } from '@/data/roadmap'
import { studyHours } from '@/lib/placement'
import { computeStreak, isSessionDay, localDayKey } from '@/lib/sessions'

/** Mời đội Mũ Phân Loại khi chưa làm. */
function SortingHatInvite() {
  return (
    <Card className="gap-3 border-primary/50">
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
        <Sparkles className="row-span-2 size-9 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
        <CardTitle className="text-lg">
          <h2>Đội Mũ Phân Loại</h2>
        </CardTitle>
        <CardDescription>Nhập điểm đề mẫu để xếp đúng bài, chọn Nhà và có bảng kỹ năng.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full">
          <Link to="/sorting-hat">Đội Mũ</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Trang Hôm nay: 1 nút lớn vào buổi 30', nút phụ ngày lười 10', bài hiện tại, streak, ngày dự kiến đạt 750,
 * thẻ "Chào mừng quay lại" sau nghỉ > 7 ngày, Mũ Phân Loại / bảng kỹ năng.
 */
export function Today() {
  const { days, current } = useSessions()
  const { done: placed } = usePlacement()
  const { board, weakest } = useSkillBoard()
  const [now] = useNow()
  const plan = useSchedule(now)
  const comeback = useComeback(now)
  const streak = useMemo(() => computeStreak(days, now), [days, now])
  const hours = useMemo(() => studyHours(days, now), [days, now])
  const todayEntry = days[localDayKey(now)]
  const today = isSessionDay(todayEntry) ? todayEntry : null

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Flame className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Hôm nay</h1>
      </header>

      {comeback.pending && comeback.questionCount > 0 && (
        <ComebackCard pending={comeback.pending} questionCount={comeback.questionCount} onSkip={comeback.skip} />
      )}

      <Card className="gap-3">
        <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
          <Flame
            className="row-span-2 size-10 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]"
            aria-hidden="true"
          />
          <CardTitle className="text-xl" aria-live="polite">
            Streak {streak} ngày
          </CardTitle>
          <CardDescription>
            {today
              ? 'Đã giữ lửa hôm nay.'
              : streak > 0
                ? 'Học một buổi (chuẩn hay lười đều được) để nối dài chuỗi.'
                : 'Bắt đầu chuỗi ngày học từ hôm nay.'}
          </CardDescription>
        </CardHeader>
        {today && (
          <CardContent>
            <p
              role="status"
              className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-[0_0_12px_var(--candle-glow)]"
            >
              <Check className="size-3.5" aria-hidden="true" />
              Đã học hôm nay · {today.kind === 'full' ? "buổi 30'" : "buổi lười 10'"}
            </p>
          </CardContent>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="h-16 text-lg shadow-[0_0_24px_var(--candle-glow)]">
          <Link to={current ? `/session?lesson=${encodeURIComponent(current.lesson.id)}` : '/session'}>
            <Play className="size-6" aria-hidden="true" />
            Bắt đầu buổi 30'
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/session/lazy">
            <Coffee aria-hidden="true" />
            Hôm nay lười (10')
          </Link>
        </Button>
        {today && <p className="text-center text-xs text-muted-foreground">Muốn học thêm thì cứ bắt đầu lại.</p>}
      </div>

      <Card className="gap-3">
        <CardHeader>
          <CardDescription>Bài hiện tại</CardDescription>
          {current ? (
            <CardTitle className="flex items-start gap-2 text-lg">
              <BookOpenCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <Link to={lessonHref(current.lesson.id)} className="break-words underline-offset-4 hover:underline">
                {current.lesson.title}
              </Link>
            </CardTitle>
          ) : (
            <CardTitle className="text-lg">Đã xong cả lộ trình</CardTitle>
          )}
          {current && (
            <p className="text-sm text-muted-foreground">
              Chặng {current.stage.number} {current.stage.name} · Tuần {current.lesson.week}
            </p>
          )}
        </CardHeader>
      </Card>

      <ScheduleCard plan={plan} />

      {placed ? (
        <>
          <SkillGapCard board={board} weakest={weakest} />
          <StudyClock hours={hours} />
        </>
      ) : (
        <SortingHatInvite />
      )}
    </section>
  )
}
