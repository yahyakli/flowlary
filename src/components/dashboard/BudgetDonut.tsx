"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CategoryBreakdown, formatCurrency } from "@/lib/mock-data";

interface BudgetDonutProps {
  data: CategoryBreakdown[];
}

export function BudgetDonut({ data }: BudgetDonutProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Expense Breakdown</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Spending by category this month
        </p>
      </div>

      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start">
        <div className="w-full flex-1">
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={130}
                paddingAngle={6}
                dataKey="amount"
                strokeWidth={3}
                stroke="hsl(0 0% 100%)"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => typeof value === 'number' ? formatCurrency(value) : String(value)}
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(214.3 31.8% 85%)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.12)',
                  fontSize: '13px',
                  color: '#1e293b',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full max-w-xs flex-1 space-y-4 rounded-2xl bg-slate-100 p-6 dark:bg-slate-950/50">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">Categories</p>
          {data.map((item) => {
            const percentage = ((item.amount / total) * 100).toFixed(1);
            return (
              <div key={item.category} className="flex items-center gap-3">
                <div
                  className="size-3.5 shrink-0 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-sm text-slate-800 dark:text-slate-300">
                  {item.category}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {formatCurrency(item.amount)}
                </span>
                <span className="w-12 text-right text-xs font-medium text-slate-600 dark:text-slate-400">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
