---
title: 'Sao lưu và khôi phục dữ liệu bằng file JSON'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: '21ed28d2781a344bfd036196b12d7ffd27bd5714'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Allowlist sao lưu** = `BACKUP_KEYS`, suy ra từ `SYNCED_KEYS` (cùng định nghĩa "dữ liệu học"); test chặn mọi key có tên giống key/token/PAT/secret/password và chặn key không nằm trong `store.data` chuẩn.
- **Khôi phục = gộp**, không thay thế: dữ liệu trong file gộp vào máy bằng đúng luật gộp đồng bộ (`MERGERS`, mục nào `updatedAt` mới hơn thắng). Không có nút "xoá rồi thay", để không bao giờ mất tiến độ.
- **Định dạng file:** `{ app: 'lumos-english', kind: 'backup', schemaVersion, exportedAt, data: { <chỉ key trong allowlist> } }`, tên `lumos-english-backup-YYYY-MM-DD.json`.
- **Version:** file cũ hơn app → `runMigrations` rồi gộp; file mới hơn app → từ chối, báo cần cập nhật app; file sai dạng / không phải backup của app → báo lỗi tiếng Việt, không đổi gì.
- **Xuất:** có `navigator.share` với file (iPhone PWA) thì mở bảng chia sẻ để lưu vào Tệp; không thì tải file qua link `download`.
- **Chỗ hiện:** trang `#/backup` ("Sao lưu dữ liệu"), mở từ thẻ cuối trang Luyện tập và từ Sheet của chỉ báo đồng bộ (khi có).
- Trước khi gộp, hiện tóm tắt file (ngày xuất, số bài xong, số thẻ, số ngày học, số từ đã lưu) và nút "Khôi phục"; sau khi gộp báo đã thêm/cập nhật bao nhiêu mục.

**Problem:** Dữ liệu học chỉ ở localStorage và Supabase; Huy chưa có bản sao tự giữ được (đổi tài khoản, Supabase tạm dừng, muốn giữ file riêng).

**Approach:** Hàm thuần dựng file backup từ store theo allowlist và gộp file vào store; một trang nhỏ để xuất và chọn file khôi phục. Ghi vào store qua `StoreHandle.update` nên sau khôi phục đồng bộ tự đẩy lên Supabase.

## Boundaries & Constraints

**Always:**
- Không bao giờ có API key, PAT, token hay key ngoài allowlist trong file xuất, kể cả khi store có.
- File nhập đi qua kiểm cấu trúc và chỉ lấy key trong allowlist; key lạ trong file bị bỏ qua.
- Logic xuất/kiểm/gộp/tóm tắt là hàm thuần có test.
- Tiếng Việt, 375px.

**Never:**
- Không làm Gist (story 13), không mã hoá file, không đọc file ngoài input người dùng chọn.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Xuất | Store có tiến độ, SRS, nhật ký, từ đã lưu + một key `geminiApiKey` | File chỉ có key trong allowlist, không có `geminiApiKey` | N/A |
| Khôi phục máy trống | File có 5 bài xong, 20 thẻ | Máy có đúng 5 bài, 20 thẻ | N/A |
| Khôi phục gộp | Máy và file cùng thẻ X, file cũ hơn | Giữ bản máy; thẻ chỉ có trong file được thêm | N/A |
| Bỏ đánh dấu không sống lại | Máy bỏ đánh dấu bài sau ngày xuất file | Bài vẫn bỏ đánh dấu | N/A |
| File cũ | `schemaVersion` nhỏ hơn app | Migrate rồi gộp | Migrate lỗi: báo lỗi, không đổi gì |
| File mới hơn | `schemaVersion` lớn hơn app | Không gộp, báo cần cập nhật app | N/A |
| File sai | JSON hỏng / không phải backup / quá 5 MB | Báo lỗi tiếng Việt, không đổi gì | Không crash |
| Key lạ trong file | File có thêm `token` | Bỏ qua key đó | N/A |
| Không có share | Trình duyệt không hỗ trợ share file | Tải qua link download | N/A |
| Huỷ share | Người dùng đóng bảng chia sẻ | Không báo lỗi | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/sync/merge.ts` -- `SYNCED_KEYS`, `MERGERS`, `pickSynced`, `mergeData`: dùng lại để lọc và gộp (không viết luật gộp thứ hai).
- `src/lib/storage/migrations.ts` -- `CURRENT_VERSION`, `runMigrations`, `isPlainObject`.
- `src/app/store-context.ts` -- `StoreContext`/`handle.update`; thêm hook `useBackup()` hoặc dùng trực tiếp handle trong trang.
- `src/components/SyncBadge.tsx` -- Sheet đăng xuất; thêm link "Sao lưu dữ liệu".
- `src/pages/Practice.tsx`, `src/app/routes.tsx` -- thẻ link + route `backup` (tab Luyện tập sáng; xem `isNavItemActive` trong `src/app/nav-items.ts`).
- Đọc tóm tắt: `readCompletedLessonIds` (`src/lib/roadmap-progress.ts`), `readCards` (`src/lib/srs`), nhật ký `src/lib/sessions`, `src/lib/saved-words`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/backup/` (+ test) -- `BACKUP_KEYS`, `createBackup(store, now)`, `parseBackup(text)` → `{ ok, backup } | { ok: false, message }`, `restoreBackup(store, backup)` → `{ store, added, updated }`, `summarizeBackup(backup)`; phủ mọi dòng I/O Matrix về dữ liệu.
- [x] `src/lib/backup/download.ts` -- `shareOrDownload(fileName, json)`: share file nếu có, không thì link download; bắt `AbortError`.
- [x] `src/pages/Backup.tsx`, `src/app/routes.tsx`, `src/pages/Practice.tsx`, `src/components/SyncBadge.tsx`, `src/app/nav-items.ts` -- trang và lối vào.

