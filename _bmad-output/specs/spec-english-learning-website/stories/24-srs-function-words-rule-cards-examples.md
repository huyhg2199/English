---
title: 'SRS phần 2: chặn hư từ, thẻ điền quy tắc, ví dụ thay thế (CAP-9, CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '61eb146403a7c393f6bacd5e2d2c9bdae1c198bb'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/23-srs-new-words-intro-gates.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Kiểm tra cả 4 hàng trước (Soát vé):** hàng qua Soát vé hay "Tôi biết rồi" thì mọi viên của hàng tính là đã dạy, nên hư từ gắn với các viên đó được mở (`isBrickTaught`). Bỏ qua Sân ga cũng mở mọi cổng viên và cổng "qua tường". Cổng đã mở thì không đóng, kể cả khi quay lại Sân ga. Thẻ SRS cũ và lịch của chúng giữ nguyên.
- **Nhịp:** 1 viên mỗi buổi. Xong viên thì thẻ quy tắc của viên vào phiên ôn ngay hôm đó, không chiếm quota 5 từ mới.
- **Mốc 750, máy tính:** story này không đụng tới (không `lg:`, phím tắt, thanh trên cùng).
- Claude chọn:
  - **`FUNCTION_WORD_GATES`** (`src/data/vocab/function-words.ts`): 86 hư từ trong NGSL hạng 1–300. Gồm mọi từ có `pos` là `pronoun`, `preposition`, `conjunction`, `determiner`, cộng 11 trợ/khuyết động từ và 9 trạng từ chức năng. Mỗi mục là `{ opensAfter, forms }`. `opensAfter` là `{ brick }`, `{ lesson }` hoặc `'wall'`. Id có dạng `ngsl-<từ>`, riêng "I" là `ngsl-i`.
    - **Viên:**
      - F09: i, you, he, she, it, we, they;
      - F11: the, a;
      - F12: this, that;
      - F13: be;
      - F14: not, what, who, where, how, from, much;
      - F15: there, in, on, under, between;
      - F16: have;
      - F18: at, every, always, never, often.
    - **Bài Chặng 1 đầu tiên dạy nó** (mở khi bài `done`, hoặc bài nằm trước bài bắt đầu của Mũ Phân Loại, tức bị bỏ qua khi xếp lớp):
      - `s1-t1-w3`: do, when;
      - `s1-t3-w1`: will;
      - `s1-t3-w4`: since;
      - `s1-t4-w1`: can, could, would, should, may, might, must (bài dạy khái niệm động từ khuyết thiếu);
      - `s1-t4-w3`: than, more, most, less.
    - **`'wall'`** (mở khi `skippedAt` hoặc `completedAt` khác null): 41 từ còn lại, gồm:
      - giới từ: of, to, for, with, as, by, about, into, over, after, before, through, around, during, without, against, until, within;
      - từ hạn định: all, which, some, no, any, many, such, both, another, each, few, enough;
      - liên từ: and, but, or, if, because, while, though, whether, although;
      - something, why.
    - **`forms`** (để làm chỗ trống):
      - i → i/me/my; you → you/your; he → he/him/his; she → she/her; it → it/its; we → we/us/our; they → they/them/their;
      - a → a/an; this → this/these; that → that/those;
      - be → be/am/is/are/was/were/been/being; have → have/has/had; do → do/does/did;
      - các từ còn lại: chính từ đó.
  - **Khoá ≠ mất** (`src/lib/srs/eligibility.ts`):
    - `buildSession` có thêm option `lockedIds`. Từ bị khoá không vào phần từ mới, kể cả khi nằm trong `preferIds`. App không tạo thẻ cho từ khoá và từ khoá không tính quota.
    - Khi mở khoá, từ quay lại hàng chờ đúng theo hạng NGSL vì vẫn sort bằng `compareStudyOrder`, không có thứ tự riêng.
    - Thẻ đã có của hư từ (dữ liệu cũ) vẫn ôn theo lịch.
    - Cổng chỉ chặn việc giới thiệu từ mới.
    - TSL và NGSL hạng > 300 không bị chặn.
  - **Thẻ điền câu cho hư từ:** mọi thẻ của từ trong `FUNCTION_WORD_GATES` (thẻ mới, thẻ ôn, thẻ cũ) hiện câu ví dụ đã thay chỗ dạng đầu tiên trong `forms` bằng `___`, kèm `exampleVi`. Mặt trước không bao giờ hiện từ đứng một mình.
    - Lật thẻ hiện: câu đủ có từ in đậm, từ + nút nghe, `WordForms` theo cổng IPA, nghĩa và 4 nút chấm.
    - Thẻ Làm quen của hư từ hiện ngay mặt sau, nút "Đã xem".
    - Tách từ: một token là chuỗi chữ cái và dấu `'`, so khớp không phân biệt hoa thường với `forms`. Vì vậy "it's" không khớp "it".
  - **Thẻ quy tắc `rule:fNN-n`:**
    - Id SRS lấy từ id nội dung `fNN-rule-n`: `rule:` + `fNN-n`, vd `f01-rule-2` → `rule:f01-2`.
    - Chỉ viên đã học xong (`firstDoneAt` có) mới góp thẻ. Hàng qua bằng kiểm tra hay bỏ qua Sân ga thì không góp.
    - Thẻ mới vào phiên như thẻ riêng Sổ tay: không tính quota, không phải Làm quen, đứng sau từ mới.
    - Mặt trước có nhãn "Thẻ quy tắc · Fnn" và câu `cloze`. Lật thẻ hiện câu đã điền `answer` in đậm, dòng `vi`, link "Xem lại viên Fnn" tới `/foundation/Fnn` và 4 nút chấm.
    - Thẻ quy tắc không có "Đã biết", không đọc TTS (cloze có thể chứa IPA).
    - Thuật toán và shape `SrsCard` giữ nguyên.
  - **Bản app cũ bỏ qua `rule:`:**
    - Không nâng schema (vẫn v13), không đổi luật gộp. Thẻ `rule:` là key mới trong `srs.cards`, cùng shape `SrsCard`.
    - App cũ: `buildSession` chỉ duyệt từ có trong bộ từ nên bỏ qua thẻ `rule:`; gộp và backup giữ thẻ đó như mọi thẻ.
    - Bản mới:
      - không đếm thẻ `rule:` không còn trong danh sách thẻ quy tắc hiện tại vào tồn ôn (giống thẻ Sổ tay mồ côi ở story 23);
      - không đếm thẻ `rule:` vào số từ đã học (`learnedCardCount`).
  - **`exampleOverrides`:**
    - `src/data/vocab/example-overrides.json` = `{ overrides: { [id]: { exampleEn, exampleVi } }, accepted: { [id]: lý do } }`.
    - `loadWords()` áp `overrides` lên dữ liệu (không sửa `words.json`), nên mọi nơi dùng bộ từ thấy cùng câu.
  - **Tập ví dụ phải rà:**
    - NGSL hạng 1–500, `STARTER_WORD_IDS` và `themeWordIds` của mọi viên có nội dung.
    - Câu ví dụ hiệu lực chỉ được dùng ngữ pháp Sân ga F01–F18 + hiện tại đơn (khẳng định, phủ định, câu hỏi).
    - Máy dò 7 nhãn: `past`, `future`, `continuous`, `perfect`, `modal`, `comparative`, `conditional`.
    - Câu bị gắn nhãn thì phải có override tự viết, hoặc nằm trong `accepted` kèm lý do. Lý do ví dụ: báo nhầm (`tired` là tính từ, `read` hiện tại), hoặc chính hư từ được mở sau bài dạy nó (`will`, `can`).
    - Rà tay: đọc cả 500 câu trong báo cáo, kể cả câu máy không gắn nhãn, và viết override cho câu dùng ngữ pháp chưa học mà máy bỏ sót.
  - **Script gắn nhãn:**
    - `npm run vocab:label-examples` chạy `scripts/vocab/label-examples.mjs`, logic thuần ở `scripts/vocab/example-features.mjs` (+ `.d.mts`, test import như `owl-post`).
    - Tập từ: NGSL hạng 1–500 cộng các id `ngsl-…`/`tsl-…` quét bằng chữ trong `src/data/vocab/starter-words.ts` và `src/data/foundation/bricks/*.ts`.
    - Kết quả ghi `scripts/vocab/example-labels.json`. Mỗi mục là `{ id, rank, exampleEn, features, status: 'clean'|'override'|'accepted'|'todo' }`, theo hạng rồi id, xác định (chạy lại không đổi).
    - Còn `todo` thì exit 1.

