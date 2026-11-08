---
title: 'Chia bài T1 theo ngày và gợi ý ôn khi sai lặp lại (CAP-2, CAP-19, CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '6c3aaba6a51732c4816e673b093117e19d99c2b3'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/21-session-plan-theory-first.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/27-t1-patch-untaught-question-filter.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Kiểm tra cả 4 hàng trước (Soát vé):** story này không đụng Soát vé. Câu sai ở Soát vé và "Tôi biết rồi" không vào Sổ lỗi, nên không bao giờ sinh lời mời ôn. Lời mời chỉ đếm câu đã có trong Sổ lỗi. Không khoá bài, không khoá phần, không chặn gì. Tiến độ bài, thẻ SRS và Sổ lỗi cũ giữ nguyên.
- **Nhịp 1 viên mỗi buổi:** buổi Sân ga giữ nguyên. Sau Sân ga, mỗi buổi 30' học **một phần** của bài T1 đang học. Phần nào cũng mở được ở trang bài.
- **Mốc 750, máy tính:** story này không đụng lịch, không thêm `lg:`, không thêm phím tắt. Giao diện 375px chỉ thêm khối mới (phần của bài, dải lời mời).
- Claude chọn:
  - **`LessonContent.parts`** chỉ chia đoạn Phát âm. Mỗi phần gồm: id `${lessonId}-p${n}`, tiêu đề, một câu ghi chú, `soundIds` trỏ vào âm đã có (không chép dữ liệu âm), 2–3 câu luyện nói và `requires` khai báo tay.
    - W1: 3 ngày × 4 nguyên âm.
    - W2: 2 phần (5 âm trượt + 3 âm có r).
    - W3: 4 nhóm × 6 phụ âm, nhóm ★ /θ ð ʃ ʒ tʃ dʒ/ để cuối.
    - W4, T2–T4: không chia.
    - Ngữ pháp không chia. Câu mẫu cũ của tuần (`pronunciation.sentences`) giữ nguyên id, thành khối "Luyện cả tuần" sau các phần.
  - **Cặp dễ nhầm** của một âm chỉ được so với âm cùng phần, phần trước hoặc bài T1 trước. Chỉ phải sửa một chỗ dữ liệu: cặp của `c-s` đổi `sea–she` thành `sue–zoo` (cặp /s/–/ʃ/ vẫn còn ở thẻ `c-sh`).
  - **Lưu phần đã xem** ở `progress.lessons[id].partsSeen` như `stack.md` ghi. Mảng id, sắp tăng dần, không trùng.
    - Đánh dấu phần không đổi `done` và `updatedAt` của mục bài, vì `updatedAt` là mốc của việc đánh dấu xong bài.
    - Bài chưa có mục thì tạo `{ done: false, updatedAt: LEGACY_UPDATED_AT, partsSeen }`, để đánh dấu phần không bao giờ đè "đã xong" của máy khác.
    - Gộp: `done` / `updatedAt` theo bên mới hơn như cũ, `partsSeen` lấy hợp của hai bên.
    - Không bump store.
  - **Đánh dấu đã xem:**
    - Bấm nút "Xong phần này" (ở trang bài và trong buổi).
    - Bấm "Xong buổi" của buổi có phần thì phần đó cũng tính là đã xem.
    - Xem hết các phần không tự đánh dấu bài xong.
  - **Buổi học** chốt phần trên URL: `?lesson=s1-t1-w1&part=s1-t1-w1-p2&step=lesson`.
    - Phần của buổi = phần chưa xem đầu tiên.
    - Đã xem hết thì không có `part`, buổi hiện cả đoạn Phát âm để ôn.
    - `part` sai hoặc không thuộc bài thì bỏ qua và tính lại từ store.
  - **Lời mời "Ôn viên gạch X n'?":**
    - Khái niệm của câu = `Question.requires` (story 27). Khái niệm bài T1 không do viên nào dạy nên không tính.
    - Viên X đủ điều kiện khi có ≥ 2 câu khác nhau trong Sổ lỗi có `lastWrongAt` trong 14 ngày gần nhất (tính lùi 14 × 24 giờ) và cùng cần một khái niệm viên X dạy. Mục từ đọc O.W.L. và câu đã bị xoá khỏi ngân hàng bị bỏ qua.
    - Lời mời ẩn khi câu sai mới nhất của X không muộn hơn `max(dismissedAt, lastDoneAt của X)`.
    - Mỗi lần chỉ hiện 1 lời mời. Thứ tự chọn: nhiều câu hơn → câu sai mới nhất muộn hơn → viên đứng sau theo thứ tự F01 → F18.
    - Hiện ở Hôm nay cả khi đang ở Sân ga và sau Sân ga, dạng dải nhỏ, không phải thẻ chính.
  - **"Để sau"** lưu ở `mistakes.brickInvites[brickId] = { dismissedAt, updatedAt }`. Gộp theo viên, lấy `dismissedAt` muộn hơn. Backup chỉ giữ id viên hợp lệ.

**Problem:**
- Bài T1 dồn 12 nguyên âm, 8 nguyên âm đôi hay 24 phụ âm vào một trang. Buổi 30' sau Sân ga chiếu nguyên cả bảng âm mỗi ngày, không có thứ tự "hôm nay học phần này".
- Khi Huy sai lặp lại cùng một khái niệm nền, app không gợi ý quay lại viên gạch dạy khái niệm đó.

**Approach:**
- Thêm dữ liệu phần cho W1–W3 và lưu phần đã xem trong `progress.lessons`.
- Buổi học chốt phần tiếp theo trên URL. Trang bài hiện các phần theo thứ tự.
- Thêm hàm thuần tính lời mời ôn từ Sổ lỗi + `requires` + `teaches`, cùng dấu "Để sau" có đồng bộ. Hôm nay hiện dải mời.

