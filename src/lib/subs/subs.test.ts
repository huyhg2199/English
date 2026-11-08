import { describe, expect, it } from 'vitest'

import { gradeCard } from '@/lib/srs'
import type { Store } from '@/lib/storage'

import {
  checkFill,
  cueAt,
  FILL_PAUSE_LEAD,
  fillDue,
  fillPercent,
  formatTime,
  highlightReason,
  isSubFile,
  knownWordsFromCardIds,
  knownWordsFromStore,
  shouldRecordRun,
  pickBlanks,
  readVideoPractice,
  recordVideoPractice,
  shortTenseName,
  splitByNotes,
  subLessonContext,
  tokenize,
  wordForms,
  type SubCue,
} from './index'

const cue = (start: number, end: number, en: string, extra: Partial<SubCue> = {}): SubCue => ({ start, end, en, vi: 'x', ...extra })
const CUES = [cue(1, 4, 'Hello.'), cue(4, 9.5, 'I am Anna.'), cue(11, 15, 'She works here.')]

describe('cueAt', () => {
  it('cue có start ≤ t < end', () => {
    expect(cueAt(CUES, 1)).toBe(0)
    expect(cueAt(CUES, 3.99)).toBe(0)
    expect(cueAt(CUES, 4)).toBe(1)
    expect(cueAt(CUES, 12.3)).toBe(2)
  })

  it('khoảng lặng, trước / sau video, thời điểm không đọc được → -1', () => {
    expect(cueAt(CUES, 10)).toBe(-1)
    expect(cueAt(CUES, 0)).toBe(-1)
    expect(cueAt(CUES, 15)).toBe(-1)
    expect(cueAt(CUES, 99)).toBe(-1)
    expect(cueAt(CUES, null)).toBe(-1)
    expect(cueAt(CUES, Number.NaN)).toBe(-1)
    expect(cueAt([], 1)).toBe(-1)
  })
})

describe('fillDue', () => {
  const all = () => true
  const none = new Set<number>()
  it('phát liền qua cuối cue có từ ẩn → hỏi cue đó (hơi sớm hơn end), cursor dời qua', () => {
    expect(fillDue(CUES, all, 9.0, 9.4, 0.4, 1, none)).toEqual({ due: [1], cursor: 2 })
    expect(fillDue(CUES, all, 9.5 - FILL_PAUSE_LEAD - 0.1, 9.5 - FILL_PAUSE_LEAD, 0.1, 1, none).due).toEqual([1])
    expect(fillDue(CUES, all, 8.0, 8.25, 0.25, 1, none)).toEqual({ due: [], cursor: 1 })
  })

  it('lần đọc bị trễ (bước lớn nhưng đúng bằng thời gian thật) → không coi là tua, trả mọi cue đã hết theo thứ tự', () => {
    expect(fillDue(CUES, all, 3.0, 15, 12, 0, none)).toEqual({ due: [0, 1, 2], cursor: 3 })
    const short = [cue(0, 0.5, 'a'), cue(0.5, 1, 'b'), cue(5, 6, 'c')]
    expect(fillDue(short, all, 0.1, 0.9, 0.25 * 4, 0, none).due).toEqual([0, 1])
  })

  it('tua (lùi, hoặc nhảy xa hơn thời gian thật) → không hỏi cue bị nhảy qua, cursor dời tới sau t', () => {
    expect(fillDue(CUES, all, 2, 12, 0.25, 0, none)).toEqual({ due: [], cursor: 2 })
    expect(fillDue(CUES, all, 14.9, 3, 0.25, 3, none)).toEqual({ due: [], cursor: 0 })
    expect(fillDue(CUES, all, null, 9.4, 0.25, 0, none)).toEqual({ due: [], cursor: 2 })
    expect(fillDue(CUES, all, 9, null, 0.25, 1, none)).toEqual({ due: [], cursor: 1 })
  })

  it('cue đã hỏi hoặc không có từ ẩn → không hỏi (cursor vẫn dời)', () => {
    expect(fillDue(CUES, all, 9.0, 9.4, 0.4, 1, new Set([1]))).toEqual({ due: [], cursor: 2 })
    expect(fillDue(CUES, (i) => i !== 1, 9.0, 9.4, 0.4, 1, none)).toEqual({ due: [], cursor: 2 })
  })
})

describe('tokenize / wordForms', () => {
  it('nối lại đúng câu gốc; giữ nháy và gạch nối giữa từ', () => {
    const t = tokenize("I'm gonna check-in, OK?")
    expect(t.map((x) => x.text).join('')).toBe("I'm gonna check-in, OK?")
    expect(t.filter((x) => x.word).map((x) => x.text)).toEqual(["I'm", 'gonna', 'check-in', 'OK'])
  })

  it('dạng gốc theo đuôi', () => {
    expect(wordForms('works')).toContain('work')
    expect(wordForms('Studied')).toContain('study')
    expect(wordForms('making')).toContain('make')
    expect(wordForms('stopped')).toContain('stop')
    expect(wordForms("Anna's")[0]).toBe('anna')
  })
})

