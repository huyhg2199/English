import { describe, expect, it } from 'vitest'

import { syncIndicator } from './sync-indicator'

describe('syncIndicator', () => {
  it('off → không hiện', () => {
    expect(syncIndicator('off')).toBeNull()
  })

  it.each([
    ['idle', 'Đã đồng bộ'],
    ['syncing', 'Đang đồng bộ'],
    ['pending', 'Chưa đồng bộ'],
    ['error', 'Lỗi đồng bộ'],
    ['outdated', 'Cần cập nhật app'],
  ] as const)('%s → "%s"', (status, label) => {
    expect(syncIndicator(status)?.label).toBe(label)
  })

  it('outdated: hai thông báo khác nhau cho server mới hơn và local mới hơn', () => {
    const server = syncIndicator('outdated', 'server')!
    const local = syncIndicator('outdated', 'local')!
    expect(server.detail).toMatch(/trên tài khoản/)
    expect(local.detail).toMatch(/trên máy này/)
    expect(server.detail).not.toBe(local.detail)
  })
})
