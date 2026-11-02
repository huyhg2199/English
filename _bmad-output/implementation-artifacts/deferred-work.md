# Deferred work

- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/2-roadmap-data-year-map.md`
  summary: Trang bài (`Lesson.tsx`) chưa có test render: `id` đoạn để cuộn tới và nút "Đánh dấu đã học xong" chỉ được kiểm bằng tay.
  evidence: Test chạy env `node`, không có jsdom/testing-library; bỏ `id={section.id}` hoặc đảo `!done` vẫn pass 77 test. Cần quyết định thêm môi trường test component.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/2-roadmap-data-year-map.md`
  summary: `progress.completedLessonIds` là mảng id trần, không đủ để đồng bộ hai chiều ở story 2a.
  evidence: Không có timestamp hay dấu xoá; merge kiểu hợp sẽ hồi sinh bài đã "Bỏ đánh dấu", merge kiểu mới-nhất-thắng mất thay đổi của máy khác. Story 2a cần chốt mô hình (vd map id → {done, updatedAt}) kèm migration.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/2a-supabase-local-first-sync.md`
  summary: Đẩy dữ liệu khi PWA xuống nền đi qua fetch thường (không `keepalive`), iOS có thể huỷ request trước khi xong.
  evidence: Chưa kiểm (maybe-false, nếu đúng là medium). Cần thử trên iPhone thật: đánh dấu bài rồi vuốt app vào nền ngay, xem hàng `user_store` có cập nhật không; nếu không thì cân nhắc `global.fetch` với `keepalive: true` cho lượt flush.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/3-ngsl-tsl-flashcard-srs.md`
  summary: Chunk `words.json` và map `srs.cards` lớn dần; sau story 3a có thể vượt giới hạn precache 2 MiB của workbox và mỗi lần chấm đẩy cả map lên Supabase.
  evidence: Chưa kiểm (maybe-false, nếu đúng là medium). Hiện chunk 467 KB với 1000 từ có dữ liệu; đo lại sau 3a, nếu gần 2 MiB thì tăng `maximumFileSizeToCacheInBytes` hoặc tách chunk theo list.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/3a-ai-data-ngsl-rest-tsl.md`
  summary: Thứ tự từ mới "hết NGSL rồi mới TSL" trái lộ trình (TSL từ T5); đã chuyển thành quyết định + task trong story 4.
  evidence: `compareStudyOrder` (story 3) xếp mọi `ngsl` trước `tsl`; xem Review Triage Log #1 của story 3a.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/5-sorting-hat-skill-gap-hours.md`
  summary: Bản đồ (`Roadmap.tsx`) và Hôm nay/buổi học (`sessionLesson`) tự tính bài tiếp theo riêng, có thể lệch nhau nếu một chỗ quên truyền `startLessonId`.
  evidence: Không có test chung; cần helper `roadmapProgressFor(store)` dùng ở cả hai chỗ.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/7-backup-restore-json.md`
  summary: `useBackup().restore` (ghi qua `handle.update` để đồng bộ tự đẩy) chưa có test.
  evidence: Repo chưa có môi trường test hook/component; nếu cần thì tách thành hàm thuần `(handle, backup) => result` và test cạnh `createStoreHandle`.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/8-notebook-save-context-notes.md`
  summary: Repo chưa có môi trường test component; luồng UI (phiên flashcard có thẻ riêng, Sổ tay, ReadableText) chỉ kiểm bằng tay.
  evidence: Review story 2, 4, 6, 7, 8 đều gặp giới hạn này; cân nhắc jsdom + Testing Library cho vài luồng quan trọng.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/10-content-t2-t4-speaking-links.md`
  summary: Các thì T2–T4 chưa có câu thoại VOA nguyên văn (dùng link YouGlish theo đường lui của spec) vì lúc làm story không truy cập được learningenglish.voanews.com.
  evidence: curl/WebFetch tới VOA trả 000/timeout ngày 2026-11-02; story 6 từng tải được. Khi vào được, thêm câu nguyên văn có link cho mỗi thì.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/13-gist-owl-post-reminders.md`
  summary: Ghi Gist khi app xuống nền dễ bị trình duyệt (iOS) huỷ; `keepalive` không dùng được vì body backup có thể > 64 KB.
  evidence: Chưa kiểm trên máy thật (maybe-false). Cần thiết kế: ghi `status.json` nhỏ bằng `keepalive` riêng, backup đầy đủ để lần sau.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/14-owl-1-exam.md`
  summary: Máy trạng thái phần đọc IPA của O.W.L. (lỗi mic → tự chấm cho phần còn lại, tối đa 2 lần thử, `no-speech` không tính) chỉ nằm trong `OwlPronunciation.tsx`, không có test.
  evidence: Chỉ kiểm bằng headless với nhận dạng giả; nên tách thành hàm thuần trong `src/lib/owl` và test.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/15-embedded-video-youglish.md`
  summary: Hành vi player (chỉ tạo iframe khi bấm, không tạo khi offline) chỉ kiểm bằng tay.
  evidence: Cùng giới hạn "chưa có môi trường test component" đã defer ở story 8.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/16-bilingual-subtitles.md`
  summary: Story 16 chưa có dữ liệu phụ đề thật: không lấy được caption có mốc thời gian của video VOA từ môi trường build (YouTube không trả captionTracks cho yêu cầu không phải trình duyệt).
  evidence: Huy tải caption bằng yt-dlp ở máy mình vào `scripts/subs/captions/source/`, chạy `npm run subs:fetch`, rồi Claude dịch + chú thích thành `src/data/subs/<id>.json`. Sau đó mới nghiệm thu AC của story 16.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/16-bilingual-subtitles.md`
  summary: Máy trạng thái lượt điền từ trong `SubtitledVideo.tsx` (đếm, flush khi hết video / đổi chế độ / rời trang) chưa có test.
  evidence: Chưa có môi trường test component; nên tách thành reducer thuần trong `src/lib/subs`.
