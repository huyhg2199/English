// mobile-guard: desktop-only — cả file chỉ hiện từ 1024px (`hidden lg:flex`), dưới 1024px không có trong bố cục.
import { BookOpen } from 'lucide-react'

import { SplitRail } from '@/components/SplitLayout'
import type { Brick } from '@/data/foundation'
import { passedTheoryScreens } from '@/lib/foundation'

import { BrickScreen } from './BrickScreen'
import { SCREEN_TITLES } from './screen-titles'

/**
 * Cột trái "Lý thuyết của viên" (story 30, máy tính): mục tiêu của viên và các màn lý thuyết đã qua (giải thích, so sánh,
 * ví dụ mẫu đứng trước màn đang hiện), để tra lại khi luyện mà không phải quay lại màn trước. Màn đang hiện nằm ở cột phải
 * nên không bao giờ lặp lại ở đây.
 */
export function BrickTheoryRail({ brick, index, seed }: { brick: Brick; index: number; seed: string }) {
  const passed = passedTheoryScreens(brick.screens, index)
  return (
    <SplitRail className="hidden lg:flex lg:flex-col lg:gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
        <BookOpen className="size-4" aria-hidden="true" />
        Lý thuyết của viên
      </h2>
      <p className="rounded-lg border border-primary/40 bg-accent/30 p-3 text-sm break-words">
        <span className="font-semibold">Mục tiêu: </span>
        {brick.goalVi}
      </p>
      {passed.length === 0 ? (
        <p className="text-sm text-muted-foreground">Màn lý thuyết bạn đã xem sẽ nằm ở đây để tra lại khi luyện.</p>
      ) : (
        passed.map((screen, i) => (
          <article
            key={`${i}-${screen.kind}`}
            className="flex flex-col gap-2 rounded-xl border bg-card p-3 text-card-foreground"
          >
            <h3 className="text-sm leading-tight font-semibold">{SCREEN_TITLES[screen.kind]}</h3>
            <BrickScreen brick={brick} screen={screen} seed={seed} />
          </article>
        ))
      )}
    </SplitRail>
  )
}
