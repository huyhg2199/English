---
title: 'Khối "Chọn thì", từ tín hiệu, bảng mỗi thì một dòng và luật trợ động từ (CAP-11, learning-rules "Nội dung bài")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: 'b33c7d867c1d274fdfba6d4b603caf5b855efd07'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/35-tense-practice-typed-questions.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/36-t1-t2-tense-practice-data.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/38-tense-rule-cards-irregular-verb-srs.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" là Huy tự làm ra câu đúng thì, và chọn được thì. Báo cáo kiểm tra mục C4: chỉ cặp hoàn thành / quá khứ đơn có bài so sánh; will / going to mỗi bên một dòng; không có từ tín hiệu; chữ "đã" dịch giống nhau cho quá khứ đơn và hoàn thành. Mục T9: không có luật chung trợ động từ, glossary thiếu trợ động từ, V-ing, V2, V3. Mục "Thấp": video begKNGxcjdk (will hay going to) nằm ở tuần will, trước khi học going to.
- Quyết định 4: dùng lại tối đa bộ máy đã có. Phần luyện của khối "Chọn thì" chạy bằng chính trình phát `TensePractice` (story 35, `CheckFlow` của Sân ga). Dòng thời gian dùng `TenseTimeline` với kiểu đã có. Chip thuật ngữ dùng `GLOSSARY` / `TermChip` (story 26).
- Ràng buộc chung giữ nguyên:
  - không khoá, không phạt, không reset;
  - nội dung tiếng Việt tự soạn, chỉ dùng kiến thức đã dạy tới bài chứa nó;
  - giao diện 375px không đổi ngoài phần mới;
  - không đổi schema store, không thêm key đồng bộ.
- Claude chọn:
  - **Từ tín hiệu:** trường `Tense.signalWords` cho 10 thì có mốc thời gian, theo bảng ở Design Notes. Hiện thành hàng chip "Từ tín hiệu" ngay dưới dòng thời gian của TenseCard. `to-be`, `modals`, `comparatives`, `passive-present` không có.
  - **Khối "Chọn thì"** (kiểu mới `TenseChoice`, trường `GrammarContent.choices`) đứng sau các thì của bài:
    - "Đơn hay tiếp diễn?" ở s1-t2-w1, ngay sau hiện tại tiếp diễn (học xong tiếp diễn thì đặt cạnh hiện tại đơn luôn). Không đặt ở s1-t2-w4, vì story 46 dùng tuần đó cho quá khứ tiếp diễn;
    - "will hay going to?" ở s1-t3-w2;
    - "Đừng dịch từng chữ (đã · sẽ · chưa)" ở s1-t3-w4.
    
    Hai khối so sánh có hai dòng thời gian cạnh nhau (lấy từ chính hai Tense), chip từ tín hiệu của mỗi bên, 3–4 cặp câu tối thiểu. Khối "Đừng dịch từng chữ" có bảng chữ Việt → cách nói tiếng Anh. Mỗi khối có phần luyện 4 bước như thì: hai khối so sánh có 7 câu trộn hai chiều, khối dịch có 6 câu dịch Việt → Anh. Phần luyện không ghi Sổ lỗi (như phần luyện của thì). Story này không thêm câu quiz: câu chọn giữa hai thì để kiểm tra là việc của story 40, 41.
  - **Bảng "mỗi thì một dòng" + luật chung trợ động từ:** khối mới `tense-table` trong đoạn "Ôn tổng" (Phát âm) của s1-t4-w4, đặt sau 2 khối ôn tổng sẵn có. Tuần này không có đoạn Ngữ pháp, và `stage-1.ts` phải khớp `lo-trinh-toeic-12-thang.md` (test), nên không thêm đoạn mới. Bảng có 10 dòng: mỗi dòng gồm tên thì, trợ động từ, câu khẳng định, phủ định, câu hỏi, link về đoạn Ngữ pháp của bài. Luật chung có 3 câu.
  - **Glossary:** thêm 4 mục `auxiliary` (trợ động từ), `v-ing`, `v2`, `v3`, đều trỏ viên F17 (viên dạy các dạng go / going / went / gone). Lời Việt của F17 được chèn tên gọi tắt V1 / V-ing / V2 / V3 và chữ "trợ động từ", chỉ thêm chữ, không đổi câu luyện. Không mở rộng glossary sang nguồn là bài.
  - **Video:**
    - begKNGxcjdk chuyển sang s1-t3-w2, đoạn Ngữ pháp.
    - Luật "mỗi bài 1–2 video" (test story 15) buộc chuyển thêm mV_CEIroJs8 (nối âm, đoạn Phát âm s1-t3-w2) sang đoạn Phát âm của s1-t4-w4. Đoạn này ôn tổng, có dòng "Nối âm". Giữ UkBzUmRhs6w ("gonna", giải trí) ở s1-t3-w2 để bước Giải trí của buổi vẫn có video.
    - Câu phụ đề được tô theo cả hai thì mà khối "Chọn thì" của bài so sánh, nên ở s1-t3-w2 câu will cũng được tô.

**Problem:** Huy học từng thì riêng rẽ nhưng không được dạy cách chọn thì. Hiện tại đơn và tiếp diễn chưa bao giờ đặt cạnh nhau. will và going to mỗi bên chỉ một dòng. Không có từ tín hiệu. Chữ "đã", "chưa" dịch giống nhau cho hai thì khác nhau. Cũng không có bảng tổng hợp "phủ định / câu hỏi dựa vào trợ động từ", trong khi đây là kỹ năng TOEIC Part 5 hỏi nhiều nhất. Video so sánh will / going to lại nằm trước bài going to.

**Approach:**
- Thêm dữ liệu thuần: `signalWords`, ba `TenseChoice` (file mới), một khối `tense-table`, bốn mục glossary.
- Thêm hai component vẽ: `TenseChoiceCard`, khối bảng trong `PronunciationBlocks`.
- Mở rộng kiểu prop của `TensePractice` để chạy được phần luyện của khối.
- Sửa `videos.json` và ngữ cảnh tô phụ đề.

## Boundaries & Constraints

**Always:**
- Chỉ dùng kiến thức đã dạy:
  - mọi chữ tiếng Anh của khối "Đơn hay tiếp diễn?" (cặp câu, ví dụ, phần luyện; đề câu gõ qua `promptEnglish`) có `outOfScopeWords('present-continuous', …)` rỗng;
  - khối s1-t3-w2 và s1-t3-w4 không chứa dấu hiệu của bài dạy sau nó, theo bảng "Dấu hiệu theo bài" của story 38 (going to → s1-t3-w2, hoàn thành → s1-t3-w3, since / how long → s1-t3-w4, modal → s1-t4-w1, than / so sánh nhất / bị động → s1-t4-w3);
  - không dùng some / any / many / much / because / so, không có "Don't + V";
  - bảng s1-t4-w4 chỉ dùng thì của Chặng 1 đã có (không quá khứ tiếp diễn).
- Từ tín hiệu: mỗi từ (bỏ `!` / `…`, chữ thường) có nguyên cụm trong chữ tiếng Anh của chính Tense đó (ví dụ, công thức, quy tắc, lỗi, phần luyện, thẻ quy tắc) hoặc của viên F18 (trạng từ tần suất).
- Phần luyện của khối:
  - qua đúng luật dữ liệu story 35 (`practiceProblems` rỗng: 5–7 câu chính, đúng 2 câu dễ hơn, id `<choiceId>-c<n>` / `-e<n>` / `-say-<n>`, câu chọn có 3 lựa chọn khác nhau, có `hintVi` và `explanationVi`);
  - câu `choice` chỉ có một đáp án đúng trong ngữ cảnh: ngữ cảnh (dấu hiệu, câu kèm theo) phải chốt được thì;
  - đề dịch khớp `TRANSLATE_RE` của story 36;
  - đáp án kết thúc bằng cụm trong `TIME_TAILS` thì `accept` có bản `frontedTimeTail`.
- Hành vi luyện giống phần luyện của thì: sai thì giải thích và làm lại, dưới 60% thì mời xem lại và cho 2 câu dễ hơn. Không ghi Sổ lỗi, lần làm quiz, tiến độ hay điểm Nhà. Chỉ câu nói ở bước áp dụng ghi điểm nói. Mỗi lúc chỉ mở một khối luyện trong đoạn Ngữ pháp (dùng chung `openPracticeId` với thì).
- Id khối "Chọn thì" không trùng id Tense. Mỗi side trỏ một Tense có thật và có `signalWords`.
- Mỗi dòng bảng trỏ một Tense có thật. Link dòng về đúng bài chứa Tense đó. Câu phủ định có not / n't, câu hỏi kết thúc bằng `?`.
- 375px:
  - không tràn ngang (`scrollWidth` = 375) ở các trang mới đổi;
  - hai dòng thời gian xếp chồng dưới 640px, cạnh nhau từ `sm`;
  - `TenseCard` của thì không có `signalWords` vẽ y như cũ (s1-t1-w1 trùng ảnh baseline);
  - component cũ chỉ được thêm phần mới, không xoá hay đổi class sẵn có.
