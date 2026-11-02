# Stack & quyết định kỹ thuật

| Mảng | Quyết định | Lý do / ghi chú |
|---|---|---|
| UI | React + shadcn/ui; Drawer/Sheet cho điều hướng phụ | Huy chọn |
| Animation | Framer Motion | Hiệu ứng Lumos và cú đưa thư (CAP-20) |
| Kiến trúc | Front-end + Supabase (BaaS), không backend tự viết, không Edge Function | Dùng cá nhân, gói free, chi phí $0 |
| Lưu trữ | Local-first: localStorage (tiến độ, SRS, sổ tay, sổ lỗi, API key) luôn đọc/ghi trước, chạy offline. Supabase là nơi lưu chính và bản chuẩn khi đổi máy: bảng `user_store` (một hàng mỗi user, `data jsonb` = các key trong allowlist `SYNCED_KEYS`, có `schema_version`), RLS theo `auth.uid()` | Story 2a. Đẩy sau mỗi lần sửa (debounce), kéo + gộp khi mở app / online lại / quay lại app. Tiến độ gộp theo từng bài, `updatedAt` mới hơn thắng. Không realtime. Không bao giờ đồng bộ API key/PAT/token |
| Đăng nhập | Supabase Auth, mã OTP 6 số qua email (gõ trong app, không magic link) | PWA iPhone có bộ nhớ tách khỏi Safari. Bắt buộc đăng nhập; phiên lưu trên máy cho phép học offline |
| Cấu hình Supabase | Chỉ URL + anon (publishable) key, qua biến build `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (GitHub Actions Variables). Thiếu biến thì app chạy chỉ local | Không có service key ở repo hay app |
| Đóng gói | PWA (vite-plugin-pwa) | Cài lên iPhone qua "Thêm vào MH chính" |
| Hosting | GitHub Pages, repo public | Miễn phí. Vì repo public nên mọi bí mật để ở localStorage hoặc GitHub Secrets, asset HP chỉ dùng loại "lấy cảm hứng" |
| AI | BYOK: key nhập trong app, lưu localStorage, không commit/deploy. Gọi thẳng từ FE | Chỉ dùng cá nhân, Huy đã xác nhận |
| Hội thoại giọng nói realtime | Gemini Live API | CAP-16, làm ở Đợt 3 |
| Luyện nói khi không có giọng nói trong app | Link sang Gemini hoặc AI luyện nói miễn phí khác, kèm prompt roleplay đã soạn sẵn | Fallback cho iOS Safari, và là dạng dùng trong Đợt 1 |
| Hội thoại với Claude | STT trình duyệt → Claude → `speechSynthesis` | Ghép thủ công |
| TTS / STT | Web Speech API | CAP-10. STT chạy tốt trên Chrome/Edge, Firefox chưa hỗ trợ. **Rủi ro:** iOS Safari cần kiểm chứng; nếu không chạy thì app ẩn phần so khớp giọng nói và vẫn giữ nút nghe |
| Push | Browser Notification. Web push (Đợt 2) do cron GitHub Actions gửi: VAPID private key để trong Secrets, push subscription lưu trên Gist | Web push trên iOS cần bản 16.4+ và app phải được cài lên MH chính |
| Lịch | File tĩnh `public/lumos-reminders.ics` (12:00 và 21:30 Asia/Ho_Chi_Minh, `RRULE:FREQ=DAILY`, CRLF, `-text` trong `.gitattributes`) để subscribe qua URL Pages; nút tải `.ics` theo giờ nhắc trong app (`buildIcs`). Service worker không trả `index.html` cho `*.ics` (`navigateFallbackDenylist`). Giờ nhắc ở `store.data.reminders` (schema v11, đồng bộ, gộp cả object theo `updatedAt`), dùng cho dải nhắc trên trang Hôm nay | CAP-21 (story 13) |
| Trạng thái + bản sao tự động | Secret GitHub Gist, ghi bằng PAT (BYOK, chỉ cấp quyền `gist`, lưu localStorage `lumos-english:gist-token` / `lumos-english:gist-id`, ngoài `store.data`). Gist có 2 file: `lumos-backup.json` (định dạng backup story 7, chỉ allowlist) và `status.json` (`{ date, studied, kind, streak, updatedAt }`). Ghi ngay khi xong buổi và khi xuống nền (dữ liệu đổi, ≥ 10 phút/lần); trước mỗi lần ghi đọc gist, gộp bản sao về store (`restoreBackup`) và không hạ `studied: true` cùng ngày VN; không ghi khi dữ liệu máy hỏng / chỉ đọc hoặc bản sao trên gist hỏng / do app mới hơn ghi. `date` theo ngày VN (`vnDayKey` dùng chung với cron). Secret gist chỉ là không liệt kê: ai có id đều đọc được. Module `src/lib/gist` nhận `fetch` để test | CAP-21, CAP-22 (story 13; Supabase không thay Gist). Không bao giờ ghi API key hay PAT lên Gist, không log PAT |
| Backup thủ công | Export/import file JSON | CAP-22 |
| Telegram "Owl Post" | `.github/workflows/owl-post.yml` cron 12:00, 15:30, 21:30 giờ VN (UTC 05:00, 08:30, 14:30) + `workflow_dispatch`, Node 22, chạy `scripts/owl-post/send.mjs` (logic thuần ở `decide.mjs`, test trong `src/lib/owl-post.test.ts`). Đọc `status.json`: hôm nay (Asia/Ho_Chi_Minh) chưa học thì nhắc, đã học thì không gửi; đọc Gist lỗi thì không gửi; lỗi lâu dài (Gist 401/404, Telegram 400/401/403/404) exit 1 để GitHub email chủ repo, lỗi tạm (mạng, 5xx, 429) cảnh báo và exit 0 | FE không chạy được khi tab đóng. `GIST_ID`, `GIST_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` chỉ ở GitHub Secrets, đọc qua `env`, không echo; log tự che secret |
| Feed tin | Gọi trực tiếp: HN API, HN Algolia, Google AI Blog RSS (parse bằng `DOMParser`) | Không dùng proxy. VOA, BNE, OpenAI và podcast chỉ link ra ngoài |
| Video | Embed YouTube bằng IFrame Player API, widget YouGlish (cho clip nói tắt) | Theo `nguon-hoc-mien-phi.md` |
| Phụ đề | Claude tự làm sub lúc build, chạy bằng script ngoài app: lấy sub Anh có timestamp (caption YouTube hoặc transcript VOA) → AI dịch sang Việt và chú thích idiom/nói tắt/nghĩa ngữ cảnh → lưu JSON tĩnh theo từng video. App overlay sub theo `getCurrentTime()` của player | CAP-12, CAP-14 |
| Dữ liệu từ vựng | Đóng gói NGSL + TSL thành JSON tĩnh (`src/data/vocab/words.json`, nạp bằng dynamic import nên là chunk riêng), ghi nguồn CC BY-SA 4.0. IPA kiểu Mỹ, âm tiết + trọng âm, từ loại, nghĩa Việt và câu ví dụ do AI sinh lúc build bằng script ngoài app (`npm run vocab:build`, xem mục dưới) | Oxford 3000 chỉ dùng làm thứ tự học và link. Story 3 |
| Flashcard SRS | Thuật toán kiểu SM-2 tự viết (`src/lib/srs`), 4 nút Quên/Khó/Nhớ/Dễ, 10 từ mới/ngày theo giờ máy, "Đã biết" xếp lịch 60 ngày. Trạng thái ở `store.data.srs.cards` (schema v4), đồng bộ Supabase, gộp từng thẻ theo `updatedAt` | Story 3. Không xoá/reset thẻ |
| AI giải thích lỗi | Gemini (gói free), BYOK | CAP-19. Dùng lại key này cho Gemini Live ở Đợt 3 |

## Bộ từ vựng: `npm run vocab:build`

- `scripts/vocab/source/`: CSV gốc NGSL 1.2 + TSL 1.2 (giữ nguyên byte) và `README.md` ghi nguồn, giấy phép.
- `scripts/vocab/ai/*.json`: dữ liệu AI theo lô ~200 từ, đặt tên theo hạng (`ngsl-0001-0200.json`, …). Mỗi mục `{ word, pos, ipa, syllables[], stressIndex, meaningVi, exampleEn, exampleVi }`; `word` viết đúng như trong CSV; `pos` thuộc `noun|verb|adjective|adverb|pronoun|preposition|conjunction|determiner|number|interjection`; `ipa` kiểu Mỹ (như Cambridge US), không có `/`, có `ˈ` trước âm nhấn khi nhiều âm tiết, dùng `ː` (không dùng `'` hay `:`); `syllables` là âm tiết theo chính tả, ghép lại đúng bằng từ; `stressIndex` là vị trí âm nhấn trong `syllables`.
- **Thêm lô mới:** sinh lô bằng AI ở ngoài app (không commit API key), lưu vào `scripts/vocab/ai/`, kiểm bằng `node scripts/vocab/check-batch.mjs <file> <hạng đầu> <hạng cuối>` (thêm `tsl` ở cuối cho lô TSL), rồi chạy `npm run vocab:build` và commit cả lô lẫn `words.json`. Từ chưa có dữ liệu AI vẫn nằm trong `words.json` nhưng không được đưa vào phiên ôn.
- **Phạm vi (story 3a):** đủ dữ liệu AI cho toàn bộ 2809 NGSL + 1250 TSL (22 lô: `ngsl-0001-0200` … `ngsl-2801-2809`, `tsl-0001-0200` … `tsl-1201-1250`). Phiên ôn đi hết NGSL theo hạng rồi tới TSL hạng 1, 2, …. Từ có ở cả hai danh sách là hai thẻ riêng (`ngsl-x`, `tsl-x`). TSL `résumé` là danh từ (CV), `resume` là động từ (tiếp tục).
- **Precache offline:** chunk `words-*.js` (~1.2 MB) phải nằm trong precache của service worker. `vite.config.ts` đặt `workbox.maximumFileSizeToCacheInBytes` = 4 MiB (mặc định 2 MiB); vite-plugin-pwa làm build lỗi nếu asset vượt giới hạn; `npm run build` chạy thêm `scripts/check-precache.mjs` để fail nếu precache manifest trong `dist/sw.js` thiếu chunk `words-*.js` vì lý do khác (vd globPatterns).
- `vocab:build` kiểm: không trùng id, từ có trong NGSL/TSL, không trùng giữa các lô, `stressIndex` nằm trong `syllables`, IPA có `ˈ` khi nhiều âm tiết. Lỗi thì dừng, không ghi. Kết quả xác định: chạy lại không đổi nội dung.
- Id thẻ là `ngsl-<từ>` / `tsl-<từ>` (giữ dấu, vì TSL có cả `resume` và `résumé`), không theo hạng, nên đổi phiên bản danh sách không làm lệch thẻ SRS.

## Đã loại

- **TestFlight:** tốn ~99 USD/năm.
- **Cài qua Xcode bằng Apple ID free:** app hết hạn sau 7 ngày.
- **Hướng sau này:** bọc bằng Capacitor nếu cần app native.
