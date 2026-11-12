---
title: 'Kiểm tra cuối Bài chính, Sổ lỗi trong buổi 30'', lời mời ôn bài thì và nhãn kiểm tra trên Lộ trình (CAP-1, CAP-2, CAP-19)'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: '4aff57852e2cc7769b5633a2146964e6f8140788'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/28-t1-daily-parts-review-invite.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/21-session-plan-theory-first.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/31-desktop-hotkeys-today-roadmap-grid.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" là tự làm ra câu đúng, thì đã học được ôn lại, **kiểm tra báo theo từng bài / từng thì**. Báo cáo kiểm tra mục T4: kết quả học không quay lại điều khiển việc học. Bài chỉ xong khi bấm tay (`src/pages/Lesson.tsx:193-203`); quiz không nằm trong buổi học (`src/pages/Session.tsx:208-210` chỉ là một link); câu Sổ lỗi đến hạn chỉ hiện ở trang Luyện tập / Sổ lỗi; lời mời ôn chỉ có cho viên gạch (`src/lib/quiz/brick-invite.ts`); Lộ trình không hiện điểm kiểm tra.
- Quyết định 4: dùng lại tối đa bộ máy đã có: quiz bài `lesson-<id>` (`LESSON_QUIZ_SIZE` = 5), `planQuiz`, `QuizRun` / `QuestionCard` / `QuizResult`, `recordAttempt` (câu sai tự vào Sổ lỗi), phiên ôn Sổ lỗi của trang Sổ lỗi, khuôn lời mời ôn viên gạch của story 28 (cửa sổ 14 ngày, ≥ 2 câu, "Để sau").
- Ràng buộc chung giữ nguyên:
  - không khoá, không phạt, không reset: kiểm tra, ôn Sổ lỗi trong buổi và lời mời đều bỏ qua được; không đạt vẫn đánh dấu xong được;
  - tiếng Việt; giao diện 375px không đổi ngoài phần mới;
  - không nâng schema store, không thêm key đồng bộ.
- Claude chọn:
  - **Kiểm tra cuối Bài chính** = chính quiz bài `lesson-<id>` (5 câu, lập đề bằng `planQuiz` như trang test), chạy ngay trong bước Bài chính, không bắt buộc. Lần làm ghi như quiz bài thường (cùng `quizId`, không `kind`), câu sai vào Sổ lỗi như mọi quiz bài.
  - Thẻ kiểm tra chỉ hiện khi bài có quiz bài và buổi này học **cả bài hoặc phần cuối** của bài: `partId` null (bài không chia phần / buổi ôn cả tuần) hoặc `partId` là phần cuối của `lessonPartIds`. Buổi học phần 1, 2 của bài T1 chia phần thì không hiện (chưa học hết bài).
  - Ngưỡng đạt: `score × 100 ≥ total × 70`; % hiện làm tròn xuống (như `partPassed` / `partPercent` của O.W.L.). 4/5 đạt, 3/5 chưa đạt.
  - Đạt → mời "Đánh dấu bài xong" (một nút, không tự đánh dấu). Chưa đạt → gợi ý ôn: link "Ôn lại đoạn <đoạn sai nhiều nhất>" và chữ "buổi 30' sau vẫn là bài này để ôn lại"; vẫn có nút phụ "Vẫn đánh dấu xong". Bài đã xong thì không có nút đánh dấu nào, không bao giờ bỏ đánh dấu.
  - Khi đang làm kiểm tra và ở màn kết quả, bước Bài chính chỉ hiện phần kiểm tra (ẩn thẻ đoạn), để phím tắt của phần luyện thì (Enter) và của câu hỏi (1–4, Enter) không cùng bật và không nhìn đáp án trong bài.
  - **Sổ lỗi trong bước Ôn:** bước ôn flashcard của buổi 30' (cả "Ôn flashcard" sau Sân ga và "Ôn & từ mới" ở Sân ga) mở đầu bằng tối đa **5** câu Sổ lỗi đến hạn (hạn sớm nhất trước; ngày tồn ôn `heavyReview` thì **3**), ôn đúng như trang Sổ lỗi (đúng = Nhớ, sai = Quên). Có nút "Bỏ qua, sang ôn thẻ". Xong hoặc bỏ qua thì mới hiện phiên flashcard (không hiện cùng lúc vì trùng phím 1–4). Không có câu đến hạn thì bước Ôn y như cũ. Ngày lười không đổi.
  - **Lời mời ôn bài thì:** mục Sổ lỗi nhãn `thì` gom theo `lessonId` của mục (chỉ bài trong lộ trình, bỏ câu Sân ga `fNN`); bài có ≥ 2 câu khác nhau sai trong 14 × 24 giờ gần nhất thì Hôm nay mời "Ôn lại bài: <tên bài>?" (link về đoạn có nhiều câu sai nhất, nút "Để sau"). Lời mời ẩn khi "Để sau" sau câu sai mới nhất, hoặc khi đã **đạt kiểm tra bài** (`lesson-<id>` ≥ 70%) sau câu sai mới nhất; có câu sai `thì` mới của bài thì hiện lại. Chọn 1 bài: nhiều câu hơn → câu sai mới nhất muộn hơn → bài đứng sau trên lộ trình. Dấu "Để sau" ở `mistakes.lessonInvites[lessonId]` (như `brickInvites` của story 28: không nâng schema, không thêm key đồng bộ).
  - **Nhãn trên Lộ trình:** trạm có quiz bài hiện một dòng nhỏ dưới tên bài: "đạt x%" (x = % tốt nhất của quiz bài `lesson-<id>`, mọi lần làm, kể cả làm ở trang test) khi đã làm; "chưa kiểm tra" khi chưa làm và trạm là "đã qua" hoặc "học tiếp". Trạm chưa học / đã bỏ qua mà chưa làm, và trạm không có quiz bài, thì không có nhãn.

**Problem:** Học xong một bài thì Huy tự bấm "đã xong", không có bước nào kiểm tra Huy nắm bài chưa; câu sai nằm trong Sổ lỗi mà buổi 30' không bao giờ ôn tới; sai lặp lại cùng một bài thì không có gì nhắc ôn lại bài đó; nhìn Lộ trình không biết bài nào đã kiểm tra, đạt bao nhiêu.

**Approach:**
- Hàm thuần mới: trạng thái kiểm tra bài (đạt / %, điểm tốt nhất, nhãn Lộ trình), chọn câu Sổ lỗi cho buổi, lời mời ôn bài thì (tính, "Để sau", gộp, sao lưu); bước Bài chính có thẻ kiểm tra hiện khi nào thì tính từ kế hoạch buổi.
- UI: tách `QuizRun` (trang test) và phiên ôn Sổ lỗi (trang Sổ lỗi) thành component dùng chung; thêm thẻ kiểm tra cuối Bài chính, khối Sổ lỗi đầu bước Ôn, dải mời trên Hôm nay, nhãn trên trạm Lộ trình.

