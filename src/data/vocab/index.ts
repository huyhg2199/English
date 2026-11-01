/**
 * Bộ từ NGSL 1.2 + TSL 1.2 (CC BY-SA 4.0, newgeneralservicelist.com) kèm dữ liệu AI sinh lúc build.
 * `words.json` sinh bằng `npm run vocab:build` (scripts/vocab/), không sửa tay.
 */

export type WordList = 'ngsl' | 'tsl'

export const PARTS_OF_SPEECH = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'determiner',
  'number',
  'interjection',
] as const

export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number]

export const POS_LABELS: Record<PartOfSpeech, string> = {
  noun: 'danh từ',
  verb: 'động từ',
  adjective: 'tính từ',
  adverb: 'trạng từ',
  pronoun: 'đại từ',
  preposition: 'giới từ',
  conjunction: 'liên từ',
  determiner: 'từ hạn định',
  number: 'số từ',
  interjection: 'thán từ',
}

/** Dữ liệu AI của một từ (IPA kiểu Mỹ, âm tiết theo chính tả, âm nhấn, nghĩa Việt, câu ví dụ). */
export type WordDetails = {
  pos: PartOfSpeech
  /** IPA không có dấu `/`; có `ˈ` trước âm nhấn khi từ nhiều âm tiết. */
  ipa: string
  syllables: string[]
  /** Vị trí âm tiết nhấn chính trong `syllables`. */
  stressIndex: number
  meaningVi: string
  exampleEn: string
  exampleVi: string
}

export type Word = {
  /** `ngsl-<từ>` / `tsl-<từ>`: ổn định theo chữ, là key thẻ SRS. */
  id: string
  word: string
  list: WordList
  /** Hạng tần suất trong danh sách của nó (1 = hay gặp nhất). */
  rank: number
} & Partial<WordDetails>

/** Từ đã có dữ liệu AI, được đưa vào phiên ôn. */
export type StudyWord = Word & WordDetails

export function hasDetails(word: Word): word is StudyWord {
  return (
    typeof word.ipa === 'string' &&
    typeof word.pos === 'string' &&
    Array.isArray(word.syllables) &&
    word.syllables.length > 0 &&
    typeof word.stressIndex === 'number' &&
    typeof word.meaningVi === 'string' &&
    typeof word.exampleEn === 'string' &&
    typeof word.exampleVi === 'string'
  )
}

/** Thứ tự học: hết NGSL theo hạng rồi tới TSL theo hạng. */
export function compareStudyOrder(a: Word, b: Word): number {
  if (a.list !== b.list) return a.list === 'ngsl' ? -1 : 1
  return a.rank - b.rank
}

/** Link tra từ trên Cambridge (bản Mỹ) để đối chiếu IPA và trọng âm. */
export function cambridgeUrl(word: string): string {
  const slug = word.trim().toLowerCase().replace(/\s+/g, '-')
  return `https://dictionary.cambridge.org/us/dictionary/english/${encodeURIComponent(slug)}`
}

export const VOCAB_ATTRIBUTION = {
  text: 'Danh sách từ: NGSL 1.2 và TSL 1.2 của Browne, Culligan & Phillips, giấy phép CC BY-SA 4.0.',
  sourceUrl: 'https://www.newgeneralservicelist.com',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
} as const

let cache: Promise<readonly Word[]> | null = null

/** Nạp bộ từ bằng dynamic import: `words.json` thành chunk riêng, không vào bundle chính. */
export function loadWords(): Promise<readonly Word[]> {
  cache ??= import('./words.json').then((mod) => mod.default as readonly Word[]).catch((error: unknown) => {
    cache = null
    throw error
  })
  return cache
}
