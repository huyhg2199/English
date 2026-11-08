import type { ExampleWord, PronunciationBlock, PronunciationContent, Sound } from './types'

/**
 * Phát âm / nghe tháng T2–T4 (story 10): trọng âm, -ed, dạng yếu, nối âm, trọng âm câu, dạng rút gọn,
 * shadowing, chép chính tả. Mẹo tự soạn. Từ ví dụ là từ NGSL có dữ liệu (âm tiết và vị trí nhấn lấy từ bộ từ).
 */

const f = (word: string, form: string, formIpa: string): ExampleWord => ({ word, form, formIpa })
const yg = (phrase: string) => `https://youglish.com/pronounce/${encodeURIComponent(phrase)}/english/us`

// ---------------------------------------------------------------- T2 tuần 1: trọng âm từ 2 âm tiết

const STRESS_TWO: PronunciationBlock = {
  kind: 'stress',
  title: 'Trọng âm từ 2 âm tiết',
  note: 'Âm tiết in đậm là âm tiết nhấn: đọc to hơn, cao hơn, dài hơn. Âm tiết không nhấn đọc nhẹ, hay thành /ə/. Luật đúng với đa số từ, vẫn có ngoại lệ (hotel nhấn âm 2), nên luôn nghe lại.',
  rules: [
    {
      id: 'stress-noun-1',
      title: 'Danh từ: thường nhấn âm tiết 1',
      tip: 'PEO-ple, PROB-lem, STU-dent. Người Việt hay đọc đều hai âm như tiếng Việt; phải dồn lực vào âm đầu.',
      expect: { kind: 'index', index: 0, syllables: 2 },
      words: ['people', 'problem', 'student', 'money', 'office', 'water'],
    },
    {
      id: 'stress-adj-1',
      title: 'Tính từ: thường nhấn âm tiết 1',
      tip: 'HAP-py, EA-sy, SIM-ple. Âm cuối -y, -le đọc rất nhẹ.',
      expect: { kind: 'index', index: 0, syllables: 2 },
      words: ['happy', 'easy', 'simple', 'early', 'special'],
    },
    {
      id: 'stress-verb-2',
      title: 'Động từ: thường nhấn âm tiết 2',
      tip: 'be-GIN, de-CIDE, ex-PLAIN. Âm đầu (be-, de-, ex-, en-) đọc rất nhẹ, gần /ɪ/ hoặc /ə/.',
      expect: { kind: 'index', index: 1, syllables: 2 },
      words: ['begin', 'decide', 'explain', 'enjoy', 'arrive', 'prepare'],
    },
  ],
}

// ---------------------------------------------------------------- T2 tuần 2: trọng âm theo hậu tố

const STRESS_SUFFIX: PronunciationBlock = {
  kind: 'stress',
  title: 'Trọng âm theo hậu tố',
  note: 'Với -tion, -ic, -ity: trọng âm luôn rơi vào âm tiết ngay trước hậu tố, dù từ dài bao nhiêu.',
  rules: [
    {
      id: 'stress-tion',
      title: '-tion: nhấn ngay trước -tion',
      tip: 'in-for-MA-tion, ed-u-CA-tion. -tion đọc /ʃən/ rất nhẹ ("sần"), không đọc "ti-ôn".',
      expect: { kind: 'before-suffix', suffix: 'tion', suffixSyllables: 1 },
      words: ['information', 'education', 'condition', 'position', 'station', 'conversation'],
    },
    {
      id: 'stress-ic',
      title: '-ic: nhấn ngay trước -ic',
      tip: 'ec-o-NOM-ic, spe-CIF-ic, fan-TAS-tic. -ic đọc /ɪk/ ngắn, nhớ bật /k/ cuối.',
      expect: { kind: 'before-suffix', suffix: 'ic', suffixSyllables: 1 },
      words: ['economic', 'specific', 'fantastic', 'music', 'basic', 'traffic'],
    },
    {
      id: 'stress-ity',
      title: '-ity: nhấn ngay trước -ity',
      tip: 'ac-TIV-i-ty, com-MU-ni-ty, u-ni-VER-si-ty. -ity có hai âm tiết nhẹ /ət̬i/ (giọng Mỹ t nghe gần "đ").',
      expect: { kind: 'before-suffix', suffix: 'ity', suffixSyllables: 2 },
      words: ['activity', 'community', 'quality', 'ability', 'university', 'security'],
    },
  ],
}

