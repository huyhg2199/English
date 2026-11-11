---
title: 'to be quá khứ (was / were) và câu hỏi Wh với did ở s1-t2-w2 (CAP-11, CAP-23, learning-rules "Chỉ dùng kiến thức đã dạy", "Thẻ quy tắc")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: 'eafb0724c00176fe24ff4a6da0c2af2aac42686e'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/24-srs-function-words-rule-cards-examples.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/32-tense-content-fixes.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời "hoàn thiện giúp tôi đi" ngày 2026-11-11 sau báo cáo kiểm tra "nền & các thì": làm hết story 32–47. Thứ tự do Claude đề xuất: 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Mục tiêu của đợt: Huy **tự làm ra** câu đúng thì. was / were là dạng quá khứ gặp nhiều nhất, và là nền cho quá khứ tiếp diễn (story 46: Claude đề xuất đặt ở Chặng 1, s1-t2-w4; Huy không chọn riêng mà đồng ý khi giao chạy hết) và cho bị động. Vì vậy phải dạy thật ngay ở s1-t2-w2, trước bài động từ thường.
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn; chỉ dùng kiến thức đã dạy; giao diện 375px không đổi ngoài phần mới; store đổi schema thì phải bump version (story này không bump).
- Claude chọn:
  - **Tense mới `past-to-be`** tên "Quá khứ đơn: to be (was / were)", đứng **trước** PAST_SIMPLE trong `GRAMMAR_T2_W2`. Có đủ các phần: khẳng định, phủ định (wasn't / weren't), câu hỏi, trả lời ngắn, Wh + was / were, there was / were. Có so sánh "Were you…?" với "Did you…?" và 4 lỗi hay mắc. Không có thần chú riêng: thần chú Obliviate của bài đã bao luôn was / were, chỉ sửa `description` / `grammarEn`.
  - **Lỗi "I was go"** được viết bằng động từ có quy tắc ("I was work late." → "I worked late."), vì động từ bất quy tắc tới s1-t2-w3 mới học.
  - **Wh + did** nằm trong PAST_SIMPLE: dòng công thức "To be" (đã chuyển sang Tense mới) đổi thành dòng "Câu hỏi Wh-", và ví dụ thứ 6 đổi thành câu Wh + did.
  - **6 câu quiz mới** `q-s1-t2-w2-07` … `-12`, đều là câu trắc nghiệm, đều có `requires`. `requires` chỉ dùng khái niệm của viên gạch hoặc của bài T1, không thêm khái niệm bài T2 (để story 47 làm). Câu sai thì lời mời ôn viên F13 / F14 / F15 chạy đúng như hiện có.
  - **3 thẻ quy tắc**: 2 thẻ của `past-to-be`, 1 thẻ Wh + did của `past-simple`. Story 33 làm sẵn đường đi tối thiểu cho thẻ quy tắc của thì:
    - Tense có trường `ruleCards` (không bắt buộc).
    - Bài đã **đánh dấu xong** thì góp thẻ của các thì trong bài vào phiên ôn. Bài bị bỏ qua khi xếp lớp thì không góp, giống luật của viên gạch.
    - Id thẻ có dạng `rule:<tenseId>-n`. Thẻ đứng sau thẻ của viên gạch và dùng chung lịch.
    - Story 38 làm tiếp phần còn lại: thẻ cho các thì khác, thẻ động từ bất quy tắc, che cột.
  - Giữ nguyên mọi id cũ: id câu `q-s1-t2-w2-01..06`, id Tense, id thần chú, id câu luyện nói.

**Problem:** was / were hiện chỉ có một dòng công thức và một câu ví dụ trong PAST_SIMPLE. Không có wasn't / weren't, "Were you…?", trả lời ngắn, there was / were. Cả bài chỉ 1 câu quiz hỏi was. Câu hỏi Wh với did đã bị hỏi ở `q-s1-t2-w4-04` nhưng chưa có bài nào dạy. Người học vì vậy dễ đặt câu sai kiểu "Did you be…?", "I was work".

**Approach:**
- Thêm Tense `past-to-be` vào s1-t2-w2, đứng trước PAST_SIMPLE. PAST_SIMPLE có thêm công thức và ví dụ Wh + did.
- Thêm 6 câu quiz có `requires`.
- Thêm 3 thẻ quy tắc vào SRS khi bài được đánh dấu xong, dùng lại `RuleStudyWord` và thẻ quy tắc của Sân ga. Không đổi schema store.

## Boundaries & Constraints

**Always:**
- Mỗi Tense vẫn có đúng 3 quy tắc, 4–6 câu ví dụ, có lỗi hay mắc và ≥ 1 câu thoại YouGlish (`lessons.test.ts`). PAST_SIMPLE giữ đúng chữ quy tắc 2–3 của story 32 (test story 32 vẫn qua).
- Câu tiếng Anh mới (Tense, câu quiz, thẻ) chỉ dùng: Sân ga F01–F18, T1 (hiện tại đơn), hiện tại tiếp diễn (W1), was / were, động từ có quy tắc -ed và did. Không dùng dạng V2 / V3 bất quy tắc nào khác was / were / did, không dùng some / any / many, không dùng liên từ because / so. Câu bắt đầu bằng "Did" không được dịch thành "…chưa?".
- Câu quiz mới: 4 lựa chọn khác nhau, đáp án đứng đầu, tag `thì`, `kind: 'choice'`, gắn đoạn `grammar`. Mỗi câu có `requires` hợp lệ theo `requiresViolations`.
- Thẻ quy tắc của thì: `cloze` có đúng một `___`, `answer` không rỗng. Id nội dung dạng `<tenseId>-rule-n`, id SRS là `rule:<tenseId>-n` (dùng `ruleCardId`), không trùng với thẻ viên gạch. Thẻ không tính vào quota từ mới. Thẻ là key mới trong `srs.cards`, cùng shape `SrsCard`: không bump schema, sync / backup / gộp giữ như mọi thẻ.
- Thẻ của viên gạch giữ nguyên hành vi và thứ tự: viên F01 → F18 trước, rồi tới thẻ của bài theo thứ tự lộ trình.
- 375px: chỉ đổi chữ trong thẻ quy tắc (nhãn nguồn, link "Xem lại"). Không thêm hay xoá class (`npm run layout:guard` qua).

