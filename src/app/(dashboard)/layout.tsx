"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-950 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <div className="mx-auto flex w-[90%] max-w-[1600px] items-start gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Desktop Sidebar */}
        <aside className="sticky top-24 hidden lg:block w-72 shrink-0 rounded-3xl border border-slate-300 bg-white p-5 shadow-lg dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/40">
          <Sidebar />
        </aside>

        <main className="flex-1 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-slate-950/30 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
