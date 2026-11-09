---
title: 'Vá T1 và lọc câu hỏi chưa dạy (CAP-3, CAP-23, learning-rules "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'de1f085c46060122a2cc2d29c66df1810ce03fd7'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/26-row-cd-content-glossary-wall-pass.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Kiểm tra cả 4 hàng trước (Soát vé):** hàng qua Soát vé hay "Tôi biết rồi" thì mọi viên của hàng tính là đã dạy (`isBrickTaught`), nên câu hỏi cần các viên đó không bị lọc. Bỏ qua Sân ga thì mọi viên tính là đã dạy, nên không lọc câu nào. Cổng đã mở thì không đóng lại. Không khoá bài nào. Không chặn việc xong bài. Tiến độ, Sổ lỗi và lần làm cũ giữ nguyên.
- **Mũ Phân Loại chỉ chọn Nhà (CAP-3):** W1 không còn "Làm bài đầu vào". Đề ETS là "Đo trình độ" tuỳ chọn (story 22).
- **Mốc 750, nhịp 1 viên/buổi, máy tính:** story này không đụng. Không thêm `lg:`, không thêm phím tắt.
- Claude chọn:
  - **`requires`** là trường tuỳ chọn của `Question`. Nó là `uses` của câu hỏi trong `learning-rules.md`: liệt kê khái niệm cần để hiểu đề, chọn đúng đáp án và đọc hiểu giải thích. Lựa chọn sai không tính. Giá trị là `ConceptId` của viên gạch hoặc khái niệm bài T1 (`LessonConceptId`, xem Code Map).
  - **Khai báo:** cả 24 câu T1 và 40 câu Sân ga (`FOUNDATION_QUESTIONS`). Câu T2–T4 chưa khai báo nên không bao giờ bị lọc (để story sau).
  - **Lọc lúc chạy:** chỉ lọc bài test trong `QUIZZES`: quiz từng bài (`lesson-*`) và mini test (`mini-t1`, `mini-t2`). Một câu bị bỏ khi có khái niệm của viên gạch mà viên đó chưa dạy. Khái niệm bài T1 không kiểm lúc chạy, vì test tĩnh đã bảo đảm câu chỉ cần khái niệm của chính bài nó hoặc bài T1 trước đó. Không lọc: test quay lại, O.W.L., Soát vé / "Tôi biết rồi" / kiểm tra cuối hàng.
  - **`MIN_QUIZ_QUESTIONS = 4`:** sau khi lọc và thay câu nghe khi không có TTS:
    - không bỏ câu nào: chạy y như cũ;
    - có câu bị bỏ, còn ≥ 4 câu: chạy với số câu còn lại và hiện một dòng nhẹ;
    - có câu bị bỏ, còn < 4 câu: không chạy, không ghi lần làm. Hiện thông báo kèm nút học viên cần trước và nút về bài.
  - **W4 bỏ hẳn bảng đuôi -ed**, vì T2 tuần 3 đã dạy đủ. Câu luyện nói quá khứ viết lại thành hiện tại -s. Câu -ed và lựa chọn "didn't" trong `t1.ts` cũng viết lại. Đổi chữ trong `stage-1.ts`: W1 "12 nguyên âm đơn", W4 "Âm cuối, đọc -s". Không sửa `lo-trinh-toeic-12-thang.md` (SPEC thắng md về Sân ga). Thay vào đó, `roadmap.test.ts` có bảng ngoại lệ ghi rõ lý do.
  - **"Anki":** chỉ đổi nhiệm vụ từ vựng của bài (`vocabularyTask`) thành "Đạt N từ lũy kế bằng flashcard trong app". Câu cấp chặng trong `stage-1.ts` / `stage-2.ts` đối chiếu nguyên văn với md nên giữ.
  - **Id câu giữ nguyên khi viết lại**, vì Sổ lỗi tham chiếu theo id.

**Problem:** T1 vẫn còn dấu vết trước khi có Sân ga:
- W1 có "Làm bài đầu vào" và nút sang Mũ Phân Loại.
- W4 dạy đuôi -ed và câu quá khứ trước khi học quá khứ.
- Vài lời giải thích dùng kiến thức chưa dạy (do, /ʃ/, /oʊ/).
- Quiz bài và mini test rút cả câu cần viên gạch Huy chưa học, trái luật "chỉ dùng kiến thức đã dạy".

**Approach:**
- Vá dữ liệu T1.
- Thêm sổ khái niệm bài T1 và trường `requires` cho câu hỏi.
- Viết test tĩnh khai báo tay: `requires` chỉ được trỏ về khái niệm đã dạy trước đó.
- Thêm hàm thuần lập đề có lọc, dùng ở trang Quiz và nút "Kiểm tra bài".

## Boundaries & Constraints

