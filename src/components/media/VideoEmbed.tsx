import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Captions, ExternalLink, Play, WifiOff } from 'lucide-react'

import { useOnline } from '@/app/use-online'
import { hasSubs } from '@/data/subs'
import { CC_BY_URL, embedUrl, thumbnailUrl, watchUrl, type PlayableVideo } from '@/data/videos'

/** Chunk phụ đề không tải được (offline, hash cũ sau khi deploy): video vẫn xem bình thường. */
function SubsUnavailable() {
  return (
    <p role="status" className="text-xs text-muted-foreground">
      Chưa tải được phụ đề. Video vẫn xem bình thường.
    </p>
  )
}

/** Phần phụ đề (story 16) là chunk riêng, chỉ tải khi video có sub được bấm phát. Lỗi tải thì không làm sập app. */
const SubtitledVideo = lazy(() => import('./SubtitledVideo').catch(() => ({ default: SubsUnavailable })))

/**
 * Player nhẹ (story 15): ban đầu chỉ có thumbnail + nút phát; bấm mới tạo iframe youtube-nocookie và phát
 * ngay trong trang (không rời PWA). Offline thì không tạo iframe, chỉ báo cần mạng (iframe đã mở thì giữ nguyên). Luôn có link mở trên YouTube.
 * Video có file sub (story 16, VOA hoặc CC BY): iframe bật IFrame API và bên dưới có phụ đề Anh–Việt, transcript,
 * điền từ. Video không có sub (kể cả video CC BY chưa dịch) giữ nguyên như story 15. Video CC BY ghi giấy phép ở chú thích.
 */
export function VideoEmbed({ video }: { video: PlayableVideo }) {
  const online = useOnline()
  const [playing, setPlaying] = useState(false)
  const subtitled = hasSubs(video.id)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // "Thử lại" kết nối phụ đề: dựng iframe mới (key mới) để gắn player mới, không gắn lần hai vào iframe cũ.
  const [iframeKey, setIframeKey] = useState(0)
  // Nút phát biến mất khi bấm: chuyển focus sang iframe để bàn phím / trình đọc màn hình không bị mất chỗ.
  useEffect(() => {
    if (playing) iframeRef.current?.focus()
  }, [playing])
  return (
    <figure className="flex min-w-0 flex-col gap-1.5">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        {playing ? (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={embedUrl(video, subtitled ? { jsapiOrigin: window.location.origin } : {})}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        ) : online ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Phát video: ${video.title}`}
            className="group absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <img
              src={thumbnailUrl(video)}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_16px_var(--candle-glow)] transition-transform group-hover:scale-110">
              <Play className="size-6 translate-x-0.5 fill-current" aria-hidden="true" />
            </span>
          </button>
        ) : (
          <p
            role="status"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center text-sm text-muted-foreground"
          >
            <WifiOff className="size-6" aria-hidden="true" />
            Cần mạng để xem video
          </p>
        )}
      </div>
      {playing && (
        <p className="text-xs text-muted-foreground">Nếu video chưa chạy, chạm nút phát trên video.</p>
      )}
      {playing && subtitled && (
        <Suspense fallback={<p className="text-xs text-muted-foreground">Đang tải phụ đề…</p>}>
          <SubtitledVideo key={iframeKey} video={video} iframe={iframeRef} onRetryPlayer={() => setIframeKey((k) => k + 1)} />
        </Suspense>
      )}
      <figcaption className="flex flex-col gap-0.5 text-xs">
        <span lang="en" className="line-clamp-2 font-medium break-words text-foreground">
          {video.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {video.channel}
            {video.license === 'cc-by' && (
              <a
                href={CC_BY_URL}
                target="_blank"
                rel="noreferrer license"
                title="Giấy phép Creative Commons Ghi công 3.0"
                className="rounded border px-1 text-[10px] leading-4 font-medium underline-offset-4 hover:underline"
              >
                CC BY
              </a>
            )}
          </span>
          {subtitled && (
            <span className="inline-flex items-center gap-1 text-primary">
              <Captions className="size-3.5" aria-hidden="true" />
              Phụ đề Anh–Việt
            </span>
          )}
          <a
            href={watchUrl(video)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            Mở trên YouTube
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </span>
      </figcaption>
    </figure>
  )
}

/** Các video của một đoạn (không có thì không hiện gì). */
export function VideoList({ videos }: { videos: readonly PlayableVideo[] }) {
  if (videos.length === 0) return null
  return (
    <div className="flex flex-col gap-4">
      {videos.map((v) => (
        <VideoEmbed key={v.id} video={v} />
      ))}
    </div>
  )
}
