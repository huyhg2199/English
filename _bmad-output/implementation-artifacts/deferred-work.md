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
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/22-today-welcome-house-schedule-lazy.md`
  summary: `setHouse` cũng bump `placement.updatedAt`, nên người đã có `startLessonId` đổi Nhà sau khi lịch chạy sẽ dời ngày bắt đầu lịch (luật "ETS áp dụng muộn") và xoá số tuần trễ một cách âm thầm.
  evidence: `roadmapStartDate` (`src/lib/schedule/schedule.ts`) đọc `placement.updatedAt` làm ngày áp dụng xếp lớp; `setHouse` (`src/lib/placement`) ghi `updatedAt` mới. Lỗi có từ trước story 22 (rủi ro 2 trong Implementation Notes); story 22 làm nút "Đổi Nhà" dễ thấy hơn (trang Mũ, Phòng Cúp). Cách sửa gợi ý: lưu ngày áp dụng riêng (cần đổi shape store, ngoài phạm vi story 22) hoặc để `setHouse` không chạm field dùng cho lịch.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/23-srs-new-words-intro-gates.md`
  summary: Luật "từ chủ đề của viên gạch/bài lên trước" (`learning-rules.md`, mục Từ vựng) mới làm phần viên gạch; bài T1/T2 sau Sân ga chưa góp từ chủ đề nào vào `preferredNewWordIds`.
  evidence: `preferredNewWordIds` (`src/lib/flashcard-session.ts`) chỉ đọc `themeWordIdsOf(brickId)`; dữ liệu bài (`src/data/lessons/types.ts`) không có trường từ chủ đề (chỉ `words` của phần phát âm/tự đọc). Intent story 23 chỉ định nghĩa `preferIds` từ viên gạch + danh sách khởi đầu; cần một story khác chọn từ chủ đề cho từng bài rồi nối vào `preferredNewWordIds`.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/23-srs-new-words-intro-gates.md`
  summary: Giao diện thẻ mới của story 23 (thẻ Làm quen mở sẵn mặt sau, nút "Đã xem" = `good`, ẩn IPA/âm tiết/từ loại theo cổng kèm link F03, dòng "Hôm nay ôn kỹ…") không có test tự động nào.
  evidence: Vitest chỉ chạy `src/**/*.test.ts` với env `node`, repo không có test component (`.test.tsx`), nên đảo `useState(intro)` hay nối "Đã xem" sang `easy` vẫn qua `npm test`. Hàm thuần đứng sau (`flashcardGates`, `rankLabel`, `item.intro`, `gradeCard(..., 'good')`) đã có test; muốn chặn hồi quy giao diện cần thêm jsdom + React Testing Library (việc riêng).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/24-srs-function-words-rule-cards-examples.md`
  summary: Giao diện thẻ của story 24 không có test tự động nào: nhánh `isRuleWord` → `RuleFlashcard`, mặt trước thẻ hư từ là câu có `___` (không hiện từ đứng riêng), và plan `lockedIds`/`rules` truyền vào phiên ở `FlashcardSession.tsx` và `Practice.tsx`.
  evidence: Vitest chỉ chạy `src/**/*.test.ts` với env `node`, repo không có test component. Đảo nhánh `cloze ? … : wordTitle`, bỏ nhánh `isRuleWord` hay bỏ `lockedIds, rules` ở `Practice.tsx` thì vẫn qua `npm test`. Hàm thuần đứng sau (`functionWordCloze`, `buildSession` với `rules`/`lockedIds`, `newWordOptions`) đã có test. Muốn chặn hồi quy giao diện cần thêm jsdom + React Testing Library (việc riêng, chung với mục tương tự của story 23).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/26-row-cd-content-glossary-wall-pass.md`
  summary: Màn `/foundation/qua-buc-tuong` (thư "Huy chương Lên tàu Năm 1" hiện một lần lúc mở đầu, không hiện lại sau khi ghi `board-year-1`) không có test tự động nào.
  evidence: Quyết định hiện thư nằm trong `BoardingLetter` (`src/pages/FoundationWallPassed.tsx`, `useState` chốt lúc mount sau `useFirstSyncReady`); Vitest chỉ chạy `src/**/*.test.ts` env `node`, không có test component. Hàm thuần (`markWallCelebrated`, `isWallCelebrationPending`, `boardingMedal`) đã có test. Muốn chặn hồi quy cần jsdom + React Testing Library hoặc tách hàm thuần `wallPassedLetters(store)` (việc riêng, chung với mục tương tự của story 23, 24).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/27-t1-patch-untaught-question-filter.md`
  summary: Phần nối ở trang của story 27 không có test tự động: `DefinedQuizRun` chốt `planQuiz` bằng `useState` (đề không đổi giữa chừng), key `${quiz.id}|${run.seed}` (chuyển sang test khác phải lập đề mới), thẻ `QuizNotReady` không render `QuizRun` (không ghi lần làm / Sổ lỗi), và predicate `isBrickTaught(store, id)` truyền vào `planQuiz` / `quizButtonCount`.
  evidence: Vitest chỉ chạy `src/**/*.test.ts` env `node`, repo không có test component; đổi key về `run.seed`, truyền `() => true` hay quay lại `useMemo` theo store vẫn qua `npm test` (lần chạy tay đầu của story 27 đã gặp lỗi key). Hàm thuần `planQuiz`, `quizButtonCount`, `isBrickTaught` đã có test. Cần jsdom + React Testing Library hoặc tách hàm thuần nhỏ trong `src/lib/quiz` cho key và predicate (việc riêng, chung với mục tương tự của story 23, 24, 26).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/27-t1-patch-untaught-question-filter.md`
  summary: Câu Sân ga hàng B `q-f11-01` "I eat ___ apple every day." dùng "every" (cổng hư từ F18), trái chú thích đầu `foundation.ts` "câu hàng B chỉ dùng F01–F12"; `requires` không khai báo được `frequency-adverbs` (F18 sau viên cuối hàng B) nên câu cần viết lại (vd "I want ___ apple.").
  evidence: `src/data/questions/foundation.ts` q-f11-01; `src/data/vocab/function-words.ts` `ngsl-every` → F18. Câu có từ trước story 27 (story 20/25) và Code Map story 27 chỉ cho thêm `requires`, không đổi chữ câu Sân ga. Câu Sân ga không bị lọc lúc chạy nên chưa ảnh hưởng người học ngoài việc kiểm tra cuối hàng B hỏi một từ chưa dạy.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/29-desktop-shell-topbar.md`
  summary: Khung máy tính (AppShell gắn `LAYOUT_CLASS[layoutFor(useMatches())]` và `<TopBar />`, BottomNav `lg:hidden`, khối CSS 64rem đặt `--nav-height: 0px`) chỉ được kiểm bằng `npm run layout:check` chạy tay, CI không kiểm.
  evidence: CI (`.github/workflows/deploy.yml`) chỉ chạy lint, test, build; Vitest env `node` không render component. Bỏ `LAYOUT_CLASS[layout]` khỏi `cn(...)` ở AppShell hay bỏ `lg:hidden` ở BottomNav thì `npm test` vẫn xanh. Story 29 cố ý để `layout:check` ngoài CI (cần Chrome); xem lại khi CI có Chrome headless, hoặc khi story 30–31 sửa lại các file này.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/30-desktop-two-column-study-pages.md`
  summary: Cột phụ trang bài ở 1280×800 cao hơn màn hình (nội dung 1208px, khung tối đa 712px), nên ô "Ghi chú cho bài này" chỉ lộ phần đầu và "Đánh dấu đã học xong" nằm dưới mép, phải cuộn riêng cột phụ mới thấy.
  evidence: Đo bằng script CDP tạm lúc triage (lessons s1-t1-w1, cuộn 900px): rail top 72, height 712, scrollHeight 1208, ô ghi chú bắt đầu ở 714px, đáy nút đánh dấu ở 1236px (viewport 800). Đúng với intent đã chốt ("cao tối đa vừa màn hình, tự cuộn khi dài hơn") nên không sửa trong story 30; nếu Huy thấy vướng khi dùng thật thì cần quyết định UX (chỉ mục lục dính, thu gọn ô ghi chú, hay đổi thứ tự) ở story sau.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/30-desktop-two-column-study-pages.md`
  summary: `layout:check` không kiểm được cột phụ dính của `/session` và `/foundation/F01` vì với dữ liệu sạch hai trang ngắn hơn viewport ở 1024–1920 (`rails` = null), nên tiêu chí "nút Tiếp luôn thấy ở cột trái" và "lý thuyết vẫn hiện ở màn 4–6" chưa có kiểm tự động.
  evidence: Implementation Notes story 30 ghi rõ chỉ trang bài cuộn được; màn 4–6 của F01 không mở được bằng URL. Script CDP tạm lúc triage đi tới màn 5 của F01 ở 1280×800: cột trái có đủ Giải thích, So sánh, Ví dụ mẫu, cột cao 712 (tự cuộn) và bị khung cha đẩy lên đúng cách (top 64, đáy khung 776); cột của buổi học chưa được đo khi cuộn. Muốn kiểm tự động cần fixture/trạng thái URL cho màn dài (việc riêng).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/31-desktop-hotkeys-today-roadmap-grid.md`
  summary: Phần nối DOM của `useHotkeys` (`keyTarget`, `readEnv` đọc dialog / bôi đen, thứ tự `preventDefault` rồi gọi handler, `enabled` của từng nơi gọi) chỉ được kiểm bởi bước "thử phím tắt" của `npm run layout:check` chạy tay, không có trong `npm test` hay CI.
  evidence: Vitest chạy `environment: 'node'` (`vite.config.ts`), không render component; `.github/workflows/deploy.yml` chỉ chạy lint / test / build; `stack.md` ghi layout:check "chạy tay, không trong CI". Nếu `keyTarget` trả `DIV` cho mọi phần tử hay `readEnv` không thấy dialog, gõ số trong ô ghi chú sẽ kích hoạt phím tắt mà pipeline vẫn xanh. Muốn đóng cần thêm jsdom/happy-dom hoặc chạy layout:check trong CI (quyết định cấp dự án).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/16-bilingual-subtitles.md`
  summary: Việc giải trí của s1-t1-w2 ("VOA Let's Learn English L1"), s1-t2-w2 ("VOA L1") và s1-t3-w4 ("VOA L1/L2") vẫn nhắc VOA, trong khi video nhúng ở bước giải trí giờ là English Moment (s1-t1-w2, s1-t2-w2) hoặc không còn video (s1-t3-w4).
  evidence: `src/data/roadmap/stage-1.ts:130,178,245`; `roadmap.test.ts:255` buộc chữ này khớp cột "giải trí" của lộ trình gốc `lo-trinh-toeic-12-thang.md`, nên muốn sửa phải sửa lộ trình gốc (hoặc thêm override) — quyết định nội dung của Huy. Hiện link VOA Learning English vẫn hiện ở "Hoặc chọn nguồn ngoài", nên việc ghi trong bài vẫn làm được.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/16-bilingual-subtitles.md`
  summary: Video `POeCYBfFvgU` (s1-t1-w2 grammar) làm cho người nói tiếng Tây Ban Nha: khoảng 8/41 câu là chia động từ tiếng Tây Ban Nha và vài câu nhắc hoạt động lớp học không có trong app; chế độ "Điền từ" có thể ẩn từ Tây Ban Nha (vd "hablas").
  evidence: `src/data/subs/POeCYBfFvgU.json` câu ~#8–#30; `pickBlanks` (`src/lib/subs/blanks.ts`) chọn từ dài nhất không phải hư từ, không biết ngôn ngữ. Chú thích đã giải thích phần tiếng Tây Ban Nha. Sửa đúng là chọn video CC BY khác (có caption do kênh đăng) cho hiện tại đơn rồi dịch lại, hoặc thêm cách loại câu khỏi điền từ (thêm trường dữ liệu): cần Huy chọn.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/16-bilingual-subtitles.md`
  summary: Phần ghi nguồn CC BY trên UI (`SubAttribution` trong `SubtitledVideo.tsx`: link kênh, link giấy phép, video gốc, ghi chú bản dịch; nhãn "CC BY" trong `VideoEmbed.tsx`) không có test tự động.
  evidence: Vitest chạy `environment: 'node'`, không có file `.test.tsx`; dữ liệu nguồn đã được ghim bởi `src/data/subs/subs.test.ts` (`source` khớp `transcriptSource`), nhưng xoá nhánh link giấy phép thì lint/test/build vẫn xanh. Cùng gốc với mục "máy trạng thái điền từ" (#16 story 16): cần môi trường test component (jsdom/happy-dom) — quyết định cấp dự án.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/32-tense-content-fixes.md`
  summary: goalVi của F17 trong `catalog.ts:158` vẫn ghi "Nhận ra go/goes/going/went/gone trên trục thời gian", trong khi nội dung mới tách gone khỏi ba vùng thời gian.
  evidence: Story 32 cấm sửa `catalog.ts`; nên sửa ở story 47 (dọn thứ tự bài), ví dụ "Nhận ra go/goes/going/went trên trục thời gian; gone đi với have / has".
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/32-tense-content-fixes.md`
  summary: Khi một câu quiz được viết lại mà giữ id, mục sổ lỗi cũ vẫn hiện `lastChosen` (và lời giải thích Gemini) của lựa chọn không còn tồn tại, ví dụ `q-s1-t3-w1-06`.
  evidence: `MistakeCard.tsx:155` in `entry.lastChosen` nguyên văn, không so với `question.options`. Chỉ xảy ra nếu đã có lỗi câu đó (Huy chưa học tới T3). Cách sửa gợi ý: ẩn dòng "bạn chọn" và coi lời giải thích là cũ khi `lastChosen` không có trong `options`; không cần bump store. Liên quan story 35–42 sẽ viết lại nhiều câu.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/32-tense-content-fixes.md`
  summary: Bài xếp f17-a1 xếp cứng `go` đứng một mình vào nhóm "Thói quen", trong khi dạng gốc go cũng là nguyên mẫu (I will go, Did you go); nhãn nhóm thứ 4 gần như cho sẵn chỗ của gone.
  evidence: `src/data/foundation/bricks/f17.ts` f17-a1 groups. Có từ trước story 32 (phần go). Có thể xem lại khi làm "Bản đồ thì" (story 39–42).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/33-past-to-be-wh-did.md`
  summary: Đoạn Phát âm / Nghe của s1-t2-w2 chưa dạy dạng yếu của was / were (/wəz/, /wɚ/) và chưa có câu nghe phân biệt was / wasn't, were / weren't (điểm nghe hay gặp ở TOEIC Part 1–2).
  evidence: Review story 33 (blind #7). 6 câu quiz mới đều là trắc nghiệm ngữ pháp. Mục phát âm và câu nghe của `t2-t4-pronunciation.ts` / `t2-t4.ts` khối t2w2 không có was / were. Intent story 33 không bao phần phát âm, nên nên làm ở story luyện có bậc (35–36) hoặc một story phát âm riêng.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/34-f06-numbers-days-months.md`
  summary: F06 chưa có câu nghe thứ, tháng hay ngày (câu listen vẫn chỉ là `f06-c1` thirteen và `f06-c2` fifty dollars), dù Tuesday/Thursday được nhắc "dễ nhầm" ở ba chỗ và lý do của story là TOEIC Part 1–3.
  evidence: Review story 34 (blind #4). Mỗi dòng bảng thứ/tháng có nút nghe nhưng không có câu kiểm. Thêm câu nghe sẽ đổi bộ câu check mà intent story 34 đã chốt; nên làm ở story luyện nghe hoặc khi xem lại F06 (vd đổi `f06-e1` thành câu listen "Thursday").
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/34-f06-numbers-days-months.md`
  summary: Sân ga chưa dạy năm (twenty twenty-six, "May 3rd, 2026"), số trên 100 ($150), a.m./p.m., noon, chữ viết tắt trên lịch TOEIC (Mon, Tue, Jan, Sept) và cách nói ngày kiểu Anh ("the twenty-first of June").
  evidence: Review story 34 (blind #6). F06 trước và sau story 34 đều chỉ dạy 0–100 và ngày kiểu Mỹ, đúng intent đã chốt. TOEIC Part 3–4, 7 hay có giờ a.m./p.m. và năm; cần Huy chọn đưa vào F06 hay vào bài T1–T4.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/34-f06-numbers-days-months.md`
  summary: Bảng tra mới của màn giải thích (`BrickTables` trong `ExplainBody` và `TermChip`) không có test render hay test bề rộng 375px khi mở bảng.
  evidence: Vitest chạy `environment: 'node'`, không có `.test.tsx`; `scripts/layout/check-lib.mjs` `ROUTES` chỉ có `/foundation` và `/foundation/F01`, và bảng đóng sẵn nên `scrollWidth` không đo được dòng đã mở. Xoá `<BrickTables>` khỏi `ExplainBody` thì lint/test/build vẫn xanh. Cùng gốc với các mục "cần môi trường test component" của story 16 và 31.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/35-tense-practice-typed-questions.md`
  summary: Chỗ nối ở trang của story 35 không có test: `DefinedQuizRun` (`src/pages/Quiz.tsx`) truyền `seen: seenQuestionIds(store)` cho `planQuiz`, và ôn Sổ lỗi (`src/pages/Mistakes.tsx`) chấm câu gõ bằng `isAnswerCorrect`.
  evidence: Review story 35 (verification-gap). Bỏ `seen` hay đổi lại `option === question.answer` thì lint/test/build vẫn xanh, vì mọi test lib tự dựng `seen` và cách chấm ôn sổ nằm trong trang. Cùng gốc với các mục "cần môi trường test component" của story 16, 31, 34; cách sửa rẻ là chuyển quyết định chấm ôn sổ sang một hàm thuần trong `src/lib/quiz` rồi test ở đó.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/35-tense-practice-typed-questions.md`
  summary: AC 1 (đi hết khối luyện bằng bàn phím ảo iPhone thật: không phóng to, `scrollWidth` 375) và phần buổi 30' của AC 2 chưa được chạy trên máy thật.
  evidence: Implementation Notes ghi "Chưa kiểm". Đã đọc code: `TensePractice` chỉ bind Enter, không bind ←/→; ô gõ 16px và có `autoCapitalize="none"` / `autoCorrect="off"`. Cần Huy mở `s1-t2-w1` trên iPhone (và buổi 30' trên máy tính) để xác nhận.
