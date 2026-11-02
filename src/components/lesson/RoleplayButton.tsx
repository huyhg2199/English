import { useId, useState } from 'react'
import { Eye, EyeOff, ExternalLink, MessagesSquare } from 'lucide-react'

import { useSpells } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { buildRoleplayPrompt, copyText, GEMINI_URL, type RoleplayLesson } from '@/lib/roleplay'

type Status = 'idle' | 'copied' | 'manual'

/**
 * Nút "Luyện nói với AI" (story 10): dựng prompt roleplay theo tình huống của bài, các thần chú đã mở và thì của
 * chính bài; chép vào clipboard trước, rồi mở Gemini ở tab mới (cùng trong cú bấm để iOS không chặn). Không gọi API.
 * Không chép được thì tự mở ô prompt để chép tay; luôn có link Gemini và nút "Xem prompt".
 */
export function RoleplayButton({ lesson }: { lesson: RoleplayLesson & { roleplay: { vi: string } } }) {
  const spells = useSpells()
  const [status, setStatus] = useState<Status>('idle')
  const [showPrompt, setShowPrompt] = useState(false)
  const textareaId = useId()
  const prompt = buildRoleplayPrompt(lesson, spells)

  const start = () => {
    // writeText được gọi ngay (đồng bộ) trong cú bấm, trước khi mở tab.
    const copying = copyText(prompt)
    try {
      window.open(GEMINI_URL, '_blank', 'noopener,noreferrer')
    } catch {
      // Bị chặn popup: vẫn còn link Gemini bên dưới.
    }
    void copying.then(({ copied }) => {
      setStatus(copied ? 'copied' : 'manual')
      if (!copied) setShowPrompt(true)
    })
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex items-start gap-2">
        <MessagesSquare className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="font-semibold">Luyện nói với AI</h2>
          <p className="text-sm text-muted-foreground">
            Tình huống: {lesson.roleplay.vi}. App chép sẵn prompt (chỉ dùng các thì bạn đã mở bằng thần chú và thì của
            bài này) và mở Gemini. Dán prompt vào, bật mic của Gemini để nói, AI sửa lỗi bằng tiếng Việt sau mỗi lượt.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={start}>
          <MessagesSquare aria-hidden="true" />
          Luyện nói với AI
        </Button>
        <Button type="button" variant="ghost" size="sm" aria-expanded={showPrompt} onClick={() => setShowPrompt((v) => !v)}>
          {showPrompt ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {showPrompt ? 'Ẩn prompt' : 'Xem prompt'}
        </Button>
        <a
          href={GEMINI_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
        >
          Mở Gemini
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
      {status !== 'idle' && (
        <p role="status" className="text-xs text-muted-foreground">
          {status === 'copied'
            ? 'Đã chép prompt. Sang tab Gemini và dán vào ô chat.'
            : 'Trình duyệt không cho chép tự động. Chọn hết chữ trong ô dưới, chép rồi dán vào Gemini.'}
        </p>
      )}
      {showPrompt && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={textareaId} className="text-xs text-muted-foreground">
            Prompt (tiếng Anh) để dán vào Gemini
          </label>
          <textarea
            id={textareaId}
            readOnly
            value={prompt}
            rows={8}
            lang="en"
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-md border bg-background p-2 font-mono text-xs"
          />
        </div>
      )}
    </div>
  )
}
