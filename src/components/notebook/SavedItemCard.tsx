import { useState } from 'react'
import { Check, Layers, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import type { WordsState } from '@/app/use-words'
import { SourceLink } from '@/components/flashcards/FlashcardSession'
import { ListenButton } from '@/components/ListenButton'
import { Button } from '@/components/ui/button'
import type { StudyWord } from '@/data/vocab'
import { findVocabWord, type AddToSrsResult, type SavedEntry } from '@/lib/saved-words'

import { inputClass } from './NoteForm'

type Props = {
  entry: SavedEntry
  words: WordsState
  onAdd: (id: string, opts: { vocab?: StudyWord; meaningVi?: string }) => AddToSrsResult
  onDelete: (id: string) => void
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

/** Một mục đã lưu: từ/cụm, câu gốc, nguồn, giờ lưu; "Thêm vào flashcard" (hỏi nghĩa khi cần) và xoá. */
export function SavedItemCard({ entry, words, onAdd, onDelete }: Props) {
  const [asking, setAsking] = useState(false)
  const [meaning, setMeaning] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  function add() {
    if (words.status !== 'ready') return
    const vocab = findVocabWord(words.words, entry.word)
    // Ngoài danh sách: thử trước không nghĩa (cùng cụm đã có thẻ riêng thì dùng lại), cần nghĩa thì mới hỏi.
    const r = onAdd(entry.id, vocab ? { vocab } : {})
    if (r.ok) setError(null)
    else if (r.reason === 'need-meaning' && !vocab) {
      setError(null)
      setAsking(true)
    } else setError(r.reason === 'missing' ? 'Mục này đã bị xoá, không thêm được.' : 'Chưa thêm được vào flashcard.')
  }

  function createCustom() {
    if (!meaning.trim()) {
      setError('Cần nhập nghĩa tiếng Việt để tạo thẻ.')
      return
    }
    const r = onAdd(entry.id, { meaningVi: meaning })
    if (!r.ok) setError(r.reason === 'need-meaning' ? 'Cần nhập nghĩa tiếng Việt để tạo thẻ.' : 'Mục này đã bị xoá.')
    else {
      setAsking(false)
      setError(null)
    }
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-semibold break-words" lang="en">
            {entry.word}
          </p>
          {entry.meaningVi && <p className="text-muted-foreground">{entry.meaningVi}</p>}
        </div>
        <ListenButton text={entry.word} label={`Nghe "${entry.word}"`} size="sm" />
      </div>
      {entry.sentence && (
        <p className="break-words italic" lang="en">
          {entry.sentence}
        </p>
      )}
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <span className="shrink-0">{formatTime(entry.savedAt)}</span>·
        <SourceLink source={entry.source} />
      </div>

      {asking && !entry.inSrs && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Cụm này không có trong NGSL/TSL. Nhập nghĩa tiếng Việt (bắt buộc):
            </span>
            <input
              value={meaning}
              onChange={(e) => {
                setMeaning(e.target.value)
                setError(null)
              }}
              placeholder="Vd: tham gia"
              className={inputClass}
            />
          </label>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={createCustom}>
              Tạo thẻ
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAsking(false)}>
              Huỷ
            </Button>
          </div>
        </div>
      )}

      {error && !asking && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {entry.inSrs ? (
          <Link
            to="/practice/flashcards"
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            <Check className="size-3" aria-hidden="true" />
            Đã có trong flashcard
          </Link>
        ) : (
          !asking && (
            <Button size="sm" variant="outline" onClick={add} disabled={words.status !== 'ready'}>
              <Layers aria-hidden="true" />
              {words.status === 'loading' ? 'Đang mở bộ từ…' : 'Thêm vào flashcard'}
            </Button>
          )
        )}
        <div className="ml-auto">
          {confirming ? (
            <span className="inline-flex gap-1">
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => onDelete(entry.id)}>
                Xoá
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Giữ
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirming(true)} aria-label={`Xoá "${entry.word}"`}>
              <Trash2 aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}
