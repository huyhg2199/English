---
title: 'SRS phần 1: số từ mới mỗi ngày, thẻ Làm quen, từ chủ đề, ẩn hiện IPA/trọng âm/từ loại (CAP-9, CAP-10, CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'e4fe212e968c47aeaaa19bfeb8c8065c890cac83'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/18-foundation-data-store-v13.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Kiểm tra cả 4 hàng trước (Soát vé):** hàng qua Soát vé hay "Tôi biết rồi" thì viên của hàng đó tính là đã dạy, nên cổng IPA / trọng âm / từ loại mở theo `isGateOpen` của story 18. Bỏ qua Sân ga cũng mở mọi cổng. Cổng đã mở thì không đóng, kể cả khi quay lại Sân ga. Thẻ SRS cũ và lịch của chúng giữ nguyên.
- **Nhịp:** 1 viên mỗi buổi 30'. Vì vậy khi đang ở Sân ga chỉ học 5 từ mới mỗi ngày, và từ chủ đề của viên vừa học được ưu tiên lên trước.
- **Mốc 750, máy tính:** story này không đụng tới. Không làm thanh trên cùng, hai cột hay phím tắt (story 29–31).
- Claude chọn:
  - **`buildSession(srs, words, now, options = {})`**, trong đó `options` là `{ newPerDay?, firstList?, custom?, preferIds?, introMode? }`. Mặc định giữ hành vi cũ: `NEW_PER_DAY` 10, `'ngsl'`, `[]`, `[]`, `false`. Mọi nơi gọi chuyển sang dạng object.
  - **Thứ tự từ mới:** lấy từ chưa có thẻ trong `preferIds` trước, đúng thứ tự `preferIds`. Phần còn lại theo `compareStudyOrder(firstList)` như cũ. Id trùng, id đã có thẻ, id không có trong bộ từ, id chưa có dữ liệu AI: bỏ qua.
  - **`preferIds`** = từ chủ đề (`themeWordIds`) của các viên đã xong (`firstDoneAt` có), xếp viên có `lastDoneAt` muộn nhất trước (bằng nhau thì theo F01 → F18), rồi tới `STARTER_WORD_IDS`, bỏ trùng. Viên chỉ qua bằng kiểm tra hàng (chưa học) không góp từ. Luật này áp dụng ở mọi giai đoạn, nên sau Sân ga thì từ khởi đầu chưa học vẫn lên trước.
  - **Danh sách từ khởi đầu:** NGSL 1.2 không có số 2–100, thứ trong tuần và tháng (F06 dạy các từ này), nên danh sách chỉ dùng từ NGSL có sẵn dữ liệu AI. Không thêm từ hay dữ liệu từ mới. 60 id theo 4 nhóm, đúng thứ tự sau:
    - **thời gian:** day, week, month, year, hour, minute, time, today, tomorrow, yesterday, morning, afternoon, evening, night, weekend;
    - **gia đình:** family, mother, father, parent, child, brother, sister, son, daughter, wife, husband, baby;
    - **nghề:** job, teacher, student, doctor, worker, manager, driver, police, officer, engineer, nurse, farmer;
    - **lớp học:** school, class, lesson, book, paper, page, table, chair, desk, board, computer, door, window, clock, pen, bag, phone, question, answer, word, test.

    Id có dạng `ngsl-<từ>`. Danh sách chỉ có thực từ, không có hư từ (story 24 chặn hư từ).
  - **`newPerDayFor(store, now)`** trả `{ count, heavyReview }`:
    - đang ở Sân ga (`isInFoundation`): 5;
    - bài hiện tại (`sessionLesson`) thuộc tháng `t1`: 8;
    - còn lại, kể cả khi đã xong lộ trình: 10;
    - số thẻ đến hạn ôn (`dueCardCount(srs, now, counted?)`: thẻ hợp lệ có `due ≤ now` mà phiên hiện là thẻ ôn, tức bỏ thẻ `added` chưa chấm và thẻ riêng Sổ tay không còn mục lưu) lớn hơn 40 thì `count` là `min(3, giá trị trên)` và `heavyReview: true`.
    - Giá trị này tính lại theo `now` mỗi lần. Ôn xuống còn ≤ 40 thẻ trong ngày thì quota trở lại bình thường. Đây là phần thưởng, không phải phạt.
    - Quota vẫn trừ đi số từ đã giới thiệu hôm nay, như cũ.
  - **Lời nhắn khi tồn ôn:** khi `heavyReview` thì `FlashcardSession` hiện một dòng `role="status"` dưới dòng đếm: "Hôm nay ôn kỹ, mai học từ mới tiếp". Không dùng màu `destructive`.
  - **Thẻ "Làm quen":**
    - Bật `introMode` thì mỗi từ NGSL/TSL chưa có thẻ trong hàng đợi có `kind: 'new'` và `intro: true`.
    - Thẻ riêng từ Sổ tay và thẻ `added` không bao giờ là thẻ Làm quen.
    - Thẻ hiện ngay mặt sau (không có nút "Lật thẻ"): nhãn "Làm quen", từ, nút nghe, nghĩa, câu ví dụ có nút nghe, các dòng IPA / âm tiết / từ loại theo cổng, "Câu gốc của bạn", link Cambridge.
    - Có một nút chính "Đã xem", gọi `grade(id, 'good')`, tức `review(card, 'good')`: ra khỏi bước học, đến hạn 0h ngày mai.
    - Vẫn có nút phụ "Đã biết từ này (ôn lại sau 2 tháng)". Không có Quên/Khó/Nhớ/Dễ.
    - Mọi nơi dùng phiên ôn trong app (trang flashcard, bước ôn của buổi, ngày lười, tóm tắt ở Luyện tập) đều bật `introMode` qua `buildStudySession`.
  - **Cổng hiển thị** (`flashcardGates(store)` = `{ ipa, stress, pos }` từ `isGateOpen`):
    - IPA hiện sau F03 (chuỗi IPA giữ nguyên, kể cả dấu `ˈ`);
    - dòng âm tiết có tô âm nhấn hiện sau F04;
    - nhãn từ loại hiện sau F07.
    - Khi IPA còn ẩn, thẻ có một dòng mờ "Phiên âm IPA mở sau viên F03" link tới `/foundation/F03`.
    - Chỉ áp dụng cho thẻ từ NGSL/TSL trong `FlashcardSession`. Các trang khác hiện IPA (Sổ lỗi, O.W.L., bài học) giữ nguyên.
  - **Nhãn hạng:** `rankLabel(word)` cho "Từ phổ biến #n" với NGSL và "Từ TOEIC #n" với TSL.

