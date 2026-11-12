import type { RequiredConcept } from '@/data/questions/concepts'

import type { GrammarDay, GrammarDayKind, MinimalPair } from './types'

/**
 * Ngữ pháp theo ngày (story 47): 8 bài học một thì (hay hai thì chung khuôn) trong một tuần chia đoạn Ngữ pháp thành 5
 * ngày: N1 khẳng định → N2 phủ định → N3 câu hỏi → N4 so với thì trước (khối "Chọn thì" có sẵn của bài hoặc 3 cặp câu
 * mới) → N5 ôn trộn cả tuần (cả đoạn Ngữ pháp như cũ, có kiểm tra cuối Bài chính).
 * Không chia: T1 (đã chia đoạn Phát âm), s1-t3-w4 (bài so sánh), s1-t4-w3 (so sánh không có khuôn khẳng định / phủ định /
 * câu hỏi), s1-t4-w4 (ôn tổng).
 *
 * Câu luyện nói và cặp câu tự soạn, chỉ dùng chữ trong phạm vi chữ của thì cuối bài (`outOfScopeWords`), không trùng câu
 * ví dụ, câu luyện hay đề quiz của cùng bài; `requires` khai báo tay theo luật câu hỏi (story 27, 47).
 */

type Say = readonly [en: string, vi: string]

type DaySpec = {
  title: string
  note: string
  focus?: GrammarDay['focus']
  say?: readonly [Say, Say, Say]
  choiceIds?: readonly string[]
  compare?: { withTenseIds: readonly string[]; pairs: readonly [MinimalPair, MinimalPair, MinimalPair] }
  requires?: readonly RequiredConcept[]
}

const KINDS: readonly GrammarDayKind[] = ['affirmative', 'negative', 'question', 'compare', 'mixed']

const MIXED_NOTE = 'Hôm nay ôn cả tuần: xem lại cả thẻ, làm khối luyện rồi làm kiểm tra 5 câu cuối Bài chính.'

/** Năm ngày của một bài: 4 ngày soạn tay (N1–N4) và ngày ôn trộn N5. */
function grammarDays(lessonId: string, days: readonly [DaySpec, DaySpec, DaySpec, DaySpec]): readonly GrammarDay[] {
  const built: GrammarDay[] = days.map((d, i) => {
    const id = `${lessonId}-n${i + 1}`
    return {
      id,
      kind: KINDS[i],
      title: d.title,
      note: d.note,
      ...(d.focus ? { focus: d.focus } : {}),
      ...(d.say ? { sentences: d.say.map(([text, vi], k) => ({ id: `${id}-say-${k + 1}`, text, vi })) } : {}),
      ...(d.choiceIds ? { choiceIds: d.choiceIds } : {}),
      ...(d.compare ? { compare: d.compare } : {}),
      ...(d.requires ? { requires: d.requires } : {}),
    }
  })
  built.push({ id: `${lessonId}-n5`, kind: 'mixed', title: 'Ôn trộn cả tuần', note: MIXED_NOTE })
  return built
}

const pair = (a: Say, b: Say, noteVi: string): MinimalPair => ({ a: { en: a[0], vi: a[1] }, b: { en: b[0], vi: b[1] }, noteVi })

const f = (tenseId: string, ...labels: string[]) => ({ tenseId, labels })

// ---------------------------------------------------------------- T2

