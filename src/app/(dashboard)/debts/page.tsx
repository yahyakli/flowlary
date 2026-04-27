"use client";

import { useEffect, useMemo } from "react";
import {
  Plus,
  CreditCard,
  AlertCircle,
  TrendingDown,
  Calendar,
  Pencil,
  Trash2,
  Landmark,
  Percent,
} from "lucide-react";
import { useDebtStore } from "@/store/useDebtStore";
import { AddDebtDialog } from "@/components/debts/AddDebtDialog";
import { DebtsSkeleton } from "@/components/debts/DebtsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatCurrency as formatCurrencyMock } from "@/lib/mock-data";

function DebtStatsSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
      <Skeleton className="mb-4 size-12 rounded-2xl" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-9 w-32" />
    </div>
  );
}

export default function DebtsPage() {
  const { debts, fetchDebts, deleteDebt, isLoading } = useDebtStore();

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const stats = useMemo(() => {
    const totalDebt = debts.reduce((acc, d) => acc + d.remainingAmount, 0);
    const totalMonthly = debts.reduce((acc, d) => acc + d.monthlyPayment, 0);
    const avgInterest = debts.length
      ? debts.reduce((acc, d) => acc + d.interestRate, 0) / debts.length
      : 0;
    const activeDebts = debts.filter((d) => !d.isCompleted).length;

    return { totalDebt, totalMonthly, avgInterest, activeDebts };
  }, [debts]);

  if (isLoading && debts.length === 0) {
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DebtStatsSkeleton />
          <DebtStatsSkeleton />
          <DebtStatsSkeleton />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-6 w-32" />
            <DebtsSkeleton />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-[2rem]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-orange-600/20 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-rose-400 ring-1 ring-rose-400/20">
              <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
              Debt Clearance
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Manage Debts
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Track your repayments and work towards financial freedom.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <AddDebtDialog />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <CreditCard className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Outstanding</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrencyMock(stats.totalDebt)}
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            <TrendingDown className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Commitment</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrencyMock(stats.totalMonthly)}
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Interest Rate</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            {stats.avgInterest.toFixed(2)}%
          </h3>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Active Debts</h3>

          {debts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-950">
                <CreditCard className="size-8" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">No active debts found. That&apos;s great news!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => {
                const id = debt._id ? (debt._id as any).toString() : Math.random().toString();
                const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;
                const monthsLeft = debt.monthlyPayment > 0
                  ? Math.ceil(debt.remainingAmount / debt.monthlyPayment)
                  : Infinity;

                return (
                  <div
                    key={id}
                    className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-50">{debt.title}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Landmark className="size-3.5" />
                            {debt.lender}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Percent className="size-3.5" />
                            {debt.interestRate}% APR
                          </span>
                          {debt.dueDay && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="size-3.5" />
                              Due: {debt.dueDay}th
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 dark:text-slate-50">
                          {formatCurrencyMock(debt.remainingAmount)}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          of {formatCurrencyMock(debt.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {progress.toFixed(0)}% Paid Off
                        </span>
                        <span className="text-slate-500">
                          {formatCurrencyMock(debt.totalAmount - debt.remainingAmount)} paid
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatCurrencyMock(debt.monthlyPayment)}/mo
                          {monthsLeft !== Infinity && (
                            <span className="ml-1.5 text-slate-500">
                              · ~{monthsLeft} month{monthsLeft !== 1 ? "s" : ""} left
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <AddDebtDialog
                          debt={debt}
                          trigger={
                            <button className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                              <Pencil className="size-4" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => {
                            toast.warning("Delete this debt?", {
                              description: "This action cannot be undone.",
                              action: {
                                label: "Delete",
                                onClick: () => deleteDebt(id),
                              },
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Summary */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Debt Summary</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Active Debts</p>
                <p className="mt-1 text-2xl font-black text-rose-500">{stats.activeDebts}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Total Paid So Far</p>
                <p className="mt-1 text-2xl font-black text-emerald-500">
                  {formatCurrencyMock(
                    debts.reduce((acc, d) => acc + (d.totalAmount - d.remainingAmount), 0)
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Estimated Payoff</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {stats.totalMonthly > 0
                    ? `~${Math.ceil(stats.totalDebt / stats.totalMonthly)} months at current rate`
                    : "Add monthly payments to estimate"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-bold text-slate-900 dark:text-slate-50">Smart Tip</h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {debts.length > 0
                ? "Focus on debts with the highest interest rate first (Avalanche Method) to minimize total interest paid."
                : "No active debts — you're in great shape! Keep building your savings."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
