---
id: SPEC-english-learning-website
companions:
  - mvp-phases.md
  - learning-rules.md
  - stack.md
  - hp-theme.md
  - ../../brainstorming/brainstorm-english-learning-website-2026-10-29/lo-trinh-toeic-12-thang.md
  - ../../brainstorming/brainstorm-english-learning-website-2026-10-29/nguon-hoc-mien-phi.md
sources:
  - ../../brainstorming/brainstorm-english-learning-website-2026-10-29/brainstorm-intent.md
---

> **Hợp đồng chuẩn.** SPEC này cùng các file trong `companions:` là hợp đồng đầy đủ, đã kiểm tra bảo toàn, cho việc build, test và nghiệm thu. File trong `sources:` chỉ để truy vết.

# Website cá nhân học tiếng Anh: từ 0 tới TOEIC 750+

## Why

Vision kết hợp pain. Huy (người dùng duy nhất) mất gốc tiếng Anh: chưa nắm phát âm/trọng âm và các thì, vốn từ hạn chế, nghe không ra nói tắt/nối âm. Huy từng bỏ cuộc vì lười, tự học thấy chán, trang học gò bó, giao diện nhàm, phạt nặng/xoá tiến độ. Huy không thấy lười khi xem phim, nghe nhạc, đọc sách, code dự án riêng. Thời gian rảnh của Huy là các khoảng vụn: giờ trưa, giữa giờ, trước khi ngủ. Mục tiêu: TOEIC L&R 750+ vào khoảng đầu 2028 mà **không bỏ cuộc**. Lộ trình là đường ray, nguyên tắc chống phạt là lan can, phim/nhạc/tin/theme là nhiên liệu, còn ngày lười, gia hạn và nhắc nhở giữ cho mạch học không đứt. Mục tiêu phụ: tự tin nói với người nước ngoài, xem phim không cần sub.

## Capabilities

- **CAP-1**
  - **intent:** Huy xem lộ trình 3 chặng (0→300, 300→550, 550→750+) dạng bản đồ. Mỗi chặng có danh sách bài, việc cụ thể từng bài, target Can-do và điểm TOEIC ước tính.
  - **success:** Bản đồ hiển thị đủ 3 chặng với nội dung và Can-do khớp `lo-trinh-toeic-12-thang.md`; trạm đã qua sáng lên.
- **CAP-2**
  - **intent:** Trang Hôm nay chỉ có 1 nút lớn để bắt đầu buổi 30' (5' ôn SRS → 15' bài chính → 10' phim/nhạc/tin gắn bài). Nút "Hôm nay lười" đổi sang buổi 10' (1 tin hot ngắn + 3 từ mới).
  - **success:** Từ trang Hôm nay, 1 chạm vào được buổi chuẩn và chạy đúng 3 phần. Hoàn thành buổi lười vẫn giữ streak.
- **CAP-3**
  - **intent:** Test đầu vào (Mũ Phân Loại) xếp trình độ, gán Nhà theo sở thích và lưu điểm làm mốc.
  - **success:** Sau test, Huy được đặt vào đúng chặng/bài và thấy điểm mốc theo kỹ năng trên bảng ở CAP-7.
- **CAP-4**
  - **intent:** Cuối mỗi chặng có test "qua cửa" (O.W.L. 1, O.W.L. 2, N.E.W.T.). Mỗi câu gắn tag bài nguồn. Chưa đạt thì được gợi ý ôn phần yếu.
  - **success:** Câu sai có link về đúng đoạn của bài nguồn. Ngưỡng qua cửa theo `lo-trinh-toeic-12-thang.md`. Trượt chỉ sinh kế hoạch ôn phần yếu, không reset chặng.
- **CAP-5**
  - **intent:** Khi Huy trễ tiến độ, hệ thống gia hạn và tính lại ngày dự kiến đạt 750 kèm hệ quả.
  - **success:** Trễ N tuần thì mốc lùi N tuần, ngày dự kiến mới hiển thị, không mất tiến độ.
- **CAP-6**
  - **intent:** Quay lại sau thời gian nghỉ thì làm test 5' rồi học tiếp đúng chỗ hổng.
  - **success:** Sau hơn 1 tuần không học, mở app sẽ thấy test 5'. Kết quả test đưa Huy tới bài chứa lỗ hổng, không về bài 1.
- **CAP-7**
  - **intent:** Bảng khoảng cách tới mục tiêu theo từng kỹ năng tự đẩy bài vào kỹ năng yếu nhất. Đồng hồ cộng giờ học tích luỹ: giờ chủ động, cộng giờ phim/nhạc có mục đích tính ×½.
  - **success:** Bảng hiển thị điểm hiện tại so với mục tiêu theo từng kỹ năng. Bài kế tiếp thuộc kỹ năng có khoảng cách lớn nhất. Đồng hồ hiển thị giờ tích luỹ so với mốc 450 giờ/năm.
- **CAP-8**
  - **intent:** Module 7 Part TOEIC L&R, mỗi Part có mẹo và các câu bẫy hay gặp.
  - **success:** Cả 7 Part đều có trang mẹo kèm ví dụ câu bẫy, truy cập được từ Luyện tập.
