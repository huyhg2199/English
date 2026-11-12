import type { Brick, BrickTable } from '../types'

/**
 * F16 · have/has + nối câu (hàng C). Tự soạn; dạy `have-has` và `conjunctions` (and / but / or / because / so, thêm ở
 * story 44). Phủ mọi dạng của cổng hư từ F16: have, has (had chỉ nhắc một lần là quá khứ của have, để nhận ra), but, or,
 * because. and và why giữ cổng tường. Có chữ “ngôi thứ ba số ít” để chip thuật ngữ của bài T1 mở viên này. Câu tiếng Anh
 * chỉ dùng F01–F16: chưa có at, every, trạng từ tần suất, going / gone, do / does. Câu đúng nào cũng không có
 * “Because…, so…”; dạng sai này chỉ nằm ở lựa chọn nhiễu hoặc được trích trong lời giải thích. Màn giải thích có 1 bảng
 * tra câu (không IPA): nối 2 câu. 5 thẻ quy tắc.
 */

const LINKERS: BrickTable = {
  id: 'f16-linkers',
  title: 'Nối 2 câu: and, but, or, because, so',
  noteVi:
    'Tiếng Việt nói “Vì… nên…”, tiếng Anh chỉ dùng một từ: because hoặc so, không dùng cả hai. ' +
    'Trước but và so thường có dấu phẩy.',
  rows: [
    { en: 'I have a sister and a brother.', vi: 'and: và, nối hai từ' },
    { en: 'My house is big, and it is nice.', vi: 'and: và, nối hai câu cùng chiều' },
    { en: 'My house is small, but it is nice.', vi: 'but: nhưng, hai ý trái nhau hoặc khác nhau' },
    { en: 'Is it a cat or a dog?', vi: 'or: hoặc, hay, chọn một trong hai' },
    { en: 'I am happy because I have a new job.', vi: 'because: vì, sau because là lý do' },
    { en: 'I have a new job, so I am happy.', vi: 'so: nên, sau so là kết quả' },
    {
      en: 'Because I have a new job, I am happy.',
      vi: 'Because đứng đầu câu: dấu phẩy rồi câu kết quả, không thêm so',
    },
  ],
}

