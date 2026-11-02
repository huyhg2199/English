import { useState, type ReactNode } from 'react'
import { Check, ExternalLink, Eye, Headphones, Link2 } from 'lucide-react'
import { Link } from 'react-router'

import { usePronunciation } from '@/app/store-context'
import type { WordsState } from '@/app/use-words'
import { ListenButton } from '@/components/ListenButton'
import { Button } from '@/components/ui/button'
import type { PracticeSentence, PronunciationBlock, StressRule } from '@/data/lessons'
import { sectionHref } from '@/data/roadmap'
import { cambridgeUrl } from '@/data/vocab'
import { gradeDictation, type DictationResult } from '@/lib/dictation'
import { canSpeak, speak } from '@/lib/speech'
import { cn } from '@/lib/utils'

import { SpeakPractice } from './SpeakPractice'
import { useNgslLookup, type NgslLookup } from './use-ngsl'

type Block<K extends PronunciationBlock['kind']> = Extract<PronunciationBlock, { kind: K }>

function BlockShell({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{title}</h3>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      {children}
    </div>
  )
}

/** Âm tiết của từ, âm tiết nhấn in hoa đậm (dữ liệu âm tiết + vị trí nhấn từ bộ từ NGSL). */
function Syllables({ syllables, stressIndex }: { syllables: readonly string[]; stressIndex: number }) {
  return (
    <span className="font-medium" lang="en">
      {syllables.map((s, i) => (
        <span key={i}>
          {i > 0 && <span className="text-muted-foreground">·</span>}
          <span className={cn(i === stressIndex && 'font-bold text-primary uppercase')}>{s}</span>
        </span>
      ))}
    </span>
  )
}

function StressWord({ word, lookup }: { word: string; lookup: NgslLookup }) {
  const data = lookup(word)
  return (
    <li className="flex items-center gap-1.5 rounded-md bg-secondary/60 py-0.5 pr-2 pl-0.5">
      <ListenButton text={word} label={`Nghe "${word}"`} size="sm" />
      <span className="flex flex-col leading-tight">
        {data?.syllables && typeof data.stressIndex === 'number' ? (
          <Syllables syllables={data.syllables} stressIndex={data.stressIndex} />
        ) : (
          <span className="font-medium" lang="en">
            {word}
          </span>
        )}
        {data?.ipa && <span className="text-xs text-muted-foreground">/{data.ipa}/</span>}
      </span>
    </li>
  )
}

function StressRuleItem({ rule, lookup }: { rule: StressRule; lookup: NgslLookup }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3">
      <p className="font-semibold">{rule.title}</p>
      <p className="text-sm">{rule.tip}</p>
      <ul className="flex flex-wrap gap-1.5 text-sm">
        {rule.words.map((w) => (
          <StressWord key={w} word={w} lookup={lookup} />
        ))}
      </ul>
    </li>
  )
}

/** Bộ từ NGSL chưa tải được: báo và cho thử lại. */
function NgslError({ state }: { state: WordsState }) {
  if (state.status !== 'error') return null
  return (
    <p className="text-xs text-muted-foreground" role="alert">
      Chưa tải được âm tiết và IPA.{' '}
      <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={state.retry}>
        Thử lại
      </button>
    </p>
  )
}

function StressBlock({ block }: { block: Block<'stress'> }) {
  const { state, lookup } = useNgslLookup()
  return (
    <BlockShell title={block.title} note={block.note}>
      <NgslError state={state} />
      <ul className="flex flex-col gap-2">
        {block.rules.map((r) => (
          <StressRuleItem key={r.id} rule={r} lookup={lookup} />
        ))}
      </ul>
    </BlockShell>
  )
}

function ExampleLine({ text, vi }: { text: string; vi: string }) {
  return (
    <div className="flex items-start gap-2">
      <ListenButton text={text} label={`Nghe: ${text}`} size="sm" rate={0.9} />
      <div className="min-w-0">
        <p lang="en" className="font-medium break-words">
          {text}
        </p>
        <p className="text-xs text-muted-foreground">{vi}</p>
      </div>
    </div>
  )
}

function WeakFormsBlock({ block }: { block: Block<'weak-forms'> }) {
  return (
    <BlockShell title={block.title} note={block.note}>
      <ul className="flex flex-col gap-2">
        {block.items.map((it) => (
          <li key={it.word} className="flex flex-col gap-1.5 rounded-lg border p-3 text-sm">
            <p className="flex flex-wrap items-baseline gap-x-2" lang="en">
              <span className="text-lg font-semibold">{it.word}</span>
              <span className="text-muted-foreground">mạnh /{it.strong}/</span>
              <span className="font-semibold text-primary">yếu /{it.weak}/</span>
            </p>
            <ExampleLine text={it.example} vi={it.vi} />
          </li>
        ))}
      </ul>
    </BlockShell>
  )
}

