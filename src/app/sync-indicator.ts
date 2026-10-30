import type { OutdatedReason, SyncStatus } from '@/lib/sync'

export type SyncIndicator = {
  label: string
  /** Giải thích thêm trong Sheet. */
  detail: string
  tone: 'ok' | 'muted' | 'warn' | 'error'
}

/**
 * Chữ hiển thị cho chỉ báo đồng bộ; null khi không đồng bộ (chưa đăng nhập / không cấu hình).
 * `outdated` có hai thông báo: bản trên tài khoản mới hơn app, hoặc dữ liệu trên máy mới hơn app.
 */
export function syncIndicator(status: SyncStatus, outdatedReason: OutdatedReason | null = 'server'): SyncIndicator | null {
  switch (status) {
    case 'off':
      return null
    case 'idle':
      return { label: 'Đã đồng bộ', detail: 'Tiến độ đã lưu trên máy và trên tài khoản.', tone: 'ok' }
    case 'syncing':
      return { label: 'Đang đồng bộ', detail: 'Đang lấy và gửi tiến độ mới nhất.', tone: 'muted' }
    case 'pending':
      return {
        label: 'Chưa đồng bộ',
        detail: 'Tiến độ đã lưu trên máy này. Khi có mạng, app sẽ tự gửi lên tài khoản.',
        tone: 'warn',
      }
    case 'error':
      return {
        label: 'Lỗi đồng bộ',
        detail: 'Chưa gửi được lên tài khoản. Tiến độ vẫn lưu trên máy, bạn cứ học tiếp; app sẽ tự thử lại.',
        tone: 'error',
      }
    case 'outdated':
      if (outdatedReason === 'local') {
        return {
          label: 'Cần cập nhật app',
          detail:
            'Dữ liệu trên máy này do bản app mới hơn ghi. App tạm ngừng đồng bộ để không làm hỏng dữ liệu; hãy tải lại hoặc mở lại app để cập nhật.',
          tone: 'warn',
        }
      }
      return {
        label: 'Cần cập nhật app',
        detail:
          'Dữ liệu trên tài khoản do bản app mới hơn tạo. App không ghi đè để tránh mất dữ liệu; hãy tải lại hoặc mở lại app để cập nhật.',
        tone: 'warn',
      }
  }
}
