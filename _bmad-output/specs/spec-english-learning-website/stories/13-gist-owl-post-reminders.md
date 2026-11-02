---
title: 'Bản sao Gist tự động, Owl Post Telegram và nhắc nhở'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: '8601d70bc37388cdfbc4ef82c60939b312d10a4d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Gist:** Huy tạo PAT (classic, chỉ quyền `gist`) và nhập vào trang "Owl Post & sao lưu". PAT và gist id chỉ nằm ở `localStorage` (`lumos-english:gist-token`, `lumos-english:gist-id`), ngoài `store.data`: không đồng bộ Supabase, không vào file backup, không log. Lần đầu app tạo **secret gist** có 2 file: `lumos-backup.json` (đúng định dạng backup của story 7, chỉ key trong allowlist) và `status.json` (`{ date: YYYY-MM-DD theo giờ máy, studied, kind, streak, updatedAt }`, không dữ liệu khác).
- **Khi nào ghi Gist:** ngay sau khi xong một buổi (chuẩn/lười), và khi app xuống nền nếu dữ liệu đổi kể từ lần ghi trước (tối đa 1 lần mỗi 10 phút). Lỗi mạng/token thì chỉ báo trạng thái ở trang, không chặn học, thử lại lần sau. Có nút "Ghi ngay" và "Khôi phục từ Gist" (gộp bằng `restoreBackup` của story 7).
- **Owl Post (Telegram):** GitHub Actions workflow `owl-post.yml` chạy cron 3 lần/ngày theo giờ Việt Nam: 12:00, 15:30, 21:30 (UTC 05:00, 08:30, 14:30). Script đọc `status.json` từ Gist (secrets `GIST_ID`, `GIST_TOKEN`); nếu hôm nay (Asia/Ho_Chi_Minh) chưa học thì gửi tin qua bot (secrets `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`); đã học thì không gửi. Tin tiếng Việt, ngắn, giọng cú đưa thư, kèm link app và gợi ý "Hôm nay lười? 10 phút thôi". Đọc Gist lỗi thì không gửi (tránh làm phiền sai), ghi log lỗi không lộ secret. Có `workflow_dispatch` để thử tay.
- **Lịch .ics:** file tĩnh `public/lumos-reminders.ics` (2 sự kiện lặp hằng ngày 12:00 và 21:30 Asia/Ho_Chi_Minh, link app, không dữ liệu cá nhân) để subscribe qua URL Pages; và nút tải `.ics` theo giờ Huy chọn trong app.
- **Nhắc trong app:** giờ nhắc lưu ở key `reminders: { times: ['12:00','21:30'], updatedAt }` (đồng bộ). Mở app sau giờ nhắc đầu tiên mà hôm nay chưa học thì trang Hôm nay hiện dải nhắc nhẹ (đóng được trong ngày). Không web push (Đợt 2).
- **Hướng dẫn** trong README: tạo PAT gist, tạo bot qua BotFather, lấy chat id, thêm 4 GitHub Secrets, bật workflow, subscribe lịch.

**Problem:** Không có gì nhắc Huy học và không có bản sao ngoài Supabase do chính Huy giữ; đây là hai lan can chống bỏ cuộc (CAP-21, CAP-22).

**Approach:** Module Gist chạy ở trình duyệt (tạo/ghi/đọc qua GitHub REST), lịch ghi tự động gắn vào sự kiện buổi học và xuống nền; script Node + workflow cron đọc `status.json` rồi gửi Telegram; file `.ics` tĩnh và tạo được trong app; dải nhắc trên trang Hôm nay.

## Boundaries & Constraints

**Always:**
- Repo public: token bot, chat id, gist id chỉ ở GitHub Secrets; PAT chỉ ở localStorage, chỉ quyền gist; không ghi key/PAT lên Gist; workflow không `echo` secret, không bật debug in secret.
- Logic quyết định (ghi khi nào, nội dung `status.json`, có gửi tin không theo giờ VN, sinh `.ics`, khi nào hiện dải nhắc) là hàm thuần có test (`src/**/*.test.ts`); script Node dùng lại logic qua file `.mjs` mà test import được.
- Gist API gọi qua một module (`src/lib/gist/*`) nhận `fetch` để test; header `Authorization: Bearer <PAT>`.
- Store lên version kế tiếp với key `reminders` (gộp theo `updatedAt`).
- Tiếng Việt, 375px.

