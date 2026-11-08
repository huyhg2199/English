import type { ExampleWord, LessonPart, Pair, PronunciationContent, Sound } from './types'

/**
 * Bộ âm giọng Mỹ cho tháng T1 (khớp IPA của bộ từ NGSL trong app). Mẹo khẩu hình tự soạn.
 * Từ ví dụ là từ NGSL đã có dữ liệu (test kiểm tra IPA của từ có chứa đúng âm).
 */

const w = (...words: string[]): ExampleWord[] => words.map((word) => ({ word }))
/** Từ gốc NGSL + dạng có đuôi và IPA của dạng đó (bài âm cuối). */
const f = (word: string, form: string, formIpa: string): ExampleWord => ({ word, form, formIpa })

/** IPA kiểu Mỹ của các từ trong cặp dễ nhầm (từ có trong NGSL phải trùng IPA của bộ từ — test kiểm). */
const PAIR_IPA: Record<string, string> = {
  sit: 'sɪt', seat: 'siːt', ship: 'ʃɪp', sheep: 'ʃiːp', bed: 'bed', bad: 'bæd', hot: 'hɑːt', hat: 'hæt',
  full: 'fʊl', fool: 'fuːl', pull: 'pʊl', pool: 'puːl', cup: 'kʌp', cap: 'kæp', walk: 'wɑːk', work: 'wɝːk',
  short: 'ʃɔːrt', shirt: 'ʃɝːt', late: 'leɪt', let: 'let', like: 'laɪk', lake: 'leɪk', now: 'naʊ', no: 'noʊ',
  low: 'loʊ', law: 'lɑː', hear: 'hɪr', hair: 'her', fan: 'fæn', van: 'væn', think: 'θɪŋk', sink: 'sɪŋk',
  they: 'ðeɪ', day: 'deɪ', sea: 'siː', she: 'ʃiː', chip: 'tʃɪp', thin: 'θɪn', thing: 'θɪŋ', light: 'laɪt',
  right: 'raɪt', zoo: 'zuː', sue: 'suː', jeep: 'dʒiːp', cheap: 'tʃiːp', west: 'west', vest: 'vest', at: 'æt',
  year: 'jɪr', ear: 'ɪr',
}
/** Cặp dễ nhầm kèm IPA (thiếu IPA thì chuỗi rỗng → test báo lỗi). */
const pr = (a: string, b: string): Pair => [
  { word: a, ipa: PAIR_IPA[a] ?? '' },
  { word: b, ipa: PAIR_IPA[b] ?? '' },
]

const vowel = (id: string, ipa: string, tip: string, examples: ExampleWord[], pair?: Pair): Sound => ({
  id,
  ipa,
  kind: 'vowel',
  tip,
  examples,
  ...(pair && { pair }),
})

// ---------------------------------------------------------------- Tuần 1: 12 nguyên âm đơn

