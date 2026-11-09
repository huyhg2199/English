/**
 * `handle` của route dưới AppShell (story 29). `layout` chọn độ rộng cột `main` từ 1024px:
 * `default` = 768px, `wide` = 1024px cho trang có bố cục hai cột (story 30–31). Dưới 1024px cột luôn 448px.
 */
export type PageLayout = 'default' | 'wide'

export type RouteHandle = { layout?: PageLayout }

/** Chuỗi class đầy đủ (không ghép) để Tailwind quét được. Chỉ có tiền tố `lg:` nên 375px không đổi. */
export const LAYOUT_CLASS: Record<PageLayout, string> = {
  default: 'lg:max-w-3xl',
  wide: 'lg:max-w-5xl',
}

function isPageLayout(value: unknown): value is PageLayout {
  return value === 'default' || value === 'wide'
}

/** Bố cục của trang đang mở: match sau cùng có `handle.layout` hợp lệ thắng; không có thì `default`. */
export function layoutFor(matches: readonly { handle?: unknown }[]): PageLayout {
  let layout: PageLayout = 'default'
  for (const match of matches) {
    const handle = match.handle
    if (handle && typeof handle === 'object' && 'layout' in handle && isPageLayout(handle.layout))
      layout = handle.layout
  }
  return layout
}
