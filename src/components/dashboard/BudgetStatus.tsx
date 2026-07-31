"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";
import type { BudgetStatus as BudgetStatusItem } from "@/store/useBudgetStore";

interface BudgetStatusProps {
  month: string;
}

function statusColor(status: BudgetStatusItem["status"]): string {
  switch (status) {
    case "over":
      return "bg-gradient-to-r from-red-500 to-red-600";
    case "warning":
      return "bg-gradient-to-r from-amber-500 to-amber-600";
    default:
      return "bg-gradient-to-r from-emerald-500 to-emerald-600";
  }
}

function statusBadge(status: BudgetStatusItem["status"]): { label: string; className: string } {
  switch (status) {
    case "over":
      return {
        label: "Over Limit",
        className: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      };
    case "warning":
      return {
        label: "Approaching Limit",
        className: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      };
    default:
      return {
        label: "On Track",
        className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      };
  }
}

export function BudgetStatus({ month }: BudgetStatusProps) {
  const [statuses, setStatuses] = useState<BudgetStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!month) return;

    async function loadBudgetStatus() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/budgets/status?month=${month}`);
        if (!response.ok) {
          throw new Error("Unable to load budget status.");
        }

        const data = await response.json();
        setStatuses(data.budgets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load budget status.");
        setStatuses([]);
      } finally {
        setLoading(false);
      }
    }

    loadBudgetStatus();
  }, [month]);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Budget Status
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Per-category spending vs. monthly limit
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          {error}
        </div>
      ) : statuses.length === 0 ? (
        <div className="mt-4 flex h-[120px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
          No budgets set for any category yet.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {statuses.map((item) => {
            const badge = statusBadge(item.status);
            const barWidth = Math.min(item.percentage, 100);

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {formatCurrency(item.spent)} / {formatCurrency(item.monthlyLimit)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${statusColor(
                      item.status
                    )}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                  <span>
                    {item.percentage.toFixed(1)}% used
                  </span>
                  <span>
                    {item.remaining >= 0
                      ? `${formatCurrency(item.remaining)} remaining`
                      : `${formatCurrency(Math.abs(item.remaining))} over limit`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}