## Boundaries & Constraints

**Always:**
- Logic là hàm thuần có test:
  - `src/lib/roadmap-progress.ts`: phần đã xem;
  - `src/lib/sessions/plan.ts`: phần của buổi;
  - `src/lib/quiz/brick-invite.ts`: lời mời. Module này nhận `lastDoneAt` / `hasContent` qua tham số, không import `@/lib/foundation`.
- Kế hoạch buổi chốt lúc bắt đầu. Đánh dấu phần giữa buổi hay đồng bộ không đổi phần đang hiện.
- `setLessonCompleted` giữ nguyên `partsSeen`. Mục bài chỉ có `partsSeen` (`done: false`) không làm bài nào thành xong hay bỏ qua.
- Câu luyện nói của phần chỉ dùng kiến thức đã dạy:
  - khai báo `requires`;
  - khái niệm bài T1 chỉ được thuộc bài của phần hoặc bài trước, nên W1 không dùng hiện tại đơn;
  - `exampleFeatures(text)` phải rỗng.
- Chữ tiếng Việt, giọng nhẹ nhàng, không đỏ, không chữ "khoá"/"trượt". Ở 375px không cuộn ngang.

**Never:**
- Không chia đoạn Ngữ pháp, W4, T2–T4.
- Không khoá phần chưa tới. Không tự đánh dấu bài xong. Không đổi nút "Đánh dấu đã học xong".
- Không đổi id âm, id câu cũ, `lessonId`, `sectionId`. Không bump `CURRENT_VERSION`. Không thêm key mới vào `SYNCED_KEYS`.
- Không mời ôn từ câu không có `requires` (T2–T4), từ Soát vé hay "Tôi biết rồi" (không có trong sổ).
- Lời mời không chặn, không đổi buổi học hay ngày lười.
- Không suy khái niệm bằng regex.
- Không làm việc của story 29–31.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Buổi đầu của W1 | Sau Sân ga, bài hiện tại `s1-t1-w1`, chưa xem phần nào, vào `/session` | URL chốt `?lesson=s1-t1-w1&part=s1-t1-w1-p1&step=lesson`. Đoạn Phát âm chỉ hiện Ngày 1 (4 âm + 3 câu), nhãn "Phần 1/3" | N/A |
| Phần tiếp theo | `partsSeen = [p1]` | Buổi sau chốt `p2` | N/A |
| Xem không theo thứ tự | `partsSeen = [p2]` | Buổi chốt `p1` (phần chưa xem đầu tiên) | N/A |
| Đã xem hết | `partsSeen = [p1,p2,p3]`, bài chưa xong | Không có `part`. Buổi hiện mọi phần + "Luyện cả tuần" kèm dòng "Đã xem đủ 3 phần, hôm nay ôn lại cả tuần." | N/A |
| Đánh dấu giữa buổi | Đang ở `part=p1`, bấm "Xong phần này" | `partsSeen` có p1, buổi vẫn hiện p1 với nhãn "Đã xem" | N/A |
| Xong buổi | Buổi `part=p2`, bấm "Xong buổi" | Ghi buổi `full` như cũ và thêm p2 vào `partsSeen`. Đã có thì store không đổi | N/A |
| URL lạ | `?lesson=s1-t1-w1&part=s1-t1-w3-p1` hoặc `part=abc` | Bỏ `part`, tính từ store, `replace` URL | N/A |
| Bài không chia | Bài hiện tại W4 hoặc T2 | Không có `part`, giống trước story | N/A |
| Trang bài | Mở `s1-t1-w1`, đã xem p1 | Hiện "Đã xem 1/3 phần". Ngày 1 có nhãn "Đã xem", Ngày 2 có nhãn "Phần tiếp theo", phần nào cũng có nội dung đầy đủ. Cuối là "Luyện cả tuần" (câu cũ) | N/A |
| Đánh dấu bài xong | `partsSeen=[p1]`, bấm "Đánh dấu đã học xong" | `done: true`, `partsSeen` giữ nguyên | N/A |
| Đồng bộ phần | Máy A xem p1, máy B xem p2 | Gộp: `partsSeen = [p1,p2]`. `done` theo `updatedAt` như cũ | Một bên `partsSeen` sai dạng → chỉ lấy chuỗi hợp lệ của hai bên |
| Không đè "đã xong" | Máy A: `done: true` (t0). Máy B chưa đồng bộ, xem p1, tạo mục mới | Gộp: `done: true`, `partsSeen = [p1]` | N/A |
| Mời ôn | Trong 14 ngày sai `q-s1-t1-w1-03` và `q-s1-t1-w4-04` (đều cần `subject-pronouns`) | Hôm nay có dải "Ôn viên gạch F09 · Đại từ … 8'?" với nút "Ôn F09" → `/foundation/F09` và nút "Để sau" | N/A |
| Chưa đủ | Chỉ 1 câu, hoặc câu thứ 2 sai cách đây 15 ngày | Không có lời mời | N/A |
| Không có viên dạy | 2 câu chỉ trùng khái niệm bài T1 (`monophthongs`), hoặc câu T2–T4 không có `requires`, hoặc mục từ O.W.L. | Không có lời mời | N/A |
| Hoà | Sai `w1-01` + `w1-04` cùng lúc: F09 = 2, F13 = 2 | Mời F13 (viên đứng sau) | N/A |
| Để sau | Bấm "Để sau" ở F09 | Dải ẩn. Sau đó sai thêm 1 câu cần F09 (vẫn ≥ 2 câu trong 14 ngày) → hiện lại | N/A |
| Ôn xong | Học xong F09 (`lastDoneAt` sau câu sai mới nhất) | Dải ẩn tới khi có câu sai mới | N/A |
| Đồng bộ "Để sau" | Hai máy cùng có `brickInvites.F09` | Lấy `dismissedAt` muộn hơn. Viên lạ / mục sai dạng trong backup bị bỏ | N/A |

