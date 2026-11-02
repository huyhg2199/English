---
title: 'Nội dung chặng 1 tháng T2–T4 và link luyện nói kèm prompt roleplay'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: 'a2c9805f875afacefc0041433c0e470d6dd148a7'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/brainstorming/brainstorm-english-learning-website-2026-10-29/lo-trinh-toeic-12-thang.md'
  - '{project-root}/_bmad-output/brainstorming/brainstorm-english-learning-website-2026-10-29/nguon-hoc-mien-phi.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy cho phép chạy các story liên tục không cần duyệt, 2026-11-01; Claude chọn và ghi lại)
- **Phạm vi:** 12 bài `s1-t2-w1` … `s1-t4-w4` theo đúng bảng tuần trong `lo-trinh-toeic-12-thang.md` (phát âm/nghe + ngữ pháp). Tuần Tết `s1-t4-w2` chỉ có lời nhắc chạy chế độ ngày lười, không có nội dung mới. Tuần `s1-t4-w4` là O.W.L. 1 (story 14): chỉ có phần ôn tổng (tóm tắt âm + thì của chặng 1 kèm link về từng bài), không làm bài thi.
- **Phát âm/nghe** dùng lại khung của story 6 và thêm các khối mới khi cần: bảng trọng âm (từ 2 âm tiết, theo hậu tố), cách đọc `-ed`, dạng yếu, nối âm, trọng âm câu, dạng rút gọn (*wanna, gotta, I'd, you'll*), shadowing (đoạn ngắn + TTS + so khớp giọng nói của story 6), chép chính tả (TTS đọc câu, Huy gõ lại, so từng từ). Từ ví dụ ưu tiên lấy từ NGSL có dữ liệu.
- **Ngữ pháp:** mỗi thì/chủ điểm có dòng thời gian (nếu là thì), công thức, quy tắc, ví dụ có dịch, lỗi người Việt hay mắc, câu thoại VOA nguyên văn có link (không lấy được thì link YouGlish, không bịa). Bảng 50 động từ bất quy tắc thông dụng (V1/V2/V3 + nghĩa + nút nghe) cho `s1-t2-w3`.
- **Thần chú mới** (mở khi bài chứa thì đó xong, như story 6): hiện tại tiếp diễn → Accio, quá khứ đơn → Obliviate, động từ bất quy tắc → Reparo, *will* → Protego, *be going to* → Wingardium Leviosa, hiện tại hoàn thành → Expecto Patronum, động từ khuyết thiếu → Expelliarmus, so sánh hơn/nhất → Riddikulus, bị động hiện tại → Finite.
- **Câu hỏi:** 6 câu cho mỗi bài có nội dung (11 bài, trừ tuần Tết) theo đúng khuôn của story 9, và mini test tháng T2 ở bài `s1-t2-w4` (10 câu từ 4 bài T2, cùng luật chọn câu của story 9).
- **Luyện nói với AI (dạng link):** mỗi bài có nút "Luyện nói với AI". App dựng prompt roleplay tiếng Anh theo tình huống của bài (vd giới thiệu bản thân, kể việc hôm qua, kế hoạch Tết), dặn AI chỉ dùng các thì **đã mở** (theo thần chú hiện có) **cộng thì của chính bài đang học** (để luyện được điều vừa học), nói chậm, câu ngắn, sau mỗi lượt sửa lỗi của Huy bằng tiếng Việt. Bấm nút thì chép prompt vào clipboard và mở `https://gemini.google.com/app` ở tab mới; không chép được thì hiện prompt để Huy tự chép. Không gọi API.

**Problem:** Chỉ có T1 có nội dung; T2–T4 (12/2026–02/2027) mới có việc cần làm và nguồn; chưa có lối luyện nói dù iOS không có giọng nói hai chiều trong app.

**Approach:** Soạn dữ liệu nội dung + câu hỏi cho 12 bài T2–T4 trên khung của story 6 và 9, mở rộng khung bằng vài khối phát âm mới, thêm thần chú và nút luyện nói dựng prompt theo thần chú đã mở.

## Boundaries & Constraints

**Always:**
- Nội dung chỉ từ nguồn trong `nguon-hoc-mien-phi.md` hoặc tự soạn; câu thoại thật chỉ VOA (public domain) có link.
- Khối mới, dựng prompt, chấm chính tả là hàm thuần có test; dữ liệu có test cấu trúc (id duy nhất, bài/đoạn tồn tại, câu hỏi đủ 6 câu mỗi bài có nội dung, thần chú trỏ tới bài tồn tại, mỗi thì có ít nhất 1 câu thoại VOA hoặc link YouGlish).
- Prompt không chứa dữ liệu cá nhân ngoài tên "Huy" (có thể bỏ), không chứa key.
- Không thêm key store mới; tiến độ chính tả/shadowing dùng chung `pronunciation` của story 6.
- Tiếng Việt cho giao diện, 375px.

