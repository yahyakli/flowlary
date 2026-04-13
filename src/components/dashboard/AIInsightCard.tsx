"use client";

import { Lightbulb, AlertTriangle, Trophy, Sparkles } from "lucide-react";

interface Insight {
  type: "tip" | "warning" | "achievement";
  message: string;
}

interface AIInsightCardProps {
  insights?: Insight[];
}

const defaultInsights: Insight[] = [
  {
    type: "tip",
    message: "You're spending 12% less on food this month compared to last. Keep it up!",
  },
  {
    type: "warning",
    message: "Your transport costs increased 18% this week. Consider tracking to identify the cause.",
  },
  {
    type: "achievement",
    message: "Emergency fund is 65% complete! At current rate, you'll reach your goal 2 months early.",
  },
];

const iconMap = {
  tip: Lightbulb,
  warning: AlertTriangle,
  achievement: Trophy,
};

const styleMap = {
  tip: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    label: "Smart Tip",
  },
  warning: {
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
    icon: "text-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    label: "Alert",
  },
  achievement: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    icon: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    label: "Achievement",
  },
};

export function AIInsightCard({ insights = defaultInsights }: AIInsightCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="size-5 text-violet-500" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">AI Insights</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Personalized observations based on your spending
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.type];
          const style = styleMap[insight.type];

          return (
            <div
              key={index}
              className={`rounded-2xl border ${style.border} ${style.bg} p-4 transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
                  <Icon className={`size-5 ${style.icon}`} />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
