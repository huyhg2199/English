---
title: 'Kỳ thi O.W.L. 1 qua cửa chặng 1'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: 'dfdc8b020ee9f31d021f29008eee2ead6ee79edf'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/hp-theme.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Phạm vi theo `checkpoint` `owl-1` trong `stage-1.ts`:**
  - **Phần ETS (Part 1, 2, 5):** làm ngoài app bằng đề mẫu ETS (PDF, chỉ link), Huy nhập số câu đúng từng Part; ghi lại để tham khảo, **không** tính vào điều kiện qua cửa.
  - **Phần phát âm:** 30 từ ngẫu nhiên (theo seed lần làm) trong các thẻ SRS Huy đã học (không tính "Đã biết"); thiếu thì bù bằng NGSL hạng thấp nhất có dữ liệu. Mỗi câu chỉ hiện **IPA** (không hiện chữ); Huy đọc, app nhận giọng nói (`en-US`) và đúng khi nghe ra đúng từ. Không có nhận giọng nói (hoặc lỗi mic) thì chuyển sang tự chấm: hiện từ + nút nghe mẫu, Huy bấm "Mình đọc đúng" / "Chưa đúng" (theo `learning-rules.md`).
  - **Phần thì:** 20 câu trắc nghiệm nhãn `thì` lấy từ ngân hàng câu chặng 1 (story 9, 10), tự soạn theo khuôn, không chép British Council; thiếu câu thì story này soạn thêm cho đủ ít nhất 30 câu nhãn `thì` trong chặng 1 để chọn ngẫu nhiên.
- **Qua cửa:** ≥ 70% **riêng từng phần** phát âm và thì. Kết quả lưu vào `quizzes` (story 9) với `kind: 'owl'`, `checkpointId: 'owl-1'`, điểm từng phần, `passed`. Câu thì sai vào Sổ lỗi như thường; từ đọc chưa đúng ghi vào Sổ lỗi nhãn `phát âm`.
- **Qua:** hiện "Qua O.W.L. 1" với hiệu ứng Lumos + trao huy chương Dumbledore (story 12 tự tính từ `passed`), mời sang chặng 2. Không tự đánh dấu bài.
- **Trượt:** không reset gì. App sinh **kế hoạch ôn 2 tuần** cho phần yếu (phần dưới 70%, cả hai thì cả hai): lấy các mục Sổ lỗi theo nhãn tương ứng, xếp theo số lần sai, chia vào 14 ngày (mỗi ngày: 1 đoạn bài có link + ôn Sổ lỗi), lưu kèm lần làm (không key mới) và hiện ở trang Hôm nay tới khi qua lần sau hoặc hết 14 ngày. Làm lại được bất cứ lúc nào.
- **Vào thi:** từ đoạn kiểm tra bài `s1-t4-w4` và từ Luyện tập; không khoá theo tiến độ.

**Problem:** Chặng 1 kết thúc bằng O.W.L. 1 (cuối T4, 02/2027) nhưng app chưa có bài thi qua cửa, chưa có cách báo phần yếu và kế hoạch ôn khi trượt (CAP-4).

**Approach:** Trang thi 3 phần dùng lại engine câu hỏi (story 9), so khớp giọng nói (story 6), thẻ SRS (story 3) và Sổ lỗi; hàm thuần chọn đề, chấm từng phần, quyết định qua cửa và sinh kế hoạch ôn.

## Boundaries & Constraints

**Always:**
- Ngưỡng 70% tính riêng từng phần, làm tròn không có lợi (vd 20/30 = 66,7% là trượt).
- Chọn đề, chấm, qua cửa, kế hoạch ôn là hàm thuần có test; seed và thời gian qua tham số.
- Không key store mới; lần làm `owl` nằm trong `quizzes` (thêm field tuỳ chọn), gộp như story 9.
- Không phạt, không reset chặng; lời lẽ khích lệ tiếng Việt; 375px.

