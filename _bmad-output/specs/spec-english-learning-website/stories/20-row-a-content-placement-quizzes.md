---
title: 'Nội dung hàng A (F02–F06), Soát vé 4 hàng và quiz-f-a…d (CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '3f1299ce3f9ae7fa9d02c826393be6b2670bd237'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/hp-theme.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/19-brick-player-foundation-wall.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Kiểm tra cả 4 hàng trước (Soát vé):** làm ở story này. Lần đầu vào Sân ga (`needsPlacement`), trang `/foundation` mời làm 4 bài kiểm tra theo thứ tự A → D. Mỗi bài 8 câu, chạy bằng Quiz engine. Hàng đạt ≥ 70% (6/8, dùng `isRowPass`) tính là xong. Dừng giữa chừng được. Có nút "Bỏ qua, học từ viên 1". Câu sai không ghi Sổ lỗi. Không khoá viên nào. Tiến độ bài và thẻ SRS cũ giữ nguyên.
- **Mốc 750:** story này không đụng lịch. Khi Soát vé đạt cả 4 hàng, `markRowTested` tự ghi `completedAt` (logic của story 18). Lịch đọc mốc này ở story 22. Không hiện "lùi N tuần".
- **Nhịp 1 viên/buổi + "Học tiếp viên sau":** thuộc story 21. Story này chỉ thêm nội dung cho 5 viên.
- **Máy tính:** không làm. Trang mới dùng khung cột hiện có, không thêm `lg:`, không phím tắt.
- Claude chọn:
  - **Ngân hàng câu Sân ga** nằm ở `src/data/questions/foundation.ts`: `FOUNDATION_QUESTIONS` và `FOUNDATION_QUIZZES` (4 `QuizDef` từ `quiz-f-a` tới `quiz-f-d`).
    - Ngân hàng này **không** nằm trong `QUESTION_BANK`/`QUIZZES`. Nhờ vậy app không sinh `lesson-fNN`, câu Sân ga không vào mini test, O.W.L. hay test quay lại, và không chạy được ở `/practice/quiz/…`.
    - `getQuestion` vẫn tra được câu Sân ga, để Sổ lỗi hiện được câu.
    - `lessonId` có dạng `fNN` viết thường. Id câu có dạng `q-fNN-NN`.
  - **Số câu mỗi hàng:** ngân hàng có 10 câu cho mỗi hàng, tối đa 2 câu nghe. `pickQuiz` lấy 8 câu, nên máy không có TTS vẫn đủ 8. `minPerLesson`: A, B = 1; C = 2; D = 4.
  - **Ba chế độ kiểm tra hàng:**
    - `placement` (Soát vé);
    - `know` ("Tôi biết rồi", khi hàng còn viên chưa xong);
    - `final` (kiểm tra cuối hàng, khi mọi viên của hàng đã xong).
    - Chế độ nào cũng ghi `rows[r]` qua `markRowTested`.
    - Chỉ `final` ghi thêm lần làm vào `quizzes.attempts` (như test thường, nên tính cho Hermione) và đưa câu sai vào Sổ lỗi.
  - **Route và nút:** route `/foundation/soat-ve` và `/foundation/kiem-tra/:row`. Nút "Tôi biết rồi" / "Kiểm tra cuối hàng" nằm ở tiêu đề hàng trên bức tường.
  - **Hiển thị câu hỏi:** dùng `QuestionCard` với prop tuỳ chọn mới `tone="gentle"` (không dùng màu `destructive`). Màn kết quả viết riêng, không dùng `QuizResult`.
  - **TTS chữ cái:** iOS hay đọc sai chữ cái đứng một mình, nên thêm `src/data/foundation/letters.ts` gồm:
    - `LETTER_SPEECH` (A "ay", …, H "aitch", …, W "double you", …, Z "zee");
    - `spellForSpeech('HUY')` → `"aitch, you, why"`.
    - Kiểu `Screen` thêm `audioText?` cho `contrast.examples[]` và `worked`, thêm `sampleAudioText?` cho `apply`. Nhờ vậy màn hình hiện "H-U-Y" còn máy đọc theo tên chữ.
  - **Từ chủ đề** (đều có trong `words.json`; NGSL không có từ chỉ số):

    | Viên | Từ chủ đề |
    |---|---|
    | F02 | name, letter, email, address, spell |
    | F03 | sound, word, sea, key, car |
    | F04 | teacher, student, computer, important, family |
    | F05 | sheep, bag, rise, right, fine |
    | F06 | price, money, hour, week, month |

**Problem:**
- Sân ga mới có F01, chưa có Soát vé hay kiểm tra hàng. Người mới phải tự đoán chỗ bắt đầu. Người đã biết một hàng thì không có cách đánh dấu hàng đó là xong.
- Link "Xem lại" và Sổ lỗi chưa hiểu `lessonId` dạng `fNN`.

**Approach:**
- Soạn nội dung F02–F06 và 40 câu cho `quiz-f-a…d`.
- Thêm module thuần `row-test` (chế độ kiểm tra, hàng Soát vé tiếp theo, ghi kết quả).
- Thêm 2 trang (Soát vé, kiểm tra hàng) và nút trên bức tường.
- Thêm `questionSourceHref` và `sourceLabel` cho id `fNN`.

## Boundaries & Constraints

**Always:**
- **Nội dung F02–F06:** theo khuôn F01. Mỗi viên có:
  - đủ 6 màn, giải thích 40–80 chữ;
  - check 2–5 câu cộng đúng 2 câu `easier`;
  - 1–2 `ruleCards` và 5 từ chủ đề như bảng ở trên.
- **Màn Áp dụng của mỗi viên:** làm ra một thứ cụ thể.
  - F02: đánh vần H-U-Y và tên mình.
  - F03: đọc một mục từ /siː/.
  - F04: chạm âm tiết nhấn.
  - F05: nghe và nói cặp âm cuối.
  - F06: nói một giá tiền và giờ học.
