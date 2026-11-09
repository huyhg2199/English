---
title: 'Video song ngữ Anh–Việt, chú thích và ẩn sub điền từ (CAP-12)'
type: 'feature'
created: '2026-11-02'
status: 'done'
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
- **Chỉ video VOA Learning English (public domain) hoặc video YouTube giấy phép CC BY có caption tiếng Anh do kênh đăng** trong dữ liệu video được làm phụ đề: lưu nguyên văn transcript tiếng Anh có mốc thời gian và bản dịch vào repo là hợp lệ, kèm ghi nguồn + giấy phép + "bản dịch tiếng Việt do Lumos thực hiện". Video BBC, Rachel's English, TED-Ed (có bản quyền, không phải CC) **không bao giờ** lưu transcript; vẫn xem như story 15. *(Sửa 2026-11-10, xem Spec Change Log.)*
- **Nguồn sub Anh:** caption tiếng Anh có mốc thời gian của chính video trên YouTube (caption do kênh đăng, không dùng caption tự động nếu có bản do kênh đăng; video CC BY bắt buộc có caption do kênh đăng), lấy bằng script ngoài app lúc build. Video không lấy được caption có mốc thời gian thì bỏ qua (không bịa mốc, không tự canh giờ).
- **Sub Việt và chú thích:** do Claude dịch lúc build (theo `stack.md`), mỗi câu (cue) có bản dịch tự nhiên; câu có idiom / nói tắt (gonna, wanna…) / nghĩa theo ngữ cảnh thì có chú thích `{ term, kind: 'idiom' | 'reduction' | 'context', noteVi }`.
- **Highlight câu liên quan bài:** cue chứa cấu trúc của thì bài đang học hoặc từ NGSL/TSL Huy đã học được tô nổi; lý do hiện khi chạm ("Hiện tại đơn", "Từ đã học: …"). Thì của bài tính theo bài gắn video (story 15 `lessonId`).
- **Hiển thị:** dưới video có 2 dòng sub (Anh trên, Việt dưới) chạy theo thời gian player (YouTube IFrame Player API qua `youtube-nocookie.com`, `enablejsapi=1`, đọc `getCurrentTime()` ~4 lần/giây). Chọn chế độ: **Anh + Việt** (mặc định) / **Chỉ Anh** / **Ẩn sub**. Bên dưới có bản transcript cuộn được, câu đang phát được tô, chạm câu thì tua tới câu đó. (Thang trượt tự lên cấp sub là Đợt 3, không làm.)
- **Ẩn sub điền từ:** chế độ "Điền từ": mỗi cue ẩn 1–2 từ khoá (ưu tiên từ NGSL/TSL đã học hoặc từ của bài, bỏ từ chức năng); hết câu thì video tạm dừng, Huy gõ từ còn thiếu (không phân biệt hoa thường, dấu câu), "Bỏ qua" được; đúng/sai hiện ngay rồi phát tiếp. Kết quả mỗi video lưu % đúng tốt nhất và số lần (key `videoPractice`, đồng bộ) để Đợt 3 dùng cho thang trượt.
- Video không có sub thì giữ nguyên player story 15 (không hiện khu vực sub).

**Problem:** Video trong bài chỉ xem trơn; người mất gốc không theo kịp lời thoại, không biết idiom/nói tắt, và không có cách luyện nghe chủ động từ chính video (CAP-12).

**Approach:** Script build lấy caption Anh có mốc thời gian của video VOA / CC BY, Claude dịch + chú thích + đánh dấu, lưu JSON tĩnh theo video (tải lười). Player story 15 thêm IFrame API để đồng bộ sub, transcript, chế độ hiển thị và chế độ điền từ; kết quả điền từ lưu vào store.

## Boundaries & Constraints

