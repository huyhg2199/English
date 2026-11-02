---
title: 'Video song ngữ Anh–Việt, chú thích và ẩn sub điền từ (CAP-12)'
type: 'feature'
created: '2026-11-02'
status: 'in-progress'
baseline_commit: '0096d7bbed8e26fb599b315279ff469e00c6e1a3'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy chọn "nhúng video rồi làm phụ đề song ngữ" ngày 2026-11-02; chi tiết Claude chọn)
- **Chỉ video VOA Learning English** (public domain) trong dữ liệu story 15 được làm phụ đề: lưu nguyên văn transcript tiếng Anh có mốc thời gian vào repo là hợp lệ. Video BBC, Rachel's English, TED-Ed (có bản quyền) **không** lưu transcript; vẫn xem như story 15.
- **Nguồn sub Anh:** caption tiếng Anh có mốc thời gian của chính video trên YouTube (caption do kênh VOA đăng, không dùng caption tự động nếu có bản do kênh đăng), lấy bằng script ngoài app lúc build. Video không lấy được caption có mốc thời gian thì bỏ qua (không bịa mốc, không tự canh giờ).
- **Sub Việt và chú thích:** do Claude dịch lúc build (theo `stack.md`), mỗi câu (cue) có bản dịch tự nhiên; câu có idiom / nói tắt (gonna, wanna…) / nghĩa theo ngữ cảnh thì có chú thích `{ term, kind: 'idiom' | 'reduction' | 'context', noteVi }`.
- **Highlight câu liên quan bài:** cue chứa cấu trúc của thì bài đang học hoặc từ NGSL/TSL Huy đã học được tô nổi; lý do hiện khi chạm ("Hiện tại đơn", "Từ đã học: …"). Thì của bài tính theo bài gắn video (story 15 `lessonId`).
- **Hiển thị:** dưới video có 2 dòng sub (Anh trên, Việt dưới) chạy theo thời gian player (YouTube IFrame Player API qua `youtube-nocookie.com`, `enablejsapi=1`, đọc `getCurrentTime()` ~4 lần/giây). Chọn chế độ: **Anh + Việt** (mặc định) / **Chỉ Anh** / **Ẩn sub**. Bên dưới có bản transcript cuộn được, câu đang phát được tô, chạm câu thì tua tới câu đó. (Thang trượt tự lên cấp sub là Đợt 3, không làm.)
- **Ẩn sub điền từ:** chế độ "Điền từ": mỗi cue ẩn 1–2 từ khoá (ưu tiên từ NGSL/TSL đã học hoặc từ của bài, bỏ từ chức năng); hết câu thì video tạm dừng, Huy gõ từ còn thiếu (không phân biệt hoa thường, dấu câu), "Bỏ qua" được; đúng/sai hiện ngay rồi phát tiếp. Kết quả mỗi video lưu % đúng tốt nhất và số lần (key `videoPractice`, đồng bộ) để Đợt 3 dùng cho thang trượt.
- Video không có sub thì giữ nguyên player story 15 (không hiện khu vực sub).

**Problem:** Video trong bài chỉ xem trơn; người mất gốc không theo kịp lời thoại, không biết idiom/nói tắt, và không có cách luyện nghe chủ động từ chính video (CAP-12).

**Approach:** Script build lấy caption Anh có mốc thời gian của video VOA, Claude dịch + chú thích + đánh dấu, lưu JSON tĩnh theo video (tải lười). Player story 15 thêm IFrame API để đồng bộ sub, transcript, chế độ hiển thị và chế độ điền từ; kết quả điền từ lưu vào store.

## Boundaries & Constraints

**Always:**
- Không lưu transcript của nguồn có bản quyền; chỉ VOA. Mỗi file sub ghi nguồn (kênh, URL video, "public domain – VOA").
- Mốc thời gian lấy từ caption thật; test cấu trúc: cue tăng dần, không chồng nhau, có cả `en` và `vi`, chú thích có `term` nằm trong câu `en`, file sub chỉ cho video có trong dữ liệu story 15 và kênh VOA.
- Logic chọn cue theo thời gian, chọn từ ẩn, chấm từ điền, highlight là hàm thuần có test.
- Store lên version kế tiếp: `videoPractice: { items: { [videoId]: { best, attempts, updatedAt } } }`, vào `SYNCED_KEYS`, gộp theo video (best/attempts lấy max, `updatedAt` mới hơn).
- Sub tải lười (dynamic import / fetch file tĩnh), không vào chunk chính; precache không vượt giới hạn hiện có.
- Tiếng Việt, 375px: sub không che nút điều khiển video, chữ đủ lớn.

