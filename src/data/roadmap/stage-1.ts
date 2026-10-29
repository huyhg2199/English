import { section, vocabularyTask } from './sections'
import type { Lesson, Section, SkillTag, Stage } from './types'

const STAGE_ID = 's1'

type Week = {
  id: string
  monthId: string
  week: Lesson['week']
  title: string
  /** Ô "Phát âm / Nghe" và tag của nó. */
  pronunciation: [task: string, tags: readonly SkillTag[]]
  /** Ô "Ngữ pháp"; bỏ trống khi ô là "—". */
  grammar?: string
  words: number
  /** Ô "10' giải trí"; bỏ trống khi ô là "—". */
  entertainment?: string
  /** Tag đoạn giải trí; mặc định ['listening']. */
  entertainmentTags?: readonly SkillTag[]
  checkpoint?: [checkpointId: string, task: string]
}

function week(w: Week): Lesson {
  const sections: Section[] = [section('pronunciation', w.pronunciation[0], w.pronunciation[1])]
  if (w.grammar) sections.push(section('grammar', w.grammar, ['grammar']))
  if (w.checkpoint) {
    sections.push(
      section('checkpoint', w.checkpoint[1], ['listening', 'reading', 'pronunciation', 'grammar', 'vocabulary']),
    )
  }
  sections.push(section('vocabulary', vocabularyTask(w.words), ['vocabulary']))
  if (w.entertainment) sections.push(section('entertainment', w.entertainment, w.entertainmentTags ?? ['listening']))

  return {
    id: w.id,
    stageId: STAGE_ID,
    monthId: w.monthId,
    week: w.week,
    title: w.title,
    sections,
    cumulativeWords: w.words,
    ...(w.checkpoint && { checkpointId: w.checkpoint[0], checkpointAttempt: 1 }),
  }
}

const P: readonly SkillTag[] = ['pronunciation']
const PL: readonly SkillTag[] = ['pronunciation', 'listening']

