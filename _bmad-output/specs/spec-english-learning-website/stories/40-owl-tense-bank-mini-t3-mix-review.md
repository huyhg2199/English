---
title: 'mini-t3, ôn trộn trước O.W.L., ôn nhẹ tuần Tết và kho câu O.W.L. riêng báo điểm từng thì (CAP-4, CAP-19, learning-rules "Qua cửa", "Chỉ dùng kiến thức đã dạy")'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: '79d47ee41617745c2379497a885e9457c731fc65'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/14-owl-1-exam.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/37-t3-t4-tense-practice-data.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/39-tense-choice-signal-words-aux-table.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" là Huy tự làm ra câu đúng (gõ, biến đổi, dịch), thì đã học được ôn lại và trộn với thì cũ, và **kiểm tra báo theo từng thì**. Báo cáo kiểm tra mục T2: T3, T4 không có mini test, không có bài ôn trộn trước O.W.L., tuần Tết không có ngữ pháp. Mục T3: phần Thì của O.W.L. 1 bốc 20 câu ngẫu nhiên từ câu quiz bài đã làm (`owlTensePool`, `src/lib/owl/owl.ts:131-138`), không chia theo thì, chỉ báo một % chung.
- Quyết định 4: dùng lại tối đa bộ máy đã có: `QuizDef` / `pickQuiz` / `planQuiz` (lọc thiếu nền), `QuestionCard` + câu gõ `type` / `transform` (story 35), Sổ lỗi, `reviewPlan` / `OwlPlanCard` (story 14). Không dựng hệ thi mới.
- Ràng buộc chung giữ nguyên:
  - không khoá, không phạt, không reset; kế hoạch ôn chỉ là lời mời;
  - nội dung tiếng Việt, câu tự soạn (không chép British Council, sách, web có bản quyền);
  - chỉ dùng kiến thức đã dạy;
  - giao diện 375px không đổi ngoài phần mới;
  - không đổi schema store, không thêm key đồng bộ (dữ liệu mới nằm trong field `owl` có sẵn của lần làm).
- Claude chọn:
  - **mini-t3** gắn s1-t3-w4: 10 câu = 8 câu của 4 tuần T3 (mỗi tuần ≥ 2, mọi đoạn như mini-t1 / mini-t2) + **2 câu ôn** lấy từ câu đoạn Ngữ pháp nhãn `thì` của 8 bài T1–T2 (20%). Link nằm ở phần "Tóm tắt các thì đã học" mới cuối đoạn Ngữ pháp s1-t3-w4 (như s1-t1-w4, s1-t2-w4) và ở trang Luyện tập.
  - **"Ôn trộn mọi thì"** (`mix-s1`): 20 câu đoạn Ngữ pháp nhãn `thì` của 14 bài chặng 1 có câu loại này, mỗi bài ≥ 1 câu. Link ở đoạn kiểm tra s1-t4-w4 (ngay trước nút "Vào thi O.W.L. 1"), ở trang O.W.L. 1 (trước khi bắt đầu) và trang Luyện tập.
  - **Ôn nhẹ tuần Tết** (`mix-tet`): ở s1-t4-w2, dưới lời nhắc ngày lười có mục tuỳ chọn "Ôn nhẹ thì (tối đa 10')": 5 câu trộn từ đoạn Ngữ pháp nhãn `thì` của các bài s1-t1-w1 … s1-t4-w1 (~5') và link ôn Sổ lỗi đến hạn (~5'). Chế độ ngày lười giữ nguyên.
  - **Không thêm câu vào `QUESTION_BANK`.** Ba bài test trên lấy câu có sẵn.
  - **Kho câu O.W.L. riêng** (`OWL_QUESTIONS`, file mới, không nằm trong `QUESTION_BANK`): 42 câu tự soạn, không trùng đề với bất kỳ câu quiz, câu Sân ga, câu luyện, thẻ quy tắc nào. 10 chủ điểm thì (đúng 10 dòng của bảng "mỗi thì một dòng", story 39; bỏ so sánh vì không phải thì). Mỗi chủ điểm 3 câu riêng (1 chọn, 1 gõ dạng đúng, 1 biến đổi / dịch) và 4 cặp thì dễ nhầm, mỗi cặp 3 câu (2 chọn, 1 gõ). Chi tiết ở Design Notes.
  - **Đề O.W.L.** vẫn 20 câu: mỗi cặp dễ nhầm bốc 1 câu (đủ 4 câu chọn giữa hai thì), rồi bù câu riêng để **mỗi chủ điểm đúng 2 câu**. Câu cặp tính cho chủ điểm của đáp án. Mọi đề có ≥ 6 câu gõ.
  - **Qua cửa giữ nguyên** (phát âm và thì, mỗi phần ≥ 70%). Mới: kết quả báo % từng chủ điểm; chủ điểm < 70% (1/2 câu là chưa đạt) vào kế hoạch ôn 14 ngày **kể cả khi đã qua O.W.L.** Khi đã qua, kế hoạch chỉ xoay quanh các thì yếu và hiện trên Hôm nay với lời "bỏ qua cũng được". Qua mà mọi chủ điểm ≥ 70% thì không có kế hoạch, như cũ.
  - Quá khứ tiếp diễn chưa có chủ điểm (story 46 thêm, kèm câu O.W.L. của nó).

**Problem:** Sau T3 không có mini test nào, không có bài ôn trộn các thì trước kỳ thi, tuần Tết bỏ trống ngữ pháp. Phần Thì của O.W.L. 1 lấy lại đúng câu Huy đã làm nhiều lần, có đề thiếu hẳn bị động hay going to, chỉ báo một % chung, nên qua cửa vẫn có thể còn thì chưa chắc mà app không biết.

**Approach:**
- `QuizDef` thêm bộ lọc câu (`only`) và phần ôn bài cũ (`mix`); `pickQuiz` / `planQuiz` hiểu hai field này, test cũ ra đúng đề cũ. Thêm 3 bài test `mini-t3`, `mix-s1`, `mix-tet` và các link.
- Thêm kho câu O.W.L. và bảng chủ điểm (dữ liệu thuần), đổi cách bốc đề, thêm điểm từng chủ điểm vào chi tiết lần thi, mở rộng `reviewPlan` / `activeReviewPlan`, vẽ điểm từng thì ở màn kết quả và thẻ kế hoạch.

## Boundaries & Constraints

**Always:**
- Bài test không có `only` / `mix` (mini-t1, mini-t2, mọi `lesson-*`, `quiz-f-*`, test quay lại) cho **đúng đề cũ** với cùng seed, `canSpeak`, `seen` và bộ lọc thiếu nền.
- `mix`: câu ôn bốc bằng luồng ngẫu nhiên riêng (`${seed}|mix`), câu chưa gặp trước, không có câu nghe khi không có TTS, không trùng câu phần chính. Số câu phần chính = `size − mix.size`. Lọc thiếu nền (`planQuiz`) áp cho cả hai phần.
- Kho câu O.W.L.:
  - 42 câu, id `q-owl-01` … `q-owl-42`, đúng phân bổ Design Notes; mỗi câu có `topicId` (một trong 10 chủ điểm), câu cặp có thêm `contrastId`; `lessonId` thuộc `lessonIds` của chủ điểm (câu cặp: bài của cặp), `sectionId` `grammar`, nhãn `thì`;
  - `getQuestion` tra được (Sổ lỗi, kế hoạch, "Vì sao sai?"); id không trùng câu nào khác;
  - không trùng: `promptEnglish(prompt)` (chuẩn hoá `normalizeTyped`) khác mọi câu `QUESTION_BANK`, `FOUNDATION_QUESTIONS`, mọi đề câu luyện (`practiceEnglishTexts`) của Tense và khối "Chọn thì", mọi `cloze` thẻ quy tắc; đáp án câu gõ khác mọi `examples[].en`;
  - luật câu giống câu quiz mới của story 37: `requires` không rỗng, `requiresViolations` rỗng, có ≥ 1 khái niệm viên gạch; câu chọn 4 lựa chọn khác nhau, đúng một lựa chọn đúng trong ngữ cảnh; câu gõ theo mẫu đề, luật `answer` / `accept` (`'s`, trạng ngữ lên đầu, không dấu Việt) và V2 / V3 chỉ trong 50 động từ của story 37; `explanation` tiếng Việt nói vì sao (câu cặp nói vì sao không phải thì kia);
  - mọi chữ tiếng Anh (đề, lựa chọn với `{ wrongOption: true }`, đáp án, `accept`) có `outOfScopeWords('passive-present', …)` rỗng (phạm vi cả chặng 1: không quá khứ tiếp diễn, have to, could…).
