"use client";

import { useState } from "react";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import {
  mockRecentTransactions,
  mockCategoryBreakdown,
  formatCurrency,
} from "@/lib/mock-data";
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Receipt, Wallet } from "lucide-react";

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = mockRecentTransactions.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = mockRecentTransactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const fixedExpenses = mockRecentTransactions
    .filter((t) => t.amount < 0 && t.type === "fixed")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const variableExpenses = mockRecentTransactions
    .filter((t) => t.amount < 0 && t.type === "variable")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <section className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-600/20 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 ring-1 ring-emerald-400/20">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Expense Management
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Track Spending
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Analyze your outflows and optimize your salary distribution.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-400 hover:shadow-emerald-400/30 active:scale-95">
              <Plus className="size-4" />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Receipt className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Expenses</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrency(totalExpenses)}
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
            <Wallet className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fixed Commitments</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrency(fixedExpenses)}
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <ArrowDownRight className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Variable Spending</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrency(variableExpenses)}
          </h3>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">All Transactions</h3>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <Filter className="size-4" />
              </button>
            </div>
          </div>

          <RecentTransactions transactions={filteredTransactions} />
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-8">
          <BudgetDonut data={mockCategoryBreakdown} />

          <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-bold text-slate-900 dark:text-slate-50">Smart Tip</h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Your "Food" spending is 15% higher than last month. Try to plan your meals to save around 200 MAD.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
