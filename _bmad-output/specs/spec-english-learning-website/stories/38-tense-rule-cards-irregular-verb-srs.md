---
title: 'Ôn thì bằng SRS: thẻ quy tắc cho mọi thì, thẻ động từ bất quy tắc mở theo nhóm, bảng che cột (CAP-9, CAP-10, CAP-11, learning-rules "Thẻ quy tắc")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: 'e423bc44966f240b3be580955b070b62e0d3528d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/33-past-to-be-wh-did.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/36-t1-t2-tense-practice-data.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47. Thứ tự do Claude đề xuất: 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" nghĩa là Huy tự làm ra câu đúng thì, và **thì đã học được ôn giãn cách (SRS), trộn với thì cũ**. Báo cáo kiểm tra, mục C3: học xong tuần là thôi, các thì T3 tới O.W.L. mới gặp lại; 50 động từ bất quy tắc chỉ là bảng để đọc.
- Quyết định 4: dùng lại tối đa bộ máy đã có. Story 33 đã làm sẵn đường đi thẻ quy tắc của thì (`Tense.ruleCards`, `lessonRuleCards`, `rule:<tenseId>-n`, `RuleStudyWord.lessonId`, nhãn "T2 tuần 2"). Story này chỉ thêm dữ liệu và một nguồn thẻ mới, không dựng hệ SRS mới.
- Ràng buộc chung giữ nguyên:
  - không khoá, không phạt, không reset; thuật toán SRS và lịch thẻ cũ giữ nguyên;
  - nội dung tiếng Việt tự soạn, chỉ dùng kiến thức đã dạy;
  - giao diện 375px không đổi, ngoài phần bảng động từ mới (che cột);
  - không bump schema store (thẻ mới là key mới trong `srs.cards`).
- Claude chọn:
  - **Thẻ của thì:** 13 Tense (mọi Tense trừ `to-be`, vì to be ở s1-t1-w1 chỉ ôn F13–F14 mà viên gạch đã có thẻ) mỗi Tense có 4–5 thẻ, theo đúng bảng ở Design Notes. Tổng 55 thẻ: giữ nguyên 3 thẻ của story 33, thêm 52 thẻ.
    - Thì dạy đủ ba dạng: thẻ phủ khẳng định, phủ định, câu hỏi và một cặp dễ nhầm.
    - Bài chỉ dạy một dạng (hiện tại đơn khẳng định), hoặc chủ điểm không phải thì (modal, so sánh, bị động): thẻ phủ các điểm chính của bài.
    - Luật góp thẻ giữ như story 33: chỉ bài đã đánh dấu xong mới góp thẻ.
  - **Thẻ động từ bất quy tắc:**
    - Mỗi động từ một thẻ "V1 → V2 · V3", ví dụ `go → ___ (V2 · V3)`, đáp án `went · gone`. Id nội dung `irregular-<v1>-rule-1`, id SRS `rule:irregular-<v1>-1`. Vì thẻ hỏi cả V3, cột V3 được ôn giãn cách từ T2-W3, trước khi tới T3-W3.
    - Thẻ mở khi Huy **tới bài s1-t2-w3**: bài đó đã đánh dấu xong, hoặc là bài hiện tại khi đã ra khỏi Sân ga. Bài bị Mũ Phân Loại xếp qua thì không mở, giống luật của thẻ thì.
    - Thẻ mở **theo nhóm âm** (15 nhóm, đúng thứ tự bảng), tối đa **10 động từ mỗi ngày** (khớp lời dặn "Học mỗi ngày 10 động từ" trên bảng):
      - luôn mở trọn nhóm, không cắt đôi nhóm;
      - hôm nay chưa mở nhóm nào thì nhóm kế tiếp luôn được mở, kể cả khi nhóm có hơn 10 động từ;
      - nhóm đã mở mà còn động từ chưa vào phiên thì vẫn tiếp tục;
      - ngày tồn ôn (> 40 thẻ đến hạn) không mở thẻ động từ mới;
      - nghỉ một ngày thì hôm sau mở tiếp như thường, không dồn ngày bù.
      
      Đi đều thì sau 6 ngày mở hết 50 động từ. Thẻ động từ không tính vào quota từ mới, giống thẻ quy tắc.
  - **Bảng che cột:** bảng động từ có nút "Che V2" và "Che V3". Ô bị che hiện nút "Xem" để hiện riêng ô đó. Nút nghe chỉ đọc V1 và các cột đang hiện. Không lưu gì vào store.
  - **"Ôn cột V3 trước T3-W3":** ngoài thẻ, đoạn Ngữ pháp của s1-t3-w3 mở đầu bằng bảng "Ôn cột V3 trước khi học", che sẵn cột V3, đứng trước thẻ hiện tại hoàn thành. Lịch SRS không bị kéo sớm hay sửa.
  - Giữ nguyên mọi id cũ: `past-to-be-rule-1/2`, `past-simple-rule-1` (chữ không đổi), id Tense, id câu quiz.

**Problem:** Hiện chỉ 2 thì có thẻ SRS (3 thẻ, từ story 33). Hiện tại đơn, tiếp diễn, quá khứ bất quy tắc và mọi thì T3–T4 học xong tuần là không gặp lại. 50 động từ bất quy tắc chỉ nằm trong bảng để đọc: không có thẻ, không che cột được. Vì vậy V3 chưa được ôn lần nào khi Huy vào hiện tại hoàn thành.

**Approach:**
- Thêm `ruleCards` cho 13 Tense (dữ liệu thuần).
- Tách 50 động từ thành 15 nhóm âm và sinh thẻ V1 → V2 · V3.
- `ruleStudyWords` có thêm nguồn thẻ động từ, mở theo nhóm và giới hạn mỗi ngày, tính hoàn toàn từ `srs.cards` (không thêm state).
- Bảng động từ có chế độ che cột. s1-t3-w3 có bảng ôn V3 che sẵn.

## Boundaries & Constraints

**Always:**
- Thẻ của thì:
  - đúng bảng Design Notes: số thẻ, id, đáp án, điểm mà từng thẻ phủ. Chữ câu có thể chỉnh nhẹ nếu va test, nhưng phải giữ đáp án và điểm phủ;
  - `cloze` có đúng một `___`, gợi ý động từ (nếu có) đứng ngay sau `___` trong ngoặc; `answer`, `vi` không rỗng; `vi` là câu quy tắc tiếng Việt nói vì sao;
  - id `<tenseId>-rule-n` nối tiếp, không trùng thẻ viên gạch;
  - `to-be` không có thẻ.
- Chỉ dùng kiến thức đã dạy:
  - câu đã điền đáp án (bỏ ngoặc gợi ý) của thẻ 6 thì T1–T2 có `outOfScopeWords(tenseId, …)` rỗng;
  - thẻ T3–T4 không chứa dấu hiệu của bài dạy sau nó (bảng "Dấu hiệu theo bài" ở Design Notes);
  - không dùng some / any / many / because / so, không dùng "Don't + V".
- Câu đã điền của thẻ không trùng câu ví dụ (`examples[].en`), `mistakes[].right` hay `answer` của câu quiz cùng bài. Thẻ đo quy tắc, không đo trí nhớ câu mẫu.
- `IRREGULAR_VERBS` giữ nguyên 50 mục, đúng thứ tự và chữ như baseline: `tense-scope.ts` và test cũ vẫn dùng. Nhóm là dữ liệu mới, gộp lại phải ra đúng mảng cũ.
- Thẻ động từ:
  - là `RuleStudyWord` có `lessonId: 's1-t2-w3'` và `verbGroup` (tên nhóm);
  - cùng shape `SrsCard`, không bump schema, không thêm key đồng bộ; sync / backup / gộp giữ như mọi thẻ;
  - thẻ đã có trong `srs.cards` luôn đi theo lịch của nó khi đã tới s1-t2-w3. Chưa tới (hoặc bỏ đánh dấu lùi về trước) thì không hiện và không đếm tồn ôn, mục trong store giữ nguyên.
