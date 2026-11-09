---
title: 'Cập nhật spec: Sân ga 9¾, thứ tự lý thuyết trước, giao diện máy tính'
type: 'chore'
created: '2026-11-06'
status: 'done'
baseline_commit: 'f72213c73469d26c16a273033892cc20299a08e5'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/learning-rules.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/hp-theme.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/mvp-phases.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Chọn "Sân ga 9¾ · Lý thuyết vỡ lòng":** khoá riêng nằm TRƯỚC bài `s1-t1-w1`, gồm 18 viên gạch F01–F18 xếp 4 hàng A–D. 48 bài, id bài, tiến độ, streak, sync giữ nguyên.
- **Mốc 750:** lịch 12 tháng bắt đầu đếm từ ngày qua (hoặc bỏ qua) Sân ga. Mốc 750 dời khoảng 2–3 tuần, nhưng app không bao giờ hiện "lùi N tuần" vì Sân ga.
- **Kiểm tra cả 4 hàng trước** (khác đề xuất gốc "không chẩn đoán ngày 1"): lần đầu vào Sân ga, app mời "Soát vé" gồm 4 bài kiểm tra ngắn (mỗi hàng 8 câu, chạy bằng Quiz engine). Hàng đạt ≥ 70% tính là xong; Huy chỉ học những hàng chưa đạt. Câu sai trong Soát vé KHÔNG ghi Sổ lỗi (chưa được dạy). Bỏ qua Soát vé được để học từ viên 1. Không khoá viên nào; tiến độ bài và thẻ SRS cũ giữ nguyên.
- **Nhịp:** 1 viên gạch mỗi buổi 30', có nút "Học tiếp viên sau" nếu còn hứng (xong Sân ga khoảng 2–3 tuần).
- **Máy tính:** phương án tối giản: từ ≥ 1024px là thanh điều hướng trên cùng (dưới 1024px vẫn bottom nav), cột giữa rộng hơn, Viên gạch / Bài học / Buổi học hai cột, phím tắt. Thanh bên trái để sau.
- Claude chọn: tên "Soát vé" cho bài kiểm tra 4 hàng; câu sai bài kiểm tra hàng chỉ ghi Sổ lỗi khi đã học hết các viên của hàng đó; huy chương "Lên tàu Năm 1" chỉ trao một lần (không cấp) khi xong cả 4 hàng; mỗi viên gạch xong lần đầu +5 điểm Nhà; Soát vé và 4 quiz hàng viết sớm ở story 20.

**Problem:** Tài liệu spec còn mô tả lộ trình vào thẳng T1, buổi học ôn trước bài, Mũ Phân Loại bắt làm đề ETS ngày 1, 10 từ mới/ngày và "bottom nav đúng 5 mục" cứng. Các story 18–31 sẽ build theo hướng mới nên hợp đồng phải đổi trước, nếu không các story sẽ mâu thuẫn với SPEC.

**Approach:** Chỉ sửa tài liệu: SPEC.md (CAP-23, sửa CAP-2/3/5/9/10/19, nguyên tắc "không dùng/kiểm tra kiến thức chưa dạy", dòng điều hướng), learning-rules.md, hp-theme.md, mvp-phases.md (Đợt 1b), hai dòng stack.md đang mâu thuẫn, và chỉnh mục 17–31 trong stories.yaml cho khớp quyết định của Huy.

## Boundaries & Constraints

**Always:**
- Tiếng Việt, câu ngắn, cùng giọng với các file hiện có; giữ cấu trúc, frontmatter và đánh số CAP cũ (chỉ thêm CAP-23, không đánh số lại).
- Ghi rõ "không khoá, không phạt, không reset": viên nào cũng mở được, Sân ga bỏ qua / quay lại được, tiến độ bài và thẻ SRS cũ giữ nguyên.
- Nguyên tắc "không dùng hay kiểm tra kiến thức chưa dạy" phải ghi luôn ngoại lệ: Soát vé và nút "Tôi biết rồi" (tuỳ chọn, không ghi Sổ lỗi).
- Mỗi chỗ đổi trong SPEC phải khớp learning-rules / hp-theme / mvp-phases / stories.yaml, không để hai file nói ngược nhau.
- Nội dung viên gạch ghi là tự soạn; không chép tài liệu có bản quyền.

