# Lumos English

Website cá nhân học tiếng Anh từ 0 tới TOEIC 750+. PWA front-end (Vite + React + TypeScript + Tailwind + shadcn/ui), host trên GitHub Pages, dùng chính trên iPhone qua "Thêm vào MH chính". Dữ liệu học lưu local-first và đồng bộ lên Supabase (Auth + một bảng có RLS), không có backend tự viết.

## Chạy local

Yêu cầu Node 22+.

```bash
npm install
npm run dev       # http://localhost:5173/English/
npm run lint
npm test          # Vitest (storage, tiến độ, đồng bộ)
npm run build     # ra dist/, có manifest.webmanifest và sw.js
npm run preview   # chạy bản build, có service worker
```

Router dùng hash (`/English/#/notebook`) nên reload hay mở deep link trên Pages không bị 404.

## Deploy GitHub Pages

Workflow `.github/workflows/deploy.yml`:

- Push `develop` (hoặc mở PR): chỉ lint + test + build.
- Push `main`: lint + test + build rồi deploy lên Pages.

Bật Pages một lần: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
App chạy ở `https://<user>.github.io/English/`.

## Cài lên iPhone

1. Mở link Pages bằng **Safari**.
2. Bấm nút Chia sẻ → **Thêm vào MH chính** → Thêm.
3. Mở từ icon "Lumos English": app chạy toàn màn hình. Sau lần mở đầu, app shell vẫn tải được khi không có mạng.

Không có biến `VITE_SUPABASE_*` thì app bỏ qua đăng nhập và chạy chỉ local (tiện khi dev). Muốn chạy local có đồng bộ: copy `.env.example` thành `.env.local` rồi điền URL và anon key.

## Dữ liệu

Dữ liệu học lưu ở `localStorage` (key `lumos-english:store`) qua `src/lib/storage`, có `schemaVersion` và migration tuần tự. Dữ liệu hỏng, bị chặn hay do bản app mới hơn ghi sẽ không bị ghi đè.

**Đồng bộ Supabase (local-first, `src/lib/sync`):** app luôn đọc/ghi localStorage trước nên học được khi offline. Đã đăng nhập thì mỗi lần sửa sẽ đẩy lên (debounce), còn khi mở app, khi có mạng lại và khi quay lại app thì kéo bản trên server về và gộp. Tiến độ gộp theo từng bài (`progress.lessons[id] = { done, updatedAt }`, bản mới hơn thắng; bỏ đánh dấu là `done: false` nên máy khác không làm sống lại). App xuống nền hoặc đăng xuất thì đẩy ngay phần còn chờ. Đăng nhập tài khoản khác trên cùng máy thì tiến độ trên máy được thay bằng bản của tài khoản mới (máy nhớ user đồng bộ gần nhất ở key `lumos-english:sync-user`), không gộp dữ liệu của tài khoản cũ sang. Chỉ các key trong `SYNCED_KEYS` (hiện là `progress`) được đẩy lên; API key, PAT, token không bao giờ rời máy. Bản trên server do app mới hơn ghi thì app không ghi đè và báo "Cần cập nhật app".

## Cài đặt Supabase (một lần)

