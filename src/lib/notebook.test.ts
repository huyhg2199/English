import { describe, expect, it } from 'vitest'

import type { StudyWord, Word } from '@/data/vocab'
import {
  createNote,
  deleteNote,
  filterNotebook,
  isNote,
  listNotes,
  noteId,
  readNotes,
  updateNote,
} from '@/lib/notes'
import {
  addToSrs,
  checkSelection,
  customStudyWords,
  deleteSavedWord,
  filterSaved,
  findVocabWord,
  groupSavedByDay,
  isSavedWord,
  listSaved,
  MAX_PHRASE_LENGTH,
  originsByWord,
  readSavedWords,
  safeSourceHref,
  saveWord,
  savedCardId,
  savedWordId,
  savedWordsOn,
  sentenceFor,
} from '@/lib/saved-words'
import { addedCard, buildSession, gradeCard, isCustomWord, isSrsCard, NEW_PER_DAY, readSrs, type SrsCard } from '@/lib/srs'
import { buildStudySession, flashcardSummary } from '@/lib/flashcard-session'
import { CURRENT_VERSION, migrations, runMigrations, type Store } from '@/lib/storage'
import { mergeNoteItems, mergeSavedWordItems, mergeWithRemote } from '@/lib/sync/merge'
import { foldText } from '@/lib/text-fold'

const NOW = new Date(2026, 10, 5, 21, 30)
const LATER = new Date(2026, 10, 5, 21, 45)
const NEXT_DAY = new Date(2026, 10, 6, 9, 0)
const store = (data: Record<string, unknown> = {}): Store => ({ schemaVersion: CURRENT_VERSION, data })
const news = { title: 'AI news', url: 'https://example.com/a' }

function study(id: string, w: string, list: 'ngsl' | 'tsl' = 'ngsl', rank = 1): StudyWord {
  return {
    id,
    word: w,
    list,
    rank,
    pos: 'noun',
    ipa: 'x',
    syllables: [w],
    stressIndex: 0,
    meaningVi: 'nghĩa',
    exampleEn: 'Example.',
    exampleVi: 'Ví dụ.',
  }
}
const MODEL = study('ngsl-model', 'model', 'ngsl', 500)
const NGSL: Word[] = [MODEL, ...Array.from({ length: 30 }, (_, i) => study(`ngsl-w${i + 1}`, `w${i + 1}`, 'ngsl', i + 1))]

function ok<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  if (!r.ok) throw new Error(`expected ok: ${JSON.stringify(r)}`)
  return r as Extract<T, { ok: true }>
}

describe('lưu 1 chạm (story 8)', () => {
  it('chạm "model" trong tin → lưu kèm câu + nguồn, hiện trong Sổ tay', () => {
    const s = saveWord(store(), { word: 'model', sentence: 'The new model is fast.', source: news }, NOW)
    const list = listSaved(readSavedWords(s))
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ word: 'model', sentence: 'The new model is fast.', source: news })
  })

  it('bôi đen "take part in" → lưu cụm (gộp khoảng trắng), câu chứa nó', () => {
    const text = 'We meet daily. Teams take  part in the review. Done.'
    const sel = 'take  part\nin'
    const check = checkSelection(sel)
    expect(check).toEqual({ ok: true, phrase: 'take part in' })
    expect(sentenceFor(text, sel)).toBe('Teams take part in the review.')
    const s = saveWord(store(), { word: sel, sentence: sentenceFor(text, sel), source: news }, NOW)
    expect(Object.keys(readSavedWords(s))).toEqual([savedWordId('take part in', NOW)])
  })

  it('vùng chọn vắt qua 2 câu → câu gốc là chính vùng chọn', () => {
    expect(sentenceFor('One here. Two there.', 'here. Two')).toBe('here. Two')
  })

  it(`chọn quá ${MAX_PHRASE_LENGTH} ký tự → báo quá dài; chỉ dấu câu → rỗng`, () => {
    expect(checkSelection('a'.repeat(MAX_PHRASE_LENGTH + 1))).toEqual({ ok: false, reason: 'too-long' })
    expect(checkSelection('a'.repeat(MAX_PHRASE_LENGTH))).toMatchObject({ ok: true })
    expect(checkSelection(' ... ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('lưu lại cùng từ cùng ngày → không tạo bản trùng', () => {
    const s = saveWord(store(), { word: 'Model', sentence: 'a', source: news }, NOW)
    expect(saveWord(s, { word: 'model', sentence: 'b', source: news }, LATER)).toBe(s)
  })

  it('mục story 4 (không có field mới) vẫn hợp lệ; field mới sai kiểu thì không hợp lệ', () => {
    const old = { word: 'ai', sentence: 's', source: news, savedAt: NOW.toISOString(), updatedAt: NOW.toISOString() }
    expect(isSavedWord(old)).toBe(true)
    expect(isSavedWord({ ...old, inSrs: 'yes' })).toBe(false)
    expect(isSavedWord({ ...old, meaningVi: 1 })).toBe(false)
    expect(isSavedWord({ ...old, deleted: 'no' })).toBe(false)
  })
})

