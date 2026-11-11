import { IRREGULAR_VERBS } from './irregular-verbs'
import type { DialogueLine, GrammarContent, Tense } from './types'

/**
 * Các thì / chủ điểm tháng T2–T4 (story 10). Giải thích, ví dụ, lỗi hay mắc tự soạn.
 * Câu thoại thật: lúc soạn không tải được transcript VOA (mạng chặn), nên theo spec dùng link YouGlish
 * tìm đúng cụm để nghe trong video thật, không bịa câu VOA.
 */

const yg = (phrase: string): DialogueLine => ({
  kind: 'youglish',
  phrase,
  sourceUrl: `https://youglish.com/pronounce/${encodeURIComponent(phrase)}/english/us`,
})

// ---------------------------------------------------------------- T2

export const PRESENT_CONTINUOUS: Tense = {
  id: 'present-continuous',
  name: 'Hiện tại tiếp diễn',
  use: 'Việc đang diễn ra ngay lúc nói, hoặc quanh khoảng thời gian này (tuần này, dạo này).',
  timeline: { kind: 'progress', label: 'Đang diễn ra quanh lúc nói' },
  formulas: [
    { label: 'Khẳng định', text: 'S + am / is / are + V-ing: I am working. She is cooking.' },
    { label: 'Phủ định', text: "S + am / is / are + not + V-ing: He isn't sleeping." },
    { label: 'Câu hỏi', text: 'Am / Is / Are + S + V-ing …?  What are you doing?' },
  ],
  rules: [
    'Luôn cần đủ hai phần: am / is / are + V-ing. Thiếu to be ("I working") hoặc thiếu -ing ("I am work") đều sai.',
    'Thêm -ing: bỏ e câm (make → making); ie → ying (lie → lying). Gấp đôi phụ âm cuối khi từ một âm tiết tận cùng 1 chữ nguyên âm (a, e, i, o, u) + 1 chữ phụ âm (run → running, sit → sitting), hai chữ nguyên âm thì không (eat → eating, rain → raining). Từ hai âm tiết có đuôi như vậy: nhấn âm đầu thì không (visit → visiting, listen → listening), nhấn âm cuối thì có (begin → beginning). Không gấp đôi w, x, y (snow → snowing, fix → fixing, play → playing).',
    'Động từ chỉ trạng thái (know, like, want, need, understand) thường không dùng tiếp diễn: I know (không nói I am knowing).',
  ],
  examples: [
    { en: 'I am reading a book now.', vi: 'Bây giờ tôi đang đọc sách.' },
    { en: 'She is talking on the phone.', vi: 'Cô ấy đang nói chuyện điện thoại.' },
    { en: "They aren't working today.", vi: 'Hôm nay họ không làm việc.' },
    { en: 'Are you watching TV? — No, I am not.', vi: 'Bạn đang xem TV à? — Không.' },
    { en: 'What is he doing?', vi: 'Anh ấy đang làm gì vậy?' },
    { en: 'I am learning English this year.', vi: 'Năm nay tôi đang học tiếng Anh.' },
  ],
  mistakes: [
    { wrong: 'I working now.', right: 'I am working now.', why: 'Tiếng Việt chỉ cần "đang"; tiếng Anh bắt buộc có am / is / are trước V-ing.' },
    { wrong: 'She is cook dinner.', right: 'She is cooking dinner.', why: 'Sau am / is / are phải là V-ing, không phải động từ nguyên mẫu.' },
    { wrong: 'I am knowing him.', right: 'I know him.', why: 'know là động từ trạng thái, không dùng tiếp diễn.' },
  ],
  dialogues: [yg('what are you doing'), yg("I'm working on")],
  spellId: 'accio',
  // Phần luyện có bậc (story 35): chỉ dùng Sân ga F01–F18, hiện tại đơn và chính thì này; đề không trùng đề quiz s1-t2-w1.
  practice: {
    worked: {
      en: 'She is cooking dinner now.',
      vi: 'Bây giờ cô ấy đang nấu bữa tối.',
      noteVi: 'Cần đủ hai phần: is (vì she) + cooking (V-ing). Tiếng Việt chỉ cần "đang", tiếng Anh bắt buộc cả hai.',
      timeline: { kind: 'progress', label: 'Đang nấu ngay lúc nói' },
    },
    faded: {
      en: 'They ___ (play) football now.',
      answer: 'are playing',
      vi: 'Bây giờ họ đang chơi bóng đá.',
      hintVi: 'they đi với are; play thêm -ing.',
    },
    check: {
      items: [
        {
          id: 'present-continuous-c1',
          kind: 'type',
          prompt: 'I ___ (read) a book now.',
          answer: 'am reading',
          hintVi: 'I đi với am; read thêm -ing.',
          explanationVi: 'Việc đang làm lúc này: I + am + V-ing. Cần đủ cả am và reading, thiếu một phần là sai.',
        },
        {
          id: 'present-continuous-c2',
          kind: 'choice',
          prompt: '___ he sleeping?',
          options: ['Is', 'Does', 'Are'],
          answer: 0,
          hintVi: 'Câu hỏi tiếp diễn đảo am / is / are lên đầu. he đi với gì?',
          explanationVi: 'he đi với is, nên hỏi Is he sleeping? Không dùng Does với V-ing (Does chỉ dùng cho hiện tại đơn).',
        },
        {
          id: 'present-continuous-c3',
          kind: 'type',
          prompt: 'She ___ (not / work) today.',
          answer: "isn't working",
          hintVi: "Phủ định: is + not (isn't) + V-ing.",
          explanationVi: "Phủ định của thì này là am / is / are + not + V-ing: She isn't (is not) working. Không dùng doesn't với V-ing.",
        },
        {
          id: 'present-continuous-c4',
          kind: 'type',
          prompt: 'Đổi sang câu hỏi: You are listening to music.',
          answer: 'Are you listening to music?',
          hintVi: 'Chỉ cần đưa are lên trước you, phần còn lại giữ nguyên.',
          explanationVi: 'Câu hỏi tiếp diễn: Are + you + V-ing …? Không thêm Do, không đổi listening.',
        },
        {
          id: 'present-continuous-c5',
          kind: 'type',
          prompt: 'We ___ (sit) in the garden.',
          answer: 'are sitting',
          hintVi: 'sit là từ một âm tiết, tận cùng 1 nguyên âm + 1 phụ âm.',
          explanationVi: 'we đi với are. sit tận cùng i + t (1 nguyên âm + 1 phụ âm) nên gấp đôi t rồi thêm -ing: sitting.',
        },
        {
          id: 'present-continuous-c6',
          kind: 'type',
          prompt: 'Are they working now? — No, they ___.',
          answer: "aren't",
          hintVi: 'Trả lời ngắn dùng lại are, không lặp lại working.',
          explanationVi: "Hỏi bằng Are thì trả lời ngắn cũng dùng are: No, they aren't (are not). Không trả lời bằng don't.",
        },
      ],
      easier: [
        {
          id: 'present-continuous-e1',
          kind: 'choice',
          prompt: 'I ___ watching TV.',
          options: ['am', 'is', 'are'],
          answer: 0,
          hintVi: 'I luôn đi với am.',
          explanationVi: 'I đi với am: I am watching TV. is dùng cho he / she / it, are cho you / we / they.',
        },
        {
          id: 'present-continuous-e2',
          kind: 'choice',
          prompt: 'She is ___ now.',
          options: ['cooking', 'cook', 'cooks'],
          answer: 0,
          hintVi: 'Sau is của thì tiếp diễn là V-ing.',
          explanationVi: 'Đã có is thì động từ phải thêm -ing: She is cooking. "She is cook" thiếu -ing.',
        },
      ],
    },
    apply: {
      promptVi: 'Nói hoặc viết 3 câu về việc bạn và người quanh bạn đang làm lúc này.',
      sampleEn: 'I am learning English. My friend is working.',
      speak: [
        { id: 'present-continuous-say-1', text: 'I am learning English now.', vi: 'Bây giờ tôi đang học tiếng Anh.' },
        { id: 'present-continuous-say-2', text: 'My friend is working today.', vi: 'Hôm nay bạn tôi đang làm việc.' },
      ],
    },
  },
}

