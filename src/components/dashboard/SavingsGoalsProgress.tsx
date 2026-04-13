"use client";

import { SavingsGoal, formatCurrency, monthsToGoal } from "@/lib/mock-data";
import {
  Shield,
  Plane,
  Laptop,
  Car,
  Home,
  Target,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface SavingsGoalsProgressProps {
  goals: SavingsGoal[];
}

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Plane,
  Laptop,
  Car,
  Home,
  Target,
};

const colorMap: Record<string, { bg: string; fill: string; text: string; ring: string }> = {
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-500/10",
    fill: "bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
    ring: "ring-cyan-500/20",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-500/10",
    fill: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/20",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    fill: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-500/10",
    fill: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-500/10",
    fill: "bg-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    ring: "ring-pink-500/20",
  },
};

export function SavingsGoalsProgress({ goals }: SavingsGoalsProgressProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Savings Goals</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Track your progress towards financial targets
        </p>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => {
          const Icon = iconMap[goal.icon] || Target;
          const colors = colorMap[goal.color] || colorMap.cyan;
          const progress = (goal.savedAmount / goal.targetAmount) * 100;
          const months = monthsToGoal(goal);
          const remaining = goal.targetAmount - goal.savedAmount;

          return (
            <div
              key={goal.id}
              className="rounded-2xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-950/50"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${colors.bg}`}>
                    <Icon className={`size-5 ${colors.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {goal.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${colors.text}`}>
                    {progress.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${colors.fill} transition-all duration-500`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  <span>
                    {months === Infinity
                      ? "No timeline"
                      : `${months} month${months !== 1 ? "s" : ""} left`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" />
                  <span>{formatCurrency(goal.monthlyContribution)}/mo</span>
                </div>
                <div className="ml-auto font-medium">
                  {formatCurrency(remaining)} remaining
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
