// mobile-guard: desktop-only — cả thanh ẩn dưới 1024px (`hidden lg:block`), nên class không tiền tố ở đây không chạm 375px.
import { Link, useLocation } from 'react-router'

import { isNavItemActive, NAV_ITEMS } from '@/app/nav-items'
import { SyncBadge } from '@/components/SyncBadge'
import { cn } from '@/lib/utils'

/**
 * Thanh điều hướng trên cùng cho máy tính (story 29): từ 1024px thay bottom nav, cùng 5 mục, cùng thứ tự.
 * Trái: chữ "Lumos" về Hôm nay. Giữa: 5 mục. Phải: chỉ báo đồng bộ (chỉ khi đã đăng nhập).
 */
export function TopBar() {
  const { pathname } = useLocation()
  return (
    <header className="sticky top-0 z-40 hidden h-[var(--topbar-height)] border-b bg-card/95 backdrop-blur lg:block supports-[backdrop-filter]:bg-card/80">
      <div
        className="mx-auto grid h-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-4"
        style={{
          paddingLeft: 'calc(1.5rem + env(safe-area-inset-left))',
          paddingRight: 'calc(1.5rem + env(safe-area-inset-right))',
        }}
      >
        <Link
          to="/"
          className="justify-self-start rounded-md px-2 py-1 text-xl font-semibold tracking-wide text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          Lumos
        </Link>
        <nav aria-label="Điều hướng chính">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const { path, label, icon: Icon } = item
              const isActive = isNavItemActive(item, pathname)
              return (
                <li key={path}>
                  <Link
                    to={path}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-2 rounded-full px-3.5 text-sm whitespace-nowrap transition-all pointer-coarse:h-11',
                      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                      isActive
                        ? 'bg-accent font-semibold text-primary shadow-[0_0_16px_var(--candle-glow)]'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden="true" strokeWidth={isActive ? 2.25 : 1.75} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex min-w-0 justify-end">
          <SyncBadge variant="inline" />
        </div>
      </div>
    </header>
  )
}