export const PAST_TO_BE: Tense = {
  id: 'past-to-be',
  name: 'Quá khứ đơn: to be (was / were)',
  use: 'Nói ai / cái gì đã là gì, ở đâu, thế nào ở một lúc trong quá khứ (yesterday, last night, in 2020).',
  timeline: { kind: 'past-point', label: 'Trạng thái đúng ở một lúc trong quá khứ' },
  formulas: [
    { label: 'Khẳng định', text: 'I / he / she / it was · you / we / they were + danh từ / tính từ / nơi chốn: I was tired. They were at home.' },
    { label: 'Phủ định', text: "S + was / were + not (wasn't, weren't): She wasn't at work." },
    { label: 'Câu hỏi', text: "Was / Were + S + …?  → Yes, I was. / No, they weren't.  Where were you?" },
    { label: 'There was / were', text: 'There was + danh từ số ít hoặc không đếm được · There were + danh từ số nhiều: There was a cat. There were two cars.' },
  ],
  rules: [
    'Giống am / is / are, chỉ đổi sang quá khứ: am, is → was; are → were. I, he, she, it, danh từ số ít và danh từ không đếm được đi với was; you, we, they và danh từ số nhiều đi với were.',
    "Phủ định và câu hỏi dùng chính was / were, không mượn did: I wasn't tired (không phải I didn't be tired); Were you at home? (không phải Did you be at home?). Trả lời ngắn: Yes, I was. / No, I wasn't.",
    'was / were đi với danh từ, tính từ, nơi chốn (at home = ở nhà, at work = ở chỗ làm, at school = ở trường). Việc đã làm (động từ thường) thì dùng V-ed / did, không dùng was / were + nguyên mẫu: I was at home. I watched TV. Hỏi Wh-: Where were you? nhưng What did you do?',
  ],
  examples: [
    { en: 'I was at home last night.', vi: 'Tối qua tôi ở nhà.' },
    { en: 'The room was cold yesterday.', vi: 'Hôm qua căn phòng lạnh.' },
    { en: "They weren't at school on Monday.", vi: 'Thứ Hai vừa rồi họ không có mặt ở trường.' },
    { en: 'Were you tired? — Yes, I was.', vi: 'Lúc đó bạn có mệt không? — Có.' },
    { en: 'There were two people in the room.', vi: 'Lúc đó trong phòng có hai người.' },
    { en: 'Where were you yesterday?', vi: 'Hôm qua bạn ở đâu?' },
  ],
  mistakes: [
    { wrong: 'Did you be at home?', right: 'Were you at home?', why: 'Với was / were thì đảo was / were lên trước chủ ngữ, không mượn did.' },
    { wrong: "I didn't was tired.", right: "I wasn't tired.", why: "Phủ định thêm not ngay sau was / were: wasn't, weren't." },
    { wrong: 'I was work late.', right: 'I worked late.', why: 'Không đặt was / were ngay trước động từ nguyên mẫu (work). Việc đã làm dùng V-ed (worked).' },
    { wrong: 'They was happy.', right: 'They were happy.', why: 'you / we / they và danh từ số nhiều luôn đi với were.' },
    {
      wrong: 'I tired yesterday.',
      right: 'I was tired yesterday.',
      why: 'Tiếng Việt nói "tôi mệt" không cần động từ; tiếng Anh phải có was / were trước tính từ, nơi chốn.',
    },
  ],
  dialogues: [yg('where were you'), yg('there was a')],
  ruleCards: [
    {
      id: 'past-to-be-rule-1',
      cloze: 'Yesterday they ___ at home.',
      answer: 'were',
      vi: 'you / we / they và danh từ số nhiều + were; I / he / she / it và danh từ số ít + was.',
    },
    {
      id: 'past-to-be-rule-2',
      cloze: "___ they at work yesterday? — No, they weren't.",
      answer: 'Were',
      vi: 'Hỏi với was / were: đảo was / were lên trước chủ ngữ, không mượn did (không nói Did they be…?).',
    },
  ],
}