**Always:**
- Hàm lọc và lập đề là hàm thuần. Hàm nhận `isBrickTaught` qua tham số: `src/lib/quiz` không import `@/lib/foundation`.
- Đề được chốt lúc bắt đầu lần làm (`useState` theo `run.seed`). Đồng bộ hay xong viên giữa chừng không đổi đề đang làm.
- Khi không có câu nào bị bỏ, `pickQuiz` cho đúng kết quả cũ với cùng seed. Có test so sánh.
- Câu thay cho câu nghe khi không có TTS chỉ lấy từ các câu đủ nền.
- Mọi chữ hiển thị bằng tiếng Việt, giọng nhẹ nhàng, không đỏ, không chữ "trượt"/"khoá". Ở 375px không cuộn ngang. Bố cục khác giữ nguyên.
- Không khai báo `requires` cho khái niệm mà không viên hay bài T1 nào dạy. Gặp câu như vậy thì viết lại câu.

**Never:**
- Không chia bài T1 theo ngày, không làm lời mời "Ôn viên gạch X" (story 28). Không đụng giao diện máy tính (story 29–31).
- Không lọc test quay lại, O.W.L., quiz hàng Sân ga. Không khai báo `requires` cho T2–T4.
- Không dò ngữ pháp bằng regex để suy ra `requires`. Khai báo tay.
- Không sửa `lo-trinh-toeic-12-thang.md`, `catalog.ts`, `CONCEPT_IDS`. Không xoá id câu, không đổi `lessonId` / `sectionId` / `tag` của câu.
- Không bump store, không đổi sync/backup.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Đã bỏ qua hoặc qua Sân ga | Mọi viên đã dạy, mở `lesson-s1-t1-w1` | Đề giống hệt trước story với cùng seed, không có dòng "đã bỏ" | N/A |
| Thiếu ít | Còn thiếu F18. Quiz W2 bỏ q-s1-t1-w2-04 (at) | Chạy 5 câu từ 5 câu còn lại, có dòng "Đã bỏ 1 câu cần viên chưa học: F18" | N/A |
| Thiếu nhiều | Mới xong F01–F12. Mở quiz W1 | Còn < 4 câu: thẻ thông báo liệt kê F13, F14…, nút "Học F13 · …" và nút "Về bài". Không ghi lần làm, không ghi Sổ lỗi | N/A |
| Hàng qua kiểm tra | Hàng C qua Soát vé, F13–F16 chưa học | Câu cần F13–F16 tính là đủ nền | N/A |
| Mini test | Thiếu một số viên, mở `mini-t1` | Chỉ lấy câu đủ nền, tối đa 10 câu, mỗi bài ≥ 2 câu nếu đủ | Bài thiếu câu thì lấy bù từ bài khác như cũ |
| Không TTS + lọc | Không có TTS, câu nghe bị bỏ hoặc phải thay | Câu thay luôn là câu đủ nền. Còn < 4 câu (và có câu bị bỏ) thì hiện thông báo | N/A |
| Quiz T2–T4 | Đang ở Sân ga, mở `lesson-s1-t2-w1` | Không lọc gì, chạy như cũ | N/A |
| Đổi trạng thái giữa chừng | Xong một viên ở tab khác khi đang làm quiz | Đề không đổi | N/A |
| Nhãn nút bài | Quiz W2 còn 4 câu đủ nền | "Kiểm tra bài (4 câu)". Còn < 4 câu thì nhãn "Kiểm tra bài", không có số | N/A |
| Sổ lỗi cũ | Có lỗi `q-s1-t1-w4-01` từ trước | `getQuestion` trả câu đã viết lại (đuôi -s /z/) | N/A |
| Test tĩnh | Câu W1 khai báo `present-simple` (dạy ở W2) | Hàm kiểm vi phạm trả lỗi, test tự kiểm bắt được | Test đỏ |

</frozen-after-approval>

## Code Map