**Problem:** Phiên ôn vẫn đưa hư từ (the, of, can, will…) vào như từ thường theo hạng NGSL, trước khi Huy được dạy chúng, và hỏi kiểu "the = ?". Thẻ quy tắc của viên gạch mới chỉ là dữ liệu, chưa vào SRS. Nhiều câu ví dụ AI dùng thì quá khứ, will, can… mà người mất gốc chưa học.

**Approach:**
- Dữ liệu cổng hư từ, kèm một hàm thuần tính tập id bị khoá từ store.
- `buildSession` bỏ từ bị khoá và nhận thêm danh sách thẻ quy tắc.
- Thẻ của hư từ và thẻ quy tắc hiện dạng điền chỗ trống.
- Câu ví dụ thay thế nằm trong một file JSON tự viết, có script gắn nhãn và test giữ cho tập rà luôn sạch.

## Boundaries & Constraints

**Always:**
- Các phần sau giữ nguyên:
  - thuật toán SRS (`review`, `markKnown`, hằng số), shape `SrsCard`, lịch và thứ tự thẻ đã có;
  - schema v13, migration, luật gộp, backup.
- Không xoá hay reset thẻ nào.
- Gọi `buildSession` không có `lockedIds` và `rules` thì kết quả y như trước. Test cũ không đổi kỳ vọng.
- `@/lib/srs` không import `@/lib/foundation`, `@/lib/sessions`, `@/lib/placement`, `@/data/foundation/content`. Phần ghép store nằm ở `src/lib/flashcard-session.ts`, nội dung viên truyền vào qua tham số như `themeWordIdsOf`.
- "Viên đã dạy" và "đang ở Sân ga" chỉ lấy từ `isBrickTaught` / `readFoundation` / `foundationState` (story 18). "Bài đã xong / bị bỏ qua" lấy từ `computeRoadmapProgress(allLessons(), readCompletedLessonIds, readStartLessonId)`. Không viết lại luật.
- Hàm thuần có test, thời gian qua tham số: `lockedWordIds`, `splitCloze`, `lockedNewWordIds(store)`, `ruleStudyWords(store, ruleCardsOf)`, `ruleCardId`, `withExampleOverrides`, `exampleFeatures`.
- Câu override do Claude tự viết. Câu tiếng Anh chứa từ gốc như một token, với hư từ thì chứa một dạng trong `forms`. `exampleVi` là tiếng Việt tự nhiên.
- Tiếng Việt. Ở 375px không cuộn ngang. Ngoài thẻ flashcard, giao diện giữ y như trước.

