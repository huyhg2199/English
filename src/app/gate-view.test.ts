import { describe, expect, it } from 'vitest'

import { gateView } from './gate-view'

const user = { id: 'u1', email: 'huy@example.com' }

describe('gateView', () => {
  it('thiếu biến Supabase → vào app (chạy chỉ local)', () => {
    expect(gateView({ enabled: false, auth: { status: 'disabled' } })).toBe('app')
    expect(gateView({ enabled: true, auth: { status: 'disabled' } })).toBe('app')
  })

  it('đã đăng nhập → vào app', () => {
    expect(gateView({ enabled: true, auth: { status: 'signed-in', user, offline: false } })).toBe('app')
  })

  it('phiên lưu trên máy, offline (làm mới lỗi mạng) → vẫn vào app, không đá ra màn đăng nhập', () => {
    expect(gateView({ enabled: true, auth: { status: 'signed-in', user, offline: true } })).toBe('app')
  })

  it('đang kiểm tra phiên → màn chờ', () => {
    expect(gateView({ enabled: true, auth: { status: 'loading' } })).toBe('loading')
  })

  it('chưa đăng nhập → chỉ màn đăng nhập', () => {
    expect(gateView({ enabled: true, auth: { status: 'signed-out' } })).toBe('sign-in')
  })
})
