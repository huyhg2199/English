import type { MistakeTag, Question, QuestionKind } from './types'
import type { SectionId } from '@/data/roadmap/types'

/**
 * 66 câu tháng T2–T4 (6 câu mỗi bài có nội dung, trừ tuần Tết `s1-t4-w2`), bám nội dung story 10.
 * Tự soạn theo khuôn ETS, không chép đề. Tuần O.W.L. 1 (`s1-t4-w4`) không có đoạn Ngữ pháp nên mọi câu
 * gắn đoạn Phát âm (nơi có phần ôn tổng).
 */

const LISTEN_PROMPT = 'Nghe và chọn câu bạn vừa nghe.'

type Opts = readonly [string, string, string, string]

function make(
  lessonId: string,
  n: number,
  sectionId: SectionId,
  tag: MistakeTag,
  kind: QuestionKind,
  prompt: string,
  options: Opts,
  explanation: string,
): Question {
  const q: Question = {
    id: `q-${lessonId}-${String(n).padStart(2, '0')}`,
    lessonId,
    sectionId,
    tag,
    kind,
    prompt,
    options,
    answer: options[0],
    explanation,
  }
  return kind === 'listening' ? { ...q, audioText: options[0] } : q
}

/** Bộ dựng câu cho một bài: lựa chọn đầu tiên luôn là đáp án (khi làm bài, lựa chọn được xáo). */
function lesson(lessonId: string, grammarSection: SectionId = 'grammar') {
  return {
    grammar: (n: number, prompt: string, options: Opts, explanation: string, tag: MistakeTag = 'thì') =>
      make(lessonId, n, grammarSection, tag, 'choice', prompt, options, explanation),
    sound: (n: number, prompt: string, options: Opts, explanation: string) =>
      make(lessonId, n, 'pronunciation', 'phát âm', 'pronunciation', prompt, options, explanation),
    listen: (n: number, options: Opts, explanation: string) =>
      make(lessonId, n, 'pronunciation', 'nghe', 'listening', LISTEN_PROMPT, options, explanation),
  }
}

const STRESS_ODD = 'Chọn từ có trọng âm khác ba từ còn lại.'

const t2w1 = lesson('s1-t2-w1')
const t2w2 = lesson('s1-t2-w2')
const t2w3 = lesson('s1-t2-w3')
const t2w4 = lesson('s1-t2-w4')
const t3w1 = lesson('s1-t3-w1')
const t3w2 = lesson('s1-t3-w2')
const t3w3 = lesson('s1-t3-w3')
const t3w4 = lesson('s1-t3-w4')
const t4w1 = lesson('s1-t4-w1')
const t4w3 = lesson('s1-t4-w3')
const t4w4 = lesson('s1-t4-w4', 'pronunciation')

