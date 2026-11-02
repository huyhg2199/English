---
title: 'Sổ tay, lưu 1 chạm kèm ngữ cảnh và ghi chú kiến thức'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: '5d160c0718af81939d263614f8e49db32d57ec9d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Lưu 1 chạm:** trong vùng đọc (tin ngày lười, câu ví dụ/câu thoại của trang bài, câu ví dụ trên flashcard), chạm một từ để lưu từ đó; bôi đen một cụm/câu thì hiện nút nổi "Lưu vào Sổ tay". Mỗi mục lưu kèm câu chứa nó, nguồn (tiêu đề + URL hoặc đường dẫn trong app) và ngày. Dùng tiếp key `savedWords` của story 4 (mở rộng field, không đổi id cũ).
- **Ghi chú kiến thức:** ghi chú tự do theo mẫu của lộ trình "quy tắc / lỗi sai / câu ví dụ" (3 ô, ô nào cũng không bắt buộc, cần ít nhất một ô có chữ), có thể gắn với một bài. Key mới `notes`.
- **Thành thẻ SRS:** mục đã lưu có nút "Thêm vào flashcard".
  - Từ có trong NGSL/TSL: đưa thẻ của từ đó vào ôn ngay (từ mới hôm nay, **không** tính vào quota 10 từ mới), mặt sau thẻ hiện thêm "Câu gốc của bạn".
  - Từ/cụm không có trong danh sách: Huy nhập nghĩa tiếng Việt (bắt buộc) rồi tạo thẻ riêng `saved-<id>` (mặt trước cụm từ + nút nghe, mặt sau nghĩa + câu gốc + nguồn), ôn chung phiên SRS, cùng thuật toán.
- **Xoá:** Huy được xoá mục lưu/ghi chú của mình. Xoá là ghi dấu `deleted: true` + `updatedAt` (để đồng bộ không làm sống lại), không xoá thẻ SRS đã có lịch (thẻ riêng của mục đã xoá thì ngừng xuất hiện trong phiên).
- **Trang Sổ tay** (tab có sẵn): 2 mục "Từ & câu đã lưu" (mới nhất trước, nhóm theo ngày, lọc theo chữ) và "Ghi chú" (mới nhất trước); nút thêm ghi chú.

**Problem:** Tab Sổ tay đang trống; từ lưu ở ngày lười chưa xem lại được, chưa ghi chú được kiến thức, và từ gặp trong ngữ cảnh chưa thành thẻ ôn kèm câu gốc (CAP-18, CAP-9).

**Approach:** Lớp hàm thuần cho mục lưu/ghi chú/thẻ riêng, một component "vùng đọc" dùng chung để chạm/bôi đen lưu, trang Sổ tay, và mở rộng `buildSession` để nhận thẻ riêng từ mục đã lưu.

## Boundaries & Constraints

**Always:**
- Store lên version kế tiếp: thêm `notes: { items: {} }`; mục `savedWords` thêm field tuỳ chọn `meaningVi`, `inSrs`, `deleted`; cả hai gộp theo mục, `updatedAt` mới hơn thắng, không lùi. Mục cũ của story 4 hợp lệ không cần migrate.
- Logic (tạo/xoá/sửa mục, chuẩn hoá cụm, dựng thẻ riêng, lọc) là hàm thuần có test.
- Thẻ riêng dùng cùng `srs.cards` (id `saved-<id>`), cùng `review/markKnown`; quota 10 từ mới không tính thẻ do Huy tự thêm.
- Tiếng Việt, 375px, theme hiện có; nút nổi không che chữ đang bôi đen trên iPhone (đặt dưới vùng chọn hoặc đáy màn hình).

