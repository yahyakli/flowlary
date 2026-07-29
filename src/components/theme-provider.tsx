"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { getThemeCookieName, resolveThemePreference, type ThemePreference } from "@/lib/theme"

function getInitialTheme(): ThemePreference {
  if (typeof document === "undefined") return "light"

  const match = document.cookie.match(new RegExp(`${getThemeCookieName()}=([^;]+)`))
  return resolveThemePreference(match?.[1])
}

export function ThemeProviderWrapper({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={getInitialTheme()}
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
