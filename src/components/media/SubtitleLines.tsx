import { useState } from 'react'
import { Sparkles } from 'lucide-react'

import { NOTE_KIND_LABELS, splitByNotes, tokenize, type SubCue, type SubNote } from '@/lib/subs'
import { cn } from '@/lib/utils'

export type SubMode = 'both' | 'en' | 'off' | 'fill'

/** Câu Anh có cụm chú thích gạch chân (chạm để xem giải thích). */
function EnWithNotes({ cue, onNote }: { cue: SubCue; onNote: (note: SubNote) => void }) {
  return (
    <>
      {splitByNotes(cue.en, cue.notes).map((seg, i) =>
        seg.note ? (
          <button
            key={i}
            type="button"
            onClick={() => onNote(seg.note!)}
            className="underline decoration-primary decoration-dotted decoration-2 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {seg.text}
          </button>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  )
}

/** Câu Anh với từ ẩn thành ô trống (chế độ điền từ). */
function EnWithBlanks({ en, blanks }: { en: string; blanks: readonly number[] }) {
  return (
    <>
      {tokenize(en).map((t, i) =>
        blanks.includes(i) ? (
          <span key={i} className="mx-0.5 inline-block min-w-12 border-b-2 border-primary align-baseline" aria-label="từ ẩn">
            &nbsp;
          </span>
        ) : (
          <span key={i}>{t.text}</span>
        ),
      )}
    </>
  )
}

/**
 * Hai dòng sub dưới video (story 16): Anh trên, Việt dưới. Nằm dưới khung video nên không che nút điều khiển.
 * Câu liên quan bài được tô; chạm ✦ để xem lý do. Cụm idiom / nói tắt / nghĩa ngữ cảnh gạch chân, chạm để xem giải thích.
 */
export function SubtitleLines({
  cue,
  mode,
  blanks = [],
  reason,
}: {
  cue: SubCue | null
  mode: SubMode
  blanks?: readonly number[]
  reason: string | null
}) {
  const [note, setNote] = useState<{ cue: SubCue; note: SubNote } | null>(null)
  const [reasonFor, setReasonFor] = useState<SubCue | null>(null)
  if (mode === 'off') return null
  const openNote = note && note.cue === cue ? note.note : null
  const showReason = reason !== null && reasonFor === cue && mode !== 'fill'
  return (
    <div
      aria-live="off"
      className={cn(
        'flex min-h-20 flex-col justify-center gap-1 rounded-lg border px-3 py-2 text-center transition-colors',
        reason && mode !== 'fill' ? 'border-primary/60 bg-accent/40' : 'bg-card',
      )}
    >
      {cue ? (
        <>
          <p lang="en" className="text-base leading-snug font-medium break-words text-foreground">
            {mode === 'fill' ? <EnWithBlanks en={cue.en} blanks={blanks} /> : <EnWithNotes cue={cue} onNote={(n) => setNote({ cue, note: n })} />}
            {reason && mode !== 'fill' && (
              <button
                type="button"
                onClick={() => setReasonFor(showReason ? null : cue)}
                aria-label={`Vì sao câu này được tô: ${reason}`}
                aria-expanded={showReason}
                className="ml-1.5 inline-flex translate-y-0.5 text-primary"
              >
                <Sparkles className="size-4" aria-hidden="true" />
              </button>
            )}
          </p>
          {mode === 'both' && <p className="text-sm leading-snug break-words text-muted-foreground">{cue.vi}</p>}
          {showReason && <p className="text-xs font-medium text-primary">{reason}</p>}
          {openNote && mode !== 'fill' && (
            <p role="note" className="rounded-md bg-muted px-2 py-1 text-left text-xs leading-snug">
              <span lang="en" className="font-semibold">
                {openNote.term}
              </span>{' '}
              <span className="text-muted-foreground">({NOTE_KIND_LABELS[openNote.kind]})</span>: {openNote.noteVi}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">…</p>
      )}
    </div>
  )
}
