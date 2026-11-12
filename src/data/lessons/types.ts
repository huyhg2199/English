import type { RequiredConcept } from '@/data/questions/concepts'
import type { ApplyScreen, CheckScreenData, FadedScreen, WorkedScreen } from '@/data/foundation/types'

/**
 * Nội dung học thật của bài (story 6): bảng âm + câu luyện nói cho đoạn Phát âm,
 * các thì + câu thoại thật + thần chú cho đoạn Ngữ pháp. Bài không có nội dung thì trang bài giữ như cũ.
 * Mọi id là chuỗi viết tay, ổn định (điểm luyện nói lưu theo id câu).
 */

/** Từ ví dụ: `word` là từ gốc trong NGSL (lấy IPA từ bộ từ). `form` là dạng có đuôi (-s/-ed) khi luyện âm cuối. */
export type ExampleWord = {
  word: string
  /** Dạng biến đổi, ví dụ "works" (chỉ ở bài âm cuối). */
  form?: string
  /** IPA kiểu Mỹ của `form`, không có `/`. */
  formIpa?: string
}

/** Một từ trong cặp dễ nhầm, kèm IPA kiểu Mỹ (không có `/`). */
export type PairWord = { word: string; ipa: string }
export type Pair = readonly [PairWord, PairWord]

export type SoundKind = 'vowel' | 'diphthong' | 'consonant' | 'ending'

export type Sound = {
  /** Ví dụ `v-ii`, `c-th-voiceless`, `e-s-iz`. */
  id: string
  /** Ký hiệu IPA hiển thị (không có `/`). */
  ipa: string
  kind: SoundKind
  /** Mẹo khẩu hình bằng tiếng Việt: âm Việt gần nhất, lỗi người Việt hay mắc. */
  tip: string
  /** 3–5 từ ví dụ. */
  examples: readonly ExampleWord[]
  /** Cặp từ dễ nhầm, ví dụ ship /ʃɪp/ – sheep /ʃiːp/ (có IPA vì nhiều từ không nằm trong NGSL). */
  pair?: Pair
  /** Âm cần chú ý đặc biệt (ví dụ /θ ð ʃ ʒ/). */
  focus?: boolean
}

export type SoundGroup = {
  title: string
  note?: string
  sounds: readonly Sound[]
}

/** Câu mẫu để nghe và nói. */
export type PracticeSentence = {
  /** Ví dụ `s1-t1-w1-say-1`. */
  id: string
  text: string
  vi: string
}

/**
 * Luật trọng âm: `index` = trọng âm ở âm tiết thứ `index` (đếm từ 0) của từ `syllables` âm tiết;
 * `before-suffix` = trọng âm rơi vào âm tiết ngay trước hậu tố (hậu tố có `suffixSyllables` âm tiết).
 * Âm tiết và vị trí nhấn lấy từ bộ từ NGSL (test kiểm từng từ khớp luật).
 */
export type StressExpectation =
  | { kind: 'index'; index: number; syllables: number }
  | { kind: 'before-suffix'; suffix: string; suffixSyllables: number }

export type StressRule = {
  id: string
  title: string
  tip: string
  expect: StressExpectation
  /** Từ NGSL có dữ liệu. */
  words: readonly string[]
}

/** Khối phát âm mới (story 10), thêm sau bảng âm. Mỗi khối là dữ liệu thuần, component vẽ theo `kind`. */
export type PronunciationBlock =
  | { kind: 'stress'; title: string; note?: string; rules: readonly StressRule[] }
  | {
      kind: 'weak-forms'
      title: string
      note?: string
      items: readonly { word: string; strong: string; weak: string; example: string; vi: string }[]
    }
  | {
      kind: 'linking'
      title: string
      note?: string
      /** `sounds` là cách nghe khi nối, ví dụ "pi-ki-tup". */
      items: readonly { text: string; sounds: string; vi: string }[]
    }
  | {
      kind: 'sentence-stress'
      title: string
      note?: string
      /** `stressed`: chỉ số (từ 0) các từ được nhấn khi tách câu theo khoảng trắng. */
      items: readonly { text: string; stressed: readonly number[]; vi: string }[]
    }
  | {
      kind: 'reductions'
      title: string
      note?: string
      items: readonly { reduced: string; full: string; example: string; vi: string; youglishUrl: string }[]
    }
  | { kind: 'shadowing'; title: string; note: string; lines: readonly PracticeSentence[] }
  | { kind: 'dictation'; title: string; note: string; items: readonly PracticeSentence[] }
  | { kind: 'self-read'; title: string; note: string; words: readonly string[] }
  | {
      kind: 'overview'
      title: string
      note?: string
      /** Tóm tắt kèm link về đúng đoạn của bài. */
      items: readonly { text: string; lessonId: string; sectionId: 'pronunciation' | 'grammar' }[]
    }

