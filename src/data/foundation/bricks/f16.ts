import type { Brick } from '../types'

/**
 * F16 · have/has (hàng C). Tự soạn; dạy `have-has`. Phủ mọi dạng của cổng hư từ F16 (have, has; had chỉ nhắc một lần
 * là quá khứ của have, để nhận ra). Có chữ “ngôi thứ ba số ít” để chip thuật ngữ của bài T1 mở viên này. Câu tiếng Anh
 * chỉ dùng F01–F16: chưa có at, every, trạng từ tần suất, going / gone.
 */
export const F16_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'have nghĩa là “có” theo kiểu sở hữu: I have a sister. Với ngôi thứ ba số ít (he, she, it, hay một người, ' +
        'một vật), have đổi thành has: She has a cat. I, you, we, they giữ have. Khác There is: have nói ai có gì, ' +
        'There is nói ở đâu có gì. Nói tuổi dùng am / is / are (I am 25), không dùng have.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt dùng một chữ “có” cho mọi người: “Tôi có”, “Cô ấy có”. Nói tuổi: “Tôi 25 tuổi”.',
      enRequires:
        'Tiếng Anh đổi have thành has khi chủ ngữ là he, she, it: “She has a cat.”. ' +
        'Tuổi dùng to be: “I am 25.”, không nói “I have 25 years.”.',
      examples: [
        { vi: 'Tôi có một chị gái.', en: 'I have a sister.' },
        { vi: 'Anh ấy có một chiếc xe mới.', en: 'He has a new car.' },
        { vi: 'Chúng tôi có một đội nhỏ.', en: 'We have a small team.' },
        { vi: 'Tôi 25 tuổi.', en: 'I am 25.' },
        {
          vi: 'Quá khứ của have: học ở Năm 1, giờ chỉ cần nhận ra.',
          en: 'have → had',
          audioText: 'have, had',
        },
      ],
    },
    {
      kind: 'worked',
      en: 'My brother has a big house.',
      vi: 'Anh trai tôi có một ngôi nhà lớn.',
      noteVi:
        'My brother là một người (ngôi thứ ba số ít, như he) nên dùng has. Tính từ big đứng trước danh từ house.',
    },
    {
      kind: 'faded',
      en: 'They ___ a new game.',
      answer: 'have',
      vi: 'Họ có một trò chơi mới.',
      hintVi: 'they là số nhiều nên giữ have.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f16-c1',
          kind: 'choice',
          prompt: 'She ___ a small dog.',
          options: ['has', 'have', 'is'],
          answer: 0,
          hintVi: 'she là ngôi thứ ba số ít.',
          explanationVi: 'he / she / it đi với has: She has a small dog.',
          uses: ['have-has', 'subject-pronouns'],
        },
        {
          id: 'f16-c2',
          kind: 'choice',
          prompt: '“Tôi 28 tuổi.” nói thế nào?',
          options: ['I am 28.', 'I have 28.', 'I have 28 years.'],
          answer: 0,
          hintVi: 'Tuổi dùng to be.',
          explanationVi: 'Nói tuổi dùng am / is / are, không dùng have: I am 28.',
          uses: ['have-has', 'be-affirmative', 'numbers'],
        },
        {
          id: 'f16-c3',
          kind: 'listen',
          audioText: 'We have a big team.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['We have a big team.', 'We has a big team.', 'We are a big team.'],
          answer: 0,
          hintVi: 'Nghe động từ sau We: âm cuối /v/ hay /z/?',
          explanationVi: 'we đi với have: We have a big team. has chỉ dùng cho ngôi thứ ba số ít.',
          uses: ['have-has', 'final-sounds'],
        },
        {
          id: 'f16-c4',
          kind: 'choice',
          prompt: '“Trong phòng có một cái giường.” nói thế nào?',
          options: ['There is a bed in the room.', 'Have a bed in the room.', 'Has a bed in the room.'],
          answer: 0,
          hintVi: 'Nói ở đâu có gì, không có người sở hữu.',
          explanationVi: 'Nói ở đâu có gì dùng There is. have / has cần chủ ngữ là người hay vật sở hữu.',
          uses: ['have-has', 'there-is-are'],
        },
        {
          id: 'f16-c5',
          kind: 'choice',
          prompt: 'My father ___ two cars.',
          options: ['has', 'have', 'are'],
          answer: 0,
          hintVi: 'My father = he.',
          explanationVi: 'My father là một người (như he), ngôi thứ ba số ít nên dùng has: My father has two cars.',
          uses: ['have-has', 'possessive-adjectives'],
        },
      ],
      easier: [
        {
          id: 'f16-e1',
          kind: 'choice',
          prompt: 'he, she, it đi với…',
          options: ['has', 'have', 'am'],
          answer: 0,
          hintVi: 'Ngôi thứ ba số ít.',
          explanationVi: 'he / she / it dùng has; I / you / we / they dùng have.',
          uses: ['have-has'],
        },
        {
          id: 'f16-e2',
          kind: 'choice',
          prompt: 'I ___ a phone.',
          options: ['have', 'has', 'am'],
          answer: 0,
          hintVi: 'I giữ have.',
          explanationVi: 'I have a phone. has chỉ đi với he / she / it.',
          uses: ['have-has'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: nói bạn và người thân có gì, rồi nói tuổi cho đúng. Chọn câu đúng, rồi nói theo mẫu với người nhà ' +
        'và tuổi của bạn.',
      sampleEn: 'I have a sister. She has a cat. I am 25.',
      item: {
        id: 'f16-a1',
        kind: 'choice',
        prompt: 'Bạn muốn nói “Mẹ tôi có một con chó.”:',
        options: ['My mother has a dog.', 'My mother have a dog.', 'My mother has dog.'],
        answer: 0,
        hintVi: 'My mother = she; dog số ít cần a.',
        explanationVi: 'My mother là ngôi thứ ba số ít nên dùng has, và cần a trước dog: My mother has a dog.',
        uses: ['have-has', 'articles'],
      },
      speak: [
        { id: 'f16-say-1', text: 'I have a sister.', vi: 'Tôi có một chị gái.' },
        { id: 'f16-say-2', text: 'She has a cat.', vi: 'Chị ấy có một con mèo.' },
        { id: 'f16-say-3', text: 'I am 25.', vi: 'Tôi 25 tuổi.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f16-rule-1',
      brickId: 'F16',
      cloze: 'He ___ a big car. (có)',
      answer: 'has',
      vi: 'Ngôi thứ ba số ít (he, she, it) dùng has: He has a big car.',
    },
    {
      id: 'f16-rule-2',
      brickId: 'F16',
      cloze: 'I ___ 25. (tuổi)',
      answer: 'am',
      vi: 'Nói tuổi dùng to be: I am 25, không nói “I have 25 years”.',
    },
  ],
  themeWordIds: ['ngsl-big', 'ngsl-small', 'ngsl-new', 'ngsl-team', 'ngsl-game'],
}
