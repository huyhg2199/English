---
title: 'Bản đồ thì: mức nắm chắc từng thì của Năm 1 (CAP-7, CAP-11, CAP-19)'
type: 'feature'
created: '2026-11-11'
status: 'done'
baseline_commit: '999ac225c8329cbe438882b67d516d11cf3a9449'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/41-lesson-check-session-mistakes-invite.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/38-tense-rule-cards-irregular-verb-srs.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/31-desktop-hotkeys-today-roadmap-grid.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Quyết định 3: "nắm chắc" là tự làm ra câu đúng, thì đã học được ôn giãn cách, và **kiểm tra báo theo từng thì**. Báo cáo kiểm tra mục T4: "Không có chỗ nào hiện mức nắm chắc theo từng thì"; cách sửa ghi "sau đó làm trang Bản đồ thì". Mục story 42: mỗi thì hiện % kiểm tra tốt nhất, độ nhớ thẻ quy tắc, số lỗi chưa thuộc, trạng thái chưa học / đang học / chắc; link tới bài và buổi ôn; 375px và desktop.
- Quyết định 4: dùng lại dữ liệu và hàm có sẵn, không dựng hệ mới: `bestLessonCheck` (story 41), thẻ quy tắc `rule:<tenseId>-n` và thẻ động từ bất quy tắc (story 33, 38), `isMastered` của Sổ lỗi (story 9), `computeRoadmapProgress`, buổi bài ghim `?lesson=` (story 21, 41).
- Ràng buộc chung giữ nguyên: không khoá, không phạt, không reset (trạng thái chỉ để xem, thì "chưa học" vẫn mở được); tiếng Việt; giao diện 375px không đổi ngoài phần mới; desktop theo story 29–31; không nâng schema store, không thêm key đồng bộ.
- Claude chọn:
  - **Một trang** `/practice/tense-map` (tab Luyện tập vẫn sáng), lối vào là một thẻ trên trang Luyện tập, đặt ngay sau thẻ O.W.L. 1. Không thêm mục điều hướng (5 mục giữ nguyên), không thêm gì vào Hôm nay hay Lộ trình.
  - **Đơn vị là Tense** của Năm 1, đủ 15 thì theo thứ tự bài (`to-be` … `passive-present`), nhóm theo tháng T1–T4. Khối "Chọn thì" (story 39) không phải thì nên không có dòng.
  - **% kiểm tra tốt nhất** = `bestLessonCheck(store, lessonId)` của bài chứa thì (quiz bài `lesson-<id>`, mọi lần làm hợp lệ, kể cả làm ở trang test). Bài có hai thì (s1-t2-w2, s1-t4-w3) thì hai dòng cùng một %. Mini test, ôn trộn, O.W.L., test quay lại không tính.
  - **Độ nhớ thẻ quy tắc** = thẻ `ruleCardId` của chính thì: `total` (số `ruleCards`), `scheduled` (có mục `SrsCard` hợp lệ trong `srs.cards`), `remembered` (hợp lệ, `learning` false, `interval` ≥ 7 ngày), `due` (hợp lệ, `due` ≤ `now`). Thì `to-be` không có thẻ riêng.
  - Dòng quá khứ đơn bất quy tắc có thêm một dòng **động từ bất quy tắc**: đã mở / đã nhớ trên tổng `IRREGULAR_VERB_CARDS` (cùng luật "nhớ"). Dòng này chỉ để xem, không đổi trạng thái của thì.
  - **Lỗi chưa thuộc** = mục Sổ lỗi hợp lệ, không phải từ đọc (`word`), nhãn `thì`, `lessonId` = bài chứa thì, chưa `isMastered` (khoảng ôn < 21 ngày). Tính theo bài như %.
  - **Trạng thái:**
    - **chắc**: bài đã đánh dấu xong, kiểm tra bài tốt nhất ≥ 70%, 0 lỗi chưa thuộc, và mọi thẻ quy tắc của thì đã nhớ (thì không có thẻ thì điều kiện thẻ coi như đạt);
    - **chưa học**: chưa chắc và không có dấu hiệu đã bắt đầu: bài chưa xong, không phải bài hiện tại, chưa có lần kiểm tra bài, 0 lỗi chưa thuộc, 0 thẻ có lịch. Bài hiện tại = `nextLessonId` của `computeRoadmapProgress` khi **không** ở Sân ga (`isInFoundation`);
    - **đang học**: còn lại.
  - Dòng "đang học" có câu **"Để chắc: …"** liệt kê việc còn thiếu theo thứ tự: đánh dấu bài xong → kiểm tra bài đạt 70% → ôn n câu Sổ lỗi → ôn thẻ (còn k thẻ chưa nhớ). Dòng "chưa học" của bài bị Mũ Phân Loại xếp qua có ghi chú "Mũ Phân Loại đã xếp qua bài này".
  - **Link:** "Xem bài" (đoạn Ngữ pháp) luôn có; "Buổi ôn 30'" (`/session?lesson=<id>&step=lesson`) và "Làm kiểm tra" (trang test của quiz bài, chỉ khi chưa đạt 70%) chỉ hiện khi thì không còn "chưa học"; số lỗi chưa thuộc > 0 thì là link tới Sổ lỗi.
  - Trang chỉ đọc store, không ghi gì, không có phím tắt mới. Desktop: route `wide`, lưới 2 cột (đầu trang trải 2 cột, mỗi tháng một ô).

