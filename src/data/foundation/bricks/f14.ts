import type { Brick } from '../types'

/**
 * F14 · to be phủ định, hỏi + từ để hỏi (hàng C). Tự soạn; dạy `be-negative`, `be-questions`, `wh-questions`. Phủ mọi
 * dạng của cổng hư từ F14 (not, what, who, where, how, from, much). Câu tiếng Anh chỉ dùng F01–F14: chưa có there,
 * on / under, have, at; nơi chốn là here, home hoặc in + tên thành phố.
 */
export const F14_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        "Phủ định: thêm not ngay sau am, is, are. Nói nhanh: isn't, aren't, còn I am not là I'm not. " +
        'Câu hỏi Yes/No: đưa am, is, are lên trước chủ ngữ, lên giọng ở cuối câu; trả lời ngắn Yes, I am hoặc No, ' +
        "it isn't. Từ để hỏi đứng đầu câu: what (gì), where (đâu), who (ai), how old (mấy tuổi), how much (bao nhiêu tiền).",
    },
    {
      kind: 'contrast',
      viSays:
        'Tiếng Việt hỏi bằng cách thêm chữ ở cuối câu: “Bạn là sinh viên à?”, “Anh ấy ở đâu?”. Thứ tự các chữ không đổi.',
      enRequires:
        'Tiếng Anh bắt buộc đảo am / is / are lên trước chủ ngữ: “Are you a student?”, không nói “You are student?”. ' +
        "Từ để hỏi đứng đầu câu: “Where is he?”. Trả lời ngắn chỉ lặp lại to be: “Yes, I am.”, “No, he isn't.”.",
      examples: [
        { vi: 'Tôi không trễ.', en: "I'm not late." },
        { vi: 'Họ chưa sẵn sàng.', en: "They aren't ready." },
        { vi: 'Anh ấy có nhà không? — Không.', en: "Is he home? — No, he isn't.", audioText: "Is he home? No, he isn't." },
        { vi: 'Bạn đến từ nước nào?', en: 'What country are you from?' },
        { vi: 'Người đàn ông kia là ai?', en: 'Who is that man?' },
        { vi: 'Nó bao nhiêu tiền?', en: 'How much is it?' },
      ],
    },
    {
      kind: 'worked',
      en: 'How old is your sister? — She is ten.',
      audioText: 'How old is your sister? She is ten.',
      vi: 'Em gái bạn mấy tuổi? — Em ấy mười tuổi.',
      noteVi:
        'Hỏi tuổi (age) dùng how old đứng đầu, rồi is, rồi chủ ngữ your sister. Trả lời tuổi vẫn dùng is: She is ten.',
    },
    {
      kind: 'faded',
      en: '___ is your teacher? — Ms Lan.',
      answer: 'Who',
      vi: 'Cô giáo của bạn là ai? — Cô Lan.',
      hintVi: 'Hỏi về người thì dùng từ để hỏi nào?',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f14-c1',
          kind: 'choice',
          prompt: 'He ___ a doctor. (Anh ấy không phải bác sĩ.)',
          options: ["isn't", "aren't", 'not'],
          answer: 0,
          hintVi: 'Phủ định của is.',
          explanationVi: "he đi với is, phủ định là is not, nói nhanh isn't: He isn't a doctor. not không đứng một mình.",
          uses: ['be-negative'],
        },
        {
          id: 'f14-c2',
          kind: 'listen',
          audioText: 'Are you ready?',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['Are you ready?', 'You are ready.', 'Is you ready?'],
          answer: 0,
          hintVi: 'Nghe từ đầu tiên, và giọng lên ở cuối câu.',
          explanationVi: 'Câu hỏi Yes/No đảo Are lên trước you và lên giọng ở cuối: Are you ready?',
          uses: ['be-questions'],
        },
        {
          id: 'f14-c3',
          kind: 'choice',
          prompt: '“Bạn là sinh viên à?” nói thế nào?',
          options: ['Are you a student?', 'You are student?', 'You a student?'],
          answer: 0,
          hintVi: 'Câu hỏi đảo are lên trước chủ ngữ; nghề số ít cần a.',
          explanationVi: 'Đảo Are lên trước you: Are you a student? Không hỏi bằng câu khẳng định thêm dấu “?”.',
          uses: ['be-questions', 'articles'],
        },
        {
          id: 'f14-c4',
          kind: 'choice',
          prompt: '___ much is this bag? (Cái túi này bao nhiêu tiền?)',
          options: ['How', 'What', 'Where'],
          answer: 0,
          hintVi: 'Hỏi giá: … much.',
          explanationVi: 'Hỏi giá dùng how much: How much is this bag?',
          uses: ['wh-questions', 'prices'],
        },
        {
          id: 'f14-c5',
          kind: 'choice',
          prompt: '“Is she late?” Trả lời ngắn “Không” thế nào?',
          options: ["No, she isn't.", 'No, she not.', "No, she aren't."],
          answer: 0,
          hintVi: 'Trả lời ngắn lặp lại to be của câu hỏi.',
          explanationVi: "Câu hỏi dùng is nên trả lời ngắn là No, she isn't. (hoặc Yes, she is.)",
          uses: ['be-questions', 'be-negative'],
        },
      ],
      easier: [
        {
          id: 'f14-e1',
          kind: 'choice',
          prompt: 'Tôi không bận: I ___ busy.',
          options: ['am not', 'is not', 'are not'],
          answer: 0,
          hintVi: 'I đi với am.',
          explanationVi: "I đi với am, phủ định là am not (I'm not): I am not busy.",
          uses: ['be-negative'],
        },
        {
          id: 'f14-e2',
          kind: 'choice',
          prompt: 'Từ nào hỏi “ở đâu”?',
          options: ['where', 'who', 'what'],
          answer: 0,
          hintVi: 'who hỏi người, what hỏi vật.',
          explanationVi: 'where = ở đâu, who = ai, what = gì.',
          uses: ['wh-questions'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: hỏi và đáp tên, quê, tuổi. Chọn câu trả lời đúng, rồi nói theo mẫu với tên, quê và tuổi của bạn.',
      sampleEn: "What's your name? — I'm Huy. Where are you from? — I'm from Vietnam. How old are you? — I'm 25.",
      sampleAudioText: "What's your name? I'm Huy. Where are you from? I'm from Vietnam. How old are you? I'm 25.",
      item: {
        id: 'f14-a1',
        kind: 'choice',
        prompt: 'Người mới gặp hỏi “Where are you from?”. Bạn trả lời:',
        options: ["I'm from Vietnam.", 'I from Vietnam.', "I'm Vietnam from."],
        answer: 0,
        hintVi: 'Cần to be, và from đứng trước tên nước.',
        explanationVi: "I'm from + tên nước: I'm from Vietnam.",
        uses: ['wh-questions', 'be-affirmative'],
      },
      speak: [
        { id: 'f14-say-1', text: 'Where are you from?', vi: 'Bạn đến từ đâu?' },
        { id: 'f14-say-2', text: "I'm from Vietnam.", vi: 'Tôi đến từ Việt Nam.' },
        { id: 'f14-say-3', text: 'How old are you?', vi: 'Bạn bao nhiêu tuổi?' },
        { id: 'f14-say-4', text: "I'm 25.", vi: 'Tôi 25 tuổi.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f14-rule-1',
      brickId: 'F14',
      cloze: 'They ___ ready. (không)',
      answer: "aren't",
      vi: "Phủ định của are là are not, nói nhanh aren't: They aren't ready.",
    },
    {
      id: 'f14-rule-2',
      brickId: 'F14',
      cloze: '___ are you from? (ở đâu)',
      answer: 'Where',
      vi: 'Hỏi quê dùng Where đứng đầu câu: Where are you from?',
    },
  ],
  themeWordIds: ['ngsl-country', 'ngsl-age', 'ngsl-home', 'ngsl-ready', 'ngsl-late'],
}
