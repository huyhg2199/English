// Khai báo kiểu cho decide.mjs (để test TypeScript import được).
export type OwlStatus = {
  date: string
  studied: boolean
  kind: 'full' | 'lazy' | null
  streak: number
  updatedAt: string | null
}
export type Decision = { send: boolean; reason: 'no-status' | 'studied' | 'not-today' | 'not-studied'; today: string }
export const VN_OFFSET_MS: number
export function vnDayKey(nowUtc: Date): string
export function vnHour(nowUtc: Date): number
export function parseStatus(text: string): OwlStatus | null
export function shouldSend(status: OwlStatus | null, nowUtc: Date): Decision
export function slotFor(nowUtc: Date): 'noon' | 'afternoon' | 'night'
export function buildMessage(status: OwlStatus | null, nowUtc: Date, appUrl: string): string
export function redact(text: unknown, secrets: readonly (string | undefined)[]): string
