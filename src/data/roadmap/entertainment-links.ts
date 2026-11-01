import type { Lesson } from './types'

/**
 * Link chọn sẵn cho phần 10' giải trí (story 4). URL gốc lấy từ `nguon-hoc-mien-phi.md` (xác minh 2026-10-30).
 * Chỉ là link ra ngoài (VOA, BBC… không có CORS).
 */
export type EntertainmentLink = { name: string; url: string }

type Source = EntertainmentLink & {
  pattern: RegExp
  /** Các nguồn cùng nhóm: chỉ lấy nguồn khớp đầu tiên (vd BBC Tim's Workshop thay cho BBC chung). */
  group?: string
}

/** Thứ tự: cụ thể trước, chung sau. */
const SOURCES: readonly Source[] = [
  { name: 'LyricsTraining', url: 'https://lyricstraining.com/', pattern: /lyrics\s*training/i },
  { name: 'VOA Learning English', url: 'https://learningenglish.voanews.com/', pattern: /\bVOA\b/i },
  { name: 'YouGlish', url: 'https://youglish.com/', pattern: /you\s*glish/i },
  { name: 'ELLLO', url: 'https://www.elllo.org/', pattern: /\bELLLO\b/i },
  {
    name: "BBC: Tim's Pronunciation Workshop",
    url: 'https://www.bbc.co.uk/learningenglish/english/features/pronunciation/tims-pronunciation-workshop-ep-1',
    pattern: /tim['’]?s\s+pronunciation\s+workshop/i,
    group: 'bbc',
  },
  {
    name: 'BBC 6 Minute English',
    url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
    pattern: /6\s*minute\s*english/i,
    group: 'bbc',
  },
  { name: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/', pattern: /\bBBC\b/i, group: 'bbc' },
  { name: 'TED-Ed', url: 'https://ed.ted.com/', pattern: /TED-?Ed/i },
  { name: 'Breaking News English', url: 'https://breakingnewsenglish.com/', pattern: /breaking\s*news\s*english/i },
  { name: 'ESL Lab', url: 'https://www.esl-lab.com/', pattern: /ESL\s*Lab/i },
]

const byName = (name: string) => {
  const s = SOURCES.find((x) => x.name === name)!
  return { name: s.name, url: s.url }
}

/** Bài không nhắc nguồn nào thì hiện 3 link này. */
export const DEFAULT_ENTERTAINMENT_LINKS: readonly EntertainmentLink[] = [
  byName('LyricsTraining'),
  byName('VOA Learning English'),
  byName('YouGlish'),
]

/** Việc của đoạn giải trí trong bài (chặng 2–3 không có đoạn này → null). */
export function entertainmentTask(lesson: Lesson | null | undefined): string | null {
  return lesson?.sections.find((s) => s.id === 'entertainment')?.task ?? null
}

/** Link ứng với nguồn được nhắc tên trong việc giải trí của bài; không nhắc nguồn nào → 3 link mặc định. */
export function entertainmentLinks(lesson: Lesson | null | undefined): readonly EntertainmentLink[] {
  const task = entertainmentTask(lesson)
  if (!task) return DEFAULT_ENTERTAINMENT_LINKS
  const groups = new Set<string>()
  const links: EntertainmentLink[] = []
  for (const s of SOURCES) {
    if (!s.pattern.test(task)) continue
    if (s.group) {
      if (groups.has(s.group)) continue
      groups.add(s.group)
    }
    links.push({ name: s.name, url: s.url })
  }
  return links.length > 0 ? links : DEFAULT_ENTERTAINMENT_LINKS
}
