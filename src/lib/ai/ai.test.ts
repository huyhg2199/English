import { describe, expect, it, vi } from 'vitest'

import { getQuestion, type ChoiceQuestion } from '@/data/questions'
import { createBackup, serializeBackup } from '@/lib/backup'
import { pickSynced } from '@/lib/sync/merge'

import {
  buildExplainPrompt,
  clearGeminiKey,
  DEFAULT_GEMINI_MODEL,
  explainMistake,
  GEMINI_ERROR_MESSAGES,
  GEMINI_KEY_STORAGE,
  readGeminiKey,
  readGeminiModel,
  saveGeminiKey,
  saveGeminiModel,
} from './index'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  }
}

const question = getQuestion('q-s1-t1-w2-01') as ChoiceQuestion

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('key Gemini ở localStorage', () => {
  it('lưu / đọc / xoá dưới key riêng, cắt khoảng trắng', () => {
    const s = memoryStorage()
    expect(readGeminiKey(s)).toBeNull()
    saveGeminiKey('  AIza-test  ', s)
    expect(s.map.get(GEMINI_KEY_STORAGE)).toBe('AIza-test')
    expect(readGeminiKey(s)).toBe('AIza-test')
    clearGeminiKey(s)
    expect(readGeminiKey(s)).toBeNull()
    saveGeminiKey('x', s)
    saveGeminiKey('   ', s)
    expect(readGeminiKey(s)).toBeNull()
  })

  it('localStorage bị chặn → không crash', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    expect(readGeminiKey(broken)).toBeNull()
    expect(saveGeminiKey('k', broken)).toBe(false)
    expect(() => clearGeminiKey(broken)).not.toThrow()
  })

  it('model mặc định gemini-2.5-flash; đổi được; tên lạ bị từ chối', () => {
    const s = memoryStorage()
    expect(readGeminiModel(s)).toBe(DEFAULT_GEMINI_MODEL)
    expect(DEFAULT_GEMINI_MODEL).toBe('gemini-2.5-flash')
    expect(saveGeminiModel('gemini-2.0-flash', s)).toBe(true)
    expect(readGeminiModel(s)).toBe('gemini-2.0-flash')
    expect(saveGeminiModel('../evil?x=1', s)).toBe(false)
    expect(readGeminiModel(s)).toBe('gemini-2.0-flash')
    saveGeminiModel('', s)
    expect(readGeminiModel(s)).toBe(DEFAULT_GEMINI_MODEL)
  })

  it('key không lọt vào đồng bộ hay file sao lưu (nằm ngoài store.data)', () => {
    const s = memoryStorage()
    saveGeminiKey('AIza-secret', s)
    const data = { mistakes: { items: {} }, quizzes: { attempts: {} }, geminiKey: 'AIza-secret', [GEMINI_KEY_STORAGE]: 'AIza-secret' }
    expect(JSON.stringify(pickSynced(data))).not.toContain('AIza-secret')
    const backup = serializeBackup(createBackup({ schemaVersion: 9, data }, new Date()))
    expect(backup).not.toContain('AIza-secret')
    expect(backup).not.toContain(GEMINI_KEY_STORAGE)
    expect(backup).not.toContain('geminiKey')
  })
})