- `src/data/questions/types.ts` -- `Question`. Thêm `requires?: readonly RequiredConcept[]`.
- `src/data/questions/t1.ts` -- 24 câu T1. Đây là nơi vá nội dung và khai báo `requires` (xem Design Notes).
- `src/data/questions/foundation.ts` -- 40 câu `quiz-f-a…d`. Chỉ thêm `requires`, không đổi chữ.
- `src/data/questions/index.ts` -- `QUESTION_BANK`, `QUIZZES`, `getQuiz`, `LESSON_QUIZ_SIZE`. Thêm `MIN_QUIZ_QUESTIONS = 4` và re-export sổ khái niệm.
- `src/data/foundation/types.ts`, `catalog.ts` -- `CONCEPT_IDS` (44), `BRICKS[].teaches`, `getBrickMeta`, `ROW_IDS`. Chỉ đọc. Ghi chú: F14 dạy "be from" (I'm from Vietnam, nằm trong `wh-questions`); F18 dạy at + giờ.
- `src/lib/quiz/quiz.ts` -- `pickQuiz(bank, quiz, seed, opts)` (lọc theo `quiz.lessonIds`, `minPerLesson`, thay câu nghe). Dùng lại nguyên, chỉ truyền vào bank đã lọc.
- `src/lib/foundation/foundation.ts` -- `isBrickTaught(store, brickId)`. `src/lib/foundation/player.ts` -- `brickHref`.
- `src/pages/Quiz.tsx` -- `DefinedQuizRun` hiện dùng `useMemo(pickQuiz…)`. Mẫu chốt đề bằng `useState` có sẵn ở `ComebackRun`. `QuizRun` có sẵn trạng thái rỗng.
- `src/pages/Lesson.tsx:116,159-166` -- nút "Kiểm tra bài ({quiz.size} câu)".
- `src/components/lesson/LessonContentParts.tsx:36-48` -- nút `placementLink`. `src/data/lessons/types.ts:190-191`, `src/data/lessons/index.ts:45` -- trường và dữ liệu `placementLink`.
- `src/data/lessons/t1-pronunciation.ts:389-427,484-497` -- `ENDINGS_ED`, `PRONUNCIATION_W4` (intro, nhóm -ed, `s1-t1-w4-say-3/4`).
- `src/data/lessons/t2-t4-pronunciation.ts:256` -- mục ôn tổng "Âm cuối, đuôi -s … và -ed …" của `s1-t1-w4`.
- `src/data/lessons/lessons.test.ts:60-61,110-124,259-262` -- test đang kỳ vọng `e-ed-*` ở W4 và `placementLink`.
- `src/data/roadmap/stage-1.ts:117,148`, `sections.ts:17-19` (`vocabularyTask`), `roadmap.test.ts:208-240` (ô Phát âm phải khớp md).
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`. `npm test` chạy với `TZ=Asia/Ho_Chi_Minh`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/questions/concepts.ts` (mới) -- sổ khái niệm bài T1:
  - `T1_LESSON_CONCEPTS` (`as const`):
    - `s1-t1-w1`: `monophthongs`;
    - `s1-t1-w2`: `present-simple`, `diphthongs`;
    - `s1-t1-w3`: `present-simple-negative`, `present-simple-questions`, `consonants`;
    - `s1-t1-w4`: `final-consonants`, `verb-s-endings`.
  - `LessonConceptId`, `RequiredConcept = ConceptId | LessonConceptId`.
  - `conceptSource(c)` → `{ brick: BrickId } | { lesson: string } | undefined`, dựng từ `BRICKS[].teaches` và bảng trên.
  - `requiresViolations(q): string[]`, hàm thuần dùng cho test:
    - câu T1: mỗi khái niệm là của viên bất kỳ, hoặc của bài T1 có thứ tự ≤ bài của câu;
    - câu `fNN`: mỗi khái niệm do viên có thứ tự ≤ viên cuối hàng của câu dạy, và có ít nhất 1 khái niệm của chính viên `fNN`;
    - thiếu `requires`, mảng rỗng, trùng, hay id lạ đều là vi phạm.
- [x] `src/data/questions/types.ts`, `index.ts` -- thêm trường `requires`, `MIN_QUIZ_QUESTIONS`, export sổ khái niệm.
- [x] `src/data/questions/t1.ts` -- vá nội dung và khai báo `requires` cho 24 câu theo Design Notes. Sửa chú thích đầu file (bỏ "-ed").
- [x] `src/data/questions/foundation.ts` -- `requires` cho 40 câu (chỉ khái niệm F01 → viên cuối hàng của câu).
- [x] `src/data/questions/requires.test.ts` (mới):
  - mọi câu T1 và câu Sân ga có `requires` hợp lệ (`requiresViolations` rỗng);
  - `LessonConceptId` không trùng `CONCEPT_IDS`, mỗi khái niệm do đúng 1 bài dạy, bài có trong lộ trình;
  - câu T2–T4 có `requires` thì cũng phải hợp lệ;
  - ca tự kiểm: câu W1 khai báo `present-simple` → có vi phạm; câu `q-f13-…` cần `prepositions-of-time` (F18) → có vi phạm; câu `fNN` không có khái niệm của chính viên → có vi phạm.
- [x] `src/lib/quiz/requires.ts` (+ export ở `index.ts`, test `requires.test.ts`) -- hàm thuần:
  - `missingBricks(q, isTaught)` → các `BrickId` chưa dạy, theo thứ tự F01→F18;
  - `planQuiz(bank, quiz, seed, opts, isTaught)` → `{ status: 'run', questions, skipped, missingBrickIds }` hoặc `{ status: 'not-ready', available, missingBrickIds }`;
  - `quizButtonCount(bank, quiz, isTaught)` → `number | null`.
  - Test phủ mọi dòng của Matrix: so khớp với `pickQuiz` cũ khi đủ nền; thiếu ít / thiếu nhiều; không TTS + lọc (câu thay luôn đủ nền); hàng qua kiểm tra; quiz T2–T4 không lọc; mini test (≤ 10 câu, mỗi câu đủ nền); 20 seed.
- [x] `src/pages/Quiz.tsx` -- `DefinedQuizRun` chốt `planQuiz(QUESTION_BANK, quiz, run.seed, { canSpeak }, (id) => isBrickTaught(store, id))` bằng `useState`.
  - `run`: dùng `QuizRun` như cũ. Nếu `skipped > 0` thì có dòng `text-sm text-muted-foreground` phía trên: "Đã bỏ N câu cần viên gạch chưa học: F13, F14."
  - `not-ready`: hiện `Card` với nội dung:
    - "Bài test này cần vài viên gạch bạn chưa học ở Sân ga 9¾: F13 · To be khẳng định, F14 · …";
    - "Học xong rồi quay lại nhé. Bài học vẫn đánh dấu xong được như thường.";
    - nút chính "Học F13 · …" → `brickHref`, nút outline "Về bài" → `lessonHref(quiz.homeLessonId)`.
- [x] `src/pages/Lesson.tsx` -- nhãn "Kiểm tra bài ({n} câu)", với `n = quizButtonCount(...)`. Nếu `null` (còn < 4 câu) thì nhãn "Kiểm tra bài". Lấy store bằng `useLoadedStore`.
- [x] `src/components/lesson/LessonContentParts.tsx`, `src/data/lessons/types.ts`, `index.ts`, `lessons.test.ts` -- bỏ `placementLink` (trường, dữ liệu, nút, import `GraduationCap` nếu thừa, chú thích). Test cũ đổi thành "không bài nào có nút bài đầu vào": kiểm không còn key `placementLink`.
- [x] `src/data/lessons/t1-pronunciation.ts`, `t2-t4-pronunciation.ts`, `lessons.test.ts`:
  - xoá `ENDINGS_ED` và nhóm "Đuôi -ed" của W4;
  - intro W4 viết lại, không còn "quá khứ" / "-ed", có câu "đuôi -ed học ở T2 tuần 3";
  - `s1-t1-w4-say-3` → "She works late and starts early." / "Cô ấy làm việc muộn và bắt đầu sớm.";
  - `s1-t1-w4-say-4` → "He needs help, so she helps him." / "Anh ấy cần giúp, nên cô ấy giúp anh ấy.";
  - mục ôn tổng của W4 → "Âm cuối, đuôi -s (/s z ɪz/).";
  - test: W4 có `e-s-*`, không có `e-ed-*`. Test dạng -s/-ed vẫn chạy cho `e-s-*` W4 và T2 tuần 3.
- [x] `src/data/roadmap/stage-1.ts`, `sections.ts`, `roadmap.test.ts`:
  - W1 Phát âm → "12 nguyên âm đơn"; W4 → "Âm cuối, đọc -s";
  - `vocabularyTask` → `Đạt ${words} từ lũy kế bằng flashcard trong app`;
  - test có `MD_OVERRIDES` chỉ cho 2 ô này, kèm chú thích lý do (CAP-3 bỏ bài đầu vào; luật chỉ dùng kiến thức đã dạy, -ed học ở T2-W3). Test cũng kiểm ô md vẫn là chữ gốc, để md đổi thì phải xem lại ngoại lệ.

**Acceptance Criteria:**
- Given Huy đang ở Sân ga, mới xong F01–F12, when mở `#/practice/quiz/lesson-s1-t1-w1`, then thấy thẻ thông báo F13/F14 có nút học F13, không có câu hỏi nào, và Sổ lỗi / lần làm không đổi.
- Given đã bỏ qua Sân ga, when làm mọi quiz T1, then số câu và cách chọn câu như trước story này.
- Given mở bài `s1-t1-w1`, when xem đoạn Phát âm, then không có nút "Làm bài đầu vào", và nhiệm vụ ghi "12 nguyên âm đơn".
- Given mở bài `s1-t1-w4`, when xem đoạn Phát âm, then chỉ có Phụ âm cuối và Đuôi -s / -es, câu luyện nói đều ở hiện tại.
- Given màn 375px, when mở trang Quiz ở 3 trạng thái (đủ nền / bỏ bớt / chưa đủ), then không cuộn ngang và bố cục khác không đổi.

## Implementation Notes

- **Sổ khái niệm** `src/data/questions/concepts.ts`: `T1_LESSON_IDS`, `T1_LESSON_CONCEPTS`, `LessonConceptId`, `RequiredConcept`, `conceptSource`, `requiresViolations` (re-export qua `@/data/questions`). Câu `fNN` không được dùng khái niệm bài T1 (không viên nào dạy chúng). Câu T2–T4 không khai báo → không lỗi; có khai báo thì mọi id phải có người dạy, không rỗng, không trùng.
- **`requires`**: 24 câu T1 đúng bảng Design Notes. 40 câu Sân ga khai báo tay (F01 → viên cuối hàng, luôn có khái niệm của chính viên). Không câu T1 nào phải viết lại vì thiếu người dạy.
- **Vá nội dung `t1.ts`** đúng Design Notes. Riêng `w2-07`, giải thích viết "âm s ở cuối likes" (không dùng ký hiệu /s/) để khỏi cần thêm `ipa` vào `requires`. `w3-06` giải thích thêm ý "she đi với doesn't, không phải don't".
- **Lập đề** `src/lib/quiz/requires.ts`: `missingBricks`, `planQuiz`, `quizButtonCount`. Chỉ lọc khi `quiz.id` nằm trong `QUIZZES` (kiểm tra hàng Sân ga, test quay lại, O.W.L. không đi qua đây hoặc không bị lọc). `skipped` = số câu của các bài trong test bị bỏ khỏi pool (không phải số câu bị rút ra khỏi đề), nên mini test có thể ghi "Đã bỏ 10 câu…" mà vẫn chạy đủ 10 câu. `quizButtonCount(bank, quiz, opts, isTaught)` (sau review) nhận `{ canSpeak }` như `planQuiz` và luôn khớp số câu `planQuiz` chạy (không TTS: min(size, số câu đủ nền không phải câu nghe)); có test so khớp mọi quiz × trạng thái × có/không TTS. Plan `not-ready` có thêm `startBrickId` = viên chưa dạy đầu tiên F01 → F18, nút "Học …" dẫn tới đây (không nhảy cóc tới viên đề cần).
- **Quiz.tsx**: `DefinedQuizRun` chốt `planQuiz` bằng `useState`. Dòng phụ (sau review): "Đề lần này có N câu, chỉ lấy câu bạn đã đủ nền. Đã bỏ K câu cần viên gạch chưa học: F16 · …, F18 · …" (nói rõ số câu thật, viên kèm tên như thẻ thông báo). Key của `DefinedQuizRun` đổi thành `${quiz.id}|${run.seed}`: trước đây `useMemo` tính lại khi chuyển sang test khác cùng route, nay đề chốt theo state nên key phải gồm id test (lần chạy tay đầu đã thấy mini-t1 giữ đề của quiz W2 khi chuyển hash).
- **Roadmap**: `MD_OVERRIDES` trong `roadmap.test.ts` cho ô Phát âm của `s1-t1-w1`, `s1-t1-w4`; test kiểm ô md vẫn là chữ gốc.
- **Verification**:
  - `npm run lint && npm test && npm run build` pass (66 file, 1501 test; sau vá review 1506 test).
  - `grep -rn "placementLink\|ENDINGS_ED\|trong Anki" src` còn 2 dòng, đều cố ý: `lessons.test.ts` (test kiểm không còn key `placementLink`) và `stage-1.ts:99` "Thêm 30 từ ngẫu nhiên trong Anki" (phạm vi O.W.L. 1 cấp chặng, đối chiếu nguyên văn với md; Intent bảo giữ câu cấp chặng).
  - Chạy tay headless Chrome 375px (bản build không Supabase, store dựng sẵn 3 trạng thái: xong F01–F12; thiếu F18; đã bỏ qua Sân ga). `scrollWidth` = 375 ở cả 18 trang. Xong F01–F12: quiz W1 hiện thẻ "cần F13 · to be khẳng định, F14 · …", nút "Học F13 · to be khẳng định" và "Về bài", không ghi `quizzes`; quiz W2 chạy 4 câu, dòng "Đã bỏ 2 câu…: F16, F18." (sau vá review: W2 khai báo thêm F15 / F13 nên trạng thái này W2 hiện thẻ thông báo, có test; chưa chạy tay lại); mini-t1 chạy 10 câu; nút bài W1 "Kiểm tra bài", W2 "Kiểm tra bài (4 câu)". Thiếu F18: quiz W2 5 câu, "Đã bỏ 1 câu…: F18.". Bỏ qua Sân ga: không có dòng "Đã bỏ", nút "(5 câu)". W1 không còn nút bài đầu vào, nhiệm vụ "12 nguyên âm đơn"; W4 không còn nhóm -ed, câu luyện nói ở hiện tại. Headless Chrome có TTS nên chưa thấy tay ca không TTS (đã phủ bằng test).
  - Trang bài W1/W2 có `text-destructive` ở câu sai mẫu của thẻ ngữ pháp (có từ trước, story này không đụng).
- **Chưa làm / rủi ro**: test "đề không đổi khi xong viên giữa chừng" chỉ bảo đảm bằng `useState` (không có test React, Vitest env node).

## Spec Change Log

- **2026-11-09, review lần 1 (vá, không loopback):**
  - *Finding:* nhiều câu T1 khai báo `requires` thiếu (w1-06, w2-01, w2-02, w3-06, w4-01, w4-04, w4-05), trái định nghĩa `requires` trong Intent (khái niệm cần để hiểu đề, chọn đáp án và đọc giải thích). *Sửa:* bảng `requires` ở Design Notes; `w2-02` viết lại đề bỏ "every evening" (giữ id) thay vì khai báo F18, để dòng Matrix đóng băng "thiếu F18 → W2 chỉ bỏ w2-04, chạy 5 câu" vẫn đúng. *Tránh:* câu W2/W4 lọt vào đề của người chưa học F09/F13/F15, và đổi Matrix đóng băng.
  - *Finding:* Verification kỳ vọng grep "không còn kết quả" mâu thuẫn với Intent (giữ câu cấp chặng "trong Anki") và Implementation Notes. *Sửa:* Verification ghi rõ 2 dòng cố ý còn lại. *Tránh:* reviewer sau báo lỗi giả.
  - *Finding:* nhãn nút bài không tính TTS; nút "Học …" nhảy cóc; dòng "Đã bỏ N câu" dễ hiểu nhầm. *Sửa:* Implementation Notes ghi hành vi mới (`quizButtonCount` nhận `opts`, `startBrickId`, dòng phụ nói số câu thật). Dòng Matrix "có dòng 'Đã bỏ 1 câu cần viên chưa học: F18'" vẫn đúng ý: dòng vẫn ghi số câu bỏ và viên thiếu, chỉ thêm số câu của đề và tên viên.
  - *KEEP:* `planQuiz` = `pickQuiz` trên bank đã lọc (đủ nền thì giống hệt); đề chốt bằng `useState`, key `${quiz.id}|${run.seed}`; `src/lib/quiz` không import `@/lib/foundation`; id câu giữ nguyên.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|------------|-------|
| 1 | blind | `w2-01` "She ___ in an office." thiếu F15 (in) | medium | `function-words.ts` `ngsl-in` → F15 (`prepositions-of-place`); `requires` cũ không có nên câu lọt vào đề người chưa học F15 | patch: thêm `prepositions-of-place` |
| 2 | blind | `w2-02` "every evening" thiếu F18 | medium | `ngsl-every` → F18; `requires` cũ chỉ `present-simple`, `possessive-adjectives`. Khai báo F18 sẽ trái dòng Matrix "thiếu F18 chỉ bỏ w2-04" | patch: viết lại đề "My brother ___ English." (giữ id) |
| 3 | blind | `w4-04`, `w1-06` thiếu `subject-pronouns` (He, it) | medium | "He ___ coffee", "Is it hot today?" cần đại từ F09; `missingBricks` không thấy F09 | patch: thêm `subject-pronouns` |
| 4 | blind | `w1-04` "be from" → `wh-questions` chỉ ghi ở Code Map, dễ gãy | low | Quy ước chỉ có trong spec; người sửa `t1.ts` không thấy | patch: chú thích ngay trên `requires` (cả `w4-05`) |
| 5 | blind | Nút "Học {first}" dẫn tới viên thiếu đầu tiên, nhảy cóc viên chưa học trước đó | medium | Xong F01–F05, quiz W1 thiếu F09/F11/F13/F14 → nút F09, bỏ qua F06–F08 trái thứ tự Sân ga | patch: plan `not-ready` có `startBrickId` (viên chưa dạy đầu tiên), có test |
| 6 | blind | "Đã bỏ N câu" đếm câu bỏ khỏi ngân hàng, không phải khỏi đề | low | `skipped` đếm pool; mini-t1 ghi "Đã bỏ 10 câu" mà vẫn chạy 10 câu (Implementation Notes tự ghi) | patch: dòng phụ ghi "Đề lần này có N câu, chỉ lấy câu bạn đã đủ nền. Đã bỏ K câu…" |
| 7 | blind | `quizButtonCount` bỏ qua TTS, nhãn hứa số câu không đúng | medium | Không TTS, thiếu F16+F18: W2 còn 4 câu đủ nền có 1 câu nghe → nhãn "(4 câu)" nhưng `planQuiz` ra `not-ready` | patch: `quizButtonCount` nhận `opts`; test so khớp với `planQuiz` |
| 8 | blind | Dòng bỏ câu chỉ ghi id trần (F16, F18) | low | `Quiz.tsx` dòng phụ `missingBrickIds.join`, thẻ thông báo dùng `brickLabel` | patch: dùng `brickLabel` |
| 9 | blind | Không có kiểm tĩnh "T1 không quá khứ / -ed" | low | Lựa chọn `lived` ở `w3-01` đã lọt (xem #27) | patch: test trong `src/data/questions/requires.test.ts` |
| 10 | blind | Verification kỳ vọng grep rỗng, Implementation Notes ghi còn 2 dòng | low | Spec tự mâu thuẫn; Intent giữ câu cấp chặng "trong Anki" | patch: sửa kỳ vọng ở Verification, ghi Spec Change Log |
| 11 | blind | Trang bài vừa nói "flashcard trong app" vừa nói Anki | low | Có thật, nhưng Intent quyết định giữ nguyên văn câu cấp chặng `stage-1.ts` / `stage-2.ts` để khớp md | reject: Intent đã chốt |
| 12 | blind | Lần làm đã lọc lưu như lần làm đủ | low | Spec chấp nhận ảnh hưởng Hermione; bảng kỹ năng tính theo tỉ lệ đúng nên ít câu chỉ giảm mẫu. Đánh dấu cần thêm trường vào `QuizAttempt` (Never: không bump store) | reject |
| 13 | blind | Hai dòng Matrix (đổi trạng thái giữa chừng, not-ready không ghi) và key mới không có test tự động | medium | Chỉ dựa `useState` / return sớm trong `Quiz.tsx`; repo không có test component | defer (gộp #19) |
| 14 | blind | `requiresViolations` dùng `!` và ép kiểu, có thể crash | false | `brickIdFromLessonId` chỉ trả id có trong `BRICK_IDS`; `foundation-catalog.test.ts:16` bảo đảm `BRICKS` có đủ 18 id nên `find(...)!` và `.at(-1)!` không bao giờ undefined | reject |
| 15 | edge | Store có thêm viên khi đang hiện thẻ not-ready, thẻ không tự làm mới | low | Đề chốt lúc bắt đầu theo Intent; người học bấm "Học …" rời trang, quay lại là lập đề mới | reject |
| 16 | edge | Không TTS, pool 4 có 1 câu nghe: nút 4 câu nhưng trang hiện thẻ thông báo | medium | Như #7 | patch (gộp #7) |
| 17 | edge | Header `quiz.description` luôn ghi 5 / 10 câu | low | Mô tả chung có từ trước; sau vá #6 dòng phụ ngay dưới ghi số câu thật của đề. Sửa header phải nhấc plan lên component cha | reject |
| 18 | edge | Key `MD_OVERRIDES` cũ không bị phát hiện | low | Chỉ xảy ra khi đổi id bài (nhiều test khác cũng đỏ); sửa là thêm guard | reject |
| 19 | vgap | Nối trang Quiz (predicate store, đề chốt, key mới) không có test | medium | Lớp vgap đã kiểm: Vitest env node, không có `.test.tsx`; hàm thuần đã có test | defer (gộp #13) |
| 20 | vgap | Header trang Quiz còn số câu cũ | low | Như #17 | reject |
| 21 | vgap | Spec mâu thuẫn về grep | low | Như #10 | patch (gộp #10) |
| 22 | content | `w2-02` thiếu `frequency-adverbs`, `be-affirmative` (giải thích nói "is study") | medium | Như #2; giải thích dùng is (F13) | patch (gộp #2): bỏ "every", thêm `be-affirmative` |
| 23 | content | `w2-01` thiếu F15 (in) | medium | Như #1 | patch (gộp #1) |
| 24 | content | `w4-05` thiếu from (F14), I (F09), to be (giải thích "I am work") | medium | `ngsl-from` → F14; giải thích nói về to be; `requires` cũ chỉ `present-simple`, `days-months` | patch: thêm `subject-pronouns`, `be-affirmative`, `wh-questions` |
| 25 | content | `w4-04` không có khái niệm viên nào | medium | Như #3 | patch (gộp #3) |
| 26 | content | `q-f11-01` (hàng B) có "every day" (F18) | medium | Đúng là `ngsl-every` → F18, trái chú thích hàng B; câu có từ trước story 27 và Code Map chỉ cho thêm `requires` | defer |
| 27 | content | `w3-01` lựa chọn `lived` (-ed) | low | Intent: câu -ed trong `t1.ts` viết lại | patch: → `is live` |
| 28 | content | `w4-01` khai `final-sounds` thay vì `plural-s-sounds` (F10) | low | Quy tắc /s z ɪz/ là F10, `w4-02` có khai | patch: thêm `plural-s-sounds` |
| 29 | content | `w3-06` giải thích dùng /ʃ/ /h/ mà không có `ipa` | low | `requires` không có `ipa` (F03) | patch: thêm `ipa` |
| 30 | content | `w1-06` "Câu hỏi với to be bắt đầu bằng Is" như luật chung | low | Câu hỏi to be cũng bắt đầu bằng Are / Am (w1-02) | patch: "Câu hỏi này bắt đầu bằng Is" |
| 31 | content | `w3-03` "What do you do?" không giải thích do thứ hai | low | Giải thích chỉ có công thức | patch: thêm "do thứ hai là động từ chính, nghĩa là 'làm'" |
| 32 | content | `requires` câu Sân ga thiếu (q-f15-01, q-f16-02, q-f17-02, q-f18-01, q-f18-05) | low | Đúng như mô tả; mọi khái niệm thêm đều ≤ viên cuối hàng | patch: thêm khái niệm |
| 33 | content | Dòng phụ "Đã bỏ…" mơ hồ (số câu, id trần) | low | Như #6, #8 | patch (gộp #6, #8) |
| 34 | content | "Anh ấy cần giúp" không tự nhiên | low | `t1-pronunciation.ts` `s1-t1-w4-say-4` | patch: "cần giúp đỡ" |
| 35 | content | Chú thích "Tuần 4: âm cuối, -s, -ed"; "ngôi thứ ba" thiếu "số ít" | low | Story bỏ -ed nên chú thích lỗi thời; thuật ngữ glossary là "ngôi thứ ba số ít" | patch |

## Design Notes

**Vá nội dung `t1.ts` (giữ id):**
- `w1-02` giải thích: "Câu hỏi với to be: đưa am / is / are lên trước chủ ngữ. you đi với are → Are you ready?" Bỏ ý "do".
- `w1-03` giải thích: "Phủ định của to be: thêm not ngay sau am / is / are. I đi với am → I am not (I'm not). is not dùng cho he / she / it." Không nhắc don't.
- `w1-06` giải thích: "Câu hỏi này bắt đầu bằng Is (Is it…?), không phải It is. "hot" /hɑːt/ có /ɑː/ (a dài, mở rộng miệng); "cold" là từ khác (lạnh). Cuối câu là "today", không phải "to stay"." Bỏ /oʊ/.
- `w2-07` giải thích: bỏ /ʃ/. Viết: nghe "he" (không phải "she") ở đầu câu, âm /s/ cuối "likes" (he thêm -s), "new" khác "old".
- `w2-02` (review): đề → "My brother ___ English." (bỏ "every evening": every là cổng F18, giữ đúng dòng Matrix "thiếu F18 chỉ bỏ w2-04").
- `w3-01` (review): lựa chọn "lived" (đuôi -ed) → "is live".
- `w3-03` (review): giải thích thêm "do thứ hai là động từ chính, nghĩa là 'làm'".
- `w3-06`: lựa chọn "She didn’t watch TV." → "They don’t watch TV.". Giải thích thêm ý doesn't (không phải don't).
- `w4-01` → "Chọn từ có đuôi -s đọc là /z/.", lựa chọn `plays, works, helps, likes`, đáp án `plays`. Giải thích: sau âm hữu thanh (nguyên âm, /b d ɡ v m n l r/…) đọc /z/; works / helps / likes tận cùng /k p/ vô thanh nên đọc /s/.

**`requires` câu T1** (Claude chốt, người làm rà lại khi viết):
- **W1:**
  - 01: be-affirmative, subject-pronouns, possessive-adjectives;
  - 02: be-questions, subject-pronouns, articles;
  - 03: be-negative, subject-pronouns;
  - 04: be-affirmative, subject-pronouns, wh-questions;
  - 05: ipa, long-vowel-mark, long-short-i, monophthongs;
  - 06: be-questions, subject-pronouns, ipa, long-vowel-mark, monophthongs.
- **W2:**
  - 01: present-simple, subject-pronouns, articles, prepositions-of-place;
  - 02: present-simple, possessive-adjectives, be-affirmative;
  - 03: have-has, subject-pronouns, articles, adjective-before-noun;
  - 04: prepositions-of-time, clock-time, present-simple, articles;
  - 05: ipa, diphthongs;
  - 07: present-simple, possessive-adjectives, adjective-before-noun.
- **W3:**
  - 01: present-simple-negative, subject-pronouns;
  - 02: present-simple-questions, possessive-adjectives, prepositions-of-time, days-months;
  - 03: present-simple-questions, wh-questions, be-affirmative, articles;
  - 04: ipa, consonants;
  - 07: ipa, syllables, stress;
  - 06: present-simple-negative, subject-pronouns, ipa, consonants.
- **W4:**
  - 01: ipa, final-sounds, plural-s-sounds, present-simple, verb-s-endings;
  - 02: ipa, plural-s-sounds, verb-s-endings;
  - 07: ipa, syllables, stress, schwa;
  - 04: present-simple-negative, subject-pronouns;
  - 05: present-simple, subject-pronouns, be-affirmative, wh-questions ("from" mở ở F14, như w1-04), days-months;
  - 08: present-simple, possessive-adjectives, plurals, plural-s-sounds, verb-s-endings, prepositions-of-time, days-months.

**Ví dụ lập đề:**

```ts
const plan = planQuiz(QUESTION_BANK, quiz, seed, { canSpeak }, isTaught)
// đủ nền: plan.questions deep-equal pickQuiz(QUESTION_BANK, quiz, seed, opts), skipped 0
// planQuiz = pickQuiz(bank đã bỏ câu thiếu viên, …); skipped > 0 && questions.length < 4 → not-ready
```

Lần làm có ít câu hơn vẫn được tính Hermione nếu đúng hết. Chấp nhận vì không bao giờ dưới 4 câu.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass. Test cũ chỉ đổi ở các chỗ ghi trong Tasks (`placementLink`, `e-ed-*` W4, ngoại lệ md).
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/data/questions src/lib/quiz src/data/lessons src/data/roadmap` -- expected: các ca mới đều pass.
- `grep -rn "placementLink\|ENDINGS_ED\|trong Anki" src` -- expected: chỉ còn 2 dòng cố ý: `lessons.test.ts` (test kiểm không còn key `placementLink`) và `stage-1.ts` "Thêm 30 từ ngẫu nhiên trong Anki" (câu cấp chặng giữ nguyên văn md theo Intent).

**Manual checks:**
- Headless 375px, store dựng sẵn ở 3 trạng thái: mới xong F01–F12; thiếu F18; đã bỏ qua Sân ga.
  - Mở `#/practice/quiz/lesson-s1-t1-w1`, `#/practice/quiz/lesson-s1-t1-w2`, `#/practice/quiz/mini-t1`, `#/roadmap/lesson/s1-t1-w1`, `#/roadmap/lesson/s1-t1-w4`.
  - Kỳ vọng: `scrollWidth` = 375; đúng thẻ thông báo, dòng "Đã bỏ…" và nhãn nút như Matrix.
