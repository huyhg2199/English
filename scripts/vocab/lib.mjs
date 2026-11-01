// Đọc CSV NGSL/TSL và kiểm dữ liệu AI. Dùng chung cho build.mjs và check-batch.mjs.
import { readFileSync } from 'node:fs'

/** Từ loại hợp lệ (tiếng Anh; app đổi sang nhãn Việt). */
export const POS = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'determiner',
  'number',
  'interjection',
]

const AI_FIELDS = ['word', 'pos', 'ipa', 'syllables', 'stressIndex', 'meaningVi', 'exampleEn', 'exampleVi']

/**
 * Giải mã file nguồn: NGSL là UTF-8, TSL 1.2 có byte Latin-1 (vd "résumé") và xuống dòng CRLF.
 * Thử UTF-8 nghiêm ngặt trước, lỗi thì đọc windows-1252.
 */
function decode(buf) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    return new TextDecoder('windows-1252').decode(buf)
  }
}

/** Excel đã đổi "true"/"false" trong NGSL thành TRUE/FALSE; trả lại dạng từ thường. */
function normalizeWord(raw) {
  const w = raw.trim()
  if (w === 'TRUE' || w === 'FALSE') return w.toLowerCase()
  return w
}

/** Đọc CSV nguồn → [{ word, rank }] theo hạng. `rankColumn` là tên cột hạng. */
export function readList(path, wordColumn, rankColumn) {
  const text = decode(readFileSync(path)).replace(/^﻿/, '')
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim() !== '')
  const header = lines[0].split(',').map((h) => h.trim())
  const wi = header.indexOf(wordColumn)
  const ri = header.indexOf(rankColumn)
  if (wi < 0 || ri < 0) throw new Error(`${path}: thiếu cột ${wordColumn} hoặc ${rankColumn}`)
  const out = lines.slice(1).map((line, i) => {
    const cols = line.split(',')
    const rank = Number(cols[ri])
    if (!Number.isInteger(rank)) throw new Error(`${path}: dòng ${i + 2} hạng không hợp lệ`)
    return { word: normalizeWord(cols[wi]), rank }
  })
  out.sort((a, b) => a.rank - b.rank)
  out.forEach((e, i) => {
    if (e.rank !== i + 1) throw new Error(`${path}: hạng không liên tục ở "${e.word}"`)
  })
  return out
}

/**
 * Id ổn định theo chữ (không theo hạng): thường hoá, ký tự khác chữ/số → "-".
 * Giữ dấu (NFC) vì TSL có cả "resume" (động từ) lẫn "résumé" (CV).
 */
export function slugify(word) {
  return word
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
}

const nonEmpty = (v) => typeof v === 'string' && v.trim() !== ''

/** Hạt nhân âm tiết trong IPA kiểu Mỹ (nguyên âm đôi trước, rồi nguyên âm đơn, phụ âm âm tiết tính). */
export const VOWEL_NUCLEI = /(aɪ|aʊ|ɔɪ|eɪ|oʊ|eə|ɪə|ʊə|ɝː|ɜː|ɝ|ɜ|ɚ|iː|uː|ɑː|ɔː|[iɪeæʌəʊɑɔuɛɒɐao]|l̩|n̩)/g

/** Trả về danh sách lỗi của một mục AI (rỗng = hợp lệ). */
export function validateAiEntry(e) {
  const errors = []
  if (typeof e !== 'object' || e === null || Array.isArray(e)) return ['không phải object']
  for (const k of Object.keys(e)) if (!AI_FIELDS.includes(k)) errors.push(`field lạ "${k}"`)
  for (const k of ['word', 'ipa', 'meaningVi', 'exampleEn', 'exampleVi']) {
    if (!nonEmpty(e[k])) errors.push(`thiếu ${k}`)
  }
  if (!POS.includes(e.pos)) errors.push(`pos "${e.pos}" không thuộc ${POS.join('|')}`)
  const syl = e.syllables
  if (!Array.isArray(syl) || syl.length === 0 || !syl.every(nonEmpty)) {
    errors.push('syllables phải là mảng chuỗi không rỗng')
  } else {
    if (nonEmpty(e.word) && syl.join('') !== e.word.replace(/\s+/g, '')) {
      errors.push(`syllables "${syl.join('·')}" ghép lại không ra "${e.word}"`)
    }
    if (!Number.isInteger(e.stressIndex) || e.stressIndex < 0 || e.stressIndex >= syl.length) {
      errors.push(`stressIndex ${e.stressIndex} nằm ngoài syllables (${syl.length})`)
    }
    if (nonEmpty(e.ipa) && syl.length > 1 && !e.ipa.includes('ˈ')) errors.push('ipa nhiều âm tiết thiếu dấu ˈ')
    // Âm tiết nổi bật trong app phải khớp vị trí ˈ trong IPA: đếm nguyên âm đứng trước ˈ.
    if (nonEmpty(e.ipa) && syl.length > 1 && e.ipa.includes('ˈ') && Number.isInteger(e.stressIndex)) {
      const before = (e.ipa.split('ˈ')[0].match(VOWEL_NUCLEI) ?? []).length
      if (before !== e.stressIndex) {
        errors.push(`stressIndex ${e.stressIndex} lệch với IPA (ˈ đứng trước âm tiết thứ ${before + 1})`)
      }
    }
  }
  if (nonEmpty(e.ipa)) {
    if (/[/[\]]/.test(e.ipa)) errors.push('ipa không được có / hoặc []')
    if (/['":]/.test(e.ipa)) errors.push("ipa dùng ' hoặc : thay vì ˈ / ː")
  }
  return errors
}
