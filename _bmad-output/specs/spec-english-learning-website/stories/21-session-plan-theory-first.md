---
title: 'Buổi học theo sessionPlan: lý thuyết trước, nội dung bài hiện ngay trong buổi (CAP-2, CAP-23)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '3f45df7c3e4e45f07a88a8618f92d09802a0d8f5'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/19-brick-player-foundation-wall.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/20-row-a-content-placement-quizzes.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Nhịp:** mỗi buổi 30' học 1 viên gạch. Xong viên thì có nút "Học tiếp viên sau" nếu Huy còn hứng. Nút này không bắt buộc và chỉ hiện khi còn viên tiếp theo. Story này làm phần đó.
- **Kiểm tra cả 4 hàng trước (Soát vé):** đã làm ở story 20. Buổi học chỉ đọc kết quả: viên tiếp theo bỏ qua hàng đã xong (qua Soát vé, "Tôi biết rồi" hoặc học hết viên) và bỏ qua viên "Đang soạn". Buổi học không mời Soát vé và không khoá viên nào.
- **Mốc 750:** story này không đụng lịch (story 22). "Đang ở Sân ga" lấy theo `isInFoundation` của story 18.
- **Máy tính:** không làm hai cột, stepper dọc hay phím tắt (story 30, 31). Story này chỉ cấp sẵn `plan.steps` để story 30 sinh stepper từ đó.
- Claude chọn:
  - **`sessionPlan(store, hasContent)`** nằm ở `src/lib/sessions/plan.ts`. Danh sách viên có nội dung được truyền vào qua tham số, giống `nextBrickId`, vì sync import `@/lib/sessions` nên module này không được kéo nội dung viên theo.
  - **Hai loại buổi:**
    - Buổi Sân ga: `theory` "Lý thuyết" 12' → `review` "Ôn & từ mới" 8' → `fun` "Giải trí nhẹ" 10'.
    - Buổi bài: `lesson` "Bài chính" 15' → `srs` "Ôn flashcard" 5' → `fun` "Giải trí" 10'.
    - Cả hai đều tính 25 phút học (12 + 8 + 10 × ½), nên `SESSION_MINUTES` giữ nguyên.
  - **Viên của buổi Sân ga:**
    - Lấy viên tiếp theo theo `nextBrickId`.
    - Không có viên tiếp theo thì ôn lại viên có nội dung có `lastDoneAt` muộn nhất (`review: true`).
    - Chưa xong viên nào (chỉ có hàng qua bằng kiểm tra) thì ôn viên có nội dung đầu tiên thuộc hàng đã xong.
    - Không có viên nào thì `brickId: null`. Phần lý thuyết khi đó hiện "Các viên tiếp theo đang soạn" và link tới bức tường.
  - **Chốt kế hoạch bằng URL:**
    - Buổi Sân ga có dạng `/session?brick=F03&step=theory`, buổi bài có dạng `/session?lesson=s1-t1-w1&step=lesson`.
    - Vào `/session` không có tham số thì Session tính kế hoạch rồi `replace` URL về dạng chuẩn.
    - Có `brick` hợp lệ (viên có nội dung, chấp nhận chữ thường) thì luôn là buổi Sân ga, kể cả khi đã qua tường giữa buổi. Có cả `brick` lẫn `lesson` thì `brick` thắng.
    - Tham số lạ bị bỏ qua và kế hoạch được tính lại.
  - **Bảng ánh xạ `?step=` số cũ** (thứ tự cũ: 0 ôn, 1 bài, 2 giải trí):

    | `?step=` cũ | Buổi bài | Buổi Sân ga |
    |---|---|---|
    | `0` | `srs` | `review` |
    | `1` | `lesson` | `theory` |
    | `2` | `fun` | `fun` |

    - Thiếu `step` thì vào bước đầu của kế hoạch.
    - Tên bước không thuộc kế hoạch, hoặc số khác 0–2, cũng vào bước đầu.
  - **"Học tiếp viên sau":** bấm thì `replace` `brick=` sang viên sau, vẫn ở bước `theory`, và BrickPlayer mount lại. Buổi ghi `lessonId` của viên đang ở trên URL lúc bấm "Xong buổi" (`brickLessonId`, dạng `f03`).
  - **BrickPlayer trong buổi:** thêm `variant: 'page' | 'session'` (mặc định `page`, trang `/foundation/:id` giữ y nguyên) và `endSlot?: ReactNode`. Với `session`:
    - không có link "Bức tường";
    - tiêu đề là `h2`;
    - màn cuối hiện `endSlot` thay cho nút "Về bức tường".
  - **Buổi bài:**
    - Bỏ link "Mở trang bài" ở đầu bước. Nội dung (bảng âm, TenseCard, nút thi O.W.L.) hiện ngay trong thẻ đoạn qua `LessonSectionContent`.
    - Cuối bước có một link nhỏ "Trang bài: kiểm tra bài, ghi chú, đánh dấu xong", vì các việc đó chỉ có ở trang bài.
  - **`prioritizeSections`:**
    - Đoạn lý thuyết là `pronunciation` và `grammar`. Hai đoạn này luôn đứng trước và giữ nguyên thứ tự.
    - Chỉ các đoạn luyện (`vocabulary`, `checkpoint`, `main`) được xếp đoạn ưu tiên lên trước.
    - Nhãn "Ưu tiên" vẫn gắn cho mọi đoạn mang tag kỹ năng yếu nhất, trừ đoạn giải trí.
    - Trang bài cũng theo luật này.
  - **Giải trí nhẹ ở Sân ga:** dùng 2 video VOA Let's Learn English L1, L2 đã có trong `videos.json` (`WR9_nsLyaEY`, `1-U7o9xjWQc`, đã kiểm oEmbed), kèm link VOA Learning English. Không thêm video mới (L3 chưa có ID đã kiểm).

