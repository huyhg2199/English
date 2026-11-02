import { useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeft, Download, FileUp, HardDriveDownload, RotateCcw } from 'lucide-react'
import { Link } from 'react-router'

import { useBackup, useLoadedStore } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  backupFileName,
  MAX_BACKUP_BYTES,
  TOO_LARGE_MESSAGE,
  parseBackup,
  serializeBackup,
  shareOrDownload,
  summarizeBackup,
  type Backup as BackupFile,
} from '@/lib/backup'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ExportCard() {
  const { exportBackup } = useBackup()
  const { status: loadStatus } = useLoadedStore()
  // Dữ liệu trên máy hỏng / không nâng cấp được: app đang chạy bằng store trống, xuất ra sẽ là file rỗng trông như thật.
  const unreadable = loadStatus === 'corrupt' || loadStatus === 'migration-failed'
  const [status, setStatus] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function onExport() {
    setBusy(true)
    setStatus(null)
    try {
      const now = new Date()
      const result = await shareOrDownload(backupFileName(now), serializeBackup(exportBackup(now)))
      if (result === 'downloaded') setStatus({ tone: 'ok', text: 'Đã tải file sao lưu về máy.' })
      else if (result === 'fallback') setStatus({ tone: 'ok', text: 'Đã thử tải file; nếu không thấy file, bấm Xuất lại.' })
      else if (result === 'shared') setStatus({ tone: 'ok', text: 'Đã gửi file sao lưu.' })
    } catch {
      setStatus({ tone: 'error', text: 'Không xuất được file. Thử lại nhé.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="size-5 text-primary" aria-hidden="true" />
          <h2>Xuất file</h2>
        </CardTitle>
        <CardDescription>
          File JSON chứa tiến độ, flashcard, nhật ký buổi học, từ đã lưu, Mũ Phân Loại và điểm luyện nói. Không bao giờ có
          API key hay token. Trên iPhone, chọn "Lưu vào Tệp".
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {unreadable && (
          <p role="alert" className="text-sm text-destructive">
            Không đọc được dữ liệu học đã lưu trên máy nên chưa xuất file được (file sẽ trống). Dữ liệu cũ vẫn được
            giữ nguyên; bạn vẫn khôi phục từ file được.
          </p>
        )}
        <Button onClick={() => void onExport()} disabled={busy || unreadable}>
          <HardDriveDownload aria-hidden="true" />
          Xuất file
        </Button>
        {status && (
          <p role="status" className={status.tone === 'error' ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
            {status.text}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

type RestoreState =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; fileName: string; backup: BackupFile }
  | { kind: 'done'; added: number; updated: number; saved: boolean }

function RestoreCard() {
  const { restore } = useBackup()
  const [state, setState] = useState<RestoreState>({ kind: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_BACKUP_BYTES) {
      setState({ kind: 'error', message: TOO_LARGE_MESSAGE })
      return
    }
    let text: string
    try {
      text = await file.text()
    } catch {
      setState({ kind: 'error', message: 'Không đọc được file. Thử chọn lại nhé.' })
      return
    }
    const parsed = parseBackup(text)
    setState(parsed.ok ? { kind: 'ready', fileName: file.name, backup: parsed.backup } : { kind: 'error', message: parsed.message })
  }

  function onRestore(backup: BackupFile) {
    setState({ kind: 'done', ...restore(backup) })
  }

  const summary = state.kind === 'ready' ? summarizeBackup(state.backup) : null

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RotateCcw className="size-5 text-primary" aria-hidden="true" />
          <h2>Khôi phục từ file</h2>
        </CardTitle>
        <CardDescription>
          Dữ liệu trong file được gộp vào máy: mục nào sửa gần đây hơn thì giữ, không mất tiến độ đang có.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => void onFile(e)}
        />
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          <FileUp aria-hidden="true" />
          Chọn file sao lưu
        </Button>

        {state.kind === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}

        {state.kind === 'ready' && summary && (
          <div className="flex flex-col gap-3 rounded-lg border border-primary/50 bg-accent/30 p-3 text-sm">
            <p className="break-all font-medium">{state.fileName}</p>
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
              <dt className="text-muted-foreground">Ngày xuất</dt>
              <dd className="text-right">{formatDate(summary.exportedAt)}</dd>
              <dt className="text-muted-foreground">Bài đã xong</dt>
              <dd className="text-right">{summary.lessonsDone}</dd>
              <dt className="text-muted-foreground">Thẻ flashcard</dt>
              <dd className="text-right">{summary.cards}</dd>
              <dt className="text-muted-foreground">Ngày đã học</dt>
              <dd className="text-right">{summary.studyDays}</dd>
              <dt className="text-muted-foreground">Từ đã lưu</dt>
              <dd className="text-right">{summary.savedWords}</dd>
              <dt className="text-muted-foreground">Lần đội Mũ Phân Loại</dt>
              <dd className="text-right">{summary.placementAttempts}</dd>
              <dt className="text-muted-foreground">Câu luyện nói</dt>
              <dd className="text-right">{summary.pronunciationItems}</dd>
              <dt className="text-muted-foreground">Ghi chú</dt>
              <dd className="text-right">{summary.notes}</dd>
              <dt className="text-muted-foreground">Lần làm test</dt>
              <dd className="text-right">{summary.quizAttempts}</dd>
              <dt className="text-muted-foreground">Câu trong Sổ lỗi</dt>
              <dd className="text-right">{summary.mistakes}</dd>
              <dt className="text-muted-foreground">Video đã luyện điền từ</dt>
              <dd className="text-right">{summary.videoPracticeItems}</dd>
            </dl>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => onRestore(state.backup)}>
                Khôi phục
              </Button>
              <Button variant="outline" onClick={() => setState({ kind: 'idle' })}>
                Huỷ
              </Button>
            </div>
          </div>
        )}

        {state.kind === 'done' && (
          <p role="status" className={state.saved ? 'text-sm text-muted-foreground' : 'text-sm text-destructive'}>
            {state.added === 0 && state.updated === 0
              ? 'Máy đã có đủ dữ liệu trong file, không cần thêm gì.'
              : `Đã thêm ${state.added} mục, cập nhật ${state.updated} mục.`}
            {!state.saved && (state.added > 0 || state.updated > 0) && ' Nhưng chưa lưu được vào bộ nhớ máy (bộ nhớ bị chặn hoặc app đang chỉ đọc).'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/** Sao lưu / khôi phục dữ liệu học bằng file JSON (CAP-22). */
export function Backup() {
  return (
    <section className="flex flex-col gap-6">
      <Link
        to="/practice"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Luyện tập
      </Link>
      <header className="flex items-center gap-3">
        <HardDriveDownload className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Sao lưu dữ liệu</h1>
      </header>
      <ExportCard />
      <RestoreCard />
    </section>
  )
}
