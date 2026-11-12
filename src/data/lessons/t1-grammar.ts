import type { GrammarContent, Tense } from './types'

/**
 * Các thì tháng T1. Giải thích, ví dụ tự soạn. Câu thoại thật chép nguyên văn từ transcript
 * VOA Let's Learn English Level 1 (public domain, chính phủ Mỹ), kèm link trang bài.
 */

const VOA = 'https://learningenglish.voanews.com/a'
const VOA_L1 = { episode: "Let's Learn English, Lesson 1: Welcome!", sourceUrl: `${VOA}/lets-learn-english-lesson-one/3111026.html` }
const VOA_L3 = { episode: "Let's Learn English, Lesson 3: I'm Here!", sourceUrl: `${VOA}/lets-learn-english-lesson-3-i-am-here/3126527.html` }
const VOA_L12 = {
  episode: "Let's Learn English, Lesson 12: Meet My Family",
  sourceUrl: `${VOA}/lets-learn-english-lesson-12-meet-my-family/3301733.html`,
}
const VOA_L15 = {
  episode: "Let's Learn English, Lesson 15: I Love People-Watching!",
  sourceUrl: `${VOA}/lets-learn-english-lesson-15-i-love-people-watching/3343720.html`,
}
// Tên bài theo <title>/<h1> của trang ("When Do I Start?"); slug URL của VOA là "when-do-you-start" (đúng link gốc, đã kiểm 2026-11-02).
const VOA_L19 = {
  episode: "Let's Learn English, Lesson 19: When Do I Start?",
  sourceUrl: `${VOA}/lets-learn-english-lesson-19-when-do-you-start/3357760.html`,
}
const VOA_L20 = {
  episode: "Let's Learn English, Lesson 20: What Can You Do?",
  sourceUrl: `${VOA}/lets-learn-english-lesson-20-what-can-you-do/3384429.html`,
}

export const TO_BE: Tense = {
  id: 'to-be',
  name: 'Ôn lại: viên gạch F13–F14 · to be (am / is / are)',
  use: 'Nói ai là gì, ở đâu, thế nào ngay lúc này: tên, nghề, cảm xúc, nơi chốn.',
  timeline: { kind: 'state', label: 'Trạng thái đang đúng ở hiện tại' },
  formulas: [
    { label: 'Khẳng định', text: 'I am · He / She / It is · You / We / They are + danh từ / tính từ / nơi chốn' },
    { label: 'Phủ định', text: "S + am / is / are + not  (isn't, aren't · I'm not)" },
    { label: 'Câu hỏi', text: "Am / Is / Are + S + …?  → Yes, I am. / No, it isn't." },
  ],
  rules: [
    'I đi với am; he / she / it và danh từ số ít đi với is; you / we / they và danh từ số nhiều đi với are.',
    "Phủ định thêm not ngay sau am / is / are. Nói nhanh: isn't, aren't, còn I am not thành I'm not.",
    "Câu hỏi đảo am / is / are lên trước chủ ngữ. Trả lời ngắn Yes, I am (câu Yes không rút gọn thành I'm).",
  ],
  examples: [
    { en: 'I am a student.', vi: 'Tôi là sinh viên.' },
    { en: 'She is in Hanoi.', vi: 'Cô ấy đang ở Hà Nội.' },
    { en: 'They are not tired.', vi: 'Họ không mệt.' },
    { en: 'Is it cold today?', vi: 'Hôm nay có lạnh không?' },
    { en: "We're from Vietnam.", vi: 'Chúng tôi đến từ Việt Nam.' },
    { en: 'Are you ready? — Yes, I am.', vi: 'Bạn sẵn sàng chưa? — Rồi.' },
  ],
  mistakes: [
    { wrong: 'I very happy.', right: 'I am very happy.', why: 'Tiếng Việt bỏ "là" trước tính từ, tiếng Anh bắt buộc có am / is / are.' },
    { wrong: 'He are my friend.', right: 'He is my friend.', why: 'He / she / it luôn đi với is.' },
    { wrong: 'I am agree.', right: 'I agree.', why: 'agree đã là động từ, không thêm am phía trước.' },
  ],
  dialogues: [
    { kind: 'voa', speaker: 'Pete', text: 'Hi! Are you Anna?', vi: 'Chào! Bạn là Anna phải không?', ...VOA_L1 },
    { kind: 'voa', speaker: 'Pete', text: 'I am Pete.', vi: 'Tôi là Pete.', ...VOA_L1 },
    { kind: 'voa', speaker: 'Marsha', text: 'Good. You are there.', vi: 'Tốt. Bạn tới nơi rồi.', ...VOA_L3 },
  ],
  spellId: 'lumos',
}