export const DAYS_T2_W1 = grammarDays('s1-t2-w1', [
  {
    title: 'Câu khẳng định',
    note: 'Hôm nay chỉ nói việc đang diễn ra: am / is / are + V-ing.',
    focus: [f('present-continuous', 'Khẳng định')],
    say: [
      // Mẫu Design Notes "She is cooking dinner now." trùng câu mẫu của phần luyện thì nên đổi chủ ngữ.
      ['My mother is cooking dinner now.', 'Bây giờ mẹ tôi đang nấu bữa tối.'],
      ['My friends are playing football in the park.', 'Các bạn tôi đang đá bóng trong công viên.'],
      ["I'm waiting for my sister.", 'Tôi đang đợi chị gái tôi.'],
    ],
    requires: ['subject-pronouns', 'possessive-adjectives', 'plurals', 'articles', 'prepositions-of-place', 'be-affirmative', 'present-continuous'],
  },
  {
    title: 'Câu phủ định',
    note: 'Hôm nay nói việc không diễn ra lúc này: thêm not ngay sau am / is / are.',
    focus: [f('present-continuous', 'Phủ định')],
    say: [
      ["I'm not working today.", 'Hôm nay tôi không làm việc.'],
      ["The children aren't sleeping.", 'Lúc này bọn trẻ không ngủ.'],
      ["He isn't listening to the teacher.", 'Cậu ấy không nghe cô giáo nói.'],
    ],
    requires: ['subject-pronouns', 'irregular-plurals', 'articles', 'be-negative', 'present-continuous'],
  },
  {
    title: 'Câu hỏi',
    note: 'Hôm nay hỏi việc đang diễn ra: đưa am / is / are lên trước chủ ngữ.',
    focus: [f('present-continuous', 'Câu hỏi')],
    say: [
      ['Are you listening to me?', 'Bạn có đang nghe tôi nói không?'],
      ['Is it raining now?', 'Bây giờ trời có đang mưa không?'],
      ['What are they eating?', 'Họ đang ăn gì vậy?'],
    ],
    requires: ['subject-pronouns', 'object-pronouns', 'be-questions', 'wh-questions', 'present-continuous'],
  },
  {
    title: 'So với hiện tại đơn',
    note: 'Hôm nay đặt hai thì cạnh nhau: thói quen (hiện tại đơn) hay việc đang diễn ra (hiện tại tiếp diễn).',
    choiceIds: ['simple-vs-continuous'],
    requires: ['present-simple', 'present-continuous'],
  },
])

