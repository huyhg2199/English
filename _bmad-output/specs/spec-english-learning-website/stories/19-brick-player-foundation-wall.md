---
title: 'BrickPlayer, route /foundation, bức tường và viên F01 (CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'bebb730e202ce2658a1c38d0fb8ad03022ef4828'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/hp-theme.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/18-foundation-data-store-v13.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Kiểm tra cả 4 hàng trước (Soát vé):** làm ở story 20. Story này chỉ hiện đúng kết quả đã có: hàng `rows[r].passed` (hoặc học hết viên) hiện là xong trên bức tường. Không khoá viên nào; tiến độ bài và thẻ SRS cũ giữ nguyên.
- **Mốc 750:** "Bỏ qua Sân ga" / "Quay lại Sân ga" trên Lộ trình chỉ gọi `skipFoundation` / `resumeFoundation` của story 18; nối vào lịch là story 22. Không hiện "lùi N tuần".
- **Nhịp 1 viên/buổi + "Học tiếp viên sau":** thuộc buổi học (story 21). Story này chỉ có trang bức tường và trình phát viên đứng riêng.
- **Máy tính:** không làm bố cục hai cột hay phím tắt (story 30, 31); trang mới dùng khung cột hiện có.
- Claude chọn:
  - nội dung viên nằm ở `src/data/foundation/bricks/fNN.ts`, sổ đăng ký `src/data/foundation/content.ts` (không re-export từ `index.ts`, để `lib/foundation` mà sync import không kéo nội dung theo);
  - kiểu `Screen` của story 18 thêm: `check.easier` (đúng 2 câu dễ hơn), `timeline?` ở `contrast`/`worked` (dùng `TenseTimeline`), `speak?: PracticeSentence[]` ở `apply` (dùng `SpeakPractice`);
  - BrickPlayer hỗ trợ đủ 5 loại câu luyện (`choice`, `listen`, `tapSyllable`, `order`, `sort`) để story 20 chỉ cần viết nội dung;
  - < 60% so bằng số nguyên `firstTryCorrect * 10 < total * 6`, chỉ tính lần trả lời đầu của câu chính (không tính câu dễ hơn);
  - **xong viên = tới màn Áp dụng** (`learning-rules.md`): lúc màn `apply` hiện lần đầu trong lượt thì gọi `completeBrick`; thoát giữa chừng không lưu gì, mở lại bắt đầu từ màn 1;
  - "Viên tiếp theo" = viên chưa xong đầu tiên F01 → F18, có nội dung, không thuộc hàng đã xong;
  - ô "Đang soạn" không phải link; URL tới viên chưa có nội dung hiện "Đang soạn"; id lạ chuyển về `/foundation`; id viết thường được chấp nhận.

**Problem:** Store v13 đã lưu tiến độ Sân ga (story 18) nhưng chưa có chỗ nào để học: không có trang bức tường, không có trình phát viên gạch, không có viên nào có nội dung, và Lộ trình chưa có dải Sân ga trước Chặng 1.

**Approach:** Thêm route `/foundation` (bức tường 18 ô) và `/foundation/:brickId` (BrickPlayer chạy 6 loại màn), logic chấm thuần trong `src/lib/foundation`, hook `useFoundation`, nội dung F01 tự soạn kèm test dữ liệu, và dải "Sân ga 9¾" trên Lộ trình có Bỏ qua / Quay lại.

## Boundaries & Constraints

