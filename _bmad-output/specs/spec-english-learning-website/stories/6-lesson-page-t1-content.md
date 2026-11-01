---
title: 'Trang bài học và nội dung chặng 1 tháng T1 (tuần 1–4)'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: '6c6117eff2c2dc6dc0f83888d97059389c90e28c'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/hp-theme.md'
  - '{project-root}/_bmad-output/brainstorming/brainstorm-english-learning-website-2026-10-29/nguon-hoc-mien-phi.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Bộ âm theo giọng Mỹ** (khớp IPA của bộ từ): tuần 1 = 12 nguyên âm đơn `iː ɪ e æ ɑː ɔː ʊ uː ʌ ɝː ə ɚ`; tuần 2 = 8 nguyên âm đôi `eɪ aɪ ɔɪ oʊ aʊ ɪr er ʊr`; tuần 3 = 24 phụ âm, nhấn `θ ð ʃ ʒ`; tuần 4 = âm cuối và cách đọc `-s` (/s/ /z/ /ɪz/), `-ed` (/t/ /d/ /ɪd/).
- **Mỗi âm:** ký hiệu IPA, mẹo khẩu hình bằng tiếng Việt (so sánh với âm tiếng Việt gần nhất và lỗi người Việt hay mắc), 3–5 từ ví dụ lấy từ bộ NGSL đã có dữ liệu (hiện IPA, nút nghe), 1 cặp từ dễ nhầm khi có (vd `ship`/`sheep`).
- **So khớp giọng nói:** mỗi đoạn phát âm có 3–5 câu mẫu ngắn. Huy nghe mẫu (TTS en-US), bấm nói, app nhận dạng bằng `SpeechRecognition`/`webkitSpeechRecognition` (`en-US`), so từng từ với câu mẫu và tô đỏ từ thiếu/lệch, hiện % đúng. Trình duyệt không có STT (hoặc lỗi quyền mic) thì **ẩn** phần nói, giữ nút nghe và hiện dòng "Trình duyệt này chưa hỗ trợ nhận giọng nói".
- **Kết quả phát âm** lưu điểm tốt nhất của từng câu mẫu (key `pronunciation`, đồng bộ). Bảng kỹ năng (story 5) dùng nó: phát âm = trung bình điểm tốt nhất các câu đã thử, mục tiêu 70%; chưa thử câu nào vẫn "chưa có dữ liệu".
- **Ngữ pháp các thì:** tuần 1 *to be* (am/is/are, khẳng định/phủ định/câu hỏi); tuần 2 hiện tại đơn khẳng định (+ -s/-es, quy tắc thêm); tuần 3 hiện tại đơn câu hỏi/phủ định (do/does); tuần 4 ôn tập (mini test thuộc story 9, ở đây chỉ hiện "Mini test sẽ có ở bài kiểm tra" và tóm tắt). Mỗi thì có: hình dòng thời gian (SVG tự vẽ: quá khứ – hiện tại – tương lai, đánh dấu kiểu "thói quen lặp lại" / "trạng thái"), công thức, 3 quy tắc ngắn, 4–6 câu ví dụ có dịch, lỗi người Việt hay mắc.
- **Câu thoại thật:** mỗi thì có ít nhất 1 câu thoại lấy nguyên văn từ transcript VOA *Let's Learn English* Level 1 (public domain), kèm link bài VOA. Không bịa câu thoại: nếu không lấy được transcript thì thay bằng link YouGlish tìm đúng cụm (vd `https://youglish.com/pronounce/I%20am/english/us`) và ghi "nghe cụm này trong video thật".
- **Thần chú:** mỗi thì đã học là một "thần chú" lấy cảm hứng HP (tên + mô tả ngắn, không dùng hình gốc): *to be* → Lumos, hiện tại đơn → Alohomora, câu hỏi/phủ định hiện tại đơn → Revelio. Thần chú mở khoá khi bài chứa thì đó được đánh dấu xong (dùng tiến độ hiện có, không thêm key). Trang bài hiện thẻ thần chú (khoá/mở) và trang Luyện tập có danh sách thần chú đã mở.
- Tuần 1 có thêm "Làm bài đầu vào" → link sang Mũ Phân Loại (story 5).

**Problem:** Trang bài mới chỉ có việc cần làm và nguồn; tháng đầu (bắt đầu 11/2026) chưa có nội dung học thật cho phát âm và các thì, chưa luyện nói được trong app.

