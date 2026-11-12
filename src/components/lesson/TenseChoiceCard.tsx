import { ListenButton } from '@/components/ListenButton'
import { ReadableText } from '@/components/ReadableText'
import type { MinimalPair, TenseChoice } from '@/data/lessons'
import { choiceSides } from '@/lib/tense-choice'

import { SignalWords } from './SignalWords'
import { TenseTimeline } from './TenseTimeline'
import { GlossaryText } from './TermChip'

/** Một câu tiếng Anh có nút nghe, chữ bấm tra được và dòng dịch. */
function Sentence({ en, vi }: { en: string; vi: string }) {
  return (
    <div className="flex items-start gap-2">
      <ListenButton text={en} label={`Nghe: ${en}`} size="sm" />
      <div className="min-w-0">
        <ReadableText text={en} className="leading-relaxed break-words" />
        <p className="text-xs text-muted-foreground">{vi}</p>
      </div>
    </div>
  )
}

/**
 * Danh sách cặp câu dễ nhầm (story 39): mỗi cặp hai câu có nút nghe và ghi chú vì sao. Dùng ở thẻ khối "Chọn thì" và ở cặp
 * câu "So với thì trước" của ngày 4 Ngữ pháp (story 47).
 */
export function MinimalPairList({ pairs, title = 'Cặp câu dễ nhầm' }: { pairs: readonly MinimalPair[]; title?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-semibold">{title}</h4>
      <ul className="flex flex-col gap-2 text-sm">
        {pairs.map((p) => (
          <li key={`${p.a.en}|${p.b.en}`} className="flex flex-col gap-2 rounded-lg border p-2">
            <Sentence en={p.a.en} vi={p.a.vi} />
            <Sentence en={p.b.en} vi={p.b.vi} />
            <p className="text-xs text-muted-foreground">
              <GlossaryText text={p.noteVi} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Thẻ khối "Chọn thì" (story 39). Khối so sánh: hai bên (dòng thời gian, "Dùng khi", chip tín hiệu, câu ví dụ) xếp chồng
 * dưới 640px, cạnh nhau từ `sm`. Khối "Đừng dịch từng chữ": mỗi chữ Việt một ô, liệt kê cách nói tiếng Anh. Sau đó là
 * cặp câu dễ nhầm và 3 quy tắc chọn. Lời Việt có chip thuật ngữ; câu tiếng Anh không có chip.
 */
export function TenseChoiceCard({ choice }: { choice: TenseChoice }) {
  const sides = choiceSides(choice)
  return (
    <article className="flex flex-col gap-4">
      <header>
        <h3 className="text-lg font-semibold">{choice.name}</h3>
        <p className="text-sm text-muted-foreground">
          <GlossaryText text={choice.use} />
        </p>
      </header>

      {sides.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sides.map(({ tense, whenVi, example }) => (
            <section key={tense.id} className="flex min-w-0 flex-col gap-3 rounded-lg border p-3" aria-label={tense.name}>
              <h4 className="font-semibold break-words">{tense.name}</h4>
              {tense.timeline && <TenseTimeline kind={tense.timeline.kind} label={tense.timeline.label} />}
              <p className="text-sm">
                <span className="font-semibold">Dùng khi:</span> <GlossaryText text={whenVi} />
              </p>
              {tense.signalWords && tense.signalWords.length > 0 && <SignalWords words={tense.signalWords} heading={false} />}
              <div className="text-sm">
                <Sentence en={example.en} vi={example.vi} />
              </div>
            </section>
          ))}
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Chip là từ hay đi với mỗi thì, chỉ để gợi ý: có từ đi được với cả hai thì. Chọn theo quy tắc bên dưới.
          </p>
        </div>
      )}

      {choice.viWords && choice.viWords.length > 0 && (
        <div className="flex flex-col gap-3">
          {choice.viWords.map((w) => (
            <section key={w.vi} className="flex min-w-0 flex-col gap-2 rounded-lg border p-3" aria-label={`Chữ “${w.vi}”`}>
              <h4 className="font-semibold">“{w.vi}”</h4>
              <ul className="flex flex-col gap-3 text-sm">
                {w.options.map((o, i) => (
                  <li key={`${o.en}-${i}`} className="flex flex-col gap-1">
                    <p className="break-words">
                      <span lang="en" className="font-semibold">
                        {o.en}
                      </span>{' '}
                      · <GlossaryText text={o.whenVi} />
                    </p>
                    <Sentence en={o.example.en} vi={o.example.vi} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <MinimalPairList pairs={choice.pairs} />

      <div className="flex flex-col gap-1">
        <h4 className="font-semibold">3 quy tắc chọn</h4>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {choice.rules.map((r) => (
            <li key={r} className="break-words">
              <GlossaryText text={r} />
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}
