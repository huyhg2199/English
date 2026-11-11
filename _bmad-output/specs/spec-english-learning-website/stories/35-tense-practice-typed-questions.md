---
title: 'Bộ máy luyện có bậc cho Tense và câu gõ / biến đổi trong quiz (CAP-2, CAP-11, CAP-19, learning-rules "Buổi học", "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: '360e5e4e82f033954eb57284fc03b560b092a870'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/19-brick-player-foundation-wall.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/9-quiz-engine-mistake-log.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/33-past-to-be-wh-did.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời "hoàn thiện giúp tôi đi" ngày 2026-11-11 sau báo cáo kiểm tra "nền & các thì", tức là làm hết story 32–47. Thứ tự do Claude đề xuất: 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Mục tiêu của đợt (quyết định 3): "nắm chắc" nghĩa là Huy **tự làm ra** câu đúng thì (gõ, biến đổi, dịch Việt → Anh, nói), không chỉ nhận ra đáp án trong câu trắc nghiệm. Story 35 làm phần bộ máy cho việc đó (báo cáo kiểm tra, mục C1 và C2). Story 36–37 soạn dữ liệu cho từng thì.
- Quyết định 4: dùng lại tối đa bộ máy Sân ga (luồng `CheckFlow`, `CheckItemView`, `CheckScreen`, màn ví dụ mẫu và màn điền một chỗ), không dựng hệ mới.
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn; chỉ dùng kiến thức đã dạy (`requires`); giao diện 375px không đổi ngoài phần mới; desktop theo story 29–31; store đổi schema thì phải bump version (story này không bump).
- Claude chọn:
  - **`Tense.practice` không bắt buộc**, gồm đúng 4 bước theo thứ tự: ví dụ mẫu → điền một chỗ (gõ) → 5–7 câu luyện có "Gợi ý", dưới 60% thì mời xem lại và làm 2 câu dễ hơn → áp dụng ("nói hoặc viết câu về bạn"). Dữ liệu dùng lại kiểu màn `worked` / `faded` / `check` / `apply` của Sân ga, bỏ trường `kind`.
  - **Khối luyện nằm ngay dưới TenseCard của chính thì đó, trong đoạn Ngữ pháp.** Vì đoạn này hiện ở cả bước Bài chính của buổi 30' và trang bài, nên khối luyện cũng hiện ở cả hai chỗ. Khối đóng sẵn và có nút "Bắt đầu luyện". Mỗi lúc chỉ mở một khối trong đoạn, để phím tắt không chạy hai nơi.
  - **Luyện thì giống câu luyện trong viên:** sai thì giải thích và cho làm lại, không ghi Sổ lỗi, không ghi lần làm quiz, không lưu tiến độ, không cộng điểm. Story 41 mới nối kết quả vào việc đánh dấu bài.
  - **Câu luyện Sân ga có thêm dạng `type`:** gõ một chỗ trống, hoặc gõ cả câu khi đề yêu cầu biến đổi.
  - **Quiz có thêm 2 dạng `type` và `transform`.** Cả hai đều chấm bằng chuẩn hoá chuỗi và nhận thêm cách viết khác trong `accept`.
    - `type`: gõ dạng đúng vào một chỗ trống, đề có dạng "She ___ (not / work) today." (gợi ý trong ngoặc ngay sau chỗ trống; sửa ở review, xem Spec Change Log).
    - `transform`: gõ lại cả câu theo yêu cầu, ví dụ đổi khẳng định sang phủ định, câu hỏi hay trả lời ngắn, hoặc dịch một câu Việt ngắn sang Anh (story 36 dùng). Mỗi câu chỉ là một bước. Chuỗi "khẳng định → phủ định → câu hỏi → trả lời ngắn" do người soạn dựng thành nhiều câu liên tiếp từ cùng một câu gốc.
  - **Chuẩn hoá khi chấm:**
    - không phân biệt hoa thường, dấu câu, khoảng trắng thừa;
    - nháy cong coi như nháy thẳng;
    - dạng rút gọn n't tương đương dạng đầy đủ, kể cả khi gõ thiếu nháy (doesnt = doesn't = does not; won't = will not; can't = cannot = can not);
    - I'm / you're / we're / they're / I've … / I'll … chỉ được mở rộng khi có dấu nháy. Lý do: "were" không phải "we're";
    - 's không được mở rộng, vì nó có thể là is, has hoặc sở hữu. Khi cần thì người soạn ghi vào `accept`.
    
    Câu chọn đáp án vẫn chấm bằng so khớp đúng như cũ.
  - **Ô gõ ở màn "Tự điền một chỗ trống" của viên gạch** dùng chung cách chấm mới, nên "are not" được tính đúng cho "aren't". Đây là thay đổi có chủ đích: chỉ nới thêm, không câu nào trước đây đúng mà nay thành sai.
  - **pickQuiz ưu tiên câu chưa gặp:**
    - "đã gặp" là câu từng xuất hiện trong một lần làm đã chấm (`listGradedAttempts`, mọi bài test);
    - trong mỗi bài, câu chưa gặp được lấy trước, sau đó mới tới câu đã gặp;
    - không có câu nào đã gặp thì đề ra **y hệt** cách chọn cũ với cùng seed;
    - chỉ quiz bài và mini test (`Quiz.tsx`, `DefinedQuizRun`) truyền danh sách câu đã gặp. Soát vé, kiểm tra hàng, test quay lại và O.W.L. giữ nguyên.
  - **Dữ liệu mẫu chạy thật cho hiện tại tiếp diễn (`present-continuous`, s1-t2-w1),** vì đây là thì đầu tiên Huy gặp sau T1. Gồm:
    - `practice` đủ 4 bước (6 câu luyện, 2 câu dễ hơn);
    - 4 câu quiz mới `q-s1-t2-w1-07` … `-10`: 2 câu `type`, 2 câu `transform`, đều có `requires`.
    
    Các thì khác để story 36–37 làm.
  - O.W.L. vẫn chỉ bốc câu `choice` (`owlTensePool`). Câu gõ vào O.W.L. là việc của story 40.

**Problem:** Mỗi thì sau Sân ga chỉ có một thẻ để đọc (TenseCard) cộng vài câu trắc nghiệm nằm ở trang khác. Không có bước luyện có bậc như viên gạch. Quiz chỉ có dạng chọn đáp án, nên Huy chưa bao giờ phải tự gõ "isn't working" hay "Are they waiting…?". Ngoài ra `pickQuiz` bốc ngẫu nhiên, làm lại thì gặp lại đúng những câu đã nhớ đáp án.

**Approach:**
- Thêm `practice` vào `Tense` và một component `TensePractice` hiện dưới TenseCard. Component này dùng lại `CheckScreen` / `CheckItemView` / màn ví dụ mẫu / màn điền một chỗ của Sân ga.
- Thêm dạng câu gõ cho cả câu luyện Sân ga (`CheckItem` `type`) lẫn ngân hàng câu hỏi (`Question` `type` / `transform`), chấm chung bằng một hàm chuẩn hoá.
- `pickQuiz` nhận thêm danh sách câu đã gặp để lấy câu chưa gặp trước.
- Soạn dữ liệu mẫu cho hiện tại tiếp diễn. Không đổi schema store.

## Boundaries & Constraints

**Always:**
- `Tense.practice` (khi có):
  - `faded.en` có đúng một `___`, `answer` không rỗng;
  - `check.items` có 5–7 câu, `check.easier` có đúng 2 câu;
  - id câu luyện dạng `${tense.id}-c<n>` / `${tense.id}-e<n>`, không trùng nhau và không trùng id câu luyện của viên gạch;
  - câu `choice` / `listen` có 3 lựa chọn khác nhau; câu `type` có `prompt`, `answer` không rỗng, mọi `accept` khác `answer`;
  - mỗi câu có `hintVi` và `explanationVi`;
  - id câu nói ở bước áp dụng dạng `${tense.id}-say-<n>`.
