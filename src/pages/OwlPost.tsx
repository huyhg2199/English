import { useState, type FormEvent } from 'react'
import { ArrowLeft, Bell, CalendarPlus, Cloud, CloudUpload, Copy, Mail, Plus, RotateCcw, Unplug, X } from 'lucide-react'
import { Link } from 'react-router'

import { useBackup, useGist, useLoadedStore, useReminders } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { shareOrDownload } from '@/lib/backup'
import { gistErrorMessage, localDataBlocked, type ConnectResult, type GistWriterState } from '@/lib/gist'
import { buildIcs, ICS_FILE_NAME, MAX_REMINDER_TIMES, normalizeTimes, STATIC_ICS_PATH } from '@/lib/reminders'

const inputClass =
  'h-10 w-full min-w-0 rounded-md border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

const PAT_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=Lumos%20English%20Gist'
const GUIDE_URL = 'https://github.com/huyhg2199/English#owl-post-telegram-và-bản-sao-gist'

/** URL gốc của app (vd `https://huyhg2199.github.io/English/`). */
function appUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
}

type Note = { tone: 'ok' | 'error'; text: string } | null

function NoteLine({ note }: { note: Note }) {
  if (!note) return null
  return (
    <p role={note.tone === 'error' ? 'alert' : 'status'} className={note.tone === 'error' ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
      {note.text}
    </p>
  )
}

function connectError(r: Extract<ConnectResult, { ok: false }>): string {
  if (r.error.kind === 'storage') return 'Không lưu được PAT trên máy (bộ nhớ trình duyệt bị chặn).'
  if (r.error.kind === 'bad-id') return 'Gist id không đúng dạng (chuỗi chữ số và a–f trong link gist).'
  return gistErrorMessage(r.error)
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function statusText(state: GistWriterState): Note {
  if (state.phase === 'writing') return { tone: 'ok', text: 'Đang ghi lên Gist…' }
  if (state.phase === 'error' && state.error) return { tone: 'error', text: `Chưa ghi được: ${gistErrorMessage(state.error)}` }
  if (state.writtenAt) return { tone: 'ok', text: `Đã ghi lúc ${formatTime(state.writtenAt)}.` }
  return { tone: 'ok', text: 'Chưa ghi lần nào trên máy này.' }
}

/**
 * Form nhập PAT: lần đầu tạo secret gist; có gist id (máy thứ hai / thay PAT) thì nối vào gist đó, gộp bản sao về
 * rồi mới ghi. `requireId` (đang kết nối, "Thay PAT"): bắt buộc giữ gist id để không tạo gist mới làm lệch secret GIST_ID.
 */
function ConnectForm({ gistId, requireId = false, onDone }: { gistId: string | null; requireId?: boolean; onDone: (note: Note) => void }) {
  const { writer } = useGist()
  const [token, setToken] = useState('')
  const [existing, setExisting] = useState(gistId ?? '')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<Note>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!writer || !token.trim()) return
    if (requireId && existing.trim() === '') {
      setNote({
        tone: 'error',
        text: 'Đang kết nối gist nên cần giữ gist id. Muốn tạo gist mới thì bấm "Ngắt kết nối" trước (nhớ cập nhật secret GIST_ID sau đó).',
      })
      return
    }
    setBusy(true)
    setNote(null)
    const r = await writer.connect(token, existing)
    setBusy(false)
    if (!r.ok) {
      setNote({ tone: 'error', text: connectError(r) })
      return
    }
    setToken('')
    let text = r.created
      ? 'Đã tạo secret gist mới và ghi bản sao đầu tiên. Nhớ cập nhật secret GIST_ID trên GitHub bằng gist id ở trên.'
      : 'Đã nối vào gist có sẵn.'
    if (r.merged && r.merged.added + r.merged.updated > 0) {
      text += ` Đã gộp bản sao: thêm ${r.merged.added}, cập nhật ${r.merged.updated} mục.`
    }
    onDone({ tone: 'ok', text })
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span>PAT GitHub (classic, chỉ quyền gist)</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_…"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{requireId ? 'Gist id đang dùng (giữ nguyên)' : 'Gist id có sẵn (bỏ trống để tạo gist mới)'}</span>
        <input
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={existing}
          onChange={(e) => setExisting(e.target.value)}
          placeholder="Chỉ điền khi đã có gist ở máy khác"
          required={requireId}
          className={inputClass}
        />
      </label>
      <Button type="submit" disabled={busy || !writer || token.trim() === ''}>
        <Cloud aria-hidden="true" />
        {busy ? 'Đang kết nối…' : 'Kết nối'}
      </Button>
      <NoteLine note={note} />
    </form>
  )
}

