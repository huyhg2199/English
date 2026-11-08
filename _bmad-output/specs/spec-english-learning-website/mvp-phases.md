# Phân đợt triển khai

Mọi CAP đều quan trọng ngang nhau về giá trị. Thứ tự dưới đây chỉ đi theo lịch của lộ trình: phải có đủ những gì cần cho chặng hiện tại trước khi chặng đó bắt đầu. Huy giao Claude đánh giá và chốt thứ tự này.

| Đợt | Hạn | CAP | Lý do |
|---|---|---|---|
| **1: khung chặng 1** | Càng sớm càng tốt (chặng 1 bắt đầu 11/2026) | CAP-1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 18, 19, 20, 21, 22 · CAP-16 dạng link ngoài | Chặng 1 cần phát âm, từ vựng, các thì và cả vòng chống bỏ cuộc: buổi học, ngày lười, gia hạn, quay lại, sổ lỗi, nhắc nhở, backup. Phần 10' giải trí tạm link ra LyricsTraining/YouGlish/VOA như trong lộ trình |
| **1b: Sân ga 9¾ + máy tính** | Càng sớm càng tốt, trước khi học tiếp T1 | CAP-23 · sửa CAP-1 (dải Sân ga), 2, 3, 5, 6, 9, 10, 19, 20 (huy chương, điểm Nhà, hiệu ứng), 22 (dữ liệu Sân ga) · bố cục máy tính (Constraints) | T1 dùng kiến thức chưa dạy (IPA, trọng âm, từ loại, mạo từ, đại từ…), nên cần khoá nền trước. Huy học thêm trên laptop, nên cần thanh điều hướng trên cùng, cột rộng hơn, trang hai cột và phím tắt |
| **2: chặng 2** | Trước 03/2027 | CAP-8, 12 (sub song ngữ + chú thích + highlight + ẩn sub điền từ), 14, 15, 17 · CAP-21 web push | Chặng 2 bắt đầu vào Part TOEIC và từ vựng công sở. Video song ngữ thay cho phần link tạm |
| **3: mở rộng** | Trước 07/2027 | CAP-13, CAP-12 (sub thang trượt), CAP-16 (realtime trong app) | Chặng 3 cần luyện nói roleplay. Thang trượt chỉ có ích khi đã đủ dữ liệu điền từ |

Trong Đợt 1, CAP-20 làm bản tối thiểu: bản đồ, streak tính thành điểm Nhà, Phòng Cúp có huy chương. Các hiệu ứng nặng làm dần sau. Huy chương Hagrid/Sirius để sang Đợt 3, làm cùng CAP-16 realtime.

Trong Đợt 1, CAP-21 chưa có web push. Đợt 1 nhắc bằng Telegram, lịch .ics và thông báo trong app. Web push làm ở Đợt 2, do GitHub Actions gửi (xem `stack.md`).

Thứ tự story Đợt 1b: 17 → 18 → 19 → 20 (Huy bắt đầu Soát vé + hàng A) → 21 → 22 → 23 → 24 → 25 → 26 → 27 → 28. Story 29 (khung máy tính) làm song song bất cứ lúc nào. Story 30 làm sau 21 và 29. Story 31 làm sau 30.

Các story Đợt 1 và 1b nằm ở `stories.yaml`.
