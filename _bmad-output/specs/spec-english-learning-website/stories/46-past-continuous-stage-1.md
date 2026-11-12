---
title: 'Quá khứ tiếp diễn ở Chặng 1, s1-t2-w4 (CAP-11, CAP-23, learning-rules "Chỉ dùng kiến thức đã dạy", "Thẻ quy tắc", "Từ tín hiệu và chọn thì")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: '5e4a860a6548189a28f3299fc6ac43437f4b44ff'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/33-past-to-be-wh-did.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/36-t1-t2-tense-practice-data.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/38-tense-rule-cards-irregular-verb-srs.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 2 (ghi trong file quyết định của đợt): **quá khứ tiếp diễn đưa vào Chặng 1**, ngay sau to be quá khứ, đặt ở s1-t2-w4 (tuần ôn T2) thành một Tense nhỏ: was / were + V-ing, when + quá khứ đơn, while + tiếp diễn. Cập nhật lộ trình (`stage-1.ts`, SPEC / learning-rules) và ghi rõ đây là quyết định ngày 2026-11-11. Báo cáo kiểm tra mục T8: thì này không có ở đâu trong 12 tháng, là lõi A2 và hay gặp ở TOEIC Part 5 (when / while). Đây là đề xuất của Claude trong báo cáo; Huy không chọn riêng mà đồng ý khi giao chạy hết (cùng cách ghi với story 33).
- Quyết định 3: "nắm chắc" là Huy **tự làm ra** được câu đúng (gõ, biến đổi, dịch Việt → Anh, nói), thì đã học được ôn giãn cách (SRS) và trộn với thì cũ.
- Quyết định 4: dùng lại tối đa bộ máy có sẵn: Tense + `practice` (story 35–36), `ruleCards` (story 33, 38), `signalWords` (story 39), câu quiz có `requires` (story 27, 33), phạm vi chữ `tense-scope.ts` (story 36–37), thần chú (story 10).
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset; nội dung tiếng Việt tự soạn; câu chỉ dùng kiến thức đã dạy; giao diện 375px không đổi ngoài phần mới; không nâng schema store, không thêm key đồng bộ.
- Claude chọn:
  - **Tense mới `past-continuous`** tên "Quá khứ tiếp diễn (was / were + V-ing)", là thì duy nhất của `GRAMMAR_T2_W4`, đứng trước phần ôn tập T2 (review và link mini-t2 giữ nguyên chỗ). Đủ các phần như mọi thì T1–T2: 3 quy tắc, 6 ví dụ, 5 lỗi hay mắc, 4 dòng công thức (khẳng định, phủ định, câu hỏi, when · while), 2 câu thoại YouGlish, `signalWords`, phần luyện 6 câu chính + 2 câu dễ hơn, 4 thẻ quy tắc.
  - **Dòng thời gian mới `past-progress`**: đường sóng nằm ở phần quá khứ, có một dấu × chen vào (việc ngắn). Chỉ thêm nhánh vẽ SVG trong `TenseTimeline`, không thêm class.
  - **Thần chú mới Impedimenta** (chặn ngang một việc đang diễn ra) cho `past-continuous`, mở khi xong s1-t2-w4, đúng CAP-11 "hoàn thành bài thì mở khoá thần chú tương ứng". Tổng 13 thần chú.
  - **12 câu quiz mới** `q-s1-t2-w4-07` … `-18`, nhãn `thì`, đều có `requires` (khái niệm viên gạch / bài T1, không thêm khái niệm T2: việc của story 47). 4 câu chọn, 4 câu gõ dạng đúng, 2 câu biến đổi, 2 câu dịch Việt → Anh (cùng chuẩn 12 câu mỗi thì của story 36). 6 câu ôn cũ của bài giữ nguyên id và chữ.
  - **Phạm vi chữ:** thêm id `past-continuous` vào `T1_T2_SCOPE_IDS` (đứng sau `past-simple-irregular`, tổng 14 id). Quá khứ tiếp diễn (was / were + V-ing) mở từ `past-continuous` trở đi, kể cả 7 chủ điểm T3–T4; các thì đứng trước vẫn bị báo. Bị động quá khứ, had + V3, had to… vẫn luôn bị báo.
  - **Lộ trình:** trạm s1-t2-w4 đổi tên "Quá khứ tiếp diễn · ôn lại · ôn IPA", ô Ngữ pháp đổi "Quá khứ tiếp diễn · ôn lại · mini test". `lo-trinh-toeic-12-thang.md` không sửa: test đối chiếu có ngoại lệ ghi chữ gốc như `MD_OVERRIDES` của ô Phát âm. `stage1.content` (chép nguyên văn md, không hiện trên UI) giữ nguyên.
  - **Ôn tổng:** tóm tắt T2-W4 thêm 1 dòng; ôn tổng O.W.L. (s1-t4-w4) thêm 1 dòng link và bảng "Mỗi thì một dòng" thêm dòng quá khứ tiếp diễn (11 dòng). mini-t2 thêm "quá khứ tiếp diễn" vào mô tả; đề mini-t2 đổi có chủ đích vì bài s1-t2-w4 có thêm câu.
  - **Không đưa vào kho O.W.L.** (story 40 chốt 10 chủ điểm × 2 câu): ghi vào `deferred-work.md`. Quá khứ tiếp diễn vẫn được kiểm ở quiz bài, mini-t2, ôn trộn mix-s1 / mix-tet và kiểm tra cuối Bài chính (story 41), vì các đề này lấy câu theo bài.

**Problem:** Quá khứ tiếp diễn không có ở đâu trong lộ trình 12 tháng, dù là lõi A2, nền của mẫu câu "I was … when …" và hay gặp ở TOEIC Part 5. Phạm vi chữ hiện còn báo mọi câu was / were + V-ing là "luôn chưa dạy".

**Approach:**
- Thêm Tense `past-continuous` (có phần luyện, thẻ quy tắc, từ tín hiệu, thần chú, dòng thời gian mới) vào s1-t2-w4, trước phần ôn tập.
- Thêm 12 câu quiz có `requires`; mở phạm vi chữ quá khứ tiếp diễn từ `past-continuous`.
- Cập nhật lộ trình, ôn tổng, mini-t2, tài liệu; test khoá nội dung, phạm vi, thẻ, quiz.

## Boundaries & Constraints

**Always:**
- Tense mới theo đúng luật Tense hiện có: 3 quy tắc, 4–6 ví dụ có dịch, có lỗi hay mắc, ≥ 1 câu thoại YouGlish (`yg`), có `timeline` (kind `past-progress`) và `signalWords`. Mỗi từ tín hiệu có nguyên cụm trong chữ tiếng Anh của chính thì (luật story 39).
- Phần luyện theo luật story 35–36 (`practiceProblems` rỗng):
  - 6 câu chính, ≥ 3 câu type, có câu "Đổi …:" và câu "Dịch sang tiếng Anh: … (…)";
  - 2 câu dễ hơn là choice 3 lựa chọn;
  - `worked.timeline.kind` = `past-progress`; 2 câu nói id `past-continuous-say-1`, `-say-2`;
  - id câu `past-continuous-c<n>` / `-e<n>`, không trùng câu luyện của viên gạch, thì, khối Chọn thì hay câu quiz;
  - đề không trùng đề quiz s1-t2-w4.
- Câu gõ (phần luyện và quiz):
  - đáp án / `accept` không có dấu tiếng Việt và tự chấm đúng (`isCorrect` / `matchesTyped`);
  - câu dịch hay câu biến đổi (không phải câu hỏi) mà đáp án kết thúc bằng trạng ngữ trong `TIME_TAILS` thì `accept` có bản đặt trạng ngữ lên đầu;
  - câu dịch có hai mệnh đề when / while thì `accept` có bản đảo hai mệnh đề.
