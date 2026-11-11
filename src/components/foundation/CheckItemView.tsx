import { useMemo, useState, type ReactNode } from 'react'
import { Check, Eye, Lightbulb, RotateCcw } from 'lucide-react'

import { useHotkeys } from '@/app/use-hotkeys'
import { Kbd } from '@/components/Kbd'
import { ListenButton } from '@/components/ListenButton'
import { TypedAnswer } from '@/components/quiz/TypedAnswer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CheckItem } from '@/data/foundation'
import { answerText, isCorrect, shuffledTokens, type CheckResponse } from '@/lib/foundation'
import { CHOICE_KEYS, choiceBindings } from '@/lib/hotkeys'
import { canSpeak } from '@/lib/speech'
import { cn } from '@/lib/utils'

type Status = 'answering' | 'wrong' | 'correct' | 'revealed'

const KIND_HINTS: Record<CheckItem['kind'], string> = {
  choice: 'Chọn đáp án đúng',
  listen: 'Nghe rồi chọn',
  tapSyllable: 'Chạm âm tiết được nhấn',
  order: 'Sắp thứ tự',
  sort: 'Xếp nhóm',
  type: 'Gõ đáp án',
}

const CHIP =
  'inline-flex min-h-10 items-center rounded-lg border px-3 py-1.5 text-base break-words transition-colors hover:border-primary hover:bg-accent/40 disabled:pointer-events-none'

/** Gợi ý (nút "Gợi ý" → hiện `hintVi`). Không đổi điểm lần đầu. */
function Hint({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 break-words">{text}</span>
    </p>
  )
}

