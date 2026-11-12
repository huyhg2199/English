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
  ruleCards: [
    {
      id: 'present-continuous-rule-1',
      cloze: 'Look! The boys ___ (play) football outside.',
      answer: 'are playing',
      vi: 'am / is / are + V-ing. Thiếu một trong hai phần là sai.',
    },
    {
      id: 'present-continuous-rule-2',
      cloze: 'She ___ (not / sleep) now. She is reading.',
      answer: "isn't sleeping",
      vi: "Phủ định: am / is / are + not + V-ing (isn't sleeping), không mượn do / does.",
    },
    {
      id: 'present-continuous-rule-3',
      cloze: '___ you working right now? — Yes, I am.',
      answer: 'Are',
      vi: 'Câu hỏi: đảo am / is / are lên trước chủ ngữ, rồi V-ing (không phải Do you working?).',
    },
    {
      id: 'present-continuous-rule-4',
      cloze: 'We are ___ (sit) near the window.',
      answer: 'sitting',
      vi: 'Từ một âm tiết tận cùng 1 chữ nguyên âm + 1 chữ phụ âm thì gấp đôi phụ âm cuối (sit → sitting, run → running). Không gấp đôi w, x, y (play → playing, fix → fixing).',
    },
    {
      id: 'present-continuous-rule-5',
      cloze: 'I ___ (know) the answer now.',
      answer: 'know',
      vi: 'Động từ trạng thái (know, like, want, need) không dùng tiếp diễn.',
    },
  ],
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
        // Câu dịch Việt → Anh (story 36).
        {
          id: 'present-continuous-c7',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Bây giờ chúng tôi đang ăn tối. (have dinner)',
          answer: 'We are having dinner now.',
          accept: ['Now we are having dinner.'],
          hintVi: 'chúng tôi = we → are; "đang" = are + V-ing; have bỏ e câm rồi thêm -ing.',
          explanationVi:
            'Tiếng Việt chỉ cần "đang", tiếng Anh phải có đủ are (vì we) + having. have tận cùng e câm nên bỏ e: having. now đặt cuối hoặc đầu câu đều được. have dinner (= ăn tối) là hành động nên dùng được -ing; have = có (have a car) thì không.',
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
    {
      id: 'past-to-be-rule-3',
      cloze: 'We ___ busy last night. We were free.',
      answer: "weren't",
      vi: "Phủ định: wasn't / weren't, không mượn did (không phải We didn't be busy).",
    },
    {
      id: 'past-to-be-rule-4',
      cloze: 'There ___ three students in the room yesterday morning.',
      answer: 'were',
      vi: 'there was + danh từ số ít hoặc không đếm được, there were + danh từ số nhiều.',
    },
  ],
  // Phần luyện có bậc (story 36): Sân ga, hiện tại đơn / tiếp diễn và was / were; không -ed, không V2 khác, did chỉ là lựa
  // chọn sai để so "Were you…?" với "Did you…?" (xem `src/lib/tense-scope.ts`); đề không trùng đề quiz s1-t2-w2.
  practice: {
    worked: {
      en: 'We were at home last night.',
      vi: 'Tối qua chúng tôi ở nhà.',
      noteVi:
        'we đi với were; at home là nơi chốn nên chỉ cần to be, không cần động từ khác. Tiếng Việt nói "ở nhà" không có động từ "là", tiếng Anh bắt buộc có were.',
      timeline: { kind: 'past-point', label: 'Ở nhà vào tối qua' },
    },
    faded: {
      en: 'My phone ___ (be) on the table yesterday.',
      answer: 'was',
      vi: 'Hôm qua điện thoại của tôi ở trên bàn.',
      hintVi: 'my phone là một vật (số ít) nên dùng was.',
    },
    check: {
      items: [
        {
          id: 'past-to-be-c1',
          kind: 'type',
          prompt: 'Lan and Minh ___ (be) at the park last Sunday.',
          answer: 'were',
          hintVi: 'Lan and Minh là hai người (= they).',
          explanationVi: 'Lan and Minh = they (số nhiều) nên dùng were. last Sunday là quá khứ nên không dùng are.',
        },
        {
          id: 'past-to-be-c2',
          kind: 'choice',
          prompt: '___ you at school yesterday?',
          options: ['Were', 'Did', 'Was'],
          answer: 0,
          hintVi: 'Câu không có động từ thường, chỉ có nơi chốn (at school).',
          explanationVi:
            'Câu chỉ có nơi chốn (at school), không có động từ thường, nên dùng to be: Were you at school? Không mượn Did (không nói Did you be…?). you luôn đi với were.',
        },
        {
          id: 'past-to-be-c3',
          kind: 'type',
          prompt: 'He ___ (not / be) at work last Monday.',
          answer: "wasn't",
          hintVi: 'he đi với was; phủ định thêm not ngay sau was.',
          explanationVi: "last Monday là quá khứ. he đi với was, phủ định là was not (wasn't). Không dùng didn't với to be.",
        },
        {
          id: 'past-to-be-c4',
          kind: 'type',
          prompt: 'Đổi sang câu hỏi: She was happy.',
          answer: 'Was she happy?',
          hintVi: 'Chỉ cần đưa was lên trước she.',
          explanationVi: 'Câu hỏi với was / were: đảo was lên trước chủ ngữ, phần còn lại giữ nguyên: Was she happy?',
        },
        {
          id: 'past-to-be-c5',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Hôm qua có một con mèo trong bếp. (a cat, the kitchen, yesterday)',
          answer: 'There was a cat in the kitchen yesterday.',
          accept: ['Yesterday there was a cat in the kitchen.'],
          hintVi: '"có" (ở đâu đó) = There is / are; quá khứ thì đổi sang There was / were.',
          explanationVi:
            'a cat là số ít nên dùng There was (quá khứ của There is). Trong bếp = in the kitchen. yesterday đặt cuối hoặc đầu câu đều được.',
        },
        {
          id: 'past-to-be-c6',
          kind: 'type',
          prompt: 'Was the movie good? — Yes, it ___.',
          answer: 'was',
          hintVi: 'Hỏi bằng Was thì trả lời ngắn cũng dùng was.',
          explanationVi: 'Trả lời ngắn dùng lại was: Yes, it was. it đi với was, không đi với were.',
        },
      ],
      easier: [
        {
          id: 'past-to-be-e1',
          kind: 'choice',
          prompt: 'I ___ tired yesterday.',
          options: ['was', 'were', 'am'],
          answer: 0,
          hintVi: 'I đi với was.',
          explanationVi: 'I đi với was (quá khứ của am). yesterday là quá khứ nên không dùng am.',
        },
        {
          id: 'past-to-be-e2',
          kind: 'choice',
          prompt: 'They ___ at home last night.',
          options: ['were', 'was', 'are'],
          answer: 0,
          hintVi: 'they là số nhiều.',
          explanationVi: 'they đi với were (quá khứ của are). last night là quá khứ nên không dùng are.',
        },
      ],
    },
    apply: {
      promptVi: 'Nói hoặc viết 3 câu về hôm qua: bạn ở đâu, thấy thế nào, có ai ở cùng.',
      sampleEn: 'I was at the office yesterday. I was tired. My friends were at the cafe.',
      speak: [
        { id: 'past-to-be-say-1', text: 'I was at work yesterday.', vi: 'Hôm qua tôi ở chỗ làm.' },
        { id: 'past-to-be-say-2', text: 'My friends were at the park.', vi: 'Các bạn tôi đã ở công viên.' },
      ],
    },
  },
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
    {
      id: 'past-simple-rule-2',
      cloze: 'The taxi ___ (stop) in front of my house last night.',
      answer: 'stopped',
      vi: 'Từ một âm tiết tận cùng 1 chữ nguyên âm + 1 chữ phụ âm thì gấp đôi phụ âm cuối (stop → stopped). Không gấp đôi w, x, y (play → played, fix → fixed); visit → visited cũng không.',
    },
    {
      id: 'past-simple-rule-3',
      cloze: 'She ___ (not / call) me last night.',
      answer: "didn't call",
      vi: "didn't + V nguyên mẫu (không phải didn't called).",
    },
    {
      id: 'past-simple-rule-4',
      cloze: '___ you clean your room last weekend? — Yes, I did.',
      answer: 'Did',
      vi: "Câu hỏi: Did + chủ ngữ + V nguyên mẫu …? Trả lời ngắn: Yes, I did. / No, I didn't.",
    },
  ],
  // Phần luyện có bậc (story 36): Sân ga, hiện tại đơn / tiếp diễn, was / were, -ed và did; không V2 bất quy tắc (xem
  // `src/lib/tense-scope.ts`); đề không trùng đề quiz s1-t2-w2 hay đề luyện của was / were.
  practice: {
    worked: {
      en: 'She cooked dinner yesterday.',
      vi: 'Hôm qua cô ấy nấu bữa tối.',
      noteVi:
        'cook thêm -ed cho mọi chủ ngữ (không thêm -s cho she). Tiếng Việt chỉ cần "hôm qua", nhưng tiếng Anh có yesterday rồi vẫn phải đổi động từ: cooked.',
      timeline: { kind: 'past-point', label: 'Đã nấu xong hôm qua' },
    },
    faded: {
      en: 'We ___ (stay) at home last Sunday.',
      answer: 'stayed',
      vi: 'Chủ nhật vừa rồi chúng tôi ở nhà.',
      hintVi: 'stay tận cùng nguyên âm + y nên giữ y, chỉ thêm -ed.',
    },
    check: {
      items: [
        {
          id: 'past-simple-c1',
          kind: 'type',
          prompt: 'He ___ (plan) a trip last month.',
          answer: 'planned',
          hintVi: 'plan là từ một âm tiết, tận cùng 1 nguyên âm + 1 phụ âm.',
          explanationVi: 'plan là từ một âm tiết tận cùng a + n (1 nguyên âm + 1 phụ âm) nên gấp đôi n rồi thêm -ed: planned. -ed dùng cho mọi chủ ngữ.',
        },
        {
          id: 'past-simple-c2',
          kind: 'type',
          prompt: 'I ___ (listen) to music last night.',
          answer: 'listened',
          hintVi: 'listen có hai âm tiết, nhấn âm đầu (LIS-ten).',
          explanationVi: 'listen nhấn âm đầu nên không gấp đôi n, chỉ thêm -ed: listened (không phải listenned).',
        },
        {
          id: 'past-simple-c3',
          kind: 'choice',
          prompt: '___ she clean her room yesterday?',
          options: ['Did', 'Was', 'Does'],
          answer: 0,
          hintVi: 'clean là động từ thường, việc ở quá khứ.',
          explanationVi:
            'Có động từ thường (clean) ở quá khứ thì mượn Did, clean về nguyên mẫu: Did she clean…? Was chỉ dùng khi không có động từ thường; yesterday là quá khứ nên không dùng Does.',
        },
        {
          id: 'past-simple-c4',
          kind: 'type',
          prompt: 'Đổi sang câu phủ định: He opened the window.',
          answer: "He didn't open the window.",
          hintVi: "Phủ định quá khứ: didn't + động từ nguyên mẫu.",
          explanationVi: "Thêm didn't trước động từ và đưa opened về nguyên mẫu open: He didn't open the window (không phải didn't opened).",
        },
        {
          id: 'past-simple-c5',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Tuần trước chúng tôi đến thăm bà. (visit, our grandmother, last week)',
          answer: 'We visited our grandmother last week.',
          accept: ['Last week we visited our grandmother.'],
          hintVi: 'Tuần trước = last week, nên visit đổi sang quá khứ.',
          explanationVi:
            'last week là quá khứ nên visit thêm -ed: visited. visit nhấn âm đầu (VIS-it) nên không gấp đôi t. last week đặt cuối hoặc đầu câu đều được.',
        },
        {
          id: 'past-simple-c6',
          kind: 'type',
          prompt: 'Where ___ you work last year?',
          answer: 'did',
          hintVi: 'Câu hỏi Wh- ở quá khứ với động từ thường (work).',
          explanationVi: 'Hỏi Wh- về việc đã làm: Where + did + you + work (nguyên mẫu)? last year là quá khứ nên không dùng do.',
        },
      ],
      easier: [
        {
          id: 'past-simple-e1',
          kind: 'choice',
          prompt: 'She ___ TV last night.',
          options: ['watched', 'watches', 'watch'],
          answer: 0,
          hintVi: 'last night là quá khứ.',
          explanationVi: 'last night là quá khứ nên watch thêm -ed: watched. Quá khứ không thêm -s cho she.',
        },
        {
          id: 'past-simple-e2',
          kind: 'choice',
          prompt: "I didn't ___ my sister yesterday.",
          options: ['call', 'called', 'calls'],
          answer: 0,
          hintVi: "Sau didn't là động từ nguyên mẫu.",
          explanationVi: "did đã mang quá khứ nên sau didn't dùng nguyên mẫu: I didn't call my sister (không phải didn't called).",
        },
      ],
    },
    apply: {
      promptVi: 'Nói hoặc viết 3 câu về việc bạn đã làm hôm qua (chỉ dùng động từ có quy tắc: work, cook, watch, play, study…).',
      sampleEn: 'Yesterday I worked late. I cooked dinner and watched TV.',
      speak: [
        { id: 'past-simple-say-1', text: 'I worked at home yesterday.', vi: 'Hôm qua tôi làm việc ở nhà.' },
        { id: 'past-simple-say-2', text: 'We played games last weekend.', vi: 'Cuối tuần trước chúng tôi chơi game.' },
      ],
    },
  },
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
  ruleCards: [
    {
      id: 'past-simple-irregular-rule-1',
      cloze: 'My mother ___ (buy) fish at the market this morning.',
      answer: 'bought',
      vi: 'Bất quy tắc dùng V2 (buy → bought, không phải buyed).',
    },
    {
      id: 'past-simple-irregular-rule-2',
      cloze: "He didn't ___ (go) to work yesterday.",
      answer: 'go',
      vi: "Sau didn't quay về V1 (không phải didn't went).",
    },
    {
      id: 'past-simple-irregular-rule-3',
      cloze: 'What did you ___ (eat) for lunch?',
      answer: 'eat',
      vi: 'Did / Wh + did + chủ ngữ + V1.',
    },
    {
      id: 'past-simple-irregular-rule-4',
      cloze: 'Yesterday we ___ (go) to the beach.',
      answer: 'went',
      vi: 'went là V2 (quá khứ đơn). gone là V3, dùng sau have / has (hiện tại hoàn thành, học ở T3).',
    },
  ],
  // Phần luyện có bậc (story 36): Sân ga, hiện tại đơn / tiếp diễn, quá khứ đơn (was / were, -ed, did) và V2 bất quy tắc;
  // không V3 (xem `src/lib/tense-scope.ts`); đề không trùng đề quiz s1-t2-w3.
  practice: {
    worked: {
      en: 'My father made a cake yesterday.',
      vi: 'Hôm qua bố tôi làm một cái bánh.',
      noteVi: 'make là bất quy tắc: make → made (V2), không thêm -ed (không nói maked). V2 giống nhau cho mọi chủ ngữ.',
      timeline: { kind: 'past-point', label: 'Đã làm xong hôm qua' },
    },
    faded: {
      en: 'We ___ (see) a good movie last night.',
      answer: 'saw',
      vi: 'Tối qua chúng tôi xem một bộ phim hay.',
      hintVi: 'see là bất quy tắc: see – saw.',
    },
    check: {
      items: [
        {
          id: 'past-simple-irregular-c1',
          kind: 'type',
          prompt: 'I ___ (get) up at six this morning.',
          answer: 'got',
          hintVi: 'get là bất quy tắc: get – got.',
          explanationVi: 'Sáng nay đã qua nên dùng quá khứ. get là bất quy tắc, V2 là got (không phải getted).',
        },
        {
          id: 'past-simple-irregular-c2',
          kind: 'type',
          prompt: 'She ___ (write) a long email to her boss last night.',
          answer: 'wrote',
          hintVi: 'write là bất quy tắc: write – wrote.',
          explanationVi: 'last night là quá khứ. write đổi nguyên âm: write → wrote (V2). Không thêm -ed.',
        },
        {
          id: 'past-simple-irregular-c3',
          kind: 'choice',
          prompt: 'Did they ___ the bus?',
          options: ['catch', 'caught', 'catched'],
          answer: 0,
          hintVi: 'Sau Did là động từ nguyên mẫu.',
          explanationVi: 'Did đã mang quá khứ nên động từ về V1: Did they catch the bus? caught là V2, "catched" không có.',
        },
        {
          id: 'past-simple-irregular-c4',
          kind: 'type',
          prompt: 'Đổi sang câu phủ định: He drove to work.',
          answer: "He didn't drive to work.",
          hintVi: "didn't + V1: drove là V2 của drive.",
          explanationVi: "Phủ định quá khứ: didn't + V1. drove (V2) về drive: He didn't drive to work (không phải didn't drove).",
        },
        {
          id: 'past-simple-irregular-c5',
          kind: 'type',
          prompt: 'Dịch sang tiếng Anh: Hôm qua tôi gửi cho anh ấy một tin nhắn. (send, a message, yesterday)',
          answer: 'I sent him a message yesterday.',
          accept: [
            'Yesterday I sent him a message.',
            'I sent a message to him yesterday.',
            'Yesterday I sent a message to him.',
          ],
          hintVi: 'send là bất quy tắc: send – sent. "cho anh ấy" = him.',
          explanationVi: 'yesterday là quá khứ: send → sent (V2, -d đổi thành -t). anh ấy làm tân ngữ nên dùng him.',
        },
        {
          id: 'past-simple-irregular-c6',
          kind: 'type',
          prompt: 'Where ___ she find her keys yesterday?',
          answer: 'did',
          hintVi: 'find ở dạng V1, câu hỏi Wh- ở quá khứ.',
          explanationVi: 'Câu hỏi Wh- ở quá khứ: Where + did + S + V1? find giữ V1 vì đã có did (không nói Where did she found…?).',
        },
      ],
      easier: [
        {
          id: 'past-simple-irregular-e1',
          kind: 'choice',
          prompt: 'I ___ to school yesterday.',
          options: ['went', 'go', 'goed'],
          answer: 0,
          hintVi: 'go là bất quy tắc.',
          explanationVi: 'yesterday là quá khứ; go là bất quy tắc nên V2 là went (không có "goed").',
        },
        {
          id: 'past-simple-irregular-e2',
          kind: 'choice',
          prompt: "She didn't ___ the cake.",
          options: ['eat', 'ate', 'eats'],
          answer: 0,
          hintVi: "Sau didn't là V1.",
          explanationVi: "didn't đã mang quá khứ nên dùng V1: She didn't eat the cake (không phải didn't ate).",
        },
      ],
    },
    apply: {
      promptVi: 'Nói hoặc viết 3 câu về cuối tuần trước của bạn: đi đâu, ăn gì, gặp ai.',
      sampleEn: 'Last weekend I went to Vung Tau. I ate seafood and met my friends.',
      speak: [
        { id: 'past-simple-irregular-say-1', text: 'I went to the beach last weekend.', vi: 'Cuối tuần trước tôi đi biển.' },
        { id: 'past-simple-irregular-say-2', text: 'We ate dinner with our family.', vi: 'Chúng tôi ăn tối cùng gia đình.' },
      ],
    },
  },
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
  ruleCards: [
    {
      id: 'will-rule-1',
      cloze: "It's late. I ___ (call) a taxi.",
      answer: 'will call',
      vi: 'Quyết định ngay lúc nói: will + V nguyên mẫu, mọi chủ ngữ (she will go, không phải will goes).',
    },
    {
      id: 'will-rule-2',
      cloze: 'We ___ (not / be) at home tomorrow.',
      answer: "won't be",
      vi: "Phủ định: will not (won't) + V nguyên mẫu, mọi chủ ngữ (won't be, không phải won't is).",
    },
    {
      id: 'will-rule-3',
      cloze: '___ you call me tomorrow? — Yes, I will.',
      answer: 'Will',
      vi: "Câu hỏi: Will + chủ ngữ + V nguyên mẫu …? Trả lời ngắn: Yes, I will. / No, I won't.",
    },
    {
      id: 'will-rule-4',
      cloze: "I'm very tired. I ___ (not) go to the party tonight.",
      answer: "won't",
      vi: "won't /woʊnt/ = sẽ không. want /wɑːnt/ to = muốn. I won't go ≠ I want to go.",
    },
  ],
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
  ruleCards: [
    {
      id: 'going-to-rule-1',
      cloze: 'We ___ (visit) Sa Pa in July. We bought the tickets yesterday.',
      answer: 'are going to visit',
      vi: 'Kế hoạch đã định: am / is / are + going to + V.',
    },
    {
      id: 'going-to-rule-2',
      cloze: 'He ___ (not / buy) a car this year. He decided last month.',
      answer: "isn't going to buy",
      vi: "Phủ định kế hoạch đã định: am / is / are + not + going to + V nguyên mẫu (isn't going to buy).",
    },
    {
      id: 'going-to-rule-3',
      cloze: 'What ___ you going to cook tonight?',
      answer: 'are',
      vi: 'Câu hỏi: (Wh) + am / is / are + chủ ngữ + going to + V, không mượn do.',
    },
    {
      id: 'going-to-rule-4',
      cloze: 'Look at that boy on the wall! He ___ (fall).',
      answer: 'is going to fall',
      vi: 'Thấy dấu hiệu ngay trước mắt thì dùng going to. Quyết định vừa nghĩ ra thì dùng will.',
    },
  ],
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
  ruleCards: [
    {
      id: 'present-perfect-rule-1',
      cloze: 'We ___ (visit) Hoi An twice.',
      answer: 'have visited',
      vi: 'have / has + V3. I / you / we / they dùng have.',
    },
    {
      id: 'present-perfect-rule-2',
      cloze: 'My son ___ (not / finish) his lunch yet.',
      answer: "hasn't finished",
      vi: "Phủ định: haven't / hasn't + V3, yet ở cuối câu.",
    },
    {
      id: 'present-perfect-rule-3',
      cloze: '___ you ever sung karaoke?',
      answer: 'Have',
      vi: 'Câu hỏi: Have / Has + chủ ngữ + (ever) + V3 …? ever = đã từng.',
    },
    {
      id: 'present-perfect-rule-4',
      cloze: 'We have ___ (see) this show before.',
      answer: 'seen',
      vi: 'Sau have / has dùng V3 (seen), không dùng V2 (saw).',
    },
    {
      id: 'present-perfect-rule-5',
      cloze: "My parents aren't at home. They have ___ (go / be) to Da Nang.",
      answer: 'gone',
      vi: 'gone to = đã đi và giờ đang ở đó. been to = đã từng tới rồi về.',
    },
  ],
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
  ruleCards: [
    {
      id: 'present-perfect-vs-past-rule-1',
      cloze: 'I have worked here ___ 2022.',
      answer: 'since',
      vi: 'since + mốc bắt đầu.',
    },
    {
      id: 'present-perfect-vs-past-rule-2',
      cloze: 'She has lived in Hanoi ___ ten years.',
      answer: 'for',
      vi: 'for + khoảng thời gian.',
    },
    {
      id: 'present-perfect-vs-past-rule-3',
      cloze: 'I ___ (meet) him last year.',
      answer: 'met',
      vi: 'Có mốc đã xong (last year, ago, yesterday) thì dùng quá khứ đơn, không dùng have met.',
    },
    {
      id: 'present-perfect-vs-past-rule-4',
      cloze: 'When ___ you buy your car? — Two years ago.',
      answer: 'did',
      vi: 'Hỏi When về việc đã xảy ra thì dùng quá khứ đơn (không phải When have you bought…?).',
    },
    {
      id: 'present-perfect-vs-past-rule-5',
      cloze: 'How long ___ your parents lived in Hanoi?',
      answer: 'have',
      vi: 'Hỏi kéo dài tới giờ: How long have / has + S + V3?',
    },
  ],
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
  ruleCards: [
    {
      id: 'modals-rule-1',
      cloze: 'My grandmother can ___ (speak) French.',
      answer: 'speak',
      vi: 'Sau can / should / must là V nguyên mẫu, không to, không -s.',
    },
    {
      id: 'modals-rule-2',
      cloze: '___ I open the window? — Yes, of course.',
      answer: 'Can',
      vi: 'Hỏi xin phép: Can I …? Đảo can lên đầu, không mượn do.',
    },
    {
      id: 'modals-rule-3',
      cloze: "You ___ park your car here. It's the rule.",
      answer: "mustn't",
      vi: "mustn't = cấm làm (luật, biển báo). can't (không được phép) cũng đúng; shouldn't chỉ là lời khuyên, nhẹ hơn.",
    },
    {
      id: 'modals-rule-4',
      cloze: 'You look tired. You ___ take a break.',
      answer: 'should',
      vi: 'should = lời khuyên (nên). must = bắt buộc, mạnh hơn nhiều.',
    },
  ],
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
  ruleCards: [
    {
      id: 'comparatives-rule-1',
      cloze: 'My room is ___ (big) than yours.',
      answer: 'bigger',
      vi: 'Tính từ ngắn: -er + than (big → bigger, gấp đôi g).',
    },
    {
      id: 'comparatives-rule-2',
      cloze: 'This laptop is ___ (expensive) than that one.',
      answer: 'more expensive',
      vi: 'Tính từ dài: more + adj + than.',
    },
    {
      id: 'comparatives-rule-3',
      cloze: 'She is ___ (good) student in the class.',
      answer: 'the best',
      vi: 'good → better → the best. So sánh nhất có the, trừ khi đã có my / your / his… (my best friend).',
    },
    {
      id: 'comparatives-rule-4',
      cloze: 'He is ___ (tall) than his father.',
      answer: 'taller',
      vi: 'Không dùng cả more và -er (không phải more taller).',
    },
  ],
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
  ruleCards: [
    {
      id: 'passive-present-rule-1',
      cloze: 'These bags ___ (sell) at the market.',
      answer: 'are sold',
      vi: 'Bị động: am / is / are + V3. Chủ ngữ số nhiều dùng are.',
    },
    {
      id: 'passive-present-rule-2',
      cloze: 'The tip ___ (not / include) in the bill.',
      answer: "isn't included",
      vi: "Phủ định bị động: am / is / are + not + V3 (isn't included).",
    },
    {
      id: 'passive-present-rule-3',
      cloze: '___ English taught at your school?',
      answer: 'Is',
      vi: 'Câu hỏi bị động: đảo am / is / are lên trước chủ ngữ, rồi V3 (không phải Does English taught?).',
    },
    {
      id: 'passive-present-rule-4',
      cloze: 'The windows are ___ (clean) every Monday.',
      answer: 'cleaned',
      vi: 'Bị động cần V3. "are clean" là tính từ (sạch).',
    },
  ],
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
export const GRAMMAR_T3_W3: GrammarContent = { tenses: [PRESENT_PERFECT], irregularVerbsReview: IRREGULAR_VERBS }
export const GRAMMAR_T3_W4: GrammarContent = { tenses: [PERFECT_VS_PAST] }
export const GRAMMAR_T4_W1: GrammarContent = { tenses: [MODALS] }
export const GRAMMAR_T4_W3: GrammarContent = { tenses: [COMPARATIVES, PASSIVE_PRESENT] }
