import { describe, expect, it } from 'vitest'

import {
  frontedTimeTail,
  isTenseScopeId,
  NOT_PAST,
  outOfScopeWords,
  promptEnglish,
  TENSE_SCOPE_IDS,
  TIME_TAILS,
} from './tense-scope'

const flagged = (...args: Parameters<typeof outOfScopeWords>) => outOfScopeWords(...args).length > 0

describe('outOfScopeWords (story 36)', () => {
  it('6 thì T1–T2', () => {
    expect(TENSE_SCOPE_IDS).toEqual([
      'present-simple',
      'present-simple-questions',
      'present-continuous',
      'past-to-be',
      'past-simple',
      'past-simple-irregular',
    ])
    expect(isTenseScopeId('past-to-be')).toBe(true)
    expect(isTenseScopeId('will')).toBe(false)
    for (const w of ['need', 'red', 'bed', 'speed', 'tired', 'bored', 'excited', 'interested', 'married']) expect(NOT_PAST.has(w)).toBe(true)
  })

  it('present-simple: không quá khứ, không be + V-ing, không do / does, không modal / some', () => {
    for (const text of ['She is cooking', 'went', "doesn't", 'Do you like tea?', 'will', 'some', 'worked', 'Are you listening?', "She's reading", 'He does not work.', 'Where does he live?', 'was']) {
      expect(flagged('present-simple', text), text).toBe(true)
    }
    for (const text of ['She watches TV every evening.', 'I am tired.', 'The book is interesting.', 'She does her homework.', 'It is morning.', "Huy's phone"]) {
      expect(outOfScopeWords('present-simple', text), text).toEqual([])
    }
    expect(outOfScopeWords('present-simple', 'She is cooking')).toEqual(['cooking', 'is cooking'])
    expect(outOfScopeWords('present-simple', 'went')).toEqual(['went'])
  })

  it('present-simple-questions: do / does được, quá khứ và V-ing thì không', () => {
    expect(outOfScopeWords('present-simple-questions', 'Does she work?')).toEqual([])
    expect(outOfScopeWords('present-simple-questions', "I don't eat meat. Where do you live?")).toEqual([])
    expect(outOfScopeWords('present-simple-questions', 'worked')).toEqual(['worked'])
    expect(flagged('present-simple-questions', 'She is cooking.')).toBe(true)
  })

  it('present-continuous: V-ing được, quá khứ thì không', () => {
    expect(outOfScopeWords('present-continuous', 'We are having dinner now.')).toEqual([])
    expect(outOfScopeWords('present-continuous', "Are they waiting? He isn't driving.")).toEqual([])
    for (const text of ['was', 'did', 'played', 'saw']) expect(flagged('present-continuous', text), text).toBe(true)
  })

  it('past-to-be: was / were được; -ed, didn\'t, V2 khác thì không; did chỉ được khi là lựa chọn sai', () => {
    for (const text of ['worked', "didn't", 'went']) expect(flagged('past-to-be', text), text).toBe(true)
    expect(outOfScopeWords('past-to-be', 'did')).toEqual(['did'])
    expect(outOfScopeWords('past-to-be', 'did', { wrongOption: true })).toEqual([])
    expect(outOfScopeWords('past-to-be', "didn't", { wrongOption: true })).toEqual(["didn't"])
    expect(outOfScopeWords('past-to-be', 'They were tired.')).toEqual([])
    expect(outOfScopeWords('past-to-be', "Was she happy? No, she wasn't. They weren't at home.")).toEqual([])
  })

  it('past-simple: -ed, did, was được; V2 bất quy tắc thì không', () => {
    for (const text of ['stopped', "didn't", 'was', 'Did you watch it? — Yes, I did.']) expect(outOfScopeWords('past-simple', text), text).toEqual([])
    for (const text of ['went', 'had']) expect(outOfScopeWords('past-simple', text), text).toEqual([text])
  })

  it('past-simple-irregular: V2 được; V3 khác V2 thì không', () => {
    for (const text of ['went', 'bought', 'had', 'catched']) expect(outOfScopeWords('past-simple-irregular', text), text).toEqual([])
    for (const text of ['gone', 'eaten', 'been']) expect(outOfScopeWords('past-simple-irregular', text), text).toEqual([text])
  })

  it('mọi thì: going to, gonna, can, \'ll, because, so, many đều bị báo', () => {
    for (const id of TENSE_SCOPE_IDS) {
      for (const text of ['going to', 'gonna', 'can', "I'll", 'because', 'so', 'many']) {
        expect(flagged(id, text), `${id}: ${text}`).toBe(true)
      }
      expect(flagged(id, 'I can’t go.'), id).toBe(true)
    }
  })

  it('review story 36: V-ing đứng một mình, chủ ngữ danh từ / trạng từ trước V-ing, do / does dạng khác (T1-W2)', () => {
    for (const text of ['drinking', 'living', 'Is your mother cooking?', 'She is still sleeping.', 'How often do you swim?', 'What time does she work?', 'Lan, do you like tea?', 'Yes, she does.', "No, I don't"]) {
      expect(flagged('present-simple', text), text).toBe(true)
    }
    expect(outOfScopeWords('present-continuous', 'Is your mother cooking? She is still sleeping.')).toEqual([])
    expect(outOfScopeWords('present-simple-questions', 'How often do you swim? Yes, she does.')).toEqual([])
    for (const text of ['It is amazing.', 'Lan works in a tall building.', 'two hundred', 'She does her homework.']) {
      expect(outOfScopeWords('present-simple', text), text).toEqual([])
    }
  })

  it('review story 36: quá khứ tiếp diễn, hoàn thành (V3 = V2 / -ed), may / might / shall / ought, \'d, than bị báo ở mọi thì', () => {
    for (const id of TENSE_SCOPE_IDS) {
      for (const text of ['She was cooking.', 'Were you sleeping?', "They weren't working.", 'She has worked here.', 'I have made a cake.', 'He had bought it.', 'may', 'might', 'shall', 'ought', "I'd like tea.", 'She is taller than me.']) {
        expect(flagged(id, text), `${id}: ${text}`).toBe(true)
      }
    }
    for (const id of ['past-to-be', 'past-simple', 'past-simple-irregular'] as const) {
      expect(outOfScopeWords(id, 'The movie was boring.'), id).toEqual([])
    }
    expect(outOfScopeWords('past-simple-irregular', 'I had a big lunch. She has red hair.')).toEqual([])
    expect(outOfScopeWords('present-continuous', 'I am going to school.')).toEqual([])
    expect(flagged('present-continuous', 'I am going to cook.')).toBe(true)
  })

  it('nháy cong coi như nháy thẳng', () => {
    expect(outOfScopeWords('present-simple', 'She doesn’t eat.')).toEqual(["doesn't"])
  })
})