**Never:**
- Không sửa `words.json`, `scripts/vocab/ai/*`, `build.mjs`. Không thêm từ ngoài NGSL/TSL.
- Không soạn nội dung viên F07–F18 hay thêm `ruleCards` mới (story 25, 26). Chỉ nối thẻ quy tắc đã có của F01–F06.
- Không lọc câu hỏi theo `requires`. Không sửa bài T1 (story 27, 28).
- Không đổi quota 5/8/10/3, `preferIds`, thẻ Làm quen của thực từ, cổng IPA / trọng âm / từ loại (story 23).
- Không chặn TSL hay NGSL hạng > 300. Không chặn thẻ đã có.
- Không thêm `lg:`/`xl:`, phím tắt, thanh trên cùng. Không đổi IPA ở `OwlPronunciation`, `MistakeCard`, `WordReviewCard`, `SoundTable`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ngày 1 ở Sân ga | Store mới | `lockedNewWordIds` có đủ 86 id. Từ mới chỉ là từ khởi đầu, không hư từ | `foundation` thiếu / sai dạng → mặc định → khoá đủ |
| Học xong viên | F11 xong (`completeBrick`) | the, a mở; 84 id còn khoá | N/A |
| Hàng qua kiểm tra | Hàng B qua Soát vé | 7 đại từ + the, a, this, that mở; be, have chưa | N/A |
| Bỏ qua Sân ga | `skipFoundation`, chưa xong bài nào | Mọi cổng viên + `'wall'` mở; do, when, will, since, 7 khuyết thiếu, than/more/most/less còn khoá | N/A |
| Quay lại Sân ga | Bỏ qua rồi `resumeFoundation` | Cổng đã mở vẫn mở | N/A |
| Bài xong / bị bỏ qua | `s1-t1-w3` done; hoặc Mũ xếp bắt đầu `s1-t2-w1` | do, when mở; will vẫn khoá | Bỏ đánh dấu bài → từ chưa giới thiệu lại để dành, thẻ đã có giữ nguyên |
| Giữ thứ tự NGSL | Bỏ qua Sân ga, đã có thẻ cho mọi từ khởi đầu và mọi thực từ NGSL hạng 1–400 | Từ mới kế tiếp là the (1), be (2), and (3), of (4)… theo hạng, bỏ do (21) và các từ còn khoá, trước hạng 401 | N/A |
| `preferIds` bị khoá | `preferIds` chứa id đang khoá | Bỏ qua id đó, phần còn lại không đổi | Không ném lỗi |
| Thẻ cũ của hư từ | Thẻ `ngsl-the` đến hạn, F11 chưa dạy | Vẫn là thẻ ôn, hiện dạng điền câu | N/A |
| Thẻ điền câu | `ngsl-the`, "The meeting starts at nine." | Mặt trước "___ meeting starts at nine." + nghĩa câu; lật thẻ thấy "the" | Câu không có dạng nào trong `forms` → thẻ thường (test chặn trường hợp này) |
| Dạng của từ | `ngsl-be`, "She is a nurse." | "She ___ a nurse.", đáp án "is" | "it's" không khớp "it" |
| Thẻ quy tắc mới | F01 xong hôm nay, quota 5 | Hàng đợi: 5 từ mới (Làm quen) → `rule:f01-1`, `rule:f01-2` (`kind: 'new'`, không `intro`). `introducedToday` không cộng thẻ quy tắc | Hàng A qua bằng kiểm tra, không học → không có thẻ quy tắc |
| Chấm thẻ quy tắc | Bấm Nhớ trên `rule:f01-1` | Thẻ `SrsCard` lịch như từ mới, hôm sau là thẻ ôn | N/A |
| Thẻ quy tắc mồ côi | `srs.cards` có `rule:f99-1` hoặc thẻ của viên đã đổi nội dung | Không hiện, không đếm tồn ôn, vẫn nằm trong store | Không ném lỗi |
| App cũ | `buildSession(srs, words, now)` không `rules`, store có thẻ `rule:` | Hàng đợi, `dueCount`, `introducedToday` như khi không có thẻ đó. Gộp / backup giữ thẻ, `schemaVersion` vẫn 13 | N/A |
| Số từ đã học | 3 thẻ `rule:` + 2 thẻ từ | `learnedCardCount` = 2 | N/A |
| Ngày lười | `limit` 3, `preferNew`, F02 xong hôm nay | 3 từ mới trước, thẻ quy tắc chỉ hiện nếu hết từ mới | N/A |
| Ví dụ override | `ngsl-yesterday` có override | `loadWords()` trả câu override, `words.json` không đổi | Override id không có trong bộ từ → test báo lỗi |
| Tập rà sạch | Câu hạng ≤ 500 / khởi đầu / chủ đề bị gắn nhãn | Phải có override sạch (0 nhãn) hoặc `accepted` có lý do | `accepted` cho câu không bị gắn nhãn, hoặc trùng với override → test báo "thừa" |
| Script nhãn | `npm run vocab:label-examples` | Ghi `example-labels.json`, 0 `todo` → exit 0; chạy lại không đổi file | Còn `todo` → in danh sách, exit 1 |

</frozen-after-approval>

## Code Map

- `src/lib/srs/srs.ts`:
  - `SessionWord` (dòng 51) thêm `RuleStudyWord`, cạnh `isCustomWord`;
  - `compareSessionWords` (238): từ danh sách → thẻ quy tắc → thẻ riêng;
  - `BuildSessionOptions` (247), `buildSession` (272): đếm `introducedToday` ở dòng 293 phải bỏ thẻ quy tắc, `freshCustom` ở 325 là mẫu cho thẻ quy tắc mới;
  - `dueCardCount` (349) giữ nguyên chữ ký.
- `src/lib/srs/index.ts`: re-export file mới.
- `src/lib/flashcard-session.ts` (story 23):
  - `NewWordPlan`, `buildStudySession(…, plan?)`, `newWordOptions(store, now, themeWordIdsOf)`;
  - `reviewableDueCount` (lọc thẻ mồ côi; thêm lọc `rule:`).
  - Module này import được `@/lib/foundation`, `@/lib/sessions`, `@/lib/placement/store`.
- `@/lib/foundation`: `isBrickTaught`, `readFoundation` (`skippedAt`, `completedAt`), `foundationState(store).doneBrickIds`.
- `src/lib/roadmap-progress.ts`: `computeRoadmapProgress` (`completed`, `skipped`), `readCompletedLessonIds`. `src/lib/placement/store.ts:76`: `readStartLessonId`. `src/data/roadmap/lookup.ts`: `allLessons`, `getLesson(id)?.stageId`.
- `src/data/foundation/types.ts`: `RuleCard { id, brickId, cloze, answer, vi }`, `BrickId`. Thẻ hiện có `f01-rule-1` … `f06-rule-n` trong `src/data/foundation/bricks/f0*.ts`. Nội dung đọc qua `getBrick(id)?.ruleCards`.
- `src/data/foundation/foundation.test.ts`: test nội dung viên, nơi thêm luật id thẻ quy tắc.
- `src/app/store-context.ts:311-321`: `themeWordIdsOf`, `useNewWordOptions(now)`. Thêm `ruleCardsOf` cùng chỗ.
- `src/components/flashcards/FlashcardSession.tsx`:
  - `Flashcard` (231): mặt trước dòng ~250, mặt sau ~272, có `ReadableText` và `ListenButton` cho câu ví dụ;
  - `CustomFlashcard` (163) là mẫu cho `RuleFlashcard`;
  - `KIND_LABELS` (35), `FlashcardSession` (345): đang truyền `{ newPerDay, preferIds }` ở dòng 362.
