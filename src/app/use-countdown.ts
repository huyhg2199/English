import { useState } from 'react'

import { useNow } from '@/app/use-now'
import { remainingSeconds } from '@/lib/sessions'

/**
 * Đồng hồ đếm ngược gợi ý (không ép): bắt đầu khi component mount (đổi `key` để bắt đầu lại).
 * Trả về số giây còn lại và đã hết giờ chưa.
 */
export function useCountdown(minutes: number) {
  const [startedAt] = useState(() => new Date())
  const [now] = useNow(1000)
  const remaining = remainingSeconds(startedAt, minutes, now)
  return { remaining, expired: remaining === 0 }
}