**Problem:** Phiên ôn đang cho 10 từ mới mỗi ngày bất kể giai đoạn, lấy thẳng theo hạng NGSL (the, of, and…). Lần đầu gặp từ đã bắt chấm Quên/Khó/Nhớ/Dễ. Thẻ hiện IPA, trọng âm và từ loại trước khi Huy được dạy chúng là gì, và nhãn "NGSL #n" là thuật ngữ lạ với người mất gốc.

**Approach:**
- `buildSession` nhận object options, có thêm `preferIds` và `introMode`.
- Hàm thuần ở `src/lib/flashcard-session.ts` tính số từ mới mỗi ngày, danh sách ưu tiên, cổng hiển thị và nhãn hạng từ store.
- Một hook đưa các giá trị này vào `FlashcardSession` và tóm tắt Luyện tập, để mọi nơi đếm giống nhau.
- Thẻ "Làm quen" và cổng hiển thị chỉ đổi phần giao diện của thẻ.

## Boundaries & Constraints

**Always:**
- Thuật toán SRS (`review`, `markKnown`, `isSrsCard`, các hằng số), shape `SrsCard`, lịch và thứ tự của thẻ đã có đều giữ nguyên. Không xoá hay reset thẻ. Không đổi shape store hay migration, không đổi luật gộp.
- Gọi `buildSession` không có options thì cho kết quả y như trước. Các test cũ chỉ đổi cách gọi sang object, không đổi kỳ vọng.
- Các hàm sau là hàm thuần có test, nhận thời gian qua tham số: `buildSession`, `dueCardCount`, `newPerDayFor`, `preferredNewWordIds(store, themeWordIdsOf)`, `flashcardGates`, `rankLabel`. Danh sách viên có nội dung được truyền vào qua `themeWordIdsOf` để lib không import `@/data/foundation/content`.
- `@/lib/srs` không import `@/lib/foundation` hay `@/lib/sessions`, vì đồng bộ import `@/lib/srs` và cần tránh vòng import. Phần ghép store nằm ở `src/lib/flashcard-session.ts`.
- "Đang ở Sân ga" và "viên đã dạy" chỉ lấy từ `isInFoundation` / `isGateOpen` / `foundationState` (story 18), không viết lại luật.
- Không khoá, không phạt:
  - quota giảm vì tồn ôn chỉ kèm lời nhắn nhẹ;
  - thẻ Làm quen không có nút sai;
  - dòng IPA bị ẩn chỉ là lời mời, không chặn gì.
- Tiếng Việt. Ở 375px không cuộn ngang. Ngoài phần thẻ flashcard và dòng nhắc, giao diện giữ y như trước.

