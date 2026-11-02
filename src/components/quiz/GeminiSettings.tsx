import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  clearGeminiKey,
  DEFAULT_GEMINI_MODEL,
  readGeminiModel,
  saveGeminiKey,
  saveGeminiModel,
} from '@/lib/ai'

export const GEMINI_SETTINGS_ID = 'gemini-settings'

const inputClass =
  'h-10 w-full min-w-0 rounded-md border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

/**
 * Cài đặt "Vì sao sai?": key Gemini (BYOK) và model. Key chỉ lưu ở máy này (localStorage riêng),
 * không đồng bộ, không vào file sao lưu. Ô key không bao giờ hiện lại key đã lưu.
 */
export function GeminiSettings({ hasKey, onChange }: { hasKey: boolean; onChange: () => void }) {
  const [key, setKey] = useState('')
  const [model, setModel] = useState(() => readGeminiModel())
  const [message, setMessage] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const msgs: string[] = []
    if (key.trim()) {
      msgs.push(saveGeminiKey(key) ? 'Đã lưu key trên máy này.' : 'Không lưu được key (bộ nhớ trình duyệt bị chặn).')
      setKey('')
    }
    if (!saveGeminiModel(model)) msgs.push('Tên model không hợp lệ, giữ model cũ.')
    else msgs.push(`Model: ${readGeminiModel()}.`)
    setModel(readGeminiModel())
    setMessage(msgs.join(' '))
    onChange()
  }

  return (
    <Card id={GEMINI_SETTINGS_ID} className="scroll-mt-4 gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="size-5 text-primary" aria-hidden="true" />
          <h2>Key Gemini cho "Vì sao sai?"</h2>
        </CardTitle>
        <CardDescription>
          Key của bạn chỉ lưu trên máy này: không đồng bộ, không vào file sao lưu. Lấy key miễn phí ở{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline">
            Google AI Studio
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>{hasKey ? 'Đã có key. Nhập key mới để thay:' : 'Key Gemini'}</span>
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={hasKey ? '••••••••' : 'AIza…'}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Model (mặc định {DEFAULT_GEMINI_MODEL})</span>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Lưu</Button>
            {hasKey && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearGeminiKey()
                  setMessage('Đã xoá key khỏi máy này.')
                  onChange()
                }}
              >
                Xoá key
              </Button>
            )}
          </div>
          {message && (
            <p role="status" className="text-xs text-muted-foreground">
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