## Boundaries & Constraints

**Always:**
- Kiểm tra cuối Bài chính:
  - đề lập bằng `planQuiz(QUESTION_BANK, quiz, seed, { canSpeak, seen: seenQuestionIds(store) }, isBrickTaught)` chốt lúc bấm làm (như `DefinedQuizRun`); `not-ready` thì không chạy, hiện lời mời học viên còn thiếu (`QuizNotReady`), bài vẫn đánh dấu xong được;
  - chỉ ghi lần làm khi làm xong câu cuối (`useQuizzes().record`, `quizId` = `lessonQuizId(lessonId)`, không `kind`); rời bước / rời trang giữa chừng không ghi gì;
  - không tự đánh dấu xong; chỉ nút "Đánh dấu bài xong" / "Vẫn đánh dấu xong" gọi `setCompleted(lessonId, true)`; không bao giờ gọi `setCompleted(…, false)`;
  - bài được ghim trên URL (`?lesson=`), nên đánh dấu xong giữa buổi không đổi buổi đang học.
- Sổ lỗi trong buổi: chọn câu bằng `reviewableDue` (bỏ câu không còn tra được, bỏ câu nghe khi không có TTS, giữ mục từ đọc O.W.L.); danh sách chốt lúc vào bước; mỗi câu chấm ngay bằng `useMistakes().review` như trang Sổ lỗi.
- Lời mời ôn bài: hàm thuần, `now` và tra bài qua tham số; mục Sổ lỗi sai dạng, mục từ đọc (`word`), nhãn khác `thì`, `lessonId` không phải bài lộ trình đều bỏ; câu có `lastWrongAt` ở tương lai vẫn tính; "Để sau" ghi `dismissedAt` = muộn nhất của `now`, dấu cũ và câu sai mới nhất của bài (như `dismissBrickInvite`).
- `mistakes.lessonInvites`: gộp theo bài lấy `dismissedAt` muộn hơn (bằng nhau theo `updatedAt`, rồi giữ local; một bên sai dạng lấy bên hợp lệ) — đúng luật `mergeBrickInvites`; chỉ có key khi một bên có; sao lưu chỉ giữ id bài lộ trình với mục hợp lệ. `brickInvites` và `items` gộp / sao lưu như cũ.
- Nhãn Lộ trình: chỉ đọc `quizzes.attempts` (lần làm hợp lệ, `quizId` = `lesson-<id>`, không `kind`, `total` > 0); % tốt nhất làm tròn xuống; ≥ 70% màu `text-primary`, còn lại `text-muted-foreground`.
- 375px: không tràn ngang ở `/session` (bước Bài chính, bước Ôn), `/`, `/roadmap`; component cũ chỉ thêm phần mới, không xoá hay đổi class sẵn có (trừ chỗ Tasks ghi rõ). Nút mới cao ≥ 36px (`min-h-9` / `h-9`).