**Always:**
- Thứ tự màn: `explain` → `contrast` → `worked` → `faded` → `check` → `apply`. Thanh tiến độ "Màn n/6", nút "Tiếp" và "Quay lại màn trước".
- Câu luyện: sai thì hiện `explanationVi` và nút "Thử lại" (và "Xem đáp án" để đi tiếp); nút "Gợi ý" hiện `hintVi`. Không dùng màu `destructive`, không màn đỏ, không ghi Sổ lỗi, không ghi quiz, không cộng điểm Nhà, không ghi buổi học/streak.
- < 60% sau màn check: mời "Xem lại giải thích" (mở lại nội dung `explain` + `contrast` ngay tại chỗ) và chạy 2 câu `easier`; có "Bỏ qua, sang Áp dụng". Câu dễ hơn không tính lại điểm, không lặp lời mời.
- Không khoá: ô nào có nội dung cũng mở được, học lại được (`completeBrick` lần sau chỉ đổi `lastDoneAt`). Mở viên khi đã bỏ qua Sân ga không gọi `resumeFoundation`.
- Dùng lại: `speak`/`canSpeak` (`src/lib/speech.ts`) qua `ListenButton`, `TenseTimeline`, `SpeakPractice` (id câu dạng `f01-say-n`), `checkFill` cho màn `faded`, `seededRandom`/`shuffle` cho `order`/`sort` (xáo không ra đúng thứ tự gốc khi > 1 mảnh).
- Máy không có TTS: câu `listen` hiện `audioText` thành chữ để vẫn làm được.
- Nội dung F01 tự soạn, tiếng Việt, chỉ dùng khái niệm `en-vs-vi`, `svo-order`; giải thích 40–80 chữ; 2–5 câu check; 5 từ chủ đề là từ nội dung (không hư từ) có trong `words.json`; 1–2 `ruleCards` (chỉ dữ liệu).
- Logic chấm, điểm, viên tiếp theo là hàm thuần có test. Giao diện 375px của các trang cũ không đổi, trừ dải mới trên Lộ trình.

**Never:**
- Không Soát vé, "Tôi biết rồi", `quiz-f-*`, nội dung F02–F18 (story 20, 25, 26).
- Không sessionPlan / buổi học / Hôm nay / ngày lười / lịch (story 21, 22); không màn "Qua bức tường", huy chương, +5 điểm Nhà (story 26); không nối `ruleCards`/từ chủ đề vào SRS (story 23, 24).
- Không SplitLayout, lớp `lg:`, phím tắt. Không đổi shape store, migration, luật gộp.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bức tường mới | Store mặc định | 4 hàng A–D có tên, 18 ô; "0/18 viên gạch"; F01 sáng viền "Học tiếp"; F02–F18 "Đang soạn" | N/A |
| Hàng qua kiểm tra | `rows.A.passed` true, chưa xong viên nào | 6 ô hàng A sáng, hàng A "Xong", "6/18"; không còn viên tiếp theo → "Các viên tiếp theo đang soạn" | N/A |
| Học xong F01 | Đi tới màn `apply` | `completeBrick('F01')`; về tường thấy F01 sáng, "1/18" | N/A |
| Học lại | F01 đã xong, học lại ngày sau | `firstDoneAt` giữ, `lastDoneAt` mới | N/A |
| Thoát giữa chừng | Rời trang ở màn check | Không ghi gì; mở lại từ màn 1 | N/A |
| Faded | Gõ "Went " cho đáp án "went" | Đúng (bỏ hoa thường, khoảng trắng) | Sai: hiện `hintVi`, gõ lại hoặc "Xem đáp án" |
| Câu sai | Chọn sai lần đầu | Giải thích + "Thử lại", màu trung tính, Sổ lỗi không đổi | N/A |
| Gợi ý | Bấm "Gợi ý" trước khi trả lời | Hiện `hintVi`, điểm lần đầu không đổi | N/A |
| Dưới 60% | 1/4 hoặc 2/4 đúng lần đầu | Mời "Xem lại giải thích" + 2 câu dễ hơn rồi Áp dụng | "Bỏ qua, sang Áp dụng" |
| Đúng 60% | 3/5 | Không mời, sang Áp dụng | N/A |
| Order / sort | Sắp sai thứ tự / xếp sai nhóm | Giải thích, làm lại từ đầu câu | N/A |
| Không TTS | `canSpeak()` false | Ẩn nút nghe; câu `listen` hiện chữ | N/A |
| URL lạ | `/foundation/F02`; `/foundation/f01`; `/foundation/F99` | F02: "Viên này đang soạn" + về tường; f01: chạy F01; F99: chuyển `/foundation` | Không crash |
| Lộ trình, đang ở Sân ga | `status: in-foundation` | Dải trên Chặng 1: "x/18", "Vào Sân ga", link "Bỏ qua Sân ga" → xác nhận tại chỗ → `skipFoundation` | Huỷ: không ghi |
| Đã bỏ qua | `status: skipped` | Dải "Đã bỏ qua", nút "Quay lại Sân ga" (`resumeFoundation` rồi tới `/foundation`), link "Xem bức tường" không đổi trạng thái | N/A |
| Đã qua tường | `status: completed` | Dải "Đã qua bức tường", chỉ link xem tường | N/A |
| Tab sáng | Ở `/foundation/F01` | Tab Lộ trình sáng | N/A |

