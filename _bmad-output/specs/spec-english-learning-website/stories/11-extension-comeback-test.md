---
title: 'Gia hạn tiến độ và test quay lại 5 phút'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: '17be8a110b01a425d373b409cdaa5d4457924d68'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Ngày bắt đầu lộ trình** = ngày (giờ máy) sớm nhất trong nhật ký buổi học (story 4); chưa có buổi nào thì là hôm nay. Không thêm key mới.
- **Lịch gốc:** tính từ bài bắt đầu (`startLessonId` của story 5, mặc định bài đầu), bài thứ *k* (0-based) có hạn = ngày bắt đầu + 7 × (*k* + 1) ngày. **Mốc gốc đạt 750** = hạn của bài cuối lộ trình (`s3-t12-w4`).
- **Trễ** (theo `learning-rules.md`): bài hiện tại (bài chưa xong đầu tiên từ bài bắt đầu) đã quá hạn hơn 7 ngày mà chưa xong. **Số tuần trễ** = ⌈(số ngày quá hạn − 7) / 7⌉ khi quá hạn hơn 7 ngày, ngược lại 0 (quá hạn đúng 7 ngày vẫn là đúng hạn, 8 ngày là trễ 1 tuần, 21 ngày là 2 tuần). **Ngày dự kiến** = mốc gốc + 7 × số tuần trễ. Không có tuần trễ âm (học nhanh không kéo mốc lên sớm hơn mốc gốc).
- **Hiện ở đâu:** trang Hôm nay có thẻ nhỏ "Ngày dự kiến đạt 750" (ngày + "đúng hạn" hoặc "lùi N tuần") và hệ quả bằng lời nhẹ nhàng (vd "Kỳ thi thật dự kiến dời sang tháng 02/2028; không mất tiến độ nào"). Bản đồ hiện cùng ngày dự kiến ở đầu trang. Không chữ đỏ, không cảnh báo, không khoá gì.
- **Quay lại sau nghỉ** (CAP-6): ngày học gần nhất (nhật ký buổi) cách hôm nay > 7 ngày → mở trang Hôm nay thấy thẻ "Chào mừng quay lại" mời làm test 5' (bỏ qua được, không ép). Test có 8 câu: lấy từ câu hỏi của các bài nằm trong 4 tuần lịch gần nhất trước bài hiện tại (theo thứ tự lộ trình, tối đa 4 bài, có câu hỏi) cộng câu trong Sổ lỗi (tối đa 3); thiếu câu thì lấy thêm từ bài trước đó. Dùng engine/trang làm bài của story 9 (lưu lần làm `kind: 'comeback'`, câu sai vào Sổ lỗi như thường).
- **Đưa tới đúng chỗ hổng:** sau test, app chỉ tới đoạn bài có nhiều câu sai nhất (hoà thì bài sớm hơn); không sai câu nào thì về bài hiện tại. Không đổi tiến độ bài.
- Đã có buổi học mới sau đợt nghỉ (hoặc đã làm/bỏ qua test cho đợt nghỉ đó) thì thẻ không hiện lại cho đến lần nghỉ > 7 ngày sau. Ghi "đã bỏ qua" bằng một lần làm `kind: 'comeback'` rỗng có cờ `skipped` (đồng bộ được, story 12 không tính).

**Problem:** Khi Huy trễ hay nghỉ, app không nói gì: không biết mốc 750 đã lùi bao lâu, quay lại thì về đâu học tiếp. Đây là chỗ dễ bỏ cuộc nhất (CAP-5, CAP-6).

**Approach:** Hàm thuần tính lịch gốc, trễ, ngày dự kiến từ tiến độ + nhật ký; hàm thuần phát hiện nghỉ > 7 ngày, chọn câu test 5' và chọn đoạn hổng; gắn thẻ vào Hôm nay/bản đồ và dùng lại trang làm bài của story 9.

## Boundaries & Constraints

