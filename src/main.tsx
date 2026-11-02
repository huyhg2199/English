import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import './index.css'
import { AuthGate } from '@/app/AuthGate'
import { router } from '@/app/router'
import { createStoreHandle, GistContext, mergeGistBackup, StoreContext, SyncContext } from '@/app/store-context'
import { createGistWriter } from '@/lib/gist'
import { loadStore } from '@/lib/storage'
import { createSupabase, createSync } from '@/lib/sync'
import { browserEnvironment } from '@/lib/sync/engine'

// Đọc một lần khi khởi động; loadStore không bao giờ ném lỗi (xem I/O Matrix story 1).
// Handle bọc store để ghi qua saveStore và báo React re-render.
const storeHandle = createStoreHandle(loadStore())

// Local-first: app luôn đọc/ghi localStorage; có Supabase (biến build) và đã đăng nhập thì đồng bộ.
// Thiếu biến `VITE_SUPABASE_*` → client null → không đăng nhập, chạy chỉ local.
const sync = createSync(createSupabase(), storeHandle)

// Bản sao tự động lên secret Gist (story 13): ghi khi xong buổi và khi app xuống nền (dữ liệu đổi, ≥ 10 phút/lần).
// Chưa nhập PAT thì không gọi mạng.
const gist = createGistWriter({
  getLoaded: storeHandle.getSnapshot,
  fetch: (url, init) => window.fetch(url, init),
  merge: (backup) => mergeGistBackup(storeHandle, backup),
  onHidden: browserEnvironment().onHidden,
})
gist.start()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext.Provider value={storeHandle}>
      <SyncContext.Provider value={sync}>
        <GistContext.Provider value={gist}>
          <AuthGate>
            <RouterProvider router={router} />
          </AuthGate>
        </GistContext.Provider>
      </SyncContext.Provider>
    </StoreContext.Provider>
  </StrictMode>,
)
