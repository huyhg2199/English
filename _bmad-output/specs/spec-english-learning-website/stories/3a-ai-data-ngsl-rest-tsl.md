---
title: 'Dữ liệu AI cho phần còn lại của NGSL và toàn bộ TSL'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: 'cec5a1d59751c5e336967b6ecbd7f8a87c5f66bc'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:**
- Huy cho phép chạy tất cả story liên tục không cần duyệt từng bước (2026-11-01); quyết định mở do Claude chọn và ghi lại ở đây.
- Sinh dữ liệu theo đúng định dạng lô của story 3 (`stack.md` mục "Bộ từ vựng") cho NGSL hạng 1001–2809 và TSL hạng 1–1250. IPA kiểu Mỹ.
- TSL có cả `resume` và `résumé`: `résumé` là danh từ "sơ yếu lý lịch", `resume` là động từ "tiếp tục".
- Nâng giới hạn precache của workbox để chunk từ vựng luôn được lưu offline, và để build thất bại nếu chunk vượt giới hạn (giải quyết mục deferred của story 3).

**Problem:** Phiên ôn chỉ có 1000 từ NGSL đầu. Theo lộ trình, từ T5 (03/2027) Huy học từ vựng công sở (TSL), và mốc ~2200 từ ở T12 cần cả NGSL lẫn TSL.

**Approach:** Thêm các lô AI ~200 từ vào `scripts/vocab/ai/`, kiểm từng lô bằng `check-batch.mjs`, chạy `npm run vocab:build`. Phiên ôn tự đi tiếp NGSL → TSL vì `buildSession` đã lấy mọi từ có dữ liệu.

## Boundaries & Constraints

**Always:**
- Mỗi lô qua `node scripts/vocab/check-batch.mjs <file> <đầu> <cuối> [tsl]` và `vocab:build` không lỗi; âm nhấn khớp vị trí `ˈ`.
- Nghĩa Việt ngắn, đúng nghĩa phổ biến nhất (ưu tiên nghĩa trong ngữ cảnh công sở/TOEIC với TSL); câu ví dụ ngắn, tự nhiên, hợp ngữ cảnh văn phòng/đời sống, không chép câu từ đề ETS hay từ điển.
- Không đổi id thẻ, không đổi định dạng lô, không đổi code SRS.
- Không có API key trong repo.

**Never:**
- Không sửa 5 lô NGSL 1–1000 đã có (trừ khi `vocab:build` báo lỗi thật ở đó).
- Không đóng gói thêm danh sách nào ngoài NGSL/TSL.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Đủ dữ liệu | Build sau khi thêm mọi lô | Mọi từ trong 2809 NGSL + 1250 TSL có dữ liệu AI | N/A |
| Hết NGSL | Đã giới thiệu hết NGSL | Từ mới lấy tiếp TSL hạng 1, 2, … | N/A |
| Từ trùng giữa NGSL và TSL | Cùng một từ có ở cả hai danh sách | Hai id khác nhau (`ngsl-x`, `tsl-x`), cả hai có dữ liệu | N/A |
| Chunk lớn | Chunk từ vựng sau build | Nằm trong precache của service worker | Build fail nếu vượt giới hạn |

</frozen-after-approval>

## Code Map

- `scripts/vocab/ai/` -- 5 lô có sẵn `ngsl-0001-0200.json` … `ngsl-0801-1000.json` là mẫu định dạng và giọng văn.
- `scripts/vocab/check-batch.mjs` -- kiểm một lô theo khoảng hạng; `tsl` làm đối số thứ 4.
- `scripts/vocab/build.mjs`, `scripts/vocab/lib.mjs` -- gộp + kiểm (`validateAiEntry`, `VOWEL_NUCLEI`).
- `src/data/vocab/vocab.test.ts` -- test "1000 từ NGSL đầu có dữ liệu AI, các từ khác chưa có" phải đổi thành "mọi từ có dữ liệu".
- `vite.config.ts` -- `VitePWA` `workbox.globPatterns`; chưa đặt `maximumFileSizeToCacheInBytes` (mặc định 2 MiB, vượt thì bị bỏ khỏi precache âm thầm).

## Tasks & Acceptance

