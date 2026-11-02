/**
 * Chuẩn hoá chữ để lọc/tìm: chữ thường, bỏ dấu tiếng Việt (kể cả đ → d), nháy cong → thẳng, gộp khoảng trắng.
 * "Mod" khớp "model", "ghi chu" khớp "Ghi chú".
 */
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[‘’]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
