import { create } from 'zustand';
import { IDebt } from '@/lib/db/types';
import { DebtSchema } from '@/lib/validations/debt.schema';
import { toast } from 'sonner';

interface DebtState {
  debts: IDebt[];
  isLoading: boolean;
  error: string | null;
  fetchDebts: () => Promise<void>;
  addDebt: (debt: DebtSchema) => Promise<void>;
  updateDebt: (id: string, debt: Partial<DebtSchema>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

export const useDebtStore = create<DebtState>((set, get) => ({
  debts: [],
  isLoading: true,
  error: null,

  fetchDebts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/debts');
      if (!response.ok) throw new Error('Failed to fetch debts');

      const data = await response.json();
      set({ debts: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Could not load debts');
    }
  },

  addDebt: async (debtData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debtData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add debt');
      }

      const newDebt = await response.json();
      set((state) => ({
        debts: [newDebt, ...state.debts],
        isLoading: false,
      }));
      toast.success('Debt added successfully');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
    }
  },

  updateDebt: async (id, debtData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debtData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update debt');
      }

      const updatedDebt = await response.json();
      set((state) => ({
        debts: state.debts.map((d) =>
          (d._id as any).toString() === id ? updatedDebt : d
        ),
        isLoading: false,
      }));
      toast.success('Debt updated successfully');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
    }
  },

  deleteDebt: async (id) => {
    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete debt');

      set((state) => ({
        debts: state.debts.filter((d) => (d._id as any).toString() !== id),
      }));
      toast.success('Debt deleted');
    } catch (error: any) {
      toast.error('Could not delete debt');
    }
  },
}));
