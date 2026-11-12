// Logic thuần của `npm run layout:check` (story 29): danh sách bề rộng/route, đọc tham số, tìm Chrome và chấm số đo bố cục.
// Phần chạy Chrome/vite ở check.mjs.

/** Mốc máy tính = Tailwind `lg` (64rem). */
export const LG_MIN_WIDTH = 1024

export const WIDTHS = [
  { width: 375, height: 812 },
  { width: 1023, height: 768 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
]

export const ROUTES = [
  '/',
  '/roadmap',
  '/roadmap/lesson/s1-t1-w1',
  '/foundation',
  '/foundation/F01',
  '/session',
  '/practice',
  '/practice/flashcards',
  '/practice/mistakes',
  '/practice/tense-map',
  '/notebook',
  '/trophies',
  '/backup',
]

/**
 * Route trong ROUTES (hoặc DEEP_LINK) có `handle: { layout: 'wide' }` (story 30–31). Test `route-handle.test.ts` so danh sách
 * này với `layoutFor` của cây routes, nên gắn `wide` cho route mà quên sửa ở đây thì `npm test` đỏ.
 */
export const WIDE_ROUTES = [
  '/',
  '/roadmap',
  '/roadmap/lesson/s1-t1-w1',
  '/roadmap/lesson/s1-t1-w1/vocabulary',
  '/foundation/F01',
  '/session',
  '/practice/tense-map',
]

/**
 * Phần phải có trong cột phụ đang hiện của route `wide` (story 30). `railCount` chỉ đếm `[data-split-rail]`: ở `/session` cột
 * "Lý thuyết của viên" cũng là cột phụ, nên mất stepper dọc (chỗ duy nhất có nút Tiếp/Xong buổi từ lg) vẫn đạt nếu không kiểm.
 */
export const RAIL_LANDMARKS = {
  '/session': '[data-split-rail] ol[aria-label="Các phần của buổi"]',
  '/roadmap/lesson/s1-t1-w1': '[data-split-rail] nav[aria-label="Mục lục bài"]',
  '/roadmap/lesson/s1-t1-w1/vocabulary': '[data-split-rail] nav[aria-label="Mục lục bài"]',
}

/**
 * Lưới 2 cột của route `wide` không có cột phụ (story 31, 42): phần tử khớp đầu tiên; số cột = số giá trị `left` (làm tròn) khác
 * nhau của các con trực tiếp đang hiện. Lộ trình: lưới nằm trong mỗi chặng (thẻ chặng trải 2 cột, các tháng xếp 2 cột).
 */
export const GRID_LANDMARKS = {
  '/': 'main > section',
  '/roadmap': 'main section[aria-labelledby^="stage-"]',
  // Bản đồ thì (story 42): đầu trang trải 2 cột, mỗi tháng một ô.
  '/practice/tense-map': 'main > section',
}

/** Route tĩnh dưới AppShell cố ý không đo (màn phụ cần dữ liệu riêng hoặc chỉ là luồng một lần). Test kiểm cây routes. */
export const UNCHECKED_ROUTES = [
  '/session/lazy',
  '/welcome',
  '/sorting-hat',
  '/do-trinh-do',
  '/foundation/soat-ve',
  '/foundation/qua-buc-tuong',
  '/practice/owl',
  '/owl-post',
]

/** Link sâu đo ở bề rộng máy tính: đầu đoạn `vocabulary` phải nằm dưới đáy TopBar. */
export const DEEP_LINK = { route: '/roadmap/lesson/s1-t1-w1/vocabulary', sectionId: 'vocabulary' }

/** Số đo mong đợi (px, CSS). */
export const EXPECTED = {
  mobileMainMax: 448, // max-w-md
  desktopMain: 768, // lg:max-w-3xl
  desktopWideMax: 1024, // lg:max-w-5xl (w-full nên ≤ innerWidth)
  mobilePaddingBottom: 64 + 24, // --nav-height 4rem + 1.5rem
  desktopPaddingBottom: 24, // --nav-height 0px + 1.5rem
  topBarHeight: 56, // --topbar-height 3.5rem
  deepLinkGap: 12, // scroll-padding-top = --topbar-height + 0.75rem
  railStickyOffset: 16, // SplitRail: lg:top-[calc(var(--topbar-height)+1rem)]
}

const TOLERANCE = 0.5

/**
 * `--base <ref>` (mặc định HEAD), `--skip-diff` (không so ảnh 375px với bản gốc), `--out <thư mục>` (nơi lưu ảnh).
 * Ném Error (tiếng Việt) khi tham số sai.
 * @returns {{ base: string, skipDiff: boolean, out: string | null }}
 */
export function parseCheckArgs(argv) {
  const args = { base: 'HEAD', skipDiff: false, out: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--skip-diff') args.skipDiff = true
    else if (arg === '--base' || arg === '--out') {
      const value = argv[i + 1]
      if (!value || value.startsWith('--')) throw new Error(`Thiếu giá trị cho ${arg}.`)
      if (arg === '--base') args.base = value
      else args.out = value
      i++
    } else throw new Error(`Không hiểu tham số "${arg}". Dùng: --base <ref> --skip-diff --out <thư mục>.`)
  }
  return args
}

const DEFAULT_CHROME = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
}

