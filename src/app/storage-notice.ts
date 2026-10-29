import type { LoadedStore } from '@/lib/storage'

/** Thông báo về tình trạng lưu dữ liệu; null khi lưu bình thường. */
export function storageNotice({ mode, status }: Pick<LoadedStore, 'mode' | 'status'>): string | null {
  if (mode === 'persistent') return null
  if (mode === 'read-only' || status === 'newer-version') {
    return 'Dữ liệu do bản app mới hơn tạo. Đang chạy chỉ đọc để không ghi đè.'
  }
  if (status === 'corrupt' || status === 'migration-failed') {
    return 'Không đọc được dữ liệu đã lưu. Dữ liệu cũ vẫn được giữ nguyên, không bị ghi đè; phiên này chạy tạm và không lưu.'
  }
  return 'Không lưu được dữ liệu trên máy này, tiến độ chỉ giữ tới khi đóng app.'
}
