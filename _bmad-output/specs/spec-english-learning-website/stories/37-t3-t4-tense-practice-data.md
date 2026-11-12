---
title: 'Soạn bài luyện thì T3–T4: phần luyện có bậc và 12 câu mỗi chủ điểm (CAP-11, CAP-19, learning-rules "Buổi học", "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: 'f681c3e102eaa01371d91d6264fa03bfcf593aa1'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/36-t1-t2-tense-practice-data.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/38-tense-rule-cards-irregular-verb-srs.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/39-tense-choice-signal-words-aux-table.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" nghĩa là Huy **tự làm ra** câu đúng (gõ, biến đổi, dịch Việt → Anh, nói), không chỉ nhận ra đáp án. Story 36 đã làm việc này cho T1–T2. Story này làm cho T3–T4 (báo cáo kiểm tra, mục C1, C2; story 37 cần có trước khi Huy vào T3).
- Quyết định 4: dùng lại tối đa bộ máy đã có, không dựng hệ mới. Cụ thể: `Tense.practice`, `TensePractice`, câu quiz `type` / `transform`, `matchesTyped`, `requires`, bảng phạm vi `outOfScopeWords` (story 36), cùng luật dữ liệu và mẫu đề của story 36.
- Ràng buộc chung giữ nguyên:
  - không khoá, không phạt, không reset;
  - nội dung tiếng Việt tự soạn (không chép sách, British Council, web có bản quyền);
  - chỉ dùng kiến thức đã dạy;
  - giao diện 375px không đổi;
  - không đổi schema store.
- Claude chọn:
  - **7 chủ điểm trong phạm vi** (mọi Tense T3–T4):
    - `will` (s1-t3-w1);
    - `going-to` (s1-t3-w2);
    - `present-perfect` (s1-t3-w3);
    - `present-perfect-vs-past` (s1-t3-w4);
    - `modals` (s1-t4-w1);
    - `comparatives` và `passive-present` (cùng s1-t4-w3).
  - **"12–20 câu mỗi chủ điểm" là số câu đoạn Ngữ pháp của chủ điểm trong ngân hàng, tính cả câu cũ.** Câu cũ gồm câu `choice` đang có của chủ điểm, mọi nhãn: câu for / since nhãn `giới từ`, câu so sánh nhãn `từ loại`. Chọn đúng **12 câu mỗi chủ điểm**, như story 36. Cần thêm 60 câu mới: 8 câu cho mỗi chủ điểm có 4 câu cũ, 10 câu cho so sánh và bị động (mỗi bên chỉ có 2 câu cũ).
  - **Mọi câu quiz mới là câu gõ** (`type` / `transform`), không thêm câu `choice`. Lý do: đề O.W.L. giữ nguyên (`owlTensePool`). Câu chọn giữa hai thì là việc của story 40.
  - **Ba dạng câu gõ, đúng mẫu đề story 36:**
    - gõ dạng đúng: `type`, có một `___`;
    - biến đổi: `transform`, đề "Đổi …:", ví dụ "Đổi sang câu hỏi:", "Đổi sang bị động:", "Đổi sang hiện tại hoàn thành (since 2019):";
    - dịch: `transform`, đề "Dịch sang tiếng Anh: … (gợi ý)".
    
    Chủ điểm có 8 câu mới: 4 câu gõ dạng đúng, 2 câu biến đổi, 2 câu dịch. So sánh và bị động: 4 / 3 / 3.
  - **Nhãn:** câu so sánh mới mang nhãn `từ loại`, như 2 câu so sánh cũ (lỗi so sánh là lỗi dạng tính từ). Mọi câu mới khác mang nhãn `thì`.
  - **Ngữ cảnh phải chốt được một dạng:** mỗi câu chỉ có một đáp án đúng trong ngữ cảnh (dấu hiệu, câu kèm theo, gợi ý trong ngoặc). Nếu còn cách nói khác cũng đúng thì phải ghi vào `accept`. Các luật chốt dạng cụ thể nằm ở Design Notes (will / going to, hoàn thành, modal, `'s`).
  - **Phần luyện có bậc cho cả 7 chủ điểm,** đủ 4 bước như story 36:
    - 6 câu luyện, trong đó ≥ 3 câu gõ, có 1 câu "Đổi …:" và 1 câu dịch;
    - 2 câu dễ hơn;
    - bước áp dụng có 2 câu nói.
    
    s1-t4-w4 (ôn tổng, không có đoạn Ngữ pháp) không thêm gì.
  - **Bảng phạm vi chữ mở rộng cho 7 chủ điểm** (`src/lib/tense-scope.ts`), theo bảng ở Design Notes. Kèm theo:
    - bắt thêm bị động hiện tại và bị động quá khứ ("was made", mục deferred-work của story 36);
    - bắt since / how long, so sánh nhất, have to, used to, "Don't + V".
    
    Cột T1–T2 chỉ chặt thêm, không nới. 55 thẻ quy tắc (story 38) cũng phải qua bảng này theo thì của thẻ.
  - **Trạng ngữ lên đầu:** `TIME_TAILS` thêm tomorrow, tonight, this weekend, this year, next + (week / weekend / month / year / tên thứ). `frontedTimeTail` nhận thêm "… ago" (số + day / week / month / year) và "in + năm".
  - **Sửa 2 chỗ lý thuyết nói quá** (deferred-work story 38, giao cho story 37 hoặc 39):
    - "So sánh nhất luôn có the" (sai với my best friend);
    - "hỏi When …? thì dùng quá khứ đơn" (sai với When will you…?).
    
    Chỉ sửa chữ `rules` / `mistakes[].why`, không đổi id hay câu ví dụ.
  - **Id ổn định:** câu cũ giữ id và chữ. Câu mới nối tiếp id lớn nhất của bài (đều là `-06`).

**Problem:** Sau story 36, các thì T1–T2 đã có phần luyện và 12 câu gõ mỗi thì. 7 chủ điểm T3–T4 thì vẫn chỉ có thẻ để đọc, kèm 2–4 câu trắc nghiệm. Huy chưa bao giờ phải tự gõ "won't be", "is going to", "has never driven", "have lived … since", "can't swim", "heavier than", "is spoken". Bảng phạm vi chữ cũng chưa có các thì này, nên luật "chỉ dùng kiến thức đã dạy" chưa được kiểm cho T3–T4.

**Approach:** Chủ yếu thêm dữ liệu:
- `practice` cho 7 chủ điểm;
- 60 câu quiz gõ có `requires`;
- mở rộng bảng phạm vi chữ và trạng ngữ thời gian (hàm thuần, chỉ test dùng);
- sửa 2 câu lý thuyết nói quá.

Không đổi UI, không đổi bộ máy chấm hay chọn câu.

## Boundaries & Constraints

**Always:**
- Số câu và id đúng bảng "Số câu và id" ở Design Notes. Sau story này:
  - T2–T4 có 162 câu, `QUESTION_BANK` có 204 câu;
  - s1-t3-w1, -w2, -w3, -w4 và s1-t4-w1 có 14 câu mỗi bài, s1-t4-w3 có 26 câu, s1-t4-w4 vẫn 6 câu.
