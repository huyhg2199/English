import { Outlet, ScrollRestoration } from 'react-router'

import { BottomNav } from '@/components/BottomNav'
import { storageNotice } from '@/app/storage-notice'
import { useLoadedStore } from '@/app/store-context'

export function AppShell() {
  const notice = storageNotice(useLoadedStore())

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
      <main
        className="mx-auto w-full max-w-md flex-1 px-4 pt-6"
        style={{ paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom) + 1.5rem)' }}
      >
        <Outlet />
      </main>
      <BottomNav />
      <ScrollRestoration />
    </div>
  )
}