**Problem:** Sau story 33–46 mỗi thì đã có kiểm tra bài, thẻ quy tắc SRS và Sổ lỗi, nhưng các số này nằm rải ở Lộ trình, phiên flashcard và Sổ lỗi. Huy không có chỗ nào nhìn một lần để biết thì nào đã chắc, thì nào đang yếu và nên ôn gì tiếp.

**Approach:** Thêm hàm thuần tính một dòng cho mỗi thì Năm 1 (%, thẻ, lỗi, trạng thái, việc còn thiếu) từ store và `now`. Thêm trang "Bản đồ thì" vẽ các dòng theo tháng, kèm link tới bài, buổi ôn và kiểm tra. Thêm một thẻ tóm tắt trên trang Luyện tập.

## Boundaries & Constraints

**Always:**
- Hàm tính là hàm thuần: `store`, `now` qua tham số, không ghi store. Dữ liệu thiếu hay sai dạng (`quizzes`, `srs`, `mistakes`, `progress`) coi như rỗng, không ném lỗi.
- % dùng đúng `bestLessonCheck` (ngưỡng `checkPassed`, làm tròn xuống như story 41). Không tự tính lại công thức.
- Đếm thẻ bằng `ruleCardId` trên `ruleCards` của Tense và trên `IRREGULAR_VERB_CARDS`, kiểm `isSrsCard`. Ngưỡng nhớ là một hằng số export `TENSE_CARD_REMEMBERED_DAYS = 7`.
- Đếm lỗi bằng `isMistakeItem` + `isMastered` của `@/lib/quiz`, nhãn `'thì'`.
- Thứ tự dòng theo thứ tự bài trên lộ trình, rồi theo thứ tự thì trong bài. Nhóm tháng lấy tên từ `getLessonEntry(lessonId).month` (`label`, `period`).
- 375px: không tràn ngang ở `/practice/tense-map` và `/practice` (chữ dài `break-words`, hàng nút `flex-wrap`), nút cao ≥ 36px (`min-h-9`). Class mới ở breakpoint điện thoại chỉ nằm trong file mới và trong thẻ mới của `Practice.tsx`.
- Chữ trên trang là tiếng Việt, tên thì lấy từ `Tense.name`.

