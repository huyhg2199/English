import { useMemo } from 'react'
import { Map } from 'lucide-react'
import { Link } from 'react-router'

import { useLoadedStore, useProgress, useSchedule } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { ScheduleLine } from '@/components/ScheduleCard'
import { FoundationBand } from '@/components/roadmap/FoundationBand'
import { StageMap } from '@/components/roadmap/StageMap'
import { stationState } from '@/components/roadmap/station-state'
import { Button } from '@/components/ui/button'
import { allLessons, getLesson, lessonHref, SCORE_ESTIMATE_NOTE, STAGES } from '@/data/roadmap'
import { roadmapCheckLabel } from '@/lib/quiz'
import { computeRoadmapProgress } from '@/lib/roadmap-progress'

/** Lộ trình: 3 Năm học, mỗi trạm có trạng thái và (story 41) nhãn kiểm tra bài "đạt x%" / "chưa kiểm tra". */
export function Roadmap() {
  const { store } = useLoadedStore()
  const { completedLessonIds, startLessonId } = useProgress()
  const progress = useMemo(
    () => computeRoadmapProgress(allLessons(), completedLessonIds, startLessonId),
    [completedLessonIds, startLessonId],
  )
  const checks = useMemo(
    // `globalThis.Map`: tên `Map` ở file này là icon của lucide.
    () =>
      new globalThis.Map(
        allLessons().map((l) => [l.id, roadmapCheckLabel(store, l.id, stationState(l.id, progress))] as const),
      ),
    [store, progress],
  )
  const [now] = useNow()
  const plan = useSchedule(now)
  const next = progress.nextLessonId ? getLesson(progress.nextLessonId) : undefined

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Map className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Lộ trình</h1>
      </header>

      <div className="flex flex-col gap-3">
        <ScheduleLine plan={plan} />
        <p className="text-sm text-muted-foreground">
          Bản đồ 3 Năm học từ 0 tới TOEIC 750+. Đã qua {progress.completed.size}/{allLessons().length} trạm.
        </p>
        {progress.skipped.size > 0 && (
          <p className="text-xs text-muted-foreground">
            Mũ Phân Loại xếp bạn bắt đầu muộn hơn: {progress.skipped.size} trạm mờ là "đã bỏ qua", vẫn mở ra học được bất cứ lúc nào.
          </p>
        )}
        {next && (
          <Button asChild className="h-auto min-h-9 justify-start whitespace-normal text-left">
            <Link to={lessonHref(next.id)}>Học tiếp: {next.title}</Link>
          </Button>
        )}
      </div>

      <FoundationBand />

      {STAGES.map((stage) => (
        <StageMap key={stage.id} stage={stage} progress={progress} checks={checks} />
      ))}

      <p className="text-xs text-muted-foreground">* {SCORE_ESTIMATE_NOTE}</p>
    </section>
  )
}