export const PAST_SIMPLE: Tense = {
  id: 'past-simple',
  name: 'Quá khứ đơn: động từ có quy tắc',
  use: 'Việc đã xảy ra và đã xong ở một lúc trong quá khứ (yesterday, last week, two days ago).',
  timeline: { kind: 'past-point', label: 'Đã xảy ra và kết thúc trong quá khứ' },
  formulas: [
    { label: 'Khẳng định', text: 'S + V-ed (mọi chủ ngữ): I worked. She played.' },
    { label: 'Phủ định', text: "S + did not (didn't) + động từ nguyên mẫu: He didn't call." },
    { label: 'Câu hỏi', text: "Did + S + động từ nguyên mẫu …?  → Yes, I did. / No, I didn't." },
    { label: 'Câu hỏi Wh-', text: 'What / Where / When … + did + S + động từ nguyên mẫu?  Where did you stay?' },
  ],
  rules: [
    'Quá khứ không đổi theo chủ ngữ: I worked, she worked, they worked (không thêm -s).',
    'Chính tả -ed: tận cùng e thì thêm -d (live → lived); phụ âm + y thì đổi -ied (study → studied). Gấp đôi phụ âm cuối khi từ một âm tiết tận cùng 1 chữ nguyên âm (a, e, i, o, u) + 1 chữ phụ âm (stop → stopped, plan → planned), hai chữ nguyên âm thì không (rain → rained, need → needed). Từ hai âm tiết có đuôi như vậy: nhấn âm đầu thì không (visit → visited, listen → listened, open → opened), nhấn âm cuối thì có (prefer → preferred). Không gấp đôi w, x, y (play → played, fix → fixed).',
    "Hỏi và phủ định mượn did, động từ chính về nguyên mẫu: Did you watch …? / I didn't watch (không phải didn't watched). Với to be (was / were) thì không mượn did: Were you tired? / I wasn't tired. (không phải Did you be tired? / I didn't be tired.)",
  ],
  examples: [
    { en: 'I watched a movie last night.', vi: 'Tối qua tôi xem một bộ phim.' },
    { en: 'She worked late yesterday.', vi: 'Hôm qua cô ấy làm việc muộn.' },
    { en: 'We stayed at home on Sunday.', vi: 'Chủ nhật chúng tôi ở nhà.' },
    { en: "He didn't call me.", vi: 'Anh ấy đã không gọi cho tôi.' },
    { en: 'Did you finish your work yesterday? — Yes, I did.', vi: 'Hôm qua bạn có làm xong việc không? — Có.' },
    { en: 'Where did you stay in Da Nang? — At a small hotel.', vi: 'Hồi ở Đà Nẵng bạn nghỉ ở đâu? — Ở một khách sạn nhỏ.' },
  ],
  mistakes: [
    { wrong: 'Yesterday I work late.', right: 'Yesterday I worked late.', why: 'Tiếng Việt dùng "hôm qua" là đủ; tiếng Anh phải đổi động từ sang quá khứ.' },
    { wrong: "I didn't watched it.", right: "I didn't watch it.", why: 'did đã mang quá khứ, động từ chính về nguyên mẫu.' },
    { wrong: 'Did she stayed home?', right: 'Did she stay home?', why: 'Câu hỏi với did dùng động từ nguyên mẫu.' },
  ],
  dialogues: [yg('did you watch'), yg('yesterday I watched')],
  spellId: 'obliviate',
  ruleCards: [
    {
      id: 'past-simple-rule-1',
      cloze: 'What ___ she cook last Sunday?',
      answer: 'did',
      vi: 'Hỏi Wh- về việc đã làm: Wh + did + S + động từ nguyên mẫu (không phải What you watched?).',
    },
  ],
}

