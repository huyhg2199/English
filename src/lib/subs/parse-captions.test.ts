import { describe, expect, it } from 'vitest'

import {
  canStoreTranscript,
  CC_BY_LICENSE_URL,
  captionTracksFromWatchHtml,
  cleanText,
  normalizeCues,
  parseJson3,
  parseTimestamp,
  parseVttOrSrt,
  pickCaptionTrack,
  pickLocalCaption,
  stripRollingOverlap,
  TRANSLATION_CREDIT,
  transcriptSource,
  VOA_LICENSE,
} from '../../../scripts/subs/parse.mjs'

describe('transcriptSource (video nào được lưu transcript)', () => {
  const voa = { id: 'WR9_nsLyaEY', channel: 'VOA Learning English', license: 'public-domain' }
  const ccBy = {
    id: 'n71cJHjH0_w',
    channel: 'GrammarBank',
    channelUrl: 'https://www.youtube.com/channel/UCosy24EI2IywQza8MwfpVcw',
    license: 'cc-by',
  }
  it('VOA public domain: nguồn "public domain – VOA"', () => {
    expect(transcriptSource(voa, 'uploaded')).toEqual({
      channel: 'VOA Learning English',
      url: 'https://www.youtube.com/watch?v=WR9_nsLyaEY',
      license: VOA_LICENSE,
      captionKind: 'uploaded',
    })
  })

  it('CC BY: ghi kênh + link kênh, link video, giấy phép CC BY 3.0 + link, ghi chú bản dịch Lumos', () => {
    expect(transcriptSource(ccBy, 'uploaded')).toEqual({
      channel: 'GrammarBank',
      channelUrl: ccBy.channelUrl,
      url: 'https://www.youtube.com/watch?v=n71cJHjH0_w',
      license: 'CC BY 3.0 – GrammarBank',
      licenseUrl: CC_BY_LICENSE_URL,
      translation: TRANSLATION_CREDIT,
      captionKind: 'uploaded',
    })
    expect(TRANSLATION_CREDIT).toBe('Bản dịch tiếng Việt do Lumos thực hiện')
  })

  it('giấy phép chuẩn YouTube, thiếu giấy phép, CC BY thiếu link kênh, kênh khác ghi public-domain → không lưu', () => {
    expect(canStoreTranscript(voa)).toBe(true)
    expect(canStoreTranscript(ccBy)).toBe(true)
    expect(canStoreTranscript({ id: 'x', channel: 'BBC Learning English', license: 'youtube-standard' })).toBe(false)
    expect(canStoreTranscript({ id: 'x', channel: 'TED-Ed' })).toBe(false)
    expect(canStoreTranscript({ ...ccBy, channelUrl: undefined })).toBe(false)
    expect(canStoreTranscript({ ...ccBy, channelUrl: 'https://evil.example/x' })).toBe(false)
    expect(canStoreTranscript({ id: 'x', channel: "Rachel's English", license: 'public-domain' })).toBe(false)
    expect(canStoreTranscript({ ...voa, license: undefined })).toBe(false)
    // Link kênh phải là dạng cố định /channel/UC… (cùng mẫu với test dữ liệu video).
    expect(canStoreTranscript({ ...ccBy, channelUrl: 'https://www.youtube.com/@GrammarBank' })).toBe(false)
  })

  it('CC BY chỉ lưu caption do kênh đăng: caption tự động → null (VOA vẫn được dùng caption tự động)', () => {
    expect(transcriptSource(ccBy, 'asr')).toBeNull()
    expect(transcriptSource(voa, 'asr')?.captionKind).toBe('asr')
  })
})

describe('pickCaptionTrack', () => {
  const up = { languageCode: 'en', baseUrl: 'u1' }
  const asr = { languageCode: 'en', kind: 'asr', baseUrl: 'a1' }
  it('ưu tiên caption do kênh đăng; chỉ dùng tự động khi không có bản đăng', () => {
    expect(pickCaptionTrack([asr, up])).toEqual({ track: up, kind: 'uploaded' })
    expect(pickCaptionTrack([asr, { languageCode: 'vi', baseUrl: 'v' }])).toEqual({ track: asr, kind: 'asr' })
    expect(pickCaptionTrack([{ languageCode: 'en-US', baseUrl: 'u2' }, asr])?.kind).toBe('uploaded')
  })

  it('không có track tiếng Anh → null', () => {
    expect(pickCaptionTrack([{ languageCode: 'es', baseUrl: 'x' }])).toBeNull()
    expect(pickCaptionTrack([])).toBeNull()
  })
})