// ---------------------------------------------------------------- T2 tuần 3: -ed /t/ /d/ /ɪd/

const ending = (id: string, ipa: string, tip: string, examples: ExampleWord[]): Sound => ({
  id,
  ipa,
  kind: 'ending',
  tip,
  examples,
})

export const ED_ENDINGS: readonly Sound[] = [
  ending(
    'ed-t',
    't',
    'Sau âm vô thanh /p k f s ʃ tʃ/: -ed đọc /t/, dính liền vào từ, không thêm âm tiết. "asked" là MỘT âm tiết /æskt/.',
    [
      f('ask', 'asked', 'æskt'),
      f('look', 'looked', 'lʊkt'),
      f('finish', 'finished', 'ˈfɪnɪʃt'),
      f('laugh', 'laughed', 'læft'),
      f('cook', 'cooked', 'kʊkt'),
    ],
  ),
  ending(
    'ed-d',
    'd',
    'Sau nguyên âm và âm hữu thanh (/b ɡ v z m n l r/…): -ed đọc /d/ nhẹ, vẫn một âm tiết. Đừng đọc thành "đờ".',
    [
      f('listen', 'listened', 'ˈlɪsənd'),
      f('stay', 'stayed', 'steɪd'),
      f('move', 'moved', 'muːvd'),
      f('travel', 'traveled', 'ˈtrævəld'),
      f('enjoy', 'enjoyed', 'ɪnˈdʒɔɪd'),
    ],
  ),
  ending(
    'ed-id',
    'ɪd',
    'Chỉ sau /t/ và /d/: thêm hẳn một âm tiết /ɪd/. Đừng thêm /ɪd/ cho từ khác ("asked" không phải "ask-ed").',
    [
      f('visit', 'visited', 'ˈvɪzɪt̬ɪd'),
      f('end', 'ended', 'ˈendɪd'),
      f('add', 'added', 'ˈædɪd'),
      f('invite', 'invited', 'ɪnˈvaɪt̬ɪd'),
      f('paint', 'painted', 'ˈpeɪntɪd'),
    ],
  ),
]

// ---------------------------------------------------------------- T2 tuần 4: tự đọc 20 từ

const SELF_READ: PronunciationBlock = {
  kind: 'self-read',
  title: 'Tự đọc 20 từ rồi so với từ điển',
  note: 'Nhìn từ, tự đoán IPA và trọng âm rồi đọc to. Bấm "Xem IPA" để so, nghe mẫu, và mở Cambridge khi muốn nghe giọng người thật.',
  words: [
    'hotel', 'coffee', 'teacher', 'computer', 'television', 'morning', 'breakfast', 'weekend', 'family', 'hospital',
    'important', 'tomorrow', 'yesterday', 'beautiful', 'village', 'photograph', 'engineer', 'develop', 'understand',
    'restaurant',
  ],
}

// ---------------------------------------------------------------- T3 tuần 1: dạng yếu

const WEAK_FORMS: PronunciationBlock = {
  kind: 'weak-forms',
  title: 'Dạng yếu của từ chức năng',
  note: 'Từ chức năng (to, of, and, can, a…) trong câu thường đọc rất nhẹ, nguyên âm thành /ə/. Đây là lý do nghe người bản xứ thấy "mất chữ".',
  items: [
    { word: 'to', strong: 'tuː', weak: 'tə', example: 'I want to go.', vi: 'Tôi muốn đi. (to đọc /tə/, gần "tờ")' },
    {
      word: 'of',
      strong: 'ʌv',
      weak: 'əv',
      example: 'a cup of tea',
      vi: 'một tách trà. of đọc yếu /əv/; nói nhanh trước phụ âm (như /t/ của tea) còn rút thành /ə/, nghe như "a cuppa tea".',
    },
    { word: 'and', strong: 'ænd', weak: 'ən', example: 'bread and butter', vi: 'bánh mì và bơ (and còn /ən/ hoặc /n/)' },
    { word: 'can', strong: 'kæn', weak: 'kən', example: 'I can swim.', vi: 'Tôi biết bơi. (can nhẹ /kən/; can\'t thì đọc rõ /kænt/)' },
    { word: 'a', strong: 'eɪ', weak: 'ə', example: 'I have a car.', vi: 'Tôi có một chiếc xe. (a đọc /ə/, không đọc "ây")' },
    { word: 'for', strong: 'fɔːr', weak: 'fɚ', example: 'This is for you.', vi: 'Cái này cho bạn. (for đọc /fɚ/)' },
  ],
}

