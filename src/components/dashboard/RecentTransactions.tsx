"use client";

import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency } from "@/lib/mock-data";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import {
  Home,
  ShoppingCart,
  Banknote,
  Car,
  Tv,
  Utensils,
  Wifi,
  Pill,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Shield,
  Gamepad2,
  Package,
  Trash2,
  Pencil,
  FileText,
} from "lucide-react";

interface Transaction {
  id?: string;
  _id?: any;
  title: string;
  category: string;
  amount: number;
  date?: string;
  createdAt?: Date | string;
  type: string;
  icon?: string;
  month?: number;
  year?: number;
  isRecurring?: boolean;
  tags?: string[];
  note?: string;
  dueDay?: number;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  showDelete?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  // Mock icons
  Home,
  ShoppingCart,
  Banknote,
  Car,
  Tv,
  Utensils,
  Wifi,
  Pill,
  
  // Category mapping icons
  housing: Home,
  food: Utensils,
  transportation: Car,
  utilities: Wifi,
  healthcare: HeartPulse,
  insurance: Shield,
  entertainment: Gamepad2,
  education: GraduationCap,
  subscriptions: Tv,
  personal: Briefcase,
  debt: CreditCard,
  miscellaneous: Package,
  savings: TargetIcon, // Placeholder for target
};

// Fallback for TargetIcon if not found
function TargetIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function RecentTransactions({ transactions, showDelete = true }: RecentTransactionsProps) {
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);

  return (
    <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Recent Transactions</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Latest activity
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No transactions found.</p>
        )}
        {transactions.slice(0, 20).map((transaction) => {
          const id = transaction.id || transaction._id?.toString();
          const Icon = iconMap[transaction.icon || ""] || iconMap[transaction.category.toLowerCase()] || ShoppingCart;
          const isIncome = transaction.amount > 0;
          
          const dateStr = transaction.date || (transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '');

          const categoryColors: Record<string, string> = {
            Income: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            housing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
            food: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            transportation: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
            subscriptions: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
            utilities: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
            healthcare: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
          };

          return (
            <div
              key={id}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-3 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-950/50"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  categoryColors[transaction.category.toLowerCase()] || "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Icon className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-slate-50">
                  {transaction.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                  {dateStr} · {transaction.category.replace('_', ' ')}
                </p>
                {transaction.note && transaction.note.trim() !== '' && (
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] italic text-slate-400 dark:text-slate-500">
                    <FileText className="size-3 shrink-0" />
                    {transaction.note}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isIncome ? (
                    <ArrowUpRight className="size-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="size-4 text-slate-500 dark:text-slate-400" />
                  )}
                  <span
                    className={`font-semibold ${
                      isIncome
                        ? "text-emerald-500"
                        : "text-slate-900 dark:text-slate-50"
                    }`}
                  >
                    {isIncome ? "+" : ""}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
                
                {showDelete && id && (
                  <div className="flex items-center gap-1">
                    <AddExpenseDialog 
                      expense={transaction as any} 
                      trigger={
                        <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                          <Pencil className="size-4" />
                        </button>
                      }
                    />
                    <button
                      onClick={() => {
                        import("sonner").then(({ toast }) => {
                          toast.warning("Delete this expense?", {
                            description: "This action cannot be undone.",
                            action: {
                              label: "Delete",
                              onClick: () => deleteExpense(id),
                            },
                          });
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