export const DAYS_T2_W2 = grammarDays('s1-t2-w2', [
  {
    title: 'Câu khẳng định',
    note: 'Hôm nay kể việc đã xong: was / were, There was / were và động từ thêm -ed.',
    focus: [f('past-to-be', 'Khẳng định', 'There was / were'), f('past-simple', 'Khẳng định')],
    say: [
      ['We were at the beach last summer.', 'Mùa hè năm ngoái chúng tôi ở biển.'],
      ['There was a big party on Saturday.', 'Hôm thứ Bảy có một bữa tiệc lớn.'],
      ['My sister cleaned the kitchen this morning.', 'Sáng nay chị tôi dọn bếp.'],
    ],
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'articles',
      'demonstratives',
      'adjective-before-noun',
      'prepositions-of-place',
      'prepositions-of-time',
      'days-months',
      'there-is-are',
      'be-affirmative',
      'past-to-be',
      'past-simple',
    ],
  },
  {
    title: 'Câu phủ định',
    note: "Hôm nay nói điều đã không xảy ra: wasn't / weren't với to be, didn't + nguyên mẫu với động từ thường.",
    focus: [f('past-to-be', 'Phủ định'), f('past-simple', 'Phủ định')],
    say: [
      ["The shop wasn't open yesterday.", 'Hôm qua cửa hàng không mở cửa.'],
      ["My parents weren't tired.", 'Bố mẹ tôi không mệt.'],
      ["I didn't watch the news last night.", 'Tối qua tôi không xem thời sự.'],
    ],
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'articles',
      'plurals',
      'be-negative',
      'present-simple-negative',
      'past-to-be',
      'past-simple',
    ],
  },
  {
    title: 'Câu hỏi',
    note: 'Hôm nay hỏi về chuyện đã qua: Was / Were + chủ ngữ, Did + chủ ngữ + nguyên mẫu, và câu hỏi chủ ngữ.',
    focus: [f('past-to-be', 'Câu hỏi'), f('past-simple', 'Câu hỏi', 'Câu hỏi Wh-')],
    say: [
      ['Was the test easy?', 'Bài kiểm tra có dễ không?'],
      ['Did you call your mother?', 'Bạn có gọi cho mẹ không?'],
      ['When did they arrive?', 'Họ đến lúc nào?'],
    ],
    choiceIds: ['subject-questions'],
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'articles',
      'be-questions',
      'wh-questions',
      'present-simple-questions',
      'past-to-be',
      'past-simple',
      'subject-questions',
    ],
  },
  {
    title: 'So với thì hiện tại',
    note: 'Hôm nay so quá khứ với hiện tại: is → was, are → were, do → did.',
    compare: {
      withTenseIds: ['to-be', 'present-simple-questions'],
      pairs: [
        pair(
          ['My room is clean today.', 'Hôm nay phòng tôi sạch.'],
          ['My room was clean yesterday.', 'Hôm qua phòng tôi sạch.'],
          'today là bây giờ → is; yesterday đã qua → was. Tiếng Việt không đổi chữ, tiếng Anh phải đổi to be.',
        ),
        pair(
          ['Do you work on Sunday?', 'Bạn có làm việc vào Chủ nhật không?'],
          ['Did you work on Sunday?', 'Chủ nhật vừa rồi bạn có làm việc không?'],
          'Hỏi thói quen → Do; hỏi một Chủ nhật đã qua → Did. Sau Do / Did động từ đều giữ nguyên mẫu.',
        ),
        pair(
          ["They aren't at school today.", 'Hôm nay họ không ở trường.'],
          ["They weren't at school last week.", 'Tuần trước họ không ở trường.'],
          "aren't (bây giờ) → weren't (đã qua). Phủ định của to be thêm not, không mượn didn't.",
        ),
      ],
    },
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'prepositions-of-place',
      'prepositions-of-time',
      'days-months',
      'be-affirmative',
      'be-negative',
      'present-simple-questions',
      'past-to-be',
      'past-simple',
    ],
  },
])

