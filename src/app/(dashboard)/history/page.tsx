"use client";

import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import {
  mockMonthlySpending,
  mockRecentTransactions,
  formatCurrency,
} from "@/lib/mock-data";
import { Search, Calendar, Download, Filter, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  return (
    <section className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 ring-1 ring-blue-400/20">
              <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
              Financial Records
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              History
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Review your past performance and see how your habits have evolved.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95">
              <Download className="size-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Spending Trend Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Spending over time</h3>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
            <button className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-50 bg-slate-100 dark:bg-slate-800">6 Months</button>
            <button className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">1 Year</button>
            <button className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">All Time</button>
          </div>
        </div>
        <SpendingChart data={mockMonthlySpending} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Past Salary Cycles</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cycles..."
                  className="rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <button className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <Filter className="size-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {['March 2026', 'February 2026', 'January 2026'].map((cycle, i) => (
              <div key={cycle} className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Calendar className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-50">{cycle}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Savings rate: {20 - i * 2}% · Health Score: {85 - i * 5}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{formatCurrency(1800 + i * 150)}</p>
                    <p className="text-xs text-slate-500">Total Spent</p>
                  </div>
                  <ChevronRight className="size-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Global Stats</h3>
          <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-500">Highest spending month</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">December 2025</p>
                <p className="text-sm text-rose-500">{formatCurrency(2100)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Most saved month</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">March 2026</p>
                <p className="text-sm text-emerald-500">{formatCurrency(950)}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Lifetime Savings</p>
                <p className="text-2xl font-black text-blue-500">{formatCurrency(14500)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