**Never:**
- Không thang trượt tự lên cấp (Đợt 3), không nhận giọng nói, không tải video.
- Không dùng caption tự động khi kênh có caption đăng sẵn; không tự canh giờ khi không có caption.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Video có sub | Video VOA có file sub, đang phát ở 12,3 s | Hiện cue có `start ≤ 12,3 < end`, Anh + Việt | N/A |
| Khoảng lặng | Thời điểm không thuộc cue nào | Không hiện sub | N/A |
| Chỉ Anh | Chọn "Chỉ Anh" | Chỉ dòng Anh | N/A |
| Ẩn sub | Chọn "Ẩn sub" | Không dòng nào, transcript ẩn | N/A |
| Tua | Chạm câu trong transcript | Video tua tới `start` câu đó | N/A |
| Chú thích | Cue có "gonna" | "gonna" gạch chân; chạm thấy giải thích tiếng Việt | N/A |
| Highlight | Bài hiện tại đơn, cue "She works here." | Cue được tô, lý do "Hiện tại đơn" | N/A |
| Điền từ | Hết cue có từ ẩn | Video dừng, ô nhập hiện; gõ đúng → đúng, phát tiếp | Gõ sai: hiện đáp án, phát tiếp |
| Bỏ qua | Bấm "Bỏ qua" | Tính sai, phát tiếp | N/A |
| Lưu kết quả | Xong 10 câu điền từ, đúng 7 | `best = 70`, `attempts + 1` | N/A |
| Video không sub | Video BBC | Player như story 15, không khu vực sub | N/A |
| File sub lỗi / offline | Không tải được sub | Video vẫn xem được, báo "Chưa tải được phụ đề" | Không crash |
| API player lỗi | IFrame API không sẵn sàng | Video vẫn phát, sub không chạy, có thông báo | Không crash |
| Hai máy | best 60 ở A, 90 ở B | Sau đồng bộ best 90 | N/A |

</frozen-after-approval>

## Code Map

- Story 15: `src/data/videos/` (`videos.json`, `videosFor`, `embedUrl`, `watchUrl`), `src/components/media/VideoEmbed.tsx` (thumbnail → iframe khi bấm), `scripts/videos/check.mjs` (oEmbed). Mở rộng player, không phá video không có sub.
- `src/data/lessons/` + `src/lib/spells.ts` -- thì của bài (để highlight); `src/data/vocab`, `src/lib/srs` (`readCards`) -- từ đã học.
- `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (`SYNCED_KEYS`, `MERGERS`, `mergeEntries`), `src/lib/backup/backup.ts` (`ENTRY_FIELD`, `ENTRY_VALID`) -- thêm key `videoPractice`.
- `vite.config.ts` / `scripts/check-precache.mjs` -- chunk sub tải lười.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`; `npm test` chạy với `TZ=Asia/Ho_Chi_Minh`.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/subs/fetch-captions.mjs` -- lấy caption Anh có mốc thời gian cho video kênh VOA trong `videos.json` (ghi rõ video nào không lấy được).
- [ ] `src/data/subs/<videoId>.json` (+ `src/data/subs/subs.test.ts`) -- cue `{ start, end, en, vi, notes?, highlight? }` + metadata nguồn; Claude dịch và chú thích.
- [x] `src/lib/subs/` (+ test) -- `cueAt(cues, t)`, `pickBlanks(cue, knownWords, lessonWords)`, `checkFill(expected, typed)`, `highlightReason(cue, lesson, knownWords)`.
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts`, `src/lib/backup/backup.ts` (+ test) -- version mới, `videoPractice`.
- [x] `src/lib/youtube-player.ts` -- tải IFrame API theo yêu cầu, bọc `getCurrentTime/seekTo/pause/play`, lỗi thì trả null.
- [x] `src/components/media/SubtitledVideo.tsx`, `SubtitleLines.tsx`, `TranscriptList.tsx`, `FillInPrompt.tsx`, `VideoEmbed.tsx` -- sub, chế độ, transcript, điền từ.
- [x] `stack.md` -- ghi quy trình làm sub và giới hạn chỉ VOA.

**Acceptance Criteria:**
- Given một video VOA có sub trong bài, when phát, then thấy sub Anh + Việt đúng câu đang nói, chạm câu trong transcript thì tua tới đó.
- Given chế độ "Điền từ", when xem hết một câu có từ ẩn, then video dừng, gõ được từ, kết quả lưu sau khi tải lại trang.

## Implementation Notes

