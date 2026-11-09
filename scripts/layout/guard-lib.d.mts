// Khai báo kiểu cho guard-lib.mjs (để test TypeScript import được).
export type GuardViolation = { path: string; token: string; kind: 'added' | 'removed' }
export const DESKTOP_ONLY_MARKER: string
export function isDesktopOnlyToken(token: string): boolean
export function classTokens(source: string): string[]
export function guardFile(file: { path: string; before: string | null; after: string | null }): GuardViolation[]
export function isGuardedPath(path: string): boolean
export function parseGuardArgs(argv: readonly string[]): { base: string }
export function parseNameStatus(output: string): { path: string; oldPath: string | null }[]