</frozen-after-approval>

## Code Map

- `src/data/foundation/types.ts` -- kiểu `Screen`/`CheckItem`/`RuleCard`/`Brick` (story 18); mở rộng như Decisions. `TimelineKind`, `PracticeSentence` lấy từ `@/data/lessons`.
- `src/data/foundation/catalog.ts` -- `BRICKS`, `getBrickMeta`, `isBrickId`, `bricksOfRow`; thêm `ROW_TITLES` (A "Nghe & đọc được chữ", B "Viên gạch của câu", C "Câu đầu tiên", D "Cầu sang Năm 1").
- `src/lib/foundation/foundation.ts` -- `foundationState` (`taughtCount`, `rowsDone`, `doneBrickIds`, `status`), `isRowDone`, `completeBrick`, `skipFoundation`, `resumeFoundation`. Không import nội dung viên (sync import module này).
- `src/app/store-context.ts` -- mẫu hook `useSrs`/`usePronunciation` (`handle.update`, `useMemo` theo `store`).
- `src/app/routes.tsx`, `src/app/nav-items.ts` (+ `nav-items.test.ts`) -- thêm route; `/foundation` vào `alsoActiveFor` của Lộ trình.
- `src/pages/Roadmap.tsx`, `src/components/roadmap/Station.tsx`, `StageMap.tsx` -- kiểu sáng `--candle-glow`, `Card`; dải mới đặt giữa khối đầu trang và Chặng 1.
- `src/components/ListenButton.tsx`, `src/lib/speech.ts`, `src/components/lesson/TenseTimeline.tsx` -- dùng lại, không sửa. `src/components/lesson/SpeakPractice.tsx` -- dùng lại, chỉ thêm prop tuỳ chọn `tone="gentle"` (không màu đỏ); mặc định giữ nguyên cho các trang cũ.
- `src/lib/subs/blanks.ts` (`checkFill`), `src/lib/quiz/random.ts` (`seededRandom`, `shuffle`) -- dùng lại.
- `src/data/vocab` (`loadWords`, mẫu `vocab.test.ts` dùng `await loadWords()`) -- test từ chủ đề.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`; không có test component, nên mọi logic UI phải tách thành hàm thuần.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/types.ts`, `catalog.ts`, `index.ts` -- thêm `easier`, `timeline?`, `speak?`, `ROW_TITLES`.
- [x] `src/data/foundation/bricks/f01.ts`, `src/data/foundation/content.ts` -- F01 = `{ ...meta F01, screens, ruleCards, themeWordIds }`: explain (4 chỗ khác: động từ đổi dạng, đuôi từ mang ngữ pháp, mạo từ, âm cuối; S-V-O giống), contrast "Hôm qua tôi đi" / "Yesterday I went" kèm timeline `past-point`, worked, faded một `___`, check 4 câu (có ít nhất `choice`, `listen`, `order`) + 2 câu `easier`, apply chọn câu phải đổi chữ + `speak` 2 câu. Sổ đăng ký: `BRICK_CONTENT`, `getBrick(id)`, `hasBrickContent(id)`.
- [x] `src/data/foundation/foundation.test.ts` -- cho mọi viên có nội dung: meta khớp catalog; thứ tự kind đúng 6 màn; explain 40–80 chữ; id câu/thẻ/câu nói không trùng trong toàn bộ nội dung; `choice`/`listen` có `answer` trong `options`, 3 lựa chọn khác nhau; `tapSyllable` ghép lại đúng `word`, `answer` trong khoảng; `order` ≥ 2 mảnh; `sort` ≥ 2 nhóm, mục không trùng; `faded.en` và `ruleCards.cloze` đúng một `___`; check 2–5 câu, `easier` đúng 2; `themeWordIds` đúng 5 và có trong `words.json`; `uses` của câu chỉ là khái niệm viên này hoặc viên trước dạy.
- [x] `src/lib/foundation/player.ts` (+ `player.test.ts`, export qua `index.ts`) -- `isCorrect(item, response)` cho 5 loại; `needsReview(firstTryCorrect, total)`; `shuffledTokens(item, seed)`; `nextBrickId(store, hasContent)`. Ca test theo các dòng Faded, Dưới 60%, Đúng 60%, Order/sort, Hàng qua kiểm tra, Bức tường mới, Học xong F01.
- [x] `src/app/store-context.ts` -- `useFoundation()`: `state`, `completeBrick(id)`, `skip()`, `resume()` (tham số `now` mặc định `new Date()`).
- [x] `src/components/foundation/BrickPlayer.tsx` (+ `BrickScreen.tsx`, `CheckItemView.tsx`) -- chạy màn, gợi ý, làm lại, lời mời < 60%, gọi `completeBrick` khi màn apply hiện lần đầu; tách nội dung màn khỏi điều hướng để story 30 chia hai cột.
- [x] `src/components/foundation/BrickWall.tsx`, `src/pages/Foundation.tsx`, `src/pages/FoundationBrick.tsx` -- bức tường + nút "Học tiếp: F0n · tên"; trang viên xử lý id thường/lạ/đang soạn.
- [x] `src/components/roadmap/FoundationBand.tsx`, `src/pages/Roadmap.tsx` -- dải 3 trạng thái, xác nhận bỏ qua tại chỗ.
- [x] `src/app/routes.tsx`, `src/app/nav-items.ts`, `src/app/nav-items.test.ts` -- route `foundation`, `foundation/:brickId`; test route thật và tab Lộ trình sáng.