- Mọi chữ tiếng Anh của thì mới (ví dụ, `mistakes.right`, phần luyện, thẻ đã điền đáp án, câu quiz mới: đề, đáp án, `accept`) nằm trong phạm vi chữ `past-continuous`:
  - được dùng: Sân ga, hiện tại đơn / tiếp diễn, was / were, -ed, did, V2 của 50 động từ bất quy tắc, was / were + V-ing;
  - không dùng: V3 khác V2, will / going to, modal, since, than, bị động, "Don't + V";
  - V2 chỉ lấy trong `IRREGULAR_VERBS` (không dùng rang, woke…).
- Câu quiz mới: id `q-s1-t2-w4-07` … `-18`, nhãn `thì`, đoạn `grammar`. Câu chọn có 4 lựa chọn khác nhau, đáp án đứng đầu, `kind: 'choice'`. `requires` khác rỗng, hợp lệ theo `requiresViolations`. 6 câu cũ `-01` … `-06` giữ nguyên.
- Thẻ quy tắc:
  - đúng 4 thẻ `past-continuous-rule-1` … `-4`, đúng một `___`, gợi ý trong ngoặc ngay sau `___`;
  - có ≥ 1 thẻ phủ định và ≥ 1 thẻ câu hỏi;
  - không trùng hay gần trùng câu có sẵn của bài (test story 38);
  - id SRS `rule:past-continuous-n` là key mới trong `srs.cards`, cùng shape `SrsCard`.
- Thần chú `impedimenta` trỏ `past-continuous` / `s1-t2-w4`, có `grammarEn` không chứa will / going to / perfect.
- 375px:
  - không cuộn ngang;
  - `TenseTimeline` chỉ thêm phần tử SVG (không thêm hay xoá class);
  - `npm run layout:guard` không báo class mới hay class bị xoá.

**Never:**
- Không làm việc của story sau: Bản đồ thì (42); khái niệm bài T2 trong `concepts.ts`, `requires` cho câu T2–T4 cũ, test quay lại ở Sân ga, video lệch tuần, chia Ngữ pháp theo ngày (47).
- Không sửa:
  - kho O.W.L. (`owl.ts`, `OWL_TOPICS`, `OWL_CONTRASTS`, cách bốc, báo điểm);
  - định nghĩa `mix-s1` / `mix-tet` / `mini-t3` (chỉ đổi `description` của mini-t2);
  - khối Chọn thì (`tense-choices.ts`), các Tense khác, câu quiz cũ, `stage1.content` / `canDo`;
  - `lo-trinh-toeic-12-thang.md`, `stage-2.ts`, `stage-3.ts`, `videos.json`, file phụ đề, `function-words.ts` (while vẫn là cổng tường, when vẫn mở ở s1-t1-w3).
- Không dạy past perfect, bị động quá khứ, used to, would + V, câu điều kiện. Không dùng when / while ở thì khác trong story này.
- Không đổi component nào ngoài `TenseTimeline.tsx`. Không đổi kiểu `Tense`, `Question`, `CheckItem`, `QuizDef`, `Spell`. Chỉ được thêm 1 giá trị vào `TimelineKind`.
- Không đổi store schema, `SYNCED_KEYS`, thuật toán SRS, `ruleStudyWords`, `pickQuiz`.
- Không chép câu hay bảng từ sách, web có bản quyền.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bài s1-t2-w4 ở 375px | `#/roadmap/lesson/s1-t2-w4/grammar` hoặc bước Bài chính của buổi 30' | Thứ tự: TenseCard "Quá khứ tiếp diễn (was / were + V-ing)" có dòng thời gian sóng ở quá khứ + dấu ×, hàng chip at that time · at 8 p.m. yesterday · when · while; khối "Luyện: …" đóng; rồi phần Ôn tập T2 (tóm tắt có dòng quá khứ tiếp diễn, nút mini-t2). `scrollWidth` = 375 | N/A |
| Lộ trình | Bản đồ Năm học, trạm T2 tuần 4 | Tên "Quá khứ tiếp diễn · ôn lại · ôn IPA"; đoạn Ngữ pháp "Quá khứ tiếp diễn · ôn lại · mini test" | N/A |
| Luyện phủ định | `past-continuous-c3` "They ___ (not / play) football at that time." gõ "weren't playing", "were not playing" hoặc "werent playing" | Đúng | "didn't play" → sai, giải thích "đang (lúc đó) → weren't + V-ing, không mượn didn't", làm lại. Không ghi Sổ lỗi |
| Luyện câu hỏi | `-c4` "Đổi sang câu hỏi: He was working at that time." gõ "was he working at that time" | Đúng | "Did he working at that time?" → sai, giải thích "đưa was lên trước he, không mượn did" |
| Luyện việc chen vào | `-c2` "Tom was walking to school when he ___ his teacher." chọn "was meeting" | Sai, giải thích "gặp là việc ngắn chen vào → quá khứ đơn met" | Chọn lại |
| Luyện dịch while | `-c5` gõ "I was cleaning my room while my mother was cooking" | Đúng (bản đảo mệnh đề nằm trong `accept`) | N/A |
| Quiz bài | `lesson-s1-t2-w4`, mọi viên đã dạy, có / không TTS | 5 câu không trùng, bốc từ 18 câu của bài | N/A |
| Thiếu nền | Chưa học viên nào (đang ở Sân ga) | Quiz bài chạy 5 câu từ 6 câu cũ, `skipped` = 12; mini-t2 vẫn 10 câu, mỗi bài T2 ≥ 2, `skipped` = 48 | Còn ≥ 4 câu nên vẫn chạy (luật story 27) |
| mini-t2 | `mini-t2` mọi seed | 10 câu, mỗi bài T2 ≥ 2 câu, không trùng; đề baseline của mini-t2 đổi (có chủ đích), đề baseline các bài test khác không đổi | N/A |
| Thẻ vào SRS | Đánh dấu xong s1-t2-w4 | Phiên ôn có `rule:past-continuous-1` … `-4` là thẻ mới, sau thẻ viên gạch và thẻ bài trước theo thứ tự lộ trình. Nhãn "Thẻ quy tắc · T2 tuần 4", link "Xem lại bài" tới `/roadmap/lesson/s1-t2-w4/grammar` | N/A |
| Bài chưa xong / bị xếp qua | s1-t2-w4 chưa đánh dấu, hoặc Mũ Phân Loại xếp bắt đầu từ s1-t3-w1 | Không có thẻ `rule:past-continuous-*`, Impedimenta chưa mở | N/A |
| Bỏ đánh dấu | Đã có thẻ, rồi bỏ đánh dấu s1-t2-w4 | Thẻ không vào phiên, không đếm tồn ôn; mục `srs.cards` giữ nguyên; Impedimenta khoá lại | N/A |
| Thần chú | Xong s1-t2-w4 | Impedimenta mở (sau Reparo theo thứ tự `SPELLS`); prompt luyện nói có "past continuous" | N/A |
| Phạm vi chữ mở | `outOfScopeWords(id, …)` với id = `past-continuous` hoặc 7 chủ điểm T3–T4: "She was cooking.", "Were you sleeping?", "They weren't working.", "What were you doing at 8 p.m.?", "While I was cooking, he was watching TV.", "I was walking home when it started to rain." | `[]` | N/A |
| Phạm vi chữ còn khoá | Cùng các câu trên, id ∈ 6 thì T1–T2 đứng trước | Bị báo | N/A |
| Luôn bị báo | Mọi 14 id: "The cake was made yesterday.", "He had bought it.", "He had to wait.", "I used to swim.", "Don't worry." | Bị báo | N/A |
| Thẻ mồ côi | `srs.cards` có `rule:past-continuous-9` | Không hiện, không đếm tồn ôn, vẫn nằm trong store | N/A |
| Máy cũ | App bản trước story 46 đồng bộ store có `rule:past-continuous-1` | Không lỗi, thẻ không hiện | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/t2-t4-grammar.ts`:
  - `PAST_TO_BE` (`:197-361`) và `PAST_SIMPLE_IRREGULAR` (`:530-692`) là mẫu (formulas, ruleCards, practice, comment phạm vi chữ);
  - helper `yg` (`:17`); `GRAMMAR_T2_W4` (`:1839-1852`), `tenses: []`, review summary 5 dòng, `quizId: 'mini-t2'`.
- `src/data/lessons/types.ts:162-171` -- `TimelineKind` (thêm `past-progress`, sửa doc comment). Kiểu `Tense`, `TensePractice`, `TenseRuleCard` không đổi.
- `src/components/lesson/TenseTimeline.tsx` -- nhánh vẽ theo `kind` (`progress` là mẫu đường sóng, `past-point` là mẫu dấu ×); doc comment liệt kê các kind.
- `src/data/lessons/spells.ts` -- `SPELLS` (thêm Impedimenta sau Reparo). Dùng ở `src/lib/spells.ts` (mở theo bài đã xong), `src/lib/roleplay.ts` (`grammarEn` vào prompt), TenseCard (huy hiệu thần chú).
- `src/data/lessons/t2-t4-pronunciation.ts`:
  - `STAGE_1_OVERVIEW_TENSES` (`:270-287`);
  - `STAGE_1_TENSE_TABLE` (`:289-310`), doc comment còn ghi "không quá khứ tiếp diễn".
- `src/data/lessons/index.ts` -- `LESSON_CONTENTS` mục s1-t2-w4 (`:105-110`) dùng `GRAMMAR_T2_W4`; `allTenses`, `lessonRuleCards` tự lấy thì mới. Không cần sửa (trừ khi muốn re-export hằng).
- `src/lib/tense-scope.ts`:
  - doc comment `:3-16`; `T1_T2_SCOPE_IDS` `:20-27`;
  - `Scope` `:179-200`, `T1_T2_BASE` / `T3_T4_BASE` `:202-204`, `SCOPES` `:206-220`;
  - `PAST_PROGRESSIVE_RE` `:232-233`; vòng "luôn bị báo" `:374-376`.
- `src/data/questions/t2-t4.ts` -- comment đầu file (`:5-15`, "162 câu"), `lesson()` (`:87-117`, `grammar` nhận `requires` ở tham số thứ 6, `type` / `transform` bắt buộc `requires`), khối T2-W4 (`:303-319`).
- `src/data/questions/index.ts:91-99` -- `mini-t2` (`description`).
- `src/data/roadmap/stage-1.ts:190-199` -- tuần `s1-t2-w4` (`title`, `grammar`).
- `src/lib/flashcard-session.ts` `ruleStudyWords`, `src/components/flashcards/rule-source.ts` -- tự lấy thẻ của bài đã xong và nhãn "T2 tuần 4". Không sửa.
- `src/components/lesson/LessonContentParts.tsx:249-286` `GrammarSection` -- vẽ Tense + phần luyện rồi review. Không sửa.
- Test (Vitest env `node`, chỉ `src/**/*.test.ts`):
  - `src/lib/tense-scope.test.ts`:
    - id `:20-43`, T1–T2 `:108-125`;
    - ROWS `:131-176`, "luôn bị báo" `:200-208`, lượng từ / liên từ `:210-251`;
  - `src/data/lessons/lessons.test.ts`:
    - danh sách thì `:197-235`, T2-W4 `:245-250`, ôn tổng `:286-304`, thần chú `:389-419`, `lessonRuleCards` `:573-581`;
    - "13 thì có practice" `:685-689`, story 36 `ALL` / `QUIZ` / "Phải phủ" `:691-908`;
    - thẻ story 38 `CARDS` / `THREE_FORMS` / 58 thẻ `:1216-1263`, `SIGNAL_WORDS` `:1450-1462`, bảng "Mỗi thì một dòng" `:1728-1761`;
  - `src/data/questions/questions.test.ts`:
    - tổng câu `:100-121`;
    - `TENSE_QUESTIONS: Record<T1T2ScopeId, …>` `:485-492`;
    - "không câu mới nào … ngoài bảng" `:592-599`;
  - `src/lib/quiz/quiz.test.ts:498-536` -- `BASELINE_PICKS` (8 khoá `mini-t2|…`);
  - `src/lib/quiz/requires.test.ts`: `:154-166` (dùng `lesson-s1-t2-w4` làm bài không có `requires`), `:286-311` (mini-t2 bỏ 36 câu);
  - `src/lib/spells.test.ts:30` (`SPELLS` 12), `src/lib/roleplay.test.ts`;
  - `src/data/roadmap/roadmap.test.ts:58-66` `MD_OVERRIDES`, `:220-260` bảng tuần chặng 1;
  - `src/data/questions/owl.test.ts:205-220` (câu O.W.L. không trùng câu luyện / ví dụ của thì): chỉ phải qua.
- Tài liệu:
  - `_bmad-output/specs/spec-english-learning-website/SPEC.md:98` (md thua SPEC ở chỗ nào);
  - `learning-rules.md:52` (thì T1–T2 có phần luyện), `:119` (từ tín hiệu);
  - `_bmad-output/implementation-artifacts/deferred-work.md`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/lessons/types.ts` -- `TimelineKind` thêm `'past-progress'`; doc comment: "Story 46: `past-progress` (việc đang diễn ra ở một lúc trong quá khứ, có việc ngắn chen vào)".
