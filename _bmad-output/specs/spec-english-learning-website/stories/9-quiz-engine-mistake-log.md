---
title: 'Engine test bám bài, mini test và Sổ lỗi sai của Snape'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: '858eed11a3e613a468cfd3e4513b156fcf23b326'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Ngân hàng câu hỏi** tĩnh trong repo, tự soạn theo khuôn ETS (không chép đề): mỗi câu có `id` ổn định, `lessonId` + `sectionId` nguồn, nhãn lỗi (`thì | từ loại | giới từ | phát âm | từ vựng | nghe`), đề, 4 lựa chọn, đáp án, giải thích tiếng Việt ngắn. Loại câu: chọn đáp án (kiểu Part 5), phát âm (chọn từ có âm khác / vị trí trọng âm), nghe (TTS en-US đọc câu, chọn câu đã nghe).
- **Story này soạn 6 câu cho mỗi bài T1** (`s1-t1-w1…w4`, 24 câu) bám nội dung story 6. Story 10 thêm câu cho T2–T4.
- **Mini test tuần 4 T1:** 10 câu lấy từ 24 câu T1, đủ 4 tuần (ít nhất 2 câu mỗi tuần), thứ tự lựa chọn xáo theo seed của lần làm. Vào từ đoạn ngữ pháp bài `s1-t1-w4` (thay dòng chờ của story 6) và từ Luyện tập. Làm lại được không giới hạn.
- **Kết quả:** mỗi câu sai hiện đáp án đúng, giải thích, và link về đúng đoạn bài nguồn (`#/roadmap/lesson/<lessonId>/<sectionId>`). Mọi lần làm lưu lại (key `quizzes`) để story 12 (huy chương Hermione 100%) và story 14 (O.W.L.) dùng.
- **Sổ lỗi sai của Snape:** câu sai tự vào sổ (key `mistakes`, theo id câu): nhãn lỗi, bài nguồn, số lần sai, lần sai gần nhất. Ôn sổ theo lịch SRS riêng (dùng lại `review()` của story 3; trả lời đúng = Nhớ, sai = Quên), ở trang `#/practice/mistakes`. Không xoá: câu ôn tới khoảng ≥ 21 ngày thì hiện "đã thuộc" nhưng vẫn ở sổ. Lọc theo nhãn lỗi.
- **"Vì sao sai?"** gọi Gemini bằng key của Huy (BYOK): key nhập ở trang Sổ lỗi, lưu **chỉ** ở `localStorage['lumos-english:gemini-key']` (ngoài `store.data`, nên không đồng bộ, không vào backup), gửi qua header `x-goog-api-key` (không để key trong URL), không log. Model mặc định là hằng số `gemini-2.5-flash` (đổi được trong ô cài đặt). Trả lời tiếng Việt: lỗi sai ở đâu, quy tắc, 2 câu ví dụ đúng; lưu lời giải thích vào mục sổ để xem lại không cần gọi lại. Không có key thì nút mời nhập key; lỗi mạng/quota báo tiếng Việt.

**Problem:** App chưa có câu hỏi nào: chưa kiểm tra được bài, chưa có mini test tuần 4 T1 (cuối tháng 11/2026), câu sai không được gom lại để ôn (CAP-19).

**Approach:** Engine câu hỏi thuần (chấm, chọn câu, xáo, ghi kết quả, đẩy câu sai vào sổ), ngân hàng câu T1, trang làm bài dùng chung cho mọi bài test sau này, trang Sổ lỗi có ôn SRS và nút "Vì sao sai?" gọi Gemini từ trình duyệt.

## Boundaries & Constraints

**Always:**
- Store lên version kế tiếp: thêm `quizzes: { attempts: {} }`, `mistakes: { items: {} }`; cả hai vào `SYNCED_KEYS`, gộp theo mục (`attempts` theo id lần làm; `mistakes` theo id câu: `wrongCount` lấy max, lịch SRS và lời giải thích theo `updatedAt` mới hơn).
- Key Gemini không bao giờ nằm trong `store.data`, không đồng bộ, không backup, không log, không có trong repo; module gọi Gemini nằm ở `src/lib/ai/gemini.ts`, nhận `fetch` để test.
- Mọi câu có `lessonId`/`sectionId` tồn tại trong lộ trình (test kiểm). Câu hỏi không chép từ đề ETS.
- Engine, chọn câu, chấm, gộp sổ là hàm thuần có test; thời gian và seed qua tham số.
- Tiếng Việt, 375px, theme; trả lời đúng có hiệu ứng "Lumos" nhẹ (theo `hp-theme.md`), không dùng hình gốc.

