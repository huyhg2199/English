/**
 * Cổng giới thiệu từ mới (story 24). Luật "khoá ≠ mất":
 * - từ bị khoá chỉ không được giới thiệu làm từ mới (không tạo thẻ, không tính quota), kể cả khi nằm trong `preferIds`;
 * - thẻ đã có của từ đó (dữ liệu cũ) vẫn ôn theo lịch, không bị xoá hay reset;
 * - khi cổng mở, từ quay lại hàng chờ đúng theo hạng NGSL vì `buildSession` vẫn sort bằng `compareStudyOrder`, không có
 *   thứ tự riêng cho từ vừa mở.
 */

/** Id có cổng chưa mở (`isOpen(gate)` false). Hàm thuần: cổng nào mở hay không do bên gọi quyết định. */
export function lockedWordIds<G>(gates: Readonly<Record<string, G>>, isOpen: (gate: G) => boolean): Set<string> {
  const locked = new Set<string>()
  for (const id of Object.keys(gates)) if (!isOpen(gates[id])) locked.add(id)
  return locked
}
