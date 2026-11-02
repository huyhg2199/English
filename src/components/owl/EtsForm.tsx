import { useState, type FormEvent } from 'react'
import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ETS_PARTS, ETS_SAMPLE_TEST_URL, validateEts, type EtsPart, type EtsScores } from '@/lib/owl'
import { PART_LABELS, PART_LIMITS } from '@/lib/placement'
import { cn } from '@/lib/utils'

/**
 * Phần ETS (Part 1, 2, 5): làm ngoài app bằng đề mẫu ETS (chỉ link PDF), nhập số câu đúng để tham khảo.
 * Không tính vào qua cửa; bỏ trống ô nào thì không ghi ô đó.
 */
export function EtsForm({ onDone }: { onDone: (ets: EtsScores) => void }) {
  const [values, setValues] = useState<Partial<Record<EtsPart, string>>>({})
  const [errors, setErrors] = useState<Partial<Record<EtsPart, string>>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const r = validateEts(values)
    if (!r.ok) {
      setErrors(r.errors)
      return
    }
    onDone(r.ets)
  }

  return (
    <form onSubmit={submit} noValidate>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg">
            <h2>Phần 1 · Đề mẫu ETS (tham khảo)</h2>
          </CardTitle>
          <CardDescription>
            Làm Part 1, 2 và 5 của đề mẫu TOEIC L&amp;R ở ngoài app rồi nhập số câu đúng. Phần này chỉ để theo dõi, không
            tính vào qua cửa. Chưa làm thì bỏ trống.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <a
            href={ETS_SAMPLE_TEST_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 self-start text-sm text-primary underline-offset-4 hover:underline"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Mở đề mẫu ETS (PDF)
          </a>
          <div className="grid grid-cols-3 gap-3">
            {ETS_PARTS.map((key) => {
              const id = `owl-ets-${key}`
              const error = errors[key]
              return (
                <div key={key} className="flex min-w-0 flex-col gap-1">
                  <label htmlFor={id} className="text-sm">
                    {PART_LABELS[key]} <span className="text-muted-foreground">(0–{PART_LIMITS[key]})</span>
                  </label>
                  <input
                    id={id}
                    inputMode="numeric"
                    autoComplete="off"
                    value={values[key] ?? ''}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [key]: e.target.value }))
                      setErrors((errs) => {
                        const rest = { ...errs }
                        delete rest[key]
                        return rest
                      })
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={cn(
                      'h-10 w-full min-w-0 rounded-md border bg-background px-3 text-base tabular-nums',
                      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
                      error && 'border-destructive',
                    )}
                  />
                  {error && (
                    <p id={`${id}-error`} className="text-xs break-words text-destructive">
                      {error}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <Button type="submit">Sang phần phát âm</Button>
        </CardContent>
      </Card>
    </form>
  )
}