describe('pickBlanks', () => {
  const words = (c: SubCue, idx: number[]) => idx.map((i) => tokenize(c.en)[i].text)
  it('câu ngắn ẩn 1 từ, ưu tiên từ đã học, bỏ từ chức năng', () => {
    const c = cue(0, 1, 'She works in the office.')
    expect(words(c, pickBlanks(c, new Set(['work']), new Set()))).toEqual(['works'])
    expect(words(c, pickBlanks(c, new Set(), new Set()))).toEqual(['office'])
  })

  it('câu dài ẩn 2 từ; từ của bài đứng sau từ đã học; vị trí tăng dần; xác định', () => {
    const c = cue(0, 1, 'Every morning my brother drives his old car to the busy station.')
    const idx = pickBlanks(c, new Set(['car']), new Set(['morning']))
    expect(words(c, idx)).toEqual(['morning', 'car'])
    expect(idx).toEqual([...idx].sort((a, b) => a - b))
    expect(pickBlanks(c, new Set(['car']), new Set(['morning']))).toEqual(idx)
  })

  it('bỏ tên riêng (viết hoa giữa câu); từ viết hoa đầu câu vẫn được xét', () => {
    const c = cue(0, 1, 'Anna lives in Washington. Pizza is good.')
    expect(words(c, pickBlanks(c, new Set(), new Set()))).toEqual(['lives'])
    const p = cue(0, 1, 'Pizza is in Washington.')
    expect(words(p, pickBlanks(p, new Set(), new Set()))).toEqual(['Pizza'])
    const d = cue(0, 1, 'Pete and Marsha visit friends.')
    expect(words(d, pickBlanks(d, new Set(), new Set()))).toEqual(['friends'])
  })

  it('không có từ nội dung (chỉ từ chức năng / số / nói tắt) → không ẩn', () => {
    expect(pickBlanks(cue(0, 1, 'I am. You are. 2020.'), new Set(), new Set())).toEqual([])
    expect(pickBlanks(cue(0, 1, "It's OK."), new Set(), new Set())).toEqual([])
  })
})

describe('checkFill', () => {
  it('không phân biệt hoa thường, dấu câu, khoảng trắng thừa', () => {
    expect(checkFill('works', 'Works')).toBe(true)
    expect(checkFill('works', ' works. ')).toBe(true)
    expect(checkFill("Anna's", 'annas')).toBe(true)
    expect(checkFill('check-in', 'check in')).toBe(true)
    expect(checkFill('check-in', 'checkin')).toBe(true)
    expect(checkFill('checkin', 'check-in')).toBe(true)
  })

  it('sai từ, ô trống → sai', () => {
    expect(checkFill('works', 'work')).toBe(false)
    expect(checkFill('works', '')).toBe(false)
    expect(checkFill('works', '  ...')).toBe(false)
  })

  it('fillPercent làm tròn; chưa làm câu nào → 0', () => {
    expect(fillPercent(7, 10)).toBe(70)
    expect(fillPercent(2, 3)).toBe(67)
    expect(fillPercent(0, 0)).toBe(0)
  })
})

describe('highlightReason', () => {
  const lesson = { tenses: [{ id: 'present-simple', name: 'Hiện tại đơn: câu khẳng định' }] }
  it('bài hiện tại đơn, cue "She works here." đánh dấu present-simple → "Hiện tại đơn"', () => {
    expect(highlightReason(cue(0, 1, 'She works here.', { highlight: ['present-simple'] }), lesson, new Set())).toBe('Hiện tại đơn')
  })

  it('từ đã học (bỏ từ chức năng, khớp dạng gốc); gộp với thì', () => {
    const c = cue(0, 1, 'She works in a big office.', { highlight: ['present-simple'] })
    expect(highlightReason(c, lesson, new Set(['work', 'office', 'she']))).toBe('Hiện tại đơn · Từ đã học: work, office')
    expect(highlightReason(cue(0, 1, 'a b c d'), lesson, new Set())).toBeNull()
  })

  it('thì không thuộc bài → không tô theo thì', () => {
    expect(highlightReason(cue(0, 1, 'I passed it!', { highlight: ['past-simple'] }), lesson, new Set())).toBeNull()
  })

  it('quá 3 từ đã học thì rút gọn', () => {
    const r = highlightReason(cue(0, 1, 'teacher student school office market'), { tenses: [] }, new Set(['teacher', 'student', 'school', 'office']))
    expect(r).toBe('Từ đã học: teacher, student, school…')
  })

  it('tên thì ngắn, từ đã học lấy từ id thẻ NGSL/TSL', () => {
    expect(shortTenseName('Quá khứ đơn: động từ có quy tắc')).toBe('Quá khứ đơn')
    expect(shortTenseName('Tương lai với will')).toBe('Tương lai với will')
    expect(shortTenseName('Ôn lại: viên gạch F13–F14 · to be (am / is / are)')).toBe('to be (am / is / are)')
    expect([...knownWordsFromCardIds(['ngsl-work', 'tsl-invoice', 'custom-abc', 'word-1'])]).toEqual(['work', 'invoice'])
  })
})