**Never:**
- Không làm việc của story khác: Bản đồ thì và mức nắm chắc theo từng thì (42); lượng từ, liên từ, modal (43–45); quá khứ tiếp diễn (46); `requires` câu cũ, test quay lại ở Sân ga, video lệch tuần, chia Ngữ pháp theo ngày (47).
- Không thêm / sửa / xoá câu trong `QUESTION_BANK`, `FOUNDATION_QUESTIONS`, `OWL_QUESTIONS`; không đổi `QUIZZES`, `LESSON_QUIZ_SIZE`, `pickQuiz` / `planQuiz`.
- Không đổi các bước, phút, thứ tự của buổi 30' (`LESSON_STEPS`, `FOUNDATION_STEPS`), không đổi ngày lười (`LazySession`), không đổi thuật toán / quota / thứ tự thẻ của `FlashcardSession`.
- Không đổi logic lời mời ôn viên gạch (`brickReviewInvite`, `dismissBrickInvite`), kế hoạch O.W.L., Sổ lỗi ở trang Luyện tập / Sổ lỗi (ngoài việc tách component, hành vi giữ nguyên).
- Không nâng `CURRENT_VERSION`, không thêm key vào `SYNCED_KEYS` / `MERGERS` / backup.
- Không khoá bài, không chặn "Xong buổi", không bắt làm kiểm tra hay ôn Sổ lỗi trước khi sang bước sau.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Thẻ kiểm tra hiện | Sau Sân ga, buổi `?lesson=s1-t2-w1&step=lesson`, đủ nền | Dưới các thẻ đoạn, trước link "Trang bài…": thẻ "Kiểm tra cuối bài", mô tả 5 câu / không bắt buộc / 70%, nút "Làm kiểm tra (5 câu)" | N/A |
| Bài chia phần | `?lesson=s1-t1-w1&part=s1-t1-w1-p1` / `…-p3` / đã xem hết (không `part`) | p1: không có thẻ kiểm tra. p3 (phần cuối) và buổi ôn cả tuần: có thẻ | N/A |
| Bài không có quiz | `s1-t4-w2` (Tết), bài chặng 2, "đã đi hết lộ trình" | Không có thẻ kiểm tra; bước Bài chính như cũ | N/A |
| Chưa đủ nền | `planQuiz` trả `not-ready` (Sân ga chưa học viên cần) | Bấm làm → `QuizNotReady` (liệt kê viên thiếu, nút học viên đầu tiên chưa dạy); không ghi gì | Không chặn bài |
| Đạt | Làm 5 câu, đúng 4 (80%), bài chưa xong | Thẻ đoạn ẩn; `QuizResult` 4/5 (không có nút "Về bài học"), khối "Đạt 80%!" + nút "Đánh dấu bài xong"; bấm → `progress` bài `done`, khối đổi thành "Đã đánh dấu xong bài. Sang phần ôn flashcard nhé."; lần làm `lesson-s1-t2-w1` được ghi, câu sai vào Sổ lỗi | N/A |
| Chưa đạt | Đúng 3/5 (60%), bài chưa xong | Khối "Được 60%, chưa tới 70%.", nút `outline` "Ôn lại đoạn <đoạn sai nhiều nhất>" (`sectionHref`), chữ "buổi 30' sau vẫn là bài này…", nút `ghost` "Vẫn đánh dấu xong"; "Làm lại (đề mới)"; bài không đổi trạng thái | N/A |
| Bài đã xong | Bài đã `done`, làm kiểm tra đạt / chưa đạt | Đạt: "Đạt x%. Bài đã đánh dấu xong." Chưa đạt: chỉ gợi ý ôn đoạn, không có "Vẫn đánh dấu xong", không câu "buổi sau vẫn là bài này"; không bao giờ bỏ đánh dấu | N/A |
| Quay lại bài | Ở màn kết quả bấm "Xem lại nội dung bài" | Thẻ đoạn hiện lại; thẻ kiểm tra ở trạng thái đầu kèm "Lần tốt nhất: đạt x%" | N/A |
| Rời giữa chừng | Đang câu 3/5, bấm → / "Tiếp" sang bước Ôn, hoặc "Thôi, quay lại bài" | Không ghi lần làm, không ghi Sổ lỗi | N/A |
| Sổ lỗi trong bước Ôn | 8 câu đến hạn, ngày thường, `step=srs` | Đầu bước: dòng giới thiệu + `QuestionCard` "Sổ lỗi · câu 1/5" (5 câu hạn sớm nhất), nút "Bỏ qua, sang ôn thẻ"; xong → dòng "Đã ôn 5 câu Sổ lỗi đến hạn." rồi `FlashcardSession` | N/A |
| Ngày tồn ôn | Như trên, `heavyReview` = true | 3 câu | N/A |
| Ít / không đến hạn | 2 câu đến hạn / 0 câu | 2 câu rồi thẻ / bước Ôn y như cũ (không có dòng nào thêm) | N/A |
| Không TTS, mục từ đọc | Câu nghe đến hạn, máy không TTS; mục từ đọc O.W.L. đến hạn | Câu nghe bị bỏ (không tính vào 5); mục từ đọc ôn bằng `WordReviewCard` | N/A |
| Bỏ qua Sổ lỗi | Bấm "Bỏ qua, sang ôn thẻ" sau câu 2/5 | 2 câu đã chấm giữ kết quả; dòng "Sổ lỗi để sau: các câu còn lại vẫn ở trang Sổ lỗi sai." (link) rồi `FlashcardSession` | N/A |
| Buổi Sân ga | `step=review`, có câu Sổ lỗi đến hạn | Như bước Ôn sau Sân ga | N/A |
| Mời ôn bài | Sổ lỗi: 2 câu `thì` của `s1-t2-w2` (đoạn `grammar`) sai 3 và 5 ngày trước, chưa làm lại kiểm tra bài | Hôm nay có dải "Ôn lại bài: <tên s1-t2-w2>?", "Gần đây có 2 câu sai về thì của bài này…", nút "Ôn lại bài" → `sectionHref('s1-t2-w2','grammar')`, nút "Để sau" | N/A |
| Không mời | 1 câu; 2 câu nhưng nhãn `phát âm`; 2 câu nhưng 1 câu sai 15 ngày trước; 2 câu Sân ga `f13` nhãn `thì` | Không có dải | N/A |
| Để sau | Bấm "Để sau" | Dải ẩn; `mistakes.lessonInvites['s1-t2-w2']` có `dismissedAt`; câu `thì` mới của bài sai sau đó → hiện lại | N/A |
| Đạt kiểm tra bài | Sau câu sai mới nhất có lần làm `lesson-s1-t2-w2` 4/5; một lần khác 2/5 | 4/5 → không mời; chỉ có 2/5 → vẫn mời | N/A |
| Nhiều bài | `s1-t2-w1` 2 câu, `s1-t3-w1` 3 câu | Mời `s1-t3-w1`; bằng số câu → bài có câu sai mới hơn; bằng nữa → bài đứng sau | N/A |
| Nhãn Lộ trình | `s1-t1-w1` xong, best 4/5; `s1-t1-w2` "học tiếp", chưa làm; `s1-t2-w1` chưa học, từng làm 2/5; `s1-t2-w2` chưa học, chưa làm; bài chặng 2 | "đạt 80%" (`text-primary`); "chưa kiểm tra"; "đạt 40%" (`text-muted-foreground`); không nhãn; không nhãn | N/A |
| Lần làm khác loại | Chỉ có mini-t1, test quay lại, O.W.L. chứa câu của `s1-t1-w3` | Nhãn `s1-t1-w3` không đổi ("chưa kiểm tra" nếu đã qua / học tiếp) | N/A |
| Đồng bộ / sao lưu | Hai máy cùng có `lessonInvites['s1-t2-w2']`; file sao lưu có `lessonInvites` với id lạ / mục hỏng | Gộp lấy `dismissedAt` muộn hơn; khôi phục chỉ giữ id bài lộ trình với mục hợp lệ; `items`, `brickInvites` như cũ | Mục hỏng bị bỏ, không ném lỗi |
| Dữ liệu hỏng | `mistakes.lessonInvites` không phải object; mục thiếu `dismissedAt` | Coi như chưa "Để sau" | Không ném lỗi |

</frozen-after-approval>

## Code Map

- `src/pages/Session.tsx`:
  - `LessonStep` (:154-213): thẻ đoạn qua `prioritizeSections`, link "Trang bài: kiểm tra bài, ghi chú, đánh dấu xong" (:208) → thêm thẻ kiểm tra trước link; ẩn thẻ đoạn khi kiểm tra đang chạy / có kết quả;
  - `isFlashcards` (:326) và `FlashcardSession` (:358-373) → bọc bằng khối Sổ lỗi; `plan.partId`, `plan.lesson` truyền vào `LessonStep`.
