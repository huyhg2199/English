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
