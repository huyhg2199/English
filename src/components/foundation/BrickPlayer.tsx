import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import { useFoundation } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Brick, Screen } from '@/data/foundation'
import { advanceCheck, recordAnswer, skipEasier, startCheck, startEasier, type CheckFlow } from '@/lib/foundation'

import { BrickScreen, CheckScreen } from './BrickScreen'

const SCREEN_TITLES: Record<Screen['kind'], string> = {
  explain: 'Giải thích',
  contrast: 'Tiếng Việt nói… / Tiếng Anh bắt buộc…',
  worked: 'Ví dụ mẫu',
  faded: 'Tự điền một chỗ trống',
  check: 'Luyện tập',
  apply: 'Áp dụng',
}

/**
 * Trình phát một viên gạch: 6 màn theo thứ tự, "Màn n/6", "Tiếp" / "Quay lại màn trước". Màn check phải xong (đúng hoặc
 * "Xem đáp án" từng câu, hoặc "Bỏ qua, sang Áp dụng") mới "Tiếp". Màn Áp dụng hiện lần đầu trong lượt thì ghi xong viên
 * (`completeBrick`); thoát giữa chừng không lưu gì, mở lại bắt đầu từ màn 1. Không ghi Sổ lỗi, quiz, điểm Nhà, buổi học.
 * Nội dung màn nằm ở `BrickScreen`/`CheckScreen`, tách khỏi điều hướng (story 30 chia hai cột).
 *
 * `variant`: `page` (trang `/foundation/:id`, mặc định) hoặc `session` (chạy trong buổi 30', story 21): không có link
 * "Bức tường", tiêu đề là `h2`, màn cuối hiện `endSlot` (vd nút "Học tiếp viên sau") thay cho nút "Về bức tường".
 */
export function BrickPlayer({
  brick,
  variant = 'page',
  endSlot,
}: {
  brick: Brick
  variant?: 'page' | 'session'
  endSlot?: ReactNode
}) {
  const inSession = variant === 'session'
  const { completeBrick } = useFoundation()
  const [index, setIndex] = useState(0)
  const [flow, setFlow] = useState<CheckFlow>(startCheck)
  const [seed] = useState(() => `${brick.id}-${Date.now()}`)
  const completed = useRef(false)
  const top = useRef<HTMLDivElement>(null)

  const screens = brick.screens
  const screen = screens[index]
  const total = screens.length
  const checkScreen = screens.find((s): s is Extract<Screen, { kind: 'check' }> => s.kind === 'check')

  useEffect(() => {
    if (screen?.kind === 'apply' && !completed.current) {
      completed.current = true
      completeBrick(brick.id)
    }
  }, [screen, brick.id, completeBrick])

  function go(next: number) {
    setIndex(Math.min(Math.max(next, 0), total - 1))
    top.current?.scrollIntoView({ block: 'start' })
  }

  function toApply() {
    const apply = screens.findIndex((s) => s.kind === 'apply')
    go(apply >= 0 ? apply : index + 1)
  }

  if (!screen) return null
  const canNext = screen.kind !== 'check' || flow.stage === 'finished'
  const isLast = index === total - 1

  return (
    <div ref={top} className="flex scroll-mt-4 flex-col gap-4">
      {!inSession && (
        <Link
          to="/foundation"
          className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Bức tường
        </Link>
      )}

      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Sân ga 9¾ · Viên {brick.id}</p>
        {inSession ? (
          <h2 className="text-2xl leading-tight font-semibold break-words">{brick.title}</h2>
        ) : (
          <h1 className="text-2xl leading-tight font-semibold break-words">{brick.title}</h1>
        )}
        <div className="flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Tiến độ viên gạch"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={index + 1}
          >
            <div
              className="h-full rounded-full bg-primary shadow-[0_0_8px_var(--candle-glow)] transition-all"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            Màn {index + 1}/{total}
          </span>
        </div>
      </header>

      {/* Màn check luôn được gắn (ẩn khi ở màn khác) để "Quay lại màn trước" rồi trở lại không mất trạng thái câu đang làm. */}
      {checkScreen && (
        <section aria-label={SCREEN_TITLES.check} className="flex flex-col gap-3" hidden={screen.kind !== 'check'}>
          <h2 className="text-lg font-semibold">{SCREEN_TITLES.check}</h2>
          <CheckScreen
            brick={brick}
            screen={checkScreen}
            flow={flow}
            seed={seed}
            onAttempt={(item, ok) => setFlow((f) => recordAnswer(f, item.id, ok))}
            onNext={() => setFlow((f) => advanceCheck(f, checkScreen))}
            onStartEasier={() => setFlow(startEasier)}
            onSkipEasier={() => {
              setFlow(skipEasier)
              toApply()
            }}
          />
        </section>
      )}
      {screen.kind !== 'check' && (
        <Card className="gap-4 py-4">
          <CardHeader className="px-4">
            <CardTitle>
              <h2 className="text-lg leading-tight">{SCREEN_TITLES[screen.kind]}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <BrickScreen key={index} brick={brick} screen={screen} seed={seed} />
          </CardContent>
        </Card>
      )}

      <nav className="flex flex-wrap items-center justify-between gap-2" aria-label="Điều hướng màn">
        {index > 0 ? (
          <Button type="button" variant="outline" onClick={() => go(index - 1)}>
            <ChevronLeft aria-hidden="true" />
            Quay lại màn trước
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          inSession ? (
            endSlot
          ) : (
            <Button asChild>
              <Link to="/foundation">Về bức tường</Link>
            </Button>
          )
        ) : (
          <Button type="button" onClick={() => go(index + 1)} disabled={!canNext}>
            Tiếp
            <ChevronRight aria-hidden="true" />
          </Button>
        )}
      </nav>
    </div>
  )
}