- [x] `src/components/lesson/TenseTimeline.tsx` -- thêm nhánh `past-progress`:
  - đường sóng cùng nét với `progress`, nằm trong phần quá khứ (khoảng x 30–118);
  - một `Cross` ở khoảng x 92 (việc ngắn chen vào).
  Không thêm `className`, không đổi nhánh khác; sửa doc comment.
- [x] `src/data/lessons/t2-t4-grammar.ts` --
  - thêm `PAST_CONTINUOUS` theo Design Notes (`spellId: 'impedimenta'`), đặt sau `PAST_SIMPLE_IRREGULAR`;
  - comment phần luyện ghi phạm vi chữ `past-continuous`;
  - `GRAMMAR_T2_W4.tenses = [PAST_CONTINUOUS]`;
  - review: thêm dòng quá khứ tiếp diễn sau dòng bất quy tắc; dòng "Không trộn" thêm "I was cook" (giữ "Did you be").
- [x] `src/data/lessons/spells.ts` -- thêm Impedimenta ngay sau `reparo` (Design Notes). Sửa doc comment nếu nêu số thần chú.
- [x] `src/data/lessons/t2-t4-pronunciation.ts` --
  - `STAGE_1_OVERVIEW_TENSES`: thêm dòng `s1-t2-w4` / `grammar` sau dòng động từ bất quy tắc;
  - `STAGE_1_TENSE_TABLE`: thêm dòng `past-continuous` sau `past-simple`; sửa doc comment (bỏ "không quá khứ tiếp diễn").
- [x] `src/lib/tense-scope.ts` --
  - `T1_T2_SCOPE_IDS` thêm `'past-continuous'` cuối (7 id, `TENSE_SCOPE_IDS` 14);
  - `Scope` thêm `pastProgressive: boolean` (was / were (+ not / chủ ngữ / trạng từ) + V-ing):
    - `T1_T2_BASE` false, `T3_T4_BASE` true;
    - `'past-continuous'` = mọi nhóm của `past-simple-irregular` + `pastProgressive: true`;
  - `PAST_PROGRESSIVE_RE` chỉ báo khi `!scope.pastProgressive`;
  - sửa doc comment đầu file, comment `PAST_PROGRESSIVE_RE`, comment vòng "luôn bị báo": quá khứ tiếp diễn dạy ở s1-t2-w4, mở từ `past-continuous` (story 46). Bị động quá khứ, had + V3, had to / used to / got to, "Don't + V" vẫn luôn bị báo.
- [x] `src/data/questions/t2-t4.ts` -- thêm `t2w4.grammar(7…10)`, `t2w4.type(11…14)`, `t2w4.transform(15…18)` theo Design Notes, dưới comment "Quá khứ tiếp diễn (story 46)". Comment đầu file: 174 câu, `s1-t2-w4` có 18 câu (6 câu ôn + 12 câu quá khứ tiếp diễn của story 46).
- [x] `src/data/questions/index.ts` -- `mini-t2.description`: "10 câu ôn cả 4 tuần T2: hiện tại tiếp diễn, quá khứ đơn, động từ bất quy tắc, quá khứ tiếp diễn, trọng âm, đuôi -ed."
- [x] `src/data/roadmap/stage-1.ts` -- `s1-t2-w4`:
  - `title: 'Quá khứ tiếp diễn · ôn lại · ôn IPA'`, `grammar: 'Quá khứ tiếp diễn · ôn lại · mini test'`;
  - comment: "Quyết định 2026-11-11 (story 46): thêm quá khứ tiếp diễn vào Chặng 1; md gốc ghi 'Ôn lại · mini test'".
