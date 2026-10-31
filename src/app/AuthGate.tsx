import type { ReactNode } from 'react'

import { gateView } from '@/app/gate-view'
import { useSync } from '@/app/store-context'
import { SignIn } from '@/pages/SignIn'

/**
 * Bắt buộc đăng nhập: chưa có phiên thì chỉ hiện màn đăng nhập (không bottom nav).
 * Thiếu biến Supabase thì bỏ qua (app chạy chỉ local như story 2).
 * Đã có phiên lưu trên máy thì vào app ngay, kể cả offline. Logic chọn màn nằm ở `gateView`.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const view = gateView(useSync())
  if (view === 'app') return <>{children}</>
  if (view === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground" role="status">
        Đang mở…
      </div>
    )
  }
  return <SignIn />
}
