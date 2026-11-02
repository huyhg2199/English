/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const BG = '#14120f'
/** Giới hạn precache của service worker (4 MiB), đủ cho chunk từ vựng. */
const PRECACHE_MAX_BYTES = 4 * 1024 * 1024

export default defineConfig({
  base: '/English/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon.svg'],
      manifest: {
        name: 'Lumos English',
        short_name: 'Lumos English',
        description: 'Học tiếng Anh từ 0 tới TOEIC 750+',
        lang: 'vi',
        start_url: '/English/',
        scope: '/English/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: BG,
        background_color: BG,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Chỉ precache asset của app. Không có runtimeCaching: request tới Supabase (fetch, không phải
      // navigation) luôn đi thẳng ra mạng, không bị navigateFallback hay cache của service worker chặn.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // Chunk từ vựng (words-*.js, ~1.2 MB) phải được precache để ôn offline. Mặc định 2 MiB; vite-plugin-pwa làm
        // build lỗi nếu asset vượt giới hạn. scripts/check-precache.mjs (chạy trong `npm run build`) chặn trường hợp
        // chunk vắng khỏi precache vì lý do khác (vd globPatterns).
        maximumFileSizeToCacheInBytes: PRECACHE_MAX_BYTES,
        navigateFallback: 'index.html',
        // Lịch nhắc tĩnh (story 13): mở link .ics phải ra file thật, không bị trả index.html.
        navigateFallbackDenylist: [/\.ics$/],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