describe('explainMistake', () => {
  it('không có key → mời nhập key, không gọi mạng', async () => {
    const fetch = vi.fn()
    const r = await explainMistake({ fetch, key: null, question, chosen: 'work' })
    expect(r).toEqual({ ok: false, code: 'no-key', message: GEMINI_ERROR_MESSAGES['no-key'] })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('key hợp lệ: POST đúng endpoint, key ở header (không ở URL), trả lời tiếng Việt', async () => {
    const fetch = vi.fn(async () =>
      jsonResponse(200, { candidates: [{ content: { parts: [{ text: 'Lỗi sai: ...\nVí dụ đúng: ...' }] } }] }),
    )
    const log = vi.spyOn(console, 'log')
    const warn = vi.spyOn(console, 'warn')
    const r = await explainMistake({ fetch, key: 'AIza-k', question, chosen: 'work' })
    expect(r).toEqual({ ok: true, text: 'Lỗi sai: ...\nVí dụ đúng: ...' })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent')
    expect(url).not.toContain('AIza-k')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('AIza-k')
    const body = JSON.parse(init.body as string)
    expect(body.contents[0].parts[0].text).toBe(buildExplainPrompt(question, 'work'))
    expect(log).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  it('prompt chỉ có đề, lựa chọn, đáp án đúng và đáp án đã chọn; yêu cầu 2 ví dụ', () => {
    const p = buildExplainPrompt(question, 'work')
    expect(p).toContain(question.prompt)
    for (const o of question.options) expect(p).toContain(`"${o}"`)
    expect(p).toContain(`Đáp án đúng: "${question.answer}"`)
    expect(p).toContain('Người học đã chọn: "work"')
    expect(p).toContain('2 câu ví dụ')
    expect(p).not.toContain(question.explanation)
    expect(p).not.toContain(question.lessonId)
  })

  it('prompt câu chọn đáp án giữ nguyên từng chữ (story 35 không đổi)', () => {
    expect(buildExplainPrompt(question, 'work').split('\n').slice(0, 6)).toEqual([
      'Bạn là giáo viên tiếng Anh cho người Việt mới học lại từ đầu (trình độ A1–A2).',
      'Dạng câu: chọn đáp án đúng để điền vào chỗ trống.',
      `Đề: ${question.prompt}`,
      `Các lựa chọn: ${question.options.map((o) => `"${o}"`).join(', ')}`,
      `Đáp án đúng: "${question.answer}"`,
      'Người học đã chọn: "work"',
    ])
  })

  it('prompt câu gõ (story 35): không có dòng "Các lựa chọn", ghi dạng tự gõ và "Người học đã gõ"', () => {
    const typed = getQuestion('q-s1-t2-w1-09')!
    const p = buildExplainPrompt(typed, 'They are waiting for the bus?')
    expect(p).not.toContain('Các lựa chọn')
    expect(p).toContain('Dạng câu: tự gõ lại cả câu theo yêu cầu (biến đổi hoặc dịch).')
    expect(p).toContain(`Đề: ${typed.prompt}`)
    expect(p).toContain('Đáp án đúng: "Are they waiting for the bus?"')
    expect(p).toContain('Người học đã gõ: "They are waiting for the bus?"')
    expect(p).not.toContain('Người học đã chọn')
    const blank = buildExplainPrompt(getQuestion('q-s1-t2-w1-07')!, '')
    expect(blank).toContain('Dạng câu: gõ dạng đúng của động từ vào chỗ trống.')
    expect(blank).toContain('Người học đã gõ: (bỏ trống)')
  })

  it('prompt câu gõ nói cách chấm và hỏi "vì sao câu đã gõ sai"; câu chọn đáp án không có dòng này', () => {
    const p = buildExplainPrompt(getQuestion('q-s1-t2-w1-09')!, 'They are waiting for the bus?')
    expect(p).toContain('Cách chấm: không tính hoa thường, dấu câu, khoảng trắng thừa')
    expect(p).toContain('Lỗi sai: vì sao câu đã gõ sai.')
    expect(p).not.toContain('đáp án đã chọn sai')
    const choice = buildExplainPrompt(question, 'work')
    expect(choice).not.toContain('Cách chấm')
    expect(choice).toContain('Lỗi sai: vì sao đáp án đã chọn sai.')
  })

  it.each([
    [400, { error: { status: 'INVALID_ARGUMENT', details: [{ reason: 'API_KEY_INVALID' }] } }, 'invalid-key'],
    [400, { error: { status: 'INVALID_ARGUMENT', message: 'bad' } }, 'bad-request'],
    [403, { error: { status: 'PERMISSION_DENIED' } }, 'invalid-key'],
    [404, { error: {} }, 'model-not-found'],
    [429, { error: { status: 'RESOURCE_EXHAUSTED' } }, 'quota'],
    [503, {}, 'server'],
  ])('HTTP %i → %s, báo tiếng Việt', async (status, body, code) => {
    const r = await explainMistake({ fetch: async () => jsonResponse(status, body), key: 'k', question, chosen: 'x' })
    expect(r).toEqual({ ok: false, code, message: GEMINI_ERROR_MESSAGES[code as keyof typeof GEMINI_ERROR_MESSAGES] })
  })

  it('lỗi mạng / offline → network; huỷ → aborted; trả lời rỗng → empty', async () => {
    const offline = await explainMistake({
      fetch: async () => {
        throw new TypeError('Failed to fetch')
      },
      key: 'k',
      question,
      chosen: 'x',
    })
    expect(offline).toMatchObject({ ok: false, code: 'network' })
    const aborted = await explainMistake({
      fetch: async () => {
        throw new DOMException('aborted', 'AbortError')
      },
      key: 'k',
      question,
      chosen: 'x',
    })
    expect(aborted).toMatchObject({ ok: false, code: 'aborted' })
    const empty = await explainMistake({ fetch: async () => jsonResponse(200, { candidates: [] }), key: 'k', question, chosen: 'x' })
    expect(empty).toMatchObject({ ok: false, code: 'empty' })
  })

  it('model tuỳ chọn được mã hoá vào URL; tên sai dạng thì không gọi', async () => {
    const fetch = vi.fn(async () => jsonResponse(200, { candidates: [{ content: { parts: [{ text: 'ok' }] } }] }))
    await explainMistake({ fetch, key: 'k', model: 'gemini-2.0-flash', question, chosen: '' })
    expect((fetch.mock.calls[0] as unknown as [string])[0]).toContain('/models/gemini-2.0-flash:generateContent')
    const r = await explainMistake({ fetch, key: 'k', model: 'a/b', question, chosen: '' })
    expect(r).toMatchObject({ ok: false, code: 'bad-model' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
