import { describe, expect, it, vi } from 'vitest'

import { getLessonContent, getSpell, LESSON_CONTENTS, SPELLS, type Spell } from '@/data/lessons'

import { allowedGrammar, buildRoleplayPrompt, copyText, GEMINI_URL, roleplaySpells } from './roleplay'

const spells = (...ids: string[]): Spell[] => ids.map((id) => getSpell(id)!)
const lessonOf = (lessonId: string) => ({ lessonId, roleplay: getLessonContent(lessonId)!.roleplay! })
const pastLesson = lessonOf('s1-t2-w2')

describe('allowedGrammar', () => {
  it('chưa có thần chú nào → chỉ to be và hiện tại đơn', () => {
    expect(allowedGrammar([])).toEqual(['the verb "to be" (am / is / are)', 'the present simple (I work, she works)'])
  })

  it('Lumos, Alohomora, Accio → to be, hiện tại đơn, hiện tại tiếp diễn (không lặp)', () => {
    const g = allowedGrammar(spells('lumos', 'alohomora', 'accio'))
    expect(g).toHaveLength(3)
    expect(g.join(' ')).toMatch(/to be/)
    expect(g.join(' ')).toMatch(/present simple/)
    expect(g.join(' ')).toMatch(/present continuous/)
  })

  it('mở đủ mọi thần chú → có đủ chủ điểm của từng thần chú', () => {
    expect(allowedGrammar(SPELLS)).toHaveLength(SPELLS.length)
  })
})

describe('roleplaySpells', () => {
  it('thêm thần chú của chính bài, không trùng, theo thứ tự SPELLS', () => {
    expect(roleplaySpells('s1-t2-w2', spells('accio', 'lumos')).map((s) => s.id)).toEqual(['lumos', 'accio', 'obliviate'])
    expect(roleplaySpells('s1-t4-w3', []).map((s) => s.id)).toEqual(['riddikulus', 'finite'])
    expect(roleplaySpells('s1-t2-w2', spells('obliviate')).map((s) => s.id)).toEqual(['obliviate'])
    expect(roleplaySpells('s1-t4-w2', [])).toEqual([])
  })
})

describe('buildRoleplayPrompt', () => {
  it('chứa chủ đề tiếng Anh và tình huống của bài, tên Huy, luật sửa lỗi tiếng Việt, nói chậm câu ngắn', () => {
    const p = buildRoleplayPrompt(pastLesson, spells('lumos', 'alohomora', 'accio'))
    expect(p).toContain(`Topic of my lesson: ${pastLesson.roleplay.topicEn}.`)
    expect(p).toContain(pastLesson.roleplay.scenario)
    expect(p).toContain('My name is Huy.')
    expect(p).toMatch(/in Vietnamese/)
    expect(p).toMatch(/Speak slowly/)
    expect(p).toMatch(/short sentences/)
  })

  it('prompt không chứa chữ tiếng Việt có dấu (ngoài lời khen "Đúng rồi!")', () => {
    for (const c of LESSON_CONTENTS) {
      const p = buildRoleplayPrompt(lessonOf(c.lessonId), SPELLS).replace('Đúng rồi!', '')
      expect(p, c.lessonId).not.toMatch(/[À-ỹ]/)
    }
  })

  it('đã mở Lumos, Alohomora, Accio; đang ở bài quá khứ đơn → thêm quá khứ đơn, chưa có tương lai / hoàn thành', () => {
    const p = buildRoleplayPrompt(pastLesson, spells('lumos', 'alohomora', 'accio'))
    expect(p).toMatch(/present continuous/)
    expect(p).toMatch(/past simple with regular verbs/)
    expect(p).not.toMatch(/irregular/)
    expect(p).not.toMatch(/"will"/)
    expect(p).not.toMatch(/present perfect/)
  })

  it('xong T1–T2, ở bài will → cho phép tới quá khứ bất quy tắc và will (thì của bài), chưa có going to', () => {
    const t1t2 = SPELLS.filter((s) => s.lessonId.startsWith('s1-t1') || s.lessonId.startsWith('s1-t2'))
    const p = buildRoleplayPrompt(lessonOf('s1-t3-w1'), t1t2)
    expect(p).toMatch(/irregular verbs/)
    expect(p).toMatch(/"will"/)
    expect(p).not.toMatch(/going to/)
  })

  it('story 46: ở bài s1-t2-w4, chưa mở thần chú nào → prompt cho phép quá khứ tiếp diễn (thì của bài)', () => {
    const p = buildRoleplayPrompt(lessonOf('s1-t2-w4'), [])
    expect(p).toMatch(/past continuous/)
    expect(p).not.toMatch(/going to/)
  })

  it('chưa mở thần chú nào, bài không có thì riêng → câu đơn giản với to be và hiện tại đơn', () => {
    const p = buildRoleplayPrompt(lessonOf('s1-t4-w2'), [])
    expect(p).toMatch(/Only use this grammar: the verb "to be" \(am \/ is \/ are\); the present simple/)
    expect(p).toMatch(/very simple/)
    expect(p).not.toMatch(/continuous|past|perfect/)
  })

  it('bỏ tên được; không chứa thông tin cá nhân, nghề nghiệp, key hay token', () => {
    const DENY = [/\bdeveloper\b/i, /\bengineer\b/i, /\bprogrammer\b/i, /\bmanager\b/i, /\bcompany\b/i, /\bCEO\b/, /@/, /\bkey\b/i, /\btoken\b/i, /\bpassword\b/i]
    for (const c of LESSON_CONTENTS) {
      const p = buildRoleplayPrompt(lessonOf(c.lessonId), SPELLS, null)
      expect(p, c.lessonId).not.toMatch(/Huy/)
      for (const re of DENY) expect(p, `${c.lessonId}: ${re}`).not.toMatch(re)
    }
    expect(buildRoleplayPrompt(pastLesson, SPELLS, null)).toBe(buildRoleplayPrompt(pastLesson, SPELLS, null))
  })

  it('Gemini mở đúng trang app', () => {
    expect(GEMINI_URL).toBe('https://gemini.google.com/app')
  })
})

describe('copyText', () => {
  it('chép được → copied', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    expect(await copyText('hi', { writeText })).toEqual({ copied: true })
    expect(writeText).toHaveBeenCalledWith('hi')
  })

  it('clipboard bị chặn / không có / ném lỗi đồng bộ → copied false, không crash', async () => {
    expect(await copyText('hi', { writeText: () => Promise.reject(new Error('NotAllowedError')) })).toEqual({ copied: false })
    expect(await copyText('hi', undefined)).toEqual({ copied: false })
    expect(await copyText('hi', {})).toEqual({ copied: false })
    expect(
      await copyText('hi', {
        writeText: () => {
          throw new Error('boom')
        },
      }),
    ).toEqual({ copied: false })
  })
})
