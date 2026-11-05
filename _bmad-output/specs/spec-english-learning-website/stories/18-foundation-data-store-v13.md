---
title: 'Mô hình dữ liệu Sân ga 9¾, store v13, đồng bộ và lib/foundation (CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'fddabe51880d801d0c019b6ea50ced29583b20d4'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Mốc 750:** lịch 12 tháng đếm từ ngày qua (hoặc bỏ qua) Sân ga; không bao giờ hiện "lùi N tuần" vì Sân ga. Story này chỉ cung cấp `scheduleStartDate`, chưa nối vào lịch.
- **Kiểm tra cả 4 hàng trước (Soát vé):** lần đầu vào Sân ga thì mời 4 bài kiểm tra theo hàng A–D. Hàng đạt ≥ 70% tính là xong. Bỏ qua Soát vé được. Không khoá viên nào. Tiến độ bài và thẻ SRS cũ giữ nguyên. Story này chỉ lưu trạng thái Soát vé (`placement`) và kết quả theo hàng (`rows`).
- **Nhịp:** 1 viên mỗi buổi + "Học tiếp viên sau" (story 21). Story này chỉ ghi viên đã xong.
- **Máy tính:** không liên quan story này (chưa có UI).
- Claude chọn:
  - shape `foundation` và luật gộp lấy đúng dòng "Sân ga 9¾" trong `stack.md`;
  - viên ghi `firstDoneAt` (lần đầu xong, cho +5 điểm Nhà ở story 26) và `lastDoneAt` (lần xong gần nhất, cho ngày lười);
  - 70% so bằng số nguyên (`correct * 10 >= total * 7`, nên 8 câu cần 6);
  - ngày tính theo giờ máy;
  - hai máy mỗi bên xong một nửa số hàng thì khi gộp, `completedAt` lấy `updatedAt` mới hơn của hai bên;
  - danh mục 18 viên (chỉ meta, chưa có nội dung màn) nằm trong story này để lib biết viên thuộc hàng nào.

**Problem:** Sân ga 9¾ (CAP-23) cần một nơi lưu tiến độ viên gạch, kết quả kiểm tra hàng, trạng thái Soát vé, bỏ qua/quay lại và ngày bắt đầu lịch. Nơi lưu này phải sống qua migration, đồng bộ hai máy và backup. Story 19–28 đều đọc từ đây.

**Approach:** Làm các phần sau, chưa có UI:
- Kiểu dữ liệu và danh mục 18 viên trong `src/data/foundation`.
- Migration v12 → v13 thêm key `foundation`.
- Thêm `foundation` vào `SYNCED_KEYS`, kèm luật gộp riêng.
- Backup làm sạch key mới.
- Module thuần `src/lib/foundation` để đọc, ghi và suy ra trạng thái theo đúng `learning-rules.md` mục Sân ga.

## Boundaries & Constraints

**Always:**
- Shape v13: `foundation: { bricks: { [brickId]: { firstDoneAt, lastDoneAt, updatedAt } }, rows: { [A|B|C|D]: { passed, best, updatedAt } }, placement: 'pending'|'done'|'skipped', completedAt, skippedAt, resumedAt, welcomeSeenAt (ISO hoặc null), pausedDays (số nguyên ≥ 0), updatedAt }`.
- Migration không xoá dữ liệu cũ:
  - Thiếu key thì tạo mặc định: `{ bricks: {}, rows: {}, placement: 'pending', completedAt: null, skippedAt: null, resumedAt: null, pausedDays: 0, welcomeSeenAt: null, updatedAt: LEGACY_UPDATED_AT }`.
  - Đã là object thì giữ nguyên.
  - Giá trị lạ thì dùng mặc định + `legacy`.
  - Các key khác, kể cả `store.data.placement` của Mũ Phân Loại, không đổi.
- Store chưa có key (người dùng mới, `createDefaultStore`) đọc ra đúng mặc định trên. Mục sai dạng bị bỏ qua khi đọc, không bị xoá.
- Mọi hàm ghi là hàm thuần `(store, …, now: Date) => Store`:
  - `updatedAt` dùng `nextUpdatedAt` (không lùi);
  - không có gì đổi thì trả về đúng object store cũ.