- Thứ tự thẻ quy tắc trong phiên: thẻ viên gạch (F01 → F18) → thẻ thì (theo lộ trình) → thẻ động từ (theo nhóm, rồi theo thứ tự trong nhóm).
- `newPerDayFor`, quota từ mới, số từ đã giới thiệu không đổi vì thẻ mới. `newCount` cộng số thẻ quy tắc mới, như story 24 và 33.
- 375px:
  - thẻ flashcard chỉ đổi chữ (nhãn, link), không thêm hay xoá class;
  - bảng động từ được thêm nút che và nút "Xem", vẫn `table-fixed`, `scrollWidth` bằng 375, nút bấm ≥ 32px;
  - `GrammarSection` không thêm class mới.

**Never:**
- Không làm việc của story khác:
  - phần luyện / câu quiz T3–T4, thêm thì T3–T4 vào `tense-scope.ts` (37);
  - `signalWords`, khối "Chọn thì", bảng trợ động từ, glossary (39);
  - mini-t3, kho câu O.W.L., ôn trộn (40);
  - kiểm tra cuối Bài chính, Sổ lỗi trong buổi (41);
  - Bản đồ thì, độ nhớ thẻ theo thì (42);
  - have to / could / would like (45);
  - quá khứ tiếp diễn (46);
  - `requires` cho câu cũ (47).
- Không đổi thuật toán SRS (`review`, `buildSession`), không kéo sớm / sửa `due` của thẻ có sẵn, không xoá thẻ.
- Không sửa câu quiz, `practice`, `examples`, `rules` của Tense. Không sửa `stage-1.ts`, `function-words.ts`, `videos.json`, phụ đề.
- Không lưu chế độ che cột vào store hay localStorage.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Thẻ thì T1 | Đã bỏ qua Sân ga, đánh dấu xong `s1-t1-w2` | `ruleStudyWords` có `rule:present-simple-1` … `-4`, là thẻ mới đứng sau từ mới. Quota từ mới không đổi | N/A |
| Bài cũ đã xong | `s1-t2-w2` đã xong, `srs.cards` có 3 thẻ của story 33 | Phiên có thêm 5 thẻ mới (`rule:past-to-be-3`, `-4`, `rule:past-simple-2` … `-4`). 3 thẻ cũ giữ lịch | N/A |
| Bài chưa xong / bị xếp qua | `s1-t3-w1` chưa đánh dấu, hoặc bị Mũ Phân Loại xếp qua | Không có thẻ `rule:will-*` | N/A |
| Tới T2-W3, ngày 1 | Bỏ qua Sân ga, xong T1 + `s1-t2-w1`, `-w2` (bài hiện tại `s1-t2-w3`), chưa có thẻ động từ | Có 10 thẻ động từ mới, đúng thứ tự: be, have, do, go, get, make, see, know, take, give. Chúng đứng sau thẻ thì | N/A |
| Ngày 1, đã chấm hết | Cùng ngày, đã chấm cả 10 thẻ | Không mở nhóm mới. 10 thẻ đi theo lịch | N/A |
| Ngày 1, chấm dở | Chấm 4 thẻ rồi mở lại flashcard cùng ngày | 6 thẻ còn lại của nhóm 1 và 2 vẫn là thẻ mới, không thêm nhóm 3 | N/A |
| Ngày 2 → 6 | Mỗi ngày chấm hết thẻ mới | Ngày 2: come, become, say, pay, tell, sell (6). Ngày 3: 5 (nhóm -ought). Ngày 4: 9. Ngày 5: 10. Ngày 6: 10. Ngày 7: không còn thẻ động từ mới | N/A |
| Nghỉ vài ngày | Ngày 2 không mở app, ngày 4 mở | Mở đúng các nhóm của "ngày 2" (6 thẻ), không dồn | N/A |
| Ngày tồn ôn | > 40 thẻ đến hạn | Không có thẻ động từ mới. Thẻ động từ đến hạn vẫn ôn. `heavyReview` tính như cũ | N/A |
| Còn ở Sân ga | Dữ liệu cũ: chưa qua / chưa bỏ qua Sân ga, nhưng đã xong T1 + `s1-t2-w1`, `-w2` | Không có thẻ động từ (chưa "tới" s1-t2-w3) | N/A |
| Bị xếp qua T2-W3 | Mũ Phân Loại xếp bắt đầu ở `s1-t3-w1` | Không có thẻ động từ. Đánh dấu xong s1-t2-w3 thì bắt đầu mở | N/A |
| Bỏ đánh dấu lùi | Đã có thẻ động từ, bỏ đánh dấu `s1-t2-w2` (bài hiện tại lùi về s1-t2-w2) | Thẻ động từ không vào phiên, không đếm tồn ôn, vẫn nằm trong store. Đánh dấu lại thì lịch cũ chạy tiếp | N/A |
| Thẻ mồ côi | `srs.cards` có `rule:irregular-swimx-1`, `rule:will-9` | Không hiện, không đếm tồn ôn, vẫn nằm trong store | N/A |
| Mặt thẻ động từ | Lật `rule:irregular-go-1` | Trước: "go → ___ (V2 · V3)". Sau: "go → **went · gone** (V2 · V3)", dòng "đi · Nhóm: Rất thông dụng, mỗi từ một kiểu: học thuộc". Nhãn "Thẻ quy tắc · Động từ bất quy tắc", link "Xem lại bảng động từ" → `/roadmap/lesson/s1-t2-w3/grammar` | N/A |
| Mặt thẻ thì | Lật `rule:will-2` | Nhãn "Thẻ quy tắc · T3 tuần 1", link "Xem lại bài" (như story 33) | N/A |
| Che cột | Bảng ở s1-t2-w3, bấm "Che V3" | Mọi ô V3 thành nút "Xem" (`aria-label` "Hiện V3 của go"). Bấm một nút thì chỉ ô đó hiện. Nút nghe của dòng chưa hiện V3 đọc "go, went". Tắt "Che V3" rồi bật lại thì che lại hết | N/A |
| Che hai cột | Bật cả "Che V2" và "Che V3" | Chỉ còn V1 + nghĩa. Nút nghe đọc V1. Riêng `be`: V2 "was / were" che thành một ô | N/A |
| Ôn V3 ở T3-W3 | Mở đoạn Ngữ pháp `s1-t3-w3` (trang bài hoặc bước Bài chính) | Bảng "Ôn cột V3 trước khi học" (50 động từ, cột V3 che sẵn, "Che V3" đang bật) đứng trên thẻ hiện tại hoàn thành. s1-t2-w3 vẫn mở bảng đầy đủ, không che | N/A |
| App cũ | Máy cũ đồng bộ store có `rule:irregular-go-1`, `rule:will-1` | App cũ không lỗi, không hiện thẻ (chỉ duyệt thẻ nó biết) | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/types.ts:177-215`:
  - `Tense.ruleCards`, `TenseRuleCard`, `IrregularVerb`;
  - `GrammarContent` (`irregularVerbs?`). Thêm `irregularVerbsReview?` và kiểu nhóm.
- `src/data/lessons/irregular-verbs.ts` -- `IRREGULAR_VERBS` (50 mục, nhóm chỉ nằm trong comment). Tách thành nhóm có dữ liệu.
- `src/data/lessons/t1-grammar.ts` -- `PRESENT_SIMPLE` (:65), `PRESENT_SIMPLE_QUESTIONS` (:202): thêm `ruleCards`. `TO_BE` không đổi.
- `src/data/lessons/t2-t4-grammar.ts` -- thêm / nối `ruleCards`:
  - `PRESENT_CONTINUOUS` (:18), `PAST_TO_BE` (:157, thẻ 1–2 ở :193), `PAST_SIMPLE` (:310, thẻ 1 ở :341), `PAST_SIMPLE_IRREGULAR` (:452);
  - `WILL` (:588), `GOING_TO` (:623), `PRESENT_PERFECT` (:656), `PERFECT_VS_PAST` (:692);
  - `MODALS` (:730), `COMPARATIVES` (:761), `PASSIVE_PRESENT` (:792);
  - `GRAMMAR_T3_W3` (:843).
- `src/data/lessons/index.ts:40, 163-180` -- export `IRREGULAR_VERBS`, `allTenses`, `lessonRuleCards` (map dựng lúc nạp module). Thêm export nhóm, thẻ động từ, id bài s1-t2-w3.
- `src/lib/tense-scope.ts` -- `outOfScopeWords(tenseId, text)` cho 6 thì T1–T2. Chỉ test dùng, không sửa. Import `IRREGULAR_VERBS` từ `@/data/lessons/irregular-verbs`, nên export đó phải giữ.
- `src/lib/srs/srs.ts:50-92, 325-410`:
  - `RULE_CARD_PREFIX`, `RuleStudyWord`, `isRuleCardId`;
  - `buildSession`: thẻ quy tắc chưa có lịch vào hết, không giới hạn; trùng id thì lấy mục đầu.
  
  Chỉ thêm field `verbGroup?` vào kiểu, không đổi logic.
- `src/lib/flashcard-session.ts`:
  - `newPerDayFor` (:83), `reviewableDueCount` (:107, gọi `ruleStudyWords` để đếm tồn ôn), `newWordOptions` (:130);
  - `ruleCardId` (:166), `ruleStudyWords` (:178).
  
  Đã import `computeRoadmapProgress`, `readCompletedLessonIds`, `readStartLessonId`, `isInFoundation`, `allLessons`.
- `src/app/store-context.ts:393` -- `useNewWordOptions` gọi `newWordOptions(store, now, …)`. Không sửa.
- `src/components/flashcards/rule-source.ts` (+ `rule-source.test.ts`) -- nhãn / link thẻ quy tắc. Thêm nhánh thẻ động từ.
- `src/components/flashcards/FlashcardSession.tsx:280-331`:
  - `ruleParts` tách ở `___` đầu tiên;
  - `RuleFlashcard` hiện "Thẻ quy tắc · {label}".
  
  Không cần sửa, chỉ sửa doc comment nếu nhắc tới nguồn thẻ.
- `src/components/lesson/IrregularVerbTable.tsx` -- bảng hiện tại: `speakText`, `table-fixed`, nút nghe `ListenButton`.
- `src/components/lesson/LessonContentParts.tsx:216-241` -- `GrammarSection` vẽ thì rồi `IrregularVerbTable`. Thêm bảng ôn V3 trước các thì.
- `src/lib/placement/gaps.ts:46` -- thẻ `rule:` không tính là từ đã học. Thẻ động từ tự đúng.
- Test cần cập nhật:
  - `src/data/lessons/lessons.test.ts:338-352` (bảng 50 động từ);
  - `src/data/lessons/lessons.test.ts:495-541` (thẻ thì của story 33: `lessonRuleCards('s1-t2-w1')` đang chốt `[]`; test chữ của past-to-be / past-simple đã đọc cả `ruleCards`);
  - `src/lib/flashcard-session.test.ts:509-599` (describe story 33: `W2_RULES` 3 thẻ, `doneW2` nay sẽ có thẻ T1 / W1 và thẻ động từ). Sửa cho đúng dữ liệu mới, giữ ý từng test;
  - các test đếm `newCount` / `flashcardSummary` có bài T1 đã xong.
- Vitest env `node`, chỉ `src/**/*.test.ts` (test component phải qua hàm thuần trong file `.ts`). `TZ=Asia/Ho_Chi_Minh`. Helper test: `day(d, h)`, `completeLessons`, `skipFoundation`, `setLessonCompleted`, `recordAttempt`, `withDueCards`, `gradeCard`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/lessons/types.ts`:
  - thêm `IrregularVerbGroup = { id: string; title: string; verbs: readonly IrregularVerb[] }`;
  - thêm `GrammarContent.irregularVerbsReview?: readonly IrregularVerb[]`, doc: "bảng ôn cột V3 đứng trước các thì, che sẵn V3 (story 38, s1-t3-w3)";
  - doc `Tense.ruleCards`: mỗi thì 4–5 thẻ (story 38).