**Never:**
- Không làm O.W.L. (story 14), test quay lại (story 11), câu T2–T4 (story 10).
- Không gửi dữ liệu học khác lên Gemini ngoài câu hỏi, lựa chọn, đáp án đúng và đáp án Huy chọn.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mini test | Bắt đầu mini test T1 | 10 câu, mỗi tuần ≥ 2 câu, không trùng | N/A |
| Chấm | 8 đúng, 2 sai | Điểm 8/10; 2 câu sai có đáp án, giải thích, link đúng đoạn bài | N/A |
| Câu sai vào sổ | Sai câu q1 lần đầu | Sổ có q1, `wrongCount 1`, đến hạn ôn ngay | N/A |
| Sai lại | q1 đã trong sổ, sai lần nữa ở test khác | `wrongCount 2`, lịch rút lại | N/A |
| Ôn sổ đúng | Ôn q1 trả lời đúng | Lịch giãn (Nhớ) | N/A |
| Đã thuộc | Khoảng ôn ≥ 21 ngày | Nhãn "đã thuộc", vẫn trong sổ | N/A |
| Lọc nhãn | Chọn "thì" | Chỉ câu nhãn thì | N/A |
| Câu nghe | Không có TTS | Bỏ câu nghe khỏi lần làm, thay câu khác cùng tuần | N/A |
| Vì sao sai, có key | Key hợp lệ | Lời giải thích tiếng Việt + 2 ví dụ, lưu vào mục | N/A |
| Không có key | Chưa nhập key | Mời nhập key, không gọi mạng | N/A |
| Key sai / quota / offline | 400/403/429/lỗi mạng | Báo tiếng Việt tương ứng | Không lưu gì |
| Key không lộ | Xuất backup, đồng bộ, console | Không có key ở đâu | N/A |
| Bỏ dở test | Rời trang giữa chừng | Không ghi lần làm, không thêm vào sổ | N/A |
| Hai máy | Sai q1 ở A (2 lần), B (1 lần) | Sau đồng bộ `wrongCount` = 2 | N/A |

</frozen-after-approval>

## Code Map

- `src/data/roadmap/` (`lookup.ts`, `sectionHref`, `getLessonEntry`) -- link về đoạn bài; id bài/đoạn T1.
- Story 6 (làm trước): `src/data/lessons/` nội dung T1 (âm, thì, câu mẫu) -- nguồn soạn câu hỏi; `src/pages/Lesson.tsx`/`src/components/lesson/*` -- đoạn ngữ pháp `s1-t1-w4` có dòng chờ mini test.
- `src/lib/srs/srs.ts` -- `review(card, grade, now)`, `isSrsCard`, `formatDelay`: dùng lại cho lịch ôn sổ.
- `src/lib/speech.ts` -- TTS en-US, `canSpeak`.
- `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (`SYNCED_KEYS`, `MERGERS`, `mergeEntries` có `pick`), `src/lib/updated-at.ts`.
- `src/lib/backup/` (story 7) -- `BACKUP_KEYS` suy từ `SYNCED_KEYS`; kiểm key Gemini không lọt vào.
- `src/pages/Practice.tsx`, `src/app/routes.tsx`, `src/app/nav-items.ts` (`isNavItemActive`).
- Gemini REST: `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`, header `x-goog-api-key`, body `{ contents: [{ parts: [{ text }] }] }`; đọc `candidates[0].content.parts[0].text`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/questions/` (+ test) -- kiểu `Question`, 24 câu T1; test id duy nhất, nhãn hợp lệ, bài/đoạn tồn tại, đáp án nằm trong lựa chọn, mỗi bài T1 đủ 6 câu.
- [x] `src/lib/quiz/` (+ test) -- `pickMiniTest(bank, seed, { canSpeak })`, `shuffleOptions`, `gradeAttempt`, `recordAttempt(store, attempt, now)` (ghi `quizzes` + đẩy câu sai vào `mistakes`), `reviewMistake`, `dueMistakes`, `filterMistakes`.
- [x] `src/lib/ai/gemini.ts`, `src/lib/ai/key.ts` (+ test) -- đọc/ghi/xoá key ở localStorage, `explainMistake({ fetch, key, model, question, chosen })`, map lỗi HTTP sang tiếng Việt.
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (+ test) -- version mới, `mergeQuizzes`, `mergeMistakes`; test backup không chứa key.
- [x] `src/components/quiz/*`, `src/pages/Quiz.tsx`, `src/pages/Mistakes.tsx`, `src/pages/Lesson.tsx`, `src/pages/Practice.tsx`, `src/app/routes.tsx` -- làm bài, kết quả, sổ lỗi, ôn sổ, cài key.

**Acceptance Criteria:**
- Given bài `s1-t1-w4`, when bấm mini test và làm xong, then thấy điểm, câu sai có link về đúng đoạn bài, và câu sai có trong Sổ lỗi.
- Given đã nhập key Gemini, when bấm "Vì sao sai?" ở một câu sai, then thấy giải thích tiếng Việt kèm 2 ví dụ đúng; mở lại sổ vẫn thấy mà không gọi lại.