// ---------------------------------------------------------------- T3 tuần 2: nối âm

const LINKING: PronunciationBlock = {
  kind: 'linking',
  title: 'Nối âm phụ âm – nguyên âm',
  note: 'Từ trước kết thúc bằng phụ âm, từ sau bắt đầu bằng nguyên âm thì phụ âm "nhảy" sang từ sau. Người Việt hay ngắt từng từ nên nghe bị cứng.',
  items: [
    { text: 'pick it up', sounds: 'pi-ki-tup', vi: 'nhặt nó lên' },
    { text: 'turn off', sounds: 'tur-noff', vi: 'tắt' },
    { text: 'an apple', sounds: 'a-napple', vi: 'một quả táo' },
    { text: 'come on', sounds: 'ka-mon', vi: 'thôi nào' },
    { text: 'look at it', sounds: 'loo-ka-tit', vi: 'nhìn nó đi' },
    { text: 'get up early', sounds: 'ge-tu-pearly', vi: 'dậy sớm' },
  ],
}

// ---------------------------------------------------------------- T3 tuần 3: trọng âm câu

const SENTENCE_STRESS: PronunciationBlock = {
  kind: 'sentence-stress',
  title: 'Trọng âm câu',
  note: 'Từ nội dung (danh từ, động từ chính, tính từ, trạng từ, từ phủ định) được nhấn. Từ chức năng (a, the, to, of, is, have, I, you…) đọc nhẹ và nhanh. Từ nhấn in đậm.',
  items: [
    { text: 'I want to buy a new phone.', stressed: [1, 3, 5, 6], vi: 'Tôi muốn mua điện thoại mới.' },
    { text: 'She has visited Japan twice.', stressed: [2, 3, 4], vi: 'Cô ấy đã đến Nhật hai lần.' },
    { text: "We didn't see the movie.", stressed: [1, 2, 4], vi: 'Chúng tôi không xem phim đó.' },
    { text: 'Have you ever eaten pho?', stressed: [2, 3, 4], vi: 'Bạn từng ăn phở chưa?' },
    { text: 'The meeting is at ten.', stressed: [1, 4], vi: 'Cuộc họp lúc mười giờ.' },
  ],
}

// ---------------------------------------------------------------- T3 tuần 4: shadowing 30 giây

const SHADOW_T3: PronunciationBlock = {
  kind: 'shadowing',
  title: 'Shadowing: một đoạn 30 giây',
  note: 'Nghe cả đoạn một lần. Sau đó nghe từng câu và nói đè theo ngay (như cái bóng), bắt chước nhịp và chỗ nhấn. Cuối cùng bấm nói từng câu để máy so.',
  lines: [
    { id: 's1-t3-w4-shadow-1', text: 'I live in a big city.', vi: 'Tôi sống ở một thành phố lớn.' },
    { id: 's1-t3-w4-shadow-2', text: 'I have lived here for three years.', vi: 'Tôi sống ở đây được ba năm.' },
    { id: 's1-t3-w4-shadow-3', text: 'Last year I started to learn English again.', vi: 'Năm ngoái tôi bắt đầu học lại tiếng Anh.' },
    { id: 's1-t3-w4-shadow-4', text: "I haven't finished the course yet.", vi: 'Tôi vẫn chưa học xong khoá.' },
    { id: 's1-t3-w4-shadow-5', text: "But I've learned a lot of new words.", vi: 'Nhưng tôi đã học được nhiều từ mới.' },
    { id: 's1-t3-w4-shadow-6', text: "Next month I'm going to take a short test.", vi: 'Tháng sau tôi sẽ làm một bài kiểm tra ngắn.' },
  ],
}

// ---------------------------------------------------------------- T4 tuần 1: dạng rút gọn

