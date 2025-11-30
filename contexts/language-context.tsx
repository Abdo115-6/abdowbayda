"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Locale = "en" | "ar" | "fr"

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedLocale = localStorage.getItem("locale") as Locale | null
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar" || savedLocale === "fr")) {
      setLocaleState(savedLocale)
      if (savedLocale === "ar") {
        document.documentElement.dir = "rtl"
        document.documentElement.lang = "ar"
      } else if (savedLocale === "fr") {
        document.documentElement.dir = "ltr"
        document.documentElement.lang = "fr"
      } else {
        document.documentElement.dir = "ltr"
        document.documentElement.lang = "en"
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (isClient) {
      localStorage.setItem("locale", newLocale)
      if (newLocale === "ar") {
        document.documentElement.dir = "rtl"
        document.documentElement.lang = "ar"
      } else if (newLocale === "fr") {
        document.documentElement.dir = "ltr"
        document.documentElement.lang = "fr"
      } else {
        document.documentElement.dir = "ltr"
        document.documentElement.lang = "en"
      }
    }
  }

  const t = (key: string): string => {
    const { translations } = require("@/lib/translations")
    return translations[locale]?.[key] || key
  }

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