- `src/pages/Practice.tsx:45-49`: `FlashcardSummary` truyền plan giống trên.
- `src/lib/placement/gaps.ts:47`: `learnedCardCount`.
- `src/data/vocab/index.ts`: `loadWords` (100), `hasDetails`, `STARTER_WORD_IDS`. `src/data/vocab/vocab.test.ts`: test `words.json` và danh sách khởi đầu.
- `scripts/owl-post/decide.mjs` + `decide.d.mts` + `src/lib/owl-post.test.ts`: mẫu cho script `.mjs` có khai báo kiểu và test Vitest. `package.json` scripts: `vocab:build` là mẫu.
- Không cần sửa: `src/lib/sync/merge.ts`, `src/lib/backup/backup.ts` (đã gộp và làm sạch thẻ theo key với `isSrsCard`), `src/lib/owl/owl.ts` (tra theo bộ từ), `src/lib/subs/highlight.ts` (regex `ngsl|tsl`), `Session.tsx`, `LazySession.tsx`, `Flashcards.tsx` (đã đi qua `FlashcardSession`).
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`, `npm test` chạy `TZ=Asia/Ho_Chi_Minh`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/vocab/function-words.ts` (export qua `index.ts`) -- `FunctionWordGate = { opensAfter: { brick: BrickId } | { lesson: string } | 'wall'; forms: readonly string[] }` và `FUNCTION_WORD_GATES: Readonly<Record<string, FunctionWordGate>>`, đúng 86 mục như Decisions. Chú thích ghi luật chọn (pos + trợ động từ + trạng từ chức năng, hạng ≤ 300) và lý do khuyết thiếu gắn `s1-t4-w1`.
- [x] `src/data/vocab/function-words.test.ts` (mới) -- kiểm tra các điều sau:
  - mỗi id có trong `words.json`, `list: 'ngsl'`, hạng ≤ 300, `hasDetails`;
  - đủ mọi từ NGSL ≤ 300 có `pos` thuộc `pronoun|preposition|conjunction|determiner`;
  - `brick` là `BrickId` hợp lệ; `lesson` có `getLesson(id)?.stageId` là chặng 1;
  - `forms` khác rỗng, chữ thường, chứa chính từ đó;
  - với câu ví dụ hiệu lực (sau `withExampleOverrides`), `splitCloze` khác null;
  - tổng 86, 30 cổng viên / 15 cổng bài / 41 `'wall'`.
- [x] `src/lib/srs/eligibility.ts` (mới) -- `lockedWordIds<G>(gates, isOpen: (gate: G) => boolean): Set<string>`. Chú thích luật "khoá ≠ mất, mở thì về đúng hạng".
- [x] `src/lib/srs/cloze.ts` (mới) -- `splitCloze(sentence, forms): { before, answer, after } | null`: token đầu tiên khớp một dạng (chữ cái + `'`, không phân biệt hoa thường), giữ nguyên hoa thường của `answer` trong câu.
- [x] `src/lib/srs/srs.ts` -- thêm và đổi các phần sau:
  - `RULE_CARD_PREFIX = 'rule:'`, `RuleStudyWord { id, rule: true, word (= answer), brickId, cloze, answer, vi }`, `isRuleWord`, `isRuleCardId`;
  - `BuildSessionOptions.lockedIds?: ReadonlySet<string>` và `rules?: readonly RuleStudyWord[]`;
  - từ bị khoá không vào `preferred` / `fresh`;
  - thẻ quy tắc lên lịch như thẻ riêng: đã có thẻ thì đi theo `due`, chưa có thì `freshRules` sau `fresh`, trước `addedNew`, không tính quota, không `intro`, cộng vào `newCount`;
  - `introducedToday` bỏ thẻ quy tắc.
- [x] `src/lib/srs/srs.test.ts` -- thêm các ca:
  - khoá (kể cả trong `preferIds`), không tạo thẻ, mở thì đúng hạng;
  - thẻ cũ của từ khoá vẫn ôn;
  - thẻ quy tắc mới / đến hạn / không tính quota / thứ tự trong hàng đợi;
  - "app cũ" (không `rules`, có thẻ `rule:`) cho kết quả y như store không có thẻ đó;
  - `isRuleCardId`.
- [x] `src/lib/srs/eligibility.test.ts` + `cloze.test.ts` (mới) -- mỗi dòng matrix về dạng từ, hoa thường, "it's", không khớp → null.
- [x] `src/lib/flashcard-session.ts` -- các việc sau:
  - `lockedNewWordIds(store)`: viên → `isBrickTaught`; bài → `completed` hoặc `skipped` của `computeRoadmapProgress`; `'wall'` → `skippedAt ?? completedAt` khác null;
  - `ruleCardId(rule)`; `ruleStudyWords(store, ruleCardsOf)`: viên trong `doneBrickIds`, F01 → F18;
  - `functionWordCloze(word)`: `FUNCTION_WORD_GATES` + `splitCloze` trên `exampleEn`;
  - `NewWordPlan` thêm `lockedIds`, `rules` (tuỳ chọn; thiếu thì rỗng);
  - `newWordOptions(store, now, themeWordIdsOf, ruleCardsOf = () => [])` trả thêm hai field;
  - `reviewableDueCount` bỏ thẻ `rule:` không có trong `ruleStudyWords` hiện tại.
