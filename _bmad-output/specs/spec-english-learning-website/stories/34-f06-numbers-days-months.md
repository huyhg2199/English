---
title: 'F06 đầy đủ: số, thứ, tháng (CAP-23, learning-rules "Sân ga 9¾", "Thẻ quy tắc", "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: '0f2bee1c9d8a8c71ef03b039f3ceb1683bfa16be'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/20-row-a-content-placement-quizzes.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/24-srs-function-words-rule-cards-examples.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời "hoàn thiện giúp tôi đi" ngày 2026-11-11 sau báo cáo kiểm tra "nền & các thì", tức là làm hết story 32–47. Thứ tự do Claude đề xuất: 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Mục tiêu của đợt: Huy **tự làm ra** được câu đúng, không chỉ nhận ra. Số, thứ, tháng là nền cho TOEIC Part 1–3 (giờ, giá, ngày hẹn). Hiện F06 hứa "Số 0–100, thứ, tháng" (`catalog.ts:59`) nhưng chưa dạy thật (báo cáo kiểm tra, mục C6).
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn; chỉ dùng kiến thức đã dạy; giao diện 375px không đổi ngoài phần mới; store đổi schema thì phải bump version (story này không bump).
- Claude chọn:
  - **Mở rộng F06, không thêm viên F06b.** Giữ 18 viên, giữ id khái niệm, tiến độ và thứ tự màn. Không thêm `ConceptId`: phần ghép số thuộc `numbers`, phần ngày tháng thuộc `days-months` + `ordinals`.
  - **Bảng tra nằm trong màn giải thích.** Màn `explain` có thêm trường `tables` (không bắt buộc). F06 có 6 bảng, mặc định đóng (`<details>`). Mỗi dòng có nút nghe, chữ tiếng Anh, nghĩa hoặc con số, và IPA kiểu Mỹ có dấu ˈ. Vì bảng nằm trong màn giải thích nên nó tự hiện ở "Xem lại giải thích" (dưới 60%), ở ngày lười và ở cột lý thuyết trên máy tính. 6 bảng gồm:
    - số 0–19;
    - số chục và 100;
    - 7 thứ;
    - 12 tháng;
    - số thứ tự cho ngày;
    - giờ, giá, số phòng.
  - **Ngày tháng kiểu Mỹ:** tháng trước, ngày sau, ngày đọc bằng số thứ tự ("May 3rd", đọc "May third"). Giới từ "on" vẫn do F18 dạy. F06 không dùng "on", còn F18 thêm một ví dụ "on May 3rd".
  - **"Thẻ SRS tự soạn" = thẻ quy tắc của F06:** giữ `f06-rule-1`, `f06-rule-2` y nguyên và thêm 6 thẻ `f06-rule-3` … `-8` (ghép số / forty, 2 thẻ thứ, 2 thẻ tháng, ngày tháng). NGSL không có các từ này nên không thêm thẻ từ, không đụng `words.json`. Riêng F06 được 8 thẻ, các viên khác vẫn 1–2 thẻ.
  - **Màn luyện:** thay 2 trong 5 câu check (ghép số 45, nói ngày 3 tháng 5), 1 câu dễ hơn (Thursday) và câu Áp dụng (ngày 21 tháng 6). Thêm 1 câu nói. Id câu giữ nguyên vị trí (`f06-c3`, `f06-c5`, `f06-e1`, `f06-a1` mang nội dung mới).
  - **Soát vé hàng A** thêm 2 câu `q-f06-03` (thứ), `q-f06-04` (ngày tháng). Hàng A có 12 câu, mỗi lần vẫn bốc 8. Lý do: Soát vé đạt thì F06 tính là đã dạy, nên đề phải hỏi được thứ và tháng.
  - F06 tăng từ 10' lên 12' (tổng Sân ga thành 150'). `goalVi` ghi đúng phần đã dạy, `title` giữ nguyên.

**Problem:** F06 không có bảng số, không có 7 thứ và 12 tháng, phần thứ chỉ có 1 câu (`f06-e1`). Trong khi đó F18, câu T1 và câu T2 đã dùng Sunday, Friday, July, in May, và khai báo `days-months` như kiến thức đã học. Người học không có chỗ nào để học và ôn những từ này, vì NGSL không chứa chúng.

**Approach:** Thêm bảng tra vào màn giải thích của viên (dữ liệu + một component bảng kiểu `IrregularVerbTable`). Soạn lại phần chữ F06 để dạy ghép số, thứ, tháng và ngày tháng. Thêm 6 thẻ quy tắc và 2 câu Soát vé. Test khoá lại nội dung bảng và việc khai báo `days-months`.

## Boundaries & Constraints

**Always:**
- F06 vẫn đúng 6 màn theo thứ tự, giải thích 40–80 chữ, check 2–5 câu (giữ 5), easier đúng 2, mỗi câu 3 lựa chọn khác nhau, có ≥ 1 câu listen, đúng 5 từ chủ đề như cũ (`ngsl-price`, `-money`, `-hour`, `-week`, `-month`). `uses` của câu chỉ là khái niệm của F01–F06.
- Câu tiếng Anh của F06 chỉ dùng hàng A: không dùng to be, have, do, khuyết thiếu, at / on / in chỉ thời gian. Chuỗi mẫu không có câu hoàn chỉnh. Ví dụ: "June 21st · 7:30" có, còn "My birthday is…" thì không.
- Bảng: mọi dòng có `en` chỉ gồm chữ, dấu cách, gạch nối, dấu nháy (TTS đọc thẳng), và `vi` không rỗng. Bảng số, thứ, tháng, số thứ tự thì mọi dòng có `ipa`: không có `/`, có ˈ khi từ có hơn một âm tiết, theo kiểu `words.json` (ɝː, ɚ, t̬). Thứ tự thứ là Monday → Sunday, thứ tự tháng là January → December.
- Giữ nguyên id SRS và chữ của `rule:f06-1`, `rule:f06-2` (lịch cũ chạy tiếp). Thẻ mới là key mới trong `srs.cards`: không bump schema, không thêm key đồng bộ.
- Giữ nguyên id và nội dung `q-f06-01`, `q-f06-02` (Sổ lỗi tham chiếu theo id). Câu mới: 4 lựa chọn, tag `từ vựng`, `sectionId: 'vocabulary'`, có `requires` chỉ gồm khái niệm F01–F06 và có ≥ 1 khái niệm của F06.
- Viên khác không có `tables`, giao diện không đổi. Bảng co theo 375px, không cuộn ngang. `layout:guard` chỉ được báo class của file mới `BrickTables.tsx`. Các file khác không thêm, không xoá class không tiền tố.

**Never:**
- Không làm việc của story sau:
  - lượng từ, There is phủ định / câu hỏi (43);
  - how many / how often (44);
  - test quay lại dùng câu Sân ga, `requires` cho câu T2–T4 cũ (47);
  - thẻ thì / động từ bất quy tắc (38).
- Không thêm viên, không đổi `BRICK_IDS`, `CONCEPT_IDS`, `teaches` / `uses` trong catalog, `FUNCTION_WORD_GATES`, `STARTER_WORD_IDS` (chỉ sửa comment), `words.json`, `example-overrides.json`.
- Không đổi `Question` / `QuestionKind`, `ROW_QUIZ_SIZE`, `MIN_PER_LESSON`, luật chấm Soát vé, store schema.
- Không chép bảng hay câu từ sách, web có bản quyền.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mở F06 ở 375px | `#/foundation/F06`, màn 1 | Đoạn giải thích mới và 6 bảng đóng sẵn: tiêu đề kèm số dòng, vd "Số 0–19 (20)". Mở một bảng thì thấy từng dòng: nút nghe · chữ + nghĩa · IPA, có ghi chú cuối bảng. `scrollWidth` = 375 | N/A |
| Không có TTS | `canSpeak()` false | Bảng vẫn có chữ và IPA, không có nút nghe (`ListenButton` trả null như `IrregularVerbTable`) | N/A |
| Máy tính | ≥ 1024px, đang ở màn 2+ của F06 | Cột "Lý thuyết của viên" có màn Giải thích kèm 6 bảng đóng, mở được. Enter khi đang focus `<summary>` chỉ mở/đóng bảng, không "Tiếp" (`hotkeys.ts` đã bỏ SUMMARY) | N/A |
| Viên khác | F01, F18… | Không có bảng, giao diện y cũ (ảnh `layout:check` của `/foundation/F01` không đổi) | N/A |
| Dưới 60% | Màn check F06 đúng lần đầu < 3/5, bấm "Xem lại giải thích" | Phần tóm tắt có cả 6 bảng | N/A |
| Xong F06 lần đầu | Học tới màn Áp dụng | Phiên ôn hôm đó có 8 thẻ mới `rule:f06-1` … `-8`, đứng sau từ mới. Quota từ mới không đổi | N/A |
| Đã xong F06 trước story 34 | `srs.cards` có `rule:f06-1`, `-2` | Phiên kế tiếp có thêm 6 thẻ mới `rule:f06-3` … `-8`. Thẻ 1–2 giữ lịch cũ | N/A |
| Không học viên | Hàng A qua bằng Soát vé / bỏ qua Sân ga | Không góp thẻ F06 (luật story 24) | N/A |
| Soát vé hàng A | `quiz-f-a`, 20 seed, có / không có TTS | 8 câu từ 12, không trùng, mỗi viên ≥ 1. Không có TTS thì không có câu nghe | N/A |
| Sổ lỗi cũ | Có lỗi `q-f06-01`, `q-f06-02` | `getQuestion` trả đúng câu cũ | N/A |
| Thẻ mồ côi | `srs.cards` có `rule:f06-9` | Không hiện, không đếm tồn ôn, vẫn nằm trong store | N/A |
| F18 | Màn so sánh F18 | Có ví dụ "on May 3rd" (đọc "on May third"). Luật ngữ pháp hàng C–D vẫn qua | N/A |
| Khai báo thiếu | Câu có `requires` / `uses` chứa tên thứ hoặc tháng mà không có `days-months` | Test báo đúng id câu | Sửa dữ liệu câu, không nới luật |

</frozen-after-approval>

## Code Map

- `src/data/foundation/types.ts:107-121` -- `Screen` kind `explain`. Thêm `BrickTableRow`, `BrickTable`, `tables?`.
- `src/data/foundation/bricks/f06.ts` -- toàn bộ nội dung F06 (màn, thẻ, từ chủ đề). Viết lại theo Design Notes.
- `src/data/foundation/bricks/f18.ts:24-32` -- `examples` của màn contrast: thêm 1 ví dụ.
- `src/data/foundation/catalog.ts:55-62` -- meta F06: đổi `minutes` 12, `goalVi`. `teaches` / `uses` giữ nguyên.
- `src/data/foundation/index.ts` -- export kiểu mới nếu cần cho component.
- `src/components/foundation/BrickScreen.tsx:30-32` -- `ExplainBody`. `BrickRecap` (:177) và `BrickTheoryRail` dùng lại `ExplainBody` / `BrickScreen`, không sửa.
- `src/components/lesson/IrregularVerbTable.tsx` -- mẫu bảng co 375px (`table-fixed`, `ListenButton size="sm"`). Chỉ đọc.
- `src/lib/hotkeys.ts:52` -- đã bỏ qua Enter trên SUMMARY. Chỉ đọc.
- `src/data/questions/foundation.ts` -- `ROW_A` (q-f06 ở :122-147), comment đầu file (10 câu mỗi hàng), `FOUNDATION_QUESTIONS` (:530, "40 câu").
- `src/data/foundation/foundation.test.ts` -- `englishTexts` (:81), test số thẻ quy tắc (:479), `describe.each` mỗi viên (:462).
- `src/data/foundation/foundation-catalog.test.ts:6-31` -- `MINUTES` và tổng 148.
- `src/data/questions/foundation.test.ts:77-150` -- chốt 40 câu, 10 câu mỗi hàng.
- `src/lib/flashcard-session.ts` `ruleStudyWords` -- lấy mọi `ruleCards` của viên xong. Không sửa, 8 thẻ tự vào.
- `src/data/vocab/starter-words.ts:7` -- comment nói F06 dạy số, thứ, tháng.
- `_bmad-output/specs/spec-english-learning-website/learning-rules.md:20, :67` -- bảng viên và dòng Thứ tự từ mới.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`. Không có test component.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/types.ts` -- thêm kiểu, mỗi kiểu có doc comment ghi story 34:
  - `BrickTableRow = { en: string; ipa?: string; vi: string }`;
  - `BrickTable = { id: string; title: string; noteVi?: string; rows: readonly BrickTableRow[] }`;
  - thêm `tables?: readonly BrickTable[]` vào kind `explain`.
- [x] `src/components/foundation/BrickTables.tsx` -- tạo mới `BrickTables({ tables })`. Mỗi bảng là một `<details>`, đóng sẵn:
  - `<summary>` ghi "{title} ({rows.length})";
  - bên trong là `<table className="w-full table-fixed …">` theo mẫu `IrregularVerbTable`, 3 cột: nút nghe (`ListenButton text={en} size="sm" rate={0.85}`) · `en` đậm (`lang="en"`) với `vi` nhỏ bên dưới · IPA `/ipa/` (`font-mono`, ô trống nếu không có);
  - `noteVi` nằm dưới bảng (text-xs, muted);
  - mọi ô có `break-words`.
- [x] `src/components/foundation/BrickScreen.tsx` -- `ExplainBody` vẽ thêm `<BrickTables>` dưới đoạn chữ khi `screen.tables?.length`. Không thêm hay đổi class ở file này (bọc bằng fragment hoặc dùng lại `flex flex-col gap-4` đã có trong file).
- [x] `src/data/foundation/bricks/f06.ts` -- viết lại theo Design Notes:
  - explain (chữ mới + 6 bảng), contrast, worked;
  - check: `c3`, `c5` mới; `c1`, `c2`, `c4` giữ nguyên;
  - easier: `e1` mới, `e2` giữ nguyên;
  - apply: chữ mới, `a1` mới, thêm `f06-say-3`;
  - faded giữ nguyên;
  - `ruleCards`: giữ 1–2, thêm 3–8;
  - sửa doc comment đầu file.
- [x] `src/data/foundation/bricks/f18.ts` -- thêm vào `examples` của màn contrast (sau "in June"): `{ vi: 'vào ngày 3 tháng 5 (ngày cụ thể cũng dùng on)', en: 'on May 3rd', audioText: 'on May third' }`.
- [x] `src/data/foundation/catalog.ts` -- sửa meta F06:
  - `minutes: 12`;
  - `goalVi: 'Số 0–100 (ghép twenty-one), thirTEEN/THIRty, giá tiền, giờ, 7 thứ, 12 tháng, ngày kiểu Mỹ (May 3rd), số thứ tự'`.
- [x] `src/data/questions/foundation.ts` -- sửa ngân hàng câu hàng A:
  - thêm `q-f06-03`, `q-f06-04` (Design Notes) ngay sau `q-f06-02`;
  - sửa comment đầu file và comment `FOUNDATION_QUESTIONS`: 42 câu, hàng A 12 câu (F06 4), B–D 10 câu.
- [x] `src/data/vocab/starter-words.ts` -- sửa comment dòng 7: "(viên F06 dạy chúng bằng bảng tra và thẻ quy tắc, story 34)".
- [x] `src/data/foundation/foundation.test.ts` -- sửa test cũ và thêm describe "F06 số, thứ, tháng (story 34)":
  - `englishTexts` lấy thêm `en` của mọi dòng bảng;
  - test thẻ quy tắc: F06 đúng 8 thẻ, viên khác 1–2;
  - chỉ F06 có `tables`. Id bảng theo đúng thứ tự `['f06-numbers', 'f06-tens', 'f06-days', 'f06-months', 'f06-ordinals', 'f06-time-price']`;
  - bảng số: `vi` là '0' … '19', `en` đúng zero … nineteen. Bảng chục: twenty … ninety, one hundred;
  - bảng thứ: `en` đúng Monday → Sunday, `vi` thứ Hai → Chủ nhật. Bảng tháng: `en` đúng January → December, `vi` 'tháng 1' … 'tháng 12';
  - bảng số thứ tự có first, second, third, fifth, twelfth, twentieth, twenty-first;
  - mọi dòng: `en` khớp `/^[A-Za-z' -]+$/`, `vi` không rỗng, `en` không trùng trong bảng;
  - 4 bảng đầu và bảng số thứ tự: mọi dòng có `ipa` không chứa `/`. 13–19 chứa `ˈtiːn`, twenty … ninety bắt đầu bằng `ˈ`, mọi thứ bắt đầu bằng `ˈ`, tháng có ˈ trừ March / May / June;
  - `rule:f06-1`, `-2` giữ đúng cloze / answer cũ. `f06-rule-3` … `-8` có answer theo Design Notes;
  - câu nói có `f06-say-3`;
  - khai báo `days-months`: mọi câu check / easier / apply của viên có `uses`, và mọi câu trong `FOUNDATION_QUESTIONS` + `QUESTION_BANK` có `requires`. Nếu phần tiếng Anh (đề đã điền, lựa chọn, `audioText`) chứa tên thứ (có thể thêm "s") hoặc tên tháng thì phải khai báo `days-months`. "May" chỉ tính khi đứng sau in / on hoặc trước một số. Câu nào trượt thì sửa `uses` / `requires` của câu đó;
  - mọi tên thứ / tháng gặp trong các câu trên đều có trong bảng F06.
- [x] `src/data/foundation/foundation-catalog.test.ts` -- `MINUTES.F06 = 12`, tổng 150.
- [x] `src/data/questions/foundation.test.ts` -- sửa các test đang chốt số câu và thêm test:
  - 42 câu;
  - hàng A 12 câu, B–D 10 câu (giữ ≤ 2 câu nghe, minPerLesson, 8 câu với 20 seed);
  - hàng A có đúng 4 câu f06, id `q-f06-01` … `-04` theo thứ tự. 03 / 04 có `requires` chứa `days-months`;
  - `getQuestion('q-f06-01'/'-02')` không đổi.
  - `src/data/questions/requires.test.ts:29` cũng chốt 40 câu: đổi thành 42.
- [x] `src/lib/flashcard-session.test.ts` -- thêm 2 test:
  - xong F01–F06 thì `ruleStudyWords` có đủ 8 id `rule:f06-1` … `-8` đúng thứ tự, `newPerDayFor` vẫn như cũ;
  - store có `rule:f06-9` thì thẻ đó không hiện và không đếm tồn ôn.
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- sửa 2 dòng:
  - dòng F06 của bảng (:20): 12 phút, "học để làm gì" khớp `goalVi`;
  - dòng Thứ tự từ mới (:67): "(số và tên thứ/tháng không có trong NGSL nên viên F06 dạy bằng bảng tra và thẻ quy tắc)".

**Acceptance Criteria:**
- Given Huy mở `#/foundation/F06` ở 375px, when mở bảng "12 tháng" và bấm nghe "July", then máy đọc "July", dòng có IPA `/dʒʊˈlaɪ/`, và trang không cuộn ngang.
- Given Huy học xong F06 trong buổi 30', when sang bước Ôn, then gặp thẻ "Thẻ quy tắc · F06", ví dụ "Monday, Tuesday, ___", lật ra "Wednesday", có câu quy tắc và link "Xem lại viên F06".
- Given máy cũ (bản trước story 34) đồng bộ store có `rule:f06-5`, when mở app cũ, then app không lỗi và thẻ không hiện (app cũ chỉ duyệt thẻ có trong nội dung của nó).

## Implementation Notes

- **Đã làm đủ 13 việc ở Execution.** Thêm kiểu `BrickTableRow` / `BrickTable` / `tables?`. Tạo `BrickTables.tsx` (`<details>` đóng sẵn, `table-fixed`, 3 cột, `ListenButton size="sm" rate={0.85}`). `ExplainBody` chỉ bọc bằng `flex flex-col gap-4` (class đã có trong file) khi có bảng, nên viên khác vẫn chỉ có một `<p>` như cũ.
- **Lệch so với Design Notes (1 chỗ):** IPA của sixteen ghi là `sɪksˈtiːn`, không phải `sɪkˈstiːn`. Lý do: bản ghi trong Design Notes làm hỏng test bắt buộc "13–19 chứa `ˈtiːn`". `sɪksˈtiːn` vẫn là cách ghi chuẩn kiểu Mỹ và khớp với six `sɪks`.
- **Explain:** đổi "số 0–20" thành "số 0–19" như Design Notes cho phép. Đoạn chữ vẫn trong khoảng 40–80 chữ (test đã qua).
- **Test khai báo `days-months`:** quét cả chuỗi chứ không chỉ `englishParts` (chặt hơn), so khớp phân biệt hoa thường. "May" chỉ tính khi đứng sau in / on hoặc trước một chữ số. Toàn bộ câu luyện có `uses`, cùng `FOUNDATION_QUESTIONS` và `QUESTION_BANK` có `requires`, đều qua mà không phải sửa dữ liệu câu nào. Các câu T2–T4 có Sunday (`t2-t4.ts:92`, `:253`) chưa có `requires` nên không bị quét; việc này thuộc story 47.
- **Thêm 3 test** cho flashcard-session (spec yêu cầu 2): xong F01–F06 thì có 8 thẻ; máy đã có `rule:f06-1`, `-2` thì thêm 6 thẻ mới mà 2 thẻ cũ giữ lịch; thẻ mồ côi `rule:f06-9`.
- **`layout:guard`:** chỉ báo class của `src/components/foundation/BrickTables.tsx` (file mới, 27 class được thêm): border, rounded-lg, p-3, cursor-pointer, font-semibold, break-words, marker:text-primary, mt-2, w-full, table-fixed, border-collapse, text-sm, border-b, text-left, text-xs, text-muted-foreground, w-9, py-1, w-2/5, last:border-0, align-middle, pr-1, block, font-mono, flex, flex-col, gap-2. Không file nào khác bị báo.
- **`layout:check`:** mọi route `ok` ở cả 5 bề rộng. `/foundation/F01` trùng ảnh gốc. Chỉ `/foundation` lệch 50 pixel: ô F06 đổi 10' thành 12', đúng như dự kiến.
- **Kiểm tay bằng Chrome headless** (Vite dev, `VITE_SUPABASE_*` rỗng):
  - F06 ở 375px và 1280px: 6 bảng đóng sẵn, tiêu đề "Số 0–19 (20)" … "Giờ, giá, số phòng (6)", số dòng 20/9/7/12/12/6. Dòng July có `/dʒʊˈlaɪ/`. `scrollWidth` bằng bề rộng màn.
  - Ở 1280px sang màn 2: cột "Lý thuyết của viên" có 6 bảng đóng. Enter khi đang ở `<summary>` chỉ mở bảng, vẫn ở "Màn 2/6".
  - F01 không có `<details>`.

- **Sửa sau review (lệch Design Notes, đều nằm ngoài phần đóng băng):**
  - Bảng số thứ tự thêm sixth, tenth, eleventh, thirteenth, twenty-third, thirtieth (18 dòng). Ghi chú nêu ngoại lệ 11th, 12th, 13th.
  - Các ghi chú bảng giải thích /θ/, t̬, "May 3" khi viết (vẫn đọc May third), và chỗ nhấn của -teen có thể dời lên đầu.
  - `f06-c3` đổi lựa chọn "fourteen-five" thành "forty five". Hint của faded trỏ tới bảng số thứ tự. Đề `q-f06-04` đổi thành "nói (viết bằng chữ)".
  - Ô thuật ngữ (`TermChip`) vẽ thêm bảng. F18 thêm "ngày cụ thể dùng on" vào explain và `f18-rule-1`.
  - Test thêm luật ngữ pháp hàng A cho F01–F06. `englishTexts` quét cả `noteVi` và `vi` của bảng. Bộ dò tên tháng nhận được "May third" và "May, June". Câu `tapSyllable` cũng được quét.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Ghi chú số thứ tự không nêu ngoại lệ 11th–13th; bảng thiếu eleventh, thirteenth, twenty-third, thirtieth, sixth, tenth | medium | Bản đầu chỉ ghi "21st, 22nd, 23rd, 31st quay về first…", 12 dòng. Đã sửa: ghi chú có "trừ 11th eleventh, 12th twelfth, 13th thirteenth", bảng 18 dòng, test chốt các dòng mới | patch |
| 2 | blind | Thẻ quy tắc chỉ bắt nhớ 4/19 tên thứ, tháng; không có thẻ số thứ tự bất quy tắc | low | Intent đóng băng chốt đúng 6 thẻ `f06-rule-3` … `-8` với nội dung cụ thể; mọi tên đều có trong bảng kèm nút nghe | reject |
| 3 | blind | Người học chỉ chọn, không tự làm ra số, thứ, ngày | low | Có faded gõ `2nd = ___`, `f06-c4` xếp mảnh, 3 câu nói và màn Áp dụng bắt tự nói ngày sinh, thẻ SRS dạng điền. `CheckItem` không có kiểu gõ; thêm kiểu mới là bề mặt mới, phần luyện gõ thuộc story 35 | reject |
| 4 | blind | Không có câu nghe thứ, tháng, ngày dù lý do là TOEIC Part 1–3 | medium | Đúng: câu listen vẫn chỉ `f06-c1`, `f06-c2`. Có từ trước story 34 (F06 cũ cũng không có); thêm câu nghe thì đổi bộ câu check intent đã chốt. Mỗi dòng bảng có nút nghe | defer |
| 5 | blind | F18 có ví dụ "on May 3rd" nhưng explain và thẻ quy tắc vẫn chỉ nói "tháng dùng in" | medium | Đã sửa `f18.ts`: explain "thứ và ngày cụ thể dùng on (on Monday, on May 3rd)", `f18-rule-1` vi thêm "on May 3rd" | patch |
| 6 | blind | Chưa dạy năm, số trên 100, a.m./p.m., viết tắt Mon/Jan, kiểu Anh "21 June" | medium | Đúng là chưa có, và F06 trước story 34 cũng không có; intent chốt "Số 0–100" và ngày kiểu Mỹ. Ý phụ "twenty-one June bị chấm sai oan" là false: kiểu Anh đọc "the twenty-first of June", "twenty-one June" sai ở cả hai kiểu | defer |
| 7 | blind | Cách viết ngày bằng số (5/3) có dạy mà không luyện | low | Đã sửa phần dạy: contrast nêu rõ thói quen người Việt đọc 5/3 là ngày 5 tháng 3; mặt sau `f06-rule-8` có "5/3 = May 3rd". Không thêm câu luyện vì bộ câu đã chốt | patch |
| 8 | blind | Màn Áp dụng: `f06-say-1` là giá tiền, `f06-say-2` "seven thirty, Monday" ngược thứ tự ví dụ mẫu | low | Intent chốt "giữ `f06-say-1`, `-2`"; "seven thirty, Monday" vẫn đúng tiếng Anh; đề nói "nói theo 3 mẫu" là đọc theo mẫu | reject |
| 9 | blind | Spec chưa cập nhật (IPA sixteen, "0–20", status in-progress, Change Log trống) | low | Sửa spec của chính build này; các lệch đã ghi ở Implementation Notes, status đặt `done` ở bước này | reject |
| 10 | blind | Test "chỉ dùng kiến thức đã dạy" không quét `noteVi`, `title`, `vi` của bảng | medium | Đã sửa: `englishTexts` lấy thêm `noteVi` và `vi` của mọi dòng (qua `englishParts`) | patch |
| 11 | blind | Bộ dò tháng bỏ sót "May third", "May," trong danh sách; câu không có `uses`/`requires` bị bỏ qua | medium | Đã sửa `MAY_RE` nhận số thứ tự viết chữ và "May, June", có tự kiểm. Phần câu T2–T4 chưa có `requires` thuộc story 47 (mục Never) | patch |
| 12 | blind | Soát vé không bảo đảm có câu thứ/tháng; F06 chiếm 4/12 câu hàng A | low | Intent đóng băng chốt 12 câu, bốc 8, cấm đổi `ROW_QUIZ_SIZE`, `MIN_PER_LESSON`, luật chấm. Lý do trong intent là "hỏi được", không hứa "luôn hỏi" | reject |
| 13 | blind | Lựa chọn nhiễu yếu ("fourteen-five"); "May 3" khi viết vẫn đúng | low | Đã sửa: `f06-c3` dùng "forty five" (thiếu gạch nối); giải thích `f06-c5`, `q-f06-04` ghi "văn bản có khi chỉ viết May 3, vẫn đọc May third" | patch |
| 14 | edge | Ô thuật ngữ "Số thứ tự" hiện đoạn chữ nói "6 bảng tra bên dưới" nhưng không có bảng | medium | `TermChip` lấy `explain.textVi` của F06. Đã sửa: `TermChip` vẽ `BrickTables` khi viên có bảng | patch |
| 15 | edge | F18 dùng số thứ tự ("on May 3rd") mà `uses` của F18 không có `ordinals` | low | Mục Never cấm đổi `uses` trong catalog; F06 (hàng A) luôn đứng trước F18 (hàng D); ví dụ nằm ở màn contrast, không phải câu luyện có `uses` | reject |
| 16 | edge | `MAY_RE` không nhận "May third", "May twenty-first", "May, June" | medium | Cùng gốc #11. Đã sửa regex, có test tự kiểm `dayMonthNames('May third · May twelfth · May, June')` | patch |
| 17 | edge | Câu `tapSyllable` không được quét tên thứ/tháng | low | Đã sửa: `itemTexts` và `englishTexts` có nhánh `tapSyllable` (`item.word`) | patch |
| 18 | edge | Câu `QUESTION_BANK` không có `requires` (t2-t4 "Sunday") bị bỏ qua | low | Thêm `requires` cho câu T2–T4 cũ là việc story 47 (mục Never); đã ghi ở Implementation Notes | reject |
| 19 | edge | Kiểm "mọi tên thứ/tháng có trong bảng F06" không bao giờ đỏ | low | Đúng là kiểm theo cấu trúc, nhưng `DAY_NAMES`/`MONTH_NAMES` đã bị chốt bằng `ens('f06-days')`/`ens('f06-months')` nên điều cần giữ vẫn được giữ; không gây hại cho người học | reject |
| 20 | edge | Không có TTS thì cột nghe `w-9` để trống | low | Giống hệt `IrregularVerbTable`, I/O matrix chấp nhận; cột 36px, bảng `table-fixed` vẫn co ở 375px | reject |
| 21 | edge | Đoạn giải thích bảo "bấm nghe" khi máy không có TTS | low | Hiếm (trình duyệt phổ biến đều có TTS); các viên khác cũng nhắc nghe theo cách này | reject |
| 22 | edge | Spec nói "May" trước số được nhận nhưng code chỉ nhận chữ số | low | Đã sửa cùng #11: code nay nhận cả số thứ tự viết bằng chữ | patch |
| 23 | edge | Ghi chú test về độ phủ tên thứ/tháng gây hiểu là có kiểm thật | low | Cùng gốc #19 | reject |
| 24 | vgap | Nội dung F06 không bị kiểm luật ngữ pháp hàng A | medium | Đã thêm test "ngữ pháp hàng A" cho F01–F06 (to be, have, do, khuyết thiếu, at/on/in). Thử đổi `sampleEn` thành "My birthday is on June 21st" thì test đỏ (`is, on`), đổi lại thì xanh | patch |
| 25 | vgap | Bảng ở màn giải thích không có test render hay test bề rộng | medium | Vitest chạy môi trường node, không có test component; `layout:check` không vào `/foundation/F06` và bảng đóng sẵn | defer |
| 26 | vgap | `TermChip` không vẽ bảng (Other findings) | medium | Cùng gốc #14 | patch |
| 27 | content | Văn bản Mỹ thường viết "May 3" nhưng đọc "May third" | medium | Đã sửa: ghi chú bảng tháng, giải thích `f06-c5` và `q-f06-04` | patch |
| 28 | content | Thiếu ngoại lệ 11th, 12th, 13th | medium | Cùng gốc #1 | patch |
| 29 | content | Hint của faded trỏ tới nội dung màn 1 không còn | medium | Đã sửa: hint "Xem bảng “Số thứ tự cho ngày” ở màn 1" | patch |
| 30 | content | Dùng /θ/ để phân biệt Tuesday và Thursday mà /θ/ chưa được dạy | medium | Đã sửa: ghi chú bảng thứ và `f06-rule-5` mô tả cách đặt lưỡi, "không phải th tiếng Việt" | patch |
| 31 | content | `q-f06-04` hỏi "đọc" nhưng "twelveth" sai ở cách viết | medium | Đã sửa đề: "kiểu Mỹ nói (viết bằng chữ) thế nào?" | patch |
| 32 | content | Câu dễ hơn `f06-e1` (Thursday) không dễ | low | Intent đóng băng chốt "1 câu dễ hơn (Thursday)" | reject |
| 33 | content | Chỉ dạy nhấn cuối cho -teen là quá đơn giản | low | Đã sửa ghi chú bảng số: "chắc nhất là nghe /n/ cuối (khi đếm hay đứng trước danh từ, chỗ nhấn có thể dời lên đầu)" | patch |
| 34 | content | Ký hiệu IPA chưa giải thích (t̬, ɝː, ɚ…) | low | Đã thêm giải thích t̬ ở bảng chục; các ký hiệu khác chỉ để tra, có nút nghe | patch |
| 35 | content | Không nêu thói quen người Việt đọc 5/3 | low | Cùng gốc #7 | patch |
| 36 | content | Diễn đạt chưa rõ (chữ d đầu, eighth, số tròn chục) | low | Đã sửa: "chữ d thứ nhất (Wed-)", "eighth chỉ thêm h", "(trừ số tròn chục)" | patch |
| 37 | content | F18 chưa cập nhật theo ví dụ mới | low | Cùng gốc #5 | patch |
| 38 | content | IPA sixteen `sɪksˈtiːn` | false | Cả hai cách ghi đều chuẩn, lệch đã ghi ở Implementation Notes; reviewer tự đánh dấu không phải lỗi | reject |

## Design Notes

**Explain `textVi`** (73 chữ theo `countWords`): "Viên này có 6 bảng tra bên dưới: số 0–20, số chục, 7 thứ, 12 tháng, số thứ tự, giờ và giá. Mở từng bảng, bấm nghe và đọc theo. Nhớ ba điều: 13–19 nhấn ở cuối (thirTEEN), số chục nhấn ở đầu (THIRty); 21–99 ghép số chục, gạch nối, số đơn: twenty-one; thứ và tháng viết hoa chữ đầu, ngày trong tháng đọc bằng số thứ tự: May 3rd đọc May third." Bảng đầu là 0–19. Có thể đổi chữ thành "số 0–19", miễn là vẫn 40–80 chữ.

**Bảng** (`en` · `vi` · `ipa`):
- `f06-numbers` "Số 0–19":
  - zero 0 ˈzɪroʊ; one 1 wʌn; two 2 tuː; three 3 θriː; four 4 fɔːr; five 5 faɪv; six 6 sɪks; seven 7 ˈsevən; eight 8 eɪt; nine 9 naɪn; ten 10 ten; eleven 11 iˈlevən; twelve 12 twelv;
  - thirteen 13 θɝːˈtiːn; fourteen 14 fɔːrˈtiːn; fifteen 15 fɪfˈtiːn; sixteen 16 sɪkˈstiːn; seventeen 17 sevənˈtiːn; eighteen 18 eɪˈtiːn; nineteen 19 naɪnˈtiːn;
  - note: "13–19 nhấn ở cuối: thirTEEN. Số phòng, số điện thoại đọc từng chữ số, 0 đọc oh /oʊ/."
- `f06-tens` "Số chục và 100":
  - twenty 20 ˈtwent̬i; thirty 30 ˈθɝːt̬i; forty 40 ˈfɔːrt̬i; fifty 50 ˈfɪfti; sixty 60 ˈsɪksti; seventy 70 ˈsevənt̬i; eighty 80 ˈeɪt̬i; ninety 90 ˈnaɪnt̬i; one hundred 100 wʌn ˈhʌndrəd;
  - note: "Số chục nhấn ở đầu: THIRty. 21–99: số chục, gạch nối, số đơn: twenty-one (21), forty-five (45), ninety-nine (99). forty không có u. 200 = two hundred (hundred không thêm -s)."
- `f06-days` "7 thứ":
  - Monday thứ Hai ˈmʌndeɪ; Tuesday thứ Ba ˈtuːzdeɪ; Wednesday thứ Tư ˈwenzdeɪ; Thursday thứ Năm ˈθɝːzdeɪ; Friday thứ Sáu ˈfraɪdeɪ; Saturday thứ Bảy ˈsæt̬ɚdeɪ; Sunday Chủ nhật ˈsʌndeɪ;
  - note: "Viết hoa chữ đầu. Wednesday không đọc chữ d đầu. Tuesday (thứ Ba) và Thursday (thứ Năm) dễ nhầm: Thursday mở đầu bằng /θ/."
- `f06-months` "12 tháng":
  - January tháng 1 ˈdʒænjueri; February tháng 2 ˈfebrueri; March tháng 3 mɑːrtʃ; April tháng 4 ˈeɪprəl; May tháng 5 meɪ; June tháng 6 dʒuːn; July tháng 7 dʒʊˈlaɪ; August tháng 8 ˈɑːɡəst; September tháng 9 sepˈtembɚ; October tháng 10 ɑːkˈtoʊbɚ; November tháng 11 noʊˈvembɚ; December tháng 12 dɪˈsembɚ;
  - note: "Viết hoa chữ đầu. June một âm tiết, July nhấn âm sau: juLY. September → December nhấn âm thứ hai."
- `f06-ordinals` "Số thứ tự cho ngày":
  - first 1st fɝːst; second 2nd ˈsekənd; third 3rd θɝːd; fourth 4th fɔːrθ; fifth 5th fɪfθ; eighth 8th eɪtθ; ninth 9th naɪnθ; twelfth 12th twelfθ; twentieth 20th ˈtwent̬iəθ; twenty-first 21st twent̬iˈfɝːst; twenty-second 22nd twent̬iˈsekənd; thirty-first 31st θɝːt̬iˈfɝːst;
  - note: "Thường thêm -th: fourth, sixth, tenth. Đổi chữ: fifth, eighth, ninth, twelfth; số chục đổi y thành ieth: twentieth. 21st, 22nd, 23rd, 31st quay về first, second, third."
- `f06-time-price` "Giờ, giá, số phòng" (không có IPA):
  - nine o'clock "9:00 · 9 giờ đúng"; seven thirty "7:30 · 7 giờ 30"; eight oh five "8:05 · 8 giờ 5 phút"; fifteen dollars "$15 · 15 đô la"; two fifty "$2.50 · 2 đô 50 xu"; three oh five "305 · phòng 305";
  - note: "Giờ trước, phút sau. Phút 01–09 đọc oh + số; giờ đúng thêm o'clock. Giá lẻ nói nhanh: $2.50 = two fifty."

**Màn khác:**
- contrast:
  - viSays: "Tiếng Việt nói “mười ba” và “ba mươi” nghe khác hẳn nhau, và nói ngày trước tháng: ngày 3 tháng 5."
  - enRequires: "Tiếng Anh thirteen và thirty nghe gần giống: thirTEEN nhấn ở cuối, có /n/ cuối; THIRty nhấn ở đầu. Ngày kiểu Mỹ nói tháng trước, ngày sau, ngày dùng số thứ tự: May 3rd, đọc May third. Viết bằng số thì 5/3 là ngày 3 tháng 5."
  - examples: giữ 3 ví dụ cũ, thêm `{ vi: 'ngày 3 tháng 5', en: 'May 3rd', audioText: 'May third' }`.
- worked:
  - en: `Monday, May 3rd, 7:30`;
  - audioText: `Monday, May third, seven thirty`;
  - vi: "thứ Hai, ngày 3 tháng 5, lúc 7 giờ 30";
  - noteVi: "Thứ và tháng viết hoa. Ngày đọc bằng số thứ tự (3rd = third). Giờ đọc hai số liền nhau: seven thirty."
- check, các câu mới:
  - `f06-c3` (choice): "Số 45 viết bằng chữ thế nào?"
    - lựa chọn: forty-five · fourty-five · fourteen-five, đáp án 0;
    - hint: "Số chục + gạch nối + số đơn. 40 viết thế nào?";
    - explanation: "45 = forty-five. 40 viết forty, không có u (four thì có u).";
    - uses: `['numbers']`.
  - `f06-c5` (choice): "Ngày 3 tháng 5, kiểu Mỹ nói thế nào?"
    - lựa chọn: May third · three May · May three, đáp án 0;
    - hint: "Tháng trước, ngày sau; ngày dùng số thứ tự.";
    - explanation: "May 3rd đọc May third: tháng (May) rồi số thứ tự (third).";
    - uses: `['days-months', 'ordinals']`.
  - `f06-e1` (choice): "Thursday là thứ mấy?"
    - lựa chọn: Thứ Năm · Thứ Ba · Thứ Tư, đáp án 0;
    - hint: "Xem bảng 7 thứ: Tuesday, Wednesday rồi mới tới Thursday.";
    - explanation: "Thursday = thứ Năm. Tuesday = thứ Ba, Wednesday = thứ Tư.";
    - uses: `['days-months']`.
- apply:
  - promptVi: "Áp dụng: nói ngày sinh và giờ học của bạn. Chọn cách nói đúng ngày 21 tháng 6, rồi nói theo 3 mẫu. Sau đó tự nói ngày sinh của bạn kiểu Mỹ (tháng trước, ngày sau) và giờ bạn học mỗi ngày.";
  - sampleEn: `June 21st · 7:30`, sampleAudioText: `June twenty-first, seven thirty`;
  - `f06-a1` (choice): "Ngày 21 tháng 6 nói thế nào?"
    - lựa chọn: June twenty-first · June twenty-one · twenty-one June, đáp án 0;
    - hint: "Tháng trước; ngày dùng số thứ tự: 21st.";
    - explanation: "21st = twenty-first: số chục giữ nguyên, số đơn đổi thành số thứ tự (one → first).";
    - uses: `['days-months', 'ordinals', 'numbers']`;
  - speak: giữ `f06-say-1`, `-2`, thêm `{ id: 'f06-say-3', text: 'June twenty-first', vi: 'ngày 21 tháng 6' }`.

**Thẻ quy tắc mới** (cloze → answer · vi):
- `f06-rule-3`: `45 = ___-five` → `forty` · "21–99: số chục + gạch nối + số đơn. 40 viết forty (không có u), dù 4 là four."
- `f06-rule-4`: `Monday, Tuesday, ___` → `Wednesday` · "thứ Hai, thứ Ba, thứ Tư. Wednesday đọc /ˈwenzdeɪ/, chữ d đầu không đọc."
- `f06-rule-5`: `Tuesday = thứ Ba, ___ = thứ Năm` → `Thursday` · "Tuesday /ˈtuːzdeɪ/ thứ Ba, Thursday /ˈθɝːzdeɪ/ thứ Năm: hai từ dễ nhầm."
- `f06-rule-6`: `May, June, ___` → `July` · "tháng 5, 6, 7. June /dʒuːn/ một âm tiết; July /dʒʊˈlaɪ/ nhấn âm sau."
- `f06-rule-7`: `October, November, ___` → `December` · "tháng 10, 11, 12. September → December nhấn âm thứ hai: deCEMber."
- `f06-rule-8`: `ngày 3 tháng 5 = May ___` → `third` · "Kiểu Mỹ: tháng trước, ngày sau; ngày đọc bằng số thứ tự: May 3rd = May third."

**Câu Soát vé mới:**
- `q-f06-03`: "Thứ Năm tiếng Anh là gì?"
  - lựa chọn: Thursday · Tuesday · Wednesday · Saturday, đáp án Thursday;
  - explanation: "Thursday = thứ Năm. Tuesday (thứ Ba) dễ nhầm với Thursday; Wednesday là thứ Tư, Saturday là thứ Bảy.";
  - requires: `['days-months']`.
- `q-f06-04`: "Ngày 12 tháng 8, kiểu Mỹ đọc thế nào?"
  - lựa chọn: August twelfth · August twelve · twelve August · August twelveth, đáp án August twelfth;
  - explanation: "Tháng trước, ngày sau, ngày dùng số thứ tự: 12th = twelfth (không viết twelveth).";
  - requires: `['days-months', 'ordinals']`.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: đều qua.
- `npm run layout:guard` -- expected: chỉ báo class của `src/components/foundation/BrickTables.tsx` (file mới). Không file nào khác có class không tiền tố bị thêm hoặc xoá. Ghi danh sách vào Implementation Notes.

**Manual checks (if no CLI):**
- Chrome headless 375px và 1280px, `VITE_SUPABASE_*` rỗng:
  - `#/foundation/F06`: 6 bảng đóng; mở "Số 0–19" và "12 tháng" thì có đủ dòng; `scrollWidth` bằng bề rộng;
  - ở 1280px sang màn 2 thì cột trái có bảng;
  - `#/foundation/F01` không đổi.
