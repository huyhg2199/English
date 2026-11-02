import { Navigate, type RouteObject } from 'react-router'

import { AppShell } from '@/app/AppShell'
import { Backup } from '@/pages/Backup'
import { Flashcards } from '@/pages/Flashcards'
import { LazySession } from '@/pages/LazySession'
import { Lesson } from '@/pages/Lesson'
import { Mistakes } from '@/pages/Mistakes'
import { Notebook } from '@/pages/Notebook'
import { OwlPostPage } from '@/pages/OwlPost'
import { Practice } from '@/pages/Practice'
import { Quiz } from '@/pages/Quiz'
import { Roadmap } from '@/pages/Roadmap'
import { Session } from '@/pages/Session'
import { SortingHat } from '@/pages/SortingHat'
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
      // Buổi 30' và ngày lười 10'; tab Hôm nay vẫn sáng (`alsoActiveFor` trong nav-items).
      { path: 'session', element: <Session /> },
      { path: 'session/lazy', element: <LazySession /> },
      // Mũ Phân Loại: nhập điểm đề mẫu + câu hỏi Nhà; tab Hôm nay vẫn sáng (`alsoActiveFor`).
      { path: 'sorting-hat', element: <SortingHat /> },
      { path: 'roadmap', element: <Roadmap /> },
      // Trang bài; sectionId là segment route (hash router đã chiếm `#`). Tab Lộ trình vẫn sáng.
      { path: 'roadmap/lesson/:lessonId/:sectionId?', element: <Lesson /> },
      { path: 'practice', element: <Practice /> },
      // Phiên ôn flashcard; tab Luyện tập vẫn sáng (NavLink /practice không `end`).
      { path: 'practice/flashcards', element: <Flashcards /> },
      // Trang làm bài test (mini test T1, …) và Sổ lỗi sai của Snape; tab Luyện tập vẫn sáng.
      { path: 'practice/quiz/:quizId', element: <Quiz /> },
      { path: 'practice/mistakes', element: <Mistakes /> },
      // Sao lưu / khôi phục file JSON; tab Luyện tập vẫn sáng (`alsoActiveFor`).
      { path: 'backup', element: <Backup /> },
      // Owl Post & sao lưu: Gist tự động, giờ nhắc, lịch .ics, Telegram (story 13); tab Luyện tập vẫn sáng.
      { path: 'owl-post', element: <OwlPostPage /> },
      { path: 'notebook', element: <Notebook /> },
      { path: 'trophies', element: <TrophyRoom /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]