**Never:**
- Không chép đề ETS hay bài British Council; không làm O.W.L. 2 / N.E.W.T.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Đề phát âm | 120 thẻ đã học | 30 từ khác nhau từ thẻ đã học, hiện IPA | N/A |
| Ít thẻ | 10 thẻ đã học | 10 từ đó + 20 NGSL hạng thấp nhất có dữ liệu | N/A |
| Đọc đúng | IPA /ˈwɔːtɚ/, nghe ra "water" | Đúng | N/A |
| Không STT | Không có SpeechRecognition | Tự chấm với nút nghe mẫu | N/A |
| Lỗi mic giữa chừng | `not-allowed` | Chuyển sang tự chấm cho các câu còn lại | N/A |
| Qua | Phát âm 22/30, thì 15/20 | Qua (73%, 75%), Dumbledore | N/A |
| Trượt một phần | Phát âm 20/30, thì 18/20 | Trượt; kế hoạch 14 ngày chỉ phần phát âm | N/A |
| Trượt cả hai | Cả hai < 70% | Kế hoạch có cả hai phần | N/A |
| Sổ lỗi trống | Trượt nhưng không có mục sổ phù hợp | Kế hoạch dùng các bài chặng 1 có câu sai trong lần thi | N/A |
| Phần ETS | Nhập P1/P2/P5 | Lưu tham khảo, không ảnh hưởng qua cửa | Nhập sai giới hạn: báo lỗi |
| Bỏ dở | Rời trang giữa chừng | Không ghi lần làm | N/A |
| Làm lại sau khi qua | Đã qua, làm lại | Ghi lần mới; Dumbledore đếm số lần qua | N/A |

</frozen-after-approval>

## Code Map