- [x] `src/data/lessons/irregular-verbs.ts`:
  - `IRREGULAR_VERB_GROUPS` gồm 15 nhóm đúng bảng Design Notes (id, tên, động từ, thứ tự);
  - `IRREGULAR_VERBS = IRREGULAR_VERB_GROUPS.flatMap((g) => g.verbs)`;
  - `IRREGULAR_VERB_CARDS`: mỗi động từ một mục `{ id: 'irregular-<v1>-rule-1', groupId, groupTitle, cloze: '<v1> → ___ (V2 · V3)', answer: '<v2> · <v3>', vi: '<vi> · Nhóm: <title>' }`, theo thứ tự nhóm.
- [x] `src/data/lessons/t1-grammar.ts`, `src/data/lessons/t2-t4-grammar.ts`:
  - thêm / nối `ruleCards` đúng bảng Design Notes; thẻ cũ giữ nguyên chữ;
  - `GRAMMAR_T3_W3 = { tenses: [PRESENT_PERFECT], irregularVerbsReview: IRREGULAR_VERBS }`.
- [x] `src/data/lessons/index.ts` -- export `IRREGULAR_VERB_GROUPS`, `IRREGULAR_VERB_CARDS`, `IRREGULAR_VERBS_LESSON_ID = 's1-t2-w3'` và kiểu mới.
- [x] `src/lib/srs/srs.ts` -- `RuleStudyWord.verbGroup?: string` (chỉ thẻ động từ có, đi cùng `lessonId`). Sửa doc của kiểu và `RULE_CARD_PREFIX`: thêm `rule:irregular-<v1>-1` (story 38).
- [x] `src/lib/flashcard-session.ts`:
  - `IRREGULAR_VERBS_PER_DAY = 10`;
  - `irregularVerbsReached(store)`: true khi `s1-t2-w3` đã đánh dấu xong, hoặc khi không còn ở Sân ga và `computeRoadmapProgress(...).nextLessonId === 's1-t2-w3'`;
  - `irregularVerbStudyWords(store, opening?: { now: Date; heavyReview: boolean })`:
    - chưa tới bài → `[]`;
    - không có `opening` → chỉ thẻ đã có mục hợp lệ trong `srs.cards`;
    - có `opening` và không tồn ôn → thêm thẻ chưa có lịch theo luật mở nhóm (thuật toán ở Design Notes);
    - trả theo thứ tự `IRREGULAR_VERB_CARDS`. Mỗi thẻ `{ id: ruleCardId(c), rule: true, word: answer, lessonId: 's1-t2-w3', verbGroup: groupTitle, cloze, answer, vi }`;
  - `ruleStudyWords(store, ruleCardsOf, opening?)` nối `irregularVerbStudyWords(store, opening)` sau thẻ thì;
  - `newWordOptions` truyền `{ now, heavyReview }`. `reviewableDueCount` giữ cách gọi không có `opening` (chỉ thẻ đã có, không vòng lặp với `heavyReview`);
  - sửa doc comment.
- [x] `src/components/flashcards/rule-source.ts` -- thẻ có `verbGroup` thì nhãn "Động từ bất quy tắc", link `{ to: sectionHref('s1-t2-w3', 'grammar'), text: 'Xem lại bảng động từ' }`. Nhánh thẻ thì và thẻ viên gạch giữ nguyên.
- [x] `src/components/lesson/verb-cover.ts` (mới) -- hàm thuần:
  - `VerbCover = { v2: boolean; v3: boolean }`;
  - `cellKey(v1, col)`;
  - `isCellHidden(cover, revealed, v1, col)`;
  - `speakText(verb, cover, revealed)`: V1 rồi các cột đang hiện, "a / b" đọc thành "a, b". Chuyển `speakText` cũ từ `IrregularVerbTable.tsx` sang đây; không che gì thì kết quả y như cũ.
