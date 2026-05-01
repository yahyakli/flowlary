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
}

export const useIncomeStore = create<IncomeState>((set) => ({
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
}));