- Đề O.W.L.: cùng seed ra cùng đề; 20 câu khác nhau; mỗi chủ điểm đúng 2 câu; đúng 4 câu cặp, mỗi cặp 1; ≥ 6 câu gõ; không câu nào thuộc `QUESTION_BANK`.
- Điểm từng chủ điểm: tính trên câu có `topicId` của lần thi; ngưỡng dùng `partPassed` (so nguyên, 70%). Lần thi cũ không có điểm từng chủ điểm vẫn đọc, hiện như cũ.
- Kế hoạch ôn: phần thì đã đạt nhưng có chủ điểm yếu thì chỉ ôn đoạn Ngữ pháp của chủ điểm yếu (xoay vòng đủ 14 ngày) và mục Sổ lỗi `thì` thuộc bài của chủ điểm đó. Phần thì chưa đạt thì đoạn của chủ điểm yếu lên trước, sau đó giữ đúng logic cũ. Kế hoạch có phần phát âm thì giữ nguyên logic phần phát âm.
- Ghi Sổ lỗi như cũ: câu sai ở mini-t3, mix-s1, mix-tet và O.W.L. vào Sổ lỗi.
- 375px: không tràn ngang ở các trang đổi; component cũ chỉ thêm phần mới, không xoá hay đổi class sẵn có.

**Never:**
- Không làm việc của story khác:
  - kiểm tra 5 câu cuối Bài chính, Sổ lỗi trong buổi 30', lời mời ôn theo bài thì (41);
  - Bản đồ thì, nhãn điểm trên lộ trình (42);
  - lượng từ, liên từ, modal mở rộng (43–45);
  - quá khứ tiếp diễn và câu O.W.L. của nó (46);
  - `requires` cho câu cũ, sửa câu cũ dùng "Don't + V", chia Ngữ pháp theo ngày (47).
- Không thêm, sửa hay xoá câu trong `QUESTION_BANK` / `FOUNDATION_QUESTIONS`. Không đổi `practice`, `ruleCards`, `choices`, `signalWords` của Tense.
- Không đổi số câu (30 từ / 20 câu), ngưỡng 70% từng phần, điều kiện "qua", huy chương, nút "Sang chặng 2".
- Không chặn thi O.W.L. hay việc xong bài sau mini test; không bắt làm ôn trộn trước khi thi.
- Không đổi `stage-1.ts`, `lo-trinh-toeic-12-thang.md`, chế độ ngày lười, `plan.ts`.
- Không thêm key store, không đổi `SYNCED_KEYS` / `MERGERS` / backup.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| mini-t3 từ bài | `/roadmap/lesson/s1-t3-w4/grammar`, cuộn hết | Sau khối "Đừng dịch từng chữ" có "Tóm tắt các thì đã học" (4 dòng T3), ghi chú "Mini test 10 câu…", nút "Làm mini test" → `/practice/quiz/mini-t3` | N/A |
| Đề mini-t3 | `pickQuiz(QUESTION_BANK, mini-t3, seed, { canSpeak })`, nhiều seed, có / không TTS | 10 câu khác nhau: 8 câu bài s1-t3-w1…w4 (mỗi bài ≥ 2) + 2 câu `grammar` nhãn `thì` của bài T1–T2. Không TTS: không câu nghe, vẫn 10 câu | N/A |
| mini-t3 thiếu nền | Sân ga chưa học viên nào | `planQuiz` bỏ câu cần viên chưa dạy ở cả hai phần, `skipped` đếm cả hai; còn ≥ 4 câu thì chạy, < 4 thì "chưa đủ nền" như cũ | Không chặn bài |
| Đề cũ không đổi | mini-t1, mini-t2, `lesson-s1-t2-w2`, `lesson-s1-t4-w3`, seed `a` / `b`, có / không TTS, có `seen` | Đúng danh sách id như baseline `79d47ee` | N/A |
| Ôn trộn mọi thì | Đoạn kiểm tra s1-t4-w4, bấm "Ôn trộn mọi thì (20 câu)" | 20 câu đoạn Ngữ pháp nhãn `thì`, mỗi bài trong 14 bài ≥ 1 câu, có câu gõ; xong về bài s1-t4-w4 | N/A |
| Trang O.W.L. | `/practice/owl` trước khi thi | Thẻ "Ba phần thi" có dòng mời "Khởi động: Ôn trộn mọi thì (20 câu)" (link), mô tả phần 3 mới: "20 câu thì của chặng 1 (chọn hoặc gõ), mỗi thì 2 câu, có 4 câu chọn giữa hai thì dễ nhầm, kết quả báo từng thì" | N/A |
| Tuần Tết | `/roadmap/lesson/s1-t4-w2` | Lời nhắc ngày lười như cũ, dưới đó mục "Ôn nhẹ thì (tối đa 10')": nút "5 câu ôn trộn" → `mix-tet`, nút "Ôn Sổ lỗi đến hạn" → `/practice/mistakes`, dòng "Không làm cũng không sao" | N/A |
| Đề mix-tet | `pickQuiz` mix-tet | 5 câu `grammar` nhãn `thì` từ s1-t1-w1 … s1-t4-w1, không câu nào của s1-t4-w3 | N/A |
| Luyện tập | `/practice` | Thêm thẻ "Mini test tháng T3" sau T2 và "Ôn trộn mọi thì" trước O.W.L. 1, có tóm tắt lần làm như mini test cũ. Thẻ cũ giữ chữ | N/A |
| Đề O.W.L. | `pickOwlTenses(OWL_QUESTIONS, seed)` với 200 seed | Mỗi đề 20 câu, mỗi chủ điểm 2, đúng 4 câu cặp (1 mỗi cặp), ≥ 6 câu gõ; cùng seed cùng đề | N/A |
| Câu gõ O.W.L. | Câu golden `q-owl-05` (Design Notes), gõ "does not watch" / "don't watch" | Câu đầu đúng (`accept`), câu sau sai, vào Sổ lỗi "bạn gõ" kèm link `s1-t1-w3` Ngữ pháp | Gõ có dấu Việt: nhắc tắt bộ gõ (story 35) |
| Qua nhưng có thì yếu | Phát âm 27/30, thì 17/20, sai 1 câu ở mỗi chủ điểm `will`, `modals`, `passive-present` | Màn kết quả "Qua O.W.L. 1" + huy chương như cũ; "Điểm từng thì" có 10 dòng, 3 dòng 1/2 · 50% "dưới 70%" kèm link "Ôn"; mục "Kế hoạch ôn 2 tuần" ghi "Bạn đã qua…bỏ qua cũng được". Lần làm lưu `owl.topics` và `owl.plan.weakTopics = ['will','modals','passive-present']`, `plan.parts = ['tenses']`; 14 ngày chỉ là đoạn Ngữ pháp s1-t3-w1 / s1-t4-w1 / s1-t4-w3 | N/A |
| Hôm nay sau khi qua | Store như dòng trên, hôm sau | `OwlPlanCard` hiện, mô tả: đã qua O.W.L. 1, thì cần chắc thêm: Tương lai will, can / should / must, Bị động hiện tại; bỏ qua cũng được | N/A |
| Trượt phần thì | Thì 11/20 | Như cũ (kế hoạch, Hôm nay) và đoạn của các chủ điểm yếu (thấp nhất trước) đứng đầu chuỗi ngày thì | N/A |
| Qua sạch | Mọi chủ điểm 2/2 hoặc ≥ 70%, phát âm đạt | Không có kế hoạch, Hôm nay không có thẻ, như cũ | N/A |
| Lần thi cũ | Store có lần thi story 14 (câu `QUESTION_BANK`, không `owl.topics`), trượt, còn trong 14 ngày | Lịch sử, kế hoạch, thẻ Hôm nay hiện như cũ; không có "Điểm từng thì" | N/A |
| Dữ liệu hỏng | `owl.topics` không phải object, có id lạ hoặc điểm sai dạng; `plan.weakTopics` không phải mảng chuỗi | Bỏ riêng phần hỏng (id lạ bị bỏ), phần còn lại đọc được; `weakTopics` sai dạng thì plan vẫn hợp lệ, coi như không có | Không ném lỗi |

