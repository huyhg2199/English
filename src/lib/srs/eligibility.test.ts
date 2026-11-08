import { describe, expect, it } from 'vitest'

import { lockedWordIds } from './eligibility'

describe('lockedWordIds — cổng từ mới', () => {
  const gates = { 'ngsl-the': 'F11', 'ngsl-a': 'F11', 'ngsl-be': 'F13', 'ngsl-of': 'wall' } as const

  it('id có cổng chưa mở bị khoá, cổng đã mở thì không', () => {
    expect(lockedWordIds(gates, (g) => g === 'F11')).toEqual(new Set(['ngsl-be', 'ngsl-of']))
  })

  it('mọi cổng mở → rỗng; không cổng nào mở → đủ mọi id', () => {
    expect(lockedWordIds(gates, () => true).size).toBe(0)
    expect(lockedWordIds(gates, () => false)).toEqual(new Set(Object.keys(gates)))
  })

  it('bảng cổng rỗng → rỗng', () => {
    expect(lockedWordIds({}, () => false).size).toBe(0)
  })
})
