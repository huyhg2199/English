import { partWeekBuilder } from './sections'
import type { Stage } from './types'

const STAGE_ID = 's2'

const w = partWeekBuilder(STAGE_ID)

export const stage2: Stage = {
  id: STAGE_ID,
  number: 2,
  name: 'Công sở',
  yearLabel: 'Năm 3–4',
  scoreGoal: '300→550',
  monthRange: 'T5–T8',
  period: '03–06/2027',
  focus: 'Từ vựng công sở (TSL) · Part 1, 2, 5 (bắt đầu làm quen Part 6)',
  estimatedScore: '480–580',
  content: [
    'Hiểu cấu trúc đề TOEIC L&R gồm 7 Part, 200 câu, 120 phút.',
    'Từ loại và hậu tố, giới từ, liên từ, mệnh đề quan hệ, V-ing/to V, câu điều kiện loại 0–1–2, bị động.',
    'Từ vựng TSL theo chủ đề: văn phòng, tuyển dụng, họp, du lịch, nhà hàng, mua sắm, tài chính, sản xuất, marketing.',
  ],
  fixedTasks: [
    'Mỗi ngày thêm 8–10 từ TSL vào Anki, mỗi từ kèm câu từ tin kinh tế/AI nếu tìm được.',
    'Part 2: chép chính tả câu hỏi rồi nói to câu trả lời.',
    'Part 5: mọi câu sai đều ghi vào Sổ lỗi sai theo loại lỗi (từ loại, giới từ, thì…).',
    'Thứ Bảy: 1 tin Breaking News English cấp 3–4. Chủ nhật: 1 tập phim, tắt sub Việt.',
  ],
  resources: [
    {
      area: 'TOEIC',
      items:
        'ETS: TOEIC L&R sample questions và Examinee Handbook (ets.org/toeic) · IIG Việt Nam (đại diện ETS tại VN) để xem lịch và thể lệ thi',
      tags: ['listening', 'reading'],
    },
    {
      area: 'Từ vựng',
      items: 'TSL (TOEIC Service List) · Oxford 3000 (B1) · Investopedia (thuật ngữ tài chính)',
      tags: ['vocabulary'],
    },
    {
      area: 'Ngữ pháp',
      items: 'British Council LearnEnglish Grammar B1 · Perfect English Grammar · BBC Learning English Grammar',
      tags: ['grammar'],
    },
    {
      area: 'Nghe',
      items: "BBC 6 Minute English · ESL Lab (Randall's) · ELLLO · VOA Learning English",
      tags: ['listening'],
    },
    {
      area: 'Viết (trục phụ)',
      items: 'Viết commit/README bằng tiếng Anh · Cambridge Write & Improve',
      tags: [],
    },
  ],
  canDo: [
    'Chọn đúng đáp án Part 1 nhờ nhận ra động từ, kể cả câu bị động.',
    'Bắt được từ để hỏi trong Part 2 và loại được đáp án bẫy lặp âm.',
    'Làm Part 5 khoảng 30 giây/câu.',
    'Đọc hiểu email công việc ngắn.',
    'Vốn từ khoảng 1000 từ nền cộng 500–700 từ TSL.',
  ],
  checkpoint: {
    id: 'owl-2',
    name: 'O.W.L. 2',
    when: 'cuối T8',
    scope: ['Làm đề mẫu ETS, phần Part 1, 2, 5, 6, có tính giờ.'],
    passThreshold: 'Qua cửa khi đúng ≥ 60–65% các Part này.',
    ifNotPassed: 'Nếu chưa đạt, ôn lại 2 Part yếu nhất trong 2 tuần rồi mới lên chặng 3.',
    attempts: 1,
  },
  months: [
    {
      id: 't5',
      label: 'T5',
      period: '03/27',
      lessons: [
        w('s2-t5-w1', 't5', 1, 'Examinee Handbook · từ loại', 'Đọc TOEIC Examinee Handbook · từ loại và hậu tố', [
          'reading',
          'grammar',
          'vocabulary',
        ]),
        w('s2-t5-w2', 't5', 2, 'Part 1: ảnh có người', 'Part 1: ảnh có người (hiện tại tiếp diễn)', [
          'listening',
          'grammar',
        ]),
        w('s2-t5-w3', 't5', 3, 'Part 1: ảnh đồ vật', 'Part 1: ảnh đồ vật (bị động has been placed)', [
          'listening',
          'grammar',
        ]),
        w('s2-t5-w4', 't5', 4, 'Part 5: chọn từ loại', 'Part 5: chọn từ loại', ['reading', 'grammar', 'vocabulary']),
      ],
    },
    {
      id: 't6',
      label: 'T6',
      period: '04/27',
      lessons: [
        w('s2-t6-w1', 't6', 1, 'Part 2: câu hỏi Wh-', 'Part 2: câu hỏi Wh-', ['listening']),
        w('s2-t6-w2', 't6', 2, 'Part 2: Yes/No, câu hỏi đuôi', 'Part 2: câu hỏi Yes/No, câu hỏi đuôi', [
          'listening',
          'grammar',
        ]),
        w('s2-t6-w3', 't6', 3, 'Part 5: giới từ', 'Part 5: giới từ chỉ thời gian/nơi chốn', ['reading', 'grammar']),
        w(
          's2-t6-w4',
          't6',
          4,
          'Part 2: trả lời gián tiếp',
          'Part 2: câu trả lời gián tiếp (bẫy lặp âm, đồng âm)',
          ['listening', 'vocabulary'],
        ),
      ],
    },
    {
      id: 't7',
      label: 'T7',
      period: '05/27',
      lessons: [
        w('s2-t7-w1', 't7', 1, 'Part 5: liên từ, trạng từ nối', 'Part 5: liên từ và trạng từ nối', [
          'reading',
          'grammar',
        ]),
        w('s2-t7-w2', 't7', 2, 'Part 5: mệnh đề quan hệ', 'Part 5: mệnh đề quan hệ', ['reading', 'grammar']),
        w('s2-t7-w3', 't7', 3, 'Part 2: đề nghị, yêu cầu', 'Part 2: lời đề nghị, yêu cầu, câu trần thuật', [
          'listening',
        ]),
        w('s2-t7-w4', 't7', 4, 'Part 5: V-ing/to V · điều kiện', 'Part 5: V-ing/to V · điều kiện 0–1–2', [
          'reading',
          'grammar',
        ]),
      ],
    },
    {
      id: 't8',
      label: 'T8',
      period: '06/27',
      lessons: [
        w('s2-t8-w1', 't8', 1, 'Làm quen Part 6', 'Làm quen Part 6 (điền vào email/thông báo)', ['reading']),
        w('s2-t8-w2', 't8', 2, 'Ôn Part 1–2 tính giờ', 'Ôn Part 1–2 có tính giờ', ['listening']),
        w('s2-t8-w3', 't8', 3, "Ôn Part 5: 30 câu/10'", "Ôn Part 5: làm 30 câu trong 10'", ['reading', 'grammar']),
        w('s2-t8-w4', 't8', 4, 'O.W.L. 2', 'O.W.L. 2', ['listening', 'reading', 'grammar', 'vocabulary'], {
          id: 'owl-2',
          attempt: 1,
        }),
      ],
    },
  ],
}
