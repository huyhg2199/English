import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { DEFAULT_ENTERTAINMENT_LINKS, entertainmentLinks, entertainmentTask } from './entertainment-links'
import { allLessons, getLesson } from './lookup'

const SOURCES_MD = readFileSync(
  new URL(
    '../../../_bmad-output/brainstorming/brainstorm-english-learning-website-2026-10-29/nguon-hoc-mien-phi.md',
    import.meta.url,
  ),
  'utf8',
)

const lessonWith = (task: string) => ({ ...getLesson('s1-t1-w1')!, sections: [{ id: 'entertainment' as const, title: '', task, tags: [] }] })

describe('entertainmentLinks', () => {
  it('nguồn được nhắc tên → link gốc tương ứng', () => {
    expect(entertainmentLinks(lessonWith('LyricsTraining, mức Beginner')).map((l) => l.name)).toEqual(['LyricsTraining'])
    expect(entertainmentLinks(lessonWith('VOA L1/L2')).map((l) => l.url)).toEqual(['https://learningenglish.voanews.com/'])
    expect(entertainmentLinks(lessonWith('ELLLO, bài cấp thấp'))[0].url).toBe('https://www.elllo.org/')
    expect(entertainmentLinks(lessonWith('YouGlish 5 từ/ngày'))[0].name).toBe('YouGlish')
  })

  it("BBC Tim's Workshop → link tập Workshop, không thêm BBC chung", () => {
    const links = entertainmentLinks(lessonWith("BBC Tim's Pronunciation Workshop"))
    expect(links).toHaveLength(1)
    expect(links[0].url).toContain('tims-pronunciation-workshop')
  })

  it('bài không nhắc nguồn nào / không có đoạn giải trí / hết lộ trình → 3 link mặc định', () => {
    expect(entertainmentLinks(lessonWith('Phim có sub Anh+Việt'))).toBe(DEFAULT_ENTERTAINMENT_LINKS)
    const s2 = allLessons().find((l) => l.stageId === 's2')!
    expect(entertainmentTask(s2)).toBeNull()
    expect(entertainmentLinks(s2)).toBe(DEFAULT_ENTERTAINMENT_LINKS)
    expect(entertainmentLinks(null).map((l) => l.name)).toEqual(['LyricsTraining', 'VOA Learning English', 'YouGlish'])
  })

  it('mọi bài chặng 1 đều có link; mọi URL có trong nguon-hoc-mien-phi.md', () => {
    const urls = new Set<string>()
    for (const lesson of allLessons()) {
      const links = entertainmentLinks(lesson)
      expect(links.length).toBeGreaterThan(0)
      links.forEach((l) => urls.add(l.url))
    }
    urls.add('https://ed.ted.com/')
    urls.add('https://breakingnewsenglish.com/')
    urls.add('https://www.esl-lab.com/')
    for (const url of urls) expect(SOURCES_MD, url).toContain(url)
  })
})