function LinkingBlock({ block }: { block: Block<'linking'> }) {
  return (
    <BlockShell title={block.title} note={block.note}>
      <ul className="flex flex-col gap-2">
        {block.items.map((it) => (
          <li key={it.text} className="flex items-start gap-2 rounded-lg border p-3 text-sm">
            <ListenButton text={it.text} label={`Nghe: ${it.text}`} size="sm" rate={0.9} />
            <div className="min-w-0">
              <p lang="en" className="flex flex-wrap items-center gap-x-1.5 font-medium">
                {it.text}
                <Link2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-primary">“{it.sounds}”</span>
              </p>
              <p className="text-xs text-muted-foreground">{it.vi}</p>
            </div>
          </li>
        ))}
      </ul>
    </BlockShell>
  )
}

function SentenceStressBlock({ block }: { block: Block<'sentence-stress'> }) {
  return (
    <BlockShell title={block.title} note={block.note}>
      <ul className="flex flex-col gap-2">
        {block.items.map((it) => (
          <li key={it.text} className="flex items-start gap-2 rounded-lg border p-3 text-sm">
            <ListenButton text={it.text} label={`Nghe: ${it.text}`} size="sm" rate={0.9} />
            <div className="min-w-0">
              <p lang="en" className="flex flex-wrap gap-x-1.5">
                {it.text.split(/\s+/).map((w, i) => (
                  <span
                    key={i}
                    className={cn(it.stressed.includes(i) ? 'font-bold text-primary uppercase' : 'text-muted-foreground')}
                  >
                    {w}
                  </span>
                ))}
              </p>
              <p className="text-xs text-muted-foreground">{it.vi}</p>
            </div>
          </li>
        ))}
      </ul>
    </BlockShell>
  )
}

