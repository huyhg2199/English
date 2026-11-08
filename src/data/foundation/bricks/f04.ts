import type { Brick } from '../types'

/**
 * F04 · Nguyên âm, phụ âm, âm tiết, trọng âm (hàng A). Tự soạn; dạy `syllables`, `stress`, `schwa`,
 * `consonant-clusters`. Âm tiết theo chính tả để chạm (`tapSyllable`), khớp `syllables` trong `words.json`.
 */
export const F04_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Mỗi âm tiết có một nguyên âm làm lõi, phụ âm đứng quanh nó. teacher có 2 âm tiết: tea-cher. ' +
        'Từ nhiều âm tiết luôn có một âm tiết nhấn, đọc to và dài hơn; IPA đặt dấu ˈ ngay trước nó: /ˈtiːtʃər/. ' +
        'Âm tiết không nhấn thường đọc nhẹ thành /ə/, gọi là schwa. ' +
        'Cụm phụ âm như st đọc liền, không chèn thêm “xờ”.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt mỗi chữ là một âm tiết, đọc đều nhau, và hầu như không có hai phụ âm đứng liền.',
      enRequires:
        'Tiếng Anh bắt buộc nhấn đúng một âm tiết và đọc liền cụm phụ âm: student /ˈstuːdənt/ có 2 âm tiết, nhấn STU, không đọc “xờ-tu-đần”.',
      examples: [
        { vi: 'học sinh: 2 âm tiết, nhấn STU', en: 'STU-dent', audioText: 'student' },
        { vi: 'máy tính: 3 âm tiết, nhấn PU', en: 'com-PU-ter', audioText: 'computer' },
      ],
    },
    {
      kind: 'worked',
      en: 'family /ˈfæməli/',
      audioText: 'family',
      vi: 'gia đình: 3 âm tiết fam-i-ly',
      noteVi:
        'Dấu ˈ đứng trước fam nên nhấn FAM. Âm tiết giữa không nhấn, đọc nhẹ thành /ə/ (schwa). ' +
        'Khi nói nhanh, nhiều người đọc gọn thành 2 âm tiết (FAM-ly), nhưng vẫn nhấn FAM.',
    },
    {
      kind: 'faded',
      en: 'teacher = tea-___',
      answer: 'cher',
      vi: 'giáo viên: 2 âm tiết, nhấn TEA',
      hintVi: 'teacher đọc /ˈtiːtʃər/: âm tiết thứ hai bắt đầu bằng ch.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f04-c1',
          kind: 'tapSyllable',
          word: 'computer',
          syllables: ['com', 'pu', 'ter'],
          answer: 1,
          hintVi: 'IPA /kəmˈpjuːtər/: dấu ˈ đứng trước âm tiết nào?',
          explanationVi: 'com-PU-ter: dấu ˈ đứng trước /pjuː/. Âm tiết đầu nhẹ thành /kəm/.',
          uses: ['syllables', 'stress'],
        },
        {
          id: 'f04-c2',
          kind: 'tapSyllable',
          word: 'important',
          syllables: ['im', 'por', 'tant'],
          answer: 1,
          hintVi: 'IPA /ɪmˈpɔːrtənt/.',
          explanationVi: 'im-POR-tant: nhấn âm tiết giữa. Âm tiết cuối nhẹ thành /tənt/.',
          uses: ['syllables', 'stress'],
        },
        {
          id: 'f04-c3',
          kind: 'listen',
          audioText: 'student',
          prompt: 'Bạn nghe từ nào? Để ý st đọc liền.',
          options: ['student', 'study', 'stone'],
          answer: 0,
          hintVi: 'Từ có 2 âm tiết, nhấn âm đầu, kết thúc bằng /t/.',
          explanationVi: 'student /ˈstuːdənt/: STU-dent. st đọc liền, không có “xờ” chen vào.',
          uses: ['consonant-clusters', 'syllables'],
        },
        {
          id: 'f04-c4',
          kind: 'choice',
          prompt: 'student có mấy âm tiết?',
          options: ['2', '3', '4'],
          answer: 0,
          hintVi: 'Đếm số nguyên âm nghe được (không đếm chữ cái): stu-dent.',
          explanationVi: 'stu-dent: 2 âm tiết. Chèn nguyên âm thành “xơ-tu-đần” là thành 3 âm tiết, sai.',
          uses: ['syllables', 'consonant-clusters'],
        },
        {
          id: 'f04-c5',
          kind: 'choice',
          prompt: 'Âm /ə/ (schwa) thường nằm ở đâu?',
          options: ['Âm tiết không nhấn', 'Âm tiết được nhấn', 'Chỉ ở đầu từ'],
          answer: 0,
          hintVi: 'Nhớ lại family /ˈfæməli/.',
          explanationVi: 'Schwa /ə/ là âm nhẹ, nằm ở âm tiết không nhấn: fam-ə-li, com-PU-tər.',
          uses: ['schwa'],
        },
      ],
      easier: [
        {
          id: 'f04-e1',
          kind: 'tapSyllable',
          word: 'teacher',
          syllables: ['tea', 'cher'],
          answer: 0,
          hintVi: 'IPA /ˈtiːtʃər/: dấu ˈ ở ngay đầu.',
          explanationVi: 'TEA-cher: nhấn âm tiết đầu.',
          uses: ['stress'],
        },
        {
          id: 'f04-e2',
          kind: 'choice',
          prompt: 'computer có mấy âm tiết?',
          options: ['3', '2', '4'],
          answer: 0,
          hintVi: 'com-pu-ter.',
          explanationVi: 'com-pu-ter: 3 âm tiết, nhấn PU.',
          uses: ['syllables'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: chạm âm tiết được nhấn của family, rồi nghe và nói theo, nhấn đúng âm tiết. ' +
        'Từ nay thẻ từ sẽ tô âm tiết nhấn.',
      sampleEn: 'FAM-i-ly',
      sampleAudioText: 'family',
      item: {
        id: 'f04-a1',
        kind: 'tapSyllable',
        word: 'family',
        syllables: ['fam', 'i', 'ly'],
        answer: 0,
        hintVi: 'IPA /ˈfæməli/.',
        explanationVi: 'FAM-i-ly: dấu ˈ đứng trước fam.',
        uses: ['stress'],
      },
      speak: [
        { id: 'f04-say-1', text: 'student', vi: 'học sinh' },
        { id: 'f04-say-2', text: 'computer', vi: 'máy tính' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f04-rule-1',
      brickId: 'F04',
      cloze: 'com-___-ter',
      answer: 'pu',
      vi: 'computer nhấn âm tiết giữa: com-PU-ter /kəmˈpjuːtər/.',
    },
    {
      id: 'f04-rule-2',
      brickId: 'F04',
      cloze: 'student = ___-dent',
      answer: 'stu',
      vi: 'student có 2 âm tiết, nhấn STU, st đọc liền (không “xờ-tu”).',
    },
  ],
  themeWordIds: ['ngsl-teacher', 'ngsl-student', 'ngsl-computer', 'ngsl-important', 'ngsl-family'],
}