- `src/lib/sessions/plan.ts` -- `SessionPlan` (`partId`), `LESSON_STEPS`, `lessonPartOf`; `lessonPartIds` từ `@/data/lessons`. Thêm hàm chọn quiz kiểm tra của buổi. `plan.test.ts` là chỗ test.
- `src/pages/Quiz.tsx` -- `Run` / `newRun` / `randomPart` (:40-50), `QuizRun` (:65-137), `QuizNotReady` (:142-179), `DefinedQuizRun` (:186, mẫu lập đề). Tách `QuizRun` + `QuizNotReady` ra file dùng chung, trang test giữ nguyên hành vi.
- `src/components/quiz/QuizResult.tsx` -- props `homeLessonId`, `onRetry`, `next`; nút ghost "Về bài học" (:60-62) → thêm prop ẩn.
- `src/pages/Mistakes.tsx` -- `ReviewSession` (:37-98): phiên ôn sổ (câu hỏi + từ đọc, `review` chấm ngay) → tách ra file dùng chung, heading cấu hình được.
- `src/lib/quiz/mistakes.ts` -- `reviewableDue` (:207), `dueMistakes`, `MistakeItem` (`tag`, `lessonId`, `sectionId`, `lastWrongAt`, `word`).
- `src/lib/quiz/brick-invite.ts` -- khuôn mẫu cho lời mời ôn bài: `BRICK_INVITE_WINDOW_DAYS`, `isBrickInviteDismissal`, `brickReviewInvite`, `dismissBrickInvite`, `mergeBrickInvites`. Không đổi hành vi.
- `src/lib/quiz/quiz.ts` -- `listGradedAttempts(store, quizId)`, `GradedAttempt`, `recordAttempt`; `src/lib/quiz/index.ts` re-export.
- `src/lib/quiz/requires.ts:92-130` -- `planQuiz`, `quizButtonCount`.
- `src/lib/comeback/comeback.ts:129` -- `weakestSectionFrom(graded)`: đoạn sai nhiều nhất (dùng cho link "Ôn lại đoạn …").
- `src/lib/owl/owl.ts:269-276` -- `partPassed` / `partPercent`: chỉ là mẫu công thức (không import từ `lib/quiz` vì `owl` đã import `quiz`).
- `src/data/questions/index.ts` -- `getQuiz`, `lessonQuizId`, `LESSON_QUIZ_SIZE`, `QUESTION_BANK`, `MISTAKES_HREF`. `src/data/roadmap` -- `getLesson`, `allLessons`, `sectionHref`, `lessonHref`, `SECTION_TITLES`.
- `src/app/store-context.ts` -- `useProgress` (:166, `setCompleted`), `useQuizzes` (:508), `useMistakes` (:568), `brickInviteFor` / `useBrickInvite` (:199-218, mẫu cho hook mới), `useNewWordOptions` (:391, `heavyReview`).
- `src/pages/Today.tsx:204-211` -- dải `BrickReviewInvite`; `src/components/foundation/BrickReviewInvite.tsx` -- mẫu dải mời.
- `src/pages/Roadmap.tsx` -- `computeRoadmapProgress`, render `StageMap`; `src/components/roadmap/StageMap.tsx` -- `stationState` (:12), `Station` (:118); `src/components/roadmap/Station.tsx` -- dòng trên (tháng · tuần, nhãn) và tên bài (:55-80).
- `src/lib/sync/merge.ts:252-258` -- `mergeMistakes` (`items` + `brickInvites`); `src/lib/backup/backup.ts:167-171` -- làm sạch `brickInvites`.
- `src/pages/Lesson.tsx:201-203` -- chữ "Nút tạm: sau này buổi học sẽ tự ghi tiến độ khi bạn học xong."
- Test có sẵn để mở rộng: `src/lib/quiz/brick-invite.test.ts` (mẫu), `src/lib/sync/merge.test.ts:682-707`, `src/lib/backup/backup.test.ts:621`, `src/lib/sessions/plan.test.ts`. Vitest env `node`, chỉ `src/**/*.test.ts`: component kiểm qua hàm thuần.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/quiz/lesson-check.ts` (mới) -- `LESSON_CHECK_PASS_PERCENT = 70`; `checkPassed(score, total)` (`total > 0 && score*100 >= total*70`), `checkPercent(score, total)` (làm tròn xuống, `total` 0 → 0); `bestLessonCheck(store, lessonId): { score; total; percent; passed } | null` (lần làm hợp lệ `quizId === lessonQuizId(lessonId)`, không `kind`, `total > 0`; % cao nhất, bằng nhau lấy lần mới hơn); `lessonCheckPassedSince(store, lessonId, sinceMs): boolean` (có lần đạt với `finishedAt` > `sinceMs`); `roadmapCheckLabel(store, lessonId, state: StationState): { text: string; passed: boolean } | null` theo luật "Nhãn trên Lộ trình" (bài không có `getQuiz(lessonQuizId(id))` → null). Doc tiếng Việt. Export qua `src/lib/quiz/index.ts`.
- [x] `src/lib/quiz/lesson-invite.ts` (mới) -- `LESSON_INVITE_WINDOW_DAYS = 14`, `LESSON_INVITE_MIN_QUESTIONS = 2`, `LESSON_INVITE_TAG: MistakeTag = 'thì'`; `readLessonInvites(store)`; kiểu `LessonReviewInvite = { lessonId; questionIds (mới nhất trước); sectionId }` (`sectionId` = đoạn có nhiều câu nhất, bằng nhau lấy đoạn của câu sai mới nhất); `lessonReviewInvite(store, now, deps?: { isLesson?: (id) => boolean })` (mặc định `getLesson(id) !== undefined`; ẩn khi câu sai mới nhất ≤ `max(dismissedAt, lần đạt kiểm tra bài sau đó)` — dùng `lessonCheckPassedSince`); `dismissLessonInvite(store, lessonId, now, isLesson?)`; `mergeLessonInvites(local, server)`. Dùng lại `isBrickInviteDismissal` cho dạng mục (cùng shape `{ dismissedAt, updatedAt }`); nếu tách helper gộp chung thì `mergeBrickInvites` giữ đúng hành vi và test cũ. Export qua `index.ts`.
- [x] `src/lib/quiz/mistakes.ts` -- `SESSION_MISTAKES_MAX = 5`, `SESSION_MISTAKES_HEAVY = 3`; `sessionMistakeIds(items, now, { canSpeak, heavyReview }, lookup = getQuestion): string[]` = `reviewableDue(...).due` cắt còn 3 / 5, giữ thứ tự hạn sớm trước.
- [x] `src/lib/sessions/plan.ts` -- `sessionCheckQuizId(plan): string | null`: buổi bài có `lesson`, có `getQuiz(lessonQuizId(id))`, và `partId` null hoặc là phần cuối của `lessonPartIds(id)` → id quiz; còn lại null. Doc nêu lý do (buổi phần 1–2 chưa học hết bài).
- [x] `src/components/quiz/QuizRun.tsx` (mới) -- chuyển nguyên `Run`, `newRun`, `randomPart`, `QuizRun`, `QuizNotReady` từ `Quiz.tsx` (export); `src/pages/Quiz.tsx` import lại, không đổi chữ, class, hành vi.
- [x] `src/components/quiz/MistakeReviewSession.tsx` (mới) -- chuyển `ReviewSession` từ `Mistakes.tsx` thành `MistakeReviewSession({ ids, onDone, headingPrefix = 'Ôn sổ' })` (heading `${headingPrefix} · câu i/n`); `Mistakes.tsx` dùng lại, giữ đúng chữ cũ.
- [x] `src/components/quiz/QuizResult.tsx` -- prop `showHome?: boolean` (mặc định true); false thì không render nút "Về bài học / Về Lộ trình". Không đổi gì khác.
- [x] `src/components/session/LessonCheck.tsx` (mới) -- thẻ kiểm tra cuối Bài chính theo Matrix và Design Notes: pha `idle` / `running` (đề chốt bằng `planQuiz` lúc bấm, `not-ready` → `QuizNotReady`) / `result` (`QuizResult` với `showHome={false}`, `onRetry` = lượt mới, `next` = khối nhận xét); báo pha lên cha qua `onFocusChange(focused: boolean)` để `LessonStep` ẩn thẻ đoạn; dùng `useProgress`, `useLoadedStore`, `weakestSectionFrom`, `checkPassed` / `checkPercent`, `bestLessonCheck`.
- [x] `src/components/session/SessionMistakes.tsx` (mới) -- `SessionMistakes({ children })`: chốt `sessionMistakeIds` lúc mount (`canSpeak()`, `useNewWordOptions(now).heavyReview`); rỗng → chỉ `children`; có câu → khối giới thiệu + `MistakeReviewSession` (`headingPrefix` "Sổ lỗi") + nút ghost "Bỏ qua, sang ôn thẻ"; xong / bỏ qua → dòng trạng thái (Design Notes) + `children`. Không render `children` khi đang ôn Sổ lỗi.
- [x] `src/pages/Session.tsx` -- `LessonStep` nhận `checkQuizId = sessionCheckQuizId(plan)`; có thì render `LessonCheck` sau các thẻ đoạn, trước link "Trang bài"; khi `LessonCheck` báo focused thì không render thẻ đoạn (header bài vẫn hiện). Bước Ôn: `<SessionMistakes key={meta.id}>` bọc `FlashcardSession` hiện có (không đổi props). Sửa doc `LessonStep` / `Session`.
- [x] `src/app/store-context.ts` -- `lessonInviteFor(store, now)` và `useLessonInvite(now)` (`invite`, `dismiss`) theo khuôn `useBrickInvite`.
- [x] `src/components/quiz/LessonReviewInvite.tsx` (mới) -- dải mời giống `BrickReviewInvite` (cùng class khung, icon `RotateCcw`), chữ theo Design Notes; nút `size="sm"` "Ôn lại bài" (`sectionHref(lessonId, sectionId)`), ghost "Để sau".
- [x] `src/pages/Today.tsx` -- ngay sau dải `BrickReviewInvite`: `{lessonInvite.invite && <LessonReviewInvite … className="lg:col-span-2" />}`; sửa doc `Today`.
- [x] `src/components/roadmap/Station.tsx` -- prop `check?: { text: string; passed: boolean } | null`; có thì thêm `<span>` mới ngay sau `<span>` tên bài: `block text-[11px]` + `text-primary` (đạt) / `text-muted-foreground`. Không đổi class sẵn có.
- [x] `src/components/roadmap/StageMap.tsx` + `src/pages/Roadmap.tsx` -- `Roadmap` tính map nhãn (`roadmapCheckLabel` cho mọi bài, theo `stationState`) bằng `useMemo` trên `store` + `progress`; `StageMap` nhận prop `checks?: ReadonlyMap<string, …>` và truyền `check` cho `Station` (xuất `stationState` để `Roadmap` dùng chung).
- [x] `src/lib/sync/merge.ts` -- `mergeMistakes` gộp thêm `lessonInvites` bằng `mergeLessonInvites` (chỉ có key khi một bên có); doc.
- [x] `src/lib/backup/backup.ts` -- `sanitizeBackupData` mục `mistakes`: có `lessonInvites` thì chỉ giữ id `getLesson(id) !== undefined` với mục `isBrickInviteDismissal`.
- [x] `src/pages/Lesson.tsx` -- đổi chữ dòng ghi chú dưới nút đánh dấu (:201-203): bài có quiz bài → "Buổi 30' có kiểm tra cuối Bài chính: đạt từ 70% thì app mời đánh dấu xong. Nút này bấm lúc nào cũng được."; bài không có quiz bài → "Nút này bấm lúc nào cũng được." (giữ class).
- [x] `src/lib/quiz/lesson-check.ts` -- `lessonCheckVerdict(passed, done, markedHere)` (hàm thuần): nút đánh dấu `'primary'` / `'fallback'` / null, dòng "Đã đánh dấu xong", link ôn đoạn, câu "buổi sau vẫn là bài này"; `CheckVerdict` của `LessonCheck` render theo kết quả này.
- [x] `src/lib/quiz/lesson-check.test.ts` (mới) -- ngưỡng (4/5, 3/5, 3/4, 7/10, 0/0), % làm tròn xuống; `lessonCheckVerdict` theo dòng Matrix "Đạt", "Chưa đạt", "Bài đã xong" (không có lối tự đánh dấu hay bỏ đánh dấu); `bestLessonCheck` lấy max, bỏ lần `kind` comeback / owl / mini test / lần hỏng; `lessonCheckPassedSince`; `roadmapCheckLabel` đủ các dòng Matrix "Nhãn Lộ trình", "Lần làm khác loại".
- [x] `src/lib/quiz/lesson-invite.test.ts` (mới) -- mọi dòng Matrix từ "Mời ôn bài" tới "Nhiều bài" và "Dữ liệu hỏng" (cửa sổ đúng 14 × 24 giờ ở biên, câu tương lai, `sectionId` chọn đúng, "Để sau" khi đồng hồ lệch, id lạ → store cũ); `mergeLessonInvites` như test `mergeBrickInvites`.
- [x] `src/lib/quiz/session-mistakes.test.ts` (mới; Sổ lỗi chưa có file test riêng, các ca cũ nằm ở `quiz.test.ts`) -- `sessionMistakeIds`: 0 / 2 / 8 câu đến hạn, `heavyReview`, câu nghe không TTS, mục từ đọc, câu chưa đến hạn không lấy, thứ tự hạn sớm trước.
- [x] `src/lib/sessions/plan.test.ts` -- `sessionCheckQuizId`: dòng Matrix "Thẻ kiểm tra hiện", "Bài chia phần" (p1, p3, null), "Bài không có quiz", buổi Sân ga → null.
- [x] `src/lib/sync/merge.test.ts` + `src/lib/backup/backup.test.ts` -- dòng Matrix "Đồng bộ / sao lưu"; ca `brickInvites` cũ giữ nguyên.

**Acceptance Criteria:**
- Given Huy ở 375px trong buổi 30' bài s1-t2-w1, when cuộn hết bước Bài chính, làm kiểm tra 5 câu tới màn kết quả, rồi sang bước Ôn có câu Sổ lỗi đến hạn, then không chỗ nào tràn ngang (`scrollWidth` = 375), nút mới đủ lớn để chạm, phím 1–4 / Enter chỉ tác động lên câu đang làm.
- Given máy ≥ 1024px, when mở `/session?lesson=s1-t2-w1&step=lesson` và làm kiểm tra, then thẻ kiểm tra và kết quả nằm trong cột chính, cột phụ (stepper dọc, nút Tiếp / Xong buổi) giữ nguyên; `→` vẫn sang bước sau (bỏ lần làm dở, không ghi gì).
- Given Huy đạt kiểm tra trong buổi và bấm "Đánh dấu bài xong", when mở `/roadmap`, then trạm bài đó sáng "đã qua" kèm "đạt x%", và trang Phòng Cúp / Sổ lỗi / lịch sử quiz bài thấy lần làm như một lần làm ở trang test.
- Given bản sao lưu xuất sau khi bấm "Để sau" một lời mời ôn bài, when khôi phục hoặc đồng bộ sang máy khác, then lời mời vẫn ẩn (không key mới, `schemaVersion` không đổi).
- Given `npm run layout:guard`, when chạy, then chỉ báo class **thêm** ở `Station.tsx`, `Session.tsx`, `Today.tsx` (nếu có) và các file component mới; không xoá class nào. `npm run layout:check`: mọi route ok ở 5 bề rộng; ảnh 375px trùng baseline trừ `/roadmap` (thêm dòng nhãn ở trạm "học tiếp") và `/roadmap/lesson/s1-t1-w1` (chữ ghi chú dưới nút đánh dấu).

## Implementation Notes

- **Lib thuần mới:** `src/lib/quiz/lesson-check.ts` (`checkPassed` / `checkPercent` / `bestLessonCheck` / `lessonCheckPassedSince` / `roadmapCheckLabel`; kiểu trạng thái trạm khai báo lại là `CheckStationState` cùng giá trị với `StationState` để `lib` không import từ `components`), `src/lib/quiz/lesson-invite.ts` (`lessonReviewInvite`, `dismissLessonInvite`, `readLessonInvites`, `mergeLessonInvites` = gọi thẳng `mergeBrickInvites`, nên luật gộp và test cũ của `brickInvites` không đổi). `sessionMistakeIds` + `SESSION_MISTAKES_MAX/HEAVY` trong `mistakes.ts`; `sessionCheckQuizId` trong `sessions/plan.ts` (import `getQuiz` / `lessonQuizId` từ `@/data/questions`).
- **Ẩn lời mời khi đã đạt kiểm tra:** gọi `lessonCheckPassedSince(store, id, latest − 1)`, tức lần đạt xong **cùng lúc hoặc sau** câu sai mới nhất. Lý do: câu sai trong chính lần kiểm tra đạt (4/5) có `lastWrongAt` = `finishedAt` của lần đó; nếu dùng `>` nghiêm ngặt thì lần đạt ấy không ẩn được lời mời. Hàm `lessonCheckPassedSince` vẫn đúng như spec (`finishedAt > sinceMs`).
- **Tách component:** `Run` / `newRun` / `randomPart` (và `brickLabel`) nằm ở `src/components/quiz/quiz-run.ts`, còn `QuizRun` / `QuizNotReady` ở `QuizRun.tsx`: file `.tsx` chỉ xuất component để `react-refresh/only-export-components` không cảnh báo. `QuizRun` thêm prop tuỳ chọn `onFinish(graded)` (gọi sau khi ghi lần làm) để `LessonCheck` biết đã sang màn kết quả (ẩn nút "Thôi, quay lại bài"); trang test không truyền nên hành vi giữ nguyên. `stationState` chuyển sang `src/components/roadmap/station-state.ts` (cùng lý do), `StageMap` và `Roadmap` dùng chung.
- **`LessonCheck`:** pha `idle` / `run` (`finished` sau `onFinish`). Đang làm hoặc ở kết quả → `onFocusChange(true)`, `LessonStep` ẩn thẻ đoạn và dòng "Đã xem đủ n phần"; header bài, link "Trang bài…" vẫn hiện. Dòng "Kiểm tra cuối bài · {tên bài}" hiện cả lúc làm lẫn lúc xem kết quả. Đề lập bằng `planQuiz` trong `useState` của `CheckRun` (key theo seed), `not-ready` → `QuizNotReady` + "Thôi, quay lại bài". "Vẫn đánh dấu xong" / "Đánh dấu bài xong" chỉ gọi `setCompleted(id, true)`; sau khi bấm, khối hiện "Đã đánh dấu xong bài. Sang phần ôn flashcard nhé." (với chưa đạt thì giữ gợi ý ôn đoạn). Weak section null → link `lessonHref` chữ "Ôn lại bài".
- **`SessionMistakes`:** `now` chốt lúc mount, `heavyReview` lấy từ `useNewWordOptions(now)`, danh sách chốt bằng `useState`. Bọc `FlashcardSession` bằng `<SessionMistakes key={meta.id}>`, props của `FlashcardSession` không đổi.
- **Nút mới ≥ 36px:** dải `LessonReviewInvite` giữ `size="sm"` như dải viên gạch nhưng thêm `min-h-9`; các nút khác dùng size mặc định (`h-9`) hoặc `h-auto min-h-9`.
- **`Roadmap.tsx`:** tên `Map` ở file này là icon lucide nên map nhãn dựng bằng `new globalThis.Map(...)`.
- **Kiểm chứng:** `npm run lint` sạch; `npm test` 85 file / 2036 test xanh; `npm run build` qua kèm `check-precache: OK`. `npm run layout:guard`: chỉ báo class thêm ở file mới, cộng 8 dòng "xoá" ở `src/pages/Quiz.tsx` là các class của `QuizRun` chuyển nguyên sang `src/components/quiz/QuizRun.tsx` (tách component theo Tasks, không phải xoá thật). `npm run layout:check`: mọi route ok ở 5 bề rộng; ảnh 375px chỉ lệch ở `/roadmap` và `/roadmap/lesson/s1-t1-w1` đúng như AC. Probe phím tắt báo lỗi "F01: gõ "chào 1" + Enter…" — lỗi có sẵn ở HEAD `4aff578` (đã chạy lại `layout:check --skip-diff` trên worktree HEAD, cùng lỗi), không liên quan story này.
- **Chưa kiểm tay trên trình duyệt:** luồng làm kiểm tra / Sổ lỗi trong bước Ôn / dải mời chỉ được kiểm qua hàm thuần và layout check (Vitest env `node`, không có test component).

## Spec Change Log

- **2026-11-13, review vòng 0 (triage):**
  - *Finding kích hoạt:* (1) ghi chú dưới nút đánh dấu ở trang bài hiện "Buổi 30' có kiểm tra 5 câu…" cả ở bài không có quiz bài (Tết `s1-t4-w2`, chặng 2), và đề có thể ít hơn 5 câu khi `planQuiz` bỏ câu thiếu nền; (2) luật nút của khối nhận xét (`CheckVerdict`) nằm trong JSX, không test nào giữ "không tự đánh dấu / không bỏ đánh dấu".
  - *Sửa gì (ngoài phần frozen):* Task `src/pages/Lesson.tsx` đổi chữ ghi chú: bỏ "5 câu", bài không có quiz bài chỉ ghi "Nút này bấm lúc nào cũng được."; thêm Task `lessonCheckVerdict` (hàm thuần) và dòng test tương ứng.
  - *Tránh trạng thái sai:* trang bài hứa một bài kiểm tra mà buổi 30' không bao giờ có; sửa nhánh đánh dấu trong JSX mà không test nào đỏ.
  - *KEEP:* toàn bộ chữ và thứ tự khối nhận xét theo Design Notes; `markedHere` vẫn là state cục bộ; chỉ `setCompleted(id, true)`.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Dải `LessonReviewInvite` bảo "làm kiểm tra bài" mà không có nút làm kiểm tra | false | "Ôn lại bài" mở `sectionHref` = trang bài; cột phải trang bài luôn có nút "Kiểm tra bài (n câu)" (`src/pages/Lesson.tsx:179-186`), nên luồng ôn → kiểm tra có sẵn. Design Notes chỉ định đúng 2 nút | reject |
| 2 | blind | Ghi chú dưới nút đánh dấu ở trang bài sai với bài không có quiz bài và ghi cứng "5 câu" | low | Đúng: chữ hiện ở mọi bài, `s1-t4-w2` / chặng 2 không bao giờ có thẻ kiểm tra; `planQuiz` có thể trả < 5 câu. Sửa trực tiếp: điều kiện theo `quiz` đã có trong `Lesson`, bỏ "5 câu" | patch |
| 3 | blind | Bấm làm kiểm tra gỡ thẻ đoạn, mất state phần luyện (vị trí câu của `TensePractice`, video…) | low | Đúng là gỡ (`showSections &&`) và `TensePractice` giữ `index` bằng `useState`. Nhưng thẻ kiểm tra nằm cuối bước, sau khi đã luyện; spec chủ ý "ẩn thẻ đoạn" để Enter của phần luyện không cùng bật. Giữ mount mà tắt phím phải luồn thêm prop qua `LessonSectionContent` → `TensePractice` | reject |
| 4 | blind | ←/→ của bước vẫn bật khi đang làm kiểm tra, bỏ lần làm không cảnh báo | false | → bỏ lần làm dở là hành vi AC 2 yêu cầu. ← ở bước Bài chính không có binding: `LESSON_STEPS` bắt đầu bằng `lesson`, `stepForKey('ArrowLeft', 0, …)` trả null (`Session.tsx:332-337`) | reject |
| 5 | blind | "Bỏ qua" và trần 5 câu của `SessionMistakes` mất khi rời bước rồi quay lại | low | Đúng: `key={meta.id}` + bước khác không render nên remount, chốt lại danh sách. Hiếm (phải quay lại bước Ôn), bỏ qua lại chỉ một chạm; sửa cần nâng state lên `Session` | reject |
| 6 | blind | "Để sau" bị phá khi sai lại câu cũ trong ôn Sổ lỗi buổi 30' | false | Spec frozen định nghĩa ẩn theo "câu sai mới nhất" (`lastWrongAt`) và hiện lại khi "có câu sai `thì` mới", cùng khuôn `brickInvites` story 28; sai lại câu cũ là một lần sai mới nên mời lại là đúng ý | reject |
| 7 | blind | `checks` ở `Roadmap` tính lại mỗi lần ghi store, mỗi nhãn quét mọi lần làm | low | Đúng về độ phức tạp, nhưng ~100 bài × vài trăm lần làm là vài chục nghìn phép, trang Lộ trình hầu như không ghi store; không thấy được. Sửa cần gom theo `quizId` (thêm cấu trúc) | reject |
| 8 | blind | `lessonOrder` gọi `allLessons().findIndex` mỗi lần so | low | Chỉ chạy khi có ≥ 2 bài đủ điều kiện, mảng bài cỡ trăm phần tử; không đáng kể | reject |
| 9 | blind | `lessonCheckAttempts` không bỏ lần `skipped` như `listGradedAttempts` | false | `isQuizAttempt` (`quiz.ts:75`) chỉ nhận `skipped: true` khi `kind === 'comeback'` và `total === 0`, nên `listAttempts` đã loại mọi lần skipped không `kind`; bộ lọc `kind === undefined && total > 0` cho cùng kết quả | reject |
| 10 | blind | `checkPassed` / `checkPercent` lặp công thức `partPassed` / `partPercent` của O.W.L. | low | Hai ngưỡng là hai luật sản phẩm riêng (đạt kiểm tra bài vs đạt phần O.W.L.) trùng giá trị 70%; buộc chung là ghép hai quyết định độc lập, và spec cấm đổi O.W.L. Không có caller nào lệch | reject |
| 11 | blind | `CheckStationState` chép tay `StationState`, lệch không ai bắt | false | `Roadmap.tsx` truyền thẳng kết quả `stationState(...)` (kiểu `StationState`) vào `roadmapCheckLabel(state: CheckStationState)`; thêm giá trị mới vào `StationState` thì `tsc -b` báo lỗi ngay | reject |
| 12 | blind | Thiếu nền mà thẻ idle vẫn mời "Làm kiểm tra", bấm mới thấy `QuizNotReady` | low | Đúng như mô tả, nhưng đây chính là hành vi Matrix "Chưa đủ nền" và Design Notes ("null thì nút 'Làm kiểm tra' không số") chỉ định; `QuizNotReady` có nút "Thôi, quay lại bài" | reject |
| 13 | blind | File story chưa cập nhật (status, Triage Log rỗng), kiểm tay chưa làm | false | Bước triage này ghi Triage Log và đặt `done`; Implementation Notes đã ghi "Chưa kiểm tay trên trình duyệt"; các kiểm tay chuyển thành việc Huy tự kiểm khi bàn giao | reject |
| 14 | edge | `lastWrongAt` ở tương lai (đồng hồ lệch) thì đạt kiểm tra không ẩn lời mời | low | Đúng về logic, nhưng chỉ khi đồng hồ hai máy lệch; "Để sau" vẫn ẩn được (đã xử lý tương lai). Guard đề xuất `min(latest, now) − 1` không hiệu quả: lần đạt hôm trước có `finishedAt < now` nên vẫn không ẩn | reject |
| 15 | edge | `QuizNotReady` trong buổi có link "Về bài" / "Học Fxx" rời trang buổi | low | Đúng là rời `/session`, nhưng buổi chốt trên URL nên quay lại đúng bước; học viên thiếu buộc phải sang trang viên gạch; có sẵn "Thôi, quay lại bài" | reject |
| 16 | edge | `mergeLessonInvites` không chặn key `__proto__` | low | Luật gộp có sẵn từ `mergeBrickInvites` (story 28); `__proto__` không phải id bài, dữ liệu chỉ do app ghi, và gán vào prototype chỉ làm mất mục rác đó; sao lưu đã lọc id bài | reject |
| 17 | edge | `Run` / `newRun` / `randomPart` ở `quiz-run.ts` chứ không ở `QuizRun.tsx` như Tasks | low | Lệch có chủ ý, đã ghi ở Implementation Notes (rule `react-refresh/only-export-components`); không đổi hành vi | reject |
| 18 | vgap | Không test nào giữ "phím 1–4 / Enter chỉ tác động câu đang làm" khi Sổ lỗi trong bước Ôn / kiểm tra cuối bài đang mở | medium | Đã xác minh bởi lớp vgap: Vitest env `node`, không có test component; probe phím tắt chỉ chạy trên dữ liệu sạch (bước Sân ga) và đang đỏ sẵn ở F01 từ HEAD | defer |
| 19 | vgap | Luật nút của khối nhận xét kiểm tra (`CheckVerdict`) nằm trong JSX, không test | medium | Đã xác minh bởi lớp vgap. Tách `lessonCheckVerdict(passed, done, markedHere)` thuần trong `lesson-check.ts`, `CheckVerdict` render theo nó; test 4 ca Matrix "Đạt" / "Chưa đạt" / "Bài đã xong" / vừa đánh dấu | patch |

## Design Notes

**Chữ của thẻ kiểm tra cuối Bài chính (`LessonCheck`):**

| Pha / trường hợp | Nội dung |
|---|---|
| idle | `h3` "Kiểm tra cuối bài"; mô tả "{n} câu ngẫu nhiên của bài này, không bắt buộc. Đạt từ 70% thì app mời đánh dấu bài xong; câu sai vào Sổ lỗi sai để ôn."; có lần làm thì thêm "Lần tốt nhất: đạt x%."; nút "Làm kiểm tra ({n} câu)" (`ClipboardCheck`). `n` = `quizButtonCount`; null (thiếu nền) thì nút "Làm kiểm tra" không số |
| running | dòng "Kiểm tra cuối bài · {tên bài}", `QuizRun`, nút ghost "Thôi, quay lại bài" |
| đạt, chưa xong | "Đạt {p}%! Bài này bạn nắm được rồi." · nút "Đánh dấu bài xong" · `text-xs` "Hoặc để sau: nút đánh dấu ở trang bài lúc nào cũng có." → sau khi bấm: "Đã đánh dấu xong bài. Sang phần ôn flashcard nhé." |
| đạt, đã xong | "Đạt {p}%. Bài đã đánh dấu xong." |
| chưa đạt, chưa xong | "Được {p}%, chưa tới 70%." · "Gợi ý: ôn lại đoạn {tên đoạn} ngay, hoặc để buổi 30' sau ôn lại bài này (bài chưa đánh dấu xong thì buổi sau vẫn là bài này). Không ôn cũng không sao." · nút `outline` "Ôn lại đoạn {tên đoạn}" · nút ghost "Vẫn đánh dấu xong" |
| chưa đạt, đã xong | "Được {p}%, chưa tới 70%." · "Gợi ý: ôn lại đoạn {tên đoạn} cho chắc. Không ôn cũng không sao." · nút `outline` "Ôn lại đoạn {tên đoạn}" |
| mọi kết quả | nút ghost "Xem lại nội dung bài" (về idle, thẻ đoạn hiện lại) |

`{tên đoạn}` = `SECTION_TITLES[weak.sectionId]` của `weakestSectionFrom(graded)`; null thì link về `lessonHref(lessonId)` với chữ "Ôn lại bài". Khối nhận xét nằm trong `next` của `QuizResult` (trên nút "Làm lại (đề mới)").

**Sổ lỗi trong bước Ôn (`SessionMistakes`):** khung `flex flex-col gap-2 rounded-lg border border-primary/40 bg-accent/40 p-3 text-sm`: "Sổ lỗi đến hạn: {n} câu. Làm lại trước khi ôn thẻ: đúng thì lịch giãn ra, sai thì gặp lại sớm." + nút ghost "Bỏ qua, sang ôn thẻ"; bên dưới `MistakeReviewSession`. Xong hết: dòng `text-sm text-muted-foreground` "Đã ôn {n} câu Sổ lỗi đến hạn."; bỏ qua: "Sổ lỗi để sau: các câu còn lại vẫn ở trang Sổ lỗi sai." (link `MISTAKES_HREF`).

**Dải mời ôn bài (`LessonReviewInvite`):** tiêu đề "Ôn lại bài: {tên bài}?"; mô tả "Gần đây có {n} câu sai về thì của bài này. Ôn lại đoạn {tên đoạn} rồi làm kiểm tra bài nhé."; nút "Ôn lại bài", "Để sau". Có cả lời mời viên gạch và lời mời bài thì hiện cả hai (viên trước).

**Ví dụ lời mời (golden):** `now` = 2026-12-20T10:00Z. Sổ lỗi: `q-a` (`thì`, `s1-t2-w2`, `grammar`, sai 2026-12-15), `q-b` (`thì`, `s1-t2-w2`, `grammar`, sai 2026-12-17), `q-c` (`phát âm`, `s1-t2-w2`, sai 2026-12-18). → `{ lessonId: 's1-t2-w2', questionIds: ['q-b', 'q-a'], sectionId: 'grammar' }`. Thêm lần làm `lesson-s1-t2-w2` 4/5 xong 2026-12-18 → null. "Để sau" lúc 2026-12-20 rồi `q-d` (`thì`, `s1-t2-w2`) sai 2026-12-21 → hiện lại với 3 câu.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: không lỗi, mọi test (cũ + mới) xanh, build qua kèm `check-precache`.
- `npm run layout:guard` -- expected: chỉ báo class thêm (xem AC), không có class bị xoá.
- `npm run layout:check` -- expected: mọi route ok ở 5 bề rộng; ảnh 375px chỉ lệch ở `/roadmap` và `/roadmap/lesson/s1-t1-w1` như AC.

**Manual checks (if no CLI):**
- Trình duyệt 375px với dữ liệu đã qua Sân ga: buổi `/session?lesson=s1-t2-w1&step=lesson` làm kiểm tra đạt và chưa đạt (đánh dấu xong, link ôn đoạn, "Vẫn đánh dấu xong"); `step=srs` với vài câu Sổ lỗi đến hạn (ôn, bỏ qua giữa chừng); Hôm nay có dải "Ôn lại bài" sau khi sai 2 câu thì của cùng bài ở quiz bài, "Để sau" ẩn dải; `/roadmap` có nhãn "đạt x%" / "chưa kiểm tra".
