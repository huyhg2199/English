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
}

export const PRESENT_SIMPLE_QUESTIONS: Tense = {
  id: 'present-simple-questions',
  name: 'Hiện tại đơn: câu hỏi và phủ định',
  use: 'Hỏi về thói quen, sự thật; nói ai đó không làm gì một cách thường xuyên.',
  timeline: { kind: 'habit-question', label: 'Hỏi / phủ định một thói quen' },
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