export type PronunciationContent = {
  intro: string
  groups: readonly SoundGroup[]
  sentences: readonly PracticeSentence[]
  blocks?: readonly PronunciationBlock[]
}

/** Câu thoại nguyên văn từ transcript VOA Let's Learn English Level 1 (public domain). */
export type VoaLine = {
  kind: 'voa'
  speaker: string
  text: string
  vi: string
  /** Tên bài VOA, ví dụ "Lesson 1: Welcome!". */
  episode: string
  /** Link trang bài VOA có transcript. */
  sourceUrl: string
}

/** Không lấy được transcript: link YouGlish tìm đúng cụm để nghe trong video thật. */
export type YouglishLine = {
  kind: 'youglish'
  phrase: string
  sourceUrl: string
}

export type DialogueLine = VoaLine | YouglishLine

/**
 * Kiểu đánh dấu trên dòng thời gian. T1: `state`, `habit`, `habit-question`.
 * Story 10: `progress` (đang diễn ra quanh lúc nói), `past-point` (một lúc đã xong trong quá khứ),
 * `future-point` (một lúc trong tương lai), `plan` (kế hoạch đã định từ bây giờ tới tương lai),
 * `past-to-now` (từ quá khứ kéo tới bây giờ), `perfect-vs-past` (so hoàn thành với quá khứ đơn).
 */
export type TimelineKind =
  | 'state'
  | 'habit'
  | 'habit-question'
  | 'progress'
  | 'past-point'
  | 'future-point'
  | 'plan'
  | 'past-to-now'
  | 'perfect-vs-past'

export type Tense = {
  /** Ví dụ `to-be`, `present-simple`. */
  id: string
  name: string
  /** Một câu: thì này dùng khi nào. */
  use: string
  /** Chỉ thì mới có dòng thời gian (động từ khuyết thiếu, so sánh, bị động thì không). */
  timeline?: { kind: TimelineKind; label: string }
  formulas: readonly { label: string; text: string }[]
  /** 3 quy tắc ngắn. */
  rules: readonly string[]
  /** 4–6 câu ví dụ có dịch. */
  examples: readonly { en: string; vi: string }[]
  /** Lỗi người Việt hay mắc. */
  mistakes: readonly { wrong: string; right: string; why: string }[]
  dialogues: readonly DialogueLine[]
  /** Thần chú của thì; chủ điểm ôn/so sánh (hiện tại hoàn thành (2)) không có thần chú riêng. */
  spellId?: string
  /**
   * Thẻ quy tắc của thì (story 33). Bài chứa thì được đánh dấu xong thì thẻ vào phiên ôn SRS (đứng sau thẻ viên gạch),
   * id SRS `rule:<tenseId>-n` (từ id nội dung `<tenseId>-rule-n`). Bài bị bỏ qua khi xếp lớp thì không góp thẻ.
   * Mỗi thì 4–5 thẻ (story 38): thì dạy đủ ba dạng phủ khẳng định, phủ định, câu hỏi và một cặp dễ nhầm; `to-be` không có.
   */
  ruleCards?: readonly TenseRuleCard[]
  /**
   * Phần luyện có bậc của thì (story 35, không bắt buộc), hiện ngay dưới TenseCard: ví dụ mẫu → tự điền một chỗ → 5–7 câu
   * luyện có "Gợi ý" (dưới 60% mời xem lại + 2 câu dễ hơn) → áp dụng. Sai thì giải thích và làm lại; không ghi Sổ lỗi, lần
   * làm quiz, tiến độ, không cộng điểm (chỉ câu nói ở bước áp dụng ghi điểm nói như viên gạch).
   */
  practice?: TensePractice
}

/**
 * Bốn bước luyện của thì (story 35), dùng lại kiểu màn của Sân ga (bỏ `kind`). Luật dữ liệu ở `practiceProblems`
 * (`src/lib/tense-practice.ts`): `faded.en` đúng một `___`; `check.items` 5–7 câu, `check.easier` đúng 2 câu; id câu
 * `${tense.id}-c<n>` / `${tense.id}-e<n>`; id câu nói `${tense.id}-say-<n>`.
 */