**Never:**
- Không làm O.W.L. 1 (story 14), không gọi Gemini API cho luyện nói, không nội dung chặng 2–3.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bài T2 tuần 1 | Mở `s1-t2-w1` | Bảng trọng âm 2 âm tiết, hiện tại tiếp diễn có dòng thời gian, thẻ Accio | N/A |
| Tuần Tết | Mở `s1-t4-w2` | Lời nhắc chế độ ngày lười + nút sang ngày lười, không có câu hỏi | N/A |
| Bảng BQT | Mở `s1-t2-w3` | 50 động từ V1/V2/V3 + nghĩa + nút nghe | N/A |
| Chính tả đúng | TTS đọc "She is working now.", Huy gõ "she is working now" | Đúng 100% | N/A |
| Chính tả sai | Gõ "she working now" | Tô từ thiếu "is", % = 75 | N/A |
| Prompt theo thần chú | Đã mở Lumos, Alohomora, Accio; đang ở bài quá khứ đơn | Prompt cho phép to be, hiện tại đơn, hiện tại tiếp diễn và quá khứ đơn (thì của bài) | N/A |
| Chưa mở thần chú nào | Không bài nào xong | Prompt chỉ dùng câu đơn giản với *to be* và hiện tại đơn | N/A |
| Không chép được | Clipboard bị chặn | Hiện ô prompt để tự chép, vẫn mở Gemini | Không crash |
| Mini test T2 | Bắt đầu ở `s1-t2-w4` | 10 câu từ 4 bài T2, mỗi bài ≥ 2 câu | N/A |

</frozen-after-approval>

## Code Map

- Story 6: `src/data/lessons/` (kiểu `LessonContent`, nội dung T1), `src/components/lesson/*` (`SoundTable`, `SpeakPractice`, `TenseTimeline`, `TenseCard`, `SpellCard`), `src/lib/pronunciation/` (`compareSpeech`, `recordAttempt`), `src/lib/spells.ts`. Đọc code thật, mở rộng kiểu bằng khối tuỳ chọn, không phá T1.
- Story 9: `src/data/questions/` (24 câu T1), `src/lib/quiz/` (`pickMiniTest`), `src/pages/Quiz.tsx`; mini test vào từ đoạn ngữ pháp bài.
- `src/data/roadmap/stage-1.ts` -- việc từng tuần T2–T4 (nguồn chuẩn cho phạm vi); id bài không đổi.
- `src/lib/speech.ts` -- TTS; `src/data/vocab` -- từ ví dụ.
- `src/pages/Lesson.tsx` -- chỗ gắn nút luyện nói (cuối trang bài hoặc đoạn phát âm).

## Tasks & Acceptance

**Execution:**
- [x] `src/data/lessons/` (+ test) -- nội dung 12 bài T2–T4, khối phát âm mới, bảng 50 động từ bất quy tắc, thần chú mới.
- [x] `src/data/questions/` (+ test) -- 66 câu (6 × 11 bài) và cấu hình mini test T2.
- [x] `src/lib/dictation.ts`, `src/lib/roleplay.ts` (+ test) -- chấm chính tả (dùng lại so khớp của story 6), `buildRoleplayPrompt(lesson, unlockedSpells)`.
- [x] `src/components/lesson/*`, `src/pages/Lesson.tsx` -- khối mới, nút "Luyện nói với AI".

**Acceptance Criteria:**
- Given đã xong bài T1–T2, when bấm "Luyện nói với AI" ở bài T3, then prompt được chép, Gemini mở ra, prompt chỉ cho phép các thì đã mở.
- Given mỗi bài T2–T4 (trừ tuần Tết, O.W.L.), when mở trang bài, then có nội dung phát âm và ngữ pháp, có câu hỏi kiểm tra bài.

## Implementation Notes

- Câu thoại thật: lúc soạn không tải được VOA (mạng chặn), nên mọi thì T2–T4 dùng link YouGlish (2 cụm/thì), không bịa câu VOA. Nên bổ sung câu VOA nguyên văn khi kiểm tay được transcript.
- `Tense.timeline` và `Tense.spellId` thành tuỳ chọn: động từ khuyết thiếu / so sánh / bị động không có dòng thời gian; "Hiện tại hoàn thành (2) và so sánh với quá khứ đơn" không có thần chú (spec không gán).
- Khối phát âm mới nằm ở `PronunciationContent.blocks` (stress, weak-forms, linking, sentence-stress, reductions, shadowing, dictation, self-read, overview). Điểm chép chính tả ghi vào `pronunciation` qua `usePronunciation().record`.
- "Câu hỏi kiểm tra bài": thêm bài test `lesson-<id>` (5 trong 6 câu, không TTS thì câu nghe được thay) cho mọi bài có ≥ 6 câu, nút ở cuối trang bài; thêm `mini-t2`.
- Tuần O.W.L. 1 không có đoạn Ngữ pháp nên phần ôn tổng (âm + thì) và 6 câu hỏi gắn đoạn Phát âm.
- Thần chú có thêm `grammarEn` cho prompt; prompt luôn cho phép to be + hiện tại đơn, cộng các thần chú đã mở.