**Always:**
- Mọi tính toán (lịch, trễ, ngày dự kiến, nghỉ, chọn câu, chọn đoạn hổng) là hàm thuần có test, thời gian qua `now`, ngày theo giờ máy.
- Không phạt, không reset, không khoá; lời lẽ khích lệ, tiếng Việt.
- Không thêm key store mới; lần làm test quay lại nằm trong `quizzes` của story 9 (`kind: 'comeback'`).
- 375px, theme.

**Never:**
- Không nhắc qua Telegram/thông báo (story 13), không huy chương Neville (story 12).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Đúng hạn | Bắt đầu 02/11/2026, hôm nay 05/11, bài 1 chưa xong | "Đúng hạn", ngày dự kiến = mốc gốc | N/A |
| Trễ 1 tuần | Bắt đầu 02/11, hôm nay 17/11, bài 1 chưa xong (quá hạn 09/11 hơn 7 ngày) | Lùi 1 tuần, ngày dự kiến = mốc gốc + 7 ngày | N/A |
| Học nhanh | Xong 3 bài trong tuần đầu | Vẫn "đúng hạn", ngày dự kiến = mốc gốc | N/A |
| Bắt đầu chặng 2 | `startLessonId = s2-t5-w1` | Lịch gốc tính từ bài đó, mốc gốc = hạn bài cuối | N/A |
| Chưa học buổi nào | Nhật ký rỗng | Ngày bắt đầu = hôm nay, đúng hạn | N/A |
| Xong lộ trình | Không còn bài | Không hiện thẻ trễ; hiện "Đã xong lộ trình" | N/A |
| Nghỉ 8 ngày | Buổi gần nhất cách 8 ngày | Thẻ "Chào mừng quay lại" + nút test 5' | N/A |
| Nghỉ 7 ngày | Cách đúng 7 ngày | Không hiện thẻ | N/A |
| Test 8 câu | 4 bài gần nhất có câu + Sổ lỗi có 5 câu | 8 câu, ≤ 3 từ Sổ lỗi, không trùng | Thiếu câu: lấy thêm bài trước |
| Đoạn hổng | Sai 2 câu đoạn ngữ pháp bài A, 1 câu bài B | Chỉ tới đoạn ngữ pháp bài A | N/A |
| Không sai | Đúng hết | Về bài hiện tại | N/A |
| Bỏ qua test | Bấm "Để sau" | Thẻ ẩn cho đợt nghỉ này | N/A |
| Học lại sau nghỉ | Có buổi mới hôm nay | Thẻ không hiện | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/sessions/` (story 4) -- nhật ký `sessions.days[YYYY-MM-DD]`, `localDayKey`, `sessionLesson` (đã theo `startLessonId`).
- `src/lib/roadmap-progress.ts` -- `computeRoadmapProgress(lessons, done, startLessonId)` → `nextLessonId`, `skipped`; `src/data/roadmap` `allLessons()` theo thứ tự.
- `src/lib/placement/` (story 5) -- `startLessonId`.
- Story 9: `src/data/questions/`, `src/lib/quiz/` (`gradeAttempt`, `recordAttempt`, chọn câu), `src/pages/Quiz.tsx`; `quizzes.attempts` (thêm `kind`, `skipped` nếu chưa có — đồng bộ vẫn gộp theo id lần làm).
- `src/pages/Today.tsx`, `src/pages/Roadmap.tsx` -- chỗ gắn thẻ.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/schedule/` (+ test) -- `roadmapStartDate(store, now)`, `planFor(store, now)` → `{ baselineGoal, projectedGoal, weeksLate, currentLessonId, done }`.
- [x] `src/lib/comeback/` (+ test) -- `needsComeback(store, now)`, `pickComebackTest(store, bank, seed)`, `weakestSectionFrom(attempt)`, ghi bỏ qua.
- [x] `src/lib/quiz/` (+ test) -- hỗ trợ `kind: 'comeback'` và bộ câu truyền vào (nếu engine story 9 chưa có).
- [x] `src/components/ScheduleCard.tsx`, `src/components/ComebackCard.tsx`, `src/pages/Today.tsx`, `src/pages/Roadmap.tsx`, trang làm bài -- thẻ và luồng test 5' → kết quả → link đoạn hổng.

