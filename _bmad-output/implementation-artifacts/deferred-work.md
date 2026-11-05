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
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/18-foundation-data-store-v13.md`
  summary: Luật nội dung viên gạch trong `src/data/foundation/types.ts` (đúng một `___` ở `faded.en` và `RuleCard.cloze`, `syllables` ghép lại đúng `word`, `tapSyllable.answer` trong khoảng, 2–5 câu `check`, thứ tự màn explain → … → apply) chỉ nằm trong chú thích, chưa có validator/test.
  evidence: Story 18 chỉ định kiểu; story 19–26 viết nội dung màn nên cần thêm hàm kiểm (vd `brickContentIssues`) và test duyệt mọi viên khi nội dung đầu tiên được thêm.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/19-brick-player-foundation-wall.md`
  summary: Việc BrickPlayer gọi `completeBrick` đúng một lần khi màn Áp dụng hiện (và không ghi gì nếu thoát trước) chỉ kiểm bằng headless Chrome, chưa có test tự động.
  evidence: Vitest chạy env `node`, chỉ `src/**/*.test.ts`, không có jsdom/RTL; xoá effect hoặc đổi điều kiện sang `check` vẫn pass 86 test. Cần harness test component (cùng giới hạn đã defer ở story 8, 15, 16).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/20-row-a-content-placement-quizzes.md`
  summary: `SourceSectionLink` (Sổ lỗi, màn kết quả kiểm tra hàng) chuyển sang `questionSourceHref` nhưng chưa có test component; quay lại `sectionHref` thì link "Xem lại: Viên gạch Fxx" sai mà không test nào đỏ.
  evidence: `source-label.test.ts` chỉ test hàm thuần; Vitest env `node`, không có jsdom/RTL (cùng giới hạn đã defer ở story 8, 15, 16, 19). AC 3 hiện chỉ có kiểm tra headless Chrome.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/20-row-a-content-placement-quizzes.md`
  summary: Việc `BrickScreen` truyền `audioText` / `sampleAudioText` cho nút nghe (F02 đọc "aitch, you, why" thay "H-U-Y") chưa có test; test F02 chỉ kiểm dữ liệu.
  evidence: Bỏ `speech={ex.audioText}` trong `ContrastBody` thì test dữ liệu F02 vẫn pass. Cách rẻ: helper thuần `spokenText(screen)` trong `src/data/foundation` dùng chung cho `BrickScreen` và test, hoặc harness test component.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/20-row-a-content-placement-quizzes.md`
  summary: (chưa kiểm chứng, medium) Thẻ quy tắc `f03-rule-1` và `f05-rule-2` có đáp án `iː`, không gõ được trên bàn phím điện thoại; `f02-rule-2` "W = ___ you" có chữ W đứng một mình nếu sau này máy đọc thẻ.
  evidence: Thẻ quy tắc chưa vào SRS ở story 20. Story 23 quyết định cách ôn thẻ (gõ hay chạm, có đọc TTS không); nếu là gõ thì đổi đáp án sang ASCII hoặc chấm bỏ dấu ː, nếu có TTS thì đọc qua `spellForSpeech`.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/20-row-a-content-placement-quizzes.md`
  summary: (chưa kiểm chứng, medium) Tên chữ cái cho TTS `A: 'ay'` và `E: 'ee'` có thể bị giọng iOS/Android đọc sai ("ay" thành /aɪ/ như chữ I, "ee" bị đánh vần), đúng lỗi A/I mà F02 dạy.
  evidence: Headless Chrome chỉ xác nhận chuỗi được gửi tới TTS, không nghe được âm. Cần nghe trên iPhone thật (Safari/PWA) và một máy Android các ví dụ F02 "A, E, I", "H-U-Y", câu nghe J-E; nếu sai thì đổi chuỗi (R đã đổi sang 'are').
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/20-row-a-content-placement-quizzes.md`
  summary: Khi các hàng chưa có kết quả cuối cùng được xong bằng cách học hết viên (`completeBrick`) chứ không qua kiểm tra hàng, Soát vé vẫn `pending` dù `nextPlacementRow` là null.
  evidence: `recordRowTest` giờ đóng Soát vé ở mọi chế độ, nhưng `completeBrick` (story 18/19) không xét Soát vé. Hiện không lộ ra giao diện (thẻ mời ẩn, `/foundation/soat-ve` chuyển hướng) vì UI dựa vào `placementRow`; story 21/22 khi đọc `needsPlacement` nên dùng `placementRow !== null` hoặc cho `completeBrick` gọi `finishPlacement('done')` khi hết hàng.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/21-session-plan-theory-first.md`
  summary: Hôm nay vẫn hiện thẻ "Bài hiện tại" (bài lộ trình, `useSessions().current`) trong khi nút "Bắt đầu buổi 30'" giờ mở buổi Sân ga, nên lúc ở Sân ga thẻ và buổi không khớp.
  evidence: `src/pages/Today.tsx` thẻ "Bài hiện tại" đọc `sessionLesson`; story 21 đổi nút sang `/session` (chọn buổi Sân ga khi `isInFoundation`). Intent story 21 cấm sửa Hôm nay ngoài nút; story 22 (thẻ Sân ga, ẩn thẻ) cần thay thẻ này bằng thẻ viên gạch khi đang ở Sân ga.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/21-session-plan-theory-first.md`
  summary: Bài test quay lại có thể trỏ "Học tiếp" tới route hỏng `sectionHref('f03', 'pronunciation')` khi câu sai nhiều nhất là câu viên gạch (`q-fNN`) lấy từ Sổ lỗi.
  evidence: `weakestSectionFrom` trả `{ lessonId: 'f03', sectionId: 'pronunciation' }` (test ở `comeback.test.ts`), `ComebackNext` trong `src/pages/Quiz.tsx` dựng `sectionHref(weak.lessonId, …)` không kiểm id viên; `pickComebackTest` lấy câu từ Sổ lỗi theo `QUESTION_BANK` (có câu `q-fNN` từ story 20). Nên dùng `brickIdFromLessonId` để trỏ `/foundation/F03` (hoặc bỏ câu viên khỏi `weakestSectionFrom`).
