import { useEffect, useEffectEvent } from 'react'

import { hotkeyName, shouldHandleKey, type HotkeyBindings, type KeyEnv, type KeyLike, type KeyTarget } from '@/lib/hotkeys'

export type { HotkeyBindings } from '@/lib/hotkeys'

const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"], dialog[open]'

function keyTarget(target: EventTarget | null): KeyTarget | null {
  if (!(target instanceof Element)) return null
  const html = target as HTMLElement & { disabled?: unknown }
  return {
    tagName: target.tagName,
    isContentEditable: html.isContentEditable === true,
    role: target.getAttribute('role'),
    hasHref: target.tagName === 'A' && target.hasAttribute('href'),
    disabled: html.disabled === true || target.getAttribute('aria-disabled') === 'true',
  }
}

function toKeyLike(e: KeyboardEvent): KeyLike {
  return {
    key: e.key,
    keyCode: e.keyCode,
    isComposing: e.isComposing,
    repeat: e.repeat,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    altKey: e.altKey,
    shiftKey: e.shiftKey,
    defaultPrevented: e.defaultPrevented,
    target: keyTarget(e.target),
  }
}

function readEnv(): KeyEnv {
  return {
    dialogOpen: document.querySelector(DIALOG_SELECTOR) !== null,
    selectedText: window.getSelection()?.toString() ?? '',
  }
}

/**
 * Phím tắt máy tính (story 31). Lắng nghe `keydown` trên `window` (pha nổi bọt, sau `onKeyDown` của phần tử), bỏ qua theo
 * `shouldHandleKey`. Phím có binding thì `preventDefault()` rồi gọi, nên hook khác thấy `defaultPrevented` và bỏ qua (một
 * phím, một hành động); phím không có binding thì không chặn. Chỉ truyền binding đang hợp lệ; `enabled = false` tắt hẳn.
 * Gọi trước mọi `return` sớm của component.
 */
export function useHotkeys(bindings: HotkeyBindings, enabled = true): void {
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (!shouldHandleKey(toKeyLike(e), readEnv())) return
    const name = hotkeyName(e.key)
    const run = name ? bindings[name] : undefined
    if (!run) return
    e.preventDefault()
    run()
  })

  useEffect(() => {
    if (!enabled) return
    const listener = (e: KeyboardEvent) => onKeyDown(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [enabled])
}