export const PAST_SIMPLE_IRREGULAR: Tense = {
  id: 'past-simple-irregular',
  name: 'Quá khứ đơn: động từ bất quy tắc',
  use: 'Nhiều động từ thông dụng nhất không thêm -ed mà đổi hẳn dạng: go → went, see → saw.',
  timeline: { kind: 'past-point', label: 'Đã xảy ra và kết thúc trong quá khứ' },
  formulas: [
    { label: 'Khẳng định', text: 'S + V2 (cột 2 của bảng): I went. She bought a phone.' },
    { label: 'Phủ định / câu hỏi', text: "didn't / Did + V1 (nguyên mẫu): I didn't go. Did you see it?" },
    { label: 'V3', text: 'Cột 3 (gone, seen, bought) dùng cho thì hoàn thành và bị động (học ở T3–T4).' },
  ],
  rules: [
    'Không có quy tắc chung cho V2 / V3: học thuộc theo nhóm âm giống nhau (buy – bought, bring – brought, think – thought).',
    "Đã có did / didn't thì quay về V1: Did you go? (không phải Did you went?).",
    'Một số động từ giữ nguyên chữ ở cả ba cột: put – put – put; read – read – read (chữ giữ nguyên nhưng V2, V3 đọc /red/).',
  ],
  examples: [
    { en: 'I went to the market yesterday.', vi: 'Hôm qua tôi đi chợ.' },
    { en: 'She bought a new phone last week.', vi: 'Tuần trước cô ấy mua điện thoại mới.' },
    { en: 'We ate dinner at seven.', vi: 'Chúng tôi ăn tối lúc bảy giờ.' },
    { en: "He didn't see the message.", vi: 'Anh ấy không thấy tin nhắn.' },
    { en: 'Did you sleep well?', vi: 'Bạn ngủ ngon không?' },
    { en: 'I took a lot of photos.', vi: 'Tôi đã chụp rất nhiều ảnh.' },
  ],
  mistakes: [
    { wrong: 'I goed to school.', right: 'I went to school.', why: 'go là bất quy tắc: V2 là went, không thêm -ed.' },
    { wrong: "She didn't went home.", right: "She didn't go home.", why: "Sau didn't dùng V1." },
    { wrong: 'He buyed a car.', right: 'He bought a car.', why: 'buy – bought – bought, cùng nhóm với bring – brought, think – thought.' },
  ],
  dialogues: [yg('I went to'), yg('I bought a new')],
  spellId: 'reparo',
}

// ---------------------------------------------------------------- T3