**Never:**
- Không sửa code, test, script, `public/`, `package.json` hay workflow CI. Không tạo file story spec 18–31 (chỉ chỉnh mục trong stories.yaml).
- Không sửa `_bmad-output/brainstorming/**` (`roadmap.test.ts` và `entertainment-links.test.ts` đọc file ở đó).
- Không thêm thanh bên trái, master–detail, hay việc ngoài các quyết định trên. Không đổi ngưỡng O.W.L., trễ & gia hạn ngoài phần Sân ga.
- Không ghi secret, gist id hay dữ liệu học cá nhân.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Điều hướng | Đọc SPEC Constraints (dòng 96 cũ) | < 1024px: bottom nav 5 mục; ≥ 1024px: cùng 5 mục, cùng thứ tự trên thanh trên cùng; 375px không đổi; Non-goals ghi thanh bên trái để sau | Còn chữ "bottom nav đúng 5 mục" đứng riêng → sửa |
| Soát vé | Đọc CAP-23 + learning-rules mục Sân ga | Lần đầu vào Sân ga mời 4 bài × 8 câu; hàng ≥ 70% xong; bỏ qua được; câu sai không ghi Sổ lỗi | N/A |
| Sổ lỗi | Câu sai ở: luyện trong viên / Soát vé / "Tôi biết rồi" / kiểm tra cuối hàng đã học xong | Chỉ trường hợp cuối ghi Sổ lỗi; CAP-19 success ghi ngoại lệ | CAP-19 còn "bất kỳ test nào" không ngoại lệ → sửa |
| Mốc 750 | Qua hoặc bỏ qua Sân ga sau 3 tuần | CAP-5 + learning-rules: lịch đếm từ ngày đó, không bao giờ hiện "lùi" vì Sân ga | N/A |
| Buổi 30' ở Sân ga | Đang ở Sân ga | Lý thuyết 12' (1 viên, hiện ngay trong buổi, nút "Học tiếp viên sau") → Ôn & từ mới 8' → Giải trí nhẹ 10' | N/A |
| Buổi sau Sân ga | Đã qua / bỏ qua | Bài chính 15' (nội dung hiện trong buổi) → Ôn 5' → Giải trí 10' (CAP-2) | N/A |
| Ngày lười | Đang ở Sân ga / sau Sân ga | Ôn 1 viên + 3 từ / 1 tin + 3 từ | N/A |
| Từ mới | Sân ga / phần còn lại T1 / từ T2 / tồn ôn > 40 | 5 / 8 / 10 / chỉ 3 kèm lời nhắn nhẹ; stack.md không còn "10 từ mới/ngày" cứng | N/A |
| Hư từ & hiển thị thẻ | the/a/of/be/have/can/will…; IPA, trọng âm, từ loại | Hư từ mở sau viên/bài dạy nó, chỉ ôn bằng thẻ điền câu; IPA sau F03, trọng âm sau F04, nhãn từ loại sau F07; lần đầu gặp từ là thẻ "Làm quen" | N/A |
| Mũ Phân Loại | Ngày 1 | Chỉ 4 câu chọn Nhà; ETS thành "Đo trình độ" tuỳ chọn, gợi ý sau Sân ga (CAP-3) | N/A |
| Dữ liệu cũ | Huy đang ở `s1-t1-w1`, đã có thẻ SRS | Tài liệu ghi: tiến độ, streak, thẻ cũ giữ nguyên; Sân ga không khoá bài T1 | N/A |
| Theme | Đọc hp-theme | Có Sân ga 9¾, Viên gạch, Bức tường, Soát vé, Qua bức tường / Lên tàu Năm 1, điểm Nhà mỗi viên | N/A |
| Thứ tự làm | Đọc mvp-phases + stories.yaml | Có Đợt 1b (stories 17–31), 20 chứa Soát vé + quiz-f-a…d, 25/26 chỉ rà quiz, 30 sau 21 | N/A |
| Code | `git diff` sau story | Chỉ đổi file `.md`/`.yaml` trong `_bmad-output/specs/` | Có file khác đổi → hoàn tác |

</frozen-after-approval>

## Code Map