- **CAP-9**
  - **intent:** Flashcard lặp lại ngắt quãng (SRS) tự build, từ xếp theo tần suất (NGSL → TSL). Mỗi thẻ có từ, IPA, câu ngữ cảnh từ phim/nhạc/tin, nghĩa tiếng Việt.
  - **success:** Phiên ôn chỉ hiện thẻ đến hạn. Lịch ôn giãn ra khi nhớ, rút lại khi quên. Thẻ thêm từ ngữ cảnh lưu kèm câu gốc.
- **CAP-10**
  - **intent:** Mỗi từ hiển thị IPA, đánh dấu trọng âm và có nút nghe. Huy nói câu mẫu và nhận kết quả so khớp.
  - **success:** Nghe được audio mẫu. Câu nói của Huy được nhận dạng và đối chiếu với câu mẫu, chỉ rõ từ lệch.
- **CAP-11**
  - **intent:** Học các thì qua dòng thời gian trực quan kèm cảnh phim minh hoạ. Thì đã học trở thành "thần chú" được mở khoá.
  - **success:** Mỗi thì trong chặng 1 có hình dòng thời gian và ít nhất 1 câu thoại phim. Hoàn thành bài thì sẽ mở khoá thần chú tương ứng.
- **CAP-12**
  - **intent:** Video bài học có phụ đề song ngữ Anh-Việt hiển thị cùng lúc, chú thích idiom/nói tắt/nghĩa ngữ cảnh ngay trên video, và highlight các câu liên quan bài đang học. Sub đi theo thang trượt (Việt+Anh → Anh → không sub). Có chế độ ẩn sub để điền từ.
  - **success:** Một video gắn bài hiển thị đủ hai lớp sub đồng bộ theo thời gian, cùng chú thích và highlight. Khi tỉ lệ điền từ đúng đạt ngưỡng, app đề xuất lên cấp sub. Sub do Claude tự làm (`stack.md`).
- **CAP-13**
  - **intent:** Nghe bài hát và điền lời còn thiếu (kiểu LyricsTraining).
  - **success:** Một bài hát chạy được chế độ điền từ, chấm đúng/sai từng chỗ trống.
- **CAP-14**
  - **intent:** Từ điển nói tắt: mỗi cụm (gonna, wanna, gotta…) có clip phim thật, dạng đầy đủ và chế độ nghe chậm.
  - **success:** Tra một cụm sẽ phát được clip, xem được dạng đầy đủ và nghe chậm.
- **CAP-15**
  - **intent:** Feed tin chia theo khung giờ (trưa: chứng khoán, giữa giờ: AI/tech, trước ngủ: podcast nhẹ). Từ TOEIC/TSL xuất hiện trong tin được tự highlight.
  - **success:** Feed đổi theo giờ trong ngày. Tin lấy từ nguồn gọi trực tiếp được (HN API, HN Algolia, Google AI Blog RSS) có highlight từ thuộc TSL. Nguồn không có CORS (VOA, Breaking News English, OpenAI, podcast) chỉ hiện dạng link ra ngoài.
- **CAP-16**
  - **intent:** Hội thoại giọng nói 1-1 realtime với AI, bám bài học hiện tại, có roleplay công sở/TOEIC (phỏng vấn, họp, gọi khách) với độ khó theo chặng và chỉ dùng các thì (thần chú) đã mở khoá. Sau mỗi lượt, AI sửa lỗi bằng tiếng Việt. Huy chọn được giọng và tốc độ.
  - **success:** Một phiên roleplay chạy bằng giọng nói hai chiều. Mỗi lượt có nhận xét lỗi tiếng Việt. Đổi giọng/tốc độ có hiệu lực. Trên trình duyệt không hỗ trợ giọng nói (vd iOS Safari), app hiện link sang Gemini hoặc AI luyện nói miễn phí khác, kèm prompt roleplay của bài hiện tại.
- **CAP-17**
  - **intent:** AI chấm bài viết tiếng Anh (commit, README, comment, email, đoạn văn), giải thích lỗi bằng tiếng Việt.
  - **success:** Dán một bài viết vào sẽ nhận lại bản sửa, từng lỗi có quy tắc và ví dụ bằng tiếng Việt.
- **CAP-18**
  - **intent:** Bôi đen câu/từ trong phim hoặc bài đọc để lưu 1 chạm vào sổ tay kèm ngữ cảnh gốc. Huy ghi chú kiến thức (ngữ pháp, quy tắc) ngay trong web.
  - **success:** Mục đã lưu hiển thị trong Sổ tay kèm nguồn và câu gốc, còn nguyên sau khi tải lại app.
- **CAP-19**
  - **intent:** Sổ lỗi sai ("của Snape") gom các câu sai, phân loại lỗi và đưa vào ôn SRS. Nút "Vì sao sai?" gọi AI giải thích kèm 2 ví dụ đúng.
  - **success:** Mỗi câu sai ở bất kỳ test nào đều tự vào sổ, có nhãn loại lỗi. Bấm "Vì sao sai?" trả về giải thích tiếng Việt kèm 2 ví dụ đúng.