- Luật suy ra theo `learning-rules.md`:
  - **Hàng xong** = `rows[r].passed`, hoặc mọi viên của hàng đã có `firstDoneAt`.
  - **Viên đã dạy** = viên xong, hoặc hàng của nó `passed`, hoặc `skippedAt` khác null. Cổng đã mở thì không đóng.
  - **Đang ở Sân ga** = `completedAt` null và (`skippedAt` null hoặc `resumedAt` khác null).
  - **Bỏ qua lại hoặc qua tường khi đang quay lại:** cộng số ngày từ `resumedAt` tới hôm đó vào `pausedDays`, rồi xoá `resumedAt`.
- Luật gộp (`stack.md`):
  - viên: `updatedAt` mới hơn thắng, nhưng `firstDoneAt` lấy sớm nhất và `lastDoneAt` lấy muộn nhất;
  - hàng: `passed` = một bên đạt là đạt, `best` lấy max;
  - `completedAt`, `skippedAt`, `welcomeSeenAt` lấy ngày sớm nhất;
  - `placement`: `done`/`skipped` thắng `pending`, hai bên đều khác `pending` thì theo `updatedAt`;
  - `resumedAt`, `pausedDays` và field lạ theo `updatedAt` của cả object (bằng nhau thì giữ local); ngoại lệ: bên thắng chưa từng bỏ qua (`skippedAt` null) mà bên kia đã bỏ qua thì `resumedAt`, `pausedDays` lấy theo bên kia;
  - gộp xong đã có `completedAt` mà còn `resumedAt` thì đóng lần quay lại tại `completedAt` (cộng ngày vào `pausedDays`, giữ `updatedAt`), như khi qua tường trên một máy;
  - gộp hai lần cùng dữ liệu cho ra cùng kết quả (không đẩy lặp).
- `src/lib/foundation` không import `@/lib/schedule` (story 22 sẽ cho schedule gọi foundation, tránh vòng import); helper ngày viết riêng, theo giờ máy như `daysBetween`.

