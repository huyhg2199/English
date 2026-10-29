import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { matchRoutes } from 'react-router'
import { describe, expect, it } from 'vitest'

import { routes } from '@/app/routes'

import {
  allLessons,
  getLesson,
  getSection,
  lessonHref,
  resolveLessonRoute,
  resourcesForSection,
  sectionHref,
  SCORE_ESTIMATE_NOTE,
  SKILL_TAGS,
  STAGES,
  type Lesson,
  type Stage,
} from './index'

const MD_PATH = fileURLToPath(
  new URL(
    '../../../_bmad-output/brainstorming/brainstorm-english-learning-website-2026-10-29/lo-trinh-toeic-12-thang.md',
    import.meta.url,
  ),
)

/** Bỏ định dạng markdown (*, **) để so với chữ thuần trong dữ liệu. */
const plain = (s: string) => s.replace(/\*/g, '').trim()

const md = readFileSync(MD_PATH, 'utf8')
const mdPlain = plain(md)
const lines = md.split('\n')

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map(plain)
}

/** Các dòng dữ liệu của bảng có dòng tiêu đề bắt đầu bằng `headerPrefix` (lần xuất hiện thứ `nth`). */
function tableRows(headerPrefix: string, nth = 0): string[][] {
  const headers = lines.flatMap((l, i) => (l.startsWith(headerPrefix) ? [i] : []))
  const start = headers[nth]
  expect(start, `không thấy bảng "${headerPrefix}" #${nth}`).toBeDefined()
  const rows: string[][] = []
  for (let i = start + 2; i < lines.length && lines[i].startsWith('|'); i++) rows.push(cells(lines[i]))
  return rows
}

const stageLessons = (stage: Stage): Lesson[] => stage.months.flatMap((m) => [...m.lessons])

