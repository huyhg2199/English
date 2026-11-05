import { useMemo, useState, type FormEvent } from 'react'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { useLoadedStore, usePlacement } from '@/app/store-context'
import { showMeasureLink, sortingHatNextAction } from '@/app/today-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { decideHouseSave, HOUSE_LABELS, HOUSE_QUESTIONS, INTERESTS, type House, type Interest } from '@/lib/placement'
import { cn } from '@/lib/utils'

/**
 * Mũ Phân Loại (CAP-3, story 22): chỉ 4 câu hỏi sở thích để chọn Nhà, không hỏi điểm đề ETS (đã chuyển sang trang Đo
 * trình độ `/do-trinh-do`). Chưa có Nhà: "Đội Mũ Phân Loại"; có Nhà: "Đổi Nhà". Không xoá điểm cũ hay bài bắt đầu.
 */
export function SortingHat() {
  const { store } = useLoadedStore()
  const { placement, saveHouse } = usePlacement()
  const [answers, setAnswers] = useState<Record<string, Interest>>({})
  const [error, setError] = useState<string | null>(null)
  const [chosen, setChosen] = useState<House | null>(null)
  const next = useMemo(() => sortingHatNextAction(store), [store])
  const measureLink = useMemo(() => showMeasureLink(store), [store])

  function submit(e: FormEvent) {
    e.preventDefault()
    const decision = decideHouseSave(answers)
    if (!decision.ok) {
      setError(decision.errors.house)
      return
    }
    setError(null)
    saveHouse(decision.house, new Date())
    setAnswers({})
    setChosen(decision.house)
    window.scrollTo(0, 0)
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Sparkles className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Mũ Phân Loại</h1>
      </header>

      {chosen ? (
        <Card className="gap-4 border-primary/50">
          <CardHeader>
            <CardTitle className="text-xl" role="status">
              <h2>Mũ chọn: Nhà {HOUSE_LABELS[chosen]}</h2>
            </CardTitle>
            <CardDescription>Màu nhấn của giao diện đã đổi theo Nhà. Muốn đổi Nhà thì quay lại đây lúc nào cũng được.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link to={next.to}>{next.label}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-6">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="text-lg">
                <h2>{placement.house ? 'Trả lời lại để đổi Nhà' : 'Mũ hỏi bạn'}</h2>
              </CardTitle>
              <CardDescription>
                {placement.house
                  ? `Nhà hiện tại: ${HOUSE_LABELS[placement.house]}.`
                  : '4 câu hỏi vui để chọn Nhà. Nhà quyết định màu nhấn của giao diện.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {HOUSE_QUESTIONS.map((q) => (
                <fieldset key={q.id} className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-semibold">{q.prompt}</legend>
                  {INTERESTS.map((interest) => {
                    const checked = answers[q.id] === interest
                    return (
                      <label
                        key={interest}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
                          checked ? 'border-primary bg-accent/60' : 'hover:border-primary/50',
                        )}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={interest}
                          checked={checked}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: interest }))}
                          className="size-4 accent-[var(--primary)]"
                        />
                        <span className="min-w-0 break-words">{q.options[interest]}</span>
                      </label>
                    )
                  })}
                </fieldset>
              ))}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Button type="submit" size="lg">
            {placement.house ? 'Đổi Nhà' : 'Đội Mũ Phân Loại'}
          </Button>
        </form>
      )}

      {measureLink && (
        <Link to="/do-trinh-do" className="self-start text-sm text-primary underline-offset-4 hover:underline">
          Đo trình độ (tuỳ chọn)
        </Link>
      )}
    </section>
  )
}
