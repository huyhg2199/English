import type { IrregularVerb, IrregularVerbCard, IrregularVerbGroup } from './types'

/**
 * 50 động từ bất quy tắc thông dụng (V1 đều thuộc NGSL), dạng Mỹ (get – got – gotten).
 * Xếp theo 15 nhóm âm giống nhau để dễ nhớ (story 38: nhóm là dữ liệu, thẻ ôn mở theo nhóm). Nghĩa tiếng Việt tự soạn.
 */
const v = (v1: string, v2: string, v3: string, vi: string): IrregularVerb => ({ v1, v2, v3, vi })
const group = (id: string, title: string, verbs: readonly IrregularVerb[]): IrregularVerbGroup => ({ id, title, verbs })

export const IRREGULAR_VERB_GROUPS: readonly IrregularVerbGroup[] = [
  group('core', 'Rất thông dụng, mỗi từ một kiểu: học thuộc', [
    v('be', 'was / were', 'been', 'thì, là, ở'),
    v('have', 'had', 'had', 'có'),
    v('do', 'did', 'done', 'làm'),
    v('go', 'went', 'gone', 'đi'),
    v('get', 'got', 'gotten', 'nhận, lấy, trở nên'),
    v('make', 'made', 'made', 'làm, chế tạo'),
    v('see', 'saw', 'seen', 'nhìn thấy'),
  ]),
  group('n-en', 'V3 thêm -n / -en: know – knew – known', [
    v('know', 'knew', 'known', 'biết'),
    v('take', 'took', 'taken', 'cầm, lấy, mất (thời gian)'),
    v('give', 'gave', 'given', 'cho, đưa'),
  ]),
  group('come', 'V3 giống V1: come – came – come', [
    v('come', 'came', 'come', 'đến'),
    v('become', 'became', 'become', 'trở thành'),
  ]),
  group('ay-aid', '-ay → -aid: pay – paid (riêng said đọc /sed/)', [v('say', 'said', 'said', 'nói'), v('pay', 'paid', 'paid', 'trả tiền')]),
  group('ell-old', '-ell → -old: tell – told', [v('tell', 'told', 'told', 'kể, bảo'), v('sell', 'sold', 'sold', 'bán')]),
  group('ought', 'V2 = V3 đuôi -ought / -aught: buy – bought', [
    v('think', 'thought', 'thought', 'nghĩ'),
    v('bring', 'brought', 'brought', 'mang đến'),
    v('buy', 'bought', 'bought', 'mua'),
    v('teach', 'taught', 'taught', 'dạy'),
    v('catch', 'caught', 'caught', 'bắt, đón (xe)'),
  ]),
  group('long-short-t', 'Nguyên âm dài thành ngắn + -t: keep – kept', [
    v('leave', 'left', 'left', 'rời đi, để lại'),
    v('feel', 'felt', 'felt', 'cảm thấy'),
    v('keep', 'kept', 'kept', 'giữ'),
    v('sleep', 'slept', 'slept', 'ngủ'),
    v('mean', 'meant', 'meant', 'có nghĩa là'),
    v('lose', 'lost', 'lost', 'mất, thua'),
  ]),
  group('d-t', '-d → -t: send – sent', [
    v('send', 'sent', 'sent', 'gửi'),
    v('spend', 'spent', 'spent', 'tiêu (tiền), dành (thời gian)'),
    v('build', 'built', 'built', 'xây'),
  ]),
  group('long-short', 'Đổi nguyên âm, V2 = V3: meet – met, hear – heard /hɝːd/', [
    v('meet', 'met', 'met', 'gặp'),
    v('hear', 'heard', 'heard', 'nghe thấy'),
  ]),
  group('i-a-u', 'i → a → u: drink – drank – drunk', [
    v('begin', 'began', 'begun', 'bắt đầu'),
    v('drink', 'drank', 'drunk', 'uống'),
    v('swim', 'swam', 'swum', 'bơi'),
    v('sing', 'sang', 'sung', 'hát'),
  ]),
  group('u-a-u', 'u → a → u: run – ran – run', [v('run', 'ran', 'run', 'chạy')]),
  group('i-a', 'i → a, V2 = V3: sit – sat – sat', [v('sit', 'sat', 'sat', 'ngồi')]),
  group('ind-ound', '-ind → -ound, -and → -ood: find – found', [
    v('find', 'found', 'found', 'tìm thấy'),
    v('understand', 'understood', 'understood', 'hiểu'),
  ]),
  group('vowel-en', 'V2 đổi nguyên âm, V3 thêm -en / -n: write – wrote – written', [
    v('write', 'wrote', 'written', 'viết'),
    v('drive', 'drove', 'driven', 'lái xe'),
    v('speak', 'spoke', 'spoken', 'nói (một ngôn ngữ)'),
    v('break', 'broke', 'broken', 'làm vỡ'),
    v('choose', 'chose', 'chosen', 'chọn'),
    v('forget', 'forgot', 'forgotten', 'quên'),
    v('eat', 'ate', 'eaten', 'ăn'),
    v('fall', 'fell', 'fallen', 'ngã, rơi'),
  ]),
  group('same', 'Giữ nguyên chữ cả ba cột: put – put – put', [
    v('put', 'put', 'put', 'đặt, để'),
    v('read', 'read', 'read', 'đọc (V2, V3 đọc /red/)'),
  ]),
]

/** 50 động từ theo thứ tự bảng (gộp các nhóm). `tense-scope.ts` và bảng s1-t2-w3 dùng mảng này. */
export const IRREGULAR_VERBS: readonly IrregularVerb[] = IRREGULAR_VERB_GROUPS.flatMap((g) => g.verbs)

/**
 * Thẻ ôn V2 · V3 (story 38), mỗi động từ một thẻ, theo thứ tự nhóm rồi thứ tự trong nhóm. Thẻ mở theo nhóm khi Huy tới
 * bài s1-t2-w3 (`irregularVerbStudyWords` trong `src/lib/flashcard-session.ts`).
 */
export const IRREGULAR_VERB_CARDS: readonly IrregularVerbCard[] = IRREGULAR_VERB_GROUPS.flatMap((g) =>
  g.verbs.map((verb) => ({
    id: `irregular-${verb.v1}-rule-1`,
    groupId: g.id,
    groupTitle: g.title,
    cloze: `${verb.v1} → ___ (V2 · V3)`,
    answer: `${verb.v2} · ${verb.v3}`,
    vi: `${verb.vi} · Nhóm: ${g.title}`,
  })),
)
