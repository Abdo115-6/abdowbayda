"use client"

import { Languages, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"

export function LanguageThemeSwitcher() {
  const { locale, setLocale } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled>
          <Languages className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" disabled>
          <Sun className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  const languageLabels = {
    en: "English",
    ar: "العربية",
    fr: "Français",
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Languages className="h-5 w-5" />
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLocale("en")}>
            <span className={locale === "en" ? "font-bold" : ""}>English</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocale("ar")}>
            <span className={locale === "ar" ? "font-bold" : ""}>العربية</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocale("fr")}>
            <span className={locale === "fr" ? "font-bold" : ""}>Français</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <span className={theme === "light" ? "font-bold" : ""}>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <span className={theme === "dark" ? "font-bold" : ""}>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <span className={theme === "system" ? "font-bold" : ""}>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
