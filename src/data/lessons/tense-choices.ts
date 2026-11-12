import type { TenseChoice } from './types'

/**
 * Khối "Chọn thì" (story 39, 44, 45): 6 khối. Đặt hai thì cạnh nhau (s1-t2-w1, s1-t3-w2), hoặc chỉ cách nói tiếng Anh
 * của chữ Việt: tại sao · bao lâu một lần · bao nhiêu (s1-t1-w3), ai · cái gì (s1-t2-w2), đã · sẽ · chưa (s1-t3-w4),
 * phải · không cần · làm được · … được không? · muốn (s1-t4-w1). Tự soạn.
 * Phần luyện chạy bằng trình phát của thì (`TensePractice`): sai thì giải thích và làm lại, không ghi Sổ lỗi.
 * Chỉ import kiểu (không import file thì, tránh vòng); side trỏ thì bằng `tenseId`, `choiceSides` tra Tense lúc vẽ.
 * Chữ tiếng Anh chỉ dùng kiến thức đã dạy tới bài chứa khối, trong phạm vi chữ của thì cuối bài (`outOfScopeWords`).
 * Lượng từ (some / any / many / much / a lot of, viên F15) và liên từ (and / but / or / because / so, viên F16) đã dạy ở
 * Sân ga nên dùng được; vẫn không "Don't + V". Khối s1-t3-w2 / s1-t3-w4 không có dấu hiệu của bài dạy sau nó (hoàn
 * thành, since / how long, modal, so sánh, bị động). Khối s1-t4-w1 dùng phạm vi chữ của `modals` (đã mở could / have to /
 * would like, story 45), không so sánh, bị động, may / might.
 */

// ---------------------------------------------------------------- s1-t1-w3

/**
 * Từ để hỏi why / how often / how many / how much với do / does (story 44). Không `sides` (như `dont-translate`): bảng chữ
 * Việt tại sao · bao lâu một lần · bao nhiêu. Phạm vi chữ của `present-simple-questions`: không quá khứ, không be + V-ing.
 */
export const QUESTION_WORDS: TenseChoice = {
  id: 'question-words',
  name: 'Hỏi tại sao, bao lâu một lần, bao nhiêu',
  use:
    'Tiếng Việt để “tại sao” ở đầu câu, còn “bao lâu một lần”, “bao nhiêu” thường ở giữa hoặc cuối câu; tiếng Anh luôn ' +
    'đưa từ để hỏi lên đầu, rồi do / does (hoặc am / is / are) + chủ ngữ.',
  viWords: [
    {
      vi: 'tại sao',
      options: [
        {
          en: 'Why + do / does + S + V …?',
          whenVi: 'Hỏi lý do; trả lời bằng Because + câu đầy đủ',
          example: {
            en: 'Why do you study English? — Because I need it for my job.',
            vi: 'Tại sao bạn học tiếng Anh? — Vì tôi cần nó cho công việc.',
          },
        },
        {
          en: 'Why + am / is / are + S …?',
          whenVi: 'Câu có tính từ, nơi chốn (to be): không mượn do / does',
          example: { en: 'Why is she sad? — Because her cat is sick.', vi: 'Tại sao cô ấy buồn? — Vì con mèo của cô ấy bị ốm.' },
        },
      ],
    },
    {
      vi: 'bao lâu một lần',
      options: [
        {
          en: 'How often + do / does + S + V …?',
          whenVi:
            'Hỏi tần suất; trả lời bằng every day, every Sunday hay trạng từ tần suất của viên F18 (always, usually, ' +
            'sometimes, never)',
          example: {
            en: 'How often do you go to the gym? — Every Sunday.',
            vi: 'Bạn đi tập gym bao lâu một lần? — Chủ nhật nào cũng đi.',
          },
        },
        {
          en: 'How often + am / is / are + S …?',
          whenVi: 'Câu có to be',
          example: { en: 'How often is he late? — Never.', vi: 'Anh ấy đi trễ bao lâu một lần? — Không bao giờ.' },
        },
      ],
    },
    {
      vi: 'bao nhiêu',
      options: [
        {
          en: 'How many + danh từ số nhiều + do / does + S + V …?',
          whenVi: 'Hỏi số lượng thứ đếm được',
          example: { en: 'How many brothers do you have? — Two.', vi: 'Bạn có bao nhiêu anh em trai? — Hai.' },
        },
        {
          en: 'How much + danh từ không đếm được + do / does + S + V …?',
          whenVi: 'Hỏi lượng thứ không đếm được (water, money)',
          example: { en: 'How much water do you drink every day?', vi: 'Mỗi ngày bạn uống bao nhiêu nước?' },
        },
        {
          en: 'How much is / are …?',
          whenVi: 'Hỏi giá (viên F14)',
          example: { en: 'How much is this bag?', vi: 'Cái túi này giá bao nhiêu?' },
        },
      ],
    },
  ],
  pairs: [
    {
      a: { en: 'How often do you play tennis? — Every Saturday.', vi: 'Bạn chơi quần vợt bao lâu một lần? — Thứ Bảy nào cũng chơi.' },
      b: { en: 'When do you play tennis? — On Saturdays.', vi: 'Bạn chơi quần vợt khi nào? — Vào các ngày thứ Bảy.' },
      noteVi: 'How often hỏi bao lâu một lần; When hỏi lúc nào.',
    },
    {
      a: { en: 'How many books do you have?', vi: 'Bạn có bao nhiêu quyển sách?' },
      b: { en: 'How much money do you have?', vi: 'Bạn có bao nhiêu tiền?' },
      noteVi: 'books đếm được, số nhiều → many; money không đếm được → much.',
    },
    {
      a: { en: 'Why are you tired? — Because I work late.', vi: 'Tại sao bạn mệt? — Vì tôi làm việc muộn.' },
      b: { en: 'Why do you work late? — Because I have a lot of work.', vi: 'Tại sao bạn làm muộn? — Vì tôi có nhiều việc.' },
      noteVi: 'Có tính từ (tired) thì Why are you…?; có động từ thường (work) thì Why do you…?',
    },
  ],
  formulas: [
    { label: 'Why', text: 'Why + do / does + S + V …?  → Because + S + V.' },
    { label: 'How often', text: 'How often + do / does + S + V …?  → Every day. / Every week. / Sometimes. / Never.' },
    {
      label: 'How many / How much',
      text: 'How many + danh từ số nhiều / How much + danh từ không đếm được + do / does + S + V …?',
    },
  ],
  rules: [
    'Từ để hỏi đứng đầu câu, rồi do / does + chủ ngữ + động từ nguyên mẫu: Why do you…? How often does she…? Câu có am / is / are thì đảo to be: Why is she sad?',
    'Why hỏi lý do, trả lời bằng Because + câu đầy đủ (Because I need it.); câu trả lời ngắn khi nói thì Because… đứng một mình được, còn trong một câu dài thì Because…, rồi câu kết quả, như viên F16. How often hỏi bao lâu một lần, trả lời bằng every day, every Sunday, usually, sometimes, never.',
    'How many + danh từ số nhiều (books, brothers); How much + danh từ không đếm được (water, money). How much is it? là hỏi giá.',
  ],
  // Phần luyện (story 44): 7 câu; chỉ Sân ga (gồm lượng từ F15, liên từ F16) và hiện tại đơn (`present-simple-questions`).
  practice: {
    worked: {
      en: 'Why do you study English? — Because I need it for my job.',
      vi: 'Tại sao bạn học tiếng Anh? — Vì tôi cần nó cho công việc.',
      noteVi: 'Why đứng đầu, rồi do + you + study (nguyên mẫu). Trả lời lý do bằng Because + câu đầy đủ, không chỉ nói Because.',
    },
    faded: {
      en: 'How ___ do you cook? — Every day.',
      answer: 'often',
      vi: 'Bạn nấu ăn bao lâu một lần? — Ngày nào cũng nấu.',
      hintVi: 'Hỏi bao lâu một lần.',
    },
    check: {
      items: [
        {
          id: 'question-words-c1',
          kind: 'choice',
          prompt: 'Why ___ your sister tired? — Because she has a lot of work.',
          options: ['is', 'does', 'do'],
          answer: 0,
          hintVi: 'tired là tính từ: câu có to be.',
          explanationVi:
            'tired là tính từ nên câu dùng to be, đảo is lên trước chủ ngữ: Why is your sister tired? Không mượn does: ' +
            '“Why does your sister tired?” là sai. do đi với I / you / we / they.',
        },
        {
          id: 'question-words-c2',
          kind: 'type',
          prompt: 'How often ___ your father play football? — Every Sunday.',
          answer: 'does',
          hintVi: 'your father = he; play ở dạng nguyên mẫu.',
          explanationVi:
            'Sau How often là do / does + chủ ngữ + động từ nguyên mẫu. your father = he nên mượn does: How often does ' +
            'your father play football?',
        },
        {
          id: 'question-words-c3',
          kind: 'choice',
          prompt: 'How ___ friends does your brother have? — Ten.',
          options: ['many', 'much', 'often'],
          answer: 0,
          hintVi: 'friends đếm được, số nhiều.',
          explanationVi:
            'friends là danh từ đếm được số nhiều nên dùng How many. How much đi với danh từ không đếm được (water, ' +
            'money); How often hỏi bao lâu một lần.',
        },
        {
          id: 'question-words-c4',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Tại sao bạn thích tiếng Anh? (why, like, English)',
          answer: 'Why do you like English?',
          hintVi: 'Why đứng đầu, rồi do + you + like.',
          explanationVi:
            'Why + do + you + like (nguyên mẫu): Why do you like English? “Why you like English?” thiếu do / does: câu hỏi ' +
            'với động từ thường phải mượn do / does.',
        },
        {
          id: 'question-words-c5',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Bạn đọc sách bao lâu một lần? (how often, read books)',
          answer: 'How often do you read books?',
          hintVi: '“bao lâu một lần” = How often, đứng đầu câu.',
          explanationVi:
            'How often đứng đầu, rồi do + you + read: How often do you read books? “How often you read books?” thiếu ' +
            'do / does nên sai.',
        },
        {
          id: 'question-words-c6',
          kind: 'type',
          prompt: 'Đổi sang câu hỏi với How many: She has three cats.',
          answer: 'How many cats does she have?',
          hintVi: 'she → does; có does thì has trở về have.',
          explanationVi:
            'How many + cats đứng đầu, rồi does + she + have (nguyên mẫu): How many cats does she have? Có does thì has ' +
            'đổi về have.',
        },
        {
          id: 'question-words-c7',
          kind: 'choice',
          prompt: '“Vì trời lạnh nên tôi ở nhà.” nói thế nào?',
          options: ['It is cold, so I am at home.', 'Because it is cold, so I am at home.', 'It is cold, because I am at home.'],
          answer: 0,
          hintVi: 'Tiếng Anh chỉ dùng một từ nối: because hoặc so.',
          explanationVi:
            'so đứng trước kết quả: It is cold, so I am at home. Không dùng cả because và so trong một câu (viên F16). ' +
            'Câu thứ ba sai nghĩa: trời lạnh vì tôi ở nhà.',
        },
      ],
      easier: [
        {
          id: 'question-words-e1',
          kind: 'choice',
          prompt: 'Why nghĩa là gì?',
          options: ['tại sao', 'bao lâu một lần', 'bao nhiêu'],
          answer: 0,
          hintVi: 'Câu trả lời của nó mở đầu bằng Because.',
          explanationVi: 'Why = tại sao (hỏi lý do); How often = bao lâu một lần; How many / How much = bao nhiêu.',
        },
        {
          id: 'question-words-e2',
          kind: 'choice',
          prompt: 'How ___ milk does your son drink every day?',
          options: ['much', 'many', 'often'],
          answer: 0,
          hintVi: 'milk không đếm được.',
          explanationVi: 'milk là danh từ không đếm được nên dùng How much. many đi với danh từ số nhiều (books, cats).',
        },
      ],
    },
    apply: {
      promptVi:
        'Hỏi một người bạn 3 câu: một câu Why, một câu How often, một câu How many. Rồi tự trả lời một câu Why bằng Because.',
      sampleEn:
        'Why do you study English? How often do you play sports? How many brothers do you have? I study English because I need it for my job.',
      speak: [
        { id: 'question-words-say-1', text: 'How often do you play football?', vi: 'Bạn chơi bóng đá bao lâu một lần?' },
        {
          id: 'question-words-say-2',
          text: 'I study English because I need it for my job.',
          vi: 'Tôi học tiếng Anh vì tôi cần nó cho công việc.',
        },
      ],
    },
  },
}

