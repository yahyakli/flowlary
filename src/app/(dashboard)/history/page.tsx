"use client";

import { useEffect, useMemo, useState } from "react";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { formatCurrency } from "@/lib/mock-data";
import { Search, Calendar, Download, Filter, ChevronRight, FileJson, FileText } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useDebtStore } from "@/store/useDebtStore";
import { useSalaryStore } from "@/store/useSalaryStore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function HistorySkeleton() {
  return (
    <section className="space-y-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
            <Skeleton className="h-12 w-64 bg-white/10" />
            <Skeleton className="h-6 w-96 bg-white/10" />
          </div>
          <Skeleton className="h-12 w-36 rounded-2xl bg-white/10" />
        </div>
      </div>
      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-[1.5rem]" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-[300px] w-full rounded-[1.5rem]" />
        </div>
      </div>
    </section>
  );
}

const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function HistoryPage() {
  const { expenses, fetchExpenses, isLoading: expensesLoading } = useExpenseStore();
  const { goals, fetchGoals, isLoading: goalsLoading } = useGoalStore();
  const { debts, fetchDebts, isLoading: debtsLoading } = useDebtStore();
  const { salary, initialBalance, fetchSalary, isLoading: salaryLoading } = useSalaryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<6 | 12 | 0>(6); // 0 means all time

  useEffect(() => {
    fetchExpenses();
    fetchGoals();
    fetchDebts();
    fetchSalary();
  }, [fetchExpenses, fetchGoals, fetchDebts, fetchSalary]);

  const { chartData, sortedCycles, globalStats } = useMemo(() => {
    // Group expenses by year-month
    const expensesByMonth = expenses.reduce((acc, exp) => {
      const key = `${exp.year}-${exp.month}`;
      if (!acc[key]) {
        acc[key] = { year: exp.year, month: exp.month, total: 0, count: 0 };
      }
      acc[key].total += exp.amount;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { year: number; month: number; total: number; count: number }>);

    // Convert to array and sort descending (newest first)
    const cycles = Object.values(expensesByMonth).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // Chart Data (oldest to newest for the selected range)
    const now = new Date();
    const data = [];
    const monthsToShow = timeRange === 0 ? Math.max(6, cycles.length) : timeRange;

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      const key = `${year}-${month}`;
      
      data.push({
        month: shortMonthNames[month - 1],
        amount: expensesByMonth[key]?.total || 0,
      });
    }

    // Global Stats
    let highestMonth = { name: "N/A", amount: 0 };
    let lowestMonth = { name: "N/A", amount: Infinity };

    cycles.forEach((cycle) => {
      if (cycle.total > highestMonth.amount) {
        highestMonth = { name: `${monthNames[cycle.month - 1]} ${cycle.year}`, amount: cycle.total };
      }
      if (cycle.total < lowestMonth.amount && cycle.total > 0) {
        lowestMonth = { name: `${monthNames[cycle.month - 1]} ${cycle.year}`, amount: cycle.total };
      }
    });

    if (lowestMonth.amount === Infinity) lowestMonth.amount = 0;

    const lifetimeSavings = goals.reduce((acc, g) => acc + g.savedAmount, 0);

    return {
      chartData: data,
      sortedCycles: cycles,
      globalStats: {
        highestMonth,
        lowestMonth,
        lifetimeSavings,
      },
    };
  }, [expenses, goals, timeRange]);

  const filteredCycles = useMemo(() => {
    return sortedCycles.filter((c) => {
      const name = `${monthNames[c.month - 1]} ${c.year}`.toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    });
  }, [sortedCycles, searchQuery]);

  const handleExport = (format: "json" | "csv") => {
    try {
      if (format === "json") {
        const exportData = {
          profile: { salary, initialBalance },
          expenses,
          goals,
          debts,
          exportDate: new Date().toISOString(),
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `flowlary-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // CSV Export for expenses
        const headers = ["Date", "Title", "Category", "Amount", "Type", "Note"];
        const rows = expenses.map((e) => [
          new Date(e.createdAt || "").toLocaleDateString(),
          `"${e.title.replace(/"/g, '""')}"`,
          e.category,
          e.amount,
          e.type,
          `"${(e.note || "").replace(/"/g, '""')}"`,
        ]);

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `flowlary-expenses-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error("Failed to export data");
    }
  };

  const isLoading = expensesLoading || goalsLoading || debtsLoading || salaryLoading;

  if (isLoading && expenses.length === 0) {
    return <HistorySkeleton />;
  }

  return (
    <section className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 ring-1 ring-blue-400/20">
              <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
              Financial Records
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              History
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Review your past performance and see how your habits have evolved.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95">
                  <Download className="size-4" />
                  Export Data
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2">
                <DropdownMenuItem onClick={() => handleExport("csv")} className="flex items-center gap-2 rounded-xl cursor-pointer py-2.5 focus:bg-slate-100 dark:focus:bg-slate-900">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-50">CSV File</span>
                    <span className="text-[10px] text-slate-500">Expenses only</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")} className="flex items-center gap-2 rounded-xl cursor-pointer py-2.5 focus:bg-slate-100 dark:focus:bg-slate-900">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    <FileJson className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-50">JSON File</span>
                    <span className="text-[10px] text-slate-500">All account data</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Spending Trend Section */}
      <div>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Spending over time</h3>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950 w-max">
            <button
              onClick={() => setTimeRange(6)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                timeRange === 6
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeRange(12)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                timeRange === 12
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
              }`}
            >
              1 Year
            </button>
            <button
              onClick={() => setTimeRange(0)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                timeRange === 0
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
        <SpendingChart data={chartData} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Past Salary Cycles</h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cycles (e.g. March 2026)"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCycles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-950">
                  <Calendar className="size-8" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">No cycles found matching your criteria.</p>
              </div>
            ) : (
              filteredCycles.map((cycle) => (
                <div
                  key={`${cycle.year}-${cycle.month}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <Calendar className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-50">
                        {monthNames[cycle.month - 1]} {cycle.year}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {cycle.count} transactions recorded
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <p className="text-lg sm:text-sm font-bold text-slate-900 dark:text-slate-50">
                        {formatCurrency(cycle.total)}
                      </p>
                      <p className="text-xs text-slate-500">Total Spent</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Global Stats</h3>
          <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-500">Highest spending month</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{globalStats.highestMonth.name}</p>
                <p className="text-sm text-rose-500">{formatCurrency(globalStats.highestMonth.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Lowest spending month</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{globalStats.lowestMonth.name}</p>
                <p className="text-sm text-emerald-500">{formatCurrency(globalStats.lowestMonth.amount)}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Lifetime Savings</p>
                <p className="text-2xl font-black text-blue-500">{formatCurrency(globalStats.lifetimeSavings)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
