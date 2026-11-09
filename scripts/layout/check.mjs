// `npm run layout:check [-- --base <ref>] [--skip-diff] [--out <thư mục>]` (story 29).
// Chạy app bản hiện tại (và bản `--base` trong worktree tạm) bằng vite, mở Chrome headless qua CDP (WebSocket có sẵn của Node 22),
// đo bố cục mọi route × 5 bề rộng và so ảnh toàn trang 375px với bản gốc (dung sai 0, so bằng canvas trong Chrome).
// Exit 0 = đạt, 1 = có lỗi bố cục / ảnh lệch, 2 = không chạy được (thiếu Chrome, tham số sai…). Chỉ chạy tay, không nằm trong CI.
import { execFileSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

import {
  CHROME_MISSING_MESSAGE,
  DEEP_LINK,
  findChrome,
  GRID_LANDMARKS,
  HOTKEY_PROBE,
  hotkeyProblems,
  LG_MIN_WIDTH,
  layoutProblems,
  parseCheckArgs,
  RAIL_LANDMARKS,
  ROUTES,
  WIDE_ROUTES,
  WIDTHS,
} from './check-lib.mjs'

const FIXED_NOW = '2026-11-06T02:00:00Z'
const SETTLE_QUIET_MS = 500
const SETTLE_MAX_MS = 10_000
const SCROLL_PROBE_PX = 600
const MOBILE_WIDTH = 375
const SNAPSHOT_WIDTH = 1280

/** Chạy trước mọi script của trang: đồng hồ cố định (vẫn chạy tiếp), Math.random có seed, tắt animation, đếm mutation. */
const INIT_SCRIPT = `(() => {
  const RealDate = Date
  const offset = RealDate.parse(${JSON.stringify(FIXED_NOW)}) - RealDate.now()
  class FixedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(RealDate.now() + offset)
      else super(...args)
    }
    static now() {
      return RealDate.now() + offset
    }
  }
  globalThis.Date = new Proxy(FixedDate, { apply: () => new FixedDate().toString() })

  let seed = 0x2f6e2b1
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  globalThis.__layoutLastMutation = performance.now()
  const install = () => {
    const style = document.createElement('style')
    style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'
    document.documentElement.appendChild(style)
    new MutationObserver(() => {
      globalThis.__layoutLastMutation = performance.now()
    }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true })
  else install()
})()`

/** Chờ trang yên: không mutation trong 500ms (tối đa 10s), font và ảnh đã tải. */
const SETTLE_EXPRESSION = `(async () => {
  await document.fonts.ready
  const start = performance.now()
  for (;;) {
    const now = performance.now()
    const imagesDone = [...document.images].every((img) => img.complete)
    if (imagesDone && now - globalThis.__layoutLastMutation >= ${SETTLE_QUIET_MS}) return 'ok'
    if (now - start >= ${SETTLE_MAX_MS}) return 'timeout'
    await new Promise((r) => setTimeout(r, 50))
  }
})()`

const frames = `new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`

/**
 * Đo bố cục (xem LayoutMetrics trong check-lib.d.mts). `probeScroll`: cuộn 600px để đo TopBar và cột phụ (`[data-split-rail]`)
 * dính. `gridSelector` (story 31): đếm số cột của lưới (số `left` làm tròn khác nhau của con trực tiếp đang hiện).
 */
function measureExpression({ probeScroll, deepLinkSection, railLandmark = null, gridSelector = null }) {
  return `(async () => {
  const label = 'Điều hướng chính'
  const visible = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
  const navs = [...document.querySelectorAll('nav[aria-label="' + label + '"]')]
    .filter(visible)
    .map((n) => { const r = n.getBoundingClientRect(); return { top: r.top, bottom: r.bottom } })
  const main = document.querySelector('main')
  const mr = main.getBoundingClientRect()
  const header = [...document.querySelectorAll('header')].find((h) => h.querySelector('nav[aria-label="' + label + '"]'))
  const topBarVisible = visible(header)
  const topBarHeight = topBarVisible ? header.getBoundingClientRect().height : 0
  const railEls = [...document.querySelectorAll('[data-split-rail]')].filter(visible)
  const landmarkSelector = ${JSON.stringify(railLandmark)}
  const railLandmark = landmarkSelector
    ? { selector: landmarkSelector, visible: [...document.querySelectorAll(landmarkSelector)].some(visible) }
    : null
  const gridSelector = ${JSON.stringify(gridSelector)}
  const gridEl = gridSelector ? document.querySelector(gridSelector) : null
  const grid = gridEl
    ? {
        selector: gridSelector,
        columns: new Set([...gridEl.children].filter(visible).map((c) => Math.round(c.getBoundingClientRect().left))).size,
      }
    : null
  let topBarTopAfterScroll = null
  let rails = null
  if (${probeScroll} && topBarVisible) {
    window.scrollTo(0, ${SCROLL_PROBE_PX})
    await ${frames}
    // Trang quá ngắn để cuộn thì không đo được TopBar / cột phụ dính (null), không coi là đạt.
    if (window.scrollY >= 1) {
      topBarTopAfterScroll = header.getBoundingClientRect().top
      rails = railEls.map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top, height: r.height, containerBottom: el.parentElement.getBoundingClientRect().bottom }
      })
    }
    window.scrollTo(0, 0)
    await ${frames}
  }
  const section = ${deepLinkSection ? `document.getElementById(${JSON.stringify(deepLinkSection)})` : 'null'}
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    navs,
    mainWidth: mr.width,
    mainLeft: mr.left,
    mainPaddingBottom: parseFloat(getComputedStyle(main).paddingBottom),
    topBarVisible,
    topBarHeight,
    topBarTopAfterScroll,
    deepLinkTop: section ? section.getBoundingClientRect().top : null,
    deepLinkScrollMargin: section ? parseFloat(getComputedStyle(section).scrollMarginTop) || 0 : 0,
    deepLinkAtScrollEnd: window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 1,
    deepLinkMissing: ${deepLinkSection ? '!section' : 'false'},
    railCount: railEls.length,
    rails,
    railLandmark,
    grid,
  }
})()`
}

/** Chữ "Màn n/6" của viên gạch đang mở; null nếu không thấy. */
const BRICK_SCREEN_EXPRESSION = `(document.querySelector('main')?.innerText.match(/Màn \\d+\\/\\d+/) ?? [null])[0]`

/** Vị trí (0-based) bước `aria-current="step"` trong stepper buổi học đang hiện; null nếu không thấy. */
const SESSION_STEP_EXPRESSION = `(() => {
  const ol = [...document.querySelectorAll('ol[aria-label="Các phần của buổi"]')].find((el) => el.getClientRects().length > 0)
  if (!ol) return null
  const at = [...ol.children].findIndex((li) => li.matches('[aria-current="step"]') || li.querySelector('[aria-current="step"]'))
  return at < 0 ? null : at
})()`

/** Bấm nút có chữ `text` (JS click); ném lỗi nếu không thấy. */
/**
 * Câu 1 của phần "Luyện tập" trong viên gạch (kể cả khi phần đó đang ẩn): `answering` khi đang hiện câu 1 và mọi lựa chọn
 * còn bấm được; `answered` khi đã có lựa chọn bị khoá hoặc đã sang câu sau (câu 1 bị trả lời rồi bị Enter "Câu tiếp");
 * null nếu không thấy phần luyện tập.
 */
const CHECK_STATE_EXPRESSION = `(() => {
  const section = document.querySelector('main section[aria-label="Luyện tập"]')
  if (!section) return null
  const heading = (section.textContent.match(/Câu \\d+\\/\\d+/) ?? [null])[0]
  if (heading && !heading.startsWith('Câu 1/')) return 'answered'
  const buttons = [...section.querySelectorAll('[role="group"][aria-label="Các lựa chọn"] button')]
  if (buttons.length === 0) return null
  return buttons.some((b) => b.disabled) ? 'answered' : 'answering'
})()`

/** Câu trắc nghiệm (`QuestionCard`) đang hiện: chữ "Câu n/m" và đã chọn chưa (lựa chọn bị khoá). */
const QUESTION_STATE_EXPRESSION = `(() => {
  const main = document.querySelector('main')
  const heading = (main?.innerText.match(/Câu \\d+\\/\\d+/) ?? [null])[0]
  const buttons = main ? [...main.querySelectorAll('[role="group"][aria-label="Các lựa chọn"] button')] : []
  return { heading, answered: buttons.length > 0 && buttons.every((b) => b.disabled) }
})()`

const clickButtonExpression = (text) => `(() => {
  const button = [...document.querySelectorAll('button')].find((b) => b.textContent.includes(${JSON.stringify(text)}) && b.getClientRects().length > 0)
  if (!button) throw new Error('không thấy nút "' + ${JSON.stringify(text)} + '"')
  button.click()
})()`

/** Phím thường cho `Input.dispatchKeyEvent`. */
const KEYS = {
  Enter: { code: 'Enter', keyCode: 13, text: '\r' },
  ArrowLeft: { code: 'ArrowLeft', keyCode: 37 },
  ArrowRight: { code: 'ArrowRight', keyCode: 39 },
  ' ': { code: 'Space', keyCode: 32, text: ' ' },
}

function keyInfo(key) {
  if (KEYS[key]) return KEYS[key]
  if (/^[0-9]$/.test(key)) return { code: `Digit${key}`, keyCode: key.charCodeAt(0), text: key }
  if (/^[a-z]$/i.test(key)) return { code: `Key${key.toUpperCase()}`, keyCode: key.toUpperCase().charCodeAt(0), text: key }
  throw new Error(`Chưa hỗ trợ phím "${key}"`)
}

/**
 * Các trạng thái gõ Telex của một từ có dấu (vd "chào": c, ch, cha, chao, chào kèm phím c h a o f). Chỉ cần đủ cho chữ của
 * probe; chữ không dấu thì gõ thẳng.
 */
const TELEX = { chào: { keys: 'chaof', states: ['c', 'ch', 'cha', 'chao', 'chào'] } }

/** So hai ảnh PNG (base64) bằng canvas: đếm pixel khác, trả ảnh diff (đỏ = khác, nền = ảnh gốc mờ). */
function compareExpression(a, b) {
  return `(async () => {
  const load = (b64) => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('không đọc được ảnh'))
    img.src = 'data:image/png;base64,' + b64
  })
  const [a, b] = await Promise.all([load(${JSON.stringify(a)}), load(${JSON.stringify(b)})])
  const w = Math.max(a.naturalWidth, b.naturalWidth)
  const h = Math.max(a.naturalHeight, b.naturalHeight)
  const pixels = (img) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' })
    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0, 0, w, h).data
  }
  const pa = pixels(a)
  const pb = pixels(b)
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const octx = out.getContext('2d')
  const diff = octx.createImageData(w, h)
  let count = 0
  for (let i = 0; i < pa.length; i += 4) {
    const same = pa[i] === pb[i] && pa[i + 1] === pb[i + 1] && pa[i + 2] === pb[i + 2] && pa[i + 3] === pb[i + 3]
    if (same) {
      diff.data[i] = pa[i] * 0.3
      diff.data[i + 1] = pa[i + 1] * 0.3
      diff.data[i + 2] = pa[i + 2] * 0.3
    } else {
      count++
      diff.data[i] = 255
    }
    diff.data[i + 3] = 255
  }
  octx.putImageData(diff, 0, 0)
  return {
    count,
    sizeA: [a.naturalWidth, a.naturalHeight],
    sizeB: [b.naturalWidth, b.naturalHeight],
    diffPng: count > 0 ? out.toDataURL('image/png').split(',')[1] : null,
  }
})()`
}

// ---------- tiện ích tiến trình ----------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

/** Vite dev server trong tiến trình này, cacheDir riêng để hai bản không đụng nhau. */
async function startVite(root, cacheDir) {
  const { createServer } = await import('vite')
  const port = await freePort()
  const server = await createServer({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    cacheDir,
    logLevel: 'error',
    clearScreen: false,
    server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: null },
  })
  await server.listen()
  return { server, origin: `http://127.0.0.1:${port}`, base: server.config.base }
}

