---
title: 'Nhúng video YouTube và widget YouGlish ngay trong bài học'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: '8f787546b0b2cc3ca343de7b59aab7666d94c139'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/brainstorming/brainstorm-english-learning-website-2026-10-29/nguon-hoc-mien-phi.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy chọn "nhúng video ngay, rồi làm phụ đề song ngữ" ngày 2026-11-02; chi tiết Claude chọn)
- **Video trong bài:** mỗi bài chặng 1 (`s1-t1-w1` … `s1-t4-w4`, trừ tuần Tết `s1-t4-w2`) có 1–2 video YouTube phát ngay trong trang, gắn vào đoạn phù hợp (`pronunciation`, `grammar` hoặc `entertainment`). Ưu tiên kênh miễn phí, uy tín trong `nguon-hoc-mien-phi.md`: VOA Learning English (*Let's Learn English* Level 1), BBC Learning English (pronunciation, *Tim's Pronunciation Workshop*), Rachel's English, TED-Ed.
- **Không bịa video:** mọi video ID phải được xác minh qua YouTube oEmbed (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json` trả 200: tồn tại và cho nhúng), lưu kèm tiêu đề và tên kênh lấy từ oEmbed. Có script kiểm lại toàn bộ (`npm run videos:check`), không chạy trong CI (cần mạng).
- **Player nhẹ:** hiện ảnh thumbnail + nút phát; chỉ khi bấm mới tải iframe `https://www.youtube-nocookie.com/embed/<id>` (có `start` nếu dữ liệu có mốc bắt đầu). Luôn có link "Mở trên YouTube" dự phòng. Offline: hiện "Cần mạng để xem video", không tải iframe.
- **Phần 10' giải trí** (buổi 30' và trang bài): nếu bài có video đoạn `entertainment` thì phát ngay trong app; link ngoài (LyricsTraining, ELLLO…) vẫn hiện bên dưới như phương án phụ.
- **YouGlish:** thay các link YouGlish (cụm từ của từng thì, story 6/10) bằng widget YouGlish nhúng (script `https://youglish.com/public/emb/widget.js`, giọng `us`), chỉ tải script khi người dùng bấm "Nghe trong video thật". Widget lỗi/không tải được thì quay về link như cũ.
- **Giữ link** cho nguồn chặn nhúng hoặc không nên nhúng: trang VOA, trang TED-Ed, LyricsTraining, ELLLO, British Council.
- Không làm phụ đề song ngữ, chú thích, ẩn sub điền từ (story 16).

**Problem:** Phần nghe/xem của bài chỉ là link ra ngoài; trên iPhone mỗi lần bấm là rời PWA, mất mạch học và dễ không quay lại.

**Approach:** Thêm dữ liệu video đã xác minh cho từng bài chặng 1, một component player nhẹ (thumbnail → iframe youtube-nocookie khi bấm), widget YouGlish tải theo yêu cầu; gắn vào trang bài và phần giải trí của buổi 30'.

## Boundaries & Constraints

**Always:**
- Video ID chỉ từ kết quả đã kiểm bằng oEmbed; dữ liệu có `id`, `title`, `channel`, `lessonId`, `sectionId`, `startSec?`; test cấu trúc (id dạng 11 ký tự, bài/đoạn tồn tại, mỗi bài chặng 1 có nội dung (trừ Tết) có ≥ 1 video, không trùng id trong cùng bài).
- Iframe chỉ tạo sau khi bấm; dùng `youtube-nocookie.com`; có `title` cho iframe; `allow` tối thiểu (`autoplay; encrypted-media; picture-in-picture`), `referrerpolicy="strict-origin-when-cross-origin"`.
- Không thêm key store mới; không gọi YouTube Data API (không cần key).
- Service worker không cache video/iframe YouTube.
- Tiếng Việt, 375px (video 16:9 vừa khung, không tràn ngang).

**Never:**
- Không tải video về, không tự phát khi mở trang, không nhúng trang chặn nhúng.
- Không phụ đề/chú thích (story 16).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mở bài có video | `s1-t1-w1` | Thấy thumbnail + tiêu đề + kênh, chưa tải iframe | N/A |
| Bấm phát | Bấm thumbnail | Iframe youtube-nocookie hiện và phát trong trang | N/A |
| Offline | Không mạng | "Cần mạng để xem video", không tạo iframe, vẫn có link | N/A |
| Video có mốc bắt đầu | `startSec: 45` | Iframe có `start=45` | N/A |
| Buổi 30' phần giải trí | Bài có video đoạn `entertainment` | Video phát trong buổi; link ngoài vẫn ở dưới | N/A |
| Bài không có video giải trí | Chỉ có link | Hiện link như cũ | N/A |
| YouGlish | Bấm "Nghe trong video thật" ở một thì | Tải widget, hiện clip của cụm từ | Script lỗi: hiện link YouGlish |
| Tuần Tết | `s1-t4-w2` | Không bắt buộc có video | N/A |
| Kiểm dữ liệu | `npm run videos:check` | Mọi ID trả oEmbed 200; ID hỏng thì liệt kê và exit 1 | Mạng lỗi: báo rõ, exit 2 |

</frozen-after-approval>

## Code Map