**Acceptance Criteria:**
- Given người dùng mới, when vào Lộ trình, then thấy dải "Sân ga 9¾ · 0/18" ở trên Chặng 1, bấm "Vào Sân ga" tới bức tường, bấm F01 học hết 6 màn, về tường thấy F01 sáng và "1/18" (còn sau khi tải lại).
- Given đang học F01, when trả lời sai, then không thấy màu đỏ và `store.data.mistakes` không đổi.
- Given đã bỏ qua Sân ga, when mở F01 từ bức tường và học xong, then trạng thái vẫn `skipped` và Lộ trình vẫn hiện "Quay lại Sân ga".
- Given màn hình 375px, when mở `/foundation`, `/foundation/F01`, `/roadmap`, then không có cuộn ngang và các trang khác không đổi.

## Implementation Notes

- **Files:** `src/data/foundation/{types,catalog,index,content}.ts`, `bricks/f01.ts`, `foundation.test.ts`; `src/lib/foundation/player.ts` (+ `player.test.ts`, export qua `index.ts`); `useFoundation` trong `store-context.ts`; `src/components/foundation/{BrickPlayer,BrickScreen,CheckItemView,BrickWall}.tsx`; `src/components/roadmap/FoundationBand.tsx`; `src/pages/{Foundation,FoundationBrick}.tsx`; `Roadmap.tsx` (chỉ chèn dải); `routes.tsx`, `nav-items.ts` (+ test).
- **Kiểu:** ngoài `check.easier`, `timeline?` (contrast/worked), `speak?` (apply), thêm `apply.item?: CheckItem` (một câu chọn, không tính điểm) để làm "apply chọn câu phải đổi chữ" có tương tác; test dữ liệu kiểm cả câu này (id, lựa chọn, `uses`). Kiểu chung `BrickTimeline`.
- **Nội dung F01:** explain (4 chỗ khác + S-V-O giống), contrast "Hôm qua tôi đi" / "Yesterday I went" + `past-point`, worked "Yesterday I ate rice", faded "Yesterday I ___ to school" (went), check 4 câu (`choice`, `listen`, `order`, `sort`) + 2 `easier` (`choice`), apply (câu chọn + `f01-say-1..2`), 2 `ruleCards`, từ chủ đề `ngsl-go/eat/yesterday/book/rice` (động từ, trạng từ, danh từ). `uses` chỉ `en-vs-vi`, `svo-order`.
- **Logic thuần (`player.ts`):** `isCorrect` (5 loại; `sort` trả lời dạng mục → vị trí nhóm), `isFadedCorrect` (= `checkFill`), `answerText`, `needsReview` (`x*10 < n*6`), `shuffledTokens` (seed + id câu; trùng thứ tự gốc thì xoay một bước), luồng màn check `CheckFlow` (`startCheck`/`recordAnswer`/`advanceCheck`/`startEasier`/`skipEasier`/`firstTryScore`; "Xem đáp án" khi chưa trả lời tính sai lần đầu; câu dễ hơn không tính, lời mời chỉ một lần), `nextBrickId(store, hasContent)` + `nextBrickIdFromState`, `wallRows` (ô sáng = viên xong hoặc hàng xong), `resolveBrickRoute` (thường → hoa, lạ → `unknown`), `brickHref`. `lib/foundation` không import nội dung: nơi gọi truyền `hasBrickContent`.
- **UI:** "Tiếp" ở màn check chỉ bật khi luồng `finished` (mỗi câu đúng hoặc "Xem đáp án", hoặc "Bỏ qua, sang Áp dụng"); các màn khác không chặn. Luồng check giữ ở BrickPlayer nên "Quay lại màn trước" không mất điểm. `completeBrick` gọi trong effect khi màn apply hiện lần đầu (ref chặn gọi lặp). Sai: viền nét đứt + nền `muted`, không màu đỏ. Lời mời < 60%: "Xem lại giải thích" (mở explain + contrast tại chỗ), "Làm 2 câu dễ hơn", "Bỏ qua, sang Áp dụng". Không TTS: `ListenButton` tự ẩn, câu `listen` hiện `audioText`. Dải Lộ trình: xác nhận bỏ qua tại chỗ (Huỷ không ghi); "Quay lại Sân ga" = `resume()` rồi `navigate('/foundation')`.
- **Lưu ý:** `SpeakPractice` vẫn ghi điểm nói vào `store.data.pronunciation` theo id `f01-say-n`; ở màn Áp dụng dùng `tone="gentle"` nên từ lệch gạch chân nét đứt, điểm thấp và lỗi micro màu trung tính (không `text-destructive`).
- **Kiểm chứng:** `npm run lint && npm test && npm run build` pass (51 file, 925 test; `check-precache` OK; cảnh báo chunk size có sẵn). Grep `destructive|mistake` không có kết quả. Headless Chrome 375px (CDP, dev server không Supabase): toàn bộ luồng I/O Matrix pass — bức tường mới 0/18, 17 ô "Đang soạn"; F01 sai → Thử lại / Gợi ý / Xem đáp án, faded "Went ", order sai → làm lại, 1/4 → lời mời + 2 câu dễ hơn, chưa ghi viên trước apply, apply ghi `bricks.F01`, `mistakes` không đổi, store chỉ có key `foundation`; tường 1/18 (còn sau tải lại); `/foundation/F02` đang soạn, `f01` chạy, `F99` về `/foundation`; bỏ qua (Huỷ không ghi) → học xong F01 vẫn `skipped`, `firstDoneAt` giữ / `lastDoneAt` mới, "Xem bức tường" không đổi trạng thái, "Quay lại Sân ga" → `/foundation`; tab Lộ trình sáng; không cuộn ngang ở `/roadmap`, `/foundation`, `/foundation/F01` (mọi màn), `/`, `/practice`, `/notebook`, `/trophies`. Không TTS (ẩn `speechSynthesis`): câu listen hiện chữ, không nút nghe.

