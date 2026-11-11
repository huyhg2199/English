import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Dumbbell, PartyPopper, RotateCcw, X } from 'lucide-react'

import { useHotkeys } from '@/app/use-hotkeys'
import { EnLine, CheckScreen, FadedBody, WorkedBody } from '@/components/foundation/BrickScreen'
import { CheckItemView } from '@/components/foundation/CheckItemView'
import { SCREEN_TITLES } from '@/components/foundation/screen-titles'
import { Kbd } from '@/components/Kbd'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tense } from '@/data/lessons'
import { advanceCheck, recordAnswer, skipEasier, startCheck, startEasier, type CheckFlow } from '@/lib/foundation'
import { practiceScreens, type PracticeTense } from '@/lib/tense-practice'

import { SpeakPractice } from './SpeakPractice'

/** Tóm tắt công thức + 3 quy tắc của thì: mở ra khi bấm "Xem lại giải thích" (lời mời < 60%). */
function TenseRecap({ tense }: { tense: Tense }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <dl className="flex flex-col gap-2">
        {tense.formulas.map((f) => (
          <div key={f.label} className="rounded-lg bg-secondary/60 p-2">
            <dt className="text-xs text-muted-foreground">{f.label}</dt>
            <dd lang="en" className="font-medium break-words">
              {f.text}
            </dd>
          </div>
        ))}
      </dl>
      <ol className="flex list-decimal flex-col gap-1 pl-5">
        {tense.rules.map((r) => (
          <li key={r} className="break-words">
            {r}
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Trình phát 4 bước của phần luyện (đang mở): ví dụ mẫu → tự điền một chỗ → luyện tập (`CheckFlow` như viên gạch) → áp
 * dụng. "Tiếp" ở bước Luyện tập chỉ bấm được khi luồng `finished`; Enter = "Tiếp" khi bấm được và chưa tới bước cuối (lúc
 * đó không câu nào nhận Enter, nên không có hai Enter cùng bật). Không ghi Sổ lỗi, lần làm quiz, tiến độ hay điểm Nhà;
 * chỉ câu nói ở bước áp dụng (`SpeakPractice`) ghi điểm nói vào `pronunciation`, như viên gạch.
 */
function PracticePlayer({
  tense,
  onClose,
  onRestart,
}: {
  tense: PracticeTense
  onClose: () => void
  onRestart: () => void
}) {
  const [index, setIndex] = useState(0)
  const [flow, setFlow] = useState<CheckFlow>(startCheck)
  const [seed] = useState(() => `${tense.id}-${Date.now()}`)
  const top = useRef<HTMLElement>(null)

  const screens = practiceScreens(tense.practice)
  const [, , checkScreen] = screens
  const total = screens.length
  const screen = screens[index]
  const isLast = index === total - 1
  const canNext = screen.kind !== 'check' || flow.stage === 'finished'

  function go(next: number) {
    setIndex(Math.min(Math.max(next, 0), total - 1))
    top.current?.scrollIntoView({ block: 'start' })
  }

  useHotkeys({ Enter: () => go(index + 1) }, canNext && !isLast)

  return (
    <section
      ref={top}
      aria-label={`Luyện: ${tense.name}`}
      className="flex scroll-mt-4 flex-col gap-4 rounded-xl border border-primary/50 p-3 sm:p-4"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Luyện: {tense.name}</p>
            <h4 className="text-base font-semibold break-words">
              Bước {index + 1}/{total} · {SCREEN_TITLES[screen.kind]}
            </h4>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X aria-hidden="true" />
            Đóng
          </Button>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Tiến độ phần luyện"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
        >
          <div
            className="h-full rounded-full bg-primary shadow-[0_0_8px_var(--candle-glow)] transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      {/* Bước Luyện tập luôn được gắn (ẩn khi ở bước khác) để "Quay lại bước trước" không mất câu đang làm. */}
      <div hidden={screen.kind !== 'check'}>
        <CheckScreen
          review={<TenseRecap tense={tense} />}
          screen={checkScreen}
          flow={flow}
          seed={seed}
          active={screen.kind === 'check'}
          onAttempt={(item, ok) => setFlow((f) => recordAnswer(f, item.id, ok))}
          onNext={() => setFlow((f) => advanceCheck(f, checkScreen))}
          onStartEasier={() => setFlow(startEasier)}
          onSkipEasier={() => {
            setFlow(skipEasier)
            go(total - 1)
          }}
        />
      </div>

      {screen.kind === 'worked' && <WorkedBody screen={screen} />}
      {screen.kind === 'faded' && <FadedBody key={index} screen={screen} />}
      {screen.kind === 'apply' && (
        <div className="flex flex-col gap-4">
          <p role="status" className="flex items-start gap-2 rounded-lg border border-primary/50 bg-accent/30 p-3 text-sm">
            <PartyPopper className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>Xong phần luyện {tense.name}! Dùng ngay điều vừa luyện:</span>
          </p>
          <p className="break-words">{screen.promptVi}</p>
          {screen.sampleEn && (
            <div className="rounded-lg border p-3">
              <p className="mb-1 text-xs text-muted-foreground">Câu mẫu</p>
              <EnLine text={screen.sampleEn} speech={screen.sampleAudioText} />
            </div>
          )}
          {screen.item && <CheckItemView key={screen.item.id} item={screen.item} heading="Áp dụng" seed={seed} />}
          {screen.speak && screen.speak.length > 0 && (
            <SpeakPractice sentences={screen.speak} title="Nói theo mẫu" titleAs="h4" tone="gentle" />
          )}
        </div>
      )}

      <nav className="flex flex-wrap items-center justify-between gap-2" aria-label="Điều hướng phần luyện">
        {index > 0 ? (
          <Button type="button" variant="outline" onClick={() => go(index - 1)}>
            <ChevronLeft aria-hidden="true" />
            Quay lại bước trước
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onRestart}>
              <RotateCcw aria-hidden="true" />
              Luyện lại
            </Button>
            <Button type="button" onClick={onClose}>
              Đóng
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={() => go(index + 1)} disabled={!canNext} aria-keyshortcuts="Enter">
            Tiếp
            <ChevronRight aria-hidden="true" />
            <Kbd>Enter</Kbd>
          </Button>
        )}
      </nav>
    </section>
  )
}

/**
 * Khối "Luyện: {thì}" dưới TenseCard (story 35). Đóng sẵn: một dòng mô tả và nút "Bắt đầu luyện". Mở: trình phát 4 bước.
 * Trạng thái đóng / mở do cha giữ (`GrammarSection`: mỗi lúc chỉ mở một khối, để phím tắt không chạy hai nơi); đóng là mất
 * trạng thái. Không ghi Sổ lỗi, lần làm quiz, tiến độ hay điểm Nhà (chỉ điểm nói ở bước áp dụng, như viên gạch).
 */
export function TensePractice({
  tense,
  open,
  onOpen,
  onClose,
}: {
  tense: PracticeTense
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const [run, setRun] = useState(0)

  if (open) {
    return <PracticePlayer key={run} tense={tense} onClose={onClose} onRestart={() => setRun((n) => n + 1)} />
  }

  const n = tense.practice.check.items.length
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="gap-1 px-4">
        <CardTitle>
          <h4 className="flex items-center gap-2 text-base leading-tight">
            <Dumbbell className="size-4 shrink-0 text-primary" aria-hidden="true" />
            Luyện: {tense.name}
          </h4>
        </CardTitle>
        <CardDescription>
          Ví dụ mẫu → tự điền → {n} câu luyện → áp dụng. Sai thì làm lại, không ghi Sổ lỗi.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <Button type="button" onClick={onOpen}>
          Bắt đầu luyện
        </Button>
      </CardContent>
    </Card>
  )
}
