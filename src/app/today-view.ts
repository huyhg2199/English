import type { BrickId, RowId } from '@/data/foundation'
import { foundationState, isInFoundation, readFoundation } from '@/lib/foundation'
import { nextPlacementRow, PLACEMENT_HREF, placementStarted } from '@/lib/foundation/row-test'
import { hasPlacement, readPlacement } from '@/lib/placement'
import { sessionPlan } from '@/lib/sessions'
import type { Store } from '@/lib/storage'

/**
 * Quyết định thẻ nào hiện trên Hôm nay, Thư nhập học và nút đi tiếp của Mũ Phân Loại (story 22, CAP-2 + CAP-3 + CAP-23).
 * Hàm thuần: "đang ở Sân ga", viên của buổi và `taughtCount` lấy từ `@/lib/foundation` và `sessionPlan`; danh sách viên
 * có nội dung truyền vào qua `hasContent` (thường là `hasBrickContent`).
 */

type HasContent = (id: BrickId) => boolean

/** Thẻ chính khi đang ở Sân ga: "Sân ga 9¾ — x/18 viên gạch", viên của buổi 30', link Soát vé khi còn hàng cần soát. */
export type FoundationHeroView = {
  taughtCount: number
  totalBricks: number
  /** Viên mà buổi 30' sẽ chạy (`sessionPlan`); null khi chưa có viên nào có nội dung ("đang soạn"). */
  brickId: BrickId | null
  /** Buổi sẽ ôn lại viên này ("Ôn lại: Fxx · …"). */
  review: boolean
  /** `PLACEMENT_HREF` khi Soát vé còn `pending` và còn hàng cần soát; không thì null. */
  placementHref: string | null
  /** Soát vé đã đi qua ít nhất một hàng (`placementStarted`) → hàng tiếp theo, link đổi thành "Tiếp tục Soát vé · hàng X"; không thì null. */
  placementContinueRow: RowId | null
}

export type TodayView =
  | {
      mode: 'foundation'
      hero: FoundationHeroView
      /** Chưa có Nhà → lời mời Mũ Phân Loại (4 câu). */
      showSortingHat: boolean
      /** Đã có điểm ETS → đồng hồ giờ học (như trước). */
      showStudyClock: boolean
    }
  | {
      mode: 'roadmap'
      showSortingHat: boolean
      /** Chưa có điểm ETS → thẻ "Đo trình độ (tuỳ chọn)". */
      showMeasureInvite: boolean
      showSkillGap: boolean
      showStudyClock: boolean
    }

/**
 * Bố cục Hôm nay. Đang ở Sân ga (`isInFoundation`) → một thẻ Sân ga; ẩn Bài hiện tại, lịch 750, Đo trình độ và bảng kỹ
 * năng. Sau Sân ga → bố cục cũ; cuối trang: lời mời Mũ (chưa Nhà), bảng kỹ năng + đồng hồ (có điểm ETS) hoặc Đo trình độ.
 */
export function todayView(store: Store, hasContent: HasContent): TodayView {
  const showSortingHat = readPlacement(store).house === null
  const measured = hasPlacement(store)
  if (isInFoundation(store)) {
    const state = foundationState(store)
    const plan = sessionPlan(store, hasContent)
    const brick = plan.mode === 'foundation' ? { brickId: plan.brickId, review: plan.review } : { brickId: null, review: false }
    const placementRow = nextPlacementRow(store)
    return {
      mode: 'foundation',
      hero: {
        taughtCount: state.taughtCount,
        totalBricks: state.totalBricks,
        ...brick,
        placementHref: placementRow !== null ? PLACEMENT_HREF : null,
        placementContinueRow: placementRow !== null && placementStarted(store) ? placementRow : null,
      },
      showSortingHat,
      showStudyClock: measured,
    }
  }
  return {
    mode: 'roadmap',
    showSortingHat,
    showMeasureInvite: !measured,
    showSkillGap: measured,
    showStudyClock: measured,
  }
}

/**
 * Hiện Thư nhập học: chưa xem (`welcomeSeenAt` null) và lượt đồng bộ đầu đã xong (`ready`, xem `owlPostReady` + hạn
 * 8 s), để máy thứ hai kịp kéo `welcomeSeenAt` của máy đã xem về rồi mới quyết.
 */
export function shouldShowWelcome(store: Store, ready: boolean): boolean {
  return ready && readFoundation(store).welcomeSeenAt === null
}

export type NextAction = { label: string; to: string }

const TO_FOUNDATION: NextAction = { label: 'Vào Sân ga 9¾', to: '/foundation' }
const TO_TODAY: NextAction = { label: 'Về Hôm nay', to: '/' }

/** Nút ở màn cuối của thư: chưa có Nhà → Mũ (4 câu); có Nhà và đang ở Sân ga → Sân ga; còn lại → Hôm nay. */
export function welcomeFinalAction(store: Store): NextAction {
  if (readPlacement(store).house === null) return { label: 'Đội Mũ Phân Loại (4 câu)', to: '/sorting-hat' }
  return isInFoundation(store) ? TO_FOUNDATION : TO_TODAY
}

/** Nút đi tiếp sau khi Mũ chọn Nhà: đang ở Sân ga → "Vào Sân ga 9¾"; không thì "Về Hôm nay". */
export function sortingHatNextAction(store: Store): NextAction {
  return isInFoundation(store) ? TO_FOUNDATION : TO_TODAY
}

/** Link "Đo trình độ (tuỳ chọn)" trên trang Mũ: chỉ khi không ở Sân ga hoặc đã có điểm ETS. */
export function showMeasureLink(store: Store): boolean {
  return !isInFoundation(store) || hasPlacement(store)
}
