import type { Brick, BrickTable } from '../types'

/**
 * F06 · Số, giá, giờ, ngày, tháng (hàng A). Tự soạn; dạy `numbers`, `teen-ty-stress`, `prices`, `clock-time`,
 * `days-months`, `ordinals`. Ví dụ viết bằng số dùng `audioText` để máy đọc đúng cách nói ("$15" → "fifteen dollars").
 * Story 34: màn giải thích có 6 bảng tra (số 0–19, số chục và 100, 7 thứ, 12 tháng, số thứ tự, giờ / giá / số phòng)
 * vì NGSL không có số và tên thứ / tháng; 8 thẻ quy tắc (riêng F06, viên khác 1–2). Ngày kiểu Mỹ: tháng trước, ngày
 * sau, ngày đọc bằng số thứ tự (May 3rd = May third); giới từ on / in chỉ thời gian vẫn do F18 dạy.
 */

const NUMBERS: BrickTable = {
  id: 'f06-numbers',
  title: 'Số 0–19',
  noteVi:
    '13–19 nhấn ở cuối: thirTEEN; chắc nhất là nghe /n/ cuối (khi đếm hay đứng trước danh từ, chỗ nhấn có thể dời lên ' +
    'đầu). Số phòng, số điện thoại đọc từng chữ số, 0 đọc oh /oʊ/.',
  rows: [
    { en: 'zero', vi: '0', ipa: 'ˈzɪroʊ' },
    { en: 'one', vi: '1', ipa: 'wʌn' },
    { en: 'two', vi: '2', ipa: 'tuː' },
    { en: 'three', vi: '3', ipa: 'θriː' },
    { en: 'four', vi: '4', ipa: 'fɔːr' },
    { en: 'five', vi: '5', ipa: 'faɪv' },
    { en: 'six', vi: '6', ipa: 'sɪks' },
    { en: 'seven', vi: '7', ipa: 'ˈsevən' },
    { en: 'eight', vi: '8', ipa: 'eɪt' },
    { en: 'nine', vi: '9', ipa: 'naɪn' },
    { en: 'ten', vi: '10', ipa: 'ten' },
    { en: 'eleven', vi: '11', ipa: 'iˈlevən' },
    { en: 'twelve', vi: '12', ipa: 'twelv' },
    { en: 'thirteen', vi: '13', ipa: 'θɝːˈtiːn' },
    { en: 'fourteen', vi: '14', ipa: 'fɔːrˈtiːn' },
    { en: 'fifteen', vi: '15', ipa: 'fɪfˈtiːn' },
    { en: 'sixteen', vi: '16', ipa: 'sɪksˈtiːn' },
    { en: 'seventeen', vi: '17', ipa: 'sevənˈtiːn' },
    { en: 'eighteen', vi: '18', ipa: 'eɪˈtiːn' },
    { en: 'nineteen', vi: '19', ipa: 'naɪnˈtiːn' },
  ],
}

const TENS: BrickTable = {
  id: 'f06-tens',
  title: 'Số chục và 100',
  noteVi:
    'Số chục nhấn ở đầu: THIRty. 21–99 (trừ số tròn chục): số chục, gạch nối, số đơn: twenty-one (21), forty-five (45), ' +
    'ninety-nine (99). forty không có u. 200 = two hundred (hundred không thêm -s). t̬: kiểu Mỹ đọc t nhẹ gần như đ ' +
    '(twenty nghe gần “tuen-đi”).',
  rows: [
    { en: 'twenty', vi: '20', ipa: 'ˈtwent̬i' },
    { en: 'thirty', vi: '30', ipa: 'ˈθɝːt̬i' },
    { en: 'forty', vi: '40', ipa: 'ˈfɔːrt̬i' },
    { en: 'fifty', vi: '50', ipa: 'ˈfɪfti' },
    { en: 'sixty', vi: '60', ipa: 'ˈsɪksti' },
    { en: 'seventy', vi: '70', ipa: 'ˈsevənt̬i' },
    { en: 'eighty', vi: '80', ipa: 'ˈeɪt̬i' },
    { en: 'ninety', vi: '90', ipa: 'ˈnaɪnt̬i' },
    { en: 'one hundred', vi: '100', ipa: 'wʌn ˈhʌndrəd' },
  ],
}