export const DAYS_T2_W3 = grammarDays('s1-t2-w3', [
  {
    title: 'Câu khẳng định',
    note: 'Hôm nay kể chuyện bằng cột 2 (V2) của động từ bất quy tắc.',
    focus: [f('past-simple-irregular', 'Khẳng định')],
    say: [
      ['We drank coffee after lunch.', 'Chúng tôi uống cà phê sau bữa trưa.'],
      ['My father found his keys in the car.', 'Bố tôi tìm thấy chìa khoá trong xe.'],
      ['She told me a funny story.', 'Cô ấy kể cho tôi một câu chuyện vui.'],
    ],
    requires: [
      'subject-pronouns',
      'object-pronouns',
      'possessive-adjectives',
      'articles',
      'plurals',
      'adjective-before-noun',
      'prepositions-of-place',
      'verb-forms',
      'past-simple-irregular',
    ],
  },
  {
    title: 'Câu phủ định',
    note: "Hôm nay nói điều đã không làm: didn't + V1, động từ về nguyên mẫu.",
    focus: [f('past-simple-irregular', 'Phủ định / câu hỏi')],
    say: [
      ["I didn't sleep well last night.", 'Tối qua tôi ngủ không ngon.'],
      ["They didn't buy any bread.", 'Họ không mua chút bánh mì nào.'],
      ["He didn't understand the question.", 'Anh ấy không hiểu câu hỏi.'],
    ],
    requires: [
      'subject-pronouns',
      'articles',
      'quantifiers',
      'countable-uncountable',
      'present-simple-negative',
      'past-simple',
      'verb-forms',
      'past-simple-irregular',
    ],
  },
  {
    title: 'Câu hỏi',
    note: 'Hôm nay hỏi chuyện đã qua: Did + chủ ngữ + V1, kể cả khi hỏi bằng What / Where.',
    focus: [f('past-simple-irregular', 'Phủ định / câu hỏi')],
    say: [
      ['Did she send you the photos?', 'Cô ấy có gửi ảnh cho bạn không?'],
      ['Where did you buy that hat?', 'Bạn mua cái mũ đó ở đâu?'],
      ['What did he say?', 'Anh ấy đã nói gì?'],
    ],
    requires: [
      'subject-pronouns',
      'object-pronouns',
      'articles',
      'plurals',
      'demonstratives',
      'wh-questions',
      'present-simple-questions',
      'past-simple',
      'verb-forms',
      'past-simple-irregular',
    ],
  },
  {
    title: 'So với động từ có quy tắc',
    note: 'Hôm nay so hai kiểu quá khứ: thêm -ed (walked) hay đổi hẳn chữ (went). Cột 3 (V3) để dành cho T3–T4.',
    focus: [f('past-simple-irregular', 'V3')],
    compare: {
      withTenseIds: ['past-simple'],
      pairs: [
        pair(
          ['I walked to school yesterday.', 'Hôm qua tôi đi bộ tới trường.'],
          ['I went to school by bus yesterday.', 'Hôm qua tôi đi xe buýt tới trường.'],
          'walk có quy tắc nên thêm -ed: walked. go là bất quy tắc: went (không có goed).',
        ),
        pair(
          ['She cooked dinner last night.', 'Tối qua cô ấy nấu bữa tối.'],
          ['She made dinner last night.', 'Tối qua cô ấy làm bữa tối.'],
          'cook → cooked theo luật -ed; make → made phải nhớ trong bảng động từ.',
        ),
        pair(
          ["We didn't play football.", 'Chúng tôi đã không đá bóng.'],
          ["We didn't see the game.", 'Chúng tôi đã không xem trận đấu.'],
          "Sau didn't, cả động từ có quy tắc (play) lẫn bất quy tắc (see) đều về nguyên mẫu.",
        ),
      ],
    },
    requires: ['subject-pronouns', 'articles', 'present-simple-negative', 'past-simple', 'verb-forms', 'past-simple-irregular'],
  },
])

