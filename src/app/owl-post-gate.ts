import type { SyncSnapshot } from '@/lib/sync'

/** Quá mốc này (tính từ lúc mở app) thì cú đưa thư vẫn kiểm tra dù đồng bộ chưa xong (mạng chậm). */
export const OWL_POST_DEADLINE_MS = 8000

/**
 * Cú đưa thư được kiểm tra huy chương mới chưa: chờ lượt đồng bộ đầu tiên xong (để `trophies.seen` từ máy khác
 * kịp kéo về) — trừ khi không đồng bộ (không cấu hình / chưa đăng nhập) hoặc đã quá `OWL_POST_DEADLINE_MS`.
 * - Đang xác thực (`loading`) hoặc đã đăng nhập nhưng engine chưa chạy (`off`) / đang chạy (`syncing`): chờ.
 * - `idle` / `error` / `outdated` / `pending` (offline hoặc còn thay đổi chờ đẩy): lượt đầu đã xong hoặc không chạy được.
 */
export function owlPostReady(sync: Pick<SyncSnapshot, 'enabled' | 'auth' | 'status'>, deadlinePassed: boolean): boolean {
  if (deadlinePassed) return true
  if (!sync.enabled || sync.auth.status === 'disabled' || sync.auth.status === 'signed-out') return true
  if (sync.auth.status === 'loading') return false
  return sync.status === 'idle' || sync.status === 'error' || sync.status === 'outdated' || sync.status === 'pending'
}
