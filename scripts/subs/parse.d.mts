// Khai báo kiểu cho parse.mjs (để test TypeScript import được).
export type RawCue = { start: number; end: number; en: string }
export type CaptionTrack = { languageCode?: string; kind?: string; baseUrl?: string; vssId?: string }

export type TranscriptSource = {
  channel: string
  channelUrl?: string
  url: string
  license: string
  licenseUrl?: string
  translation?: string
  captionKind: 'uploaded' | 'asr'
}

export const VOA_CHANNEL: string
export const VOA_LICENSE: string
export const CC_BY_LICENSE_URL: string
export const CHANNEL_URL_RE: RegExp
export const TRANSLATION_CREDIT: string
export function ccByLicense(channel: string): string
export function transcriptSource(
  video: { id: string; channel: string; channelUrl?: string; license?: string },
  captionKind: 'uploaded' | 'asr',
): TranscriptSource | null
export function canStoreTranscript(video: { id: string; channel: string; channelUrl?: string; license?: string }): boolean
export const MAX_CUE_SECONDS: number
export const MAX_CUE_CHARS: number

export function pickCaptionTrack(tracks: readonly CaptionTrack[]): { track: CaptionTrack; kind: 'uploaded' | 'asr' } | null
export function cleanText(text: string): string
export function parseJson3(json: unknown): RawCue[]
export function parseTimestamp(s: string): number
export function parseVttOrSrt(text: string): RawCue[]
export function normalizeCues(raw: readonly RawCue[]): RawCue[]
export function captionTracksFromWatchHtml(html: string): CaptionTrack[]
export function pickLocalCaption(id: string, names: readonly string[], opts?: { allowAsr?: boolean }): { name: string; ext: string; kind: 'uploaded' | 'asr' } | null
export function stripRollingOverlap(prev: string, en: string): string
