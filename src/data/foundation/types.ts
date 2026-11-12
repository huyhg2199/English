import type { PracticeSentence, TimelineKind } from '@/data/lessons'

/**
 * Sân ga 9¾ (CAP-23): khoá lý thuyết vỡ lòng 18 viên gạch, 4 hàng, nằm trước bài `s1-t1-w1`.
 * Story 18 chỉ có danh mục (meta) để biết viên thuộc hàng nào, dạy khái niệm gì. Nội dung màn (`screens`,
 * `ruleCards`, từ chủ đề) do story 19–26 soạn theo kiểu `Brick` ở dưới.
 */

export const ROW_IDS = ['A', 'B', 'C', 'D'] as const
export type RowId = (typeof ROW_IDS)[number]

export const BRICK_IDS = [
  'F01', 'F02', 'F03', 'F04', 'F05', 'F06',
  'F07', 'F08', 'F09', 'F10', 'F11', 'F12',
  'F13', 'F14', 'F15', 'F16',
  'F17', 'F18',
] as const
export type BrickId = (typeof BRICK_IDS)[number]

/**
 * Khái niệm do viên gạch dạy (kebab-case tiếng Anh). Mỗi khái niệm do đúng một viên dạy (`teaches`);
 * câu hỏi và viên sau khai báo khái niệm nó dùng (`uses`) để lọc "chỉ dùng kiến thức đã dạy" và mời ôn viên.
 */
export const CONCEPT_IDS = [
  // F01
  'en-vs-vi',
  'svo-order',
  // F02
  'alphabet',
  'spelling-out',
  // F03
  'ipa',
  'long-vowel-mark',
  // F04
  'syllables',
  'stress',
  'schwa',
  'consonant-clusters',
  // F05
  'final-sounds',
  'long-short-i',
  // F06
  'numbers',
  'teen-ty-stress',
  'prices',
  'clock-time',
  'days-months',
  'ordinals',
  // F07
  'parts-of-speech',
  'word-suffixes',
  // F08
  'subject-verb',
  'adjective-before-noun',
  'imperatives',
  // F09
  'subject-pronouns',
  'object-pronouns',
  'possessive-adjectives',
  // F10
  'plurals',
  'plural-s-sounds',
  'irregular-plurals',
  // F11
  'articles',
  'countable-uncountable',
  // F12
  'demonstratives',
  'possessive-s',
  // F13
  'be-affirmative',
  // F14
  'be-negative',
  'be-questions',
  'wh-questions',
  // F15
  'there-is-are',
  'prepositions-of-place',
  // F15, story 43: There isn't / Is there…? + lượng từ (some, any, many, much, a lot of, How many / How much)
  'there-negative-questions',
  'quantifiers',
  // F16
  'have-has',
  // F17
  'tenses-overview',
  'verb-forms',
  // F18
  'prepositions-of-time',
  'frequency-adverbs',
] as const
export type ConceptId = (typeof CONCEPT_IDS)[number]

/** Meta của một viên gạch (theo bảng trong `learning-rules.md`, mục Sân ga). */
export type BrickMeta = {
  id: BrickId
  row: RowId
  /** Tên viên, vd "Bảng chữ cái & đánh vần". */
  title: string
  /** Số phút ước tính (hiện ở lời mời "Ôn viên gạch X n'?"). */
  minutes: number
  /** "Học để làm gì" (tiếng Việt). */
  goalVi: string
  /** Khái niệm viên này dạy. */
  teaches: readonly ConceptId[]
  /** Khái niệm viên này dùng (chỉ khái niệm do viên đứng trước dạy). */
  uses: readonly ConceptId[]
}

/** Một màn trong viên. Thứ tự: explain → contrast → worked → faded → check → apply. */
export type Screen =
  | {
      kind: 'explain'
      /** Giải thích tiếng Việt, 40–80 chữ. */
      textVi: string
      /** Bảng tra (story 34, tuỳ chọn): hiện dưới đoạn giải thích, mỗi bảng đóng sẵn. Hiện F06 và F15 có. */
      tables?: readonly BrickTable[]
    }
  | {
      kind: 'contrast'
      /** "Tiếng Việt nói…" */
      viSays: string
      /** "Tiếng Anh bắt buộc…" */
      enRequires: string
      /** Cặp ví dụ minh hoạ (tuỳ chọn). `audioText`: chuỗi TTS đọc thay `en` (vd "H-U-Y" đọc "aitch, you, why"). */
      examples?: readonly { vi: string; en: string; audioText?: string }[]
      /** Dòng thời gian minh hoạ (dùng `TenseTimeline`). */
      timeline?: BrickTimeline
    }
  | {
      kind: 'worked'
      /** Ví dụ mẫu tiếng Anh. */
      en: string
      /** Chuỗi TTS đọc thay `en` (tuỳ chọn, vd "/siː/" → "sea"). */
      audioText?: string
      vi: string
      /** Chỉ ra chỗ cần để ý (tiếng Việt). */
      noteVi?: string
      /** Dòng thời gian minh hoạ (dùng `TenseTimeline`). */
      timeline?: BrickTimeline
    }
  | {
      kind: 'faded'
      /** Ví dụ có đúng một chỗ trống `___`. */
      en: string
      answer: string
      /** Cách viết khác cũng đúng (story 35, tuỳ chọn); chấm bằng `matchesTyped`. */
      accept?: readonly string[]
      vi: string
      hintVi?: string
    }
  | {
      kind: 'check'
      /** 2–5 câu luyện (tính điểm theo lần trả lời đầu). */
      items: readonly CheckItem[]
      /** Đúng 2 câu dễ hơn, chạy khi đúng lần đầu dưới 60% (không tính điểm). */
      easier: readonly CheckItem[]
    }
  | {
      kind: 'apply'
      /** Làm ra một thứ cụ thể: đánh vần tên mình, nói một giá tiền, tả căn phòng… */
      promptVi: string
      /** Câu mẫu gợi ý. */
      sampleEn?: string
      /** Chuỗi TTS đọc thay `sampleEn` (tuỳ chọn). */
      sampleAudioText?: string
      /** Một câu chọn để áp dụng (tuỳ chọn, không tính điểm, sai thì giải thích và làm lại). */
      item?: CheckItem
      /** Câu nói theo mẫu (dùng `SpeakPractice`, id dạng `f01-say-1`). */
      speak?: readonly PracticeSentence[]
    }

