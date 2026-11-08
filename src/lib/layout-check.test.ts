import { describe, expect, it } from 'vitest'

import {
  CHROME_MISSING_MESSAGE,
  findChrome,
  layoutProblems,
  parseCheckArgs,
  ROUTES,
  WIDTHS,
  type LayoutMetrics,
} from '../../scripts/layout/check-lib.mjs'

/** Số đo đạt chuẩn ở bề rộng `width` (dựng tay). */
function good(width: number, height = 800): LayoutMetrics {
  const desktop = width >= 1024
  const mainWidth = desktop ? 768 : Math.min(448, width)
  return {
    scrollWidth: width,
    innerWidth: width,
    innerHeight: height,
    navs: desktop ? [{ top: 0, bottom: 56 }] : [{ top: height - 64, bottom: height }],
    mainWidth,
    mainLeft: (width - mainWidth) / 2,
    mainPaddingBottom: desktop ? 24 : 88,
    topBarVisible: desktop,
    topBarHeight: desktop ? 56 : 0,
    topBarTopAfterScroll: desktop ? 0 : null,
    deepLinkTop: null,
    deepLinkScrollMargin: 0,
    deepLinkAtScrollEnd: false,
  }
}

describe('layout:check — danh sách', () => {
  it('5 bề rộng và các route của story', () => {
    expect(WIDTHS.map((w) => `${w.width}×${w.height}`)).toEqual([
      '375×812',
      '1023×768',
      '1024×768',
      '1280×800',
      '1920×1080',
    ])
    expect(ROUTES).toContain('/')
    expect(ROUTES).toContain('/foundation/F01')
    expect(ROUTES).toHaveLength(12)
  })
})

describe('layout:check — parseCheckArgs', () => {
  it('mặc định', () => {
    expect(parseCheckArgs([])).toEqual({ base: 'HEAD', skipDiff: false, out: null })
  })

  it('--base, --skip-diff, --out', () => {
    expect(parseCheckArgs(['--base', 'abc123', '--skip-diff', '--out', '/tmp/x'])).toEqual({
      base: 'abc123',
      skipDiff: true,
      out: '/tmp/x',
    })
  })

  it('thiếu giá trị hoặc tham số lạ → ném lỗi', () => {
    expect(() => parseCheckArgs(['--base'])).toThrow(/Thiếu giá trị/)
    expect(() => parseCheckArgs(['--out', '--skip-diff'])).toThrow(/Thiếu giá trị/)
    expect(() => parseCheckArgs(['--fast'])).toThrow(/Không hiểu tham số/)
  })
})

describe('layout:check — findChrome', () => {
  const none = () => false

  it('CHROME_PATH tồn tại → dùng', () => {
    expect(findChrome({ CHROME_PATH: '/opt/chrome' }, 'linux', (p) => p === '/opt/chrome')).toBe('/opt/chrome')
  })

  it('CHROME_PATH đặt sai → null (không đoán đường khác)', () => {
    expect(findChrome({ CHROME_PATH: '/nope' }, 'darwin', () => false)).toBeNull()
  })

  it('không CHROME_PATH → thử đường dẫn mặc định theo hệ điều hành', () => {
    const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    expect(findChrome({}, 'darwin', (p) => p === mac)).toBe(mac)
    expect(findChrome({}, 'linux', (p) => p === '/usr/bin/chromium')).toBe('/usr/bin/chromium')
  })

  it('thiếu Chrome → null, thông báo tiếng Việt nhắc CHROME_PATH', () => {
    expect(findChrome({}, 'darwin', none)).toBeNull()
    expect(findChrome({}, 'aix', () => true)).toBeNull()
    expect(CHROME_MISSING_MESSAGE).toMatch(/CHROME_PATH/)
    expect(CHROME_MISSING_MESSAGE).toMatch(/Không tìm thấy Chrome/)
  })
})

