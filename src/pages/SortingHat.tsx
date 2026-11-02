import { useState, type FormEvent } from 'react'
import { History, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { usePlacement } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { allLessons, getLessonEntry, lessonHref } from '@/data/roadmap'
import {
  decidePlacementSave,
  ESTIMATE_NOTE,
  estimateScores,
  HOUSE_LABELS,
  HOUSE_QUESTIONS,
  INTERESTS,
  PART_LABELS,
  PART_LIMITS,
  placementFor,
  type Interest,
  type PartKey,
  type PlacementFormErrors,
} from '@/lib/placement'
import { cn } from '@/lib/utils'

const LISTENING_PARTS: readonly PartKey[] = ['p1', 'p2', 'p3', 'p4']
const READING_PARTS: readonly PartKey[] = ['p5', 'p6', 'p7']

type Errors = PlacementFormErrors

function lessonLabel(lessonId: string | null): string {
  const entry = lessonId ? getLessonEntry(lessonId) : undefined
  return entry ? `Chặng ${entry.stage.number} ${entry.stage.name} · ${entry.lesson.title}` : 'Bài đầu tiên của lộ trình'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function PartInputs({
  title,
  keys,
  values,
  errors,
  onChange,
}: {
  title: string
  keys: readonly PartKey[]
  values: Partial<Record<PartKey, string>>
  errors: Errors
  onChange: (key: PartKey, value: string) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold">{title}</legend>
      <div className="grid grid-cols-2 gap-3">
        {keys.map((key) => {
          const id = `part-${key}`
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
                onChange={(e) => onChange(key, e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(
                  'h-10 w-full min-w-0 rounded-md border bg-background px-3 text-base tabular-nums',
                  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
                  error && 'border-destructive',
                )}
              />
              {error && (
                <p id={`${id}-error`} className="text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

/**
 * Mũ Phân Loại (CAP-3): nhập số câu đúng từng Part của đề mẫu ETS làm ở ngoài và trả lời 4 câu hỏi sở thích.
 * Lần đầu cần cả hai; các lần sau nhập riêng điểm hoặc riêng câu hỏi Nhà đều được. Không xoá lần cũ.
 */
export function SortingHat() {
  const { placement, attempts, done, saveAttempt, saveHouse, applyPlacement } = usePlacement()
  const [values, setValues] = useState<Partial<Record<PartKey, string>>>({})
  const [answers, setAnswers] = useState<Record<string, Interest>>({})
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<string | null>(null)

  const latest = attempts.at(-1)
  const baseline = attempts[0]
  const latestScore = latest ? estimateScores(latest.parts) : null
  const baselineScore = baseline ? estimateScores(baseline.parts) : null
  const placed = latestScore ? placementFor(latestScore.total) : null
  // So với bài bắt đầu thực tế (chưa xếp = bài đầu tiên của lộ trình).
  const effectiveStart = placement.startLessonId ?? allLessons()[0].id
  const canApply = placed !== null && placed.lessonId !== effectiveStart

  function submit(e: FormEvent) {
    e.preventDefault()
    const decision = decidePlacementSave({ values, answers, done, currentHouse: placement.house })
    if (!decision.ok) {
      setErrors(decision.errors)
      setStatus('Chưa lưu: sửa các ô báo đỏ rồi bấm lưu lại.')
      return
    }
    setErrors({})
    const now = new Date()
    const saved: string[] = []
    if (decision.parts) {
      saveAttempt(decision.parts, now)
      saved.push(done ? 'đã lưu lần làm mới' : 'đã lưu điểm mốc')
    }
    if (decision.house) {
      saveHouse(decision.house, now)
      saved.push(`Nhà ${HOUSE_LABELS[decision.house]}`)
    }
    setValues({})
    setAnswers({})
    setStatus(`Mũ Phân Loại: ${saved.join(', ')}.`)
    window.scrollTo(0, 0)
  }

  function apply(lessonId: string) {
    applyPlacement(lessonId)
    setStatus(`Đã áp dụng xếp lớp: bắt đầu từ ${lessonLabel(lessonId)}. Bài đã học vẫn giữ nguyên.`)
    window.scrollTo(0, 0)
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Sparkles className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Mũ Phân Loại</h1>
      </header>

      {status && (
        <p role="status" className="rounded-lg border border-primary/40 bg-accent/40 p-3 text-sm">
          {status}
        </p>
      )}

      {latestScore && placed && (
        <Card className="gap-4 border-primary/50">
          <CardHeader>
            <CardDescription>Kết quả {attempts.length > 1 ? `lần ${attempts.length} (hiện tại)` : '(mốc)'}</CardDescription>
            <CardTitle className="text-xl">
              <h2>Ước tính {latestScore.total}*</h2>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Listening {latestScore.listening} ({latestScore.listeningCorrect}/100 câu) · Reading {latestScore.reading} (
              {latestScore.readingCorrect}/100 câu)
            </p>
            {baselineScore && attempts.length > 1 && (
              <p className="text-sm text-muted-foreground">Mốc lần đầu: {baselineScore.total}</p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p>
              Mũ xếp: <strong>{lessonLabel(placed.lessonId)}</strong>
            </p>
            <p className="text-muted-foreground">
              Đang bắt đầu từ:{' '}
              {placement.startLessonId ? (
                <Link to={lessonHref(placement.startLessonId)} className="text-primary underline-offset-4 hover:underline">
                  {lessonLabel(placement.startLessonId)}
                </Link>
              ) : (
                lessonLabel(null)
              )}
            </p>
            {canApply && (
              <div className="flex flex-col gap-1">
                <Button onClick={() => apply(placed.lessonId)}>Áp dụng xếp lớp</Button>
                <p className="text-xs text-muted-foreground">
                  Chỉ đổi bài bắt đầu. Bài đã học vẫn giữ nguyên, không bài nào bị đánh dấu hay bỏ đánh dấu.
                </p>
              </div>
            )}
            <p>
              Nhà:{' '}
              <strong className="text-primary">{placement.house ? HOUSE_LABELS[placement.house] : 'chưa chọn'}</strong>
            </p>
            <p className="text-xs text-muted-foreground">* {ESTIMATE_NOTE}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>{done ? 'Nhập điểm lần làm mới' : 'Điểm đề mẫu ETS'}</h2>
            </CardTitle>
            <CardDescription>
              Làm đề mẫu TOEIC L&R (PDF) ở ngoài app, rồi nhập số câu đúng từng Part.
              {done && ' Bỏ trống nếu chỉ muốn đổi Nhà. Lần cũ vẫn được giữ.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <PartInputs
              title="Listening"
              keys={LISTENING_PARTS}
              values={values}
              errors={errors}
              onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
            />
            <PartInputs
              title="Reading"
              keys={READING_PARTS}
              values={values}
              errors={errors}
              onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
            />
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>{placement.house ? 'Trả lời lại để đổi Nhà' : 'Mũ hỏi bạn'}</h2>
            </CardTitle>
            <CardDescription>
              {placement.house
                ? `Nhà hiện tại: ${HOUSE_LABELS[placement.house]}. Bỏ trống nếu không muốn đổi.`
                : 'Nhà quyết định màu nhấn của giao diện.'}
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
            {errors.house && <p className="text-sm text-destructive">{errors.house}</p>}
          </CardContent>
        </Card>

        {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
        <Button type="submit" size="lg">
          {done ? 'Lưu' : 'Đội Mũ Phân Loại'}
        </Button>
      </form>

      {attempts.length > 0 && (
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="size-5 text-primary" aria-hidden="true" />
              <h2>Các lần làm</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-2 text-sm">
              {attempts.map((a, i) => {
                const s = estimateScores(a.parts)
                return (
                  <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span>
                      {formatDate(a.takenAt)}
                      {i === 0 && <span className="ml-2 text-xs text-muted-foreground">mốc</span>}
                      {i > 0 && i === attempts.length - 1 && (
                        <span className="ml-2 text-xs text-muted-foreground">hiện tại</span>
                      )}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      L {s.listening} · R {s.reading} · <strong className="text-foreground">{s.total}</strong>
                    </span>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
