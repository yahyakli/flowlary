"use client";

import { SavingsGoalsProgress } from "@/components/dashboard/SavingsGoalsProgress";
import {
  mockSavingsGoals,
  formatCurrency,
} from "@/lib/mock-data";
import { Plus, Target, TrendingUp, Calendar, Trophy } from "lucide-react";

export default function GoalsPage() {
  const totalSaved = mockSavingsGoals.reduce((acc, g) => acc + g.savedAmount, 0);
  const totalTarget = mockSavingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const monthlyTotal = mockSavingsGoals.reduce((acc, g) => acc + g.monthlyContribution, 0);
  const averageProgress = (totalSaved / totalTarget) * 100;

  return (
    <section className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-pink-600/20 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-violet-400 ring-1 ring-violet-400/20">
              <span className="size-2 rounded-full bg-violet-400 animate-pulse" />
              Financial Aspirations
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Savings Goals
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Dream big, plan small. Track your journey towards financial freedom.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-105 hover:bg-violet-400 hover:shadow-violet-400/30 active:scale-95">
              <Plus className="size-4" />
              New Goal
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <Trophy className="size-5" />
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Saved</p>
          <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrency(totalSaved)}
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
            <Target className="size-5" />
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Overall Progress</p>
          <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-50">
            {averageProgress.toFixed(1)}%
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <TrendingUp className="size-5" />
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Monthly Contribution</p>
          <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrency(monthlyTotal)}
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
            <Calendar className="size-5" />
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active Goals</p>
          <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-50">
            {mockSavingsGoals.length}
          </h3>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2">
          <SavingsGoalsProgress goals={mockSavingsGoals} />
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">AI Strategy</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Increase Velocity</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  By cutting your &quot;Entertainment&quot; budget by 50 MAD, you can reach your &quot;Vacation&quot; goal 2 months earlier.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">High Interest First</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Focus on your &quot;Emergency Fund&quot; before increasing contributions to &quot;New Laptop&quot; for better stability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
