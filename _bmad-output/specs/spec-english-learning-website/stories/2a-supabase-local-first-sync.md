---
title: 'Lưu dữ liệu học trên Supabase, local-first và đồng bộ'
type: 'feature'
created: '2026-10-30'
status: 'done'
baseline_commit: 'a097a9b8211d75efcad55b9f200971d7776cf88e'
route: 'dispatch'
review_loop_iteration: 1
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:**
- Supabase là nơi lưu chính của dữ liệu học. App local-first: vẫn đọc/ghi localStorage, chạy offline; có mạng thì đồng bộ hai chiều. Supabase là bản chuẩn khi đổi máy.
- Đăng nhập qua email (Supabase Auth). Gist ở story 13 giữ nguyên, không thay.
- Đăng nhập bằng **mã OTP 6 số gửi qua email** (gõ mã trong app), không dùng magic link: PWA trên iPhone có bộ nhớ tách khỏi Safari nên link sẽ đăng nhập nhầm vào Safari. Email template Supabase phải gửi `{{ .Token }}`.
- **Bắt buộc đăng nhập:** chưa có phiên thì app chỉ hiện màn đăng nhập (lần đầu cần mạng). Đã có phiên lưu trên máy thì mở app offline vẫn học được; làm mới phiên lỗi do mất mạng không đá ra màn đăng nhập. Đăng xuất thì về màn đăng nhập, dữ liệu local giữ nguyên.
- **Gộp từng bài theo thời điểm:** store v3 đổi tiến độ thành `progress.lessons: { [lessonId]: { done: boolean, updatedAt: string ISO } }` (migration 2→3 từ `completedLessonIds`, giữ cả id lạ, `updatedAt` = mốc cũ cố định `1970-01-01T00:00:00.000Z` để mọi lần sửa thật đều thắng tiến độ có từ trước). Gộp local/server theo từng bài, `updatedAt` mới hơn thắng; bỏ đánh dấu là `done: false` chứ không xoá key, nên không bị máy kia làm sống lại. `updatedAt` của một bài không bao giờ lùi: ghi `max(giờ máy, updatedAt cũ + 1ms)`.
- **Đổi tài khoản trên cùng máy:** máy nhớ user id đã đồng bộ gần nhất. Đăng nhập user khác thì các key đồng bộ trên máy được thay bằng bản server của user mới (server trống thì về rỗng), không gộp và không đẩy dữ liệu của user cũ sang. Cùng user thì gộp như thường.
- Spec dài hơn 1600 token, Huy chấp nhận.

**Problem:** Dữ liệu học chỉ nằm trong localStorage của một trình duyệt: đổi máy, xoá dữ liệu Safari hay cài lại PWA là mất tiến độ.

**Approach:** Thêm Supabase (Auth + một bảng có RLS) và một lớp đồng bộ gắn vào `StoreHandle` của story 2: mỗi lần `update` thì ghi local ngay rồi đẩy lên Supabase khi có mạng; khi mở app, khi online lại và khi quay lại tab thì kéo bản trên server về và gộp. Cập nhật Constraints của SPEC và `stack.md` cho backend mới.

## Boundaries & Constraints

