import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** Key localStorage chứa phiên đăng nhập Supabase (đặt cố định để đọc lại khi offline). */
export const AUTH_STORAGE_KEY = 'lumos-english:auth'

/** Ghi đè cho test: nơi lưu phiên và `fetch` (mặc định localStorage và `fetch` của trình duyệt). */
export type SupabaseOverrides = {
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  fetch?: typeof fetch
}

export type SupabaseEnv = {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

/**
 * Tạo client Supabase từ biến build. Thiếu biến thì trả `null` (app chạy chỉ local như story 2),
 * không log gì để không có lỗi console khi dev không cấu hình Supabase.
 * Chỉ dùng anon key (publishable); không bao giờ dùng service key ở app.
 */
export function createSupabase(
  env: SupabaseEnv = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  overrides: SupabaseOverrides = {},
): SupabaseClient | null {
  const url = env.VITE_SUPABASE_URL?.trim()
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return null
  try {
    return createClient(url, anonKey, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        // Đăng nhập bằng mã OTP, không có redirect; không để Supabase đọc nhầm hash route (`#/...`).
        detectSessionInUrl: false,
        storageKey: AUTH_STORAGE_KEY,
        ...(overrides.storage ? { storage: overrides.storage } : {}),
      },
      ...(overrides.fetch ? { global: { fetch: overrides.fetch } } : {}),
    })
  } catch (error) {
    // URL sai dạng: coi như chưa cấu hình, app vẫn chạy local.
    console.warn('[sync] VITE_SUPABASE_URL không hợp lệ, chạy chỉ local', error)
    return null
  }
}
