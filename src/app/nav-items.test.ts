import { describe, expect, it } from 'vitest'
import { matchRoutes } from 'react-router'

import { NAV_ITEMS } from './nav-items'
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
})
