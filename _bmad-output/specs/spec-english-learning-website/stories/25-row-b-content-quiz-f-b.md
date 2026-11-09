---
title: 'Nội dung hàng B (F07–F12) và rà quiz-f-b (CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '3a1a4cf13bad22b743efc98ee146bed04b283e98'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/20-row-a-content-placement-quizzes.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/24-srs-function-words-rule-cards-examples.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Kiểm tra cả 4 hàng trước (Soát vé):** đã làm ở story 20. Story này chỉ rà lại 10 câu hàng B (`quiz-f-b`), là bộ câu dùng chung cho Soát vé, "Tôi biết rồi" và kiểm tra cuối hàng. Hàng B qua kiểm tra thì F07–F12 tính là đã dạy, nên cổng nhãn từ loại và cổng hư từ của hàng B mở theo luật story 18/24 (không đổi). Câu sai ở Soát vé và "Tôi biết rồi" vẫn không vào Sổ lỗi. Không khoá viên nào. Tiến độ bài và thẻ SRS cũ giữ nguyên.
- **Nhịp 1 viên/buổi + "Học tiếp viên sau":** đã có ở story 21. Buổi 30', ngày lười và Hôm nay tự chạy F07… vì đọc `hasBrickContent`. Story này chỉ thêm nội dung.
- **Mốc 750, máy tính:** không đụng. Không thêm `lg:`, không phím tắt.
- Claude chọn:
  - **Ngữ pháp được dùng trong câu tiếng Anh của F07–F12** (ví dụ, câu luyện, câu nói, thẻ quy tắc, câu quiz hàng B):
    - được dùng: chủ ngữ + động từ thường ở hiện tại (I/you/we/they + V), câu mệnh lệnh, Let's, Please, và went/ate của F01;
    - he/she/it + V-s chỉ xuất hiện trong câu mẫu cho sẵn; không câu luyện nào hỏi về đuôi -s của động từ;
    - không dùng to be (am/is/are/was/were, kể cả dạng rút gọn it's/that's/he's/she's), have/has/had, do/does/did, don't/doesn't, can/will/would/should. Lý do: các phần này do F13–F16 dạy hoặc thuộc Năm 1.
    - Vì vậy lỗi "I am student" (F11) dạy qua "I need a pen" / "I need pen". Lỗi "She is beauty" (F07) dạy qua "a beautiful girl" / "a beauty girl". Lỗi "Is hot" (F08) dạy qua "I like it" / "Like it", và "It rains" / "Rains".
  - **Từ chủ đề** (đều là thực từ có dữ liệu AI trong `words.json`, không trùng F01–F06 hay danh sách khởi đầu):

    | Viên | Từ chủ đề |
    |---|---|
    | F07 | beautiful, information, really, quickly, work |
    | F08 | like, want, need, help, open |
    | F09 | friend, love, call, tell, give |
    | F10 | man, woman, people, person, box |
    | F11 | water, advice, egg, idea, orange |
    | F12 | picture, house, dog, cat, shoe |

  - **Màn Áp dụng của mỗi viên:**
    - F07: xếp 6–8 từ vào 4 nhóm danh / động / tính / trạng từ, nói "I really like it.";
    - F08: sắp từ thành câu S-V-O, nói một câu mệnh lệnh ("Open the door, please.") và "Let's go.";
    - F09: nói 3 câu về người thân bằng my / me / her / him ("My mother loves me.", "I call her every day.");
    - F10: đếm đồ trên bàn ("two pens, three books, four boxes"), nghe đuôi /s z ɪz/;
    - F11: kể bữa sáng có a/an và danh từ không đếm được ("I eat an egg and drink water.");
    - F12: chỉ đồ quanh mình và nói của ai ("I like this pen.", "Give me those shoes.", "I use Huy's phone.").
  - **Thẻ quy tắc:** mỗi viên 1–2 thẻ. `cloze` có gợi ý trong ngoặc để chỉ một đáp án đúng, như bài học từ story 24 (vd "I love ___. (cô ấy)" → her; "two ___ (child)" → children; "I eat ___ egg. (một)" → an; "I use ___ phone. (của Huy)" → Huy's).
  - **Cổng hư từ:** giữ đúng `FUNCTION_WORD_GATES` của story 24. F09 mở 7 đại từ (i, you, he, she, it, we, they), F11 mở the, a; F12 mở this, that. Viên phải thật sự dạy mọi dạng trong `forms` của các cổng đó (F09 dạy đủ bảng 7 dòng I-me-my… có ghi chú mine/yours; F11 dạy a/an/the; F12 dạy this/these/that/those). Có test chặn.
  - **Rà `quiz-f-b`:**
    - Giữ đủ 10 id `q-f07-01` … `q-f12-01`, vì Sổ lỗi tham chiếu theo id. Câu cần sửa thì viết lại tại chỗ, không xoá id.
    - Viết lại `q-f11-02` ("I am a student.") và `q-f12-01` ("These books are on the table.") vì dùng to be.
    - Mọi câu hàng B theo luật ngữ pháp ở trên, `explanation` dùng cùng cách nói với viên gạch, `tag` khớp nội dung.
    - Giữ phân bố F07 2, F08 2, F09 1, F10 2, F11 2, F12 1, đúng 1 câu nghe.
  - **Câu ví dụ của từ chủ đề:** tập rà của story 24 tự gồm 30 từ mới. Câu nào bị gắn nhãn (hiện có `egg`: past, `picture`: modal) thì viết override. Claude đọc tay cả 30 câu. Chạy lại `npm run vocab:label-examples` và commit `example-labels.json`.

**Problem:** Bức tường mới có nội dung hàng A. F07–F12 còn "Đang soạn", nên người học xong hàng A không có viên tiếp theo. Cổng nhãn từ loại và cổng 11 hư từ (đại từ, a/the, this/that) chỉ mở được bằng kiểm tra hàng hoặc bỏ qua Sân ga. Hai câu `quiz-f-b` dùng to be, là thứ hàng B chưa dạy, nên kiểm tra cuối hàng B hỏi ngoài bài.

**Approach:**
- Soạn 6 file `bricks/f07.ts` … `f12.ts` theo khuôn F01–F06 và đăng ký trong `content.ts`.
- Rà 10 câu hàng B trong `src/data/questions/foundation.ts`.
- Thêm test dữ liệu: luật ngữ pháp hàng B, cổng hư từ khớp nội dung, loại câu bắt buộc.
- Bổ sung override câu ví dụ cho từ chủ đề mới.

## Boundaries & Constraints

**Always:**
- **Nội dung F07–F12:** theo khuôn F01–F06. Mỗi viên có:
  - đủ 6 màn theo thứ tự, giải thích 40–80 chữ;
  - check 2–5 câu cộng đúng 2 câu `easier`, ít nhất 1 câu `listen`;
  - 1–2 `ruleCards`, đúng 5 từ chủ đề như bảng.
- **Loại câu bắt buộc:**
  - F07 có ít nhất 1 câu `sort`;
  - F08 có ít nhất 1 câu `order`;
  - F10 có ít nhất 1 câu `listen` về đuôi /ɪz/ (vd boxes, buses).
- **Soạn nội dung:**
  - Tự soạn, viết bằng tiếng Việt. Không chép tài liệu có bản quyền.
  - `uses` chỉ gồm khái niệm do viên này hoặc viên trước dạy (test sẵn có).
  - Câu tiếng Anh theo luật ngữ pháp trong Decisions.
  - Ví dụ có ký hiệu (`·`, `/ɪz/`, `→`) thì dùng `audioText` / `sampleAudioText` để máy đọc từ thật (vd "I · me · my" đọc "I, me, my"; "box → boxes" đọc "box, boxes").
- **Không đổi kiểu dữ liệu:** dùng đúng các kiểu `Screen` / `CheckItem` / `RuleCard` hiện có. Bảng đại từ của F09 là `contrast.examples` (mỗi dòng một cặp `vi` / `en`).
- **Nhất quán với thẻ từ:** F07 gọi tên từ loại đúng như `POS_LABELS` (danh từ, động từ, tính từ, trạng từ, đại từ, giới từ, từ hạn định), vì sau F07 thẻ từ hiện các nhãn này.
- **Câu quiz hàng B:** giữ luật story 20: 4 lựa chọn khác nhau, đáp án trùng đúng một lựa chọn, `tag` thuộc `MISTAKE_TAGS`, `sectionId` `grammar`, `lessonId` `f07`…`f12`. Mỗi hàng 10 câu, ≤ 2 câu nghe. `pickQuiz` vẫn ra 8 câu với mọi seed, cả có và không TTS.
- **Test cũ:** kỳ vọng nào giả định "F07 chưa có nội dung" thì chỉ đổi sang F13. Không nới test khác.
- Giao diện 375px không đổi. Không có file component nào phải sửa.

**Never:**
- **Việc của story khác:**
  - F13–F18, `quiz-f-c`/`quiz-f-d`, thuật ngữ / TermChip, màn "Qua bức tường", huy chương, điểm Nhà (story 26);
  - `requires` và lọc câu chưa dạy, vá T1 (story 27);
  - chia bài T1, lời mời ôn viên (story 28);
  - `lg:`, phím tắt, thanh trên cùng (story 29–31).
- **Không được làm:**
  - Không đổi `FUNCTION_WORD_GATES`, `FOUNDATION_GATES`, luật SRS, quota, `sessionPlan`, `row-test`, store, migration, luật gộp.
  - Không thêm kiểu màn hay field mới vào `Screen`, `CheckItem`, `RuleCard`, `Question`.
  - Không xoá hay đổi id câu quiz. Không thêm câu Sân ga vào `QUESTION_BANK` / `QUIZZES`.
  - Không sửa `words.json`, `scripts/vocab/ai/*`, `starter-words.ts`. Không thêm từ ngoài NGSL/TSL.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bức tường mới | Store mới, mở `/foundation` | F01–F12 mở được, F13–F18 "Đang soạn" | N/A |
| Viên tiếp theo | F01–F06 đã xong | `nextBrickId(store, hasBrickContent)` = F07. Buổi 30' chạy F07 | N/A |
| Hàng A qua Soát vé rồi bỏ qua | `rows.A` đạt, `skipPlacement` | Viên tiếp theo F07 (trước đây null, về bức tường) | N/A |
| Học xong F07 | `completeBrick('F07')` | `flashcardGates` có `pos: true`. `preferIds` bắt đầu bằng 5 từ chủ đề F07. Hôm đó có thẻ `rule:f07-n` | N/A |
| Học xong F09 / F11 / F12 | `completeBrick` từng viên | Lần lượt mở 7 đại từ / the, a / this, that khỏi `lockedNewWordIds` | Hư từ đã mở chỉ hiện thẻ điền câu |
| Hàng B qua kiểm tra, chưa học | `rows.B` đạt | 11 hư từ hàng B mở, `pos` mở. Không có thẻ quy tắc, không có từ chủ đề hàng B | N/A |
| Chạy một viên | Mở `/foundation/F09`, đi hết 6 màn | Bảng 7 dòng I-me-my…, câu luyện sai thì giải thích và cho làm lại, không màu đỏ. Xong thì viên sáng trên tường | Đúng lần đầu < 60% → 2 câu `easier` |
| Thẻ quy tắc mới | F11 vừa xong | Thẻ "Thẻ quy tắc · F11" có gợi ý trong ngoặc, lật thẻ thấy đáp án, link "Xem lại viên F11" mở viên có nội dung | N/A |
| Kiểm tra cuối hàng B | F07–F12 đã xong, sai `q-f11-02` | Câu vào Sổ lỗi. "Xem lại: Viên gạch F11 · a/an/the + đếm được" mở F11 có nội dung | N/A |
| Sổ lỗi cũ | Store có mục Sổ lỗi `q-f11-02` từ trước | `getQuestion` trả câu đã viết lại, không crash | N/A |
| Ngữ pháp hàng B | Mọi câu tiếng Anh F07–F12 và 10 câu hàng B | Không token nào thuộc danh sách cấm (am, is, are, was, were, it's, that's, he's, she's, have, has, had, do, does, did, don't, doesn't, can, will, would, should) | Có token cấm → test chỉ ra id và câu |
| Cổng hư từ khớp nội dung | `FUNCTION_WORD_GATES` có `{ brick }` là viên đã có nội dung | Mọi dạng trong `forms` xuất hiện như một token trong chữ tiếng Anh của viên đó | Thiếu dạng → test chỉ ra từ và viên. Viên chưa soạn (F13+) → bỏ qua |
| Từ chủ đề | 30 từ mới vào tập rà | Mọi câu ví dụ hiệu lực 0 nhãn hoặc nằm trong `accepted`. `example-labels.json` khớp khi chạy lại | Còn `todo` → script exit 1 |
| Không TTS | `canSpeak()` false | Viên vẫn học được như F01–F06. Quiz hàng B vẫn đủ 8 câu, không có câu nghe | N/A |

</frozen-after-approval>

## Code Map

**Nội dung viên gạch**
- `src/data/foundation/bricks/f01.ts` … `f06.ts`: khuôn nội dung. Mỗi file export `FNN_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'>`, chú thích đầu file ghi khái niệm dạy. `f06.ts` là mẫu dùng `audioText`.
- `src/data/foundation/types.ts`: `Screen`, `CheckItem` (`choice` / `listen` / `tapSyllable` / `order` / `sort`), `RuleCard`, `CONCEPT_IDS`. F07–F12 dạy: `parts-of-speech`, `word-suffixes` / `subject-verb`, `adjective-before-noun`, `imperatives` / `subject-pronouns`, `object-pronouns`, `possessive-adjectives` / `plurals`, `plural-s-sounds`, `irregular-plurals` / `articles`, `countable-uncountable` / `demonstratives`, `possessive-s`. Không sửa file này.
- `src/data/foundation/catalog.ts`: meta F07–F12 (tên, phút, `goalVi`, `teaches`, `uses`). Không sửa.
- `src/data/foundation/content.ts`: `BRICK_CONTENT`, thêm F07–F12 qua `withMeta`.
- `src/data/foundation/foundation.test.ts`: test dữ liệu chạy cho mọi viên có nội dung (6 màn, 40–80 chữ, `uses`, 5 từ chủ đề là thực từ, id không trùng, ít nhất 1 `listen`…). Dòng `hasBrickContent('F07')` false đổi thành F13.
- `src/data/vocab/index.ts`: `POS_LABELS`, `FUNCTION_WORD_GATES`, `loadWords`, `hasDetails`.
- `src/data/vocab/function-words.ts`: cổng hư từ và `forms` (F09 / F11 / F12). Không sửa.

**Câu quiz**
- `src/data/questions/foundation.ts`: `ROW_B` (dòng ~133–245), 10 câu. `FOUNDATION_QUIZZES`, `minPerLesson` giữ nguyên.
- `src/data/questions/foundation.test.ts`: luật ngân hàng (id, 4 lựa chọn, ≤ 2 câu nghe, `pickQuiz` 20 seed). Thêm ca ngữ pháp hàng B.

**Ví dụ thẻ từ (story 24)**
- `src/data/vocab/example-overrides.json`: thêm override cho `ngsl-egg`, `ngsl-picture` và mọi câu khác bị gắn nhãn, hoặc dùng ngữ pháp chưa học mà máy bỏ sót.
- `scripts/vocab/label-examples.mjs` (`npm run vocab:label-examples`): quét `'ngsl-…'` trong `bricks/*.ts`, ghi `scripts/vocab/example-labels.json`.
- `src/data/vocab/example-overrides.test.ts`: tập rà dựng từ `BRICK_CONTENT`, nên tự gồm từ mới. So khớp `example-labels.json`.

**Logic đọc nội dung (không sửa, chỉ hưởng)**
- `src/lib/foundation/player.ts` (`nextBrickId`, `wallRows`), `src/lib/sessions/plan.ts`, `src/app/today-view.ts`: đọc `hasBrickContent`.
- `src/lib/flashcard-session.ts`: `preferredNewWordIds`, `lockedNewWordIds`, `ruleStudyWords`, `flashcardGates`.
- `src/components/quiz/source-label.ts`: nhãn "Viên gạch Fxx · …" lấy từ danh mục.
- `src/lib/foundation/row-test.test.ts:166-167`: đang khẳng định "F07 chưa có nội dung → null", phải đổi thành F07.
- `src/lib/flashcard-session.test.ts`: test dùng `getBrick` thật. Thêm ca cho hàng B ở đây.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`, `npm test` chạy `TZ=Asia/Ho_Chi_Minh`. Không có test component.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/bricks/f07.ts` … `f12.ts` (mới), `src/data/foundation/content.ts` -- soạn 6 viên theo Decisions và Boundaries, rồi đăng ký vào `BRICK_CONTENT`. Nội dung từng viên:
  - F07: 4 từ loại chính + nhóm "từ nhỏ" (đại từ, giới từ, mạo từ), đuôi -tion / -ful / -ly, tránh "I very like", "a beauty girl";
  - F08: S, V, O; câu phải có chủ ngữ ("I like it", "It rains"); tính từ trước danh từ (a red car); ngoại lệ mệnh lệnh / Let's / Please;
  - F09: bảng 7 dòng chủ ngữ / tân ngữ / tính từ sở hữu, ghi chú mine/yours, một chữ I/you thay cho anh/em/chị, tránh "I love she", "me name";
  - F10: -s / -es / -ies, đọc /s z ɪz/, man/men, woman/women, child/children, person/people, tránh "two book";
  - F11: a/an theo âm đầu (an hour, a university), the khi cả hai biết vật nào, số nhiều chung chung không mạo từ, water / money / information / advice không -s, không a;
  - F12: this/that/these/those (gần/xa, ít/nhiều), "Huy's phone" ngược với "điện thoại của Huy", tránh "this books", "phone of Huy".
  - Id câu `fNN-cN` / `fNN-eN` / `fNN-aN`, câu nói `fNN-say-n`, thẻ `fNN-rule-n`.
- [x] `src/data/foundation/foundation.test.ts` -- đổi `hasBrickContent('F07')` false thành F13. Thêm các ca sau:
  - F01–F12 có nội dung;
  - F07 có `sort`, F08 có `order`, F10 có `listen` với `audioText` chứa từ đuôi /ɪz/ (danh sách tay: boxes, buses, classes, watches, dishes, oranges, pages);
  - **ngữ pháp hàng B:** gom mọi chuỗi tiếng Anh của F07–F12 (`contrast.examples[].en`, `worked.en`, `faded.en` đã điền `answer`, `prompt` / `options` / `tokens` / `audioText` của câu luyện có chữ Latin, `sampleEn`, `speak[].text`, `cloze` đã điền). Tách token `[A-Za-z']+`, so không phân biệt hoa thường với danh sách cấm ở Matrix; báo lỗi kèm id. Câu tiếng Việt thì bỏ qua: lọc chuỗi có dấu tiếng Việt, hoặc chỉ lấy field tiếng Anh.
  - **cổng hư từ khớp nội dung:** với mỗi mục `FUNCTION_WORD_GATES` có `opensAfter.brick` là viên có nội dung, mọi dạng trong `forms` xuất hiện như một token (không phân biệt hoa thường) trong chữ tiếng Anh của viên đó.
  - Ca "từ chủ đề không trùng" sẵn có tự phủ 6 viên mới. Thêm ca: từ chủ đề không nằm trong `STARTER_WORD_IDS`.
- [x] `src/data/questions/foundation.ts` -- rà `ROW_B` theo Decisions:
  - viết lại `q-f11-02` (vd "Câu nào đúng?" → "I need a pen." / "I need pen." / "I need an pen." / "I need a pens.");
  - viết lại `q-f12-01` (vd "I like ___ shoes." → these / this / that / it);
  - đọc lại 8 câu còn lại: `explanation` khớp lời viên dạy, `tag` hợp lý (vd `q-f08-02` Let's + động từ nguyên dạng).
  - Chú thích đầu file thêm một dòng: câu hàng B chỉ dùng kiến thức F01–F12 (kiểm tra cuối hàng chạy sau khi học hết hàng).
- [x] `src/data/questions/foundation.test.ts` -- thêm các ca:
  - 10 id hàng B giữ nguyên (`q-f07-01`, `q-f07-02`, `q-f08-01`, `q-f08-02`, `q-f09-01`, `q-f10-01`, `q-f10-02`, `q-f11-01`, `q-f11-02`, `q-f12-01`);
  - `prompt` / `options` / `answer` / `audioText` hàng B không có token cấm (dùng chung danh sách với test viên: export từ một helper test nhỏ, hoặc khai báo lặp ở hai file kèm chú thích).
- [x] `src/lib/foundation/row-test.test.ts` -- dòng 166–167: hàng A xong rồi bỏ qua Soát vé → `nextBrickId(store, hasBrickContent)` = `'F07'`; sửa chú thích. Không đổi ca khác.
- [x] `src/lib/flashcard-session.test.ts` -- thêm ca theo Matrix, dùng `getBrick` thật:
  - xong F07 → `flashcardGates(...).pos` true, `preferredNewWordIds` bắt đầu bằng 5 từ F07;
  - xong lần lượt F09, F11, F12 → `lockedNewWordIds` bớt đúng 7 / 2 / 2 id;
  - `ruleStudyWords` sau khi xong F07–F12 có thẻ `rule:f07-…` … `rule:f12-…` theo thứ tự viên.
- [x] `src/data/vocab/example-overrides.json`, `scripts/vocab/example-labels.json` -- chạy `npm run vocab:label-examples`. Viết override tự soạn cho mọi `todo` (có `egg`, `picture`). Đọc tay 30 câu của từ chủ đề mới và viết override cho câu dùng ngữ pháp chưa học mà máy bỏ sót. Chạy lại tới khi 0 `todo` và file không đổi giữa hai lần chạy.

**Acceptance Criteria:**
- Given đã học xong F01–F06, when bấm buổi 30' ở Hôm nay, then phần lý thuyết là F07. Học hết F07 → F12 thì mỗi viên sáng trên tường, không thấy màu đỏ, và thẻ từ bắt đầu hiện nhãn từ loại sau F07.
- Given đã học xong F09, when mở flashcard những ngày sau, then đại từ (vd you, it) được giới thiệu dưới dạng thẻ điền câu, không có thẻ "you = ?".
- Given đã học hết F07–F12, when làm "Kiểm tra cuối hàng" hàng B, then không câu nào cần to be, have hay khuyết thiếu, và câu sai có link "Xem lại" mở đúng viên đã có nội dung.
- Given màn hình 375px, when mở `/foundation` và `/foundation/F07` … `/foundation/F12` (cả bảng đại từ F09), then không có cuộn ngang và các trang cũ không đổi.

## Implementation Notes

- **Files mới:** `src/data/foundation/bricks/f07.ts` … `f12.ts`. **Files sửa:** `content.ts` (đăng ký F07–F12), `src/data/questions/foundation.ts` (rà `ROW_B`, thêm dòng chú thích), `src/data/vocab/example-overrides.json` (+3 override), `scripts/vocab/example-labels.json` (chạy lại). Test: `src/data/foundation/foundation.test.ts`, `src/data/questions/foundation.test.ts`, `src/lib/foundation/row-test.test.ts` (chỉ dòng 166–167), `src/lib/flashcard-session.test.ts`. Không sửa component, kiểu dữ liệu, `FUNCTION_WORD_GATES`, `words.json`, `starter-words.ts`.
- **Nội dung F07–F12:** mỗi viên 6 màn, giải thích 40–80 chữ, check 5 câu + 2 `easier`, 2 thẻ quy tắc, 5 từ chủ đề đúng bảng. Loại câu: F07 2 câu `sort` (theo đuôi -ful/-ly/-tion ở màn check; 8 từ vào 4 nhóm `danh từ / động từ / tính từ / trạng từ` ở màn Áp dụng, nhãn đúng `POS_LABELS`) + `listen` information; F08 2 câu `order` (We want a red car; They want a big house) + `listen` "I like red cars."; F09 `listen` "They call us every day."; F10 `listen` boxes (đuôi /ɪz/), `sort` theo /s/ /z/ /ɪz/, Áp dụng `listen` "four boxes"; F11 `listen` "I eat an egg."; F12 `listen` "Give me those shoes." + `order` "I like Mai's cat". Áp dụng theo Decisions (nói "I really like it."; "Open the door, please." / "Let's go."; "My mother loves me." / "I call her every day."; đếm "two pens, three books, four boxes"; "I eat an egg and drink water."; "I like this pen." / "Give me those shoes." / "I use Huy's phone."). Bảng đại từ F09 là 7 dòng `contrast.examples` ("I · me · my" …), ghi chú mine/yours ở `enRequires`. Ví dụ có `·`/`→` đều có `audioText` (vd "I · me · my" đọc "I, me, my", "box → boxes" đọc "box, boxes").
- **Thẻ quy tắc:** cloze có gợi ý trong ngoặc để chỉ một đáp án: `I ___ like it. (rất)` → really; `a ___ girl (beauty)` → beautiful; `___ like it. (Tôi)` → I; `___ the door, please. (mở)` → Open; `I love ___. (cô ấy)` → her; `I love ___ mother. (của tôi)` → my; `two ___ (child)` → children; `four ___ (box)` → boxes; `I eat ___ egg. (một)` → an; `I drink ___ every day. (nước)` → water; `I like ___ books. (này)` → these; `I use ___ phone. (của Huy)` → Huy's.
- **Test dữ liệu viên (`foundation.test.ts`):** F01–F12 có nội dung, F13 chưa; F07 `sort`, F08 `order`, F10 `listen` có từ trong danh sách /ɪz/; từ chủ đề từ F07 không nằm trong `STARTER_WORD_IDS` (F06 có week/month/hour trùng danh sách khởi đầu từ story 23, nên ca chỉ xét từ F07); **ngữ pháp hàng B** gom chuỗi tiếng Anh (`contrast.examples[].en` + `audioText`, `worked.en`, `faded.en` đã điền, `sampleEn`/`sampleAudioText`, `speak[].text`, cloze đã điền, `prompt`/`options`/`audioText`/`tokens`/mục `sort` của câu luyện khi không có dấu tiếng Việt), tách token `[A-Za-z']+` (dấu nháy cong đổi thành thẳng), báo lỗi kèm viên, chỗ, câu; có ca tự kiểm helper; **cổng hư từ khớp nội dung** quét mọi cổng `{ brick }` có nội dung (hiện 25 dạng: F09 18, F11 3, F12 4; viên chưa soạn bỏ qua; số dạng kiểm `>= 25` để story 26 thêm F13+ không phải sửa). Danh sách token cấm khai báo lặp ở hai file test, có chú thích trỏ nhau.
- **`ROW_B`:** giữ 10 id và phân bố F07 2, F08 2, F09 1, F10 2, F11 2, F12 1, 1 câu nghe. `q-f11-02` → "I need a pen." / "I need pen." / "I need an pen." / "I need a pens."; `q-f12-01` → "I like ___ shoes." (these / this / that / it). `explanation` của 8 câu còn lại viết lại theo lời viên (vd "Sau Let's là động từ dạng gốc", "she → her"). Tag `q-f08-02` đổi `thì` → `từ loại` (câu hỏi dạng của động từ sau Let's, không phải thì); các tag khác giữ. Test mới: 10 id hàng B đúng thứ tự và `getQuestion` tra được; không token cấm trong đề/lựa chọn/đáp án/`audioText`; `getQuestion('q-f11-02')` trả câu đã viết lại.
- **`flashcard-session.test.ts`** (block "hàng B có nội dung", `getBrick` thật): F01–F06 xong → `nextBrickId` = F07 và `sessionPlan` theory F07; xong F07 → `pos` true, `preferredNewWordIds` và hàng đợi bắt đầu bằng 5 từ F07, có `rule:f07-1/2`; F09 → F11 → F12: khoá 86 → 79 → 77 → 75; xong F09 + mọi từ trước đó có thẻ → hư từ mới (gồm you, it) đều có `functionWordCloze`; `ruleStudyWords` sau F07–F12 (học theo thứ tự ngược) vẫn ra `rule:f07-…` … `rule:f12-…`; hàng B qua kiểm tra → mở 11 hư từ + `pos`, không thẻ quy tắc, không từ chủ đề hàng B.
- **Câu ví dụ (30 từ chủ đề):** script gom thêm 10 id (548 câu: 391 clean · 137 override · 20 accepted · 0 todo); chạy lại cho file giống hệt (so byte). Override tự viết: `egg` "I eat an egg for breakfast." (past), `picture` "I like this picture of the sea." (modal), và `beautiful` "We live in a beautiful city." (câu cũ "What a beautiful day!" dùng câu cảm thán What a…, không viên nào dạy; máy không bắt). Đọc tay 27 câu còn lại: hiện tại đơn / to be / have / mệnh lệnh, giữ nguyên (5 từ đã có override từ story 24: information, help, friend, call, water).
- **Kiểm chứng:**
  - `npm run lint && npm test && npm run build` pass (63 file, 1354 test; `check-precache` OK; cảnh báo chunk size có từ trước).
  - Lệnh vitest theo Verification: 366 test pass. `grep -rn "destructive" src/components/foundation src/pages/Foundation*.tsx`: không kết quả.
  - `npm run vocab:label-examples` exit 0, 0 `todo`, chạy lại không đổi file. `git diff --exit-code` chưa sạch được vì không commit (theo lệnh workflow).
  - Headless Chrome 375px (bản build không biến Supabase, store mới đã xem Thư nhập học): `/foundation` có 6 ô "Đang soạn" (F13–F18), `scrollWidth` 375; F07 … F12 chạy hết 6 màn bằng cách chọn đáp án đầu / xếp sai rồi "Xem đáp án" (đi qua `choice`, `listen`, `sort` F07/F10, `order` F08/F12), không phần tử nào có lớp `destructive`, màn 6 hiện "Xong viên Fxx", store ghi `firstDoneAt`, `scrollWidth` 375 ở mọi màn; bảng 7 dòng F09 hiện đủ; bấm nghe ví dụ có ký hiệu thì TTS nhận "inform, information" (F07), "I, me, my" (F09), "box, boxes"/"book, books" (F10). Sau đó bức tường "6/18 viên gạch".
- **Sau review (triage):** nội dung đã sửa theo Review Triage Log, nên vài câu ghi ở trên đã đổi: `q-f08-01` “I like big houses.”, `q-f09-01` “Please help ___.” (us), `q-f10-01` “I teach ten ___.”, `q-f11-02` “I buy a bag.”, `q-f12-01` “I want ___ cakes.”; F08 dùng “It rains every day.”; F07 Áp dụng xếp drink thay work; f11-c2 luyện “I like dogs.”; thẻ `f11-rule-2` có gợi ý “(nước: water, a water hay waters?)”. Test ngữ pháp hàng B quét thêm câu tiếng Anh trích trong lời tiếng Việt và cấm cả be/could/must/may/might/shall + dạng rút gọn; thêm ca nhãn từ loại F07 và ca nguồn câu F11.
- **Chưa làm / rủi ro:**
  - Không commit (theo lệnh workflow), nên `example-labels.json` và 6 file viên mới chưa vào git.
  - Câu luyện chỉ kiểm bằng script tự động (chọn đáp án đầu, xếp nhóm sai rồi xem đáp án); chưa có người đọc lại chất lượng tiếng Việt và độ tự nhiên của câu. Đề không hiện câu sai bằng màu đỏ, nhưng giọng TTS thật (iOS/Android) chưa nghe.
  - Câu mẫu có he/she + V-s (`My mother loves me.`) chỉ nằm ở câu cho sẵn, đúng Decisions; test không chặn được việc câu luyện sau này hỏi về đuôi -s (luật này kiểm bằng tay).
  - Tag `q-f08-02` đổi `thì` → `từ loại`: lần sai cũ trong Sổ lỗi (nếu có) vẫn hiện câu bình thường, chỉ nhãn thống kê đổi.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | Blind | Từ chủ đề friend/tell/give (F09), idea (F11), house (F12) không xuất hiện trong viên | low | Đúng: grep 3 file viên không có các từ này ngoài `themeWordIds`. | patch: f09-c2 “I call ___ friend…”, f09-a1 “I give him my book.”, f09-say-3 “I tell him everything.”; F11 thêm ví dụ “an idea” + thẻ f11-rule-1; F12 ví dụ “that house / those houses” |
| 2 | Blind | “very chỉ đi với tính từ” sai (very quickly, I like it very much) | medium | Đúng: f07.ts enRequires, f07-c2, f07-rule-1; F07 tự dạy quickly là trạng từ. | patch: “very đứng trước tính từ (very beautiful), không đứng trước động từ”, thêm “I like it very much” |
| 3 | Blind | “It rains.” dịch “Mưa.” sai ngữ cảnh (đang mưa) | medium | Đúng: f08.ts explain, contrast, f08-rule-1. Hiện tại đơn chỉ thói quen. | patch: đổi thành “It rains every day.” / “Ngày nào cũng mưa.” (vẫn không to be, -ing; cùng gốc với #22) |
| 4 | Blind | Luật /ɪz/ theo chữ viết, bỏ sót -ge/-ce/-se (oranges, houses) | medium | Đúng: f10 explain, f10-c2 hint, f10-rule-2; `IZ_PLURALS` của test có oranges, pages. | patch: tách luật viết -es (s, x, ch, sh) và luật đọc /ɪz/ (âm xì: s, x, ch, sh, ge…; thêm oranges, houses) (cùng gốc #25) |
| 5 | Blind | Test ngữ pháp bỏ cả chuỗi lẫn tiếng Việt, không quét câu trích trong lời giải thích | medium | Đúng: `englishTexts` lọc `!VIETNAMESE.test(text)` cho cả chuỗi; enRequires/noteVi/hintVi/explanationVi không được quét. | patch: helper `englishParts` lấy câu trong ngoặc kép không dấu + phần ngoài ngoặc đơn; quét mọi field tiếng Việt; điền đáp án vào ___; ca tự kiểm “Trong “I am quick.”…”. Thử đột biến: test đỏ đúng chỗ |
| 6 | Blind | Danh sách token cấm thiếu be/been/being, dạng rút gọn, could/must/may/might/shall | medium | Đúng: hai Set chỉ có 21 token; “I'm hungry.” lọt. | patch: thêm token + regex rút gọn n't/'m/'re/'ve/'ll/'d (Let's, 's sở hữu không bị bắt). Giữ khai báo lặp hai file theo spec, chú thích trỏ nhau |
| 7 | Blind | Quiz hàng B lặp gần nguyên văn câu trong viên (kiểm trí nhớ, không kiểm chuyển giao) | low | Đúng: q-f12-01 = faded F12, q-f11-02 = faded F11, q-f09-01 = f09-rule-1, q-f10-01 = f10-rule-1, q-f08-01 = f08-c3. | patch: viết lại tại chỗ, giữ id/tag/phân bố: “I like big houses.”, “Please help ___.” (us), “I teach ten ___.” (children), “I buy a bag.”, “I want ___ cakes.” (these) |
| 8 | Blind | F11 không luyện the / không mạo từ số nhiều chung chung | low | Đúng: chỉ f11-c5 có the; không câu nào luyện “I like dogs”. | patch: f11-c2 thành “I like dogs.” vs “I like the dogs.” vs “I like a dogs.”. Hai câu quiz F11 giữ lỗi a/an chính theo Decisions |
| 9 | Blind | F09 thiếu cảnh báo its/it's, mine/yours không có ví dụ, you số nhiều | low | Đúng: contrast F09 chỉ có ghi chú chung. | patch: enRequires thêm “its viết liền, không dấu nháy”, “you cho cả bạn/các bạn”, “my pen → mine”; dòng bảng “bạn, các bạn” |
| 10 | Blind | F12 “không nói phone of Huy” mâu thuẫn override picture “picture of the sea”; 's chỉ nêu /z/ | low | Đúng: override ngsl-picture; worked noteVi chỉ /z/. | patch: enRequires F12 thêm “'s cho người, con vật; đồ vật, nội dung vẫn dùng of: a picture of the sea”; noteVi Huy's /z/, Pat's /s/, Alex's /ɪz/ (cùng gốc #37) |
| 11 | Blind | Câu ví dụ từ chủ đề dùng to be/have/-s/while chưa dạy (orange, cat…) | false | Câu ví dụ thẻ từ theo luật story 24 (chỉ chặn quá khứ/khuyết thiếu/hoàn thành…): override `ngsl-friend` “She is my friend from school.” do chính story 24 viết, `ngsl-be` “She is a nurse.” là clean. Luật cấm to be/have của Decisions chỉ áp cho câu của viên và quiz hàng B. Script 0 todo. | reject |
| 12 | Blind | Màn Áp dụng F09 xui người học thay chủ ngữ ngôi 3 → “My father love me” | low | Đúng: promptVi “thay bằng người nhà (my father…)” trên mẫu “My mother loves me.”. | patch: thay vào chỗ sau động từ / sau my: “I call my father every day, I love my sister” |
| 13 | Blind | Dòng Matrix “Kiểm tra cuối hàng B … mở F11” không có test | low | Đúng: `source-label.test.ts` chỉ có f03, f18. | patch: thêm ca f11 (nhãn “Viên gạch F11 · a/an/the + đếm được”, href /foundation/F11) và nhãn F07 |
| 14 | Edge | Đề lẫn tiếng Việt (“I love ___. (anh ấy)”) không được quét | medium | Trùng #5. | patch (cùng #5) |
| 15 | Edge | Thiếu I'm/can't/be/could/must… trong danh sách cấm | medium | Trùng #6. | patch (cùng #6) |
| 16 | Edge | Test quiz tách token cả đề tiếng Việt → chữ “do”, “can” tiếng Việt gây báo sai | low | Đúng về khả năng (chưa xảy ra): test quiz tách token mọi chuỗi không lọc tiếng Việt. | patch: test quiz dùng cùng `englishParts`, có ca tự kiểm “do đó” |
| 17 | Edge | Dấu nháy U+2018/U+02BC tách “it‘s” thành it + s | low | Đúng: `tokensOf` chỉ đổi ’. | patch: đổi ’ ‘ ʼ ` thành ' (ca tự kiểm “it‘s”) |
| 18 | Edge | Override chủ đề giữ câu to be/have (friend, man, idea, orange, house…) | false | Như #11: luật câu ví dụ thẻ từ là của story 24, không phải luật hàng B. | reject |
| 19 | VGap | Câu tiếng Anh trích trong đề tiếng Việt (f07-c5) không được quét | medium | Trùng #5 (đã kiểm bằng đột biến “Trong “I am quick.”…” → test đỏ). | patch (cùng #5) |
| 20 | VGap | Nhãn xếp nhóm F07 không được đối chiếu `POS_LABELS` / pos trong words.json | medium | Đúng: không test nào dùng `POS_LABELS`. | patch: ca mới — mọi nhóm `sort` F07 có nhãn (bỏ phần ngoặc) thuộc `POS_LABELS` và mỗi từ có pos khớp nhãn; đột biến water→động từ làm test đỏ |
| 21 | VGap | Chú thích test today-view/plan nói F07+ “Đang soạn (như hiện tại)” đã cũ | low | today-view.test.ts:32 cũ thật; plan.test.ts:31 chỉ ghi “Nội dung giả”, vẫn đúng. | patch: sửa chú thích today-view (nội dung giả tiêm vào) |
| 22 | Content | “It rains.” cho “Mưa.” (nên là thói quen) | medium | Trùng #3. | patch (cùng #3) |
| 23 | Content | “very chỉ đi với tính từ” sai | medium | Trùng #2. | patch (cùng #2) |
| 24 | Content | “âm vô thanh / hữu thanh” chưa dạy ở F01–F06 | low | Đúng: F05 chỉ dùng “xì nhẹ / ngân nhẹ”. | patch: F10 dùng “/s/ xì nhẹ sau k, t, p, f”, “/z/ ngân nhẹ sau nguyên âm, n, g, d” |
| 25 | Content | /ɪz/ gắn với chữ s, x, ch, sh | medium | Trùng #4. | patch (cùng #4) |
| 26 | Content | Lựa chọn sai “I need two penes.” là từ thật, tục | medium | Đúng: f10-c5. | patch: đổi thành “I need a two pens.”, giải thích “đã có two thì không thêm a” |
| 27 | Content | Ký hiệu /j/, /aʊ/, /ʃən/ chưa dạy ở F03 | low | Đúng: F03 chỉ dạy 10 ký hiệu. | patch: thêm gợi ý đọc “iu”, “ao”, “shần” cạnh ký hiệu |
| 28 | Content | “orange … âm /ɔ/” lệch IPA /ɔː/ | low | Đúng ở f11-c2 cũ. | patch: câu f11-c2 được thay (#8), gợi ý /ɔ/ không còn |
| 29 | Content | IPA university kiểu Oxford lệch kiểu thẻ từ | low | Đúng: words.json /ˌjuːnəˈvɝːsət̬i/. | patch: dùng đúng IPA words.json |
| 30 | Content | “Danh từ đếm được số ít cần a hoặc an” bỏ sót the/my | low | Đúng: explain F11, giải thích q-f11-02. | patch: “cần a hoặc an (hoặc the, my)”; giải thích q-f11-02 nêu a/an, the, my |
| 31 | Content | f08-rule-1 “luôn có chủ ngữ” mâu thuẫn thẻ mệnh lệnh | low | Đúng. | patch: “Câu thường (trừ câu mệnh lệnh) luôn có chủ ngữ” |
| 32 | Content | “-ly là trạng từ” tuyệt đối (friendly, lovely) | low | Đúng: explain F07. | patch: “-ly thường là trạng từ” (giữ 80 chữ) |
| 33 | Content | “My mother loves me.” có -s không giải thích | low | Đúng (Decisions cho phép ở câu mẫu). | patch: noteVi thêm “loves có -s vì chủ ngữ là người khác như he, she; học sau” |
| 34 | Content | f09-say-3 tiếng Việt gượng, dùng with | low | Đúng. | patch: “I tell him everything.” / “Tôi kể cho anh ấy mọi chuyện.” |
| 35 | Content | F08 dùng cars, the door trước F10/F11 | low | Có thật nhưng Decisions chỉ định chính “Open the door, please.” cho F08; không ảnh hưởng đáp án. | reject |
| 36 | Content | “work” trong nhóm động từ của f07-a1 cũng là danh từ | low | Đúng: người học xếp work vào danh từ bị chấm sai. | patch: thay work bằng drink (words.json: verb) |
| 37 | Content | Override picture “picture of the sea” đi ngay sau F12 “không nói phone of Huy” | low | Trùng gốc #10. | patch (cùng #10, giữ override, viên giải thích of cho đồ vật) |
| 38 | Content | f11-rule-2 chỉ kiểm dịch “nước”, không kiểm luật | low | Đúng. | patch: gợi ý “(nước: water, a water hay waters?)” |
| 39 | Content | Tag `từ loại` gộp mạo từ / chỉ định / Let's, lệch thống kê Sổ lỗi | low | Đúng là giới hạn của `MISTAKE_TAGS`; sửa cần thêm tag mới, hơn một sửa trực tiếp, ít gặp. | reject |
| 40 | Content | f12 apply nói “3 mẫu” nhưng sampleEn có 2 câu | low | Đúng. | patch: sampleEn thêm “Give me those shoes.” |
| 41 | Content | [Info] Đáp án quiz, động từ cấm, bản quyền, IPA khác, 27 câu ví dụ: không lỗi | false | Reviewer tự xác nhận không có vấn đề. | reject (không cần làm) |

Kết quả: 36 dòng patch (gộp theo gốc còn 29 lỗi), 5 reject (#11, #18, #35, #39, #41), 0 defer. Không có intent_gap / bad_spec. Sau patch: `npm run lint`, `npm test` (63 file, 1356 test), `npm run build` pass; `npm run vocab:label-examples` 0 todo, file không đổi; grep `destructive` không kết quả.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass (gồm `check-precache`).
- `npm run vocab:label-examples` -- expected: exit 0, 0 `todo`. Chạy lại thì `git diff --exit-code scripts/vocab/example-labels.json` sạch.
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/data/foundation src/data/questions src/data/vocab src/lib/foundation src/lib/flashcard-session.test.ts` -- expected: pass. Có ca cho mỗi dòng Matrix có logic hoặc dữ liệu.
- `grep -rn "destructive" src/components/foundation src/pages/Foundation*.tsx` -- expected: không có kết quả.

**Manual checks:**
- Headless Chrome 375px:
  - bức tường: F01–F12 mở, F13–F18 "Đang soạn";
  - chạy hết 6 màn F07 … F12: chọn sai một câu thì thấy giải thích và làm lại; câu `sort` (F07), `order` (F08), `listen` (F10) chạy được; nghe ví dụ có ký hiệu thì máy đọc `audioText`;
  - `scrollWidth` = 375 ở `/foundation` và `/foundation/F07` … `F12`.
