/**
 * Lớp của bố cục hai cột từ 1024px (story 30, `SplitLayout`). Mọi token có tiền tố `lg:` nên dưới 1024px wrapper "trong
 * suốt": class dưới lg do nơi gọi truyền qua `className` (trùng `flex flex-col gap-*` của cha). Chuỗi đầy đủ, không
 * ghép, để Tailwind quét được.
 */
export type SplitCols = 'rail-left' | 'rail-right' | 'theory-practice'

export const SPLIT_COLS: Record<SplitCols, string> = {
  // Cột phụ trái 13rem (stepper buổi học) | nội dung.
  'rail-left': 'lg:grid lg:items-start lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8',
  // Nội dung | cột phụ phải 20rem (mục lục, việc và ghi chú của bài).
  'rail-right': 'lg:grid lg:items-start lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8',
  // Lý thuyết đã qua (2) | màn đang luyện (3) của viên gạch.
  'theory-practice': 'lg:grid lg:items-start lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-6',
}

export const SPLIT_MAIN = 'lg:min-w-0'

/**
 * Cột phụ dính ngay dưới TopBar (+1rem), cao tối đa vừa màn hình và tự cuộn khi dài hơn (chỉ cột này có khung cuộn riêng,
 * trang vẫn cuộn trên window). `lg:p-1`: khung cuộn cắt mọi thứ tràn ra ngoài, chừa 4px cho viền focus (ring 3px).
 */
export const SPLIT_RAIL =
  'lg:sticky lg:top-[calc(var(--topbar-height)+1rem)] lg:max-h-[calc(100dvh-var(--topbar-height)-2rem)] lg:min-w-0 lg:overflow-y-auto lg:overscroll-contain lg:p-1'
