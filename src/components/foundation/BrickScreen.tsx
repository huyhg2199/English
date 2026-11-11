import { useState } from 'react'
import { BookOpen, Eye, PartyPopper } from 'lucide-react'

import { ListenButton } from '@/components/ListenButton'
import { SpeakPractice } from '@/components/lesson/SpeakPractice'
import { TenseTimeline } from '@/components/lesson/TenseTimeline'
import { Kbd } from '@/components/Kbd'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Brick, CheckItem, Screen } from '@/data/foundation'
import { firstTryScore, isFadedCorrect, type CheckFlow } from '@/lib/foundation'
import { cn } from '@/lib/utils'

import { BrickTables } from './BrickTables'
import { CheckItemView } from './CheckItemView'

type ScreenOf<K extends Screen['kind']> = Extract<Screen, { kind: K }>

/** Một dòng tiếng Anh có nút nghe. `speech`: chuỗi TTS đọc thay `text` (vd "H-U-Y" đọc "aitch, you, why"). */
function EnLine({ text, speech, size = 'base' }: { text: string; speech?: string; size?: 'base' | 'lg' }) {
  return (
    <div className="flex items-start gap-2">
      <ListenButton text={speech ?? text} label={`Nghe: ${text}`} rate={0.85} />
      <p className={cn('min-w-0 font-medium break-words', size === 'lg' ? 'text-lg' : 'text-base')} lang="en">
        {text}
      </p>
    </div>
  )
}

/** Đoạn giải thích; viên có bảng tra (story 34, F06) thì thêm `BrickTables` bên dưới. Viên khác giữ nguyên một `<p>`. */
function ExplainBody({ screen }: { screen: ScreenOf<'explain'> }) {
  const text = <p className="text-base leading-relaxed break-words">{screen.textVi}</p>
  if (!screen.tables?.length) return text
  return (
    <div className="flex flex-col gap-4">
      {text}
      <BrickTables tables={screen.tables} />
    </div>
  )
}

function ContrastBody({ screen }: { screen: ScreenOf<'contrast'> }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border p-3">
        <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tiếng Việt nói…</p>
        <p className="break-words">{screen.viSays}</p>
      </div>
      <div className="rounded-lg border border-primary/50 bg-accent/30 p-3">
        <p className="mb-1 text-xs font-semibold tracking-wide text-primary uppercase">Tiếng Anh bắt buộc…</p>
        <p className="break-words">{screen.enRequires}</p>
      </div>
      {screen.examples && screen.examples.length > 0 && (
        <ul className="flex flex-col gap-2">
          {screen.examples.map((ex) => (
            <li key={ex.en} className="rounded-lg border p-2">
              <EnLine text={ex.en} speech={ex.audioText} />
              <p className="pl-11 text-sm text-muted-foreground">{ex.vi}</p>
            </li>
          ))}
        </ul>
      )}
      {screen.timeline && <TenseTimeline kind={screen.timeline.kind} label={screen.timeline.label} />}
    </div>
  )
}

function WorkedBody({ screen }: { screen: ScreenOf<'worked'> }) {
  return (
    <div className="flex flex-col gap-3">
      <EnLine text={screen.en} speech={screen.audioText} size="lg" />
      <p className="text-muted-foreground">{screen.vi}</p>
      {screen.noteVi && <p className="rounded-lg bg-accent/30 p-3 text-sm break-words">{screen.noteVi}</p>}
      {screen.timeline && <TenseTimeline kind={screen.timeline.kind} label={screen.timeline.label} />}
    </div>
  )
}