export const DAYS_T2_W4 = grammarDays('s1-t2-w4', [
  {
    title: 'Câu khẳng định',
    note: 'Hôm nay tả việc đang diễn ra ở một lúc trong quá khứ: was / were + V-ing.',
    focus: [f('past-continuous', 'Khẳng định')],
    say: [
      ['I was studying at ten last night.', 'Lúc mười giờ tối qua tôi đang học bài.'],
      ['The kids were playing in the garden at five.', 'Lúc năm giờ bọn trẻ đang chơi trong vườn.'],
      ['My dad was washing the car at noon.', 'Lúc trưa bố tôi đang rửa xe.'],
    ],
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'articles',
      'plurals',
      'prepositions-of-place',
      'prepositions-of-time',
      'clock-time',
      'past-continuous',
    ],
  },
  {
    title: 'Câu phủ định',
    note: "Hôm nay nói việc không diễn ra lúc đó: wasn't / weren't + V-ing.",
    focus: [f('past-continuous', 'Phủ định')],
    say: [
      ["She wasn't listening to the teacher.", 'Lúc đó cô ấy không nghe thầy giáo giảng.'],
      ["My brothers weren't sleeping at midnight.", 'Lúc nửa đêm các anh tôi không ngủ.'],
      ["It wasn't raining at seven this morning.", 'Lúc bảy giờ sáng nay trời không mưa.'],
    ],
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'articles',
      'plurals',
      'demonstratives',
      'prepositions-of-time',
      'clock-time',
      'be-negative',
      'past-continuous',
    ],
  },
  {
    title: 'Câu hỏi',
    note: 'Hôm nay hỏi ai đó đang làm gì lúc đó: Was / Were + chủ ngữ + V-ing.',
    focus: [f('past-continuous', 'Câu hỏi')],
    say: [
      ['Was your phone ringing?', 'Lúc đó điện thoại của bạn có đang đổ chuông không?'],
      ['Were you driving at that time?', 'Lúc đó bạn có đang lái xe không?'],
      ['What was she cooking at seven last night?', 'Lúc bảy giờ tối qua cô ấy đang nấu món gì?'],
    ],
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'demonstratives',
      'prepositions-of-time',
      'clock-time',
      'be-questions',
      'wh-questions',
      'past-continuous',
    ],
  },
  {
    title: 'So với quá khứ đơn',
    note: 'Hôm nay ghép hai thì quá khứ: việc dài (was / were + V-ing) và việc ngắn chen vào (V2) với when, while.',
    focus: [f('past-continuous', 'when · while')],
    compare: {
      withTenseIds: ['past-simple-irregular'],
      pairs: [
        pair(
          ['I wrote an email last night.', 'Tối qua tôi viết một email.'],
          ['I was writing an email at nine last night.', 'Lúc chín giờ tối qua tôi đang viết email.'],
          'Kể việc đã làm → quá khứ đơn; tả việc đang diễn ra ở đúng một lúc (at nine) → was / were + V-ing.',
        ),
        pair(
          ['She cooked dinner when I got home.', 'Khi tôi về tới nhà thì cô ấy mới nấu bữa tối.'],
          ['She was cooking dinner when I got home.', 'Khi tôi về tới nhà thì cô ấy đang nấu bữa tối.'],
          'cooked: tôi về rồi cô ấy mới nấu; was cooking: lúc tôi về cô ấy đang nấu dở.',
        ),
        pair(
          ['We ate lunch at noon.', 'Chúng tôi ăn trưa lúc mười hai giờ.'],
          ['We were eating lunch when my phone rang.', 'Chúng tôi đang ăn trưa thì điện thoại của tôi đổ chuông.'],
          'Một việc xong ở một lúc → V2; việc dài bị việc ngắn chen vào → was / were + V-ing + when + V2.',
        ),
      ],
    },
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'articles',
      'prepositions-of-time',
      'clock-time',
      'verb-forms',
      'past-simple',
      'past-simple-irregular',
      'past-continuous',
    ],
  },
])

// ---------------------------------------------------------------- T3

