import type { IrregularVerb } from './types'

/**
 * 50 động từ bất quy tắc thông dụng (V1 đều thuộc NGSL), dạng Mỹ (get – got – gotten).
 * Xếp theo nhóm âm giống nhau để dễ nhớ. Nghĩa tiếng Việt tự soạn.
 */
const v = (v1: string, v2: string, v3: string, vi: string): IrregularVerb => ({ v1, v2, v3, vi })

export const IRREGULAR_VERBS: readonly IrregularVerb[] = [
  // Rất thông dụng, mỗi từ một dạng riêng: học thuộc
  v('be', 'was / were', 'been', 'thì, là, ở'),
  v('have', 'had', 'had', 'có'),
  v('do', 'did', 'done', 'làm'),
  v('go', 'went', 'gone', 'đi'),
  v('get', 'got', 'gotten', 'nhận, lấy, trở nên'),
  v('make', 'made', 'made', 'làm, chế tạo'),
  v('see', 'saw', 'seen', 'nhìn thấy'),
  // V2 -ew, V3 -own / -en: know – knew – known
  v('know', 'knew', 'known', 'biết'),
  v('take', 'took', 'taken', 'cầm, lấy, mất (thời gian)'),
  v('give', 'gave', 'given', 'cho, đưa'),
  // come / become: V3 giống V1
  v('come', 'came', 'come', 'đến'),
  v('become', 'became', 'become', 'trở thành'),
  // -ay → -aid
  v('say', 'said', 'said', 'nói'),
  v('pay', 'paid', 'paid', 'trả tiền'),
  // -ell → -old
  v('tell', 'told', 'told', 'kể, bảo'),
  v('sell', 'sold', 'sold', 'bán'),
  // -ought / -aught
  v('think', 'thought', 'thought', 'nghĩ'),
  v('bring', 'brought', 'brought', 'mang đến'),
  v('buy', 'bought', 'bought', 'mua'),
  v('teach', 'taught', 'taught', 'dạy'),
  v('catch', 'caught', 'caught', 'bắt, đón (xe)'),
  // Nguyên âm dài thành ngắn + -t: keep – kept
  v('leave', 'left', 'left', 'rời đi, để lại'),
  v('feel', 'felt', 'felt', 'cảm thấy'),
  v('keep', 'kept', 'kept', 'giữ'),
  v('sleep', 'slept', 'slept', 'ngủ'),
  v('mean', 'meant', 'meant', 'có nghĩa là'),
  v('lose', 'lost', 'lost', 'mất, thua'),
  // -d → -t: send – sent
  v('send', 'sent', 'sent', 'gửi'),
  v('spend', 'spent', 'spent', 'tiêu (tiền), dành (thời gian)'),
  v('build', 'built', 'built', 'xây'),
  // Nguyên âm dài thành ngắn, giữ phụ âm cuối: meet – met
  v('meet', 'met', 'met', 'gặp'),
  v('hear', 'heard', 'heard', 'nghe thấy'),
  // i → a → u
  v('begin', 'began', 'begun', 'bắt đầu'),
  v('drink', 'drank', 'drunk', 'uống'),
  v('swim', 'swam', 'swum', 'bơi'),
  v('sing', 'sang', 'sung', 'hát'),
  // u → a → u
  v('run', 'ran', 'run', 'chạy'),
  // i → a, V2 = V3
  v('sit', 'sat', 'sat', 'ngồi'),
  // -ind → -ound, -and → -ood
  v('find', 'found', 'found', 'tìm thấy'),
  v('understand', 'understood', 'understood', 'hiểu'),
  // V2 đổi nguyên âm, V3 thêm -en / -n
  v('write', 'wrote', 'written', 'viết'),
  v('drive', 'drove', 'driven', 'lái xe'),
  v('speak', 'spoke', 'spoken', 'nói (một ngôn ngữ)'),
  v('break', 'broke', 'broken', 'làm vỡ'),
  v('choose', 'chose', 'chosen', 'chọn'),
  v('forget', 'forgot', 'forgotten', 'quên'),
  v('eat', 'ate', 'eaten', 'ăn'),
  v('fall', 'fell', 'fallen', 'ngã, rơi'),
  // Giữ nguyên chữ ở cả ba cột
  v('put', 'put', 'put', 'đặt, để'),
  v('read', 'read', 'read', 'đọc (V2, V3 đọc /red/)'),
]
