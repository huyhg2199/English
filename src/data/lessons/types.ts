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

export type PronunciationContent = {
  intro: string
  groups: readonly SoundGroup[]
  sentences: readonly PracticeSentence[]
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

/** Kiểu đánh dấu trên dòng thời gian. */
export type TimelineKind = 'state' | 'habit' | 'habit-question'

export type Tense = {
  /** Ví dụ `to-be`, `present-simple`. */
  id: string
  name: string
  /** Một câu: thì này dùng khi nào. */
  use: string
  timeline: { kind: TimelineKind; label: string }
  formulas: readonly { label: string; text: string }[]
  /** 3 quy tắc ngắn. */
  rules: readonly string[]
  /** 4–6 câu ví dụ có dịch. */
  examples: readonly { en: string; vi: string }[]
  /** Lỗi người Việt hay mắc. */
  mistakes: readonly { wrong: string; right: string; why: string }[]
  dialogues: readonly DialogueLine[]
  spellId: string
}

export type GrammarContent = {
  tenses: readonly Tense[]
  /** Tuần ôn tập: tóm tắt các thì đã học và ghi chú mini test. */
  review?: { summary: readonly string[]; note: string; quizId?: string }
}

export type LessonContent = {
  lessonId: string
  pronunciation?: PronunciationContent
  grammar?: GrammarContent
  /** Tuần 1: nút "Làm bài đầu vào" sang Mũ Phân Loại. */
  placementLink?: boolean
}

/** Thần chú lấy cảm hứng HP: mở khoá khi bài chứa thì đó được đánh dấu xong. */
export type Spell = {
  id: string
  name: string
  description: string
  tenseId: string
  lessonId: string
}
