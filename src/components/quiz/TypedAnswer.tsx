import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { hasVietnameseMarks, VIETNAMESE_IME_WARNING } from '@/lib/quiz/typed'
import { cn } from '@/lib/utils'

/** Gõ khác cách viết chuẩn (hoa thường, nháy, dấu câu, khoảng trắng) dù đã được chấm đúng. */
function differsFrom(answer: string, typed: string): boolean {
  return typed.trim().replace(/\s+/g, ' ') !== answer
}

/**
 * Ô gõ dùng chung cho câu quiz `type` / `transform` (story 35) và câu luyện `type` của Sân ga / phần luyện thì. Form gồm
 * một `<input>` và nút "Kiểm tra" (không bấm được khi chữ trim rỗng); Enter trong ô là nộp (form submit, phím tắt bỏ qua
 * ô nhập). Chữ có dấu tiếng Việt thì không nộp, chỉ nhắc tắt bộ gõ. Đã nộp (`submitted` khác null) thì thay ô bằng dòng
 * chữ đã gõ, chỉ đọc: ô biến mất nên Enter tiếp theo đi tới phím tắt "Câu tiếp" của nơi gọi. Đúng mà gõ khác cách viết
 * chuẩn (`answer`) thì hiện thêm "Viết chuẩn: …". Cỡ chữ 16px để iOS không phóng to; tắt tự viết hoa / sửa chữ / soát
 * chính tả.
 */
export function TypedAnswer({
  submitted,
  onSubmit,
  label = 'Câu trả lời của bạn',
  focus = false,
  tone = 'neutral',
  answer,
}: {
  /** Chữ đã nộp (giữ nguyên, chưa chuẩn hoá); null khi đang gõ. */
  submitted: string | null
  onSubmit: (text: string) => void
  /** `aria-label` của ô gõ. */
  label?: string
  /** Đưa con trỏ vào ô khi ô hiện (và khi `focus` chuyển sang true), để làm bằng bàn phím. */
  focus?: boolean
  /** Màu dòng chữ đã nộp: `correct` viền sáng, `wrong` viền nét đứt màu trung tính. */
  tone?: 'neutral' | 'correct' | 'wrong'
  /** Cách viết chuẩn: chấm đúng mà chữ gõ khác thì hiện "Viết chuẩn: …". */
  answer?: string
}) {
  const [text, setText] = useState('')
  const [imeWarning, setImeWarning] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const editing = submitted === null

  useEffect(() => {
    if (focus && editing) input.current?.focus({ preventScroll: true })
  }, [focus, editing])

  if (!editing) {
    return (
      <div className="flex flex-col gap-1">
        <p
          className={cn(
            'min-h-10 rounded-md border px-3 py-2 text-base break-words',
            tone === 'correct' && 'border-primary bg-accent/50',
            tone === 'wrong' && 'border-dashed border-muted-foreground bg-muted/40',
          )}
          aria-label="Bạn đã gõ"
          lang="en"
        >
          {submitted || '(bỏ trống)'}
        </p>
        {tone === 'correct' && answer !== undefined && differsFrom(answer, submitted) && (
          <p className="text-sm break-words text-muted-foreground">
            Viết chuẩn: <span lang="en">{answer}</span>
          </p>
        )}
      </div>
    )
  }

  const empty = text.trim() === ''
  return (
    <div className="flex flex-col gap-1">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (empty) return
          if (hasVietnameseMarks(text)) {
            setImeWarning(true)
            return
          }
          onSubmit(text)
        }}
      >
        <input
          ref={input}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setImeWarning(false)
          }}
          aria-label={label}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          lang="en"
          maxLength={200}
          className="h-10 min-w-0 flex-1 basis-40 rounded-md border bg-background px-3 text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <Button type="submit" disabled={empty}>
          <Check aria-hidden="true" />
          Kiểm tra
        </Button>
      </form>
      {imeWarning && (
        <p role="alert" className="text-sm break-words text-muted-foreground">
          {VIETNAMESE_IME_WARNING}
        </p>
      )}
    </div>
  )
}