export const WILL: Tense = {
  id: 'will',
  name: 'Tương lai với will',
  use: 'Quyết định ngay lúc nói, dự đoán, lời hứa và lời đề nghị giúp đỡ.',
  timeline: { kind: 'future-point', label: 'Một lúc trong tương lai' },
  formulas: [
    { label: 'Khẳng định', text: "S + will + động từ nguyên mẫu: I will help you. (I'll, you'll, she'll)" },
    { label: 'Phủ định', text: "S + will not (won't) + động từ nguyên mẫu" },
    { label: 'Câu hỏi', text: "Will + S + động từ nguyên mẫu …?  → Yes, I will. / No, I won't." },
  ],
  rules: [
    'will đi với mọi chủ ngữ, không đổi; động từ sau will luôn nguyên mẫu (she will go, không phải will goes).',
    "Dùng will cho quyết định vừa nghĩ ra (I'll take this one), dự đoán (It will rain) và lời hứa / đề nghị (I'll call you).",
    "won't đọc /woʊnt/, khác want /wɑːnt/: I won't go (sẽ không đi) ≠ I want to go (muốn đi).",
  ],
  examples: [
    { en: "I'll call you tonight.", vi: 'Tối nay tôi sẽ gọi bạn.' },
    { en: 'It will be cold tomorrow.', vi: 'Ngày mai trời sẽ lạnh.' },
    { en: "She won't be late.", vi: 'Cô ấy sẽ không đến muộn.' },
    { en: 'Will you help me? — Yes, I will.', vi: 'Bạn giúp tôi nhé? — Ừ, được.' },
    { en: "I'm hungry. I'll make some noodles.", vi: 'Tôi đói. Tôi sẽ nấu ít mì.' },
  ],
  mistakes: [
    { wrong: 'She will goes to work.', right: 'She will go to work.', why: 'Sau will luôn là động từ nguyên mẫu, không thêm -s.' },
    { wrong: 'I will to call you.', right: 'I will call you.', why: 'Không có to sau will.' },
    {
      wrong: 'I want go tomorrow.',
      right: 'I want to go tomorrow.',
      why: 'want + to + nguyên mẫu. Chú ý: "I want to go" (muốn đi) nghe gần "I won\'t go" (sẽ không đi); won\'t đọc /woʊnt/, want đọc /wɑːnt/.',
    },
  ],
  dialogues: [yg("I'll call you"), yg('it will be cold')],
  spellId: 'protego',
}

export const GOING_TO: Tense = {
  id: 'going-to',
  name: 'be going to (gonna)',
  use: 'Kế hoạch đã quyết từ trước, hoặc dự đoán khi đã thấy dấu hiệu ngay trước mắt.',
  timeline: { kind: 'plan', label: 'Đã định từ bây giờ, sẽ làm trong tương lai' },
  formulas: [
    { label: 'Khẳng định', text: "S + am / is / are + going to + động từ nguyên mẫu: I'm going to visit my parents." },
    { label: 'Phủ định', text: "S + am / is / are + not + going to + V: She isn't going to come." },
    { label: 'Câu hỏi', text: 'Am / Is / Are + S + going to + V …?  What are you going to do?' },
    { label: 'Văn nói', text: "going to → gonna: I'm gonna call him. (chỉ nói, không viết trong email/bài thi)" },
  ],
  rules: [
    'Cần đủ am / is / are + going to + nguyên mẫu. Thiếu to be ("I going to") là lỗi hay gặp.',
    "Kế hoạch đã định dùng going to (I'm going to visit Hue next month); quyết định vừa nghĩ ra dùng will.",
    'gonna chỉ thay cho going to + động từ; "I\'m going to Hanoi" (đi tới nơi) không đọc thành gonna.',
  ],
  examples: [
    { en: "I'm going to visit my parents this weekend.", vi: 'Cuối tuần này tôi sẽ về thăm bố mẹ.' },
    { en: 'She is going to buy a new laptop.', vi: 'Cô ấy định mua laptop mới.' },
    { en: "We aren't going to work on Saturday.", vi: 'Thứ Bảy chúng tôi sẽ không làm việc.' },
    { en: 'What are you going to do after work?', vi: 'Sau giờ làm bạn định làm gì?' },
    { en: "Look at those clouds. It's going to rain.", vi: 'Nhìn mây kìa. Trời sắp mưa rồi.' },
    { en: "I'm gonna take a break.", vi: 'Tôi nghỉ một lát đây (văn nói).' },
  ],
  mistakes: [
    { wrong: 'I going to visit Hue.', right: "I'm going to visit Hue.", why: 'Thiếu am / is / are trước going to.' },
    { wrong: 'He is going to visits us.', right: 'He is going to visit us.', why: 'Sau going to là động từ nguyên mẫu.' },
    { wrong: "I'm gonna Hanoi.", right: "I'm going to Hanoi.", why: 'gonna chỉ dùng khi sau going to là động từ, không dùng cho "đi tới nơi nào".' },
  ],
  dialogues: [yg('is going to rain'), yg('what are you going to do')],
  spellId: 'wingardium-leviosa',
}

