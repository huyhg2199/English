import { describe, expect, it } from 'vitest'
import { matchRoutes } from 'react-router'

import { isNavItemActive, NAV_ITEMS } from './nav-items'
import { routes } from './routes'

describe('NAV_ITEMS', () => {
  it('có đúng 5 tab theo thứ tự SPEC', () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      'Hôm nay',
      'Lộ trình',
      'Luyện tập',
      'Sổ tay',
      'Phòng Cúp',
    ])
  })

  it.each(NAV_ITEMS.map((item) => [item.label, item.path]))(
    '%s (%s) trỏ tới một route thật, không phải route *',
    (_, path) => {
      const matches = matchRoutes(routes, path)
      expect(matches).not.toBeNull()
      const leaf = matches!.at(-1)!.route
      expect(leaf.path).not.toBe('*')
      expect(leaf.element).toBeTruthy()
    },
  )

  it('/practice/flashcards là route thật nằm dưới tab Luyện tập', () => {
    const leaf = matchRoutes(routes, '/practice/flashcards')!.at(-1)!.route
    expect(leaf.path).toBe('practice/flashcards')
    const practice = NAV_ITEMS.find((item) => item.label === 'Luyện tập')!
    expect('/practice/flashcards'.startsWith(`${practice.path}/`)).toBe(true)
  })

  it('/session, /session/lazy, /sorting-hat là route thật, tab Hôm nay sáng; các tab khác không', () => {
    for (const path of ['/session', '/session/lazy', '/sorting-hat']) {
      const leaf = matchRoutes(routes, path)!.at(-1)!.route
      expect(leaf.path).not.toBe('*')
      expect(NAV_ITEMS.filter((item) => isNavItemActive(item, path)).map((i) => i.label)).toEqual(['Hôm nay'])
    }
  })

  it('isNavItemActive: / chỉ khớp đúng /, tab khác khớp route con', () => {
    const active = (p: string) => NAV_ITEMS.filter((item) => isNavItemActive(item, p)).map((i) => i.label)
    expect(active('/')).toEqual(['Hôm nay'])
    expect(active('/practice/flashcards')).toEqual(['Luyện tập'])
    expect(active('/roadmap/lesson/s1-t1-w1')).toEqual(['Lộ trình'])
    expect(active('/sessionx')).toEqual([])
  })

  it('/backup là route thật, tab Luyện tập sáng', () => {
    const leaf = matchRoutes(routes, '/backup')!.at(-1)!.route
    expect(leaf.path).toBe('backup')
    expect(NAV_ITEMS.filter((item) => isNavItemActive(item, '/backup')).map((i) => i.label)).toEqual(['Luyện tập'])
  })

  it('/owl-post là route thật, tab Luyện tập sáng', () => {
    const leaf = matchRoutes(routes, '/owl-post')!.at(-1)!.route
    expect(leaf.path).toBe('owl-post')
    expect(NAV_ITEMS.filter((item) => isNavItemActive(item, '/owl-post')).map((i) => i.label)).toEqual(['Luyện tập'])
  })

  it('/foundation, /foundation/F01 là route thật, tab Lộ trình sáng; /foundationx không', () => {
    expect(matchRoutes(routes, '/foundation')!.at(-1)!.route.path).toBe('foundation')
    expect(matchRoutes(routes, '/foundation/F01')!.at(-1)!.route.path).toBe('foundation/:brickId')
    const active = (p: string) => NAV_ITEMS.filter((item) => isNavItemActive(item, p)).map((i) => i.label)
    expect(active('/foundation')).toEqual(['Lộ trình'])
    expect(active('/foundation/F01')).toEqual(['Lộ trình'])
    expect(active('/foundationx')).toEqual([])
  })
})
