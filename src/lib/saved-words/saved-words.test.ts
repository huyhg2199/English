import { describe, expect, it } from 'vitest'

import type { Store } from '@/lib/storage'

import { normalizeWord, readSavedWords, saveWord, savedWordId, savedWordsOn, splitSentences, tokenize } from './index'

const NOW = new Date(2026, 10, 5, 21, 30)
const LATER = new Date(2026, 10, 5, 21, 31)
const TOMORROW = new Date(2026, 10, 6, 8, 0)
const store = (data: Record<string, unknown> = {}): Store => ({ schemaVersion: 5, data })
const source = { title: 'Our newest AI Quest', url: 'https://blog.google/x/' }

describe('saveWord — I/O Matrix', () => {
  it('lưu từ kèm câu gốc và nguồn; id = ngày + từ chuẩn hoá', () => {
    const s = saveWord(store(), { word: 'Literacy,', sentence: ' Learn AI literacy today. ', source }, NOW)
    const id = savedWordId('literacy', NOW)
    expect(id).toBe('2026-11-05:literacy')
    expect(readSavedWords(s)).toEqual({
      [id]: {
        word: 'literacy',
        sentence: 'Learn AI literacy today.',
        source,
        savedAt: NOW.toISOString(),
        updatedAt: NOW.toISOString(),
      },
    })
  })

  it('đủ 3 từ → savedWords có 3 mục kèm câu và nguồn', () => {
    let s = store()
    for (const w of ['learn', 'literacy', 'lesson']) s = saveWord(s, { word: w, sentence: 'x', source }, NOW)
    const today = savedWordsOn(readSavedWords(s), NOW)
    expect(today.map((w) => w.word)).toEqual(['learn', 'literacy', 'lesson'])
    expect(today.every((w) => w.sentence === 'x' && w.source.url === source.url)).toBe(true)
  })

  it('chạm lại từ đã lưu hôm nay (khác hoa/thường) → không tạo bản trùng, trả về store cũ', () => {
    const s = saveWord(store(), { word: 'AI', sentence: 'a', source }, NOW)
    expect(saveWord(s, { word: 'ai', sentence: 'b', source }, LATER)).toBe(s)
    expect(Object.keys(readSavedWords(s))).toHaveLength(1)
  })

  it('cùng từ ngày khác → mục mới; savedWordsOn chỉ lấy ngày đó', () => {
    let s = saveWord(store(), { word: 'ai', sentence: 'a', source }, NOW)
    s = saveWord(s, { word: 'ai', sentence: 'a', source }, TOMORROW)
    expect(Object.keys(readSavedWords(s))).toHaveLength(2)
    expect(savedWordsOn(readSavedWords(s), TOMORROW)).toHaveLength(1)
  })

  it('từ rỗng sau chuẩn hoá → không lưu', () => {
    const s = store()
    expect(saveWord(s, { word: '...', sentence: '', source }, NOW)).toBe(s)
  })

  it('mục sai dạng cùng id → ghi đè bằng mục hợp lệ; mục khác và field khác giữ nguyên', () => {
    const id = savedWordId('ai', NOW)
    const s = store({ savedWords: { items: { [id]: 'junk', other: 1 }, x: 2 } })
    const next = saveWord(s, { word: 'ai', sentence: 'a', source }, NOW)
    expect(next.data.savedWords).toMatchObject({ x: 2, items: { other: 1, [id]: { word: 'ai' } } })
  })

  it('normalizeWord: chữ thường, nháy cong → thẳng, bỏ dấu câu hai đầu', () => {
    expect(normalizeWord('“Google’s”')).toBe("google's")
  })
})

describe('tokenize', () => {
  it('tách câu ở . ! ? và giữ nguyên văn bản', () => {
    expect(splitSentences('Hello world. Is it new?  Yes!\nGo')).toEqual(['Hello world.', 'Is it new?', 'Yes!', 'Go'])
    expect(splitSentences('   ')).toEqual([])
  })

  it('từ có word chuẩn hoá; số, dấu câu, URL là word: null; ghép lại đúng câu', () => {
    const [s] = tokenize('Google’s AI hit $368 billion in 2026, see https://x.com/a.b now.')
    expect(s.parts.map((p) => p.text).join('')).toBe(s.text)
    expect(s.parts.filter((p) => p.word).map((p) => p.word)).toEqual(["google's", 'ai', 'hit', 'billion', 'in', 'see', 'now'])
    expect(s.parts.some((p) => p.text.includes('https://x.com/a.b') && p.word === null)).toBe(true)
  })

  it('từ ghép gạch nối giữ nguyên; chữ cái lẻ (trừ a, I) không phải từ', () => {
    const [s] = tokenize('A state-of-the-art model, I think x.')
    expect(s.parts.filter((p) => p.word).map((p) => p.word)).toEqual(['a', 'state-of-the-art', 'model', 'i', 'think'])
  })

  it('URL có dấu chấm không làm tách câu', () => {
    expect(tokenize('Read www.example.com/a.html today. Then rest.').map((s) => s.text)).toEqual([
      'Read www.example.com/a.html today.',
      'Then rest.',
    ])
  })
})
