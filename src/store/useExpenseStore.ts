import { create } from 'zustand';
import { IExpense } from '@/lib/db/types';
import { ExpenseSchema } from '@/lib/validations/expense.schema';
import { toast } from 'sonner';

interface ExpenseState {
  expenses: IExpense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: (month?: number, year?: number) => Promise<void>;
  addExpense: (expense: ExpenseSchema) => Promise<void>;
  updateExpense: (id: string, expense: Partial<ExpenseSchema>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: true,
  error: null,

  fetchExpenses: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (month) queryParams.append('month', month.toString());
      if (year) queryParams.append('year', year.toString());

      const response = await fetch(`/api/expenses?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      
      const data = await response.json();
      // Handle both old array format and new object format with pagination
      const expenses = Array.isArray(data) ? data : data.expenses;
      set({ expenses: expenses || [], isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load expenses';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  addExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add expense');
      }

      const newExpense = await response.json();
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        isLoading: false,
      }));
      toast.success('Expense added successfully');
      get().fetchExpenses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add expense';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  updateExpense: async (id, expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update expense');
      }

      const updatedExpense = await response.json();
      set((state) => ({
        expenses: state.expenses.map((e) => 
          e._id.toString() === id ? updatedExpense : e
        ),
        isLoading: false,
      }));
      toast.success('Expense updated successfully');
      get().fetchExpenses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update expense';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  deleteExpense: async (id) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete expense');

      set((state) => ({
        expenses: state.expenses.filter((e) => e._id.toString() !== id),
      }));
      toast.success('Expense deleted');
      get().fetchExpenses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete expense';
      toast.error(message);
    }
  },
}));
