import { useMemo } from 'react'
import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router'

import { useLoadedStore } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  groupTenseRows,
  TENSE_STATUS_LABELS,
  tenseCardsLine,
  tenseCheckLine,
  tenseGapText,
  tenseMapRows,
  tenseMapSummary,
  tenseMistakesLine,
  tenseRowLinks,
  tenseSkippedNote,
  tenseVerbsLine,
  type TenseMapRow,
  type TenseStatus,
} from '@/lib/tense-map'
import { cn } from '@/lib/utils'

const STATUS_CHIP: Record<TenseStatus, string> = {
  solid: 'border-primary bg-accent/40 text-primary',
  learning: 'border-border bg-muted',
  new: 'border-border text-muted-foreground',
}

/** Một thì: chip trạng thái, các dòng số, câu "Để chắc", ghi chú bài xếp qua và hàng nút. */
function TenseRow({ row }: { row: TenseMapRow }) {
  const check = tenseCheckLine(row.check)
  const gap = tenseGapText(row)
  const links = tenseRowLinks(row)
  const skippedNote = tenseSkippedNote(row)
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 font-semibold break-words">{row.name}</h3>
        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-xs', STATUS_CHIP[row.status])}>
          {TENSE_STATUS_LABELS[row.status]}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
        <p className={cn('break-words', check.passed && 'text-primary')}>{check.text}</p>
        <p className="break-words">
          {links.cards ? (
            <Link to={links.cards} className="underline underline-offset-2 hover:text-foreground">
              {tenseCardsLine(row)}
            </Link>
          ) : (
            tenseCardsLine(row)
          )}
        </p>
        {row.verbs && <p className="break-words">{tenseVerbsLine(row.verbs)}</p>}
        <p className="break-words">
          {links.mistakes ? (
            <Link to={links.mistakes} className="underline underline-offset-2 hover:text-foreground">
              {tenseMistakesLine(row.openMistakes)}
            </Link>
          ) : (
            tenseMistakesLine(row.openMistakes)
          )}
        </p>
      </div>
      {gap && <p className="text-sm break-words">{gap}</p>}
      {skippedNote && <p className="text-sm break-words text-muted-foreground">{skippedNote}</p>}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="min-h-9">
          <Link to={links.lesson}>Xem bài</Link>
        </Button>
        {links.session && (
          <Button asChild size="sm" className="min-h-9">
            <Link to={links.session}>Buổi ôn 30'</Link>
          </Button>
        )}
        {links.check && (
          <Button asChild variant="ghost" size="sm" className="min-h-9">
            <Link to={links.check}>Làm kiểm tra</Link>
          </Button>
        )}
      </div>
    </li>
  )
}

/**
 * Bản đồ thì (story 42): mỗi thì Năm 1 một dòng (điểm kiểm tra bài tốt nhất, thẻ quy tắc đã nhớ, lỗi còn trong Sổ lỗi,
 * trạng thái chưa học / đang học / chắc), nhóm theo tháng, link tới bài, buổi ôn 30' và kiểm tra. Chỉ đọc store; số liệu
 * đổi theo store ngay (`useLoadedStore`). Từ 1024px: lưới 2 cột, đầu trang trải 2 cột, mỗi tháng một ô.
 */
export function TenseMap() {
  const { store } = useLoadedStore()
  const [now] = useNow()
  const rows = useMemo(() => tenseMapRows(store, now), [store, now])
  const months = useMemo(() => groupTenseRows(rows), [rows])
  const summary = tenseMapSummary(rows)

  return (
    <section className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
      <Link
        to="/practice"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground lg:col-span-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Luyện tập
      </Link>
      <header className="flex items-center gap-3 lg:col-span-2">
        <Compass className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Bản đồ thì</h1>
      </header>

      <div className="flex flex-col gap-2 lg:col-span-2">
        <p className="text-sm break-words text-muted-foreground">
          Mỗi thì của Năm 1: điểm kiểm tra bài tốt nhất, thẻ quy tắc đã nhớ và lỗi còn trong Sổ lỗi. Chắc = đã xong bài, kiểm
          tra bài từ 70%, mọi thẻ quy tắc đã nhớ (khoảng ôn từ 7 ngày) và không còn câu sai về thì chưa thuộc. Điểm kiểm tra
          và Sổ lỗi tính theo bài.
        </p>
        <p className="text-sm font-medium">
          Chắc {summary.solid} · Đang học {summary.learning} · Chưa học {summary.new}
        </p>
      </div>

      {months.map((m) => (
        <section key={m.monthId} aria-labelledby={`tense-month-${m.monthId}`} className="min-w-0">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="text-lg">
                <h2 id={`tense-month-${m.monthId}`}>
                  {m.label} · {m.period}
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {m.rows.map((row) => (
                  <TenseRow key={row.tenseId} row={row} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      ))}
    </section>
  )
}