export const stage1: Stage = {
  id: STAGE_ID,
  number: 1,
  name: 'Nền móng',
  yearLabel: 'Năm 1–2',
  scoreGoal: '0→300',
  monthRange: 'T1–T4',
  period: '11/2026–02/2027',
  focus: 'IPA, trọng âm, âm cuối · ~1000 từ phổ biến · các thì cơ bản',
  estimatedScore: '250–350',
  content: [
    '44 âm IPA, âm cuối (-s, -ed, phụ âm cuối mà người Việt hay nuốt), quy tắc trọng âm, dạng yếu và nối âm cơ bản · ~1000 từ phổ biến nhất · các thì: hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn, tương lai (will / be going to), hiện tại hoàn thành, cùng câu hỏi và phủ định.',
  ],
  fixedTasks: [
    'Mỗi từ mới phải tra IPA và trọng âm trên Cambridge/Oxford, nghe audio, đọc to 3 lần. Không đoán theo cảm tính.',
    'Thẻ Anki có 4 phần: từ, IPA, câu ví dụ lấy từ phim/tin, nghĩa tiếng Việt. Làm theo thứ tự danh sách Oxford 3000 mức A1 → A2, hoặc NGSL.',
    'Mỗi thì cần 1 câu thoại phim làm ví dụ và 1 hình dòng thời gian trong sổ tay.',
  ],
  resources: [
    {
      area: 'Phát âm',
      items:
        "BBC Learning English: The Sounds of English, Tim's Pronunciation Workshop · Rachel's English (YouTube) · Cambridge Dictionary / Oxford Learner's Dictionaries (IPA và audio) · YouGlish",
      tags: ['pronunciation'],
    },
    {
      area: 'Ngữ pháp',
      items: 'British Council LearnEnglish → Grammar A1–A2 (có bài tập) · Perfect English Grammar',
      tags: ['grammar'],
    },
    { area: 'Từ vựng', items: 'Oxford 3000 (A1–A2) · NGSL · Anki', tags: ['vocabulary'] },
    {
      area: 'Nghe/đọc',
      items:
        "VOA Learning English Let's Learn English Level 1–2 · ELLLO · LyricsTraining · Breaking News English, cấp 0–2",
      tags: ['listening', 'reading'],
    },
  ],
  canDo: [
    'Đọc đúng IPA và trọng âm của ~1000 từ, tự tra được từ mới mà không cần đoán.',
    'Nghe hiểu câu ngắn nói chậm, như ở VOA Level 1.',
    'Đặt câu đúng với 5–6 thì cơ bản, phân biệt được quá khứ đơn với hiện tại hoàn thành.',
    'Nhận ra gonna, wanna, gotta khi nghe phim.',
  ],
  checkpoint: {
    id: 'owl-1',
    name: 'O.W.L. 1',
    when: 'cuối T4',
    scope: [
      'Làm lại đề mẫu ETS, phần Part 1, 2 và 5.',
      'Thêm 30 từ ngẫu nhiên trong Anki, phải đọc đúng IPA.',
      'Thêm 20 câu chia thì, lấy từ bài tập British Council A2.',
    ],
    passThreshold: 'Qua cửa khi đúng ≥ 70% phần thì và phát âm.',
    ifNotPassed: 'Nếu chưa đạt, dành thêm 2 tuần ôn đúng phần yếu theo Sổ lỗi sai, không học lại từ đầu.',
    attempts: 1,
  },
  months: [
    {
      id: 't1',
      label: 'T1',
      period: '11/26',
      lessons: [
        week({
          id: 's1-t1-w1',
          monthId: 't1',
          week: 1,
          title: 'Động từ to be · 12 nguyên âm đơn',
          pronunciation: ['Làm bài đầu vào · 12 nguyên âm đơn', P],
          grammar: 'Động từ to be',
          words: 60,
          entertainment: 'LyricsTraining, mức Beginner',
        }),
        week({
          id: 's1-t1-w2',
          monthId: 't1',
          week: 2,
          title: 'Hiện tại đơn · nguyên âm đôi',
          pronunciation: ['8 nguyên âm đôi', P],
          grammar: 'Hiện tại đơn (+ -s/-es)',
          words: 120,
          entertainment: "VOA Let's Learn English L1",
        }),
        week({
          id: 's1-t1-w3',
          monthId: 't1',
          week: 3,
          title: 'Hiện tại đơn: hỏi, phủ định · 24 phụ âm',
          pronunciation: ['24 phụ âm, chú ý /θ ð ʃ ʒ/', P],
          grammar: 'Hiện tại đơn: câu hỏi, phủ định',
          words: 180,
          entertainment: 'YouGlish 5 từ/ngày',
          entertainmentTags: ['listening', 'pronunciation'],
        }),
        week({
          id: 's1-t1-w4',
          monthId: 't1',
          week: 4,
          title: 'Ôn lại · mini test · âm cuối',
          pronunciation: ['Âm cuối, đọc -s và -ed', P],
          grammar: 'Ôn lại · mini test 10 câu',
          words: 250,
          entertainment: 'Bài hát chậm, có lyrics',
        }),
      ],
    },
    {
      id: 't2',
      label: 'T2',
      period: '12/26',
      lessons: [
        week({
          id: 's1-t2-w1',
          monthId: 't2',
          week: 1,
          title: 'Hiện tại tiếp diễn · trọng âm 2 âm tiết',
          pronunciation: ['Trọng âm từ 2 âm tiết', P],
          grammar: 'Hiện tại tiếp diễn',
          words: 310,
          entertainment: 'Phim có sub Anh+Việt',
        }),
        week({
          id: 's1-t2-w2',
          monthId: 't2',
          week: 2,
          title: 'Quá khứ đơn · trọng âm theo hậu tố',
          pronunciation: ['Trọng âm theo hậu tố (-tion, -ic, -ity)', P],
          grammar: 'Quá khứ đơn, động từ có quy tắc',
          words: 370,
          entertainment: 'VOA L1',
        }),
        week({
          id: 's1-t2-w3',
          monthId: 't2',
          week: 3,
          title: 'Động từ bất quy tắc · phát âm -ed',
          pronunciation: ['Phát âm -ed: /t/ /d/ /ɪd/', P],
          grammar: '50 động từ bất quy tắc thông dụng',
          words: 430,
          entertainment: 'Bắt câu quá khứ trong phim',
        }),
        week({
          id: 's1-t2-w4',
          monthId: 't2',
          week: 4,
          title: 'Ôn lại · mini test · ôn IPA',
          pronunciation: ['Ôn IPA, tự đọc 20 từ rồi so với từ điển', P],
          grammar: 'Ôn lại · mini test',
          words: 500,
          entertainment: 'LyricsTraining',
        }),
      ],
    },
    {
      id: 't3',
      label: 'T3',
      period: '01/27',
      lessons: [
        week({
          id: 's1-t3-w1',
          monthId: 't3',
          week: 1,
          title: 'Tương lai will · dạng yếu',
          pronunciation: ['Dạng yếu: to, of, and, can, a', PL],
          grammar: 'Tương lai will',
          words: 560,
          entertainment: "BBC Tim's Pronunciation Workshop",
        }),
        week({
          id: 's1-t3-w2',
          monthId: 't3',
          week: 2,
          title: 'be going to · nối âm',
          pronunciation: ['Nối âm phụ âm–nguyên âm', PL],
          grammar: 'be going to → gonna',
          words: 620,
          entertainment: 'Săn "gonna" trong phim',
        }),
        week({
          id: 's1-t3-w3',
          monthId: 't3',
          week: 3,
          title: 'Hiện tại hoàn thành (1) · trọng âm câu',
          pronunciation: ['Trọng âm câu (từ nội dung và từ chức năng)', PL],
          grammar: 'Hiện tại hoàn thành (1)',
          words: 690,
          entertainment: 'ELLLO, bài cấp thấp',
        }),
        week({
          id: 's1-t3-w4',
          monthId: 't3',
          week: 4,
          title: 'Hiện tại hoàn thành (2) · shadowing',
          pronunciation: ['Shadowing 1 đoạn 30 giây', PL],
          grammar: 'Hiện tại hoàn thành (2) và so sánh với quá khứ đơn',
          words: 750,
          entertainment: 'VOA L1/L2',
        }),
      ],
    },
    {
      id: 't4',
      label: 'T4',
      period: '02/27',
      note: 'có Tết',
      lessons: [
        week({
          id: 's1-t4-w1',
          monthId: 't4',
          week: 1,
          title: 'Động từ khuyết thiếu · dạng rút gọn',
          pronunciation: ["Dạng rút gọn: wanna, gotta, I'd, you'll", PL],
          grammar: 'Động từ khuyết thiếu: can/should/must',
          words: 820,
          entertainment: 'Từ điển "nói tắt" tự làm',
          entertainmentTags: ['listening', 'vocabulary'],
        }),
        week({
          id: 's1-t4-w2',
          monthId: 't4',
          week: 2,
          title: 'Tuần Tết · ngày lười',
          pronunciation: ['Tuần Tết: chạy chế độ ngày lười', ['vocabulary', 'reading']],
          words: 850,
          entertainment: 'Phim Tết',
        }),
        week({
          id: 's1-t4-w3',
          monthId: 't4',
          week: 3,
          title: 'So sánh hơn/nhất · bị động · shadowing',
          pronunciation: ['Shadowing + chép chính tả 5 câu/ngày', PL],
          grammar: 'So sánh hơn/nhất · bị động hiện tại (nhập môn)',
          words: 920,
          entertainment: 'ELLLO',
        }),
        week({
          id: 's1-t4-w4',
          monthId: 't4',
          week: 4,
          title: 'O.W.L. 1',
          pronunciation: ['Ôn tổng', PL],
          checkpoint: ['owl-1', 'O.W.L. 1'],
          words: 1000,
        }),
      ],
    },
  ],
}
