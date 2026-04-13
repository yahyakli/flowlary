"use client";

import { RecentTransaction, formatCurrency } from "@/lib/mock-data";
import {
  Home,
  ShoppingCart,
  Banknote,
  Car,
  Tv,
  Utensils,
  Wifi,
  Pill,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

const iconMap: Record<string, React.ElementType> = {
  Home,
  ShoppingCart,
  Banknote,
  Car,
  Tv,
  Utensils,
  Wifi,
  Pill,
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Recent Transactions</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Latest activity this month
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.slice(0, 6).map((transaction) => {
          const Icon = iconMap[transaction.icon] || ShoppingCart;
          const isIncome = transaction.amount > 0;
          const categoryColors: Record<string, string> = {
            Income: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            Housing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
            Food: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            Transport: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
            Subscriptions: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
            Utilities: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
            Healthcare: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
          };

          return (
            <div
              key={transaction.id}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-3 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-950/50"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  categoryColors[transaction.category] || "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Icon className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-slate-50">
                  {transaction.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {transaction.date} · {transaction.category}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isIncome ? (
                  <ArrowUpRight className="size-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="size-4 text-slate-500 dark:text-slate-400" />
                )}
                <span
                  className={`font-semibold ${
                    isIncome
                      ? "text-emerald-500"
                      : "text-slate-900 dark:text-slate-50"
                  }`}
                >
                  {isIncome ? "+" : ""}
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
