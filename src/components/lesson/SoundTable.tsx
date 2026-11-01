import { useMemo } from 'react'
import { Star } from 'lucide-react'

import { useWords } from '@/app/use-words'
import { ListenButton } from '@/components/ListenButton'
import type { ExampleWord, PronunciationContent, Sound } from '@/data/lessons'
import { hasDetails, type StudyWord } from '@/data/vocab'
import { cn } from '@/lib/utils'

type Lookup = (word: string) => StudyWord | undefined

function Example({ example, lookup }: { example: ExampleWord; lookup: Lookup }) {
  const base = lookup(example.word)
  const text = example.form ?? example.word
  const ipa = example.form ? example.formIpa : base?.ipa
  return (
    <li className="flex items-center gap-1.5 rounded-md bg-secondary/60 py-0.5 pr-2 pl-0.5">
      <ListenButton text={text} label={`Nghe "${text}"`} size="sm" />
      <span className="flex flex-col leading-tight">
        <span className="font-medium">
          {example.form ? (
            <>
              <span className="text-muted-foreground">{example.word} →</span> {example.form}
            </>
          ) : (
            text
          )}
        </span>
        {ipa && <span className="text-xs text-muted-foreground">/{ipa}/</span>}
      </span>
    </li>
  )
}

function SoundItem({ sound, lookup }: { sound: Sound; lookup: Lookup }) {
  return (
    <li
      id={`sound-${sound.id}`}
      className={cn('flex flex-col gap-2 rounded-lg border p-3', sound.focus && 'border-primary/60 bg-accent/30')}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-semibold text-primary" lang="en">
          /{sound.ipa}/
        </span>
        {sound.focus && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            <Star className="size-3" aria-hidden="true" />
            Chú ý
          </span>
        )}
      </div>
      <p className="text-sm">{sound.tip}</p>
      <ul className="flex flex-wrap gap-1.5 text-sm" aria-label={`Từ ví dụ cho /${sound.ipa}/`} lang="en">
        {sound.examples.map((ex) => (
          <Example key={ex.form ?? ex.word} example={ex} lookup={lookup} />
        ))}
      </ul>
      {sound.pair && (
        <p className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Dễ nhầm:</span>
          {sound.pair.map(({ word, ipa }, i) => (
            <span key={word} className="inline-flex items-center gap-1" lang="en">
              {i > 0 && <span className="text-muted-foreground">↔</span>}
              <ListenButton text={word} label={`Nghe "${word}"`} size="sm" />
              <span className="font-medium">{word}</span>
              <span className="text-xs text-muted-foreground">/{ipa}/</span>
            </span>
          ))}
        </p>
      )}
    </li>
  )
}

/** Bảng âm của đoạn Phát âm: từng âm có IPA, mẹo khẩu hình, từ ví dụ NGSL (IPA + nút nghe) và cặp dễ nhầm. */
export function SoundTable({ content }: { content: PronunciationContent }) {
  const state = useWords()
  const words = state.status === 'ready' ? state.words : null
  const byWord = useMemo(() => {
    const map = new Map<string, StudyWord>()
    for (const w of words ?? []) if (w.list === 'ngsl' && hasDetails(w)) map.set(w.word, w)
    return map
  }, [words])
  const lookup: Lookup = (word) => byWord.get(word)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{content.intro}</p>
      {state.status === 'error' && (
        <p className="text-xs text-muted-foreground">
          Chưa tải được IPA của từ ví dụ.{' '}
          <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={state.retry}>
            Thử lại
          </button>
        </p>
      )}
      {content.groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <h3 className="font-semibold">{group.title}</h3>
          {group.note && <p className="text-xs text-muted-foreground">{group.note}</p>}
          <ul className="flex flex-col gap-2">
            {group.sounds.map((sound) => (
              <SoundItem key={sound.id} sound={sound} lookup={lookup} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
