---
title: 'Lượng từ và There is / are ở dạng phủ định, câu hỏi (CAP-23, learning-rules "Sân ga 9¾", "Thẻ quy tắc", "Hư từ", "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: '655bab0cc636ea72a131397ce538caffaadcf7fd'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/34-f06-numbers-days-months.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/26-row-cd-content-glossary-wall-pass.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/24-srs-function-words-rule-cards-examples.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" là Huy **tự làm ra** được câu đúng (gõ, biến đổi, nói), không chỉ nhận ra. Báo cáo kiểm tra mục T5: không viên nào dạy some / any / much / many / a lot of / How many (`function-words.ts:35` để some, any, many ở `WALL_WORDS`; F11 chỉ dạy mạo từ); F15 chỉ có câu khẳng định, không có There isn't / aren't, Is there…? / Are there any…?, trả lời ngắn. Trong khi đó câu ví dụ và câu quiz sau này đã dùng các dạng này.
- Quyết định 4: dùng lại tối đa bộ máy Sân ga: màn của viên, bảng tra trong màn giải thích (story 34), câu gõ `type` trong `CheckItem` (story 35), thẻ quy tắc vào SRS, `uses` / `requires`, cổng hư từ.
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn; câu chỉ dùng kiến thức đã dạy; giao diện 375px không đổi ngoài phần mới; không nâng schema store, không thêm key đồng bộ.
- Claude chọn:
  - **Mở rộng F15, không thêm viên mới** (như story 34 mở rộng F06). CAP-23 chốt 18 viên F01–F18; `BRICK_IDS`, `brickIdFromLessonId` (`/^f\d{2}$/`), test danh mục (18 id liên tiếp), "x/18", +5 điểm Nhà mỗi viên và luật "hàng xong = mọi viên của hàng xong" đều dựa vào số viên. Thêm viên sẽ làm hàng C của người đã học xong hàng tụt về "chưa xong". F15 đã dạy There is / are và dùng `countable-uncountable` (F11) nên là chỗ tự nhiên cho "There aren't any…", "How many … are there?".
  - **Thêm 2 khái niệm do F15 dạy:** `there-negative-questions` (There isn't / aren't, Is there…? / Are there…?, trả lời ngắn) và `quantifiers` (some / any, many / much, a lot of, How many / How much hỏi lượng). F15 `teaches` thành 4 khái niệm. Id viên, tiến độ, thứ tự màn, tên viên (`title`) giữ nguyên.
  - **Phần chữ dài nằm trong 2 bảng tra** của màn giải thích (cơ chế `tables` của story 34): "There is / There are: 3 dạng" và "some, any, many, much, a lot of". Đoạn giải thích vẫn 40–80 chữ. Bảng câu không có IPA, nên `BrickTables` bỏ cột IPA khi không dòng nào trong bảng có `ipa` (kéo theo bảng "Giờ, giá, số phòng" của F06 mất cột IPA trống; 5 bảng còn lại của F06 không đổi).
  - **Màn luyện:** giữ `f15-c1`, `-c2`, `-c4`, `-e1` (vẫn đủ câu chọn giới từ nơi chốn và lỗi "Is a book on the table."); `f15-c3` thành câu nghe câu hỏi "Are there any…?"; `f15-c5` thành **câu gõ** đổi sang phủ định (some → any); `f15-e2` thành câu dễ some hay any; câu Áp dụng `f15-a1` thành câu hỏi How many. Thêm 2 câu nói. Id câu giữ nguyên vị trí.
  - **Thẻ quy tắc:** giữ `f15-rule-1`, `-2` y nguyên, thêm `f15-rule-3` … `-6` (Is there, any, How many, much). Riêng F15 có 6 thẻ (F06 có 8, viên khác 1–2).
  - **Soát vé hàng C** thêm `q-f15-04` (any) và `q-f15-05` (How much + không đếm được): hàng C 12 câu, mỗi lần vẫn bốc 8. Lý do như story 34: Soát vé đạt thì F15 tính là đã dạy, nên đề phải hỏi được phần mới.
  - **Cổng hư từ:** some, any, many rời `WALL_WORDS`, gắn F15. much giữ cổng F14 (How much hỏi giá) vì dời cổng ra sau sẽ đóng một cổng đã mở. Câu ví dụ của các từ này giữ nguyên (`words.json`, `example-overrides.json` không đổi; luật câu ví dụ cho phép hiện tại đơn).
  - **Test khai báo:** câu nào có lượng từ hoặc There phủ định / câu hỏi thì phải khai báo khái niệm mới (câu luyện viên có `uses`, câu quiz có `requires`), như test `days-months` của story 34.
  - F15 tăng từ 10' lên 13' (tổng Sân ga 153'). `goalVi` ghi đủ phần mới.

**Problem:** Người học chưa có chỗ nào học some / any / much / many / How many và There is / are ở dạng phủ định, câu hỏi. Đây là mẫu câu A1 cốt lõi, gặp nhiều ở TOEIC Part 1–2, và các bài sau (T3-W2 "doesn't have any money", T4-W1 "some water", T4-W3 "many countries") đã dùng. Ngoài ra some / any / many chỉ mở trong thẻ từ khi qua tường, không theo viên dạy chúng.

**Approach:** Mở rộng nội dung F15 (2 khái niệm mới, 2 bảng tra, câu luyện có câu gõ, 4 thẻ quy tắc mới, 2 câu Soát vé). `BrickTables` ẩn cột IPA khi bảng không có IPA. Dời cổng some / any / many sang F15. Test khoá nội dung, số câu và việc khai báo khái niệm.

## Boundaries & Constraints

**Always:**
- F15 vẫn đúng 6 màn theo thứ tự. Giải thích 40–80 chữ (`countWords`), check đúng 5 câu, easier đúng 2, câu chọn có 3 lựa chọn khác nhau, ≥ 1 câu listen, ≥ 1 câu chọn giới từ nơi chốn có 3 lựa chọn đều là giới từ nơi chốn, đúng 5 từ chủ đề như cũ. `uses` của câu chỉ là khái niệm của F01–F15.
- Câu tiếng Anh của F15 (cả dòng bảng, ghi chú bảng, thẻ quy tắc, đáp án và `accept` của câu gõ) theo luật hàng C–D: không do / does / did, khuyết thiếu, 've / 'll / 'd, n't ngoài isn't / aren't; không have / has / had, at, every, always, never, often (cổng của viên sau); không near hay giới từ nơi chốn chưa dạy.
- Bảng của F15: `en` là câu hoàn chỉnh, chỉ gồm chữ, dấu cách, dấu nháy, dấu phẩy, dấu chấm, dấu hỏi, kết thúc bằng `.` hoặc `?`; `vi` không rỗng; không có `ipa`; `en` không trùng trong bảng.
- Giữ nguyên id SRS và chữ của `rule:f15-1`, `rule:f15-2`. Thẻ mới là key mới trong `srs.cards`: không nâng schema, không thêm key đồng bộ.
- Giữ nguyên id và nội dung `q-f15-01` … `-03` (Sổ lỗi tham chiếu theo id). Câu mới: 4 lựa chọn, `sectionId: 'grammar'`, tag `từ loại`, `requires` chỉ gồm khái niệm F01–F16 và có ≥ 1 khái niệm của F15. Câu quiz không trùng nguyên văn câu nào của viên.
- Cổng đã mở không đóng: người đã qua / bỏ qua Sân ga hoặc đã qua hàng C vẫn thấy some / any / many như cũ.
- Viên khác không đổi giao diện. Bảng co theo 375px, không cuộn ngang. `layout:guard` không được báo class mới hay class bị xoá.

**Never:**
- Không làm việc của story sau:
  - why / how often / How many trong bài s1-t1-w3, liên từ, câu hỏi chủ ngữ (44);
  - modal mới (45); quá khứ tiếp diễn (46); Bản đồ thì (42);
  - `requires` cho câu T2–T4 cũ, test quay lại ở Sân ga (47).
- Không thêm viên; không đổi `BRICK_IDS`, `ROW_IDS`, hàng của viên, `title` của F15, `teaches` / `uses` của viên khác.
- Không đổi `Question` / `QuestionKind`, `CheckItem`, `ROW_QUIZ_SIZE`, `minPerLesson`, luật chấm Soát vé, store schema, `SYNCED_KEYS`.
- Không đổi `words.json`, `example-overrides.json`, `scripts/vocab/example-labels.json`, glossary, SPEC.md. Không dời cổng much, no, few hay hư từ khác.
- Không chép câu hay bảng từ sách, web có bản quyền.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mở F15 ở 375px | `#/foundation/F15`, màn 1 | Đoạn giải thích mới và 2 bảng đóng sẵn "There is / There are: 3 dạng (6)", "some, any, many, much, a lot of (7)". Mở bảng: mỗi dòng có nút nghe · câu + nghĩa, **không có cột IPA**, có ghi chú cuối bảng. `scrollWidth` = 375 | N/A |
| Không có TTS | `canSpeak()` false | Bảng vẫn có câu và nghĩa, không có nút nghe | N/A |
| Máy tính | ≥ 1024px, màn 2+ của F15 | Cột "Lý thuyết của viên" có màn Giải thích kèm 2 bảng đóng. Enter trên `<summary>` chỉ mở / đóng bảng | N/A |
| Bảng F06 | `#/foundation/F06` | 5 bảng có IPA y cũ; bảng "Giờ, giá, số phòng" không còn cột IPA trống | N/A |
| Viên khác | F01, F14, F16… | Không có bảng, giao diện y cũ | N/A |
| Dưới 60% | Đúng lần đầu < 3/5 ở F15, bấm "Xem lại giải thích" | Tóm tắt có cả 2 bảng; 2 câu dễ hơn là `f15-e1`, `f15-e2` mới | N/A |
| Câu gõ | `f15-c5`, gõ "There are not any eggs in the kitchen" | Đúng (qua `accept`, không cần dấu chấm) | Gõ "There aren't some eggs…" → sai, giải thích, làm lại; lần đầu tính điểm |
| Xong F15 lần đầu | Học tới màn Áp dụng | Phiên ôn hôm đó có 6 thẻ `rule:f15-1` … `-6` sau từ mới; some, any, many thôi bị khoá (vào từ mới theo hạng NGSL) | N/A |
| Đã xong F15 trước story 43 | `srs.cards` có `rule:f15-1`, `-2` | Phiên kế tiếp có thêm `rule:f15-3` … `-6`; thẻ 1–2 giữ lịch; some / any / many mở | N/A |
| Qua hàng C bằng kiểm tra / bỏ qua Sân ga | Không học F15 | some / any / many mở; không có thẻ F15 (luật story 24) | N/A |
| Mới xong F01–F14 | Đang ở Sân ga | some / any / many vẫn khoá (trước đây khoá vì tường, nay vì F15) | N/A |
| Soát vé hàng C | `quiz-f-c`, 20 seed, có / không có TTS | 8 câu từ 12, không trùng, mỗi viên ≥ 1; không TTS thì không có câu nghe | N/A |
| Sổ lỗi cũ | Có lỗi `q-f15-01` … `-03` | `getQuestion` trả đúng câu cũ | N/A |
| Thẻ mồ côi | `srs.cards` có `rule:f15-7` | Không hiện, không đếm tồn ôn, vẫn nằm trong store | N/A |
| Khai báo thiếu | Câu luyện có `uses` / câu quiz có `requires` chứa some / any / many / a lot of mà thiếu `quantifiers`, hoặc chứa There isn't / aren't, Is there / Are there mà thiếu `there-negative-questions` | Test báo đúng id câu | Sửa dữ liệu câu, không nới luật |

</frozen-after-approval>

## Code Map

- `src/data/foundation/types.ts:24-86` -- `CONCEPT_IDS`: thêm 2 id dưới nhóm `// F15` (:76-78). `:112` doc comment `tables` ("Hiện chỉ F06 có").
- `src/data/foundation/catalog.ts:136-143` -- meta F15: `minutes`, `goalVi`, `teaches`. `title`, `uses` giữ nguyên.
- `src/data/foundation/bricks/f15.ts` -- toàn bộ nội dung F15. Viết lại theo Design Notes, sửa doc comment đầu file.
- `src/components/foundation/BrickTables.tsx` -- bảng tra (story 34). Cột IPA thành có điều kiện; doc comment "hiện chỉ F06".
- `src/components/foundation/BrickScreen.tsx:30-45`, `src/components/lesson/TermChip.tsx:17-20` -- đã vẽ `BrickTables` khi viên có bảng (màn giải thích, tóm tắt dưới 60%, cột lý thuyết, ô thuật ngữ). Chỉ đọc.
- `src/components/foundation/CheckItemView.tsx:255`, `src/lib/foundation/player.ts:51` -- câu `type` trong viên đã chạy và chấm bằng `matchesTyped`. Chỉ đọc.
- `src/data/vocab/function-words.ts:30-40, :67-72` -- `WALL_WORDS` và nhóm cổng F15.
- `src/data/questions/foundation.ts` -- comment đầu file (42 câu), `ROW_C` (q-f15 ở :361-403), comment `FOUNDATION_QUESTIONS` (:556).
- `src/data/questions/concepts.ts` -- `requiresViolations`: tự nhận khái niệm mới qua `BRICKS[].teaches`. Không sửa.
- `src/lib/flashcard-session.ts` `ruleStudyWords`, `lockedNewWordIds` -- tự lấy thẻ mới và cổng mới. Không sửa.
- Test: `src/data/foundation/foundation.test.ts` (`englishTexts` :84, `itemTexts` :630, thẻ quy tắc :507, "chỉ F06 có bảng" :654), `src/data/foundation/foundation-catalog.test.ts:6-32`, `src/data/questions/foundation.test.ts` (:68 `ROW_C_IDS`, :78 42 câu, :133, :189-205), `src/data/questions/requires.test.ts:28-30`, `src/data/vocab/function-words.test.ts:17-23`, `src/lib/flashcard-session.test.ts:903-920`. Vitest env `node`, không có test component.
- `_bmad-output/specs/spec-english-learning-website/learning-rules.md:29` -- dòng F15 của bảng viên.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/types.ts` -- thêm `'there-negative-questions'`, `'quantifiers'` sau `'prepositions-of-place'` (nhóm F15, comment ghi story 43). Sửa doc comment `tables`: "Hiện F06 và F15 có".
- [x] `src/data/foundation/catalog.ts` -- meta F15: `minutes: 13`; `teaches: ['there-is-are', 'prepositions-of-place', 'there-negative-questions', 'quantifiers']`; `goalVi` theo Design Notes.
- [x] `src/data/foundation/bricks/f15.ts` -- viết lại theo Design Notes:
  - explain (chữ mới + 2 bảng), contrast (sửa `enRequires`, thêm 2 ví dụ), worked và faded giữ nguyên;
  - check: `c3`, `c5` mới; `c1`, `c2`, `c4` giữ nguyên; easier: `e1` giữ, `e2` mới;
  - apply: chữ mới, `sampleEn` mới, `a1` mới, giữ `f15-say-1` … `-3`, thêm `-4`, `-5`;
  - `ruleCards`: giữ 1–2, thêm 3–6; `themeWordIds` giữ nguyên;
  - doc comment đầu file: dạy 4 khái niệm, phủ dạng cổng there, in, on, under, between, some, any, many; câu chỉ dùng F01–F15.
- [x] `src/components/foundation/BrickTables.tsx` -- tính `hasIpa = table.rows.some((r) => r.ipa)` cho từng bảng; `false` thì không vẽ `<th>` IPA và `<td>` IPA; `true` thì giữ nguyên markup hiện tại. Không thêm, không đổi class. Sửa doc comment (F06, F15; bảng câu không có cột IPA).
- [x] `src/data/vocab/function-words.ts` -- bỏ `'some'`, `'any'`, `'many'` khỏi `WALL_WORDS`; thêm vào nhóm F15 `'ngsl-some': brick('F15', ['some'])`, `'ngsl-any': brick('F15', ['any'])`, `'ngsl-many': brick('F15', ['many'])`; comment nhóm thành "F15 There is/are, lượng từ + giới từ nơi chốn".
- [x] `src/data/questions/foundation.ts` -- thêm `q-f15-04`, `q-f15-05` (Design Notes) ngay sau `q-f15-03`. Sửa comment đầu file và comment `FOUNDATION_QUESTIONS`: 44 câu, hàng A 12 câu (F06 4), hàng C 12 câu (F15 5, story 43), hàng B, D 10 câu.
- [x] `src/data/foundation/foundation-catalog.test.ts` -- `MINUTES.F15 = 13`, tổng 153.
- [x] `src/data/foundation/foundation.test.ts` -- sửa test cũ và thêm describe "F15 lượng từ, There is phủ định / câu hỏi (story 43)":
  - `englishTexts` và `itemTexts` lấy thêm `answer` và `accept` của câu `type`;
  - test số thẻ quy tắc: F06 đúng 8, F15 đúng 6, viên khác 1–2;
  - "chỉ F06 có bảng" thành "chỉ F06 và F15 có bảng"; id bảng F15 đúng `['f15-forms', 'f15-quantifiers']`;
  - bảng F15: `en` khớp `/^[A-Za-z' ,.?]+$/` và kết thúc bằng `.` hoặc `?`, `vi` không rỗng, không dòng nào có `ipa`, `en` không trùng; `f15-forms` có đủ "There isn't", "There aren't", "Is there", "Are there", "Yes, there is", "No, there aren't"; `f15-quantifiers` có some, any, many, much, a lot of, How many, How much;
  - F15 `teaches` đúng 4 khái niệm theo thứ tự trên;
  - `rule:f15-1`, `-2` giữ đúng cloze / answer cũ; `f15-rule-3` … `-6` có answer `['Is', 'any', 'many', 'much']`; cloze `-4`, `-6` có gợi ý trong ngoặc (để any / much là đáp án duy nhất);
  - id câu luyện đúng `['f15-c1', …, 'f15-c5', 'f15-e1', 'f15-e2', 'f15-a1']`; `f15-c5` là `type` có `accept`; câu nói đúng `f15-say-1` … `-5`;
  - khai báo khái niệm: với mọi câu luyện của viên có `uses` và mọi câu có `requires` trong `FOUNDATION_QUESTIONS`, `QUESTION_BANK`, `OWL_QUESTIONS`, quét câu đã điền đáp án (đề + đáp án đúng; không quét lựa chọn nhiễu), `audioText`, `answer` / `accept` của câu gõ: có `\b(some|any|many)\b` hoặc "a lot of" (không phân biệt hoa thường; không quét much vì How much còn là hỏi giá của F14) thì phải có `quantifiers`; có "there isn't / aren't / is not / are not", "is there", "are there" thì phải có `there-negative-questions`. Có tự kiểm helper ("Someone is here." và "How much is it?" không bị bắt; "Are there any eggs?" bắt cả hai);
  - đếm: ít nhất 5 câu (của F15 và quiz) bị quét trúng, để test không xanh rỗng.
- [x] `src/data/questions/foundation.test.ts` -- 44 câu; `ROW_C_IDS` thêm `q-f15-04`, `q-f15-05` sau `q-f15-03`; hàng A, C 12 câu, B, D 10 câu (giữ ≤ 2 câu nghe, minPerLesson, 8 câu với 20 seed); "F13 3, F14 2, F15 5, F16 2"; `getQuestion('q-f15-01'/'-02'/'-03')` không đổi; câu mới tag `từ loại`, `requires` có `quantifiers`.
- [x] `src/data/questions/requires.test.ts` -- chốt `FOUNDATION_QUESTIONS` 44 câu.
- [x] `src/data/vocab/function-words.test.ts` -- tổng 86: 33 cổng viên, 15 cổng bài, 38 cổng tường; thêm assert `functionWordGate('ngsl-any')?.opensAfter` là `{ brick: 'F15' }`, `ngsl-much` vẫn `{ brick: 'F14' }`.
- [x] `src/lib/flashcard-session.test.ts` -- sửa dãy khoá thành `[75, 74, 67, 59, 58, 53]` (qua tường vẫn còn khoá 15); thêm test:
  - xong F01–F15 → `ruleStudyWords` có `rule:f15-1` … `-6` đúng thứ tự, `lockedNewWordIds` không còn `ngsl-some`, `ngsl-any`, `ngsl-many`;
  - xong F01–F14 → 3 từ đó vẫn khoá; hàng C qua kiểm tra mà chưa học F15 → 3 từ mở, không có thẻ `rule:f15-*`;
  - store có `rule:f15-1`, `-2` từ trước → thêm 4 thẻ mới, thẻ cũ giữ lịch; `rule:f15-7` không hiện, không đếm tồn ôn.
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- dòng F15 của bảng viên: 13 phút, "học để làm gì" khớp `goalVi`.

**Acceptance Criteria:**
- Given Huy mở `#/foundation/F15` ở 375px, when mở bảng "some, any, many, much, a lot of" và bấm nghe dòng How many, then máy đọc cả câu, bảng không có cột IPA, và trang không cuộn ngang.
- Given Huy đang ở màn luyện F15, when gõ "There aren't any eggs in the kitchen." ở `f15-c5`, then câu được chấm đúng, và câu nghe `f15-c3` đọc một câu hỏi "Are there any…?".
- Given Huy học xong F15 trong buổi 30', when sang bước Ôn, then gặp thẻ "Thẻ quy tắc · F15" "How ___ books are there on the desk?", lật ra "many", có link "Xem lại viên F15"; và từ mới hôm sau có thể có some / any / many.
- Given máy cũ (bản trước story 43) đồng bộ store có `rule:f15-5`, when mở app cũ, then app không lỗi và thẻ không hiện.

## Implementation Notes

- **Đã làm đủ 13 việc ở Execution**, nội dung F15 theo đúng chữ của Design Notes (explain 2 bảng, contrast thêm câu hỏi đảo và 2 ví dụ, `f15-c3` nghe "Are there any chairs in the room?", `f15-c5` câu gõ có `accept`, `f15-e2`, apply / `f15-a1`, `f15-say-4`, `-5`, thẻ `f15-rule-3` … `-6`, `q-f15-04`, `-05`). Không lệch Design Notes chỗ nào.
- **`BrickTables`:** mỗi bảng tính `hasIpa = table.rows.some((r) => r.ipa)`; `false` thì không vẽ `<th>` và `<td>` IPA. Markup và class cũ giữ nguyên, chỉ bọc điều kiện (thân `map` đổi sang khối `{ … return (…) }` nên thụt lề đổi).
- **Test khai báo khái niệm** (`foundation.test.ts`, describe "F15 lượng từ…"): `QUANTIFIER_RE` = `\b(some|any|many)\b` hoặc "a lot of", `THERE_NQ_RE` = "there isn't / aren't / is not / are not" hoặc "is / are there", không phân biệt hoa thường, đổi nháy cong thành nháy thẳng trước khi so. Quét đề đã điền + đáp án đúng, `audioText`, `answer` / `accept` câu gõ (không quét lựa chọn nhiễu, không quét much). Bị quét trúng 6 câu (`f15-c3`, `-c5`, `-e2`, `-a1`, `q-f15-04`, `-05`), đều khai báo đủ. 3 câu T2–T4 có lượng từ (`t2-t4.ts:367` "any money", `:492` "some water", `:527` "many countries") chưa có `requires` nên không bị quét; thêm `requires` thuộc story 47.
- **Test thêm ngoài danh sách:** `englishTexts` / `itemTexts` quét `answer` / `accept` câu gõ; test bảng F15 kiểm có `noteVi`, đúng 6 / 7 dòng; flashcard-session có thêm ca "bỏ qua Sân ga" cạnh ca "hàng C qua kiểm tra", và ca "F15 xong hôm nay: 6 thẻ mới sau từ mới, không chiếm quota".
- **Kiểm chấm câu gõ** (test tạm, đã xoá): `isCorrect` của `f15-c5` nhận "There aren't any eggs in the kitchen.", "There are not any eggs in the kitchen" (không dấu chấm), "there arent any eggs…"; từ chối "There aren't some eggs…" và câu khẳng định.
- **Lệnh:** `npm run lint`, `npm test` (2052 test qua), `npm run build` đều qua.
- **`layout:guard`:** 6 file nguồn đổi, không có class nào bị thêm hay xoá.
- **`layout:check`:** mọi route `ok` ở cả 5 bề rộng; ảnh 375px chỉ lệch ở `/foundation` (60 pixel, ô F15 đổi 10' thành 13'). Dòng "thử phím tắt @ 1280px: F01: gõ "chào 1" + Enter trong ô không chấm" báo LỖI, nhưng lỗi này **có sẵn ở HEAD 655bab0** (chạy `layout:check --skip-diff` trên worktree HEAD cũng báo y hệt), không do story này.
- **Kiểm tay bằng Chrome headless** (Vite dev, `VITE_SUPABASE_*` rỗng): `#/foundation/F15` ở 375px có 2 bảng "There is / There are: 3 dạng (6)", "some, any, many, much, a lot of (7)", mở ra đủ 6 và 7 dòng, mỗi dòng 2 ô (nghe · câu + nghĩa), 2 cột tiêu đề, có ghi chú, `scrollWidth` = 375; ở 1280px cũng vậy, `scrollWidth` = 1280. `#/foundation/F06`: 5 bảng vẫn 3 cột, bảng "Giờ, giá, số phòng" còn 2 cột. `#/foundation/F14` không có bảng. Chưa kiểm tay: cột "Lý thuyết của viên" ở màn 2+ trên 1280px và phím Enter trên `<summary>` (không đổi code phần này, cơ chế của story 34).

## Spec Change Log

- **2026-11-13, sau review (vòng 0, không loopback).** Finding: `f15-e2` có hai đáp án đúng (many cũng điền được "There aren't many chairs. Are there many chairs?"); câu gõ `f15-c5` chấm sai "There are no eggs…" vì đề không nói dùng any; đoạn giải thích bỏ mất there's và nghĩa của giới từ nơi chốn; thẻ `f15-rule-4`, `-6` chép nguyên câu của bảng; khai báo khái niệm của `f15-e2`, `f15-a1`, `q-f15-04`, `-05` thiếu. Sửa Design Notes (ngoài phần đóng băng): giải thích thêm nghĩa trong ngoặc của 5 giới từ (79 chữ); ghi chú bảng `f15-forms` thêm "Nói nhanh: there's = there is." và bỏ dấu chấm thừa; dòng isn't thêm "(hoặc không đếm được)"; ghi chú `f15-quantifiers` thêm "some / any đi với số nhiều hoặc không đếm được; một vật số ít dùng a" và "any thường ở…"; câu đầu `enRequires` mở bằng "Câu khẳng định"; đề `f15-c5` thêm "dùng any"; `f15-e2` lựa chọn any · some · a (bỏ many); cloze `f15-rule-4` "There aren't ___ books in my bag. (cái nào)", `f15-rule-6` "There isn't ___ milk in the glass. (nhiều)"; `uses` / `requires` thêm `there-negative-questions`, `plurals`, `articles` (e2), `wh-questions` (a1, q-f15-05), `countable-uncountable` (q-f15-04). Phần đóng băng không đổi. Trạng thái tránh được: câu dễ chấm sai một đáp án đúng, người học gặp there's và giới từ chưa có nghĩa. KEEP: id câu, id thẻ, chữ `rule:f15-1`, `-2`, `q-f15-01` … `-03`, 2 bảng 6 / 7 dòng, đáp án `f15-c5` và `accept`, mọi thứ còn lại của Design Notes.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|------------|-------|
| 1 | blind | Bỏ "there's" khỏi giải thích nhưng contrast và ghi chú bảng vẫn dùng there's | medium | `f15.ts:73` "There's water in the bottle.", ghi chú `f15-forms` nói "không nói Yes, there's"; `textVi` mới không giải thích there's | patch: ghi chú `f15-forms` thêm "Nói nhanh: there's = there is." (gộp #16, #22) |
| 2 | blind | `f15-e2` có hai đáp án đúng (many) | medium | Lựa chọn any · some · many, gợi ý "There aren't ___ chairs. Are there ___ chairs?": many điền vào vẫn đúng ngữ pháp | patch: lựa chọn thành any · some · a, giải thích thêm "chairs số nhiều nên không dùng a"; test chốt lựa chọn (gộp #14, #21) |
| 3 | blind | `f15-e2` khai báo thiếu khái niệm mà gợi ý dùng | low | `uses: ['quantifiers']` nhưng gợi ý có There aren't / Are there và chairs | patch: thêm `there-negative-questions`, `plurals`, `articles` |
| 4 | blind | `f15-c5` chấm sai "There are no eggs in the kitchen." | medium | Đề chỉ nói "Đổi sang câu phủ định"; `matchesTyped` chỉ so với answer và `accept` (đều dùng any) | patch: đề thành "Đổi sang câu phủ định, dùng any: …"; test kiểm đề có "dùng any" (gộp #13, #26) |
| 5 | blind | Giải thích bỏ nghĩa giới từ nơi chốn; câu luyện chỉ còn under | medium | `textVi` chỉ còn "Vị trí: in, on, under, next to, between."; nghĩa chỉ còn ở `f15-rule-2` | patch: thêm nghĩa trong ngoặc vào `textVi` (79 chữ, trong 40–80). Phần "không còn câu luyện between / next to": xem #18 (gộp #17, #23) |
| 6 | blind | Cặp câu dễ dưới 60% không luyện There phủ định / câu hỏi hay giới từ | low | Intent đóng băng chọn `f15-e2` là câu some / any và giữ `f15-e1`; sau vá #3, gợi ý `f15-e2` đã là There aren't / Are there | reject: lựa chọn của intent, hại nhỏ, sửa phải đổi intent |
| 7 | blind | Test khai báo không quét much | low | Spec chủ ý không quét much (How much hỏi giá F14); quét thử: không câu nào có much ngoài How much, bảng và thẻ F15. Luật hẹp còn phải trừ "very much", "How much does…" | reject: chưa có câu nào lọt, sửa thêm độ phức tạp cho regex |
| 8 | blind | Test chấm `f15-c5` viết rồi xoá | medium | Implementation Notes ghi "test tạm, đã xoá"; không test nào gọi `isCorrect` với `f15-c5` | patch: test cố định trong `foundation.test.ts` (aren't, are not không dấu chấm, arent, nháy cong đúng; giữ some, câu khẳng định, ô trống sai) |
| 9 | blind | `BrickTables` không có test cho luật cột IPA, doc comment cũ | medium | Không test nào gọi `hasIpa`; câu "bảng vẫn có chữ và IPA" sai với bảng không IPA | patch: tách hàm thuần `tableHasIpa` (`types.ts`), component dùng hàm này, test chốt 5 bảng F06 có IPA, `f06-time-price` và 2 bảng F15 không; sửa doc comment (gộp #20) |
| 10 | blind | Test khai báo bỏ qua câu T2–T4 chưa có `requires` | low | 3 câu `t2-t4.ts` có lượng từ, không có `requires` từ trước story 43; spec giao việc này cho story 47 | defer: ghi vào `deferred-work.md` cho story 47 |
| 11 | blind | Thẻ `f15-rule-4`, `-6` chép nguyên câu của bảng | low | `f15-rule-4` = dòng "There aren't any chairs in the kitchen.", `f15-rule-6` = dòng "There isn't much water in the bottle." | patch: đổi thành "There aren't ___ books in my bag. (cái nào)", "There isn't ___ milk in the glass. (nhiều)" (id thẻ, đáp án giữ) |
| 12 | blind | File story vẫn in-progress; AC "máy cũ có `rule:f15-5`" chỉ được phủ gián tiếp | low | Bước 5 đặt `status: 'done'`; luật thẻ mồ côi là một luật chung, test `rule:f15-7` trong `flashcard-session.test.ts` phủ cùng đường | reject: sửa là sửa spec của chính build này |
| 13 | edge | `f15-c5` chấm sai "There are no eggs…" | medium | Như #4 | patch (gộp #4) |
| 14 | edge | `f15-e2` lựa chọn many cũng đúng | medium | Như #2 | patch (gộp #2) |
| 15 | edge | Không quét "there is no", "there are no", "there's not" và much | low | Quét thử `src/data`: không câu nào có "there is / are no", "there's not / no"; no còn sau tường. much: như #7 | reject: chưa có câu nào lọt, sửa thêm độ phức tạp |
| 16 | edge | Bỏ "Nói nhanh: there's" | medium | Như #1 | patch (gộp #1) |
| 17 | edge | Bỏ nghĩa tiếng Việt của giới từ và câu "on nghĩa là gì?" | medium | Như #5 | patch (gộp #5) |
| 18 | edge | Không còn câu check / apply nào luyện between, next to | low | Intent đóng băng chọn thay `f15-c5` và `f15-e2`; between / next to vẫn có ở contrast, màn faded "next to my house", `f15-say-3`, thẻ `f15-rule-2`, và nay có nghĩa trong giải thích | reject: lựa chọn của intent, thêm câu là đổi intent (ghi vào humanChecks) |
| 19 | edge | `accept` của `f15-c5` không có tác dụng (`normalizeTyped` đổi aren't → are not) | low | Đúng: `normalizeTyped` mở rộng n't. Nhưng mục này vô hại, spec yêu cầu có `accept`, và test #8 nay chốt "are not any" đúng dù có hay không `accept` | reject |
| 20 | vgap | `BrickTables` ẩn cột IPA theo bảng mà không có kiểm tự động | medium | Như #9 (pre-verified) | patch (gộp #9) |
| 21 | content | `f15-e2` hai đáp án đúng | medium | Như #2 | patch (gộp #2) |
| 22 | content | Bỏ câu there's = there is | medium | Như #1 | patch (gộp #1) |
| 23 | content | Giải thích không còn nghĩa giới từ | medium | Như #5 | patch (gộp #5) |
| 24 | content | Cột nghĩa của bảng F15 là nhãn luật, không dịch câu; fridge không có trong `words.json` | low | `vi` của 13 dòng là nhãn luật theo Design Notes; fridge không có id trong `words.json`, nhưng màn đối chiếu (màn 2) dịch "Trong tủ lạnh không có chút sữa nào." | reject: lựa chọn thiết kế, hại nhỏ (ghi vào humanChecks) |
| 25 | content | Luật some / any thiếu ý số ít dùng a; "câu hỏi dùng any" tuyệt đối | low | Ghi chú `f15-quantifiers` không nói some / any chỉ đi với số nhiều / không đếm được | patch: ghi chú thêm "some / any đi với danh từ số nhiều hoặc không đếm được; một vật số ít dùng a: Is there a bank?" và "any thường ở…" |
| 26 | content | `f15-c5` chấm sai câu phủ định với no | low | Như #4 | patch (gộp #4) |
| 27 | content | Khai báo khái niệm thiếu (`wh-questions`, `countable-uncountable`, `uses` của F15) | low | `f15-a1`, `q-f15-05` dùng How many / How much; `q-f15-04` loại much nhờ luật đếm được | patch: `f15-a1` và `q-f15-05` thêm `wh-questions`, `q-f15-04` thêm `countable-uncountable`. `uses` của viên F15 giữ (Code Map giữ `uses`; hàng C học tuần tự nên không ảnh hưởng) |
| 28 | content | `enRequires` nói "bắt buộc mở đầu bằng There" rồi đưa ví dụ "Is there…?" | low | `f15.ts:68-70` | patch: câu đầu thành "Câu khẳng định tiếng Anh bắt buộc mở đầu…" |
| 29 | content | Hai dấu chấm liền trong ghi chú bảng | low | “Yes, there's.”. | patch: bỏ dấu chấm trong ngoặc kép |
| 30 | content | Nhãn dòng isn't chưa nói tới không đếm được | low | Dòng `f15-quantifiers` dùng "There isn't any milk" | patch: nhãn thành "Phủ định một vật (hoặc không đếm được): isn't = is not" |

## Design Notes

**Meta F15:** `goalVi`: "There is/are đủ 3 dạng (There isn't…, Is there…? Yes, there is), some/any, many/much/a lot of, How many/How much; tả phòng hay ảnh với in/on/under/next to/between (TOEIC Part 1)".

**Explain `textVi`** (khoảng 79 chữ theo `countWords` sau review; sửa chữ được, miễn 40–80): "Muốn nói ở đâu “có” cái gì, dùng there is (một vật, hoặc danh từ không đếm được) và there are (nhiều vật); đừng dịch “có” thành have. Phủ định và câu hỏi làm như to be: There isn't, Is there…? Khẳng định dùng some, phủ định và câu hỏi dùng any. Vị trí: in (trong), on (trên), under (dưới), next to (cạnh), between (giữa). Hai bảng bên dưới có đủ 3 dạng và many, much, a lot of."

**Bảng** (`en` · `vi`, không IPA):
- `f15-forms` "There is / There are: 3 dạng":
  - There is a cat under the bed. · Khẳng định, một vật (hoặc không đếm được);
  - There are two chairs in the kitchen. · Khẳng định, nhiều vật;
  - There isn't a cat in the room. · Phủ định một vật (hoặc không đếm được): isn't = is not;
  - There aren't any chairs in the kitchen. · Phủ định nhiều vật: aren't + any;
  - Is there a bank on this street? Yes, there is. · Câu hỏi một vật và trả lời ngắn;
  - Are there any eggs in the kitchen? No, there aren't. · Câu hỏi nhiều vật và trả lời ngắn;
  - note: "Nói nhanh: there's = there is. Câu hỏi đảo is / are lên trước there. Trả lời ngắn lặp lại there + is / are: Yes, there is. No, there isn't. Câu Yes không rút gọn: không nói “Yes, there's”."
- `f15-quantifiers` "some, any, many, much, a lot of":
  - There are some eggs in the kitchen. · some: câu khẳng định, “một vài, một ít”;
  - There isn't any milk in the fridge. · any: câu phủ định và câu hỏi, “chút nào, cái nào”;
  - There are many books on the desk. · many + danh từ đếm được số nhiều;
  - There isn't much water in the bottle. · much + danh từ không đếm được, hay dùng ở phủ định và câu hỏi;
  - There are a lot of people in the bank. · a lot of: nhiều, đi được với cả hai loại danh từ, hay dùng ở câu khẳng định;
  - How many chairs are there in the room? · Hỏi số lượng: How many + số nhiều;
  - How much milk is there in the fridge? · Hỏi lượng: How much + không đếm được (How much is it? là hỏi giá, viên F14);
  - note: "some ở câu khẳng định, any thường ở câu phủ định và câu hỏi. some / any đi với danh từ số nhiều hoặc không đếm được; một vật số ít dùng a: Is there a bank? many đi với số nhiều (books), much đi với không đếm được (water, milk, money). Câu khẳng định thường dùng a lot of thay cho much."

**Contrast:** `viSays` giữ. `enRequires` giữ 2 câu cũ (câu đầu thêm "Câu khẳng định" ở đầu, review), thêm: "Câu hỏi đảo is / are lên trước there: “Is there a bank on this street?”, trả lời ngắn “Yes, there is.”." `examples` giữ 6, thêm:
- `{ vi: 'Trong tủ lạnh không có chút sữa nào.', en: "There isn't any milk in the fridge." }`;
- `{ vi: 'Trong bếp có cái ghế nào không? — Không.', en: "Are there any chairs in the kitchen? — No, there aren't.", audioText: "Are there any chairs in the kitchen? No, there aren't." }`.

**Câu luyện mới:**
- `f15-c3` (listen): audioText "Are there any chairs in the room?"; prompt "Bạn nghe thấy câu nào?"; lựa chọn: Are there any chairs in the room? · There are some chairs in the room. · Are there any chairs in the kitchen?, đáp án 0; hint "Nghe hai từ đầu (Are there… là câu hỏi) và chỗ ở cuối câu."; explanation "Câu hỏi đảo are lên trước there và dùng any: Are there any chairs in the room?"; uses `['there-negative-questions', 'quantifiers', 'prepositions-of-place', 'plurals', 'articles']`.
- `f15-c5` (type): prompt 'Đổi sang câu phủ định, dùng any: “There are some eggs in the kitchen.”'; answer "There aren't any eggs in the kitchen."; accept `['There are not any eggs in the kitchen.']`; hint "are → aren't, và some đổi thành any."; explanation "Phủ định thêm not sau are (aren't = are not), và some đổi thành any: There aren't any eggs in the kitchen."; uses `['there-negative-questions', 'quantifiers', 'plurals', 'prepositions-of-place', 'articles']`.
- `f15-e2` (choice): prompt "Câu phủ định và câu hỏi dùng từ nào?"; lựa chọn: any · some · a, đáp án 0; hint "There aren't ___ chairs. Are there ___ chairs?"; explanation "Phủ định và câu hỏi dùng any; câu khẳng định dùng some. chairs số nhiều nên không dùng a."; uses `['quantifiers', 'there-negative-questions', 'plurals', 'articles']`.
- apply:
  - promptVi: "Áp dụng: tả căn phòng của bạn bằng 3 câu: một câu There is / There are, một câu phủ định với any, một câu hỏi How many. Chọn câu đúng, rồi nói theo mẫu, thay bằng đồ thật trong phòng bạn.";
  - sampleEn: "There is a bed in my room. There aren't any chairs in my room. How many books are there on the table?";
  - `f15-a1` (choice): prompt "Hỏi “Trên bàn có bao nhiêu quyển sách?”"; lựa chọn: How many books are there on the table? · How much books are there on the table? · How many books there are on the table?, đáp án 0; hint "books đếm được, số nhiều; câu hỏi đảo are lên trước there."; explanation "books là danh từ đếm được số nhiều nên dùng How many, và câu hỏi đảo are lên trước there: How many books are there on the table?"; uses `['quantifiers', 'there-negative-questions', 'wh-questions', 'plurals', 'prepositions-of-place', 'articles']`;
  - speak: giữ 3 câu cũ, thêm `{ id: 'f15-say-4', text: "There aren't any chairs in my room.", vi: 'Trong phòng tôi không có cái ghế nào.' }`, `{ id: 'f15-say-5', text: 'How many books are there on the table?', vi: 'Trên bàn có bao nhiêu quyển sách?' }`.

**Thẻ quy tắc mới** (cloze → answer · vi):
- `f15-rule-3`: `___ there a bank on this street? — Yes, there is.` → `Is` · "Câu hỏi đảo is / are lên trước there. Trả lời ngắn: Yes, there is. / No, there isn't."
- `f15-rule-4`: `There aren't ___ books in my bag. (cái nào)` → `any` · "Phủ định và câu hỏi dùng any; câu khẳng định dùng some: There are some chairs."
- `f15-rule-5`: `How ___ books are there on the desk?` → `many` · "How many + danh từ đếm được số nhiều; How much + danh từ không đếm được: How much water is there?"
- `f15-rule-6`: `There isn't ___ milk in the glass. (nhiều)` → `much` · "much + không đếm được (water, milk, money), many + số nhiều (books). Câu khẳng định hay nói a lot of."

**Câu Soát vé mới** (ngay sau `q-f15-03`, `lessonId: 'f15'`, `sectionId: 'grammar'`, tag `từ loại`, `kind: 'choice'`):
- `q-f15-04`: prompt "There aren't ___ cups on the table. (không có cái nào)"; lựa chọn: any · some · a · much, đáp án any; explanation "Câu phủ định dùng any: There aren't any cups. some dùng ở câu khẳng định; cups số nhiều nên không dùng a; much đi với danh từ không đếm được."; requires `['there-negative-questions', 'quantifiers', 'countable-uncountable', 'plurals', 'prepositions-of-place', 'articles']`.
- `q-f15-05`: prompt "How ___ water is there in the glass?"; lựa chọn: much · many · any · some, đáp án much; explanation "water không đếm được nên hỏi lượng bằng How much. How many đi với danh từ đếm được số nhiều: How many glasses…?"; requires `['quantifiers', 'there-negative-questions', 'wh-questions', 'countable-uncountable', 'prepositions-of-place', 'articles']`.

Hai câu này không trùng nguyên văn câu nào của viên (bảng dùng "chairs in the kitchen", "milk in the fridge"). Nếu test trùng câu báo đỏ thì đổi chữ của câu quiz, không đổi luật.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: đều qua.
- `npm run layout:guard` -- expected: không báo class mới hay class bị xoá ở file nào (`BrickTables.tsx` chỉ bọc điều kiện quanh markup cũ). Có báo thì ghi danh sách vào Implementation Notes và sửa nếu không phải class cũ dời chỗ.
- `npm run layout:check` -- expected: mọi route `ok` ở 5 bề rộng; ảnh 375px chỉ lệch ở `/foundation` (ô F15 đổi 10' thành 13').

**Manual checks (if no CLI):**
- Chrome headless 375px và 1280px, `VITE_SUPABASE_*` rỗng:
  - `#/foundation/F15`: 2 bảng đóng, mở ra đủ 6 và 7 dòng, không có cột IPA, `scrollWidth` bằng bề rộng; ở 1280px sang màn 2 thì cột trái có bảng;
  - màn luyện: `f15-c5` hiện ô gõ, gõ đáp án thì đúng;
  - `#/foundation/F06`: 5 bảng có IPA như cũ; `#/foundation/F14` không đổi.
