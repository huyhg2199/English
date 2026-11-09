import { Trophy } from 'lucide-react'

import { useTrophies } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { HousePointsCard } from '@/components/trophies/HousePointsCard'
import { MedalGrid } from '@/components/trophies/MedalGrid'

/** Phòng Cúp: điểm Nhà, chuỗi hiện tại / dài nhất và lưới huy chương (story 12), kèm ô Lên tàu Năm 1 (story 26). */
export function TrophyRoom() {
  const [now] = useNow()
  const { house, points, streak, longest, medals, boarding } = useTrophies(now)
  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Trophy className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Phòng Cúp</h1>
      </header>
      <HousePointsCard house={house} points={points} streak={streak} longest={longest} />
      <MedalGrid medals={medals} boarding={boarding} />
    </section>
  )
}
