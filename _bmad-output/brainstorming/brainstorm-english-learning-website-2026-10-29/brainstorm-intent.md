---
type: brainstorm-intent
topic: Website cá nhân học tiếng Anh từ con số 0
source: .memlog.md (brainstorm 2026-10-29)
user: Huy
---

# Brainstorm Intent — Website học tiếng Anh cá nhân

**Sợi chỉ chung:** đi tới mốc cuối (TOEIC 750+) mà **không bỏ cuộc**. Lộ trình = đường ray; nguyên tắc lật-ý-tệ = lan can chống bỏ cuộc; phim/nhạc/tin/HP/huy chương = nhiên liệu giữ đà; ngày lười + gia hạn + nhắc nhở = cơ chế "không đứt mạch".

## 1. Vấn đề & người dùng
- Người dùng duy nhất: Huy, mất gốc (chưa nắm phát âm/trọng âm, mất gốc các thì, vốn từ hạn chế, nghe không ra nói tắt/nối âm như gonna, wanna).
- Từng bỏ cuộc vì: lười, tự học thấy chán, trang học hiện có gò bó, giao diện không hứng thú, phạt nặng/xoá tiến độ.
- Không thấy lười khi: xem phim, nghe nhạc, đọc sách, code dự án riêng. Ngại chép tay từ vựng nhưng muốn note kiến thức (ngữ pháp, quy tắc).
- Rảnh vụn: giờ trưa, giữa giờ, trước khi ngủ. Đã đỡ ngại nói, sẵn sàng luyện nói với AI.

## 2. Mục tiêu & chỉ số thành công
- **Chính:** TOEIC L&R **750+** vào khoảng **đầu 2028**, học **tối thiểu 30 phút/ngày**.
- **Phụ:** tự tin nói chuyện với người nước ngoài; xem phim không cần sub. (Sau 750 có thể nhắm TOEIC Speaking & Writing.)
- Đo lường: điểm thi thử theo kỹ năng vs mục tiêu; qua bài test cuối mỗi chặng; giờ học tích luỹ vs mốc giờ cần; chuỗi ngày học không đứt.

## 3. Trụ cột
1. **Lộ trình theo chặng có target** (trục chính TOEIC).
2. **Học qua sở thích** (phim/nhạc/tin AI-chứng khoán) — trục phụ giữ hứng thú, mỗi tuần có cả hai trục.
3. **Nguyên tắc lật ngược ý tệ** — chống bỏ cuộc.

## 4. Nguyên tắc sản phẩm (lật từ ý tệ)
- **Không khoá, không phạt:** sai không bao giờ mất tiến độ; sai nhiều → mở thêm gợi ý, chia nhỏ bài.
- **Luôn giải thích lỗi** bằng tiếng Việt + quy tắc + ví dụ.
- **Test bám bài:** mỗi câu test gắn tag bài nguồn, sai → link về đúng đoạn bài đó.
- **Trễ thì gia hạn, không phạt**; có nhắc nhở để không trễ.
- **Mobile-first**; điều hướng gọn, ít mục, rõ ràng.
- **Sinh động:** có hiệu ứng/animation, không khô khan.
- **Video:** luôn có sub Việt, phụ đề song ngữ Anh-Việt cùng lúc, chú thích idiom/nói tắt/nghĩa ngữ cảnh ngay trên video.
- **AI:** giọng rõ, chỉnh tốc độ, chọn giọng; hội thoại giọng nói 1-1 realtime; bám bài học hiện tại, tự nhiên.
- **Không reset:** quay lại sau thời gian nghỉ → test 5 phút rồi học tiếp đúng chỗ hổng.

## 5. Tính năng chính
Ghi chú: thứ tự làm đã chốt trong spec `mvp-phases.md` (Đợt 1 / 2 / 3), không còn nhãn [MVP?].

