---
title: 'Khung máy tính D1: thanh trên cùng, cột rộng hơn, script giữ 375px (SPEC Constraints, stack.md UI)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '49ddc609e8064327f7185acc8daddf1b82e03b74'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Máy tính (câu 4):** Huy chọn phương án tối giản. Từ 1024px trở lên dùng thanh điều hướng trên cùng, dưới 1024px vẫn là bottom nav. Cột nội dung nằm giữa và rộng hơn. Hai cột cho Viên gạch / Bài học / Buổi học là story 30, phím tắt là story 31. Thanh bên trái để sau. Story này chỉ làm khung (D1).
- **Kiểm tra cả 4 hàng trước, nhịp 1 viên/buổi, mốc 750 (câu 1–3):** story này không đụng Sân ga, Soát vé, buổi học, lịch hay dữ liệu store.
- Claude chọn:
  - **Mốc chuyển:** Tailwind `lg` = `64rem` (1024px). Khối CSS dùng `@media (min-width: 64rem)`, khớp đúng `lg:`.
  - **TopBar:** dính trên cùng, cao `--topbar-height` = 3.5rem. Bên trái là chữ "Lumos" (link về `/`). Ở giữa là 5 mục lấy từ `NAV_ITEMS` theo đúng thứ tự, mỗi mục có icon và nhãn, mục sáng theo `isNavItemActive` (có `aria-current="page"`). Bên phải là `SyncBadge variant="inline"`. `<nav aria-label="Điều hướng chính">` giống BottomNav. Phần bên trong rộng tối đa `max-w-5xl`.
  - **Cột nội dung:** `main` giữ `max-w-md` và thêm class theo `handle.layout`. `default` = `lg:max-w-3xl` (768px), `wide` = `lg:max-w-5xl`. Story này định nghĩa sẵn `wide` nhưng **chưa route nào dùng**. Mỗi trang chỉ chuyển sang `wide` cùng lúc với bố cục hai cột của nó: Bài học, Buổi học, Viên gạch ở story 30, Hôm nay và Lộ trình ở story 31. Lý do: chữ một cột kéo dài 1024px rất khó đọc.
  - **`body { overflow-x: clip }`** chỉ đặt trong khối 64rem. Dưới 1024px CSS giữ nguyên `hidden`.
  - **Biến thể `pointer-fine`** (`@media (pointer: fine)`) được định nghĩa sẵn cho story 31, story này chưa dùng.
  - **SyncBadge:** `strip` (mặc định) là dải cũ, thêm `lg:hidden`. `inline` chỉ render nút + Sheet, không có div bọc, để không thêm class mới không tiền tố.
  - **Manifest** đặt `orientation: 'any'`.
  - **Script kiểm** chỉ chạy tay (`npm run layout:guard`, `npm run layout:check`), không đưa vào CI.

**Problem:** Huy học thêm trên laptop, nhưng app chỉ là cột 448px với bottom nav ở cạnh dưới màn hình rộng. SPEC đã đổi luật điều hướng theo mốc 1024px nhưng code chưa làm. Chưa có cách tự động chứng minh giao diện 375px không đổi khi thêm bố cục máy tính.

**Approach:** Thêm TopBar ẩn dưới lg, ẩn BottomNav từ lg, đặt biến CSS trong một khối 64rem, và cho `AppShell` chọn độ rộng cột qua `handle.layout` + `useMatches()`. Thêm 2 script không cần thư viện mới: `mobile-guard` chặn thay đổi class không tiền tố, `check` dùng Chrome headless qua CDP để đo bố cục ở 5 bề rộng và so ảnh 375px với commit gốc.

## Boundaries & Constraints