function GistCard() {
  const { state, writer } = useGist()
  const { restore } = useBackup()
  const unreadable = localDataBlocked(useLoadedStore())
  const [note, setNote] = useState<Note>(null)
  const [busy, setBusy] = useState(false)
  const [changingPat, setChangingPat] = useState(false)
  const connected = state.phase !== 'off' && state.gistId !== null

  async function onRestore() {
    if (!writer) return
    setBusy(true)
    setNote(null)
    const r = await writer.readBackup()
    setBusy(false)
    if (!r.ok) {
      setNote({ tone: 'error', text: 'error' in r ? `Không khôi phục được: ${gistErrorMessage(r.error)}` : r.message })
      return
    }
    const counts = restore(r.backup)
    setNote({
      tone: counts.saved || counts.added + counts.updated === 0 ? 'ok' : 'error',
      text:
        counts.added + counts.updated === 0
          ? 'Máy đã có đủ dữ liệu trong bản sao, không cần thêm gì.'
          : `Đã gộp bản sao: thêm ${counts.added}, cập nhật ${counts.updated} mục.${counts.saved ? '' : ' Nhưng chưa lưu được vào bộ nhớ máy.'}`,
    })
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CloudUpload className="size-5 text-primary" aria-hidden="true" />
          <h2>Bản sao Gist tự động</h2>
        </CardTitle>
        <CardDescription>
          App tự ghi bản sao dữ liệu học (đúng file sao lưu, không có key/token) và trạng thái "hôm nay đã học chưa" lên
          một secret gist của bạn: ngay khi xong buổi và khi app xuống nền. PAT chỉ lưu trên máy này, không đồng bộ, không
          vào bản sao.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!connected ? (
          <>
            <p className="text-sm">
              Tạo PAT ở{' '}
              <a href={PAT_URL} target="_blank" rel="noreferrer" className="underline">
                GitHub → Tokens (classic)
              </a>
              , chỉ tick quyền <code>gist</code>, rồi dán vào đây.
            </p>
            <ConnectForm gistId={state.gistId} onDone={setNote} />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Gist id (dán vào secret GIST_ID cho Owl Post)</span>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1">{state.gistId}</code>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Chép gist id"
                  onClick={() =>
                    void copy(state.gistId ?? '').then((ok) => setNote(ok ? { tone: 'ok', text: 'Đã chép gist id.' } : { tone: 'error', text: 'Không chép được, hãy chép tay.' }))
                  }
                >
                  <Copy aria-hidden="true" />
                </Button>
              </div>
            </div>
            <NoteLine note={statusText(state)} />
            {unreadable && (
              <p role="alert" className="text-sm text-destructive">
                Dữ liệu học trên máy đang hỏng hoặc do bản app mới hơn ghi nên app tạm không ghi lên Gist (để khỏi đè bản
                sao tốt). Cập nhật app (đóng hẳn rồi mở lại) hoặc khôi phục từ Gist.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => void writer?.writeNow()} disabled={state.phase === 'writing' || unreadable}>
                <CloudUpload aria-hidden="true" />
                Ghi ngay
              </Button>
              <Button variant="secondary" onClick={() => void onRestore()} disabled={busy}>
                <RotateCcw aria-hidden="true" />
                {busy ? 'Đang đọc…' : 'Khôi phục từ Gist'}
              </Button>
            </div>
            {changingPat ? (
              <ConnectForm
                gistId={state.gistId}
                requireId
                onDone={(n) => {
                  setChangingPat(false)
                  setNote(n)
                }}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setChangingPat(true)}>
                  Thay PAT
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    writer?.disconnect()
                    setNote({ tone: 'ok', text: 'Đã xoá PAT và gist id khỏi máy này. Gist trên GitHub vẫn còn.' })
                  }}
                >
                  <Unplug aria-hidden="true" />
                  Ngắt kết nối
                </Button>
              </div>
            )}
          </>
        )}
        <NoteLine note={note} />
      </CardContent>
    </Card>
  )
}