</frozen-after-approval>

## Code Map

- `src/data/questions/index.ts`:
  - `QuizDef` (:26), `LESSON_QUIZ_SIZE`, `MIN_QUIZ_QUESTIONS`, `QUIZZES` (:49, mini-t1 / mini-t2 rồi `lessonQuizzes()`), `getQuiz`, `quizHref`;
  - `byId` (:16) gộp `QUESTION_BANK` + `FOUNDATION_QUESTIONS` → thêm `OWL_QUESTIONS`.
- `src/data/questions/types.ts` -- `Question`, `TypedQuestion`, `isTypedQuestion`, `MistakeTag`. Không đổi.
- `src/data/questions/t2-t4.ts:22-120` -- `make`, `makeTyped`, `lesson()`: mẫu dựng câu cho file kho O.W.L. (chép kiểu, không import hàm nội bộ).
- `src/data/questions/foundation.ts:10` -- tiền lệ kho câu ngoài `QUESTION_BANK` (không vào `QUIZZES`, vẫn tra được).
- `src/lib/quiz/quiz.ts:110-152` -- `pickQuiz` (luồng `${seed}|pick`, `unseenFirst`, thay câu nghe), `seenQuestionIds`, `recordAttempt` (đẩy câu sai vào Sổ lỗi qua `lookup`).
- `src/lib/quiz/requires.ts:44-111` -- `filterBank` (`inQuiz` theo `lessonIds`), `planQuiz`, `quizButtonCount`.
- `src/lib/owl/owl.ts`:
  - `owlTensePool` / `pickOwlTenses` (:131-138) → thay bằng bốc theo chủ điểm;
  - `gradeOwl`, `partPassed`, `partPercent`, `weakParts`;
  - `OwlDetails`, `readOwlDetails`, `ReviewPlan`, `isReviewPlan`;
  - `reviewPlan` (:398, `groupSections`, `defaultSections`, `interleave`), `recordOwlAttempt` (:501, chỉ lập kế hoạch khi trượt), `activeReviewPlan` (:595, chỉ khi `passed === false`).
