import { Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { canSpeak, speak } from '@/lib/speech'

/** Nút nghe (TTS en-US). Trình duyệt không đọc được thì không hiện. */
export function ListenButton({
  text,
  label,
  size = 'icon',
  rate,
  disabled = false,
  hotkey,
}: {
  text: string
  label: string
  size?: 'icon' | 'sm'
  rate?: number
  /** Tắt tạm (vd khi micro đang nghe, để micro không thu lại giọng máy). */
  disabled?: boolean
  /** Phím tắt máy tính (story 31, vd "L"): thêm `aria-keyshortcuts` và nhắc trong `title`. */
  hotkey?: string
}) {
  if (!canSpeak()) return null
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={(e) => {
        e.stopPropagation()
        speak(text, rate === undefined ? {} : { rate })
      }}
      aria-label={label}
      aria-keyshortcuts={hotkey}
      title={hotkey ? `${label} (phím ${hotkey})` : label}
      disabled={disabled}
      className="shrink-0"
    >
      <Volume2 aria-hidden="true" />
    </Button>
  )
}