**Never:**
- Không web push, không backend riêng, không lưu PAT/bot token trong `store.data`, không gửi Telegram từ trình duyệt.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lần đầu nhập PAT | PAT hợp lệ, chưa có gist id | Tạo secret gist 2 file, lưu gist id | PAT sai (401): báo lỗi, không lưu |
| Xong buổi | Có PAT + gist id | Ghi `lumos-backup.json` + `status.json` (`studied: true`) | Lỗi: trạng thái "chưa ghi được", thử lại sau |
| Xuống nền | Dữ liệu đổi, lần ghi trước > 10 phút | Ghi Gist | N/A |
| Xuống nền liên tục | Lần ghi trước < 10 phút | Không ghi | N/A |
| Không có PAT | Chưa nhập | Không gọi mạng, trang mời nhập | N/A |
| Backup lên Gist | Store có key lạ / key API | File chỉ có key allowlist | N/A |
| Khôi phục từ Gist | Gist có backup | Gộp như story 7 | Gist lỗi: báo lỗi, không đổi gì |
| Cron 21:30, chưa học | `status.json` date ≠ hôm nay (VN) hoặc `studied: false` | Gửi tin Telegram | N/A |
| Cron, đã học | `status.json` date = hôm nay, `studied: true` | Không gửi | N/A |
| Cron, Gist lỗi | 404/401/mạng | Không gửi, log lỗi không lộ secret | Lỗi lâu dài (Gist 401/404, Telegram 400/401/403/404): workflow fail đỏ để GitHub báo email; lỗi tạm (mạng, 5xx, 429): exit 0 + cảnh báo |
| Lệch múi giờ | Học lúc 23:30 giờ VN | `status.json` date = ngày VN đó | N/A |
| `.ics` | Giờ 12:00, 21:30 | 2 VEVENT `RRULE:FREQ=DAILY`, `TZID=Asia/Ho_Chi_Minh`, có link app | N/A |
| Dải nhắc | 13:00, chưa học | Hiện dải nhắc; đóng thì ẩn tới mai | N/A |
| Dải nhắc, đã học | Đã có buổi hôm nay | Không hiện | N/A |

</frozen-after-approval>

## Code Map

