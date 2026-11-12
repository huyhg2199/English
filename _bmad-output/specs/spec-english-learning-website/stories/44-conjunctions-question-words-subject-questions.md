---
title: 'Liên từ, why / how often / how many và câu hỏi chủ ngữ (CAP-23, learning-rules "Sân ga 9¾", "Hư từ", "Thẻ quy tắc", "Từ tín hiệu và chọn thì", "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: 'efccbea5aa1bf3b2ae3807cd075d7fe964a9fbd9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/43-quantifiers-there-negative-questions.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/39-tense-choice-signal-words-aux-table.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/38-tense-rule-cards-irregular-verb-srs.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" là Huy **tự làm ra** được câu đúng (gõ, biến đổi, dịch Việt → Anh, nói), không chỉ nhận ra. Báo cáo kiểm tra mục T6:
  - and / but / or / because nằm ở `WALL_WORDS` (`function-words.ts:37`), liên từ tới s2-t7-w1 (tháng 7) mới dạy, không có cảnh báo lỗi "Because…, so…";
  - why, how often, how many (với do / does) không có bài dạy;
  - không có câu hỏi chủ ngữ (Who called? / What happened?).
- Quyết định 4: dùng lại tối đa bộ máy có sẵn:
  - màn và bảng tra của viên (story 34, 43), câu gõ `type` (story 35), thẻ quy tắc, cổng hư từ;
  - khối "Chọn thì" `TenseChoice` có `viWords` + phần luyện (story 39);
  - thẻ quy tắc của thì (story 38).
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn; câu chỉ dùng kiến thức đã dạy; giao diện 375px không đổi ngoài phần mới; không nâng schema store, không thêm key đồng bộ.
- Claude chọn:
  - **Liên từ: mở rộng F16, không thêm viên** (lý do như story 43: `BRICK_IDS`, "x/18", điểm Nhà, luật hàng xong đều dựa vào 18 viên). F16 ngắn nhất (6'), là viên cuối hàng C "Câu đầu tiên", câu của nó đã có to be và have / has để nối.
    - Khái niệm mới `conjunctions` (and, but, or, because, so; chặn "Because…, so…"). F16 `teaches` = `['have-has', 'conjunctions']`.
    - `title` thành "have/has + nối câu", 10' (tổng Sân ga 157'). Id viên, tiến độ, thứ tự màn giữ nguyên.
  - **Phần chữ dài nằm trong 1 bảng tra** (không IPA) "Nối 2 câu: and, but, or, because, so" của màn giải thích, như F15. Giải thích vẫn 40–80 chữ.
  - **Màn luyện F16:** giữ `f16-c1`, `-c2`, `-c4`, `-e1`. `f16-c3` thành câu nghe có but; `f16-c5` thành **câu gõ** nối 2 câu bằng because; `f16-e2` thành câu dễ "because nghĩa là gì?"; `f16-a1` thành câu chọn "Vì… nên…". Thêm 2 câu nói. Id câu giữ nguyên vị trí.
  - **Thẻ quy tắc F16:** giữ `f16-rule-1`, `-2`, thêm `-3` (so), `-4` (because), `-5` (but). F16 có 5 thẻ.
  - **Soát vé hàng C** thêm `q-f16-03` (so), `q-f16-04` ("Vì… nên…"): hàng C 14 câu, mỗi lần vẫn bốc 8.
  - **Cổng hư từ:** but, or, because rời `WALL_WORDS`, gắn F16.
    - and giữ cổng tường: F10, F11, F15 đã dùng and để nối từ ("between the bank and the market"), gắn F16 sẽ vi phạm luật "viên trước không dùng hư từ của viên sau".
    - why giữ cổng tường: s1-t1-w3 luôn đứng sau tường, dời sang bài sẽ đóng cổng đã mở với người đang ở giữa tường và s1-t1-w3.
    - so không phải hư từ trong danh sách (NGSL ghi adverb), không có cổng.
  - **why / how often / how many ở s1-t1-w3:** khối `TenseChoice` mới `question-words` "Hỏi tại sao, bao lâu một lần, bao nhiêu", có `viWords` (tại sao · bao lâu một lần · bao nhiêu), cặp câu, 3 quy tắc và phần luyện 7 câu. Đứng sau thì `present-simple-questions`.
  - **Câu hỏi chủ ngữ ở s1-t2-w2:** khối `TenseChoice` mới `subject-questions` "Câu hỏi chủ ngữ: Who called? hay Who did you call?", có `viWords` (ai · cái gì), cặp câu, 3 quy tắc và phần luyện 7 câu. Đứng sau `past-to-be` và `past-simple`.
  - **Thẻ ôn SRS:** thêm `present-simple-questions-rule-5` (How often) và `past-simple-rule-5` (Who + V-ed). Mỗi thì vẫn ≤ 5 thẻ (luật story 38), tổng 57 thẻ thì.
  - **Phạm vi chữ của thì (`tense-scope.ts`):** bỏ nhóm "luôn bị báo" lượng từ / liên từ (some, any, many, much, lot, because, so). F15 (story 43) và F16 (story 44) đã dạy chúng ở Sân ga, mà Sân ga đứng trước mọi bài. Khối s1-t1-w3 cần How many / How much / because.
  - **Không thêm câu quiz bài** (`QUESTION_BANK`) cho s1-t1-w3 / s1-t2-w2. Bảng "12 câu nhãn thì mỗi thì" (story 36) và `T1_LESSON_CONCEPTS` giữ nguyên. Phần mới được luyện bằng khối luyện, thẻ SRS và Soát vé.

**Problem:** Người học chưa có chỗ nào học nối 2 câu (and / but / or / because / so), nên vẫn nói kiểu Việt "Because…, so…". why / how often / how many với do / does và câu hỏi chủ ngữ (Who called you? khác Who did you call?) cũng chưa được dạy. Trong khi đó đây là mẫu câu A1–A2 cốt lõi, gặp nhiều ở TOEIC Part 2, và các bài sau đã dùng.

**Approach:**
- Mở rộng nội dung F16: khái niệm `conjunctions`, 1 bảng tra, câu gõ, 3 thẻ quy tắc mới, 2 câu Soát vé. Dời cổng but / or / because sang F16.
- Thêm 2 khối `TenseChoice` có `viWords` ở s1-t1-w3 và s1-t2-w2, và 2 thẻ quy tắc của thì.
- Nới phạm vi chữ cho lượng từ / liên từ.
- Test khoá nội dung, số câu, cổng và khai báo khái niệm.
- Không đổi component.

## Boundaries & Constraints

**Always:**
- F16 vẫn đúng 6 màn theo thứ tự, gồm:
  - giải thích 40–80 chữ (`countWords`);
  - check đúng 5 câu, easier đúng 2, câu chọn có 3 lựa chọn khác nhau, ≥ 1 câu listen;
  - đúng 5 từ chủ đề như cũ;
  - `uses` của câu chỉ là khái niệm của F01–F16.
- Câu tiếng Anh của F16 (dòng bảng, ghi chú, thẻ, đáp án và `accept` câu gõ) theo luật hàng C–D:
  - không do / does / did, khuyết thiếu, 've / 'll / 'd, n't ngoài isn't / aren't;
  - had chỉ ở dòng "have → had" có sẵn;
  - không at, every, always, never, often (cổng F18), không going / gone.
- Câu đúng nào (đáp án, dòng bảng, ví dụ, câu nói, câu mẫu, thẻ) cũng không có "because … , so …" trong cùng một câu. Dạng sai chỉ xuất hiện trong lựa chọn nhiễu hoặc trong lời giải thích, có trích dẫn.
- Giữ nguyên:
  - id SRS và chữ của `rule:f16-1`, `rule:f16-2`;
  - id và nội dung `q-f16-01`, `-02`;
  - mọi thẻ quy tắc thì đang có (id, chữ, thứ tự).
  Thẻ mới là key mới trong `srs.cards`.
- Câu Soát vé mới: 4 lựa chọn, `sectionId: 'grammar'`, tag `từ loại`, `requires` chỉ gồm khái niệm F01–F16 và có `conjunctions`. Câu quiz không trùng nguyên văn câu nào của viên.
- Khối mới:
  - `practiceProblems` rỗng, `rules` đúng 3, `formulas` ≥ 2, 3–4 cặp câu (a ≠ b);
  - id câu luyện `<blockId>-c<n>` / `-e<n>` / `-say-<n>`, không trùng id câu nào đang có;
  - đề không trùng đề quiz cùng bài;
  - chữ tiếng Anh nằm trong phạm vi chữ của thì cuối bài: `present-simple-questions` cho `question-words` (không quá khứ, không be + V-ing), `past-simple` cho `subject-questions` (chỉ động từ -ed, không V2 bất quy tắc);
  - không có "Don't + V".
