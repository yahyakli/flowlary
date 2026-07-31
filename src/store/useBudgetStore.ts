import { create } from 'zustand';
import { IBudget } from '@/lib/db/types';
import { BudgetSchema } from '@/lib/validations/budget.schema';
import { toast } from 'sonner';

export interface BudgetStatus {
  _id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'ok' | 'warning' | 'over';
}

interface BudgetState {
  budgets: IBudget[];
  budgetStatuses: BudgetStatus[];
  isLoading: boolean;
  error: string | null;
  fetchBudgets: () => Promise<void>;
  fetchBudgetStatus: (month?: string) => Promise<void>;
  addBudget: (budget: BudgetSchema) => Promise<void>;
  updateBudget: (id: string, budget: Partial<BudgetSchema>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  budgetStatuses: [],
  isLoading: false,
  error: null,

  fetchBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/budgets');
      if (!response.ok) throw new Error('Failed to fetch budgets');

      const data = await response.json();
      set({ budgets: data.budgets || [], isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load budgets';
      set({ error: message, isLoading: false });
      toast.error('Could not load budgets');
    }
  },

  fetchBudgetStatus: async (month) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (month) queryParams.append('month', month);

      const response = await fetch(`/api/budgets/status?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch budget status');

      const data = await response.json();
      set({ budgetStatuses: data.budgets || [], isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load budget status';
      set({ error: message, isLoading: false });
      toast.error('Could not load budget status');
    }
  },

  addBudget: async (budgetData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add budget');
      }

      const { budget: newBudget } = await response.json();
      set((state) => ({
        budgets: [...state.budgets, newBudget],
        isLoading: false,
      }));
      toast.success('Budget created successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add budget';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  updateBudget: async (id, budgetData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update budget');
      }

      const { budget: updatedBudget } = await response.json();
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b._id.toString() === id ? updatedBudget : b
        ),
        isLoading: false,
      }));
      toast.success('Budget updated successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update budget';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  deleteBudget: async (id) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete budget');

      set((state) => ({
        budgets: state.budgets.filter((b) => b._id.toString() !== id),
        budgetStatuses: state.budgetStatuses.filter((b) => b._id.toString() !== id),
      }));
      toast.success('Budget deleted');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not delete budget';
      toast.error(message);
    }
  },
}));