export const PRESENT_SIMPLE: Tense = {
  id: 'present-simple',
  name: 'Hiện tại đơn: câu khẳng định',
  use: 'Thói quen, việc lặp đi lặp lại, lịch cố định và sự thật chung.',
  timeline: { kind: 'habit', label: 'Thói quen lặp lại' },
  signalWords: ['every day', 'every morning', 'always', 'usually', 'often', 'sometimes', 'never', 'on Sundays'],
  formulas: [
    { label: 'I / You / We / They', text: 'S + động từ nguyên mẫu: I work. They live here.' },
    { label: 'He / She / It', text: 'S + động từ thêm -s / -es: She works. He watches.' },
    { label: 'Bất quy tắc', text: 'have → has' },
  ],
  rules: [
    'Chủ ngữ là ngôi thứ ba số ít (he, she, it, Anna, my boss) thì động từ thêm -s.',
    'Động từ tận cùng -s, -ss, -sh, -ch, -x, -z, -o thì thêm -es: watches, fixes, buzzes, goes, does.',
    'Phụ âm + y thì đổi y thành -ies: study → studies. Nguyên âm + y giữ nguyên, thêm -s: play → plays.',
  ],
  examples: [
    { en: 'I drink coffee every morning.', vi: 'Tôi uống cà phê mỗi sáng.' },
    { en: 'She works in an office.', vi: 'Cô ấy làm việc ở văn phòng.' },
    { en: 'He watches TV at night.', vi: 'Anh ấy xem TV vào buổi tối.' },
    { en: 'My brother studies English.', vi: 'Em trai tôi học tiếng Anh.' },
    { en: 'The shop opens at eight.', vi: 'Cửa hàng mở cửa lúc tám giờ.' },
    { en: 'Water boils at 100 degrees.', vi: 'Nước sôi ở 100 độ.' },
  ],
  mistakes: [
    {
      wrong: 'She work here.',
      right: 'She works here.',
      why: 'Quên -s với he / she / it: lỗi hay gặp nhất vì động từ tiếng Việt không đổi theo chủ ngữ.',
    },
    { wrong: 'He haves a car.', right: 'He has a car.', why: 'have là bất quy tắc: he / she / it has.' },
    { wrong: 'I am work every day.', right: 'I work every day.', why: 'Không đặt am / is / are trước động từ thường.' },
  ],
  dialogues: [
    { kind: 'voa', speaker: 'Anna', text: 'I always ride the Metro to work.', vi: 'Tôi luôn đi tàu điện ngầm đi làm.', ...VOA_L19 },
    { kind: 'voa', speaker: 'Anna', text: 'My boss has news for me.', vi: 'Sếp có tin cho tôi.', ...VOA_L19 },
    { kind: 'voa', speaker: 'Marsha', text: 'She makes spoons?', vi: 'Bà ấy làm thìa à?', ...VOA_L12 },
  ],
  spellId: 'alohomora',
  ruleCards: [
    {
      id: 'present-simple-rule-1',
      cloze: 'My mother ___ (work) on Saturdays.',
      answer: 'works',
      vi: 'he / she / it và danh từ số ít (my mother, Anna) thì động từ thêm -s.',
    },
    {
      id: 'present-simple-rule-2',
      cloze: 'He ___ (wash) his car every week.',
      answer: 'washes',
      vi: 'Tận cùng -s, -ss, -sh, -ch, -x, -z, -o thì thêm -es (washes, watches, goes).',
    },
    {
      id: 'present-simple-rule-3',
      cloze: 'Minh ___ (study) English at night.',
      answer: 'studies',
      vi: 'Phụ âm + y đổi thành -ies (study → studies). Nguyên âm + y chỉ thêm -s (play → plays).',
    },
    {
      id: 'present-simple-rule-4',
      cloze: 'Our teacher ___ (have) a red car.',
      answer: 'has',
      vi: 'have đi với he / she / it thành has (không phải haves).',
    },
  ],
  // Phần luyện có bậc (story 36): chỉ Sân ga F01–F18 và hiện tại đơn khẳng định (không quá khứ, không be + V-ing, không
  // don't / Do…?, xem `src/lib/tense-scope.ts`); đề không trùng đề quiz s1-t1-w2.
  practice: {
    worked: {
      en: 'My father drinks coffee every morning.',
      vi: 'Bố tôi uống cà phê mỗi sáng.',
      noteVi: 'my father = he nên drink thêm -s: drinks. Tiếng Việt "uống" không đổi theo người nói, tiếng Anh bắt buộc thêm -s.',
      timeline: { kind: 'habit', label: 'Sáng nào cũng uống' },
    },
    faded: {
      en: 'She ___ (watch) TV every evening.',
      answer: 'watches',
      vi: 'Cô ấy xem TV mỗi tối.',
      hintVi: 'watch tận cùng -ch nên thêm -es.',
    },
    check: {
      items: [
        {
          id: 'present-simple-c1',
          kind: 'type',
          prompt: 'My friend ___ (work) in a bank.',
          answer: 'works',
          hintVi: 'my friend là một người (= he / she).',
          explanationVi: 'my friend = he / she (ngôi thứ ba số ít) nên work thêm -s: works.',
        },
        {
          id: 'present-simple-c2',
          kind: 'choice',
          prompt: 'I ___ coffee every day.',
          options: ['drink', 'drinks', 'am drink'],
          answer: 0,
          hintVi: 'Chủ ngữ là I.',
          explanationVi: 'I, you, we, they giữ nguyên động từ: I drink. Chỉ he / she / it mới thêm -s. Không đặt am trước động từ thường.',
        },
        {
          id: 'present-simple-c3',
          kind: 'type',
          prompt: 'Tom ___ (go) to school every day.',
          answer: 'goes',
          hintVi: 'go tận cùng -o.',
          explanationVi: 'Tom = he nên thêm -s; go tận cùng -o nên thêm -es: goes (như do → does).',
        },
        {
          id: 'present-simple-c4',
          kind: 'type',
          prompt: 'Đổi chủ ngữ sang She: I play tennis on Sundays.',
          answer: 'She plays tennis on Sundays.',
          hintVi: 'she là ngôi thứ ba số ít; play tận cùng nguyên âm + y.',
          explanationVi: 'Đổi I thành she thì động từ thêm -s. play có a + y (nguyên âm + y) nên giữ y, chỉ thêm -s: plays.',
        },
        {
          id: 'present-simple-c5',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Họ sống ở Hà Nội. (live, Hanoi)',
          answer: 'They live in Hanoi.',
          hintVi: 'Họ = they; ở + thành phố dùng in.',
          explanationVi: 'they là số nhiều nên live giữ nguyên, không thêm -s. Ở một thành phố dùng in: They live in Hanoi.',
        },
        {
          id: 'present-simple-c6',
          kind: 'type',
          prompt: 'My brother ___ (have) two cats.',
          answer: 'has',
          hintVi: 'have là động từ bất quy tắc với he / she / it.',
          explanationVi: 'my brother = he. have với he / she / it đổi thành has (không phải haves).',
        },
      ],
      easier: [
        {
          id: 'present-simple-e1',
          kind: 'choice',
          prompt: 'He ___ in Hanoi.',
          options: ['lives', 'live', 'is live'],
          answer: 0,
          hintVi: 'he cần động từ thêm -s.',
          explanationVi: 'he là ngôi thứ ba số ít nên live thêm -s: He lives in Hanoi. Không đặt is trước động từ thường.',
        },
        {
          id: 'present-simple-e2',
          kind: 'choice',
          prompt: 'We ___ English every day.',
          options: ['study', 'studies', 'studys'],
          answer: 0,
          hintVi: 'Chủ ngữ là we (số nhiều).',
          explanationVi: 'we giữ nguyên động từ: We study. studies chỉ dùng cho he / she / it; "studys" sai chính tả.',
        },
      ],
    },
    apply: {
      promptVi: 'Nói hoặc viết 3 câu về thói quen hằng ngày của bạn và của một người trong nhà (nhớ thêm -s cho he / she).',
      sampleEn: 'I get up at six. I walk to work. My mother cooks breakfast.',
      speak: [
        { id: 'present-simple-say-1', text: 'I drink tea every morning.', vi: 'Sáng nào tôi cũng uống trà.' },
        { id: 'present-simple-say-2', text: 'My mother cooks dinner every evening.', vi: 'Tối nào mẹ tôi cũng nấu bữa tối.' },
      ],
    },
  },
}

