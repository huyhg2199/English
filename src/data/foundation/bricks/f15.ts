import type { Brick, BrickTable } from '../types'

/**
 * F15 · There is/are + giới từ nơi chốn (hàng C). Tự soạn; dạy `there-is-are`, `prepositions-of-place`,
 * `there-negative-questions` (There isn't / aren't, Is there…? / Are there…?, trả lời ngắn) và `quantifiers` (some / any,
 * many / much, a lot of, How many / How much hỏi lượng) — 2 khái niệm sau thêm ở story 43. Phủ mọi dạng của cổng hư từ
 * F15 (there, in, on, under, between, some, any, many) và dạy thêm next to. Câu tiếng Anh chỉ dùng F01–F15: chưa có
 * have, at, trạng từ tần suất, do / does. Lỗi “dịch chữ có thành have” chỉ nói bằng lời tiếng Việt; câu sai trong câu
 * luyện là “Is a book on the table.”. Màn giải thích có 2 bảng tra câu (không IPA): 3 dạng của There is / are và lượng từ.
 * 6 thẻ quy tắc (riêng F15 và F06 có nhiều hơn 2).
 */

const FORMS: BrickTable = {
  id: 'f15-forms',
  title: 'There is / There are: 3 dạng',
  noteVi:
    "Nói nhanh: there's = there is. Câu hỏi đảo is / are lên trước there. Trả lời ngắn lặp lại there + is / are: " +
    "Yes, there is. No, there isn't. Câu Yes không rút gọn: không nói “Yes, there's”.",
  rows: [
    { en: 'There is a cat under the bed.', vi: 'Khẳng định, một vật (hoặc không đếm được)' },
    { en: 'There are two chairs in the kitchen.', vi: 'Khẳng định, nhiều vật' },
    { en: "There isn't a cat in the room.", vi: "Phủ định một vật (hoặc không đếm được): isn't = is not" },
    { en: "There aren't any chairs in the kitchen.", vi: "Phủ định nhiều vật: aren't + any" },
    { en: 'Is there a bank on this street? Yes, there is.', vi: 'Câu hỏi một vật và trả lời ngắn' },
    { en: "Are there any eggs in the kitchen? No, there aren't.", vi: 'Câu hỏi nhiều vật và trả lời ngắn' },
  ],
}

const QUANTIFIERS: BrickTable = {
  id: 'f15-quantifiers',
  title: 'some, any, many, much, a lot of',
  noteVi:
    'some ở câu khẳng định, any thường ở câu phủ định và câu hỏi. some / any đi với danh từ số nhiều hoặc không đếm ' +
    'được; một vật số ít dùng a: Is there a bank? many đi với số nhiều (books), much đi với không đếm được ' +
    '(water, milk, money). Câu khẳng định thường dùng a lot of thay cho much.',
  rows: [
    { en: 'There are some eggs in the kitchen.', vi: 'some: câu khẳng định, “một vài, một ít”' },
    { en: "There isn't any milk in the fridge.", vi: 'any: câu phủ định và câu hỏi, “chút nào, cái nào”' },
    { en: 'There are many books on the desk.', vi: 'many + danh từ đếm được số nhiều' },
    { en: "There isn't much water in the bottle.", vi: 'much + danh từ không đếm được, hay dùng ở phủ định và câu hỏi' },
    {
      en: 'There are a lot of people in the bank.',
      vi: 'a lot of: nhiều, đi được với cả hai loại danh từ, hay dùng ở câu khẳng định',
    },
    { en: 'How many chairs are there in the room?', vi: 'Hỏi số lượng: How many + số nhiều' },
    {
      en: 'How much milk is there in the fridge?',
      vi: 'Hỏi lượng: How much + không đếm được (How much is it? là hỏi giá, viên F14)',
    },
  ],
}

