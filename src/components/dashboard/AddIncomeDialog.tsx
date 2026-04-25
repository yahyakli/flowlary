"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema, IncomeSchema } from "@/lib/validations/income.schema";
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
import { Coins, Tag, Plus, Sparkles, TrendingUp, ArrowUp } from "lucide-react";
import { toast } from "sonner";

export function AddIncomeDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncomeSchema>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: "Extra",
    },
  });

  const onSubmit = async (data: IncomeSchema) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Income recorded! Your balance has been updated.");
        reset();
        setOpen(false);
      } else {
        toast.error("Failed to record income");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 transition-all hover:border-amber-500/50 hover:bg-amber-50/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-amber-500/30 dark:hover:bg-amber-900/20">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-500/10 dark:text-amber-400">
            <Coins className="size-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Earnings</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">Add Money</p>
          </div>
          <Plus className="ml-auto size-4 text-slate-300 transition-transform group-hover:rotate-90 group-hover:text-amber-500" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] overflow-hidden rounded-[2.5rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-950">
        <div className="relative h-24 w-full bg-gradient-to-r from-amber-500 to-orange-500 p-8">
          <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/20 blur-xl" />
          <TrendingUp className="absolute right-8 top-8 size-8 text-white/30" />
        </div>
        
        <div className="relative -mt-10 px-8">
          <div className="inline-flex size-16 items-center justify-center rounded-[1.5rem] bg-white shadow-xl dark:bg-slate-900">
            <Sparkles className="size-8 text-amber-500" />
          </div>
          <DialogHeader className="mt-4">
            <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Extra Earnings
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Record freelance work, gifts, or other one-off income.
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Tag className="size-3.5" /> Income Source
              </Label>
              <Input
                id="title"
                placeholder="e.g., Freelance Project, Gift"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 transition-all focus:border-amber-500 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-amber-400"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-[10px] font-bold text-rose-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Coins className="size-3.5" /> Amount (MAD)
              </Label>
              <div className="relative group">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 text-lg font-black transition-all focus:border-amber-500 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-amber-400"
                  {...register("amount", { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-[10px] font-bold text-rose-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-slate-950 text-base font-black text-white shadow-xl transition-all hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-slate-400 border-t-white" />
                  Recording...
                </div>
              ) : (
                "Boost Balance"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
