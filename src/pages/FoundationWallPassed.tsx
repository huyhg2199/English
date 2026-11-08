import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, BookOpenCheck, CalendarDays, Trophy, TrainFront } from 'lucide-react'
import { Link, Navigate } from 'react-router'

import { useFirstSyncReady, useFoundation, useLoadedStore, useSessions } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { BrickWall } from '@/components/foundation/BrickWall'
import { BoardingTile } from '@/components/trophies/MedalGrid'
import { OwlPost } from '@/components/trophies/OwlPost'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasBrickContent } from '@/data/foundation/content'
import { lessonHref } from '@/data/roadmap'
import { scheduleStartDate, wallRows } from '@/lib/foundation'
import { localDayKey } from '@/lib/sessions'
import { BOARDING_LETTER, BRICK_FIRST_DONE_POINTS, boardingMedal, storeHousePoints, type OwlLetter } from '@/lib/trophies'

/** "Lịch 12 tháng bắt đầu từ hôm nay" (qua tường hôm nay) hoặc "… từ ngày 9/11/2026" (mở lại sau, hay đã bỏ qua trước đó). */
function scheduleText(start: Date | null, now: Date): string {
  if (!start || localDayKey(start) === localDayKey(now)) return 'Lịch 12 tháng bắt đầu từ hôm nay.'
  return `Lịch 12 tháng bắt đầu từ ngày ${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()}.`
}

/**
 * Cú đưa thư "Huy chương Lên tàu Năm 1": chỉ mount sau lượt đồng bộ đầu (`useFirstSyncReady`), để máy thứ hai kịp kéo
 * mục `wall-passed` / `board-year-1` của máy kia về rồi mới quyết. Thư chốt lúc mount (ghi `board-year-1` làm `delivered`
 * thành true ngay, thư vẫn phải hiện); effect ghi 2 mục một lần (ref chặn).
 */
function BoardingLetter() {
  const { store } = useLoadedStore()
  const { wallCelebrationPending, markWallCelebrated } = useFoundation()
  const delivered = boardingMedal(store).delivered
  const [letters, setLetters] = useState<OwlLetter[]>(() => (delivered ? [] : [BOARDING_LETTER]))
  const marked = useRef(false)
  const closeLetters = useCallback(() => setLetters([]), [])

  useEffect(() => {
    if ((!wallCelebrationPending && delivered) || marked.current) return
    marked.current = true
    markWallCelebrated()
  }, [wallCelebrationPending, delivered, markWallCelebrated])

  return <OwlPost letters={letters} onClose={closeLetters} />
}

/**
 * `/foundation/qua-buc-tuong` (story 26): màn ăn mừng qua bức tường. Chưa qua tường (`completedAt` trống) → về bức tường.
 * Lần đầu mở (còn chờ ăn mừng, chưa đưa thư): cú đưa thư "Huy chương Lên tàu Năm 1" rồi ghi `wall-passed` +
 * `board-year-1` (một lần, đồng bộ). Mở lại vẫn xem được, không có cú bay. Không bao giờ hiện "lùi".
 */
export function FoundationWallPassed() {
  const { store } = useLoadedStore()
  const { state } = useFoundation()
  const { current } = useSessions()
  const [now] = useNow()
  const ready = useFirstSyncReady()
  const rows = useMemo(() => wallRows(state, hasBrickContent), [state])
  const boarding = useMemo(() => boardingMedal(store), [store])

  if (!boarding.earned) return <Navigate to="/foundation" replace />

  const bricks = storeHousePoints(store).brickCount
  const start = scheduleStartDate(store, now)

  return (
    <section className="flex flex-col gap-6">
      <Link
        to="/foundation"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Bức tường
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <TrainFront className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">Qua bức tường</h1>
        </div>
        <p className="text-sm break-words">
          Chúc mừng! Bạn đã xong cả 4 hàng của Sân ga 9¾ và chính thức lên tàu Năm 1. Các viên gạch vẫn mở để ôn bất cứ lúc
          nào.
        </p>
      </header>

      <BrickWall rows={rows} />

      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <h2>Huy chương</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-4">
          <ul className="grid grid-cols-1 gap-3">
            <BoardingTile boarding={boarding} />
          </ul>
          {bricks > 0 && (
            <p className="text-sm break-words">
              +{BRICK_FIRST_DONE_POINTS} điểm Nhà × {bricks} viên gạch = <strong>+{BRICK_FIRST_DONE_POINTS * bricks}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <h2>{scheduleText(start, now)}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-4 text-sm">
          {current ? (
            <p className="flex items-start gap-2 break-words">
              <BookOpenCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Bài tiếp theo:{' '}
                <Link to={lessonHref(current.lesson.id)} className="font-medium underline-offset-4 hover:underline">
                  {current.lesson.title}
                </Link>
              </span>
            </p>
          ) : (
            <p>Đã xong cả lộ trình.</p>
          )}
          <p className="text-muted-foreground">Từ giờ, buổi 30' là bài chính, ôn flashcard và giải trí.</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <Button asChild size="lg">
          <Link to="/">Về Hôm nay</Link>
        </Button>
        <Link to="/trophies" className="self-center text-sm text-primary underline-offset-4 hover:underline">
          Xem Phòng Cúp
        </Link>
      </div>

      {ready && <BoardingLetter />}
    </section>
  )
}