**Always:**
- Ở 375px (và mọi bề rộng dưới 1024px) giao diện không đổi từng pixel. Code chỉ thêm class có tiền tố `lg:`/`xl:`/`2xl:`/`pointer-fine:`, và không đổi thứ tự DOM của phần đang hiện. DOM mới phải ẩn dưới lg (`hidden lg:block`).
- Mỗi bề rộng chỉ có đúng một `nav[aria-label="Điều hướng chính"]` hiện ra. TopBar dùng lại `NAV_ITEMS` và `isNavItemActive`. `nav-items.ts` và `nav-items.test.ts` giữ nguyên.
- Trang vẫn cuộn trên window, không thêm khung `overflow` riêng (các lệnh `window.scrollTo` / `scrollIntoView` vẫn chạy đúng).
- Từ lg: `--nav-height: 0px` (phải có đơn vị vì nằm trong `calc()`), nên padding đáy của `main`, thanh "Lưu vào Sổ tay" (ReadableText) và thư cú tự hạ xuống. `html { scroll-padding-top }` giúp link sâu không bị TopBar che.
- `layoutFor` và logic của hai script là hàm thuần, có unit test. Script không thêm dependency (không pngjs, pixelmatch, puppeteer hay playwright): dùng `WebSocket` có sẵn của Node 22 và Chrome đã cài. So pixel thì làm bằng canvas trong chính Chrome.

**Never:**
- Không làm thanh bên trái, hai cột, `SplitLayout`, phím tắt hay lưới cho Hôm nay/Lộ trình (story 30–31). Không gắn `layout: 'wide'` cho route nào.
- Không sửa store, schema, sync, dữ liệu bài hay `SignIn.tsx`. Không đổi `sheet.tsx`, `OwlPost.tsx`, `ReadableText.tsx`: chúng vẫn căn giữa viewport.
- Không xoá hay sửa class không tiền tố có sẵn.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Điện thoại | 375×812, mọi route | Ảnh chụp toàn trang trùng từng pixel với commit gốc; chỉ BottomNav hiện; không cuộn ngang | Lệch → script exit 1, lưu ảnh gốc/mới/diff |
| Ngay dưới mốc | 1023px | BottomNav, `main` rộng 448px, TopBar `display:none` | N/A |
| Đúng mốc | 1024px | TopBar hiện ở top 0, BottomNav ẩn, `main` rộng 768px nằm giữa, padding đáy `main` = 24px | N/A |
| Màn rộng | 1280 / 1920px | Như 1024; `main` vẫn 768px, nằm giữa; không cuộn ngang | N/A |
| Cuộn | 1280px, cuộn 600px | TopBar vẫn ở `top = 0` (sticky) | N/A |
| Link sâu | 1280px, `#/roadmap/lesson/s1-t1-w1/vocabulary` | Đầu đoạn `vocabulary` nằm dưới đáy TopBar | N/A |
| Mục sáng | lg, `/foundation/F01` | "Lộ trình" trên TopBar có `aria-current="page"` | N/A |
| Đồng bộ | lg, đã đăng nhập | Chấm đồng bộ nằm bên phải TopBar, dải cũ ẩn; bấm thì mở Sheet như cũ | Chỉ chạy local: không có chấm ở đâu |
| layoutFor | match không có handle / leaf `wide` / cha `wide` + leaf `default` / giá trị lạ `'huge'` | `default` / `wide` / `default` (match sau cùng có `layout` hợp lệ thắng) / bỏ qua giá trị lạ → `default` | N/A |
| Guard: thêm có tiền tố | thêm `lg:hidden`, `pointer-fine:hover:bg-accent`, `xl:grid` | Không vi phạm | N/A |
| Guard: không tiền tố | thêm `grid`, xoá `px-4`, đổi `max-w-md`→`max-w-lg` | Vi phạm (file, token, thêm/xoá) | exit 1 |
| Guard: file mới | file mới có `mobile-guard: desktop-only` / không có | Bỏ qua / báo mọi token không tiền tố | exit 1 nếu vi phạm |
| Thiếu Chrome | không có `CHROME_PATH`, không thấy Chrome ở đường dẫn mặc định | Báo tiếng Việt cách đặt `CHROME_PATH` | exit 2; dọn worktree và tiến trình |
| Cuộn ngang | `scrollWidth > innerWidth` ở bất kỳ bề rộng nào | Báo route + bề rộng | exit 1 |

</frozen-after-approval>

## Code Map