- Cổng đã mở không đóng: người đã qua / bỏ qua Sân ga hoặc đã qua hàng C vẫn thấy but / or / because như cũ.
- Bảng và khối co theo 375px, không cuộn ngang. `layout:guard` không được báo class mới hay class bị xoá.

**Never:**
- Không làm việc của story sau: modal mới (45), quá khứ tiếp diễn (46), Bản đồ thì (42), `requires` cho câu T2–T4 cũ, test quay lại ở Sân ga, video lệch tuần, chia Ngữ pháp theo ngày (47).
- Không thêm viên. Không đổi `BRICK_IDS`, `ROW_IDS`, hàng của viên, `teaches` / `uses` của viên khác, `uses` của F16.
- Không đổi component:
  - `TenseChoiceCard`, `TensePractice`, `BrickTables`, `GrammarSection`, `TenseCard` (khối không `sides` đã có mẫu `dont-translate`);
  - kiểu `TenseChoice`, `Tense`, `Question`, `CheckItem`.
- Không đổi:
  - `ROW_QUIZ_SIZE`, `minPerLesson`, luật chấm Soát vé;
  - store schema, `SYNCED_KEYS`;
  - `QUESTION_BANK`, `T1_LESSON_CONCEPTS`, mini test, O.W.L., bảng "Mỗi thì một dòng";
  - `rules` / `mistakes` / `practice` của Tense có sẵn.
