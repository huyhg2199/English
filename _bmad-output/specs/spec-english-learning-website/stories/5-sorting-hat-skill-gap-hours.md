---
title: 'Mũ Phân Loại, bảng khoảng cách kỹ năng và đồng hồ giờ học'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: '41b8b3796f18aadbfb5568ece58638c6edbf4f1f'
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
- **Nhập điểm:** số câu đúng từng Part của đề mẫu ETS (P1 0–6, P2 0–25, P3 0–39, P4 0–30, P5 0–30, P6 0–16, P7 0–54). Làm lại được bất cứ lúc nào; mỗi lần lưu thành một bản có ngày. Lần đầu là **mốc**, lần mới nhất là **hiện tại**. Không xoá lần cũ.
- **Điểm ước tính:** Listening = P1–P4 (0–100 câu), Reading = P5–P7 (0–100 câu), mỗi phần đổi sang 5–495 bằng bảng nội suy tuyến tính từng đoạn tự đặt, ghi rõ "ước tính, không phải bảng quy đổi chính thức của ETS".
- **Xếp chặng/bài:** tổng ước tính < 300 → bài đầu chặng 1; 300–549 → bài đầu chặng 2; ≥ 550 → bài đầu chặng 3. Lưu `startLessonId`. Bài học tiếp theo = bài chưa xong đầu tiên **từ** `startLessonId`; các bài trước đó không bị đánh dấu xong, bản đồ hiện chúng mờ với nhãn "đã bỏ qua". Làm lại Mũ Phân Loại chỉ đổi `startLessonId` khi Huy bấm "Áp dụng xếp lớp" (không tự lùi/tiến).
- **Gán Nhà:** 4 câu hỏi sở thích (phim, nhạc, tin, code), mỗi đáp án cộng điểm cho một Nhà: phim → Gryffindor, nhạc → Hufflepuff, code → Ravenclaw, tin/chứng khoán → Slytherin; hoà thì theo thứ tự đó. Nhà quyết định màu nhấn của giao diện (biến CSS). Đổi Nhà được bằng cách trả lời lại. Chỉ dùng tên Nhà và màu, không dùng logo/huy hiệu gốc.
- **Bảng kỹ năng:** 5 dòng theo `learning-rules.md`.
  - Listening, Reading: điểm ước tính hiện tại so với mục tiêu chặng hiện tại = cận trên `scoreGoal` của chặng (300 / 550 / 750) chia L 55% / R 45%.
  - Ngữ pháp: % đúng P5+P6 so với 70%.
  - Từ vựng: số thẻ SRS đã học (không tính "Đã biết") so với `cumulativeWords` của bài hiện tại (chặng 2–3 không có số thì dùng 1000 + 60/tuần kể từ đầu chặng 2).
  - Phát âm: "chưa có dữ liệu" cho tới story 6/14.
  - Khoảng cách chuẩn hoá = (mục tiêu − hiện tại) / mục tiêu, chặn trong [0, 1].
- **Đẩy bài vào kỹ năng yếu nhất:** bài theo tuần vẫn đi tuần tự; trong phần "bài chính" của buổi 30' (story 4) và ở trang bài, đoạn mang tag của kỹ năng có khoảng cách lớn nhất được đưa lên đầu và gắn nhãn "Ưu tiên". Chưa làm Mũ Phân Loại thì không đổi thứ tự.
- **Đồng hồ giờ học:** tổng `minutes` trong nhật ký buổi học (story 4: buổi chuẩn 25, lười 10) đổi ra giờ, so với 450 giờ/năm: hiện tổng giờ, % của 450, và "nhịp cần" = 450 × số ngày từ buổi đầu tiên / 365.
- **Chỗ hiện:** trang `#/sorting-hat` (nhập điểm + câu hỏi Nhà). Trang Hôm nay có thẻ "Đội Mũ Phân Loại" khi chưa làm, và thẻ "Bảng kỹ năng" + đồng hồ giờ khi đã làm.

