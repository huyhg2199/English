import type { Brick } from '../types'

/**
 * F03 · IPA là gì (hàng A). Tự soạn; dạy `ipa`, `long-vowel-mark`. Ví dụ có ký hiệu /…/ dùng `audioText` để máy đọc
 * từ (không đọc dấu gạch chéo).
 */
export const F03_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Chữ viết tiếng Anh không cho biết cách đọc: sea và see viết khác nhau mà đọc giống nhau. ' +
        'Vì vậy từ điển ghi cách đọc trong hai dấu gạch chéo, theo bảng ký hiệu IPA, ví dụ /siː/. ' +
        'Mười ký hiệu đọc gần như chữ Việt: /b/, /h/, /k/, /l/, /m/, /n/, /t/ như chữ cùng tên; /d/ như đ, /f/ như ph, /s/ như x. ' +
        'Dấu ː sau một nguyên âm nghĩa là đọc kéo dài âm đó.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt viết sao đọc vậy: nhìn chữ “xe” là biết đọc thế nào.',
      enRequires:
        'Tiếng Anh phải xem IPA: sea và see cùng đọc /siː/; car đọc /kɑːr/, chữ c ở đây đọc như /k/.',
      examples: [
        { vi: 'biển', en: 'sea /siː/', audioText: 'sea' },
        { vi: 'chìa khoá', en: 'key /kiː/', audioText: 'key' },
        { vi: 'xe hơi', en: 'car /kɑːr/', audioText: 'car' },
      ],
    },
    {
      kind: 'worked',
      en: 'key /kiː/',
      audioText: 'key',
      vi: 'chìa khoá',
      noteVi: '/k/ đọc như “k” tiếng Việt. /iː/ có dấu ː nên kéo dài: “kiii”, không đọc “ki” cụt.',
    },
    {
      kind: 'faded',
      en: '/siː/ = sea = ___',
      answer: 'see',
      vi: 'sea (biển) và một từ khác (nhìn) cùng đọc /siː/.',
      hintVi: 'Từ có nghĩa “nhìn”, đọc giống hệt sea.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f03-c1',
          kind: 'choice',
          prompt: 'Trong từ điển, cách đọc của một từ được ghi ở đâu?',
          options: ['Giữa hai dấu /…/', 'Trong ngoặc kép “…”', 'Sau dấu hai chấm'],
          answer: 0,
          hintVi: 'Nhớ lại sea /siː/.',
          explanationVi: 'Cách đọc (IPA) nằm giữa hai dấu gạch chéo: sea /siː/.',
          uses: ['ipa'],
        },
        {
          id: 'f03-c2',
          kind: 'listen',
          audioText: 'key',
          prompt: 'Bạn nghe từ nào?',
          options: ['key /kiː/', 'car /kɑːr/', 'sea /siː/'],
          answer: 0,
          hintVi: 'Âm đầu là /k/, sau đó là /iː/ kéo dài.',
          explanationVi: 'Máy đọc key /kiː/: /k/ rồi /iː/ dài. car mở miệng rộng /ɑː/, sea bắt đầu bằng /s/.',
          uses: ['ipa'],
        },
        {
          id: 'f03-c3',
          kind: 'choice',
          prompt: 'Dấu ː trong /siː/ nghĩa là gì?',
          options: ['Đọc kéo dài nguyên âm đứng trước', 'Đọc nhỏ lại', 'Không đọc âm đó'],
          answer: 0,
          hintVi: 'Dấu ː giống hai chấm dọc: âm được giữ lâu hơn.',
          explanationVi: 'ː là dấu kéo dài: /iː/ đọc dài “iii”.',
          uses: ['long-vowel-mark'],
        },
        {
          id: 'f03-c4',
          kind: 'sort',
          prompt: 'Xếp mỗi cách đọc vào đúng nhóm.',
          groups: [
            { label: 'Có nguyên âm kéo dài (ː)', items: ['/siː/', '/kɑːr/'] },
            { label: 'Không có dấu ː', items: ['/bed/', '/mæn/'] },
          ],
          hintVi: 'Tìm dấu ː trong từng ký hiệu.',
          explanationVi: '/siː/ (sea), /kɑːr/ (car) có dấu ː. /bed/ (bed), /mæn/ (man) không có.',
          uses: ['ipa', 'long-vowel-mark'],
        },
      ],
      easier: [
        {
          id: 'f03-e1',
          kind: 'choice',
          prompt: 'sea và see đọc thế nào?',
          options: ['Giống nhau: /siː/', 'Khác nhau hoàn toàn', 'sea không có cách đọc'],
          answer: 0,
          hintVi: 'Xem lại màn 2.',
          explanationVi: 'sea và see viết khác nhưng cùng đọc /siː/. Vì thế cần IPA.',
          uses: ['ipa'],
        },
        {
          id: 'f03-e2',
          kind: 'choice',
          prompt: 'Ký hiệu /m/ đọc giống chữ tiếng Việt nào?',
          options: ['m', 'n', 'b'],
          answer: 0,
          hintVi: '/m/ là một trong 10 ký hiệu giống chữ Việt.',
          explanationVi: '/m/ đọc như “m” trong “mẹ”.',
          uses: ['ipa'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: đọc một mục từ trong từ điển. Nhìn mục “sea /siː/”, chọn cách đọc đúng, rồi nghe và nói theo. ' +
        'Từ nay thẻ từ sẽ hiện IPA.',
      sampleEn: 'sea /siː/',
      sampleAudioText: 'sea',
      item: {
        id: 'f03-a1',
        kind: 'choice',
        prompt: 'Mục từ “sea /siː/” đọc thế nào?',
        options: ['“xii”, kéo dài âm i', '“xê-a”, đọc từng chữ', '“xi” ngắn, không kéo dài'],
        answer: 0,
        hintVi: 'Nhìn ký hiệu, không nhìn chữ viết. Có dấu ː.',
        explanationVi: '/siː/: /s/ như “x”, /iː/ kéo dài. Đọc theo IPA chứ không đọc từng chữ s-e-a.',
        uses: ['ipa', 'long-vowel-mark'],
      },
      speak: [
        { id: 'f03-say-1', text: 'sea', vi: 'biển' },
        { id: 'f03-say-2', text: 'key', vi: 'chìa khoá' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f03-rule-1',
      brickId: 'F03',
      cloze: 'sea /s___/',
      answer: 'iː',
      vi: 'sea đọc /siː/: âm i kéo dài (dấu ː).',
    },
  ],
  themeWordIds: ['ngsl-sound', 'ngsl-word', 'ngsl-sea', 'ngsl-key', 'ngsl-car'],
}