**Approach:** Thêm dữ liệu nội dung bài dạng tĩnh (TypeScript) cho 4 bài `s1-t1-w1…w4`, gắn vào các đoạn sẵn có của trang bài: đoạn Phát âm hiện bảng âm + luyện nói, đoạn Ngữ pháp hiện dòng thời gian + quy tắc + câu thoại + thần chú. Bài khác giữ nguyên như hiện nay.

## Boundaries & Constraints

**Always:**
- Nội dung chỉ từ nguồn trong `nguon-hoc-mien-phi.md` hoặc tự soạn; câu thoại thật chỉ từ VOA (public domain) có link; không chép nội dung BBC/Rachel's English/British Council (chỉ link).
- Logic so khớp (chuẩn hoá chữ, căn chỉnh từng từ, tính %) là hàm thuần có test; nhận giọng nói nằm sau một module `src/lib/speech-recognition.ts` có kiểm hỗ trợ.
- Store lên version kế tiếp: thêm `pronunciation: { items: { [sentenceId]: { best, attempts, updatedAt } } }`, vào `SYNCED_KEYS` với luật gộp theo câu (`best` lấy max, `attempts` lấy max, `updatedAt` mới hơn).
- Id câu mẫu, id thì, id thần chú là chuỗi viết tay ổn định.
- Tiếng Việt, 375px, theme hiện có.

**Never:**
- Không làm mini test/engine câu hỏi (story 9), không nội dung T2–T4 (story 10), không luyện nói với AI.
- Không ghi âm hay gửi giọng nói đi đâu ngoài API nhận dạng của trình duyệt.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mở bài T1 tuần 1 | `#/roadmap/lesson/s1-t1-w1/pronunciation` | Cuộn tới đoạn phát âm có 12 nguyên âm đơn, từ ví dụ có IPA và nút nghe | N/A |
| Bài chưa có nội dung | Bài `s1-t2-w1` | Trang như hiện nay (việc + nguồn), không lỗi | N/A |
| Nói đúng | Nhận dạng "I am a student" với mẫu "I am a student." | 100%, không từ đỏ | N/A |
| Nói thiếu/lệch | Nhận dạng "I a student" | Từ "am" đỏ (thiếu), % = 75 | N/A |
| Hoa thường, dấu câu, số | "i'm ok" vs "I'm OK." | Coi là khớp | N/A |
| Không có STT | Không có `SpeechRecognition` | Ẩn nút nói, hiện dòng chưa hỗ trợ, nút nghe vẫn có | Không crash |
| Từ chối mic / lỗi nhận dạng | `onerror` `not-allowed`/`no-speech` | Báo tiếng Việt, cho thử lại | Không lưu điểm |
| Lưu điểm tốt nhất | Lần 1 60%, lần 2 80%, lần 3 70% | `best = 80`, `attempts = 3` | N/A |
| Thần chú | Đánh dấu xong `s1-t1-w1` | Lumos mở khoá ở trang bài và Luyện tập | N/A |
| Bỏ đánh dấu bài | Bỏ đánh dấu `s1-t1-w1` | Lumos khoá lại (không phạt, chỉ phản ánh tiến độ) | N/A |
| Bảng kỹ năng | Đã thử 4 câu, best 50/70/80/100 | Phát âm 75% so với mục tiêu 70% | N/A |
| Hai máy | Cùng câu best 60 ở A, 90 ở B | Sau đồng bộ best 90 | N/A |

</frozen-after-approval>

## Code Map

