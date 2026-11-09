import { useLayoutEffect } from 'react'
import { Outlet, ScrollRestoration, useMatches } from 'react-router'

import { BottomNav } from '@/components/BottomNav'
import { SyncBadge } from '@/components/SyncBadge'
import { TopBar } from '@/components/TopBar'
import { OwlPost } from '@/components/trophies/OwlPost'
import { LAYOUT_CLASS, layoutFor } from '@/app/route-handle'
import { storageNotice } from '@/app/storage-notice'
import { useLoadedStore, useOwlPost, usePlacement } from '@/app/store-context'
import { cn } from '@/lib/utils'

export function AppShell() {
  const notice = storageNotice(useLoadedStore())
  const { house } = usePlacement().placement
  // Cú đưa thư: khi mở app (sau lượt đồng bộ đầu) và mỗi lần app hiện lại (story 12).
  const owl = useOwlPost()
  // Độ rộng cột từ 1024px theo `handle.layout` của route (story 29); dưới 1024px luôn max-w-md.
  const layout = layoutFor(useMatches())

  // Màu nhấn theo Nhà: biến CSS dưới `html[data-house]` (index.css).
  // Layout effect: đặt trước khi trình duyệt vẽ để không nháy màu mặc định.
  useLayoutEffect(() => {
    const root = document.documentElement
    if (house) root.dataset.house = house
    else delete root.dataset.house
  }, [house])

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Thanh trên cùng chỉ hiện từ 1024px; dưới đó là BottomNav. */}
      <TopBar />
      {notice && (
        <p role="status" className="bg-accent px-4 py-2 text-center text-xs text-accent-foreground">
          {notice}
        </p>
      )}
      {/* Chỉ báo đồng bộ nằm trong luồng trang (không fixed) nên không che nội dung. */}
      <SyncBadge />
      <main
        className={cn('mx-auto w-full max-w-md flex-1 px-4 pt-4', LAYOUT_CLASS[layout])}
        style={{ paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom) + 1.5rem)' }}
      >
        <Outlet />
      </main>
      <OwlPost letters={owl.letters} onClose={owl.dismiss} />
      <BottomNav />
      <ScrollRestoration />
    </div>
  )
}
