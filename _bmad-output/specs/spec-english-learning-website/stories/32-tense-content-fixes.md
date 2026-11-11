---
title: 'Sửa lỗi nội dung thì: has gone, gấp đôi phụ âm, to be không mượn did, "…chưa?", can ở T3-W1 (CAP-11, CAP-23, learning-rules "Chỉ dùng kiến thức đã dạy")'
type: 'bugfix'
created: '2026-11-11'
status: 'done'
baseline_commit: 'bd8cfca901a6a479e74e9c36176666bb2d48b494'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/27-t1-patch-untaught-question-filter.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời "hoàn thiện giúp tôi đi" ngày 2026-11-11 sau báo cáo kiểm tra "nền & các thì": làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Mục tiêu đợt này là Huy **tự làm ra** câu đúng thì. Story 32 làm trước vì hiện app đang dạy sai ở 2 chỗ, nên sửa ngay, chi phí rẻ.
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn; chỉ dùng kiến thức đã dạy; giao diện 375px không đổi.
- Claude chọn:
  - **F17 (has gone):** câu "She has gone." bị bỏ khỏi nhóm Quá khứ của f17-c1. Bài xếp áp dụng f17-a1 có thêm nhóm thứ 4 "Đi với have / has (học kỹ ở T3)" để chứa `gone`. Nhờ vậy vẫn đủ 5 dạng của go. Phần giải thích và ví dụ so sánh ghi rõ: has gone không phải quá khứ, nó nối việc đã xảy ra với bây giờ. Ở T3-W3 thêm một lỗi hay mắc để phân biệt been to và gone to.
  - **Gấp đôi phụ âm** (hiện tại tiếp diễn và quá khứ đơn): chỉ gấp đôi khi từ một âm tiết tận cùng bằng 1 chữ nguyên âm + 1 chữ phụ âm. Từ hai âm tiết nhấn âm đầu thì không gấp đôi (visit, listen, open); nhấn âm cuối thì vẫn gấp đôi (begin, prefer). Không gấp đôi w, x, y. Có hai chữ nguyên âm thì không gấp đôi (rain → rained).
  - **to be không mượn did:** viết vào quy tắc thứ 3 của PAST_SIMPLE, theo đúng mẫu T1 (`t1-grammar.ts:117`). Câu chữ: "Were you tired? (không phải Did you be tired?)". Bài to be quá khứ đầy đủ để story 33 làm.
  - **"…chưa?":** PERFECT_VS_PAST có thêm một lỗi hay mắc "Have you called him yesterday?". Câu ví dụ và câu luyện nói bắt đầu bằng Did không được dịch thành "…chưa?" nữa.
  - **can ở T3-W1:** câu luyện nói `s1-t3-w1-say-3` và câu nghe `q-s1-t3-w1-06` chuyển sang will / won't, vì can mở ở s1-t4-w1 (`function-words.ts:87`). Bảng dạng yếu vẫn giữ dòng "can /kən/", vì ô Phát âm của lộ trình phải khớp md ("Dạng yếu: to, of, and, can, a") và chính dòng đó đã giải nghĩa can.
  - Giữ nguyên mọi id: id câu, id màn, id thẻ và id câu luyện nói.

**Problem:** App đang dạy sai ở 2 chỗ:
- F17 xếp "She has gone" vào nhóm Quá khứ.
- Quy tắc gấp đôi phụ âm thiếu điều kiện, làm theo thì sẽ viết ra "visitted", "listenned".

Ngoài ra còn 3 chỗ dễ dẫn tới câu sai:
- Quy tắc "mượn did" không ghi ngoại lệ cho to be, nên dễ suy ra "Did you be…?".
- Did và Have đều được dịch thành "…chưa?".
- T3-W1 dùng can trước bài modal.

**Approach:** Chỉ sửa dữ liệu (`f17.ts`, `t2-t4-grammar.ts`, `t2-t4-pronunciation.ts`, `t2-t4.ts`). Mỗi lỗi có một test bảo vệ để không quay lại. Không đổi kiểu dữ liệu, không đổi giao diện, không đổi store.

