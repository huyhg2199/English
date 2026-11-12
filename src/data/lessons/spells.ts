import type { Spell } from './types'

/**
 * Thần chú lấy cảm hứng HP (chỉ tên + mô tả tự viết, không dùng hình gốc).
 * Mỗi thì đã học là một thần chú; mở khoá khi bài chứa thì đó được đánh dấu xong.
 * `grammarEn` dùng trong prompt luyện nói: AI chỉ được dùng các chủ điểm đã mở.
 */
export const SPELLS: readonly Spell[] = [
  {
    id: 'lumos',
    name: 'Lumos',
    description: 'Thắp sáng câu đầu tiên: am / is / are để nói mình là ai, ở đâu, thế nào.',
    tenseId: 'to-be',
    lessonId: 's1-t1-w1',
    grammarEn: 'the verb "to be" (am / is / are)',
  },
  {
    id: 'alohomora',
    name: 'Alohomora',
    description: 'Mở cánh cửa thói quen hằng ngày: hiện tại đơn, nhớ thêm -s/-es khi chủ ngữ là he / she / it.',
    tenseId: 'present-simple',
    lessonId: 's1-t1-w2',
    grammarEn: 'the present simple (I work, she works)',
  },
  {
    id: 'revelio',
    name: 'Revelio',
    description: 'Làm lộ ra điều còn giấu: hỏi và phủ định thì hiện tại đơn với do / does.',
    tenseId: 'present-simple-questions',
    lessonId: 's1-t1-w3',
    grammarEn: "present simple questions and negatives (do / does, don't / doesn't)",
  },
  {
    id: 'accio',
    name: 'Accio',
    description: 'Gọi hành động đang diễn ra tới trước mắt: am / is / are + V-ing.',
    tenseId: 'present-continuous',
    lessonId: 's1-t2-w1',
    grammarEn: 'the present continuous (am / is / are + -ing)',
  },
  {
    id: 'obliviate',
    name: 'Obliviate',
    description: 'Đưa việc về quá khứ đã xong: động từ thêm -ed, hỏi và phủ định với did; was / were tự hỏi và phủ định, không mượn did.',
    tenseId: 'past-simple',
    lessonId: 's1-t2-w2',
    grammarEn: 'the past of to be (was / were) and the past simple with regular verbs (-ed, did, didn\'t)',
  },
  {
    id: 'reparo',
    name: 'Reparo',
    description: 'Sửa lại những động từ "gãy" quy tắc: go → went, see → saw, buy → bought.',
    tenseId: 'past-simple-irregular',
    lessonId: 's1-t2-w3',
    grammarEn: 'the past simple with common irregular verbs (went, saw, had, bought)',
  },
  {
    id: 'impedimenta',
    name: 'Impedimenta',
    description:
      'Chặn ngang một việc đang diễn ra: was / were + V-ing cho việc dài, quá khứ đơn cho việc ngắn chen vào (when), while cho hai việc cùng lúc.',
    tenseId: 'past-continuous',
    lessonId: 's1-t2-w4',
    grammarEn: 'the past continuous (was / were + -ing, with when and while)',
  },
  {
    id: 'protego',
    name: 'Protego',
    description: 'Tấm khiên cho lời hứa và dự đoán: will + động từ nguyên mẫu.',
    tenseId: 'will',
    lessonId: 's1-t3-w1',
    grammarEn: 'the future with "will" (will / won\'t + base verb)',
  },
  {
    id: 'wingardium-leviosa',
    name: 'Wingardium Leviosa',
    description: 'Nâng kế hoạch đã định lên: be going to (nói nhanh là gonna).',
    tenseId: 'going-to',
    lessonId: 's1-t3-w2',
    grammarEn: '"be going to" for plans (gonna in speech)',
  },
  {
    id: 'expecto-patronum',
    name: 'Expecto Patronum',
    description: 'Gọi trải nghiệm từ quá khứ tới hiện tại: have / has + V3.',
    tenseId: 'present-perfect',
    lessonId: 's1-t3-w3',
    grammarEn: 'the present perfect (have / has + past participle, ever / never)',
  },
  {
    id: 'expelliarmus',
    name: 'Expelliarmus',
    description:
      'Khuyên, bắt buộc, xin phép, nhờ: can / could / should / must / have to + động từ nguyên mẫu; would like để nói muốn một cách lịch sự.',
    tenseId: 'modals',
    lessonId: 's1-t4-w1',
    grammarEn: 'the modal verbs can, could, should and must, plus have to and would like',
  },
  {
    id: 'riddikulus',
    name: 'Riddikulus',
    description: 'Biến thứ đáng sợ thành buồn cười bằng so sánh: bigger, the biggest, more / the most.',
    tenseId: 'comparatives',
    lessonId: 's1-t4-w3',
    grammarEn: 'comparatives and superlatives (bigger than, the biggest, more / most)',
  },
  {
    id: 'finite',
    name: 'Finite',
    description: 'Dừng người làm, chỉ nói việc được làm: am / is / are + V3 (bị động hiện tại).',
    tenseId: 'passive-present',
    lessonId: 's1-t4-w3',
    grammarEn: 'the present passive (is / are + past participle)',
  },
]

export function getSpell(id: string | undefined): Spell | undefined {
  return id ? SPELLS.find((s) => s.id === id) : undefined
}
