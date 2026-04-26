"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  AlignLeft,
  CircleDollarSign,
  LayoutGrid,
  Calendar,
  FileText,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IExpense } from "@/lib/db/types";

/* ─── Category config ─────────────────────────────────────────── */
const categoryConfig: Record<ExpenseCategory, { icon: string; label: string }> = {
  [ExpenseCategory.Housing]:       { icon: "🏠", label: "Housing" },
  [ExpenseCategory.Utilities]:     { icon: "⚡", label: "Utilities" },
  [ExpenseCategory.Transportation]:{ icon: "🚗", label: "Transportation" },
  [ExpenseCategory.Food]:          { icon: "🍽", label: "Food" },
  [ExpenseCategory.Healthcare]:    { icon: "💊", label: "Healthcare" },
  [ExpenseCategory.Insurance]:     { icon: "🛡", label: "Insurance" },
  [ExpenseCategory.Entertainment]: { icon: "🎬", label: "Entertainment" },
  [ExpenseCategory.Education]:     { icon: "📚", label: "Education" },
  [ExpenseCategory.Savings]:       { icon: "🐷", label: "Savings" },
  [ExpenseCategory.Debt]:          { icon: "💳", label: "Debt" },
  [ExpenseCategory.Subscriptions]: { icon: "📡", label: "Subscriptions" },
  [ExpenseCategory.Personal]:      { icon: "👤", label: "Personal" },
  [ExpenseCategory.Miscellaneous]: { icon: "⋯",  label: "Other" },
};