export const T2_T4_QUESTIONS: readonly Question[] = [
  // ── T2 tuần 1: hiện tại tiếp diễn · trọng âm 2 âm tiết ──
  t2w1.grammar(1, 'Look! The children ___ in the garden.', ['are playing', 'is playing', 'play', 'playing'],
    'Việc đang diễn ra (Look!) dùng hiện tại tiếp diễn; children là số nhiều nên are playing.'),
  t2w1.grammar(2, 'I ___ TV right now.', ['am not watching', 'not watching', "don't watching", 'am not watch'],
    'Phủ định hiện tại tiếp diễn: am / is / are + not + V-ing. Không bỏ am, không dùng don\'t.'),
  t2w1.grammar(3, '___ she working today?', ['Is', 'Does', 'Are', 'Do'],
    'Câu hỏi hiện tại tiếp diễn đảo am / is / are lên đầu; she đi với is. Không dùng does với V-ing.'),
  t2w1.grammar(4, 'He is ___ a letter now.', ['writing', 'writeing', 'write', 'writes'],
    'Động từ tận cùng e câm thì bỏ e rồi thêm -ing: write → writing.'),
  t2w1.sound(5, STRESS_ODD, ['decide', 'student', 'problem', 'money'],
    'decide là động từ, nhấn âm 2 (de-CIDE). student, problem, money là danh từ, nhấn âm 1.'),
  t2w1.listen(6, ['She is preparing dinner.', 'She prepares dinner.', 'He is preparing dinner.', 'She is preparing lunch.'],
    'Nghe "is" và đuôi -ing (preparing); động từ prepare nhấn âm 2: pre-PARE.'),

  // ── T2 tuần 2: quá khứ đơn có quy tắc · trọng âm theo hậu tố ──
  t2w2.grammar(1, 'I ___ my parents last Sunday.', ['visited', 'visit', 'visits', 'am visiting'],
    'Có mốc đã xong (last Sunday) → quá khứ đơn: visit → visited.'),
  t2w2.grammar(2, 'She ___ English at university in 2019.', ['studied', 'studyed', 'studies', 'study'],
    'Mốc 2019 đã xong → quá khứ. Phụ âm + y đổi thành -ied: study → studied.'),
  t2w2.grammar(3, 'We ___ the movie yesterday.', ["didn't watch", "didn't watched", "don't watched", 'not watched'],
    "Phủ định quá khứ: didn't + động từ nguyên mẫu (did đã mang quá khứ)."),
  t2w2.grammar(4, '___ you call him last night?', ['Did', 'Do', 'Were', 'Are'],
    'Câu hỏi quá khứ với động từ thường: Did + S + nguyên mẫu. last night là quá khứ nên không dùng Do.'),
  t2w2.sound(5, 'Chọn từ có trọng âm rơi vào âm tiết thứ 3.', ['information', 'condition', 'position', 'activity'],
    'Nhấn ngay trước hậu tố: in-for-MA-tion (âm 3). con-DI-tion, po-SI-tion, ac-TIV-i-ty đều nhấn âm 2.'),
  t2w2.listen(6, [
    'We talked about the economic situation.',
    'We talk about the economic situation.',
    'We talked about the economic solution.',
    'They talked about the economic situation.',
  ], 'Nghe đuôi -ed của talked (/t/) và trọng âm ec-o-NOM-ic, sit-u-A-tion.'),

  // ── T2 tuần 3: động từ bất quy tắc · phát âm -ed ──
  t2w3.grammar(1, 'I ___ to Da Lat last month.', ['went', 'goed', 'gone', 'go'],
    'go là bất quy tắc: go – went – gone. Quá khứ đơn dùng cột 2: went.'),
  t2w3.grammar(2, 'She ___ a new bag yesterday.', ['bought', 'buyed', 'brought', 'buys'],
    'buy – bought – bought (mua). brought là quá khứ của bring (mang đến), dễ nhầm.'),
  t2w3.grammar(3, 'Did you ___ the email?', ['see', 'saw', 'seen', 'sees'],
    'Sau Did dùng động từ nguyên mẫu (V1): Did you see…?'),
  t2w3.grammar(4, 'They ___ dinner at a small restaurant last night.', ['ate', 'eated', 'eaten', 'eat'],
    'eat – ate – eaten. Quá khứ đơn (last night) dùng cột 2: ate.'),
  t2w3.sound(5, 'Chọn từ có đuôi -ed đọc khác ba từ còn lại.', ['visited', 'asked', 'looked', 'cooked'],
    'visited tận cùng /t/ nên -ed đọc /ɪd/. asked, looked, cooked tận cùng âm vô thanh /k/ nên -ed đọc /t/.'),
  t2w3.listen(6, [
    'He went home and cooked dinner.',
    'He goes home and cooks dinner.',
    'He went home and cooks dinner.',
    'He went home and looked for dinner.',
  ], 'Nghe went (quá khứ của go) và đuôi /t/ rất nhẹ ở cooked.'),

  // ── T2 tuần 4: ôn lại ──
  t2w4.grammar(1, 'Right now, my brother ___ a shower.', ['is taking', 'takes', 'took', 'take'],
    'Right now → việc đang diễn ra: is taking (hiện tại tiếp diễn).'),
  t2w4.grammar(2, 'Last night I ___ very tired.', ['was', 'were', 'am', 'did'],
    'Quá khứ của to be: I / he / she / it was; you / we / they were.'),
  t2w4.grammar(3, 'He ___ his homework yesterday.', ["didn't do", "didn't did", "doesn't do", 'not did'],
    "Phủ định quá khứ: didn't + nguyên mẫu. do ở đây là động từ chính nên vẫn cần didn't do."),
  t2w4.grammar(4, 'Where ___ you go last weekend?', ['did', 'were', 'do', 'are'],
    'Câu hỏi Wh- ở quá khứ: Where did + S + nguyên mẫu?'),
  t2w4.sound(5, STRESS_ODD, ['hotel', 'coffee', 'morning', 'family'],
    'hotel là ngoại lệ, nhấn âm 2: ho-TEL. coffee, morning, family nhấn âm 1.'),
  t2w4.listen(6, [
    'My family visited the village last weekend.',
    'My family visits the village every weekend.',
    'My family visited the village last week.',
    'My family visited the valley last weekend.',
  ], 'Nghe đuôi -ed /ɪd/ của visited và cụm last weekend.'),

  // ── T3 tuần 1: will · dạng yếu ──
  t3w1.grammar(1, "It's cold. I ___ close the window.", ['will', 'am', 'going', 'do'],
    'Quyết định ngay lúc nói (vì thấy lạnh) dùng will + nguyên mẫu.'),
  t3w1.grammar(2, 'She will ___ you tomorrow.', ['call', 'calls', 'to call', 'calling'],
    'Sau will luôn là động từ nguyên mẫu, không -s, không to.'),
  t3w1.grammar(3, "Don't worry. I ___ forget.", ["won't", "don't", "willn't", 'not will'],
    "Phủ định của will là will not = won't. Không có willn't."),
  t3w1.grammar(4, '___ you help me with this box?', ['Will', 'Are', 'Is', 'Have'],
    'Nhờ ai làm gì ngay: Will you + nguyên mẫu…?'),
  t3w1.sound(5, 'Trong câu nói tự nhiên "I want to go", từ "to" thường đọc là:', ['/tə/', '/tuː/', '/toʊ/', '/tɑː/'],
    'to là từ chức năng nên đọc dạng yếu /tə/ (gần "tờ"); chỉ đọc /tuː/ khi đứng một mình hoặc cuối câu.'),
  t3w1.listen(6, ['I can help you tomorrow.', "I can't help you tomorrow.", 'I can help you today.', 'I will help you tomorrow.'],
    'can trong câu khẳng định đọc nhẹ /kən/; can\'t đọc rõ /kænt/ và được nhấn.'),

  // ── T3 tuần 2: be going to · nối âm ──
  t3w2.grammar(1, 'Look at those clouds! It ___ rain.', ['is going to', 'going to', 'will to', 'goes to'],
    'Dự đoán có dấu hiệu trước mắt (mây đen) dùng be going to; cần đủ is + going to.'),
  t3w2.grammar(2, 'We are going to ___ our grandparents.', ['visit', 'visiting', 'visits', 'visited'],
    'Sau going to là động từ nguyên mẫu.'),
  t3w2.grammar(3, 'What ___ you going to do this weekend?', ['are', 'do', 'will', 'is'],
    'Câu hỏi be going to đảo am / is / are lên trước chủ ngữ; you đi với are.'),
  t3w2.grammar(4, "He ___ going to buy a car. He doesn't have any money.", ["isn't", "doesn't", "won't", 'not'],
    "Phủ định be going to: am / is / are + not. He → isn't going to."),
  t3w2.sound(5, 'Khi nói nhanh, "I\'m going to call" thường nghe thành:', ["I'm gonna call", "I'm wanna call", "I'm gotta call", "I'm going call"],
    'going to + động từ nói nhanh thành gonna. wanna = want to, gotta = have got to.'),
  t3w2.listen(6, ['Turn off the light.', 'Turn on the light.', 'Turn off the lights.', 'Turn off the night.'],
    'turn off nối thành "tur-noff"; nghe kỹ âm /f/ ở cuối off để phân biệt với on.'),

  // ── T3 tuần 3: hiện tại hoàn thành (1) · trọng âm câu ──
  t3w3.grammar(1, 'I have ___ that movie three times.', ['seen', 'saw', 'see', 'seeing'],
    'Sau have / has dùng V3: see – saw – seen.'),
  t3w3.grammar(2, 'She ___ never been to Japan.', ['has', 'have', 'is', 'did'],
    'Hiện tại hoàn thành: she đi với has (has never been).'),
  t3w3.grammar(3, '___ you ever eaten pho?', ['Have', 'Did', 'Do', 'Are'],
    'Hỏi trải nghiệm: Have + S + ever + V3 (eaten)?'),
  t3w3.grammar(4, "He hasn't finished his report ___.", ['yet', 'already', 'ever', 'just'],
    "yet đứng cuối câu phủ định / câu hỏi: hasn't … yet = vẫn chưa."),
  t3w3.sound(5, 'Trong câu "I want to buy a new phone", từ nào thường KHÔNG được nhấn?', ['to', 'want', 'buy', 'phone'],
    'to là từ chức năng nên đọc nhẹ /tə/. want, buy, phone là từ nội dung nên được nhấn.'),
  t3w3.listen(6, ['She has visited Japan twice.', 'She visited Japan twice.', 'She has visited Japan once.', 'He has visited Japan twice.'],
    "has thường đọc nhẹ /həz/; vẫn phải nghe ra nó để phân biệt với quá khứ đơn."),

  // ── T3 tuần 4: hiện tại hoàn thành (2) và quá khứ đơn · shadowing ──
  t3w4.grammar(1, 'I ___ in Hanoi since 2020.', ['have lived', 'live', 'lived', 'am living'],
    'since + mốc bắt đầu, việc kéo dài tới giờ → hiện tại hoàn thành: have lived.'),
  t3w4.grammar(2, 'We ___ to Hue last year.', ['went', 'have gone', 'go', 'have went'],
    'Có mốc đã xong (last year) → quá khứ đơn: went.'),
  t3w4.grammar(3, 'She has worked here ___ three years.', ['for', 'since', 'from', 'ago'],
    'for + khoảng thời gian (three years); since + mốc bắt đầu.', 'giới từ'),
  t3w4.grammar(4, 'When ___ you arrive in Hanoi? — Two days ago.', ['did', 'have', 'do', 'are'],
    'Câu hỏi When… hỏi một lúc đã xong → quá khứ đơn: When did you arrive?'),
  t3w4.sound(5, 'Trong câu nói nhanh "I have lived here for five years", từ "for" thường đọc là:', ['/fɚ/', '/fɔːr/', '/foʊ/', '/faɪv/'],
    'for là từ chức năng nên đọc dạng yếu /fɚ/; chỉ đọc /fɔːr/ khi nhấn mạnh.'),
  t3w4.listen(6, ["I've known him since 2020.", 'I know him since 2020.', "I've known him for 20 years.", "I've known her since 2020."],
    "I've đọc liền /aɪv/, nghe âm /v/ rất nhẹ; since đi với mốc (2020), for đi với khoảng (20 years)."),

  // ── T4 tuần 1: can / should / must · dạng rút gọn ──
  t4w1.grammar(1, 'He can ___ three languages.', ['speak', 'speaks', 'to speak', 'speaking'],
    'Sau can là động từ nguyên mẫu, không -s, không to.'),
  t4w1.grammar(2, 'You look tired. You ___ go to bed early.', ['should', "mustn't", "can't", "don't"],
    'Lời khuyên dùng should + nguyên mẫu.'),
  t4w1.grammar(3, "You ___ smoke here. It's not allowed.", ["mustn't", "don't have to", 'should', 'can'],
    "Cấm làm gì dùng mustn't. don't have to nghĩa là không cần làm (vẫn được làm)."),
  t4w1.grammar(4, '___ I use your phone, please?', ['Can', 'Do', 'Am', 'Does'],
    'Xin phép: Can I + nguyên mẫu…? Không mượn do / does.'),
  t4w1.sound(5, 'Khi nói nhanh, "I want to go" thường nghe thành:', ['I wanna go', 'I gotta go', "I'd go", 'I gonna go'],
    'want to nói nhanh thành wanna. gotta = have got to; "I gonna" thiếu am.'),
  t4w1.listen(6, ["I'd like some water, please.", 'I like some water, please.', "I'd like some coffee, please.", "You'd like some water, please."],
    "I'd like (= I would like) có âm /d/ rất nhẹ giữa I và like: nghe kỹ để phân biệt với I like."),

  // ── T4 tuần 3: so sánh · bị động hiện tại · chép chính tả ──
  t4w3.grammar(1, 'My new phone is ___ than my old one.', ['cheaper', 'more cheap', 'cheapest', 'more cheaper'],
    'Tính từ ngắn + -er + than: cheaper than. Không thêm more.', 'từ loại'),
  t4w3.grammar(2, 'This is ___ restaurant in town.', ['the best', 'the better', 'best', 'the goodest'],
    'So sánh nhất của good là the best (luôn có the).', 'từ loại'),
  t4w3.grammar(3, 'English ___ in many countries.', ['is spoken', 'speaks', 'is speak', 'are spoken'],
    'Tiếng Anh "được nói" → bị động: is + V3 (spoken). English là số ít nên is.'),
  t4w3.grammar(4, 'These cars ___ in Japan.', ['are made', 'is made', 'make', 'are make'],
    'Bị động: are + V3 (made); these cars số nhiều nên are.'),
  t4w3.sound(5, STRESS_ODD, ['important', 'beautiful', 'family', 'hospital'],
    'important nhấn âm 2: im-POR-tant. beautiful, family, hospital nhấn âm 1.'),
  t4w3.listen(6, ['My brother is taller than me.', 'My brother is smaller than me.', 'My mother is taller than me.', 'My brother is the tallest.'],
    'Nghe đuôi -er và than đọc nhẹ /ðən/.'),

  // ── T4 tuần 4: ôn tổng chặng 1 (gắn đoạn Phát âm vì bài không có đoạn Ngữ pháp) ──
  t4w4.grammar(1, "I ___ my keys. I can't find them now.", ['have lost', 'lose', 'am losing', 'has lost'],
    'Việc trong quá khứ còn kết quả ở hiện tại (giờ không tìm thấy) → hiện tại hoàn thành; I đi với have.'),
  t4w4.grammar(2, 'Tomorrow it ___ sunny.', ['will be', 'is being', 'was', 'has been'],
    'Dự đoán cho tương lai (tomorrow) dùng will + be.'),
  t4w4.grammar(3, 'They ___ football every Sunday.', ['play', 'plays', 'are play', 'playing'],
    'Thói quen (every Sunday) → hiện tại đơn; they đi với động từ nguyên mẫu.'),
  t4w4.grammar(4, 'Hanoi is ___ than Hue.', ['bigger', 'more big', 'biggest', 'the bigger'],
    'big là tính từ ngắn: gấp đôi g rồi thêm -er → bigger than.', 'từ loại'),
  t4w4.sound(5, 'Chọn từ có trọng âm rơi vào âm tiết thứ 2.', ['decide', 'people', 'happy', 'money'],
    'Động từ hai âm tiết thường nhấn âm 2: de-CIDE. people, happy, money nhấn âm 1.'),
  t4w4.listen(6, ["We didn't see the movie.", "We don't see the movie.", "We didn't see the moon.", 'We did see the movie.'],
    "did đọc /dɪd/; didn't đọc /ˈdɪdənt/, có thêm âm mũi /n/ và được nhấn (từ phủ định là từ nội dung), còn /t/ cuối hay bị nuốt. Nghe âm /n/ và chỗ nhấn, đừng chờ /t/."),
]