**Problem:**
- Buổi 30' đang chạy ngược: ôn flashcard → bài → giải trí (`Session.tsx:19-23`). Lý thuyết của bài nằm sau link "Mở trang bài".
- Khi đang ở Sân ga, buổi học không biết gì về viên gạch, nên Huy phải tự vào bức tường.
- `prioritizeSections` có thể đẩy đoạn lý thuyết xuống dưới đoạn luyện.

**Approach:**
- Hàm thuần `sessionPlan` chọn loại buổi và viên của buổi. `resolveSessionPlan` chốt kế hoạch trên URL và ánh xạ `?step=` cũ.
- Session sinh stepper từ `plan.steps`, chạy BrickPlayer ngay trong buổi, và hiện nội dung bài qua `LessonSectionContent` tách từ `Lesson.tsx`.
- Sửa `prioritizeSections` theo luật lý thuyết trước.
- Rà các chỗ đọc `lessonId` của buổi để chắc chúng chịu được id `fNN`.

## Boundaries & Constraints

**Always:**
- Lý thuyết luôn là bước đầu của buổi. Nút "Tiếp" bấm được bất cứ lúc nào. Phút chỉ là gợi ý (`StepClock`). Rời buổi giữa chừng không ghi gì. Chỉ "Xong buổi" ghi `record('full', now, { lessonId })`.
- Không khoá, không phạt:
  - học viên trong buổi gọi `completeBrick` như ở trang viên;
  - không gọi `resumeFoundation`;
  - không ghi Sổ lỗi, quiz hay điểm Nhà ngoài những gì `record` và BrickPlayer đang làm.
- Logic chọn kế hoạch, giải tham số URL, ánh xạ bước, viên học tiếp và `prioritizeSections` đều là hàm thuần có test. Ngày giờ lấy qua tham số.
- `src/lib/sessions` chỉ được import `@/lib/foundation` và `@/data/foundation` (danh mục). Không import `@/data/foundation/content` hay `row-test`. `@/lib/foundation` không được import `@/lib/sessions`.
- Giao diện 375px:
  - trang `/roadmap/lesson/...` và `/foundation/:id` hiện y như trước (tách component, không đổi DOM hay class), trừ thứ tự đoạn theo luật `prioritizeSections` mới;
  - Session giữ khung cũ (stepper lưới 3 cột, header, đồng hồ, hàng nút) và không có cuộn ngang.
- Tiếng Việt, giọng nhẹ. Dòng mô tả của chế độ ôn theo viên đang ôn (sửa ở review, xem Spec Change Log):
  - viên xong gần nhất: "Các viên tiếp theo đang soạn, hôm nay ôn lại viên gần nhất.";
  - viên đã học nhưng không phải gần nhất (URL chốt viên cũ): "Các viên tiếp theo đang soạn, hôm nay ôn lại viên này.";
  - chưa học viên nào, hàng qua bằng kiểm tra: "Các viên tiếp theo đang soạn. Hàng này bạn đã qua, hôm nay ôn lại cho chắc."

