#!/usr/bin/env node
// Owl Post (story 13): GitHub Actions cron gọi script này 3 lần/ngày (12:00, 15:30, 21:30 giờ VN).
// Đọc `status.json` từ secret Gist; hôm nay (giờ VN) chưa học thì gửi tin Telegram, đã học thì thôi.
//
// Env (GitHub Secrets): GIST_ID, GIST_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID. APP_URL tuỳ chọn.
// Không bao giờ in secret. Không gửi tin khi đọc Gist lỗi.
// - Lỗi lâu dài (Gist 401/404: PAT hết hạn, gist bị xoá; Telegram 400/401/403/404: token / chat id sai, bot bị chặn):
//   in `::error::` và thoát 1 → run đỏ, GitHub email cho chủ repo để sửa.
// - Lỗi tạm (mạng, 5xx, 429) và thiếu secret: in `::warning::`, thoát 0 (không đỏ liên tục).
//
// Thử tại máy, không gọi mạng:
//   node scripts/owl-post/send.mjs --dry-run --status-json '{"date":"2026-11-01","studied":true,"kind":"full","streak":3}'
//   node scripts/owl-post/send.mjs --dry-run --status path/to/status.json [--now 2026-11-02T14:30:00Z]
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

import { buildMessage, parseStatus, redact, shouldSend } from './decide.mjs'

export const DEFAULT_APP_URL = 'https://huyhg2199.github.io/English/'
const STATUS_FILE = 'status.json'

function warning(log, text) {
  // Cú pháp annotation của GitHub Actions: hiện cảnh báo vàng trên run, không làm fail.
  log(`::warning::${text}`)
}

function failure(log, text) {
  log(`::error::${text}`)
}

/** Gist: PAT hết hạn / sai (401) hoặc gist không còn (404) thì chạy lại cũng vẫn lỗi. */
const GIST_PERSISTENT = new Set([401, 404])
/** Telegram: token sai (401), chat id sai (400/404), bot bị chặn (403). */
const TELEGRAM_PERSISTENT = new Set([400, 401, 403, 404])

/** Đọc `status.json` của gist. Trả về `{ ok: true, text }` hoặc `{ ok: false, reason }` (reason không chứa secret). */
export async function fetchStatus({ fetch, gistId, gistToken }) {
  let res
  try {
    res = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${gistToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'lumos-english-owl-post',
      },
    })
  } catch {
    return { ok: false, reason: 'không gọi được GitHub (mạng)' }
  }
  if (!res.ok) return { ok: false, reason: `GitHub trả HTTP ${res.status}`, persistent: GIST_PERSISTENT.has(res.status) }
  let body
  try {
    body = await res.json()
  } catch {
    return { ok: false, reason: 'GitHub trả nội dung không đọc được' }
  }
  const file = body && body.files && body.files[STATUS_FILE]
  if (!file) return { ok: false, reason: `gist không có ${STATUS_FILE}` }
  if (file.truncated && typeof file.raw_url === 'string') {
    try {
      const raw = await fetch(file.raw_url)
      if (!raw.ok) return { ok: false, reason: `tải ${STATUS_FILE} lỗi HTTP ${raw.status}` }
      return { ok: true, text: await raw.text() }
    } catch {
      return { ok: false, reason: `không tải được ${STATUS_FILE} (mạng)` }
    }
  }
  return typeof file.content === 'string' ? { ok: true, text: file.content } : { ok: false, reason: `${STATUS_FILE} rỗng` }
}

/** Gửi tin qua Bot API. Trả về `{ ok: true }` hoặc `{ ok: false, reason }` (không chứa token). */
export async function sendTelegram({ fetch, botToken, chatId, text }) {
  let res
  try {
    res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    })
  } catch {
    return { ok: false, reason: 'không gọi được Telegram (mạng)' }
  }
  if (!res.ok) return { ok: false, reason: `Telegram trả HTTP ${res.status}`, persistent: TELEGRAM_PERSISTENT.has(res.status) }
  return { ok: true }
}

/**
 * Một lượt Owl Post. Mã thoát 1 khi lỗi lâu dài (Gist 401/404, Telegram 400/401/403/404); lỗi tạm chỉ cảnh báo, thoát 0.
 * `statusText` có (dry-run) thì không đọc Gist; `dryRun` thì không gửi Telegram.
 */
