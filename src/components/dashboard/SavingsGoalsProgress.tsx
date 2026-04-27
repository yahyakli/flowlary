"use client";

import { formatCurrency } from "@/lib/mock-data";
import { IGoal } from "@/lib/db/types";
import {
  Shield,
  Plane,
  Laptop,
  Car,
  Home,
  Target,
  Calendar,
  TrendingUp,
  Heart,
  Briefcase,
  Trash2,
  Pencil,
  Plus
} from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AddGoalDialog } from "@/components/goals/AddGoalDialog";

interface SavingsGoalsProgressProps {
  goals: IGoal[];
}

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  plane: Plane,
  laptop: Laptop,
  car: Car,
  home: Home,
  target: Target,
  heart: Heart,
  briefcase: Briefcase,
};

export function SavingsGoalsProgress({ goals }: SavingsGoalsProgressProps) {
  const deleteGoal = useGoalStore((state) => state.deleteGoal);

  const calculateMonthsLeft = (goal: IGoal) => {
    const remaining = goal.targetAmount - goal.savedAmount;
    if (remaining <= 0) return 0;
    if (goal.monthlyContribution <= 0) return Infinity;
    return Math.ceil(remaining / goal.monthlyContribution);
  };

  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Savings Goals</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track your progress towards financial targets
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-950">
              <Target className="size-8" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">No active goals yet. Start dreaming!</p>
          </div>
        )}
        
        {goals.map((goal) => {
          const id = (goal._id as any).toString();
          const Icon = iconMap[goal.icon] || Target;
          const progress = (goal.savedAmount / goal.targetAmount) * 100;
          const months = calculateMonthsLeft(goal);
          const remaining = goal.targetAmount - goal.savedAmount;

          return (
            <div
              key={id}
              className="group relative rounded-2xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-950/50"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex size-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {goal.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-lg font-black" style={{ color: goal.color }}>
                    {progress.toFixed(0)}%
                  </p>
                  
                  {/* Action buttons */}
                  <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <AddGoalDialog 
                      goal={goal} 
                      trigger={
                        <button className="p-1.5 text-slate-400 hover:text-violet-500 transition-colors">
                          <Pencil className="size-3.5" />
                        </button>
                      } 
                    />
                    <button 
                      onClick={() => {
                        toast.warning("Delete this goal?", {
                          description: "This action cannot be undone.",
                          action: {
                            label: "Delete",
                            onClick: () => deleteGoal(id),
                          },
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: goal.color 
                  }}
                />
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  <span>
                    {months === 0 
                      ? "Goal reached!" 
                      : months === Infinity 
                        ? "No timeline" 
                        : `${months} month${months !== 1 ? "s" : ""} left`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" />
                  <span>{formatCurrency(goal.monthlyContribution)}/mo</span>
                </div>
                <div className="ml-auto font-medium">
                  {remaining > 0 ? `${formatCurrency(remaining)} remaining` : "Completed"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