**Never:**
- Không làm việc của story sau:
  - `practice` / player luyện có bậc trong Tense, dạng câu `type` / `transform`, ưu tiên câu chưa gặp (35–36);
  - thẻ cho các thì khác, thẻ động từ bất quy tắc, che cột bảng động từ (38);
  - `signalWords`, khối "Chọn thì" (39);
  - mini-t3, kho câu O.W.L. (40);
  - câu hỏi chủ ngữ (44);
  - quá khứ tiếp diễn (46);
  - khái niệm bài T2 trong `concepts.ts`, `requires` cho câu T2–T4 cũ (47).
- Không sửa `stage-1.ts`, `lo-trinh-toeic-12-thang.md`, `catalog.ts`, `function-words.ts`, các câu quiz cũ, file phụ đề hay `videos.json`.
- Không đổi `Question` / `QuestionKind`, không đổi luật `requiresViolations`, không bump store, không thêm key đồng bộ.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bài W2 | Mở đoạn Ngữ pháp `s1-t2-w2` (trang bài hoặc bước Bài chính của buổi) | 2 TenseCard theo thứ tự: "Quá khứ đơn: to be (was / were)" rồi "Quá khứ đơn: động từ có quy tắc". PAST_SIMPLE có dòng "Câu hỏi Wh-", không còn dòng "To be" | N/A |
| Quiz bài | Làm `lesson-s1-t2-w2`, mọi viên đã dạy | 5 câu ngẫu nhiên từ 12 câu của bài. Không có TTS vẫn đủ 5 câu | N/A |
| Thiếu nền | F14 chưa dạy (đang ở Sân ga, hàng C chưa xong) | Bỏ các câu mới cần F13 / F14 / F15. Quiz vẫn chạy bằng 6 câu cũ (không có `requires`) | `skipped` > 0 nhưng còn ≥ 4 câu thì quiz vẫn chạy (luật story 27) |
| Mini T2 | Làm `mini-t2` | Vẫn 10 câu, mỗi bài T2 ≥ 2 câu, không trùng | N/A |
| Thẻ vào SRS | Đánh dấu xong `s1-t2-w2` | Phiên ôn có `rule:past-to-be-1`, `rule:past-to-be-2`, `rule:past-simple-1` là thẻ mới. Thẻ đứng sau từ mới, quota từ mới và số từ đã giới thiệu không đổi; `newCount` cộng 3 như thẻ viên gạch (story 24) | N/A |
| Bài chưa xong / bị bỏ qua | `s1-t2-w2` chưa đánh dấu, hoặc bị Mũ Phân Loại xếp qua | Không có thẻ nào của bài | N/A |
| Bỏ đánh dấu | Đã có thẻ `rule:past-to-be-1`, rồi bỏ đánh dấu bài | Thẻ không vào phiên và không đếm tồn ôn. Mục trong `srs.cards` giữ nguyên. Đánh dấu lại thì lịch cũ chạy tiếp | N/A |
| Mặt thẻ | Lật thẻ `rule:past-to-be-2` | Nhãn "Thẻ quy tắc · T2 tuần 2". Mặt sau có câu quy tắc tiếng Việt và link "Xem lại bài" tới `/roadmap/lesson/s1-t2-w2/grammar`. Thẻ viên gạch vẫn hiện "Thẻ quy tắc · F13" và "Xem lại viên F13" | N/A |
| Lời mời ôn viên | Trong 14 ngày sai 2 câu mới cùng cần `be-questions` | Hôm nay mời "Ôn viên gạch F14" (cơ chế story 28) | N/A |
| Sổ lỗi cũ | Có lỗi `q-s1-t2-w2-01` … `-06`, `q-s1-t2-w4-02` | `getQuestion` trả đúng câu cũ, không đổi | N/A |
| Thẻ mồ côi | `srs.cards` có `rule:past-to-be-9` (không có trong dữ liệu) | Không hiện, không đếm tồn ôn, vẫn nằm trong store | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/types.ts:157-175` -- kiểu `Tense`. Thêm `TenseRuleCard` và `ruleCards?`.
- `src/data/lessons/t2-t4-grammar.ts` -- PAST_SIMPLE (:50-85): dòng công thức "To be" (:59), ví dụ 6 (:72); quy tắc 2–3 giữ nguyên. `GRAMMAR_T2_W2` (:349); review `GRAMMAR_T2_W4` (:351-362); helper `yg` (:10).
- `src/data/lessons/spells.ts` -- mục `obliviate` (`description`, `grammarEn`). `src/lib/roleplay.test.ts:59` cần vẫn khớp `/past simple with regular verbs/`.
- `src/data/lessons/t2-t4-pronunciation.ts:278` -- dòng ôn tổng O.W.L. cho `s1-t2-w2` grammar.
- `src/data/lessons/index.ts` -- `LESSON_CONTENTS`, `allTenses`. Thêm `lessonRuleCards(lessonId)`.
- `src/data/lessons/lessons.test.ts` -- danh sách id thì (:186-200), test thần chú: thì không có thần chú (:400-404), test story 32 (:407+).
- `src/data/questions/t2-t4.ts` -- `make` / `lesson()` (:14-46), khối `t2w2` (:68-84). Câu `t2w4.grammar(2/4)` (:116-123) giữ nguyên.
- `src/data/questions/concepts.ts` -- `requiresViolations` (câu T2–T4 có khai báo thì mọi khái niệm phải có người dạy). Chỉ đọc. Id khái niệm có ở `src/data/foundation/catalog.ts:15-168` (`teaches`) và `T1_LESSON_CONCEPTS`.
- `src/data/questions/questions.test.ts:72-82` -- đang chốt "66 câu, 6 câu mỗi bài". `requires.test.ts:50-52` -- test câu T2–T4 có `requires` thì phải hợp lệ.
- `src/lib/quiz/requires.ts`, `src/lib/quiz/brick-invite.ts` -- lọc câu theo viên và lời mời ôn. Dùng y nguyên. `brick-invite.test.ts:86-90` dùng `q-s1-t2-w2-01` làm câu không có `requires` (vẫn đúng).
- `src/lib/srs/srs.ts:50-80` -- `RULE_CARD_PREFIX`, `RuleStudyWord` (`brickId: string`). Thêm nguồn bài.
- `src/lib/flashcard-session.ts:166-185` -- `ruleCardId`, `ruleStudyWords` (chỉ viên đã xong). `reviewableDueCount` (:107) dùng `ruleStudyWords`, nên đếm tồn ôn tự khớp. `readCompletedLessonIds` lấy từ `@/lib/roadmap-progress`.
- `src/lib/flashcard-session.test.ts:437-500` -- test thẻ quy tắc viên gạch, làm mẫu cho test mới.
- `src/components/flashcards/FlashcardSession.tsx:286-328` -- `RuleFlashcard`: nhãn `Thẻ quy tắc · {brickId}`, link `brickHref`. `sectionHref` / `getLesson` lấy từ `@/data/roadmap`.
- `src/components/lesson/LessonContentParts.tsx:213-226` -- `GrammarSection` vẽ mọi Tense theo thứ tự (T4-W3 đã có 2 Tense). Không sửa.
- `src/lib/subs/lesson.ts` -- lấy `examples.en` để ưu tiên từ khi chơi điền từ. File phụ đề không có id `past-to-be` nên không tô theo thì mới. Chấp nhận, không sửa.
- `_bmad-output/specs/spec-english-learning-website/learning-rules.md:72`, `stack.md` dòng Flashcard SRS -- luật và id thẻ quy tắc.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/lessons/types.ts` -- thêm kiểu `TenseRuleCard = { id: string; cloze: string; answer: string; vi: string }` và `Tense.ruleCards?: readonly TenseRuleCard[]`. Doc comment ghi: bài đánh dấu xong thì thẻ vào SRS, id `rule:<tenseId>-n`.
- [x] `src/data/lessons/t2-t4-grammar.ts` -- sửa dữ liệu bài (chữ mẫu ở Design Notes):
  - thêm `PAST_TO_BE` (không có `spellId`);
  - `GRAMMAR_T2_W2 = { tenses: [PAST_TO_BE, PAST_SIMPLE] }`;
  - PAST_SIMPLE: dòng công thức "To be" đổi thành "Câu hỏi Wh-", ví dụ 6 đổi thành câu Wh + did, thêm `ruleCards` (1 thẻ);
  - review T2-W4: thêm 1 dòng tóm tắt was / were, và thêm "Did you be" vào dòng "Không trộn".
