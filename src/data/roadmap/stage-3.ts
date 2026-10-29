import { partWeekBuilder } from './sections'
import type { Stage } from './types'

const STAGE_ID = 's3'

const w = partWeekBuilder(STAGE_ID)

const NEWT = 'newt'
const FULL_TEST = ['listening', 'reading', 'grammar', 'vocabulary'] as const

export const stage3: Stage = {
  id: STAGE_ID,
  number: 3,
  name: 'Tăng tốc',
  yearLabel: 'Năm 5–7',
  scoreGoal: '550→750+',
  monthRange: 'T9–T12',
  period: '07–10/2027',
  focus: 'Part 3, 4, 7 · đọc nhanh · luyện đề tính giờ',
  estimatedScore: '650–780',
  content: [
    'Part 3: đọc trước câu hỏi, hội thoại 3 người, câu hỏi đi kèm biểu đồ/bảng.',
    'Part 4: thông báo, tin nhắn thoại, quảng cáo, giới thiệu.',
    'Part 7: đoạn đơn, kép, ba · đọc lướt (skim) và dò thông tin (scan) · câu hỏi suy luận và câu "NOT true".',
    "Chiến lược phân bổ thời gian cho phần Reading (75').",
  ],
  fixedTasks: [
    'Mỗi ngày 1 tin thật: chứng khoán hoặc AI, độ dài 300–500 từ, bấm giờ khi đọc rồi tóm tắt 2 câu.',
    'Part 3–4: nghe → chép chính tả câu chứa đáp án → shadowing.',
    'Cuối tuần: 1 bộ Part đầy đủ có tính giờ, hoặc 1 đề full theo lịch N.E.W.T.',
    'Trục phụ nói: luyện roleplay với AI (Claude/Gemini) theo tình huống phỏng vấn, họp, gọi điện khách hàng.',
  ],
  resources: [
    {
      area: 'Đề',
      items:
        'Đề mẫu và practice test chính thức trên ets.org/toeic. Số lượng miễn phí có hạn, nên để dành cho các kỳ N.E.W.T.',
      tags: ['listening', 'reading'],
      checkpointOnly: true,
    },
    {
      area: 'Đọc nhanh',
      items:
        'Breaking News English cấp 5–6 · VOA Learning English · BBC Learning English News Review · tin thật (Hacker News, tin kinh tế)',
      tags: ['reading'],
    },
    {
      area: 'Nghe',
      items: 'BBC 6 Minute English · TED-Ed · ESL Lab mức medium/difficult · phim tắt sub',
      tags: ['listening'],
    },
    {
      area: 'Tra cứu',
      items: "Cambridge/Oxford Learner's Dictionaries · YouGlish",
      tags: ['vocabulary', 'grammar', 'pronunciation'],
    },
  ],
  canDo: [
    "Làm đủ 200 câu trong 120' mà không phải bỏ trắng nhiều câu Part 7.",
    'Đoán được nội dung trước khi nghe Part 3–4 nhờ đọc trước câu hỏi.',
    'Đọc tin kinh tế/AI thật và hiểu ý chính.',
    'Xem phim với sub Anh và hiểu phần lớn hội thoại.',
  ],
  checkpoint: {
    id: NEWT,
    name: 'N.E.W.T.',
    when: 'cuối T10, T11, T12',
    scope: ['3 đề full có tính giờ vào cuối T10, T11, T12.'],
    passThreshold:
      'Sẵn sàng thi khi 2 đề gần nhất đều ≥ 750 tính theo bảng quy đổi trong tài liệu ETS, hoặc ước lượng theo số câu đúng.',
    ifNotPassed:
      'Nếu chưa đạt: dùng giai đoạn dự phòng 11/2027–01/2028 tập trung vào Part yếu nhất, thi vào khoảng 01–02/2028.',
    attempts: 3,
  },
  months: [
    {
      id: 't9',
      label: 'T9',
      period: '07/27',
      lessons: [
        w('s3-t9-w1', 't9', 1, 'Part 3: đọc trước câu hỏi', 'Part 3: đọc trước câu hỏi', ['listening']),
        w('s3-t9-w2', 't9', 2, 'Part 7: email, thông báo', 'Part 7: email và thông báo', ['reading']),
        w(
          's3-t9-w3',
          't9',
          3,
          'Part 3: biểu đồ, ý định người nói',
          'Part 3: câu hỏi kèm biểu đồ · ý định người nói',
          ['listening'],
        ),
        w(
          's3-t9-w4',
          't9',
          4,
          'Part 7: chat · paraphrase',
          'Part 7: chat và tin nhắn · từ đồng nghĩa (paraphrase)',
          ['reading', 'vocabulary'],
        ),
      ],
    },
    {
      id: 't10',
      label: 'T10',
      period: '08/27',
      lessons: [
        w('s3-t10-w1', 't10', 1, 'Part 4: thông báo, tin nhắn thoại', 'Part 4: thông báo, tin nhắn thoại', [
          'listening',
        ]),
        w('s3-t10-w2', 't10', 2, 'Part 7: đoạn kép', 'Part 7: đoạn kép', ['reading']),
        w('s3-t10-w3', 't10', 3, 'Part 6: câu chèn vào đoạn', 'Part 6: câu chèn vào đoạn', ['reading']),
        w(
          's3-t10-w4',
          't10',
          4,
          'N.E.W.T. 1',
          'N.E.W.T. 1 (đề full tính giờ) và phân tích lỗi',
          FULL_TEST,
          { id: NEWT, attempt: 1 },
        ),
      ],
    },
    {
      id: 't11',
      label: 'T11',
      period: '09/27',
      lessons: [
        w('s3-t11-w1', 't11', 1, 'Part 7: đoạn ba · tốc độ đọc', 'Part 7: đoạn ba · luyện tốc độ đọc', ['reading']),
        w('s3-t11-w2', 't11', 2, 'Part 3–4: bộ câu tính giờ', 'Part 3–4: luyện theo bộ câu, có tính giờ', [
          'listening',
        ]),
        w('s3-t11-w3', 't11', 3, 'Vá 2 lỗ hổng lớn nhất', 'Vá 2 lỗ hổng lớn nhất theo Sổ lỗi sai', [
          'listening',
          'reading',
        ]),
        w('s3-t11-w4', 't11', 4, 'N.E.W.T. 2', 'N.E.W.T. 2', FULL_TEST, { id: NEWT, attempt: 2 }),
      ],
    },
    {
      id: 't12',
      label: 'T12',
      period: '10/27',
      lessons: [
        w(
          's3-t12-w1',
          't12',
          1,
          'Chiến lược thời gian Reading',
          "Chiến lược thời gian: Part 5 ≤ 10', Part 6 ≤ 8', Part 7 ≥ 55'",
          ['reading'],
        ),
        w('s3-t12-w2', 't12', 2, 'Ôn từ TSL lỗi nhiều nhất', 'Ôn từ TSL lỗi nhiều nhất', ['vocabulary']),
        w('s3-t12-w3', 't12', 3, 'Đăng ký thi · đề nhẹ', 'Đăng ký thi tại IIG · làm đề nhẹ', ['listening', 'reading']),
        w(
          's3-t12-w4',
          't12',
          4,
          'N.E.W.T. 3',
          'N.E.W.T. 3 (thử trong điều kiện như thi thật)',
          FULL_TEST,
          { id: NEWT, attempt: 3 },
        ),
      ],
    },
  ],
}