**Lộ trình**
- 3 chặng TOEIC: 0→300 (phát âm, 1000 từ, 12 thì) → 300→550 (từ vựng công sở, Part 1-2-5) → 550→750+ (Part 3-4-7, đọc nhanh, đề tính giờ).
- Mỗi chặng: nội dung, danh sách bài + việc cụ thể từng bài, target "Can-do" + điểm TOEIC ước tính.
- Test "qua cửa" cuối chặng (mini test TOEIC); chưa đạt → gợi ý ôn phần yếu.
- Gia hạn khi trễ + tự tính lại ngày dự kiến đạt 750 và hệ quả.
- Buổi 30' chuẩn: 5' ôn từ (lặp lại ngắt quãng) → 15' bài chính → 10' phim/nhạc/tin gắn bài; ngày lười 10'.
- Nút "Hôm nay lười": 1 tin hot ngắn + 3 từ mới, vẫn giữ streak.
- Trang "Hôm nay" chỉ 1 nút lớn "Bắt đầu buổi học".
- Bảng khoảng cách tới mục tiêu theo kỹ năng, tự đẩy bài vào kỹ năng yếu nhất; đồng hồ giờ học tích luỹ (tính cả phim/nhạc có mục đích).
- Module 7 Part TOEIC L&R (mẹo + câu bẫy).

**Học qua phim / nhạc / tin**
- Video gắn với kiến thức bài (YouTube embed: ưu tiên VOA public domain, BBC Learning English, TED-Ed; không dùng phim thương mại); highlight câu liên quan bài học; sub "thang trượt" (Việt+Anh → Anh → không sub, tự đề xuất lên cấp khi điền từ đủ tỉ lệ); ẩn sub điền từ.
- Lyrics điền từ (kiểu LyricsTraining).
- Phụ đề tự làm lúc build: sub Anh có timestamp (caption YouTube/transcript VOA) → AI dịch Việt + chú thích idiom/nói tắt → JSON tĩnh, overlay lên YouTube embed.
- Từ điển nói tắt: cụm + clip thật (qua YouGlish) + dạng đầy đủ + nghe chậm.
- Feed theo khung giờ: trưa = chứng khoán, giữa giờ = AI/tech, trước ngủ = podcast nhẹ. Tự highlight từ TOEIC xuất hiện trong tin.
- Viết commit/README/comment bằng tiếng Anh, AI chấm.

**Luyện nói AI**
- Speech-to-text → AI → speechSynthesis; AI sửa lỗi bằng tiếng Việt sau mỗi lượt.
- Roleplay công sở/TOEIC (phỏng vấn, họp, gọi khách), độ khó theo chặng; dùng được "thần chú" (thì) đã mở khoá.
- AI chấm bài viết (commit, email, đoạn văn).

**Từ vựng / phát âm / ngữ pháp**
- Từ theo tần suất (~1000 từ đầu: Oxford 3000/NGSL), học theo ngữ cảnh câu phim/nhạc; flashcard lặp lại ngắt quãng tự build.
- IPA + đánh dấu trọng âm + nút nghe (Web Speech API); luyện nói so khớp câu mẫu.
- Các thì qua dòng thời gian trực quan + cảnh phim.

**Sổ tay & Sổ lỗi sai**
- Note 1 chạm: bôi đen câu/từ → lưu sổ tay kèm ngữ cảnh gốc (localStorage); ghi chú kiến thức trong web.
- "Sổ lỗi sai của Snape": gom câu sai, phân loại lỗi, ôn lặp lại ngắt quãng; nút "Vì sao sai?" gọi AI giải thích + 2 ví dụ đúng.

**Động lực / theme Harry Potter (theme = cấu trúc lộ trình)**
- Test đầu vào = Mũ Phân Loại (xếp trình độ + Nhà theo sở thích).
- Chặng = Năm học Hogwarts; test cuối chặng = O.W.L.; thi thử full = N.E.W.T.; ngữ pháp = Thần chú mở khoá.
- Lộ trình dạng bản đồ game, trạm đã qua sáng lên.
- Huy chương có cấp (đồng→bạc→vàng) trong Phòng Cúp: Hermione = trắc nghiệm 100%, Dumbledore = qua O.W.L., Hagrid/Sirius = nói với AI được nhận xét tốt, Neville = quay lại sau khi gãy chuỗi. Streak = điểm Nhà.
- Hiệu ứng: Lumos khi đúng, cú bay thả thư khi nhận huy chương (Framer Motion); theme tối lâu đài + màu Nhà.

**Nhắc nhở**
- Browser Notification + PWA web push (iOS 16.4+); iCloud/Google Calendar qua file .ics/lịch subscribe; Telegram bot "Owl Post" qua GitHub Actions cron.
- Telegram nhắc theo giờ cố định (trưa, giữa giờ, trước ngủ); cron đọc trạng thái "đã học hôm nay" từ Gist trước khi nhắc (đã học → không nhắc "chưa học").

