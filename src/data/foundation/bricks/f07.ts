import type { Brick } from '../types'

/**
 * F07 · Từ loại (hàng B). Tự soạn; dạy `parts-of-speech`, `word-suffixes`. Tên từ loại gọi đúng như `POS_LABELS` (danh từ,
 * động từ, tính từ, trạng từ, đại từ, giới từ, từ hạn định), vì từ viên này thẻ từ hiện nhãn từ loại.
 * Câu tiếng Anh của hàng B chỉ dùng S + V hiện tại, mệnh lệnh, Let's, Please (không to be, have, do, can…).
 */
export const F07_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Mỗi từ tiếng Anh thuộc một từ loại. Danh từ gọi tên người, vật (friend, information). Động từ chỉ việc làm (work). ' +
        'Tính từ tả danh từ (beautiful). Trạng từ tả cách làm, mức độ (quickly, really). ' +
        'Nhóm “từ nhỏ” gồm đại từ (I, you), giới từ (in, on) và mạo từ a, the (thẻ từ ghi là từ hạn định). ' +
        'Đuôi từ gợi ý từ loại: -tion là danh từ, -ful là tính từ, -ly thường là trạng từ.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “cô gái đẹp”, “vẻ đẹp”, “tôi rất thích”: chữ “đẹp”, chữ “rất” giữ nguyên ở mọi chỗ.',
      enRequires:
        'Tiếng Anh đổi đuôi theo từ loại: beauty (vẻ đẹp, danh từ) → beautiful (đẹp, tính từ). Nói “a beautiful girl”, ' +
        'không nói “a beauty girl”. “Rất thích” là “really like”: very đứng trước tính từ (very beautiful), không đứng trước động từ, nên không nói “I very like”. ' +
        'Cũng nói được “I like it very much” (very much đứng cuối câu).',
      examples: [
        { vi: 'một cô gái đẹp', en: 'a beautiful girl' },
        { vi: 'Tôi rất thích nó.', en: 'I really like it.' },
        { vi: 'thông báo → thông tin (đuôi -tion: danh từ)', en: 'inform → information', audioText: 'inform, information' },
        { vi: 'nhanh → một cách nhanh (đuôi -ly: trạng từ)', en: 'quick → quickly', audioText: 'quick, quickly' },
      ],
    },
    {
      kind: 'worked',
      en: 'I work quickly.',
      vi: 'Tôi làm việc nhanh.',
      noteVi:
        'work là động từ (việc làm). quickly là trạng từ, tả cách làm, nhận ra nhờ đuôi -ly. Ở câu này trạng từ đứng sau động từ, giống tiếng Việt “làm nhanh”.',
    },
    {
      kind: 'faded',
      en: 'a ___ girl',
      answer: 'beautiful',
      vi: 'một cô gái đẹp',
      hintVi: 'Tả danh từ girl thì cần tính từ: beauty thêm đuôi -ful (y đổi thành i).',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f07-c1',
          kind: 'sort',
          prompt: 'Xếp mỗi từ vào đúng từ loại theo đuôi của nó.',
          groups: [
            { label: 'Tính từ (-ful)', items: ['beautiful', 'useful'] },
            { label: 'Trạng từ (-ly)', items: ['quickly', 'slowly'] },
            { label: 'Danh từ (-tion)', items: ['information', 'station'] },
          ],
          hintVi: 'Nhìn đuôi từ: -ful, -ly, -tion.',
          explanationVi: 'Đuôi -ful thường là tính từ, -ly thường là trạng từ, -tion thường là danh từ.',
          uses: ['word-suffixes', 'parts-of-speech'],
        },
        {
          id: 'f07-c2',
          kind: 'choice',
          prompt: 'Câu nào đúng cho “Tôi rất thích nó”?',
          options: ['I really like it.', 'I very like it.', 'I like really it.'],
          answer: 0,
          hintVi: '“rất” đứng cạnh động từ like thì dùng trạng từ nào?',
          explanationVi:
            'Trạng từ really đứng trước động từ like: I really like it. very đứng trước tính từ (very beautiful), không đứng trước động từ. ' +
            'Cũng nói được: I like it very much.',
          uses: ['parts-of-speech'],
        },
        {
          id: 'f07-c3',
          kind: 'choice',
          prompt: 'Chọn từ đúng: a ___ day (một ngày đẹp trời)',
          options: ['beautiful', 'beauty', 'beautifully'],
          answer: 0,
          hintVi: 'Tả danh từ day thì cần tính từ.',
          explanationVi: 'Tả danh từ thì dùng tính từ beautiful (-ful). beauty là danh từ, beautifully là trạng từ.',
          uses: ['parts-of-speech', 'word-suffixes'],
        },
        {
          id: 'f07-c4',
          kind: 'listen',
          audioText: 'information',
          prompt: 'Bạn nghe thấy từ nào?',
          options: ['information (danh từ)', 'inform (động từ)', 'informal (tính từ)'],
          answer: 0,
          hintVi: 'Nghe phần cuối: có âm “-shần” của đuôi -tion không?',
          explanationVi:
            'information có đuôi -tion đọc /ʃən/ (gần như “shần”), là danh từ. Từ có đuôi -tion nhấn ở âm tiết ngay trước đuôi: in-for-MA-tion.',
          uses: ['word-suffixes', 'stress'],
        },
        {
          id: 'f07-c5',
          kind: 'choice',
          prompt: 'Trong “I work quickly.”, quickly là từ loại gì?',
          options: ['trạng từ', 'tính từ', 'danh từ'],
          answer: 0,
          hintVi: 'quickly tả cách làm việc, và có đuôi -ly.',
          explanationVi: 'quickly tả cách làm (work) và có đuôi -ly nên là trạng từ.',
          uses: ['parts-of-speech', 'word-suffixes'],
        },
      ],
      easier: [
        {
          id: 'f07-e1',
          kind: 'choice',
          prompt: 'Từ nào là danh từ?',
          options: ['information', 'beautiful', 'quickly'],
          answer: 0,
          hintVi: 'Danh từ gọi tên một thứ; nhìn đuôi -tion.',
          explanationVi: 'information (thông tin) có đuôi -tion, là danh từ. beautiful là tính từ, quickly là trạng từ.',
          uses: ['parts-of-speech', 'word-suffixes'],
        },
        {
          id: 'f07-e2',
          kind: 'choice',
          prompt: 'Từ có đuôi -ly (quickly, really) thường là từ loại gì?',
          options: ['trạng từ', 'danh từ', 'động từ'],
          answer: 0,
          hintVi: 'Nhớ lại màn 1: -tion, -ful, -ly.',
          explanationVi: 'Đuôi -ly thường là trạng từ: quickly, slowly, really.',
          uses: ['word-suffixes'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: xếp 8 từ quen thuộc vào 4 nhóm danh từ, động từ, tính từ, trạng từ, rồi nói theo 2 mẫu. ' +
        'Từ nay thẻ từ hiện nhãn từ loại, ví dụ really ghi “trạng từ”.',
      sampleEn: 'I really like it.',
      item: {
        id: 'f07-a1',
        kind: 'sort',
        prompt: 'Xếp 8 từ vào 4 nhóm.',
        groups: [
          { label: 'danh từ', items: ['friend', 'water'] },
          { label: 'động từ', items: ['drink', 'eat'] },
          { label: 'tính từ', items: ['beautiful', 'red'] },
          { label: 'trạng từ', items: ['really', 'quickly'] },
        ],
        hintVi: 'Danh từ gọi tên, động từ chỉ việc làm, tính từ tả danh từ, trạng từ tả cách làm hoặc mức độ.',
        explanationVi:
          'friend, water: danh từ. drink, eat: động từ. beautiful, red: tính từ. really, quickly: trạng từ (-ly).',
        uses: ['parts-of-speech', 'word-suffixes'],
      },
      speak: [
        { id: 'f07-say-1', text: 'I really like it.', vi: 'Tôi rất thích nó.' },
        { id: 'f07-say-2', text: 'a beautiful girl', vi: 'một cô gái đẹp' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f07-rule-1',
      brickId: 'F07',
      cloze: 'I ___ like it. (rất)',
      answer: 'really',
      vi: '“Rất” đứng trước động từ thì dùng really: I really like it. very đứng trước tính từ (very beautiful), không nói “I very like”.',
    },
    {
      id: 'f07-rule-2',
      brickId: 'F07',
      cloze: 'a ___ girl (beauty)',
      answer: 'beautiful',
      vi: 'Tả danh từ cần tính từ: beauty (danh từ) → beautiful (tính từ, đuôi -ful).',
    },
  ],
  themeWordIds: ['ngsl-beautiful', 'ngsl-information', 'ngsl-really', 'ngsl-quickly', 'ngsl-work'],
}
