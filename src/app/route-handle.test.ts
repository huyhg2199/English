import { matchRoutes, type RouteObject } from 'react-router'
import { describe, expect, it } from 'vitest'

import { LAYOUT_CLASS, layoutFor } from '@/app/route-handle'
import { routes } from '@/app/routes'

import { DEEP_LINK, ROUTES, UNCHECKED_ROUTES, WIDE_ROUTES } from '../../scripts/layout/check-lib.mjs'

describe('layoutFor', () => {
  it('match không có handle → default', () => {
    expect(layoutFor([])).toBe('default')
    expect(layoutFor([{ handle: undefined }, { handle: {} }])).toBe('default')
  })

  it('leaf wide → wide', () => {
    expect(layoutFor([{ handle: undefined }, { handle: { layout: 'wide' } }])).toBe('wide')
  })

  it('cha wide + leaf default → default (match sau cùng có layout hợp lệ thắng)', () => {
    expect(layoutFor([{ handle: { layout: 'wide' } }, { handle: { layout: 'default' } }])).toBe('default')
  })

  it('cha wide + leaf không có layout → wide', () => {
    expect(layoutFor([{ handle: { layout: 'wide' } }, { handle: undefined }])).toBe('wide')
  })

  it("giá trị lạ ('huge', null, chuỗi) bị bỏ qua → default", () => {
    expect(layoutFor([{ handle: { layout: 'huge' } }])).toBe('default')
    expect(layoutFor([{ handle: { layout: 'wide' } }, { handle: { layout: 'huge' } }])).toBe('wide')
    expect(layoutFor([{ handle: null }, { handle: 'wide' }])).toBe('default')
  })

  it('class chỉ có tiền tố lg:', () => {
    expect(Object.values(LAYOUT_CLASS).every((cls) => cls.split(/\s+/).every((t) => t.startsWith('lg:')))).toBe(true)
  })
})

describe('handle của cây routes', () => {
  function* walk(list: readonly RouteObject[]): Generator<RouteObject> {
    for (const route of list) {
      yield route
      if (route.children) yield* walk(route.children)
    }
  }

  it('mọi handle.layout (nếu có) đều hợp lệ', () => {
    for (const route of walk(routes)) {
      const handle = route.handle as { layout?: unknown } | undefined
      if (handle && 'layout' in handle) expect(['default', 'wide']).toContain(handle.layout)
    }
  })

  const layoutOfPath = (path: string) => {
    const matches = matchRoutes(routes, path)
    expect(matches, path).not.toBeNull()
    return layoutFor(matches!.map((m) => ({ handle: m.route.handle })))
  }

  // Story 30: đúng 3 route học có hai cột → `wide`.
  it.each(['/session', '/roadmap/lesson/s1-t1-w1', '/roadmap/lesson/s1-t1-w1/vocabulary', '/foundation/F01', '/foundation/f03'])(
    '%s → wide',
    (path) => {
      expect(layoutOfPath(path)).toBe('wide')
    },
  )

  it.each([
    '/',
    '/roadmap',
    '/foundation',
    '/foundation/soat-ve',
    '/foundation/kiem-tra/A',
    '/foundation/qua-buc-tuong',
    '/session/lazy',
    '/practice',
  ])('%s → default', (path) => {
    expect(layoutOfPath(path)).toBe('default')
  })

  it('chỉ đúng 3 route trong cây có handle wide', () => {
    const wide: string[] = []
    for (const route of walk(routes)) {
      const handle = route.handle as { layout?: unknown } | undefined
      if (handle?.layout === 'wide') wide.push(route.path ?? '')
    }
    expect(wide.sort()).toEqual(['foundation/:brickId', 'roadmap/lesson/:lessonId/:sectionId?', 'session'])
  })
})

describe('layout:check — danh sách route khớp cây routes', () => {
  /** Đường dẫn tĩnh đầy đủ (bỏ route có `:param` hoặc `*`). */
  function staticPaths(list: readonly RouteObject[], prefix = ''): string[] {
    const out: string[] = []
    for (const route of list) {
      const full = route.path === undefined ? prefix : route.path.startsWith('/') ? route.path : `${prefix.replace(/\/$/, '')}/${route.path}`
      if (route.path !== undefined && !/[:*]/.test(route.path)) out.push(full)
      if (route.children) out.push(...staticPaths(route.children, full))
    }
    return out
  }

  it('mọi route tĩnh đều nằm trong ROUTES hoặc UNCHECKED_ROUTES (thêm trang mới thì phải chọn đo hay không)', () => {
    const paths = staticPaths(routes)
    expect(paths).toContain('/practice/mistakes')
    for (const path of paths) expect([...ROUTES, ...UNCHECKED_ROUTES]).toContain(path)
    for (const path of UNCHECKED_ROUTES) expect(paths).toContain(path)
  })

  it.each([...ROUTES, DEEP_LINK.route])('%s: layout khớp WIDE_ROUTES', (path) => {
    const matches = matchRoutes(routes, path)
    expect(matches).not.toBeNull()
    expect(layoutFor(matches!.map((m) => ({ handle: m.route.handle })))).toBe(
      WIDE_ROUTES.includes(path) ? 'wide' : 'default',
    )
  })
})
