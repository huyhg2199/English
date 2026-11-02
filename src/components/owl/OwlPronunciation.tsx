import { useEffect, useRef, useState } from 'react'
import { Check, Mic, MicOff, Square, X } from 'lucide-react'

import { ListenButton } from '@/components/ListenButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { matchHeardWord, OWL_SAY_TRIES, OWL_SELF_NO, OWL_SELF_OK, type OwlWord } from '@/lib/owl'
import type { AttemptAnswer } from '@/lib/quiz'
import { stopSpeaking } from '@/lib/speech'
import { canRecognize, RECOGNITION_MESSAGES, recognizeOnce } from '@/lib/speech-recognition'
import { cn } from '@/lib/utils'

type Mode = 'stt' | 'self'

type Props = {
  words: readonly OwlWord[]
  onDone: (answers: AttemptAnswer[], selfGraded: boolean) => void
}

/** Lỗi micro không tự hết (không được phép, không có micro, không hỗ trợ): chuyển hẳn sang tự chấm. */
const MIC_FAILURES = new Set(['not-allowed', 'audio-capture', 'unsupported'])

/**
 * Phần phát âm O.W.L.: mỗi câu chỉ hiện IPA, Huy đọc, app nhận giọng nói (en-US) và đúng khi nghe ra đúng từ
 * (tối đa 2 lần nói). Không có nhận giọng nói hoặc micro lỗi thì tự chấm: hiện từ + nút nghe mẫu.
 */
export function OwlPronunciation({ words, onDone }: Props) {
  const [mode, setMode] = useState<Mode>(() => (canRecognize() ? 'stt' : 'self'))
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<AttemptAnswer[]>([])
  const [selfGraded, setSelfGraded] = useState(() => !canRecognize())
  const [listening, setListening] = useState(false)
  const [tries, setTries] = useState(0)
  const [heard, setHeard] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [result, setResult] = useState<AttemptAnswer | null>(null)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => controller.current?.abort(), [])

  const word = words[index]
  const last = index === words.length - 1

  const next = (answer: AttemptAnswer, usedSelf: boolean) => {
    const all = [...answers, answer]
    const self = selfGraded || usedSelf
    if (last) {
      onDone(all, self)
      return
    }
    setAnswers(all)
    setSelfGraded(self)
    setIndex((i) => i + 1)
    setTries(0)
    setHeard(null)
    setResult(null)
    setMessage(null)
    window.scrollTo(0, 0)
  }

  async function listen() {
    controller.current?.abort()
    stopSpeaking()
    const ctrl = new AbortController()
    controller.current = ctrl
    setListening(true)
    setMessage(null)
    const r = await recognizeOnce({ lang: 'en-US', signal: ctrl.signal })
    if (controller.current === ctrl) {
      controller.current = null
      setListening(false)
    }
    if (!r.ok) {
      if (r.error === 'aborted') return
      if (MIC_FAILURES.has(r.error)) {
        setMode('self')
        setMessage(`${r.message} Chuyển sang tự chấm cho các câu còn lại.`)
        return
      }
      setMessage(r.message)
      return
    }
    // Lưu và hiện đúng phương án đã khớp (không phải luôn phương án đầu).
    const matched = matchHeardWord(word.word, r.transcripts)
    const shown = matched ?? r.transcripts[0]
    const used = tries + 1
    setTries(used)
    setHeard(shown)
    if (matched !== null || used >= OWL_SAY_TRIES) {
      setResult({ questionId: word.id, chosen: shown, correct: matched !== null })
    } else {
      setMessage(`App nghe ra “${r.transcripts[0]}”. Thử lại lần nữa nhé (còn ${OWL_SAY_TRIES - used} lần).`)
    }
  }

  const showWord = mode === 'self' || result !== null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {mode === 'stt'
          ? 'Mỗi câu chỉ hiện IPA. Bấm nói rồi đọc to từ đó; app đúng khi nghe ra đúng từ (2 lần nói mỗi từ).'
          : canRecognize()
            ? 'Đang tự chấm: đọc to theo IPA, nghe mẫu để so, rồi tự chấm thật lòng.'
            : 'Trình duyệt này không nhận được giọng nói nên bạn tự chấm: đọc theo IPA, nghe mẫu, rồi chấm.'}
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Tiến độ phần phát âm"
        aria-valuemin={0}
        aria-valuemax={words.length}
        aria-valuenow={index}
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${(index / words.length) * 100}%` }} />
      </div>
      <Card className={cn('gap-4', result?.correct && 'lumos border-primary')}>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm text-muted-foreground">
              Từ {index + 1}/{words.length}
            </CardTitle>
            <span className="text-xs text-muted-foreground">{mode === 'stt' ? 'Đọc theo IPA' : 'Tự chấm'}</span>
          </div>
          <p className="text-center text-3xl break-words" lang="en" aria-label={`IPA ${word.ipa}`}>
            /{word.ipa}/
          </p>
          {showWord && (
            <p className="flex items-center justify-center gap-2 text-center text-xl font-semibold break-words" lang="en">
              {word.word}
              <ListenButton text={word.word} label={`Nghe mẫu: ${word.word}`} />
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {message && (
            <p role="status" className="text-sm text-muted-foreground">
              {message}
            </p>
          )}

          {mode === 'stt' && result === null && (
            <>
              {listening ? (
                <Button variant="outline" onClick={() => controller.current?.abort()}>
                  <Square aria-hidden="true" />
                  Đang nghe… bấm để dừng
                </Button>
              ) : (
                <Button onClick={() => void listen()}>
                  <Mic aria-hidden="true" />
                  {tries > 0 ? 'Đọc lại' : 'Bấm rồi đọc to từ này'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                disabled={listening}
                onClick={() => {
                  setMode('self')
                  setMessage(null)
                }}
              >
                <MicOff aria-hidden="true" />
                Micro không ổn? Chuyển sang tự chấm
              </Button>
            </>
          )}

          {mode === 'stt' && result !== null && (
            <div role="status" className="flex flex-col gap-2 text-sm">
              <p className={cn('font-semibold', result.correct ? 'text-primary' : 'text-destructive')}>
                {result.correct ? 'Lumos! Đọc đúng rồi.' : 'Chưa đúng lần này, từ này sẽ vào Sổ lỗi để ôn.'}
              </p>
              {heard && (
                <p className="break-words text-muted-foreground">
                  App nghe ra: <span lang="en">“{heard}”</span>
                </p>
              )}
              <Button onClick={() => next(result, false)}>{last ? 'Sang phần thì' : 'Từ tiếp'}</Button>
              {!result.correct && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  onClick={() => next({ questionId: word.id, chosen: OWL_SELF_OK, correct: true }, true)}
                >
                  <Check aria-hidden="true" />
                  Mình đọc đúng mà (tự chấm)
                </Button>
              )}
            </div>
          )}

          {mode === 'self' && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Đọc to theo IPA, bấm nghe mẫu để so, rồi tự chấm thật lòng nhé.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => next({ questionId: word.id, chosen: OWL_SELF_OK, correct: true }, true)}>
                  <Check aria-hidden="true" />
                  Mình đọc đúng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => next({ questionId: word.id, chosen: OWL_SELF_NO, correct: false }, true)}
                >
                  <X aria-hidden="true" />
                  Chưa đúng
                </Button>
              </div>
              {!canRecognize() && (
                <p className="text-xs text-muted-foreground">{RECOGNITION_MESSAGES.unsupported} Nên dùng tự chấm.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Rời trang giữa chừng thì lần thi này không được lưu.</p>
    </div>
  )
}
