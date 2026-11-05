import { spellForSpeech } from '../letters'
import type { Brick } from '../types'

/**
 * F02 · Bảng chữ cái & đánh vần (hàng A). Tự soạn; dạy `alphabet`, `spelling-out`.
 * Mọi chuỗi TTS có chữ cái đều qua `spellForSpeech` (iOS đọc sai chữ cái đứng một mình): màn hình hiện "H-U-Y",
 * máy đọc "aitch, you, why".
 */
export const F02_CONTENT: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'> = {
  screens: [
    {
      kind: 'explain',
      textVi:
        'Tiếng Anh có 26 chữ cái, mỗi chữ có một tên riêng, khác cách đọc chữ tiếng Việt. ' +
        'Hai nhóm người Việt hay nhầm: A đọc “ây”, E đọc “i”, I đọc “ai”; G đọc “dzi”, J đọc “dzây”. ' +
        'Khi đánh vần tên, email hay mã số, ta đọc lần lượt tên từng chữ. ' +
        'Trong email, @ đọc là “at”, dấu chấm đọc là “dot”.',
    },
    {
      kind: 'contrast',
      viSays: 'Tiếng Việt đánh vần theo âm: “hờ – uy – huy”. Chữ A đọc “a”, chữ E đọc “e”.',
      enRequires:
        'Tiếng Anh đánh vần bằng tên chữ: H-U-Y đọc “aitch, you, why”. A đọc “ây”, E đọc “i”, I đọc “ai”.',
      examples: [
        { vi: 'Đánh vần tên Huy', en: 'H-U-Y', audioText: spellForSpeech('H-U-Y') },
        { vi: 'Ba chữ hay nhầm: “ây”, “i”, “ai”', en: 'A, E, I', audioText: spellForSpeech('AEI') },
        { vi: 'Hai chữ hay nhầm: “dzi”, “dzây”', en: 'G, J', audioText: spellForSpeech('GJ') },
        { vi: 'Đánh vần mã đặt chỗ: chữ đọc tên chữ, số đọc như số', en: 'VN-27K', audioText: spellForSpeech('VN27K') },
      ],
    },
    {
      kind: 'worked',
      en: 'huy@gmail.com',
      audioText: `${spellForSpeech('huy')}, at gmail dot com`,
      vi: 'Đọc email của Huy',
      noteVi:
        'Tên riêng thì đánh vần từng chữ (aitch, you, why). Gmail và com đọc như một từ. @ là “at”, dấu chấm là “dot”.',
    },
    {
      kind: 'faded',
      en: 'huy ___ gmail dot com',
      answer: 'at',
      vi: 'Đọc email huy@gmail.com',
      hintVi: 'Dấu @ trong email đọc là gì? (giống ví dụ ở màn 3)',
    },
    {
      kind: 'check',
      items: [
        {
          id: 'f02-c1',
          kind: 'listen',
          audioText: spellForSpeech('J-E'),
          prompt: 'Bạn nghe đánh vần chữ nào?',
          options: ['G-I', 'J-E', 'G-E'],
          answer: 1,
          hintVi: '“jay” là chữ J. Chữ E có tên đọc gần như “i”.',
          explanationVi: 'Máy đọc “jay, ee”: J-E. Người Việt hay nhầm E với I và G với J.',
          uses: ['alphabet'],
        },
        {
          id: 'f02-c2',
          kind: 'choice',
          prompt: 'Chữ cái I trong tiếng Anh có tên đọc gần giống âm nào?',
          options: ['ai', 'i', 'ây'],
          answer: 0,
          hintVi: 'Tên chữ I nghe như chữ “eye” (con mắt).',
          explanationVi: 'I đọc “ai”. Còn “i” là tên chữ E, “ây” là tên chữ A.',
          uses: ['alphabet'],
        },
        {
          id: 'f02-c3',
          kind: 'choice',
          prompt: 'Email “lan@yahoo.com” đọc thế nào?',
          options: ['lan at yahoo dot com', 'lan a yahoo chấm com', 'lan at yahoo com'],
          answer: 0,
          hintVi: '@ có tên riêng, dấu chấm cũng vậy.',
          explanationVi: '@ đọc “at”, dấu chấm đọc “dot”: lan at yahoo dot com. Không bỏ “dot”.',
          uses: ['spelling-out'],
        },
        {
          id: 'f02-c4',
          kind: 'order',
          prompt: 'Xếp tên chữ để đánh vần tên “NAM”.',
          tokens: ['en', 'ay', 'em'],
          hintVi: 'N đọc “en”, A đọc “ây”, M đọc “em”.',
          explanationVi: 'NAM = N (en) – A (ay) – M (em). Đánh vần theo đúng thứ tự chữ viết.',
          uses: ['alphabet', 'spelling-out'],
        },
      ],
      easier: [
        {
          id: 'f02-e1',
          kind: 'choice',
          prompt: 'Chữ A trong tiếng Anh có tên đọc là gì?',
          options: ['ây', 'a', 'e'],
          answer: 0,
          hintVi: 'Giống chữ đầu của “ABC” trong bài hát bảng chữ cái.',
          explanationVi: 'A đọc “ây” (ay), không đọc “a” như tiếng Việt.',
          uses: ['alphabet'],
        },
        {
          id: 'f02-e2',
          kind: 'choice',
          prompt: 'Trong tiếng Anh, dấu @ trong email đọc là gì?',
          options: ['at', 'a còng', 'dot'],
          answer: 0,
          hintVi: 'Nhớ lại huy@gmail.com.',
          explanationVi: '@ đọc “at”. “dot” là dấu chấm.',
          uses: ['spelling-out'],
        },
      ],
    },
    {
      kind: 'apply',
      promptVi:
        'Áp dụng: đánh vần tên Huy, rồi tự đánh vần tên của bạn thành tiếng, từng chữ một. ' +
        'Nghe mẫu H-U-Y, chọn cách đọc đúng, rồi nói theo 2 cụm từ dưới đây.',
      sampleEn: 'H-U-Y',
      sampleAudioText: spellForSpeech('H-U-Y'),
      item: {
        id: 'f02-a1',
        kind: 'choice',
        prompt: 'Đánh vần tên HUY bằng tên chữ:',
        options: ['aitch, you, why', 'hờ, u, y', 'ây, you, why'],
        answer: 0,
        hintVi: 'H có tên “aitch”, Y có tên “why”.',
        explanationVi: 'H-U-Y = aitch, you, why. Đánh vần tiếng Anh dùng tên chữ, không dùng âm tiếng Việt.',
        uses: ['alphabet', 'spelling-out'],
      },
      speak: [
        { id: 'f02-say-1', text: 'first name', vi: 'tên (gọi)' },
        { id: 'f02-say-2', text: 'email address', vi: 'địa chỉ email' },
      ],
    },
  ],
  ruleCards: [
    {
      id: 'f02-rule-1',
      brickId: 'F02',
      cloze: 'huy ___ gmail dot com',
      answer: 'at',
      vi: 'Dấu @ trong email đọc là “at”, dấu chấm đọc là “dot”.',
    },
    {
      id: 'f02-rule-2',
      brickId: 'F02',
      cloze: 'W = ___ you',
      answer: 'double',
      vi: 'Chữ W có tên là “double you”.',
    },
  ],
  themeWordIds: ['ngsl-name', 'ngsl-letter', 'ngsl-email', 'ngsl-address', 'ngsl-spell'],
}