export const PRESENT_SIMPLE_QUESTIONS: Tense = {
  id: 'present-simple-questions',
  name: 'Hiện tại đơn: câu hỏi và phủ định',
  use: 'Hỏi về thói quen, sự thật; nói ai đó không làm gì một cách thường xuyên.',
  timeline: { kind: 'habit-question', label: 'Hỏi / phủ định một thói quen' },
  signalWords: ['every day', 'usually', 'often'],
  formulas: [
    { label: 'Phủ định', text: "S + do not (don't) / does not (doesn't) + động từ nguyên mẫu" },
    { label: 'Câu hỏi Yes/No', text: "Do / Does + S + động từ nguyên mẫu …?  → Yes, I do. / No, she doesn't." },
    { label: 'Câu hỏi Wh-', text: 'What / Where / When … + do / does + S + động từ nguyên mẫu?' },
  ],
  rules: [
    'I / you / we / they dùng do; he / she / it dùng does.',
    "Đã có does thì động từ chính về nguyên mẫu, bỏ -s: She doesn't work (không phải doesn't works).",
    'Với am / is / are thì không dùng do / does: Is she busy? (không phải Does she be busy?).',
  ],
  examples: [
    { en: "I don't like coffee.", vi: 'Tôi không thích cà phê.' },
    { en: "She doesn't live here.", vi: 'Cô ấy không sống ở đây.' },
    { en: 'Do you speak English? — Yes, I do.', vi: 'Bạn có nói tiếng Anh không? — Có.' },
    { en: "Does he work on Sunday? — No, he doesn't.", vi: 'Anh ấy có làm Chủ nhật không? — Không.' },
    { en: 'What do you do?', vi: 'Bạn làm nghề gì?' },
    { en: 'Where does your sister live?', vi: 'Chị bạn sống ở đâu?' },
  ],
  mistakes: [
    { wrong: "She doesn't works.", right: "She doesn't work.", why: 'does đã mang -s rồi, động từ chính về nguyên mẫu.' },
    {
      wrong: 'You like music?',
      right: 'Do you like music?',
      why: 'Tiếng Việt hỏi bằng "… không?" ở cuối; tiếng Anh cần do / does ở đầu câu.',
    },
    { wrong: 'He not like it.', right: "He doesn't like it.", why: 'Phủ định động từ thường phải mượn do / does + not.' },
  ],
  dialogues: [
    // Nháy cong ’ giữ nguyên như transcript VOA (so khớp giọng nói tự chuẩn hoá ’ thành ').
    { kind: 'voa', speaker: 'Pete', text: 'I don’t have a job.', vi: 'Tôi không có việc làm.', ...VOA_L20 },
    { kind: 'voa', speaker: 'Marsha', text: 'What does Uncle John do?', vi: 'Chú John làm nghề gì?', ...VOA_L12 },
    { kind: 'voa', speaker: 'Ashley', text: 'Does she wear glasses?', vi: 'Cô ấy có đeo kính không?', ...VOA_L15 },
  ],
  spellId: 'revelio',
  ruleCards: [
    {
      id: 'present-simple-questions-rule-1',
      cloze: 'My father ___ (not / drink) coffee.',
      answer: "doesn't drink",
      vi: "Phủ định: he / she / it + doesn't + V nguyên mẫu (không phải not drink, không phải doesn't drinks).",
    },
    {
      id: 'present-simple-questions-rule-2',
      cloze: '___ you like tea? — Yes, I do.',
      answer: 'Do',
      vi: "Câu hỏi: Do + I / you / we / they + V nguyên mẫu …? Trả lời ngắn: Yes, I do. / No, I don't.",
    },
    {
      id: 'present-simple-questions-rule-3',
      cloze: 'Where ___ your sister work now?',
      answer: 'does',
      vi: 'Wh + do / does + chủ ngữ + V nguyên mẫu.',
    },
    {
      id: 'present-simple-questions-rule-4',
      cloze: "___ your brother tired today? — No, he isn't.",
      answer: 'Is',
      vi: 'Với am / is / are thì không mượn do / does (không phải Does she be busy?).',
    },
  ],
  // Phần luyện có bậc (story 36): chỉ Sân ga F01–F18 và hiện tại đơn (khẳng định, phủ định, câu hỏi); không quá khứ, không
  // be + V-ing (xem `src/lib/tense-scope.ts`); đề không trùng đề quiz s1-t1-w3.
  practice: {
    worked: {
      en: 'Does your brother play football? — Yes, he does.',
      vi: 'Em trai bạn có chơi bóng đá không? — Có.',
      noteVi:
        'your brother = he nên mượn Does; play giữ nguyên (không thêm -s) vì does đã mang -s. Trả lời ngắn dùng lại does: Yes, he does.',
      timeline: { kind: 'habit-question', label: 'Hỏi về một thói quen' },
    },
    faded: {
      en: 'I ___ (not / eat) meat.',
      answer: "don't eat",
      vi: 'Tôi không ăn thịt.',
      hintVi: "I đi với do; phủ định là do not (don't) + động từ nguyên mẫu.",
    },
    check: {
      items: [
        {
          id: 'present-simple-questions-c1',
          kind: 'type',
          prompt: 'Tom ___ (not / drive) a car.',
          answer: "doesn't drive",
          hintVi: "Tom = he: phủ định dùng does not (doesn't).",
          explanationVi: "Tom = he nên dùng doesn't, rồi drive về nguyên mẫu (không thêm -s): Tom doesn't drive a car.",
        },
        {
          id: 'present-simple-questions-c2',
          kind: 'choice',
          prompt: '___ she busy today?',
          options: ['Is', 'Does', 'Do'],
          answer: 0,
          hintVi: 'busy là tính từ, câu không có động từ thường.',
          explanationVi: 'Câu chỉ có tính từ (busy) thì dùng to be: Is she busy? Không mượn does với to be (không nói Does she be busy?).',
        },
        {
          id: 'present-simple-questions-c3',
          kind: 'choice',
          prompt: '___ she work on Mondays?',
          options: ['Does', 'Is', 'Do'],
          answer: 0,
          hintVi: 'work là động từ thường; she đi với gì?',
          explanationVi: 'Có động từ thường (work) thì mượn do / does; she đi với does: Does she work on Mondays? So với câu trên: Is she busy?',
        },
        {
          id: 'present-simple-questions-c4',
          kind: 'type',
          prompt: 'Đổi sang câu hỏi: They speak English.',
          answer: 'Do they speak English?',
          hintVi: 'they đi với do; đặt Do lên đầu câu.',
          explanationVi: 'Câu hỏi với động từ thường: Do / Does + chủ ngữ + động từ nguyên mẫu. they đi với do: Do they speak English?',
        },
        {
          id: 'present-simple-questions-c5',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Bạn làm việc ở đâu? (where, work)',
          answer: 'Where do you work?',
          hintVi: 'Ở đâu = Where; Where + do / does + chủ ngữ + động từ.',
          explanationVi: 'Câu hỏi Wh-: Where + do + you + work? Tiếng Việt đặt "ở đâu" cuối câu, tiếng Anh đặt Where lên đầu.',
        },
        {
          id: 'present-simple-questions-c6',
          kind: 'type',
          prompt: 'Does Lan cook every day? — No, she ___.',
          answer: "doesn't",
          hintVi: 'Hỏi bằng Does thì trả lời ngắn cũng dùng does.',
          explanationVi: "Trả lời ngắn lặp lại trợ động từ của câu hỏi: No, she doesn't (does not). Không lặp lại cook.",
        },
      ],
      easier: [
        {
          id: 'present-simple-questions-e1',
          kind: 'choice',
          prompt: 'I ___ like milk.',
          options: ["don't", "doesn't", 'not'],
          answer: 0,
          hintVi: 'I đi với do.',
          explanationVi: "I đi với do nên phủ định là don't: I don't like milk. Không nói I not like.",
        },
        {
          id: 'present-simple-questions-e2',
          kind: 'choice',
          prompt: '___ you play tennis?',
          options: ['Do', 'Does', 'Are'],
          answer: 0,
          hintVi: 'you đi với do.',
          explanationVi: 'play là động từ thường, you đi với do: Do you play tennis?',
        },
      ],
    },
    apply: {
      promptVi: 'Viết 2 câu hỏi về thói quen của một người bạn, rồi nói một việc bạn không làm.',
      sampleEn: "Do you play games? Where does your sister work? I don't watch TV.",
      speak: [
        { id: 'present-simple-questions-say-1', text: 'Where do you live?', vi: 'Bạn sống ở đâu?' },
        { id: 'present-simple-questions-say-2', text: "My brother doesn't watch TV.", vi: 'Anh trai tôi không xem TV.' },
      ],
    },
  },
}

export const GRAMMAR_W1: GrammarContent = { tenses: [TO_BE] }
export const GRAMMAR_W2: GrammarContent = { tenses: [PRESENT_SIMPLE] }
export const GRAMMAR_W3: GrammarContent = { tenses: [PRESENT_SIMPLE_QUESTIONS] }
export const GRAMMAR_W4: GrammarContent = {
  tenses: [],
  review: {
    summary: [
      "To be: I am · he / she / it is · you / we / they are. Phủ định thêm not; câu hỏi đảo am / is / are lên đầu.",
      'Hiện tại đơn khẳng định: he / she / it thêm -s / -es (works, watches, studies, has).',
      "Hỏi và phủ định hiện tại đơn: do / does + động từ nguyên mẫu (Does she work? She doesn't work.).",
      'Không trộn: không nói "I am work", không nói "Does she be…".',
    ],
    note: 'Mini test 10 câu ôn cả 4 tuần T1. Câu sai tự vào Sổ lỗi sai, làm lại bao nhiêu lần cũng được.',
    quizId: 'mini-t1',
  },
}
