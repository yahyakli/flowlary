"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtSchema, DebtSchema } from "@/lib/validations/debt.schema";
import { useDebtStore } from "@/store/useDebtStore";
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
  Plus,
  CreditCard,
  Sparkles,
  X,
} from "lucide-react";
import { IDebt } from "@/lib/db/types";

interface DebtDialogProps {
  debt?: IDebt;
  trigger?: React.ReactNode;
}

export function AddDebtDialog({ debt, trigger }: DebtDialogProps) {
  const [open, setOpen] = useState(false);
  const addDebt = useDebtStore((state) => state.addDebt);
  const updateDebt = useDebtStore((state) => state.updateDebt);
  const isLoading = useDebtStore((state) => state.isLoading);

  const isEditing = !!debt;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DebtSchema>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      title: debt?.title || "",
      totalAmount: debt?.totalAmount || 0,
      remainingAmount: debt?.remainingAmount || 0,
      monthlyPayment: debt?.monthlyPayment || 0,
      interestRate: debt?.interestRate || 0,
      dueDay: debt?.dueDay || undefined,
      lender: debt?.lender || "",
    },
  });

  // Reset form when dialog opens
  useMemo(() => {
    if (open) {
      reset({
        title: debt?.title || "",
        totalAmount: debt?.totalAmount || 0,
        remainingAmount: debt?.remainingAmount || 0,
        monthlyPayment: debt?.monthlyPayment || 0,
        interestRate: debt?.interestRate || 0,
        dueDay: debt?.dueDay || undefined,
        lender: debt?.lender || "",
      });
    }
  }, [open, debt, reset]);

  const onSubmit = async (data: DebtSchema) => {
    try {
      if (isEditing && debt?._id) {
        await updateDebt(debt._id.toString(), data);
      } else {
        await addDebt(data);
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
          <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-105 hover:bg-rose-400 hover:shadow-rose-400/30 active:scale-95">
            <Plus className="size-4" />
            Add Debt
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

        {/* Header */}
        <div className="relative h-16 w-full bg-gradient-to-r from-rose-600 to-orange-600 px-6 flex items-center">
          <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/10 blur-xl" />
          <Sparkles className="size-5 text-white/40" />
        </div>

        {/* Title Area */}
        <div className="relative -mt-6 px-6">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-slate-900">
            <CreditCard className="size-6 text-rose-600 dark:text-rose-400" />
          </div>
          <DialogHeader className="mt-2">
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {isEditing ? "Edit Debt" : "Add New Debt"}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          <form id="debt-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="debt-title" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Debt Title
                </Label>
                <Input
                  id="debt-title"
                  placeholder="e.g., Car Loan, Student Loan..."
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                  {...register("title")}
                />
                {errors.title && <p className="text-[10px] font-bold text-rose-500">{errors.title.message}</p>}
              </div>

              {/* Lender */}
              <div className="space-y-1.5">
                <Label htmlFor="debt-lender" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Lender / Creditor
                </Label>
                <Input
                  id="debt-lender"
                  placeholder="e.g., Bank, Family, Credit Card..."
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                  {...register("lender")}
                />
                {errors.lender && <p className="text-[10px] font-bold text-rose-500">{errors.lender.message}</p>}
              </div>

              {/* Total & Remaining */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-totalAmount" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total Amount (MAD)
                  </Label>
                  <Input
                    id="debt-totalAmount"
                    type="number"
                    step="0.01"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                    {...register("totalAmount", { valueAsNumber: true })}
                  />
                  {errors.totalAmount && <p className="text-[10px] font-bold text-rose-500">{errors.totalAmount.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-remainingAmount" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Remaining (MAD)
                  </Label>
                  <Input
                    id="debt-remainingAmount"
                    type="number"
                    step="0.01"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                    {...register("remainingAmount", { valueAsNumber: true })}
                  />
                  {errors.remainingAmount && <p className="text-[10px] font-bold text-rose-500">{errors.remainingAmount.message}</p>}
                </div>
              </div>

              {/* Monthly Payment & Interest */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-monthlyPayment" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Monthly Payment (MAD)
                  </Label>
                  <Input
                    id="debt-monthlyPayment"
                    type="number"
                    step="0.01"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                    {...register("monthlyPayment", { valueAsNumber: true })}
                  />
                  {errors.monthlyPayment && <p className="text-[10px] font-bold text-rose-500">{errors.monthlyPayment.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-interestRate" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Interest Rate (%)
                  </Label>
                  <Input
                    id="debt-interestRate"
                    type="number"
                    step="0.01"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                    {...register("interestRate", { valueAsNumber: true })}
                  />
                  {errors.interestRate && <p className="text-[10px] font-bold text-rose-500">{errors.interestRate.message}</p>}
                </div>
              </div>

              {/* Due Day */}
              <div className="space-y-1.5">
                <Label htmlFor="debt-dueDay" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Due Day of Month (Optional)
                </Label>
                <Input
                  id="debt-dueDay"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="e.g., 15"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold dark:border-slate-800 dark:bg-slate-900 text-sm"
                  {...register("dueDay", { valueAsNumber: true, setValueAs: (v) => v === "" || isNaN(v) ? undefined : Number(v) })}
                />
                {errors.dueDay && <p className="text-[10px] font-bold text-rose-500">{errors.dueDay.message}</p>}
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-2">
          <Button
            form="debt-form"
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-rose-600 text-sm font-black text-white shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-700 hover:shadow-rose-600/30 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Debt" : "Add Debt")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