**Execution:**
- [x] `scripts/vocab/ai/ngsl-1001-1200.json` … `ngsl-2801-2809.json` -- 10 lô NGSL hạng 1001–2809.
- [x] `scripts/vocab/ai/tsl-0001-0200.json` … `tsl-1201-1250.json` -- 7 lô TSL hạng 1–1250.
- [x] `src/data/vocab/words.json` -- chạy `npm run vocab:build`.
- [x] `src/data/vocab/vocab.test.ts` -- đổi test phạm vi dữ liệu AI thành "mọi từ NGSL + TSL đều có dữ liệu"; thêm test `resume`/`résumé` có `pos` khác nhau.
- [x] `vite.config.ts` (+ test hoặc bước kiểm sau build) -- đặt `maximumFileSizeToCacheInBytes` đủ cho chunk từ vựng (vd 4 MiB) và bảo đảm build/test thất bại nếu chunk `words-*.js` không có trong precache manifest của `dist/sw.js`.
- [x] `stack.md` -- ghi phạm vi dữ liệu đã đủ, giới hạn precache.

**Acceptance Criteria:**
- Given app sau build, when ôn hết NGSL (giả lập trong test), then từ mới tiếp theo là TSL hạng 1.
- Given `dist/sw.js`, when tìm chunk từ vựng, then có trong precache.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Thứ tự học "hết NGSL rồi mới TSL" trái lộ trình (TSL từ T5, khi mới ~1000 từ nền) | medium | `compareStudyOrder` (story 3) xếp mọi `ngsl` trước `tsl`; với 10 từ/ngày, TSL chỉ tới sau ~9 tháng. Lỗi có từ story 3, 3a làm lộ ra | defer → story 4 (thêm quyết định + task chọn danh sách từ mới theo chặng) |
| 2 | blind, verif-gap | Comment `check-precache.mjs`/`vite.config.ts` nói workbox bỏ âm thầm file quá lớn, trái `stack.md` | low | vite-plugin-pwa 2.0.0 biến cảnh báo thành lỗi build (`chunk-G4TAN34B.js:41-48`); sửa comment | patch |
| 3 | blind, edge | `check-precache.mjs`: `readdirSync` không bắt lỗi; kiểm bằng `includes` trên cả file | low | Sửa trực tiếp: try/catch + regex mục manifest | patch |
| 4 | blind, edge, verif-gap | Test "từ có ở cả NGSL và TSL" không chạy `expect` nào | medium | NGSL 1.2 và TSL 1.2 không có từ chung (đã lọc, 0 kết quả) | patch |
| 5 | blind | Diff không có dữ liệu lô AI; chất lượng nghĩa/câu không có check tự động | low | Dữ liệu quá lớn để review; Huy duyệt mẫu 30 từ (`sample-3a.md`) | reject |
| 6 | blind | Sổ sách spec (Implementation Notes, kết quả Verification) trống | low | Sửa là sửa spec | reject |
| 7 | blind | AC kiểm bằng `words.json` nguồn chứ không phải app build | low | Cùng một file được đóng gói; dữ liệu giống nhau | reject |
| 8 | blind | Số từ 2809 + 1250 viết cứng | low | Đổi phiên bản danh sách là việc lớn, cần sửa test có chủ đích | reject |
| 9 | blind | Precache ~1,2 MB (gzip ~305 KB) mỗi lần cập nhật SW | low | Chấp nhận để flashcard chạy offline | reject |
| 10 | edge | `check-precache.mjs` viết cứng `dist/assets` | low | Config không đổi `outDir`; thêm đọc config → reject | reject |

## Verification

**Commands:**
- `for f in scripts/vocab/ai/*.json; do …check-batch…; done` -- expected: mọi lô hợp lệ.
- `npm run vocab:build` (chạy 2 lần) -- expected: không lỗi, kết quả giống nhau.
- `npm run lint && npm test && npm run build` -- expected: pass; `dist/sw.js` có chunk `words-*.js`.

**Manual checks:**
- In 30 từ ngẫu nhiên (15 NGSL 1001+, 15 TSL) kèm link Cambridge ra file trong scratchpad để Huy duyệt mẫu.
