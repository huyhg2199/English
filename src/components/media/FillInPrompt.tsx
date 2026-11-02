import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, Play, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { checkFill, tokenize, type SubCue } from '@/lib/subs'
import { cn } from '@/lib/utils'

/** Sau khi chấm, tự phát tiếp sau chừng này (ms); bấm "Phát tiếp" để đi ngay. */
export const AUTO_CONTINUE_MS = 2500

const inputClass =
  'h-10 w-28 min-w-0 rounded-md border bg-background px-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

/**
 * Ô điền từ khi video dừng ở cuối một câu có từ ẩn (story 16). Không phân biệt hoa thường, dấu câu.
 * "Bỏ qua" tính là sai. Chấm xong hiện đúng / sai (kèm đáp án) rồi phát tiếp.
 */
export function FillInPrompt({
  cue,
  blanks,
  onAnswer,
  onContinue,
}: {
  cue: SubCue
  blanks: readonly number[]
  /** Gọi đúng một lần: câu đúng khi mọi ô đều đúng. */
  onAnswer: (correct: boolean) => void
  onContinue: () => void
}) {
  const tokens = tokenize(cue.en)
  const expected = blanks.map((i) => tokens[i]?.text ?? '')
  const [values, setValues] = useState<string[]>(() => blanks.map(() => ''))
  const [result, setResult] = useState<boolean[] | null>(null)
  const firstInput = useRef<HTMLInputElement>(null)
  const continueRef = useRef(onContinue)
  useEffect(() => {
    continueRef.current = onContinue
  }, [onContinue])

  useEffect(() => {
    firstInput.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!result) return
    const timer = setTimeout(() => continueRef.current(), AUTO_CONTINUE_MS)
    return () => clearTimeout(timer)
  }, [result])

  function finish(skipped: boolean) {
    if (result) return
    const r = expected.map((e, i) => !skipped && checkFill(e, values[i] ?? ''))
    setResult(r)
    onAnswer(r.every(Boolean))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    finish(false)
  }

  const allCorrect = result?.every(Boolean) ?? false
  return (
    <form
      onSubmit={submit}
      aria-label="Điền từ còn thiếu"
      className="flex flex-col gap-3 rounded-lg border border-primary/60 bg-accent/30 p-3 text-sm"
    >
      <p className="font-medium">Điền từ còn thiếu trong câu vừa nghe:</p>
      <p lang="en" className="text-base leading-loose break-words">
        {tokens.map((t, i) => {
          const k = blanks.indexOf(i)
          if (k < 0) return <span key={i}>{t.text}</span>
          if (result) {
            return (
              <span
                key={i}
                className={cn('mx-0.5 rounded px-1 font-semibold', result[k] ? 'bg-primary/20 text-primary' : 'bg-destructive/15 text-destructive')}
              >
                {t.text}
              </span>
            )
          }
          return (
            <input
              key={i}
              ref={k === 0 ? firstInput : undefined}
              type="text"
              lang="en"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label={`Từ thiếu thứ ${k + 1}`}
              value={values[k]}
              onChange={(e) => setValues((v) => v.map((x, j) => (j === k ? e.target.value : x)))}
              className={cn(inputClass, 'mx-0.5 inline-block align-middle')}
            />
          )
        })}
      </p>
      {result ? (
        <div className="flex flex-col gap-2">
          <p role="status" className={cn('flex items-center gap-1.5 font-medium', allCorrect ? 'text-primary' : 'text-destructive')}>
            {allCorrect ? <Check className="size-4" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" />}
            {allCorrect ? 'Đúng rồi!' : `Đáp án: ${expected.join(', ')}`}
          </p>
          <Button type="button" size="sm" className="self-start" onClick={() => continueRef.current()}>
            <Play className="size-4" aria-hidden="true" />
            Phát tiếp
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm">
            Kiểm tra
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => finish(true)}>
            Bỏ qua
          </Button>
        </div>
      )}
    </form>
  )
}
