import { createI18n } from 'vue-i18n'
import en from './en'
import ru from './ru'
import zh from './zh'

const LOCALE_KEY = 'alif_admin_locale'

export type AppLocale = 'en' | 'ru' | 'zh'

export function storedLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_KEY)
  return stored === 'en' || stored === 'ru' || stored === 'zh' ? stored : 'ru'
}

export function persistLocale(locale: AppLocale): void {
  localStorage.setItem(LOCALE_KEY, locale)
}

export const i18n = createI18n({
  legacy: false,
  locale: storedLocale(),
  fallbackLocale: 'en',
  messages: { en, ru, zh },
})
