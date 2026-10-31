/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL project Supabase (công khai). Thiếu thì app chạy chỉ local. */
  readonly VITE_SUPABASE_URL?: string
  /** Anon/publishable key (công khai, có RLS bảo vệ). Không bao giờ đặt service key ở đây. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}
