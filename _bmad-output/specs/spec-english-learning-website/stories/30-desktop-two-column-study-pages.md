---
title: 'Máy tính D2: Viên gạch, Bài học, Buổi học hai cột (SPEC Constraints, stack.md UI)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'c31291c8345b1e0fd171fe1ab9279eb6ba383f57'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/29-desktop-shell-topbar.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/21-session-plan-theory-first.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Máy tính (câu 4):** Huy chọn phương án tối giản: thanh trên cùng từ 1024px (đã làm ở story 29), cột giữa rộng hơn, Viên gạch / Bài học / Buổi học hai cột (story này), phím tắt và lưới Hôm nay/Lộ trình ở story 31. Thanh bên trái để sau.
- **Nhịp 1 viên/buổi, "Học tiếp viên sau" (câu 3):** BrickPlayer trong buổi vẫn có `endSlot` "Học tiếp viên sau" như story 21; story này chỉ đổi bố cục.
- **Kiểm tra cả 4 hàng trước, mốc 750 (câu 1–2):** story này không đụng Soát vé, kiểm tra hàng, lịch hay dữ liệu store.
- Claude chọn:
  - **Route `wide`** (`lg:max-w-5xl`, 1024px): đúng 3 route `session`, `roadmap/lesson/:lessonId/:sectionId?`, `foundation/:brickId`. Hôm nay, Lộ trình và các route Sân ga khác (`soat-ve`, `kiem-tra/:row`, `qua-buc-tuong`) giữ `default`.
  - **`SplitLayout`** dùng chung gồm `SplitLayout` (lưới), `SplitMain`, `SplitRail` (cột phụ dính: `top` = đáy TopBar + 1rem, cao tối đa vừa màn hình, tự cuộn khi dài hơn). Class riêng của chúng chỉ có tiền tố `lg:`. Class dưới lg do nơi gọi truyền qua `className`, và phải trùng với class `flex flex-col gap-*` của phần tử cha, nên ở 375px wrapper "trong suốt". Ba kiểu cột: `rail-left` 13rem | nội dung, `rail-right` nội dung | 20rem, `theory-practice` 2fr | 3fr.
  - **Phần chỉ có trên máy tính** (mục lục, ô ghi chú mở sẵn, stepper dọc, cột lý thuyết) nằm trong file riêng có marker `mobile-guard: desktop-only`, và ẩn dưới lg (`hidden lg:…`). Không thêm class không tiền tố vào file có sẵn.
  - **Bài học:** cột trái là header và các thẻ đoạn. Cột phải dính gồm:
    - "Mục lục bài", sinh từ đúng thứ tự `prioritizeSections`. Có các nhóm "1. Lý thuyết" (pronunciation, grammar), "Luyện" (các đoạn khác) và "Giải trí" (entertainment). Nhóm rỗng bị bỏ và số được đánh lại. Mục có nhãn "Ưu tiên" như thẻ đoạn. Link tới `sectionHref` (replace). Mục trùng `sectionId` trên URL có `aria-current="location"`. Không theo dõi vị trí cuộn.
    - Nút "Kiểm tra bài", nút nhập vai, "Đánh dấu đã học xong" (giữ DOM cũ).
    - Ô "Ghi chú cho bài này" mở sẵn với `NoteForm`. Lưu xong thì xoá trắng form và hiện "Đã lưu ghi chú vào Sổ tay.". Nút mở Sheet ẩn từ lg; dưới lg vẫn dùng Sheet.
  - **Buổi học:** cột trái dính (chỉ máy tính) có stepper dọc sinh từ `plan.steps` (icon, tên, phút, `aria-current="step"`; bấm một bước thì `goTo`, không khoá bước nào) và nút "Tiếp: …" / "Xong buổi" / "Quay lại" dùng chung handler. Từ lg, stepper ngang và hàng nút đáy ẩn. `StepClock` và nội dung bước ở cột phải.
  - **Viên gạch** (cả trang và trong buổi): link, header và thanh tiến độ trải hết bề rộng. Bên dưới, cột trái dính "Lý thuyết của viên" có mục tiêu (`goalVi`) và các màn lý thuyết **đã qua** (explain/contrast/worked có vị trí < màn hiện tại), vẽ bằng `BrickScreen`. Ở màn 1 chỉ có mục tiêu và dòng "Màn lý thuyết bạn đã xem sẽ nằm ở đây để tra lại khi luyện.". Cột phải là màn hiện tại và điều hướng màn. Luồng màn, `completeBrick` và "Màn n/6" không đổi.
  - **Trạng thái một cột trên route `wide`** (không tìm thấy bài, viên "Đang soạn", buổi đã xong) thêm `lg:mx-auto lg:w-full lg:max-w-3xl` để vẫn rộng 768px.
  - **Nội dung bài từ lg:** `TenseTimeline` rộng tối đa `lg:max-w-md`; danh sách âm trong `SoundTable` 2 cột; lưới từ tự đọc (`SelfReadBlock`) trong `PronunciationBlocks` 3 cột.
  - **`layout:check`:** `WIDE_ROUTES` thêm 3 route + link sâu. Từ lg, route `wide` phải có ít nhất một `[data-split-rail]` hiện. Sau khi cuộn 600px, cột phụ mà khung cha còn đủ chỗ không được trôi lên trên mốc dính.