export const MONOPHTHONGS: readonly Sound[] = [
  vowel(
    'v-ii',
    'iː',
    'Như "i" tiếng Việt nhưng kéo dài, môi bành sang hai bên như đang cười. Người Việt hay đọc ngắn nên "sheep" nghe thành "ship".',
    w('see', 'need', 'week', 'people', 'read'),
    pr('sit', 'seat'),
  ),
  vowel(
    'v-i',
    'ɪ',
    'Ngắn và lỏng hơn "i" tiếng Việt, miệng hơi mở, nghe hơi ngả về "ê". Không kéo dài, không bành môi.',
    w('sit', 'big', 'live', 'this', 'think'),
    pr('ship', 'sheep'),
  ),
  vowel(
    'v-e',
    'e',
    'Gần "e" tiếng Việt (như trong "em"), miệng mở vừa. Đừng mở quá to thành /æ/.',
    w('bed', 'get', 'help', 'friend', 'yes'),
    pr('bed', 'bad'),
  ),
  vowel(
    'v-ae',
    'æ',
    'Không có trong tiếng Việt: miệng mở to như "a" nhưng lưỡi đặt như "e", nghe lai giữa "a" và "e". Người Việt hay đọc thành "e" (bad → bed) hoặc "a".',
    w('cat', 'bad', 'man', 'hand', 'thank'),
    pr('bad', 'bed'),
  ),
  vowel(
    'v-aa',
    'ɑː',
    'Như "a" tiếng Việt nhưng dài, miệng mở rộng, lưỡi hạ thấp. Giọng Mỹ đọc "hot", "job", "talk" bằng âm này chứ không phải "o".',
    w('hot', 'father', 'job', 'stop', 'talk'),
    pr('hot', 'hat'),
  ),
  vowel(
    'v-oo',
    'ɔː',
    'Giọng Mỹ: âm này hầu như chỉ đứng trước /r/ (more, door). Tròn môi như "o" tiếng Việt, kéo dài rồi cong lưỡi sang /r/.',
    w('more', 'door', 'story', 'short', 'morning'),
    pr('short', 'shirt'),
  ),
  vowel(
    'v-u',
    'ʊ',
    'Ngắn, môi hơi tròn và thả lỏng, nghe giữa "ư" và "u". Không kéo dài thành /uː/: "full" khác "fool".',
    w('book', 'good', 'look', 'put', 'full'),
    pr('full', 'fool'),
  ),
  vowel(
    'v-uu',
    'uː',
    'Như "u" tiếng Việt nhưng dài, môi chu tròn ra trước.',
    w('food', 'school', 'blue', 'move', 'room'),
    pr('pull', 'pool'),
  ),
  vowel(
    'v-uh',
    'ʌ',
    'Gần "â" tiếng Việt (như "ân"), miệng mở vừa, ngắn. Chữ "u" và "o" hay đọc thế này: cup, love, money.',
    w('cup', 'but', 'come', 'love', 'money'),
    pr('cup', 'cap'),
  ),
  vowel(
    'v-er-long',
    'ɝː',
    'Như "ơ" dài nhưng cong đầu lưỡi về sau (không chạm vòm) suốt cả âm. Người Việt hay bỏ phần cong lưỡi, đọc "work" thành "wơk".',
    w('work', 'bird', 'first', 'learn', 'girl'),
    pr('walk', 'work'),
  ),
  vowel(
    'v-schwa',
    'ə',
    'Âm "ơ" rất nhẹ, rất ngắn, không nhấn. Đây là âm hay gặp nhất tiếng Anh: âm tiết không nhấn thường đọc thành /ə/ (a-BOUT, PROB-lem).',
    w('about', 'again', 'problem', 'family', 'around'),
  ),
  vowel(
    'v-er-weak',
    'ɚ',
    'Như /ə/ nhưng cong lưỡi kiểu /r/, ở âm tiết không nhấn: TEACH-er, WA-ter. Không đọc rõ "ơ" rồi bỏ r.',
    w('teacher', 'water', 'mother', 'number', 'after'),
  ),
]

// ---------------------------------------------------------------- Tuần 2: 8 nguyên âm đôi

const diphthong = (id: string, ipa: string, tip: string, examples: ExampleWord[], pair?: Pair): Sound => ({
  ...vowel(id, ipa, tip, examples, pair),
  kind: 'diphthong',
})