describe('layout:check — layoutProblems', () => {
  it('số đo chuẩn ở cả 5 bề rộng → đạt', () => {
    for (const { width, height } of WIDTHS) expect(layoutProblems(width, good(width, height))).toEqual([])
  })

  it('điện thoại 375: main 375px (w-full, ≤ 448), bottom nav, padding đáy 88px', () => {
    expect(layoutProblems(375, good(375))).toEqual([])
    expect(layoutProblems(375, { ...good(375), mainPaddingBottom: 24 })).toEqual([expect.stringMatching(/padding đáy/)])
  })

  it('cuộn ngang ở bất kỳ bề rộng nào → lỗi', () => {
    for (const width of [375, 1280])
      expect(layoutProblems(width, { ...good(width), scrollWidth: width + 12 })).toEqual([
        expect.stringMatching(/cuộn ngang/),
      ])
  })

  it('không đúng một nav → lỗi', () => {
    const m = good(1280)
    expect(layoutProblems(1280, { ...m, navs: [...m.navs, { top: 736, bottom: 800 }] })).toContainEqual(
      expect.stringMatching(/2 nav/),
    )
    expect(layoutProblems(375, { ...good(375), navs: [] })).toContainEqual(expect.stringMatching(/0 nav/))
  })

  it('1023: TopBar hiện hoặc main 768 → lỗi; main phải 448', () => {
    expect(layoutProblems(1023, { ...good(1023), topBarVisible: true })).toContainEqual(
      expect.stringMatching(/TopBar hiện/),
    )
    expect(layoutProblems(1023, { ...good(1023), mainWidth: 768, mainLeft: 127.5 })).toContainEqual(
      expect.stringMatching(/main rộng 768px \(cần 448px\)/),
    )
  })

  it('1024: main 448 (chưa đổi), BottomNav thay TopBar, padding 88 → lỗi', () => {
    const problems = layoutProblems(1024, {
      ...good(1024),
      mainWidth: 448,
      mainLeft: 288,
      mainPaddingBottom: 88,
      topBarVisible: false,
      navs: [{ top: 704, bottom: 768 }],
    })
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/TopBar không hiện/),
        expect.stringMatching(/main rộng 448px \(cần 768px\)/),
        expect.stringMatching(/padding đáy main 88px \(cần 24px\)/),
      ]),
    )
  })

  it('main lệch khỏi giữa → lỗi', () => {
    expect(layoutProblems(1920, { ...good(1920), mainLeft: 0 })).toEqual([expect.stringMatching(/không nằm giữa/)])
  })

  it('TopBar không dính khi cuộn 600px → lỗi', () => {
    expect(layoutProblems(1280, { ...good(1280), topBarTopAfterScroll: -56 })).toEqual([
      expect.stringMatching(/không dính/),
    ])
  })

  it('link sâu: đầu đoạn dưới đáy TopBar → đạt; bị che → lỗi', () => {
    expect(layoutProblems(1280, { ...good(1280), deepLinkTop: 68 })).toEqual([])
    expect(layoutProblems(1280, { ...good(1280), deepLinkTop: 16 })).toEqual([
      expect.stringMatching(/link sâu bị TopBar che/),
    ])
  })

  it('link sâu không cuộn tới (đầu đoạn xa dưới TopBar, trang còn cuộn được) → lỗi; đã cuộn hết cỡ → đạt', () => {
    expect(layoutProblems(1280, { ...good(1280), deepLinkTop: 500 })).toEqual([
      expect.stringMatching(/link sâu không cuộn tới đoạn/),
    ])
    expect(layoutProblems(1280, { ...good(1280), deepLinkTop: 500, deepLinkAtScrollEnd: true })).toEqual([])
    // Đoạn có scroll-mt-4 (16px): đích là 56 + 12 + 16 = 84px.
    expect(layoutProblems(1280, { ...good(1280), deepLinkTop: 84, deepLinkScrollMargin: 16 })).toEqual([])
    expect(layoutProblems(1280, { ...good(1280), deepLinkTop: 84 })).toEqual([
      expect.stringMatching(/link sâu không cuộn tới đoạn/),
    ])
  })

  it('TopBar dính không đo được (trang ngắn, null) → không báo lỗi theo route', () => {
    expect(layoutProblems(1280, { ...good(1280), topBarTopAfterScroll: null })).toEqual([])
  })

  it('dưới 1024: bottom nav không sát cạnh dưới viewport → lỗi', () => {
    expect(layoutProblems(1023, { ...good(1023, 768), navs: [{ top: 0, bottom: 64 }] })).toEqual([
      expect.stringMatching(/sát cạnh dưới/),
    ])
  })

  it("route 'wide': từ 1024 main = min(1024, innerWidth); dưới 1024 vẫn 448", () => {
    const wide = (width: number) => {
      const mainWidth = Math.min(1024, width)
      return { ...good(width), mainWidth, mainLeft: (width - mainWidth) / 2 }
    }
    for (const width of [1024, 1280, 1920]) expect(layoutProblems(width, wide(width), 'wide')).toEqual([])
    expect(layoutProblems(1280, good(1280), 'wide')).toContainEqual(expect.stringMatching(/main rộng 768px \(cần 1024px\)/))
    expect(layoutProblems(375, good(375), 'wide')).toEqual([])
  })

  it('TopBar sai chiều cao hoặc nav không nằm trong TopBar → lỗi', () => {
    expect(layoutProblems(1280, { ...good(1280), topBarHeight: 64, navs: [{ top: 0, bottom: 64 }] })).toContainEqual(
      expect.stringMatching(/TopBar cao 64px/),
    )
    expect(layoutProblems(1280, { ...good(1280), navs: [{ top: 736, bottom: 800 }] })).toEqual([
      expect.stringMatching(/nav không nằm trong TopBar/),
    ])
  })
})