## Implementation Notes

- Store v9 (`migrations[8]`): `quizzes: { attempts: {} }`, `mistakes: { items: {} }`; giá trị lạ không phải object giữ trong `legacy`.
- Mục sổ: `{ tag, lessonId, sectionId, wrongCount, lastWrongAt, lastChosen, card: SrsCard, explanation: { text, model, updatedAt } | null, updatedAt }`. Gộp: `wrongCount` max, `card` theo `card.updatedAt`, `explanation` theo `explanation.updatedAt` (bên có thắng bên null), `lastWrongAt` mới hơn.
- Câu mới vào sổ: thẻ đến hạn ngay (learning). Sai lại ở test: `review(card, 'again')`. Ôn sổ sai cũng tính `wrongCount + 1` (spec không nói rõ; chọn vậy vì đó cũng là một lần sai). "Đã thuộc" = thẻ ra khỏi bước học và `interval ≥ 21`.
- Trả lời từng câu hiện đúng/sai ngay (Lumos CSS `.lumos`, tắt khi `prefers-reduced-motion`; app chưa cài Framer Motion). Lần làm chỉ ghi khi bấm "Xem kết quả".
- Route: `#/practice/quiz/:quizId` (mini test `mini-t1`) và `#/practice/mistakes`, nằm dưới tab Luyện tập. Mini test vào từ đoạn ngữ pháp `s1-t1-w4` (`review.quizId`) và từ Luyện tập.
- Model Gemini lưu ở `localStorage['lumos-english:gemini-model']` (ngoài `store.data`). Câu nghe không ôn được ở máy không có TTS (bị bỏ khỏi phiên ôn, vẫn ở sổ).

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge | Gọi Gemini không timeout/huỷ: mạng treo thì nút kẹt mãi | medium | `MistakeCard` không truyền `signal` | patch |
| 2 | blind | Nội dung câu hỏi sai/lệch bài: "hot" /ɑː/ "ngắn gọn"; "worked" viết /wɜːrkt/ khác bài; câu "she / doesn't" gây hiểu nhầm; câu nghe dựa vào quá khứ đơn chưa học | medium | Dạy ngược với trang bài | patch |
| 3 | blind | Không có câu phát âm kiểu "vị trí trọng âm" mà spec nêu | low | 24 câu chỉ có "âm khác" | patch |
| 4 | blind, edge | Không có TTS: câu thay thế không cùng tuần như I/O Matrix | medium | `pickQuiz` lấy từ pool trộn mọi tuần | patch |
| 5 | blind | Lời giải thích đã lưu lệch khi Huy chọn sai đáp án khác; không hỏi lại được | low | Lưu đáp án đã giải thích; cho hỏi lại khi khác | patch |
| 6 | blind, edge, verif-gap | Số câu đến hạn ở Luyện tập khác trang Sổ lỗi (không TTS, câu không còn trong ngân hàng) | low | Dùng chung bộ lọc, ghi chú câu nghe bị bỏ qua | patch |
| 7 | blind | Danh sách sổ lộ đáp án của câu đang đến hạn ôn | low | Ẩn đáp án câu đến hạn tới khi chạm | patch |
| 8 | verif-gap | Gộp sổ: cả hai bên có lời giải thích / `lastChosen` không có test | medium | Test chỉ có một bên null | patch |
| 9 | blind | Test "key không lọt vào backup" kiểm chữ `gemini` (sai khi có lời giải thích) | low | Kiểm giá trị key | patch |
| 10 | verif-gap | Test "bỏ dở" chỉ kiểm store rỗng | low | Đổi tên/bỏ; hành vi UI kiểm bằng tay (môi trường test component đã defer) | patch |
| 11 | blind | `isQuizAttempt` không kiểm `total`/`score` khớp `answers` | low | Thêm điều kiện trực tiếp | patch |
| 12 | blind | `wrongCount = max` mất lỗi độc lập ở hai máy | low | Đúng quyết định spec | reject |
| 13 | blind | Rời trang giữa bài không cảnh báo | low | Đúng I/O "bỏ dở không ghi" | reject |
| 14 | edge | Lỗi localStorage ở cài đặt Gemini báo sai lý do | low | Hiếm | reject |
| 15 | verif-gap | Mục sổ sai dạng mất lịch cũ | low | Chỉ khi dữ liệu hỏng | reject |
| 16 | blind | Nhãn `từ loại`, `từ vựng` chưa dùng; sổ sách spec | low | Không bắt buộc ở T1; sửa spec | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `grep -rn "gemini-key\|x-goog-api-key" src` -- expected: chỉ trong `src/lib/ai/*`.

**Manual checks:**
- Headless 375px: mini test, kết quả, sổ lỗi, ôn sổ, nhập key (không gọi thật nếu không có key); không tràn ngang.