- [x] `src/data/roadmap/roadmap.test.ts` --
  - thêm `MD_GRAMMAR_OVERRIDES` cùng kiểu `MD_OVERRIDES`: `'s1-t2-w4': ['Ôn lại · mini test', 'Quá khứ tiếp diễn · ôn lại · mini test']`, comment ghi quyết định 2026-11-11 / story 46;
  - nhánh ô Ngữ pháp của test bảng tuần: có override thì kiểm ô md đúng chữ gốc và `getSection(…, 'grammar').task` đúng chữ app.
- [x] `src/lib/tense-scope.test.ts` --
  - test id: 14 id, `T1_T2_SCOPE_IDS` có `past-continuous` cuối;
  - test "review story 36: quá khứ tiếp diễn …": câu quá khứ tiếp diễn chỉ bị báo ở 6 id đứng trước `past-continuous`; các câu khác của test vẫn bị báo ở cả 7 id T1–T2;
  - ROWS thêm hàng "quá khứ tiếp diễn (was / were + V-ing, when, while)" `from: 'past-continuous'`, mẫu là 6 câu dòng "Phạm vi chữ mở" của bảng I/O;
  - `ALWAYS` bỏ 'She was cooking.'; đổi tên test "… ở cả 14 thì";
  - test lượng từ / liên từ: bỏ 'She was cooking.' khỏi dòng "vẫn bị báo";
  - thêm test `past-continuous`:
    - 6 câu mở → `[]`;
    - vẫn báo will, going to, "She has seen it.", can, since, than, "The cake was made yesterday.", "He had to wait.";
    - `outOfScopeWords('past-simple-irregular', 'She was cooking.')` bị báo.
- [x] `src/data/lessons/lessons.test.ts` --
  - danh sách thì thêm `past-continuous` sau `past-simple-irregular`;
  - thần chú: thêm `['impedimenta', 'past-continuous', 's1-t2-w4']` sau reparo;
  - test "T2 tuần 4": `tenses` = `['past-continuous']`, giữ `quizId` mini-t2 và note;
  - `lessonRuleCards('s1-t2-w4')` = `past-continuous-rule-1` … `-4`;
  - test ôn T2-W4: thêm kiểm dòng bắt đầu "Quá khứ tiếp diễn: was / were + V-ing" và "I was cook" trong dòng Không trộn;
  - "13 thì có practice" → 14;
  - story 36: thêm `past-continuous` vào `ALL` và `QUIZ` (`{ lessonId: 's1-t2-w4', ns: range(7, 18) }`);
  - story 38:
    - `CARDS['past-continuous'] = ['were driving', "wasn't listening", 'Were', 'saw']` (đúng thứ tự `CARDS` theo `allTenses`);
    - `THREE_FORMS` thêm `past-continuous`; tổng 62 thẻ, tên test "14 thì … story 46 thêm 4";
  - `SIGNAL_WORDS['past-continuous'] = ['at that time', 'at 8 p.m. yesterday', 'when', 'while']`;
  - bảng "Mỗi thì một dòng": 11 dòng, `past-continuous` sau `past-simple`;
  - thêm describe "quá khứ tiếp diễn (story 46)":
    - `GRAMMAR_T2_W4` chỉ có `past-continuous`; timeline và `worked.timeline` kind `past-progress`;
    - 4 nhãn công thức Khẳng định / Phủ định / Câu hỏi / when · while;
    - `mistakes.wrong` có "I was cook dinner.", "I cooking when you called.", "Did you sleeping at 10 p.m.?";
    - "Phải phủ" (bằng `answerTexts` của story 36):
      - `/\bwas [a-z]+ing\b/`, `/\bwere [a-z]+ing\b/`, `/\bwasn't [a-z]+ing\b/`, `/\bweren't [a-z]+ing\b/`;
      - `/^(Was|Were) /`, `/No, (she|he|I) wasn't\./`, `/^What (was|were) /`, `/^While /`, `/ when [a-z ]+ (met|came|fell|got|left|saw|called|started)\b/`;
      - 1 V-ing bỏ e câm (driving / writing) và 1 V-ing gấp đôi phụ âm (swimming / running / sitting);
    - golden chấm của bảng I/O (`-c2`, `-c3`, `-c4`, `-c5`, cả đúng lẫn sai);
    - `PAST_CONTINUOUS.practice.worked.en` / `faded` đúng chữ Design Notes.
- [x] `src/data/questions/questions.test.ts` --
  - tổng: T2–T4 174 câu, `QUESTION_BANK` 216, `s1-t2-w4` 18 câu;
  - `TENSE_QUESTIONS` đổi kiểu thành `Record<Exclude<T1T2ScopeId, 'past-continuous'>, …>` (bảng story 36 giữ nguyên); test "không câu mới nào … ngoài bảng" cho phép thêm 8 id câu gõ `q-s1-t2-w4-11` … `-18`;
  - thêm describe "câu quá khứ tiếp diễn (story 46)":
    - 12 câu `-07` … `-18`: tag `thì`, đoạn `grammar`, `requires` hợp lệ;
    - 4 câu chọn đáp án đứng đầu; 4 type, 2 "Đổi …:", 2 "Dịch …";
    - chữ trong phạm vi `past-continuous`; không dấu Việt ở đáp án;
    - câu đảo mệnh đề / trạng ngữ có trong `accept`; golden `matchesTyped` của `-12`, `-15`, `-18`;
    - đáp án không trùng nguyên câu ví dụ của TenseCard;
    - `-01` … `-06` không đổi chữ, không có `requires`.
- [x] `src/lib/quiz/quiz.test.ts` -- chạy `pickQuiz` mới, ghi lại 8 khoá `mini-t2|…` của `BASELINE_PICKS`. Comment: "story 46 thêm 12 câu ở s1-t2-w4 nên đề mini-t2 đổi có chủ đích". 24 khoá còn lại phải giữ nguyên, không sửa.
- [x] `src/lib/quiz/requires.test.ts` --
  - test "quiz T2–T4 không có câu khai báo requires" chỉ còn `lesson-s1-t4-w4` (sửa comment);
  - test mini-t2 khi chưa học viên nào: tập câu mới thêm `s1-t2-w4` id ≥ 7, `skipped` = 48, tên test ghi story 46;
  - thêm test: chưa học viên nào → `lesson-s1-t2-w4` chạy 5 câu, `skipped` = 12, không câu nào có `requires`, có / không TTS; mọi viên đã dạy → `skipped` = 0.
- [x] `src/lib/spells.test.ts` -- `SPELLS` 13; thêm ca xong s1-t2-w4 → có Impedimenta.
- [x] `src/lib/roleplay.test.ts` -- thêm ca: prompt bài s1-t2-w4 (chưa mở thần chú nào) có "past continuous"; ca "xong T1–T2, ở bài will" vẫn không có going to.
- [x] `src/lib/flashcard-session.test.ts` -- thêm test:
  - bỏ qua Sân ga + xong mọi bài tới s1-t2-w4 → `ruleStudyWords` có `rule:past-continuous-1` … `-4` có `lessonId: 's1-t2-w4'`, đứng sau thẻ `past-simple-irregular`;
  - chưa đánh dấu / bị xếp qua → không có;
  - bỏ đánh dấu → không vào phiên, store giữ;
  - `rule:past-continuous-9` mồ côi không hiện.