**Acceptance Criteria:**
- Given đã học vài ngày, when bấm "Xuất file", then nhận file JSON chỉ chứa dữ liệu học.
- Given file backup hợp lệ, when chọn file và bấm "Khôi phục", then thấy tóm tắt trước, sau đó dữ liệu được gộp và bản đồ/flashcard phản ánh ngay.

## Implementation Notes

- Migrate file cũ nằm trong `parseBackup` (tóm tắt hiện số liệu đã migrate); `restoreBackup` chỉ gộp bằng `mergeData`.
- Đếm `added`/`updated` theo mục của map gộp từng key (`lessons`, `cards`, `days`, `items`, `attempts`); field khác của key (vd Nhà) đổi thì tính 1 mục.
- `useBackup()` trong `store-context.ts`; khôi phục ở chế độ `memory`/`read-only` vẫn báo kết quả kèm cảnh báo chưa lưu được.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge (×3) | File đúng vỏ nhưng nội dung sai dạng (`progress: "x"`, thẻ rác) vẫn được gộp, ghi và đồng bộ; đếm lệch tóm tắt | medium | `parseBackup` chỉ kiểm vỏ; `mergeEntries` giữ mục sai dạng khi máy không có. Trái I/O "file sai … không đổi gì" | patch |
| 2 | blind, edge | Id `__proto__` trong file làm hỏng map khi gộp | medium | File là dữ liệu ngoài; `out[id] = …` đổi prototype | patch |
| 3 | blind | Số "đã thêm/cập nhật" không khớp tóm tắt trước khi khôi phục | low | Tóm tắt thiếu Mũ Phân Loại, phát âm | patch |
| 4 | blind | Khôi phục không đổi gì ở chế độ memory hiện 2 thông báo trái nhau | low | Chỉ cảnh báo "chưa lưu" khi có thay đổi | patch |
| 5 | blind, edge, verif-gap | Share lỗi khác `AbortError` rơi về link tải (có thể bị chặn trên iOS) nhưng vẫn báo "đã tải"; nhánh này không test | low | Thêm test; đổi lời báo thành "nếu không thấy file thì bấm Xuất lại" | patch |
| 6 | blind | Migrate chạy sau khi đã lọc allowlist | low | Đổi thứ tự trực tiếp | patch |
| 7 | blind | Lời báo 5 MB viết cứng hai nơi | low | Suy từ hằng số | patch |
| 8 | verif-gap | Đếm khi chỉ đổi field ngoài map (Nhà, bài bắt đầu) không có test | low | Thêm test | patch |
| 9 | edge | Store hỏng/migrate lỗi (chạy bằng store rỗng) vẫn xuất file rỗng như thật | medium | Huy tưởng đã sao lưu; chặn xuất và báo khi store không phải dữ liệu thật | patch |
| 10 | verif-gap | `useBackup().restore` (ghi qua `update`) không test | low | Không có môi trường test hook | defer |
| 11 | blind | `updatedAt` trong file không chặn trên (vd 2099) | low | File do chính Huy xuất | reject |
| 12 | edge | Xuất ở chế độ read-only tạo file version mới hơn app | false | Đúng: dữ liệu đó do app mới hơn ghi | reject |
| 13 | edge | Chọn file thứ hai khi file đầu đang đọc; unmount khi đang đọc | low | Hiếm, đọc file cục bộ rất nhanh | reject |
| 14 | blind | Test regex key bí mật không thể fail | low | `createBackup` test đã chèn key bí mật thật | reject |
| 15 | blind | Trang chưa có test UI, sổ sách spec | low | Không có môi trường test component; sửa spec | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px: xuất file (download), nhập lại vào profile trống, dữ liệu khớp; file sai báo lỗi.
