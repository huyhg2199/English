import { isAuthRetryableFetchError, type SupabaseClient } from '@supabase/supabase-js'

import { isPlainObject, type StorageLike } from '@/lib/storage'

import { AUTH_STORAGE_KEY } from './client'

export type AuthUser = { id: string; email: string | null }

/**
 * - `disabled`: không cấu hình Supabase, bỏ qua đăng nhập.
 * - `loading`: đang kiểm tra phiên (chỉ khi máy chưa lưu phiên nào).
 * - `signed-out`: cần đăng nhập.
 * - `signed-in`: có phiên. `offline: true` khi đang dùng phiên lưu trên máy mà chưa làm mới được (mất mạng).
 */
export type AuthState =
  | { status: 'disabled' }
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: AuthUser; offline: boolean }

export type AuthResult = { ok: true } | { ok: false; message: string }

export type AuthClientLike = Pick<
  SupabaseClient['auth'],
  'getSession' | 'onAuthStateChange' | 'signInWithOtp' | 'verifyOtp' | 'signOut'
>

export type AuthOptions = {
  isOnline?: () => boolean
  /** Nơi Supabase lưu phiên (mặc định localStorage). */
  storage?: (StorageLike & Partial<Pick<Storage, 'removeItem'>>) | null
  warn?: (message: string, error?: unknown) => void
}

export type AuthController = {
  getState(): AuthState
  subscribe(listener: () => void): () => void
  sendCode(email: string): Promise<AuthResult>
  verifyCode(email: string, token: string): Promise<AuthResult>
  signOut(): Promise<void>
}

export const MESSAGES = {
  offline: 'Cần có mạng để đăng nhập lần đầu. Kết nối mạng rồi thử lại.',
  invalidEmail: 'Email không hợp lệ.',
  invalidCode: 'Mã gồm 6 chữ số.',
  wrongCode: 'Mã sai hoặc đã hết hạn. Kiểm tra lại hoặc bấm "Gửi lại mã".',
  noAccount: 'Email này chưa có tài khoản. Kiểm tra lại email.',
  rateLimited: 'Gửi mã quá nhanh. Đợi khoảng một phút rồi thử lại.',
  generic: 'Không đăng nhập được lúc này. Thử lại sau ít phút.',
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function defaultStorage(): AuthOptions['storage'] {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/** Đọc user từ phiên Supabase lưu trên máy (không gọi mạng). */
export function readStoredUser(storage: AuthOptions['storage']): AuthUser | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isPlainObject(parsed) || typeof parsed.refresh_token !== 'string' || !isPlainObject(parsed.user)) return null
    const { id, email } = parsed.user
    if (typeof id !== 'string' || !id) return null
    return { id, email: typeof email === 'string' ? email : null }
  } catch {
    return null
  }
}

function toUser(user: { id: string; email?: string | null }): AuthUser {
  return { id: user.id, email: user.email ?? null }
}

function isNetworkError(error: unknown, online: boolean): boolean {
  return !online || isAuthRetryableFetchError(error) || (error instanceof TypeError && /fetch/i.test(error.message))
}

function messageFor(error: unknown, online: boolean, kind: 'send' | 'verify'): string {
  if (isNetworkError(error, online)) return MESSAGES.offline
  const e = (isPlainObject(error) || error instanceof Error ? error : {}) as { status?: number; code?: string }
  if (e.status === 429 || e.code === 'over_email_send_rate_limit' || e.code === 'over_request_rate_limit') {
    return MESSAGES.rateLimited
  }
  if (e.code === 'email_address_invalid' || e.code === 'validation_failed') return MESSAGES.invalidEmail
  // Đã tắt sign-up (README): email chưa có tài khoản / gõ nhầm.
  if (kind === 'send' && (e.code === 'signup_disabled' || e.code === 'otp_disabled')) return MESSAGES.noAccount
  if (kind === 'verify') return MESSAGES.wrongCode
  return MESSAGES.generic
}

