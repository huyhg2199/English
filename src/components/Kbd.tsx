// mobile-guard: desktop-only — gợi ý phím chỉ hiện với chuột/trackpad (`pointer-fine:`), màn cảm ứng không thấy (`hidden`).
import type { ReactNode } from 'react'

/**
 * Gợi ý phím tắt (story 31), vd `<Kbd>Enter</Kbd>`. Ẩn với trình đọc màn hình (nút đã có `aria-keyshortcuts`) và ẩn trên
 * màn cảm ứng (`pointer: coarse`), nên iPhone / iPad không đổi gì.
 */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      aria-hidden="true"
      className="mx-1 hidden h-5 min-w-5 shrink-0 items-center justify-center rounded border border-current/30 px-1 font-mono text-[11px] leading-none font-normal opacity-70 pointer-fine:inline-flex"
    >
      {children}
    </kbd>
  )
}