describe('pickLocalCaption', () => {
  const id = 'WR9_nsLyaEY'
  it('ưu tiên file do kênh đăng; nhận tên mặc định của yt-dlp; json3 > vtt > srt', () => {
    expect(pickLocalCaption(id, [`${id}.asr.vtt`, `${id}.en.srt`, `${id}.en.vtt`])).toEqual({ name: `${id}.en.vtt`, ext: 'vtt', kind: 'uploaded' })
    expect(pickLocalCaption(id, [`Let's Learn English Lesson 1 - Welcome! [${id}].en.vtt`])?.kind).toBe('uploaded')
    expect(pickLocalCaption(id, [`${id}.en-US.vtt`, `${id}.en.srt`])?.name).toBe(`${id}.en.srt`)
    expect(pickLocalCaption(id, [`${id}.en.vtt`], { allowAsr: true })?.kind).toBe('uploaded')
    // Kênh chỉ đăng en-US (vd video CC BY): tên yt-dlp `<id>.en-US.vtt` vẫn là caption do kênh đăng.
    expect(pickLocalCaption(id, [`${id}.en-US.vtt`])).toEqual({ name: `${id}.en-US.vtt`, ext: 'vtt', kind: 'uploaded' })
    // yt-dlp ghi caption tự động bản gốc là `<id>.en-orig.vtt`: là caption tự động, không phải bản do kênh đăng.
    expect(pickLocalCaption(id, [`${id}.en-orig.vtt`])).toBeNull()
    expect(pickLocalCaption(id, [`${id}.en-orig.vtt`], { allowAsr: true })?.kind).toBe('asr')
  })

  it('file tự động (.asr.*) chỉ dùng khi có allowAsr và không có bản đăng; file của video khác bị bỏ', () => {
    expect(pickLocalCaption(id, [`${id}.asr.vtt`])).toBeNull()
    expect(pickLocalCaption(id, [`${id}.asr.vtt`], { allowAsr: true })).toEqual({ name: `${id}.asr.vtt`, ext: 'vtt', kind: 'asr' })
    expect(pickLocalCaption(id, ['other.en.vtt', `x${id}.en.vtt`, `${id}.vi.vtt`, `${id}.en.txt`])).toBeNull()
  })
})

describe('parse caption', () => {
  it('json3: mốc từ tStartMs/dDurationMs, ghép segs, bỏ sự kiện rỗng', () => {
    const json = { events: [{ tStartMs: 1200, dDurationMs: 2000, segs: [{ utf8: 'Hello, ' }, { utf8: 'Anna.' }] }, { tStartMs: 3000 }, { tStartMs: 4000, dDurationMs: 1000, segs: [{ utf8: '\n' }] }] }
    expect(parseJson3(json)).toEqual([{ start: 1.2, end: 3.2, en: 'Hello, Anna.' }])
    expect(parseJson3({ events: [null, 5, { tStartMs: 0, dDurationMs: 500, segs: [{ utf8: 'Hi.' }] }] })).toEqual([{ start: 0, end: 0.5, en: 'Hi.' }])
  })

  it('WebVTT và SRT', () => {
    const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:03.500 align:start\n<c>Hi</c> there!\n\n00:04.000 --> 00:05.000\n[MUSIC]\n'
    expect(parseVttOrSrt(vtt)).toEqual([{ start: 1, end: 3.5, en: 'Hi there!' }])
    const srt = '1\r\n00:00:01,200 --> 00:00:02,000\r\nI&#39;m Anna.\r\n\r\n2\r\n00:00:02,500 --> 00:00:04,000\r\n&gt;&gt; Welcome!'
    expect(parseVttOrSrt(srt)).toEqual([
      { start: 1.2, end: 2, en: "I'm Anna." },
      { start: 2.5, end: 4, en: 'Welcome!' },
    ])
    expect(parseTimestamp('1:02:03.4')).toBe(3723.4)
    expect(parseTimestamp('x')).toBeNaN()
  })

  it('cleanText: thẻ, entity, nháy cong, khoảng trắng', () => {
    expect(cleanText('<i>It&amp;s</i>  “fine”  ’ok’')).toBe('It&s "fine" \'ok\'')
    expect(cleanText('a &#1114112; &#x110000; b &#65;')).toBe('a &#1114112; &#x110000; b A')
    // Caption tải từ YouTube đôi khi mã hoá entity hai lần.
    expect(cleanText('for&nbsp; Tom&amp;nbsp;&amp;nbsp;is')).toBe('for Tom is')
    // Thẻ bị mã hoá (`&lt;i&gt;`) cũng bị bỏ sau khi giải mã; dấu < > trong câu thường vẫn giữ.
    expect(cleanText('&lt;i&gt;Hello&lt;/i&gt; &amp;lt;font color=&quot;red&quot;&amp;gt;there&amp;lt;/font&amp;gt;')).toBe('Hello there')
    expect(cleanText('3 &lt; 5')).toBe('3 < 5')
  })
})