**Never:**
- Không UI, route, hook `useFoundation`, trang Sân ga hay nội dung màn của viên (`screens`, `ruleCards`, từ chủ đề). Phần đó làm ở story 19/20.
- Không viết QuizDef `quiz-f-*`. Không ghi hay chặn Sổ lỗi.
- Không đổi `roadmapStartDate`/lịch, SRS, buổi học, Hôm nay, điểm Nhà, huy chương. Không đổi luật gộp hay shape của key cũ.
- Không đổi `BackupSummary` hay màn Cài đặt. Không đổi giao diện 375px.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Nâng cấp v12 | Store v12 đang học T1, không có `foundation` | v13, `foundation` mặc định (Soát vé `pending`), mọi key khác y nguyên; `isInFoundation` true, `needsPlacement` true | N/A |
| Key có sẵn / lạ | v12 có `foundation` object; hoặc `foundation: [1]` | Object giữ nguyên; giá trị lạ → mặc định + `legacy: [1]` | Không ném lỗi |
| Store mới | `data: {}` ở v13 | `readFoundation` trả mặc định, `foundationState` = đang ở Sân ga, 0/18 | N/A |
| Xong viên | `completeBrick(F02)` lần đầu, rồi học lại hôm sau | Lần đầu `firstDoneAt = lastDoneAt = now`; lần sau `firstDoneAt` giữ, `lastDoneAt` mới | Id không có trong danh mục → trả store cũ |
| Kiểm tra hàng | Hàng A 6/8, rồi lần sau 4/8 | `passed: true`, `best: 75`; lần sau vẫn `passed`, `best` 75 | 5/8 → `passed: false`, `best: 63`; `total ≤ 0` → store cũ |
| Hàng xong do học hết | F17, F18 xong, hàng D chưa kiểm tra | Hàng D xong, `isBrickTaught(F17)` true | N/A |
| Qua tường | Hàng cuối vừa xong (bằng viên hoặc kiểm tra) | `completedAt = now` (chỉ lần đầu), không còn ở Sân ga, `needsPlacement` false | N/A |
| Cổng | Hàng A qua Soát vé, chưa học F03 | `isGateOpen('ipa')` true; chưa gì cả → false; đã từng bỏ qua → mọi cổng true | Cổng lạ → false |
| Bỏ qua | `skipFoundation` ngày 3, bấm lại ngày 5 | `skippedAt` = ngày 3, không đổi ở lần 2; `scheduleStartDate` = ngày 3 | Đã qua tường → store cũ |
| Quay lại rồi bỏ qua | Bỏ qua ngày 3, quay lại ngày 10, bỏ qua lại ngày 13 | Ngày 12 (đang quay lại): đang ở Sân ga, `scheduleStartDate` = ngày 5. Ngày 13: `pausedDays` 3, `resumedAt` null, start = ngày 6 | Quay lại khi chưa bỏ qua / đã qua tường / đang quay lại → store cũ |
| Quay lại rồi qua tường | Bỏ qua ngày 3, quay lại ngày 10, xong hàng cuối ngày 15 | `completedAt` ngày 15, `pausedDays` 5, start = ngày 8 | N/A |
| Chưa bắt đầu lịch | Chưa bỏ qua, chưa qua tường | `scheduleStartDate` = null | N/A |
| Soát vé | `finishPlacement('done')` khi `pending`; rồi gọi `'skipped'` | `placement: 'done'`, lần sau giữ `done` | N/A |
| Gộp viên | Local F02 `firstDoneAt` T2, server T1 (server `updatedAt` cũ hơn) | `firstDoneAt` T1, `lastDoneAt` muộn nhất, `updatedAt` mới hơn | Một bên sai dạng → lấy bên hợp lệ |
| Gộp hàng | Local mới hơn `passed: false, best: 50`; server cũ `passed: true, best: 75` | `passed: true`, `best: 75` | N/A |
| Gộp ngày & Soát vé | Local `pending`, `skippedAt` T2; server `done`, `skippedAt` T1 | `done`, `skippedAt` T1 | N/A |
| Hai nửa qua tường | Máy A đạt hàng A, B; máy B đạt hàng C, D; cả hai `completedAt` null | `completedAt` = `updatedAt` mới hơn của hai bên; gộp lại lần nữa không đổi, không đẩy | N/A |
| Server app cũ | Server v12 không có `foundation`, local có | Giữ `foundation` local, `push: true`; server v14 → `outdated` | N/A |
| Backup | Xuất rồi nhập vào store trống; file v12 không có key | `foundation` khôi phục đúng; file v12 → mặc định sau migrate | Mục sai dạng trong `bricks`/`rows` và id `__proto__` bị bỏ |

</frozen-after-approval>

## Code Map

