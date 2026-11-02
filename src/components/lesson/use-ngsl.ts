import { useMemo } from 'react'

import { useWords, type WordsState } from '@/app/use-words'
import { hasDetails, type StudyWord } from '@/data/vocab'

export type NgslLookup = (word: string) => StudyWord | undefined

/** Tra từ NGSL có dữ liệu (IPA, âm tiết, trọng âm) theo chữ; bộ từ nạp lười, chưa nạp xong thì trả undefined. */
export function useNgslLookup(): { state: WordsState; lookup: NgslLookup } {
  const state = useWords()
  const words = state.status === 'ready' ? state.words : null
  const byWord = useMemo(() => {
    const map = new Map<string, StudyWord>()
    for (const w of words ?? []) if (w.list === 'ngsl' && hasDetails(w)) map.set(w.word, w)
    return map
  }, [words])
  return { state, lookup: (word) => byWord.get(word) }
}