- Câu tiếng Anh của dữ liệu mẫu (practice và 4 câu quiz) chỉ dùng: Sân ga F01–F18, T1 (hiện tại đơn) và hiện tại tiếp diễn. Không có dạng quá khứ, will / can, some / any / many, because / so. Đề của practice không trùng đề quiz của cùng bài.
- Câu quiz mới:
  - `kind: 'type'` thì `prompt` có đúng một `___`; `kind: 'transform'` thì `prompt` có phần yêu cầu tiếng Việt và câu gốc tiếng Anh;
  - không có `options`, không có `audioText`;
  - `answer` không rỗng, `accept` (nếu có) không trùng `answer` sau chuẩn hoá;
  - tag `thì`, gắn đoạn `grammar`, có `requires` hợp lệ (`requiresViolations` rỗng);
  - id `q-s1-t2-w1-07` … `-10`.
- Kiểu `Question` thành union phân biệt theo `kind`:
  - câu `choice` / `pronunciation` / `listening` giữ nguyên shape (4 `options`, `answer` là một lựa chọn);
  - câu `type` / `transform` không có `options`.
  
  Mọi chỗ đọc `options` phải thu hẹp kiểu (`tsc -b` qua).
- Chấm câu gõ ở mọi nơi (quiz, Sổ lỗi, câu luyện, màn điền một chỗ) đi qua cùng một hàm `matchesTyped`. Ô trống luôn sai. Câu `choice` chấm như cũ (`chosen === answer`).
- Lần làm và Sổ lỗi giữ nguyên shape: `chosen` / `lastChosen` của câu gõ là chữ Huy đã gõ, chưa chuẩn hoá. Không bump schema, không thêm key đồng bộ. Bản app cũ bỏ qua câu nó không biết, như với câu mới ở story 33.
- `pickQuiz` với `seen` rỗng hoặc không truyền thì ra đúng kết quả cũ (cùng seed, cùng thứ tự). Mọi đảm bảo cũ giữ nguyên: mỗi bài ≥ `minPerLesson` câu, không trùng câu, không có TTS thì thay câu nghe bằng câu cùng bài.
- 375px:
  - TenseCard của thì không có `practice` hiện y như cũ;
  - viên gạch, quiz câu chọn đáp án và Sổ lỗi hiện y như cũ;
  - class không tiền tố mới chỉ được nằm trong file mới (`TensePractice.tsx`, `TypedAnswer.tsx`). File cũ không thêm hay xoá class không tiền tố (`npm run layout:guard` chỉ báo 2 file mới). Ô gõ có cỡ chữ ≥ 16px để iOS không phóng to, và có `autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck={false}`, `lang="en"`.
- Phím tắt (story 31): câu gõ không nhận phím 1–4. Enter trong ô gõ là nộp bài (form submit). Khi câu đã xong thì Enter sang câu sau. Khối luyện không có bước nào bật hai phím Enter cùng lúc.

**Never:**
- Không làm việc của story sau:
  - `practice` và 12–20 câu cho các thì khác, câu dịch Việt → Anh (36–37);
  - thẻ quy tắc thêm cho thì, thẻ động từ bất quy tắc (38);
  - `signalWords`, khối "Chọn thì" (39);
  - câu gõ trong O.W.L., mini-t3 (40);
  - kiểm tra cuối Bài chính, đánh dấu xong theo điểm, Sổ lỗi trong buổi (41);
  - Bản đồ thì (42);
  - `requires` cho câu T2–T4 cũ, chia Ngữ pháp theo ngày, test quay lại ở Sân ga (47).
- Không lưu gì từ khối luyện thì: không ghi Sổ lỗi, không ghi `quizzes.attempts`, không đổi `progress`, không cộng điểm Nhà. Ngoại lệ duy nhất: câu nói ở bước áp dụng (`SpeakPractice`) ghi điểm nói vào `pronunciation` theo id câu, như viên gạch (sửa ở review, xem Spec Change Log).
- Không đổi:
  - `LESSON_QUIZ_SIZE`, `MIN_QUIZ_QUESTIONS`, định nghĩa `QUIZZES`;
  - luật `requiresViolations`, `owlTensePool` / `pickOwlTenses`, `pickComebackTest`, `RowTestRun`;
  - kế hoạch buổi (`plan.ts`), schema store;
  - nội dung viên gạch, chữ và id câu quiz cũ.