**Never:**
- Không ghi store, không nâng `CURRENT_VERSION`, không thêm key vào `SYNCED_KEYS` / `MERGERS` / backup.
- Không đổi luật hay hành vi có sẵn: `bestLessonCheck` / `roadmapCheckLabel` / `lessonCheckVerdict`, lời mời ôn bài và ôn viên gạch, kế hoạch buổi 30', kế hoạch O.W.L. và điểm từng chủ điểm, nhịp mở thẻ quy tắc hay thẻ động từ (mục "Thẻ quy tắc của thì không giãn nhịp" trong `deferred-work.md` vẫn để ngỏ), thuật toán SRS, mốc "đã thuộc" 21 ngày của Sổ lỗi.
- Không cộng điểm mini test, ôn trộn, O.W.L. hay test quay lại vào %. Không đọc điểm từng chủ điểm của O.W.L.
- Không khoá, không ẩn, không làm mờ thì "chưa học" theo kiểu bị khoá; không chữ trách móc ("yếu", "kém", "trượt").
- Không thêm mục điều hướng, không thêm phím tắt, không sửa Hôm nay, Lộ trình, trang bài, buổi học.
- Không thêm hay sửa câu hỏi, Tense, thẻ quy tắc, nội dung bài.
- Không làm việc của story 47: `requires` câu T2–T4 cũ, test quay lại ở Sân ga, video lệch tuần, chia Ngữ pháp theo ngày, mục "Thấp" của báo cáo.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Store rỗng | Store mới, đang ở Sân ga | 15 dòng, tất cả "chưa học"; % null; thẻ `scheduled` 0; lỗi 0; `missing` rỗng. Tóm tắt: chắc 0 · đang học 0 · chưa học 15 | N/A |
| Ở Sân ga không tính bài hiện tại | Đang ở Sân ga, `nextLessonId` = `s1-t1-w1` | `to-be` vẫn "chưa học" | N/A |
| Bài hiện tại | Đã bỏ qua Sân ga, s1-t1-w1…s1-t1-w4 xong, chưa làm gì ở s1-t2-w1 | `present-continuous` "đang học", `missing` = [done, check]; có link Buổi ôn và Làm kiểm tra | N/A |
| Chắc | s1-t2-w1 xong; `lesson-s1-t2-w1` tốt nhất 4/5; 5 thẻ `rule:present-continuous-1..5` hợp lệ, `learning` false, `interval` ≥ 7; không có lỗi `thì` chưa thuộc của bài | `present-continuous` "chắc", `missing` rỗng, % 80, thẻ nhớ 5/5; không có link Làm kiểm tra | N/A |
| Gần chắc | Như "Chắc" nhưng một thẻ `interval` 3 | "đang học", `missing` = [cards], câu "Để chắc: ôn thẻ (còn 1 thẻ chưa nhớ)" | N/A |
| Ngưỡng nhớ ở biên | Thẻ `interval` đúng 7, `learning` false / thẻ `interval` 10 nhưng `learning` true | Thẻ đầu tính nhớ; thẻ sau không | N/A |
| Bài hai thì | s1-t2-w2 xong, kiểm tra 4/5; thẻ `past-to-be` nhớ hết, thẻ `past-simple` nhớ 2/5 | `past-to-be` "chắc", `past-simple` "đang học"; cả hai % 80 và cùng số lỗi | N/A |
| Thì không có thẻ | s1-t1-w1 xong, kiểm tra đạt, 0 lỗi | `to-be` "chắc"; `cards.total` 0, dòng thẻ ghi "không có thẻ riêng" | N/A |
| Đếm lỗi | Sổ lỗi có cho s1-t2-w1: 2 mục `thì` khoảng ôn 3; 1 mục `thì` khoảng ôn 21 (`learning` false); 1 mục `phát âm`; 1 mục từ đọc (`word`); 1 mục sai dạng | `openMistakes` = 2; dòng là link tới Sổ lỗi | Mục sai dạng bị bỏ qua |
| Lần làm khác loại | Chỉ có lần `mini-t2`, lần `lesson-s1-t2-w1` có `kind: 'comeback'` / `'owl'`, lần `total` 0 | % null ("chưa kiểm tra"); các lần này không làm thì thành "đang học" | N/A |
| Có dấu hiệu trước khi tới bài | s1-t3-w1 chưa xong, chưa tới, nhưng có 1 lần `lesson-s1-t3-w1` 2/5 (hoặc 1 lỗi `thì` của bài) | `will` "đang học" | N/A |
| Bài bị xếp qua | `startLessonId` = `s1-t2-w1`, s1-t1-w2 chưa xong, không lần làm, không lỗi, không thẻ | `present-simple` "chưa học", `skipped` true, ghi chú "Mũ Phân Loại đã xếp qua bài này" | N/A |
| Bỏ đánh dấu xong | s1-t2-w1 từng xong (thẻ đã nhớ hết, kiểm tra đạt), nay `done: false` | "đang học", `missing` = [done]; thẻ vẫn đếm từ `srs.cards` | N/A |
| Thẻ đến hạn | 2 thẻ của thì có `due` ≤ `now`, 1 thẻ `due` > `now` | `cards.due` = 2 | N/A |
| Động từ bất quy tắc | 12 thẻ `rule:irregular-*` hợp lệ, 5 trong đó nhớ | Dòng `past-simple-irregular` có `verbs` = { total: số `IRREGULAR_VERB_CARDS`, opened: 12, remembered: 5 }; trạng thái chỉ theo 4 thẻ của chính thì. Dòng khác không có `verbs` | N/A |
| Dữ liệu hỏng | `store.data.quizzes` / `srs` / `mistakes` / `progress` là chuỗi hoặc null; thẻ là `{}` | Như store rỗng ở phần đó; thẻ sai dạng không tính `scheduled` | Không ném lỗi |
| Link buổi ôn | `lessonSessionHref('s1-t2-w1')` | `/session?lesson=s1-t2-w1&step=lesson`; `resolveSessionPlan` với tham số này ra buổi bài s1-t2-w1, bước Bài chính | N/A |
| Thẻ Luyện tập | 3 thì chắc, 4 đang học | Thẻ "Bản đồ thì": "3 chắc · 4 đang học · 8 chưa học (15 thì Năm 1)" | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/index.ts` -- `LESSON_CONTENTS` (thứ tự bài), `allTenses()` (:174, không kèm `lessonId`), `lessonRuleCards`, `IRREGULAR_VERB_CARDS`, `IRREGULAR_VERBS_LESSON_ID`. Thêm hàm trả `{ lessonId, tense }`.
- `src/data/lessons/types.ts:183-215` -- `Tense` (`id`, `name`, `ruleCards?`). Không sửa.
- `src/lib/quiz/lesson-check.ts:59` -- `bestLessonCheck`, `LessonCheckResult`, `checkPassed`. Dùng lại, không sửa.
- `src/lib/quiz/mistakes.ts` -- `readMistakes`, `isMistakeItem`, `isMastered` (:182), `MASTERED_INTERVAL_DAYS`. Dùng lại.
- `src/lib/flashcard-session.ts:175` -- `ruleCardId` (`past-to-be-rule-1` → `rule:past-to-be-1`). `src/lib/srs` -- `readSrs`, `isSrsCard`, `SrsCard` (`learning`, `interval`, `due`).
- `src/lib/roadmap-progress.ts:109` -- `computeRoadmapProgress`, `readCompletedLessonIds`; `src/lib/placement/store.ts:76` -- `readStartLessonId`; `src/lib/foundation/foundation.ts:198` -- `isInFoundation`.
- `src/lib/sessions/plan.ts:174` -- `resolveSessionPlan` (ưu tiên `?lesson=` ghim bài, `step`). Chưa có hàm dựng link buổi bài: thêm ở đây.
- `src/data/roadmap/lookup.ts` -- `getLessonEntry` (`month.label`, `month.period`), `sectionHref`, `allLessons`. `src/data/questions/index.ts` -- `lessonQuizId`, `quizHref`, `MISTAKES_HREF`.
- `src/pages/Practice.tsx` -- `PracticeLink` (:59), mẫu tóm tắt `MiniTestSummary` (:84); thẻ O.W.L. (:187) rồi `<SpellList />` (:191). Thẻ mới chèn giữa hai chỗ này.
- `src/app/routes.tsx:59-66` -- các route `practice/*`; `handle: { layout: 'wide' } satisfies RouteHandle`. `src/app/nav-items.ts` -- tab Luyện tập khớp mọi route con, không cần sửa.
- `scripts/layout/check-lib.mjs` -- `ROUTES` (:15), `WIDE_ROUTES` (:34), `GRID_LANDMARKS` (:57). Route mới phải nằm trong `ROUTES` (test `route-handle.test.ts:109`); route `wide` không có cột phụ phải có `GRID_LANDMARKS`.
- `src/app/route-handle.test.ts:60` (danh sách route `wide`), `src/lib/layout-check.test.ts:69` (`ROUTES` có 12 route), `:231` (`WIDE_ROUTES`), `:311` (`GRID_LANDMARKS`): sửa theo route mới.
- `src/pages/Today.tsx:136` -- mẫu lưới `flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start` với `lg:col-span-2`.
- `src/components/quiz/LessonReviewInvite.tsx` -- mẫu chữ và nút `size="sm" className="min-h-9"`.
- Vitest env `node`, chỉ `src/**/*.test.ts`: component kiểm qua hàm thuần. Mẫu dựng store: `src/lib/quiz/lesson-check.test.ts`, `src/lib/flashcard-session.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/lessons/index.ts` -- `tenseEntries(): readonly { lessonId: string; tense: Tense }[]` theo thứ tự `LESSON_CONTENTS` rồi thứ tự thì trong bài (tính một lần). Doc tiếng Việt.
- [x] `src/lib/sessions/plan.ts` -- `lessonSessionHref(lessonId): string` = `/session?lesson=<id>&step=lesson` (dùng `URLSearchParams`). Doc: buổi 30' ghim bài, phần đoạn Phát âm do `resolveSessionPlan` tự chọn.
- [x] `src/lib/tense-map.ts` (mới) -- `TENSE_CARD_REMEMBERED_DAYS = 7`; `TenseStatus = 'new' | 'learning' | 'solid'`, `TENSE_STATUS_LABELS` ("chưa học" / "đang học" / "chắc"); `TenseGap = 'done' | 'check' | 'mistakes' | 'cards'`; `CardStats = { total; scheduled; remembered; due }`; `TenseMapRow = { tenseId; name; lessonId; monthId; status; done; current; skipped; check: LessonCheckResult | null; cards: CardStats; openMistakes; missing: TenseGap[]; verbs?: { total; opened; remembered } }`; `isRememberedCard(card)`; `tenseMapRows(store, now): TenseMapRow[]` theo Decisions và Matrix; `tenseMapSummary(rows): Record<TenseStatus, number>`; `groupTenseRows(rows): { monthId; label; period; rows }[]` (giữ thứ tự). Đọc store một lần cho mỗi phần (progress, srs, mistakes), không ghi.
- [x] `src/lib/tense-map.test.ts` (mới) -- mỗi dòng Matrix là một test (trừ dòng "Link buổi ôn"); thêm: 15 dòng đúng thứ tự id `to-be` … `passive-present`; mọi `lessonId` có đoạn `grammar` (`getSection`) và có quiz bài (`getQuiz(lessonQuizId(id))`); `groupTenseRows` ra 4 tháng T1–T4 với số dòng 3 / 5 / 4 / 3; `missing` đúng thứ tự khi thiếu cả bốn.
- [x] `src/lib/sessions/plan.test.ts` -- dòng Matrix "Link buổi ôn" (chuỗi link, và `resolveSessionPlan` đọc lại ra `mode: 'lesson'`, đúng bài, `stepIndex` 0, cả khi đang ở Sân ga).
- [x] `src/pages/TenseMap.tsx` (mới) -- trang theo Design Notes: `useLoadedStore`, `useNow`, `useMemo(tenseMapRows)`; header + đoạn giới thiệu + dòng tóm tắt (`lg:col-span-2`); mỗi tháng một `section aria-labelledby="tense-month-<monthId>"` bọc một Card; mỗi thì một mục danh sách có chip trạng thái, các dòng số, câu "Để chắc", hàng nút.
- [x] `src/app/routes.tsx` -- `{ path: 'practice/tense-map', element: <TenseMap />, handle: { layout: 'wide' } satisfies RouteHandle }` cạnh các route `practice/*`, có chú thích (story 42; tab Luyện tập vẫn sáng).
- [x] `src/pages/Practice.tsx` -- `TenseMapSummary` (dùng `tenseMapRows` + `tenseMapSummary`) và `<PracticeLink to="/practice/tense-map" icon={Compass} title="Bản đồ thì">` ngay sau thẻ O.W.L. 1, trước `<SpellList />`. Không đổi phần khác.
- [x] `scripts/layout/check-lib.mjs` -- thêm `/practice/tense-map` vào `ROUTES` và `WIDE_ROUTES`; `GRID_LANDMARKS['/practice/tense-map'] = 'main > section'`; sửa chú thích nếu có nhắc số route.
- [x] `src/app/route-handle.test.ts` + `src/lib/layout-check.test.ts` -- thêm `/practice/tense-map` vào danh sách route `wide`, `ROUTES` 13 route, `WIDE_ROUTES` và `GRID_LANDMARKS` mới (mọi khoá vẫn là route `wide`).
- [x] `_bmad-output/specs/spec-english-learning-website/learning-rules.md` -- thêm mục ngắn "Bản đồ thì (story 42)" trước "Tab Luyện tập": các số, luật chắc / đang học / chưa học, chỉ để xem, không khoá; dòng "Tab Luyện tập" thêm "Bản đồ thì".

**Acceptance Criteria:**
- Given Huy mở `/practice` ở 375px, when nhìn danh sách, then thẻ "Bản đồ thì" nằm ngay dưới thẻ O.W.L. 1 với dòng tóm tắt, các thẻ khác giữ nguyên chữ và class; chạm thẻ mở `/practice/tense-map` và tab Luyện tập vẫn sáng.
- Given trang Bản đồ thì ở 375px với dữ liệu đã học tới T2, when cuộn hết trang, then không tràn ngang (`scrollWidth` = 375), tên thì dài và câu "Để chắc" xuống dòng, nút "Xem bài" / "Buổi ôn 30'" / "Làm kiểm tra" cao ≥ 36px và xuống hàng khi thiếu chỗ.
- Given máy ≥ 1024px, when mở `/practice/tense-map`, then đầu trang trải hết bề rộng, bốn ô tháng xếp lưới 2 cột trong cột `wide` 1024px.
- Given dòng một thì "đang học", when bấm "Buổi ôn 30'", then mở buổi 30' của đúng bài đó ở bước Bài chính (thẻ kiểm tra cuối bài theo story 41); bấm "Xem bài" mở đoạn Ngữ pháp của bài; bấm "Làm kiểm tra" mở trang test `lesson-<id>`.
- Given Huy vừa làm kiểm tra bài hoặc ôn thẻ / Sổ lỗi ở trang khác, when quay lại Bản đồ thì, then số liệu và trạng thái đã đổi theo store, không cần tải lại trang.
- Given `npm run layout:guard`, when chạy, then chỉ báo class thêm ở `src/pages/TenseMap.tsx` (file mới) và `src/pages/Practice.tsx` (nếu có); không có class bị xoá.

## Implementation Notes

- **Lib thuần:** `src/lib/tense-map.ts` có đủ API của Tasks (`TENSE_CARD_REMEMBERED_DAYS`, `TenseStatus`, `TENSE_STATUS_LABELS`, `TenseGap`, `CardStats`, `TenseMapRow`, `isRememberedCard`, `tenseMapRows`, `tenseMapSummary`, `groupTenseRows`). Thêm các hàm chữ / link thuần để trang chỉ vẽ và test giữ được chữ Design Notes: `tenseGapText` (câu "Để chắc: …"), `tenseCheckLine`, `tenseCardsLine`, `tenseMistakesLine`, `tenseVerbsLine`, `tenseMapBlurb` (thẻ Luyện tập), `tenseRowLinks` (Xem bài luôn có; Buổi ôn 30' khi không còn "chưa học"; Làm kiểm tra khi không còn "chưa học" và chưa đạt 70%; link Sổ lỗi khi còn lỗi). `isRememberedCard` nhận `unknown` và tự kiểm `isSrsCard`.
- **Luật vế "thẻ" của `missing`:** chỉ thêm `cards` khi còn thẻ chưa nhớ **và** (bài đã xong hoặc đã có thẻ vào lịch). Lý do: Matrix "Bài hiện tại" đòi `missing` = [done, check] (thẻ chỉ vào ôn khi bài được đánh dấu xong, nên chưa phải việc làm được), còn test "thiếu cả bốn" cần `cards` khi bài chưa xong; ca đó dựng bằng bài từng xong rồi bỏ đánh dấu (thẻ đã có lịch). Bài đã xong mà thẻ chưa vào lịch thì vẫn thiếu `cards`, nên dòng "đang học" luôn có ít nhất một vế. `missing` chỉ có ở dòng "đang học" (dòng "chưa học" và "chắc" là `[]`, như Matrix "Store rỗng").
- **Dòng động từ bất quy tắc:** chọn theo `lessonId === IRREGULAR_VERBS_LESSON_ID` (bài chỉ có thì `past-simple-irregular`); `verbs` không ảnh hưởng trạng thái.
- **Ghi chú bài xếp qua** chỉ hiện khi dòng là "chưa học" (`skipped` vẫn đúng ở dữ liệu kể cả khi đã có dấu hiệu học); luật nằm ở hàm thuần `tenseSkippedNote`.
- **Buổi ôn 30' của bài T1 chia phần** (s1-t1-w1…w3): link không ghi `?part=`, nên buổi mở phần chưa xem đầu tiên và chưa có thẻ kiểm tra cuối Bài chính (đúng luật story 41: buổi học phần 1, 2 chưa kiểm tra); xem hết phần thì buổi có thẻ kiểm tra. Nút "Làm kiểm tra" trên Bản đồ thì vẫn mở trang test. `plan.test.ts` chốt hành vi này.
- **Trang:** `src/pages/TenseMap.tsx` theo Design Notes (`useLoadedStore` + `useNow` + `useMemo`), không ghi store, không phím tắt. `Practice.tsx` chỉ thêm `TenseMapSummary` + một `PracticeLink` (không class mới). Route `practice/tense-map` `wide`.
- **Kiểm chứng:**
  - `npm run lint && npm test && npm run build`: đạt (86 file, 2151 test; `check-precache: OK`). Test mới: `src/lib/tense-map.test.ts` (23 ca: mọi dòng Matrix trừ "Link buổi ôn", thứ tự 15 thì, đoạn grammar + quiz bài, nhóm 3/5/4/3, thứ tự `missing` khi thiếu cả bốn, bài xong mà thẻ chưa vào lịch, không ghi store); `plan.test.ts` thêm describe `lessonSessionHref` (chuỗi link, `resolveSessionPlan` đọc lại ra buổi bài s1-t2-w1, `stepIndex` 0, cả sau Sân ga lẫn đang ở Sân ga).
  - `npm run layout:guard`: chỉ báo class thêm ở `src/pages/TenseMap.tsx` (file mới); không class nào bị xoá; `Practice.tsx` không bị báo.
  - `npm run layout:check`: 13 route `ok` ở 5 bề rộng, kể cả `/practice/tense-map` (lưới 2 cột ở 1024 / 1280 / 1920). Ảnh 375px chỉ lệch ở `/practice` (thẻ "Bản đồ thì" dưới O.W.L. 1) và `/practice/tense-map` (bản gốc chưa có route) đúng như Verification. Probe phím "F01: gõ "chào 1" + Enter trong ô không chấm" báo lỗi: lỗi có sẵn từ các story trước, không sửa. Đã xem ảnh 375px và 1280px: 375px không tràn, tên thì dài xuống dòng; 1280px đầu trang trải 2 cột, tháng T1 | T2, T3 | T4.
- **Chưa kiểm tay:** chưa mở trình duyệt với store có dữ liệu (đủ ba trạng thái, câu "Để chắc", bấm từng link). `layout:check` chỉ chạy store sạch (mọi thì "chưa học", chỉ có nút "Xem bài"); phần còn lại kiểm qua hàm thuần (Vitest env `node`).

## Spec Change Log

- **2026-11-13, sau review (blind, edge, vgap):**
  - Finding: dòng thẻ báo "thẻ vào ôn khi bài được đánh dấu xong" cả khi bài đã xong; dòng thẻ báo "n thẻ đến hạn" cho bài đã bỏ đánh dấu (phiên flashcard không đưa thẻ đó); vế "ôn thẻ" không có link; trang thiếu link về Luyện tập; "Sổ lỗi: không còn …" ở dòng chưa học; chip "đang học" gần giống "chưa học"; ghi chú bài xếp qua nằm trong TSX, không test.
  - Sửa (chỉ phần ngoài khung frozen, Design Notes + Implementation Notes): `tenseCardsLine` nhận `{ cards, done }` (ba câu theo bài xong / chưa xong); `tenseRowLinks` có thêm `cards` (link `/practice/flashcards` khi bài xong và có thẻ đến hạn hoặc vế "ôn thẻ"); `tenseSkippedNote`; chữ "không có câu chưa thuộc"; chip "đang học" thêm `bg-muted`; link "← Luyện tập" đầu trang.
  - Tránh: Huy được nhắc đánh dấu bài đã xong, hay được báo thẻ đến hạn mà phiên ôn không đưa ra.
  - KEEP: luật trạng thái, `missing` và thứ tự vế, số liệu `cards.due` (vẫn đếm theo `due` ≤ `now`), chữ "Để chắc", link Buổi ôn / Làm kiểm tra / Sổ lỗi, bố cục lưới 2 cột.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|------------|-------|
| 1 | blind + edge | Dòng thẻ "chưa vào ôn (thẻ vào ôn khi bài được đánh dấu xong)" hiện cả khi bài đã xong | medium | `tenseCardsLine` cũ chỉ xét `scheduled === 0`; test "Bài đã xong mà thẻ chưa vào lịch" chốt câu mâu thuẫn với vế "ôn thẻ" | patch: `tenseCardsLine({ cards, done })`, bài xong → "thẻ vào ở phiên flashcard tới"; test sửa |
| 2 | blind + edge | `cards.due` / "n thẻ đến hạn" cho bài đã bỏ đánh dấu, phiên flashcard không đưa thẻ đó | low | `ruleStudyWords` (`flashcard-session.ts`) chỉ lấy thẻ của bài trong `readCompletedLessonIds`; dòng thẻ cũ vẫn in "đến hạn" | patch: bài chưa xong thì dòng ghi "(ôn tiếp khi bài được đánh dấu xong)", không link; số `cards.due` giữ theo Decisions; vế `cards` giữ (đứng sau "đánh dấu bài xong") |
| 3 | blind | "Để chắc: ôn thẻ" / thẻ đến hạn không có link hành động | low | `TenseRowLinks` cũ không có trang flashcard; Buổi ôn 30' mở thẳng bước Bài chính | patch: `links.cards` = `/practice/flashcards` khi bài xong và có thẻ đến hạn hoặc vế "ôn thẻ"; dòng thẻ thành link |
| 4 | blind | Link Sổ lỗi không lọc theo bài; "ôn n câu Sổ lỗi" không xét câu đến hạn | low | `Mistakes.tsx` không có bộ lọc bài / nhãn (có từ trước); chữ "ôn n câu Sổ lỗi" là chữ của Decisions (frozen) | defer (bộ lọc Sổ lỗi theo bài là việc của trang Sổ lỗi) |
| 5 | blind + edge | "Buổi ôn 30'" của bài T1 chia phần không có thẻ kiểm tra cuối bài | low | `resolveSessionPlan` chọn phần chưa xem đầu tiên, `sessionCheckQuizId` trả null cho phần 1, 2: đúng luật story 41 (buổi học phần chưa kiểm tra); nút "Làm kiểm tra" vẫn có | patch: chốt hành vi bằng test `plan.test.ts` + doc `lessonSessionHref`, ghi Implementation Notes |
| 6 | blind | Bản đồ tính theo bài, không theo từng thì (bài hai thì chung %, chung lỗi; quiz bài lẫn câu phát âm, từ vựng) | low | Decisions (frozen) chọn "Tính theo bài như %"; trang và `learning-rules.md` đã ghi "Điểm kiểm tra và Sổ lỗi tính theo bài" | defer (tách theo `thì` / `requires` là cải tiến sau) |
| 7 | blind | Trang thiếu link về Luyện tập | low | `Flashcards.tsx`, `Mistakes.tsx`, `Owl.tsx` đều có link `ArrowLeft` → `/practice`; `TenseMap.tsx` không có | patch: thêm link "← Luyện tập" (`lg:col-span-2`) |
| 8 | blind | Dòng "chưa học" dùng chữ ngụ ý đã từng có lỗi ("không còn câu chưa thuộc"), ghi chú thẻ dài lặp 15 lần | low | `tenseMistakesLine(0)` cũ = "không còn câu chưa thuộc" | patch: đổi thành "không có câu chưa thuộc"; phần lặp ghi chú thẻ giữ (chữ ngắn, đúng nghĩa) |
| 9 | blind | Chip "đang học" và "chưa học" gần giống nhau | low | `STATUS_CHIP` cũ: cả hai `border-border`, chỉ khác màu chữ | patch: "đang học" thêm `bg-muted` (không trông như bị khoá) |
| 10 | blind | Hai dòng tóm tắt khác định dạng, dòng trang không test | low | Design Notes chọn hai định dạng riêng ("Chắc a · …" trên trang, "a chắc · …" trên thẻ); dòng trang chỉ là nội suy ba số đã test qua `tenseMapSummary` | reject |
| 11 | blind | `TenseMapSummary` tính lại mỗi lần ghi store và mỗi 60 giây | low | 15 dòng, mỗi bài một lần `bestLessonCheck` + vài chục tra thẻ: chi phí không đáng kể | reject |
| 12 | blind | Thiếu test: dòng chưa học sau Sân ga, ghi chú bài xếp qua, ôn trộn, `groupTenseRows` tháng lặp | low | Ba ý đầu đúng; ý tháng lặp không xảy ra với dữ liệu hiện tại (test chốt 4 tháng 3/5/4/3) | patch: thêm test dòng chưa học sau Sân ga (chỉ "Xem bài"), `tenseSkippedNote`, lần `mix-s1` không tính |
| 13 | blind | Spec chưa xong (status, Triage Log, kiểm tay) | low | Status / Triage Log là việc của bước này; kiểm tay trên trình duyệt chưa làm | reject (sửa spec của chính build); kiểm tay chuyển vào danh sách Huy tự kiểm |
| 14 | edge | Lỗi `thì` của câu đã bị gỡ khỏi kho thì không bao giờ về 0, thì không thể "chắc" | maybe-false | Câu nghe có nhãn `nghe` nên vế TTS sai; vế câu bị gỡ: chưa thấy câu nào bị gỡ, cần dò `mistakes.items` thật xem có id không `getQuestion` được | defer (nếu đúng: medium, chưa kiểm chứng) |
| 15 | edge | `getLessonEntry` trả undefined → tiêu đề " · ", id `tense-month-` | false | Test "15 dòng" + "groupTenseRows 4 tháng" chốt mọi bài của thì có mục lộ trình và tháng | reject |
| 16 | edge | Thứ tự dòng theo `LESSON_CONTENTS`, không theo `allLessons()` | low | Hai thứ tự khớp nhau và test chốt thứ tự 15 thì | reject |
| 17 | vgap | Chưa có test "chỉ có thẻ vào lịch" là dấu hiệu duy nhất → "đang học" | medium | Đã qua kiểm chứng của lớp vgap: mọi test "đang học" đều có dấu hiệu khác | patch: test "Chỉ có thẻ vào lịch …" (`missing` [done, check, cards], có Buổi ôn) |
| 18 | vgap | Luật ghi chú "Mũ Phân Loại đã xếp qua" nằm trong TSX, không test | low | Đã qua kiểm chứng của lớp vgap | patch: hàm `tenseSkippedNote` + test (dòng xếp qua chưa học có ghi chú; đã bắt đầu thì null) |

## Design Notes

Bố cục trang (375px trước, `lg:` chỉ thêm lưới):

```tsx
<section className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
  <header className="flex items-center gap-3 lg:col-span-2">…<h1>Bản đồ thì</h1></header>
  <div className="flex flex-col gap-2 lg:col-span-2">{/* giới thiệu + tóm tắt */}</div>
  {months.map((m) => (
    <section key={m.monthId} aria-labelledby={`tense-month-${m.monthId}`}><Card>…</Card></section>
  ))}