- `src/lib/storage/migrations.ts` -- `CURRENT_VERSION` 12 → 13, thêm `migrations[12]` theo mẫu `migrations[11]` (videoPractice). `LEGACY_UPDATED_AT`, `isPlainObject` dùng lại.
- `src/lib/sync/merge.ts` -- thêm vào `SYNCED_KEYS` + `MERGERS` (thiếu thì type-check lỗi). Dùng lại `mergeEntries`, `newer`. Mẫu gộp có field `updatedAt` cả object: `mergePlacement`. Không sửa luật gộp cũ.
- `src/lib/backup/backup.ts` -- `ENTRY_FIELD`/`ENTRY_VALID` là `Record<BackupKey,…>` nên phải thêm `foundation` (field `bricks`). `sanitizeBackupData` cần làm sạch thêm `rows` (chỉ khoá A–D hợp lệ). `restoreBackup` đếm viên như mục, các field khác tính một "cập nhật" (logic `beforeRest` có sẵn).
- `src/lib/updated-at.ts` -- `nextUpdatedAt`, `isTimeString`.
- `src/lib/subs/practice.ts` -- mẫu module dữ liệu một key: validator `isX`, `readX`, hàm ghi thuần.
- `src/lib/schedule/schedule.ts` -- chỉ tham khảo `startOfLocalDay`/`addDays`/`daysBetween`, KHÔNG import (vòng import ở story 22), KHÔNG sửa `roadmapStartDate`.
- Test có số version cứng cần nâng: `src/lib/storage/storage.test.ts` (`CURRENT_VERSION).toBe(12)`, hằng `V5`, các `schemaVersion: 12`), `src/lib/sync/merge.test.ts` (`local`/`remote` mặc định 12, danh sách `SYNCED_KEYS`), `src/app/store-context.test.ts` (`toBe(12)`). Grep thêm `schemaVersion: 12` ở `owl`, `srs`, `placement`, `subs` test: store `data: {}` không cần đổi, chỉ đổi khi test so khớp toàn bộ store.
- `src/lib/sync/index.ts` -- xoá key đồng bộ khi đổi tài khoản theo `SYNCED_KEYS`; tự áp cho `foundation`, không sửa.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`, `npm test` chạy với `TZ=Asia/Ho_Chi_Minh`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/types.ts` -- tạo các kiểu sau (nội dung màn do story 19–26 viết, ở đây chỉ định kiểu):
  - `RowId = 'A'|'B'|'C'|'D'`;
  - `ConceptId` (union từ hằng `CONCEPT_IDS`, kebab-case tiếng Anh, vd `ipa`, `stress`, `parts-of-speech`, `articles`, `be-affirmative`);
  - `BrickMeta { id: 'F01'…'F18', row, title, minutes, goalVi, teaches: ConceptId[], uses: ConceptId[] }`;
  - `Screen` (union theo `kind`: `explain`, `contrast`, `worked`, `faded`, `check`, `apply`);
  - `CheckItem` (union: `choice`, `listen`, `tapSyllable`, `order`, `sort`; mỗi loại có `id`, `hintVi`, `explanationVi`; `choice`/`listen` đúng 3 lựa chọn);
  - `RuleCard { id, brickId, cloze (có ___), answer, vi }`;
  - `Brick = BrickMeta & { screens, ruleCards, themeWordIds }`.
- [x] `src/data/foundation/catalog.ts`, `index.ts` -- `BRICKS: readonly BrickMeta[]` gồm F01–F18 theo bảng trong `learning-rules.md`, đúng hàng và số phút. Kèm helper `getBrickMeta(id)`, `bricksOfRow(row)`, `ROW_IDS`.
- [x] `src/data/foundation/foundation-catalog.test.ts` -- kiểm danh mục:
  - đủ 18 id duy nhất, thứ tự F01→F18;
  - hàng A = F01–F06, B = F07–F12, C = F13–F16, D = F17–F18;
  - tổng số phút khớp bảng;
  - mỗi `ConceptId` được đúng một viên `teaches`;
  - mỗi `uses` chỉ là khái niệm do viên đứng trước dạy.
- [x] `src/lib/foundation/foundation.ts` (+ `index.ts`) -- viết các hàm sau:
  - validator `isBrickProgress`, `isRowResult`, `isFoundationPlacement`;
  - `readFoundation`, `foundationState` (trả về `status: 'in-foundation'|'skipped'|'completed'`, `rowsDone`, `taughtCount` cho "x/18", `doneBrickIds`);
  - `completeBrick`, `markRowTested(store, row, correct, total, now)`, `finishPlacement(store, 'done'|'skipped', now)`;
  - `needsPlacement`, `isInFoundation`, `isBrickTaught`, `isGateOpen(store, 'ipa'|'stress'|'pos')` (ứng với F03/F04/F07);
  - `skipFoundation`, `resumeFoundation`, `scheduleStartDate(store, now): Date | null`. Hàm này lấy ngày sớm hơn của `skippedAt`/`completedAt`, cộng `pausedDays`, và cộng thêm số ngày từ `resumedAt` khi đang quay lại mà chưa qua tường.
  - `completeBrick`/`markRowTested` tự đặt `completedAt` và đóng lần quay lại khi cả 4 hàng vừa xong.
  - Xuất thêm `mergeFoundation` để `merge.ts` dùng.