describe('frontedTimeTail', () => {
  it('đưa trạng ngữ cuối câu lên đầu; không có thì undefined', () => {
    expect(frontedTimeTail('i played football last sunday')).toBe('last sunday i played football')
    expect(frontedTimeTail('we are having dinner right now')).toBe('right now we are having dinner')
    expect(frontedTimeTail('he studies english every day')).toBe('every day he studies english')
    expect(frontedTimeTail('she does not drink coffee')).toBeUndefined()
    expect(frontedTimeTail('i know')).toBeUndefined()
    expect(TIME_TAILS).toContain('last weekend')
  })
})

describe('promptEnglish', () => {
  it('đề dịch → chỉ gợi ý; đề biến đổi → câu sau ":" kèm gợi ý; đề khác giữ nguyên', () => {
    expect(promptEnglish('Dịch sang tiếng Anh: Cô ấy không uống cà phê. (drink, coffee)')).toBe('drink, coffee')
    expect(promptEnglish('Đổi sang câu hỏi: You were at work yesterday.')).toBe('You were at work yesterday.')
    expect(promptEnglish('Đổi sang quá khứ (last Sunday): I play football.')).toBe('last Sunday · I play football.')
    expect(promptEnglish('She ___ (watch) TV every evening.')).toBe('She ___ (watch) TV every evening.')
  })
})