- Giữ nguyên mọi id cũ (Tense, câu luyện, câu quiz, thẻ quy tắc, câu nói) và mọi dữ liệu story 33–38.

**Never:**
- Không làm việc của story khác:
  - phần luyện / câu quiz T3–T4 (37);
  - câu quiz chọn thì, mini-t3, kho câu O.W.L. (40);
  - kiểm tra cuối Bài chính (41);
  - Bản đồ thì (42);
  - lượng từ, liên từ, how often (43, 44);
  - modal mở rộng (45);
  - quá khứ tiếp diễn (46);
  - chia Ngữ pháp theo ngày, `requires` câu cũ, sắp lại video khác (47).
- Không sửa câu quiz, `ruleCards`, `practice`, `examples`, `rules`, `mistakes` của Tense có sẵn. Không sửa `stage-1.ts`, `function-words.ts`, file phụ đề.
- Không thêm kiểu dòng thời gian mới, không dựng trình phát luyện mới.
- Không thêm đoạn Ngữ pháp cho s1-t4-w4.
- Không đổi schema store hay key đồng bộ.
- Không cho glossary trỏ tới bài.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Chip tín hiệu | Mở `/roadmap/lesson/s1-t2-w1/grammar` | TenseCard "Hiện tại tiếp diễn" có hàng "Từ tín hiệu" ngay dưới dòng thời gian: now · right now · today · this year · Look! (`lang="en"`) | N/A |
| Thì không có tín hiệu | s1-t1-w1 (to be), s1-t4-w1 (modal) | Không có hàng "Từ tín hiệu". Ảnh 375px s1-t1-w1 trùng baseline | N/A |
| Khối "Đơn hay tiếp diễn?" | Đoạn Ngữ pháp s1-t2-w1 (trang bài hoặc bước Bài chính) | Sau TenseCard tiếp diễn và khối luyện của nó có thẻ "Đơn hay tiếp diễn?": 2 side (Hiện tại đơn `habit`, Hiện tại tiếp diễn `progress`), mỗi side có dòng thời gian, "Dùng khi", chip, câu ví dụ có nút nghe. Có 4 cặp câu tối thiểu, mỗi câu có nút nghe, có ghi chú. Cuối thẻ là "Luyện: Đơn hay tiếp diễn?" + nút "Bắt đầu luyện" | N/A |
| Luyện khối | Bấm "Bắt đầu luyện", làm 7 câu | 4 bước như phần luyện thì. "Look! It ___ (rain)." gõ "is raining" → đúng. Chọn "am understanding" → giải thích động từ trạng thái, cho làm lại. Store `mistakes`, `quizzes`, `progress`, `house` không đổi | N/A |
| Dưới 60% | Sai lần đầu ≥ 3/7 câu | Mời "Xem lại giải thích" (hiện 2 công thức + 3 quy tắc của khối) và 2 câu dễ hơn, bỏ qua được | N/A |
| Một khối mở | Đang mở luyện tiếp diễn, bấm luyện khối | Khối luyện tiếp diễn đóng, khối "Chọn thì" mở. Phím Enter chỉ chạy ở khối đang mở | N/A |
| will hay going to | `/roadmap/lesson/s1-t3-w2/grammar` | Thẻ "will hay going to?" sau GOING_TO: side will (`future-point`), side going-to (`plan`), 3 cặp câu, 7 câu luyện. Video begKNGxcjdk nằm ở đoạn Ngữ pháp s1-t3-w2 | N/A |
| Tô phụ đề | Xem begKNGxcjdk ở s1-t3-w2 | Cue `highlight: ['will']` được tô "Tương lai với will", cue `going-to` được tô "be going to (gonna)" | Sub lỗi thì video vẫn xem được như cũ |
| Video tuần will | `/roadmap/lesson/s1-t3-w1` | Không còn begKNGxcjdk, còn 1 video (psI7E_J1zPo) | N/A |
| Đếm video | Toàn bộ `videos.json` | Mỗi bài có nội dung 1–2 video. s1-t3-w2 có begKNGxcjdk (grammar) + UkBzUmRhs6w (entertainment). s1-t4-w4 có sAumTZ1lkZE + mV_CEIroJs8 (pronunciation) | N/A |
| Đừng dịch từng chữ | `/roadmap/lesson/s1-t3-w4/grammar` | Thẻ sau PERFECT_VS_PAST: bảng 3 chữ đã / sẽ / chưa, mỗi chữ 2–3 cách nói, mỗi cách có "khi nào" và ví dụ có nút nghe. Không có dòng thời gian cạnh nhau. Có 6 câu luyện dịch | N/A |
| Câu dịch | Đề "Bạn ăn trưa chưa? (have lunch, yet)", gõ "have you had lunch yet" | Đúng (`matchesTyped`). Gõ "Did you have lunch?" → sai, giải thích: không có mốc, hỏi tính tới bây giờ thì dùng Have you … yet? | N/A |
| Trạng ngữ lên đầu | Đề "Tôi đã gặp cô ấy năm ngoái. (meet)", gõ "Last year I met her." | Đúng (có trong `accept`) | N/A |
| Bảng mỗi thì một dòng | `/roadmap/lesson/s1-t4-w4` đoạn Ôn tổng | Sau 2 khối ôn tổng có khối "Mỗi thì một dòng": 10 dòng đúng thứ tự Design Notes. Mỗi dòng có tên (link về `/roadmap/lesson/<bài>/grammar`), trợ động từ, 3 câu + / − / ? có nút nghe. Tiếp theo là "Luật chung của trợ động từ" (3 câu, có chip thuật ngữ). 375px không tràn | N/A |
| Chip thuật ngữ mới | TenseCard tiếp diễn: "S + am / is / are + V-ing" | "V-ing" là chip mở Sheet "V-ing", "Viên gạch F17 · …". Tương tự "V2", "V3" (TenseCard quá khứ / hoàn thành), "trợ động từ" (luật chung). Mỗi chuỗi chỉ chip lần đầu | N/A |
| Dữ liệu cũ | Store có tiến độ, thẻ quy tắc, Sổ lỗi | Không đổi gì. Thẻ quy tắc, câu quiz, lần làm cũ giữ nguyên | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/types.ts`:
  - `Tense` (:158) → thêm `signalWords?`;
  - `TimelineKind` (:147) → dùng lại, không thêm kiểu;
  - `TensePractice` (:195), `GrammarContent` (:217) → thêm `choices?`;
  - `PronunciationBlock` (:74, có `overview` :106) → thêm kiểu `tense-table`.
- `src/data/lessons/t1-grammar.ts` -- `PRESENT_SIMPLE` (:65), `PRESENT_SIMPLE_QUESTIONS` (:228): thêm `signalWords`. `TO_BE` không đổi.
- `src/data/lessons/t2-t4-grammar.ts`:
  - thêm `signalWords` cho `PRESENT_CONTINUOUS` (:18), `PAST_TO_BE` (:189), `PAST_SIMPLE` (:354), `PAST_SIMPLE_IRREGULAR` (:514), `WILL` (:676), `GOING_TO` (:737), `PRESENT_PERFECT` (:796), `PERFECT_VS_PAST` (:864);
  - `GRAMMAR_T2_W1`, `GRAMMAR_T3_W2`, `GRAMMAR_T3_W4` (cuối file) → thêm `choices`.
- `src/data/lessons/t2-t4-pronunciation.ts` -- `STAGE_1_OVERVIEW_TENSES` (:270, khối ôn thì dạng link), `PRONUNCIATION_T4_W4.blocks` (:409). Thêm khối `tense-table` sau 2 khối ôn tổng.
- `src/data/lessons/index.ts` -- `LESSON_CONTENTS`, `allTenses()` (:166). Thêm `allTenseChoices()`.
- `src/lib/tense-practice.ts`:
  - `PracticeTense`, `hasPractice`, `practiceScreens`;
  - `practiceProblems(Pick<Tense,'id'|'practice'>)` đã nhận được khối;
  - `practiceEnglishTexts`, `practiceItemIds`.
  
  Thêm kiểu `PracticeSubject`.
- `src/components/lesson/TensePractice.tsx` -- `TenseRecap` (formulas + rules), `PracticePlayer`, `TensePractice` nhận `PracticeTense`. Đổi sang `PracticeSubject`, không đổi hành vi.
- `src/components/lesson/TenseCard.tsx` -- thứ tự: header → `TenseTimeline` → Công thức… Chèn hàng chip sau timeline.
- `src/components/lesson/TenseTimeline.tsx` -- dùng lại, không sửa.
- `src/components/lesson/LessonContentParts.tsx:215-246` -- `GrammarSection` với `openPracticeId`. Vẽ `choices` sau các thì, trước bảng động từ / Review.
- `src/components/lesson/PronunciationBlocks.tsx:400-441` -- `OverviewBlock` (dùng `sectionHref`, `BlockShell`), `PronunciationBlockView` switch. Thêm nhánh `tense-table`.
- `src/components/lesson/TermChip.tsx` -- `GlossaryText`. Dùng cho lời Việt của khối mới, không sửa.
- `src/data/foundation/glossary.ts` (+ `glossary.test.ts`: test "30–34 mục" cần nới, test "viên đích nhắc tới ít nhất một mẫu").
- `src/data/foundation/bricks/f17.ts` -- `contrast.examples`: "5 dạng của go", "She has gone." Chỉ chèn chữ vào `vi`. Test `foundation.test.ts:316` (vi của "She has gone." không chứa "Quá khứ") và test chữ hàng C–D phải còn qua.
- `src/lib/tense-scope.ts` -- `outOfScopeWords`, `promptEnglish`, `TIME_TAILS`, `frontedTimeTail` (chỉ test dùng, không sửa).
- `src/data/lessons/lessons.test.ts`:
  - `SIGNALS` (:1003), `filled`, `lessonIndex` (story 38);
  - `TRANSLATE_RE`, `fill` (story 36, :672).
  
  Tách `SIGNALS` ra hằng ở đầu file (hoặc helper) để describe mới dùng lại.
- `src/lib/subs/lesson.ts` -- `subLessonContext(lessonId).tenses` lấy từ `grammar.tenses`. Thêm thì của side khối "Chọn thì".
- `src/data/videos/videos.json:115-145` -- begKNGxcjdk (s1-t3-w1 grammar), mV_CEIroJs8 (s1-t3-w2 pronunciation). `videos.test.ts` có luật 1–2 video mỗi bài và test đoạn tồn tại.
- `src/data/roadmap/stage-1.ts` -- s1-t4-w4 không có đoạn grammar / entertainment. Không sửa (`roadmap.test.ts:225` so với file lộ trình).
- Vitest env `node`, chỉ `src/**/*.test.ts`; component kiểm qua hàm thuần trong file `.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/lessons/types.ts`:
  - `Tense.signalWords?: readonly string[]`, doc "từ / cụm tín hiệu của thì, hiện thành chip dưới dòng thời gian (story 39)";
  - kiểu `TenseChoiceSide = { tenseId: string; whenVi: string; example: { en: string; vi: string } }` (timeline, tên, chip lấy từ Tense);
  - kiểu `MinimalPair = { a: { en: string; vi: string }; b: { en: string; vi: string }; noteVi: string }`;
  - kiểu `ViWordChoice = { vi: string; options: readonly { en: string; whenVi: string; example: { en: string; vi: string } }[] }`;
  - kiểu `TenseChoice = { id; name; use; sides?: readonly [TenseChoiceSide, TenseChoiceSide]; viWords?: readonly ViWordChoice[]; pairs: readonly MinimalPair[]; formulas: Tense['formulas']; rules: readonly string[]; practice: TensePractice }`;
  - `GrammarContent.choices?: readonly TenseChoice[]`;
  - `PronunciationBlock` thêm `{ kind: 'tense-table'; title; note?; rows: readonly TenseTableRow[]; auxRules: readonly string[] }`, với `TenseTableRow = { tenseId; name; aux; affirmative; negative; question; lessonId }`.
- [x] `src/data/lessons/t1-grammar.ts`, `src/data/lessons/t2-t4-grammar.ts` -- thêm `signalWords` đúng bảng Design Notes; thêm `choices` vào `GRAMMAR_T2_W1`, `GRAMMAR_T3_W2`, `GRAMMAR_T3_W4`.
- [x] `src/data/lessons/tense-choices.ts` (mới) -- `SIMPLE_VS_CONTINUOUS`, `WILL_VS_GOING_TO`, `DONT_TRANSLATE` theo Design Notes. Chỉ import kiểu, không import file thì (tránh vòng).
- [x] `src/data/lessons/t2-t4-pronunciation.ts` -- `STAGE_1_TENSE_TABLE` (khối `tense-table`), nối vào cuối `PRONUNCIATION_T4_W4.blocks`.
- [x] `src/data/lessons/index.ts` -- `allTenseChoices(): TenseChoice[]` theo thứ tự bài; export kiểu mới.
- [x] `src/lib/tense-practice.ts`:
  - `PracticeSubject = Pick<Tense, 'id' | 'name' | 'formulas' | 'rules'> & { practice: TensePractice }`;
  - `PracticeTense` giữ nguyên (gán được cho `PracticeSubject`).
- [x] `src/lib/tense-choice.ts` (mới) -- hàm thuần:
  - `choiceSides(choice, tenses = allTenses())` trả `[{ tense, whenVi, example }]` hoặc `[]` khi không có `sides`. Thiếu Tense thì ném lỗi rõ id;
  - `lessonTenseIds(content)`: id thì của `grammar.tenses` rồi id side của `choices`, bỏ trùng, giữ thứ tự.
- [x] `src/components/lesson/SignalWords.tsx` (mới) -- `<div>` có `h4` "Từ tín hiệu" (cỡ chữ như các `h4` của TenseCard), `ul` chip `lang="en"` (`rounded-full border px-2 py-0.5 text-xs`, `flex flex-wrap gap-1.5`), dòng ghi chú `text-xs text-muted-foreground`: "Gặp các từ này, hãy nghĩ tới thì này, nhưng vẫn đọc cả câu.". Prop `heading?: false` để side của khối ẩn tiêu đề và ghi chú (thẻ khối có một ghi chú chung dưới hai bên: "Chip là từ hay đi với mỗi thì, chỉ để gợi ý: có từ đi được với cả hai thì. Chọn theo quy tắc bên dưới.").
- [x] `src/components/lesson/TenseCard.tsx` -- có `signalWords` (≥ 1) thì vẽ `<SignalWords words={…} />` ngay sau timeline. Không đổi class sẵn có.
- [x] `src/components/lesson/TenseChoiceCard.tsx` (mới) -- `<article>`:
  - `h3` tên khối, `use` (GlossaryText);
  - có `sides`: `grid grid-cols-1 gap-3 sm:grid-cols-2`, mỗi side một ô viền gồm tên Tense (h4), `TenseTimeline` của Tense, "Dùng khi: {whenVi}", `SignalWords` (không tiêu đề), câu ví dụ (`ListenButton` + `ReadableText` + vi);
  - có `viWords`: mỗi chữ một ô, tiêu đề "“{vi}”", danh sách cách nói (en đậm `lang="en"`, whenVi, ví dụ có nút nghe);
  - "Cặp câu dễ nhầm": mỗi cặp một ô viền, hai dòng a / b (nút nghe + câu + vi), ghi chú `text-xs` (GlossaryText);
  - "3 quy tắc chọn": `ol` (GlossaryText);
  - mọi câu tiếng Anh bọc `break-words`.
- [x] `src/components/lesson/TensePractice.tsx` -- `TenseRecap`, `PracticePlayer`, `TensePractice` nhận `PracticeSubject`. Không đổi chữ hay class.
- [x] `src/components/lesson/LessonContentParts.tsx` -- `GrammarSection` vẽ mỗi `choice` thành `<TenseChoiceCard>` + `<TensePractice tense={choice} open={openPracticeId === choice.id} …>`, sau các thì, trước bảng động từ và Review. Không thêm class cho wrapper cũ. Sửa doc.
- [x] `src/components/lesson/PronunciationBlocks.tsx` -- `TenseTableBlock`:
  - trong `BlockShell`, `ol` các dòng, mỗi dòng `li` viền (`rounded-lg border p-2 text-sm`) gồm:
    - dòng đầu: `Link` tên → `sectionHref(lessonId, 'grammar')` + chip trợ động từ;
    - 3 dòng `lang="en"` có nhãn "+" / "−" / "?" (nhãn đọc màn hình "Khẳng định" / "Phủ định" / "Câu hỏi") và `ListenButton` size `sm`;
  - sau danh sách: `h4` "Luật chung của trợ động từ" + `ol` `auxRules` (GlossaryText);
  - thêm nhánh `tense-table` vào `PronunciationBlockView`.
- [x] `src/data/foundation/glossary.ts` -- 4 mục cuối nhóm F17, đúng bảng Design Notes. Sửa doc đầu file (mục có thể là tên gọi tắt V-ing / V2 / V3).
- [x] `src/data/foundation/bricks/f17.ts` -- chèn chữ vào `vi` của hai ví dụ contrast theo Design Notes. Không đổi `en`, `audioText`, câu luyện, thẻ quy tắc.
- [x] `src/lib/subs/lesson.ts` -- `tenses` = `lessonTenseIds(content)` map sang `{ id, name }` của Tense. `words` giữ như cũ.
- [x] `src/data/videos/videos.json` -- begKNGxcjdk: `lessonId` `s1-t3-w2` (giữ `sectionId` grammar). mV_CEIroJs8: `lessonId` `s1-t4-w4` (giữ `sectionId` pronunciation). Thứ tự mục trong file xếp lại theo bài.
- [x] `src/data/lessons/lessons.test.ts`:
  - đưa `SIGNALS` và helper của nó ra phạm vi file;
  - describe "chọn thì, từ tín hiệu, bảng trợ động từ (story 39)" kiểm:
    - **signalWords:** đúng bảng (hằng `SIGNAL_WORDS` chép từ Design Notes); 4 Tense không có; mỗi từ có trong chữ tiếng Anh của Tense hoặc F18;
    - **chỗ đặt khối:** `choices` của s1-t2-w1 / s1-t3-w2 / s1-t3-w4 đúng id, bài khác không có. Id khối không trùng id Tense. Side trỏ đúng cặp Tense và mỗi Tense có `signalWords`;
    - **khối so sánh:** 3–4 cặp câu (a ≠ b). 7 câu chính, mỗi bên ≥ 2 câu có chuỗi đáp án (đề đã điền / câu gõ) mang dạng của bên đó:
      - tiếp diễn = am / is / are / 'm / 's / 're (+ not) + V-ing, đơn = không có;
      - going to = `going to`, will = `will` / `'ll` / `won't`;
    - **khối dịch:** `viWords` đúng đã / sẽ / chưa, mỗi chữ 2–3 cách. 6 câu chính đều `type` khớp `TRANSLATE_RE`. Luật `TIME_TAILS`;
    - **mọi khối:** `practiceProblems` rỗng; id câu luyện không trùng câu luyện của thì, viên gạch, câu quiz;
    - **phạm vi chữ:** khối s1-t2-w1 qua `outOfScopeWords('present-continuous', …)` (đề gõ qua `promptEnglish`). Khối s1-t3-w2 / s1-t3-w4 không có `SIGNALS` của bài sau. Không có some / any / many / much / because / so / "Don't + V";
    - **bảng:** 10 dòng đúng thứ tự `tenseId` Design Notes; `lessonId` = bài chứa Tense; phủ định có not / n't, câu hỏi kết thúc `?`; 3 `auxRules`, câu 3 có "Do you can". Test s1-t4-w4 cũ (`grammar` undefined, 2 khối `overview`) vẫn qua.
- [x] `src/lib/tense-choice.test.ts` (mới):
  - `choiceSides` trả đúng Tense, timeline kind (`habit` / `progress`, `future-point` / `plan`), `[]` cho khối dịch, ném lỗi với id lạ;
  - `lessonTenseIds` cho s1-t3-w2 = `['going-to', 'will']`, s1-t2-w1 = `['present-continuous', 'present-simple']`, s1-t1-w1 = `['to-be']`.
- [x] `src/lib/subs/subs.test.ts` (hoặc file test của `lesson.ts`) -- `subLessonContext('s1-t3-w2').tenses` có will và going-to; `highlightReason` của cue `highlight: ['will']` ở s1-t3-w2 ra "Tương lai với will".
- [x] `src/data/videos/videos.test.ts` -- ca: `videosFor('s1-t3-w2', 'grammar')` có begKNGxcjdk; `videosFor('s1-t3-w1')` không có; `videosFor('s1-t4-w4', 'pronunciation')` có mV_CEIroJs8. Luật 1–2 video vẫn qua.
- [x] `src/data/foundation/glossary.test.ts`:
  - nới số mục thành 30–38;
  - ca `splitGlossaryText`: "S + am / is / are + V-ing" → chip `subject`, `v-ing`; "have / has + V3, không dùng V2" → `v3`, `v2`; "trợ động từ" → `auxiliary`;
  - test "ghép lại đúng chuỗi gốc" thêm lời Việt của khối "Chọn thì" và `auxRules`.
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- mục "Nội dung bài", thêm một gạch: "Từ tín hiệu và chọn thì (story 39): mỗi thì có mốc thời gian hiện hàng chip từ tín hiệu. Khối "Đơn hay tiếp diễn?" (s1-t2-w1), "will hay going to?" (s1-t3-w2), "Đừng dịch từng chữ: đã · sẽ · chưa" (s1-t3-w4) có dòng thời gian cạnh nhau / bảng chữ Việt, cặp câu dễ nhầm và phần luyện như phần luyện của thì (không ghi Sổ lỗi). Ôn tổng s1-t4-w4 có bảng mỗi thì một dòng và luật chung trợ động từ."

**Acceptance Criteria:**
- Given Huy ở 375px trên `/roadmap/lesson/s1-t2-w1/grammar`, `/roadmap/lesson/s1-t3-w2/grammar`, `/roadmap/lesson/s1-t3-w4/grammar` và `/roadmap/lesson/s1-t4-w4`, when cuộn hết trang và mở khối luyện "Chọn thì", then không trang nào tràn ngang (`scrollWidth` = 375), hai dòng thời gian xếp chồng, nút đủ lớn để chạm.
- Given Huy mở buổi 30' có bài s1-t3-w2 là bài chính, when tới bước Bài chính, then thấy TenseCard going to (có chip tín hiệu), khối luyện của nó, rồi thẻ "will hay going to?" và khối luyện của thẻ, giống trang bài.
- Given Huy làm hết phần luyện của cả ba khối, sai vài câu, when xem Sổ lỗi và Lộ trình, then không có mục Sổ lỗi mới, không có lần làm quiz mới, bài không tự đánh dấu xong.
- Given máy ≥ 1024px, when mở `/roadmap/lesson/s1-t2-w1/grammar`, then hai side của khối nằm cạnh nhau trong cột chính, không tràn.
- Given `npm run layout:guard`, when chạy, then chỉ báo class thêm ở các file có phần UI mới: `TenseCard.tsx` (nếu có), `SignalWords.tsx`, `TenseChoiceCard.tsx`, `PronunciationBlocks.tsx`. `npm run layout:check` đạt, ảnh 375px các route trong `ROUTES` trùng baseline.

## Implementation Notes

- **Từ tín hiệu:** `Tense.signalWords` cho 10 thì, đúng bảng Design Notes trừ một từ: **"every evening" của `present-simple-questions` bị bỏ** vì không có trong chữ của thì đó hay F18 (chỉ có ở `present-simple`), theo luật "từ không tìm thấy thì bỏ khỏi bảng". "in 2020" (`past-to-be`) và "ago" (`past-simple`) chỉ có trong `use` của thì (mốc tiếng Anh trong ngoặc), nên test tính cả `use` là chữ của thì. `SignalWords.tsx` vẽ ngay sau `TenseTimeline` trong `TenseCard` (TenseCard không thêm class).
- **Khối "Chọn thì":** `src/data/lessons/tense-choices.ts` (`SIMPLE_VS_CONTINUOUS`, `WILL_VS_GOING_TO`, `DONT_TRANSLATE`, chỉ `import type`), gắn vào `GRAMMAR_T2_W1` / `GRAMMAR_T3_W2` / `GRAMMAR_T3_W4`; `allTenseChoices()` và export 3 khối ở `index.ts`. `TenseChoiceCard.tsx` + `TensePractice` (nhận `PracticeSubject`, không đổi chữ / class) vẽ sau các thì trong `GrammarSection`, dùng chung `openPracticeId`. Hàm thuần `choiceSides`, `lessonTenseIds` ở `src/lib/tense-choice.ts`.
- **Chỉnh chữ so với Design Notes (giữ đáp án, điểm dạy, số câu):**
  - `simple-vs-continuous-e1` đổi "Look! The children ___ in the garden." thành "Look! The kids ___ on the beach." vì trùng hệt đề quiz `q-s1-t2-w1-01` (test mới so đề luyện của khối với đề quiz cùng bài);
  - `simple-vs-continuous-c7` gợi ý "(sister, go to work by bus)" thay cho "(go to work by bus)": câu dịch chỉ chấm ngữ pháp, gợi ý cho đủ từ nội dung (luật story 36);
  - `accept` chỉ giữ bản khác `answer` sau `normalizeTyped`: "I'm going to …", "We're …", "I'll help you.", "I've been …" chuẩn hoá trùng đáp án (I'm = I am…), nên `practiceProblems` (story 35) cấm ghi; chúng vẫn được chấm đúng. "Da Lat" / "Dalat" được luật bỏ khoảng trắng của `matchesTyped` nhận sẵn, không cần `accept`. Còn lại mỗi câu dịch / gõ cả câu không phải câu hỏi có bản trạng ngữ lên đầu (`c7` của hai khối so sánh, `dont-translate-c1`, `-c3`, `-c5`);
  - `dont-translate` có thêm `sampleEn` ở bước áp dụng (khác 2 câu nói); ý "không có đã mà có mốc vẫn là V2" gộp vào lựa chọn (1) của "đã" sau review (xem Spec Change Log).
- **Bảng "Mỗi thì một dòng":** `STAGE_1_TENSE_TABLE` nối sau 2 khối ôn tổng của `PRONUNCIATION_T4_W4`; `TenseTableBlock` trong `PronunciationBlocks.tsx` (link tên thì → `sectionHref(lessonId, 'grammar')`, chip trợ động từ, 3 dòng + / − / ? có nhãn đọc màn hình và `ListenButton` sm, luật chung có `GlossaryText`).
- **Glossary / F17:** 4 mục `auxiliary`, `v-ing`, `v2`, `v3` (F17) cuối nhóm F17; F17 `contrast.examples` chỉ đổi `vi` ("5 dạng của go. Từ Năm 1 gọi tắt: V1 = nguyên mẫu (go), V-ing (going), V2 (went), V3 (gone)"; "(have / has là trợ động từ; have / has + gone: …)"). Từ nay mọi "V-ing" / "V2" / "V3" / "trợ động từ" lần đầu trong lời Việt có `GlossaryText` (công thức TenseCard, quy tắc…) đều thành chip; s1-t1-w1 không có các chữ này nên ảnh 375px không đổi.
- **Video / phụ đề:** begKNGxcjdk → s1-t3-w2 (grammar), mV_CEIroJs8 → s1-t4-w4 (pronunciation), `videos.json` xếp theo bài. `subLessonContext` lấy thì qua `lessonTenseIds` (thì của bài + thì các bên khối), nên s1-t3-w2 tô cả cue `will` ("Tương lai với will"). File phụ đề không đổi.
- **Test:** `lessons.test.ts` đưa `V3_FORMS`, `hasPerfect`, `hasPassive`, `SIGNALS`, `lessonOrder` ra phạm vi file (story 38 dùng lại) + describe story 39 (9 test); `tense-choice.test.ts` (mới, 5 test); `subs.test.ts` (+1), `videos.test.ts` (+2, gồm thứ tự bài), `glossary.test.ts` (30–38 mục, ca tên gọi tắt, ghép chuỗi gồm lời Việt khối và `auxRules`).
- **Kiểm chứng:** `npm run lint`, `npm test` (81 file, 1933 test), `npm run build` qua. `npm run layout:guard`: chỉ báo class thêm ở `SignalWords.tsx` (11), `TenseChoiceCard.tsx` (25), `PronunciationBlocks.tsx` (10); không class nào bị xoá. `npm run layout:check`: 12 route × 5 bề rộng ok, ảnh 375px trùng baseline; riêng "thử phím tắt @ 1280px: F01 gõ "chào 1"" báo LỖI như ở baseline (lỗi probe có sẵn từ story 35, đã ghi ở story 36, 38).
- **Kiểm tay (Chrome headless qua CDP, dev server, `VITE_SUPABASE_*` rỗng, store đã bỏ qua Sân ga):** 375px `scrollWidth` = 375 ở s1-t2-w1/grammar, s1-t3-w2/grammar, s1-t3-w4/grammar, s1-t4-w4; chip "now · right now · today · this year · Look!" (`lang="en"`); hai side xếp chồng ở 375px, cạnh nhau ở 1280px trong cột chính; mở khối luyện thì rồi khối "Chọn thì" thì khối thì đóng; faded "is raining" đúng; chọn "am understanding" hiện giải thích động từ trạng thái; 3/7 → lời mời, "Xem lại giải thích" hiện 2 công thức + quy tắc khối, 2 câu dễ hơn → bước Áp dụng; store `mistakes` / `quizzes` / `progress` / `house` không đổi; s1-t3-w2 có thẻ "will hay going to?" (3 cặp) và video begKNGxcjdk, s1-t3-w1 không còn; s1-t3-w4 có ô "đã" / "sẽ" / "chưa"; s1-t4-w4 bảng 10 dòng, 30 nút nghe, chip "trợ động từ"; chip "V-ing" mở Sheet "Viên gạch F17".
- **Chưa kiểm tay:** bước Bài chính của buổi 30' với s1-t3-w2 (cùng `GrammarSection` nên hiện như trang bài), tô phụ đề trong player thật (đã có test `highlightReason`), iPhone thật.

## Spec Change Log

- **2026-11-12 · review story 39 (vá trong bước triage, không quay lại bước làm):** sửa chữ ở Design Notes và Tasks (ngoài vùng frozen), giữ số câu, số cặp, số dòng bảng, số mục glossary và id cũ.
  - Lý do (finding): chip will / going to mâu thuẫn quy tắc 3 của khối (#3, #29); "for" của `present-perfect-vs-past` cũng đi với quá khứ đơn ngay trong ví dụ của bài (#4); câu `simple-vs-continuous-c5` có hai đáp án (#5); cột trợ động từ của bảng lẫn V-ing / V3 / going to và một số dòng đổi chủ ngữ (#6, #7); "đã" có hai lựa chọn V2 (#9); gợi ý "(be to)" (#11); lời giải "sai" quá tuyệt đối (#12); định nghĩa trợ động từ / V2 / V3 sai hoặc dùng thứ chưa dạy (#14, #45); phần luyện will / going to nghiêng 5/2 và c6 có hai đáp án (#15, #36); "but" chưa dạy ở Chặng 1 (#27); ví dụ "chưa → Did" không có chữ "chưa" (#29).
  - Đã đổi: bảng từ tín hiệu bỏ "for"; khối 1 (cặp 1 ghi chú, cặp 4 câu b, worked / say-1 / say-2 tách hai câu không có but, c2 gợi ý, c3 lời giải, c5 ngữ cảnh "I am sick", apply "2 câu"); khối 2 (c2 apartment, c5 thành câu hứa → will, c6 "We … decided yesterday" → aren't going to go); khối 3 ("đã" còn 2 cách, gộp ý "không có đã"; ví dụ / cặp "chưa" dịch có "chưa"; công thức hoàn thành tách ever / yet sang câu hỏi; quy tắc 1 và worked thêm "trải nghiệm"; c2 gợi ý "(been to)", lời giải c2 / c6 mềm lại, thêm been to / gone to); bảng (cột trợ động từ chỉ còn trợ động từ, cùng chủ ngữ ở + / − / ?, dòng hiện tại đơn trỏ `present-simple-questions` ở s1-t1-w3 nơi dạy do / does; luật 2 thêm "trừ to be"); glossary (định nghĩa auxiliary theo việc nó làm, V2 / V3 không còn "cột", "bị động", "quá khứ phân từ"); F17 gọi tên "goes"; ghi chú chip: bên của khối ẩn ghi chú, thẻ khối có một ghi chú chung "chỉ để gợi ý".
  - Trạng thái xấu tránh được: chip dạy điều quy tắc của khối phủ nhận; câu luyện có hai đáp án mà chỉ chấm một; bảng làm người học nghĩ "Going to she travel?".
  - KEEP: id mọi câu luyện / khối / dòng (trừ `tenseId` dòng hiện tại đơn); số câu 7 / 7 / 6 + 2 câu dễ hơn; vị trí khối và video theo Intent; đáp án `Have you had lunch yet?` và "Did you have lunch?" vẫn chấm sai như bảng I/O.

## Review Triage Log

Nguồn: B = Blind, E = Edge, V = Verification gap, C = Content (C-M: mức vừa, C-L: mức thấp).

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | B | Video nối âm mV_CEIroJs8 rời bài dạy nối âm s1-t3-w2 | low | Đúng như Intent (frozen) chọn để giữ luật 1–2 video; khối LINKING vẫn có audio, ôn tổng s1-t4-w4 có dòng "Nối âm". Sắp lại video là việc story 47 | defer |
| 2 | B | Tuần will (s1-t3-w1) không còn video nói về will | low | Còn psI7E_J1zPo (was / were). Intent loại "sắp lại video khác" khỏi story này (47) | defer |
| 3 | B | Chip will (tomorrow, tonight) / going-to (this weekend, next month) mâu thuẫn quy tắc 3 của khối | medium | `t2-t4-grammar.ts:686,748` vs `tense-choices.ts:223`; không đổi được chip sang "I promise"… vì Tense will chưa có chữ đó và không được sửa dữ liệu Tense. Ẩn ghi chú "nghĩ tới thì này" ở hai bên, thêm ghi chú chung "chỉ để gợi ý, có từ đi được với cả hai thì" dưới hai bên | patch |
| 4 | B | Chip dùng chung / mơ hồ: Look!, never, "for" | medium | "for" sai ngay trong bài: ví dụ "I lived in Hue for two years." (`t2-t4-grammar.ts`). Bỏ "for". Look! / never đúng cho cả hai thì, có ghi chú "vẫn đọc cả câu" | patch |
| 5 | B | `simple-vs-continuous-c5` "It's Sunday" là lịch thường, "don't work" cũng đúng | medium | Gợi ý nói "khác ngày thường" trái ngữ cảnh. Đổi thành "I am sick." | patch |
| 6 | B | Cột trợ động từ lẫn V-ing / V3 / going to | medium | `t2-t4-pronunciation.ts:300-307` trái ghi chú của chính bảng. Cột chỉ còn trợ động từ | patch |
| 7 | B | Dòng to-be / past-simple / will đổi chủ ngữ giữa + / − / ? | low | Đúng ở 3 dòng. Sửa trực tiếp cho cùng chủ ngữ | patch |
| 8 | B | Bảng thiếu quá khứ bất quy tắc ("didn't went") | low | Luật 2 đã ghi "Did you go?", bài bất quy tắc có lỗi "didn't went"; thêm dòng phá "10 dòng" của Intent | reject |
| 9 | B | Ô "đã" có hai lựa chọn V2, lựa chọn 3 không phải "đã" | low | `tense-choices.ts:344-358`. Gộp vào lựa chọn 1, còn 2 cách | patch |
| 10 | B | Phần luyện dịch không có câu "Did you …? + mốc", "have never" chỉ ở e1 | low | Đúng, nhưng "chưa → Did" có ở bảng chữ, cặp 2, quy tắc 3 và lỗi của PERFECT_VS_PAST; thay câu là đổi chủ đích 6 câu Design Notes | reject |
| 11 | B | Gợi ý "(be to)" sai, không giải thích been / gone | medium | F17 dạy "has gone", người học dễ gõ gone. Gợi ý "(been to)", lời giải thêm been to / gone to | patch |
| 12 | B | Lời giải coi "Did you have lunch?", "I went to Da Lat twice" là sai | low | Tiếng Anh Mỹ chấp nhận. Giữ chấm theo bảng I/O, lời giải đổi thành "người Mỹ cũng nói, nhưng ở đây nên dùng…" | patch |
| 13 | B | Test phạm vi không xét chữ Anh trong rules / formulas / use / noteVi | low | Đọc tay ba khối: không có dấu hiệu bài sau hay từ cấm trong các trường đó; tách chữ Anh khỏi lời Việt là logic mới | reject |
| 14 | B | Định nghĩa trợ động từ thiếu was / were, can; V1 không có mục | medium | Định nghĩa sửa theo việc nó làm (gồm was / were, can). V1 có từ trước story này và được giải thích tại chỗ ("V1 (nguyên mẫu)"); Intent chốt 4 mục | patch |
| 15 | B | Luyện will / going to nghiêng 5 going to / 2 will, c5 chỉ hỏi dạng | medium | Đếm đúng 5/2. c5 thành câu hứa (will), c6 thành câu đã quyết (going to): 3 will / 4 going to; thêm test | patch |
| 16 | B | "không đang uống cà phê" gượng, cặp 4 yếu | low | Sửa trực tiếp: "He isn't drinking coffee now. He is drinking tea." / "Lúc này anh ấy không uống cà phê, anh ấy đang uống trà." | patch |
| 17 | B | Ghi chú SignalWords lặp hai lần trong thẻ khối | low | `SignalWords.tsx:16` luôn vẽ. Ẩn khi `heading={false}`, thẻ khối có một ghi chú chung | patch |
| 18 | B | s1-t2-w1 tô thêm cue hiện tại đơn, không test | false | Intent: "tô theo cả hai thì mà khối Chọn thì của bài so sánh"; `tense-choice.test.ts` kiểm `lessonTenseIds('s1-t2-w1')`. `words` giữ như cũ theo Tasks | reject |
| 19 | B | Spec còn `in-progress` | false | Bước này mới đặt `done` (step-05) | reject |
| 20 | E | `choiceSides` ném lỗi khi vẽ nếu thiếu Tense | false | Dữ liệu tĩnh, test "bên trỏ đúng cặp thì" chặn; ném lỗi rõ id là hành vi spec yêu cầu | reject |
| 21 | E | Hai bên cùng tenseId → trùng key | false | Test chốt cặp id cụ thể của hai khối | reject |
| 22 | E | pairs rỗng / rules ≠ 3 → tiêu đề sai | low | Test chốt 3 quy tắc và ≥ 2 cặp; thêm nhánh là thêm độ phức tạp | reject |
| 23 | E | Chip trùng từ → trùng key | false | Test `toEqual` bảng chip, không có từ trùng | reject |
| 24 | E | Cặp câu khác nhiều hơn thì, trái doc "chỉ khác ở thì" | low | Đúng với doc `MinimalPair`; cặp cố ý đổi ngữ cảnh. Sửa doc | patch |
| 25 | V | Câu gõ của khối không chạy qua bộ chấm thật | medium | Lỗ hổng đã kiểm sẵn (test story 36 chỉ lặp 6 thì). Thêm test `hasVietnameseMarks` / `isFadedCorrect` / `isCorrect` cho mọi khối + golden bảng I/O | patch |
| 26 | V | Hành vi UI (một khối mở, Enter, store không đổi) không có test tự động | low | Đúng quy ước repo (Vitest `node`, chỉ `.ts`), đã kiểm tay ở Implementation Notes | reject |
| 27 | C-M | (= #3) chip will / going to trái quy tắc 3 | medium | Như #3 | patch |
| 28 | C-M | "but" chưa dạy ở Chặng 1 (worked, say-1, say-2) | medium | `recovered-audit.md:42`: liên từ chỉ có từ s2-t7-w1; grep bài Chặng 1 không có "but". Tách hai câu, test cấm thêm "but" | patch |
| 29 | C-M | (= #5) c5 mơ hồ | medium | Như #5 | patch |
| 30 | C-M | Ví dụ "chưa → Did you …?" không có chữ "chưa" | medium | `tense-choices.ts:387,404`. Dịch "Hôm qua bạn gọi cho anh ấy chưa?", "Sáng nay bạn xem email chưa?" | patch |
| 31 | C-M | (= #6) cột trợ động từ | medium | Như #6 | patch |
| 32 | C-M | Định nghĩa "trợ động từ" trái dòng to be | medium | "Từ đứng trước động từ chính" sai với "I am tired". Như #14 | patch |
| 33 | C-L | Ghi chú cặp 1 "động từ thêm -s" quá rộng | low | Sửa trực tiếp "→ hiện tại đơn (she → works)" | patch |
| 34 | C-L | Gợi ý c2 "Be quiet! nghĩa là đang xảy ra" sai nghĩa | low | Sửa trực tiếp: "Be quiet! = Im lặng nào!, vì em bé ngủ ngay lúc nói" | patch |
| 35 | C-L | Lời giải c3 "Are / Is chỉ đi với V-ing" | low | Sửa trực tiếp "Với động từ thường như walk…" | patch |
| 36 | C-L | (= #16) câu Việt cặp 4b | low | Như #16 | patch |
| 37 | C-L | Bước áp dụng "2 cặp câu" mà mẫu 1 cặp | low | Sửa thành "2 câu" | patch |
| 38 | C-L | `will-vs-going-to-c6` có hai đáp án | medium | "She won't come… She told me" là ý của cô ấy; câu mới "We … decided yesterday" (người nói đã quyết) | patch |
| 39 | C-L | c2 dùng "flat" (Anh-Anh) | low | Đổi "apartment" | patch |
| 40 | C-L | (= #12) lời giải c6 tuyệt đối | low | Như #12 | patch |
| 41 | C-L | (= #11) gợi ý "(be to)" | medium | Như #11 | patch |
| 42 | C-L | Công thức hoàn thành đặt ever / yet vào câu khẳng định | low | Dễ sinh "I have ever eaten". Tách: never ở câu khẳng định, ever / yet ở câu hỏi | patch |
| 43 | C-L | Quy tắc 1 và worked "đã không mốc → have" quá tuyệt đối | low | Thêm "nói trải nghiệm hay việc vừa xong" | patch |
| 44 | C-L | (= #9) lựa chọn 3 của "đã" | low | Như #9 | patch |
| 45 | C-L | Luật 2 "quá khứ đơn" lẫn với to be quá khứ | low | Thêm "trừ to be am / is / are, was / were" | patch |
| 46 | C-L | Dòng hiện tại đơn link s1-t1-w2, nơi chưa dạy do / does; dòng quá khứ đổi chủ ngữ | low | do / does dạy ở `PRESENT_SIMPLE_QUESTIONS` (s1-t1-w3). Đổi `tenseId` dòng sang thì đó; chủ ngữ như #7 | patch |
| 47 | C-L | V2 / V3 nói "cột", "bị động", "quá khứ phân từ" mà F17 không có | low | Bị động dạy ở s1-t4-w3, chip V3 hiện từ s1-t3-w3. Bỏ các chữ đó, nhãn V3 còn "V3" | patch |
| 48 | C-L | F17 "5 dạng" chỉ gọi tên 4 | low | Chèn "goes = V1 thêm -es" | patch |
| 49 | C-L | Ghi chú chip "thì nghĩ tới thì này" lặp chữ "thì" | low | Đổi "Gặp các từ này, hãy nghĩ tới thì này…" | patch |
| 50 | C-L | Chip yếu: today, this year, for | low | "for" bỏ như #4; today / this year đúng cho tiếp diễn, có ghi chú "vẫn đọc cả câu" | patch |

## Design Notes

**Từ tín hiệu** (`signalWords`, đúng thứ tự):

| Tense | Chip |
|---|---|
| `present-simple` | every day · every morning · always · usually · often · sometimes · never · on Sundays |
| `present-simple-questions` | every day · every evening · usually · often |
| `present-continuous` | now · right now · today · this year · Look! |
| `past-to-be` | yesterday · last night · last Monday · in 2020 |
| `past-simple` | yesterday · last night · last week · last year · ago |
| `past-simple-irregular` | yesterday · last night · last week · last weekend |
| `will` | tomorrow · tonight |
| `going-to` | this weekend · next month · Look! |
| `present-perfect` | ever · never · just · already · yet · before · twice |
| `present-perfect-vs-past` | since · How long · so far |

Từ nào không tìm thấy trong chữ của Tense / F18 thì bỏ khỏi bảng (ghi vào Implementation Notes), không sửa dữ liệu Tense để có chữ. Hiện tại tất cả đều tìm thấy.

**Khối 1 · `simple-vs-continuous` "Đơn hay tiếp diễn?"** (s1-t2-w1).
- `use`: "Tiếng Việt chỉ thêm "đang" hoặc không thêm gì; tiếng Anh bắt buộc chọn một trong hai thì."
- Sides:
  - `present-simple`: "Thói quen, lịch cố định, sự thật"; ví dụ "My father reads the news every morning.";
  - `present-continuous`: "Việc đang diễn ra lúc nói, hoặc quanh dạo này"; ví dụ "My father is reading a book now.".
- `formulas`: Hiện tại đơn "S + V / V-s: She works every day." · Hiện tại tiếp diễn "S + am / is / are + V-ing: She is working now.".
- `rules`:
  1. "Thói quen, lịch, sự thật (every day, usually, on Sundays) → hiện tại đơn. Đang xảy ra lúc nói (now, right now, Look!) → tiếp diễn."
  2. "Nghề, nơi làm thường ngày dùng hiện tại đơn (I work at a bank). Hôm nay khác thường thì dùng tiếp diễn (Today I am working at home)."
  3. "Động từ trạng thái (know, like, want, need, understand) dùng hiện tại đơn, kể cả khi có now."
- Cặp câu:
  1. "She works at a bank." / "She is working at home today." · Nghề → hiện tại đơn (she → works); hôm nay khác thường → is + V-ing.
  2. "I watch TV every evening." / "I am watching TV now."
  3. "Do you cook?" (Bạn có hay nấu ăn không?) / "Are you cooking?" (Bạn đang nấu à?)
  4. "He doesn't drink coffee." / "He isn't drinking coffee now. He is drinking tea." (Lúc này anh ấy không uống cà phê, anh ấy đang uống trà.)
- Luyện:
  - worked: "I usually walk to work. Today I am taking a taxi." (`timeline: { kind: 'progress', … }`), ghi chú: usually → thói quen; today khác thường → tiếp diễn.
  - faded: "Look! It ___ (rain)." → `is raining`.
  - Câu chính:
    - c1 type "She ___ (go) to the gym every Monday." → `goes`;
    - c2 type "Be quiet! The baby ___ (sleep)." → `is sleeping`;
    - c3 choice "___ you usually walk to work?" [Do, Are, Is] → Do;
    - c4 choice "What ___ you doing right now?" [are, do, does] → are;
    - c5 type "I ___ (not / work) today. I am sick." → `am not working`;
    - c6 choice "I ___ your idea now." [understand, am understanding, understanding] → understand;
    - c7 type "Dịch sang tiếng Anh: Chị tôi đi làm bằng xe buýt mỗi ngày. (go to work by bus)" → `My sister goes to work by bus every day.`, accept bản "Every day …".
  - Câu dễ hơn:
    - e1 choice "Look! The children ___ in the garden." [are playing, play, plays];
    - e2 choice "My brother ___ football every Sunday." [plays, playing, play].
  - apply: "Nói hoặc viết 2 câu: một việc bạn làm mỗi ngày, và việc bạn đang làm lúc này."; mẫu "I go to work every day. Now I am learning English."; say-1 "I usually cook. Today my sister is cooking.", say-2 "She works every day. Now she is resting." (không dùng but: liên từ chưa dạy ở Chặng 1).

**Khối 2 · `will-vs-going-to` "will hay going to?"** (s1-t3-w2).
- `use`: "Cả hai đều là "sẽ". Chọn theo lúc quyết định: vừa nghĩ ra → will; đã định từ trước hoặc thấy dấu hiệu → going to."
- Sides:
  - `will`: "Quyết định ngay lúc nói, lời hứa, lời đề nghị giúp, đoán theo ý mình"; ví dụ "The phone is ringing. I'll answer it.";
  - `going-to`: "Kế hoạch đã định trước khi nói, hoặc dấu hiệu ngay trước mắt"; ví dụ "I'm going to study in Da Nang. I decided last month.".
- `formulas`: will "S + will + V nguyên mẫu" · going to "S + am / is / are + going to + V nguyên mẫu".
- `rules`:
  1. "Vừa nghĩ ra lúc nói, hứa, đề nghị giúp → will."
  2. "Đã quyết trước khi nói (đã mua vé, đã bàn từ hôm qua), hoặc thấy dấu hiệu trước mắt → am / is / are going to."
  3. "tomorrow, next week đi được với cả hai: chữ chỉ thời gian không quyết định, phải nhìn lúc quyết định."
- Cặp câu:
  1. "OK, I'll buy the bread." (vừa nghĩ ra) / "I'm going to buy a new phone. I saved money for it." (đã định).
  2. "It will be hot tomorrow." (đoán) / "Look at those black clouds. It's going to rain." (thấy dấu hiệu).
  3. "I'll call you tonight, I promise." / "I'm going to call my mother tonight. It's her birthday."
- Luyện:
  - worked: "I'm going to cook pho tonight. I bought the beef this morning." (`plan`), ghi chú: mua thịt từ sáng = kế hoạch có trước; vừa mở tủ lạnh mới quyết thì nói "OK, I'll cook pho.".
  - faded: "The door is open. — OK, I ___ (close) it." → `will close`.
  - Câu chính:
    - c1 choice "The phone is ringing. — OK, I ___ answer it." [will, am going to, going to] → will;
    - c2 type "We ___ (move) to a new apartment next month. We signed the papers yesterday." → `are going to move`;
    - c3 choice "Look at that car! It ___ hit the tree!" [is going to, will, going to] → is going to;
    - c4 type "I'm thirsty. — Wait, I ___ (get) you a glass of water." → `will get`;
    - c5 choice "I promise I ___ be on time tomorrow." [will, am going to, going to] → will;
    - c6 type "We ___ (not / go) to the beach this weekend. We decided yesterday." → `aren't going to go`;
    - c7 type "Dịch sang tiếng Anh: Tháng sau tôi sẽ mua xe máy mới, tôi đã định từ trước. (buy a new motorbike)" → `I am going to buy a new motorbike next month.`, accept "I'm going to …" và hai bản "Next month …".
  - Câu dễ hơn:
    - e1 choice "I'm cold. — I ___ close the window for you." [will, will to, wills];
    - e2 choice "Look at the sky! It ___ rain." [is going to, going to, is go to].
  - apply: "Nói 2 câu: một kế hoạch đã định cho cuối tuần (going to) và một lời hứa với bạn (will)."; mẫu "I'm going to visit my parents this weekend. I'll call you tonight."; say-1 "I'm going to clean my room this weekend.", say-2 "OK, I'll help you.".