- [x] `src/data/lessons/spells.ts` -- sửa mục `obliviate`:
  - `description`: "Đưa việc về quá khứ đã xong: động từ thêm -ed, hỏi và phủ định với did; was / were tự hỏi và phủ định, không mượn did." (đã sửa sau review);
  - `grammarEn`: "the past of to be (was / were) and the past simple with regular verbs (-ed, did, didn't)".
- [x] `src/data/lessons/t2-t4-pronunciation.ts` -- dòng ôn tổng :278 đổi thành "Quá khứ đơn: was / were; động từ có quy tắc V-ed, did / didn't, Wh + did.".
- [x] `src/data/lessons/index.ts` -- export `lessonRuleCards(lessonId): readonly TenseRuleCard[]`. Hàm trả thẻ của mọi Tense trong bài theo thứ tự; bài không có thẻ thì trả `[]`.
- [x] `src/data/questions/t2-t4.ts` -- `lesson()` nhận thêm tham số `requires` (không bắt buộc) cho `grammar`, và `make` gắn `requires` khi có. Thêm `t2w2.grammar(7…12)` theo Design Notes. Sửa chú thích đầu file: 72 câu, s1-t2-w2 có 12 câu.
- [x] `src/lib/srs/srs.ts` -- `RuleStudyWord`: đổi thành `brickId?: string` và thêm `lessonId?: string`. Mỗi thẻ có đúng một trong hai trường. Sửa comment của `RULE_CARD_PREFIX` / kiểu cho đúng (thẻ viên gạch và thẻ thì).
- [x] `src/lib/flashcard-session.ts` -- `ruleStudyWords`:
  - giữ nguyên thẻ viên gạch;
  - nối thêm thẻ của các bài trong `readCompletedLessonIds(store)`, theo thứ tự `allLessons()`. Mỗi thẻ là `{ id: ruleCardId(card), rule: true, word: answer, lessonId, cloze, answer, vi }`;
  - sửa doc comment.
