import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { wrapPlayer, YT_API_URL, YT_LOAD_TIMEOUT_MS } from './youtube-player'

describe('wrapPlayer', () => {
  it('chuyển lệnh; lỗi hoặc giá trị lạ → null, không ném', () => {
    const raw = {
      getCurrentTime: () => 12.3,
      getPlayerState: () => 1,
      seekTo: vi.fn(),
      pauseVideo: vi.fn(),
      playVideo: vi.fn(() => {
        throw new Error('x')
      }),
    }
    const p = wrapPlayer(raw)
    expect(p.getCurrentTime()).toBe(12.3)
    expect(p.getState()).toBe(1)
    p.seekTo(-3)
    expect(raw.seekTo).toHaveBeenCalledWith(0, true)
    p.pause()
    expect(raw.pauseVideo).toHaveBeenCalled()
    expect(() => p.play()).not.toThrow()
    const broken = wrapPlayer({
      getCurrentTime: () => {
        throw new Error('x')
      },
      getPlayerState: () => Number.NaN as unknown as number,
    })
    expect(broken.getCurrentTime()).toBeNull()
    expect(wrapPlayer({ getCurrentTime: () => Number.NaN }).getCurrentTime()).toBeNull()
    expect(() => wrapPlayer({}).destroy()).not.toThrow()
  })
})

type FakeScript = { src: string; async: boolean; onerror: (() => void) | null; remove: ReturnType<typeof vi.fn> }

describe('loadYouTubeApi / attachPlayer', () => {
  let win: { YT?: unknown; onYouTubeIframeAPIReady?: () => void }
  let scripts: FakeScript[]
  let mod: typeof import('./youtube-player')

  beforeEach(async () => {
    vi.useFakeTimers()
    win = {}
    scripts = []
    vi.stubGlobal('window', win)
    vi.stubGlobal('document', {
      createElement: () => ({ src: '', async: false, onerror: null, remove: vi.fn() }),
      head: { appendChild: (s: FakeScript) => scripts.push(s) },
    })
    vi.resetModules()
    mod = await import('./youtube-player')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('tải script một lần; callback sẵn sàng → resolve', async () => {
    const a = mod.loadYouTubeApi()
    expect(mod.loadYouTubeApi()).toBe(a)
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe(YT_API_URL)
    const YT = { Player: function Player() {} }
    win.YT = YT
    win.onYouTubeIframeAPIReady!()
    await expect(a).resolves.toBe(YT)
  })

  it('script lỗi → attachPlayer trả null; lần sau thử lại bằng script mới', async () => {
    const p = mod.attachPlayer({} as HTMLIFrameElement).ready
    scripts[0].onerror!()
    await expect(p).resolves.toBeNull()
    expect(scripts[0].remove).toHaveBeenCalled()
    void mod.loadYouTubeApi().catch(() => {})
    expect(scripts).toHaveLength(2)
  })

  it('player sẵn sàng → handle đọc được thời gian; player không trả lời → null sau timeout', async () => {
    let events: { onReady?: () => void; onStateChange?: (e: { data: number }) => void } = {}
    let created = 0
    let host = ''
    win.YT = {
      Player: function Player(this: object, _el: unknown, opts: { host: string; events: typeof events }) {
        created++
        host = opts.host
        events = opts.events
        Object.assign(this, { getCurrentTime: () => 4.5 })
      },
    }
    const iframe = {} as HTMLIFrameElement
    const states: number[] = []
    const ok = mod.attachPlayer(iframe, (s) => states.push(s))
    // Gắn lần hai vào cùng iframe (effect chạy hai lần) → dùng chung player.
    const again = mod.attachPlayer(iframe)
    expect(again.ready).toBe(ok.ready)
    await Promise.resolve()
    events.onReady!()
    const handle = await ok.ready
    expect(created).toBe(1)
    expect(host).toBe('https://www.youtube-nocookie.com')
    expect(handle?.getCurrentTime()).toBe(4.5)
    events.onStateChange!({ data: 0 })
    ok.off()
    events.onStateChange!({ data: 1 })
    expect(states).toEqual([0])

    const silent = mod.attachPlayer({} as HTMLIFrameElement).ready
    await Promise.resolve()
    vi.advanceTimersByTime(YT_LOAD_TIMEOUT_MS)
    await expect(silent).resolves.toBeNull()
    // Thử lại trên cùng iframe không tạo player thứ hai; iframe mới thì gắn mới.
    const before = created
    const silentIframe = {} as HTMLIFrameElement
    const first = mod.attachPlayer(silentIframe).ready
    await Promise.resolve()
    vi.advanceTimersByTime(YT_LOAD_TIMEOUT_MS)
    await expect(first).resolves.toBeNull()
    await expect(mod.attachPlayer(silentIframe).ready).resolves.toBeNull()
    expect(created).toBe(before + 1)
    void mod.attachPlayer({} as HTMLIFrameElement)
    await Promise.resolve()
    await Promise.resolve()
    expect(created).toBe(before + 2)
  })
})