- [x] `src/components/lesson/IrregularVerbTable.tsx`:
  - prop `mode?: 'learn' | 'review-v3'` (mặc định `learn`);
  - hàng nút "Che V2" / "Che V3" (`aria-pressed`) đặt trên bảng;
  - ô bị che là nút "Xem", `aria-label` "Hiện V2 của {v1}" / "Hiện V3 của {v1}"; bấm thì focus chuyển sang chữ vừa hiện. Bật / tắt che một cột thì xoá các ô đã hiện của cột đó (cột kia giữ). State qua hàm thuần `initialCover(mode)`, `toggleCover`, `revealCell` trong `verb-cover.ts`;
  - `review-v3`: tiêu đề, ghi chú theo Design Notes, mở sẵn "Che V3";
  - `learn`: ghi chú mới theo Design Notes;
  - giữ `table-fixed`, cột V2 `text-primary`.
- [x] `src/components/lesson/LessonContentParts.tsx` -- `GrammarSection`: có `irregularVerbsReview` thì vẽ `<IrregularVerbTable verbs={…} mode="review-v3" />` trước các thì. Không thêm class.
- [x] `src/data/lessons/lessons.test.ts` -- sửa test story 33 (`lessonRuleCards('s1-t2-w1')` nay có 5 thẻ; bài không có thì, và `s1-t1-w1`, trả `[]`). Thêm describe "thẻ ôn thì và động từ (story 38)":
  - đúng 13 Tense có thẻ (mọi Tense trừ `to-be`), số thẻ và đáp án theo hằng `CARDS` chép từ bảng Design Notes;
  - 3 thẻ cũ giữ đúng chữ;
  - gợi ý ngoặc đứng ngay sau `___`;
  - thì dạy đủ ba dạng (`present-simple-questions`, `present-continuous`, `past-to-be`, `past-simple`, `past-simple-irregular`, `will`, `going-to`, `present-perfect`) có ≥ 1 thẻ phủ định (`n't` / `not` trong câu đã điền) và ≥ 1 thẻ câu hỏi (có `?`);
  - câu đã điền của thẻ T1–T2 qua `outOfScopeWords`; thẻ T3–T4 qua bảng "Dấu hiệu theo bài";
  - câu đã điền không trùng `examples[].en`, `mistakes[].right`, `answer` câu quiz cùng bài (so sau khi bỏ ngoặc gợi ý, chuẩn hoá bằng `normalizeTyped`);
  - nhóm động từ: 15 nhóm, gộp lại `toEqual` mảng 50 động từ của baseline (chép id V1 theo thứ tự vào test), cỡ nhóm `[7,3,2,2,2,5,6,3,2,4,1,1,2,8,2]`;
  - `IRREGULAR_VERB_CARDS`: 50 thẻ, id không trùng nhau và không trùng thẻ thì / viên gạch, golden `go`, `be`, `read` đúng Design Notes;
  - `getLessonContent('s1-t3-w3').grammar.irregularVerbsReview` là `IRREGULAR_VERBS`; s1-t2-w3 không có `irregularVerbsReview`.
- [x] `src/lib/flashcard-session.test.ts`:
  - sửa describe story 33 cho dữ liệu mới, giữ ý (thứ tự viên → thì, bỏ đánh dấu, bị xếp qua, mồ côi, quota không đổi);
  - thêm describe "thẻ động từ bất quy tắc (story 38)", mỗi hàng matrix có thẻ động từ là một ca: ngày 1, chấm hết, chấm dở, ngày 2 → 7 (chấm hết mỗi ngày bằng `gradeCard`), nghỉ, tồn ôn, còn ở Sân ga, bị xếp qua, bỏ đánh dấu lùi, mồ côi;
  - thêm ca "Thẻ thì T1", "Bài cũ đã xong", "Bài chưa xong / bị xếp qua" (`rule:will-*`);
  - mọi ca kiểm `newPerDayFor` không đổi so với khi không có thẻ, và `newCount` cộng đúng số thẻ quy tắc mới.
- [x] `src/components/flashcards/rule-source.test.ts` -- ca thẻ động từ (nhãn, link). Thẻ thì T3 có nhãn "T3 tuần 1".
- [x] `src/components/lesson/verb-cover.test.ts` (mới) -- các hàng "Che cột", "Che hai cột":
  - `isCellHidden` theo cover / revealed;
  - `speakText`: không che thì y như cũ ("be, was, were, been"), che V3 → "go, went", hiện lại ô V3 → "go, went, gone", che cả hai → "go".
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- mục Từ vựng, sau câu story 33 về thẻ quy tắc, thêm: "Mọi thì Chặng 1 (trừ to be ôn ở s1-t1-w1) góp 4–5 thẻ quy tắc. 50 động từ bất quy tắc thành thẻ V1 → V2 · V3: mở từ khi tới bài s1-t2-w3 (bài hiện tại sau Sân ga hoặc đã xong; bài bị xếp qua thì không), theo nhóm âm, tối đa 10 động từ mỗi ngày (trọn nhóm; nhóm đầu trong ngày luôn mở), ngày tồn ôn không mở; không tính quota từ mới. Bảng động từ có chế độ che cột V2 / V3; s1-t3-w3 mở đầu bằng bảng ôn cột V3 che sẵn (story 38)."
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- dòng Flashcard SRS ghi thêm thẻ động từ `rule:irregular-<v1>-1` (từ `irregular-<v1>-rule-1`, có `lessonId` + `verbGroup`, mở theo nhóm, `IRREGULAR_VERBS_PER_DAY`; story 38).

**Acceptance Criteria:**
- Given Huy ở 375px trên `/roadmap/lesson/s1-t2-w3/grammar`, when bật "Che V3", bấm "Xem" ở vài dòng rồi bật thêm "Che V2", then bảng không tràn ngang (`scrollWidth` = 375), ô che và nút đủ lớn để chạm, và store (`srs`, `progress`, `mistakes`) không đổi.
- Given Huy vừa xong s1-t2-w2 và mở flashcard hôm sau, when đi hết phiên, then gặp 8 thẻ quy tắc của bài s1-t2-w2 (nếu chưa có) rồi 10 thẻ động từ "Thẻ quy tắc · Động từ bất quy tắc". Lật thẻ thấy "went · gone" và tên nhóm, bấm "Xem lại bảng động từ" thì tới đúng đoạn Ngữ pháp s1-t2-w3.
- Given Huy mở `/roadmap/lesson/s1-t3-w3/grammar` (hoặc bước Bài chính của buổi có bài này), when xem đầu đoạn Ngữ pháp, then thấy bảng "Ôn cột V3 trước khi học" che sẵn V3, đứng trên thẻ "Hiện tại hoàn thành (1)".
- Given `npm run layout:guard`, when chạy trên code story này, then chỉ `IrregularVerbTable.tsx` bị báo thêm class. `npm run layout:check` đạt, ảnh 375px các route trong `ROUTES` khớp baseline.

## Implementation Notes