- [x] `src/lib/foundation/foundation.test.ts` -- mỗi dòng I/O Matrix từ "Store mới" tới "Hai nửa qua tường" một ca (ngày dựng bằng `new Date(y, m, d, …)` giờ máy).
- [x] `src/lib/storage/migrations.ts` (+ `storage.test.ts`) -- v13 như Always. Ca test: nâng cấp v12, key có sẵn, key lạ, chuỗi v1 → v13 có `foundation` mặc định. Nâng các số version cứng.
- [x] `src/lib/sync/merge.ts` (+ `merge.test.ts`) -- `SYNCED_KEYS` thêm `'foundation'`, `MERGERS.foundation = mergeFoundation`. Ca test: các dòng Gộp, server v12 không có key, server v14 → outdated, gộp lặp không `push`.
- [x] `src/lib/backup/backup.ts` (+ `backup.test.ts`) -- `ENTRY_FIELD`/`ENTRY_VALID` + làm sạch `rows`. Ca test theo dòng "Backup": xuất có `foundation` và không có key ngoài allowlist; nhập vào store trống khôi phục đúng; file v12 được migrate; mục hỏng và `__proto__` bị bỏ.
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- dòng "Sân ga 9¾": thêm dạng mục viên (`firstDoneAt`, `lastDoneAt`) và luật "hai nửa qua tường". Không đổi luật khác.

**Acceptance Criteria:**
- Given app đang có dữ liệu học T1 ở v12, when mở bản mới, then store lên v13 với `foundation` mặc định, mà tiến độ bài, streak, thẻ SRS, Nhà, điểm ETS vẫn y nguyên.
- Given hai máy cùng tài khoản, mỗi máy làm một phần Sân ga, when đồng bộ hai chiều, then cả hai máy có cùng `foundation`: không mất viên đã xong, không mất hàng đã đạt, và lần đồng bộ sau không đẩy gì thêm.
- Given file backup xuất sau story này, when nhập lại vào trình duyệt đã xoá dữ liệu, then `foundationState` giống hệt trước khi xoá.
- Given `git diff --stat` sau story, when xem, then không có file trong `src/pages`, `src/components`, `src/app` (trừ test version), `public/`.

## Implementation Notes

- **Files:** `src/data/foundation/{types,catalog,index}.ts` + `foundation-catalog.test.ts`; `src/lib/foundation/{foundation,index}.ts` + `foundation.test.ts`; `migrations.ts` (v13, `migrations[12]`); `merge.ts` (`SYNCED_KEYS` + `MERGERS.foundation = mergeFoundation`); `backup.ts`; version bumps in `storage.test.ts`, `merge.test.ts`, `engine.test.ts`, `store-context.test.ts`; `stack.md` row "Sân ga 9¾".
- **Danh mục:** 44 `ConceptId` (mỗi viên dạy 1–6 khái niệm, `uses` chỉ trỏ về viên trước). `BRICK_IDS`, `ROW_IDS`, `CONCEPT_IDS` là hằng `as const`; thêm `isBrickId` ngoài `getBrickMeta`/`bricksOfRow`. Tổng 148 phút (A 48, B 48, C 36, D 16).
- **`taughtCount` (x/18)** = viên đã xong + viên của hàng qua bằng kiểm tra; KHÔNG cộng "đã từng bỏ qua" (theo `learning-rules.md` mục Hôm nay: "x gồm cả các viên thuộc hàng đã qua bằng kiểm tra"), nếu không thì người quay lại Sân ga luôn thấy 18/18. `isBrickTaught`/`isGateOpen` vẫn tính bỏ qua đúng như Always.
- **Ghi:** `commit` giữ field lạ và mục sai dạng của object cũ, bù field mặc định còn thiếu, `updatedAt = nextUpdatedAt(...)`. Chỉ `completeBrick`/`markRowTested` kiểm qua tường. `completeBrick` lấy `lastDoneAt` muộn hơn (đồng hồ lùi / cùng thời điểm → store cũ). `markRowTested` từ chối `correct`/`total` không nguyên, `correct > total` hay hàng lạ. Thêm `markWelcomeSeen` (welcomeSeenAt chỉ ghi lần đầu), `isRowDone`, `isRowPass`, `createDefaultFoundation`, `FOUNDATION_GATES`.
- **Gộp:** `mergeFoundation` nằm ở `src/lib/foundation` với helper gộp map riêng (không import `merge.ts`, tránh vòng import), cùng luật với `mergeEntries`/`newer`; gán id bằng `defineProperty` nên `__proto__` không đổi prototype. Thêm một luật an toàn: sau khi gộp mà đã có `completedAt` nhưng `resumedAt` còn (máy này đang quay lại, máy kia đã qua tường) thì đóng lần quay lại tại `completedAt` (cộng ngày vào `pausedDays`), để kết quả gộp không giữ trạng thái "đang quay lại" sau khi đã qua tường. Kết quả vẫn ổn định khi gộp lặp (có test).
- **Backup:** `foundation` đếm theo `bricks`; `rows` làm sạch (chỉ A–D, mục hợp lệ, bỏ `__proto__`). `restoreBackup` thêm `EMPTY_REST` để file chỉ có foundation mặc định (file v12 vừa migrate) không tính là "thêm 1 mục" khi khôi phục vào máy trống; luật đếm cũ (`placement`) không đổi.
- **Kiểm chứng:** `npm run lint && npm test && npm run build` pass (49 file, 890 test). Cảnh báo chunk size của Vite đã có từ trước.