describe('xoá mục lưu', () => {
  it('ghi dấu deleted + updatedAt mới; ẩn khỏi Sổ tay và khỏi đếm ngày lười', () => {
    const id = savedWordId('model', NOW)
    const s = saveWord(store(), { word: 'model', sentence: 'x', source: news }, NOW)
    const d = deleteSavedWord(s, id, LATER)
    const item = readSavedWords(d)[id] as { deleted: boolean; updatedAt: string }
    expect(item.deleted).toBe(true)
    expect(Date.parse(item.updatedAt)).toBeGreaterThan(Date.parse(NOW.toISOString()))
    expect(listSaved(readSavedWords(d))).toEqual([])
    expect(savedWordsOn(readSavedWords(d), NOW)).toEqual([])
    expect(deleteSavedWord(d, id, LATER)).toBe(d)
    expect(deleteSavedWord(d, 'nope', LATER)).toBe(d)
  })

  it('lưu lại từ đã xoá cùng ngày → mục sống lại (do Huy chủ động), updatedAt mới hơn', () => {
    const id = savedWordId('model', NOW)
    let s = saveWord(store(), { word: 'model', sentence: 'x', source: news }, NOW)
    s = deleteSavedWord(s, id, LATER)
    const again = saveWord(s, { word: 'model', sentence: 'y', source: news }, LATER)
    expect(listSaved(readSavedWords(again)).map((e) => e.sentence)).toEqual(['y'])
  })

  it('xoá ở A, máy B còn bản cũ → sau đồng bộ mục vẫn bị xoá (cả hai chiều)', () => {
    const id = savedWordId('model', NOW)
    const base = saveWord(store(), { word: 'model', sentence: 'x', source: news }, NOW)
    const onA = deleteSavedWord(base, id, LATER)
    const a = readSavedWords(onA)
    const b = readSavedWords(base)
    expect((mergeSavedWordItems(a, b)[id] as { deleted: boolean }).deleted).toBe(true)
    expect((mergeSavedWordItems(b, a)[id] as { deleted: boolean }).deleted).toBe(true)
    const r = mergeWithRemote(base, { schemaVersion: CURRENT_VERSION, data: onA.data, updatedAt: LATER.toISOString() })
    if (r.kind !== 'merged') throw new Error('merged')
    expect(listSaved(readSavedWords(r.store))).toEqual([])
  })
})