- [x] `src/lib/flashcard-session.test.ts` -- mỗi dòng matrix về cổng (Sân ga, viên, hàng qua kiểm tra, bỏ qua, quay lại, bài xong, bài bị bỏ qua khi xếp lớp), thứ tự NGSL sau khi mở, thẻ quy tắc (học xong vs qua kiểm tra), thẻ quy tắc mồ côi và tồn ôn, ngày lười. Store dựng bằng `completeBrick`, `markRowTested`, `skipFoundation`, `resumeFoundation`, `setLessonCompleted` và xếp lớp của Mũ.
- [x] `src/lib/placement/gaps.ts` (+ test sẵn có) -- `learnedCardCount` bỏ id `rule:`.
- [x] `src/lib/sync/merge.test.ts`, `src/lib/backup/backup.test.ts` -- mỗi file một ca: thẻ `rule:f01-1` gộp theo `updatedAt` và qua backup / khôi phục y nguyên, `schemaVersion` 13.
- [x] `src/data/foundation/foundation.test.ts` -- id `ruleCards` khớp `^f\d{2}-rule-\d+$`, tiền tố đúng `brickId`, `ruleCardId` không trùng trên toàn bộ nội dung.
- [x] `scripts/vocab/example-features.mjs` + `.d.mts` (mới) -- `EXAMPLE_FEATURES` (7 nhãn) và `exampleFeatures(sentence): string[]` (regex + danh sách quá khứ bất quy tắc thông dụng, xác định, có thứ tự).
- [x] `scripts/vocab/label-examples.mjs` (mới) + `package.json` script `vocab:label-examples` -- chạy như Decisions, ghi `scripts/vocab/example-labels.json`, in tóm tắt (số clean/override/accepted/todo).
- [x] `src/data/vocab/example-overrides.json` (mới) -- chạy script, rà tay 500+ câu, viết override (khoảng 100) và `accepted` có lý do (khoảng 30), tới khi 0 `todo`. Commit cả `example-labels.json`.
- [x] `src/data/vocab/index.ts` -- `withExampleOverrides(words, overrides)` (thuần, bỏ id lạ). `loadWords()` nạp `words.json` và `example-overrides.json` cùng lúc bằng dynamic import (override không vào chunk chính) rồi áp.
- [x] `src/data/vocab/example-overrides.test.ts` (mới) -- kiểm tra các điều sau:
  - id override / accepted có trong bộ từ và thuộc tập rà;
  - override có `exampleEn` kết thúc bằng `.?!`, chứa từ gốc hoặc dạng trong `forms`, `exampleFeatures` rỗng, `exampleVi` khác rỗng;
  - mọi id trong tập rà có câu hiệu lực 0 nhãn, hoặc nằm trong `accepted`;
  - `accepted` phải đang bị gắn nhãn và không trùng override;
  - `withExampleOverrides` không đổi mảng gốc.
- [x] `src/app/store-context.ts` -- thêm `ruleCardsOf = (id) => getBrick(id)?.ruleCards ?? []`, truyền vào `newWordOptions`.
- [x] `src/components/flashcards/FlashcardSession.tsx` -- các việc sau:
  - truyền đủ plan (`newPerDay`, `preferIds`, `lockedIds`, `rules`);
  - `RuleFlashcard` theo Decisions;
  - trong `Flashcard`, nếu `functionWordCloze(word)` khác null thì mặt trước là câu có `___` + `exampleVi` (không có tiêu đề từ), mặt sau / Làm quen là câu đủ với từ in đậm, sau đó là phần cũ.
  - Thẻ thực từ giữ y như cũ.
- [x] `src/pages/Practice.tsx` -- `FlashcardSummary` truyền đủ plan.
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- cập nhật hai chỗ:
  - dòng "Flashcard SRS": cổng hư từ `FUNCTION_WORD_GATES`, thẻ quy tắc `rule:fNN-n` (không nâng schema);
  - mục "Bộ từ vựng": `example-overrides.json`, `npm run vocab:label-examples`, tập rà và 7 nhãn.
- [x] `learning-rules.md` mục Từ vựng -- dòng "Ví dụ" ghi tập rà và ngữ pháp được dùng (Sân ga + hiện tại đơn); dòng "Thẻ quy tắc" ghi chỉ viên học xong mới góp thẻ, không tính quota.

**Acceptance Criteria:**
- Given store mới đang ở Sân ga, when ôn hết 5 từ mới mỗi ngày trong nhiều ngày, then không có hư từ nào trong 86 id được giới thiệu cho tới khi viên, bài hoặc cổng tường tương ứng mở.
- Given vừa học xong F01 trong buổi 30', when sang bước "Ôn & từ mới", then sau 5 thẻ Làm quen có 2 thẻ "Thẻ quy tắc · F01" dạng điền chỗ trống, chấm bằng Quên/Khó/Nhớ/Dễ, và dòng đếm vẫn tính đúng 5 từ mới cho quota.
- Given đã bỏ qua Sân ga và hết từ khởi đầu, when mở flashcard, then thẻ the hiện "___ meeting starts at nine." mà không có chữ "the" ở mặt trước, lật thẻ mới thấy "the".
- Given một máy chạy bản trước story 24 và đồng bộ store có thẻ `rule:`, when mở flashcard ở máy đó, then phiên ôn chạy bình thường, không hiện thẻ lạ, và thẻ `rule:` vẫn còn khi máy mới kéo về.
- Given màn hình 375px, when mở thẻ quy tắc, thẻ hư từ và thẻ thực từ, then không cuộn ngang và thẻ thực từ hiện y như story 23.

## Implementation Notes

