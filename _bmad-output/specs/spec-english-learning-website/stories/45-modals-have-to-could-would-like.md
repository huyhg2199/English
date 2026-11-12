---
title: 'Mở rộng modal: have to, could, would like và dời cổng may / might (CAP-2, CAP-9, learning-rules "Hư từ", "Thẻ quy tắc", "Từ tín hiệu và chọn thì", "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: '9ce1622fe41bfe089af83c40526bb0f715b7fab5'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/44-conjunctions-question-words-subject-questions.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/37-t3-t4-tense-practice-data.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/24-srs-function-words-rule-cards-examples.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" là Huy **tự làm ra** được câu đúng (gõ, biến đổi, dịch Việt → Anh, nói), không chỉ nhận ra. Báo cáo kiểm tra mục T7:
  - cả 7 modal (can, could, would, should, may, might, must) mở cổng hư từ sau s1-t4-w1 (`function-words.ts:92-98`);
  - nhưng MODALS chỉ dạy can / should / must (`t2-t4-grammar.ts:1346-1497`);
  - nên thẻ SRS "Could you open the window?", "Would you like some water?", "May I come in?", "It might rain later." hiện khi chưa học.
- Quyết định 4: dùng lại tối đa bộ máy có sẵn:
  - khối "Chọn thì" `TenseChoice` có `viWords` + phần luyện (story 39, 44);
  - thẻ quy tắc của thì (story 38), cổng hư từ (story 24), phạm vi chữ `tense-scope.ts` (story 37).
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn; câu chỉ dùng kiến thức đã dạy; giao diện 375px không đổi ngoài phần mới; không nâng schema store, không thêm key đồng bộ.
- Claude chọn:
  - **Dạy ở s1-t4-w1:** have to / has to / don't have to (cả câu hỏi Do / Does … have to?), could (khả năng trong quá khứ, nhờ / xin phép lịch sự), would like ('d like, mời "Would you like…?").
  - **Không dạy may, might ở Chặng 1** (giữ đúng phạm vi story: have to, could, would like). Dời cổng sang bài Chặng 2 dạy chúng:
    - may → `s2-t7-w3` "Part 2: lời đề nghị, yêu cầu" (May I…?);
    - might → `s2-t7-w4` "V-ing/to V · điều kiện 0–1–2".
    - Không sửa chữ lộ trình Chặng 2: bảng tuần đang khớp từng chữ với `lo-trinh-toeic-12-thang.md` (`roadmap.test.ts`).
  - **would giữ cổng s1-t4-w1** (dạy dưới dạng would like). **could giữ cổng s1-t4-w1.** Hai thẻ "Could you open the window?", "Would you like some water?" từ nay là kiến thức đã dạy.
  - **Không thêm Tense mới.** Thêm 1 khối `TenseChoice` có `viWords` (như story 44), id `have-to-could-would-like`, đặt ở s1-t4-w1 sau MODALS:
    - 5 chữ Việt: phải · không cần · làm được · … được không? · muốn;
    - 4 cặp câu, 3 quy tắc, phần luyện 7 câu chính + 2 câu dễ hơn.
  - **Sửa MODALS (không đổi phần luyện, ví dụ, quy tắc):** `name`, `use`, thêm 1 dòng công thức, thêm 2 lỗi hay mắc, thêm thẻ `modals-rule-5` (has to). Mỗi thì vẫn ≤ 5 thẻ (luật story 38), tổng 58 thẻ thì.
  - **Phạm vi chữ:** từ chủ điểm `modals` trở đi (`modals`, `comparatives`, `passive-present`) được dùng could / couldn't, have / has to (cả don't / doesn't have to, Do / Does … have to), would like / 'd like / Would … like. Vẫn luôn bị báo: may, might, shall, ought, would và 'd ngoài "like", wouldn't, had to, used to, having to, have got to, gotta.
  - **Không thêm câu quiz bài** (`QUESTION_BANK`) cho s1-t4-w1 (giữ 14 câu, giữ mix / mini / O.W.L., kiểm tra cuối Bài chính). Phần mới được luyện bằng khối luyện và thẻ SRS.
  - Câu ví dụ hạng NGSL 501–1000 có modal (single, attention, medium, shall) nằm ngoài tập rà của story 24: ghi vào `_bmad-output/implementation-artifacts/deferred-work.md`, không sửa ở story này.

