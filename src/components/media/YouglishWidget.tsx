import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Loader2, PlayCircle, RotateCcw } from 'lucide-react'

import { useOnline } from '@/app/use-online'
import { Button } from '@/components/ui/button'
import {
  loadYouglish,
  youglishFetchArgs,
  youglishPageUrl,
  youglishWidgetOptions,
  type YouglishWidget as Widget,
} from '@/lib/youglish'

type Status = 'idle' | 'loading' | 'ready' | 'error'

/** Đếm để mỗi widget có id riêng trong trang. */
let widgetSeq = 0

function FallbackLink({ phrase, url, short = false }: { phrase: string; url: string; short?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 self-start text-xs text-primary underline-offset-4 hover:underline"
    >
      {short ? 'Mở YouGlish' : `Nghe “${phrase}” trên YouGlish`}
      <ExternalLink className="size-3" aria-hidden="true" />
    </a>
  )
}

/**
 * Nghe một cụm trong video thật (story 15): chỉ khi bấm "Nghe trong video thật" mới tải script YouGlish và
 * dựng widget ngay trong bài. Script lỗi, quá giờ, không có kết quả hoặc offline thì quay về link YouGlish
 * (online thì có thêm nút "Thử lại").
 */
export function YouglishWidget({ phrase, fallbackUrl }: { phrase: string; fallbackUrl?: string }) {
  const online = useOnline()
  // Mỗi lần bấm (kể cả "Thử lại") tăng `run` để dựng lại widget từ đầu; 0 = chưa bấm.
  const [run, setRun] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const url = fallbackUrl ?? youglishPageUrl(phrase)

  useEffect(() => {
    if (run === 0) return
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let widget: Widget | null = null
    const teardown = () => {
      try {
        widget?.close?.()
      } catch {
        // Widget đã tự đóng: bỏ qua.
      }
      widget = null
      host.replaceChildren()
    }
    const fail = (msg: string) => {
      if (cancelled) return
      teardown()
      setMessage(msg)
      setStatus('error')
    }
    loadYouglish().then(
      (YG) => {
        if (cancelled) return
        // Widget tìm phần tử theo id rồi thay bằng outerHTML, nên tạo một div con ngoài tầm quản lý của React.
        const target = document.createElement('div')
        target.id = `yg-widget-${++widgetSeq}`
        host.replaceChildren(target)
        // Đặt "ready" trước khi dựng/fetch: lỗi (kể cả đồng bộ) gọi fail() sau đó và không bị ghi đè.
        setStatus('ready')
        try {
          widget = new YG.Widget(
            target.id,
            youglishWidgetOptions({
              onFetchDone: (e) => {
                if (e.totalResult === 0) fail('YouGlish không tìm thấy video cho cụm này.')
              },
              onError: () => fail('Widget YouGlish gặp lỗi.'),
            }),
          )
          widget.fetch(...youglishFetchArgs(phrase))
        } catch {
          fail('Không dựng được widget YouGlish.')
        }
      },
      () => fail('Không tải được YouGlish.'),
    )
    return () => {
      cancelled = true
      teardown()
    }
  }, [run, phrase])

  const start = () => {
    setMessage(null)
    setStatus('loading')
    setRun((n) => n + 1)
  }
  const showWidget = status === 'loading' || status === 'ready'

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {status === 'idle' &&
        (online ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Button type="button" variant="outline" size="sm" onClick={start}>
              <PlayCircle aria-hidden="true" />
              Nghe trong video thật
            </Button>
            <FallbackLink phrase={phrase} url={url} short />
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">Cần mạng để nghe “{phrase}” trong video thật.</p>
            <FallbackLink phrase={phrase} url={url} />
          </>
        ))}
      {status === 'loading' && (
        <p role="status" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Đang tải video từ YouGlish…
        </p>
      )}
      <div
        ref={hostRef}
        hidden={!showWidget}
        className="w-full max-w-full overflow-hidden rounded-lg border bg-card p-1 text-card-foreground"
      />
      {status === 'error' && (
        <>
          {message && (
            <p role="status" className="text-xs text-muted-foreground">
              {message}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {online && (
              <Button type="button" variant="outline" size="sm" onClick={start}>
                <RotateCcw aria-hidden="true" />
                Thử lại
              </Button>
            )}
            <FallbackLink phrase={phrase} url={url} />
          </div>
        </>
      )}
    </div>
  )
}