// ---------------------------------------------------------------- s1-t2-w1

export const SIMPLE_VS_CONTINUOUS: TenseChoice = {
  id: 'simple-vs-continuous',
  name: 'Đơn hay tiếp diễn?',
  use: 'Tiếng Việt chỉ thêm "đang" hoặc không thêm gì; tiếng Anh bắt buộc chọn một trong hai thì.',
  sides: [
    {
      tenseId: 'present-simple',
      whenVi: 'Thói quen, lịch cố định, sự thật',
      example: { en: 'My father reads the news every morning.', vi: 'Sáng nào bố tôi cũng đọc tin tức.' },
    },
    {
      tenseId: 'present-continuous',
      whenVi: 'Việc đang diễn ra lúc nói, hoặc quanh dạo này',
      example: { en: 'My father is reading a book now.', vi: 'Bây giờ bố tôi đang đọc sách.' },
    },
  ],
  pairs: [
    {
      a: { en: 'She works at a bank.', vi: 'Cô ấy làm ở ngân hàng (nghề của cô ấy).' },
      b: { en: 'She is working at home today.', vi: 'Hôm nay cô ấy làm việc ở nhà.' },
      noteVi: 'Nghề, nơi làm thường ngày → hiện tại đơn (she → works). Hôm nay khác thường → is + V-ing.',
    },
    {
      a: { en: 'I watch TV every evening.', vi: 'Tối nào tôi cũng xem TV.' },
      b: { en: 'I am watching TV now.', vi: 'Bây giờ tôi đang xem TV.' },
      noteVi: 'every evening là thói quen → hiện tại đơn. now là ngay lúc nói → am + V-ing.',
    },
    {
      a: { en: 'Do you cook?', vi: 'Bạn có hay nấu ăn không?' },
      b: { en: 'Are you cooking?', vi: 'Bạn đang nấu à?' },
      noteVi: 'Do you…? hỏi thói quen. Are you …-ing? hỏi việc đang làm lúc này.',
    },
    {
      a: { en: "He doesn't drink coffee.", vi: 'Anh ấy không uống cà phê (không bao giờ uống).' },
      b: { en: "He isn't drinking coffee now. He is drinking tea.", vi: 'Lúc này anh ấy không uống cà phê, anh ấy đang uống trà.' },
      noteVi: "doesn't + nguyên mẫu nói về thói quen (không bao giờ uống). isn't + V-ing chỉ nói về lúc này.",
    },
  ],
  formulas: [
    { label: 'Hiện tại đơn', text: 'S + V / V-s: She works every day.' },
    { label: 'Hiện tại tiếp diễn', text: 'S + am / is / are + V-ing: She is working now.' },
  ],
  rules: [
    'Thói quen, lịch, sự thật (every day, usually, on Sundays) → hiện tại đơn. Đang xảy ra lúc nói (now, right now, Look!) → tiếp diễn.',
    'Nghề, nơi làm thường ngày dùng hiện tại đơn (I work at a bank). Hôm nay khác thường thì dùng tiếp diễn (Today I am working at home).',
    'Động từ trạng thái (know, like, want, need, understand) dùng hiện tại đơn, kể cả khi có now.',
  ],
  // Phần luyện (story 39): 7 câu trộn hai chiều; chỉ Sân ga, hiện tại đơn và tiếp diễn (`outOfScopeWords('present-continuous')`).
  practice: {
    worked: {
      en: 'I usually walk to work. Today I am taking a taxi.',
      vi: 'Tôi thường đi bộ đi làm. Hôm nay tôi đi taxi.',
      noteVi: 'usually → thói quen nên walk (hiện tại đơn). today khác thường → am taking (tiếp diễn). Hai câu liền nhau, hai thì khác nhau.',
      timeline: { kind: 'progress', label: 'Hôm nay khác thường: đang đi taxi' },
    },
    faded: {
      en: 'Look! It ___ (rain).',
      answer: 'is raining',
      vi: 'Nhìn kìa! Trời đang mưa.',
      hintVi: 'Look! là dấu hiệu đang xảy ra lúc nói: is + V-ing.',
    },
    check: {
      items: [
        {
          id: 'simple-vs-continuous-c1',
          kind: 'type',
          prompt: 'She ___ (go) to the gym every Monday.',
          answer: 'goes',
          hintVi: 'every Monday là thói quen. she thêm -s hay -es?',
          explanationVi: 'every Monday = thói quen → hiện tại đơn. she + go thêm -es (tận cùng -o): goes. Không dùng is going cho việc lặp lại hằng tuần.',
        },
        {
          id: 'simple-vs-continuous-c2',
          kind: 'type',
          prompt: 'Be quiet! The baby ___ (sleep).',
          answer: 'is sleeping',
          hintVi: 'Be quiet! = "Im lặng nào!", vì em bé ngủ ngay lúc người nói đang nói.',
          explanationVi: 'Bảo "im lặng" vì em bé đang ngủ ngay lúc nói → tiếp diễn: the baby = it → is + sleeping. "sleeps" là thói quen, không hợp.',
        },
        {
          id: 'simple-vs-continuous-c3',
          kind: 'choice',
          prompt: '___ you usually walk to work?',
          options: ['Do', 'Are', 'Is'],
          answer: 0,
          hintVi: 'usually là thói quen; walk ở dạng nguyên mẫu.',
          explanationVi: 'usually → hiện tại đơn, câu hỏi mượn Do: Do you usually walk…? Với động từ thường như walk, Are / Is cần V-ing (Are you walking?).',
        },
        {
          id: 'simple-vs-continuous-c4',
          kind: 'choice',
          prompt: 'What ___ you doing right now?',
          options: ['are', 'do', 'does'],
          answer: 0,
          hintVi: 'doing là V-ing; right now là ngay lúc này.',
          explanationVi: 'Có doing (V-ing) và right now → tiếp diễn: What are you doing? do / does không đi với V-ing.',
        },
        {
          id: 'simple-vs-continuous-c5',
          kind: 'type',
          prompt: 'I ___ (not / work) today. I am sick.',
          answer: 'am not working',
          hintVi: 'Hôm nay bị ốm nên khác ngày thường. I đi với am.',
          explanationVi: "Hôm nay (today) khác thường vì bị ốm → tiếp diễn: I am not (I'm not) working. Phủ định của thì này là am / is / are + not + V-ing, không dùng don't.",
        },
        {
          id: 'simple-vs-continuous-c6',
          kind: 'choice',
          prompt: 'I ___ your idea now.',
          options: ['understand', 'am understanding', 'understanding'],
          answer: 0,
          hintVi: 'understand là động từ trạng thái.',
          explanationVi: 'understand (hiểu) là động từ trạng thái, không dùng tiếp diễn kể cả khi có now: I understand. "am understanding" là lỗi hay gặp.',
        },
        {
          id: 'simple-vs-continuous-c7',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Chị tôi đi làm bằng xe buýt mỗi ngày. (sister, go to work by bus)',
          answer: 'My sister goes to work by bus every day.',
          accept: ['Every day my sister goes to work by bus.'],
          hintVi: 'mỗi ngày = every day → thói quen. my sister = she.',
          explanationVi: 'Tiếng Việt không có "đang", và "mỗi ngày" là thói quen → hiện tại đơn. my sister = she nên go thêm -es: goes. every day đặt cuối hoặc đầu câu đều được.',
        },
      ],
      easier: [
        {
          id: 'simple-vs-continuous-e1',
          kind: 'choice',
          prompt: 'Look! The kids ___ on the beach.',
          options: ['are playing', 'play', 'plays'],
          answer: 0,
          hintVi: 'Look! = đang xảy ra ngay trước mắt.',
          explanationVi: 'Look! → việc đang xảy ra: the kids = they → are playing. play / plays là thói quen.',
        },
        {
          id: 'simple-vs-continuous-e2',
          kind: 'choice',
          prompt: 'My brother ___ football every Sunday.',
          options: ['plays', 'playing', 'play'],
          answer: 0,
          hintVi: 'every Sunday là thói quen; my brother = he.',
          explanationVi: 'every Sunday → hiện tại đơn. my brother = he nên thêm -s: plays. "playing" thiếu is, "play" thiếu -s.',
        },
      ],
    },
    apply: {
      promptVi: 'Nói hoặc viết 2 câu: một việc bạn làm mỗi ngày, và việc bạn đang làm lúc này.',
      sampleEn: 'I go to work every day. Now I am learning English.',
      speak: [
        {
          id: 'simple-vs-continuous-say-1',
          text: 'I usually cook. Today my sister is cooking.',
          vi: 'Tôi thường nấu ăn. Hôm nay chị tôi đang nấu.',
        },
        {
          id: 'simple-vs-continuous-say-2',
          text: 'She works every day. Now she is resting.',
          vi: 'Ngày nào cô ấy cũng làm việc. Bây giờ cô ấy đang nghỉ.',
        },
      ],
    },
  },
}

