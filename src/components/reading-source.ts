import { createContext } from 'react'

import type { SavedWordSource } from '@/lib/saved-words'

/**
 * Nguồn mặc định cho `ReadableText` bên trong (vd trang bài cung cấp tiêu đề bài + đường dẫn đoạn trong app).
 * `url` bắt đầu bằng `/` là đường dẫn trong app (hash route), còn lại là link ngoài.
 */
export const ReadingSourceContext = createContext<SavedWordSource | null>(null)