describe('normalizeCues', () => {
  it('sắp xếp, cắt chồng nhau, gộp mảnh thành câu, giữ mốc thật', () => {
    const out = normalizeCues([
      { start: 5, end: 7, en: 'I live in' },
      { start: 1, end: 3.2, en: 'Hello.' },
      { start: 3, end: 4.5, en: 'My name is Anna.' },
      { start: 6.8, end: 8, en: 'Washington.' },
    ])
    expect(out).toEqual([
      { start: 1, end: 3, en: 'Hello.' },
      { start: 3, end: 4.5, en: 'My name is Anna.' },
      { start: 5, end: 8, en: 'I live in Washington.' },
    ])
    for (let i = 1; i < out.length; i++) expect(out[i].start).toBeGreaterThanOrEqual(out[i - 1].end)
  })

  it('bỏ dòng lặp của caption cuộn; không gộp qua khoảng lặng dài', () => {
    expect(
      normalizeCues([
        { start: 1, end: 2, en: 'so we' },
        { start: 2, end: 3, en: 'so we' },
        { start: 6, end: 7, en: 'went home.' },
      ]),
    ).toEqual([
      { start: 1, end: 3, en: 'so we' },
      { start: 6, end: 7, en: 'went home.' },
    ])
  })
})

describe('caption tự động kiểu cuộn', () => {
  it('stripRollingOverlap bỏ đầu câu trùng đuôi câu trước (≥ 2 từ)', () => {
    expect(stripRollingOverlap('so we went', 'we went home.')).toBe('home.')
    expect(stripRollingOverlap('I like the', 'the park.')).toBe('the park.')
    expect(stripRollingOverlap('Hello there', 'Hello there')).toBe('')
  })

  it('normalizeCues: không lặp cụm; cue cùng start được nối chữ thay vì bị cắt mất', () => {
    expect(
      normalizeCues([
        { start: 1, end: 3, en: 'so we went' },
        { start: 2.5, end: 4, en: 'we went home.' },
      ]),
    ).toEqual([{ start: 1, end: 4, en: 'so we went home.' }])
    expect(
      normalizeCues([
        { start: 1, end: 3, en: 'Anna:' },
        { start: 1, end: 3, en: 'Hi, Pete.' },
      ]),
    ).toEqual([{ start: 1, end: 3, en: 'Anna: Hi, Pete.' }])
  })
})

describe('captionTracksFromWatchHtml', () => {
  it('đọc mảng captionTracks (kể cả chuỗi có ngoặc); không có → []', () => {
    const html = 'var x = {"captions":{"captionTracks":[{"baseUrl":"https://y/t?a=1","name":{"simpleText":"English [CC]"},"languageCode":"en"}],"audio":1}}'
    expect(captionTracksFromWatchHtml(html)).toEqual([{ baseUrl: 'https://y/t?a=1', name: { simpleText: 'English [CC]' }, languageCode: 'en' }])
    expect(captionTracksFromWatchHtml('<html></html>')).toEqual([])
  })
})
