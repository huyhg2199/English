# Nguồn học tiếng Anh miễn phí: từ mất gốc lên TOEIC 750

> Người học: Huy, mất gốc, học từ 0. Mục tiêu: TOEIC L&R 750 (khoảng B1+/B2).
> Website: chỉ có front-end (React + shadcn/ui), không có backend.
> **Ngày xác minh: 2026-10-30.** Mỗi URL đã được kiểm tra bằng HTTP request, WebFetch hoặc WebSearch.

**Ký hiệu**
- ✅ Đã xác minh: URL sống, nội dung miễn phí.
- ⚠️ Cần lưu ý: chỉ miễn phí một phần, URL hay đổi, hoặc chặn bot nên phải xác minh gián tiếp.
- ❌ Loại: không thực sự miễn phí cho người học cá nhân.

**Ghi chú cho cột "Dùng trong website" (FE = front-end thuần)**
- **Link**: mở tab mới. Mọi nguồn đều dùng được cách này.
- **Embed**: nhúng iframe. Video YouTube luôn nhúng được qua `youtube.com/embed/<id>`.
- **API (CORS OK)**: gọi `fetch` trực tiếp từ trình duyệt. Đã kiểm tra header `Access-Control-Allow-Origin`.
- **RSS (cần proxy)**: feed không có header CORS. Muốn đọc phải qua serverless proxy hoặc dịch vụ rss→json; nếu không thì chỉ link ra ngoài.
- **Dữ liệu tĩnh**: tải về rồi đóng gói thành JSON trong app. Chỉ làm được khi license cho phép.

---

## 1. Phát âm & IPA

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| BBC Learning English: The Sounds of English / Pronunciation | https://www.bbc.co.uk/learningenglish/english/features/pronunciation | Video từng âm IPA và các mẹo phát âm | A1→B2 | Miễn phí | Link. Video nằm trên kênh YouTube @bbclearningenglish nên embed được | ✅ |
| BBC: Tim's Pronunciation Workshop | https://www.bbc.co.uk/learningenglish/english/features/pronunciation/tims-pronunciation-workshop-ep-1 | Phát âm tự nhiên: nối âm, schwa, weak form. Rất có ích cho TOEIC Listening | A2→B2 | Miễn phí | Link theo từng tập (ep-1, ep-2, …). Embed bản YouTube | ✅ |
| Rachel's English | https://rachelsenglish.com/ · https://www.youtube.com/@rachelsenglish | Phát âm giọng Mỹ, khẩu hình, luyện shadowing | A2→C1 | Hơn 1000 video và sound chart miễn phí. **Academy trả phí** | Embed YouTube. Chỉ dùng phần video miễn phí | ⚠️ (chỉ miễn phí một phần) |
| Cambridge Dictionary | https://dictionary.cambridge.org/ (Anh–Việt: https://dictionary.cambridge.org/dictionary/english-vietnamese/) | IPA UK/US kèm audio. Có bản Anh–Việt bán song ngữ (hơn 40.000 mục từ) | Mọi trình độ | Miễn phí | Chỉ link deep-link `/dictionary/english/<word>`. Không có API công khai miễn phí. Site chặn bot (trả 403 với curl) | ✅ (xác minh qua search) |
| Oxford Learner's Dictionaries | https://www.oxfordlearnersdictionaries.com/ | IPA, audio UK/US, đánh dấu trọng âm, nhãn CEFR cho từ | Mọi trình độ | Miễn phí | Chỉ link `/definition/english/<word>` | ✅ |
| YouGlish | https://youglish.com/ | Nghe một từ/cụm từ được nói trong video YouTube thật | A2→C1 | Miễn phí (tài khoản miễn phí bị giới hạn số lượt) | **Có widget JS để embed** (`youglish.com/public/emb/widget.js`, đã kiểm tra trả 200). Đọc kỹ điều khoản API trước khi dùng | ✅ |
| Web Speech API (có sẵn trong trình duyệt) | (API của trình duyệt) | Đọc to từ/câu (TTS) để nghe mẫu | Mọi trình độ | Miễn phí | Chạy hoàn toàn ở FE. Chất lượng giọng tuỳ trình duyệt, chỉ dùng hỗ trợ, không thay audio người thật | n/a |