export const DIPHTHONGS: readonly Sound[] = [
  diphthong(
    'd-ei',
    'eɪ',
    'Trượt từ "e" sang "i", giống "ây" trong "đây". Người Việt hay đọc cụt thành "e": "late" phải nghe có đuôi "i".',
    w('day', 'make', 'name', 'great', 'today'),
    pr('late', 'let'),
  ),
  diphthong(
    'd-ai',
    'aɪ',
    'Như "ai" tiếng Việt (tai, hai): mở "a" rồi trượt lên "i".',
    w('time', 'like', 'right', 'night', 'buy'),
    pr('like', 'lake'),
  ),
  diphthong('d-oi', 'ɔɪ', 'Như "oi" tiếng Việt (đói): tròn môi "o" rồi trượt sang "i".', w('boy', 'point', 'enjoy', 'voice', 'choice')),
  diphthong(
    'd-ou',
    'oʊ',
    'Trượt từ "ô" sang "u", môi tròn dần. Người Việt hay đọc thành "ô" đơn ("no" thành "nô"): phải có cái trượt cuối.',
    w('go', 'know', 'home', 'open', 'show'),
    pr('low', 'law'),
  ),
  diphthong(
    'd-au',
    'aʊ',
    'Như "ao" tiếng Việt (sao): mở "a" rồi khép tròn môi về "u".',
    w('now', 'how', 'house', 'about', 'down'),
    pr('now', 'no'),
  ),
  diphthong(
    'd-ir',
    'ɪr',
    'Giọng Mỹ: /ɪ/ rồi cong lưỡi /r/, nghe như "ia" có r. Không đọc "hia" rồi bỏ r.',
    w('here', 'near', 'year', 'clear', 'hear'),
    pr('hear', 'hair'),
  ),
  diphthong(
    'd-er',
    'er',
    'Giọng Mỹ: /e/ rồi cong lưỡi /r/. Đọc "e" + r liền, không tách thành "e-ơ".',
    w('where', 'care', 'hair', 'share', 'there'),
    pr('hair', 'hear'),
  ),
  diphthong(
    'd-ur',
    'ʊr',
    'Giọng Mỹ: /ʊ/ ngắn rồi cong lưỡi /r/. Nhiều người Mỹ đọc "sure" gần như /ʃɝː/.',
    w('sure', 'poor', 'tour', 'during', 'tourist'),
  ),
]

// ---------------------------------------------------------------- Tuần 3: 24 phụ âm

const consonant = (
  id: string,
  ipa: string,
  tip: string,
  examples: ExampleWord[],
  pair?: Pair,
  focus = false,
): Sound => ({ id, ipa, kind: 'consonant', tip, examples, ...(pair && { pair }), ...(focus && { focus }) })

