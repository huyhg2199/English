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
}
export type CheckArgs = { base: string; skipDiff: boolean; out: string | null }
export const LG_MIN_WIDTH: number
export const WIDTHS: readonly Viewport[]
export const ROUTES: readonly string[]
export const WIDE_ROUTES: readonly string[]
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
}
export const CHROME_MISSING_MESSAGE: string
export function parseCheckArgs(argv: readonly string[]): CheckArgs
export function findChrome(
  env: Record<string, string | undefined>,
  platform: string,
  exists: (path: string) => boolean,
): string | null
export function layoutProblems(width: number, metrics: LayoutMetrics, layout?: 'default' | 'wide'): string[]