- `src/pages/Lesson.tsx` -- trang bài (đoạn theo `lesson.sections`, cuộn tới `sectionId`, nút tạm "Đánh dấu đã học xong"). Gắn nội dung vào đoạn `pronunciation`/`grammar` khi bài có nội dung.
- `src/data/roadmap/` -- `stage-1.ts` (4 bài T1: `s1-t1-w1`…`w4`), `types.ts` (`SectionId`), `lookup.ts`. Không đổi id bài/đoạn.
- `src/data/vocab/` (`loadWords`, `cambridgeUrl`, `hasDetails`), `src/lib/speech.ts` (TTS en-US, `canSpeak`) -- dùng lại cho từ ví dụ và nghe mẫu.
- Story 5 (làm trước): `src/lib/placement/` `skillGaps` có dòng phát âm "chưa có dữ liệu" → đổi sang dùng `pronunciation`.
- `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (`SYNCED_KEYS`, `MERGERS`), `src/lib/updated-at.ts` -- mẫu thêm key đồng bộ.
- `src/pages/Practice.tsx` -- thêm thẻ danh sách thần chú.
- VOA *Let's Learn English* Level 1: `https://learningenglish.voanews.com/` (trang bài có transcript). Implementation tải trang để lấy câu nguyên văn; ghi URL bài vào dữ liệu.
- Test: Vitest env `node`, chỉ `src/**/*.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/lessons/` (+ test) -- kiểu `LessonContent` (âm, câu mẫu, thì, câu thoại có `sourceUrl`, thần chú) và nội dung 4 bài T1; test: đủ 12/8/24 âm, mỗi âm có từ ví dụ thuộc NGSL có dữ liệu, id duy nhất, mọi câu thoại VOA có `sourceUrl` VOA, thần chú trỏ tới bài tồn tại.
- [x] `src/lib/pronunciation/` (+ test) -- `normalizeWords`, `compareSpeech(expected, heard) → { words: { text, ok }[], score }`, `recordAttempt(store, id, score, now)`.
- [x] `src/lib/speech-recognition.ts` (+ test với bản giả) -- `canRecognize()`, `recognizeOnce({ lang: 'en-US' })` trả Promise kết quả/lỗi tiếng Việt.
- [x] `src/lib/storage/migrations.ts`, `src/lib/sync/merge.ts` (+ test) -- version mới + `mergePronunciation`.
- [x] `src/lib/placement/` (+ test) -- dòng phát âm dùng dữ liệu `pronunciation`.
- [x] `src/lib/spells.ts` (+ test) -- `unlockedSpells(store)` từ tiến độ bài.
- [x] `src/components/lesson/` -- `SoundTable`, `SpeakPractice`, `TenseTimeline` (SVG), `TenseCard`, `SpellCard`; `src/pages/Lesson.tsx`, `src/pages/Practice.tsx` gắn vào.

**Acceptance Criteria:**
- Given trang bài `s1-t1-w2`, when xem đoạn ngữ pháp, then thấy dòng thời gian hiện tại đơn, quy tắc -s/-es, ví dụ có dịch, ít nhất 1 câu thoại VOA có link (hoặc link YouGlish) và thẻ thần chú Alohomora.
- Given Chrome có mic, when nói câu mẫu, then thấy từ lệch tô đỏ và % đúng; điểm tốt nhất lưu lại sau khi tải lại trang.

## Implementation Notes

**Kiểm câu thoại VOA (2026-11-02, tải lại từng trang bằng curl, so chuỗi nguyên văn trong dòng thoại của đúng người nói):**

| Bài VOA (tên theo `<title>`/`<h1>` trang) | URL (HTTP 200, không redirect) | Câu đã kiểm | Kết quả |
|---|---|---|---|
| Lesson 1: Welcome! | `/a/lets-learn-english-lesson-one/3111026.html` | Pete: "Hi! Are you Anna?", Pete: "I am Pete." | Khớp |
| Lesson 3: I'm Here! | `/a/lets-learn-english-lesson-3-i-am-here/3126527.html` | Marsha: "Good. You are there." | Khớp |
| Lesson 12: Meet My Family | `/a/lets-learn-english-lesson-12-meet-my-family/3301733.html` | Marsha: "She makes spoons?", Marsha: "What does Uncle John do?" | Khớp |
| Lesson 15: I Love People-Watching! | `/a/lets-learn-english-lesson-15-i-love-people-watching/3343720.html` | Ashley: "Does she wear glasses?" | Khớp |
| Lesson 19: When Do I Start? | `/a/lets-learn-english-lesson-19-when-do-you-start/3357760.html` | Anna: "I always ride the Metro to work.", Anna: "My boss has news for me." (mỗi câu là một câu trọn trong lượt nói dài hơn của Anna) | Khớp |
| Lesson 20: What Can You Do? | `/a/lets-learn-english-lesson-20-what-can-you-do/3384429.html` | Pete: "I don’t have a job." | Khớp, transcript dùng nháy cong ’ (U+2019); bản nháy thẳng không có trên trang |

- Lesson 19: tiêu đề và `<h1>` của trang là "When Do I Start?", còn slug URL do VOA đặt là `when-do-you-start`. Giữ cả tên lẫn URL như trang gốc (URL là link đúng, sống); không có URL nào khác cho bài này.
- Nháy cong ở câu Lesson 20 giữ nguyên để đúng nguyên văn; so khớp giọng nói chuẩn hoá ’ thành ' nên không ảnh hưởng chấm điểm.
- Không câu nào phải thay bằng YouGlish.

