import { useLayoutEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'

import { BottomNav } from '@/components/BottomNav'
import { SyncBadge } from '@/components/SyncBadge'
import { storageNotice } from '@/app/storage-notice'
import { useLoadedStore, usePlacement } from '@/app/store-context'

export function AppShell() {
  const notice = storageNotice(useLoadedStore())
  const { house } = usePlacement().placement

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
      {notice && (
        <p role="status" className="bg-accent px-4 py-2 text-center text-xs text-accent-foreground">
          {notice}
        </p>
      )}
      {/* Chỉ báo đồng bộ nằm trong luồng trang (không fixed) nên không che nội dung. */}
      <SyncBadge />
      <main
        className="mx-auto w-full max-w-md flex-1 px-4 pt-4"
        style={{ paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom) + 1.5rem)' }}
      >
        <Outlet />
      </main>
      <BottomNav />
      <ScrollRestoration />
    </div>
  )
}