describe('Thêm vào flashcard', () => {
  it('từ có trong NGSL, chưa có thẻ → thẻ ngsl-model vào phiên hôm nay, không trừ quota; mặt sau có câu gốc', () => {
    const id = savedWordId('model', NOW)
    let s = saveWord(store(), { word: 'model', sentence: 'The model works.', source: news }, NOW)
    const vocab = findVocabWord(NGSL, 'model')
    expect(vocab?.id).toBe('ngsl-model')
    const r = ok(addToSrs(s, id, { vocab }, NOW))
    s = r.store
    expect(r.cardId).toBe('ngsl-model')
    const card = readSrs(s).cards['ngsl-model'] as SrsCard
    expect(card.added).toBe(true)
    const session = buildSession(readSrs(s), NGSL, LATER)
    expect(session.queue.find((i) => i.word.id === 'ngsl-model')?.kind).toBe('new')
    expect(session.introducedToday).toBe(0)
    // 10 từ mới theo quota + thẻ Huy tự thêm (không trừ quota).
    expect(session.newCount).toBe(NEW_PER_DAY + 1)
    expect(session.dueCount).toBe(0)

    // Chấm "Khó" cùng ngày: vẫn không tính vào quota; thẻ giờ là thẻ đang học.
    s = gradeCard(s, 'ngsl-model', 'hard', LATER)
    const after = buildSession(readSrs(s), NGSL, new Date(LATER.getTime() + 11 * 60_000))
    expect(after.introducedToday).toBe(0)
    expect(after.newCount).toBe(NEW_PER_DAY)
    expect(after.queue.find((i) => i.word.id === 'ngsl-model')?.kind).toBe('review')
    expect(originsByWord(readSavedWords(s)).get('model')).toEqual([{ sentence: 'The model works.', source: news }])
  })

  it('từ đã có lịch SRS → không đổi lịch, chỉ đánh dấu inSrs (mặt sau thêm câu gốc)', () => {
    const id = savedWordId('model', NOW)
    let s = gradeCard(store(), 'ngsl-model', 'good', new Date(2026, 10, 1, 9))
    const before = readSrs(s).cards['ngsl-model']
    s = saveWord(s, { word: 'model', sentence: 'x', source: news }, NOW)
    s = ok(addToSrs(s, id, { vocab: MODEL }, NOW)).store
    expect(readSrs(s).cards['ngsl-model']).toBe(before)
    expect((readSavedWords(s)[id] as { inSrs: boolean }).inSrs).toBe(true)
  })

  it('cụm ngoài danh sách + nghĩa → thẻ saved-<id> trong phiên; mặt sau có nghĩa + câu gốc', () => {
    const id = savedWordId('take part in', NOW)
    let s = saveWord(store(), { word: 'take part in', sentence: 'Teams take part in it.', source: news }, NOW)
    expect(findVocabWord(NGSL, 'take part in')).toBeUndefined()
    const r = ok(addToSrs(s, id, { meaningVi: '  tham gia ' }, NOW))
    s = r.store
    expect(r.cardId).toBe(savedCardId(id))
    const custom = customStudyWords(readSavedWords(s))
    expect(custom).toEqual([
      { id: savedCardId(id), custom: true, word: 'take part in', meaningVi: 'tham gia', sentence: 'Teams take part in it.', source: news },
    ])
    const session = buildSession(readSrs(s), NGSL, LATER, undefined, 'ngsl', custom)
    const item = session.queue.find((i) => i.word.id === savedCardId(id))
    expect(item && isCustomWord(item.word)).toBe(true)
    expect(item?.kind).toBe('new')
    expect(session.introducedToday).toBe(0)
    expect(session.newCount).toBe(NEW_PER_DAY + 1)
    // Không phải từ trong danh sách → không có "câu gốc" cho thẻ NGSL nào.
    expect(originsByWord(readSavedWords(s)).size).toBe(0)
  })

  it('cùng cụm lưu ở 2 ngày, thêm vào flashcard cả hai → dùng lại thẻ cũ, không tạo thẻ thứ hai', () => {
    const id1 = savedWordId('take part in', NOW)
    const id2 = savedWordId('take part in', NEXT_DAY)
    let s = saveWord(store(), { word: 'take part in', sentence: 'a', source: news }, NOW)
    s = ok(addToSrs(s, id1, { meaningVi: 'tham gia' }, NOW)).store
    s = saveWord(s, { word: 'take part in', sentence: 'b', source: news }, NEXT_DAY)
    // Không cần nhập lại nghĩa: lấy từ mục đã có thẻ.
    const r = ok(addToSrs(s, id2, {}, NEXT_DAY))
    expect(r.cardId).toBe(savedCardId(id1))
    s = r.store
    expect(readSavedWords(s)[id2]).toMatchObject({ inSrs: true, meaningVi: 'tham gia' })
    expect(Object.keys(readSrs(s).cards)).toEqual([savedCardId(id1)])
    expect(customStudyWords(readSavedWords(s), readSrs(s).cards).map((w) => w.id)).toEqual([savedCardId(id1)])
    // Xoá mục có thẻ → mục còn lại hiện một thẻ (của nó), vẫn chỉ một thẻ cho cụm.
    s = deleteSavedWord(s, id1, NEXT_DAY)
    expect(customStudyWords(readSavedWords(s), readSrs(s).cards).map((w) => w.id)).toEqual([savedCardId(id2)])
  })

  it('mục thẻ sai dạng ở srs.cards → addToSrs ghi đè bằng thẻ hợp lệ để thẻ hiện trong phiên', () => {
    const id = savedWordId('model', NOW)
    let s = store({ srs: { cards: { 'ngsl-model': { junk: true } } } })
    s = saveWord(s, { word: 'model', sentence: 'x', source: news }, NOW)
    s = ok(addToSrs(s, id, { vocab: MODEL }, NOW)).store
    expect(isSrsCard(readSrs(s).cards['ngsl-model'])).toBe(true)
    expect(buildSession(readSrs(s), NGSL, LATER).queue.some((i) => i.word.id === 'ngsl-model')).toBe(true)
  })

  it('isSrsCard: field added sai kiểu → không hợp lệ', () => {
    const valid = addedCard(NOW)
    expect(isSrsCard(valid)).toBe(true)
    expect(isSrsCard({ ...valid, added: 'yes' })).toBe(false)
  })

  it('thiếu nghĩa → không tạo, báo cần nghĩa; không gọi AI', () => {
    const id = savedWordId('take part in', NOW)
    const s = saveWord(store(), { word: 'take part in', sentence: 'x', source: news }, NOW)
    expect(addToSrs(s, id, { meaningVi: '   ' }, NOW)).toEqual({ ok: false, reason: 'need-meaning' })
    expect(addToSrs(s, 'nope', { meaningVi: 'a' }, NOW)).toEqual({ ok: false, reason: 'missing' })
  })

  it('xoá mục có thẻ riêng → thẻ riêng ngừng xuất hiện; lịch còn trong srs.cards', () => {
    const id = savedWordId('take part in', NOW)
    let s = saveWord(store(), { word: 'take part in', sentence: 'x', source: news }, NOW)
    s = ok(addToSrs(s, id, { meaningVi: 'tham gia' }, NOW)).store
    s = deleteSavedWord(s, id, LATER)
    expect(customStudyWords(readSavedWords(s))).toEqual([])
    expect(readSrs(s).cards[savedCardId(id)]).toBeDefined()
    const session = buildSession(readSrs(s), NGSL, LATER, undefined, 'ngsl', customStudyWords(readSavedWords(s)))
    expect(session.queue.some((i) => i.word.id === savedCardId(id))).toBe(false)
  })

  it('thẻ riêng dùng cùng thuật toán: chấm Nhớ → hẹn ngày mai, hết khỏi phiên hôm nay', () => {
    const id = savedWordId('take part in', NOW)
    let s = saveWord(store(), { word: 'take part in', sentence: 'x', source: news }, NOW)
    s = ok(addToSrs(s, id, { meaningVi: 'tham gia' }, NOW)).store
    s = gradeCard(s, savedCardId(id), 'good', LATER)
    const custom = customStudyWords(readSavedWords(s))
    expect(buildSession(readSrs(s), [], LATER, undefined, 'ngsl', custom).queue).toEqual([])
    expect(buildSession(readSrs(s), [], NEXT_DAY, undefined, 'ngsl', custom).queue.map((i) => i.kind)).toEqual(['review'])
  })

  it('thẻ riêng chưa có lịch (đồng bộ mục về trước thẻ) → vào như từ mới, không trừ quota', () => {
    const custom = [{ id: 'saved-x', custom: true as const, word: 'x y', meaningVi: 'a', sentence: '', source: news }]
    const session = buildSession({ cards: {} }, NGSL, NOW, 2, 'ngsl', custom)
    expect(session.queue.map((i) => [i.kind, i.word.id])).toEqual([
      ['new', 'ngsl-w1'],
      ['new', 'ngsl-w2'],
      ['new', 'saved-x'],
    ])
  })

  it('findVocabWord: không phân biệt hoa thường, có ở cả 2 danh sách thì lấy NGSL; từ thiếu dữ liệu AI → không tính', () => {
    const tslData = study('tsl-data', 'data', 'tsl', 3)
    const ngslData = study('ngsl-data', 'data', 'ngsl', 900)
    expect(findVocabWord([tslData, ngslData], 'Data')?.id).toBe('ngsl-data')
    expect(findVocabWord([tslData], 'data')?.id).toBe('tsl-data')
    expect(findVocabWord([{ id: 'ngsl-bare', word: 'bare', list: 'ngsl', rank: 1 }], 'bare')).toBeUndefined()
  })
})

