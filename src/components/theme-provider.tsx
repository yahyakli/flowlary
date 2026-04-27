"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProviderWrapper({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  // Using a simpler approach to prevent script tag injection errors in Turbopack
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
