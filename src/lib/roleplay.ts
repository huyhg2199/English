import { SPELLS, type Spell } from '@/data/lessons'

/**
 * Luyện nói với AI dạng link (story 10): app dựng prompt roleplay tiếng Anh theo tình huống của bài,
 * chép vào clipboard rồi mở Gemini ở tab mới. Không gọi API, prompt không chứa key hay dữ liệu cá nhân
 * (ngoài tên "Huy", có thể bỏ).
 */

export const GEMINI_URL = 'https://gemini.google.com/app'

/** Luôn được dùng, kể cả khi chưa mở thần chú nào (Lumos, Alohomora trùng hai mục này nên không lặp). */
const BASELINE = ['the verb "to be" (am / is / are)', 'the present simple (I work, she works)'] as const
const BASELINE_SPELLS = new Set(['lumos', 'alohomora'])

export type RoleplayLesson = {
  lessonId: string
  /** Chủ đề và tình huống đều bằng tiếng Anh (prompt không chứa tiếng Việt). */
  roleplay: { scenario: string; topicEn: string }
}

type SpellRef = Pick<Spell, 'id' | 'grammarEn'>

/** Các chủ điểm ngữ pháp AI được dùng: nền (to be, hiện tại đơn) + thần chú đã mở, theo thứ tự thần chú. */
export function allowedGrammar(spells: readonly SpellRef[]): string[] {
  const extra = spells.filter((s) => !BASELINE_SPELLS.has(s.id)).map((s) => s.grammarEn)
  return [...BASELINE, ...extra.filter((g, i) => extra.indexOf(g) === i)]
}

/**
 * Thần chú được dùng trong prompt của một bài: thần chú đã mở + thần chú của chính bài đang học
 * (thần chú chỉ mở khi bài xong, nên thiếu bước này thì prompt cấm đúng thì đang luyện). Không trùng, theo thứ tự SPELLS.
 */
export function roleplaySpells(lessonId: string, unlockedSpells: readonly SpellRef[]): SpellRef[] {
  const own = SPELLS.filter((s) => s.lessonId === lessonId)
  const ids = new Set([...unlockedSpells, ...own].map((s) => s.id))
  const known = SPELLS.filter((s) => ids.has(s.id))
  const unknown = unlockedSpells.filter((s) => !SPELLS.some((x) => x.id === s.id))
  return [...known, ...unknown]
}

/**
 * Prompt roleplay cho một bài: chỉ cho dùng to be, hiện tại đơn, các thì đã mở và thì của chính bài.
 * `name` mặc định "Huy"; truyền null để bỏ tên.
 * Hàm thuần: cùng đầu vào thì cùng prompt.
 */
export function buildRoleplayPrompt(
  lesson: RoleplayLesson,
  unlockedSpells: readonly SpellRef[],
  name: string | null = 'Huy',
): string {
  const grammar = allowedGrammar(roleplaySpells(lesson.lessonId, unlockedSpells))
  const simpleOnly = grammar.length === BASELINE.length
  const who = name ? `My name is ${name}. I am` : 'I am'
  return [
    `You are my friendly English speaking partner. ${who} a Vietnamese beginner learning English (about A1–A2 level).`,
    '',
    `Topic of my lesson: ${lesson.roleplay.topicEn}.`,
    `Roleplay: ${lesson.roleplay.scenario}`,
    '',
    'Rules for you:',
    `- Only use this grammar: ${grammar.join('; ')}.${simpleOnly ? ' Keep every sentence very simple.' : ''} Do not use any other tense or grammar.`,
    '- Speak slowly. Use short sentences (no more than 10 words) and common everyday words.',
    '- Ask only one question at a time, then wait for my answer.',
    '- After each of my turns, first correct my mistakes in Vietnamese (short: the wrong part, the correct sentence, one simple rule). If I made no mistakes, say "Đúng rồi!". Then continue the roleplay in English.',
    '- If I write in Vietnamese or get stuck, give me a short example answer in English that I can repeat.',
    '',
    'Start now: greet me and ask the first question.',
  ].join('\n')
}

/** Kết quả bấm nút: `copied` = đã chép vào clipboard; false thì giao diện hiện ô prompt để tự chép. */
export type CopyOutcome = { copied: boolean }

type ClipboardLike = { writeText?: (text: string) => Promise<void> } | undefined

/** Chép vào clipboard; bị chặn, không hỗ trợ hay lỗi bất kỳ đều trả `copied: false` (không ném lỗi). */
export async function copyText(text: string, clipboard: ClipboardLike = globalThis.navigator?.clipboard): Promise<CopyOutcome> {
  try {
    if (!clipboard || typeof clipboard.writeText !== 'function') return { copied: false }
    await clipboard.writeText(text)
    return { copied: true }
  } catch {
    return { copied: false }
  }
}