**Never:**
- Không gọi AI để dịch/giải nghĩa; không tự tạo nghĩa cho cụm ngoài danh sách.
- Không chép tay từ vựng thành danh sách riêng (Non-goal SPEC): sổ tay chỉ lưu ngữ cảnh và kiến thức.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Chạm từ trong tin | Chạm "model" | Lưu kèm câu + nguồn; hiện trong Sổ tay | N/A |
| Bôi đen cụm | Chọn "take part in" | Nút "Lưu vào Sổ tay" → lưu cụm kèm câu | Chọn quá 200 ký tự: báo quá dài |
| Lưu trùng | Lưu lại cùng từ cùng ngày | Không tạo bản trùng | N/A |
| Từ trong NGSL thành thẻ | "model" có trong NGSL, chưa có thẻ | Thẻ `ngsl-model` vào phiên hôm nay, không trừ quota; mặt sau có câu gốc | N/A |
| Từ đã có thẻ | Từ đã có lịch SRS | Không đổi lịch; mặt sau thêm câu gốc | N/A |
| Cụm ngoài danh sách | "take part in" + nghĩa "tham gia" | Thẻ `saved-<id>` trong phiên | Thiếu nghĩa: không tạo, báo cần nghĩa |
| Xoá mục | Xoá mục có thẻ riêng | Ẩn khỏi Sổ tay, thẻ riêng ngừng xuất hiện; lịch còn trong `srs.cards` | N/A |
| Xoá không sống lại | Xoá ở A, máy B còn bản cũ | Sau đồng bộ mục vẫn bị xoá | N/A |
| Ghi chú | 3 ô trống | Không lưu, báo cần ít nhất một ô | N/A |
| Ghi chú gắn bài | Tạo từ trang bài | Ghi chú có link về bài | N/A |
| Lọc | Gõ "mod" | Chỉ mục có từ/câu chứa "mod" (không phân biệt hoa thường, dấu) | N/A |
| App cũ | Server version mới hơn | App cũ báo cần cập nhật | Theo story 2a |

</frozen-after-approval>

## Code Map

