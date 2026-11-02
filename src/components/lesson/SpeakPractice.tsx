import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'

import { usePronunciation } from '@/app/store-context'
import { ListenButton } from '@/components/ListenButton'
import { Button } from '@/components/ui/button'
import type { PracticeSentence } from '@/data/lessons'
import type { SpeakOutcome } from '@/lib/pronunciation'
import { stopSpeaking } from '@/lib/speech'
import { canRecognize, RECOGNITION_MESSAGES, recognizeOnce } from '@/lib/speech-recognition'
import { cn } from '@/lib/utils'

/** Kết quả hiện dưới câu: chỉ hai loại này (huỷ thì xoá, không hỗ trợ thì ẩn cả phần nói). */
type Shown = Extract<SpeakOutcome, { kind: 'result' } | { kind: 'error' }>

function Result({ outcome }: { outcome: Shown }) {
  if (outcome.kind === 'error') {
    return (
      <p role="alert" className="text-sm text-destructive">
        {outcome.message}
      </p>
    )
  }
  const { comparison } = outcome
  return (
    <div className="flex flex-col gap-1 text-sm" role="status">
      <p className="flex flex-wrap gap-x-1.5" lang="en" aria-label="Từ khớp và từ lệch">
        {comparison.words.map((w, i) => (
          <span
            key={i}
            className={cn(w.ok ? 'text-foreground' : 'font-semibold text-destructive underline decoration-wavy')}
            title={w.ok ? undefined : 'Thiếu hoặc lệch'}
          >
            {w.text}
          </span>
        ))}
      </p>
      <p>
        <span className={cn('font-semibold', comparison.score >= 70 ? 'text-primary' : 'text-destructive')}>
          {comparison.score}% đúng
        </span>
        <span className="text-muted-foreground"> · nghe được: “{comparison.heard}”</span>
      </p>
      <p className="text-xs text-muted-foreground">
        % là mức máy hiểu đúng từng từ, không đo chính xác từng âm.
      </p>
    </div>
  )
}

function SentenceRow({
  sentence,
  best,
  attempts,
  canSpeakNow,
  busy,
  listening,
  outcome,
  onSpeak,
  onStop,
}: {
  sentence: PracticeSentence
  best: number | null
  attempts: number
  canSpeakNow: boolean
  /** Micro đang nghe (câu nào cũng vậy): tắt nút nghe để micro không thu giọng máy. */
  busy: boolean
  listening: boolean
  outcome: Shown | undefined
  onSpeak: () => void
  onStop: () => void
}) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-start gap-2">
        <ListenButton text={sentence.text} label={`Nghe mẫu: ${sentence.text}`} rate={0.85} disabled={busy} />
        <div className="min-w-0 flex-1">
          <p className="font-medium break-words" lang="en">
            {sentence.text}
          </p>
          <p className="text-xs text-muted-foreground">{sentence.vi}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {canSpeakNow &&
          (listening ? (
            <Button type="button" size="sm" variant="outline" onClick={onStop}>
              <Square aria-hidden="true" />
              Đang nghe… bấm để dừng
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={onSpeak}>
              <Mic aria-hidden="true" />
              {outcome ? 'Nói lại' : 'Bấm và nói'}
            </Button>
          ))}
        {best !== null && (
          <span className="text-xs text-muted-foreground">
            Tốt nhất {best}% · {attempts} lần
          </span>
        )}
      </div>
      {outcome && <Result outcome={outcome} />}
    </li>
  )
}

/**
 * Luyện nói câu mẫu: nghe mẫu (TTS en-US), bấm nói, trình duyệt nhận dạng và app so từng từ.
 * Logic lưu điểm / lỗi / huỷ nằm ở `applyRecognition` (hàm thuần). Không có nhận giọng nói thì ẩn nút nói, giữ nút nghe.
 */
export function SpeakPractice({
  sentences,
  title = 'Luyện nói câu mẫu',
  onListeningChange,
}: {
  sentences: readonly PracticeSentence[]
  title?: string
  /** Báo micro bắt đầu / thôi nghe (vd để khối shadowing tắt nút "Nghe cả đoạn"). */
  onListeningChange?: (listening: boolean) => void
}) {
  const { items, apply } = usePronunciation()
  const [supported, setSupported] = useState(() => canRecognize())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [outcomes, setOutcomes] = useState<Record<string, Shown>>({})
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => onListeningChange?.(activeId !== null), [activeId, onListeningChange])

  async function speakSentence(sentence: PracticeSentence) {
    controller.current?.abort()
    stopSpeaking()
    const ctrl = new AbortController()
    controller.current = ctrl
    setActiveId(sentence.id)
    const result = await recognizeOnce({ lang: 'en-US', signal: ctrl.signal })
    // Lượt cũ bị thay bằng câu khác thì không đụng tới trạng thái "đang nghe" của lượt mới.
    if (controller.current === ctrl) {
      controller.current = null
      setActiveId(null)
    }
    const outcome = apply(sentence, result)
    if (outcome.kind === 'unsupported') {
      setSupported(false)
      return
    }
    setOutcomes((o) => {
      const next = { ...o }
      if (outcome.kind === 'aborted') delete next[sentence.id]
      else next[sentence.id] = outcome
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{title}</h3>
      {supported ? (
        <p className="text-xs text-muted-foreground">
          Nghe mẫu, rồi bấm nói. Từ thiếu hoặc lệch sẽ tô đỏ. App chỉ lưu điểm; âm thanh do dịch vụ nhận giọng nói
          của trình duyệt xử lý (Chrome gửi lên máy chủ Google).
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MicOff className="size-3.5" aria-hidden="true" />
          {RECOGNITION_MESSAGES.unsupported}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {sentences.map((s) => (
          <SentenceRow
            key={s.id}
            sentence={s}
            best={items[s.id]?.best ?? null}
            attempts={items[s.id]?.attempts ?? 0}
            canSpeakNow={supported}
            busy={activeId !== null}
            listening={activeId === s.id}
            outcome={outcomes[s.id]}
            onSpeak={() => void speakSentence(s)}
            onStop={() => controller.current?.abort()}
          />
        ))}
      </ul>
    </div>
  )
}