- [x] `src/components/flashcards/rule-source.test.ts` -- thêm ca `lessonId: 's1-t2-w4'` → nhãn "T2 tuần 4", link `/roadmap/lesson/s1-t2-w4/grammar`.
- [x] `_bmad-output/specs/spec-english-learning-website/SPEC.md:98` -- thêm: "và quá khứ tiếp diễn ở s1-t2-w4 (quyết định ngày 2026-11-11, story 46)" vào câu "Chỗ nào `lo-trinh-toeic-12-thang.md` nói khác … thì SPEC và `learning-rules.md` thắng".
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` --
  - `:52`: danh sách thì T1–T2 thêm "quá khứ tiếp diễn (s1-t2-w4: was / were + V-ing, when + quá khứ đơn, while; đưa vào Chặng 1 theo quyết định ngày 2026-11-11, story 46)";
  - `:119`: câu "mỗi thì có mốc thời gian hiện hàng chip" giữ, không cần thêm khối.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- thêm 1 mục (source_spec story 46): kho O.W.L. 1 chưa có chủ điểm quá khứ tiếp diễn (`OWL_TOPICS` 10 chủ điểm × 2 câu), nên điểm từng thì và kế hoạch ôn 14 ngày không xét thì này. Lần sửa O.W.L. tới nên thêm chủ điểm `past-continuous` (2–3 câu, có câu when / while) và cặp dễ nhầm với quá khứ đơn.

**Acceptance Criteria:**
- Given Huy mở bước Bài chính của buổi 30' ở bài s1-t2-w4, when cuộn đoạn Ngữ pháp, then thấy TenseCard quá khứ tiếp diễn rồi khối "Luyện: Quá khứ tiếp diễn …", rồi phần Ôn tập T2 có nút mini test, và không có cuộn ngang ở 375px.
- Given Huy đã đánh dấu xong s1-t2-w4, when mở flashcard hôm sau, then gặp thẻ "At 6 p.m. yesterday, my parents ___ (drive) home." Lật thẻ thấy "were driving", nhãn "Thẻ quy tắc · T2 tuần 4"; bấm "Xem lại bài" thì về đúng đoạn Ngữ pháp.
- Given Huy đánh dấu xong s1-t2-w4, when mở trang bài hoặc luyện nói AI, then thần chú Impedimenta hiện đã mở trên TenseCard, và prompt luyện nói cho phép "the past continuous".
- Given Huy làm kiểm tra cuối Bài chính ở s1-t2-w4 (story 41), when gõ sai câu `q-s1-t2-w4-12`, then câu vào Sổ lỗi như mọi câu gõ, và lời mời "Ôn lại bài" tính câu này vì nhãn `thì`.
- Given máy cũ (bản trước story 46) đồng bộ store có `rule:past-continuous-1`, when mở app cũ, then app không lỗi và thẻ không hiện.

## Implementation Notes

- **Dữ liệu:** `PAST_CONTINUOUS` (t2-t4-grammar.ts, sau `PAST_SIMPLE_IRREGULAR`) đúng chữ Design Notes: 3 quy tắc, 6 ví dụ, 5 lỗi, 4 công thức, 2 YouGlish, `signalWords`, 4 thẻ, phần luyện 6 + 2 câu, 2 câu nói. `GRAMMAR_T2_W4.tenses = [PAST_CONTINUOUS]`; review thêm dòng quá khứ tiếp diễn sau dòng bất quy tắc, dòng "Không trộn" thêm "I was cook". Thần chú Impedimenta sau Reparo (13 thần chú). `STAGE_1_OVERVIEW_TENSES` thêm dòng s1-t2-w4, `STAGE_1_TENSE_TABLE` thêm dòng `past-continuous` sau `past-simple` (11 dòng). 12 câu quiz `q-s1-t2-w4-07` … `-18` đúng bảng (giải thích tự soạn; `-18` có `accept` đảo mệnh đề). mini-t2 đổi `description`. `stage-1.ts` đổi `title` / `grammar` s1-t2-w4 kèm comment quyết định.
- **Dòng thời gian:** `TimelineKind` thêm `past-progress`; `TenseTimeline` thêm nhánh SVG (đường sóng x 30 → 117.5, `Cross` x 92), không thêm / xoá class.
- **Phạm vi chữ:** `T1_T2_SCOPE_IDS` thêm `past-continuous` (14 id); `Scope.pastProgressive` (`T1_T2_BASE` false, `T3_T4_BASE` true, `past-continuous` = nhóm của `past-simple-irregular` + true); `PAST_PROGRESSIVE_RE` chỉ báo khi `!scope.pastProgressive`. Bị động quá khứ, had + V3, had to / used to / got to, "Don't + V" vẫn luôn bị báo.
- **Test:** tense-scope (14 id, hàng ROWS mới, describe story 46, ALWAYS / lượng từ bỏ "She was cooking."), lessons (danh sách thì, thần chú, T2-W4, `lessonRuleCards`, ôn T2-W4, 14 thì practice, `ALL` / `QUIZ`, `CARDS` / `THREE_FORMS` / 62 thẻ, `SIGNAL_WORDS`, bảng 11 dòng, describe "quá khứ tiếp diễn (story 46)" lồng trong describe story 36 để dùng `answerTexts` / `has`), questions (174 / 216 / 18, `TENSE_QUESTIONS` kiểu `Exclude<…>`, cho phép 8 id `-11` … `-18`, describe story 46), quiz (8 khoá `mini-t2|…` ghi lại, 24 khoá khác không đổi), requires (bỏ `lesson-s1-t2-w4` khỏi test không requires; mini-t2 bỏ 48; test mới `lesson-s1-t2-w4` skipped 12 / 0), spells (13, ca Impedimenta), roleplay (prompt s1-t2-w4 có "past continuous"), flashcard-session (describe story 46: thứ tự sau `past-simple-irregular-4`, chưa đánh dấu / bị xếp qua, bỏ đánh dấu, mồ côi `-9`), rule-source ("T2 tuần 4"), roadmap (`MD_GRAMMAR_OVERRIDES`).
- **Ngoài Code Map:** `src/data/questions/owl.test.ts` (test "OWL_TOPICS theo đúng thứ tự bảng 'Mỗi thì một dòng'") phải bỏ dòng `past-continuous` khỏi phép so, vì bảng có 11 dòng mà `OWL_TOPICS` giữ 10 (Never: không sửa O.W.L.). Ghi trong mục deferred-work.
- **Kiểm chứng:** `npm run lint`, `npm test` (85 file, 2121 test), `npm run build` qua. `npm run layout:guard`: 9 file nguồn đổi, không thêm / xoá class. `npm run layout:check`: 12 route × 5 bề rộng ok; ảnh 375px lệch ở `/roadmap` (tên trạm s1-t2-w4 mới) và `/practice` ("0/13 thần chú"), đều do chữ đổi có chủ đích; lỗi probe phím tắt F01 có sẵn từ story 35 / 41–45, không sửa.
- ~~Chưa kiểm tay trên trình duyệt~~ → đã kiểm sau review (xem dòng dưới). Component chỉ đổi `TenseTimeline` (thêm nhánh SVG; `Cross` thêm tham số `y` mặc định `AXIS_Y`).
- **Vá sau review:** dấu × của `past-progress` đặt phía trên đường sóng (y = AXIS_Y − 18) kèm nét đứt chỉ xuống chỗ cắt ngang; luật 2 nói "thường"; giải thích lỗi 2 / lỗi 4, `-e1`, câu 09 sửa chữ; ví dụ 2 dịch "đang không làm việc"; thẻ 3 bỏ câu trả lời ngắn (lộ "were"); thẻ 4 đổi sang "when we ___ (see) our teacher" (bỏ start to + V chưa dạy); `-c5` thêm "đang", gợi ý "my mother", accept thêm 2 bản; câu quiz 10 thành câu chọn liên từ when · while · during · so; `requires` thêm `subject-pronouns` (09), `conjunctions` (10), `prepositions-of-time` (11, 15), `prepositions-of-place` (14); câu 15 accept trạng ngữ lên đầu; câu 18 gợi ý my father / my mother; dòng tổng quan "(V2 / V-ed)"; `tense-scope.ts` luôn báo was / were (+ chủ ngữ) being + V3 khi quá khứ tiếp diễn đã mở; thuật ngữ V-ing thêm was / were; `learning-rules.md` ghi ngoại lệ O.W.L.; test: AC 4 (`lesson-invite.test.ts`), lại test `lessonRuleCards('s1-t1-w4')` = [], thẻ 3 không lộ đáp án, câu 10, golden câu 15.
- **Kiểm tay (sau review, Chrome headless qua CDP, Vite dev, đã bỏ qua Sân ga):** `#/roadmap/lesson/s1-t2-w4/grammar` ở 375px và 1280px: TenseCard có dòng thời gian sóng + × (2 path, 5 line, ảnh chụp: × nằm rõ trên đường sóng, bên trái "bây giờ"), đủ 4 chip, khối "Luyện: Quá khứ tiếp diễn …" có, 1280px `scrollWidth` = 1280. 375px `scrollWidth` = 391 do 4 nút "Xem IPA" của phần ôn IPA, lỗi có sẵn ở HEAD `5e4a860` (chạy lại trên worktree HEAD), không do story này: ghi deferred-work. `#/practice/quiz/lesson-s1-t2-w4` chạy "Câu 1/5", `scrollWidth` 375. Chưa kiểm tay thẻ flashcard và gõ golden trong khối luyện (đã có test).