**Problem:** Sau bài s1-t4-w1, app giới thiệu thẻ could, would, may, might với câu ví dụ dùng chúng, trong khi bài chỉ dạy can / should / must. have to (cực hay gặp, và hay nhầm với mustn't), could (quá khứ của can, nhờ lịch sự) và would like (gọi món, mời) là mẫu câu A2 cốt lõi của TOEIC Part 2, nhưng chưa có chỗ nào dạy.

**Approach:**
- Thêm khối `have-to-could-would-like` có `viWords` ở s1-t4-w1. Mở rộng chữ của MODALS và thêm 1 thẻ quy tắc.
- Mở phạm vi chữ cho could / have to / would like từ `modals`.
- Dời cổng may / might sang bài Chặng 2. Sửa lý do `accepted` của câu ví dụ.
- Test khoá nội dung, cổng, phạm vi chữ, thẻ. Không đổi component.

## Boundaries & Constraints

**Always:**
- Khối mới theo đúng luật khối của story 39 / 44:
  - `practiceProblems` rỗng, `rules` đúng 3, `formulas` ≥ 2, đúng 4 cặp câu (a ≠ b), không `sides`;
  - đúng 7 câu chính và 2 câu dễ hơn; id câu `have-to-could-would-like-c<n>` / `-e<n>` / `-say-<n>`, không trùng id nào đang có;
  - đề không trùng đề quiz s1-t4-w1;
  - mọi chữ tiếng Anh nằm trong phạm vi chữ của `modals` (sau khi mở);
  - không có dấu hiệu của bài sau: than, the best / worst / most, be + V3 / -ed (kể cả tính từ -ed như tired, closed sau to be), more, may, might;
  - không chuỗi nào mở đầu bằng "Don't" / "don't" (kể cả `viWords[].options[].en`, dùng "I don't have to · She doesn't have to").
- Câu gõ:
  - đáp án / `accept` không có dấu tiếng Việt và tự chấm đúng (`matchesTyped`);
  - `'d` không được chuẩn hoá thành would, nên câu có would like phải ghi cả bản 'd like trong `accept`;
  - câu kết thúc bằng trạng ngữ trong `TIME_TAILS` có `accept` đặt trạng ngữ lên đầu.
- Giữ nguyên:
  - id, chữ và thứ tự `modals-rule-1` … `-4`;
  - mọi thẻ thì khác;
  - `MODALS.rules`, `examples`, `practice`, `dialogues`, `spellId`, `timeline` (không có).
  `rule:modals-5` là key mới trong `srs.cards`.
- Cổng: còn đúng 86 hư từ, 15 cổng bài, 36 cổng viên, 35 cổng tường. Chỉ `ngsl-may`, `ngsl-might` đổi bài. Thẻ đã có không bị đụng tới.
- Câu trả lời `accepted` trong `example-overrides.json` chỉ đổi chữ lý do. `scripts/vocab/example-labels.json` chạy lại không đổi.
- Khối co theo 375px, không cuộn ngang. `layout:guard` không được báo class mới hay class bị xoá.

**Never:**
- Không làm việc của story sau: quá khứ tiếp diễn (46), Bản đồ thì (42), `requires` cho câu T2–T4 cũ, test quay lại ở Sân ga, video lệch tuần, chia Ngữ pháp theo ngày (47).
- Không dạy may, might, shall, should have, had to, used to, would + V (ngoài like), câu điều kiện.
- Không thêm Tense, không thêm câu `QUESTION_BANK`, không đổi:
  - kho O.W.L. (`owl.ts`, tên chủ điểm "can / should / must"), mini test, ôn trộn;
  - bảng "Mỗi thì một dòng" và mục ôn tổng ở s1-t4-w4 (`t2-t4-pronunciation.ts`);
  - chữ lộ trình (`stage-1.ts`, `stage-2.ts`).
- Không đổi component:
  - `TenseChoiceCard`, `TensePractice`, `GrammarSection`, `TenseCard`;
  - kiểu `TenseChoice`, `Tense`, `Question`, `CheckItem`, `FunctionWordGate`.
- Không đổi store schema, `SYNCED_KEYS`, thuật toán SRS, `lockedNewWordIds`, `ruleStudyWords`.
- Không đổi `words.json`, `overrides` của `example-overrides.json`, `scripts/vocab/example-features.mjs`, `REVIEW_MAX_RANK`.
- Không chép câu hay bảng từ sách, web có bản quyền.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bài s1-t4-w1 ở 375px | `#/roadmap/lesson/s1-t4-w1`, đoạn Ngữ pháp, hoặc bước Bài chính của buổi 30' | Thẻ MODALS tên "Động từ khuyết thiếu: can / should / must, have to, could, would like", có dòng công thức "have to · could · would like". Sau thẻ và khối luyện của MODALS là khối "Phải, không cần, được không, muốn: have to, could, would like": 5 ô chữ Việt, 4 cặp câu, 3 quy tắc, khối "Luyện: …" đóng. Mỗi lúc chỉ mở một khối luyện. `scrollWidth` = 375 | N/A |
| Máy tính | ≥ 1024px, trang bài s1-t4-w1 (hai cột, story 30) | Khối mới nằm trong cột Ngữ pháp như khối story 39 / 44. Phím tắt chỉ chạy trong khối luyện đang mở | N/A |
| Luyện have to | `-c1` "My mother ___ (have to) get up at five every day." gõ "has to" | Đúng | Gõ "have to" → sai, giải thích "my mother = she → has to", làm lại. Không ghi Sổ lỗi |
| Câu hỏi have to | `-c3` gõ "does he have to work on sunday" | Đúng | "Has he to work on Sunday?" → sai, giải thích "have to mượn does" |
| Quá khứ của can | `-c4` gõ "Last night I could not sleep" | Đúng (couldn't = could not; trạng ngữ lên đầu ở `accept`) | "I can't sleep last night." → sai, giải thích "quá khứ → couldn't" |
| would like | `-c6` gõ "I'd like a cup of tea please" hoặc "I would like a cup of tea, please." | Cả hai đúng | "I want a cup of tea, please." → sai, giải thích "đề yêu cầu would like (lịch sự)" |
| Xong bài s1-t4-w1 | Đánh dấu xong bài | Phiên ôn có `rule:modals-1` … `-5` theo thứ tự lộ trình. can, could, would, should, must mở (vào từ mới theo hạng NGSL). may, might vẫn khoá | N/A |
| Bài đã xong trước story 45 | `srs.cards` có `rule:modals-1` … `-4` | Phiên thêm đúng `rule:modals-5`; 4 thẻ cũ giữ lịch | N/A |
| may / might mở | Đánh dấu xong `s2-t7-w3` / `s2-t7-w4`, hoặc Mũ Phân Loại xếp bắt đầu sau `s2-t7-w4` | may mở sau `s2-t7-w3`, might mở sau `s2-t7-w4`; bị xếp qua thì cả hai mở | N/A |
| Thẻ may có từ trước | `srs.cards` có `ngsl-may` (giới thiệu trước story 45) | Vẫn ôn theo lịch, không xoá, không reset | N/A |
| Bỏ đánh dấu s1-t4-w1 | Bỏ đánh dấu bài | could, would chưa giới thiệu thì để dành lại; thẻ đã có giữ nguyên; `rule:modals-*` không vào phiên (mục trong store giữ nguyên) | N/A |
| Phạm vi chữ mở | `outOfScopeWords(id, …)` với id ∈ `modals`, `comparatives`, `passive-present`: "I couldn't sleep.", "Could you help me?", "She has to work.", "Does he have to work?", "We don't have to go.", "I'd like a coffee.", "Would you like some tea?" | `[]` | N/A |
| Phạm vi chữ còn khoá | Cùng các câu trên, id ∈ 6 thì T1–T2 và `will` … `present-perfect-vs-past` | Bị báo (could, have to, has to, 'd / would) | N/A |
| Luôn bị báo | Mọi 13 id: "may", "might", "shall", "ought", "I would go.", "I'd go home.", "wouldn't", "He had to wait.", "I used to swim.", "I have got to go.", "I gotta go." | Bị báo | N/A |
| Thẻ mồ côi | `srs.cards` có `rule:modals-6` | Không hiện, không đếm tồn ôn, vẫn nằm trong store | N/A |
| Máy cũ | App bản trước story 45 đồng bộ store có `rule:modals-5` | Không lỗi, thẻ không hiện | N/A |
| Câu ví dụ | `npm run vocab:label-examples` | 0 todo; `example-labels.json` không đổi | Có todo thì sửa lý do `accepted`, không nới máy dò |

</frozen-after-approval>

## Code Map

- `src/data/lessons/t2-t4-grammar.ts`:
  - `:2` import từ `./tense-choices`;
  - `:1346-1497` `MODALS` (`name` `:1348`, `use` `:1349`, `formulas` `:1350-1354`, `mistakes` `:1368-1372`, `ruleCards` `:1375-1400`, comment phần luyện `:1401`);
  - `:1842` `GRAMMAR_T4_W1`.
- `src/data/lessons/tense-choices.ts` -- doc comment đầu file (`:3-12`), `DONT_TRANSLATE` (`:773`, mẫu khối `viWords` không `sides`). Khối mới đặt cuối file, dưới đề mục `// ---- s1-t4-w1`.
- `src/data/lessons/index.ts:41` -- re-export khối. `allTenseChoices` (`:172`) tự lấy khối theo thứ tự bài.
- `src/data/lessons/spells.ts:82-88` -- `expelliarmus`: `description`, `grammarEn` (đưa vào prompt luyện nói AI).
- `src/lib/tense-scope.ts`:
  - doc comment `:3-14`;
  - `MODALS` `:147-158`, `OTHER_MODALS` `:159-171`, trường `modal` của `Scope` (`:188-189`);
  - nhánh token `:307`, `HAVE_TO_RE` `:264-265`, vòng "luôn bị báo" `:353`.
- `src/data/vocab/function-words.ts` -- doc comment `:14-16`, `ngsl-may` `:96`, `ngsl-might` `:97`.
- `src/data/vocab/example-overrides.json` -- `accepted` của `ngsl-could` `:571`, `ngsl-may` `:576`, `ngsl-might` `:577`, `ngsl-would` `:588`.
- `src/data/questions/t2-t4.ts:506` -- giải thích `q-s1-t4-w1-10` nói "May I / Could I … chưa học ở Chặng 1". `:495` là comment.
- `src/lib/flashcard-session.ts` `lockedNewWordIds` (`:160-168`, cổng bài nhận mọi bài trong `allLessons()`), `ruleStudyWords` -- tự lấy thẻ mới và cổng mới. Không sửa.
- `src/lib/tense-practice.ts` `practiceProblems`, `src/lib/tense-choice.ts` `choiceSides` -- khối không `sides` thì `choiceSides` trả `[]`. Không sửa.
- `src/lib/quiz/typed.ts:8-16` -- `'d` không mở rộng; n't, can't mở rộng. Chỉ đọc.
- Test (Vitest env `node`, không có test component):
  - `src/lib/tense-scope.test.ts`: ROWS `:131-158` (hàng "can / should / must" `:140-144`), `:183`, `ALWAYS` `:200-207`, `:233-235`;
  - `src/data/lessons/lessons.test.ts`:
    - `CARDS` `:1217-1231`, 57 thẻ `:1251-1261` / `:1305-1314`;
    - SIGNALS `:1204-1211`; chỗ đặt khối `:1517-1546`; phạm vi chữ khối `:1648-1680`;
    - describe khối story 44 (mẫu cho describe mới);
  - `src/data/vocab/function-words.test.ts:16-27` (tổng cổng), `:47-53` ("cổng bài là bài thuộc Chặng 1");
  - `src/lib/flashcard-session.test.ts`: `LESSON_LOCKED` `:93` (giữ nguyên), cổng bài `:360-379`, thẻ thì `:513-660`, `:1133`;
  - `src/data/vocab/example-overrides.test.ts` -- chỉ cần lý do không rỗng; không sửa;
  - `src/data/questions/owl.test.ts:205-220` -- câu O.W.L. không trùng câu luyện / ví dụ; không sửa, chỉ phải qua.
- Tài liệu:
  - `_bmad-output/specs/spec-english-learning-website/learning-rules.md`: `:68` (Hư từ), `:71` (Ví dụ, câu "ngoại lệ … (will, can…)"), `:119` (Từ tín hiệu và chọn thì);
  - `_bmad-output/specs/spec-english-learning-website/stack.md:28` (cổng "bài Chặng 1");
  - `_bmad-output/implementation-artifacts/deferred-work.md` -- thêm mục hoãn.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/tense-scope.ts` --
  - khi `scope.modal`: không báo could / couldn't / couldnt; không báo have to / has to (kể cả trong don't / doesn't have to, Do / Does … have to);
  - khi `scope.modal`: không báo would / 'd nếu từ kế là like ("would like", "I'd like"), hoặc would + chủ ngữ + like với chủ ngữ là đại từ ("Would you like") hay từ hạn định + 1 danh từ ("Would your son like"). Ngoài dạng đó thì vẫn báo (would + động từ … like, 'd better, would not like); wouldn't luôn báo;
  - mọi thì vẫn báo: may, might, shall, ought, had to, having to, used to, have got to, 've / 's / 'd got to, gotta;
  - sửa doc comment đầu file, comment `MODALS` / `OTHER_MODALS` / `Scope.modal`: nhóm modal mở từ s1-t4-w1 là "can / could / should / must, have to, would like" (story 45). Nhóm "luôn bị báo" còn may / might / shall / ought, would ngoài would like, had to / used to.
- [x] `src/lib/tense-scope.test.ts` --
  - hàng ROWS "can / should / must" đổi tên "can / could / should / must, have to, would like", thêm 7 mẫu của dòng "Phạm vi chữ mở" ở bảng I/O;
  - `:183` đổi thành `outOfScopeWords('passive-present', 'It might rain.')` → `['might']`;
  - `ALWAYS`: bỏ 'could', "I'd like tea.", 'I have to go.', 'She has to work.'; thêm "I would go.", "I'd go home.", "wouldn't". Giữ 'would', 'may', 'might', 'shall', 'ought', had to, used to, got to, gotta;
  - `:233-235` "vẫn bị báo": 'could' → 'might', 'I have to go.' → 'He had to wait.';
  - thêm test "could, have to, would like không bị báo từ `modals`; would / 'd ngoài like vẫn bị báo": mọi câu của dòng "Phạm vi chữ mở" rỗng ở 3 id; "I would go.", "I'd go home.", "She'd visit us.", "I wouldn't like it." bị báo ở 3 id đó; "I couldn't sleep." bị báo ở `present-perfect-vs-past`.
- [x] `src/data/lessons/tense-choices.ts` -- thêm `HAVE_TO_COULD_WOULD_LIKE` (id `have-to-could-would-like`) theo Design Notes. Doc comment đầu file:
  - 6 khối, thêm "phải · không cần · làm được · … được không? · muốn (s1-t4-w1)";
  - khối s1-t4-w1 dùng phạm vi chữ của `modals` (đã mở could / have to / would like).
- [x] `src/data/lessons/t2-t4-grammar.ts` -- import khối mới. `GRAMMAR_T4_W1 = { tenses: [MODALS], choices: [HAVE_TO_COULD_WOULD_LIKE] }`. Sửa MODALS theo Design Notes (`name`, `use`, công thức 4, 2 lỗi mới, `modals-rule-5`). Comment phần luyện `:1401` ghi: câu luyện của thì giữ can / should / must; have to, could, would like luyện ở khối `have-to-could-would-like` (story 45).
- [x] `src/data/lessons/index.ts` -- re-export `HAVE_TO_COULD_WOULD_LIKE`.
- [x] `src/data/lessons/spells.ts` -- `expelliarmus`:
  - `description`: "Khuyên, bắt buộc, xin phép, nhờ: can / could / should / must / have to + động từ nguyên mẫu; would like để nói muốn một cách lịch sự.";
  - `grammarEn`: "the modal verbs can, could, should and must, plus have to and would like".
- [x] `src/data/vocab/function-words.ts` --
  - `'ngsl-may': lesson('s2-t7-w3', ['may'])`, `'ngsl-might': lesson('s2-t7-w4', ['might'])`;
  - doc comment: cổng bài là bài đầu tiên dạy nó; modal ở s1-t4-w1 gồm can, could, should, must, would (would like). may (May I…?, s2-t7-w3) và might (câu điều kiện, s2-t7-w4) chưa dạy ở Chặng 1 (story 45).
- [x] `src/data/vocab/function-words.test.ts` --
  - giữ tổng 86 / 36 / 15 / 35;
  - test cổng bài: `getLesson(lesson)` có thật; mọi cổng bài thuộc Chặng 1, trừ đúng `ngsl-may` → `s2-t7-w3` và `ngsl-might` → `s2-t7-w4` (Chặng 2);
  - assert `ngsl-can`, `-could`, `-would`, `-should`, `-must` là `{ lesson: 's1-t4-w1' }`.
- [x] `src/data/vocab/example-overrides.json` -- chỉ sửa lý do `accepted`:
  - could: "could dạy ở bài s1-t4-w1 (quá khứ của can, Could you…? nhờ lịch sự); chỉ được giới thiệu làm từ mới sau bài đó (thẻ cũ có từ trước vẫn ôn)";
  - would: "would dạy ở bài s1-t4-w1 dưới dạng would like (Would you like…?); chỉ …";
  - may: "may (May I…?) chưa dạy ở Chặng 1, mở sau bài s2-t7-w3 (lời đề nghị, yêu cầu); chỉ …";
  - might: "might chưa dạy ở Chặng 1, mở sau bài s2-t7-w4 (câu điều kiện); chỉ …".
  Chạy `npm run vocab:label-examples`: 0 todo, `example-labels.json` không đổi.
- [x] `src/data/questions/t2-t4.ts` -- giải thích `q-s1-t4-w1-10`: thay câu trong ngoặc cuối thành "(Could I…? cũng là xin phép, lịch sự hơn: xem khối have to, could, would like của bài này. Đề cho sẵn can.)". Comment `:495` thêm "(have to / could / would like luyện ở khối của story 45)". Không đổi đề, đáp án, `requires`.
- [x] `src/lib/flashcard-session.test.ts` -- thêm test (helper có sẵn: `skipFoundation`, `completeLessons`, `setLessonCompleted`, `recordAttempt`, `gradeCard`, `withFutureCards`):
  - bỏ qua Sân ga + xong s1-t4-w1 → can, could, would, should, must mở; may, might vẫn khoá;
  - thêm `s2-t7-w3` → may mở, might khoá; thêm `s2-t7-w4` → might mở;
  - Mũ xếp bắt đầu `s2-t8-w1` → may, might mở;
  - có thẻ `ngsl-may` từ trước, chưa xong `s2-t7-w3` → thẻ vẫn là thẻ ôn khi tới hạn;
  - xong s1-t4-w1 → `ruleStudyWords` có `rule:modals-1` … `-5` đúng thứ tự, có `lessonId: 's1-t4-w1'`;
  - store có `rule:modals-1` … `-4` → phiên thêm đúng `-5`, thẻ cũ giữ lịch;
  - `rule:modals-6` không hiện, không đếm tồn ôn.
  `LESSON_LOCKED` và dãy khoá Sân ga giữ nguyên.
- [x] `src/data/lessons/lessons.test.ts` --
  - `CARDS.modals` = `['speak', 'Can', "mustn't", 'should', 'has to']`; tổng 58 thẻ (cả `checked`), tên test ghi "story 45 thêm 1";
  - chỗ đặt khối: thêm `'s1-t4-w1': ['have-to-could-would-like']`; `allTenseChoices()` = `['question-words', 'simple-vs-continuous', 'subject-questions', 'will-vs-going-to', 'dont-translate', 'have-to-could-would-like']`; khối mới không `sides`;
  - phạm vi chữ khối: `scoped` có `'have-to-could-would-like@modals'`;
  - thêm describe "khối have to, could, would like (story 45)":
    - `viWords` đúng `['phải', 'không cần', 'làm được', '… được không?', 'muốn']`, mỗi chữ đúng 2 cách nói, đủ trường; không `en` nào mở đầu bằng don't;
    - đúng 4 cặp câu (a ≠ b, `noteVi` khác rỗng); 7 câu chính, 2 câu dễ hơn; ≥ 4 câu gõ;
    - đáp án (`answerText` như story 44): ≥ 1 has to, ≥ 1 don't / doesn't have to hoặc "Does … have to", ≥ 2 could / couldn't, ≥ 1 would like / 'd like;
    - golden chấm của bảng I/O (`-c1`, `-c3`, `-c4`, `-c6`, cả câu đúng lẫn câu sai);
    - `MODALS.name`, công thức thứ 4 và `modals-rule-5` đúng chữ Design Notes; `modals-rule-1` … `-4` không đổi.
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` --
  - `:68`: "Hư từ không có viên gạch nào dạy (vd can, will, do/does) gắn với bài đầu tiên dạy nó (thường ở Chặng 1). may, might chưa dạy ở Chặng 1 nên mở sau bài Chặng 2 dạy chúng: may ở s2-t7-w3, might ở s2-t7-w4 (story 45)";
  - `:71`: ngoại lệ "(will, can, could, would…)";
  - `:119`: thêm khối "Phải, không cần, được không, muốn: have to, could, would like" (s1-t4-w1).
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- dòng Flashcard SRS: "mở theo viên / bài (Chặng 1; may, might ở bài Chặng 2, story 45) / qua tường".
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- thêm 1 mục: câu ví dụ NGSL hạng 501–1000 còn modal chưa dạy lúc hiện (`ngsl-single`, `ngsl-medium` "I'd like…" hiện quanh T3 trước s1-t4-w1; `ngsl-attention` "May I…"; `ngsl-shall` "Shall we…?"). Cần mở rộng tập rà của story 24 mới sửa được.

**Acceptance Criteria:**
- Given Huy mở bước Bài chính của buổi 30' ở bài s1-t4-w1, when cuộn qua thẻ MODALS và khối luyện của nó, then thấy khối "Phải, không cần, được không, muốn: have to, could, would like". Bấm "Bắt đầu luyện" thì khối luyện của MODALS (nếu đang mở) tự đóng.
- Given Huy đang ở câu `-c2` "We have a lot of food. ___ bring any.", when chọn "You mustn't", then câu bị chấm sai, giải thích "mustn't là cấm; không cần thì dùng don't have to", và được chọn lại.
- Given Huy đánh dấu xong s1-t4-w1, when sang bước Ôn hôm sau, then gặp thẻ "My father ___ (have to) work on Saturdays.", lật ra "has to"; và thẻ hư từ could hiện "___ you open the window?" như từ mới khi tới hạng của nó.
- Given Huy đã xong s1-t4-w1 nhưng chưa tới s2-t7-w3, when phiên ôn chọn từ mới, then không bao giờ giới thiệu may hay might.
- Given máy cũ (bản trước story 45) đồng bộ store có `rule:modals-5`, when mở app cũ, then app không lỗi và thẻ không hiện.

## Implementation Notes

- **Đã làm đủ 15 việc ở Execution.** Nội dung khối `have-to-could-would-like` và phần sửa MODALS theo đúng chữ của Design Notes. Chữ Việt tự thêm gồm: nghĩa của cặp câu (`vi` của `a` / `b`), gợi ý và giải thích từng câu luyện. Không sửa component nào.
- **Lệch Design Notes để qua luật frozen** "không chuỗi nào mở đầu bằng don't" (test story 39 quét cả lựa chọn và đáp án điền qua `practiceEnglishTexts`). Giữ id, ý và golden:
  - `faded`: "___ (we / not / have to) wear a uniform at school." → "We don't have to" (Design Notes: "We ___ (not / have to)…" → "don't have to");
  - `-c2`: đề "We have a lot of food. ___ bring any.", lựa chọn "You don't have to · You mustn't · You doesn't have to". Chọn "You mustn't" thì bị chấm sai, có giải thích "mustn't là cấm; không cần thì dùng don't have to";
  - `-e2`: đề "___ some tea? — Yes, please.", lựa chọn "Would you like · Do you like · Are you like". Lựa chọn "Would" đứng một mình bị `outOfScopeWords` báo, vì would chỉ mở khi đi với like;
  - giải thích `-c6` viết lại để có đúng chuỗi "đề yêu cầu would like (lịch sự)" (viết thường).
- **Phạm vi chữ (`tense-scope.ts`):**
  - could / couldn't / couldnt vào `MODALS`, nên mở từ `modals`;
  - `OTHER_MODALS` còn would, wouldn't, may, might, shall, ought;
  - would / 'd không bị báo khi `scope.modal` và có dạng would like (hàm `isWouldLike`): từ kế là like, hoặc cách một từ (không phải not) rồi tới like. "would not like" vẫn bị báo, như wouldn't;
  - `HAVE_TO_RE` giữ nguyên. Khớp đúng "have to" / "has to" thì bỏ qua khi `scope.modal`; had to, having to, used to, got to, gotta vẫn bị báo ở mọi thì.
- **Test thêm ngoài danh sách:**
  - `tense-scope.test.ts`: kiểm đúng từ bị báo ("I'd go home." → `["i'd"]`, "I would not like it." → `['would']`, "She has to work." ở `present-perfect-vs-past` → `['has to']`);
  - `lessons.test.ts`: test story 37 "đề không trùng … khối Chọn thì" đổi đếm khối T3–T4 từ 2 thành 3; test "thẻ T3–T4 không chứa dấu hiệu bài sau" đổi đếm từ 30 thành 31;
  - describe story 45 kiểm thêm: chỗ đặt khối, id câu, lựa chọn khác nhau, không may / might / than / more / shall / the best, không be + V-ed, mọi câu (kể cả mảnh câu) trong phạm vi `modals`, 2 lỗi mới của MODALS;
  - `flashcard-session.test.ts`: tự kiểm rằng phiên 21 ngày đã đi quá hạng 159 (might) và giới thiệu could, would; ca bỏ đánh dấu s1-t4-w1.
- **Lệnh:**
  - `npm run lint`, `npm test` (85 file, 2094 test) và `npm run build` đều qua;
  - `npm run vocab:label-examples`: "560 câu: 399 clean · 141 override · 20 accepted · 0 todo", `example-labels.json` không đổi;
  - `npm run layout:guard`: 7 file nguồn đổi, không class nào bị thêm hay xoá.
- **`npm run layout:check`:** mọi route `ok` ở 5 bề rộng, ảnh 375px trùng hết (bộ chụp không có route s1-t4-w1). Probe phím tắt F01 ở 1280px báo LỖI ("gõ "chào 1" + Enter trong ô không chấm"). Lỗi này có sẵn từ HEAD trước (story 41, 43, 44), không sửa ở story này.
- **Kiểm tay** (Chrome headless qua CDP, vite dev, `VITE_SUPABASE_*` rỗng), trang `#/roadmap/lesson/s1-t4-w1` ở 375px và 1280px:
  - thẻ MODALS có tên mới và dòng công thức "have to · could · would like";
  - khối "Phải, không cần, được không, muốn…" đứng sau "Luyện: Động từ khuyết thiếu…";
  - bấm "Bắt đầu luyện" của MODALS rồi của khối mới: chỉ còn khối mới mở;
  - mở mọi `details` thì `scrollWidth` = 375 / 1280.
  - Chưa gõ tay câu `-c4`, `-c6` trên trình duyệt; golden chấm của 2 câu này đã có test bằng `isCorrect`.

## Spec Change Log

- **2026-11-13, review story 45 (blind #3, edge #6):** Design Notes và Acceptance Criteria (ngoài phần frozen) mâu thuẫn với luật frozen "không chuỗi nào mở đầu bằng don't (kể cả `viWords[].options[].en`)": lựa chọn `-c2` "don't have to", đáp án `faded` "don't have to" mở đầu bằng don't; lựa chọn "Would" của `-e2` đứng một mình bị phạm vi chữ báo. Đã sửa Design Notes và AC cho khớp code: `faded` "___ (we / not / have to) …" → "We don't have to"; `-c2` "We have a lot of food. ___ bring any." [You don't have to · You mustn't · You doesn't have to]; `-e2` "___ some tea? — Yes, please." [Would you like · Do you like · Are you like]. Trạng thái tránh: spec nói một đằng, test frozen đòi một nẻo. KEEP: id câu, ý câu, golden `-c1`, `-c3`, `-c4`, `-c6` không đổi; phần frozen không đổi.
- **2026-11-13, review story 45 (blind #2, edge #1–#5, vgap):** Execution việc 1 đổi luật would like từ "cách một từ chủ ngữ" thành "đại từ, hoặc từ hạn định + 1 danh từ" (theo đúng luật frozen "would / 'd ngoài dạng đó vẫn bị báo"; bản cũ nhận cả "It would look like rain"). KEEP: 7 câu "Phạm vi chữ mở" vẫn rỗng; wouldn't, would not like vẫn bị báo.
- **2026-11-13, review story 45 (content, blind #5, #10):** Design Notes sửa nội dung để không dạy sai / chưa dạy: bỏ mệnh đề "when I was …" (chưa dạy liên từ when) ở ví dụ could, quy tắc 3 và `-c7` ("Two years ago, my son ___ (can / not / read)."); thêm lưu ý "làm được một lần cụ thể trong quá khứ dùng V2, không dùng could"; whenVi của can / could; cặp câu 2 và công thức could không còn in sẵn đáp án `-c4`; ví dụ have to đổi để không lặp `-c1`; `-say-2` thêm "ạ", `-say-3` đổi câu để không lặp `-c6`; `use` MODALS "could: làm được (ngày trước)"; công thức 4 MODALS thêm "/ to + V" (test khoá chữ sửa theo). KEEP: thẻ `modals-rule-5` giữ đúng chữ AC.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|------------|-------|
| 1 | blind | Doc comment `isWouldLike` nói nhận "Would your son like" nhưng code báo | low | `outOfScopeWords('modals', 'Would your son like some tea?')` → `['would']` ở code cũ | patch (nhóm A): nhận từ hạn định + 1 danh từ, thêm test "Would your son like", "What would your parents like?" |
| 2 | blind | `isWouldLike` nhận mọi từ (trừ not) giữa would và like | medium | Code cũ: "It would look like rain.", "He would go like that." → `[]` ở `modals`, trái luật frozen "would ngoài dạng đó vẫn bị báo" | patch (nhóm A): chỉ nhận đại từ / từ hạn định + danh từ; 'd chỉ nhận like liền sau; test âm cho look / feel / sound / go like, 'd better |
| 3 | blind | AC và Design Notes còn tả nội dung cũ, Spec Change Log rỗng | low | AC `-c2` "You ___ bring any." / chọn "mustn't"; Design Notes `faded`, `-c2`, `-e2` khác code; lệch do luật frozen về don't | patch: sửa AC, Design Notes theo code, ghi Spec Change Log |
| 4 | blind | Frontmatter chưa chốt (`in-progress`, Triage Log rỗng) | false | Chốt status và Triage Log là việc của bước triage này, không phải lỗi của bản cài | reject |
| 5 | blind | Nội dung could khái quát quá, "hôm qua" dạy sai "Yesterday I could finish…" | medium | whenVi `tense-choices.ts:1010` "(hồi nhỏ, hôm qua)", quy tắc 3 chỉ nói "quá khứ của can" | patch (nhóm B): whenVi và quy tắc 3 thêm "một lần cụ thể dùng couldn't / V2, không dùng could" |
| 6 | blind | Giải thích `q-s1-t4-w1-10` nói "bài này" nhưng câu cũng vào mix-s1 / mix-tet | low | `questions/index.ts:115,125` lấy `s1-t4-w1` vào ôn trộn | patch: ghi tên bài "Động từ khuyết thiếu · dạng rút gọn" (s1-t4-w1) |
| 7 | blind | Tên chủ điểm O.W.L. vẫn "can / should / must" | low | `owl.ts:25`; story cấm sửa `owl.ts` | defer |
| 8 | blind | Thẻ `ngsl-would` nghĩa "sẽ (quá khứ/lịch sự)" chưa dạy | low | `words.json:37`; story cấm sửa `words.json` | defer |
| 9 | blind | Phạm vi chữ mở mọi nghĩa của could, mất test "It could rain" | medium | Máy dò theo từ không tách nghĩa; nội dung sau có thể dùng could khả năng | defer + thêm test "giới hạn đã biết" chốt ranh giới |
| 10 | blind | Thẻ quy tắc, câu luyện, ví dụ lặp khung câu | low | Ví dụ viWords "My father has to get up at five…" gần `-c1`; `-say-3` gần `-c6` | patch (nhóm C): đổi ví dụ have to và `-say-3`; giữ `-c1` (golden frozen) và `modals-rule-5` (chữ AC) |
| 11 | blind | 2 mục AC chưa có test (thẻ cloze could, phạm vi còn khoá báo đúng từ) | low | Test cũ chỉ kiểm could được giới thiệu | patch: test `functionWordCloze(ngsl-could)` → "___ you open the window?"; test `["i'd"]`, `['would']` ở `will` / `present-perfect-vs-past` |
| 12 | blind | Cột tham chiếu dòng Flashcard SRS của `stack.md` thiếu 45 | low | Ô vẫn "Story 3, 23, 24, 33, 38" | patch |
| 13 | edge | would + động từ + like lọt ở `modals` | medium | Như #2 | patch (nhóm A) |
| 14 | edge | "You'd better like it." lọt (had better) | medium | Code cũ: 'd + better + like → không báo | patch (nhóm A) |
| 15 | edge | Chủ ngữ nhiều từ "Would your son like" | low | Như #1 | patch (nhóm A) |
| 16 | edge | Token nối qua dấu câu: "I would. Like you, …" | low | Có thật nhưng hiếm trong nội dung soạn tay; sửa phải tách câu trước khi tách token | reject |
| 17 | edge | Claim: code nhận mọi token trước like | medium | Như #2 | patch (nhóm A) |
| 18 | edge | Claim: AC `-c2` khác đề trong code | low | Như #3 | patch (cùng #3) |
| 19 | vgap (other) | "would + verb … like" lọt (He would go like that, I'd go like this) | medium | Như #2, test âm cũ không có like ở vị trí +2 | patch (nhóm A) |
| 20 | vgap (other) | Doc comment `isWouldLike` không khớp code | low | Như #1 | patch (nhóm A) |
| 21 | content | Mệnh đề "when I was …" chưa dạy (ví dụ could, quy tắc 3, `-c7`) | medium | grep `src/data`: không bài nào trước s1-t4-w1 dùng when + mệnh đề; when chỉ là từ để hỏi | patch: "I couldn't swim five years ago.", `-c7` "Two years ago, my son ___ (can / not / read)." |
| 22 | content | could khẳng định + "hôm qua" dạy lỗi | medium | Như #5 | patch (nhóm B) |
| 23 | content | Đáp án `-c4` in sẵn ở cặp câu 2 và công thức could | low | "I couldn't sleep last night." ở pair 2 và formula cùng màn | patch: cặp câu 2 và công thức dùng "I couldn't find my keys yesterday."; đề `-c4` giữ (golden frozen) |
| 24 | content | `-c1` gần ví dụ viWords và `modals-rule-5` | low | Như #10 | patch (nhóm C) |
| 25 | content | whenVi can "Bây giờ" thiếu nghĩa nói chung | low | `modals-rule-1` "My grandmother can speak French" là khả năng chung | patch: "Bây giờ, hoặc nói chung (không phải quá khứ)" |
| 26 | content | `-say-2` mất sắc thái lịch sự | low | vi "Bạn giúp tôi được không?" không "ạ" | patch: thêm "ạ" |
| 27 | content | Giải thích `-c5` gợi ý Can sai với người lạ | low | "Nhờ người lạ thì dùng Could you…" | patch: "thường dùng Could you … (lịch sự hơn Can you …)" |
| 28 | content | `use` MODALS "đã có thể" mơ hồ | low | `t2-t4-grammar.ts:1357` | patch: "could: làm được (ngày trước), nhờ lịch sự" |
| 29 | content | Cổng may / might dựa vào bài Chặng 2 chưa có nội dung | medium | `stage-2.ts:126-131` không nêu may / might; bài chưa soạn nên chưa kiểm được | defer |
| 30 | content | Công thức would like của MODALS thiếu "/ to + V" | low | Khối ghi "+ danh từ / to + V", MODALS chỉ "+ danh từ" | patch: thêm "/ to + V" ở MODALS và test khoá chữ |

## Design Notes

**MODALS (chỉ các trường đổi):**
- `name`: "Động từ khuyết thiếu: can / should / must, have to, could, would like".
- `use`: "can: có thể, xin phép · should: lời khuyên · must: bắt buộc, rất cần thiết · have to: phải (do hoàn cảnh) · could: làm được (ngày trước), nhờ lịch sự · would like: muốn (lịch sự)."
- `formulas` thêm dòng 4: `{ label: 'have to · could · would like', text: "have / has to + V (don't / doesn't have to, Do you have to…?) · could + V · would like + danh từ / to + V: I'd like a coffee." }`.
- `mistakes` thêm (sau 3 lỗi cũ):
  - "My boss have to travel a lot." → "My boss has to travel a lot." · "have to là động từ thường: he / she / it (my boss) dùng has to.";
  - "Yesterday I can't go to work." → "Yesterday I couldn't go to work." · "Quá khứ của can là could: couldn't + động từ nguyên mẫu."
- `ruleCards` thêm `modals-rule-5`: cloze "My father ___ (have to) work on Saturdays." · answer "has to" · vi "have to là động từ thường: he / she / it → has to + V. Phủ định, câu hỏi mượn do / does: doesn't have to, Does he have to…?"

**Khối `have-to-could-would-like`** (s1-t4-w1, phạm vi chữ `modals`; hằng `HAVE_TO_COULD_WOULD_LIKE`):
- name "Phải, không cần, được không, muốn: have to, could, would like".
- use: "Tiếng Việt dùng “phải”, “được”, “muốn” cho mọi trường hợp; tiếng Anh chọn từ theo nghĩa: luật hay hoàn cảnh (must / have to), cấm hay không cần (mustn't / don't have to), bây giờ hay ngày trước (can / could), nói thẳng hay lịch sự (want / would like)."
- `viWords` (`en` · whenVi · ví dụ en / vi):
  - "phải":
    - `must` · "Luật, biển báo, hoặc chính mình thấy rất cần" · "You must stop at a red light." / "Đèn đỏ thì bạn phải dừng lại.";
    - `have to / has to` · "Việc bắt buộc do hoàn cảnh: công việc, lịch học, giờ tàu xe" · "My sister has to take the bus to work." / "Chị tôi phải đi xe buýt đi làm.".
  - "không cần":
    - `I don't have to · She doesn't have to` · "Không cần làm; muốn làm vẫn được" · "You don't have to bring food. We have a lot." / "Bạn không cần mang đồ ăn. Chúng tôi có nhiều rồi.";
    - `mustn't` · "Không được làm (cấm); đừng nhầm với không cần" · "You mustn't take photos in the museum." / "Bạn không được chụp ảnh trong bảo tàng.".
  - "làm được":
    - `can / can't` · "Bây giờ, hoặc nói chung (không phải quá khứ)" · "My son can swim now." / "Bây giờ con trai tôi bơi được.";
    - `could / couldn't` · "Ngày trước, trong quá khứ (năm năm trước, hồi nhỏ). Một lần cụ thể (hôm qua) thì chỉ dùng couldn't; làm được một lần thì dùng V2: I finished the report." · "I couldn't swim five years ago." / "Năm năm trước tôi không bơi được.".
  - "… được không?":
    - `Can I …? / Can you …?` · "Với bạn bè, người nhà" · "Can you pass me the salt?" / "Đưa mình lọ muối được không?";
    - `Could I …? / Could you …?` · "Lịch sự hơn: với người lạ, sếp, khách" · "Could you help me with my bag, please?" / "Anh giúp tôi xách cái túi được không ạ?".
  - "muốn":
    - `want` · "Nói thẳng, với người thân" · "I want a new phone." / "Tôi muốn một cái điện thoại mới.";
    - `would like ('d like)` · "Lịch sự: gọi món, mua hàng; mời: Would you like …?" · "I'd like a table for two, please." / "Cho tôi một bàn hai người.".
- pairs (a / b · noteVi; tự thêm `vi`):
  - "You mustn't come to the meeting." / "You don't have to come to the meeting." · "mustn't: cấm, không được đến. don't have to: không cần đến, muốn đến vẫn được.";
  - "I can't find my keys." / "I couldn't find my keys yesterday." · "can't nói bây giờ; couldn't nói trong quá khứ (yesterday).";
  - "Can you open the door?" / "Could you open the door, please?" · "Cả hai đều là nhờ; Could you …, please? lịch sự hơn, hợp với người lạ, sếp.";
  - "I want a sandwich." / "I'd like a sandwich, please." · "Cùng nghĩa muốn; gọi món thì I'd like … lịch sự hơn, I want … nghe hơi cộc.".
- formulas:
  - `have to`: "I / you / we / they have to + V · he / she / it has to + V. Phủ định: don't / doesn't have to + V. Câu hỏi: Do / Does + S + have to + V …?";
  - `could`: "could / couldn't + V nguyên mẫu: I couldn't find my keys yesterday. Nhờ lịch sự: Could you + V …, please?";
  - `would like`: "would like ('d like) + danh từ / to + V: I'd like a coffee. I'd like to go home. Mời: Would you like …? — Yes, please.".
- rules:
  1. "have to là động từ thường: he / she / it dùng has to; phủ định và câu hỏi mượn do / does: She doesn't have to work. Do you have to work? (không nói Has she to…?, She hasn't to…)."
  2. "mustn't = cấm, không được làm. don't have to = không cần làm, muốn làm vẫn được. Biển báo, luật dùng mustn't; việc không bắt buộc dùng don't have to."
  3. "could là quá khứ của can (I couldn't swim five years ago) và là cách nhờ, xin phép lịch sự hơn can (Could you…? Could I…?). Làm được một lần cụ thể trong quá khứ thì dùng V2 (Yesterday I finished the report), không dùng could. would like = want nhưng lịch sự (I'd like…); mời thì hỏi Would you like…?, trả lời Yes, please. / No, thank you."
- practice:
  - worked: "I have to work on Saturday, so I can't come to your party." / "Thứ Bảy tôi phải đi làm, nên tôi không đến bữa tiệc của bạn được."; noteVi "Việc bắt buộc do công việc → have to + V nguyên mẫu (have to work). Chủ ngữ I nên dùng have, không phải has.".
  - faded: "___ (we / not / have to) wear a uniform at school." → `We don't have to`; vi "Ở trường chúng tôi không cần mặc đồng phục."; hint "Không cần → don't have to (mượn do, không nói haven't to).".
  - items:
    - `-c1` type "My mother ___ (have to) get up at five every day." → `has to`;
    - `-c2` choice "We have a lot of food. ___ bring any." [You don't have to · You mustn't · You doesn't have to] → You don't have to;
    - `-c3` type "Đổi sang câu hỏi: He has to work on Sunday." → "Does he have to work on Sunday?";
    - `-c4` type "Dịch sang tiếng Anh: Tối qua tôi không ngủ được. (sleep, last night)" → "I couldn't sleep last night." · accept "Last night I couldn't sleep.";
    - `-c5` choice "Excuse me. ___ you tell me the way to the station, please?" [Could · Do · Are] → Could;
    - `-c6` type "Dịch sang tiếng Anh: Cho tôi một cốc trà. (would like, a cup of tea, please)" → "I would like a cup of tea, please." · accept "I'd like a cup of tea, please.";
    - `-c7` type "Two years ago, my son ___ (can / not / read)." → `couldn't read`.
  - easier:
    - `-e1` choice "She ___ wear a uniform at work." [has to · have to · must to] → has to;
    - `-e2` choice "___ some tea? — Yes, please." [Would you like · Do you like · Are you like] → Would you like.
  - Mỗi câu có hint và explanation ngắn theo quy tắc trên. Bắt buộc có ý:
    - `-c1` sai "have to": "my mother = she → has to";
    - `-c2` sai You mustn't: "mustn't là cấm; không cần thì dùng don't have to";
    - `-c5`: Could you … lịch sự hơn Can you … (không nói Can là sai);
    - `-c3` sai "Has he to…": "have to mượn does";
    - `-c4` sai can't: "quá khứ → couldn't";
    - `-c6` sai "I want…": "đề yêu cầu would like (lịch sự)";
    - `-e2` sai Do: "Do you like tea? hỏi sở thích; mời thì Would you like…?".
  - apply:
    - promptVi "Nói 2 câu: một việc bạn phải làm mỗi tuần (have to / has to) và gọi một đồ uống thật lịch sự (I'd like …, please).";
    - sampleEn "I have to clean my room every Saturday. I'd like a glass of orange juice, please.";
    - speak:
      - `-say-1` "I have to get up early tomorrow." / "Mai tôi phải dậy sớm.";
      - `-say-2` "Could you help me, please?" / "Bạn giúp tôi được không ạ?";
      - `-say-3` "I'd like two tickets, please." / "Cho tôi hai vé.".

**Golden chấm (bảng I/O):**
- `-c1`: "has to" đúng; "have to" sai.
- `-c3`: "does he have to work on sunday" đúng; "Has he to work on Sunday?" sai.
- `-c4`: "I couldn't sleep last night", "Last night I could not sleep" đúng; "I can't sleep last night." sai.
- `-c6`: "I'd like a cup of tea please", "I would like a cup of tea, please." đúng; "I want a cup of tea, please." sai.

Câu khối và thẻ không trùng nguyên văn đề quiz cùng bài, câu O.W.L. hay ví dụ của thì. Nếu test trùng câu, phạm vi chữ hay dấu hiệu bài sau báo đỏ thì đổi chữ của câu (giữ id, giữ ý, giữ golden), không nới luật.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: đều qua.
- `npm run vocab:label-examples && git diff --exit-code scripts/vocab/example-labels.json` -- expected: in "0 todo", file không đổi.
- `npm run layout:guard` -- expected: không báo class mới hay class bị xoá. Story này không sửa component; có báo thì ghi danh sách vào Implementation Notes.
- `npm run layout:check` -- expected: mọi route `ok` ở 5 bề rộng. Ảnh 375px chỉ có thể lệch ở route bài s1-t4-w1 nếu bộ chụp có. Lỗi probe phím tắt F01 có sẵn từ HEAD trước (story 41, 43, 44) thì ghi lại, không sửa ở story này.

**Manual checks (if no CLI):**
- Chrome headless 375px và 1280px, `VITE_SUPABASE_*` rỗng, trang bài s1-t4-w1:
  - thẻ MODALS có tên mới và dòng công thức 4; khối mới hiện sau khối luyện của MODALS;
  - mở khối luyện mới thì khối luyện MODALS đóng; câu `-c4`, `-c6` hiện ô gõ, gõ đáp án golden thì đúng;
  - `scrollWidth` bằng bề rộng sau khi mở mọi khối.
