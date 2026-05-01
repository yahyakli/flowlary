"use client";

import { formatCurrency } from "@/lib/mock-data";
import { Wallet, TrendingUp, PiggyBank, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryCardsProps {
  summary: {
    salary: number;
    initialBalance: number;
    extraIncome: number;
    fixedExpenses: number;
    variableExpenses: number;
    savingsContributions: number;
    savingsCategory: number;
    debtPayments: number;
    remaining: number;
    currency: string;
  };
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const totalInflow = summary.initialBalance + summary.salary + summary.extraIncome;
  const totalExpenses = summary.fixedExpenses + summary.variableExpenses + summary.debtPayments;

  const cards = [
    {
      title: "Salary",
      value: totalInflow,
      description: "Total available funds",
      icon: Wallet,
      color: "cyan",
    },
    {
      title: "All Expenses",
      value: totalExpenses,
      description: "Fixed & variable spending",
      icon: TrendingUp,
      color: "violet",
    },
    {
      title: "Goal Contributions",
      value: summary.savingsContributions,
      description: "Monthly target",
      icon: PiggyBank,
      color: "emerald",
    },
    {
      title: "Current Balance",
      value: summary.remaining,
      description: "Ready to spend",
      icon: DollarSign,
      color: "amber",
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
    cyan: {
      bg: "bg-cyan-100 dark:bg-cyan-500/10",
      icon: "text-cyan-600 dark:text-cyan-400",
      ring: "ring-cyan-500/20",
    },
    violet: {
      bg: "bg-violet-100 dark:bg-violet-500/10",
      icon: "text-violet-600 dark:text-violet-400",
      ring: "ring-violet-500/20",
    },
    emerald: {
      bg: "bg-emerald-100 dark:bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-100 dark:bg-amber-500/10",
      icon: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500/20",
    },
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = colorMap[card.color];

        return (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:border-slate-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600"
          >
            {/* Top gradient bar */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-${card.color}-500/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />

            <div className="flex items-start justify-between">
              <div className={`flex size-12 items-center justify-center rounded-2xl ${colors.bg}`}>
                <Icon className={`size-6 ${colors.icon}`} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {card.title}
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                {formatCurrency(card.value, summary.currency)}
              </p>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
