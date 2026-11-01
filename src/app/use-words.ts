import { useEffect, useState } from 'react'

import { loadWords, type Word } from '@/data/vocab'

export type WordsState =
  | { status: 'loading' }
  | { status: 'ready'; words: readonly Word[] }
  | { status: 'error'; retry: () => void }

/** Nạp bộ từ (chunk riêng) khi trang cần; lỗi mạng thì cho thử lại. */
export function useWords(): WordsState {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<WordsState>({ status: 'loading' })

  useEffect(() => {
    let alive = true
    loadWords().then(
      (words) => alive && setState({ status: 'ready', words }),
      () =>
        alive &&
        setState({
          status: 'error',
          retry: () => {
            setState({ status: 'loading' })
            setAttempt((n) => n + 1)
          },
        }),
    )
    return () => {
      alive = false
    }
  }, [attempt])

  return state
}
