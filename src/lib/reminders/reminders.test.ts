import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { recordSession } from '@/lib/sessions'
import { CURRENT_VERSION, LEGACY_UPDATED_AT, type Store } from '@/lib/storage'

import {
  buildIcs,
  DEFAULT_REMINDER_TIMES,
  escapeIcsText,
  foldIcsLine,
  normalizeTimes,
  readDismissedDay,
  readReminders,
  REMINDER_DISMISSED_STORAGE,
  saveDismissedDay,
  setReminderTimes,
  showReminderBanner,
} from './index'

const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
/** Giờ máy (local) để không phụ thuộc múi giờ máy chạy test. */
const at = (h: number, m = 0, day = 2) => new Date(2026, 10, day, h, m)

describe('giờ nhắc', () => {
  it('mặc định 12:00, 21:30 khi chưa có / sai dạng', () => {
    expect(readReminders(empty())).toEqual({ times: ['12:00', '21:30'], updatedAt: LEGACY_UPDATED_AT })
    expect(readReminders({ ...empty(), data: { reminders: { times: ['25:00'], updatedAt: 'x' } } }).times).toEqual([
      ...DEFAULT_REMINDER_TIMES,
    ])
  })

  it('normalizeTimes bỏ giờ sai, trùng; sắp xếp; tối đa 4', () => {
    expect(normalizeTimes(['21:30', '12:00', '12:00', '7:00', 'ab', 5, '24:00', '06:15', '23:59', '00:00'])).toEqual([
      '00:00',
      '06:15',
      '12:00',
      '21:30',
    ])
  })

  it('setReminderTimes ghi updatedAt mới; không đổi thì trả về store cũ', () => {
    const s = empty()
    const now = new Date('2026-11-02T05:00:00Z')
    const next = setReminderTimes(s, ['20:00', '07:30'], now)
    expect(next.data.reminders).toEqual({ times: ['07:30', '20:00'], updatedAt: now.toISOString() })
    expect(setReminderTimes(next, ['07:30', '20:00'], now)).toBe(next)
    expect(s.data.reminders).toBeUndefined()
  })
})

describe('dải nhắc trên trang Hôm nay', () => {
  it('13:00 chưa học → hiện; trước giờ nhắc đầu → không', () => {
    expect(showReminderBanner(empty(), at(13), null)).toBe(true)
    expect(showReminderBanner(empty(), at(12, 0), null)).toBe(true)
    expect(showReminderBanner(empty(), at(11, 59), null)).toBe(false)
  })

  it('đã có buổi hôm nay → không hiện', () => {
    const studied = recordSession(empty(), 'lazy', at(9))
    expect(showReminderBanner(studied, at(13), null)).toBe(false)
    // Buổi của hôm qua không tính.
    expect(showReminderBanner(recordSession(empty(), 'full', at(20, 0, 1)), at(13), null)).toBe(true)
  })

  it('đóng thì ẩn tới mai', () => {
    expect(showReminderBanner(empty(), at(13), '2026-11-02')).toBe(false)
    expect(showReminderBanner(empty(), at(13, 0, 3), '2026-11-02')).toBe(true)
  })

  it('theo giờ đã chọn; không có giờ nào thì không hiện', () => {
    const late = setReminderTimes(empty(), ['18:00'], new Date())
    expect(showReminderBanner(late, at(13), null)).toBe(false)
    expect(showReminderBanner(late, at(18, 5), null)).toBe(true)
    const none = setReminderTimes(empty(), [], new Date())
    expect(showReminderBanner(none, at(23), null)).toBe(false)
  })

  it('ngày đã đóng lưu ở localStorage riêng; bị chặn thì không crash', () => {
    const map = new Map<string, string>()
    const storage = { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v) }
    expect(readDismissedDay(storage)).toBeNull()
    saveDismissedDay('2026-11-02', storage)
    expect(map.get(REMINDER_DISMISSED_STORAGE)).toBe('2026-11-02')
    expect(readDismissedDay(storage)).toBe('2026-11-02')
    const broken = {
      getItem: () => {
        throw new Error('x')
      },
      setItem: () => {
        throw new Error('x')
      },
    }
    expect(readDismissedDay(broken)).toBeNull()
    expect(() => saveDismissedDay('2026-11-02', broken)).not.toThrow()
  })
})

describe('.ics', () => {
  const url = 'https://huyhg2199.github.io/English/'

  it('2 VEVENT lặp hằng ngày theo giờ VN, có link app, CRLF', () => {
    const ics = buildIcs(['12:00', '21:30'], url)
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics.split('\r\n').every((l) => !l.includes('\n'))).toBe(true)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics.match(/RRULE:FREQ=DAILY/g)).toHaveLength(2)
    expect(ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20261102T120000')
    expect(ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20261102T213000')
    expect(ics).toContain(`URL:${url}`)
    expect(ics).toContain('TZID:Asia/Ho_Chi_Minh')
  })

  it('UID ổn định theo giờ; giờ sai bị bỏ; ngày bắt đầu tuỳ chọn', () => {
    const ics = buildIcs(['07:05', 'bad'], url, { startDate: '2027-01-15' })
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
    expect(ics).toContain('UID:lumos-english-reminder-0705@lumos-english')
    expect(ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20270115T070500')
  })

  it('thoát ký tự đặc biệt và gập dòng ≤ 75 byte không cắt giữa ký tự', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
    const long = 'DESCRIPTION:' + 'ộ'.repeat(60)
    const folded = foldIcsLine(long)
    const lines = folded.split('\r\n')
    expect(lines.length).toBeGreaterThan(1)
    for (const line of lines) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    expect(lines.map((l, i) => (i === 0 ? l : l.slice(1))).join('')).toBe(long)
  })

  it('public/lumos-reminders.ics khớp buildIcs với giờ mặc định (không có dữ liệu cá nhân)', () => {
    const file = readFileSync(fileURLToPath(new URL('../../../public/lumos-reminders.ics', import.meta.url)), 'utf8')
    expect(file).toBe(buildIcs(['12:00', '21:30'], url))
  })
})