export const PRESENT_PERFECT: Tense = {
  id: 'present-perfect',
  name: 'Hiện tại hoàn thành (1): trải nghiệm',
  use: 'Nói về trải nghiệm từ trước tới giờ (không nói rõ lúc nào), hoặc việc vừa xong còn liên quan tới bây giờ.',
  timeline: { kind: 'past-to-now', label: 'Từ quá khứ tới bây giờ, không nói rõ lúc nào' },
  formulas: [
    { label: 'Khẳng định', text: "S + have / has + V3: I have visited Da Lat. She has finished. (I've, she's)" },
    { label: 'Phủ định', text: "S + have / has + not (haven't / hasn't) + V3" },
    { label: 'Câu hỏi', text: "Have / Has + S + (ever) + V3 …?  → Yes, I have. / No, I haven't." },
  ],
  rules: [
    'I / you / we / they dùng have; he / she / it dùng has. Động từ chính ở cột 3 (V3): seen, been, eaten, worked.',
    'Hay đi với ever (đã từng), never (chưa từng), just (vừa), already (đã … rồi), yet (chưa, ở câu hỏi/phủ định).',
    "Không dùng với mốc thời gian đã xong (yesterday, last year, in 2020): mốc rõ thì dùng quá khứ đơn.",
  ],
  examples: [
    { en: 'I have visited Da Nang twice.', vi: 'Tôi đã đến Đà Nẵng hai lần.' },
    { en: 'She has never eaten sushi.', vi: 'Cô ấy chưa bao giờ ăn sushi.' },
    { en: 'Have you ever seen snow?', vi: 'Bạn đã từng thấy tuyết chưa?' },
    { en: "We've just finished the meeting.", vi: 'Chúng tôi vừa họp xong.' },
    { en: "He hasn't called me yet.", vi: 'Anh ấy vẫn chưa gọi cho tôi.' },
  ],
  mistakes: [
    { wrong: 'I have saw that movie.', right: 'I have seen that movie.', why: 'Sau have / has dùng V3 (seen), không dùng V2 (saw).' },
    { wrong: 'She have finished.', right: 'She has finished.', why: 'he / she / it đi với has.' },
    { wrong: 'I have visited Hue last year.', right: 'I visited Hue last year.', why: 'Có mốc đã xong (last year) thì dùng quá khứ đơn.' },
    {
      wrong: 'She has gone to Japan twice.',
      right: 'She has been to Japan twice.',
      why: 'been to = đã từng tới rồi về; gone to = đã đi và giờ đang ở đó, chưa về. Nói đã từng tới mấy lần (twice) thì dùng been to.',
    },
  ],
  dialogues: [yg('have you ever been'), yg("I've never seen")],
  spellId: 'expecto-patronum',
}

export const PERFECT_VS_PAST: Tense = {
  id: 'present-perfect-vs-past',
  name: 'Hiện tại hoàn thành (2) và so sánh với quá khứ đơn',
  use: 'Hiện tại hoàn thành với for / since (kéo dài tới giờ), và cách chọn giữa nó với quá khứ đơn.',
  timeline: { kind: 'perfect-vs-past', label: 'Quá khứ đơn: một lúc đã xong · Hoàn thành: kéo tới bây giờ' },
  formulas: [
    { label: 'Kéo dài tới giờ', text: 'S + have / has + V3 + for + khoảng thời gian / since + mốc bắt đầu' },
    { label: 'Hỏi bao lâu', text: 'How long have you + V3 …?  → For three years. / Since 2023.' },
    { label: 'Quá khứ đơn', text: 'S + V2 + mốc đã xong (yesterday, last week, in 2020, two years ago)' },
  ],
  rules: [
    'for + khoảng thời gian (for two years, for a week); since + mốc bắt đầu (since 2020, since Monday).',
    'Có mốc đã xong (yesterday, ago, last …, in 2020) hoặc hỏi When …? thì dùng quá khứ đơn.',
    'Không có mốc, hoặc khoảng thời gian chưa hết (today, this week, so far) hoặc việc vẫn còn đúng tới giờ thì dùng hiện tại hoàn thành.',
  ],
  examples: [
    { en: 'I have lived in Hanoi for five years.', vi: 'Tôi sống ở Hà Nội được năm năm rồi (vẫn đang sống).' },
    { en: 'I lived in Hue for two years.', vi: 'Tôi từng sống ở Huế hai năm (giờ không còn).' },
    { en: 'She has worked here since 2024.', vi: 'Cô ấy làm ở đây từ năm 2024.' },
    { en: 'How long have you known him?', vi: 'Bạn quen anh ấy bao lâu rồi?' },
    { en: 'When did you start this job?', vi: 'Bạn bắt đầu công việc này khi nào?' },
    { en: "I've drunk two cups of coffee today.", vi: 'Hôm nay tôi đã uống hai cốc cà phê.' },
  ],
  mistakes: [
    { wrong: 'I live here since 2020.', right: 'I have lived here since 2020.', why: 'Việc kéo dài từ một mốc tới giờ dùng hiện tại hoàn thành, không dùng hiện tại đơn.' },
    { wrong: 'When have you arrived?', right: 'When did you arrive?', why: 'Câu hỏi When … luôn hỏi về một lúc đã xong → quá khứ đơn.' },
    { wrong: 'I have worked here since three years.', right: 'I have worked here for three years.', why: 'Khoảng thời gian dùng for; since chỉ đi với mốc bắt đầu.' },
    {
      wrong: 'Have you called him yesterday?',
      right: 'Did you call him yesterday?',
      why: 'Tiếng Việt hỏi cả hai kiểu bằng "…chưa?". Chữ "chưa" không quyết định thì: có mốc đã xong (yesterday) thì dùng Did you …?; không có mốc, hỏi tính tới bây giờ ("Bạn gọi anh ấy chưa?") thì dùng Have you called him (yet)?',
    },
  ],
  dialogues: [yg('how long have you lived'), yg('when did you start')],
}