## Spec Change Log

- **Review vòng 1 (2026-11-02), Claude sửa thay Huy theo uỷ quyền chạy liên tục.** Finding: prompt roleplay chỉ cho phép thì đã mở, nhưng thần chú chỉ mở khi bài xong, nên tình huống của bài đang học (vd hứa với "I'll") bị chính prompt cấm. Sửa quyết định và dòng I/O "Prompt theo thần chú": cho phép thêm thì của bài đang học. Không làm lại code: sửa bằng patch. KEEP: toàn bộ phần còn lại.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind, edge (×2) | Prompt roleplay cấm chính thì của bài đang học | medium | Thần chú mở khi bài xong; test khoá mâu thuẫn. Sửa quyết định (Change Log) | patch |
| 2 | blind | Prompt tiếng Anh chèn tiêu đề bài tiếng Việt | low | `Topic of my lesson: ${lesson.title}` | patch |
| 3 | blind | Tình huống roleplay có thông tin cá nhân (nghề developer) | low | Trái ràng buộc "không dữ liệu cá nhân ngoài tên" | patch |
| 4 | blind | Cặp sai/đúng của WILL đổi nghĩa ("want go" → "won't go") | medium | Dạy sai | patch |
| 5 | blind | Ví dụ BQT `cut/let` không có trong bảng; nhóm "đổi nguyên âm" lẫn lộn | low | Nội dung tự mâu thuẫn | patch |
| 6 | blind | Dạng yếu của *of* lệch giữa dữ liệu và ghi chú | low | `/əv/` vs "/ə/" | patch |
| 7 | blind | Tuần O.W.L. hứa "bài thi ở dưới" nhưng chưa có (story 14) | low | Sửa lời | patch |
| 8 | blind | Tổng ôn chặng 1 thiếu tuần tự đọc, shadowing, chính tả; tuần 4 T1 thiếu -ed | low | Bổ sung dòng | patch |
| 9 | blind, edge | Chính tả: hiện đáp án rồi gõ lại được 100%; không TTS vẫn chấm | medium | Điểm "tốt nhất" bị thổi phồng | patch |
| 10 | blind, edge | Điểm chính tả (gõ) trộn vào điểm phát âm của bảng kỹ năng | medium | Cùng key `pronunciation`, `pronunciationAverage` không lọc | patch |
| 11 | blind | Giải thích câu nghe "did /ɪd/" sai | low | Sửa nội dung | patch |
| 12 | blind | Test không đảm bảo ≤ 1 câu nghe mỗi bài (cần cho kiểm tra 5 câu khi không TTS) | low | Thêm test | patch |
| 13 | blind | Cụm YouGlish quá chung chung | low | Dùng cụm đặc trưng thì | patch |
| 14 | blind, edge (×2) | Nút luyện nói: mở tab trước khi chép xong; `noopener` làm không phát hiện popup bị chặn; không có link dự phòng | low | Chép trước rồi mở; luôn có link và "Xem prompt" | patch |
| 15 | edge | Shadowing: nghe cả đoạn khi mic đang thu; hai bộ nhận dạng cùng lúc | low | Dừng TTS/khoá nút khi đang thu | patch |
| 16 | edge | Tự đọc 20 từ: lỗi tải NGSL không báo | low | Thêm báo lỗi + thử lại | patch |
| 17 | edge | `id` trùng khi có nhiều nút roleplay | low | `useId` | patch |
| 18 | blind | So sánh hơn/nhất gắn nhãn "từ loại" | false | Dạng tính từ (taller) là lỗi dạng từ; nhãn phù hợp | reject |
| 19 | blind | `TenseTimeline` lặp khối, toạ độ cứng | low | Dọn dẹp | reject |
| 20 | blind | Luyện tập liệt kê cứng mini test, chưa liệt kê kiểm tra từng bài | low | Ngoài phạm vi | reject |
| 21 | edge | Câu có khoảng trắng thừa lệch từ nhấn | low | Dữ liệu tự soạn, không có | reject |
| 22 | edge | Chặng 2–3 không có nút luyện nói | false | Phạm vi story là chặng 1 | reject |

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.

**Manual checks:**
- Headless 375px: vài bài T2–T4, bảng BQT, chính tả, nút luyện nói (clipboard có thể bị chặn ở headless); không tràn ngang.
- Kiểm tay vài câu thoại VOA khớp transcript ở link.
