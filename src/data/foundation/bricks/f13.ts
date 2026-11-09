import type { Brick } from '../types'

/**
 * F13 · to be khẳng định (hàng C). Tự soạn; dạy `be-affirmative`. Phủ mọi dạng của cổng hư từ F13 (be, am, is, are; was,
 * were, been, being chỉ nhắc một lần như họ hàng của be, học ở Năm 1). Câu tiếng Anh chỉ dùng F01–F13: chưa có not, câu
 * hỏi, there, have, at; nơi chốn là here, home hoặc in + tên thành phố.
 */
export const F13_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Tiếng Việt nói “Tôi vui”, “Cô ấy bận”: không cần chữ “là”. Câu tiếng Anh thì phải có động từ, ' +
        'nên trước tính từ, danh từ hay nơi chốn ta dùng to be: I am, he / she / it is, you / we / they are. ' +
        "Nói nhanh: I'm, you're, he's, she's, it's, we're, they're. Sau am / is / are có thể là danh từ (a student), " +
        'tính từ (happy) hoặc nơi chốn (here, home, in Hanoi).',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “Tôi vui.”, “Cô ấy bận.”: tính từ đứng ngay sau chủ ngữ, không cần chữ “là”.',
      enRequires:
        'Tiếng Anh bắt buộc có am / is / are giữa chủ ngữ và phần sau: “I am happy.”, không nói “I happy.”. ' +
        'Động từ thường là động từ chỉ việc như agree, like, go (không phải am / is / are). Đã có động từ thường thì ' +
        'không thêm am / is / are: “I agree.”, không nói “I am agree.”.',
      examples: [
        { vi: 'Tôi vui.', en: 'I am happy.' },
        { vi: 'Cô ấy bận.', en: 'She is busy.' },
        { vi: 'Họ còn trẻ.', en: 'They are young.' },
        { vi: 'Huế là một thành phố cổ.', en: 'Hue is an old city.' },
        { vi: 'Chúng tôi ở nhà.', en: "We're home." },
        {
          vi: 'Họ hàng của be: học ở Năm 1, giờ chỉ cần nhận ra.',
          en: 'be · was · were · been · being',
          audioText: 'be, was, were, been, being',
        },
      ],
      timeline: { kind: 'state', label: 'I am happy: trạng thái đang đúng ở hiện tại' },
    },
    {
      kind: 'worked',
      en: 'My mother is a doctor.',
      vi: 'Mẹ tôi là bác sĩ.',
      noteVi:
        'My mother là một người (như she) nên dùng is. Nghề nghiệp số ít vẫn cần a: a doctor. ' +
        "Nói nhanh: “She's a doctor.”",
    },
    {
      kind: 'faded',
      en: 'We ___ in Da Nang.',
      answer: 'are',
      vi: 'Chúng tôi đang ở Đà Nẵng.',
      hintVi: 'we đi với am, is hay are?',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f13-c1',
          kind: 'choice',
          prompt: 'I ___ busy today.',
          options: ['am', 'is', 'are'],
          answer: 0,
          hintVi: 'I chỉ đi với một dạng của to be.',
          explanationVi: 'I đi với am: I am busy today. is dùng cho he / she / it, are cho you / we / they.',
          uses: ['be-affirmative', 'subject-pronouns'],
        },
        {
          id: 'f13-c2',
          kind: 'choice',
          prompt: '“Anh ấy còn trẻ.” nói thế nào?',
          options: ['He is young.', 'He young.', 'He are young.'],
          answer: 0,
          hintVi: 'Câu tiếng Anh cần am / is / are trước tính từ.',
          explanationVi: 'Không bỏ to be trước tính từ, và he đi với is: He is young.',
          uses: ['be-affirmative'],
        },
        {
          id: 'f13-c3',
          kind: 'listen',
          audioText: "It's an old city.",
          prompt: 'Bạn nghe thấy câu nào?',
          options: ["It's an old city.", 'It an old city.', 'Is an old city.'],
          answer: 0,
          hintVi: 'Nghe kỹ âm /s/ ngay sau It.',
          explanationVi: "It's là It is nói nhanh. Câu phải có cả chủ ngữ It và is: It's an old city.",
          uses: ['be-affirmative', 'final-sounds'],
        },
        {
          id: 'f13-c4',
          kind: 'choice',
          prompt: 'Câu nào đúng cho “Tôi đồng ý”?',
          options: ['I agree.', 'I am agree.', 'I is agree.'],
          answer: 0,
          hintVi: 'agree đã là động từ.',
          explanationVi: 'agree là động từ thường nên không cần am: I agree. Không nói “I am agree.”.',
          uses: ['be-affirmative', 'subject-verb'],
        },
        {
          id: 'f13-c5',
          kind: 'choice',
          prompt: 'My parents ___ in Hue.',
          options: ['are', 'is', 'am'],
          answer: 0,
          hintVi: 'My parents là nhiều người, giống they.',
          explanationVi: 'My parents = they, nên dùng are: My parents are in Hue.',
          uses: ['be-affirmative', 'plurals'],
        },
      ],
      easier: [
        {
          id: 'f13-e1',
          kind: 'choice',
          prompt: 'I ___ a student.',
          options: ['am', 'is', 'are'],
          answer: 0,
          hintVi: 'I đi với am.',
          explanationVi: 'I am: I am a student.',
          uses: ['be-affirmative'],
        },
        {
          id: 'f13-e2',
          kind: 'choice',
          prompt: 'She ___ happy.',
          options: ['is', 'am', 'are'],
          answer: 0,
          hintVi: 'he / she / it đi với is.',
          explanationVi: 'She is happy. am chỉ đi với I, are đi với you / we / they.',
          uses: ['be-affirmative'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: giới thiệu bản thân bằng 3 câu: tên, nghề, cảm xúc. Chọn câu đúng, rồi nói theo mẫu, ' +
        'thay bằng tên và nghề của bạn.',
      sampleEn: "I'm Huy. I'm a student. I'm happy.",
      item: {
        id: 'f13-a1',
        kind: 'choice',
        prompt: 'Bạn muốn nói “Tôi là kỹ sư.”:',
        options: ["I'm an engineer.", 'I engineer.', "I'm engineer."],
        answer: 0,
        hintVi: 'Cần to be, và nghề số ít cần a / an.',
        explanationVi: "I'm = I am. engineer bắt đầu bằng âm nguyên âm /e/ nên dùng an: I'm an engineer.",
        uses: ['be-affirmative', 'articles'],
      },
      speak: [
        { id: 'f13-say-1', text: "I'm Huy.", vi: 'Tôi là Huy.' },
        { id: 'f13-say-2', text: "I'm a student.", vi: 'Tôi là sinh viên.' },
        { id: 'f13-say-3', text: "I'm happy.", vi: 'Tôi vui.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f13-rule-1',
      brickId: 'F13',
      cloze: 'They ___ young. (be)',
      answer: 'are',
      vi: 'you / we / they đi với are: They are young.',
    },
    {
      id: 'f13-rule-2',
      brickId: 'F13',
      cloze: 'I ___ happy. (be)',
      answer: 'am',
      vi: 'Không bỏ am / is / are trước tính từ: I am happy, không nói “I happy”.',
    },
  ],
  themeWordIds: ['ngsl-happy', 'ngsl-busy', 'ngsl-young', 'ngsl-old', 'ngsl-city'],
}