- **Loại câu bắt buộc:** mỗi viên có ít nhất 1 câu `listen`. F04 có ít nhất 1 câu `tapSyllable`.
- **Soạn nội dung:**
  - Tự soạn, viết bằng tiếng Việt.
  - `uses` chỉ gồm khái niệm do viên này hoặc viên trước dạy.
  - Câu tiếng Anh chỉ là từ, cụm từ, số, giờ, hoặc mẫu S-V-O như F01. Không dựa vào ngữ pháp hàng B–D.
- **F02:** không chuỗi TTS nào chứa chữ cái đứng một mình (trừ "I"). Mọi chỗ đọc chữ cái dùng `spellForSpeech`.
- **Câu quiz Sân ga:**
  - Có 4 lựa chọn khác nhau, đáp án trùng đúng một lựa chọn.
  - `tag` thuộc `MISTAKE_TAGS`; `sectionId` là `SectionId` hợp lệ.
  - Câu `listening`: `audioText` = đáp án, tag `nghe`, không phải chữ cái đơn.
  - Câu hàng B–D được phép hỏi kiến thức chưa dạy (ngoại lệ Soát vé/"Tôi biết rồi" của SPEC).
- **Soát vé:**
  - Chỉ chạy khi `needsPlacement`.
  - Hàng tiếp theo là hàng đầu tiên theo thứ tự A → D chưa xong và chưa có `rows[r]` hợp lệ.
  - Chỉ ghi khi bấm "Xem kết quả" ở câu cuối của hàng. Rời trang giữa hàng thì không ghi gì.
  - Hết hàng: gọi `finishPlacement('done')`.
  - "Bỏ qua, học từ viên 1": gọi `finishPlacement('skipped')`, rồi tới viên tiếp theo (không có viên tiếp theo thì về bức tường).
- **Không tính là buổi học:** mọi chế độ đều không ghi buổi học, streak, điểm Nhà hay "đã học hôm nay".
- **Giọng nhẹ:**
  - Không dùng màu `destructive`.
  - Chưa đạt thì báo "Chưa đạt 70%, mình học hàng này từ viên X", không dùng chữ "trượt".
  - Bức tường vẫn bấm được khi Soát vé còn `pending`.
- **Logic và giao diện:** logic là hàm thuần có test. Giao diện 375px của các trang cũ không đổi. `QuestionCard` mặc định giữ nguyên.

**Never:**
- **Việc của story khác:**
  - sessionPlan, Hôm nay, Thư nhập học, lịch (story 21, 22);
  - màn "Qua bức tường", huy chương, +5 điểm Nhà (story 26);
  - nối `ruleCards`, từ chủ đề hay cổng IPA vào SRS (story 23, 24);
  - nội dung F07–F18 (story 25, 26);
  - `requires` và lọc câu chưa dạy (story 27);
  - lời mời ôn viên (story 28);
  - `lg:`, phím tắt.
- **Không được làm:**
  - Không đổi shape store, migration hay luật gộp.
  - Không đổi `pickQuiz`, `gradeAttempt`, `recordAttempt`, `markRowTested`.
  - Không thêm câu Sân ga vào `QUESTION_BANK`/`QUIZZES`.
  - Không ghi `quizzes.attempts` ở chế độ `placement`/`know`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mời Soát vé | Store mới, mở `/foundation` | Trên bức tường có thẻ "Soát vé · 4 bài ngắn, 8 câu mỗi hàng" với nút "Bắt đầu Soát vé" và "Bỏ qua, học từ viên 1". F01–F06 mở được, F07–F18 "Đang soạn" | N/A |
| Đạt hàng A | Soát vé hàng A đúng 6/8 | `rows.A = {passed: true, best: 75}`; hàng A "Xong", "6/18"; nút "Sang hàng B" và "Dừng ở đây". `mistakes`, `quizzes`, buổi học không đổi | N/A |
| Chưa đạt | Hàng A đúng 5/8 | `rows.A = {passed: false, best: 63}`; báo "Chưa đạt 70%, mình học hàng A từ F01"; hàng A chưa xong | N/A |
| Dừng giữa hàng | Trả lời 4 câu hàng B rồi rời trang | Không ghi gì. Thẻ mời đổi thành "Tiếp tục Soát vé · hàng B", hàng B làm lại từ câu 1 | N/A |
| Hết 4 hàng | Bấm kết quả hàng D | `placement: 'done'`; tổng kết hàng đạt / chưa đạt; nút "Học tiếp: <viên tiếp theo>" hoặc "Các viên tiếp theo đang soạn"; thẻ mời ẩn | N/A |
| Đạt cả 4 | Cả 4 hàng ≥ 6/8 | Có `completedAt`, `placement: 'done'`; báo "Cả 4 hàng đạt: Sân ga xong", có link Lộ trình. Không có màn ăn mừng | N/A |
| Bỏ qua Soát vé | Bấm "Bỏ qua, học từ viên 1" (hàng A đã làm) | `placement: 'skipped'`, `rows.A` giữ nguyên; tới `/foundation/<viên tiếp theo>`; thẻ mời không hiện lại | N/A |
| Hàng đã xong bằng viên | F01–F06 đã xong trước Soát vé | Soát vé bắt đầu từ hàng B | N/A |
| Không TTS | `canSpeak()` false | Mỗi hàng vẫn đủ 8 câu, không có câu nghe | N/A |
| "Tôi biết rồi" | Hàng B chưa xong, đúng 6/8 | `rows.B.passed` true; `mistakes` và `quizzes.attempts` không đổi | Chưa đạt: chỉ cập nhật `best` |
| Kiểm tra cuối hàng | F01–F06 đều xong, đúng 5/8 | `rows.A` cập nhật `best` (`passed` không hạ); lần làm `quiz-f-a` vào `quizzes.attempts`; 3 câu sai vào Sổ lỗi với `lessonId` dạng `fNN` | N/A |
| Nguồn câu | `questionSourceHref('f03', 'pronunciation')`; `('s1-t1-w1', 'grammar')`; `('f99', 'x')` | `/foundation/F03` và nhãn "Viên gạch F03 · IPA là gì"; `sectionHref` như cũ; `/foundation` | Không ném lỗi |
| URL lạ | `/foundation/kiem-tra/x`; `/foundation/kiem-tra/a`; `/foundation/soat-ve` khi Soát vé không còn `pending` hoặc đã bỏ qua Sân ga | `x` → `/foundation`; `a` → `replace` sang `/foundation/kiem-tra/A`; `soat-ve` → `/foundation` | Không crash |
| Đọc chữ cái | Bấm nghe ví dụ "H-U-Y" ở F02 | Máy đọc "aitch, you, why"; chữ trên màn hình vẫn là "H-U-Y" | Không TTS: ẩn nút nghe |