async function launchChrome(chromePath, userDataDir) {
  const proc = spawn(
    chromePath,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDataDir}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-component-update',
      '--mute-audio',
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )
  let exited = false
  let spawnError = null
  proc.on('exit', () => {
    exited = true
  })
  // CHROME_PATH là thư mục / không chạy được: spawn phát 'error'; không bắt thì tiến trình chết, bỏ qua finally.
  proc.on('error', (error) => {
    exited = true
    spawnError = error
  })
  proc.stderr.on('data', () => {})
  const portFile = path.join(userDataDir, 'DevToolsActivePort')
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    if (spawnError) throw new Error(`Không chạy được Chrome (${chromePath}): ${spawnError.message}`)
    if (exited) throw new Error('Chrome thoát ngay khi khởi động.')
    if (fs.existsSync(portFile)) {
      const [port, wsPath] = fs.readFileSync(portFile, 'utf8').split('\n')
      if (port && wsPath) return { proc, wsUrl: `ws://127.0.0.1:${port.trim()}${wsPath.trim()}` }
    }
    await sleep(100)
  }
  throw new Error('Chrome không mở cổng DevTools sau 20 giây.')
}

async function stopProcess(proc) {
  if (!proc || proc.exitCode !== null || proc.signalCode !== null) return
  const done = new Promise((r) => proc.once('exit', r))
  proc.kill('SIGTERM')
  const timedOut = await Promise.race([done.then(() => false), sleep(5000).then(() => true)])
  if (timedOut) proc.kill('SIGKILL')
}

