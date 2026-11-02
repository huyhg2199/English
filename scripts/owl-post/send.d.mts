// Khai báo kiểu cho send.mjs (để test TypeScript import được).
type Fetch = (url: string, init?: RequestInit) => Promise<Response>
export const DEFAULT_APP_URL: string
export function fetchStatus(opts: { fetch: Fetch; gistId: string; gistToken: string }): Promise<{ ok: true; text: string } | { ok: false; reason: string; persistent?: boolean }>
export function sendTelegram(opts: { fetch: Fetch; botToken: string; chatId: string; text: string }): Promise<{ ok: true } | { ok: false; reason: string; persistent?: boolean }>
export function runOwlPost(opts: {
  env: Record<string, string | undefined>
  fetch: Fetch
  now: Date
  log: (line: string) => void
  dryRun?: boolean
  statusText?: string
}): Promise<{ code: number; sent: boolean; reason: string }>
export function parseArgs(argv: string[]): { dryRun: boolean; statusText: string | undefined; now: Date | undefined; error: string | null }