**Acceptance Criteria:**
- Given đã trễ 2 tuần, when mở Hôm nay, then thấy ngày dự kiến lùi 2 tuần kèm lời khích lệ, không có cảnh báo đỏ.
- Given nghỉ 10 ngày, when mở Hôm nay và làm test 5', then được đưa tới đoạn bài có nhiều câu sai nhất.

## Implementation Notes

- **Số tuần trễ — chỗ spec tự mâu thuẫn.** Công thức trong Decisions (`max(mốc gốc, hôm nay + 7 × số bài còn lại)`, làm tròn lên) cho ca "Trễ 1 tuần" của I/O Matrix (bắt đầu 02/11, hôm nay 17/11, bài 1 chưa xong) ra **3** tuần, không phải 1. Làm theo Matrix, `learning-rules.md` ("mốc gốc + tổng số tuần trễ") và CAP-5 ("trễ N tuần thì lùi N tuần"): số tuần trễ = ⌈(số ngày quá hạn − 7) / 7⌉ khi quá hạn > 7 ngày; ngày dự kiến = mốc gốc + 7 × số tuần trễ. Để học nhanh không bị tính trễ, hạn dùng để đo là hạn "dồn" của bài hiện tại = mốc gốc − 7 × (số bài còn lại − 1) (bằng hạn gốc khi học tuần tự). Quá hạn đúng 7 ngày chưa tính trễ; 8 ngày → 1 tuần; 21 ngày → 2 tuần. Huy nên xác nhận.
- **Đợt nghỉ đã xử lý** = lần làm `kind: 'comeback'` gần nhất ghi từ ngày nghỉ thứ 8 trở đi: làm xong → ẩn tới đợt nghỉ sau; "Để sau" → ẩn 7 ngày, quá 7 ngày từ lần bỏ qua mà vẫn chưa học thì mời lại. Chưa học buổi nào, hoặc không dựng được câu nào, thì không có thẻ.
- **Ngày bắt đầu lộ trình** = muộn hơn giữa ngày học sớm nhất và ngày áp dụng bài bắt đầu (`placement.updatedAt` khi có `startLessonId`), để xếp lớp muộn không làm trễ ngay.
- **Bài hiện tại** lấy từ `computeRoadmapProgress(...).nextLessonId` (cùng nguồn với Hôm nay / Lộ trình); xong lộ trình từ bài bắt đầu thì `done` nhưng bài hiện tại có thể là bài đã bỏ qua.
- `listGradedAttempts` (bỏ lần `skipped` và `kind` lạ) dùng cho lịch sử / điểm; `kind` nhận mọi chuỗi để lần làm của bản app mới hơn không mất khi gộp; `skipped: true` chỉ hợp lệ với `kind: 'comeback'` và `total: 0`.
- **Chọn câu test 5'**: tối đa 3 câu Sổ lỗi (ưu tiên câu chưa thuộc, xáo theo seed), còn lại chia đều (mỗi bài một câu mỗi vòng) cho tối đa 4 bài có câu hỏi ngay trước bài hiện tại; thiếu thì lần lượt bài trước đó; vẫn thiếu (vd bài hiện tại là bài đầu) thì lấy câu của chính bài hiện tại. Không có TTS thì bỏ câu nghe. Bài trước bài bắt đầu (bỏ qua theo Mũ Phân Loại) vẫn được tính là "bài trước".
- **Đoạn hổng**: hoà số câu sai → bài sớm hơn trên lộ trình, rồi đoạn sớm hơn trong bài.
- **Trang làm bài**: dùng route `/practice/quiz/comeback` của story 9; `QuizRun` nhận bộ câu truyền vào, `QuizResult` nhận `homeLessonId` + khối `next` ("Học tiếp: …") và `onRetry` tuỳ chọn (test quay lại không có "Làm lại"). Đề và bài hiện tại chốt lúc bắt đầu.
- `QuizAttempt` thêm `kind?: 'comeback'` và `skipped?: boolean` (kiểm tra dạng trong `isQuizAttempt`; đồng bộ/backup gộp theo id như cũ, không đổi schema).

## Spec Change Log