/**
 * Đường dẫn Chrome: `CHROME_PATH` nếu đặt (phải tồn tại), không thì thử đường dẫn mặc định theo hệ điều hành.
 * @returns {string | null}
 */
export function findChrome(env, platform, exists) {
  const custom = env.CHROME_PATH?.trim()
  if (custom) return exists(custom) ? custom : null
  return (DEFAULT_CHROME[platform] ?? []).find((candidate) => exists(candidate)) ?? null
}

export const CHROME_MISSING_MESSAGE = [
  'Không tìm thấy Chrome để chạy layout:check.',
  'Đặt biến CHROME_PATH trỏ tới file chạy Chrome/Chromium, ví dụ:',
  '  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run layout:check',
].join('\n')

const near = (a, b) => Math.abs(a - b) <= TOLERANCE
const px = (n) => `${Math.round(n * 10) / 10}px`

/**
 * Chấm số đo của một route ở một bề rộng. Trả danh sách lỗi tiếng Việt (rỗng = đạt).
 * @param {number} width bề rộng viewport đang thử
 * @param {import('./check-lib.d.mts').LayoutMetrics} m
 * @param {'default' | 'wide'} [layout] `handle.layout` của route (xem WIDE_ROUTES)
 */
export function layoutProblems(width, m, layout = 'default') {
  const problems = []
  const desktop = width >= LG_MIN_WIDTH

  if (m.scrollWidth > m.innerWidth) problems.push(`cuộn ngang: scrollWidth ${px(m.scrollWidth)} > ${px(m.innerWidth)}`)

  if (m.navs.length !== 1) problems.push(`có ${m.navs.length} nav "Điều hướng chính" đang hiện (cần đúng 1)`)
  const nav = m.navs[0]

  if (desktop) {
    if (!m.topBarVisible) problems.push('TopBar không hiện')
    else {
      if (!near(m.topBarHeight, EXPECTED.topBarHeight))
        problems.push(`TopBar cao ${px(m.topBarHeight)} (cần ${px(EXPECTED.topBarHeight)})`)
      if (m.topBarTopAfterScroll !== null && !near(m.topBarTopAfterScroll, 0))
        problems.push(`TopBar không dính khi cuộn: top = ${px(m.topBarTopAfterScroll)}`)
      if (nav && (nav.top < -TOLERANCE || nav.bottom > m.topBarHeight + TOLERANCE))
        problems.push(`nav không nằm trong TopBar (top ${px(nav.top)}, bottom ${px(nav.bottom)})`)
      if (m.deepLinkTop !== null && m.deepLinkTop < m.topBarHeight - TOLERANCE)
        problems.push(`link sâu bị TopBar che: đầu đoạn ở ${px(m.deepLinkTop)} < ${px(m.topBarHeight)}`)
      // Trang còn cuộn được mà đầu đoạn vẫn nằm xa dưới TopBar: scrollIntoView / scroll-padding không chạy.
      // Đích = đáy TopBar + 0.75rem (scroll-padding-top) + scroll-margin-top của đoạn (vd `scroll-mt-4`).
      const deepLinkTarget = m.topBarHeight + EXPECTED.deepLinkGap + m.deepLinkScrollMargin
      if (m.deepLinkTop !== null && !m.deepLinkAtScrollEnd && m.deepLinkTop > deepLinkTarget + 1)
        problems.push(`link sâu không cuộn tới đoạn: đầu đoạn ở ${px(m.deepLinkTop)} (cần ${px(deepLinkTarget)})`)
    }
  } else {
    if (m.topBarVisible) problems.push('TopBar hiện dưới 1024px')
    if (nav && !near(nav.bottom, m.innerHeight))
      problems.push(`bottom nav không sát cạnh dưới (bottom ${px(nav.bottom)}, viewport ${px(m.innerHeight)})`)
  }

  // Bố cục hai cột (story 30–31): route `wide` phải có cột phụ hiện hoặc lưới ≥ 2 cột (Hôm nay, Lộ trình); cột phụ dính ngay
  // dưới TopBar + 1rem khi cuộn, trừ khi khung cha (lưới SplitLayout) đã hết chỗ (đáy khung cao hơn chỗ dính + chiều cao cột
  // thì cột bị đẩy lên là đúng).
  const grid = m.grid ?? null
  if (desktop && layout === 'wide' && m.railCount === 0 && !grid)
    problems.push('thiếu cột phụ: không có [data-split-rail] nào hiện')
  if (desktop && grid && grid.columns < 2) problems.push(`lưới chỉ có ${grid.columns} cột: ${grid.selector}`)
  if (desktop && m.railLandmark && !m.railLandmark.visible)
    problems.push(`thiếu nội dung cột phụ: không thấy ${m.railLandmark.selector}`)
  if (desktop && m.rails) {
    const stickyTop = m.topBarHeight + EXPECTED.railStickyOffset
    for (const rail of m.rails) {
      if (rail.containerBottom < stickyTop + rail.height) continue
      if (rail.top < stickyTop - TOLERANCE)
        problems.push(`cột phụ không dính: top ${px(rail.top)} sau khi cuộn (cần ≥ ${px(stickyTop)})`)
    }
  }

  const desktopMain = layout === 'wide' ? Math.min(EXPECTED.desktopWideMax, m.innerWidth) : EXPECTED.desktopMain
  const mainWidth = desktop ? desktopMain : Math.min(EXPECTED.mobileMainMax, m.innerWidth)
  if (!near(m.mainWidth, mainWidth)) problems.push(`main rộng ${px(m.mainWidth)} (cần ${px(mainWidth)})`)
  const left = (m.innerWidth - m.mainWidth) / 2
  if (Math.abs(m.mainLeft - left) > 1) problems.push(`main không nằm giữa (left ${px(m.mainLeft)}, cần ${px(left)})`)

  const padding = desktop ? EXPECTED.desktopPaddingBottom : EXPECTED.mobilePaddingBottom
  if (!near(m.mainPaddingBottom, padding))
    problems.push(`padding đáy main ${px(m.mainPaddingBottom)} (cần ${px(padding)})`)

  return problems
}

