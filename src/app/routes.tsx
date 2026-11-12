import { Navigate, type RouteObject } from 'react-router'

import { AppShell } from '@/app/AppShell'
import type { RouteHandle } from '@/app/route-handle'
import { Backup } from '@/pages/Backup'
import { Flashcards } from '@/pages/Flashcards'
import { Foundation } from '@/pages/Foundation'
import { FoundationBrick } from '@/pages/FoundationBrick'
import { FoundationRowTest } from '@/pages/FoundationRowTest'
import { FoundationTicket } from '@/pages/FoundationTicket'
import { FoundationWallPassed } from '@/pages/FoundationWallPassed'
import { LazySession } from '@/pages/LazySession'
import { Measure } from '@/pages/Measure'
import { Lesson } from '@/pages/Lesson'
import { Mistakes } from '@/pages/Mistakes'
import { Notebook } from '@/pages/Notebook'
import { Owl } from '@/pages/Owl'
import { OwlPostPage } from '@/pages/OwlPost'
import { Practice } from '@/pages/Practice'
import { Quiz } from '@/pages/Quiz'
import { Roadmap } from '@/pages/Roadmap'
import { Session } from '@/pages/Session'
import { SortingHat } from '@/pages/SortingHat'
import { TenseMap } from '@/pages/TenseMap'
import { Today } from '@/pages/Today'
import { TrophyRoom } from '@/pages/TrophyRoom'
import { Welcome } from '@/pages/Welcome'

/**
 * Hash routing (`/English/#/notebook`) vì GitHub Pages không có rewrite cho SPA:
 * reload hay mở deep link luôn tải index.html, không 404.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      // `wide` (story 31): từ 1024px Hôm nay và Lộ trình dùng lưới 2 cột, cột main 1024px.
      { index: true, element: <Today />, handle: { layout: 'wide' } satisfies RouteHandle },
      // Buổi 30' và ngày lười 10'; tab Hôm nay vẫn sáng (`alsoActiveFor` trong nav-items).
      // `wide` (story 30): từ 1024px buổi học, trang bài và viên gạch chia hai cột (`SplitLayout`), cột main 1024px.
      { path: 'session', element: <Session />, handle: { layout: 'wide' } satisfies RouteHandle },
      { path: 'session/lazy', element: <LazySession /> },
      // Thư nhập học (story 22), Mũ Phân Loại (4 câu chọn Nhà) và Đo trình độ (điểm đề mẫu ETS, tuỳ chọn);
      // tab Hôm nay vẫn sáng (`alsoActiveFor`).
      { path: 'welcome', element: <Welcome /> },
      { path: 'sorting-hat', element: <SortingHat /> },
      { path: 'do-trinh-do', element: <Measure /> },
      { path: 'roadmap', element: <Roadmap />, handle: { layout: 'wide' } satisfies RouteHandle },
      // Trang bài; sectionId là segment route (hash router đã chiếm `#`). Tab Lộ trình vẫn sáng.
      { path: 'roadmap/lesson/:lessonId/:sectionId?', element: <Lesson />, handle: { layout: 'wide' } satisfies RouteHandle },
      // Sân ga 9¾ (story 19): bức tường 18 viên và trình phát viên gạch; tab Lộ trình vẫn sáng (`alsoActiveFor`).
      { path: 'foundation', element: <Foundation /> },
      // Soát vé và kiểm tra hàng (story 20); segment tĩnh thắng `:brickId`.
      { path: 'foundation/soat-ve', element: <FoundationTicket /> },
      { path: 'foundation/kiem-tra/:row', element: <FoundationRowTest /> },
      // Màn ăn mừng qua bức tường (story 26); đặt trước `:brickId`.
      { path: 'foundation/qua-buc-tuong', element: <FoundationWallPassed /> },
      { path: 'foundation/:brickId', element: <FoundationBrick />, handle: { layout: 'wide' } satisfies RouteHandle },
      { path: 'practice', element: <Practice /> },
      // Phiên ôn flashcard; tab Luyện tập vẫn sáng (NavLink /practice không `end`).
      { path: 'practice/flashcards', element: <Flashcards /> },
      // Trang làm bài test (mini test T1, …) và Sổ lỗi sai của Snape; tab Luyện tập vẫn sáng.
      { path: 'practice/quiz/:quizId', element: <Quiz /> },
      { path: 'practice/mistakes', element: <Mistakes /> },
      // Kỳ thi O.W.L. 1 (story 14); tab Luyện tập vẫn sáng.
      { path: 'practice/owl', element: <Owl /> },
      // Bản đồ thì (story 42): mức nắm chắc từng thì Năm 1; tab Luyện tập vẫn sáng. `wide`: từ 1024px lưới 2 cột, mỗi tháng một ô.
      { path: 'practice/tense-map', element: <TenseMap />, handle: { layout: 'wide' } satisfies RouteHandle },
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
