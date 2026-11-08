---
title: 'Nội dung hàng C–D (F13–F18), rà quiz-f-c/d, thuật ngữ và qua bức tường (CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '684876a6f87c8d7da83b9a1711df7a81e6ed9a5d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/hp-theme.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/25-row-b-content-quiz-f-b.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Kiểm tra cả 4 hàng trước (Soát vé):** đã làm ở story 20. Story này chỉ rà 20 câu hàng C–D (`quiz-f-c`, `quiz-f-d`), là bộ câu dùng chung cho Soát vé, "Tôi biết rồi" và kiểm tra cuối hàng. Soát vé đạt cả 4 hàng thì qua bức tường ngay (`completedAt` đã có từ story 18). Câu sai ở Soát vé và "Tôi biết rồi" vẫn không vào Sổ lỗi. Không khoá viên nào. Tiến độ bài, thẻ SRS, điểm Nhà và huy chương cũ giữ nguyên.
- **Mốc 750:** lịch 12 tháng đếm từ ngày qua (hoặc bỏ qua) Sân ga (story 22, không đổi). Màn "Qua bức tường" chỉ nói "lịch 12 tháng bắt đầu", không bao giờ hiện "lùi".
- **Nhịp 1 viên/buổi + "Học tiếp viên sau":** đã có ở story 21. Buổi 30', ngày lười và Hôm nay tự chạy F13… vì đọc `hasBrickContent`. Story này chỉ thêm nội dung.
- **Máy tính:** không đụng. Không thêm `lg:`, không phím tắt.
- Claude chọn:
  - **Ngữ pháp được dùng trong câu tiếng Anh của F13–F18 và 20 câu hàng C–D** (cộng dồn, mỗi viên dùng được những gì viên trước và chính nó dạy):
    - nền: mọi thứ của F01–F12 (S + V hiện tại, mệnh lệnh, Let's, Please, went/ate của F01, đại từ, số nhiều, a/an/the, this/that, 's);
    - F13: am / is / are khẳng định (cả I'm, you're, he's, she's, it's, we're, they're) + danh từ / tính từ / nơi chốn (here, home, in + tên thành phố). was / were / been / being chỉ được nhắc một lần như "họ hàng của be, học ở Năm 1", để nhận ra;
    - F14: not, isn't, aren't, I'm not, câu hỏi đảo be, trả lời ngắn, what / where / who / how / how old / how much, from;
    - F15: there is / there are / there's, in / on / under / next to / between (nơi chốn);
    - F16: have / has khẳng định. had chỉ được nhắc một lần là quá khứ của have, để nhận ra;
    - F17: nhận ra go / goes / going / went / gone (going đi với am/is/are, gone đi với have/has). Câu luyện chỉ hỏi "dạng nào thuộc vùng thời gian nào", không bắt tự chia;
    - F18: at / on / in + giờ, thứ, tháng; always / usually / often / sometimes / never; every.
    - Không ở đâu dùng: do / does / did và dạng phủ định của chúng, can / could / will / would / shall / should / may / might / must, dạng rút gọn 've / 'll / 'd. n't chỉ có isn't, aren't.
    - Lỗi cần tránh viết bằng ngữ pháp được phép. Vd F15 dạy "đừng dịch chữ 'có' thành have/has" bằng lời tiếng Việt, câu sai trong câu luyện là "Is a book on the table." chứ không dùng câu có has.
  - **Từ chủ đề** (thực từ có dữ liệu AI trong `words.json`, không trùng viên trước hay `STARTER_WORD_IDS`):

    | Viên | Từ chủ đề |
    |---|---|
    | F13 | happy, busy, young, old, city |
    | F14 | country, age, home, ready, late |
    | F15 | room, bed, kitchen, bank, street |
    | F16 | big, small, new, team, game |
    | F17 | come, sleep, live, start, finish |
    | F18 | usually, sometimes, early, wake, coffee |

    Từ nào không qua test dữ liệu sẵn có thì thay bằng thực từ khác cùng chủ đề và ghi vào Implementation Notes.
  - **Màn Áp dụng:**
    - F13: giới thiệu bản thân bằng 3 câu ("I'm Huy. I'm a student. I'm happy.");
    - F14: hỏi và đáp tên, quê, tuổi ("Where are you from? — I'm from Vietnam.", "How old are you? — I'm 25.");
    - F15: tả căn phòng bằng 2–3 câu ("There is a bed in my room. There are two books on the table.");
    - F16: nói mình và người thân có gì, cộng tuổi đúng cách ("I have a sister. She has a cat. I am 25.");
    - F17: xếp 5 dạng của go vào 3 vùng thời gian (Quá khứ · Bây giờ · Thói quen), nói "I went home." / "I'm going home.";
    - F18: kể lịch một ngày bằng 3 câu ("I get up at six. I usually start work at eight. I never drink coffee at night.").
  - **Thẻ quy tắc:** mỗi viên 1–2 thẻ `cloze`, có gợi ý trong ngoặc để chỉ một đáp án đúng (vd "There ___ two beds. (có)" → are; "He ___ a big car. (có)" → has; "Yesterday I ___ home. (go)" → went).
  - **Rà `quiz-f-c` / `quiz-f-d`:**
    - giữ đủ 20 id `q-f13-01` … `q-f18-05` (Sổ lỗi tham chiếu theo id); câu cần sửa thì viết lại tại chỗ;
    - giữ phân bố C: F13 3, F14 2, F15 3, F16 2 và D: F17 5, F18 5, mỗi hàng đúng 2 câu nghe;
    - viết lại `q-f14-02` (bỏ "at home" vì at là F18, bỏ lựa chọn "don't"), `q-f16-01` (lựa chọn "having" thành "haves"), `q-f17-04` (bỏ Does/Do; vd "I ___ to school." → go / goes / going / gone);
    - câu quiz không lặp nguyên văn câu trong viên (bài học story 25, review #7);
    - đọc lại 17 câu còn lại: `explanation` dùng cùng lời với viên, `tag` khớp nội dung.
  - **Bảng thuật ngữ** (`GLOSSARY`, 30–34 mục). Mỗi mục có `id`, nhãn, các mẫu khớp, viên dạy nó, và một câu định nghĩa tiếng Việt tự soạn (≤ 25 chữ). Mục dự kiến:
    - F03: IPA / phiên âm; âm dài;
    - F04: nguyên âm; phụ âm; âm tiết; trọng âm (cả ký hiệu ˈ); schwa / âm yếu; cụm phụ âm;
    - F05: âm cuối. F06: số thứ tự;
    - F07: từ loại; danh từ; động từ; tính từ; trạng từ; giới từ;
    - F08: chủ ngữ (cả ký hiệu S viết hoa); tân ngữ; câu mệnh lệnh;
    - F09: đại từ; tính từ sở hữu. F10: số nhiều / số ít. F11: mạo từ; đếm được / không đếm được. F12: từ chỉ định;
    - F13: to be. F14: phủ định; từ để hỏi; trả lời ngắn. F16: ngôi thứ ba số ít;
    - F17: động từ nguyên mẫu / dạng gốc; quá khứ. F18: trạng từ tần suất.
    - Không có mục "thì", vì chữ "thì" tiếng Việt còn là liên từ.
    - Viên đích phải nhắc tới ít nhất một mẫu khớp của mục. Mục nào viên F01–F12 không nhắc tới thì đổi mẫu khớp, không sửa nội dung viên cũ.
  - **TermChip:** chữ thuật ngữ trong lời tiếng Việt của `TenseCard` (`use`, nhãn và chữ của `formulas`, `rules`, `mistakes[].why`) và `SoundTable` (`intro`, `group.note`, `sound.tip`) thành chip bấm được. Bấm thì mở Sheet tóm tắt: tên thuật ngữ, câu định nghĩa, "Viên gạch Fxx · tên viên", đoạn giải thích (`explain`) của viên, nút "Mở viên Fxx". Chip không khoá theo tiến độ.
  - **Luật khớp thuật ngữ (`splitGlossaryText`):**
    - lấy mẫu dài nhất trước;
    - ký tự ngay trước và sau mẫu không phải chữ, số hay dấu nháy;
    - mẫu chữ tiếng Việt khớp không phân biệt hoa thường; ký hiệu (S, ˈ) khớp đúng ký tự;
    - không khớp bên trong đoạn `/…/` (IPA);
    - mỗi chuỗi chỉ chip lần xuất hiện đầu của mỗi mục;
    - ghép các đoạn lại phải ra đúng chuỗi gốc.
  - **`TO_BE.name`** đổi thành "Ôn lại: viên gạch F13–F14 · to be (am / is / are)". Phần còn lại của `t1-grammar.ts` không đổi.
  - **Qua bức tường:**
    - Huy chương "Lên tàu Năm 1" được trao khi `foundation.completedAt` có giá trị, tức xong cả 4 hàng bằng học viên hoặc qua kiểm tra hàng. Bỏ qua Sân ga thì chưa có (`completedAt` trống); quay lại và xong thì có. Huy chương trao một lần, không cấp, không nằm trong `MEDAL_IDS`.
    - Nhớ "đã ăn mừng" và "đã đưa thư" bằng 2 mục mới trong `trophies.seen`: `wall-passed` và `board-year-1`. Hai mục này đã đồng bộ sẵn, gộp sớm hơn thắng, không thêm key store.
    - Màn ăn mừng là route `/foundation/qua-buc-tuong`. Còn chờ ăn mừng = đã có `completedAt` mà chưa có `wall-passed`. Lúc đó có nút "Qua bức tường" ở:
      - màn cuối BrickPlayer (trang viên);
      - kết quả kiểm tra hàng;
      - tổng kết Soát vé;
      - bức tường;
      - Hôm nay (để buổi 30' và trường hợp đồng bộ từ máy khác cũng tới được màn này).
    - Lần đầu mở màn ăn mừng: cú đưa thư "Huy chương Lên tàu Năm 1" (dùng lại `OwlPost`), rồi ghi cả 2 mục. Mở lại vẫn xem được, không có cú bay.
    - Cú đưa thư khi mở app (`deliverOwlPost`) giữ nguyên, không trao huy chương này.
  - **Điểm Nhà mỗi viên:** +5 cho mỗi viên có `firstDoneAt` (`foundation.bricks`). Học lại không cộng thêm. Hàng qua bằng kiểm tra không tạo mục viên nên không cộng; sau đó học viên ấy lần đầu thì được +5. `housePoints(days)` giữ nguyên; điểm viên cộng thêm qua hàm mới.

**Problem:** F13–F18 còn "Đang soạn", nên người học xong hàng B không có viên tiếp theo và không thể qua bức tường bằng cách học. Cổng 18 hư từ (be, not, wh-, there, in/on, have, at/every/always…) chỉ mở được bằng kiểm tra hoặc bỏ qua. `quiz-f-c` / `quiz-f-d` hỏi do/does và "at home" là thứ chưa dạy. Thẻ thì và bảng âm dùng thuật ngữ (S, danh từ, âm tiết, ngôi thứ ba số ít) mà không có đường mở lại bài đã dạy. Qua tường cũng chưa có ăn mừng, huy chương hay điểm Nhà.

**Approach:**
- Soạn `bricks/f13.ts` … `f18.ts` theo khuôn F01–F12 và rà 20 câu hàng C–D.
- Thêm bảng thuật ngữ thuần, `GlossaryText` / `TermChip` vào `TenseCard` và `SoundTable`.
- Thêm vào `medals.ts` / `points.ts` các hàm mới cho huy chương một lần, mục "đã ăn mừng" và điểm viên gạch.
- Thêm màn `/foundation/qua-buc-tuong` và nút dẫn tới nó.

## Boundaries & Constraints

**Always:**
- **Nội dung F13–F18:** theo khuôn F01–F12. Mỗi viên có:
  - đủ 6 màn theo thứ tự, giải thích 40–80 chữ;
  - check 2–5 câu cộng đúng 2 câu `easier`, ít nhất 1 câu `listen`;
  - 1–2 `ruleCards`, đúng 5 từ chủ đề như bảng.
- **Loại câu bắt buộc:**
  - F14 có câu `listen` là một câu hỏi (kết thúc bằng "?");
  - F15 có câu chọn giới từ nơi chốn;
  - F17 có ít nhất 1 câu `sort` theo vùng thời gian, và go, goes, going, went, gone đều xuất hiện trong các câu `sort` của viên;
  - F18 có ít nhất 1 câu `order` đặt trạng từ tần suất.
- **Soạn nội dung:**
  - Tự soạn, tiếng Việt. Không chép tài liệu có bản quyền.
  - `uses` chỉ gồm khái niệm viên này hoặc viên trước dạy.
  - Câu tiếng Anh theo luật ngữ pháp trong Decisions.
  - Ví dụ có ký hiệu (`·`, `→`, `/…/`) thì có `audioText` / `sampleAudioText`.
  - F16 có chữ "ngôi thứ ba số ít" và F17 có chữ "động từ nguyên mẫu" trong lời tiếng Việt, để chip của T1 mở đúng viên.
- **Cổng hư từ khớp nội dung:** mọi dạng trong `forms` của cổng F13 / F14 / F15 / F16 / F18 xuất hiện như token tiếng Anh trong viên đó (test story 25 tự phủ; was / were / been / being / had nằm trong câu trích để nhận ra).
- **Câu quiz hàng C–D:** giữ luật story 20:
  - 4 lựa chọn khác nhau, đáp án trùng đúng một lựa chọn;
  - `tag` thuộc `MISTAKE_TAGS`, `sectionId` `grammar`;
  - `pickQuiz` ra 8 câu với mọi seed, cả có và không TTS.
- **Huy chương / điểm:** chỉ thêm export mới vào `medals.ts`, `points.ts`. `MEDALS`, `MEDAL_IDS`, `medalProgress`, `unseenLevelUps`, `markSeen`, `housePoints`, `longestStreak`, `comebackCount`, `deliverOwlPost` cho kết quả như cũ với mọi store. Nhãn hiển thị ở Phòng Cúp đổi để có +5 viên gạch.
- **TermChip:**
  - là `<button type="button">` nằm trong dòng chữ, có gạch chân chấm, chữ không đổi;
  - nhãn đọc màn hình: "Thuật ngữ: {nhãn}";
  - Sheet dùng `src/components/ui/sheet.tsx`;
  - không chip trong câu tiếng Anh, câu thoại, IPA, từ ví dụ.
- **Test cũ:** kỳ vọng "F13 chưa có nội dung" bỏ đi (F01–F18 đều có). Không nới test khác.
- Màn 375px: các trang cũ chỉ thêm chip và nút "Qua bức tường"; không cuộn ngang.

**Never:**
- **Việc của story khác:**
  - `requires`, lọc câu chưa dạy, vá T1 (đổi tiêu đề bài `stage-1.ts`, câu W4, `placementLink`): story 27;
  - chia bài T1, lời mời ôn viên: story 28;
  - `lg:`, phím tắt, thanh trên cùng: story 29–31.
- **Không được làm:**
  - Không đổi `FUNCTION_WORD_GATES`, `FOUNDATION_GATES`, luật SRS, quota, `sessionPlan`, `row-test` (logic), store, schema, migration, luật gộp, `SYNCED_KEYS`.
  - Không thêm kiểu màn hay field vào `Screen`, `CheckItem`, `RuleCard`, `Question`, `Tense`, `Sound`.
  - Không thêm huy chương vào `MEDAL_IDS`, không đổi `LevelUp`, `LEVEL_TARGETS`.
  - Không xoá hay đổi id câu quiz, không thêm câu Sân ga vào `QUESTION_BANK` / `QUIZZES`.
  - Không sửa `words.json`, `starter-words.ts`, `scripts/vocab/ai/*`, nội dung F01–F12.
  - Không thêm thư viện. Không dùng logo hay hình gốc Harry Potter (chỉ icon lucide + SVG tự vẽ sẵn có).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bức tường đủ | Store mới, mở `/foundation` | 18 viên mở, không ô "Đang soạn" | N/A |
| Viên tiếp theo | F01–F12 xong | `nextBrickId` = F13; buổi 30' chạy F13 | N/A |
| Học xong F13 → F18 | `completeBrick` lần lượt F13, F14, F15, F16, F18, F17 (F18 trước F17 để chưa qua tường) | `lockedNewWordIds` bớt 1 / 7 / 5 / 1 / 5 / 0 (F17 xong thì qua tường, xem dòng sau). `preferredNewWordIds` có từ chủ đề viên vừa học. Có thẻ `rule:f13-…` … `rule:f18-…` | Hư từ mở chỉ là thẻ điền câu |
| Qua tường bằng học | Hàng A–C xong, xong F17 rồi F18 | `completedAt` = lúc xong F18. Còn chờ ăn mừng. Hư từ `'wall'` mở, chỉ còn khoá 15 hư từ gắn bài Chặng 1. Lịch 12 tháng bắt đầu, không "lùi" | N/A |
| Qua tường bằng Soát vé | Soát vé đạt cả 4 hàng | `completedAt` có. Tổng kết Soát vé có nút "Qua bức tường". Điểm viên gạch 0 | N/A |
| Bỏ qua Sân ga | `skippedAt` có, chưa quay lại | Không có huy chương, không chờ ăn mừng, Phòng Cúp: "Lên tàu Năm 1 · Chưa mở" | N/A |
| Bỏ qua rồi quay lại và xong | skip → resume → xong 4 hàng | Có huy chương, chờ ăn mừng | N/A |
| Mở màn ăn mừng lần đầu | Chờ ăn mừng, mở `/foundation/qua-buc-tuong` | Cú đưa thư "Huy chương Lên tàu Năm 1", ghi `wall-passed` + `board-year-1`. Thẻ ở Hôm nay biến mất | Ghi lại lần nữa → store cũ |
| Mở lại màn ăn mừng | Đã ghi 2 mục | Màn vẫn hiện, không cú bay | N/A |
| Chưa qua tường | `completedAt` trống, mở `/foundation/qua-buc-tuong` | Về `/foundation` | N/A |
| Hai máy | Máy A đã ăn mừng, đồng bộ sang máy B | `mergeSeen` giữ 2 mục: máy B không chờ ăn mừng, không cú bay | N/A |
| Dữ liệu cũ | `completedAt` có từ trước bản này | Chờ ăn mừng: Hôm nay có thẻ "Qua bức tường" | N/A |
| Huy chương cũ | Store có `trophies.seen` với `wall-passed`, `board-year-1` | `medalProgress`, `unseenLevelUps` giống hệt khi không có 2 mục | N/A |
| Điểm Nhà | 18 viên `firstDoneAt`, 10 ngày buổi chuẩn | total = `housePoints(days).total` + 90. Học lại viên không đổi. Hàng qua kiểm tra không cộng. Học viên của hàng ấy lần đầu +5 | `brickCount` âm / không nguyên → 0 |
| Chip trong thẻ thì | `TO_BE.formulas` "S + am / is / are + danh từ / tính từ / nơi chốn" | Chip S (F08), danh từ, tính từ (F07). Bấm thì Sheet tóm tắt, "Mở viên F08" → `/foundation/F08` | N/A |
| Khớp thuật ngữ | "động từ nguyên mẫu"; "thì thêm -s"; "Sunday"; "/əˈbaʊt/"; một thuật ngữ 2 lần | 1 chip cho cả cụm; "thì", "-s", "Sunday" không chip; không chip trong IPA; chỉ chip lần đầu; ghép lại = chuỗi gốc | N/A |
| Thuật ngữ T1 | Lời tiếng Việt của TenseCard / SoundTable bài T1 | Có chip S, danh từ, âm tiết, ngôi thứ ba số ít | N/A |
| Tiêu đề TO_BE | Mở bài s1-t1-w1, đoạn Ngữ pháp | Thẻ "Ôn lại: viên gạch F13–F14 · to be (am / is / are)" | N/A |
| Ngữ pháp C–D | Mọi câu tiếng Anh F13–F18 + 20 câu hàng C–D | Không có do/does/did, khuyết thiếu, 've/'ll/'d, n't ngoài isn't/aren't. was/were/been/being/had chỉ có ở F13/F16. going/gone không có ở F13–F16 và hàng C | Test báo viên, chỗ, câu |
| Hư từ của viên sau | Câu tiếng Anh F13–F17 và hàng C | Không có dạng hư từ mà cổng gắn viên đứng sau (vd F13 không có not/there/have/at). Ngoại lệ duy nhất: `in` ở F13–F14 (to be + nơi chốn: "I'm in Hanoi.") | Test báo viên, từ |
| Kiểm tra cuối hàng C | F13–F16 đã xong, sai `q-f14-02` | Vào Sổ lỗi. "Xem lại: Viên gạch F14 · …" mở F14 có nội dung | N/A |
| Sổ lỗi cũ | Sổ lỗi có `q-f17-04` | `getQuestion` trả câu đã viết lại, không crash | N/A |
| Không TTS | `canSpeak()` false | Viên vẫn học được, quiz C/D đủ 8 câu không có câu nghe | N/A |
| Từ chủ đề | 30 từ mới vào tập rà | `example-labels.json` 0 `todo`, chạy lại không đổi | Còn `todo` → script exit 1 |

</frozen-after-approval>

## Code Map

**Nội dung viên gạch / quiz**
- `src/data/foundation/bricks/f07.ts` … `f12.ts`: khuôn mới nhất (`FNN_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'>`, chú thích đầu file). `f01.ts` có `timeline` mẫu cho F17.
- `src/data/foundation/types.ts`, `catalog.ts`: kiểu và meta F13–F18 (`teaches` / `uses`). Không sửa.
- `src/data/foundation/content.ts`: `BRICK_CONTENT`, thêm F13–F18 qua `withMeta`.
- `src/data/foundation/foundation.test.ts`: helper `englishTexts`, `englishParts`, `tokensOf`, danh sách cấm hàng B (dòng ~47–122), ca "cổng hư từ khớp nội dung" (dòng ~232). Dòng 154 `hasBrickContent('F13')` false bỏ đi.
- `src/data/vocab/function-words.ts`: cổng F13–F18 (dòng 57–80). Không sửa.
- `src/data/questions/foundation.ts`: `ROW_C` (dòng ~249), `ROW_D` (~369); chú thích đầu file. `src/data/questions/foundation.test.ts`: danh sách cấm hàng B khai báo lặp.
- `src/data/lessons/t1-grammar.ts:29-31`: `TO_BE.name`. `src/data/lessons/lessons.test.ts`: test bài.
- `src/data/vocab/example-overrides.json`, `scripts/vocab/example-labels.json`, `npm run vocab:label-examples`: như story 25 (`finish` "I will…" chắc chắn bị gắn nhãn).

**Thuật ngữ**
- `src/components/lesson/TenseCard.tsx`, `SoundTable.tsx`: chỗ đặt chip (chỉ field lời tiếng Việt, xem Decisions).
- `src/components/ui/sheet.tsx`: Sheet dùng cho thẻ tóm tắt.
- `src/data/foundation/content.ts` `getBrick`, `src/lib/foundation` `brickHref`: nội dung và link của thẻ tóm tắt.

**Qua bức tường, huy chương, điểm**
- `src/lib/foundation/foundation.ts`: `readFoundation`, `completedAt` (đặt trong `commit` khi đủ 4 hàng), `foundationState().doneBrickIds`. Không sửa.
- `src/lib/trophies/medals.ts`: `readSeen`, `isSeenEntry`, `SeenEntry`, `MEDALS`. `src/lib/trophies/points.ts`: `HousePoints`, `housePoints`. `src/lib/trophies/trophies.test.ts`.
- `src/lib/sync/merge.ts:203` `mergeSeen`: giữ mọi mục, sớm hơn thắng. Không sửa.
- `src/app/store-context.ts`: `useFoundation` (dòng ~218), `useTrophies` (~520), `deliverOwlPost` / `useOwlPost` (giữ nguyên).
- `src/components/trophies/OwlPost.tsx` (prop `letters: LevelUp[]`), `MedalGrid.tsx`, `MedalIcon.tsx`, `HousePointsCard.tsx`, `src/pages/TrophyRoom.tsx`.
- Nơi đặt nút "Qua bức tường":
  - `src/components/foundation/BrickPlayer.tsx` (màn cuối, `variant` `page`);
  - `src/pages/FoundationRowTest.tsx` (`actions` dòng ~57);
  - `src/pages/FoundationTicket.tsx` (`PlacementSummary`, `wallDone`);
  - `src/pages/Foundation.tsx`;
  - `src/pages/Today.tsx`.
- `src/app/routes.tsx:48-52`: route `foundation/*`.
- `src/components/session/SessionParts.tsx`, `src/pages/Session.tsx`: không sửa. Buổi 30' tới màn ăn mừng qua thẻ ở Hôm nay.

**Test sẵn có cần thêm ca**
- `src/lib/flashcard-session.test.ts` (block hàng B, dòng ~500+): `getBrick` thật, `lockedNewWordIds`, `ruleStudyWords`.
- `src/lib/foundation/row-test.test.ts`, `src/components/quiz/source-label.test.ts`, `src/app/store-context.test.ts`.
- Vitest env `node`, chỉ `src/**/*.test.ts`, không có test component.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/foundation/bricks/f13.ts` … `f18.ts` (mới), `src/data/foundation/content.ts` -- soạn 6 viên theo Decisions / Boundaries và đăng ký vào `BRICK_CONTENT`.
  - F13: am/is/are + danh từ/tính từ/nơi chốn; tránh "I very happy", "I am agree"; nhắc họ be (was, were, been, being).
  - F14: isn't/aren't, đảo câu hỏi, trả lời ngắn, what/where/who/how old/how much, from; lên giọng cuối câu Yes/No; tránh "You are student?".
  - F15: there is/are + in/on/under/next to/between, đừng dịch "có" thành have/has.
  - F16: have/has, "ngôi thứ ba số ít", phân biệt với there is, "I am 25" (không "I have 25 years"), nhắc had.
  - F17: Tiếng Việt thêm đã/đang/sẽ, tiếng Anh đổi động từ; 5 dạng go trên 3 vùng (`timeline`); "động từ nguyên mẫu" = dạng gốc; chỉ nhận ra.
  - F18: at + giờ, on + thứ, in + tháng; trạng từ tần suất trước động từ thường, sau am/is/are.
  - Id `fNN-cN` / `fNN-eN` / `fNN-aN`, `fNN-say-n`, `fNN-rule-n`.
- [x] `src/data/foundation/foundation.test.ts` -- bỏ `hasBrickContent('F13')` false, thêm ca F01–F18 đều có nội dung. Thêm các ca:
  - loại câu bắt buộc của F14 / F15 / F17 / F18;
  - **ngữ pháp hàng C–D:** dùng `englishTexts` cho F13–F18 với danh sách cấm của Matrix, ngoại lệ chủ (was/were/been/being ở F13, had ở F16), going/gone cấm ở F13–F16. Có ca tự kiểm helper;
  - **hư từ của viên sau:** với F13–F17, token không thuộc `forms` của cổng `{ brick }` có viên đứng sau viên đang xét (ngoại lệ `in` ở F13–F14);
  - ca "cổng hư từ khớp nội dung" sẵn có: nâng ngưỡng `checked` lên `>= 25 + 28` (F13 8, F14 7, F15 5, F16 3, F18 5 dạng);
  - từ chủ đề F13–F18 không nằm trong `STARTER_WORD_IDS` (ca sẵn có tự phủ);
  - không câu quiz nào (đã điền đáp án, bỏ hoa thường và dấu câu) trùng một câu tiếng Anh của viên.
- [x] `src/data/questions/foundation.ts` -- rà `ROW_C` / `ROW_D` theo Decisions (viết lại `q-f14-02`, `q-f16-01`, `q-f17-04`; đọc lại 17 câu còn lại). Chú thích đầu file thêm: câu hàng C chỉ dùng F01–F16, hàng D dùng F01–F18.
- [x] `src/data/questions/foundation.test.ts` -- thêm các ca:
  - 20 id hàng C–D đúng thứ tự, `getQuestion` tra được;
  - phân bố và đúng 2 câu nghe mỗi hàng;
  - token cấm (khai báo lặp, chú thích trỏ test viên);
  - hàng C không có at / every / always / never / often / going / gone;
  - `getQuestion('q-f17-04')` trả câu mới.
- [x] `src/data/lessons/t1-grammar.ts`, `src/data/lessons/lessons.test.ts` -- đổi `TO_BE.name` và thêm ca kiểm tiêu đề bắt đầu bằng "Ôn lại: viên gạch F13–F14". Grep chỗ hiện `tense.name` để chắc không vỡ chữ ở chỗ khác.
- [x] `src/data/foundation/glossary.ts` (mới) -- `GlossaryTerm`, `GLOSSARY` (30–34 mục theo Decisions) và `splitGlossaryText(text): ({ text: string } | { text: string; term: GlossaryTerm })[]` thuần theo luật khớp. Không re-export từ `src/data/foundation/index.ts`.
- [x] `src/data/foundation/glossary.test.ts` (mới) -- các ca:
  - 30–34 mục, id và mẫu không trùng, `brickId` thuộc danh mục;
  - viên đích nhắc tới ít nhất một mẫu, dò không phân biệt hoa thường trong lời tiếng Việt của viên (`explain`, `contrast`, `worked.noteVi`, thẻ quy tắc, gợi ý / giải thích câu luyện);
  - mọi dòng Matrix "Khớp thuật ngữ";
  - chuỗi `TO_BE.formulas[0].text`;
  - "Thuật ngữ T1": gom lời tiếng Việt của mọi TenseCard / SoundTable bài `s1-t1-*`, phải có chip S, danh từ, âm tiết, ngôi thứ ba số ít.
- [x] `src/components/lesson/TermChip.tsx` (mới), `TenseCard.tsx`, `SoundTable.tsx` -- `GlossaryText({ text })` vẽ đoạn thường và `TermChip`. Chip mở Sheet: nhãn, định nghĩa, "Viên gạch Fxx · tên", `explain.textVi` của viên (`getBrick`; thiếu thì `goalVi`), nút "Mở viên Fxx" (`brickHref`). Thay chữ ở các field đã nêu, giữ nguyên cấu trúc thẻ.
- [x] `src/lib/trophies/points.ts` -- thêm `BRICK_FIRST_DONE_POINTS = 5`, `HousePointsWithBricks = HousePoints & { brickPoints; brickCount }` và `withBrickPoints(points, brickCount)`. `total` cộng `brickPoints`; `brickCount` không phải số nguyên ≥ 0 thì tính 0.
- [x] `src/lib/trophies/medals.ts` -- thêm:
  - `BOARDING_MEDAL` ({ id `board-year-1`, name "Lên tàu Năm 1", condition "Xong cả 4 hàng của Sân ga 9¾" }) và `WALL_CELEBRATION_KEY = 'wall-passed'`;
  - `boardingMedal(store)` trả `{ earned, earnedAt, delivered }`, với `earned` = `completedAt !== null`;
  - `isWallCelebrationPending(store)`;
  - `markWallCelebrated(store, now)`: ghi 2 mục `SeenEntry` còn thiếu, giữ mục cũ; chưa `earned` hoặc đủ rồi thì trả store cũ;
  - `OwlLetter = { key; name; level: MedalLevel | null }` và `BOARDING_LETTER`.
  Import `readFoundation` từ `@/lib/foundation` (không tạo vòng import).
- [x] `src/lib/trophies/trophies.test.ts` -- ca cho các dòng Matrix:
  - bỏ qua / quay lại;
  - đánh dấu ăn mừng không lặp;
  - điểm Nhà;
  - huy chương cũ không đổi khi có 2 mục mới;
  - `mergeSeen` hai máy;
  - dữ liệu cũ có `completedAt`.
- [x] `src/app/store-context.ts`, `src/app/store-context.test.ts`:
  - `useTrophies` trả `points: withBrickPoints(housePoints(days), foundationState(store).doneBrickIds.length)` và `boarding`;
  - `useFoundation` thêm `wallCelebrationPending` và `markWallCelebrated`;
  - test: `deliverOwlPost` không trả thư Lên tàu khi store đã qua tường.
- [x] `src/components/trophies/OwlPost.tsx` -- `letters: readonly OwlLetter[]` (`LevelUp` vẫn hợp), `level` null thì chữ "Huy chương {name}" và `MedalIcon level="gold"`. AppShell không đổi.
- [x] `src/components/trophies/MedalGrid.tsx`, `HousePointsCard.tsx`, `src/pages/TrophyRoom.tsx`:
  - thêm ô "Lên tàu Năm 1" (nhận rồi: vàng, "Đã nhận · một lần"; chưa: "Chưa mở" + điều kiện);
  - lời điểm Nhà thêm "lần đầu xong mỗi viên gạch +5" và dòng "+N điểm viên gạch (k viên)" khi k > 0.
- [x] `src/pages/FoundationWallPassed.tsx` (mới), `src/app/routes.tsx` -- route `foundation/qua-buc-tuong` đặt trước `foundation/:brickId`. Chưa có `completedAt` thì `<Navigate to="/foundation" replace />`. Nội dung màn:
  - tiêu đề "Qua bức tường", lời chúc lên tàu Năm 1;
  - `BrickWall` sáng đủ;
  - ô huy chương, dòng "+5 điểm Nhà × k viên" khi k > 0;
  - "Lịch 12 tháng bắt đầu từ hôm nay" và bài tiếp theo (`useSessions().current`);
  - nút "Về Hôm nay", link Phòng Cúp.
  Khi mount: còn chờ ăn mừng và chưa đưa thư thì hiện `OwlPost` với `BOARDING_LETTER`, rồi gọi `markWallCelebrated` một lần.
- [x] `src/components/foundation/WallPassedCard.tsx` (mới), `Today.tsx`, `Foundation.tsx`, `BrickPlayer.tsx`, `FoundationRowTest.tsx`, `FoundationTicket.tsx`:
  - còn chờ ăn mừng thì có nút chính "Qua bức tường" tới route mới. BrickPlayer trang viên thay "Về bức tường"; Soát vé thay "Về Lộ trình" (giữ link phụ);
  - bức tường khi đã qua mà hết chờ có link "Xem lại màn Qua bức tường";
  - BrickPlayer `variant="session"` không đổi.
- [x] `src/lib/flashcard-session.test.ts`, `src/lib/foundation/row-test.test.ts`, `src/components/quiz/source-label.test.ts` -- ca Matrix:
  - F12 xong → F13 tiếp theo, `sessionPlan` theory F13;
  - khoá 75 → 74 → 67 → 62 → 61 → 56 khi xong F13, F14, F15, F16, F18; xong thêm F17 thì qua tường và còn khoá 15;
  - `rule:f13-…` … `rule:f18-…`;
  - nhãn và href F14.
- [x] `src/data/vocab/example-overrides.json`, `scripts/vocab/example-labels.json` -- chạy `npm run vocab:label-examples`, viết override tự soạn cho mọi `todo`, đọc tay 30 câu, chạy lại tới khi 0 `todo` và file không đổi.

**Acceptance Criteria:**
- Given đã học xong F01–F12, when bấm buổi 30' mỗi ngày, then lý thuyết lần lượt là F13 … F18, không thấy màu đỏ. Xong F18 (hàng A–C đã xong) thì trang viên có nút "Qua bức tường".
- Given vừa qua bức tường, when mở màn "Qua bức tường", then cú đưa thư trao "Huy chương Lên tàu Năm 1" một lần. Phòng Cúp hiện ô huy chương đã nhận và điểm Nhà có thêm +5 cho mỗi viên đã học. Hôm nay ở chế độ bài chính, lịch không có "lùi".
- Given đang xem đoạn Ngữ pháp hoặc Phát âm của bài T1, when bấm chip "danh từ" hoặc "S", then Sheet tóm tắt viên F07 / F08 mở, nút "Mở viên" dẫn đúng viên, đóng Sheet thì trang không đổi.
- Given đã học hết F13–F16, when làm "Kiểm tra cuối hàng" hàng C, then không câu nào cần do/does, at hay khuyết thiếu, câu sai có link "Xem lại" mở viên đã có nội dung.
- Given màn hình 375px, when mở `/foundation/F13` … `F18`, `/foundation/qua-buc-tuong`, `/trophies`, bài `s1-t1-w1` (chip + Sheet), then không có cuộn ngang.

## Implementation Notes

- **Files mới:** `src/data/foundation/bricks/f13.ts` … `f18.ts`, `src/data/foundation/glossary.ts` (+ `glossary.test.ts`), `src/components/lesson/TermChip.tsx` (`TermChip`, `GlossaryText`), `src/components/foundation/WallPassedCard.tsx` (`WallPassedCard`, `WallPassedButton`), `src/pages/FoundationWallPassed.tsx`. **Files sửa:** `content.ts` (đăng ký F13–F18), `questions/foundation.ts` (rà hàng C–D + chú thích đầu file), `t1-grammar.ts` (chỉ `TO_BE.name`), `TenseCard.tsx`, `SoundTable.tsx`, `medals.ts`, `points.ts`, `store-context.ts`, `OwlPost.tsx`, `MedalGrid.tsx` (+ export `BoardingTile`), `HousePointsCard.tsx`, `TrophyRoom.tsx`, `routes.tsx`, `BrickPlayer.tsx`, `Foundation.tsx`, `FoundationRowTest.tsx`, `FoundationTicket.tsx`, `Today.tsx`, `src/lib/foundation/player.ts` (thêm hằng `WALL_PASSED_HREF`), `src/lib/subs/highlight.ts` (`shortTenseName`), `example-overrides.json` (+4), `example-labels.json` (chạy lại). Không đổi `FUNCTION_WORD_GATES`, `FOUNDATION_GATES`, store/schema/merge, `row-test` logic, `sessionPlan`, kiểu `Screen`/`CheckItem`/`RuleCard`/`Question`/`Tense`/`Sound`, nội dung F01–F12, `words.json`, `starter-words.ts`.
- **Nội dung F13–F18:** mỗi viên 6 màn, giải thích 40–80 chữ, check 5 câu + 2 `easier`, 2 thẻ quy tắc, 5 từ chủ đề đúng bảng (cả 30 từ qua test dữ liệu sẵn có, không phải thay). F13 nhắc be · was · were · been · being đúng một lần (ví dụ có `audioText`); F14 `listen` "Are you ready?", Áp dụng có `sampleAudioText` (bỏ dấu —); F15 câu chọn giới từ (under/on/in, between/next to/under), câu sai "Is a book on the table."; F16 "ngôi thứ ba số ít", "have → had" (một lần), "I am 25"; F17 "động từ nguyên mẫu", 2 câu `sort` theo vùng Quá khứ / Bây giờ / Thói quen (câu và 5 dạng go), `timeline` progress + past-point; F18 `order` "I usually wake up early", "every day". Thẻ quy tắc: `They ___ young. (be)`→are, `I ___ happy. (be)`→am, `They ___ ready. (không)`→aren't, `___ are you from? (ở đâu)`→Where, `There ___ two beds in my room. (có)`→are, `The cat is ___ the bed. (ở dưới)`→under, `He ___ a big car. (có)`→has, `I ___ 25. (tuổi)`→am, `Yesterday I ___ home. (go)`→went, `I am ___ home now. (go)`→going, `I get up ___ six. (lúc)`→at, `I ___ drink coffee at night. (không bao giờ)`→never.
- **Quiz hàng C–D:** giữ 20 id, phân bố và 2 câu nghe mỗi hàng. `q-f14-02` → "He ___ home today." (isn't / aren't / not / am not); `q-f15-02` lựa chọn at → between (hàng C không có at); `q-f16-01` having → haves; `q-f16-02` viết lại "He is 30." vì "I am 25." trùng nguyên văn câu của F16; `q-f17-04` → "I ___ to school." (go / goes / going / gone). Giải thích 20 câu viết lại theo lời viên. Tag giữ nguyên, trừ `q-f16-02` đổi `từ vựng` → `thì` sau review (câu be/have, cùng tag với `q-f16-01`).
- **Test dữ liệu:** `foundation.test.ts`: F01–F18 đều có nội dung; loại câu bắt buộc F14/F15/F17/F18; ngữ pháp hàng C–D (`rowCdForbidden`: do/does/did, khuyết thiếu, 've/'ll/'d, n't ngoài isn't/aren't; was/were/been/being chỉ F13, had chỉ F16, going/gone từ F17; "May" viết hoa là tên tháng) + ca tự kiểm; hư từ của viên sau (`laterGateForms`, trừ `in` ở F13–F14) + tự kiểm; câu quiz hàng B–D không trùng câu nào của viên (đã thử đột biến: đỏ đúng chỗ); ví dụ có ký hiệu thì có audioText; ngưỡng cổng hư từ `>= 25 + 28`. `questions/foundation.test.ts`: 20 id C–D đúng thứ tự, phân bố, token cấm (khai báo lặp, chú thích trỏ nhau), hàng C không at/every/always/never/often/going/gone, `getQuestion('q-f17-04')` trả câu mới.
- **Thuật ngữ:** 34 mục (F03 2, F04 6, F05 1, F06 1, F07 6, F08 3, F09 2, F10 1, F11 2, F12 1, F13 2, F14 3, F16 1, F17 2, F18 1); mục thứ 34 "động từ thường" (F13) thêm sau review. Đổi mẫu khớp cho viên cũ không nhắc nguyên chữ: âm dài thêm "dấu ː" (F03 viết "Dấu ː… kéo dài"), từ chỉ định thêm "this/that" (F12 không có chữ "chỉ định"). `splitGlossaryText` quét trái sang phải lấy mẫu dài nhất; mục đã chip thì lần sau để chữ thường và không chip phần ngắn hơn bên trong (vd "động từ" trong "động từ nguyên mẫu"); mẫu một ký tự (S, ˈ) khớp đúng ký tự; IPA là đoạn `/…/` không có khoảng trắng ở mép, ≤ 40 ký tự, không chữ tiếng Việt (nên "am / is / are", "danh từ/tính từ" không bị coi là IPA). `TO_BE.formulas[0].text` thật là "I am · He / She / It is · You / We / They are + danh từ / tính từ / nơi chốn" (không có S): test kiểm chuỗi này (chip danh từ, tính từ) và chuỗi của Matrix (thêm chip S). Chip S có ở công thức Phủ định / Câu hỏi của TO_BE.
- **TO_BE.name:** `shortTenseName` (tô phụ đề video) xử lý tên "Ôn lại: … · to be (am / is / are)" → "to be (am / is / are)", có test; nếu không sẽ hiện "Ôn lại". Tiêu đề bài `stage-1.ts` ("Động từ to be · 12 nguyên âm đơn") để story 27.
- **Huy chương / điểm:** `BOARDING_MEDAL`, `WALL_CELEBRATION_KEY`, `boardingMedal`, `isWallCelebrationPending`, `markWallCelebrated`, `OwlLetter`, `BOARDING_LETTER` trong `medals.ts`; `BRICK_FIRST_DONE_POINTS`, `HousePointsWithBricks`, `withBrickPoints` trong `points.ts`. Hàm cũ không đổi (test: medalProgress / unseenLevelUps giống hệt khi có 2 mục mới; `deliverOwlPost` không trả thư Lên tàu). `useTrophies` trả `points` có điểm viên gạch và `boarding`; `useFoundation` thêm `wallCelebrationPending`, `markWallCelebrated`.
- **Màn Qua bức tường:** chưa có `completedAt` → `/foundation`. Thư chốt lúc lượt đồng bộ đầu xong (`useFirstSyncReady`, component con `BoardingLetter`; chưa có `board-year-1` thì hiện), effect gọi `markWallCelebrated` một lần (có ref chặn). Thẻ ở Hôm nay / bức tường cũng chờ lượt đồng bộ đầu (sau review). Điểm viên gạch ở Phòng Cúp và màn này cùng đọc `storeHousePoints(store)` (`medals.ts`). Dòng lịch: "Lịch 12 tháng bắt đầu từ hôm nay" khi ngày bắt đầu lịch (`scheduleStartDate`) là hôm nay, ngược lại "… từ ngày d/m/yyyy" (mở lại hôm sau, hay đã bỏ qua Sân ga trước đó) — không bao giờ có "lùi". Nút "Qua bức tường": BrickPlayer trang viên (thay "Về bức tường"), kết quả kiểm tra hàng (thêm, "Làm lại" thành outline), tổng kết Soát vé (thay "Về Lộ trình", giữ link phụ), bức tường và Hôm nay (`WallPassedCard`); bức tường hết chờ có link "Xem lại màn Qua bức tường".
- **Test cũ phải đổi:** `foundation.test.ts` bỏ `hasBrickContent('F13')` false; `flashcard-session.test.ts` ca "viên không có nội dung không góp từ" trước dựa vào F17 chưa có nội dung, nay giả viên "Đang soạn" bằng lookup trả rỗng cho F17 (cùng ý, không nới kỳ vọng).
- **Test thêm:** `trophies.test.ts` (bỏ qua / quay lại, học F18 sau cùng, ăn mừng không lặp, giữ mục cũ, dữ liệu cũ, huy chương cũ không đổi, `mergeData` hai máy, điểm Nhà +90 / học lại / hàng qua kiểm tra / brickCount sai), `store-context.test.ts`, `flashcard-session.test.ts` (F13 tiếp theo, khoá 75→74→67→62→61→56→15, completedAt lúc xong F18, `rule:f13…f18`), `row-test.test.ts` (cuối hàng C sai q-f14-02 vào Sổ lỗi; bức tường 18 ô có nội dung), `source-label.test.ts` (F14), `lessons.test.ts`, `subs.test.ts`.
- **Câu ví dụ:** `npm run vocab:label-examples` lần đầu: 1 todo (`finish` "I will…"). Override tự viết: finish "I finish work at six.", và sau khi đọc tay 30 câu: happy "My parents are happy today." (cũ "happy to help": động từ nguyên mẫu có to), ready "Dinner is ready." (cũ "ready to order"), bank "There is a bank next to my office." (cũ "need to go"). 26 câu còn lại giữ (new đã có override "I have a new laptop."). Kết quả 560 câu: 399 clean · 141 override · 20 accepted · 0 todo; chạy lại file giống hệt (cmp).
- **Kiểm chứng:**
  - `npm run lint && npm test && npm run build` pass (64 file, 1474 test; `check-precache` OK; cảnh báo chunk size có từ trước).
  - Lệnh vitest theo Verification: 23 file, 605 test pass. `grep -rn "destructive" src/components/foundation src/pages/Foundation*.tsx`: không kết quả.
  - Headless Chrome 375px (bản build không biến Supabase): bức tường 18 ô, không "Đang soạn", "Học tiếp: F13"; chạy hết 6 màn F13 … F18 (faded gõ sai → "Chưa đúng", câu chọn / `sort` F17 / `order` F18 qua "Kiểm tra" và "Xem đáp án", "Bỏ qua, sang Áp dụng"), không phần tử `destructive`, `scrollWidth` 375 ở mọi màn; xong F18 (A–C xong, F17 xong) màn cuối có "Qua bức tường"; Hôm nay có thẻ, bấm sang màn ăn mừng có cú bay "Huy chương Lên tàu Năm 1", store có `wall-passed` + `board-year-1`; mở lại (cả khi rời trang rồi quay lại) không cú bay; Hôm nay hết thẻ, chế độ bài chính, không "lùi"; bức tường có link "Xem lại"; Phòng Cúp có ô "Đã nhận · một lần" và "+90 điểm viên gạch (18 viên)"; bài s1-t1-w1 có chip danh từ, S, âm tiết…, Sheet "Viên gạch F07 · Từ loại" + "Mở viên F07", Escape đóng Sheet trang không đổi, "Mở viên F08" → `/foundation/F08`; dữ liệu cũ có `completedAt` → thẻ ở Hôm nay; chưa qua tường → về `/foundation`. Không lỗi console.
- **Chưa làm / rủi ro:**
  - Không commit (theo lệnh workflow); `example-labels.json` và các file mới chưa vào git.
  - Chưa có người đọc lại chất lượng tiếng Việt / độ tự nhiên của câu F13–F18 và định nghĩa 33 thuật ngữ; giọng TTS thật chưa nghe.
  - `q-f16-02` viết lại (không nằm trong 3 câu bắt buộc) vì trùng nguyên văn "I am 25." của viên; Sổ lỗi cũ có id này hiện câu mới.
  - Chip thuật ngữ áp cho mọi TenseCard / SoundTable (cả T2–T4), có thể chip chữ thông dụng như "quá khứ", "phủ định" ở mọi bài; luật "chỉ lần đầu mỗi chuỗi" giữ mật độ vừa phải nhưng chưa có người duyệt cảm giác đọc.
  - Hai lớp `OwlPost` (AppShell và màn ăn mừng) có thể cùng hiện nếu một cấp huy chương khác tới đúng lúc mở màn ăn mừng.

## Spec Change Log

## Review Triage Log

Nguồn: B = blind, E = edge, V = verification gap, C = content. Gộp theo gốc: B5 = C1; B4 = C2; B2 = C5; B3 = C12; B6 = C9; B8 = C8; B12 = E10 = V2; B14 = C17; B11 = E7; B1 = C7; B17 = E4; E1 + E2 (+ E3) cùng gốc "chưa chờ đồng bộ đầu".

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| B1 | blind | Câu ví dụ từ chủ đề dùng hư từ của viên sau (kitchen "has", bed "at", sleep "every") | false | Luật câu ví dụ thẻ từ là của story 24 (ngữ pháp Sân ga + hiện tại đơn, máy dò 7 nhãn), không phải luật cộng dồn từng viên; tiền lệ story 25 triage #18. `q-f14-02` viết lại theo luật quiz hàng C, không phải luật câu ví dụ. Không có `todo`. | reject |
| B2 | blind | F18 dùng "at night", "in the morning" mà không dạy | medium | `f18.ts` c3, sample, `f18-rule-2`, contrast dùng hai cụm; giải thích chỉ có at giờ / on thứ / in tháng. Thêm "Cụm cố định: in the morning, at night" vào `enRequires` và thẻ `f18-rule-1`. | patch |
| B3 | blind | `f18-c2` order có 2 thứ tự đúng ("Usually I wake up early.") | low | Đúng ngữ pháp; chỉ có hoa thường của token gợi ý. Đề thêm "(bắt đầu bằng I)". | patch |
| B4 | blind | Luật "không có am / is / are đi trước = Thói quen" sai; "We live in Hue." là trạng thái | medium | `f17-c1` explanation khớp cả "I went". Thay mục bằng "I come home late.", giải thích "go, goes, come (dạng gốc, hoặc thêm -s…)". | patch |
| B5 | blind | F17 xếp "She has gone." vào Quá khứ, mâu thuẫn hiện tại hoàn thành của Năm 1; "sẽ" không có ví dụ | medium | Spec (frozen) bắt 5 dạng vào 3 vùng nên giữ vùng; thêm ghi chú "việc đi đã xong, giờ không ở đây" ở explain, ví dụ contrast, giải thích sort và Áp dụng. Phần "sẽ": Decisions F17 ghi "Tiếng Việt thêm đã/đang/sẽ", không sửa. | patch |
| B6 | blind | F13: "Anh ấy ở Huế: không cần động từ" sai; lỗi mẫu "I very happy" lệch thẻ quy tắc | medium | "ở" là động từ. Đổi thành "“Tôi vui”, “Cô ấy bận”: không cần chữ “là”", lỗi mẫu "I happy." như thẻ `f13-rule-2`. | patch |
| B7 | blind | Chip có S mà không có V, O | low | Lời T1 không có "O" đứng riêng; "V" chỉ trong "V-ing / V2 / V3". Spec chỉ đòi S. Thêm V sẽ chip cả "V-ing". | reject |
| B8 | blind | Không có mục "động từ thường"; F15 không có mục; "giới từ" luôn mở F07 | medium | "động từ thường" có ở F13, F18, T1 nhưng chip "động từ" mở F07. Thêm mục `ordinary-verb` (F13, 34/34 mục) và câu định nghĩa trong contrast F13. F15 / giới từ: danh sách mục do spec định, giữ. | patch |
| B9 | blind | Định nghĩa nguyên âm / âm tiết "đúng một nguyên âm" không chính xác | low | Sửa thành "thường là lõi của mỗi âm tiết" / "thường có một nguyên âm làm lõi" (sửa chữ trực tiếp). | patch |
| B10 | blind | `aria-label` chip không chứa chữ hiện (WCAG 2.5.3) | low | Có thật với "âm nhấn", "ˈ", "dạng gốc", nhưng nhãn "Thuật ngữ: {nhãn}" là yêu cầu frozen; app một người dùng, không dùng điều khiển giọng nói. | reject |
| B11 | blind | Mẫu tiếng Anh (to be, this/that, IPA) chip câu tiếng Anh, `lang="vi"` sai | false | Đã quét mọi `formulas`, `rules`, `mistakes[].why`, `use`, `intro`, `note`, `tip` của mọi bài: "to be" chỉ khớp trong lời tiếng Việt ("Thiếu to be", "Bị động = to be + V3", nhãn "To be"); không có this/that hay IPA trong câu tiếng Anh. | reject |
| B12 | blind | Tự kiểm ngữ pháp C–D không chạy đường thật; "May" đầu câu lọt | medium | `withoutMonthMay` xoá mọi "May". Đổi thành chỉ bỏ "in / on May" ở cả hai file test, thêm tự kiểm "May I sit here?" và một ca chạy đúng đường `tokensOf(withoutMonthMay(text))`. | patch |
| B13 | blind | Dấu — không được coi là ký hiệu cần `audioText` | low | F14 contrast "Is he home? — No…" và worked "How old… — She is ten." không có `audioText`. Thêm `audioText` bỏ dấu —, thêm — vào `SYMBOL` của test. | patch |
| B14 | blind | Tag quiz chưa rà: `q-f16-02` "từ vựng", `q-f14-02` "thì" | low | `q-f16-02` (be/have nói tuổi) đổi `thì` như `q-f16-01`. `q-f14-02` (to be phủ định) dùng `thì` như q-f13 (to be là một "thì" trong TenseCard): đúng. | patch |
| B15 | blind | Màn ăn mừng ghi "Từ hôm nay" cả khi mở lại | low | Dòng lịch đã đổi theo ngày nhưng dòng dưới cố định. Đổi thành "Từ giờ, buổi 30'…". | patch |
| B16 | blind | Thư chỉ quyết lúc mount; đồng bộ đem `completedAt` tới khi trang đang mở | false | Chưa có `completedAt` thì trang `<Navigate to="/foundation">` ngay, nên không thể đang mở trang mà thiếu `completedAt`. (Phần đồng bộ đầu xử lý ở E1.) | reject |
| B17 | blind | Hai lớp `OwlPost` (AppShell + màn ăn mừng) chồng nhau | low | Chỉ xảy ra khi mở app thẳng vào route này đúng lúc có cấp huy chương mới; đóng vẫn được. Sửa cần hàng đợi thư chung (thêm API). Đã ghi rủi ro ở Implementation Notes. | reject |
| B18 | blind | Ca kiểm tra cuối hàng C không kiểm nhãn / link | low | `every(hasBrickContent)` luôn đúng. Đổi thành kiểm mục `q-f14-02` có `lessonId` `f14` và F14 có nội dung; nhãn và href đã ở `source-label.test.ts`. | patch |
| E1 | edge | Mở màn ăn mừng ở máy thứ hai trước lượt đồng bộ đầu → thư hiện lại | medium | Thư chốt ở `useState` lúc mount, không chờ `useFirstSyncReady` như `useOwlPost`. Tách `BoardingLetter`, chỉ mount khi `useFirstSyncReady()`. | patch |
| E2 | edge | Thẻ "Qua bức tường" ở Hôm nay / bức tường hiện trước đồng bộ đầu | medium | Cùng gốc E1: máy B mời ăn mừng lại trái dòng Matrix "Hai máy". `WallPassedCard` chờ `useFirstSyncReady()`. | patch |
| E3 | edge | Có `wall-passed` mà thiếu `board-year-1` thì không bao giờ ghi | low | Chỉ khi dữ liệu hỏng tay; điều kiện mới của `BoardingLetter` (`!pending && delivered` thì thôi) tự ghi mục thiếu, không thêm nhánh. | patch |
| E4 | edge | Hai overlay `OwlPost` | low | Trùng B17. | reject |
| E5 | edge | Mẫu dài nhất kết thúc trong IPA thì mẫu ngắn hơn không được thử | low | Cần mẫu chứa "/" sát đoạn IPA (chỉ "this/that"); không có trong lời bài nào. | reject |
| E6 | edge | "this/that/these" bị coi là IPA nên không chip | low | Không lời TenseCard / SoundTable nào có chuỗi này (đã quét). | reject |
| E7 | edge | `GlossaryText` trên `f.text` (lang=en) chip "want to be" | false | Trùng B11: không câu tiếng Anh nào hiện có chứa mẫu. | reject |
| E8 | edge | Chuỗi NFD không khớp | false | Lời bài là hằng TS trong repo, NFC; không có nhập liệu người dùng. | reject |
| E9 | edge | `shortTenseName` với "Ôn lại:" không có " · " | false | Chỉ `TO_BE.name` có tiền tố này và có " · "; có test. | reject |
| E10 | edge | "May" đầu câu lọt test | medium | Trùng B12. | patch |
| E11 | edge | was / were / had lặp nhiều lần không bị bắt | low | Matrix chỉ đòi "chỉ có ở F13/F16"; nội dung hiện nhắc đúng một lần. Thêm đếm là thêm luật test. | reject |
| E12 | edge | Ôn viên bất kỳ khi còn chờ ăn mừng hiện "Qua bức tường" | false | Đúng spec: "còn chờ ăn mừng thì có nút chính … BrickPlayer trang viên thay 'Về bức tường'". | reject |
| V1 | vgap | Điểm viên gạch ở `useTrophies` / màn ăn mừng chỉ test qua bản sao biểu thức | medium | Gap đã xác minh. Thêm `storeHousePoints(store)` vào `medals.ts`, dùng ở `useTrophies` và `FoundationWallPassed`; test Soát vé → 0, học 18 viên → +90, Soát vé rồi học F13 → +5. | patch |
| V2 | vgap | Luật cấm khuyết thiếu bỏ sót "May" đầu câu | medium | Trùng B12. | patch |
| V3 | vgap | Thư một lần ở màn ăn mừng chỉ kiểm tay | medium | Gap đã xác minh; cần test component hoặc tách quyết định thành hàm thuần, repo chưa có hạ tầng (cùng loại mục defer story 23, 24). | defer |
| C1 | content | "has gone" xếp Quá khứ | medium | Trùng B5. | patch |
| C2 | content | `f17-c1` "We live in Hue." mơ hồ | medium | Trùng B4. | patch |
| C3 | content | Màn faded F17 bắt tự gõ dạng | low | Màn faded là bắt buộc (6 màn), thẻ quy tắc frozen cũng là cloze. Gợi ý đổi thành "chọn một trong go / goes / going / went / gone" để vẫn là nhận ra. | patch |
| C4 | content | Áp dụng F17 bảo xem dạng động từ trong thẻ từ (không có) | medium | Thẻ từ không có trường dạng động từ. Bỏ câu đó. | patch |
| C5 | content | F18 cụm cố định trái luật | medium | Trùng B2. | patch |
| C6 | content | Định nghĩa "trạng từ tần suất" thiếu "sau am / is / are" | low | Thêm vào định nghĩa (≤ 25 chữ). | patch |
| C7 | content | Câu ví dụ từ chủ đề dùng ngữ pháp chưa tới | false | Trùng B1. | reject |
| C8 | content | "động từ thường" không được định nghĩa | medium | Trùng B8. | patch |
| C9 | content | F13 sai về tiếng Việt | medium | Trùng B6. | patch |
| C10 | content | F18 không phân biệt usually / often | low | Thêm "từ nhiều tới ít" và "usually (thường, gần như luôn)". | patch |
| C11 | content | "on Saturday" cho thói quen; "football" kiểu Mỹ | low | "on Saturday" vẫn dùng được cho thói quen trong văn nói; người học hiểu football = bóng đá. Không đáng đổi câu đã qua test trùng lặp. | reject |
| C12 | content | `f18-c2` có thứ tự thứ hai | low | Trùng B3. | patch |
| C13 | content | F13 Áp dụng nói "nguyên âm" như chữ cái | low | Sửa "bắt đầu bằng âm nguyên âm /e/" theo F11. | patch |
| C14 | content | F13 thiếu "you're" | low | Decisions F13 liệt kê you're. Thêm. | patch |
| C15 | content | F14 dịch "How much is it?" là "Cái này…" | low | Đổi thành "Nó bao nhiêu tiền?". | patch |
| C16 | content | Gợi ý F16 "they không phải ngôi thứ ba số ít" dễ hiểu lầm | low | Đổi thành "they là số nhiều nên giữ have." (F16 vẫn có chữ "ngôi thứ ba số ít" ở worked). | patch |
| C17 | content | Tag `q-f16-02` | low | Trùng B14. | patch |
| C18 | content | Câu quiz gần trùng câu viên | low | Đạt luật "không lặp nguyên văn" (test có); viết lại thêm 3 câu quiz chỉ giảm nhẹ thuộc lòng. | reject |
| C19 | content | Câu nghe `q-f13-03`, `f13-c3` khó nghe | low | Có, nhưng vẫn trả lời được; là câu nghe theo phân bố spec. | reject |
| C20 | content | Định nghĩa thuật ngữ quá đà (IPA, nguyên âm, chủ ngữ, mạo từ, ngôi thứ ba) | low | Sửa IPA (có dấu ˈ, ː), nguyên âm, chủ ngữ ("mà câu nói về"), mạo từ ("người nói và người nghe đều biết"). "work thành works" giữ vì chip này dùng ở T1. | patch |
| C21 | content | "động từ nguyên mẫu" dễ lẫn với "to + V" | low | Thêm "không có to" ở explain F17 và định nghĩa `base-form`. | patch |
| C22 | content | F18 không có in + năm | low | Decisions frozen F18 chỉ: giờ, thứ, tháng. | reject |
| C23 | content | Bản quyền / trần ngữ pháp: không lỗi | false | Reviewer tự xác nhận không có vấn đề. | reject |

Kết quả: 56 dòng: 35 patch (gộp theo gốc còn 25 lỗi), 1 defer (V3), 20 reject. Không có intent_gap / bad_spec, không sửa vùng frozen. Sau patch: `npm run lint`, `npm test` (64 file, 1476 test), `npm run build` (check-precache OK) pass; `npm run vocab:label-examples` 0 todo, file không đổi; grep `destructive` không kết quả.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass (gồm `check-precache`).
- `npm run vocab:label-examples` -- expected: exit 0, 0 `todo`; chạy lại thì `git diff --exit-code scripts/vocab/example-labels.json` sạch (so với lần chạy trước).
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/data/foundation src/data/questions src/data/lessons src/data/vocab src/lib/foundation src/lib/trophies src/lib/flashcard-session.test.ts src/app src/components/quiz` -- expected: pass, có ca cho mỗi dòng Matrix có logic hoặc dữ liệu.
- `grep -rn "destructive" src/components/foundation src/pages/Foundation*.tsx` -- expected: không có kết quả.

**Manual checks:**
- Headless Chrome 375px:
  - bức tường đủ 18 viên, không "Đang soạn";
  - chạy hết 6 màn F13 … F18 (sai một câu thì có giải thích và làm lại; `sort` F17, `order` F18 chạy được);
  - store đủ 4 hàng: nút "Qua bức tường" ở trang viên, Hôm nay; màn ăn mừng có cú bay lần đầu, mở lại không có; Phòng Cúp có ô "Lên tàu Năm 1" và điểm viên gạch;
  - bài `s1-t1-w1`: chip S / danh từ mở Sheet, nút "Mở viên F08" chuyển đúng;
  - `scrollWidth` = 375 ở mọi trang trên.
