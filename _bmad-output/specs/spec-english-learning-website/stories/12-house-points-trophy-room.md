---
title: 'Điểm Nhà, Phòng Cúp và huy chương 3 cấp'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: '7ccd72cc886129e289ff0c14626c851db98b4be7'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/hp-theme.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Điểm Nhà** tính lại từ nhật ký buổi học (story 4), không lưu riêng: mỗi ngày buổi chuẩn +10, ngày lười +5; mỗi lần chuỗi chạm 7, 14, 21… ngày liên tiếp thưởng thêm +20. Hiện kèm tên và màu Nhà (story 5); chưa có Nhà thì hiện "Chưa phân Nhà" và mời đội Mũ Phân Loại.
- **Huy chương** (đồng → bạc → vàng khi đạt 1 / 5 / 20 lần), đều tính lại từ dữ liệu có sẵn:
  - **Hermione:** số lần làm bài trắc nghiệm (mini test, test quay lại, O.W.L.) đúng 100% (`quizzes` của story 9; không tính lần "bỏ qua").
  - **Dumbledore:** số lần qua một kỳ O.W.L. (lần làm `kind: 'owl'` có `passed: true`, story 14 ghi; trước story 14 luôn 0).
  - **Neville:** số lần quay lại học sau khi gãy chuỗi = số ngày có buổi học mà ngày có buổi trước đó cách ≥ 2 ngày (bỏ lỡ ít nhất 1 ngày).
  - Hagrid/Sirius hiện ô "Sắp có" (Đợt 3).
- **Phòng Cúp** (tab có sẵn): điểm Nhà, chuỗi hiện tại và dài nhất, lưới huy chương (khoá/đồng/bạc/vàng, tiến độ "3/5 tới bạc").
- **Cú đưa thư:** khi một huy chương lên cấp mới mà máy chưa báo, lần mở app tiếp theo hiện hiệu ứng cú bay tới thả thư (SVG/CSS tự vẽ, ≤ 2 giây, chạm để đóng) kèm tên huy chương. Đã báo thì ghi vào key `trophies.seen[medalId:level]` (đồng bộ, để máy khác không báo lại). `prefers-reduced-motion` thì chỉ hiện thẻ, không bay.
- **Lumos:** dùng chung một hiệu ứng ánh sáng nhẹ (đã có ở story 9 khi trả lời đúng) cho lúc nhận huy chương; không thêm hiệu ứng nặng.

**Problem:** Streak chưa thành điểm Nhà, Phòng Cúp trống; phần thưởng nhỏ giữ động lực chưa có (CAP-20).

**Approach:** Hàm thuần tính điểm Nhà, chuỗi dài nhất và cấp huy chương từ nhật ký + lần làm bài; trang Phòng Cúp; một lớp thông báo cú đưa thư dựa trên `trophies.seen`.

## Boundaries & Constraints

**Always:**
- Store lên version kế tiếp: thêm `trophies: { seen: {} }`, vào `SYNCED_KEYS`, gộp theo mục (giữ mục có sẵn, thời điểm sớm hơn thắng).
- Điểm, chuỗi, cấp huy chương là hàm thuần có test, ngày theo giờ máy, thời gian qua `now`.
- Không trừ điểm, không mất huy chương (dữ liệu nguồn không bị xoá nên cấp không giảm).
- Asset tự vẽ "lấy cảm hứng", không logo/nhân vật gốc; tên huy chương chỉ là chữ.
- Tiếng Việt, 375px, theme + màu Nhà.

**Never:**
- Không làm Hagrid/Sirius, không âm thanh, không hiệu ứng toàn màn hình nặng.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Điểm cơ bản | 3 ngày chuẩn + 2 ngày lười, không liên tiếp đủ 7 | 40 điểm | N/A |
| Thưởng chuỗi | 7 ngày liên tiếp toàn buổi chuẩn | 70 + 20 = 90 | N/A |
| Chuỗi 14 | 14 ngày liên tiếp | Thưởng 2 lần (+40) | N/A |
| Gãy rồi nối | 7 ngày, nghỉ 1 ngày, 7 ngày | Thưởng 2 lần; Neville 1 lần | N/A |
| Hermione | 5 lần làm bài 100% | Bạc | N/A |
| Hermione bỏ qua | Lần comeback `skipped` | Không tính | N/A |
| Dumbledore | Chưa có O.W.L. | Khoá, tiến độ 0/1 | N/A |
| Cú đưa thư | Hermione vừa lên đồng, chưa có trong `seen` | Hiện cú + ghi `seen` | N/A |
| Đã báo ở máy khác | `seen` đồng bộ có mục đó | Không báo lại | N/A |
| Giảm chuyển động | `prefers-reduced-motion: reduce` | Chỉ hiện thẻ | N/A |
| Chưa có Nhà | `placement.house` null | "Chưa phân Nhà" + mời đội Mũ | N/A |
| Dữ liệu sai dạng | Ngày nhật ký / lần làm sai dạng | Bỏ qua khi tính | Không crash |

