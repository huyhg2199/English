---
title: 'Hôm nay ở Sân ga, Thư nhập học, Mũ Phân Loại chỉ chọn Nhà, lịch 12 tháng và ngày lười (CAP-2, CAP-3, CAP-5, CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '717bb7e6a40c97080a2c636f30618e72ab6cb45f'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/18-foundation-data-store-v13.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/21-session-plan-theory-first.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Mốc 750:** lịch 12 tháng đếm từ ngày qua hoặc bỏ qua Sân ga (`scheduleStartDate` của story 18). Mốc 750 dời khoảng 2–3 tuần, nhưng app không bao giờ hiện "lùi N tuần" vì Sân ga. Story này nối mốc đó vào `planFor`.
- **Kiểm tra cả 4 hàng trước (Soát vé):** đã làm ở story 20. Story này chỉ làm hai việc:
  - thêm link Soát vé vào thẻ Sân ga trên Hôm nay khi Soát vé còn `pending`;
  - khoá bằng test luật "Soát vé không tính là buổi học" (không giữ streak, không cộng điểm Nhà, không tính "đã học hôm nay").
  - Không khoá viên nào. Tiến độ bài và thẻ SRS cũ giữ nguyên.
- **Nhịp:** 1 viên mỗi buổi 30' và nút "Học tiếp viên sau" (story 21). Thẻ Sân ga trên Hôm nay hiện đúng viên mà buổi 30' sẽ chạy (`sessionPlan`).
- **Máy tính:** không làm ở story này (story 29–31). Không thêm lớp `lg:`/`xl:`.
- Claude chọn:
  - **Hôm nay khi đang ở Sân ga** (`isInFoundation`):
    - Thẻ chính `FoundationHero` gồm:
      - tiêu đề "Sân ga 9¾ — x/18 viên gạch" (`taughtCount`);
      - viên của buổi 30' kèm "học để làm gì" (`goalVi`) và số phút; khi buổi sẽ ôn thì ghi "Ôn lại: Fxx · …";
      - nút lớn "Bắt đầu buổi 30'" (`/session`);
      - link "Xem bức tường";
      - khi `needsPlacement` và còn hàng cần soát: link "Soát vé trước · 4 bài ngắn" (`PLACEMENT_HREF`); Soát vé đã làm dở (`placementStarted`) thì link ghi "Tiếp tục Soát vé · hàng X" như thẻ mời trên bức tường.
    - Ẩn: Bài hiện tại, `ScheduleCard`, lời mời Đo trình độ, `SkillGapCard`.
    - Giữ nguyên: dải nhắc, thẻ quay lại, kế hoạch O.W.L., thẻ streak, nút "Hôm nay lười (10')", `StudyClock` (vẫn chỉ hiện khi đã có điểm ETS, như cũ).
    - Chưa có Nhà thì hiện lời mời Mũ Phân Loại (4 câu), ở cả hai giai đoạn.
  - **Hôm nay sau Sân ga:** giữ y bố cục cũ. Chỉ đổi phần cuối trang:
    - chưa có Nhà → lời mời Mũ Phân Loại (4 câu);
    - đã có điểm ETS → `SkillGapCard` + `StudyClock` như cũ;
    - chưa có điểm ETS → thẻ "Đo trình độ (tuỳ chọn)".
  - **Thư nhập học:**
    - Route `/welcome`, trang `Welcome.tsx`, có 3 màn. Mỗi màn có "Tiếp" và "Bỏ qua thư".
    - Hôm nay chuyển sang `/welcome` khi `welcomeSeenAt` còn null và lượt đồng bộ đầu đã xong. Điều kiện "xong" giống cú đưa thư: dùng `owlPostReady` hoặc chờ quá 8 s, để máy thứ hai không hiện lại thư.
    - `markWelcomeSeen` được gọi ngay khi trang thư hiện, nên thư chỉ hiện một lần kể cả khi Huy rời trang giữa chừng. Mở thẳng `/welcome` thì vẫn đọc lại được.
    - Nút ở màn cuối:
      - chưa có Nhà → "Đội Mũ Phân Loại (4 câu)" `/sorting-hat`;
      - có Nhà và đang ở Sân ga → "Vào Sân ga 9¾" `/foundation`;
      - còn lại → "Về Hôm nay" `/`.
  - **Mũ Phân Loại** (`/sorting-hat`): chỉ 4 câu chọn Nhà.
    - Chưa có Nhà: nút "Đội Mũ Phân Loại". Có Nhà: nút "Đổi Nhà".
    - Sau khi lưu: hiện "Mũ chọn: Nhà X" và nút đi tiếp ("Vào Sân ga 9¾" khi đang ở Sân ga, không thì "Về Hôm nay").
    - Không còn ô điểm ETS. Link "Đo trình độ (tuỳ chọn)" chỉ hiện khi không ở Sân ga hoặc đã có điểm ETS.
  - **Đo trình độ** (`/do-trinh-do`, trang `Measure.tsx`):
    - Chuyển nguyên phần ETS từ `SortingHat.tsx` sang: form 7 Part, thẻ kết quả, "Áp dụng xếp lớp", danh sách các lần làm. Lần đầu nhập vẫn tự xếp bài bắt đầu như cũ.
    - Khi đang ở Sân ga, trang có thêm một dòng nhắc nhẹ "nên làm sau khi qua Sân ga". Trang không chặn gì.
    - Điểm ETS cũ vẫn là mốc.
  - **Lịch (`planFor`):** trả union theo `status`:
    - `'not-started'` khi `scheduleStartDate` null;
    - `'paused'` khi đã có ngày bắt đầu mà đang ở Sân ga (quay lại sau khi bỏ qua);
    - `'running'` cho mọi trường hợp còn lại.
    - Ngày bắt đầu = `scheduleStartDate`. Vẫn giữ luật cũ: xếp lớp ETS áp dụng muộn hơn thì bắt đầu từ ngày áp dụng. Ngày áp dụng cũng trượt theo cùng số ngày tạm dừng (Sân ga), để thời gian quay lại không thành trễ.
    - Không còn lấy ngày buổi học đầu tiên làm ngày bắt đầu.
    - Lúc `paused`, ngày bắt đầu trượt theo số ngày quay lại, nên số tuần trễ đứng yên.
  - **Dòng lịch trên Lộ trình:**
    - `not-started`: "Lịch 12 tháng bắt đầu khi bạn qua hoặc bỏ qua Sân ga 9¾." (không ngày, không nhãn).
    - `paused`: ngày dự kiến kèm nhãn "tạm dừng".
    - `running`: như cũ.
  - **Ngày lười khi đang ở Sân ga:** chốt chế độ lúc mở trang, không gọi tin. Có 2 bước:
    1. Ôn viên gạch:
       - **ôn nhanh** viên xong gần nhất (`lastDoneAt` muộn nhất, có nội dung): màn giải thích + so sánh Việt–Anh;
       - chưa xong viên nào thì **xem trước** phần giải thích của viên tiếp theo; không có viên tiếp theo thì **ôn nhanh** viên có nội dung đầu tiên của hàng đã xong (viên đã qua, giống "Ôn lại" trên thẻ Sân ga);
       - không có viên nào thì thẻ "Các viên tiếp theo đang soạn";
       - có link "Mở cả viên". Bước này không gọi `completeBrick`.
    2. 3 từ: `FlashcardSession` với `limit` 3, `preferNew`, danh sách `'ngsl'`, rồi "Xong buổi" ghi `record('lazy')` như cũ.
    - Nút "Sang 3 từ" bấm được ngay, không bắt đọc hết.
    - Sau Sân ga, ngày lười giữ nguyên luồng tin.