// ---------------------------------------------------------------- s1-t2-w2

/**
 * Câu hỏi chủ ngữ Who / What + V-ed so với Who / What + did + S + V (story 44). Không `sides`: bảng chữ Việt ai · cái gì.
 * Phạm vi chữ của `past-simple`: chỉ động từ có quy tắc (call, happen, cook, help, open, clean, visit…), không V2 bất quy tắc.
 */
export const SUBJECT_QUESTIONS: TenseChoice = {
  id: 'subject-questions',
  name: 'Câu hỏi chủ ngữ: Who called? hay Who did you call?',
  use:
    'Tiếng Việt đổi chỗ chữ “ai” (Ai gọi bạn? / Bạn gọi ai?); tiếng Anh xem Who / What là chủ ngữ hay là người, vật ' +
    'nhận việc đó (người được gọi, món được nấu), rồi mới quyết định có mượn did hay không.',
  viWords: [
    {
      vi: 'ai',
      options: [
        {
          en: 'Who + V-ed …?',
          whenVi: '“Ai” là người làm việc đó (chủ ngữ): không mượn did, động từ ở quá khứ',
          example: { en: 'Who called you last night? — My mother.', vi: 'Tối qua ai gọi cho bạn? — Mẹ tôi.' },
        },
        {
          en: 'Who + did + S + V …?',
          whenVi: '“Ai” là người nhận việc đó (bạn gọi ai, bạn giúp ai): mượn did, động từ nguyên mẫu',
          example: { en: 'Who did you call last night? — My mother.', vi: 'Tối qua bạn gọi cho ai? — Mẹ tôi.' },
        },
      ],
    },
    {
      vi: 'cái gì',
      options: [
        {
          en: 'What + V-ed …?',
          whenVi: '“Chuyện gì, cái gì” là chủ ngữ: What happened?',
          example: {
            en: 'What happened yesterday? — The bus was late.',
            vi: 'Hôm qua đã xảy ra chuyện gì? — Xe buýt đến muộn.',
          },
        },
        {
          en: 'What + did + S + V …?',
          whenVi: 'Hỏi người ta đã làm gì: mượn did',
          example: { en: 'What did you cook yesterday? — Fish.', vi: 'Hôm qua bạn nấu món gì? — Cá.' },
        },
      ],
    },
  ],
  pairs: [
    {
      a: { en: 'Who called you?', vi: 'Ai đã gọi cho bạn?' },
      b: { en: 'Who did you call?', vi: 'Bạn đã gọi cho ai?' },
      noteVi: 'Who called you? hỏi người gọi (Who là chủ ngữ). Who did you call? hỏi người được gọi (you là chủ ngữ).',
    },
    {
      a: { en: 'Who cooked dinner? — My father.', vi: 'Ai nấu bữa tối? — Bố tôi.' },
      b: { en: 'What did your father cook? — Fish.', vi: 'Bố bạn đã nấu món gì? — Cá.' },
      noteVi: 'Hỏi người nấu thì Who + V-ed. Hỏi món được nấu thì What + did + S + V.',
    },
    {
      a: { en: 'What happened? — I missed the bus.', vi: 'Đã xảy ra chuyện gì? — Tôi bị lỡ xe buýt.' },
      b: { en: 'What did you do? — I stayed at home.', vi: 'Bạn đã làm gì? — Tôi ở nhà.' },
      noteVi: 'What happened hỏi chuyện xảy ra (What là chủ ngữ). What did you do hỏi bạn đã làm gì.',
    },
    {
      a: { en: 'Who lives here? — My sister.', vi: 'Ai sống ở đây? — Chị tôi.' },
      b: { en: 'Who do you live with? — My sister.', vi: 'Bạn sống với ai? — Chị tôi.' },
      noteVi:
        'Hiện tại cũng vậy: Who + V-s (như he / she) khi Who là chủ ngữ; Who do you … with? khi you là chủ ngữ.',
    },
  ],
  formulas: [
    { label: 'Hỏi chủ ngữ', text: 'Who / What + V-ed …?  Who called you? What happened?' },
    { label: 'Hỏi tân ngữ', text: 'Who / What + did + S + V nguyên mẫu …?  Who did you call?' },
  ],
  rules: [
    'Who / What là chủ ngữ (hỏi ai làm, chuyện gì xảy ra): giữ trật tự câu khẳng định, không mượn did: Who called you? What happened?',
    'Who / What là người, vật nhận việc đó (bạn gọi ai, bạn nấu gì): mượn did + chủ ngữ + động từ nguyên mẫu như câu hỏi Wh- thường: Who did you call? What did you cook?',
    'Hiện tại cũng vậy: Who lives here? (Who + V-s, như he / she) so với Who do you live with?',
  ],
  // Phần luyện (story 44): 7 câu trộn hai chiều; chỉ Sân ga, hiện tại, was / were, -ed và did (`past-simple`).
  practice: {
    worked: {
      en: 'Who called you last night? — My boss.',
      vi: 'Tối qua ai gọi cho bạn? — Sếp tôi.',
      noteVi: 'Hỏi người gọi nên Who là chủ ngữ: Who + called, không có did. Câu trả lời My boss là người gọi.',
    },
    faded: {
      en: 'Who ___ (help) you yesterday? — My brother.',
      answer: 'helped',
      vi: 'Hôm qua ai giúp bạn? — Anh trai tôi.',
      hintVi: 'Who là người giúp (chủ ngữ): không mượn did.',
    },
    check: {
      items: [
        {
          id: 'subject-questions-c1',
          kind: 'choice',
          prompt: 'Who ___ the window? — Lan.',
          options: ['opened', 'did open', 'did you open'],
          answer: 0,
          hintVi: 'Lan là người mở cửa sổ: Who là chủ ngữ.',
          explanationVi:
            'Hỏi người mở (Lan) nên Who là chủ ngữ: Who opened the window? Who là chủ ngữ thì không mượn did, nên ' +
            '“did open” sai; “Who did you open the window?” thừa you, không phải câu đúng.',
        },
        {
          id: 'subject-questions-c2',
          kind: 'choice',
          prompt: 'Who ___ you call last night? — My sister.',
          options: ['did', 'was', 'do'],
          answer: 0,
          hintVi: 'you là người gọi; call ở dạng nguyên mẫu; last night là quá khứ.',
          explanationVi:
            'you là người gọi, Who là người được gọi nên mượn did: Who did you call last night? was không đi với động từ ' +
            'thường nguyên mẫu; do là hiện tại.',
        },
        {
          id: 'subject-questions-c3',
          kind: 'type',
          prompt: 'What ___ (happen) at the office yesterday?',
          answer: 'happened',
          hintVi: 'What (chuyện gì) là chủ ngữ: không mượn did.',
          explanationVi:
            'What là chủ ngữ (chuyện gì xảy ra) nên giữ trật tự câu khẳng định, động từ ở quá khứ: What happened at the ' +
            'office yesterday? Không mượn did.',
        },
        {
          id: 'subject-questions-c4',
          kind: 'type',
          prompt: 'Đổi sang câu hỏi với Who, hỏi ai đã dọn: My mother cleaned the kitchen.',
          answer: 'Who cleaned the kitchen?',
          hintVi: 'Who thay chỗ My mother (người dọn), giữ cleaned.',
          explanationVi:
            'Hỏi người dọn thì Who thay chỗ My mother, giữ nguyên cleaned the kitchen: Who cleaned the kitchen? Who là ' +
            'chủ ngữ nên không mượn did.',
        },
        {
          id: 'subject-questions-c5',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Ai đã gọi cho bạn? (who, call)',
          answer: 'Who called you?',
          hintVi: '“Ai” là người gọi (chủ ngữ): Who + V-ed.',
          explanationVi:
            '“Ai” là người gọi nên Who là chủ ngữ: Who called you? Who là chủ ngữ thì không mượn did, nên “Who did call ' +
            'you?” là sai.',
        },
        {
          id: 'subject-questions-c6',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Bạn đã gọi cho ai? (who, call)',
          answer: 'Who did you call?',
          hintVi: '“Bạn” là người gọi, “ai” là người được gọi: mượn did.',
          explanationVi:
            'you là người gọi, “ai” là người được gọi nên mượn did + you + call (nguyên mẫu): Who did you call? ' +
            '“Who called you?” lại là hỏi ai gọi cho bạn.',
        },
        {
          id: 'subject-questions-c7',
          kind: 'choice',
          prompt: '“Bạn đã nấu món gì?” nói thế nào?',
          options: ['What did you cook?', 'What cooked you?', 'What you cooked?'],
          answer: 0,
          hintVi: 'you là người nấu, “món gì” là thứ được nấu.',
          explanationVi:
            '“món gì” là thứ được nấu, you là chủ ngữ, nên mượn did: What did you cook? “What you cooked?” thiếu did; ' +
            '“What cooked you?” nghĩa là cái gì đã nấu bạn.',
        },
      ],
      easier: [
        {
          id: 'subject-questions-e1',
          kind: 'choice',
          prompt: '“Ai đã giúp bạn?” nói thế nào?',
          options: ['Who helped you?', 'Who did help you?', 'Who you helped?'],
          answer: 0,
          hintVi: '“Ai” là người giúp (chủ ngữ).',
          explanationVi:
            '“Ai” là người giúp nên Who + helped: Who helped you? Who là chủ ngữ thì không mượn did, nên “Who did help ' +
            'you?” sai.',
        },
        {
          id: 'subject-questions-e2',
          kind: 'choice',
          prompt: '“Bạn đã giúp ai?” nói thế nào?',
          options: ['Who did you help?', 'Who helped you?', 'Who you helped?'],
          answer: 0,
          hintVi: '“Bạn” là người giúp, “ai” là người được giúp.',
          explanationVi:
            'you là người giúp, “ai” là người được giúp nên mượn did: Who did you help? “Who helped you?” là hỏi ai giúp ' +
            'bạn; “Who you helped?” thiếu did.',
        },
      ],
    },
    apply: {
      promptVi:
        'Hỏi một người bạn 2 câu về hôm qua: một câu hỏi ai đã làm gì (Who + V-ed), một câu hỏi bạn ấy đã làm gì ' +
        '(What did you…?).',
      sampleEn: 'Who called you yesterday? What did you cook for dinner?',
      speak: [
        { id: 'subject-questions-say-1', text: 'What happened?', vi: 'Đã xảy ra chuyện gì?' },
        { id: 'subject-questions-say-2', text: 'Who did you call yesterday?', vi: 'Hôm qua bạn đã gọi cho ai?' },
      ],
    },
  },
}