export const DAYS_T3_W1 = grammarDays('s1-t3-w1', [
  {
    title: 'Câu khẳng định',
    note: "Hôm nay hứa, đề nghị, đoán trước bằng will + nguyên mẫu (I'll, we'll).",
    focus: [f('will', 'Khẳng định')],
    say: [
      ["I'll text you after the meeting.", 'Họp xong tôi sẽ nhắn tin cho bạn.'],
      ['It will be sunny on Sunday.', 'Chủ nhật trời sẽ nắng.'],
      ["We'll help you with your bags.", 'Chúng tôi sẽ giúp bạn mang túi.'],
    ],
    requires: [
      'subject-pronouns',
      'object-pronouns',
      'possessive-adjectives',
      'articles',
      'plurals',
      'days-months',
      'prepositions-of-time',
      'will',
    ],
  },
  {
    title: 'Câu phủ định',
    note: "Hôm nay nói điều sẽ không xảy ra: won't (will not) + nguyên mẫu.",
    focus: [f('will', 'Phủ định')],
    say: [
      ["I won't tell my friends.", 'Tôi sẽ không kể với bạn bè đâu.'],
      ["She won't be at the party.", 'Cô ấy sẽ không có mặt ở bữa tiệc.'],
      ["The shop won't open tomorrow.", 'Ngày mai cửa hàng sẽ không mở cửa.'],
    ],
    requires: ['subject-pronouns', 'possessive-adjectives', 'articles', 'plurals', 'prepositions-of-place', 'will'],
  },
  {
    title: 'Câu hỏi',
    note: 'Hôm nay hỏi và nhờ: Will + chủ ngữ + nguyên mẫu …?',
    focus: [f('will', 'Câu hỏi')],
    say: [
      ['Will you call me tomorrow?', 'Mai bạn sẽ gọi cho tôi chứ?'],
      ['Will it rain this afternoon?', 'Chiều nay trời có mưa không?'],
      ['What will you wear to the wedding?', 'Bạn sẽ mặc gì đi đám cưới?'],
    ],
    requires: ['subject-pronouns', 'object-pronouns', 'demonstratives', 'articles', 'wh-questions', 'will'],
  },
  {
    title: 'So với thì hiện tại',
    note: 'Hôm nay so will với hai thì hiện tại: thói quen, việc đang làm, và việc sẽ làm.',
    compare: {
      withTenseIds: ['present-simple', 'present-continuous'],
      pairs: [
        pair(
          ['I call my mom every Sunday.', 'Chủ nhật nào tôi cũng gọi cho mẹ.'],
          ["I'll call you after dinner.", 'Ăn tối xong tôi sẽ gọi cho bạn.'],
          'Thói quen → hiện tại đơn; quyết định / lời hứa cho tương lai → will + nguyên mẫu.',
        ),
        pair(
          ["I'm cooking now.", 'Bây giờ tôi đang nấu ăn.'],
          ["I'll cook tomorrow.", 'Ngày mai tôi sẽ nấu.'],
          'Đang làm lúc nói → am / is / are + V-ing; việc sẽ làm → will + nguyên mẫu (không -ing).',
        ),
        pair(
          ["She doesn't eat meat.", 'Cô ấy không ăn thịt.'],
          ["She won't eat that cake.", 'Cô ấy sẽ không ăn cái bánh đó đâu.'],
          "Thói quen không làm → doesn't + nguyên mẫu; sẽ không làm (từ chối, đoán) → won't + nguyên mẫu.",
        ),
      ],
    },
    requires: [
      'subject-pronouns',
      'object-pronouns',
      'possessive-adjectives',
      'demonstratives',
      'days-months',
      'present-simple',
      'present-simple-negative',
      'present-continuous',
      'will',
    ],
  },
])

export const DAYS_T3_W2 = grammarDays('s1-t3-w2', [
  {
    title: 'Câu khẳng định',
    note: 'Hôm nay nói kế hoạch đã định: am / is / are + going to + nguyên mẫu (nói nhanh là gonna).',
    focus: [f('going-to', 'Khẳng định', 'Văn nói')],
    say: [
      ["I'm going to study English tonight.", 'Tối nay tôi định học tiếng Anh.'],
      ["They're going to move to a new house.", 'Họ định chuyển tới một ngôi nhà mới.'],
      ["We're gonna watch a movie later.", 'Lát nữa tụi mình sẽ xem phim.'],
    ],
    requires: ['subject-pronouns', 'articles', 'adjective-before-noun', 'be-affirmative', 'going-to'],
  },
  {
    title: 'Câu phủ định',
    note: 'Hôm nay nói điều không định làm: thêm not ngay sau am / is / are.',
    focus: [f('going-to', 'Phủ định')],
    say: [
      ["He isn't going to sell his car.", 'Anh ấy không định bán xe.'],
      ["I'm not going to eat out tonight.", 'Tối nay tôi không định ăn ngoài.'],
      ["We aren't going to stay long.", 'Chúng tôi không định ở lâu.'],
    ],
    requires: ['subject-pronouns', 'possessive-adjectives', 'be-negative', 'going-to'],
  },
  {
    title: 'Câu hỏi',
    note: 'Hôm nay hỏi kế hoạch: Am / Is / Are + chủ ngữ + going to + nguyên mẫu …?',
    focus: [f('going-to', 'Câu hỏi')],
    say: [
      ['Are you going to buy that dress?', 'Bạn định mua cái váy đó à?'],
      ['When is she going to start her new job?', 'Khi nào cô ấy bắt đầu công việc mới?'],
      ['Is your brother going to visit us?', 'Anh trai bạn có định ghé thăm chúng tôi không?'],
    ],
    requires: [
      'subject-pronouns',
      'object-pronouns',
      'possessive-adjectives',
      'demonstratives',
      'adjective-before-noun',
      'be-questions',
      'wh-questions',
      'going-to',
    ],
  },
  {
    title: 'So với will',
    note: 'Hôm nay đặt will và going to cạnh nhau: vừa quyết định hay đã định từ trước.',
    choiceIds: ['will-vs-going-to'],
    requires: ['will', 'going-to', 'will-vs-going-to'],
  },
])

