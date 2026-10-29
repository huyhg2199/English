# Lumos English

Website cá nhân học tiếng Anh từ 0 tới TOEIC 750+. PWA chỉ có front-end (Vite + React + TypeScript + Tailwind + shadcn/ui), host trên GitHub Pages, dùng chính trên iPhone qua "Thêm vào MH chính".

## Chạy local

Yêu cầu Node 22+.

```bash
npm install
npm run dev       # http://localhost:5173/English/
npm run lint
npm test          # Vitest (lớp storage)
npm run build     # ra dist/, có manifest.webmanifest và sw.js
npm run preview   # chạy bản build, có service worker
```

Router dùng hash (`/English/#/notebook`) nên reload hay mở deep link trên Pages không bị 404.

## Deploy GitHub Pages

Workflow `.github/workflows/deploy.yml`:

- Push `develop` (hoặc mở PR): chỉ lint + test + build.
- Push `main`: lint + test + build rồi deploy lên Pages.

Bật Pages một lần: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
App chạy ở `https://<user>.github.io/English/`.

## Cài lên iPhone

1. Mở link Pages bằng **Safari**.
2. Bấm nút Chia sẻ → **Thêm vào MH chính** → Thêm.
3. Mở từ icon "Lumos English": app chạy toàn màn hình. Sau lần mở đầu, app shell vẫn tải được khi không có mạng.

## Dữ liệu

Dữ liệu học lưu ở `localStorage` (key `lumos-english:store`) qua `src/lib/storage`, có `schemaVersion` và migration tuần tự. Dữ liệu hỏng, bị chặn hay do bản app mới hơn ghi sẽ không bị ghi đè.

## Bí mật

Repo public. Không commit API key, PAT, token bot, gist id hay dữ liệu cá nhân. Những thứ này chỉ nằm ở localStorage trên máy hoặc GitHub Secrets.

## Bản quyền theme

Theme "lấy cảm hứng" từ không khí lâu đài phù thuỷ. Icon và giao diện tự vẽ, không dùng logo, font hay nhân vật gốc.
