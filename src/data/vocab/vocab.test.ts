import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { cambridgeUrl, compareStudyOrder, hasDetails, loadWords, PARTS_OF_SPEECH, VOCAB_ATTRIBUTION } from './index'

const words = await loadWords()

/** Cùng tập hạt nhân âm tiết với scripts/vocab/lib.mjs (nguyên âm đôi đứng trước để khớp trước). */
const VOWEL_NUCLEI = /(aɪ|aʊ|ɔɪ|eɪ|oʊ|eə|ɪə|ʊə|ɝː|ɜː|ɝ|ɜ|ɚ|iː|uː|ɑː|ɔː|[iɪeæʌəʊɑɔuɛɒɐao]|l̩|n̩)/g

/** Đọc cột từ của CSV gốc (NGSL: UTF-8; TSL: Latin-1 + CRLF), như scripts/vocab/lib.mjs. */
function sourceWords(file: string): string[] {
  const buf = readFileSync(fileURLToPath(new URL(`../../../scripts/vocab/source/${file}`, import.meta.url)))
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    text = new TextDecoder('windows-1252').decode(buf)
  }
  return text
    .split(/\r\n|\r|\n/)
    .slice(1)
    .filter((l) => l.trim() !== '')
    .map((l) => l.split(',')[0].trim())
    .map((w) => (w === 'TRUE' || w === 'FALSE' ? w.toLowerCase() : w))
}

describe('words.json', () => {
  it('đủ 2809 NGSL + 1250 TSL, hạng liên tục, NGSL trước TSL', () => {
    const ngsl = words.filter((w) => w.list === 'ngsl')
    const tsl = words.filter((w) => w.list === 'tsl')
    expect(ngsl).toHaveLength(2809)
    expect(tsl).toHaveLength(1250)
    expect(ngsl.map((w) => w.rank)).toEqual(Array.from({ length: 2809 }, (_, i) => i + 1))
    expect(tsl.map((w) => w.rank)).toEqual(Array.from({ length: 1250 }, (_, i) => i + 1))
    expect([...words].sort(compareStudyOrder)).toEqual(words)
  })

  it('không có từ nào ngoài NGSL/TSL (khớp CSV gốc)', () => {
    expect(words.filter((w) => w.list === 'ngsl').map((w) => w.word)).toEqual(sourceWords('NGSL_12_stats.csv'))
    expect(words.filter((w) => w.list === 'tsl').map((w) => w.word)).toEqual(sourceWords('TSL_12_stats.csv'))
  })

  it('id duy nhất, dạng <list>-<từ>', () => {
    expect(new Set(words.map((w) => w.id)).size).toBe(words.length)
    for (const w of words) expect(w.id.startsWith(`${w.list}-`)).toBe(true)
  })

  it('1000 từ NGSL đầu (hạng 1–1000) có dữ liệu AI, các từ khác chưa có', () => {
    const detailed = words.filter(hasDetails)
    expect(detailed).toHaveLength(1000)
    expect(detailed.every((w) => w.list === 'ngsl' && w.rank <= 1000)).toBe(true)
  })

  it('dữ liệu AI đúng cấu trúc: âm tiết ghép ra từ, âm nhấn nằm trong âm tiết, IPA có ˈ khi nhiều âm tiết', () => {
    for (const w of words.filter(hasDetails)) {
      const label = w.word
      expect(PARTS_OF_SPEECH, label).toContain(w.pos)
      expect(w.syllables.join(''), label).toBe(w.word.replace(/\s+/g, ''))
      expect(Number.isInteger(w.stressIndex) && w.stressIndex >= 0 && w.stressIndex < w.syllables.length, label).toBe(true)
      if (w.syllables.length > 1) {
        expect(w.ipa, label).toContain('ˈ')
        // Âm tiết nổi bật phải khớp vị trí ˈ: số hạt nhân đứng trước ˈ = stressIndex.
        expect((w.ipa.split('ˈ')[0].match(VOWEL_NUCLEI) ?? []).length, label).toBe(w.stressIndex)
      }
      expect(w.ipa, label).not.toMatch(/[/[\]':]/)
      for (const text of [w.meaningVi, w.exampleEn, w.exampleVi]) expect(text.trim(), label).not.toBe('')
    }
  })

  it('id thẻ (key SRS đồng bộ) cố định cho các từ khó', () => {
    const idOf = (list: string, word: string) => words.find((w) => w.list === list && w.word === word)?.id
    expect(idOf('tsl', 'résumé')).toBe('tsl-résumé')
    expect(idOf('tsl', 'resume')).toBe('tsl-resume')
    expect(idOf('tsl', 'ice cream')).toBe('tsl-ice-cream')
    expect(idOf('tsl', "o'clock")).toBe('tsl-o-clock')
    expect(idOf('tsl', 'e-book')).toBe('tsl-e-book')
    expect(idOf('ngsl', 'true')).toBe('ngsl-true')
    expect(idOf('ngsl', 'I')).toBe('ngsl-i')
  })

  it('từ đầu tiên là "the"', () => {
    expect(words[0]).toMatchObject({ id: 'ngsl-the', word: 'the', list: 'ngsl', rank: 1 })
  })
})

describe('cambridgeUrl / ghi nguồn', () => {
  it('link bản Mỹ, cụm từ nối bằng gạch, mã hoá ký tự đặc biệt', () => {
    expect(cambridgeUrl('people')).toBe('https://dictionary.cambridge.org/us/dictionary/english/people')
    expect(cambridgeUrl('ice cream')).toBe('https://dictionary.cambridge.org/us/dictionary/english/ice-cream')
    expect(cambridgeUrl('résumé')).toBe('https://dictionary.cambridge.org/us/dictionary/english/r%C3%A9sum%C3%A9')
  })

  it('ghi nguồn CC BY-SA 4.0 và newgeneralservicelist.com', () => {
    expect(VOCAB_ATTRIBUTION.text).toContain('CC BY-SA 4.0')
    expect(VOCAB_ATTRIBUTION.sourceUrl).toContain('newgeneralservicelist.com')
  })
})