- Dữ liệu: 52 thẻ thì mới (tổng 55, 13 Tense, `to-be` không có) đúng bảng Design Notes; 3 thẻ story 33 giữ nguyên chữ. Câu `vi` bảng để trống đã tự viết theo quy tắc của dòng công thức. Một chỉnh chữ do va test: `going-to-rule-3` đổi "What ___ you going to do this weekend?" thành "What ___ you going to cook tonight?" vì câu cũ trùng câu quiz `t3w2.grammar(3)` của s1-t3-w2 (`src/data/questions/t2-t4.ts:332`); đáp án `are` và điểm phủ (câu hỏi Wh + am / is / are + going to) giữ nguyên.
- `IRREGULAR_VERB_GROUPS` (15 nhóm) là nguồn; `IRREGULAR_VERBS` = gộp nhóm (test so với 50 V1 baseline). Thêm kiểu `IrregularVerbCard = TenseRuleCard & { groupId, groupTitle }` cho `IRREGULAR_VERB_CARDS`.
- `irregularVerbStudyWords` làm đúng thuật toán "Mở nhóm"; điều kiện viết ngược (`!opened && today + taken > 0 && taken + fresh > budget → break`), tương đương. `today` chỉ đếm thẻ động từ hợp lệ có `introducedAt` cùng ngày giờ máy. `reviewableDueCount` gọi `ruleStudyWords` không có `opening`.
- Mục sai dạng: theo spec, coi như chưa có mục (được chọn là thẻ mới, không làm nhóm "đã mở"). Lưu ý: `buildSession` (không sửa) bỏ qua thẻ quy tắc có key trong `srs.cards` dù mục sai dạng, nên động từ đó không hiện cho tới khi mục được sửa; trường hợp này chỉ xảy ra khi store hỏng. Test chốt ở mức `irregularVerbStudyWords`.
- Bảng: logic che / nghe ở `verb-cover.ts` (thêm `listenLabel` để nhãn nút nghe không lộ ô đang che, `NO_COVER`). Bảng dùng `Button` size `sm` (h-8 = 32px).
- Test: describe story 33 trong `flashcard-session.test.ts` sửa cho dữ liệu mới (W2 nay 8 thẻ; `doneW2` có thẻ T1 / W1 và 10 thẻ động từ; bị xếp ở s1-t2-w3 nay chỉ có thẻ động từ vì s1-t2-w3 là bài hiện tại), thêm 3 ca thẻ thì và describe "thẻ động từ bất quy tắc (story 38)" (11 ca, gồm ngày 2 → 7 chấm hết mỗi ngày: 6, 5, 9, 10, 10, 0). Thêm `verb-cover.test.ts`, ca thẻ động từ / T3 trong `rule-source.test.ts`.
- Kiểm tra: `npm run lint && npm test && npm run build` đạt (80 file, 1913 test). `layout:guard`: chỉ báo `IrregularVerbTable.tsx` (+ `flex-wrap`). `layout:check`: 12 route đạt ở 5 bề rộng, ảnh 375px trùng baseline; riêng mục "thử phím tắt @ 1280px: F01 gõ "chào 1" + Enter" báo LỖI, nhưng lỗi này có sẵn ở baseline `e423bc4` (chạy trong worktree sạch cũng báo y hệt), không liên quan story này.
- Manual (Chrome headless qua CDP, dev server, store đã bỏ qua Sân ga + xong tới s1-t2-w2): `/roadmap/lesson/s1-t2-w3/grammar` 375px: "Che V3" → 50 nút "Xem", nút nghe go "Nghe go, went"; bấm "Hiện V3 của go" → "Nghe go, went, gone"; thêm "Che V2" → 100 ô che (be một ô V2), nghe "Nghe be", nút 32px, không ô nào tràn, `scrollWidth` 375, store không đổi. `/roadmap/lesson/s1-t3-w3/grammar`: bảng "Ôn cột V3 trước khi học" đứng trước "Hiện tại hoàn thành (1)", "Che V3" bật sẵn. `/practice/flashcards`: "41 từ mới hôm nay" = 10 từ + 21 thẻ thì + 10 thẻ động từ. Chưa bấm qua tới thẻ động từ trên UI, chưa kiểm desktop ≥ 1024px bằng tay (layout:check đo 1024–1920 đạt).

- Review (2026-11-12): sửa 22 câu thẻ thì và `vi` của 9 thẻ theo Spec Change Log; test "không trùng" nay bắt cả gần trùng và mọi nguồn chữ của bài; thêm dòng bị động vào test dấu hiệu; state bảng che cột qua `initialCover` / `toggleCover` / `revealCell` (có test), bấm "Xem" thì focus sang chữ vừa hiện. `npm run lint && npm test && npm run build` đạt (80 file, 1915 test); `layout:guard` chỉ báo `IrregularVerbTable.tsx` (+ `flex-wrap`).

## Spec Change Log

- **2026-11-12, review story 38 (blind, edge, verification-gap, content).**
  - **Kích hoạt:** nhiều thẻ trong bảng Design Notes có hơn một đáp án đúng khi đứng trong bộ SRS trộn (thiếu gợi ý "(not)", thiếu mốc quá khứ), câu `vi` lỏng hơn bài (gấp đôi phụ âm, "So sánh nhất luôn có the", "When … dùng quá khứ đơn", "chỉ dùng sau have / has"), `modals-rule-3` dùng bị động ("It isn't allowed") trước khi dạy, và nhiều câu gần trùng câu quiz / phần luyện / công thức (test cũ chỉ bắt trùng hệt và bỏ sót phần luyện, công thức, quy tắc). Tên nhóm `ay-aid` dễ làm đọc said /seɪd/; nhóm `long-short` sai với hear – heard.
  - **Đã sửa (ngoài khối frozen):**
    - bảng "Thẻ của thì": viết lại câu của 22 thẻ (vẫn đúng id, điểm phủ; 2 đáp án đổi theo gợi ý mới: `present-simple-questions-rule-1` `doesn't` → `doesn't drink`, `going-to-rule-4` `is going to rain` → `is going to fall`), sửa `vi` của 9 thẻ; dòng `going-to-rule-3` ghi đúng câu đang dùng ("…cook tonight?");
    - bảng "Dấu hiệu theo bài": thêm dòng bị động hiện tại (`am / is / are (not) + V3 / -ed` → s1-t4-w3);
    - tên nhóm `ay-aid`, `long-short`; ghi chú bảng `review-v3` ("bấm", thêm câu thẻ ôn mở khi T2-W3 đã đánh dấu xong);
    - Tasks bảng che cột: bật / tắt một cột chỉ xoá ô đã hiện của cột đó; state qua hàm thuần `initialCover`, `toggleCover`, `revealCell`; focus chuyển sang chữ vừa hiện.
  - **Trạng thái xấu tránh được:** người học tự chấm sai một đáp án đúng; thẻ dạy quy tắc sai so với bài; thẻ đo trí nhớ câu mẫu; dùng bị động trước T4-W3; bảng ôn V3 ra mắt với đáp án lộ mà test không bắt.
  - **KEEP:** thuật toán mở nhóm động từ, thứ tự thẻ (viên → thì → động từ), id mọi thẻ, 3 thẻ story 33 giữ nguyên chữ, 15 nhóm và cỡ nhóm, `IRREGULAR_VERBS` giữ nguyên chữ, bảng không lưu gì vào store.
  - Test "không trùng" nay so cả công thức, quy tắc, hội thoại, phần luyện (prompt, đáp án, `accept`) và câu quiz cùng bài, bỏ gợi ý ngoặc và câu trả lời ngắn sau "—", bắt cả câu (≥ 5 từ) chỉ khác một từ; xét cả câu đã điền và khung câu.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | `modals-rule-3` dùng bị động "It isn't allowed" (dạy ở s1-t4-w3) ở bài s1-t4-w1; bảng dấu hiệu không có dòng bị động | medium | `PASSIVE_PRESENT` (s1-t4-w3) có "Smoking isn't allowed."; MODALS ở s1-t4-w1; SIGNALS không có dòng bị động | patch: câu mới "You ___ park your car here. It's the rule.", thêm dòng bị động vào bảng và test |
