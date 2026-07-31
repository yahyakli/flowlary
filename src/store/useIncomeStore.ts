import { create } from "zustand";

interface Income {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface IncomeState {
  incomes: Income[];
  isLoading: boolean;
  error: string | null;
  fetchIncomes: () => Promise<void>;
  addIncome: (income: Omit<Income, "_id">) => Promise<void>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
}

export const useIncomeStore = create<IncomeState>((set, get) => ({
  incomes: [],
  isLoading: true,
  error: null,

  fetchIncomes: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/income");
      const data = await res.json();
      if (res.ok) {
        set({ incomes: data.incomes || [], error: null });
      }
    } catch (err) {
      set({ error: "Failed to fetch income" });
    } finally {
      set({ isLoading: false });
    }
  },

  addIncome: async (incomeData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incomeData),
      });
      if (!res.ok) throw new Error("Failed to add income");
      const data = await res.json();
      set((state) => ({
        incomes: [data.income, ...state.incomes],
        isLoading: false,
      }));
      get().fetchIncomes();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to add income", isLoading: false });
    }
  },

  updateIncome: async (id, incomeData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/income/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incomeData),
      });
      if (!res.ok) throw new Error("Failed to update income");
      const data = await res.json();
      set((state) => ({
        incomes: state.incomes.map((i) => (i._id === id ? data.income : i)),
        isLoading: false,
      }));
      get().fetchIncomes();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update income", isLoading: false });
    }
  },

  deleteIncome: async (id) => {
    try {
      const res = await fetch(`/api/income/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete income");
      set((state) => ({
        incomes: state.incomes.filter((i) => i._id !== id),
      }));
      get().fetchIncomes();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete income" });
    }
  },
}));
