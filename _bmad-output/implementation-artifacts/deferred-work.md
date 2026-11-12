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
  resolved: Story 47 — `comebackTarget` trỏ câu viên gạch (`fNN`) về `/foundation/Fxx` ("Fxx · tên viên"); `weakestSectionFrom` hoà: bài lộ trình → viên F01 → F18 → id lạ; đang ở Sân ga đề lấy câu kiểm tra hàng của viên đã học xong (`COMEBACK_BANK`), không lấy câu bài chưa học.
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
  resolved: Story 47 — goalVi F17 = "Nhận ra go/goes/going/went trên trục thời gian; gone đi với have / has (học ở T3); chỉ cần nhận ra" (catalog.ts và bảng learning-rules).
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
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/36-t1-t2-tense-practice-data.md`
  summary: `npm run layout:check` đang đỏ vì probe phím tắt gõ "chào 1" vào màn faded F01 và chờ "Chưa đúng", nhưng từ patch review story 35 ô gõ thấy dấu tiếng Việt thì nhắc tắt bộ gõ chứ không chấm; lỗi mới của story sau sẽ lẫn vào lỗi có sẵn này.
  evidence: Review story 36 (blind, verification-gap). `scripts/layout/check-lib.mjs` `HOTKEY_PROBE.brickTyped = 'chào 1'`, kiểm ở `check-lib.mjs:237`; `TypedAnswer` / `hasVietnameseMarks` (`src/lib/quiz/typed.ts`) chặn chấm chữ có dấu. Cách sửa rẻ: đổi chữ probe sang không dấu (vd "chao 1") và sửa chú thích ở `check-lib.d.mts`, rồi chạy lại `layout:check` (cần Chrome).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/36-t1-t2-tense-practice-data.md`
  summary: `outOfScopeWords` không bắt bị động có V3 trùng V2 hoặc đuôi -ed ("was made", "were cleaned") ở các thì quá khứ, vì was / were + -ed / V2 lẫn với tính từ (closed, worried, tired) và không tách được bằng danh sách từ.
  evidence: Review story 36 (blind, edge). `src/lib/tense-scope.ts` chỉ bắt V3 khác V2 (`IRREGULAR_V3_ONLY`); patch review đã thêm hoàn thành (have / has / had + V2 / -ed), quá khứ tiếp diễn, may / might / shall / ought, 'd, than. Dữ liệu T1–T2 hiện không có câu bị động; story 37 (thêm thì T3–T4 vào bảng phạm vi, có bị động) nên quyết định cách bắt (vd danh sách tính từ -ed được phép).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/36-t1-t2-tense-practice-data.md`
  summary: `requires` của câu gõ quá khứ có quy tắc ở s1-t2-w2 không đồng đều: `q-s1-t2-w2-20` (golden), `-21`, `-22`, `-23` không khai báo `tenses-overview` / `verb-forms` (F17), còn `-24`…`-26` và mọi câu `s1-t2-w3` mới có.
  evidence: Review story 36 (blind, content). Cả hai cách đều hợp lệ (`requiresViolations` rỗng) và bài s1-t2-w2 tự dạy -ed, nên chỉ ảnh hưởng lọc "thiếu nền". Golden `-20` cố định `requires` trong spec story 36; đổi `-21`…`-23` sẽ đổi số câu bị bỏ ở `src/lib/quiz/requires.test.ts`. Story 47 (khái niệm `requires` cho bài T2) nên làm đồng đều.
  resolved: Story 47 — `-20` … `-23` thêm `verb-forms` (và mọi câu `-20` … `-26` có khái niệm bài `past-simple`); golden `-20` và số câu bị bỏ ở `src/lib/quiz/requires.test.ts` cập nhật theo.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/38-tense-rule-cards-irregular-verb-srs.md`
  summary: Thẻ quy tắc của thì không giãn nhịp: người đã đánh dấu xong nhiều bài nhận cùng lúc mọi thẻ thì chưa có lịch (tới 52 thẻ nếu xong T1–T4), kể cả ngày tồn ôn > 40 thẻ, trong khi thẻ động từ có giới hạn 10 / ngày và bị chặn ngày tồn ôn.
  evidence: Review story 38 (blind, edge). `buildSession` cho thẻ quy tắc chưa có lịch vào hết, không giới hạn (story 24 / 33, learning-rules "Thẻ quy tắc"); story 38 thêm 52 thẻ thì. Kiểm tay: người mới tới s1-t2-w2 thấy "41 từ mới hôm nay" (10 từ + 21 thẻ thì + 10 thẻ động từ). Cần chọn: giữ như cũ, áp `heavyReview` cho thẻ thì, hay chia thẻ tồn đọng theo ngày (story 42 hoặc story riêng).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/38-tense-rule-cards-irregular-verb-srs.md`
  summary: Thẻ quy tắc (kể cả thẻ động từ bất quy tắc mới) không có nút nghe khi lật, nên không ôn được cách đọc read /red/, said /sed/, bought / brought.
  evidence: Review story 38 (blind). `RuleFlashcard` (`src/components/flashcards/FlashcardSession.tsx`) bỏ TTS cho mọi thẻ quy tắc từ story 24 / 33 vì câu có thể chứa IPA; thẻ động từ không có IPA và bảng động từ đã có `speakText`. Story 38 cấm đổi class thẻ flashcard ở 375px, nên thêm nút nghe cần story riêng (dùng lại `speakText(verb)`).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/38-tense-rule-cards-irregular-verb-srs.md`
  summary: Phần lý thuyết của bài nói quá hai quy tắc: "So sánh nhất luôn có the" (`COMPARATIVES` rules[2] và mistake "So sánh nhất phải có the", sai với my best friend) và "hỏi When …?" luôn dùng quá khứ đơn (`PERFECT_VS_PAST` rules và mistake "Câu hỏi When … luôn hỏi về một lúc đã xong", sai với When will you…?).
  evidence: Review story 38 (content). Thẻ ôn của story 38 đã sửa `vi` cho đúng, nhưng story 38 cấm sửa `rules`, `mistakes` của Tense; `src/data/lessons/t2-t4-grammar.ts` (~ dòng 879 và 1003, 1016). Story 37 hoặc 39 (đụng nội dung T3–T4) nên sửa chữ.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/39-tense-choice-signal-words-aux-table.md`
  summary: Bài s1-t3-w2 (dạy nối âm) không còn video nối âm vì mV_CEIroJs8 chuyển sang ôn tổng s1-t4-w4 để giữ luật 1–2 video mỗi bài.
  evidence: Review story 39 (blind). `PRONUNCIATION_T3_W2.blocks` = [LINKING] nhưng `videos.json` chỉ còn begKNGxcjdk (grammar) + UkBzUmRhs6w (giải trí) ở s1-t3-w2. Intent story 39 chọn vậy và loại việc sắp lại video khác (story 47). Story 47 nên xem lại: chia Ngữ pháp theo ngày có thể cho phép video nối âm quay về bài dạy nối âm.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/39-tense-choice-signal-words-aux-table.md`
  summary: Tuần will (s1-t3-w1) không còn video nào nói về will; chỉ còn psI7E_J1zPo (phát âm was / were, giải trí).
  evidence: Review story 39 (blind). begKNGxcjdk (will hay going to) chuyển sang s1-t3-w2 theo Intent; `videosFor('s1-t3-w1')` chỉ còn một video. Story 47 (sắp lại video) nên tìm một video ngắn về will cho tuần này.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/39-tense-choice-signal-words-aux-table.md`
  summary: Chip tín hiệu của will (tomorrow, tonight) và going to (this weekend, next month) không chốt được thì; story 39 chỉ thêm ghi chú "chỉ để gợi ý" trên thẻ "will hay going to?".
  evidence: Review story 39 (blind + content). Quy tắc 3 của khối nói tomorrow / next week đi được với cả hai. Không đổi được chip sang "I promise", "I think", "OK, …" vì luật chip là phải có trong chữ của chính Tense, và story 39 cấm sửa dữ liệu Tense. Story 37 (thêm phần luyện T3–T4) có thể đưa các cụm này vào phần luyện của will rồi đổi chip.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/37-t3-t4-tense-practice-data.md`
  summary: Câu cũ `q-s1-t3-w1-03` ("Don't worry. I ___ forget.") dùng "Don't + V" (mệnh lệnh phủ định), thứ mà bảng phạm vi story 37 xếp vào nhóm "luôn bị báo" vì Chặng 1 chưa dạy (F08 chỉ dạy mệnh lệnh khẳng định và Let's).
  evidence: Review story 37 (blind). Câu cũ không qua `outOfScopeWords` và spec story 37 cấm sửa câu cũ. Story 47 (requires cho câu cũ) nên chọn: dạy "Don't + V" ở F08 / bài will rồi mở nhóm này, hoặc đổi đề câu cũ (giữ id), hoặc ghi câu này là ngoại lệ.
  resolved: Story 47 — "Don't + V" dạy ở s1-t1-w3 (dòng công thức "Mệnh lệnh phủ định" + lỗi "Not touch it!"); `outOfScopeWords` chỉ báo "Don't + V" khi thì chưa mở `dont` (`present-simple`), nên câu cũ hợp lệ, không sửa đề. Khối "Chọn thì" vẫn bị chặn "Don't + V" bằng regex riêng trong `lessons.test.ts`.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/37-t3-t4-tense-practice-data.md`
  summary: AC 1–3 của story 37 chưa kiểm tay trên trình duyệt: hai khối luyện ở s1-t4-w3 (375px, chỉ một khối mở, `scrollWidth` 375, store không đổi), ôn Sổ lỗi câu dịch s1-t3-w3 ("My father's never driven a car" được chấm đúng, "Vì sao sai?" gửi prompt câu gõ), thứ tự khối ở bước Bài chính s1-t3-w2.
  evidence: Review story 37 (blind). Implementation Notes ghi "Chưa kiểm tay"; component không đổi, khối tự hiện qua `GrammarSection` như story 35, 36, và test dữ liệu đã kiểm chấm câu golden bằng `matchesTyped`. Cần Huy mở các route trên Chrome 375px.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/40-owl-tense-bank-mini-t3-mix-review.md`
  summary: Câu quiz và câu O.W.L. không bị chặn theo từ vựng đã học (chỉ `outOfScopeWords` kiểm ngữ pháp), nên câu thi có thể dùng từ hạng NGSL cao (lend #2305, brush #2463, uncle #2694, bread #2262, knock #1814; "interesting" không có trong words.json).
  evidence: Review nội dung story 40 (q-owl-04, 11, 13, 30, 31, 32, 37, 40); thiếu một bộ kiểm từ vựng theo tiến độ thẻ từ cho mọi kho câu, có từ trước story 40. Điểm từng thì có thể thấp vì không biết từ chứ không vì thì.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/41-lesson-check-session-mistakes-invite.md`
  summary: Không có test hay probe nào giữ luật "phím 1–4 / Enter chỉ tác động lên câu đang làm" khi Sổ lỗi đầu bước Ôn (`SessionMistakes` chưa render `FlashcardSession`) hoặc kiểm tra cuối Bài chính (`LessonStep` ẩn thẻ đoạn) đang mở; bỏ một trong hai cổng thì 1 vừa chấm câu Sổ lỗi vừa chấm thẻ, hoặc Enter vừa sang câu kiểm tra vừa sang câu luyện thì, mà không gì đỏ.
  evidence: Review story 41 (vgap). Vitest chỉ chạy `src/**/*.test.ts` với env `node`, không có test component; probe phím tắt của `layout:check` (`HOTKEY_PROBE.sessionRoute` = `/session`) chạy trên dữ liệu sạch nên chỉ tới bước Sân ga, và đang đỏ sẵn ở F01 từ HEAD `4aff578`. Cần: sửa lỗi F01 của probe, rồi seed dữ liệu (đã qua Sân ga, có câu Sổ lỗi đến hạn) qua `Page.addScriptToEvaluateOnNewDocument`, mở `step=srs` và `step=lesson` + bấm "Làm kiểm tra", nhấn 1–4 / Enter và kiểm chỉ `QuestionCard` đang làm đổi trạng thái.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/43-quantifiers-there-negative-questions.md`
  summary: Test khai báo khái niệm của story 43 (`quantifiers` / `there-negative-questions`) bỏ qua mọi câu chưa có `requires`, nên 3 câu T2–T4 có lượng từ (`t2-t4.ts` "any money", "some water", "many countries") chưa bị kiểm; khi thêm `requires` cho câu T2–T4 cũ, các câu này phải có `quantifiers`.
  evidence: Review story 43 (blind). Thiếu `requires` ở câu T2–T4 có từ trước story 43; spec story 43 giao việc thêm `requires` cho story 47. Story 47 nên chạy lại `quantifierConcepts` (foundation.test.ts) trên mọi câu sau khi thêm `requires`, hoặc dùng danh sách ngoại lệ chốt đúng 3 id này cho tới lúc đó.
  resolved: Story 47 — mọi câu T2–T4 có `requires` (`q-s1-t3-w2-04` any, `q-s1-t4-w1-06` some, `q-s1-t4-w3-03` many khai báo `quantifiers`); test days-months, lượng từ quét cả câu mới khai báo; test liên từ quét thêm `QUESTION_BANK` (đề lấy phần tiếng Anh qua `promptEnglish`).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/44-conjunctions-question-words-subject-questions.md`
  summary: Thẻ hư từ `ngsl-because` dùng ví dụ "I am late because of the rain." (`words.json:63`), mà F16 chỉ dạy because + mệnh đề; từ story 44 thẻ này mở ngay sau F16, tức là ngay trong Sân ga.
  evidence: Review story 44 (edge, độ tin thấp). Story 44 cấm đổi `words.json` / `example-overrides.json` (Never). Lần rà ví dụ tới nên thêm override cho `ngsl-because`, ví dụ "I am happy because I have a new job.", rồi chạy lại test ví dụ hư từ.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/45-modals-have-to-could-would-like.md`
  summary: Câu ví dụ NGSL hạng 501–1000 còn modal chưa dạy lúc thẻ hiện: `ngsl-single` "I'd like a single room, please." và `ngsl-medium` "I'd like a medium coffee, please." có thể hiện quanh T3, trước s1-t4-w1 (bài dạy would like); `ngsl-attention` "May I have your attention, please?" (may chỉ dạy ở s2-t7-w3); `ngsl-shall` "Shall we start the meeting now?" (shall chưa dạy).
  evidence: Story 45 (Intent). Tập rà ví dụ của story 24 chỉ gồm NGSL hạng 1–500, từ khởi đầu và từ chủ đề của viên (`REVIEW_MAX_RANK`), nên máy dò không xét các câu này; story 45 cấm đổi `words.json`, `overrides` của `example-overrides.json`, `scripts/vocab/example-features.mjs` và `REVIEW_MAX_RANK`. Cần mở rộng tập rà của story 24 (hoặc gắn cổng theo ngữ pháp của câu ví dụ) rồi thêm override cho các câu này.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/45-modals-have-to-could-would-like.md`
  summary: Tên chủ điểm O.W.L. `modals` vẫn là "can / should / must" (`owl.ts:25`), trong khi MODALS từ story 45 là "Động từ khuyết thiếu: can / should / must, have to, could, would like"; điểm từng thì và kế hoạch ôn 14 ngày của O.W.L. hiện tên hẹp hơn bài.
  evidence: Review story 45 (blind). Story 45 cấm đổi `owl.ts` và tên chủ điểm (Never). Khi sửa O.W.L. tới nên đổi tên chủ điểm cho khớp (hoặc rút gọn "can / could / should / must, have to, would like") và cân nhắc thêm câu O.W.L. cho have to / could / would like.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/45-modals-have-to-could-would-like.md`
  summary: Thẻ "Làm quen" của `ngsl-would` có `meaningVi` "sẽ (quá khứ/lịch sự); muốn" (`words.json:37`), mở ngay sau s1-t4-w1, mà bài chỉ dạy would like ("muốn"); nghĩa "sẽ (quá khứ)" là ngữ pháp chưa dạy.
  evidence: Review story 45 (blind). Story 45 cấm đổi `words.json`. Lần rà nghĩa / ví dụ hư từ tới nên đổi nghĩa thành "muốn (would like, lịch sự)" hoặc ghi rõ phần chưa dạy, cùng đợt với mục câu ví dụ hạng 501–1000 ở trên.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/45-modals-have-to-could-would-like.md`
  summary: Phạm vi chữ từ `modals` mở mọi cách dùng của could, nhưng story 45 chỉ dạy could = quá khứ của can và nhờ / xin phép lịch sự; câu could chỉ khả năng ("It could rain") hay gợi ý ("We could go to the park") ở nội dung sau sẽ không bị `outOfScopeWords` báo.
  evidence: Review story 45 (blind). Máy dò theo từ không tách nghĩa; `tense-scope.test.ts` có test "giới hạn đã biết" chốt "It could rain." → [] ở `modals`. Người soạn nội dung `comparatives`, `passive-present` và Chặng 2 phải tự tránh, hoặc dạy could khả năng (cùng may / might) ở bài Chặng 2 rồi mới dùng.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/45-modals-have-to-could-would-like.md`
  summary: Cổng `ngsl-may` → `s2-t7-w3` và `ngsl-might` → `s2-t7-w4` dựa trên bài Chặng 2 chưa có nội dung; dòng lộ trình của hai bài (`stage-2.ts:126-131`, `lo-trinh-toeic-12-thang.md:132`) không nêu may / might.
  evidence: Review story 45 (content). Khi soạn nội dung Chặng 2 phải bảo đảm s2-t7-w3 dạy "May I…?" và s2-t7-w4 dạy might (câu điều kiện 0–1–2 có thể dạy mà không có might); nếu không, cổng mở cho từ chưa dạy. Không sửa được bây giờ vì bài chưa có nội dung.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/46-past-continuous-stage-1.md`
  summary: Kho O.W.L. 1 chưa có chủ điểm quá khứ tiếp diễn (`OWL_TOPICS` 10 chủ điểm × 2 câu), nên điểm từng thì và kế hoạch ôn 14 ngày của O.W.L. không xét thì này; bảng "Mỗi thì một dòng" (s1-t4-w4) đã có dòng `past-continuous` (11 dòng) nên test `owl.test.ts` bỏ dòng này khi so `OWL_TOPICS` với bảng.
  evidence: Story 46 (Intent: không đưa vào kho O.W.L., story 40 chốt 10 chủ điểm × 2 câu; Never: không sửa `owl.ts`, `OWL_TOPICS`, `OWL_CONTRASTS`). Quá khứ tiếp diễn vẫn được kiểm ở quiz bài, mini-t2, ôn trộn và kiểm tra cuối Bài chính. Lần sửa O.W.L. tới nên thêm chủ điểm `past-continuous` (2–3 câu, có câu when / while), cặp dễ nhầm với quá khứ đơn, và bỏ bộ lọc trong `owl.test.ts`.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/46-past-continuous-stage-1.md`
  summary: Hư từ `while` vẫn là cổng tường (`function-words.ts:39`, mở khi qua hoặc bỏ qua Sân ga) dù từ story 46 nó được dạy ở s1-t2-w4; thẻ từ `ngsl-while` có thể hiện trước bài dạy nó.
  evidence: Review story 46 (blind). Story 46 cấm sửa `function-words.ts` (Never: while vẫn là cổng tường). Lần rà cổng hư từ tới nên đổi `while` thành `lesson('s1-t2-w4', ['while'])` và chạy lại test cổng hư từ của story 24.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/46-past-continuous-stage-1.md`
  summary: Đề mini-t2 không bảo đảm có câu trọng âm / đuôi -ed / nghe dù mô tả hứa "trọng âm, đuôi -ed" (vd `mini-t2|a|false` không có câu nào), và từ story 46 bài ôn s1-t2-w4 có 12/18 câu là quá khứ tiếp diễn nên quiz bài `lesson-s1-t2-w4` gần như chỉ kiểm thì mới, ít ôn T2 tuần 1–3.
  evidence: Review story 46 (blind). `pickQuiz` chỉ chia câu theo bài (mỗi bài T2 ≥ 2), không theo đoạn (có từ trước story 46); Intent story 46 chọn để quiz bài bốc từ 18 câu của bài, và Never cấm đổi `pickQuiz`. Nếu muốn giữ phần ôn, cần một luật bốc theo đoạn / nhãn (vd mini-t2 ≥ 1 câu phát âm hoặc nghe) cùng test đi kèm, hoặc sửa mô tả mini-t2.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/46-past-continuous-stage-1.md`
  summary: Trang bài `#/roadmap/lesson/s1-t2-w4` có cuộn ngang ở 375px: 4 nút "Xem IPA" (phần ôn IPA, `whitespace-nowrap`) tràn ra tới x 391, nên `scrollWidth` = 391.
  evidence: Kiểm tay story 46 bằng Chrome headless (CDP, 375px, đã bỏ qua Sân ga): lỗi có y nguyên ở HEAD `5e4a860` (chạy lại trên worktree HEAD), không do story 46; s1-t2-w3 không bị. `layout:check` không mở route s1-t2-w4 nên chưa bắt được. Cần cho các nút "Xem IPA" xuống dòng / co lại, rồi thêm `/roadmap/lesson/s1-t2-w4` vào `ROUTES` của `scripts/layout/check-lib.mjs` (đổi baseline, nên làm ở story layout).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/42-tense-map.md`
  summary: Link "Sổ lỗi: n câu chưa thuộc" trên Bản đồ thì mở Sổ lỗi chung, không lọc theo bài / nhãn `thì`, và "ôn n câu Sổ lỗi" không nói câu nào đến hạn hôm nay.
  evidence: Review story 42 (blind). `src/pages/Mistakes.tsx` không có bộ lọc bài (có từ trước story 42); câu chỉ "thuộc" khi khoảng ôn ≥ 21 ngày nên không ôn xong trong một lần. Lần sửa Sổ lỗi tới có thể nhận `?lesson=<id>&tag=thì` và Bản đồ thì đổi link sang đó.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/42-tense-map.md`
  summary: Bản đồ thì tính % kiểm tra và Sổ lỗi theo bài, không theo từng thì: bài hai thì (s1-t2-w2, s1-t4-w3) chung số, lỗi của thì này chặn thì kia khỏi "chắc", và % lẫn câu phát âm / từ vựng.
  evidence: Review story 42 (blind). Decisions story 42 chọn tính theo bài (đã ghi ở trang và `learning-rules.md`). Câu đã có nhãn `thì` và `requires` nên có thể tách điểm / lỗi theo thì nếu Huy muốn "báo theo từng thì" chặt hơn.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/42-tense-map.md`
  summary: (Chưa kiểm chứng, nếu đúng: medium) Mục Sổ lỗi nhãn `thì` của câu đã bị gỡ khỏi kho câu hỏi vẫn được đếm là "chưa thuộc" nhưng `reviewableDue` bỏ qua, nên thì đó không bao giờ thành "chắc".
  evidence: Review story 42 (edge). `openMistakesByLesson` không kiểm `getQuestion(id)`. Cần dò `mistakes.items` của store thật (hoặc lịch sử đổi id câu hỏi) xem có id không tra được; nếu có, bỏ qua mục đó khi đếm (cùng luật với `reviewableDue`) hoặc dọn mục mồ côi.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/47-sequencing-cleanup-grammar-days.md`
  summary: Tuần will (s1-t3-w1) vẫn chưa có video nói về will, s1-t3-w2 (nối âm) chưa có video nối âm, T1-W3 / T2-W1 chưa có video ngữ pháp riêng.
  evidence: Story 47 chỉ chuyển "My Weekend" (n7RA6XxfpNU) sang đoạn giải trí s1-t2-w4, không thêm video mới: mỗi ID phải kiểm oEmbed và giấy phép, và luật 1–2 video mỗi bài là quyết định của Huy ở story 15. Lần thêm video tới nên chọn video ngắn có giấy phép rõ cho các bài này.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/47-sequencing-cleanup-grammar-days.md`
  summary: Phụ đề "My Weekend" (n7RA6XxfpNU) giờ ở tuần ôn quá khứ s1-t2-w4 nhưng chưa có tô thì (đánh dấu V2 bất quy tắc / quá khứ tiếp diễn) trong phụ đề.
  evidence: Story 47 chỉ đổi `lessonId` trong `videos.json`, không đổi file sub (Never). Nếu muốn dùng video để ôn thì, cần thêm ghi chú / tô thì trong `src/data/subs/n7RA6XxfpNU.json`.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/47-sequencing-cleanup-grammar-days.md`
  summary: used to, like + V-ing, want + to V (mức A2) chưa dạy ở Chặng 1.
  evidence: Báo cáo kiểm tra "nền & các thì" mục Thấp; story 47 cố ý không dạy (để Chặng 2), may / might đã dời sang s2-t7-w3 / s2-t7-w4 ở story 45. `outOfScopeWords` vẫn báo used to nhưng KHÔNG báo "want to" / động từ + to V khác, và ba câu phát âm cũ đã trích "want to": `q-s1-t3-w1-05` ("I want to go", to → /tə/), `q-s1-t3-w3-05` ("I want to buy a new phone"), `q-s1-t4-w1-05` (want to → wanna). Các câu này là câu phát âm (hỏi cách đọc từ "to"), không đòi Huy tự dùng mẫu. Story sau dạy want + to V (hoặc thêm luật báo mẫu động từ + to V vào `outOfScopeWords`) thì phải xử lý ba câu này; cặp câu ngày 4 s1-t2-w4 đã bỏ "started to rain" ở review story 47.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/47-sequencing-cleanup-grammar-days.md`
  summary: Ngày Ngữ pháp N1–N4 không có kiểm tra riêng; điểm "nắm chắc" theo ngày (vd câu quiz gắn ngày) chưa có.
  evidence: Story 47 dùng lại cơ chế phần (`partsSeen`) và kiểm tra 5 câu cuối Bài chính chỉ ở ngày 5 / buổi ôn cả tuần (luật "phần cuối" của story 41). Muốn kiểm tra sau từng ngày thì cần gắn câu quiz theo dạng (khẳng định / phủ định / câu hỏi).
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/47-sequencing-cleanup-grammar-days.md`
  summary: Mở lại bài đã xong từ Bản đồ thì (`lessonSessionHref`) vẫn chốt phần / ngày chưa xem đầu tiên: bài T1 chia phần hay bài T2–T4 chia ngày đã đánh dấu xong mà `partsSeen` trống (xong trước story 28 / 47, hoặc bấm "Đánh dấu đã học xong") mở ra "Ngày 1/5" (hay phần 1) chứ không phải buổi ôn cả bài có kiểm tra 5 câu, và "Xong buổi" ghi tiếp ngày cho bài đã xong.
  evidence: Review story 47 (blind, edge). `lessonPartOf` (`src/lib/sessions/plan.ts`) không xét `done`; story 42 đã ghi hành vi này cho bài T1 ("Bản đồ thì vẫn có nút Làm kiểm tra"), story 47 mở rộng sang 8 bài T2–T4. Cần Huy chọn: bài đã xong thì buổi ghim bài luôn là buổi ôn cả bài (`lessonPartOf` trả null khi `isLessonCompleted`), hay giữ như cũ.
- source_spec: `_bmad-output/specs/spec-english-learning-website/stories/47-sequencing-cleanup-grammar-days.md`
  summary: Nội dung bên trong một ngày Ngữ pháp (khối luyện của thì chỉ ở N3, khối "Chọn thì" theo `choiceIds`, phần ôn tập chỉ ở N5 / cả tuần) chỉ được kiểm tay; chọn view của buổi đã có hàm thuần `sessionSectionViews` có test, nhưng `GrammarDayBlock` / `GrammarSection` không có test.
  evidence: Review story 47 (verification gap). Repo chưa có test component (vitest chỉ chạy `src/**/*.test.ts` môi trường node). Muốn chặn hồi quy thì tách lựa chọn khối của ngày thành hàm thuần (vd `grammarDayBlocks(content, day)`) hoặc thêm môi trường test component.