export const F16_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'have nghĩa là “có” (sở hữu): I have a sister. Ngôi thứ ba số ít (he, she, it, một người, một vật) dùng has: ' +
        'She has a cat. Khác There is: have nói ai có gì, There is nói ở đâu có gì. Nói tuổi dùng to be: I am 25. ' +
        'Nối hai câu: and (và), but (nhưng), or (hoặc), because (vì, trước lý do), so (nên, trước kết quả). ' +
        'Bảng bên dưới có câu mẫu.',
      tables: [LINKERS],
    },
    {
      kind: 'contrast',
      viSays:
        'Tiếng Việt dùng một chữ “có” cho mọi người: “Tôi có”, “Cô ấy có”. Nói tuổi: “Tôi 25 tuổi”. ' +
        'Nối câu: “Vì có việc mới nên tôi vui” dùng cả “vì” lẫn “nên”.',
      enRequires:
        'Tiếng Anh đổi have thành has khi chủ ngữ là he, she, it: “She has a cat.”. ' +
        'Tuổi dùng to be: “I am 25.”, không nói “I have 25 years.”. ' +
        'Nối câu chỉ dùng một từ: “Because I have a new job, I am happy.” hoặc “I have a new job, so I am happy.”, ' +
        'không nói “Because I have a new job, so I am happy.”.',
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
        { vi: 'Nhà tôi nhỏ nhưng đẹp.', en: 'My house is small, but it is nice.' },
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
          audioText: 'I have a cat, but my sister has a dog.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: [
            'I have a cat, but my sister has a dog.',
            'I have a cat, and my sister has a dog.',
            'I have a cat, but my sister have a dog.',
          ],
          answer: 0,
          hintVi: 'Nghe từ nối ở giữa (and hay but) và động từ sau my sister.',
          explanationVi:
            'Câu nghe dùng but (nhưng) vì hai ý khác nhau: tôi có mèo, còn chị tôi có chó. my sister = she nên dùng has.',
          uses: ['conjunctions', 'have-has', 'possessive-adjectives', 'articles'],
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
          kind: 'type',
          prompt: 'Nối 2 câu bằng because: “I am happy.” “I have a new phone.”',
          answer: 'I am happy because I have a new phone.',
          accept: ['Because I have a new phone, I am happy.'],
          hintVi: 'because đứng trước lý do (tôi có điện thoại mới).',
          explanationVi:
            'because đứng trước lý do: I am happy because I have a new phone. Đảo lại (I have a new phone because ' +
            'I am happy) là sai nghĩa: có điện thoại vì vui. Chỉ dùng một từ nối: “Because I have a new phone, so I am ' +
            'happy.” là sai, bỏ so đi.',
          uses: ['conjunctions', 'have-has', 'be-affirmative', 'adjective-before-noun', 'articles'],
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
          prompt: 'because nghĩa là gì?',
          options: ['vì, bởi vì', 'nên, vì vậy', 'nhưng'],
          answer: 0,
          hintVi: 'because đứng trước lý do.',
          explanationVi: 'because = vì (trước lý do); so = nên (trước kết quả); but = nhưng.',
          uses: ['conjunctions'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: nói về bạn và người thân bằng 3 câu: một câu have / has, một câu nối bằng but, một câu nối bằng ' +
        'because hoặc so. Chọn câu đúng, rồi nói theo mẫu với người nhà của bạn.',
      sampleEn: 'I have a sister. She has a cat, but I have a dog. I am happy because I have a new job.',
      item: {
        id: 'f16-a1',
        kind: 'choice',
        prompt: 'Bạn muốn nói “Vì có việc mới nên tôi rất vui.”:',
        options: [
          'I have a new job, so I am very happy.',
          'Because I have a new job, so I am very happy.',
          'I have a new job, because I am very happy.',
        ],
        answer: 0,
        hintVi: 'Tiếng Anh chỉ dùng một từ nối: because hoặc so.',
        explanationVi:
          'so đứng trước kết quả: I have a new job, so I am very happy. Không dùng cả because và so trong một câu ' +
          '(chỉ dùng một từ nối). Câu thứ ba sai nghĩa: có việc mới vì vui.',
        uses: ['conjunctions', 'have-has', 'be-affirmative', 'adjective-before-noun', 'articles'],
      },
      speak: [
        { id: 'f16-say-1', text: 'I have a sister.', vi: 'Tôi có một chị gái.' },
        { id: 'f16-say-2', text: 'She has a cat.', vi: 'Chị ấy có một con mèo.' },
        { id: 'f16-say-3', text: 'I am 25.', vi: 'Tôi 25 tuổi.' },
        { id: 'f16-say-4', text: 'She has a cat, but I have a dog.', vi: 'Chị ấy có một con mèo, nhưng tôi có một con chó.' },
        { id: 'f16-say-5', text: 'I am happy because I have a new job.', vi: 'Tôi vui vì tôi có việc mới.' },
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
    {
      id: 'f16-rule-3',
      brickId: 'F16',
      cloze: 'My son has a new game, ___ he is happy. (nên)',
      answer: 'so',
      vi: 'so đứng trước kết quả: A, so B (A nên B). because đứng trước lý do: B because A.',
    },
    {
      id: 'f16-rule-4',
      brickId: 'F16',
      cloze: 'She is sad ___ her cat is sick. (vì)',
      answer: 'because',
      vi: 'because đứng trước lý do. Chỉ dùng một từ nối, không nói “Because…, so…”.',
    },
    {
      id: 'f16-rule-5',
      brickId: 'F16',
      cloze: 'My car is old, ___ it is fast. (nhưng)',
      answer: 'but',
      vi: 'but nối hai ý trái nhau hoặc khác nhau, and nối hai ý cùng chiều, or (hoặc) để chọn một: Is it a cat or a dog?',
    },
  ],
  themeWordIds: ['ngsl-big', 'ngsl-small', 'ngsl-new', 'ngsl-team', 'ngsl-game'],
}