- `src/lib/saved-words/` (story 4) -- `saveWord`, `savedWordId` (ngày + từ chuẩn hoá), `tokenize`, `savedWordsOn`; mở rộng, giữ id cũ.
- `src/pages/LazySession.tsx` (story 4) -- `NewsCard` chạm từ để lưu; chuyển sang component vùng đọc dùng chung.
- `src/pages/Lesson.tsx`, `src/components/lesson/*` (story 6) -- câu ví dụ/câu thoại: bọc bằng vùng đọc.
- `src/components/flashcards/FlashcardSession.tsx`, `src/lib/srs/srs.ts` (`buildSession(srs, words, now, newPerDay, firstList)`, `hasDetails`, `StudyWord`), `src/lib/srs/store.ts` -- thêm nguồn thẻ riêng và "câu gốc".
- `src/data/vocab/` -- tra từ trong NGSL/TSL (chuẩn hoá chữ thường) để biết có thẻ sẵn.
- `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (`SYNCED_KEYS`, `MERGERS`, `mergeEntries`), `src/lib/updated-at.ts` -- mẫu thêm key.
- `src/pages/Notebook.tsx` -- đang là placeholder.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (+ test) -- version mới, `notes`, gộp có dấu xoá.
- [x] `src/lib/saved-words/`, `src/lib/notes/` (+ test) -- lưu cụm, xoá, `addToSrs`, ghi chú tạo/sửa/xoá, `filterNotebook(query)`.
- [x] `src/lib/srs/` (+ test) -- thẻ riêng từ `savedWords` (`customStudyWords`), từ do Huy thêm không tính quota, "câu gốc" cho thẻ có sẵn.
- [x] `src/components/ReadableText.tsx` -- chạm từ / bôi đen để lưu, nút nổi; dùng ở tin ngày lười, câu trang bài, câu ví dụ flashcard.
- [x] `src/pages/Notebook.tsx`, `src/components/notebook/*`, `src/app/store-context.ts` -- trang Sổ tay, form ghi chú, nút "Thêm vào flashcard" (hỏi nghĩa khi cần).

**Acceptance Criteria:**
- Given đã lưu 3 từ ở ngày lười, when mở Sổ tay, then thấy 3 từ kèm câu gốc và link nguồn.
- Given lưu cụm ngoài danh sách và nhập nghĩa, when mở flashcard, then thẻ cụm đó có trong phiên, mặt sau có nghĩa và câu gốc.

## Implementation Notes

- Schema v8: migration 7→8 thêm `notes: { items: {} }`; nếu `notes` cũ không phải object thì giữ trong `notes.legacy` (không xoá dữ liệu). `notes` vào `SYNCED_KEYS`/`MERGERS`/backup (`ENTRY_FIELD`, `ENTRY_VALID`, tóm tắt có số ghi chú).
- "Không tính quota": thẻ do Huy thêm có field tuỳ chọn `added: true` trên `SrsCard` (`addedCard`, `addCard`); `buildSession` bỏ qua thẻ `added` và thẻ riêng khi đếm `introducedToday`. Thẻ riêng truyền qua tham số thứ 6 `custom` của `buildSession`; thẻ riêng chưa có lịch vào như từ mới, không trừ quota.
- "Câu gốc của bạn" hiện trên thẻ NGSL/TSL khi mục lưu cùng từ đã bấm "Thêm vào flashcard" (`originsByWord`). Tra danh sách: khớp chính xác chữ (không lemmatize), cần có dữ liệu AI, NGSL ưu tiên.
- `ReadableText` + `ReadingSourceContext`: trang bài đặt nguồn = tiêu đề bài · đoạn + đường dẫn trong app (`/roadmap/lesson/...`). Dùng ở tin ngày lười, câu ví dụ + câu thoại VOA của TenseCard, câu ví dụ flashcard. Nút nổi ở đáy màn hình (trên bottom nav); chỉ một vùng đọc hiện thanh nổi một lúc.
- Từ/cụm lưu ở dạng chữ thường (giữ quy ước story 4), nên tên riêng hiện chữ thường trong Sổ tay.
- Ghi chú gắn bài: nút "Ghi chú cho bài này" (Sheet) trên trang bài; Sổ tay hiện link về bài.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | verif-gap | Thẻ tóm tắt flashcard ở Luyện tập không tính thẻ riêng từ Sổ tay | medium | `Practice.tsx` gọi `buildSession` không truyền `custom` | patch |
| 2 | blind, edge | Thẻ thêm từ Sổ tay hiện "Ôn lại", không có "Đã biết" | medium | `addedCard` có `due = now`; spec nói "từ mới hôm nay" | patch |
| 3 | blind | Cùng cụm lưu hai ngày → hai thẻ riêng | medium | id mục = ngày + cụm; `addToSrs` không tìm thẻ có sẵn | patch |
| 4 | edge | Link nguồn từ dữ liệu đồng bộ/khôi phục có thể là `javascript:` | medium | `SourceLink` không lọc `href` | patch |
| 5 | verif-gap, blind | Ghi chú trong backup không có test | medium | Chỉ có `notes: 0` trên store rỗng | patch |
| 6 | verif-gap | Cờ `added` sau khi chấm, `isSrsCard` với `added` sai kiểu không có test | low | Thêm test | patch |
| 7 | edge, blind | Thêm thẻ NGSL lỗi không có phản hồi | low | Bỏ qua `AddToSrsResult` | patch |
| 8 | edge | `addCard` gặp mục sai dạng báo ok nhưng thẻ không hiện | low | Ghi đè mục sai dạng | patch |
| 9 | blind, edge | Thanh nổi `<div>` nằm trong `<p>` | low | Portal | patch |
| 10 | blind, edge | Chạm là lưu, không hoàn tác; báo "Đã lưu" khi đã có | low | Thêm "Hoàn tác", báo "Đã có trong Sổ tay" | patch |
| 11 | blind | Live region gắn cùng lúc với chữ | low | Giữ `role="status"` luôn mounted | patch |
| 12 | verif-gap | Phiên flashcard có thẻ riêng không có test component | low | Chưa có môi trường test component | defer |
| 13 | blind | Dạng biến đổi ("models") tạo thẻ riêng | low | Đúng quyết định khớp chính xác | reject |
| 14 | blind | Không sửa nghĩa / gỡ khỏi flashcard; trang bài không liệt kê ghi chú | low | Ngoài phạm vi | reject |
| 15 | blind | Câu luyện nói, bảng âm chưa lưu được | low | Câu ví dụ/thoại đã có | reject |
| 16 | blind | Tab stop, nhiều listener, link nguồn chung, thiếu "Hôm qua" | low | Nhỏ | reject |
| 17 | edge | Trùng id ghi chú; `now` cũ sau nửa đêm | low | Hiếm | reject |
| 18 | edge | `notes.legacy` bị đồng bộ | false | Trước v8 không có chỗ nào ghi `notes` | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px: chạm từ, bôi đen cụm (giả lập selection), Sổ tay, thêm vào flashcard, ghi chú; không tràn ngang.
