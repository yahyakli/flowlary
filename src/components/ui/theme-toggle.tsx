"use client"

import { useTheme } from "next-themes"
import { SunIcon, MoonIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { buildThemeCookie, type ThemePreference } from "@/lib/theme"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = resolvedTheme || theme
  const isDark = currentTheme === "dark"

  const toggleTheme = () => {
    const nextTheme: ThemePreference = isDark ? "light" : "dark"
    setTheme(nextTheme)
    document.cookie = buildThemeCookie(nextTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/20 bg-white/90 text-slate-950 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900"
      aria-label="Toggle theme"
    >
      {mounted ? (isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />) : <SunIcon className="size-4" />}
    </button>
  )
}