**Problem:** Từ 1024px, các trang học vẫn là một cột 768px. Khi làm câu luyện, Huy phải cuộn lên hoặc bấm "Xem lại giải thích" để xem lại lý thuyết. Trang bài dài không có mục lục, và ghi chú mở Sheet đè lên bài. Trong buổi học, nút "Tiếp" nằm cuối trang, nên khi bước dài phải cuộn xuống mới thấy.

**Approach:** Thêm `SplitLayout` (chỉ class `lg:`) và các cột phụ chỉ có trên máy tính trong file có marker. Bọc phần có sẵn của Lesson/Session/BrickPlayer bằng wrapper có cùng class gap với cha, rồi gắn `handle: { layout: 'wide' }` cho 3 route. Ảnh 375px phải trùng với bản gốc (`layout:check`).

## Boundaries & Constraints

**Always:**
- Dưới 1024px giao diện không đổi từng pixel và thứ tự DOM của phần đang hiện giữ nguyên. File có sẵn chỉ được thêm class có tiền tố `lg:`/`xl:`. Wrapper mới dưới lg phải có đúng `flex flex-col gap-N` của cha trực tiếp. Phần tử chỉ có trên máy tính dùng `hidden lg:…` và nằm trong file có marker. Một wrapper mà mọi con đều chỉ có trên máy tính thì chính nó cũng phải `hidden` dưới lg (nếu không, wrapper rỗng sẽ thêm một khoảng gap).
- Trang vẫn cuộn trên window. Chỉ `SplitRail` được tự cuộn (`lg:overflow-y-auto`) khi cao hơn màn hình.
- Logic sinh mục lục, stepper và màn lý thuyết đã qua là hàm thuần có unit test. Bố cục được kiểm bằng `layout:guard` và `layout:check` với base là baseline.
- Mỗi hành động chỉ có một handler: nút trong cột phụ gọi đúng hàm có sẵn (`goTo`, `finish`, `setCompleted`, `create`).

