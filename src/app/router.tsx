import { createHashRouter } from 'react-router'

import { routes } from '@/app/routes'

/**
 * Hash routing (`/English/#/notebook`) vì GitHub Pages không có rewrite cho SPA:
 * reload hay mở deep link luôn tải index.html, không 404.
 */
export const router = createHashRouter(routes)