// ---------- CDP ----------

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Set()
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8'))
      if (msg.id !== undefined) {
        const p = this.pending.get(msg.id)
        if (!p) return
        this.pending.delete(msg.id)
        if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`))
        else p.resolve(msg.result)
      } else for (const listener of this.listeners) listener(msg)
    })
    ws.addEventListener('close', () => {
      for (const p of this.pending.values()) p.reject(new Error('Kết nối DevTools đã đóng.'))
      this.pending.clear()
    })
  }

  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url)
      ws.addEventListener('open', () => resolve(new Cdp(ws)), { once: true })
      ws.addEventListener('error', () => reject(new Error('Không nối được DevTools của Chrome.')), { once: true })
    })
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method })
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    })
  }

  waitFor(method, sessionId, timeoutMs = 30_000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.listeners.delete(listener)
        reject(new Error(`Hết giờ chờ ${method}.`))
      }, timeoutMs)
      const listener = (msg) => {
        if (msg.method !== method || msg.sessionId !== sessionId) return
        clearTimeout(timer)
        this.listeners.delete(listener)
        resolve(msg.params)
      }
      this.listeners.add(listener)
    })
  }

  close() {
    try {
      this.ws.close()
    } catch {
      // đã đóng
    }
  }
}

async function openPage(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
  const send = (method, params) => cdp.send(method, params, sessionId)
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  // Mạng ngoài (YouTube, tin, Supabase…) bị chặn để hai bản chụp giống nhau; app chạy ở http://127.0.0.1.
  await send('Network.setBlockedURLs', { urls: ['https://*', 'wss://*'] })
  await send('Page.addScriptToEvaluateOnNewDocument', { source: INIT_SCRIPT })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  // Trang headless nhận phím / focus như cửa sổ đang được chọn (thử phím tắt, story 31).
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (res.exceptionDetails) {
      const detail = res.exceptionDetails.exception?.description ?? res.exceptionDetails.text
      throw new Error(`Lỗi trong trang: ${detail}`)
    }
    return res.result.value
  }

  async function navigate(url) {
    const loaded = cdp.waitFor('Page.loadEventFired', sessionId)
    const res = await send('Page.navigate', { url })
    if (res.errorText) throw new Error(`Không mở được ${url}: ${res.errorText}`)
    await loaded
  }

  return {
    send,
    evaluate,
    blank: () => navigate('about:blank'),
    /** Phím thường: keyDown (kèm chữ nếu là phím in được) rồi keyUp, vào phần tử đang focus. */
    async press(key) {
      const info = keyInfo(key)
      const base = { key, code: info.code, windowsVirtualKeyCode: info.keyCode, nativeVirtualKeyCode: info.keyCode }
      await send(
        'Input.dispatchKeyEvent',
        info.text ? { type: 'keyDown', ...base, text: info.text, unmodifiedText: info.text } : { type: 'rawKeyDown', ...base },
      )
      await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base })
    },
    /**
     * Gõ chữ như người dùng: từ có dấu theo Telex (mỗi phím là keydown "Process"/229 + `Input.imeSetComposition`, cuối cùng
     * `Input.insertText` chốt chữ), khoảng trắng và chữ không dấu gửi bằng `Input.dispatchKeyEvent`.
     */
    async type(text) {
      for (const [i, word] of text.split(' ').entries()) {
        if (i > 0) await this.press(' ')
        const telex = TELEX[word]
        if (!telex) {
          for (const ch of word) await this.press(ch)
          continue
        }
        for (const [k, state] of telex.states.entries()) {
          const letter = telex.keys[k]
          await send('Input.dispatchKeyEvent', {
            type: 'rawKeyDown',
            key: 'Process',
            code: `Key${letter.toUpperCase()}`,
            windowsVirtualKeyCode: 229,
            nativeVirtualKeyCode: 229,
          })
          await send('Input.imeSetComposition', { text: state, selectionStart: state.length, selectionEnd: state.length })
          await send('Input.dispatchKeyEvent', {
            type: 'keyUp',
            key: letter,
            code: `Key${letter.toUpperCase()}`,
            windowsVirtualKeyCode: letter.toUpperCase().charCodeAt(0),
          })
        }
        await send('Input.insertText', { text: telex.states.at(-1) })
      }
    },
    async setViewport({ width, height }) {
      const mobile = width === MOBILE_WIDTH
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
      await send('Emulation.setTouchEmulationEnabled', mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false })
    },
    /**
     * Mở `route` từ trạng thái sạch: về about:blank, xoá dữ liệu origin, tải lại toàn trang, chờ yên.
     * Người dùng mới mở `/` bị chuyển sang `/welcome` (trang thư ghi `welcomeSeenAt` ngay khi hiện), nên nếu bị chuyển
     * hướng thì đặt lại hash trong cùng trang và chờ yên lần nữa. Vẫn lệch → trả `redirect:<hash>`.
     */
    async load(app, route) {
      await navigate('about:blank')
      await send('Storage.clearDataForOrigin', { origin: app.origin, storageTypes: 'all' })
      await navigate(pageUrl(app, route))
      let settle = await evaluate(SETTLE_EXPRESSION)
      const want = `#${route}`
      // So phần đường dẫn của hash: trang tự thêm query (vd `/session` ghi `?brick=F01&step=theory`) vẫn là đúng route.
      const samePath = (hash) => hash.split('?')[0] === want
      if (!samePath(await evaluate('location.hash'))) {
        // Tính lại mốc "yên" từ lúc đổi hash: không thì SETTLE trả ngay (lần đổi DOM cuối đã lâu) trước khi router vẽ lại, và
        // `/` (bị chuyển sang `/welcome` lần đầu) bị đo khi còn là trang Thư nhập học (story 31: `/` thành `wide`).
        await evaluate(`globalThis.__layoutLastMutation = performance.now(); location.hash = ${JSON.stringify(want)}`)
        settle = await evaluate(SETTLE_EXPRESSION)
        const hash = await evaluate('location.hash')
        if (!samePath(hash)) return `redirect:${hash}`
      }
      return settle
    },
    async screenshot({ fullPage }) {
      let clip
      if (fullPage) {
        // Chờ 2 frame: ngay sau khi đổi viewport + chuyển hướng (`/` → `/welcome` → `/`), cssContentSize có thể còn là số đo
        // cũ (812 thay cho 960 của trang Hôm nay), ảnh bị cắt và lệch giả với bản kia (story 30).
        await evaluate(frames)
        const { cssContentSize } = await send('Page.getLayoutMetrics')
        clip = {
          x: 0,
          y: 0,
          width: Math.ceil(cssContentSize.width),
          height: Math.ceil(cssContentSize.height),
          scale: 1,
        }
      }
      const { data } = await send('Page.captureScreenshot', {
        format: 'png',
        ...(clip ? { clip, captureBeyondViewport: true } : {}),
      })
      return data
    },
  }
}