- `src/data/roadmap/stage-1.ts` -- `checkpoint` `owl-1` (scope, ngưỡng, `ifNotPassed`); bài `s1-t4-w4` có đoạn `checkpoint`.
- Story 9/10: `src/data/questions/` (nhãn `thì`), `src/lib/quiz/` (chấm, ghi `quizzes`, đẩy Sổ lỗi), `src/pages/Quiz.tsx`, `src/components/quiz/*`, hiệu ứng Lumos.
- Story 6: `src/lib/speech-recognition.ts` (`canRecognize`, `recognizeOnce`), `src/lib/pronunciation/` (`normalizeWords`, `applyRecognition`), `src/components/ListenButton.tsx`.
- Story 3: `src/lib/srs/` (`readCards`, `isSrsCard`), `src/data/vocab/` (`loadWords`, `hasDetails`).
- Story 5: `src/lib/placement/scoring.ts` (`PART_LIMITS`, kiểm nhập Part).
- Story 12: huy chương Dumbledore đọc `quizzes` `kind: 'owl'`, `passed`.
- `src/pages/Today.tsx` -- thẻ kế hoạch ôn; `src/pages/Practice.tsx`, `src/pages/Lesson.tsx` -- lối vào.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/questions/` (+ test) -- bổ sung câu nhãn `thì` chặng 1 cho đủ ≥ 30.
- [x] `src/lib/owl/` (+ test) -- `pickOwlPronunciation(store, words, seed)`, `pickOwlTenses(bank, seed)`, `gradeOwl`, `owlPassed`, `reviewPlan(store, attempt, now)`, `recordOwlAttempt`.
- [x] `src/pages/Owl.tsx`, `src/components/owl/*`, `src/app/routes.tsx`, `src/pages/Lesson.tsx`, `src/pages/Practice.tsx`, `src/pages/Today.tsx` -- trang thi 3 phần, kết quả, kế hoạch ôn.

**Acceptance Criteria:**
- Given làm đủ 3 phần và đạt ≥ 70% cả phát âm lẫn thì, when xem kết quả, then thấy "Qua O.W.L. 1" và Phòng Cúp có Dumbledore đồng.
- Given trượt phần phát âm, when mở Hôm nay, then thấy kế hoạch ôn 14 ngày cho phát âm với link tới đoạn bài cụ thể; tiến độ chặng giữ nguyên.

## Implementation Notes

- Ngân hàng đã có 51 câu trắc nghiệm nhãn `thì` chặng 1 (≥ 30) nên không soạn thêm; test khoá điều kiện ≥ 30.
- `QuizAttempt` thêm field tuỳ chọn `checkpointId` và `owl` (điểm từng phần, `ets`, `selfGraded`, `plan`); `isQuizAttempt` chỉ kiểm `owl` là object, `readOwlDetails` kiểm sâu. Không đổi schema version, không key mới.
- Câu phát âm có id `owl-ipa-<id từ>`; từ đọc chưa đúng vào Sổ lỗi nhãn `phát âm`, gắn đoạn `s1-t1-w1/pronunciation`, kèm field tuỳ chọn `word: { text, ipa }` (chữ thật, vd o'clock). Mục có `word` được tính đến hạn và ôn bằng tự chấm trong phiên ôn Sổ lỗi (hiện IPA → xem từ + nghe mẫu → "Mình đọc đúng" / "Chưa đúng").
- Nhận giọng nói: tối đa 2 lần nói mỗi từ (lần không nghe thấy gì không tính); chấp nhận từ đồng âm (to/two/too…); lưu phương án đã khớp. App chấm sai thì có "Mình đọc đúng mà (tự chấm)". `not-allowed` / `audio-capture` / `unsupported` → tự chấm cho các câu còn lại; lần thi có câu tự chấm được đánh dấu "có phần tự chấm".
- "NGSL hạng thấp nhất" hiểu là số hạng nhỏ nhất (từ hay gặp nhất) có dữ liệu IPA, bỏ từ đã chọn và từ có thẻ "Đã biết".
- Kế hoạch ôn: mục sổ (bỏ mục "đã thuộc") xếp: câu sai trong lần thi này trước, rồi theo số lần sai; mỗi ngày chỉ nhận mục của đúng phần của ngày đó. Đoạn bài: đoạn chứa mục sổ (đoạn có câu sai lần này trước), thiếu thì thêm các đoạn Phát âm / Ngữ pháp khác của chặng 1 có tag tương ứng (bỏ tuần Tết); hai phần cùng yếu thì xen kẽ ngày. Không có đoạn nào → không có kế hoạch. Kế hoạch tính trước rồi ghi cùng lần làm một lần.
- % hiển thị làm tròn xuống; qua cửa so nguyên `score*100 >= total*70`.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge, verif-gap | Từ đọc sai ở O.W.L. vào Sổ lỗi nhưng không bao giờ ôn được: đến hạn mãi, kế hoạch ôn có bước không làm được | medium | `reviewableDue` bỏ id không có trong ngân hàng câu; `MistakeCard` chỉ hiện từ + nút nghe | patch |
| 2 | blind, edge, verif-gap | Sổ lỗi hiện/đọc sai từ có dấu nháy, khoảng trắng, chữ hoa (o-clock, ma-am, i) | medium | `owlWordFromId` cắt id | patch |
| 3 | blind | Kế hoạch ôn: mục Sổ lỗi lệch với phần của ngày khi trượt cả hai; lấy cả mục đã thuộc, không ưu tiên lỗi của lần thi này | medium | Trộn id riêng với đoạn; chỉ lọc theo nhãn | patch |
| 4 | edge | `sequence` rỗng làm `reviewPlan` ném lỗi khi ghi lần thi | medium | `sequence[i % 0]` | patch |
| 5 | blind | Từ đồng âm (to/two, for/four, right/write) bị chấm sai | medium | `heardWord` cần khớp đúng chữ | patch |
| 6 | blind, edge | Hiện "App nghe ra" bản nhận dạng #1 dù chấm theo bản khác | low | `transcripts[0]` | patch |
| 7 | blind | Câu thì chưa trả lời vẫn bấm "Câu tiếp"/"Nộp bài" và bị chấm sai âm thầm | low | Bắt chọn đáp án trước khi đi tiếp | patch |
| 8 | blind | Lần làm tự chấm không được đánh dấu ở kết quả/lịch sử | low | `selfGraded` lưu nhưng không hiện | patch |
| 9 | blind | Đề ít hơn 30 + 20 vẫn chạy và chấm trên tổng nhỏ hơn mà không báo | low | Báo số câu thực tế | patch |
| 10 | blind | Kế hoạch ghi bằng cách sửa tay store sau `recordAttempt`, không tăng `updatedAt` | low | Tính kế hoạch trước một lần `recordAttempt` | patch |
| 11 | edge | Từ bù NGSL không bỏ qua thẻ "Đã biết" | low | Spec: không tính "Đã biết" | patch |
| 12 | edge, blind | Lỗi nhập ETS cũ không xoá khi sửa; lời Phần 2 không đổi sau khi chuyển tự chấm; thiếu `lang="en"` | low | Sửa trực tiếp | patch |
| 13 | verif-gap | Máy trạng thái nghe (lỗi mic → tự chấm, 2 lần thử) chỉ trong component | low | Chưa có môi trường test component; tách hàm là refactor | defer |
| 14 | blind | Không chặn rời trang giữa bài | false | Đúng I/O "Bỏ dở → không ghi" | reject |
| 15 | blind | Kế hoạch không theo dõi tiến độ từng ngày; trượt lần hai thay kế hoạch | low | Ngoài phạm vi | reject |
| 16 | blind | Điểm gộp 37/50 của lần O.W.L. lẫn vào thống kê chung | low | Hermione cần 100% cả hai phần, hợp lý | reject |
| 17 | blind | Link PDF ETS viết cứng | low | URL chính thức đã xác minh trong nguồn | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px: thi đủ 3 phần (STT giả + tự chấm), qua/trượt, kế hoạch ôn ở Hôm nay; không tràn ngang.