- `src/app/AppShell.tsx` -- khung: dải SyncBadge, `main.max-w-md` (padding đáy theo `--nav-height`), OwlPost, BottomNav. Chỗ gắn TopBar và độ rộng cột.
- `src/app/nav-items.ts` -- `NAV_ITEMS`, `isNavItemActive`. Chỉ dùng lại, không sửa.
- `src/app/routes.tsx` -- `RouteObject[]` dưới `AppShell`, router hash (`createHashRouter`) nên `useMatches()` dùng được. Story này không thêm handle.
- `src/components/BottomNav.tsx` -- nav cố định đáy, cao `var(--nav-height)`.
- `src/components/SyncBadge.tsx` -- dải `mx-auto max-w-md justify-end` + Sheet. Trả `null` khi không đồng bộ.
- `src/index.css` -- `:root { --nav-height: 4rem }`, `body { overflow-x: hidden }`, `@custom-variant dark`.
- `src/components/ReadableText.tsx:192`, `src/components/trophies/OwlPost.tsx:61`, `src/components/ui/sheet.tsx:27` -- overlay cố định, căn giữa viewport, dùng `--nav-height`. Không sửa.
- `src/pages/Lesson.tsx:85-92` -- `scrollIntoView` theo `sectionId`; nhờ `scroll-padding-top` mà đoạn không bị TopBar che.
- `vite.config.ts` -- manifest `orientation: 'portrait'`; vitest `environment: 'node'`, chỉ chạy `src/**/*.test.ts`.
- `scripts/owl-post/decide.mjs` + `decide.d.mts`, `src/lib/owl-post.test.ts` -- mẫu cho script `.mjs` có logic thuần + `.d.mts` được test từ `src/lib`.
- `.env` (bị gitignore) có thể có biến Supabase. Script chạy `vite` với `VITE_SUPABASE_URL=` và `VITE_SUPABASE_ANON_KEY=` rỗng, vì biến môi trường có sẵn (kể cả rỗng) thắng file `.env`, nên app chạy chỉ local, không có cổng đăng nhập.

## Tasks & Acceptance