## Spec Change Log

- 2026-11-13 (review story 46, vá): sửa chữ Design Notes (ngoài vùng frozen) cho khớp các bản vá sau review: luật 2 "thường", ví dụ 2, giải thích lỗi 2 / 4, thẻ 3 (bỏ "— Yes, they were." vì lộ đáp án) và thẻ 4 (bỏ "start to rain": to + V chưa dạy), `-c5` (thêm "đang", gợi ý my mother, 2 accept), `-e1`, bảng câu quiz (09, 10 thành câu chọn liên từ, 11, 14, 15, 18), câu 09 mẫu, dòng tổng quan. Tasks: `CARDS` đổi 'started' → 'saw'. Trạng thái xấu tránh được: thẻ SRS hỏi mà lộ đáp án; học viên học "thấy when → was / were + V-ing"; câu dịch đúng bị chấm sai; không câu nào kiểm chọn when / while dù Problem nêu TOEIC Part 5. KEEP: id câu và thẻ, số câu 4 chọn / 4 gõ / 2 biến đổi / 2 dịch, hàng chip 4 từ, mọi điều trong vùng frozen.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Thẻ `past-continuous-rule-3` lộ đáp án qua "— Yes, they were." | medium | `t2-t4-grammar.ts` thẻ 3: câu trả lời ngắn có "were" ngay trên mặt trước, thẻ SRS chỉ còn kiểm viết hoa | patch: bỏ câu trả lời ngắn; test thẻ 3 không chứa was / were |
| 2 | blind | Không câu nào kiểm chọn when / while dù Problem nêu TOEIC Part 5 | medium | 12 câu quiz và 8 câu luyện đều hỏi dạng động từ (`t2-t4.ts` -07 … -18) | patch: câu 10 thành câu chọn liên từ [when · while · during · so] (`during` là từ tường, đã mở), thêm `conjunctions` |
| 3 | blind + content | Luật 2, chip "when", lỗi 4 nói tuyệt đối ("when đi với việc ngắn") | medium | "When I was cooking, he called" vẫn đúng; lỗi 4 "when she was arriving" đúng ngữ pháp, chỉ đổi nghĩa | patch: luật 2 "thường" + "động từ ngay sau when thường ở quá khứ đơn"; sửa giải thích lỗi 4. Giữ chip "when" (hàng chip nằm trong bảng I/O frozen) |
| 4 | blind | `TIME_TAILS` không có cụm giờ của thì mới; câu 15 không accept "At 10 p.m., she wasn't sleeping." | low | `frontedTimeTail` trả undefined với "at 10 p.m."; luật accept chỉ áp cho cụm trong `TIME_TAILS` | patch: thêm accept cho câu 15 + golden; không mở rộng `TIME_TAILS` |
| 5 | blind | accept câu dịch hẹp: `-c5` thiếu 2 bản đúng; `-c5`, `-18` không nhận mom / dad | medium | `-c5` hai việc đều dài nên while đặt ở vế nào cũng đúng; gợi ý không nêu father / mother | patch: `-c5` thêm 2 accept; gợi ý thêm "my mother" (`-c5`), "my father, … my mother" (`-18`) |
| 6 | blind | Dấu × của `past-progress` lẫn vào đường sóng | medium | Sóng cắt trục ở x 92.5, × ở x 92 cao ±5 bằng biên độ sóng, cùng màu, nét gần bằng | patch: × đặt trên sóng (y − 18) + nét đứt chỉ xuống; ảnh chụp 375px xác nhận rõ |
| 7 | blind | Thuật ngữ V-ing (`glossary.ts:121`) chỉ nói am / is / are | low | Chip V-ing trong TenseCard mới mở định nghĩa thiếu was / were | patch: thêm "sau was / were trong quá khứ tiếp diễn" |
| 8 | blind | Cổng hư từ `while` vẫn là tường, chưa ghi nợ | low | `function-words.ts:39`; Never của story cấm sửa file này; cổng có từ trước | defer |
| 9 | blind | `learning-rules.md:108` vẫn nói O.W.L. báo % mọi thì | low | Bảng 11 dòng, O.W.L. 10 chủ điểm; chỉ deferred-work ghi | patch: thêm câu ngoại lệ vào luật |
| 10 | blind | Tuần ôn T2 thành gần như tuần quá khứ tiếp diễn; mini-t2 có đề không có câu trọng âm / -ed / nghe | low | 12/18 câu s1-t2-w4 là thì mới (Intent chọn quiz bài bốc theo bài); `pickQuiz` chỉ chia theo bài từ trước, Never cấm đổi | defer |
| 11 | blind | AC 4 không có test | low | Cơ chế chung của story 41 có test nhưng không với câu thật `-12` | patch: test `lesson-invite.test.ts` ghi `-12`, `-07` vào Sổ lỗi → mời s1-t2-w4 |
| 12 | blind + content | `requires` không đều (09 thiếu subject-pronouns, 11 / 15 thiếu prepositions-of-time, 14 thiếu prepositions-of-place, 14 / 18 thiếu conjunctions) | medium | Học viên chưa xong F18 / F15 vẫn gặp câu có "at + giờ" / "in the car". Riêng conjunctions: F16 chỉ dạy and / but / or / because / so, không dạy when / while → phần này false | patch: thêm subject-pronouns (09), prepositions-of-time (11, 15), prepositions-of-place (14); không thêm conjunctions cho 14 / 18; "at that time" không phải "at + giờ" nên không thêm |
| 13 | edge | "The room was being cleaned." không còn bị báo ở past-continuous và T3–T4 | medium | Đã chạy: `PAST_PROGRESSIVE_RE` tắt khi `pastProgressive`, `PAST_PASSIVE_RE` chỉ xét từ ngay sau was / were; trái luật "bị động quá khứ luôn bị báo" | patch: `PAST_PASSIVE_PROGRESSIVE_RE` luôn báo khi đã mở quá khứ tiếp diễn; thêm 2 câu vào `ALWAYS` |
| 14 | edge | Lời khẳng định "bị động quá khứ vẫn luôn bị báo" sai | medium | Cùng gốc #13 | patch (cùng #13) |
| 15 | edge | Mất assertion `lessonRuleCards` cho bài không có thì, comment cũ | low | Assertion s1-t2-w4 = [] bị thay; s1-t1-w4 (`tenses: []`) không còn test | patch: thêm assertion s1-t1-w4 = [] và sửa comment |
| 16 | vgap | Nhánh `past-progress` và TenseCard 375px chưa được kiểm, kiểm tay chưa chạy | medium | Không có test render; `layout:check` không mở s1-t2-w4 | patch: chạy kiểm tay Chrome headless 375 / 1280, ghi Implementation Notes; phát hiện cuộn ngang có sẵn ở HEAD → deferred-work. Không thêm route vào `layout:check` (đổi baseline) |
| 17 | content | `-c5` chấm sai "While my mother cooked, I was cleaning my room." | medium | Đề tiếng Việt vế mẹ không có "đang" | patch: đề thành "Trong lúc mẹ tôi đang nấu ăn, …" |
| 18 | content | Giải thích `-e1` "at that time là quá khứ" nói quá | low | "at that time" cũng chỉ được tương lai | patch: "Câu này nói về một lúc đã qua (at that time = lúc đó)"; test sửa theo |
| 19 | content | Giải thích lỗi 2 trái luật 3 | low | "không cần thêm gì" vs "chỉ thêm “đang”" | patch |
| 20 | content | Giải thích câu 09 ngụ ý were chỉ cho số nhiều | low | "Were + chủ ngữ số nhiều" bỏ sót you | patch |
| 21 | content | Thẻ 4 dùng "start to rain" (to + V chưa dạy) | low | to + nguyên mẫu xuất hiện đầu tiên ở bài will (T3); thẻ ở lâu trong SRS | patch: "We were walking in the park when we ___ (see) our teacher." → saw |
| 22 | content | Dòng tổng quan ghi "(V2)" khác công thức "(V2 / V-ed)" | low | `t2-t4-pronunciation.ts:281` | patch |
| 23 | content | Ví dụ 2 dịch bỏ "đang" | low | "Lúc đó họ không làm việc" đọc như quá khứ đơn | patch: "Lúc đó họ đang không làm việc." |