export const CONSONANTS: readonly Sound[] = [
  consonant(
    'c-p',
    'p',
    'Như "p" nhưng bật hơi mạnh ở đầu từ (để tờ giấy trước miệng sẽ thấy rung). Ở cuối từ (stop, help) phải khép môi, đừng nuốt.',
    w('people', 'put', 'help', 'stop', 'open'),
  ),
  consonant('c-b', 'b', 'Như "b" tiếng Việt, dây thanh rung. Cuối từ (job) vẫn khép môi rõ.', w('book', 'big', 'job', 'bad', 'about')),
  consonant(
    'c-t',
    't',
    'Đầu lưỡi chạm lợi trên (sau răng cửa), bật hơi: gần "th" tiếng Việt hơn "t". Giọng Mỹ giữa hai nguyên âm đọc nhẹ như "đ" (water).',
    w('time', 'take', 'want', 'start', 'tell'),
  ),
  consonant(
    'c-d',
    'd',
    'Gần "đ" tiếng Việt nhưng đầu lưỡi chạm lợi trên. Cuối từ (need, good) phải đọc ra, đừng bỏ.',
    w('day', 'do', 'good', 'need', 'read'),
  ),
  consonant(
    'c-k',
    'k',
    'Như "c/k" tiếng Việt, bật hơi ở đầu từ. Cuối từ (book, like) phải đóng cuống lưỡi rõ.',
    w('can', 'make', 'book', 'school', 'like'),
  ),
  consonant('c-g', 'ɡ', 'Như "g" tiếng Việt (ga), dây thanh rung. Cuối từ (big) đừng đọc thành "c".', w('go', 'get', 'good', 'big', 'again')),
  consonant(
    'c-f',
    'f',
    'Răng trên chạm môi dưới, thổi hơi, như "ph" tiếng Việt.',
    w('find', 'life', 'family', 'off', 'first'),
    pr('fan', 'van'),
  ),
  consonant(
    'c-v',
    'v',
    'Giống /f/ nhưng dây thanh rung, như "v" tiếng Việt. Cuối từ (love, give) vẫn giữ rung, đừng bỏ.',
    w('very', 'give', 'love', 'live', 'never'),
    pr('van', 'fan'),
  ),
  consonant(
    'c-th',
    'θ',
    'Không có trong tiếng Việt. Đặt đầu lưỡi giữa hai hàm răng rồi thổi hơi ra (không rung). Người Việt hay đọc thành "th" Việt, "t" hoặc "s": "think" thành "sink".',
    w('think', 'thank', 'both', 'month', 'health'),
    pr('think', 'sink'),
    true,
  ),
  consonant(
    'c-dh',
    'ð',
    'Lưỡi giữa hai hàm răng như /θ/ nhưng dây thanh rung, nghe như "đ" rất mềm. Người Việt hay đọc thành "d" hoặc "đ": "they" thành "day".',
    w('this', 'they', 'the', 'mother', 'with'),
    pr('they', 'day'),
    true,
  ),
  consonant(
    'c-s',
    's',
    'Như "x" tiếng Việt: đầu lưỡi gần lợi trên, môi không chu. /s/ cuối từ (bus, class) phải nghe rõ tiếng xì.',
    w('see', 'say', 'bus', 'class', 'sit'),
    // Story 28: chỉ so với âm cùng phần (Nhóm 2 có /z/); cặp /s/–/ʃ/ vẫn còn ở thẻ /ʃ/ (Nhóm 4).
    pr('sue', 'zoo'),
  ),
  consonant(
    'c-z',
    'z',
    'Như /s/ nhưng dây thanh rung, như tiếng ong "zzz". Hay bị đọc thành /s/ hoặc "d".',
    w('easy', 'music', 'because', 'please', 'news'),
    pr('zoo', 'sue'),
  ),
  consonant(
    'c-sh',
    'ʃ',
    'Chu môi tròn ra trước, lưỡi lùi lại, thổi hơi: như "s" uốn lưỡi tiếng Việt. Đừng đọc giống /s/: "she" khác "see".',
    w('she', 'show', 'sure', 'shop', 'wish'),
    pr('she', 'sea'),
    true,
  ),
  consonant(
    'c-zh',
    'ʒ',
    'Khẩu hình như /ʃ/ (chu môi) nhưng dây thanh rung, gần "gi" kéo dài. Hay gặp trong -sion, -sure, -sual.',
    w('usually', 'measure', 'television', 'vision', 'pleasure'),
    undefined,
    true,
  ),
  consonant(
    'c-ch',
    'tʃ',
    'Như "ch" tiếng Việt nhưng chu môi và bật hơi mạnh hơn. Cuối từ (much, watch) phải đọc ra.',
    w('much', 'teacher', 'child', 'watch', 'check'),
    pr('chip', 'ship'),
  ),
  consonant(
    'c-j',
    'dʒ',
    'Như /tʃ/ nhưng dây thanh rung, gần "gi" đọc mạnh. Cuối từ (age, change) đừng bỏ.',
    w('job', 'just', 'age', 'change', 'large'),
    pr('jeep', 'cheap'),
  ),
  consonant(
    'c-h',
    'h',
    'Như "h" tiếng Việt, chỉ là hơi thở nhẹ. Đừng bỏ /h/ đầu từ: "hat" khác "at".',
    w('have', 'home', 'help', 'how', 'house'),
    pr('hat', 'at'),
  ),
  consonant('c-m', 'm', 'Như "m" tiếng Việt. Cuối từ (time, home) phải khép môi.', w('make', 'time', 'home', 'some', 'man')),
  consonant(
    'c-n',
    'n',
    'Như "n" tiếng Việt: đầu lưỡi chạm lợi trên. Đừng nhầm "n" cuối với "ng".',
    w('new', 'now', 'man', 'can', 'need'),
    pr('thin', 'thing'),
  ),
  consonant(
    'c-ng',
    'ŋ',
    'Như "ng" tiếng Việt (sông). Chữ -ng cuối từ là một âm /ŋ/, không đọc thêm "g".',
    w('sing', 'long', 'thing', 'young', 'morning'),
    pr('thing', 'thin'),
  ),
  consonant(
    'c-l',
    'l',
    'Đầu lưỡi chạm lợi trên. Ở cuối từ (feel, school) lưỡi vẫn phải chạm, nghe hơi như "ồ": người Việt hay bỏ hẳn.',
    w('like', 'live', 'feel', 'call', 'school'),
    pr('light', 'right'),
  ),
  consonant(
    'c-r',
    'r',
    'Không rung như "r" tiếng Việt. Cong đầu lưỡi về sau, không chạm vòm, môi hơi chu. Hay bị đọc thành "z" hoặc "l".',
    w('right', 'read', 'run', 'around', 'try'),
    pr('right', 'light'),
  ),
  consonant(
    'c-y',
    'j',
    'Như "d" miền Nam hay "i" đứng đầu ("dạ" miền Nam). /j/ là âm chữ y, không phải chữ j. "year" khác "ear".',
    w('yes', 'you', 'year', 'young', 'music'),
    pr('year', 'ear'),
  ),
  consonant(
    'c-w',
    'w',
    'Như "oa" tiếng Việt (bỏ phần sau): chu môi tròn rồi mở ra. Không đọc thành "v".',
    w('we', 'way', 'work', 'week', 'one'),
    pr('west', 'vest'),
  ),
]