</frozen-after-approval>

## Code Map

- `src/lib/sessions/` (story 4) -- nhật ký ngày, `computeStreak`, `localDayKey`, `isSessionDay`.
- `src/lib/placement/` (story 5) -- `house`; `src/index.css` màu Nhà qua `data-house`.
- Story 9: `src/lib/quiz/`, `quizzes.attempts` (score, total, `kind`); hiệu ứng Lumos khi trả lời đúng (dùng lại component/CSS đó).
- `src/pages/TrophyRoom.tsx` -- đang placeholder.
- `src/app/AppShell.tsx` -- chỗ gắn lớp thông báo cú (một lần mỗi lần mở app).
- `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (`SYNCED_KEYS`, `MERGERS`, `mergeEntries` có `pick`).

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (+ test) -- version mới, `trophies`.
- [x] `src/lib/trophies/` (+ test) -- `housePoints(sessions)`, `longestStreak`, `medalProgress(store)` (Hermione/Dumbledore/Neville → count, level, next), `unseenLevelUps(store)`, `markSeen`.
- [x] `src/pages/TrophyRoom.tsx`, `src/components/trophies/*` (`MedalGrid`, `HousePointsCard`, `OwlPost`), `src/app/AppShell.tsx` -- trang và lớp thông báo.

**Acceptance Criteria:**
- Given đã học 7 ngày liền, when mở Phòng Cúp, then thấy điểm Nhà có thưởng chuỗi và chuỗi 7.
- Given vừa làm mini test 100% lần đầu, when quay lại app, then cú đưa thư báo huy chương Hermione đồng một lần, lần sau không báo lại.

## Implementation Notes

- Schema v10: `trophies: { seen: {} }`; mục `seen[medalId:level] = { updatedAt }` (thời điểm báo). Gộp `mergeSeen`: giữ mọi mục, trùng thì sớm hơn thắng. Sao lưu tự có `trophies` (BACKUP_KEYS = SYNCED_KEYS; thêm ENTRY_FIELD/ENTRY_VALID).
- Hermione tính lần làm hợp lệ có `total > 0`, `score === total`, không `skipped`, `kind` ∈ {thiếu, `comeback`, `owl`}; loại lạ bỏ qua.
- Lên nhiều cấp trước khi mở app (vd thẳng bạc) thì báo một lần cấp cao nhất; `markSeen` ghi cả các cấp thấp hơn.
- Cú đưa thư kiểm tra một lần mỗi lần mở app, sau 1,2 s (hoặc tối đa 5 s nếu đồng bộ đang chạy) để `seen` từ máy khác kịp kéo về; ghi `seen` ngay khi hiện.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge (×2), verif-gap | Cú có thể báo lại huy chương đã báo ở máy khác: chỉ chờ khi đúng `syncing`, mốc 5 s khởi động lại mỗi lần đổi trạng thái; chỉ kiểm một lần mỗi lần mount; logic không có test | medium | `useOwlPost`; đăng nhập/kéo lần đầu chậm hơn 1,2 s là kiểm trên dữ liệu local | patch |
| 2 | blind | Cú bị cắt bởi `overflow-hidden` của khung, gần như không thấy bay tới | medium | Khung chỉ cao bằng cú + thẻ | patch |
| 3 | edge | Neville có thể tụt cấp/khoá lại sau khi đồng bộ thêm một ngày lấp khoảng trống | medium | Spec: không mất huy chương; cấp tính lại từ khoảng trống | patch |
| 4 | blind | Danh sách kind của Hermione lặp và lệch `KNOWN_ATTEMPT_KINDS`; `passed` đọc qua ép kiểu | low | Story 14 phải nhớ sửa hai chỗ | patch |
| 5 | edge, blind | Nhiều thư cùng lúc chỉ hiện biểu tượng của thư đầu | low | `letters[0]` | patch |
| 6 | blind | Thẻ cú: tên nút đè tên huy chương, live region không được đọc, không có Escape | low | a11y | patch |
| 7 | verif-gap, blind | Sao lưu `trophies.seen` không có test khứ hồi; số "đã thêm" tính cả mục sổ sách nội bộ | low | Đổi tên field vẫn pass test | patch |
| 8 | blind | Hai định nghĩa chuỗi (hiện tại / dài nhất) không có test bất biến | low | Thêm test `longest >= current` | patch |
| 9 | blind | Lần mở đầu sau cập nhật báo nhiều huy chương cũ cùng lúc | false | Huy chưa được báo lần nào; báo một lần là đúng ý | reject |
| 10 | edge | Chế độ bộ nhớ tạm, chưa đăng nhập: cú báo lại mỗi lần mở | low | Hiếm (storage bị chặn) | reject |
| 11 | blind | `useTrophies` tính lại mỗi phút; khoá `seen` lạ được giữ | low | Hiệu năng/dọn dẹp nhỏ | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px với store giả lập: Phòng Cúp, cú đưa thư một lần, reduced-motion; không tràn ngang.
