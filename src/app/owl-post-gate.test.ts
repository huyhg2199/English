import { describe, expect, it } from 'vitest'

import type { AuthState, SyncStatus } from '@/lib/sync'

import { owlPostReady } from './owl-post-gate'

const user = { id: 'u1', email: 'a@b.c' }
const signedIn: AuthState = { status: 'signed-in', user, offline: false }
const snap = (status: SyncStatus, auth: AuthState = signedIn, enabled = true) => ({ enabled, auth, status })

describe('owlPostReady', () => {
  it('không cấu hình đồng bộ / chưa đăng nhập → kiểm tra ngay', () => {
    expect(owlPostReady(snap('off', { status: 'disabled' }, false), false)).toBe(true)
    expect(owlPostReady(snap('off', { status: 'signed-out' }), false)).toBe(true)
  })

  it('đang xác thực, engine chưa chạy hoặc đang đồng bộ → chờ', () => {
    expect(owlPostReady(snap('off', { status: 'loading' }), false)).toBe(false)
    expect(owlPostReady(snap('off'), false)).toBe(false)
    expect(owlPostReady(snap('syncing'), false)).toBe(false)
  })

  it.each(['idle', 'error', 'outdated', 'pending'] as const)('lượt đầu xong (%s) → kiểm tra', (status) => {
    expect(owlPostReady(snap(status), false)).toBe(true)
  })

  it('quá hạn chót từ lúc mở app → kiểm tra dù còn đang đồng bộ', () => {
    expect(owlPostReady(snap('syncing'), true)).toBe(true)
    expect(owlPostReady(snap('off', { status: 'loading' }), true)).toBe(true)
  })
})