**Problem:** App chưa biết Huy đang ở đâu: không có điểm mốc, chưa xếp bài, không thấy kỹ năng nào yếu, không đếm giờ học so với mục tiêu 450 giờ/năm.

**Approach:** Thêm Mũ Phân Loại (nhập điểm ETS theo Part + 4 câu hỏi Nhà), lưu kết quả vào store, tính điểm ước tính, xếp bài bắt đầu, bảng kỹ năng và đồng hồ giờ bằng hàm thuần; gắn vào trang Hôm nay, bản đồ và phần bài chính.

## Boundaries & Constraints

**Always:**
- Store lên version kế tiếp sau story 4: migration thêm `placement: { attempts: {}, house: null, startLessonId: null, updatedAt }`, vào `SYNCED_KEYS` với luật gộp: `attempts` gộp theo id lần làm, các field còn lại theo `updatedAt` mới hơn (không lùi).
- Mọi phép tính (quy đổi điểm, xếp chặng, Nhà, khoảng cách, nhịp giờ) là hàm thuần có test; thời gian qua `now`.
- Nhập điểm có kiểm giới hạn từng Part, báo lỗi tiếng Việt, không lưu khi sai.
- Không phạt, không xoá: làm lại không xoá lần cũ; xếp lớp không đánh dấu bài xong hay bỏ đánh dấu.
- Tiếng Việt, 375px, theme hiện có (màu Nhà chỉ là màu nhấn, giữ độ tương phản).

**Never:**
- Không copy đề ETS hay bảng quy đổi chính thức. Không làm test trong app (Huy làm đề PDF bên ngoài).
- Không làm điểm Nhà/huy chương (story 12), gia hạn (story 11).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mất gốc | Tổng câu đúng thấp, ước tính < 300 | Xếp bài đầu chặng 1 | N/A |
| Khá | Ước tính 300–549 | Xếp bài đầu chặng 2; bản đồ hiện chặng 1 mờ "đã bỏ qua" | N/A |
| Nhập sai | P1 = 7 hoặc số âm/chữ | Báo lỗi tiếng Việt ở ô đó, không lưu | N/A |
| Làm lại | Đã có lần 1, nhập lần 2 | Lần 1 vẫn là mốc, lần 2 là hiện tại; chỉ đổi bài bắt đầu khi bấm "Áp dụng xếp lớp" | N/A |
| Nhà | Đáp án nghiêng về code | Ravenclaw, màu nhấn đổi | N/A |
| Nhà hoà | 2 phim, 2 code | Gryffindor (theo thứ tự ưu tiên) | N/A |
| Kỹ năng yếu nhất | Ngữ pháp có khoảng cách lớn nhất | Đoạn ngữ pháp lên đầu "bài chính", nhãn "Ưu tiên" | N/A |
| Chưa làm Mũ | `placement` rỗng | Không đổi thứ tự đoạn; Hôm nay mời đội Mũ | N/A |
| Phát âm | Chưa có dữ liệu | Dòng phát âm "chưa có dữ liệu", không tính khoảng cách | N/A |
| Giờ học | 10 buổi chuẩn + 4 buổi lười trong 14 ngày | 290 phút = 4,8 giờ; nhịp cần = 450 × 14/365 ≈ 17,3 giờ | N/A |
| Chưa học buổi nào | Nhật ký rỗng | 0 giờ, không chia cho 0 | N/A |
| Bài đã xong trước điểm bắt đầu | Bài chặng 1 đã đánh dấu xong, xếp chặng 2 | Vẫn sáng trên bản đồ (xong thắng "bỏ qua") | N/A |
| Hai máy | Làm Mũ ở hai máy khác lần | Sau đồng bộ có cả hai lần; field đơn theo `updatedAt` mới hơn | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/roadmap-progress.ts` -- `computeRoadmapProgress(lessons, completedIds)`: thêm tham số tuỳ chọn `startLessonId`, trả thêm tập `skipped`; giữ chữ ký cũ cho chỗ gọi hiện có.
- `src/components/roadmap/StageMap.tsx`, `Station.tsx` -- hiện trạm "đã bỏ qua" mờ.
- `src/data/roadmap/` -- `stage-*.ts` (`scoreGoal`, `cumulativeWords`), `lookup.ts`; `allLessons` theo thứ tự.
- Story 4 (cùng đợt, làm ngay trước): `src/lib/sessions/` (nhật ký `days[YYYY-MM-DD].minutes`), `src/pages/Session.tsx` (phần bài chính), `src/pages/Today.tsx`. Đọc code thật sau khi story 4 commit.
- `src/lib/srs/` -- đọc `srs.cards` để đếm thẻ đã học (`known: false`).
- `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (`SYNCED_KEYS`, `MERGERS`), `src/lib/updated-at.ts` -- mẫu thêm key đồng bộ.
- `src/index.css` -- biến màu theme; thêm màu nhấn theo Nhà qua `data-house` trên `<html>`.
- `src/pages/Lesson.tsx` -- thứ tự đoạn; áp "Ưu tiên".

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (+ test) -- version mới + `mergePlacement`.
- [x] `src/lib/placement/` (+ test) -- `PART_LIMITS`, `validateAttempt`, `estimateScores` (bảng nội suy), `placementFor(total)`, `houseFor(answers)`, `skillGaps(store, now)`, `weakestSkill`, `studyHours(sessions, now)`.
- [x] `src/lib/roadmap-progress.ts` (+ test) -- `startLessonId`, `skipped`.
- [x] `src/pages/SortingHat.tsx`, `src/app/routes.tsx`, `src/app/store-context.ts` -- form 7 Part + 4 câu hỏi, xem kết quả (điểm L/R/tổng, chặng xếp, Nhà), nút "Áp dụng xếp lớp".
- [x] `src/pages/Today.tsx`, `src/components/SkillGapCard.tsx`, `src/components/StudyClock.tsx` -- thẻ mời / bảng kỹ năng + đồng hồ giờ.
- [x] `src/pages/Session.tsx`, `src/pages/Lesson.tsx`, `StageMap`/`Station`, `src/index.css`, `src/app/AppShell.tsx` -- đoạn "Ưu tiên", trạm "đã bỏ qua", màu Nhà.