**Always:**
- Không lưu transcript của nguồn có bản quyền; chỉ VOA (public domain) hoặc video CC BY. Mỗi file sub ghi nguồn: kênh, URL video, giấy phép ("public domain – VOA" hoặc "CC BY 3.0 – <kênh>" kèm link kênh, link giấy phép và "Bản dịch tiếng Việt do Lumos thực hiện"); UI hiện phần ghi nguồn này.
- Mốc thời gian lấy từ caption thật; test cấu trúc: cue tăng dần, không chồng nhau, có cả `en` và `vi`, chú thích có `term` nằm trong câu `en`, file sub chỉ cho video có trong dữ liệu video và là VOA public domain hoặc CC BY.
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
| Video có sub | Video VOA / CC BY có file sub, đang phát ở 12,3 s | Hiện cue có `start ≤ 12,3 < end`, Anh + Việt | N/A |
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
- [x] `scripts/subs/fetch-captions.mjs` -- lấy caption Anh có mốc thời gian cho video VOA public domain / CC BY trong `videos.json` + `foundation-videos.json` (ghi rõ video nào không lấy được).
- [x] (Sửa 2026-11-10) `src/data/videos/` -- trường `license` (`public-domain` / `cc-by` / `youtube-standard`) + `channelUrl` cho video CC BY; thay 7 video VOA (không có caption) bằng video CC BY có caption do kênh đăng; VOA L1, L2 của buổi Sân ga chuyển sang `foundation-videos.json`; `scripts/videos/check.mjs` kiểm cả hai file.
- [x] (Sửa 2026-11-10) `scripts/subs/parse.mjs` -- `transcriptSource` / `canStoreTranscript` (VOA hoặc CC BY), giải mã entity hai lần (`&amp;nbsp;`); `scripts/subs/captions/<id>.json` cho 7 video CC BY (đã commit được, `captions/source/` git-ignore).
- [x] (Sửa 2026-11-10) `SubtitledVideo.tsx`, `VideoEmbed.tsx` -- ghi nguồn: kênh (link), giấy phép (link), video gốc, ghi chú bản Anh đã gộp câu / bỏ ký hiệu âm thanh, `source.translation`; nhãn "CC BY" cạnh tên kênh.
- [x] `src/data/subs/<videoId>.json` (+ `src/data/subs/subs.test.ts`) -- cue `{ start, end, en, vi, notes?, highlight? }` + metadata nguồn; Claude dịch và chú thích. (2026-11-10: đủ 7 video CC BY.)
- [x] `src/lib/subs/` (+ test) -- `cueAt(cues, t)`, `pickBlanks(cue, knownWords, lessonWords)`, `checkFill(expected, typed)`, `highlightReason(cue, lesson, knownWords)`.
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts`, `src/lib/backup/backup.ts` (+ test) -- version mới, `videoPractice`.
- [x] `src/lib/youtube-player.ts` -- tải IFrame API theo yêu cầu, bọc `getCurrentTime/seekTo/pause/play`, lỗi thì trả null.
- [x] `src/components/media/SubtitledVideo.tsx`, `SubtitleLines.tsx`, `TranscriptList.tsx`, `FillInPrompt.tsx`, `VideoEmbed.tsx` -- sub, chế độ, transcript, điền từ.
- [x] `stack.md` -- ghi quy trình làm sub và giới hạn VOA public domain / CC BY.

**Acceptance Criteria:**
- Given một video VOA / CC BY có sub trong bài, when phát, then thấy sub Anh + Việt đúng câu đang nói, chạm câu trong transcript thì tua tới đó.
- Given chế độ "Điền từ", when xem hết một câu có từ ẩn, then video dừng, gõ được từ, kết quả lưu sau khi tải lại trang.

## Implementation Notes

- **2026-11-03:** `npm run subs:fetch` lấy được 0/7 video VOA: YouTube không trả `captionTracks` cho request không phải trình duyệt, và endpoint `timedtext` trả rỗng.
- **2026-11-10:** kiểm thêm bằng `yt-dlp`: cả 10 video VOA đã thử không có caption tiếng Anh nào trên YouTube (kể cả caption tự động). Lý do chưa kiểm: đoán VOA in chữ vào hình, và chưa xác nhận trang VOA có bản chép lời kèm mốc thời gian hay không (lần tra trang VOA trả 404; Huy chưa báo kết quả bấm CC trên trình duyệt). Theo hướng 1 Huy chọn (Spec Change Log), 7 video VOA trong bài được thay bằng video CC BY có caption do kênh đăng (cùng bài, cùng đoạn): `n71cJHjH0_w` (s1-t1-w1 grammar), `POeCYBfFvgU` (s1-t1-w2 grammar), `VvZs9S-gtFs` (s1-t1-w2 entertainment, start 51 s), `RGFc-1uNHX8` (s1-t2-w2 grammar, start 20 s), `n7RA6XxfpNU` (s1-t2-w2 entertainment, start 24 s), `begKNGxcjdk` (s1-t3-w1 grammar), `sw1wGSmtIBs` (s1-t3-w4, ban đầu ở entertainment, sau review chuyển sang grammar vì là bài giảng ~16 phút). Caption tải bằng `yt-dlp --write-subs` thường (không cookie, không đổi client); `npm run subs:fetch` lấy được 7/7 (29, 41, 139, 82, 67, 81, 110 câu). `npm run videos:check`: 28/28 OK.
- **File sub tiếng Việt** (`src/data/subs/<id>.json`): đủ 7 video CC BY (483 chú thích). Test dữ liệu sub buộc mỗi file sub có file caption gốc tương ứng, nguồn đúng như `transcriptSource`, ít nhất 7 file, và mọi video `cc-by` đều có file sub. `transcriptSource` trả null cho CC BY với caption tự động, link kênh phải dạng `/channel/UC…`.
- **Quy tắc `highlight`:** id thì có trong câu (theo `src/data/lessons`); câu quá khứ đơn luôn có `past-simple`, có động từ bất quy tắc thì thêm `past-simple-irregular`; câu hiện tại hoàn thành ở bài s1-t3-w4 có `present-perfect-vs-past`.
- **Bằng chứng giấy phép** (`yt-dlp --skip-download --print "%(license)s|%(channel)s|%(channel_url)s"`, thường, không cookie, 2026-11-10): cả 7 video trả "Creative Commons Attribution license (reuse allowed)", kênh và link kênh khớp `videos.json`.

  | Video | Kênh | Ngày đăng | Thời lượng | Caption do kênh đăng |
  |---|---|---|---|---|
  | `n71cJHjH0_w` | GrammarBank | 2023-09-09 | 4:09 | `en-US` |
  | `POeCYBfFvgU` | pascualbravovirtual | 2019-08-12 | 5:06 | `en-US` |
  | `VvZs9S-gtFs` | English Moment | 2024-11-11 | 15:21 | `en` |
  | `RGFc-1uNHX8` | Englishing | 2017-07-10 | 10:59 | `en` |
  | `n7RA6XxfpNU` | English Moment | 2024-11-19 | 13:28 | `en` |
  | `begKNGxcjdk` | Englishing | 2017-07-03 | 10:36 | `en` |
  | `sw1wGSmtIBs` | English Lessons with Kate | 2025-11-06 | 16:41 | `en` |

  Chưa có bằng chứng ghi lại cho việc "không phải bản đăng lại của kênh khác": cần Huy xem tay.
- VOA Let's Learn English L1, L2 (`WR9_nsLyaEY`, `1-U7o9xjWQc`) không còn gắn bài nhưng vẫn là video "Giải trí nhẹ" của buổi Sân ga (story 21), nay ở `src/data/videos/foundation-videos.json`.
- Caption gốc: `n7RA6XxfpNU` có câu xếp lộn xộn trong file VTT, `VvZs9S-gtFs` có cue chồng giờ ở phần từ vựng; `normalizeCues` sắp lại và cắt chồng. Một số cue dài (tới ~26 s) là cue thật của kênh, giữ nguyên (không tự canh giờ).
- Player gắn vào iframe có sẵn bằng `new YT.Player(iframe, { host: 'https://www.youtube-nocookie.com' })`; mỗi iframe chỉ gắn một lần (gắn lần hai, vd effect StrictMode, YouTube trả `alreadyInitialized` và không báo `onReady`).
- Lượt điền từ được ghi khi video hết (đang mở ô thì sau khi trả lời / bỏ qua), khi đổi khỏi chế độ "Điền từ", khi gỡ component, `pagehide` hoặc `visibilitychange` hidden; chỉ khi đủ dài (≥ 5 câu hoặc ≥ 50% câu có từ ẩn). Một lượt = các câu đã trả lời, câu đúng khi mọi ô đúng. Câu hết trong cùng một nhịp đọc được xếp hàng hỏi lần lượt.
- Player không phản hồi: nút "Thử lại" dựng iframe mới (key mới) và gắn player mới; không gắn YT.Player thứ hai vào iframe cũ. "Điền từ" bị khoá tới khi player sẵn sàng.
- Kiểm UI bằng headless Chrome 375px với file sub tạm (đã xoá): sub chạy theo thời gian, tua từ transcript, chú thích, đổi chế độ, điền từ dừng video / chấm / phát tiếp, kết quả còn sau tải lại, video không sub giữ nguyên, không tràn ngang.

## Spec Change Log

- **2026-11-10 -- Mở thêm video CC BY (Huy chọn hướng 1, Claude hiểu là video CC BY; chờ Huy xác nhận).** Huy chỉ trả lời "1" = "đổi sang video khác có phụ đề kênh đăng sẵn, cùng chủ đề bài (VOA, BBC Learning English…)"; hướng 1 không nhắc CC BY. Vì luật "không lưu transcript của nguồn có bản quyền" vẫn giữ (BBC có bản quyền), Claude chỉ chọn video CC BY; việc nới luật "chỉ VOA" sang CC BY là cách Claude hiểu hướng 1, Huy cần xác nhận. Lý do: video VOA trên YouTube không có caption tiếng Anh nào (đã kiểm 10 video bằng yt-dlp; vì sao không có, và trang VOA có bản chép lời kèm mốc hay không, chưa kiểm), nên luật "chỉ VOA" khiến story không có dữ liệu. Sửa Intent / Boundaries: ngoài VOA (public domain) được dùng video YouTube giấy phép "Creative Commons Attribution license (reuse allowed)" (CC BY 3.0) có caption tiếng Anh do kênh đăng; được lưu transcript + bản dịch, ghi nguồn (kênh + link, video, giấy phép + link) và "bản dịch tiếng Việt do Lumos thực hiện". Nguồn có bản quyền không phải CC (BBC, Rachel's English, TED-Ed) vẫn không bao giờ lưu transcript. Hệ quả: `videos.json` có trường `license`, 7 video VOA trong bài được thay bằng video CC BY cùng chủ đề.

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
| 20 | blind, verif-gap | Story ghi "chưa có file sub tiếng Việt" (task `[ ]`, Implementation Note, comment `subs.test.ts`) nhưng diff thêm 7 file sub | low | `16-bilingual-subtitles.md` task + note, `subs.test.ts` comment "thêm dần" | patch |
| 21 | blind | Spec Change Log ghi "Huy quyết định" mở CC BY, trong khi Huy chỉ trả lời "1" (hướng 1 không nhắc CC BY) | medium | Tin nhắn hướng 1: "đổi sang video khác có phụ đề kênh đăng sẵn … (VOA, BBC…)" | patch (ghi đúng: Claude hiểu hướng 1 là CC BY, chờ Huy xác nhận) |
| 22 | blind | "VOA in chữ vào hình", "trang VOA chỉ có mp4" viết như sự thật nhưng chưa kiểm | low | Lần tra trang VOA trả 404; Huy chưa báo kết quả bấm CC | patch (ghi rõ chưa kiểm) |
| 23 | blind, edge (×3), verif-gap | Luật "CC BY phải có caption do kênh đăng" không được chặn: `transcriptSource` nhận `asr` cho CC BY, `--allow-asr` ghi được, test lấy `captionKind` từ chính file | medium | `parse.mjs:24-41`, `fetch-captions.mjs:111`, `subs.test.ts:38,70` | patch (`transcriptSource(ccBy,'asr') = null`, script báo lỗi, test) |
| 24 | blind, content | `source.translation` được lưu và kiểm nhưng UI viết cứng câu riêng | low | `SubtitledVideo.tsx:343` | patch (UI hiện `source.translation`) |
| 25 | blind | Ghi chú thay đổi CC BY chỉ nói bản dịch, trong khi bản Anh đã bị gộp câu, bỏ `>>`, `[MUSIC]` | low | `normalizeCues`, `cleanText` | patch (UI ghi "đã gộp câu, bỏ ký hiệu âm thanh") |
| 26 | blind, edge | Việc giải trí s1-t1-w2, s1-t2-w2, s1-t3-w4 vẫn ghi "VOA …" trên video kênh khác | low | `stage-1.ts:130,178,245`; `roadmap.test.ts:255` buộc khớp lộ trình gốc; link VOA vẫn hiện | defer (cần sửa lộ trình gốc) |
| 27 | blind | `t1-grammar.ts` dựng ví dụ trên VOA Let's Learn English mà video VOA L1 đã bị bỏ | false | Ví dụ trích bài trên trang VOA (`sourceUrl`), không phụ thuộc `videos.json` | reject |
| 28 | blind, content | `sw1wGSmtIBs` (bài giảng ~16', có cả quá khứ hoàn thành) nằm ở đoạn "giải trí" 10' | medium | `videos.json` `sectionId: "entertainment"`, cue tới ~900 s | patch (chuyển sang đoạn grammar của s1-t3-w4, đoạn này chưa có video) |
| 29 | blind, content | `POeCYBfFvgU` làm cho người nói tiếng Tây Ban Nha; điền từ có thể ẩn từ Tây Ban Nha | medium | ~8/41 câu tiếng Tây Ban Nha; `pickBlanks` không biết ngôn ngữ | defer (cần chọn video khác) |
| 30 | blind | `SPEC.md` còn "Chỉ NGSL/TSL được đóng gói", nguồn chỉ từ `nguon-hoc-mien-phi.md`; bỏ whitelist `CHANNELS` | low | `SPEC.md:105`; whitelist thay bằng danh sách theo giấy phép trong `videos.test.ts` (không mất) | patch (`SPEC.md`; tài liệu brainstorm giữ nguyên) |
| 31 | blind | Spec story 21 cũ (`FOUNDATION_FUN_VIDEO_IDS`, "không sửa `videos.json`") | low | Story 21 ghi thay đổi của chính nó (đã xong); việc chuyển VOA L1/L2 đã ghi ở Implementation Notes story này | reject |
| 32 | blind, edge | AC "video VOA có sub" không còn đạt được; không có AC cho ghi nguồn | low | Không còn video VOA nào có sub; ghi nguồn đã ở "Always" | patch (AC đổi thành VOA / CC BY) |
| 33 | blind | Không có ghi chép cách kiểm giấy phép từng video CC BY | low | `check.mjs` không kiểm được giấy phép | patch (bảng bằng chứng yt-dlp 2026-11-10; kiểm "không phải bản đăng lại" để Huy xem tay) |
| 34 | blind | Hai kiểm `channelUrl` lệch nhau (`transcriptSource` nhận `@handle`, test đòi `/channel/UC…`) | low | `parse.mjs:263`, `videos.test.ts:777` | patch (`CHANNEL_URL_RE` dùng chung mẫu, test) |
| 35 | blind, content | `highlight` không nhất quán: n7RA6XxfpNU chỉ gắn `past-simple-irregular` nên không tô; sw1wGSmtIBs thiếu tag ở 5 câu hiện tại hoàn thành | low | `highlightReason` chỉ tô thì của bài | patch (quy tắc ghi ở Implementation Notes; +10 câu `past-simple`, +5 câu `present-perfect-vs-past`; tag will/modals ở VvZs9S-gtFs đúng quy tắc "thì có trong câu") |
| 36 | verif-gap, edge | Kiểm từng file sub có thể chạy 0 lần khi mất file sub | medium | `it.each([])` chạy 0 ca, guard cũ chỉ đếm file caption | patch (≥ 7 file sub, mọi video `cc-by` có sub) |
| 37 | blind, verif-gap | Không có test UI ghi nguồn CC BY | low | Vitest env `node`, không có `.test.tsx` | defer (cùng gốc #16) |
| 38 | edge | File yt-dlp `<id>.en-orig.vtt` (caption tự động) bị coi là caption do kênh đăng | low | Regex `en(?:[-_]…)?` khớp `en-orig` | patch |
| 39 | edge | Thẻ bị mã hoá (`&lt;i&gt;`) còn lại trong câu sau khi giải mã | low | `cleanText` bỏ thẻ trước khi giải mã; dữ liệu hiện có không có `<` | patch |
| 40 | verif-gap | Comment `src/data/subs/index.ts` còn "chỉ VOA mới có file" | low | Mọi file sub hiện là CC BY | patch |
| 41 | content | `begKNGxcjdk` lặp lại ý "going to = di chuyển, gonna = cam kết" như sự thật | medium | Cue #39–#41; không phải ngữ pháp chuẩn | patch (chú thích cảnh báo ở "implies movement" và "gonna") |
| 42 | content | Chú thích `added` ghi "việc vừa làm xong" (nghĩa của hiện tại hoàn thành) | low | `POeCYBfFvgU` cue #32 | patch |
| 43 | content | Câu Việt lủng củng ("thay chiếc áo len ấm", "tự pha cho mình", "làm được rất nhiều việc") | low | `VvZs9S-gtFs` #43, #44, #122, #123; `n7RA6XxfpNU` #21, #44 | patch |
| 44 | content | Cụm thường (wake up, have lunch, go back to, look at, hit the like button) gắn `idiom` | low | 8 chú thích | patch (`context`) |
| 45 | content | Nên thêm chú thích cho "nightgown" buổi sáng | low | Bản dịch đúng nguyên văn; reviewer ghi là tuỳ chọn | reject |
| 46 | content | Câu Anh / mốc thời gian, giấy phép, không lưu transcript có bản quyền, ghi nguồn | false | Reviewer đã kiểm: không lỗi | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run videos:check` -- expected: mọi ID OK.

**Manual checks:**
- Headless 375px: video VOA / CC BY có sub chạy theo thời gian, đổi chế độ, tua từ transcript, điền từ; video không sub như cũ; không tràn ngang.
