import { describe, expect, it } from 'vitest'

import { buildMessage, parseStatus, redact, shouldSend, slotFor, vnDayKey } from '../../scripts/owl-post/decide.mjs'
import { parseArgs, runOwlPost } from '../../scripts/owl-post/send.mjs'

const status = (date: string, studied: boolean, streak = 3) =>
  JSON.stringify({ date, studied, kind: studied ? 'full' : null, streak, updatedAt: '2026-11-02T10:00:00.000Z' })

describe('Owl Post: quyết định gửi', () => {
  it('ngày theo giờ VN (UTC+7)', () => {
    expect(vnDayKey(new Date('2026-11-02T16:59:00Z'))).toBe('2026-11-02')
    expect(vnDayKey(new Date('2026-11-02T17:00:00Z'))).toBe('2026-11-03')
  })

  it('cron 21:30 VN, chưa học (date khác hôm nay hoặc studied false) → gửi', () => {
    const now = new Date('2026-11-02T14:30:00Z')
    expect(shouldSend(parseStatus(status('2026-11-01', true)), now)).toMatchObject({ send: true, reason: 'not-today' })
    expect(shouldSend(parseStatus(status('2026-11-02', false)), now)).toMatchObject({ send: true, reason: 'not-studied' })
  })

  it('đã học hôm nay → không gửi', () => {
    expect(shouldSend(parseStatus(status('2026-11-02', true)), new Date('2026-11-02T05:00:00Z'))).toMatchObject({
      send: false,
      reason: 'studied',
    })
  })

  it('học lúc 23:30 VN: status ngày VN đó vẫn tính đã học; sang 00:30 VN hôm sau thì là ngày mới', () => {
    const s = parseStatus(status('2026-11-02', true))
    expect(shouldSend(s, new Date('2026-11-02T16:30:00Z')).send).toBe(false)
    expect(shouldSend(s, new Date('2026-11-02T17:30:00Z')).send).toBe(true)
  })

  it('không có status / sai dạng → không gửi', () => {
    expect(parseStatus('{oops')).toBeNull()
    expect(parseStatus(JSON.stringify({ date: '2026-11-02' }))).toBeNull()
    expect(parseStatus('[]')).toBeNull()
    expect(shouldSend(null, new Date())).toMatchObject({ send: false, reason: 'no-status' })
  })

  it('tin tiếng Việt, ngắn, theo khung giờ, có link app và gợi ý 10 phút', () => {
    const noon = new Date('2026-11-02T05:00:00Z')
    expect(slotFor(noon)).toBe('noon')
    expect(slotFor(new Date('2026-11-02T08:30:00Z'))).toBe('afternoon')
    expect(slotFor(new Date('2026-11-02T14:30:00Z'))).toBe('night')
    const msg = buildMessage(parseStatus(status('2026-11-01', true, 5)), noon, 'https://x.github.io/English/')
    expect(msg).toContain('Hôm nay lười? 10 phút thôi')
    expect(msg).toContain('https://x.github.io/English/')
    expect(msg).toContain('Chuỗi 5 ngày')
    expect(msg.length).toBeLessThan(400)
    expect(buildMessage(null, noon, 'u')).not.toContain('Chuỗi')
  })

  it('chỉ nhắc streak khi status là của hôm qua (VN) hoặc hôm nay; cũ hơn thì chuỗi đã đứt', () => {
    const noon = new Date('2026-11-02T05:00:00Z')
    expect(buildMessage(parseStatus(status('2026-11-02', false, 4)), noon, 'u')).toContain('Chuỗi 4 ngày')
    expect(buildMessage(parseStatus(status('2026-10-31', true, 5)), noon, 'u')).not.toContain('Chuỗi')
    // 00:30 VN ngày 03 (17:30Z ngày 02): status ngày 02 là hôm qua.
    expect(buildMessage(parseStatus(status('2026-11-02', true, 6)), new Date('2026-11-02T17:30:00Z'), 'u')).toContain('Chuỗi 6 ngày')
  })

  it('redact xoá secret khỏi log', () => {
    expect(redact('https://api.telegram.org/bot123456:ABC/sendMessage', ['123456:ABC', undefined, ''])).toBe(
      'https://api.telegram.org/bot***/sendMessage',
    )
  })
})

