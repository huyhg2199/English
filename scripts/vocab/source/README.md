# Nguồn danh sách từ: NGSL 1.2 và TSL 1.2

| File | Danh sách | Phiên bản | Tải từ |
|---|---|---|---|
| `NGSL_12_stats.csv` | New General Service List (2809 từ, cột `Lemma,SFI Rank,...`) | 1.2 | https://www.newgeneralservicelist.com/s/NGSL_12_stats.csv |
| `TSL_12_stats.csv` | TOEIC Service List (1250 từ, cột `Word,TSL Rank,...`) | 1.2 | https://www.newgeneralservicelist.com/s/TSL_12_stats.csv |

- **Tác giả:** Browne, C., Culligan, B. & Phillips, J. — https://www.newgeneralservicelist.com
- **Giấy phép:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0), https://creativecommons.org/licenses/by-sa/4.0/
- Tải ngày 2026-11-01, giữ nguyên byte gốc (`.gitattributes` tắt chuẩn hoá xuống dòng).
  SHA-256:
  - `NGSL_12_stats.csv`: `2098bab8955a120a9766c6282a51d7d578c6cb0a7d946600d2ffb73ba25a0b44`
  - `TSL_12_stats.csv`: `2259df25a1077b04067ef0c0e9e4c98b46c91e4d539741dfaceba88651ff486d`

## Lưu ý khi đọc

- TSL 1.2 xuống dòng CRLF và có byte Latin-1 (vd `résumé`, `café`); `lib.mjs` tự giải mã.
- NGSL ghi `true`/`false` thành `TRUE`/`FALSE` (lỗi Excel); build đổi lại thành chữ thường.
- TSL có cả `resume` (động từ) và `résumé` (CV), nên id giữ dấu: `tsl-resume`, `tsl-résumé`.

## Dữ liệu sinh ra

`src/data/vocab/words.json` là tác phẩm phái sinh của hai danh sách trên (thêm IPA, âm tiết, nghĩa Việt, câu ví dụ do AI sinh trong `scripts/vocab/ai/`), phát hành theo cùng giấy phép CC BY-SA 4.0.
Oxford 3000/5000 không được đóng gói; app chỉ link tới từ điển ngoài (Cambridge).
