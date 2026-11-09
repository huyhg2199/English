import type { Brick } from '../types'

/**
 * F18 · at/in/on + trạng từ tần suất (hàng D). Tự soạn; dạy `prepositions-of-time`, `frequency-adverbs`. Phủ mọi dạng
 * của cổng hư từ F18 (at, every, always, never, often), dạy thêm usually, sometimes. Câu tiếng Anh dùng F01–F18.
 */
export const F18_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Nói giờ dùng at (at six), thứ dùng on (on Monday), tháng dùng in (in May). Trạng từ tần suất cho biết bao ' +
        'lâu một lần, từ nhiều tới ít: always (luôn luôn), usually (thường, gần như luôn), often (hay), sometimes (thỉnh ' +
        'thoảng), never (không bao giờ). ' +
        'Chúng đứng trước động từ thường nhưng đứng sau am / is / are. every day (mỗi ngày) thì đặt ở cuối câu.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “lúc sáu giờ”, “vào thứ Hai”, “vào tháng Năm”: chỉ cần “lúc” hay “vào”.',
      enRequires:
        'Tiếng Anh bắt buộc chọn đúng giới từ: at six, on Monday, in May. Trạng từ tần suất đứng trước động từ ' +
        'thường: “I usually wake up early.”, không nói “I wake up usually early.”. Với am / is / are thì đứng sau: ' +
        '“She is never late.”. Cụm cố định, học thuộc: in the morning (buổi sáng), at night (ban đêm).',
      examples: [
        { vi: 'lúc bảy giờ', en: 'at seven' },
        { vi: 'vào thứ Hai', en: 'on Monday' },
        { vi: 'vào tháng Sáu', en: 'in June' },
        { vi: 'Tôi luôn uống trà vào buổi sáng.', en: 'I always drink tea in the morning.' },
        { vi: 'Cô ấy không bao giờ đi trễ.', en: 'She is never late.' },
        { vi: 'Họ hay chơi bóng đá vào thứ Bảy.', en: 'They often play football on Saturday.' },
        { vi: 'Tôi học tiếng Anh mỗi ngày.', en: 'I study English every day.' },
      ],
      timeline: { kind: 'habit', label: 'I usually wake up early: thói quen lặp lại' },
    },
    {
      kind: 'worked',
      en: 'I sometimes work on Sunday.',
      vi: 'Thỉnh thoảng tôi làm việc vào Chủ nhật.',
      noteVi: 'sometimes đứng ngay trước động từ work. Chủ nhật là một thứ trong tuần nên dùng on: on Sunday.',
    },
    {
      kind: 'faded',
      en: 'We start work ___ eight.',
      answer: 'at',
      vi: 'Chúng tôi bắt đầu làm việc lúc tám giờ.',
      hintVi: 'eight là một giờ cụ thể.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f18-c1',
          kind: 'choice',
          prompt: 'We have a test ___ Friday.',
          options: ['on', 'in', 'at'],
          answer: 0,
          hintVi: 'Friday là một thứ trong tuần.',
          explanationVi: 'Thứ trong tuần dùng on: on Friday. at cho giờ, in cho tháng.',
          uses: ['prepositions-of-time', 'days-months'],
        },
        {
          id: 'f18-c2',
          kind: 'order',
          prompt: 'Xếp thành câu “Tôi thường dậy sớm” (bắt đầu bằng I).',
          tokens: ['I', 'usually', 'wake', 'up', 'early'],
          hintVi: 'Trạng từ tần suất đứng trước động từ thường.',
          explanationVi: 'I – usually – wake up – early. usually đứng ngay trước động từ wake up.',
          uses: ['frequency-adverbs', 'subject-verb'],
        },
        {
          id: 'f18-c3',
          kind: 'listen',
          audioText: 'I never eat at night.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['I never eat at night.', 'I often eat at night.', 'I never eat at nine.'],
          answer: 0,
          hintVi: 'Nghe trạng từ sau I, và từ cuối câu.',
          explanationVi: 'never = không bao giờ: I never eat at night (tôi không bao giờ ăn đêm).',
          uses: ['frequency-adverbs', 'prepositions-of-time'],
        },
        {
          id: 'f18-c4',
          kind: 'choice',
          prompt: 'Câu nào đặt often đúng chỗ?',
          options: ['He is often busy.', 'He often busy is.', 'He busy is often.'],
          answer: 0,
          hintVi: 'Với am / is / are, trạng từ tần suất đứng sau.',
          explanationVi: 'often đứng sau is: He is often busy.',
          uses: ['frequency-adverbs', 'be-affirmative'],
        },
        {
          id: 'f18-c5',
          kind: 'choice',
          prompt: 'My exam is ___ July.',
          options: ['in', 'on', 'at'],
          answer: 0,
          hintVi: 'July là một tháng.',
          explanationVi: 'Tháng dùng in: in July.',
          uses: ['prepositions-of-time', 'days-months'],
        },
      ],
      easier: [
        {
          id: 'f18-e1',
          kind: 'choice',
          prompt: '___ six (lúc sáu giờ)',
          options: ['at', 'on', 'in'],
          answer: 0,
          hintVi: 'Giờ cụ thể.',
          explanationVi: 'Giờ dùng at: at six.',
          uses: ['prepositions-of-time', 'clock-time'],
        },
        {
          id: 'f18-e2',
          kind: 'choice',
          prompt: 'never nghĩa là gì?',
          options: ['không bao giờ', 'luôn luôn', 'thỉnh thoảng'],
          answer: 0,
          hintVi: 'Ngược với always.',
          explanationVi: 'never = không bao giờ; always = luôn luôn; sometimes = thỉnh thoảng.',
          uses: ['frequency-adverbs'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: kể lịch một ngày của bạn bằng 3 câu, có giờ (at) và trạng từ tần suất. Chọn câu đúng, rồi nói ' +
        'theo mẫu, thay bằng giờ và việc của bạn.',
      sampleEn: 'I get up at six. I usually start work at eight. I never drink coffee at night.',
      item: {
        id: 'f18-a1',
        kind: 'choice',
        prompt: 'Bạn muốn nói “Tôi luôn ăn sáng lúc bảy giờ.”:',
        options: ['I always eat breakfast at seven.', 'I eat always breakfast at seven.', 'I always eat breakfast on seven.'],
        answer: 0,
        hintVi: 'always trước động từ, giờ dùng at.',
        explanationVi: 'always đứng trước động từ eat, giờ dùng at: I always eat breakfast at seven.',
        uses: ['frequency-adverbs', 'prepositions-of-time'],
      },
      speak: [
        { id: 'f18-say-1', text: 'I get up at six.', vi: 'Tôi dậy lúc sáu giờ.' },
        { id: 'f18-say-2', text: 'I usually start work at eight.', vi: 'Tôi thường bắt đầu làm việc lúc tám giờ.' },
        { id: 'f18-say-3', text: 'I never drink coffee at night.', vi: 'Tôi không bao giờ uống cà phê buổi tối.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f18-rule-1',
      brickId: 'F18',
      cloze: 'I get up ___ six. (lúc)',
      answer: 'at',
      vi: 'Giờ dùng at, thứ dùng on, tháng dùng in: at six, on Monday, in May. Cụm cố định: at night, in the morning.',
    },
    {
      id: 'f18-rule-2',
      brickId: 'F18',
      cloze: 'I ___ drink coffee at night. (không bao giờ)',
      answer: 'never',
      vi: 'Trạng từ tần suất đứng trước động từ thường: I never drink coffee at night.',
    },
  ],
  themeWordIds: ['ngsl-usually', 'ngsl-sometimes', 'ngsl-early', 'ngsl-wake', 'ngsl-coffee'],
}