| 2 | blind | Nhiều thẻ gần trùng câu quiz / phần luyện / công thức (will-3, psq-4, modals-1, past-simple-4, ps-1, ps-4, passive-2, pp-1, psi-1) | medium | Test mới bắt được: will-3 trùng hệt `t3w1.grammar(4)`, psq-4 trùng hệt đề luyện, ppvp-4 "When did you arrive in Hanoi" trùng hệt; còn lại khác một từ | patch: viết lại câu, giữ đáp án và điểm phủ |
| 3 | blind | Test "không trùng" bỏ sót phần luyện, công thức, quy tắc, hội thoại; chỉ bắt trùng hệt | medium | Test cũ chỉ gom `examples`, `mistakes.right`, quiz; `t1-grammar.ts:322` lọt | patch: gom thêm `practiceEnglishTexts`, `formulas`, `rules`, `dialogues`; bỏ ngoặc, câu trả lời ngắn; gần trùng = câu ≥ 5 từ khác một từ |
| 4 | blind | `present-simple-questions-rule-1` không có gợi ý phủ định | medium | "My father ___ drink coffee." nhận does / will / can; các thẻ phủ định khác đều có "(not / V)" | patch: "(not / drink)" → `doesn't drink`, sửa `CARDS` và Design Notes |
| 5 | blind | `past-simple-irregular-rule-4` nói gone "chỉ dùng sau have / has" | low | Thẻ bị động T4-W3 dùng V3 sau are / isn't | patch: bỏ "chỉ", ghi "(hiện tại hoàn thành, học ở T3)" |
| 6 | blind | `going-to-rule-1` nhận cả "are visiting" | low | Hiện tại tiếp diễn chỉ tương lai không dạy trong Chặng 1; ngữ cảnh "bought the tickets" chỉ kế hoạch, đúng điểm bài dạy | reject |
| 7 | blind | `vi` gấp đôi phụ âm (present-continuous-4, past-simple-2) bỏ "tận cùng" và ngoại lệ w, x, y | medium | Bài `t2-t4-grammar.ts:30`, `:367` nêu đủ; thẻ ôn nhiều tháng không mở bài | patch: chép đúng quy tắc của bài |
| 8 | blind | Story không ghi lại chỉnh chữ `going-to-rule-3` ở Design Notes / Change Log | low | Đúng là Design Notes còn câu cũ; cách sửa là sửa spec | reject (theo luật: sửa spec); Design Notes vẫn được cập nhật trong Change Log của review |
| 9 | blind + edge | Không giãn nhịp thẻ thì tồn đọng: người đã xong nhiều bài nhận tới 52 thẻ thì mới một lúc, kể cả ngày tồn ôn | medium | `buildSession` cho thẻ quy tắc chưa có lịch vào hết (story 33); intent giữ luật này và chỉ chặn tồn ôn cho thẻ động từ | defer: cần quyết định nhịp thẻ quy tắc chung (story sau) |
| 10 | blind | Người bị Mũ Phân Loại xếp qua s1-t2-w3 không bao giờ có thẻ động từ và không được báo | low | Hành vi đúng intent (hàng "Bị xếp qua T2-W3"); thiếu lời nhắc trên bảng ôn s1-t3-w3 | patch: ghi chú bảng ôn thêm "Thẻ ôn V2 · V3 trong flashcard mở khi bài T2-W3 đã đánh dấu xong." |
| 11 | blind + vgap | State che cột (`review-v3` che sẵn V3, bật lại thì che lại) nằm trong component, không test; bật cột này xoá cả ô đã hiện của cột kia | medium | vgap đã kiểm: `verb-cover.test.ts` không chạy `useState`/`toggle`, `layout:check` không có route này; `toggle` gọi `setRevealed(new Set())` | patch: `initialCover`, `toggleCover` (chỉ xoá ô của cột đổi), `revealCell` trong `verb-cover.ts` + 2 test |
| 12 | blind | Bấm "Xem" thì nút biến mất, focus rơi về `<body>` | medium | Nút được thay bằng chữ thường, không có focus đích | patch: chữ vừa hiện là `<span tabIndex={-1}>` nhận focus |
| 13 | blind | Thẻ động từ không có nút nghe | low | `RuleFlashcard` không đọc thẻ quy tắc từ story 24/33; intent cấm đổi class thẻ flashcard | defer |
| 14 | blind | Bảng ôn V3 dài 50 dòng, đứng trước bài ở s1-t3-w3 | low | Intent frozen đặt đúng chỗ này, đủ 50 động từ | reject |
| 15 | edge | Mục `srs.cards` sai dạng dưới id động từ: tính vào ngân sách ngày nhưng `buildSession` bỏ qua | low | Chỉ xảy ra khi store hỏng; Implementation Notes đã ghi | reject |
| 16 | edge | Có thẻ động từ, quay lại Sân ga khi s1-t2-w3 là bài hiện tại chưa xong → thẻ biến mất | low | `resumeFoundation` có thật, nhưng intent định nghĩa "tới" = đã xong hoặc bài hiện tại khi đã ra khỏi Sân ga; mục store giữ nguyên, ra khỏi Sân ga thì chạy tiếp | reject |
| 17 | vgap (khác) | Ca "ngày 2 → 7" có `expect(...).not.toBe('')` không bao giờ sai, không kiểm `newCount` / `newPerDayFor` | low | `flashcardSummary` không bao giờ trả `''` | patch: kiểm `newPerDayFor` bằng nhau và `newCount = plain + số thẻ quy tắc mới` mỗi ngày |
| 18 | vgap (khác) | Lệch giữa `irregularVerbStudyWords` và hàng đợi khi mục sai dạng chưa được test ở `fullSession` | low | Cùng gốc #15, chỉ khi store hỏng | reject |
| 19 | content | `past-simple-rule-2` không có mốc quá khứ, "stops" cũng đúng | medium | "The bus ___ (stop) next to the school." | patch: "The taxi ___ (stop) in front of my house last night." |
| 20 | content | `modals-rule-3` nhận cả can't / shouldn't; dùng bị động | medium | Cùng thẻ #1 | patch (gộp #1): `vi` nêu can't cũng đúng, shouldn't nhẹ hơn |
| 21 | content | `present-perfect-vs-past-rule-4` nhận will / do; `vi` "Câu hỏi When … dùng quá khứ đơn" sai khi tổng quát | medium | "When ___ you arrive in Hanoi?" không có mốc; câu bài (`rules`, `mistakes`) cũng nói quá | patch thẻ ("— Two years ago.", `vi` "Hỏi When về việc đã xảy ra…"); phần quy tắc của bài defer (story cấm sửa `rules`) |
| 22 | content | `comparatives-rule-3` "So sánh nhất luôn có the" sai (my best friend) | medium | Mâu thuẫn với thẻ khác trong cùng bộ; `COMPARATIVES` rules[2] và mistake cũng nói "luôn" | patch `vi` thẻ; phần quy tắc của bài defer |
| 23 | content | Nhóm `ay-aid` dễ làm đọc said /seɪd/ | medium | Tên nhóm hiện trên mọi thẻ; said đọc /sed/ | patch: tên nhóm "-ay → -aid: pay – paid (riêng said đọc /sed/)" |
| 24 | content | hear – heard không hợp tên nhóm "Nguyên âm ngắn lại, giữ phụ âm cuối" | low | heard thêm -d, nguyên âm thành /ɝ/ | patch: tên nhóm "Đổi nguyên âm, V2 = V3: meet – met, hear – heard /hɝːd/" |
| 25 | content | `present-simple-questions-rule-1` thiếu "(not)" | medium | Trùng #4 | patch (gộp #4) |
| 26 | content | `will-rule-4` nhận didn't / want to / can't | medium | "I'm very tired. I ___ go to the party." không gợi ý | patch: "I ___ (not) go to the party tonight." |
| 27 | content | `going-to-rule-2` "won't buy" cũng đúng | medium | Không có ngữ cảnh kế hoạch | patch: thêm "He decided last month.", `vi` "Phủ định kế hoạch đã định" |
| 28 | content | `going-to-rule-1` "will visit" cũng đúng | low | Ngữ cảnh vé đã mua chỉ kế hoạch; rủi ro thấp | reject |
| 29 | content | `present-perfect-rule-5` không gợi ý, moved / flown … đều hợp | medium | "They have ___ to Da Nang." | patch: gợi ý "(go / be)" |
| 30 | content | `past-to-be-rule-4` "this morning" cho phép are | low | Còn buổi sáng thì are đúng | patch: "yesterday morning" |
| 31 | content | `modals-rule-4` nhận must / can; "more" thuộc bài so sánh | low | "You ___ eat more vegetables." | patch: "You look tired. You ___ take a break.", `vi` must mạnh hơn nhiều |
| 32 | content | `vi` gấp đôi phụ âm thiếu "chữ" và ngoại lệ w, x, y | medium | Trùng #7 | patch (gộp #7) |
| 33 | content | `present-simple-questions-rule-3`, `present-continuous-rule-5` nhận did / knew khi trộn với thì quá khứ | low | Không có mốc hiện tại | patch: thêm "now" |
| 34 | content | Gần trùng câu ví dụ / công thức (will-2, will-3, going-to-4, going-to-1, pp-1, ppvp-5, passive-3) | low | Trùng nhóm #2 | patch (gộp #2) |
| 35 | content | `vi` của `past-to-be-rule-4` bỏ "hoặc không đếm được" | low | Công thức bài có | patch |
| 36 | content | `past-simple-irregular-rule-4` "chỉ" nói quá | low | Trùng #5 | patch (gộp #5) |
| 37 | content | Nhóm `n-en` và `vowel-en` khó phân biệt | low | Cách chia có sẵn từ comment baseline; tác hại không đáng kể | reject |
| 38 | content | lose – lost không khớp hẳn nhóm "Nguyên âm dài thành ngắn + -t" | low | Cách chia có sẵn từ baseline; mẹo nhớ gần đúng | reject |
| 39 | content | Ghi chú "xếp theo nhóm" nhưng bảng không có tiêu đề nhóm | low | Bảng đúng là xếp theo nhóm; thêm tiêu đề nhóm phải thêm dòng / class | reject |
| 40 | content | Ghi chú bảng ôn nói "chạm", trên máy tính là "bấm" | low | `IrregularVerbTable.tsx` ghi chú `review-v3` | patch: "bấm" |

