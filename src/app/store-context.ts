import { createContext, useContext } from 'react'

import type { LoadedStore } from '@/lib/storage'

export const StoreContext = createContext<LoadedStore | null>(null)

export function useLoadedStore(): LoadedStore {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useLoadedStore phải nằm trong StoreContext.Provider')
  return value
}
