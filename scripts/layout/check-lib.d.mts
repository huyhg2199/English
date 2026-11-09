// Khai báo kiểu cho check-lib.mjs (để test TypeScript import được).
export type Viewport = { width: number; height: number }
export type LayoutMetrics = {
  scrollWidth: number
  innerWidth: number
  innerHeight: number
  /** Các `nav[aria-label="Điều hướng chính"]` đang hiện. */
  navs: { top: number; bottom: number }[]
  mainWidth: number
  mainLeft: number
  mainPaddingBottom: number
  topBarVisible: boolean
  topBarHeight: number
  /** `top` của TopBar sau khi cuộn 600px; null nếu không đo hoặc trang quá ngắn để cuộn. */
  topBarTopAfterScroll: number | null
  /** `top` của đoạn link sâu sau khi mở link; null nếu không đo. */
  deepLinkTop: number | null
  /** `scroll-margin-top` của đoạn link sâu (px); 0 nếu không đo. */
  deepLinkScrollMargin: number
  /** Trang đã cuộn hết cỡ khi đo link sâu (đoạn không thể lên sát TopBar hơn). */
  deepLinkAtScrollEnd: boolean
  /** check.mjs: có đo link sâu mà không thấy đoạn. */
  deepLinkMissing?: boolean
  /** Số `[data-split-rail]` (cột phụ của SplitLayout, story 30) đang hiện. */
  railCount: number
  /**
   * Các cột phụ đang hiện, đo sau khi cuộn 600px (`top`, `height` của cột, `containerBottom` = đáy khung cha); null nếu không
   * đo hoặc trang quá ngắn để cuộn (`scrollY` < 1).
   */
  rails: { top: number; height: number; containerBottom: number }[] | null
  /** Phần phải có trong cột phụ của route (`RAIL_LANDMARKS`) và nó có hiện không; null nếu route không có mục nào. */
  railLandmark: { selector: string; visible: boolean } | null
  /**
   * Lưới của route (`GRID_LANDMARKS`, story 31): phần tử khớp đầu tiên và số cột (số `left` làm tròn khác nhau của con trực
   * tiếp đang hiện); null nếu route không có mục nào hoặc không thấy phần tử.
   */
  grid?: { selector: string; columns: number } | null
}
/** Kết quả thử phím ở 1280px (story 31); `error` khi bước đó không chạy được. */
export type HotkeyProbe = {
  brick: {
    /** Chữ "Màn n/6" sau Enter ×3 từ màn 1. */
    screenAfterEnter: string | null
    /** Chữ "Màn n/6" sau khi gõ "chào 1" + Enter trong ô "Từ còn thiếu". */
    screenAfterTyping: string | null
    /** Có "Chưa đúng" (form đã chấm). */
    typingGraded: boolean
    /** Chữ "Màn n/6" sau khi bỏ focus ô và bấm Enter ở màn 4 (cần màn luyện tập). */
    checkScreen: string | null
    /**
     * Câu luyện tập đầu (`choice`) sau khi quay lại màn 4, bấm 1 (phần luyện tập đang ẩn) rồi Enter về lại màn luyện tập:
     * `answering` = đang ở câu 1 và các lựa chọn còn bấm được, `answered` = đã có lựa chọn bị khoá hoặc đã sang câu sau;
     * null nếu không thấy.
     */
    hiddenCheckState: 'answering' | 'answered' | null
    /** Câu đó sau khi bấm 1 ở màn luyện tập. */
    checkStateAfterKey: 'answering' | 'answered' | null
    error?: string
  }
  session: {
    /** Vị trí (0-based) bước `aria-current="step"` sau →, rồi sau ←. */
    stepAfterRight: number | null
    stepAfterLeft: number | null
    error?: string
  }
  /** Kiểm tra hàng A (`QuestionCard`): bấm 2 rồi Enter. */
  quiz: {
    /** Câu 1 đã chọn (lựa chọn bị khoá) sau phím 2. */
    answeredAfterKey: boolean
    /** Chữ "Câu n/m" sau Enter. */
    headingAfterEnter: string | null
    error?: string
  }
  notebook: {
    searchValue: string | null
    hashBefore: string
    hashAfter: string
    scrollBefore: number
    scrollAfter: number
    error?: string
  }
}
export type CheckArgs = { base: string; skipDiff: boolean; out: string | null }
export const LG_MIN_WIDTH: number
export const WIDTHS: readonly Viewport[]
export const ROUTES: readonly string[]
export const WIDE_ROUTES: readonly string[]
export const RAIL_LANDMARKS: Readonly<Record<string, string>>
export const GRID_LANDMARKS: Readonly<Record<string, string>>
export const HOTKEY_PROBE: {
  width: number
  height: number
  brickRoute: string
  brickScreen: string
  brickTyped: string
  checkScreen: string
  quizRoute: string
  sessionRoute: string
  notebookRoute: string
  searchText: string
}
export const UNCHECKED_ROUTES: readonly string[]
export const DEEP_LINK: { route: string; sectionId: string }
export const EXPECTED: {
  mobileMainMax: number
  desktopMain: number
  desktopWideMax: number
  mobilePaddingBottom: number
  desktopPaddingBottom: number
  topBarHeight: number
  deepLinkGap: number
  railStickyOffset: number
}
export const CHROME_MISSING_MESSAGE: string
export function parseCheckArgs(argv: readonly string[]): CheckArgs
export function findChrome(
  env: Record<string, string | undefined>,
  platform: string,
  exists: (path: string) => boolean,
): string | null
export function layoutProblems(width: number, metrics: LayoutMetrics, layout?: 'default' | 'wide'): string[]
export function hotkeyProblems(probe: HotkeyProbe): string[]