</frozen-after-approval>

## Code Map

- `src/data/lessons/types.ts` -- `LessonContent`, `PracticeSentence`, `Sound`. Thêm `LessonPart`, `parts?`.
- `src/data/lessons/t1-pronunciation.ts` -- `MONOPHTHONGS`, `DIPHTHONGS`, `CONSONANTS` (id âm), `PAIR_IPA`, `pr`, `PRONUNCIATION_W1..W3`. Thêm `PARTS_W1..W3`, sửa cặp `c-s`.
- `src/data/lessons/index.ts` -- `LESSON_CONTENTS`, `getLessonContent`. Gắn `parts`, thêm `lessonPartIds(lessonId)`.
- `src/data/lessons/lessons.test.ts:129-155` -- test id câu duy nhất. Thêm id câu của phần vào tập kiểm.
- `scripts/vocab/example-features.mjs` (+ `.d.mts`) -- `exampleFeatures(sentence)`, dùng trong test như `src/lib/example-features.test.ts`.
- `src/data/questions/concepts.ts` -- `conceptSource`, `RequiredConcept`, `T1_LESSON_IDS`. Chỉ đọc. Kiểu dùng bằng `import type` để tránh vòng import với `data/foundation/types.ts`.
- `src/data/questions/index.ts` -- `getQuestion(id)`. `src/data/foundation` -- `BRICKS` (`teaches`, `minutes`, `title`), `BRICK_IDS`, `isBrickId`, `getBrickMeta`.
- `src/lib/roadmap-progress.ts` -- `LessonProgress`, `isLessonProgress` (giữ lỏng, không kiểm `partsSeen`), `setLessonCompleted` (hiện đang dựng lại mục và làm rơi field khác).
- `src/lib/storage` -- `LEGACY_UPDATED_AT`.
- `src/lib/sync/merge.ts` -- `mergeLessons` (gộp theo `newer`), `mergeMistakes = mergeKeyed('items', …)`, `mergeEntries`.
- `src/lib/backup/backup.ts:146-170` -- `sanitizeBackupData` (field ngoài map chính được giữ nguyên, có mẫu làm sạch `foundation.rows`).
- `src/lib/quiz/mistakes.ts` -- `readMistakes`, `isMistakeItem` (`lastWrongAt`, mục `word` của O.W.L.).
- `src/lib/foundation` -- `readFoundation(store).bricks[id].lastDoneAt`, `brickHref`. `src/data/foundation/content` -- `hasBrickContent`.
- `src/lib/sessions/plan.ts` -- `SessionPlan`, `sessionPlan`, `resolveSessionPlan`, `sessionSearch`. Test ở `plan.test.ts:82-255` có kỳ vọng `{ lesson, step }`, cần cập nhật thêm `partId` / `part`.
- `src/pages/Session.tsx` -- `LessonStep`, `finish()`, đọc `params`.
- `src/components/lesson/LessonContentParts.tsx` (`PronunciationSection`), `LessonSectionContent.tsx`, `SoundTable.tsx` (nhận `PronunciationContent`), `SpeakPractice.tsx`.
- `src/pages/Today.tsx`, `src/app/store-context.ts` (mẫu hook `useProgress`, `useMistakes`).
- `stack.md` dòng "Sân ga 9¾" đã ghi chỗ lưu phần. Story này thêm dòng cho `mistakes.brickInvites`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/lessons/types.ts` -- thêm `LessonPart = { id; title; note; soundIds: readonly string[]; sentences: readonly PracticeSentence[]; requires: readonly RequiredConcept[] }` và `LessonContent.parts?: readonly LessonPart[]`.
- [x] `src/data/lessons/t1-pronunciation.ts`, `index.ts` -- `PARTS_W1..W3` theo Design Notes, gắn vào 3 bài. Cặp `c-s` → `pr('sue', 'zoo')`. Thêm `lessonPartIds(lessonId): readonly string[]` (bài không chia → `[]`).
- [x] `src/data/lessons/lesson-parts.test.ts` (mới) -- các ca:
  - đúng số phần (3 / 2 / 4) và số âm (4-4-4, 5-3, 6-6-6-6); W4, T2–T4 không có `parts`;
  - `soundIds` chia hết bộ âm của bài, mỗi âm đúng 1 lần;
  - phần cuối W1 có `v-er-long`, `v-er-weak`; phần cuối W3 có 4 âm ★ (`focus`);
  - bảng tay `PAIR_CONTRAST` (âm → âm bị so): âm bị so nằm cùng phần, phần trước hoặc bài T1 trước; mọi âm có `pair` của W1–W3 có trong bảng;
  - id phần `${lessonId}-p${n}`; id câu `${partId}-say-${k}` và duy nhất cùng mọi id câu khác; mỗi phần 2–3 câu có `text` / `vi`;
  - `exampleFeatures` rỗng; `requires` không rỗng, không trùng, mọi id có `conceptSource`, khái niệm bài T1 không thuộc bài sau;
  - ca tự kiểm: phần W1 khai báo `present-simple` → hàm kiểm báo lỗi.
- [x] `src/data/lessons/lessons.test.ts` -- gom câu của `parts` vào kiểm id duy nhất.
- [x] `src/lib/roadmap-progress.ts` -- thêm 3 hàm:
  - `readSeenPartIds(store, lessonId): ReadonlySet<string>` (chỉ lấy chuỗi);
  - `markLessonPartSeen(store, lessonId, partId)` (theo Decisions; đã có → store cũ; mục sai dạng → tạo mục mới);
  - `nextLessonPartId(partIds, seen): string | null`.
  `setLessonCompleted` giữ `partsSeen`. Test trong `src/lib/roadmap-progress.test.ts`: dòng Matrix "Đánh dấu bài xong", tạo mục `LEGACY_UPDATED_AT`, idempotent, thứ tự sắp xếp, `readCompletedLessonIds` không đổi.
- [x] `src/lib/sync/merge.ts` (+ `merge.test.ts`) -- gộp bài theo luật mới:
  - `mergeLessons`: chọn bên `newer`, `partsSeen` = hợp đã sắp, bỏ field khi rỗng;
  - `mergeMistakes`: gộp `items` như cũ, `brickInvites` theo viên lấy `dismissedAt` muộn hơn, chỉ có key khi một bên có;
  - test 3 dòng Matrix đồng bộ và gộp lại lần hai không đổi (không đẩy vòng).
- [x] `src/lib/backup/backup.ts` (+ test) -- làm sạch `mistakes.brickInvites`: chỉ id `isBrickId` và mục hợp lệ.
- [x] `src/lib/quiz/brick-invite.ts` (+ export `index.ts`, test `brick-invite.test.ts`):
  - hằng `BRICK_INVITE_WINDOW_DAYS = 14`, `BRICK_INVITE_MIN_QUESTIONS = 2`;
  - `isBrickInviteDismissal`, `dismissBrickInvite(store, brickId, now)`;
  - `brickReviewInvite(store, now, { lastDoneAt, hasContent })` → `{ brickId, questionIds } | null`;
  - test mọi dòng Matrix "Mời ôn" → "Ôn xong" (kể cả câu ngoài ngân hàng, đồng hồ máy lệch: câu có `lastWrongAt` ở tương lai vẫn tính).
- [x] `src/lib/sessions/plan.ts` (+ `plan.test.ts`) -- `SessionPlan` bài có `partId: string | null`:
  - `sessionPlan` lấy `nextLessonPartId`;
  - `resolveSessionPlan` nhận `part` (chỉ hợp lệ khi thuộc bài của buổi);
  - `sessionSearch` thêm `part`;
  - test các dòng Matrix buổi học; test cũ chỉ thêm `partId` / `part`.
- [x] `src/app/store-context.ts` -- thêm 2 hook:
  - `useLessonParts()` → `{ seenPartIds(lessonId), markSeen(lessonId, partId) }`;
  - `useBrickInvite(now)` → `{ invite, dismiss }` (dùng `readFoundation` + `hasBrickContent`).
- [x] `src/components/lesson/LessonContentParts.tsx`, `LessonSectionContent.tsx` -- `PronunciationSection` nhận `view?: { kind: 'all' } | { kind: 'part'; partId }`. Bài có `parts`:
  - **`all`:**
    - intro;
    - dòng "Đã xem x/N phần";
    - mỗi phần là khối `id="part-…"` gồm tiêu đề, nhãn "Đã xem" / "Phần tiếp theo", note, `SoundTable` với nhóm con, `SpeakPractice` câu của phần, nút "Xong phần này" (ẩn khi đã xem);
    - cuối là "Luyện cả tuần" (câu cũ).
  - **`part`:** nhãn "Phần n/N" và chỉ khối của phần đó.
  - Bài không có `parts`: giữ nguyên như cũ.
- [x] `src/pages/Session.tsx` -- đọc `part`, truyền view vào `LessonStep`. Buổi đã xem hết thì có dòng ôn cả tuần. `finish()` gọi `markSeen` khi `plan.partId`.
- [x] `src/components/foundation/BrickReviewInvite.tsx` (mới), `src/pages/Today.tsx`:
  - dải `role="status"`, viền `primary/50`, nền `accent/40`, không đỏ;
  - chữ: "Ôn viên gạch {id} · {title} {minutes}'?" và "Gần đây có {n} câu sai cùng cần phần này. Ôn lại một chút cho chắc nhé.";
  - nút "Ôn {id}" (`brickHref`) và nút ghost "Để sau";
  - đặt ngay sau nhóm nút buổi / ngày lười, ở cả hai chế độ.
- [x] `stack.md` -- dòng Sân ga thêm `mistakes.brickInvites` (story 28) và luật gộp.

**Acceptance Criteria:**
- Given đã qua Sân ga và đang ở W3, when học 4 buổi liên tiếp và bấm "Xong buổi", then mỗi buổi hiện đúng một nhóm 6 phụ âm theo thứ tự Nhóm 1 → 4, buổi thứ 5 hiện cả tuần để ôn.
- Given đang ở Sân ga, when mở trang bài `s1-t1-w1`, then thấy đủ 3 phần (không khoá), bấm "Xong phần này" ở Ngày 2 thì buổi bài sau này (khi rời Sân ga) chốt Ngày 1.
- Given có lời mời F09 trên Hôm nay lúc đang ở Sân ga, when xem trang, then thẻ chính vẫn là thẻ Sân ga, dải mời nằm dưới nhóm nút và nút "Bắt đầu buổi 30'" vẫn chạy buổi Sân ga như cũ.
- Given màn 375px, when mở trang bài W1, buổi bài có `part` và Hôm nay có dải mời, then không cuộn ngang và các phần khác của trang không đổi.

## Implementation Notes

- **Dữ liệu phần** (`t1-pronunciation.ts`): `PARTS_W1..W3` dựng bằng `parts(lessonId, …)` (id `${lessonId}-p${n}`, câu `${partId}-say-${k}`), gắn vào 3 bài ở `index.ts`; thêm `lessonPartIds(lessonId)` (bài không chia / id lạ → `[]`). Cặp `c-s` → `pr('sue', 'zoo')`. Chia âm đúng Design Notes.
- **Câu luyện nói đổi so với gợi ý** (vì "at" chỉ nơi chốn không có viên nào dạy: cổng hư từ `ngsl-at` là F18 = at + giờ, nên theo luật story 27 phải viết lại câu thay vì khai báo sai):
  - W1 p3 "Her teacher is at the door." → "Her teacher is in the store." (`prepositions-of-place`, F15);
  - W2 p1 "They play at my house." → "They like my house.";
  - W3 p2 "We have fun at home." → "We have a very small home.".
  "I go out at night." và "We walk in the morning." giữ, khai báo `prepositions-of-time` (F18). `requires` từng phần khai báo tay, có khái niệm bài của chính bài (`monophthongs` / `diphthongs` / `consonants`); W1 chỉ to be.
- **`roadmap-progress.ts`:** `seenPartIdsOf(entry)` (chỉ chuỗi, sắp, không trùng), `readSeenPartIds`, `markLessonPartSeen` (theo Decisions; mục sai dạng → mục mới `LEGACY_UPDATED_AT`; đã có / `partId` rỗng → store cũ), `nextLessonPartId`. `setLessonCompleted` giờ giữ mọi field khác của mục (spread mục cũ rồi đè `done` / `updatedAt`), nên `partsSeen` còn nguyên; `isLessonProgress` giữ lỏng.
- **Gộp** (`merge.ts`): `mergeLessons` dùng `pick` riêng (bên `newer` + hợp `partsSeen` đã sắp, bỏ field khi rỗng; một bên sai dạng thì lấy nguyên bên hợp lệ như cũ). `mergeMistakes` = `mergeKeyed('items', …)` + `brickInvites` (`mergeBrickInvites` ở `brick-invite.ts`: `dismissedAt` muộn hơn, bằng nhau thì `updatedAt` mới hơn, rồi local), chỉ thêm key khi một bên có. Không thêm `SYNCED_KEYS`, không bump store.
- **Backup:** `sanitizeBackupData` làm sạch `mistakes.brickInvites` khi file có key này (chỉ `isBrickId` + `isBrickInviteDismissal`, bỏ `__proto__`); sai dạng → `{}`.
- **`src/lib/quiz/brick-invite.ts`:** hằng số, `isBrickInviteDismissal`, `readBrickInvites`, `brickReviewInvite(store, now, { lastDoneAt, hasContent, lookup? })`, `dismissBrickInvite(store, brickId, now, lookup?)`, `mergeBrickInvites`. Không import `@/lib/foundation`. Quyết định thêm: `dismissedAt` = max(`now`, dấu cũ, câu sai mới nhất mọi lúc của viên) để "Để sau" vẫn ẩn được khi đồng hồ máy lệch (câu sai ghi "ở tương lai"); `updatedAt` qua `nextUpdatedAt`. Cửa sổ là `lastWrongAt >= now − 14 × 24h` (đúng 14 ngày vẫn tính, không có cận trên).
- **Buổi học** (`plan.ts`): `SessionPlan` bài có `partId`; `sessionPlan` lấy phần chưa xem đầu tiên; `resolveSessionPlan` nhận `part` (giữ khi thuộc bài của buổi, kể cả khi đã xem rồi; không thì tính lại); `sessionSearch` thứ tự `{ lesson, part?, step }`. `lib/sessions` import thêm `@/data/lessons` (`lessonPartIds`) và `@/lib/roadmap-progress` (đã có trong cùng đồ thị import, không vòng).
- **Giao diện:** `PronunciationSection` nhận `view` (`PronunciationView`); bài có `parts` dùng `PartedPronunciation`: `all` = intro + "Đã xem x/N phần" + khối `section#part-…` (tiêu đề h3, nhãn "Đã xem" / "Phần tiếp theo", note làm intro của `SoundTable`, nhóm con "4 trong 12 nguyên âm đơn", `SpeakPractice` "Luyện nói phần này", nút "Xong phần này") + "Luyện cả tuần"; `part` = "Phần n/N" + một khối. `SoundTable` / `SpeakPractice` thêm prop cấp tiêu đề (mặc định h3, DOM bài không chia không đổi). `Session` đọc `part`, `LessonStep` truyền view, dòng "Đã xem đủ N phần, hôm nay ôn lại cả tuần." khi bài có phần mà `partId` null; `finish()` gọi `markSeen`. `BrickReviewInvite` (dải `role="status"`, `border-primary/50 bg-accent/40`, nút "Ôn Fxx" + ghost "Để sau") đặt ngay sau nhóm nút buổi / ngày lười trên Hôm nay ở cả hai chế độ. Hook `useLessonParts`, `useBrickInvite`.
- **Kiểm chứng:**
  - `npm run lint && npm test && npm run build` pass (68 file, 1549 test; `check-precache` OK; cảnh báo chunk size có sẵn).
  - Test mới: `src/data/lessons/lesson-parts.test.ts`, `src/lib/quiz/brick-invite.test.ts`, thêm ca ở `roadmap-progress.test.ts`, `plan.test.ts`, `merge.test.ts`, `backup.test.ts`, `lessons.test.ts`. Test cũ của `plan.test.ts` chỉ đổi kỳ vọng `search` (thêm `part`) và thêm `partId: null` vào kế hoạch dựng tay.
  - Headless Chrome 375px (bản build không Supabase, preview), mọi kiểm tra pass (ALL OK), không lỗi JS: đã bỏ qua Sân ga → `#/session?lesson=s1-t1-w1&part=s1-t1-w1-p1&step=lesson`, "Phần 1/3", chỉ Ngày 1 (4 âm, 3 câu), "Xong phần này" → `partsSeen=[p1]`, mục `done:false` + `LEGACY_UPDATED_AT`, buổi vẫn p1 nhãn "Đã xem"; trang bài W1 "Đã xem 1/3 phần", nhãn Đã xem / Phần tiếp theo, đủ 12 âm, "Luyện cả tuần"; buổi sau chốt p2, chuyển bước giữ `part`, "Xong buổi" ghi `full` và thêm p2; `part` của W3 / `abc` → tính lại p3; xem hết → không `part`, có dòng ôn cả tuần; trang W3 4 nhóm, W4 không chia; Sân ga + 2 câu sai F09 → dải "Ôn viên gạch F09 · Đại từ I/me/my 8'?" dưới nút ngày lười, thẻ Sân ga vẫn ở trên, "Ôn F09" → `#/foundation/F09`, "Để sau" ẩn dải và ghi `brickInvites.F09`, buổi 30' vẫn là `?brick=F04&step=theory`. `scrollWidth` = 375 ở mọi trang. Script: `drive28.mjs` trong scratchpad của phiên.