**Problem:**
- Hôm nay ngày 1 có 6 thẻ mà không chỉ việc nào làm trước. Trang vẫn hiện bài T1, ngày dự kiến 750 và lời mời nhập điểm ETS, dù Huy đang ở Sân ga.
- Mũ Phân Loại bắt nhập điểm đề ETS ngay ngày 1.
- Lịch đếm từ buổi học đầu tiên, nên 2–3 tuần ở Sân ga sẽ thành "lùi N tuần".
- Ngày lười ở Sân ga vẫn bắt đọc tin Hacker News.
- Chưa có Thư nhập học.

**Approach:**
- Tạo hàm thuần `todayView`/`welcome` ở `src/app/today-view.ts` để quyết định thẻ nào hiện. Thêm thẻ `FoundationHero`, trang `Welcome`.
- Tách `SortingHat` thành trang chọn Nhà và trang `Measure`.
- `planFor` đọc `scheduleStartDate` và trả `status`.
- `lazyFoundationBrick` trong `plan.ts` chọn viên cho ngày lười. Thêm nhánh Sân ga cho `LazySession`.
- Thêm test cho luật Soát vé không tính là buổi học.

## Boundaries & Constraints

**Always:**
- Định nghĩa "đang ở Sân ga", "viên tiếp theo", `taughtCount` và ngày bắt đầu lịch đều lấy từ `@/lib/foundation` (story 18) và `sessionPlan` (story 21). Không viết lại luật.
- Các hàm sau là hàm thuần có test, nhận thời gian qua tham số: chọn thẻ Hôm nay, điều kiện hiện thư, nút màn cuối thư, `planFor`, `roadmapStartDate`, `lazyFoundationBrick`, kiểm Mũ 4 câu.
- Không khoá, không phạt:
  - mọi trang mới đều rời được bất cứ lúc nào;
  - thẻ Sân ga và thư không chặn bức tường, bài hay Đo trình độ;
  - ngày lười Sân ga vẫn giữ streak (`record('lazy')`);
  - Mũ và Đo trình độ không xoá Nhà, điểm cũ hay bài bắt đầu.
- `src/lib/schedule` được import `@/lib/foundation`. `@/lib/foundation` vẫn không import `@/lib/schedule` (không có vòng import).
- Dữ liệu cũ: Nhà, điểm ETS, `startLessonId` và các lần làm giữ nguyên. Người đã có Nhà không bị Mũ hỏi lại.
- Tiếng Việt, giọng nhẹ. Không chữ "trễ", "lùi" hay "trượt" ở bất kỳ trạng thái Sân ga nào. Không dùng màu `destructive` ngoài lỗi nhập liệu của form (như cũ).
- Giao diện 375px:
  - các trang không thuộc story này hiện y như trước;
  - Hôm nay sau Sân ga chỉ đổi phần lời mời cuối trang theo Decisions;
  - Lộ trình chỉ đổi dòng lịch khi `not-started`/`paused`;
  - không cuộn ngang.

**Never:**
- Không làm:
  - +5 điểm Nhà, màn "Qua bức tường" hay huy chương "Lên tàu Năm 1" (story 26);
  - số từ mới 5/8/10, thẻ "Làm quen" hay cổng IPA (story 23, 24);
  - lời mời ôn viên gạch (story 28);
  - test quay lại khi ở Sân ga.