- **Files mới:** `src/data/vocab/function-words.ts` (+ `functionWordGate(id)`, export qua `index.ts`), `src/lib/srs/eligibility.ts`, `src/lib/srs/cloze.ts` (+ `clozeText`), `scripts/vocab/example-features.mjs` + `.d.mts`, `scripts/vocab/label-examples.mjs`, `scripts/vocab/example-labels.json`, `src/data/vocab/example-overrides.json`. Test mới: `function-words.test.ts`, `example-overrides.test.ts`, `src/lib/srs/cloze.test.ts`, `src/lib/srs/eligibility.test.ts`.
- **Files sửa:** `srs.ts` (`RULE_CARD_PREFIX`, `RuleStudyWord`, `isRuleWord`, `isRuleCardId`, `lockedIds`, `rules`, thứ tự từ danh sách → thẻ quy tắc → thẻ riêng), `srs/index.ts`, `flashcard-session.ts` (`lockedNewWordIds`, `ruleCardId`, `ruleStudyWords`, `functionWordCloze`, `NewWordPlan` + `newWordOptions` thêm `lockedIds` / `rules`, `newPerDayFor(store, now, ruleCardsOf = () => [])`, `reviewableDueCount` lọc thẻ `rule:` mồ côi), `placement/gaps.ts`, `vocab/index.ts` (`ExampleOverride(s)`, `withExampleOverrides`, `loadWords` nạp 2 JSON bằng `Promise.all`), `store-context.ts` (`ruleCardsOf`), `FlashcardSession.tsx`, `Practice.tsx`, `package.json`, `stack.md`, `learning-rules.md`. Test sửa (chỉ thêm ca): `srs.test.ts`, `flashcard-session.test.ts`, `placement.test.ts` (nơi đang test `skillGaps`/từ vựng, không có `gaps.test.ts` riêng), `merge.test.ts`, `backup.test.ts`, `foundation.test.ts`.
- **Test cũ giữ kỳ vọng:** helper `session()` trong `flashcard-session.test.ts` giữ nguyên plan `{ newPerDay, preferIds }` (ca "vừa học xong F02" sẽ đổi nếu có thẻ quy tắc). Ca mới dùng helper `fullSession()` với đủ plan từ `newWordOptions(…, ruleCardsOf)`.
- **`buildSession`:** thẻ quy tắc trùng id chỉ lấy một. `freshRules` giữ thứ tự truyền vào (F01 → F18, rồi theo viên), không sort theo id. Không truyền `rules` thì thẻ `rule:` trong store không nằm trong `scheduled` nên hàng đợi / `dueCount` / `introducedToday` / `nextDue` y như store không có thẻ đó (test so sánh `toEqual` ở 3 thời điểm).
- **`splitCloze`:** token là `[\p{L}'’]+` (nhận cả dấu nháy cong, để "it’s" cũng không khớp "it").
- **Giao diện:** thẻ hư từ: mặt trước = nhãn + hạng + câu có `___` + `exampleVi`, không có tiêu đề từ, không nút nghe (nghe sẽ lộ đáp án). Mặt sau / Làm quen = câu đủ (đáp án in đậm `text-primary`) + nút nghe câu, rồi tiêu đề từ + nút nghe, `WordForms`, nghĩa, Câu gốc, Cambridge, nút chấm. Khung câu ví dụ cũ không lặp lại trên thẻ hư từ (nên câu đó không có bôi đen lưu Sổ tay). `RuleFlashcard`: chip "Thẻ mới / Ôn lại / Học lại", "Thẻ quy tắc · Fnn", câu cloze trong `h2`, lật thẻ thấy câu đã điền, dòng `vi`, link "Xem lại viên Fnn" (`brickHref`, chỉ khi `isBrickId`), 4 nút chấm; không "Đã biết", không TTS. Thẻ thực từ không đổi.
- **Máy dò nhãn (`exampleFeatures`):** `past` = quá khứ bất quy tắc + phân từ hai bất quy tắc (để bắt cả bị động) + đuôi `-ed` (trừ `-eed` và vài danh/tính từ); `future` = will/'ll/won't/shall/gonna, be going to + động từ; `continuous` = be (+ trạng từ) + V-ing (trừ danh/tính từ -ing hay gặp); `perfect` = have/has/had/'ve/'d (+ trạng từ) + phân từ; `modal` = động từ khuyết thiếu, `'d`, have/has/had to; `comparative` = than, better/best/worse/worst, more/most/less/least + từ, the/từ sở hữu + `-est`; `conditional` = if/unless. Bỏ khỏi danh sách quá khứ các dạng trùng hiện tại hay danh từ (put, cut, read, bit, ground…).
- **Tập rà (538 câu):** 384 clean · 134 override · 20 accepted · 0 todo. Script lấy từ khởi đầu bằng cách quét chuỗi `'<từ>'` trong `starter-words.ts` (file chứa chữ trần, không chứa `ngsl-…`) rồi ghép `ngsl-`; viên gạch quét chuỗi `'ngsl-…'`/`'tsl-…'`. Test dựng cùng tập từ `STARTER_WORD_IDS` và `BRICK_CONTENT`.
- **Rà tay:** đọc cả 538 câu. Ngoài câu máy gắn nhãn, viết override cho câu máy bỏ sót: `cut` ("The company cut costs this year", quá khứ trùng hiện tại), `model` ("our newest", so sánh nhất không có "the"; đã thêm luật từ sở hữu + `-est`), `further` (câu cũ có "if"). Override chứa đúng từ gốc như một token (nhiều câu đổi sang chủ ngữ số nhiều / I / we để tránh đuôi -s), hư từ chứa một dạng trong `forms`.
- **`accepted` (20):** 13 hư từ mở sau bài dạy nó (will, can, could, would, should, may, might, must, more, most, than, less, since; `less` chuyển sang cổng `s1-t4-w3` sau review, xem Spec Change Log); 4 báo nhầm (`so`, `feel`: tired là tính từ; `turn`, `room`: left là hướng); 3 trường hợp từ chỉ đi với cấu trúc đó: `if` (mở khi qua tường, câu chỉ dùng mệnh lệnh + hiện tại đơn), `least` ("at least" cố định), `ago` (luôn đi với quá khứ). 3 mục cuối nằm ngoài hai loại lý do ví dụ trong Decisions, cần Huy xem.
- **Kiểm chứng:**
  - `npm run lint && npm test && npm run build` pass (62 file, 1224 test). Cảnh báo chunk size của Vite có từ trước. Bản build có chunk riêng `example-overrides-*.js` (không vào chunk chính).
  - `npm run vocab:label-examples` exit 0, 0 `todo`; chạy lại cho file giống hệt (so byte). File còn untracked nên chưa chạy được `git diff --exit-code`.
  - Headless Chrome 375px (bản build không có biến Supabase, store dựng sẵn, `#/practice/flashcards`), cả 3 trường hợp `scrollWidth` = 375:
    - F01 xong hôm nay: bấm "Đã xem" 5 lần → "Còn 0 thẻ ôn · 2 từ mới hôm nay", thẻ "Thẻ mới · Thẻ quy tắc · F01" "Yesterday I ___ to school."; lật → "Yesterday I went to school.", dòng quy tắc, link "Xem lại viên F01" → `#/foundation/F01`, 4 nút;
    - đã bỏ qua Sân ga, mọi từ khởi đầu có thẻ, thẻ `ngsl-a` đến hạn: "I have ___ meeting today." + nghĩa câu, không có chữ "a" đứng riêng; lật → câu đủ "a" in đậm, từ, IPA, âm tiết, từ loại, nghĩa, 4 nút;
    - thẻ thực từ `family`: như story 23 (tiêu đề từ, lật thấy IPA / FAM·i·ly / danh từ / câu ví dụ).
