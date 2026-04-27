"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SavingsGoalsProgress } from "@/components/dashboard/SavingsGoalsProgress";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { SetSalaryDialog } from "@/components/dashboard/SetSalaryDialog";
import { AddIncomeDialog } from "@/components/dashboard/AddIncomeDialog";
import { useSalaryStore } from "@/store/useSalaryStore";
import { useExpenseStore } from "@/store/useExpenseStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useDebtStore } from "@/store/useDebtStore";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlySpending, CategoryBreakdown, HealthMetrics } from "@/lib/mock-data";
import { Plus, Coins } from "lucide-react";

// Category colors for the donut chart
const CATEGORY_COLORS: Record<string, string> = {
  housing: "#06b6d4",
  food: "#10b981",
  transportation: "#8b5cf6",
  utilities: "#f59e0b",
  subscriptions: "#ec4899",
  entertainment: "#f97316",
  healthcare: "#3b82f6",
  education: "#0ea5e9",
  insurance: "#14b8a6",
  personal: "#a855f7",
  debt: "#ef4444",
  savings: "#22c55e",
  miscellaneous: "#64748b",
};

function DashboardSkeleton() {
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
          <div className="grid w-full grid-cols-1 gap-4 sm:w-auto sm:grid-cols-3">
            <Skeleton className="h-16 w-full rounded-2xl bg-white/10" />
            <Skeleton className="h-16 w-full rounded-2xl bg-white/10" />
            <Skeleton className="h-16 w-full rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <div className="flex items-start justify-between">
              <Skeleton className="size-12 rounded-2xl" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>

      {/* Budget Overview Skeleton */}
      <div>
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="mb-2 h-4 w-full rounded-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Charts & Transactions Skeleton */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-[400px] rounded-[1.5rem]" />
        <Skeleton className="h-[400px] rounded-[1.5rem]" />
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { salary, initialBalance, fetchSalary, isLoading: salaryLoading } = useSalaryStore();
  const { expenses, fetchExpenses, isLoading: expensesLoading } = useExpenseStore();
  const { goals, fetchGoals, isLoading: goalsLoading } = useGoalStore();
  const { debts, fetchDebts, isLoading: debtsLoading } = useDebtStore();

  // Fetch all data on mount
  useEffect(() => {
    fetchSalary();
    fetchExpenses();
    fetchGoals();
    fetchDebts();
  }, [fetchSalary, fetchExpenses, fetchGoals, fetchDebts]);

  // Compute the financial summary from real data
  const summary = useMemo(() => {
    const fixedExpenses = expenses
      .filter((e) => e.type === "fixed")
      .reduce((acc, e) => acc + e.amount, 0);

    const variableExpenses = expenses
      .filter((e) => e.type === "variable")
      .reduce((acc, e) => acc + e.amount, 0);

    const savingsContributions = goals.reduce(
      (acc, g) => acc + g.monthlyContribution,
      0
    );

    const debtPayments = debts
      .filter((d) => !d.isCompleted)
      .reduce((acc, d) => acc + d.monthlyPayment, 0);

    const totalIncome = salary + initialBalance;
    const totalCommitments = fixedExpenses + variableExpenses + savingsContributions + debtPayments;
    const remaining = totalIncome - totalCommitments;

    return {
      salary: totalIncome,
      fixedExpenses,
      variableExpenses,
      savingsContributions,
      debtPayments,
      remaining: Math.max(remaining, 0),
      currency: "MAD",
    };
  }, [salary, initialBalance, expenses, goals, debts]);

  // Compute category breakdown for the donut chart from real expenses
  const categoryBreakdown: CategoryBreakdown[] = useMemo(() => {
    const breakdown: Record<string, number> = {};

    expenses.forEach((ex) => {
      const cat = ex.category;
      breakdown[cat] = (breakdown[cat] || 0) + ex.amount;
    });

    return Object.entries(breakdown)
      .map(([category, amount]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount,
        color: CATEGORY_COLORS[category.toLowerCase()] || "#64748b",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Compute monthly spending data for the last 6 months from real expenses
  const monthlySpending: MonthlySpending[] = useMemo(() => {
    const now = new Date();
    const months: MonthlySpending[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1; // 1-12
      const year = d.getFullYear();

      const total = expenses
        .filter((e) => e.month === month && e.year === year)
        .reduce((acc, e) => acc + e.amount, 0);

      months.push({
        month: monthNames[d.getMonth()],
        amount: total,
      });
    }

    return months;
  }, [expenses]);

  // Compute health metrics from real data
  const healthMetrics: HealthMetrics = useMemo(() => {
    const totalExpenses = summary.fixedExpenses + summary.variableExpenses;
    const totalDebtPayments = summary.debtPayments;

    // Savings rate: monthly savings contributions as % of salary
    const savingsRate = summary.salary > 0
      ? (summary.savingsContributions / summary.salary) * 100
      : 0;

    // Debt-to-income ratio: monthly debt payments as % of salary
    const debtToIncomeRatio = summary.salary > 0
      ? (totalDebtPayments / summary.salary) * 100
      : 0;

    // Budget adherence: how much of salary is NOT overspent (capped at 100)
    const totalCommitments = totalExpenses + summary.savingsContributions + totalDebtPayments;
    const budgetAdherence = summary.salary > 0
      ? Math.min(Math.round(((summary.salary - totalCommitments) / summary.salary) * 100 + 100), 100)
      : 100;

    // Emergency fund: if any goal has "emergency" in the title and is > 50% funded
    const hasEmergencyFund = goals.some(
      (g) =>
        g.title.toLowerCase().includes("emergency") &&
        g.savedAmount >= g.targetAmount * 0.5
    );

    return {
      savingsRate: Math.round(savingsRate * 10) / 10,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
      budgetAdherence: Math.max(budgetAdherence, 0),
      hasEmergencyFund,
    };
  }, [summary, goals]);

  // Recent transactions: map expenses for the RecentTransactions component
  const recentTransactions = useMemo(() => {
    return expenses.slice(0, 8).map((e) => ({
      id: (e._id as any)?.toString(),
      _id: e._id,
      title: e.title,
      category: e.category,
      amount: -e.amount, // negative for expenses
      type: e.type,
      createdAt: e.createdAt,
      note: e.note,
      month: e.month,
      year: e.year,
      isRecurring: e.isRecurring,
      tags: e.tags,
      dueDay: e.dueDay,
    }));
  }, [expenses]);

  const isInitialLoading =
    salaryLoading && expensesLoading && goalsLoading && debtsLoading;

  if (isInitialLoading && expenses.length === 0 && goals.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <section className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        {/* Background orbs */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[80px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 ring-1 ring-cyan-400/20">
              <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
              Dashboard Overview
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Your Finance Hub
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Personalized insights and proactive advice for your current salary cycle.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 sm:w-auto sm:grid-cols-3">
            <SetSalaryDialog />
            <AddIncomeDialog />

            <Link
              href="/expenses"
              className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 transition-all hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-900/20"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400">
                <Plus className="size-5 transition-transform group-hover:rotate-90" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Spending</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">Add Expense</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Section: Budget Overview */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Budget Status</h2>
        <BudgetOverview summary={summary} />
      </div>

      {/* Section: Spending Trends & Category Breakdown */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Spending Trends</h2>
          <SpendingChart data={monthlySpending} />
        </div>
        <div>
          <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Expense Breakdown</h2>
          {categoryBreakdown.length > 0 ? (
            <BudgetDonut data={categoryBreakdown} />
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-sm text-slate-500">Add expenses to see your category breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Section: Transactions */}
      <div>
        <RecentTransactions transactions={recentTransactions} />
      </div>

      {/* Section: Goals & Health (side by side on large screens) */}
      <div className="grid gap-8 lg:grid-cols-2">
        <SavingsGoalsProgress goals={goals} />
        <HealthScore metrics={healthMetrics} />
      </div>
    </section>
  );
}