- **Rủi ro / chưa làm:**
  - Giao diện (PartedPronunciation, Session, dải mời) không có test tự động (Vitest env `node`), chỉ kiểm bằng headless Chrome.
  - Trang bài W1/W2 vẫn có `text-destructive` ở câu sai mẫu của thẻ ngữ pháp (có từ trước, story này không đụng).
  - Sau "Xong buổi", đổi hash sang `/session?...` trong cùng trang không mount lại Session (trạng thái `finished` giữ) — hành vi có từ trước story.
  - Câu gợi ý của Design Notes bị viết lại 3 câu như trên; Design Notes cho phép nhưng người duyệt nên xem lại cách chọn từ.

## Spec Change Log

- **Lượt review 1 (2026-11-09), không loopback.**
  - **Finding kích hoạt:** người duyệt nội dung chỉ ra tiêu đề W2 p1 "Phần 1 · 5 âm trượt…" (Design Notes) trái Boundaries (frozen) "không chữ 'khoá'/'trượt'"; người duyệt blind chỉ ra Design Notes còn 3 câu cũ dùng "at" chưa dạy, khác code.
  - **Đã sửa (ngoài khối frozen):** Design Notes đổi tiêu đề W2 thành "5 nguyên âm đôi gần tiếng Việt" / "3 âm có r kiểu Mỹ" (bỏ "Phần n ·" vì nhãn buổi đã có "Phần n/N"), W1 p2 "Ngày 2 · e, /æ/, a dài và â" (đúng thứ tự bảng âm), W3 p4 "Nhóm 4 · ★ θ ð ʃ ʒ + tʃ dʒ" (★ chỉ 4 âm như intro). Câu gợi ý khớp code: "Her teacher is in the store.", "They like my house.", "My family has a fast car." (W3 Nhóm 2 phải có /f/). Lời mời: "Để sau" ghi dấu cả viên có chung câu sai, để Matrix "Để sau → dải ẩn" đúng cả khi hoà (F13 / F09).
  - **Trạng thái xấu tránh được:** chữ "trượt" trên giao diện; người sau khôi phục câu "at" chưa dạy; Nhóm 2 không luyện /f/; bấm "Để sau" ở F13 thì dải đổi ngay sang F09 cho cùng 2 câu.
  - **KEEP:** luật `requires` / `exampleFeatures` của câu phần, id phần / câu, cách chia âm 4-4-4 / 5-3 / 6-6-6-6, thứ tự chọn lời mời và cách gộp `brickInvites` giữ nguyên.