// ---------------------------------------------------------------- Tuần 4: âm cuối, đuôi -s

const ending = (id: string, ipa: string, tip: string, examples: ExampleWord[], pair?: Pair): Sound => ({
  id,
  ipa,
  kind: 'ending',
  tip,
  examples,
  ...(pair && { pair }),
})

export const ENDINGS_S: readonly Sound[] = [
  ending(
    'e-s-s',
    's',
    'Sau âm vô thanh /p t k f θ/: đuôi -s đọc /s/, xì nhẹ. Người Việt hay bỏ hẳn: phải nghe được tiếng "s".',
    [f('work', 'works', 'wɝːks'), f('help', 'helps', 'helps'), f('book', 'books', 'bʊks'), f('stop', 'stops', 'stɑːps')],
  ),
  ending(
    'e-s-z',
    'z',
    'Sau âm hữu thanh (nguyên âm, /b d ɡ v m n l r/…): đuôi -s đọc /z/, có rung như tiếng ong.',
    [
      f('play', 'plays', 'pleɪz'),
      f('day', 'days', 'deɪz'),
      f('car', 'cars', 'kɑːrz'),
      f('need', 'needs', 'niːdz'),
      f('live', 'lives', 'lɪvz'),
    ],
  ),
  ending(
    'e-s-iz',
    'ɪz',
    'Sau /s z ʃ ʒ tʃ dʒ/ (chữ -s, -ss, -sh, -ch, -x, -ge): thêm hẳn một âm tiết /ɪz/.',
    [
      f('class', 'classes', 'ˈklæsɪz'),
      f('watch', 'watches', 'ˈwɑːtʃɪz'),
      f('change', 'changes', 'ˈtʃeɪndʒɪz'),
      f('box', 'boxes', 'ˈbɑːksɪz'),
    ],
  ),
]

export const FINAL_CONSONANTS: readonly Sound[] = [
  ending(
    'e-final',
    'p t k d',
    'Tiếng Việt có -p -t -c cuối nhưng chỉ "ngậm" lại nên người Việt hay nuốt hoặc đọc lẫn phụ âm cuối. Tiếng Anh dùng chúng để phân biệt từ: "like" /laɪk/ khác "light" /laɪt/. Cuối từ phải khép môi (/p/), chạm lưỡi vào lợi trên (/t d/) hoặc nâng cuống lưỡi (/k/) thật rõ; /d/ cuối không được đọc thành /t/ hay bỏ.',
    w('like', 'light', 'good', 'help', 'week'),
    pr('like', 'light'),
  ),
]

// ---------------------------------------------------------------- Nội dung đoạn Phát âm từng tuần

export const PRONUNCIATION_W1: PronunciationContent = {
  intro:
    'Giọng Mỹ có 12 nguyên âm đơn. Nghe từng âm, đọc to các từ ví dụ 3 lần, rồi luyện câu mẫu ở cuối. Dấu ː nghĩa là âm dài.',
  groups: [{ title: '12 nguyên âm đơn', sounds: MONOPHTHONGS }],
  sentences: [
    { id: 's1-t1-w1-say-1', text: 'I am a student.', vi: 'Tôi là sinh viên.' },
    { id: 's1-t1-w1-say-2', text: 'She is my teacher.', vi: 'Cô ấy là giáo viên của tôi.' },
    { id: 's1-t1-w1-say-3', text: 'We are not busy.', vi: 'Chúng tôi không bận.' },
    { id: 's1-t1-w1-say-4', text: 'Is it hot today?', vi: 'Hôm nay có nóng không?' },
    { id: 's1-t1-w1-say-5', text: 'This book is good.', vi: 'Cuốn sách này hay.' },
  ],
}

