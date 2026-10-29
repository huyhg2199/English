import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import './index.css'
import { router } from '@/app/router'
import { StoreContext } from '@/app/store-context'
import { loadStore } from '@/lib/storage'

// Đọc một lần khi khởi động; loadStore không bao giờ ném lỗi (xem I/O Matrix story 1).
const loadedStore = loadStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext.Provider value={loadedStore}>
      <RouterProvider router={router} />
    </StoreContext.Provider>
  </StrictMode>,
)