// ---------- chạy ----------

const slug = (route) => (route === '/' ? 'home' : route.replace(/^\//, '').replace(/[^a-zA-Z0-9-]+/g, '_'))

function pageUrl(app, route) {
  return `${app.origin}${app.base}#${route}`
}

const layoutOf = (route) => (WIDE_ROUTES.includes(route) ? 'wide' : 'default')

async function main(args, cleanup) {
  const chromePath = findChrome(process.env, process.platform, fs.existsSync)
  if (!chromePath) {
    console.error(CHROME_MISSING_MESSAGE)
    return 2
  }

  const root = git(['rev-parse', '--show-toplevel']).trim()
  let baseSha = null
  if (!args.skipDiff) {
    try {
      baseSha = git(['rev-parse', '--verify', `${args.base}^{commit}`], root).trim()
    } catch {
      console.error(`Không tìm thấy commit "${args.base}".`)
      return 2
    }
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lumos-layout-'))
  cleanup.push(() => fs.rmSync(tmp, { recursive: true, force: true }))
  const outDir = path.resolve(args.out ?? path.join(os.tmpdir(), `lumos-layout-check-${Date.now()}`))
  fs.mkdirSync(outDir, { recursive: true })

  // App chỉ chạy local (không cổng đăng nhập): biến môi trường có sẵn, kể cả rỗng, thắng file .env.
  process.env.VITE_SUPABASE_URL = ''
  process.env.VITE_SUPABASE_ANON_KEY = ''

  console.log(`Khởi động vite (bản hiện tại)…`)
  const current = await startVite(root, path.join(tmp, 'vite-current'))
  cleanup.push(() => current.server.close())

  let base = null
  if (baseSha) {
    const worktree = path.join(tmp, 'base')
    console.log(`Tạo worktree ${args.base} (${baseSha.slice(0, 7)})…`)
    git(['worktree', 'prune'], root) // dọn mục worktree mồ côi của lượt trước bị kill -9
    git(['worktree', 'add', '--detach', worktree, baseSha], root)
    cleanup.push(() => {
      try {
        git(['worktree', 'remove', '--force', worktree], root)
      } catch {
        fs.rmSync(worktree, { recursive: true, force: true })
        git(['worktree', 'prune'], root)
      }
    })
    // Bản gốc chạy với node_modules hiện tại (giới hạn đã biết: base đổi dependency thì ảnh có thể lệch).
    fs.symlinkSync(
      path.join(root, 'node_modules'),
      path.join(worktree, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    )
    console.log('Khởi động vite (bản gốc)…')
    base = await startVite(worktree, path.join(tmp, 'vite-base'))
    cleanup.push(() => base.server.close())
  }

  const userDataDir = path.join(tmp, 'chrome')
  fs.mkdirSync(userDataDir)
  const chrome = await launchChrome(chromePath, userDataDir)
  cleanup.push(() => stopProcess(chrome.proc))
  const cdp = await Cdp.connect(chrome.wsUrl)
  cleanup.push(() => cdp.close())
  const page = await openPage(cdp)

  const apps = base ? [current, base] : [current]
  const mobile = WIDTHS.find((w) => w.width === MOBILE_WIDTH)

  // Lượt khởi động: vite tối ưu dependency lần đầu có thể tải lại trang, nên đi qua mọi route một lượt trước khi đo.
  console.log('Làm nóng các route…')
  await page.setViewport(mobile)
  for (const app of apps)
    for (const route of [...ROUTES, DEEP_LINK.route]) {
      try {
        await page.load(app, route)
      } catch {
        await page.load(app, route) // trang bị reload giữa lúc chờ yên ("Execution context was destroyed")
      }
    }

  /** @type {{ route: string, width: number, problems: string[], settle: string }[]} */
  const results = []
  /** Ảnh 375px theo route: { current, base }. */
  const shots = new Map()
  /** Bề rộng máy tính đã đo được TopBar dính trên ít nhất một route. */
  const stickyChecked = new Set()

  for (const viewport of WIDTHS) {
    const desktop = viewport.width >= LG_MIN_WIDTH
    console.log(`Đo ở ${viewport.width}×${viewport.height}…`)
    await page.setViewport(viewport)
    for (const route of ROUTES) {
      const settle = await page.load(current, route)
      const metrics = await page.evaluate(
        measureExpression({
          probeScroll: desktop,
          deepLinkSection: null,
          railLandmark: RAIL_LANDMARKS[route] ?? null,
          gridSelector: GRID_LANDMARKS[route] ?? null,
        }),
      )
      const problems = layoutProblems(viewport.width, metrics, layoutOf(route))
      if (settle.startsWith('redirect:')) problems.push(`mở ${route} nhưng trang ở ${settle.slice('redirect:'.length)}`)
      if (metrics.topBarTopAfterScroll !== null) stickyChecked.add(viewport.width)
      if (viewport.width === MOBILE_WIDTH) {
        const shot = await page.screenshot({ fullPage: true })
        shots.set(route, { current: shot, base: null })
        fs.writeFileSync(path.join(outDir, `375-${slug(route)}-new.png`), Buffer.from(shot, 'base64'))
      }
      if (viewport.width === SNAPSHOT_WIDTH) {
        const shot = await page.screenshot({ fullPage: false })
        fs.writeFileSync(path.join(outDir, `${SNAPSHOT_WIDTH}-${slug(route)}.png`), Buffer.from(shot, 'base64'))
      }
      results.push({ route, width: viewport.width, problems, settle })
    }
    if (desktop) {
      const settle = await page.load(current, DEEP_LINK.route)
      const metrics = await page.evaluate(
        measureExpression({
          probeScroll: false,
          deepLinkSection: DEEP_LINK.sectionId,
          railLandmark: RAIL_LANDMARKS[DEEP_LINK.route] ?? null,
        }),
      )
      const problems = layoutProblems(viewport.width, metrics, layoutOf(DEEP_LINK.route))
      if (settle.startsWith('redirect:'))
        problems.push(`mở ${DEEP_LINK.route} nhưng trang ở ${settle.slice('redirect:'.length)}`)
      if (metrics.deepLinkMissing) problems.push(`không thấy đoạn #${DEEP_LINK.sectionId}`)
      results.push({ route: DEEP_LINK.route, width: viewport.width, problems, settle })
      // Không route nào đủ dài để cuộn 600px thì TopBar dính chưa được kiểm ở bề rộng này.
      if (!stickyChecked.has(viewport.width))
        results.at(-1).problems.push('không route nào cuộn được để kiểm TopBar dính')
    }
  }

  // Thử phím tắt (story 31) ở 1280×800 trên bản hiện tại.
  console.log(`Thử phím tắt ở ${HOTKEY_PROBE.width}×${HOTKEY_PROBE.height}…`)
  await page.setViewport({ width: HOTKEY_PROBE.width, height: HOTKEY_PROBE.height })
  const probe = await runHotkeyProbe(page, current)
  results.push({ route: HOTKEY_ROW, width: HOTKEY_PROBE.width, problems: hotkeyProblems(probe), settle: 'ok' })

  // Ảnh 375px của bản gốc, cùng trình tự (dữ liệu sạch, cùng đồng hồ/seed).
  if (base) {
    console.log(`Chụp bản gốc ở ${MOBILE_WIDTH}px…`)
    await page.setViewport(mobile)
    for (const route of ROUTES) {
      await page.load(base, route)
      const shot = await page.screenshot({ fullPage: true })
      shots.get(route).base = shot
      fs.writeFileSync(path.join(outDir, `375-${slug(route)}-base.png`), Buffer.from(shot, 'base64'))
    }
  }

  /** @type {Map<string, string>} route → mô tả lệch ảnh */
  const pixelDiffs = new Map()
  if (base) {
    console.log('So ảnh 375px…')
    await page.setViewport({ width: 800, height: 600 })
    await page.blank()
    for (const route of ROUTES) {
      const { current: a, base: b } = shots.get(route)
      if (a === b) continue
      const cmp = await page.evaluate(compareExpression(b, a))
      if (cmp.count === 0) continue
      const sizeNote =
        cmp.sizeA[0] !== cmp.sizeB[0] || cmp.sizeA[1] !== cmp.sizeB[1]
          ? ` (kích thước ${cmp.sizeA.join('×')} → ${cmp.sizeB.join('×')})`
          : ''
      pixelDiffs.set(route, `${cmp.count} pixel khác${sizeNote}`)
      if (cmp.diffPng)
        fs.writeFileSync(path.join(outDir, `375-${slug(route)}-diff.png`), Buffer.from(cmp.diffPng, 'base64'))
    }
  }

  // ---------- báo cáo ----------
  const widths = WIDTHS.map((w) => w.width)
  const routes = [...ROUTES, DEEP_LINK.route, HOTKEY_ROW]
  const col = Math.max(...routes.map((r) => r.length)) + 2
  const header = 'route'.padEnd(col) + widths.map((w) => String(w).padStart(6)).join('') + (base ? '  ảnh 375' : '')
  console.log(`\n${header}\n${'-'.repeat(header.length)}`)
  for (const route of routes) {
    const cells = widths.map((w) => {
      const r = results.find((x) => x.route === route && x.width === w)
      return (r ? (r.problems.length ? 'LỖI' : 'ok') : '—').padStart(6)
    })
    const pix = base && ROUTES.includes(route) ? `  ${pixelDiffs.has(route) ? 'LỆCH' : 'trùng'}` : ''
    console.log(route.padEnd(col) + cells.join('') + pix)
  }

  const failed = results.filter((r) => r.problems.length > 0)
  const unsettled = results.filter((r) => r.settle === 'timeout')
  if (failed.length || pixelDiffs.size) console.log('\nChi tiết:')
  for (const r of failed) for (const p of r.problems) console.log(`  ${r.route} @ ${r.width}px: ${p}`)
  for (const [route, note] of pixelDiffs) console.log(`  ${route} @ 375px: ảnh lệch bản gốc — ${note}`)
  if (unsettled.length)
    console.log(
      `\nLưu ý: ${unsettled.length} lượt mở chưa yên sau ${SETTLE_MAX_MS / 1000}s (vẫn đo): ${[...new Set(unsettled.map((r) => r.route))].join(', ')}`,
    )
  if (!base) console.log('\nBỏ qua so ảnh 375px (--skip-diff).')
  console.log(`\nẢnh: ${outDir}`)

  if (failed.length || pixelDiffs.size) {
    console.log(`\nKHÔNG ĐẠT: ${failed.length} lỗi bố cục, ${pixelDiffs.size} route lệch ảnh 375px.`)
    return 1
  }
  console.log('\nĐẠT: mọi route × bề rộng đúng bố cục' + (base ? ', ảnh 375px trùng bản gốc.' : '.'))
  return 0
}

/** Dòng của bước thử phím trong bảng kết quả. */
const HOTKEY_ROW = 'thử phím tắt'

const errorText = (error) => (error instanceof Error ? error.message : String(error))

/**
 * Thử phím tắt (xem HotkeyProbe trong check-lib.d.mts): F01 Enter qua màn + gõ trong ô "Từ còn thiếu" + phím 1 ở màn luyện
 * tập (đang ẩn / đang hiện); kiểm tra hàng A bấm 2 rồi Enter; `/session` → rồi ←;
 * `/notebook` tạo ghi chú "chào" để ô tìm kiếm hiện, rồi gõ "chào" vào ô tìm kiếm. Mỗi bước mở từ dữ liệu sạch.
 */
async function runHotkeyProbe(page, app) {
  // Chờ yên tính từ sau phím / bấm: React có thể vẽ lại sau khi CDP trả về, nên không dựa vào lần đổi DOM trước đó.
  const settle = async () => {
    await page.evaluate('globalThis.__layoutLastMutation = performance.now()')
    return page.evaluate(SETTLE_EXPRESSION)
  }
  const blur = () => page.evaluate('document.activeElement?.blur?.(), window.getSelection()?.removeAllRanges()')

  /** @type {import('./check-lib.d.mts').HotkeyProbe} */
  const probe = {
    brick: {
      screenAfterEnter: null,
      screenAfterTyping: null,
      typingGraded: false,
      checkScreen: null,
      hiddenCheckState: null,
      checkStateAfterKey: null,
    },
    session: { stepAfterRight: null, stepAfterLeft: null },
    quiz: { answeredAfterKey: false, headingAfterEnter: null },
    notebook: { searchValue: null, hashBefore: '', hashAfter: '', scrollBefore: 0, scrollAfter: 0 },
  }

  try {
    await page.load(app, HOTKEY_PROBE.brickRoute)
    await blur()
    for (let i = 0; i < 3; i++) {
      await page.press('Enter')
      await settle()
    }
    probe.brick.screenAfterEnter = await page.evaluate(BRICK_SCREEN_EXPRESSION)
    await page.evaluate(`(() => {
      const input = document.querySelector('input[aria-label="Từ còn thiếu"]')
      if (!input) throw new Error('không thấy ô "Từ còn thiếu"')
      input.focus()
    })()`)
    await page.type(HOTKEY_PROBE.brickTyped)
    await page.press('Enter')
    await settle()
    probe.brick.screenAfterTyping = await page.evaluate(BRICK_SCREEN_EXPRESSION)
    probe.brick.typingGraded = await page.evaluate(`document.querySelector('main').innerText.includes('Chưa đúng')`)
    // Màn luyện tập: Enter (ngoài ô) sang màn 5; quay lại màn 4, bấm 1 (phần luyện tập đang ẩn, không được trả lời), Enter về
    // màn 5, rồi bấm 1 ở đó (phải chọn).
    await blur()
    await page.press('Enter')
    await settle()
    probe.brick.checkScreen = await page.evaluate(BRICK_SCREEN_EXPRESSION)
    await page.evaluate(clickButtonExpression('Quay lại màn trước'))
    await settle()
    await blur()
    await page.press('1')
    await settle()
    await page.press('Enter')
    await settle()
    probe.brick.hiddenCheckState = await page.evaluate(CHECK_STATE_EXPRESSION)
    await page.press('1')
    await settle()
    probe.brick.checkStateAfterKey = await page.evaluate(CHECK_STATE_EXPRESSION)
  } catch (error) {
    probe.brick.error = errorText(error)
  }

  try {
    await page.load(app, HOTKEY_PROBE.quizRoute)
    await blur()
    const start = await page.evaluate(QUESTION_STATE_EXPRESSION)
    if (!start.heading?.startsWith('Câu 1/')) throw new Error(`không mở ở câu 1 (thấy "${start.heading ?? '?'}")`)
    if (start.answered) throw new Error('câu 1 đã được chọn trước khi bấm phím')
    await page.press('2')
    await settle()
    probe.quiz.answeredAfterKey = (await page.evaluate(QUESTION_STATE_EXPRESSION)).answered
    await blur()
    await page.press('Enter')
    await settle()
    probe.quiz.headingAfterEnter = (await page.evaluate(QUESTION_STATE_EXPRESSION)).heading
  } catch (error) {
    probe.quiz.error = errorText(error)
  }

  try {
    await page.load(app, HOTKEY_PROBE.sessionRoute)
    await blur()
    const start = await page.evaluate(SESSION_STEP_EXPRESSION)
    if (start !== 0) throw new Error(`buổi học không mở ở bước 1 (bước ${start === null ? '?' : start + 1})`)
    await page.press('ArrowRight')
    await settle()
    probe.session.stepAfterRight = await page.evaluate(SESSION_STEP_EXPRESSION)
    await blur()
    await page.press('ArrowLeft')
    await settle()
    probe.session.stepAfterLeft = await page.evaluate(SESSION_STEP_EXPRESSION)
  } catch (error) {
    probe.session.error = errorText(error)
  }

  try {
    await page.load(app, HOTKEY_PROBE.notebookRoute)
    await page.evaluate(clickButtonExpression('Thêm ghi chú'))
    await settle()
    await page.evaluate(`(() => {
      const label = [...document.querySelectorAll('label')].find((l) => l.querySelector('span')?.textContent === 'Quy tắc')
      const field = label?.querySelector('textarea')
      if (!field) throw new Error('không thấy ô "Quy tắc"')
      field.focus()
    })()`)
    await page.type(HOTKEY_PROBE.searchText)
    await page.evaluate(clickButtonExpression('Lưu ghi chú'))
    await settle()
    await page.evaluate(`(() => {
      const input = document.querySelector('input[type="search"]')
      if (!input) throw new Error('không thấy ô tìm kiếm (ghi chú chưa lưu?)')
      input.focus()
    })()`)
    const before = await page.evaluate('({ hash: location.hash, scrollY: window.scrollY })')
    await page.type(HOTKEY_PROBE.searchText)
    await settle()
    const after = await page.evaluate(
      `({ hash: location.hash, scrollY: window.scrollY, value: document.querySelector('input[type="search"]')?.value ?? null })`,
    )
    probe.notebook = {
      searchValue: after.value,
      hashBefore: before.hash,
      hashAfter: after.hash,
      scrollBefore: before.scrollY,
      scrollAfter: after.scrollY,
    }
  } catch (error) {
    probe.notebook.error = errorText(error)
  }

  return probe
}

async function runCleanup(cleanup) {
  for (const fn of cleanup.splice(0).reverse()) {
    try {
      await fn()
    } catch (error) {
      console.error(`Dọn dẹp lỗi: ${error instanceof Error ? error.message : error}`)
    }
  }
}

let args
try {
  args = parseCheckArgs(process.argv.slice(2))
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(2)
}

const cleanup = []
let exitCode = 2
const interrupt = async () => {
  await runCleanup(cleanup)
  process.exit(130)
}
process.once('SIGINT', interrupt)
process.once('SIGTERM', interrupt)
try {
  exitCode = await main(args, cleanup)
} catch (error) {
  console.error(`layout:check không chạy được: ${error instanceof Error ? error.message : error}`)
  exitCode = 2
} finally {
  await runCleanup(cleanup)
}
process.exit(exitCode)