- [x] `src/components/flashcards/FlashcardSession.tsx` -- sửa `RuleFlashcard`:
  - thẻ có `lessonId`: nhãn "Thẻ quy tắc · T2 tuần 2" (lấy `monthId` viết hoa + " tuần " + `week` từ `getLesson`), link "Xem lại bài" tới `sectionHref(lessonId, 'grammar')`;
  - thẻ viên gạch giữ nguyên;
  - giữ nguyên className.
- [x] `src/data/lessons/lessons.test.ts` -- cập nhật test cũ và thêm describe "to be quá khứ và Wh + did (story 33)":
  - danh sách id thì thêm `past-to-be` ngay trước `past-simple`;
  - test thần chú cho `past-to-be` không có thần chú;
  - `GRAMMAR_T2_W2` có thứ tự `['past-to-be', 'past-simple']`;
  - formulas của `past-to-be` có các nhãn Khẳng định / Phủ định / Câu hỏi / There was / were. Chữ của Tense có "wasn't", "weren't", "Yes, I was", "There were", "Where were you";
  - mistakes có `wrong` là "Did you be at home?", "I didn't was tired.", "I was work late.";
  - PAST_SIMPLE có công thức nhãn "Câu hỏi Wh-" chứa "did", có ví dụ khớp `/^(What|Where|When|Who)\b.*\bdid\b/`, không còn công thức nhãn "To be";
  - câu tiếng Anh của `past-to-be` (examples, `mistakes.right`, thẻ đã điền đáp án) không chứa dạng V2 / V3 nào trong `IRREGULAR_VERBS`, trừ was / were / did và dạng trùng V1;
  - thẻ quy tắc của mọi Tense: đúng một `___`, `answer` không rỗng, id dạng `${tense.id}-rule-n`, id không trùng nhau và không trùng thẻ viên gạch;
  - `lessonRuleCards('s1-t2-w2')` trả id `['past-to-be-rule-1', 'past-to-be-rule-2', 'past-simple-rule-1']`, `lessonRuleCards('s1-t2-w1')` trả `[]`.
- [x] `src/data/questions/questions.test.ts` -- cập nhật test 66 câu: T2–T4 có 72 câu; `s1-t2-w2` có 12 câu, các bài khác vẫn 6 câu. Thêm test:
  - `q-s1-t2-w2-07` … `-12` có `requires` khác rỗng, `requiresViolations` rỗng, tag `thì`, kind `choice`;
  - các câu này không chứa V2 / V3 bất quy tắc (trừ was / were / did), không có "some / any / many / because";
  - có ít nhất 1 câu đáp án `Were`, có câu có lựa chọn "Did", có câu Wh + did;
  - `q-s1-t2-w2-01` … `-06` vẫn không có `requires`, đề vẫn như cũ;
  - quiz bài W2 bốc 5 câu với cả `canSpeak` true / false; mini-t2 vẫn chạy như test cũ.
- [x] `src/lib/quiz/requires.test.ts` (hoặc file test cạnh `requires.ts`) -- dùng `planQuiz`: F14 chưa dạy thì quiz `lesson-s1-t2-w2` bỏ các câu cần F14 và vẫn chạy (`status: 'run'`, ≥ 4 câu); mọi viên đã dạy thì `skipped === 0`.
- [x] `src/lib/flashcard-session.test.ts` -- thêm test thẻ thì:
  - đánh dấu xong `s1-t2-w2` thì `ruleStudyWords` có 3 thẻ đúng thứ tự, đứng sau thẻ viên gạch; mỗi thẻ có `lessonId`, không có `brickId`;
  - phiên hôm đó có 3 thẻ mới mà quota từ mới không đổi (`newCount` cộng 3 như thẻ viên gạch);
  - bài chưa xong hoặc bị bỏ qua khi xếp lớp thì không có thẻ;
  - bỏ đánh dấu thì thẻ đã có không vào phiên và không đếm tồn ôn (`newPerDayFor`), mục `srs.cards` vẫn còn;
  - `rule:past-to-be-9` mồ côi thì không hiện.
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- mục Thẻ quy tắc (:72) thêm một câu: "Thì trong bài Chặng 1 cũng có thể góp thẻ quy tắc: chỉ bài đã đánh dấu xong mới góp (bài bỏ qua khi xếp lớp thì không), thẻ đứng sau thẻ viên gạch (story 33).".
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- dòng Flashcard SRS ghi thêm id `rule:<tenseId>-n` (từ id nội dung `<tenseId>-rule-n`) cho thẻ của thì.

**Acceptance Criteria:**
- Given Huy mở `#/roadmap/lesson/s1-t2-w2` ở 375px, when xem đoạn Ngữ pháp, then thấy thẻ was / were đứng trên thẻ động từ có quy tắc, mọi dòng xuống dòng gọn và `scrollWidth` bằng 375.
- Given Huy đánh dấu xong bài s1-t2-w2, when mở flashcard hôm đó, then gặp 3 thẻ quy tắc mới sau các từ mới. Lật thẻ thì thấy nhãn "T2 tuần 2", bấm "Xem lại bài" thì về đúng đoạn Ngữ pháp.
- Given máy cũ (bản trước story 33) đồng bộ store có thẻ `rule:past-to-be-1`, when mở app cũ, then app không lỗi và thẻ không hiện (app cũ chỉ duyệt thẻ nó biết).

## Implementation Notes