export const DAYS_T3_W3 = grammarDays('s1-t3-w3', [
  {
    title: 'Câu khẳng định',
    note: 'Hôm nay kể trải nghiệm tới giờ: have / has + V3, không nói lúc nào.',
    focus: [f('present-perfect', 'Khẳng định')],
    say: [
      ['I have watched this show twice.', 'Tôi đã xem chương trình này hai lần.'],
      ['She has visited Hue three times.', 'Cô ấy đã đến Huế ba lần.'],
      ["We've tried pho in Hanoi.", 'Chúng tôi đã ăn thử phở ở Hà Nội.'],
    ],
    requires: ['subject-pronouns', 'demonstratives', 'numbers', 'prepositions-of-place', 'verb-forms', 'present-perfect'],
  },
  {
    title: 'Câu phủ định',
    note: "Hôm nay nói điều chưa làm: haven't / hasn't + V3, hay đi với yet (never thì đi với have / has: I have never…).",
    focus: [f('present-perfect', 'Phủ định')],
    say: [
      ["I haven't finished my homework yet.", 'Tôi vẫn chưa làm xong bài tập về nhà.'],
      ["My parents haven't met my teacher.", 'Bố mẹ tôi chưa gặp cô giáo của tôi.'],
      ["She hasn't eaten breakfast yet.", 'Cô ấy vẫn chưa ăn sáng.'],
    ],
    requires: ['subject-pronouns', 'possessive-adjectives', 'plurals', 'verb-forms', 'present-perfect'],
  },
  {
    title: 'Câu hỏi',
    note: 'Hôm nay hỏi đã từng / đã xong chưa: Have / Has + chủ ngữ + (ever) + V3 …?',
    focus: [f('present-perfect', 'Câu hỏi')],
    say: [
      ['Have you ever been to Japan?', 'Bạn đã từng tới Nhật chưa?'],
      ['Has he finished the report?', 'Anh ấy đã làm xong báo cáo chưa?'],
      ['Have they ever eaten sushi?', 'Họ đã từng ăn sushi chưa?'],
    ],
    requires: ['subject-pronouns', 'articles', 'frequency-adverbs', 'verb-forms', 'present-perfect'],
  },
  {
    title: 'So với quá khứ đơn',
    note: 'Hôm nay so hai thì: có mốc đã xong (yesterday, last year) dùng quá khứ đơn; không nói lúc nào dùng have / has + V3.',
    compare: {
      withTenseIds: ['past-simple-irregular'],
      pairs: [
        pair(
          ['I went to Da Nang last year.', 'Năm ngoái tôi đi Đà Nẵng.'],
          ['I have been to Da Nang.', 'Tôi đã từng tới Đà Nẵng.'],
          'Có mốc đã xong (last year) → quá khứ đơn; chỉ kể đã từng, không nói lúc nào → have + V3.',
        ),
        pair(
          ['She lost her phone yesterday.', 'Hôm qua cô ấy làm mất điện thoại.'],
          ['She has lost her phone.', 'Cô ấy làm mất điện thoại rồi (giờ vẫn chưa thấy).'],
          'yesterday là mốc → lost; không có mốc, giờ vẫn chưa tìm thấy → has lost.',
        ),
        pair(
          ['Did you see the film last night?', 'Tối qua bạn có xem bộ phim đó không?'],
          ['Have you ever seen this film?', 'Bạn đã từng xem bộ phim này chưa?'],
          'Hỏi về một lúc đã qua → Did + V1; hỏi đã từng hay chưa → Have you ever + V3.',
        ),
      ],
    },
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'articles',
      'demonstratives',
      'frequency-adverbs',
      'present-simple-questions',
      'verb-forms',
      'past-simple-irregular',
      'present-perfect',
    ],
  },
])

