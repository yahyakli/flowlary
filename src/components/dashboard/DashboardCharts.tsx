import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, CartesianGrid, LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts'

export function CategoryBreakdownChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
        No category data yet.
      </div>
    )
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyTrendChart({ data }: { data: Array<{ month: string; totalIncome: number; totalExpenses: number; netBalance: number }> }) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
        No trend data yet.
      </div>
    )
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Bar dataKey="totalIncome" fill="#f97316" radius={[8, 8, 0, 0]} />
          <Bar dataKey="totalExpenses" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