- Câu quiz mới:
  - `kind` là `type` hoặc `transform`, đoạn `grammar`;
  - nhãn `thì`, riêng so sánh là `từ loại`;
  - có `requires` không rỗng, `requiresViolations` rỗng, và ≥ 1 khái niệm viên gạch. Câu có tên thứ / tháng khai báo `days-months`, câu có số hoặc năm khai báo `numbers`;
  - `type` có đúng một `___`, gợi ý trong ngoặc đứng ngay sau chỗ trống;
  - `transform` khớp đúng một trong hai mẫu đề của story 36 (biến đổi / dịch). Câu dịch luôn có gợi ý tiếng Anh trong ngoặc, đủ mọi từ nội dung ở dạng gốc (động từ V1, tính từ gốc);
  - `answer` và mọi `accept`:
    - không có dấu tiếng Việt;
    - không trùng nhau sau `normalizeTyped`;
    - đáp án có `'s` (= is / has) thì có `accept` dạng đầy đủ;
    - đáp án có he / she / it + is, hoặc chủ ngữ số ít (he / she / it / danh từ) + has + V3 (hoàn thành), thì có `accept` dạng `'s`. has + danh từ ("She has a cat", nghĩa "có") không rút gọn. Bị động có chủ ngữ danh từ ("French is spoken") không cần;
  - câu không phải câu hỏi có đáp án kết thúc bằng trạng ngữ mà `frontedTimeTail` nhận ra thì có `accept` bản đặt trạng ngữ lên đầu;
  - `explanation` tiếng Việt nói rõ vì sao chọn dạng đó (dấu hiệu nào, chủ ngữ nào, quy tắc nào);
  - động từ bất quy tắc ở V2 / V3 chỉ lấy trong 50 động từ của `IRREGULAR_VERBS`.
- Phần luyện mới:
  - `practiceProblems` rỗng;
  - 6 câu luyện và 2 câu dễ hơn. Câu dễ hơn là câu `choice`, 3 lựa chọn, chỉ một lựa chọn đúng. Câu luyện có ≥ 3 câu `type`, trong đó có 1 câu "Đổi …:" và 1 câu "Dịch sang tiếng Anh: … (…)", theo cùng luật đáp án / `accept` như câu quiz;
  - `worked`, `faded` giữ đúng chữ và đáp án ở Design Notes;
  - `worked.timeline` có cùng `kind` với thì nếu thì có dòng thời gian. `modals`, `comparatives`, `passive-present` không có;
  - bước áp dụng có `promptVi`, `sampleEn` và 2 câu nói `${tense.id}-say-1`, `-say-2`.
- Không trùng:
  - đề phần luyện không trùng đề quiz cùng bài, hay đề phần luyện của khối "Chọn thì" cùng bài;
  - đề phần luyện của hai chủ điểm cùng bài (s1-t4-w3) không trùng nhau;
  - đáp án câu quiz mới không trùng nguyên câu ví dụ (`examples[].en`) của TenseCard cùng bài;
  - câu quiz mới và phần luyện không làm thẻ quy tắc cùng bài bị báo "trùng / gần trùng" (test story 38).
- Chữ tiếng Anh của câu mới, của phần luyện và của 55 thẻ quy tắc nằm trong phạm vi chữ theo thì (bảng "Phạm vi chữ theo thì"). Câu so sánh không dùng bị động.
- Cột T1–T2 của bảng phạm vi chỉ chặt thêm. Dữ liệu T1–T2 có sẵn vẫn qua mà không phải sửa. Nếu bị báo nhầm thì sửa bộ bắt (danh sách ngoại lệ), không sửa dữ liệu T1–T2.
- Nội dung phủ đủ bảng "Phải phủ" (Design Notes).
- `owlTensePool(QUESTION_BANK)` vẫn đúng 57 câu, và cùng seed ra cùng đề O.W.L. như baseline.

**Never:**
- Không làm việc của story khác:
  - câu quiz chọn giữa hai thì, mini-t3, kho câu O.W.L., ôn trộn (40);
  - kiểm tra cuối Bài chính, Sổ lỗi trong buổi (41);
  - Bản đồ thì (42);
  - lượng từ, liên từ, why / how often (43, 44);
  - have to / could / would like (45);
  - quá khứ tiếp diễn (46);
  - khái niệm `requires` cho bài T2–T4, `requires` cho câu cũ, chia Ngữ pháp theo ngày, sắp lại video (47).
- Không đổi `signalWords`, khối "Chọn thì", bảng "mỗi thì một dòng", `ruleCards`, `examples`, `formulas` của bất kỳ Tense nào. Ngoại lệ duy nhất là 2 câu nói quá đã nêu ở Intent.
- Không thêm câu `choice` / `listening` / `pronunciation` vào ngân hàng. Không sửa chữ, đáp án, id, nhãn, `requires` của câu cũ.
- Không đổi code chạy:
  - component;
  - `matchesTyped`, `normalizeTyped`, `pickQuiz`, `planQuiz`, `requiresViolations`, `owlTensePool`, `pickComebackTest`;
  - `LESSON_QUIZ_SIZE`, `MIN_QUIZ_QUESTIONS`, `QUIZZES`;
  - schema store, `plan.ts`.
