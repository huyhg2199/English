import { useEffect, useState, type FormEvent } from 'react'
import { KeyRound, Mail, WifiOff } from 'lucide-react'

import { useSync } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const RESEND_SECONDS = 60

function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

const inputClass =
  'h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

/**
 * Màn đăng nhập: nhập email → nhận mã 6 số qua email → gõ mã ngay trong app.
 * Không dùng magic link vì PWA trên iPhone có bộ nhớ tách khỏi Safari.
 */
export function SignIn() {
  const { sendCode, verifyCode } = useSync()
  const online = useOnline()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  async function requestCode() {
    setBusy(true)
    setError(null)
    setInfo(null)
    const result = await sendCode(email)
    setBusy(false)
    if (!result.ok) return setError(result.message)
    setStep('code')
    setCode('')
    setCooldown(RESEND_SECONDS)
    setInfo(`Đã gửi mã tới ${email.trim()}. Kiểm tra cả thư mục Spam.`)
  }

  async function onSubmitEmail(e: FormEvent) {
    e.preventDefault()
    await requestCode()
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const result = await verifyCode(email, code)
    setBusy(false)
    if (!result.ok) setError(result.message)
    // Thành công: AuthGate tự chuyển vào app.
  }

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-8"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2rem)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
    >
      <header className="flex flex-col items-center gap-2 text-center">
        <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="size-16" />
        <h1 className="text-2xl font-semibold tracking-wide">Lumos English</h1>
        <p className="text-sm text-muted-foreground">Đăng nhập để lưu tiến độ trên tài khoản và học trên nhiều máy.</p>
      </header>

      {!online && (
        <p role="status" className="flex items-start gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
          <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Cần có mạng cho lần đăng nhập đầu tiên. Sau đó app vẫn học được khi không có mạng.
        </p>
      )}

      <Card>
        {step === 'email' ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                Nhập email
              </CardTitle>
              <CardDescription>App sẽ gửi một mã 6 số tới email này.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3" onSubmit={onSubmitEmail}>
                <label htmlFor="signin-email" className="sr-only">
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  required
                  placeholder="ban@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
                <Button type="submit" size="lg" disabled={busy || !online || !email.trim()}>
                  {busy ? 'Đang gửi…' : 'Gửi mã'}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-5 text-primary" aria-hidden="true" />
                Nhập mã 6 số
              </CardTitle>
              {info && <CardDescription>{info}</CardDescription>}
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3" onSubmit={onSubmitCode}>
                <label htmlFor="signin-code" className="sr-only">
                  Mã 6 số
                </label>
                <input
                  id="signin-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
                />
                <Button type="submit" size="lg" disabled={busy || !online || code.length !== 6}>
                  {busy ? 'Đang kiểm tra…' : 'Đăng nhập'}
                </Button>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    onClick={() => {
                      setStep('email')
                      setError(null)
                      setInfo(null)
                    }}
                  >
                    Đổi email
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    disabled={busy || !online || cooldown > 0}
                    onClick={() => void requestCode()}
                  >
                    {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : 'Gửi lại mã'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </main>
  )
}
