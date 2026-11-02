import { isSessionDay, localDayKey, readSessionDays } from '@/lib/sessions'
import { isPlainObject, LEGACY_UPDATED_AT, type Store } from '@/lib/storage'
import { isTimeString, nextUpdatedAt } from '@/lib/updated-at'

/**
 * Giờ nhắc học (story 13): `store.data.reminders = { times: ['HH:MM', …], updatedAt }`, đồng bộ và gộp cả object
 * theo `updatedAt` (mới hơn thắng). Dùng cho dải nhắc trên trang Hôm nay và file `.ics` tải trong app.
 * Telegram (Owl Post) chạy giờ cố định trong workflow, không đọc key này.
 */
export type Reminders = { times: string[]; updatedAt: string }

export const DEFAULT_REMINDER_TIMES: readonly string[] = ['12:00', '21:30']
export const MAX_REMINDER_TIMES = 4
export const REMINDER_TIMEZONE = 'Asia/Ho_Chi_Minh'

export function isTimeOfDay(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export function isReminders(value: unknown): value is Reminders {
  return (
    isPlainObject(value) &&
    Array.isArray(value.times) &&
    value.times.every(isTimeOfDay) &&
    isTimeString(value.updatedAt)
  )
}

/** Bỏ giờ sai dạng / trùng, sắp xếp tăng dần, tối đa `MAX_REMINDER_TIMES`. */
export function normalizeTimes(times: readonly unknown[]): string[] {
  return [...new Set(times.filter(isTimeOfDay))].sort().slice(0, MAX_REMINDER_TIMES)
}

/** Giờ nhắc hiện tại; thiếu hoặc sai dạng thì là mặc định 12:00, 21:30. */
export function readReminders(store: Store): Reminders {
  const value = store.data.reminders
  if (isReminders(value)) return { times: normalizeTimes(value.times), updatedAt: value.updatedAt }
  return { times: [...DEFAULT_REMINDER_TIMES], updatedAt: LEGACY_UPDATED_AT }
}

/** Đặt giờ nhắc (đã làm sạch). Không đổi gì thì trả về đúng store cũ. Giữ field khác của `reminders`. */
export function setReminderTimes(store: Store, times: readonly unknown[], now: Date): Store {
  const next = normalizeTimes(times)
  const current = readReminders(store)
  if (next.length === current.times.length && next.every((t, i) => t === current.times[i])) return store
  const prev = isPlainObject(store.data.reminders) ? store.data.reminders : {}
  return {
    ...store,
    data: {
      ...store.data,
      reminders: { ...prev, times: next, updatedAt: nextUpdatedAt(prev.updatedAt, now) },
    },
  }
}

function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Hiện dải nhắc trên trang Hôm nay khi: có giờ nhắc, đã qua giờ nhắc đầu tiên (giờ máy), hôm nay chưa có buổi nào
 * và chưa bấm đóng hôm nay (`dismissedDay` = ngày đã đóng, `YYYY-MM-DD`).
 */
export function showReminderBanner(store: Store, now: Date, dismissedDay: string | null): boolean {
  const { times } = readReminders(store)
  if (times.length === 0) return false
  const today = localDayKey(now)
  if (dismissedDay === today) return false
  if (isSessionDay(readSessionDays(store)[today])) return false
  return now.getHours() * 60 + now.getMinutes() >= minutesOf(times[0])
}

// ---------- .ics ----------

/** Thoát ký tự đặc biệt của TEXT trong iCalendar (RFC 5545 §3.3.11). */
export function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Gập dòng dài hơn 75 byte (RFC 5545 §3.1): dòng tiếp theo bắt đầu bằng một dấu cách. Không cắt giữa ký tự UTF-8. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const ch of line) {
    const size = encoder.encode(ch).length
    const limit = parts.length === 0 ? 75 : 74
    if (bytes + size > limit) {
      parts.push(current)
      current = ''
      bytes = 0
    }
    current += ch
    bytes += size
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export type IcsOptions = {
  /** Ngày bắt đầu lặp `YYYY-MM-DD` (mặc định 2026-11-02). */
  startDate?: string
  /** DTSTAMP (UTC). Cố định để file tĩnh sinh lại không đổi. */
  stamp?: Date
}

const DEFAULT_START = '2026-11-02'
const DEFAULT_STAMP = new Date('2026-11-02T00:00:00.000Z')

function icsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Lịch nhắc học: mỗi giờ một VEVENT lặp hằng ngày (`RRULE:FREQ=DAILY`) theo giờ Việt Nam, dài 10 phút, có báo
 * đúng giờ và link app. Không chứa dữ liệu cá nhân. Giờ sai dạng bị bỏ.
 */
export function buildIcs(times: readonly string[], appUrl: string, opts: IcsOptions = {}): string {
  const start = (opts.startDate ?? DEFAULT_START).replace(/-/g, '')
  const stamp = icsUtc(opts.stamp ?? DEFAULT_STAMP)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lumos English//Nhac hoc//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lumos English - nhắc học',
    `X-WR-TIMEZONE:${REMINDER_TIMEZONE}`,
    'BEGIN:VTIMEZONE',
    `TZID:${REMINDER_TIMEZONE}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:+07',
    'END:STANDARD',
    'END:VTIMEZONE',
  ]
  for (const time of normalizeTimes(times)) {
    const hhmm = time.replace(':', '')
    lines.push(
      'BEGIN:VEVENT',
      `UID:lumos-english-reminder-${hhmm}@lumos-english`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${REMINDER_TIMEZONE}:${start}T${hhmm}00`,
      'DURATION:PT10M',
      'RRULE:FREQ=DAILY',
      `SUMMARY:${escapeIcsText('Lumos English: học một chút nhé')}`,
      `DESCRIPTION:${escapeIcsText(`Hôm nay lười? 10 phút thôi. Mở app: ${appUrl}`)}`,
      `URL:${appUrl}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText('Tới giờ học Lumos English')}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldIcsLine).join('\r\n') + '\r\n'
}

export const ICS_FILE_NAME = 'lumos-english-nhac-hoc.ics'
/** File tĩnh trong `public/` để subscribe qua URL Pages (giờ mặc định). */
export const STATIC_ICS_PATH = 'lumos-reminders.ics'