## Boundaries & Constraints

**Always:**
- Mỗi Tense vẫn đúng 3 quy tắc và 4–6 câu ví dụ (`lessons.test.ts:191-193`). Nội dung mới viết gộp vào câu chữ hiện có, không thêm dòng quy tắc.
- F17 vẫn qua test cũ (`foundation.test.ts:274-279`): có ít nhất một bài xếp chỉ gồm 3 vùng thời gian, và các bài xếp có đủ go / goes / going / went / gone. Câu tiếng Anh của F17 chỉ dùng F01–F17 (luật hàng C–D).
- Câu tiếng Anh mới chỉ dùng kiến thức đã dạy tới bài đó. Câu dịch tiếng Việt tự nhiên. Không đỏ, không chữ "trượt".
- `q-s1-t3-w1-06` vẫn là câu nghe: tag `nghe`, 4 lựa chọn khác nhau, đáp án đứng đầu, `audioText` bằng đáp án.

**Never:**
- Không làm việc của story sau: Tense to be quá khứ và Wh + did (33), F06 (34), `practice` và dạng câu gõ (35–37), khối "Đừng dịch từng chữ" và ghi chú "đã = V2" ở f17 worked (39), `requires` cho câu T2–T4 (47).
- Không sửa `catalog.ts`, `stage-1.ts`, `lo-trinh-toeic-12-thang.md`, bảng `WEAK_FORMS`, mục ôn tổng "Dạng yếu…can /kən/", `function-words.ts`, prompt roleplay.
- Không đổi kiểu `Tense` / `CheckItem`, không đổi component, không thêm class. Không bump store, không đổi sync / backup.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| F17 xếp câu | Mở f17-c1 | Nhóm Quá khứ chỉ có câu với went. Không còn "She has gone." Giải thích không gọi has gone là Quá khứ | N/A |
| F17 áp dụng | Mở f17-a1, xếp đúng | 4 nhóm. `gone` nằm ở "Đi với have / has (học kỹ ở T3)". Giải thích nói gone luôn đi với have / has và nối với bây giờ | Xếp `gone` vào Quá khứ thì bị chấm sai như mọi lần xếp sai khác, có Gợi ý |
| F17 đã xong từ trước | Store có F17 đã xong, có thẻ f17-rule-1/2 | Trạng thái xong và thẻ SRS giữ nguyên, vì id không đổi | N/A |
| -ing | Đọc quy tắc 2 của PRESENT_CONTINUOUS | Có các ví dụ run → running, visit → visiting, snow / fix / play + -ing, begin → beginning | N/A |
| -ed | Đọc quy tắc 2 của PAST_SIMPLE | Có các ví dụ stop → stopped, visit → visited, listen → listened, rain → rained, play → played, prefer → preferred | N/A |
| to be + did | Đọc quy tắc 3 của PAST_SIMPLE | Có "Were you tired? (không phải Did you be tired?)" | N/A |
| "…chưa?" | Mọi câu ví dụ / câu luyện nói bắt đầu bằng "Did" | Câu dịch không có "chưa". PERFECT_VS_PAST có lỗi "Have you called him yesterday?" → "Did you call him yesterday?" | N/A |
| T3-W1 | Câu luyện nói, câu quiz của s1-t3-w1, Tense WILL | Không có can / can't / cannot. Bảng dạng yếu vẫn có dòng can | N/A |
| Sổ lỗi cũ | Có lỗi `q-s1-t3-w1-06` | `getQuestion` trả câu đã viết lại (will / won't) | N/A |

</frozen-after-approval>

## Code Map

- `src/data/foundation/bricks/f17.ts` -- màn explain (:12-16), ví dụ so sánh "She has gone." (:30), f17-c1 (:57-71), f17-a1 (:142-154). f17-c5 ("She has ___.") đã đúng, giữ nguyên.
- `src/data/foundation/foundation.test.ts:274-279` -- test bài xếp của F17 (`ZONES`, đủ 5 dạng); `:288-330` luật từ của hàng C–D (`rowCdForbiddenIn`).
- `src/components/foundation/CheckItemView.tsx:250-300` -- giao diện bài xếp, vẽ được nhóm thứ 4 (F07 đã có bài 4 nhóm). Chỉ đọc.
- `src/data/lessons/t2-t4-grammar.ts` -- PRESENT_CONTINUOUS quy tắc 2 (:30); PAST_SIMPLE quy tắc 2–3 (:63-64), ví dụ "Did you finish your work?" (:71); PRESENT_PERFECT `mistakes` (:207-211); PERFECT_VS_PAST `mistakes` (:239-243).
- `src/data/lessons/t1-grammar.ts:117` -- câu mẫu ngoại lệ to be với do / does. Chỉ đọc, dùng làm khuôn câu chữ.
- `src/data/lessons/t2-t4-pronunciation.ts` -- `WEAK_FORMS` (:142-155, giữ nguyên); `s1-t2-w2-say-4` (:311); `s1-t3-w1-say-3` (:344).
- `src/data/questions/t2-t4.ts:144-145` -- `t3w1.listen(6, …)` = `q-s1-t3-w1-06`.
- `src/data/lessons/lessons.test.ts:186-200`, `src/data/questions/questions.test.ts:43-62` -- ràng buộc số quy tắc, số ví dụ và câu nghe hiện có.
- `src/data/vocab/function-words.ts:87` -- `ngsl-can` mở ở `s1-t4-w1`. Đây là lý do bỏ can khỏi T3-W1.
- `src/lib/subs/lesson.ts:18` -- tô sáng phụ đề lấy `examples.en`. Đổi câu ví dụ không ảnh hưởng gì khác.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/bricks/f17.ts` -- sửa nội dung F17, giữ nguyên mọi id:
  - explain: thay câu về gone bằng "gone đi với have / has: She has gone (cô ấy đã đi, giờ không ở đây). has gone không xếp vào Quá khứ: nó nối việc đã xảy ra với bây giờ, học kỹ ở T3."; giữ "không có to" trong định nghĩa động từ nguyên mẫu;
  - ví dụ so sánh :30: phần vi bỏ "(Quá khứ: …)", thay bằng "(have / has + gone: nối việc đã đi với bây giờ, học kỹ ở T3)";
  - f17-c1: nhóm Quá khứ là `['I went to Hue.', 'We went home.']`; sửa hint và giải thích, bỏ "has gone";
  - f17-a1: thêm nhóm `{ label: 'Đi với have / has (học kỹ ở T3)', items: ['gone'] }`, nhóm Quá khứ chỉ còn `went`; viết lại giải thích; sửa chú thích đầu file.
- [x] `src/data/foundation/foundation.test.ts` -- thêm test cho F17:
  - không nhóm 'Quá khứ' nào trong mọi bài xếp chứa token `gone`;
  - có một nhóm chứa `gone` mà nhãn có "have / has";
  - ví dụ so sánh có en "She has gone." thì vi không chứa "Quá khứ".
- [x] `src/data/lessons/t2-t4-grammar.ts` -- sửa nội dung bài thì (chữ mẫu ở Design Notes):
  - viết lại quy tắc gấp đôi của PRESENT_CONTINUOUS và PAST_SIMPLE;
  - quy tắc 3 của PAST_SIMPLE thêm ngoại lệ was / were;
  - ví dụ thứ 5 của PAST_SIMPLE → `{ en: 'Did you finish your work yesterday? — Yes, I did.', vi: 'Hôm qua bạn có làm xong việc không? — Có.' }`;
  - PRESENT_PERFECT thêm lỗi been to / gone to;
  - PERFECT_VS_PAST thêm lỗi "…chưa?".
- [x] `src/data/lessons/t2-t4-pronunciation.ts` -- sửa câu luyện nói:
  - `s1-t2-w2-say-4`: thêm mốc → "Did you finish the activity yesterday?", vi "Hôm qua bạn có làm xong hoạt động đó không?";
  - `s1-t3-w1-say-3` → `{ text: 'I will help you tomorrow.', vi: 'Ngày mai tôi sẽ giúp bạn.' }`.
- [x] `src/data/questions/t2-t4.ts` -- viết lại `t3w1.listen(6, …)`:
  - lựa chọn: `["I'll help you tomorrow.", "I won't help you tomorrow.", "I'll help you today.", 'I want to help you tomorrow.']`;
  - giải thích: "I'll đọc liền một tiếng /aɪl/. won't /woʊnt/ đọc rõ và được nhấn; want /wɑːnt/ khác won't ở nguyên âm, và to sau want đọc yếu /tə/. Nghe kỹ cả từ cuối: tomorrow hay today.".
- [x] `src/data/lessons/lessons.test.ts` -- thêm test:
  - quy tắc của PRESENT_CONTINUOUS và PAST_SIMPLE có "visit →" và "w, x, y", không còn câu cũ ("sau một nguyên âm ngắn", "một nguyên âm ngắn + phụ âm thì gấp đôi");
  - quy tắc của PAST_SIMPLE có "không phải Did you be";
  - trong mọi bài, câu ví dụ của Tense và câu luyện nói có en khớp `/^Did\b/` thì vi không chứa "chưa";
  - PERFECT_VS_PAST có lỗi với `right` bắt đầu bằng "Did you" và `why` chứa "chưa";
  - PRESENT_PERFECT có lỗi chứa "been to";
  - câu luyện nói `s1-t3-w1` và Tense `will` (formulas, rules, examples, mistakes) không khớp `/\bcan(not|'t)?\b/i`.
- [x] `src/data/questions/questions.test.ts` -- thêm test cho câu quiz T3-W1:
  - câu quiz `s1-t3-w1` (đề, lựa chọn, giải thích) không khớp `/\bcan(not|'t)?\b/i`;
  - `getQuestion('q-s1-t3-w1-06')` có `kind` là `listening` và `answer` là "I'll help you tomorrow.".

**Acceptance Criteria:**
- Given Huy mở `#/foundation/F17` ở 375px, when làm tới bài xếp áp dụng, then thấy 4 nhóm xuống dòng gọn, không cuộn ngang, và xếp đúng thì được chấm đúng.
- Given Huy mở bài `s1-t2-w1`, `s1-t2-w2`, `s1-t3-w3`, `s1-t3-w4`, when đọc TenseCard, then thấy quy tắc và lỗi hay mắc mới. Bố cục thẻ vẫn như trước.
- Given Huy mở `s1-t3-w1`, when xem đoạn Phát âm, then bảng dạng yếu vẫn có dòng can, còn câu luyện nói chỉ dùng will / won't.

## Implementation Notes

- **F17** (`f17.ts`): giữ mọi id. Màn explain viết lại cho vừa giới hạn 40–80 chữ (test `giải thích 40–80 chữ`): câu về has gone theo Tasks; để đủ chỗ, bỏ "trong từ điển", "Giờ chỉ cần nhận ra" và gộp "goes với he, she, it" thành "goes (he / she / it)" (79 chữ). Cụm "động từ nguyên mẫu" vẫn còn cho chip thuật ngữ. Ví dụ so sánh "She has gone." tách thành object nhiều dòng (vi dài). f17-c1 vẫn chỉ 3 vùng nên test `ZONES` cũ vẫn qua; f17-a1 có nhóm thứ 4 và `promptVi`/`prompt` đổi "3 vùng thời gian" → "đúng nhóm". Chú thích đầu file sửa theo.
- **Bài thì** (`t2-t4-grammar.ts`): quy tắc gấp đôi lấy đúng chữ mẫu Design Notes; quy tắc 3 PAST_SIMPLE nối thêm câu was / were vào cùng dòng (vẫn 3 quy tắc). Ví dụ 5 PAST_SIMPLE thêm "yesterday" và vi không còn "chưa". PRESENT_PERFECT thêm lỗi been to / gone to, PERFECT_VS_PAST thêm lỗi "…chưa?" (chữ mẫu Design Notes).
- **Câu luyện nói** (`t2-t4-pronunciation.ts`): `s1-t2-w2-say-4` thêm "yesterday", đổi vi; `s1-t3-w1-say-3` → will. `WEAK_FORMS` không đụng.
- **Quiz** (`t2-t4.ts`): `q-s1-t3-w1-06` viết lại, id / tag / kind giữ nguyên, đáp án vẫn đứng đầu nên `audioText` = đáp án.
- **Test mới:** `foundation.test.ts` (F17: gone không ở nhóm Quá khứ, có nhóm "have / has" chứa gone, vi của "She has gone." không có "Quá khứ"); `lessons.test.ts` describe "sửa lỗi nội dung thì (story 32)" (gấp đôi, Did you be, Did ≠ "chưa" trên mọi ví dụ Tense + câu luyện nói của `pronunciation.sentences` và `parts`, 2 lỗi mới, T3-W1 / Tense will không có can); `questions.test.ts` describe "T3-W1 chưa dùng can (story 32)".
- **Kiểm tra:** `npm run lint`, `npm test` (75 file, 1752 test), `npm run build`, `npm run layout:guard` (không class nào đổi) đều qua. `npm run layout:check -- --skip-diff` qua mọi route × 5 bề rộng. Chưa bấm tay tới màn Áp dụng của F17 ở 375px (route F17 không có trong bộ layout:check); bài xếp dùng cùng component với F07 (đã có 4 nhóm), nút nhóm `whitespace-normal` + `flex-wrap`, lưới 1 cột dưới `sm`, nên nhãn dài "Đi với have / has (học kỹ ở T3)" xuống dòng được.

## Spec Change Log

- **2026-11-11, review lượt 1 (patch, không loopback).**
  - Finding kích hoạt: quy tắc gấp đôi phụ âm (Design Notes) thiếu "hai nguyên âm thì không" ở -ing, viết "nguyên âm / phụ âm" mà không nói là chữ (F04 dạy nguyên âm là âm), và vế "nhấn âm cuối thì có" đọc như mọi từ hai âm tiết nhấn cuối đều gấp đôi (repeat → "repeatted"); `s1-t2-w2-say-4` không có mốc thời gian, trái lỗi mới ở PERFECT_VS_PAST; câu nghe `q-s1-t3-w1-06` mới không còn luyện dạng yếu của tuần.
  - Đã sửa (ngoài frozen): chữ mẫu Design Notes được viết lại trong code thành "1 chữ nguyên âm (a, e, i, o, u) + 1 chữ phụ âm", thêm "hai chữ nguyên âm thì không (eat → eating, rain → raining / rain → rained, need → needed)", và "Từ hai âm tiết có đuôi như vậy: …". Đủ mọi điều kiện và ví dụ trong Matrix. Tasks: `s1-t2-w2-say-4` thêm "yesterday" (thay "giữ câu Anh"); giải thích câu nghe thêm "to sau want đọc yếu /tə/"; quy tắc 3 PAST_SIMPLE thêm vế phủ định "I wasn't tired (không phải I didn't be tired)"; F17 explain dùng "không xếp vào Quá khứ" thay "không phải quá khứ" (cùng nghĩa với Intent: has gone không thuộc vùng Quá khứ, việc đi vẫn đã xảy ra) và lấy lại "không có to"; lỗi been to / gone to bỏ vế "không phải quá khứ đơn", thay bằng lý do dùng twice.
  - Trạng thái xấu tránh được: người học suy ra "rainning", "eatting", "repeatted", hiểu has gone là việc chưa xảy ra, hay nghĩ "to go" là động từ nguyên mẫu.
  - KEEP: mọi id; câu Matrix "Were you tired? (không phải Did you be tired?)"; nhóm thứ 4 của f17-a1; WEAK_FORMS và dòng can giữ nguyên; không đụng `catalog.ts`.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | Blind | `words.json:397` ngsl-receive còn "Did you receive my email?" → "…chưa?" | false | `example-overrides.json` đã thay câu này bằng "I receive many emails every day."; `loadWords()` áp override. Quét toàn bộ câu hiệu lực: chỉ `ngsl-notice` bắt đầu bằng Did, dịch "…không?". | reject |
| 2 | Blind | Test Did/chưa và can bỏ qua `blocks` (shadowing, dictation…) | low | Hiện không có câu Did hay can nào trong block T2–T4 (block T3-W1 chỉ có WEAK_FORMS, spec giữ). Lỗ hổng chỉ là test. | patch: test Did quét thêm `shadowing.lines` và `dictation.items` |
| 3 | Blind | Quy tắc -ing thiếu "hai nguyên âm thì không" | medium | `t2-t4-grammar.ts:30` không có vế này, trong khi quy tắc -ed có; Intent yêu cầu điều kiện hai nguyên âm. Đọc theo chữ thì rain → "rainning". | patch |
| 4 | Blind | Ngoại lệ was/were chỉ có dạng hỏi, thiếu phủ định | low | Quy tắc 3 nói "Hỏi và phủ định" nhưng ví dụ chỉ có Were you…?. | patch: thêm "I wasn't tired (không phải I didn't be tired)" |
| 5 | Blind | Thiếu ghi chú travel/cancel Mỹ–Anh | low | Không có ví dụ -l nào trong quy tắc; app theo chuẩn Mỹ (ETS). Thêm ghi chú làm quy tắc dài thêm, lợi ích nhỏ. | reject |
| 6 | Blind | vi ví dụ so sánh F17 lặp "giờ không còn ở đây" | low | `f17.ts:32` lặp đúng như mô tả. | patch: "(have / has + gone: nối việc đã đi với bây giờ, học kỹ ở T3)" |
| 7 | Blind | Explain F17 bỏ "không có to" khỏi định nghĩa nguyên mẫu | medium | Câu cũ có "không có to"; chip thuật ngữ T1 mở viên này; "to go" là lỗi phổ biến. | patch: lấy lại "không có to", bỏ "trong từ điển" và "Giờ chỉ cần nhận ra", 79 chữ |
| 8 | Blind | `catalog.ts:158` goalVi còn "go/goes/going/went/gone trên trục thời gian" | low | Đúng nguyên văn; spec cấm sửa `catalog.ts`. | defer (story 47) |
| 9 | Blind | Test F17 so nhãn `=== 'Quá khứ'` | low | Đổi nhãn sẽ làm vòng lặp rỗng và test qua lặng lẽ. | patch: `startsWith('Quá khứ')` |
| 10 | Blind | Test "Did you be" yếu | low | `toContain('Did you be')` qua cả khi câu thành ví dụ đúng. | patch: `toContain('không phải Did you be')` |
| 11 | Blind | `toHaveLength(6)` cho quiz s1-t3-w1 dễ gãy ở story 35–42 | low | Test này không cần số câu để chặn can. | patch: `toBeGreaterThan(0)` |
| 12 | Blind | q-s1-t3-w1-06 mới không còn luyện dạng yếu | medium | T3-W1 là tuần dạng yếu; giải thích mới chỉ nói I'll và won't/want. | patch: thêm "to sau want đọc yếu /tə/" |
| 13 | Blind | Chưa kiểm tay F17 ở 375px (Verification, Acceptance) | medium | Implementation Notes tự ghi chưa bấm tới màn Áp dụng; route F17 không có trong layout:check. Đọc code: nút nhóm `whitespace-normal` trong `flex-wrap`, lưới nhóm 1 cột dưới `sm` (`CheckItemView.tsx`), cùng component với F07 4 nhóm. Không tự động được ở đây vì phải làm qua màn check. | humanCheck: Huy bấm tay |
| 14 | Edge | -ing: hai âm tiết nhấn cuối nhưng không tận cùng 1 nguyên âm + 1 phụ âm (collect, explain) | medium | Vế "nhấn âm cuối thì có" đứng sau dấu chấm phẩy, không nói vẫn cần đuôi 1 + 1. | patch: "Từ hai âm tiết có đuôi như vậy: …" |
| 15 | Edge | -ed: cùng lỗi trên (collectted, repeatted) | medium | Cùng gốc với #14 ở `t2-t4-grammar.ts:63`. | patch (cùng #14) |
| 16 | Edge | Sổ lỗi cũ của q-s1-t3-w1-06 có `lastChosen` không còn trong lựa chọn | low | `MistakeCard.tsx:155` hiện `lastChosen` nguyên văn. Chỉ xảy ra nếu đã sai câu này; Huy chưa học tới T3, chưa chứng minh có trạng thái này. Sửa cần migration store, spec cấm. | defer (chung cho mọi câu viết lại) |
| 17 | Edge | `lastChosen` "I will help you tomorrow." hiện là lựa chọn sai dù nghĩa giống đáp án mới | low | Cùng gốc với #16. | defer (cùng #16) |
| 18 | Edge | Test không quét câu ví dụ bộ từ bắt đầu bằng Did | false | Câu hiệu lực của bộ từ không có Did → "chưa" (xem #1); không có lỗi hiện tại. | reject |
| 19 | Edge | `words.json:397` vẫn dạy Did = "…chưa?" | false | Override đã thay (xem #1). | reject |
| 20 | Edge | -ing thiếu vế hai nguyên âm | medium | Trùng #3. | patch (cùng #3) |
| 21 | Vgap | -ing thiếu vế hai nguyên âm; test chỉ kiểm "visit →" và "w, x, y" | medium | Trùng #3; test cũ không bắt. | patch: test thêm "chữ nguyên âm (a, e, i, o, u)", "hai chữ nguyên âm thì không", "rain →", "Từ hai âm tiết có đuôi như vậy" cho cả hai quy tắc |
| 22 | Content | "nguyên âm / phụ âm" có thể hiểu là âm (F04 dạy âm) | medium | `f04.ts:12` dạy nguyên âm là âm; spec ghi "1 chữ nguyên âm" nhưng câu quy tắc bỏ chữ "chữ". Theo âm thì eat, look, need đều là 1 + 1. | patch: "1 chữ nguyên âm (a, e, i, o, u) + 1 chữ phụ âm" |
| 23 | Content | Vế "nhấn âm cuối thì có" không nói vẫn cần đuôi 1 + 1 | medium | Trùng #14. | patch (cùng #14) |
| 24 | Content | F17 "has gone không phải quá khứ" lẫn thời gian với thì | low | Cùng câu có "cô ấy đã đi" và "nối việc đã xảy ra", nên ít khả năng hiểu sai, nhưng chữ "Quá khứ" ở F17 là tên nhóm. | patch: "không xếp vào Quá khứ" (explain, chú thích đầu file) |
| 25 | Content | `s1-t2-w2-say-4` không có mốc, trái lỗi mới ở PERFECT_VS_PAST | medium | "Did you finish the activity?" là đúng loại câu mà lỗi mới bảo dùng Have; ví dụ 5 PAST_SIMPLE đã được thêm yesterday vì cùng lý do. Intent không cấm đổi câu Anh; id giữ. | patch: thêm "yesterday" (Change Log) |
| 26 | Content | `words.json:397` còn "…chưa?" | false | Trùng #1. | reject |
| 27 | Content | Nội dung T3-W1 mới không còn luyện dạng yếu | medium | Trùng #12 cho câu nghe. Câu nói say-3 không có dạng yếu, nhưng say-1/2/4 đã có at, of, and, a, to. | patch câu nghe (cùng #12); giữ say-3 |
| 28 | Content | "Nghe cả tomorrow hay today." không tự nhiên | low | Câu khó hiểu. | patch: "Nghe kỹ cả từ cuối: tomorrow hay today." |
| 29 | Content | Từ ví dụ chính tả vượt mức từ (prefer, snow, fix, rain, listen) | low | Đây là ví dụ chính tả, không phải câu; Intent (frozen) chỉ định đúng các ví dụ visit, listen, begin, prefer, rain, w/x/y. | reject |
| 30 | Content | "Were you tired?" dùng đảo câu chưa dạy; nên viết "Với to be (was / were)" | low | Suy ra được từ Are you…? của T1; chữ "to be" làm rõ ngoại lệ. | patch: "Với to be (was / were)" |
| 31 | Content | Lỗi been to / gone to có vế cuối lạc đề | low | "has gone không phải quá khứ đơn" không giúp phân biệt been/gone. | patch: thay bằng "…chưa về. Nói đã từng tới mấy lần (twice) thì dùng been to." |
| 32 | Content | Giải thích lỗi "…chưa?" ngầm cho rằng câu không mốc phải dùng Have | low | Câu giải thích không gọi Did không mốc là sai; say-4 giờ đã có mốc (#25). | reject |
| 33 | Content | F17 "tiếng Anh đổi động từ, gọi là thì" không rõ | low | Câu cũ "mỗi cách đổi gọi là một thì" rõ hơn. | patch: "mỗi cách đổi là một thì" |
| 34 | Content | vi ví dụ so sánh F17 lặp ý | low | Trùng #6. | patch (cùng #6) |
| 35 | Content | Nhãn nhóm f17-a1 lộ đáp án; `go` đứng một mình bị xếp cứng vào Thói quen | low | Nhãn "Đi với have / has" là thiết kế Intent chọn. `go` vào Thói quen có từ trước, không do diff. | defer (phần go, có từ trước); nhãn giữ |
| 36 | Content | WEAK_FORMS T3-W1 vẫn có "I can swim." | false | Intent giữ cố ý dòng can trong bảng dạng yếu; không phải lỗi. | reject |

## Design Notes

Chữ mẫu cho quy tắc gấp đôi (được viết gọn lại, nhưng phải giữ đủ các điều kiện và các ví dụ trong Matrix; đã cập nhật theo review lượt 1, xem Spec Change Log):

```ts
// PRESENT_CONTINUOUS, quy tắc 2
'Thêm -ing: bỏ e câm (make → making); ie → ying (lie → lying). Gấp đôi phụ âm cuối khi từ một âm tiết tận cùng 1 chữ nguyên âm (a, e, i, o, u) + 1 chữ phụ âm (run → running, sit → sitting), hai chữ nguyên âm thì không (eat → eating, rain → raining). Từ hai âm tiết có đuôi như vậy: nhấn âm đầu thì không (visit → visiting, listen → listening), nhấn âm cuối thì có (begin → beginning). Không gấp đôi w, x, y (snow → snowing, fix → fixing, play → playing).'
// PAST_SIMPLE, quy tắc 2
'Chính tả -ed: tận cùng e thì thêm -d (live → lived); phụ âm + y thì đổi -ied (study → studied). Gấp đôi phụ âm cuối khi từ một âm tiết tận cùng 1 chữ nguyên âm (a, e, i, o, u) + 1 chữ phụ âm (stop → stopped, plan → planned), hai chữ nguyên âm thì không (rain → rained, need → needed). Từ hai âm tiết có đuôi như vậy: nhấn âm đầu thì không (visit → visited, listen → listened, open → opened), nhấn âm cuối thì có (prefer → preferred). Không gấp đôi w, x, y (play → played, fix → fixed).'
// PERFECT_VS_PAST, lỗi mới
{ wrong: 'Have you called him yesterday?', right: 'Did you call him yesterday?', why: 'Tiếng Việt hỏi cả hai kiểu bằng "…chưa?". Chữ "chưa" không quyết định thì: có mốc đã xong (yesterday) thì dùng Did you …?; không có mốc, hỏi tính tới bây giờ ("Bạn gọi anh ấy chưa?") thì dùng Have you called him (yet)?' }
// PRESENT_PERFECT, lỗi mới
{ wrong: 'She has gone to Japan twice.', right: 'She has been to Japan twice.', why: 'been to = đã từng tới rồi về; gone to = đã đi và giờ đang ở đó, chưa về. Nói đã từng tới mấy lần (twice) thì dùng been to.' }
```

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run layout:guard` -- expected: pass, không có class nào đổi.

**Manual checks:**
- Chrome headless ở 375px, mở `#/foundation/F17` (bài xếp 4 nhóm), các bài `s1-t2-w1`, `s1-t2-w2`, `s1-t3-w1`, `s1-t3-w3`, `s1-t3-w4`, và `#/practice/quiz/lesson-s1-t3-w1`. Expected: `scrollWidth` bằng 375, chữ mới hiện đúng.
