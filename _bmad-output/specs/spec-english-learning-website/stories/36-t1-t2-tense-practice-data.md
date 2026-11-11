---
title: 'Soạn bài luyện thì T1–T2: phần luyện có bậc và 12 câu mỗi thì (CAP-11, CAP-19, learning-rules "Buổi học", "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: 'fce889a5c20d7e67d5d95321eef39d9100e78b85'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/35-tense-practice-typed-questions.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/33-past-to-be-wh-did.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/27-t1-patch-untaught-question-filter.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời "hoàn thiện giúp tôi đi" ngày 2026-11-11 sau báo cáo kiểm tra "nền & các thì", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" nghĩa là Huy **tự làm ra** câu đúng thì (gõ, biến đổi, dịch Việt → Anh, nói), không chỉ nhận ra đáp án. Story 35 làm bộ máy, story 36 soạn dữ liệu cho các thì T1–T2 (báo cáo kiểm tra, mục C1, C2; story 36 cần có trước khi Huy vào T2).
- Quyết định 4: dùng lại tối đa bộ máy đã có (`Tense.practice`, `TensePractice`, câu quiz `type` / `transform`, `matchesTyped`, `requires`), không dựng hệ mới.
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn (không chép sách, British Council, web có bản quyền); chỉ dùng kiến thức đã dạy; giao diện 375px không đổi; không đổi schema store.
- Claude chọn:
  - **6 thì trong phạm vi:** hiện tại đơn khẳng định (`present-simple`, s1-t1-w2), hiện tại đơn câu hỏi và phủ định (`present-simple-questions`, s1-t1-w3), hiện tại tiếp diễn (`present-continuous`, s1-t2-w1), to be quá khứ (`past-to-be`, s1-t2-w2), quá khứ đơn có quy tắc (`past-simple`, s1-t2-w2), bất quy tắc (`past-simple-irregular`, s1-t2-w3). `to-be` (s1-t1-w1) chỉ là phần ôn F13–F14, viên gạch đã có luyện, nên không thêm.
  - **"12–20 câu mỗi thì" là số câu quiz nhãn `thì` của thì đó trong ngân hàng, tính cả câu cũ.** Chọn đúng **12 câu mỗi thì** (cận dưới, vì quiz bài chỉ bốc 5 câu và `pickQuiz` đã lấy câu chưa gặp trước). Cần thêm 44 câu mới.
  - **Mọi câu quiz mới là câu gõ** (`type` / `transform`), không thêm câu `choice`. Lý do: `owlTensePool` lấy mọi câu `choice` nhãn `thì` của chặng 1, thêm câu chọn sẽ đổi đề O.W.L. (việc của story 40).
  - **Ba dạng câu gõ:**
    - "gõ dạng đúng" (`type`, một `___`);
    - "biến đổi" (`transform`, đề bắt đầu "Đổi …:", ví dụ "Đổi sang câu hỏi:", "Đổi chủ ngữ sang She:");
    - "dịch Việt → Anh" (`transform`, đề bắt đầu "Dịch sang tiếng Anh:" và luôn có từ gợi ý trong ngoặc ở cuối).
    
    Mỗi thì có ít nhất 3 câu gõ dạng đúng, 2 câu biến đổi, 2 câu dịch (tính cả 4 câu gõ của story 35).
  - **Câu dịch chỉ chấm ngữ pháp, không chấm từ vựng:** ngoặc gợi ý cho đủ từ nội dung ở dạng nguyên mẫu (động từ V1, danh từ kèm mạo từ khi cần). Huy phải tự làm ra trợ động từ, đuôi -s / -ed / -ing, V2, was / were, not, đảo câu hỏi. Trạng ngữ thời gian đặt cuối câu và `accept` có thêm bản đặt trạng ngữ lên đầu.
  - **Phần luyện có bậc cho 5 thì còn thiếu** (đủ 4 bước như hiện tại tiếp diễn): 6 câu luyện (≥ 3 câu gõ, có ≥ 1 câu biến đổi và ≥ 1 câu dịch), 2 câu dễ hơn, bước áp dụng có 2 câu nói. `present-continuous` thêm 1 câu dịch (`present-continuous-c7`), để cả 6 thì đều có câu dịch trong phần luyện.
  - **"Chỉ dùng kiến thức đã dạy" được kiểm theo từng thì:**
    - mọi câu quiz mới có `requires` hợp lệ. `requires` chỉ dùng khái niệm viên gạch và khái niệm bài T1 đã có; khái niệm cho bài T2 là việc của story 47;
    - chữ tiếng Anh của câu mới và của phần luyện qua một bảng phạm vi theo thì (`src/lib/tense-scope.ts`), ví dụ bài T1 không có quá khứ hay be + V-ing, bài was / were không có -ed hay V2 khác.
  - **Id ổn định:** câu cũ giữ id và chữ. Câu mới nối tiếp id lớn nhất của bài, không dùng lại id đã bỏ (q-s1-t1-w2-06, q-s1-t1-w3-05), để Sổ lỗi cũ không trỏ nhầm câu.

**Problem:** Sau story 35 mới có hiện tại tiếp diễn là có phần luyện và câu gõ. Các thì còn lại của T1–T2 vẫn chỉ có 3–5 câu trắc nghiệm, nên Huy chưa bao giờ phải tự gõ "doesn't live", "Were you…?", "went".

**Approach:** Chỉ thêm dữ liệu: `practice` cho 5 thì (thêm 1 câu dịch vào phần luyện hiện tại tiếp diễn), 44 câu quiz gõ / biến đổi / dịch có `requires`, một bảng phạm vi chữ theo thì để test chặn nội dung vượt bài. Không đổi UI, không đổi bộ máy chấm hay chọn câu.

## Boundaries & Constraints