- **CAP-20**
  - **intent:** Theme Harry Potter là cấu trúc lộ trình: chặng là Năm học, có Phòng Cúp huy chương nhiều cấp, streak là điểm Nhà, có hiệu ứng khi đúng hoặc khi nhận thưởng. Chi tiết trong `hp-theme.md`.
  - **success:** Mọi ánh xạ trong `hp-theme.md` đều hiện trong app. Huy chương được trao đúng điều kiện.
- **CAP-21**
  - **intent:** Nhắc học qua nhiều kênh: browser notification, PWA web push, lịch iCloud/Google qua .ics hoặc lịch subscribe, Telegram bot "Owl Post". Telegram nhắc theo giờ cố định các buổi trong ngày (trưa, giữa giờ, trước ngủ) và kiểm tra hôm nay đã học chưa trước khi nhắc.
  - **success:** Cả 4 kênh đều nhận được nhắc trên iPhone kể cả khi tab đã đóng (trừ kênh browser notification). Ngày đã hoàn thành buổi học thì Telegram không nhắc lại "chưa học".
- **CAP-22**
  - **intent:** Huy sao lưu và khôi phục toàn bộ dữ liệu học (tiến độ, streak, SRS, sổ tay, sổ lỗi, huy chương) bằng file JSON. App cũng tự giữ một bản sao ngoài máy.
  - **success:** Xoá dữ liệu trình duyệt rồi nhập lại file backup (hoặc kéo bản sao tự động về) thì khôi phục đúng trạng thái. Bản backup không bao giờ chứa API key hay token.

## Constraints

- Chỉ front-end (React + shadcn/ui), không backend. Dữ liệu cá nhân lưu ở localStorage. Thứ duy nhất nằm ngoài máy là GitHub: Gist chứa trạng thái/bản sao, Actions chạy cron. Chi tiết trong `stack.md`.
- Không dùng proxy. Nguồn không gọi trực tiếp được từ trình duyệt thì chỉ link ra ngoài.
- Thứ tự làm theo `mvp-phases.md`. Luật học và luật chấm điểm theo `learning-rules.md`.
- PWA host miễn phí trên GitHub Pages, dùng chính trên iPhone qua "Thêm vào MH chính". Vì vậy app mobile-first, bottom nav đúng 5 mục: Hôm nay / Lộ trình / Luyện tập / Sổ tay / Phòng Cúp.
- AI theo kiểu BYOK: Huy tự nhập key, key lưu ở localStorage, không bao giờ commit hay deploy kèm key.
- Không khoá, không phạt, không xoá hay reset tiến độ. Khi sai nhiều, app mở thêm gợi ý và chia nhỏ bài.
- Mọi lỗi đều giải thích bằng tiếng Việt, kèm quy tắc và ví dụ.
- Test nào cũng bám bài: mỗi câu gắn tag bài nguồn, sai thì có link về đúng đoạn bài đó.
- Nội dung chỉ lấy từ nguồn miễn phí, uy tín (`nguon-hoc-mien-phi.md`). Chỉ NGSL/TSL (CC BY-SA 4.0) được đóng gói vào app, có ghi nguồn. Oxford 3000/5000 và ETS chỉ được link. Mini test tự build chỉ theo khuôn format ETS, không copy nội dung đề.
- Repo public trên GitHub Pages, nên asset Harry Potter chỉ được tự vẽ hoặc AI-gen "lấy cảm hứng". Không dùng logo hay nhân vật gốc.
- Không commit API key, PAT, token bot, gist id hay dữ liệu học cá nhân. Những thứ này chỉ nằm ở localStorage hoặc GitHub Secrets.
- Giao diện sinh động, có animation, điều hướng gọn và ít mục.
- Tuần nào cũng có cả trục chính TOEIC và trục phụ sở thích (phim/nhạc/tin).

## Non-goals

- Nhiều người dùng, tài khoản, backend hay đồng bộ server.
- App native iOS hoặc TestFlight. Bọc Capacitor để sau.
- TOEIC Speaking & Writing trước khi đạt 750 L&R.
- Nguồn hay nội dung trả phí (đã loại Newsela).
- Chép tay từ vựng (sổ tay chỉ dành cho kiến thức và ngữ cảnh).

## Success signal

- Huy thi TOEIC L&R thật và đạt ≥750 vào khoảng đầu 2028. Trước đó, mốc báo sẵn sàng là 2 đề N.E.W.T. gần nhất đều ≥750 và streak (tính cả ngày lười) không bị bỏ dở quá 1 tuần mà không quay lại.

## Assumptions

- "Phim" ở CAP-12 nghĩa là video embed được từ YouTube: ưu tiên VOA (public domain, có transcript), sau đó BBC Learning English và TED-Ed. Clip nói tắt ở CAP-14 lấy qua widget YouGlish. Không dùng phim thương mại vì không có nguồn miễn phí hợp lệ.