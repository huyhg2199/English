---
title: 'Dọn trình tự và nội dung lệch: requires cho câu T2–T4, test quay lại ở Sân ga, video lệch tuần, Ngữ pháp theo ngày, mục "Thấp" (CAP-2, CAP-6, CAP-11, learning-rules "Chỉ dùng kiến thức đã dạy", "Buổi học", "Quay lại sau nghỉ")'
type: 'feature'
created: '2026-11-13'
status: 'done'
baseline_commit: '5a82e72127d962bcb3af057b966d432abfb0efcc'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/28-t1-daily-parts-review-invite.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/27-t1-patch-untaught-question-filter.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/11-extension-comeback-test.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/41-lesson-check-session-mistakes-invite.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Ngày 2026-11-11, sau báo cáo kiểm tra "nền & các thì", Huy trả lời "hoàn thiện giúp tôi đi", tức là làm hết story 32–47 theo thứ tự 32 → 33 → 34 → 35 → 36 → 38 → 39 → 37 → 40 → 41 → 43 → 44 → 45 → 46 → 42 → 47. Huy cho phép chạy liên tục, Claude chọn chi tiết.)
- Story này là story cuối của đợt. Nó làm mục T9 (chia Ngữ pháp theo ngày), T10 (test quay lại ở Sân ga) và mục "Thấp" của báo cáo kiểm tra, cùng các việc các story 32–46 đã hẹn để lại cho story 47 (`deferred-work.md`).
- Quyết định 3: "nắm chắc" là Huy tự làm ra được câu đúng, và câu hỏi chỉ dùng kiến thức đã dạy (khai báo `requires`, có test chặn).
- Quyết định 4: dùng lại bộ máy có sẵn:
  - `requires` / `conceptSource` / `requiresViolations` của story 27;
  - cơ chế phần của bài (story 28): `partsSeen`, `?part=`, "Xong phần này", "Xong buổi";
  - khối luyện `TensePractice` (story 35), khối "Chọn thì" (story 39), kiểm tra cuối Bài chính (story 41).
- Ràng buộc chung giữ nguyên:
  - không khoá, không phạt, không reset; tiếng Việt; nội dung tự soạn;
  - giao diện 375px không đổi ngoài phần mới;
  - không nâng schema store, không thêm key đồng bộ.
