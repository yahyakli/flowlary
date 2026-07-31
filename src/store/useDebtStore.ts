import { create } from 'zustand';
import { IDebt } from '@/lib/db/types';
import { DebtSchema } from '@/lib/validations/debt.schema';
import { toast } from 'sonner';

function getDebtId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) {
    const id = (value as { _id: unknown })._id;
    if (typeof id === 'string') return id;
    if (id && typeof id.toString === 'function') return id.toString();
  }
  return '';
}

function unwrapDebtResponse(payload: unknown): IDebt | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const debt = record.debt ?? record;
  if (debt && typeof debt === 'object' && '_id' in debt) return debt as IDebt;
  return null;
}

interface DebtState {
  debts: IDebt[];
  isLoading: boolean;
  error: string | null;
  fetchDebts: () => Promise<void>;
  addDebt: (debt: DebtSchema) => Promise<void>;
  updateDebt: (id: string, debt: Partial<DebtSchema>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  safeDebts: IDebt[];
}

export const useDebtStore = create<DebtState>((set, get) => ({
  debts: [],
  safeDebts: [],
  isLoading: true,
  error: null,

  fetchDebts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/debts');
      if (!response.ok) throw new Error('Failed to fetch debts');

      const data = await response.json();
      const rawDebts = Array.isArray((data as Record<string, unknown>).debts)
        ? ((data as Record<string, unknown>).debts as IDebt[])
        : Array.isArray(data)
          ? (data as IDebt[])
          : [];
      set({ debts: rawDebts, safeDebts: rawDebts, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
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
        const message = errorData && typeof errorData === 'object' && 'error' in errorData
          ? String((errorData as Record<string, unknown>).error)
          : 'Failed to add debt';
        throw new Error(message);
      }

      const payload = await response.json();
      const newDebt = unwrapDebtResponse(payload);
      if (!newDebt) throw new Error('Invalid response from server');

      set((state) => ({
        debts: [newDebt, ...state.debts],
        safeDebts: [newDebt, ...state.safeDebts],
        isLoading: false,
      }));
      toast.success('Debt added successfully');
      get().fetchDebts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      toast.error(message);
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
        const message = errorData && typeof errorData === 'object' && 'error' in errorData
          ? String((errorData as Record<string, unknown>).error)
          : 'Failed to update debt';
        throw new Error(message);
      }

      const payload = await response.json();
      const updatedDebt = unwrapDebtResponse(payload);
      if (!updatedDebt) throw new Error('Invalid response from server');

      set((state) => ({
        debts: state.debts.map((entry) =>
          getDebtId(entry) === id ? updatedDebt : entry
        ),
        safeDebts: state.safeDebts.map((entry) =>
          getDebtId(entry) === id ? updatedDebt : entry
        ),
        isLoading: false,
      }));
      toast.success('Debt updated successfully');
      get().fetchDebts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  deleteDebt: async (id) => {
    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete debt');

      set((state) => ({
        debts: state.debts.filter((entry) => getDebtId(entry) !== id),
        safeDebts: state.safeDebts.filter((entry) => getDebtId(entry) !== id),
      }));
      toast.success('Debt deleted');
      get().fetchDebts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(message);
    }
  },
}));
