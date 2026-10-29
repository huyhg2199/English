import { BookOpen, Flame, Map, Trophy, WandSparkles, type LucideIcon } from 'lucide-react'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
}

/** Đúng 5 mục, đúng thứ tự theo Constraints của SPEC. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Hôm nay', icon: Flame },
  { path: '/roadmap', label: 'Lộ trình', icon: Map },
  { path: '/practice', label: 'Luyện tập', icon: WandSparkles },
  { path: '/notebook', label: 'Sổ tay', icon: BookOpen },
  { path: '/trophies', label: 'Phòng Cúp', icon: Trophy },
]
