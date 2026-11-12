import type { Brick } from '../types'

/**
 * F10 · Số ít, số nhiều (hàng B). Tự soạn; dạy `plurals`, `plural-s-sounds`, `irregular-plurals`. Ví dụ có "→" dùng
 * `audioText` để máy đọc từ thật ("box → boxes" đọc "box, boxes").
 */
export const F10_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Danh từ số nhiều thêm -s: two books; sau s, x, ch, sh viết -es: boxes; phụ âm + y thành -ies: ' +
        'cities. Đuôi đọc 3 cách: /s/ xì nhẹ sau k, t, p, f (books); /z/ ngân nhẹ sau nguyên âm và âm rung như b, ' +
        'd, g, v, l, m, n, r (pens, dogs, girls, rooms, cars); /ɪz/ thêm âm tiết sau s, x, ch, sh, ge (boxes). Vài ' +
        'từ đổi hẳn: man men, child children, person people.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt nói “hai quyển sách”: chữ “sách” giữ nguyên, có số “hai” là đủ.',
      enRequires:
        'Tiếng Anh bắt buộc đổi danh từ: “two books”, không nói “two book”. Từ hai trở lên phải có đuôi số nhiều, và đọc rõ âm cuối đó.',
      examples: [
        { vi: 'hai quyển sách (đuôi đọc /s/)', en: 'book → books', audioText: 'book, books' },
        { vi: 'ba cây bút (đuôi đọc /z/)', en: 'pen → pens', audioText: 'pen, pens' },
        { vi: 'bốn cái hộp (đuôi đọc /ɪz/, thêm một âm tiết)', en: 'box → boxes', audioText: 'box, boxes' },
        { vi: 'hai người đàn ông', en: 'man → men', audioText: 'man, men' },
        { vi: 'ba người', en: 'person → people', audioText: 'person, people' },
      ],
    },
    {
      kind: 'worked',
      en: 'two pens, three books, four boxes',
      vi: 'hai cây bút, ba quyển sách, bốn cái hộp',
      noteVi: 'pens đọc /z/, books đọc /s/, boxes đọc /ɪz/ (box-iz, hai âm tiết). Đừng nuốt âm cuối: mất đuôi là thành số ít.',
    },
    {
      kind: 'faded',
      en: 'three ___',
      answer: 'women',
      vi: 'ba người phụ nữ',
      hintVi: 'woman đổi hẳn, giống man → men.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f10-c1',
          kind: 'listen',
          audioText: 'boxes',
          prompt: 'Đuôi số nhiều của từ bạn nghe đọc thế nào?',
          options: ['/ɪz/, thêm một âm tiết', '/s/', '/z/'],
          answer: 0,
          hintVi: 'Đếm số âm tiết: box hay box-iz?',
          explanationVi: 'boxes /ˈbɑːksɪz/: sau x thêm -es, đọc /ɪz/ nên thành hai âm tiết box-iz.',
          uses: ['plural-s-sounds'],
        },
        {
          id: 'f10-c2',
          kind: 'sort',
          prompt: 'Xếp theo cách đọc đuôi số nhiều.',
          groups: [
            { label: '/s/', items: ['books', 'cats'] },
            { label: '/z/', items: ['pens', 'dogs'] },
            { label: '/ɪz/', items: ['boxes', 'watches'] },
          ],
          hintVi: 'Sau âm xì s, x, ch, sh, ge đọc /ɪz/. Sau k, t đọc /s/ xì nhẹ. Sau n, g, l, m, r đọc /z/ ngân nhẹ.',
          explanationVi: 'books, cats: /s/. pens, dogs: /z/. boxes, watches: /ɪz/ (thêm một âm tiết).',
          uses: ['plural-s-sounds', 'final-sounds'],
        },
        {
          id: 'f10-c3',
          kind: 'choice',
          prompt: 'Chọn dạng đúng: three ___ (ba thành phố)',
          options: ['cities', 'citys', 'city'],
          answer: 0,
          hintVi: 'city kết thúc bằng phụ âm t + y.',
          explanationVi: 'Phụ âm + y thì đổi y thành -ies: city → cities.',
          uses: ['plurals'],
        },
        {
          id: 'f10-c4',
          kind: 'choice',
          prompt: 'two ___ (hai người đàn ông)',
          options: ['men', 'mans', 'man'],
          answer: 0,
          hintVi: 'man là từ đổi hẳn, không thêm -s.',
          explanationVi: 'man → men (bất quy tắc), giống woman → women.',
          uses: ['irregular-plurals', 'numbers'],
        },
        {
          id: 'f10-c5',
          kind: 'choice',
          prompt: 'Câu nào đúng cho “Tôi cần hai cây bút”?',
          options: ['I need two pens.', 'I need two pen.', 'I need a two pens.'],
          answer: 0,
          hintVi: 'Có “two” thì danh từ phải ở số nhiều. pen kết thúc bằng n.',
          explanationVi: 'Từ hai trở lên thì thêm -s: two pens. Đã có số two thì không thêm a.',
          uses: ['plurals', 'numbers'],
        },
      ],
      easier: [
        {
          id: 'f10-e1',
          kind: 'choice',
          prompt: 'Số nhiều của book là gì?',
          options: ['books', 'bookes', 'book'],
          answer: 0,
          hintVi: 'Hầu hết danh từ chỉ thêm -s.',
          explanationVi: 'book → books: thêm -s. Chỉ viết -es sau s, x, ch, sh.',
          uses: ['plurals'],
        },
        {
          id: 'f10-e2',
          kind: 'choice',
          prompt: 'Số nhiều của child (đứa trẻ) là gì?',
          options: ['children', 'childs', 'childes'],
          answer: 0,
          hintVi: 'child là từ đổi hẳn.',
          explanationVi: 'child → children (bất quy tắc), không thêm -s.',
          uses: ['irregular-plurals'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: đếm đồ trên bàn của bạn và nói to, đọc rõ đuôi /s/, /z/, /ɪz/. Nghe và chọn đúng, ' +
        'rồi nói theo mẫu với số đồ thật trên bàn bạn.',
      sampleEn: 'two pens, three books, four boxes',
      item: {
        id: 'f10-a1',
        kind: 'listen',
        audioText: 'four boxes',
        prompt: 'Bạn nghe thấy gì?',
        options: ['four boxes', 'four box', 'four books'],
        answer: 0,
        hintVi: 'Nghe phần cuối: có thêm âm tiết /ɪz/ không?',
        explanationVi: 'four boxes: đuôi /ɪz/ nghe rõ thành âm tiết thứ hai, box-iz.',
        uses: ['plural-s-sounds', 'numbers'],
      },
      speak: [
        { id: 'f10-say-1', text: 'two pens, three books, four boxes', vi: 'hai cây bút, ba quyển sách, bốn cái hộp' },
        { id: 'f10-say-2', text: 'five women and two children', vi: 'năm người phụ nữ và hai đứa trẻ' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f10-rule-1',
      brickId: 'F10',
      cloze: 'two ___ (child)',
      answer: 'children',
      vi: 'Số nhiều bất quy tắc: child → children, man → men, person → people.',
    },
    {
      id: 'f10-rule-2',
      brickId: 'F10',
      cloze: 'four ___ (box)',
      answer: 'boxes',
      vi: 'Sau s, x, ch, sh viết -es, đọc /ɪz/: boxes, watches. Từ tận cùng -ge, -ce, -se chỉ thêm -s nhưng cũng đọc /ɪz/: oranges, houses.',
    },
  ],
  themeWordIds: ['ngsl-man', 'ngsl-woman', 'ngsl-people', 'ngsl-person', 'ngsl-box'],
}