- Dữ liệu: `PAST_TO_BE` (không `spellId`) đứng trước `PAST_SIMPLE` trong `GRAMMAR_T2_W2`, chữ theo Design Notes. PAST_SIMPLE đổi dòng "To be" → "Câu hỏi Wh-", ví dụ 6 → "Where did you stay in Da Nang? — At a small hotel.", thêm `past-simple-rule-1`; quy tắc 2–3 giữ nguyên chữ story 32. Ôn T2-W4 thêm dòng was / were sau dòng quá khứ có quy tắc, dòng "Không trộn" thêm "Did you be". Obliviate và dòng ôn tổng O.W.L. sửa đúng chữ của Tasks.
- `lessonRuleCards(lessonId)` (index.ts) dựng sẵn map theo bài lúc nạp module; id lạ / bài không có thẻ → `[]` dùng chung.
- Quiz: `make` / `lesson().grammar` nhận `requires` (tham số cuối, không bắt buộc); 6 câu `q-s1-t2-w2-07..12` đúng bảng Design Notes, `requires` giữ nguyên bảng. Câu 12 có `tenses-overview` (F17) nên khi mới xong F01–F12 quiz bài báo thiếu F13, F14, F15, F17 (test ghi đúng vậy).
- Test cũ `requires.test.ts` "quiz T2–T4 không lọc gì kể cả khi chưa học viên nào" dùng `mini-t2`: nay mini-t2 có câu có `requires` nên đổi sang `lesson-s1-t2-w1` + `lesson-s1-t3-w1` (vẫn là câu không khai báo), và thêm test riêng: chưa học viên nào thì mini-t2 bỏ 6 câu mới mà vẫn 10 câu, mỗi bài T2 ≥ 2 câu (có TTS), không trùng.
- SRS: `RuleStudyWord.brickId?` / `lessonId?`. `ruleStudyWords` nối thẻ của bài trong `readCompletedLessonIds` theo `allLessons()` sau thẻ viên gạch; `reviewableDueCount` đi qua `ruleStudyWords` nên bỏ đánh dấu bài / thẻ mồ côi tự không đếm. `flashcard-session.ts` import `@/data/lessons` (module này đã kéo `@/data/lessons` qua `@/lib/sessions` → `plan.ts`, nên không đổi chunk).
- `RuleFlashcard`: hàm `ruleSource` (sau review tách ra `src/components/flashcards/rule-source.ts`, có `rule-source.test.ts`) chọn nhãn / link; thẻ có `lessonId` → "T2 tuần 2" (`monthId` viết hoa + " tuần " + `week`), link "Xem lại bài" → `sectionHref(lessonId, 'grammar')`; bài lạ → nhãn là id, không link. Thẻ viên gạch giữ chữ cũ. Không đổi className (`layout:guard` qua).
- Kiểm tra tay (Chrome headless qua CDP, 375px, `VITE_SUPABASE_*` rỗng, store đã bỏ qua Sân ga + xong tới s1-t2-w2 + thẻ `rule:past-to-be-2` đến hạn): trang bài có 2 TenseCard đúng thứ tự, có "Câu hỏi Wh-", `scrollWidth` 375; quiz bài chạy "Câu 1/5"; flashcard hiện "Thẻ quy tắc · T2 tuần 2", lật thấy câu quy tắc và link "Xem lại bài" `#/roadmap/lesson/s1-t2-w2/grammar`, bấm thì tới đúng đoạn; không cuộn ngang ở mọi màn. Chưa chạy `npm run layout:check` (so ảnh sẽ lệch có chủ đích vì nội dung bài đổi; route đo không gồm s1-t2-w2).
- `npm run lint`, `npm test` (75 file, 1773 test; sau vá review: 76 file, 1778 test), `npm run build`, `npm run layout:guard` đều qua.

## Spec Change Log

- **2026-11-12, sau review (vòng 0, không loopback):**
  - **Kích hoạt:** review blind #14 và edge #15 (xem Review Triage Log).
  - **Sửa phần frozen (Huy cho chạy liên tục, mỗi chỗ chỉ có một cách sửa hợp lý):**
    - Dòng Decisions ghi lại đúng: thứ tự story và việc đặt quá khứ tiếp diễn ở Chặng 1 là đề xuất của Claude. Huy không chọn riêng, Huy đồng ý khi trả lời "hoàn thiện giúp tôi đi". Đây là cùng loại lỗi đã sửa ở commit 3199b5c.
    - Matrix "Thẻ vào SRS": `newCount` cộng 3 như thẻ viên gạch (story 24, test "7 từ mới hôm nay"). Thứ không đổi là quota từ mới và số từ đã giới thiệu. Chữ cũ "newCount không đổi" mâu thuẫn với luật story 24 mà story này phải giữ.
  - **Sửa phần không frozen:** Tasks (mô tả Obliviate, test newCount), Implementation Notes (`rule-source.ts`), Design Notes (chữ bài, 2 thẻ, câu quiz 07, `requires` 08/11/12, thứ tự dòng ôn T2-W4) cho khớp code đã vá.
  - **Trạng thái xấu đã tránh:**
    - quiz chép nguyên câu thẻ;
    - giải thích nói was / were không bao giờ đứng trước động từ, trong khi quá khứ tiếp diễn (story 46) cần đúng điều đó;
    - dùng at + nơi chốn mà chưa có bài nào dạy;
    - nhãn và link thẻ quy tắc không có test.
  - **KEEP:**
    - id thẻ và id câu giữ nguyên;
    - thứ tự Tense `past-to-be` → `past-simple`;
    - 4 nhãn công thức;
    - thẻ viên gạch đứng trước thẻ bài;
    - không đổi schema.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, content | Câu quiz q-09, q-12 chép nguyên câu thẻ `past-to-be-rule-2`, `past-simple-rule-1` | medium | Đúng: `t2-t4.ts` q-09 / q-12 trùng chữ cloze ở `t2-t4-grammar.ts`. Quiz đo trí nhớ thẻ, đúng điều audit mục 7 nêu. | patch: đổi 2 thẻ ("___ they at work yesterday? — No, they weren't.", "What ___ she cook last Sunday?"), thêm test thẻ ≠ đề quiz của bài |