export const PRONUNCIATION_W2: PronunciationContent = {
  intro:
    'Nguyên âm đôi là hai âm trượt liền nhau trong một âm tiết. Ba âm cuối (/ɪr er ʊr/) là cách giọng Mỹ đọc nguyên âm đứng trước r.',
  groups: [{ title: '8 nguyên âm đôi', sounds: DIPHTHONGS }],
  sentences: [
    { id: 's1-t1-w2-say-1', text: 'I go home at night.', vi: 'Tôi về nhà vào buổi tối.' },
    { id: 's1-t1-w2-say-2', text: 'He likes his new job.', vi: 'Anh ấy thích công việc mới.' },
    { id: 's1-t1-w2-say-3', text: 'They know my name.', vi: 'Họ biết tên tôi.' },
    { id: 's1-t1-w2-say-4', text: 'The boy plays here every day.', vi: 'Cậu bé chơi ở đây mỗi ngày.' },
  ],
}

export const PRONUNCIATION_W3: PronunciationContent = {
  intro: '24 phụ âm tiếng Anh. Chú ý 4 âm người Việt hay sai: /θ ð ʃ ʒ/ (đánh dấu ★), và luôn đọc rõ phụ âm cuối từ.',
  groups: [
    {
      title: '24 phụ âm',
      note: 'Cặp vô thanh / hữu thanh (p–b, t–d, k–g, f–v, θ–ð, s–z, ʃ–ʒ, tʃ–dʒ): khẩu hình giống nhau, chỉ khác dây thanh có rung hay không. Đặt tay lên cổ để cảm nhận.',
      sounds: CONSONANTS,
    },
  ],
  sentences: [
    { id: 's1-t1-w3-say-1', text: 'Do you think so?', vi: 'Bạn có nghĩ vậy không?' },
    { id: 's1-t1-w3-say-2', text: "She doesn't watch TV.", vi: 'Cô ấy không xem TV.' },
    { id: 's1-t1-w3-say-3', text: 'They usually share their things.', vi: 'Họ thường chia sẻ đồ của mình.' },
    { id: 's1-t1-w3-say-4', text: 'Does your mother live there?', vi: 'Mẹ bạn có sống ở đó không?' },
    { id: 's1-t1-w3-say-5', text: 'Thank you very much.', vi: 'Cảm ơn bạn rất nhiều.' },
  ],
}

export const PRONUNCIATION_W4: PronunciationContent = {
  intro:
    'Âm cuối là lỗi lớn nhất của người Việt: tiếng Anh dùng âm cuối để phân biệt nghĩa (like khác light, book khác books). Đuôi -s đọc /s/, /z/ hay /ɪz/ tuỳ âm đứng trước. Đuôi -ed học ở T2 tuần 3.',
  groups: [
    { title: 'Phụ âm cuối', sounds: FINAL_CONSONANTS },
    { title: 'Đuôi -s / -es', note: 'Áp dụng cho danh từ số nhiều và động từ ngôi thứ ba số ít (she works).', sounds: ENDINGS_S },
  ],
  sentences: [
    { id: 's1-t1-w4-say-1', text: 'She likes books and plays games.', vi: 'Cô ấy thích sách và chơi game.' },
    { id: 's1-t1-w4-say-2', text: 'My friend watches movies on Fridays.', vi: 'Bạn tôi xem phim vào các ngày thứ Sáu.' },
    { id: 's1-t1-w4-say-3', text: 'She works late and starts early.', vi: 'Cô ấy làm việc muộn và bắt đầu sớm.' },
    { id: 's1-t1-w4-say-4', text: 'He needs help, so she helps him.', vi: 'Anh ấy cần giúp đỡ, nên cô ấy giúp anh ấy.' },
  ],
}

// ---------------------------------------------------------------- Chia phần theo ngày (story 28)

type PartInput = Omit<LessonPart, 'id' | 'sentences'> & { sentences: readonly (readonly [string, string])[] }

