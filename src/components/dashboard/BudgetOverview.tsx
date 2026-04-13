"use client";

import { formatCurrency } from "@/lib/mock-data";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface BudgetOverviewProps {
  summary: {
    salary: number;
    fixedExpenses: number;
    variableExpenses: number;
    savingsContributions: number;
    debtPayments: number;
    remaining: number;
    currency: string;
  };
}

export function BudgetOverview({ summary }: BudgetOverviewProps) {
  const totalExpenses = summary.fixedExpenses + summary.variableExpenses + summary.savingsContributions + summary.debtPayments;
  const budgetUsed = (totalExpenses / summary.salary) * 100;
  const isOverBudget = totalExpenses > summary.salary;

  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Budget Overview</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            How you're tracking this month
          </p>
        </div>
        {isOverBudget ? (
          <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 dark:bg-red-500/10">
            <AlertCircle className="size-5 text-red-500" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">Over Budget</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 dark:bg-emerald-500/10">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">On Track</span>
          </div>
        )}
      </div>

      {/* Budget bar */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {formatCurrency(totalExpenses)} spent
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            {formatCurrency(summary.salary)}
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : budgetUsed > 80
                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600"
            }`}
            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-slate-600 dark:text-slate-400">
          {budgetUsed.toFixed(1)}% of salary allocated
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-400">Fixed Expenses</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {formatCurrency(summary.fixedExpenses)}
              </p>
            </div>
            <div className="rounded-full bg-cyan-100 px-3 py-1.5 dark:bg-cyan-500/10">
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                {((summary.fixedExpenses / summary.salary) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-400">Variable Spending</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {formatCurrency(summary.variableExpenses)}
              </p>
            </div>
            <div className="rounded-full bg-violet-100 px-3 py-1.5 dark:bg-violet-500/10">
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {((summary.variableExpenses / summary.salary) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-400">Savings</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {formatCurrency(summary.savingsContributions)}
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1.5 dark:bg-emerald-500/10">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {((summary.savingsContributions / summary.salary) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-400">Debt Payments</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {formatCurrency(summary.debtPayments)}
              </p>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1.5 dark:bg-amber-500/10">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {((summary.debtPayments / summary.salary) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