function RemindersCard() {
  const { reminders, setTimes } = useReminders()
  const [draft, setDraft] = useState<string[]>(reminders.times)
  const [dirty, setDirty] = useState(false)
  const [seededAt, setSeededAt] = useState(reminders.updatedAt)
  const [note, setNote] = useState<Note>(null)
  const subscribeUrl = `${appUrl()}${STATIC_ICS_PATH}`
  const valid = normalizeTimes(draft)

  // Giờ nhắc đổi từ máy khác (đồng bộ) mà chưa sửa dở thì lấy giờ mới, không để bản nháp cũ đè lên.
  if (reminders.updatedAt !== seededAt) {
    setSeededAt(reminders.updatedAt)
    if (!dirty) setDraft(reminders.times)
  }

  function edit(next: (d: string[]) => string[]) {
    setDraft(next)
    setDirty(true)
  }

  function save() {
    const kept = [...valid]
    const dropped = draft.filter((t) => {
      const i = kept.indexOf(t)
      if (i === -1) return true
      kept.splice(i, 1)
      return false
    })
    setTimes(valid)
    setDraft(valid)
    setDirty(false)
    const saved = valid.length > 0 ? `Đã lưu giờ nhắc: ${valid.join(', ')}.` : 'Đã lưu: không còn giờ nhắc nào.'
    const skipped = dropped.length > 0 ? ` Bỏ qua: ${dropped.map((t) => (t === '' ? '(ô trống)' : t)).join(', ')} (trống, trùng hoặc quá ${MAX_REMINDER_TIMES} giờ).` : ''
    setNote({ tone: dropped.length > 0 ? 'error' : 'ok', text: saved + skipped })
  }

  async function download() {
    if (valid.length === 0) return
    const ics = buildIcs(valid, appUrl())
    try {
      const r = await shareOrDownload(ICS_FILE_NAME, ics, { type: 'text/calendar' })
      if (r !== 'cancelled') setNote({ tone: 'ok', text: 'Mở file .ics để thêm vào Lịch.' })
    } catch {
      setNote({ tone: 'error', text: 'Không tạo được file. Thử lại nhé.' })
    }
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="size-5 text-primary" aria-hidden="true" />
          <h2>Giờ nhắc học</h2>
        </CardTitle>
        <CardDescription>
          Qua giờ nhắc đầu tiên mà hôm nay chưa học thì trang Hôm nay hiện dải nhắc. Tải lịch .ics để Lịch iPhone/Google
          nhắc theo đúng các giờ này.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {draft.map((time, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                aria-label={`Giờ nhắc ${i + 1}`}
                onChange={(e) => edit((d) => d.map((t, j) => (j === i ? e.target.value : t)))}
                className={inputClass}
              />
              <Button type="button" variant="ghost" size="icon" aria-label={`Bỏ giờ ${time}`} onClick={() => edit((d) => d.filter((_, j) => j !== i))}>
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {draft.length < MAX_REMINDER_TIMES && (
            <Button type="button" variant="outline" size="sm" onClick={() => edit((d) => [...d, '18:00'])}>
              <Plus aria-hidden="true" />
              Thêm giờ
            </Button>
          )}
          <Button type="button" size="sm" onClick={save}>
            Lưu giờ nhắc
          </Button>
        </div>
        <Button type="button" variant="secondary" onClick={() => void download()} disabled={valid.length === 0}>
          <CalendarPlus aria-hidden="true" />
          Tải lịch .ics theo giờ này
        </Button>
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Hoặc subscribe lịch cố định 12:00 và 21:30:</span>
          <div className="flex items-center gap-2">
            <a href={subscribeUrl.replace(/^https:/, 'webcal:')} className="min-w-0 flex-1 truncate underline">
              {subscribeUrl}
            </a>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Chép link lịch"
              onClick={() => void copy(subscribeUrl).then((ok) => setNote(ok ? { tone: 'ok', text: 'Đã chép link lịch.' } : { tone: 'error', text: 'Không chép được.' }))}
            >
              <Copy aria-hidden="true" />
            </Button>
          </div>
        </div>
        <NoteLine note={note} />
      </CardContent>
    </Card>
  )
}

function TelegramCard() {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="size-5 text-primary" aria-hidden="true" />
          <h2>Owl Post qua Telegram</h2>
        </CardTitle>
        <CardDescription>
          GitHub Actions đọc trạng thái trên Gist lúc 12:00, 15:30 và 21:30 (giờ Việt Nam). Hôm nay chưa học thì cú gửi tin
          nhắc qua bot Telegram của bạn; đã học thì im lặng. Cần kết nối Gist ở trên và thêm 4 GitHub Secrets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a href={GUIDE_URL} target="_blank" rel="noreferrer" className="text-sm underline">
          Hướng dẫn cài bot và secrets (README)
        </a>
      </CardContent>
    </Card>
  )
}

/** Owl Post & sao lưu (story 13): Gist tự động, giờ nhắc + lịch .ics, Telegram. */
export function OwlPostPage() {
  return (
    <section className="flex flex-col gap-6">
      <Link to="/practice" className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Luyện tập
      </Link>
      <header className="flex items-center gap-3">
        <Mail className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Owl Post &amp; sao lưu</h1>
      </header>
      <GistCard />
      <RemindersCard />
      <TelegramCard />
    </section>
  )
}