| 2 | blind, content | Lỗi "I was work late." giải thích "không đặt was / were trước động từ thường", sai với was + V-ing (W1 đã dạy -ing, story 46) | medium | Đúng: `why` ở mục mistakes nói tuyệt đối. "I was working" đúng, và story 46 dạy ngay ở s1-t2-w4. | patch: why → "ngay trước động từ nguyên mẫu (work)"; quy tắc 3 thêm "không dùng was / were + nguyên mẫu"; thêm test |
| 3 | blind | Thiếu lỗi bỏ be của người Việt ("I tired yesterday."), thiếu "There was two cats" | medium | Đúng: 4 lỗi cũ không có lỗi bỏ be. PRESENT_CONTINUOUS có lỗi tương tự ("I working"), nên đây là lỗi thật hay gặp. Phần there was / were đã có q-11 và dòng công thức phủ. | patch: thêm lỗi thứ 5 "I tired yesterday." → "I was tired yesterday.", có test; không thêm câu There was two cats |
| 4 | blind | Không câu quiz nào có đáp án were cho câu hỏi Wh- | low | Đúng: q-12 chỉ hỏi phía did. Sự tương phản Where were / What did ở quy tắc 3 chỉ được đo một nửa. | patch: q-07 đổi thành "Where ___ they last night? — At home." (were · did · was · are), vẫn giữ 6 câu; test có câu Wh + were |
| 5 | blind | `requires` không nhất quán (thiếu articles ở 11 / 12, thiếu subject-pronouns ở 08) | low | Đúng: q-11 "the garden", q-12 "A movie", q-08 "He" không khai báo. Sửa chỉ là thêm id khái niệm (F09, F11), không có nhánh mới. | patch: thêm `articles` cho 11 / 12, `subject-pronouns` cho 08; test requiresViolations vẫn qua |
| 6 | blind | Wh + was / were không có dòng công thức riêng | false | Phần Wh + was / were có trong dòng "Câu hỏi" ("Where were you?"), quy tắc 3 và ví dụ 6. Intent chỉ đòi có đủ phần, không đòi một dòng riêng. | reject |
| 7 | blind | Không có phát âm dạng yếu /wəz/, /wɚ/ và câu nghe wasn't / weren't | medium | Đúng là chưa có. Đây là lỗ hổng có từ trước của đoạn Phát âm W2 (story 33 không đụng tới). Intent story 33 không nói tới phát âm. | defer |
| 8 | blind | Thẻ không phủ phủ định, there was / were, was vs V-ed | low | Đúng một phần. Intent chốt "2 thẻ của past-to-be", story 38 thêm thẻ. Thẻ rule-2 mới đã có weren't ở câu trả lời. | reject (intent chốt số thẻ, story 38) |
| 9 | blind | mini-t2 không bảo đảm có câu was / were; O.W.L. không có câu was / were | low | Đúng: mini-t2 bốc ngẫu nhiên. Mục Never của intent giao kho câu O.W.L. cho story 40 và việc báo theo thì cho story 39–41. | reject (intent loại trừ) |
| 10 | blind | Test nội dung chưa phủ ví dụ / thẻ PAST_SIMPLE mới; không kiểm "so" | low | Đúng: test V2 / V3 chỉ chạy trên `past-to-be`, test some / any chỉ chạy trên câu quiz. | patch: test phủ past-to-be và past-simple (ví dụ, câu đúng, thẻ), thêm some / any / many / because / so; quiz thêm "so" |
| 11 | blind | Nhãn / link thẻ (`ruleSource`) trong .tsx không có test; nhãn "T2 tuần 2" không nêu thì | medium | Phần test: đúng, gộp với #18. Phần nhãn: Matrix frozen chốt nhãn "Thẻ quy tắc · T2 tuần 2". | patch (phần test, cùng #18); phần nhãn reject |
| 12 | blind | Ôn T2-W4 xếp dòng was / were sau dòng động từ có quy tắc, ngược thứ tự bài | low | Đúng: thứ tự trong bài là `past-to-be` trước. Sửa là đổi chỗ 2 dòng. | patch: đổi chỗ 2 dòng |
| 13 | blind, content | Bản dịch "Bạn có mệt không?", "Thứ Hai họ…" mất dấu quá khứ; thẻ rule-1 `vi` thiếu danh từ số nhiều | low | Đúng: dịch ngược sẽ ra hiện tại. Story 35–36 thêm dịch Việt → Anh. | patch: "Lúc đó bạn có mệt không?", "Thứ Hai vừa rồi…", vi thẻ rule-1 thêm danh từ số nhiều / số ít |
| 14 | blind | Story ghi "Huy chọn đặt ở Chặng 1" và gán thứ tự story cho Huy; status in-progress, Triage Log trống | low | Phần quyết định: đúng. Báo cáo hỏi Huy 2 việc, Huy chỉ trả lời "hoàn thiện giúp tôi đi" (decisions file). Phần status / log: false, vì bước triage này mới điền. | patch: sửa chữ frozen (Claude đề xuất, Huy đồng ý) + Spec Change Log |
| 15 | edge | `newCount` cộng 3 thẻ quy tắc, trái Matrix "newCount / quota không đổi" | low | Code đúng luật story 24: `srs.ts` cộng `freshRules`, test story 24 chốt "7 từ mới hôm nay". Quota và introducedToday không đổi (test). Matrix viết lệch. | patch spec: sửa chữ Matrix và Tasks (frozen, có Change Log), không đổi code |
| 16 | edge | Bài bị xếp lớp bỏ qua nhưng có done=true vẫn góp thẻ | false | Xếp lớp không ghi `done` (test "bị Mũ Phân Loại xếp qua" không có thẻ). done=true chỉ có khi người học tự đánh dấu, tức là đã học, nên góp thẻ là đúng. | reject |
| 17 | edge | `RuleStudyWord` cho phép thiếu cả `brickId` lẫn `lessonId` | false | Chỉ `ruleStudyWords` (`flashcard-session.ts:183, 197`) tạo thẻ, và luôn gán đúng một trường. Không có đường nào khác tạo thẻ (đã grep `rule: true`). | reject |
| 18 | vgap | Nhãn "T2 tuần 2" / link "Xem lại bài" / nhánh viên gạch không có test chạy thật | medium | Đã xác minh sẵn: Vitest chỉ chạy `*.test.ts`, `ruleSource` nằm trong .tsx. | patch: tách `src/components/flashcards/rule-source.ts` + `rule-source.test.ts` (bài s1-t2-w2, bài lạ, F13, viên lạ) |
| 19 | content | why của "I was work late." sai (trùng #2) | medium | Cùng gốc #2. | patch (cùng #2) |
| 20 | content | "Where did you stay in Da Nang?" và "Where were you?" dịch cùng "bạn ở đâu" | low | Đúng: bản dịch làm mất tương phản hành động / trạng thái. Sửa trực tiếp chữ. | patch: "Hồi ở Đà Nẵng bạn nghỉ ở đâu?" |
| 21 | content | at + nơi chốn (at home / at work / at school) dùng nhiều nhưng chưa bài nào dạy | medium | Đúng: `f15.ts:5-6` ghi "chưa có … at", F18 chỉ dạy at chỉ giờ. Trong bài was / were thì at là cụm chủ đạo. | patch: quy tắc 3 thêm "at home = ở nhà, at work = ở chỗ làm, at school = ở trường" |
| 22 | content | Mô tả Obliviate dễ hiểu nhầm là was / were cũng mượn did | low | Đúng: đọc liền một dòng thì ra đúng lỗi "Did you be". Sửa trực tiếp chữ. | patch: "…hỏi và phủ định với did; was / were tự hỏi và phủ định, không mượn did." |
| 23 | content | Hai câu quiz chép thẻ (trùng #1) | low | Cùng gốc #1. | patch (cùng #1) |
| 24 | content | Quy tắc 1 thiếu danh từ không đếm được | low | Đúng: quy tắc 1 và dòng There was chỉ nói số ít, trong khi F11 đã dạy không đếm được. | patch: thêm "danh từ không đếm được" vào quy tắc 1 và dòng There was / were |
| 25 | content | Bản dịch thiếu dấu quá khứ (trùng #13) | low | Cùng gốc #13. | patch (cùng #13) |
| 26 | content | Từ vượt mức ~370 từ: weather (#1068), cinema (#963, Anh-Anh) | low | Đúng theo hạng NGSL. Sửa trực tiếp chữ. | patch: "The room was cold yesterday."; cinema bỏ do q-07 viết lại |
| 27 | content | Giải thích q-07 "did không đứng trước nơi chốn" khó hiểu | low | Đúng: câu này không nói vì sao did sai. | patch: q-07 viết lại, giải thích "did chỉ dùng khi có động từ thường (Where did they stay?)" |
| 28 | content | "đảo was / were lên đầu câu" không đúng với câu hỏi Wh- | low | Đúng: "Where were you?" có was / were đứng sau từ Wh-. | patch: "lên trước chủ ngữ" (lỗi 1 và thẻ rule-2) |

## Design Notes

Chữ mẫu, được viết gọn lại nhưng phải giữ đủ mọi ý trong Matrix và Tasks. Dấu nháy thẳng `'` như file hiện có.

```ts
export const PAST_TO_BE: Tense = {
  id: 'past-to-be',
  name: 'Quá khứ đơn: to be (was / were)',
  use: 'Nói ai / cái gì đã là gì, ở đâu, thế nào ở một lúc trong quá khứ (yesterday, last night, in 2020).',
  timeline: { kind: 'past-point', label: 'Trạng thái đúng ở một lúc trong quá khứ' },
  formulas: [
    { label: 'Khẳng định', text: 'I / he / she / it was · you / we / they were + danh từ / tính từ / nơi chốn: I was tired. They were at home.' },
    { label: 'Phủ định', text: "S + was / were + not (wasn't, weren't): She wasn't at work." },
    { label: 'Câu hỏi', text: "Was / Were + S + …?  → Yes, I was. / No, they weren't.  Where were you?" },
    { label: 'There was / were', text: 'There was + danh từ số ít hoặc không đếm được · There were + danh từ số nhiều: There was a cat. There were two cars.' },
  ],
  rules: [
    'Giống am / is / are, chỉ đổi sang quá khứ: am, is → was; are → were. I, he, she, it, danh từ số ít và danh từ không đếm được đi với was; you, we, they và danh từ số nhiều đi với were.',
    "Phủ định và câu hỏi dùng chính was / were, không mượn did: I wasn't tired (không phải I didn't be tired); Were you at home? (không phải Did you be at home?). Trả lời ngắn: Yes, I was. / No, I wasn't.",
    'was / were đi với danh từ, tính từ, nơi chốn (at home = ở nhà, at work = ở chỗ làm, at school = ở trường). Việc đã làm (động từ thường) thì dùng V-ed / did, không dùng was / were + nguyên mẫu: I was at home. I watched TV. Hỏi Wh-: Where were you? nhưng What did you do?',
  ],
  examples: [
    { en: 'I was at home last night.', vi: 'Tối qua tôi ở nhà.' },
    { en: 'The room was cold yesterday.', vi: 'Hôm qua căn phòng lạnh.' },
    { en: "They weren't at school on Monday.", vi: 'Thứ Hai vừa rồi họ không có mặt ở trường.' },
    { en: 'Were you tired? — Yes, I was.', vi: 'Lúc đó bạn có mệt không? — Có.' },
    { en: 'There were two people in the room.', vi: 'Lúc đó trong phòng có hai người.' },
    { en: 'Where were you yesterday?', vi: 'Hôm qua bạn ở đâu?' },
  ],
  mistakes: [
    { wrong: 'Did you be at home?', right: 'Were you at home?', why: 'Với was / were thì đảo was / were lên trước chủ ngữ, không mượn did.' },
    { wrong: "I didn't was tired.", right: "I wasn't tired.", why: "Phủ định thêm not ngay sau was / were: wasn't, weren't." },
    { wrong: 'I was work late.', right: 'I worked late.', why: 'Không đặt was / were ngay trước động từ nguyên mẫu (work). Việc đã làm dùng V-ed (worked).' },
    { wrong: 'They was happy.', right: 'They were happy.', why: 'you / we / they và danh từ số nhiều luôn đi với were.' },
    { wrong: 'I tired yesterday.', right: 'I was tired yesterday.', why: 'Tiếng Việt nói "tôi mệt" không cần động từ; tiếng Anh phải có was / were trước tính từ, nơi chốn.' },
  ],
  dialogues: [yg('where were you'), yg('there was a')],
  ruleCards: [
    { id: 'past-to-be-rule-1', cloze: 'Yesterday they ___ at home.', answer: 'were', vi: 'you / we / they và danh từ số nhiều + were; I / he / she / it và danh từ số ít + was.' },
    { id: 'past-to-be-rule-2', cloze: "___ they at work yesterday? — No, they weren't.", answer: 'Were', vi: 'Hỏi với was / were: đảo was / were lên trước chủ ngữ, không mượn did (không nói Did they be…?).' },
  ],
}

// PAST_SIMPLE: dòng công thức thay cho "To be", ví dụ 6, thẻ
{ label: 'Câu hỏi Wh-', text: 'What / Where / When … + did + S + động từ nguyên mẫu?  Where did you stay?' }
{ en: 'Where did you stay in Da Nang? — At a small hotel.', vi: 'Hồi ở Đà Nẵng bạn nghỉ ở đâu? — Ở một khách sạn nhỏ.' }
ruleCards: [{ id: 'past-simple-rule-1', cloze: 'What ___ she cook last Sunday?', answer: 'did', vi: 'Hỏi Wh- về việc đã làm: Wh + did + S + động từ nguyên mẫu (không phải What you watched?).' }]

// Review T2-W4: dòng mới (đặt trước dòng quá khứ đơn có quy tắc, đúng thứ tự bài)
"Quá khứ của to be: was / were; hỏi và phủ định không mượn did (Were you…? I wasn't…)."
// dòng "Không trộn" thêm "Did you be"
```

Câu quiz mới (đáp án đứng đầu; `requires` có thể thêm bớt nhưng phải hợp lệ và đúng với điều câu cần):

| id | Đề | Lựa chọn | requires |
|---|---|---|---|
| 07 | Where ___ they last night? — At home. | were · did · was · are | wh-questions, be-questions, subject-pronouns, prepositions-of-place |
| 08 | Tom ___ at school yesterday. He was at home. | wasn't · weren't · didn't · isn't | be-affirmative, be-negative, subject-pronouns, prepositions-of-place |
| 09 | ___ you tired last night? — Yes, I was. | Were · Did · Was · Are | be-questions, subject-pronouns |
| 10 | Was the hotel nice? — No, it ___. | wasn't · didn't · isn't · weren't | be-questions, be-negative, articles |
| 11 | There ___ two cats in the garden yesterday. | were · was · are · did | there-is-are, plurals, articles, prepositions-of-place |
| 12 | What ___ you watch last night? — A movie. | did · were · do · was | wh-questions, present-simple-questions, articles, tenses-overview |

Giải thích ngắn, mỗi câu nêu đúng luật của câu đó. Ví dụ câu 09: "Hỏi với to be ở quá khứ thì đảo Were lên đầu; không mượn Did (không nói Did you be tired?). you đi với were." Câu 12: "Hỏi Wh- về việc đã làm (watch là động từ thường): What + did + S + nguyên mẫu. last night là quá khứ nên không dùng do."

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run layout:guard` -- expected: pass, không có class nào đổi.

**Manual checks:**
- Chrome headless ở 375px, mở `#/roadmap/lesson/s1-t2-w2` và `#/practice/quiz/lesson-s1-t2-w2`. Expected: `scrollWidth` bằng 375, có đủ 2 TenseCard, quiz chạy 5 câu.
- Tạo store có `s1-t2-w2` đã xong, rồi mở `#/practice/flashcards` tới thẻ quy tắc. Expected: nhãn "Thẻ quy tắc · T2 tuần 2", link "Xem lại bài" về đúng đoạn Ngữ pháp, không cuộn ngang.