- `src/data/roadmap/entertainment-links.ts` (story 4) -- link phần giải trí theo bài; giữ làm phương án phụ.
- `src/data/lessons/` (story 6, 10) -- nội dung bài; `youglish` trong dữ liệu các thì (`TenseCard.tsx`, `t2-t4-grammar.ts`), câu thoại VOA.
- `src/components/lesson/TenseCard.tsx`, `PronunciationBlocks.tsx`, `LessonContentParts.tsx`, `src/components/roadmap/LessonSectionCard.tsx` -- chỗ gắn video/widget.
- `src/pages/Lesson.tsx`, `src/pages/Session.tsx` (phần giải trí, `components/session/SessionParts.tsx`).
- `src/app/use-now.ts` / `navigator.onLine` -- trạng thái mạng.
- `vite.config.ts` -- Workbox: không runtime-cache YouTube.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/videos/` (+ test) -- kiểu `LessonVideo`, dữ liệu video đã xác minh cho bài chặng 1, `videosFor(lessonId, sectionId?)`, `embedUrl(video)`, `watchUrl(video)`.
- [x] `scripts/videos/check.mjs`, `package.json` (`videos:check`) -- kiểm mọi ID qua oEmbed, exit 1 nếu có ID hỏng.
- [x] `src/components/media/VideoEmbed.tsx` -- thumbnail → iframe khi bấm, offline, link dự phòng.
- [x] `src/components/media/YouglishWidget.tsx` (+ `src/lib/youglish.ts` có test cho dựng tham số) -- tải script theo yêu cầu, quay về link khi lỗi.
- [x] `src/components/lesson/*`, `src/components/roadmap/LessonSectionCard.tsx`, `src/pages/Lesson.tsx`, `src/pages/Session.tsx`, `src/components/session/SessionParts.tsx` -- gắn video và widget.
- [x] `vite.config.ts` -- loại YouTube/YouGlish khỏi cache nếu có runtime caching.

**Acceptance Criteria:**
- Given bài `s1-t1-w1`, when bấm video, then video phát ngay trong trang không rời PWA.
- Given buổi 30' ở phần giải trí, when bài có video, then xem được ngay trong buổi.
- Given repo, when chạy `npm run videos:check`, then mọi video ID hợp lệ.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Video lệch chủ đề bài: "Simple Past" ở bài động từ bất quy tắc (bài quá khứ đơn không có), "Simple Present" ở tuần 3 (tuần 2 không có), modals should/ought to/had better ở bài can/should/must | medium | Đối chiếu `stage-1.ts`; test chỉ kiểm bài/đoạn tồn tại | patch |
| 2 | blind | Video 75 phút gắn vào đoạn ôn ngắn, không có `startSec` | low | `QxQUapA-2w4` ở `s1-t2-w4` | patch |
| 3 | edge (×2) | Widget YouGlish báo lỗi đồng bộ bị `setStatus('ready')` đè, không hiện link dự phòng; lỗi không đóng widget (có thể vẫn phát tiếng); không có "Thử lại" | medium | `YouglishWidget.tsx` | patch |
| 4 | verif-gap, blind, edge | `loadYouglish` (một lần, timeout, thử lại) không có test; script cũ chạy sau timeout có thể ghi đè; không kiểm `YG` khi `onload` | medium | Không có test nào gọi hàm | patch |
| 5 | blind | Link ngoài ở đoạn giải trí trang bài có thể trùng với nguồn của đoạn; tiêu đề "Nguồn ngoài" hiện cả khi rỗng | low | `Lesson.tsx` + `LessonSectionCard` | patch |
| 6 | blind | Bấm phát làm mất focus; iOS thường chặn autoplay nên cần chạm lần nữa mà không có gợi ý | low | Chuyển focus vào iframe; thêm gợi ý | patch |
| 7 | blind | Khối YouGlish `bg-white` cứng, chói ở theme tối | low | Dùng token theme | patch |
| 8 | edge | `videos:check`: JSON hỏng thoát mã 1 (giống "ID hỏng"); mảng rỗng báo OK | low | Sửa mã thoát | patch |
| 9 | edge | Lúc chưa bấm, không có link YouGlish trực tiếp | low | Hiện link nhỏ cạnh nút | patch |
| 10 | blind | Test chưa giới hạn tối đa 2 video mỗi bài; số bài viết cứng 15 | low | Thêm/đổi test | patch |
| 11 | verif-gap | Chọn video cho phần giải trí của buổi chỉ nằm trong component | low | Tách `funStepVideos(lesson)` thuần + test | patch |
| 12 | verif-gap | Bật iframe khi bấm/khi offline chỉ kiểm bằng tay | low | Không có môi trường test component | defer |
| 13 | blind | Nhúng TED-Ed dù spec ghi "giữ link" | false | Spec giữ link cho *trang* TED-Ed; kênh TED-Ed trên YouTube nằm trong danh sách nguồn ưu tiên | reject |
| 14 | blind | Một video VOA Level 2 (spec nêu Level 1) | low | Level 1 là ưu tiên, không cấm; dùng cho T4 hợp lý | reject |
| 15 | blind | Nhiều player phát cùng lúc | low | Cần YouTube API để tạm dừng; người dùng tự bấm | reject |
| 16 | blind, edge | oEmbed không bắt video giới hạn vùng/tuổi; thumbnail tải từ Google trước khi bấm; accent khác `us`; `useOnline` race | low | Nhỏ, ghi nhận | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run videos:check` -- expected: mọi ID OK.

**Manual checks:**
- Headless 375px: trang bài có thumbnail, bấm thì có iframe youtube-nocookie, offline không tạo iframe; không tràn ngang.
