import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import './index.css'
import { AuthGate } from '@/app/AuthGate'
import { router } from '@/app/router'
import { createStoreHandle, StoreContext, SyncContext } from '@/app/store-context'
import { loadStore } from '@/lib/storage'
import { createSupabase, createSync } from '@/lib/sync'

// Đọc một lần khi khởi động; loadStore không bao giờ ném lỗi (xem I/O Matrix story 1).
// Handle bọc store để ghi qua saveStore và báo React re-render.
const storeHandle = createStoreHandle(loadStore())

// Local-first: app luôn đọc/ghi localStorage; có Supabase (biến build) và đã đăng nhập thì đồng bộ.
// Thiếu biến `VITE_SUPABASE_*` → client null → không đăng nhập, chạy chỉ local.
const sync = createSync(createSupabase(), storeHandle)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext.Provider value={storeHandle}>
      <SyncContext.Provider value={sync}>
        <AuthGate>
          <RouterProvider router={router} />
        </AuthGate>
      </SyncContext.Provider>
    </StoreContext.Provider>
  </StrictMode>,
)
