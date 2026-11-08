import type { Brick } from '../types'

/**
 * F11 · a/an/the + đếm được (hàng B). Tự soạn; dạy `articles`, `countable-uncountable`. Lỗi bỏ mạo từ dạy qua
 * "I need a pen" / "I need pen" (hàng B chưa dạy to be). Phủ dạng `a`, `an`, `the` của cổng hư từ F11.
 */
export const F11_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Danh từ đếm được số ít cần a hoặc an (hoặc the, my): I need a pen. Chọn theo âm đầu, không theo chữ đầu: ' +
        'an egg, an hour (h câm), a university (âm đầu “iu”). Dùng the khi cả hai người đều biết vật nào: Open the door. ' +
        'Nói chung chung về số nhiều thì không cần mạo từ: I like dogs. ' +
        'Danh từ không đếm được (water, money, information, advice) không thêm -s, không đi với a.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “Tôi cần bút.”, “Cho tôi lời khuyên.”: không cần chữ “một” trước danh từ.',
      enRequires:
        'Tiếng Anh bắt buộc có a/an trước danh từ đếm được số ít: “I need a pen.”, không nói “I need pen.”. ' +
        'Còn water, advice không đếm được: không nói “a water”, “advices”.',
      examples: [
        { vi: 'một quả trứng (âm đầu /e/ là nguyên âm)', en: 'an egg' },
        { vi: 'một tiếng đồng hồ (h câm, âm đầu /aʊ/ gần như “ao”)', en: 'an hour' },
        { vi: 'một trường đại học (âm đầu /j/ đọc như “iu”, là phụ âm)', en: 'a university' },
        { vi: 'một ý tưởng (âm đầu là nguyên âm)', en: 'an idea' },
        { vi: 'Tôi uống nước. (không đếm được: không a, không -s)', en: 'I drink water.' },
      ],
    },
    {
      kind: 'worked',
      en: 'I eat an egg and drink water.',
      vi: 'Tôi ăn một quả trứng và uống nước.',
      noteVi:
        'egg bắt đầu bằng âm /e/ (nguyên âm) nên dùng an. water không đếm được nên không có a, không thêm -s.',
    },
    {
      kind: 'faded',
      en: 'I need ___ pen.',
      answer: 'a',
      vi: 'Tôi cần một cây bút.',
      hintVi: 'pen đếm được, số ít, âm đầu /p/ là phụ âm.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f11-c1',
          kind: 'choice',
          prompt: '“một trường đại học” nói thế nào?',
          options: ['a university', 'an university', 'university'],
          answer: 0,
          hintVi: 'university đọc /ˌjuːnəˈvɝːsət̬i/: âm đầu /j/ đọc như “iu”, không phải nguyên âm.',
          explanationVi: 'Xét âm đầu chứ không xét chữ đầu: university bắt đầu bằng âm /j/ (phụ âm) nên dùng a.',
          uses: ['articles', 'ipa'],
        },
        {
          id: 'f11-c2',
          kind: 'choice',
          prompt: 'Nói chung chung “Tôi thích chó” (mọi con chó) thế nào?',
          options: ['I like dogs.', 'I like the dogs.', 'I like a dogs.'],
          answer: 0,
          hintVi: 'Nói chung chung về số nhiều thì có cần mạo từ không?',
          explanationVi:
            'Nói chung chung về số nhiều thì không dùng mạo từ: I like dogs. “I like the dogs” là thích mấy con chó cụ thể mà cả hai đều biết. a không đi với số nhiều.',
          uses: ['articles', 'plurals'],
        },
        {
          id: 'f11-c3',
          kind: 'choice',
          prompt: 'Câu nào đúng cho “Tôi uống nước mỗi ngày”?',
          options: ['I drink water every day.', 'I drink a water every day.', 'I drink waters every day.'],
          answer: 0,
          hintVi: 'water có đếm được không?',
          explanationVi: 'water không đếm được: không a, không -s. I drink water every day.',
          uses: ['countable-uncountable'],
        },
        {
          id: 'f11-c4',
          kind: 'listen',
          audioText: 'I eat an egg.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['I eat an egg.', 'I eat a egg.', 'I eat egg.'],
          answer: 0,
          hintVi: 'Nghe kỹ âm /n/ nối vào egg.',
          explanationVi: 'an egg đọc nối thành “a-negg”: âm /n/ của an dính vào egg. egg bắt đầu bằng nguyên âm nên dùng an.',
          uses: ['articles'],
        },
        {
          id: 'f11-c5',
          kind: 'choice',
          prompt: 'Phòng bạn chỉ có một cái cửa. Bạn nhờ bạn cùng phòng mở nó:',
          options: ['Open the door, please.', 'Open a door, please.', 'Open door, please.'],
          answer: 0,
          hintVi: 'Cả hai người đều biết cửa nào.',
          explanationVi: 'Cả hai đều biết đó là cửa nào, nên dùng the: Open the door, please.',
          uses: ['articles', 'imperatives'],
        },
      ],
      easier: [
        {
          id: 'f11-e1',
          kind: 'choice',
          prompt: '“một tiếng đồng hồ” nói thế nào?',
          options: ['an hour', 'a hour', 'hour'],
          answer: 0,
          hintVi: 'Chữ h trong hour không đọc.',
          explanationVi: 'h câm, nên hour bắt đầu bằng nguyên âm /aʊ/ (gần như “ao”): an hour.',
          uses: ['articles'],
        },
        {
          id: 'f11-e2',
          kind: 'choice',
          prompt: 'Từ nào không đếm được (không đi với a, không thêm -s)?',
          options: ['advice', 'pen', 'egg'],
          answer: 0,
          hintVi: 'Lời khuyên không đếm từng cái được.',
          explanationVi: 'advice (lời khuyên) không đếm được, giống water, money, information. pen, egg đếm được.',
          uses: ['countable-uncountable'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: kể bữa sáng của bạn bằng a/an và danh từ không đếm được. Chọn câu đúng, nói theo mẫu, ' +
        'rồi thay bằng món bạn ăn sáng nay.',
      sampleEn: 'I eat an egg and drink water.',
      item: {
        id: 'f11-a1',
        kind: 'choice',
        prompt: 'Câu nào đúng?',
        options: ['I eat an egg and drink water.', 'I eat a egg and drink a water.', 'I eat egg and drink waters.'],
        answer: 0,
        hintVi: 'egg đếm được, bắt đầu bằng nguyên âm. water không đếm được.',
        explanationVi: 'an egg (đếm được, âm đầu nguyên âm); water không đếm được nên không a, không -s.',
        uses: ['articles', 'countable-uncountable'],
      },
      speak: [
        { id: 'f11-say-1', text: 'I eat an egg and drink water.', vi: 'Tôi ăn một quả trứng và uống nước.' },
        { id: 'f11-say-2', text: 'I eat an orange.', vi: 'Tôi ăn một quả cam.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f11-rule-1',
      brickId: 'F11',
      cloze: 'I eat ___ egg. (một)',
      answer: 'an',
      vi: 'Âm đầu là nguyên âm thì dùng an: an egg, an idea, an hour. Còn lại dùng a: a pen, a university.',
    },
    {
      id: 'f11-rule-2',
      brickId: 'F11',
      cloze: 'I drink ___ every day. (nước: water, a water hay waters?)',
      answer: 'water',
      vi: 'water không đếm được: không a, không -s. Giống money, information, advice.',
    },
  ],
  themeWordIds: ['ngsl-water', 'ngsl-advice', 'ngsl-egg', 'ngsl-idea', 'ngsl-orange'],
}