- `_bmad-output/specs/spec-english-learning-website/SPEC.md` -- CAP-2 (dòng 28–29), CAP-3 (31–32), CAP-5 (37–38), CAP-9 (49), CAP-10 (52), CAP-19 (80), Constraints (96 điều hướng, 98–100), Non-goals.
- `.../learning-rules.md` -- mục Mũ Phân Loại, Trễ & gia hạn, Sổ lỗi, Nội dung bài (ngày lười). Thêm mục Sân ga, Buổi học, Từ vựng.
- `.../hp-theme.md` -- bảng ánh xạ, bảng huy chương ("mỗi huy chương có 3 cấp" cần ghi ngoại lệ), hiệu ứng.
- `.../mvp-phases.md` -- bảng đợt; dòng cuối "Các story của Đợt 1 nằm ở `stories.yaml`".
- `.../stack.md` -- dòng "Flashcard SRS" (`10 từ mới/ngày`), dòng "UI" (chưa nói bố cục máy tính).
- `.../stories.yaml` -- mục 17–31 đã thêm (chưa commit, giữ lại); chỉnh 18, 19, 20, 21, 25, 26.
- Đối chiếu (KHÔNG sửa): `src/app/nav-items.ts` (NAV_ITEMS 5 mục), `src/app/AppShell.tsx:41` (`max-w-md`), `src/pages/Session.tsx:19-23` (STEPS ôn → bài → giải trí), `src/lib/srs/srs.ts:60` (`NEW_PER_DAY = 10`), `src/lib/trophies/points.ts` (`DAY_POINTS` full 10 / lazy 5), `src/lib/trophies/medals.ts` (3 cấp), `src/lib/quiz/quiz.ts:179` (mọi câu sai vào Sổ lỗi), `src/pages/SortingHat.tsx` (form ETS ngày 1).
- Nguồn thiết kế (ngoài repo, chỉ tham khảo): `foundation-desktop-synthesis.json` (scratchpad phiên làm việc, không lưu trong repo) (`foundationRecommendation`, `desktopRecommendation`, `foundationLessons`).

## Tasks & Acceptance

**Execution:**
- [x] `SPEC.md` -- thêm **CAP-23** "Sân ga 9¾ · Lý thuyết vỡ lòng trước Năm 1" (intent: 18 viên tự soạn, 4 hàng, thứ tự trong viên, Soát vé, bỏ qua/quay lại, dải trên Lộ trình trước Chặng 1; success: bức tường 18 viên, Soát vé đánh dấu đúng hàng, không khoá, qua tường có màn ăn mừng + huy chương, lịch đếm từ ngày qua/bỏ qua, dữ liệu cũ giữ nguyên). Sửa CAP-2 (thứ tự lý thuyết trước, 2 dạng buổi và ngày lười), CAP-3 (ngày 1 chỉ chọn Nhà; xếp lúc đầu do Soát vé; ETS thành "Đo trình độ"), CAP-5 (lịch đếm từ ngày qua/bỏ qua Sân ga, không "lùi" vì Sân ga), CAP-9 (số từ mới và thứ tự mở từ theo learning-rules), CAP-10 (IPA/trọng âm hiện sau viên dạy chúng), CAP-19 (ngoại lệ Sổ lỗi). Thay dòng 96 bằng luật điều hướng theo 1024px. Thêm Constraint "không dùng hay kiểm tra kiến thức chưa dạy" kèm ngoại lệ. Non-goals thêm "thanh bên trái, master–detail Sổ lỗi/Sổ tay trên máy tính".
- [x] `learning-rules.md` -- thêm mục **Sân ga 9¾ (CAP-23)** (bảng F01–F18 ở Design Notes, thứ tự màn trong viên, < 60% đúng thì mời "Xem lại giải thích" + 2 câu dễ hơn, Soát vé, "Tôi biết rồi", điều kiện xong hàng/xong Sân ga, bỏ qua/quay lại), **Buổi học (CAP-2)** (2 thứ tự, 1 viên/buổi + "Học tiếp viên sau", `prioritizeSections` không đẩy lý thuyết xuống, nội dung bài hiện trong buổi), **Trang Hôm nay khi ở Sân ga** (1 thẻ chính "Sân ga 9¾ — x/18", ẩn Bài hiện tại, lịch 750, lời mời Mũ, bảng khoảng cách), **Từ vựng (CAP-9, CAP-10)** (5/8/10, > 40 thẻ tồn → 3, từ chủ đề + từ khởi đầu trước NGSL, hư từ như ngữ pháp, thẻ "Làm quen", IPA/trọng âm/từ loại theo F03/F04/F07, "Từ phổ biến #n", ví dụ AI vượt trình độ thay bằng câu tự viết). Sửa mục Mũ Phân Loại, Trễ & gia hạn (ngày bắt đầu lịch), Sổ lỗi (khi nào ghi / không ghi), Ngày lười.
- [x] `hp-theme.md` -- thêm vào bảng: Sân ga 9¾, Viên gạch, Bức tường, Soát vé, Qua bức tường · Lên tàu Năm 1; bảng huy chương thêm "Lên tàu Năm 1" (một lần, không cấp, chỉ khi xong cả 4 hàng, bỏ qua thì chưa trao); điểm Nhà +5 cho lần đầu xong mỗi viên (học lại không cộng, hàng qua bằng kiểm tra không cộng, không đổi cách tính cũ); hiệu ứng: viên xong sáng lên trên tường, qua tường có màn ăn mừng + cú đưa thư.
- [x] `mvp-phases.md` -- chèn dòng **1b: Sân ga 9¾ + máy tính** giữa Đợt 1 và 2 (hạn: càng sớm càng tốt, trước khi học tiếp T1; CAP-23 + các CAP sửa + bố cục máy tính; lý do: T1 dùng kiến thức chưa dạy, Huy học thêm trên laptop). Thêm đoạn thứ tự story: 17 → 18 → 19 → 20 (Huy bắt đầu Soát vé + hàng A) → 21 → 22 → 23 → 24 → 25 → 26 → 27 → 28; 29 làm song song bất cứ lúc nào; 30 sau 21 và 29; 31 sau 30. Dòng cuối đổi thành "Các story Đợt 1 và 1b nằm ở `stories.yaml`".
- [x] `stack.md` -- dòng Flashcard SRS: thay "10 từ mới/ngày" bằng "số từ mới/ngày theo giai đoạn (`learning-rules.md`)"; dòng UI thêm "dưới 1024px bottom nav, từ 1024px thanh trên cùng; chỉ thêm class `lg:`/`xl:`/`pointer-fine:`, 375px không đổi".
- [x] `stories.yaml` -- giữ mục 17–31 đã thêm; sửa: **18** shape `foundation: { bricks, rows, placement, completedAt, skippedAt, updatedAt }` (rows = kết quả kiểm tra theo hàng, placement = trạng thái Soát vé `pending|done|skipped`), lib thêm `needsPlacement`, gộp theo viên và theo hàng; **19** viên chưa có nội dung hiện "Đang soạn", hàng đã đạt hiện xong; **20** đổi tiêu đề thành "Nội dung hàng A (F02–F06), Soát vé 4 hàng và quiz-f-a…d", viết cả 4 QuizDef × 8 câu, màn Soát vé hiện khi `placement` còn `pending` (làm lần lượt A→D, dừng giữa chừng được, "Bỏ qua, học từ viên 1"), "Tôi biết rồi" dùng cùng quiz, câu sai chỉ ghi Sổ lỗi khi đã học hết viên của hàng; **21** "Lý thuyết 12' (1 viên/buổi, xong viên có nút 'Học tiếp viên sau')"; **25** thay "QuizDef quiz-f-b 8 câu" bằng "rà lại quiz-f-b (story 20) cho khớp nội dung F07–F12"; **26** thay "và quiz-f-c, quiz-f-d" bằng "; rà lại quiz-f-c, quiz-f-d (story 20)", thêm "+5 điểm Nhà lần đầu xong mỗi viên". YAML phải parse được.
- [x] Rà từng dòng I/O Matrix bằng các lệnh ở Verification; dòng nào không thấy trong tài liệu thì sửa tài liệu.

