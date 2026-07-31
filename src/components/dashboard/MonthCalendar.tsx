import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils/currency";

interface MonthCalendarProps {
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  monthlyData: Record<string, { income: number; expenses: number; net: number }>;
}

function generateMonthRange() {
  const now = new Date();
  const months: { value: string; label: string; date: Date }[] = [];
  for (let i = -12; i < 6; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en", { month: "short", year: "numeric" });
    months.push({ value, label, date: d });
  }
  return months;
}

export function MonthCalendar({ selectedMonth, onSelectMonth, monthlyData }: MonthCalendarProps) {
  const months = useMemo(() => generateMonthRange(), []);
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Month Calendar</h3>
      <p className="mt-1 text-sm text-slate-500">Click any month to view details. Past months show history, future months are available for planning.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {months.map((month) => {
          const isSelected = selectedMonth === month.value;
          const isCurrentMonth = month.value === currentMonthValue;
          const isFuture = month.date > now;
          const isPast = month.date < new Date(now.getFullYear(), now.getMonth(), 1);
          const data = monthlyData[month.value];
          const hasData = data && (data.income > 0 || data.expenses > 0);

          return (
            <button
              key={month.value}
              onClick={() => onSelectMonth(month.value)}
              className={`
                relative flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all
                ${isSelected
                  ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/30"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                }
                ${isFuture ? "opacity-70" : ""}
                ${isPast && !hasData ? "opacity-60" : ""}
              `}
            >
              {isCurrentMonth && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Current
                </span>
              )}

              <span className={`text-xs font-medium ${isSelected ? "text-brand-700 dark:text-brand-300" : "text-slate-600 dark:text-slate-400"}`}>
                {month.label}
              </span>

              {hasData ? (
                <div className="mt-2 w-full space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-600 dark:text-emerald-400">In</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(data.income)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-rose-600 dark:text-rose-400">Out</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(data.expenses)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] border-t border-slate-200 dark:border-slate-700 pt-1">
                    <span className="text-slate-500">Net</span>
                    <span className={`font-semibold ${data.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {formatCurrency(data.net)}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                  {isFuture ? "Plan ahead" : isPast ? "No data" : "Add income"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}