const DAYS: BrickTable = {
  id: 'f06-days',
  title: '7 thứ',
  noteVi:
    'Viết hoa chữ đầu. Wednesday không đọc chữ d thứ nhất (Wed-). Tuesday (thứ Ba) và Thursday (thứ Năm) dễ nhầm: ' +
    'Tuesday mở đầu bằng /t/ thường; Thursday mở đầu bằng /θ/: đặt đầu lưỡi giữa hai răng rồi thổi hơi, không phải ' +
    '“th” tiếng Việt.',
  rows: [
    { en: 'Monday', vi: 'thứ Hai', ipa: 'ˈmʌndeɪ' },
    { en: 'Tuesday', vi: 'thứ Ba', ipa: 'ˈtuːzdeɪ' },
    { en: 'Wednesday', vi: 'thứ Tư', ipa: 'ˈwenzdeɪ' },
    { en: 'Thursday', vi: 'thứ Năm', ipa: 'ˈθɝːzdeɪ' },
    { en: 'Friday', vi: 'thứ Sáu', ipa: 'ˈfraɪdeɪ' },
    { en: 'Saturday', vi: 'thứ Bảy', ipa: 'ˈsæt̬ɚdeɪ' },
    { en: 'Sunday', vi: 'Chủ nhật', ipa: 'ˈsʌndeɪ' },
  ],
}

const MONTHS: BrickTable = {
  id: 'f06-months',
  title: '12 tháng',
  noteVi:
    'Viết hoa chữ đầu. June một âm tiết, July nhấn âm sau: juLY. September → December nhấn âm thứ hai. Văn bản ' +
    'thường chỉ viết May 3 (không có rd), nhưng vẫn đọc May third.',
  rows: [
    { en: 'January', vi: 'tháng 1', ipa: 'ˈdʒænjueri' },
    { en: 'February', vi: 'tháng 2', ipa: 'ˈfebrueri' },
    { en: 'March', vi: 'tháng 3', ipa: 'mɑːrtʃ' },
    { en: 'April', vi: 'tháng 4', ipa: 'ˈeɪprəl' },
    { en: 'May', vi: 'tháng 5', ipa: 'meɪ' },
    { en: 'June', vi: 'tháng 6', ipa: 'dʒuːn' },
    { en: 'July', vi: 'tháng 7', ipa: 'dʒʊˈlaɪ' },
    { en: 'August', vi: 'tháng 8', ipa: 'ˈɑːɡəst' },
    { en: 'September', vi: 'tháng 9', ipa: 'sepˈtembɚ' },
    { en: 'October', vi: 'tháng 10', ipa: 'ɑːkˈtoʊbɚ' },
    { en: 'November', vi: 'tháng 11', ipa: 'noʊˈvembɚ' },
    { en: 'December', vi: 'tháng 12', ipa: 'dɪˈsembɚ' },
  ],
}

const ORDINALS: BrickTable = {
  id: 'f06-ordinals',
  title: 'Số thứ tự cho ngày',
  noteVi:
    'Thường thêm -th: fourth, sixth, tenth, eleventh, thirteenth. Đổi chữ: fifth, ninth, twelfth; eighth chỉ thêm h; ' +
    'số chục đổi y thành ieth: twentieth, thirtieth. Số tận cùng 1, 2, 3 dùng first, second, third (21st twenty-first, ' +
    '22nd twenty-second, 23rd twenty-third), trừ 11th eleventh, 12th twelfth, 13th thirteenth.',
  rows: [
    { en: 'first', vi: '1st', ipa: 'fɝːst' },
    { en: 'second', vi: '2nd', ipa: 'ˈsekənd' },
    { en: 'third', vi: '3rd', ipa: 'θɝːd' },
    { en: 'fourth', vi: '4th', ipa: 'fɔːrθ' },
    { en: 'fifth', vi: '5th', ipa: 'fɪfθ' },
    { en: 'sixth', vi: '6th', ipa: 'sɪksθ' },
    { en: 'eighth', vi: '8th', ipa: 'eɪtθ' },
    { en: 'ninth', vi: '9th', ipa: 'naɪnθ' },
    { en: 'tenth', vi: '10th', ipa: 'tenθ' },
    { en: 'eleventh', vi: '11th', ipa: 'iˈlevənθ' },
    { en: 'twelfth', vi: '12th', ipa: 'twelfθ' },
    { en: 'thirteenth', vi: '13th', ipa: 'θɝːˈtiːnθ' },
    { en: 'twentieth', vi: '20th', ipa: 'ˈtwent̬iəθ' },
    { en: 'twenty-first', vi: '21st', ipa: 'twent̬iˈfɝːst' },
    { en: 'twenty-second', vi: '22nd', ipa: 'twent̬iˈsekənd' },
    { en: 'twenty-third', vi: '23rd', ipa: 'twent̬iˈθɝːd' },
    { en: 'thirtieth', vi: '30th', ipa: 'ˈθɝːt̬iəθ' },
    { en: 'thirty-first', vi: '31st', ipa: 'θɝːt̬iˈfɝːst' },
  ],
}