- **Chưa làm / rủi ro:**
  - Không commit (theo lệnh của workflow), nên `example-labels.json` chưa được commit như task ghi.
  - Không có test component; giao diện chỉ kiểm bằng headless như trên. Chưa chạy tay trang Session / LazySession (đi qua `FlashcardSession`).
  - Máy dò là regex thô: "May" (tháng) bị coi là modal (override `course` đổi sang June), và không bắt được bị động có phân từ đuôi -ed trùng tính từ. Phần bỏ sót dựa vào rà tay.
  - Một vài override hơi gượng vì phải chứa đúng từ gốc mà không dùng quá khứ, vd `yesterday`: "The day before today is yesterday."
  - `computeRoadmapProgress` bỏ bài bị bỏ qua đầu tiên khỏi `skipped` khi mọi bài sau nó đã xong, nên cổng bài của bài đó có thể khoá lại trong trường hợp hiếm này (theo đúng luật "không viết lại luật").

## Spec Change Log

- **2026-11-08 · review story 24 (Blind Hunter: `less` lệch cổng so sánh).**
  - Finding: `more`, `most`, `than` mở sau bài so sánh `s1-t4-w3`, còn `less` lại mở khi qua tường. Mọi câu tự nhiên chứa `less` đều là câu so sánh, nên `less` phải nằm trong `accepted` với lý do "luôn là so sánh". Lý do này trái luật trong chính Decisions và `learning-rules.md`: câu ví dụ chỉ dùng ngữ pháp Sân ga + hiện tại đơn, ngoại lệ duy nhất là hư từ được mở sau bài dạy nó.
  - Sửa phần frozen (cách sửa hợp lý duy nhất, khớp quyết định "hư từ chỉ vào khi đã được dạy"): `less` chuyển từ `'wall'` sang `{ lesson: 's1-t4-w3' }` cùng than/more/most. Số cổng đổi thành 30 viên / 15 bài / 41 tường (tổng vẫn 86). Dòng matrix "Bỏ qua Sân ga" thêm `less` vào danh sách còn khoá. Lý do `accepted` của `less` đổi thành "mở sau bài s1-t4-w3 dạy so sánh".
  - Trạng thái xấu tránh được: người học gặp `less` (một từ so sánh) ngay khi qua tường, trước bài so sánh.
  - KEEP: tổng 86 hư từ, mọi cổng khác, `forms`, luật "khoá ≠ mất", câu ví dụ của `less` giữ nguyên.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|------------|-------|
