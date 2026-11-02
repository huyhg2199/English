import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Loader2, RotateCcw } from 'lucide-react'

import { useVideoPractice } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { loadSubs } from '@/data/subs'
import type { LessonVideo } from '@/data/videos'
import { cueAt, fillDue, highlightReason, pickBlanks, shouldRecordRun, subLessonContext, type SubFile } from '@/lib/subs'
import { cn } from '@/lib/utils'
import { attachPlayer, YT_STATE, type PlayerHandle } from '@/lib/youtube-player'

import { FillInPrompt } from './FillInPrompt'
import { SubtitleLines, type SubMode } from './SubtitleLines'
import { TranscriptList } from './TranscriptList'

/** Đọc thời gian phát ~4 lần/giây. */
export const POLL_MS = 250

const MODES: readonly { id: SubMode; label: string }[] = [
  { id: 'both', label: 'Anh + Việt' },
  { id: 'en', label: 'Chỉ Anh' },
  { id: 'off', label: 'Ẩn sub' },
  { id: 'fill', label: 'Điền từ' },
]

/** `known`: từ đã học chụp lại lúc tải sub, để ô trống và câu tô không đổi giữa chừng (vd khi đồng bộ kéo thẻ SRS về). */
type SubsState = { status: 'loading' } | { status: 'ready'; file: SubFile; known: ReadonlySet<string> } | { status: 'error' }
type PlayerState = { status: 'connecting' } | { status: 'ready'; player: PlayerHandle } | { status: 'failed' }

/**
 * Phụ đề song ngữ cho một video VOA (story 16), hiện dưới iframe khi video đã được bấm phát.
 * Sub tải lười; player gắn qua IFrame API vào iframe có sẵn. Sub lỗi / API lỗi thì video vẫn xem được, chỉ báo lỗi.
 * Chế độ "Điền từ": hết câu có từ ẩn thì dừng video, gõ từ thiếu; kết quả lưu khi video hết, khi đổi chế độ, khi rời
 * trang, ẩn app hoặc đóng app (best = max, attempts + 1), chỉ khi lượt đủ dài (`shouldRecordRun`).
 */