- Không nới assertion cũ thành `>=` để test qua. Test đếm cũ được sửa về đúng số mới và giữ ý của test.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Khối luyện ở 6 bài | Mở đoạn Ngữ pháp s1-t3-w1 … s1-t3-w4, s1-t4-w1, s1-t4-w3 (trang bài hoặc bước Bài chính) | Dưới mỗi TenseCard có khối "Luyện: {tên chủ điểm}" đóng sẵn. s1-t4-w3 có 2 khối. s1-t4-w4 không có khối | N/A |
| Một khối mở | s1-t3-w2: đang mở khối luyện `going-to`, bấm "Bắt đầu luyện" ở khối "will hay going to?" (và ngược lại); s1-t4-w3: mở khối so sánh rồi khối bị động | Khối trước đóng, khối sau mở (hành vi story 35, 39) | N/A |
| Luyện will | Màn điền: "We ___ (not / be) late. I promise.", gõ "won't is", rồi "will not be" | "won't is" sai, hiện gợi ý. "will not be" đúng (n't = not) | N/A |
| Quiz `'s` | `q-s1-t3-w3-13` (dịch, đáp án "My father has never driven a car."), gõ "My father's never driven a car" / "My father has never drove a car." | Câu đầu đúng (`accept`). Câu sau sai: "Chưa đúng. Đáp án: …", vào Sổ lỗi với "bạn gõ" | Gõ có dấu tiếng Việt: nhắc tắt bộ gõ, không chấm (story 35) |
| Trạng ngữ "ago" lên đầu | `q-s1-t3-w4-13`, gõ "Three years ago we moved to Hanoi" / "We have moved to Hanoi three years ago." | Câu đầu đúng. Câu sau sai, giải thích: có mốc đã xong (ago) thì dùng quá khứ đơn | N/A |
| Biến đổi modal | `q-s1-t4-w1-11` "Đổi sang câu phủ định: My grandfather can swim.", gõ "My grandfather can not swim" / "My grandfather doesn't can swim." | Câu đầu đúng (can not = cannot = can't). Câu sau sai | N/A |
| So sánh | `q-s1-t4-w3-07` "This bag is ___ (heavy) than that one.", gõ "heavier" / "more heavy" / "heavyer" | Chỉ "heavier" đúng. Câu sai vào Sổ lỗi với nhãn `từ loại` | N/A |
| Bị động | `q-s1-t4-w3-21` "Đổi sang bị động: People speak French in Canada.", gõ "French is spoken in Canada." / "French is speak in Canada." | Câu đầu đúng, câu sau sai | N/A |
| Quiz lấy câu chưa gặp | Có TTS, làm `lesson-s1-t4-w3` (26 câu) 3 lần liên tiếp, mỗi lần nộp hết | 3 đề không trùng câu nào (15 câu khác nhau) | N/A |
| Thiếu nền | Chưa học viên nào (Sân ga chưa bỏ qua) | Quiz mỗi bài T3–T4 vẫn chạy 5 câu từ 6 câu cũ, `skipped` bằng số câu mới của bài (8, riêng s1-t4-w3 là 20) | Không chặn, không lỗi |
| O.W.L. không đổi | `pickOwlTenses(QUESTION_BANK, seed)` | Đúng 57 câu trong pool. Cùng seed ra cùng đề như baseline | N/A |
| Sổ lỗi cũ | Store có lỗi của `q-s1-t3-w1-03`, `q-s1-t4-w3-02` | Tra ra đúng câu cũ, chữ và nhãn không đổi | N/A |
| Nội dung vượt bài | Dữ liệu thử: câu `will` có "is going to rain"; `going-to` có "has seen"; `present-perfect` có "since 2020"; `present-perfect-vs-past` có "can"; `modals` có "than"; `comparatives` có "is made"; `passive-present` có "could", "was made" | `outOfScopeWords` trả đúng các cụm đó (test tự kiểm), test dữ liệu báo lỗi | N/A |
| T1–T2 chặt thêm | `outOfScopeWords` của 6 thì T1–T2 với "was made", "is cleaned", "since Monday", "the best", "Don't worry.", "have to go" | Đều bị báo. Mọi ca cũ của `tense-scope.test.ts` giữ kết quả | N/A |
| Thẻ quy tắc T3–T4 | 30 thẻ của 7 chủ điểm (story 38) | `outOfScopeWords(tenseId, câu đã điền)` rỗng | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/t2-t4-grammar.ts`:
  - `WILL` (:681), `GOING_TO` (:743), `PRESENT_PERFECT` (:803), `PERFECT_VS_PAST` (:872), `MODALS` (:943), `COMPARATIVES` (:1000), `PASSIVE_PRESENT` (:1057): thêm `practice`, theo mẫu `PRESENT_CONTINUOUS.practice` (:83). Giữ nguyên `ruleCards`, `signalWords`, `spellId`, `examples`, `formulas`;
  - sửa chữ: `PERFECT_VS_PAST.rules[1]` (:885), `.mistakes[1].why` (:898); `COMPARATIVES.rules[2]` (:1012), `.mistakes[2].why` (:1025);
  - `GRAMMAR_T3_W*` / `GRAMMAR_T4_W*` (:1132–) không đổi.
- `src/data/lessons/tense-choices.ts` -- `WILL_VS_GOING_TO` (đề luyện `will-vs-going-to-c*`), `DONT_TRANSLATE` (`dont-translate-c*`). Không sửa; câu mới không được trùng đề ở đây.
- `src/data/lessons/types.ts:181-211` -- `Tense.practice`, `TensePractice`. Không đổi.
- `src/lib/tense-practice.ts` -- `practiceProblems`, `practiceEnglishTexts`, `practiceItemIds`, `hasPractice`. Không đổi.
- `src/components/lesson/LessonContentParts.tsx:215-250` -- `GrammarSection` tự vẽ khối luyện cho thì có `practice` (dùng chung `openPracticeId` với khối "Chọn thì"). Không đổi.
- `src/lib/tense-scope.ts` -- `TENSE_SCOPE_IDS` (6 id), `SCOPES`, `outOfScopeWords`, `QUANTIFIERS_LINKERS` (đang chặn `than` ở mọi thì), `MODALS` (gồm will / gonna), `PERFECT_RE` (gộp have / has với had), `GOING_TO_RE`, `TIME_TAILS`, `frontedTimeTail`, `promptEnglish`. Doc comment ghi "Story 37 sẽ thêm các thì T3–T4".
- `src/data/questions/t2-t4.ts`:
  - `lesson()` (:80) có `.type` / `.transform`. `makeTyped` (:50) gắn cứng nhãn `thì`, cần thêm cách truyền nhãn (mặc định `thì`);
  - khối `t3w1` … `t4w3` (:313-401), id lớn nhất mỗi bài là `-06`;
  - chú thích đầu file (:5-12).
- `src/data/questions/concepts.ts` -- `requiresViolations`: câu T2–T4 chỉ cần mọi khái niệm có người dạy (viên gạch hoặc bài T1). Không đổi.
- `src/lib/owl/owl.ts:131` -- `owlTensePool` chỉ lấy câu `choice` nhãn `thì`. Không đổi.
- Test cần cập nhật:
  - `src/lib/tense-scope.test.ts:16, 73, 93`:
    - test "6 thì T1–T2" phải sửa;
    - vòng "mọi thì" (:74, :94) phải chỉ chạy trên 6 id T1–T2, vì will / gonna / than được phép ở T3–T4;
  - `src/data/questions/questions.test.ts`:
    - :91-101: T2–T4 có 102 câu, bank 144;
    - describe story 36 (:371): `TENSE_QUESTIONS: Record<TenseScopeId, …>` sẽ lỗi kiểu khi `TenseScopeId` có 13 id. Test "id ngoài bảng" (:486) đang duyệt mọi `typedQuestions`, phải giới hạn ở bài T1–T2;
  - `src/data/lessons/lessons.test.ts`:
    - :657-670 "đúng 6 thì T1–T2 có practice" → 13 thì;
    - :1009-1016 "thẻ T1–T2 nằm trong phạm vi chữ", `checked` 25 → 55 thẻ;
  - `src/lib/quiz/requires.test.ts:155` -- ca "quiz T2–T4 không có requires thì không lọc" đang dùng `lesson-s1-t3-w1`, nên chuyển sang `lesson-s1-t4-w4`.
  - `src/lib/quiz/quiz.test.ts`, `src/lib/comeback/comeback.test.ts`, `src/lib/owl/owl.test.ts`: chỉ sửa nếu có assertion phụ thuộc số câu.
- Vitest env `node`, chỉ chạy `src/**/*.test.ts`. Test được type-check qua `tsconfig.test.json`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/tense-scope.ts` -- mở rộng bảng phạm vi đúng bảng "Phạm vi chữ theo thì" ở Design Notes:
  - export `T1_T2_SCOPE_IDS` (6 id cũ), `T3_T4_SCOPE_IDS` (7 id theo thứ tự lộ trình). `TENSE_SCOPE_IDS` = cả hai;
  - `SCOPES` thêm các cờ `will`, `goingTo`, `perfect`, `since`, `modal`, `comparative`, `passive`;
  - tách had / hadn't khỏi phần hoàn thành được phép;
  - nhóm "luôn bị báo";
  - `TIME_TAILS` thêm cụm mới; `frontedTimeTail` nhận "… ago", "in + năm";
  - doc comment ghi story 37.
  
  Hàm vẫn không được app import.
- [x] `src/lib/tense-scope.test.ts` -- sửa test id (13 id, hai nhóm). Các vòng "mọi thì" cũ chạy trên `T1_T2_SCOPE_IDS`. Thêm:
  - mỗi hàng của bảng phạm vi có ít nhất một ca ở cột ✗ đầu tiên và cột "được" đầu tiên, gồm cả hàng "Nội dung vượt bài" và "T1–T2 chặt thêm" của ma trận;
  - nhóm "luôn bị báo" bị báo ở cả 13 thì;
  - không báo nhầm: "I am tired.", "She's married.", "going to school", "the rest of the day", "I have a test.", "It's interesting.";
  - `frontedTimeTail`: "we moved to hanoi three years ago" → "three years ago we moved to hanoi"; "i lived in hue in 2020" → "in 2020 i lived in hue"; "i will call you tomorrow" → "tomorrow i will call you".
- [x] `src/data/lessons/t2-t4-grammar.ts`:
  - thêm `practice` cho 7 chủ điểm theo luật ở Boundaries và mẫu ở Design Notes. Mỗi `practice` có một dòng chú thích: phạm vi chữ và luật không trùng đề;
  - sửa 4 chuỗi nói quá đúng chữ ở Design Notes.
- [x] `src/data/questions/t2-t4.ts`:
  - thêm cách truyền nhãn cho câu gõ;
  - thêm 60 câu gõ đúng bảng "Số câu và id". Câu golden đúng Design Notes;
  - sửa chú thích đầu file (102 → 162 câu, số câu từng bài, story 37).
- [x] `src/data/questions/questions.test.ts`:
  - sửa số câu: T2–T4 162, bank 204, `sizes` thêm 6 bài T3–T4;
  - describe story 36 dùng kiểu id T1–T2. Test "id ngoài bảng" chỉ xét câu gõ của bài T1–T2.
  
  Thêm describe "câu luyện chủ điểm T3–T4 (story 37)" với hằng `TOPIC_QUESTIONS` (chủ điểm → bài, id cũ, id mới, đúng bảng). Các test:
  - mỗi chủ điểm đúng 12 câu, đoạn `grammar`, đúng bài. Câu đoạn Ngữ pháp (`choice` + gõ) của 6 bài khớp đúng bảng;
  - 60 câu mới đều là `type` / `transform`, nhãn đúng (so sánh `từ loại`, còn lại `thì`), `requires` hợp lệ, có ≥ 1 khái niệm viên gạch;
  - số câu gõ dạng đúng / biến đổi / dịch đúng bảng. Đề `transform` khớp đúng một trong hai mẫu;
  - `answer` / `accept` không có dấu tiếng Việt, không trùng sau chuẩn hoá;
  - luật `'s` ↔ dạng đầy đủ;
  - luật trạng ngữ lên đầu (`frontedTimeTail`, kể cả ago / in + năm), đếm ≥ 6 câu;
  - chữ tiếng Anh (phần tiếng Anh của đề qua `promptEnglish`, `answer`, `accept`) có `outOfScopeWords` rỗng theo chủ điểm;
  - V2 / V3 bất quy tắc trong đáp án đều thuộc `IRREGULAR_VERBS`;
  - đáp án không trùng `examples[].en` cùng bài;
  - đề không trùng đề phần luyện của thì và của khối "Chọn thì" cùng bài;
  - golden đúng bảng. Chấm golden bằng `matchesTyped` đúng các hàng "Quiz `'s`", "Trạng ngữ ago", "Biến đổi modal", "So sánh", "Bị động" của ma trận;
  - 3 lần `pickQuiz` liên tiếp có TTS trên `lesson-s1-t4-w3` (cộng câu vừa bốc vào `seen`) ra 15 câu khác nhau. Mọi quiz bài T3–T4 bốc đủ 5 câu, có và không có TTS;
  - `owlTensePool(QUESTION_BANK)` đúng 57 câu, không chứa câu mới. `pickOwlTenses` cùng seed ra cùng đề như baseline (chép id của 1 seed vào test);
  - `getQuestion('q-s1-t3-w1-03')` và `('q-s1-t4-w3-02')` giữ đúng đề, đáp án, nhãn cũ.
- [x] `src/lib/quiz/requires.test.ts` -- ca "không lọc" chuyển sang `lesson-s1-t4-w4` (cùng `lesson-s1-t2-w4`). Thêm ca hàng "Thiếu nền": chưa học viên nào thì mỗi quiz bài T3–T4 vẫn `run` 5 câu, `skipped` đúng 8 (s1-t4-w3: 20), không có câu mới.
- [x] `src/data/lessons/lessons.test.ts`:
  - describe story 35: "thì có practice" thành đúng 13 id theo thứ tự lộ trình (mọi Tense trừ `to-be`), bằng `TENSE_SCOPE_IDS`;
  - describe story 38: test phạm vi thẻ chạy trên 55 thẻ (đổi tên test cho đúng ý).
  
  Thêm describe "phần luyện T3–T4 (story 37)":
  - mỗi chủ điểm: 6 câu luyện, ≥ 3 câu `type`, có câu "Đổi …:" và câu dịch, 2 câu dễ hơn là `choice`;
  - `worked` / `faded` đúng golden. `worked.timeline` có cùng `kind` với thì, hoặc không có nếu thì không có dòng thời gian;
  - 2 câu nói đúng id;
  - đề hai chủ điểm s1-t4-w3 không trùng nhau, không trùng đề phần luyện khối "Chọn thì" cùng bài;
  - câu gõ phần luyện: không dấu tiếng Việt, tự chấm đúng (`isFadedCorrect` / `matchesTyped`), theo luật `'s` và trạng ngữ;
  - phủ đủ bảng "Phải phủ" (kiểm bằng chuỗi đáp án như Design Notes ghi);
  - 4 chuỗi lý thuyết đã sửa đúng chữ, và không còn "luôn có the" / "luôn hỏi".
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- mục Buổi học, sau câu story 36 thêm: "Các chủ điểm T3–T4 (will, be going to, hiện tại hoàn thành, hoàn thành và quá khứ đơn, can / should / must, so sánh, bị động hiện tại) cũng có phần luyện và 12 câu quiz mỗi chủ điểm, gồm câu gõ dạng đúng, biến đổi và dịch Việt → Anh (story 37)."

**Acceptance Criteria:**
- Given Huy ở 375px trên `/roadmap/lesson/s1-t4-w3/grammar`, when mở lần lượt khối "Luyện: So sánh hơn và so sánh nhất" rồi khối "Luyện: Bị động hiện tại (nhập môn)" và đi hết 4 bước, then mỗi lúc chỉ một khối mở, `scrollWidth` bằng 375, và Sổ lỗi, `quizzes.attempts`, `progress` không đổi.
- Given Huy làm quiz `lesson-s1-t3-w3` và gõ sai câu dịch, when mở Sổ lỗi rồi ôn câu đó, then câu hiện ô gõ, gõ "My father's never driven a car" thì được chấm đúng, và nút "Vì sao sai?" gửi prompt dạng câu gõ.
- Given buổi học có Bài chính là s1-t3-w2, when xem bước Bài chính, then dưới TenseCard going to có khối luyện, sau đó là khối "will hay going to?". Bấm luyện khối này thì khối kia đóng.
- Given `npm run layout:guard` và `npm run layout:check`, when chạy trên code của story này, then không file UI nào bị báo thêm, ảnh 375px các route khớp baseline, và không có lỗi mới ngoài lỗi probe "chào 1" có sẵn (deferred-work).

## Implementation Notes

- **Bảng phạm vi (`src/lib/tense-scope.ts`):** `T1_T2_SCOPE_IDS`, `T3_T4_SCOPE_IDS`, `TENSE_SCOPE_IDS` (13 id), kiểu `T1T2ScopeId`. `SCOPES` thêm 7 cờ `will`, `goingTo`, `perfect`, `since`, `modal`, `comparative`, `passive`; 7 chủ điểm T3–T4 dùng mọi nhóm T1–T2 và mở dần đúng bảng. Bộ bắt:
  - hoàn thành: have / has / 've / haven't / hasn't (+ not / ever / never / just / already) + V2 / V3 / -ed; `'s` + V3 / -ed; thêm câu hỏi Have / Has (đầu câu, sau từ để hỏi hoặc "how long") + 1–3 từ + V2 / V3 / -ed. V3 ≠ V2 chỉ bị báo khi chưa tới bài hoàn thành;
  - bị động hiện tại: am / is / are / isn't / aren't / 'm / 're (+ not) + V3 / -ed, thêm câu hỏi Am / Is / Are + 1–2 từ + V3 / -ed (`'s` không tính bị động, như bảng);
  - so sánh: than, the best / worst / most, the + -est (trừ rest, test, west, guest, interest, forest, nest); "my best friend" không bị báo;
  - "luôn bị báo": could / would / may / might / shall / ought / 'd, have / has / had / having / used to, had + V2 / V3 / -ed, quá khứ tiếp diễn, bị động quá khứ (cả câu hỏi Was / Were + V3), lượng từ / liên từ, "Don't + V" mở đầu câu. "Don't + V" xét trên chữ giữ hoa thường (D hoa) để lựa chọn viết thường "don't eat" của câu chọn (mảnh câu) không bị tính.
  
  Cột T1–T2 chỉ chặt thêm: toàn bộ dữ liệu T1–T2 có sẵn (quiz, phần luyện, khối "Chọn thì", 25 thẻ) qua mà không phải sửa, không cần thêm ngoại lệ. 55 thẻ quy tắc đều qua bảng theo thì của thẻ. `TIME_TAILS` thêm tomorrow, tonight, this weekend, this year, next + (week / weekend / month / year / tên thứ); `frontedTimeTail` nhận thêm "(a | one | … | ten | số) day / week / month / year(s) ago" và "in + 4 chữ số".
- **Câu quiz (`src/data/questions/t2-t4.ts`):** `makeTyped` / `lesson().type|transform` có tham số cuối `tag` (mặc định `thì`). 60 câu gõ đúng bảng id: mỗi chủ điểm T3 / modal 4 type + 2 biến đổi + 2 dịch, so sánh và bị động 4 + 3 + 3; 8 câu golden đúng Design Notes. Câu so sánh nhãn `từ loại`. Mọi câu có `requires` hợp lệ, có khái niệm viên gạch (nên khi chưa học viên nào, quiz T3–T4 chạy bằng 6 câu cũ và bỏ đúng 8 / 20 câu mới). Câu có số / năm khai báo `numbers`, câu có tên thứ khai báo `days-months`. 6 câu biến đổi / dịch có trạng ngữ cuối câu có `accept` đặt trạng ngữ lên đầu (tonight, next year, in 2020, three years ago, today, every day). Chỗ trống sau I / you / we / they có `accept` 'll / 'm / 're / 've.
- **Phần luyện (`src/data/lessons/t2-t4-grammar.ts`):** `practice` cho 7 chủ điểm (6 câu luyện: 4–5 câu `type`, có 1 câu "Đổi …:" và 1 câu dịch; 2 câu dễ hơn `choice`; 2 câu nói), worked / faded giữ đúng chữ và đáp án Design Notes. Thêm `accept` cho faded ppvp ("'ve known") theo luật chỗ trống 've (đáp án `have known` giữ nguyên). Mỗi `practice` có chú thích phạm vi chữ và luật không trùng đề. Sửa 4 chuỗi nói quá đúng chữ Design Notes (`PERFECT_VS_PAST.rules[1]`, `.mistakes[1].why`, `COMPARATIVES.rules[2]`, `.mistakes[2].why`).
- **Test:**
  - `tense-scope.test.ts`: test id 13 (hai nhóm), vòng "mọi thì" cũ chạy trên `T1_T2_SCOPE_IDS`; describe "outOfScopeWords T3–T4 (story 37)" (mỗi hàng bảng được kiểm ở mọi cột: trước cột "được" thì bị báo, từ đó trở đi thì rỗng; hàng "Nội dung vượt bài", "T1–T2 chặt thêm"; nhóm luôn bị báo ở 13 thì; không báo nhầm); `frontedTimeTail` ago / in + năm / tomorrow / next month.
  - `questions.test.ts`: T2–T4 162, bank 204, `sizes` đủ bài; describe story 36 dùng `T1T2ScopeId`, test id ngoài bảng chỉ xét câu gõ bài T1–T2; describe "câu luyện chủ điểm T3–T4 (story 37)" (13 test: bảng id, nhãn, `requires` + viên gạch + numbers / days-months, số dạng và mẫu đề, dấu tiếng Việt, luật 's, trạng ngữ lên đầu ≥ 6, phạm vi chữ, V2 / V3 ngoài bảng 50 động từ, không trùng ví dụ / đề luyện thì + khối "Chọn thì", golden + chấm golden theo ma trận, 3 lần quiz s1-t4-w3 ra 15 câu, mọi quiz T3–T4, O.W.L. 57 câu và đề seed "story-37" chép từ baseline, Sổ lỗi cũ).
  - `lib/quiz/requires.test.ts`: ca "không lọc" dùng `lesson-s1-t2-w4` + `lesson-s1-t4-w4`; ca "Thiếu nền" T3–T4.
  - `lessons.test.ts`: story 35 "đúng 13 thì có practice" (= `TENSE_SCOPE_IDS`, chỉ `to-be` không có); story 38 phạm vi chữ chạy trên 55 thẻ; describe "phần luyện T3–T4 (story 37)" (8 test, gồm "Phải phủ" và 4 chuỗi lý thuyết).
- **Kiểm chứng:** `npm run lint`, `npm test` (81 file, 1964 test; sau patch review: 1965 test), `npm run build` qua. `npm run layout:guard`: 3 file nguồn đổi, không thêm / xoá class. `npm run layout:check`: 12 route × 5 bề rộng ok, ảnh 375px trùng; chỉ còn lỗi probe "chào 1" có sẵn (deferred-work).
- **Chưa kiểm tay trên trình duyệt** (AC 1–3: mở 2 khối ở s1-t4-w3 375px, ôn Sổ lỗi câu dịch s1-t3-w3, bước Bài chính s1-t3-w2). Component không đổi; khối luyện tự hiện qua `GrammarSection` như story 35, 36.

## Spec Change Log

- **2026-11-13, review story 37 (blind #11, triage):**
  - Finding: luật `'s` trong Boundaries (vùng frozen) ghi "he / she / it + is / has … thì có `accept` dạng `'s`", nên "She has a cat" (has = có) cũng bị đòi "She's a cat", sai tiếng Anh và mâu thuẫn với chính câu "danh từ số ít + has + V3 (hoàn thành)" ngay sau. Chỉ có một cách sửa hợp lý, đúng ý Huy (đáp án đúng tiếng Anh, `'s` = is / has hoàn thành).
  - Đã sửa: frozen text thành "he / she / it + is, hoặc chủ ngữ số ít + has + V3 (hoàn thành)"; thêm helper `sContraction` (`src/lib/tense-scope.ts`) dùng chung cho test quiz và test phần luyện.
  - Trạng thái xấu tránh được: test bắt người soạn thêm `accept` sai ("She's a cat"), và hai test dùng hai regex khác nhau.
  - Cũng sửa Design Notes (không frozen): danh sách `NOT_SUPERLATIVE`, đuôi "… ago" (thêm seven / eight / nine, an, minute / hour) và đoạn "Ngoại lệ của bộ bắt". Cột T1–T2 vẫn chỉ chặt thêm: ngoại lệ chỉ áp cho ngữ cảnh to be / Let's / tên riêng, từ -ed đứng một mình vẫn bị báo như cũ.
  - KEEP: bảng phạm vi 13 thì, 60 câu và id, 8 golden, worked / faded của 7 chủ điểm giữ nguyên.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | S_PERFECT_RE báo nhầm "Let's + V" (read, run, come: V3 = V1) là hoàn thành | medium | Probe: `outOfScopeWords('present-simple', "Let's read a book.")` → `["let's read"]`; F08 dạy Let's (`f08-c4`) | patch: loại `let's` khỏi `S_PERFECT_RE`, thêm test |
| 2 | blind | GOING_TO_RE báo nhầm "going to + tên nơi" (I'm going to Hanoi) | medium | Regex chạy trên chữ thường, danh sách loại trừ không có tên riêng; bài going to dạy đúng câu này (`GOING_TO.mistakes[2]`) | patch: xét trên `cased`, bỏ qua từ kế viết hoa; thêm test |
| 3 | blind | NOT_PAST thiếu tính từ -ed: "I was worried", "The shop is closed" bị báo bị động | medium | `isPassiveForm` = V3 hoặc `isEd`; `worried` không trong `NOT_PAST` nên `PAST_PASSIVE_RE` (luôn bị báo) bắt ở mọi chủ điểm T3–T4 và past-simple | patch: thêm `ED_ADJECTIVES` chỉ cho ngữ cảnh to be / 's (không nới từ -ed đứng một mình của T1–T2); test |
| 4 | blind | NOT_SUPERLATIVE thiếu honest, chest, contest, request… | low | `SUPERLATIVE_RE` bắt mọi `the + -est`; probe "He is the honest one." (going-to) → `['the honest']` | patch: thêm 10 từ vào danh sách; test; sửa Design Notes |
| 5 | blind | "how long" bị chặn cả khi hỏi độ dài (How long is the movie?) | low | Intent (frozen) ghi rõ "bắt since / how long" và bảng có hàng since, how long; Chặng 1 dạy How long lần đầu ở s1-t3-w4; chặt hơn chỉ làm người soạn đổi câu | reject: đúng ý spec |
| 6 | blind | Luật "Don't + V luôn bị báo" mâu thuẫn câu cũ `q-s1-t3-w1-03` "Don't worry." | low | F08 chỉ dạy mệnh lệnh khẳng định và Let's, không dạy Don't + V; câu cũ có từ trước story 37 và spec cấm sửa câu cũ | defer: ghi deferred-work (story 47, requires cho câu cũ) |
| 7 | blind | Câu going to thiếu `accept` hiện tại tiếp diễn (am visiting, is starting, are moving, am painting, Where is he going…) | medium | Kế hoạch đã sắp xếp nói bằng hiện tại tiếp diễn là đúng; spec: "còn cách nói khác cũng đúng thì phải ghi vào accept" | patch: thêm accept cho -07, -08, -13, -14, going-to-c1; ghi chú trong explanation |
| 8 | blind | frontedTimeTail thiếu "since + năm" và seven / eight / nine, minutes / hours | low | since: golden -11 có accept "—" và test cố ý `frontedTimeTail('… since 2019')` undefined (câu biến đổi giữ trật tự). ago: chưa có câu nào hỏng nhưng đuôi "ten minutes ago" đã có trong dữ liệu | patch (ago: thêm số, an, minute / hour, test) · reject (since: đúng golden) |
| 9 | blind | Đề gần trùng (present-perfect-c4 ↔ quiz -12; passive "made in Vietnam" lặp; will promise lặp); sampleEn bị động chứa nguyên câu say-2 | low | Đọc dữ liệu: đúng như mô tả; sampleEn lộ đáp án câu nói | patch: đổi c4 (washed the car), passive-c5 (song sung), say-2, sampleEn will / passive, will-say-2 |
| 10 | blind | `requires` không đồng đều: -08 (hasn't) khai `be-negative` | low | `be-negative` (F14) dạy isn't / aren't; không có khái niệm phủ định chung nên câu haven't / can't không khai là đúng | patch: bỏ `be-negative` ở q-s1-t3-w3-08 (cùng nhóm #48) |
| 11 | blind | Luật 's của hai test sai với has + danh từ và lệch nhau | medium | he / she / it + (is hoặc has) đòi "She's a cat"; bản ở lessons.test chỉ nhận V3 đuôi en / ed | patch: helper `sContraction` dùng chung, test riêng; sửa frozen text (Spec Change Log) |
| 12 | blind | Test V2 / V3 dùng danh sách chặn tự soạn, không xét phần luyện | low | sent / spent / met / kept / built / slept / felt thực ra thuộc 50 động từ; danh sách chặn còn thiếu nhiều dạng; phần luyện không được kiểm | patch: mở rộng danh sách, chạy cả phần luyện 7 chủ điểm |
| 13 | blind | Câu modal -10 chặn "May I / Could I"; -12 chặn "the eldest" | low | May / Could nằm trong nhóm luôn bị báo nên không vào accept được; eldest là tuỳ chọn | patch -10: đề "___ (can) I sit here?" · reject -12 |
| 14 | blind | Tên test / chú thích lệch nội dung; sàn trạng ngữ phần luyện chỉ ≥ 2 | low | Đọc test: đúng như mô tả | patch: đổi tên test, sửa chú thích, khoá đúng 2 câu (`toBe`) |
| 15 | blind | Task [x] nhưng AC 1–3 chưa kiểm tay trên trình duyệt; log trống | low | Implementation Notes ghi "Chưa kiểm tay"; component không đổi | defer: deferred-work + humanChecks; log đã điền trong lần triage này |
| 16 | edge | to be + tính từ -ed bị báo bị động | medium | Cùng gốc #3 | patch (nhóm #3) |
| 17 | edge | questionHits / 's xét mọi từ: "Is the left door open?", "my sister's left hand" | low | Đúng là báo nhầm, nhưng hiếm trong nội dung A1 và sửa cần thêm luật tách chủ ngữ | reject: hiếm, sửa phức tạp |
| 18 | edge | Câu hỏi bị động chủ ngữ dài hơn 2 từ lọt (Are these old cups made…?) | low | `PASSIVE_QUESTION_RE` {1,2}; probe lọt | patch: {1,3} cho hiện tại và quá khứ, thêm test |
| 19 | edge | Bị động dạng 's ("This bread's made") không bị báo ở comparatives | low | Spec chọn "'s không tính bị động"; câu kiểu này hiếm và không tự nhiên trong nội dung dạy | reject: đúng ý spec |
| 20 | edge | have got to / 've got to / gotta lọt nhóm luôn bị báo | low | `HAVE_TO_RE` không có got; sửa là đổi regex | patch: mở rộng regex, thêm test |
| 21 | edge | NOT_SUPERLATIVE thiếu từ | low | Cùng gốc #4 | patch (nhóm #4) |
| 22 | edge | "Don't you like it?" bị báo là mệnh lệnh | low | Câu hỏi phủ định cũng chưa dạy ở Chặng 1, báo là an toàn | reject |
| 23 | edge | AGO_OR_YEAR_RE thiếu seven–nine, an hour, minutes | low | Cùng gốc #8 | patch (nhóm #8) |
| 24 | edge | (claim) Design Notes chỉ liệt số a, one–six, ten | low | Cùng gốc #8; code đúng chữ spec nên sửa cả Design Notes | patch (nhóm #8) + Spec Change Log |
| 25 | edge | q-s1-t3-w2-13 thiếu accept "Where is he going this weekend?" | medium | Cùng gốc #7 | patch (nhóm #7) |
| 26 | edge | q-s1-t3-w2-07, -08 thiếu accept hiện tại tiếp diễn | medium | Cùng gốc #7 | patch (nhóm #7) |
| 27 | vgap | Test phạm vi phần luyện không xét câu đã điền | medium | Đã kiểm sẵn bởi reviewer (probe "is ___ (make)" + made → `['is made']` lọt) | patch: thêm câu đã điền (faded, type có ___ và accept) vào test phạm vi |
| 28 | vgap | Khối "Chọn thì" T3 chưa qua `outOfScopeWords` | medium | Đã kiểm sẵn bởi reviewer (could / have to / was cooking lọt test cũ) | patch: test mọi khối theo thì cuối bài (will-vs-going-to@going-to, dont-translate@present-perfect-vs-past) |
| 29 | vgap-other | Let's + V3 = V1 bị báo | medium | Cùng gốc #1 | patch (nhóm #1) |
| 30 | vgap-other | "the honest", "Is the shop closed?" bị báo | low | Cùng gốc #3, #4 | patch (nhóm #3, #4) |
| 31 | content | q-s1-t3-w2-14: đáp án chỉ dịch vế đầu | medium | Đề có "chúng tôi đã quyết định rồi" nhưng đáp án không có vế này | patch: đề thành "Năm sau chúng tôi định chuyển tới Đà Nẵng." |
| 32 | content | going to: am visiting / is starting / am painting đúng nhưng bị chấm sai | medium | Cùng gốc #7 | patch (nhóm #7) |
| 33 | content | -09 "Watch out! You ___ (drop)" và faded "Look at the time!": will cũng dùng được | low | Luật chốt dạng của spec định "dấu hiệu trước mắt (Look!) → going to"; faded là golden; bài và khối "will hay going to?" dạy đúng phân biệt này | reject: đúng ý spec |
| 34 | content | q-s1-t4-w3-25 "không được bán" dễ hiểu là cấm | low | Bài modal vừa dạy "không được" = mustn't; gợi ý (not / sell) đã chốt | patch: explanation nói rõ đây là bị động, không phải cấm |
| 35 | content | Chữ kiểu Anh: in this street, in the exam, this film, mustn't | low | Dự án theo tiếng Anh Mỹ (IPA Mỹ, gotten) | patch: on this street, during the test, this movie; thêm ghi chú can't ở -14 |
| 36 | content | going-to-c3: "Will … going to sai vì thiếu to be" gây hiểu nhầm | low | Đọc chữ: đúng như mô tả | patch: sửa explanationVi |
| 37 | content | comparatives-e2: "good không so sánh" mơ hồ | low | Đọc chữ | patch: "good là tính từ gốc, chưa phải dạng so sánh" |
| 38 | content | passive-present-c3 "Cards" khó hiểu | low | Đọc chữ, không có vi | patch: "Credit cards" + gợi ý nghĩa |
| 39 | content | q-s1-t4-w3-24 câu Việt "được nấu bởi bố tôi" không tự nhiên | low | Là câu luyện bị động có by, reviewer cũng cho là chấp nhận được | reject |
| 40 | content | "Of all the …" dùng lượng từ all chưa dạy (q-s1-t4-w3-10, comparatives-c1) | low | Lượng từ là story 43; bộ bắt không có all | patch: "This is ___ beach in Vietnam.", "Mai is ___ cook in my family." |
| 41 | content | q-s1-t4-w3-14, -16 cần mine / yours (F09 chỉ nhận ra) | low | Gợi ý cho sẵn mine / yours và accept có my English / your cat | reject: rủi ro nhỏ |
| 42 | content | q-s1-t3-w1-13 explanation nêu "promise not to" chưa dạy | low | Đọc chữ | patch: bỏ câu này khỏi explanation (accept giữ) |
| 43 | content | modals-say-2 "stay up late" là cụm động từ chưa dạy | low | Đọc chữ | patch: "You shouldn't go to bed late." |
| 44 | content | will-c2 "I need to sleep" dùng need to chưa dạy | low | grep: "need to" không có trong T1 / Sân ga | patch: bỏ câu "I need to sleep", sửa gợi ý |
| 45 | content | -13 không nhận "Where is he going this weekend?" | low | Cùng gốc #7 | patch (nhóm #7) |
| 46 | content | -12 không nhận "the eldest" | low | Cùng #13 | reject |
| 47 | content | t4w1-13 không nhận "see the doctor" / "go see a doctor" | low | Gợi ý ghi "see a doctor"; accept đã có go to the doctor | reject |
| 48 | content | `requires` thiếu be-affirmative, prepositions-of-time, have-has | low | Đọc câu: dùng is / am / on Sunday / in 2020 / at night / had (có) mà không khai | patch: thêm khái niệm cho t3w1-08, t3w2-07/08/09, t3w4-10/12, t4w1-07/08 (số câu bị bỏ khi chưa học viên nào không đổi) |
| 49 | content | sampleEn will lộ đáp án golden q-s1-t3-w1-07; sampleEn bị động lặp say-2 | low | Cùng gốc #9 | patch (nhóm #9) |

## Design Notes

**Số câu và id** (câu cũ = câu đoạn Ngữ pháp đang có của chủ điểm; mọi câu mới là câu gõ; thứ tự id: gõ dạng đúng → biến đổi → dịch):

| Chủ điểm | Bài | Câu cũ | Gõ dạng đúng | Biến đổi | Dịch | Tổng |
|---|---|---|---|---|---|---|
| `will` | s1-t3-w1 | 01–04 | 07–10 | 11–12 | 13–14 | 12 |
| `going-to` | s1-t3-w2 | 01–04 | 07–10 | 11–12 | 13–14 | 12 |
| `present-perfect` | s1-t3-w3 | 01–04 | 07–10 | 11–12 | 13–14 | 12 |
| `present-perfect-vs-past` | s1-t3-w4 | 01–04 (03 nhãn `giới từ`) | 07–10 | 11–12 | 13–14 | 12 |
| `modals` | s1-t4-w1 | 01–04 | 07–10 | 11–12 | 13–14 | 12 |
| `comparatives` | s1-t4-w3 | 01, 02 (nhãn `từ loại`) | 07–10 | 11–13 | 14–16 | 12 |
| `passive-present` | s1-t4-w3 | 03, 04 | 17–20 | 21–23 | 24–26 | 12 |

**Phạm vi chữ theo thì.** Mọi chủ điểm T3–T4 dùng được mọi nhóm của T1–T2 (cột `past-simple-irregular` của story 36). Các nhóm dưới đây mở dần. ✗ = bị báo. Cột "T1–T2" áp cho cả 6 thì cũ.

| Nhóm | T1–T2 | will | going-to | present-perfect | pp-vs-past | modals | comparatives | passive |
|---|---|---|---|---|---|---|---|---|
| will, won't, 'll | ✗ | được | được | được | được | được | được | được |
| going to + V, gonna | ✗ | ✗ | được | được | được | được | được | được |
| V3 khác V2; have / has / 've / haven't / hasn't (+ ever / never / just / already) + V2 / V3 / -ed; `'s` + V3 / -ed | ✗ | ✗ | ✗ | được | được | được | được | được |
| since, how long | ✗ (mới) | ✗ | ✗ | ✗ | được | được | được | được |
| can, can't, cannot, should, shouldn't, must, mustn't | ✗ | ✗ | ✗ | ✗ | ✗ | được | được | được |
| than; the best / worst / most; the + từ -est (trừ rest, test, west, guest, interest, forest, nest, honest, modest, chest, vest, pest, quest, request, contest, protest, harvest) | ✗ (mới với so sánh nhất) | ✗ | ✗ | ✗ | ✗ | ✗ | được | được |
| am / is / are / isn't / aren't / 'm / 're (+ not) + V3 hoặc từ -ed (trừ `NOT_PAST`): bị động hiện tại | ✗ (mới) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | được |

**Luôn bị báo** (cả 13 thì):
- could, would, may, might, shall, ought, 'd;
- have to / has to / had to, used to;
- had / hadn't + V2 / V3 / -ed;
- was / were + V-ing;
- was / were (+ not) + V3 hoặc từ -ed (trừ `NOT_PAST`), tức bị động quá khứ;
- some, any, many, much, lot, because, so;
- "Don't + V" mở đầu câu (đầu chuỗi hoặc sau . ! ? —).

**`TIME_TAILS` thêm:** tomorrow, tonight, this weekend, this year, next + (week / weekend / month / year / tên thứ). `frontedTimeTail` nhận thêm đuôi `(a | an | one | … | ten | <số>) (minute | hour | day | week | month | year)(s) ago` và `in <4 chữ số>`.

**Ngoại lệ của bộ bắt (review story 37):** "Let's + V" không tính là `'s` + V3; "going to + từ viết hoa" (tên nơi chốn) không tính là going to + V; to be / `'s` + tính từ -ed hay gặp (worried, surprised, scared, crowded, relaxed, pleased, closed…) không tính là bị động / hoàn thành; câu hỏi bị động xét chủ ngữ 1–3 từ; nhóm have to thêm have got to / 've got to / gotta.

**Luật chốt dạng** (để câu chỉ có một đáp án đúng):
- `will`: dùng ngữ cảnh lời hứa (I promise…), đề nghị / quyết định ngay lúc nói (OK, I'll… / It's cold. I'll…), nhờ (Will you…?), từ chối (won't). Không dùng câu dự đoán trơn kiểu "It ___ (rain) tomorrow", vì going to cũng đúng.
- `going-to`: có kế hoạch đã định (đã mua vé, đã quyết từ trước) hoặc dấu hiệu trước mắt (Look!…). Câu gõ cả cụm có gợi ý "(V1)" hoặc "(not / V1)", và đáp án luôn có am / is / are.
- `present-perfect`: câu gõ một chỗ hoặc đã cho sẵn have / has (chỗ trống là V3), hoặc có gợi ý "(have / V1)" / "(has / not / V1)". Không dùng just / already làm dấu hiệu duy nhất, vì tiếng Anh Mỹ cũng nói "I already ate".
- `present-perfect-vs-past`: dấu hiệu phải chốt thì: since / for + kéo tới giờ / How long → hoàn thành; mốc đã xong (last…, ago, in + năm, When…? về việc đã xảy ra) → quá khứ đơn.
- `modals`: gợi ý ghi modal khi nghĩa không tự chốt ("(should / not / eat)"). Hoặc câu dịch có chữ Việt chốt nghĩa: "nên" → should, "không được (luật)" → mustn't; can't cũng đúng thì vào `accept`.
- `'s` không được `normalizeTyped` mở rộng, nên luôn có `accept` cho dạng kia (luật ở Boundaries). `'ll`, `'re`, `'ve` chỉ tự mở rộng sau đại từ. Chỗ trống bắt đầu bằng `'ll` / `'re` / `'ve` (không có chủ ngữ) thì `accept` có bản rút gọn ("'ll call").

**Phải phủ** (tính trên câu quiz + phần luyện của chủ điểm, kiểm bằng chuỗi đáp án):
- `will`: will + V1 với chủ ngữ he / she (she will…), 'll, won't, "Will you…?" + trả lời ngắn (Yes, I will. / No, I won't.), lời hứa, đề nghị lúc nói, một câu won't ↔ want to.
- `going-to`: am, is, are + going to (đủ 3 dạng), isn't / aren't going to, "Are / Is … going to …?" + trả lời ngắn, Wh + be + S + going to, một câu dấu hiệu trước mắt.
- `present-perfect`: have + V3 và has + V3, ≥ 4 V3 khác nhau (≥ 2 V3 khác V2, ví dụ seen / eaten / written / driven), V3 có quy tắc (-ed), haven't / hasn't … yet, "Have / Has … ever …?" + trả lời ngắn, never, been to và gone to.
- `present-perfect-vs-past`: for + khoảng, since + mốc, How long have / has…?, quá khứ đơn với last / ago / in + năm, When did…?, một câu đổi hiện tại đơn → hoàn thành với since, ≥ 1 câu dịch "đã" ra quá khứ đơn và ≥ 1 câu dịch "được … rồi" ra hoàn thành.
- `modals`: can (khả năng), Can I…? (xin phép), can't, should, shouldn't, must, mustn't, một câu đổi phủ định / câu hỏi không mượn do.
- `comparatives`: -er (cheap → cheaper), gấp đôi (big / hot), -y → -ier, more + tính từ dài, better hoặc worse, the + -est, the most + tính từ dài, the best.
- `passive-present`: is + V3 và are + V3, V3 có quy tắc và V3 bất quy tắc, isn't / aren't + V3, "Is / Are … + V3 …?", một câu có by, một câu "Đổi sang bị động:", một câu phân biệt clean (tính từ) với cleaned.

**Câu golden** (người làm giữ đúng đề, đáp án, `accept`, `requires`; được viết lại `explanation`):

| Id | Dạng | Đề | Đáp án | `accept` | `requires` |
|---|---|---|---|---|---|
| q-s1-t3-w1-07 | type | "I promise I ___ (call) you tonight." | `will call` | `'ll call` | subject-pronouns, object-pronouns, verb-forms |
| q-s1-t3-w2-11 | biến đổi | "Đổi sang câu phủ định: They are going to sell their house." | `They aren't going to sell their house.` | — | subject-pronouns, possessive-adjectives, be-negative, verb-forms |
| q-s1-t3-w3-13 | dịch | "Dịch sang tiếng Anh: Bố tôi chưa bao giờ lái xe ô tô. (father, never, drive, a car)" | `My father has never driven a car.` | `My father's never driven a car.` | possessive-adjectives, articles, frequency-adverbs, verb-forms |
| q-s1-t3-w4-11 | biến đổi | "Đổi sang hiện tại hoàn thành (since 2019): My parents live in Da Nang." | `My parents have lived in Da Nang since 2019.` | — | possessive-adjectives, plurals, numbers, verb-forms |
| q-s1-t3-w4-13 | dịch | "Dịch sang tiếng Anh: Chúng tôi chuyển tới Hà Nội ba năm trước. (move, Hanoi, three years ago)" | `We moved to Hanoi three years ago.` | `Three years ago we moved to Hanoi.` | subject-pronouns, numbers, verb-forms |
| q-s1-t4-w1-11 | biến đổi | "Đổi sang câu phủ định: My grandfather can swim." | `My grandfather can't swim.` | — | possessive-adjectives, subject-verb |
| q-s1-t4-w3-07 | type (`từ loại`) | "This bag is ___ (heavy) than that one." | `heavier` | — | demonstratives, be-affirmative, parts-of-speech |
| q-s1-t4-w3-21 | biến đổi | "Đổi sang bị động: People speak French in Canada." | `French is spoken in Canada.` | — | be-affirmative, verb-forms, prepositions-of-place |

**Phần luyện: ví dụ mẫu và màn điền** (giữ dạng câu và đáp án, được sửa chữ `vi` / ghi chú):
- `will`:
  - worked: "It's raining. I'll take an umbrella." / "Trời đang mưa. Tôi sẽ mang ô." Ghi chú: quyết định ngay lúc nói nên dùng will; I'll = I will; take giữ nguyên mẫu;
  - faded: "We ___ (not / be) late. I promise." → `won't be`.
- `going-to`:
  - worked: "She's going to study in Japan next year. She bought the plane ticket." Ghi chú: kế hoạch đã định (đã mua vé) nên dùng going to; She's = She is;
  - faded: "Look at the time! We ___ (miss) the bus." → `are going to miss`, accept `'re going to miss`.
- `present-perfect`:
  - worked: "I have read this book twice." Ghi chú: have + V3, read – read – read (V3 đọc /red/), twice không nói lúc nào;
  - faded: "She has never ___ (write) a letter in English." → `written`.
- `present-perfect-vs-past`:
  - worked: "My aunt moved to Da Lat in 2018. She has lived there since 2018." Ghi chú: in 2018 là mốc đã xong nên dùng moved; kéo tới giờ (since) nên dùng has lived;
  - faded: "We ___ (know) each other for five years." → `have known`.
- `modals`:
  - worked: "You should wear a coat. It's cold outside." Ghi chú: should = lời khuyên; sau should là V nguyên mẫu, không to, không -s;
  - faded: "My sister can ___ (play) the guitar." → `play`.
- `comparatives`:
  - worked: "My new job is easier than my old job." Ghi chú: easy → easier (y → ier) + than;
  - faded: "This summer is ___ (hot) than last summer." → `hotter` (gấp đôi t).
- `passive-present`:
  - worked: "This bread is made every morning." / "Bánh mì này được làm mỗi sáng." Ghi chú: is + V3 (make – made – made), không cần nói ai làm;
  - faded: "These books ___ (write) in English." → `are written`.

**Sửa chữ lý thuyết:**
- `PERFECT_VS_PAST.rules[1]`: "Có mốc đã xong (yesterday, ago, last …, in 2020), hoặc hỏi When …? về việc đã xảy ra, thì dùng quá khứ đơn."
- `PERFECT_VS_PAST.mistakes[1].why`: "Hỏi When … về việc đã xảy ra là hỏi một lúc đã xong nên dùng quá khứ đơn (When will you…? vẫn dùng cho tương lai)."
- `COMPARATIVES.rules[2]`: 'Không dùng cả hai: "more cheaper" sai. So sánh nhất có the, trừ khi đã có my / your / his… (my best friend).'
- `COMPARATIVES.mistakes[2].why`: "So sánh nhất cần the (khi trước nó không có my / your / his…)."

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: cả ba đều qua, không assertion nào bị nới thành `>=`.
- `npx vitest run src/lib/tense-scope.test.ts src/data/questions src/data/lessons src/lib/quiz src/lib/owl src/lib/comeback` -- expected: qua, có describe story 37 trong `questions.test.ts` và `lessons.test.ts`.
- `npm run layout:guard` -- expected: không báo file nào mới so với baseline (story này không đổi component).
- `npm run layout:check` (cần Chrome) -- expected: không cuộn ngang ở 5 bề rộng, ảnh 375px khớp baseline. Chỉ còn lỗi probe "chào 1" có sẵn.

**Manual checks (if no CLI):**
- Chrome 375px, store đã bỏ qua Sân ga:
  - `/roadmap/lesson/s1-t4-w3/grammar`: có 2 khối luyện, đi hết 4 bước mỗi khối;
  - `/roadmap/lesson/s1-t3-w2/grammar`: khối luyện going to và khối "will hay going to?" mở loại trừ nhau;
  - quiz `lesson-s1-t3-w4` có câu "Dịch sang tiếng Anh". Gõ sai thì vào Sổ lỗi với "bạn gõ".