**Execution:**
- [x] `src/index.css` -- thêm `@custom-variant pointer-fine (@media (pointer: fine));`, rồi một khối `@media (min-width: 64rem)` gồm: `:root { --nav-height: 0px; --topbar-height: 3.5rem }`, `html { scroll-padding-top: calc(var(--topbar-height) + 0.75rem) }`, `body { overflow-x: clip }`. Không sửa quy tắc nào ngoài khối này.
- [x] `src/app/route-handle.ts` -- `PageLayout = 'default' | 'wide'`, `RouteHandle = { layout?: PageLayout }`, `LAYOUT_CLASS = { default: 'lg:max-w-3xl', wide: 'lg:max-w-5xl' }` (chuỗi đầy đủ để Tailwind quét được), `layoutFor(matches: readonly { handle?: unknown }[]): PageLayout`.
- [x] `src/app/route-handle.test.ts` -- các dòng layoutFor của matrix. Thêm test duyệt cây `routes`: mọi `handle.layout` (nếu có) phải hợp lệ; `/`, `/roadmap`, `/session`, `/roadmap/lesson/s1-t1-w1`, `/foundation/F01` ra `default` (dùng `matchRoutes`).
- [x] `src/components/TopBar.tsx` -- tạo mới theo Decisions. Đầu file có comment `mobile-guard: desktop-only`. Thẻ ngoài: `<header className="sticky top-0 z-40 hidden h-[var(--topbar-height)] border-b bg-card/95 backdrop-blur lg:block">`. Link có `focus-visible:outline`. Mục sáng dùng nền `bg-accent` và ánh nến giống BottomNav.
- [x] `src/components/BottomNav.tsx` -- thêm `lg:hidden` vào `<nav>`, không đổi gì khác.
- [x] `src/components/SyncBadge.tsx` -- prop `variant?: 'strip' | 'inline'`, mặc định `strip`. Wrapper của `strip` thêm `lg:hidden`. `inline` trả Sheet + nút trigger, không có wrapper.
- [x] `src/app/AppShell.tsx` -- render `<TopBar />` làm con đầu tiên của div ngoài. `main` dùng `cn('mx-auto w-full max-w-md flex-1 px-4 pt-4', LAYOUT_CLASS[layoutFor(useMatches())])`. Không đổi gì khác.
- [x] `vite.config.ts` -- manifest `orientation: 'any'`.
- [x] `scripts/layout/guard-lib.mjs` + `guard-lib.d.mts` -- `classTokens(source)` lấy token từ chuỗi trong `className=` và trong lời gọi `cn(...)`/`cva(...)`. `isDesktopOnlyToken(token)` đúng khi token bắt đầu bằng `lg:`/`xl:`/`2xl:`/`pointer-fine:` (cho phép nối tiếp như `lg:hover:`). `guardFile({ path, before, after })` so tập token: `before === null` là file mới, bỏ qua nếu có marker. Hàm trả về `[{ path, token, kind: 'added' | 'removed' }]`.
- [x] `scripts/layout/mobile-guard.mjs` -- CLI `--base <ref>` (mặc định `HEAD`). Duyệt các file `src/**/*.{ts,tsx}` (trừ `*.test.ts`) đã đổi so với base (`git diff --name-only <base>`) và file chưa track (`git ls-files --others --exclude-standard`). Đọc bản cũ bằng `git show <base>:<file>`. In vi phạm, exit 1 nếu có, exit 0 nếu không.
- [x] `scripts/layout/check-lib.mjs` + `check-lib.d.mts` -- `WIDTHS` (375×812, 1023×768, 1024×768, 1280×800, 1920×1080), `ROUTES` (`/`, `/roadmap`, `/roadmap/lesson/s1-t1-w1`, `/foundation`, `/foundation/F01`, `/session`, `/practice`, `/practice/flashcards`, `/practice/mistakes`, `/notebook`, `/trophies`, `/backup`), `parseCheckArgs(argv)` (`--base`, `--skip-diff`, `--out`), `findChrome(env, platform, exists)`, `layoutProblems(width, metrics)`. `metrics` gồm `scrollWidth`, `innerWidth`, danh sách nav hiện kèm `top`/`bottom`, độ rộng `main`, padding đáy của `main`, `top` của TopBar sau khi cuộn, `top` của đoạn link sâu và chiều cao TopBar. Hàm trả về danh sách lỗi tiếng Việt theo matrix.
- [x] `scripts/layout/check.mjs` -- tạo worktree tách rời của `--base` trong thư mục tạm, symlink `node_modules`. Chạy 2 server `vite` (bản gốc và bản hiện tại, cổng trống, biến Supabase rỗng). Mở Chrome `--headless=new` qua CDP (`DevToolsActivePort`, `WebSocket` có sẵn). Script tiêm lúc khởi tạo trang: đồng hồ cố định (2026-11-06T02:00:00Z, chạy tiếp theo thời gian thật), `Math.random` có seed, tắt animation/transition, `prefers-reduced-motion: reduce`. Ở 375px bật `mobile: true` + touch emulation. Chờ trang yên (không mutation trong 500ms, tối đa 10s). Đo `metrics` cho mọi route × bề rộng ở bản hiện tại. Chụp toàn trang ở 375px cho cả hai bản và so pixel bằng canvas (dung sai 0). In bảng kết quả và thư mục ảnh. Exit 0/1/2 theo matrix. Luôn dọn Chrome, các server và worktree trong `finally`.
- [x] `src/lib/layout-guard.test.ts`, `src/lib/layout-check.test.ts` -- test các dòng Guard, Thiếu Chrome và các dòng bố cục của matrix (cuộn ngang, đúng một nav, 448/768px, padding đáy, sticky, link sâu), dùng `metrics` dựng tay. Thêm `parseCheckArgs`.
- [x] `package.json` -- `"layout:guard": "node scripts/layout/mobile-guard.mjs"`, `"layout:check": "node scripts/layout/check.mjs"`.
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- dòng UI thêm: TopBar từ lg, `--topbar-height`; trang hai cột tự gắn `handle: { layout: 'wide' }` (lg:max-w-5xl) khi có bố cục hai cột (story 30–31); đổi bố cục thì chạy `layout:guard` + `layout:check`.

**Acceptance Criteria:**
- Given laptop rộng 1280px, when mở bất kỳ trang nào, then thấy thanh trên cùng có "Lumos" và 5 mục đúng thứ tự, không có bottom nav, nội dung là cột 768px ở giữa, và thanh vẫn dính khi cuộn.
- Given iPhone 375px, when mở app sau story này, then giao diện, điều hướng và overlay (Sheet, thư cú, thanh "Lưu vào Sổ tay") y như trước.
- Given đã đăng nhập trên máy tính, when bấm chấm đồng bộ trên TopBar, then Sheet "Đồng bộ ngay / Sao lưu / Đăng xuất" mở như trên điện thoại.
- Given cài PWA trên máy tính hoặc tablet, when xoay màn hình, then app không bị khoá dọc.

## Implementation Notes