**Acceptance Criteria:**
- Given người implement story 18–31 chỉ đọc SPEC + companion, when tìm luật cho phần mình làm, then thấy đủ luật mà không phải mở file synthesis, và không có hai file nói ngược nhau.
- Given `git diff --stat HEAD`, when story xong, then chỉ có file trong `_bmad-output/specs/spec-english-learning-website/` (gồm file spec này) và `npm run lint && npm test && npm run build` vẫn pass.

## Implementation Notes

- Chỉ sửa tài liệu trong `_bmad-output/specs/spec-english-learning-website/`: SPEC.md, learning-rules.md, hp-theme.md, mvp-phases.md, stack.md, stories.yaml. Không đụng code, test, `public/`, `_bmad-output/brainstorming/**`.
- SPEC.md: thêm CAP-23 sau CAP-22; sửa CAP-2/3/5/9/10/19; dòng điều hướng theo 1024px (không còn "bottom nav đúng 5 mục" đứng riêng); thêm Constraint "không dùng hay kiểm tra kiến thức chưa dạy" kèm ngoại lệ Soát vé / "Tôi biết rồi"; dòng "test bám bài" ghi viên gạch `fNN` cũng là bài nguồn; Non-goals thêm thanh bên trái + master–detail.
- learning-rules.md: thêm mục Sân ga 9¾ (bảng F01–F18 có phút, hàng, mục tiêu 1 dòng rút từ `foundationLessons`), Buổi học, Trang Hôm nay khi ở Sân ga, Từ vựng; sửa Mũ Phân Loại, Trễ & gia hạn, Sổ lỗi, Nội dung bài (ngày lười, chỉ dùng kiến thức đã dạy).
- Chi tiết Claude tự chọn để tránh mơ hồ cho story 18–31 (ghi trong tài liệu):
  - Ngày bắt đầu lịch = ngày bỏ qua đầu tiên hoặc ngày qua tường (lấy ngày sớm hơn) + số ngày tạm dừng. Quay lại Sân ga sau khi bỏ qua thì lịch tạm dừng, không về "chưa bắt đầu" (đổi sau review, xem Spec Change Log).
  - "x/18" trên Hôm nay đếm cả viên thuộc hàng đã qua bằng kiểm tra; IPA/trọng âm/từ loại cũng mở khi hàng chứa F03/F04/F07 qua bằng kiểm tra.
  - Điểm Nhà +5: hàng qua bằng kiểm tra không cộng, nhưng nếu sau đó Huy vẫn học một viên ấy lần đầu thì viên đó được +5. hp-theme ghi lại cách tính cũ (10/5, thưởng mỗi 7 ngày) đúng theo `src/lib/trophies/points.ts`.
  - Lời mời "Ôn viên gạch X 6'?" (story 28) và 3 màn "Thư nhập học" (story 22) được ghi vào learning-rules để story không phải mở file synthesis.
