import { isPlainObject } from '@/lib/storage'

/**
 * Phụ đề song ngữ của một video VOA (public domain) hoặc CC BY (story 16): `src/data/subs/<videoId>.json`.
 * `start`/`end` (giây) và `en` lấy nguyên từ caption do kênh đăng trên YouTube (scripts/subs/fetch-captions.mjs);
 * `vi`, `notes`, `highlight` do Claude làm lúc build.
 */
export type SubNoteKind = 'idiom' | 'reduction' | 'context'

export const NOTE_KINDS: readonly SubNoteKind[] = ['idiom', 'reduction', 'context']

export const NOTE_KIND_LABELS: Record<SubNoteKind, string> = {
  idiom: 'Thành ngữ',
  reduction: 'Nói tắt',
  context: 'Nghĩa theo ngữ cảnh',
}

export type SubNote = {
  /** Cụm nằm nguyên văn trong `en` (không phân biệt hoa thường). */
  term: string
  kind: SubNoteKind
  noteVi: string
}

export type SubCue = {
  start: number
  end: number
  en: string
  vi: string
  notes?: readonly SubNote[]
  /** Id các thì (theo dữ liệu bài, vd `present-simple`) có trong câu. */
  highlight?: readonly string[]
}

export type SubSource = {
  channel: string
  /** Link kênh trên YouTube (bắt buộc với video CC BY, để ghi nguồn). */
  channelUrl?: string
  /** Link video trên YouTube. */
  url: string
  /** "public domain – VOA" hoặc "CC BY 3.0 – <kênh>". */
  license: string
  /** Link giấy phép (CC BY 3.0); VOA không có. */
  licenseUrl?: string
  /** Ghi chú thay đổi theo CC BY: "Bản dịch tiếng Việt do Lumos thực hiện". */
  translation?: string
  /** `uploaded`: caption do kênh đăng; `asr`: caption tự động (chỉ khi kênh không đăng bản nào). */
  captionKind: 'uploaded' | 'asr'
}

export type SubFile = {
  videoId: string
  source: SubSource
  cues: readonly SubCue[]
}

function isNote(value: unknown): value is SubNote {
  return (
    isPlainObject(value) &&
    typeof value.term === 'string' &&
    value.term.trim() !== '' &&
    NOTE_KINDS.includes(value.kind as SubNoteKind) &&
    typeof value.noteVi === 'string' &&
    value.noteVi.trim() !== ''
  )
}

export function isSubCue(value: unknown): value is SubCue {
  return (
    isPlainObject(value) &&
    typeof value.start === 'number' &&
    typeof value.end === 'number' &&
    Number.isFinite(value.start) &&
    Number.isFinite(value.end) &&
    value.start >= 0 &&
    value.end > value.start &&
    typeof value.en === 'string' &&
    value.en.trim() !== '' &&
    typeof value.vi === 'string' &&
    value.vi.trim() !== '' &&
    (value.notes === undefined || (Array.isArray(value.notes) && value.notes.every(isNote))) &&
    (value.highlight === undefined || (Array.isArray(value.highlight) && value.highlight.every((h) => typeof h === 'string')))
  )
}

/** Kiểm file sub tải về (dữ liệu tĩnh nhưng vẫn kiểm để file hỏng không làm crash player). */
export function isSubFile(value: unknown): value is SubFile {
  if (!isPlainObject(value) || typeof value.videoId !== 'string' || !isPlainObject(value.source)) return false
  const s = value.source
  if (typeof s.channel !== 'string' || typeof s.url !== 'string' || typeof s.license !== 'string') return false
  for (const key of ['channelUrl', 'licenseUrl', 'translation'] as const) {
    if (s[key] !== undefined && typeof s[key] !== 'string') return false
  }
  if (s.captionKind !== 'uploaded' && s.captionKind !== 'asr') return false
  if (!Array.isArray(value.cues) || value.cues.length === 0 || !value.cues.every(isSubCue)) return false
  // Tăng dần, không chồng nhau.
  return value.cues.every((c: SubCue, i: number, all: SubCue[]) => i === 0 || c.start >= all[i - 1].end)
}
