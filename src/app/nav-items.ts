import { BookOpen, Flame, Map, Trophy, WandSparkles, type LucideIcon } from 'lucide-react'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  /** Route con nằm ngoài `path` nhưng vẫn làm tab này sáng (vd buổi học dưới tab Hôm nay). */
  alsoActiveFor?: readonly string[]
}

/** Đúng 5 mục, đúng thứ tự theo Constraints của SPEC. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Hôm nay', icon: Flame, alsoActiveFor: ['/session', '/sorting-hat'] },
  { path: '/roadmap', label: 'Lộ trình', icon: Map },
  { path: '/practice', label: 'Luyện tập', icon: WandSparkles, alsoActiveFor: ['/backup', '/owl-post'] },
  { path: '/notebook', label: 'Sổ tay', icon: BookOpen },
  { path: '/trophies', label: 'Phòng Cúp', icon: Trophy },
]

function underPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`)
}

/** Tab có sáng ở `pathname` không: `/` chỉ khớp đúng `/` (và `alsoActiveFor`); tab khác khớp cả route con. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const own = item.path === '/' ? pathname === '/' : underPath(pathname, item.path)
  return own || (item.alsoActiveFor ?? []).some((base) => underPath(pathname, base))
}
