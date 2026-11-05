import type { Brick } from '../types'

/** F05 · Âm cuối (hàng A). Tự soạn; dạy `final-sounds`, `long-short-i`. */
export const F05_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Người Việt hay nuốt âm cuối, nhưng trong tiếng Anh âm cuối đổi nghĩa của từ. ' +
        'rice /raɪs/ là gạo, rise /raɪz/ là mọc lên, right /raɪt/ là đúng. ' +
        'bag /bæɡ/ là cái túi, back /bæk/ là phía sau. five /faɪv/ khác fine /faɪn/. ' +
        'Nguyên âm cũng vậy: sheep /ʃiːp/ có /iː/ dài, ship /ʃɪp/ có /ɪ/ ngắn.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt có thể đọc “rai” cho cả rice, rise, right mà người nghe vẫn tự đoán ra.',
      enRequires:
        'Tiếng Anh bắt buộc đọc rõ âm cuối: /s/ xì nhẹ; /z/ ngân nhẹ và nguyên âm trước nó kéo dài hơn; /t/ chặn hơi gọn. Thiếu âm cuối là thành từ khác.',
      examples: [
        { vi: 'gạo', en: 'rice /raɪs/', audioText: 'rice' },
        { vi: 'mọc lên', en: 'rise /raɪz/', audioText: 'rise' },
        { vi: 'đúng', en: 'right /raɪt/', audioText: 'right' },
      ],
    },
    {
      kind: 'worked',
      en: 'bag /bæɡ/ – back /bæk/',
      audioText: 'bag, back',
      vi: 'cái túi – phía sau',
      noteVi:
        'Mẹo dễ nghe nhất: bag có nguyên âm /æ/ kéo dài hơn rồi khép nhẹ ở /ɡ/; back có nguyên âm ngắn, chặn gọn ở /k/. ' +
        'Đọc rõ âm cuối thì người nghe mới biết là túi hay phía sau.',
    },
    {
      kind: 'faded',
      en: 'five /faɪ___/',
      answer: 'v',
      vi: 'số 5: khác fine /faɪn/ ở âm cuối',
      hintVi: 'Âm cuối của five: răng trên chạm môi dưới, rung cổ.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f05-c1',
          kind: 'listen',
          audioText: 'rise',
          prompt: 'Bạn nghe từ nào?',
          options: ['rice', 'rise', 'right'],
          answer: 1,
          hintVi: 'Nguyên âm kéo dài hơn, âm cuối ngân nhẹ như tiếng ong “zzz”.',
          explanationVi: 'rise /raɪz/: nguyên âm dài hơn, kết thúc bằng /z/. rice là /s/ xì nhẹ, right là /t/ chặn gọn.',
          uses: ['final-sounds'],
        },
        {
          id: 'f05-c2',
          kind: 'listen',
          audioText: 'back',
          prompt: 'Bạn nghe từ nào?',
          options: ['bag', 'back', 'bad'],
          answer: 1,
          hintVi: 'Nguyên âm ngắn, âm cuối chặn gọn.',
          explanationVi: 'back /bæk/: nguyên âm ngắn, chặn gọn ở /k/. bag có nguyên âm dài hơn và /ɡ/ cuối, bad là /d/.',
          uses: ['final-sounds'],
        },
        {
          id: 'f05-c3',
          kind: 'choice',
          prompt: 'sheep (con cừu) có nguyên âm nào?',
          options: ['/iː/ dài', '/ɪ/ ngắn', '/e/'],
          answer: 0,
          hintVi: 'sheep viết hai chữ e, IPA có dấu ː.',
          explanationVi: 'sheep /ʃiːp/: /iː/ dài. ship /ʃɪp/ mới là /ɪ/ ngắn.',
          uses: ['long-short-i', 'long-vowel-mark'],
        },
        {
          id: 'f05-c4',
          kind: 'sort',
          prompt: 'Xếp mỗi từ theo âm cuối.',
          groups: [
            { label: 'Âm cuối /s/', items: ['rice', 'price'] },
            { label: 'Âm cuối /z/', items: ['rise', 'size'] },
          ],
          hintVi: 'Nhìn IPA: rice /raɪs/, rise /raɪz/, price /praɪs/, size /saɪz/.',
          explanationVi: 'rice, price kết thúc /s/ xì nhẹ; rise, size kết thúc /z/ rung.',
          uses: ['final-sounds', 'ipa'],
        },
      ],
      easier: [
        {
          id: 'f05-e1',
          kind: 'choice',
          prompt: 'right /raɪt/ kết thúc bằng âm nào?',
          options: ['/t/', '/s/', '/z/'],
          answer: 0,
          hintVi: 'Nhìn ký hiệu cuối trong IPA.',
          explanationVi: 'right /raɪt/ kết thúc bằng /t/, chặn hơi gọn.',
          uses: ['final-sounds', 'ipa'],
        },
        {
          id: 'f05-e2',
          kind: 'choice',
          prompt: 'five và fine khác nhau ở đâu?',
          options: ['Âm cuối', 'Âm đầu', 'Không khác'],
          answer: 0,
          hintVi: '/faɪv/ và /faɪn/.',
          explanationVi: 'five /faɪv/, fine /faɪn/: chỉ khác âm cuối /v/ và /n/.',
          uses: ['final-sounds'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: nghe rồi nói các cặp từ chỉ khác âm cuối. Chọn từ bạn nghe thấy, rồi nói theo, đọc rõ âm cuối.',
      sampleEn: 'rice – rise – right',
      sampleAudioText: 'rice, rise, right',
      item: {
        id: 'f05-a1',
        kind: 'listen',
        audioText: 'fine',
        prompt: 'Bạn nghe từ nào?',
        options: ['five', 'fine', 'fight'],
        answer: 1,
        hintVi: 'Âm cuối ngân qua mũi.',
        explanationVi: 'fine /faɪn/ kết thúc bằng /n/. five là /v/, fight là /t/.',
        uses: ['final-sounds'],
      },
      speak: [
        { id: 'f05-say-1', text: 'rice, rise, right', vi: 'gạo, mọc lên, đúng' },
        { id: 'f05-say-2', text: 'bag, back', vi: 'cái túi, phía sau' },
        { id: 'f05-say-3', text: 'sheep, ship', vi: 'con cừu, con tàu' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f05-rule-1',
      brickId: 'F05',
      cloze: 'rice /raɪ___/',
      answer: 's',
      vi: 'rice (gạo) kết thúc /s/; rise (mọc lên) là /z/; right (đúng) là /t/.',
    },
    {
      id: 'f05-rule-2',
      brickId: 'F05',
      cloze: 'sheep /ʃ___p/',
      answer: 'iː',
      vi: 'sheep có /iː/ dài, ship có /ɪ/ ngắn.',
    },
  ],
  themeWordIds: ['ngsl-sheep', 'ngsl-bag', 'ngsl-rise', 'ngsl-right', 'ngsl-fine'],
}