/** Ví dụ một chỗ trống: gõ đáp án (chấm bằng `checkFill`); sai hiện gợi ý, gõ lại hoặc "Xem đáp án". */
function FadedBody({ screen }: { screen: ScreenOf<'faded'> }) {
  const [typed, setTyped] = useState('')
  const [status, setStatus] = useState<'answering' | 'wrong' | 'correct' | 'revealed'>('answering')
  const [before, after] = screen.en.split('___')
  const done = status === 'correct' || status === 'revealed'

  return (
    <div className={cn('flex flex-col gap-3 rounded-lg', status === 'correct' && 'lumos')}>
      <p className="text-lg break-words" lang="en">
        {before}
        <span className={cn('rounded px-1 font-semibold', done ? 'bg-accent/60 text-accent-foreground' : 'border-b-2 border-dashed')}>
          {done ? screen.answer : ' ___ '}
        </span>
        {after}
      </p>
      <p className="text-sm text-muted-foreground">{screen.vi}</p>
      {!done && (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setStatus(isFadedCorrect(screen.answer, typed) ? 'correct' : 'wrong')
          }}
        >
          <input
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value)
            }}
            aria-label="Từ còn thiếu"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            lang="en"
            className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <Button type="submit">Kiểm tra</Button>
        </form>
      )}
      {status === 'wrong' && (
        <div role="status" className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 text-sm">
          <p className="font-semibold">Chưa đúng, gõ lại nhé.</p>
          {screen.hintVi && <p className="break-words text-muted-foreground">{screen.hintVi}</p>}
          <Button type="button" size="sm" variant="outline" className="self-start" onClick={() => setStatus('revealed')}>
            <Eye aria-hidden="true" />
            Xem đáp án
          </Button>
        </div>
      )}
      {status === 'correct' && (
        <p role="status" className="text-sm font-semibold text-primary">
          Lumos! Chính xác.
        </p>
      )}
      {status === 'revealed' && (
        <p role="status" className="text-sm">
          Đáp án: <strong lang="en">{screen.answer}</strong>
        </p>
      )}
    </div>
  )
}

function ApplyBody({ brick, screen, seed }: { brick: Brick; screen: ScreenOf<'apply'>; seed: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="flex items-start gap-2 rounded-lg border border-primary/50 bg-accent/30 p-3 text-sm">
        <PartyPopper className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Xong viên {brick.id}! Viên gạch đã sáng trên bức tường. Làm phần áp dụng dưới đây để dùng ngay điều vừa học.
        </span>
      </p>
      <p className="break-words">{screen.promptVi}</p>
      {screen.sampleEn && (
        <div className="rounded-lg border p-3">
          <p className="mb-1 text-xs text-muted-foreground">Câu mẫu</p>
          <EnLine text={screen.sampleEn} speech={screen.sampleAudioText} />
        </div>
      )}
      {screen.item && <CheckItemView key={screen.item.id} item={screen.item} heading="Áp dụng" seed={seed} />}
      {screen.speak && screen.speak.length > 0 && <SpeakPractice sentences={screen.speak} title="Nói theo mẫu" tone="gentle" />}
    </div>
  )
}

/** Nội dung một màn (không gồm điều hướng): explain, contrast, worked, faded, apply. Màn check dùng `CheckScreen`. */
export function BrickScreen({ brick, screen, seed }: { brick: Brick; screen: Exclude<Screen, { kind: 'check' }>; seed: string }) {
  switch (screen.kind) {
    case 'explain':
      return <ExplainBody screen={screen} />
    case 'contrast':
      return <ContrastBody screen={screen} />
    case 'worked':
      return <WorkedBody screen={screen} />
    case 'faded':
      return <FadedBody screen={screen} />
    case 'apply':
      return <ApplyBody brick={brick} screen={screen} seed={seed} />
  }
}

/**
 * Tóm tắt lý thuyết của viên: màn giải thích, kèm màn so sánh Việt–Anh khi `contrast`. Dùng cho lời mời < 60% (cả hai)
 * và ngày lười ở Sân ga (ôn nhanh: cả hai; xem trước: chỉ giải thích).
 */