/** Từng loại màn (story 35 dùng lại `worked` / `faded` / `check` / `apply` cho phần luyện của thì). */
export type WorkedScreen = Extract<Screen, { kind: 'worked' }>
export type FadedScreen = Extract<Screen, { kind: 'faded' }>
export type CheckScreenData = Extract<Screen, { kind: 'check' }>
export type ApplyScreen = Extract<Screen, { kind: 'apply' }>

/**
 * Một dòng bảng tra của viên (story 34). `en`: chữ tiếng Anh, TTS đọc thẳng (chỉ chữ, dấu cách, gạch nối, dấu nháy);
 * `ipa`: IPA kiểu Mỹ không có dấu `/` (UI tự thêm); `vi`: nghĩa hoặc con số.
 */
export type BrickTableRow = { en: string; ipa?: string; vi: string }

/** Bảng tra trong màn giải thích (story 34): id dạng `fNN-…`, tiêu đề, ghi chú cuối bảng (tuỳ chọn), các dòng. */
export type BrickTable = { id: string; title: string; noteVi?: string; rows: readonly BrickTableRow[] }

/** Bảng có cột IPA khi ít nhất một dòng có `ipa` (story 43): bảng câu của F15 và bảng giờ / giá của F06 không có cột này. */
export function tableHasIpa(table: BrickTable): boolean {
  return table.rows.some((r) => Boolean(r.ipa))
}

/** Dòng thời gian minh hoạ một màn (như `TenseCard`). */
export type BrickTimeline = { kind: TimelineKind; label: string }

type CheckBase = {
  id: string
  /** Gợi ý khi bấm "Gợi ý". */
  hintVi: string
  /** Giải thích khi trả lời sai (rồi cho làm lại). */
  explanationVi: string
  /** Khái niệm câu này dùng (tuỳ chọn). */
  uses?: readonly ConceptId[]
}

/** Đúng 3 lựa chọn. */
export type ThreeOptions = readonly [string, string, string]

/** Câu luyện trong màn `check`. */
export type CheckItem =
  | (CheckBase & {
      kind: 'choice'
      prompt: string
      options: ThreeOptions
      /** Vị trí đáp án đúng (0–2). */
      answer: 0 | 1 | 2
    })
  | (CheckBase & {
      kind: 'listen'
      /** Câu/từ đọc bằng TTS. */
      audioText: string
      prompt?: string
      options: ThreeOptions
      answer: 0 | 1 | 2
    })
  | (CheckBase & {
      kind: 'tapSyllable'
      word: string
      /** Âm tiết theo chính tả, ghép lại đúng bằng `word`. */
      syllables: readonly string[]
      /** Vị trí âm tiết nhấn trong `syllables`. */
      answer: number
    })
  | (CheckBase & {
      kind: 'order'
      prompt?: string
      /** Các mảnh theo thứ tự đúng (app xáo khi hiện). */
      tokens: readonly string[]
    })
  | (CheckBase & {
      kind: 'sort'
      prompt?: string
      /** Các nhóm, mỗi nhóm có nhãn và các mục thuộc nhóm đó (app trộn khi hiện). */
      groups: readonly { label: string; items: readonly string[] }[]
    })
  /**
   * Câu gõ (story 35): gõ một chỗ trống (`prompt` có `___`, vd "She ___ (not / work) today.") hoặc gõ cả câu theo yêu cầu
   * trong `prompt` (vd "Đổi sang câu hỏi: …"). Chấm bằng `matchesTyped` với `answer` và `accept`.
   */
  | (CheckBase & {
      kind: 'type'
      prompt: string
      answer: string
      /** Cách viết khác cũng đúng; mỗi mục khác `answer`. */
      accept?: readonly string[]
    })

/** Thẻ quy tắc của viên (thẻ điền chỗ trống, vào SRS). */
export type RuleCard = {
  id: string
  brickId: BrickId
  /** Câu có đúng một chỗ trống `___`. */
  cloze: string
  answer: string
  /** Nghĩa / quy tắc tiếng Việt. */
  vi: string
}

/** Viên gạch đầy đủ (story 19+). */
export type Brick = BrickMeta & {
  screens: readonly Screen[]
  ruleCards: readonly RuleCard[]
  /** Id thẻ từ chủ đề của viên (`ngsl-…`). */
  themeWordIds: readonly string[]
}