describe('subLessonContext', () => {
  it('bài hiện tại đơn có thì present-simple và từ của bài; bài không nội dung → rỗng', () => {
    const ctx = subLessonContext('s1-t1-w2')
    expect(ctx.tenses.map((t) => t.id)).toContain('present-simple')
    expect(ctx.words.size).toBeGreaterThan(0)
    for (const w of ctx.words) expect(w.length).toBeGreaterThanOrEqual(3)
    expect(subLessonContext('khong-co')).toEqual({ tenses: [], words: new Set() })
  })
})

describe('isSubFile', () => {
  const ok = { videoId: 'v', source: { channel: 'VOA Learning English', url: 'u', license: 'l', captionKind: 'uploaded' }, cues: CUES }
  it('file hợp lệ; cue chồng nhau, thiếu vi, chú thích sai loại → sai', () => {
    expect(isSubFile(ok)).toBe(true)
    expect(isSubFile({ ...ok, cues: [cue(1, 5, 'a'), cue(4, 6, 'b')] })).toBe(false)
    expect(isSubFile({ ...ok, cues: [{ start: 1, end: 2, en: 'a' }] })).toBe(false)
    expect(isSubFile({ ...ok, cues: [cue(1, 2, 'gonna', { notes: [{ term: 'gonna', kind: 'slang' as never, noteVi: 'x' }] })] })).toBe(false)
    expect(isSubFile({ ...ok, cues: [] })).toBe(false)
    expect(isSubFile(null)).toBe(false)
  })
})

describe('videoPractice (store)', () => {
  const empty = (): Store => ({ schemaVersion: 12, data: {} })
  const T1 = new Date('2026-11-02T10:00:00.000Z')
  const T2 = new Date('2026-11-02T11:00:00.000Z')
  it('xong 10 câu, đúng 7 → best 70, attempts 1; lần sau kém hơn giữ best, attempts + 1', () => {
    let s = recordVideoPractice(empty(), 'v', 7, 10, T1)
    expect(readVideoPractice(s)).toEqual({ v: { best: 70, attempts: 1, updatedAt: T1.toISOString() } })
    s = recordVideoPractice(s, 'v', 5, 10, T2)
    expect(readVideoPractice(s).v).toEqual({ best: 70, attempts: 2, updatedAt: T2.toISOString() })
    s = recordVideoPractice(s, 'v', 10, 10, T1)
    expect(readVideoPractice(s).v.best).toBe(100)
    expect(Date.parse(readVideoPractice(s).v.updatedAt)).toBeGreaterThan(T2.getTime())
  })

  it('chưa làm câu nào → không đổi store; mục sai dạng bị bỏ khi đọc', () => {
    const s = empty()
    expect(recordVideoPractice(s, 'v', 0, 0, T1)).toBe(s)
    expect(readVideoPractice({ schemaVersion: 12, data: { videoPractice: { items: { v: { best: 'x' } } } } })).toEqual({})
  })
})

describe('formatTime', () => {
  it('phút:giây', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(75.4)).toBe('1:15')
  })
})

describe('splitByNotes', () => {
  const gonna = { term: 'gonna', kind: 'reduction' as const, noteVi: 'going to' }
  it('cụm được chú thích tách riêng (không phân biệt hoa thường, đúng ranh giới từ); nối lại đúng câu', () => {
    const segs = splitByNotes("Gonna be fine, we're gonna win.", [gonna])
    expect(segs.map((s) => s.text).join('')).toBe("Gonna be fine, we're gonna win.")
    expect(segs.filter((s) => s.note).map((s) => s.text)).toEqual(['Gonna'])
    expect(splitByNotes('agonnaz', [gonna])).toEqual([{ text: 'agonnaz' }])
    expect(splitByNotes('', [])).toEqual([{ text: '' }])
  })

  it('cụm dài ưu tiên, không chồng nhau', () => {
    const notes = [{ term: 'up', kind: 'context' as const, noteVi: 'a' }, { term: 'give up', kind: 'idiom' as const, noteVi: 'b' }]
    const segs = splitByNotes("Don't give up.", notes)
    expect(segs.filter((s) => s.note).map((s) => s.text)).toEqual(['give up'])
  })
})

describe('shouldRecordRun', () => {
  it('chỉ ghi lượt có ≥ 5 câu đã trả lời, hoặc ≥ 50% số câu có từ ẩn của video', () => {
    expect(shouldRecordRun(1, 40)).toBe(false)
    expect(shouldRecordRun(4, 40)).toBe(false)
    expect(shouldRecordRun(5, 40)).toBe(true)
    expect(shouldRecordRun(2, 4)).toBe(true)
    expect(shouldRecordRun(1, 4)).toBe(false)
    expect(shouldRecordRun(0, 0)).toBe(false)
  })
})

describe('knownWordsFromStore', () => {
  it('thẻ SRS NGSL/TSL đã chấm → từ đã học', () => {
    const s = gradeCard({ schemaVersion: 12, data: {} }, 'ngsl-work', 'good', new Date('2026-11-02T10:00:00.000Z'))
    expect(knownWordsFromStore(s).has('work')).toBe(true)
    expect(knownWordsFromStore({ schemaVersion: 12, data: {} }).size).toBe(0)
  })
})