export const F15_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Muốn nói ở đâu “có” cái gì, dùng there is (một vật, hoặc danh từ không đếm được) và there are (nhiều vật); ' +
        "đừng dịch “có” thành have. Phủ định và câu hỏi làm như to be: There isn't, Is there…? Khẳng định dùng some, " +
        'phủ định và câu hỏi dùng any. Vị trí: in (trong), on (trên), under (dưới), next to (cạnh), between (giữa). ' +
        'Hai bảng bên dưới có đủ 3 dạng và ' +
        'many, much, a lot of.',
      tables: [FORMS, QUANTIFIERS],
    },
    {
      kind: 'contrast',
      viSays:
        'Tiếng Việt nói “Trên bàn có một quyển sách.”: nơi chốn đứng đầu, chữ “có” đứng giữa, không cần chủ ngữ.',
      enRequires:
        'Câu khẳng định tiếng Anh bắt buộc mở đầu bằng There is / There are, vật đứng sau, nơi chốn để cuối câu: ' +
        '“There is a book on the table.”. Bỏ There là sai: “Is a book on the table.”. ' +
        'Câu hỏi đảo is / are lên trước there: “Is there a bank on this street?”, trả lời ngắn “Yes, there is.”.',
      examples: [
        { vi: 'Trong bếp có bốn cái ghế.', en: 'There are four chairs in the kitchen.' },
        { vi: 'Trong chai có nước.', en: "There's water in the bottle." },
        { vi: 'Điện thoại ở trên bàn.', en: 'The phone is on the table.' },
        { vi: 'Con mèo ở dưới gầm giường.', en: 'The cat is under the bed.' },
        { vi: 'Ngân hàng ở cạnh trường học.', en: 'The bank is next to the school.' },
        { vi: 'Nhà tôi ở giữa ngân hàng và chợ.', en: 'My house is between the bank and the market.' },
        { vi: 'Trong tủ lạnh không có chút sữa nào.', en: "There isn't any milk in the fridge." },
        {
          vi: 'Trong bếp có cái ghế nào không? — Không.',
          en: "Are there any chairs in the kitchen? — No, there aren't.",
          audioText: "Are there any chairs in the kitchen? No, there aren't.",
        },
      ],
    },
    {
      kind: 'worked',
      en: 'There are two banks on this street.',
      vi: 'Trên con phố này có hai ngân hàng.',
      noteVi:
        'two banks là số nhiều nên dùng There are. Phần “trên con phố này” là on this street, đặt ở cuối câu, ' +
        'ngược với tiếng Việt.',
    },
    {
      kind: 'faded',
      en: 'There ___ a bank next to my house.',
      answer: 'is',
      vi: 'Cạnh nhà tôi có một ngân hàng.',
      hintVi: 'a bank là một vật.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f15-c1',
          kind: 'choice',
          prompt: 'There ___ three books on the desk.',
          options: ['are', 'is', 'am'],
          answer: 0,
          hintVi: 'three books là một vật hay nhiều vật?',
          explanationVi: 'three books là số nhiều nên dùng There are. There is chỉ cho một vật.',
          uses: ['there-is-are', 'plurals'],
        },
        {
          id: 'f15-c2',
          kind: 'choice',
          prompt: 'The shoes are ___ the bed. (ở dưới gầm giường)',
          options: ['under', 'on', 'in'],
          answer: 0,
          hintVi: 'ở dưới = …',
          explanationVi: 'under = ở dưới: under the bed. on là ở trên, in là ở trong.',
          uses: ['prepositions-of-place'],
        },
        {
          id: 'f15-c3',
          kind: 'listen',
          audioText: 'Are there any chairs in the room?',
          prompt: 'Bạn nghe thấy câu nào?',
          options: [
            'Are there any chairs in the room?',
            'There are some chairs in the room.',
            'Are there any chairs in the kitchen?',
          ],
          answer: 0,
          hintVi: 'Nghe hai từ đầu (Are there… là câu hỏi) và chỗ ở cuối câu.',
          explanationVi: 'Câu hỏi đảo are lên trước there và dùng any: Are there any chairs in the room?',
          uses: ['there-negative-questions', 'quantifiers', 'prepositions-of-place', 'plurals', 'articles'],
        },
        {
          id: 'f15-c4',
          kind: 'choice',
          prompt: '“Trên bàn có một quyển sách.” nói thế nào?',
          options: ['There is a book on the table.', 'Is a book on the table.', 'There is book on the table.'],
          answer: 0,
          hintVi: 'Mở đầu bằng There, và book số ít cần a.',
          explanationVi: 'Tiếng Anh không bỏ There: There is a book on the table. book số ít đếm được cần a.',
          uses: ['there-is-are', 'articles'],
        },
        {
          id: 'f15-c5',
          kind: 'type',
          prompt: 'Đổi sang câu phủ định, dùng any: “There are some eggs in the kitchen.”',
          answer: "There aren't any eggs in the kitchen.",
          accept: ['There are not any eggs in the kitchen.'],
          hintVi: "are → aren't, và some đổi thành any.",
          explanationVi:
            "Phủ định thêm not sau are (aren't = are not), và some đổi thành any: There aren't any eggs in the kitchen.",
          uses: ['there-negative-questions', 'quantifiers', 'plurals', 'prepositions-of-place', 'articles'],
        },
      ],
      easier: [
        {
          id: 'f15-e1',
          kind: 'choice',
          prompt: 'Nói ở đâu có nhiều vật thì mở đầu bằng…',
          options: ['There are', 'There is', 'There am'],
          answer: 0,
          hintVi: 'Nhiều vật = số nhiều.',
          explanationVi: 'Nhiều vật dùng There are; một vật dùng There is.',
          uses: ['there-is-are'],
        },
        {
          id: 'f15-e2',
          kind: 'choice',
          prompt: 'Câu phủ định và câu hỏi dùng từ nào?',
          options: ['any', 'some', 'a'],
          answer: 0,
          hintVi: "There aren't ___ chairs. Are there ___ chairs?",
          explanationVi: 'Phủ định và câu hỏi dùng any; câu khẳng định dùng some. chairs số nhiều nên không dùng a.',
          uses: ['quantifiers', 'there-negative-questions', 'plurals', 'articles'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: tả căn phòng của bạn bằng 3 câu: một câu There is / There are, một câu phủ định với any, một câu hỏi ' +
        'How many. Chọn câu đúng, rồi nói theo mẫu, thay bằng đồ thật trong phòng bạn.',
      sampleEn: "There is a bed in my room. There aren't any chairs in my room. How many books are there on the table?",
      item: {
        id: 'f15-a1',
        kind: 'choice',
        prompt: 'Hỏi “Trên bàn có bao nhiêu quyển sách?”',
        options: [
          'How many books are there on the table?',
          'How much books are there on the table?',
          'How many books there are on the table?',
        ],
        answer: 0,
        hintVi: 'books đếm được, số nhiều; câu hỏi đảo are lên trước there.',
        explanationVi:
          'books là danh từ đếm được số nhiều nên dùng How many, và câu hỏi đảo are lên trước there: ' +
          'How many books are there on the table?',
        uses: ['quantifiers', 'there-negative-questions', 'wh-questions', 'plurals', 'prepositions-of-place', 'articles'],
      },
      speak: [
        { id: 'f15-say-1', text: 'There is a bed in my room.', vi: 'Trong phòng tôi có một cái giường.' },
        { id: 'f15-say-2', text: 'There are two books on the table.', vi: 'Trên bàn có hai quyển sách.' },
        { id: 'f15-say-3', text: 'My bag is next to the bed.', vi: 'Túi của tôi ở cạnh giường.' },
        { id: 'f15-say-4', text: "There aren't any chairs in my room.", vi: 'Trong phòng tôi không có cái ghế nào.' },
        { id: 'f15-say-5', text: 'How many books are there on the table?', vi: 'Trên bàn có bao nhiêu quyển sách?' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f15-rule-1',
      brickId: 'F15',
      cloze: 'There ___ two beds in my room. (có)',
      answer: 'are',
      vi: 'Nhiều vật dùng There are, một vật dùng There is. Chữ “có” này không dịch thành have.',
    },
    {
      id: 'f15-rule-2',
      brickId: 'F15',
      cloze: 'The cat is ___ the bed. (ở dưới)',
      answer: 'under',
      vi: 'under = ở dưới, on = ở trên, in = ở trong, next to = ở cạnh, between = ở giữa.',
    },
    {
      id: 'f15-rule-3',
      brickId: 'F15',
      cloze: '___ there a bank on this street? — Yes, there is.',
      answer: 'Is',
      vi: "Câu hỏi đảo is / are lên trước there. Trả lời ngắn: Yes, there is. / No, there isn't.",
    },
    {
      id: 'f15-rule-4',
      brickId: 'F15',
      cloze: "There aren't ___ books in my bag. (cái nào)",
      answer: 'any',
      vi: 'Phủ định và câu hỏi dùng any; câu khẳng định dùng some: There are some chairs.',
    },
    {
      id: 'f15-rule-5',
      brickId: 'F15',
      cloze: 'How ___ books are there on the desk?',
      answer: 'many',
      vi: 'How many + danh từ đếm được số nhiều; How much + danh từ không đếm được: How much water is there?',
    },
    {
      id: 'f15-rule-6',
      brickId: 'F15',
      cloze: "There isn't ___ milk in the glass. (nhiều)",
      answer: 'much',
      vi: 'much + không đếm được (water, milk, money), many + số nhiều (books). Câu khẳng định hay nói a lot of.',
    },
  ],
  themeWordIds: ['ngsl-room', 'ngsl-bed', 'ngsl-kitchen', 'ngsl-bank', 'ngsl-street'],
}