- Không bỏ nút "Làm bài đầu vào" trong `LessonContentParts.tsx` (story 27).
- Không đổi shape store, migration, luật gộp, `scheduleStartDate`, `recordSession`, `SESSION_MINUTES`, `sessionPlan`/`resolveSessionPlan`, BrickPlayer hay trang Soát vé.
- Không thêm `lg:`/`xl:`, phím tắt hay thanh trên cùng (story 29–31).
- Không gọi `resumeFoundation` từ Hôm nay, thư, Mũ hay ngày lười.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Hôm nay ngày 1 | Store mới, chưa Nhà, Soát vé `pending` | Hiện: thẻ Sân ga "0/18 viên gạch", F01 + `goalVi` + "6'", nút 30', link Soát vé, lời mời Mũ (4 câu). Ẩn: Bài hiện tại, ngày dự kiến 750, Đo trình độ, bảng kỹ năng | N/A |
| Hôm nay dữ liệu cũ | v12 nâng cấp: có Nhà, có điểm ETS, `startLessonId`, đang học T1 | Thẻ Sân ga, `StudyClock`. Không lời mời Mũ, không bảng kỹ năng, không Bài hiện tại, không lịch. Nhà, điểm, bài bắt đầu y nguyên | N/A |
| Hàng qua Soát vé | `rows.A.passed`, chưa xong viên nào, F07+ đang soạn | Thẻ "6/18", "Ôn lại: F01 · …" (giống `sessionPlan`) | Không viên nào có nội dung → "Các viên tiếp theo đang soạn" + link bức tường, nút 30' vẫn có |
| Soát vé xong | Soát vé `done` | Không có link Soát vé | N/A |
| Hôm nay sau Sân ga | Đã bỏ qua, có Nhà, chưa có ETS | Như bố cục cũ (Bài hiện tại, ngày dự kiến "đúng hạn") + thẻ "Đo trình độ (tuỳ chọn)"; không thẻ Sân ga | Chưa có Nhà → thêm lời mời Mũ |
| Thư lần đầu | `welcomeSeenAt` null, đồng bộ xong | Mở Hôm nay → `/welcome`, `welcomeSeenAt` ghi ngay; 3 màn; màn 3 dẫn tới Mũ (chưa Nhà) / Sân ga (có Nhà) | Rời giữa chừng → không hiện lại |
| Thư máy thứ hai | Máy A đã xem; máy B mới đăng nhập, đồng bộ chưa xong | Chờ lượt đồng bộ đầu (hoặc 8 s) rồi mới quyết; sau khi kéo về thì không hiện | Không cấu hình Supabase → quyết ngay |
| Mũ 4 câu | Chưa Nhà, trả lời đủ 4 câu | Lưu Nhà, "Mũ chọn: Nhà X", nút "Vào Sân ga 9¾"; không hỏi điểm ETS | Thiếu câu → "Trả lời đủ 4 câu hỏi để Mũ chọn Nhà (còn n câu)", không lưu |
| Đo trình độ | Nhập đủ 7 Part hợp lệ, lần đầu | Lưu lần làm, tự xếp bài bắt đầu, thẻ kết quả; bảng kỹ năng có dữ liệu | Ô sai → báo lỗi từng ô như cũ, không lưu |
| Lịch chưa bắt đầu | Đang ở Sân ga, chưa từng bỏ qua, đã học 10 buổi | `planFor` → `{ status: 'not-started' }`; Lộ trình: "Lịch 12 tháng bắt đầu khi bạn qua hoặc bỏ qua Sân ga 9¾." | N/A |
| Không lùi sau 3 tuần Sân ga | Buổi Sân ga ngày 1–21, qua tường ngày 22 | Ngày 22: `running`, `startDate` = ngày 22, `weeksLate` 0, mốc gốc = ngày 22 + 7 × 48. Ngày 28: vẫn 0 | N/A |
| Bỏ qua rồi quay lại | Bỏ qua ngày 3, quay lại ngày 10 | Ngày 12: `paused`, `startDate` ngày 5 (không `not-started`). Ngày 40: `weeksLate` bằng lúc ngày 10. Bỏ qua lại ngày 40 → `running`, thời gian quay lại không thành trễ | N/A |
| Bỏ qua rồi qua tường | Bỏ qua ngày 3, học tiếp trên tường (không bấm Quay lại), qua tường ngày 20 | `startDate` = ngày 3 | N/A |
| ETS áp dụng muộn | Bỏ qua ngày 2, áp dụng xếp lớp ngày 23 | `startDate` = ngày 23, `weeksLate` 0 | N/A |
| Ngày lười Sân ga: ôn | F01, F02 xong, F02 `lastDoneAt` muộn nhất | Bước 1 "Ôn nhanh: F02 · …" (giải thích + so sánh), không gọi tin; bước 2: 3 thẻ → "Xong buổi" ghi `lazy`, streak giữ | Không có từ / lỗi bộ từ → vẫn có "Xong buổi" |
| Ngày lười Sân ga: xem trước | Chưa xong viên nào | "Xem trước: F01 · …" chỉ màn giải thích; F01 không được đánh dấu xong | Không viên nào → thẻ "đang soạn", vẫn sang 3 từ |
| Ngày lười sau Sân ga | Đã bỏ qua | Luồng tin như cũ | N/A |
| Soát vé không là buổi học | Làm đủ 4 hàng Soát vé hôm nay, chưa học buổi nào | `sessions` không đổi; streak 0; điểm Nhà 0; `statusFor().studied` false; dải nhắc vẫn hiện; Hôm nay không có "Đã học hôm nay" | N/A |

</frozen-after-approval>

## Code Map

**Hôm nay**
- `src/pages/Today.tsx` -- hiện có:
  - `SortingHatInvite` (28-46), mời nhập điểm + Nhà, cần sửa câu chữ;
  - thẻ "Bài hiện tại" (152-171), `ScheduleCard` (173), khối `placed ? SkillGap+StudyClock : SortingHatInvite` (175-182), cần chuyển sang dùng `todayView`;
  - nút 30' (136-142), chuyển vào thẻ `FoundationHero` khi ở Sân ga.
- `src/app/store-context.ts`:
  - `usePlacement` (`done` = có điểm ETS, `placement.house`);
  - `useFoundation` (`state`, `needsPlacement`, `placementRow`);
  - `useSchedule` (440), trả kiểu `Plan` mới;
  - `useOwlPost` (521): tách logic chờ đồng bộ + 8 s thành `useFirstSyncReady()` để `useWelcome` dùng lại.
