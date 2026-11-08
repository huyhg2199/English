import type { Brick } from '../types'

/**
 * F01 · Anh khác Việt ở 4 chỗ (hàng A). Nội dung tự soạn, chỉ dùng khái niệm `en-vs-vi`, `svo-order`.
 * Meta (id, hàng, tên, phút, teaches/uses) ghép từ danh mục trong `../content.ts`.
 */
export const F01_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Tiếng Anh giống tiếng Việt ở thứ tự câu: chủ ngữ, rồi động từ, rồi tân ngữ (S-V-O). Nhưng có 4 chỗ khác. ' +
        'Một: động từ đổi dạng theo thời gian (go thành went). Hai: đuôi từ mang ngữ pháp (book thành books). ' +
        'Ba: danh từ thường cần mạo từ a, an, the. Bốn: âm cuối đổi nghĩa (rice khác rise). ' +
        'Người Việt hay quên chính 4 chỗ này.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “Hôm qua tôi đi.” Chữ “đi” giữ nguyên, vì “hôm qua” đã cho biết là chuyện đã qua.',
      enRequires:
        'Tiếng Anh bắt buộc đổi động từ: “Yesterday I went.” Có “yesterday” rồi vẫn phải đổi go thành went.',
      examples: [
        { vi: 'Hôm qua tôi đi.', en: 'Yesterday I went.' },
        { vi: 'Hai quyển sách.', en: 'Two books.' },
      ],
      timeline: { kind: 'past-point', label: 'Yesterday I went: việc đã xảy ra, nằm ở quá khứ' },
    },
    {
      kind: 'worked',
      en: 'Yesterday I ate rice.',
      vi: 'Hôm qua tôi ăn cơm.',
      noteVi: 'Thứ tự I (tôi) – ate (ăn) – rice (cơm) giống tiếng Việt. Chỗ khác: eat đổi thành ate vì là hôm qua.',
      timeline: { kind: 'past-point', label: 'Yesterday I ate rice: một việc ở quá khứ' },
    },
    {
      kind: 'faded',
      en: 'Yesterday I ___ to school.',
      answer: 'went',
      vi: 'Hôm qua tôi đi học.',
      hintVi: 'Hôm qua là chuyện đã qua: go phải đổi dạng (giống ví dụ ở màn 2).',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f01-c1',
          kind: 'choice',
          prompt: 'Câu nào đúng thứ tự tiếng Anh cho “Tôi ăn cơm”?',
          options: ['I eat rice.', 'I rice eat.', 'Eat I rice.'],
          answer: 0,
          hintVi: 'Thứ tự giống tiếng Việt: tôi – ăn – cơm.',
          explanationVi: 'Tiếng Anh cũng đi theo S-V-O như tiếng Việt: I (tôi) – eat (ăn) – rice (cơm).',
          uses: ['svo-order'],
        },
        {
          id: 'f01-c2',
          kind: 'listen',
          audioText: 'Yesterday I went.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['Yesterday I go.', 'Yesterday I went.', 'Yesterday I goes.'],
          answer: 1,
          hintVi: 'Câu nói về hôm qua, nên động từ đã đổi dạng.',
          explanationVi: 'Có “yesterday” thì go phải đổi thành went: “Yesterday I went.”',
          uses: ['en-vs-vi'],
        },
        {
          id: 'f01-c3',
          kind: 'order',
          prompt: 'Xếp thành câu “Tôi đọc một quyển sách”.',
          tokens: ['I', 'read', 'a', 'book'],
          hintVi: 'Bắt đầu bằng người làm (tôi), rồi tới việc làm (đọc). Mạo từ a đứng ngay trước book.',
          explanationVi:
            'S-V-O: I (chủ ngữ) – read (động từ) – a book (tân ngữ), cùng thứ tự với tiếng Việt. Tiếng Anh cần thêm a trước book.',
          uses: ['svo-order'],
        },
        {
          id: 'f01-c4',
          kind: 'sort',
          prompt: 'Xếp mỗi từ vào đúng nhóm.',
          groups: [
            { label: 'Dạng gốc', items: ['go', 'eat'] },
            { label: 'Hôm qua (đã đổi dạng)', items: ['went', 'ate'] },
          ],
          hintVi: 'Từ nào là dạng đã đổi của go và eat?',
          explanationVi: 'go → went, eat → ate. Nói về hôm qua thì dùng went, ate.',
          uses: ['en-vs-vi'],
        },
      ],
      easier: [
        {
          id: 'f01-e1',
          kind: 'choice',
          prompt: 'Tiếng Anh giống tiếng Việt ở chỗ nào?',
          options: ['Thứ tự chủ ngữ – động từ – tân ngữ', 'Động từ không bao giờ đổi dạng', 'Không cần a, an, the'],
          answer: 0,
          hintVi: 'Nhớ lại câu “I eat rice”.',
          explanationVi: 'Hai thứ tiếng cùng thứ tự S-V-O. Còn động từ đổi dạng và mạo từ là chỗ khác nhau.',
          uses: ['svo-order', 'en-vs-vi'],
        },
        {
          id: 'f01-e2',
          kind: 'choice',
          prompt: 'Nói về hôm qua, go đổi thành từ nào?',
          options: ['goes', 'went', 'going'],
          answer: 1,
          hintVi: '“Yesterday I ___.”',
          explanationVi: 'go → went: “Yesterday I went.”',
          uses: ['en-vs-vi'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: nói về hôm qua của bạn. Chọn câu tiếng Việt mà khi nói bằng tiếng Anh phải đổi chữ, rồi nghe và nói theo 2 câu mẫu.',
      sampleEn: 'Yesterday I went to school.',
      item: {
        id: 'f01-a1',
        kind: 'choice',
        prompt: 'Câu nào sang tiếng Anh phải đổi dạng động từ?',
        options: ['Hôm qua tôi đi học.', 'Tôi đi học mỗi ngày.', 'Tôi ăn cơm.'],
        answer: 0,
        hintVi: 'Tìm câu nói về chuyện đã qua.',
        explanationVi: '“Hôm qua” là chuyện đã qua, nên go đổi thành went: “Yesterday I went to school.”',
        uses: ['en-vs-vi'],
      },
      speak: [
        { id: 'f01-say-1', text: 'Yesterday I went to school.', vi: 'Hôm qua tôi đi học.' },
        { id: 'f01-say-2', text: 'I eat rice.', vi: 'Tôi ăn cơm.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f01-rule-1',
      brickId: 'F01',
      cloze: 'Yesterday I ___ to school. (go)',
      answer: 'went',
      vi: 'Nói về hôm qua thì động từ đổi dạng: go → went.',
    },
    {
      id: 'f01-rule-2',
      brickId: 'F01',
      cloze: 'I read two ___. (book)',
      answer: 'books',
      vi: 'Hai trở lên thì đuôi từ đổi: book → books.',
    },
  ],
  themeWordIds: ['ngsl-go', 'ngsl-eat', 'ngsl-yesterday', 'ngsl-book', 'ngsl-rice'],
}