const TIME_PRICE: BrickTable = {
  id: 'f06-time-price',
  title: 'Giờ, giá, số phòng',
  noteVi: "Giờ trước, phút sau. Phút 01–09 đọc oh + số; giờ đúng thêm o'clock. Giá lẻ nói nhanh: $2.50 = two fifty.",
  rows: [
    { en: "nine o'clock", vi: '9:00 · 9 giờ đúng' },
    { en: 'seven thirty', vi: '7:30 · 7 giờ 30' },
    { en: 'eight oh five', vi: '8:05 · 8 giờ 5 phút' },
    { en: 'fifteen dollars', vi: '$15 · 15 đô la' },
    { en: 'two fifty', vi: '$2.50 · 2 đô 50 xu' },
    { en: 'three oh five', vi: '305 · phòng 305' },
  ],
}

export const F06_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Viên này có 6 bảng tra bên dưới: số 0–19, số chục, 7 thứ, 12 tháng, số thứ tự, giờ và giá. Mở từng bảng, ' +
        'bấm nghe và đọc theo. Nhớ ba điều: 13–19 nhấn ở cuối (thirTEEN), số chục nhấn ở đầu (THIRty); 21–99 ghép số ' +
        'chục, gạch nối, số đơn: twenty-one; thứ và tháng viết hoa chữ đầu, ngày trong tháng đọc bằng số thứ tự: ' +
        'May 3rd đọc May third.',
      tables: [NUMBERS, TENS, DAYS, MONTHS, ORDINALS, TIME_PRICE],
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “mười ba” và “ba mươi” nghe khác hẳn nhau, và nói ngày trước tháng: ngày 3 tháng 5.',
      enRequires:
        'Tiếng Anh thirteen và thirty nghe gần giống: thirTEEN nhấn ở cuối, có /n/ cuối; THIRty nhấn ở đầu. Ngày kiểu Mỹ ' +
        'nói tháng trước, ngày sau, ngày dùng số thứ tự: May 3rd, đọc May third. Viết bằng số kiểu Mỹ thì 5/3 là May 3rd ' +
        '(ngày 3 tháng 5), không phải ngày 5 tháng 3 như cách viết của người Việt.',
      examples: [
        { vi: '13', en: 'thirTEEN', audioText: 'thirteen' },
        { vi: '30', en: 'THIRty', audioText: 'thirty' },
        { vi: '15 đô la', en: '$15', audioText: 'fifteen dollars' },
        { vi: 'ngày 3 tháng 5', en: 'May 3rd', audioText: 'May third' },
      ],
    },
    {
      kind: 'worked',
      en: 'Monday, May 3rd, 7:30',
      audioText: 'Monday, May third, seven thirty',
      vi: 'thứ Hai, ngày 3 tháng 5, lúc 7 giờ 30',
      noteVi: 'Thứ và tháng viết hoa. Ngày đọc bằng số thứ tự (3rd = third). Giờ đọc hai số liền nhau: seven thirty.',
    },
    {
      kind: 'faded',
      en: '2nd = ___',
      answer: 'second',
      vi: 'ngày mùng 2 (số thứ tự)',
      hintVi: 'Xem bảng “Số thứ tự cho ngày” ở màn 1: 1st first, 3rd third. 2nd không đọc “twoth”.',
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
          prompt: 'Số 45 viết bằng chữ thế nào?',
          options: ['forty-five', 'fourty-five', 'forty five'],
          answer: 0,
          hintVi: 'Số chục + gạch nối + số đơn. 40 viết thế nào?',
          explanationVi: '45 = forty-five: có gạch nối giữa số chục và số đơn. 40 viết forty, không có u (four thì có u).',
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
          prompt: 'Ngày 3 tháng 5, kiểu Mỹ nói thế nào?',
          options: ['May third', 'three May', 'May three'],
          answer: 0,
          hintVi: 'Tháng trước, ngày sau; ngày dùng số thứ tự.',
          explanationVi:
            'May 3rd đọc May third: tháng (May) rồi số thứ tự (third). Văn bản có khi chỉ viết May 3, nhưng vẫn đọc May third.',
          uses: ['days-months', 'ordinals'],
        },
      ],
      easier: [
        {
          id: 'f06-e1',
          kind: 'choice',
          prompt: 'Thursday là thứ mấy?',
          options: ['Thứ Năm', 'Thứ Ba', 'Thứ Tư'],
          answer: 0,
          hintVi: 'Xem bảng 7 thứ: Tuesday, Wednesday rồi mới tới Thursday.',
          explanationVi: 'Thursday = thứ Năm. Tuesday = thứ Ba, Wednesday = thứ Tư.',
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
        'Áp dụng: nói ngày sinh và giờ học của bạn. Chọn cách nói đúng ngày 21 tháng 6, rồi nói theo 3 mẫu. ' +
        'Sau đó tự nói ngày sinh của bạn kiểu Mỹ (tháng trước, ngày sau) và giờ bạn học mỗi ngày.',
      sampleEn: 'June 21st · 7:30',
      sampleAudioText: 'June twenty-first, seven thirty',
      item: {
        id: 'f06-a1',
        kind: 'choice',
        prompt: 'Ngày 21 tháng 6 nói thế nào?',
        options: ['June twenty-first', 'June twenty-one', 'twenty-one June'],
        answer: 0,
        hintVi: 'Tháng trước; ngày dùng số thứ tự: 21st.',
        explanationVi: '21st = twenty-first: số chục giữ nguyên, số đơn đổi thành số thứ tự (one → first).',
        uses: ['days-months', 'ordinals', 'numbers'],
      },
      speak: [
        { id: 'f06-say-1', text: 'fifteen dollars', vi: '15 đô la' },
        { id: 'f06-say-2', text: 'seven thirty, Monday', vi: '7 giờ 30, thứ Hai' },
        { id: 'f06-say-3', text: 'June twenty-first', vi: 'ngày 21 tháng 6' },
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
    {
      id: 'f06-rule-3',
      brickId: 'F06',
      cloze: '45 = ___-five',
      answer: 'forty',
      vi: '21–99: số chục + gạch nối + số đơn. 40 viết forty (không có u), dù 4 là four.',
    },
    {
      id: 'f06-rule-4',
      brickId: 'F06',
      cloze: 'Monday, Tuesday, ___',
      answer: 'Wednesday',
      vi: 'thứ Hai, thứ Ba, thứ Tư. Wednesday đọc /ˈwenzdeɪ/, chữ d thứ nhất (Wed-) không đọc.',
    },
    {
      id: 'f06-rule-5',
      brickId: 'F06',
      cloze: 'Tuesday = thứ Ba, ___ = thứ Năm',
      answer: 'Thursday',
      vi: 'Tuesday /ˈtuːzdeɪ/ thứ Ba, Thursday /ˈθɝːzdeɪ/ thứ Năm: hai từ dễ nhầm. /θ/: đầu lưỡi giữa hai răng, thổi hơi.',
    },
    {
      id: 'f06-rule-6',
      brickId: 'F06',
      cloze: 'May, June, ___',
      answer: 'July',
      vi: 'tháng 5, 6, 7. June /dʒuːn/ một âm tiết; July /dʒʊˈlaɪ/ nhấn âm sau.',
    },
    {
      id: 'f06-rule-7',
      brickId: 'F06',
      cloze: 'October, November, ___',
      answer: 'December',
      vi: 'tháng 10, 11, 12. September → December nhấn âm thứ hai: deCEMber.',
    },
    {
      id: 'f06-rule-8',
      brickId: 'F06',
      cloze: 'ngày 3 tháng 5 = May ___',
      answer: 'third',
      vi: 'Kiểu Mỹ: tháng trước, ngày sau; ngày đọc bằng số thứ tự: May 3rd = May third. Viết số kiểu Mỹ: 5/3 = May 3rd.',
    },
  ],
  themeWordIds: ['ngsl-price', 'ngsl-money', 'ngsl-hour', 'ngsl-week', 'ngsl-month'],
}