## Spec Change Log

- **2026-11-06 · review vòng 1 (không loopback, chỉ sửa phần ngoài frozen):**
  - **Finding kích hoạt:** `SpeakPractice` dùng lại ở màn Áp dụng tô `text-destructive` (từ lệch, điểm < 70, lỗi micro), trái luật "Không dùng màu `destructive`, không màn đỏ" và AC "không thấy màu đỏ"; Code Map lại ghi "dùng lại, không sửa" nên hai chỗ mâu thuẫn.
  - **Đã sửa:** Code Map và Implementation Notes cho phép thêm prop tuỳ chọn `tone="gentle"` vào `SpeakPractice` (mặc định không đổi, trang bài học cũ giữ màu cũ). Phần frozen giữ nguyên.
  - **Trạng thái xấu tránh được:** người học thấy chữ đỏ ở viên gạch, đi ngược tinh thần "không phạt" của Sân ga.
  - **KEEP:** giữ toàn bộ kiến trúc BrickPlayer/CheckFlow, hàm thuần trong `player.ts`, sổ đăng ký `content.ts` tách khỏi `index.ts`, và việc ghi `pronunciation` theo id `f01-say-n`.
  - **Ghi thêm (patch nhỏ cùng vòng):** câu `order`/`sort` xếp xong phải bấm "Kiểm tra" mới chấm (sửa được trước khi chấm); màn check luôn được gắn (ẩn bằng `hidden`) để quay lại màn trước không mất trạng thái câu; `/foundation/f01` chuyển `replace` sang `/foundation/F01`.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|------------|-------|
