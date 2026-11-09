import { useEffect } from 'react'

import { LEVEL_LABELS, type OwlLetter } from '@/lib/trophies'

import { MedalIcon } from './MedalIcon'

/** Cú tự vẽ (SVG) cắp lá thư. */
function OwlSvg() {
  return (
    <svg viewBox="0 0 80 64" className="h-16 w-20" aria-hidden="true">
      <g className="owl-wing">
        <path d="M18 30 Q2 18 4 4 Q16 14 26 24z" fill="#7a5a3a" />
        <path d="M62 30 Q78 18 76 4 Q64 14 54 24z" fill="#7a5a3a" />
      </g>
      <ellipse cx="40" cy="32" rx="16" ry="18" fill="#9a7450" />
      <ellipse cx="40" cy="37" rx="10" ry="11" fill="#d9c09a" />
      <path d="M27 17 l4 -7 l4 6z M53 17 l-4 -7 l-4 6z" fill="#7a5a3a" />
      <circle cx="34" cy="25" r="5" fill="#efe6d2" />
      <circle cx="46" cy="25" r="5" fill="#efe6d2" />
      <circle cx="34" cy="25" r="2.4" fill="#14120f" />
      <circle cx="46" cy="25" r="2.4" fill="#14120f" />
      <path d="M38 29 l2 4 l2 -4z" fill="#e0a33a" />
      <g className="owl-letter">
        <rect x="31" y="48" width="18" height="12" rx="1.5" fill="#efe6d2" />
        <path d="M31 48 l9 7 l9 -7" fill="none" stroke="#a89c86" strokeWidth="1.2" />
        <circle cx="40" cy="55" r="1.8" fill="#c4513f" />
      </g>
    </svg>
  )
}

/** "Huy chương Hermione đồng"; huy chương một lần không cấp (`level` null): "Huy chương Lên tàu Năm 1". */
const letterText = (l: OwlLetter) => (l.level ? `Huy chương ${l.name} ${LEVEL_LABELS[l.level]}` : `Huy chương ${l.name}`)

/**
 * Lớp thông báo "cú đưa thư": cú bay tới thả thư (≤ 2 giây) rồi hiện thẻ huy chương mới; chạm hoặc Escape để đóng.
 * Lớp phủ cả màn hình nhưng trong suốt và `pointer-events-none` (chỉ thẻ nhận chạm) để cú bay không bị cắt.
 * `prefers-reduced-motion` thì ẩn cú, chỉ hiện thẻ (CSS trong index.css). Không âm thanh.
 * Vùng `role="status"` luôn có mặt để trình đọc màn hình đọc thư mới. Thư là cấp huy chương (`LevelUp`) hoặc huy chương
 * một lần (`level` null, vd "Lên tàu Năm 1" ở màn Qua bức tường): hiện huy chương vàng.
 */
export function OwlPost({ letters, onClose }: { letters: readonly OwlLetter[]; onClose: () => void }) {
  const open = letters.length > 0
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const names = letters.map(letterText).join(', ')
  return (
    <>
      <div role="status" className="sr-only">
        {open ? `Cú đưa thư tới: ${names}.` : ''}
      </div>
      {open && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end overflow-x-clip px-4"
          style={{ paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom) + 0.75rem)' }}
        >
          <div className="mx-auto flex w-full max-w-md flex-col items-center">
            <div className="owl-flight h-16" aria-hidden="true">
              <OwlSvg />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="owl-card lumos pointer-events-auto flex w-full flex-col gap-2 rounded-xl border border-primary bg-card p-4 text-left shadow-lg"
              aria-label={`${names}. Chạm để đóng thư.`}
            >
              <span className="text-xs text-muted-foreground">Cú đưa thư tới!</span>
              {letters.map((l) => (
                <span key={l.key} className="flex items-center gap-3">
                  <MedalIcon level={l.level ?? 'gold'} className="size-10" />
                  <span className="font-semibold">{letterText(l)}</span>
                </span>
              ))}
              <span className="text-xs text-muted-foreground">Chạm để đóng · xem ở Phòng Cúp</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