- stories.yaml: ngoài 18/19/20/21/25/26 theo task, sửa thêm mô tả story 17 (bỏ "Tạo file story 17–31", mâu thuẫn với Never của spec này) và thêm dòng chú thích `# Đợt 1b` trước story 17; tiêu đề 25/26 đổi "quiz" thành "rà quiz". YAML parse được bằng PyYAML, đủ 33 mục (1–31 cùng 2a, 3a).
- Kiểm tra: `npm run lint && npm test && npm run build` pass (47 file test, 837 test); `git diff --name-only HEAD` chỉ có file trong thư mục spec; các lệnh grep ở Verification đều ra đúng kỳ vọng (không còn "10 từ mới" trong stack.md).

## Spec Change Log

- **2026-11-06, sau review (không sửa phần frozen):**
  - **Finding kích hoạt:** blind 3, edge 1–2 (quay lại Sân ga xoá ngày bắt đầu lịch; bỏ qua rồi qua tường làm ngày bắt đầu nhảy).
  - **Đã sửa:** ghi chú Implementation Notes về ngày bắt đầu lịch. Lịch đã bắt đầu thì không quay về "chưa bắt đầu"; quay lại Sân ga thì lịch tạm dừng, số ngày tạm dừng cộng vào ngày bắt đầu.
  - **Trạng thái xấu tránh được:** mất ngày bắt đầu và tuần trễ (trái "không reset"), hoặc hiện "lùi" vì Sân ga (trái quyết định 1 của Huy).
  - **KEEP:** quyết định 1–4 của Huy; "không bao giờ hiện lùi vì Sân ga"; bỏ qua không xoá gì.
  - **Chi tiết Claude chọn thêm** (Huy cho chạy liên tục):
    - bỏ qua Sân ga thì mọi cổng viên gạch mở;
    - hư từ không có viên nào dạy gắn với bài Chặng 1, không có bài thì mở khi qua hoặc bỏ qua Sân ga;
    - dữ liệu cũ vào Sân ga với Soát vé `pending`;
    - Soát vé không tính là buổi học;
    - quy tắc gộp `foundation`.