const REDUCTIONS: PronunciationBlock = {
  kind: 'reductions',
  title: 'Dạng rút gọn khi nói',
  note: 'Người bản xứ nói nhanh sẽ gộp từ. Chỉ cần nghe ra; khi viết email / bài thi vẫn viết dạng đầy đủ.',
  items: [
    { reduced: 'wanna', full: 'want to', example: 'I wanna go home.', vi: 'Tôi muốn về nhà.', youglishUrl: yg('wanna') },
    { reduced: 'gotta', full: 'have got to', example: "I've gotta go.", vi: 'Tôi phải đi rồi.', youglishUrl: yg('gotta') },
    { reduced: 'gonna', full: 'going to', example: "It's gonna rain.", vi: 'Trời sắp mưa.', youglishUrl: yg('gonna') },
    { reduced: "I'd", full: 'I would / I had', example: "I'd like a coffee.", vi: 'Tôi muốn một cốc cà phê.', youglishUrl: yg("I'd like") },
    { reduced: "you'll", full: 'you will', example: "You'll love it.", vi: 'Bạn sẽ thích nó.', youglishUrl: yg("you'll") },
  ],
}

// ---------------------------------------------------------------- T4 tuần 3: shadowing + chép chính tả

const SHADOW_T4: PronunciationBlock = {
  kind: 'shadowing',
  title: 'Shadowing',
  note: 'Nghe cả đoạn, rồi nói đè theo từng câu. Chú ý so sánh hơn (-er) và bị động (is / are + V3).',
  lines: [
    { id: 's1-t4-w3-shadow-1', text: 'This phone is cheaper than my old one.', vi: 'Điện thoại này rẻ hơn cái cũ của tôi.' },
    { id: 's1-t4-w3-shadow-2', text: 'It is made in Vietnam.', vi: 'Nó được sản xuất ở Việt Nam.' },
    { id: 's1-t4-w3-shadow-3', text: 'The camera is the best part.', vi: 'Camera là phần tốt nhất.' },
    { id: 's1-t4-w3-shadow-4', text: 'The battery is bigger and the screen is brighter.', vi: 'Pin to hơn và màn hình sáng hơn.' },
  ],
}

const DICTATION_T4: PronunciationBlock = {
  kind: 'dictation',
  title: 'Chép chính tả 5 câu',
  note: 'Bấm nghe (nghe lại bao nhiêu lần cũng được), gõ lại câu rồi bấm Chấm. Không cần viết hoa hay dấu câu; từ thiếu hoặc sai sẽ tô đỏ.',
  items: [
    { id: 's1-t4-w3-dict-1', text: 'She is working now.', vi: 'Bây giờ cô ấy đang làm việc.' },
    { id: 's1-t4-w3-dict-2', text: 'My brother is taller than me.', vi: 'Anh trai tôi cao hơn tôi.' },
    { id: 's1-t4-w3-dict-3', text: 'English is spoken in many countries.', vi: 'Tiếng Anh được nói ở nhiều nước.' },
    { id: 's1-t4-w3-dict-4', text: 'You should drink more water.', vi: 'Bạn nên uống nhiều nước hơn.' },
    { id: 's1-t4-w3-dict-5', text: 'I went to the best restaurant in town.', vi: 'Tôi đã đến nhà hàng ngon nhất thị trấn.' },
  ],
}

// ---------------------------------------------------------------- T4 tuần 4: ôn tổng chặng 1

const STAGE_1_OVERVIEW_SOUNDS: PronunciationBlock = {
  kind: 'overview',
  title: 'Ôn tổng: âm và cách đọc',
  note: 'Bấm từng dòng để về đúng đoạn của bài đó.',
  items: [
    { text: '12 nguyên âm đơn: /iː/ khác /ɪ/, /æ/ khác /e/, âm dài có dấu ː.', lessonId: 's1-t1-w1', sectionId: 'pronunciation' },
    { text: '8 nguyên âm đôi: trượt đủ hai âm (late /eɪ/, go /oʊ/).', lessonId: 's1-t1-w2', sectionId: 'pronunciation' },
    { text: '24 phụ âm, chú ý /θ ð ʃ ʒ/.', lessonId: 's1-t1-w3', sectionId: 'pronunciation' },
    { text: 'Âm cuối, đuôi -s (/s z ɪz/).', lessonId: 's1-t1-w4', sectionId: 'pronunciation' },
    { text: 'Trọng âm 2 âm tiết: danh/tính từ nhấn âm 1, động từ nhấn âm 2.', lessonId: 's1-t2-w1', sectionId: 'pronunciation' },
    { text: 'Trọng âm theo hậu tố -tion, -ic, -ity.', lessonId: 's1-t2-w2', sectionId: 'pronunciation' },
    { text: 'Đuôi -ed: /t/ /d/ /ɪd/.', lessonId: 's1-t2-w3', sectionId: 'pronunciation' },
    { text: 'Tự đọc 20 từ rồi so IPA và trọng âm với từ điển.', lessonId: 's1-t2-w4', sectionId: 'pronunciation' },
    { text: 'Dạng yếu: to /tə/, of /əv/, and /ən/, can /kən/, a /ə/.', lessonId: 's1-t3-w1', sectionId: 'pronunciation' },
    { text: 'Nối âm phụ âm – nguyên âm (pick it up).', lessonId: 's1-t3-w2', sectionId: 'pronunciation' },
    { text: 'Trọng âm câu: nhấn từ nội dung, đọc nhẹ từ chức năng.', lessonId: 's1-t3-w3', sectionId: 'pronunciation' },
    { text: 'Shadowing một đoạn 30 giây: nói đè theo nhịp và chỗ nhấn.', lessonId: 's1-t3-w4', sectionId: 'pronunciation' },
    { text: "Dạng rút gọn: wanna, gotta, gonna, I'd, you'll.", lessonId: 's1-t4-w1', sectionId: 'pronunciation' },
    { text: 'Shadowing và chép chính tả 5 câu: nghe ra từ nhỏ và âm cuối.', lessonId: 's1-t4-w3', sectionId: 'pronunciation' },
  ],
}

