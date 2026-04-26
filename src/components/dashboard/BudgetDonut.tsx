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
    <div className="flex flex-col items-center rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 w-full text-center lg:text-left">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Category Breakdown</h3>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Monthly spending distribution
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        <div className="relative flex h-64 w-full items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={1}
                dataKey="amount"
                nameKey="category"
                strokeWidth={2}
                stroke="transparent"
                label={({ name }) => name?.charAt(0).toUpperCase()}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-50">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
          {data.map((item) => {
            const percentage = ((item.amount / total) * 100).toFixed(0);
            return (
              <div key={item.category} className="flex items-center gap-2">
                <div
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-50">
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