- `src/lib/owl/owl.test.ts:92-111` -- helper `tenseIds`, `tenseAnswers`, `input` dùng `owlTensePool(QUESTION_BANK)`; các ca kế hoạch (:300-470) tìm câu theo `lessonId`.
- `src/pages/Owl.tsx` -- `OwlRun` (đề chốt lúc bắt đầu, :111-120), `TensesPart` (dùng `QuestionCard`, đã hỗ trợ câu gõ), màn kết quả (:196-210), thẻ "Ba phần thi" (:290-320), `counts`.
- `src/components/owl/OwlResult.tsx` -- lưới 2 phần, mục kế hoạch (`plan &&`), câu thì sai.
- `src/components/owl/ReviewPlan.tsx` -- `ReviewPlanList`, `OwlPlanCard` (mô tả theo `plan.parts`).
- `src/app/store-context.ts:527` -- `activePlan = activeReviewPlan(store, now)`. Không sửa.
- `src/data/lessons/t2-t4-grammar.ts:1819` -- `GRAMMAR_T3_W4 = { tenses: [PERFECT_VS_PAST], choices: [DONT_TRANSLATE] }`; `GRAMMAR_T2_W4.review` (:1805) là mẫu `review`.
- `src/components/lesson/LessonContentParts.tsx` -- `LazyWeekNotice` (:22), `Review` (:190, nút "Làm mini test"), `GrammarSection`.
- `src/components/lesson/LessonSectionContent.tsx:46-53` -- nút "Vào thi O.W.L. 1" của đoạn kiểm tra.
- `src/pages/Practice.tsx` -- `MiniTestSummary` (:83, chữ "10 câu ôn cả 4 tuần" cứng), `OwlSummary`, `PracticeLink` mini-t1 / mini-t2 / O.W.L.
- `src/lib/tense-scope.ts` -- `outOfScopeWords`, `promptEnglish`, `TIME_TAILS`, `frontedTimeTail`, `sContraction` (chỉ test dùng).
- `src/lib/tense-practice.ts:162` -- `practiceEnglishTexts`; `src/data/lessons/index.ts` -- `allTenses`, `allTenseChoices`, `lessonRuleCards`.
- Test chạm: `src/data/questions/questions.test.ts` (:148 QUIZZES, :194, :601, :930 khoá `owlTensePool` 57 câu), `src/lib/quiz/quiz.test.ts`, `src/lib/quiz/requires.test.ts`, `src/data/lessons/lessons.test.ts:236-250`.
- Vitest env `node`, chỉ `src/**/*.test.ts`; component kiểm qua hàm thuần.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/quiz/quiz.test.ts` -- **làm trước khi sửa code:** chạy `pickQuiz` ở baseline cho mini-t1, mini-t2, `lesson-s1-t2-w2`, `lesson-s1-t4-w3` × seed `a`, `b` × `canSpeak` true / false (thêm một ca có `seen`), chép id vào hằng `BASELINE_PICKS` và viết test "đề cũ không đổi".
- [x] `src/data/questions/index.ts`:
  - kiểu `QuestionFilter = { sectionId: SectionId; tags: readonly MistakeTag[] }`;
  - `QuizDef.only?: QuestionFilter` (chỉ lấy câu khớp) và `QuizDef.mix?: { lessonIds: readonly string[]; size: number; only: QuestionFilter }` (phần ôn nằm trong `size`), có doc;
  - thêm `mini-t3`, `mix-s1`, `mix-tet` vào `QUIZZES` theo bảng Design Notes (sau mini-t2, trước `lessonQuizzes()`);
  - `byId` gộp `OWL_QUESTIONS`; re-export `OWL_QUESTIONS`, `OWL_TOPICS`, `OWL_CONTRASTS`, kiểu của chúng.
- [x] `src/data/questions/owl.ts` (mới) -- `OWL_TOPICS`, `OWL_CONTRASTS`, kiểu `OwlTopicId`, `OwlContrastId`, `OwlQuestion = Question & { topicId: OwlTopicId; contrastId?: OwlContrastId }`, `OWL_QUESTIONS` (42 câu, đúng Design Notes, câu golden giữ đúng chữ). Doc đầu file: kho riêng, không vào `QUESTION_BANK` / `QUIZZES`, câu tự soạn.
- [x] `src/lib/quiz/quiz.ts`:
  - `matchesFilter(q, filter?)`, `quizPool(bank, quiz)` (câu phần chính), `mixPool(bank, quiz)`, `inQuizPool(q, quiz)` (thuộc một trong hai), export;
  - `pickQuiz`: phần chính dùng `quizPool` và `size − (mix?.size ?? 0)`, không đổi thứ tự gọi `random`; có `mix` thì bốc từ `mixPool` bằng `seededRandom(`${seed}|mix`)` (bỏ câu nghe khi `!canSpeak`, `unseenFirst`), nối vào trước lần `shuffle` cuối; sửa doc.
- [x] `src/lib/quiz/requires.ts` -- `filterBank` dùng `inQuizPool` (lọc thiếu nền và đếm cho cả phần ôn). Không đổi hành vi test không có `mix` / `only`.
- [x] `src/lib/owl/owl.ts`:
  - bỏ `owlTensePool`; `pickOwlTenses(bank: readonly OwlQuestion[], seed)` theo thuật toán Design Notes; hằng `OWL_PER_TOPIC = 2`, `OWL_CONTRAST_COUNT = 4`; `OWL_TENSES_SIZE` giữ 20;
  - `questionTopic(q)` (đọc `topicId` nếu có), `gradeOwlTopics(answers, lookup = getQuestion): Partial<Record<OwlTopicId, OwlPartScore>>`, `weakTopics(scores)` (theo thứ tự % tăng rồi thứ tự `OWL_TOPICS`);
  - `OwlDetails.topics?`, `ReviewPlan.weakTopics?: OwlTopicId[]`; `readOwlDetails` / `isReviewPlan` kiểm dạng, bỏ id lạ, dữ liệu hỏng chỉ bỏ phần hỏng;
  - `reviewPlan`: thêm `'tenses'` vào `parts` khi có chủ điểm yếu; luật đoạn và mục Sổ lỗi theo Design Notes; lưu `weakTopics`;
  - `recordOwlAttempt`: lưu `owl.topics` (khi có câu có chủ điểm); lập kế hoạch khi `!passed || weakTopics.length > 0`;
  - `activeReviewPlan`: lần thi gần nhất có `plan` và còn trong 14 ngày (bỏ điều kiện `passed === false`); sửa doc.
- [x] `src/pages/Owl.tsx` -- đề `pickOwlTenses(OWL_QUESTIONS, seed)`; `counts.questions` = độ dài đề `'probe'`; chữ phần 3 và dòng mời "Khởi động: Ôn trộn mọi thì (20 câu)" (`quizHref('mix-s1')`, ghi "không bắt buộc"); truyền `gradeOwlTopics(finished.answers)` vào `OwlResult`; sửa doc `Owl`.
- [x] `src/components/owl/OwlResult.tsx` -- prop `topics`; mục "Điểm từng thì" (`h2`, `ul`) sau thẻ điểm: mỗi chủ điểm có câu một `li` viền (`flex items-center justify-between gap-2 rounded-lg border p-2 text-sm`): tên, `điểm/tổng · %`, nhãn "đạt" / "dưới 70%"; chủ điểm yếu có link "Ôn" → `sectionHref(topicReviewLessonId(topic.id, answers), 'grammar')` (bài của câu sai đầu tiên thuộc chủ điểm, không có thì `lessonIds[0]`). Mục kế hoạch: khi `passed` thì đoạn mô tả là "Bạn đã qua. Các thì dưới 70% ({tên}) có kế hoạch ôn nhẹ 2 tuần trên trang Hôm nay, bỏ qua cũng được."; khi trượt giữ chữ cũ. Chỉ thêm, không đổi class cũ.
- [x] `src/components/owl/ReviewPlan.tsx` -- `OwlPlanCard`: `plan.weakTopics` có thì thêm câu "Thì cần chắc thêm: {tên, nối bằng dấu phẩy}."; `active.attempt.passed` thì mô tả là "Bạn đã qua O.W.L. 1. Kế hoạch này chỉ để chắc thêm các thì dưới 70%, bỏ qua cũng được."; trượt giữ chữ cũ.
- [x] `src/data/lessons/t2-t4-grammar.ts` -- `GRAMMAR_T3_W4.review = { summary: 4 dòng (will, going to, hoàn thành, hoàn thành hay quá khứ đơn), note: 'Mini test 10 câu: 8 câu ôn 4 tuần T3 và 2 câu ôn thì T1–T2. Câu sai tự vào Sổ lỗi sai, làm lại bao nhiêu lần cũng được.', quizId: 'mini-t3' }`. Không đổi `tenses`, `choices`.
- [x] `src/components/lesson/LessonContentParts.tsx` -- `LazyWeekNotice` thêm khối "Ôn nhẹ thì (tối đa 10')" sau nút "Sang ngày lười": 1 câu mô tả, nút `outline` "5 câu ôn trộn" (`quizHref('mix-tet')`, icon `ClipboardCheck`), nút `ghost` "Ôn Sổ lỗi đến hạn" (`MISTAKES_HREF`), dòng `text-xs text-muted-foreground` "Không làm cũng không sao, chuỗi ngày vẫn giữ.". Không đổi phần cũ.
- [x] `src/components/lesson/LessonSectionContent.tsx` -- đoạn kiểm tra O.W.L.: trước nút "Vào thi" thêm nút `outline` "Ôn trộn mọi thì (20 câu)" (`quizHref('mix-s1')`); bọc hai nút trong `div` `flex flex-col gap-2 sm:flex-row` (nút cũ giữ class).
- [x] `src/pages/Practice.tsx` -- `MiniTestSummary` nhận `blurb` (chữ khi chưa làm); mini-t1 / mini-t2 truyền đúng chữ cũ. Thêm `PracticeLink` "Mini test tháng T3" (blurb "10 câu: 8 câu ôn 4 tuần T3 và 2 câu ôn thì T1–T2. Chưa làm lần nào.") sau T2, "Ôn trộn mọi thì" (blurb "20 câu Ngữ pháp trộn mọi thì của chặng 1, khởi động trước O.W.L. 1. Chưa làm lần nào.") trước O.W.L. 1.
- [x] `src/data/questions/owl.test.ts` (mới) -- kho câu:
  - 42 câu, id `q-owl-01…42` không trùng mọi id khác; đúng phân bổ (mỗi chủ điểm 1 `choice` + 1 `type` + 1 `transform` riêng; mỗi cặp 2 `choice` + 1 `type`, mỗi bên của cặp ≥ 1 câu có `topicId` bên đó); `lessonId` hợp lệ; `getQuestion` tra được;
  - không trùng (luật "Always"); luật câu story 37 (dùng lại helper của `questions.test.ts` nếu tách được, hoặc chép logic); `outOfScopeWords('passive-present', …)` rỗng; `isAnswerCorrect` đúng với `answer` và mọi `accept`;
  - câu golden đúng chữ, đáp án, `accept`, `topicId`, `contrastId`;
  - `OWL_TOPICS` đúng 10 id theo thứ tự `tenseId` của bảng `tense-table` s1-t4-w4 (story 39); `OWL_CONTRASTS` đúng bảng.
- [x] `src/lib/owl/owl.test.ts`:
  - helper `tenseIds` / `tenseAnswers` / `input` chuyển sang `OWL_QUESTIONS` (giữ ý từng ca cũ; ca tìm theo `lessonId` tìm trong kho mới);
  - `pickOwlTenses`: 200 seed, mỗi đề đúng luật "Đề O.W.L."; cùng seed cùng đề; kho thiếu câu thì trả ít hơn, không lỗi;
  - `gradeOwlTopics` / `weakTopics`: câu không chủ điểm (câu `QUESTION_BANK`, `owl-ipa-*`) không tính; 1/2 là yếu, 2/2 không;
  - `recordOwlAttempt` + `reviewPlan` + `activeReviewPlan`: mọi dòng Matrix từ "Qua nhưng có thì yếu" tới "Dữ liệu hỏng" (kể cả 14 ngày chỉ là đoạn chủ điểm yếu, mục Sổ lỗi chỉ thuộc bài chủ điểm yếu, trượt thì đoạn chủ điểm yếu đứng đầu, lần thi cũ giữ kết quả cũ).
- [x] `src/data/questions/questions.test.ts`:
  - QUIZZES: ca mini-t3 (bảng Matrix "Đề mini-t3", 6 seed × có / không TTS), mix-s1 (mỗi bài ≥ 1, chỉ `grammar` + `thì`), mix-tet (đúng tập bài); test "đủ câu" dùng `quizPool` / `mixPool`;
  - thay 2 test khoá `owlTensePool` 57 câu (:601, :930) và test "≥ 30 câu trắc nghiệm" (:194) bằng: kho O.W.L. không giao `QUESTION_BANK`, mọi đề `pickOwlTenses` chỉ có câu kho O.W.L.
- [x] `src/lib/quiz/requires.test.ts` -- `planQuiz` mini-t3 khi chưa học viên nào: câu bị bỏ ở cả hai phần, `skipped` đúng, đề chạy / not-ready như Matrix; test cũ giữ nguyên số.
- [x] `src/data/lessons/lessons.test.ts` -- ca s1-t3-w4: `review.quizId` = `mini-t3`, note khớp `/Mini test 10 câu/`, `tenses` / `choices` không đổi. Ca s1-t1-w4, s1-t2-w4 giữ nguyên.
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md`:
  - mục "Qua cửa": thêm gạch "O.W.L. 1 phần Thì (story 40): kho câu riêng 42 câu, đề 20 câu, mỗi thì 2 câu, có 4 câu chọn giữa hai thì dễ nhầm, có câu gõ. Kết quả báo % từng thì; thì dưới 70% vào kế hoạch ôn 14 ngày kể cả khi đã qua (chỉ là lời mời)."
  - mục "Nội dung bài": thêm gạch "Mini test và ôn trộn (story 40): mini-t3 (s1-t3-w4) có 2/10 câu ôn thì T1–T2; 'Ôn trộn mọi thì' 20 câu trước O.W.L. 1; tuần Tết có ôn nhẹ 5 câu thì + Sổ lỗi, tuỳ chọn."

