"use client";

import { HealthMetrics, calculateHealthScore } from "@/lib/mock-data";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface HealthScoreProps {
  metrics: HealthMetrics;
}

export function HealthScore({ metrics }: HealthScoreProps) {
  const score = calculateHealthScore(metrics);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: "text-emerald-500", ring: "stroke-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Excellent" };
    if (score >= 60) return { color: "text-cyan-500", ring: "stroke-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10", label: "Good" };
    if (score >= 40) return { color: "text-amber-500", ring: "stroke-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", label: "Fair" };
    return { color: "text-red-500", ring: "stroke-red-500", bg: "bg-red-50 dark:bg-red-500/10", label: "Needs Work" };
  };

  const scoreConfig = getScoreColor(score);
  const Icon = score >= 60 ? ShieldCheck : score >= 40 ? Shield : ShieldAlert;

  // Circle circumference = 2 * PI * r (r=45)
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Financial Health</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Overall financial wellbeing score
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <svg className="size-32 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className={scoreConfig.ring}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className={`size-6 ${scoreConfig.color}`} />
            <span className={`mt-1 text-2xl font-black ${scoreConfig.color}`}>
              {score}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="text-center">
          <p className={`text-lg font-bold ${scoreConfig.color}`}>
            {scoreConfig.label}
          </p>
        </div>

        <div className="w-full space-y-3 rounded-2xl bg-slate-100 p-4 dark:bg-slate-950/50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-400">Savings Rate</span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">{metrics.savingsRate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-400">Debt-to-Income</span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">{metrics.debtToIncomeRatio}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-400">Budget Adherence</span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">{metrics.budgetAdherence}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-400">Emergency Fund</span>
            <span className={`font-semibold ${metrics.hasEmergencyFund ? "text-emerald-500" : "text-slate-600 dark:text-slate-400"}`}>
              {metrics.hasEmergencyFund ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
