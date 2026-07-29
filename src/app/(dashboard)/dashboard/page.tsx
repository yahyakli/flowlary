"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryBreakdownChart, MonthlyTrendChart } from "@/components/dashboard/DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";

interface DashboardSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  expenseByCategory: Record<string, number>;
  savingsRate: number;
}

interface TrendPoint {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

function monthOptions() {
  const now = new Date();
  const options: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en", { month: "short", year: "numeric" });
    options.push(`${value}:${label}`);
  }
  return options;
}

function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const months = monthOptions();
    const latestMonth = months[0]?.split(":")[0] ?? "";
    setSelectedMonth(latestMonth);
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [summaryResponse, trendResponse] = await Promise.all([
          fetch(`/api/dashboard?month=${selectedMonth}`),
          fetch(`/api/dashboard/trend?months=6`),
        ]);

        if (!summaryResponse.ok || !trendResponse.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const summaryData = await summaryResponse.json();
        const trendData = await trendResponse.json();

        setSummary(summaryData);
        setTrend(trendData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
        setSummary(null);
        setTrend([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [selectedMonth]);

  const categoryData = useMemo(() => {
    if (!summary?.expenseByCategory) return [];

    return Object.entries(summary.expenseByCategory)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: ["#f97316", "#8b5cf6", "#14b8a6", "#0ea5e9", "#64748b"][Math.abs(name.length) % 5],
      }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  const monthOptionsList = monthOptions();

  const stats = [
    {
      label: "Total Income",
      value: summary ? formatCurrency(summary.totalIncome) : "—",
      hint: "Income captured for the selected month",
    },
    {
      label: "Total Expenses",
      value: summary ? formatCurrency(summary.totalExpenses) : "—",
      hint: "Spending for the selected month",
    },
    {
      label: "Net Balance",
      value: summary ? formatCurrency(summary.netBalance) : "—",
      hint: "Income minus expenses",
    },
    {
      label: "Savings Rate",
      value: summary ? `${Math.round(summary.savingsRate * 100)}%` : "—",
      hint: "Share of income retained",
    },
  ];

  if (loading && !summary) {
    return (
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <Skeleton className="h-8 w-48" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-[2rem]" />
          <Skeleton className="h-[320px] rounded-[2rem]" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Finance snapshot</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">Dashboard overview</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Review the selected month’s performance and the last six months of momentum.
            </p>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Month
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none ring-0 focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800"
            >
              {monthOptionsList.map((entry) => {
                const [value, label] = entry.split(":");
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Category breakdown</h2>
              <p className="mt-1 text-sm text-slate-500">Spending distribution for {selectedMonth}</p>
            </div>
          </div>
          <div className="mt-4">
            {categoryData.length > 0 ? (
              <CategoryBreakdownChart data={categoryData} />
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
                No spending categories recorded for this month yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Last 6 months</h2>
              <p className="mt-1 text-sm text-slate-500">Income and expenses over time</p>
            </div>
          </div>
          <div className="mt-4">
            {trend.length > 0 ? (
              <MonthlyTrendChart data={trend} />
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
                No historical snapshot data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