**Acceptance Criteria:**
- Given Huy ở 375px trên `/roadmap/lesson/s1-t3-w4/grammar`, `/roadmap/lesson/s1-t4-w2`, `/roadmap/lesson/s1-t4-w4`, `/practice`, `/practice/owl` (trước thi và màn kết quả có "Điểm từng thì"), when cuộn hết trang, then không trang nào tràn ngang (`scrollWidth` = 375) và nút đủ lớn để chạm.
- Given Huy làm xong mini-t3 sai 2 câu (1 câu T3, 1 câu ôn T2), when mở Sổ lỗi, then có 2 mục với link về đúng đoạn bài nguồn; bài s1-t3-w4 không tự đánh dấu xong.
- Given Huy thi O.W.L. 1 và sai một câu gõ của kho mới, when mở Sổ lỗi và ôn mục đó, then câu hiện ô gõ, chấm bằng `matchesTyped`, "Vì sao sai?" gửi đúng đề câu gõ.
- Given bản sao lưu xuất sau một lần thi có `owl.topics` và `plan.weakTopics`, when khôi phục hoặc đồng bộ sang máy khác, then lần thi, điểm từng thì và kế hoạch giữ nguyên (không key mới).
- Given máy ≥ 1024px, when mở `/practice/owl` màn kết quả và `/roadmap/lesson/s1-t4-w4`, then mục mới nằm trong cột chính, không tràn.
- Given `npm run layout:guard`, when chạy, then chỉ báo class thêm ở `LessonContentParts.tsx`, `LessonSectionContent.tsx`, `OwlResult.tsx`, `ReviewPlan.tsx`, `Owl.tsx`, `Practice.tsx` (nếu có). `npm run layout:check`: mọi route ok ở 5 bề rộng; ảnh 375px trùng baseline trừ `/practice` (lệch đúng phần 2 thẻ mới).

## Implementation Notes

