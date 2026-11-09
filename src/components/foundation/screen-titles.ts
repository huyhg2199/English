import type { Screen } from '@/data/foundation'

/** Tên màn của viên gạch: BrickPlayer (màn đang hiện) và cột lý thuyết máy tính (màn đã qua, story 30) dùng chung. */
export const SCREEN_TITLES: Record<Screen['kind'], string> = {
  explain: 'Giải thích',
  contrast: 'Tiếng Việt nói… / Tiếng Anh bắt buộc…',
  worked: 'Ví dụ mẫu',
  faded: 'Tự điền một chỗ trống',
  check: 'Luyện tập',
  apply: 'Áp dụng',
}