- **Chưa có file sub nào.** `npm run subs:fetch` (2026-11-03) lấy được 0/7 video VOA: YouTube không trả `captionTracks` cho request không phải trình duyệt, và endpoint `timedtext` trả rỗng. Theo luật "không lấy được caption có mốc thì bỏ qua", không có file `src/data/subs/*.json` nào được tạo; mọi video vẫn chạy như story 15. Cần tải caption VOA bằng `yt-dlp --skip-download --write-subs --sub-langs en --sub-format vtt -P scripts/subs/captions/source -o "%(id)s" <url>`, chạy lại `npm run subs:fetch`, rồi Claude dịch thành `src/data/subs/<id>.json`.
- Player gắn vào iframe có sẵn bằng `new YT.Player(iframe, { host: 'https://www.youtube-nocookie.com' })`; mỗi iframe chỉ gắn một lần (gắn lần hai, vd effect StrictMode, YouTube trả `alreadyInitialized` và không báo `onReady`).
- Lượt điền từ được ghi khi video hết (đang mở ô thì sau khi trả lời / bỏ qua), khi đổi khỏi chế độ "Điền từ", khi gỡ component, `pagehide` hoặc `visibilitychange` hidden; chỉ khi đủ dài (≥ 5 câu hoặc ≥ 50% câu có từ ẩn). Một lượt = các câu đã trả lời, câu đúng khi mọi ô đúng. Câu hết trong cùng một nhịp đọc được xếp hàng hỏi lần lượt.
- Player không phản hồi: nút "Thử lại" dựng iframe mới (key mới) và gắn player mới; không gắn YT.Player thứ hai vào iframe cũ. "Điền từ" bị khoá tới khi player sẵn sàng.
- Kiểm UI bằng headless Chrome 375px với file sub tạm (đã xoá): sub chạy theo thời gian, tua từ transcript, chú thích, đổi chế độ, điền từ dừng video / chấm / phát tiếp, kết quả còn sau tải lại, video không sub giữ nguyên, không tràn ngang.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge (×2) | Chunk `SubtitledVideo` tải lỗi (offline, hash cũ sau deploy) làm sập cả app | high | `lazy(import)` không có ErrorBoundary; trái I/O "File sub lỗi / offline … không crash" | patch |
| 2 | blind, edge (×2) | Từ ẩn đổi giữa video khi SRS đồng bộ về | medium | `useMemo` phụ thuộc `knownWords` dựng lại theo `store.data.srs` | patch |
| 3 | blind, edge | Player lỗi (timeout API) không có "Thử lại"; gắn lại sẽ tạo `YT.Player` thứ hai trên cùng iframe | medium | `attached.delete` khi timeout | patch |
| 4 | blind, edge | Chế độ "Điền từ" vẫn chọn được khi player lỗi | low | Không có thời gian nên không dừng | patch |
| 5 | edge (×2) | Poll bị chậm (tab nền) bị coi là tua nên bỏ câu; hai câu ngắn trong một lần poll thì câu thứ hai bị bỏ | medium | `fillDue` chỉ trả câu đầu, ngưỡng 1,5 s | patch |
| 6 | blind, edge | Lượt điền từ dở dang (1 câu) đã ghi `best`; `ended` lúc đang mở câu cuối tách thành lượt riêng | medium | Đợt 3 dùng `best` cho thang trượt | patch |
| 7 | edge | iOS đóng PWA chỉ có `visibilitychange`, lượt đang làm bị mất | low | Chỉ nghe `pagehide`/unmount | patch |
| 8 | edge | Gõ "checkin" cho "check-in" bị chấm sai | low | Chuẩn hoá thêm bản bỏ khoảng trắng | patch |
| 9 | blind, edge, verif-gap | File `.asr.*` local được dùng mà không kiểm kênh có caption đăng sẵn (trái "Never"); thứ tự chọn không có test | medium | `localSource` | patch |
| 10 | blind | Lệnh yt-dlp trong tài liệu tạo tên file mà script không đọc | medium | yt-dlp mặc định `<title> [<id>].en.vtt` | patch |
| 11 | blind, edge | Caption tự động dạng cuộn bị lặp cụm khi gộp | medium | Chỉ bỏ dòng trùng y hệt | patch |
| 12 | edge | Parser: hai cue cùng `start` mất chữ; entity số quá lớn và event `null` làm hỏng cả video; CLI id lạ / JSON không phải mảng không báo rõ | low | Sửa trực tiếp | patch |
| 13 | verif-gap, edge | Test dữ liệu sub chạy 0 ca khi chưa có file; `loadSubs` chưa có test đường thành công; check precache đạt "cho có" | medium | `it.each([])` | patch |
| 14 | verif-gap | Dựng `knownWords` từ store không có test | low | Tách `knownWordsFromStore` | patch |
| 15 | blind | Từ ẩn hay chọn tên riêng (Washington, Anna) | low | Loại từ viết hoa không ở đầu câu | patch |
| 16 | verif-gap | Máy trạng thái lượt điền từ (đếm, flush) chỉ trong component | low | Chưa có môi trường test component | defer |
| 17 | blind | `attempts` gộp lấy max nên đếm thiếu giữa hai máy | low | Đúng quyết định spec | reject |
| 18 | blind | Radio không có phím mũi tên; chữ nhỏ; không nhớ chế độ | low | Nhỏ | reject |
| 19 | blind | Story chưa có dữ liệu sub nhưng đánh dấu review | low | Đúng: chưa nghiệm thu được AC; story giữ `in-progress` tới khi có caption thật | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run videos:check` -- expected: mọi ID OK.

**Manual checks:**
- Headless 375px: video VOA có sub chạy theo thời gian, đổi chế độ, tua từ transcript, điền từ; video không sub như cũ; không tràn ngang.
