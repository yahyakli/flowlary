"use client";

import {
  mockDebts,
  formatCurrency,
} from "@/lib/mock-data";
import { Plus, CreditCard, AlertCircle, TrendingDown, Calendar, ArrowRight } from "lucide-react";

export default function DebtsPage() {
  const totalDebt = mockDebts.reduce((acc, d) => acc + d.remainingAmount, 0);
  const totalMonthly = mockDebts.reduce((acc, d) => acc + d.monthlyPayment, 0);

  return (
    <section className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-orange-600/20 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-rose-400 ring-1 ring-rose-400/20">
              <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
              Debt Clearance
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Manage Debts
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Strategize your repayments and reduce interest costs with AI-driven plans.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-105 hover:bg-rose-400 hover:shadow-rose-400/30 active:scale-95">
              <Plus className="size-4" />
              Add Debt
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <CreditCard className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Outstanding</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrency(totalDebt)}
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            <TrendingDown className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Commitment</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            {formatCurrency(totalMonthly)}
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Interest Rate</p>
          <h3 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-50">
            3.85%
          </h3>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Active Debts</h3>
          
          <div className="space-y-4">
            {mockDebts.map((debt) => {
              const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;
              
              return (
                <div key={debt.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-50">{debt.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {debt.interestRate}% Interest Rate · Due day: {debt.dueDay}th
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900 dark:text-slate-50">{formatCurrency(debt.remainingAmount)}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">of {formatCurrency(debt.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{progress.toFixed(0)}% Paid Off</span>
                      <span className="text-slate-500">{formatCurrency(debt.totalAmount - debt.remainingAmount)} paid</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div 
                        className="h-full rounded-full bg-rose-500 transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Next payment: {formatCurrency(debt.monthlyPayment)}</span>
                    </div>
                    <button className="text-sm font-bold text-rose-500 hover:text-rose-600">
                      Edit details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-300 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">AI Repayment Plan</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              We recommend the <span className="font-bold text-rose-500">Avalanche Method</span> for your current situation.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                <div className="absolute left-[-4px] top-1.5 size-2 rounded-full bg-rose-500" />
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Step 1</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Pay the minimum on &quot;Car Loan&quot; ({formatCurrency(280)}).
                </p>
              </div>
              <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                <div className="absolute left-[-4px] top-1.5 size-2 rounded-full bg-slate-400" />
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Step 2</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Allocate all extra funds ({formatCurrency(500)}) to &quot;Student Loan&quot; due to higher interest.
                </p>
              </div>
            </div>

            <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              Apply Strategy
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