describe('cấu trúc dữ liệu lộ trình', () => {
  it('3 chặng, 12 tháng, 48 bài, mỗi tháng 4 tuần', () => {
    expect(STAGES).toHaveLength(3)
    expect(STAGES.flatMap((s) => s.months)).toHaveLength(12)
    expect(allLessons()).toHaveLength(48)
    for (const month of STAGES.flatMap((s) => s.months)) {
      expect(month.lessons.map((l) => l.week)).toEqual([1, 2, 3, 4])
    }
  })

  it('tên chặng theo theme Harry Potter', () => {
    expect(STAGES.map((s) => s.yearLabel)).toEqual(['Năm 1–2', 'Năm 3–4', 'Năm 5–7'])
    expect(STAGES.map((s) => s.checkpoint.name)).toEqual(['O.W.L. 1', 'O.W.L. 2', 'N.E.W.T.'])
  })

  it('id chặng, tháng, bài duy nhất; id bài khớp chặng/tháng/tuần', () => {
    const ids = [
      ...STAGES.map((s) => s.id),
      ...STAGES.flatMap((s) => s.months.map((m) => m.id)),
      ...allLessons().map((l) => l.id),
    ]
    expect(new Set(ids).size).toBe(ids.length)
    for (const stage of STAGES) {
      for (const month of stage.months) {
        for (const lesson of month.lessons) {
          expect(lesson.id).toBe(`${stage.id}-${month.id}-w${lesson.week}`)
          expect(lesson.stageId).toBe(stage.id)
          expect(lesson.monthId).toBe(month.id)
        }
      }
    }
  })

  it('id đoạn duy nhất trong bài, mọi đoạn có tag thuộc tập cho phép', () => {
    for (const lesson of allLessons()) {
      const sectionIds = lesson.sections.map((s) => s.id)
      expect(new Set(sectionIds).size, lesson.id).toBe(sectionIds.length)
      expect(lesson.sections.length, lesson.id).toBeGreaterThan(0)
      for (const section of lesson.sections) {
        expect(section.tags.length, `${lesson.id}/${section.id}`).toBeGreaterThan(0)
        for (const tag of section.tags) expect(SKILL_TAGS).toContain(tag)
      }
    }
  })

  it('tuần kiểm tra trỏ tới kỳ kiểm tra của chặng và nằm cuối chặng', () => {
    for (const stage of STAGES) {
      const checkpointLessons = stageLessons(stage).filter((l) => l.checkpointId)
      expect(checkpointLessons.length).toBe(stage.checkpoint.attempts)
      for (const lesson of checkpointLessons) {
        expect(lesson.checkpointId).toBe(stage.checkpoint.id)
        expect(lesson.sections.some((s) => s.id === 'checkpoint')).toBe(true)
      }
      expect(stageLessons(stage).at(-1)!.checkpointId).toBe(stage.checkpoint.id)
    }
  })

  it('đoạn nào cũng có ít nhất một nguồn miễn phí', () => {
    for (const stage of STAGES) {
      for (const lesson of stageLessons(stage)) {
        for (const section of lesson.sections) {
          expect(resourcesForSection(stage, section).length, `${lesson.id}/${section.id}`).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('lookup', () => {
  it('getLesson / getSection', () => {
    expect(getLesson('s1-t1-w3')?.title).toMatch(/Hiện tại đơn/)
    expect(getSection('s1-t1-w3', 'grammar')?.task).toBe('Hiện tại đơn: câu hỏi, phủ định')
    expect(getLesson('abc')).toBeUndefined()
    expect(getSection('s1-t1-w3', 'xyz')).toBeUndefined()
    expect(getSection('abc', 'grammar')).toBeUndefined()
  })

  describe('resolveLessonRoute — I/O Matrix trang bài', () => {
    const resolve = (path: string) => {
      const params = matchRoutes(routes, path)!.at(-1)!.params
      return resolveLessonRoute(params.lessonId, params.sectionId)
    }

    it('link đúng → mở bài, đoạn đích là grammar', () => {
      const { entry, targetSectionId } = resolve('/roadmap/lesson/s1-t1-w3/grammar')
      expect(entry?.lesson.id).toBe('s1-t1-w3')
      expect(targetSectionId).toBe('grammar')
    })

    it('bài không tồn tại → không có bài (trang "Không tìm thấy bài")', () => {
      expect(resolve('/roadmap/lesson/abc/xyz')).toEqual({ entry: undefined, targetSectionId: undefined })
    })

    it('đoạn không tồn tại → mở bài, không có đoạn đích', () => {
      const { entry, targetSectionId } = resolve('/roadmap/lesson/s1-t1-w3/xyz')
      expect(entry?.lesson.id).toBe('s1-t1-w3')
      expect(targetSectionId).toBeUndefined()
    })

    it('không có sectionId → mở bài từ đầu', () => {
      expect(resolve('/roadmap/lesson/s1-t1-w3').targetSectionId).toBeUndefined()
    })
  })

  it('sectionHref đúng dạng trong Design Notes', () => {
    expect(sectionHref('s1-t1-w3', 'grammar')).toBe('/roadmap/lesson/s1-t1-w3/grammar')
    expect(lessonHref('s1-t1-w3')).toBe('/roadmap/lesson/s1-t1-w3')
  })

  it('sectionHref của mọi đoạn và lessonHref của mọi bài khớp route trang bài', () => {
    const lessonRoute = (path: string) => {
      const matches = matchRoutes(routes, path)
      expect(matches, path).not.toBeNull()
      const leaf = matches!.at(-1)!
      expect(leaf.route.path, path).toBe('roadmap/lesson/:lessonId/:sectionId?')
      expect(leaf.route.element).toBeTruthy()
      return leaf.params
    }
    for (const lesson of allLessons()) {
      expect(lessonRoute(lessonHref(lesson.id)).lessonId).toBe(lesson.id)
      for (const section of lesson.sections) {
        const params = lessonRoute(sectionHref(lesson.id, section.id))
        expect(params).toMatchObject({ lessonId: lesson.id, sectionId: section.id })
      }
    }
  })
})

describe('đối chiếu với lo-trinh-toeic-12-thang.md', () => {
  it('bảng tổng quan 3 chặng', () => {
    const rows = tableRows('| Chặng | Tháng | Năm học |')
    expect(rows).toHaveLength(3)
    rows.forEach(([name, months, year, focus, checkpoint, estimate], i) => {
      const s = STAGES[i]
      expect(name).toBe(`${s.number}. ${s.name} ${s.scoreGoal}`)
      expect(months).toBe(`${s.monthRange} (${s.period})`)
      expect(year).toBe(s.yearLabel)
      expect(focus).toBe(s.focus)
      expect(checkpoint.startsWith(s.checkpoint.name)).toBe(true)
      expect(estimate).toBe(s.estimatedScore)
    })
  })

  it('tiêu đề từng chặng', () => {
    for (const s of STAGES) {
      expect(mdPlain).toContain(`## ${s.number + 2}. Chặng ${s.number} — ${s.name} (${s.yearLabel}) · ${s.monthRange} · ${s.scoreGoal}`)
    }
  })

  it('bảng tuần chặng 1: phát âm, ngữ pháp, từ vựng lũy kế, giải trí', () => {
    const rows = tableRows('| Tháng | Tuần | Phát âm / Nghe |')
    const stage = STAGES[0]
    const lessons = stageLessons(stage)
    expect(rows).toHaveLength(lessons.length)

    let month = ''
    rows.forEach(([monthCell, weekCell, pron, grammar, words, fun], i) => {
      const lesson = lessons[i]
      const label = `${lesson.id}`
      if (monthCell) month = monthCell
      const m = stage.months.find((x) => x.id === lesson.monthId)!
      expect(month, label).toBe(`${m.label} (${m.period}${m.note ? `, ${m.note}` : ''})`)
      expect(String(lesson.week), label).toBe(weekCell)

      expect(getSection(lesson.id, 'pronunciation')?.task, label).toBe(pron)

      if (grammar === '—') {
        expect(getSection(lesson.id, 'grammar'), label).toBeUndefined()
        expect(lesson.checkpointId, label).toBeUndefined()
      } else if (lesson.checkpointId) {
        expect(getSection(lesson.id, 'checkpoint')?.task, label).toBe(grammar)
        expect(grammar).toBe(stage.checkpoint.name)
      } else {
        expect(getSection(lesson.id, 'grammar')?.task, label).toBe(grammar)
      }

      expect(lesson.cumulativeWords, label).toBe(Number(words))
      expect(getSection(lesson.id, 'vocabulary')?.task, label).toContain(words)

      if (fun === '—') expect(getSection(lesson.id, 'entertainment'), label).toBeUndefined()
      else expect(getSection(lesson.id, 'entertainment')?.task, label).toBe(fun)
    })
  })

  it.each([
    [2, 0],
    [3, 1],
  ])('bảng tháng chặng %i: mỗi ô là đoạn chính của tuần', (stageNumber, nth) => {
    const rows = tableRows('| Tháng | Tuần 1 | Tuần 2 | Tuần 3 | Tuần 4 |', nth)
    const stage = STAGES[stageNumber - 1]
    expect(rows).toHaveLength(stage.months.length)
    rows.forEach(([monthCell, ...weeks], i) => {
      const month = stage.months[i]
      expect(monthCell).toBe(`${month.label} (${month.period})`)
      expect(weeks).toHaveLength(4)
      weeks.forEach((cell, w) => {
        const lesson = month.lessons[w]
        expect(lesson.sections, lesson.id).toHaveLength(1)
        const sec = lesson.sections[0]
        expect(sec.id).toBe(lesson.checkpointId ? 'checkpoint' : 'main')
        expect(sec.task, lesson.id).toBe(cell)
        if (lesson.checkpointId) expect(cell.startsWith(stage.checkpoint.name)).toBe(true)
      })
    })
  })

  it('tag theo Part: Part 1–4 → listening, Part 5–7 → reading', () => {
    for (const stage of STAGES.slice(1)) {
      for (const lesson of stageLessons(stage)) {
        const { task, tags } = lesson.sections[0]
        for (const [, part] of task.matchAll(/Part (\d)/g)) {
          expect(tags, `${lesson.id}: ${task}`).toContain(Number(part) <= 4 ? 'listening' : 'reading')
        }
      }
    }
  })

  it('Can-do, nội dung, việc cố định, kỳ kiểm tra khớp nguyên văn', () => {
    for (const s of STAGES) {
      const texts = [
        ...s.canDo,
        ...s.content,
        ...s.fixedTasks,
        ...s.checkpoint.scope,
        s.checkpoint.passThreshold,
        s.checkpoint.ifNotPassed,
      ]
      for (const text of texts) expect(mdPlain, `${s.id}: ${text}`).toContain(text)
    }
    expect(mdPlain).toContain(SCORE_ESTIMATE_NOTE)
  })

  it('kỳ kiểm tra O.W.L. ghi đúng thời điểm', () => {
    for (const s of STAGES.slice(0, 2)) expect(mdPlain).toContain(`${s.checkpoint.name} (${s.checkpoint.when}):`)
  })

  it('nguồn miễn phí khớp bảng của từng chặng', () => {
    for (const s of STAGES) {
      for (const r of s.resources) expect(mdPlain, `${s.id}: ${r.area}`).toContain(`| ${r.area} | ${r.items} |`)
    }
  })
})