// ---------------------------------------------------------------- s1-t3-w2

export const WILL_VS_GOING_TO: TenseChoice = {
  id: 'will-vs-going-to',
  name: 'will hay going to?',
  use: 'Cả hai đều là "sẽ". Chọn theo lúc quyết định: vừa nghĩ ra → will; đã định từ trước hoặc thấy dấu hiệu → going to.',
  sides: [
    {
      tenseId: 'will',
      whenVi: 'Quyết định ngay lúc nói, lời hứa, lời đề nghị giúp, đoán theo ý mình',
      example: { en: "The phone is ringing. I'll answer it.", vi: 'Điện thoại đang reo. Để tôi nghe.' },
    },
    {
      tenseId: 'going-to',
      whenVi: 'Kế hoạch đã định trước khi nói, hoặc dấu hiệu ngay trước mắt',
      example: {
        en: "I'm going to study in Da Nang. I decided last month.",
        vi: 'Tôi sẽ học ở Đà Nẵng. Tôi quyết từ tháng trước rồi.',
      },
    },
  ],
  pairs: [
    {
      a: { en: "OK, I'll buy the bread.", vi: 'Được, để tôi mua bánh mì (vừa nghĩ ra).' },
      b: { en: "I'm going to buy a new phone. I saved money for it.", vi: 'Tôi sẽ mua điện thoại mới. Tôi đã để dành tiền (đã định).' },
      noteVi: 'Vừa nghĩ ra lúc nói → will. Đã định và chuẩn bị từ trước → going to.',
    },
    {
      a: { en: 'It will be hot tomorrow.', vi: 'Mai trời sẽ nóng (tôi đoán).' },
      b: { en: "Look at those black clouds. It's going to rain.", vi: 'Nhìn mấy đám mây đen kìa. Trời sắp mưa rồi.' },
      noteVi: 'Đoán theo ý mình → will. Thấy dấu hiệu ngay trước mắt → going to.',
    },
    {
      a: { en: "I'll call you tonight, I promise.", vi: 'Tối nay tôi sẽ gọi cho bạn, tôi hứa.' },
      b: { en: "I'm going to call my mother tonight. It's her birthday.", vi: 'Tối nay tôi sẽ gọi cho mẹ. Hôm nay sinh nhật mẹ.' },
      noteVi: 'Lời hứa → will. Việc đã định sẵn (sinh nhật mẹ) → going to. Cùng tonight mà khác thì.',
    },
  ],
  formulas: [
    { label: 'will', text: 'S + will + V nguyên mẫu' },
    { label: 'going to', text: 'S + am / is / are + going to + V nguyên mẫu' },
  ],
  rules: [
    'Vừa nghĩ ra lúc nói, hứa, đề nghị giúp → will.',
    'Đã quyết trước khi nói (đã mua vé, đã bàn từ hôm qua), hoặc thấy dấu hiệu trước mắt → am / is / are going to.',
    'tomorrow, next week đi được với cả hai: chữ chỉ thời gian không quyết định, phải nhìn lúc quyết định.',
  ],
  // Phần luyện (story 39): 7 câu trộn hai chiều; không hoàn thành, since / how long, modal, so sánh, bị động.
  practice: {
    worked: {
      en: "I'm going to cook pho tonight. I bought the beef this morning.",
      vi: 'Tối nay tôi sẽ nấu phở. Sáng nay tôi đã mua thịt bò rồi.',
      noteVi: 'Mua thịt từ sáng = kế hoạch có trước → going to. Nếu vừa mở tủ lạnh mới quyết thì nói "OK, I\'ll cook pho."',
      timeline: { kind: 'plan', label: 'Đã định từ sáng, tối nay nấu' },
    },
    faded: {
      en: 'The door is open. — OK, I ___ (close) it.',
      answer: 'will close',
      vi: 'Cửa đang mở. — Được, để tôi đóng.',
      hintVi: 'Vừa nghe xong mới quyết định: will + V nguyên mẫu.',
    },
    check: {
      items: [
        {
          id: 'will-vs-going-to-c1',
          kind: 'choice',
          prompt: 'The phone is ringing. — OK, I ___ answer it.',
          options: ['will', 'am going to', 'going to'],
          answer: 0,
          hintVi: 'Điện thoại vừa reo, trước đó chưa có kế hoạch.',
          explanationVi: 'Quyết định ngay lúc nói (điện thoại vừa reo) → will: I will (I\'ll) answer it. going to là việc đã định trước; "going to" thiếu am.',
        },
        {
          id: 'will-vs-going-to-c2',
          kind: 'type',
          prompt: 'We ___ (move) to a new apartment next month. We signed the papers yesterday.',
          answer: 'are going to move',
          hintVi: 'Đã ký giấy từ hôm qua = kế hoạch đã định. we đi với are.',
          explanationVi: 'Đã ký giấy (signed the papers) → kế hoạch có từ trước → going to: we are going to move. next month đi được với cả hai thì, câu thứ hai mới quyết định.',
        },
        {
          id: 'will-vs-going-to-c3',
          kind: 'choice',
          prompt: 'Look at that car! It ___ hit the tree!',
          options: ['is going to', 'will', 'going to'],
          answer: 0,
          hintVi: 'Thấy dấu hiệu ngay trước mắt.',
          explanationVi: 'Look at that car! = thấy dấu hiệu trước mắt → is going to. will là đoán theo ý mình; "going to" thiếu is.',
        },
        {
          id: 'will-vs-going-to-c4',
          kind: 'type',
          prompt: "I'm thirsty. — Wait, I ___ (get) you a glass of water.",
          answer: 'will get',
          hintVi: 'Nghe bạn khát mới đề nghị giúp.',
          explanationVi: 'Đề nghị giúp, vừa nghĩ ra lúc nói → will + V nguyên mẫu: I will (I\'ll) get. Không có kế hoạch từ trước nên không dùng going to.',
        },
        {
          id: 'will-vs-going-to-c5',
          kind: 'choice',
          prompt: 'I promise I ___ be on time tomorrow.',
          options: ['will', 'am going to', 'going to'],
          answer: 0,
          hintVi: 'I promise = tôi hứa.',
          explanationVi: 'Lời hứa → will: I promise I will (I\'ll) be on time. tomorrow đi được với cả hai thì, chữ promise mới quyết định. "going to" còn thiếu am.',
        },
        {
          id: 'will-vs-going-to-c6',
          kind: 'type',
          prompt: 'We ___ (not / go) to the beach this weekend. We decided yesterday.',
          answer: "aren't going to go",
          hintVi: 'Đã quyết từ hôm qua = đã định. we đi với are; phủ định: are + not + going to.',
          explanationVi: "Đã quyết từ hôm qua, trước lúc nói → going to. Phủ định: we aren't (are not) going to go. won't go hợp với quyết định vừa nghĩ ra lúc nói.",
        },
        {
          id: 'will-vs-going-to-c7',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Tháng sau tôi sẽ mua xe máy mới, tôi đã định từ trước. (buy a new motorbike)',
          answer: 'I am going to buy a new motorbike next month.',
          accept: ['Next month I am going to buy a new motorbike.'],
          hintVi: '"đã định từ trước" → going to. Tháng sau = next month.',
          explanationVi: 'Chữ "sẽ" không quyết định thì; "đã định từ trước" mới quyết định → I am (I\'m) going to buy. Gõ will buy là dịch theo chữ "sẽ". next month đặt cuối hoặc đầu câu đều được.',
        },
      ],
      easier: [
        {
          id: 'will-vs-going-to-e1',
          kind: 'choice',
          prompt: "I'm cold. — I ___ close the window for you.",
          options: ['will', 'will to', 'wills'],
          answer: 0,
          hintVi: 'Sau will là động từ nguyên mẫu, không có to, không thêm -s.',
          explanationVi: 'Đề nghị giúp → will + V nguyên mẫu: I will close. Không có "will to", will không thêm -s.',
        },
        {
          id: 'will-vs-going-to-e2',
          kind: 'choice',
          prompt: 'Look at the sky! It ___ rain.',
          options: ['is going to', 'going to', 'is go to'],
          answer: 0,
          hintVi: 'Cần đủ is + going to + V.',
          explanationVi: 'Thấy dấu hiệu → going to, cần đủ ba phần: it is going to rain. "going to" thiếu is, "is go to" thiếu -ing.',
        },
      ],
    },
    apply: {
      promptVi: 'Nói 2 câu: một kế hoạch đã định cho cuối tuần (going to) và một lời hứa với bạn (will).',
      sampleEn: "I'm going to visit my parents this weekend. I'll call you tonight.",
      speak: [
        { id: 'will-vs-going-to-say-1', text: "I'm going to clean my room this weekend.", vi: 'Cuối tuần này tôi sẽ dọn phòng.' },
        { id: 'will-vs-going-to-say-2', text: "OK, I'll help you.", vi: 'Được, để tôi giúp bạn.' },
      ],
    },
  },
}

