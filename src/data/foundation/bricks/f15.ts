import type { Brick } from '../types'

/**
 * F15 · There is/are + giới từ nơi chốn (hàng C). Tự soạn; dạy `there-is-are`, `prepositions-of-place`. Phủ mọi dạng
 * của cổng hư từ F15 (there, in, on, under, between) và dạy thêm next to. Câu tiếng Anh chỉ dùng F01–F15: chưa có have,
 * at, trạng từ tần suất. Lỗi “dịch chữ có thành have” chỉ nói bằng lời tiếng Việt; câu sai trong câu luyện là
 * “Is a book on the table.”.
 */
export const F15_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Muốn nói ở một chỗ nào đó “có” cái gì, tiếng Anh dùng there is (một vật, hoặc danh từ không đếm được) và ' +
        "there are (nhiều vật). Nói nhanh: there's. Đừng dịch chữ “có” này thành have hay has. Chỉ vị trí: in (trong), " +
        'on (trên, chạm mặt), under (dưới), next to (cạnh), between (giữa hai vật). Thứ tự: There is + vật + vị trí.',
    },
    {
      kind: 'contrast',
      viSays:
        'Tiếng Việt nói “Trên bàn có một quyển sách.”: nơi chốn đứng đầu, chữ “có” đứng giữa, không cần chủ ngữ.',
      enRequires:
        'Tiếng Anh bắt buộc mở đầu bằng There is / There are, vật đứng sau, nơi chốn để cuối câu: ' +
        '“There is a book on the table.”. Bỏ There là sai: “Is a book on the table.”.',
      examples: [
        { vi: 'Trong bếp có bốn cái ghế.', en: 'There are four chairs in the kitchen.' },
        { vi: 'Trong chai có nước.', en: "There's water in the bottle." },
        { vi: 'Điện thoại ở trên bàn.', en: 'The phone is on the table.' },
        { vi: 'Con mèo ở dưới gầm giường.', en: 'The cat is under the bed.' },
        { vi: 'Ngân hàng ở cạnh trường học.', en: 'The bank is next to the school.' },
        { vi: 'Nhà tôi ở giữa ngân hàng và chợ.', en: 'My house is between the bank and the market.' },
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
          audioText: 'There is a phone on the table.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['There is a phone on the table.', 'There is a phone under the table.', 'There are phones on the table.'],
          answer: 0,
          hintVi: 'Nghe giới từ đứng trước the table, và a phone hay phones.',
          explanationVi: 'a phone (một cái) nên There is; on = ở trên mặt bàn.',
          uses: ['there-is-are', 'prepositions-of-place'],
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
          kind: 'choice',
          prompt: 'The bank is ___ the school and the market. (ở giữa)',
          options: ['between', 'next to', 'under'],
          answer: 0,
          hintVi: 'Ở giữa hai chỗ.',
          explanationVi: 'between = ở giữa hai vật hay hai chỗ: between the school and the market. next to là ở cạnh.',
          uses: ['prepositions-of-place'],
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
          prompt: 'on nghĩa là gì?',
          options: ['ở trên (chạm mặt)', 'ở dưới', 'ở trong'],
          answer: 0,
          hintVi: 'on the table: điện thoại nằm trên mặt bàn.',
          explanationVi: 'on = ở trên, chạm mặt. under = ở dưới, in = ở trong.',
          uses: ['prepositions-of-place'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: tả căn phòng của bạn bằng 2–3 câu với There is / There are và một giới từ chỉ vị trí. ' +
        'Chọn câu đúng, rồi nói theo mẫu, thay bằng đồ thật trong phòng bạn.',
      sampleEn: 'There is a bed in my room. There are two books on the table. My bag is next to the bed.',
      item: {
        id: 'f15-a1',
        kind: 'choice',
        prompt: 'Trên bàn có hai quyển sách:',
        options: ['There are two books on the table.', 'There is two books on the table.', 'Two books is on the table.'],
        answer: 0,
        hintVi: 'two books là số nhiều.',
        explanationVi: 'Số nhiều dùng There are: There are two books on the table.',
        uses: ['there-is-are', 'plurals'],
      },
      speak: [
        { id: 'f15-say-1', text: 'There is a bed in my room.', vi: 'Trong phòng tôi có một cái giường.' },
        { id: 'f15-say-2', text: 'There are two books on the table.', vi: 'Trên bàn có hai quyển sách.' },
        { id: 'f15-say-3', text: 'My bag is next to the bed.', vi: 'Túi của tôi ở cạnh giường.' },
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
  ],
  themeWordIds: ['ngsl-room', 'ngsl-bed', 'ngsl-kitchen', 'ngsl-bank', 'ngsl-street'],
}
