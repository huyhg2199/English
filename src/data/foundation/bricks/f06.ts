import type { Brick } from '../types'

/**
 * F06 · Số, giá, giờ, ngày, tháng (hàng A). Tự soạn; dạy `numbers`, `teen-ty-stress`, `prices`, `clock-time`,
 * `days-months`, `ordinals`. Ví dụ viết bằng số dùng `audioText` để máy đọc đúng cách nói ("$15" → "fifteen dollars").
 */
export const F06_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Số 13 đến 19 có đuôi -teen, nhấn ở cuối: thirTEEN. Số chục 20, 30… có đuôi -ty, nhấn ở đầu: THIRty. ' +
        'Số 0 trong số phòng, số điện thoại thường đọc “oh”. Giá $15 đọc fifteen dollars; giờ 7:30 đọc seven thirty. ' +
        'Thứ và tháng viết hoa chữ đầu: Monday, March. Ngày trong tháng dùng số thứ tự: 1st first, 2nd second, 3rd third.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “mười ba” và “ba mươi”: hai số nghe khác hẳn nhau.',
      enRequires:
        'Tiếng Anh thirteen và thirty nghe gần giống, phải nhấn đúng chỗ và đọc rõ âm cuối: thirTEEN có /n/ cuối, THIRty thì không.',
      examples: [
        { vi: '13', en: 'thirTEEN', audioText: 'thirteen' },
        { vi: '30', en: 'THIRty', audioText: 'thirty' },
        { vi: '15 đô la', en: '$15', audioText: 'fifteen dollars' },
      ],
    },
    {
      kind: 'worked',
      en: '7:30, Monday',
      audioText: 'seven thirty, Monday',
      vi: '7 giờ 30, thứ Hai',
      noteVi: 'Giờ đọc hai số liền nhau: seven thirty. Thứ viết hoa chữ đầu: Monday.',
    },
    {
      kind: 'faded',
      en: '2nd = ___',
      answer: 'second',
      vi: 'ngày mùng 2 (số thứ tự)',
      hintVi: 'Nhớ lại màn 1: 1st first, 3rd third. 2nd không đọc “twoth”.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f06-c1',
          kind: 'listen',
          audioText: 'thirteen',
          prompt: 'Bạn nghe số nào?',
          options: ['13', '30', '33'],
          answer: 0,
          hintVi: 'Nghe chỗ nhấn: ở cuối hay ở đầu? Có /n/ cuối không?',
          explanationVi: 'thirTEEN = 13: nhấn ở cuối, có /n/. THIRty = 30 nhấn ở đầu.',
          uses: ['numbers', 'teen-ty-stress'],
        },
        {
          id: 'f06-c2',
          kind: 'listen',
          audioText: 'fifty dollars',
          prompt: 'Bạn nghe giá nào?',
          options: ['$15', '$50', '$5'],
          answer: 1,
          hintVi: 'Nhấn ở âm tiết đầu: FIF-ty.',
          explanationVi: 'fifty dollars = $50. fifteen dollars ($15) nhấn ở cuối: fifTEEN.',
          uses: ['prices', 'teen-ty-stress'],
        },
        {
          id: 'f06-c3',
          kind: 'choice',
          prompt: 'Số phòng 305 thường đọc thế nào?',
          options: ['three oh five', 'three zero zero five', 'thirty-five'],
          answer: 0,
          hintVi: 'Số phòng đọc từng chữ số; số 0 đọc “oh”.',
          explanationVi: '305 đọc three oh five: từng chữ số, số 0 thành “oh”.',
          uses: ['numbers'],
        },
        {
          id: 'f06-c4',
          kind: 'order',
          prompt: 'Xếp thành cách đọc giờ 8:45.',
          tokens: ['eight', 'forty', 'five'],
          hintVi: 'Đọc giờ trước, phút sau.',
          explanationVi: '8:45 = eight forty-five: giờ (eight) rồi phút (forty-five).',
          uses: ['clock-time', 'numbers'],
        },
        {
          id: 'f06-c5',
          kind: 'choice',
          prompt: 'Ngày 3 trong tháng (3rd) đọc là gì?',
          options: ['third', 'three', 'thirty'],
          answer: 0,
          hintVi: '3rd: hai chữ cuối “rd” là gợi ý.',
          explanationVi: '3rd = third. Ngày trong tháng dùng số thứ tự: first, second, third.',
          uses: ['ordinals'],
        },
      ],
      easier: [
        {
          id: 'f06-e1',
          kind: 'choice',
          prompt: 'Monday là thứ mấy?',
          options: ['Thứ Hai', 'Chủ nhật', 'Thứ Ba'],
          answer: 0,
          hintVi: 'Ngày đầu tuần làm việc.',
          explanationVi: 'Monday = thứ Hai. Thứ và tháng viết hoa chữ đầu.',
          uses: ['days-months'],
        },
        {
          id: 'f06-e2',
          kind: 'choice',
          prompt: 'Số nào nhấn ở âm tiết đầu?',
          options: ['THIRty (30)', 'thirTEEN (13)', 'fifTEEN (15)'],
          answer: 0,
          hintVi: 'Đuôi -ty nhấn ở đầu.',
          explanationVi: 'Số chục (-ty) nhấn ở đầu: THIRty. Số -teen nhấn ở cuối.',
          uses: ['teen-ty-stress'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: nói một giá tiền và giờ học của bạn. Chọn cách đọc giờ học 7:30, rồi nói theo 2 mẫu. ' +
        'Sau đó tự nói giá một món đồ bạn mua gần đây.',
      sampleEn: '$15 · 7:30',
      sampleAudioText: 'fifteen dollars, seven thirty',
      item: {
        id: 'f06-a1',
        kind: 'choice',
        prompt: 'Giờ học 7:30 đọc thế nào?',
        options: ['seven thirty', 'seven three zero', 'thirty seven'],
        answer: 0,
        hintVi: 'Giờ trước, phút sau.',
        explanationVi: '7:30 = seven thirty: giờ (seven) rồi phút (thirty).',
        uses: ['clock-time'],
      },
      speak: [
        { id: 'f06-say-1', text: 'fifteen dollars', vi: '15 đô la' },
        { id: 'f06-say-2', text: 'seven thirty, Monday', vi: '7 giờ 30, thứ Hai' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f06-rule-1',
      brickId: 'F06',
      cloze: 'thir___ = 13',
      answer: 'teen',
      vi: '13–19 có đuôi -teen, nhấn ở cuối; 30, 40… có đuôi -ty, nhấn ở đầu.',
    },
    {
      id: 'f06-rule-2',
      brickId: 'F06',
      cloze: '1st first, 2nd ___, 3rd third',
      answer: 'second',
      vi: 'Số thứ tự cho ngày trong tháng: first, second, third, rồi thêm -th (fourth…).',
    },
  ],
  themeWordIds: ['ngsl-price', 'ngsl-money', 'ngsl-hour', 'ngsl-week', 'ngsl-month'],
}