- **TopBar** (`src/components/TopBar.tsx`, marker `mobile-guard: desktop-only`): lưới `grid-cols-[1fr_auto_1fr]` để 5 mục nằm đúng giữa; padding ngang 1.5rem + safe-area đặt qua `style` (calc) thay vì `px-6`, vì `style` padding sẽ đè class. Tìm TopBar trong script bằng `header:has(nav[aria-label="Điều hướng chính"])`, không thêm data attribute.
- **SyncBadge**: hai instance cùng render khi đã đăng nhập (strip ẩn từ lg, inline nằm trong TopBar ẩn dưới lg), mỗi cái giữ state Sheet riêng; chỉ cái đang hiện bấm được.
- **AppShell**: `cn('mx-auto w-full max-w-md flex-1 px-4 pt-4', LAYOUT_CLASS[layout])` — tập token không tiền tố không đổi, guard xác nhận.
- **guard-lib**: lấy chuỗi trong `className="…"`, `className={…}` (kể cả chuỗi lồng trong `${…}` của template) và `cn(…)`/`cva(…)`; so theo *tập* token mỗi file. Chuỗi class nằm ngoài các chỗ này (vd `const cls = 'size-3.5'`, `LAYOUT_CLASS`) không được guard xét — giới hạn đã biết. File bị xoá: báo mọi token không tiền tố là `removed`. Thêm `isGuardedPath` (pure) cho bộ lọc `src/**/*.{ts,tsx}` trừ test.
- **check.mjs**:
  - Vite chạy trong chính tiến trình (`createServer` của `vite`), mỗi bản một `cacheDir` tạm, `hmr: false`, `watch: null`, nên hai server dùng chung `node_modules` (symlink) không đụng cache tối ưu dependency.
  - Chrome `--headless=new --hide-scrollbars` (innerWidth = clientWidth, không có thanh cuộn ở 1023–1920), `Network.setBlockedURLs(['https://*','wss://*'])` để YouTube/tin/Supabase không làm ảnh lệch.
  - Mỗi lượt mở: about:blank → `Storage.clearDataForOrigin` → tải trang, nên mọi route mở từ dữ liệu sạch (người dùng mới) cho cả hai bản. Có một lượt làm nóng mọi route trước khi đo (vite có thể reload khi tối ưu dependency lần đầu).
  - `metrics` có thêm `innerHeight`, `mainLeft` (kiểm "nằm giữa") so với danh sách trong task. Dưới lg kiểm thêm bottom nav sát cạnh dưới và padding đáy 88px; từ lg kiểm TopBar cao 56px, nav nằm trong TopBar, padding 24px, `top` = 0 sau khi cuộn 600px, link sâu `#vocabulary` (chỉ ở 1024/1280/1920) nằm dưới đáy TopBar.
  - Ảnh: `375-<route>-{new,base}.png` (toàn trang), `375-<route>-diff.png` khi lệch (đỏ = khác), `1280-<route>.png` (viewport). Mặc định lưu ở `$TMPDIR/lumos-layout-check-<ms>`, `--out` để đổi. Lỗi bất ngờ → exit 2; Ctrl-C vẫn dọn.
