"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, SparklesIcon, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from "./Sidebar"
import Image from "next/image"

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar on navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 py-4 backdrop-blur-xl transition-all duration-300 shadow-sm shadow-slate-950/5 dark:border-white/10 dark:bg-slate-950/90 dark:shadow-2xl dark:shadow-slate-950/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 sm:px-10">
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6 dark:bg-slate-950 border-r-slate-200/10 dark:border-white/5">
                <SheetHeader className="mb-8 items-start px-2">
                  <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                    <SparklesIcon className="size-6 text-cyan-500" />
                    Flowlary
                  </SheetTitle>
                </SheetHeader>
                <Sidebar onItemClick={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          <Link 
            href={isAuthenticated ? "/dashboard" : "/"} 
            className="inline-flex items-center gap-0.5 text-base font-semibold text-slate-950 transition-colors duration-300 dark:text-slate-50"
          >
            <Image src="/logo.png" alt="Flowlary" width={24} height={24} />
            <span>Flowlary</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-950/5 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-500/20 dark:text-cyan-200 sm:inline-flex"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-200/80 bg-slate-950/5 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
