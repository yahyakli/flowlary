"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salarySchema, SalarySchema } from "@/lib/validations/salary.schema";
import { useSalaryStore } from "@/store/useSalaryStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Landmark, Calendar, Coins, Info, Sparkles, ArrowRight } from "lucide-react";

export function SetSalaryDialog() {
  const [open, setOpen] = useState(false);
  const { salary, payDay, initialBalance, isLoading, updateSalary, fetchSalary } = useSalaryStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SalarySchema>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      amount: salary,
      payDay: payDay,
      initialBalance: initialBalance,
      frequency: "monthly",
    },
  });

  const watchedPayDay = watch("payDay");

  useEffect(() => {
    if (open) {
      fetchSalary();
    }
  }, [open, fetchSalary]);

  useEffect(() => {
    reset({
      amount: salary,
      payDay: payDay,
      initialBalance: initialBalance,
      frequency: "monthly",
    });
  }, [salary, payDay, initialBalance, reset]);

  const onSubmit = async (data: SalarySchema) => {
    await updateSalary(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 transition-all hover:border-blue-500/50 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500/30 dark:hover:bg-blue-900/20">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400">
            <Landmark className="size-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Finances</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">Setup Base</p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] overflow-hidden rounded-[2.5rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-950">
        <div className="relative h-24 w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
          <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute left-1/4 top-1/2 size-16 rounded-full bg-indigo-400/20 blur-xl" />
          <Sparkles className="absolute right-8 top-8 size-8 text-white/20" />
        </div>
        
        <div className="relative -mt-10 px-8">
          <div className="inline-flex size-16 items-center justify-center rounded-[1.5rem] bg-white shadow-xl dark:bg-slate-900">
            <Landmark className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogHeader className="mt-4">
            <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Financial Foundation
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure your primary income and balance settings.
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
          <div className="space-y-5">
            {/* Monthly Salary */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Wallet className="size-3.5" /> Monthly Net Salary (MAD)
              </Label>
              <div className="relative group">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 text-lg font-black transition-all focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-blue-400"
                  {...register("amount", { valueAsNumber: true })}
                />
                <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 group-focus-within:text-blue-500">
                  MAD
                </div>
              </div>
              {errors.amount && (
                <p className="text-[10px] font-bold text-rose-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Current Balance */}
              <div className="space-y-2">
                <Label htmlFor="initialBalance" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Coins className="size-3.5" /> Start Balance
                </Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900"
                  {...register("initialBalance", { valueAsNumber: true })}
                />
              </div>

              {/* Pay Day */}
              <div className="space-y-2">
                <Label htmlFor="payDay" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Calendar className="size-3.5" /> Pay Day (1-31)
                </Label>
                <Input
                  id="payDay"
                  type="number"
                  min="1"
                  max="31"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900"
                  {...register("payDay", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Pay Day Explanation Box */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
              <div className="flex gap-3">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300">About Typical Pay Day</p>
                  <p className="text-[11px] leading-relaxed text-blue-800/70 dark:text-blue-400/70">
                    Your financial cycle starts on the {watchedPayDay || payDay}th. 
                    Expenses before this date belong to the previous cycle. This helps Flowlary calculate exactly how long your current money needs to last.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-blue-600 text-base font-black text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Securely Save Details
                  <ArrowRight className="size-4" />
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

