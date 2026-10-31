import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import { createAuth, MESSAGES, readStoredUser, type AuthClientLike } from './auth'
import { AUTH_STORAGE_KEY, createSupabase } from './client'

type Listener = (event: string, session: unknown) => void

const user = { id: 'u1', email: 'huy@example.com' }
const session = { access_token: 'x', refresh_token: 'r', expires_at: 1, user }

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  }
}

const storedSession = () => fakeStorage({ [AUTH_STORAGE_KEY]: JSON.stringify(session) })

function fakeAuth(getSession: () => Promise<unknown>) {
  let listener: Listener = () => {}
  const auth = {
    getSession: vi.fn(getSession),
    onAuthStateChange: vi.fn((cb: Listener) => {
      listener = cb
      return { data: { subscription: { unsubscribe: () => {} } } }
    }),
    signInWithOtp: vi.fn(async () => ({ data: {}, error: null as unknown })),
    verifyOtp: vi.fn(async () => ({ data: { session, user } as unknown, error: null as unknown })),
    signOut: vi.fn(async () => ({ error: null as unknown })),
  }
  return { auth, client: auth as unknown as AuthClientLike, emit: (e: string, s: unknown) => listener(e, s) }
}

const noSession = async () => ({ data: { session: null }, error: null })
const tick = () => new Promise((r) => setTimeout(r, 0))
const warn = vi.fn()

describe('createSupabase', () => {
  it('thiếu biến → null, không log lỗi', () => {
    const spy = vi.spyOn(console, 'warn')
    expect(createSupabase({})).toBeNull()
    expect(createSupabase({ VITE_SUPABASE_URL: 'https://x.supabase.co' })).toBeNull()
    expect(createSupabase({ VITE_SUPABASE_URL: ' ', VITE_SUPABASE_ANON_KEY: 'k' })).toBeNull()
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('đủ biến → có client', () => {
    expect(createSupabase({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'anon' })).not.toBeNull()
  })
})

describe('readStoredUser', () => {
  it('đọc user từ phiên lưu; thiếu/hỏng → null', () => {
    expect(readStoredUser(storedSession())).toEqual({ id: 'u1', email: 'huy@example.com' })
    expect(readStoredUser(fakeStorage())).toBeNull()
    expect(readStoredUser(fakeStorage({ [AUTH_STORAGE_KEY]: '{bad' }))).toBeNull()
    expect(readStoredUser(fakeStorage({ [AUTH_STORAGE_KEY]: JSON.stringify({ user }) }))).toBeNull()
    expect(readStoredUser(null)).toBeNull()
  })
})

describe('createAuth — phiên', () => {
  it('chưa có phiên → loading rồi signed-out', async () => {
    const { client } = fakeAuth(noSession)
    const a = createAuth(client, { storage: fakeStorage(), isOnline: () => true, warn })
    expect(a.getState().status).toBe('loading')
    await tick()
    expect(a.getState()).toEqual({ status: 'signed-out' })
  })

  it('có phiên hợp lệ → signed-in', async () => {
    const { client } = fakeAuth(async () => ({ data: { session }, error: null }))
    const a = createAuth(client, { storage: storedSession(), isOnline: () => true, warn })
    await tick()
    expect(a.getState()).toEqual({ status: 'signed-in', user, offline: false })
  })

  it('phiên lưu trên máy + làm mới lỗi do mất mạng → vẫn signed-in (offline), không đá ra', async () => {
    const { client } = fakeAuth(async () => ({
      data: { session: null },
      error: new AuthRetryableFetchError('Failed to fetch', 0),
    }))
    const a = createAuth(client, { storage: storedSession(), isOnline: () => false, warn })
    // Vào app ngay, không chờ mạng
    expect(a.getState()).toEqual({ status: 'signed-in', user, offline: true })
    await tick()
    expect(a.getState()).toEqual({ status: 'signed-in', user, offline: true })
  })

  it('getSession ném lỗi nhưng có phiên lưu → vẫn signed-in', async () => {
    const { client } = fakeAuth(async () => {
      throw new TypeError('Failed to fetch')
    })
    const a = createAuth(client, { storage: storedSession(), isOnline: () => false, warn })
    await tick()
    expect(a.getState().status).toBe('signed-in')
  })

  it('phiên lưu nhưng refresh token bị thu hồi (lỗi không phải mạng) → signed-out', async () => {
    const { client } = fakeAuth(async () => ({
      data: { session: null },
      error: new AuthApiError('Invalid Refresh Token', 400, 'refresh_token_not_found'),
    }))
    const a = createAuth(client, { storage: storedSession(), isOnline: () => true, warn })
    await tick()
    expect(a.getState()).toEqual({ status: 'signed-out' })
  })

  it('sự kiện SIGNED_OUT → signed-out; INITIAL_SESSION rỗng không đá ra', async () => {
    const { client, emit } = fakeAuth(async () => ({
      data: { session: null },
      error: new AuthRetryableFetchError('Failed to fetch', 0),
    }))
    const a = createAuth(client, { storage: storedSession(), isOnline: () => false, warn })
    await tick()
    emit('INITIAL_SESSION', null)
    expect(a.getState().status).toBe('signed-in')
    emit('TOKEN_REFRESHED', session)
    expect(a.getState()).toEqual({ status: 'signed-in', user, offline: false })
    emit('SIGNED_OUT', null)
    expect(a.getState()).toEqual({ status: 'signed-out' })
  })
})

describe('createAuth — gửi / nhập mã', () => {
  it('sendCode gọi signInWithOtp với shouldCreateUser', async () => {
    const { client, auth } = fakeAuth(noSession)
    const a = createAuth(client, { storage: fakeStorage(), isOnline: () => true, warn })
    expect(await a.sendCode('  huy@example.com ')).toEqual({ ok: true })
    expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: 'huy@example.com', options: { shouldCreateUser: true } })
  })

  it('email sai / offline / quá nhanh → báo lỗi tiếng Việt', async () => {
    const { client, auth } = fakeAuth(noSession)
    let online = true
    const a = createAuth(client, { storage: fakeStorage(), isOnline: () => online, warn })
    expect(await a.sendCode('abc')).toEqual({ ok: false, message: MESSAGES.invalidEmail })

    auth.signInWithOtp.mockResolvedValueOnce({ data: {}, error: new AuthApiError('rate', 429, 'over_email_send_rate_limit') })
    expect(await a.sendCode('huy@example.com')).toEqual({ ok: false, message: MESSAGES.rateLimited })

    // Đã tắt sign-up: email chưa có tài khoản / gõ nhầm
    auth.signInWithOtp.mockResolvedValueOnce({ data: {}, error: new AuthApiError('Signups not allowed', 422, 'signup_disabled') })
    expect(await a.sendCode('nham@example.com')).toEqual({ ok: false, message: MESSAGES.noAccount })
    auth.signInWithOtp.mockResolvedValueOnce({ data: {}, error: new AuthApiError('Signups not allowed for otp', 422, 'otp_disabled') })
    expect(await a.sendCode('nham@example.com')).toEqual({ ok: false, message: MESSAGES.noAccount })

    online = false
    expect(await a.sendCode('huy@example.com')).toEqual({ ok: false, message: MESSAGES.offline })
  })

  it('verifyCode đúng → signed-in, gọi verifyOtp type email', async () => {
    const { client, auth } = fakeAuth(noSession)
    const a = createAuth(client, { storage: fakeStorage(), isOnline: () => true, warn })
    await tick()
    expect(await a.verifyCode('huy@example.com', '123 456')).toEqual({ ok: true })
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'huy@example.com', token: '123456', type: 'email' })
    expect(a.getState()).toEqual({ status: 'signed-in', user, offline: false })
  })

  it('mã sai / hết hạn / sai dạng → báo lỗi tiếng Việt, vẫn signed-out', async () => {
    const { client, auth } = fakeAuth(noSession)
    const a = createAuth(client, { storage: fakeStorage(), isOnline: () => true, warn })
    await tick()
    expect(await a.verifyCode('huy@example.com', '12ab')).toEqual({ ok: false, message: MESSAGES.invalidCode })
    auth.verifyOtp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: new AuthApiError('Token has expired or is invalid', 403, 'otp_expired'),
    })
    expect(await a.verifyCode('huy@example.com', '123456')).toEqual({ ok: false, message: MESSAGES.wrongCode })
    expect(a.getState().status).toBe('signed-out')
  })

  it('signOut: scope local; lỗi (offline) thì tự xoá phiên trên máy, vẫn về signed-out', async () => {
    const { client, auth } = fakeAuth(async () => ({ data: { session }, error: null }))
    const storage = storedSession()
    const a = createAuth(client, { storage, isOnline: () => false, warn })
    await tick()
    auth.signOut.mockResolvedValueOnce({ error: new AuthRetryableFetchError('Failed to fetch', 0) })
    await a.signOut()
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(storage.map.has(AUTH_STORAGE_KEY)).toBe(false)
    expect(a.getState()).toEqual({ status: 'signed-out' })
  })
})