export function BrickRecap({ brick, contrast }: { brick: Brick; contrast: boolean }) {
  const explain = brick.screens.find((s): s is ScreenOf<'explain'> => s.kind === 'explain')
  const contrastScreen = contrast ? brick.screens.find((s): s is ScreenOf<'contrast'> => s.kind === 'contrast') : undefined
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-3">
      {explain && <ExplainBody screen={explain} />}
      {contrastScreen && <ContrastBody screen={contrastScreen} />}
    </div>
  )
}

/** Mở lại giải thích + so sánh ngay tại chỗ (lời mời < 60%). */
function ReviewExplain({ brick }: { brick: Brick }) {
  return <BrickRecap brick={brick} contrast />
}

/**
 * Màn check: câu chính lần lượt (điểm theo lần trả lời đầu), lời mời "Xem lại giải thích" + 2 câu dễ hơn khi < 60%,
 * "Bỏ qua, sang Áp dụng". Trạng thái luồng do BrickPlayer giữ (`CheckFlow`) để quay lại màn trước không mất kết quả.
 */
export function CheckScreen({
  brick,
  screen,
  flow,
  seed,
  onAttempt,
  onNext,
  onStartEasier,
  onSkipEasier,
  active = true,
}: {
  brick: Brick
  screen: ScreenOf<'check'>
  flow: CheckFlow
  seed: string
  onAttempt: (item: CheckItem, correct: boolean) => void
  onNext: () => void
  onStartEasier: () => void
  onSkipEasier: () => void
  /** Màn check đang hiện (BrickPlayer ẩn nó khi ở màn khác); false thì câu không nhận phím tắt. */
  active?: boolean
}) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const total = screen.items.length
  const score = firstTryScore(flow)

  if (flow.stage === 'main') {
    const item = screen.items[flow.index]
    if (!item) return null
    const last = flow.index + 1 === total
    return (
      <CheckItemView
        key={item.id}
        item={item}
        heading={`Câu ${flow.index + 1}/${total}`}
        seed={seed}
        onAttempt={(ok) => onAttempt(item, ok)}
        active={active}
        onContinue={onNext}
        footer={
          <Button type="button" className="self-end" onClick={onNext} aria-keyshortcuts="Enter">
            {last ? 'Xem kết quả' : 'Câu tiếp'}
            <Kbd>Enter</Kbd>
          </Button>
        }
      />
    )
  }

  const invite = (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">
          Đúng ngay lần đầu {score}/{total} câu
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 text-sm">
        <p>Phần này còn hơi lạ. Xem lại giải thích một chút rồi làm thêm 2 câu dễ hơn nhé.</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setReviewOpen((v) => !v)} aria-expanded={reviewOpen}>
            <BookOpen aria-hidden="true" />
            {reviewOpen ? 'Ẩn giải thích' : 'Xem lại giải thích'}
          </Button>
          {flow.stage === 'invite' && (
            <Button type="button" size="sm" onClick={onStartEasier}>
              Làm 2 câu dễ hơn
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onSkipEasier}>
            Bỏ qua, sang Áp dụng
          </Button>
        </div>
        {reviewOpen && <ReviewExplain brick={brick} />}
      </CardContent>
    </Card>
  )

  if (flow.stage === 'invite') return invite

  if (flow.stage === 'easier') {
    const item = screen.easier[flow.index]
    if (!item) return null
    return (
      <div className="flex flex-col gap-4">
        {invite}
        <CheckItemView
          key={item.id}
          item={item}
          heading={`Câu dễ hơn ${flow.index + 1}/${screen.easier.length}`}
          seed={seed}
          active={active}
          onContinue={onNext}
          footer={
            <Button type="button" className="self-end" onClick={onNext} aria-keyshortcuts="Enter">
              {flow.index + 1 === screen.easier.length ? 'Xong' : 'Câu tiếp'}
              <Kbd>Enter</Kbd>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Xong phần luyện tập</CardTitle>
      </CardHeader>
      <CardContent className="px-4 text-sm text-muted-foreground">
        Đúng ngay lần đầu {score}/{total} câu. Bấm "Tiếp" để sang màn Áp dụng.
      </CardContent>
    </Card>
  )
}