- Story 7: `src/lib/backup/` (`createBackup`, `restoreBackup`, `BACKUP_KEYS`), `src/pages/Backup.tsx` -- dùng lại định dạng và gộp.
- Story 4: `src/lib/sessions/` (`recordSession`, `computeStreak`, `localDayKey`), `src/pages/Session.tsx`, `src/pages/LazySession.tsx` -- điểm gắn "xong buổi".
- `src/lib/sync/engine.ts` -- mẫu nghe `visibilitychange`/`pagehide` (`browserEnvironment`).
- Story 9: `src/lib/ai/key.ts` -- mẫu lưu bí mật ở localStorage ngoài store.
- `.github/workflows/deploy.yml` -- mẫu workflow (Node 22); workflow mới riêng, không đụng deploy.
- `README.md` -- mục cấu hình Supabase là mẫu viết hướng dẫn.
- `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts`.
- GitHub REST: `POST /gists` (`public: false`), `PATCH /gists/{id}`, `GET /gists/{id}`; Telegram: `POST https://api.telegram.org/bot<token>/sendMessage`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/gist/` (+ test) -- `createGist`, `writeGist`, `readGist`, `statusFor(store, now)`, `shouldAutoWrite(lastWriteAt, changed, now)`, lưu/xoá PAT và gist id.
- [x] `scripts/owl-post/decide.mjs`, `scripts/owl-post/send.mjs` (+ `src/lib/owl-post.test.ts` import `decide.mjs`) -- `shouldSend(status, nowUtc)` theo ngày VN, nội dung tin.
- [x] `.github/workflows/owl-post.yml` -- cron 3 mốc + `workflow_dispatch`, Node 22, đọc secrets qua `env`, không echo.
- [x] `src/lib/reminders/` (+ test) -- `buildIcs(times, appUrl)`, `showReminderBanner(store, now, dismissedDay)`; `public/lumos-reminders.ics`.
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (+ test) -- version mới, `reminders`.
- [x] `src/pages/OwlPost.tsx`, `src/pages/Today.tsx`, `src/app/routes.tsx`, `src/app/AppShell.tsx`, chỗ "xong buổi" -- trang cài PAT/Gist/giờ nhắc/tải .ics, dải nhắc, ghi Gist tự động.
- [x] `README.md`, `stack.md` -- hướng dẫn và ghi chú bảo mật.

**Acceptance Criteria:**
- Given đã nhập PAT, when xong buổi học, then secret gist có `status.json` của hôm nay với `studied: true` và backup chỉ chứa dữ liệu học.
- Given chạy tay workflow lúc chưa học, when xem Telegram, then nhận tin Owl Post; khi đã học thì không nhận.
- Given repo, when grep token/PAT/gist id/chat id, then không có giá trị thật nào.

## Implementation Notes

## Spec Change Log

- **Review vòng 1 (2026-11-02), Claude sửa thay Huy theo uỷ quyền chạy liên tục.** Finding: lỗi lâu dài của cron (PAT hết hạn, gist bị xoá) chỉ là cảnh báo nên Owl Post im lặng ngừng mà không ai biết. Sửa cột Error Handling của dòng "Cron, Gist lỗi": lỗi lâu dài fail đỏ (GitHub gửi email), lỗi tạm vẫn exit 0. KEEP: toàn bộ phần còn lại.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Hai máy cùng nối Gist ghi đè nhau: máy chưa thấy buổi học của máy kia ghi `studied: false`, cron nhắc sai; backup của máy kia mất | medium | `writeGist` PATCH nguyên file từ store local; chỉ đọc Gist lúc `connect` | patch |
| 2 | blind, edge | `status.json` lấy ngày theo múi giờ máy, cron theo giờ VN | medium | `statusFor` dùng `localDayKey` | patch |
| 3 | blind, edge (×2) | Nối gist có sẵn mà backup trên đó hỏng / do app mới hơn ghi thì vẫn ghi đè; lưu thông tin nối trước khi gộp xong nên lần ghi nền có thể đè | medium | `connect` biến lỗi parse thành `backup: null` rồi trang gọi `writeNow` | patch |
| 4 | blind, edge | Nối gist có sẵn chỉ `GET` nên PAT không ghi được vẫn báo "Đã nối" | medium | Secret gist đọc được bằng id | patch |
| 5 | verif-gap | Xong buổi → `writeNow` (điểm then chốt của AC) không có test | medium | Chỉ test writer trực tiếp | patch |
| 6 | blind | Lỗi lâu dài của cron (PAT hết hạn 401, gist bị xoá 404) chỉ là cảnh báo, không ai biết | medium | Mọi lỗi đều exit 0 | patch |
| 7 | blind | Tin Telegram nhắc "chuỗi N ngày" khi chuỗi đã đứt | low | Chỉ nhắc khi `status.date` là hôm qua | patch |
| 8 | blind, edge | Trang và writer hiểu "dữ liệu không đọc được" khác nhau; thiếu trạng thái read-only (app mới hơn) | low | `unavailable`, `newer-version` | patch |
| 9 | blind, edge | Nháp giờ nhắc cũ đè giờ mới sau đồng bộ; giờ trống bị bỏ âm thầm; tải `.ics` rỗng | low | `useState(reminders.times)` một lần | patch |
| 10 | blind, edge | "Thay PAT" xoá gist id tạo gist mới, `GIST_ID` secret mồ côi | low | Cảnh báo + README | patch |
| 11 | blind | README chưa nói secret gist chỉ là "không công khai", ai có id đều đọc được | low | Thêm ghi chú | patch |
| 12 | verif-gap | Kiểu MIME `.ics` khi tải/chia sẻ không có test | low | Thêm test | patch |
| 13 | blind | Ghi lúc xuống nền dễ bị huỷ trên iOS (không `keepalive`, body > 64 KB) | maybe-false | Cần thiết kế riêng; đã có mục defer tương tự từ story 2a | defer |
| 14 | blind | URL app viết cứng 4 chỗ | low | Repo của chính Huy | reject |
| 15 | edge | Đổi gist khi đang ghi dở; throttle mất khi localStorage lỗi | low | Hiếm | reject |
| 16 | verif-gap | Không kiểm `.ics` bị loại khỏi navigateFallback | low | Cấu hình một dòng | reject |
| 17 | edge | Task ghi `AppShell.tsx` nhưng không đổi file đó | low | Sổ sách | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `node scripts/owl-post/send.mjs --dry-run` với status giả -- expected: in quyết định, không gọi mạng.

**Manual checks:**
- Headless 375px: trang Owl Post (không có PAT thật), tải .ics, dải nhắc; không tràn ngang.
