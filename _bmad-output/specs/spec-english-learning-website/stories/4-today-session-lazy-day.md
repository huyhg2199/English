---
title: 'Trang Hôm nay, buổi 30 phút và ngày lười 10 phút'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: 'af498bdca84e02a0e45ca16d7ba2eb880661c7f4'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Bài của buổi** = bài chưa xong đầu tiên trên lộ trình (`computeRoadmapProgress().nextLessonId`). Buổi học không tự đánh dấu bài xong (một bài kéo dài cả tuần); nút tạm ở trang bài vẫn giữ.
- **Không ép thời gian:** mỗi phần có đồng hồ đếm ngược (5' / 15' / 10' và 10' cho ngày lười) chỉ để gợi ý; nút "Tiếp" bấm được bất cứ lúc nào. Hết giờ phần SRS thì gợi ý chuyển phần, không cắt thẻ đang dở.
- **Buổi tính là hoàn thành** khi Huy tới cuối phần cuối và bấm "Xong buổi" (kể cả đã bỏ qua phần nào đó). Mỗi ngày (giờ máy) ghi một mục nhật ký; buổi chuẩn ưu tiên hơn buổi lười khi cùng ngày.
- **Streak** = số ngày liên tiếp có buổi hoàn thành (chuẩn hoặc lười), tính tới hôm nay; hôm nay chưa học thì tính tới hôm qua, không coi là đứt.
- **Ngày lười:** 1 tin hot ngắn lấy từ Google AI Blog RSS (`https://blog.google/innovation-and-ai/technology/ai/rss/`, có tiêu đề + đoạn mô tả), lỗi thì lấy tin đầu HN (`hn.algolia.com/api/v1/search?tags=front_page`, chỉ tiêu đề + link). Huy chạm vào từ trong tin để lưu, đủ 3 từ thì xong buổi. Từ lưu kèm câu chứa nó và nguồn (tiêu đề + URL) vào key `savedWords` (story 8 dùng tiếp).
- **Ngày lười khi offline / cả hai nguồn lỗi:** thay tin bằng 3 từ mới của SRS (flashcard như phần 5'), xong 3 thẻ là xong buổi.
- **Phần 10' giải trí:** hiện việc của đoạn giải trí trong bài + link chọn sẵn ứng với nguồn được nhắc tên (LyricsTraining, VOA, YouGlish, ELLLO, BBC…) lấy URL gốc từ `nguon-hoc-mien-phi.md`; bài không nhắc nguồn nào thì hiện 3 link mặc định (LyricsTraining, VOA Learning English, YouGlish).
- **Từ mới theo chặng** (sửa thứ tự của story 3, phát hiện ở review 3a): bài hiện tại thuộc chặng 1 → từ mới lấy NGSL trước theo hạng; từ chặng 2 trở đi → TSL trước theo hạng, hết TSL thì tiếp NGSL còn lại. Áp dụng cho mọi phiên flashcard (trang flashcard, phần SRS của buổi, ngày lười offline). Thẻ đã có lịch không đổi.

**Problem:** Trang Hôm nay đang trống. Lộ trình dựa vào buổi 30' mỗi ngày và ngày lười để không đứt mạch, nhưng app chưa có cách chạy buổi học hay ghi lại ngày đã học.

**Approach:** Trang Hôm nay có 1 nút lớn "Bắt đầu buổi 30'" và nút phụ "Hôm nay lười (10')", hiện bài hiện tại và streak. Buổi chạy theo các bước trên một route riêng, tái dùng phiên flashcard của story 3 và trang bài của story 2. Nhật ký buổi học và từ đã lưu là key mới trong store, đồng bộ Supabase.

## Boundaries & Constraints

**Always:**
- Store lên v5: migration 4→5 thêm `sessions: { days: {} }` và `savedWords: { items: {} }`; cả hai vào `SYNCED_KEYS` với luật gộp riêng theo mục (`days[YYYY-MM-DD]`, `items[id]`), `updatedAt` mới hơn thắng, không lùi (dùng `src/lib/updated-at.ts`).
- Nhật ký là dữ liệu cho streak và CAP-5/6/7 sau này: mỗi ngày `{ kind: 'full' | 'lazy', completedAt, minutes, lessonId?, updatedAt }`. `minutes` là số phút được tính giờ học theo CAP-7 (giờ chủ động + giải trí ×½): buổi chuẩn = 5 + 15 + 10×½ = 25, buổi lười = 10.
- Logic streak, chọn bài, gộp buổi trong ngày, tách câu/từ trong tin là hàm thuần có test; thời gian qua tham số `now`.
- Gọi mạng chỉ cho tin ngày lười, qua một module `src/lib/news/*` (không fetch rải rác trong component); timeout và lỗi đều có đường lui.
- Không phạt, không reset: bỏ dở buổi giữa chừng không ghi gì, không mất gì.
- Tiếng Việt, mobile-first 375px, theme hiện có.

**Never:**
- Không làm điểm Nhà/huy chương (story 12), sổ tay đầy đủ (story 8), gia hạn/quay lại (story 11), nhắc nhở (story 13).
- Không proxy, không gọi nguồn không có CORS (VOA, Breaking News English chỉ là link).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Buổi chuẩn | Bấm "Bắt đầu buổi 30'" | 3 phần theo thứ tự SRS 5' → bài chính 15' → giải trí 10'; xong ghi `kind: 'full'` cho hôm nay | N/A |
| SRS hết thẻ sớm | Không còn thẻ/từ mới | Phần SRS báo xong, mời sang phần tiếp | N/A |
| Hết giờ SRS | 5' trôi qua, còn thẻ | Gợi ý chuyển phần, vẫn cho ôn tiếp | N/A |
| Đã xong lộ trình | `nextLessonId = null` | Phần bài chính gợi ý ôn bài bất kỳ / mở Lộ trình | Không crash |
| Bỏ dở | Rời buổi giữa chừng | Không ghi nhật ký | N/A |
| Ngày lười online | Google AI Blog trả tin | Hiện 1 tin; chạm 3 từ → lưu kèm câu + nguồn → ghi `kind: 'lazy'` | N/A |
| Blog lỗi | RSS lỗi/timeout | Lấy tin HN | N/A |
| Offline | Không mạng | 3 từ mới SRS thay cho tin; xong 3 thẻ ghi `lazy` | N/A |
| Lười rồi học chuẩn | Hôm nay đã `lazy`, xong buổi chuẩn | Hôm nay thành `full` | N/A |
| Chuẩn rồi lười | Hôm nay đã `full`, xong buổi lười | Giữ `full` | N/A |
| Streak | Có buổi hôm qua, hôm kia; hôm nay chưa | Streak 2 | N/A |
| Streak đứt | Hôm qua không có buổi | Streak = 1 nếu hôm nay đã học, 0 nếu chưa | N/A |
| Ngày lười giữ streak | Chuỗi ngày có cả `lazy` | Tính như ngày học | N/A |
| Lưu trùng từ | Chạm lại từ đã lưu hôm nay | Không tính thêm, không tạo bản trùng | N/A |
| Hai máy | Cùng ngày ghi `full` ở A, `lazy` ở B (kể cả `lazy` ghi sau) | Sau đồng bộ cả hai máy là `full` (chuẩn ưu tiên hơn lười); cùng loại thì `updatedAt` mới hơn thắng | N/A |
| Từ mới chặng 1 | Bài hiện tại `s1-*` | Từ mới đầu tiên là NGSL chưa học có hạng nhỏ nhất | N/A |
| Từ mới chặng 2 | Bài hiện tại `s2-*`, NGSL mới học 1000 | Từ mới là TSL hạng 1, 2, …; hết TSL thì NGSL 1001… | N/A |
| App cũ | Server v5, app v4 | App cũ báo cần cập nhật, không ghi đè | Theo story 2a |

</frozen-after-approval>

## Code Map

- `src/pages/Today.tsx` -- đang là `PagePlaceholder`; thay bằng trang thật.
- `src/pages/Flashcards.tsx`, `src/lib/srs/*`, `src/app/use-words.ts`, `src/app/use-now.ts` -- phiên flashcard story 3; tách phần thân phiên thành component dùng lại được (giới hạn N thẻ cho ngày lười offline), không đổi hành vi trang flashcard.
- `src/lib/roadmap-progress.ts` -- `computeRoadmapProgress`, `readCompletedLessonIds`; `src/data/roadmap` (`lookup.ts`: `findLesson`/`resolveLessonRoute`, `sectionHref`), `stage-1.ts` (`entertainment` text từng tuần).
- `src/lib/storage/migrations.ts` -- `CURRENT_VERSION = 4`; thêm 4→5.
- `src/lib/sync/merge.ts` -- `SYNCED_KEYS`, `MERGERS` có kiểu; `mergeSrs`/`mergeLessons` là mẫu gộp theo mục.
- `src/lib/updated-at.ts` -- `nextUpdatedAt`, `isTimeString`.
- `src/app/store-context.ts` -- `useSrs()` là mẫu cho `useSessions()`, `useSavedWords()`.
- `src/app/routes.tsx` -- thêm `session` (buổi chuẩn) và `session/lazy`; tab Hôm nay vẫn sáng.
- `_bmad-output/brainstorming/brainstorm-english-learning-website-2026-10-29/nguon-hoc-mien-phi.md` -- URL gốc của nguồn giải trí.
- CORS đã kiểm (2026-11-01): Google AI Blog RSS và HN Algolia đều trả `access-control-allow-origin` cho `https://huyhg2199.github.io`. RSS phải parse bằng `DOMParser` (có trong trình duyệt; test dùng hàm parse thuần trên chuỗi hoặc tách lớp để test bằng dữ liệu mẫu).
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (+ test) -- v5, `mergeSessions`, `mergeSavedWords`; test hai máy, app cũ, mục sai dạng.
- [x] `src/lib/sessions/` (+ test) -- `localDayKey(now)`, `recordSession(store, kind, now, extra)` (ưu tiên full), `computeStreak(sessions, now)`, `sessionLesson(store)`.
- [x] `src/lib/saved-words/` (+ test) -- `saveWord(store, { word, sentence, source }, now)` (id ổn định theo từ chuẩn hoá + ngày, không trùng), `tokenize(text)` tách câu và từ (bỏ số, dấu câu, URL).
- [x] `src/lib/news/` (+ test bằng dữ liệu mẫu) -- `fetchLazyNews({ fetch, timeoutMs })`: blog → HN → null; parse RSS lấy item đầu (tiêu đề, mô tả rút gọn, link).
- [x] `src/data/roadmap/entertainment-links.ts` (+ test) -- map tên nguồn → URL gốc, `entertainmentLinks(lesson)` với 3 link mặc định.
- [x] `src/lib/srs/srs.ts` (+ test) -- `buildSession` nhận `firstList: 'ngsl' | 'tsl'` (mặc định `ngsl`); `src/lib/sessions` có `newWordListFor(store)` theo chặng của bài hiện tại; mọi nơi dựng phiên truyền giá trị này.
- [x] `src/components/flashcards/` -- phiên flashcard dùng lại (từ `Flashcards.tsx`), có `limit`.
- [x] `src/pages/Today.tsx`, `src/pages/Session.tsx`, `src/pages/LazySession.tsx`, `src/app/routes.tsx`, `src/app/store-context.ts` -- UI và hook theo Intent.

**Acceptance Criteria:**
- Given app mới mở, when nhìn trang Hôm nay, then thấy 1 nút lớn "Bắt đầu buổi 30'", nút "Hôm nay lười (10')", tên bài hiện tại và streak.
- Given đã xong buổi hôm nay, when quay lại trang Hôm nay, then thấy trạng thái "Đã học hôm nay" và vẫn bắt đầu lại được.
- Given ngày lười đã lưu 3 từ, when mở dữ liệu store, then `savedWords` có 3 mục kèm câu gốc và nguồn.

## Implementation Notes

- "Xong buổi" là nút bấm ở cả 3 kiểu buổi (chuẩn, lười có tin, lười offline); nút lười chỉ bật khi đủ 3 từ / 3 thẻ (hoặc hết thẻ).
- Buổi chuẩn giữ phần đang làm ở `?step=` để mở trang bài rồi quay lại vẫn đúng phần; đồng hồ gợi ý bắt đầu lại khi quay lại.
- Ngày lười offline: `FlashcardSession` với `limit=3`, `preferNew`; nếu quota 10 từ mới/ngày đã hết thì lấy thẻ đến hạn, hết cả thẻ thì vẫn cho "Xong buổi".
- Tab Hôm nay sáng ở `/session*` qua `alsoActiveFor` + `isNavItemActive` (BottomNav dùng `Link` + `aria-current`).
- `LessonSectionCard` tách từ `Lesson.tsx`, dùng chung cho trang bài và phần bài chính của buổi.

## Spec Change Log

- **Vòng review 1 (2026-11-01), Claude sửa thay Huy theo uỷ quyền chạy liên tục.** Finding: dòng I/O "Hai máy" (newer `updatedAt` thắng) mâu thuẫn quyết định "buổi chuẩn ưu tiên hơn buổi lười", làm đồng bộ hạ ngày `full` thành `lazy` (mất 15 phút CAP-7, mất `lessonId`). Sửa: dòng "Hai máy" theo quyết định. Không làm lại code (lỗi chỉ ở luật gộp): sửa bằng patch. KEEP: toàn bộ phần còn lại của bản cài đặt.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge (×2) | Đồng bộ hạ `full` thành `lazy` khi `lazy` ghi sau ở máy khác | medium | `mergeSessionDays` chỉ so `updatedAt`; test khoá hành vi sai. Dòng I/O mâu thuẫn quyết định → sửa dòng I/O (Change Log) | patch |
| 2 | verif-gap, blind, edge (×2) | Ngày lười offline: một từ chấm 3 lần đủ 3/3; `preferNew`/`limit` nằm trong component không test | medium | `FlashcardSession` tăng `reviewed` mỗi lần chấm; logic ở `.tsx` | patch |
| 3 | verif-gap, blind, edge | Từ đã lưu hôm nay từ tin khác không được tính; tin đổi trong ngày làm tiến độ về 0 | medium | `NewsCard` lọc theo `source.url`; id từ = ngày + từ | patch |
| 4 | verif-gap, blind, edge | Mở trang bài rồi quay lại thì bài của buổi đổi, ghi sai `lessonId` | medium | `useState(current)` mất khi unmount; `?step=` không giữ bài | patch |
| 5 | blind | Phần SRS của buổi lấy thứ tự danh sách từ store sống, không theo bài đã khoá | low | `useNewWordList()` trong `FlashcardSession`; sửa trực tiếp bằng truyền `firstList` | patch |
| 6 | blind | Mạng chậm: chờ tới ~16 s, không có lối sang flashcard offline | low | blog → HN tuần tự, 8 s mỗi bên; thêm nút "Học offline thay thế" | patch |
| 7 | edge | Offline mà không tải được bộ từ thì không có nút "Xong buổi" | low | Lần đầu chưa có cache thì kẹt, mất streak | patch |
| 8 | blind | Màn kết thúc ghi "Xong buổi lười!" dù ngày vẫn là `full` | low | Sửa chữ trực tiếp | patch |
| 9 | edge | `shorten` tách câu ở "$3.5", "U.S." | low | Sửa regex trực tiếp | patch |
| 10 | blind | Từ chức năng ("the", "a") cũng tính vào 3 từ | low | Huy tự chọn từ; thêm lọc là thêm luật | reject |
| 11 | blind | Chỉ giữ buổi cuối mỗi ngày, mất phút học thêm | low | Đúng quyết định "mỗi ngày một mục" | reject |
| 12 | blind | `merge.ts` kéo cả dữ liệu lộ trình qua `sessions` | low | Không có lỗi người dùng; chỉ là dọn dẹp | reject |
| 13 | blind | UI chưa có test render | low | Không có môi trường test component (defer từ story 2) | reject |
| 14 | blind | Test đọc file brainstorm `nguon-hoc-mien-phi.md` | low | Cố ý: bảo đảm URL nằm trong nguồn đã xác minh | reject |
| 15 | edge | Tin HN có < 3 từ khác nhau làm kẹt | low | Tiêu đề HN gần như luôn ≥ 3 từ; #3 tính cả từ đã lưu hôm nay | reject |
| 16 | edge | Qua nửa đêm giữa buổi lười làm đếm về 0 | low | Rất hiếm; thêm ghim ngày | reject |
| 17 | edge | Đồng hồ gợi ý chạy lại khi quay lại buổi | low | Chỉ là gợi ý, không ép giờ | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px: trang Hôm nay, buổi chuẩn đi hết 3 phần, ngày lười (mạng thật) lưu 3 từ, ngày lười offline; không tràn ngang, không lỗi console.