**Khối 3 · `dont-translate` "Đừng dịch từng chữ: đã · sẽ · chưa"** (s1-t3-w4), không có `sides`.
- `use`: "Chữ Việt không quyết định thì. Nhìn mốc thời gian và ý câu rồi mới chọn."
- `viWords`:
  - "đã":
    - (1) V2, khi có mốc đã xong (hôm qua, năm ngoái, … trước); câu Việt không có "đã" mà có mốc quá khứ cũng vậy: "I met him last year." · Tôi đã gặp anh ấy năm ngoái;
    - (2) have / has + V3, khi không nói lúc nào (trải nghiệm, vừa xong): "I have been to Hue twice." · Tôi đã đến Huế hai lần;
  - "sẽ":
    - (1) will, cho quyết định ngay, lời hứa, đoán: "I'll help you." · Tôi sẽ giúp bạn;
    - (2) am / is / are going to, cho kế hoạch đã định: "We're going to visit our grandmother this weekend." · Cuối tuần này chúng tôi sẽ thăm bà.
  - "chưa":
    - (1) Have you … yet? / haven't … yet, khi hỏi tính tới bây giờ: "Have you had lunch yet?" · Bạn ăn trưa chưa?;
    - (2) Did you …?, khi có mốc đã xong: "Did you call him yesterday?" · Hôm qua bạn gọi cho anh ấy chưa?;
    - (3) have never + V3 (chưa bao giờ): "I have never eaten durian." · Tôi chưa bao giờ ăn sầu riêng.
