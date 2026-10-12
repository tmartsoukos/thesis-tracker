import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData } from './types'
import { createSeedData } from './seed'
import { isValidYmd } from './lib/dates'

const STORAGE_KEY = 'thesis-tracker:v1'
const THEME_KEY = 'thesis-tracker:theme'

export type Theme = 'auto' | 'light' | 'dark'

export function newId(): string {
  return crypto.randomUUID()
}

/** Basic shape check for imported/stored data. Returns the data or null. */
export function parseAppData(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null
  const d = raw as Partial<AppData>
  const arrays = [d.phases, d.meetings, d.papers, d.experiments, d.chapters, d.risks]
  if (d.version !== 1 || !isValidYmd(d.deadline) || !arrays.every(Array.isArray)) return null
  const phasesOk = d.phases!.every(
    (p) =>
      p &&
      typeof p.id === 'string' &&
      typeof p.title === 'string' &&
      isValidYmd(p.startDate) &&
      isValidYmd(p.endDate) &&
      Array.isArray(p.tasks),
  )
  return phasesOk ? (d as AppData) : null
}

function load(): AppData {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (text) {
      const parsed = parseAppData(JSON.parse(text))
      if (parsed) return parsed
    }
  } catch {
    // corrupt or unavailable storage: fall back to seed data
  }
  return createSeedData()
}

interface Store {
  data: AppData
  update: (fn: (draft: AppData) => void) => void
  replaceAll: (next: AppData) => void
  reset: () => void
  theme: Theme
  setTheme: (t: Theme) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const t = localStorage.getItem(THEME_KEY)
      return t === 'light' || t === 'dark' ? t : 'auto'
    } catch {
      return 'auto'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage full or blocked: data stays in memory, Export JSON still works
    }
  }, [data])

  useEffect(() => {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const update = useCallback((fn: (draft: AppData) => void) => {
    setData((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })
  }, [])

  const value = useMemo<Store>(
    () => ({
      data,
      update,
      replaceAll: setData,
      reset: () => setData(createSeedData()),
      theme,
      setTheme: (t) => {
        setThemeState(t)
        try {
          localStorage.setItem(THEME_KEY, t)
        } catch {
          // ignore
        }
      },
    }),
    [data, update, theme],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}