/**
 * Chấm kết quả thử phím tắt ở 1280px (story 31). Trả danh sách lỗi tiếng Việt (rỗng = đạt).
 * @param {import('./check-lib.d.mts').HotkeyProbe} probe
 */
export function hotkeyProblems(probe) {
  const problems = []
  const { brick, session, quiz, notebook } = probe

  if (brick.error) problems.push(`F01: không thử được phím: ${brick.error}`)
  else {
    if (brick.screenAfterEnter !== HOTKEY_PROBE.brickScreen)
      problems.push(`F01: bấm Enter 3 lần nhưng đang ở "${brick.screenAfterEnter ?? '?'}" (cần "${HOTKEY_PROBE.brickScreen}")`)
    else {
      if (brick.screenAfterTyping !== HOTKEY_PROBE.brickScreen)
        problems.push(`F01: gõ "${HOTKEY_PROBE.brickTyped}" + Enter trong ô làm đổi màn: "${brick.screenAfterTyping ?? '?'}"`)
      if (!brick.typingGraded)
        problems.push(`F01: gõ "${HOTKEY_PROBE.brickTyped}" + Enter trong ô không chấm (không thấy "Chưa đúng")`)
      if (brick.checkScreen !== HOTKEY_PROBE.checkScreen)
        problems.push(`F01: bấm Enter ở màn 4 nhưng đang ở "${brick.checkScreen ?? '?'}" (cần "${HOTKEY_PROBE.checkScreen}")`)
      else {
        if (brick.hiddenCheckState !== 'answering')
          problems.push(`F01: bấm 1 khi phần luyện tập đang ẩn (màn 4) mà câu luyện tập ${checkStateLabel(brick.hiddenCheckState)}`)
        else if (brick.checkStateAfterKey !== 'answered')
          problems.push(`F01: bấm 1 ở màn luyện tập không chọn đáp án (câu ${checkStateLabel(brick.checkStateAfterKey)})`)
      }
    }
  }

  if (quiz.error) problems.push(`${HOTKEY_PROBE.quizRoute}: không thử được phím: ${quiz.error}`)
  else {
    if (!quiz.answeredAfterKey) problems.push(`${HOTKEY_PROBE.quizRoute}: bấm 2 không chọn đáp án câu 1`)
    else if (!/^Câu 2\//.test(quiz.headingAfterEnter ?? ''))
      problems.push(`${HOTKEY_PROBE.quizRoute}: bấm Enter sau khi chọn không sang câu 2 (đang ở "${quiz.headingAfterEnter ?? '?'}")`)
  }

  if (session.error) problems.push(`/session: không thử được phím: ${session.error}`)
  else {
    if (session.stepAfterRight !== 1)
      problems.push(`/session: bấm → không sang bước 2 (bước hiện tại: ${stepLabel(session.stepAfterRight)})`)
    if (session.stepAfterLeft !== 0)
      problems.push(`/session: bấm ← không về bước 1 (bước hiện tại: ${stepLabel(session.stepAfterLeft)})`)
  }

  if (notebook.error) problems.push(`/notebook: không thử được phím: ${notebook.error}`)
  else {
    if (notebook.searchValue !== HOTKEY_PROBE.searchText)
      problems.push(`/notebook: gõ "${HOTKEY_PROBE.searchText}" vào ô tìm kiếm nhưng ô có "${notebook.searchValue ?? ''}"`)
    if (notebook.hashAfter !== notebook.hashBefore)
      problems.push(`/notebook: gõ vào ô tìm kiếm làm đổi trang (${notebook.hashBefore} → ${notebook.hashAfter})`)
    if (Math.abs(notebook.scrollAfter - notebook.scrollBefore) > TOLERANCE)
      problems.push(`/notebook: gõ vào ô tìm kiếm làm cuộn trang (${px(notebook.scrollBefore)} → ${px(notebook.scrollAfter)})`)
  }
  return problems
}

const stepLabel = (index) => (index === null ? 'không rõ' : String(index + 1))

const checkStateLabel = (state) =>
  state === 'answered' ? 'đã bị trả lời' : state === 'answering' ? 'chưa được trả lời' : 'không thấy'

/** Số liệu của bước thử phím (check.mjs dùng chung với hotkeyProblems). */
export const HOTKEY_PROBE = {
  width: 1280,
  height: 800,
  brickRoute: '/foundation/F01',
  /** Enter ×3 từ màn 1 → màn ví dụ một chỗ trống. */
  brickScreen: 'Màn 4/6',
  brickTyped: 'chào 1',
  /** Bỏ focus ô rồi Enter ở màn 4 → màn luyện tập (câu đầu là `choice`). */
  checkScreen: 'Màn 5/6',
  /** Kiểm tra hàng A: `QuestionCard` từ dữ liệu sạch. */
  quizRoute: '/foundation/kiem-tra/A',
  sessionRoute: '/session',
  notebookRoute: '/notebook',
  searchText: 'chào',
}