- Không dời cổng and, why, which hay hư từ khác ngoài but, or, because. Không dạy which / whose.
- Không đổi `words.json`, `example-overrides.json`, `scripts/vocab/example-labels.json`, glossary, nhãn từ loại của F07, SPEC.md.
- Không chép câu hay bảng từ sách, web có bản quyền.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mở F16 ở 375px | `#/foundation/F16`, màn 1 | Đoạn giải thích mới. Bảng "Nối 2 câu: and, but, or, because, so (7)" đóng sẵn. Mở bảng thì mỗi dòng có nút nghe · câu + nghĩa, không có cột IPA, có ghi chú cuối bảng. `scrollWidth` = 375 | N/A |
| Bức tường | `#/foundation` | Ô F16 ghi "have/has + nối câu", 10' | N/A |
| Câu gõ F16 | `f16-c5`, gõ "I'm happy because I have a new phone" | Đúng (I'm = I am, không cần dấu chấm). "Because I have a new phone, I am happy." cũng đúng (`accept`) | Gõ "Because I have a new phone, so I am happy." → sai, giải thích, làm lại; lần đầu tính điểm |
| Dưới 60% ở F16 | Đúng lần đầu < 3/5, bấm "Xem lại giải thích" | Tóm tắt có bảng; 2 câu dễ hơn là `f16-e1` và `f16-e2` mới | N/A |
| Xong F16 lần đầu | Học tới màn Áp dụng | Phiên ôn hôm đó có 5 thẻ `rule:f16-1` … `-5` sau từ mới; but, or, because thôi bị khoá (vào từ mới theo hạng NGSL) | N/A |
| Đã xong F16 trước story 44 | `srs.cards` có `rule:f16-1`, `-2` | Phiên kế tiếp có thêm `rule:f16-3` … `-5`; thẻ 1–2 giữ lịch; but / or / because mở | N/A |
| Qua hàng C bằng kiểm tra / bỏ qua Sân ga | Không học F16 | but / or / because mở; không có thẻ F16 | N/A |
| Mới xong F01–F15 | Đang ở Sân ga | but / or / because vẫn khoá (trước đây vì tường, nay vì F16); and, why vẫn khoá vì tường | N/A |
| Soát vé hàng C | `quiz-f-c`, 20 seed, có / không có TTS | 8 câu từ 14, không trùng, mỗi viên ≥ 1; không TTS thì không có câu nghe | N/A |
| Bài s1-t1-w3 ở 375px | `#/roadmap/lesson/s1-t1-w3`, đoạn Ngữ pháp, hoặc bước Bài chính của buổi 30' | Sau thẻ và khối luyện của `present-simple-questions` có thẻ "Hỏi tại sao, bao lâu một lần, bao nhiêu": 3 ô chữ Việt, cặp câu dễ nhầm, 3 quy tắc chọn, khối "Luyện: …" đóng. Mỗi lúc chỉ mở một khối luyện. `scrollWidth` = 375 | N/A |
| Luyện từ để hỏi | `question-words-c5`, gõ "how often do you read books" | Đúng | "How often you read books?" → sai, giải thích, làm lại; không ghi Sổ lỗi |
| Bài s1-t2-w2 | Đoạn Ngữ pháp | Sau `past-to-be`, `past-simple` (kèm khối luyện) có thẻ "Câu hỏi chủ ngữ…": ô "ai", ô "cái gì", cặp câu, 3 quy tắc, khối luyện | N/A |
| Luyện câu hỏi chủ ngữ | `subject-questions-c5` gõ "Who called you?"; `-c6` gõ "who did you call" | Cả hai đúng | `-c5` gõ "Who did call you?" → sai, giải thích "Who là chủ ngữ thì không mượn did" |
| Máy tính | ≥ 1024px, trang bài s1-t1-w3 / s1-t2-w2 (bố cục hai cột của story 30) | Khối mới nằm trong cột Ngữ pháp như khối story 39. Phím tắt chỉ chạy trong khối luyện đang mở | N/A |
| Xong bài s1-t1-w3 / s1-t2-w2 | Đánh dấu xong bài | Phiên ôn có `rule:present-simple-questions-1` … `-5` / `rule:past-simple-1` … `-5` theo thứ tự lộ trình | N/A |
| Bài đã xong trước story 44 | `srs.cards` có thẻ `-1` … `-4` của hai thì | Thêm đúng thẻ `-5` mới; thẻ cũ giữ lịch | N/A |
| Phạm vi chữ | `outOfScopeWords(id, 'some / many / much / a lot / because / so')`, mọi thì | Rỗng. could, have to, "Don't + V", quá khứ tiếp diễn vẫn bị báo | N/A |
| Thẻ mồ côi | `srs.cards` có `rule:f16-6` | Không hiện, không đếm tồn ôn, vẫn nằm trong store | N/A |
| Sổ lỗi cũ | Có lỗi `q-f16-01`, `-02` | `getQuestion` trả đúng câu cũ | N/A |
| Khai báo thiếu | Câu luyện có `uses` của viên / câu `FOUNDATION_QUESTIONS` có but / or / because / so (đề đã điền + đáp án đúng) mà thiếu `conjunctions` | Test báo đúng id câu | Sửa dữ liệu câu, không nới luật |

</frozen-after-approval>

## Code Map

- `src/data/foundation/types.ts:82-83` -- `CONCEPT_IDS` nhóm `// F16`: thêm `'conjunctions'`. Doc comment `tables` (khoảng `:112`) ghi "Hiện F06, F15 và F16 có".
- `src/data/foundation/catalog.ts:147-154` -- meta F16: `title`, `minutes`, `goalVi`, `teaches`. `uses` giữ nguyên.
- `src/data/foundation/bricks/f16.ts` -- toàn bộ nội dung F16. Viết lại theo Design Notes, sửa doc comment đầu file.
- `src/data/foundation/types.ts:188` `tableHasIpa`, `src/components/foundation/BrickTables.tsx` -- bảng không IPA đã chạy từ story 43. Chỉ đọc.
- `src/data/vocab/function-words.ts:30-40` (`WALL_WORDS`, liên từ ở `:37`), `:76-77` (nhóm F16) -- dời but / or / because.
- `src/data/questions/foundation.ts` -- comment đầu file (44 câu, `:6-8`), `ROW_C` (q-f16 ở `:431-455`), comment trên `FOUNDATION_QUESTIONS` (`:584`).
- `src/data/lessons/tense-choices.ts` -- 3 khối của story 39. Thêm `QUESTION_WORDS`, `SUBJECT_QUESTIONS`; sửa doc comment đầu file (`:4-9`, câu "không some / any / … / because / so").
- `src/data/lessons/t1-grammar.ts:269-294` (thẻ `present-simple-questions`), `:398` `GRAMMAR_W3` -- thêm thẻ 5 và `choices`. File chưa import từ `./tense-choices`.
- `src/data/lessons/t2-t4-grammar.ts:389-414` (thẻ `past-simple`), `GRAMMAR_T2_W2` (khoảng `:1786`), import `:2` -- thêm thẻ 5, `choices`, import.
- `src/data/lessons/index.ts:41` -- re-export khối. `allTenseChoices` (`:171-174`) tự lấy khối theo thứ tự bài.
- `src/lib/tense-scope.ts` -- `QUANTIFIERS_LINKERS` (`:171-173`, dùng ở `:309`), doc comment đầu file (`:9-10`).
- `src/lib/tense-practice.ts` `practiceProblems`, `src/lib/tense-choice.ts` `choiceSides` / `lessonTenseIds` -- khối không có `sides` thì `choiceSides` trả `[]`. Không sửa.
- `src/lib/flashcard-session.ts` `ruleStudyWords`, `lockedNewWordIds` -- tự lấy thẻ mới và cổng mới. Không sửa.
- `src/data/questions/concepts.ts` `requiresViolations` -- tự nhận `conjunctions` qua `BRICKS[].teaches`. Không sửa.
- Test (Vitest env `node`, không có test component):
  - `src/data/foundation/foundation.test.ts`: `englishTexts`; số thẻ quy tắc (`:508-524`); "chỉ F06 và F15 có bảng" (`:659`); describe F15 mẫu (`:839-960`).
  - `src/data/foundation/foundation-catalog.test.ts:6-32`.
  - `src/data/questions/foundation.test.ts`: `ROW_C_IDS` `:68`, 44 câu `:79`, hàng C 12 câu `:133`, count `:201`.
  - `src/data/questions/requires.test.ts:28-30`.
  - `src/data/vocab/function-words.test.ts:17-25`.
  - `src/lib/flashcard-session.test.ts`: `W2_RULES` `:516`, `T1_W1_RULES` `:520`, `:534-640`, dãy khoá `:903-913`.
  - `src/lib/tense-scope.test.ts`: `:88-95`, `:200-207`.
  - `src/data/lessons/lessons.test.ts`: `CARDS` `:1217-1231`, 55 thẻ `:1251-1261` / `:1305-1313`, chỗ đặt khối `:1517-1546`, danh sách cấm `:1663`.
- `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- `:30` dòng F16, `:68` câu "vd can, will, do/does, and/but/or", `:119` "Từ tín hiệu và chọn thì".

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/types.ts` -- thêm `'conjunctions'` sau `'have-has'`, kèm comment "F16, story 44: and / but / or / because / so". Sửa doc comment `tables`.
- [x] `src/data/foundation/catalog.ts` -- meta F16:
  - `title: 'have/has + nối câu'`, `minutes: 10`, `teaches: ['have-has', 'conjunctions']`;
  - `goalVi` theo Design Notes.
- [x] `src/data/foundation/bricks/f16.ts` -- viết lại theo Design Notes:
  - explain: chữ mới + bảng `f16-linkers`;
  - contrast: thêm câu vào `viSays` / `enRequires`, thêm 1 ví dụ;
  - worked và faded giữ nguyên;
  - check: `c3`, `c5` mới; `c1`, `c2`, `c4` giữ; easier: `e1` giữ, `e2` mới;
  - apply: chữ mới, `sampleEn` mới, `a1` mới, giữ `f16-say-1` … `-3`, thêm `-4`, `-5`;
  - `ruleCards`: giữ 1–2, thêm 3–5; `themeWordIds` giữ;
  - doc comment đầu file: dạy `have-has`, `conjunctions`; phủ dạng cổng have, has, had, but, or, because; câu chỉ dùng F01–F16.
- [x] `src/data/vocab/function-words.ts` --
  - bỏ `'but'`, `'or'`, `'because'` khỏi `WALL_WORDS`;
  - nhóm F16 thêm `'ngsl-but': brick('F16', ['but'])`, `'ngsl-or': brick('F16', ['or'])`, `'ngsl-because': brick('F16', ['because'])`;
  - comment nhóm "F16 have/has + liên từ (but, or, because dời từ tường ở story 44; and, why giữ tường)".
- [x] `src/data/questions/foundation.ts` -- thêm `q-f16-03`, `q-f16-04` (Design Notes) sau `q-f16-02`. Sửa comment đầu file và comment `FOUNDATION_QUESTIONS`: 46 câu, hàng C 14 câu (F15 5, F16 4: story 43, 44).
- [x] `src/data/lessons/tense-choices.ts` -- thêm `QUESTION_WORDS` (id `question-words`, mục s1-t1-w3) trước `SIMPLE_VS_CONTINUOUS`, và `SUBJECT_QUESTIONS` (id `subject-questions`, mục s1-t2-w2) sau nó, theo Design Notes. Doc comment đầu file:
  - 5 khối;
  - lượng từ (F15) và liên từ (F16) đã dạy nên dùng được;
  - vẫn không "Don't + V".
- [x] `src/data/lessons/t1-grammar.ts` -- import `QUESTION_WORDS`. `GRAMMAR_W3 = { tenses: [PRESENT_SIMPLE_QUESTIONS], choices: [QUESTION_WORDS] }`. Thêm `present-simple-questions-rule-5` (Design Notes) sau rule-4.
- [x] `src/data/lessons/t2-t4-grammar.ts` -- import `SUBJECT_QUESTIONS`. `GRAMMAR_T2_W2 = { tenses: [PAST_TO_BE, PAST_SIMPLE], choices: [SUBJECT_QUESTIONS] }`. Thêm `past-simple-rule-5` sau rule-4.
- [x] `src/data/lessons/index.ts` -- re-export `QUESTION_WORDS`, `SUBJECT_QUESTIONS`.
- [x] `src/lib/tense-scope.ts` -- xoá `QUANTIFIERS_LINKERS` và nhánh dùng nó. Doc comment: nhóm "luôn bị báo" không còn "lượng từ / liên từ"; thêm một dòng "lượng từ (F15, story 43) và liên từ (F16, story 44) dạy ở Sân ga nên mọi thì dùng được".
- [x] `src/lib/tense-scope.test.ts` --
  - `:88-95`: bỏ 'because', 'so', 'many' khỏi danh sách bị báo;
  - `:204`: bỏ 'some' … 'so' khỏi `ALWAYS`;
  - thêm test "lượng từ, liên từ không bị báo ở cả 13 thì": "There are some eggs.", "How many books do you have?", "How much water…", "a lot of", "because", "so", "but".
- [x] `src/data/foundation/foundation-catalog.test.ts` -- `MINUTES.F16 = 10`, tổng 157.
- [x] `src/data/foundation/foundation.test.ts` -- sửa test cũ và thêm describe "F16 nối câu (story 44)":
  - thẻ quy tắc: F06 8, F15 6, F16 5, viên khác 1–2;
  - "chỉ F06, F15 và F16 có bảng"; id bảng F16 đúng `['f16-linkers']`;
  - bảng F16: `en` khớp `/^[A-Za-z' ,.?]+$/`, kết thúc `.` hoặc `?`; `vi` không rỗng; không `ipa`; `en` không trùng; đúng 7 dòng; có `noteVi`;
  - bảng F16 có đủ and, but, or, because, so và một dòng mở đầu bằng "Because"; `tableHasIpa` false;
  - F16 `teaches` đúng `['have-has', 'conjunctions']`;
  - `rule:f16-1`, `-2` giữ đúng cloze / answer cũ; `f16-rule-3` … `-5` có answer `['so', 'because', 'but']` và cloze có gợi ý trong ngoặc;
  - id câu luyện đúng `['f16-c1', …, 'f16-c5', 'f16-e1', 'f16-e2', 'f16-a1']`; `f16-c5` là `type` có `accept`; câu nói đúng `f16-say-1` … `-5`;
  - chấm cố định `f16-c5`: đúng "I'm happy because I have a new phone", "Because I have a new phone, I am happy."; sai "Because I have a new phone, so I am happy.", "I have a new phone because I am happy.", ô trống;
  - không "Because…, so…": mọi chuỗi đúng của F16 không khớp `/\bbecause\b[^.?!]*,\s*so\b/i`. Chuỗi đúng gồm dòng bảng, ví dụ contrast, worked, faded đã điền, câu mẫu, câu nói, thẻ đã điền, đáp án đúng của câu chọn / nghe, `answer` / `accept` câu gõ. Có tự kiểm regex;
  - khai báo khái niệm: mọi câu luyện có `uses` của mọi viên và mọi câu `FOUNDATION_QUESTIONS` có `\b(but|or|because|so)\b` thì phải có `conjunctions`.
    - Quét: đề đã điền + đáp án đúng, `audioText`, `answer` / `accept` câu gõ; không quét lựa chọn nhiễu, không quét and.
    - Có tự kiểm helper và đếm ≥ 5 câu bị quét trúng.
- [x] `src/data/questions/foundation.test.ts` --
  - 46 câu; `ROW_C_IDS` thêm `q-f16-03`, `q-f16-04`;
  - hàng A 12, C 14, B, D 10 (giữ ≤ 2 câu nghe, `minPerLesson`, 8 câu với 20 seed);
  - count C `{ f13: 3, f14: 2, f15: 5, f16: 4 }`;
  - `getQuestion('q-f16-01'/'-02')` không đổi; câu mới tag `từ loại`, `requires` có `conjunctions`.
- [x] `src/data/questions/requires.test.ts` -- `FOUNDATION_QUESTIONS` 46 câu (sửa cả tên test).
- [x] `src/data/vocab/function-words.test.ts` -- tổng 86: 36 cổng viên, 15 cổng bài, 35 cổng tường. Assert `ngsl-but`, `ngsl-or`, `ngsl-because` là `{ brick: 'F16' }`; `ngsl-and`, `ngsl-why` vẫn `'wall'`.
- [x] `src/lib/flashcard-session.test.ts` --
  - `T1_W1_RULES` dùng `n('present-simple-questions', 5)`, `W2_RULES` dùng `n('past-simple', 5)`; sửa các test kéo theo (9 thẻ của s1-t2-w2; danh sách thẻ mới của "Bài cũ đã xong" thêm `rule:past-simple-5`);
  - dãy khoá thành `[75, 74, 67, 59, 55, 50]`, "còn khoá 15" giữ;
  - thêm test:
    - xong F01–F16 → `ruleStudyWords` có `rule:f16-1` … `-5` đúng thứ tự, `lockedNewWordIds` không còn `ngsl-but`, `ngsl-or`, `ngsl-because` nhưng còn `ngsl-and`, `ngsl-why`;
    - xong F01–F15 → 3 từ đó vẫn khoá;
    - hàng C qua kiểm tra mà chưa học F16, và bỏ qua Sân ga → 3 từ mở, không có thẻ `rule:f16-*`;
    - store có `rule:f16-1`, `-2` từ trước → thêm 3 thẻ mới, thẻ cũ giữ lịch;
    - `rule:f16-6` không hiện, không đếm tồn ôn;
    - store có `rule:present-simple-questions-1` … `-4` (bài s1-t1-w3 đã xong) → phiên thêm đúng `-5`, thẻ cũ giữ lịch.
- [x] `src/data/lessons/lessons.test.ts` --
  - `CARDS`: `present-simple-questions` thêm `'often'`, `past-simple` thêm `'called'`; tổng 57 thẻ (cả `checked`);
  - chỗ đặt khối: `s1-t1-w3: ['question-words']`, `s1-t2-w2: ['subject-questions']` cùng 3 khối cũ; `allTenseChoices()` theo thứ tự `['question-words', 'simple-vs-continuous', 'subject-questions', 'will-vs-going-to', 'dont-translate']`; hai khối mới không có `sides`;
  - `:1663`: bỏ danh sách cấm some / any / … / but (comment: đã dạy ở F15, F16), giữ kiểm "Don't + V";
  - thêm describe "khối từ để hỏi và câu hỏi chủ ngữ (story 44)":
    - `viWords` đúng `['tại sao', 'bao lâu một lần', 'bao nhiêu']` / `['ai', 'cái gì']`, mỗi chữ 1–3 cách nói đủ trường;
    - 3–4 cặp câu; mỗi khối đúng 7 câu chính, 2 câu dễ hơn;
    - `question-words`: đáp án (`answerText`) có ≥ 1 Why, ≥ 1 How often, ≥ 1 How many / How much, ≥ 1 because hoặc so; ≥ 3 câu gõ;
    - `subject-questions`: ≥ 2 đáp án là câu hỏi chủ ngữ `/^(who|what) [a-z]+(ed|s)\b/i` không có did, ≥ 2 đáp án có `/\b(who|what) did\b/i`; ≥ 3 câu gõ;
    - không câu đúng nào có "because …, so …";
    - golden chấm của bảng I/O (`question-words-c5`, `subject-questions-c5`, `-c6`).
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` --
  - `:30` dòng F16 theo meta mới;
  - `:68` "vd can, will, do/does; and, why mở khi qua tường";
  - `:119` thêm khối "Hỏi tại sao, bao lâu một lần, bao nhiêu" (s1-t1-w3) và "Câu hỏi chủ ngữ" (s1-t2-w2).

**Acceptance Criteria:**
- Given Huy mở `#/foundation/F16` ở 375px, when mở bảng "Nối 2 câu" và bấm nghe dòng "Because I have a new job, I am happy.", then máy đọc cả câu, bảng không có cột IPA, và trang không cuộn ngang.
- Given Huy đang ở màn Áp dụng của F16, when chọn "Because I have a new job, so I am very happy.", then câu bị chấm sai, có giải thích "chỉ dùng một từ nối", và được chọn lại.
- Given Huy học xong F16 trong buổi 30', when sang bước Ôn, then gặp thẻ "Thẻ quy tắc · F16" "My son has a new game, ___ he is happy. (nên)", lật ra "so", có link "Xem lại viên F16".
- Given Huy mở bước Bài chính của buổi 30' ở bài s1-t1-w3, when cuộn qua thẻ hiện tại đơn câu hỏi, then thấy khối "Hỏi tại sao, bao lâu một lần, bao nhiêu" và khối luyện của nó. Bấm "Bắt đầu luyện" thì khối luyện của thì (nếu đang mở) tự đóng.
- Given máy cũ (bản trước story 44) đồng bộ store có `rule:f16-5` và `rule:past-simple-5`, when mở app cũ, then app không lỗi và thẻ không hiện.

## Implementation Notes

- **Đã làm đủ 18 việc ở Execution**, nội dung theo đúng chữ của Design Notes: explain mới kèm bảng `f16-linkers` 7 dòng (giải thích vẫn trong 40–80 chữ), contrast thêm câu và 1 ví dụ, `f16-c3` nghe câu but, `f16-c5` câu gõ có `accept`, `f16-e2`, apply / `f16-a1`, `f16-say-4`, `-5`, thẻ `f16-rule-3` … `-5`, `q-f16-03`, `-04`, 2 khối `question-words` / `subject-questions` và 2 thẻ thì `-rule-5`. Không lệch Design Notes về nghĩa. Chữ Việt tự thêm: nghĩa của cặp câu (`vi` của `a` / `b`), gợi ý và giải thích từng câu luyện của 2 khối. Không sửa component nào.
- **Cổng hư từ:** but, or, because dời từ `WALL_WORDS` sang F16 (`ngsl-but`, `-or`, `-because`); and, why giữ cổng tường. Test "hư từ của viên sau" vẫn qua: F13–F15 không có but / or / because.
- **Phạm vi chữ (`tense-scope.ts`):** xoá `QUANTIFIERS_LINKERS`, nên lượng từ và liên từ không còn bị báo ở thì nào. Test cũ đã sửa: bỏ some / because / so / many khỏi danh sách bị báo (gồm cả ca `present-simple` "không modal / some"). Test mới quét 8 câu ở cả 13 thì. Riêng "How many books do you have?" vẫn bị báo ở `present-simple` vì câu hỏi do / does chưa thuộc thì này, còn 12 thì kia không báo. Ở `lessons.test.ts`, bỏ danh sách cấm some / … / but, vẫn giữ kiểm "Don't + V".
- **Test khai báo `conjunctions`** (`foundation.test.ts`, describe "F16 nối câu (story 44)"):
  - quét `\b(but|or|because|so)\b`, không phân biệt hoa thường, trên đề đã điền + đáp án đúng, `audioText` và `answer` / `accept` câu gõ (helper `filledItemTexts` / `filledQuestionTexts` của story 43);
  - không quét lựa chọn nhiễu, không quét and;
  - có tự kiểm helper; số câu bị quét trúng ≥ 5, và câu nào bị quét trúng cũng khai báo đủ.
- **Test thêm ngoài danh sách:**
  - `foundation/questions.test.ts` kiểm `q-f16-01`, `-02` giữ nguyên chữ;
  - `flashcard-session.test.ts` kiểm thẻ `rule:f16-3` lật ra so, và ca "F16 xong hôm nay: 5 thẻ mới sau từ mới, không chiếm quota";
  - `lessons.test.ts` kiểm chữ của 2 thẻ thì mới, và giải thích của `question-words-c4` / `-c5` có "thiếu do / does".
- **Lệnh:**
  - `npm run lint`, `npm test` (85 file, 2077 test) và `npm run build` đều qua;
  - `npm run layout:guard`: 10 file nguồn đổi, không class nào bị thêm hay xoá.
- **`npm run layout:check`:** mọi route `ok` ở 5 bề rộng. Ảnh 375px chỉ lệch ở `/foundation` (315 pixel, ô F16 đổi tên và đổi 6' thành 10'). Probe phím tắt F01 ở 1280px báo LỖI ("gõ "chào 1" + Enter trong ô không chấm"); lỗi này có sẵn từ HEAD trước (story 41, 43), không sửa ở story này. Bộ chụp không có route F16, s1-t1-w3, s1-t2-w2.
- **Kiểm tay** (Chrome headless, `VITE_SUPABASE_*` rỗng):
  - `#/foundation/F16` hiện đoạn giải thích mới và bảng "Nối 2 câu…" đóng sẵn;
  - DOM trang bài s1-t1-w3 có khối "Hỏi tại sao, bao lâu một lần, bao nhiêu" và "Luyện: …" của nó, nằm sau phần luyện của thì;
  - DOM trang bài s1-t2-w2 có khối "Câu hỏi chủ ngữ…" và "Luyện: …" sau 2 thì;
  - lúc dựng chưa đo `scrollWidth` ở 375px cho 3 route này; ở bước review đã đo (xem Review Triage Log #12): bằng bề rộng ở 375px và 1280px. Ảnh chụp headless bị cắt mép phải ở cả F15 (trang không đổi), nên đó là giới hạn bề rộng cửa sổ headless, không phải lỗi bố cục.

## Spec Change Log

- **Review (2026-11-13), sửa chữ nội dung, không đổi phần frozen.** Phát hiện: review nêu lời giải thích sai hoặc lệch (vị trí “tại sao”, “did you open”, and / but “cùng chiều” và “trái nhau”), câu luyện chép nguyên ví dụ trên cùng thẻ, khối từ để hỏi không luyện Why + to be, regex “because … so” bỏ sót dạng không dấu phẩy. Sửa trong code, chữ ở đây thay cho Design Notes:
  - bảng `f16-linkers` dòng 2 thành "My house is big, and it is nice."; but = "hai ý trái nhau hoặc khác nhau" (dòng 3, `f16-c3`, `f16-rule-5`); `f16-rule-5` cloze "My car is old, ___ it is fast. (nhưng)"; `f16-c5` giải thích thêm "Chỉ dùng một từ nối…";
  - `q-f16-03` đề "My mother has a new bag, ___ she is very happy.", `requires` thêm `subject-pronouns`; `q-f16-04` giải thích thêm câu về lựa chọn 4;
  - `question-words`: `use` mới ("tại sao" đứng đầu; do / does hoặc am / is / are), dịch "How often is he late?", cặp 1 "On Saturdays.", công thức How often, quy tắc 2 nói Because… đứng một mình khi trả lời ngắn; `-c1` thành "Why ___ your sister tired?" [is · does · do]; `-c3` "How ___ friends does your brother have? — Ten."; `-e2` "How ___ milk does your son drink every day?";
  - `subject-questions`: "được làm" thành "nhận việc đó"; `-c1` câu trả lời "— Lan." và giải thích lựa chọn 3 là câu sai; `-c4` "My mother cleaned the kitchen." → "Who cleaned the kitchen?";
  - test: `BECAUSE_SO` bắt cả dạng không dấu phẩy (thay regex ở Tasks); `answerText` tính lựa chọn đúng cho câu chọn đề tiếng Việt.
  - Trạng thái tránh được: người học sai "Because…, so…" ở `f16-c5` không được nói lỗi; luyện bằng cách chép ví dụ. KEEP: id câu, số câu, golden I/O (`question-words-c5`, `subject-questions-c5`, `-c6`, `f16-c5`), cổng hư từ, mọi luật frozen.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | `f16-c5` giải thích không nói lỗi “Because…, so…” | medium | Giải thích chỉ nói lỗi đảo nghĩa; bảng I/O đòi giải thích khi gõ dạng Because…, so…. | patch: thêm câu “Chỉ dùng một từ nối…”, test `toContain` |
| 2 | blind | F16 mất phần luyện have với I / you / we / they | low | Ý frozen đã chọn giữ c1, c2, c4, e1 và đổi c3, c5, e2; have vẫn được tự gõ ở `f16-c5`, faded “They ___”, `f16-a1`. | reject |
| 3 | blind | `or` mở cổng ở F16 nhưng không có câu luyện | low | Đúng là chỉ có ở bảng và thẻ 5; ý frozen ấn định c3 (but), c5 (because), e2, a1, thẻ 3–5 (so, because, but). or là từ dễ, còn được ôn bằng thẻ hư từ khi mở. | reject |
| 4 | blind | learning-rules.md:68 nói không bài nào dạy and, why | low | Sau story 44, F16 dạy and và s1-t1-w3 dạy why; câu “(vd and, why)” sai. | patch: viết lại câu, giải thích vì sao vẫn giữ cổng tường |
| 5 | blind | Câu luyện chép nguyên ví dụ trên cùng thẻ | medium | `question-words-c3`, `-e2` trùng ví dụ viWords; `subject-questions-c4` trùng `pairs[1].a`. `-c5` / `-c6` trùng tên khối và cặp 1 nhưng đáp án bị ghim bởi bảng I/O frozen; thẻ `present-simple-questions-rule-5` ôn SRS ngày khác. | patch: đổi đề `-c3`, `-e2`, `subject-questions-c4`; giữ `-c5`, `-c6`, rule-5 |
| 6 | blind | `question-words` dạy Why + to be nhưng không luyện | medium | Không câu chính nào có Why is / are; lỗi “Why does she sad?” không được luyện. How often + be, How much is là phần nhỏ (giá đã có F14). | patch: `-c1` thành Why ___ your sister tired? [is · does · do], test đáp án có `^Why (am|is|are)` |
| 7 | blind | `subject-questions` không luyện Who + V-s, giới từ cuối câu, không có `accept` | low | Quy tắc 3 chỉ là ghi chú “hiện tại cũng vậy”; with có trong nghĩa Việt “sống với ai”; Whom / “the dinner” / bỏ books hiếm gặp ở A1 và đề đã cho từ. | reject |
| 8 | blind | Because đứng một mình trong câu trả lời lệch luật F16 | low | Ví dụ “— Because I need it…” cạnh dòng F16 “Because đứng đầu câu: dấu phẩy rồi câu kết quả”, không có ghi chú. | patch: quy tắc 2 nói rõ trả lời ngắn khi nói thì Because… đứng một mình được |
| 9 | blind | “On Saturday” cho thói quen; dịch “How often is he late?” mất “bao lâu một lần” | low | Đúng ở `tense-choices.ts:89`, `:61`. | patch: “On Saturdays.”, “Anh ấy đi trễ bao lâu một lần?” |
| 10 | blind | Soát vé hỏi lại cảnh vừa luyện (`q-f16-03` ~ `f16-a1`, `q-f16-04` ~ `f16-rule-5`); không test trùng nguyên văn | low | Phần “không test” là sai: `foundation.test.ts:397` đã so trùng câu quiz hàng B–D với câu của viên. Phần trùng cảnh là thật. | patch: `q-f16-03` đổi sang “My mother has a new bag…”, `f16-rule-5` đổi sang “My car is old, ___ it is fast.” |
| 11 | blind | `BECAUSE_SO_RE` bỏ sót “Because X so Y” không dấu phẩy | low | Regex cần `,\s*so`. | patch: gộp với #13, #14 |
| 12 | blind | Chưa đo `scrollWidth` 375px cho F16, s1-t1-w3, s1-t2-w2 | low | Đã đo bằng Chrome headless (vite dev, `VITE_SUPABASE_*` rỗng, profile mới), mở mọi khối đóng và khối luyện: 375px `scrollWidth` = 375 ở cả 3 route, 1280px bằng `clientWidth`, không phần tử nào tràn; bảng có dòng mới, 2 khối hiện đúng bài. | patch: đã đo, không cần sửa code |
| 13 | edge | `foundation.test.ts` BECAUSE_SO_RE thiếu dạng không dấu phẩy | low | Như #11. | patch: `/\bbecause\b[^.?!]*\bso\b/i` + tự kiểm dạng không dấu phẩy |
| 14 | edge | `lessons.test.ts` BECAUSE_SO thiếu dạng không dấu phẩy | low | Như #11. | patch: cùng regex + tự kiểm |
| 15 | edge | Quét so trạng từ (“I am so tired”) ở F01–F15 sẽ đòi `conjunctions` | low | Không câu nào hiện có; nếu có thì test báo đỏ rõ ràng và luật spec là sửa câu. | reject |
| 16 | edge | Câu không có `uses` bị bỏ qua khi quét liên từ | low | `uses` tuỳ chọn theo thiết kế (viên hàng A), cùng mẫu với test days-months (`:742`) và F15; hiện test qua. | reject |
| 17 | edge | `tables[0]` undefined làm hỏng cả file test | false | Chỉ xảy ra khi F16 mất bảng, khi đó test báo lỗi rõ ràng; không phải lỗi chạy thật. | reject |
| 18 | edge | `answerText` lấy đề tiếng Việt cho câu chọn không có ___ | low | Đúng: “What did you cook?” (`subject-questions-c7`) không được đếm. | patch: câu chọn không ___ lấy lựa chọn đúng; test `toContain('What did you cook?')` |
| 19 | edge | `q-f16-03` có she mà `requires` thiếu `subject-pronouns` | low | Lệch với `q-f16-04` (khai báo it). | patch: thêm `subject-pronouns` |
| 20 | edge | Ví dụ `ngsl-because` “because of the rain” hiện trong Sân ga | low | words.json:63 có ví dụ này; cổng mới làm thẻ mở sớm hơn. Sửa cần đổi words.json / example-overrides.json, bị cấm ở Never. | defer |
| 21 | edge | learning-rules.md:19 (luật hư từ) sai sau story 44 | low | Như #4. | patch: gộp #4 |
| 22 | content | `QUESTION_WORDS.use` sai vị trí “tại sao” và nói luôn do / does | medium | Ví dụ của khối đặt “Tại sao” đầu câu; Why is she sad? không dùng do / does. | patch: viết lại `use` |
| 23 | content | Giải thích `subject-questions-c1` nói “did you open hỏi người được mở” | medium | “Who did you open the window?” là câu sai, không phải câu hỏi người được mở. | patch: nói lựa chọn này thừa you, không phải câu đúng |
| 24 | content | and / but: cùng ý mèo–chó lúc gọi “cùng chiều”, lúc “trái nhau” | medium | Dòng 2 bảng dùng and, `f16-c3`, `f16-say-4` dùng but với cùng ý. | patch: dòng 2 “My house is big, and it is nice.”; but = trái nhau hoặc khác nhau |
| 25 | content | “được làm” khó hiểu | low | Ở `use`, whenVi, quy tắc 2. | patch: “nhận việc đó” |
| 26 | content | Gọi “Who did call you?” là sai tuyệt đối | low | Dạng nhấn mạnh có thật nhưng hiếm; spec (I/O frozen) chọn giải thích “Who là chủ ngữ thì không mượn did” cho trình độ này. | reject |
| 27 | content | `subject-questions-c1` trả lời “— Lan did.” gây rối | low | did ngay cạnh luật không mượn did và trong lựa chọn nhiễu. | patch: “— Lan.” |
| 28 | content | “On Saturday” cho thói quen | low | Như #9. | patch: gộp #9 |
| 29 | content | “Usually.” đứng một mình không tự nhiên | low | Ở công thức How often. | patch: “Every day. / Every week. / Sometimes. / Never.” |
| 30 | content | Dịch “How often is he late?” thành câu có / không | low | Như #9. | patch: gộp #9 |
| 31 | content | `question-words-e2` chép ví dụ How much | low | Như #5. | patch: gộp #5 |
| 32 | content | `present-simple-questions-rule-5` gần giống `say-1`, `-c2` | low | Thẻ SRS hiện ở phiên ôn ngày khác, không trùng đề quiz. | reject |
| 33 | content | Tiêu đề bảng “Nối 2 câu” mà có dòng nối từ | low | Tiêu đề ghi trong bảng I/O frozen; dòng 1 ghi rõ “nối hai từ”. | reject |
| 34 | content | `f16-rule-5` small / clean không trái nghĩa | low | and cũng hợp ngữ pháp, chỉ gợi ý (nhưng) quyết định. | patch: gộp #10 (My car is old, ___ it is fast.) |
| 35 | content | Giải thích `q-f16-04` thiếu lựa chọn 4 | low | Không nói vì sao “So the room is small, it is hot.” sai. | patch: thêm “so đứng trước kết quả, không đứng đầu câu lý do” |
| 36 | content | Công thức “Who / What + V-ed” dễ làm tưởng luôn -ed | false | s1-t2-w2 chỉ có động từ có quy tắc; thẻ `past-simple` cùng bài dùng V-ed; thì bất quy tắc sau đó dạy V2 riêng (`t2-t4-grammar.ts:531`). | reject |
| 37 | content | learning-rules.md:68 nói and, why không bài nào dạy | low | Như #4. | patch: gộp #4 |

Verification-gap: không có phát hiện. Tổng 37 dòng: 26 patch, 1 defer, 10 reject.

## Design Notes

**Meta F16:** `goalVi`: "Nói sở hữu, has với he/she/it, \"I am 25\"; nối 2 câu bằng and/but/or/because/so, không nói \"Because…, so…\"".

**Explain `textVi`** (khoảng 76 chữ theo `countWords`; sửa chữ được, miễn 40–80): "have nghĩa là “có” (sở hữu): I have a sister. Ngôi thứ ba số ít (he, she, it, một người, một vật) dùng has: She has a cat. Khác There is: have nói ai có gì, There is nói ở đâu có gì. Nói tuổi dùng to be: I am 25. Nối hai câu: and (và), but (nhưng), or (hoặc), because (vì, trước lý do), so (nên, trước kết quả). Bảng bên dưới có câu mẫu."

**Bảng `f16-linkers`** "Nối 2 câu: and, but, or, because, so" (`en` · `vi`, không IPA):
- I have a sister and a brother. · and: và, nối hai từ;
- She has a cat, and I have a dog. · and: và, nối hai câu cùng chiều;
- My house is small, but it is nice. · but: nhưng, hai ý trái nhau;
- Is it a cat or a dog? · or: hoặc, hay, chọn một trong hai;
- I am happy because I have a new job. · because: vì, sau because là lý do;
- I have a new job, so I am happy. · so: nên, sau so là kết quả;
- Because I have a new job, I am happy. · Because đứng đầu câu: dấu phẩy rồi câu kết quả, không thêm so;
- note: "Tiếng Việt nói “Vì… nên…”, tiếng Anh chỉ dùng một từ: because hoặc so, không dùng cả hai. Trước but và so thường có dấu phẩy."

**Contrast:** giữ chữ và 5 ví dụ cũ.
- `viSays` thêm: " Nối câu: “Vì có việc mới nên tôi vui” dùng cả “vì” lẫn “nên”."
- `enRequires` thêm: " Nối câu chỉ dùng một từ: “Because I have a new job, I am happy.” hoặc “I have a new job, so I am happy.”, không nói “Because I have a new job, so I am happy.”."
- `examples` thêm `{ vi: 'Nhà tôi nhỏ nhưng đẹp.', en: 'My house is small, but it is nice.' }`.

**Câu luyện mới của F16:**
- `f16-c3` (listen):
  - audioText "I have a cat, but my sister has a dog."; prompt "Bạn nghe thấy câu nào?";
  - lựa chọn: I have a cat, but my sister has a dog. · I have a cat, and my sister has a dog. · I have a cat, but my sister have a dog.; đáp án 0;
  - hint "Nghe từ nối ở giữa (and hay but) và động từ sau my sister.";
  - explanation "Câu nghe dùng but (nhưng) vì hai ý trái nhau: tôi có mèo, chị tôi có chó. my sister = she nên dùng has.";
  - uses `['conjunctions', 'have-has', 'possessive-adjectives', 'articles']`.
- `f16-c5` (type):
  - prompt 'Nối 2 câu bằng because: “I am happy.” “I have a new phone.”';
  - answer "I am happy because I have a new phone."; accept `['Because I have a new phone, I am happy.']`;
  - hint "because đứng trước lý do (tôi có điện thoại mới).";
  - explanation "because đứng trước lý do: I am happy because I have a new phone. Đảo lại (I have a new phone because I am happy) là sai nghĩa: có điện thoại vì vui.";
  - uses `['conjunctions', 'have-has', 'be-affirmative', 'adjective-before-noun', 'articles']`.
- `f16-e2` (choice):
  - prompt "because nghĩa là gì?"; lựa chọn: vì, bởi vì · nên, vì vậy · nhưng; đáp án 0;
  - hint "because đứng trước lý do.";
  - explanation "because = vì (trước lý do); so = nên (trước kết quả); but = nhưng.";
  - uses `['conjunctions']`.
- apply:
  - promptVi: "Áp dụng: nói về bạn và người thân bằng 3 câu: một câu have / has, một câu nối bằng but, một câu nối bằng because hoặc so. Chọn câu đúng, rồi nói theo mẫu với người nhà của bạn.";
  - sampleEn: "I have a sister. She has a cat, but I have a dog. I am happy because I have a new job.";
  - `f16-a1` (choice):
    - prompt 'Bạn muốn nói “Vì có việc mới nên tôi rất vui.”:';
    - lựa chọn: I have a new job, so I am very happy. · Because I have a new job, so I am very happy. · I have a new job, because I am very happy.; đáp án 0;
    - hint "Tiếng Anh chỉ dùng một từ nối: because hoặc so.";
    - explanation "so đứng trước kết quả: I have a new job, so I am very happy. Không dùng cả because và so trong một câu (chỉ dùng một từ nối). Câu thứ ba sai nghĩa: có việc mới vì vui.";
    - uses `['conjunctions', 'have-has', 'be-affirmative', 'adjective-before-noun', 'articles']`;
  - speak: giữ 3 câu cũ, thêm:
    - `{ id: 'f16-say-4', text: 'She has a cat, but I have a dog.', vi: 'Chị ấy có một con mèo, nhưng tôi có một con chó.' }`;
    - `{ id: 'f16-say-5', text: 'I am happy because I have a new job.', vi: 'Tôi vui vì tôi có việc mới.' }`.

**Thẻ quy tắc mới của F16** (cloze → answer · vi):
- `f16-rule-3`: `My son has a new game, ___ he is happy. (nên)` → `so` · "so đứng trước kết quả: A, so B (A nên B). because đứng trước lý do: B because A."
- `f16-rule-4`: `She is sad ___ her cat is sick. (vì)` → `because` · "because đứng trước lý do. Chỉ dùng một từ nối, không nói “Because…, so…”."
- `f16-rule-5`: `The room is small, ___ it is clean. (nhưng)` → `but` · "but nối hai ý trái nhau, and nối hai ý cùng chiều, or (hoặc) để chọn một: Is it a cat or a dog?"

**Câu Soát vé mới** (sau `q-f16-02`, `lessonId: 'f16'`, `sectionId: 'grammar'`, tag `từ loại`, `kind: 'choice'`):
- `q-f16-03`:
  - prompt "My sister has a new job, ___ she is very happy."; lựa chọn: so · because · but · or; đáp án so;
  - explanation "Vế sau là kết quả (có việc mới nên vui) nên dùng so. because đứng trước lý do; but nối hai ý trái nhau; or là “hoặc”.";
  - requires `['conjunctions', 'have-has', 'be-affirmative', 'possessive-adjectives', 'adjective-before-noun', 'articles']`.
- `q-f16-04`:
  - prompt "Câu nào đúng cho “Vì căn phòng nhỏ nên nó nóng.”?";
  - lựa chọn: The room is small, so it is hot. · Because the room is small, so it is hot. · The room is small, because it is hot. · So the room is small, it is hot.; đáp án câu đầu;
  - explanation "Tiếng Anh chỉ dùng một từ nối: The room is small, so it is hot. (hoặc Because the room is small, it is hot.). Không dùng cả because và so; because đứng trước lý do.";
  - requires `['conjunctions', 'be-affirmative', 'subject-pronouns', 'articles']`.

**Khối `question-words`** (s1-t1-w3):
- name "Hỏi tại sao, bao lâu một lần, bao nhiêu".
- use: "Tiếng Việt hay để “tại sao”, “bao lâu một lần”, “bao nhiêu” ở giữa hoặc cuối câu; tiếng Anh luôn đưa từ để hỏi lên đầu, rồi do / does + chủ ngữ + động từ nguyên mẫu."
- `viWords`:
  - "tại sao":
    - `Why + do / does + S + V …?` · "Hỏi lý do; trả lời bằng Because + câu đầy đủ" · "Why do you study English? — Because I need it for my job." / "Tại sao bạn học tiếng Anh? — Vì tôi cần nó cho công việc.";
    - `Why + am / is / are + S …?` · "Câu có tính từ, nơi chốn (to be): không mượn do / does" · "Why is she sad? — Because her cat is sick." / "Tại sao cô ấy buồn? — Vì con mèo của cô ấy bị ốm.".
  - "bao lâu một lần":
    - `How often + do / does + S + V …?` · "Hỏi tần suất; trả lời bằng every day, every Sunday hay trạng từ tần suất của viên F18 (always, usually, sometimes, never)" · "How often do you go to the gym? — Every Sunday." / "Bạn đi tập gym bao lâu một lần? — Chủ nhật nào cũng đi.";
    - `How often + am / is / are + S …?` · "Câu có to be" · "How often is he late? — Never." / "Anh ấy có hay đi trễ không? — Không bao giờ.".
  - "bao nhiêu":
    - `How many + danh từ số nhiều + do / does + S + V …?` · "Hỏi số lượng thứ đếm được" · "How many brothers do you have? — Two." / "Bạn có bao nhiêu anh em trai? — Hai.";
    - `How much + danh từ không đếm được + do / does + S + V …?` · "Hỏi lượng thứ không đếm được (water, money)" · "How much water do you drink every day?" / "Mỗi ngày bạn uống bao nhiêu nước?";
    - `How much is / are …?` · "Hỏi giá (viên F14)" · "How much is this bag?" / "Cái túi này giá bao nhiêu?".
- pairs:
  - "How often do you play tennis? — Every Saturday." / "When do you play tennis? — On Saturday." · "How often hỏi bao lâu một lần; When hỏi lúc nào.";
  - "How many books do you have?" / "How much money do you have?" · "books đếm được, số nhiều → many; money không đếm được → much.";
  - "Why are you tired? — Because I work late." / "Why do you work late? — Because I have a lot of work." · "Có tính từ (tired) thì Why are you…?; có động từ thường (work) thì Why do you…?".
- formulas:
  - `Why`: "Why + do / does + S + V …?  → Because + S + V.";
  - `How often`: "How often + do / does + S + V …?  → Every day. / Usually. / Never.";
  - `How many / How much`: "How many + danh từ số nhiều / How much + danh từ không đếm được + do / does + S + V …?".
- rules:
  1. "Từ để hỏi đứng đầu câu, rồi do / does + chủ ngữ + động từ nguyên mẫu: Why do you…? How often does she…? Câu có am / is / are thì đảo to be: Why is she sad?"
  2. "Why hỏi lý do, trả lời bằng Because + câu đầy đủ (Because I need it.). How often hỏi bao lâu một lần, trả lời bằng every day, every Sunday, usually, sometimes, never."
  3. "How many + danh từ số nhiều (books, brothers); How much + danh từ không đếm được (water, money). How much is it? là hỏi giá."
- practice:
  - worked: "Why do you study English? — Because I need it for my job." / "Tại sao bạn học tiếng Anh? — Vì tôi cần nó cho công việc."; noteVi "Why đứng đầu, rồi do + you + study (nguyên mẫu). Trả lời lý do bằng Because + câu đầy đủ, không chỉ nói Because.".
  - faded: "How ___ do you cook? — Every day." → `often`; vi "Bạn nấu ăn bao lâu một lần? — Ngày nào cũng nấu."; hint "Hỏi bao lâu một lần.".
  - items:
    - `-c1` choice "___ does your sister work late? — Because she has a lot of work." [Why · How often · How many] → Why;
    - `-c2` type "How often ___ your father play football? — Every Sunday." → `does`;
    - `-c3` choice "How ___ brothers do you have? — Two." [many · much · often] → many;
    - `-c4` type "Dịch sang tiếng Anh: Tại sao bạn thích tiếng Anh? (why, like, English)" → "Why do you like English?";
    - `-c5` type "Dịch sang tiếng Anh: Bạn đọc sách bao lâu một lần? (how often, read books)" → "How often do you read books?";
    - `-c6` type "Đổi sang câu hỏi với How many: She has three cats." → "How many cats does she have?";
    - `-c7` choice "“Vì trời lạnh nên tôi ở nhà.” nói thế nào?" [It is cold, so I am at home. · Because it is cold, so I am at home. · It is cold, because I am at home.] → câu đầu.
  - easier:
    - `-e1` choice "Why nghĩa là gì?" [tại sao · bao lâu một lần · bao nhiêu] → tại sao;
    - `-e2` choice "How ___ water do you drink every day?" [much · many · often] → much.
  - Mỗi câu có hint và explanation ngắn theo quy tắc trên. Lỗi "Why you…?" giải thích "thiếu do / does".
  - apply:
    - promptVi "Hỏi một người bạn 3 câu: một câu Why, một câu How often, một câu How many. Rồi tự trả lời một câu Why bằng Because.";
    - sampleEn "Why do you study English? How often do you play sports? How many brothers do you have? I study English because I need it for my job.";
    - speak `question-words-say-1` "How often do you play football?" / "Bạn chơi bóng đá bao lâu một lần?", `-say-2` "I study English because I need it for my job." / "Tôi học tiếng Anh vì tôi cần nó cho công việc.".

**Khối `subject-questions`** (s1-t2-w2; chỉ động từ có quy tắc: call, happen, cook, help, open, clean, visit…):
- name "Câu hỏi chủ ngữ: Who called? hay Who did you call?".
- use: "Tiếng Việt đổi chỗ chữ “ai” (Ai gọi bạn? / Bạn gọi ai?); tiếng Anh xem Who / What là chủ ngữ hay là người, vật được làm, rồi mới quyết định có mượn did hay không."
- `viWords`:
  - "ai":
    - `Who + V-ed …?` · "“Ai” là người làm việc đó (chủ ngữ): không mượn did, động từ ở quá khứ" · "Who called you last night? — My mother." / "Tối qua ai gọi cho bạn? — Mẹ tôi.";
    - `Who + did + S + V …?` · "“Ai” là người được làm (bạn gọi ai, bạn giúp ai): mượn did, động từ nguyên mẫu" · "Who did you call last night? — My mother." / "Tối qua bạn gọi cho ai? — Mẹ tôi.".
  - "cái gì":
    - `What + V-ed …?` · "“Chuyện gì, cái gì” là chủ ngữ: What happened?" · "What happened yesterday? — The bus was late." / "Hôm qua đã xảy ra chuyện gì? — Xe buýt đến muộn.";
    - `What + did + S + V …?` · "Hỏi người ta đã làm gì: mượn did" · "What did you cook yesterday? — Fish." / "Hôm qua bạn nấu món gì? — Cá.".
- pairs:
  - "Who called you?" / "Who did you call?" · "Who called you? hỏi người gọi (Who là chủ ngữ). Who did you call? hỏi người được gọi (you là chủ ngữ).";
  - "Who cooked dinner? — My father." / "What did your father cook? — Fish." · "Hỏi người nấu thì Who + V-ed. Hỏi món được nấu thì What + did + S + V.";
  - "What happened? — I missed the bus." / "What did you do? — I stayed at home." · "What happened hỏi chuyện xảy ra (What là chủ ngữ). What did you do hỏi bạn đã làm gì.";
  - "Who lives here? — My sister." / "Who do you live with? — My sister." · "Hiện tại cũng vậy: Who + V-s (như he / she) khi Who là chủ ngữ; Who do you … with? khi you là chủ ngữ.".
- formulas:
  - `Hỏi chủ ngữ`: "Who / What + V-ed …?  Who called you? What happened?";
  - `Hỏi tân ngữ`: "Who / What + did + S + V nguyên mẫu …?  Who did you call?".
- rules:
  1. "Who / What là chủ ngữ (hỏi ai làm, chuyện gì xảy ra): giữ trật tự câu khẳng định, không mượn did: Who called you? What happened?"
  2. "Who / What là người, vật được làm (bạn gọi ai, bạn nấu gì): mượn did + chủ ngữ + động từ nguyên mẫu như câu hỏi Wh- thường: Who did you call? What did you cook?"
  3. "Hiện tại cũng vậy: Who lives here? (Who + V-s, như he / she) so với Who do you live with?"
- practice:
  - worked: "Who called you last night? — My boss." / "Tối qua ai gọi cho bạn? — Sếp tôi."; noteVi "Hỏi người gọi nên Who là chủ ngữ: Who + called, không có did. Câu trả lời My boss là người gọi.".
  - faded: "Who ___ (help) you yesterday? — My brother." → `helped`; vi "Hôm qua ai giúp bạn? — Anh trai tôi."; hint "Who là người giúp (chủ ngữ): không mượn did.".
  - items:
    - `-c1` choice "Who ___ the window? — Lan did." [opened · did open · did you open] → opened;
    - `-c2` choice "Who ___ you call last night? — My sister." [did · was · do] → did;
    - `-c3` type "What ___ (happen) at the office yesterday?" → `happened`;
    - `-c4` type "Đổi sang câu hỏi với Who, hỏi ai đã nấu: My father cooked dinner." → "Who cooked dinner?";
    - `-c5` type "Dịch sang tiếng Anh: Ai đã gọi cho bạn? (who, call)" → "Who called you?";
    - `-c6` type "Dịch sang tiếng Anh: Bạn đã gọi cho ai? (who, call)" → "Who did you call?";
    - `-c7` choice "“Bạn đã nấu món gì?” nói thế nào?" [What did you cook? · What cooked you? · What you cooked?] → câu đầu.
  - easier:
    - `-e1` choice "“Ai đã giúp bạn?” nói thế nào?" [Who helped you? · Who did help you? · Who you helped?] → câu đầu;
    - `-e2` choice "“Bạn đã giúp ai?” nói thế nào?" [Who did you help? · Who helped you? · Who you helped?] → câu đầu.
  - Lời giải thích của câu sai "Who did call you?" nói rõ "Who là chủ ngữ thì không mượn did".
  - apply:
    - promptVi "Hỏi một người bạn 2 câu về hôm qua: một câu hỏi ai đã làm gì (Who + V-ed), một câu hỏi bạn ấy đã làm gì (What did you…?).";
    - sampleEn "Who called you yesterday? What did you cook for dinner?";
    - speak `subject-questions-say-1` "What happened?" / "Đã xảy ra chuyện gì?", `-say-2` "Who did you call yesterday?" / "Hôm qua bạn đã gọi cho ai?".

**Thẻ quy tắc của thì** (cloze → answer · vi):
- `present-simple-questions-rule-5`: `How ___ do you play football? — Every Sunday.` → `often` · "How often + do / does + S + V…? hỏi bao lâu một lần; trả lời bằng every day, every Sunday, usually, sometimes, never."
- `past-simple-rule-5`: `Who ___ (call) you last night? — My sister.` → `called` · "Who là người làm (chủ ngữ): Who + V-ed, không mượn did (không nói Who did call you?). Hỏi người được gọi thì mượn did: Who did you call?"

Câu khối và thẻ không trùng nguyên văn đề quiz cùng bài. Nếu test trùng câu hay phạm vi chữ báo đỏ thì đổi chữ của câu (giữ id, giữ ý), không đổi luật.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: đều qua.
- `npm run layout:guard` -- expected: không báo class mới hay class bị xoá. Story này không sửa component; có báo thì ghi danh sách vào Implementation Notes.
- `npm run layout:check` -- expected: mọi route `ok` ở 5 bề rộng. Ảnh 375px chỉ lệch ở `/foundation` (ô F16 đổi tên và 6' thành 10') và ở route bài s1-t1-w3 / s1-t2-w2 nếu bộ chụp có. Lỗi probe phím tắt F01 có sẵn từ HEAD trước (story 41, 43) thì ghi lại, không sửa ở story này.

**Manual checks (if no CLI):**
- Chrome headless 375px và 1280px, `VITE_SUPABASE_*` rỗng:
  - `#/foundation/F16`: bảng đóng, mở ra đủ 7 dòng, 2 cột, có ghi chú, `scrollWidth` bằng bề rộng; màn luyện `f16-c5` hiện ô gõ, gõ đáp án thì đúng;
  - trang bài s1-t1-w3 và s1-t2-w2: khối mới hiện sau thì của bài, mở khối luyện thì khối khác đóng, `scrollWidth` bằng bề rộng;
  - `#/foundation/F15`, `#/foundation/F06` không đổi.