**Review fixes:** `applyRecognition` (hàm thuần, `src/lib/pronunciation/apply.ts`) gom luật lỗi/không hỗ trợ/huỷ/lưu điểm; `bestComparison` trả phương án đã chấm (`heard`); câu chữ về quyền riêng tư sửa thành "app chỉ lưu điểm; âm thanh do dịch vụ nhận giọng nói của trình duyệt xử lý (Chrome gửi lên máy chủ Google)"; huỷ không hiện lỗi; nút nghe tắt khi micro đang nghe; cặp dễ nhầm có IPA trong dữ liệu.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | verif-gap | Luật "lỗi nhận dạng không lưu điểm" và "không có STT thì ẩn nút nói" chỉ nằm trong component | medium | `SpeakPractice.speakSentence`; đổi thứ tự `record` thì lỗi mic lưu 0% mà không test nào báo | patch |
| 2 | blind, edge | Câu "nghe được" hiện bản nhận dạng #1 trong khi điểm/tô màu tính theo bản tốt nhất | medium | `heard = transcripts[0]`, `bestComparison` chọn bản khác | patch |
| 3 | blind | Lời "không ghi âm, trình duyệt tự xử lý" sai: Chrome gửi âm thanh lên máy chủ Google | medium | Web Speech API của Chrome nhận dạng trên server | patch |
| 4 | blind | Điểm % là "máy hiểu đúng từ", không phải độ chính xác từng âm; không có chú thích | low | Nhận dạng đoán theo ngữ cảnh; sửa bằng một dòng chú thích | patch |
| 5 | blind | `go → goes · do → does` xếp vào "bất quy tắc"; quy tắc -es thiếu -z | medium | Dạy sai nhóm quy tắc | patch |
| 6 | blind, edge | Tiêu đề VOA Lesson 19 lệch slug URL; một câu có nháy cong lạ | medium | Cần tải lại transcript để đối chiếu nguyên văn | patch |
| 7 | blind | Mục "phụ âm cuối" lệch giữa ký hiệu, mẹo và ví dụ (`time` /m/) | low | `ending('e-final', …)`; test bỏ qua IPA của `ending` | patch |
| 8 | blind | Từ trong cặp dễ nhầm không có IPA (không thuộc NGSL) | medium | `SoundTable` chỉ tra NGSL; IPA là chỗ cần nhất để thấy khác biệt | patch |
| 9 | blind | Nhiều âm thiếu cặp dễ nhầm dù có cặp rõ (z/s, dʒ/tʃ, w/v, h…) | low | Spec yêu cầu "khi có"; bổ sung dữ liệu | patch |
| 10 | blind | /j/ dễ bị đọc là chữ "j" | low | Thêm một câu vào mẹo | patch |
| 11 | blind, edge | Bảng rút gọn thiếu nhiều dạng (shouldn't, he'll…); `ms → miss` sai | low | Thêm luật hậu tố chung n't/'ll/'ve/'d; bỏ alias `ms` | patch |
| 12 | blind | Bấm dừng nghe hiện thông báo lỗi đỏ | low | `aborted` hiện `role="alert"`; người dùng tự dừng thì xoá yên lặng | patch |
| 13 | edge | Bấm nghe mẫu (TTS) khi đang thu thì mic thu cả giọng máy | low | Khoá nút nghe khi đang thu | patch |
| 14 | blind | Nội dung bài không hiện trong buổi 30' | low | Spec không yêu cầu; buổi có link sang trang bài | reject |
| 15 | blind | Sổ sách spec | low | Sửa là sửa spec | reject |
| 16 | edge | Số dạng "8:30", > 999 | low | Câu mẫu do app soạn, không có số dạng đó | reject |
| 17 | edge | Nói thừa từ vẫn 100% | low | Phạt từ thừa sẽ phạt cả nhiễu nhận dạng | reject |
| 18 | edge | Bảng âm không báo đang tải | low | Tải nhanh từ precache | reject |
| 19 | edge | Từ chối mic vẫn hiện nút nói | false | Đúng I/O Matrix "báo lỗi, cho thử lại" | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px: 4 bài T1, dòng thời gian không tràn, phần nói ẩn đúng khi không có STT (headless Chrome thường không có), không lỗi console.
- Kiểm tay vài câu thoại VOA khớp transcript ở link.