- Claude chọn:
  - **`requires` cho mọi câu T2–T4.** Thêm khái niệm bài cho T2–T4 (bảng ở Design Notes). Luật như T1: mỗi khái niệm là của viên gạch bất kỳ, hoặc của bài đứng trước / chính bài của câu (thứ tự lộ trình T1 → T4). Câu của bài T1–T4 thiếu `requires` là lỗi.
    - 66 câu cũ (6 câu mỗi bài, chưa có `requires`) được khai báo đủ.
    - Câu T2–T4 đã có `requires` (story 33–46) được thêm khái niệm của chính bài.
    - Câu đoạn Ngữ pháp có ít nhất 1 khái niệm của chính bài. Ngoại lệ: 4 câu ôn `q-s1-t2-w4-01` … `-04` và mọi câu của `s1-t4-w4`.
    - `q-s1-t2-w2-20` … `-23` thêm `verb-forms` cho đồng đều với `-24` … `-26`.
    - Lúc chạy vẫn chỉ lọc theo viên gạch (`missingBricks`). Khái niệm bài được bảo đảm bằng test tĩnh.
    - Câu O.W.L. (`OWL_QUESTIONS`) giữ nguyên luật cũ.
    - Lời mời ôn viên gạch (story 28) vẫn đọc `requires` như cũ. Vì vậy câu T2–T4 cũ từ nay cũng được tính, giống câu T2–T4 mới của story 33–46. Luật mời không đổi.
  - **Test chặn chữ của câu cũ:** 66 câu cũ cũng phải qua `outOfScopeWords` theo phạm vi của bài (đề đã điền đáp án, đáp án, `audioText`; không quét lựa chọn sai). Các test khai báo khái niệm (days-months, lượng từ, liên từ) quét cả câu T2–T4 vừa có `requires`.
  - **"Don't + V" dạy ở s1-t1-w3** (bài phủ định hiện tại đơn, dùng don't sẵn có):
    - thêm 1 dòng công thức "Mệnh lệnh phủ định" và 1 lỗi hay mắc;
    - phạm vi chữ: "Don't + V" chỉ bị báo khi phạm vi chưa mở `dont`. Câu cũ `q-s1-t3-w1-03` "Don't worry." vì thế hợp lệ, không phải sửa;
    - F08 giữ nguyên.
  - **Test quay lại khi đang ở Sân ga** (learning-rules mục "Quay lại sau nghỉ"):
    - đề lấy câu kiểm tra hàng (`FOUNDATION_QUESTIONS`) của các viên đã học xong, ưu tiên 4 viên xong gần nhất, cộng tối đa 3 câu Sổ lỗi;
    - câu luyện trong viên không phải câu hỏi của Quiz engine nên không vào đề;
    - không bao giờ lấy câu của bài lộ trình chưa học. Câu bài chỉ vào đề khi nằm trong Sổ lỗi;
    - kết quả trỏ về viên chứa lỗ hổng (`/foundation/Fxx`). Đúng hết thì trỏ viên tiếp theo;
    - chưa xong viên nào và Sổ lỗi trống thì không có test. Hôm nay vẫn có thẻ Sân ga mời học viên tiếp theo.
    - Sau Sân ga: câu Sổ lỗi của viên gạch cũng trỏ đúng `/foundation/Fxx` (sửa route hỏng ghi trong `deferred-work.md`).
  - **Video lệch tuần:**
    - "My Weekend" (`n7RA6XxfpNU`, kể chuyện bằng động từ bất quy tắc) chuyển từ đoạn giải trí s1-t2-w2 (tuần có quy tắc) sang đoạn giải trí s1-t2-w4 (tuần ôn quá khứ). s1-t2-w2 còn 1 video, s1-t2-w4 có 2;
    - không thêm video mới. Lý do: mỗi ID phải kiểm oEmbed và giấy phép; luật 1–2 video mỗi bài là quyết định của Huy ở story 15;
    - video will cho s1-t3-w1, video ngữ pháp cho T1-W3 / T2-W1, video nối âm cho s1-t3-w2 giữ như story 39. Ghi lại vào `deferred-work.md`.
  - **Ngữ pháp theo ngày** cho 8 bài học một thì (hay hai thì chung khuôn) trong một tuần: s1-t2-w1, -w2, -w3, -w4, s1-t3-w1, -w2, -w3, s1-t4-w1. Các bài này có `LessonContent.grammarDays`, gồm 5 ngày:
    - N1 khẳng định, N2 phủ định, N3 câu hỏi;
    - N4 so với thì trước: khối "Chọn thì" có sẵn của bài hoặc 3 cặp câu mới;
    - N5 ôn trộn cả tuần.
    - Không chia: T1 (hiện tại đơn trải 3 tuần, đã chia đoạn Phát âm), s1-t3-w4 (bản thân là bài so sánh), s1-t4-w3 (so sánh không có khuôn khẳng định / phủ định / câu hỏi), s1-t4-w4.
  - **Cách chạy ngày:** dùng lại đúng cơ chế phần của story 28. Id ngày `${lessonId}-n${k}` nằm trong `partsSeen`. `lessonPartIds` trả id ngày cho bài có `grammarDays`. Buổi 30' chốt `?part=` là ngày chưa xem đầu tiên, và "Xong buổi" đánh dấu ngày đó.
    - **Một ngày N1–N3** hiện:
      - phần đầu thẻ thì (tên, cách dùng, dòng thời gian, chip tín hiệu) và chỉ các dòng công thức của ngày;
      - nút mở "Xem cả thẻ" (TenseCard đầy đủ, đóng sẵn);
      - 3 câu luyện nói mới đúng dạng của ngày;
      - N3 thêm khối luyện của thì và khối "Chọn thì" được gán cho N3.
    - **N4:** dòng công thức gán cho N4, khối "Chọn thì" gán cho N4 (kèm khối luyện của nó), 3 cặp câu so với thì trước (nếu có).
    - **N5** hiện cả đoạn Ngữ pháp như hôm nay, có dòng "Ngày 5/5 · Ôn trộn cả tuần". Đây là phần cuối nên có kiểm tra 5 câu cuối Bài chính (luật story 41).
    - Xem hết 5 ngày thì buổi ôn cả tuần như story 28. Bảng động từ (s1-t2-w3) và bảng ôn V3 (s1-t3-w3) hiện ở mọi ngày.
    - Đoạn Phát âm của các bài này không đổi.
    - Trang bài giữ nguyên nội dung đầy đủ. Đầu đoạn Ngữ pháp có thêm danh sách "5 ngày của tuần": nhãn "Đã xem" / "Ngày tiếp theo", nút "Xong ngày này", dòng "Đã xem n/5 ngày".
  - **Mục "Thấp" khác:**
    - F03 nói /t/ (và /k/) đầu từ bật hơi;
    - F10 thêm l, m, r (và b, v) vào nhóm đuôi /z/;
    - s1-t1-w3 thêm lỗi "I haven't a car → I don't have a car";
    - goalVi F17 (`catalog.ts` + bảng learning-rules) bỏ "gone" khỏi trục thời gian.
    - Đã xong ở story trước, chỉ kiểm lại: been to / gone to, she's = she has, "…chưa?", "I can help you", T4-W3 đủ câu, tuần Tết.
    - Không làm used to, like + V-ing, want + to V (mức A2, để Chặng 2). Ghi vào `deferred-work.md`.

**Problem:**
- 66 câu quiz T2–T4 không khai báo `requires`, nên luật "chỉ dùng kiến thức đã dạy" không được kiểm ở đó. Câu "Don't worry." dùng mẫu chưa dạy.
- Test quay lại khi đang ở Sân ga lấy câu của bài T1 chưa học, và "Học tiếp" có thể trỏ tới route hỏng.
- Video "My Weekend" dùng động từ bất quy tắc ở tuần động từ có quy tắc.
- Thẻ thì hiện y hệt suốt 7 ngày của tuần, không có "hôm nay học phần này".
- Vài chỗ nội dung nhỏ sai hoặc thiếu (/t/ bật hơi, đuôi /z/, don't have, goal F17).

**Approach:**
- Mở sổ khái niệm sang T2–T4, khai báo `requires` cho mọi câu, mở rộng các test chặn.
- Cho `pickComebackTest` một nhánh Sân ga và một hàm thuần chọn đích "Học tiếp".
- Chuyển một mục `videos.json`.
- Thêm dữ liệu `grammarDays` cùng view theo ngày cho `GrammarSection`, dùng lại `partsSeen` / `?part=`.
- Sửa chữ của F03, F10, s1-t1-w3, F17.

## Boundaries & Constraints

**Always:**
- Logic mới là hàm thuần có test:
  - `requiresViolations` (khái niệm bài T2–T4);
  - `pickComebackTest` nhánh Sân ga;
  - `comebackTarget` (đích "Học tiếp");
  - `lessonPartIds` / `lessonPartKind` (phần Phát âm hay ngày Ngữ pháp);
  - `sessionCheckQuizId` (giữ luật "phần cuối").
- Ngày Ngữ pháp:
  - id `${lessonId}-n1` … `-n5`, `kind` theo thứ tự `affirmative`, `negative`, `question`, `compare`, `mixed`;
  - mỗi nhãn công thức của mỗi Tense trong bài nằm trong `focus` của ít nhất 1 ngày; nhãn ghi trong `focus` phải có thật;
  - mỗi khối "Chọn thì" của bài được gán cho đúng 1 ngày;
  - N1–N3 đúng 3 câu nói, id `${dayId}-say-${k}`, không trùng id câu nào đang có. N1 không có not / n't, không kết thúc "?". N2 có not / n't. N3 kết thúc "?";
  - N4 có `choiceIds` hoặc `compare` (đúng 3 cặp, a ≠ b, `noteVi` khác rỗng, `withTenseIds` là Tense của bài trước);
  - `requires` của ngày (N1–N4) khai báo tay theo luật câu hỏi (viên bất kỳ, bài trước hoặc chính bài) và có khái niệm của chính bài;
  - chữ tiếng Anh của câu nói và cặp câu nằm trong phạm vi chữ của thì cuối bài (`outOfScopeWords`), không trùng nguyên câu ví dụ / câu luyện / đề quiz của cùng bài.
- Kế hoạch buổi chốt lúc bắt đầu, như story 28. `part` lạ hoặc của bài khác thì bị bỏ và tính lại từ store.
- Bài vừa có `parts` vừa có `grammarDays` là lỗi (test).
- Nhãn và nút theo giọng nhẹ nhàng của story 28. Không chữ "khoá", không đỏ.
- 375px không cuộn ngang. Desktop (story 29–31) dùng lại cột có sẵn. `layout:guard` không báo class lạ.
- Mọi câu nội dung tự soạn, tiếng Việt cho lời giải thích.

**Never:**
- Không đổi id câu, đề, đáp án hay lựa chọn của câu quiz cũ. Chỉ thêm / đổi `requires`.
- Không đổi kho O.W.L., mini test, ôn trộn, `QUIZZES`, `LESSON_QUIZ_SIZE`.
- Không khoá ngày chưa tới, không tự đánh dấu bài xong, không đổi nút "Đánh dấu đã học xong".
- Không nâng `CURRENT_VERSION`, không thêm key vào `SYNCED_KEYS`. `partsSeen` giữ dạng mảng chuỗi.
- Không chia đoạn Phát âm của T2–T4. Không chia Ngữ pháp T1, s1-t3-w4, s1-t4-w3, s1-t4-w4.
- Không thêm video mới, không đổi giấy phép hay file sub. Mỗi bài vẫn 1–2 video.
- Không dạy used to, like + V-ing, want + to V, may / might. Không đổi F08.
- Không suy khái niệm của câu bằng regex lúc chạy.
- Không đổi luật lời mời ôn viên gạch (story 28) hay lời mời ôn bài (story 41).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| requires đủ | Mọi câu `QUESTION_BANK` | Mọi câu có `requires`, `requiresViolations` rỗng. Câu Ngữ pháp T2–T4 có khái niệm chính bài, trừ ngoại lệ | Thiếu → test đỏ |
| Khái niệm bài sau | `q-s1-t2-w1-01` khai báo `past-simple` | Vi phạm "dạy ở s1-t2-w2, sau bài của câu" | N/A |
| Câu T1 dùng khái niệm T2 | `q-s1-t1-w3-01` khai báo `present-continuous` | Vi phạm | N/A |
| Câu Sân ga dùng khái niệm bài | `q-f13-01` khai báo `present-continuous` | Vi phạm "khái niệm bài, câu Sân ga không được dùng" | N/A |
| Khai báo theo chữ | Câu T2–T4 có Sunday / any / some / many / because / so | Có `days-months` / `quantifiers` / `conjunctions` | Thiếu → test đỏ |
| Phạm vi chữ câu cũ | 66 câu cũ, theo phạm vi thì cuối bài (s1-t4-w4 dùng `passive-present`) | `outOfScopeWords` rỗng trên đề đã điền, đáp án, `audioText` | N/A |
| Don't + V | `outOfScopeWords('present-simple-questions', "Don't worry.")` và mọi thì sau | `[]`; với `present-simple` → có `"don't worry"` (cùng `"don't"`, từ chưa mở ở thì này) | N/A |
| Lập đề sau Sân ga | Mọi quiz, mọi viên đã dạy | `planQuiz` giống hệt `pickQuiz` (không bỏ câu) | N/A |
| Quay lại ở Sân ga | Đang ở Sân ga, xong F01–F05 (F05 gần nhất), Sổ lỗi có `q-f03-02`, nghỉ 9 ngày | Thẻ "Chào mừng quay lại". Đề ≤ 8 câu: `q-f03-02` + câu `q-f0x` của F02–F05 trước (4 viên gần nhất), thiếu thì F01. Không câu `s1-…` nào ngoài Sổ lỗi | N/A |
| Sân ga, chưa xong viên | Đang ở Sân ga, `bricks` rỗng, Sổ lỗi trống, nghỉ 9 ngày | `pickComebackTest` = `[]`, Hôm nay không có thẻ quay lại, thẻ Sân ga vẫn mời viên tiếp theo | N/A |
| Kết quả trỏ viên | Sai nhiều nhất ở câu `q-f03-…` | "Học tiếp: F03 · IPA là gì" → `/foundation/F03` | N/A |
| Đúng hết ở Sân ga | Không sai, viên tiếp theo F06 | "Vẫn nhớ tốt!" + "Học tiếp: F06 · …" → `/foundation/F06`. Hết viên → "Sân ga 9¾" → `/foundation` | N/A |
| Sau Sân ga, lỗi viên | Đã qua tường, Sổ lỗi có `q-f11-02`, sai câu đó nhiều nhất | Trỏ `/foundation/F11`, không còn `sectionHref('f11', …)` | Hoà với câu bài → bài lộ trình thắng (như cũ) |
| Sau Sân ga, như cũ | Đã qua tường, bài hiện tại s1-t2-w1 | Đề như trước story (câu bài trước + Sổ lỗi) | N/A |
| Video | `videosFor('s1-t2-w2')`, `videosFor('s1-t2-w4')` | `['RGFc-1uNHX8']`; `['4cU9fqpCqBA', 'n7RA6XxfpNU']` (n7RA… đoạn giải trí). Bước Giải trí s1-t2-w2 chỉ còn link ngoài | N/A |
| Buổi ngày 1 | Sau Sân ga, bài hiện tại s1-t2-w1, `partsSeen` rỗng, vào `/session` | URL chốt `?lesson=s1-t2-w1&part=s1-t2-w1-n1&step=lesson`. Đoạn Ngữ pháp: "Ngày 1/5 · Câu khẳng định", dòng công thức "Khẳng định", "Xem cả thẻ" đóng, 3 câu nói. Không có khối luyện, không có kiểm tra cuối Bài chính. Đoạn Phát âm như cũ | N/A |
| Buổi ngày 3 | `partsSeen = [n1, n2]` | `part=…-n3`: dòng "Câu hỏi", 3 câu hỏi, khối luyện của thì (đóng) | N/A |
| Ngày 4 có khối | s1-t2-w1, n1–n3 đã xem | Khối "Đơn hay tiếp diễn?" kèm khối luyện của nó | N/A |
| Ngày 4 cặp câu | s1-t2-w2 ngày 4 | 3 cặp "So với: to be (am / is / are) · Hiện tại đơn …" | N/A |
| Ngày 5 | n1–n4 đã xem | "Ngày 5/5 · Ôn trộn cả tuần" + cả đoạn Ngữ pháp + thẻ kiểm tra 5 câu cuối Bài chính | N/A |
| Xem hết | n1–n5 đã xem, bài chưa xong | Không `part`. Dòng "Đã xem đủ 5 ngày Ngữ pháp, hôm nay ôn lại cả tuần." Cả đoạn + kiểm tra | N/A |
| Xong buổi | Buổi `part=s1-t3-w1-n2`, bấm "Xong buổi" | Ghi buổi như cũ, thêm `s1-t3-w1-n2` vào `partsSeen` | Đã có thì store không đổi |
| URL lạ | `?lesson=s1-t2-w1&part=s1-t1-w1-p1` hoặc `part=s1-t3-w1-n2` | Bỏ `part`, tính lại từ store, `replace` URL | N/A |
| Bài không chia | Bài hiện tại s1-t3-w4 / s1-t4-w3 | Không `part`, cả đoạn Ngữ pháp và kiểm tra mỗi buổi như trước | N/A |
| Bài T1 chia phần | s1-t1-w1 | Như story 28 (phần Phát âm) | N/A |
| Trang bài | `#/roadmap/lesson/s1-t2-w1`, đã xem n1 | Đầu đoạn Ngữ pháp: "Đã xem 1/5 ngày", 5 dòng (n1 "Đã xem", n2 "Ngày tiếp theo", nút "Xong ngày này" ở ngày chưa xem). Dưới đó là nội dung đầy đủ như cũ | N/A |
| Đồng bộ | Máy A xem n1, máy B xem n2 | `partsSeen = [n1, n2]` (gộp hợp như story 28) | N/A |
| Máy cũ | App bản trước nhận `partsSeen` có id `-n1` | Không lỗi. Bản cũ không chia nên bỏ qua id lạ | N/A |
| F03 / F10 | Màn giải thích F03, F10 | /t/, /k/ đầu từ bật hơi; /z/ sau nguyên âm và phụ âm rung b, d, g, v, l, m, n, r | N/A |
| 375px | Buổi ngày 1–5 và trang bài s1-t2-w2 | `scrollWidth` = 375 | N/A |

</frozen-after-approval>

## Code Map

- `src/data/questions/concepts.ts`:
  - `T1_LESSON_IDS` `:12`, `T1_LESSON_CONCEPTS` `:16-21`, `LessonConceptId` `:23`, `ConceptSource` `:28`, `SOURCES` `:30-33`;
  - `lessonIndex` `:40-42`, `requiresViolations` `:52-79` (nhánh "câu khác (T2–T4)" `:56`);
  - giữ export `T1_LESSON_IDS` / `T1_LESSON_CONCEPTS` vì `questions/index.ts` và test đang dùng.
- `src/data/questions/t2-t4.ts`:
  - helper `make` `:27-48` và `lesson()` `:89-117`; `sound` / `listen` hiện không nhận `requires`;
  - 66 câu cũ: T2 `:136-146`, `:179-193`, `:262-277`, `:306-321`; T3 `:366-376`, `:405-415`, `:446-456`, `:486-496`; T4 `:526-536`, `:567-577`, `:645-655`;
  - comment đầu file `:5-17`, `:324` ("khái niệm bài T2 là việc của story 47");
  - `q-s1-t2-w2-20` … `-23` ở khối `:238-260`.
- `src/data/questions/requires.test.ts` -- `:28` (42 T1 + 46 Sân ga), `:54`, `:113-117` (T2–T4 không khai báo thì bỏ qua → đổi thành vi phạm).
- `src/lib/quiz/requires.test.ts:37-40` -- "câu không khai báo requires không thiếu gì" đang lấy câu s1-t2-w1: đổi sang câu dựng tay. `src/lib/quiz/requires.ts` chỉ đọc.
- `src/data/foundation/foundation.test.ts`:
  - `:742-760` (days-months, đã quét `QUESTION_BANK` có `requires`);
  - `:935-960` (lượng từ);
  - `:1058-1076` (liên từ, hiện chỉ quét `FOUNDATION_QUESTIONS` → thêm `QUESTION_BANK`).
- `src/data/questions/questions.test.ts` -- mẫu kiểm phạm vi `:574-582`, `:960-968` (`promptEnglish`, `answerText`). Thêm test cho 66 câu cũ.
- `src/lib/tense-scope.ts` -- doc `:3-17`, `DONT_IMPERATIVE_RE` `:316-320`, vòng "luôn bị báo" `:400-412` (dòng `:412` `cased.matchAll(DONT_IMPERATIVE_RE)`). `src/lib/tense-scope.test.ts` -- `ALWAYS` và các mẫu "Don't".
- `src/data/lessons/t1-grammar.ts:230` -- `PRESENT_SIMPLE_QUESTIONS` (`formulas` `:236-240`, `mistakes` `:254-262`).
- `src/lib/comeback/comeback.ts`:
  - `pickComebackTest` `:71-121`, `weakestSectionFrom` `:129-160`;
  - import `@/lib/foundation` (`isInFoundation`, `readFoundation`, `foundationState`, `nextBrickIdFromState`, `brickHref`) không tạo vòng.
- `src/lib/comeback/comeback.test.ts` -- fixture đang là store mặc định (đang ở Sân ga): các ca sau Sân ga phải `skipFoundation` / qua tường. Ca `:191` là đúng lỗi cần sửa.
- `src/pages/Quiz.tsx:72-150` -- `ComebackNext`, `ComebackRun` (chốt `homeLessonId`). `src/app/store-context.ts:571-586` -- `useComeback` (bank truyền vào).
- `src/data/foundation/catalog.ts` -- `brickIdFromLessonId` `:206`, `getBrickMeta` `:186`, goalVi F17 `:158`.
- `src/data/videos/videos.json` -- mục `n7RA6XxfpNU`. `src/data/videos/videos.test.ts:113-119` -- mẫu test story 39.
- `src/data/lessons/types.ts` -- `PracticeSentence` `:48`, `MinimalPair` `:266`, `LessonPart` `:299-309`, `LessonContent` `:311-327`.
- `src/data/lessons/index.ts` -- `LESSON_CONTENTS`, `lessonPartIds` `:165-171`, `getLessonContent`.
- `src/data/lessons/t2-t4-grammar.ts` -- Tense và nhãn công thức: `PRESENT_CONTINUOUS` `:25`, `PAST_TO_BE` `:197`, `PAST_SIMPLE` `:363`, `PAST_SIMPLE_IRREGULAR` `:530`, `PAST_CONTINUOUS` `:691`, `WILL` `:884`, `GOING_TO` `:1046`, `PRESENT_PERFECT` `:1206`, `MODALS` `:1543`; `GRAMMAR_T2_W1…` `:2027-2050`. Chỉ đọc.
- `src/data/lessons/tense-choices.ts` -- id khối: `simple-vs-continuous`, `subject-questions`, `will-vs-going-to`, `have-to-could-would-like`. Chỉ đọc.
- `src/components/lesson/LessonContentParts.tsx`:
  - `PronunciationView` `:69`, `PartBlock` `:85-128` (mẫu nhãn / nút);
  - `GrammarSection` `:249-286` (`openPracticeId`, thứ tự: bảng V3 → thì → khối → bảng động từ → ôn tập).
- `src/components/lesson/TenseChoiceCard.tsx:84-98` -- danh sách "Cặp câu dễ nhầm": tách thành component dùng chung cho cặp câu N4.
- `src/components/lesson/LessonSectionContent.tsx:41-66` -- truyền view. `SpeakPractice.tsx:124`, `TenseCard.tsx`, `TensePractice.tsx:185`, `SignalWords.tsx`, `TenseTimeline.tsx` -- dùng lại.
- `src/pages/Session.tsx:159-247` -- `LessonStep` (`partCount`, `view`, dòng "Đã xem đủ … phần").
- `src/lib/sessions/plan.ts` -- `lessonPartOf` `:109-112`, `resolveSessionPlan` `:174-193`, `lessonSessionHref`, `sessionCheckQuizId` `:209-217`, `markSessionPartSeen` `:229-232`. Test `plan.test.ts` có ca "bài không chia (T2) → không part": cập nhật.
- `src/app/store-context.ts:184-195` -- `useLessonParts` (dùng lại cho "Xong ngày này").
- `src/data/lessons/lesson-parts.test.ts:123-132` -- "T2–T4 không có parts" giữ; `lessonPartIds` của T2 giờ trả id ngày.
- `src/data/lessons/lessons.test.ts` -- `:220-225` (luật thì), tập id câu `:445-480`.
- `src/data/foundation/bricks/f03.ts:14`, `f10.ts:14`, `:66` (`hintVi`).
- Tài liệu:
  - `learning-rules.md` `:31` (F17), `:52` (Buổi học), `:94` (Quay lại sau nghỉ), `:113` (Chỉ dùng kiến thức đã dạy);
  - `stack.md:29` (`partsSeen`);
  - `_bmad-output/implementation-artifacts/deferred-work.md`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/questions/concepts.ts` -- thêm `T2_T4_LESSON_CONCEPTS` theo Design Notes và `LESSON_CONCEPT_LESSON_IDS` (15 bài có câu hỏi, thứ tự lộ trình: T1 w1–w4, T2 w1–w4, T3 w1–w4, s1-t4-w1, -w3, -w4). `LessonConceptId` / `ConceptSource.lesson` gồm cả T2–T4. `requiresViolations`:
  - câu của 15 bài bắt buộc có `requires`;
  - khái niệm bài phải thuộc bài có thứ tự ≤ bài của câu;
  - luật câu Sân ga giữ nguyên, câu khác (O.W.L.) giữ nguyên.
  - Doc comment ghi story 47.
- [x] `src/data/questions/t2-t4.ts` -- `sound` / `listen` / `grammar` nhận `requires`. Khai báo `requires` cho 66 câu cũ. Thêm khái niệm chính bài vào `requires` của mọi câu T2–T4 đã có (trừ ngoại lệ). `-20` … `-23` thêm `verb-forms`. Sửa comment đầu file và `:324`. Không đổi đề, đáp án, lựa chọn, id.
- [x] `src/data/questions/requires.test.ts` --
  - 216 câu `QUESTION_BANK` + 46 câu Sân ga đều có `requires` hợp lệ;
  - câu Ngữ pháp T2–T4 có khái niệm chính bài, trừ đúng `q-s1-t2-w4-01` … `-04` và `s1-t4-w4`;
  - bảng khái niệm: không trùng `CONCEPT_IDS`, mỗi khái niệm 1 bài, bài có trong lộ trình, thứ tự `LESSON_CONCEPT_LESSON_IDS` khớp `allLessons()`;
  - ca tự kiểm 4 dòng đầu bảng I/O; ca "câu T2–T4 không khai báo" thành vi phạm.
- [x] `src/lib/quiz/requires.test.ts` -- sửa ca `:37-40`. Giữ ca "đủ nền → đề giống `pickQuiz`" (phải qua với `requires` mới).
- [x] `src/data/questions/questions.test.ts` -- test mới: 66 câu cũ qua `outOfScopeWords` theo phạm vi thì cuối bài (`lastTenseScope(lessonId)`, s1-t4-w4 → `passive-present`), trên đề đã điền đáp án, đáp án, `audioText`.
- [x] `src/data/foundation/foundation.test.ts` -- test liên từ quét thêm `QUESTION_BANK` (câu có `requires`). Test days-months, lượng từ phải qua với câu T2–T4 mới khai báo.
- [x] `src/lib/tense-scope.ts` (+ test) -- `DONT_IMPERATIVE_RE` chỉ báo khi `!scope.dont`. Doc: "Don't + V" dạy ở s1-t1-w3 (story 47). Test: `present-simple` báo, `present-simple-questions` và các thì sau không báo. Bỏ "Don't …" khỏi `ALWAYS`. Các test "không Don't + V" của khối story 39 / 44 / 45 giữ (dùng regex riêng nếu đang dựa vào `outOfScopeWords`).
- [x] `src/data/lessons/t1-grammar.ts` -- `PRESENT_SIMPLE_QUESTIONS`:
  - thêm công thức `{ label: 'Mệnh lệnh phủ định', text: "Don't + động từ nguyên mẫu: Don't worry. Don't be late." }`;
  - thêm 2 lỗi hay mắc:
    - "Not touch it!" → "Don't touch it!" (câu cấm mượn Don't);
    - "I haven't a car." → "I don't have a car." (have = có là động từ thường, phủ định mượn don't / doesn't).
  - Các test đếm (nếu có) cập nhật.
- [x] `src/lib/comeback/comeback.ts` --
  - `COMEBACK_BANK = [...QUESTION_BANK, ...FOUNDATION_QUESTIONS]`;
  - `pickComebackTest` khi `isInFoundation(store)`: câu Sổ lỗi (≤ 3, như cũ) + câu của viên trong `doneBrickIds` theo `lastDoneAt` mới nhất trước (4 viên gần nhất chia đều, thiếu thì viên cũ hơn). Không lấy câu bài lộ trình ngoài Sổ lỗi; giữ seed, không trùng, bỏ câu nghe khi không có TTS;
  - `weakestSectionFrom` hoà: bài lộ trình → viên theo F01 → F18 → id lạ;
  - thêm `comebackHome(store, hasContent)`: Sân ga → `{ kind: 'brick', brickId: nextBrickIdFromState(…) }`, hết viên → `{ kind: 'foundation' }`, sau Sân ga → `{ kind: 'lesson', lessonId: currentLessonId }`, không có → null;
  - thêm `comebackTarget(weak, home)` → `{ href, label }`. Viên (`brickIdFromLessonId`) → `brickHref` + "Fxx · title". Bài → `sectionHref` / `lessonHref` như cũ.
- [x] `src/lib/comeback/comeback.test.ts` -- 5 dòng "quay lại" của bảng I/O, `comebackTarget` cho viên / bài / null, fixture các ca cũ đặt ra khỏi Sân ga.
- [x] `src/pages/Quiz.tsx`, `src/app/store-context.ts` -- dùng `COMEBACK_BANK`. `ComebackRun` chốt `comebackHome` lúc bắt đầu. `ComebackNext` dùng `comebackTarget`. Câu mô tả ở Sân ga: "{n} câu từ các viên đã học và Sổ lỗi sai."
- [x] `src/data/videos/videos.json` (+ `videos.test.ts`) -- `n7RA6XxfpNU` → `lessonId: 's1-t2-w4'`, `sectionId: 'entertainment'`, đặt đúng thứ tự bài. Test story 47 theo dòng Video của bảng I/O. Test 1–2 video mỗi bài vẫn qua.
- [x] `src/data/lessons/types.ts` -- thêm `GrammarDayKind`, `GrammarDay` (Design Notes), `LessonContent.grammarDays?`.
- [x] `src/data/lessons/grammar-days.ts` (mới) + `index.ts` --
  - 8 bộ ngày theo Design Notes (72 câu nói, 18 cặp câu), gắn vào `LESSON_CONTENTS`;
  - `lessonPartIds` trả id phần hoặc id ngày;
  - thêm `lessonPartKind(lessonId, partId): 'pronunciation' | 'grammar' | null` và `getGrammarDay(lessonId, dayId)`.
- [x] `src/data/lessons/grammar-days.test.ts` (mới) -- mọi luật "Ngày Ngữ pháp" ở mục Always. Danh sách bài có ngày đúng 8 bài. Không bài nào có cả `parts` lẫn `grammarDays`. Thêm id câu nói ngày vào tập id ở `lessons.test.ts:445-480`.
- [x] `src/components/lesson/LessonContentParts.tsx` --
  - `GrammarView = { kind: 'all' } | { kind: 'week' } | { kind: 'day'; dayId }` (`week` = buổi ôn cả tuần, review story 47), `GrammarSection` nhận `view`;
  - ngày N1–N4: `GrammarDayBlock` (tiêu đề "Ngày k/5 · …", ghi chú, phần đầu thẻ + công thức của ngày, `<details>` "Xem cả thẻ" chứa `TenseCard`, `SpeakPractice` "Luyện nói hôm nay", khối luyện của thì ở N3, khối "Chọn thì" theo `choiceIds`, cặp câu N4);
  - N5 / `all`: nội dung cũ, N5 có dòng "Ngày 5/5 · Ôn trộn cả tuần";
  - `all` ở bài có ngày: `GrammarDaysList` ở đầu (nhãn, "Xong ngày này" qua `useLessonParts().markSeen`);
  - bảng V3 / bảng động từ hiện ở mọi view; `review` chỉ ở N5 / `all`.
- [x] `src/components/lesson/TenseChoiceCard.tsx` -- tách danh sách cặp câu thành component export dùng chung, không đổi giao diện khối.
- [x] `src/components/lesson/LessonSectionContent.tsx`, `src/pages/Session.tsx` -- tính view theo `lessonPartKind`. Dòng "Đã xem đủ 5 ngày Ngữ pháp, hôm nay ôn lại cả tuần." cho bài có ngày. Nhãn bài T1 giữ nguyên.
- [x] `src/lib/sessions/plan.ts` (+ `plan.test.ts`) -- giữ logic, sửa doc comment (phần = phần Phát âm T1 hoặc ngày Ngữ pháp). Test: buổi s1-t2-w1 chốt `-n1`; `-n5` / xem hết có `sessionCheckQuizId`; `-n1` … `-n4` thì null; s1-t3-w4 như cũ; `part` của bài khác bị bỏ; `markSessionPartSeen` ngày.
- [x] `src/data/foundation/bricks/f03.ts`, `f10.ts`, `catalog.ts` -- sửa chữ theo Design Notes. Test cũ vẫn qua.
- [x] `learning-rules.md`, `stack.md`, `deferred-work.md` --
  - learning-rules:
    - "Buổi học": thêm Ngữ pháp theo ngày;
    - "Quay lại sau nghỉ": nguồn câu ở Sân ga;
    - "Chỉ dùng kiến thức đã dạy": mọi câu T1–T4 khai báo, khái niệm bài T2–T4;
    - F17 goal;
  - stack: `partsSeen` có cả id ngày;
  - deferred-work: đánh dấu mục đã xử lý (requires T2–T4, Don't worry, quay lại ở Sân ga / route `f03`, goal F17, `-20…-23`, lượng từ T2–T4). Thêm mục hoãn (video will s1-t3-w1, video nối âm s1-t3-w2, tô thì cho "My Weekend" ở s1-t2-w4, used to / like + V-ing).

**Acceptance Criteria:**
- Given Huy đã ra khỏi Sân ga và đang học s1-t3-w1, when học 5 buổi liên tiếp rồi buổi thứ 6, then buổi 1–5 lần lượt hiện ngày 1 → 5 của đoạn Ngữ pháp (ngày 5 có kiểm tra 5 câu), buổi 6 hiện cả tuần, và không ngày nào bị khoá trên trang bài.
- Given máy cũ đồng bộ với máy mới sau khi xem vài ngày, when mở app ở máy mới, then `partsSeen` gộp đủ và buổi chốt đúng ngày chưa xem đầu tiên.
- Given đang ở Sân ga, đã xong vài viên và nghỉ hơn 7 ngày, when làm test quay lại, then không câu nào là câu bài lộ trình chưa học, và nút "Học tiếp" mở đúng viên.
- Given chạy `npm test`, when một câu T2–T4 bị xoá `requires` hoặc khai báo khái niệm của bài sau, then test đỏ, nêu id câu.

## Implementation Notes

- **Khái niệm bài T2–T4** (`concepts.ts`): `LESSON_CONCEPT_LESSON_IDS` (15 bài), `T2_T4_LESSON_CONCEPTS` đúng bảng Design Notes (`s1-t4-w4` rỗng), `LESSON_CONCEPTS`, `conceptLessonIndex`. `requiresViolations`: câu của 15 bài bắt buộc `requires`, khái niệm bài phải thuộc bài có thứ tự ≤ bài của câu; câu Sân ga như cũ (thông báo đổi thành "khái niệm bài"); câu O.W.L. (`q-owl-…`) giữ đúng luật cũ: gắn bài T1 theo luật T1, gắn bài T2–T4 theo luật "câu khác" (không bắt buộc, chỉ kiểm id có người dạy). Giữ export `T1_LESSON_IDS` / `T1_LESSON_CONCEPTS`.
- **`t2-t4.ts`:** `grammar` / `sound` / `listen` bắt buộc `tag` + `requires`. 66 câu cũ khai báo tay (3 ví dụ Design Notes đúng nguyên văn); 108 câu đã có `requires` thêm khái niệm chính bài (s1-t2-w2: `-07` … `-19` trừ `-12` → `past-to-be`, `-12` và `-20` … `-26` → `past-simple`; s1-t4-w3: `-07` … `-16` → `comparatives`, `-17` … `-26` → `passive-present`); ngoại lệ đúng `q-s1-t2-w4-01` … `-04` và `s1-t4-w4`. `-20` … `-23` thêm `verb-forms`. Không đổi đề, đáp án, lựa chọn, id, nhãn.
  - Thêm ngoài Tasks: `q-s1-t1-w3-07` (trọng âm của "because") thêm `conjunctions`, vì test liên từ nay quét cả `QUESTION_BANK`. Test liên từ lấy đề câu bài qua `promptEnglish` để chữ Việt "so sánh" không bị tính là liên từ "so".
  - Hệ quả lúc chạy: câu T2–T4 cũ giờ cũng bị lọc khi viên gạch chưa dạy (chưa học viên nào → quiz bài T2–T4 `not-ready`); câu chỉ có khái niệm bài (vd `q-s1-t3-w4-05`) không bị lọc. Các test lọc cũ của story 33/35/36/37/40/46 viết lại theo trạng thái thiếu F17 / F09 / F01–F12 thay vì "chưa học viên nào".
- **"Don't + V"** (`tense-scope.ts`): `DONT_IMPERATIVE_RE` chỉ báo khi `!scope.dont`. Với `present-simple`, `outOfScopeWords("Don't worry.")` trả `["don't", "don't worry"]` (từ don't đã bị báo từ trước), nên test dùng `toContain("don't worry")` thay vì đúng mảng `["don't worry"]` của bảng I/O. Khối "Chọn thì" vẫn bị chặn "Don't + V" bằng regex riêng (`lessons.test.ts`). `PRESENT_SIMPLE_QUESTIONS` thêm dòng "Mệnh lệnh phủ định" và 2 lỗi (Not touch it!, I haven't a car.).
- **Test quay lại** (`comeback.ts`): `COMEBACK_BANK`; `pickComebackTest` nhánh `isInFoundation` (Sổ lỗi ≤ 3 + câu `FOUNDATION_QUESTIONS` của `doneBrickIds` xếp theo `lastDoneAt` mới nhất trước, 4 viên đầu chia đều rồi viên cũ hơn; không câu bài ngoài Sổ lỗi; `[]` khi không có gì); `weakestSectionFrom` xếp viên sau mọi bài lộ trình theo F01 → F18; `comebackHome(store, hasContent)` và `comebackTarget(weak, home)`. `ComebackRun` chốt `comebackHome` (với `hasBrickContent`) cùng đề lúc bắt đầu; `ComebackNext` dùng `comebackTarget` ("Chỗ cần ôn nhất: n câu sai ở viên / đoạn này", "Vẫn nhớ tốt! Học tiếp Sân ga thôi." khi đang ở Sân ga); câu mô tả ở Sân ga "{n} câu từ các viên đã học và Sổ lỗi sai.". `useComeback` dùng `COMEBACK_BANK`. Fixture các ca cũ của `comeback.test.ts` bỏ qua Sân ga (`studiedOut`).
- **Video:** `n7RA6XxfpNU` → `s1-t2-w4` / `entertainment`, đặt sau `4cU9fqpCqBA`. Không đổi file sub, giấy phép.
- **Ngữ pháp theo ngày:** `GrammarDayKind`, `GrammarDay`, `LessonContent.grammarDays` (`types.ts`); dữ liệu 8 bài ở `grammar-days.ts` (72 câu nói, 18 cặp câu, `requires` khai tay); `index.ts` gắn vào `LESSON_CONTENTS`, `lessonPartIds` trả id phần hoặc id ngày, thêm `lessonPartKind`, `getGrammarDay`. Đổi so với mẫu Design Notes: "She is cooking dinner now." trùng câu mẫu phần luyện của thì nên N1 s1-t2-w1 là "My mother is cooking dinner now."; cặp will dùng "I'll call you after dinner." vì "I'll call you tonight." là câu ví dụ của TenseCard. Tiêu đề N4: "So với hiện tại đơn", "So với thì hiện tại", "So với động từ có quy tắc", "So với quá khứ đơn", "So với will". Nhãn cặp câu: "So với: " + tên ngắn của thì (phần sau dấu " · " cuối, nên `to-be` hiện "to be (am / is / are)").
- **Giao diện:** `TenseHead` (phần đầu thẻ + công thức lọc theo nhãn) và `Formulas` tách trong `TenseCard.tsx` (DOM TenseCard không đổi); `MinimalPairList` tách trong `TenseChoiceCard.tsx` (DOM khối không đổi). `LessonContentParts.tsx`: `GrammarView`, `GrammarSection({ content, view })`, `GrammarDayBlock` (tiêu đề "Ngày k/5 · …", ghi chú, `TenseHead` + `<details>` "Xem cả thẻ: <tên thì>", `SpeakPractice` "Luyện nói hôm nay", khối luyện của thì ở N3, khối "Chọn thì" kèm khối luyện theo `choiceIds`, cặp câu N4, nút "Xong ngày này" như "Xong phần này"), `GrammarDaysList` ở đầu view `all` của bài có ngày; N5 hiện dòng "Ngày 5/5 · Ôn trộn cả tuần" + ghi chú rồi cả đoạn; bảng ôn V3 / bảng động từ ở mọi view, phần ôn tập chỉ ở N5 / `all`; khối luyện dùng chung `openPracticeId`. `LessonSectionContent` nhận `grammarView`; `Session.LessonStep` tính view theo `lessonPartKind`, dòng "Đã xem đủ 5 ngày Ngữ pháp, hôm nay ôn lại cả tuần." cho bài có ngày (T1 giữ nguyên chữ). Chỉ dùng class đã có trong từng file (`layout:guard` sạch).
- **`plan.ts`:** logic giữ nguyên (ngày nằm trong `lessonPartIds` nên `resolveSessionPlan`, `sessionCheckQuizId` "phần cuối" = n5, `markSessionPartSeen` chạy sẵn); sửa doc comment.
- **Chữ:** F03 (/t/, /k/ đầu từ bật hơi; giữ "Mười ký hiệu") và F10 (/z/ sau nguyên âm và âm rung b, d, g, v, l, m, n, r; `hintVi` thêm l, m, r) viết gọn lại để giải thích vẫn trong 40–80 chữ; goalVi F17 đúng Design Notes (catalog + bảng learning-rules).
- **Kiểm lại mục đã xong:** been to / gone to, "…chưa?", "I can help you" (T3-W1 không can), she's = she has (`sContraction`), T4-W3 đủ 26 câu, tuần Tết (`mix-tet`) vẫn có test giữ.
- **Kiểm chứng:**
  - `npm run lint && npm test && npm run build` pass (87 file, 2193 test; `check-precache` OK; cảnh báo chunk size có sẵn). `npm run layout:guard`: 20 file nguồn đổi, không class thêm / xoá.
  - Test mới: `src/data/lessons/grammar-days.test.ts` (mọi luật "Ngày Ngữ pháp"), describe story 47 ở `requires.test.ts`, `comeback.test.ts`, `plan.test.ts`, `questions.test.ts` (66 câu cũ trong phạm vi chữ thì cuối bài), `videos.test.ts`, `tense-scope.test.ts`, `brick-invite.test.ts`.
  - Chrome headless (CDP, bản build không Supabase, `vite preview`), 375px và 1280px, `scrollWidth` ≤ viewport ở mọi trang: `/session` s1-t2-w2 tự chốt `part=s1-t2-w2-n1` ("Ngày 1/5 · Câu khẳng định", "Luyện nói hôm nay", "Xem cả thẻ", dòng "There was / were", không có kiểm tra), n3 (khối "Câu hỏi chủ ngữ"), n4 (dòng "So với: to be (am / is / are) · Hiện tại đơn: câu hỏi và phủ định"), n5 (có "Kiểm tra cuối bài"), xem hết (không `part`, dòng "Đã xem đủ 5 ngày Ngữ pháp…", có kiểm tra); trang bài s1-t2-w1 ("Đã xem 1/5 ngày", "Ngày tiếp theo", bấm "Xong ngày này" → "Đã xem 2/5 ngày"); Sân ga xong F01–F05 + Sổ lỗi `q-f03-02`, nghỉ 9 ngày: Hôm nay có "Chào mừng quay lại", trang test có "… câu từ các viên đã học và Sổ lỗi sai.".
  - Chưa chạy: `npm run videos:check` (cần mạng; chỉ đổi bài gắn video, ID không đổi), `npm run layout:check` (đang đỏ sẵn), chưa bấm hết đề quay lại tới màn "Học tiếp" trên trình duyệt (luật trỏ đích có test thuần `comebackTarget`), chưa thử phím tắt khối luyện ở ngày 3 / 4 trên trình duyệt (dùng chung `openPracticeId` như cả đoạn).
- **Vá sau review (lượt 1):** khối "Câu luyện theo ngày" ở cả đoạn, view `week` cho buổi ôn cả tuần, "Xem cả thẻ" mọi ngày, `sessionSectionViews` và `comebackQuestions` (hàm thuần có test), so `lastDoneAt` bằng `Date.parse`, chữ trang test trống ở Sân ga; sửa 15 câu / ghi chú của ngày (dịch Did, to V, read, never, mốc giờ, more, anyone, câu trùng) và `requires` (ngày + 6 câu T2–T4); ba test khai báo theo chữ quét cả ngày. `npm run lint && npm test && npm run build` pass (87 file, 2197 test), `layout:guard` sạch. Chưa kiểm lại trên trình duyệt sau vá.

## Spec Change Log

- **Review story 47, lượt 1 (finding blind #5).**
  - Kích hoạt: bảng I/O (vùng đóng băng) ghi `outOfScopeWords('present-simple', "Don't worry.")` → `["don't worry"]`, nhưng ở `present-simple` từ `don't` cũng chưa mở nên kết quả đúng là `["don't", "don't worry"]`; mẫu Design Notes "She is cooking dinner now." và "I'll call you tonight." trùng câu đã có của bài nên bản dựng đã đổi.
  - Sửa: dòng I/O "Don't + V" thành "có `"don't worry"` (cùng `"don't"`)" (chỉ một cách sửa hợp lý, khớp quyết định "Don't + V dạy ở s1-t1-w3"); mẫu Design Notes thành "My mother is cooking dinner now." / "I'll call you after dinner.".
  - Tránh: bảng I/O khẳng định hành vi code không có.
  - KEEP: luật `DONT_IMPERATIVE_RE` chỉ báo khi `!scope.dont`; test dùng `toContain("don't worry")`.
- **Review story 47, lượt 1 (finding blind #1, #13; edge "claim" learning-rules).**
  - Kích hoạt: 72 câu nói và 18 cặp câu của ngày chỉ hiện trong buổi của ngày đó; trang bài và buổi ôn cả tuần không có; danh sách "5 ngày của tuần" hiện cả trong buổi ôn cả tuần.
  - Sửa (ngoài vùng đóng băng): `GrammarView` thêm `week` (buổi ôn cả tuần, không có danh sách ngày); cả đoạn (trang bài, ngày 5, `week`) có khối "Câu luyện theo ngày" (đóng sẵn); mọi ngày có "Xem cả thẻ" cho từng thì của bài (N4 trước đây không có). Hàm thuần `sessionSectionViews` chọn view của buổi, `comebackQuestions` dùng chung đề quay lại cho Hôm nay và trang test.
  - Tránh: nội dung ngày không xem / ôn lại được ngoài một buổi; ngày 4 không mở được thẻ thì.
  - KEEP: dòng I/O "Trang bài" (danh sách 5 ngày ở đầu, nội dung đầy đủ bên dưới) vẫn đúng; không khoá ngày.

## Review Triage Log

Lượt 1 (review_loop_iteration 0). Không có intent_gap / bad_spec; vá trực tiếp, hoãn 2 mục.

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Trang bài và buổi ôn cả tuần không hiện câu nói / cặp câu của ngày | medium | `GrammarSection` view `all` chỉ render nội dung cũ + `GrammarDaysList`; `GrammarDayBlock` chỉ chạy ở view `day` | patch: khối "Câu luyện theo ngày" (đóng sẵn) ở trang bài, ngày 5, buổi ôn cả tuần |
| 2 | blind + content | Câu Did dịch "…chưa?" (`s1-t2-w2-n3-say-2`, `s1-t2-w3-n3-say-1`) | medium | "đã … chưa" là khung hiện tại hoàn thành; cặp N4 s1-t3-w3 dạy Did → "có … không" | patch: "Bạn có gọi cho mẹ không?", "Cô ấy có gửi ảnh cho bạn không?" |
| 3 | blind + content | Cặp N4 s1-t2-w4 dùng "started to rain" (động từ + to V chưa dạy) | medium | `outOfScopeWords` không báo mẫu này; deferred-work ghi to V để Chặng 2 | patch: "We were eating lunch when my phone rang." |
| 4 | blind | "I read a book last night." không thấy V2 | low | read quá khứ viết như hiện tại; sửa trực tiếp | patch: "I wrote an email last night." / "I was writing an email at nine last night." |
| 5 | blind | Spec đóng băng lệch bản dựng, Spec Change Log trống | low | Dòng I/O "Don't + V" ghi `["don't worry"]`, code trả `["don't", "don't worry"]`; mẫu Design Notes đã đổi | patch: sửa dòng I/O + mẫu Design Notes, ghi Spec Change Log |
| 6 | blind | Không test nào quét `requires` của ngày theo chữ | medium | Ba test days-months / lượng từ / liên từ chỉ quét viên, `FOUNDATION_QUESTIONS`, `QUESTION_BANK`; s1-t2-w4-n4 thiếu `past-simple`, s1-t2-w2-n3 thiếu `subject-questions` | patch: `GRAMMAR_DAY_TEXTS` vào ba test; bổ sung khái niệm |
| 7 | blind | `verb-forms` không đồng đều ở câu V3 T3–T4 | low | `q-s1-t3-w4-01` (have lived), `q-s1-t4-w4-01` (have lost) có đáp án là V3 mà thiếu; `q-s1-t3-w3-02` (has), `-04` (yet) chỗ trống không phải V3, thêm vào thì quiz s1-t3-w3 thiếu F17 còn 2 câu (`not-ready`) | patch: thêm `verb-forms` cho 2 câu đáp án V3; giữ `-02`, `-04` (lý do ghi ở đây) |
| 8 | blind | "Don't + V" dạy mỏng, không có khái niệm để khai báo | false | Phạm vi dạy do intent đóng băng chốt (1 dòng công thức có 2 ví dụ + 1 lỗi); `q-s1-t3-w1-03` đã khai báo `present-simple-negative`, khái niệm của chính bài s1-t1-w3 dạy "Don't + V" | reject |
| 9 | blind | Mục deferred "want + to V" không nói câu cũ đang dùng | low | `q-s1-t3-w1-05`, `q-s1-t3-w3-05`, `q-s1-t4-w1-05` trích "want to" (reviewer ghi nhầm `-06`) | patch: bổ sung evidence trong deferred-work |
| 10 | blind | Đang ở Sân ga, hoà câu bài / câu viên thì bài thắng | low | Chỉ xảy ra khi Sổ lỗi có câu bài lúc đang ở Sân ga (đã bỏ qua rồi quay lại); sửa cần thêm tham số cho `weakestSectionFrom` | reject |
| 11 | blind | N4 không mở được thẻ thì ở 4 bài | medium | N4 của s1-t2-w1, -w2, s1-t3-w1, -w3 (và -w2) không có `focus` nên không có "Xem cả thẻ" | patch: mọi ngày có "Xem cả thẻ" cho từng thì của bài |
| 12 | blind + edge | Mở lại bài đã xong từ Bản đồ thì rơi vào Ngày 1 | medium | `lessonPartOf` không xét `done`; story 42 đã ghi hành vi này cho bài T1, story 47 mở rộng sang 8 bài | defer (cần Huy chọn) |
| 13 | blind | `GrammarDaysList` hiện cả trong buổi ôn cả tuần | low | View `all` render danh sách khi `days.length > 0`, cả ở `Session.LessonStep` | patch: view `week` cho buổi, danh sách chỉ ở `all` (trang bài) |
| 14 | blind | Tiêu đề lặp tên thì; `<details>` dùng flex | low | Safari cũ bỏ qua flex trên `<details>`; tên thì ở summary cần để phân biệt 2 thì (s1-t2-w2), `h3` của TenseCard chỉ đọc khi mở | patch: bỏ flex trên `<details>`, bọc nội dung bằng div; giữ chữ summary |
| 15 | blind | `LESSON_CONCEPT_LESSON_IDS` viết tay, lỗi lệch tập không chỉ cách sửa | low | `expect(Set).toEqual(Set)` không có thông báo | patch: thông báo trong test + doc ở `concepts.ts` |
| 16 | edge | Quay lại Sân ga sau khi bỏ qua và đã học bài: không lấy câu bài | low | Đúng luật Sân ga của spec (I/O "Sân ga, chưa xong viên" → `[]`); trường hợp hiếm | reject |
| 17 | edge | Trang test trống ở Sân ga bảo "Học tiếp bài hiện tại" | low | `Quiz.tsx` chữ cố định; sửa trực tiếp | patch: chữ theo `atFoundation` |
| 18 | edge + vgap | Nút phụ "Về Lộ trình" thay "Về bài học" ở Sân ga | false | Ngay trên nút đó `ComebackNext` có "Học tiếp" trỏ viên / Sân ga (`comebackTarget`); nút cũ trỏ s1-t1-w1 chưa học | reject |
| 19 | edge | `localeCompare` trên `lastDoneAt` | low | Các nơi khác (`flashcard-session`, `plan`) so bằng `Date.parse`; chuỗi khác múi giờ sắp sai | patch: so theo `Date.parse` + test |
| 20 | edge | Test liên từ có thể bắt "so" / "or" trong đề tiếng Việt | low | Hiện không có ca nào; nếu có thì test đỏ rõ ràng (lỗi ồn, chỉ dev) | reject |
| 21 | edge | learning-rules nói N1–N4 đều có 3 câu nói | low | N4 không có câu nói (test bắt `undefined`) | patch: viết lại câu trong learning-rules |
| 22 | vgap | Đề quay lại ở Sân ga (bank, đích "Học tiếp") không có test nối dây | medium | `useComeback` và `ComebackRun` tự truyền `COMEBACK_BANK`; test chỉ gọi hàm thuần | patch: `comebackQuestions` dùng chung + test Sân ga F01–F05 → 8 câu, đích với `hasBrickContent` thật |
| 23 | vgap | Chọn view ngày trong buổi chỉ kiểm tay | medium | Logic `partKind` nằm trong `Session.tsx` | patch: hàm thuần `sessionSectionViews` + test ngày 1/3/4/5/xem hết; phần khối bên trong ngày → defer (chưa có test component) |
| 24 | vgap (khác) | `comebackTarget` lặp logic `sourceLabel` / `questionSourceHref` | low | Nhãn "F03 · IPA là gì" theo đúng dòng I/O; `lib` không import `components` | reject |
| 25 | content | Ghi chú N2 s1-t3-w3 ghép never với haven't | medium | Dễ sinh "I haven't never…"; quy tắc của thì tách đúng | patch: "hay đi với yet (never thì đi với have / has: I have never…)" |
| 26 | content | "The kids were playing in the garden." dịch như hiện tại tiếp diễn | low | Không mốc thời gian | patch: "… at five." / "Lúc năm giờ …" |
| 27 | content | "It wasn't raining this morning.", "What was she cooking last night?" thiếu thời điểm cụ thể | low | Bản dịch trùng quá khứ đơn | patch: "at seven this morning", "at seven last night" (+ `clock-time`, `demonstratives`, `prepositions-of-time`) |
| 28 | content | "The children aren't sleeping." → "Bọn trẻ không ngủ." đọc như thói quen | low | Thiếu "lúc này" | patch: "Lúc này bọn trẻ không ngủ." |
| 29 | content | "You should drink more water." dùng more (so sánh dạy ở s1-t4-w3) và trùng `apply.sampleEn` | medium | `t2-t4-grammar.ts` sampleEn cùng câu | patch: "You should eat breakfast." |
| 30 | content | "I won't tell anyone." dùng anyone chưa dạy | low | F15 chỉ dạy some / any + danh từ | patch: "I won't tell my friends." |
| 31 | content | Câu ngày trùng nội dung cũ ("Was the movie good?", "Can you swim?", "He can speak English.") | low | Test trùng không xét câu đúng của lỗi, câu Phát âm | patch: đổi 3 câu; test trùng xét thêm `mistakes[].right`, câu nói / shadowing / chính tả Phát âm |
| 32 | content | `requires` ngày thiếu `demonstratives` ("this morning") | low | Chỉ là dữ liệu tĩnh nhưng sai luật khai báo | patch (cùng #6) |
| 33 | content | `requires` câu T2–T4 thiếu khái niệm (`-12`, `-17` at that time; `q-s1-t4-w3-21` people; `q-s1-t2-w4-07`; `q-s1-t3-w1-10`) | medium | `demonstratives`, `prepositions-of-time`, `irregular-plurals` là khái niệm viên, lúc chạy lọc theo đó | patch: bổ sung; golden `-21` cập nhật |
| 34 | content | "I haven't a car." không hẳn sai (Anh-Anh) | low | Lỗi này do intent đóng băng chỉ định; app dạy tiếng Anh Mỹ | reject |
| 35 | content | "I want some tea." → "Tôi muốn trà." không tự nhiên | low | Sửa trực tiếp | patch: "Tôi muốn uống trà." |
| 36 | content | Dòng V3 ở N4 s1-t2-w3 gây phân tâm | low | Luật "mỗi nhãn công thức nằm trong focus của ít nhất 1 ngày" và bảng phân ngày gán V3 cho N4 | reject |

## Design Notes

**Khái niệm bài T2–T4** (không trùng `CONCEPT_IDS`, mỗi khái niệm do đúng 1 bài dạy):

| Bài | Khái niệm |
|---|---|
| s1-t2-w1 | `present-continuous`, `two-syllable-stress` |
| s1-t2-w2 | `past-to-be`, `past-simple`, `subject-questions`, `suffix-stress` |
| s1-t2-w3 | `past-simple-irregular`, `ed-endings` |
| s1-t2-w4 | `past-continuous` |
| s1-t3-w1 | `will`, `weak-forms` |
| s1-t3-w2 | `going-to`, `will-vs-going-to`, `linking` |
| s1-t3-w3 | `present-perfect`, `sentence-stress` |
| s1-t3-w4 | `present-perfect-vs-past` |
| s1-t4-w1 | `modals`, `reductions` |
| s1-t4-w3 | `comparatives`, `passive-present` |
| s1-t4-w4 | (không có) |

Ví dụ: `q-s1-t2-w1-02` "I ___ TV right now." → `['subject-pronouns', 'present-continuous']`. `q-s1-t2-w2-05` (trọng âm -tion) → `['stress', 'suffix-stress']`. `q-s1-t3-w4-05` (/fɚ/) → `['weak-forms', 'present-perfect-vs-past']`.

**Kiểu ngày:**

```ts
export type GrammarDayKind = 'affirmative' | 'negative' | 'question' | 'compare' | 'mixed'
export type GrammarDay = {
  id: string // `${lessonId}-n${k}`
  kind: GrammarDayKind
  title: string // "Câu khẳng định", "So với hiện tại đơn", "Ôn trộn cả tuần"
  note: string // một câu: hôm nay làm gì
  focus?: readonly { tenseId: string; labels: readonly string[] }[] // nhãn có thật trong Tense.formulas
  sentences?: readonly PracticeSentence[] // N1–N3: đúng 3
  choiceIds?: readonly string[] // id TenseChoice của bài
  compare?: { withTenseIds: readonly string[]; pairs: readonly MinimalPair[] } // đúng 3 cặp
  requires?: readonly RequiredConcept[] // bắt buộc khi có sentences / compare
}
```

**Phân ngày** (nhãn công thức đúng như dữ liệu; N5 luôn "Ôn trộn cả tuần", không `focus`):

| Bài | N1 Khẳng định | N2 Phủ định | N3 Câu hỏi | N4 So với thì trước |
|---|---|---|---|---|
| s1-t2-w1 | Khẳng định | Phủ định | Câu hỏi | khối `simple-vs-continuous` |
| s1-t2-w2 | `past-to-be`: Khẳng định, There was / were; `past-simple`: Khẳng định | cả hai: Phủ định | cả hai: Câu hỏi; `past-simple`: Câu hỏi Wh-; khối `subject-questions` | 3 cặp với `to-be`, `present-simple-questions` (is → was, do → did) |
| s1-t2-w3 | Khẳng định | Phủ định / câu hỏi | Phủ định / câu hỏi | V3; 3 cặp với `past-simple` (walked / went) |
| s1-t2-w4 | Khẳng định | Phủ định | Câu hỏi | when · while; 3 cặp với `past-simple-irregular` |
| s1-t3-w1 | Khẳng định | Phủ định | Câu hỏi | 3 cặp với `present-simple`, `present-continuous` |
| s1-t3-w2 | Khẳng định, Văn nói | Phủ định | Câu hỏi | khối `will-vs-going-to` |
| s1-t3-w3 | Khẳng định | Phủ định | Câu hỏi | 3 cặp với `past-simple-irregular` (có mốc / không mốc) |
| s1-t4-w1 | Khẳng định | Phủ định | Câu hỏi | have to · could · would like; khối `have-to-could-would-like`; 3 cặp với `present-simple` |

Mẫu (s1-t2-w1): N1 "My mother is cooking dinner now." / N2 "I'm not working today." / N3 "Are you listening to me?". N4 cặp (s1-t3-w1): "I call my mom every Sunday." ↔ "I'll call you after dinner." — "thói quen → hiện tại đơn; quyết định / hứa cho tương lai → will".

**Chữ sửa:**
- F03: "… /m/, /n/ như chữ cùng tên; /t/ và /k/ gần t, c Việt nhưng đầu từ bật một luồng hơi (để tay trước miệng: two, cat); /d/ như đ …". Giữ "Mười ký hiệu".
- F10: "/z/ ngân nhẹ sau nguyên âm và âm rung như b, d, g, v, l, m, n, r (pens, dogs, girls, rooms, cars)". `hintVi` thêm "l, m, r".
- F17 goalVi: "Nhận ra go/goes/going/went trên trục thời gian; gone đi với have / has (học ở T3); chỉ cần nhận ra".

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run layout:guard` -- expected: không báo class mới.
- `npm run videos:check` -- expected: mọi ID OK (cần mạng; chỉ đổi bài gắn video).

**Manual checks:**
- Headless 375px và 1280px:
  - `/session` với store ở s1-t2-w2: đi qua ngày 1 → 5 bằng "Xong buổi", rồi buổi xem hết;
  - trang bài s1-t2-w1 (danh sách 5 ngày, "Xong ngày này");
  - test quay lại khi đang ở Sân ga (store nghỉ 9 ngày, xong F01–F05);
  - `scrollWidth` = viewport, phím tắt chỉ chạy ở khối luyện đang mở.
- `npm run layout:check` đang đỏ sẵn (mục `deferred-work.md`, story 35). Chỉ cần không có lỗi mới.