**Never:**
- Không làm phím tắt, gợi ý `<kbd>`, lưới Hôm nay/Lộ trình hay thanh bên trái (story 31 / để sau). Không gắn `wide` cho route ngoài 3 route trên.
- Không sửa store, schema, sync, dữ liệu bài/viên, `sessionPlan`, `prioritizeSections`, `NoteForm`, `sheet.tsx`, `SessionDoneView`, `AppShell`, `TopBar`.
- Không xoá hay sửa class không tiền tố có sẵn. Không đổi thứ tự DOM của phần đang hiện ở 375px.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Điện thoại | 375px, mọi route trong `ROUTES` | Ảnh toàn trang trùng tuyệt đối với baseline; không có mục lục, ô ghi chú mở sẵn hay stepper dọc | Lệch → `layout:check` exit 1 |
| Ngay dưới mốc | 1023px, `/roadmap/lesson/s1-t1-w1` | Một cột 448px, nút "Ghi chú cho bài này" mở Sheet như cũ | N/A |
| Bài học máy tính | 1280px, `/roadmap/lesson/s1-t1-w1` | `main` 1024px; trái là thẻ đoạn, phải là cột 20rem có mục lục, các nút việc và ô ghi chú; cuộn 600px thì cột phải dính ở top 72px | N/A |
| Mục lục | Bấm "Ngữ pháp" trong mục lục | URL `…/grammar` (replace), đoạn cuộn tới dưới TopBar, mục có `aria-current="location"` | Id lạ trên URL → không mục nào current |
| Ghi chú mở sẵn | Gõ "Quy tắc" rồi "Lưu ghi chú" | Ghi chú có `lessonId` vào Sổ tay, form trống lại, hiện "Đã lưu ghi chú vào Sổ tay." | Cả 3 ô trống → "Cần ít nhất một ô có chữ.", không lưu |
| Viên gạch màn 1 | 1280px, `/foundation/F01`, màn 1 | Trái: mục tiêu + dòng gợi ý; phải: màn Giải thích | N/A |
| Viên gạch màn luyện | Màn 4–6 | Trái: Giải thích, So sánh, Ví dụ mẫu; phải: màn hiện tại; trái dính khi cuộn | N/A |
| Buổi học máy tính | 1280px, `/session` buổi Sân ga | Trái: 3 bước dọc (Lý thuyết hiện tại), nút "Tiếp: Ôn & từ mới"; phải: header, đồng hồ, viên gạch hai cột; stepper ngang và hàng nút đáy ẩn | N/A |
| Bấm bước | Bấm "Giải trí nhẹ" trong stepper dọc | `?step=fun` (replace), cuộn lên đầu, không khoá | N/A |
| Buổi bài | Buổi `lesson` | Stepper dọc là Bài chính / Ôn flashcard / Giải trí theo `plan.steps` | N/A |
| Một cột | Bài không tồn tại / viên "Đang soạn" / buổi đã "Xong buổi" | Cột 768px nằm giữa | N/A |
| Nội dung bài | 1280px, bài có bảng âm, dòng thời gian, từ tự đọc | SoundTable 2 cột, TenseTimeline ≤ 448px, từ tự đọc 3 cột | N/A |
| `lessonTocGroups` | Thứ tự đã ưu tiên, `weakest` = vocabulary; bài không có đoạn lý thuyết; chỉ có entertainment | Nhóm đúng thứ tự, mục ưu tiên giữ cờ; nhóm rỗng bị bỏ và đánh số lại | N/A |
| `passedTheoryScreens` | index 0 / 1 / 3 / 5 | `[]` / `[explain]` / `[explain, contrast, worked]` / như 3 | index ngoài khoảng → kẹp |
| `stepperItems` | 3 bước, index 1 | `done`, `current`, `upcoming` | N/A |
| Kiểm cột dính | `rails`: top 72 / top 20 với khung còn chỗ / top 20 với khung đã hết | Đạt / lỗi "cột phụ không dính" / đạt (bỏ qua) | exit 1 nếu lỗi |
| Thiếu cột phụ | Route `wide` ở 1280px, không có `[data-split-rail]` nào hiện | Lỗi "thiếu cột phụ" | exit 1 |

</frozen-after-approval>

## Code Map