## Design Notes

Chữ mẫu: được viết gọn lại nhưng phải giữ đủ ý trong Matrix và Tasks. Dùng dấu nháy thẳng `'` như file hiện có.

Nếu test trùng câu, gần trùng thẻ (story 38), phạm vi chữ hay O.W.L. báo đỏ thì đổi chữ của câu (giữ id, ý, đáp án dạng và golden), không nới luật.

**`PAST_CONTINUOUS`** (`id: 'past-continuous'`, `spellId: 'impedimenta'`):
- `name`: "Quá khứ tiếp diễn (was / were + V-ing)".
- `use`: "Nói việc đang diễn ra ở một lúc trong quá khứ (at 8 p.m. yesterday, at that time), việc đang diễn ra thì có việc ngắn chen vào (when …), hoặc hai việc cùng diễn ra (while …)."
- `timeline`: `{ kind: 'past-progress', label: 'Đang diễn ra ở một lúc trong quá khứ, có việc ngắn chen vào' }`.
- `signalWords`: `['at that time', 'at 8 p.m. yesterday', 'when', 'while']`.
- `formulas`:
  - Khẳng định: "I / he / she / it was · you / we / they were + V-ing: I was cooking at 8 p.m. yesterday."
  - Phủ định: "S + wasn't / weren't + V-ing: We weren't sleeping at that time."
  - Câu hỏi: "Was / Were + S + V-ing …?  → Yes, I was. / No, they weren't.  What were you doing?"
  - when · while: "Việc dài (was / were + V-ing) + when + việc ngắn (V2 / V-ed): She was reading when I called. · While + việc dài, việc khác: While he was driving, I was sleeping."
- `rules`:
  1. "was / were + V-ing: I / he / she / it was working; you / we / they were working. Đuôi -ing viết như hiện tại tiếp diễn (write → writing, run → running). Phủ định và câu hỏi dùng chính was / were, không mượn did: She wasn't working. Were you working?"
  2. "Hai việc trong quá khứ: việc dài, đang diễn ra dùng was / were + V-ing; việc ngắn chen vào giữa dùng quá khứ đơn (V2 / V-ed). when thường đi với việc ngắn, nên động từ ngay sau when thường ở quá khứ đơn (I was cooking when my friend called); while thường đi với việc dài (While I was cooking, my son was watching TV)."
  3. "Tiếng Việt chỉ thêm “đang”, “lúc đó”; tiếng Anh phải đủ was / were + V-ing (không nói I cooking, I was cook). Việc đã xong, kể lần lượt thì vẫn dùng quá khứ đơn: I cooked dinner and watched TV."
- `examples`:
  - "I was cooking dinner at 7 p.m. yesterday." / "Lúc 7 giờ tối qua tôi đang nấu bữa tối."
  - "They weren't working at that time." / "Lúc đó họ đang không làm việc."
  - "Were you sleeping when I called? — Yes, I was." / "Lúc tôi gọi bạn đang ngủ à? — Ừ."
  - "What were you doing at 9 p.m. last night?" / "Lúc 9 giờ tối qua bạn đang làm gì?"
  - "My mother was watching TV when I got home." / "Lúc tôi về đến nhà, mẹ tôi đang xem TV."
  - "While I was reading, my brother was playing games." / "Trong lúc tôi đọc sách, em trai tôi đang chơi điện tử."
- `mistakes` (wrong → right · why):
  - "I was cook dinner." → "I was cooking dinner." · "Sau was / were là V-ing, không dùng động từ nguyên mẫu."
  - "I cooking when you called." → "I was cooking when you called." · "Tiếng Việt chỉ cần “đang”; tiếng Anh phải có was / were trước V-ing."
  - "Did you sleeping at 10 p.m.?" → "Were you sleeping at 10 p.m.?" · "Câu hỏi đưa was / were lên trước chủ ngữ, không mượn did."
  - "I was watching TV when she was arriving." → "I was watching TV when she arrived." · "Muốn nói cô ấy đến (việc ngắn) chen vào lúc tôi đang xem TV thì dùng quá khứ đơn arrived; was / were + V-ing dành cho việc dài, đang diễn ra."
  - "They was playing football." → "They were playing football." · "you / we / they và danh từ số nhiều đi với were."
- `dialogues`: `[yg('what were you doing'), yg('i was sleeping when')]`.
- `ruleCards` (cloze → answer · vi):
  - `-rule-1`: "At 6 p.m. yesterday, my parents ___ (drive) home." → "were driving" · "Việc đang diễn ra ở một lúc trong quá khứ: was / were + V-ing (my parents = they → were; drive bỏ e → driving)."
  - `-rule-2`: "Lan ___ (not / listen) to the teacher. She was looking at her phone." → "wasn't listening" · "Phủ định: wasn't / weren't + V-ing, không mượn didn't."
  - `-rule-3`: "___ your children sleeping when you got home?" → "Were" · "Hỏi: Was / Were + S + V-ing …? Không mượn Did (không nói Did they sleeping…?)."
  - `-rule-4`: "We were walking in the park when we ___ (see) our teacher." → "saw" · "Việc dài: was / were + V-ing; việc ngắn chen vào (sau when): quá khứ đơn (see – saw)."
- `practice`:
  - worked: "We were having dinner when my father came home." / "Lúc bố tôi về nhà, chúng tôi đang ăn tối."; noteVi "Ăn tối là việc dài, đang diễn ra → were having (we đi với were). Bố về nhà là việc ngắn chen vào → quá khứ đơn came."; timeline `{ kind: 'past-progress', label: 'Đang ăn tối thì bố về' }`.
  - faded: "At 9 p.m. last night, the children ___ (watch) a movie." → `were watching`; vi "Lúc 9 giờ tối qua bọn trẻ đang xem phim."; hintVi "the children là số nhiều → were; thêm -ing vào watch."
  - items:
    - `-c1` type "My sister ___ (study) at 11 p.m. last night." → `was studying`;
    - `-c2` choice "Tom was walking to school when he ___ his teacher." [met · was meeting · meet] → met;
    - `-c3` type "They ___ (not / play) football at that time." → `weren't playing`;
    - `-c4` type "Đổi sang câu hỏi: He was working at that time." → "Was he working at that time?";
    - `-c5` type "Dịch sang tiếng Anh: Trong lúc mẹ tôi đang nấu ăn, tôi đang dọn phòng. (my mother, while, cook, clean my room)" → "While my mother was cooking, I was cleaning my room." · accept "I was cleaning my room while my mother was cooking.", "My mother was cooking while I was cleaning my room.", "While I was cleaning my room, my mother was cooking.";
    - `-c6` type "Was Lan swimming when you saw her? — No, she ___." → `wasn't`.
  - easier:
    - `-e1` choice "We ___ lunch at that time." [were having · was having · are having] → were having;
    - `-e2` choice "He ___ TV when I called." [was watching · were watching · watching] → was watching.
  - Mỗi câu có hintVi và explanationVi ngắn theo quy tắc. Bắt buộc có ý:
    - `-c2` sai "was meeting": "gặp là việc ngắn chen vào → quá khứ đơn met";
    - `-c3` sai "didn't play": "đang (lúc đó) → weren't + V-ing, không mượn didn't";
    - `-c4` sai "Did he working…": "đưa was lên trước he, không mượn did";
    - `-e1` sai "are having": "Câu này nói về một lúc đã qua (at that time = lúc đó)".
  - apply:
    - promptVi "Nói hoặc viết 3 câu: lúc 8 giờ tối qua bạn đang làm gì, người nhà bạn đang làm gì, và một việc chen vào (… when …).";
    - sampleEn "At 8 p.m. yesterday I was reading a book. My parents were watching TV. I was reading when my friend called.";
    - speak:
      - `-say-1` "I was working at 8 p.m. yesterday." / "Lúc 8 giờ tối qua tôi đang làm việc.";
      - `-say-2` "My son was doing his homework when I got home." / "Lúc tôi về đến nhà, con trai tôi đang làm bài tập.".