**Never:**
- Không chặn hư từ, không làm thẻ quy tắc `rule:fNN-n`, không `exampleOverrides`, không gắn nhãn ví dụ (story 24).
- Không thêm từ ngoài NGSL/TSL, không sửa `words.json` hay `scripts/vocab`.
- Không đổi IPA ở `OwlPronunciation`, `OwlResult`, `MistakeCard`, `WordReviewCard`, `PronunciationBlocks`, `SoundTable`.
- Không đổi `limitedProgress`, `sessionPlan`, `SESSION_MINUTES`, các bước của buổi, ngày lười (chỉ dùng `FlashcardSession` như cũ) hay thẻ riêng của Sổ tay.
- Không thêm `lg:`/`xl:`, phím tắt hay thanh trên cùng.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ngày 1 ở Sân ga | Store mới, 0 thẻ, chưa xong viên nào | `newPerDayFor` → `{ count: 5, heavyReview: false }`. Hàng đợi có 5 từ mới đều `intro`: day, week, month, year, hour | `foundation` thiếu hoặc sai dạng → mặc định (đang ở Sân ga) → 5 |
| Từ chủ đề viên vừa học | F01 xong hôm qua, F02 xong hôm nay | `preferIds` bắt đầu bằng 5 từ của F02 (name, letter…), rồi 5 từ của F01, rồi danh sách khởi đầu | Viên không có nội dung → không góp từ |
| Hàng qua kiểm tra | Hàng A `passed`, chưa xong viên nào | `preferIds` = chỉ danh sách khởi đầu | N/A |
| Sau Sân ga, T1 | Đã bỏ qua, bài hiện tại `s1-t1-w2` | 8 | N/A |
| T2 trở đi | Bài hiện tại `s1-t2-w1`, chặng 2, hoặc đã xong lộ trình | 10 | N/A |
| Quay lại Sân ga | Bỏ qua rồi bấm "Quay lại Sân ga" | 5 | N/A |
| Tồn ôn | 41 thẻ đến hạn, đang ở Sân ga | `{ count: 3, heavyReview: true }` + dòng "Hôm nay ôn kỹ, mai học từ mới tiếp" | Đúng 40 thẻ → 5, không có dòng nhắc |
| Ôn bớt trong ngày | Từ 41 thẻ ôn còn 40 | Quota trở về 5, dòng nhắc ẩn | N/A |
| Đã đủ quota | Hôm nay đã giới thiệu 5 từ (Sân ga) | 0 từ mới. Hôm sau lại 5 | Giới thiệu 8 từ trên máy khác (sau Sân ga) → 0, không âm |
| `preferIds` bẩn | Có id trùng, id đã có thẻ, id không có trong bộ từ, id chưa có dữ liệu AI | Các id đó bị bỏ qua, phần còn lại lấp theo hạng | Không ném lỗi |
| TSL trước | `firstList: 'tsl'`, còn từ khởi đầu chưa học | Từ khởi đầu trước, rồi TSL hạng 1, 2, … | N/A |
| Thẻ Làm quen | Từ mới chưa có thẻ, `introMode: true` | Item `intro: true`. Bấm "Đã xem" → `learning: false`, `interval: 1`, đến hạn 0h mai. Hôm sau là `review`, có 4 nút | Thoát trước khi bấm → không ghi gì, lần sau vẫn là Làm quen |
| Không phải Làm quen | Thẻ riêng Sổ tay, thẻ `added`, thẻ đang học lại, hoặc `introMode` mặc định | Không có `intro`, vẫn lật thẻ + 4 nút như cũ | N/A |
| Thẻ cũ | Thẻ ôn đến hạn có sẵn | Thứ tự, `due`, `interval`, `ease` sau khi chấm y như trước | N/A |
| Cổng chưa mở | Đang ở Sân ga, chưa qua F03 | Không IPA, có dòng "Phiên âm IPA mở sau viên F03". Không âm tiết, không từ loại | N/A |
| Cổng theo hàng | Hàng A qua Soát vé | IPA và âm tiết hiện, từ loại ẩn | N/A |
| Cổng sau bỏ qua | Đã bỏ qua Sân ga, kể cả sau khi quay lại | IPA, âm tiết, từ loại đều hiện | N/A |
| Nhãn hạng | NGSL #12, TSL #5 | "Từ phổ biến #12", "Từ TOEIC #5" | N/A |
| Ngày lười ở Sân ga | `limit` 3, `preferNew`, store mới | 3 thẻ Làm quen theo `preferIds`; xong sau 3 lần "Đã xem" | N/A |
| Tóm tắt Luyện tập | Ngày 1 ở Sân ga | "0 thẻ đến hạn · 5 từ mới hôm nay" (cùng quota với phiên) | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/srs/srs.ts` -- các phần cần đổi:
  - `buildSession` (dòng 249) đang nhận tham số theo vị trí `(srs, words, now, newPerDay, firstList, custom)`;
  - `fresh` (dòng 288) là chỗ áp `preferIds`;
  - `SessionItem` (dòng 203) thêm `intro?: true`.
  - Dùng lại `isSrsCard`, `readCards`, `compareStudyOrder`. Không sửa `review`/`markKnown`.
- Nơi gọi `buildSession` theo vị trí, phải đổi sang object:
  - `src/lib/flashcard-session.ts:16`;
  - test: `src/lib/srs/srs.test.ts`, `src/lib/notebook.test.ts`, `src/lib/sync/merge.test.ts:236`, `src/data/vocab/vocab.test.ts:76`.
- `src/lib/flashcard-session.ts`:
  - `buildStudySession(srs, words, savedItems, now, firstList)` đang dùng chung cho `FlashcardSession` và `Practice.tsx` (`FlashcardSummary`);
  - nơi đặt `newPerDayFor`, `preferredNewWordIds`, `flashcardGates`, `rankLabel`.
  - Module này không được đồng bộ import, nên import được `@/lib/foundation` và `@/lib/sessions`.
- `@/lib/foundation`:
  - `isInFoundation`, `isGateOpen(store, 'ipa'|'stress'|'pos')` (`FOUNDATION_GATES`: F03/F04/F07);
  - `foundationState(store).doneBrickIds`, `readFoundation(store).bricks[id].lastDoneAt`.
- `@/lib/sessions`: `sessionLesson(store)` → `lesson.monthId` (`'t1'` cho 4 bài đầu, `src/data/roadmap/stage-1.ts:114`).
- `@/data/foundation/content`: `getBrick(id)?.themeWordIds` (F01–F06 có 5 từ mỗi viên). Chỉ phía app import, truyền vào lib qua `themeWordIdsOf`.
- `src/data/vocab/index.ts`: `Word`, `StudyWord`, `hasDetails`, `compareStudyOrder`, `POS_LABELS`. `words.json` không có `two`…`hundred` hay `monday`…`sunday` (đã kiểm), 60 id khởi đầu trong Decisions đều có.
- `src/components/flashcards/FlashcardSession.tsx`:
  - `Flashcard` (dòng 200): nhãn hạng ở dòng 214, IPA / `Syllables` / `POS_LABELS` ở dòng 241–245;
  - `KIND_LABELS`, `GradeButtons`;
  - `FlashcardSession` (dòng 310): dòng đếm ở dòng 361, `advance`.
  - `CustomFlashcard` giữ nguyên.
- `src/app/store-context.ts`: `useSrs` (`grade`, `markKnown`), `useNewWordList`, `useLoadedStore`; nơi thêm hook mới.
- `src/pages/Practice.tsx` (`FlashcardSummary`, dòng 29) dùng cùng options. `Session.tsx`, `LazySession.tsx` và `Flashcards.tsx` không cần sửa vì đã đi qua `FlashcardSession`.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts` (không có test component). `npm test` chạy với `TZ=Asia/Ho_Chi_Minh`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/srs/srs.ts` -- thêm và đổi các phần sau:
  - `BuildSessionOptions`; `buildSession(srs, words, now, options = {})`;
  - áp `preferIds` khi chọn `fresh`;
  - khi `introMode`, gắn `intro: true` cho item từ danh sách chưa có thẻ;
  - `SessionItem.intro?: true`;
  - `dueCardCount(srs, now)`.
  - Giữ `NEW_PER_DAY` làm mặc định.
- [x] `src/lib/srs/srs.test.ts` -- đổi các lời gọi sang object, kỳ vọng giữ nguyên. Thêm các ca:
  - `preferIds` đi trước theo đúng thứ tự;
  - `preferIds` bẩn;
  - TSL trước khi có `preferIds`;
  - `introMode` chỉ gắn cho từ danh sách chưa có thẻ (không gắn cho thẻ riêng, `added` hay đang học lại), và không có `introMode` thì không có `intro`;
  - "Đã xem" = `gradeCard(..., 'good')` → đến hạn 0h mai, hôm sau là `review`;
  - `dueCardCount` bỏ thẻ sai dạng và thẻ chưa tới hạn;
  - quota đã đủ.
- [x] `src/lib/notebook.test.ts`, `src/lib/sync/merge.test.ts`, `src/data/vocab/vocab.test.ts` -- đổi lời gọi `buildSession` sang object, không đổi kỳ vọng.
- [x] `src/data/vocab/starter-words.ts` (export qua `src/data/vocab/index.ts`) -- `STARTER_WORD_IDS: readonly string[]`, 60 id đúng thứ tự trong Decisions, có chú thích ghi 4 nhóm và lý do vắng số/thứ.
- [x] `src/data/vocab/vocab.test.ts` -- thêm ca cho danh sách khởi đầu:
  - mọi id có trong `words.json`, `list: 'ngsl'`, `hasDetails`;
  - không trùng;
  - `pos` thuộc `noun|verb|adjective|adverb`;
  - đúng 60 id.
- [x] `src/lib/flashcard-session.ts` -- thêm các hàm và hằng sau:
  - `NEW_WORDS_FOUNDATION = 5`, `NEW_WORDS_T1 = 8`, `HEAVY_REVIEW_THRESHOLD = 40`, `HEAVY_REVIEW_NEW_WORDS = 3`;
  - `newPerDayFor(store, now)`, `preferredNewWordIds(store, themeWordIdsOf)`, `flashcardGates(store)`, `rankLabel(word)`;
  - `buildStudySession(srs, words, savedItems, now, firstList, plan?: { newPerDay, preferIds })`: luôn bật `introMode`, thiếu `plan` thì dùng `NEW_PER_DAY` và `[]`.
- [x] `src/lib/flashcard-session.test.ts` (mới) -- mỗi dòng I/O Matrix về quota, tồn ôn, `preferIds`, cổng, nhãn hạng và tóm tắt Luyện tập là một ca. Store dựng bằng `completeBrick`, `markRowTested`, `skipFoundation`, `resumeFoundation` và `progress` bài. Ngày dựng bằng `new Date(y, m, d, …)` giờ máy.
- [x] `src/app/store-context.ts` -- thêm hook `useNewWordOptions(now)` trả `{ newPerDay, heavyReview, preferIds, gates }`, memo theo `store` và `now`. `themeWordIdsOf` = `(id) => getBrick(id)?.themeWordIds ?? []`.
- [x] `src/components/flashcards/FlashcardSession.tsx` -- các việc sau:
  - dùng `useNewWordOptions(now)` và truyền `{ newPerDay, preferIds }` cho `buildStudySession`;
  - dòng nhắc `heavyReview`;
  - nhãn `rankLabel`;
  - IPA, `Syllables` và từ loại theo `gates`, kèm dòng link F03 khi IPA còn ẩn;
  - thẻ Làm quen khi `item.intro`: nhãn "Làm quen", mặt sau hiện ngay, nút "Đã xem" gọi `advance` + `grade(id, 'good', at)`, và nút "Đã biết".
- [x] `src/pages/Practice.tsx` -- `FlashcardSummary` dùng `useNewWordOptions(now)` để số từ mới khớp với phiên.
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- dòng "Flashcard SRS" thêm: thẻ Làm quen, `STARTER_WORD_IDS` ở `src/data/vocab/starter-words.ts`, quota tính ở `src/lib/flashcard-session.ts`.

**Acceptance Criteria:**
- Given store mới đang ở Sân ga, when mở "Ôn flashcard", then dòng đếm ghi "Còn 0 thẻ ôn · 5 từ mới hôm nay", thẻ đầu là "day" với nhãn "Làm quen" và "Từ phổ biến #85", không có IPA, âm tiết hay từ loại, và có nút "Đã xem" mà không có Quên/Khó/Nhớ/Dễ.
- Given vừa học xong F02 trong buổi 30', when sang bước "Ôn & từ mới", then các từ mới đầu tiên là từ chủ đề của F02.
- Given hàng A đã qua Soát vé, when lật một thẻ ôn, then thấy IPA và dòng âm tiết có tô âm nhấn, chưa thấy nhãn từ loại.
- Given đã bấm "Đã xem" cho 5 từ hôm nay, when tải lại trang, then không còn từ mới hôm nay, và hôm sau 5 từ đó hiện là "Ôn lại" với 4 nút chấm.
- Given màn hình 375px, when mở thẻ Làm quen và thẻ ôn, then không cuộn ngang và các trang khác hiện y như trước.

## Implementation Notes

- **Files:** `src/lib/srs/srs.ts` (`BuildSessionOptions`, `buildSession(srs, words, now, options = {})`, `SessionItem.intro?: true`, `dueCardCount`); `src/data/vocab/starter-words.ts` (+ re-export trong `index.ts`); `src/lib/flashcard-session.ts` (hằng quota, `newPerDayFor`, `preferredNewWordIds`, `flashcardGates` + kiểu `FlashcardGates`, `rankLabel`, `buildStudySession(..., plan?)` luôn bật `introMode`); `src/app/store-context.ts` (`useNewWordOptions(now)`); `FlashcardSession.tsx`; `Practice.tsx`; `stack.md` dòng "Flashcard SRS". Test: `srs.test.ts`, `notebook.test.ts`, `vocab.test.ts` (đổi lời gọi sang object, kỳ vọng giữ nguyên) + ca mới; `src/lib/flashcard-session.test.ts` mới.
- **Lời gọi cũ:** chỉ các lời gọi có tham số thứ 4+ theo vị trí phải đổi (`srs.test.ts`, `notebook.test.ts`, `vocab.test.ts`, `flashcard-session.ts`). `merge.test.ts:236` chỉ gọi 3 tham số nên giữ nguyên, vẫn hợp lệ với chữ ký mới.
- **`preferIds`:** lọc trên tập từ có dữ liệu AI chưa có key trong `srs.cards` (cùng điều kiện "từ mới" như cũ, nên id có thẻ sai dạng cũng bị bỏ), dùng `Map`/`Set` nên `__proto__` hay id trùng không gây lỗi. `introMode` chỉ gắn cho phần `fresh` (thẻ `added` chưa chấm và thẻ riêng Sổ tay đi nhánh khác nên không bao giờ là Làm quen).
- **`newPerDayFor`:** đếm tồn ôn bằng `dueCardCount(srs, now, counted)` trên đúng tập thẻ phiên hiện là thẻ ôn: bỏ thẻ `added` chưa chấm (hiện như từ mới) và thẻ `saved-…` không có trong `customStudyWords` (mục đã xoá, bỏ khỏi flashcard, mục trùng cụm). Vẫn có thể khác `session.dueCount` một chút vì số đó cộng cả thẻ đang học chưa tới giờ. Hook `useNewWordOptions` chỉ bọc hàm thuần `newWordOptions(store, now, themeWordIdsOf)`, test dùng thẳng hàm này.
- **`preferredNewWordIds`:** `doneBrickIds` (F01 → F18) sort ổn định theo `lastDoneAt` giảm dần. Hook `useNewWordOptions` truyền `themeWordIdsOf = getBrick(id)?.themeWordIds ?? []`, nên `store-context.ts` import `@/data/foundation/content` (các trang Sân ga, Hôm nay, Session đã import sẵn, không thêm chunk mới).
- **UI:** `Flashcard` nhận `gates`; khối `WordForms` hiện IPA / `Syllables` / từ loại theo cổng, IPA ẩn thì dòng link mờ "Phiên âm IPA mở sau viên F03" → `/foundation/F03`. Thẻ Làm quen: `useState(intro)` nên mặt sau hiện ngay, nhãn "Làm quen", nút chính "Đã xem" (icon `Eye`) gọi `onGrade('good')` = `advance` + `grade(id, 'good', at)`, vẫn có nút ghost "Đã biết". Thẻ khác giữ "Lật thẻ" + 4 nút. Dòng `role="status"` "Hôm nay ôn kỹ, mai học từ mới tiếp" màu `text-muted-foreground`. `CustomFlashcard` không đổi.
- **Kiểm chứng:**
  - `npm run lint && npm test && npm run build` pass (58 file, 1164 test). Cảnh báo chunk size của Vite đã có từ trước.
  - Headless Chrome 375px (bản build không có biến Supabase, store dựng sẵn trong localStorage, route `#/practice/flashcards`), cả 4 trường hợp `scrollWidth` = 375 (không cuộn ngang):
    - store mới: "Còn 0 thẻ ôn · 5 từ mới hôm nay", thẻ "Làm quen" · "Từ phổ biến #85" · day, dòng link F03, không âm tiết/từ loại, có "Đã xem" + "Đã biết", không có 4 nút; bấm "Đã xem" → "4 từ mới", thẻ kế là week;
    - hàng A qua: lật thẻ ôn thấy `/ˈfæməli/` và FAM·i·ly, không có từ loại;
    - đã bỏ qua: IPA, âm tiết, "danh từ" đều hiện; quota 8 (bài hiện tại `s1-t1-w1`);
    - 41 thẻ đến hạn ở Sân ga: "Còn 41 thẻ ôn · 3 từ mới hôm nay" + dòng "Hôm nay ôn kỹ, mai học từ mới tiếp".