/** Controller cho trường hợp thiếu biến Supabase: app chạy chỉ local. */
export function disabledAuth(): AuthController {
  const state: AuthState = { status: 'disabled' }
  const fail = async (): Promise<AuthResult> => ({ ok: false, message: MESSAGES.generic })
  return {
    getState: () => state,
    subscribe: () => () => {},
    sendCode: fail,
    verifyCode: fail,
    signOut: async () => {},
  }
}

/**
 * Quản lý phiên đăng nhập bằng mã OTP 6 số gửi qua email.
 * Phiên đã lưu trên máy + làm mới lỗi vì mạng vẫn tính là đã đăng nhập (học offline được).
 */
export function createAuth(auth: AuthClientLike, opts: AuthOptions = {}): AuthController {
  const isOnline = opts.isOnline ?? (() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))
  const storage = opts.storage !== undefined ? opts.storage : defaultStorage()
  const warn = opts.warn ?? ((m: string, e?: unknown) => console.warn(`[auth] ${m}`, e ?? ''))
  const listeners = new Set<() => void>()

  // Có phiên lưu trên máy thì vào app ngay (kể cả offline), xác nhận lại ở nền.
  const stored = readStoredUser(storage)
  let state: AuthState = stored ? { status: 'signed-in', user: stored, offline: true } : { status: 'loading' }

  function setState(next: AuthState) {
    state = next
    listeners.forEach((l) => l())
  }

  function signedIn(user: AuthUser, offline: boolean) {
    if (state.status === 'signed-in' && state.user.id === user.id && state.user.email === user.email && state.offline === offline) {
      return
    }
    setState({ status: 'signed-in', user, offline })
  }

  auth.onAuthStateChange((event, session) => {
    if (session?.user) signedIn(toUser(session.user), false)
    else if (event === 'SIGNED_OUT') setState({ status: 'signed-out' })
    // INITIAL_SESSION không có session: để `getSession` bên dưới quyết định (có thể chỉ là mất mạng).
  })

  auth
    .getSession()
    .then(({ data, error }) => {
      if (data.session?.user) return signedIn(toUser(data.session.user), false)
      const user = readStoredUser(storage)
      if (user && error && isNetworkError(error, isOnline())) return signedIn(user, true)
      if (error) warn('Không kiểm tra được phiên', error)
      setState({ status: 'signed-out' })
    })
    .catch((error: unknown) => {
      const user = readStoredUser(storage)
      if (user) return signedIn(user, true)
      warn('Không kiểm tra được phiên', error)
      setState({ status: 'signed-out' })
    })

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async sendCode(rawEmail) {
      const email = rawEmail.trim()
      if (!EMAIL_RE.test(email)) return { ok: false, message: MESSAGES.invalidEmail }
      if (!isOnline()) return { ok: false, message: MESSAGES.offline }
      try {
        const { error } = await auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
        if (error) return { ok: false, message: messageFor(error, isOnline(), 'send') }
        return { ok: true }
      } catch (error) {
        return { ok: false, message: messageFor(error, isOnline(), 'send') }
      }
    },
    async verifyCode(rawEmail, rawToken) {
      const email = rawEmail.trim()
      const token = rawToken.replace(/\s+/g, '')
      if (!/^\d{6}$/.test(token)) return { ok: false, message: MESSAGES.invalidCode }
      if (!isOnline()) return { ok: false, message: MESSAGES.offline }
      try {
        const { data, error } = await auth.verifyOtp({ email, token, type: 'email' })
        if (error || !data.session?.user) {
          return { ok: false, message: messageFor(error ?? {}, isOnline(), 'verify') }
        }
        signedIn(toUser(data.session.user), false)
        return { ok: true }
      } catch (error) {
        return { ok: false, message: messageFor(error, isOnline(), 'verify') }
      }
    },
    async signOut() {
      // scope 'local': chỉ đăng xuất máy này. Lỗi (vd offline) thì tự xoá phiên lưu trên máy.
      try {
        const { error } = await auth.signOut({ scope: 'local' })
        if (error) throw error
      } catch (error) {
        warn('Đăng xuất qua Supabase lỗi, xoá phiên trên máy', error)
        try {
          storage?.removeItem?.(AUTH_STORAGE_KEY)
        } catch {
          // bỏ qua
        }
      }
      setState({ status: 'signed-out' })
    },
  }
}