- `src/app/owl-post-gate.ts` -- `owlPostReady`, `OWL_POST_DEADLINE_MS`. Dùng lại, không sửa.
- `src/lib/sessions/plan.ts` -- `sessionPlan`, `reviewNote`, `latestDoneBrick`/`foundationBrick` (nội bộ). Thêm `lazyFoundationBrick`. `src/lib/foundation`: `foundationState`, `isInFoundation`, `needsPlacement`, `readFoundation`, `markWelcomeSeen`, `scheduleStartDate`, `brickHref`. `src/lib/foundation/row-test.ts`: `nextPlacementRow`, `PLACEMENT_HREF`.
- `src/data/foundation` -- `getBrickMeta` (`title`, `goalVi`, `minutes`). Nội dung lấy từ `content.ts`: `hasBrickContent`, `getBrick`. `hasContent` truyền vào qua tham số như story 21.
- Mẫu hàm thuần ở tầng app có test node: `src/app/gate-view.ts`, `storage-notice.ts`.

**Mũ / Đo trình độ**
- `src/pages/SortingHat.tsx` -- hiện có:
  - form ETS (`PartInputs` 39-92 và thẻ form 202-237), thẻ kết quả (155-200), danh sách lần làm (279-310): chuyển sang `Measure.tsx`;
  - câu Nhà (239-276): giữ lại.
- `src/lib/placement/scoring.ts` -- `decidePlacementSave` (163) gộp ETS + Nhà. Thay bằng `decideHouseSave`. `validateAttempt` dùng cho Đo trình độ. Test ở `placement.test.ts:396-435`.
- `src/components/SkillGapCard.tsx:87` -- link "Nhập điểm lần mới / đổi Nhà" → `/do-trinh-do`. `HousePointsCard.tsx:48` giữ `/sorting-hat` (chọn Nhà); khi đã có Nhà thì thêm link nhỏ "Đổi Nhà" → `/sorting-hat` (lối vào duy nhất để đổi Nhà sau khi SkillGapCard chuyển sang Đo trình độ).
- `src/app/routes.tsx`, `src/app/nav-items.ts` (+ `nav-items.test.ts:36-41`) -- thêm route `welcome`, `do-trinh-do`, và thêm hai route này vào `alsoActiveFor` của tab Hôm nay.

**Lịch**
- `src/lib/schedule/schedule.ts` -- `roadmapStartDate` (dùng `sessionDates[0]` + luật ETS áp dụng muộn), `planFor`, `Plan`, `planStatusLabel`, `planConsequence`. `sessionDates`, `daysBetween`, `addDays` được `comeback`, `owl` và `Quiz.tsx` dùng, giữ nguyên.
- `src/lib/schedule/schedule.test.ts` -- các ca hiện có dựng lịch bằng `started()` (buổi học ngày 02/11). Sau story, store đó là `not-started`, nên `started()` phải thêm `skipFoundation(…, at(2, 20))`. Kỳ vọng của các ca cũ giữ nguyên.
- `src/components/ScheduleCard.tsx` -- `ScheduleCard` và `ScheduleLine` (dùng ở `Roadmap.tsx:32`).

**Ngày lười**
- `src/pages/LazySession.tsx` -- `LazySession` gọi `fetchLazyNews` trong effect (132-141). Thêm nhánh Sân ga trước effect. `NewsCard`, `OfflineCards` và `finish` (keptFull) dùng lại.
- `src/components/foundation/BrickScreen.tsx` -- `ReviewExplain` (173-183) nội bộ, render `ExplainBody` + `ContrastBody`. Export thêm `BrickRecap`. DOM của lời mời < 60% phải giữ nguyên.
- `src/components/flashcards/FlashcardSession.tsx` -- props `limit`, `preferNew`, `firstList`, `renderDone`, `errorExtra`.

**Soát vé**
- `src/lib/foundation/row-test.ts` (`recordRowTest`) và `row-test.test.ts:78-90, 246-250` đã kiểm `sessions` không đổi. Story này thêm kiểm cho các chỉ số suy ra: `computeStreak`, `housePoints` (`src/lib/trophies/points.ts`), `statusFor` (`src/lib/gist`), `showReminderBanner` (`src/lib/reminders`).
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`, không có test component. `npm test` chạy với `TZ=Asia/Ho_Chi_Minh`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/schedule/schedule.ts` -- làm như sau:
  - Kiểu `Plan = { status: 'not-started' } | ActivePlan`, trong đó `ActivePlan` = các field cũ + `status: 'running' | 'paused'`.
  - `roadmapStartDate(store, now): Date | null`:
    - `scheduleStartDate`;
    - nếu đã áp dụng xếp lớp ETS muộn hơn thì lấy ngày áp dụng;
    - null khi chưa bắt đầu.
  - `planFor`:
    - null → `{ status: 'not-started' }`;
    - còn lại tính như cũ, `status` = `isInFoundation ? 'paused' : 'running'`.
  - `planStatusLabel`, `planConsequence` nhận `ActivePlan`. `planStatusLabel` trả "tạm dừng" khi `paused`.
  - Cập nhật JSDoc.
- [x] `src/lib/schedule/schedule.test.ts` -- làm như sau:
  - `started()` thêm `skipFoundation` ngày 02/11, các ca cũ giữ kỳ vọng;
  - mỗi dòng Matrix từ "Lịch chưa bắt đầu" tới "ETS áp dụng muộn" một ca;
  - ca `planStatusLabel` không bao giờ ra "lùi" khi `paused` do thời gian quay lại.
- [x] `src/components/ScheduleCard.tsx` -- `ScheduleCard` nhận `ActivePlan`. `ScheduleLine` nhận `Plan`:
  - `not-started`: câu "Lịch 12 tháng bắt đầu khi bạn qua hoặc bỏ qua Sân ga 9¾.";
  - `paused`: ngày + nhãn "tạm dừng";
  - `running`: y như cũ.