const STAGE_1_OVERVIEW_TENSES: PronunciationBlock = {
  kind: 'overview',
  title: 'Ôn tổng: các thì của chặng 1',
  items: [
    { text: 'To be: am / is / are.', lessonId: 's1-t1-w1', sectionId: 'grammar' },
    { text: 'Hiện tại đơn: he / she / it thêm -s.', lessonId: 's1-t1-w2', sectionId: 'grammar' },
    { text: "Hỏi / phủ định hiện tại đơn: do / does, don't / doesn't.", lessonId: 's1-t1-w3', sectionId: 'grammar' },
    { text: 'Hiện tại tiếp diễn: am / is / are + V-ing.', lessonId: 's1-t2-w1', sectionId: 'grammar' },
    { text: "Quá khứ đơn có quy tắc: V-ed, did / didn't.", lessonId: 's1-t2-w2', sectionId: 'grammar' },
    { text: 'Động từ bất quy tắc: went, saw, bought (bảng 50 động từ).', lessonId: 's1-t2-w3', sectionId: 'grammar' },
    { text: "Tương lai will: will / won't + nguyên mẫu.", lessonId: 's1-t3-w1', sectionId: 'grammar' },
    { text: 'be going to (gonna) cho kế hoạch.', lessonId: 's1-t3-w2', sectionId: 'grammar' },
    { text: 'Hiện tại hoàn thành: have / has + V3, ever / never.', lessonId: 's1-t3-w3', sectionId: 'grammar' },
    { text: 'Hoàn thành hay quá khứ đơn: for / since, mốc đã xong.', lessonId: 's1-t3-w4', sectionId: 'grammar' },
    { text: 'can / should / must + nguyên mẫu.', lessonId: 's1-t4-w1', sectionId: 'grammar' },
    { text: 'So sánh hơn / nhất và bị động hiện tại.', lessonId: 's1-t4-w3', sectionId: 'grammar' },
  ],
}

// ---------------------------------------------------------------- Nội dung đoạn Phát âm từng tuần

export const PRONUNCIATION_T2_W1: PronunciationContent = {
  intro: 'Từ hai âm tiết luôn có một âm tiết được nhấn. Nhấn sai thì người nghe khó nhận ra từ, dù từng âm đúng.',
  groups: [],
  blocks: [STRESS_TWO],
  sentences: [
    { id: 's1-t2-w1-say-1', text: 'I am reading a book now.', vi: 'Bây giờ tôi đang đọc sách.' },
    { id: 's1-t2-w1-say-2', text: 'The students are writing.', vi: 'Các sinh viên đang viết.' },
    { id: 's1-t2-w1-say-3', text: 'She is preparing dinner.', vi: 'Cô ấy đang chuẩn bị bữa tối.' },
    { id: 's1-t2-w1-say-4', text: 'What are you doing this morning?', vi: 'Sáng nay bạn đang làm gì?' },
  ],
}