- **Sau khi code (2026-11-02), Claude sửa thay Huy theo uỷ quyền chạy liên tục.** Finding (agent cài đặt): công thức "ngày dự kiến = max(mốc gốc, hôm nay + 7 × số bài còn lại)" cho ra trễ 3 tuần ở dòng I/O "Trễ 1 tuần", mâu thuẫn I/O Matrix và `learning-rules.md` ("mốc gốc + tổng số tuần trễ"). Sửa bullet "Trễ" theo `learning-rules.md` và I/O Matrix (cách code đã làm). KEEP: toàn bộ bản cài đặt.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge (×2) | Bấm "Để sau" (hoặc làm test trước khi nghỉ đủ 7 ngày) rồi tiếp tục không học thì thẻ không bao giờ hiện lại | medium | `pendingComeback` coi mọi lần comeback sau ngày học cuối là đã xử lý; đúng nhóm dễ bỏ cuộc nhất (CAP-6) | patch |
| 2 | blind | Xếp lớp bằng Mũ Phân Loại vài tuần sau buổi đầu thì lập tức "lùi N tuần" | medium | Ngày bắt đầu = buổi sớm nhất, không tính lúc áp dụng xếp lớp | patch |
| 3 | blind, verif-gap | Hai định nghĩa "bài hiện tại" (schedule vs `computeRoadmapProgress`) có thể lệch | medium | Xong hết tuyến từ bài bắt đầu: Hôm nay "Đã xong lộ trình" trong khi bản đồ còn bài | patch |
| 4 | blind | Lần "bỏ qua" rỗng nằm chung lịch sử bài làm (0/0); validator không ràng `skipped` với `comeback`, `total 0` | medium | `useQuizzes().attempts` trả cả lần rỗng; story 12 sẽ đọc | patch |
| 5 | blind, edge | Test quay lại không dựng được câu nào → ngõ cụt, thẻ vẫn mời | low | Thêm nút về Hôm nay / bỏ qua; ẩn thẻ khi không có câu | patch |
| 6 | edge | Thẻ ghi cứng "8 câu" dù có thể ít hơn | low | Hiện số câu thật | patch |
| 7 | blind | "dời sang tháng …" khi tháng không đổi | low | So tháng trước khi dùng chữ "dời" | patch |
| 8 | blind, edge | `findIndex` trả -1 khiến đoạn lạ thắng hoà | low | Coi -1 là cuối | patch |
| 9 | blind | Câu Sổ lỗi tra từ ngân hàng toàn cục, bỏ qua `bank` truyền vào | low | Tra trong `bank` | patch |
| 10 | blind, edge | `skip()` không dùng `now` của hook; bấm nhanh hai lần ghi hai lần | low | Truyền `now`; chỉ ghi khi đang có đợt nghỉ chờ | patch |
| 11 | edge | Lần làm có `kind` lạ từ bản app mới hơn bị loại khi gộp | low | Chấp nhận mọi chuỗi `kind`, nơi dùng bỏ qua kind lạ | patch |
| 12 | verif-gap | Thiếu test: bài trước bài bắt đầu (xếp lớp) vẫn là "bài trước"; ưu tiên câu Sổ lỗi chưa thuộc; hoà hai đoạn trong cùng bài | low | Thêm test | patch |
| 13 | blind | Học bù làm ngày dự kiến sớm lại (không cộng dồn tuần trễ) | false | Quyết định: số tuần trễ đo theo hiện trạng, học bù được lấy lại mốc — khích lệ, không phạt; không có tuần trễ âm | reject |
| 14 | edge | Hoàn thành bài không theo thứ tự làm lệch số ngày trễ | low | #3 thống nhất bài hiện tại; trường hợp hiếm | reject |
| 15 | blind | Spec sửa trong khối frozen; Implementation Notes cũ | low | Sửa theo uỷ quyền của Huy, đã ghi Change Log | reject |
| 16 | blind | UI chưa có test | low | Không có môi trường test component (đã defer) | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px với store giả lập (nghỉ 10 ngày, trễ 2 tuần): thẻ hiện đúng, test 5' chạy, link đoạn hổng; không tràn ngang.