/** Dựng phần của bài: id `${lessonId}-p${n}`, id câu `${partId}-say-${k}`. */
function parts(lessonId: string, inputs: readonly PartInput[]): readonly LessonPart[] {
  return inputs.map((p, i) => {
    const id = `${lessonId}-p${i + 1}`
    return { ...p, id, sentences: p.sentences.map(([text, vi], k) => ({ id: `${id}-say-${k + 1}`, text, vi })) }
  })
}

/** W1: 3 ngày × 4 nguyên âm. Chỉ dùng to be (hiện tại đơn học ở W2). */
export const PARTS_W1: readonly LessonPart[] = parts('s1-t1-w1', [
  {
    title: 'Ngày 1 · i và u, dài và ngắn',
    note: 'Hai cặp dài – ngắn /iː/ – /ɪ/ và /uː/ – /ʊ/: âm có dấu ː kéo dài hơn, môi căng hơn.',
    soundIds: ['v-ii', 'v-i', 'v-uu', 'v-u'],
    sentences: [
      ['This is a big school.', 'Đây là một ngôi trường lớn.'],
      ['The food is good.', 'Đồ ăn ngon.'],
      ['She is free this week.', 'Tuần này cô ấy rảnh.'],
    ],
    requires: ['demonstratives', 'be-affirmative', 'articles', 'adjective-before-noun', 'subject-pronouns', 'monophthongs'],
  },
  {
    title: 'Ngày 2 · e, /æ/, a dài và â',
    note: 'Bốn âm mở miệng từ vừa tới rộng; /æ/ không có trong tiếng Việt nên luyện kỹ hơn.',
    soundIds: ['v-e', 'v-ae', 'v-aa', 'v-uh'],
    sentences: [
      ['My bag is red.', 'Cái túi của tôi màu đỏ.'],
      ['The cup is not hot.', 'Cái cốc không nóng.'],
      ['Is your job fun?', 'Công việc của bạn có vui không?'],
    ],
    requires: ['possessive-adjectives', 'be-affirmative', 'articles', 'be-negative', 'be-questions', 'monophthongs'],
  },
  {
    title: 'Ngày 3 · o dài, ơ nhẹ và âm cong lưỡi',
    note: '/ɔː/ giọng Mỹ hay đứng trước r, /ə/ là âm nhẹ nhất, còn /ɝː/ và /ɚ/ phải cong lưỡi.',
    soundIds: ['v-oo', 'v-schwa', 'v-er-long', 'v-er-weak'],
    sentences: [
      ['My sister is a nurse.', 'Chị tôi là y tá.'],
      ['The water is warm.', 'Nước ấm.'],
      ['Her teacher is in the store.', 'Giáo viên của cô ấy ở trong cửa hàng.'],
    ],
    requires: ['possessive-adjectives', 'be-affirmative', 'articles', 'prepositions-of-place', 'monophthongs'],
  },
])

/** W2: 5 âm gần tiếng Việt, rồi 3 âm có r kiểu Mỹ. Thêm hiện tại đơn khẳng định. */
export const PARTS_W2: readonly LessonPart[] = parts('s1-t1-w2', [
  {
    title: '5 nguyên âm đôi gần tiếng Việt',
    note: 'Bốn âm gần vần tiếng Việt (ây, ai, oi, ao) và /oʊ/ (ô rồi chuyển sang u): nhớ đọc đủ phần đuôi ở cuối âm.',
    soundIds: ['d-ei', 'd-ai', 'd-oi', 'd-ou', 'd-au'],
    sentences: [
      ['They like my house.', 'Họ thích nhà tôi.'],
      ['The boy knows my name.', 'Cậu bé biết tên tôi.'],
      ['I go out at night.', 'Tôi ra ngoài vào buổi tối.'],
    ],
    requires: ['subject-pronouns', 'present-simple', 'possessive-adjectives', 'articles', 'prepositions-of-time', 'diphthongs'],
  },
  {
    title: '3 âm có r kiểu Mỹ',
    note: 'Đọc nguyên âm rồi cong lưỡi sang r liền một hơi, không tách thành hai âm.',
    soundIds: ['d-ir', 'd-er', 'd-ur'],
    sentences: [
      ['Their house is here.', 'Nhà của họ ở đây.'],
      ['We share our chairs.', 'Chúng tôi dùng chung ghế.'],
      ['She is a tourist here.', 'Cô ấy là khách du lịch ở đây.'],
    ],
    requires: ['possessive-adjectives', 'be-affirmative', 'subject-pronouns', 'present-simple', 'plurals', 'articles', 'diphthongs'],
  },
])