describe('lọc và nhóm Sổ tay', () => {
  it('gõ "mod" → chỉ mục có từ/câu chứa "mod" (không phân biệt hoa thường, dấu)', () => {
    let s = saveWord(store(), { word: 'model', sentence: 'x', source: news }, NOW)
    s = saveWord(s, { word: 'cat', sentence: 'A MODern cat.', source: news }, NOW)
    s = saveWord(s, { word: 'dog', sentence: 'A dog.', source: news }, NOW)
    expect(filterSaved(listSaved(readSavedWords(s)), 'MOD').map((e) => e.word).sort()).toEqual(['cat', 'model'])
    expect(foldText('Ghi Chú Đúng')).toBe('ghi chu dung')
  })

  it('mới nhất trước, nhóm theo ngày', () => {
    let s = saveWord(store(), { word: 'a', sentence: '', source: news }, NOW)
    s = saveWord(s, { word: 'b', sentence: '', source: news }, LATER)
    s = saveWord(s, { word: 'c', sentence: '', source: news }, NEXT_DAY)
    const groups = groupSavedByDay(listSaved(readSavedWords(s)))
    expect(groups.map((g) => [g.day, g.entries.map((e) => e.word)])).toEqual([
      ['2026-11-06', ['c']],
      ['2026-11-05', ['b', 'a']],
    ])
  })
})