## Spec Change Log

- **2026-11-06 — review (Huy cho phép chạy liên tục, sửa phần frozen khi chỉ có một cách sửa hợp lý):**
  - **Finding kích hoạt:** (1) Edge: máy B chưa từng bỏ qua ghi muộn hơn máy A vừa bỏ qua rồi quay lại → theo đúng chữ luật "`resumedAt`, `pausedDays` theo `updatedAt` của cả object", kết quả gộp lấy `resumedAt: null`, `pausedDays: 0` của B cùng `skippedAt` của A → trạng thái `skipped` mà không máy nào có, mất lần quay lại / số ngày tạm dừng. (2) Blind: luật "đóng lần quay lại tại `completedAt`" chỉ ghi ở Implementation Notes, trái chữ luật frozen và chưa có trong `stack.md`.
  - **Sửa:** dòng luật gộp trong Always thêm ngoại lệ (bên thắng chưa từng bỏ qua → `resumedAt`, `pausedDays` theo bên đã bỏ qua) và ghi rõ luật đóng lần quay lại tại `completedAt` (giữ `updatedAt`). `stack.md` dòng "Sân ga 9¾" ghi cùng hai luật.
  - **Trạng thái xấu tránh được:** gộp hai máy đẩy người đang quay lại Sân ga ra trạng thái "đã bỏ qua" và làm lịch 12 tháng bắt đầu sớm hơn thực tế (mất `pausedDays`).
  - **KEEP:** mọi luật gộp khác giữ nguyên; gộp lặp vẫn ổn định (có test gộp hai chiều và gộp lại).

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | Blind + VGap (other) | Chú thích test "hai máy mỗi máy làm một phần" (`merge.test.ts`) gán `completedAt` cho sai luật | low | Trước khi gộp A có hàng A, B; B có hàng C, D → cả hai `completedAt` null; giá trị `at(8)` đến từ luật hai nửa (`winner.updatedAt`). | patch: sửa chú thích |
| 2 | Blind | Luật "đóng lần quay lại tại `completedAt`" chỉ ghi ở Implementation Notes, trái chữ luật frozen, thiếu trong `stack.md` | medium | `mergeFoundation` đổi `resumedAt`/`pausedDays` sau khi gộp; `stack.md` chưa có luật này mà story 19–22 đọc `stack.md`. Bản thân luật đúng (thiếu nó thì lịch bắt đầu sớm hơn số ngày đã học lại). | patch + sửa frozen (Spec Change Log), cập nhật `stack.md` |
| 3 | Blind | `markRowTested` có thể lưu `best: 70` mà `passed: false` (16/23) | low | Đúng về số học, nhưng `learning-rules.md`: Soát vé và "Tôi biết rồi" luôn 8 câu (cùng quiz, không lọc câu); với 8 câu `Math.round` không vượt ngưỡng (5/8 → 63). Đổi `Math.floor` lại trái I/O Matrix (5/8 → 63). | reject (không gặp khi dùng thật) |
| 4 | Blind | `needsPlacement` sau `resumeFoundation` (Soát vé còn `pending`) mời Soát vé lại, không có test/quyết định | false | `learning-rules.md` định nghĩa lời mời theo "trạng thái Soát vé còn `pending`"; người bỏ qua Sân ga chưa từng Soát vé nên mời khi quay lại là đúng luật, Soát vé luôn bỏ qua được. | reject |
| 5 | Blind | Không có trạng thái/API cho Soát vé làm dở | false | `rows[r]` có mục = hàng đã làm; `learning-rules.md` đã ghi "lần sau làm tiếp từ hàng đầu tiên chưa có kết quả" → UI suy ra từ `readFoundation().rows`. | reject |
| 6 | Blind | `commit` thay `foundation` không phải object mà không giữ `legacy` | low | Sau v13 không đường nào tạo giá trị lạ: migration bọc vào `legacy`, backup bỏ key không phải object, `mergeFoundation` giữ bên là object; chỉ server bị sửa tay mới có. | reject (không gặp khi dùng thật) |
| 7 | Blind | `sanitizeBackupData` không lọc id viên ngoài danh mục; field gốc không kiểm | low | `F99` đúng dạng lọt qua và được đếm "thêm" khi khôi phục nhưng không hiện ở đâu. Field gốc sai (`placement: 'weird'`, `pausedDays: -5`) bị `parseFoundation`/`mergePlacementStatus` bỏ khi đọc, đúng luật "sai dạng bỏ qua khi đọc". | patch phần `bricks` (lọc `isBrickId`, có test); phần field gốc reject |
| 8 | Blind | Giá trị mặc định `foundation` viết ở 3 chỗ | false | Migration là ảnh chụp cố định của v13 (mẫu `migrations[11]` cũng viết thẳng); field mới sau này đi qua migration mới và `parseFoundation` tự bù mặc định; hằng trong test cố ý ghim shape. | reject |
| 9 | Blind | Mỗi predicate parse lại `foundation` | low | `parseFoundation` chỉ duyệt 18 viên + 4 hàng; vài lần mỗi thẻ là không đáng kể, cache thêm độ phức tạp. | reject |
| 10 | Blind | `goalVi` của F11 dùng "I am student" khi to be dạy ở F13 | low | Đúng: F11 dạy mạo từ nhưng ví dụ cần `be-affirmative` (F13). | patch: đổi ví dụ thành "a apple", "a water" |
| 11 | Blind | Luật nội dung trong `types.ts` (một `___`, âm tiết ghép lại đúng từ, 2–5 câu check…) chỉ nằm trong chú thích | medium | Đúng là chưa có validator, nhưng story này chỉ định kiểu (Tasks); nội dung màn do story 19–26 viết, validator thuộc story viết nội dung. | defer |
| 12 | Blind | Kiểu id của API không đồng nhất (`string` vs union) | low | Tasks ghi `isGateOpen(store, 'ipa'\|'stress'\|'pos')` nhưng code nhận `string`. `completeBrick`/`isBrickTaught` nhận `string` có chủ ý (id từ route là chuỗi chưa tin cậy, đã kiểm lúc chạy). | patch: `isGateOpen(gate: FoundationGate)`, giữ kiểm lúc chạy |
| 13 | Blind | `isRowPass` chỉ test với 8 câu | low | Đúng, chưa có ca biên khác 8. | patch: thêm ca 10/7/3/1 câu |
| 14 | Blind | Qua tường khi đang bỏ qua (chưa quay lại) chưa có test | low | Hành vi đúng (`completedAt` ghi, status `completed`, lịch theo `skippedAt`, `pausedDays` 0) nhưng chưa có ca. | patch: thêm test |
| 15 | Blind | Đổi tài khoản chưa có test cho key `foundation` | low | `withoutSyncedKeys` duyệt `SYNCED_KEYS` (đã có `foundation`), nhưng chưa có assertion riêng. | patch: thêm ca trong `index.test.ts` |
| 16 | Edge | `pausedDays` cực lớn (1e9) → `scheduleStartDate` ra Invalid Date | low | Chỉ có khi file/payload bị sửa tay; app chỉ cộng số ngày thật. | reject (không gặp khi dùng thật) |
| 17 | Edge | Máy chưa từng bỏ qua ghi muộn hơn máy đã bỏ qua rồi quay lại → mất lần quay lại | medium | Tái hiện bằng test: gộp ra `skippedAt` ngày 3, `resumedAt` null → status `skipped`; tương tự mất `pausedDays` đã đóng. Do chữ luật frozen gây ra, chỉ có một cách sửa hợp lý. | patch + sửa frozen (Spec Change Log) |
| 18 | Edge | `updatedAt` bằng nhau mà giá trị khác → mỗi máy giữ local, đẩy qua lại | low | Cần hai máy ghi cùng mili-giây; luật "bằng nhau giữ local" do frozen quy định, cùng mẫu các key cũ. | reject |
| 19 | Edge | Cùng id sai dạng ở cả hai bên → giữ local, đẩy qua lại | low | App không bao giờ ghi mục sai dạng; cần dữ liệu bị sửa tay ở cả hai máy. | reject |
| 20 | Edge | Backup có viên `F99` được đếm "thêm" nhưng không hiện | low | Cùng gốc với #7 (thiếu lọc id viên). | patch (cùng #7) |
| 21 | Edge | Khôi phục một viên vào máy có `foundation` mặc định báo thêm 1 "cập nhật" do chỉ `updatedAt` đổi | low | Đúng khi máy đã migrate; chỉ lệch số trong thông báo khôi phục, hiếm; sửa cần đổi luật đếm chung (Implementation Notes giữ luật đếm cũ). | reject |
| 22 | Edge | File backup thiếu/sai `updatedAt` gốc → mất `resumedAt`/`pausedDays` của file | low | App luôn ghi `updatedAt`; chỉ file bị sửa tay. | reject |
| 23 | Edge | Ghi không đổi khi đủ 4 hàng mà `completedAt` null → không ghi qua tường | false | Trạng thái này không xảy ra: mọi lần ghi viên/hàng tự kiểm qua tường, gộp có luật hai nửa; chỉ có khi `updatedAt` gốc sai dạng (dữ liệu sửa tay). | reject |
| 24 | VGap | Luật "ngày sớm nhất" của `completedAt`/`welcomeSeenAt` chỉ test khi một bên null | medium | Pre-verified: đổi sang `winner ?? other` không test nào hỏng; lịch 12 tháng có thể bắt đầu trễ. | patch: thêm ca cả hai bên có ngày, gộp hai chiều |

