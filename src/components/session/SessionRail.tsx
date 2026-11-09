// mobile-guard: desktop-only — cả file chỉ hiện từ 1024px (`hidden lg:flex`), dưới 1024px buổi học dùng stepper ngang và hàng nút đáy.
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

import { SplitRail } from '@/components/SplitLayout'
import { Button } from '@/components/ui/button'
import { stepperItems, type SessionStep } from '@/lib/sessions'
import { cn } from '@/lib/utils'

import { STEP_ICONS } from './step-icons'

/**
 * Cột trái của buổi học trên máy tính (story 30): stepper dọc sinh từ `plan.steps` (bấm bước nào cũng được, không khoá) và
 * nút "Tiếp: …" / "Xong buổi" / "Quay lại" luôn thấy khi bước dài. Nút gọi đúng handler của trang (`goTo`, `finish`).
 */
export function SessionRail({
  steps,
  stepIndex,
  onGo,
  onFinish,
}: {
  steps: readonly SessionStep[]
  stepIndex: number
  onGo: (index: number) => void
  onFinish: () => void
}) {
  const nextStep = steps[stepIndex + 1]
  return (
    <SplitRail className="hidden lg:flex lg:flex-col lg:gap-4">
      <ol className="flex flex-col gap-1.5" aria-label="Các phần của buổi">
        {stepperItems(steps, stepIndex).map((item, i) => {
          const Icon = STEP_ICONS[item.id]
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={item.state === 'current' ? 'step' : undefined}
                onClick={() => onGo(i)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  item.state === 'current' &&
                    'border-primary bg-accent font-semibold text-accent-foreground shadow-[0_0_12px_var(--candle-glow)]',
                  item.state === 'done' && 'text-muted-foreground',
                  item.state === 'upcoming' && 'text-muted-foreground opacity-80',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 break-words">{item.title}</span>
                <span className="shrink-0 text-xs tabular-nums">{item.minutes}'</span>
                {item.state === 'done' && <Check className="size-3.5 shrink-0 text-primary" aria-label="Đã qua" />}
              </button>
            </li>
          )
        })}
      </ol>
      <div className="flex flex-col gap-2">
        {nextStep ? (
          <Button className="h-auto min-h-9 w-full py-2 whitespace-normal" onClick={() => onGo(stepIndex + 1)}>
            Tiếp: {nextStep.title}
            <ArrowRight aria-hidden="true" />
          </Button>
        ) : (
          <Button className="w-full" onClick={onFinish}>
            Xong buổi
          </Button>
        )}
        {stepIndex > 0 && (
          <Button variant="outline" className="w-full" onClick={() => onGo(stepIndex - 1)}>
            <ArrowLeft aria-hidden="true" />
            Quay lại
          </Button>
        )}
      </div>
    </SplitRail>
  )
}