export type TensePractice = {
  worked: Omit<WorkedScreen, 'kind'>
  faded: Omit<FadedScreen, 'kind'>
  check: Omit<CheckScreenData, 'kind'>
  apply: Omit<ApplyScreen, 'kind'>
}

/** Thẻ quy tắc của thì: câu có đúng một chỗ trống `___`, đáp án và câu quy tắc tiếng Việt. Id `<tenseId>-rule-n`. */
export type TenseRuleCard = { id: string; cloze: string; answer: string; vi: string }

/** Một động từ bất quy tắc: V1 (NGSL), V2, V3 và nghĩa tiếng Việt. */
export type IrregularVerb = { v1: string; v2: string; v3: string; vi: string }

/** Nhóm âm của động từ bất quy tắc (story 38): id, tên nhóm (kèm ví dụ) và động từ theo thứ tự bảng. */
export type IrregularVerbGroup = { id: string; title: string; verbs: readonly IrregularVerb[] }

/**
 * Thẻ ôn V2 · V3 của một động từ bất quy tắc (story 38): id nội dung `irregular-<v1>-rule-1` (id SRS
 * `rule:irregular-<v1>-1`), cloze "go → ___ (V2 · V3)", đáp án "went · gone", `vi` "<nghĩa> · Nhóm: <tên nhóm>".
 */
export type IrregularVerbCard = TenseRuleCard & { groupId: string; groupTitle: string }

export type GrammarContent = {
  tenses: readonly Tense[]
  /** Bảng động từ bất quy tắc (s1-t2-w3). */
  irregularVerbs?: readonly IrregularVerb[]
  /** Bảng ôn cột V3 đứng trước các thì, che sẵn V3 (story 38, s1-t3-w3). */
  irregularVerbsReview?: readonly IrregularVerb[]
  /** Tuần ôn tập: tóm tắt các thì đã học và ghi chú mini test. */
  review?: { summary: readonly string[]; note: string; quizId?: string }
}

/**
 * Một phần của đoạn Phát âm bài T1 (story 28): mỗi buổi 30' sau Sân ga học một phần. `soundIds` trỏ vào âm đã có trong
 * `pronunciation.groups` (không chép dữ liệu âm). Câu luyện nói chỉ dùng kiến thức đã dạy (`requires` khai báo tay: khái
 * niệm viên gạch, hoặc khái niệm của bài T1 này hay bài T1 trước).
 */
export type LessonPart = {
  /** `${lessonId}-p${n}`, n đếm từ 1. */
  id: string
  title: string
  /** Một câu ghi chú. */
  note: string
  soundIds: readonly string[]
  /** 2–3 câu luyện nói, id `${id}-say-${k}`. */
  sentences: readonly PracticeSentence[]
  requires: readonly RequiredConcept[]
}

export type LessonContent = {
  lessonId: string
  pronunciation?: PronunciationContent
  /**
   * Các phần của đoạn Phát âm (story 28, chỉ W1–W3). Câu mẫu cũ của tuần (`pronunciation.sentences`) thành khối
   * "Luyện cả tuần" sau các phần. Bài không có thì đoạn Phát âm hiện như cũ.
   */
  parts?: readonly LessonPart[]
  grammar?: GrammarContent
  /** Tuần Tết: chỉ nhắc chạy chế độ ngày lười, không có nội dung mới. */
  lazyWeek?: boolean
  /**
   * Tình huống roleplay cho nút "Luyện nói với AI": `scenario`, `topicEn` bằng tiếng Anh (đưa vào prompt),
   * `vi` là tên tình huống hiện trên trang. Chỉ tình huống chung, không có thông tin cá nhân.
   */
  roleplay?: { scenario: string; topicEn: string; vi: string }
}

/** Thần chú lấy cảm hứng HP: mở khoá khi bài chứa thì đó được đánh dấu xong. */
export type Spell = {
  id: string
  name: string
  description: string
  tenseId: string
  lessonId: string
  /** Tên chủ điểm ngữ pháp bằng tiếng Anh, dùng trong prompt luyện nói (chỉ cho AI dùng các thì đã mở). */
  grammarEn: string
}