</section>
```

Chữ (tiếng Việt, không chữ trách móc):
- Giới thiệu: "Mỗi thì của Năm 1: điểm kiểm tra bài tốt nhất, thẻ quy tắc đã nhớ và lỗi còn trong Sổ lỗi. Chắc = đã xong bài, kiểm tra bài từ 70%, mọi thẻ quy tắc đã nhớ (khoảng ôn từ 7 ngày) và không còn câu sai về thì chưa thuộc. Điểm kiểm tra và Sổ lỗi tính theo bài." Tóm tắt: "Chắc a · Đang học b · Chưa học c".
- Tiêu đề ô tháng: "T2 · 12/26" (`label` · `period`).
- Đầu trang có link "← Luyện tập" (như Flashcard, Sổ lỗi, O.W.L.), trải 2 cột ở desktop.
- Chip trạng thái: "chắc" (`border-primary text-primary bg-accent/40`), "đang học" (`border-border bg-muted`), "chưa học" (`text-muted-foreground`). Không dùng màu đỏ.
- Dòng số (`text-sm text-muted-foreground`):
  - "Kiểm tra bài: đạt 80%" (≥ 70% thì `text-primary`) / "Kiểm tra bài: chưa kiểm tra";
  - "Thẻ quy tắc: nhớ 3/5 · 1 thẻ đến hạn" (bỏ vế sau khi 0; bài chưa xong thì thay vế sau bằng " (ôn tiếp khi bài được đánh dấu xong)" vì phiên flashcard không đưa thẻ của bài chưa xong) / "Thẻ quy tắc: chưa vào ôn (thẻ vào ôn khi bài được đánh dấu xong)" khi `scheduled` 0 và bài chưa xong / "Thẻ quy tắc: chưa vào ôn (thẻ vào ở phiên flashcard tới)" khi `scheduled` 0 và bài đã xong / "Thẻ quy tắc: không có thẻ riêng" khi `total` 0. Bài đã xong và có thẻ đến hạn hoặc còn vế "ôn thẻ" thì dòng là link tới `/practice/flashcards`;
  - "Sổ lỗi: 2 câu chưa thuộc" (link Sổ lỗi) / "Sổ lỗi: không có câu chưa thuộc";
  - chỉ dòng bất quy tắc: "Động từ bất quy tắc: nhớ 5/50 · đã mở 12/50" (50 = `IRREGULAR_VERB_CARDS.length`, không viết cứng) / "Động từ bất quy tắc: chưa mở thẻ".
- "Để chắc: đánh dấu bài xong · kiểm tra bài đạt 70% · ôn 2 câu Sổ lỗi · ôn thẻ (còn 1 thẻ chưa nhớ)" (chỉ các vế còn thiếu).
- Ghi chú bài xếp qua (`tenseSkippedNote`, chỉ dòng "chưa học"): "Mũ Phân Loại đã xếp qua bài này. Vẫn học được bất cứ lúc nào."
- Nút: "Xem bài" (`variant="outline"`), "Buổi ôn 30'" (mặc định), "Làm kiểm tra" (`variant="ghost"`), đều `size="sm" className="min-h-9"`.
- Thẻ Luyện tập: tiêu đề "Bản đồ thì", mô tả "a chắc · b đang học · c chưa học (15 thì Năm 1)".

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: không lỗi, mọi test (cũ + mới) xanh, build qua kèm `check-precache`.
- `npm run layout:guard` -- expected: chỉ báo class thêm ở file trong AC, không có class bị xoá.
- `npm run layout:check` -- expected: mọi route `ok` ở 5 bề rộng, kể cả `/practice/tense-map` (lưới 2 cột ở 1024 / 1280 / 1920). Ảnh 375px chỉ lệch ở `/practice` (thẻ mới) và `/practice/tense-map` (bản gốc chưa có route nên về Hôm nay). Lỗi probe phím tắt F01 có sẵn từ story 35 / 41–46: ghi lại, không sửa.

**Manual checks (if no CLI):**
- Chrome 375px và 1280px với store đã qua Sân ga, xong T1–T2, có vài lần kiểm tra bài, thẻ quy tắc ở nhiều khoảng ôn và vài câu Sổ lỗi: đủ ba trạng thái, câu "Để chắc", link Buổi ôn / Xem bài / Làm kiểm tra / Sổ lỗi mở đúng chỗ. Ghi kết quả vào Implementation Notes.