## Review Triage Log

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | blind | Bỏ qua Sân ga thì IPA, trọng âm, từ loại, hư từ không bao giờ mở | high | learning-rules chỉ mở cổng khi xong F03/F04/F07 hoặc hàng qua kiểm tra; bỏ qua không có trong luật | patch: thêm "Viên tính là đã dạy" (gồm đã từng bỏ qua), cổng mở rồi không đóng; story 18/23/24 dùng isBrickTaught |
| 2 | blind | Hư từ không viên nào dạy (can, will, do, and/but/or) không có cổng | medium | F01–F18 không dạy can/will/liên từ; learning-rules chỉ nói "mở sau viên hoặc bài dạy nó" | patch: gắn bài Chặng 1 đầu tiên dạy nó, không có thì mở khi qua/bỏ qua Sân ga (learning-rules, story 24) |
| 3 | blind | Quay lại Sân ga xoá lịch đã chạy, dời mốc 750 | medium | learning-rules cũ: "Quay lại Sân ga thì bỏ trạng thái bỏ qua", đang ở Sân ga thì lịch "chưa bắt đầu" | patch: lịch đã bắt đầu không quay về; quay lại thì tạm dừng, cộng ngày tạm dừng; ôn viên không tính là quay lại |
| 4 | blind | Thiếu luật nâng cấp dữ liệu cũ (placement, ngày, Welcome, Mũ, ETS) | medium | `roadmapStartDate` hiện lấy ngày buổi đầu; tài liệu chỉ nói giữ tiến độ, streak, SRS | patch: mục "Dữ liệu cũ (nâng cấp)" + giá trị đầu cho story 18 |
| 5 | blind | `foundation` chưa có trong stack.md và CAP-22; cờ Thư nhập học, phần T1 đã xem chưa có chỗ | medium | stack.md có dòng cho `reminders` v11, `videoPractice` v12 nhưng không có v13 | patch: dòng "Sân ga 9¾" trong stack.md, CAP-22 thêm Sân ga, `welcomeSeenAt`, `progress.lessons[id]` |
| 6 | blind | 70% của 8 câu mơ hồ | false | Mọi cách tính ≥ 70% (5/8 = 62,5%) đều cần 6/8, không có cách làm tròn nào cho 5/8 qua | reject |
| 7 | blind | Luật "không dùng kiến thức chưa dạy" thiếu ngoại lệ | low | Test quay lại và O.W.L. chỉ dùng bài đã học nên không vướng; "Đo trình độ" (ETS) và nội dung giải trí thì chưa được nêu | patch: thêm "Đo trình độ" và ghi giải trí không thuộc luật (SPEC, learning-rules) |
| 8 | blind | CAP-1/6/7 không tính tới Sân ga; dòng 1b thiếu CAP | medium | CAP-6 lấy câu từ bài 4 tuần gần nhất, khi ở Sân ga không có bài; mvp-phases 1b thiếu CAP-1, 6, 20, 22 | patch: CAP-1 success có dải Sân ga, CAP-6 + learning-rules luật test ở Sân ga, dòng 1b đủ CAP. CAP-7 tự nó không đổi |
| 9 | blind | Ngày lười khi chưa xong viên nào | low | "ôn 1 viên gạch" không có viên để ôn ở ngày 1 | patch: ôn viên xong gần nhất; chưa có thì xem giải thích viên tiếp theo |
| 10 | blind | Soát vé có tính là buổi học không | medium | Không file nào nói; ảnh hưởng streak, điểm Nhà, `status.json` cho Owl Post | patch: Soát vé không tính là buổi (learning-rules, story 22) |
| 11 | blind | Lời mời "Ôn viên gạch X 6'?" không dựng được từ dữ liệu | medium | Nhãn Sổ lỗi là loại lỗi, không phải khái niệm; không có cửa sổ thời gian, không có cách ẩn | patch: dùng `uses`/`teaches`, 14 ngày, ẩn khi ôn hoặc "Để sau", n = số phút của viên |
| 12 | blind | Luật máy tính chỉ nằm trong stories.yaml | low | stories.yaml là nơi người làm story 29–31 đọc (mvp-phases trỏ tới); SPEC và stack.md đã có luật 1024px | reject |
| 13 | blind | Tài liệu ghi số dòng sẽ lệch | low | stories.yaml story 17 "dòng 96" (giờ là dòng khác), story 27 ghi `file:line`; phần Code Map là spec của build này | patch stories.yaml: dùng id câu và chuỗi; phần Code Map reject (sửa spec build) |
| 14 | blind | File story trỏ tới file tạm, status, mục trống | low | Sửa file spec của build này | reject (status đặt `done` ở bước cuối; hai mục log đã điền) |
| 15 | blind | Lệnh Verification kiểm ít hơn lời mô tả | low | Sửa spec của build này. Đã tự chạy PyYAML: 33 mục, đủ id 1–31 + 2a, 3a | reject |
| 16 | blind | SPEC mâu thuẫn `lo-trinh-toeic-12-thang.md` (không được sửa) | low | CAP-1/CAP-4 dẫn file lộ trình bắt đầu 12 tháng ở T1 | patch: SPEC Constraints ghi SPEC + learning-rules thắng ở phần Sân ga và ngày bắt đầu lịch |
| 17 | blind | Nội dung viên (F08, F09, F18) dùng kiến thức chưa dạy | false | F08 dạy S + V (+ O) và câu mệnh lệnh; "I love…", "I get up at 7" chỉ là I + động từ nguyên mẫu. Story 27 đã có test tiên quyết `uses` cho viên gạch | reject |
| 18 | blind | "Đang ở Sân ga" chỉ định nghĩa thoáng qua | low | Định nghĩa nằm trong ngoặc ở Trễ & gia hạn | patch: định nghĩa một lần ở mục Sân ga |
| 19 | edge | Bỏ qua rồi quay lại thì mất ngày bắt đầu và tuần trễ | medium | Như #3 | patch (cùng #3) |
| 20 | edge | Bỏ qua rồi qua tường thì ngày bắt đầu nhảy sang ngày qua tường | medium | Luật cũ "ngày bắt đầu = ngày qua tường; chưa qua thì ngày bỏ qua" | patch: lấy ngày sớm hơn (cùng #3) |
| 21 | edge | Bỏ qua thì IPA/trọng âm/từ loại không bao giờ hiện | high | Như #1 | patch (cùng #1) |
| 22 | edge | Bỏ qua thì hư từ gắn viên gạch bị giữ mãi | high | Như #1 | patch (cùng #1) |
| 23 | edge | Hàng qua bằng kiểm tra chưa mở cổng hư từ | medium | Ngoặc "hàng qua bằng kiểm tra" chỉ nằm ở dòng hiển thị thẻ | patch: luật "Viên tính là đã dạy" áp cho mọi cổng |
| 24 | edge | Bỏ qua thì quiz T1 bị lọc rỗng, có thể chặn xong bài | medium | Lọc câu theo khái niệm đã dạy; bỏ qua không tính là đã dạy; không nói "không chặn" | patch: bỏ qua tính là đã dạy, "còn dưới 4 câu… không chặn việc xong bài" (learning-rules, story 27) |
| 25 | edge | Ngày lười ở Sân ga khi chưa xong viên nào | low | Như #9 | patch (cùng #9) |
| 26 | edge | Test quay lại khi đang ở Sân ga | medium | Như #8 | patch (cùng #8) |
| 27 | edge | Hôm nay ẩn lời mời Mũ trong Sân ga nhưng CAP-3 cần chọn Nhà | high | learning-rules cũ ẩn "lời mời Mũ Phân Loại / Đo trình độ"; ngày 1 là ở Sân ga; `Today.tsx` chỉ dẫn tới `/sorting-hat` qua `SortingHatInvite` | patch: chỉ ẩn "Đo trình độ"; chưa có Nhà thì vẫn mời Mũ, Thư nhập học dẫn tới Mũ |
| 28 | edge | Soát vé dừng giữa hàng: chấm hàng dở thế nào | low | "Dừng giữa chừng được, hàng đã làm giữ kết quả" không nói hàng dở | patch: hàng dở không tính, làm lại từ câu 1 |
| 29 | edge | Hai máy: hàng đã đạt bị bản trượt mới hơn đè | medium | story 18 gộp hàng theo `updatedAt` | patch: `passed` một bên đạt là đạt, điểm cao nhất lấy max (stack.md, story 18) |
| 30 | edge | Chưa có luật gộp `placement`, `completedAt`, `skippedAt` | medium | story 18 chỉ nói gộp theo viên và hàng | patch: ngày lấy sớm nhất, done/skipped thắng pending, phần còn lại theo `updatedAt` (cùng #29) |
| 31 | edge | Sau hàng A, viên tiếp F07 còn "Đang soạn" trước story 25 | medium | mvp-phases cho Huy học sau story 20, nội dung F07 tới story 25 | patch: viên tiếp theo bỏ viên "Đang soạn", không còn thì ôn viên xong gần nhất (learning-rules, story 21) |
| 32 | edge | Xong viên cuối giữa buổi làm kế hoạch buổi đổi | low | Sẽ xảy ra đúng lúc xong viên cuối; nút "Học tiếp viên sau" không có đích | patch: chốt kế hoạch lúc bắt đầu, nút chỉ hiện khi còn viên tiếp theo |
| 33 | edge | Ngưỡng 60% không rõ tính lần đầu hay sau khi làm lại | low | Câu luyện cho làm lại tới đúng, nên tính sau làm lại luôn 100% | patch: tính theo lần trả lời đầu |
| 34 | edge | Ngưỡng > 40 thẻ đổi trong ngày | low | Ôn xong làm số thẻ đến hạn giảm, số từ mới tăng lại từ 3; đổi theo hướng có lợi, không hại | reject |
| 35 | edge | Lời mời ôn với khái niệm do bài T1 dạy, không có cửa sổ thời gian | medium | Như #11 | patch (cùng #11): khái niệm không do viên nào dạy thì không mời |
| 36 | edge | Người dùng cũ ở `s1-t1-w1` nâng cấp | medium | Như #4 | patch (cùng #4) |
| 37 | edge | Phím tắt: giữ phím lặp, nút đang focus, 1–4 trên thẻ chưa lật / thẻ Làm quen | medium | story 31 shouldHandleKey không nói `e.repeat`, focus nút; thẻ "Làm quen" không có điểm chấm | patch: story 31 thêm các trường hợp |
| 38 | edge | Thiếu bề rộng 1023px khi kiểm bố cục | low | Lỗi lệch một ở breakpoint không bị bắt | patch: thêm 1023 vào danh sách bề rộng story 29 |
| 39 | edge | learning-rules nói câu luyện là chọn 3 đáp án, story 18 có listen/tapSyllable/order/sort | medium | Hai file nói khác nhau về dạng câu luyện | patch: learning-rules ghi chủ yếu 3 đáp án, có thể nghe/chạm âm tiết/sắp xếp/xếp nhóm |
| 40 | edge | Ẩn lời mời Mũ mâu thuẫn CAP-3 (claim) | high | Như #27 | patch (cùng #27) |
| 41 | edge | mvp-phases còn "chặng 1 bắt đầu 11/2026" (claim) | low | Đây là lý do của cột hạn build Đợt 1, không phải luật ngày bắt đầu lịch; learning-rules và CAP-5 đã rõ | reject |

Không có mục defer. Lớp verification-gap không có finding.

## Design Notes

Bảng viên gạch đưa vào learning-rules (phút, hàng; mục tiêu chi tiết lấy từ `foundationLessons` của synthesis, rút còn 1 dòng):

| Hàng | Viên |
|---|---|
| A · Nghe & đọc được chữ | F01 Anh khác Việt ở 4 chỗ (6') · F02 Bảng chữ cái & đánh vần (8') · F03 IPA là gì (8') · F04 Nguyên âm, phụ âm, âm tiết, trọng âm (8') · F05 Âm cuối (8') · F06 Số, giá, giờ, ngày, tháng (10') |
| B · Viên gạch của câu | F07 Từ loại (8') · F08 S + V (+ O) (8') · F09 Đại từ I/me/my (8') · F10 Số ít, số nhiều (8') · F11 a/an/the + đếm được (10') · F12 this/that + 's (6') |
| C · Câu đầu tiên | F13 to be khẳng định (10') · F14 to be phủ định, hỏi + từ để hỏi (10') · F15 There is/are + giới từ nơi chốn (10') · F16 have/has (6') |
| D · Cầu sang Năm 1 | F17 Thì là gì (8') · F18 at/in/on + trạng từ tần suất (8') |

Thứ tự màn trong viên: giải thích tiếng Việt (40–80 chữ) → "Tiếng Việt nói… / Tiếng Anh bắt buộc…" → ví dụ mẫu → ví dụ một chỗ trống → 2–5 câu bấm chọn 3 đáp án có "Gợi ý" (sai thì giải thích, làm lại, không màn đỏ) → Áp dụng (làm ra một thứ cụ thể). Hàng xong = mọi viên của hàng xong hoặc kiểm tra hàng ≥ 70%; Sân ga xong = cả 4 hàng xong.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass (không đổi code).
- `git diff --name-only HEAD | grep -v '^_bmad-output/specs/spec-english-learning-website/'` -- expected: không in gì.
- `node -e "const fs=require('fs');const t=fs.readFileSync('_bmad-output/specs/spec-english-learning-website/stories.yaml','utf8');if(!/id: \"31\"/.test(t))process.exit(1)"` và đọc lại YAML bằng một parser sẵn có (vd `python3 -c "import yaml,sys;yaml.safe_load(open(sys.argv[1]))" <file>` nếu có PyYAML) -- expected: parse được, đủ id 1–31.
- `grep -n "CAP-23" SPEC.md mvp-phases.md learning-rules.md`; `grep -n "1024" SPEC.md stack.md`; `grep -n "Soát vé" SPEC.md learning-rules.md hp-theme.md stories.yaml`; `grep -n "10 từ mới" stack.md` (trong thư mục spec) -- expected: 3 lệnh đầu có kết quả, lệnh cuối không còn.

**Manual checks:**
- Đọc lại SPEC CAP-2/3/5/9/10/19/23 và Constraints cạnh learning-rules: mỗi dòng I/O Matrix đều có câu tương ứng, không còn "bottom nav đúng 5 mục" đứng riêng, không còn "mỗi câu sai ở bất kỳ test nào" không ngoại lệ.
