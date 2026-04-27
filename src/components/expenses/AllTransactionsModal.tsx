"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Loader2, Search } from "lucide-react";
import { IExpense } from "@/lib/db/types";

interface AllTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllTransactionsModal({ isOpen, onClose }: AllTransactionsModalProps) {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const fetchAllExpenses = async (pageNum: number, search: string) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
      });
      if (search) queryParams.append("search", search);
      
      const response = await fetch(`/api/expenses?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      
      const newExpenses = data.expenses || [];
      if (pageNum === 1) {
        setExpenses(newExpenses);
      } else {
        setExpenses(prev => [...prev, ...newExpenses]);
      }
      setHasMore(newExpenses.length === 20);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setPage(1);
      setExpenses([]);
      fetchAllExpenses(1, searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  useEffect(() => {
    if (page > 1) {
      fetchAllExpenses(page, searchTerm);
    }
  }, [page]);

  // Group by date or month? The user said "grouped properly".
  // Let's group by month and year for a nice UI.
  const groupedExpenses: Record<string, IExpense[]> = {};
  expenses.forEach(e => {
    const date = new Date(e.createdAt || "");
    const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!groupedExpenses[monthYear]) {
      groupedExpenses[monthYear] = [];
    }
    groupedExpenses[monthYear].push(e);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300">
        <DialogHeader className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">All Transactions</DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search all transactions..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide bg-white dark:bg-slate-950">
          {Object.keys(groupedExpenses).length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
                <Search className="size-8 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">No results found</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search term.</p>
            </div>
          )}

          {Object.entries(groupedExpenses).map(([monthYear, items]) => (
            <div key={monthYear} className="space-y-4">
              <div className="sticky top-0 z-20 -mx-6 bg-white/80 dark:bg-slate-950/80 px-6 py-2 backdrop-blur-md">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  {monthYear}
                </h4>
              </div>
              <RecentTransactions 
                transactions={items as any} 
                showDelete={true} 
                hideGainIndicators={true}
                noContainer={true}
              />
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="size-6 animate-spin text-emerald-500" />
            </div>
          )}
          
          <div ref={lastElementRef} className="h-4" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