## Review Triage Log

Lượt 1 (2026-11-09): 30 finding — 19 patch, 11 reject, 0 defer, không loopback.

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|-------|---------|---------|------------|-------|
| 1 | blind | W3 Nhóm 2 không còn âm /f/ trong câu luyện nói | medium | Ba câu "We have a very small home." / "He has a very nice house." / "My mom makes soup." không có /f/ (chỉ "fun" cũ có). Gộp với #18 | patch: câu 1 → "My family has a fast car." (có /f/, `requires` không đổi) |
| 2 | blind | Không test nào kiểm câu của phần có âm của phần | medium | `lesson-parts.test.ts` chỉ kiểm `requires` / `exampleFeatures` / id; lỗi #1 lọt qua | patch: ca mới tra IPA NGSL (+ bảng `EXTRA_IPA` cho dạng chia), mọi `soundIds` phải có trong câu của phần |
| 3 | blind | Buổi một phần bỏ mất intro tuần và `blocks` | medium | `PartedPronunciation` nhánh `part` chỉ hiện nhãn + `PartBlock`; intro W2 (định nghĩa nguyên âm đôi), W1 ("đọc to 3 lần"), W3 (★) không hiện. W1–W3 hiện không có `blocks` nên phần đó chưa xảy ra | patch: nhánh `part` hiện `pronunciation.intro` (GlossaryText) |
| 4 | blind | Lời mời ghi "Ôn" cho viên chưa từng học | low | Có thật khi `lastDoneAt` null, nhưng story 27 đã lọc câu cần viên chưa dạy nên hiếm gặp; chữ "Ôn viên gạch X" do intent chốt; sửa cần thêm nhánh | reject |
| 5 | blind | Đồng hồ lệch làm `dismissedAt` ở tương lai, che lời mời thật | low | Đúng về lý thuyết (`max(now, old, latestWrong)`), nhưng cần máy lệch nhiều ngày; sửa cần thêm giới hạn / nhánh | reject |
| 6 | blind | Câu đã sửa đúng ở Sổ lỗi vẫn được đếm | false | Intent chốt điều kiện là "câu trong Sổ lỗi có `lastWrongAt` trong 14 ngày"; code làm đúng như vậy, không phải lệch | reject |
| 7 | blind | "Xong phần này" không bỏ đánh dấu được | low | Đúng, nhưng phần vẫn mở được ở trang bài và buổi ôn cả tuần; sửa cần thêm hàm store mới (bề mặt mới) | reject |
| 8 | blind | Xem hết phần thì không có lối "Đánh dấu đã học xong" | false | `LessonStep` (Session.tsx) luôn có link "Trang bài: kiểm tra bài, ghi chú, đánh dấu xong" ở cuối bước bài | reject |
| 9 | blind | Design Notes lệch code, các log trống | low | Design Notes còn 3 câu "at" cũ; nay đã có Spec Change Log và log này | patch: đồng bộ Design Notes + Spec Change Log |
| 10 | blind | Bảng `PAIR_CONTRAST` viết tay không đối chiếu dữ liệu cặp | low | Chỉ gây hại khi ai đó đổi từ của cặp; sửa cần suy âm từ IPA (phức tạp) | reject |
| 11 | blind | "phần này" ở dải mời trùng nghĩa với "phần" của bài | low | `BrickReviewInvite.tsx` "…cùng cần phần này." cạnh "Phần 1/3", "Xong phần này". Gộp với #23 | patch: "…cùng cần kiến thức của viên này." |
| 12 | blind | Tiêu đề phần đặt tên 3 kiểu; W2 lặp "Phần 1/2" + "Phần 1 ·" | low | Người học thấy mỗi buổi W2; sửa là đổi chữ trực tiếp | patch: bỏ "Phần n ·" ở tiêu đề W2 (W1 "Ngày", W3 "Nhóm" giữ) |
| 13 | blind | UI mới không có test; tài liệu `brickInvites` khó tìm; app cũ xử lý `partsSeen` | medium | Phần test trùng gốc với #16, #17. Tài liệu đã có ở dòng Sân ga của `stack.md`; app cũ làm rơi `partsSeen` thì gộp mới lấy hợp nên tự lành (low) | patch phần test (qua #16, #17); phần tài liệu / app cũ reject |
| 14 | edge | "Để sau" ở viên này làm hiện ngay lời mời viên khác cho cùng câu | medium | Hoà F13 = F09 = 2 (w1-01 + w1-04): bấm "Để sau" ở F13 thì F09 hiện ngay, trái Matrix "Để sau → dải ẩn" | patch: `dismissBrickInvite` ghi dấu cả viên có chung câu sai; test mới |
| 15 | edge | Key `__proto__` trong `brickInvites` đồng bộ đổi prototype | low | Chỉ xảy ra với dữ liệu bị sửa tay; sửa là thêm guard | reject |
| 16 | vgap | `Session.finish()` gọi `markSeen` không có test | medium | Test W3 tự gọi `markLessonPartSeen`, không chạy đường của `finish()` | patch: hàm thuần `markSessionPartSeen(store, plan)` (plan.ts) dùng ở `finish()` qua `useLessonParts().markSessionSeen`; test ca thêm / đã có / Sân ga / không chia / ôn cả tuần, vòng W3 dùng hàm thật |
| 17 | vgap | `useBrickInvite` nối `lastDoneAt` / `hasContent` không có test | medium | Test chỉ tiêm deps tay | patch: `brickInviteFor(store, now, hasContent = hasBrickContent)` ở `store-context.ts`; test với `completeBrick` + `recordMistake` thật |
| 18 | content | W3 Nhóm 2 không luyện /f/ | medium | Trùng #1 | patch (cùng #1) |
| 19 | content | Bản dịch "Thầy giáo… đang ở" | low | Gán giới tính và gợi "đang" (thì tiếp diễn chưa học) | patch: "Giáo viên của cô ấy ở trong cửa hàng." |
| 20 | content | Tiêu đề W2 p1 dùng chữ "trượt" bị cấm | medium | Boundaries (frozen) cấm "trượt"; tiêu đề lấy từ Design Notes nên spec tự mâu thuẫn | patch: "5 nguyên âm đôi gần tiếng Việt" + Spec Change Log |
| 21 | content | Ghi chú W2 p1 coi "ô-u" là vần tiếng Việt | low | Trái mẹo `d-ou` (người Việt hay đọc "ô" đơn) | patch: "Bốn âm gần vần tiếng Việt (ây, ai, oi, ao) và /oʊ/ (ô rồi chuyển sang u)…" |
| 22 | content | Ghi chú W3 Nhóm 1 ngụ ý b d g cũng bật hơi | medium | Chỉ /p t k/ đầu từ bật hơi; dạy sai cho người mới | patch: "/p t k/ bật hơi ở đầu từ; cả 6 âm phải đọc rõ ở cuối từ." |
| 23 | content | "phần này" ở dải mời hai nghĩa | low | Trùng #11 | patch (cùng #11) |
| 24 | content | Tiêu đề Nhóm 4 đặt ★ cho cả 6 âm | low | Intro W3 và dữ liệu `focus` chỉ có 4 âm ★ | patch: "Nhóm 4 · ★ θ ð ʃ ʒ + tʃ dʒ" |
| 25 | content | Mỗi phần W3 lặp ghi chú nhóm với ký hiệu chưa học | low | Ghi chú nhóm (giải thích vô thanh / hữu thanh) hiện ngay dưới ghi chú phần nên thuật ngữ vẫn được giải thích; sửa cần đổi cách dựng nhóm | reject |
| 26 | content | "Âm mũi" không được giải thích | low | Không có trong glossary | patch: "/n ŋ/ (hơi ra đằng mũi), /l r/ và /j w/…" |
| 27 | content | Cặp /n/–/ŋ/ (thin–thing) có /θ/ chưa học | low | Dữ liệu cặp có từ trước story; âm so sánh n–ŋ cùng phần nên đúng luật; intent chỉ cho sửa cặp `c-s` | reject |
| 28 | content | `sue–zoo` trùng cặp của `c-z`, "sue" ít gặp | low | Cặp `sue–zoo` do intent (frozen) chốt | reject |
| 29 | content | "walk" có chữ l câm trong câu luyện /l/ | low | IPA đúng (`wɑːk`), các từ khác đã đủ /l/; không sai | reject |
| 30 | content | Tiêu đề W1 Ngày 2 khác thứ tự bảng âm | low | Người học thấy ngay; đổi chữ trực tiếp | patch: "Ngày 2 · e, /æ/, a dài và â" |

