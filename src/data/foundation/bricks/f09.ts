import type { Brick } from '../types'

/**
 * F09 · Đại từ I/me/my (hàng B). Tự soạn; dạy `subject-pronouns`, `object-pronouns`, `possessive-adjectives`.
 * Bảng 7 dòng (chủ ngữ · tân ngữ · tính từ sở hữu) nằm ở `contrast.examples`, phủ mọi dạng trong `forms` của 7 cổng hư từ
 * F09 (`FUNCTION_WORD_GATES`): i/me/my, you/your, he/him/his, she/her, it/its, we/us/our, they/them/their.
 */
export const F09_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Đại từ thay cho tên người, vật. Mỗi đại từ có 3 dạng: chủ ngữ đứng trước động từ (I love), tân ngữ đứng sau động từ ' +
        '(love me), tính từ sở hữu đứng trước danh từ (my mother). Tiếng Việt xưng anh, em, chị, cháu tuỳ người nghe; ' +
        'tiếng Anh chỉ có I cho người nói và you cho người nghe, với ai cũng vậy. Tránh “I love she” và “me name”.',
    },
    {
      kind: 'contrast',
      viSays:
        'Tiếng Việt dùng một chữ cho cả ba chỗ: “cô ấy yêu tôi”, “tôi yêu cô ấy”, “mẹ cô ấy”. Xưng hô đổi theo người nghe: anh, em, chị, cháu.',
      enRequires:
        'Tiếng Anh đổi dạng theo chỗ đứng: chủ ngữ · tân ngữ · sở hữu (bảng 7 dòng dưới đây). ' +
        'you dùng cho cả “bạn” lẫn “các bạn”. its (của nó) viết liền, không có dấu nháy. ' +
        'Ghi chú: mine, yours (của tôi, của bạn) đứng một mình, không có danh từ theo sau (my pen → mine); viên này chỉ cần nhận ra.',
      examples: [
        { vi: 'tôi (người nói: anh, em, chị, con… đều là I)', en: 'I · me · my', audioText: 'I, me, my' },
        { vi: 'bạn, các bạn (người nghe: anh, chị, cô, mẹ… đều là you)', en: 'you · you · your', audioText: 'you, you, your' },
        { vi: 'anh ấy', en: 'he · him · his', audioText: 'he, him, his' },
        { vi: 'cô ấy', en: 'she · her · her', audioText: 'she, her, her' },
        { vi: 'nó (vật, con vật)', en: 'it · it · its', audioText: 'it, it, its' },
        { vi: 'chúng tôi, chúng ta', en: 'we · us · our', audioText: 'we, us, our' },
        { vi: 'họ, chúng nó', en: 'they · them · their', audioText: 'they, them, their' },
      ],
    },
    {
      kind: 'worked',
      en: 'My mother loves me.',
      vi: 'Mẹ tôi yêu tôi.',
      noteVi:
        'my đứng trước danh từ mother (sở hữu). me đứng sau động từ loves (tân ngữ). Tiếng Việt dùng cùng một chữ “tôi”, tiếng Anh dùng hai dạng. ' +
        '(loves có thêm -s vì chủ ngữ là một người khác, như he, she; phần này học sau.)',
    },
    {
      kind: 'faded',
      en: 'I call ___ every day.',
      answer: 'her',
      vi: 'Tôi gọi cho cô ấy mỗi ngày.',
      hintVi: 'Sau động từ call dùng dạng tân ngữ của she (dòng thứ 4 trong bảng).',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f09-c1',
          kind: 'choice',
          prompt: 'I love ___. (anh ấy)',
          options: ['him', 'he', 'his'],
          answer: 0,
          hintVi: 'Đứng sau động từ love thì dùng dạng nào?',
          explanationVi: 'Sau động từ dùng tân ngữ: him. he là chủ ngữ (đứng trước động từ), his là sở hữu (đứng trước danh từ).',
          uses: ['object-pronouns'],
        },
        {
          id: 'f09-c2',
          kind: 'choice',
          prompt: 'I call ___ friend every day. (bạn của tôi)',
          options: ['my', 'me', 'I'],
          answer: 0,
          hintVi: 'Đứng trước danh từ friend thì dùng dạng sở hữu.',
          explanationVi: 'Trước danh từ dùng tính từ sở hữu: my friend. Không nói “me friend” hay “I friend”.',
          uses: ['possessive-adjectives'],
        },
        {
          id: 'f09-c3',
          kind: 'listen',
          audioText: 'They call us every day.',
          prompt: 'Bạn nghe thấy câu nào?',
          options: ['They call us every day.', 'They call we every day.', 'Them call us every day.'],
          answer: 0,
          hintVi: 'Nghe kỹ từ đầu câu và từ ngay sau call.',
          explanationVi: 'They là chủ ngữ (đầu câu), us là tân ngữ (sau call): They call us every day.',
          uses: ['subject-pronouns', 'object-pronouns'],
        },
        {
          id: 'f09-c4',
          kind: 'choice',
          prompt: 'Câu nào đúng cho “Chúng tôi yêu họ”?',
          options: ['We love them.', 'Us love they.', 'We love they.'],
          answer: 0,
          hintVi: 'Trước động từ: chủ ngữ. Sau động từ: tân ngữ.',
          explanationVi: 'We (chủ ngữ) – love – them (tân ngữ). they chỉ đứng trước động từ.',
          uses: ['subject-pronouns', 'object-pronouns'],
        },
        {
          id: 'f09-c5',
          kind: 'choice',
          prompt: 'Huy nói với mẹ: “Con yêu mẹ.” Câu tiếng Anh là:',
          options: ['I love you.', 'Son love mother.', 'Me love you.'],
          answer: 0,
          hintVi: 'Người nói luôn là I, người nghe luôn là you.',
          explanationVi: 'Dù xưng con, em, cháu hay gọi mẹ, cô, anh, tiếng Anh vẫn là I (người nói) và you (người nghe): I love you.',
          uses: ['subject-pronouns'],
        },
      ],
      easier: [
        {
          id: 'f09-e1',
          kind: 'choice',
          prompt: 'Dạng tân ngữ (đứng sau động từ) của she là gì?',
          options: ['her', 'he', 'his'],
          answer: 0,
          hintVi: 'Xem dòng “cô ấy” trong bảng.',
          explanationVi: 'she · her · her: tân ngữ của she là her (I love her).',
          uses: ['object-pronouns'],
        },
        {
          id: 'f09-e2',
          kind: 'choice',
          prompt: '“Tôi” đứng đầu câu, trước động từ, là chữ nào?',
          options: ['I', 'me', 'my'],
          answer: 0,
          hintVi: 'Chủ ngữ là cột đầu tiên của bảng.',
          explanationVi: 'Chủ ngữ là I: I love you. me đứng sau động từ, my đứng trước danh từ.',
          uses: ['subject-pronouns'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: nói 3 câu về người thân bằng my, me, her, him. Chọn câu đúng, nói theo mẫu, ' +
        'rồi thay người nhà của bạn vào chỗ sau động từ hoặc sau my (I call my father every day, I love my sister).',
      sampleEn: 'My mother loves me.',
      item: {
        id: 'f09-a1',
        kind: 'choice',
        prompt: 'Câu nào đúng cho “Tôi đưa anh ấy quyển sách của tôi”?',
        options: ['I give him my book.', 'I give he my book.', 'I give him me book.'],
        answer: 0,
        hintVi: 'Sau động từ give: dạng tân ngữ của he. Trước danh từ book: dạng sở hữu.',
        explanationVi: 'him (tân ngữ, sau give) và my (sở hữu, trước book): I give him my book.',
        uses: ['object-pronouns', 'possessive-adjectives'],
      },
      speak: [
        { id: 'f09-say-1', text: 'My mother loves me.', vi: 'Mẹ tôi yêu tôi.' },
        { id: 'f09-say-2', text: 'I call her every day.', vi: 'Tôi gọi cho cô ấy mỗi ngày.' },
        { id: 'f09-say-3', text: 'I tell him everything.', vi: 'Tôi kể cho anh ấy mọi chuyện.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f09-rule-1',
      brickId: 'F09',
      cloze: 'I love ___. (cô ấy)',
      answer: 'her',
      vi: 'Sau động từ dùng tân ngữ: she → her. Không nói “I love she”.',
    },
    {
      id: 'f09-rule-2',
      brickId: 'F09',
      cloze: 'I love ___ mother. (của tôi)',
      answer: 'my',
      vi: 'Trước danh từ dùng tính từ sở hữu: my mother. Không nói “me mother”.',
    },
  ],
  themeWordIds: ['ngsl-friend', 'ngsl-love', 'ngsl-call', 'ngsl-tell', 'ngsl-give'],
}