| 1 | blind + edge | `splitCloze` chỉ thay token khớp đầu tiên, nên câu có hai dạng (vd "She is… he is…") vẫn lộ đáp án ở mặt trước | low | Đúng ở `cloze.ts:11-19`. Đã quét 86 câu hiệu lực: hiện không câu nào có quá một token khớp `forms`, nên chưa xảy ra. Nhưng chưa có test nào chặn khi sửa override sau này | patch: thêm test dữ liệu trong `function-words.test.ts`, kiểm câu có chỗ trống không còn token nào khớp `forms` (giữ luật frozen "thay chỗ dạng đầu tiên") |
| 2 | blind | Spec, chú thích và code nói khác nhau về việc thay token nào | low | Code và `cloze.test.ts` chọn token đầu tiên trong câu khớp một dạng bất kỳ. Chú thích `functionWordCloze` viết "dạng đầu tiên trong `forms`", gây hiểu nhầm. Phần Tasks của spec đã ghi đúng "token đầu tiên khớp một dạng". Có test ở #1 thì câu chỉ có một token nên hai cách đọc cho cùng kết quả | patch: sửa chú thích ở `flashcard-session.ts` và `function-words.ts` |
| 3 | blind + vgap | Không có test nào cho `exampleFeatures` / `labelExamples`; bỏ luật continuous/perfect hay làm sai status thì không test nào fail | medium | Phần Always của spec bắt buộc test cho `exampleFeatures`. Grep chỉ thấy 3 assertion gián tiếp trong `example-overrides.test.ts`, không assertion nào bắt được việc máy dò bớt nhãn | patch: thêm `src/lib/example-features.test.ts`, gồm bảng ca dương / âm cho 7 nhãn và mỗi status của `labelExamples` (kể cả sort, bỏ trùng, id lạ) |
| 4 | blind | Máy dò: -er không có "than" bị bỏ sót; `'be'` trong `NOT_VERB_AFTER_GOING_TO`; `'s` sở hữu bị coi là be; luật -er/-est + than (dòng 160) thừa | low | `'be'` là động từ nên đứng trong danh sách "không phải động từ" là sai: "It is going to be cold." mất nhãn `future`, chỉ còn dính `continuous` do may. Dòng 160 không thêm được gì vì `than` đã tự gắn nhãn. -er không có than và `'s` sở hữu là giới hạn đã ghi của bộ lọc regex thô (spec ghi phần bỏ sót dựa vào rà tay). Sửa hai lỗi này cần thêm luật mới, dễ báo nhầm | patch: bỏ `'be'` và xoá dòng thừa, có test. Reject phần -er và `'s` (giới hạn đã biết, sửa thêm độ phức tạp) |
| 5 | blind | `accepted` duyệt cả câu chứ không theo từng nhãn; lý do "thẻ chỉ gặp sau bài đó" sai với thẻ cũ | low | Đúng: test chỉ kiểm câu có ≥ 1 nhãn. Nhưng shape `accepted: { [id]: lý do }` nằm trong phần frozen. Nhãn của câu `accepted` bị đổi sẽ hiện ra ở test so khớp `example-labels.json` (#8). Lý do "thẻ chỉ gặp sau bài đó" không đúng với thẻ cũ có từ trước story 24 | patch: sửa câu lý do thành "chỉ được giới thiệu làm từ mới sau bài đó (thẻ cũ có từ trước vẫn ôn)". Reject việc đổi shape (frozen; nhãn bị đổi đã có #8 bắt) |
| 6 | blind | `less` mở khi qua tường trong khi more/most/than mở sau bài so sánh; `further`; much/many lệch nhau | medium | `less` luôn là so sánh, và lý do `accepted` của nó trái luật ở `learning-rules.md` ("ngoại lệ là hư từ được mở sau bài dạy nó"). Phần frozen tự mâu thuẫn ở đây. `further` không phải hư từ: nó là từ vựng được dạy chính nó, câu override không dùng ngữ pháp chưa học. `much` mở ở F14 vì F14 dạy "how much", còn `many` không được dạy ở viên nào | patch + sửa frozen (Spec Change Log): `less` → `s1-t4-w3`. Reject phần `further` và much/many |
| 7 | blind + edge | Script và test dựng tập rà theo hai cách khác nhau (regex quét nguồn vs `STARTER_WORD_IDS` + `themeWordIds`) | low | Đã so: hiện cả hai cùng ra 538 id giống hệt nhau. Nhưng không có gì giữ chúng khớp nhau khi sửa nội dung viên hoặc danh sách từ khởi đầu | patch: dùng chung cách sửa với #8 (test so báo cáo với `labelExamples` chạy trên tập rà của test, nên hai tập lệch là test fail) |
| 8 | blind | `example-labels.json` chưa nằm trong diff và không có gì kiểm báo cáo còn mới | medium | File còn untracked. Sửa override mà không chạy lại script thì báo cáo cũ đi mà không ai hay | patch: thêm test trong `example-overrides.test.ts` so `example-labels.json` với `labelExamples(...)` chạy lại; file được commit lần này |
| 9 | blind + edge | Dòng đếm "N từ mới hôm nay" cộng cả thẻ quy tắc (5 từ + 2 thẻ → 7) | low | `newCount` gồm `freshRules`, đúng như Tasks của spec ("cộng vào `newCount`") và cách `freshCustom` (thẻ Sổ tay) đã làm từ trước. Quota vẫn đúng 5 (`introducedToday` bỏ thẻ quy tắc, có test). Ngày lười: thẻ quy tắc đứng sau từ mới nên chỉ chiếm suất khi hết từ mới, đúng matrix. Tách riêng số đếm phải thêm field vào `Session` | reject: chỉ lệch nhãn hiển thị, theo đúng spec; sửa phải thêm field mới |
| 10 | edge | Override cho từ chưa có `exampleEn` bị bỏ qua lặng lẽ | low | `withExampleOverrides` cố ý không thêm câu cho từ chưa có dữ liệu, nên override đó vô hiệu mà không ai biết. Hiện chưa có trường hợp nào | patch: một assertion trong test và một kiểm tra trong script |
| 11 | edge | Script exit 0 trong khi test fail (`accepted` thừa, vừa override vừa accepted, id ngoài tập rà) | low | Đúng: `label-examples.mjs` chỉ báo id lạ | patch: script báo đủ các lỗi test kiểm |
| 12 | edge | Câu ví dụ trên thẻ hư từ mất `ReadableText` (chạm để lưu Sổ tay) và nguồn | false | Spec cố ý bỏ (Implementation Notes: "Khung câu ví dụ cũ không lặp lại trên thẻ hư từ (nên câu đó không có bôi đen lưu Sổ tay)"). Thẻ thực từ vẫn còn đủ | reject |
| 13 | edge | Máy chạy app cũ đếm thẻ `rule:` đến hạn vào tồn ôn (> 40) mà không bao giờ hiện, nên kẹt ở quota 3 | false | `reviewableDueCount` chỉ có từ story 23 (commit `61eb146`), mà bản này chưa push hay deploy. Bản đang chạy (`origin/main`) không có luật tồn ôn: `buildSession` chỉ duyệt từ trong bộ từ, nên bỏ qua thẻ `rule:` hoàn toàn | reject |
| 14 | blind | Thẻ quy tắc F01 không có gợi ý ở mặt trước ("Yesterday I ___ to school." nhận nhiều đáp án) | low | Đúng với `f01-rule-1/2`. Các thẻ F02–F06 đã tự đủ gợi ý. Lỗi lộ ra vì story này đưa thẻ vào SRS | patch: thêm gợi ý ngay trong `cloze`: "(go)", "(book)". Không thêm field mới, `cloze` chỉ dùng cho SRS |
| 15 | blind | `<p>` nằm trong `<h2>`; chỗ trống là `span` có `aria-label`; mặt trước thẻ hư từ không có tiêu đề | low | Đúng ở `RuleFlashcard` và `ClozeSentence` | patch: `ClozeSentence` render `h2` (dùng cho cả thẻ quy tắc lẫn thẻ hư từ). `___` để `aria-hidden`, kèm chữ `sr-only` "(chỗ trống)" |
| 16 | blind | Một số override không tự nhiên hoặc không phải tiếng Anh Mỹ; `accepted` bị đưa xuống client | low | "at the weekend" là tiếng Anh Anh, "We often win at football." gượng. `film` là chính từ cần dạy. Phần `accepted` chỉ là 20 dòng trong chunk dynamic riêng, chi phí không đáng kể | patch 2 câu ("on the weekend"; "I play chess with my dad, and I often win."). Reject phần `accepted` lên client. Chất lượng câu còn lại để Huy đọc tay |
| 17 | vgap | `ruleCardsOf = () => []` mặc định, nên quên truyền thì thẻ quy tắc biến mất mà không test nào bắt | low | Đúng: `newWordOptions` là điểm vào production duy nhất, tham số mặc định che lỗi khỏi type checker | patch: bỏ giá trị mặc định ở `newWordOptions` (giữ ở `newPerDayFor` như spec). Test cũ truyền `() => []` tường minh |
| 18 | vgap | Không có test UI: định tuyến `RuleFlashcard`, mặt trước có `___`, plan truyền vào phiên | medium | Repo chưa có cài đặt test component (Vitest env node, chỉ `.test.ts`). Phần thuần đã có test | defer |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass. Test cũ không đổi kỳ vọng.
- `npm run vocab:label-examples` -- expected: exit 0, 0 `todo`. Chạy lại thì `git diff --exit-code scripts/vocab/example-labels.json` sạch.
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/lib/srs src/lib/flashcard-session.test.ts src/data/vocab src/data/foundation` -- expected: các ca mới đều pass.

**Manual checks:**
- Headless 375px, route `#/practice/flashcards`, store dựng sẵn, `scrollWidth` = 375. Kiểm 3 trường hợp:
  - F01 xong hôm nay: sau thẻ Làm quen là thẻ quy tắc F01, có link "Xem lại viên F01";
  - đã bỏ qua Sân ga và mọi từ khởi đầu đã có thẻ: thẻ hư từ là câu có `___`;
  - thẻ thực từ (vd family) hiện như cũ.