| 1 | blind | `order`/`sort` chấm ngay ở lần chạm cuối, không sửa được trước khi chấm | medium | `CheckItemView.tsx` gọi `submit` khi `next.length === pieces.length` / mọi mục có nhóm; chạm nhầm nhóm ở mục cuối của `sort` thành sai lần đầu, kéo điểm < 60% | patch: bỏ tự chấm, thêm nút "Kiểm tra" khi đã xếp đủ (mảnh/mục vẫn bỏ ra được) |
| 2 | blind | Câu áp dụng F01 có hai đáp án | medium | `f01-a1`: "Tôi thích đọc sách." → "I like reading books" cũng đổi dạng động từ (read → reading) | patch: đổi lựa chọn thành "Tôi ăn cơm." |
| 3 | blind | Nhãn nhóm "Bây giờ" sai nghĩa | low | `f01-c4` xếp go/eat vào "Bây giờ"; "now" thường đi với -ing, go/eat là dạng gốc | patch: đổi nhãn thành "Dạng gốc" |
| 4 | blind | 2/4 chỗ khác dạy ở explain không được luyện | low | Check chỉ thử S-V-O và go/went; `f01-c3` giữ "a book" một mảnh nên mạo từ không phải chọn. Số nhiều có ở ruleCard; âm cuối là viên F05 | patch: tách `a`, `book` thành hai mảnh, giải thích nhắc mạo từ (giữ `uses` trong `en-vs-vi`, `svo-order`) |
| 5 | blind | `SpeakPractice` tô đỏ ở màn Áp dụng | medium | `SpeakPractice.tsx` dùng `text-destructive` cho lỗi, từ lệch, điểm < 70; trái luật "Never" và AC không màu đỏ. Ghi `pronunciation` là đúng spec (id `f01-say-n`) | patch: prop `tone="gentle"` (mặc định giữ nguyên), Spec Change Log |
| 6 | blind | Mất focus khi chuyển màn | low | Đúng là `go()` chỉ `scrollIntoView`; Chrome giữ điểm bắt đầu Tab ở nút vừa bấm, người dùng duy nhất không dùng trình đọc màn hình; phím tắt/máy tính thuộc story 31 | reject |
| 7 | blind | Xác nhận bỏ qua mất focus, nhãn trùng | low | Nút xác nhận cùng chữ "Bỏ qua Sân ga" với nút mở; focus rơi về `body` khi nút mở biến mất | patch: nhãn "Có, bỏ qua", `autoFocus` vào "Huỷ" |
| 8 | blind | `aria-label` trên `div` / `svg` không role | low | Ô "Đang soạn" là `div` có `aria-label` (không hợp lệ cho phần tử generic); icon ✓ là `svg` có `aria-label` không `role` | patch: bỏ `aria-label` trên `div` (chữ "Đang soạn" đã hiện), thêm `role="img"` cho icon ✓ |
| 9 | blind | Màn faded: gõ phím đầu là mất gợi ý và "Xem đáp án" | medium | `FadedBody` `onChange` đặt lại `answering` khi đang `wrong`, nên `hintVi` biến mất lúc đang sửa | patch: bỏ dòng đặt lại trạng thái khi gõ |
| 10 | blind | Không TTS: câu `listen` thành chép chữ, vẫn tính điểm | low | Đúng như mô tả, nhưng frozen spec chọn rõ "câu `listen` hiện `audioText`"; máy không có `speechSynthesis` rất hiếm (Chrome/Safari đều có) | reject |
| 11 | blind | Test dữ liệu thiếu vài luật | low | Thiếu: F01 có `choice`/`listen`/`order`, `faded.answer` và `speak[].text` không rỗng. `audioText === options[answer]` không phải bất biến (listen có thể chọn nghĩa); đáp án ruleCard trùng không phải luật spec; "không vượt `uses`" về từ vựng không kiểm máy được | patch: thêm 3 kiểm tra trên |
| 12 | blind | Logic UI (dải Lộ trình, `canNext`) nằm trong component | low | Chỉ là ánh xạ hiển thị 3 trạng thái và một điều kiện một dòng; không có bên gọi nào lệch | reject |
| 13 | blind | 18/18 mà dải và tường vẫn như đang học | false | Không đạt được trong story này: chỉ F01 có nội dung và hàng chỉ qua bằng Soát vé (story 20); màn "Qua bức tường" + `completedAt` là story 26 | reject |
| 14 | blind | Bức tường không báo đã bỏ qua Sân ga | low | Có thật nhưng là hành vi spec chọn: mở viên khi đã bỏ qua không gọi `resumeFoundation`, "Quay lại Sân ga" nằm ở Lộ trình (AC 3) | reject |
| 15 | blind | Quay lại màn trước rồi trở lại thì câu đã đúng phải làm lại | medium | `CheckItemView` bị unmount khi rời màn check, gắn lại ở `answering`; `firstTry` đã ghi nên lần làm lại không đổi điểm nhưng vẫn phải trả lời | patch: màn check luôn được gắn, ẩn bằng `hidden` khi ở màn khác |
| 16 | blind | Lựa chọn nhiễu "Rice I eat." vẫn đúng ngữ pháp | low | Topicalisation ("Rice I eat, bread I don't") hợp lệ | patch: đổi thành "Eat I rice." |
| 17 | blind | `/foundation/f01` không chuẩn hoá URL | low | `FoundationBrick` chạy F01 nhưng giữ URL thường | patch: `<Navigate replace>` sang `brickHref(route.id)` |
| 18 | edge | Câu đã đúng bị làm lại sau khi quay lại màn trước | medium | Cùng gốc với #15 | patch (cùng #15) |
| 19 | edge | `f01` ↔ `F01` dùng lại BrickPlayer cũ | low | Cùng `key` nên giữ state; cùng gốc với #17 | patch (cùng #17) |
| 20 | edge | Không TTS lộ đáp án `listen` | low | Cùng gốc với #10 | reject (cùng #10) |
| 21 | edge | `confirming` còn mở khi trạng thái đổi từ ngoài rồi quay lại | low | Cần đồng bộ bỏ qua rồi quay lại trong lúc dải vẫn gắn; "Quay lại Sân ga" tự `navigate` đi nên dải bị gỡ | reject |
| 22 | edge | Ghi `completeBrick` thất bại mà màn Áp dụng vẫn báo sáng | low | `handle.update` trả `false` chỉ ở chế độ bộ nhớ tạm; app đã có thông báo toàn cục "Không lưu được dữ liệu…" (`storage-notice.ts`), các ghi tiến độ khác cũng không báo riêng | reject |
| 23 | edge | Gửi ô faded rỗng hiện "Chưa đúng" | low | Đúng, nhưng màn faded không tính điểm, chỉ hiện gợi ý; vô hại | reject |
| 24 | vgap | Hiệu ứng ghi `completeBrick` khi tới màn Áp dụng không có test | medium | Đã xác minh từ layer: không có test component (Vitest env `node`, chỉ `*.test.ts`) | defer (`deferred-work.md`) |
| 25 | vgap (khác) | Nhánh "Xem đáp án khi chưa trả lời tính sai" trong `advanceCheck` UI không chạm tới | low | "Xem đáp án" chỉ hiện sau khi sai; nhánh này là phòng thủ, vô hại và đúng luật nếu UI đổi sau | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass (gồm `check-precache`).
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/data/foundation src/lib/foundation src/app/nav-items.test.ts` -- expected: pass, có ca cho mọi dòng I/O Matrix có logic thuần.
- `grep -rn "destructive\|mistake" src/components/foundation src/pages/Foundation.tsx src/pages/FoundationBrick.tsx` -- expected: không có kết quả.

**Manual checks:**
- Headless Chrome 375px: bức tường, chạy F01 (sai → làm lại, gợi ý, < 60% → câu dễ hơn), dải Lộ trình ba trạng thái (bỏ qua → quay lại), không tràn ngang.