**Acceptance Criteria:**
- Given Huy nhập điểm lần đầu và chọn đáp án, when lưu, then thấy điểm L/R ước tính, chặng/bài được xếp, Nhà và màu nhấn đổi.
- Given đã làm Mũ, when mở Hôm nay, then thấy bảng 5 kỹ năng với mục tiêu và đồng hồ giờ so với 450 giờ/năm.

## Implementation Notes

- `skillGaps(store)` không nhận `now`: mục tiêu từ vựng chặng 2–3 tính theo vị trí bài (1000 + 60 × số tuần từ `s2-t5-w1`, kể cả tuần hiện tại), không theo lịch. Chặng hiện tại = chặng của bài học tiếp theo (đã tính `startLessonId`).
- Lần nhập điểm đầu tiên tự xếp `startLessonId`; các lần sau chỉ đổi qua "Áp dụng xếp lớp". `placement.updatedAt` chỉ đổi khi sửa Nhà / bài bắt đầu; mỗi lần làm có `updatedAt = takenAt` để gộp theo id.
- Bài tiếp theo: bài chưa xong đầu tiên từ `startLessonId`; xong hết phía sau thì quay về bài "bỏ qua" đầu tiên.
- Bảng nội suy tự đặt ở `src/lib/placement/scoring.ts` (L hơi dễ hơn R), làm tròn bội 5.
- Form Mũ: lần đầu cần cả điểm và 4 câu hỏi; các lần sau nhập riêng điểm hoặc riêng câu hỏi Nhà.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | edge (×2), blind | Gộp `placement`: cụm mới hơn có `startLessonId: null` (máy chỉ đổi Nhà) xoá bài bắt đầu đã xếp ở máy kia | medium | `mergePlacement` lấy cả cụm theo `updatedAt`; hai field chỉ được đặt, không bao giờ xoá về null | patch |
| 2 | edge | Kỹ năng yếu nhất là nghe thì đoạn giải trí 10' lên đầu bài với nhãn "Ưu tiên" | medium | Đoạn giải trí mặc định tag `listening`; `prioritizeSections` không loại nó | patch |
| 3 | verif-gap | Luật "chưa làm Mũ thì không đổi thứ tự" chỉ nằm trong hook, không test | medium | `useSkillBoard` gate `hasPlacement`; bỏ gate thì test vẫn pass | patch |
| 4 | verif-gap | Tự xếp bài ở lần nhập đầu chỉ ráp trong hook, không test | medium | `saveAttempt` tự tính `placementFor`; test luôn truyền id cứng | patch |
| 5 | verif-gap | Luật lưu form Mũ (lần đầu cần cả hai; sau đó riêng điểm/riêng Nhà) chỉ trong component | medium | `SortingHat.submit`; đổi điều kiện thì không test nào báo | patch |
| 6 | blind, edge | Đồng hồ giờ ghi "giờ phim/nhạc tính ×½" nhưng chỉ cộng phút buổi học | low | `studyHours` cộng `minutes`; phần giải trí ×½ đã nằm trong 25 phút. Sửa chữ | patch |
| 7 | blind | Bảng kỹ năng không hiện điểm mốc theo từng kỹ năng (CAP-3) | low | Chỉ hiện "mốc" tổng; thêm mốc L/R/ngữ pháp vào từng dòng | patch |
| 8 | blind | Ngữ pháp % viết cứng `30 + 16` | low | Dùng `PART_LIMITS` | patch |
| 9 | blind | Dòng phát âm "chưa có dữ liệu" vẫn là `role="meter"` 0% | low | Bỏ meter khi `gap === null` | patch |
| 10 | blind, edge | "Áp dụng xếp lớp" không báo kết quả; hiện nút dù không đổi gì (start null, xếp `s1-t1-w1`) | low | So với bài bắt đầu thực tế; báo đã áp dụng | patch |
| 11 | blind | Màu Nhà áp sau lần vẽ đầu (nháy màu mặc định) | low | `useEffect` → `useLayoutEffect` | patch |
| 12 | verif-gap | Bản đồ và Hôm nay có thể lệch nhau về bài tiếp theo (không test chung) | low | Không có môi trường test component; cần helper chung `roadmapProgressFor(store)` | defer |
| 13 | blind, verif-gap | Mới làm Mũ thì "Ưu tiên" hầu như luôn là từ vựng | false | Đúng khoảng cách thật (0 thẻ / mục tiêu 60); hết tuần đầu với 10 từ/ngày thì tự hết | reject |
| 14 | blind | Spec lệch Implementation Notes, Change Log trống | low | Sửa là sửa spec | reject |
| 15 | blind | `vocabularyTargetFor` trả 1000 khi id lạ | low | Chỉ gọi với id bài có thật | reject |
| 16 | blind | Lần nhập đầu dời bài bắt đầu của người đã có tiến độ, không hỏi | low | Bài đã xong vẫn sáng; không mất gì; Huy mới bắt đầu | reject |
| 17 | blind | Độ tương phản màu Nhà chưa có test | low | Agent đã đo ≥ 5,7:1; không có lỗi cụ thể | reject |
| 18 | edge | Hai máy nhập điểm cùng mili giây trùng id | low | Gần như không xảy ra | reject |
| 19 | edge | Kỹ năng yếu nhất không có đoạn nào trong bài thì không ưu tiên gì | low | Thêm luật chọn → reject | reject |
| 20 | edge | Ngày nhật ký "tương lai" do lệch đồng hồ được cộng | low | Hiếm, chỉ lệch vài phút | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px: form Mũ Phân Loại, kết quả, màu Nhà, bảng kỹ năng, bản đồ có trạm "đã bỏ qua"; không tràn ngang.