**Never:**
- Không làm Hôm nay (thẻ Sân ga, ẩn thẻ), Thư nhập học, Mũ 4 câu, lịch hay ngày lười (story 22). Ở `Today.tsx` chỉ đổi đích của nút "Bắt đầu buổi 30'" thành `/session`.
- Không làm số từ mới, thẻ "Làm quen" hay cổng IPA (story 23, 24). Không chia bài T1 theo ngày, không làm lời mời ôn viên (story 28). Không làm `requires` (story 27). Không cộng +5 điểm Nhà hay làm màn "Qua bức tường" (story 26).
- Không thêm lớp `lg:`/`xl:`, SplitLayout, stepper dọc hay phím tắt (story 29–31).
- Không đổi shape store, migration, luật gộp, `SessionDay`, `SESSION_MINUTES` hay `recordSession`. Không thêm hay sửa video trong `videos.json`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sân ga, có viên tiếp | Đang ở Sân ga, F01–F02 xong, có nội dung F01–F06 | `mode: 'foundation'`, `brickId: 'F03'`, `review: false`; bước theory 12 / review 8 / fun 10 | N/A |
| Bỏ hàng xong, viên đang soạn | `rows.A.passed`, chưa xong viên nào, F07+ chưa có nội dung | Không có viên tiếp; chưa xong viên nào nên `brickId: 'F01'`, `review: true` | Không có viên nào có nội dung → `brickId: null`, bước lý thuyết hiện "đang soạn" + link bức tường |
| Ôn viên gần nhất | F01–F06 xong, F04 có `lastDoneAt` muộn nhất, F07 chưa có nội dung | `brickId: 'F04'`, `review: true`, tiêu đề "Ôn lại: F04 · …" | N/A |
| Sau Sân ga | `skipped` hoặc `completed` | `mode: 'lesson'`, `lesson` = `sessionLesson(store)`; bước lesson 15 / srs 5 / fun 10 | Hết lộ trình (`lesson: null`) → thẻ "Bạn đã đi hết lộ trình" như cũ |
| Quay lại Sân ga | Đã bỏ qua rồi bấm "Quay lại Sân ga" | `mode: 'foundation'` | N/A |
| Chốt URL | Vào `/session` lúc ở Sân ga, viên tiếp là F03 | URL `replace` thành `?brick=F03&step=theory` | N/A |
| Kế hoạch đã chốt | URL `?brick=F06&step=fun`, F06 vừa làm Sân ga xong (`completed`) | Vẫn là buổi Sân ga tới "Xong buổi"; ghi `lessonId: 'f06'`, `kind: 'full'`, 25 phút | N/A |
| Học tiếp viên sau | Trong buổi, F03 tới màn Áp dụng, viên tiếp là F04 | Màn cuối có nút "Học tiếp viên sau: F04 · …". Bấm thì URL thành `brick=F04&step=theory` và player chạy F04 từ màn 1 | Không còn viên tiếp, hoặc đang ôn → không có nút |
| URL `?step=` cũ | `?lesson=s1-t1-w1&step=0`, `=1`, `=2` | Buổi bài; bước `srs` / `lesson` / `fun`; URL đổi sang tên bước | N/A |
| `?step=` cũ ở Sân ga | Đang ở Sân ga, URL `?step=1` không có `brick`/`lesson` | Tính kế hoạch Sân ga, vào bước `theory` | N/A |
| Tham số lạ | `brick=F99`; `brick=F09` (đang soạn); `lesson=xyz`; `step=abc`; `step=srs` ở buổi Sân ga | Bỏ tham số sai, tính lại kế hoạch hoặc vào bước đầu; `brick=f03` → `F03` | Không crash |
| Nội dung bài trong buổi | Buổi bài `s1-t1-w1`, bước lesson | Thẻ Phát âm có `PronunciationSection`, thẻ Ngữ pháp có `GrammarSection`; không có đoạn giải trí; không có link "Mở trang bài" ở đầu; cuối bước có link trang bài | Bài không có nội dung soạn sẵn → thẻ đoạn như cũ |
| prioritizeSections | `s1-t1-w1`, yếu nhất `vocabulary` / `grammar` / `null`; bài có checkpoint, yếu nhất `vocabulary` | vocab: thứ tự giữ nguyên, vocabulary có "Ưu tiên". grammar: pronunciation rồi grammar ("Ưu tiên"), không đảo. null: giữ nguyên. Bài checkpoint: vocabulary lên trước checkpoint nhưng vẫn sau lý thuyết | Đoạn giải trí không bao giờ "Ưu tiên" |
| `lessonId` dạng fNN | `recordSession(store, 'full', now, { lessonId: 'f03' })` | `isSessionDay` true; streak, `studyHours` (+25'), `housePoints`, `statusFor` (Gist), `mergeSessionDays`, backup đều nhận; `resolveSessionLesson('f03', fb)` trả `fb` | Không ném lỗi |
| Giải trí nhẹ | Buổi Sân ga, bước fun | 2 video VOA LLE L1, L2 và link VOA Learning English; mô tả nhắc "Let's Learn English L1–L3" | Không có video (dữ liệu đổi) → chỉ link |

</frozen-after-approval>

## Code Map

**Buổi học**
- `src/pages/Session.tsx` -- `STEPS` cứng (19-23), `Stepper`, `LessonStep` (link "Mở trang bài" 74-76, `prioritizeSections` 79-84), `FunStep`, `goTo`/`finish` (129-139) và `?step=` số (124-125). Viết lại theo `plan`.
- `src/lib/sessions/sessions.ts` -- dùng lại `sessionLesson`, `resolveSessionLesson`, `wordListForLesson`, `SESSION_MINUTES` (chỉ sửa chú thích "12 + 8 + 10/2 = 25" cho buổi Sân ga) và `recordSession`. `index.ts` re-export `plan.ts`.
- `src/app/store-context.ts` -- `useSessions().record`, `useLoadedStore()` (trang được dùng trực tiếp, như `Today.tsx`), `useFoundation().completeBrick`.
- `src/components/session/SessionParts.tsx` -- `StepClock`, `LinkList`, `BackToToday`, `SessionDoneView`; dùng lại, không sửa.
- `src/pages/Today.tsx:138` -- nút "Bắt đầu buổi 30'" đang link `?lesson=` nên sẽ ép buổi bài khi đang ở Sân ga. Đổi thành `/session`.

**Sân ga**
- `src/lib/foundation/player.ts` -- dùng lại `nextBrickId`, `nextBrickIdFromState`. `foundation.ts`: dùng lại `readFoundation` (`bricks[id].lastDoneAt`), `isInFoundation`, `foundationState().rowsDone`.
- `src/data/foundation/catalog.ts` -- dùng lại `BRICKS`, `isBrickId`, `getBrickMeta`, `brickLessonId`, `brickIdFromLessonId`. `content.ts`: `hasBrickContent`, `getBrick`. Chỉ trang import, `lib/sessions` không import.
- `src/components/foundation/BrickPlayer.tsx` -- link "Bức tường" (64-70), `h1` (74), nút "Về bức tường" ở màn cuối (136-139). Thêm `variant`/`endSlot`, mặc định giữ nguyên.

**Bài**
- `src/pages/Lesson.tsx:171-181` -- các `children` của `LessonSectionCard`: `PronunciationSection`, `GrammarSection`, `EntertainmentLinks`, nút thi O.W.L. Tách ra `LessonSectionContent`. `ReadingSourceContext.Provider` (160-163) giữ ở nơi gọi; Session cũng bọc như vậy.
- `src/components/roadmap/LessonSectionCard.tsx` -- không sửa.
- `src/lib/placement/gaps.ts:144` (`prioritizeSections`) + `placement.test.ts:209-228, 309-318`. Ca "đoạn ngữ pháp lên đầu" phải đổi kỳ vọng thành "giữ thứ tự, ngữ pháp có nhãn Ưu tiên".

**Giải trí**
- `src/data/videos/index.ts` (`funStepVideos`, `LESSON_VIDEOS`), `src/data/roadmap/entertainment-links.ts` (`SOURCES`, `byName`, `DEFAULT_ENTERTAINMENT_LINKS`).

**Rà id fNN** (chỉ đọc, thêm test, không sửa logic nếu đã chịu được)
- `SessionDay.lessonId` hiện không ai đọc. Cần rà các module sau:
  - `points.ts` (`housePoints`, `longestStreak`, `comebackCount`), `medals.ts`;
  - `gaps.ts` (`studyHours`, `skillGaps` qua `sessionLesson`);
  - `gist.ts` (`statusFor`);
  - `merge.ts` (`mergeSessionDays`), `backup.ts` (`ENTRY_VALID.sessions`).
- Các nơi gọi `getLessonEntry`/`getLesson`:
  - `sessions.ts:114,133`;
  - `source-label.ts:18` (story 20 đã xử lý `fNN`);
  - `owl.ts:127` (`isStageOneLesson('f03')` → false, nên `reviewPlan` bỏ qua mục Sổ lỗi `fNN`);
  - `comeback.ts:143-147` (`lastIfMissing` xếp id lạ cuối);
  - `SortingHat.tsx:31` (chỉ nhận id bài từ Mũ).
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`, không có test component. `npm test` chạy với `TZ=Asia/Ho_Chi_Minh`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/sessions/plan.ts`, `index.ts` -- tạo các phần sau:
  - kiểu `SessionStepId = 'theory'|'review'|'lesson'|'srs'|'fun'`, `SessionStep { id, title, minutes }`, hằng `FOUNDATION_STEPS` và `LESSON_STEPS`;
  - `SessionPlan`, gồm hai dạng:
    - `{ mode: 'foundation'; brickId: BrickId | null; review: boolean; steps }`;
    - `{ mode: 'lesson'; lesson: SessionLesson | null; steps }`;
  - `sessionPlan(store, hasContent)` theo Decisions;
  - `LEGACY_STEP_MAP`;
  - `resolveSessionPlan({ brick, lesson, step }, store, hasContent)` trả `{ plan, stepIndex, search }`, trong đó `search` là tham số chuẩn để `replace`;
  - `sessionRecordLessonId(plan)` trả `brickLessonId(brickId)` hoặc `lesson.id`, không có thì `undefined`;
  - `followUpBrickId(store, currentId, hasContent)` trả `nextBrickId` khi khác `currentId`, không thì null.
- [x] `src/lib/sessions/plan.test.ts` -- mỗi dòng Matrix từ "Sân ga, có viên tiếp" tới "Tham số lạ" một ca. Dùng `hasContent` giả (F01–F06) và store dựng bằng `completeBrick`/`markRowTested`/`skipFoundation`/`resumeFoundation`.
- [x] `src/lib/sessions/sessions.test.ts` (+ `src/lib/trophies/trophies.test.ts`, `src/lib/placement/placement.test.ts`, `src/lib/gist/gist.test.ts`, `src/lib/sync/merge.test.ts`, `src/lib/backup/backup.test.ts`, `src/lib/owl/owl.test.ts`, `src/lib/comeback/comeback.test.ts`) -- thêm ca theo dòng "`lessonId` dạng fNN", cùng ca Owl `reviewPlan` có mục Sổ lỗi `lessonId: 'f03'` không ném lỗi và không lấy mục đó. Chỉ sửa code nếu ca nào fail.
- [x] `src/lib/placement/gaps.ts` (+ `placement.test.ts`) -- `THEORY_SECTION_IDS = ['pronunciation', 'grammar']`; `prioritizeSections` xếp theo thứ tự [lý thuyết giữ nguyên] + [luyện ưu tiên] + [luyện còn lại]; cập nhật JSDoc và ca test theo dòng "prioritizeSections".
- [x] `src/components/lesson/LessonSectionContent.tsx`, `src/pages/Lesson.tsx` -- tách `LessonSectionContent({ lesson, stage, section, content })` ra component riêng. Lesson dùng lại component này; DOM không đổi.
- [x] `src/components/foundation/BrickPlayer.tsx` -- thêm `variant` và `endSlot` như Decisions. `variant='page'` render y như cũ.
- [x] `src/data/videos/index.ts` (+ `src/data/videos/videos.test.ts`), `src/data/roadmap/entertainment-links.ts` -- tạo các phần sau:
  - `FOUNDATION_FUN_VIDEO_IDS` và `foundationFunVideos()`: giữ thứ tự, bỏ id không có trong dữ liệu;
  - `FOUNDATION_FUN_LINKS` (VOA Learning English).
  - Test: mỗi id có trong `LESSON_VIDEOS`, kênh `VOA Learning English`.
- [x] `src/pages/Session.tsx` -- làm như sau:
  - Đọc `useSearchParams` rồi gọi `resolveSessionPlan(…, hasBrickContent)` (memo theo store và params). `search` khác URL thì `setParams(search, { replace: true })`.
  - `Stepper` sinh từ `plan.steps`.
  - Bước `theory`: nhãn "Ôn lại: Fxx · …" kèm dòng mô tả khi `review`; `BrickPlayer variant="session" key={brickId}`; `endSlot` là nút "Học tiếp viên sau" (`followUpBrickId`); `brickId` null thì hiện thẻ "đang soạn".
  - Bước `review`/`srs`: `FlashcardSession` (buổi Sân ga dùng `'ngsl'`), lời hết giờ theo số phút của bước.
  - Bước `lesson`: `LessonSectionCard` + `LessonSectionContent` trong `ReadingSourceContext.Provider`, thêm link trang bài ở cuối.
  - Bước `fun`: video và link theo loại buổi.
  - `finish` gọi `record('full', new Date(), { lessonId: sessionRecordLessonId(plan) })`.
  - Chuyển bước bằng tên bước.
- [x] `src/pages/Today.tsx` -- nút "Bắt đầu buổi 30'" → `/session`; không đổi gì khác.

**Acceptance Criteria:**
- Given store đang ở Sân ga và đã xong F01, F02, when bấm "Bắt đầu buổi 30'" trên Hôm nay, then:
  - buổi mở ở "Lý thuyết 12'" với F03 chạy ngay trong trang;
  - tới màn Áp dụng thì F03 sáng trên bức tường, có nút "Học tiếp viên sau: F04 · …";
  - "Tiếp" sang "Ôn & từ mới 8'" rồi "Giải trí nhẹ 10'";
  - "Xong buổi" tăng streak, nhật ký hôm nay có `lessonId: 'f03'`.
- Given đã bỏ qua Sân ga, when bắt đầu buổi, then thứ tự là "Bài chính 15'" (bảng âm và Ngữ pháp hiện ngay trong buổi, không phải mở trang bài) → "Ôn flashcard 5'" → "Giải trí 10'".
- Given URL cũ `/session?lesson=s1-t1-w1&step=1` (lưu trước khi nâng cấp), when mở, then vào đúng bước Bài chính của bài đó, không lỗi.
- Given màn hình 375px, when mở `/session` ở cả hai loại buổi, `/roadmap/lesson/s1-t1-w1` và `/foundation/F01`, then không có cuộn ngang. Trang bài và trang viên trông như trước.

## Implementation Notes

- **Files:** `src/lib/sessions/{plan,plan.test}.ts` (mới), `index.ts` (re-export `plan`), `sessions.ts` (chỉ chú thích `SESSION_MINUTES` và `SessionDay.lessonId`); `src/lib/placement/gaps.ts` (+ `placement.test.ts`); `src/components/lesson/LessonSectionContent.tsx` (mới), `src/pages/Lesson.tsx`; `src/components/foundation/BrickPlayer.tsx`; `src/data/videos/{index,videos.test}.ts`, `src/data/roadmap/entertainment-links.ts`; `src/pages/{Session,Today}.tsx`; thêm ca fNN vào `sessions.test.ts`, `trophies.test.ts`, `placement.test.ts`, `gist.test.ts`, `merge.test.ts`, `backup.test.ts`, `owl.test.ts`, `comeback.test.ts`.
- **`plan.ts`:** `FOUNDATION_STEPS` / `LESSON_STEPS`, `sessionPlan` (Sân ga: `nextBrickIdFromState` → ôn viên có nội dung có `lastDoneAt` muộn nhất → viên có nội dung đầu tiên của hàng đã xong → `null`), `LEGACY_STEP_MAP` (`'0'|'1'|'2'` → `{ lesson, foundation }`), `resolveSessionPlan` (brick hợp lệ, chấp nhận chữ thường, thắng lesson; lesson hợp lệ → buổi bài đó kể cả khi đang ở Sân ga, để URL cũ `?lesson=…&step=1` vẫn đúng; còn lại tính lại), thêm `sessionSearch(plan, index)` (tham số chuẩn, cũng dùng khi chuyển bước), `sessionRecordLessonId`, `followUpBrickId`. Với `brick` đã chốt, `review` = không còn viên tiếp theo (cùng nghĩa với `sessionPlan`). Module chỉ import `@/data/foundation` (danh mục) và `@/lib/foundation`; không có vòng import.
- **Session:** memo theo `store` + 3 tham số, effect `replace` khi `search` khác URL. Stepper/icon sinh từ `plan.steps`. `review` được chốt theo viên lúc vào buổi (state trong Session), để học xong viên có nội dung cuối cùng giữa buổi không đổi tiêu đề thành "Ôn lại". Nút "Học tiếp viên sau: Fxx · …" chỉ hiện khi không ôn và `followUpBrickId` khác null; bấm thì `replace` `{ brick, step: 'theory' }`, `BrickPlayer key={brick.id}` mount lại. Bước `review`/`srs` dùng `FlashcardSession` (`'ngsl'` ở Sân ga), lời hết giờ "Hết N' rồi, sang <bước sau> nhé…". Bước `fun` Sân ga: `foundationFunVideos()` + `FOUNDATION_FUN_LINKS`, mô tả "VOA Let's Learn English L1–L3 … Bài 3 xem trên trang VOA". `brickId` null → thẻ "Các viên tiếp theo đang soạn" + "Xem bức tường".
- **BrickPlayer:** `variant='session'` bỏ link "Bức tường", tiêu đề `h2`, màn cuối hiện `endSlot` (không có thì để trống); `page` không đổi.
- **`prioritizeSections`:** `THEORY_SECTION_IDS` giữ nguyên thứ tự ở đầu, rồi đoạn luyện ưu tiên, rồi đoạn luyện còn lại. Lưu ý: đoạn checkpoint chặng 1 (O.W.L. 1) mang cả 5 tag, nên với yếu nhất `vocabulary` cả checkpoint lẫn từ vựng đều "Ưu tiên" và checkpoint vẫn đứng trước. Ca "từ vựng lên trước checkpoint" trong Matrix vì vậy được test bằng bài dựng tay có checkpoint mang tag Part (như chặng 2–3); bài O.W.L. thật có ca riêng (lý thuyết đứng đầu).
- **Rà fNN:** mọi ca mới pass, không phải sửa logic ở `points`, `medals`, `gaps`, `gist`, `merge`, `backup`, `owl`, `comeback`.
- **Kiểm chứng:** `npm run lint && npm test && npm run build` pass (56 file, 1083 test; `check-precache` OK; cảnh báo chunk size có sẵn). Headless Chrome 375px (CDP, dev server không Supabase), 51/51 kiểm tra pass: Hôm nay → `/session` chốt `?brick=F03&step=theory`; F03 chạy trong buổi, không có link "Bức tường"; đi tới màn Áp dụng thì `bricks.F03` được ghi, có nút "Học tiếp viên sau: F04 · …", không có "Về bức tường"; review → fun (2 video VOA L1/L2 + link VOA); "Xong buổi" ghi `full`/25/`f03`, streak 1; học tiếp → `brick=F04&step=theory`, F04 từ màn 1, xong buổi ghi `f04`; chế độ ôn F04 có tiêu đề và mô tả đúng, không có nút học tiếp; đã bỏ qua → `?lesson=s1-t1-w1&step=lesson`, đoạn Phát âm/Ngữ pháp/Từ vựng có nội dung inline, không còn "Mở trang bài", có link trang bài ở cuối; `?step=0|1|2` cũ, `?step=1` ở Sân ga và 6 ca tham số lạ đều đúng; không cuộn ngang ở mọi bước; không lỗi JS. `/roadmap/lesson/s1-t1-w1`, `/foundation/F01`, `/foundation/F04`: `main.innerHTML` giống hệt bản `HEAD` (chạy song song từ `git archive HEAD`, cố định `Date.now`/`Math.random`), không cuộn ngang.
- **Rủi ro / chưa làm:** (1) Phần giao diện (Session, BrickPlayer `variant`) không có test tự động (Vitest env `node`), chỉ kiểm bằng headless Chrome ở trên. (2) ~~Đồng hồ gợi ý không đặt lại khi bấm "Học tiếp viên sau"~~ (đã sửa ở review: `StepClock` key theo bước + viên). (3) Quay lại bước lý thuyết sau khi đã sang bước khác thì BrickPlayer mount lại từ màn 1 (như bản cũ khi rời bước bài).

## Spec Change Log

- **2026-11-06 — review vòng 1 (finding blind #3 + edge #3):** câu mô tả chế độ ôn trong "Always" là một câu cố định
  "… hôm nay ôn lại viên gần nhất.", trong khi dòng Matrix "Bỏ hàng xong, viên đang soạn" cho `review: true` với F01 chưa
  từng học (qua hàng bằng Soát vé) và URL chốt có thể là viên cũ không phải gần nhất, nên câu cố định nói sai. Sửa phần
  frozen: tách 3 câu theo `reviewNote` (`latest` giữ nguyên câu cũ; `done`, `tested` có câu riêng). Trạng thái tránh được:
  Huy qua hàng A bằng Soát vé rồi vào buổi đầu tiên thấy "ôn lại viên gần nhất" cho viên chưa học. KEEP: `review` và
  `brickId` của `sessionPlan`/`resolveSessionPlan` không đổi; tiêu đề "Ôn lại: Fxx · …" giữ nguyên; lời mô tả chốt cùng
  `review` lúc vào buổi (`lockTheory`).

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | URL cũ ở bước SRS (`?lesson=X` không có `step`) giờ mở bước `lesson` thay vì `srs` | low | Đúng: `goTo(0)` bản cũ bỏ `step`. Nhưng spec frozen ghi rõ "Thiếu `step` thì vào bước đầu"; chỉ gặp với tab/bookmark mở dở từ trước khi nâng cấp, và vào bài chính (lý thuyết trước) vẫn hợp ý buổi mới, bấm "Tiếp" là tới flashcard. Sửa cần thêm nhánh trái spec | reject |
| 2 | blind + edge #2 | Khoá "Ôn lại" mất khi Session mount lại (reload sau khi học xong F06) | low | Đúng là `lock` nằm trong state. Nhưng sau khi F06 xong thì F06 thật sự đã học và không còn viên tiếp; tiêu đề "Ôn lại: F06" + "ôn lại viên gần nhất" là đúng sự thật; BrickPlayer cũng mount lại từ màn 1 (rủi ro 3 đã ghi). Kế hoạch (viên, bước) vẫn giữ đúng nhờ URL. Sửa cần thêm tham số URL | reject |
| 3 | blind + edge #3 | Câu "ôn lại viên gần nhất" sai khi viên chưa học (hàng qua bằng Soát vé) hoặc URL chốt viên cũ | medium | `foundationBrick` trả viên đầu của hàng đã qua với `review: true` (test "Bỏ hàng xong"); với nội dung F01–F06, qua hàng A bằng Soát vé là đủ để gặp. Câu cố định nằm trong frozen spec → sửa spec + code: `reviewNote` (`latest`/`done`/`tested`) và 3 câu, có test | patch (sửa spec) |
| 4 | blind | `goTo` không dùng `sessionSearch`, `sessionSearch` không có test riêng | low | `goTo` tự dựng `{ ...search, step }`, lệch Implementation Notes; sửa một dòng | patch |
| 5 | blind + vgap | Khoá review, `'ngsl'` nằm trong Session, không có test | medium | vgap đã kiểm: không test nào mô hình khoá; bỏ khoá thì không test nào fail. Thêm hàm thuần `lockTheory` + `sessionWordList` trong `plan.ts`, Session gọi; test F06 vào buổi `review: false`, sau `completeBrick` resolver ra `true` nhưng khoá giữ `false` | patch |
| 6 | blind | Test phút so số gõ tay với chính nó | low | `expect(12 + 8 + 10 / 2)` không đọc `plan.steps`; sửa thành `studyMinutes(plan)` | patch |
| 7 | blind | Giải trí nhẹ hứa L3 nhưng không có link thẳng; câu cứng khi không có video | low | Frozen spec chọn chỉ link VOA Learning English vì L3 chưa có ID/URL đã kiểm; câu "Bài 3 xem trên trang VOA" vẫn đúng (link tới trang VOA). Ca không có video không xảy ra: `videos.test.ts` khoá 2 id | reject |
| 8 | blind + edge #1 | Đồng hồ không đặt lại khi "Học tiếp viên sau" | low | `StepClock key={meta.id}` giữ `theory` khi đổi viên; sửa key thành `${meta.id}:${brickId}` | patch |
| 9 | blind | Nút học tiếp có thể chỉ lùi (`?brick=F05` khi viên tiếp là F03) | low | Chỉ gặp khi tự gõ URL viên vượt trước; nút chỉ tới viên tiếp theo đúng lộ trình theo định nghĩa `followUpBrickId` của spec | reject |
| 10 | blind | Hôm nay vẫn hiện "Bài hiện tại" (bài lộ trình) trong khi nút mở buổi Sân ga | medium | Đúng (`Today.tsx` thẻ "Bài hiện tại"). Intent frozen loại trừ: "Không làm Hôm nay… Ở `Today.tsx` chỉ đổi đích của nút"; story 22 làm thẻ Sân ga | defer |
| 11 | blind | Câu viên gạch trong bài test quay lại → `sectionHref('f03', …)` là route hỏng | medium | `weakestSectionFrom` trả `lessonId: 'f03'`, `ComebackNext` (`Quiz.tsx`) dựng `sectionHref`. Có từ story 20 (câu `q-fNN` vào `QUESTION_BANK` + Sổ lỗi), story này chỉ thêm test | defer |
| 12 | blind | Bước "Ôn & từ mới" luôn dùng `'ngsl'`, không theo viên | false | Frozen spec chốt "buổi Sân ga dùng `'ngsl'`"; từ mới theo viên là story 23/24 | reject |
| 13 | blind | Test O.W.L. 1 thật quá yếu | low | Dùng `!`, không kiểm checkpoint "Ưu tiên" đứng trước từ vựng, không kiểm `weakest: null`; bổ sung | patch |
| 14 | blind | Sổ sách spec lệch (status, log rỗng, "ảnh chụp develop", chú thích `SESSION_MINUTES`) | false | Status/log được cập nhật ở bước này; `HEAD` chính là `develop`; spec cấm sửa `SESSION_MINUTES`, chú thích chỉ đổi thứ tự cộng, cùng giá trị 25 | reject |
| 15 | edge #4 | Kế hoạch không chốt (`brickId`/`lesson` null) đổi loại buổi giữa chừng khi store đổi | low | Với nội dung F01–F06, `brickId: null` gần như không xảy ra; `lesson: null` đổi sang Sân ga chỉ khi bấm "Quay lại Sân ga" ở trang khác hoặc sync; hậu quả chỉ về bước đầu; sửa cần thêm tham số URL | reject |
| 16 | vgap (other) | `!review` trong điều kiện `endSlot` thừa | false | Reviewer tự kết luận không phải lỗi: khi ôn thì `followUpBrickId` đã null | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `git diff --stat` -- expected: không có file trong `src/lib/storage`, `src/lib/sync/merge.ts` (trừ test), `src/data/videos/videos.json`, `public/`.

**Manual checks:**
- Headless Chrome 375px với store dựng sẵn để kiểm các điểm sau:
  - buổi Sân ga: chạy F03 trong buổi, có nút "Học tiếp viên sau", đi đủ 3 bước, xong buổi;
  - buổi sau Sân ga: nội dung bài hiện inline;
  - URL `?step=0|1|2` cũ vào đúng bước;
  - `/roadmap/lesson/s1-t1-w1` và `/foundation/F01` giống ảnh chụp trên `develop`; không có cuộn ngang.