// ---------------------------------------------------------------- T4

export const DAYS_T4_W1 = grammarDays('s1-t4-w1', [
  {
    title: 'Câu khẳng định',
    note: 'Hôm nay nói làm được, nên, phải: can / should / must + nguyên mẫu.',
    focus: [f('modals', 'Khẳng định')],
    say: [
      ['She can play the piano.', 'Cô ấy chơi được đàn piano.'],
      ['You should eat breakfast.', 'Bạn nên ăn sáng.'],
      ['We must wear a seat belt.', 'Chúng ta phải thắt dây an toàn.'],
    ],
    requires: ['subject-pronouns', 'articles', 'modals'],
  },
  {
    title: 'Câu phủ định',
    note: "Hôm nay nói không làm được, không nên, cấm: can't · shouldn't · mustn't + nguyên mẫu.",
    focus: [f('modals', 'Phủ định')],
    say: [
      ["I can't hear you.", 'Tôi không nghe thấy bạn nói.'],
      ["You shouldn't stay up late.", 'Bạn không nên thức khuya.'],
      ["Students mustn't use phones in class.", 'Học sinh không được dùng điện thoại trong lớp.'],
    ],
    requires: ['subject-pronouns', 'object-pronouns', 'plurals', 'prepositions-of-place', 'modals'],
  },
  {
    title: 'Câu hỏi',
    note: 'Hôm nay hỏi, xin phép, xin lời khuyên: Can / Should + chủ ngữ + nguyên mẫu …?',
    focus: [f('modals', 'Câu hỏi')],
    say: [
      ['Can you cook?', 'Bạn biết nấu ăn không?'],
      ['Should I bring a jacket?', 'Tôi có nên mang áo khoác không?'],
      ['Where can we park?', 'Chúng tôi đỗ xe ở đâu được?'],
    ],
    requires: ['subject-pronouns', 'articles', 'wh-questions', 'modals'],
  },
  {
    title: 'So với hiện tại đơn',
    note: 'Hôm nay thêm have to, could, would like và so với hiện tại đơn: việc thường ngày hay khả năng, bắt buộc, lời lịch sự.',
    focus: [f('modals', 'have to · could · would like')],
    choiceIds: ['have-to-could-would-like'],
    compare: {
      withTenseIds: ['present-simple'],
      pairs: [
        pair(
          ['My brother speaks French.', 'Anh trai tôi nói tiếng Pháp.'],
          ['My brother can speak French.', 'Anh trai tôi nói được tiếng Pháp.'],
          'speaks: việc anh ấy vẫn làm; can + nguyên mẫu: nói khả năng, động từ sau can không thêm -s.',
        ),
        pair(
          ['She works on Saturday.', 'Cô ấy làm việc vào thứ Bảy.'],
          ['She has to work on Saturday.', 'Thứ Bảy cô ấy phải đi làm.'],
          'works: lịch thường ngày; has to + nguyên mẫu: bắt buộc phải làm (he / she / it dùng has to).',
        ),
        pair(
          ['I want some tea.', 'Tôi muốn uống trà.'],
          ["I'd like some tea, please.", 'Cho tôi xin chút trà ạ.'],
          "want: nói thẳng; would like ('d like): lịch sự hơn khi xin hay gọi món.",
        ),
      ],
    },
    requires: [
      'subject-pronouns',
      'possessive-adjectives',
      'days-months',
      'prepositions-of-time',
      'quantifiers',
      'countable-uncountable',
      'imperatives',
      'present-simple',
      'verb-s-endings',
      'modals',
    ],
  },
])
