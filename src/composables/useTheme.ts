import { Dark } from 'quasar'

const THEME_KEY = 'alif_admin_theme'

export type AppTheme = 'light' | 'dark'

export function storedTheme(): AppTheme {
  const stored = localStorage.getItem(THEME_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function persistTheme(theme: AppTheme): void {
  localStorage.setItem(THEME_KEY, theme)
}

export function applyTheme(theme: AppTheme): void {
  Dark.set(theme === 'dark')
}

/** Restore the persisted theme. Call once on app start. */
export function initTheme(): void {
  applyTheme(storedTheme())
}
