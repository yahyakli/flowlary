"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  Target,
  History,
  Settings,
  CreditCard,
  X
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      <div className="mb-6 rounded-2xl border border-slate-300 bg-gradient-to-br from-cyan-50 to-violet-50 p-4 dark:border-white/10 dark:from-cyan-500/5 dark:to-violet-500/5">
        <p className="font-semibold text-slate-900 dark:text-slate-50">Financial Workspace</p>
        <p className="mt-2 text-xs leading-5 text-slate-700 dark:text-slate-400">Manage your salary plan, expenses, and savings goals in one place.</p>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
              isActive
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/20 dark:from-cyan-600 dark:to-cyan-700 dark:shadow-cyan-500/30"
                : "text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            )}
          >
            <Icon className={cn(
              "size-5 transition-transform duration-200 group-hover:scale-110",
              isActive ? "text-white" : "text-slate-600 group-hover:text-slate-800 dark:group-hover:text-slate-300"
            )} />
            {item.label}
            {isActive && <div className="ml-auto size-2 rounded-full bg-white/80" />}
          </Link>
        )
      })}
    </nav>
  )
}