/* ─── Field label ─────────────────────────────────────────────── */
function FieldLabel({
  icon,
  children,
  optional,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground/70">{icon}</span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </span>
      {optional && (
        <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground/50">
          optional
        </span>
      )}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
interface AddExpenseDialogProps {
  expense?: IExpense;
  trigger?: React.ReactNode;
}

export function AddExpenseDialog({ expense, trigger }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const isLoading = useExpenseStore((state) => state.isLoading);

  const isEditMode = !!expense;

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

  // Reset form when expense prop changes OR when modal opens
  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          title: expense.title,
          amount: expense.amount,
          category: expense.category as ExpenseCategory,
          type: expense.type,
          isRecurring: expense.isRecurring,
          month: expense.month,
          year: expense.year,
          tags: expense.tags,
          note: expense.note || "",
          dueDay: expense.dueDay,
        });
      } else {
        reset({
          title: "",
          amount: 0,
          category: ExpenseCategory.Food,
          type: "variable",
          isRecurring: false,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          tags: [],
          note: "",
        });
      }
    }
  }, [expense, open, reset]);

  const type = watch("type");
  const dueDay = watch("dueDay");
  const selectedCategory = watch("category");
  const categoryInfo = categoryConfig[selectedCategory as ExpenseCategory] || categoryConfig[ExpenseCategory.Miscellaneous];

  const onSubmit = async (data: ExpenseSchema) => {
    if (isEditMode && expense?._id) {
      await updateExpense(expense._id.toString(), data);
    } else {
      await addExpense(data);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-xl shadow-slate-950/10 transition-all hover:-translate-y-0.5 hover:bg-slate-900 active:translate-y-0 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">
            <Plus className="size-4 transition-transform group-hover:rotate-90" />
            Add Expense
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="gap-0 overflow-hidden rounded-[1.5rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-950 sm:max-w-[420px]">
        {/* Animated accent strip */}
        <div className="relative h-1 w-full bg-slate-100 dark:bg-slate-900">
          <div 
            className={cn(
              "absolute inset-y-0 left-0 transition-all duration-500",
              type === "variable" ? "w-1/2 bg-emerald-500" : "left-1/2 w-1/2 bg-cyan-500"
            )} 
          />
        </div>

        <div className="px-6 pb-6 pt-6">
          <DialogHeader className="mb-6 flex-row items-center justify-between space-y-0 pr-8">
            <div className="space-y-0.5">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                {isEditMode ? "Modify Entry" : "Transaction Entry"}
              </p>
              <DialogTitle className="text-xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                {isEditMode ? "Update Expense" : "Record Expense"}
              </DialogTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
              {isEditMode ? <Pencil className="size-5" /> : <Plus className="size-5" />}
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* ── Type Selector (Premium Toggle Style) ── */}
            <div className="relative grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
              {(["variable", "fixed"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setValue("type", t, { shouldValidate: true, shouldDirty: true });
                  }}
                  className={cn(
                    "relative flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all duration-300",
                    type === t
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "size-1.5 rounded-full transition-all duration-500",
                      type === t ? "scale-100 opacity-100" : "scale-0 opacity-0",
                      t === "variable" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    )}
                  />
                  <span className="capitalize">{t} Spending</span>
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {/* ── Title Input ── */}
              <div className="space-y-2">
                <Label>
                  <FieldLabel icon={<AlignLeft className="size-3" />}>Title</FieldLabel>
                </Label>
                <div className="group relative">
                  <Input
                    placeholder="What did you spend on?"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-sm font-medium transition-all focus:border-slate-900/20 focus:bg-white focus:ring-4 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-emerald-500/30 dark:focus:bg-slate-900 dark:focus:ring-emerald-500/5"
                    {...register("title")}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
                {errors.title && (
                  <p className="px-1 text-[10px] font-bold text-rose-500">{errors.title.message}</p>
                )}
              </div>

              {/* ── Amount + Category Row ── */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    <FieldLabel icon={<CircleDollarSign className="size-3" />}>Amount</FieldLabel>
                  </Label>
                  <div className="group relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">
                      MAD
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-black transition-all focus:border-slate-900/20 focus:bg-white focus:ring-4 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-emerald-500/30 dark:focus:bg-slate-900 dark:focus:ring-emerald-500/5"
                      {...register("amount", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.amount && (
                    <p className="px-1 text-[10px] font-bold text-rose-500">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <FieldLabel icon={<LayoutGrid className="size-3" />}>Category</FieldLabel>
                  </Label>
                  <Select
                    onValueChange={(val) => setValue("category", val as ExpenseCategory, { shouldValidate: true })}
                    value={selectedCategory}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold transition-all hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-emerald-500/30 dark:focus:bg-slate-900 dark:focus:ring-emerald-500/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 rounded-[1rem] border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
                      {Object.entries(categoryConfig).map(([value, { icon, label }]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="group rounded-lg py-2 focus:bg-slate-50 dark:focus:bg-slate-900"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-xs transition-colors group-focus:bg-white dark:bg-slate-800 dark:group-focus:bg-slate-700">
                              {icon}
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ── Billing Day (Fixed Only) ── */}
              {type === "fixed" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-400">
                  <Label>
                    <FieldLabel icon={<Calendar className="size-3" />}>Billing Day</FieldLabel>
                  </Label>
                  <div className="group relative">
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="15"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 pr-24 text-sm font-bold transition-all focus:border-cyan-500/30 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-cyan-500/30 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/5"
                      {...register("dueDay", { valueAsNumber: true })}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-200/50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {dueDay && dueDay >= 1 && dueDay <= 31
                        ? `Day ${dueDay}`
                        : "Monthly"}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Notes ── */}
              <div className="space-y-2">
                <Label>
                  <FieldLabel icon={<FileText className="size-3" />} optional>
                    Notes
                  </FieldLabel>
                </Label>
                <Textarea
                  placeholder="Anything else?"
                  rows={2}
                  className="min-h-[80px] resize-none rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all focus:border-slate-900/20 focus:bg-white focus:ring-4 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-emerald-500/30 dark:focus:bg-slate-900 dark:focus:ring-emerald-500/5"
                  {...register("note")}
                />
              </div>
            </div>

            {/* ── Submit Button ── */}
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative h-13 w-full overflow-hidden rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-2xl transition-all hover:scale-[1.01] hover:bg-slate-900 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex w-full items-center justify-between">
                  <span>{isEditMode ? "Save Changes" : "Record Transaction"}</span>
                  <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 transition-transform group-hover:translate-x-1 dark:bg-slate-950/5">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
