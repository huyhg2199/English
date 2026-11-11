import { describe, expect, it } from 'vitest'

import { FOUNDATION_QUESTIONS, QUESTION_BANK } from '@/data/questions'
import { FUNCTION_WORD_GATES, hasDetails, loadWords, POS_LABELS, STARTER_WORD_IDS } from '@/data/vocab'
import { ruleCardId } from '@/lib/flashcard-session'

import { BRICKS, getBrickMeta } from './catalog'
import { BRICK_CONTENT, getBrick, hasBrickContent } from './content'
import type { Brick, CheckItem, ConceptId, Screen } from './types'

const words = await loadWords()
const wordById = new Map(words.map((w) => [w.id, w]))

const bricks = Object.values(BRICK_CONTENT) as Brick[]
const SCREEN_ORDER: Screen['kind'][] = ['explain', 'contrast', 'worked', 'faded', 'check', 'apply']
const CONTENT_POS = new Set(['noun', 'verb', 'adjective', 'adverb'])
/** Chữ cái hoa đứng một mình (trừ "I"): iOS đọc sai, F02 phải dùng `spellForSpeech`. */
const SINGLE_LETTER = /(^|[^A-Za-z])[A-HJ-Z]([^A-Za-z]|$)/

/** Đếm chữ: tách theo khoảng trắng, chỉ tính mảnh có chữ cái hoặc số (bỏ "→", "–"). */
function countWords(text: string): number {
  return text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length
}

function screenOf<K extends Screen['kind']>(brick: Brick, kind: K): Extract<Screen, { kind: K }> {
  const s = brick.screens.find((x) => x.kind === kind)
  if (!s) throw new Error(`${brick.id} thiếu màn ${kind}`)
  return s as Extract<Screen, { kind: K }>
}

function allItems(brick: Brick): CheckItem[] {
  const check = screenOf(brick, 'check')
  const apply = screenOf(brick, 'apply')
  return [...check.items, ...check.easier, ...(apply.item ? [apply.item] : [])]
}

/** Khái niệm do viên `id` hoặc các viên đứng trước dạy. */
function taughtUpTo(id: string): Set<ConceptId> {
  const idx = BRICKS.findIndex((b) => b.id === id)
  return new Set(BRICKS.slice(0, idx + 1).flatMap((b) => b.teaches))
}

function blanks(text: string): number {
  return text.split('___').length - 1
}

/**
 * Token cấm trong câu tiếng Anh của hàng B (story 25): to be, have, do, khuyết thiếu do F13–F16 dạy hoặc thuộc Năm 1.
 * Khai báo lặp ở `src/data/questions/foundation.test.ts` (luật câu quiz hàng B); sửa thì sửa cả hai.
 */