**Always:**
- Số câu và id đúng bảng "Số câu và id" ở Design Notes. Sau story này T1 có 42 câu, T2–T4 có 102 câu, `QUESTION_BANK` có 144 câu.
- Câu quiz mới:
  - `kind` là `type` hoặc `transform`; tag `thì`; đoạn `grammar`;
  - có `requires` không rỗng và `requiresViolations` rỗng. Câu có tên thứ / tháng phải khai báo `days-months` (test story 34);
  - `type` có đúng một `___`, gợi ý trong ngoặc đứng ngay sau chỗ trống;
  - `transform` khớp một trong hai mẫu đề ở Design Notes (biến đổi / dịch);
  - `answer` và mọi `accept` không có dấu tiếng Việt, không trùng nhau sau `normalizeTyped`. Đáp án có `he / she / it is` hoặc `'s` thì có `accept` cho dạng kia (luật story 35);
  - câu `transform` có đáp án kết thúc bằng trạng ngữ thời gian trong bảng `TIME_TAILS` (Design Notes) thì `accept` có bản đặt trạng ngữ lên đầu câu;
  - `explanation` tiếng Việt nói rõ vì sao chọn dạng đó (chủ ngữ nào, dấu hiệu nào, quy tắc chính tả nào).
- Phần luyện mới:
  - `practiceProblems` rỗng;
  - 6 câu luyện chính, 2 câu dễ hơn (câu `choice`). Câu luyện có ≥ 3 câu `type`, trong đó ≥ 1 câu biến đổi cả câu ("Đổi …:") và ≥ 1 câu dịch ("Dịch sang tiếng Anh: … (…)"). Câu dịch có đáp án kết thúc bằng trạng ngữ trong `TIME_TAILS` thì `accept` có bản đặt trạng ngữ lên đầu, như câu quiz;
  - `worked` có `timeline` cùng `kind` với thì;
  - bước áp dụng có `promptVi`, `sampleEn` và 2 câu nói `${tense.id}-say-1`, `-say-2`.
- Đề của phần luyện không trùng đề quiz của cùng bài (test story 35 đã có). Đề phần luyện của hai thì cùng bài không trùng nhau. Đáp án câu quiz mới không trùng nguyên câu ví dụ (`examples[].en`) của TenseCard cùng bài (quiz đo quy tắc, không đo trí nhớ câu mẫu).
- Chữ tiếng Anh của câu mới và phần luyện nằm trong phạm vi của thì (bảng "Phạm vi chữ theo thì" ở Design Notes). Riêng `did` được phép là lựa chọn sai trong câu `choice` của phần luyện `past-to-be` (so sánh "Were you…?" với "Did you…?").
- Nội dung phủ đủ các điểm ở bảng "Phải phủ" (Design Notes).
- `owlTensePool(QUESTION_BANK)` vẫn đúng 57 câu như baseline. Đề O.W.L. cùng seed không đổi.

**Never:**
- Không làm việc của story sau:
  - phần luyện / câu cho will, going to, hoàn thành, modal, so sánh, bị động (37);
  - thẻ quy tắc cho thì, thẻ động từ bất quy tắc, bảng che cột (38);
  - `signalWords`, khối "Chọn thì", "Đừng dịch từng chữ" (39);
  - câu gõ trong O.W.L., mini-t3 (40);
  - kiểm tra cuối Bài chính (41);
  - lượng từ some / any / many, liên từ, why / how often (43, 44);
  - khái niệm `requires` cho bài T2, `requires` cho câu T2–T4 cũ, chia Ngữ pháp theo ngày (47);
  - câu phát âm / câu nghe was / were ở t2w2 (mục còn treo trong deferred-work).
- Không thêm câu `choice` / `listening` / `pronunciation` vào ngân hàng. Không sửa chữ, đáp án, id, `requires` của câu cũ (trừ việc thêm `present-continuous-c7` vào phần luyện của story 35).
- Không đổi code chạy:
  - component, `matchesTyped`, `pickQuiz`, `planQuiz`, `requiresViolations`, `owlTensePool`, `pickComebackTest`;
  - `LESSON_QUIZ_SIZE`, `MIN_QUIZ_QUESTIONS`, định nghĩa `QUIZZES`;
  - schema store, `plan.ts`.