export async function runOwlPost({ env, fetch, now, log, dryRun = false, statusText }) {
  const secrets = [env.GIST_ID, env.GIST_TOKEN, env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID]
  const say = (text) => log(redact(text, secrets))
  const appUrl = env.APP_URL && /^https:\/\//.test(env.APP_URL) ? env.APP_URL : DEFAULT_APP_URL

  let text = statusText
  if (text === undefined) {
    if (dryRun) {
      say('[dry-run] Không có --status / --status-json: coi như không đọc được status.')
      text = null
    } else if (!env.GIST_ID || !env.GIST_TOKEN) {
      warning(say, 'Thiếu secret GIST_ID hoặc GIST_TOKEN: bỏ qua, không gửi tin.')
      return { code: 0, sent: false, reason: 'missing-gist-secret' }
    } else {
      const r = await fetchStatus({ fetch, gistId: env.GIST_ID, gistToken: env.GIST_TOKEN })
      if (!r.ok) {
        const text = `Không đọc được Gist (${r.reason}): không gửi tin để tránh nhắc sai.`
        if (r.persistent) {
          failure(say, `${text} Kiểm tra secret GIST_TOKEN (PAT còn hạn, quyền gist) và GIST_ID (gist còn tồn tại).`)
          return { code: 1, sent: false, reason: 'gist-error' }
        }
        warning(say, text)
        return { code: 0, sent: false, reason: 'gist-error' }
      }
      text = r.text
    }
  }

  const status = text === null ? null : parseStatus(text)
  if (text !== null && !status) say('status.json sai dạng.')
  const decision = shouldSend(status, now)
  say(`Hôm nay (giờ VN): ${decision.today}. Status: ${status ? `${status.date}, studied=${status.studied}` : 'không có'}. Quyết định: ${decision.send ? 'GỬI' : 'không gửi'} (${decision.reason}).`)
  if (!decision.send) {
    if (decision.reason === 'no-status') warning(say, 'Không có status hợp lệ: không gửi tin.')
    return { code: 0, sent: false, reason: decision.reason }
  }

  const message = buildMessage(status, now, appUrl)
  if (dryRun) {
    say('[dry-run] Tin sẽ gửi:')
    say(message)
    return { code: 0, sent: false, reason: 'dry-run' }
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    warning(say, 'Thiếu secret TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID: không gửi được tin.')
    return { code: 0, sent: false, reason: 'missing-telegram-secret' }
  }
  const sent = await sendTelegram({ fetch, botToken: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, text: message })
  if (!sent.ok) {
    if (sent.persistent) {
      failure(say, `Gửi Telegram lỗi (${sent.reason}). Kiểm tra secret TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID và đã bấm Start với bot.`)
      return { code: 1, sent: false, reason: 'telegram-error' }
    }
    warning(say, `Gửi Telegram lỗi (${sent.reason}).`)
    return { code: 0, sent: false, reason: 'telegram-error' }
  }
  say('Đã gửi tin Owl Post.')
  return { code: 0, sent: true, reason: decision.reason }
}

export function parseArgs(argv) {
  const args = { dryRun: false, statusText: undefined, now: undefined, error: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--status-json') args.statusText = argv[++i] ?? ''
    else if (a === '--status') {
      const path = argv[++i]
      try {
        args.statusText = readFileSync(path, 'utf8')
      } catch {
        args.error = `Không đọc được file status: ${path}`
      }
    } else if (a === '--now') {
      const d = new Date(argv[++i] ?? '')
      if (Number.isNaN(d.getTime())) args.error = '--now phải là thời điểm ISO, vd 2026-11-02T14:30:00Z'
      else args.now = d
    } else args.error = `Tham số lạ: ${a}`
  }
  if (args.statusText !== undefined && !args.dryRun) args.error = '--status / --status-json chỉ dùng cùng --dry-run'
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.error) {
    console.error(args.error)
    process.exit(2)
  }
  const dryFetch = () => Promise.reject(new Error('dry-run: không gọi mạng'))
  const result = await runOwlPost({
    env: process.env,
    fetch: args.dryRun ? dryFetch : globalThis.fetch,
    now: args.now ?? new Date(),
    log: (line) => console.log(line),
    dryRun: args.dryRun,
    statusText: args.statusText,
  })
  process.exit(result.code)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    // Không in lỗi gốc (có thể kèm URL chứa token).
    console.log('::warning::Owl Post gặp lỗi không mong đợi; bỏ qua lượt này.')
    process.exit(0)
  })
}
