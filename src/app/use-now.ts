import { useEffect, useState } from 'react'

/**
 * Giờ máy dùng để tính phiên ôn; làm mới mỗi `intervalMs` và khi app hiện lại (PWA mở qua đêm
 * vẫn sang quota từ mới / thẻ đến hạn của ngày mới). Trả về cả setter để cập nhật ngay sau khi chấm.
 */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => setNow(new Date())
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const timer = setInterval(refresh, intervalMs)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])
  return [now, setNow] as const
}
