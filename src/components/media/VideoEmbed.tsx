import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Play, WifiOff } from 'lucide-react'

import { useOnline } from '@/app/use-online'
import { embedUrl, thumbnailUrl, watchUrl, type LessonVideo } from '@/data/videos'

/**
 * Player nhẹ (story 15): ban đầu chỉ có thumbnail + nút phát; bấm mới tạo iframe youtube-nocookie và phát
 * ngay trong trang (không rời PWA). Offline thì không tạo iframe, chỉ báo cần mạng (iframe đã mở thì giữ nguyên). Luôn có link mở trên YouTube.
 */
export function VideoEmbed({ video }: { video: LessonVideo }) {
  const online = useOnline()
  const [playing, setPlaying] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // Nút phát biến mất khi bấm: chuyển focus sang iframe để bàn phím / trình đọc màn hình không bị mất chỗ.
  useEffect(() => {
    if (playing) iframeRef.current?.focus()
  }, [playing])
  return (
    <figure className="flex min-w-0 flex-col gap-1.5">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        {playing ? (
          <iframe
            ref={iframeRef}
            src={embedUrl(video)}
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
      <figcaption className="flex flex-col gap-0.5 text-xs">
        <span lang="en" className="line-clamp-2 font-medium break-words text-foreground">
          {video.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
          {video.channel}
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
export function VideoList({ videos }: { videos: readonly LessonVideo[] }) {
  if (videos.length === 0) return null
  return (
    <div className="flex flex-col gap-4">
      {videos.map((v) => (
        <VideoEmbed key={v.id} video={v} />
      ))}
    </div>
  )
}