// ---------------------------------------------------------------- s1-t3-w4

export const DONT_TRANSLATE: TenseChoice = {
  id: 'dont-translate',
  name: 'Đừng dịch từng chữ: đã · sẽ · chưa',
  use: 'Chữ Việt không quyết định thì. Nhìn mốc thời gian và ý câu rồi mới chọn.',
  viWords: [
    {
      vi: 'đã',
      options: [
        {
          en: 'V2',
          whenVi: 'Có mốc đã xong (hôm qua, năm ngoái, … trước). Câu Việt không có "đã" mà có mốc quá khứ cũng dùng V2',
          example: { en: 'I met him last year.', vi: 'Tôi đã gặp anh ấy năm ngoái.' },
        },
        {
          en: 'have / has + V3',
          whenVi: 'Không nói lúc nào: trải nghiệm, việc vừa xong',
          example: { en: 'I have been to Hue twice.', vi: 'Tôi đã đến Huế hai lần.' },
        },
      ],
    },
    {
      vi: 'sẽ',
      options: [
        {
          en: 'will',
          whenVi: 'Quyết định ngay lúc nói, lời hứa, đoán',
          example: { en: "I'll help you.", vi: 'Tôi sẽ giúp bạn.' },
        },
        {
          en: 'am / is / are going to',
          whenVi: 'Kế hoạch đã định',
          example: { en: "We're going to visit our grandmother this weekend.", vi: 'Cuối tuần này chúng tôi sẽ thăm bà.' },
        },
      ],
    },
    {
      vi: 'chưa',
      options: [
        {
          en: "Have you … yet? / haven't … yet",
          whenVi: 'Hỏi hay nói tính tới bây giờ',
          example: { en: 'Have you had lunch yet?', vi: 'Bạn ăn trưa chưa?' },
        },
        {
          en: 'Did you …?',
          whenVi: 'Có mốc đã xong',
          example: { en: 'Did you call him yesterday?', vi: 'Hôm qua bạn gọi cho anh ấy chưa?' },
        },
        {
          en: 'have never + V3',
          whenVi: 'chưa bao giờ',
          example: { en: 'I have never eaten durian.', vi: 'Tôi chưa bao giờ ăn sầu riêng.' },
        },
      ],
    },
  ],
  pairs: [
    {
      a: { en: 'I finished my report yesterday.', vi: 'Hôm qua tôi đã làm xong báo cáo.' },
      b: { en: 'I have finished my report.', vi: 'Tôi đã làm xong báo cáo (giờ nộp được rồi).' },
      noteVi: 'Cùng "đã xong": có mốc đã xong (yesterday) → V2; không có mốc, tính tới giờ → have / has + V3.',
    },
    {
      a: { en: 'Did you see the email this morning?', vi: 'Sáng nay bạn xem email chưa?' },
      b: { en: 'Have you seen the email yet?', vi: 'Bạn xem email chưa?' },
      noteVi: 'Cùng chữ "chưa": hỏi về một lúc đã xong (sáng nay đã qua) → Did you…? Hỏi tính tới bây giờ, có yet → Have you … yet?',
    },
  ],
  formulas: [
    { label: 'Quá khứ đơn', text: 'S + V2 + mốc đã xong' },
    { label: 'Hoàn thành', text: 'S + have / has (+ never) + V3. Hỏi: Have you ever + V3? / Have you + V3 … yet?' },
  ],
  rules: [
    'đã + mốc đã xong → V2; đã không mốc, nói trải nghiệm hay việc vừa xong tính tới giờ → have / has + V3.',
    'sẽ → will hoặc going to, chọn theo lúc quyết định (khối will hay going to?).',
    'chưa? hỏi tới giờ → Have … yet?; có mốc đã xong → Did …?; chưa bao giờ → have never + V3.',
  ],
  // Phần luyện (story 39): 6 câu dịch Việt → Anh; không modal, so sánh, bị động.
  practice: {
    worked: {
      en: 'I visited Hue last year.',
      vi: 'Tôi đã đến Huế năm ngoái.',
      noteVi: 'Có last year (mốc đã xong) nên dùng V2. Kể trải nghiệm, không có mốc ("Tôi đã đến Huế rồi") thì là I have visited Hue.',
      timeline: { kind: 'past-point', label: 'Năm ngoái: một lúc đã xong' },
    },
    faded: {
      en: 'I ___ (not / finish) my homework yet.',
      answer: "haven't finished",
      vi: 'Tôi chưa làm xong bài tập.',
      hintVi: 'yet = tính tới bây giờ: haven\'t + V3.',
    },
    check: {
      items: [
        {
          id: 'dont-translate-c1',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Tôi đã gặp cô ấy năm ngoái. (meet)',
          answer: 'I met her last year.',
          accept: ['Last year I met her.'],
          hintVi: 'Có mốc đã xong (năm ngoái): V2 của meet.',
          explanationVi: 'Chữ "đã" không bắt buộc have. Có mốc đã xong (last year) → quá khứ đơn: met. "I have met her last year" sai vì hoàn thành không đi với mốc đã xong.',
        },
        {
          id: 'dont-translate-c2',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Tôi đã đến Đà Lạt hai lần. (been to)',
          answer: 'I have been to Da Lat twice.',
          hintVi: 'Không nói lúc nào, chỉ nói số lần (trải nghiệm): have + V3.',
          explanationVi: 'Không có mốc, kể trải nghiệm tới giờ (hai lần) → have + V3: I have (I\'ve) been to Da Lat twice. been to = đã đến rồi về; gone to = đã đi và còn ở đó. Người Mỹ cũng nói "I went to Da Lat twice", nhưng kể trải nghiệm tính tới giờ thì nên dùng have been.',
        },
        {
          id: 'dont-translate-c3',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Hôm qua tôi đi làm muộn. (go to work late)',
          answer: 'I went to work late yesterday.',
          accept: ['Yesterday I went to work late.'],
          hintVi: 'Câu Việt không có "đã", nhưng có hôm qua.',
          explanationVi: 'Tiếng Việt không có "đã" nhưng có mốc quá khứ (yesterday) → vẫn phải dùng V2: went. "I go to work late yesterday" là dịch theo chữ.',
        },
        {
          id: 'dont-translate-c4',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Tôi sẽ giúp bạn. (lời hứa: help)',
          answer: 'I will help you.',
          hintVi: 'Lời hứa → will + V nguyên mẫu.',
          explanationVi: 'Đây là lời hứa, vừa nói ra → will: I will (I\'ll) help you. Không dịch "sẽ" thành going to khi chưa có kế hoạch từ trước.',
        },
        {
          id: 'dont-translate-c5',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Cuối tuần này chúng tôi sẽ thăm bà, đã định rồi. (visit our grandmother)',
          answer: 'We are going to visit our grandmother this weekend.',
          accept: ['This weekend we are going to visit our grandmother.'],
          hintVi: '"đã định rồi" → going to. we đi với are.',
          explanationVi: 'Cùng chữ "sẽ" nhưng là kế hoạch đã định → we are (we\'re) going to visit. Gõ will visit là dịch theo chữ "sẽ".',
        },
        {
          id: 'dont-translate-c6',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Bạn ăn trưa chưa? (have lunch, yet)',
          answer: 'Have you had lunch yet?',
          hintVi: 'Không có mốc, hỏi tính tới bây giờ: Have you + V3 … yet?',
          explanationVi: 'Không có mốc, hỏi tính tới bây giờ thì dùng Have you … yet? (have → had là V3). Người Mỹ cũng hay hỏi "Did you have lunch?", nhưng ở đây (và trong sách, TOEIC) nên dùng Have you … yet?; Did you…? hợp nhất khi có mốc như yesterday.',
        },
      ],
      easier: [
        {
          id: 'dont-translate-e1',
          kind: 'choice',
          prompt: 'Tôi chưa bao giờ ăn sầu riêng. → I ___ eaten durian.',
          options: ['have never', 'never', "didn't"],
          answer: 0,
          hintVi: 'eaten là V3, cần have đứng trước.',
          explanationVi: 'chưa bao giờ = have never + V3: I have never eaten. "never eaten" thiếu have; didn\'t đi với V nguyên mẫu (eat), không đi với eaten.',
        },
        {
          id: 'dont-translate-e2',
          kind: 'choice',
          prompt: 'Hôm qua tôi gặp Nam. → I ___ Nam yesterday.',
          options: ['met', 'have met', 'meet'],
          answer: 0,
          hintVi: 'Có yesterday (mốc đã xong).',
          explanationVi: 'Có mốc đã xong (yesterday) → V2: met. have met không đi với yesterday; meet là hiện tại.',
        },
      ],
    },
    apply: {
      promptVi: 'Nói 3 câu về bạn: một việc đã làm hôm qua, một trải nghiệm (have / has + V3), một kế hoạch (going to).',
      sampleEn: "Yesterday I cooked dinner. I have visited Ha Long Bay. I'm going to see my friends this weekend.",
      speak: [
        { id: 'dont-translate-say-1', text: 'I watched a movie yesterday.', vi: 'Hôm qua tôi xem một bộ phim.' },
        { id: 'dont-translate-say-2', text: 'I have never been to Japan.', vi: 'Tôi chưa bao giờ đến Nhật Bản.' },
      ],
    },
  },
}

