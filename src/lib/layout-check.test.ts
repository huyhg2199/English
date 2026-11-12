import { describe, expect, it } from 'vitest'

import {
  CHROME_MISSING_MESSAGE,
  EXPECTED,
  findChrome,
  GRID_LANDMARKS,
  HOTKEY_PROBE,
  hotkeyProblems,
  layoutProblems,
  parseCheckArgs,
  RAIL_LANDMARKS,
  ROUTES,
  WIDE_ROUTES,
  WIDTHS,
  type HotkeyProbe,
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
    railCount: 0,
    rails: null,
    railLandmark: null,
  }
}

/** Số đo đạt chuẩn của route `wide` (story 30): main min(1024, innerWidth), một cột phụ dính ở 56 + 16 = 72px. */
function goodWide(width: number, height = 800): LayoutMetrics {
  const base = good(width, height)
  if (width < 1024) return base
  const mainWidth = Math.min(1024, width)
  return {
    ...base,
    mainWidth,
    mainLeft: (width - mainWidth) / 2,
    railCount: 1,
    rails: [{ top: 72, height: 400, containerBottom: 1500 }],
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
    expect(ROUTES).toContain('/practice/tense-map')
    expect(ROUTES).toHaveLength(13)
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
    for (const width of [1024, 1280, 1920])
      expect(layoutProblems(width, { ...wide(width), railCount: 1 }, 'wide')).toEqual([])
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

describe('layout:check — cột phụ hai cột (story 30)', () => {
  it('WIDE_ROUTES: Hôm nay, Lộ trình (story 31), bài, link sâu, viên gạch, buổi học, Bản đồ thì (story 42); mốc dính 16px', () => {
    expect([...WIDE_ROUTES].sort()).toEqual(
      [
        '/',
        '/roadmap',
        '/foundation/F01',
        '/roadmap/lesson/s1-t1-w1',
        '/roadmap/lesson/s1-t1-w1/vocabulary',
        '/session',
        '/practice/tense-map',
      ].sort(),
    )
    expect(EXPECTED.railStickyOffset).toBe(16)
  })

  it('route wide chuẩn ở 1024/1280/1920 → đạt; 375/1023 không cần cột phụ', () => {
    for (const { width, height } of WIDTHS) expect(layoutProblems(width, goodWide(width, height), 'wide')).toEqual([])
  })

  it('cột phụ ở top 72 sau khi cuộn → đạt', () => {
    expect(layoutProblems(1280, goodWide(1280), 'wide')).toEqual([])
  })

  it('cột phụ ở top 20 mà khung cha còn đủ chỗ → "cột phụ không dính"', () => {
    const m = { ...goodWide(1280), rails: [{ top: 20, height: 400, containerBottom: 1500 }] }
    expect(layoutProblems(1280, m, 'wide')).toEqual([expect.stringMatching(/cột phụ không dính: top 20px/)])
  })

  it('cột phụ ở top 20 nhưng khung cha đã hết chỗ (đáy < 72 + cao) → đạt (bỏ qua)', () => {
    const m = { ...goodWide(1280), rails: [{ top: 20, height: 400, containerBottom: 420 }] }
    expect(layoutProblems(1280, m, 'wide')).toEqual([])
  })

  it('nhiều cột phụ (buổi học: stepper + lý thuyết của viên) → kiểm từng cột', () => {
    const m = {
      ...goodWide(1280),
      railCount: 2,
      rails: [
        { top: 72, height: 300, containerBottom: 1500 },
        { top: -200, height: 300, containerBottom: 1400 },
      ],
    }
    expect(layoutProblems(1280, m, 'wide')).toEqual([expect.stringMatching(/cột phụ không dính/)])
  })

  it('cột phụ chưa tới mốc dính (trang mới cuộn ít, top > 72) → đạt', () => {
    const m = { ...goodWide(1280), rails: [{ top: 300, height: 400, containerBottom: 1500 }] }
    expect(layoutProblems(1280, m, 'wide')).toEqual([])
  })

  it('route wide ở 1280 không có [data-split-rail] nào hiện → "thiếu cột phụ"', () => {
    const m = { ...goodWide(1280), railCount: 0, rails: [] }
    expect(layoutProblems(1280, m, 'wide')).toEqual([expect.stringMatching(/thiếu cột phụ/)])
  })

  it('/session có cột phụ (Lý thuyết của viên) nhưng stepper dọc không hiện → "thiếu nội dung cột phụ"', () => {
    const selector = RAIL_LANDMARKS['/session']
    expect(selector).toContain('Các phần của buổi')
    const m = { ...goodWide(1280), railCount: 1, railLandmark: { selector, visible: false } }
    expect(layoutProblems(1280, m, 'wide')).toEqual([expect.stringMatching(/thiếu nội dung cột phụ: .*Các phần của buổi/)])
    expect(layoutProblems(1280, { ...m, railLandmark: { selector, visible: true } }, 'wide')).toEqual([])
  })

  it('dưới 1024px phần cột phụ ẩn là đúng → không kiểm', () => {
    const selector = RAIL_LANDMARKS['/session']
    expect(layoutProblems(1023, { ...goodWide(1023), railLandmark: { selector, visible: false } }, 'wide')).toEqual([])
  })

  it('RAIL_LANDMARKS chỉ gồm route wide', () => {
    for (const route of Object.keys(RAIL_LANDMARKS)) expect(WIDE_ROUTES).toContain(route)
  })

  it('route default không cần cột phụ; trang không cuộn được (rails null) → không kiểm dính', () => {
    expect(layoutProblems(1280, good(1280))).toEqual([])
    expect(layoutProblems(1280, { ...goodWide(1280), rails: null }, 'wide')).toEqual([])
  })
})

describe('layout:check — lưới 2 cột Hôm nay / Lộ trình (story 31)', () => {
  /** Route `wide` không có cột phụ mà có lưới `columns` cột. */
  const gridded = (width: number, columns: number | null): LayoutMetrics => ({
    ...goodWide(width),
    railCount: 0,
    rails: null,
    grid: columns === null ? null : { selector: GRID_LANDMARKS['/'], columns },
  })

  it('GRID_LANDMARKS: Hôm nay, Lộ trình và Bản đồ thì (story 42), đều là route wide', () => {
    expect(GRID_LANDMARKS).toEqual({
      '/': 'main > section',
      '/roadmap': 'main section[aria-labelledby^="stage-"]',
      '/practice/tense-map': 'main > section',
    })
    for (const route of Object.keys(GRID_LANDMARKS)) expect(WIDE_ROUTES).toContain(route)
  })

  it('route wide có lưới 2 cột (không cột phụ) ở 1024/1280/1920 → đạt', () => {
    for (const width of [1024, 1280, 1920]) expect(layoutProblems(width, gridded(width, 2), 'wide')).toEqual([])
  })

  it('lưới chỉ có 1 cột ở máy tính → "lưới chỉ có 1 cột"', () => {
    expect(layoutProblems(1280, gridded(1280, 1), 'wide')).toEqual([expect.stringMatching(/lưới chỉ có 1 cột: main > section/)])
  })

  it('không cột phụ và không lưới → "thiếu cột phụ" (như story 30)', () => {
    expect(layoutProblems(1280, gridded(1280, null), 'wide')).toEqual([expect.stringMatching(/thiếu cột phụ/)])
    // Số đo cũ (story 30) không có trường `grid`.
    expect(layoutProblems(1280, { ...goodWide(1280), railCount: 0, rails: null }, 'wide')).toEqual([
      expect.stringMatching(/thiếu cột phụ/),
    ])
  })

  it('dưới 1024px lưới một cột là đúng → không kiểm', () => {
    expect(layoutProblems(375, { ...good(375), grid: { selector: 'main > section', columns: 1 } }, 'wide')).toEqual([])
    expect(layoutProblems(1023, { ...good(1023, 768), grid: { selector: 'main > section', columns: 1 } }, 'wide')).toEqual([])
  })
})

describe('layout:check — thử phím tắt (story 31)', () => {
  const pass: HotkeyProbe = {
    brick: {
      screenAfterEnter: 'Màn 4/6',
      screenAfterTyping: 'Màn 4/6',
      typingGraded: true,
      checkScreen: 'Màn 5/6',
      hiddenCheckState: 'answering',
      checkStateAfterKey: 'answered',
    },
    session: { stepAfterRight: 1, stepAfterLeft: 0 },
    quiz: { answeredAfterKey: true, headingAfterEnter: 'Câu 2/8' },
    notebook: { searchValue: 'chào', hashBefore: '#/notebook', hashAfter: '#/notebook', scrollBefore: 120, scrollAfter: 120 },
  }

  it('probe đúng → đạt; số liệu probe ở 1280×800', () => {
    expect(hotkeyProblems(pass)).toEqual([])
    expect(HOTKEY_PROBE).toMatchObject({ width: 1280, height: 800, brickRoute: '/foundation/F01', brickScreen: 'Màn 4/6' })
  })

  it('F01 sau Enter vẫn "Màn 1/6" → lỗi', () => {
    expect(hotkeyProblems({ ...pass, brick: { ...pass.brick, screenAfterEnter: 'Màn 1/6' } })).toEqual([
      expect.stringMatching(/F01: bấm Enter 3 lần nhưng đang ở "Màn 1\/6"/),
    ])
  })

  it('F01 gõ trong ô làm đổi màn hoặc không chấm → lỗi', () => {
    expect(hotkeyProblems({ ...pass, brick: { ...pass.brick, screenAfterTyping: 'Màn 5/6' } })).toEqual([
      expect.stringMatching(/F01: gõ "xyz 1" \+ Enter trong ô làm đổi màn: "Màn 5\/6"/),
    ])
    expect(hotkeyProblems({ ...pass, brick: { ...pass.brick, typingGraded: false } })).toEqual([
      expect.stringMatching(/không chấm/),
    ])
  })

  it('F01 màn luyện tập: Enter không sang màn 5, phần ẩn nhận phím 1, hoặc phím 1 không chọn → lỗi', () => {
    expect(hotkeyProblems({ ...pass, brick: { ...pass.brick, checkScreen: 'Màn 4/6' } })).toEqual([
      expect.stringMatching(/F01: bấm Enter ở màn 4 nhưng đang ở "Màn 4\/6" \(cần "Màn 5\/6"\)/),
    ])
    expect(hotkeyProblems({ ...pass, brick: { ...pass.brick, hiddenCheckState: 'answered' } })).toEqual([
      expect.stringMatching(/F01: bấm 1 khi phần luyện tập đang ẩn .* đã bị trả lời/),
    ])
    expect(hotkeyProblems({ ...pass, brick: { ...pass.brick, checkStateAfterKey: 'answering' } })).toEqual([
      expect.stringMatching(/F01: bấm 1 ở màn luyện tập không chọn đáp án/),
    ])
  })

  it('kiểm tra hàng A: phím 2 không chọn hoặc Enter không sang câu 2 → lỗi', () => {
    expect(HOTKEY_PROBE.quizRoute).toBe('/foundation/kiem-tra/A')
    expect(hotkeyProblems({ ...pass, quiz: { answeredAfterKey: false, headingAfterEnter: null } })).toEqual([
      expect.stringMatching(/kiem-tra\/A: bấm 2 không chọn đáp án câu 1/),
    ])
    expect(hotkeyProblems({ ...pass, quiz: { answeredAfterKey: true, headingAfterEnter: 'Câu 1/8' } })).toEqual([
      expect.stringMatching(/bấm Enter sau khi chọn không sang câu 2 \(đang ở "Câu 1\/8"\)/),
    ])
  })

  it('/session → không đổi bước, ← không về → mỗi trường hợp một lỗi', () => {
    expect(hotkeyProblems({ ...pass, session: { stepAfterRight: 0, stepAfterLeft: 0 } })).toEqual([
      expect.stringMatching(/\/session: bấm → không sang bước 2/),
    ])
    expect(hotkeyProblems({ ...pass, session: { stepAfterRight: 1, stepAfterLeft: 1 } })).toEqual([
      expect.stringMatching(/\/session: bấm ← không về bước 1/),
    ])
  })

  it('ô tìm kiếm Sổ tay ≠ "chào", hash đổi hoặc trang cuộn → mỗi trường hợp một lỗi', () => {
    expect(hotkeyProblems({ ...pass, notebook: { ...pass.notebook, searchValue: 'chao' } })).toEqual([
      expect.stringMatching(/ô có "chao"/),
    ])
    expect(hotkeyProblems({ ...pass, notebook: { ...pass.notebook, hashAfter: '#/practice' } })).toEqual([
      expect.stringMatching(/đổi trang \(#\/notebook → #\/practice\)/),
    ])
    expect(hotkeyProblems({ ...pass, notebook: { ...pass.notebook, scrollAfter: 520 } })).toEqual([
      expect.stringMatching(/làm cuộn trang/),
    ])
  })

  it('bước không chạy được → lỗi tiếng Việt kèm lý do', () => {
    const broken: HotkeyProbe = {
      brick: { ...pass.brick, error: 'không thấy ô "Từ còn thiếu"' },
      session: { ...pass.session, error: 'x' },
      quiz: { ...pass.quiz, error: 'z' },
      notebook: { ...pass.notebook, error: 'y' },
    }
    expect(hotkeyProblems(broken)).toEqual([
      expect.stringMatching(/^F01: không thử được phím: không thấy ô/),
      expect.stringMatching(/^\/foundation\/kiem-tra\/A: không thử được phím: z/),
      expect.stringMatching(/^\/session: không thử được phím/),
      expect.stringMatching(/^\/notebook: không thử được phím/),
    ])
  })
})
