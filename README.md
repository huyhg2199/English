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

**Đồng bộ Supabase (local-first, `src/lib/sync`):** app luôn đọc/ghi localStorage trước nên học được khi offline. Đã đăng nhập thì mỗi lần sửa sẽ đẩy lên (debounce), còn khi mở app, khi có mạng lại và khi quay lại app thì kéo bản trên server về và gộp. Tiến độ gộp theo từng bài (`progress.lessons[id] = { done, updatedAt }`, bản mới hơn thắng; bỏ đánh dấu là `done: false` nên máy khác không làm sống lại). App xuống nền hoặc đăng xuất thì đẩy ngay phần còn chờ. Đăng nhập tài khoản khác trên cùng máy thì tiến độ trên máy được thay bằng bản của tài khoản mới (máy nhớ user đồng bộ gần nhất ở key `lumos-english:sync-user`), không gộp dữ liệu của tài khoản cũ sang. Chỉ các key trong `SYNCED_KEYS` (dữ liệu học, gồm cả giờ nhắc `reminders`) được đẩy lên; API key, PAT, token không bao giờ rời máy. Bản trên server do app mới hơn ghi thì app không ghi đè và báo "Cần cập nhật app".

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
   Cách khác (đang dùng): ghi hai giá trị vào file `.env.production` ở gốc repo rồi commit. Vite đọc file này khi `npm run build`, cả trên máy lẫn GitHub Actions. Chỉ được để URL và anon key ở đây, không bao giờ để `service_role` / secret key.
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

## Owl Post (Telegram) và bản sao Gist

App tự ghi một **secret gist** của bạn (story 13): `lumos-backup.json` (đúng file sao lưu, chỉ dữ liệu học) và `status.json` (`{ date, studied, kind, streak, updatedAt }`). Ghi ngay khi xong buổi và khi app xuống nền (nếu dữ liệu đổi, tối đa 1 lần mỗi 10 phút). Workflow `.github/workflows/owl-post.yml` đọc `status.json` lúc **12:00, 15:30, 21:30 giờ Việt Nam**; hôm nay chưa học thì gửi tin Telegram, đã học thì im lặng. Đọc Gist lỗi thì không gửi (chỉ cảnh báo trong log).

> **Secret gist không phải riêng tư:** GitHub chỉ không liệt kê nó công khai, nhưng **ai có gist id / URL đều đọc được bản sao dữ liệu học**. Coi gist id như thông tin nhạy cảm: chỉ dán vào GitHub Secrets, không đăng hay commit ở đâu.

### 1. Tạo PAT chỉ quyền gist

1. GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)** (hoặc mở `https://github.com/settings/tokens/new?scopes=gist`).
2. Chỉ tick **gist**. Chọn hạn dùng (ví dụ 1 năm; hết hạn thì tạo PAT mới và bấm "Thay PAT" trong app, cập nhật cả secret `GIST_TOKEN`).
3. Trong app: **Luyện tập → Owl Post & sao lưu** → dán PAT → **Kết nối**. App tạo secret gist và hiện **Gist id** (nút chép). PAT chỉ nằm ở localStorage của máy đó (`lumos-english:gist-token`), không đồng bộ, không vào bản sao.
4. Máy thứ hai: dán PAT và điền **Gist id có sẵn** để nối vào cùng gist, tránh tạo gist mới. App kiểm PAT ghi được gist đó (đúng tài khoản chủ gist, có quyền gist) và bản sao đọc được, gộp bản sao về rồi mới ghi. Mỗi lần ghi sau đó app cũng đọc gist và gộp dữ liệu của máy khác trước, nên hai máy không đè mất dữ liệu của nhau.
5. **Thay PAT** (PAT hết hạn) giữ nguyên gist id. Nếu ngắt kết nối rồi tạo gist mới thì gist id đổi: **nhớ cập nhật secret `GIST_ID`**, nếu không Owl Post vẫn đọc gist cũ (và sẽ nhắc dù bạn đã học).

### 2. Tạo bot Telegram