- Không nới assertion cũ thành `>=` để test qua. Test đếm cũ được sửa về đúng số mới và giữ ý của test.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Khối luyện ở 5 bài | Mở đoạn Ngữ pháp của s1-t1-w2, s1-t1-w3, s1-t2-w1, s1-t2-w2, s1-t2-w3 (trang bài hoặc bước Bài chính) | Dưới mỗi TenseCard của 6 thì có khối "Luyện: {tên thì}" đóng sẵn (s1-t2-w2 có 2 khối). s1-t1-w1, s1-t2-w4 và mọi bài T3–T4 không có khối | N/A |
| Hai khối một bài | s1-t2-w2: đang mở khối `past-to-be`, bấm "Bắt đầu luyện" ở khối `past-simple` | Khối đầu đóng, khối sau mở (hành vi story 35) | N/A |
| Luyện hiện tại đơn | Màn điền một chỗ `present-simple`: "She ___ (watch) TV every evening.", gõ "watchs" rồi "Watches." | "watchs" sai (hiện gợi ý -es), "Watches." đúng | N/A |
| Quiz câu dịch | `q-s1-t1-w3-15` "Dịch sang tiếng Anh: Cô ấy không uống cà phê. (drink, coffee)", gõ "she does not drink coffee" / "She don't drink coffee." | Câu đầu đúng (n't = not). Câu sau sai: "Chưa đúng. Đáp án: She doesn't drink coffee.", vào Sổ lỗi với "bạn gõ" | Gõ có dấu tiếng Việt: nhắc tắt bộ gõ, không chấm (story 35) |
| Trạng ngữ đầu câu | `q-s1-t2-w3-13` (đáp án "He bought a new bike last week."), gõ "Last week he bought a new bike" / "He buyed a new bike last week." | Câu đầu đúng (`accept`). Câu sau sai | N/A |
| Biến đổi sang quá khứ | `q-s1-t2-w2-20` "Đổi sang quá khứ (last Sunday): I play football.", gõ "I played football last Sunday" / "I play football last Sunday." | Câu đầu đúng, câu sau sai | N/A |
| Quiz bài lấy câu chưa gặp | Có TTS, làm `lesson-s1-t1-w2` (15 câu) 3 lần liên tiếp, mỗi lần nộp hết | 3 đề không trùng câu nào, gộp lại đủ 15 câu | N/A |
| Thiếu nền | Chưa học viên nào (Sân ga chưa bỏ qua) | mini-t2 vẫn ra 10 câu, mỗi bài T2 ≥ 2 câu (câu cũ không có `requires`). Quiz bài T1 theo luật story 27 (đủ câu thì chạy, không đủ thì mời học viên thiếu) | `skipped` > 0 |
| O.W.L. không đổi | `pickOwlTenses(QUESTION_BANK, seed)` | Đúng 57 câu trong pool, cùng seed ra cùng đề như baseline | N/A |
| Sổ lỗi cũ | Store có lỗi của `q-s1-t1-w2-01`, `q-s1-t2-w2-07` | Tra ra đúng câu cũ, chữ không đổi. Không câu mới nào mang id đã bỏ | N/A |
| Nội dung vượt bài | Dữ liệu thử: câu luyện `present-simple` có "She is cooking" hoặc "went"; câu `past-to-be` có "worked" | `outOfScopeWords` trả các từ đó (test tự kiểm), test dữ liệu báo lỗi | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/t1-grammar.ts` -- `PRESENT_SIMPLE` (:65), `PRESENT_SIMPLE_QUESTIONS` (:105): thêm `practice`. `TO_BE` không đổi. File chỉ `import type` từ `./types`.
- `src/data/lessons/t2-t4-grammar.ts`:
  - `PRESENT_CONTINUOUS.practice` (:51-145): mẫu dữ liệu phần luyện. Thêm `present-continuous-c7` (câu dịch) vào `check.items`;
  - `PAST_TO_BE` (:146), `PAST_SIMPLE` (:206), `PAST_SIMPLE_IRREGULAR` (:248): thêm `practice`. Giữ nguyên `ruleCards`, `spellId`, ví dụ.
- `src/data/lessons/types.ts:173-195` -- `Tense.practice`, `TensePractice`. Không đổi.
- `src/data/foundation/types.ts:187-248` -- `CheckItem` (`choice` 3 lựa chọn, `type` có `accept?`), `BrickTimeline`. Không đổi.
- `src/lib/tense-practice.ts` -- `practiceProblems`, `practiceEnglishTexts`, `practiceItemIds`, `hasPractice`. Không đổi; test dùng lại.
- `src/data/questions/t1.ts`:
  - `T1_QUESTIONS: readonly ChoiceQuestion[]` viết object đầy đủ;
  - đổi kiểu thành `readonly Question[]` và thêm một hàm dựng câu gõ nhỏ trong file (tag `thì`, đoạn `grammar`, `requires` bắt buộc, `accept` tuỳ chọn), như `makeTyped` ở `t2-t4.ts`;
  - id lớn nhất hiện có: w2 là `-07`, w3 là `-07`. Id đã bỏ: w2-06, w3-05, w4-03, w4-06;
  - sửa chú thích đầu file (24 → 42 câu).
- `src/data/questions/t2-t4.ts` -- `lesson()` đã có `.type` / `.transform` (story 35). Thêm câu vào khối `t2w1`, `t2w2`, `t2w3`. Sửa chú thích đầu file (76 → 102 câu, số câu từng bài).
- `src/data/questions/concepts.ts` -- `requiresViolations`, `T1_LESSON_CONCEPTS`: câu T1 chỉ dùng khái niệm của chính bài hoặc bài T1 trước. Câu T2 dùng khái niệm nào cũng được, miễn có người dạy. Không đổi.
- `src/data/questions/index.ts` -- `QUESTION_BANK`, `QUIZZES` (`lessonQuizzes` tự có quiz bài). Không đổi.
- `src/lib/quiz/typed.ts` -- `normalizeTyped`, `matchesTyped`, `hasVietnameseMarks` (export qua `@/lib/quiz`). Không đổi; test dùng.
- `src/lib/owl/owl.ts:131-138` -- `owlTensePool` (57 câu ở baseline). Không đổi.
- `src/lib/comeback/comeback.ts:71` -- `pickComebackTest` nhận cả câu gõ (đã chạy từ story 35). Không đổi.
- Test cần cập nhật:
  - `src/data/questions/questions.test.ts:79-98` (T1 24 câu, 6 câu mỗi bài; T2–T4 76 câu, đếm theo bài);
  - `src/data/questions/requires.test.ts:28-52` (24 câu T1; test "không có quá khứ" chỉ đọc `prompt` / `explanation` / `options`, cần đọc thêm `answer` / `accept` của câu gõ);
  - `src/lib/quiz/requires.test.ts:62-283`: số câu bị bỏ / số câu còn của quiz W1–W3 T1, quiz s1-t2-w1 / w2, mini-t1 / mini-t2;
  - `src/data/lessons/lessons.test.ts:547-638` (describe story 35):
    - `FORBIDDEN` cố định cho mọi thì: đổi sang `outOfScopeWords` theo từng thì;
    - present-continuous "6 câu luyện": đổi thành 7;
    - "mọi Tense khác chưa có practice": đổi thành đúng 6 thì của story này;
  - `src/lib/quiz/quiz.test.ts`, `src/lib/comeback/comeback.test.ts`, `src/lib/owl/owl.test.ts`: chỉ sửa nếu có assertion phụ thuộc số câu.
- `src/data/foundation/foundation.test.ts:735-765` -- câu có `requires` mà chứa tên thứ / tháng thì phải khai báo `days-months`. Tên thứ / tháng phải có trong bảng F06.
- Vitest env `node`, chỉ chạy `src/**/*.test.ts`. Test được type-check qua `tsconfig.test.json`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/tense-scope.ts` (mới) -- hàm thuần cho bảng "Phạm vi chữ theo thì":
  - `TENSE_SCOPE_IDS`: 6 id thì;
  - `outOfScopeWords(tenseId, englishText, opts?: { wrongOption?: boolean })` trả các từ / cụm ngoài phạm vi (chữ thường, nháy cong coi như nháy thẳng);
  - `NOT_PAST`: từ đuôi -ed không phải quá khứ (need, red, bed, speed, tired, bored, excited, interested, married);
  - doc comment ghi story 37 sẽ thêm thì T3–T4.
  
  Hàm không được app import, chỉ test dùng.
- [x] `src/lib/tense-scope.test.ts` (mới) -- tự kiểm hàm, mỗi cột của bảng phạm vi có ít nhất một ca:
  - `present-simple`: "She is cooking", "went", "doesn't", "Do you like tea?", "will", "some" đều bị báo; "She watches TV every evening." và "I am tired." thì không;
  - `present-simple-questions`: "Does she work?" không bị báo; "worked" bị báo;
  - `past-to-be`: "worked", "didn't", "went" bị báo; "did" bị báo khi `wrongOption` không bật, không bị báo khi bật; "They were tired." không bị báo;
  - `past-simple`: "stopped", "didn't", "was" không bị báo; "went", "had" bị báo;
  - `past-simple-irregular`: "went", "bought", "had" không bị báo; "gone", "eaten", "been" bị báo;
  - mọi thì: "going to", "gonna", "can", "'ll", "because", "so", "many" bị báo.
- [x] `src/data/lessons/t1-grammar.ts` -- thêm `PRESENT_SIMPLE.practice` và `PRESENT_SIMPLE_QUESTIONS.practice` theo luật ở Boundaries và mẫu ở Design Notes.
- [x] `src/data/lessons/t2-t4-grammar.ts` -- thêm phần luyện:
  - `PAST_TO_BE.practice`, `PAST_SIMPLE.practice`, `PAST_SIMPLE_IRREGULAR.practice`;
  - `present-continuous-c7` (câu dịch) đúng Design Notes;
  - chú thích một dòng trên mỗi `practice`: phạm vi chữ và luật không trùng đề quiz.
- [x] `src/data/questions/t1.ts` -- thêm câu gõ:
  - hàm dựng câu gõ;
  - 9 câu `q-s1-t1-w2-08` … `-16` và 9 câu `q-s1-t1-w3-08` … `-16`;
  - golden `q-s1-t1-w2-08`, `q-s1-t1-w3-15` đúng Design Notes;
  - kiểu export `readonly Question[]`, chú thích đầu file.
- [x] `src/data/questions/t2-t4.ts` -- thêm câu gõ:
  - `q-s1-t2-w1-11` … `-14`;
  - `q-s1-t2-w2-13` … `-19` (`past-to-be`) và `-20` … `-26` (`past-simple`);
  - `q-s1-t2-w3-07` … `-14`;
  - golden `q-s1-t2-w2-13`, `q-s1-t2-w2-20`, `q-s1-t2-w3-13` đúng Design Notes;
  - chú thích đầu file.
- [x] `src/data/questions/questions.test.ts` -- sửa số câu: T1 42 câu (w1 6, w2 15, w3 15, w4 6); T2–T4 102 câu (s1-t2-w1 14, s1-t2-w2 26, s1-t2-w3 14, bài khác 6). Thêm describe "câu luyện thì T1–T2 (story 36)" với hằng `TENSE_QUESTIONS` (thì → 12 id, đúng bảng Design Notes). Các test:
  - mỗi thì đúng 12 câu, đều tag `thì`, đoạn `grammar`, đúng bài;
  - 44 câu mới đều là `type` / `transform`, có `requires` hợp lệ;
  - mỗi thì có ≥ 3 `type`, ≥ 2 biến đổi, ≥ 2 dịch (tính cả câu story 35); đề `transform` khớp đúng một trong hai mẫu;
  - `answer` / `accept` không có dấu tiếng Việt (`hasVietnameseMarks`);
  - luật `TIME_TAILS` → có `accept` đặt trạng ngữ lên đầu;
  - chữ tiếng Anh (phần sau "Đổi …:", từ gợi ý trong ngoặc của câu dịch, `prompt` câu `type`, `answer`, `accept`) có `outOfScopeWords` rỗng theo thì của câu;
  - đáp án không trùng `examples[].en` của TenseCard cùng bài;
  - không câu mới nào mang id đã bỏ hoặc id ngoài bảng;
  - golden: hàng "Quiz câu dịch", "Trạng ngữ đầu câu", "Biến đổi sang quá khứ" chấm bằng `matchesTyped` đúng như ma trận;
  - quiz `lesson-s1-t1-w2`: 3 lần `pickQuiz` liên tiếp có TTS (mỗi lần cộng câu vừa bốc vào `seen`) phủ đủ 15 câu, không trùng; mọi quiz bài T1–T2 bốc đủ 5 câu có / không TTS;
  - `owlTensePool(QUESTION_BANK)` đúng 57 câu, không chứa câu mới.
- [x] `src/data/questions/requires.test.ts` -- số câu T1 thành 42, mọi câu có `requires` hợp lệ. Test "câu T1 không dùng thì quá khứ" đọc thêm `answer` / `accept` của câu gõ. Thêm ca: `getQuestion('q-s1-t1-w2-01')` và `('q-s1-t2-w2-07')` giữ đúng đề cũ (hàng "Sổ lỗi cũ").
- [x] `src/lib/quiz/requires.test.ts` -- sửa số câu bị bỏ / số câu còn cho đúng dữ liệu mới, giữ ý từng test. Thêm ca hàng "Thiếu nền": chưa học viên nào thì mini-t2 vẫn ra 10 câu, mỗi bài T2 ≥ 2 câu, không có câu mới của story 36.
- [x] `src/data/lessons/lessons.test.ts` -- sửa describe story 35:
  - badWords dùng `outOfScopeWords(t.id, …)`. Lựa chọn sai của câu `choice` phần luyện `past-to-be` thì gọi với `wrongOption: true`;
  - present-continuous có 7 câu luyện, `present-continuous-c7` là câu dịch;
  - "thì có practice" đúng 6 id: `present-simple`, `present-simple-questions`, `present-continuous`, `past-to-be`, `past-simple`, `past-simple-irregular`. Không Tense T3–T4 nào có.
  
  Thêm describe "phần luyện T1–T2 (story 36)":
  - mỗi thì: 6–7 câu luyện, ≥ 3 câu `type`, có câu "Đổi …:" và câu "Dịch sang tiếng Anh: … (…)", 2 câu dễ hơn là `choice`;
  - `worked.timeline.kind === tense.timeline.kind`;
  - 2 câu nói đúng id;
  - đề hai thì cùng bài không trùng;
  - golden faded `present-simple` ("watches" đúng, "watchs" sai qua `isFadedCorrect`);
  - phủ đủ bảng "Phải phủ" (kiểm bằng chuỗi đáp án như Design Notes ghi).
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- mục Buổi học, cuối câu story 35 thêm: "Các thì T1–T2 (hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn với to be, có quy tắc, bất quy tắc) đều có phần luyện và 12 câu quiz mỗi thì, trong đó có câu gõ dạng đúng, biến đổi và dịch Việt → Anh (story 36)."

**Acceptance Criteria:**
- Given Huy ở 375px trên `/roadmap/lesson/s1-t2-w2/grammar`, when mở lần lượt khối "Luyện: Quá khứ đơn: to be (was / were)" rồi khối "Luyện: Quá khứ đơn: động từ có quy tắc" và đi hết 4 bước, then mỗi lúc chỉ một khối mở, `scrollWidth` bằng 375, và Sổ lỗi, `quizzes.attempts`, `progress` không đổi.
- Given Huy làm quiz `lesson-s1-t2-w3` và gõ sai câu dịch, when mở Sổ lỗi rồi ôn câu đó, then câu hiện ô gõ, gõ đúng V2 thì được chấm đúng, và nút "Vì sao sai?" gửi prompt dạng câu gõ.
- Given `npm run layout:guard` và `npm run layout:check`, when chạy trên code của story này, then không file UI nào bị báo thêm và ảnh 375px các route khớp baseline.

## Implementation Notes

- **Bảng phạm vi:** `src/lib/tense-scope.ts` (chỉ test import) có `TENSE_SCOPE_IDS`, `NOT_PAST`, `outOfScopeWords(tenseId, text, { wrongOption })` đúng 9 nhóm của bảng Design Notes. Thêm ngoài bảng (chặt hơn, không nới): `do / does not`, Wh + do / does cũng tính là "câu hỏi Do / Does" cho `present-simple`; câu hỏi đảo "Are you …-ing?" cũng tính là be + V-ing; bỏ qua từ -ing không phải V-ing (morning, evening, interesting…); thêm `couldn't` / `shouldn't` / `mustn't` / `wouldn't` / `cant` / `wont` vào nhóm modal. Thêm 2 hàm cho test: `promptEnglish(prompt)` (đề dịch → gợi ý trong ngoặc; đề "Đổi …:" → câu sau ":" kèm gợi ý trong ngoặc của phần yêu cầu; đề khác giữ nguyên) và `TIME_TAILS` / `frontedTimeTail(normalized)`.
- **Dữ liệu câu quiz (44 câu, đều gõ, đều có `requires` hợp lệ, mỗi câu có ≥ 1 khái niệm viên gạch nên chưa học viên nào thì không câu mới nào vào mini-t2):**
  - `t1.ts`: hàm `typed(kind, lessonId, n, …)`; `q-s1-t1-w2-08…16` (5 type, 2 "Đổi chủ ngữ sang …", 2 dịch), `q-s1-t1-w3-08…16` (5 type gồm 2 trả lời ngắn, 2 biến đổi, 2 dịch). `T1_QUESTIONS: readonly Question[]`.
  - `t2-t4.ts`: `q-s1-t2-w1-11…14` (2 type có gấp đôi / bỏ e câm, 2 dịch có now / today), `q-s1-t2-w2-13…19` (was / were) và `-20…26` (-ed), `q-s1-t2-w3-07…14`. Golden đúng bảng.
  - Mỗi thì: present-simple 5/2/2 (type / biến đổi / dịch, tính cả câu cũ choice không tính), psq 5/2/2, pc 4/2/2, past-to-be 3/2/2, past-simple 3/2/2, irregular 4/2/2.
- **Luật `TIME_TAILS` chỉ áp cho đáp án không phải câu hỏi.** Golden `q-s1-t2-w2-13` ("Were you at work yesterday?") không có `accept`, nên test bỏ qua đáp án kết thúc bằng "?" ("Yesterday were you at work?" không tự nhiên). Các câu hỏi khác có trạng ngữ cuối (`-18`, `-26`, `t2w3-14`) cũng không có `accept`. Câu không hỏi có trạng ngữ cuối đều có `accept` đặt trạng ngữ lên đầu (test đếm ≥ 6 câu quiz, ≥ 4 câu luyện).
- **Phần luyện:** `practice` cho `present-simple`, `present-simple-questions` (t1-grammar.ts), `past-to-be`, `past-simple`, `past-simple-irregular` (t2-t4-grammar.ts) theo mẫu Design Notes (worked / faded giữ đúng chữ và đáp án), mỗi thì 6 câu luyện (4–5 câu `type`, có 1 câu "Đổi …:" và 1 câu dịch) + 2 câu dễ hơn `choice`, 2 câu nói. `present-continuous-c7` đúng chữ Design Notes. "Is she busy?" (c2) đặt ngay cạnh "Does she work on Monday?" (c3) ở psq. `did` chỉ xuất hiện ở lựa chọn sai của `past-to-be-c2`.
- **Test:** `tense-scope.test.ts` (mới, 11 test); `questions.test.ts` sửa số câu (T1 42, T2–T4 102, bank 144) + describe "câu luyện thì T1–T2 (story 36)" (14 test: bảng id, câu gõ, mẫu đề, dấu tiếng Việt, `TIME_TAILS`, phạm vi chữ, không trùng ví dụ TenseCard, id đã bỏ, golden + chấm golden, 3 lần quiz W2 phủ 15 câu, mọi quiz bài T1–T2, O.W.L. 57 câu); `requires.test.ts` (42 câu, đọc thêm `answer` / `accept`, ca Sổ lỗi cũ); `lib/quiz/requires.test.ts` sửa số theo dữ liệu mới, giữ ý (W2 khi mới xong F01–F12 nay chạy được vì có câu gõ không cần F13–F18; ca "còn 4 câu, có câu nghe, không TTS → không chạy" chuyển sang quiz W1 thiếu F13; quiz không lọc chuyển sang s1-t2-w4; mini-t2 bỏ 36 câu và không chứa câu story 36); `lib/quiz/quiz.test.ts` 2 test story 35 đổi theo bài 14 câu; `lessons.test.ts` story 35 dùng `outOfScopeWords` (lựa chọn sai `wrongOption`), c7, đúng 6 thì có practice; describe "phần luyện T1–T2 (story 36)" (7 test, gồm "Phải phủ").
- **Kiểm chứng:** `npm run lint`, `npm test` (79 file, 1879 test), `npm run build` qua. `npm run layout:guard`: 5 file nguồn đổi, không thêm / xoá class. `npm run layout:check`: 12 route × 5 bề rộng ok, ảnh 375px trùng; **có 1 lỗi phím tắt có sẵn từ story 35** (không do story này): probe gõ "chào 1" vào màn faded F01 và chờ "Chưa đúng", nhưng `hasVietnameseMarks` (patch review story 35) nay nhắc tắt bộ gõ thay vì chấm. Story này không đổi component hay `scripts/layout`, nên để lại cho story sau sửa chữ probe.
- **Patch sau review:** `tense-scope.ts` chặt hơn (quá khứ tiếp diễn, hoàn thành có V3 = V2 / -ed, may / might / shall / ought, 'd, than, V-ing đứng một mình ở thì chưa học -ing, be + 1–2 từ + V-ing, How often / What time do, trả lời ngắn do / does) và bớt báo nhầm (`NOT_PAST` thêm hundred; `NOT_PROGRESSIVE` thêm amazing, exciting, building, wedding, ceiling, during; "going to school / the …" không tính). Dữ liệu: thêm dấu hiệu thời gian cho 5 câu điền, gợi ý đủ danh từ / từ để hỏi, `q-s1-t2-w1-14` đổi thành câu có "đang". Xem Review Triage Log.
- **Chưa kiểm tay trên trình duyệt** (AC 1–2: mở 2 khối ở s1-t2-w2 375px, ôn Sổ lỗi câu dịch). Component không đổi; khối luyện tự hiện qua `GrammarSection` như story 35.

## Spec Change Log

## Review Triage Log

Review 4 lớp (blind, edge, verification-gap, content), 2026-11-12. Không có intent_gap / bad_spec; không sửa chữ frozen.

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge, content | Câu điền không có dấu hiệu thời gian nên dạng khác cũng đúng: `q-s1-t2-w3-08` (takes), `past-simple-irregular-c2` (writes), `-c6` (does), `q-s1-t2-w1-12` (make), `past-to-be-c3` (isn't) | medium | Đọc đề: không có yesterday / now / last…; câu quiz còn ra lẻ ở Sổ lỗi, bài kiểm tra quay lại | patch: thêm yesterday / last night / now / last Monday và câu giải thích |
| 2 | blind, edge | Gợi ý câu dịch thiếu danh từ nội dung: `q-s1-t1-w2-16` (my father), `q-s1-t2-w1-13` (my mother) | medium | Intent: "ngoặc gợi ý cho đủ từ nội dung"; gõ "My dad…" bị chấm sai vì từ vựng | patch: thêm `father`, `mother` (Huy tự làm ra my) |
| 3 | blind, edge (claim) | Trạng ngữ thời gian lúc có lúc không trong gợi ý | low | `q-s1-t2-w3-13` và `present-continuous-c7` là golden (đề cố định); "tuần trước", "bây giờ" là từ báo hiệu của chính bài | patch một phần: `q-s1-t2-w1-13` thêm `now`; golden giữ nguyên |
| 4 | blind | Từ để hỏi lúc có lúc không trong gợi ý (`present-simple-questions-c5`, `q-s1-t1-w3-16` thiếu where) | low | `-w2-18`, `-w2-26`, `-w3-14` có where / what | patch: thêm `where` |
| 5 | blind, edge | `q-s1-t2-w1-13` thiếu `accept` dạng `'s` | medium | `normalizeTyped` không mở rộng `'s`; luật story 35 (Always) | patch: thêm "My mother's cooking now." và bản trạng ngữ đầu |
| 6 | blind, content | `requires` F17 không đồng đều ở `q-s1-t2-w2-20`…`-23` | low | Cả hai hợp lệ; golden `-20` cố định `requires`; bài tự dạy -ed; đổi sẽ đổi số câu bị bỏ | defer (story 47) |
| 7 | blind, edge | `outOfScopeWords` không bắt quá khứ tiếp diễn was / were + V-ing | medium | `PROGRESSIVE_RE` chỉ am / is / are; past scopes cho phép cả pastBe và progressive | patch: `PAST_PROGRESSIVE_RE` báo ở cả 6 thì + test |
| 8 | blind, edge | Hoàn thành có V3 = V2 / -ed ("has worked", "have made"), 'd, may / might / shall / ought, so sánh (than) lọt | medium | `IRREGULAR_V3_ONLY` chỉ có V3 ≠ V2; `MODALS` thiếu các từ trên | patch: `PERFECT_RE`, thêm modal, `'d`, `than` + test |
| 9 | blind, edge | Bị động "was made" lọt ở các thì quá khứ | medium | was + V2 / -ed lẫn với tính từ (closed, tired), không tách được bằng danh sách | defer (story 37) |
| 10 | blind, edge | Báo nhầm: "amazing", "building", "hundred", "going to school" | low | `NOT_PROGRESSIVE` / `NOT_PAST` thiếu; "going to" báo mọi ngữ cảnh | patch: thêm từ, "going to" + nơi chốn không tính + test. closed / worried / broken: reject (nới -ed / V3 sai nhiều hơn đúng) |
| 11 | blind | `requires.test.ts` giữ danh sách PAST / NOT_PAST riêng | low | Test có sẵn từ story 27, quét cả giải thích tiếng Việt và bài T1 không phải thì; không thay thẳng được bằng `outOfScopeWords` | reject |
| 12 | blind | Kiểm "bỏ e câm / gấp đôi" dùng `fill` nên câu `transform` không được xét | low | `lessons.test.ts` (Phải phủ); test qua nhờ `-12` | patch: câu không phải `type` xét `answer` |
| 13 | blind | Không kiểm đáp án phần luyện trùng `examples[].en` | low | Spec chỉ đòi cho câu quiz; faded mẫu do Design Notes chỉ định | reject |
| 14 | blind, vgap | `layout:check` đỏ vì probe "chào 1" của story 35, chưa ghi deferred-work | medium | `scripts/layout/check-lib.mjs:288`; có sẵn từ story 35 | defer |
| 15 | blind, vgap | AC 1–2 chưa kiểm tay | — | Implementation Notes ghi "chưa kiểm tay" | humanChecks |
| 16 | blind | Bước áp dụng: `present-simple` đòi 3 câu mà mẫu 2 câu; `past-to-be` mẫu trùng `say-1`; `say-2` vi thừa "Lúc đó"; go → goes lặp ở quiz và luyện | low | Đọc dữ liệu | patch 3 mục đầu; go → goes: reject (Phải phủ đòi goes) |
| 17 | blind, edge | Không có "… ago", `TIME_TAILS` thiếu ago / tonight; đuôi "until now" có thể đòi accept sai | low | Không câu nào dùng các cụm này; từ báo hiệu là việc story 39 | reject |
| 18 | edge | `PROGRESSIVE_QUESTION_RE` chỉ nhận đại từ ("Is your mother cooking?", "is still sleeping" lọt) | low | Regex chỉ `(i|you|…)` | patch: 1–2 từ bất kỳ + test |
| 19 | edge, content | Lựa chọn sai "drinking", "living" ở T1-W2 (V-ing chưa dạy) | low | `present-simple-c2`, `-e1`; scope không bắt V-ing đứng một mình | patch: đổi sang "am drink" / "is live" (lỗi TenseCard "I am work") + scope bắt V-ing đứng một mình |
| 20 | edge | `DO_QUESTION_RE` bỏ sót How often / What time / ", do you" / "Yes, she does." | low | Regex chỉ Wh + do liền nhau và đầu câu | patch + test |
| 21 | edge | `promptEnglish` quét chữ Việt nếu đề dịch sai mẫu | low | Đề sai mẫu thì test mẫu `TRANSLATE_RE` đã báo; quét chữ Việt chỉ gây báo nhầm (ồn), không lọt | reject |
| 22 | edge | Test kề nhau Is / Does qua khi không có câu Does (doesShe = -1) | low | `lessons.test.ts` Phải phủ | patch: `expect(doesShe) >= 0` |
| 23 | edge | Cờ `wrongOption` gán theo chuỗi khớp giữa mọi câu | low | Chỉ nới `did` cho past-to-be; không câu đúng nào của past-to-be là "did" | reject |
| 24 | vgap | Câu gõ phần luyện không có test không-dấu-tiếng-Việt và tự chấm đúng | medium | Chỉ quiz có (`questions.test.ts`); `TypedAnswer` không chấm chữ có dấu | patch: test mới trong describe story 36 (`hasVietnameseMarks`, `isCorrect`, `isFadedCorrect`) |
| 25 | content | `q-s1-t2-w1-14` "Hôm nay anh ấy không lái xe" không có "đang" nên "He doesn't drive today." cũng là bản dịch đúng | medium | Đề tiếng Việt không báo tiếp diễn | patch: "Hôm nay anh ấy đang lái xe đi làm. (drive, to work, today)" → "He is driving to work today." (phủ định đã có ở `-08`, `-10`) |
| 26 | content | `q-s1-t2-w2-19` đòi chủ ngữ giả "it" chưa dạy thành luật | low | Chỉ có ví dụ "Is it cold today?" | patch: gợi ý "(it, cold, yesterday)" |
| 27 | content | `present-continuous-c7` "having" dễ lẫn với luật động từ trạng thái (have = có) | low | TenseCard nói động từ trạng thái không dùng -ing | patch: thêm một câu vào giải thích |
| 28 | content | Giải thích `past-to-be-c2` nói "hỏi ở đâu" sai; `past-simple-c1` thiếu "một âm tiết" | low | Đọc chữ | patch |
| 29 | content | Câu luyện gần trùng ví dụ / đáp án: `past-simple-e2` "I didn't ___ him", `psq-c3` "on Monday", `psq-say-2` lộ đáp án `q-s1-t1-w3-15`; faded "stay at home" | low | So với TenseCard và quiz | patch 3 mục đầu ("my sister yesterday", "on Mondays", "My brother doesn't watch TV."); faded: reject (golden Design Notes) |

## Design Notes

**Số câu và id** (câu cũ = câu nhãn `thì` đang có; mọi câu mới là câu gõ):

| Thì | Bài | Câu cũ | Câu mới | Tổng |
|---|---|---|---|---|
| `present-simple` | s1-t1-w2 | 01, 02, 03 | 08–16 | 12 |
| `present-simple-questions` | s1-t1-w3 | 01, 02, 03 | 08–16 | 12 |
| `present-continuous` | s1-t2-w1 | 01–04, 07–10 | 11–14 | 12 |
| `past-to-be` | s1-t2-w2 | 07–11 | 13–19 | 12 |
| `past-simple` | s1-t2-w2 | 01–04, 12 | 20–26 | 12 |
| `past-simple-irregular` | s1-t2-w3 | 01–04 | 07–14 | 12 |

**Mẫu đề câu gõ:**
- `type`: "My mother ___ (teach) English at a school." Gợi ý là V1, hoặc "not / V1" cho phủ định. Trả lời ngắn cũng là `type`: "Did you call him? — Yes, I ___." → `did`.
- Biến đổi: `^Đổi [^:]+: <câu tiếng Anh>[.?!]$`. Ví dụ "Đổi sang câu phủ định: …", "Đổi sang câu hỏi: …", "Đổi chủ ngữ sang She: …" (T1-W2 chưa học phủ định / câu hỏi), "Đổi sang quá khứ (last Sunday): …".
- Dịch: `^Dịch sang tiếng Anh: <câu tiếng Việt> \(<từ gợi ý>\)$`. Câu tiếng Việt có dấu. Từ gợi ý tiếng Anh ở dạng nguyên mẫu, ngăn bằng ", ".
- `TIME_TAILS` (so sau `normalizeTyped`): yesterday, today, now, right now, this morning, this week, last + (night / week / weekend / month / year / tên thứ), every + (day / morning / evening / night / week / weekend / tên thứ). Bản đặt trạng ngữ lên đầu = trạng ngữ + phần còn lại.

**Phạm vi chữ theo thì** (`outOfScopeWords`; ✗ = bị báo):

| Nhóm | present-simple | present-simple-questions | present-continuous | past-to-be | past-simple | past-simple-irregular |
|---|---|---|---|---|---|---|
| V2 bất quy tắc ≠ V1 (trừ was / were / did) | ✗ | ✗ | ✗ | ✗ | ✗ | được |
| V3 ≠ V2 (gone, seen, been, eaten…) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| was, were, wasn't, weren't | ✗ | ✗ | ✗ | được | được | được |
| did, didn't | ✗ | ✗ | ✗ | ✗ (did được khi `wrongOption`) | được | được |
| từ đuôi -ed (trừ `NOT_PAST`) | ✗ | ✗ | ✗ | ✗ | được | được |
| don't, doesn't, câu mở đầu Do / Does | ✗ | được | được | được | được | được |
| am / is / are / 'm / 're / 's (+ not) + từ đuôi -ing | ✗ | ✗ | được | được | được | được |
| will, won't, 'll, can, can't, cannot, could, should, must, would, going to, gonna | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| some, any, many, much, lot, because, so | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

**Phải phủ** (tính trên câu quiz + phần luyện của thì):
- `present-simple`: đuôi -s (works), -es (watches / goes), -ies (studies), has, chủ ngữ số nhiều / I không thêm -s, đổi chủ ngữ I → he / she.
- `present-simple-questions`: don't, doesn't + V1, Do… / Does… + V1, trả lời ngắn (Yes, she does. / No, I don't.), Wh + do / does, và một câu "Is she…?" đặt cạnh "Does she…?" (to be không mượn do).
- `present-continuous`: thêm câu dịch có "now", một câu bỏ e câm (making / writing) hoặc gấp đôi phụ âm trong câu mới.
- `past-to-be`: was, were, wasn't, weren't, Was… / Were…?, trả lời ngắn, there was / there were, Where were…?
- `past-simple`: -ed thường, -d sau e (lived), -ied (studied), gấp đôi (stopped / planned), không gấp đôi khi nhấn âm đầu (visited / listened), didn't + V1, Did…? + "Yes, I did.", Wh + did, đổi hiện tại → quá khứ.
- `past-simple-irregular`: ≥ 8 động từ khác nhau trong `IRREGULAR_VERBS` ở đáp án, didn't + V1, Did you + V1…?, Wh + did + V1, ≥ 2 câu dịch có gợi ý V1 mà đáp án là V2.

**Câu golden** (người làm giữ đúng đề, đáp án, `accept`; được viết lại `explanation`):

| Id | Dạng | Đề | Đáp án | `accept` | `requires` |
|---|---|---|---|---|---|
| q-s1-t1-w2-08 | type | "My mother ___ (teach) English at a school." | `teaches` | — | present-simple, possessive-adjectives, articles, prepositions-of-place |
| q-s1-t1-w3-15 | dịch | "Dịch sang tiếng Anh: Cô ấy không uống cà phê. (drink, coffee)" | `She doesn't drink coffee.` | — | present-simple-negative, subject-pronouns |
| q-s1-t2-w2-13 | biến đổi | "Đổi sang câu hỏi: You were at work yesterday." | `Were you at work yesterday?` | — | be-questions, subject-pronouns, prepositions-of-place |
| q-s1-t2-w2-20 | biến đổi | "Đổi sang quá khứ (last Sunday): I play football." | `I played football last Sunday.` | `Last Sunday I played football.` | present-simple, subject-pronouns, days-months |
| q-s1-t2-w3-13 | dịch | "Dịch sang tiếng Anh: Tuần trước anh ấy mua một chiếc xe đạp mới. (buy, a new bike)" | `He bought a new bike last week.` | `Last week he bought a new bike.` | subject-pronouns, articles, adjective-before-noun, verb-forms |

**Phần luyện: ví dụ mẫu và màn điền** (giữ dạng câu và đáp án, được sửa chữ):
- `present-simple`:
  - worked: "My father drinks coffee every morning." / "Bố tôi uống cà phê mỗi sáng." Ghi chú: my father = he nên thêm -s;
  - faded: "She ___ (watch) TV every evening." → `watches`, gợi ý "watch tận cùng -ch nên thêm -es".
- `present-simple-questions`:
  - worked: "Does your brother play football? — Yes, he does." Ghi chú: your brother = he → Does; play giữ nguyên;
  - faded: "I ___ (not / eat) meat." → `don't eat` (không chép ví dụ "I don't like coffee." của TenseCard).
- `past-to-be`:
  - worked: "We were at home last night." / "Tối qua chúng tôi ở nhà.";
  - faded: "My phone ___ (be) on the table yesterday." → `was`.
- `past-simple`:
  - worked: "She cooked dinner yesterday." Ghi chú: -ed cho mọi chủ ngữ; "yesterday" không thay được việc đổi động từ;
  - faded: "We ___ (stay) at home last Sunday." → `stayed`.
- `past-simple-irregular`:
  - worked: "My father made a cake yesterday." Ghi chú: make → made (V2), không thêm -ed;
  - faded: "We ___ (see) a good movie last night." → `saw`.
- `present-continuous-c7`: type "Dịch sang tiếng Anh: Bây giờ chúng tôi đang ăn tối. (have dinner)" → `We are having dinner now.`, `accept` "Now we are having dinner.".

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: cả ba đều qua.
- `npx vitest run src/lib/tense-scope.test.ts src/data/questions src/data/lessons src/lib/quiz src/lib/owl` -- expected: qua, có describe story 36 trong `questions.test.ts` và `lessons.test.ts`.
- `npm run layout:guard` -- expected: không báo file nào mới so với baseline (story này không đổi component).
- `npm run layout:check` (cần Chrome) -- expected: không cuộn ngang ở 5 bề rộng, ảnh 375px khớp baseline.

**Manual checks (if no CLI):**
- Chrome 375px, store đã bỏ qua Sân ga:
  - `/roadmap/lesson/s1-t1-w2/grammar` có khối luyện, đi hết 4 bước; câu dịch ở bước Luyện tập chấm đúng khi gõ đáp án viết thường, không dấu chấm;
  - quiz `lesson-s1-t2-w2` có câu "Dịch sang tiếng Anh", gõ sai thì vào Sổ lỗi với "bạn gõ".