## Design Notes

**Chia phần (cố định).** Gần tiếng Việt trước, âm khó cuối. Mọi cặp dễ nhầm so với âm cùng phần hoặc phần trước.
- **W1:**
  - p1 "Ngày 1 · i và u, dài và ngắn" = `v-ii v-i v-uu v-u`;
  - p2 "Ngày 2 · e, /æ/, a dài và â" = `v-e v-ae v-aa v-uh`;
  - p3 "Ngày 3 · o dài, ơ nhẹ và âm cong lưỡi" = `v-oo v-schwa v-er-long v-er-weak`.
- **W2:**
  - p1 "5 nguyên âm đôi gần tiếng Việt" = `d-ei d-ai d-oi d-ou d-au`;
  - p2 "3 âm có r kiểu Mỹ" = `d-ir d-er d-ur`.
- **W3:**
  - p1 "Nhóm 1 · p b t d k g" = `c-p c-b c-t c-d c-k c-g`;
  - p2 "Nhóm 2 · f v s z h m" = `c-f c-v c-s c-z c-h c-m`;
  - p3 "Nhóm 3 · n ng l r y w" = `c-n c-ng c-l c-r c-y c-w`;
  - p4 "Nhóm 4 · ★ θ ð ʃ ʒ + tʃ dʒ" = `c-th c-dh c-sh c-zh c-ch c-j`.

