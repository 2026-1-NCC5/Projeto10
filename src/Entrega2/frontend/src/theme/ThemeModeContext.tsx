import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"


type ThemeMode = "dark" | "light"


type ThemeModeContextValue = {
  mode: ThemeMode
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
}


const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)


const STORAGE_KEY = "themeMode"


function resolveInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "dark"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "dark" || stored === "light") return stored
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light"
  return "dark"
}


export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => resolveInitialMode())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => setModeState(next), [])
  const toggleMode = useCallback(
    () => setModeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  )

  const value = useMemo(() => ({ mode, toggleMode, setMode }), [mode, toggleMode, setMode])

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
}


export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider")
  return ctx
}
