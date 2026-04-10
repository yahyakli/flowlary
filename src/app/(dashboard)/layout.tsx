import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/expenses", label: "Expenses" },
  { href: "/goals", label: "Goals" },
  { href: "/debts", label: "Debts" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200/10 bg-white/90 px-6 py-4 backdrop-blur-xl transition-colors duration-300 dark:border-slate-900/20 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Flowlary</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-50">Dashboard</h1>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="rounded-full bg-slate-100/70 px-4 py-2 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">Demo mode</span>
            <Link href="/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-950 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800">
              Log out
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10 sm:px-10 lg:px-12">
        <aside className="hidden w-72 shrink-0 space-y-3 rounded-3xl border border-slate-200/10 bg-white/90 p-5 shadow-lg shadow-slate-950/10 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/40 lg:block">
          <div className="mb-6 rounded-3xl bg-slate-50/80 p-4 text-sm text-slate-700 dark:bg-slate-950/80 dark:text-slate-300">
            <p className="font-semibold text-slate-950 dark:text-slate-50">Your money summary</p>
            <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">Use the sidebar to move between your salary planner, expenses, goals, and debt overview.</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 rounded-3xl border border-slate-200/10 bg-white/90 p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-slate-950/30 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
