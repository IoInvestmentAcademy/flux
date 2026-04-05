import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Language, Currency, Translations } from './i18n'
import { translations } from './i18n'

interface PreferencesContextValue {
  language: Language
  currency: Currency
  setLanguage: (l: Language) => void
  setCurrency: (c: Currency) => void
  t: Translations
  formatMoney: (amount: number) => string
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

const CURRENCY_LOCALES: Record<Currency, string> = {
  RON: 'ro-RO',
  USD: 'en-US',
  EUR: 'de-DE',
}

export function formatMoneyWithCurrency(amount: number, currency: Currency): string {
  const formatted = new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  if (currency === 'RON') return `${formatted} lei`
  if (currency === 'USD') return `$${formatted}`
  if (currency === 'EUR') return `€${formatted}`
  return `${formatted} ${currency}`
}

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try { return (localStorage.getItem('flux-lang') as Language) ?? 'ro' } catch { return 'ro' }
  })
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try { return (localStorage.getItem('flux-currency') as Currency) ?? 'RON' } catch { return 'RON' }
  })

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l)
    try { localStorage.setItem('flux-lang', l) } catch {}
  }, [])

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c)
    try { localStorage.setItem('flux-currency', c) } catch {}
  }, [])

  const formatMoney = useCallback((amount: number) => formatMoneyWithCurrency(amount, currency), [currency])

  const t = translations[language] as Translations

  return (
    <PreferencesContext.Provider value={{ language, currency, setLanguage, setCurrency, t, formatMoney }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