/** W3: 4 nhóm × 6 phụ âm, nhóm ★ /θ ð ʃ ʒ tʃ dʒ/ để cuối. Thêm phủ định / câu hỏi của hiện tại đơn. */
export const PARTS_W3: readonly LessonPart[] = parts('s1-t1-w3', [
  {
    title: 'Nhóm 1 · p b t d k g',
    note: 'Ba cặp vô thanh / hữu thanh: /p t k/ bật hơi ở đầu từ; cả 6 âm phải đọc rõ ở cuối từ.',
    soundIds: ['c-p', 'c-b', 'c-t', 'c-d', 'c-k', 'c-g'],
    sentences: [
      ["I don't need a big bag.", 'Tôi không cần túi to.'],
      ['Does he take the bus?', 'Anh ấy có đi xe buýt không?'],
      ['Put the cup down.', 'Đặt cái cốc xuống.'],
    ],
    requires: [
      'subject-pronouns',
      'present-simple',
      'present-simple-negative',
      'present-simple-questions',
      'articles',
      'adjective-before-noun',
      'imperatives',
      'consonants',
    ],
  },
  {
    title: 'Nhóm 2 · f v s z h m',
    note: '/f/ – /v/ và /s/ – /z/ có khẩu hình giống nhau, chỉ khác dây thanh có rung hay không.',
    soundIds: ['c-f', 'c-v', 'c-s', 'c-z', 'c-h', 'c-m'],
    sentences: [
      ['My family has a fast car.', 'Gia đình tôi có một chiếc xe chạy nhanh.'],
      ['He has a very nice house.', 'Anh ấy có một ngôi nhà rất đẹp.'],
      ['My mom makes soup.', 'Mẹ tôi nấu súp.'],
    ],
    requires: ['subject-pronouns', 'have-has', 'articles', 'adjective-before-noun', 'possessive-adjectives', 'present-simple', 'consonants'],
  },
  {
    title: 'Nhóm 3 · n ng l r y w',
    note: '/n ŋ/ (hơi ra đằng mũi), /l r/ và /j w/: /l/ cuối từ vẫn chạm lưỡi, /r/ cong lưỡi chứ không rung.',
    soundIds: ['c-n', 'c-ng', 'c-l', 'c-r', 'c-y', 'c-w'],
    sentences: [
      ['We walk in the morning.', 'Chúng tôi đi bộ vào buổi sáng.'],
      ['Do you like yellow?', 'Bạn có thích màu vàng không?'],
      ['Young people run a lot.', 'Người trẻ chạy bộ nhiều.'],
    ],
    requires: [
      'subject-pronouns',
      'present-simple',
      'present-simple-questions',
      'prepositions-of-time',
      'articles',
      'adjective-before-noun',
      'irregular-plurals',
      'consonants',
    ],
  },
  {
    title: 'Nhóm 4 · ★ θ ð ʃ ʒ + tʃ dʒ',
    note: 'Nhóm người Việt hay sai nhất: /θ ð/ đặt lưỡi giữa hai hàm răng, /ʃ ʒ tʃ dʒ/ chu môi ra trước.',
    soundIds: ['c-th', 'c-dh', 'c-sh', 'c-zh', 'c-ch', 'c-j'],
    sentences: [
      ['They usually watch TV.', 'Họ thường xem TV.'],
      ["She doesn't share her things.", 'Cô ấy không cho ai dùng chung đồ của mình.'],
      ['Do they enjoy their jobs?', 'Họ có thích công việc của mình không?'],
    ],
    requires: [
      'subject-pronouns',
      'frequency-adverbs',
      'present-simple',
      'present-simple-negative',
      'present-simple-questions',
      'possessive-adjectives',
      'plurals',
      'consonants',
    ],
  },
])