describe('ghi chú', () => {
  it('3 ô trống → không lưu, báo cần ít nhất một ô', () => {
    expect(createNote(store(), 'n1', { rule: ' ', mistake: '', example: '\n' }, NOW)).toEqual({ ok: false, reason: 'empty' })
  })

  it('tạo từ trang bài → có lessonId; tạo tự do → lessonId null', () => {
    let s = ok(createNote(store(), 'n1', { rule: 'He works', mistake: '', example: '', lessonId: 's1-t1-w2' }, NOW)).store
    s = ok(createNote(s, 'n2', { rule: '', mistake: 'She work', example: '' }, LATER)).store
    const notes = listNotes(readNotes(s))
    expect(notes.map((n) => [n.id, n.lessonId])).toEqual([
      ['n2', null],
      ['n1', 's1-t1-w2'],
    ])
    expect(isNote(readNotes(s).n1)).toBe(true)
  })

  it('sửa: giữ bài và ngày tạo, updatedAt mới; không đổi gì → store cũ; 3 ô trống → empty', () => {
    const s = ok(createNote(store(), 'n1', { rule: 'a', mistake: '', example: '', lessonId: 'L' }, NOW)).store
    const e = ok(updateNote(s, 'n1', { rule: 'b', mistake: 'c', example: '' }, LATER)).store
    expect(readNotes(e).n1).toMatchObject({ rule: 'b', mistake: 'c', lessonId: 'L', createdAt: NOW.toISOString(), updatedAt: LATER.toISOString() })
    expect(ok(updateNote(s, 'n1', { rule: 'a ', mistake: '', example: '' }, LATER)).store).toBe(s)
    expect(updateNote(s, 'n1', { rule: '', mistake: '', example: '' }, LATER)).toEqual({ ok: false, reason: 'empty' })
    expect(updateNote(s, 'x', { rule: 'a', mistake: '', example: '' }, LATER)).toEqual({ ok: false, reason: 'missing' })
  })

  it('xoá: dấu xoá, ẩn khỏi danh sách; đồng bộ không làm sống lại', () => {
    const s = ok(createNote(store(), 'n1', { rule: 'a', mistake: '', example: '' }, NOW)).store
    const d = deleteNote(s, 'n1', LATER)
    expect(listNotes(readNotes(d))).toEqual([])
    expect(updateNote(d, 'n1', { rule: 'z', mistake: '', example: '' }, LATER)).toEqual({ ok: false, reason: 'missing' })
    expect((mergeNoteItems(readNotes(s), readNotes(d)).n1 as { deleted: boolean }).deleted).toBe(true)
    expect((mergeNoteItems(readNotes(d), readNotes(s)).n1 as { deleted: boolean }).deleted).toBe(true)
  })

  it('filterNotebook lọc cả mục lưu và ghi chú', () => {
    let s = ok(createNote(store(), 'n1', { rule: 'Thì hiện tại đơn', mistake: '', example: '' }, NOW)).store
    s = ok(createNote(s, 'n2', { rule: 'Mạo từ', mistake: '', example: '' }, NOW)).store
    s = saveWord(s, { word: 'present', sentence: '', source: news }, NOW)
    const r = filterNotebook('hien tai', { saved: listSaved(readSavedWords(s)), notes: listNotes(readNotes(s)) })
    expect(r.notes.map((n) => n.id)).toEqual(['n1'])
    expect(r.saved).toEqual([])
  })

  it('noteId: thời điểm + phần ngẫu nhiên đã làm sạch', () => {
    expect(noteId(new Date(0), 'ab-c/d')).toBe('0-abcd')
  })
})