const ROW_B_FORBIDDEN = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', "it's", "that's", "he's", "she's", "there's", "what's",
  'have', 'has', 'had', 'do', 'does', 'did',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
])
/** Dạng rút gọn n't, 'm, 're, 've, 'll, 'd đều là to be / have / do / khuyết thiếu (Let's và 's sở hữu thì không). */
const FORBIDDEN_CONTRACTION = /n't$|'(m|re|ve|ll|d)$/
const isForbidden = (token: string) => ROW_B_FORBIDDEN.has(token) || FORBIDDEN_CONTRACTION.test(token)
/** Chuỗi có dấu tiếng Việt (đề, lựa chọn, nhãn viết bằng tiếng Việt) thì không phải câu tiếng Anh. */
const VIETNAMESE = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i
const tokensOf = (text: string) =>
  (text.replace(/[’‘ʼ`]/g, "'").match(/[A-Za-z']+/g) ?? []).map((t) => t.toLowerCase())
/**
 * Phần tiếng Anh của một chuỗi: chuỗi không dấu tiếng Việt thì lấy cả; chuỗi lẫn tiếng Việt thì lấy từng đoạn trong
 * ngoặc kép không dấu (“I work quickly.”) và phần còn lại sau khi bỏ ngoặc đơn, nếu phần đó hết dấu ("I love ___. (anh ấy)").
 */
function englishParts(text: string): string[] {
  if (!VIETNAMESE.test(text)) return [text]
  const parts = [...text.matchAll(/[“"]([^”"]+)[”"]/g)].map((m) => m[1]).filter((q) => !VIETNAMESE.test(q))
  const rest = text.replace(/\([^)]*\)/g, '')
  if (!VIETNAMESE.test(rest)) parts.push(rest)
  return parts
}
const forbiddenIn = (text: string) => englishParts(text).flatMap(tokensOf).filter(isForbidden)

/**
 * Mọi chuỗi tiếng Anh của viên, kèm nơi lấy (để báo lỗi): ví dụ, worked, faded / thẻ quy tắc đã điền đáp án, câu mẫu,
 * câu nói, `audioText`; đề (đã điền đáp án) / lựa chọn / mảnh / mục xếp nhóm của câu luyện; và câu tiếng Anh trích
 * trong lời tiếng Việt (giải thích, gợi ý, ghi chú, thẻ quy tắc). Chuỗi lẫn tiếng Việt chỉ lấy phần tiếng Anh (`englishParts`).
 */
function englishTexts(brick: Brick): { where: string; text: string }[] {
  const explain = screenOf(brick, 'explain')
  const contrast = screenOf(brick, 'contrast')
  const worked = screenOf(brick, 'worked')
  const faded = screenOf(brick, 'faded')
  const apply = screenOf(brick, 'apply')
  const raw: { where: string; text: string | undefined }[] = [
    { where: 'explain', text: explain.textVi },
    { where: 'contrast.viSays', text: contrast.viSays },
    { where: 'contrast.enRequires', text: contrast.enRequires },
    ...(contrast.examples ?? []).flatMap((ex) => [
      { where: 'contrast', text: ex.en },
      { where: 'contrast.vi', text: ex.vi },
      ...(ex.audioText ? [{ where: 'contrast.audioText', text: ex.audioText }] : []),
    ]),
    { where: 'worked', text: worked.en },
    { where: 'worked.noteVi', text: worked.noteVi },
    ...(worked.audioText ? [{ where: 'worked.audioText', text: worked.audioText }] : []),
    { where: 'faded', text: faded.en.replace('___', faded.answer) },
    { where: 'faded.hintVi', text: faded.hintVi },
    { where: 'apply.promptVi', text: apply.promptVi },
    ...(apply.sampleEn ? [{ where: 'sampleEn', text: apply.sampleEn }] : []),
    ...(apply.sampleAudioText ? [{ where: 'sampleAudioText', text: apply.sampleAudioText }] : []),
    ...(apply.speak ?? []).map((s) => ({ where: s.id, text: s.text })),
    ...brick.ruleCards.flatMap((c) => [
      { where: c.id, text: c.cloze.replace('___', c.answer) },
      { where: `${c.id}.vi`, text: c.vi },
    ]),
    ...(explain.tables ?? []).flatMap((t) => [
      ...(t.noteVi ? [{ where: `${t.id}.noteVi`, text: t.noteVi }] : []),
      ...t.rows.flatMap((r) => [
        { where: `${t.id}: ${r.en}`, text: r.en },
        { where: `${t.id}: ${r.en}.vi`, text: r.vi },
      ]),
    ]),
  ]
  for (const item of allItems(brick)) {
    const texts: (string | undefined)[] = [item.hintVi, item.explanationVi]
    if ('prompt' in item && item.prompt) {
      const filled = item.kind === 'choice' || item.kind === 'listen' ? item.options[item.answer] : undefined
      texts.push(filled ? item.prompt.replace('___', filled) : item.prompt)
    }
    if (item.kind === 'choice' || item.kind === 'listen') texts.push(...item.options)
    if (item.kind === 'listen') texts.push(item.audioText)
    if (item.kind === 'order') texts.push(item.tokens.join(' '))
    if (item.kind === 'sort') texts.push(...item.groups.flatMap((g) => g.items))
    if (item.kind === 'tapSyllable') texts.push(item.word)
    raw.push(...texts.map((text) => ({ where: item.id, text })))
  }
  return raw.flatMap(({ where, text }) => (text ? englishParts(text).map((part) => ({ where, text: part })) : []))
}

const ROW_B_IDS = ['F07', 'F08', 'F09', 'F10', 'F11', 'F12']
const ROW_CD_IDS = ['F13', 'F14', 'F15', 'F16', 'F17', 'F18']

/**
 * Luật ngữ pháp câu tiếng Anh hàng C–D (story 26): không do / does / did, khuyết thiếu, 've / 'll / 'd, n't ngoài
 * isn't / aren't. was / were / been / being chỉ có ở F13 (nhắc họ hàng của be), had chỉ ở F16 (quá khứ của have);
 * going / gone chỉ từ F17. Khai báo lặp ở `src/data/questions/foundation.test.ts` (câu quiz hàng C–D); sửa thì sửa cả hai.
 */
const ROW_CD_FORBIDDEN = new Set(['do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must'])
const ROW_CD_CONTRACTION = /n't$|'(ve|ll|d)$/
const ROW_CD_NT_ALLOWED = new Set(["isn't", "aren't"])
const ROW_CD_ONLY_IN: Readonly<Record<string, string>> = {
  was: 'F13',
  were: 'F13',
  been: 'F13',
  being: 'F13',
  had: 'F16',
}
const GOING_GONE = new Set(['going', 'gone'])
/** Token `token` có bị cấm trong câu tiếng Anh của viên `brickId` (F13–F18) không. */
function rowCdForbidden(token: string, brickId: string): boolean {
  if (ROW_CD_FORBIDDEN.has(token)) return true
  if (ROW_CD_CONTRACTION.test(token) && !ROW_CD_NT_ALLOWED.has(token)) return true
  if (Object.hasOwn(ROW_CD_ONLY_IN, token)) return ROW_CD_ONLY_IN[token] !== brickId
  if (GOING_GONE.has(token)) return brickId < 'F17'
  return false
}
/** "in / on May" là tên tháng, không phải khuyết thiếu may: bỏ trước khi tách token ("May I go?" vẫn bị bắt). */
const withoutMonthMay = (text: string) => text.replace(/\b(in|on) May\b/g, '$1')
const rowCdForbiddenIn = (text: string, brickId: string) =>
  englishParts(text).flatMap((part) => tokensOf(withoutMonthMay(part))).filter((t) => rowCdForbidden(t, brickId))

/** Dạng hư từ có cổng gắn viên đứng sau `brickId` (vd F13 → not, there, have, at…). */
function laterGateForms(brickId: string): Set<string> {
  const out = new Set<string>()
  for (const gate of Object.values(FUNCTION_WORD_GATES)) {
    if (typeof gate.opensAfter === 'object' && 'brick' in gate.opensAfter && gate.opensAfter.brick > brickId) {
      for (const f of gate.forms) out.add(f)
    }
  }
  return out
}

/** Câu tiếng Anh chuẩn hoá để so trùng: chữ thường, bỏ dấu câu (giữ dấu nháy), gộp khoảng trắng. */
const normalizeSentence = (text: string) =>
  text
    .replace(/[’‘ʼ`]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
/** Tách chuỗi thành câu (theo . ? ! và dấu gạch đối thoại —), đã chuẩn hoá, bỏ mảnh rỗng. */
const sentencesOf = (text: string) =>
  text
    .split(/(?<=[.?!])\s+|\s+—\s+/)
    .map(normalizeSentence)
    .filter((t) => t.length > 0)
/** Từ có đuôi số nhiều đọc /ɪz/ (danh sách tay) cho câu nghe của F10. */
const IZ_PLURALS = ['boxes', 'buses', 'classes', 'watches', 'dishes', 'oranges', 'pages']

describe('thẻ quy tắc → id SRS (story 24)', () => {
  const rules = bricks.flatMap((b) => b.ruleCards)

  it('id dạng fNN-rule-n, tiền tố đúng viên', () => {
    expect(rules.length).toBeGreaterThan(0)
    for (const r of rules) {
      expect(r.id).toMatch(/^f\d{2}-rule-\d+$/)
      expect(r.id.slice(0, 3)).toBe(r.brickId.toLowerCase())
    }
  })

  it('ruleCardId không trùng trên toàn bộ nội dung, dạng rule:fNN-n', () => {
    const ids = rules.map(ruleCardId)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^rule:f\d{2}-\d+$/)
    expect(ruleCardId({ id: 'f01-rule-2' })).toBe('rule:f01-2')
  })
})

describe('nội dung viên gạch', () => {
  it('F01–F18 đều có nội dung; sổ đăng ký tra đúng id', () => {
    for (const b of BRICKS) {
      expect(hasBrickContent(b.id), b.id).toBe(true)
      expect(getBrick(b.id)?.id).toBe(b.id)
    }
    expect(bricks).toHaveLength(18)
    expect(hasBrickContent('f01')).toBe(false)
    expect(hasBrickContent('__proto__')).toBe(false)
    expect(getBrick('toString')).toBeUndefined()
  })

  it('F01: câu check có ít nhất choice, listen, order', () => {
    const kinds = new Set(screenOf(getBrick('F01')!, 'check').items.map((i) => i.kind))
    for (const k of ['choice', 'listen', 'order'] as const) expect(kinds.has(k), k).toBe(true)
  })

  it('F04 có ít nhất một câu tapSyllable', () => {
    expect(allItems(getBrick('F04')!).some((i) => i.kind === 'tapSyllable')).toBe(true)
  })

  it('từ chủ đề không trùng giữa các viên', () => {
    const ids = bricks.flatMap((b) => b.themeWordIds)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('từ chủ đề không nằm trong danh sách khởi đầu (STARTER_WORD_IDS) — từ viên F07', () => {
    const starter = new Set(STARTER_WORD_IDS)
    for (const b of bricks.filter((x) => x.id >= 'F07')) {
      for (const wid of b.themeWordIds) expect(starter.has(wid), `${b.id}: ${wid}`).toBe(false)
    }
  })

  it('F07 có câu sort, F08 có câu order, F10 có câu listen đọc từ đuôi /ɪz/', () => {
    expect(allItems(getBrick('F07')!).some((i) => i.kind === 'sort')).toBe(true)
    expect(allItems(getBrick('F08')!).some((i) => i.kind === 'order')).toBe(true)
    const iz = allItems(getBrick('F10')!).filter(
      (i) => i.kind === 'listen' && tokensOf(i.audioText).some((t) => IZ_PLURALS.includes(t)),
    )
    expect(iz.length).toBeGreaterThanOrEqual(1)
  })

  it('ngữ pháp hàng B: câu tiếng Anh F07–F12 không có to be, have, do, khuyết thiếu', () => {
    const bad: string[] = []
    for (const id of ROW_B_IDS) {
      const texts = englishTexts(getBrick(id)!)
      expect(texts.length, id).toBeGreaterThan(10)
      for (const { where, text } of texts) {
        const hit = tokensOf(text).filter(isForbidden)
        if (hit.length > 0) bad.push(`${id} ${where}: "${text}" (${hit.join(', ')})`)
      }
    }
    expect(bad).toEqual([])
  })

  it('ngữ pháp hàng A: câu tiếng Anh F01–F06 không có to be, have, do, khuyết thiếu, at / on / in', () => {
    const ROW_A_IDS = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06']
    const AT_ON_IN = new Set(['at', 'on', 'in'])
    const bad: string[] = []
    for (const id of ROW_A_IDS) {
      const texts = englishTexts(getBrick(id)!)
      expect(texts.length, id).toBeGreaterThan(10)
      for (const { where, text } of texts) {
        // Tên tháng May không phải khuyết thiếu may.
        // F02 đọc @ là "at" (huy at gmail dot com), không phải giới từ thời gian.
        const prep = (t: string) => AT_ON_IN.has(t) && !(id === 'F02' && t === 'at')
        const hit = tokensOf(text.replace(/\bMay\b(?! I\b)/g, '')).filter((t) => isForbidden(t) || prep(t))
        if (hit.length > 0) bad.push(`${id} ${where}: "${text}" (${hit.join(', ')})`)
      }
    }
    expect(bad).toEqual([])
  })

  it('loại câu bắt buộc hàng C–D: F14 nghe câu hỏi, F15 chọn giới từ nơi chốn, F17 xếp vùng thời gian, F18 xếp trạng từ tần suất', () => {
    expect(
      allItems(getBrick('F14')!).some((i) => i.kind === 'listen' && i.audioText.trim().endsWith('?')),
      'F14 listen câu hỏi',
    ).toBe(true)

    const PLACE = new Set(['in', 'on', 'under', 'next to', 'between'])
    expect(
      allItems(getBrick('F15')!).some(
        (i) => i.kind === 'choice' && PLACE.has(i.options[i.answer]) && i.options.filter((o) => PLACE.has(o)).length === 3,
      ),
      'F15 chọn giới từ nơi chốn',
    ).toBe(true)

    const f17Sorts = allItems(getBrick('F17')!).filter((i) => i.kind === 'sort')
    expect(f17Sorts.length).toBeGreaterThanOrEqual(1)
    const ZONES = ['Quá khứ', 'Bây giờ', 'Thói quen']
    expect(f17Sorts.some((i) => i.kind === 'sort' && i.groups.every((g) => ZONES.includes(g.label)))).toBe(true)
    const sortTokens = new Set(f17Sorts.flatMap((i) => (i.kind === 'sort' ? i.groups.flatMap((g) => g.items.flatMap(tokensOf)) : [])))
    for (const form of ['go', 'goes', 'going', 'went', 'gone']) expect(sortTokens.has(form), form).toBe(true)

    const FREQ = new Set(['always', 'usually', 'often', 'sometimes', 'never'])
    expect(
      allItems(getBrick('F18')!).some((i) => i.kind === 'order' && i.tokens.some((t) => FREQ.has(t.toLowerCase()))),
      'F18 order trạng từ tần suất',
    ).toBe(true)
  })

  it('F17: gone không nằm trong nhóm Quá khứ, có nhóm "have / has" chứa gone, "She has gone." không gọi là Quá khứ (story 32)', () => {
    const f17 = getBrick('F17')!
    const sorts = allItems(f17).filter((i) => i.kind === 'sort')
    const groups = sorts.flatMap((i) => (i.kind === 'sort' ? i.groups : []))
    for (const g of groups.filter((x) => x.label.startsWith('Quá khứ'))) {
      expect(g.items.flatMap(tokensOf), g.items.join(' | ')).not.toContain('gone')
    }
    expect(groups.some((g) => g.label.includes('have / has') && g.items.flatMap(tokensOf).includes('gone'))).toBe(true)
    const hasGone = (screenOf(f17, 'contrast').examples ?? []).filter((ex) => ex.en === 'She has gone.')
    expect(hasGone.length).toBeGreaterThanOrEqual(1)
    for (const ex of hasGone) expect(ex.vi).not.toContain('Quá khứ')
  })

  it('ngữ pháp hàng C–D: không do/does/did, khuyết thiếu, rút gọn lạ; was/were/been/being chỉ F13, had chỉ F16, going/gone từ F17', () => {
    const bad: string[] = []
    for (const id of ROW_CD_IDS) {
      const texts = englishTexts(getBrick(id)!)
      expect(texts.length, id).toBeGreaterThan(10)
      for (const { where, text } of texts) {
        const hit = tokensOf(withoutMonthMay(text)).filter((t) => rowCdForbidden(t, id))
        if (hit.length > 0) bad.push(`${id} ${where}: "${text}" (${hit.join(', ')})`)
      }
    }
    expect(bad).toEqual([])
  })

  it('F13–F18: ví dụ có ký hiệu (·, →, —, /…/) thì có audioText / sampleAudioText', () => {
    const SYMBOL = /[·→—]|\/[^/\s][^/]*\//
    const bad: string[] = []
    for (const id of ROW_CD_IDS) {
      const brick = getBrick(id)!
      const contrast = screenOf(brick, 'contrast')
      const worked = screenOf(brick, 'worked')
      const apply = screenOf(brick, 'apply')
      for (const ex of contrast.examples ?? []) if (SYMBOL.test(ex.en) && !ex.audioText) bad.push(`${id} contrast: ${ex.en}`)
      if (SYMBOL.test(worked.en) && !worked.audioText) bad.push(`${id} worked: ${worked.en}`)
      if (apply.sampleEn && SYMBOL.test(apply.sampleEn) && !apply.sampleAudioText) bad.push(`${id} sampleEn: ${apply.sampleEn}`)
    }
    expect(bad).toEqual([])
  })

  it('luật ngữ pháp hàng C–D bắt đúng token (tự kiểm helper)', () => {
    expect(rowCdForbiddenIn("He doesn't go. I can't. You'll see. We'd go. I've been.", 'F18')).toEqual([
      "doesn't",
      "can't",
      "you'll",
      "we'd",
      "i've",
      'been',
    ])
    expect(rowCdForbiddenIn("He isn't here. They aren't ready. Let's go. Huy's phone. I'm 25.", 'F14')).toEqual([])
    expect(rowCdForbiddenIn('be · was · were · been · being', 'F13')).toEqual([])
    expect(rowCdForbiddenIn('I was here. She had a cat.', 'F14')).toEqual(['was', 'had'])
    expect(rowCdForbiddenIn('have → had', 'F16')).toEqual([])
    expect(rowCdForbiddenIn("I'm going home. She has gone.", 'F16')).toEqual(['going', 'gone'])
    expect(rowCdForbiddenIn("I'm going home. She has gone.", 'F17')).toEqual([])
    expect(rowCdForbiddenIn('Trong “Do you like it?”, do đó…', 'F18')).toEqual(['do'])
    expect(rowCdForbiddenIn('My birthday is in May. You may go.', 'F18')).toEqual(['may'])
    expect(rowCdForbiddenIn('May I sit here?', 'F18')).toEqual(['may'])
    // Đường mà ca thật chạy (cả chuỗi, không qua englishParts).
    expect(tokensOf(withoutMonthMay('May I go? My birthday is in May.')).filter((t) => rowCdForbidden(t, 'F18'))).toEqual(['may'])
  })

  it('hư từ của viên sau: câu tiếng Anh F13–F17 không có dạng hư từ mà cổng gắn viên đứng sau (trừ in ở F13–F14)', () => {
    const bad: string[] = []
    for (const id of ['F13', 'F14', 'F15', 'F16', 'F17']) {
      const later = laterGateForms(id)
      if (id === 'F13' || id === 'F14') later.delete('in')
      for (const { where, text } of englishTexts(getBrick(id)!)) {
        const hit = tokensOf(text).filter((t) => later.has(t))
        if (hit.length > 0) bad.push(`${id} ${where}: "${text}" (${hit.join(', ')})`)
      }
    }
    expect(bad).toEqual([])
    // Tự kiểm: F13 chưa có not / there / have / at; F17 chưa có at / every.
    for (const f of ['not', 'there', 'have', 'had', 'at']) expect(laterGateForms('F13').has(f), f).toBe(true)
    expect(laterGateForms('F13').has('is')).toBe(false)
    expect([...laterGateForms('F17')].sort()).toEqual(['always', 'at', 'every', 'never', 'often'])
  })

  it('câu quiz hàng B–D (đã điền đáp án, bỏ hoa thường và dấu câu) không trùng câu tiếng Anh nào của viên', () => {
    const brickSentences = new Map<string, string>()
    for (const b of bricks) {
      for (const { where, text } of englishTexts(b)) {
        for (const sentence of sentencesOf(text)) brickSentences.set(sentence, `${b.id} ${where}`)
      }
    }
    const dup: string[] = []
    for (const q of FOUNDATION_QUESTIONS.filter((x) => x.lessonId >= 'f07')) {
      const filled = q.prompt.replace('___', q.answer)
      const candidates = [...englishParts(filled), ...(/\s/.test(q.answer) ? [q.answer] : [])].flatMap(sentencesOf)
      for (const c of candidates) {
        if (c.includes(' ') && brickSentences.has(c)) dup.push(`${q.id}: "${c}" trùng ${brickSentences.get(c)}`)
      }
    }
    expect(dup).toEqual([])
    // Tự kiểm: so trùng bỏ hoa thường, dấu câu.
    expect(sentencesOf('Is he home? — No, he isn’t.')).toEqual(['is he home', "no he isn't"])
  })

  it('kiểm tra ngữ pháp bắt được token cấm (tự kiểm helper)', () => {
    expect(forbiddenIn("It's a pen. He IS here; don’t go")).toEqual(["it's", 'is', "don't"])
    expect(forbiddenIn("I'm hungry. You can't go. it‘s ok. They must be here.")).toEqual(["i'm", "can't", "it's", 'must', 'be'])
    expect(forbiddenIn("This island. Let's go. Huy's phone")).toEqual([])
    // Chuỗi lẫn tiếng Việt: vẫn quét câu trích trong ngoặc kép và phần tiếng Anh ngoài ngoặc đơn.
    expect(forbiddenIn('Trong “I am quick.”, quick là từ loại gì?')).toEqual(['am'])
    expect(forbiddenIn('I can go ___. (anh ấy)')).toEqual(['can'])
    expect(forbiddenIn('Tiếng Việt nói “Thích lắm.”, do đó có thể bỏ chủ ngữ.')).toEqual([])
  })

  it('F07: nhãn xếp nhóm từ loại đúng như POS_LABELS và khớp từ loại của từ trong words.json', () => {
    const labels = new Set(Object.values(POS_LABELS))
    let checked = 0
    for (const item of allItems(getBrick('F07')!)) {
      if (item.kind !== 'sort') continue
      for (const group of item.groups) {
        const label = group.label.replace(/\s*\(.*\)$/, '').toLowerCase()
        expect(labels.has(label), `${item.id}: ${group.label}`).toBe(true)
        for (const w of group.items) {
          const pos = wordById.get(`ngsl-${w}`)?.pos
          expect(pos, `${item.id}: ${w}`).toBeDefined()
          expect(pos && POS_LABELS[pos], `${item.id}: ${w}`).toBe(label)
          checked++
        }
      }
    }
    expect(checked).toBeGreaterThanOrEqual(8)
  })

  it('cổng hư từ khớp nội dung: viên mở cổng dạy mọi dạng trong forms (viên chưa soạn thì bỏ qua)', () => {
    let checked = 0
    const missing: string[] = []
    for (const [wordId, gate] of Object.entries(FUNCTION_WORD_GATES)) {
      if (typeof gate.opensAfter !== 'object' || !('brick' in gate.opensAfter)) continue
      const brick = getBrick(gate.opensAfter.brick)
      if (!brick) continue
      const tokens = new Set(englishTexts(brick).flatMap((t) => tokensOf(t.text)))
      for (const form of gate.forms) {
        checked++
        if (!tokens.has(form)) missing.push(`${brick.id} thiếu "${form}" (${wordId})`)
      }
    }
    expect(missing).toEqual([])
    // F09: 18 dạng của 7 đại từ; F11: the, a, an; F12: this, these, that, those.
    // F13: 8 dạng của be; F14: 7; F15: 5; F16: have, has, had; F18: 5.
    expect(checked).toBeGreaterThanOrEqual(25 + 28)
  })

  it('F02: không chuỗi đọc nào chứa chữ cái đứng một mình (trừ I)', () => {
    const f02 = getBrick('F02')!
    const contrast = screenOf(f02, 'contrast')
    const worked = screenOf(f02, 'worked')
    const apply = screenOf(f02, 'apply')
    // Chuỗi máy thật sự đọc: audioText nếu có, không thì chữ hiện trên màn hình.
    const spoken = [
      ...allItems(f02).flatMap((i) => (i.kind === 'listen' ? [i.audioText] : [])),
      ...(contrast.examples ?? []).map((ex) => ex.audioText ?? ex.en),
      worked.audioText ?? worked.en,
      ...(apply.sampleEn !== undefined ? [apply.sampleAudioText ?? apply.sampleEn] : []),
      ...(apply.speak ?? []).map((s) => s.text),
    ]
    expect(spoken.length).toBeGreaterThan(0)
    for (const text of spoken) expect(SINGLE_LETTER.test(text), text).toBe(false)
  })

  it('id câu luyện, thẻ quy tắc, câu nói không trùng trong toàn bộ nội dung', () => {
    const ids = bricks.flatMap((b) => [
      ...allItems(b).map((i) => i.id),
      ...b.ruleCards.map((c) => c.id),
      ...(screenOf(b, 'apply').speak ?? []).map((s) => s.id),
    ])
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe.each(bricks.map((b) => [b.id, b] as const))('%s', (id, brick) => {
    it('meta khớp danh mục, key sổ đăng ký đúng id', () => {
      const meta = getBrickMeta(id)!
      expect(BRICK_CONTENT[meta.id]).toBe(brick)
      for (const key of Object.keys(meta) as (keyof typeof meta)[]) expect(brick[key]).toEqual(meta[key])
    })

    it('đúng 6 màn theo thứ tự explain → contrast → worked → faded → check → apply', () => {
      expect(brick.screens.map((s) => s.kind)).toEqual(SCREEN_ORDER)
    })

    it('giải thích 40–80 chữ', () => {
      const n = countWords(screenOf(brick, 'explain').textVi)
      expect(n).toBeGreaterThanOrEqual(40)
      expect(n).toBeLessThanOrEqual(80)
    })

    it('faded và thẻ quy tắc có đúng một ___; thẻ quy tắc thuộc viên này', () => {
      expect(blanks(screenOf(brick, 'faded').en)).toBe(1)
      // Riêng F06 có 8 thẻ (số, thứ, tháng, ngày tháng — story 34); viên khác 1–2.
      if (id === 'F06') {
        expect(brick.ruleCards).toHaveLength(8)
      } else {
        expect(brick.ruleCards.length).toBeGreaterThanOrEqual(1)
        expect(brick.ruleCards.length).toBeLessThanOrEqual(2)
      }
      for (const card of brick.ruleCards) {
        expect(blanks(card.cloze)).toBe(1)
        expect(card.brickId).toBe(id)
        expect(card.answer.trim()).not.toBe('')
      }
    })

    it('check 2–5 câu, easier đúng 2', () => {
      const check = screenOf(brick, 'check')
      expect(check.items.length).toBeGreaterThanOrEqual(2)
      expect(check.items.length).toBeLessThanOrEqual(5)
      expect(check.easier).toHaveLength(2)
    })

    it('câu luyện hợp lệ theo loại', () => {
      for (const item of allItems(brick)) {
        expect(item.hintVi.trim(), item.id).not.toBe('')
        expect(item.explanationVi.trim(), item.id).not.toBe('')
        switch (item.kind) {
          case 'choice':
          case 'listen':
            expect(item.options, item.id).toHaveLength(3)
            expect(new Set(item.options).size, item.id).toBe(3)
            expect(item.options[item.answer], item.id).toBeDefined()
            if (item.kind === 'listen') expect(item.audioText.trim(), item.id).not.toBe('')
            break
          case 'tapSyllable':
            expect(item.syllables.join(''), item.id).toBe(item.word)
            expect(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.syllables.length, item.id).toBe(true)
            break
          case 'order':
            expect(item.tokens.length, item.id).toBeGreaterThanOrEqual(2)
            break
          case 'sort': {
            expect(item.groups.length, item.id).toBeGreaterThanOrEqual(2)
            const all = item.groups.flatMap((g) => g.items)
            expect(new Set(all).size, item.id).toBe(all.length)
            expect(new Set(item.groups.map((g) => g.label)).size, item.id).toBe(item.groups.length)
            for (const g of item.groups) expect(g.items.length, item.id).toBeGreaterThanOrEqual(1)
            break
          }
        }
      }
    })

    it('uses của câu chỉ là khái niệm viên này hoặc viên trước dạy', () => {
      const taught = taughtUpTo(id)
      for (const item of allItems(brick)) {
        for (const c of item.uses ?? []) expect(taught.has(c), `${item.id} dùng ${c}`).toBe(true)
      }
    })

    it('câu nói có id dạng fNN-say-n', () => {
      for (const s of screenOf(brick, 'apply').speak ?? []) {
        expect(s.id).toMatch(new RegExp(`^${id.toLowerCase()}-say-\\d+$`))
        expect(s.text.trim(), s.id).not.toBe('')
      }
    })

    it('có ít nhất một câu listen', () => {
      expect(allItems(brick).some((i) => i.kind === 'listen')).toBe(true)
    })

    it('audioText / sampleAudioText nếu có thì không rỗng', () => {
      const contrast = screenOf(brick, 'contrast')
      const worked = screenOf(brick, 'worked')
      const apply = screenOf(brick, 'apply')
      const texts = [
        ...(contrast.examples ?? []).map((ex) => ex.audioText),
        worked.audioText,
        apply.sampleAudioText,
      ].filter((t): t is string => t !== undefined)
      for (const t of texts) expect(t.trim()).not.toBe('')
      if (apply.sampleAudioText !== undefined) expect(apply.sampleEn, 'sampleAudioText cần sampleEn').toBeDefined()
    })

    it('faded có đáp án không rỗng', () => {
      expect(screenOf(brick, 'faded').answer.trim()).not.toBe('')
    })

    it('đúng 5 từ chủ đề, là từ nội dung có trong words.json và có dữ liệu AI (phiên ôn mới lấy được)', () => {
      expect(brick.themeWordIds).toHaveLength(5)
      expect(new Set(brick.themeWordIds).size).toBe(5)
      for (const wid of brick.themeWordIds) {
        const w = wordById.get(wid)
        expect(w, wid).toBeDefined()
        expect(hasDetails(w!), `${wid} chưa có dữ liệu AI`).toBe(true)
        expect(CONTENT_POS.has(w!.pos ?? ''), `${wid} là ${w!.pos}`).toBe(true)
      }
    })
  })
})

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_RE = new RegExp(`\\b(${DAY_NAMES.join('|')})s?\\b`, 'g')
/** Tên tháng (viết hoa). "May" chỉ tính khi đứng sau in / on hoặc trước một số ("May I go?" là khuyết thiếu). */
const MONTH_RE = new RegExp(`\\b(${MONTH_NAMES.filter((m) => m !== 'May').join('|')})\\b`, 'g')
const MAY_RE =
  /\b(?:in|on) (May)\b|\b(May)(?= (?:\d|first\b|second\b|third\b|[a-z]+(?:th|st|nd|rd)\b)|, (?:January|February|March|April|June|July|August|September|October|November|December)\b)/g

/** Tên thứ / tháng có trong chuỗi (bỏ đuôi -s của thứ: "Mondays" → Monday). */
function dayMonthNames(text: string): string[] {
  return [
    ...[...text.matchAll(DAY_RE)].map((m) => m[1]),
    ...[...text.matchAll(MONTH_RE)].map((m) => m[1]),
    ...[...text.matchAll(MAY_RE)].map((m) => m[1] ?? m[2]),
  ]
}

/** Chuỗi tiếng Anh của câu luyện viên: đề (đã điền đáp án), lựa chọn, audioText, mảnh xếp, mục xếp nhóm. */
function itemTexts(item: CheckItem): string[] {
  const texts: string[] = []
  if ('prompt' in item && item.prompt) {
    const filled = item.kind === 'choice' || item.kind === 'listen' ? item.options[item.answer] : undefined
    texts.push(filled ? item.prompt.replace('___', filled) : item.prompt)
  }
  if (item.kind === 'choice' || item.kind === 'listen') texts.push(...item.options)
  if (item.kind === 'listen') texts.push(item.audioText)
  if (item.kind === 'order') texts.push(item.tokens.join(' '))
  if (item.kind === 'sort') texts.push(...item.groups.flatMap((g) => g.items))
  if (item.kind === 'tapSyllable') texts.push(item.word)
  return texts
}

describe('F06 số, thứ, tháng (story 34)', () => {
  const f06 = getBrick('F06')!
  const tables = screenOf(f06, 'explain').tables ?? []
  const table = (id: string) => {
    const t = tables.find((x) => x.id === id)
    if (!t) throw new Error(`F06 thiếu bảng ${id}`)
    return t
  }
  const ens = (id: string) => table(id).rows.map((r) => r.en)

  it('chỉ F06 có bảng; id bảng đúng thứ tự', () => {
    for (const b of bricks) {
      if (b.id === 'F06') continue
      expect(screenOf(b, 'explain').tables, b.id).toBeUndefined()
    }
    expect(tables.map((t) => t.id)).toEqual(['f06-numbers', 'f06-tens', 'f06-days', 'f06-months', 'f06-ordinals', 'f06-time-price'])
  })

  it('bảng số 0–19 và bảng số chục', () => {
    const numbers = table('f06-numbers')
    expect(numbers.rows.map((r) => r.vi)).toEqual(Array.from({ length: 20 }, (_, i) => String(i)))
    expect(ens('f06-numbers')).toEqual([
      'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
    ])
    expect(ens('f06-tens')).toEqual(['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'one hundred'])
    expect(table('f06-tens').rows.map((r) => r.vi)).toEqual(['20', '30', '40', '50', '60', '70', '80', '90', '100'])
  })

  it('bảng thứ Monday → Sunday, bảng tháng January → December', () => {
    expect(ens('f06-days')).toEqual(DAY_NAMES)
    expect(table('f06-days').rows.map((r) => r.vi)).toEqual(['thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy', 'Chủ nhật'])
    expect(ens('f06-months')).toEqual(MONTH_NAMES)
    expect(table('f06-months').rows.map((r) => r.vi)).toEqual(Array.from({ length: 12 }, (_, i) => `tháng ${i + 1}`))
  })

  it('bảng số thứ tự có các dạng hay sai', () => {
    const ordinals = ens('f06-ordinals')
    for (const w of ['first', 'second', 'third', 'fifth', 'twelfth', 'twentieth', 'twenty-first']) {
      expect(ordinals, w).toContain(w)
    }
    // Ngoại lệ 11–13 (review story 34): không theo đuôi 1, 2, 3 → first, second, third.
    for (const w of ['eleventh', 'thirteenth', 'twenty-third', 'thirtieth']) expect(ordinals, w).toContain(w)
    expect(table('f06-ordinals').noteVi).toContain('trừ 11th eleventh, 12th twelfth, 13th thirteenth')
  })

  it('mọi dòng: en chỉ chữ / dấu cách / gạch nối / dấu nháy, vi không rỗng, en không trùng trong bảng', () => {
    for (const t of tables) {
      expect(t.rows.length, t.id).toBeGreaterThan(0)
      expect(new Set(t.rows.map((r) => r.en)).size, t.id).toBe(t.rows.length)
      for (const r of t.rows) {
        expect(r.en, `${t.id}: ${r.en}`).toMatch(/^[A-Za-z' -]+$/)
        expect(r.vi.trim(), `${t.id}: ${r.en}`).not.toBe('')
      }
    }
  })

  it('IPA: bảng số, chục, thứ, tháng, số thứ tự có ipa không dấu /; trọng âm đúng chỗ', () => {
    for (const id of ['f06-numbers', 'f06-tens', 'f06-days', 'f06-months', 'f06-ordinals']) {
      for (const r of table(id).rows) {
        expect(r.ipa, `${id}: ${r.en}`).toBeDefined()
        expect(r.ipa!.trim(), `${id}: ${r.en}`).not.toBe('')
        expect(r.ipa, `${id}: ${r.en}`).not.toContain('/')
      }
    }
    for (const r of table('f06-numbers').rows.slice(13)) expect(r.ipa, r.en).toContain('ˈtiːn')
    for (const r of table('f06-tens').rows.slice(0, 8)) expect(r.ipa!.startsWith('ˈ'), r.en).toBe(true)
    for (const r of table('f06-days').rows) expect(r.ipa!.startsWith('ˈ'), r.en).toBe(true)
    for (const r of table('f06-months').rows) {
      expect(r.ipa!.includes('ˈ'), r.en).toBe(!['March', 'May', 'June'].includes(r.en))
    }
    expect(table('f06-months').rows.find((r) => r.en === 'July')?.ipa).toBe('dʒʊˈlaɪ')
  })

  it('thẻ quy tắc: 1–2 giữ nguyên, 3–8 đúng đáp án', () => {
    const cards = f06.ruleCards
    expect(cards.map((c) => c.id)).toEqual(Array.from({ length: 8 }, (_, i) => `f06-rule-${i + 1}`))
    expect(cards.map(ruleCardId)).toEqual(Array.from({ length: 8 }, (_, i) => `rule:f06-${i + 1}`))
    expect([cards[0].cloze, cards[0].answer]).toEqual(['thir___ = 13', 'teen'])
    expect([cards[1].cloze, cards[1].answer]).toEqual(['1st first, 2nd ___, 3rd third', 'second'])
    expect(cards.slice(2).map((c) => c.answer)).toEqual(['forty', 'Wednesday', 'Thursday', 'July', 'December', 'third'])
    expect(cards.find((c) => c.id === 'f06-rule-4')?.cloze).toBe('Monday, Tuesday, ___')
  })

  it('câu nói có f06-say-3; câu check / easier / apply mới đúng id', () => {
    const speak = screenOf(f06, 'apply').speak ?? []
    expect(speak.map((s) => s.id)).toEqual(['f06-say-1', 'f06-say-2', 'f06-say-3'])
    expect(speak[2].text).toBe('June twenty-first')
    expect(allItems(f06).map((i) => i.id)).toEqual(['f06-c1', 'f06-c2', 'f06-c3', 'f06-c4', 'f06-c5', 'f06-e1', 'f06-e2', 'f06-a1'])
  })

  it('câu có tên thứ / tháng thì khai báo days-months (câu luyện của viên có uses, câu quiz có requires)', () => {
    const missing: string[] = []
    const seen = new Set<string>()
    for (const b of bricks) {
      for (const item of allItems(b)) {
        if (!item.uses) continue
        const names = itemTexts(item).flatMap(dayMonthNames)
        for (const n of names) seen.add(n)
        if (names.length > 0 && !item.uses.includes('days-months')) missing.push(`${item.id} (${names.join(', ')})`)
      }
    }
    for (const q of [...FOUNDATION_QUESTIONS, ...QUESTION_BANK]) {
      if (!q.requires) continue
      const texts = [q.prompt.replace('___', q.answer), ...q.options, q.answer, q.audioText ?? '']
      const names = texts.flatMap(dayMonthNames)
      for (const n of names) seen.add(n)
      if (names.length > 0 && !(q.requires as readonly string[]).includes('days-months')) missing.push(`${q.id} (${names.join(', ')})`)
    }
    expect(missing).toEqual([])
    // Mọi tên thứ / tháng gặp trong các câu trên đều có trong bảng F06.
    const inTables = new Set([...ens('f06-days'), ...ens('f06-months')])
    expect([...seen].filter((n) => !inTables.has(n))).toEqual([])
    expect(seen.size).toBeGreaterThan(0)
    // Tự kiểm: "May I go?" không phải tên tháng; "in May", "May 3rd", "Mondays" thì có.
    expect(dayMonthNames('May I go?')).toEqual([])
    expect(dayMonthNames('I go on Mondays in May. May 3rd, July.')).toEqual(['Monday', 'July', 'May', 'May'])
    expect(dayMonthNames('May third · May twelfth · May, June')).toEqual(['June', 'May', 'May', 'May'])
    expect(dayMonthNames('May I help? May you be happy.')).toEqual([])
  })
})
