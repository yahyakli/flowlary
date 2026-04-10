"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down more than 400px
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 p-0 text-slate-950 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-all duration-500 hover:scale-110 hover:bg-white dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-5 transition-transform group-hover:-translate-y-1" />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-950/5 dark:ring-white/10" />
    </button>
  )
}
