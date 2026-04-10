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
      <div className="mb-6 rounded-3xl bg-slate-50/80 p-4 text-sm text-slate-700 dark:bg-slate-950/80 dark:text-slate-300">
        <p className="font-semibold text-slate-950 dark:text-slate-50">Financial Workspace</p>
        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">Manage your salary plan, expenses, and savings goals in one place.</p>
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
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all group",
              isActive 
                ? "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" 
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            )}
          >
            <Icon className={cn(
              "size-5 transition-transform group-hover:scale-110",
              isActive ? "text-cyan-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
            )} />
            {item.label}
            {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-500" />}
          </Link>
        )
      })}
    </nav>
  )
}