- **Kết quả chạy thật** (`--base 49ddc60…`): exit 0, 12 route × 5 bề rộng đạt, ảnh 375px trùng tuyệt đối với bản gốc, ~80 giây. Kiểm âm tính: tạm đổi `text-[11px]`→`text-[12px]` ở BottomNav thì `layout:guard` exit 1 (báo thêm/xoá đúng 2 token) và `layout:check` exit 1 (12 route lệch ảnh); đã trả lại. `CHROME_PATH=/nope` → thông báo tiếng Việt, exit 2.
- **Chưa kiểm bằng tay**: chấm đồng bộ trên TopBar khi đã đăng nhập Supabase (script chạy chỉ local nên không có chấm) và xoay màn hình PWA đã cài. Ảnh toàn trang 375px vẽ BottomNav ở vị trí viewport ban đầu (đặc tính `captureBeyondViewport`), giống nhau ở cả hai bản nên không ảnh hưởng so sánh.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | Blind | `compareExpression`: canvas quá cao (>32767px) → ảnh rỗng, báo "trùng" mà không so | low | Ảnh 375px cao nhất hiện tại 10830px (bài s1-t1-w1), xa giới hạn canvas; sửa cần thêm guard/so theo dải, ít khả năng gặp. | reject |
| 2 | Blind | Link sâu chỉ kiểm cận dưới (`deepLinkTop >= topBarHeight`), scrollIntoView không chạy vẫn đạt | medium | Đúng: `layoutProblems` chỉ có cận dưới. Đã thêm cận trên = đáy TopBar + 12px + `scroll-margin-top` của đoạn (trừ khi trang đã cuộn hết cỡ). Lần chạy thật lộ `scroll-mt-4` (đoạn ở 84px = 56+12+16) nên đo thêm `deepLinkScrollMargin`. | patch |
| 3 | Blind | Kiểm TopBar dính đạt suông trên trang quá ngắn để cuộn | low | Đúng: không đọc `scrollY`. Giờ trang không cuộn được thì `topBarTopAfterScroll = null`, và mỗi bề rộng máy tính phải có ít nhất một route cuộn được (Lộ trình, Bài học), không thì báo lỗi. | patch |
| 4 | Blind | Ảnh bản gốc chụp sau ~1 phút nên chữ theo giờ có thể lệch; không cố định múi giờ/locale | false | `INIT_SCRIPT` tính `offset` ở mỗi document mới nên mỗi lượt mở đều bắt đầu đúng 2026-11-06T02:00Z; hai bản chạy cùng máy, cùng múi giờ, nên không lệch giữa base và bản mới. | reject |
| 5 | Blind | Không script nào mở overlay (Sheet, thư cú, "Lưu vào Sổ tay") dù AC2 hứa giữ nguyên ở 375px | low | Ba overlay không bị sửa và `--nav-height` chỉ đổi trong khối `@media (min-width: 64rem)`, nên dưới 1024px không đổi. Cách sửa là thêm mục kiểm tay vào spec (không sửa spec ở bước này) → đưa vào kiểm tay của Huy. | reject |
| 6 | Blind | `orientation: 'any'` làm điện thoại xoay ngang, trái "375px không đổi" | low | Có thật (PWA Android hết khoá dọc) nhưng là quyết định trong Decisions + AC4; manifest không tách điện thoại/tablet được. Đưa "xoay ngang điện thoại" vào kiểm tay. | reject |
| 7 | Blind | `EXPECTED.desktopMain` cố định 768px nên route `wide` của story 30 sẽ báo lỗi | low | Đúng. Thêm tham số `layout` cho `layoutProblems` (wide = min(1024, innerWidth)), `WIDE_ROUTES` trong check-lib, và test CI so `WIDE_ROUTES` với `layoutFor` của cây routes. | patch |
| 8 | Blind | `ROUTES` chép tay từ `routes.tsx`, không gì giữ đồng bộ | medium | Đúng: test chỉ có `toHaveLength(12)`. Thêm `UNCHECKED_ROUTES` và test duyệt cây routes: mọi route tĩnh phải nằm trong `ROUTES` hoặc `UNCHECKED_ROUTES`. | patch |
| 9 | Blind | Guard so tập token theo file, bỏ sót chuyển token/đảo điều kiện, `xxxClassName`, `clsx`/`twMerge`, `style`, `index.css` | low | Đúng về cơ chế; repo hiện không dùng `clsx`/`twMerge`/prop `xxxClassName` (grep). Guard chỉ là lọc nhanh, bằng chứng là ảnh 375px. Đã ghi đủ giới hạn ở đầu `guard-lib.mjs` và câu kết của CLI. | patch |
| 10 | Blind | `parseBase` lặng lẽ bỏ qua tham số lạ (`--bsae`) → so với HEAD, đạt giả | low | Đúng. Thêm `parseGuardArgs` thuần (guard-lib) từ chối tham số lạ, exit 2; có test. | patch |
| 11 | Blind | File đổi tên bị coi là file mới, báo mọi token là `added` | low | Đúng: `--name-only` chỉ ra đường dẫn mới, `git show base:mới` lỗi. Đổi sang `--name-status -z -M`, đọc bản cũ từ đường dẫn cũ (`parseNameStatus`, có test). | patch |
| 12 | Blind | Dọn dẹp hở: SIGINT giữa lúc khởi động, worktree mồ côi sau kill -9, base dùng node_modules hiện tại | low | Worktree mồ côi có thật: thêm `git worktree prune` trước `worktree add` (một dòng). Race SIGINT và lệch dependency của base ít gặp, lỗi lộ ra (exit 2/ảnh lệch) chứ không đạt giả; ghi chú giới hạn ở chỗ symlink. | patch |
| 13 | Blind | File story lỗi thời: `status`, `review_loop_iteration`, Spec Change Log trống, field metrics thêm | low | Cách sửa là sửa spec; bước này tự đặt `status: done`. `deepLinkMissing` đã thêm vào kiểu `LayoutMetrics`. | reject |
| 14 | Blind | TopBar không có link "bỏ qua tới nội dung"; `transition-all` không `motion-safe:` | low | TopBar đứng đầu thứ tự Tab trên laptop là thật; BottomNav có sẵn cũng dùng `transition-all`. Router hash nên skip link cần focus `main` bằng JS, không phải sửa thẳng; Huy dùng chuột/trackpad. Có thể gộp vào story 31 (phím tắt). | reject |
| 15 | Blind | Tablet cảm ứng ≥1024px nhận mục TopBar cao 36px (<44px) | low | Đúng (iPad ngang). Sửa một token trong file desktop-only: `pointer-coarse:h-11` (44px, vừa TopBar 56px). | patch |
| 16 | Blind | Dòng UI trong `stack.md` thành một ô bảng rất dài | low | Chỉ là trình bày; task của story yêu cầu ghi các ý này vào stack.md. | reject |
| 17 | Edge | `spawn` Chrome phát `error` (CHROME_PATH là thư mục) không có listener → chết exit 1, bỏ qua finally | low | Đúng: `findChrome` dùng `existsSync` nên thư mục vẫn qua. Thêm listener `error`, ném lỗi tiếng Việt trong vòng chờ → exit 2 và dọn dẹp. | patch |
| 18 | Edge | `Runtime.evaluate` không bao giờ xong → treo mãi | low | SETTLE có trần 10s; chỉ treo nếu `document.fonts.ready` hay script trang treo, chưa thấy. Sửa cần thêm timeout cho mọi lệnh CDP. | reject |
| 19 | Edge | Vite reload lúc làm nóng → "Execution context was destroyed" → exit 2 | low | Có thể xảy ra (cacheDir mới mỗi lượt, lượt làm nóng sinh ra để hấp thụ reload). Thêm thử lại một lần trong vòng làm nóng. | patch |
| 20 | Edge | Dữ liệu sạch nên `/` chuyển sang `/welcome`: trang Hôm nay chưa bao giờ được đo/so ảnh | medium | Đúng: ảnh `1280-home.png` cũ là "Thư nhập học". `load` giờ kiểm `location.hash`; bị chuyển hướng thì đặt lại hash trong cùng trang (thư đã ghi `welcomeSeenAt`) rồi chờ yên; vẫn lệch thì báo lỗi route. Chạy lại: `/` là "Hôm nay", ảnh 375px trùng bản gốc. | patch |
| 21 | Edge | Trang ngắn hơn viewport + 600px thì kiểm dính đạt suông | low | Trùng gốc với dòng 3 (Blind). | patch |
| 22 | Edge | Link sâu chỉ có cận dưới | medium | Trùng gốc với dòng 2 (Blind). | patch |
| 23 | Edge | Route `wide` sẽ báo "main rộng 1024px (cần 768px)" | low | Trùng gốc với dòng 7 (Blind). | patch |
| 24 | Edge | Route lỗi, không có `<main>` → TypeError dừng cả lượt, exit 2 | low | Lỗi lộ ra (exit 2 kèm thông báo), không đạt giả; chưa route nào lỗi. | reject |
| 25 | Edge | Marker desktop-only bị bỏ qua khi file đã có ở base (TopBar sau commit) → mọi sửa TopBar thành vi phạm giả | medium | Đúng: điều kiện chỉ xét `before === null`. Giờ bỏ qua khi bản mới có marker và bản cũ (nếu có) cũng có; bản cũ không có marker vẫn bị xét. Có test. | patch |
| 26 | Edge | Token có sẵn được thêm sang phần tử khác/chuyển chỗ không bị báo | low | Trùng gốc với dòng 9 (Blind). | patch |
| 27 | Edge | `pointer-fine:` có hiệu lực dưới 1024px (cửa sổ laptop hẹp, iPad trackpad) | low | Đúng về CSS nhưng frozen spec cho phép tiền tố `pointer-fine:` (dòng Guard của matrix) cho story 31; ràng buộc 375px là điện thoại cảm ứng. | reject |
| 28 | Edge | Comment có dấu nháy trong `cn(...)`/`className={...}` làm parser đọc sai | low | Có thể nhưng chưa gặp trong repo; sửa cần thêm xử lý comment cho parser. | reject |
| 29 | Edge | Đường dẫn non-ASCII bị git đóng ngoặc → file bị bỏ qua | low | `src` hiện không có đường dẫn non-ASCII; đã chuyển sang `-z` cùng lúc sửa đổi tên (test có đường dẫn có dấu). | patch |
| 30 | Edge | Đổi tên file báo mọi token là `added` | low | Trùng gốc với dòng 11 (Blind). | patch |
| 31 | Edge | `--base=ref` hoặc cờ gõ sai bị lặng lẽ bỏ qua | low | Trùng gốc với dòng 10 (Blind). | patch |
| 32 | Edge | win32 không có quyền symlink → EPERM | low | Huy dùng macOS nhưng sửa một dòng: `junction` trên win32. | patch |
| 33 | Edge | Base đổi dependency mà dùng node_modules hiện tại → ảnh lệch giả hoặc base không build | low | Trùng gốc với dòng 12 (Blind): lỗi lộ ra, không đạt giả; đã ghi chú giới hạn. | reject |
| 34 | Edge | `FixedDate` Proxy làm `instanceof Date` sai với Date gốc | false | Không có `instanceof Date` nào trong `src` (grep); hai bản chạy cùng script nên không lệch. | reject |
| 35 | Edge | SIGINT giữa `startVite` và `launchChrome` → tài nguyên tạo sau cleanup bị rò | low | Phải bấm Ctrl-C đúng lúc khởi động; sửa cần cờ hủy ở mọi bước. | reject |
| 36 | Edge | Resize qua 1024px khi Sheet đồng bộ đang mở → focus trả về nút đã ẩn | low | Sheet là overlay portal vẫn dùng và đóng được; chỉ mất vị trí focus khi đổi cỡ cửa sổ đúng lúc Sheet mở. | reject |
| 37 | Edge | Claim "luôn dọn trong finally", exit 0/1/2 sai khi spawn lỗi hoặc SIGINT | low | Phần spawn lỗi đã sửa cùng dòng 17; phần SIGINT như dòng 35. | patch |
| 38 | Vgap | Tách chỉ báo đồng bộ (strip `lg:hidden` / inline trong TopBar) không được gì kiểm | medium | Đã kiểm sẵn bởi reviewer: không test nào render SyncBadge, `layout:check` chạy không Supabase. Cách sửa là thêm mục kiểm tay vào spec → đưa vào kiểm tay của Huy (cần phiên Supabase thật). | reject |
| 39 | Vgap | Nối khung máy tính (AppShell/BottomNav/CSS 64rem) chỉ được kiểm bằng `layout:check` chạy tay, không trong CI | medium | Đã kiểm sẵn bởi reviewer; story cố ý để `layout:check` ngoài CI (cần Chrome). | defer |
| 40 | Vgap | Nhánh "bottom nav sát cạnh dưới" của `layoutProblems` không có unit test | low | Đã kiểm sẵn bởi reviewer. Thêm test 1023px với nav ở trên đầu → báo "sát cạnh dưới". | patch |
| 41 | Vgap (khác) | `git diff --name-only` với rename mặc định → file `git mv` thành file mới, báo `added` giả | low | Trùng gốc với dòng 11 (Blind). | patch |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run layout:guard -- --base 49ddc609e8064327f7185acc8daddf1b82e03b74` -- expected: exit 0 (TopBar.tsx bỏ qua nhờ marker; chỉ thấy token `lg:`).
- `npm run layout:check -- --base 49ddc609e8064327f7185acc8daddf1b82e03b74` -- expected: exit 0. Mọi route × 5 bề rộng không cuộn ngang và có đúng một nav. Ảnh 375px trùng với bản gốc. Từ 1024px: `main` 768px, TopBar dính, link sâu không bị che.

**Manual checks:**
- `grep -n "orientation" dist/manifest.webmanifest` ra `"any"`. Xem ảnh 1280px trong thư mục mà `layout:check` in ra: TopBar căn đẹp, mục sáng đúng tab.
