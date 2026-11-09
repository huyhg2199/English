import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { SPLIT_COLS, SPLIT_MAIN, SPLIT_RAIL, type SplitCols } from '@/lib/split-layout'

type Props = { className?: string; children?: ReactNode }

/**
 * Lưới hai cột từ 1024px (story 30). Chỉ thêm class `lg:`; dưới 1024px nơi gọi truyền `className` trùng `flex flex-col
 * gap-*` của phần tử cha, nên wrapper không đổi khoảng cách hay thứ tự các con.
 */
export function SplitLayout({ cols, className, children }: Props & { cols: SplitCols }) {
  return <div className={cn(className, SPLIT_COLS[cols])}>{children}</div>
}

/** Cột nội dung chính. */
export function SplitMain({ className, children }: Props) {
  return <div className={cn(className, SPLIT_MAIN)}>{children}</div>
}

/** Cột phụ dính dưới TopBar, tự cuộn khi cao hơn màn hình; `data-split-rail` để `layout:check` đo. */
export function SplitRail({ className, children }: Props) {
  return (
    <div data-split-rail="" className={cn(className, SPLIT_RAIL)}>
      {children}
    </div>
  )
}
