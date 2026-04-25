"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseSchema } from "@/lib/validations/expense.schema";
import { useExpenseStore } from "@/store/useExpenseStore";
import { ExpenseCategory } from "@/lib/db/types/Expense";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Tag, Wallet, Calendar, FileText, Layers, Hash } from "lucide-react";

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const isLoading = useExpenseStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: ExpenseCategory.Food,
      type: "variable",
      isRecurring: false,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      tags: [],
      note: "",
    },
  });

  const type = watch("type");

  const onSubmit = async (data: ExpenseSchema) => {
    await addExpense(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-400 hover:shadow-emerald-400/30 active:scale-95">
          <Plus className="size-4 transition-transform group-hover:rotate-90" />
          Add Expense
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] overflow-hidden rounded-[2.5rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-900">
        <div className="relative h-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
        
        <div className="px-8 pt-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Record Expense
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the details of your transaction below.
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 pt-6">
          <div className="space-y-5">
            {/* Type Selector */}
            <div className="flex justify-center">
              <Tabs
                value={type}
                onValueChange={(val) => setValue("type", val as "fixed" | "variable")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                  <TabsTrigger 
                    value="variable" 
                    className="rounded-xl py-2 font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-emerald-400"
                  >
                    Variable
                  </TabsTrigger>
                  <TabsTrigger 
                    value="fixed" 
                    className="rounded-xl py-2 font-bold data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-cyan-400"
                  >
                    Fixed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-5">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Tag className="size-3.5" /> Transaction Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Grocery Shopping"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/50"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-[10px] font-bold text-rose-500">{errors.title.message}</p>
                )}
              </div>

              {/* Amount and Category Row */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Wallet className="size-3.5" /> Amount (MAD)
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 font-bold focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/50"
                      {...register("amount", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-[10px] font-bold text-rose-500">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Layers className="size-3.5" /> Category
                  </Label>
                  <Select
                    onValueChange={(val) => setValue("category", val as ExpenseCategory)}
                    defaultValue={ExpenseCategory.Food}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-950/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-950">
                      {Object.entries(ExpenseCategory).map(([key, value]) => (
                        <SelectItem key={value} value={value} className="rounded-xl">
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fixed-specific fields */}
              {type === "fixed" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="dueDay" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Calendar className="size-3.5" /> Billing Day
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="dueDay"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="e.g. 15"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 dark:border-slate-700 dark:bg-slate-950/50"
                      {...register("dueDay", { valueAsNumber: true })}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Day of the month this expense is due.</p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="note" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <FileText className="size-3.5" /> Notes (Optional)
                </Label>
                <Input
                  id="note"
                  placeholder="What was this for?"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-950/50"
                  {...register("note")}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-slate-950 text-base font-black text-white shadow-xl transition-all hover:bg-slate-800 hover:shadow-emerald-500/10 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-slate-400 border-t-white" />
                  Processing...
                </span>
              ) : (
                "Save Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