**Sao lưu / khôi phục dữ liệu**
- Export/import file JSON toàn bộ dữ liệu học (tiến độ, streak, SRS, sổ tay, sổ lỗi, huy chương).
- Bản sao tự động lên secret GitHub Gist; backup không bao giờ chứa API key/token.

**UI**
- Bottom nav 5 mục: Hôm nay / Lộ trình / Luyện tập / Sổ tay / Phòng Cúp; Drawer/Sheet của shadcn.

## 6. Ràng buộc & quyết định kỹ thuật
- React + shadcn/ui, **chỉ front-end**, không backend; dữ liệu cá nhân lưu localStorage.
- **PWA** (vite-plugin-pwa) host **GitHub Pages** (free), dùng trên iPhone qua "Thêm vào MH chính".
- **AI BYOK:** tự nhập API key, lưu localStorage, gọi thẳng từ FE (đã xác nhận, dùng cá nhân); **không commit/deploy kèm key**.
- **Repo public** (GitHub Pages) → không commit API key, PAT, token bot, gist id hay dữ liệu cá nhân; chỉ nằm ở localStorage hoặc GitHub Secrets.
- Ngoài máy chỉ có GitHub: secret Gist (trạng thái + bản sao, ghi bằng PAT chỉ quyền `gist`) và Actions (cron).
- Gemini Live API cho hội thoại giọng nói realtime; Claude = ghép STT + TTS của trình duyệt.
- Telegram nhắc qua GitHub Actions cron (front-end không chạy khi đóng tab), đọc Gist trước khi gửi; iCloud qua .ics.
- Không dùng proxy: nguồn không gọi trực tiếp được từ trình duyệt thì chỉ link ra ngoài.
- TestFlight **không free** (~99 USD/năm), Xcode Apple ID free hết hạn 7 ngày → loại; sau này có thể bọc Capacitor.
- Asset HP: chỉ tự vẽ/AI-gen "lấy cảm hứng"; không dùng logo/nhân vật gốc (repo public).

## 7. Nguồn free uy tín
- **Nền:** British Council LearnEnglish (A1→B2), USA Learns, BBC "English You Need".
- **Phát âm:** Rachel's English, BBC Tim's Pronunciation Workshop, Cambridge/Oxford Learner's Dictionaries, YouGlish.
- **Từ vựng:** Oxford 3000/5000, NGSL + TSL (TOEIC Service List).
- **Ngữ pháp:** British Council Grammar, Perfect English Grammar, BBC Grammar.
- **Nghe:** BBC 6 Minute English, ELLLO, ESL Lab, VOA Learning English, LyricsTraining, TED-Ed.
- **Đọc/tin:** Breaking News English, VOA, BBC News Review, Hacker News API, RSS blog AI chính chủ, Investopedia glossary.
- **Viết:** Cambridge Write & Improve, British Council writing, AI sửa bài.
- **TOEIC:** ETS sample tests + TOEIC L&R Examinee Handbook; IELTS sample (British Council, IDP, Cambridge).

## 8. Quyết định đã chốt & rủi ro còn lại
- **Thời lượng:** đã chốt mốc **450 giờ/năm** (giờ chủ động + phim/nhạc có mục đích tính ×½).
- **Bản quyền HP:** repo public → asset chỉ tự vẽ/AI-gen "lấy cảm hứng", không dùng asset gốc.
- **CORS feed:** gọi trực tiếp HN API, HN Algolia, Google AI Blog RSS; RSS không CORS (VOA, Breaking News English, OpenAI, podcast) chỉ link ra ngoài, không proxy.
- **Nguồn phim/phụ đề song ngữ:** YouTube embed (VOA, BBC LE, TED-Ed) + sub tự làm lúc build (xem mục 5); clip nói tắt qua YouGlish; không dùng phim thương mại.
- **Phạm vi MVP:** đã chốt trong spec `mvp-phases.md` (Đợt 1 / 2 / 3).
- **Rủi ro còn lại — iOS Safari:** mức hỗ trợ Web Speech API nhận giọng nói cần kiểm chứng; fallback link sang Gemini/AI luyện nói free kèm prompt roleplay.