1. Trong Telegram, nhắn **@BotFather** → `/newbot` → đặt tên → nhận **bot token** (dạng `123456:ABC…`).
2. Mở chat với bot vừa tạo và bấm **Start** (bot chỉ nhắn được cho người đã nhắn nó trước).
3. Lấy **chat id**: mở `https://api.telegram.org/bot<bot token>/getUpdates` trong trình duyệt sau khi đã nhắn bot, tìm `"chat":{"id":…}`. Không dán link này (có token) vào đâu khác.

### 3. Thêm 4 GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → tab Secrets → New repository secret**:

| Secret | Giá trị |
|---|---|
| `GIST_ID` | Gist id chép từ app |
| `GIST_TOKEN` | PAT chỉ quyền gist (có thể dùng chung PAT với app) |
| `TELEGRAM_BOT_TOKEN` | Token từ BotFather |
| `TELEGRAM_CHAT_ID` | Chat id ở bước 2 |

Đây là **Secrets** (không phải Variables). Workflow chỉ đọc chúng qua `env`, không `echo`; script không in secret và tự che chuỗi secret nếu lỡ có trong thông báo lỗi.

### 4. Bật và thử workflow

1. Tab **Actions** → nếu GitHub hỏi thì bấm bật workflow. Chọn **Owl Post (nhắc học qua Telegram)** → **Run workflow** để thử tay.
2. Hôm nay chưa học → nhận tin trên Telegram. Học xong một buổi (app ghi `status.json`) rồi chạy lại → không nhận tin.
3. Lỗi lâu dài (Gist trả 401/404 vì PAT hết hạn hoặc gist bị xoá; Telegram trả 400/401/403/404 vì token / chat id sai hoặc bot bị chặn) → run **đỏ** và GitHub gửi email để bạn sửa secret. Lỗi tạm (mạng, GitHub 5xx/429) hoặc thiếu secret → run xanh kèm cảnh báo vàng. Log không có giá trị secret.
4. Thử tại máy, không gọi mạng: `node scripts/owl-post/send.mjs --dry-run --status-json '{"date":"2026-11-01","studied":true,"kind":"full","streak":3}' --now 2026-11-02T14:30:00Z`.

Lưu ý: cron của GitHub có thể chạy trễ vài phút tới vài chục phút; GitHub tự tắt workflow theo lịch nếu repo không có commit nào trong 60 ngày (vào Actions bật lại).

### 5. Lịch nhắc (.ics)

- **Subscribe** (giờ cố định 12:00 và 21:30): iPhone → **Cài đặt → Lịch → Tài khoản → Thêm tài khoản → Khác → Thêm lịch đã đăng ký**, dán `https://huyhg2199.github.io/English/lumos-reminders.ics`. Google Calendar: **Khác → Từ URL**. File chỉ có giờ và link app, không có dữ liệu cá nhân.
- **Theo giờ bạn chọn**: trong app chỉnh giờ nhắc rồi bấm **Tải lịch .ics theo giờ này** và mở file để thêm vào Lịch.
- Giờ nhắc trong app (đồng bộ giữa các máy) còn dùng cho dải nhắc trên trang Hôm nay: qua giờ nhắc đầu tiên mà chưa học thì hiện, bấm đóng thì ẩn tới mai. Không có web push (Đợt 2).

## Bí mật

Repo public. Không commit API key, PAT, token bot, gist id, chat id hay dữ liệu cá nhân. Những thứ này chỉ nằm ở localStorage trên máy (key Gemini, PAT, gist id) hoặc GitHub Secrets (`GIST_ID`, `GIST_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`). Bản sao trên Gist chỉ chứa key trong allowlist, không bao giờ có PAT hay key. Riêng URL và anon key Supabase là công khai (bảo vệ bằng RLS) nên để ở GitHub Actions Variables; không bao giờ có `service_role` key trong repo hay app.

## Bản quyền theme

Theme "lấy cảm hứng" từ không khí lâu đài phù thuỷ. Icon và giao diện tự vẽ, không dùng logo, font hay nhân vật gốc.
