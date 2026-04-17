"use client";

import { ReactNode, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Prevent the main page from scrolling to keep sidebar fixed
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="h-[calc(100vh-65px)] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-950 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <div className="mx-auto flex h-full w-[90%] max-w-[1600px] items-stretch gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 overflow-y-auto rounded-3xl border border-slate-300 bg-white p-5 shadow-lg dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/40">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto rounded-3xl border border-slate-300 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-slate-950/30 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