describe('Owl Post: một lượt chạy (fetch giả)', () => {
  const env = {
    GIST_ID: 'abcdef0123456789abcd',
    GIST_TOKEN: 'ghp_secretGistToken',
    TELEGRAM_BOT_TOKEN: '999:botSecret',
    TELEGRAM_CHAT_ID: '424242',
    APP_URL: 'https://huyhg2199.github.io/English/',
  }
  const now = new Date('2026-11-02T14:30:00Z')

  function fakeFetch(gist: { status: number; body?: unknown } | 'network', telegram = 200) {
    const calls: { url: string; init?: RequestInit }[] = []
    const fetch = async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      if (url.startsWith('https://api.github.com/')) {
        if (gist === 'network') throw new Error(`fetch failed ${url}`)
        return new Response(JSON.stringify(gist.body ?? {}), { status: gist.status })
      }
      return new Response('{}', { status: telegram })
    }
    return { fetch, calls }
  }
  const gistWith = (text: string) => ({ status: 200, body: { files: { 'status.json': { content: text } } } })

  function run(fetch: (url: string, init?: RequestInit) => Promise<Response>, extra: Partial<Parameters<typeof runOwlPost>[0]> = {}) {
    const logs: string[] = []
    return runOwlPost({ env, fetch, now, log: (l) => logs.push(l), ...extra }).then((r) => ({ ...r, logs }))
  }

  it('chưa học → đọc Gist bằng Bearer rồi gửi Telegram đúng chat', async () => {
    const f = fakeFetch(gistWith(status('2026-11-01', true)))
    const r = await run(f.fetch)
    expect(r).toMatchObject({ code: 0, sent: true })
    expect((f.calls[0].init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${env.GIST_TOKEN}`)
    expect(f.calls[1].url).toBe(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`)
    const body = JSON.parse(String(f.calls[1].init?.body))
    expect(body.chat_id).toBe(env.TELEGRAM_CHAT_ID)
    expect(body.text).toContain(env.APP_URL)
  })

  it('đã học → không gọi Telegram', async () => {
    const f = fakeFetch(gistWith(status('2026-11-02', true)))
    const r = await run(f.fetch)
    expect(r).toMatchObject({ code: 0, sent: false, reason: 'studied' })
    expect(f.calls).toHaveLength(1)
  })

  it.each([
    ['404 (gist bị xoá)', { status: 404 }, 1, '::error::'],
    ['401 (PAT hết hạn)', { status: 401 }, 1, '::error::'],
    ['500', { status: 500 }, 0, '::warning::'],
    ['429', { status: 429 }, 0, '::warning::'],
    ['mạng', 'network' as const, 0, '::warning::'],
    ['thiếu status.json', { status: 200, body: { files: {} } }, 0, '::warning::'],
  ])('Gist lỗi (%s) → không gửi; lỗi lâu dài exit 1, lỗi tạm exit 0; log không lộ secret', async (_, gist, code, prefix) => {
    const f = fakeFetch(gist)
    const r = await run(f.fetch)
    expect(r).toMatchObject({ code, sent: false, reason: 'gist-error' })
    expect(f.calls.every((c) => !c.url.includes('telegram'))).toBe(true)
    expect(r.logs.some((l) => l.startsWith(prefix))).toBe(true)
    const all = r.logs.join('\n')
    for (const secret of Object.values(env).slice(0, 4)) expect(all).not.toContain(secret)
  })

  it('thiếu secret → cảnh báo, không gọi mạng', async () => {
    const f = fakeFetch(gistWith(status('2026-11-01', true)))
    const r = await runOwlPost({ env: {}, fetch: f.fetch, now, log: () => {} })
    expect(r).toMatchObject({ code: 0, sent: false, reason: 'missing-gist-secret' })
    expect(f.calls).toHaveLength(0)
  })

  it('Telegram 401 (token sai) → exit 1 + ::error::; 5xx → cảnh báo, exit 0; log không lộ token bot', async () => {
    const bad = await run(fakeFetch(gistWith(status('2026-11-01', true)), 401).fetch)
    expect(bad).toMatchObject({ code: 1, sent: false, reason: 'telegram-error' })
    expect(bad.logs.some((l) => l.startsWith('::error::'))).toBe(true)
    expect(bad.logs.join('\n')).not.toContain(env.TELEGRAM_BOT_TOKEN)
    const down = await run(fakeFetch(gistWith(status('2026-11-01', true)), 502).fetch)
    expect(down).toMatchObject({ code: 0, sent: false, reason: 'telegram-error' })
    expect(down.logs.join('\n')).not.toContain(env.TELEGRAM_BOT_TOKEN)
  })

  it('--dry-run với status giả: in quyết định và tin, không gọi mạng', async () => {
    const f = fakeFetch('network')
    const r = await run(f.fetch, { dryRun: true, statusText: status('2026-11-01', true) })
    expect(r).toMatchObject({ code: 0, sent: false, reason: 'dry-run' })
    expect(f.calls).toHaveLength(0)
    expect(r.logs.join('\n')).toContain('Quyết định: GỬI')
  })

  it('parseArgs', () => {
    expect(parseArgs(['--dry-run', '--status-json', '{}', '--now', '2026-11-02T14:30:00Z'])).toMatchObject({
      dryRun: true,
      statusText: '{}',
      error: null,
    })
    expect(parseArgs(['--status-json', '{}']).error).not.toBeNull()
    expect(parseArgs(['--now', 'bad']).error).not.toBeNull()
    expect(parseArgs(['--what']).error).not.toBeNull()
  })
})