**Câu luyện nói gợi ý.** Người làm có thể sửa, nhưng phải giữ luật `requires` / `exampleFeatures`. W1 chỉ dùng to be, W2 thêm hiện tại đơn khẳng định, W3 thêm phủ định / câu hỏi.
- **W1:**
  - p1: "This is a big school." · "The food is good." · "She is free this week.";
  - p2: "My bag is red." · "The cup is not hot." · "Is your job fun?";
  - p3: "My sister is a nurse." · "The water is warm." · "Her teacher is in the store.".
- **W2:**
  - p1: "They like my house." · "The boy knows my name." · "I go out at night.";
  - p2: "Their house is here." · "We share our chairs." · "She is a tourist here.".
- **W3:**
  - p1: "I don't need a big bag." · "Does he take the bus?" · "Put the cup down.";
  - p2: "My family has a fast car." · "He has a very nice house." · "My mom makes soup.";
  - p3: "We walk in the morning." · "Do you like yellow?" · "Young people run a lot.";
  - p4: "They usually watch TV." · "She doesn't share her things." · "Do they enjoy their jobs?".

**Lời mời:**

```ts
// mỗi câu trong sổ: q = getQuestion(id); bỏ nếu không có q.requires hoặc lastWrongAt < now - 14 ngày
// viên của câu = { conceptSource(c).brick | c ∈ q.requires } (một câu tính 1 lần cho mỗi viên)
// ứng viên X: count ≥ 2, hasContent(X), latestWrong(X) > max(dismissedAt(X), lastDoneAt(X))
// chọn: count ↓, latestWrong ↓, thứ tự BRICK_IDS ↓
// "Để sau" ở X: ghi dấu cho X và mọi viên có chung câu sai với X (dải ẩn hẳn, không đổi sang mời viên khác cho cùng câu)
```

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass. Test cũ chỉ đổi ở chỗ kỳ vọng `SessionPlan` / `search` của buổi bài.
- `TZ=Asia/Ho_Chi_Minh npx vitest run src/data/lessons src/lib/sessions src/lib/quiz src/lib/sync src/lib/backup src/lib/roadmap-progress.test.ts` -- expected: các ca mới đều pass.

**Manual checks:**
- Headless 375px (bản build không Supabase), store dựng sẵn ở 3 trạng thái:
  - đã bỏ qua Sân ga, chưa xem phần nào;
  - đã xem p1 của W1;
  - có 2 câu sai cần F09 trong Sổ lỗi.
- Mở `#/session`, `#/roadmap/lesson/s1-t1-w1`, `#/roadmap/lesson/s1-t1-w3`, `#/`.
- Kỳ vọng: `scrollWidth` = 375; URL buổi có `part` đúng; trang bài đúng nhãn phần; dải mời có, bấm "Để sau" thì ẩn.
