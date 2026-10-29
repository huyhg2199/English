---
title: 'Dữ liệu lộ trình 3 chặng và Bản đồ Năm học'
type: 'feature'
created: '2026-10-30'
status: 'done'
baseline_commit: '66f8ff04ea7f1dbaffbf273322a3111810dd6849'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/brainstorming/brainstorm-english-learning-website-2026-10-29/lo-trinh-toeic-12-thang.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/hp-theme.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:**
- Trạm "đã qua" = id bài nằm trong `progress.completedLessonIds` của store (v2, có migration 1→2). Trang bài có nút tạm "Đánh dấu đã học xong" / "Bỏ đánh dấu"; story 4/6 sau này ghi vào cùng field. Store phải reactive (đóng triage #10 của story 1) để bản đồ cập nhật ngay.
- Giữ spec dài hơn 1600 token (Huy chấp nhận).
- Supabase (nơi lưu chính, local-first + đồng bộ, magic link, giữ Gist ở story 13) là story `2a` riêng, làm ngay sau story này. Story 2 vẫn chỉ dùng localStorage qua lớp store; mọi đọc/ghi tiến độ đi qua context để story 2a thay backend ở một chỗ.

**Problem:** Tab Lộ trình mới là placeholder, app chưa có dữ liệu lộ trình. Các story sau (buổi học, test bám bài, gia hạn, O.W.L.) cần một mô hình chặng/tuần/bài có địa chỉ ổn định tới từng đoạn bài và tag kỹ năng.

**Approach:** Chép `lo-trinh-toeic-12-thang.md` thành dữ liệu tĩnh có kiểu (3 chặng → 12 tháng → 48 tuần, mỗi tuần là một bài có các đoạn mang anchor + tag kỹ năng). Trang Lộ trình vẽ bản đồ 3 Năm học: mỗi chặng có Can-do, điểm ước tính, kỳ kiểm tra cuối chặng, các trạm (tuần) xếp theo tháng; trạm đã qua sáng lên. Bấm trạm mở trang chi tiết bài liệt kê các đoạn, link `#/roadmap/lesson/:lessonId/:sectionId` cuộn tới đúng đoạn.

## Boundaries & Constraints

**Always:**
- Nội dung (tên chặng, tháng, việc từng tuần, Can-do, điểm ước tính, kỳ kiểm tra, ngưỡng qua cửa) khớp `lo-trinh-toeic-12-thang.md`. Tên theo theme: Năm 1–2 / 3–4 / 5–7, O.W.L. 1, O.W.L. 2, N.E.W.T.
- Id chặng/bài/đoạn là chuỗi ổn định, viết tay, không sinh theo index mảng (sau này tiến độ và câu hỏi tham chiếu tới chúng). Id đoạn duy nhất trong bài.
- Tag kỹ năng chỉ dùng tập trong `learning-rules.md`: `listening`, `reading`, `pronunciation`, `grammar`, `vocabulary`.
- Link về đoạn bài dùng hash route, reload vẫn đúng chỗ. Mobile-first 375px, không cuộn ngang. Chữ tiếng Việt.
- Thêm field vào store thì tăng `CURRENT_VERSION` kèm migration, không reset dữ liệu.

**Never:**
- Không có nội dung bài thật (lý thuyết, bài tập, phát âm, thần chú) — thuộc story 6/10. Trang chi tiết bài chỉ hiện việc cần làm và nguồn của từng đoạn.
- Không tính trễ/gia hạn (story 11), không xếp chỗ theo Mũ Phân Loại (story 5), không ghi tiến độ từ buổi học (story 4).
- Không parse markdown lúc chạy app. Không thêm thư viện animation trong story này.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Chưa học gì | Store không có tiến độ | Bản đồ đủ 3 chặng, mọi trạm tối, trạm đầu tiên được đánh dấu "học tiếp" | N/A |
| Đã qua vài trạm | Tiến độ chứa id bài đã xong | Trạm đó sáng lên; trạm "học tiếp" là bài chưa xong đầu tiên | N/A |
| Link đúng | `#/roadmap/lesson/s1-t1-w3/grammar` | Mở bài, cuộn tới và highlight đoạn ngữ pháp | N/A |
| Bài không tồn tại | `#/roadmap/lesson/abc/xyz` | Thông báo "Không tìm thấy bài" + nút về Lộ trình | Không crash |
| Đoạn không tồn tại | Bài đúng, đoạn sai | Mở bài từ đầu, không highlight | Không crash |
| Tiến độ có id lạ | Id bài đã bị xoá khỏi dữ liệu | Bỏ qua id lạ, không xoá khỏi store | N/A |

</frozen-after-approval>

## Code Map

- `src/pages/Roadmap.tsx` -- placeholder hiện tại, thay bằng bản đồ. Giữ kiểu header (icon + `h1`) của `src/pages/PagePlaceholder.tsx`.
- `src/app/routes.tsx` -- thêm route `roadmap/lesson/:lessonId/:sectionId?` trong `AppShell`. Không đổi 5 route cũ và route `*`; `src/app/nav-items.test.ts` phải vẫn pass.
- `src/components/BottomNav.tsx` -- `NavLink` tới `/roadmap`; không cần sửa: trang bài dùng route `roadmap/lesson/:lessonId/:sectionId?` nên `NavLink` (không `end`) của tab Lộ trình vẫn sáng.
- `src/lib/storage/migrations.ts` -- `CURRENT_VERSION = 1`, `migrations = {}`; theo comment ở đó để thêm migration 1→2.
- `src/lib/storage/storage.ts` -- `saveStore(loaded, next)` sửa trực tiếp object, React không re-render (triage #10 story 1). Không đổi I/O Matrix của story 1.
- `src/app/store-context.ts`, `src/main.tsx` -- context hiện truyền `LoadedStore` tĩnh; nơi để thêm state/subscribe nếu cần ghi.
- `src/components/ui/card.tsx`, `button.tsx` -- dùng lại. Token màu ở `src/index.css` (`--primary` vàng nến, `--candle-glow`) cho trạm sáng.
- `vite.config.ts` -- test env `node`, chỉ `src/**/*.test.ts`; test logic thuần, không test component.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/roadmap/types.ts` -- kiểu `Stage`, `Month`, `Lesson`, `Section`, `SkillTag`, `Checkpoint` (tên, phạm vi, ngưỡng qua cửa) -- nền cho story 4–14.
- [x] `src/data/roadmap/stage-1.ts`, `stage-2.ts`, `stage-3.ts`, `index.ts` -- chép đủ 48 tuần; chặng 1 mỗi tuần có đoạn `pronunciation`, `grammar`, `vocabulary` (từ lũy kế), `entertainment`; chặng 2/3 mỗi tuần một đoạn chính theo bảng, tag theo Part (Part 1–4 → listening, 5–7 → reading, kèm grammar/vocabulary nếu ô có). Tuần kiểm tra trỏ tới `Checkpoint`. Kèm Can-do, điểm ước tính, nguồn miễn phí, việc cố định của chặng.
- [x] `src/data/roadmap/lookup.ts` -- `getLesson(id)`, `getSection(lessonId, sectionId)`, `sectionHref(lessonId, sectionId)`, `allLessons()` theo thứ tự -- story 9 dùng để link câu sai về đoạn.
- [x] `src/data/roadmap/roadmap.test.ts` -- 3 chặng/12 tháng/48 bài; id bài và id đoạn duy nhất; mọi tag thuộc tập cho phép; `sectionHref` của mọi đoạn khớp route qua `matchRoutes`; đối chiếu ô bảng tuần của chặng 1 và các ô tháng chặng 2/3 với file `lo-trinh-toeic-12-thang.md` (đọc bằng `fs`).
- [x] `src/lib/roadmap-progress.ts` (+ `.test.ts`) -- từ dữ liệu + tiến độ tính trạm đã qua và trạm "học tiếp", bỏ qua id lạ -- phủ các dòng I/O Matrix về tiến độ.
- [x] `src/pages/Roadmap.tsx`, `src/components/roadmap/*` -- bản đồ dọc kiểu đường đi game: 3 thẻ Năm học (Can-do, điểm ước tính, kỳ kiểm tra cuối), trạm tuần gom theo tháng, trạm đã qua sáng (glow vàng nến), trạm học tiếp nổi bật.
- [x] `src/pages/Lesson.tsx`, `src/app/routes.tsx` -- trang chi tiết bài: các đoạn có `id` = sectionId, có `sectionId` thì `scrollIntoView` + highlight; xử lý bài/đoạn không tồn tại.
- [x] `src/lib/storage/migrations.ts`, `src/app/store-context.ts`, `src/main.tsx` -- `CURRENT_VERSION = 2`, migration 1→2 thêm `data.progress = { completedLessonIds: [] }` giữ field cũ; context cung cấp store reactive + hàm cập nhật đi qua `saveStore` (chế độ `memory`/`read-only` vẫn cập nhật UI nhưng không ghi) -- Decisions.
- [x] `src/pages/Lesson.tsx` -- nút "Đánh dấu đã học xong" / "Bỏ đánh dấu" -- Decisions.
- [x] `src/lib/storage/storage.test.ts` -- thêm ca migrate v1 → v2 giữ dữ liệu cũ; 5 ca I/O Matrix story 1 vẫn pass.

**Acceptance Criteria:**
- Given mở tab Lộ trình ở 375px, when cuộn hết trang, then thấy 3 Năm học với tên, tháng, Can-do, điểm ước tính và kỳ kiểm tra khớp file lộ trình, không cuộn ngang.
- Given đang ở bản đồ, when bấm một trạm, then mở đúng bài đó và tab Lộ trình vẫn được highlight.
- Given một `sectionHref` bất kỳ, when mở hoặc reload, then trang bài cuộn tới đúng đoạn.
- Given `npm test`, when chạy, then test đối chiếu dữ liệu với `lo-trinh-toeic-12-thang.md` pass.

## Implementation Notes

- Store reactive: `createStoreHandle` (store-context.ts) bọc `LoadedStore`, ghi qua `saveStore`, `useSyncExternalStore` để re-render; `useProgress()` là điểm đọc/ghi tiến độ duy nhất (story 2a thay backend ở đây). `createDefaultStore` vẫn trả `data: {}` để 5 ca I/O Matrix story 1 giữ nguyên; reader tiến độ chịu được thiếu `progress`.
- Migration 1→2 giữ `progress` nếu đã có dạng object, ngược lại thêm `{ completedLessonIds: [] }`.
- Test đọc file md bằng `node:fs` nên thêm `tsconfig.test.json` (types `node`) và loại `*.test.ts` khỏi `tsconfig.app.json`; app code không thấy kiểu Node.
- Nguồn miễn phí của từng đoạn lấy theo tag (`resourcesForSection`); đề ETS chặng 3 chỉ hiện ở đoạn N.E.W.T. Tag chặng 1: phát âm tuần có dạng yếu/nối âm/shadowing thêm `listening`; tuần Tết tag `vocabulary`+`reading` (chế độ ngày lười).

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | verif-gap | Trang bài (`id` đoạn để cuộn, nút đánh dấu) không có test render | medium | Đã xác minh trước; test env `node`, không có DOM/testing-library. Quyết định logic đã tách vào `resolveLessonRoute` có test | defer |
| 2 | edge, blind | Nhiều tab ghi đè tiến độ của nhau | low | Đúng: handle không nghe sự kiện `storage`. Dùng 1 người trên PWA iPhone (1 cửa sổ), sửa phải thêm listener + reload → reject; story 2a (đồng bộ) xử lý | reject |
| 3 | edge | Ghi lỗi một lần thì mãi ở chế độ `memory` | low | Hành vi có chủ đích từ story 1 (triage #7), banner `storageNotice` hiện; không do story này gây ra | reject |
| 4 | edge | Đánh dấu ở chế độ memory/read-only không báo chưa lưu | false | `AppShell` hiện banner theo `mode` (`storage-notice.ts`), snapshot đổi `mode` nên banner hiện ngay | reject |
| 5 | edge | `setLessonCompleted` xoá phần tử không phải chuỗi khỏi `completedLessonIds` | low | Đúng: mảng ghi lại lấy từ `readCompletedLessonIds` đã lọc; trái matrix "không xoá khỏi store"; sửa trực tiếp | patch |
| 6 | edge (×2), blind | Migration 1→2 ghi đè `progress` không phải object / để thiếu field | false | Store v1 (story 1) luôn `data: {}`, không ai ghi `progress` trước v2; reader đã phòng thủ thiếu field | reject |
| 7 | edge (×2), blind | Bấm link tới đúng đoạn đang là URL thì không cuộn | low | Đúng: deps effect `[lessonId, target]` không đổi; thêm `location.key` là sửa trực tiếp | patch |
| 8 | edge, blind | Về Lộ trình từ trang bài giữ vị trí cuộn cũ | medium | Đúng: router không có `ScrollRestoration`; bản đồ 48 trạm dài nên dễ gặp | patch |
| 9 | edge, blind | `fixedTasks`/`resources` của chặng không hiện; nguồn "Viết (trục phụ)" (tags rỗng) không xuất hiện | low | Grep `.tsx`: không chỗ nào render `fixedTasks`/`stage.resources`; doc kiểu nói "chỉ hiện ở thẻ chặng" | patch |
| 10 | edge | Không phải tuần nào chặng 1 cũng có đủ 4 đoạn | false | Ô "—" trong md (tuần Tết, O.W.L. 1) bị bỏ đúng theo md; test đối chiếu kiểm; `getSection` trả undefined an toàn | reject |
| 11 | blind | Heading nhảy từ h1 xuống h3 | low | Đúng: `CardTitle` là `div`; đổi sang `h2` là sửa trực tiếp | patch |
| 12 | blind | Mô hình tiến độ (mảng id trần) không đủ cho đồng bộ 2 chiều story 2a | medium | Không có timestamp/tombstone nên merge sẽ hồi sinh bài đã bỏ đánh dấu; thuộc thiết kế story 2a | defer |
| 13 | blind | Thiếu test memory mode và ghi lỗi giữa phiên trong `store-context` | low | Đã xác minh: chỉ có test persistent/read-only; thêm test là trực tiếp | patch |
| 14 | blind | Đoạn giải trí chặng 1 đều tag `listening` | low | "YouGlish 5 từ/ngày" là phát âm, "Từ điển nói tắt" là từ vựng; sửa dữ liệu trực tiếp | patch |
| 15 | blind | Trang bài không có nút bài trước/sau | low | Không nằm trong intent; thêm UI mới → reject | reject |
| 16 | blind | Id DOM đoạn (`main`, `grammar`) chung chung có thể trùng | low | Hiện không có phần tử nào trùng (`index.html` chỉ có `#root`); giả định tương lai → reject | reject |
| 17 | blind | Đoạn sai vẫn nằm trên URL | low | Matrix chỉ yêu cầu mở từ đầu; thêm `replace` là logic mới → reject | reject |
| 18 | blind | Sổ sách spec cũ (status, change log) | false | Status đã `in-review`; Implementation Notes ghi đủ; sửa spec của build → reject | reject |
| 19 | blind | Test đối chiếu md và tsconfig test dễ gãy | low | Gãy khi md đổi là chủ đích (phát hiện lệch); `*.test.tsx` chưa tồn tại | reject |

## Design Notes

Id dạng `s1-t1-w3` (chặng 1, tháng T1, tuần 3); đoạn: `pronunciation`, `grammar`, `vocabulary`, `entertainment`, `main`, `checkpoint`. Link không dùng `#anchor` thật vì hash router đã chiếm phần hash, nên sectionId là một segment route:

```ts
sectionHref('s1-t1-w3', 'grammar') // → '/roadmap/lesson/s1-t1-w3/grammar'
// <Link to={...}> → /English/#/roadmap/lesson/s1-t1-w3/grammar
```

Dữ liệu viết tay bằng TS (không parse md lúc build): file md là văn xuôi + bảng, parse dễ gãy; test đối chiếu thay cho việc sinh tự động.

## Verification

**Commands:**
- `npm run lint` -- expected: không lỗi
- `npm test` -- expected: test storage, nav, roadmap, progress pass
- `npm run build` -- expected: build thành công

**Manual checks (if no CLI):**
- `npm run dev` ở 375px: bản đồ đủ 3 chặng, bấm trạm vào bài, reload link đoạn vẫn đúng chỗ.