// ---------------------------------------------------------------- T4

export const MODALS: Tense = {
  id: 'modals',
  name: 'Động từ khuyết thiếu: can / should / must',
  use: 'can: có thể, xin phép · should: lời khuyên · must: bắt buộc, rất cần thiết.',
  formulas: [
    { label: 'Khẳng định', text: 'S + can / should / must + động từ nguyên mẫu: You should rest.' },
    { label: 'Phủ định', text: "can't (cannot) · shouldn't · mustn't (cấm) + động từ nguyên mẫu" },
    { label: 'Câu hỏi', text: 'Can / Should + S + động từ nguyên mẫu …?  Can I sit here?' },
  ],
  rules: [
    'Sau can / should / must là động từ nguyên mẫu, không có to, không thêm -s: She can swim (không phải can swims / can to swim).',
    'can / should / must không đổi theo chủ ngữ và không dùng do / does khi hỏi, phủ định: Can you…? (không phải Do you can…?).',
    "mustn't = cấm làm; don't have to = không cần làm. You mustn't smoke here ≠ You don't have to come.",
  ],
  examples: [
    { en: 'I can speak a little English.', vi: 'Tôi nói được một chút tiếng Anh.' },
    { en: 'Can I use your pen?', vi: 'Tôi dùng bút của bạn được không?' },
    { en: 'You should go to bed early.', vi: 'Bạn nên đi ngủ sớm.' },
    { en: "You shouldn't drink too much coffee.", vi: 'Bạn không nên uống quá nhiều cà phê.' },
    { en: 'We must finish this today.', vi: 'Chúng ta phải làm xong việc này hôm nay.' },
    { en: "You mustn't park here.", vi: 'Bạn không được đỗ xe ở đây.' },
  ],
  mistakes: [
    { wrong: 'He can speaks English.', right: 'He can speak English.', why: 'Sau can là động từ nguyên mẫu, không thêm -s.' },
    { wrong: 'You should to rest.', right: 'You should rest.', why: 'Không có to sau should / can / must.' },
    { wrong: 'Do you can help me?', right: 'Can you help me?', why: 'Câu hỏi đảo can lên đầu, không mượn do.' },
  ],
  dialogues: [yg('you should try'), yg('can I ask you')],
  spellId: 'expelliarmus',
}

export const COMPARATIVES: Tense = {
  id: 'comparatives',
  name: 'So sánh hơn và so sánh nhất',
  use: 'So sánh hai thứ (hơn) hoặc chọn ra một thứ đứng đầu trong nhóm (nhất).',
  formulas: [
    { label: 'Tính từ ngắn', text: 'adj-er + than: cheaper than · the + adj-est: the cheapest' },
    { label: 'Tính từ dài', text: 'more + adj + than: more expensive than · the most + adj: the most expensive' },
    { label: 'Bất quy tắc', text: 'good → better → the best · bad → worse → the worst · far → farther → the farthest' },
  ],
  rules: [
    'Tính từ một âm tiết (và hai âm tiết tận cùng -y) thêm -er / -est: big → bigger (gấp đôi g), easy → easier.',
    'Tính từ dài (hai âm tiết trở lên, trừ -y) dùng more / the most: more useful, the most important.',
    'Không dùng cả hai: "more cheaper" sai. So sánh nhất luôn có the.',
  ],
  examples: [
    { en: 'My phone is cheaper than yours.', vi: 'Điện thoại của tôi rẻ hơn của bạn.' },
    { en: 'Hanoi is bigger than Hue.', vi: 'Hà Nội lớn hơn Huế.' },
    { en: 'This book is more interesting than that one.', vi: 'Cuốn này hay hơn cuốn kia.' },
    { en: 'She is the best player on the team.', vi: 'Cô ấy là người chơi giỏi nhất đội.' },
    { en: 'It was the worst day of my life.', vi: 'Đó là ngày tệ nhất đời tôi.' },
    { en: 'Today is easier than yesterday.', vi: 'Hôm nay dễ hơn hôm qua.' },
  ],
  mistakes: [
    { wrong: 'She is more taller than me.', right: 'She is taller than me.', why: 'Tính từ ngắn chỉ thêm -er, không thêm more.' },
    { wrong: 'This is gooder.', right: 'This is better.', why: 'good là bất quy tắc: better, the best.' },
    { wrong: 'He is tallest in the class.', right: 'He is the tallest in the class.', why: 'So sánh nhất phải có the.' },
  ],
  dialogues: [yg('bigger than'), yg('the best way to')],
  spellId: 'riddikulus',
}