## Design Notes

**Thẻ của thì.** Viết `cloze → answer · vi`. Thẻ đánh * là thẻ đã có, giữ nguyên chữ.

- `present-simple` (s1-t1-w2, 4 thẻ):
  1. "My mother ___ (work) on Saturdays." → `works` · he / she / it và danh từ số ít (my mother, Anna) thì động từ thêm -s.
  2. "He ___ (wash) his car every week." → `washes` · Tận cùng -s, -ss, -sh, -ch, -x, -z, -o thì thêm -es (washes, watches, goes).
  3. "Minh ___ (study) English at night." → `studies` · Phụ âm + y đổi thành -ies (study → studies). Nguyên âm + y chỉ thêm -s (play → plays).
  4. "Our teacher ___ (have) a red car." → `has` · have đi với he / she / it thành has (không phải haves).
- `present-simple-questions` (s1-t1-w3, 4 thẻ):
  1. "My father ___ (not / drink) coffee." → `doesn't drink` · Phủ định: he / she / it + doesn't + V nguyên mẫu (không phải not drink, không phải doesn't drinks).
  2. "___ you like tea? — Yes, I do." → `Do`
  3. "Where ___ your sister work now?" → `does` · Wh + do / does + chủ ngữ + V nguyên mẫu.
  4. "___ your brother tired today? — No, he isn't." → `Is` · Với am / is / are thì không mượn do / does (không phải Does she be busy?).
- `present-continuous` (s1-t2-w1, 5 thẻ):
  1. "Look! The boys ___ (play) football outside." → `are playing` · am / is / are + V-ing. Thiếu một trong hai phần là sai.
  2. "She ___ (not / sleep) now. She is reading." → `isn't sleeping`
  3. "___ you working right now? — Yes, I am." → `Are`
  4. "We are ___ (sit) near the window." → `sitting` · Từ một âm tiết tận cùng 1 chữ nguyên âm + 1 chữ phụ âm thì gấp đôi phụ âm cuối (sit → sitting, run → running). Không gấp đôi w, x, y (play → playing, fix → fixing).
  5. "I ___ (know) the answer now." → `know` · Động từ trạng thái (know, like, want, need) không dùng tiếp diễn.
- `past-to-be` (s1-t2-w2, 4 thẻ):
  1. \* `were`.
  2. \* `Were`.
  3. "We ___ busy last night. We were free." → `weren't` · Phủ định: wasn't / weren't, không mượn did (không phải We didn't be busy).
  4. "There ___ three students in the room yesterday morning." → `were` · there was + danh từ số ít hoặc không đếm được, there were + danh từ số nhiều.
- `past-simple` (s1-t2-w2, 4 thẻ):
  1. \* `did`.
  2. "The taxi ___ (stop) in front of my house last night." → `stopped` · Từ một âm tiết tận cùng 1 chữ nguyên âm + 1 chữ phụ âm thì gấp đôi phụ âm cuối (stop → stopped). Không gấp đôi w, x, y (play → played, fix → fixed); visit → visited cũng không.
  3. "She ___ (not / call) me last night." → `didn't call` · didn't + V nguyên mẫu (không phải didn't called).
  4. "___ you clean your room last weekend? — Yes, I did." → `Did`
- `past-simple-irregular` (s1-t2-w3, 4 thẻ):
  1. "My mother ___ (buy) fish at the market this morning." → `bought` · Bất quy tắc dùng V2 (buy → bought, không phải buyed).
  2. "He didn't ___ (go) to work yesterday." → `go` · Sau didn't quay về V1 (không phải didn't went).
  3. "What did you ___ (eat) for lunch?" → `eat` · Did / Wh + did + chủ ngữ + V1.
  4. "Yesterday we ___ (go) to the beach." → `went` · went là V2 (quá khứ đơn). gone là V3, dùng sau have / has (hiện tại hoàn thành, học ở T3).
- `will` (s1-t3-w1, 4 thẻ):
  1. "It's late. I ___ (call) a taxi." → `will call` · Quyết định ngay lúc nói: will + V nguyên mẫu, mọi chủ ngữ (she will go, không phải will goes).
  2. "We ___ (not / be) at home tomorrow." → `won't be`
  3. "___ you call me tomorrow? — Yes, I will." → `Will`
  4. "I'm very tired. I ___ (not) go to the party tonight." → `won't` · won't /woʊnt/ = sẽ không. want /wɑːnt/ to = muốn. I won't go ≠ I want to go.
- `going-to` (s1-t3-w2, 4 thẻ):
  1. "We ___ (visit) Sa Pa in July. We bought the tickets yesterday." → `are going to visit` · Kế hoạch đã định: am / is / are + going to + V.
  2. "He ___ (not / buy) a car this year. He decided last month." → `isn't going to buy`
  3. "What ___ you going to cook tonight?" → `are`
  4. "Look at that boy on the wall! He ___ (fall)." → `is going to fall` · Thấy dấu hiệu ngay trước mắt thì dùng going to. Quyết định vừa nghĩ ra thì dùng will.
- `present-perfect` (s1-t3-w3, 5 thẻ):
  1. "We ___ (visit) Hoi An twice." → `have visited` · have / has + V3. I / you / we / they dùng have.
  2. "My son ___ (not / finish) his lunch yet." → `hasn't finished` · Phủ định: haven't / hasn't + V3, yet ở cuối câu.
  3. "___ you ever sung karaoke?" → `Have`
  4. "We have ___ (see) this show before." → `seen` · Sau have / has dùng V3 (seen), không dùng V2 (saw).
  5. "My parents aren't at home. They have ___ (go / be) to Da Nang." → `gone` · gone to = đã đi và giờ đang ở đó. been to = đã từng tới rồi về.