function ReductionsBlock({ block }: { block: Block<'reductions'> }) {
  return (
    <BlockShell title={block.title} note={block.note}>
      <ul className="flex flex-col gap-2">
        {block.items.map((it) => (
          <li key={it.reduced} className="flex flex-col gap-1.5 rounded-lg border p-3 text-sm">
            <p className="flex flex-wrap items-baseline gap-x-2" lang="en">
              <span className="text-lg font-semibold text-primary">{it.reduced}</span>
              <span className="text-muted-foreground">= {it.full}</span>
            </p>
            <ExampleLine text={it.example} vi={it.vi} />
            <a
              href={it.youglishUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 self-start text-xs text-primary underline-offset-4 hover:underline"
            >
              Nghe “{it.reduced}” trong video thật (YouGlish)
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </BlockShell>
  )
}

function ShadowingBlock({ block }: { block: Block<'shadowing'> }) {
  const passage = block.lines.map((l) => l.text).join(' ')
  // Micro đang nghe thì tắt nút đọc cả đoạn để micro không thu lại giọng máy (SpeakPractice tự dừng TTS khi bắt đầu nghe).
  const [listening, setListening] = useState(false)
  return (
    <BlockShell title={block.title} note={block.note}>
      {canSpeak() && (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          disabled={listening}
          onClick={() => speak(passage, { rate: 0.85 })}
        >
          <Headphones aria-hidden="true" />
          Nghe cả đoạn
        </Button>
      )}
      <SpeakPractice sentences={block.lines} title="Nói theo từng câu" onListeningChange={setListening} />
    </BlockShell>
  )
}

function DictationItem({
  item,
  index,
  best,
  enabled,
  onGraded,
}: {
  item: PracticeSentence
  index: number
  best: number | null
  /** Không có TTS thì không nghe được câu: khoá ô gõ và nút chấm. */
  enabled: boolean
  onGraded: (result: DictationResult) => void
}) {
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<DictationResult | null>(null)
  // Chỉ ghi điểm lần chấm đầu (trước khi lộ đáp án); chấm lại sau đó chỉ để tự sửa, không ghi.
  const [recorded, setRecorded] = useState(false)
  const inputId = `dictation-${item.id}`
  const grade = () => {
    if (!enabled) return
    const r = gradeDictation(item.text, typed)
    setResult(r)
    if (r && !recorded) {
      setRecorded(true)
      onGraded(r)
    }
  }
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
      <div className="flex items-center gap-2">
        <ListenButton text={item.text} label={`Nghe câu ${index + 1}`} rate={0.85} />
        <label htmlFor={inputId} className="font-medium">
          Câu {index + 1}
        </label>
        {best !== null && <span className="ml-auto text-xs text-muted-foreground">Tốt nhất {best}%</span>}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          grade()
        }}
      >
        <input
          id={inputId}
          lang="en"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Gõ câu vừa nghe…"
          disabled={!enabled}
          className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <Button type="submit" size="sm" className="h-9" disabled={!enabled || typed.trim() === ''}>
          <Check aria-hidden="true" />
          Chấm
        </Button>
      </form>
      {result && (
        <div className="flex flex-col gap-1" role="status">
          <p className="flex flex-wrap gap-x-1.5" lang="en" aria-label="Câu đúng, từ thiếu hoặc sai tô đỏ">
            {result.words.map((w, i) => (
              <span
                key={i}
                className={cn(w.ok ? 'text-foreground' : 'font-semibold text-destructive underline decoration-wavy')}
              >
                {w.text}
              </span>
            ))}
          </p>
          <p>
            <span className={cn('font-semibold', result.score >= 70 ? 'text-primary' : 'text-destructive')}>
              {result.score}% đúng
            </span>
            <span className="text-muted-foreground"> · {item.vi}</span>
          </p>
          {recorded && (
            <p className="text-xs text-muted-foreground">Điểm đã lưu là lần chấm đầu; chấm lại chỉ để tự sửa.</p>
          )}
        </div>
      )}
    </li>
  )
}

function DictationBlock({ block }: { block: Block<'dictation'> }) {
  const { items, record } = usePronunciation()
  const enabled = canSpeak()
  return (
    <BlockShell title={block.title} note={block.note}>
      {!enabled && (
        <p className="text-xs text-muted-foreground">Trình duyệt này không đọc được câu (TTS), nên chưa chép chính tả được.</p>
      )}
      <ul className="flex flex-col gap-2">
        {block.items.map((item, i) => (
          <DictationItem
            key={item.id}
            item={item}
            index={i}
            best={items[item.id]?.best ?? null}
            enabled={enabled}
            onGraded={(r) => record(item.id, r.score)}
          />
        ))}
      </ul>
    </BlockShell>
  )
}

function SelfReadWord({ word, lookup }: { word: string; lookup: NgslLookup }) {
  const [shown, setShown] = useState(false)
  const data = lookup(word)
  return (
    <li className="flex flex-col gap-1 rounded-lg border p-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold" lang="en">
          {word}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="ml-auto h-7"
          aria-expanded={shown}
          onClick={() => setShown((s) => !s)}
        >
          <Eye aria-hidden="true" />
          {shown ? 'Ẩn' : 'Xem IPA'}
        </Button>
      </div>
      {shown && (
        <div className="flex flex-wrap items-center gap-2">
          <ListenButton text={word} label={`Nghe "${word}"`} size="sm" />
          {data?.syllables && typeof data.stressIndex === 'number' && (
            <Syllables syllables={data.syllables} stressIndex={data.stressIndex} />
          )}
          {data?.ipa && <span className="text-muted-foreground">/{data.ipa}/</span>}
          <a
            href={cambridgeUrl(word)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
          >
            Cambridge
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>
      )}
    </li>
  )
}

function SelfReadBlock({ block }: { block: Block<'self-read'> }) {
  const { state, lookup } = useNgslLookup()
  return (
    <BlockShell title={block.title} note={block.note}>
      <NgslError state={state} />
      <ul className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        {block.words.map((w) => (
          <SelfReadWord key={w} word={w} lookup={lookup} />
        ))}
      </ul>
    </BlockShell>
  )
}

function OverviewBlock({ block }: { block: Block<'overview'> }) {
  return (
    <BlockShell title={block.title} note={block.note}>
      <ul className="flex flex-col gap-1.5">
        {block.items.map((it) => (
          <li key={`${it.lessonId}-${it.sectionId}`}>
            <Link
              to={sectionHref(it.lessonId, it.sectionId)}
              className="block rounded-lg border p-2 text-sm hover:border-primary/60 hover:shadow-[0_0_12px_var(--candle-glow)]"
            >
              {it.text}
            </Link>
          </li>
        ))}
      </ul>
    </BlockShell>
  )
}

/** Các khối phát âm mới (story 10), vẽ theo `kind`. */
export function PronunciationBlockView({ block }: { block: PronunciationBlock }) {
  switch (block.kind) {
    case 'stress':
      return <StressBlock block={block} />
    case 'weak-forms':
      return <WeakFormsBlock block={block} />
    case 'linking':
      return <LinkingBlock block={block} />
    case 'sentence-stress':
      return <SentenceStressBlock block={block} />
    case 'reductions':
      return <ReductionsBlock block={block} />
    case 'shadowing':
      return <ShadowingBlock block={block} />
    case 'dictation':
      return <DictationBlock block={block} />
    case 'self-read':
      return <SelfReadBlock block={block} />
    case 'overview':
      return <OverviewBlock block={block} />
  }
}