// ---------------------------------------------------------------- s1-t4-w1

/**
 * have to, could, would like (story 45). Không `sides` (như `dont-translate`): bảng chữ Việt phải · không cần · làm được ·
 * … được không? · muốn. Phạm vi chữ của `modals` (đã mở could / have to / would like); không may, might, than, so sánh,
 * bị động, không be + tính từ -ed.
 */
export const HAVE_TO_COULD_WOULD_LIKE: TenseChoice = {
  id: 'have-to-could-would-like',
  name: 'Phải, không cần, được không, muốn: have to, could, would like',
  use:
    'Tiếng Việt dùng “phải”, “được”, “muốn” cho mọi trường hợp; tiếng Anh chọn từ theo nghĩa: luật hay hoàn cảnh ' +
    '(must / have to), cấm hay không cần (mustn\'t / don\'t have to), bây giờ hay ngày trước (can / could), nói thẳng ' +
    'hay lịch sự (want / would like).',
  viWords: [
    {
      vi: 'phải',
      options: [
        {
          en: 'must',
          whenVi: 'Luật, biển báo, hoặc chính mình thấy rất cần',
          example: { en: 'You must stop at a red light.', vi: 'Đèn đỏ thì bạn phải dừng lại.' },
        },
        {
          en: 'have to / has to',
          whenVi: 'Việc bắt buộc do hoàn cảnh: công việc, lịch học, giờ tàu xe',
          example: { en: 'My sister has to take the bus to work.', vi: 'Chị tôi phải đi xe buýt đi làm.' },
        },
      ],
    },
    {
      vi: 'không cần',
      options: [
        {
          en: "I don't have to · She doesn't have to",
          whenVi: 'Không cần làm; muốn làm vẫn được',
          example: {
            en: "You don't have to bring food. We have a lot.",
            vi: 'Bạn không cần mang đồ ăn. Chúng tôi có nhiều rồi.',
          },
        },
        {
          en: "mustn't",
          whenVi: 'Không được làm (cấm); đừng nhầm với không cần',
          example: { en: "You mustn't take photos in the museum.", vi: 'Bạn không được chụp ảnh trong bảo tàng.' },
        },
      ],
    },
    {
      vi: 'làm được',
      options: [
        {
          en: "can / can't",
          whenVi: 'Bây giờ, hoặc nói chung (không phải quá khứ)',
          example: { en: 'My son can swim now.', vi: 'Bây giờ con trai tôi bơi được.' },
        },
        {
          en: "could / couldn't",
          whenVi:
            "Ngày trước, trong quá khứ (năm năm trước, hồi nhỏ). Một lần cụ thể (hôm qua) thì chỉ dùng couldn't; làm " +
            'được một lần thì dùng V2: I finished the report.',
          example: { en: "I couldn't swim five years ago.", vi: 'Năm năm trước tôi không bơi được.' },
        },
      ],
    },
    {
      vi: '… được không?',
      options: [
        {
          en: 'Can I …? / Can you …?',
          whenVi: 'Với bạn bè, người nhà',
          example: { en: 'Can you pass me the salt?', vi: 'Đưa mình lọ muối được không?' },
        },
        {
          en: 'Could I …? / Could you …?',
          whenVi: 'Lịch sự hơn: với người lạ, sếp, khách',
          example: { en: 'Could you help me with my bag, please?', vi: 'Anh giúp tôi xách cái túi được không ạ?' },
        },
      ],
    },
    {
      vi: 'muốn',
      options: [
        {
          en: 'want',
          whenVi: 'Nói thẳng, với người thân',
          example: { en: 'I want a new phone.', vi: 'Tôi muốn một cái điện thoại mới.' },
        },
        {
          en: "would like ('d like)",
          whenVi: 'Lịch sự: gọi món, mua hàng; mời: Would you like …?',
          example: { en: "I'd like a table for two, please.", vi: 'Cho tôi một bàn hai người.' },
        },
      ],
    },
  ],
  pairs: [
    {
      a: { en: "You mustn't come to the meeting.", vi: 'Bạn không được đến buổi họp.' },
      b: { en: "You don't have to come to the meeting.", vi: 'Bạn không cần đến buổi họp.' },
      noteVi: "mustn't: cấm, không được đến. don't have to: không cần đến, muốn đến vẫn được.",
    },
    {
      a: { en: "I can't find my keys.", vi: 'Tôi không tìm thấy chìa khoá.' },
      b: { en: "I couldn't find my keys yesterday.", vi: 'Hôm qua tôi không tìm thấy chìa khoá.' },
      noteVi: "can't nói bây giờ; couldn't nói trong quá khứ (yesterday).",
    },
    {
      a: { en: 'Can you open the door?', vi: 'Mở cửa giúp mình được không?' },
      b: { en: 'Could you open the door, please?', vi: 'Anh mở cửa giúp tôi được không ạ?' },
      noteVi: 'Cả hai đều là nhờ; Could you …, please? lịch sự hơn, hợp với người lạ, sếp.',
    },
    {
      a: { en: 'I want a sandwich.', vi: 'Tôi muốn một cái bánh mì kẹp.' },
      b: { en: "I'd like a sandwich, please.", vi: 'Cho tôi một cái bánh mì kẹp.' },
      noteVi: "Cùng nghĩa muốn; gọi món thì I'd like … lịch sự hơn, I want … nghe hơi cộc.",
    },
  ],
  formulas: [
    {
      label: 'have to',
      text:
        "I / you / we / they have to + V · he / she / it has to + V. Phủ định: don't / doesn't have to + V. Câu hỏi: " +
        'Do / Does + S + have to + V …?',
    },
    {
      label: 'could',
      text: "could / couldn't + V nguyên mẫu: I couldn't find my keys yesterday. Nhờ lịch sự: Could you + V …, please?",
    },
    {
      label: 'would like',
      text: "would like ('d like) + danh từ / to + V: I'd like a coffee. I'd like to go home. Mời: Would you like …? — Yes, please.",
    },
  ],
  rules: [
    'have to là động từ thường: he / she / it dùng has to; phủ định và câu hỏi mượn do / does: She doesn\'t have to work. ' +
      'Do you have to work? (không nói Has she to…?, She hasn\'t to…).',
    "mustn't = cấm, không được làm. don't have to = không cần làm, muốn làm vẫn được. Biển báo, luật dùng mustn't; việc " +
      "không bắt buộc dùng don't have to.",
    "could là quá khứ của can (I couldn't swim five years ago) và là cách nhờ, xin phép lịch sự hơn can (Could you…? " +
      'Could I…?). Làm được một lần cụ thể trong quá khứ thì dùng V2 (Yesterday I finished the report), không dùng could. ' +
      "would like = want nhưng lịch sự (I'd like…); mời thì hỏi Would you like…?, trả lời Yes, please. / No, thank you.",
  ],
  // Phần luyện (story 45): 7 câu trộn have to / don't have to, could / couldn't, would like; phạm vi chữ của `modals`.
  // Không chuỗi nào (kể cả đáp án điền, lựa chọn) mở đầu bằng don't: chỗ trống gồm cả chủ ngữ (We don't have to, You…).
  practice: {
    worked: {
      en: "I have to work on Saturday, so I can't come to your party.",
      vi: 'Thứ Bảy tôi phải đi làm, nên tôi không đến bữa tiệc của bạn được.',
      noteVi:
        'Việc bắt buộc do công việc → have to + V nguyên mẫu (have to work). Chủ ngữ I nên dùng have, không phải has.',
    },
    faded: {
      en: '___ (we / not / have to) wear a uniform at school.',
      answer: "We don't have to",
      vi: 'Ở trường chúng tôi không cần mặc đồng phục.',
      hintVi: "Không cần → don't have to (mượn do, không nói haven't to).",
    },
    check: {
      items: [
        {
          id: 'have-to-could-would-like-c1',
          kind: 'type',
          prompt: 'My mother ___ (have to) get up at five every day.',
          answer: 'has to',
          hintVi: 'my mother là một người (như she).',
          explanationVi:
            'my mother = she → has to: My mother has to get up at five every day. have to là động từ thường, nên he / ' +
            'she / it dùng has to (như have → has).',
        },
        {
          id: 'have-to-could-would-like-c2',
          kind: 'choice',
          prompt: 'We have a lot of food. ___ bring any.',
          options: ["You don't have to", "You mustn't", "You doesn't have to"],
          answer: 0,
          hintVi: 'Đồ ăn có nhiều rồi: không cần mang, mang thêm cũng không sao.',
          explanationVi:
            "mustn't là cấm; không cần thì dùng don't have to: You don't have to bring any. Chủ ngữ you nên dùng don't, " +
            "không phải doesn't.",
        },
        {
          id: 'have-to-could-would-like-c3',
          kind: 'type',
          prompt: 'Đổi sang câu hỏi: He has to work on Sunday.',
          answer: 'Does he have to work on Sunday?',
          hintVi: 'Mượn Does đầu câu, has to trở về have to.',
          explanationVi:
            'have to mượn does khi hỏi: Does he have to work on Sunday? Có Does rồi thì has về have. Không nói ' +
            '“Has he to work on Sunday?”.',
        },
        {
          id: 'have-to-could-would-like-c4',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Tối qua tôi không ngủ được. (sleep, last night)',
          answer: "I couldn't sleep last night.",
          accept: ["Last night I couldn't sleep."],
          hintVi: '“không … được” trong quá khứ (tối qua).',
          explanationVi:
            "Tối qua đã qua → quá khứ → couldn't + V nguyên mẫu: I couldn't (could not) sleep last night. “I can't sleep " +
            'last night” dùng can\'t là bây giờ, không hợp với last night.',
        },
        {
          id: 'have-to-could-would-like-c5',
          kind: 'choice',
          prompt: 'Excuse me. ___ you tell me the way to the station, please?',
          options: ['Could', 'Do', 'Are'],
          answer: 0,
          hintVi: 'Nhờ người lạ chỉ đường, có please: cách nhờ lịch sự.',
          explanationVi:
            'Nhờ người lạ thường dùng Could you + V nguyên mẫu …, please? (lịch sự hơn Can you …): Could you tell me the ' +
            'way to the station? ' +
            '“Do you tell me…” là hỏi thói quen; Are không đi với động từ nguyên mẫu tell.',
        },
        {
          id: 'have-to-could-would-like-c6',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Cho tôi một cốc trà. (would like, a cup of tea, please)',
          answer: 'I would like a cup of tea, please.',
          accept: ["I'd like a cup of tea, please."],
          hintVi: 'Gọi món lịch sự: I would like (I\'d like) + danh từ.',
          explanationVi:
            "“I want a cup of tea” cùng nghĩa, nhưng đề yêu cầu would like (lịch sự): I would like (I'd like) a cup of " +
            'tea, please. Gọi món mà nói I want … nghe hơi cộc.',
        },
        {
          id: 'have-to-could-would-like-c7',
          kind: 'type',
          prompt: 'Two years ago, my son ___ (can / not / read).',
          answer: "couldn't read",
          hintVi: 'Two years ago là quá khứ: quá khứ của can.',
          explanationVi:
            "Two years ago là quá khứ, nên can't đổi thành couldn't (could not) + V nguyên mẫu: my son couldn't read. " +
            "Không thêm -ed cho read, không mượn didn't.",
        },
      ],
      easier: [
        {
          id: 'have-to-could-would-like-e1',
          kind: 'choice',
          prompt: 'She ___ wear a uniform at work.',
          options: ['has to', 'have to', 'must to'],
          answer: 0,
          hintVi: 'Chủ ngữ she.',
          explanationVi: 'she → has to + V nguyên mẫu: She has to wear a uniform. must không đi với to (must wear).',
        },
        {
          id: 'have-to-could-would-like-e2',
          kind: 'choice',
          prompt: '___ some tea? — Yes, please.',
          options: ['Would you like', 'Do you like', 'Are you like'],
          answer: 0,
          hintVi: 'Câu trả lời Yes, please. là nhận lời mời.',
          explanationVi:
            'Do you like tea? hỏi sở thích; mời thì Would you like…?: Would you like some tea? — Yes, please. “Are you ' +
            'like” sai vì are không đi với động từ like.',
        },
      ],
    },
    apply: {
      promptVi:
        "Nói 2 câu: một việc bạn phải làm mỗi tuần (have to / has to) và gọi một đồ uống thật lịch sự (I'd like …, please).",
      sampleEn: "I have to clean my room every Saturday. I'd like a glass of orange juice, please.",
      speak: [
        { id: 'have-to-could-would-like-say-1', text: 'I have to get up early tomorrow.', vi: 'Mai tôi phải dậy sớm.' },
        { id: 'have-to-could-would-like-say-2', text: 'Could you help me, please?', vi: 'Bạn giúp tôi được không ạ?' },
        { id: 'have-to-could-would-like-say-3', text: "I'd like two tickets, please.", vi: 'Cho tôi hai vé.' },
      ],
    },
  },
}
