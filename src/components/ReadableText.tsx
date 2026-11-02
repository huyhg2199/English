import { useContext, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { BookmarkPlus } from 'lucide-react'

import { useSavedWords } from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { Button } from '@/components/ui/button'
import { ReadingSourceContext } from '@/components/reading-source'
import {
  checkSelection,
  MAX_PHRASE_LENGTH,
  normalizeWord,
  savedWordId,
  savedWordsOn,
  sentenceFor,
  tokenize,
  type SavedWordSource,
} from '@/lib/saved-words'
import { cn } from '@/lib/utils'

type Pending = { phrase: string; sentence: string } | { tooLong: true }
/** Thông báo ở thanh nổi; `undoId` = mục vừa lưu (nút "Hoàn tác"). */
type Message = { text: string; undoId?: string }

const TOO_LONG_TEXT = `Đoạn chọn quá dài (tối đa ${MAX_PHRASE_LENGTH} ký tự). Chọn ngắn lại nhé.`

function shorten(phrase: string): string {
  return phrase.length > 40 ? `${phrase.slice(0, 40)}…` : phrase
}

/** Hiện nút nổi thêm chút sau khi vùng chọn mất (iOS bỏ chọn khi chạm nút). */
const HIDE_DELAY_MS = 400
const MESSAGE_MS = 4000
/** Chỉ một vùng đọc hiện thanh nổi một lúc (các thanh nằm cùng chỗ ở đáy màn hình). */
const FLOAT_EVENT = 'lumos:readable-float'

function claimFloat(id: string) {
  window.dispatchEvent(new CustomEvent(FLOAT_EVENT, { detail: id }))
}

type ReadableTextProps = {
  text: string
  /** Nguồn lưu kèm; không có thì lấy từ `ReadingSourceContext`. */
  source?: SavedWordSource
  className?: string
  as?: 'p' | 'span' | 'div'
  /** Gọi sau mỗi lần lưu (thời điểm lưu). */
  onSaved?: (at: Date) => void
}

/**
 * Vùng đọc dùng chung (story 8, CAP-18): chạm một từ để lưu vào Sổ tay kèm câu chứa nó và nguồn;
 * bôi đen một cụm/câu thì hiện nút nổi "Lưu vào Sổ tay" ở đáy màn hình (trên thanh điều hướng), không che vùng chọn.
 * Từ đã lưu hôm nay sáng lên.
 */
export function ReadableText({ text, source: sourceProp, className, as: Tag = 'p', onSaved }: ReadableTextProps) {
  const contextSource = useContext(ReadingSourceContext)
  const source = sourceProp ?? contextSource ?? { title: 'Lumos English', url: '/' }
  const { items, save, remove } = useSavedWords()
  const [now, setNow] = useNow()
  const sentences = useMemo(() => tokenize(text), [text])
  const savedSet = useMemo(() => new Set(savedWordsOn(items, now).map((w) => w.word)), [items, now])
  const ref = useRef<HTMLElement>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const id = useId()

  // Vùng đọc khác vừa hiện thanh nổi → ẩn thanh của vùng này.
  useEffect(() => {
    const onClaim = (e: Event) => {
      if ((e as CustomEvent<string>).detail === id) return
      setPending(null)
      setMessage(null)
    }
    window.addEventListener(FLOAT_EVENT, onClaim)
    return () => window.removeEventListener(FLOAT_EVENT, onClaim)
  }, [id])

  // Theo dõi vùng chọn: chỉ khi nằm trọn trong vùng đọc này.
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined
    const onChange = () => {
      const sel = document.getSelection()
      const el = ref.current
      const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null
      const selected = sel?.toString() ?? ''
      if (el && range && !sel!.isCollapsed && selected.trim() && el.contains(range.commonAncestorContainer)) {
        clearTimeout(hideTimer)
        claimFloat(id)
        setMessage(null)
        const check = checkSelection(selected)
        if (check.ok) setPending({ phrase: selected.replace(/\s+/g, ' ').trim(), sentence: sentenceFor(text, selected) })
        else if (check.reason === 'too-long') setPending({ tooLong: true })
        else setPending(null)
      } else {
        clearTimeout(hideTimer)
        hideTimer = setTimeout(() => setPending(null), HIDE_DELAY_MS)
      }
    }
    document.addEventListener('selectionchange', onChange)
    return () => {
      clearTimeout(hideTimer)
      document.removeEventListener('selectionchange', onChange)
    }
  }, [text, id])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), MESSAGE_MS)
    return () => clearTimeout(t)
  }, [message])

  /** Lưu (hoặc báo đã có hôm nay, không gọi `onSaved`) rồi hiện thông báo kèm "Hoàn tác". */
  function store(raw: string, sentence: string) {
    const at = new Date()
    const word = normalizeWord(raw)
    if (!word) return
    claimFloat(id)
    setNow(at)
    if (savedWordsOn(items, at).some((w) => w.word === word)) {
      setMessage({ text: `Đã có “${shorten(word)}” trong Sổ tay` })
      return
    }
    save({ word: raw, sentence, source }, at)
    onSaved?.(at)
    setMessage({ text: `Đã lưu “${shorten(word)}” vào Sổ tay`, undoId: savedWordId(word, at) })
  }

  function undo(undoId: string) {
    remove(undoId)
    setNow(new Date())
    setMessage({ text: 'Đã bỏ lưu' })
  }

  function tapWord(word: string, sentence: string) {
    // Đang bôi đen (vd nhấp đúp chọn chữ) thì để nút nổi xử lý.
    const sel = document.getSelection()
    if (sel && !sel.isCollapsed && sel.toString().trim()) return
    store(word, sentence)
  }

  function savePending() {
    if (!pending || 'tooLong' in pending) return
    store(pending.phrase, pending.sentence)
    setPending(null)
    document.getSelection()?.removeAllRanges()
  }

  const tooLong = pending !== null && 'tooLong' in pending
  const statusText = tooLong ? TOO_LONG_TEXT : (message?.text ?? '')

  function onKey(e: KeyboardEvent, word: string, sentence: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      tapWord(word, sentence)
    }
  }

  return (
    <>
      <Tag ref={ref as never} className={cn('leading-loose break-words', className)} lang="en">
        {sentences.map((sentence, si) => (
          <span key={si}>
            {si > 0 && ' '}
            {sentence.parts.map((part, pi) =>
              part.word ? (
                <span
                  key={pi}
                  role="button"
                  tabIndex={0}
                  onClick={() => tapWord(part.word!, sentence.text)}
                  onKeyDown={(e) => onKey(e, part.word!, sentence.text)}
                  aria-pressed={savedSet.has(part.word)}
                  className={cn(
                    '-mx-0.5 cursor-pointer rounded px-0.5 underline decoration-dotted decoration-muted-foreground/60 underline-offset-4 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
                    savedSet.has(part.word) &&
                      'bg-primary text-primary-foreground no-underline shadow-[0_0_10px_var(--candle-glow)] hover:bg-primary',
                  )}
                >
                  {part.text}
                </span>
              ) : (
                <span key={pi}>{part.text}</span>
              ),
            )}
          </span>
        ))}
      </Tag>
      {/* Thanh nổi qua portal (không lồng <div> trong <p>); vùng `role="status"` luôn mounted, chỉ đổi chữ. */}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
          style={{ bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom) + 0.75rem)' }}
        >
          <p role="status" aria-live="polite" className="sr-only">
            {statusText}
          </p>
          {tooLong ? (
            <p
              aria-hidden="true"
              className="pointer-events-auto max-w-sm rounded-full bg-destructive px-4 py-2 text-center text-sm text-white shadow-lg"
            >
              {TOO_LONG_TEXT}
            </p>
          ) : pending ? (
            <Button
              type="button"
              className="pointer-events-auto rounded-full shadow-lg shadow-[0_0_16px_var(--candle-glow)]"
              // Không để chạm nút làm mất vùng chọn trước khi bấm.
              onPointerDown={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={savePending}
            >
              <BookmarkPlus aria-hidden="true" />
              Lưu vào Sổ tay
            </Button>
          ) : message ? (
            <div className="pointer-events-auto flex max-w-sm min-w-0 items-center gap-2 rounded-full bg-secondary py-1 pr-1 pl-4 text-sm text-secondary-foreground shadow-lg">
              <span aria-hidden="true" className="min-w-0 truncate py-1">
                {message.text}
              </span>
              {message.undoId && (
                <Button type="button" size="sm" variant="ghost" className="shrink-0 rounded-full" onClick={() => undo(message.undoId!)}>
                  Hoàn tác
                </Button>
              )}
            </div>
          ) : null}
        </div>,
        document.body,
      )}
    </>
  )
}
