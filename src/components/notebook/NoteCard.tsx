import { useState } from 'react'
import { BookOpenCheck, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { getLesson, lessonHref } from '@/data/roadmap'
import type { NoteEntry, NoteInput } from '@/lib/notes'

import { NoteForm } from './NoteForm'

type Props = {
  note: NoteEntry
  onEdit: (id: string, input: NoteInput) => 'empty' | 'missing' | null
  onDelete: (id: string) => void
}

const LABELS = { rule: 'Quy tắc', mistake: 'Lỗi sai', example: 'Câu ví dụ' } as const

/** Một ghi chú: 3 ô (ô trống thì ẩn), link về bài nếu có, sửa / xoá. */
export function NoteCard({ note, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const lesson = note.lessonId ? getLesson(note.lessonId) : undefined

  if (editing) {
    return (
      <li className="rounded-lg border bg-card p-3">
        <NoteForm
          initial={note}
          lessonId={note.lessonId}
          submitLabel="Lưu thay đổi"
          onSubmit={(input) => {
            const reason = onEdit(note.id, input)
            if (!reason) setEditing(false)
            return reason
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm">
      {(['rule', 'mistake', 'example'] as const).map(
        (f) =>
          note[f] && (
            <div key={f}>
              <p className="text-xs text-muted-foreground">{LABELS[f]}</p>
              <p className="break-words whitespace-pre-wrap">{note[f]}</p>
            </div>
          ),
      )}
      {note.lessonId && (
        <Link
          to={lessonHref(note.lessonId)}
          className="inline-flex min-w-0 items-center gap-1 self-start text-xs text-primary underline-offset-4 hover:underline"
        >
          <BookOpenCheck className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{lesson?.title ?? 'Bài đã gắn'}</span>
        </Link>
      )}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
        <div className="ml-auto flex gap-1">
          {confirming ? (
            <>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => onDelete(note.id)}>
                Xoá
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Giữ
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Sửa ghi chú">
                <Pencil aria-hidden="true" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(true)} aria-label="Xoá ghi chú">
                <Trash2 aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}
