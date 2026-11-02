import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { isNoteFilled, MAX_NOTE_FIELD, type NoteInput } from '@/lib/notes'

export const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

const FIELDS: { key: 'rule' | 'mistake' | 'example'; label: string; placeholder: string }[] = [
  { key: 'rule', label: 'Quy tắc', placeholder: 'Vd: He/She/It + động từ thêm -s' },
  { key: 'mistake', label: 'Lỗi sai', placeholder: 'Vd: She work here. (thiếu -s)' },
  { key: 'example', label: 'Câu ví dụ', placeholder: 'Vd: She works here.' },
]

type NoteFormProps = {
  initial?: Partial<NoteInput>
  lessonId?: string | null
  submitLabel?: string
  /** Trả về lý do không lưu (null = đã lưu). */
  onSubmit: (input: NoteInput) => 'empty' | 'missing' | null
  onCancel?: () => void
}

/** Form ghi chú 3 ô "quy tắc / lỗi sai / câu ví dụ": ô nào cũng không bắt buộc, cần ít nhất một ô có chữ. */
export function NoteForm({ initial, lessonId = null, submitLabel = 'Lưu ghi chú', onSubmit, onCancel }: NoteFormProps) {
  const [values, setValues] = useState({
    rule: initial?.rule ?? '',
    mistake: initial?.mistake ?? '',
    example: initial?.example ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const input: NoteInput = { ...values, lessonId }
    if (!isNoteFilled(input)) {
      setError('Cần ít nhất một ô có chữ.')
      return
    }
    const reason = onSubmit(input)
    if (reason === 'empty') setError('Cần ít nhất một ô có chữ.')
    else if (reason === 'missing') setError('Ghi chú này đã bị xoá.')
    else setError(null)
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
      {FIELDS.map((f) => (
        <label key={f.key} className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{f.label}</span>
          <textarea
            rows={2}
            maxLength={MAX_NOTE_FIELD}
            value={values[f.key]}
            placeholder={f.placeholder}
            onChange={(e) => {
              setValues((v) => ({ ...v, [f.key]: e.target.value }))
              setError(null)
            }}
            className={inputClass}
          />
        </label>
      ))}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Huỷ
          </Button>
        )}
      </div>
    </form>
  )
}
