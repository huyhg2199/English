import type { Brick } from '../types'

/**
 * F08 · S + V (+ O) (hàng B). Tự soạn; dạy `subject-verb`, `adjective-before-noun`, `imperatives`. Lỗi bỏ chủ ngữ dạy qua
 * "I like it" / "Like it" và "It rains every day" (thói quen; hàng B chưa dạy to be, -ing).
 */
export const F08_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Câu tiếng Anh cần chủ ngữ (S) và động từ (V), thường thêm tân ngữ (O): I like it. ' +
        'Tiếng Việt hay bỏ chủ ngữ (“Thích lắm”, “Ngày nào cũng mưa”), tiếng Anh thì không: I like it, It rains every day. ' +
        'Tính từ đứng trước danh từ: a red car. Ngoại lệ: câu mệnh lệnh bắt đầu bằng động từ (Open the door), ' +
        "rủ nhau dùng Let's + động từ (Let's go), muốn lịch sự thì thêm please.",
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “Thích lắm.”, “Ngày nào cũng mưa.”, “xe đỏ”: không cần chủ ngữ, tính từ đứng sau danh từ.',
      enRequires:
        'Tiếng Anh bắt buộc có chủ ngữ, kể cả khi chủ ngữ chỉ là it: “I like it.”, “It rains every day.”. ' +
        'Tính từ đứng trước danh từ: “a red car”, không nói “a car red”.',
      examples: [
        { vi: 'Thích (nó).', en: 'I like it.' },
        { vi: 'Ngày nào cũng mưa.', en: 'It rains every day.' },
        { vi: 'xe đỏ', en: 'a red car' },
      ],
    },
    {
      kind: 'worked',
      en: 'Open the door, please.',
      vi: 'Làm ơn mở cửa.',
      noteVi:
        'Câu mệnh lệnh là ngoại lệ: không có chủ ngữ, bắt đầu bằng động từ open. Thêm please ở đầu hoặc cuối câu cho lịch sự.',
    },
    {
      kind: 'faded',
      en: "Let's ___ to school.",
      answer: 'go',
      vi: 'Mình đi học thôi.',
      hintVi: "Sau Let's là động từ dạng gốc, không thêm gì.",
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f08-c1',
          kind: 'order',
          prompt: 'Xếp thành câu “Chúng tôi muốn một chiếc xe đỏ”.',
          tokens: ['We', 'want', 'a', 'red', 'car'],
          hintVi: 'Chủ ngữ (We) – động từ (want) – tân ngữ (a red car). Tính từ red đứng trước car.',
          explanationVi: 'S-V-O: We (S) – want (V) – a red car (O). Tính từ red đứng trước danh từ car.',
          uses: ['subject-verb', 'adjective-before-noun'],
        },
        {
          id: 'f08-c2',
          kind: 'choice',
          prompt: 'Câu nào đúng cho “Thích lắm!” (nói về một món quà)?',
          options: ['I really like it.', 'Really like it.', 'I really like.'],
          answer: 0,
          hintVi: 'Câu cần ai thích (chủ ngữ) và thích cái gì (tân ngữ).',
          explanationVi:
            'Tiếng Anh cần chủ ngữ I và tân ngữ it: I really like it. “Really like it” thiếu chủ ngữ; “I really like” thiếu tân ngữ.',
          uses: ['subject-verb'],
        },
        {
          id: 'f08-c3',
          kind: 'listen',
          audioText: 'I like red cars.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['I like red cars.', 'Like red cars.', 'I like cars red.'],
          answer: 0,
          hintVi: 'Nghe từ đầu câu, và nghe red đứng trước hay sau cars.',
          explanationVi: 'Câu có chủ ngữ I, và tính từ red đứng trước danh từ cars: I like red cars.',
          uses: ['subject-verb', 'adjective-before-noun'],
        },
        {
          id: 'f08-c4',
          kind: 'choice',
          prompt: 'Rủ bạn “Mình ăn thôi!” nói thế nào?',
          options: ["Let's eat.", "Let's to eat.", "Let's eating."],
          answer: 0,
          hintVi: "Sau Let's là động từ dạng gốc.",
          explanationVi: "Let's + động từ dạng gốc: Let's eat. Không thêm to, không thêm -ing.",
          uses: ['imperatives'],
        },
        {
          id: 'f08-c5',
          kind: 'choice',
          prompt: 'Câu nào nhờ mở cửa sổ một cách lịch sự?',
          options: ['Please open the window.', 'Window open, please.', 'You open window.'],
          answer: 0,
          hintVi: 'Câu mệnh lệnh bắt đầu bằng động từ; please làm câu lịch sự.',
          explanationVi: 'Câu mệnh lệnh không cần chủ ngữ, bắt đầu bằng động từ open. Thêm please: Please open the window.',
          uses: ['imperatives'],
        },
      ],
      easier: [
        {
          id: 'f08-e1',
          kind: 'choice',
          prompt: 'Chọn cách nói đúng cho “xe đỏ”.',
          options: ['a red car', 'a car red', 'red a car'],
          answer: 0,
          hintVi: 'Tính từ đứng trước danh từ.',
          explanationVi: 'Tính từ red đứng trước danh từ car: a red car (tiếng Việt nói ngược: xe đỏ).',
          uses: ['adjective-before-noun'],
        },
        {
          id: 'f08-e2',
          kind: 'choice',
          prompt: 'Câu nào có đủ chủ ngữ và động từ?',
          options: ['I need water.', 'Need water.', 'Water need.'],
          answer: 0,
          hintVi: 'Tìm câu có người làm (I) đứng đầu.',
          explanationVi: 'I (chủ ngữ) – need (động từ) – water (tân ngữ). Câu tiếng Anh không bỏ chủ ngữ.',
          uses: ['subject-verb'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: sắp từ thành một câu S-V-O, rồi nói một câu mệnh lệnh lịch sự và một câu rủ rê. ' +
        'Sau đó tự nói một câu nhờ người khác làm việc gì đó, nhớ thêm please.',
      sampleEn: "Open the door, please. Let's go.",
      item: {
        id: 'f08-a1',
        kind: 'order',
        prompt: 'Xếp thành câu “Họ muốn một ngôi nhà to”.',
        tokens: ['They', 'want', 'a', 'big', 'house'],
        hintVi: 'Chủ ngữ – động từ – tân ngữ; tính từ big đứng trước house.',
        explanationVi: 'They (S) – want (V) – a big house (O). Tính từ big đứng trước danh từ house.',
        uses: ['subject-verb', 'adjective-before-noun'],
      },
      speak: [
        { id: 'f08-say-1', text: 'Open the door, please.', vi: 'Làm ơn mở cửa.' },
        { id: 'f08-say-2', text: "Let's go.", vi: 'Đi thôi.' },
        { id: 'f08-say-3', text: 'I need help.', vi: 'Tôi cần giúp đỡ.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f08-rule-1',
      brickId: 'F08',
      cloze: '___ like it. (Tôi)',
      answer: 'I',
      vi: 'Câu thường (trừ câu mệnh lệnh) luôn có chủ ngữ: I like it, không nói “Like it”. Nói chuyện mưa cũng cần it: It rains every day.',
    },
    {
      id: 'f08-rule-2',
      brickId: 'F08',
      cloze: '___ the door, please. (mở)',
      answer: 'Open',
      vi: 'Câu mệnh lệnh bắt đầu bằng động từ, không có chủ ngữ: Open the door, please.',
    },
  ],
  themeWordIds: ['ngsl-like', 'ngsl-want', 'ngsl-need', 'ngsl-help', 'ngsl-open'],
}
