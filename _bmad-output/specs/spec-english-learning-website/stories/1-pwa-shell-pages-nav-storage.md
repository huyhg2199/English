---
title: 'Khung app PWA, deploy GitHub Pages, bottom nav 5 mục và lớp lưu trữ'
type: 'feature'
created: '2026-10-30'
status: 'done'
baseline_commit: '85458c2f09c5e194cb96d18d2414ef4d9a4acc63'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Repo chưa có app. Mọi story sau cần một PWA chạy được trên iPhone, có điều hướng cố định và chỗ lưu dữ liệu bền qua các lần nâng cấp.

**Approach:** Dựng Vite + React + TypeScript + Tailwind + shadcn/ui + vite-plugin-pwa, theme tối kiểu lâu đài, bottom nav 5 tab dẫn tới trang placeholder. Thêm lớp localStorage có version schema và migration. Deploy GitHub Pages qua GitHub Actions.

**Decisions:**
- Deploy GitHub Pages khi push nhánh `main` (develop → main mới cập nhật app).
- Tên app: `Lumos English` (manifest `name`/`short_name`, `<title>`, tên trên MH chính).

## Boundaries & Constraints

**Always:**
- Mobile-first, chạy ở 375px không cuộn ngang. Bottom nav đúng 5 mục theo thứ tự: Hôm nay / Lộ trình / Luyện tập / Sổ tay / Phòng Cúp.
- Base path `/English/` cho Pages. Router dùng hash routing để reload và deep link không bị 404 trên Pages.
- Mọi đọc/ghi localStorage đi qua lớp storage, bọc try/catch. Lỗi đọc hoặc parse không được làm app crash và không được xoá dữ liệu cũ.
- Dữ liệu có `schemaVersion`. Nâng version thì chạy migration tuần tự, không reset dữ liệu.
- Chữ giao diện bằng tiếng Việt. Hỗ trợ safe-area của iPhone (notch, home indicator).

**Never:**
- Không commit secret, API key, PAT, gist id hay dữ liệu cá nhân (repo public).
- Không dùng logo, font hay nhân vật Harry Potter gốc. Chỉ dùng màu, icon và chữ "lấy cảm hứng".
- Không backend. Không có nội dung học, SRS hay backup trong story này (thuộc story 2–7).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lần đầu mở | localStorage trống | Khởi tạo store mặc định với `schemaVersion` hiện tại | N/A |
| Dữ liệu cũ | Store có version thấp hơn | Chạy migration tuần tự lên version hiện tại, giữ dữ liệu | Migration lỗi: giữ bản gốc, chạy với store mặc định trong bộ nhớ, không ghi đè |
| Dữ liệu hỏng | JSON không parse được | App vẫn chạy với store mặc định trong bộ nhớ | Không ghi đè key hỏng; log cảnh báo |
| localStorage bị chặn | Truy cập ném lỗi (private mode) | App chạy với bộ nhớ tạm | Không crash |
| Version cao hơn | Store do bản app mới hơn ghi | Không migrate xuống, không ghi đè | Chạy chế độ chỉ đọc trong bộ nhớ |

</frozen-after-approval>

## Code Map

