import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'

import { formatTime, type SubCue } from '@/lib/subs'
import { cn } from '@/lib/utils'

/**
 * Bản transcript cuộn được dưới sub (story 16): câu đang phát được tô và tự cuộn tới (chỉ cuộn trong khung, không
 * cuộn cả trang); chạm câu thì tua video tới câu đó. Câu liên quan bài có dấu ✦ và lý do.
 */
export function TranscriptList({
  cues,
  active,
  showVi,
  reasons,
  onSeek,
}: {
  cues: readonly SubCue[]
  active: number
  showVi: boolean
  reasons: readonly (string | null)[]
  /** null = player chưa / không điều khiển được: không tua được. */
  onSeek: ((index: number) => void) | null
}) {
  const box = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const list = box.current
    const item = active >= 0 ? (list?.children[active] as HTMLElement | undefined) : undefined
    if (!list || !item) return
    const top = item.offsetTop // khung `relative` nên offsetTop tính từ đầu khung
    if (top < list.scrollTop || top + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: Math.max(0, top - list.clientHeight / 3), behavior: 'smooth' })
    }
  }, [active])

  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="text-xs font-semibold text-muted-foreground">Transcript{onSeek ? ' · chạm câu để tua tới' : ''}</h4>
      <ol ref={box} className="relative max-h-64 overflow-y-auto overscroll-contain rounded-lg border">
        {cues.map((c, i) => (
          <li key={i} className="border-b last:border-b-0">
            <button
              type="button"
              disabled={!onSeek}
              onClick={() => onSeek?.(i)}
              aria-current={i === active ? 'true' : undefined}
              className={cn(
                'flex w-full min-w-0 gap-2 px-3 py-2 text-left text-sm outline-none focus-visible:bg-accent disabled:cursor-default',
                i === active ? 'bg-primary/15' : reasons[i] ? 'bg-accent/30' : '',
              )}
            >
              <span className="w-9 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">{formatTime(c.start)}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span lang="en" className="break-words">
                  {c.en}
                  {reasons[i] && <Sparkles className="ml-1 inline size-3.5 text-primary" aria-label={reasons[i]!} />}
                </span>
                {showVi && <span className="text-xs break-words text-muted-foreground">{c.vi}</span>}
                {reasons[i] && i === active && <span className="text-xs text-primary">{reasons[i]}</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