describe('migration v7 → v8 và đồng bộ notes', () => {
  it('thêm notes rỗng; giữ notes đã có; mục savedWords cũ giữ nguyên', () => {
    const savedWords = { items: { [savedWordId('ai', NOW)]: { word: 'ai', sentence: '', source: news, savedAt: NOW.toISOString(), updatedAt: NOW.toISOString() } } }
    expect(runMigrations({ schemaVersion: 7, data: { savedWords } }, 8, migrations).data).toEqual({ savedWords, notes: { items: {} } })
    const notes = { items: { x: 1 }, extra: true }
    expect(runMigrations({ schemaVersion: 7, data: { notes } }, 8, migrations).data.notes).toEqual(notes)
  })

  it('app cũ (v7) gặp server v8 → outdated', () => {
    const r = mergeWithRemote({ schemaVersion: 7, data: {} }, { schemaVersion: 8, data: {}, updatedAt: NOW.toISOString() }, { currentVersion: 7 })
    expect(r).toEqual({ kind: 'outdated' })
  })

  it('hai máy tạo ghi chú khác nhau → sau đồng bộ có cả hai', () => {
    const a = ok(createNote(store(), 'na', { rule: 'a', mistake: '', example: '' }, NOW)).store
    const b = ok(createNote(store(), 'nb', { rule: 'b', mistake: '', example: '' }, NOW)).store
    const r = mergeWithRemote(a, { schemaVersion: CURRENT_VERSION, data: b.data, updatedAt: NOW.toISOString() })
    if (r.kind !== 'merged') throw new Error('merged')
    expect(listNotes(readNotes(r.store)).map((n) => n.id).sort()).toEqual(['na', 'nb'])
    expect(r.push).toBe(true)
  })
})

describe('safeSourceHref', () => {
  it('chỉ link http(s):// hoặc đường dẫn trong app bắt đầu bằng đúng một /', () => {
    expect(safeSourceHref('https://example.com/a')).toEqual({ kind: 'external', href: 'https://example.com/a' })
    expect(safeSourceHref('HTTP://x.y')).toEqual({ kind: 'external', href: 'HTTP://x.y' })
    expect(safeSourceHref('/roadmap/lesson/a')).toEqual({ kind: 'internal', to: '/roadmap/lesson/a' })
    for (const bad of ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', '//evil.com', '/\\evil.com', 'ftp://x', 'https://', 'x/y', '']) {
      expect(safeSourceHref(bad)).toBeNull()
    }
  })
})

describe('tóm tắt flashcard ở Luyện tập (buildStudySession)', () => {
  it('chỉ còn thẻ riêng → không báo "Xong hôm nay"', () => {
    const id = savedWordId('take part in', NOW)
    // Đã ôn hết từ danh sách: mọi thẻ NGSL xếp lịch xa.
    const cards = Object.fromEntries(NGSL.map((w) => [w.id, { ...addedCard(NOW), added: false, learning: false, due: NEXT_DAY.toISOString(), interval: 5, reps: 1 }]))
    let s = store({ srs: { cards } })
    s = saveWord(s, { word: 'take part in', sentence: 'x', source: news }, NOW)
    s = ok(addToSrs(s, id, { meaningVi: 'tham gia' }, NOW)).store
    const withoutCustom = buildSession(readSrs(s), NGSL, LATER)
    expect(flashcardSummary(withoutCustom)).toBe('Xong hôm nay')
    const session = buildStudySession(readSrs(s), NGSL, readSavedWords(s), LATER)
    expect(session.queue.map((i) => i.word.id)).toEqual([savedCardId(id)])
    expect(flashcardSummary(session)).toBe('0 thẻ đến hạn · 1 từ mới hôm nay')
  })
})