/** Lựa chọn (`choice`/`listen`). Sai: lựa chọn đã chọn có viền nét đứt, màu trung tính. */
function ChoiceBody({
  item,
  status,
  chosen,
  onChoose,
}: {
  item: Extract<CheckItem, { kind: 'choice' | 'listen' }>
  status: Status
  chosen: number | null
  onChoose: (i: number) => void
}) {
  const showAnswer = status === 'correct' || status === 'revealed'
  return (
    <div className="grid gap-2" role="group" aria-label="Các lựa chọn">
      {item.options.map((option, i) => {
        const isAnswer = i === item.answer
        const hotkey = i < CHOICE_KEYS.length ? CHOICE_KEYS[i] : undefined
        return (
          <button
            key={option}
            type="button"
            disabled={status !== 'answering'}
            onClick={() => onChoose(i)}
            aria-keyshortcuts={hotkey}
            className={cn(
              'flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-base break-words transition-colors',
              status === 'answering' && 'hover:border-primary hover:bg-accent/40',
              showAnswer && isAnswer && 'border-primary bg-accent/50 text-accent-foreground',
              status === 'wrong' && i === chosen && 'border-dashed border-muted-foreground bg-muted/40',
              status !== 'answering' && !(showAnswer && isAnswer) && i !== chosen && 'opacity-60',
            )}
          >
            <span className="min-w-0">
              {hotkey && <Kbd>{hotkey}</Kbd>}
              {option}
            </span>
            {showAnswer && isAnswer && <Check className="size-4 shrink-0" aria-label="Đáp án đúng" />}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Một câu luyện trong viên gạch: trả lời (`order`/`sort` xếp xong, sửa được, rồi bấm "Kiểm tra"), "Gợi ý", sai thì hiện giải thích + "Thử lại" / "Xem đáp án" (màu trung tính,
 * không ghi Sổ lỗi). Đúng có hiệu ứng Lumos. `onAttempt` báo mỗi lần trả lời (nơi gọi chỉ tính lần đầu);
 * `footer` hiện khi câu đã xong (đúng hoặc đã xem đáp án). Đổi câu thì nơi gọi đổi `key` để làm mới.
 *
 * Phím tắt (story 31): câu `choice`/`listen` đang trả lời thì 1–4 chọn; câu đã xong thì Enter → `onContinue` (cùng handler với
 * nút trong `footer`, mọi loại câu). `active = false` (màn check đang ẩn) thì không nhận phím. Câu `order`/`sort`/`tapSyllable`
 * không có phím trả lời. Câu `type` (story 35): ô gõ (`TypedAnswer`), Enter trong ô là nộp, không có phím 1–4; "Thử lại" xoá chữ
 * đã gõ.
 */
export function CheckItemView({
  item,
  heading,
  seed,
  onAttempt,
  onReveal,
  footer,
  active = true,
  onContinue,
}: {
  item: CheckItem
  heading: string
  /** Seed xáo mảnh `order`/`sort` (cố định trong một lượt). */
  seed: string
  onAttempt?: (correct: boolean) => void
  onReveal?: () => void
  footer?: ReactNode
  /** Câu đang hiện (không nằm trong phần bị ẩn); false thì không nhận phím tắt. */
  active?: boolean
  /** Enter khi câu đã xong (vd "Câu tiếp"). */
  onContinue?: () => void
}) {
  const [status, setStatus] = useState<Status>('answering')
  const [showHint, setShowHint] = useState(false)
  const [chosen, setChosen] = useState<number | null>(null)
  /** `order`: vị trí trong `pieces` theo thứ tự đã chạm. */
  const [picked, setPicked] = useState<number[]>([])
  /** `sort`: mục → vị trí nhóm. */
  const [groupOf, setGroupOf] = useState<Record<string, number>>({})
  /** `type`: chữ đã nộp (null khi đang gõ) và số lần thử lại (đổi `key` của ô gõ để xoá chữ cũ). */
  const [typed, setTyped] = useState<string | null>(null)
  const [tries, setTries] = useState(0)
  const pieces = useMemo(() => shuffledTokens(item, seed), [item, seed])
  const speakable = canSpeak()

  function submit(response: CheckResponse) {
    const ok = isCorrect(item, response)
    onAttempt?.(ok)
    setStatus(ok ? 'correct' : 'wrong')
  }

  function retry() {
    setStatus('answering')
    setChosen(null)
    setPicked([])
    setGroupOf({})
    setTyped(null)
    setTries((n) => n + 1)
  }

  function reveal() {
    setStatus('revealed')
    onReveal?.()
  }

  const answering = status === 'answering'
  const resolved = status === 'correct' || status === 'revealed'

  /** Chọn lựa chọn `i` (nút hoặc phím 1–4) của câu `choice`/`listen`. */
  function choose(i: number) {
    if (item.kind !== 'choice' && item.kind !== 'listen') return
    setChosen(i)
    submit({ kind: item.kind, choice: i })
  }

  const choiceItem = item.kind === 'choice' || item.kind === 'listen'
  useHotkeys(
    choiceBindings({
      choosing: answering && choiceItem,
      count: choiceItem ? item.options.length : 0,
      choose,
      next: resolved ? onContinue : undefined,
    }),
    active,
  )

  let body: ReactNode
  if (item.kind === 'choice' || item.kind === 'listen') {
    body = (
      <ChoiceBody
        item={item}
        status={status}
        chosen={chosen}
        onChoose={choose}
      />
    )
  } else if (item.kind === 'tapSyllable') {
    body = (
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Âm tiết của ${item.word}`} lang="en">
        {item.syllables.map((syl, i) => (
          <button
            key={i}
            type="button"
            disabled={!answering}
            onClick={() => {
              setChosen(i)
              submit({ kind: 'tapSyllable', index: i })
            }}
            className={cn(
              CHIP,
              resolved && i === item.answer && 'border-primary bg-accent/50 font-semibold',
              status === 'wrong' && i === chosen && 'border-dashed border-muted-foreground bg-muted/40',
            )}
          >
            {syl}
          </button>
        ))}
      </div>
    )
  } else if (item.kind === 'order') {
    const line = picked.map((i) => pieces[i])
    body = (
      <div className="flex flex-col gap-3">
        <div
          className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-dashed p-2"
          aria-label="Câu đang xếp"
          lang="en"
        >
          {line.length === 0 && <span className="px-1 text-sm text-muted-foreground">Chạm các mảnh theo thứ tự…</span>}
          {picked.map((pi, pos) => (
            <button
              key={pi}
              type="button"
              disabled={!answering}
              onClick={() => setPicked((p) => p.filter((_, k) => k !== pos))}
              className={cn(CHIP, 'bg-accent/40')}
              aria-label={`Bỏ mảnh ${pieces[pi]}`}
            >
              {pieces[pi]}
            </button>
          ))}
        </div>
        {answering && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Các mảnh" lang="en">
            {pieces.map((text, i) =>
              picked.includes(i) ? null : (
                <button
                  key={i}
                  type="button"
                  className={CHIP}
                  onClick={() => setPicked((p) => [...p, i])}
                >
                  {text}
                </button>
              ),
            )}
          </div>
        )}
        {answering && picked.length === pieces.length && (
          <Button
            type="button"
            className="self-start"
            onClick={() => submit({ kind: 'order', tokens: picked.map((k) => pieces[k]) })}
          >
            <Check aria-hidden="true" />
            Kiểm tra
          </Button>
        )}
      </div>
    )
  } else if (item.kind === 'type') {
    body = (
      <TypedAnswer
        key={tries}
        submitted={typed}
        onSubmit={(text) => {
          setTyped(text)
          submit({ kind: 'type', text })
        }}
        focus={active}
        tone={status === 'correct' ? 'correct' : status === 'wrong' ? 'wrong' : 'neutral'}
        answer={item.answer}
      />
    )
  } else {
    const current = pieces.find((x) => !Object.hasOwn(groupOf, x))
    body = (
      <div className="flex flex-col gap-3">
        {answering && current !== undefined && (
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              Xếp:{' '}
              <span className="font-semibold" lang="en">
                {current}
              </span>
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={`Chọn nhóm cho ${current}`}>
              {item.groups.map((g, gi) => (
                <Button
                  key={g.label}
                  type="button"
                  variant="outline"
                  className="h-auto min-h-10 whitespace-normal"
                  onClick={() => setGroupOf((m) => ({ ...m, [current]: gi }))}
                >
                  {g.label}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {item.groups.map((g, gi) => {
            const inGroup = resolved ? g.items : pieces.filter((x) => groupOf[x] === gi)
            return (
              <div key={g.label} className="flex min-w-0 flex-col gap-1.5 rounded-lg border p-2">
                <p className="text-xs font-semibold text-muted-foreground">{g.label}</p>
                <div className="flex min-h-10 flex-wrap gap-1.5" lang="en">
                  {inGroup.map((x) => (
                    <button
                      key={x}
                      type="button"
                      disabled={!answering}
                      onClick={() =>
                        setGroupOf((m) => {
                          const next = { ...m }
                          delete next[x]
                          return next
                        })
                      }
                      className={cn(CHIP, 'min-h-8 px-2 py-1 text-sm', resolved && 'border-primary bg-accent/50')}
                      aria-label={answering ? `Bỏ ${x} khỏi nhóm ${g.label}` : undefined}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {answering && current === undefined && pieces.length > 0 && (
          <Button type="button" className="self-start" onClick={() => submit({ kind: 'sort', groupOf })}>
            <Check aria-hidden="true" />
            Kiểm tra
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('gap-4 py-4', status === 'correct' && 'lumos border-primary')}>
      <CardHeader className="gap-2 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm text-muted-foreground">{heading}</CardTitle>
          <span className="text-xs text-muted-foreground">{KIND_HINTS[item.kind]}</span>
        </div>
        {item.kind === 'listen' && (
          <div className="flex items-center gap-3">
            <ListenButton text={item.audioText} label="Nghe câu" size="sm" rate={0.85} />
            {!speakable && (
              <p className="text-base break-words" lang="en">
                “{item.audioText}”
              </p>
            )}
          </div>
        )}
        {item.kind === 'tapSyllable' ? (
          <p className="text-lg break-words">
            Âm tiết nào được nhấn trong <span lang="en">“{item.word}”</span>?
          </p>
        ) : (
          item.prompt && <p className="text-lg break-words">{item.prompt}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        {body}

        {showHint && !resolved && <Hint text={item.hintVi} />}

        {status === 'correct' && (
          <p role="status" className="text-sm font-semibold text-primary">
            Lumos! Chính xác.
          </p>
        )}
        {status === 'wrong' && (
          <div role="status" className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-semibold">Chưa đúng. Không sao, xem giải thích rồi thử lại nhé.</p>
            <p className="break-words text-muted-foreground">{item.explanationVi}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={retry}>
                <RotateCcw aria-hidden="true" />
                Thử lại
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={reveal}>
                <Eye aria-hidden="true" />
                Xem đáp án
              </Button>
            </div>
          </div>
        )}
        {status === 'revealed' && (
          <div role="status" className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-semibold break-words">
              Đáp án: <span lang="en">{answerText(item)}</span>
            </p>
            <p className="break-words text-muted-foreground">{item.explanationVi}</p>
          </div>
        )}

        {!resolved && !showHint && (
          <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => setShowHint(true)}>
            <Lightbulb aria-hidden="true" />
            Gợi ý
          </Button>
        )}
        {resolved && footer}
      </CardContent>
    </Card>
  )
}
