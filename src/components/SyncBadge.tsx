import { useState } from 'react'
import { AlertTriangle, CloudCheck, CloudOff, LogOut, RefreshCw } from 'lucide-react'

import { syncIndicator, type SyncIndicator } from '@/app/sync-indicator'
import { useSync } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const TONE: Record<SyncIndicator['tone'], string> = {
  ok: 'text-muted-foreground',
  muted: 'text-muted-foreground',
  warn: 'text-accent-foreground',
  error: 'text-destructive',
}

function ToneIcon({ tone, spinning }: { tone: SyncIndicator['tone']; spinning: boolean }) {
  const cls = 'size-3.5'
  if (spinning) return <RefreshCw className={cn(cls, 'animate-spin')} aria-hidden="true" />
  if (tone === 'ok') return <CloudCheck className={cls} aria-hidden="true" />
  if (tone === 'error') return <AlertTriangle className={cls} aria-hidden="true" />
  return <CloudOff className={cls} aria-hidden="true" />
}

/** Chỉ báo đồng bộ nhỏ ở đầu trang; bấm mở Sheet có đồng bộ ngay và đăng xuất. */
export function SyncBadge() {
  const { enabled, auth, status, outdatedReason, syncNow, signOut } = useSync()
  const [open, setOpen] = useState(false)
  if (!enabled || auth.status !== 'signed-in') return null
  const indicator = syncIndicator(status, outdatedReason) ?? syncIndicator('pending')!

  return (
    <div className="mx-auto flex w-full max-w-md justify-end px-4 pt-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
              TONE[indicator.tone],
            )}
          >
            <ToneIcon tone={indicator.tone} spinning={status === 'syncing'} />
            {indicator.label}
          </button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>{indicator.label}</SheetTitle>
          <SheetDescription>{indicator.detail}</SheetDescription>
          <p className="text-sm">
            Tài khoản: <span className="font-medium">{auth.user.email ?? 'không rõ email'}</span>
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={() => void syncNow()} disabled={status === 'syncing'}>
              <RefreshCw aria-hidden="true" />
              Đồng bộ ngay
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                void signOut()
              }}
            >
              <LogOut aria-hidden="true" />
              Đăng xuất
            </Button>
            <p className="text-xs text-muted-foreground">
              Đăng xuất chỉ ngừng đồng bộ trên máy này; tiến độ đã lưu trên máy vẫn giữ nguyên.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