- **Chưa làm / rủi ro:** không có test component (Vitest env `node`), phần giao diện chỉ kiểm bằng headless như trên. Bước "Ôn & từ mới" của buổi và ngày lười đi qua `FlashcardSession` nên tự có quota / Làm quen, nhưng chưa chạy tay qua trang Session/LazySession.

## Spec Change Log

- **2026-11-08, review lượt 1 (Blind #1, Edge #1–#2, Verification gap "Other findings"):** Intent ghi `dueCardCount` = mọi thẻ hợp lệ có `due ≤ now`. Như vậy thẻ riêng Sổ tay đã xoá mục lưu (thẻ vẫn nằm trong `srs.cards` và đến hạn mãi vì phiên không bao giờ hiện) cùng thẻ `added` chưa chấm (phiên hiện là từ mới) bị tính là tồn ôn. Thẻ mồ côi cộng dồn theo thời gian, quá 40 thì quota kẹt ở 3 vĩnh viễn và dòng "Hôm nay ôn kỹ…" không bao giờ tắt dù "Còn 0 thẻ ôn". Như thế trái "không phạt" và trái `learning-rules.md` ("hơn 40 thẻ đến hạn ôn"). Đã sửa câu trong Decisions: chỉ đếm thẻ phiên hiện là thẻ ôn. Code: `dueCardCount(srs, now, counted?)` bỏ thẻ `added` chưa chấm, `newPerDayFor` lọc thẻ `saved-…` không có trong `customStudyWords`. Trạng thái tránh được: quota 3 vĩnh viễn vì thẻ không ôn được. KEEP: ngưỡng `> 40`, `min(3, base)`, tính lại theo `now` mỗi lần, các ca tồn ôn cũ trong `flashcard-session.test.ts`.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|------------|-------|
| 1 | Blind | Tồn ôn đếm cả thẻ phiên không hiện (thẻ riêng mồ côi khi xoá mục lưu), nên quota có thể kẹt ở 3 và dòng "ôn kỹ" không tắt | medium | `deleteSavedWord` giữ thẻ trong `srs.cards` (`notebook.test.ts` "xoá mục có thẻ riêng"), `customStudyWords` bỏ mục đã xoá nên thẻ không bao giờ được chấm, đến hạn mãi và cộng dồn. Quá 40 thì `newPerDayFor` luôn `heavyReview`. Test mới tái hiện 41 thẻ mồ côi. | patch (sửa Intent, xem Spec Change Log) |
| 2 | Blind | Danh sách khởi đầu trùng từ chủ đề F01/F03/F04/F05/F06 (week, month, hour…), chú thích "vắng tháng" mâu thuẫn | low | Có trùng: `preferredNewWordIds` bỏ trùng nên từ đã học trước sẽ không lặp lại khi xong viên, người học không mất gì. Danh sách 60 id nằm trong Intent đã chốt. Chú thích nói "tháng" là tên tháng (January…) nhưng viết mơ hồ. | patch (chỉ sửa chú thích `starter-words.ts`, danh sách giữ nguyên) |
| 3 | Blind | `learning-rules.md` vẫn ghi danh sách khởi đầu là "số, thứ, …" | low | Dòng 67 nói "số, thứ" trong khi NGSL không có các từ đó và code dùng nhóm "thời gian". Story sau đọc luật này có thể đòi thêm từ ngoài NGSL, trái mục Never. | patch (sửa dòng luật) |
| 4 | Blind | Luật "từ chủ đề của viên gạch/bài" mới làm phần viên, bài T1/T2 chưa góp từ | medium | `preferredNewWordIds` chỉ đọc viên. Dữ liệu bài không có trường từ chủ đề, và Intent chỉ định nghĩa `preferIds` từ viên + danh sách khởi đầu. Cần chọn từ cho từng bài, việc của story khác. | defer |
| 5 | Blind | Spec ghi đã sửa `merge.test.ts`, status `in-progress`, hai log trống | low | Đúng là `merge.test.ts` không đổi, nhưng Implementation Notes đã giải thích (gọi 3 tham số, vẫn hợp lệ). Status và hai log được điền ở chính bước này. Cách sửa duy nhất là sửa spec của build này. | reject |
| 6 | Blind | `IPA_BRICK = 'F03'` chép tay `FOUNDATION_GATES.ipa` | low | Hai nguồn: đổi cổng IPA thì link/dòng chữ trên thẻ trỏ sai viên trong khi cổng đã dời. Sửa trực tiếp, đọc từ `FOUNDATION_GATES.ipa`. | patch |
| 7 | Blind | Tóm tắt Luyện tập không giải thích quota giảm khi tồn ôn | low | Số trên tóm tắt khớp phiên (đúng matrix). Lời nhắn hiện ngay khi mở phiên. Intent chỉ yêu cầu dòng nhắc trong `FlashcardSession` và giữ nguyên giao diện còn lại. | reject |
| 8 | Blind | Vùng `role="status"` gắn cùng nội dung có thể không được đọc | low | Thường dòng này có ngay lúc mở trang, nằm trong luồng đọc bình thường. Chỉ khi tồn ôn bật giữa phiên mới có thể bị bỏ qua, hiếm gặp. Sửa phải đổi bố cục (thẻ rỗng trong flex gap). | reject |
| 9 | Blind | Test "thoát trước khi bấm Đã xem" không kiểm gì | low | Test gọi `session(store)` hai lần trên cùng store, nên không chứng minh gì ngoài việc hàm thuần. Đã sửa: đổi tên cho đúng phạm vi lib và assert store không bị ghi. Phần component nằm ở defer #19. | patch |
| 10 | Blind | Chỉ F02 được kiểm từ chủ đề có dữ liệu AI | low | `foundation.test.ts` chỉ kiểm id có trong `words.json` và là thực từ, không kiểm `hasDetails`. `buildSession` âm thầm bỏ id thiếu dữ liệu. Hiện 4059/4059 từ đủ dữ liệu, thêm một assert là đủ. | patch |
| 11 | Blind | Ngày lười ở Sân ga có thể 0 từ mới khi đã dùng hết quota 5 | low | Đúng khi cùng ngày đã học "Ôn & từ mới". Đây là hệ quả của quota 5 mà Intent chọn. `LazySession` đã có câu "Hôm nay không học được từ mới cũng không sao, vẫn tính buổi lười". | reject |
| 12 | Blind | `useNewWordOptions` memo theo cả `store`; Practice tính `gates` không dùng | low | Đúng là dựng lại `preferIds` mỗi lần ghi store, nhưng `buildSession` trên 4059 từ chỉ mất vài ms và phiên vốn dựng lại theo `srs`/`now`. Không có hại thấy được. | reject |
| 13 | Blind | Link mời F03 quá nhỏ để chạm trên điện thoại | low | `text-xs` không padding nên cao 16px, dưới 24px. Sửa trực tiếp bằng `py-1` (24px). | patch |
| 14 | Edge | Hơn 40 thẻ đến hạn mà phiên không hiện (mồ côi) → quota kẹt ở 3 | medium | Cùng gốc với #1. | patch (gộp #1) |
| 15 | Edge | Thẻ `added` chưa chấm bị đếm là tồn ôn | low | `dueCardCount` cũ đếm cả thẻ `isUnreviewedAdded`, trong khi phiên hiện chúng là từ mới (không vào `dueCount`). Cùng gốc với #1: định nghĩa tồn ôn không khớp tập thẻ ôn của phiên. | patch (gộp #1) |
| 16 | Edge | Gần ngưỡng 40, thẻ Quên quay lại làm quota lật 3 ↔ 5 giữa phiên | low | Có thể xảy ra, nhưng Intent chủ ý "tính lại theo `now` mỗi lần" (matrix "Ôn bớt trong ngày"). Hậu quả chỉ là vài từ mới hiện/ẩn, không mất dữ liệu. | reject |
| 17 | Edge | Dòng "ôn kỹ" hiện cả ở chế độ `limit`/`preferNew` và màn xong | low | Dòng hiện đúng theo Intent ("khi `heavyReview` thì `FlashcardSession` hiện"). Ở ngày lười quota cũng bị kẹp còn 3 nên nội dung vẫn đúng. Sau khi sửa #1, ở phiên không giới hạn hàng đợi rỗng thì không còn thẻ ôn đếm được. | reject |
| 18 | Verification gap | Nối store → kế hoạch phiên chỉ được test qua bản chép trong test | medium | Đã chuyển thân hook thành hàm thuần `newWordOptions(store, now, themeWordIdsOf)`. `useNewWordOptions` chỉ còn `useMemo` bọc nó, và helper `session()` trong test gọi thẳng hàm này (kèm `readSavedWords`). | patch |
| 19 | Verification gap | Giao diện thẻ mới (Làm quen, cổng, dòng nhắc, nhãn hạng) không có test tự động | medium | Repo không có test component (Vitest env `node`, chỉ `*.test.ts`). Hàm thuần đứng sau đã có test. Thêm jsdom + RTL là việc riêng. | defer |
| 20 | Verification gap (Other) | Dòng đếm "Còn 38 thẻ ôn" mà vẫn hiện "ôn kỹ" vì `dueCardCount` đếm thẻ mồ côi | medium | Cùng gốc với #1. Sau khi sửa, hai số chỉ còn lệch phần thẻ đang học chưa tới giờ, vốn có trong `dueCount`. | patch (gộp #1) |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass. Không có test cũ nào đổi kỳ vọng, chỉ đổi cách gọi `buildSession`.
- `npx vitest run src/lib/srs src/lib/flashcard-session.test.ts src/data/vocab` (với `TZ=Asia/Ho_Chi_Minh`) -- expected: các ca mới đều pass.

**Manual checks:**
- Headless 375px kiểm 4 trường hợp, không cuộn ngang:
  - store mới: thẻ Làm quen, "Đã xem", không IPA, có dòng link F03;
  - sau khi hàng A qua: có IPA và âm tiết;
  - đã bỏ qua Sân ga: hiện đủ;
  - store có hơn 40 thẻ đến hạn: dòng "Hôm nay ôn kỹ, mai học từ mới tiếp".
