import { Navigate, type RouteObject } from 'react-router'

import { AppShell } from '@/app/AppShell'
import { Lesson } from '@/pages/Lesson'
import { Notebook } from '@/pages/Notebook'
import { Practice } from '@/pages/Practice'
import { Roadmap } from '@/pages/Roadmap'
import { Today } from '@/pages/Today'
import { TrophyRoom } from '@/pages/TrophyRoom'

/**
 * Hash routing (`/English/#/notebook`) vì GitHub Pages không có rewrite cho SPA:
 * reload hay mở deep link luôn tải index.html, không 404.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Today /> },
      { path: 'roadmap', element: <Roadmap /> },
      // Trang bài; sectionId là segment route (hash router đã chiếm `#`). Tab Lộ trình vẫn sáng.
      { path: 'roadmap/lesson/:lessonId/:sectionId?', element: <Lesson /> },
      { path: 'practice', element: <Practice /> },
      { path: 'notebook', element: <Notebook /> },
      { path: 'trophies', element: <TrophyRoom /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]
