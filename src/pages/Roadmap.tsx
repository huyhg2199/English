import { useMemo } from 'react'
import { Map } from 'lucide-react'
import { Link } from 'react-router'

import { useProgress } from '@/app/store-context'
import { StageMap } from '@/components/roadmap/StageMap'
import { Button } from '@/components/ui/button'
import { allLessons, getLesson, lessonHref, SCORE_ESTIMATE_NOTE, STAGES } from '@/data/roadmap'
import { computeRoadmapProgress } from '@/lib/roadmap-progress'

export function Roadmap() {
  const { completedLessonIds } = useProgress()
  const progress = useMemo(() => computeRoadmapProgress(allLessons(), completedLessonIds), [completedLessonIds])
  const next = progress.nextLessonId ? getLesson(progress.nextLessonId) : undefined

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Map className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Lộ trình</h1>
      </header>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Bản đồ 3 Năm học từ 0 tới TOEIC 750+. Đã qua {progress.completed.size}/{allLessons().length} trạm.
        </p>
        {next && (
          <Button asChild className="h-auto min-h-9 justify-start whitespace-normal text-left">
            <Link to={lessonHref(next.id)}>Học tiếp: {next.title}</Link>
          </Button>
        )}
      </div>

      {STAGES.map((stage) => (
        <StageMap key={stage.id} stage={stage} progress={progress} />
      ))}

      <p className="text-xs text-muted-foreground">* {SCORE_ESTIMATE_NOTE}</p>
    </section>
  )
}