</frozen-after-approval>

## Code Map

**Dữ liệu viên gạch**
- `src/data/foundation/types.ts` -- thêm `audioText?` (`contrast.examples[]`, `worked`) và `sampleAudioText?` (`apply`).
- `src/data/foundation/catalog.ts` (+ `index.ts`) -- thêm `brickLessonId('F02')` → `'f02'` và `brickIdFromLessonId('f02')` → `'F02' | null` (id lạ → null).
- `src/data/foundation/bricks/f01.ts` -- khuôn nội dung để soạn F02–F06.
- `src/data/foundation/content.ts` -- sổ đăng ký `BRICK_CONTENT`, thêm F02–F06.
- `src/data/foundation/foundation.test.ts` -- test dữ liệu hiện có tự chạy cho viên mới. Dòng `hasBrickContent('F02')` false đổi sang F07.
- `src/data/vocab` -- `loadWords` để test từ chủ đề.

**Câu hỏi và quiz**
- `src/data/questions/types.ts`, `index.ts` -- dùng `Question`, `QuizDef`, `MISTAKE_TAGS`. `getQuestion` tra thêm `FOUNDATION_QUESTIONS`. `QUESTION_BANK`, `QUIZZES`, `getQuiz` giữ nguyên.
- `src/lib/quiz/quiz.ts` -- dùng lại `pickQuiz`, `shuffleOptions`, `gradeAttempt`, `recordAttempt`, `attemptId`; không sửa. `lib/quiz` không được import `lib/foundation` (tránh vòng import).

**Logic Sân ga**
- `src/lib/foundation/foundation.ts` -- dùng lại `markRowTested`, `finishPlacement`, `needsPlacement`, `isRowDone`, `readFoundation`, `isRowResult`, `isRowPass`; không sửa.
- `src/lib/foundation/player.ts` -- `nextBrickId`, `wallRows` (thêm `test: 'know' | 'final' | null` vào `WallRow`), `brickHref`.
- `src/lib/foundation/index.ts` -- **không** re-export `row-test`, vì sync import `@/lib/foundation`.
- `src/app/store-context.ts` -- mở rộng `useFoundation` theo mẫu `useQuizzes`.

**Giao diện**
- `src/components/foundation/BrickScreen.tsx` -- `EnLine` nhận `speech?`.
- `src/components/foundation/BrickWall.tsx` -- thêm nút ở tiêu đề hàng.
- `src/pages/Foundation.tsx` -- thêm thẻ mời Soát vé.
- `src/components/quiz/QuestionCard.tsx` -- `SourceSectionLink` dùng `questionSourceHref`. Thêm `tone="gentle"`.
- `src/components/quiz/source-label.ts` -- thêm `questionSourceHref`; `sourceLabel` hiểu `fNN`. `MistakeCard`, `QuizResult` tự hưởng thay đổi qua `SourceSectionLink`.
- `src/pages/Quiz.tsx` -- mẫu `QuizRun` (`randomPart`, seed, progressbar, "Rời trang giữa chừng…"); không sửa.