export const PRONUNCIATION_T2_W2: PronunciationContent = {
  intro: 'Từ dài nhìn đáng sợ nhưng có mẹo: nhiều hậu tố quyết định luôn vị trí trọng âm.',
  groups: [],
  blocks: [STRESS_SUFFIX],
  sentences: [
    { id: 's1-t2-w2-say-1', text: 'I watched the news yesterday.', vi: 'Hôm qua tôi xem thời sự.' },
    { id: 's1-t2-w2-say-2', text: 'We talked about the economic situation.', vi: 'Chúng tôi nói về tình hình kinh tế.' },
    { id: 's1-t2-w2-say-3', text: 'She studied at the university.', vi: 'Cô ấy học ở trường đại học.' },
    { id: 's1-t2-w2-say-4', text: 'Did you finish the activity?', vi: 'Bạn làm xong hoạt động chưa?' },
  ],
}

export const PRONUNCIATION_T2_W3: PronunciationContent = {
  intro: 'Đuôi -ed có ba cách đọc, phụ thuộc âm cuối của động từ (không phụ thuộc chữ cái). Người Việt hay bỏ hẳn đuôi, nghe thành hiện tại.',
  groups: [{ title: 'Đuôi -ed', note: 'Quy tắc dựa vào ÂM cuối: "laugh" viết -gh nhưng âm cuối /f/ nên laughed đọc /t/.', sounds: ED_ENDINGS }],
  sentences: [
    { id: 's1-t2-w3-say-1', text: 'I asked and she answered.', vi: 'Tôi hỏi và cô ấy trả lời.' },
    { id: 's1-t2-w3-say-2', text: 'We visited our friends and stayed late.', vi: 'Chúng tôi thăm bạn và ở lại muộn.' },
    { id: 's1-t2-w3-say-3', text: 'He went home and cooked dinner.', vi: 'Anh ấy về nhà và nấu bữa tối.' },
    { id: 's1-t2-w3-say-4', text: 'They needed help, so we helped them.', vi: 'Họ cần giúp nên chúng tôi đã giúp.' },
  ],
}

export const PRONUNCIATION_T2_W4: PronunciationContent = {
  intro: 'Tuần ôn: tự đọc 20 từ, tự kiểm IPA và trọng âm. Không đoán theo cảm tính; nghe lại khi sai.',
  groups: [],
  blocks: [SELF_READ],
  sentences: [
    { id: 's1-t2-w4-say-1', text: 'I had breakfast at the hotel.', vi: 'Tôi ăn sáng ở khách sạn.' },
    { id: 's1-t2-w4-say-2', text: 'My family visited the village last weekend.', vi: 'Cuối tuần trước gia đình tôi về quê.' },
    { id: 's1-t2-w4-say-3', text: 'The engineer is working on the computer.', vi: 'Kỹ sư đang làm việc trên máy tính.' },
  ],
}

export const PRONUNCIATION_T3_W1: PronunciationContent = {
  intro: 'Tiếng Anh nhấn từ quan trọng và "nuốt" từ nhỏ. Học dạng yếu để nghe ra câu nói nhanh và nói tự nhiên hơn.',
  groups: [],
  blocks: [WEAK_FORMS],
  sentences: [
    { id: 's1-t3-w1-say-1', text: "I'll call you at ten.", vi: 'Tôi sẽ gọi bạn lúc mười giờ.' },
    { id: 's1-t3-w1-say-2', text: 'It will be a cup of tea and a cake.', vi: 'Sẽ là một tách trà và một cái bánh.' },
    { id: 's1-t3-w1-say-3', text: 'I can help you tomorrow.', vi: 'Ngày mai tôi giúp bạn được.' },
    { id: 's1-t3-w1-say-4', text: "She won't go to the party.", vi: 'Cô ấy sẽ không đi dự tiệc.' },
  ],
}

export const PRONUNCIATION_T3_W2: PronunciationContent = {
  intro: 'Người bản xứ không nói từng từ rời mà nối thành một dòng. Tập nối để nghe ra và nói trôi hơn.',
  groups: [],
  blocks: [LINKING],
  sentences: [
    { id: 's1-t3-w2-say-1', text: "I'm going to pick it up.", vi: 'Tôi sẽ nhặt nó lên.' },
    { id: 's1-t3-w2-say-2', text: 'Turn off the light.', vi: 'Tắt đèn đi.' },
    { id: 's1-t3-w2-say-3', text: "We're gonna get up early.", vi: 'Chúng tôi sẽ dậy sớm.' },
    { id: 's1-t3-w2-say-4', text: 'Look at it again.', vi: 'Nhìn lại nó đi.' },
  ],
}