**Always:**
- App chạy đủ chức năng khi offline hoặc khi Supabase lỗi; đồng bộ lỗi chỉ hiện trạng thái, không chặn học, không mất dữ liệu local.
- Chỉ đồng bộ các key trong allowlist `SYNCED_KEYS` của `store.data` (hiện là `progress`); story sau muốn đồng bộ key mới phải thêm vào allowlist.
- Không bao giờ đẩy API key, PAT, token lên Supabase.
- RLS bật trên mọi bảng; mỗi user chỉ đọc/ghi hàng của chính mình (`auth.uid()`).
- Trong repo chỉ có URL và anon key (publishable) của Supabase, đưa vào qua biến build `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Không có service key ở đâu trong repo hay app. Thiếu biến thì app chạy như story 2 (chỉ local), ẩn phần đăng nhập.
- Không gọi Supabase rải rác trong component: client, auth và sync nằm trong `src/lib/sync/*`, UI đi qua hook.
- Store trên server có `schemaVersion`: bản server cũ hơn thì migrate bằng `runMigrations` trước khi gộp; bản server mới hơn app thì không ghi đè server, báo "cần cập nhật app".

**Never:**
- Không thay Gist (story 13), không làm backup file JSON (story 7), không realtime subscription.
- Không backend tự viết, không Edge Function. Không lưu dữ liệu ngoài allowlist.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Chưa đăng nhập | Không có phiên, có mạng | Chỉ hiện màn đăng nhập: nhập email → nhập mã 6 số → vào app | Mã sai/hết hạn: báo lỗi tiếng Việt, cho gửi lại mã |
| Chưa đăng nhập, offline | Không có phiên, không mạng | Màn đăng nhập báo cần mạng cho lần đăng nhập đầu | Không crash |
| Đã có phiên, offline | Phiên lưu trên máy, làm mới lỗi mạng | Vào app học bình thường, trạng thái "chưa đồng bộ" | Không đá ra màn đăng nhập |
| Thiếu biến Supabase | Build không có `VITE_SUPABASE_*` | Bỏ qua đăng nhập, app chạy local như story 2 (dùng cho dev) | N/A |
| Đăng nhập lần đầu, server trống | Local có tiến độ | Đẩy bản local lên server | Đẩy lỗi: giữ local, thử lại lần sau |
| Hai máy sửa cùng bài khi offline | Máy A đánh dấu, máy B bỏ đánh dấu sau đó | Sau đồng bộ cả hai máy theo bản có `updatedAt` mới hơn (bỏ đánh dấu) | N/A |
| Đăng nhập trên máy mới | Local trống, server có tiến độ | Kéo về, bản đồ hiện đúng tiến độ | N/A |
| Học offline | Đánh dấu bài khi không mạng | Lưu local, hiện "chưa đồng bộ"; online lại thì tự đẩy | N/A |
| Server mới hơn app | Server `schemaVersion` > app | Không ghi đè server, giữ local, báo cần cập nhật app | N/A |
| Supabase lỗi / sai cấu hình | Request lỗi, 401, thiếu env | Học tiếp bình thường, trạng thái "lỗi đồng bộ" | Không xoá local, không crash |
| Đăng xuất | Đang đăng nhập | Ngừng đồng bộ, về màn đăng nhập, dữ liệu local giữ nguyên | N/A |
| Migrate v2 → v3 | `completedLessonIds: ['s1-t1-w1', 'old-id']` | `lessons` có cả 2 id với `done: true`, `updatedAt` = `1970-01-01T00:00:00.000Z`, bản đồ hiện như cũ | Migration lỗi: theo I/O Matrix story 1 |
| Máy migrate muộn | Máy A (v3) bỏ đánh dấu X; máy B còn v2 có X xong, lên v3 sau đó | Sau đồng bộ X vẫn là bỏ đánh dấu trên cả hai máy | N/A |
| Đổi tài khoản | User A đăng xuất, user B đăng nhập trên cùng máy | Tiến độ trên máy = bản server của B; server của B không nhận dữ liệu của A | N/A |
| Đồng hồ máy lùi | `updatedAt` cũ của bài lớn hơn giờ máy | Lần sửa mới vẫn có `updatedAt` lớn hơn bản cũ và thắng khi gộp | N/A |
| App xuống nền / đăng xuất | Còn thay đổi chưa đẩy | Đẩy ngay khi `visibilityState = hidden`/`pagehide` và trước khi đăng xuất | Không mạng: giữ local, đẩy lần sau |

</frozen-after-approval>

## Code Map

- `src/app/store-context.ts` -- `createStoreHandle(loaded, opts)` với `getSnapshot/subscribe/update`; điểm gắn sync (sau `update` thì xếp hàng đẩy; khi kéo về thì thay `loaded.store` qua `saveStore` rồi báo listener). `useProgress()` là API tiến độ duy nhất; giữ chữ ký `{ completedLessonIds, setCompleted }` để `Roadmap.tsx`, `Lesson.tsx` không phải sửa.
- `src/lib/roadmap-progress.ts` -- `readCompletedLessonIds`, `setLessonCompleted`, `computeRoadmapProgress`; đổi sang đọc/ghi `progress.lessons` (giữ tên hàm và chữ ký để UI không đổi; `readCompletedLessonIds` = các id có `done: true`). Test hiện có trong `roadmap-progress.test.ts`, `store-context.test.ts` phải chuyển sang dạng v3, giữ các ca id lạ.
- `src/lib/storage/migrations.ts` -- `CURRENT_VERSION = 2`; thêm migration 2→3. `runMigrations` dùng lại cho bản server cũ.
- `src/lib/storage/storage.ts` -- `loadStore/saveStore`, chế độ `persistent/memory/read-only`. Không đổi I/O Matrix của story 1; ở `read-only` không đẩy lên server.
- `src/app/AppShell.tsx`, `src/app/storage-notice.ts` -- chỗ hiện banner trạng thái; thêm trạng thái đồng bộ cạnh banner lưu trữ.
- `src/main.tsx` -- tạo handle một lần; khởi động sync ở đây.
- `.github/workflows/deploy.yml` -- bước `npm run build` cần `env` lấy từ GitHub Actions Variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (không phải Secrets vì anon key công khai).
- `vite.config.ts` -- test env `node`; Workbox `navigateFallback` không được cache request tới Supabase (chỉ precache asset).
- `_bmad-output/specs/spec-english-learning-website/SPEC.md`, `stack.md`, `README.md` -- đang ghi "không backend, chỉ localStorage + GitHub"; sửa cho Supabase.

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/0001_user_store.sql` -- bảng `user_store(user_id uuid pk → auth.users on delete cascade, schema_version int, data jsonb, updated_at timestamptz)`, bật RLS, policy select/insert/update chỉ khi `user_id = auth.uid()` -- Huy chạy file này trong SQL Editor.
- [x] `package.json` -- thêm `@supabase/supabase-js`.
- [x] `src/lib/sync/client.ts` -- tạo client từ env (`flowType: 'pkce'`, `persistSession: true`); thiếu env trả `null`.
- [x] `src/lib/storage/migrations.ts`, `src/lib/roadmap-progress.ts` (+ test) -- `CURRENT_VERSION = 3`, migration 2→3 sang `progress.lessons`; `setLessonCompleted` ghi `{ done, updatedAt }`; giữ id lạ -- Decisions.
- [x] `src/lib/sync/merge.ts` (+ `.test.ts`) -- hàm thuần: lọc allowlist, gộp `progress.lessons` theo từng bài (`updatedAt` mới hơn thắng, bằng nhau thì giữ local), xử lý chênh `schemaVersion`; phủ các dòng I/O Matrix về dữ liệu.
- [x] `src/lib/sync/engine.ts` (+ `.test.ts`) -- trạng thái `off | idle | syncing | pending | error | outdated`; đẩy có debounce, kéo khi khởi động / `online` / `visibilitychange`; client giả trong test để phủ offline, lỗi, server mới hơn, đăng xuất.
- [x] `src/lib/sync/auth.ts` (+ test) -- `sendCode(email)` (`signInWithOtp`, `shouldCreateUser: true`), `verifyCode(email, token)` (`verifyOtp` type `email`), `signOut`, trạng thái phiên; phiên đã lưu + lỗi mạng vẫn tính là đã đăng nhập.
- [x] `src/app/store-context.ts`, `src/main.tsx` -- nối engine vào handle; hook `useSync()` trả trạng thái đồng bộ + phiên + `sendCode/verifyCode/signOut`.
- [x] `src/app/AuthGate.tsx`, `src/pages/SignIn.tsx` -- chưa có phiên thì chỉ hiện màn đăng nhập (không bottom nav): email → mã 6 số → vào app; gửi lại mã; báo cần mạng khi offline; thiếu env thì bỏ qua gate. Chữ tiếng Việt, 375px.
- [x] `src/app/AppShell.tsx` -- chỉ báo trạng thái đồng bộ nhỏ (đã đồng bộ / chưa đồng bộ / lỗi / cần cập nhật app) và lối đăng xuất (ví dụ trong Sheet mở từ chỉ báo), không thêm tab thứ 6, không che nội dung.
- [x] `.github/workflows/deploy.yml`, `.env.example`, `README.md` -- truyền biến build; hướng dẫn tạo project Supabase, chạy SQL, bật Email provider, sửa template "Magic Link" để gửi `{{ .Token }}`, đặt Site URL `https://huyhg2199.github.io/English/`, thêm 2 Variables trên GitHub, và câu SQL kiểm RLS.
- [x] `SPEC.md` (Constraints, Non-goals), `stack.md` -- ghi Supabase là nơi lưu chính, local-first; Gist vẫn cho story 13.
- [x] `supabase/migrations/0001_user_store.sql` -- trigger `before insert or update` đặt `updated_at = now()` trên server; client chỉ dùng `updated_at` trả về từ server cho CAS (`insert/update ... select`).
- [x] `src/lib/sync/remote.test.ts` -- fake builder `client.from()`: `update` lọc `updated_at = expected`, 0 hàng → `conflict`; `insert` lỗi `23505` → `conflict`, lỗi khác ném ra; `fetch` map cột và trả `null` khi không có hàng.
- [x] `src/app/gate-view.ts` (+ test) -- hàm thuần `gateView(snapshot) → 'app' | 'loading' | 'sign-in'` (disabled, signed-in kể cả offline, loading, signed-out); `AuthGate` render theo hàm này.
- [x] `src/lib/sync/engine.ts` (+ test) -- đẩy ngay khi `visibilityState = hidden` / `pagehide`; `flush()` trước khi đăng xuất; đang `outdated` thì sửa local không lên lịch fetch; đang `error` thì sửa local không đổi badge về `pending`; tách `outdated` thành server mới hơn và local mới hơn (2 thông báo khác nhau trong `sync-indicator.ts`).
- [x] `src/lib/sync/index.ts` (+ test) -- lưu `lumos-english:sync-user` (user id đồng bộ gần nhất, không phải bí mật); khác user thì thay key đồng bộ bằng bản server trước khi `engine.start`.
- [x] `src/lib/roadmap-progress.ts`, `src/lib/storage/migrations.ts` (+ test) -- `updatedAt` không lùi; migrate dùng mốc `1970-01-01T00:00:00.000Z`; test dòng "máy migrate muộn".
- [x] `src/lib/sync/auth.test.ts` -- round-trip phiên qua `createClient` thật với storage trong bộ nhớ để `readStoredUser` đọc đúng định dạng supabase-js đang dùng.
- [x] `README.md` -- sửa cả template "Magic Link" và "Confirm signup" (**bắt buộc**) để gửi `{{ .Token }}`; đặt Email OTP length = 6; tắt "Allow new users to sign up" sau khi tạo tài khoản; giới hạn gói free (SMTP vài email/giờ, project tạm dừng sau ~1 tuần không dùng, gợi ý custom SMTP); SQL kiểm RLS thêm ca insert hàng của user khác và delete bị chặn.

**Acceptance Criteria:**
- Given đã đăng nhập trên máy A và đánh dấu 3 bài, when đăng nhập cùng email trên máy B, then bản đồ máy B sáng đúng 3 trạm.
- Given repo, when grep `service_role`, key hay token, then không có giá trị bí mật nào; chỉ có tên biến `VITE_SUPABASE_*`.
- Given build không có biến Supabase, when mở app, then app bỏ qua đăng nhập, chạy như story 2 và không có lỗi console về Supabase.
- Given PWA cài trên iPhone chưa đăng nhập, when nhập email rồi gõ mã 6 số nhận được, then đăng nhập ngay trong PWA (không qua Safari).
- Given hai user khác nhau, when user A truy vấn bảng bằng anon key, then không đọc được hàng của user B (kiểm bằng SQL policy trong README).

## Implementation Notes

## Spec Change Log

**Vòng 1 → 2 (review_loop_iteration 1).**
- **Kích hoạt:** triage #1, #2 (intent_gap, Huy chọn 1A 2A) và #3–#15 (bad_spec).
- **Đã sửa:**
  - Decisions: migrate dùng mốc `1970-01-01`, `updatedAt` không lùi, đổi tài khoản thì thay chứ không gộp.
  - I/O Matrix: thêm 4 dòng (máy migrate muộn, đổi tài khoản, đồng hồ lùi, app xuống nền / đăng xuất).
  - Tasks: thêm test remote và `gateView`, trigger `updated_at`, đẩy khi xuống nền và trước khi đăng xuất, sửa trạng thái `outdated`/`error`, các bước README, cấu hình sign-up.
- **Tránh trạng thái hỏng:**
  - bài đã bỏ đánh dấu bị sống lại;
  - dữ liệu tài khoản cũ bị đẩy sang tài khoản mới;
  - mất lần đẩy khi iOS tắt app;
  - CAS dựa vào giờ client;
  - lần đăng nhập đầu tiên không làm được trong PWA vì template "Confirm signup" vẫn gửi link.
- **KEEP:** làm lại theo bản code lần 1 (`/private/tmp/claude-501/-Users-huyhg2-Desktop-Lab-English/05e331b3-6259-4b55-891e-1898402d6acd/scratchpad/story2a-attempt1.full.patch`, áp bằng `git apply --exclude="_bmad-output/specs/*"` để không đè spec này, rồi sửa tiếp), giữ những phần đã chạy tốt:
  - **Cấu trúc file:** `src/lib/sync/{client,merge,remote,engine,auth,index}.ts`, `AuthGate`, `SignIn`, `SyncBadge` + `ui/sheet.tsx`, `sync-indicator.ts`, `env.d.ts`, `.env.example`.
  - **Store và engine:** API `StoreHandle.replace` / `onLocalUpdate`, engine có trạng thái và test bằng fake remote, CAS theo `updated_at` + retry 3 lần.
  - **Auth và client:** `signOut({ scope: 'local' })`, lỗi auth bằng tiếng Việt, client có `detectSessionInUrl: false` + `storageKey` cố định.
  - **Hạ tầng:** SQL có RLS + `revoke` từ `anon`, workflow truyền `vars.*`, `useProgress()` giữ nguyên chữ ký.

## Review Triage Log

Vòng 1 (code lần 1 sao lưu ở scratchpad `story2a-attempt1.full.patch`).

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge (×2) | Migration 2→3 gán `updatedAt` = lúc migrate nên máy migrate muộn làm sống lại bài đã bỏ đánh dấu ở máy khác | medium | `migrations.ts` migration `2` dùng `new Date()`; Huy có dữ liệu v2 trên nhiều máy từ story 2. Nguyên nhân nằm trong Decisions (frozen) | intent_gap |
| 2 | verif-gap, blind, edge | Đăng xuất rồi đăng nhập tài khoản khác trên cùng máy: tiến độ local của tài khoản cũ gộp vào tài khoản mới | low | `index.ts` gọi `engine.start(uid)` không so user trước; intent chỉ nói "đăng xuất giữ dữ liệu local", không nói đổi tài khoản | intent_gap |
| 3 | verif-gap, blind | `createSupabaseRemote` không có test (CAS `updated_at`, `23505`, map hàng) | medium | Đã xác minh trước; grep chỉ có fake remote trong `engine.test.ts` | bad_spec |
| 4 | verif-gap, blind | Logic `AuthGate` (disabled / loading / signed-out / signed-in offline) không có test | medium | Đã xác minh trước; không test nào gọi gate | bad_spec |
| 5 | blind | App nền / bị iOS tắt trong 1,5s debounce, hoặc đăng xuất khi còn thay đổi chưa đẩy → mất lần đẩy | medium | Engine chỉ nghe `visibilitychange → visible`; `signOut` gọi `stop()` không đẩy cuối | bad_spec |
| 6 | blind, edge | CAS dựa vào `updated_at` do client ghi | low | `remote.ts` dòng 40, 48 ghi `now()` của máy; trigger DB `updated_at = now()` là sửa nhỏ trong SQL | bad_spec |
| 7 | edge (×2) | Đồng hồ máy lùi / chạy trước → bản sửa sau thua bản trước | low | `roadmap-progress.ts:48` dùng thẳng `now`; sửa: `max(now, prev + 1ms)` | bad_spec |
| 8 | blind | Ai cũng tạo được tài khoản (`shouldCreateUser: true`, anon key công khai) | low | `auth.ts:169`; RLS chặn dữ liệu nhưng tốn quota email; README chưa có bước tắt sign-up | bad_spec |
| 9 | blind | README ghi template "Confirm signup" là tuỳ chọn, nhưng lần đăng nhập đầu dùng template này | medium | User mới nhận email "Confirm signup"; gửi link thì không đăng nhập được trong PWA | bad_spec |
| 10 | blind | README thiếu giới hạn gói free (SMTP vài email/giờ, project tạm dừng sau ~1 tuần không dùng) | low | Sẽ hiện "Lỗi đồng bộ"/"gửi mã quá nhanh" không rõ lý do | bad_spec |
| 11 | blind | Thông báo `outdated` sai khi chính local là bản mới hơn | low | `syncIndicator('outdated')` luôn nói "dữ liệu trên tài khoản do bản app mới hơn tạo" | bad_spec |
| 12 | edge | Đang `outdated` mà vẫn sửa → mỗi lần sửa lại fetch, badge nhấp nháy | low | `notifyLocalChange` không bỏ qua `outdated` khi lên lịch | bad_spec |
| 13 | verif-gap | Lỗi không phải mạng (vd 401) bị sửa local đè thành "Chưa đồng bộ" | low | `notifyLocalChange` đặt `pending` trừ `outdated`/`syncing` | bad_spec |
| 14 | blind | `readStoredUser` phụ thuộc định dạng phiên nội bộ của supabase-js | maybe-false | Cần round-trip phiên qua `createClient` thật với storage trong bộ nhớ để biết | bad_spec |
| 15 | blind | README kiểm RLS thiếu ca insert hàng của user khác và delete | low | Chỉ có select/update | bad_spec |
| 16 | blind | Migration 2→3 bỏ phần tử không phải chuỗi trong `completedLessonIds` | low | Chỉ app ghi mảng này và luôn ghi chuỗi; giữ lại phải thêm field legacy → reject | reject |
| 17 | edge | Lỗi vĩnh viễn (dữ liệu server sai, RLS) thử lại mỗi 30s mãi | low | Badge vẫn hiện "Lỗi đồng bộ"; thêm phân loại lỗi là logic mới → reject | reject |
| 18 | edge | Local ở `memory` do dữ liệu hỏng: tiến độ server chỉ nạp vào bộ nhớ | false | Đúng I/O Matrix story 1 (không ghi đè dữ liệu hỏng); server không mất gì | reject |
| 19 | edge | `createSync` có `deps.auth` mà không có `deps.engine` khi client null | false | Đường này chỉ có trong test; `main.tsx` không truyền deps | reject |
| 20 | edge | `getSession` trả muộn sau `SIGNED_IN` đá user ra | low | Đăng nhập cần gõ mã (vài giây), getSession đọc local trả ngay; khó gặp, sửa thêm nhánh → reject | reject |
| 21 | blind | UI `SignIn`/`SyncBadge` chưa có test render | low | Không có môi trường test component (đã defer ở story 2) | reject |
| 22 | blind | Sổ sách spec (task chưa tick) | false | Task đã tick sau khi đối chiếu diff | reject |

Vòng 2.

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 23 | edge (×2) | Lượt đồng bộ lỗi đã xoá `dirty` nên `flush()` khi xuống nền / đăng xuất bỏ qua thay đổi chưa đẩy | medium | `engine.ts` `run()` đặt `dirty = false` trước `cycle`; `catch` không đặt lại; `flush()` thấy `!dirty` trả về luôn | patch |
| 24 | verif-gap | `browserEnvironment` (listener `visibilitychange`/`pagehide`/`online` thật) không có test | medium | Chỉ `fakeEnv` được test; đảo điều kiện `hidden` hay bỏ `pagehide` vẫn pass | patch |
| 25 | verif-gap | `outdatedReason` từ engine → `createSync` snapshot → badge không có test | low | `index.test` dùng `fakeEngine` luôn trả null; đổi `index.ts:112` thành null vẫn pass | patch |
| 26 | blind | Sau khi tắt sign-up theo README, email gõ sai báo "Thử lại sau ít phút" gây hiểu nhầm | low | `messageFor` không map `signup_disabled`/`otp_disabled`; sửa trực tiếp bằng một thông báo | patch |
| 27 | blind | Key đồng bộ mới mặc định "local luôn thắng", không gì buộc viết luật gộp | low | `mergeData` dùng `local[key] ?? server[key]`; story SRS/sổ tay thêm key sẽ không bao giờ nhận bản server. Sửa: bảng luật gộp có kiểu theo `SYNCED_KEYS` | patch |
| 28 | blind | Engine không có test cho hàng server sai cấu trúc → `error`, không ghi đè, giữ local | low | Chỉ `merge.test` kiểm `InvalidRemoteError` | patch |
| 29 | edge | Migration 2→3 dùng `id in lessons` nên id trùng tên thuộc tính kế thừa bị bỏ | low | `migrations.ts:35`; sửa trực tiếp bằng `Object.hasOwn` | patch |
| 30 | blind | README thiếu ca kiểm RLS: `update` đổi `user_id` sang user khác bị `with check` chặn | low | README chỉ có select/insert/delete; thêm vài dòng | patch |
| 31 | blind | Đẩy khi xuống nền không dùng `keepalive`, iOS có thể huỷ request | maybe-false | Cần thử trên iPhone thật xem request có bị huỷ khi PWA vào nền không; nếu đúng là medium | defer |
| 32 | edge, blind | Đổi tài khoản xoá thay đổi chưa đẩy của user cũ | false | Đúng quyết định đã chốt (Decisions: thay bằng bản server, không gộp) | reject |
| 33 | edge (×2) | Đăng xuất offline lỗi thì client giữ phiên trong bộ nhớ, refresh token làm đăng nhập lại | false | `auth-js` `_signOut` gọi `_removeSession()` cả khi `admin.signOut` lỗi | reject |
| 34 | edge, blind | Offline không có gì chờ vẫn hiện "Chưa đồng bộ" | false | Đúng I/O Matrix "Đã có phiên, offline → trạng thái chưa đồng bộ" | reject |
| 35 | edge (×2) | `updatedAt` bằng nhau nhưng `done` khác → hai máy đẩy qua lại | low | Cần trùng tới mili giây; mốc 1970 chỉ có `done: true`; thêm nhánh tie-break → reject | reject |
| 36 | edge | `updatedAt` gần Date max làm `toISOString` ném lỗi | low | Chỉ khi dữ liệu hỏng/tự sửa tay; thêm guard → reject | reject |
| 37 | edge | Key `__proto__` trong `lessons` từ server | low | Dữ liệu chỉ do chính user ghi (RLS), id bài do app sinh → reject | reject |
| 38 | edge | v2 có `progress.lessons` không phải object bị thay `{}` | low | v2 không có field `lessons`; khó gặp → reject | reject |
| 39 | edge (×2) | Ghi `sync-user` lỗi (storage bị chặn) thì đổi tài khoản lại gộp | low | Storage bị chặn thì dữ liệu cũng chỉ trong bộ nhớ; khó gặp, sửa thêm nhánh → reject | reject |
| 40 | blind | Đăng xuất không có phản hồi khi chờ flush; "Đồng bộ ngay" vẫn bấm được khi outdated/offline | low | Flush offline trả ngay, online thường nhanh; thêm state UI → reject | reject |
| 41 | blind | `vite.config.ts` chỉ là comment, không chặn cache Supabase | false | `generateSW` không có `runtimeCaching`; request API là fetch không phải navigation nên không bị cache | reject |
| 42 | blind | Spec chứa đường dẫn scratchpad tuyệt đối; sổ sách spec cũ; AC thiếu hành vi mới | low | Sửa là sửa spec của build này → reject | reject |

## Design Notes

Đăng nhập bằng OTP nên không có redirect: không đụng tới phần `#` của hash router. Client vẫn đặt `detectSessionInUrl: false` để Supabase không đọc nhầm hash route.

```ts
// progress v3
{ lessons: { 's1-t1-w1': { done: true, updatedAt: '2026-11-02T12:00:00Z' } } }
// merge: với mỗi id trong local ∪ server, lấy bản có updatedAt lớn hơn
```

Một hàng mỗi user (`data jsonb` = phần allowlist của store) vì dữ liệu nhỏ và chỉ một người dùng; bảng chuẩn hoá để sau nếu dữ liệu lớn (SRS, sổ lỗi).

## Verification

**Commands:**
- `npm run lint` -- expected: không lỗi
- `npm test` -- expected: test cũ + merge + engine pass
- `npm run build` -- expected: build thành công, có và không có biến `VITE_SUPABASE_*`

**Manual checks (if no CLI):**
- Với project Supabase thật: đăng nhập trên 2 trình duyệt, đánh dấu ở bên này, mở lại bên kia thấy cập nhật; tắt mạng vẫn đánh dấu được, bật lại tự đồng bộ.