- Không dùng thư viện chấm mờ (fuzzy, Levenshtein). Không chấp nhận câu sai trật tự từ.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Khối luyện đóng | Mở đoạn Ngữ pháp `s1-t2-w1` (trang bài hoặc bước Bài chính) | Dưới TenseCard "Hiện tại tiếp diễn" có khối "Luyện: Hiện tại tiếp diễn" đóng sẵn: 1 dòng mô tả và nút "Bắt đầu luyện". Thì không có `practice` (vd s1-t2-w2) không có khối nào | N/A |
| Chạy 4 bước | Bấm "Bắt đầu luyện" | Hiện "Bước 1/4 · Ví dụ mẫu" → "Tự điền một chỗ trống" → "Luyện tập" (Câu 1/6…) → "Áp dụng". Có nút "Tiếp" / "Quay lại bước trước" và Enter = Tiếp. Ở bước Luyện tập phải xong (đúng hoặc "Xem đáp án" từng câu, hoặc bỏ qua câu dễ hơn) mới "Tiếp" được | N/A |
| Điền một chỗ | Đáp án `are playing`, gõ "Are  playing." / "are play" | Câu đầu đúng (Lumos). Câu sau sai: hiện gợi ý, gõ lại được, có "Xem đáp án" | Ô trống: nút Kiểm tra không bấm được |
| Câu luyện gõ | `present-continuous-c3`, đáp án `isn't working`, gõ "is not working" / "isnt working" / "doesn't working" | Hai câu đầu đúng, câu cuối sai: hiện giải thích, "Thử lại", "Xem đáp án". Chỉ lần trả lời đầu được tính điểm | N/A |
| Dưới 60% | Đúng ngay lần đầu 3/6 câu | Mời "Xem lại giải thích": mở phần tóm tắt công thức và 3 quy tắc của thì. Có "Làm 2 câu dễ hơn" và "Bỏ qua, sang Áp dụng" | N/A |
| Áp dụng | Tới bước 4 | Thông báo xong phần luyện, đề áp dụng, câu mẫu có nút nghe, 2 câu nói theo mẫu. Có nút "Luyện lại" (về bước 1, làm lại từ đầu) và "Đóng" | Không ghi Sổ lỗi, lần làm quiz, tiến độ; chỉ điểm nói của 2 câu nói theo mẫu (như viên gạch) |
| Một khối mở | Bài có 2 thì đều có `practice`, đang mở khối 1 thì bấm "Bắt đầu luyện" ở khối 2 | Khối 1 đóng (mất trạng thái), khối 2 mở | N/A |
| Quiz câu `type` | `lesson-s1-t2-w1` bốc trúng `q-s1-t2-w1-07` | Hiện đề có `___` và một ô gõ, nhãn "Gõ dạng đúng". Bấm "Kiểm tra" hoặc Enter thì chấm. Đúng: Lumos. Sai: "Chưa đúng. Đáp án: is crying", có giải thích và link "Xem lại". Gõ xong chỉ chấm một lần | Ô trống: không nộp được |
| Quiz câu `transform` | `q-s1-t2-w1-10`, gõ "i'm not writing an email" | Đúng (I'm = I am; hoa thường, dấu chấm không tính). Gõ "I not writing an email." thì sai | N/A |
| Ghi lần làm | Xong quiz có câu gõ sai | `answers[].chosen` là chữ đã gõ. Câu sai vào Sổ lỗi với `lastChosen` là chữ đã gõ. Màn kết quả và Sổ lỗi ghi "Bạn gõ:" thay cho "Bạn chọn:" | N/A |
| Ôn Sổ lỗi | Câu `q-s1-t2-w1-09` đến hạn | Hiện ô gõ. Chấm bằng `matchesTyped` rồi `reviewMistake` như câu chọn đáp án | N/A |
| Vì sao sai? | Bấm Gemini với câu gõ | Prompt không có dòng "Các lựa chọn". Có dòng dạng câu "tự gõ" và "Người học đã gõ: …" | Lỗi Gemini xử lý như cũ |
| Ưu tiên câu chưa gặp | Đã làm `lesson-s1-t2-w1` một lần (5 câu đã gặp, bài có 10 câu, không có câu nghe nào khác bị thay) | Lần sau bốc đúng 5 câu chưa gặp | N/A |
| Chưa gặp câu nào | Store không có lần làm nào | Đề y hệt `pickQuiz` cũ cùng seed | N/A |
| Đã gặp hết | Mọi câu của bài đều đã gặp | Bốc ngẫu nhiên như cũ | N/A |
| Không có TTS | Câu nghe bị thay | Câu thay ưu tiên câu chưa gặp cùng bài, rồi tới câu đã gặp cùng bài, rồi câu bài khác | N/A |
| Thiếu nền | F09 chưa dạy | Quiz `lesson-s1-t2-w1` bỏ câu mới cần F09 / F11 và vẫn chạy (luật story 27). mini-t2 vẫn ra 10 câu, mỗi bài T2 ≥ 2 câu | `skipped` > 0 |
| Viên gạch | F14 màn điền một chỗ có đáp án `aren't`, gõ "are not" | Đúng (thay đổi có chủ đích). Đáp án `Who` gõ "who?" vẫn đúng, gõ "what" vẫn sai | N/A |
| Câu chọn đáp án | Mọi câu `choice` / `listening` cũ | Chấm, hiện, xáo lựa chọn, phím 1–4 như cũ | N/A |
| Máy cũ | Bản trước story 35 đồng bộ store có lần làm và lỗi của `q-s1-t2-w1-07` | App cũ không lỗi. Câu lạ không vào phiên ôn (`reviewableDue` bỏ câu không tra được), lần làm vẫn hợp lệ | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/types.ts:156-183` -- kiểu `Tense` (story 33 đã có `ruleCards?`). Thêm `TensePractice` và `practice?`. `PracticeSentence` (:47).
- `src/data/lessons/t2-t4-grammar.ts:18-48` -- `PRESENT_CONTINUOUS`, nơi gắn `practice` mẫu. `GRAMMAR_T2_W1` (:413).
- `src/data/foundation/types.ts:106-228`:
  - `Screen` (màn `worked` / `faded` / `check` / `apply`), `CheckBase`, `CheckItem`, `ThreeOptions`;
  - thêm dạng `type` cho `CheckItem` và `accept?` cho màn `faded`;
  - file này `import type` từ `@/data/lessons`. Chiều ngược lại (lessons → foundation) cũng chỉ được dùng `import type`.
- `src/lib/foundation/player.ts`:
  - `CheckResponse`, `isCorrect`, `answerText`, `isFadedCorrect` (:68-71, đang gọi `checkFill`);
  - luồng `startCheck` / `recordAnswer` / `advanceCheck` / `startEasier` / `skipEasier` dùng y nguyên;
  - `player.test.ts:111-114` đang test `isFadedCorrect`.
- `src/lib/subs/blanks.ts:46-63` -- `forGrading` / `checkFill`: chuẩn hoá hiện có (bỏ dấu câu và nháy, gộp khoảng trắng, so cả bản bỏ khoảng trắng). `FillInPrompt` của video vẫn gọi `checkFill`. Không sửa file này.
- `src/components/foundation/BrickScreen.tsx`:
  - `EnLine`, `WorkedBody`, `FadedBody`, `ApplyBody` (gắn `brick.id`);
  - `CheckScreen` nhận `brick` chỉ để vẽ `ReviewExplain` → `BrickRecap`.
  - Story này tách `brick` khỏi `CheckScreen` (nhận slot `review`) và export các phần thân dùng lại được. Class giữ nguyên.
- `src/components/foundation/BrickPlayer.tsx:124-139` -- chỗ gọi `CheckScreen`, truyền `review={<BrickRecap brick={brick} contrast />}`. Phím Enter = Tiếp (:79) là mẫu cho khối luyện.
- `src/components/foundation/CheckItemView.tsx`:
  - `KIND_HINTS: Record<CheckItem['kind'], string>` (:17);
  - nhánh cuối `else` đang ngầm là `sort` (:236). Phải thêm nhánh `type` trước nhánh này;
  - `choiceBindings` (:153).
- `src/components/foundation/screen-titles.ts` -- `SCREEN_TITLES`, dùng lại cho tên bước.
- `src/components/lesson/LessonContentParts.tsx:213-226` -- `GrammarSection` (chung cho trang bài và bước Bài chính qua `LessonSectionContent.tsx:44`).
- `src/components/lesson/TenseCard.tsx` -- chỉ đọc, không sửa.
- `src/components/lesson/SpeakPractice.tsx` -- câu nói ở bước áp dụng, ghi `pronunciation` theo id câu như ở viên gạch.
- `src/pages/Session.tsx:150-215` -- `LessonStep`. Không sửa: phần luyện tự hiện qua `GrammarSection`. Phím ←/→ của buổi không đụng Enter hay 1–4.
- `src/data/questions/types.ts` -- `QuestionKind`, `Question`. Đổi sang union.
- `src/data/questions/t2-t4.ts:14-56` -- `make` (tham số `kind: QuestionKind`), `lesson()`; khối `t2w1` (:76-87). Chú thích đầu file ghi "72 câu".
- `src/data/questions/t1.ts`, `src/data/questions/foundation.ts` -- dựng câu `choice` / `listening` / `pronunciation`. Thu hẹp kiểu nếu `tsc` báo; không đổi dữ liệu.
- `src/data/questions/index.ts` -- `QUESTION_BANK`, `QUIZZES` (mini-t2: 10 câu, mỗi bài ≥ 2), `lessonQuizzes` (bài ≥ 6 câu).
- `src/lib/quiz/quiz.ts`:
  - `PickOptions` (:46), `pickQuiz` (:88-113), `shuffleOptions` (:121), `gradeAttempt` (:128);
  - `listGradedAttempts` (:159) là nguồn của "câu đã gặp".
- `src/lib/quiz/requires.ts` -- `planQuiz` chuyển `opts` cho `pickQuiz`. `quizButtonCount` không đổi.
- `src/lib/quiz/index.ts` -- re-export.
- `src/components/quiz/QuestionCard.tsx` -- `KIND_HINTS`, `QuestionPrompt`, chấm `chosen === question.answer` (:87).
- Nơi cần sửa theo kiểu union / cách chấm mới:
  - `src/pages/Quiz.tsx:178-181` (`DefinedQuizRun`: `planQuiz` chốt đề một lần);
  - `src/pages/Mistakes.tsx:79-87` (`review(id, option === question.answer, …)`);
  - `src/pages/Owl.tsx:81-84`, `src/components/foundation/RowTestRun.tsx:95` (`shuffleOptions`, chỉ câu chọn đáp án).
- `src/components/quiz/QuizResult.tsx:83`, `src/components/foundation/RowTestResult.tsx`, `src/components/owl/OwlResult.tsx`, `src/components/quiz/MistakeCard.tsx:146-153` -- nhãn "Bạn chọn" / "bạn chọn". Câu gõ đổi thành "Bạn gõ" / "bạn gõ" (chỉ đổi chữ).
- `src/lib/ai/gemini.ts:54-75` -- `KIND_LABELS`, `buildExplainPrompt` (đọc `question.options`). Có `ai.test.ts`.
- `src/lib/owl/owl.ts:133` -- `owlTensePool` chỉ lấy `kind === 'choice'`. Không sửa.
- `src/lib/quiz/mistakes.ts:207-225` -- `reviewableDue` bỏ câu không tra được (bảo đảm hàng "Máy cũ").
- Test cần cập nhật:
  - `src/data/questions/questions.test.ts:45-51` (mọi câu có 4 `options`), `:76-85` (đếm 72 câu, 6 câu mỗi bài);
  - `src/data/questions/requires.test.ts:42` (đọc `...question.options`) và test mini-t2 "bỏ 6 câu mới" (story 33);
  - `src/lib/quiz/quiz.test.ts`, `src/lib/ai/ai.test.ts`, `src/lib/owl/owl.test.ts` (nếu đọc `options` của mọi câu trong `QUESTION_BANK`).
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`, không có test component. `tsconfig.app.json` loại file test khỏi `tsc -b`, nên test không được type-check: phải chạy `npm test` để bắt lỗi lúc chạy.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/quiz/typed.ts` (mới) -- `normalizeTyped(text)` và `matchesTyped(expected, typed, accept?)` theo Design Notes. Export qua `src/lib/quiz/index.ts`. Đây là hàm chấm duy nhất cho câu gõ.
- [x] `src/lib/quiz/typed.test.ts` (mới) -- một test cho mỗi hàng trong bảng chuẩn hoá ở Design Notes:
  - hoa thường, dấu câu, khoảng trắng;
  - n't có nháy, không nháy, nháy cong;
  - won't / can't / can not;
  - I'm / they're;
  - "were" ≠ "we're";
  - 's không mở rộng;
  - `accept`;
  - ô trống;
  - sai trật tự từ.
- [x] `src/data/questions/types.ts` -- đổi `Question` sang union:
  - `ChoiceQuestion` (`kind: 'choice' | 'pronunciation' | 'listening'`, `options`, `audioText?`);
  - `TypedQuestion` (`kind: 'type' | 'transform'`, `accept?: readonly string[]`, không có `options` / `audioText`);
  - phần chung giữ nguyên;
  - thêm `TYPED_QUESTION_KINDS` và `isTypedQuestion(q)`;
  - doc comment mô tả 2 dạng mới.
- [x] `src/lib/quiz/quiz.ts` -- sửa các hàm:
  - `isAnswerCorrect(q, chosen)`: câu gõ dùng `matchesTyped(q.answer, chosen, q.accept)`, câu khác so `===`;
  - `gradeAttempt` dùng `isAnswerCorrect`;
  - `shuffleOptions` trả `[]` cho câu gõ;
  - `PickOptions` thêm `seen?: ReadonlySet<string>`;
  - `pickQuiz` xếp câu chưa gặp lên trước theo Design Notes (không tiêu thêm số ngẫu nhiên);
  - thêm `seenQuestionIds(store): Set<string>`, lấy từ `listGradedAttempts(store)`;
  - sửa doc comment.
- [x] `src/lib/quiz/quiz.test.ts` -- thêm test:
  - `seen` rỗng / không truyền thì `toEqual` kết quả cũ, với ít nhất 20 seed cho `lesson-s1-t2-w1` và `mini-t2`;
  - 5 / 10 câu đã gặp thì quiz bài bốc đúng 5 câu còn lại;
  - đã gặp hết thì vẫn đủ 5 câu, không trùng;
  - mini-t2 với `seen` vẫn ≥ 2 câu mỗi bài;
  - không có TTS thì câu thay là câu chưa gặp cùng bài;
  - `seenQuestionIds` bỏ lần "Để sau" (`skipped`) và lần làm hỏng;
  - `gradeAttempt` chấm câu gõ "is not working" là đúng, câu choice có chữ hoa khác là sai.
- [x] `src/pages/Quiz.tsx` -- `DefinedQuizRun` truyền `seen: seenQuestionIds(store)` vào `planQuiz` (tính trong `useState` init, chốt cùng đề).
- [x] `src/components/quiz/TypedAnswer.tsx` (mới) -- ô gõ dùng chung cho quiz và câu luyện:
  - form gồm `<input>` và nút "Kiểm tra" (không bấm được khi trim rỗng);
  - `onSubmit(text)`;
  - khi đã nộp thì thay ô bằng dòng chữ đã gõ (chỉ đọc), để Enter tiếp theo đi tới phím tắt "Câu tiếp";
  - đủ thuộc tính iOS ở Boundaries.
- [x] `src/components/quiz/QuestionCard.tsx` -- sửa:
  - câu gõ: vẽ `TypedAnswer` thay lưới lựa chọn;
  - `correct = isAnswerCorrect(question, chosen)`;
  - `KIND_HINTS` thêm `type: 'Gõ dạng đúng'`, `transform: 'Gõ cả câu'`;
  - `choiceBindings` với `count: 0` cho câu gõ;
  - `lang="en"` cho đề câu `type`;
  - không thêm hay xoá class không tiền tố.
- [x] `src/pages/Mistakes.tsx` -- `review(id, isAnswerCorrect(question, option), option)`.
- [x] `src/components/quiz/QuizResult.tsx`, `src/components/foundation/RowTestResult.tsx`, `src/components/owl/OwlResult.tsx`, `src/components/quiz/MistakeCard.tsx` -- câu gõ thì nhãn đổi thành "Bạn gõ" / "bạn gõ". Chỉ đổi chuỗi; sửa thu hẹp kiểu nếu `tsc` báo.
- [x] `src/lib/ai/gemini.ts` + `src/lib/ai/ai.test.ts` -- sửa prompt Gemini:
  - `KIND_LABELS` thêm `type`: "gõ dạng đúng của động từ vào chỗ trống", `transform`: "tự gõ lại cả câu theo yêu cầu (biến đổi hoặc dịch)";
  - câu gõ: bỏ dòng "Các lựa chọn", đổi "Người học đã chọn" thành "Người học đã gõ";
  - prompt của câu chọn đáp án giữ nguyên từng chữ (test cũ vẫn qua), thêm test cho câu gõ.
- [x] `src/data/questions/t2-t4.ts` -- sửa bộ dựng câu:
  - `make` chỉ nhận kind chọn đáp án;
  - `lesson()` thêm `type(n, prompt, answer, explanation, requires, accept?)` và `transform(…)` cùng chữ ký, tag `thì`, đoạn `grammar`;
  - thêm `q-s1-t2-w1-07` … `-10` đúng bảng Design Notes;
  - chú thích đầu file: 76 câu, `s1-t2-w1` có 10 câu (thêm 4 câu gõ của story 35).
- [x] `src/data/questions/questions.test.ts`, `src/data/questions/requires.test.ts` -- cập nhật và thêm test:
  - test 4 lựa chọn chỉ chạy cho câu chọn đáp án;
  - câu gõ không có `options` / `audioText`, `answer` không rỗng, `type` có đúng một `___`, `accept` khác `answer` sau `normalizeTyped`;
  - đếm: T2–T4 có 76 câu, `s1-t2-w1` có 10 câu, `s1-t2-w2` có 12 câu, các bài khác 6 câu;
  - 4 câu mới có `requires` hợp lệ, có 2 câu `type` và 2 câu `transform`;
  - đáp án của mỗi câu mới qua `matchesTyped` với chính nó viết hoa / bỏ dấu câu;
  - không chứa V2 / V3 trong `IRREGULAR_VERBS` (trừ dạng trùng V1), will / can / some / any / many / because;
  - quiz `lesson-s1-t2-w1` bốc 5 câu với cả `canSpeak` true / false;
  - `requires.test.ts:42` đọc `options` chỉ khi có. Test mini-t2 "chưa học viên nào": số câu bị bỏ thành 10 (6 câu story 33 + 4 câu mới), vẫn 10 câu, mỗi bài T2 ≥ 2 câu, không trùng.
- [x] `src/data/foundation/types.ts` -- `CheckItem` thêm `(CheckBase & { kind: 'type'; prompt: string; answer: string; accept?: readonly string[] })`; màn `faded` thêm `accept?`. Doc comment: `type` là gõ một chỗ trống (`prompt` có `___`) hoặc gõ cả câu theo yêu cầu.
- [x] `src/lib/foundation/player.ts` + `player.test.ts` -- sửa chấm câu luyện:
  - `CheckResponse` thêm `{ kind: 'type'; text: string }`;
  - `isCorrect` câu `type` dùng `matchesTyped`;
  - `answerText` trả `answer`;
  - `isFadedCorrect(answer, typed, accept?)` dùng `matchesTyped`;
  - test cũ vẫn qua, thêm test "are not" = "aren't", câu `type` trả lời dạng `choice` thì sai, `answerText`.
- [x] `src/components/foundation/CheckItemView.tsx` -- thêm nhánh `type` (trước nhánh `sort`), vẽ `TypedAnswer` và nộp `{ kind: 'type', text }`. `KIND_HINTS.type = 'Gõ đáp án'`. Thử lại thì xoá chữ đã gõ. Không thêm class không tiền tố.
- [x] `src/components/foundation/BrickScreen.tsx` + `BrickPlayer.tsx` -- tách phần dùng chung khỏi viên gạch:
  - `CheckScreen` thay prop `brick` bằng `review: ReactNode`;
  - BrickPlayer truyền `<BrickRecap brick={brick} contrast />`;
  - export `EnLine`, `WorkedBody`, `FadedBody`; `FadedBody` truyền `screen.accept` cho `isFadedCorrect`;
  - giao diện và class của viên gạch không đổi.
- [x] `src/data/lessons/types.ts` -- thêm kiểu `TensePractice`:
  - các bước `worked: Omit<WorkedScreen, 'kind'>`, `faded: Omit<FadedScreen, 'kind'>`, `check: Omit<CheckScreenData, 'kind'>`, `apply: Omit<ApplyScreen, 'kind'>`;
  - dùng `import type` từ `@/data/foundation/types`;
  - thêm `Tense.practice?: TensePractice`, doc comment nói rõ: không lưu, không ghi Sổ lỗi (story 35).
- [x] `src/lib/tense-practice.ts` (mới) + `tense-practice.test.ts` -- 2 hàm thuần:
  - `practiceScreens(practice)` trả 4 màn có `kind` theo thứ tự `worked`, `faded`, `check`, `apply`;
  - `practiceProblems(tense)` trả danh sách lỗi theo luật ở Boundaries (rỗng = hợp lệ).
  
  Test cho cả hai hàm, gồm các dữ liệu hỏng: không có `___`, 4 câu luyện, 1 câu dễ hơn, trùng id, `accept` trùng `answer`.
- [x] `src/data/lessons/t2-t4-grammar.ts` -- thêm `PRESENT_CONTINUOUS.practice` đúng chữ trong Design Notes.
- [x] `src/data/lessons/lessons.test.ts` -- thêm describe "luyện có bậc (story 35)":
  - mọi Tense có `practice` thì `practiceProblems` rỗng;
  - `present-continuous` có `practice` với 6 câu luyện, ≥ 3 câu `type`, có ≥ 1 câu biến đổi cả câu;
  - id câu luyện không trùng id câu luyện của mọi viên gạch;
  - chữ tiếng Anh của practice không chứa dạng bị cấm ở Boundaries;
  - đề practice không trùng đề quiz của `s1-t2-w1`;
  - mọi Tense khác chưa có `practice`.
- [x] `src/components/lesson/TensePractice.tsx` (mới) -- khối luyện như Design Notes:
  - trạng thái đóng / mở do cha giữ;
  - khi mở là trình phát 4 bước, dùng `practiceScreens`, `CheckScreen` (`review` = tóm tắt công thức + 3 quy tắc của thì), `WorkedBody`, `FadedBody`, `EnLine`, `CheckItemView`, `SpeakPractice` (tone `gentle`);
  - luồng `CheckFlow` của `@/lib/foundation`;
  - Enter = Tiếp khi bấm được và chưa tới bước cuối;
  - "Luyện lại" tạo seed mới và về bước 1;
  - không gọi hook ghi store nào.
- [x] `src/components/lesson/LessonContentParts.tsx` -- `GrammarSection` giữ `openPracticeId` (`useState<string | null>`). Sau mỗi `TenseCard` có `practice` thì vẽ `<TensePractice …/>` trong Fragment, không thêm wrapper hay class.
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- sửa 2 mục:
  - mục Buổi học (dòng "Sau khi qua hoặc bỏ qua Sân ga") thêm câu: "Thì có phần luyện có bậc (ví dụ mẫu → tự điền → 5–7 câu luyện có Gợi ý, dưới 60% mời xem lại + 2 câu dễ hơn → áp dụng) hiện ngay dưới TenseCard. Sai thì giải thích và làm lại, không ghi Sổ lỗi, không lưu (story 35).";
  - mục Sổ lỗi, dòng "Không ghi Sổ lỗi" thêm "phần luyện của thì".
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- thêm một dòng vào bảng: "Quiz engine | Câu `choice` / `pronunciation` / `listening` và câu gõ `type` / `transform` (story 35) chấm bằng `matchesTyped` (`src/lib/quiz/typed.ts`: hoa thường, dấu câu, n't = not); `pickQuiz` lấy câu chưa gặp trước (`seenQuestionIds`) | Story 9, 27, 35".

**Acceptance Criteria:**
- Given Huy đang ở buổi 30' có Bài chính `s1-t2-w1` ở 375px, when mở khối "Luyện: Hiện tại tiếp diễn" và đi hết 4 bước bằng bàn phím ảo iPhone, then ô gõ không phóng to trang, `scrollWidth` bằng 375, và sau đó Sổ lỗi, `quizzes.attempts`, `progress` không đổi.
- Given cùng buổi đó ở 1280px, when làm câu luyện bằng phím (gõ, Enter nộp, Enter câu tiếp, Enter Tiếp), then mỗi lần nhấn Enter chỉ làm đúng một việc và phím ←/→ của buổi vẫn đổi bước.
- Given máy có TTS và Huy làm `lesson-s1-t2-w1` hai lần liên tiếp, when lần hai bắt đầu, then 5 câu của lần hai không trùng câu nào của lần một.
- Given `/foundation/F01` và `/roadmap/lesson/s1-t1-w1`, when chạy `npm run layout:check`, then ảnh 375px khớp bản gốc (trang không có thì có `practice`).

## Implementation Notes

- **Chấm câu gõ:** `src/lib/quiz/typed.ts` (`normalizeTyped`, `matchesTyped`) là hàm duy nhất. `isAnswerCorrect` (quiz.ts) dùng cho `gradeAttempt`, `QuestionCard`, `Mistakes.tsx`; `isCorrect` / `isFadedCorrect` (player.ts) cho câu luyện `type` và màn faded. `player.ts` import thẳng `@/lib/quiz/typed` (không qua index) và bỏ `checkFill`; `checkFill` / `blanks.ts` giữ nguyên cho video. Ngoài bảng Design Notes còn mở rộng `can not` sau bước n't, và luật "bỏ hết khoảng trắng" như `checkFill`.
- **Kiểu `Question`:** union `ChoiceQuestion | TypedQuestion`, thêm `TYPED_QUESTION_KINDS`, `TypedQuestionKind`, `ChoiceQuestionKind`, `isTypedQuestion`. `T1_QUESTIONS`, `FOUNDATION_QUESTIONS` khai báo là `ChoiceQuestion[]` (dữ liệu không đổi). Test được type-check (`tsconfig.test.json` có trong `tsc -b`), nên các test đọc `options` dùng `'options' in q` hoặc ép `as ChoiceQuestion`. `gemini.ts` có kiểu `ExplainQuestion`; prompt câu chọn đáp án giữ nguyên từng chữ (test khoá 6 dòng đầu).
- **`pickQuiz` + `seen`:** phân hoạch ổn định `unseenFirst` sau mỗi lần `shuffle` (từng bài, phần còn lại, câu thay), không thêm lần gọi random; test chép nguyên `pickQuiz` cũ (`legacyPickQuiz`) và so `toEqual` 24 seed × 2 quiz × có / không TTS. `seenQuestionIds(store)` lấy từ `listGradedAttempts`. Chỉ `DefinedQuizRun` (quiz bài, mini test) truyền `seen`, tính trong `useState` init cùng lúc chốt đề.
- **Dữ liệu:** `t2-t4.ts` có `makeTyped` + `lesson().type` / `.transform` (tag `thì`, đoạn Ngữ pháp, `requires` bắt buộc, `accept` tuỳ chọn); 4 câu `q-s1-t2-w1-07` … `-10` đúng bảng, chưa câu nào cần `accept`. `PRESENT_CONTINUOUS.practice` đúng chữ Design Notes, worked có thêm `timeline` (progress). Thiếu F09 thì quiz bỏ 08–10, thiếu F11 bỏ 07, 09, 10; mini-t2 khi chưa học viên nào bỏ 10 câu.
- **Kiểu Sân ga:** `CheckItem` thêm `type`, màn faded thêm `accept?`, export `WorkedScreen` / `FadedScreen` / `CheckScreenData` / `ApplyScreen` (`Extract<Screen, …>`) để `TensePractice` (lessons/types.ts, `import type`) dùng `Omit<…, 'kind'>`.
- **UI:** `TypedAnswer` (form + nút "Kiểm tra" khoá khi trim rỗng; đã nộp thì thành dòng chỉ đọc; `focus` đưa con trỏ vào ô khi ô hiện, `preventScroll`; `enterKeyHint="done"`, `autoComplete="off"`). `QuestionCard`: câu gõ vẽ `TypedAnswer`, `choiceBindings` với `count: 0` và `choosing: false`, đề `type` có `lang="en"`; không thêm / xoá class (chỉ bọc lưới lựa chọn trong nhánh). `CheckItemView`: nhánh `type` trước nhánh `sort`, "Thử lại" đổi `key` của ô để xoá chữ. `CheckScreen` nhận `review: ReactNode` (BrickPlayer truyền `BrickRecap … contrast`, bỏ `ReviewExplain`); export `EnLine`, `WorkedBody`, `FadedBody` (nhận `Pick<…>` để dùng màn không có `kind`).
- **Khối luyện:** `src/components/lesson/TensePractice.tsx` (đóng: Card + "Bắt đầu luyện"; mở: `PracticePlayer` 4 bước, bước Luyện tập luôn gắn và ẩn như BrickPlayer, `review` = `TenseRecap` công thức + 3 quy tắc, "Bỏ qua, sang Áp dụng" nhảy bước 4, "Luyện lại" đổi `key` → seed mới, "Đóng"). Hàm thuần ở `src/lib/tense-practice.ts`: `practiceScreens`, `practiceProblems`, `hasPractice`, `PracticeTense`, thêm `practiceItemIds` / `practiceEnglishTexts` cho test. `GrammarSection` giữ `openPracticeId`, `Fragment` không wrapper.
- **Lưu ý (không ghi store):** `TensePractice` không gọi hook ghi nào. Riêng `SpeakPractice` ở bước Áp dụng vẫn ghi điểm nói vào `pronunciation` theo id `present-continuous-say-n`, như viên gạch (Code Map yêu cầu vậy); Sổ lỗi, `quizzes.attempts`, `progress` không đổi (đã kiểm trong trình duyệt).
- **Kiểm chứng:** `npm run lint`, `npm test` (78 file, 1837 test), `npm run build` qua. `npm run layout:guard` chỉ báo 2 file mới (`TensePractice.tsx` 48, `TypedAnswer.tsx` 25 class). `npm run layout:check` ĐẠT: 12 route × 5 bề rộng, ảnh 375px trùng bản gốc, thử phím tắt ok. Chrome headless qua CDP (dev server, `VITE_SUPABASE_*` rỗng, store đã bỏ qua Sân ga), 56 bước đều qua:
  - 375px `/roadmap/lesson/s1-t2-w1/grammar`: khối đóng đúng chữ, s1-t2-w2 không có khối; Enter qua bước 1 → 2; faded "are play" sai (Enter trong ô không nhảy bước), "Are  playing." đúng; Enter → bước 3, "Tiếp" khoá; ô gõ `autocapitalize=none`, `autocorrect=off`, `spellcheck=false`, `lang=en`, 16px, có focus; c1 đúng → Enter câu 2; phím 2 chọn sai câu choice; phím 1 không chấm câu gõ; "doesn't working" sai → Thử lại xoá chữ → "isnt working" đúng; sai trật tự ở c4 sai; "are not" đúng cho `aren't`; 2/6 → lời mời, Enter không làm gì, "Xem lại giải thích" hiện quy tắc, 2 câu dễ hơn → "Xong phần luyện tập" → Enter → bước 4 (thông báo, câu mẫu, "Luyện lại"); Enter ở bước cuối không làm gì; `scrollWidth` 375; Luyện lại về bước 1; Đóng; `mistakes` / `quizzes` / `progress` không đổi.
  - Quiz `lesson-s1-t2-w1` hai lần (có TTS): hai đề không trùng câu nào, có câu "Gõ dạng đúng" / "Gõ cả câu", gõ sai hiện "Chưa đúng. Đáp án: …", màn kết quả ghi "Bạn gõ:", `answers[].chosen` và `lastChosen` là chữ đã gõ; ôn Sổ lỗi chấm 4 câu gõ bằng ô gõ; Sổ lỗi ghi "bạn gõ".
  - Chưa kiểm: bàn phím ảo iPhone thật, buổi 30' với bài hiện tại là s1-t2-w1 (cùng `GrammarSection` nên khối hiện như ở trang bài), phím ←/→ của buổi khi khối đang mở.

## Spec Change Log

- **Review lần 1 (2026-11-12), sửa phần frozen theo quyền chạy liên tục của Huy:**
  - Finding: blind #9, edge #7. Boundaries ghi "không ghi store", hàng I/O "Áp dụng" ghi "Không ghi gì vào store", nhưng chính Design Notes / Code Map bắt bước 4 dùng `SpeakPractice` (ghi `pronunciation` như viên gạch). Spec tự mâu thuẫn. Cách sửa hợp với quyết định 4 (dùng lại tối đa bộ máy Sân ga) là sửa chữ: chỉ điểm nói được ghi, như viên gạch; Sổ lỗi, `quizzes.attempts`, `progress`, điểm Nhà vẫn không đổi. Đã sửa Boundaries, hàng I/O, `learning-rules.md` và doc comment (`TensePractice.tsx`, `tense-practice.ts`, `lessons/types.ts`). Trạng thái tránh được: tài liệu nói "không lưu gì" trong khi điểm nói vẫn đồng bộ.
  - Finding: blind #12. Ví dụ dạng `type` trong Intent ("She (not / go) ___ yesterday.") đặt gợi ý trước chỗ trống và dùng quá khứ, trái với dữ liệu thật ("___ (cue)"). Đã đổi ví dụ thành "She ___ (not / work) today." và thêm test: đề `type` có ngoặc thì ngoặc đứng ngay sau `___`.
  - KEEP: toàn bộ code đã qua (chấm `matchesTyped`, union `Question`, `pickQuiz` + `seen`, khối luyện 4 bước, dữ liệu mẫu hiện tại tiếp diễn) giữ nguyên; chỉ thêm các patch nhỏ ở Review Triage Log.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind #1 | Bộ gõ Telex / VNI còn bật làm câu gõ đúng thành sai và vào Sổ lỗi | medium | `normalizeTyped` giữ mọi `\p{L}`, "isnt" gõ Telex thành "ínt"; `lang="en"` không tắt bộ gõ. Huy là người Việt, gõ trên máy có bộ gõ | patch: `hasVietnameseMarks` (typed.ts) + `TypedAnswer` và màn faded không chấm, nhắc "tắt bộ gõ tiếng Việt"; test |
| 2 | blind #2 | `'s` chỉ có một chiều, gõ "She's cooking" cho đáp án "She is cooking" bị sai | low | Đúng như Design Notes ("'s không mở rộng, người soạn ghi vào `accept`"); chưa câu nào hiện có bị ảnh hưởng nhưng story 36–37 sẽ có | patch: test dữ liệu buộc câu gõ (quiz và luyện) có `he/she/it is` hoặc `'s` phải có `accept` |
| 3 | blind #3 | Câu gõ đúng sau chuẩn hoá ("isnt working") không được chỉ cách viết chuẩn | medium | `QuestionCard` / `CheckItemView` chỉ hiện "Lumos! Chính xác." khi đúng; màn faded thì có hiện đáp án. Trái mục tiêu "tự làm ra câu đúng" | patch: `TypedAnswer` nhận `answer`, đúng mà chữ gõ khác thì hiện "Viết chuẩn: …" |
| 4 | blind #4 | Prompt Gemini câu gõ không nói cách chấm, vẫn ghi "đáp án đã chọn sai" | low | `buildExplainPrompt` dòng "Lỗi sai: vì sao đáp án đã chọn sai." dùng cho mọi dạng | patch: câu gõ thêm dòng "Cách chấm: …" và "vì sao câu đã gõ sai"; câu chọn giữ nguyên từng chữ; test |
| 5 | blind #5 | Test chữ cấm của 4 câu quiz mới yếu hơn test của practice | low | `questions.test.ts` BANNED thiếu -ed, didn't, wasn't, weren't, 'll; `lessons.test.ts` có -ed / didn't / 'll nhưng cũng thiếu wasn't / weren't | patch: thêm -ed, didn't, wasn't, weren't, 'll vào test quiz; wasn't / weren't vào test practice |
| 6 | blind #6 | Test "đề practice ≠ đề quiz" cứng `present-continuous` / `s1-t2-w1`, chỉ so chuỗi đúng | low | `lessons.test.ts` dùng `pc()` và `lessonId === 's1-t2-w1'` | patch: lặp mọi bài trong `LESSON_CONTENTS` có thì có practice, so sau `normalizeTyped` và bỏ gợi ý trong ngoặc |
| 7 | blind #7 | Bước Áp dụng mời "nói hoặc viết" nhưng không có ô viết / câu kiểm | low | Intent chọn bước áp dụng như viên gạch ("nói hoặc viết câu về bạn", `item` tuỳ chọn); dữ liệu mẫu Design Notes không có `item`; câu dịch Việt → Anh là việc story 36 | reject (đúng thiết kế đã chốt) |
| 8 | blind #8 | Spec mâu thuẫn chuyện test có được type-check | low | Thật: `tsconfig.json` tham chiếu `tsconfig.test.json` (include `src/**/*.test.ts`), nên test **có** type-check; dòng Code Map sai, Implementation Notes đúng. Không ảnh hưởng code | reject (sửa spec của chính build này; ghi lại ở đây để story sau đọc đúng) |
| 9 | blind #9 | "Không lưu gì" sai: `SpeakPractice` ghi điểm nói | medium | `SpeakPractice` gọi `usePronunciation().apply` → `store.data.pronunciation[present-continuous-say-n]`, đồng bộ và vào `pronunciationAverage` (placement gaps). Boundaries frozen tự mâu thuẫn với Design Notes | patch + sửa frozen (Spec Change Log): chỉ điểm nói được ghi như viên gạch; sửa learning-rules.md và doc comment |
| 10 | blind #10 | AC 1 (bàn phím iPhone thật) và một phần AC 2 (buổi 30', ←/→) chưa chạy | medium | Implementation Notes ghi "Chưa kiểm". Đọc code: `TensePractice` chỉ bind `Enter` (`useHotkeys({ Enter }, canNext && !isLast)`), không bind ←/→, nên phím bước của buổi không bị chiếm; phần iPhone thật không kiểm được ở đây | defer (deferred-work + việc Huy kiểm tay) |
| 11 | blind #11 | Ưu tiên câu chưa gặp là "tất cả hoặc không": từ lần 3 lại ngẫu nhiên | low | Đúng hành vi, nhưng là thiết kế frozen: hàng I/O "Đã gặp hết → Bốc ngẫu nhiên như cũ" | reject (đúng intent đã chốt; LRU là cải tiến cho story sau nếu cần) |
| 12 | blind #12 | Ví dụ dạng `type` ("She (not / go) ___ yesterday.") trái dữ liệu thật | low | `questions/types.ts` doc comment và Intent dùng ví dụ này; mọi câu thật là "___ (cue)" | patch: sửa doc comment, sửa ví dụ trong Intent (Spec Change Log), test ngoặc đứng ngay sau `___` |
| 13 | blind #13 | Phần tiếng Anh trong đề trộn Việt–Anh không có `lang="en"` | low | `QuestionPrompt` để `lang` undefined cho `transform`; `CheckItemView` đề không có `lang` (có từ trước cho mọi câu luyện viên gạch). Chỉ ảnh hưởng trình đọc màn hình; sửa phải tách chuỗi | reject (ít gặp, sửa thêm nhánh tách chuỗi) |
| 14 | blind #14 + edge #6 | `hadn't` / `needn't` / `mightn't` không mở rộng; luật bỏ khoảng trắng nhận "isnot", "Iam" | low | Danh sách cố định trong `typed.ts` thiếu các dạng này; luật bỏ khoảng trắng là luật Design Notes chép từ `checkFill` | patch: thêm hadn't / needn't / mightn't (có và thiếu nháy), ghi `'d` không mở rộng; ghi giới hạn "isnot" / "Iam" ở Design Notes và doc comment, thêm test |
| 15 | edge #1 | Câu gõ chưa nộp, con trỏ ngoài ô, nhấn Enter là sang câu: câu bỏ trống bị chấm sai và vào Sổ lỗi | medium | `choiceBindings` với `choosing: false` thì bind `Enter → next`; `QuestionCard` truyền `next: onNext` kể cả khi chưa trả lời; `QuizRun.next` sang câu, `gradeAttempt` chấm `''` là sai | patch: `next: answered ? onNext : undefined` |
| 16 | edge #2 | Câu `type` mà gõ cả câu thì bị sai | low | Đúng, nhưng nhãn ô ghi "Dạng đúng điền vào chỗ trống" và đề có `___`; sửa phải thêm nhánh dựng câu đầy đủ từ đề | reject (ít gặp, sửa thêm nhánh) |
| 17 | edge #3 | Nháy `´` / `′` / `＇` không được đổi thành nháy thẳng | low | `normalizeTyped` chỉ đổi `‘’ʼ` và backtick; "don´t" thành "don t" | patch: thêm 3 ký tự vào lớp ký tự; test |
| 18 | edge #4 | Ô gõ không giới hạn độ dài, chuỗi dài vào `quizzes.attempts` / Sổ lỗi đồng bộ | low | `<input>` không có `maxLength` | patch: `maxLength={200}` |
| 19 | edge #5 | "Chỉ nới thêm" sai: `checkFill` nhận "im" cho "I'm", `matchesTyped` thì không | low | `forGrading` bỏ nháy cả hai bên; `matchesTyped` chỉ mở rộng phía có nháy. Đáp án faded f01–f18 và practice hiện là từ không rút gọn, nên dữ liệu hiện tại không đổi | patch: test dữ liệu: mọi cách gõ `checkFill` nhận thì `isFadedCorrect` cũng nhận (chặn dữ liệu sau này) |
| 20 | vgap | Chỗ nối ở trang (`DefinedQuizRun` truyền `seen`, `Mistakes.tsx` chấm bằng `isAnswerCorrect`) không có test | medium | Gap đã được reviewer kiểm: repo không có test component / page (không `.test.tsx`, không jsdom) | defer (cùng gốc "cần môi trường test component" ở story 16, 31, 34) |

## Design Notes

**Chuẩn hoá `normalizeTyped`** (theo thứ tự):
1. Chuyển sang chữ thường. Đổi `’ ‘ ʼ ´ ′ ＇` và dấu backtick thành `'`.
2. Mở rộng rút gọn **có nháy** theo ranh giới từ:
   - `won't` → `will not`, `can't` → `cannot`, `X n't` → `X not` (don't, doesn't, didn't, isn't, aren't, wasn't, weren't, haven't, hasn't, hadn't, shouldn't, mustn't, couldn't, wouldn't, needn't, mightn't). `'d` không mở rộng, như `'s`;
   - `i'm` → `i am`;
   - `you're / we're / they're` → `… are`;
   - `i've / you've / we've / they've` → `… have`;
   - `i'll / you'll / he'll / she'll / it'll / we'll / they'll` → `… will`.
3. Mở rộng các dạng n't gõ **thiếu nháy**, chỉ trong danh sách cố định: dont, doesnt, didnt, isnt, arent, wasnt, werent, havent, hasnt, hadnt, wont, cant, shouldnt, mustnt, couldnt, wouldnt, neednt, mightnt.
4. Đổi `can not` → `cannot`.
5. Bỏ mọi dấu câu còn lại, kể cả nháy. Gộp khoảng trắng, trim.

`matchesTyped` chấm đúng khi chuỗi gõ sau chuẩn hoá khác rỗng và bằng `answer` hoặc một mục `accept` sau chuẩn hoá. Như `checkFill`, hai chuỗi cũng được coi là bằng nhau khi giống nhau sau khi bỏ hết khoảng trắng. Giới hạn đã biết của luật này: "isnot", "Iam not", "everyday" / "every day" tính đúng. `checkFill` giữ nguyên.

Ô gõ (`TypedAnswer`, màn faded) không chấm chữ có dấu tiếng Việt (`hasVietnameseMarks`, bộ gõ Telex / VNI còn bật) mà nhắc tắt bộ gõ rồi gõ lại. Chấm đúng mà chữ gõ khác cách viết chuẩn thì hiện "Viết chuẩn: …".

| Đáp án | Gõ | Kết quả |
|---|---|---|
| `isn't working` | `is not working` / `isnt working` / `ISN’T working.` | đúng |
| `I am not writing an email.` | `i'm not writing an email` | đúng |
| `We're cooking.` | `were cooking` | sai |
| `She's cooking.` | `she is cooking` | sai, trừ khi có trong `accept` |
| `Are they waiting for the bus?` | `They are waiting for the bus?` | sai |
| bất kỳ | `   ` | sai |

**`pickQuiz` với `seen`:** mọi lời gọi `shuffle` giữ nguyên thứ tự và số lần. Sau mỗi lần xáo (`groups[i]`, `rest`, `spare`), xếp lại bằng phân hoạch ổn định: câu không thuộc `seen` lên trước, giữ nguyên thứ tự xáo trong từng phần. `seen` rỗng thì phân hoạch không đổi gì, nên kết quả trùng bản cũ.

**Khối luyện (`TensePractice`):**
- Lúc đóng: Card có tiêu đề "Luyện: {tense.name}", mô tả "Ví dụ mẫu → tự điền → {n} câu luyện → áp dụng. Sai thì làm lại, không ghi Sổ lỗi." và nút "Bắt đầu luyện".
- Lúc mở:
  - header "Bước {i}/4 · {SCREEN_TITLES[kind]}", thanh tiến độ, nút "Đóng";
  - nội dung bước;
  - nav "Quay lại bước trước" / "Tiếp", giống BrickPlayer.
- Bước 4 hiện:
  - thông báo "Xong phần luyện {tense.name}! Dùng ngay điều vừa luyện:";
  - `promptVi`;
  - câu mẫu có `EnLine`;
  - `item` (nếu có) bằng `CheckItemView`;
  - `SpeakPractice`;
  - nút "Luyện lại".

**Dữ liệu mẫu `PRESENT_CONTINUOUS.practice`** (người làm có thể sửa chữ nhưng phải giữ dạng câu và đáp án):
- worked: "She is cooking dinner now." / "Bây giờ cô ấy đang nấu bữa tối." / noteVi "Cần đủ hai phần: is (vì she) + cooking (V-ing). Tiếng Việt chỉ cần "đang", tiếng Anh bắt buộc cả hai."
- faded: "They ___ (play) football now." → `are playing` / "Bây giờ họ đang chơi bóng đá." / hintVi "they đi với are; play thêm -ing."
- check:
  - c1 type "I ___ (read) a book now." → `am reading`;
  - c2 choice "___ he sleeping?" [Is, Does, Are] → Is;
  - c3 type "She ___ (not / work) today." → `isn't working`;
  - c4 type "Đổi sang câu hỏi: You are listening to music." → `Are you listening to music?`;
  - c5 type "We ___ (sit) in the garden." → `are sitting` (gấp đôi t);
  - c6 type "Are they working now? — No, they ___." → `aren't`.
- easier:
  - e1 choice "I ___ watching TV." [am, is, are];
  - e2 choice "She is ___ now." [cooking, cook, cooks].
- apply:
  - promptVi "Nói hoặc viết 3 câu về việc bạn và người quanh bạn đang làm lúc này.";
  - sampleEn "I am learning English. My friend is working.";
  - speak `present-continuous-say-1` "I am learning English now." và `-say-2` "My friend is working today.".

**4 câu quiz mới (s1-t2-w1):**

| Id | Dạng | Đề | Đáp án | `requires` |
|---|---|---|---|---|
| 07 | type | "Listen! The baby ___ (cry)." | `is crying` | imperatives, articles, be-affirmative |
| 08 | type | "My brother ___ (not / study) now. He is sleeping." | `isn't studying` | possessive-adjectives, subject-pronouns, be-affirmative, be-negative |
| 09 | transform | "Đổi sang câu hỏi: They are waiting for the bus." | `Are they waiting for the bus?` | subject-pronouns, articles, be-questions |
| 10 | transform | "Đổi sang câu phủ định: I am writing an email." | `I am not writing an email.` | subject-pronouns, articles, be-negative |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: cả ba đều qua. `tsc -b` không báo lỗi thu hẹp kiểu `Question`.
- `npm run layout:guard` -- expected: chỉ báo class của `src/components/lesson/TensePractice.tsx` và `src/components/quiz/TypedAnswer.tsx` (file mới), không báo file cũ nào.
- `npm run layout:check` (cần Chrome) -- expected: không cuộn ngang ở 5 bề rộng, ảnh 375px của mọi route khớp commit gốc.

**Manual checks (if no CLI):**
- Chrome headless hoặc điện thoại, 375px, store đã bỏ qua Sân ga và đang ở `s1-t2-w1`:
  - buổi 30' có khối luyện dưới TenseCard, đi hết 4 bước được, Enter không nhảy hai bước;
  - quiz bài có câu gõ: chấm "is not working" đúng, câu sai vào Sổ lỗi với "bạn gõ";
  - ôn Sổ lỗi câu gõ chạy được.