- [x] `src/app/today-view.ts` (+ `today-view.test.ts`) -- tạo các hàm sau:
  - `todayView(store, hasContent)` trả về một trong hai dạng:
    - `{ mode: 'foundation', hero: { taughtCount, totalBricks, brickId, review, placementHref }, showSortingHat, showStudyClock }`;
    - `{ mode: 'roadmap', showSortingHat, showMeasureInvite, showSkillGap, showStudyClock }`.
    - Viên của thẻ lấy từ `sessionPlan`.
  - `shouldShowWelcome(store, ready)`;
  - `welcomeFinalAction(store)` trả `{ label, to }`.
  - Test: mỗi dòng Matrix "Hôm nay …", "Hàng qua Soát vé", "Soát vé xong", "Thư lần đầu/máy thứ hai" (phần thuần), cùng 3 nhánh nút màn cuối.
- [x] `src/app/store-context.ts` -- làm như sau:
  - `useFirstSyncReady()`, tách từ `useOwlPost` (hành vi cú đưa thư không đổi);
  - `useWelcome()` trả `{ show, markSeen }`;
  - `useSchedule` trả `Plan` mới.
- [x] `src/components/foundation/FoundationHero.tsx`, `src/pages/Today.tsx` -- thẻ Sân ga như Decisions. Today:
  - render theo `todayView`;
  - `useWelcome().show` thì `<Navigate to="/welcome" replace />`;
  - `SortingHatInvite` đổi câu thành "4 câu hỏi vui để chọn Nhà";
  - thêm `MeasureInvite`;
  - `ScheduleCard` chỉ render khi `plan.status !== 'not-started'`.
- [x] `src/pages/Welcome.tsx` -- 3 màn (nội dung ở Design Notes). Thêm:
  - dấu "1/3";
  - nút "Tiếp" và "Bỏ qua thư";
  - effect lúc mount gọi `markSeen`;
  - màn 3 dùng `welcomeFinalAction`.
- [x] `src/lib/placement/scoring.ts` (+ `placement.test.ts`) -- thay `decidePlacementSave` bằng `decideHouseSave(answers)`: đủ 4 câu → `{ ok, house }`, thiếu → lỗi `house`. Cập nhật ca test.
- [x] `src/pages/SortingHat.tsx`, `src/pages/Measure.tsx` -- tách như Decisions. Measure dùng `validateAttempt` + `saveAttempt` + `applyPlacement`, giữ nguyên DOM của các khối được chuyển sang.
- [x] `src/components/SkillGapCard.tsx` -- link sang `/do-trinh-do`, chữ "Đo trình độ lần mới".
- [x] `src/app/routes.tsx`, `src/app/nav-items.ts` (+ `nav-items.test.ts`) -- route `welcome`, `do-trinh-do`; tab Hôm nay sáng ở cả hai. Test thêm hai path.
- [x] `src/lib/sessions/plan.ts` (+ `plan.test.ts`) -- `lazyFoundationBrick(store, hasContent)`:
  - trả `{ brickId, mode: 'review' }` cho viên xong gần nhất có nội dung;
  - không có thì `{ brickId, mode: 'preview' }` cho viên tiếp theo, rồi đến viên có nội dung đầu tiên của hàng đã xong;
  - không có gì thì `null`.
  - Test hai dòng Matrix "Ngày lười Sân ga" + ca `null`.
- [x] `src/components/foundation/BrickScreen.tsx` -- export `BrickRecap({ brick, contrast: boolean })`. `ReviewExplain` dùng lại `BrickRecap` mà DOM không đổi.
- [x] `src/pages/LazySession.tsx` -- nhánh `FoundationLazy`, chốt bằng `useState` lúc mount theo `state.status === 'in-foundation'`:
  - bước 1: `BrickRecap` + "Mở cả viên" + "Sang 3 từ";
  - bước 2: `FlashcardSession` (`limit` 3, `preferNew`, `firstList` `'ngsl'`) + "Xong buổi" (dùng lại `finish`).
  - Nhánh tin không đổi.
- [x] `src/lib/foundation/row-test.test.ts` -- ca "Soát vé không là buổi học": làm đủ 4 hàng `placement` trong một ngày, rồi kiểm:
  - `computeStreak` 0, `housePoints(...).total` 0;
  - `statusFor(...).studied` false;
  - `showReminderBanner` true (store có giờ nhắc, đã qua giờ).

**Acceptance Criteria:**
- Given người dùng mới mở app lần đầu, when vào Hôm nay, then:
  - thấy Thư nhập học 3 màn, màn cuối dẫn tới Mũ 4 câu;
  - chọn Nhà xong thì "Vào Sân ga 9¾";
  - quay lại Hôm nay thì không thấy thư nữa, chỉ có một thẻ Sân ga với F01 và nút 30';
  - không có ngày dự kiến 750 hay lời mời nhập điểm ETS.
- Given dữ liệu cũ đang học T1 (có Nhà, điểm ETS), when nâng cấp và mở app, then:
  - thư hiện một lần;
  - Hôm nay có thẻ Sân ga;
  - Lộ trình ghi "Lịch 12 tháng bắt đầu khi bạn qua hoặc bỏ qua Sân ga 9¾.";
  - không chỗ nào hiện "lùi";
  - `/do-trinh-do` vẫn có các lần làm cũ.
- Given đã bỏ qua Sân ga, when mở Hôm nay, then bố cục giống trước story (Bài hiện tại, ngày dự kiến 750 "đúng hạn"), và ngày lười chạy luồng tin.
- Given đang ở Sân ga và đã xong F02, when bấm "Hôm nay lười (10')", then thấy ôn nhanh F02, học 3 từ, "Xong buổi" giữ streak, không có request tới HN hay Google AI Blog.
- Given màn hình 375px, when mở `/`, `/welcome`, `/sorting-hat`, `/do-trinh-do`, `/session/lazy` và `/roadmap` ở cả trạng thái Sân ga lẫn sau Sân ga, then không có cuộn ngang.

## Implementation Notes

