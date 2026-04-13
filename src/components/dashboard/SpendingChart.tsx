"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MonthlySpending, formatCurrency, getSpendingTrend } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SpendingChartProps {
  data: MonthlySpending[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  const trend = getSpendingTrend(data);
  const lastMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2];
  const change = lastMonth && prevMonth
    ? ((lastMonth.amount - prevMonth.amount) / prevMonth.amount) * 100
    : 0;

  const trendConfig = {
    up: { icon: TrendingUp, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", label: "Increased" },
    down: { icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Decreased" },
    stable: { icon: Minus, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10", label: "Stable" },
  };

  const trendInfo = trendConfig[trend];
  const TrendIcon = trendInfo.icon;

  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Monthly Spending</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Last 6 months overview</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${trendInfo.bg}`}>
          <TrendIcon className={`size-4 ${trendInfo.color}`} />
          <span className={`text-xs font-semibold ${trendInfo.color}`}>
            {Math.abs(change).toFixed(1)}% {trendInfo.label}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            dx={-8}
          />
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
          <Bar
            dataKey="amount"
            fill="#06b6d4"
            radius={[10, 10, 0, 0]}
            maxBarSize={56}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
