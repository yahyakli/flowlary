"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, GoalSchema } from "@/lib/validations/goal.schema";
import { useGoalStore } from "@/store/useGoalStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Plus, 
  Coins, 
  Sparkles, 
  ArrowRight, 
  X,
  Plane,
  Home,
  Car,
  Laptop,
  Heart,
  Briefcase,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths } from "date-fns";
import { IGoal } from "@/lib/db/types";

const ICONS = [
  { name: 'target', icon: Target },
  { name: 'plane', icon: Plane },
  { name: 'home', icon: Home },
  { name: 'car', icon: Car },
  { name: 'laptop', icon: Laptop },
  { name: 'heart', icon: Heart },
  { name: 'briefcase', icon: Briefcase },
];

const COLORS = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
];

interface GoalDialogProps {
  goal?: IGoal;
  trigger?: React.ReactNode;
}

export function AddGoalDialog({ goal, trigger }: GoalDialogProps) {
  const [open, setOpen] = useState(false);
  const addGoal = useGoalStore((state) => state.addGoal);
  const updateGoal = useGoalStore((state) => state.updateGoal);
  const isLoading = useGoalStore((state) => state.isLoading);

  const isEditing = !!goal;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof goalSchema>, any, GoalSchema>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || "",
      targetAmount: goal?.targetAmount || 0,
      savedAmount: goal?.savedAmount || 0,
      monthlyContribution: goal?.monthlyContribution || 0,
      icon: goal?.icon || "target",
      color: goal?.color || "#4f46e5",
    },
  });

  // Reset form when goal changes or dialog opens
  useMemo(() => {
    if (open) {
      reset({
        title: goal?.title || "",
        targetAmount: goal?.targetAmount || 0,
        savedAmount: goal?.savedAmount || 0,
        monthlyContribution: goal?.monthlyContribution || 0,
        icon: goal?.icon || "target",
        color: goal?.color || "#4f46e5",
      });
    }
  }, [open, goal, reset]);

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const targetAmount = watch("targetAmount");
  const savedAmount = watch("savedAmount");
  const monthlyContribution = watch("monthlyContribution");

  // Calculate estimated deadline with safety checks
  const estimatedDeadline = useMemo(() => {
    const target = Number(targetAmount);
    const saved = Number(savedAmount);
    const monthly = Number(monthlyContribution);

    if (isNaN(target) || isNaN(saved) || isNaN(monthly)) return null;
    
    const remaining = target - saved;
    if (remaining <= 0) return new Date(); // Already reached
    if (monthly <= 0) return null;
    
    const monthsNeeded = Math.ceil(remaining / monthly);
    if (monthsNeeded > 1200 || !isFinite(monthsNeeded)) return null;
    
    try {
      return addMonths(new Date(), monthsNeeded);
    } catch (e) {
      return null;
    }
  }, [targetAmount, savedAmount, monthlyContribution]);

  const onSubmit = async (data: GoalSchema) => {
    if (!estimatedDeadline && data.targetAmount > data.savedAmount) {
      toast.error("Please set a monthly contribution to estimate your goal date.");
      return;
    }

    try {
      const finalData = {
        ...data,
        deadline: estimatedDeadline || new Date(),
      };
      
      if (isEditing && goal?._id) {
        await updateGoal(goal._id.toString(), finalData);
      } else {
        await addGoal(finalData as any);
      }
      
      setOpen(false);
      if (!isEditing) reset();
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const onError = (errors: any) => {
    console.error("Form errors:", errors);
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-105 hover:bg-violet-400 hover:shadow-violet-400/30 active:scale-95">
            <Plus className="size-4" />
            New Goal
          </button>
        )}
      </DialogTrigger>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[500px] max-h-[90vh] overflow-hidden rounded-[2rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-950 flex flex-col"
      >
        <DialogClose asChild>
          <button 
            type="button"
            className="absolute right-4 top-4 z-50 flex size-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </DialogClose>

        {/* Shorter Header */}
        <div className="relative h-16 w-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 flex items-center">
          <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/10 blur-xl" />
          <Sparkles className="size-5 text-white/40" />
        </div>
        
        {/* Compact Title Area */}
        <div className="relative -mt-6 px-6">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-slate-900">
            <Target className="size-6 text-violet-600 dark:text-violet-400" />
          </div>
          <DialogHeader className="mt-2">
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Create New Goal
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          <form id="goal-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Goal Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., New Laptop, Vacation..."
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                  {...register("title")}
                />
                {errors.title && <p className="text-[10px] font-bold text-rose-500">{errors.title.message}</p>}
              </div>

              {/* Amounts Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="targetAmount" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Target (MAD)
                  </Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                    {...register("targetAmount", { valueAsNumber: true })}
                  />
                  {errors.targetAmount && <p className="text-[10px] font-bold text-rose-500">{errors.targetAmount.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="savedAmount" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Initial (MAD)
                  </Label>
                  <Input
                    id="savedAmount"
                    type="number"
                    step="0.01"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                    {...register("savedAmount", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Contribution & Auto-Calculation */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyContribution" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Monthly Plan
                  </Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    step="0.01"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                    {...register("monthlyContribution", { valueAsNumber: true })}
                  />
                  {errors.monthlyContribution && <p className="text-[10px] font-bold text-rose-500">{errors.monthlyContribution.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Estimated Finish
                  </Label>
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100">
                    <CalendarDays className="size-4 text-violet-500" />
                    {estimatedDeadline ? format(estimatedDeadline, 'MMM yyyy') : 'Set contribution'}
                  </div>
                </div>
              </div>

              {/* Customization */}
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Icon & Color</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ICONS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setValue("icon", item.name)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-xl border-2 transition-all",
                        selectedIcon === item.name 
                          ? "border-violet-500 bg-violet-50 text-violet-600 dark:bg-violet-900/20" 
                          : "border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900"
                      )}
                    >
                      <item.icon className="size-4" />
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue("color", color)}
                      className={cn(
                        "size-7 rounded-full border-2 transition-all",
                        selectedColor === color ? "border-slate-900 scale-110 dark:border-white" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-2">
          <Button
            form="goal-form"
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-violet-600 text-sm font-black text-white shadow-xl shadow-violet-500/20 transition-all hover:bg-violet-700 hover:shadow-violet-600/30 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Goal" : "Set My Goal")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