- **Files:** `src/lib/schedule/schedule.ts` (+ test); `src/components/ScheduleCard.tsx`; `src/app/today-view.ts` (+ `today-view.test.ts`, mới); `src/app/store-context.ts` (`useFirstSyncReady`, `useWelcome`); `src/components/foundation/FoundationHero.tsx` (mới), `src/pages/Today.tsx`; `src/pages/Welcome.tsx` (mới); `src/lib/placement/scoring.ts` (+ `placement.test.ts`); `src/pages/SortingHat.tsx`, `src/pages/Measure.tsx` (mới); `src/components/SkillGapCard.tsx`; `src/app/routes.tsx`, `nav-items.ts` (+ test); `src/lib/sessions/plan.ts` (+ test); `src/components/foundation/BrickScreen.tsx`; `src/pages/LazySession.tsx`; `src/lib/foundation/row-test.test.ts`.
- **Lịch:** `roadmapStartDate` trả `Date | null` (= `scheduleStartDate`, luật ETS áp dụng muộn giữ nguyên). `Plan = { status: 'not-started' } | ActivePlan`. `planStatusLabel` trả "tạm dừng" khi `paused`. `planConsequence` có câu riêng cho `paused` (không nhắc trễ). `started()` trong test cũ thêm `skipFoundation` ngày 02/11, kỳ vọng giữ nguyên. Hai ca cũ dựa vào "chưa học buổi nào → hôm nay" đổi sang luật mới (null / bỏ qua hôm nay). Thêm 6 ca theo Matrix, trong đó có ca quay lại khi đã trễ 1 tuần: số tuần đứng yên, nhãn luôn "tạm dừng".
- **`today-view.ts`:** `todayView`, `shouldShowWelcome`, `welcomeFinalAction`. Thêm `sortingHatNextAction` và `showMeasureLink` (hàm thuần cho trang Mũ). Link Soát vé dựa vào `nextPlacementRow` (đã bao `needsPlacement`).
- **Hôm nay ở Sân ga:** `FoundationHero` đứng trước thẻ streak. Nút 30' nằm trong thẻ. Nút "Hôm nay lười" giữ chỗ cũ. Sau Sân ga: bố cục cũ, cuối trang là Mũ / Đo trình độ / bảng kỹ năng + đồng hồ.
- **Thư:** "Bỏ qua thư" có ở cả 3 màn, dẫn về `/`. `markSeen` gọi trong effect lúc mount.
- **Mũ / Đo trình độ:** `decideHouseSave` thay `decidePlacementSave` và bỏ hai kiểu `PlacementForm*`. Sau khi lưu, Mũ thay form bằng thẻ "Mũ chọn: Nhà X" kèm nút đi tiếp. Measure giữ nguyên DOM các khối chuyển sang. Chỉ đổi mô tả form ("Bỏ trống nếu chỉ muốn đổi Nhà" bỏ đi vì trang không còn câu Nhà) và nhãn nút submit ("Lưu điểm mốc" / "Lưu lần làm mới").
- **Ngày lười Sân ga:** chế độ và viên được chốt bằng `useState` lúc mount. Effect tin return sớm khi ở Sân ga (không gọi `fetchLazyNews`). Tách `ThreeWords` từ `OfflineCards` để dùng lại (DOM của nhánh offline không đổi).
- **Kiểm chứng:** `npm run lint`, `npm test` (57 file, 1127 test sau review), `npm run build` đều pass (`check-precache` OK; cảnh báo chunk size có từ trước). Không có file đổi trong `src/lib/storage`, `src/lib/sync`, `src/lib/backup`, `src/data/foundation/bricks`, `public/`, `src/lib/foundation/foundation.ts`.
- **Chưa làm / rủi ro:**
  1. Phần UI (Today, Welcome, SortingHat, Measure, LazySession, FoundationHero) không có test tự động (Vitest env `node`). Đã chạy kiểm tra tay bằng headless Chrome 375px ở bước review (58/58 PASS, không lỗi JS; xem Review Triage Log).
  2. Lỗi có từ trước, không sửa ở story này: `setHouse` cũng bump `placement.updatedAt`. Nên khi đã có `startLessonId`, đổi Nhà muộn hơn sẽ dời ngày bắt đầu lịch theo luật "ETS áp dụng muộn".
  3. Hôm nay hiện bố cục thường cho tới khi lượt đồng bộ đầu xong (≤ 8 s), rồi mới chuyển sang `/welcome`.

## Spec Change Log

- **2026-11-06, review (Huy cho phép chạy liên tục):**
  - Finding: link Soát vé trên thẻ Sân ga luôn ghi "4 bài ngắn" kể cả khi chỉ còn hàng D. Sửa Intent: làm dở thì ghi "Tiếp tục Soát vé · hàng X" (dùng `placementStarted`, như thẻ mời trên bức tường của story 20). Tránh: chữ sai số bài.
  - Finding (edge): bỏ qua Sân ga, áp dụng xếp lớp ETS muộn, rồi quay lại Sân ga → ngày áp dụng đứng yên trong khi hôm nay chạy, nên thời gian quay lại thành "lùi N tuần" khi bỏ qua lại. Hai câu của Intent ("luật ETS áp dụng muộn" và "lúc paused số tuần trễ đứng yên") mâu thuẫn ở ca này. Sửa: ngày áp dụng trượt theo cùng số ngày tạm dừng. Store không lưu từng lần tạm dừng nên lần tạm dừng trước ngày áp dụng cũng được cộng (chỉ làm mốc rộng hơn, không bao giờ trễ hơn). Tránh: Sân ga thành trễ. Không đổi shape store hay `scheduleStartDate`.
  - Finding: ngày lười Sân ga gọi viên đã qua bằng Soát vé là "Xem trước: viên tiếp theo", trong khi thẻ Sân ga ghi "Ôn lại". Sửa Intent: nhánh "không có viên tiếp theo" là ôn nhanh (giải thích + so sánh).
  - Finding (edge): sau khi SkillGapCard chuyển link sang Đo trình độ, người đã có Nhà không còn lối nào trong app tới nút "Đổi Nhà". Sửa Code Map: HousePointsCard (Phòng Cúp) có link "Đổi Nhà" khi đã có Nhà.
  - KEEP: toàn bộ phần còn lại của code story 22 giữ nguyên.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Ca "Bỏ qua rồi qua tường" không kiểm `weeksLate`; ngày 21/11 ra "lùi 1 tuần" | false | Matrix chốt `startDate` = ngày bỏ qua. Sau khi bỏ qua, lịch `running` và Hôm nay ở chế độ lộ trình. Học tường mà không bấm Quay lại là thời gian lộ trình theo lựa chọn của người học, không phải thời gian ở Sân ga. `scheduleStartDate` thuộc story 18 (Never: không đổi). | reject |
