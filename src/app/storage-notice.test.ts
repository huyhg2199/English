import { describe, expect, it } from 'vitest'

import { storageNotice } from './storage-notice'

describe('storageNotice', () => {
  it.each(['fresh', 'ok', 'migrated'] as const)('persistent (%s) → không có thông báo', (status) => {
    expect(storageNotice({ mode: 'persistent', status })).toBeNull()
  })

  it.each(['corrupt', 'migration-failed'] as const)('%s → báo dữ liệu cũ được giữ nguyên', (status) => {
    expect(storageNotice({ mode: 'memory', status })).toMatch(/giữ nguyên.*không bị ghi đè/)
  })

  it.each(['unavailable', 'fresh', 'migrated'] as const)('memory (%s) → báo không lưu được', (status) => {
    expect(storageNotice({ mode: 'memory', status })).toMatch(/Không lưu được/)
  })

  it('read-only → báo chạy chỉ đọc', () => {
    expect(storageNotice({ mode: 'read-only', status: 'newer-version' })).toMatch(/chỉ đọc/)
  })
})
