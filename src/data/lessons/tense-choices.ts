import type { TenseChoice } from './types'

/**
 * Khối "Chọn thì" (story 39): đặt hai thì cạnh nhau, hoặc chỉ cách nói tiếng Anh của chữ Việt đã / sẽ / chưa. Tự soạn.
 * Phần luyện chạy bằng trình phát của thì (`TensePractice`): sai thì giải thích và làm lại, không ghi Sổ lỗi.
 * Chỉ import kiểu (không import file thì, tránh vòng); side trỏ thì bằng `tenseId`, `choiceSides` tra Tense lúc vẽ.
 * Chữ tiếng Anh chỉ dùng kiến thức đã dạy tới bài chứa khối: không some / any / many / much / because / so, không
 * "Don't + V"; khối s1-t2-w1 nằm trong phạm vi hiện tại tiếp diễn (`outOfScopeWords`), khối s1-t3-w2 / s1-t3-w4 không có
 * dấu hiệu của bài dạy sau nó (hoàn thành, since / how long, modal, so sánh, bị động).
 */

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