describe('readStoredUser — round-trip qua supabase-js thật', () => {
  it('phiên do createClient lưu (sau verifyOtp) đọc lại được bằng readStoredUser', async () => {
    const storage = fakeStorage()
    const fakeUser = {
      id: '0b6c1a52-3f5e-4c0e-9c55-2d3b7a1e9f00',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'huy@example.com',
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-10-30T00:00:00Z',
    }
    // Server Supabase giả: chỉ trả lời POST /auth/v1/verify bằng một phiên hợp lệ.
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input)
      if (url.includes('/auth/v1/verify')) {
        return new Response(
          JSON.stringify({
            access_token: 'header.payload.signature',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: 'refresh-123',
            user: fakeUser,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } })
    })

    const client = createSupabase(
      { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'anon' },
      { storage, fetch: fetchMock as unknown as typeof fetch },
    )!
    const { data, error } = await client.auth.verifyOtp({ email: 'huy@example.com', token: '123456', type: 'email' })
    expect(error).toBeNull()
    expect(data.session?.user.id).toBe(fakeUser.id)

    // Phiên được lưu đúng key cố định và readStoredUser hiểu định dạng đó.
    expect(storage.map.has(AUTH_STORAGE_KEY)).toBe(true)
    expect(readStoredUser(storage)).toEqual({ id: fakeUser.id, email: 'huy@example.com' })

    // Đăng xuất (scope local) xoá phiên → readStoredUser trả null.
    await client.auth.signOut({ scope: 'local' })
    expect(readStoredUser(storage)).toBeNull()
    client.auth.stopAutoRefresh()
  })
})