- `formulas`: Quá khứ đơn "S + V2 + mốc đã xong" · Hoàn thành "S + have / has (+ never) + V3. Hỏi: Have you ever + V3? / Have you + V3 … yet?".
- `rules`:
  1. "đã + mốc đã xong → V2; đã không mốc, nói trải nghiệm hay việc vừa xong tính tới giờ → have / has + V3."
  2. "sẽ → will hoặc going to, chọn theo lúc quyết định (khối will hay going to?)."
  3. "chưa? hỏi tới giờ → Have … yet?; có mốc đã xong → Did …?; chưa bao giờ → have never + V3."
- Cặp câu:
  1. "I finished my report yesterday." / "I have finished my report." · cùng "đã xong", khác vì có / không có mốc;
  2. "Did you see the email this morning?" (Sáng nay bạn xem email chưa?) / "Have you seen the email yet?" (Bạn xem email chưa?).
- Luyện:
  - worked: "I visited Hue last year." (`past-point`), ghi chú: có last year nên dùng V2; "Tôi đã đến Huế" không có mốc là I have visited Hue.
  - faded: "I ___ (not / finish) my homework yet." → `haven't finished`.
  - 6 câu chính, đều `type`:
    - c1 "Dịch sang tiếng Anh: Tôi đã gặp cô ấy năm ngoái. (meet)" → `I met her last year.` + "Last year I met her.";
    - c2 "Dịch sang tiếng Anh: Tôi đã đến Đà Lạt hai lần. (been to)" → `I have been to Da Lat twice.` + "I've been …", "… Dalat …";
    - c3 "Dịch sang tiếng Anh: Hôm qua tôi đi làm muộn. (go to work late)" → `I went to work late yesterday.` + "Yesterday I went to work late.";
    - c4 "Dịch sang tiếng Anh: Tôi sẽ giúp bạn. (lời hứa: help)" → `I will help you.` + "I'll help you.";
    - c5 "Dịch sang tiếng Anh: Cuối tuần này chúng tôi sẽ thăm bà, đã định rồi. (visit our grandmother)" → `We are going to visit our grandmother this weekend.` + "We're …", hai bản "This weekend …";
    - c6 "Dịch sang tiếng Anh: Bạn ăn trưa chưa? (have lunch, yet)" → `Have you had lunch yet?`.
    
    `explanationVi` của mỗi câu nói rõ vì sao không dịch theo chữ.
  - Câu dễ hơn:
    - e1 choice "Tôi chưa bao giờ ăn sầu riêng. → I ___ eaten durian." [have never, never, didn't];
    - e2 choice "Hôm qua tôi gặp Nam. → I ___ Nam yesterday." [met, have met, meet].
  - apply: "Nói 3 câu về bạn: một việc đã làm hôm qua, một trải nghiệm (have / has + V3), một kế hoạch (going to)."; say-1 "I watched a movie yesterday.", say-2 "I have never been to Japan.".

Chữ câu trong các khối có thể chỉnh nhẹ nếu va test (trùng, phạm vi). Phải giữ đáp án, điểm dạy của câu và số câu.

**Bảng `tense-table`** (s1-t4-w4). Tiêu đề "Mỗi thì một dòng". Ghi chú: "Chip cạnh tên thì là trợ động từ: từ nhận not và đổi lên đầu câu hỏi. Ba câu mỗi dòng giữ cùng chủ ngữ. Bấm tên thì để về bài."

| tenseId | Tên | Trợ động từ | + | − | ? |
|---|---|---|---|---|---|
| `to-be` | to be hiện tại | am / is / are | She is tired. | She isn't tired. | Is she tired? |
| `present-simple-questions` (bài s1-t1-w3) | Hiện tại đơn | do / does (mượn) | She works here. | She doesn't work here. | Does she work here? |
| `present-continuous` | Hiện tại tiếp diễn | am / is / are | He is cooking. | He isn't cooking. | Is he cooking? |
| `past-to-be` | to be quá khứ | was / were | It was cold. | It wasn't cold. | Was it cold? |
| `past-simple` | Quá khứ đơn | did (mượn) | They watched TV. | They didn't watch TV. | Did they watch TV? |
| `will` | Tương lai will | will | He will call you. | He won't call you. | Will he call you? |
| `going-to` | be going to | am / is / are | She is going to travel. | She isn't going to travel. | Is she going to travel? |
| `present-perfect` | Hiện tại hoàn thành | have / has | They have eaten. | They haven't eaten. | Have they eaten? |
| `modals` | can / should / must | can / should / must | You can swim. | You can't swim. | Can you swim? |
| `passive-present` | Bị động hiện tại | am / is / are | It is made in Vietnam. | It isn't made in Vietnam. | Is it made in Vietnam? |

`auxRules`:
1. "Câu đã có trợ động từ (am / is / are, was / were, will, have / has, can / should / must): phủ định thêm not ngay sau nó (isn't, won't, haven't, can't), câu hỏi đưa nó lên trước chủ ngữ, trả lời ngắn lặp lại nó (Yes, I have.)."
2. "Câu chỉ có động từ thường (hiện tại đơn, quá khứ đơn, trừ to be am / is / are, was / were) thì mượn do / does / did, và động từ chính về nguyên mẫu: She doesn't work. Did you go?"
3. "Mỗi câu chỉ một trợ động từ làm việc này: không nói Do you can…?, Did you be…?, I don't can, She doesn't is."

**Glossary** (cả 4 trỏ `F17`; định nghĩa ≤ 25 chữ):

| id | label | patterns | definition |
|---|---|---|---|
| `auxiliary` | Trợ động từ | trợ động từ | Từ nhận not và đổi lên đầu câu hỏi: am / is / are, was / were, do / does / did, will, have / has, can. |
| `v-ing` | V-ing | V-ing | Động từ thêm -ing (going, working), dùng sau am / is / are trong thì tiếp diễn. |
| `v2` | V2 (quá khứ) | V2 | Dạng quá khứ đơn của động từ: có quy tắc thêm -ed (worked), bất quy tắc phải thuộc (went). |
| `v3` | V3 | V3 | Dạng thứ 3 của động từ, dùng sau have / has: worked, gone, seen. |

F17 (`contrast.examples`), chỉ sửa `vi`:
- "5 dạng của go" → "5 dạng của go. Từ Năm 1 gọi tắt: V1 = nguyên mẫu (go), goes = V1 thêm -es, V-ing (going), V2 (went), V3 (gone)".
- Ví dụ "She has gone.": chèn "have / has là trợ động từ" vào ngoặc, giữ phần còn lại và không có chữ "Quá khứ".

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: cả ba qua, không nới test cũ thành `>=` để qua (trừ giới hạn số mục glossary 34 → 38).
- `npm run layout:guard` -- expected: chỉ báo class thêm ở `SignalWords.tsx`, `TenseChoiceCard.tsx`, `PronunciationBlocks.tsx` (và `TenseCard.tsx` nếu gắn class trực tiếp); không có class bị xoá.
- `npm run layout:check` -- expected: ĐẠT, ảnh 375px các route trong `ROUTES` trùng baseline.

**Manual checks:**
- Chrome headless (dev server, `VITE_SUPABASE_*` rỗng), store đã bỏ qua Sân ga:
  - 375px: `/roadmap/lesson/s1-t2-w1/grammar`, `/roadmap/lesson/s1-t3-w2/grammar`, `/roadmap/lesson/s1-t3-w4/grammar`, `/roadmap/lesson/s1-t4-w4`, `scrollWidth` = 375;
  - mở và làm hết một khối luyện "Chọn thì": store `mistakes`, `quizzes`, `progress` không đổi;
  - chip "V-ing" mở Sheet F17;
  - video begKNGxcjdk ở s1-t3-w2 tô câu will;
  - 1280px: hai side cạnh nhau trong cột chính.
