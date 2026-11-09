import { describe, expect, it } from 'vitest'

import { getLesson, type Section } from '@/data/roadmap'
import { prioritizeSections } from '@/lib/placement'

import { lessonTocGroups } from './lesson-toc'

const sec = (id: Section['id'], title: string = id, tags: Section['tags'] = []): Section => ({ id, title, task: '', tags })

describe('lessonTocGroups (story 30)', () => {
  it('s1-t1-w1, yếu nhất vocabulary: nhóm đúng thứ tự thẻ đoạn, mục ưu tiên giữ cờ', () => {
    const lesson = getLesson('s1-t1-w1')!
    const ordered = prioritizeSections(lesson.sections, 'vocabulary')
    const groups = lessonTocGroups(ordered)
    expect(groups.map((g) => g.title)).toEqual(['1. Lý thuyết', '2. Luyện', '3. Giải trí'])
    expect(groups.map((g) => g.key)).toEqual(['theory', 'practice', 'fun'])
    // Gộp lại đúng thứ tự `prioritizeSections`.
    expect(groups.flatMap((g) => g.items.map((i) => i.id))).toEqual(ordered.map((o) => o.section.id))
    expect(groups[0].items.map((i) => i.id)).toEqual(['pronunciation', 'grammar'])
    const vocab = groups[1].items.find((i) => i.id === 'vocabulary')
    expect(vocab).toMatchObject({ priority: true, current: false })
    expect(groups.flatMap((g) => g.items).filter((i) => i.priority)).toHaveLength(
      ordered.filter((o) => o.priority).length,
    )
    expect(groups[2].items.map((i) => i.id)).toEqual(['entertainment'])
    // Tên mục = tên đoạn.
    for (const o of ordered)
      expect(groups.flatMap((g) => g.items).find((i) => i.id === o.section.id)?.title).toBe(o.section.title)
  })

  it('targetId trùng → mục đó current; id lạ / không có → không mục nào current', () => {
    const ordered = prioritizeSections(getLesson('s1-t1-w1')!.sections, null)
    const current = (target?: string | null) =>
      lessonTocGroups(ordered, target)
        .flatMap((g) => g.items)
        .filter((i) => i.current)
        .map((i) => i.id)
    expect(current('grammar')).toEqual(['grammar'])
    expect(current('xyz')).toEqual([])
    expect(current(undefined)).toEqual([])
    expect(current(null)).toEqual([])
  })

  it('bài không có đoạn lý thuyết → bỏ nhóm Lý thuyết, đánh số lại', () => {
    const ordered = prioritizeSections([sec('main', 'Bài chính'), sec('checkpoint'), sec('entertainment')], null)
    const groups = lessonTocGroups(ordered)
    expect(groups.map((g) => g.title)).toEqual(['1. Luyện', '2. Giải trí'])
    expect(groups[0].items.map((i) => i.id)).toEqual(['main', 'checkpoint'])
  })

  it('chỉ có entertainment → một nhóm "1. Giải trí"', () => {
    const groups = lessonTocGroups(prioritizeSections([sec('entertainment', 'Giải trí 10\'')], 'vocabulary'))
    expect(groups).toEqual([
      { key: 'fun', title: '1. Giải trí', items: [{ id: 'entertainment', title: "Giải trí 10'", priority: false, current: false }] },
    ])
  })

  it('không có đoạn nào → []', () => {
    expect(lessonTocGroups([])).toEqual([])
  })
})