export default function SubtitledVideo({
  video,
  iframe,
  onRetryPlayer,
}: {
  video: LessonVideo
  iframe: RefObject<HTMLIFrameElement | null>
  /** Dựng lại iframe để gắn player mới (VideoEmbed đổi key). */
  onRetryPlayer: () => void
}) {
  const { knownWords, items, record } = useVideoPractice()
  const knownRef = useRef(knownWords)
  useEffect(() => {
    knownRef.current = knownWords
  }, [knownWords])
  const lesson = useMemo(() => subLessonContext(video.lessonId), [video.lessonId])

  const [attempt, setAttempt] = useState(0)
  const [subs, setSubs] = useState<SubsState>({ status: 'loading' })
  useEffect(() => {
    let alive = true
    loadSubs(video.id).then(
      (file) => alive && setSubs({ status: 'ready', file, known: knownRef.current }),
      () => alive && setSubs({ status: 'error' }),
    )
    return () => {
      alive = false
    }
  }, [video.id, attempt])

  const [mode, setModeState] = useState<SubMode>('both')
  const modeRef = useRef(mode)
  const [time, setTime] = useState<number | null>(null)
  const [prompt, setPrompt] = useState<number | null>(null)
  const promptRef = useRef<number | null>(null)
  const asked = useRef(new Set<number>())
  const queue = useRef<number[]>([])
  const cursor = useRef(0)
  const run = useRef({ correct: 0, total: 0 })
  const prevT = useRef<number | null>(null)
  const prevWall = useRef(0)
  /** Video hết khi đang mở ô điền: ghi lượt sau khi câu đó được trả lời / bỏ qua. */
  const flushAfterAnswer = useRef(false)

  const cues = subs.status === 'ready' ? subs.file.cues : null
  const known = subs.status === 'ready' ? subs.known : null
  // Từ ẩn và lý do tô tính một lần mỗi lần tải sub, theo từ đã học chụp lúc đó (không đổi khi đang xem).
  const blanks = useMemo(() => (cues && known ? cues.map((c) => pickBlanks(c, known, lesson.words)) : []), [cues, known, lesson.words])
  const reasons = useMemo(() => (cues && known ? cues.map((c) => highlightReason(c, lesson, known)) : []), [cues, known, lesson])
  const blankCues = useMemo(() => blanks.filter((b) => b.length > 0).length, [blanks])
  const blanksRef = useRef(blanks)
  useEffect(() => {
    blanksRef.current = blanks
  }, [blanks])

  /** Ghi lượt điền từ đang dở (chỉ khi đủ dài) rồi bắt đầu lượt mới. */
  const flush = useCallback(() => {
    const { correct, total } = run.current
    if (shouldRecordRun(total, blankCues)) record(video.id, correct, total)
    run.current = { correct: 0, total: 0 }
    asked.current = new Set()
    flushAfterAnswer.current = false
  }, [record, video.id, blankCues])
  const flushRef = useRef(flush)
  useEffect(() => {
    flushRef.current = flush
  }, [flush])

  const [player, setPlayer] = useState<PlayerState>({ status: 'connecting' })
  useEffect(() => {
    const el = iframe.current
    let alive = true
    // Không destroy player khi gỡ: iframe là của VideoEmbed (destroy sẽ gỡ luôn iframe khỏi trang).
    const attached = el
      ? attachPlayer(el, (state) => {
          if (state !== YT_STATE.ended || modeRef.current !== 'fill') return
          if (promptRef.current !== null || queue.current.length > 0) flushAfterAnswer.current = true
          else flushRef.current()
        })
      : { ready: Promise.resolve(null), off: () => {} }
    attached.ready.then((h) => {
      if (alive) setPlayer(h ? { status: 'ready', player: h } : { status: 'failed' })
    })
    return () => {
      alive = false
      attached.off()
    }
  }, [iframe])

  const playerHandle = player.status === 'ready' ? player.player : null
  useEffect(() => {
    if (!playerHandle || !cues) return
    const timer = setInterval(() => {
      const t = playerHandle.getCurrentTime()
      const wall = performance.now()
      const elapsed = (wall - prevWall.current) / 1000
      prevWall.current = wall
      setTime(t)
      const r = fillDue(cues, (i) => (blanksRef.current[i]?.length ?? 0) > 0, prevT.current, t, elapsed, cursor.current, asked.current)
      cursor.current = r.cursor
      if (modeRef.current === 'fill') {
        for (const i of r.due) {
          asked.current.add(i)
          queue.current.push(i)
        }
        if (promptRef.current === null && queue.current.length > 0) {
          playerHandle.pause()
          const next = queue.current.shift()!
          promptRef.current = next
          setPrompt(next)
        }
      }
      if (t !== null) prevT.current = t
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [playerHandle, cues])

  // Rời trang / ẩn app (iOS PWA thường không có pagehide) / đóng app khi đang điền từ: vẫn lưu lượt đang dở.
  useEffect(() => {
    const onHide = () => {
      if (modeRef.current === 'fill') flushRef.current()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') onHide()
    }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVisibility)
      onHide()
    }
  }, [])

  function setMode(next: SubMode) {
    if (next === modeRef.current) return
    if (modeRef.current === 'fill') flush()
    queue.current = []
    if (promptRef.current !== null) {
      promptRef.current = null
      setPrompt(null)
      playerHandle?.play()
    }
    modeRef.current = next
    setModeState(next)
  }

  const resume = useCallback(() => {
    // Còn câu xếp hàng (lần đọc trễ / hai câu ngắn) thì hỏi tiếp, chưa phát.
    const next = queue.current.shift()
    if (next !== undefined) {
      promptRef.current = next
      setPrompt(next)
      return
    }
    promptRef.current = null
    setPrompt(null)
    playerHandle?.play()
  }, [playerHandle])

  const answer = useCallback((correct: boolean) => {
    run.current = { correct: run.current.correct + (correct ? 1 : 0), total: run.current.total + 1 }
    if (flushAfterAnswer.current && queue.current.length === 0) flushRef.current()
  }, [])

  const seek = useCallback(
    (i: number) => {
      if (!playerHandle || !cues) return
      playerHandle.seekTo(cues[i].start)
      playerHandle.play()
      prevT.current = null
      setTime(cues[i].start)
    },
    [playerHandle, cues],
  )

  if (subs.status === 'loading') {
    return (
      <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        Đang tải phụ đề…
      </p>
    )
  }
  if (subs.status === 'error') {
    return (
      <div role="status" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Chưa tải được phụ đề. Video vẫn xem bình thường.
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setSubs({ status: 'loading' })
            setAttempt((n) => n + 1)
          }}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Thử lại
        </Button>
      </div>
    )
  }

  const file = subs.file
  const active = cueAt(file.cues, time)
  const shown = prompt ?? active
  const best = items[video.id]
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label="Chế độ phụ đề" className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            disabled={m.id === 'fill' && !playerHandle}
            onClick={() => setMode(m.id)}
            className={cn(
              'min-h-9 rounded-md px-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50',
              mode === m.id ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {player.status === 'connecting' && (
        <p role="status" className="text-xs text-muted-foreground">
          Đang kết nối trình phát để chạy phụ đề… ("Điền từ" mở khi kết nối xong.)
        </p>
      )}
      {player.status === 'failed' && (
        <div role="status" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            Trình phát không phản hồi nên phụ đề chưa chạy theo video được và chưa điền từ được. Video vẫn xem bình
            thường; transcript ở dưới.
          </span>
          <Button type="button" size="sm" variant="outline" onClick={onRetryPlayer}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Thử lại
          </Button>
        </div>
      )}

      {player.status !== 'failed' && prompt === null && (
        <SubtitleLines
          cue={shown >= 0 ? file.cues[shown] : null}
          mode={mode}
          blanks={shown >= 0 ? blanks[shown] : []}
          reason={shown >= 0 ? reasons[shown] : null}
        />
      )}

      {mode === 'fill' && prompt !== null && (
        <FillInPrompt key={prompt} cue={file.cues[prompt]} blanks={blanks[prompt]} onAnswer={answer} onContinue={resume} />
      )}
      {mode === 'fill' && (
        <p className="text-xs text-muted-foreground">
          Hết mỗi câu có ô trống, video sẽ dừng để bạn gõ từ còn thiếu.
          {best ? ` Tốt nhất: ${best.best}% · ${best.attempts} lượt.` : ''}
        </p>
      )}

      {(mode === 'both' || mode === 'en') && (
        <TranscriptList
          cues={file.cues}
          active={active}
          showVi={mode === 'both'}
          reasons={reasons}
          onSeek={playerHandle ? seek : null}
        />
      )}
      <p className="text-[11px] text-muted-foreground">
        Phụ đề Anh: caption {file.source.captionKind === 'asr' ? 'tự động' : 'do kênh đăng'} của {file.source.channel} ({file.source.license}).
        Bản dịch và chú thích do AI làm.
      </p>
    </div>
  )
}
