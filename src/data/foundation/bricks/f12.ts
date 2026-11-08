import type { Brick } from '../types'

/**
 * F12 · this/that + 's (hàng B). Tự soạn; dạy `demonstratives`, `possessive-s`. Phủ dạng this, these, that, those của
 * cổng hư từ F12.
 */
export const F12_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'this chỉ vật ở gần, số ít: this pen. these là số nhiều của this: these pens. ' +
        'that chỉ vật ở xa, số ít: that car; those là số nhiều của that: those cars. Tránh “this books”. ' +
        "Muốn nói vật của ai, thêm 's vào sau tên người rồi đặt trước vật: Huy's phone. " +
        "Thứ tự ngược tiếng Việt: “điện thoại của Huy” là Huy's phone, không nói “phone of Huy”.",
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “điện thoại của Huy”, “mấy quyển sách này”: chủ nhân đứng sau, chữ “này” không đổi theo số lượng.',
      enRequires:
        "Tiếng Anh đưa chủ nhân lên trước và thêm 's: “Huy's phone”. this/that đổi theo số lượng: this book, these books. " +
        "'s dùng cho người, con vật; với đồ vật, nội dung thì vẫn dùng of: a picture of the sea.",
      examples: [
        { vi: 'cây bút này (gần, một)', en: 'this pen' },
        { vi: 'mấy cây bút này (gần, nhiều)', en: 'these pens' },
        { vi: 'ngôi nhà kia (xa, một)', en: 'that house' },
        { vi: 'mấy ngôi nhà kia (xa, nhiều)', en: 'those houses' },
        { vi: 'điện thoại của Huy', en: "Huy's phone" },
      ],
    },
    {
      kind: 'worked',
      en: "I use Huy's phone.",
      vi: 'Tôi dùng điện thoại của Huy.',
      noteVi: "Huy's đứng trước phone. 's đọc giống đuôi số nhiều: Huy's /z/, Pat's /s/, Alex's /ɪz/.",
    },
    {
      kind: 'faded',
      en: 'I like ___ shoes.',
      answer: 'these',
      vi: 'Tôi thích mấy đôi giày này.',
      hintVi: 'shoes là số nhiều, và đôi giày ở gần (“này”).',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f12-c1',
          kind: 'choice',
          prompt: '___ books (mấy quyển sách này)',
          options: ['these', 'this', 'that'],
          answer: 0,
          hintVi: 'books là số nhiều, ở gần.',
          explanationVi: 'Số nhiều ở gần dùng these: these books. this, that chỉ đi với số ít.',
          uses: ['demonstratives', 'plurals'],
        },
        {
          id: 'f12-c2',
          kind: 'choice',
          prompt: '“con chó của Lan” nói thế nào?',
          options: ["Lan's dog", 'dog of Lan', "dog Lan's"],
          answer: 0,
          hintVi: "Chủ nhân đứng trước, thêm 's.",
          explanationVi: "Tên người + 's đứng trước vật: Lan's dog. Không nói “dog of Lan”.",
          uses: ['possessive-s'],
        },
        {
          id: 'f12-c3',
          kind: 'listen',
          audioText: 'Give me those shoes.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['Give me those shoes.', 'Give me this shoes.', 'Give me these shoe.'],
          answer: 0,
          hintVi: 'Nghe từ đứng trước shoes, và đuôi của shoes.',
          explanationVi: 'those (xa, nhiều) + shoes (số nhiều): Give me those shoes.',
          uses: ['demonstratives', 'plurals'],
        },
        {
          id: 'f12-c4',
          kind: 'choice',
          prompt: '___ picture (bức tranh kia, ở xa)',
          options: ['that', 'this', 'those'],
          answer: 0,
          hintVi: 'Một bức tranh, ở xa.',
          explanationVi: 'Số ít ở xa dùng that: that picture. those là số nhiều.',
          uses: ['demonstratives'],
        },
        {
          id: 'f12-c5',
          kind: 'order',
          prompt: 'Xếp thành câu “Tôi thích con mèo của Mai”.',
          tokens: ['I', 'like', "Mai's", 'cat'],
          hintVi: "Chủ ngữ – động từ – vật của ai (Mai's đứng trước cat).",
          explanationVi: "I – like – Mai's cat. Chủ nhân Mai's đứng trước vật cat, ngược với tiếng Việt.",
          uses: ['possessive-s', 'subject-verb'],
        },
      ],
      easier: [
        {
          id: 'f12-e1',
          kind: 'choice',
          prompt: 'this đi với cụm nào?',
          options: ['this pen', 'this pens', 'this shoes'],
          answer: 0,
          hintVi: 'this chỉ đi với số ít.',
          explanationVi: 'this + số ít: this pen. Số nhiều thì dùng these: these pens.',
          uses: ['demonstratives'],
        },
        {
          id: 'f12-e2',
          kind: 'choice',
          prompt: 'Từ nào chỉ vật ở xa, số nhiều?',
          options: ['those', 'these', 'this'],
          answer: 0,
          hintVi: 'that (xa, một) có số nhiều là…',
          explanationVi: 'that → those (xa). this → these (gần).',
          uses: ['demonstratives'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: chỉ đồ quanh bạn và nói của ai. Chọn câu đúng, rồi nói theo 3 mẫu, ' +
        'thay bằng đồ thật và tên người nhà của bạn.',
      sampleEn: "I like this pen. Give me those shoes. I use Huy's phone.",
      item: {
        id: 'f12-a1',
        kind: 'choice',
        prompt: 'Bạn chỉ mấy đôi giày ở xa và nhờ người khác đưa giúp:',
        options: ['Give me those shoes.', 'Give me that shoes.', 'Give me these shoe.'],
        answer: 0,
        hintVi: 'Ở xa và số nhiều.',
        explanationVi: 'Ở xa, số nhiều dùng those: Give me those shoes.',
        uses: ['demonstratives', 'plurals'],
      },
      speak: [
        { id: 'f12-say-1', text: 'I like this pen.', vi: 'Tôi thích cây bút này.' },
        { id: 'f12-say-2', text: 'Give me those shoes.', vi: 'Đưa tôi mấy đôi giày kia.' },
        { id: 'f12-say-3', text: "I use Huy's phone.", vi: 'Tôi dùng điện thoại của Huy.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f12-rule-1',
      brickId: 'F12',
      cloze: 'I like ___ books. (này)',
      answer: 'these',
      vi: 'Số nhiều ở gần dùng these: these books. Không nói “this books”.',
    },
    {
      id: 'f12-rule-2',
      brickId: 'F12',
      cloze: "I use ___ phone. (của Huy)",
      answer: "Huy's",
      vi: "Của ai thì thêm 's sau tên và đặt trước vật: Huy's phone.",
    },
  ],
  themeWordIds: ['ngsl-picture', 'ngsl-house', 'ngsl-dog', 'ngsl-cat', 'ngsl-shoe'],
}