- **Đề cũ không đổi:** `BASELINE_PICKS` (32 đề: mini-t1, mini-t2, `lesson-s1-t2-w2`, `lesson-s1-t4-w3` × seed a / b × có / không TTS × có / không `seen`) chép từ baseline `79d47ee` trước khi sửa code (`src/lib/quiz/quiz.test.ts`). Ngoài test, đã so tay `planQuiz` + `quizButtonCount` của mọi quiz cũ (chưa học viên nào / đủ nền, có / không TTS) với baseline: trùng hết.
- **`QuizDef` (`src/data/questions/index.ts`):** `QuestionFilter`, `only?`, `mix?` có doc; `mini-t3`, `mix-s1`, `mix-tet` đúng bảng Design Notes, đứng sau mini-t2. `byId` gộp `OWL_QUESTIONS`; re-export `OWL_QUESTIONS`, `OWL_TOPICS`, `OWL_CONTRASTS` và kiểu.
- **Engine (`src/lib/quiz/quiz.ts`, `requires.ts`):** `matchesFilter`, `quizPool`, `mixPool` (bỏ câu đã thuộc phần chính), `inQuizPool`. `pickQuiz` phần chính dùng `quizPool` và `size − mix.size`, thứ tự gọi `random` giữ nguyên; phần ôn bốc bằng `seededRandom(`${seed}|mix`)`, bỏ câu nghe khi không TTS, `unseenFirst`, nối trước lần `shuffle` cuối. `filterBank` dùng `inQuizPool`; số câu cho nút (`quizButtonCount`) tính riêng từng phần (phần chính tối đa `size − mix.size`, phần ôn tối đa `mix.size`), quiz không có `mix` đếm như cũ.
- **Kho câu O.W.L. (`src/data/questions/owl.ts`):** 42 câu đúng phân bổ (30 câu riêng: chọn / gõ / biến đổi-dịch xen kẽ "Đổi" ở chủ điểm chẵn, "Dịch" ở chủ điểm lẻ; 12 câu cặp). 6 câu golden giữ đúng chữ. Một số câu nháp đầu bị test "không trùng" bắt (trùng thẻ quy tắc going-to "Look at that boy on the wall!", khối "will hay going to?" "The phone is ringing…") nên đã soạn lại; tránh thêm các câu gần trùng câu luyện (baby sleep, coffee every morning, paint my room, windows every Monday). `May` (tên tháng) bị bộ bắt coi là modal nên câu 39 dùng June.
- **Lệch nhỏ buộc bởi golden:** `q-owl-05` giữ `accept: ['does not watch']` như spec, dù trùng đáp án sau `normalizeTyped` (n't = not). Test "accept không trùng answer" miễn đúng câu này (`ACCEPT_SAME_AS_ANSWER`), các câu khác vẫn bị kiểm.
- **O.W.L. (`src/lib/owl/owl.ts`):** bỏ `owlTensePool`; `pickOwlTenses(OWL_QUESTIONS, seed)` theo đúng 4 bước Design Notes, `OWL_PER_TOPIC = 2`, `OWL_CONTRAST_COUNT = 4`. Thêm `questionTopic`, `gradeOwlTopics`, `weakTopics`, `owlTopicNames`. `OwlDetails.topics?`, `ReviewPlan.weakTopics?`; `readOwlDetails` bỏ id lạ / điểm sai dạng (tổng 0 cũng bỏ), `weakTopics` không phải mảng chuỗi thì coi như không có, id lạ bị lọc. `reviewPlan` thêm `'tenses'` khi có chủ điểm yếu; phần thì đã đạt: chỉ đoạn chủ điểm yếu xoay vòng đủ 14 ngày (khi xen kẽ với phát âm thì mỗi phần 7 ngày), mục Sổ lỗi `thì` chặng 1 chưa thuộc thuộc bài chủ điểm yếu; phần thì chưa đạt: đoạn chủ điểm yếu đứng đầu rồi logic cũ (bỏ trùng). `recordOwlAttempt` lưu `owl.topics` khi có câu có chủ điểm, lập kế hoạch khi `!passed || weakTopics > 0`. `activeReviewPlan`: lần thi gần nhất có `plan` và còn trong 14 ngày.
- **UI:** `Owl.tsx` (đề từ kho mới, `counts.questions` = độ dài đề `'probe'`, chữ phần 3, dòng "Khởi động: Ôn trộn mọi thì (20 câu) · không bắt buộc", truyền `gradeOwlTopics`). `OwlResult.tsx` mục "Điểm từng thì" (ẩn khi lần thi không có chủ điểm), nút "Ôn" về đoạn Ngữ pháp bài đầu của chủ điểm yếu; mô tả kế hoạch khi đã qua. `ReviewPlan.tsx` mô tả khi đã qua + "Thì cần chắc thêm: …". `LessonContentParts.tsx` khối "Ôn nhẹ thì (tối đa 10')" trong `LazyWeekNotice`. `LessonSectionContent.tsx` nút "Ôn trộn mọi thì (20 câu)" trước "Vào thi". `Practice.tsx` `MiniTestSummary` nhận `blurb` (mini-t1 / mini-t2 giữ đúng chữ cũ), thêm 2 thẻ.
- **Dữ liệu bài:** `GRAMMAR_T3_W4.review` (4 dòng tóm tắt, note đúng chữ, `quizId: 'mini-t3'`); `tenses`, `choices` không đổi.
- **Test:** `owl.test.ts` (mới, 13 test kho câu), `lib/owl/owl.test.ts` (helper chuyển sang đề cố định `pickOwlTenses(OWL_QUESTIONS, 'test-exam')`; ca cần "lần thi cũ" — xếp đoạn theo số lần sai, Sổ lỗi trống, bỏ mục đã thuộc — dùng câu chọn nhãn `thì` của `QUESTION_BANK` như story 14, đúng ý ca cũ; ca "qua → không kế hoạch" và "trượt chỉ phát âm" dùng thì 20/20 vì giờ 1 câu sai ở một chủ điểm đã là chủ điểm yếu; thêm 200 seed, kho thiếu, điểm từng chủ điểm và mọi dòng Matrix từ "Qua nhưng có thì yếu" tới "Dữ liệu hỏng", câu golden q-owl-05 vào Sổ lỗi). `questions.test.ts` (mini-t3 6 seed × TTS, mix-s1, mix-tet, "đủ câu" theo `quizPool` / `mixPool`, thay 3 test khoá `owlTensePool`). `requires.test.ts` (mini-t3 chưa học viên nào: bỏ 32 câu T3 + câu ôn thiếu nền, vẫn 8 + 2; không đủ nền → not-ready; đủ nền → đúng `pickQuiz`). `lessons.test.ts` (ca s1-t3-w4).
- **Kiểm chứng:** `npm run lint`, `npm test` (82 file, 1998 test), `npm run build` qua. `npm run layout:guard`: chỉ báo class **thêm** ở `LessonContentParts.tsx`, `LessonSectionContent.tsx`, `OwlResult.tsx`, `Owl.tsx`; không xoá class nào. `npm run layout:check`: 12 route × 5 bề rộng ok; ảnh 375px trùng trừ `/practice` (cao thêm đúng 2 thẻ mới, 1532 → 1848px); lỗi probe "chào 1" có sẵn. Chạy thêm một lần (sửa tạm `ROUTES` / `WIDE_ROUTES` rồi trả lại) cho `/roadmap/lesson/s1-t3-w4/grammar`, `/roadmap/lesson/s1-t4-w2`, `/roadmap/lesson/s1-t4-w4`, `/practice/owl`: ok ở cả 5 bề rộng.
- **Chưa kiểm tay:** màn kết quả O.W.L. có "Điểm từng thì" và thẻ Hôm nay sau khi qua (cần làm hết bài thi trong trình duyệt), làm mini-t3 / mix-s1 / mix-tet thật, sao lưu / đồng bộ (đã có test gộp `mergeQuizAttempts` giữ nguyên `owl.topics` + `weakTopics`, không key mới).

## Spec Change Log

- **2026-11-13 · review story 40 (Reviewer blind #1, edge #1, vgap #1):** câu cặp dễ nhầm gắn bài của cặp (q-owl-32/33 → s1-t2-w1, q-owl-37 → s1-t3-w2, q-owl-41/42 → s1-t3-w4), nằm ngoài `lessonIds` của chủ điểm. Khi đã qua và chủ điểm yếu chỉ vì sai một câu cặp, kế hoạch cũ có `mistakeIds` rỗng và không có bài dạy cặp (đã chứng minh bằng probe). **Đã sửa Design Notes** (mục "Phần thì đã đạt", không thuộc phần frozen): đoạn của chủ điểm yếu thêm bài của câu cặp đã sai; mục Sổ lỗi nhận thêm câu kho O.W.L. có `topicId` là chủ điểm yếu. Cách đọc này giữ đúng ý frozen ("chỉ xoay quanh các thì yếu", "mục Sổ lỗi `thì` thuộc bài của chủ điểm đó") và giữ nguyên dòng Matrix "Qua nhưng có thì yếu" (câu sai là câu riêng thì không thêm bài nào). Phần thì chưa đạt không đổi (đoạn chủ điểm yếu theo `lessonIds` đứng đầu, bài câu cặp đến sau qua logic cũ). Link "Ôn" ở màn kết quả cũng về bài của câu sai đầu tiên của chủ điểm (`topicReviewLessonId`). Trạng thái xấu tránh được: kế hoạch 14 ngày không bao giờ chứa đúng câu đã làm chủ điểm yếu. KEEP: mọi logic khác của `reviewPlan`, thứ tự `weakTopics`, xoay vòng 14 ngày.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Kế hoạch khi đã qua bỏ mất câu cặp đã làm chủ điểm yếu (lọc theo `lessonIds` của chủ điểm) | high | `reviewPlan` nhánh `weakOnly` lọc `weakLessons.has(m.lessonId)`; q-owl-32/33/37/41/42 gắn bài của cặp ngoài `lessonIds`; probe của vgap: sai q-owl-37 → `mistakeIds: []`, chỉ s1-t3-w1 | patch: `topicSections` thêm bài câu cặp đã sai, lọc Sổ lỗi thêm theo `questionTopic`; test 3 ca q-owl-37/32/42; Design Notes + Spec Change Log |
| 2 | blind | Link "Ôn" ở màn kết quả luôn về `topic.lessonIds[0]` | low | `OwlResult.tsx` dùng `sectionHref(topic.lessonIds[0])`; câu sai là câu cặp thì không về bài dạy cặp (thẻ "Câu thì sai" bên dưới vẫn có link nguồn đúng) | patch: hàm thuần `topicReviewLessonId` (bài của câu sai đầu tiên của chủ điểm) + test |
| 3 | blind | Qua mà sai 1 câu thì 14 ngày lặp một đoạn | low | Đúng như code, nhưng frozen "Always" ghi rõ "chỉ ôn đoạn Ngữ pháp của chủ điểm yếu (xoay vòng đủ 14 ngày)"; kế hoạch chỉ là lời mời; sửa #1 thêm bài cặp khi câu sai là câu cặp | reject (đúng spec frozen) |
| 4 | blind + content | Câu going to (q-owl-38, 39) và câu will (q-owl-37): will vẫn đúng ngữ pháp; giải thích nói "không dùng will" là sai sự thật | medium | "We will stay in Hue next weekend" đúng ngữ pháp; giải thích q-owl-37/38/39 khẳng định thì kia sai. Luật đã dạy (story 37/39) là kế hoạch có sẵn → going to nên đáp án vẫn theo luật | patch: sửa giải thích q-owl-37/38 ("tự nhiên hơn / không tự nhiên"), soạn lại q-owl-39 |
| 5 | content | q-owl-39 "have a baby" đụng luật have = có không thêm -ing (s1-t2-w1); accept "are having" không giải thích | medium | `t2-t4-grammar.ts:156` dạy have (có) không -ing; câu accept `are having`, `'re having` | patch: q-owl-39 thành "My sister ___ (start) a new job next Monday. She told us last week.", accept `is starting` có ghi chú trong giải thích |
| 6 | blind + content | Gợi ý câu gõ lộ đáp án: q-owl-23 `(has / not / finish)`, q-owl-26 `(should / buy)` | low | q-owl-23: gợi ý cho sẵn has trong khi giải thích dạy chọn has. q-owl-26: gợi ý nêu modal để kiểm dạng (should + V, không to / -s); bỏ should thì must / can cũng hợp, đề mơ hồ | patch q-owl-23 → `(not / finish)`; q-owl-26 giữ (reject phần này) |
| 7 | blind | Điểm từng chủ điểm chỉ hiện ở màn kết quả, không có ở lịch sử / thẻ Luyện tập | low | Đúng; spec chỉ yêu cầu kết quả báo từng thì và thẻ Hôm nay kể tên thì yếu (đã có); thêm vào lịch sử là tính năng mới | reject |
| 8 | blind | Link khởi động mix-s1 không đưa về trang thi | low | Matrix "Ôn trộn mọi thì": xong về bài s1-t4-w4, nơi có nút "Vào thi O.W.L. 1" ngay bên dưới | reject (đúng Matrix) |
| 9 | blind | Comment test nói kiểm "≥ 2 lựa chọn khác dạng" nhưng không kiểm | low | `owl.test.ts` chỉ kiểm mỗi cặp 3 câu | patch: `PAIR_FORMS` kiểm mỗi câu chọn của cặp có lựa chọn mang dạng của cả hai thì |
| 10 | blind | `OWL_TENSES_SIZE = 20` không còn suy ra từ chủ điểm, story 46 sẽ lệch | false | Test 200 seed (`owl.test.ts`) và `questions.test.ts` khoá đề đúng 20 câu: thêm chủ điểm ở story 46 làm test đỏ ngay, không lệch âm thầm | reject |
| 11 | blind | Số câu / mô tả quiz viết tay ở nhiều chỗ (20 câu, 5 câu) | low | Chữ theo đúng spec (Tasks, Matrix); số câu chỉ ít hơn khi thiếu nền, hiếm gặp | reject |
| 12 | blind | Chữ kế hoạch khi trượt "tới khi bạn qua" không còn đúng; nhánh qua có thể ra "()" | false | Chữ khi trượt giữ nguyên theo Tasks và vẫn đúng với kế hoạch của lần trượt. Nhánh qua: `plan` ở màn kết quả là kế hoạch vừa lập; qua mà có kế hoạch thì `weakTopics` luôn khác rỗng (`recordOwlAttempt`), không ra "()" | reject |
| 13 | blind | Vùng chạm nhỏ: link khởi động `min-h-8`, nút "Ôn" `size=sm` (32px) | low | Đúng; app dùng `min-h-9` cho link / nút tương tự (ReviewPlan, Roadmap, Quiz) | patch: `min-h-9` cho link, `h-9` cho nút "Ôn" (chỉ thêm class ở phần mới) |
| 14 | blind + edge | Phần chính / phần ôn thiếu câu không bù từ phần kia | low | Frozen "Always": phần chính = `size − mix.size`; Matrix "mini-t3 thiếu nền" chấp nhận đề ít hơn khi còn ≥ 4 câu | reject (đúng spec) |
| 15 | blind | mix-tet 5 câu không rải theo thì; không có thẻ Luyện tập | low | Design Notes chọn `minPerLesson: 0`; mục tuỳ chọn ngày Tết, không cần thẻ | reject |
| 16 | blind | Dạng viết tắt chấp nhận không đều (q-owl-20, 29 vs 39) | low | q-owl-29 là golden (`accept` không có); gõ "'s …" vào chỗ trống sau danh từ không tự nhiên; q-owl-39 soạn lại đã bỏ accept `'re …` | reject |
| 17 | blind | Logic UI mới không có test; AC mini-t3 không tự xong bài chưa có test | low | Vitest chỉ chạy `.ts`; phần lọc / chữ là điều kiện đơn giản trong component; link "Ôn" đã tách thành hàm thuần có test (#2) | reject phần còn lại |
| 18 | vgap | Ca "qua nhưng có thì yếu" chỉ thử câu riêng, chưa thử câu cặp | high | Như #1 (đã có probe) | patch: test "qua, chỉ sai một câu cặp dễ nhầm…" (gộp với #1) |
| 19 | vgap | Probe ghi đè file trong scratchpad dùng chung | false | Không phải lỗi code; repo không đổi (`git status`) | reject |
| 20 | content | "can / should / must", "Bị động hiện tại" bị gọi là "thì" | low | Theo quy ước bảng "Mỗi thì một dòng" story 39 và chữ frozen "Điểm từng thì" | reject |
| 21 | content | "4 câu chọn giữa hai thì dễ nhầm" trong khi câu cặp có thể là câu gõ | low | Chữ lấy đúng Matrix frozen "Trang O.W.L."; "chọn giữa hai thì" vẫn đúng nghĩa với câu gõ | reject |
| 22 | content | q-owl-20 "Look out!" chưa giải nghĩa, giải thích gọi nhầm là dấu hiệu | low | Đúng, chỉ sửa chữ giải thích | patch: "Look out! = Cẩn thận!", dấu hiệu là cốc sắp rơi |
| 23 | content | q-owl-22 câu tiếng Việt khó hiểu | low | Đúng | patch: "Kể trải nghiệm (đã đi hai lần – twice), không nói lúc nào…" |
| 24 | content | q-owl-07, 08 "right now là việc đang diễn ra" | low | Đúng | patch: "right now (ngay lúc này) cho biết việc đang diễn ra" |
| 25 | content | q-owl-25 gộp can't và mustn't | low | Đúng | patch: "mustn't = không được, can't = không thể: cả hai đều sai nghĩa" |
| 26 | content | Tóm tắt T3: luật "for" và chú giải "việc chưa xong tới giờ" dễ hiểu sai | low | `t2-t4-grammar.ts` dòng 3, 4 của `GRAMMAR_T3_W4.review.summary` | patch: "việc tới giờ chưa xảy ra hoặc còn kéo dài"; "…hoặc việc đã kết thúc (kể cả có for) dùng quá khứ đơn" |
| 27 | content | `requires` thiếu khái niệm (prepositions-of-time, subject-pronouns, have-has, irregular-plurals) | low | Đúng ở q-owl-05, 08, 10, 19, 32, 42; q-owl-40 dùng since, F18 chỉ dạy at / in / on nên không thêm; q-owl-39 đã soạn lại | patch (các câu trên, `requiresViolations` vẫn rỗng) |
| 28 | content | Từ vựng không bị chặn theo hạng NGSL (lend, brush, uncle, bread…) | low | `outOfScopeWords` chỉ kiểm ngữ pháp từ trước story 40; cả kho câu quiz cũ cũng vậy | defer (có sẵn từ trước) |
| 29 | content | 2 câu mỗi chủ điểm nên tín hiệu nhiễu (1/2 là yếu) | low | Đúng thiết kế frozen ("1/2 câu là chưa đạt") | reject |

## Design Notes

**Ba bài test mới (`QUIZZES`):**

| id | lessonIds | size | minPerLesson | only | mix | homeLessonId |
|---|---|---|---|---|---|---|
| `mini-t3` | s1-t3-w1 … w4 | 10 | 2 | (không) | 8 bài s1-t1-w1 … s1-t2-w4, size 2, only `grammar` + `['thì']` | s1-t3-w4 |
| `mix-s1` | s1-t1-w1 … w4, s1-t2-w1 … w4, s1-t3-w1 … w4, s1-t4-w1, s1-t4-w3 (14 bài) | 20 | 1 | `grammar` + `['thì']` | (không) | s1-t4-w4 |
| `mix-tet` | s1-t1-w1 … s1-t4-w1 (13 bài, bỏ s1-t4-w2) | 5 | 0 | `grammar` + `['thì']` | (không) | s1-t4-w2 |

Tiêu đề: "Mini test tháng T3", "Ôn trộn mọi thì", "Ôn nhẹ ngày Tết". `lessonIds.length × minPerLesson ≤ size − (mix?.size ?? 0)`.

**10 chủ điểm (`OWL_TOPICS`, thứ tự = bảng "mỗi thì một dòng"):**

| id | name | lessonIds (đoạn Ngữ pháp để ôn) |
|---|---|---|
| `to-be` | to be hiện tại | s1-t1-w1 |
| `present-simple` | Hiện tại đơn | s1-t1-w2, s1-t1-w3 |
| `present-continuous` | Hiện tại tiếp diễn | s1-t2-w1 |
| `past-to-be` | to be quá khứ | s1-t2-w2 |
| `past-simple` | Quá khứ đơn | s1-t2-w2, s1-t2-w3 |
| `will` | Tương lai will | s1-t3-w1 |
| `going-to` | be going to | s1-t3-w2 |
| `present-perfect` | Hiện tại hoàn thành | s1-t3-w3, s1-t3-w4 |
| `modals` | can / should / must | s1-t4-w1 |
| `passive-present` | Bị động hiện tại | s1-t4-w3 |

(Bảng story 39 dùng `present-simple-questions` cho dòng hiện tại đơn; test so khớp coi hai id này là một.)

**4 cặp dễ nhầm (`OWL_CONTRASTS`):** `simple-continuous` (present-simple ↔ present-continuous, s1-t2-w1); `was-did` (past-to-be ↔ past-simple, s1-t2-w2); `will-going-to` (will ↔ going-to, s1-t3-w2); `past-perfect` (past-simple ↔ present-perfect, s1-t3-w4). Mỗi cặp 3 câu: 2 `choice` (lựa chọn có dạng của cả hai thì), 1 `type`; ngữ cảnh chốt một thì theo luật chốt dạng của story 37 / khối "Chọn thì" story 39 (Look! / now → tiếp diễn, thói quen / every → đơn; ago / last / in + năm → quá khứ đơn, since / for tới giờ / yet / ever → hoàn thành; quyết định lúc nói → will, kế hoạch / dấu hiệu có sẵn → going to; Were you…? / Did you…?).

**Phân bổ id:** `q-owl-01…30` câu riêng, 3 câu liền nhau mỗi chủ điểm theo thứ tự bảng (choice, type, transform; transform xen kẽ "Đổi …:" và "Dịch sang tiếng Anh: … (…)"); `q-owl-31…42` câu cặp, 3 câu mỗi cặp theo thứ tự bảng (2 `choice` rồi 1 `type`): simple-continuous 31–33, was-did 34–36, will-going-to 37–39, past-perfect 40–42.

**Câu golden (giữ đúng chữ):**
- `q-owl-01` (to-be, choice, s1-t1-w1): "My brother and I ___ students." · ['are', 'is', 'am', 'be'] · requires `['subject-pronouns', 'possessive-adjectives', 'plurals', 'be-affirmative']`.
- `q-owl-05` (present-simple, type, s1-t1-w3): "My sister ___ (not / watch) TV on weekdays." · `doesn't watch` · accept `['does not watch']`.
- `q-owl-27` (modals, transform, s1-t4-w1): "Đổi sang câu hỏi: You can drive a car." · `Can you drive a car?`
- `q-owl-29` (passive-present, type, s1-t4-w3): "These shoes ___ (make) in Vietnam." · `are made`.
- `q-owl-34` (`was-did`, topic past-to-be, choice, s1-t2-w2): "___ you at home last night?" · ['Were', 'Did', 'Was', 'Are'] · giải thích: có to be (at home) thì hỏi bằng Were, không mượn did.
- `q-owl-42` (`past-perfect`, topic past-simple, type, s1-t3-w4): "My parents ___ (buy) this house in 2018." · `bought` · giải thích: in 2018 là mốc đã xong nên quá khứ đơn, không dùng have bought.

`requires` của câu golden khác do người làm chọn (khái niệm có thật trong `CONCEPT_IDS` / `T1_LESSON_CONCEPTS`, qua `requiresViolations`); chữ đề / đáp án không đổi.

**Bốc đề (`pickOwlTenses`):** `random = seededRandom(`${seed}|owl-tenses`)`; (1) mỗi cặp theo thứ tự `OWL_CONTRASTS`: `shuffle(câu cặp, random)[0]`; (2) đếm số câu mỗi chủ điểm đã có; (3) mỗi chủ điểm theo thứ tự `OWL_TOPICS`: `shuffle(câu riêng của chủ điểm, random).slice(0, 2 − đã có)`; (4) `shuffle(tất cả, random)`. Mỗi chủ điểm có 3 câu riêng gồm ≥ 2 câu gõ, nên ≥ 3 chủ điểm không thuộc cặp nào cộng ≥ 3 chủ điểm không được câu cặp chọn trúng luôn cho ≥ 6 câu gõ.

**Kế hoạch ôn khi có chủ điểm yếu (phần `tenses`):**
- Đoạn chủ điểm yếu: theo thứ tự `weakTopics` (% thấp trước, rồi thứ tự bảng), mỗi chủ điểm lấy đoạn `grammar` của từng bài trong `lessonIds`, bỏ trùng.
- Phần thì **đã đạt** (chỉ chủ điểm yếu): chuỗi đoạn = đoạn chủ điểm yếu, mỗi chủ điểm gồm bài trong `lessonIds` rồi bài của câu cặp dễ nhầm đã sai thuộc chủ điểm đó (vd. sai q-owl-37 → thêm s1-t3-w2), xoay vòng cho đủ ngày của phần; mục Sổ lỗi = mục `thì` chặng 1 chưa thuộc có `lessonId` thuộc các bài đó, hoặc là câu kho O.W.L. có `topicId` là chủ điểm yếu (xếp như `compareItems`). Không thêm đoạn ôn rộng.
- Phần thì **chưa đạt:** chuỗi đoạn = đoạn chủ điểm yếu + logic cũ (đoạn từ Sổ lỗi, rồi đoạn ôn rộng), bỏ trùng; mục Sổ lỗi như cũ.
- Phần phát âm, xen kẽ ngày và ngày bắt đầu giữ nguyên.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: đều qua.
- `npx vitest run src/data/questions src/lib/quiz src/lib/owl src/data/lessons` -- expected: qua, gồm test đề cũ không đổi (`BASELINE_PICKS`).
- `npm run layout:guard` -- expected: chỉ báo các file ở AC.
- `npm run layout:check` (cần Chrome) -- expected: không cuộn ngang ở 5 bề rộng; ảnh 375px trùng baseline trừ `/practice`. Lỗi probe "chào 1" (F01) có sẵn từ story 35 (deferred-work) không tính.

**Manual checks:**
- Chrome 375px, store đã bỏ qua Sân ga: làm mini-t3 (thấy 2 câu T1–T2), mix-s1 từ s1-t4-w4, mix-tet từ s1-t4-w2; thi O.W.L. sai vài câu để thấy "Điểm từng thì", kế hoạch khi đã qua, thẻ trên Hôm nay; `scrollWidth` 375 ở mọi màn.
