---
title: 'Bộ từ NGSL/TSL và flashcard SRS có IPA, trọng âm, nút nghe'
type: 'feature'
created: '2026-10-31'
status: 'done'
baseline_commit: '5d1dc7e3dd3beb6b984f966edea3751d6bd59608'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:**
- **Phạm vi dữ liệu AI:** sinh dữ liệu cho **1000 từ NGSL đầu** (theo hạng) trong story này. Danh sách đủ 2809 NGSL + 1250 TSL vẫn được đóng gói; từ chưa có dữ liệu AI không được đưa vào phiên ôn. Phần còn lại là story 3a, làm trước T5 (03/2027).
- **Chấm thẻ 4 nút** như Anki: Quên / Khó / Nhớ / Dễ, thuật toán kiểu SM-2 tự viết.
- **10 từ mới/ngày cố định** (ngày theo giờ máy). "Đã biết" không tính vào 10.
- **Giọng Mỹ:** IPA kiểu Mỹ, `speechSynthesis` với `lang = 'en-US'`.
- **Nút "Đã biết"** trên từ mới: xếp lịch ≥ 60 ngày, không xoá.
- Spec dài hơn 1600 token, Huy chấp nhận.

**Problem:** Lộ trình bắt Huy học ~1000 từ trước O.W.L. 1 (T4, 02/2027) và ~2200 từ sau 12 tháng bằng Anki, nhưng Anki trên iPhone trả phí và không gắn với app. App chưa có bộ từ nào.

**Approach:** Đóng gói NGSL 1.2 + TSL 1.2 (CC BY-SA 4.0) thành JSON tĩnh, kèm dữ liệu do AI sinh lúc build (IPA, âm tiết + trọng âm, từ loại, nghĩa Việt, câu ví dụ Anh + dịch). Thêm phiên ôn flashcard trong tab Luyện tập: chỉ hiện thẻ đến hạn và một số từ mới mỗi ngày theo thứ tự tần suất NGSL → TSL. Mỗi thẻ có nút nghe (`speechSynthesis`) và link Cambridge. Trạng thái SRS lưu trong store và đồng bộ Supabase như tiến độ.

## Boundaries & Constraints

**Always:**
- Ghi nguồn NGSL/TSL (CC BY-SA 4.0, newgeneralservicelist.com) trong app ở trang flashcard và cạnh file dữ liệu trong repo.
- Oxford 3000/5000 chỉ link, không đóng gói.
- Dữ liệu từ là JSON tĩnh trong repo, sinh bằng script ngoài app; app không gọi AI lúc chạy.
- SRS là thuật toán tự viết, hàm thuần, test được; thời gian lấy từ tham số `now`.
- Trạng thái SRS nằm ở key `srs` của `store.data`, thêm vào `SYNCED_KEYS` với luật gộp riêng: gộp từng thẻ, `updatedAt` mới hơn thắng, `updatedAt` không lùi (cùng cách `progress.lessons`).
- Store lên v4 (migration 3→4 thêm `srs` rỗng) để app cũ trên máy khác thấy server mới hơn và không ghi đè mất `srs`.
- Không xoá, không reset thẻ (Constraints SPEC: không phạt). Quên thì rút ngắn lịch, không về 0 toàn bộ.
- Không có `speechSynthesis` thì ẩn nút nghe, phần còn lại vẫn chạy.
- Chữ tiếng Việt, mobile-first 375px, theme hiện có.

**Never:**
- Không làm thẻ từ ngữ cảnh/sổ tay (story 8), không so khớp giọng nói (story 6), không gắn vào buổi 30' (story 4).
- Không gọi AI hay API ngoài khi app chạy. Không đưa API key vào script commit.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lần đầu ôn | `srs` rỗng | Phiên có đúng N từ mới đầu danh sách (theo hạng NGSL) | N/A |
| Có thẻ đến hạn | 3 thẻ `due <= now`, 5 thẻ chưa đến hạn | Phiên có 3 thẻ ôn + từ mới còn lại của ngày; thẻ chưa đến hạn không hiện | N/A |
| Hết việc hôm nay | Không thẻ đến hạn, đã đủ N từ mới hôm nay | Báo "Xong hôm nay", hiện giờ thẻ kế tiếp đến hạn | N/A |
| Nhớ | Bấm mức nhớ trên thẻ ôn | Lịch giãn ra (khoảng sau > khoảng trước) | N/A |
| Quên | Bấm "Quên" | Thẻ quay lại trong phiên hôm nay, khoảng rút ngắn, `lapses + 1` | N/A |
| Đã biết | Bấm "Đã biết" trên từ mới | Thẻ xếp lịch xa (≥ 60 ngày), không tính vào N từ mới | N/A |
| Hết NGSL | Đã giới thiệu hết NGSL có dữ liệu | Từ mới lấy tiếp từ TSL theo hạng | N/A |
| Không có TTS | `speechSynthesis` không có | Ẩn nút nghe | Không crash |
| Hai máy ôn cùng thẻ | Máy A và B chấm cùng thẻ khi offline | Sau đồng bộ cả hai theo bản `updatedAt` mới hơn | N/A |
| App cũ trên máy khác | Server v4, app v3 | App cũ báo cần cập nhật, không ghi đè `srs` | Theo story 2a |
| Đồng hồ máy lùi | `updatedAt` cũ lớn hơn giờ máy | `updatedAt` mới = cũ + 1ms | N/A |
| Mục `srs` sai dạng | Thẻ thiếu field / sai kiểu | Bỏ qua thẻ đó khi tính, không xoá khỏi store | Không crash |