**Golden chấm (bảng I/O):**
- `-c2`: chọn "met" đúng; "was meeting" sai.
- `-c3`: "weren't playing", "were not playing", "werent playing" đúng; "didn't play" sai.
- `-c4`: "was he working at that time" đúng; "Did he working at that time?" sai.
- `-c5`: cả hai thứ tự mệnh đề đúng (viết thường, bỏ dấu câu); "While my mother cooked, I cleaned my room." sai.

**Câu quiz mới** (`q-s1-t2-w4-NN`; câu chọn có đáp án đứng đầu; `requires` có thể thêm bớt nhưng phải hợp lệ và đúng với điều câu cần):

| NN | Dạng | Đề | Đáp án / lựa chọn | accept | requires |
|---|---|---|---|---|---|
| 07 | choice | When you called, I ___ a shower, so I didn't answer. | was taking · took · am taking · were taking | | subject-pronouns, articles, conjunctions, verb-forms, tenses-overview |
| 08 | choice | They ___ football when I saw them. | were playing · was playing · are playing · were play | | subject-pronouns, object-pronouns, verb-forms |
| 09 | choice | ___ your parents working when you left home? | Were · Did · Was · Are | | be-questions, subject-pronouns, possessive-adjectives, plurals, verb-forms |
| 10 | choice | She was writing an email ___ her friend came into the room. | when · while · during · so | | subject-pronouns, possessive-adjectives, articles, conjunctions, verb-forms |
| 11 | type | My grandmother ___ (sit) in the garden at 7 a.m. yesterday. | was sitting | | possessive-adjectives, articles, prepositions-of-place, prepositions-of-time, clock-time, verb-forms |
| 12 | type | We ___ (not / watch) TV at that time. | weren't watching | | subject-pronouns, be-negative, verb-forms |
| 13 | type | Lan ___ (run) to the bus stop when she fell. | was running | | subject-pronouns, articles, verb-forms |
| 14 | type | While I ___ (drive), my son was sleeping in the car. | was driving | | subject-pronouns, possessive-adjectives, articles, prepositions-of-place, verb-forms |
| 15 | transform | Đổi sang phủ định: She was sleeping at 10 p.m. | She wasn't sleeping at 10 p.m. | At 10 p.m., she wasn't sleeping. | be-negative, subject-pronouns, prepositions-of-time, clock-time, verb-forms |
| 16 | transform | Đổi sang câu hỏi: They were waiting for the bus. | Were they waiting for the bus? | | be-questions, subject-pronouns, articles, verb-forms |
| 17 | transform | Dịch sang tiếng Anh: Lúc đó các bạn của bạn đang làm gì? (what, your friends, do, at that time) | What were your friends doing at that time? | | wh-questions, be-questions, possessive-adjectives, plurals, verb-forms |
| 18 | transform | Dịch sang tiếng Anh: Bố tôi đang đọc báo thì mẹ tôi về nhà. (my father, read the newspaper, when, my mother, come home) | My father was reading the newspaper when my mother came home. | When my mother came home, my father was reading the newspaper. | possessive-adjectives, articles, verb-forms, tenses-overview |

Giải thích ngắn, mỗi câu nêu đúng luật của câu đó. Ví dụ:
- câu 07: "Lúc bạn gọi, việc tắm đang diễn ra (việc dài) → was taking; took nghĩa là gọi xong mới đi tắm, không khớp “nên tôi không nghe máy”."
- câu 09: "Hỏi việc đang diễn ra trong quá khứ: Were + you / we / they / chủ ngữ số nhiều + V-ing. Không mượn Did với V-ing."
- câu 12: "Lúc đó (quá khứ) không xem → weren't + V-ing; không nói didn't watching."

**Thần chú Impedimenta** (thêm sau `reparo`):
- `name` "Impedimenta";
- `description` "Chặn ngang một việc đang diễn ra: was / were + V-ing cho việc dài, quá khứ đơn cho việc ngắn chen vào (when), while cho hai việc cùng lúc.";
- `tenseId` `past-continuous`, `lessonId` `s1-t2-w4`;
- `grammarEn` "the past continuous (was / were + -ing, with when and while)".

**Ôn tập và ôn tổng:**
- Review T2-W4, dòng mới đặt sau dòng bất quy tắc: "Quá khứ tiếp diễn: was / were + V-ing cho việc đang diễn ra ở một lúc trong quá khứ; việc ngắn chen vào dùng quá khứ đơn (I was cooking when you called)." Dòng "Không trộn" thành: 'Không trộn: không nói "I am work", "I didn\'t went", "Did you watched", "Did you be", "I was cook".'
- `STAGE_1_OVERVIEW_TENSES`: "Quá khứ tiếp diễn: was / were + V-ing; việc dài + when + việc ngắn (V2 / V-ed), while + việc dài." → `s1-t2-w4` / `grammar`.
- `STAGE_1_TENSE_TABLE`: `{ tenseId: 'past-continuous', name: 'Quá khứ tiếp diễn', aux: 'was / were', affirmative: 'She was cooking.', negative: "She wasn't cooking.", question: 'Was she cooking?', lessonId: 's1-t2-w4' }`.

**Dòng thời gian `past-progress`:** một đường sóng ở phần quá khứ cho việc dài, cắt ngang bởi dấu × của việc ngắn, ở bên trái mốc "bây giờ". Không thêm chữ trong SVG, để không chồng lên nhãn trục ở 375px.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: đều qua.
- `npm run layout:guard` -- expected: không báo class mới hay class bị xoá. Có báo thì ghi danh sách vào Implementation Notes.
- `npm run layout:check` -- expected: mọi route `ok` ở 5 bề rộng. Ảnh 375px chỉ được lệch ở route có s1-t2-w4, nếu bộ chụp có route đó. Lỗi probe phím tắt F01 đã có sẵn từ các story 41–45: ghi lại, không sửa ở story này.

**Manual checks (if no CLI):**
- Chrome headless ở 375px và 1280px, `VITE_SUPABASE_*` rỗng, store đã bỏ qua Sân ga và xong tới s1-t2-w3. Mở `#/roadmap/lesson/s1-t2-w4/grammar`:
  - TenseCard có dòng thời gian mới và 4 chip;
  - mở khối luyện, gõ golden `-c3`, `-c4`: chấm đúng;
  - phần Ôn tập và nút mini-t2 vẫn ở cuối;
  - `scrollWidth` bằng bề rộng sau khi mở mọi `details`.
- Mở `#/practice/quiz/lesson-s1-t2-w4`: chạy "Câu 1/5".
- Đánh dấu xong s1-t2-w4, mở `#/practice/flashcards` tới thẻ `rule:past-continuous-1`: nhãn "Thẻ quy tắc · T2 tuần 4", link "Xem lại bài" đúng.