## 2. Từ vựng

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| Oxford 3000 / Oxford 5000 | https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000 | Danh sách từ cốt lõi, gắn nhãn CEFR A1→C1 | A1→C1 | Miễn phí để học | Link. **Có bản quyền nên không đóng gói dữ liệu vào app.** Chỉ dùng làm thứ tự học và link từng từ | ✅ |
| NGSL (New General Service List) | https://www.newgeneralservicelist.com/ | 2.809 từ phổ biến nhất của tiếng Anh tổng quát | A1→B1 | Miễn phí, **CC BY-SA 4.0** | **Dữ liệu tĩnh: được đóng gói JSON vào app**, cần ghi nguồn và giữ cùng license | ✅ |
| TSL (TOEIC Service List) | https://www.newgeneralservicelist.com/toeic-service-list | 1.250 từ đặc thù TOEIC. Học kèm NGSL thì phủ khoảng 98,5% từ trong đề TOEIC | B1→B2 | Miễn phí, CC BY-SA 4.0 | Dữ liệu tĩnh, nạp vào bộ flashcard SRS tự build | ✅ |
| Anki / AnkiWeb | https://ankiweb.net/ | Flashcard lặp lại ngắt quãng (SRS), nếu muốn dùng app có sẵn | Mọi trình độ | Bản Web/Desktop/Android miễn phí. **App iOS trả phí** | Link. Nên tự build SRS trong web (đã có ý tưởng trong log) | ✅ |

## 3. Ngữ pháp & các thì

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| British Council LearnEnglish: Grammar | https://learnenglish.britishcouncil.org/free-resources/grammar (A1–A2: `/a1-a2`, B1–B2: `/b1-b2`) | Bài giải thích ngắn kèm bài tập tương tác theo cấp CEFR | A1→B2 (có C1) | Miễn phí. Một số tính năng cần đăng ký tài khoản miễn phí. Khoá online/IELTS Coach trả phí | Link theo cấp | ✅ (qua WebFetch; curl bị chặn) |
| Perfect English Grammar | https://www.perfect-english-grammar.com/ | Giải thích các thì rất rõ, nhiều bài tập có đáp án | A2→C1 | Miễn phí (có quảng cáo) | Link | ✅ |
| BBC Learning English: Grammar | https://www.bbc.co.uk/learningenglish/english/grammar | Video và bài ngữ pháp ngắn | A2→B2 | Miễn phí | Link. Video embed qua YouTube | ✅ |

