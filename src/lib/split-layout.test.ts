import { describe, expect, it } from 'vitest'

import { SPLIT_COLS, SPLIT_MAIN, SPLIT_RAIL } from './split-layout'

const tokens = (cls: string) => cls.split(/\s+/).filter(Boolean)

describe('split-layout (story 30)', () => {
  it('mọi token chỉ có tiền tố lg: (dưới 1024px wrapper trong suốt)', () => {
    const all = [...Object.values(SPLIT_COLS), SPLIT_MAIN, SPLIT_RAIL].flatMap(tokens)
    expect(all.length).toBeGreaterThan(0)
    for (const token of all) expect(token).toMatch(/^lg:\S+/)
  })

  it('ba kiểu cột: rail-left 13rem | nội dung, rail-right nội dung | 20rem, theory-practice 2fr | 3fr; lưới căn đầu', () => {
    expect(tokens(SPLIT_COLS['rail-left'])).toEqual(
      expect.arrayContaining(['lg:grid', 'lg:items-start', 'lg:grid-cols-[13rem_minmax(0,1fr)]', 'lg:gap-8']),
    )
    expect(tokens(SPLIT_COLS['rail-right'])).toEqual(
      expect.arrayContaining(['lg:grid', 'lg:items-start', 'lg:grid-cols-[minmax(0,1fr)_20rem]', 'lg:gap-8']),
    )
    expect(tokens(SPLIT_COLS['theory-practice'])).toEqual(
      expect.arrayContaining(['lg:grid', 'lg:items-start', 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]', 'lg:gap-6']),
    )
  })

  it('cột phụ dính dưới TopBar + 1rem, cao tối đa vừa màn hình, tự cuộn, chừa chỗ viền focus', () => {
    expect(tokens(SPLIT_RAIL)).toEqual(
      expect.arrayContaining([
        'lg:sticky',
        'lg:top-[calc(var(--topbar-height)+1rem)]',
        'lg:max-h-[calc(100dvh-var(--topbar-height)-2rem)]',
        'lg:min-w-0',
        'lg:overflow-y-auto',
        'lg:overscroll-contain',
        // Chừa 4px cho viền focus (ring 3px) của nút/link sát mép: khung cuộn cắt mọi thứ tràn ra ngoài.
        'lg:p-1',
      ]),
    )
    expect(SPLIT_MAIN).toBe('lg:min-w-0')
  })
})
