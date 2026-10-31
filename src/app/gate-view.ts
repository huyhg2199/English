import type { SyncSnapshot } from '@/lib/sync'

export type GateView = 'app' | 'loading' | 'sign-in'

/**
 * Màn nào hiện ở cổng đăng nhập (bắt buộc đăng nhập):
 * - thiếu biến Supabase (`disabled`) → vào app luôn, chạy chỉ local như story 2;
 * - đã có phiên (kể cả phiên lưu trên máy khi offline) → vào app;
 * - đang kiểm tra phiên (máy chưa lưu phiên nào) → màn chờ;
 * - chưa đăng nhập → chỉ màn đăng nhập (không bottom nav).
 */
export function gateView(snapshot: Pick<SyncSnapshot, 'enabled' | 'auth'>): GateView {
  if (!snapshot.enabled) return 'app'
  switch (snapshot.auth.status) {
    case 'disabled':
    case 'signed-in':
      return 'app'
    case 'loading':
      return 'loading'
    case 'signed-out':
      return 'sign-in'
  }
}
