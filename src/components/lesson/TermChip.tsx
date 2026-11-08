import { useMemo } from 'react'
import { BookOpen } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getBrickMeta } from '@/data/foundation'
import { getBrick } from '@/data/foundation/content'
import { splitGlossaryText, type GlossaryTerm } from '@/data/foundation/glossary'
import { brickHref } from '@/lib/foundation'

/** Đoạn giải thích (`explain`) của viên dạy thuật ngữ; viên chưa có nội dung thì "học để làm gì". */
function brickExplain(term: GlossaryTerm): string {
  const brick = getBrick(term.brickId)
  const explain = brick?.screens.find((s) => s.kind === 'explain')
  if (explain?.kind === 'explain') return explain.textVi
  return getBrickMeta(term.brickId)?.goalVi ?? ''
}

/**
 * Chip thuật ngữ (story 26): `<button>` nằm trong dòng chữ, gạch chân chấm, chữ giữ nguyên. Bấm mở Sheet tóm tắt viên gạch
 * đã dạy nó (tên, định nghĩa, "Viên gạch Fxx · tên", đoạn giải thích của viên, nút "Mở viên Fxx"). Không khoá theo tiến độ;
 * đóng Sheet thì trang không đổi.
 */
export function TermChip({ term, children }: { term: GlossaryTerm; children: string }) {
  const meta = getBrickMeta(term.brickId)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          lang="vi"
          aria-label={`Thuật ngữ: ${term.label}`}
          className="inline cursor-help rounded-sm p-0 align-baseline font-[inherit] text-inherit underline decoration-primary/70 decoration-dotted underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          {children}
        </button>
      </SheetTrigger>
      <SheetContent className="max-h-[85dvh] overflow-y-auto">
        <div className="flex flex-col gap-1 pr-8">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Thuật ngữ</p>
          <SheetTitle className="break-words">{term.label}</SheetTitle>
          <SheetDescription className="text-base text-foreground">{term.definition}</SheetDescription>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-semibold break-words">
            <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true" />
            Viên gạch {term.brickId} · {meta?.title}
          </p>
          <p className="text-sm leading-relaxed break-words text-muted-foreground">{brickExplain(term)}</p>
        </div>
        <Button asChild>
          <Link to={brickHref(term.brickId)}>Mở viên {term.brickId}</Link>
        </Button>
      </SheetContent>
    </Sheet>
  )
}

/** Lời tiếng Việt có chip thuật ngữ: đoạn thường giữ nguyên, thuật ngữ (lần đầu của mỗi mục) thành `TermChip`. */
export function GlossaryText({ text }: { text: string }) {
  const segments = useMemo(() => splitGlossaryText(text), [text])
  return (
    <>
      {segments.map((s, i) =>
        'term' in s ? (
          <TermChip key={i} term={s.term}>
            {s.text}
          </TermChip>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}
