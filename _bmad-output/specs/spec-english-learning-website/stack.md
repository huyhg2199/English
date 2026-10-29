# Stack & quyết định kỹ thuật

| Mảng | Quyết định | Lý do / ghi chú |
|---|---|---|
| UI | React + shadcn/ui; Drawer/Sheet cho điều hướng phụ | Huy chọn |
| Animation | Framer Motion | Hiệu ứng Lumos và cú đưa thư (CAP-20) |
| Kiến trúc | Chỉ front-end, không backend | Dùng cá nhân, chi phí $0 |
| Lưu trữ | localStorage: tiến độ, SRS, sổ tay, sổ lỗi, API key | Không có server |
| Đóng gói | PWA (vite-plugin-pwa) | Cài lên iPhone qua "Thêm vào MH chính" |
| Hosting | GitHub Pages, repo public | Miễn phí. Vì repo public nên mọi bí mật để ở localStorage hoặc GitHub Secrets, asset HP chỉ dùng loại "lấy cảm hứng" |
| AI | BYOK: key nhập trong app, lưu localStorage, không commit/deploy. Gọi thẳng từ FE | Chỉ dùng cá nhân, Huy đã xác nhận |
| Hội thoại giọng nói realtime | Gemini Live API | CAP-16, làm ở Đợt 3 |
| Luyện nói khi không có giọng nói trong app | Link sang Gemini hoặc AI luyện nói miễn phí khác, kèm prompt roleplay đã soạn sẵn | Fallback cho iOS Safari, và là dạng dùng trong Đợt 1 |
| Hội thoại với Claude | STT trình duyệt → Claude → `speechSynthesis` | Ghép thủ công |
| TTS / STT | Web Speech API | CAP-10. STT chạy tốt trên Chrome/Edge, Firefox chưa hỗ trợ. **Rủi ro:** iOS Safari cần kiểm chứng; nếu không chạy thì app ẩn phần so khớp giọng nói và vẫn giữ nút nghe |
| Push | Browser Notification. Web push (Đợt 2) do cron GitHub Actions gửi: VAPID private key để trong Secrets, push subscription lưu trên Gist | Web push trên iOS cần bản 16.4+ và app phải được cài lên MH chính |
| Lịch | File .ics hoặc lịch subscribe cho iCloud/Google | CAP-21 |
| Trạng thái + bản sao tự động | Secret GitHub Gist, ghi bằng PAT (BYOK, chỉ cấp quyền `gist`, lưu localStorage). App ghi trạng thái "đã học hôm nay" sau mỗi buổi và đẩy snapshot dữ liệu lên | CAP-21, CAP-22. Không bao giờ ghi API key hay PAT lên Gist |
| Backup thủ công | Export/import file JSON | CAP-22 |
| Telegram "Owl Post" | Bot chạy bằng cron của GitHub Actions vào các khung giờ cố định (trưa, giữa giờ, trước ngủ). Trước khi gửi, cron đọc Gist: đã học thì bỏ qua hoặc gửi lời khen, chưa học thì nhắc | FE không chạy được khi tab đóng. Token bot và gist id để trong GitHub Secrets |
| Feed tin | Gọi trực tiếp: HN API, HN Algolia, Google AI Blog RSS (parse bằng `DOMParser`) | Không dùng proxy. VOA, BNE, OpenAI và podcast chỉ link ra ngoài |
| Video | Embed YouTube bằng IFrame Player API, widget YouGlish (cho clip nói tắt) | Theo `nguon-hoc-mien-phi.md` |
| Phụ đề | Claude tự làm sub lúc build, chạy bằng script ngoài app: lấy sub Anh có timestamp (caption YouTube hoặc transcript VOA) → AI dịch sang Việt và chú thích idiom/nói tắt/nghĩa ngữ cảnh → lưu JSON tĩnh theo từng video. App overlay sub theo `getCurrentTime()` của player | CAP-12, CAP-14 |
| Dữ liệu từ vựng | Đóng gói NGSL + TSL thành JSON tĩnh, ghi nguồn CC BY-SA 4.0. IPA, trọng âm, nghĩa Việt và câu ví dụ do AI sinh lúc build bằng script ngoài app | Oxford 3000 chỉ dùng làm thứ tự học và link |
| AI giải thích lỗi | Gemini (gói free), BYOK | CAP-19. Dùng lại key này cho Gemini Live ở Đợt 3 |

## Đã loại

- **TestFlight:** tốn ~99 USD/năm.
- **Cài qua Xcode bằng Apple ID free:** app hết hạn sau 7 ngày.
- **Hướng sau này:** bọc bằng Capacitor nếu cần app native.