## Design Notes

Ví dụ một `foundation` sau Soát vé (A đạt, B trượt) và đã học F07:

```json
{ "bricks": { "F07": { "firstDoneAt": "2026-11-08T13:05:00.000Z", "lastDoneAt": "2026-11-08T13:05:00.000Z", "updatedAt": "2026-11-08T13:05:00.000Z" } },
  "rows": { "A": { "passed": true, "best": 88, "updatedAt": "…" }, "B": { "passed": false, "best": 50, "updatedAt": "…" } },
  "placement": "done", "completedAt": null, "skippedAt": null, "resumedAt": null, "pausedDays": 0,
  "welcomeSeenAt": null, "updatedAt": "2026-11-08T13:05:00.000Z" }
```

`foundationState` ở ví dụ trên: `status: 'in-foundation'`, hàng A xong, `taughtCount` = 7 (6 viên hàng A + F07). `isGateOpen('ipa')` và `isGateOpen('pos')` đều true. `best` = `Math.round(correct / total * 100)`; còn `passed` so bằng số nguyên, không qua `best`.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/lib/foundation src/data/foundation src/lib/storage src/lib/sync src/lib/backup` -- expected: pass, có ca cho mọi dòng I/O Matrix.
- `git diff --name-only HEAD` -- expected: chỉ file trong `src/data/foundation/`, `src/lib/{foundation,storage,sync,backup}/`, các test có số version cứng, `stack.md` và file spec này.
