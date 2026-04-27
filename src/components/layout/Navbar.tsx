"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, SparklesIcon, Menu, User as UserIcon } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto flex w-[90%] max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6 dark:bg-slate-950">
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
            className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 transition-colors duration-300 dark:text-slate-50"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 shadow-md">
              <Image src="/logo.webp" alt="Flowlary" width={18} height={18} />
            </div>
            <span>Flowlary</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 pr-3 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:bg-slate-800">
                  <Avatar className="size-8">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="bg-cyan-500 text-xs text-white">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {session?.user?.name?.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 rounded-2xl border bg-white border-slate-200 p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="group flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-red-600 transition-all hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                >
                  <LogOut className="mr-2 size-4 transition-transform group-hover:-translate-x-0.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:shadow-lg hover:shadow-cyan-500/30 dark:from-cyan-600 dark:to-cyan-700 sm:inline-flex"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800"
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
