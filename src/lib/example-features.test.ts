import { describe, expect, it } from 'vitest'

import { EXAMPLE_FEATURES, exampleFeatures, labelExamples } from '../../scripts/vocab/example-features.mjs'

describe('exampleFeatures — máy dò ngữ pháp chưa học trong câu ví dụ (story 24)', () => {
  it('7 nhãn, đúng thứ tự trả về', () => {
    expect(EXAMPLE_FEATURES).toEqual(['past', 'future', 'continuous', 'perfect', 'modal', 'comparative', 'conditional'])
  })

  it.each([
    // hiện tại đơn, to be, mệnh lệnh: sạch
    ['I work in a bank.', []],
    ['There is nothing in the box.', []],
    ['The morning is cool.', []],
    ['This book is interesting.', []],
    ['I read books at night.', []],
    ["It's cold today.", []],
    ['My bed is red.', []],
    ['I go to bed early.', []],
    ['We need a guest room.', []],
    // past
    ['I went to school.', ['past']],
    ['She worked late.', ['past']],
    ['The window was open.', ['past']],
    ["I didn't go.", ['past']],
    // future
    ['I will call you.', ['future']],
    ["I'll call you.", ['future']],
    ["She won't come.", ['future']],
    // be going to + động từ: tương lai (dạng "be + going" cũng là tiếp diễn)
    ['I am going to cook dinner.', ['future', 'continuous']],
    ['It is going to be cold.', ['future', 'continuous']],
    // continuous
    ['They are running.', ['continuous']],
    ['She is always talking.', ['continuous']],
    ["We're eating lunch.", ['continuous']],
    // perfect (phân từ hai cũng là dấu quá khứ)
    ['I have studied.', ['past', 'perfect']],
    ['She has already eaten.', ['past', 'perfect']],
    ["I've seen it.", ['past', 'perfect']],
    // modal
    ['I can swim.', ['modal']],
    ['May I come in?', ['modal']],
    ['You have to go.', ['modal']],
    ["I'd like some tea.", ['modal']],
    // comparative
    ['He is taller than me.', ['comparative']],
    ['This is better.', ['comparative']],
    ['We need more time.', ['comparative']],
    ['It is the biggest room.', ['comparative']],
    ['This is our newest model.', ['comparative']],
    ['The forest is quiet.', []],
    // conditional
    ['Call me if you are late.', ['conditional']],
    ['Unless you help, I stop.', ['conditional']],
  ] as const)('%s → %j', (sentence, expected) => {
    expect(exampleFeatures(sentence)).toEqual(expected)
  })

  it('"going to" + nơi chốn là tiếp diễn, không phải tương lai', () => {
    expect(exampleFeatures('I am going to the station.')).toEqual(['continuous'])
  })

  it('xác định: cùng câu luôn cho cùng kết quả, không trùng nhãn', () => {
    const s = 'If I went there, I would have been happier than him.'
    expect(exampleFeatures(s)).toEqual(exampleFeatures(s))
    expect(new Set(exampleFeatures(s)).size).toBe(exampleFeatures(s).length)
  })
})

describe('labelExamples — trạng thái từng câu trong tập rà', () => {
  const words = [
    { id: 'ngsl-b', rank: 2, exampleEn: 'I went home.' },
    { id: 'ngsl-a', rank: 2, exampleEn: 'I like tea.' },
    { id: 'ngsl-c', rank: 1, exampleEn: 'I can swim.' },
    { id: 'ngsl-d', rank: 3, exampleEn: 'She is cooking.' },
    { id: 'ngsl-e', rank: 4, exampleEn: 'He was here.' },
    { id: 'ngsl-f', rank: 5 },
  ]
  const entries = labelExamples({
    words,
    reviewIds: ['ngsl-a', 'ngsl-b', 'ngsl-c', 'ngsl-d', 'ngsl-e', 'ngsl-f', 'ngsl-zzz', 'ngsl-a'],
    overrides: {
      'ngsl-b': { exampleEn: 'I go home.', exampleVi: 'Tôi về nhà.' },
      'ngsl-d': { exampleEn: 'She was cooking.', exampleVi: 'x' },
    },
    accepted: { 'ngsl-c': 'can mở sau bài dạy nó' },
  })
  const status = Object.fromEntries(entries.map((e) => [e.id, e.status]))

  it('override sạch → override (câu hiệu lực là override); override còn nhãn → todo', () => {
    expect(status['ngsl-b']).toBe('override')
    expect(entries.find((e) => e.id === 'ngsl-b')).toMatchObject({ exampleEn: 'I go home.', features: [] })
    expect(status['ngsl-d']).toBe('todo')
  })

  it('câu AI sạch → clean; bị gắn nhãn + accepted → accepted; bị gắn nhãn, không accepted → todo', () => {
    expect(status['ngsl-a']).toBe('clean')
    expect(status['ngsl-c']).toBe('accepted')
    expect(status['ngsl-e']).toBe('todo')
  })

  it('bỏ id lạ, từ chưa có câu ví dụ và id trùng; sort theo hạng rồi id', () => {
    expect(entries.map((e) => e.id)).toEqual(['ngsl-c', 'ngsl-a', 'ngsl-b', 'ngsl-d', 'ngsl-e'])
  })
})