</frozen-after-approval>

## Code Map

- `src/lib/storage/migrations.ts` -- `CURRENT_VERSION = 3`, `LEGACY_UPDATED_AT`; thêm migration 3→4 (`srs: { cards: {} }`), không đụng migration cũ.
- `src/lib/roadmap-progress.ts` -- mẫu `isLessonProgress`, `nextUpdatedAt` (không lùi); tái dùng ý tưởng cho thẻ SRS (tách helper chung nếu gọn).
- `src/lib/sync/merge.ts` -- `SYNCED_KEYS`, bảng `MERGERS` có kiểu: thêm `srs` + `mergeSrs` (gộp từng thẻ theo `updatedAt`). `mergeLessons` là mẫu.
- `src/app/store-context.ts` -- `createStoreHandle`, `useLoadedStore`, `useProgress`; thêm hook `useSrs()` theo cùng kiểu (đọc/ghi qua `handle.update`, không gọi storage trực tiếp).
- `src/app/routes.tsx` -- thêm `practice/flashcards`; tab Luyện tập vẫn sáng.
- `src/pages/Practice.tsx` -- đang là `PagePlaceholder`; thay bằng thẻ "Ôn flashcard" (số thẻ đến hạn + từ mới hôm nay) dẫn tới phiên ôn.
- `src/data/roadmap/*` -- mẫu tổ chức dữ liệu tĩnh + test cấu trúc (`roadmap.test.ts`).
- Nguồn danh sách: `https://www.newgeneralservicelist.com/s/NGSL_12_stats.csv` (cột `Lemma,SFI Rank,...`, 2809 từ) và `.../s/TSL_12_stats.csv` (cột `Word,TSL Rank,...`, 1250 từ). Đã kiểm tra tải được.
- Test: Vitest env `node`, `src/**/*.test.ts`; không có test render component.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/vocab/source/` -- lưu 2 CSV gốc + `README.md` ghi nguồn, phiên bản 1.2, giấy phép CC BY-SA 4.0.
- [x] `scripts/vocab/ai/*.json` -- dữ liệu AI theo lô: `{ word, pos, ipa, syllables[], stressIndex, meaningVi, exampleEn, exampleVi }`; 1000 từ NGSL hạng 1–1000, IPA kiểu Mỹ, chia lô ~200 từ.
- [x] `scripts/vocab/build.mjs` -- gộp CSV + lô AI thành `src/data/vocab/words.json` (`id`, `list: 'ngsl'|'tsl'`, `rank`, các field AI nếu có); kiểm: không trùng id, `stressIndex` nằm trong `syllables`, `ipa` có dấu `ˈ` khi nhiều âm tiết; chạy bằng `npm run vocab:build`.
- [x] `src/data/vocab/` (+ test) -- kiểu `Word`, nạp `words.json` bằng dynamic import (không vào bundle chính), `cambridgeUrl(word)`; test cấu trúc dữ liệu và số lượng NGSL/TSL.
- [x] `src/lib/srs/` (+ test) -- hàm thuần: `review(card, grade, now)`, `buildSession(srs, words, now, newPerDay)`, `isSrsCard`; phủ các dòng I/O Matrix về lịch.
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (+ test) -- v4 + `mergeSrs`; test hai máy, đồng hồ lùi, thẻ sai dạng, app cũ.
- [x] `src/app/store-context.ts` -- `useSrs()`.
- [x] `src/pages/Flashcards.tsx`, `src/pages/Practice.tsx`, `src/app/routes.tsx` -- phiên ôn: mặt trước từ + nút nghe; lật ra IPA, âm tiết với âm nhấn nổi bật, từ loại, nghĩa Việt, câu ví dụ + dịch, link Cambridge; 4 nút Quên / Khó / Nhớ / Dễ; "Đã biết" trên từ mới; ghi nguồn CC BY-SA.
- [x] `stack.md` -- ghi bước `npm run vocab:build` và cách thêm lô AI.

**Acceptance Criteria:**
- Given app mới cài, when vào Luyện tập → Ôn flashcard, then thấy từ mới đầu tiên của NGSL kèm IPA có dấu trọng âm và âm tiết nhấn nổi bật.
- Given thẻ đang mở, when bấm nút nghe, then nghe từ đọc bằng giọng Mỹ (`en-US`).
- Given đã ôn trên máy A, when mở app trên máy B cùng tài khoản, then số thẻ đến hạn giống nhau.
- Given repo, when xem `src/data/vocab/words.json`, then không có từ nào ngoài NGSL/TSL và trang flashcard có dòng ghi nguồn CC BY-SA 4.0.
- Given Huy mở mẫu 30 từ ngẫu nhiên, when đối chiếu Cambridge, then IPA và trọng âm khớp (Huy duyệt tay).

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge, verif-gap | `now` chỉ đổi khi chấm thẻ: để PWA mở qua nửa đêm thì quota từ mới và thẻ đến hạn vẫn của hôm qua | medium | `Flashcards.tsx` `useState(new Date())` chỉ `setNow` trong `advance`; `Practice.tsx` cố định lúc mount. iOS giữ trạng thái PWA khi mở lại sáng hôm sau | patch |
| 2 | blind, edge | Bấm Nhớ lúc 23:30 thì nút hiện "30 phút" dù khoảng là 1 ngày | low | `formatDelay` xét `ms < 60 phút` trước; Huy học trước khi ngủ nên hay gặp; sửa trực tiếp thứ tự | patch |
| 3 | verif-gap, blind | `stressIndex` không được test đối chiếu với vị trí `ˈ`; chỉ script build kiểm | medium | `vocab.test.ts` chỉ kiểm phạm vi; sửa tay `words.json` vẫn pass | patch |
| 4 | blind, edge | `VOWEL_NUCLEI` thiếu `ɜ ɜː ɒ a o ɐ` nên đếm âm tiết lệch | low | `lib.mjs:75`; dữ liệu hiện tại khớp hết, nhưng lô 3a có thể dùng; sửa trực tiếp regex | patch |
| 5 | verif-gap | `words.json` có thể lệch khỏi lô AI mà không check nào báo | medium | CI không chạy `vocab:build`; sửa lô quên build vẫn pass | patch |
| 6 | verif-gap | Quy tắc id thẻ (khoá SRS) chỉ ghim `ngsl-the` | medium | Đổi `slugify` làm mồ côi thẻ đã đồng bộ, trái luật không reset; test vẫn pass | patch |
| 7 | blind | `words.json` không đánh dấu generated, làm ngập diff PR | low | `.gitattributes`; thêm một dòng | patch |
| 8 | blind, verif-gap | Tên test merge còn ghi "đẩy lên bằng v3" | low | Version hiện tại là 4; đổi tên | patch |
| 9 | blind | Chunk từ + map `srs` lớn dần: sau 3a có thể vượt 2 MiB precache của workbox, mỗi lần chấm đẩy cả map | maybe-false | Hiện 467 KB; cần đo sau khi 3a thêm dữ liệu | defer |
| 10 | blind, edge | Thẻ học lại (1/10 phút) hiện ngay khi hết thẻ khác; `dueCount` tính cả chúng | false | Giống Anki "learn ahead"; I/O Matrix chỉ yêu cầu quay lại trong phiên hôm nay | reject |
| 11 | blind | Quên trên từ mới cũng tăng `lapses` | low | Chưa có chỗ nào dùng `lapses`; I/O Matrix ghi Quên → `lapses + 1` | reject |
| 12 | blind | Thẻ sai dạng làm từ biến mất khỏi phiên | false | Đúng I/O Matrix: bỏ qua, không xoá | reject |
| 13 | edge (×2) | `interval` không có trần, quá lớn làm `toISOString` ném lỗi | low | Cần ~14 lần Dễ cách nhau hàng chục năm hoặc dữ liệu hỏng; thêm guard → reject | reject |
| 14 | edge | Nhãn nút tính bằng `now` cũ còn chấm bằng giờ mới | low | Lệch vài phút; #1 làm `now` cập nhật | reject |
| 15 | edge, blind | `build.mjs` thiếu thư mục / JSON lỗi ra stack trace thô; test chép lại parser CSV | low | Chỉ dev chạy, vẫn báo lỗi; thêm nhánh → reject | reject |
| 16 | edge | Chấm lại thẻ sai dạng tính quota lần nữa | low | Chỉ khi dữ liệu hỏng → reject | reject |
| 17 | blind | Store mặc định không có `srs`, store migrate có | low | Code xử lý cả hai; không gây lỗi | reject |
| 18 | blind | Không có script in mẫu 30 từ; sổ sách spec trống | low | Mẫu đã in ra scratchpad; sửa sổ sách là sửa spec → reject | reject |
| 19 | blind | Thẻ mất focus bàn phím, không có phím tắt | low | App dùng trên iPhone cảm ứng → reject | reject |
| 20 | blind | `loadWords` ép kiểu không kiểm lúc chạy | false | Dữ liệu tĩnh do build kiểm và test cấu trúc | reject |
| 21 | verif-gap | Đổi tài khoản xoá cả thẻ SRS local | false | Đúng quyết định 2a: thay mọi key đồng bộ bằng bản server | reject |

## Verification

**Commands:**
- `npm run vocab:build` -- expected: sinh lại `words.json` không lỗi, không đổi nội dung (idempotent).
- `npm run lint && npm test && npm run build` -- expected: pass; `words.json` là chunk riêng, không nằm trong chunk chính.

**Manual checks:**
- Headless 375px: trang flashcard không tràn ngang; lật thẻ, chấm, hết phiên báo "Xong hôm nay".
- In 30 từ ngẫu nhiên kèm link Cambridge để Huy duyệt mẫu.