1. Tạo project miễn phí ở [supabase.com](https://supabase.com).
2. **SQL Editor** → dán và chạy `supabase/migrations/0001_user_store.sql` (tạo bảng `user_store`, trigger đặt `updated_at` trên server, bật RLS, policy chỉ cho đọc/ghi hàng của chính mình).
3. **Authentication → Sign In / Providers → Email**: bật Email provider. Đặt **Email OTP length = 6** (app chỉ nhận mã 6 số).
4. **Authentication → Emails → Templates**: sửa **cả hai** template **Magic Link** và **Confirm signup** (**bắt buộc**) để gửi **mã** thay cho link, ví dụ:

   ```html
   <h2>Mã đăng nhập Lumos English</h2>
   <p>Nhập mã này trong app: <strong>{{ .Token }}</strong></p>
   <p>Mã hết hạn sau ít phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
   ```

   App đăng nhập bằng mã 6 số gõ trong app, không dùng magic link: PWA trên iPhone có bộ nhớ tách khỏi Safari nên link sẽ đăng nhập nhầm vào Safari. Lần đăng nhập **đầu tiên** của một email (tạo tài khoản) Supabase gửi template **Confirm signup**; nếu template này vẫn gửi link thì không đăng nhập được trong PWA.
5. **Authentication → URL Configuration**: Site URL = `https://huyhg2199.github.io/English/`.
6. **Project Settings → API**: lấy **Project URL** và **anon / publishable key**. Tuyệt đối không dùng `service_role` key ở đâu trong repo hay app.
7. GitHub repo → **Settings → Secrets and variables → Actions → Variables** (tab Variables, không phải Secrets vì anon key là công khai): thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`. Lần deploy sau app sẽ yêu cầu đăng nhập.
8. Mở app, đăng nhập một lần bằng email của bạn để tạo tài khoản. Sau đó vào **Authentication → Sign In / Providers** (mục User Signups) **tắt "Allow new users to sign up"**: anon key công khai nên ai cũng gọi được API tạo tài khoản và làm tốn quota email. RLS vẫn chặn họ đọc dữ liệu của bạn, nhưng tắt sign-up thì không ai tạo thêm tài khoản được. Tài khoản đã có vẫn đăng nhập bằng mã như thường.

### Giới hạn gói free

- **Email:** SMTP mặc định của Supabase chỉ gửi được vài email mỗi giờ (và chỉ tới địa chỉ thuộc team project). Bấm "Gửi lại mã" nhiều lần sẽ gặp lỗi "Gửi mã quá nhanh". Muốn ổn định hơn thì cấu hình **custom SMTP** (Authentication → Emails → SMTP Settings), ví dụ Resend, Brevo hay Gmail SMTP với app password.
- **Project tạm dừng:** project free không có hoạt động khoảng **1 tuần** sẽ bị pause. Khi đó app vẫn học bình thường bằng dữ liệu trên máy nhưng badge hiện "Lỗi đồng bộ" và không đăng nhập được trên máy mới. Vào dashboard bấm **Restore project** là chạy lại; tiến độ trên máy sẽ tự đẩy lên.

### Kiểm tra RLS

Chạy trong SQL Editor (thay `<uuid-user-A>`, `<uuid-user-B>` bằng id hai user trong **Authentication → Users**; chưa có user B thì tạm bật sign-up, tạo thêm, rồi tắt lại). Mỗi khối giả lập user A gọi bằng anon key + JWT của A. Khối nào báo lỗi thì chạy riêng khối đó (lỗi sẽ huỷ cả transaction).

```sql
-- RLS đã bật và đủ 3 policy (select / insert / update), không có policy delete
select relrowsecurity from pg_class where oid = 'public.user_store'::regclass;  -- true
select policyname, cmd from pg_policies where tablename = 'user_store';
-- Trigger đặt updated_at trên server
select tgname from pg_trigger where tgrelid = 'public.user_store'::regclass and not tgisinternal;  -- user_store_set_updated_at

-- 1. Đọc / sửa: chỉ thấy và chỉ sửa được hàng của A
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '<uuid-user-A>', 'role', 'authenticated')::text, true);
select user_id from public.user_store;                                      -- chỉ có <uuid-user-A> (hoặc rỗng)
update public.user_store set data = '{}' where user_id <> '<uuid-user-A>';  -- UPDATE 0
rollback;

-- 1b. Chuyển hàng của mình sang user khác: bị chặn bởi `with check` của policy update
--     (cần A đã có hàng; chưa có thì chỉ ra UPDATE 0)
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '<uuid-user-A>', 'role', 'authenticated')::text, true);
update public.user_store set user_id = '<uuid-user-B>' where user_id = '<uuid-user-A>';
-- ERROR: new row violates row-level security policy for table "user_store"
rollback;

-- 2. Thêm hàng cho user khác: bị chặn
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '<uuid-user-A>', 'role', 'authenticated')::text, true);
insert into public.user_store (user_id, schema_version, data) values ('<uuid-user-B>', 3, '{}');
-- ERROR: new row violates row-level security policy for table "user_store"
rollback;

-- 3. Xoá: bị chặn (kể cả hàng của chính mình; app không bao giờ xoá)
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '<uuid-user-A>', 'role', 'authenticated')::text, true);
delete from public.user_store;
-- ERROR: permission denied for table user_store
rollback;

-- 4. Chưa đăng nhập (chỉ anon key): không đọc được gì
begin;
set local role anon;
select count(*) from public.user_store;
-- ERROR: permission denied for table user_store
rollback;
```

## Bí mật

Repo public. Không commit API key, PAT, token bot, gist id hay dữ liệu cá nhân. Những thứ này chỉ nằm ở localStorage trên máy hoặc GitHub Secrets. Riêng URL và anon key Supabase là công khai (bảo vệ bằng RLS) nên để ở GitHub Actions Variables; không bao giờ có `service_role` key trong repo hay app.

## Bản quyền theme

Theme "lấy cảm hứng" từ không khí lâu đài phù thuỷ. Icon và giao diện tự vẽ, không dùng logo, font hay nhân vật gốc.
