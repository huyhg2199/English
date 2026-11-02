import { useMemo, useState } from 'react'
import { BookOpen, NotebookPen, Plus, Search } from 'lucide-react'

import { useNotes, useSavedWords } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { useWords } from '@/app/use-words'
import { NoteCard } from '@/components/notebook/NoteCard'
import { inputClass, NoteForm } from '@/components/notebook/NoteForm'
import { SavedItemCard } from '@/components/notebook/SavedItemCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { filterNotebook, listNotes } from '@/lib/notes'
import { groupSavedByDay, listSaved } from '@/lib/saved-words'
import { localDayKey } from '@/lib/sessions'

function dayLabel(day: string, today: string): string {
  if (day === today) return 'Hôm nay'
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })
}

/**
 * Sổ tay (story 8, CAP-18): "Từ & câu đã lưu" (mới nhất trước, nhóm theo ngày) và "Ghi chú" (mới nhất trước),
 * lọc theo chữ (không phân biệt hoa thường, dấu), nút thêm ghi chú, "Thêm vào flashcard" và xoá.
 */
export function Notebook() {
  const saved = useSavedWords()
  const notes = useNotes()
  const words = useWords()
  const [now] = useNow()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)

  const all = useMemo(() => ({ saved: listSaved(saved.items), notes: listNotes(notes.items) }), [saved.items, notes.items])
  const shown = useMemo(() => filterNotebook(query, all), [query, all])
  const groups = useMemo(() => groupSavedByDay(shown.saved), [shown.saved])
  const today = localDayKey(now)
  const empty = all.saved.length === 0 && all.notes.length === 0

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <BookOpen className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Sổ tay</h1>
      </header>

      {empty && (
        <Card>
          <CardHeader>
            <CardTitle>Sổ tay còn trống</CardTitle>
            <CardDescription>
              Chạm một từ hoặc bôi đen một cụm trong tin ngày lười, câu ví dụ của bài hay flashcard để lưu kèm câu gốc.
              Ghi chú quy tắc, lỗi sai ngay bên dưới.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!empty && (
        <label className="relative">
          <span className="sr-only">Lọc Sổ tay</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lọc theo chữ…"
            className={`${inputClass} h-11 pl-9`}
          />
        </label>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="nb-saved">
        <h2 id="nb-saved" className="text-lg font-semibold">
          Từ & câu đã lưu <span className="text-sm font-normal text-muted-foreground">({shown.saved.length})</span>
        </h2>
        {words.status === 'error' && (
          <p className="text-sm text-muted-foreground">
            Chưa mở được bộ từ nên chưa thêm vào flashcard được.{' '}
            <button type="button" className="text-primary underline" onClick={words.retry}>
              Thử lại
            </button>
          </p>
        )}
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">{query ? 'Không có mục nào khớp.' : 'Chưa lưu từ nào.'}</p>
        ) : (
          groups.map((g) => (
            <div key={g.day} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground first-letter:uppercase">{dayLabel(g.day, today)}</h3>
              <ul className="flex flex-col gap-2">
                {g.entries.map((e) => (
                  <SavedItemCard
                    key={e.id}
                    entry={e}
                    words={words}
                    onAdd={(id, opts) => saved.addToFlashcards(id, opts)}
                    onDelete={(id) => saved.remove(id)}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="nb-notes">
        <div className="flex items-center justify-between gap-2">
          <h2 id="nb-notes" className="text-lg font-semibold">
            Ghi chú <span className="text-sm font-normal text-muted-foreground">({shown.notes.length})</span>
          </h2>
          {!adding && (
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" />
              Thêm ghi chú
            </Button>
          )}
        </div>
        {adding && (
          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="inline-flex items-center gap-2 text-base">
                <NotebookPen className="size-4" aria-hidden="true" />
                Ghi chú mới
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <NoteForm
                onSubmit={(input) => {
                  const reason = notes.create(input)
                  if (!reason) setAdding(false)
                  return reason
                }}
                onCancel={() => setAdding(false)}
              />
            </CardContent>
          </Card>
        )}
        {shown.notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{query ? 'Không có ghi chú nào khớp.' : 'Chưa có ghi chú.'}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {shown.notes.map((n) => (
              <NoteCard key={n.id} note={n} onEdit={(id, input) => notes.edit(id, input)} onDelete={(id) => notes.remove(id)} />
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
