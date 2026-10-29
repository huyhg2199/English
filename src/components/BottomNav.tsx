import { NavLink } from 'react-router'

import { NAV_ITEMS } from '@/app/nav-items'
import { cn } from '@/lib/utils'

export function BottomNav() {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul
        className="mx-auto grid max-w-md grid-cols-5"
        style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
      >
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <li key={path} className="min-w-0">
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex h-[var(--nav-height)] flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none transition-colors',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center justify-center rounded-full transition-all',
                      isActive && 'bg-accent shadow-[0_0_16px_var(--candle-glow)]',
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" strokeWidth={isActive ? 2.25 : 1.75} />
                  </span>
                  <span className={cn('truncate', isActive && 'font-semibold')}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
