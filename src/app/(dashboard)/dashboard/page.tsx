import Link from "next/link";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SavingsGoalsProgress } from "@/components/dashboard/SavingsGoalsProgress";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import {
  mockSummary,
  mockMonthlySpending,
  mockCategoryBreakdown,
  mockHealthMetrics,
  mockRecentTransactions,
  mockSavingsGoals,
} from "@/lib/mock-data";
import { Plus, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
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

          <div className="flex gap-3">
            <Link
              href="/expenses"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 hover:bg-cyan-400 hover:shadow-cyan-400/30 active:scale-95"
            >
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Add Expense
            </Link>
            <Link
              href="/history"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20 active:scale-95"
            >
              View History
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={mockSummary} />

      {/* Section: Budget Overview */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Budget Status</h2>
        <BudgetOverview summary={mockSummary} />
      </div>

      {/* Section: Spending Trends */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Spending Trends</h2>
        <SpendingChart data={mockMonthlySpending} />
      </div>

      {/* Section: Expense Breakdown */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Expense Breakdown</h2>
        <BudgetDonut data={mockCategoryBreakdown} />
      </div>

      {/* Section: Transactions & Insights */}
      <div className="grid gap-8 xl:grid-cols-3">
        {/* Recent Transactions - 2/3 width */}
        <div className="xl:col-span-2">
          <RecentTransactions transactions={mockRecentTransactions} />
        </div>

        {/* AI Insights - 1/3 width, fixed/sticky */}
        <div className="xl:col-span-1">
          <div className="sticky top-8">
            <AIInsightCard />
          </div>
        </div>
      </div>

      {/* Section: Goals & Health (side by side on large screens) */}
      <div className="grid gap-8 lg:grid-cols-2">
        <SavingsGoalsProgress goals={mockSavingsGoals} />
        <HealthScore metrics={mockHealthMetrics} />
      </div>
    </section>
  );
}