export const PASSIVE_PRESENT: Tense = {
  id: 'passive-present',
  name: 'Bị động hiện tại (nhập môn)',
  use: 'Khi việc được làm quan trọng hơn ai làm: sản phẩm, quy trình, thông báo (rất hay gặp ở TOEIC).',
  formulas: [
    { label: 'Khẳng định', text: 'S + am / is / are + V3 (+ by …): The room is cleaned every day.' },
    { label: 'Phủ định', text: "S + am / is / are + not + V3: Smoking isn't allowed." },
    { label: 'Câu hỏi', text: 'Am / Is / Are + S + V3 …?  Is breakfast included?' },
  ],
  rules: [
    'Bị động = to be + V3. Chủ ngữ là thứ chịu tác động (the room, the email), không phải người làm.',
    'to be chia theo chủ ngữ mới: The car is made… / The cars are made…',
    'Chỉ thêm by + người làm khi cần nói rõ: This app is used by millions of people.',
  ],
  examples: [
    { en: 'English is spoken in many countries.', vi: 'Tiếng Anh được nói ở nhiều nước.' },
    { en: 'These phones are made in Vietnam.', vi: 'Những chiếc điện thoại này được sản xuất ở Việt Nam.' },
    { en: 'The office is cleaned every evening.', vi: 'Văn phòng được dọn mỗi tối.' },
    { en: "Breakfast isn't included.", vi: 'Không bao gồm bữa sáng.' },
    { en: 'Is this seat taken?', vi: 'Ghế này có ai ngồi chưa?' },
  ],
  mistakes: [
    { wrong: 'The room is clean every day.', right: 'The room is cleaned every day.', why: 'Bị động cần V3 (cleaned); "is clean" là "sạch" (tính từ).' },
    { wrong: 'These cars is made in Japan.', right: 'These cars are made in Japan.', why: 'Chủ ngữ số nhiều (these cars) đi với are.' },
    { wrong: 'The email sent every Monday.', right: 'The email is sent every Monday.', why: 'Thiếu to be: bị động luôn cần am / is / are trước V3.' },
  ],
  dialogues: [yg('is made in'), yg('is not allowed')],
  spellId: 'finite',
}

// ---------------------------------------------------------------- Nội dung đoạn Ngữ pháp từng tuần

export const GRAMMAR_T2_W1: GrammarContent = { tenses: [PRESENT_CONTINUOUS] }
export const GRAMMAR_T2_W2: GrammarContent = { tenses: [PAST_TO_BE, PAST_SIMPLE] }
export const GRAMMAR_T2_W3: GrammarContent = { tenses: [PAST_SIMPLE_IRREGULAR], irregularVerbs: IRREGULAR_VERBS }
export const GRAMMAR_T2_W4: GrammarContent = {
  tenses: [],
  review: {
    summary: [
      'Hiện tại tiếp diễn: am / is / are + V-ing cho việc đang diễn ra (I am working now).',
      "Quá khứ của to be: was / were; hỏi và phủ định không mượn did (Were you…? I wasn't…).",
      "Quá khứ đơn có quy tắc: V-ed cho mọi chủ ngữ; hỏi / phủ định dùng did / didn't + nguyên mẫu.",
      'Quá khứ đơn bất quy tắc: học thuộc V2 (went, saw, bought); sau did vẫn là V1.',
      'Không trộn: không nói "I am work", "I didn\'t went", "Did you watched", "Did you be".',
    ],
    note: 'Mini test 10 câu ôn cả 4 tuần T2. Câu sai tự vào Sổ lỗi sai, làm lại bao nhiêu lần cũng được.',
    quizId: 'mini-t2',
  },
}
export const GRAMMAR_T3_W1: GrammarContent = { tenses: [WILL] }
export const GRAMMAR_T3_W2: GrammarContent = { tenses: [GOING_TO] }
export const GRAMMAR_T3_W3: GrammarContent = { tenses: [PRESENT_PERFECT] }
export const GRAMMAR_T3_W4: GrammarContent = { tenses: [PERFECT_VS_PAST] }
export const GRAMMAR_T4_W1: GrammarContent = { tenses: [MODALS] }
export const GRAMMAR_T4_W3: GrammarContent = { tenses: [COMPARATIVES, PASSIVE_PRESENT] }
