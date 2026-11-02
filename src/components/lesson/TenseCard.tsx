import { ExternalLink } from 'lucide-react'

import { ListenButton } from '@/components/ListenButton'
import { ReadableText } from '@/components/ReadableText'
import { YouglishWidget } from '@/components/media/YouglishWidget'
import { getSpell, type DialogueLine, type Tense } from '@/data/lessons'

import { SpellCard } from './SpellCard'
import { TenseTimeline } from './TenseTimeline'

function Dialogue({ line }: { line: DialogueLine }) {
  if (line.kind === 'youglish') {
    return (
      <li className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
        <p>
          <span lang="en" className="font-semibold">
            “{line.phrase}”
          </span>{' '}
          <span className="text-xs text-muted-foreground">· nghe cụm này trong video thật (YouGlish).</span>
        </p>
        <YouglishWidget phrase={line.phrase} fallbackUrl={line.sourceUrl} />
      </li>
    )
  }
  return (
    <li className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
      <div className="flex items-start gap-2">
        <ListenButton text={line.text} label={`Nghe: ${line.text}`} size="sm" />
        <div className="min-w-0">
          <p lang="en" className="break-words">
            <span className="font-semibold">{line.speaker}:</span>{' '}
            <ReadableText as="span" text={line.text} className="leading-relaxed" />
          </p>
          <p className="text-xs text-muted-foreground">{line.vi}</p>
        </div>
      </div>
      <a
        href={line.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 self-start text-xs text-primary underline-offset-4 hover:underline"
      >
        VOA · {line.episode}
        <ExternalLink className="size-3" aria-hidden="true" />
      </a>
    </li>
  )
}

/** Một thì / chủ điểm: dòng thời gian (nếu là thì), công thức, 3 quy tắc, ví dụ có dịch, lỗi hay mắc, câu thoại VOA và thẻ thần chú. */
export function TenseCard({ tense, unlockedSpellIds }: { tense: Tense; unlockedSpellIds: ReadonlySet<string> }) {
  const spell = getSpell(tense.spellId)
  return (
    <article className="flex flex-col gap-4">
      <header>
        <h3 className="text-lg font-semibold">{tense.name}</h3>
        <p className="text-sm text-muted-foreground">{tense.use}</p>
      </header>

      {tense.timeline && <TenseTimeline kind={tense.timeline.kind} label={tense.timeline.label} />}

      <div className="flex flex-col gap-2">
        <h4 className="font-semibold">Công thức</h4>
        <dl className="flex flex-col gap-2 text-sm">
          {tense.formulas.map((f) => (
            <div key={f.label} className="rounded-lg bg-secondary/60 p-2">
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd lang="en" className="font-medium break-words">
                {f.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="font-semibold">3 quy tắc</h4>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {tense.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-semibold">Ví dụ</h4>
        <ul className="flex flex-col gap-2 text-sm">
          {tense.examples.map((e) => (
            <li key={e.en} className="flex items-start gap-2">
              <ListenButton text={e.en} label={`Nghe: ${e.en}`} size="sm" />
              <div className="min-w-0">
                <ReadableText text={e.en} className="leading-relaxed" />
                <p className="text-xs text-muted-foreground">{e.vi}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-semibold">Lỗi người Việt hay mắc</h4>
        <ul className="flex flex-col gap-2 text-sm">
          {tense.mistakes.map((m) => (
            <li key={m.wrong} className="rounded-lg border p-2">
              <p lang="en">
                <span className="text-destructive line-through">{m.wrong}</span> →{' '}
                <span className="font-semibold text-primary">{m.right}</span>
              </p>
              <p className="text-xs text-muted-foreground">{m.why}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-semibold">Câu thoại thật</h4>
        <ul className="flex flex-col gap-2">
          {tense.dialogues.map((d) => (
            <Dialogue key={d.kind === 'voa' ? `${d.speaker}-${d.text}` : d.phrase} line={d} />
          ))}
        </ul>
      </div>

      {spell && <SpellCard spell={spell} unlocked={unlockedSpellIds.has(spell.id)} />}
    </article>
  )
}
