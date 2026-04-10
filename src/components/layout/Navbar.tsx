"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, SparklesIcon } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useSession, signOut } from "next-auth/react"

const authNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/goals", label: "Goals" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/10 bg-white/80 py-4 backdrop-blur-xl transition-colors duration-300 dark:border-slate-900/20 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-base font-semibold text-slate-950 transition-colors duration-300 dark:text-slate-50">
          <SparklesIcon className="size-5 text-cyan-500" />
          <span>Flowlary</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {isAuthenticated
            ? authNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    pathname === item.href
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))
            : null}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-950/5 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </>
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