| 2 | blind | Ngày lười: hàng A qua Soát vé, chưa xong viên → "Xem trước: F01 / viên tiếp theo", trong khi thẻ Sân ga ghi "Ôn lại: F01" | low | `lazyFoundationBrick` trả `preview` ở nhánh hàng đã xong (`plan.ts`), còn `foundationBrick` trả `review: true`. Mô tả "Xem trước viên tiếp theo" sai với viên đã qua. | patch: nhánh này trả `review`, mô tả "Ôn nhanh một viên đã qua", sửa test + Intent |
| 3 | blind | Link "Soát vé trước · 4 bài ngắn" cố định số 4 khi đã làm dở | low | `FoundationHero.tsx` viết cứng chuỗi. Khi đã có kết quả hàng A–C vẫn ghi 4. Bức tường đã có mẫu `placementStarted` → "Tiếp tục Soát vé · hàng X". | patch: thêm `placementContinueRow` vào hero, test, sửa Intent |
| 4 | blind | `useFirstSyncReady` đếm 8 s từ lúc mount, Hôm nay mount lại thì đếm lại | low | Đúng là hạn đếm theo mount. Chỉ ảnh hưởng khi đồng bộ treo mãi, và thư chỉ hiện một lần (`welcomeSeenAt` ghi khi hiện). JSDoc của `useOwlPost` vẫn đúng vì AppShell mount một lần lúc mở app. Sửa phải thêm state cấp module. | reject |
| 5 | blind | Welcome: đổi màn không chuyển focus, nút Tiếp đổi thành Link; không có nút lùi | low | Focus rơi về `body` ở màn 3 khi dùng bàn phím. Huy dùng điện thoại cảm ứng, Intent không yêu cầu nút lùi. Sửa phải thêm ref + effect. | reject |
| 6 | blind | Lời thư lệch Design Notes; thư 3 "khi bạn lên tàu" bỏ sót đường bỏ qua | low | Thư 3 nói lịch chỉ đếm khi "lên tàu", trong khi `ScheduleLine` nói "qua hoặc bỏ qua". Câu thêm ở thư 1 đúng với thứ tự bước của cả hai loại buổi (`FOUNDATION_STEPS`, `LESSON_STEPS`). | patch: thư 3 "qua (hoặc bỏ qua) Sân ga"; Design Notes ghi bản cuối |
| 7 | blind | Nhánh `paused`: câu `planConsequence` không bao giờ hiện; ngày dự kiến trượt cạnh "tạm dừng"; JSDoc ScheduleCard cũ | low | Câu `paused` thật sự không hiện (ScheduleCard chỉ có ở mode `roadmap`), nhưng Implementation Notes yêu cầu nó. Ngày trượt cạnh "tạm dừng" đúng theo Intent và Design Notes, không phải lỗi. JSDoc thì cũ thật. | patch: sửa JSDoc ScheduleCard; phần còn lại reject |
| 8 | blind | Câu "Muốn học thêm thì cứ bắt đầu lại" nằm dưới nút lười, xa nút 30' trong thẻ Sân ga | low | Câu vẫn ở cùng màn, chỉ cách thẻ Sân ga một thẻ streak. Chỉ là chuyện vị trí. Muốn sửa gọn phải truyền thêm prop vào hero. | reject |
| 9 | blind | `setHouse` bump `placement.updatedAt` nên đổi Nhà dời ngày bắt đầu lịch | medium | Lỗi có từ trước (rủi ro 2 trong Implementation Notes). Story này chỉ làm nút "Đổi Nhà" dễ thấy hơn. | defer |
| 10 | blind | Thiếu test `shouldShowWelcome` cho signed-out/error/pending/outdated; vòng lặp khi `markWelcomeSeen` không lưu được | false | `owl-post-gate.test.ts` đã có ca signed-out và idle/error/outdated/pending, còn `shouldShowWelcome` chỉ AND với `ready`. Ở chế độ `memory`, `saveStore` vẫn gán `loaded.store = next`, nên trong phiên không lặp. Mở app lại thì store mới hoàn toàn (thư hiện lại là đúng). | reject |
| 11 | blind | Test "Hôm nay ngày 1" kiểm `getBrickMeta` chứ không kiểm phần render; UI không có test tự động | low | Đúng. Đã bù bằng headless 375px: "BUỔI HÔM NAY · 6'", F01 + goalVi, "Ôn lại: F01". Repo không có harness component. | reject (đã kiểm tay) |
| 12 | blind | Mũ sau khi lưu không có "Trả lời lại" | low | Rời trang rồi vào lại là có form "Trả lời lại để đổi Nhà". Lối vào đổi Nhà đã có (xem #15). | reject |
| 13 | blind | Sổ sách spec: status in-progress, Triage Log trống, chưa chạy check 375px | low | Đúng ở thời điểm review. | patch: bước này điền Triage Log, chạy headless, đặt status done |
| 14 | edge | Storage memory/read-only → thư hiện lại mỗi lần mở app | low | `memory` thì cả store mới mỗi lần mở (streak, Nhà… cũng mất), nên thư hiện lại là nhất quán. `read-only` là dữ liệu từ bản app mới hơn, gần như luôn đã có `welcomeSeenAt`. | reject |
| 15 | edge | Mất lối vào "Đổi Nhà" sau khi SkillGapCard đổi link | medium | Sau thay đổi, chỉ còn link tới `/sorting-hat` ở `HousePointsCard` (khi chưa có Nhà), lời mời ở Hôm nay (chưa có Nhà) và nút bài T1 tuần 1. Intent có nút "Đổi Nhà" mà người có Nhà không tới được. | patch: link "Đổi Nhà" trong HousePointsCard (Phòng Cúp), sửa Code Map |
| 16 | edge | Người dùng cũ ở Sân ga có điểm ETS không thấy link tới `/do-trinh-do` | low | Intent cố ý ẩn Đo trình độ ở Sân ga. Trang Mũ hiện link Đo trình độ khi `hasPlacement`, và sau #15 thì tới được Mũ từ Phòng Cúp → "Đổi Nhà". | reject |
| 17 | edge | Nút "Làm bài đầu vào (Mũ Phân Loại)" ở T1 giờ chỉ mở 4 câu Nhà | low | Đúng như Intent (ở Sân ga thì ẩn Đo trình độ). Never cấm bỏ nút này, story 27 sẽ bỏ nó. | reject |
| 18 | edge | Lúc `paused`, `placement.updatedAt` (ETS áp dụng muộn) đứng yên, nên thời gian quay lại thành trễ | medium | Đã tái hiện: bỏ qua 02/11, áp dụng 23/11, quay lại 30/11, bỏ qua lại 40/11 → bản cũ cho `weeksLate` 1. Hai câu Intent mâu thuẫn ở ca này. | patch: ngày áp dụng trượt theo số ngày tạm dừng, test mới, sửa Intent + Change Log |
| 19 | vgap | Nhánh Sân ga của `LazySession` không có kiểm chứng (không gọi tin, ôn viên, ghi `lazy`) | medium | Lỗ hổng kiểm chứng có thật (đã xác minh trước). | patch: headless 375px: ôn nhanh F01, 3 từ, "Xong buổi" ghi `lazy`, F01 không bị đánh dấu xong, không request `hn.algolia.com`/`blog.google`; sau Sân ga có gọi tin |
| 20 | vgap | Luồng "thư một lần" chỉ test hàm thuần | medium | Lỗ hổng kiểm chứng có thật. | patch: headless: store mới → `/welcome`, `welcomeSeenAt` ghi ngay, Mũ → Sân ga, về `/` không chuyển lại; store v12 → thư một lần, "Bỏ qua thư" không lặp |
| 21 | vgap | Today render theo `todayView` không được kiểm | medium | Lỗ hổng kiểm chứng có thật. Hồ sơ đề xuất defer, nhưng cùng lượt headless kiểm được luôn. | patch (kiểm tay): Sân ga chỉ một nút 30', không Bài hiện tại/750/Đo trình độ; sau Sân ga bố cục cũ + "Đo trình độ (tuỳ chọn)"; không cuộn ngang ở 6 route |

Headless Chrome 375px (bước review, dev server chạy chỉ local): 58/58 PASS, không lỗi JS. Script: `drive22.mjs` trong scratchpad của phiên.

## Design Notes

Nội dung Thư nhập học (tự viết, giọng nhẹ):
1. **"Chào mừng tới Lumos"**: mỗi ngày một buổi 30'. Bận quá thì "Hôm nay lười" 10' vẫn giữ lửa.
2. **"Không ai phạt bạn ở đây"**: không bao giờ bị phạt hay học lại từ đầu. Nghỉ vài hôm thì mốc chỉ dời lại, những gì đã học vẫn còn nguyên.
3. **"2–3 tuần đầu: Sân ga 9¾"**: 18 viên gạch lý thuyết vỡ lòng xây nền móng trước Năm 1. Phần nào đã biết thì Soát vé cho qua. Lịch 12 tháng chỉ bắt đầu đếm khi bạn qua (hoặc bỏ qua) Sân ga.

Bản cuối trong `Welcome.tsx`: thư 1 thêm câu "Mỗi ngày một buổi 30': lý thuyết trước, ôn sau, cuối buổi giải trí nhẹ." (đúng thứ tự bước của cả buổi Sân ga lẫn buổi bài); thư 3 đổi "khi bạn lên tàu" thành "khi bạn qua (hoặc bỏ qua) Sân ga" cho khớp dòng lịch trên Lộ trình.

Plan khi đang quay lại (ví dụ trong Matrix): bỏ qua 03/11, quay lại 10/11, hôm nay 12/11 → `scheduleStartDate` = 05/11, `planFor` = `{ status: 'paused', startDate: 05/11, weeksLate: <như ngày 10/11>, … }`. Ngày bắt đầu và hôm nay cùng trượt, nên số tuần trễ đứng yên.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/lib/schedule src/app src/lib/sessions src/lib/foundation src/lib/placement` -- expected: pass, có ca cho mọi dòng I/O Matrix.
- `git diff --name-only HEAD` -- expected: không có file trong `src/lib/storage`, `src/lib/sync`, `src/lib/backup`, `src/data/foundation/bricks`, `public/`; `src/lib/foundation/foundation.ts` không đổi.

**Manual checks:**
- Headless Chrome 375px với store dựng sẵn để kiểm các điểm sau:
  - store mới: thư → Mũ → Sân ga; Hôm nay chỉ có thẻ Sân ga, có link Soát vé;
  - store v12 cũ: thư một lần, thẻ Sân ga, Lộ trình "chưa bắt đầu";
  - đã bỏ qua: Hôm nay như `HEAD` + "Đo trình độ";
  - ngày lười Sân ga: ôn nhanh, 3 từ, xong buổi, không request tin;
  - không cuộn ngang, không lỗi JS.
