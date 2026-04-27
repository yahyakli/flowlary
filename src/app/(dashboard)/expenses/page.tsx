"use client";

import { useState, useEffect, useMemo } from "react";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AllTransactionsModal } from "@/components/expenses/AllTransactionsModal";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import { useExpenseStore } from "@/store/useExpenseStore";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { formatCurrency } from "@/lib/mock-data";
import { Search, Filter, Receipt, Wallet, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StatsCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
      <Skeleton className="mb-4 size-12 rounded-2xl" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-9 w-32" />
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetDonutSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 w-full space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="relative flex h-64 w-full items-center justify-center">
        <Skeleton className="size-48 rounded-full border-[15px] border-slate-100 dark:border-slate-800" />
        <div className="absolute flex flex-col items-center gap-1">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="mt-6 w-full space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { expenses, fetchExpenses, isLoading } = useExpenseStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const totalExpenses = useMemo(() => 
    expenses.reduce((acc, t) => acc + t.amount, 0),
  [expenses]);

  const fixedExpenses = useMemo(() => 
    expenses
      .filter((t) => t.type === "fixed")
      .reduce((acc, t) => acc + t.amount, 0),
  [expenses]);

  const variableExpenses = useMemo(() => 
    expenses
      .filter((t) => t.type === "variable")
      .reduce((acc, t) => acc + t.amount, 0),
  [expenses]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { amount: number; color: string }> = {};
    const colors = [
      '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', 
      '#ec4899', '#f97316', '#3b82f6', '#64748b'
    ];
    
    expenses.forEach((ex, i) => {
      const cat = ex.category;
      if (!breakdown[cat]) {
        breakdown[cat] = { 
          amount: 0, 
          color: colors[Object.keys(breakdown).length % colors.length] 
        };
      }
      breakdown[cat].amount += ex.amount;
    });

    return Object.entries(breakdown).map(([category, data]) => ({
      category,
      amount: data.amount,
      color: data.color
    }));
  }, [expenses]);

  if (isLoading && expenses.length === 0) {
    return (
      <section className="space-y-10">
        {/* Hero Skeleton */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
              <Skeleton className="h-12 w-64 bg-white/10" />
              <Skeleton className="h-6 w-96 bg-white/10" />
            </div>
            <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
          </div>
        </div>

        {/* Stats Skeletons */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TransactionsSkeleton />
          </div>
          <div className="space-y-8">
            <BudgetDonutSkeleton />
            <Skeleton className="h-32 w-full rounded-[1.5rem]" />
          </div>
        </div>
      </section>
    );
  }

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
            <AddExpenseDialog />
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
            </div>
          </div>

          <RecentTransactions 
            transactions={filteredExpenses.slice(0, 20)} 
            hideGainIndicators={true}
            onViewAll={() => setIsModalOpen(true)}
          />

          <AllTransactionsModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-8">
          <BudgetDonut data={categoryBreakdown} />

          <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-bold text-slate-900 dark:text-slate-50">Smart Tip</h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {expenses.length > 0 
                ? "Keep tracking your expenses to get personalized AI insights on your spending habits."
                : "Add your first expense to see how Flowlary's AI can help you save more!"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
