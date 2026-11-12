import { describe, expect, it } from 'vitest'

import {
  frontedTimeTail,
  isTenseScopeId,
  NOT_PAST,
  outOfScopeWords,
  promptEnglish,
  sContraction,
  T1_T2_SCOPE_IDS,
  T3_T4_SCOPE_IDS,
  TENSE_SCOPE_IDS,
  TIME_TAILS,
  type TenseScopeId,
} from './tense-scope'

const flagged = (...args: Parameters<typeof outOfScopeWords>) => outOfScopeWords(...args).length > 0

describe('outOfScopeWords (story 36)', () => {
  it('13 id: 6 thì T1–T2 rồi 7 chủ điểm T3–T4 theo thứ tự lộ trình (story 37)', () => {
    expect(T1_T2_SCOPE_IDS).toEqual([
      'present-simple',
      'present-simple-questions',
      'present-continuous',
      'past-to-be',
      'past-simple',
      'past-simple-irregular',
    ])
    expect(T3_T4_SCOPE_IDS).toEqual([
      'will',
      'going-to',
      'present-perfect',
      'present-perfect-vs-past',
      'modals',
      'comparatives',
      'passive-present',
    ])
    expect(TENSE_SCOPE_IDS).toEqual([...T1_T2_SCOPE_IDS, ...T3_T4_SCOPE_IDS])
    expect(isTenseScopeId('past-to-be')).toBe(true)
    expect(isTenseScopeId('will')).toBe(true)
    expect(isTenseScopeId('to-be')).toBe(false)
    for (const w of ['need', 'red', 'bed', 'speed', 'tired', 'bored', 'excited', 'interested', 'married']) expect(NOT_PAST.has(w)).toBe(true)
  })

  it('present-simple: không quá khứ, không be + V-ing, không do / does, không modal', () => {
    for (const text of ['She is cooking', 'went', "doesn't", 'Do you like tea?', 'will', 'worked', 'Are you listening?', "She's reading", 'He does not work.', 'Where does he live?', 'was']) {
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

  it('mọi thì T1–T2: going to, gonna, can, \'ll đều bị báo', () => {
    for (const id of T1_T2_SCOPE_IDS) {
      for (const text of ['going to', 'gonna', 'can', "I'll"]) {
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

  it('review story 36: quá khứ tiếp diễn, hoàn thành (V3 = V2 / -ed), may / might / shall / ought, \'d, than bị báo ở mọi thì T1–T2', () => {
    for (const id of T1_T2_SCOPE_IDS) {
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

describe('outOfScopeWords T3–T4 (story 37)', () => {
  /** Thì dùng được từ -ed (past-simple trở đi). */
  const SCOPE_ED: readonly TenseScopeId[] = TENSE_SCOPE_IDS.slice(TENSE_SCOPE_IDS.indexOf('past-simple'))
  /** Bảng "Phạm vi chữ theo thì" (Design Notes story 37): mỗi hàng là một nhóm, `from` là chủ điểm đầu tiên được dùng. */
  const ROWS: readonly { group: string; from: TenseScopeId; samples: readonly string[] }[] = [
    { group: "will, won't, 'll", from: 'will', samples: ['I will call you.', "She won't come.", "I'll help you."] },
    { group: 'going to, gonna', from: 'going-to', samples: ['It is going to rain.', "I'm gonna call him."] },
    {
      group: "hoàn thành (V3, have / has + V2 / V3 / -ed, 's + V3)",
      from: 'present-perfect',
      samples: ['She has seen it.', 'We have visited Hue.', 'Have you ever eaten pho?', "My father's never driven a car.", 'been', 'Has your son finished his lunch?'],
    },
    { group: 'since, how long', from: 'present-perfect-vs-past', samples: ['since Monday', 'How long is the movie?'] },
    {
      group: 'can / should / must',
      from: 'modals',
      samples: ['You should rest.', "I can't swim.", 'We must go.', "You mustn't park here.", 'Can I sit here?', 'He cannot come.'],
    },
    {
      group: 'than, the best / worst / most, the + -est',
      from: 'comparatives',
      samples: ['She is taller than me.', 'It is the best day.', 'He is the tallest boy.', 'the most useful app', 'the worst day'],
    },
    {
      group: 'bị động hiện tại',
      from: 'passive-present',
      samples: [
        'English is spoken here.',
        'These cars are made in Japan.',
        "The tip isn't included.",
        'Is English taught here?',
        "They're cleaned every day.",
        'Are these old cups made in Japan?',
      ],
    },
  ]

  it('mỗi hàng của bảng: bị báo ở mọi thì T1–T2 và mọi chủ điểm đứng trước cột "được" đầu tiên; từ cột đó trở đi thì không', () => {
    for (const row of ROWS) {
      const from = TENSE_SCOPE_IDS.indexOf(row.from)
      for (const [k, id] of TENSE_SCOPE_IDS.entries()) {
        for (const text of row.samples) {
          if (k < from) expect(flagged(id, text), `${row.group} @ ${id}: ${text}`).toBe(true)
          else expect(outOfScopeWords(id, text), `${row.group} @ ${id}: ${text}`).toEqual([])
        }
      }
    }
  })

  it('hàng "Nội dung vượt bài" của ma trận: mỗi chủ điểm bắt đúng cụm của bài sau', () => {
    expect(outOfScopeWords('will', 'It is going to rain.')).toEqual(['going to'])
    expect(outOfScopeWords('going-to', 'She has seen it.')).toEqual(['seen', 'has seen'])
    expect(outOfScopeWords('present-perfect', 'I have lived here since 2020.')).toEqual(['since'])
    expect(outOfScopeWords('present-perfect-vs-past', 'I can swim.')).toEqual(['can'])
    expect(outOfScopeWords('modals', 'He is taller than me.')).toEqual(['than'])
    expect(outOfScopeWords('comparatives', 'This bread is made every day.')).toEqual(['is made'])
    expect(outOfScopeWords('passive-present', 'It could rain.')).toEqual(['could'])
    expect(outOfScopeWords('passive-present', 'The cake was made yesterday.')).toEqual(['was made'])
    expect(outOfScopeWords('will', 'I have finished.')).toEqual(['have finished'])
    expect(outOfScopeWords('present-perfect-vs-past', 'How long have you lived here?')).toEqual([])
  })

  it('hàng "T1–T2 chặt thêm": was made, is cleaned, since Monday, the best, Don\'t worry., have to go bị báo ở 6 thì T1–T2', () => {
    for (const id of T1_T2_SCOPE_IDS) {
      for (const text of ['was made', 'is cleaned', 'since Monday', 'the best', "Don't worry.", 'have to go']) {
        expect(flagged(id, text), `${id}: ${text}`).toBe(true)
      }
    }
    // Bị động quá khứ có V2 / -ed hợp lệ ở thì quá khứ vẫn bị báo vì đứng sau was / were.
    expect(outOfScopeWords('past-simple-irregular', 'The cake was made yesterday.')).toEqual(['was made'])
    expect(outOfScopeWords('past-simple', 'The room was cleaned.')).toEqual(['was cleaned'])
  })

  it('nhóm "luôn bị báo" bị báo ở cả 13 thì', () => {
    const ALWAYS = [
      'could', 'would', 'may', 'might', 'shall', 'ought', "I'd like tea.", 'I have to go.', 'She has to work.', 'He had to wait.',
      'I used to swim.', 'He had bought it.', "She hadn't finished.", 'She was cooking.', 'The cake was made yesterday.',
      "They weren't invited.", 'Was the room cleaned?', "Don't worry.",
      "Stop! Don't touch it.", 'I have got to go.', "I've got to go.", 'I gotta go.', 'Were these old cups made in Japan?',
    ]
    for (const id of TENSE_SCOPE_IDS) for (const text of ALWAYS) expect(flagged(id, text), `${id}: ${text}`).toBe(true)
  })

  it('lượng từ (F15, story 43), liên từ (F16, story 44) không bị báo ở cả 13 thì', () => {
    const LINKERS = new Set(['some', 'any', 'many', 'much', 'lot', 'because', 'so', 'but', 'or', 'and'])
    const texts = [
      'some / many / much / a lot / because / so',
      'There are some eggs.',
      'How many books do you have?',
      'How much water do you drink?',
      'There are a lot of people in the bank.',
      'I am happy because I have a new job.',
      'I have a new job, so I am happy.',
      'My house is small, but it is nice.',
    ]
    for (const id of TENSE_SCOPE_IDS) {
      for (const text of texts) {
        const hits = outOfScopeWords(id, text)
        expect(hits.filter((w) => LINKERS.has(w)), `${id}: ${text}`).toEqual([])
        // Câu không có do / does: rỗng hẳn ở mọi thì (câu hỏi với do / does vẫn ngoài phạm vi của present-simple).
        if (!/\bdo\b/.test(text)) expect(hits, `${id}: ${text}`).toEqual([])
      }
    }
    for (const id of TENSE_SCOPE_IDS.filter((x) => x !== 'present-simple')) {
      expect(outOfScopeWords(id, 'How many books do you have?'), id).toEqual([])
    }
    // Vẫn bị báo: could, have to, "Don't + V", quá khứ tiếp diễn.
    for (const id of TENSE_SCOPE_IDS) {
      for (const text of ['could', 'I have to go.', "Don't worry.", 'She was cooking.']) expect(flagged(id, text), `${id}: ${text}`).toBe(true)
    }
  })

  it('không báo nhầm: tính từ -ed, going to + nơi chốn, the rest, have + danh từ, \'s + tính từ, lựa chọn "don\'t eat"', () => {
    for (const id of TENSE_SCOPE_IDS) {
      for (const text of ['I am tired.', "She's married.", 'the rest of the day', 'I have a test.', "It's interesting.", 'My best friend lives here.']) {
        expect(outOfScopeWords(id, text), `${id}: ${text}`).toEqual([])
      }
      expect(outOfScopeWords(id, 'I am going to school.'), id).not.toContain('going to')
    }
    for (const id of TENSE_SCOPE_IDS.filter((x) => x !== 'present-simple' && x !== 'present-simple-questions')) {
      expect(outOfScopeWords(id, 'I am going to school.'), id).toEqual([])
    }
    // Review story 37: Let's + V (V3 trùng V1), going to + tên nơi chốn, to be + tính từ -ed, the + từ -est không phải so sánh.
    for (const id of TENSE_SCOPE_IDS.filter((x) => x !== 'present-simple' && x !== 'present-simple-questions')) {
      for (const text of ["Let's read a book.", "Let's run to the park.", "Let's come home.", "I'm going to Hanoi.", 'He is the honest one.', 'the chest', 'the contest', 'the request']) {
        expect(outOfScopeWords(id, text), `${id}: ${text}`).toEqual([])
      }
    }
    for (const id of TENSE_SCOPE_IDS.filter((x) => SCOPE_ED.includes(x))) {
      for (const text of ['I was worried.', 'The shop was closed yesterday.', 'We were surprised.', 'The shop is closed.', "I'm worried.", "She's scared.", 'Is the shop closed?']) {
        expect(outOfScopeWords(id, text), `${id}: ${text}`).toEqual([])
      }
    }
    // "don't eat" viết thường là mảnh câu (lựa chọn của câu chọn), không phải câu mệnh lệnh.
    expect(outOfScopeWords('present-simple-questions', "don't eat")).toEqual([])
    expect(outOfScopeWords('past-simple-irregular', 'I had a big lunch. I have a red car.')).toEqual([])
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

  it('story 37: tomorrow, tonight, this weekend, this year, next …; "… ago" và "in + năm"', () => {
    expect(frontedTimeTail('we moved to hanoi three years ago')).toBe('three years ago we moved to hanoi')
    expect(frontedTimeTail('i lived in hue in 2020')).toBe('in 2020 i lived in hue')
    expect(frontedTimeTail('i will call you tomorrow')).toBe('tomorrow i will call you')
    expect(frontedTimeTail('she left two days ago')).toBe('two days ago she left')
    expect(frontedTimeTail('we are going to move next month')).toBe('next month we are going to move')
    expect(frontedTimeTail('i will call you tonight')).toBe('tonight i will call you')
    expect(frontedTimeTail('they have lived here since 2019')).toBeUndefined()
    // Review story 37: seven / eight / nine, an hour, minutes.
    expect(frontedTimeTail('we met nine years ago')).toBe('nine years ago we met')
    expect(frontedTimeTail('she left an hour ago')).toBe('an hour ago she left')
    expect(frontedTimeTail('he called two hours ago')).toBe('two hours ago he called')
    expect(frontedTimeTail('she left ten minutes ago')).toBe('ten minutes ago she left')
    for (const t of ['tomorrow', 'tonight', 'this weekend', 'this year', 'next week', 'next weekend', 'next month', 'next year', 'next monday']) {
      expect(TIME_TAILS, t).toContain(t)
    }
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

describe("sContraction (luật 's, story 37)", () => {
  it("he / she / it + is và chủ ngữ số ít + has + V3 / -ed có bản 's; has + danh từ, I / we + have thì không", () => {
    expect(sContraction('She is a teacher.')).toBe("She's a teacher.")
    expect(sContraction('My father has never driven a car.')).toBe("My father's never driven a car.")
    expect(sContraction('My mother has made a cake.')).toBe("My mother's made a cake.")
    expect(sContraction('He has bought a car.')).toBe("He's bought a car.")
    expect(sContraction('My sister has gone to Da Lat.')).toBe("My sister's gone to Da Lat.")
    expect(sContraction('She has finished.')).toBe("She's finished.")
    expect(sContraction('She has a cat.')).toBeUndefined()
    expect(sContraction('He has two brothers.')).toBeUndefined()
    expect(sContraction('We have finished.')).toBeUndefined()
    expect(sContraction('They are going to sell their house.')).toBeUndefined()
  })
})