- `present-perfect-vs-past` (s1-t3-w4, 5 thẻ):
  1. "I have worked here ___ 2022." → `since` · since + mốc bắt đầu.
  2. "She has lived in Hanoi ___ ten years." → `for` · for + khoảng thời gian.
  3. "I ___ (meet) him last year." → `met` · Có mốc đã xong (last year, ago, yesterday) thì dùng quá khứ đơn, không dùng have met.
  4. "When ___ you buy your car? — Two years ago." → `did` · Hỏi When về việc đã xảy ra thì dùng quá khứ đơn (không phải When have you bought…?).
  5. "How long ___ your parents lived in Hanoi?" → `have` · Hỏi kéo dài tới giờ: How long have / has + S + V3?
- `modals` (s1-t4-w1, 4 thẻ):
  1. "My grandmother can ___ (speak) French." → `speak` · Sau can / should / must là V nguyên mẫu, không to, không -s.
  2. "___ I open the window? — Yes, of course." → `Can` · Hỏi xin phép: Can I …? Đảo can lên đầu, không mượn do.
  3. "You ___ park your car here. It's the rule." → `mustn't` · mustn't = cấm làm (luật, biển báo). can't (không được phép) cũng đúng; shouldn't chỉ là lời khuyên, nhẹ hơn.
  4. "You look tired. You ___ take a break." → `should` · should = lời khuyên (nên). must = bắt buộc, mạnh hơn nhiều.
- `comparatives` (s1-t4-w3, 4 thẻ):
  1. "My room is ___ (big) than yours." → `bigger` · Tính từ ngắn: -er + than (big → bigger, gấp đôi g).
  2. "This laptop is ___ (expensive) than that one." → `more expensive` · Tính từ dài: more + adj + than.
  3. "She is ___ (good) student in the class." → `the best` · good → better → the best. So sánh nhất có the, trừ khi đã có my / your / his… (my best friend).
  4. "He is ___ (tall) than his father." → `taller` · Không dùng cả more và -er (không phải more taller).
- `passive-present` (s1-t4-w3, 4 thẻ):
  1. "These bags ___ (sell) at the market." → `are sold` · Bị động: am / is / are + V3. Chủ ngữ số nhiều dùng are.
  2. "The tip ___ (not / include) in the bill." → `isn't included`
  3. "___ English taught at your school?" → `Is`
  4. "The windows are ___ (clean) every Monday." → `cleaned` · Bị động cần V3. "are clean" là tính từ (sạch).

Thẻ không ghi câu `vi` ở bảng trên: người làm tự viết theo quy tắc của thẻ liền trước hoặc của dòng công thức tương ứng.

**Dấu hiệu theo bài** (test cho thẻ T3–T4, so trên câu đã điền, chữ thường). Thẻ của bài đứng **trước** bài trong cột 2 không được chứa dấu hiệu:

| Dấu hiệu | Bài dạy |
|---|---|
| `going to`, `gonna` | s1-t3-w2 |
| `have / has / 've / haven't / hasn't` + (`ever / never / just / already`)? + từ đuôi -ed hoặc V3 trong `IRREGULAR_VERBS` | s1-t3-w3 |
| `since`, `how long` | s1-t3-w4 |
| `can / can't / should / shouldn't / must / mustn't` | s1-t4-w1 |
| `than`, `the best / worst / most` | s1-t4-w3 |
| `am / is / are / isn't / aren't / 'm / 's / 're` + (`not`)? + từ đuôi -ed hoặc V3 trong `IRREGULAR_VERBS` (bị động) | s1-t4-w3 |

**15 nhóm động từ** (id · tên · động từ):

1. `core` · Rất thông dụng, mỗi từ một kiểu: học thuộc · be have do go get make see
2. `n-en` · V3 thêm -n / -en: know – knew – known · know take give
3. `come` · V3 giống V1: come – came – come · come become
4. `ay-aid` · -ay → -aid: pay – paid (riêng said đọc /sed/) · say pay
5. `ell-old` · -ell → -old: tell – told · tell sell
6. `ought` · V2 = V3 đuôi -ought / -aught: buy – bought · think bring buy teach catch
7. `long-short-t` · Nguyên âm dài thành ngắn + -t: keep – kept · leave feel keep sleep mean lose
8. `d-t` · -d → -t: send – sent · send spend build
9. `long-short` · Đổi nguyên âm, V2 = V3: meet – met, hear – heard /hɝːd/ · meet hear
10. `i-a-u` · i → a → u: drink – drank – drunk · begin drink swim sing
11. `u-a-u` · u → a → u: run – ran – run · run
12. `i-a` · i → a, V2 = V3: sit – sat – sat · sit
13. `ind-ound` · -ind → -ound, -and → -ood: find – found · find understand
14. `vowel-en` · V2 đổi nguyên âm, V3 thêm -en / -n: write – wrote – written · write drive speak break choose forget eat fall
15. `same` · Giữ nguyên chữ cả ba cột: put – put – put · put read

Comment nhóm cũ trong file bỏ đi, vì tên nhóm đã thành dữ liệu.

**Golden thẻ động từ:**
- `irregular-go-rule-1`: cloze "go → ___ (V2 · V3)", answer "went · gone", vi "đi · Nhóm: Rất thông dụng, mỗi từ một kiểu: học thuộc".
- `be`: answer "was / were · been".
- `read`: answer "read · read", vi "đọc (V2, V3 đọc /red/) · Nhóm: Giữ nguyên chữ cả ba cột: put – put – put".

**Mở nhóm** (`irregularVerbStudyWords` khi có `opening`):

```
cards = srs.cards; today = thẻ động từ hợp lệ có introducedAt cùng ngày (giờ máy) với now
out = thẻ động từ đã có mục hợp lệ trong cards
if heavyReview: return out (theo thứ tự IRREGULAR_VERB_CARDS)
budget = IRREGULAR_VERBS_PER_DAY - today; taken = 0
for group in IRREGULAR_VERB_GROUPS:
  fresh = động từ của nhóm chưa có mục trong cards
  if fresh rỗng: continue
  opened = nhóm đã có ít nhất 1 thẻ
  if opened || (today + taken === 0) || taken + fresh.length <= budget: thêm fresh; taken += fresh.length
  else break   // không nhảy cóc sang nhóm nhỏ hơn phía sau
```

Mục sai dạng trong `cards` (không phải `SrsCard`) coi như chưa có mục, giống `buildSession`.

**Chữ của bảng:**
- `learn`: giữ tiêu đề "{n} động từ bất quy tắc thông dụng". Ghi chú: "Học mỗi ngày 10 động từ: nghe, đọc to cả ba cột, rồi bật "Che V2" / "Che V3" để tự nhớ. Các động từ xếp theo nhóm âm giống nhau; thẻ ôn V2 · V3 vào flashcard theo nhóm, mỗi ngày tối đa 10 động từ."
- `review-v3`: tiêu đề "Ôn cột V3 trước khi học". Ghi chú: "Hiện tại hoàn thành dùng V3 (cột 3). Nhìn V1, V2, tự nói V3 rồi bấm "Xem" để kiểm tra. Thẻ ôn V2 · V3 trong flashcard mở khi bài T2-W3 đã đánh dấu xong."

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: cả ba qua, không có test bị nới thành `>=` để qua.
- `npm run layout:guard` -- expected: chỉ báo class thêm ở `src/components/lesson/IrregularVerbTable.tsx`.
- `npm run layout:check` -- expected: ĐẠT, ảnh 375px các route trong `ROUTES` trùng baseline.

**Manual checks:**
- Chrome headless (dev server, `VITE_SUPABASE_*` rỗng), store đã bỏ qua Sân ga, xong tới s1-t2-w2:
  - 375px `/roadmap/lesson/s1-t2-w3/grammar`: thử bật / tắt "Che V2", "Che V3", bấm "Xem", nghe một dòng đang che; `scrollWidth` 375;
  - `/practice/flashcards`: có 10 thẻ "Động từ bất quy tắc" sau thẻ thì; lật, bấm link;
  - `/roadmap/lesson/s1-t3-w3/grammar`: bảng ôn V3 đứng trên TenseCard, V3 che sẵn;
  - desktop ≥ 1024px: bảng nằm gọn trong cột chính.
