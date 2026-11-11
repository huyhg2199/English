import type { Brick } from '../types'

/**
 * F17 · Thì là gì (hàng D). Tự soạn; dạy `tenses-overview`, `verb-forms`. Chỉ cần nhận ra 4 dạng go / goes / going /
 * went thuộc vùng thời gian nào (Quá khứ · Bây giờ · Thói quen), còn gone đứng riêng: luôn đi với have / has, nối việc
 * đã xảy ra với bây giờ, không xếp vào Quá khứ (học kỹ ở T3). Không bắt tự chia. Có chữ “động từ nguyên mẫu” để chip thuật
 * ngữ của bài T1 mở viên này. Câu tiếng Anh chỉ dùng F01–F17: chưa có at, every, trạng từ tần suất.
 */
export const F17_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Tiếng Việt thêm đã, đang, sẽ; tiếng Anh đổi động từ, mỗi cách đổi là một thì. Động từ nguyên mẫu (dạng ' +
        'gốc, không có to): go. Quá khứ: went. Bây giờ: am / is / are going. Thói quen: go, goes (he / she / it). ' +
        'gone đi với have / has: She has gone (cô ấy đã đi, giờ không ở đây). has gone không xếp vào Quá khứ: nó nối ' +
        'việc đã xảy ra với bây giờ, học kỹ ở T3.',
    },
    {
      kind: 'contrast',
      viSays:
        'Tiếng Việt nói “Hôm qua tôi về nhà”, “Tôi đang về nhà”, “Chiều nào tôi cũng về nhà”: chữ “về” không đổi, ' +
        'chỉ thêm “đang” hay chữ chỉ thời gian.',
      enRequires:
        "Tiếng Anh bắt buộc đổi động từ theo thời gian: “I went home.”, “I'm going home.”, “I go home.”. " +
        'Có “yesterday” rồi vẫn phải dùng went.',
      examples: [
        { vi: 'Hôm qua tôi về nhà. (Quá khứ)', en: 'Yesterday I went home.' },
        { vi: 'Tôi đang về nhà. (Bây giờ)', en: "I'm going home." },
        { vi: 'Anh ấy đi làm. (Thói quen, ngày nào cũng vậy)', en: 'He goes to work.' },
        {
          vi: 'Cô ấy đi rồi, giờ không còn ở đây. (have / has + gone: nối việc đã đi với bây giờ, học kỹ ở T3)',
          en: 'She has gone.',
        },
        { vi: '5 dạng của go', en: 'go · goes · going · went · gone', audioText: 'go, goes, going, went, gone' },
        {
          vi: 'Động từ khác cũng đổi dạng như vậy (học dần ở Năm 1)',
          en: 'start · starts · starting',
          audioText: 'start, starts, starting',
        },
      ],
      timeline: { kind: 'progress', label: "I'm going home: đang diễn ra ngay lúc nói" },
    },
    {
      kind: 'worked',
      en: 'I went home.',
      vi: 'Tôi đã về nhà.',
      noteVi: 'went là quá khứ của go. Tiếng Việt thêm “đã”, còn tiếng Anh đổi go thành went, không thêm chữ nào.',
      timeline: { kind: 'past-point', label: 'I went home: việc đã xong trong quá khứ' },
    },
    {
      kind: 'faded',
      en: 'We are ___ to the bank now.',
      answer: 'going',
      vi: 'Bây giờ chúng tôi đang đi tới ngân hàng.',
      hintVi: 'Sau are, việc đang xảy ra lúc này: chọn một trong go / goes / going / went / gone.',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f17-c1',
          kind: 'sort',
          prompt: 'Xếp mỗi câu vào đúng vùng thời gian.',
          groups: [
            { label: 'Quá khứ', items: ['I went to Hue.', 'We went home.'] },
            { label: 'Bây giờ', items: ["We're going home."] },
            { label: 'Thói quen', items: ['He goes to work.', 'They go to school.', 'I come home late.'] },
          ],
          hintVi: 'Nhìn động từ: went, am / is / are + going, hay go / goes.',
          explanationVi:
            'went: Quá khứ (việc đã xong). are going: Bây giờ. go, goes, come (dạng gốc, hoặc thêm -s với he / she / it): ' +
            'Thói quen.',
          uses: ['tenses-overview', 'verb-forms'],
        },
        {
          id: 'f17-c2',
          kind: 'choice',
          prompt: 'Yesterday he ___ to Da Nang.',
          options: ['went', 'goes', 'going'],
          answer: 0,
          hintVi: 'yesterday là chuyện đã qua.',
          explanationVi: 'Có yesterday thì dùng dạng quá khứ went: Yesterday he went to Da Nang.',
          uses: ['tenses-overview', 'verb-forms'],
        },
        {
          id: 'f17-c3',
          kind: 'listen',
          audioText: "I'm going home.",
          prompt: 'Bạn nghe thấy câu nào?',
          options: ["I'm going home.", 'I went home.', 'I go home.'],
          answer: 0,
          hintVi: 'Nghe đuôi -ing.',
          explanationVi: "I'm going home: am + going, việc đang xảy ra bây giờ.",
          uses: ['verb-forms'],
        },
        {
          id: 'f17-c4',
          kind: 'choice',
          prompt: 'Từ nào là động từ nguyên mẫu (dạng gốc trong từ điển)?',
          options: ['live', 'lives', 'living'],
          answer: 0,
          hintVi: 'Dạng chưa thêm gì.',
          explanationVi: 'Động từ nguyên mẫu là dạng gốc, chưa thêm -s hay -ing: live. lives, living là dạng đã đổi.',
          uses: ['verb-forms'],
        },
        {
          id: 'f17-c5',
          kind: 'choice',
          prompt: 'She has ___. (Cô ấy đi rồi.)',
          options: ['gone', 'going', 'go'],
          answer: 0,
          hintVi: 'Dạng nào đi với has?',
          explanationVi: 'gone đi với have / has: She has gone. going đi với am / is / are.',
          uses: ['verb-forms', 'have-has'],
        },
      ],
      easier: [
        {
          id: 'f17-e1',
          kind: 'choice',
          prompt: 'went thuộc vùng thời gian nào?',
          options: ['Quá khứ', 'Bây giờ', 'Thói quen'],
          answer: 0,
          hintVi: 'Yesterday I went home.',
          explanationVi: 'went là quá khứ của go: việc đã xong.',
          uses: ['tenses-overview'],
        },
        {
          id: 'f17-e2',
          kind: 'choice',
          prompt: 'Câu nào nói việc đang xảy ra bây giờ?',
          options: ["I'm going home.", 'I went home.', 'I go home.'],
          answer: 0,
          hintVi: 'am / is / are + dạng -ing.',
          explanationVi: "I'm going home: đang về nhà. I went home là quá khứ, I go home là thói quen.",
          uses: ['tenses-overview'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: xếp 5 dạng của go vào đúng nhóm, rồi nói hai câu: một việc đã xong, một việc đang xảy ra.',
      sampleEn: "I went home. I'm going home.",
      item: {
        id: 'f17-a1',
        kind: 'sort',
        prompt: 'Xếp 5 dạng của go vào đúng nhóm.',
        groups: [
          { label: 'Quá khứ', items: ['went'] },
          { label: 'Bây giờ', items: ['going'] },
          { label: 'Thói quen', items: ['go', 'goes'] },
          { label: 'Đi với have / has (học kỹ ở T3)', items: ['gone'] },
        ],
        hintVi: 'gone đi với have / has, going đi với am / is / are.',
        explanationVi:
          'Quá khứ (việc đã xong): went. Bây giờ: (am / is / are) going. Thói quen: go, goes. gone luôn đi với have / has ' +
          '(She has gone): nó nối việc đã xảy ra với bây giờ, nên không xếp vào Quá khứ.',
        uses: ['tenses-overview', 'verb-forms'],
      },
      speak: [
        { id: 'f17-say-1', text: 'I went home.', vi: 'Tôi đã về nhà.' },
        { id: 'f17-say-2', text: "I'm going home.", vi: 'Tôi đang về nhà.' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f17-rule-1',
      brickId: 'F17',
      cloze: 'Yesterday I ___ home. (go)',
      answer: 'went',
      vi: 'Hôm qua là quá khứ: go đổi thành went.',
    },
    {
      id: 'f17-rule-2',
      brickId: 'F17',
      cloze: 'I am ___ home now. (go)',
      answer: 'going',
      vi: 'Đang xảy ra bây giờ: am / is / are + going.',
    },
  ],
  themeWordIds: ['ngsl-come', 'ngsl-sleep', 'ngsl-live', 'ngsl-start', 'ngsl-finish'],
}
