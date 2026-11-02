// Logic quyết định của Owl Post (story 13): hàm thuần, không gọi mạng, không đọc env.
// Dùng bởi send.mjs (GitHub Actions cron) và test `src/lib/owl-post.test.ts`.

/** Việt Nam không có giờ mùa hè: luôn UTC+7. */
export const VN_OFFSET_MS = 7 * 60 * 60 * 1000

/** Ngày `YYYY-MM-DD` theo giờ Việt Nam tại thời điểm `nowUtc`. */
export function vnDayKey(nowUtc) {
  return new Date(nowUtc.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)
}

/** Giờ (0–23) theo giờ Việt Nam. */
export function vnHour(nowUtc) {
  return new Date(nowUtc.getTime() + VN_OFFSET_MS).getUTCHours()
}

/**
 * Đọc `status.json` (chuỗi). Sai dạng thì null.
 * Dạng: `{ date: 'YYYY-MM-DD', studied: boolean, kind: 'full'|'lazy'|null, streak: number, updatedAt }`.
 */
export function parseStatus(text) {
  let v
  try {
    v = JSON.parse(text)
  } catch {
    return null
  }
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null
  if (typeof v.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return null
  if (typeof v.studied !== 'boolean') return null
  const streak = typeof v.streak === 'number' && Number.isFinite(v.streak) && v.streak >= 0 ? Math.floor(v.streak) : 0
  const kind = v.kind === 'full' || v.kind === 'lazy' ? v.kind : null
  return { date: v.date, studied: v.studied, kind, streak, updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : null }
}

/**
 * Có gửi tin nhắc không. `status` null (không đọc được Gist / sai dạng) → không gửi (tránh làm phiền sai).
 * Gửi khi `status.date` khác ngày VN hôm nay hoặc `studied` khác true.
 * @returns {{ send: boolean, reason: 'no-status' | 'studied' | 'not-today' | 'not-studied', today: string }}
 */
export function shouldSend(status, nowUtc) {
  const today = vnDayKey(nowUtc)
  if (!status) return { send: false, reason: 'no-status', today }
  if (status.date !== today) return { send: true, reason: 'not-today', today }
  if (status.studied !== true) return { send: true, reason: 'not-studied', today }
  return { send: false, reason: 'studied', today }
}

/** Khung giờ theo giờ VN: trưa (< 14h), chiều (< 18h), tối. */
export function slotFor(nowUtc) {
  const h = vnHour(nowUtc)
  if (h < 14) return 'noon'
  if (h < 18) return 'afternoon'
  return 'night'
}

const OPENERS = {
  noon: '🦉 Cú đưa thư ghé giờ trưa đây!',
  afternoon: '🦉 Cú đưa thư lại gõ cửa sổ giữa giờ chiều.',
  night: '🦉 Lá thư cuối ngày từ cú đưa thư.',
}

/**
 * Nội dung tin Telegram (tiếng Việt, ngắn, giọng cú đưa thư). Có link app và gợi ý buổi lười 10'.
 * Không chứa dữ liệu học ngoài streak.
 */
export function buildMessage(status, nowUtc, appUrl) {
  // Streak trong status chỉ còn đúng khi status là của hôm qua (VN) hoặc hôm nay chưa học; cũ hơn thì chuỗi đã đứt.
  const yesterday = vnDayKey(new Date(nowUtc.getTime() - 24 * 60 * 60 * 1000))
  const fresh = status && (status.date === yesterday || status.date === vnDayKey(nowUtc))
  const streak = fresh && status.streak > 0 ? status.streak : 0
  const lines = [OPENERS[slotFor(nowUtc)], 'Hôm nay bạn chưa thắp đũa Lumos nào.']
  if (streak > 0) lines.push(`Chuỗi ${streak} ngày vẫn đang chờ bạn giữ lửa.`)
  lines.push("Hôm nay lười? 10 phút thôi: bấm \"Hôm nay lười\" là đủ giữ streak.", appUrl)
  return lines.join('\n')
}

/** Xoá mọi chuỗi bí mật khỏi thông điệp log (phòng khi thông báo lỗi có kèm URL chứa token). */
export function redact(text, secrets) {
  let out = String(text)
  for (const secret of secrets) {
    if (typeof secret === 'string' && secret.length >= 4) out = out.split(secret).join('***')
  }
  return out
}