## 4. Nghe

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| ELLLO | https://www.elllo.org/ | Hội thoại ngắn của người nói nhiều giọng khác nhau, có transcript và quiz, chia theo cấp | A1→C1 | Miễn phí | Link theo cấp (`elllo.org/levels/…`) | ✅ |
| VOA Learning English | https://learningenglish.voanews.com/ | Tin đọc chậm, có audio và transcript | A2→B1 | Miễn phí (của chính phủ Mỹ) | **RSS (cần proxy)**, danh sách feed tại https://learningenglish.voanews.com/rssfeeds. Không có CORS | ✅ |
| BBC 6 Minute English | https://www.bbc.co.uk/learningenglish/english/features/6-minute-english | Podcast 6 phút, có transcript và từ vựng | B1→B2 | Miễn phí | Link. Embed bản YouTube. ⚠️ Trang tập mới có URL theo năm (`…/6-minute-english_2026`) | ✅ |
| BBC: English You Need | https://www.bbc.co.uk/learningenglish/english/course/english-you-need | Tình huống công sở và đời sống (gần ngữ cảnh TOEIC) | A2→B1 | Miễn phí | Link / embed YouTube | ✅ |
| ESL Lab (Randall's) | https://www.esl-lab.com/ | Bài nghe theo cấp độ kèm câu hỏi | A2→B2 | Miễn phí (có quảng cáo) | Link | ✅ |
| LyricsTraining | https://lyricstraining.com/ | Nghe nhạc rồi điền lời bài hát | A1→B2 | Miễn phí (có gói Premium bỏ quảng cáo, không bắt buộc) | Link | ✅ |
| TED-Ed | https://ed.ted.com/ · https://www.youtube.com/@TEDEd | Video hoạt hình ngắn, có phụ đề | B1→C1 | Miễn phí | **Embed YouTube** | ✅ |

## 5. Đọc

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| Breaking News English | https://breakingnewsenglish.com/ | Một tin được viết lại ở 7 cấp độ, kèm bài tập | A1→B2 | Miễn phí | **RSS (cần proxy)**: https://feeds.feedburner.com/breakingnewsenglish (không có CORS). Hoặc link ra ngoài | ✅ |
| VOA Learning English | https://learningenglish.voanews.com/ | Bài đọc đơn giản hoá, có audio đọc kèm | A2→B1 | Miễn phí | RSS (cần proxy) | ✅ |
| British Council LearnEnglish: Reading | https://learnenglish.britishcouncil.org/free-resources/reading (`/a1`, `/a2`, `/b1`, `/b2`) | Bài đọc theo cấp, có bài tập | A1→B2 | Miễn phí | Link theo cấp | ✅ |
| Newsela | https://newsela.com/ | Tin được viết ở nhiều mức Lexile | K-12 | **❌ Bán license cho trường/học khu, chỉ có free trial.** Không có gói miễn phí lâu dài cho cá nhân | **Loại.** Dùng Breaking News English thay thế | ❌ |

## 6. Viết

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| Cambridge Write & Improve | https://writeandimprove.com/ | Nộp bài viết, nhận chấm tự động và gợi ý sửa theo CEFR | Mọi trình độ | **Miễn phí**, dùng được không cần đăng ký. Có thêm "+Test Zone" (IELTS/B2 First) | Link (không có API) | ✅ |
| British Council LearnEnglish: Writing | https://learnenglish.britishcouncil.org/free-resources/writing (`/a1`→`/b2`) | Bài viết mẫu theo cấp (email, tin nhắn…), kèm bài tập | A1→B2 | Miễn phí | Link | ✅ |
| AI (Claude/Gemini) | (web app của nhà cung cấp) | Sửa bài, giải thích lỗi bằng tiếng Việt | Mọi trình độ | Có gói miễn phí giới hạn | Gọi API từ FE sẽ **lộ key**, không nên làm. Chỉ nên link ra hoặc copy prompt mẫu | n/a |

## 7. Nói

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| British Council LearnEnglish: Speaking | https://learnenglish.britishcouncil.org/free-resources (mục Speaking) | Video hội thoại theo cấp, có bài tập | A1→B2 | Miễn phí | Link | ✅ |
| Rachel's English (shadowing) | https://www.youtube.com/@rachelsenglish | Nghe rồi nhại theo (shadowing), luyện ngữ điệu | A2→C1 | Video miễn phí | Embed YouTube | ✅ |
| YouGlish (shadowing) | https://youglish.com/ | Nhại theo câu thật trong video | A2→C1 | Miễn phí | Widget embed | ✅ |
| Web Speech API: SpeechRecognition | (API của trình duyệt) | Tự ghi âm rồi so với câu mẫu | Mọi trình độ | Miễn phí | Chạy ở FE. Hỗ trợ tốt trên Chrome/Edge, Firefox chưa hỗ trợ | n/a |

## 8. TOEIC

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| ETS: trang Prepare (chính chủ) | https://www.ets.org/toeic/test-takers/prepare.html | Trang tổng hợp tài liệu ôn chính thức | Mục tiêu 750 | Tài liệu PDF miễn phí. Sách/khoá luyện chính thức trả phí | Link | ✅ |
| ETS: TOEIC L&R Sample Test (PDF) | https://www.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-sample-test.pdf | Đề mẫu chính thức đủ 7 Part | B1→B2 | Miễn phí | Link/mở PDF. Dùng làm khuôn format cho mini test tự build (**không copy nội dung đề**) | ✅ |
| ETS: TOEIC L&R Examinee Handbook (PDF) | https://www.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-test-examinee-handbook.pdf | Cấu trúc đề, cách tính điểm, quy định thi | n/a | Miễn phí | Link | ✅ (URL cũ `/pdfs/toeic/…-examinee-handbook.pdf` trả 404, đã thay bằng URL này) |
| ETS: Sample Questions | https://www.ets.org/toeic/test-takers/sample-questions.html | Câu hỏi mẫu theo từng Part | B1→B2 | Miễn phí | Link | ✅ |
| TSL (xem mục 2) | https://www.newgeneralservicelist.com/toeic-service-list | Từ vựng đặc thù TOEIC | B1→B2 | CC BY-SA 4.0 | Dữ liệu tĩnh | ✅ |

## 9. Tin tức / feed theo sở thích (cổ phiếu, AI, tech)

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| Hacker News API (Firebase) | https://github.com/HackerNews/API · endpoint `https://hacker-news.firebaseio.com/v0/topstories.json`, `/v0/item/<id>.json` | Feed tin tech/AI thật | B2+ (đọc tiêu đề từ B1) | Miễn phí, không cần key | **API (CORS OK)**: đã thấy header `Access-Control-Allow-Origin` trả về | ✅ |
| HN Search API (Algolia) | https://hn.algolia.com/api (ví dụ `https://hn.algolia.com/api/v1/search?query=AI&tags=story`) | Lọc tin HN theo từ khoá (AI, stocks…) | B2+ | Miễn phí, không cần key | **API (CORS OK)**: đã kiểm tra header | ✅ |
| Google AI Blog (RSS) | https://blog.google/technology/ai/rss/ | Tin AI chính chủ của Google | B2+ | Miễn phí | **RSS có CORS**, nhưng vẫn phải tự parse XML bằng `DOMParser` | ✅ |
| OpenAI News (RSS) | https://openai.com/news/rss.xml | Tin AI chính chủ | B2+ | Miễn phí | RSS (cần proxy, không có CORS) | ✅ |
| Investopedia | https://www.investopedia.com/ (từ điển: https://www.investopedia.com/financial-term-dictionary-4769738) | Glossary thuật ngữ tài chính/chứng khoán, đọc kèm khi gặp tin cổ phiếu | B1→C1 | Miễn phí đọc (có quảng cáo) | Chỉ link `investopedia.com/terms/<x>/<term>.asp`. Không có API | ⚠️ (site chặn fetch tự động, xác minh qua search) |
| VOA / Breaking News English | (xem mục 4–5) | Tin đơn giản hoá cho giai đoạn A2–B1, trước khi đọc tin thật | A2→B1 | Miễn phí | RSS (cần proxy) | ✅ |

## 10. Khoá nền tảng tổng hợp

| Nguồn | URL chính thức | Dùng để làm gì | Trình độ | Miễn phí | Dùng trong website | Xác minh |
|---|---|---|---|---|---|---|
| British Council LearnEnglish | https://learnenglish.britishcouncil.org/ (test trình độ miễn phí: `/english-levels/online-english-level-test`) | Xương sống lộ trình A1→B2 cho cả 4 kỹ năng, kèm test xếp lớp | A1→B2 | Phần "Free resources" miễn phí. Khoá online, gia sư, IELTS Coach trả phí | Link | ✅ |
| USA Learns | https://www.usalearns.org/ | Khoá video cho người mới bắt đầu từ 0 (giọng Mỹ) | Pre-A1→A2 | Miễn phí hoàn toàn | Link | ✅ |
| BBC Learning English | https://www.bbc.co.uk/learningenglish/ · https://www.youtube.com/@bbclearningenglish | Khoá học, podcast, tin tức. Có khoá "Towards Advanced" cho giai đoạn sau | A1→C1 | Miễn phí | Link. Video embed qua YouTube | ✅ |
| BBC: Learning English from the News (trước đây là "News Review") | https://www.bbc.co.uk/learningenglish/english/features/learning-english-from-the-news_2026/ | Học từ vựng qua tiêu đề tin thời sự mỗi tuần | B1→B2 | Miễn phí | Link | ⚠️ URL cũ `features/news-review` trả 404, series đã đổi tên. URL mang hậu tố năm (`_2026`) nên có thể đổi sang năm sau; nên link về trang chủ BBC LE làm dự phòng |

---

## Tóm tắt xác minh

- **Loại:** Newsela. Bán license cho trường học, không miễn phí cho người học cá nhân.
- **Cảnh báo:** Rachel's English (Academy trả phí, chỉ dùng video miễn phí). BBC News Review (đã đổi tên và URL theo năm). Investopedia và Cambridge Dictionary chặn bot nên phải xác minh qua search.
- **Gọi trực tiếp được từ React (CORS OK):** Hacker News API, HN Algolia API, Google AI Blog RSS.
- **Cần proxy:** RSS của VOA, Breaking News English và OpenAI.
- **Được đóng gói dữ liệu vào app:** chỉ NGSL và TSL (CC BY-SA 4.0). Oxford 3000/5000 và đề ETS có bản quyền nên chỉ được link.
- **Embed được:** mọi video YouTube (BBC LE, Rachel's English, TED-Ed) và widget YouGlish.