Repo trống: chỉ có `.gitattributes`, `.gitignore` (ignore `.claude/`, `_bmad/`). Không có code để tái dùng hay cần tránh sửa.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html` -- dựng Vite + React + TS, `base: '/English/'`, script `dev`/`build`/`test`/`lint` -- nền cho mọi story.
- [x] `components.json`, `src/index.css`, `src/components/ui/*` -- cài Tailwind + shadcn/ui; token màu theme tối lâu đài (nền đá đậm, chữ ngà, nhấn vàng nến) đặt ở CSS variables -- CAP-20 giao diện.
- [x] `vite.config.ts`, `public/icons/*` -- vite-plugin-pwa: manifest (tên, `display: standalone`, theme/background color, icon 192/512 + apple-touch-icon tự vẽ), service worker autoUpdate precache app shell -- cài được lên MH chính iPhone.
- [x] `src/app/router.tsx`, `src/app/AppShell.tsx`, `src/components/BottomNav.tsx` -- hash router, layout có safe-area, bottom nav 5 tab có icon + nhãn, tab đang mở được highlight -- Constraints SPEC.
- [x] `src/pages/{Today,Roadmap,Practice,Notebook,TrophyRoom}.tsx` -- placeholder mỗi trang: tiêu đề + dòng "Sắp có" -- story sau điền nội dung.
- [x] `src/lib/storage/*` -- `loadStore`, `saveStore`, `migrations` theo schemaVersion, fallback bộ nhớ theo I/O Matrix -- nền cho CAP-22.
- [x] `src/lib/storage/*.test.ts` -- Vitest phủ đủ 5 dòng I/O Matrix.
- [x] `.github/workflows/deploy.yml` -- build + test rồi deploy Pages bằng `actions/deploy-pages` khi push `main`; push `develop` chỉ chạy build + test.
- [x] `README.md` -- cách chạy dev, cách bật Pages (Settings → Pages → Source: GitHub Actions), cách cài lên iPhone.

**Acceptance Criteria:**
- Given app đã build, when mở ở viewport 375px, then thấy bottom nav 5 tab đúng thứ tự, bấm tab nào thì sang đúng trang đó và tab được highlight.
- Given đang ở một tab, when reload trang hoặc mở deep link, then vẫn ở đúng tab, không 404.
- Given app deploy trên Pages, when mở bằng Safari iPhone và chọn "Thêm vào MH chính", then app mở toàn màn hình với tên và icon đã chốt.
- Given đã mở app một lần, when tắt mạng rồi mở lại, then app shell vẫn tải được.
- Given repo, when grep tìm key/token/secret, then không có giá trị bí mật nào được commit.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge | `cancel-in-progress: true` có thể huỷ job deploy-pages trên `main` | low | `deploy.yml` dùng chung group theo ref, không loại trừ main; starter workflow của GitHub để `false` | patch |
| 2 | verif-gap | CI không kiểm tra `dist/` có manifest và sw.js | medium | Đã xác minh trước; các bước CI chỉ là lint/test/build | patch |
| 3 | verif-gap, blind | Không có test thứ tự nav và khớp nav ↔ route | medium | Đã xác minh trước; chỉ có `storage.test.ts` | patch |
| 4 | blind | `jsdom` là devDependency nhưng không dùng | low | Grep `src`, `vite.config.ts`: không có tham chiếu; test env là `node` | patch |
| 5 | verif-gap, blind | Guard kết quả migration sai trong `runMigrations` không có test; thiếu ca store sai kiểu | medium | Đã xác minh trước; không test nào trả về version/data sai | patch |
| 6 | blind, verif-gap | Banner `memory` dùng cùng một câu cho corrupt/migration-failed/unavailable, không nói dữ liệu cũ vẫn còn; chưa có test | low | `AppShell.tsx` map theo `mode`; corrupt/migration-failed vẫn giữ bản gốc trong localStorage | patch |
| 7 | edge | `saveStore` ghi lỗi nhưng `mode` vẫn `persistent` | low | `saveStore` trả false nhưng không đổi `loaded.mode`; sửa trực tiếp được | patch |
| 8 | blind, edge | `.env.*` cũng ignore luôn `.env.example` | low | Pattern gitignore khớp; thêm một dòng ngoại lệ là xong | patch |
| 9 | blind | Thiếu `engines` node>=22 | low | Chỉ có trong README; sửa một dòng | patch |
| 10 | blind, edge, verif-gap | `saveStore` sửa trực tiếp object trong context nên React không re-render | low | Hiện chưa có component nào gọi `saveStore` hay đọc `store`; muốn sửa phải thêm subscribe API → reject. Story 4 (lần ghi đầu tiên) cần store reactive | reject |
| 11 | blind, edge | Nhiều tab hoặc tab bản cũ ghi đè store bản mới | low | Hiện app chỉ ghi lúc load (fresh/migrated); muốn sửa phải thêm re-read hoặc revision → reject; xử lý khi story bắt đầu ghi | reject |
| 12 | blind | PWA không có luồng reload sau update | maybe-false | autoUpdate kích hoạt SW mới, lần mở app sau sẽ lấy precache mới; cần thử trên iPhone standalone. `workbox-window` là peerDependency của vite-plugin-pwa nên không bỏ được. Nếu đúng thì chỉ là low → reject | reject |
| 13 | blind | Quét secret chưa tự động trong CI | low | Repo public đã có secret scanning/push protection của GitHub; thêm bước CI thì phức tạp hơn sửa trực tiếp | reject |
| 14 | edge | `loadStore`/`saveStore` dùng key/storage khác nhau | low | Option này chỉ dùng trong test; muốn sửa phải thêm field | reject |
| 15 | edge | Icon maskable full-bleed bị crop trên Android | low | Người dùng dùng iPhone (iOS bỏ qua maskable); muốn sửa phải có asset mới | reject |
| 16 | blind | Mock `warn` dùng chung giữa các test | low | Cosmetic, không làm test sai | reject |
| 17 | blind | Implementation Notes của story trống | false | Muốn sửa phải sửa spec của build → reject theo luật | reject |

## Design Notes

Hash routing (`/English/#/notebook`) được chọn vì Pages không có rewrite cho SPA. Kiểu dữ liệu store:

```ts
type Store = { schemaVersion: number; data: Record<string, unknown> };
// migrations[n] biến store version n → n+1; loadStore chạy từ version đang có tới CURRENT_VERSION
```

Story này dùng `schemaVersion: 1` với `data: {}`. Các story sau thêm field kèm migration.

## Verification

**Commands:**
- `npm run lint` -- expected: không lỗi
- `npm test` -- expected: test storage pass
- `npm run build` -- expected: build thành công, `dist/` có `manifest.webmanifest` và `sw.js`

**Manual checks (if no CLI):**
- `npm run preview` ở viewport 375px: 5 tab hoạt động; DevTools → Application thấy manifest hợp lệ và service worker đã đăng ký.