export const PRONUNCIATION_T3_W3: PronunciationContent = {
  intro: 'Câu tiếng Anh có nhịp: từ nội dung nhấn mạnh và rõ, từ chức năng lướt qua. Nghe đúng nhịp thì hiểu nhanh hơn.',
  groups: [],
  blocks: [SENTENCE_STRESS],
  sentences: [
    { id: 's1-t3-w3-say-1', text: 'I want to buy a new phone.', vi: 'Tôi muốn mua điện thoại mới.' },
    { id: 's1-t3-w3-say-2', text: 'She has visited Japan twice.', vi: 'Cô ấy đã đến Nhật hai lần.' },
    { id: 's1-t3-w3-say-3', text: 'Have you ever eaten pho?', vi: 'Bạn từng ăn phở chưa?' },
  ],
}

export const PRONUNCIATION_T3_W4: PronunciationContent = {
  intro: 'Shadowing: nói đè theo người mẫu ngay khi nghe, không đợi hết câu. Luyện cùng lúc âm, trọng âm, nối âm và nhịp.',
  groups: [],
  blocks: [SHADOW_T3],
  sentences: [
    { id: 's1-t3-w4-say-1', text: 'I have lived here for five years.', vi: 'Tôi sống ở đây năm năm rồi.' },
    { id: 's1-t3-w4-say-2', text: 'When did you start this job?', vi: 'Bạn bắt đầu công việc này khi nào?' },
    { id: 's1-t3-w4-say-3', text: "I've known him since 2020.", vi: 'Tôi quen anh ấy từ năm 2020.' },
  ],
}

export const PRONUNCIATION_T4_W1: PronunciationContent = {
  intro: 'Phim và nhạc đầy dạng rút gọn. Học để nghe ra, mỗi cụm có nút nghe trong video thật (YouGlish).',
  groups: [],
  blocks: [REDUCTIONS],
  sentences: [
    { id: 's1-t4-w1-say-1', text: 'I wanna learn English.', vi: 'Tôi muốn học tiếng Anh.' },
    { id: 's1-t4-w1-say-2', text: "You should rest. You'll feel better.", vi: 'Bạn nên nghỉ. Bạn sẽ thấy khoẻ hơn.' },
    { id: 's1-t4-w1-say-3', text: "I'd like some water, please.", vi: 'Làm ơn cho tôi ít nước.' },
    { id: 's1-t4-w1-say-4', text: 'We must go now.', vi: 'Chúng ta phải đi ngay.' },
  ],
}

export const PRONUNCIATION_T4_W3: PronunciationContent = {
  intro: 'Mỗi ngày: shadowing một lượt và chép chính tả 5 câu. Chép chính tả ép tai nghe từng âm cuối và từ nhỏ.',
  groups: [],
  blocks: [SHADOW_T4, DICTATION_T4],
  sentences: [
    { id: 's1-t4-w3-say-1', text: 'Hanoi is bigger than Hue.', vi: 'Hà Nội lớn hơn Huế.' },
    { id: 's1-t4-w3-say-2', text: 'This is the most important part.', vi: 'Đây là phần quan trọng nhất.' },
    { id: 's1-t4-w3-say-3', text: 'Breakfast is included.', vi: 'Có bao gồm bữa sáng.' },
  ],
}

export const PRONUNCIATION_T4_W4: PronunciationContent = {
  intro: 'Tuần ôn tổng trước O.W.L. 1. Đọc lại tóm tắt, bấm vào dòng nào còn yếu để về đúng bài. Bài thi O.W.L. 1 sẽ có ở trang này; trước đó hãy ôn theo danh sách dưới.',
  groups: [],
  blocks: [STAGE_1_OVERVIEW_SOUNDS, STAGE_1_OVERVIEW_TENSES],
  sentences: [
    { id: 's1-t4-w4-say-1', text: 'I am learning English every day.', vi: 'Tôi đang học tiếng Anh mỗi ngày.' },
    { id: 's1-t4-w4-say-2', text: 'Yesterday I watched a movie without subtitles.', vi: 'Hôm qua tôi xem phim không phụ đề.' },
    { id: 's1-t4-w4-say-3', text: "I've studied for four months and I'm going to keep going.", vi: 'Tôi đã học bốn tháng và sẽ tiếp tục.' },
  ],
}