- `src/app/routes.tsx` -- thêm `handle: { layout: 'wide' } satisfies RouteHandle` cho 3 route. `src/app/route-handle.ts` (`LAYOUT_CLASS`, `layoutFor`) chỉ dùng lại.
- `src/app/route-handle.test.ts:52` -- `it.each([... '/session', '/roadmap/lesson/s1-t1-w1', '/foundation/F01'])('→ default')` phải tách thành nhóm `wide`.
- `src/pages/Lesson.tsx` -- `LessonNoteButton` (35–71, Sheet + `NoteForm`), thân trang (124–191): `section.flex.flex-col.gap-6` > BackLink, header, thẻ đoạn (`prioritizeSections`), quiz, roleplay, ghi chú, đánh dấu.
- `src/pages/Session.tsx` -- `STEP_ICONS` (55–61), `Stepper` ngang (63–88), `goTo`/`finish` (303–319), view xong (321–327), thân `section.flex.flex-col.gap-5` (331–398).
- `src/components/foundation/BrickPlayer.tsx` -- `SCREEN_TITLES` (14–21), `div.flex.scroll-mt-4.flex-col.gap-4` > link, header, check section (`hidden`), card màn, `nav` điều hướng màn. `BrickScreen.tsx`: `BrickScreen`, `BrickRecap` để dùng lại.
- `src/pages/FoundationBrick.tsx:25` -- section "Viên này đang soạn".
- `src/lib/foundation/player.ts` -- logic thuần của player; thêm `passedTheoryScreens` vào đây (đã có `player.test.ts`).
- `src/lib/placement/gaps.ts:140` -- `THEORY_SECTION_IDS`, `prioritizeSections`. Chỉ dùng lại.
- `src/lib/sessions/plan.ts:22` -- `SessionStep`, `FOUNDATION_STEPS`, `LESSON_STEPS`; `index.ts` re-export.
- `src/components/lesson/TenseTimeline.tsx:29` (`figure`), `SoundTable.tsx:110` (`ul` âm), `PronunciationBlocks.tsx:391` (`SelfReadBlock` grid).
- `scripts/layout/check-lib.mjs` -- `WIDE_ROUTES` (34), `EXPECTED` (52), `layoutProblems` (131); `.d.mts` có `LayoutMetrics`. `scripts/layout/check.mjs:82` `measureExpression` đo sau khi cuộn `SCROLL_PROBE_PX`.
- `scripts/layout/guard-lib.mjs` -- marker `mobile-guard: desktop-only`; chỉ đọc token trong `className=` và `cn(…)`/`cva(…)`. `src/lib/utils.ts` `cn` = `twMerge(clsx())`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/split-layout.ts` -- `SplitCols = 'rail-left' | 'rail-right' | 'theory-practice'`; `SPLIT_COLS` (chuỗi đầy đủ: `lg:grid lg:items-start` + `lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8` / `lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8` / `lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-6`), `SPLIT_MAIN = 'lg:min-w-0'`, `SPLIT_RAIL` (`lg:sticky lg:top-[calc(var(--topbar-height)+1rem)] lg:max-h-[calc(100dvh-var(--topbar-height)-2rem)] lg:min-w-0 lg:overflow-y-auto lg:overscroll-contain`).
- [x] `src/components/SplitLayout.tsx` -- `SplitLayout({ cols, className, children })`, `SplitMain`, `SplitRail` (thêm `data-split-rail`); mỗi cái là `div` với `cn(className, HẰNG)`. Không có chuỗi class không tiền tố.
- [x] `src/lib/lesson-toc.ts` -- `lessonTocGroups(ordered, targetId?)` → `{ key: 'theory' | 'practice' | 'fun'; title: '1. Lý thuyết' …; items: { id, title, priority, current }[] }[]`.
- [x] `src/lib/sessions/stepper.ts` (+ export ở `index.ts`) -- `stepperItems(steps, index)` → `{ ...step, state: 'done' | 'current' | 'upcoming' }[]`.
- [x] `src/lib/foundation/player.ts` -- `passedTheoryScreens(screens, index)`: các màn `explain`/`contrast`/`worked` có vị trí < index (kẹp index).
- [x] `src/components/lesson/LessonRail.tsx` (marker) -- `LessonToc` (`nav aria-label="Mục lục bài"`, `hidden lg:block`) và `LessonNoteInline` (Card `hidden lg:flex`, `NoteForm` có `key` tăng sau khi lưu, trạng thái `role="status"`).
- [x] `src/pages/Lesson.tsx` -- BackLink giữ nguyên; header + thẻ đoạn vào `SplitMain`; quiz, roleplay, `LessonNoteButton` (wrapper thêm `lg:hidden`), `LessonNoteInline`, khối đánh dấu vào `SplitRail`; `LessonToc` là con đầu của rail. Tất cả wrapper dùng `className="flex flex-col gap-6"`. Section "Không tìm thấy bài" thêm `lg:mx-auto lg:w-full lg:max-w-3xl`.
- [x] `src/components/session/step-icons.ts` -- chuyển `STEP_ICONS` ra khỏi `Session.tsx` (không đổi gì).
- [x] `src/components/session/SessionRail.tsx` (marker) -- `SplitRail` có `hidden lg:flex lg:flex-col lg:gap-4`: `ol` dọc từ `stepperItems` (mỗi bước là `button` có icon, tên, phút), rồi nút Tiếp/Xong buổi (toàn chiều rộng) và Quay lại. Nhận props `steps, stepIndex, onGo, onFinish`.
- [x] `src/pages/Session.tsx` -- BackToToday giữ nguyên; `SplitLayout cols="rail-left" className="flex flex-col gap-5"` > `SessionRail` + `SplitMain className="flex flex-col gap-5"` (header … VocabAttribution). `Stepper` và hàng nút đáy thêm `lg:hidden`. Section của view xong thêm `lg:mx-auto lg:w-full lg:max-w-3xl`.
- [x] `src/components/foundation/screen-titles.ts` -- chuyển `SCREEN_TITLES` ra để BrickPlayer và cột lý thuyết dùng chung.
- [x] `src/components/foundation/BrickTheoryRail.tsx` (marker) -- `SplitRail` có `hidden lg:flex lg:flex-col lg:gap-3`: tiêu đề "Lý thuyết của viên", `goalVi`, các màn từ `passedTheoryScreens` (thẻ có tên màn + `BrickScreen`), hoặc dòng gợi ý khi danh sách rỗng.
- [x] `src/components/foundation/BrickPlayer.tsx` -- sau header bọc `SplitLayout cols="theory-practice" className="flex flex-col gap-4"` > `BrickTheoryRail` + `SplitMain className="flex flex-col gap-4"` (check section, card màn, nav). Không đổi state và luồng.
- [x] `src/pages/FoundationBrick.tsx` -- section "Đang soạn" thêm `lg:mx-auto lg:w-full lg:max-w-3xl`.
- [x] `src/components/lesson/TenseTimeline.tsx` / `SoundTable.tsx` / `PronunciationBlocks.tsx` -- `lg:max-w-md` cho `figure`; `lg:grid lg:grid-cols-2` cho `ul` âm; `lg:grid-cols-3` cho grid từ tự đọc.
- [x] `src/app/routes.tsx` -- gắn `wide` cho 3 route.
- [x] `scripts/layout/check-lib.mjs` + `.d.mts` + `check.mjs` -- `WIDE_ROUTES` = lesson, link sâu, `/foundation/F01`, `/session`. `EXPECTED.railStickyOffset = 16`. Thêm metric `rails: { top, height, containerBottom }[] | null` (các `[data-split-rail]` đang hiện, đo sau khi cuộn khi `scrollY ≥ 1`) và `railCount`. `layoutProblems`: khi desktop + `wide` thì `railCount === 0` → "thiếu cột phụ"; với mỗi rail có `containerBottom ≥ topBarHeight + 16 + height` mà `top < topBarHeight + 16 − TOLERANCE` → "cột phụ không dính".
- [x] Tests -- `src/lib/split-layout.test.ts` (mọi token bắt đầu bằng `lg:`), `src/lib/lesson-toc.test.ts`, `src/lib/sessions/stepper.test.ts`, `src/lib/foundation/player.test.ts` (`passedTheoryScreens` trên mảng giả lẫn F01 thật), `src/lib/layout-check.test.ts` (các dòng kiểm cột dính và thiếu cột phụ), `src/app/route-handle.test.ts` (3 route + link sâu → `wide`; `/`, `/roadmap`, `/foundation`, `/foundation/soat-ve`, `/foundation/kiem-tra/A`, `/foundation/qua-buc-tuong` → `default`).
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- dòng UI: trang hai cột dùng `SplitLayout` (`src/components/SplitLayout.tsx`); phần chỉ có trên máy tính nằm trong file có marker `mobile-guard: desktop-only`; wrapper mang gap của cha.

**Acceptance Criteria:**
- Given laptop 1280px đang học viên F03 trong buổi 30', when tới màn Luyện tập, then phần giải thích và so sánh Việt–Anh vẫn hiện bên trái, nút "Tiếp" của buổi luôn thấy ở cột trái, và xong viên vẫn có "Học tiếp viên sau".
- Given trang bài dài trên laptop, when cuộn xuống đoạn Từ vựng, then mục lục, các nút việc và ô ghi chú vẫn dính bên phải, và ghi chú lưu được mà không có Sheet nào đè lên bài.
- Given iPhone 375px, when mở Bài học, Buổi học, Viên gạch sau story này, then giao diện và cách dùng (kể cả Sheet ghi chú) y như trước.
- Given cửa sổ laptop kéo hẹp dưới 1024px, when mở các trang trên, then chúng trở về một cột như điện thoại.

## Implementation Notes

- **`SplitLayout`** (`src/components/SplitLayout.tsx`, không marker, không có chuỗi class nào): `cn(className, HẰNG)` với hằng ở `src/lib/split-layout.ts`. `SPLIT_RAIL` thêm `lg:p-1` ngoài chuỗi trong task: khung `overflow-y-auto` cắt cả chiều ngang, chừa 4px để viền focus (ring 3px) của nút/link sát mép cột không bị cắt (mục kiểm tay "cột phụ không bị cắt viền focus"). Không dùng margin âm vì sticky tính theo margin box, sẽ làm cột dính lệch khỏi 72px.
- **Bài học**: `ordered = prioritizeSections(...)` tính một lần, dùng cho thẻ đoạn và `lessonTocGroups(ordered, target)`. Rail dưới lg vẫn hiện (chứa quiz, roleplay, nút Sheet, đánh dấu) nên mang `flex flex-col gap-6`; `LessonToc` (`nav hidden lg:block`) và `LessonNoteInline` (Card `hidden lg:flex`) là `display:none` dưới lg nên không thêm gap. Nút "Kiểm tra bài" thêm `lg:self-stretch` để vừa cột 20rem. `LessonNoteInline` giữ `<p role="status">` luôn có trong DOM (vùng live), chữ chỉ hiện sau khi lưu; lưu lỗi thì xoá trạng thái đã lưu.
- **Buổi học**: `SessionRail` nhận `onGo={goTo}`, `onFinish={finish}` (cùng handler với hàng nút đáy). Stepper dọc là `ol aria-label="Các phần của buổi"` giống stepper ngang (chỉ một cái hiện mỗi bề rộng); bước đã qua có dấu ✓ (`aria-label="Đã qua"`). Nút "Tiếp: …" cho xuống dòng trong cột 13rem.
- **Viên gạch**: `BrickTheoryRail` nhận `index` và `seed` của player; `passedTheoryScreens` trả kiểu `Extract<S, { kind: 'explain' | 'contrast' | 'worked' }>[]` để truyền thẳng vào `BrickScreen`. Màn check vẫn luôn gắn (thuộc `SplitMain`), luồng màn và `completeBrick` không đổi.
- **`layout:check`**: `railCount` đo trước khi cuộn, `rails` (top, height, đáy khung cha) đo cùng lúc với TopBar sau khi cuộn 600px (`scrollY ≥ 1`). Chỉ trang bài cuộn được ở 1024–1920 với dữ liệu sạch; `/foundation/F01` và `/session` (màn 1) ngắn hơn viewport nên chỉ có kiểm "thiếu cột phụ". **Sửa thêm `check.mjs`**: chụp ảnh toàn trang giờ chờ 2 frame trước `Page.getLayoutMetrics`. Lần chạy đầu `/` báo lệch ảnh (base 375×812, mới 375×960) dù story không đụng Hôm nay: probe cho thấy ngay sau khi đổi viewport 1920→375 và chuyển hướng `/`→`/welcome`→`/`, `cssContentSize` còn là 812 trong khi `scrollHeight` là 960, nên ảnh bị cắt tuỳ thời điểm (ảnh mới của `/` trùng byte với ảnh của lượt HEAD-vs-HEAD).
- **Kết quả chạy thật**: `npm run lint && npm test && npm run build` đạt (74 file test, 1654 test). `layout:guard --base c31291c…` exit 0 (19 file, không token không tiền tố nào bị thêm/xoá). `layout:check --base c31291c…` ĐẠT: 12 route × 5 bề rộng, ảnh 375px trùng bản gốc, 3 route `wide` có `main` 1024px và cột phụ. Kiểm âm tính: tạm bỏ `lg:sticky` khỏi `SPLIT_RAIL` thì `layout:check --skip-diff` báo "cột phụ không dính: top -484px" ở trang bài 1024/1280/1920 (exit 1); đã trả lại. Ảnh 1280px của trang bài, `/foundation/F01`, `/session` đã xem: hai cột cân, mục lục + nút việc + ô ghi chú bên phải; stepper dọc bên trái buổi học; "Lý thuyết của viên" có mục tiêu + dòng gợi ý ở màn 1.
- **Kiểm thao tác (lúc triage review)**: script CDP tạm (Chrome headless, cùng helper với `check.mjs`, không commit) chạy 18 kiểm, đạt hết: ô ghi chú mở sẵn lưu → form trống + "Đã lưu ghi chú vào Sổ tay.", store có `lessonId`, Sổ tay có ghi chú + link `#/roadmap/lesson/s1-t1-w1`; lưu form trống → chỉ còn lỗi "Cần ít nhất một ô có chữ."; gõ tiếp → xoá trạng thái, lưu lần hai → hiện lại; bấm mục lục "Từ vựng" → URL `/vocabulary` (history không tăng), `aria-current`; rail bài dính ở 72px khi cuộn; stepper dọc bấm bước 3 → `step=fun`, "Quay lại", "Tiếp: …", "Xong buổi" → view xong; F01 tới "Màn 5/6" → cột trái có 3 màn lý thuyết; 1023px không có mục lục / ô mở sẵn, nút mở Sheet. Còn lại cho Huy: xem bằng mắt trên laptop thật (xem Review Triage Log).
- **Sửa sau review**: `LessonNoteInline` xoá trạng thái "Đã lưu…" khi gõ (`onInput`) và trước mỗi lần lưu (`onSubmitCapture` trên `CardContent`), vì `NoteForm` tự chặn form trống mà không gọi `onSubmit`. Tiêu đề mục lục là `h2`. `layout:check` thêm `RAIL_LANDMARKS`: từ lg, `/session` phải thấy `ol[aria-label="Các phần của buổi"]` trong `[data-split-rail]`, trang bài phải thấy `nav[aria-label="Mục lục bài"]` (kiểm âm tính: ẩn `SessionRail` → lỗi "thiếu nội dung cột phụ" ở 1024/1280/1920). `split-layout.test.ts` khoá thêm `lg:p-1`.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|-----------|-------|
| 1 | blind | Ô ghi chú mở sẵn hiện cùng lúc "Đã lưu…" và lỗi form trống; trạng thái còn khi gõ ghi chú mới; lưu hai lần không đọc lại | medium | `NoteForm.submit` trả về sớm khi `!isNoteFilled` nên không gọi `onSubmit`, `setSaved(false)` không chạy, và `saved` chỉ đổi khi lưu | patch: `onInput`/`onSubmitCapture` trên `CardContent` xoá `saved`; kiểm lại A3–A5 đạt |
| 2 | blind | Nút "Tiếp: Ôn & từ mới" ở cột trái nổi hơn nút "Tiếp" của viên, dễ rời viên giữa chừng | low | Đúng intent (nút Tiếp buổi luôn thấy ở cột trái, tiêu chí 1); trước story nút đáy cũng rời viên được, SPEC không khoá cứng | reject |
| 3 | blind | Cột phụ trang bài cao hơn màn laptop, ô ghi chú và "Đánh dấu" nằm dưới mép | low | Đo thật 1280×800: nội dung 1208px, khung 712px, ô ghi chú bắt đầu 714px; khớp intent "tự cuộn khi dài hơn", vẫn dính và với tới được | defer (deferred-work) |
| 4 | blind | Kiểm dính chỉ một chiều (top quá lớn vẫn đạt) | low | Intent ghi "không được trôi lên trên mốc dính"; lệch xuống khó xảy ra và thấy ngay trong ảnh 1280px | reject |
| 5 | blind | Kiểm dính không chạy trên `/session` và `/foundation/F01` | medium | Hai trang ngắn hơn viewport nên `rails` null (Implementation Notes thừa nhận); script tạm đã kiểm F01 màn 5, buổi học chưa | defer (deferred-work, gộp #20) |
| 6 | blind | Logic stepper / nút điều hướng buổi và wiring lưu ghi chú bị lặp | low | Handler dùng chung (`goTo`, `finish`, `create`) như Boundaries yêu cầu; Boundaries giữ code mobile có sẵn, chỉ thêm class `lg:` | reject |
| 7 | blind | Phần chỉ có trên máy tính đứng trước nội dung chính trong DOM; tiêu đề mục lục là `<p>` | low | Thứ tự DOM trùng thứ tự nhìn (trái → phải), đúng WCAG 2.4.3; riêng tiêu đề mục lục lệch với các khối khác dùng `h2` | patch: đổi `<p>` thành `<h2>` |
| 8 | blind | Phần nối UI không có test, mục kiểm tay còn mở | medium | Vitest env `node`, không test component; các mục "Chưa kiểm bằng tay" chưa chạy | patch: chạy script CDP 18 kiểm (đạt hết), ghi ở Implementation Notes; gộp #19 |
| 9 | blind | Bố cục trong buổi chật (lý thuyết ~304px, luyện ~456px) | low | Số cột do intent chốt (13rem, 2fr/3fr); 304px gần bề rộng điện thoại hẹp mà nội dung đã chạy được | reject (Huy xem bằng mắt) |
| 10 | blind | Phần máy tính vẫn mount trên điện thoại; nháp ô mở sẵn mất khi thu hẹp cửa sổ | low | Design Notes chốt chỉ dùng CSS, không đo màn hình bằng JS; chi phí nhỏ, thu hẹp cửa sổ giữa lúc gõ hiếm | reject |
| 11 | blind | `lg:p-1` không có trong task/test, nội dung cột lệch 4px | low | Implementation Notes giải thích (chừa viền focus); test dùng `arrayContaining` nên bỏ `lg:p-1` vẫn xanh | patch: khoá `lg:p-1` trong `split-layout.test.ts` |
| 12 | blind | Bấm bước đang hiện thì cuộn lên đầu vô ích | low | `goTo` gọi `scrollTo(0,0)` thật, nhưng hiếm và vô hại (về đầu bước); sửa phải thêm nhánh | reject |
| 13 | edge | "Đã lưu…" còn khi gõ ghi chú mới | medium | Cùng gốc với #1 | patch (gộp #1) |
| 14 | edge | Sheet mở dưới 1024px rồi kéo rộng qua lg thì vẫn đè | low | Có thật nhưng hiếm, đóng Sheet được; sửa cần thêm effect `matchMedia` | reject |
| 15 | edge | Bấm bước hiện tại → cuộn lên đầu | low | Trùng #12 | reject |
| 16 | edge | Thứ tự mục lục khác thẻ đoạn khi `entertainment` không ở cuối | false | `week()` ở `stage-1.ts` luôn đẩy `entertainment` cuối; `prioritizeSections` không bao giờ ưu tiên nó nên nó luôn cuối nhóm luyện | reject |
| 17 | edge | Cột phụ ~1000px > 712px ở 1280×800 | low | Trùng #3, đã đo thật | defer (gộp #3) |
| 18 | vgap | `/session` mất cột của buổi mà `layout:check` vẫn đạt (cột "Lý thuyết của viên" làm đủ `railCount`) | medium | Đã xác minh: `railCount` đếm mọi `[data-split-rail]`; hàng nút đáy và stepper ngang `lg:hidden` | patch: `RAIL_LANDMARKS` + test; kiểm âm tính ẩn `SessionRail` → lỗi ở 1024/1280/1920 |
| 19 | vgap | Thao tác chỉ có trên máy tính (lưu ô mở sẵn, stepper dọc, mục lục) chưa được kiểm | medium | Đã xác minh: không test nào chạy qua các handler | patch (gộp #8): script CDP đạt 18/18 |
| 20 | vgap | Verification nói 3 route `wide` có cột phụ dính, thực tế chỉ trang bài được kiểm | medium | `/foundation/F01`, `/session` có `rails` null ở 1024–1920 | defer (gộp #5) |

## Design Notes

Wrapper "trong suốt" dưới lg: cha có `flex flex-col gap-6`, thì mọi wrapper mới cũng phải có đúng `flex flex-col gap-6`. Khi đó khoảng cách giữa các con ở 375px giữ nguyên. Con `display:none` không phải flex item nên không tạo thêm gap.

```tsx
<section className="flex flex-col gap-6">            {/* có sẵn */}
  <BackLink />
  <SplitLayout cols="rail-right" className="flex flex-col gap-6">
    <SplitMain className="flex flex-col gap-6">{header}{cards}</SplitMain>
    <SplitRail className="flex flex-col gap-6"><LessonToc …/>{quiz}{roleplay}{noteButton}<LessonNoteInline …/>{markDone}</SplitRail>
  </SplitLayout>
</section>
```

Cột lý thuyết của viên chỉ hiện màn **đã qua**, nên không trùng với màn đang hiện bên phải. Cách này không cần JS đo màn hình, và luồng màn chạy y nhau ở mọi bề rộng.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run layout:guard -- --base c31291c8345b1e0fd171fe1ab9279eb6ba383f57` -- expected: exit 0. File có marker được bỏ qua; file có sẵn chỉ thêm token `lg:`.
- `npm run layout:check -- --base c31291c8345b1e0fd171fe1ab9279eb6ba383f57` -- expected: exit 0. Ảnh 375px trùng bản gốc. Ba route `wide` có `main` 1024px ở 1280/1920px, có cột phụ và cột phụ dính. Không có cuộn ngang.

**Manual checks:**
- Xem ảnh `1280-*.png` của Bài học, `/foundation/F01`, `/session` trong thư mục `layout:check` in ra: hai cột cân, cột phụ không bị cắt viền focus.
- Ở 1280px, mở F01 và đi tới màn 5 thì cột trái có đủ 3 màn lý thuyết. Trên trang bài, lưu một ghi chú ở ô mở sẵn, rồi kiểm tra trong Sổ tay thấy ghi chú có link về bài.
