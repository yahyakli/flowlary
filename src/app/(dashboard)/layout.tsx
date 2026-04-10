import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10 sm:px-10 lg:px-12">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 space-y-3 rounded-3xl border border-slate-200/10 bg-white/90 p-5 shadow-lg shadow-slate-950/10 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/40 lg:block">
          <Sidebar />
        </aside>

        <main className="flex-1 rounded-3xl border border-slate-200/10 bg-white/90 p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-slate-950/30 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