**Route và test**
- `src/app/routes.tsx`, `src/app/nav-items.test.ts` -- route mới. Tab Lộ trình đã sáng cho `/foundation/*`.
- Vitest env `node`, chỉ chạy `src/**/*.test.ts`, không có test component.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/letters.ts` (+ `letters.test.ts`) -- tạo `LETTER_SPEECH` (đủ 26 chữ) và `spellForSpeech(text)`. Hàm bỏ dấu `-`, khoảng trắng và hoa thường; ký tự không phải chữ cái giữ nguyên dạng đọc được. Test: đủ 26 chữ; `'H-U-Y'` / `'huy'` → `'aitch, you, why'`.
- [x] `src/data/foundation/types.ts`, `src/components/foundation/BrickScreen.tsx` -- thêm field `audioText?` / `sampleAudioText?`. `EnLine` đọc `speech ?? text`.
- [x] `src/data/foundation/bricks/f02.ts` … `f06.ts`, `content.ts` -- soạn 5 viên theo Boundaries:
  - F02: A/E/I, G/J, đánh vần tên, email, mã số.
  - F03: /…/, 10 ký hiệu gần tiếng Việt, ː.
  - F04: đếm âm tiết, ˈ, schwa, không chèn nguyên âm (s-tu-dent).
  - F05: rice/rise/right, bag/back, five/fine, /iː/–/ɪ/.
  - F06: 0–100, thirTEEN/THIRty, số 0 đọc "oh", giá, giờ, thứ, tháng, 1st/2nd/3rd.
  - Id câu nói theo dạng `fNN-say-n`.
- [x] `src/data/foundation/foundation.test.ts` -- sửa dòng F02 thành F07; thêm kiểm tra:
  - F01–F06 có nội dung;
  - mỗi viên có câu `listen`; F04 có `tapSyllable`;
  - `audioText` / `sampleAudioText` nếu có thì không rỗng;
  - F02 không chuỗi đọc nào chứa chữ cái đơn, regex `(^|[^A-Za-z])[A-HJ-Z]([^A-Za-z]|$)` trên `audioText` của câu `listen`, `audioText`, `sampleAudioText` và `speak[].text`;
  - từ chủ đề không trùng giữa các viên.
- [x] `src/data/questions/foundation.ts`, `index.ts` -- tạo các phần sau:
  - 40 câu `q-fNN-NN` (`lessonId` `fNN`); `sectionId`: `pronunciation` cho F01–F05, `vocabulary` cho F06, `grammar` cho hàng B–D;
  - `FOUNDATION_QUIZZES` (`homeLessonId` là bài của viên đầu hàng);
  - `ROW_QUIZ_ID: Record<RowId, string>` và `foundationQuiz(row)`.
  - `getQuestion` tra cả hai ngân hàng.
- [x] `src/data/questions/foundation.test.ts` -- kiểm tra:
  - id duy nhất (cả với `QUESTION_BANK`), đúng dạng;
  - `lessonId` là viên của đúng hàng; tag và section hợp lệ;
  - 4 lựa chọn, luật câu nghe;
  - mỗi hàng 10 câu, ≤ 2 câu nghe, mỗi viên ≥ `minPerLesson`;
  - `pickQuiz` cho đúng 8 câu với 20 seed, cả `canSpeak` true lẫn false (false thì không có câu nghe);
  - `QUESTION_BANK`/`QUIZZES` không chứa `fNN`; `getQuestion('q-f02-01')` có kết quả.
- [x] `src/lib/foundation/row-test.ts` (+ `row-test.test.ts`) -- viết các hàm:
  - `nextPlacementRow(store)`;
  - `rowTestMode(store, row, context: 'placement' | 'row')` → `placement | know | final`;
  - `recordRowTest(store, { row, context, attemptId, seed, startedAt, answers }, now)`:
    - luôn gọi `markRowTested`;
    - chế độ `final` gọi thêm `recordAttempt` với `quizId` của hàng;
    - không còn hàng nào cần Soát vé (ở mọi chế độ) thì gọi thêm `finishPlacement('done')`;
    - `answers` rỗng → trả store cũ.
  - `skipPlacement(store, now)`;
  - `parseRowParam('a')` → `'A' | null`.
  - Test phủ các dòng Matrix từ "Đạt hàng A" tới "Kiểm tra cuối hàng".
- [x] `src/lib/foundation/player.ts` (+ `player.test.ts`) -- `wallRows` gán `test`:
  - hàng chưa xong → `know`;
  - mọi viên của hàng đã xong → `final`;
  - hàng qua bằng kiểm tra mà chưa học hết viên → `null`.
- [x] `src/components/quiz/source-label.ts` (+ `source-label.test.ts`), `QuestionCard.tsx` -- `questionSourceHref` và nhãn `fNN` theo dòng "Nguồn câu". Thêm `tone="gentle"`: chọn sai thì viền nét đứt, nền `muted`, chữ "Chưa đúng, không sao. Đáp án: …", không `destructive`.
- [x] `src/app/store-context.ts` -- `useFoundation` thêm:
  - `needsPlacement`, `placementRow`;
  - `recordRowTest(input, now?)`, `skipPlacement(now?)`.
- [x] `src/components/foundation/RowTestRun.tsx`, `RowTestResult.tsx` -- `RowTestRun` chạy 8 câu của hàng:
  - seed và câu chốt lúc bắt đầu; dùng `QuestionCard tone="gentle"` và thanh tiến độ;
  - ghi khi bấm "Xem kết quả".
  - `RowTestResult` hiện:
    - điểm, đạt / chưa đạt (lời nhẹ);
    - với `final` có sai: dòng "n câu sai đã vào Sổ lỗi" và link Sổ lỗi;
    - danh sách câu sai kèm link nguồn.
- [x] `src/pages/FoundationTicket.tsx`, `FoundationRowTest.tsx`, `Foundation.tsx`, `BrickWall.tsx`, `src/app/routes.tsx`, `nav-items.test.ts` -- làm như sau:
  - Trang Soát vé chạy hàng lần lượt. Sau mỗi hàng có "Sang hàng X" và "Dừng ở đây". Cuối cùng là màn tổng kết. Có nút bỏ qua. Xử lý URL theo Matrix.
  - Trang kiểm tra hàng ghi rõ chế độ: "Tôi biết rồi: câu sai không vào Sổ lỗi", hoặc "Kiểm tra cuối hàng: câu sai vào Sổ lỗi để ôn".
  - `Foundation.tsx`: thêm thẻ mời ở trên nút "Học tiếp".
  - `BrickWall.tsx`: thêm nút ghost nhỏ ở tiêu đề hàng.
  - `routes.tsx`: thêm route `foundation/soat-ve`, `foundation/kiem-tra/:row`.
  - `nav-items.test.ts`: test route thật và tab Lộ trình sáng.

**Acceptance Criteria:**
- Given người dùng mới vào Sân ga, when làm Soát vé (hàng A 7/8, hàng B 2/8, dừng trước C), tải lại rồi tiếp tục, then:
  - Soát vé tiếp tục từ hàng C;
  - xong D thì tổng kết đúng hàng đạt;
  - hàng A sáng trên tường; viên tiếp theo bỏ qua hàng A;
  - `store.data.mistakes` và `store.data.quizzes` không đổi.
- Given đang học F02–F06, when chạy hết 6 màn từng viên, then mỗi viên sáng trên tường, không thấy màu đỏ, và câu nghe chữ cái được đọc theo tên chữ.
- Given đã học hết F01–F06, when làm "Kiểm tra cuối hàng" và sai 2 câu, then Sổ lỗi có 2 câu mới với link "Xem lại: Viên gạch Fxx · …" mở đúng viên.
- Given màn hình 375px, when mở `/foundation`, `/foundation/soat-ve`, `/foundation/kiem-tra/A`, `/foundation/F02`…`F06`, then không có cuộn ngang và các trang cũ không đổi.

## Implementation Notes
- **Files:** `src/data/foundation/{letters,letters.test}.ts`, `bricks/f02…f06.ts`, `types.ts` (`audioText?`, `sampleAudioText?`), `catalog.ts` + `index.ts` (`brickLessonId`, `brickIdFromLessonId`, re-export `LETTER_SPEECH`/`spellForSpeech`), `content.ts`, `foundation.test.ts`; `src/data/questions/{foundation,foundation.test}.ts`, `index.ts`; `src/lib/foundation/{row-test,row-test.test}.ts`, `player.ts` (+ test); `src/components/quiz/{source-label,source-label.test}.ts`, `QuestionCard.tsx`; `src/components/foundation/{RowTestRun,RowTestResult,BrickWall,BrickScreen}.tsx`; `src/pages/{FoundationTicket,FoundationRowTest,Foundation}.tsx`; `src/app/{routes.tsx,store-context.ts,nav-items.test.ts}`.
- **Nội dung F02–F06:** theo khuôn F01, mỗi viên 6 màn, check 4–5 câu + 2 `easier`, có câu `listen` (F04 thêm 2 `tapSyllable` + `tapSyllable` ở màn Áp dụng), 1–2 `ruleCards`, từ chủ đề đúng bảng. Áp dụng: F02 nghe/đánh vần H-U-Y + tự đánh vần tên (nói theo "first name", "email address"); F03 đọc mục "sea /siː/"; F04 chạm âm nhấn của family; F05 câu `listen` five/fine + nói rice/rise/right, bag/back, sheep/ship; F06 chọn cách đọc 7:30 + nói "fifteen dollars", "seven thirty, Monday". Ví dụ có ký hiệu IPA / số dùng `audioText` để máy đọc từ thật (vd "sea /siː/" đọc "sea", "$15" đọc "fifteen dollars"). F02 mọi chuỗi đọc có chữ cái đi qua `spellForSpeech`.
- **`spellForSpeech`:** bỏ `-`/khoảng trắng, không phân biệt hoa thường; ngoài chữ cái: `@` → "at", `.` → "dot", `_` → "underscore", số và ký tự khác giữ nguyên; nối ", ".
- **Test dữ liệu viên:** thêm F01–F06 có nội dung (F07 chưa), mỗi viên có `listen`, F04 có `tapSyllable`, `audioText`/`sampleAudioText` không rỗng, từ chủ đề không trùng giữa viên. Kiểm tra chữ cái đơn ở F02 chặt hơn spec: chạy regex trên chuỗi máy thật sự đọc (`audioText ?? en` của ví dụ / worked, `sampleAudioText ?? sampleEn`, `audioText` câu listen, `speak[].text`).
- **Ngân hàng câu:** 40 câu (10/hàng, mỗi hàng 1–2 câu nghe; số câu theo viên A: 1-2-2-1-2-2, B: 2-2-1-2-2-1, C: 3-2-3-2, D: 5-5). `FOUNDATION_QUIZZES` dựng từ `bricksOfRow` (`minPerLesson` A/B 1, C 2, D 4; `homeLessonId` = viên đầu hàng), `ROW_QUIZ_ID`, `ROW_QUIZ_SIZE = 8`, `foundationQuiz(row)`; re-export từ `@/data/questions`. `getQuestion` tra `QUESTION_BANK` + `FOUNDATION_QUESTIONS`; `QUESTION_BANK`, `QUIZZES`, `getQuiz` không đổi (test xác nhận `getQuiz('quiz-f-a')` undefined, không có `lesson-fNN`). Test `pickQuiz` 20 seed × có/không TTS: đúng 8 câu, mỗi viên ≥ `minPerLesson`.
- **`row-test.ts`:** `nextPlacementRow` (null khi không `needsPlacement`), `placementStarted` (có hàng đứng trước `nextPlacementRow` đã có `rows[r]` hợp lệ → thẻ "Tiếp tục Soát vé · hàng X"), `rowTestMode`, `recordRowTest` (luôn `markRowTested`; `final` → `recordAttempt` với `quiz-f-x`; hết hàng ở mọi chế độ → `finishPlacement('done')`, xét "hết hàng" không phụ thuộc `needsPlacement`), `rowTestVerdict` (lời đạt / chưa đạt, có test), `skipPlacement`, `parseRowParam`; thêm `rowStartBrick` (viên chưa xong đầu tiên của hàng, cho lời "học hàng X từ Fyy"), `rowSummaries` (tổng kết: passed / bricks / failed / untested), `rowBrickRange`, `rowTestHref`, `PLACEMENT_HREF`. Không re-export từ `@/lib/foundation`.
- **`wallRows`:** thêm `test` (`know` / `final` / null); bức tường hiện nút ghost nhỏ "Tôi biết rồi" / "Kiểm tra cuối hàng" cạnh nhãn "x/y viên" / "Xong".
- **`useFoundation`:** thêm `needsPlacement`, `placementRow`, `placementStarted`, `recordRowTest(input, now?)`, `skipPlacement(now?)`.
- **Giao diện:** `QuestionCard tone="gentle"` (viền nét đứt, nền `muted`, "Chưa đúng, không sao. Đáp án: …"; mặc định không đổi). `SourceSectionLink` dùng `questionSourceHref` nên Sổ lỗi, `QuizResult`, O.W.L. tự hưởng. `RowTestRun` chốt seed + câu lúc mount, chỉ ghi khi bấm "Xem kết quả". `RowTestResult`: điểm, lời đạt / "Chưa đạt 70%, mình học hàng X từ Fyy" (`final`: "ôn lại"; hàng đã đạt từ trước mà lần này chưa đạt: "vẫn tính là xong"), `final` có sai thì "n câu sai đã vào Sổ lỗi…" + "Mở Sổ lỗi sai", danh sách câu chưa đúng kèm link nguồn. Trang Soát vé chốt hàng bắt đầu lúc mount (nên vẫn hiện tổng kết sau khi `placement` thành `done`); vào khi không `needsPlacement` hoặc không còn hàng → `/foundation`. Tổng kết đặt trên kết quả hàng cuối; cả 4 hàng xong → "Cả 4 hàng đạt: Sân ga xong" + "Về Lộ trình". "Bỏ qua, học từ viên 1" có ở thẻ mời và trang Soát vé (còn `pending`), tới viên tiếp theo hoặc ở lại / về bức tường. Thẻ mời ẩn khi `placementRow` null.
- **Kiểm chứng:** `npm run lint && npm test && npm run build` pass (55 file, 1039 test; `check-precache` OK; cảnh báo chunk size có sẵn). Lệnh vitest theo Verification: 10 file, 214 test pass. `grep -rn "destructive" src/components/foundation src/pages/Foundation*.tsx`: không có kết quả. Headless Chrome 375px (CDP, dev server tắt Supabase): 150/150 kiểm tra pass — thẻ mời + 12 ô "Đang soạn"; Soát vé hàng A (sai → giọng nhẹ, không lớp `destructive`), đạt → "Sang hàng B"/"Dừng ở đây", store chỉ có key `foundation`; dừng giữa hàng B → "Tiếp tục Soát vé · hàng B", `rows.B` không ghi, làm lại từ câu 1; B 2/8 "Chưa đạt 70%, mình học hàng B từ F07"; hết D → tổng kết, `placement: done`, thẻ mời ẩn, `/foundation/soat-ve` → `/foundation`; `/kiem-tra/b` → `/B`, "Tôi biết rồi" 6/8 đạt, Sổ lỗi/quizzes không đổi; `/kiem-tra/x` → `/foundation`; bỏ qua từ thẻ mời → `/foundation/F01`; kiểm tra cuối hàng A (F01–F06 xong) sai 2 → 2 mục Sổ lỗi `lessonId` fNN, lần làm `quiz-f-a`, link "Xem lại: Viên gạch F0x · …" ở kết quả và trang Sổ lỗi mở đúng viên; F02–F06 chạy hết 6 màn, mọi câu check đúng, không đỏ, viên được ghi xong; nghe "H-U-Y" (màn 2 và Áp dụng F02) → TTS nhận "aitch, you, why"; không tràn ngang ở `/`, `/roadmap`, `/practice`, `/notebook`, `/trophies`, `/foundation`, `/foundation/soat-ve`, `/foundation/kiem-tra/A`, `/foundation/F02`…`F06`.
- **Lưu ý / rủi ro:** (1) Câu Sân ga có 2–3 cặp trùng tập lựa chọn (vd `in/on/at/to`); không ảnh hưởng app (chấm theo id câu), chỉ cần để ý khi viết công cụ tự động. (2) Câu hàng B–D hỏi kiến thức chưa dạy theo ngoại lệ Soát vé; nhãn tag là ước lượng tay. (3) Lần "Tôi biết rồi" không vào `quizzes.attempts` nên không tính Hermione; chỉ `final` tính. (4) Phần hiển thị (trang, component) không có test tự động (Vitest env `node`), chỉ kiểm bằng headless Chrome ở trên.

## Spec Change Log

- **2026-11-06 · review story 20.** Kích hoạt: finding "Soát vé kẹt `pending`" (blind + edge) và "`placementStarted` sai sau Tôi biết rồi" (blind + edge). Sửa phần không đóng băng (Tasks, Implementation Notes): `recordRowTest` gọi `finishPlacement('done')` khi không còn hàng cần Soát vé **ở mọi chế độ** (trước chỉ `placement`); `placementStarted` chỉ tính kết quả của hàng đứng trước hàng Soát vé tiếp theo; thêm `rowTestVerdict` thuần. Trạng thái xấu tránh được: `needsPlacement` true mãi khi đã hết hàng để soát; thẻ mời "Tiếp tục Soát vé · hàng A" cho người chưa từng mở Soát vé. KEEP: phần đóng băng không đổi; Soát vé vẫn chỉ ghi khi bấm "Xem kết quả"; `placement`/`know` không ghi `quizzes`/Sổ lỗi; màn kết quả dùng chế độ thật sự lúc ghi (`outcome.mode`).

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Link "Xem lại" giữa bài kiểm tra hàng làm mất bài, hàng B–D dẫn tới viên "Đang soạn" | medium | `QuestionCard` hiện `SourceSectionLink` khi sai bất kể `tone`; `RowTestRun` không ghi gì khi rời trang, nên một lần chạm bỏ mất hàng đang làm. | patch: `tone="gentle"` ẩn link giữa bài; link vẫn có ở `RowTestResult` sau khi đã ghi. |
| 2 | blind | `placementStarted` true khi chỉ có kết quả "Tôi biết rồi" | low | `placementStarted` xét mọi `rows[r]`; "Tôi biết rồi" hàng B đạt → thẻ mời "Tiếp tục Soát vé · hàng A" dù chưa mở Soát vé (test cũ còn khẳng định `nextPlacementRow` = A). | patch: chỉ tính hàng đứng trước `nextPlacementRow`; thêm assert vào test "Tôi biết rồi". |
| 3 | blind | Soát vé có thể kẹt `pending` mãi | medium | `recordRowTest` chỉ gọi `finishPlacement('done')` khi `mode === 'placement'`; mọi hàng có kết quả nhờ `know`/`final` → `needsPlacement` true, `placementRow` null. Story 21/22 sẽ đọc cờ này. | patch: đóng Soát vé khi hết hàng ở mọi chế độ + test; nhánh `completeBrick` → defer. |
| 4 | blind | Ngân hàng mỏng cho "Làm lại (đề mới)", "Tôi biết rồi" làm lại không giới hạn | low | Hàng A, C, D có đúng 8 câu không nghe → máy không TTS ra cùng 8 câu. Số 10 câu/hàng nằm trong phần đóng băng; giới hạn số lần làm trái "không khoá cứng" của Huy. | patch: nhãn thành "Làm lại"; tăng câu / cooldown → reject (spec đóng băng, quyết định Huy). |
| 5 | blind | Nhiều câu hỏi cùng một kiến thức (went ×3, bộ lựa chọn in/on/at/to) | medium | `q-f17-01` và `q-f17-04` cùng hỏi `went` trong hàng D (F17 có 5 câu, `minPerLesson` 4 nên thường ra cả hai); hàng D thiếu câu hỏi/`does`. Bộ lựa chọn lặp không phải lỗi (đáp án khác). | patch: `q-f17-04` thành câu hỏi `Does he work every day?`. |
| 6 | blind | `q-f11-01`/`q-f11-02` giải thích a/an theo chữ cái | low | Giải thích viết "bắt đầu bằng nguyên âm/phụ âm", trái với luật âm đầu (an hour, a university). | patch: viết "âm đầu /æ/ là nguyên âm", "âm đầu /s/ là phụ âm" (gộp với #40). |
| 7 | blind | F03 ghép /d/, /s/ với chữ Việt sai và tự mâu thuẫn | high | `f03.ts:14` liệt kê /d/, /s/ "gần như chữ Việt"; chữ d Việt là /z/ hoặc /j/, còn màn Áp dụng nói "/s/ như x". | patch: ghi rõ /d/ như đ, /f/ như ph, /s/ như x (giải thích vẫn 40–80 chữ). |
| 8 | blind | F05 thiếu dấu hiệu độ dài nguyên âm, mô tả âm cuối chưa chuẩn | medium | Âm hữu thanh cuối gần như mất thanh; dấu hiệu nghe được là nguyên âm dài hơn (rise/rice, bag/back). "/k/ cuối … bật hơi nhẹ" mâu thuẫn "gọn". | patch: sửa `enRequires`, `noteVi` màn worked, hint và giải thích f05-c1/c2. |
| 9 | blind | Đáp án thẻ quy tắc `iː` không gõ được trên điện thoại | maybe-false | Thẻ quy tắc chưa vào SRS ở story này; story 23 mới quyết định ôn bằng gõ hay chạm. | defer (medium, chưa kiểm chứng) kèm phần thẻ `W = ___ you` của #12. |
| 10 | blind | F02 không làm đúng lời hứa (nói không phải đánh vần, thiếu mã số, 0 đọc zero) | low | Ví dụ mã số thiếu đúng như Tasks liệt kê. Câu nói `first name`/`email address` là chủ ý (nhận diện giọng nói không chấm được tên chữ), promptVi vẫn yêu cầu tự đánh vần tên; không ví dụ F02 nào có số 0. | patch: thêm ví dụ mã "VN-27K" qua `spellForSpeech`; phần còn lại reject. |
| 11 | blind | Đề tiếng Việt bị gắn `lang="en"` | low | Đúng là `QuestionPrompt` gắn `en` cho mọi `choice`, nhưng chỉ ảnh hưởng trình đọc màn hình; Huy không dùng, sửa cần thêm nhánh đoán ngôn ngữ. | reject |
| 12 | blind | Kiểm tra chữ cái đơn F02 có điểm mù | low | Regex theo đúng Tasks; `faded.en` không được đọc (FadedBody không có nút nghe), thẻ quy tắc chưa được đọc ở story này. | reject; phần thẻ quy tắc gộp vào defer #9. |
| 13 | blind | Lỗi nhỏ: Y "quai", tag `q-f02-02`, lời hứa "thẻ từ sẽ hiện IPA / tô âm nhấn" | low | "quai" đọc /kwaj/; `q-f02-02` là cách đọc ký hiệu nên thuộc `phát âm`. Lời hứa IPA/nhấn: `FlashcardSession` đã hiện IPA và trọng âm sẵn, nên không sai. | patch: "oai", tag `phát âm`; lời hứa → false. |
| 14 | blind | `RowTestRun` trắng trang khi `pickQuiz` trả 0 câu | false | Test `src/data/questions/foundation.test.ts` bảo đảm mỗi hàng ra đúng 8 câu với 20 seed, có và không TTS; trạng thái này không xảy ra. | reject |
| 15 | edge | Màn kết quả dùng chế độ chốt lúc mở trang, có thể lệch chế độ thật lúc ghi | low | `FoundationRowTest` truyền `mode` từ `useState` lúc mount; đồng bộ/tab khác hoàn thành viên giữa bài thì `recordRowTest` ghi `final` nhưng màn kết quả nói câu sai không vào Sổ lỗi. | patch: `RowTestRun` tính `mode` lúc bấm "Xem kết quả" và trả trong `RowTestOutcome`; màn kết quả dùng `outcome.mode`. |
| 16 | edge | Soát vé kẹt `pending` khi hàng cuối xong bằng Tôi biết rồi / cuối hàng / viên | medium | Trùng #3. | patch (gộp #3); nhánh `completeBrick` → defer. |
| 17 | edge | Thẻ mời "Tiếp tục Soát vé" khi chưa từng mở Soát vé | low | Trùng #2. | patch (gộp #2). |
| 18 | edge | Hàng có kết quả "Tôi biết rồi" chưa đạt bị Soát vé bỏ qua | false | Đúng luật đóng băng: "hàng tiếp theo là hàng đầu tiên … chưa xong và chưa có `rows[r]` hợp lệ"; hàng đó đã có kết quả xếp chỗ, tổng kết hiện "Chưa đạt · học từ Fxx". | reject |
| 19 | edge | Khu kiểm tra trắng khi `pickQuiz` trả 0 câu | false | Trùng #14. | reject |
| 20 | edge | `spellForSpeech` giữ ký tự lạ (dấu phẩy, nháy) | false | Spec định "ký tự khác giữ nguyên"; hàm chỉ được gọi với chuỗi cố định ('H-U-Y', 'AEI', 'GJ', 'J-E', 'huy', 'VN27K'), không có ký tự lạ. | reject |
| 21 | edge | Trang Soát vé hiện "Soát vé xong" khi thiết bị khác đã bỏ qua giữa bài | low | Chỉ xảy ra khi đồng bộ từ máy khác đúng lúc đang làm; trong trang nút bỏ qua điều hướng đi ngay. Sửa cần thêm nhánh. | reject |
| 22 | vgap | Test "Dừng giữa hàng" không chạy đường dừng giữa hàng | medium | Đã kiểm (layer vgap): test chỉ xét store sau hàng A, tên test nhận phủ dòng Matrix. | patch: đổi tên + chú thích nói rõ phần không ghi nằm ở `RowTestRun`, kiểm bằng tay. |
| 23 | vgap | Lời đạt / chưa đạt chưa có test | medium | Đã kiểm (layer vgap): nhánh `verdict` nằm trong component. | patch: tách `rowTestVerdict` thuần vào `row-test.ts` + test 5 nhánh, không chữ "trượt". |
| 24 | vgap | `SourceSectionLink` → `questionSourceHref` chưa có test ở Sổ lỗi | low | Đã kiểm (layer vgap); hàm thuần đã có test, component không có harness. | defer |
| 25 | vgap | Test F02 không kiểm `BrickScreen` truyền `audioText` cho nút nghe | low | Đã kiểm (layer vgap); không có harness test component. | defer |
| 26 | content | `q-f09-01` có hai đáp án đúng (her / hers) | high | "I love hers." là câu đúng (đại từ sở hữu). | patch: thay `hers` bằng `he`. |
| 27 | content | F03 /d/, /s/ ghép chữ Việt sai | high | Trùng #7. | patch (gộp #7). |
| 28 | content | F03 dùng "nguyên âm" trước khi F04 dạy | low | "Nguyên âm/phụ âm" là thuật ngữ người Việt học từ lớp 1; không cần định nghĩa lại. | reject |
| 29 | content | Y đọc "quai" sai | medium | Trùng #13: /waɪ/ không có /k/. | patch (gộp #13): "oai". |
| 30 | content | `q-f18-01` có hai đáp án (at / by) | medium | "starts by 7:30" vẫn chấp nhận được (không muộn hơn 7:30). | patch: thay `by` bằng `for`. |
| 31 | content | Gợi ý "đếm nguyên âm" của F04 sai với teacher | low | Đếm chữ cái nguyên âm: teacher ra 3 trong khi có 2 âm tiết. | patch: "Đếm số nguyên âm nghe được (không đếm chữ cái)". |
| 32 | content | family 3 âm tiết có thể lệch audio (FAM-ly) | medium | Cambridge ghi cả /ˈfæm.li/; TTS Mỹ hay đọc 2 âm tiết, câu f04-e2 chấm "3". | patch: f04-e2 đổi sang computer (3); ghi chú màn worked "nói nhanh thành FAM-ly, vẫn nhấn FAM". |
| 33 | content | Chuỗi tên chữ A 'ay', E 'ee', R 'ar' có thể bị TTS đọc sai | maybe-false | Headless Chrome chỉ thấy chuỗi gửi tới TTS, không nghe được giọng iOS/Android. | defer (medium, chưa kiểm chứng) + humanCheck; R đổi sang 'are' (từ thật, đọc chắc /ɑːr/). |
| 34 | content | F02 phiên âm không nhất quán (J "dzêi", G "di") | low | "êi" không phải vần Việt; d Bắc là /z/. | patch: G "dzi", J "dzây". |
| 35 | content | f02-e2 trả lời "a còng" cũng đúng | low | Người Việt đọc @ là "a còng". | patch: đề thành "Trong tiếng Anh, dấu @ … đọc là gì?". |
| 36 | content | F04 không định nghĩa nguyên âm / phụ âm | low | Như #28. | reject |
| 37 | content | Mô tả âm cuối F05 chưa chắc | low | Trùng #8. | patch (gộp #8). |
| 38 | content | F06 gợi ý nhắc đuôi -th trước khi dạy | low | Hint màn faded nói "không theo đuôi -th", -th chỉ xuất hiện ở thẻ quy tắc. | patch: "Nhớ lại màn 1: 1st first, 3rd third. 2nd không đọc 'twoth'". |
| 39 | content | Nhãn section / tag chưa khớp nội dung | low | Với câu `fNN`, `sourceLabel`/`questionSourceHref` bỏ qua `sectionId` (luôn mở viên); tag là ước lượng tay theo spec. Riêng `q-f02-02` sửa ở #13. | patch một phần (#13); còn lại reject. |
| 40 | content | Giải thích a/an trái luật âm đầu của F11 | low | Trùng #6. | patch (gộp #6). |
| 41 | content | `q-f13-02` dùng "from" (F14 mới dạy), link Xem lại về F13 | low | Link sai chỗ khi người học sai câu này ở kiểm tra cuối hàng. | patch: "They ___ students.". |
| 42 | content | Không thấy vấn đề bản quyền | false | Mục thông tin, không phải lỗi. | reject |

Tổng: 28 patch, 4 defer (thêm 1 mục defer cho nhánh `completeBrick` của #3), 10 reject. Sau patch: `npm run lint`, `npm test` (55 file, 1042 test), `npm run build` (check-precache OK) đều pass; `grep destructive` không có kết quả.

## Design Notes

| Chế độ | Khi nào | Ghi `rows[r]` | `quizzes.attempts` | Sổ lỗi | Thêm |
|---|---|---|---|---|---|
| `placement` | Trang Soát vé | có | không | không | Hết hàng → `finishPlacement('done')` |
| `know` | Hàng còn viên chưa xong | có | không | không | — |
| `final` | Mọi viên của hàng đã xong | có | có (`quiz-f-x`) | có | — |

Chế độ được chốt lúc bắt đầu bài (dùng để hiện lời dẫn) và tính lại trong `recordRowTest` từ store lúc ghi. Bài làm dở không đổi được tiến độ viên, nên hai lần tính cho cùng kết quả.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass (gồm `check-precache`).
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/data/foundation src/data/questions src/lib/foundation src/components/quiz src/app/nav-items.test.ts` -- expected: pass, mỗi dòng I/O Matrix có logic thuần đều có ca test.
- `grep -rn "destructive" src/components/foundation src/pages/Foundation*.tsx` -- expected: không có kết quả.

**Manual checks:**
- Headless Chrome 375px:
  - Soát vé: đạt, chưa đạt, dừng giữa hàng, bỏ qua.
  - "Tôi biết rồi" và "Kiểm tra cuối hàng" (kiểm tra Sổ lỗi).
  - Chạy F02–F06, nghe "H-U-Y".
  - Không có tràn ngang.
